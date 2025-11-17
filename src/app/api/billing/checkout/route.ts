// src/app/api/billing/checkout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DOMAIN_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autodispatchai.com';

if (!STRIPE_SECRET_KEY) {
  console.error('[billing/checkout] Missing STRIPE_SECRET_KEY');
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

    // 🔐 Supabase session from cookies
    const cookieStore = await cookies();
    const requestCookies = req.headers.get('cookie') || '';
    
    // Get all cookies for debugging
    const allCookies = cookieStore.getAll();
    const cookieNames = allCookies.map(c => c.name);
    console.log('[billing/checkout] Available cookies:', cookieNames);
    console.log('[billing/checkout] Request cookie header present:', !!requestCookies);
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Try cookieStore first
            const cookieValue = cookieStore.get(name)?.value;
            if (cookieValue) {
              console.log(`[billing/checkout] Found cookie ${name} in cookieStore`);
              return cookieValue;
            }
            // Fallback: parse from request cookie header
            const match = requestCookies.match(new RegExp(`(^| )${name}=([^;]+)`));
            if (match) {
              console.log(`[billing/checkout] Found cookie ${name} in request header`);
              return match[2];
            }
            console.log(`[billing/checkout] Cookie ${name} not found`);
            return undefined;
          },
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Use getSession() for better cookie compatibility
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[billing/checkout] Session error:', sessionError);
      console.error('[billing/checkout] Cookie names:', cookieNames);
      return NextResponse.json(
        { error: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      console.error('[billing/checkout] No session found');
      console.error('[billing/checkout] Cookie names:', cookieNames);
      console.error('[billing/checkout] Request cookies:', requestCookies.substring(0, 200));
      
      // Try getUser() as fallback
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        console.log('[billing/checkout] Found user via getUser(), but no session - this is unusual');
        // Still return error because we need a session for Stripe
        return NextResponse.json(
          { error: 'Session expired. Please refresh the page and try again.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const plan = (body.plan as string | undefined) || 'ESSENTIALS';
    const billingCycle = (body.billingCycle as 'monthly' | 'yearly' | undefined) || 'monthly';
    const addOns = (body.addOns as string[] | undefined) || [];

    // Get price IDs from environment variables
    const priceMap: Record<string, string> = {
      'ESSENTIALS_monthly': process.env.PRICE_ESSENTIALS_MONTHLY || '',
      'ESSENTIALS_yearly': process.env.PRICE_ESSENTIALS_YEARLY || '',
      'PRO_monthly': process.env.PRICE_PRO_MONTHLY || '',
      'PRO_yearly': process.env.PRICE_PRO_YEARLY || '',
    };

    const key = `${plan}_${billingCycle}`;
    const priceId = priceMap[key];

    if (!priceId) {
      console.error('[billing/checkout] Missing Stripe price ID for:', key);
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
          console.warn(`[billing/checkout] Add-on price ID not found for: ${addOnId}`);
        }
      }
    }

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email ?? undefined,
      line_items: lineItems,
      metadata: {
        user_id: session.user.id,
        plan,
        billingCycle: billingCycle,
        addOns: addOns.join(','),
      },
      success_url: `${DOMAIN_URL}/dashboard?payment=success`,
      cancel_url: `${DOMAIN_URL}/choose-plan?payment=cancel`,
    });

    if (!sessionCheckout.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (err: any) {
    console.error('[billing/checkout] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

