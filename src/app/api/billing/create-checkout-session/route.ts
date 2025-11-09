// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// PRICE IDS (MUST BE IN .env!)
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
  email?: string;
};

if (!STRIPE_SECRET_KEY) {
  console.error('[create-checkout-session] STRIPE_SECRET_KEY MISSING!');
}

const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' as any }) 
  : null;

export async function POST(req: Request) {
  try {
    // 1. STRIPE CHECK
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured. Contact admin.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { plan, billing, addOns = [], email } = body as Body;

    // 2. VALIDATE INPUT
    if (!plan || !['ESSENTIALS', 'PRO'].includes(plan)) {
      return NextResponse.json({ ok: false, error: 'Invalid plan selected' }, { status: 400 });
    }

    if (!billing || !['monthly', 'yearly'].includes(billing)) {
      return NextResponse.json({ ok: false, error: 'Invalid billing cycle' }, { status: 400 });
    }

    // 3. CHECK PRICE IDS
    const missing: string[] = [];
    const planPriceId = PRICE[plan][billing];
    if (!planPriceId) missing.push(`PRICE_${plan}_${billing.toUpperCase()}`);

    for (const addOn of addOns) {
      const priceId = ADDON[addOn]?.[billing];
      if (!priceId) missing.push(`PRICE_ADDON_${addOn.toUpperCase()}_${billing.toUpperCase()}`);
    }

    if (missing.length > 0) {
      console.error('[create-checkout-session] Missing Price IDs:', missing.join(', '));
      return NextResponse.json(
        { ok: false, error: `Server config error. Missing: ${missing.join(', ')}` },
        { status: 500 }
      );
    }

    // 4. BUILD LINE ITEMS
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: planPriceId!, quantity: 1 },
    ];

    for (const addOn of addOns) {
      const addonPriceId = ADDON[addOn][billing];
      if (addonPriceId) {
        line_items.push({ price: addonPriceId, quantity: 1 });
      }
    }

    // 5. CREATE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
        trial_period_days: 14,
      },
      payment_intent_data: {
        setup_future_usage: 'off_session', // CARD SAVE + AUTO CHARGE
      },
    });

    if (!session.url) {
      throw new Error('Stripe returned no URL');
    }

    return NextResponse.json({ ok: true, url: session.url });

  } catch (e: any) {
    console.error('[create-checkout-session] FATAL ERROR:', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Checkout failed. Try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: 'create-checkout-session endpoint is LIVE',
    timestamp: new Date().toISOString()
  });
}