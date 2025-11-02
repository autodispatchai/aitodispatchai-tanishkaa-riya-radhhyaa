import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/** Keep your flags */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Env */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // sk_test_***
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/** IMPORTANT: don't pin apiVersion to avoid literal type mismatch errors */
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : (null as any);

/** Supported types */
type Billing = 'monthly' | 'yearly';
type Plan = 'ESSENTIALS' | 'PRO' | 'ENTERPRISE';

type Body = {
  plan: Plan;
  billing: Billing;
  addOns?: string[]; // e.g. ['city','highway']
};

/** Required env price IDs (plan) */
const PRICE = {
  ESSENTIALS: {
    monthly: process.env.NEXT_PUBLIC_PRICE_ESSENTIALS_MONTHLY, // price_***
    yearly: process.env.NEXT_PUBLIC_PRICE_ESSENTIALS_YEARLY,   // price_***
  },
  PRO: {
    monthly: process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_PRICE_PRO_YEARLY,
  },
} as const;

/** Optional env price IDs (add-ons). Each must have monthly + yearly. */
const ADDON = {
  city:       { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_CITY_MONTHLY,       yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_CITY_YEARLY },
  highway:    { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_HIGHWAY_MONTHLY,    yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_HIGHWAY_YEARLY },
  bestfinder: { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_BESTFINDER_MONTHLY, yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_BESTFINDER_YEARLY },
  safety:     { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_SAFETY_MONTHLY,     yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_SAFETY_YEARLY },
  cb:         { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_CB_MONTHLY,         yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_CB_YEARLY },
  voice:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_VOICE_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_VOICE_YEARLY },
  agent:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_AGENT_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_AGENT_YEARLY },
  pay:        { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_PAY_MONTHLY,        yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_PAY_YEARLY },
  score:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_SCORE_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_SCORE_YEARLY },
} as const;

/** Health check (optional) */
export async function GET() {
  return NextResponse.json(
    { ok: true, note: 'create-checkout-session endpoint alive' },
    { status: 200 }
  );
}

/** Create Checkout Session */
export async function POST(req: Request) {
  try {
    /** Feature flag: allow disabling billing quickly */
    if (process.env.BILLING_ENABLED === 'false') {
      return NextResponse.json(
        { ok: false, disabled: true, reason: 'billing temporarily disabled' },
        { status: 501 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      );
    }

    /** Parse & validate payload */
    const body = (await req.json()) as Body;
    const plan = body?.plan;
    const billing = body?.billing;
    const addOns = Array.isArray(body?.addOns) ? body.addOns : [];

    if (!plan || !['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ ok: false, error: 'Invalid plan' }, { status: 400 });
    }
    if (!billing || !['monthly', 'yearly'].includes(billing)) {
      return NextResponse.json({ ok: false, error: 'Invalid billing cycle' }, { status: 400 });
    }
    if (plan === 'ENTERPRISE') {
      return NextResponse.json({ ok: false, error: 'Enterprise is sales-assisted. Contact sales.' }, { status: 400 });
    }

    /** Plan price id */
    const planPriceId = PRICE[plan]?.[billing];
    if (!planPriceId) {
      return NextResponse.json(
        { ok: false, error: `Missing Stripe price ID for ${plan} (${billing})` },
        { status: 400 }
      );
    }

    /** Build line items */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: planPriceId, quantity: 1 },
    ];

    for (const id of addOns) {
      const map = (ADDON as any)[id];
      if (!map) continue; // silently ignore unknown ids
      const addonPriceId = map[billing];
      if (addonPriceId) line_items.push({ price: addonPriceId, quantity: 1 });
    }

    /** Create session */
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      success_url: `${BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/billing/choose-plan?canceled=1`,
      // You can store metadata if needed later:
      // metadata: { plan, billing, addOns: addOns.join(',') },
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
