import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('[billing/checkout] ❌ STRIPE_SECRET_KEY missing');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' }) : null;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.autodispatchai.com';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const plan = (body.plan as string)?.toUpperCase() || 'ESSENTIALS';
    const billingCycle = (body.billingCycle as string)?.toLowerCase() || 'monthly';
    const addOns = Array.isArray(body.addOns) ? body.addOns : [];

    // Validate plan
    if (!['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Enterprise → Calendly
    if (plan === 'ENTERPRISE') {
      return NextResponse.json({
        url: 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing',
      });
    }

    // Get base price ID
    const billingUpper = billingCycle.toUpperCase();
    const planPriceKey = `PRICE_${plan}_${billingUpper}`;
    const basePriceId = process.env[planPriceKey];

    if (!basePriceId) {
      console.error('[billing/checkout] Missing price ID:', planPriceKey);
      return NextResponse.json({ error: 'Plan not available' }, { status: 400 });
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: basePriceId, quantity: 1 },
    ];

    // Add add-ons
    const addedAddOns: string[] = [];
    const VALID_ADDON_IDS = ['city', 'highway', 'bestfinder', 'safety', 'cb', 'voice', 'agent', 'pay', 'score'];
    
    for (const addOnId of addOns) {
      if (!VALID_ADDON_IDS.includes(addOnId)) continue;
      
      const addOnPriceKey = `PRICE_ADDON_${addOnId.toUpperCase()}_${billingUpper}`;
      const addOnPriceId = process.env[addOnPriceKey];
      
      if (addOnPriceId) {
        lineItems.push({ price: addOnPriceId, quantity: 1 });
        addedAddOns.push(addOnId);
      }
    }

    // Create Stripe checkout session with 14-day trial
    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: lineItems,
      success_url: `${BASE_URL}/dashboard`,
      cancel_url: `${BASE_URL}/choose-plan`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: session.user.id,
          plan,
          billing: billingCycle,
          addOns: addedAddOns.join(','),
        },
      },
      metadata: {
        user_id: session.user.id,
        plan,
        billing: billingCycle,
        addOns: addedAddOns.join(','),
      },
    });

    if (!sessionCheckout.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error: any) {
    console.error('[billing/checkout] Error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
