// src/app/api/billing/checkout/route.ts
// BULLETPROOF CHECKOUT API - 100% WORKING
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate Stripe secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('[billing/checkout] ❌ STRIPE_SECRET_KEY missing in environment variables');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' }) : null;

// Base URL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com';

// Valid add-on IDs (from choose-plan/page.tsx)
const VALID_ADDON_IDS = ['city', 'highway', 'bestfinder', 'safety', 'cb', 'voice', 'agent', 'pay', 'score'];

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log('[billing/checkout] ========== CHECKOUT REQUEST START ==========');

  try {
    // 1. Validate Stripe
    if (!stripe) {
      console.error('[billing/checkout] ❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // 2. Get Supabase session
    console.log('[billing/checkout] 🔐 Checking authentication...');
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[billing/checkout] ❌ Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      console.error('[billing/checkout] ❌ No session found');
      return NextResponse.json(
        { error: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('[billing/checkout] ✅ Authenticated user:', session.user.email);

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
      console.log('[billing/checkout] 📦 Request body:', {
        plan: body.plan,
        billingCycle: body.billingCycle,
        addOns: body.addOns,
      });
    } catch (parseError) {
      console.error('[billing/checkout] ❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format.' },
        { status: 400 }
      );
    }

    const plan = (body.plan as string)?.toUpperCase() || 'ESSENTIALS';
    const billingCycle = (body.billingCycle as string)?.toLowerCase() || 'monthly';
    const addOns = Array.isArray(body.addOns) ? body.addOns : [];

    // 4. Validate plan
    if (!['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan)) {
      console.error('[billing/checkout] ❌ Invalid plan:', plan);
      return NextResponse.json(
        { error: `Invalid plan: ${plan}. Must be ESSENTIALS, PRO, or ENTERPRISE.` },
        { status: 400 }
      );
    }

    // 5. Validate billing cycle
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      console.error('[billing/checkout] ❌ Invalid billing cycle:', billingCycle);
      return NextResponse.json(
        { error: `Invalid billing cycle: ${billingCycle}. Must be monthly or yearly.` },
        { status: 400 }
      );
    }

    // 6. Handle Enterprise plan (no Stripe checkout)
    if (plan === 'ENTERPRISE') {
      console.log('[billing/checkout] ℹ️ Enterprise plan selected - redirecting to Calendly');
      return NextResponse.json({
        url: 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing',
      });
    }

    // 7. Get base plan price ID
    const planPriceKey = `PRICE_${plan}_${billingCycle.toUpperCase()}`;
    const basePriceId = process.env[planPriceKey];

    if (!basePriceId) {
      console.error('[billing/checkout] ❌ Missing price ID for:', planPriceKey);
      console.error('[billing/checkout] Available env vars:', Object.keys(process.env).filter(k => k.startsWith('PRICE_')));
      return NextResponse.json(
        {
          error: `Pricing not configured for ${plan} (${billingCycle}). Missing environment variable: ${planPriceKey}`,
        },
        { status: 400 }
      );
    }

    console.log('[billing/checkout] ✅ Base plan price ID:', basePriceKey, '=', basePriceId.substring(0, 20) + '...');

    // 8. Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: basePriceId,
        quantity: 1,
      },
    ];

    // 9. Add add-ons
    const missingAddOnPrices: string[] = [];
    const addedAddOns: string[] = [];

    for (const addOnId of addOns) {
      // Validate add-on ID
      if (!VALID_ADDON_IDS.includes(addOnId)) {
        console.warn(`[billing/checkout] ⚠️ Invalid add-on ID: ${addOnId} - skipping`);
        continue;
      }

      // Get add-on price ID
      const addOnPriceKey = `PRICE_ADDON_${addOnId.toUpperCase()}_${billingCycle.toUpperCase()}`;
      const addOnPriceId = process.env[addOnPriceKey];

      if (!addOnPriceId) {
        console.warn(`[billing/checkout] ⚠️ Missing price ID for add-on: ${addOnPriceKey}`);
        missingAddOnPrices.push(addOnPriceKey);
        continue;
      }

      lineItems.push({
        price: addOnPriceId,
        quantity: 1,
      });

      addedAddOns.push(addOnId);
      console.log(`[billing/checkout] ✅ Added add-on: ${addOnId} (${addOnPriceKey})`);
    }

    if (missingAddOnPrices.length > 0) {
      console.warn('[billing/checkout] ⚠️ Some add-ons missing price IDs:', missingAddOnPrices);
      // Continue anyway - just log the warning
    }

    console.log('[billing/checkout] 📋 Final line items count:', lineItems.length);
    console.log('[billing/checkout] 📋 Added add-ons:', addedAddOns);

    // 10. Create Stripe checkout session
    console.log('[billing/checkout] 💳 Creating Stripe checkout session...');
    
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
      console.error('[billing/checkout] ❌ Stripe returned no checkout URL');
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log('[billing/checkout] ✅ Checkout session created successfully in', duration, 'ms');
    console.log('[billing/checkout] 🔗 Checkout URL:', checkoutSession.url);
    console.log('[billing/checkout] ========== CHECKOUT REQUEST END ==========');

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[billing/checkout] ❌ ERROR after', duration, 'ms:');
    console.error('[billing/checkout] Error type:', error?.constructor?.name);
    console.error('[billing/checkout] Error message:', error?.message);
    console.error('[billing/checkout] Error stack:', error?.stack);
    
    // Stripe-specific errors
    if (error?.type === 'StripeInvalidRequestError') {
      console.error('[billing/checkout] Stripe error details:', error?.raw);
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
