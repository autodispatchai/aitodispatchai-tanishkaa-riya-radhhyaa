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

    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const plan = (body.plan || 'ESSENTIALS') as 'ESSENTIALS' | 'PRO';
    const billing = (body.billingCycle || 'monthly') as 'monthly' | 'yearly';
    const addOns = (body.addOns || []) as string[];

    const planKey = `PRICE_${plan}_${billing === 'yearly' ? 'YEARLY' : 'MONTHLY'}`;
    const basePriceId = process.env[planKey as keyof typeof process.env];

    if (!basePriceId) return NextResponse.json({ error: 'Plan not found' }, { status: 500 });

    const lineItems = [{ price: basePriceId, quantity: 1 }];

    addOns.forEach(id => {
      const key = `PRICE_ADDON_${id.toUpperCase()}_${billing === 'yearly' ? 'YEARLY' : 'MONTHLY'}`;
      const priceId = process.env[key as keyof typeof process.env];
      if (priceId) lineItems.push({ price: priceId, quantity: 1 });
    });

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email!,
      line_items: lineItems,
      success_url: 'https://www.autodispatchai.com/dashboard?success=true',
      cancel_url: 'https://www.autodispatchai.com/choose-plan',
      metadata: { user_id: session.user.id },
    });

    return NextResponse.json({ url: sessionCheckout.url });

  } catch (error: any) {
    console.error('STRIPE ERROR:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}