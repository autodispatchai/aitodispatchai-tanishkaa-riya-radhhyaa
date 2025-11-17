// src/app/api/billing/checkout/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated. Please log in again.' },
      { status: 401 }
    );
  }

  // YE SAHI TARIIKA HAI BODY PARSE KARNE KA
  const body = await req.json();
  const plan = body.plan || 'essentials';
  const billing = body.billing || 'monthly';

  // Price ID map (tu apne env mein daal de)
  const priceId = 
    plan === 'pro' 
      ? (billing === 'yearly' ? process.env.STRIPE_PRO_YEARLY : process.env.STRIPE_PRO_MONTHLY)
      : (billing === 'yearly' ? process.env.STRIPE_ESSENTIALS_YEARLY : process.env.STRIPE_ESSENTIALS_MONTHLY);

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/choose-plan`,
    metadata: { 
      user_id: session.user.id,
      plan,
      billing_cycle: billing
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}