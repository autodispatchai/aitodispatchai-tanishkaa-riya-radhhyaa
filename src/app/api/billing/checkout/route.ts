import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('[billing/checkout] ❌ STRIPE_SECRET_KEY missing');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' }) : null;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.autodispatchai.com';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('[billing/checkout] ========== REQUEST START ==========');
  
  try {
    // 1. Check Stripe initialization
    if (!stripe) {
      console.error('[billing/checkout] ❌ Stripe not initialized - STRIPE_SECRET_KEY missing');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    // 2. Get session
    console.log('[billing/checkout] 🔐 Checking auth...');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[billing/checkout] ❌ Missing Supabase env vars:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
      return NextResponse.json({ 
        error: 'Server configuration error. Missing Supabase credentials.' 
      }, { status: 500 });
    }
    
    let cookieStore;
    try {
      cookieStore = await cookies(); // Next.js 15: cookies() is async
      
      // Debug: Log available cookies (without sensitive values)
      const cookieNames = cookieStore.getAll().map(c => c.name);
      console.log('[billing/checkout] 📋 Available cookies:', cookieNames);
      
      // Check for Supabase auth cookies
      const supabaseCookies = cookieNames.filter(name => 
        name.includes('supabase') || name.includes('auth') || name.includes('sb-')
      );
      console.log('[billing/checkout] 🔐 Supabase-related cookies:', supabaseCookies);
      
    } catch (cookieError: any) {
      console.error('[billing/checkout] ❌ Cookie error:', cookieError);
      return NextResponse.json({ 
        error: `Cookie error: ${cookieError?.message || 'Failed to read cookies'}` 
      }, { status: 500 });
    }
    
    let supabase;
    try {
      supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get: (name: string) => {
              const cookie = cookieStore.get(name);
              const value = cookie?.value;
              console.log(`[billing/checkout] 🍪 Reading cookie "${name}":`, value ? 'exists' : 'missing');
              return value;
            },
            set: () => {}, // No-ops for API routes
            remove: () => {},
          },
        }
      );
    } catch (supabaseError: any) {
      console.error('[billing/checkout] ❌ Supabase client error:', supabaseError);
      return NextResponse.json({ 
        error: `Supabase initialization error: ${supabaseError?.message || 'Unknown error'}` 
      }, { status: 500 });
    }
    
    let session, sessionError;
    try {
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data?.session;
      sessionError = sessionResult.error;
      
      console.log('[billing/checkout] 🔍 Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: sessionError?.message,
      });
      
    } catch (authError: any) {
      console.error('[billing/checkout] ❌ Auth getSession error:', authError);
      return NextResponse.json({ 
        error: `Authentication error: ${authError?.message || 'Failed to get session'}` 
      }, { status: 500 });
    }

    if (sessionError) {
      console.error('[billing/checkout] ❌ Session error:', sessionError.message);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!session?.user?.email) {
      console.error('[billing/checkout] ❌ No session or email');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[billing/checkout] ✅ Authenticated:', session.user.email);

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
      console.log('[billing/checkout] 📦 Request body:', {
        plan: body.plan,
        billingCycle: body.billingCycle,
        addOnsCount: Array.isArray(body.addOns) ? body.addOns.length : 0,
      });
    } catch (e) {
      console.error('[billing/checkout] ❌ JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const plan = (body.plan as string)?.toUpperCase() || 'ESSENTIALS';
    const billingCycle = (body.billingCycle as string)?.toLowerCase() || 'monthly';
    const addOns = Array.isArray(body.addOns) ? body.addOns : [];

    // 4. Validate plan
    if (!['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(plan)) {
      console.error('[billing/checkout] ❌ Invalid plan:', plan);
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 });
    }

    // 5. Enterprise → Calendly
    if (plan === 'ENTERPRISE') {
      console.log('[billing/checkout] ℹ️ Enterprise → Calendly');
      return NextResponse.json({
        url: 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing',
      });
    }

    // 6. Get base price ID
    const billingUpper = billingCycle.toUpperCase();
    const planPriceKey = `PRICE_${plan}_${billingUpper}`;
    const basePriceId = process.env[planPriceKey];

    if (!basePriceId) {
      console.error('[billing/checkout] ❌ Missing price ID:', planPriceKey);
      const available = Object.keys(process.env).filter(k => k.startsWith('PRICE_'));
      console.error('[billing/checkout] Available PRICE_ vars:', available);
      return NextResponse.json({ 
        error: `Plan not configured. Missing: ${planPriceKey}. Please add this environment variable in Vercel.` 
      }, { status: 400 });
    }

    console.log('[billing/checkout] ✅ Base price ID found:', planPriceKey);

    // 7. Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: basePriceId, quantity: 1 },
    ];

    // 8. Add add-ons
    const addedAddOns: string[] = [];
    const VALID_ADDON_IDS = ['city', 'highway', 'bestfinder', 'safety', 'cb', 'voice', 'agent', 'pay', 'score'];
    
    for (const addOnId of addOns) {
      if (!VALID_ADDON_IDS.includes(addOnId)) {
        console.warn('[billing/checkout] ⚠️ Invalid add-on ID:', addOnId);
        continue;
      }
      
      const addOnPriceKey = `PRICE_ADDON_${addOnId.toUpperCase()}_${billingUpper}`;
      const addOnPriceId = process.env[addOnPriceKey];
      
      if (addOnPriceId) {
        lineItems.push({ price: addOnPriceId, quantity: 1 });
        addedAddOns.push(addOnId);
        console.log('[billing/checkout] ✅ Added add-on:', addOnId);
      } else {
        console.warn('[billing/checkout] ⚠️ Missing add-on price:', addOnPriceKey);
      }
    }

    console.log('[billing/checkout] 📋 Total line items:', lineItems.length);

    // 9. Create Stripe checkout session
    console.log('[billing/checkout] 💳 Creating Stripe checkout session...');
    
    let sessionCheckout;
    try {
      sessionCheckout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: session.user.email,
        line_items: lineItems,
        success_url: `${BASE_URL}/dashboard`,
        cancel_url: `${BASE_URL}/choose-plan`,
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            user_id: session.user.id,
            plan,
            billing: billingCycle,
            addOns: addedAddOns.join(','),
          },
        },
        metadata: {
          user_id: session.user.id,
          plan,
          billing: billingCycle,
          addOns: addedAddOns.join(','),
        },
      });
    } catch (stripeError: any) {
      console.error('[billing/checkout] ❌ Stripe API error:', stripeError);
      console.error('[billing/checkout] Stripe error type:', stripeError?.type);
      console.error('[billing/checkout] Stripe error message:', stripeError?.message);
      console.error('[billing/checkout] Stripe error code:', stripeError?.code);
      
      // Re-throw Stripe errors so they're caught by outer catch block
      throw stripeError;
    }

    if (!sessionCheckout?.url) {
      console.error('[billing/checkout] ❌ No checkout URL from Stripe');
      console.error('[billing/checkout] Session object:', JSON.stringify(sessionCheckout, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create checkout session. Stripe did not return a URL. Check Stripe dashboard for details.' 
      }, { status: 500 });
    }

    console.log('[billing/checkout] ✅ Success! URL:', sessionCheckout.url);
    console.log('[billing/checkout] Session ID:', sessionCheckout.id);
    console.log('[billing/checkout] ========== REQUEST END ==========');

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error: any) {
    console.error('[billing/checkout] ❌ ERROR:', error?.message);
    console.error('[billing/checkout] Error type:', error?.constructor?.name);
    console.error('[billing/checkout] Stack:', error?.stack);
    
    // Stripe-specific errors - catch all Stripe error types
    if (error?.type && error.type.startsWith('Stripe')) {
      console.error('[billing/checkout] Stripe error details:', JSON.stringify(error.raw || error, null, 2));
      const stripeErrorMsg = error.message || 'Stripe API error occurred';
      return NextResponse.json({ 
        error: `Stripe error: ${stripeErrorMsg}. Check Stripe dashboard and environment variables.`,
        errorCode: error.code,
        errorType: error.type,
      }, { status: 400 });
    }

    // Network errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      console.error('[billing/checkout] Network error:', error.code);
      return NextResponse.json({ 
        error: 'Connection to payment service failed. Please try again.' 
      }, { status: 503 });
    }

    // Extract error message - try multiple sources
    const errorMessage = error?.message || 
                        error?.error?.message || 
                        error?.toString() || 
                        'Unknown error occurred';
    
    console.error('[billing/checkout] Full error object:', {
      message: errorMessage,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      name: error?.name,
      stack: error?.stack,
    });
    
    // Show specific error messages based on error content
    if (errorMessage.toLowerCase().includes('price') || 
        errorMessage.toLowerCase().includes('invalid price')) {
      return NextResponse.json({ 
        error: `Stripe Price ID error: ${errorMessage}. Please check PRICE_* environment variables in Vercel.` 
      }, { status: 400 });
    }
    
    if (errorMessage.toLowerCase().includes('api key') || 
        errorMessage.toLowerCase().includes('authentication')) {
      return NextResponse.json({ 
        error: `Stripe authentication error: ${errorMessage}. Check STRIPE_SECRET_KEY in Vercel.` 
      }, { status: 401 });
    }
    
    // Always show the actual error message (not generic)
    const finalError = errorMessage.includes('Unknown') 
      ? `Payment setup failed. Error: ${error?.type || error?.name || 'Unknown'}. Check Vercel logs.`
      : `Payment setup failed: ${errorMessage}`;
    
    console.error('[billing/checkout] Returning error to client:', finalError);
    
    return NextResponse.json({ 
      error: finalError,
      errorType: error?.type || error?.name || error?.constructor?.name || 'Unknown',
      errorCode: error?.code,
    }, { status: 500 });
  }
}
