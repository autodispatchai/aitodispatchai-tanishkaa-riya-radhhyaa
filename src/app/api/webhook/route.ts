// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.error('[webhook] Missing STRIPE_SECRET_KEY');
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('[webhook] Missing STRIPE_WEBHOOK_SECRET');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail = session.customer_details?.email || session.customer_email;
      const stripeSubscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id || null;
      const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || null;
      const plan = session.metadata?.plan || 'PRO';
      const billing = (session.metadata?.billingCycle || 'monthly') as 'monthly' | 'yearly';
      const addOns = session.metadata?.addOns?.split(',').filter(Boolean) || [];

      if (!customerEmail || !stripeSubscriptionId) {
        console.error('[webhook] Missing email or subscription ID');
        return NextResponse.json(
          { error: 'Missing required data' },
          { status: 400 }
        );
      }

      // Find company by email
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('id, user_id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('[webhook] Company lookup error:', companyError);
        return NextResponse.json(
          { error: 'Company lookup failed' },
          { status: 500 }
        );
      }

      if (!company) {
        console.error('[webhook] Company not found for email:', customerEmail);
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      // Update company subscription_status to 'active'
      const { error: updateError } = await supabaseAdmin
        .from('companies')
        .update({ subscription_status: 'active' })
        .eq('id', company.id);

      if (updateError) {
        console.error('[webhook] Failed to update company:', updateError);
        return NextResponse.json(
          { error: 'Failed to update company' },
          { status: 500 }
        );
      }

      // Get subscription details from Stripe (if subscription ID exists)
      let currentPeriodEnd: string | null = null;
      let trialEnd: string | null = null;
      
      if (stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        } catch (err) {
          console.warn('[webhook] Could not retrieve subscription, using defaults');
          // Default to 30 days from now if monthly, 365 if yearly
          currentPeriodEnd = new Date(Date.now() + (billing === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      // Insert or update subscription
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            company_id: company.id,
            user_id: company.user_id,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            billing_cycle: billing,
            add_ons: addOns,
            status: 'active',
            trial_ends_at: trialEnd,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'stripe_subscription_id' }
        );

      if (subError) {
        console.error('[webhook] Failed to insert subscription:', subError);
        return NextResponse.json(
          { error: 'Failed to insert subscription' },
          { status: 500 }
        );
      }

      console.log(`[webhook] Checkout completed → ${customerEmail} | Plan: ${plan} | Status: active`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

