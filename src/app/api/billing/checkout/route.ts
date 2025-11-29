// src/app/api/billing/checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

async function getServerSupabase() {
  const cookieStore = await cookies(); // 👈 Next 16: cookies() is async
  // Use createRouteHandlerClient to match client-side cookie format
  return createRouteHandlerClient<Database>({
    cookies: async () => cookieStore,
  });
}

export async function POST(request: Request) {
  try {
    // Read request body ONCE at the start
    const body = await request.json();
    const plan = body.plan === 'PRO' ? 'PRO' : 'ESSENTIALS';
    const billing = body.billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const addOns = body.addOns || [];
    const couponCode = body.couponCode?.trim() || null;

    const cookieStore = await cookies();
    
    // Debug: Check what cookies are present
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || c.name.includes('sb-') || c.name.includes('auth')
    );
    console.log('[checkout] Cookies found:', {
      total: allCookies.length,
      allCookieNames: allCookies.map(c => c.name),
      supabaseCookies: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value, valueLength: c.value?.length || 0 })),
    });
    
    const supabase = await getServerSupabase();
    
    // Try getUser first (more reliable for API routes)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userEmail: string;
    let userId: string;
    
    if (user?.email) {
      console.log('[checkout] ✅ User authenticated via getUser:', user.email);
      userEmail = user.email;
      userId = user.id;
    } else {
      // Fallback: try getSession
      console.log('[checkout] getUser failed, trying getSession...', {
        authError: authError?.message,
        hasUser: !!user,
      });
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        console.log('[checkout] ✅ Session found via getSession:', session.user.email);
        userEmail = session.user.email;
        userId = session.user.id;
      } else {
        console.error('[checkout] ❌ Auth failed - both getUser and getSession failed:', {
          getUserError: authError?.message,
          getSessionError: sessionError?.message,
          hasUser: !!user,
          hasSession: !!session,
        });
        
        return NextResponse.json({ 
          error: 'Not authenticated. Please log in again.',
          details: authError?.message || sessionError?.message || 'No user session found',
          debug: {
            cookieCount: allCookies.length,
            supabaseCookieCount: supabaseCookies.length,
            cookieNames: allCookies.map(c => c.name),
          }
        }, { status: 401 });
      }
    }
    
    // Now process the checkout with authenticated user
    const planKey = `PRICE_${plan}_${billing}`;
    const basePriceId = process.env[planKey];

    if (!basePriceId) {
      console.error('MISSING PRICE ID →', planKey);
      return NextResponse.json({ error: 'Plan not available' }, { status: 400 });
    }

    const lineItems = [{ price: basePriceId, quantity: 1 }];

    addOns.forEach((addonId: string) => {
      const addonKey = `PRICE_ADDON_${addonId.toUpperCase()}_${billing}`;
      const addonPriceId = process.env[addonKey];
      if (addonPriceId) lineItems.push({ price: addonPriceId, quantity: 1 });
    });

    // Get site URL - detect from request or environment
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // Try to get URL from request headers (works for both localhost and production)
    if (!siteUrl) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const host = request.headers.get('host');
      
      if (origin) {
        siteUrl = origin;
      } else if (referer) {
        try {
          const url = new URL(referer);
          siteUrl = `${url.protocol}//${url.host}`;
        } catch {
          // Fallback
        }
      } else if (host) {
        // Use host header (works for localhost)
        const protocol = host.includes('localhost') ? 'http' : 'https';
        siteUrl = `${protocol}://${host}`;
      }
    }
    
    // Final fallback
    if (!siteUrl) {
      // In development, use localhost
      if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
        siteUrl = 'http://localhost:3000';
      } else {
        siteUrl = 'https://www.autodispatchai.com';
      }
    }
    
    console.log('[checkout] Using site URL:', siteUrl);
    
    // Prepare checkout session config
    const checkoutConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: lineItems,
      subscription_data: { trial_period_days: 14 },
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/choose-plan?canceled=true`,
      metadata: {
        user_id: userId,
        plan,
        billing_cycle: billing,
        addOns: addOns.join(','),
      },
    };
    
    // Apply coupon if provided (validate first)
    if (couponCode && couponCode.length > 0) {
      try {
        // Verify coupon exists and is valid
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon && !coupon.deleted && coupon.valid !== false) {
          checkoutConfig.discounts = [{ coupon: couponCode }];
          console.log('[checkout] ✅ Coupon applied:', couponCode);
        } else {
          console.warn('[checkout] ⚠️ Coupon is deleted or invalid:', couponCode);
        }
      } catch (couponError: any) {
        // If coupon doesn't exist or is invalid, continue without it
        console.warn('[checkout] ⚠️ Coupon validation failed (continuing without coupon):', {
          couponCode,
          error: couponError?.message,
          type: couponError?.type,
          statusCode: couponError?.statusCode,
        });
        // Don't fail the checkout, just continue without coupon
        // Remove coupon from config if it was added
        delete checkoutConfig.discounts;
      }
    }
    
    // Also allow promotion codes in Stripe's UI (users can enter codes there too)
    checkoutConfig.allow_promotion_codes = true;
    
    // Validate Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[checkout] ❌ STRIPE_SECRET_KEY is missing!');
      return NextResponse.json({ 
        error: 'Payment configuration error',
        details: 'Stripe API key is not configured',
        type: 'ConfigurationError',
      }, { status: 500 });
    }
    
    console.log('[checkout] Creating Stripe session with config:', {
      hasCoupon: !!couponCode,
      couponCode: couponCode || 'none',
      lineItemsCount: lineItems.length,
      allowPromotionCodes: checkoutConfig.allow_promotion_codes,
      hasDiscounts: !!checkoutConfig.discounts,
      customerEmail: userEmail,
      plan: plan,
      billing: billing,
    });
    
    try {
      const checkoutSession = await stripe.checkout.sessions.create(checkoutConfig);
      console.log('[checkout] ✅ Stripe session created:', checkoutSession.id);
      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError: any) {
      console.error('[checkout] ❌ Stripe API Error:', {
        message: stripeError?.message,
        type: stripeError?.type,
        code: stripeError?.code,
        statusCode: stripeError?.statusCode,
        param: stripeError?.param,
        decline_code: stripeError?.decline_code,
      });
      
      // Return detailed Stripe error
      return NextResponse.json({ 
        error: 'Stripe checkout failed',
        details: stripeError?.message || 'Failed to create checkout session',
        type: stripeError?.type || 'StripeError',
        code: stripeError?.code,
        param: stripeError?.param,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[checkout] ❌ STRIPE CHECKOUT ERROR:', error);
    console.error('[checkout] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      raw: error?.raw,
    });
    
    // Return more detailed error for debugging
    return NextResponse.json({ 
      error: 'Payment setup failed',
      details: error?.message || 'Unknown error occurred',
      type: error?.type || error?.name || 'Error',
      code: error?.code,
    }, { status: 500 });
  }
}
