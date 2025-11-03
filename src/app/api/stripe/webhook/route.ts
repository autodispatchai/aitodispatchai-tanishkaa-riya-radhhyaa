// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Required ENV:
 *  - STRIPE_SECRET_KEY       (sk_...)
 *  - STRIPE_WEBHOOK_SECRET   (whsec_...)
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Don’t pin apiVersion to avoid literal type mismatches across SDK updates
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      )
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { ok: false, error: 'Missing STRIPE_WEBHOOK_SECRET' },
        { status: 500 }
      )
    }

    // read raw body for signature verification
    const rawBody = await req.text()
    const sig = req.headers.get('stripe-signature') || ''

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      return NextResponse.json(
        { ok: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[stripe] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription ?? null,
          email: session.customer_details?.email ?? null,
          status: session.status ?? null,
        })
        // TODO: mark user as active / create org, etc.
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        console.log(`[stripe] ${event.type}`, {
          id: sub.id,
          status: sub.status,
          customer: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
          items: sub.items.data.map(i => ({
            price: i.price.id,
            interval: i.price.recurring?.interval ?? null,
          })),
        })
        // TODO: upsert subscription status in DB
        break
      }

      // Optional: invoices (guard fields to avoid TS errors)
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice

        // Some SDK versions don’t expose these fields on the type unless expanded.
        const subscription = (inv as any)?.subscription ?? null
        const customer = (inv as any)?.customer ?? null
        const next_payment_attempt = (inv as any)?.next_payment_attempt ?? null

        if (event.type === 'invoice.paid') {
          console.log('[stripe] invoice.paid', {
            id: inv.id,
            subscription,
            customer,
            amount_paid: inv.amount_paid,
          })
          // TODO: ensure account remains active
        } else {
          console.warn('[stripe] invoice.payment_failed', {
            id: inv.id,
            subscription,
            customer,
            next_payment_attempt,
          })
          // TODO: notify user / start grace period logic
        }
        break
      }

      default: {
        // ignore others for now
        break
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    console.error('[stripe webhook] error:', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Webhook error' }, { status: 500 })
  }
}

// Quick browser health check
export async function GET() {
  return NextResponse.json({ status: 'stripe webhook alive' })
}

