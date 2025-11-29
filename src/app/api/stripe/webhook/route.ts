import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Get signature from headers
  const sig = req.headers.get('stripe-signature');
  
  if (!sig) {
    console.error('[webhook] ❌ Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('[webhook] ❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Read raw body - CRITICAL: Must be raw, unmodified body for signature verification
  // Use arrayBuffer for better compatibility with Next.js 16
  let body: string;
  try {
    const arrayBuffer = await req.arrayBuffer();
    body = Buffer.from(arrayBuffer).toString('utf8');
  } catch (err: any) {
    console.error('[webhook] ❌ Error reading request body:', err);
    return NextResponse.json({ error: 'Error reading body' }, { status: 400 });
  }

  if (!body || body.length === 0) {
    console.error('[webhook] ❌ Empty request body');
    return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature with raw body
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('[webhook] ✅ Signature verified, event type:', event.type, 'event ID:', event.id);
  } catch (err: any) {
    console.error('[webhook] ❌ Signature verification failed:', err.message);
    console.error('[webhook] Debug info:', {
      hasSignature: !!sig,
      signatureLength: sig?.length,
      bodyLength: body?.length,
      webhookSecretSet: !!webhookSecret,
      webhookSecretLength: webhookSecret?.length,
    });
    return NextResponse.json({ 
      error: `Webhook Error: ${err.message}`,
      hint: 'Check if STRIPE_WEBHOOK_SECRET matches Stripe Dashboard'
    }, { status: 400 });
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

      // Find company by owner_id (companies table uses owner_id)
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

      // Get subscription details from Stripe to get current_period_end and status
      let currentPeriodEnd: string | null = null;
      let subscriptionStatus: 'active' | 'trialing' = 'trialing';
      let actualTrialEndsAt: string | null = null;
      
      try {
        const subscriptionResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subscription = subscriptionResponse as any;
        
        if (subscription?.current_period_end) {
          currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }
        
        // Check if subscription is in trial period
        if (subscription?.status === 'trialing') {
          subscriptionStatus = 'trialing';
          if (subscription?.trial_end) {
            actualTrialEndsAt = new Date(subscription.trial_end * 1000).toISOString();
          }
        } else if (subscription?.status === 'active') {
          subscriptionStatus = 'active';
        }
        
        console.log('[webhook] Subscription details:', {
          stripeStatus: subscription?.status,
          trialEnd: subscription?.trial_end,
          currentPeriodEnd: subscription?.current_period_end,
        });
      } catch (err) {
        console.warn('[webhook] Could not retrieve subscription details:', err);
      }

      // Use actual trial end from Stripe if available, otherwise use calculated one
      const finalTrialEndsAt = actualTrialEndsAt || trialEndsAt;

      console.log('[webhook] Saving subscription:', {
        company_id: company.id,
        user_id: userId,
        stripe_subscription_id: stripeSubscriptionId,
        plan,
        status: subscriptionStatus,
        trial_ends_at: finalTrialEndsAt,
      });

      // Update or insert subscription
      const { data: subscriptionData, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            company_id: company.id,
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            add_ons: addOns,
            status: subscriptionStatus, // 'trialing' during trial, 'active' after
            trial_ends_at: finalTrialEndsAt,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'stripe_subscription_id' }
        )
        .select();

      if (subError) {
        console.error('[webhook] ❌ Subscription upsert error:', subError);
        console.error('[webhook] Error details:', {
          message: subError.message,
          details: subError.details,
          hint: subError.hint,
          code: subError.code,
        });
        console.error('[webhook] Data being saved:', {
          company_id: company.id,
          user_id: userId,
          stripe_subscription_id: stripeSubscriptionId,
          plan,
          status: subscriptionStatus,
          add_ons: addOns,
        });
        // Don't return error - let Stripe know we received the event
        // But log the error for debugging
      } else {
        console.log('[webhook] ✅ Subscription created/updated:', {
          subscription_id: subscriptionData?.[0]?.id,
          company_id: company.id,
          plan,
          status: subscriptionStatus,
          trial_ends_at: finalTrialEndsAt,
          stripe_subscription_id: stripeSubscriptionId,
          add_ons: addOns,
        });
      }
    }
    
    // Handle subscription updates (when trial ends, status changes, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log('[webhook] Subscription updated:', {
        subscription_id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
      });
      
      // Update subscription status in database
      const statusMap: Record<string, 'active' | 'trialing' | 'canceled'> = {
        'trialing': 'trialing',
        'active': 'active',
        'canceled': 'canceled',
        'past_due': 'active', // Treat past_due as active for now
        'unpaid': 'canceled',
      };
      
      const dbStatus = statusMap[subscription.status] || 'active';
      
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: dbStatus,
          trial_ends_at: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null,
        })
        .eq('stripe_subscription_id', subscription.id);
      
      if (updateError) {
        console.error('[webhook] ❌ Subscription update error:', updateError);
      } else {
        console.log('[webhook] ✅ Subscription status updated:', {
          subscription_id: subscription.id,
          status: dbStatus,
        });
      }
    }
    
    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log('[webhook] Subscription deleted:', subscription.id);
      
      const { error: deleteError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
        })
        .eq('stripe_subscription_id', subscription.id);
      
      if (deleteError) {
        console.error('[webhook] ❌ Subscription cancellation error:', deleteError);
      } else {
        console.log('[webhook] ✅ Subscription canceled:', subscription.id);
      }
    }

    // Handle invoice.paid event (for trial subscriptions)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === 'string' 
        ? invoice.subscription 
        : invoice.subscription?.id;

      if (subscriptionId) {
        console.log('[webhook] Invoice paid for subscription:', subscriptionId);
        // Subscription will be updated via customer.subscription.updated event
        // But we can also update it here if needed
        try {
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
          const subscription = subscriptionResponse as any;
          
          const statusMap: Record<string, 'active' | 'trialing' | 'canceled'> = {
            'trialing': 'trialing',
            'active': 'active',
            'canceled': 'canceled',
          };
          
          const dbStatus = statusMap[subscription.status] || 'active';
          
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: dbStatus,
              current_period_end: subscription?.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq('stripe_subscription_id', subscriptionId);
          
          if (!updateError) {
            console.log('[webhook] ✅ Subscription updated from invoice.paid:', subscriptionId);
          }
        } catch (err) {
          console.warn('[webhook] Could not update subscription from invoice.paid:', err);
        }
      }
    }

    // Handle customer.subscription.created event
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[webhook] Subscription created event:', subscription.id);
      // This is usually handled by checkout.session.completed, but log it for debugging
      // If checkout.session.completed didn't fire, we can handle it here
    }

  } catch (err) {
    console.error('[webhook] Processing error:', err);
  }

  return NextResponse.json({ received: true });
}
