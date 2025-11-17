// File: src/app/api/stripe/checkout/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DOMAIN_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com';

if (!STRIPE_SECRET_KEY) {
  console.error('[checkout] Missing STRIPE_SECRET_KEY');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // 🔐 Supabase user from cookies (must be logged in)
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const plan = body.plan as string | undefined;
    const billingCycle = (body.billingCycle as 'monthly' | 'yearly' | undefined) || 'monthly';
    const addOns = (body.addOns as string[] | undefined) || [];

    if (!plan) {
      return NextResponse.json(
        { error: 'Missing plan' },
        { status: 400 }
      );
    }

    // 💰 Get priceId from environment variables
    const priceMap: Record<string, string> = {
      'ESSENTIALS_monthly': process.env.PRICE_ESSENTIALS_MONTHLY || '',
      'ESSENTIALS_yearly': process.env.PRICE_ESSENTIALS_YEARLY || '',
      'PRO_monthly': process.env.PRICE_PRO_MONTHLY || '',
      'PRO_yearly': process.env.PRICE_PRO_YEARLY || '',
    };

    const key = `${plan}_${billingCycle}`;
    const priceId = priceMap[key];

    if (!priceId) {
      console.error('[checkout] Missing Stripe price ID for:', key);
      console.error('[checkout] Available env vars:', Object.keys(priceMap).filter(k => priceMap[k]));
      return NextResponse.json(
        { 
          error: `Stripe price ID not configured for ${plan} (${billingCycle}). Please set PRICE_${plan}_${billingCycle.toUpperCase()} in environment variables.` 
        },
        { status: 400 }
      );
    }

    // Build line items: base plan + add-ons
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add add-ons if selected
    if (addOns.length > 0) {
      const addOnPriceMap: Record<string, string> = {
        'city': billingCycle === 'monthly' 
          ? (process.env.PRICE_ADDON_CITY_MONTHLY || '')
          : (process.env.PRICE_ADDON_CITY_YEARLY || ''),
        'highway': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_HIGHWAY_MONTHLY || '')
          : (process.env.PRICE_ADDON_HIGHWAY_YEARLY || ''),
        'bestfinder': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_BESTFINDER_MONTHLY || '')
          : (process.env.PRICE_ADDON_BESTFINDER_YEARLY || ''),
        'safety': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_SAFETY_MONTHLY || '')
          : (process.env.PRICE_ADDON_SAFETY_YEARLY || ''),
        'cb': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_CB_MONTHLY || '')
          : (process.env.PRICE_ADDON_CB_YEARLY || ''),
        'voice': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_VOICE_MONTHLY || '')
          : (process.env.PRICE_ADDON_VOICE_YEARLY || ''),
        'agent': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_AGENT_MONTHLY || '')
          : (process.env.PRICE_ADDON_AGENT_YEARLY || ''),
        'pay': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_PAY_MONTHLY || '')
          : (process.env.PRICE_ADDON_PAY_YEARLY || ''),
        'score': billingCycle === 'monthly'
          ? (process.env.PRICE_ADDON_SCORE_MONTHLY || '')
          : (process.env.PRICE_ADDON_SCORE_YEARLY || ''),
      };

      for (const addOnId of addOns) {
        const addOnPriceId = addOnPriceMap[addOnId];
        if (addOnPriceId) {
          lineItems.push({
            price: addOnPriceId,
            quantity: 1,
          });
        } else {
          console.warn(`[checkout] Add-on price ID not found for: ${addOnId}`);
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email ?? undefined,
      line_items: lineItems,
      metadata: {
        user_id: user.id,
        plan,
        billingCycle: billingCycle,
        addOns: addOns.join(','),
      },
      success_url: `${DOMAIN_URL}/dashboard?payment=success`,
      cancel_url: `${DOMAIN_URL}/choose-plan?payment=cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
