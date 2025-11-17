// src/app/api/billing/checkout/route.ts
// COMPLETE WORKING CHECKOUT API
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('[billing/checkout] ❌ STRIPE_SECRET_KEY missing');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' }) : null;

// Base URL from env or default
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || 'https://www.autodispatchai.com';

// Valid add-on IDs
const VALID_ADDON_IDS = ['city', 'highway', 'bestfinder', 'safety', 'cb', 'voice', 'agent', 'pay', 'score'];

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('[billing/checkout] ========== REQUEST START ==========');
  
  try {
    // 1. Check Stripe
    if (!stripe) {
      console.error('[billing/checkout] ❌ Stripe not initialized');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // 2. Get session
    console.log('[billing/checkout] 🔐 Checking auth...');
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('[billing/checkout] ❌ Auth failed:', sessionError?.message || 'No session');
      return NextResponse.json(
        { error: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('[billing/checkout] ✅ Authenticated:', session.user.email);

    // 3. Parse body
    let body;
    try {
      body = await request.json();
      console.log('[billing/checkout] 📦 Request:', {
        plan: body.plan,
        billingCycle: body.billingCycle,
        addOnsCount: Array.isArray(body.addOns) ? body.addOns.length : 0,
      });
    } catch (e) {
      console.error('[billing/checkout] ❌ Parse error:', e);
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const plan = (body.plan as string)?.toUpperCase() || 'ESSENTIALS';
    const billingCycle = (body.billingCycle as string)?.toLowerCase() || 'monthly';
    const addOns = Array.isArray(body.addOns) ? body.addOns : [];

    // 4. Validate plan
    if (!['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan)) {
      console.error('[billing/checkout] ❌ Invalid plan:', plan);
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 });
    }

    // 5. Enterprise → Calendly
    if (plan === 'ENTERPRISE') {
      console.log('[billing/checkout] ℹ️ Enterprise → Calendly');
      return NextResponse.json({
        url: 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing',
      });
    }

    // 6. Validate billing
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      console.error('[billing/checkout] ❌ Invalid billing:', billingCycle);
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // 7. Get base price ID
    const billingUpper = billingCycle.toUpperCase();
    const planPriceKey = `PRICE_${plan}_${billingUpper}`;
    const basePriceId = process.env[planPriceKey];

    if (!basePriceId) {
      console.error('[billing/checkout] ❌ Missing price ID:', planPriceKey);
      const available = Object.keys(process.env).filter(k => k.startsWith('PRICE_'));
      console.error('[billing/checkout] Available PRICE_ vars:', available);
      return NextResponse.json(
        { error: `Pricing not configured. Missing: ${planPriceKey}` },
        { status: 400 }
      );
    }

    console.log('[billing/checkout] ✅ Base price ID found:', planPriceKey);

    // 8. Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: basePriceId, quantity: 1 },
    ];

    // 9. Add add-ons
    const addedAddOns: string[] = [];
    for (const addOnId of addOns) {
      if (!VALID_ADDON_IDS.includes(addOnId)) {
        console.warn('[billing/checkout] ⚠️ Invalid add-on ID:', addOnId);
        continue;
      }

      const addOnPriceKey = `PRICE_ADDON_${addOnId.toUpperCase()}_${billingUpper}`;
      const addOnPriceId = process.env[addOnPriceKey];

      if (!addOnPriceId) {
        console.warn('[billing/checkout] ⚠️ Missing add-on price:', addOnPriceKey);
        continue;
      }

      lineItems.push({ price: addOnPriceId, quantity: 1 });
      addedAddOns.push(addOnId);
      console.log('[billing/checkout] ✅ Added add-on:', addOnId);
    }

    console.log('[billing/checkout] 📋 Total line items:', lineItems.length);

    // 10. Create Stripe session
    console.log('[billing/checkout] 💳 Creating Stripe session...');
    
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email ?? undefined,
      line_items: lineItems,
      success_url: `${BASE_URL}/dashboard?payment=success`,
      cancel_url: `${BASE_URL}/choose-plan?payment=cancel`,
      metadata: {
        user_id: session.user.id,
        plan,
        billing_cycle: billingCycle,
        addons: addedAddOns.join(','),
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          plan,
          billing_cycle: billingCycle,
          addons: addedAddOns.join(','),
        },
      },
    });

    if (!checkoutSession.url) {
      console.error('[billing/checkout] ❌ No checkout URL from Stripe');
      console.error('[billing/checkout] Session object:', JSON.stringify(checkoutSession, null, 2));
      return NextResponse.json(
        { error: 'Failed to create checkout session. No URL returned from Stripe.' },
        { status: 500 }
      );
    }

    // Validate URL
    if (!checkoutSession.url.startsWith('https://checkout.stripe.com')) {
      console.error('[billing/checkout] ⚠️ Unexpected URL format:', checkoutSession.url);
    }

    console.log('[billing/checkout] ✅ Success! URL:', checkoutSession.url);
    console.log('[billing/checkout] Session ID:', checkoutSession.id);
    console.log('[billing/checkout] ========== REQUEST END ==========');

    // Return URL with additional debugging info in development
    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error: any) {
    console.error('[billing/checkout] ❌ ERROR:', error?.message);
    console.error('[billing/checkout] Stack:', error?.stack);
    
    if (error?.type === 'StripeInvalidRequestError') {
      console.error('[billing/checkout] Stripe error:', error.raw);
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
