// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe config
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.warn('[webhook] Missing STRIPE_SECRET_KEY');
}
if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('[webhook] Missing STRIPE_WEBHOOK_SECRET');
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

/**
 * Helpers
 */
function getSubscriptionId(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj.subscription === 'string') return obj.subscription;
  if (obj.subscription?.id) return obj.subscription.id;
  return null;
}

function getCustomerId(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj.customer === 'string') return obj.customer;
  if (obj.customer?.id) return obj.customer.id;
  return null;
}

/**
 * Webhook handler
 */
export async function POST(req: NextRequest) {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error('[webhook] Stripe not configured');
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured' },
        { status: 500 },
      );
    }

    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json(
        { ok: false, error: 'Missing Stripe signature' },
        { status: 400 },
      );
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      console.error('[webhook] Signature failed:', err.message);
      return NextResponse.json(
        { ok: false, error: `Webhook Error: ${err.message}` },
        { status: 400 },
      );
    }

    switch (event.type) {
      /**
       * 1️⃣ Checkout completed → create / link subscription
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerEmail =
          (session.customer_details?.email as string) ||
          (session.customer_email as string) ||
          null;

        const stripeSubscriptionId = getSubscriptionId(session);
        const plan = session.metadata?.plan || 'ESSENTIALS';
        const billing = session.metadata?.billing || 'monthly';
        const addOns =
          session.metadata?.addOns?.split(',').filter(Boolean) || [];

        if (!customerEmail || !stripeSubscriptionId) {
          console.warn(
            '[webhook] Missing email or subscriptionId on checkout.session.completed',
          );
          break;
        }

        // Find company by email (assumes company.email = billing email)
        const { data: company, error: companyError } = await supabaseAdmin
          .from('companies')
          .select('id, owner_id')
          .eq('email', customerEmail)
          .single();

        if (companyError || !company) {
          console.error(
            '[webhook] Company not found for email:',
            customerEmail,
            companyError,
          );
          break;
        }

        const { error: upsertError } = await supabaseAdmin
          .from('subscriptions')
          .upsert(
            {
              company_id: company.id,
              user_id: company.owner_id,
              stripe_customer_id: getCustomerId(session),
              stripe_subscription_id: stripeSubscriptionId,
              plan,
              billing_cycle: billing,
              add_ons: addOns,
              status: 'active',
              trial_ends_at: null,
              current_period_end: null,
            },
            {
              onConflict: 'stripe_subscription_id',
            },
          );

        if (upsertError) {
          console.error(
            '[webhook] Subscription upsert failed:',
            upsertError,
          );
        } else {
          console.log(
            `[webhook] Subscription linked → company=${company.id} | plan=${plan}`,
          );
        }

        break;
      }

      /**
       * 2️⃣ Subscription lifecycle: keep status & period synced
       */
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubId = sub.id;
        if (!stripeSubId) break;

        // Stripe types are strict; use a raw cast for timestamp fields
        const rawSub: any = sub;

        const periodEnd = rawSub.current_period_end
          ? new Date(rawSub.current_period_end * 1000).toISOString()
          : null;

        const trialEnd = rawSub.trial_end
          ? new Date(rawSub.trial_end * 1000).toISOString()
          : null;

        const updatePayload: Record<string, any> = {
          status: sub.status,
        };
        if (periodEnd) updatePayload.current_period_end = periodEnd;
        if (trialEnd) updatePayload.trial_ends_at = trialEnd;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update(updatePayload)
          .eq('stripe_subscription_id', stripeSubId);

        if (updateError) {
          console.error(
            '[webhook] Subscription status update failed:',
            updateError,
          );
        } else {
          console.log(
            `[webhook] ${event.type} → stripe_subscription_id=${stripeSubId} | status=${sub.status}`,
          );
        }

        break;
      }

      /**
       * 3️⃣ Invoices: just log for now
       */
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = getSubscriptionId(inv);
        console.log(
          `[webhook] ${event.type} → invoice=${inv.id} | sub=${subId || 'n/a'}`,
        );
        break;
      }

      default: {
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[webhook] Error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Server error' },
      { status: 500 },
    );
  }
}

/**
 * Simple health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'webhook alive',
    ts: new Date().toISOString(),
  });
}
