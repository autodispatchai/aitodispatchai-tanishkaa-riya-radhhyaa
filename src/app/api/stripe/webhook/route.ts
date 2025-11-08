// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe Config
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) console.warn('[webhook] Missing STRIPE_SECRET_KEY');
if (!STRIPE_WEBHOOK_SECRET) console.warn('[webhook] Missing STRIPE_WEBHOOK_SECRET');

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/**
 * Supabase (Server-side) — SERVICE_ROLE for writes
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[webhook] Missing Supabase server env vars');
}

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

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
 * Webhook Handler
 */
export async function POST(req: NextRequest) {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error('[webhook] Stripe not configured');
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }
    if (!supabase) {
      console.error('[webhook] Supabase not configured');
      return NextResponse.json(
        { ok: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[webhook] Signature failed:', err.message);
      return NextResponse.json(
        { ok: false, error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const addOns = session.metadata?.addOns?.split(',').filter(Boolean) || [];

        if (!userId || !plan) {
          console.warn('[webhook] Missing user_id or plan');
          break;
        }

        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: getCustomerId(session),
              stripe_subscription_id: getSubscriptionId(session),
              plan,
              add_ons: addOns,
              status: 'trialing',
              trial_ends_at: trialEnd,
              current_period_end: periodEnd,
            },
            { onConflict: 'user_id' }
          );

        if (error) console.error('[webhook] Trial upsert failed:', error);
        else console.log(`[webhook] Trial started → user=${userId} | plan=${plan}`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;

        if (!userId || !sub.id) break;

        const unixPeriodEnd = (sub as any).current_period_end ?? (sub as any).trial_end ?? null;
        const currentPeriodEnd = unixPeriodEnd ? new Date(unixPeriodEnd * 1000).toISOString() : null;

        const updatePayload: Record<string, any> = { status: sub.status };
        if (currentPeriodEnd) updatePayload.current_period_end = currentPeriodEnd;

        const { error } = await supabase
          .from('subscriptions')
          .update(updatePayload)
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('[webhook] Update failed:', error);
        else console.log(`[webhook] ${event.type} → user=${userId}`);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = getSubscriptionId(inv);
        console.log(`[webhook] ${event.type} → invoice=${inv.id} | sub=${subId || 'n/a'}`);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[webhook] Error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'webhook alive',
    ts: new Date().toISOString(),
  });
}