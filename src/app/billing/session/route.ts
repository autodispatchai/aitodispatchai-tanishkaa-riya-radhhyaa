import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
// Don’t pin apiVersion to avoid literal type mismatch errors
const stripe: Stripe | null = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

export async function GET(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing session id' }, { status: 400 })
    }

    // Optional: quick sanity check (Stripe Checkout Session IDs start with "cs_")
    if (!id.startsWith('cs_')) {
      return NextResponse.json({ ok: false, error: 'Invalid session id format' }, { status: 400 })
    }

    // Expand for clean UI
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['line_items.data.price.product', 'subscription', 'customer'],
    })

    const items = (session.line_items?.data ?? []).map((li: Stripe.LineItem) => {
      const price = li.price ?? null

      // Derive a friendly display name:
      // 1) product.name if product expanded
      // 2) price.nickname (good for “PRO Monthly”)
      // 3) li.description fallback
      let description = li.description || 'Item'
      const prod = price?.product as Stripe.Product | string | null | undefined
      if (prod && typeof prod === 'object' && typeof prod.name === 'string') {
        description = prod.name
      } else if (price?.nickname) {
        description = price.nickname
      }

      return {
        description,
        price_id: price?.id ?? null,
        interval: (price?.recurring?.interval as string | null) ?? null, // 'month' | 'year' | null
        unit_amount: price?.unit_amount ?? null,
        quantity: li.quantity ?? 1,
      }
    })

    return NextResponse.json(
      {
        ok: true,
        id: session.id,
        status: session.status ?? null,
        customer_email: session.customer_details?.email ?? null,
        customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
        subscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null,
        currency: session.currency ?? null,
        amount_total: session.amount_total ?? null,
        line_items: items,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
