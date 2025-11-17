// File: src/app/api/stripe/checkout/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

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

    // 💰 Decide priceId based on plan + billingCycle
    // TODO: Replace with your real Stripe price IDs from Stripe Dashboard
    // Get these from: Stripe Dashboard → Products → Your Product → Pricing
    const priceMap: Record<string, string> = {
      // Add your Stripe price IDs here:
      // 'ESSENTIALS_monthly': 'price_xxxxxxxxxxxxx',
      // 'ESSENTIALS_yearly': 'price_xxxxxxxxxxxxx',
      // 'PRO_monthly': 'price_xxxxxxxxxxxxx',
      // 'PRO_yearly': 'price_xxxxxxxxxxxxx',
    };

    const key = `${plan}_${billingCycle}`;
    const priceId = priceMap[key];

    if (!priceId) {
      console.error('[checkout] Missing Stripe price ID for:', key);
      console.error('[checkout] Please add price IDs to priceMap in src/app/api/stripe/checkout/route.ts');
      return NextResponse.json(
        { 
          error: `Stripe price ID not configured for ${plan} (${billingCycle}). Please contact support or configure price IDs.` 
        },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
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
