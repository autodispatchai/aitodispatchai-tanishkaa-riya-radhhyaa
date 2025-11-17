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

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan || 'ESSENTIALS';
    const billingCycle = body.billingCycle || 'monthly';
    const addOns = body.addOns || [];

    // TERE ENV KE EXACT NAAM — PRICE_… (bilkul same jaise .env.local mein hai)
    const priceMap: Record<string, string> = {
      ESSENTIALS_MONTHLY: process.env.PRICE_ESSENTIALS_MONTHLY!,
      ESSENTIALS_YEARLY: process.env.PRICE_ESSENTIALS_YEARLY!,
      PRO_MONTHLY: process.env.PRICE_PRO_MONTHLY!,
      PRO_YEARLY: process.env.PRICE_PRO_YEARLY!,
    };

    const key = `${plan}_${billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'}`;
    const basePriceId = priceMap[key];

    if (!basePriceId) {
      return NextResponse.json({ error: 'Invalid plan or pricing not configured' }, { status: 400 });
    }

    // Line items banaye — base plan + selected add-ons
    const lineItems = [
      { price: basePriceId, quantity: 1 },
    ];

    // Add-ons (agar select kiye ho)
    addOns.forEach((addonId: string) => {
      const monthlyKey = `PRICE_ADDON_${addonId.toUpperCase()}_MONTHLY`;
      const yearlyKey = `PRICE_ADDON_${addonId.toUpperCase()}_YEARLY`;
      const addonPriceId = billingCycle === 'yearly'
        ? process.env[yearlyKey] || process.env[monthlyKey]
        : process.env[monthlyKey];

      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
      }
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email ?? undefined,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/choose-plan?canceled=true`,
      metadata: {
        user_id: session.user.id,
        plan,
        billing_cycle: billingCycle,
        addons: addOns.join(','),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}