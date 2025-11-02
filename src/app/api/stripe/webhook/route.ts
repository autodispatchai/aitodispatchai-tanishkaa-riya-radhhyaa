import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Required ENV:
 *  - STRIPE_SECRET_KEY        (sk_test_... for local)
 *  - STRIPE_WEBHOOK_SECRET    (whsec_... from Stripe CLI or Dashboard)
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      );
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { ok: false, error: 'Missing STRIPE_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }

    // Read raw body for signature verification
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return NextResponse.json(
        { ok: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Minimal handling now (we’ll wire DB next)
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[stripe] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          email: session.customer_details?.email,
          status: session.status,
        });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[stripe] ${event.type}`, {
          id: sub.id,
          status: sub.status,
          customer: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
          items: sub.items.data.map((i) => ({
            price: i.price.id,
            interval: i.price.recurring?.interval ?? null,
          })),
        });
        break;
      }
      default: {
        // ignore others for now
        break;
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('[stripe webhook] error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Webhook error' }, { status: 500 });
  }
}

export async function GET() {
  // quick browser check
  return NextResponse.json({ status: 'stripe webhook alive' });
}
