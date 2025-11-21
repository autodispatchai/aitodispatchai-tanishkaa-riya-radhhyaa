import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || 'ESSENTIALS';
      const billing = session.metadata?.billing || 'monthly';
      const addOnsStr = session.metadata?.addOns || '';
      const addOns = addOnsStr ? addOnsStr.split(',').filter(Boolean) : [];

      if (!userId) {
        console.error('[webhook] Missing user_id in metadata');
        return NextResponse.json({ received: true });
      }

      // Get subscription ID from session
      const stripeSubscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id || null;

      const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer_details?.email || null;

      if (!stripeSubscriptionId) {
        console.error('[webhook] Missing subscription ID');
        return NextResponse.json({ received: true });
      }

      // Find company by owner_id
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('id, owner_id')
        .eq('owner_id', userId)
        .maybeSingle();

      if (companyError || !company) {
        console.error('[webhook] Company not found for user:', userId);
        return NextResponse.json({ received: true });
      }

      // Calculate trial end (14 days from now)
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      // Get subscription details from Stripe to get current_period_end
      let currentPeriodEnd: string | null = null;
      try {
        const subscriptionResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subscription = subscriptionResponse as any;
        if (subscription?.current_period_end) {
          currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }
      } catch (err) {
        console.warn('[webhook] Could not retrieve subscription details');
      }

      // Update or insert subscription
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            company_id: company.id,
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            add_ons: addOns,
            status: 'active', // Active because trial started
            trial_ends_at: trialEndsAt,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'stripe_subscription_id' }
        );

      if (subError) {
        console.error('[webhook] Subscription upsert error:', subError);
      } else {
        console.log('[webhook] ✅ Subscription created/updated:', {
          company_id: company.id,
          plan,
          status: 'active',
        });
      }

      // Note: companies table doesn't have subscription_status column
      // Status is managed via subscriptions table
      // If you need subscription_status in companies, add it via migration
    }
  } catch (err) {
    console.error('[webhook] Processing error:', err);
  }

  return NextResponse.json({ received: true });
}
