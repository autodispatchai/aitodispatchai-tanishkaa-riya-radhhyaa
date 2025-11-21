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
    const priceId = process.env[`PRICE_${plan}_${billing}`];

    if (!priceId) {
      return NextResponse.json({ error: 'Plan not available' }, { status: 400 });
    }

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://www.autodispatchai.com/dashboard',
      cancel_url: 'https://www.autodispatchai.com/choose-plan',
    });

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
