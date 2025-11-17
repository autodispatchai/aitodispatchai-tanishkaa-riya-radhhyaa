// src/app/api/billing/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    // Safely parse body
    const req = await fetch('http://dummy', { method: 'POST' }); // dummy to get body
    const body = await new Response(req.body).json().catch(() => ({}));
    const plan = body.plan || 'ESSENTIALS';
    const billing = body.billingCycle || 'monthly';

    // Hardcode price IDs for testing (baad mein env se le lena)
    const priceId = 
      plan === 'PRO' 
        ? (billing === 'yearly' ? 'price_1QAbcd1234' : 'price_1QAbcd5678')
        : (billing === 'yearly' ? 'price_1QAbcd9012' : 'price_1QAbcd3456');

    if (!priceId || !stripe) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com'}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com'}/choose-plan`,
      metadata: { user_id: session.user.id },
    });

    return NextResponse.json({ url: sessionCheckout.url });

  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}