// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BILLING_ENABLED = process.env.BILLING_ENABLED !== 'false';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL ||
  'http://localhost:3000';

if (!STRIPE_SECRET_KEY) {
  console.error('[checkout] Missing STRIPE_SECRET_KEY');
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Plan price IDs (from .env)
const PRICE = {
  ESSENTIALS: {
    monthly: process.env.PRICE_ESSENTIALS_MONTHLY,
    yearly: process.env.PRICE_ESSENTIALS_YEARLY,
  },
  PRO: {
    monthly: process.env.PRICE_PRO_MONTHLY,
    yearly: process.env.PRICE_PRO_YEARLY,
  },
} as const;

// Add-on price IDs (from .env)
const ADDON = {
  city:       { monthly: process.env.PRICE_ADDON_CITY_MONTHLY,       yearly: process.env.PRICE_ADDON_CITY_YEARLY },
  highway:    { monthly: process.env.PRICE_ADDON_HIGHWAY_MONTHLY,    yearly: process.env.PRICE_ADDON_HIGHWAY_YEARLY },
  bestfinder: { monthly: process.env.PRICE_ADDON_BESTFINDER_MONTHLY, yearly: process.env.PRICE_ADDON_BESTFINDER_YEARLY },
  safety:     { monthly: process.env.PRICE_ADDON_SAFETY_MONTHLY,     yearly: process.env.PRICE_ADDON_SAFETY_YEARLY },
  cb:         { monthly: process.env.PRICE_ADDON_CB_MONTHLY,         yearly: process.env.PRICE_ADDON_CB_YEARLY },
  voice:      { monthly: process.env.PRICE_ADDON_VOICE_MONTHLY,      yearly: process.env.PRICE_ADDON_VOICE_YEARLY },
  agent:      { monthly: process.env.PRICE_ADDON_AGENT_MONTHLY,      yearly: process.env.PRICE_ADDON_AGENT_YEARLY },
  pay:        { monthly: process.env.PRICE_ADDON_PAY_MONTHLY,        yearly: process.env.PRICE_ADDON_PAY_YEARLY },
  score:      { monthly: process.env.PRICE_ADDON_SCORE_MONTHLY,      yearly: process.env.PRICE_ADDON_SCORE_YEARLY },
} as const;

type Billing = 'monthly' | 'yearly';
type Plan = 'ESSENTIALS' | 'PRO';
type AddOn = keyof typeof ADDON;

type Body = {
  plan: Plan;
  billing: Billing;
  addOns?: AddOn[];
  email?: string; // optional, from company/user
};

export async function GET() {
  return NextResponse.json({ ok: true, note: 'create-checkout-session alive' });
}

export async function POST(req: Request) {
  try {
    if (!BILLING_ENABLED) {
      return NextResponse.json(
        { ok: false, disabled: true, reason: 'Billing disabled' },
        { status: 501 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const { plan, billing, addOns = [], email } = (await req.json()) as Body;

    if (!plan || !['ESSENTIALS', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing plan' },
        { status: 400 }
      );
    }

    if (!billing || !['monthly', 'yearly'].includes(billing)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing billing' },
        { status: 400 }
      );
    }

    const missing: string[] = [];

    const planPriceId = PRICE[plan][billing];
    if (!planPriceId) {
      missing.push(`PRICE_${plan}_${billing.toUpperCase()}`);
    }

    for (const addOn of addOns) {
      const cfg = ADDON[addOn];
      if (!cfg || !cfg[billing]) {
        missing.push(`PRICE_ADDON_${addOn.toUpperCase()}_${billing.toUpperCase()}`);
      }
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing Stripe price IDs in env: ${missing.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: planPriceId!, quantity: 1 },
    ];

    for (const addOn of addOns) {
      const addonPriceId = ADDON[addOn]?.[billing];
      if (addonPriceId) {
        line_items.push({ price: addonPriceId, quantity: 1 });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items,
      customer_email: email || undefined,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      success_url: `${BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/billing/choose-plan?canceled=1`,
      metadata: {
        plan,
        billing,
        addOns: addOns.join(','),
      },
      subscription_data: {
        // Stripe trial can also be set via dashboard; adjust if needed
        trial_period_days: 14,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: 'Stripe did not return a checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error('[create-checkout-session] Error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
