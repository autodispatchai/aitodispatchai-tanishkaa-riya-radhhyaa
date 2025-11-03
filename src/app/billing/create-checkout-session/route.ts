import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Env */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY // sk_test_***
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// IMPORTANT: If you can, rename these to server-only names (no NEXT_PUBLIC_)
// and update your Vercel env to match. Keeping your current names to avoid breakage.
const PRICE = {
  ESSENTIALS: {
    monthly: process.env.NEXT_PUBLIC_PRICE_ESSENTIALS_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_PRICE_ESSENTIALS_YEARLY,
  },
  PRO: {
    monthly: process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_PRICE_PRO_YEARLY,
  },
} as const

const ADDON = {
  city:       { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_CITY_MONTHLY,       yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_CITY_YEARLY },
  highway:    { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_HIGHWAY_MONTHLY,    yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_HIGHWAY_YEARLY },
  bestfinder: { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_BESTFINDER_MONTHLY, yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_BESTFINDER_YEARLY },
  safety:     { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_SAFETY_MONTHLY,     yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_SAFETY_YEARLY },
  cb:         { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_CB_MONTHLY,         yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_CB_YEARLY },
  voice:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_VOICE_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_VOICE_YEARLY },
  agent:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_AGENT_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_AGENT_YEARLY },
  pay:        { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_PAY_MONTHLY,        yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_PAY_YEARLY },
  score:      { monthly: process.env.NEXT_PUBLIC_PRICE_ADDON_SCORE_MONTHLY,      yearly: process.env.NEXT_PUBLIC_PRICE_ADDON_SCORE_YEARLY },
} as const

/** Types */
type Billing = 'monthly' | 'yearly'
type Plan = 'ESSENTIALS' | 'PRO' | 'ENTERPRISE'
type Body = { plan: Plan; billing: Billing; addOns?: string[] }

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : (null as unknown as Stripe)

/** Health check */
export async function GET() {
  return NextResponse.json({ ok: true, note: 'create-checkout-session alive' })
}

/** Create Checkout Session */
export async function POST(req: Request) {
  try {
    if (process.env.BILLING_ENABLED === 'false') {
      return NextResponse.json(
        { ok: false, disabled: true, reason: 'billing temporarily disabled' },
        { status: 501 }
      )
    }
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      )
    }

    // Parse + validate
    const { plan, billing, addOns = [] } = (await req.json()) as Body

    if (!plan || !['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan))
      return NextResponse.json({ ok: false, error: 'Invalid plan' }, { status: 400 })
    if (!billing || !['monthly', 'yearly'].includes(billing))
      return NextResponse.json({ ok: false, error: 'Invalid billing cycle' }, { status: 400 })
    if (plan === 'ENTERPRISE')
      return NextResponse.json({ ok: false, error: 'Enterprise is sales-assisted. Contact sales.' }, { status: 400 })

    // Check required price IDs are present
    const missing: string[] = []
    const planPriceId = PRICE[plan]?.[billing]
    if (!planPriceId) missing.push(`PRICE for ${plan} ${billing}`)

    for (const id of addOns) {
      const map = (ADDON as Record<string, { monthly?: string | undefined; yearly?: string | undefined }>)[id]
      if (!map) continue
      if (!map[billing]) missing.push(`ADDON ${id} ${billing}`)
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing Stripe price env(s): ${missing.join(', ')}`,
          hint: 'Set the correct price IDs in Vercel → Project → Settings → Environment Variables',
        },
        { status: 400 }
      )
    }

    // Build line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: planPriceId!, quantity: 1 }]

    for (const id of addOns) {
      const map = (ADDON as any)[id]
      if (!map) continue
      const addonPriceId = map[billing]
      if (addonPriceId) line_items.push({ price: addonPriceId, quantity: 1 })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      // automatic_tax: { enabled: true }, // enable later if you’ll collect tax with Stripe
      success_url: `${BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/billing/choose-plan?canceled=1`,
      client_reference_id: `${plan}:${billing}`, // quick context
      metadata: {
        plan,
        billing,
        addOns: addOns.join(','),
      },
      // subscription_data: { metadata: { plan, billing, addOns: addOns.join(',') } }, // optional
    })

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
