// src/app/api/billing/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan === 'PRO' ? 'PRO' : 'ESSENTIALS';
    const billing = body.billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const addOns = body.addOns || [];

    const planKey = `PRICE_${plan}_${billing}`;
    const basePriceId = process.env[planKey];

    if (!basePriceId) {
      console.error('MISSING PRICE ID →', planKey);
      return NextResponse.json({ error: 'Plan not available' }, { status: 400 });
    }

    const lineItems = [{ price: basePriceId, quantity: 1 }];

    addOns.forEach((addonId: string) => {
      const addonKey = `PRICE_ADDON_${addonId.toUpperCase()}_${billing}`;
      const addonPriceId = process.env[addonKey];
      if (addonPriceId) lineItems.push({ price: addonPriceId, quantity: 1 });
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: lineItems,
      subscription_data: { trial_period_days: 14 }, // <-- 14 din da trial
      success_url: 'https://www.autodispatchai.com/dashboard?success=true',
      cancel_url: 'https://www.autodispatchai.com/choose-plan?canceled=true',
      metadata: {
        user_id: session.user.id,
        plan,
        billing_cycle: billing,
        addOns: addOns.join(','),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('STRIPE CHECKOUT ERROR:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}