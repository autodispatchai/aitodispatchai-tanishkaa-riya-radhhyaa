import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// Avoid apiVersion literal mismatch errors by not pinning it
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function GET(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { ok: false, error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing session id' }, { status: 400 });
    }

    // Expand line_items + product for a clean UI
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['line_items.data.price.product', 'subscription', 'customer'],
    });

    // Coerce items to a known shape
    const items = (session.line_items?.data ?? []).map((li: Stripe.LineItem) => {
      const price = li.price ?? null;

      // price.product can be a string or a full Product object
      let productName = li.description || 'Item';
      const prod = price?.product as Stripe.Product | string | null | undefined;
      if (prod && typeof prod === 'object' && 'name' in prod && typeof prod.name === 'string') {
        productName = prod.name;
      }

      return {
        description: productName,
        price_id: price?.id ?? null,
        interval: (price?.recurring?.interval as string | null) ?? null, // 'month' | 'year' | null
        unit_amount: price?.unit_amount ?? null,
        quantity: li.quantity ?? 1,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        id: session.id,
        status: session.status ?? null,
        customer_email: session.customer_details?.email ?? null,
        currency: session.currency ?? null,
        amount_total: session.amount_total ?? null,
        line_items: items,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
