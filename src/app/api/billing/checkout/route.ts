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
    const billing = body.billingCycle || 'monthly';

    // YE PRICE IDs TERE STRIPE DASHBOARD SE LE — MAIN NE REAL EXAMPLES DIYA HAI
    const priceId = 
      plan === 'PRO' 
        ? (billing === 'yearly' ? process.env.STRIPE_PRO_YEARLY || 'price_1QXXXXXX' : process.env.STRIPE_PRO_MONTHLY || 'price_1QXXXXXX')
        : (billing === 'yearly' ? process.env.STRIPE_ESSENTIALS_YEARLY || 'price_1QXXXXXX' : process.env.STRIPE_ESSENTIALS_MONTHLY || 'price_1QXXXXXX');

    if (!priceId || !stripe) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com'}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com'}/choose-plan`,
      metadata: { user_id: session.user.id, plan, billing },
    });

    return NextResponse.json({ url: sessionCheckout.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}