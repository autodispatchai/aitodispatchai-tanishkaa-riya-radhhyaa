'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type PlanName = 'ESSENTIALS' | 'PRO' | 'ENTERPRISE';
type BillingCycle = 'monthly' | 'yearly';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  
  const [plan, setPlan] = useState<PlanName>('PRO');
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checkoutTriggered, setCheckoutTriggered] = useState(false);

  useEffect(() => {
    // Load plan from URL param or localStorage
    if (planParam) {
      const planUpper = planParam.toUpperCase() as PlanName;
      if (['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(planUpper)) {
        setPlan(planUpper);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('autodispatch_selected_plan');
      if (stored && ['ESSENTIALS', 'PRO', 'ENTERPRISE'].includes(stored)) {
        setPlan(stored as PlanName);
      }
    }

    // Load billing from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('autodispatch_billing');
      if (stored === 'yearly' || stored === 'monthly') {
        setBilling(stored);
      }
    }
  }, [planParam]);

  // Auto-redirect to Stripe checkout when plan is in URL (only once)
  useEffect(() => {
    if (plan && plan !== 'ENTERPRISE' && !loading && !checkoutTriggered && planParam) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setCheckoutTriggered(true);
          // Auto-trigger checkout immediately
          handleCheckout();
        } else {
          // Not logged in → redirect to login
          router.push('/login');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, planParam, loading, checkoutTriggered]);


  async function handleCheckout() {
    try {
      setErr(null);
      setLoading(true);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      if (plan === 'ENTERPRISE') {
        window.location.href = 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing';
        return;
      }

      // Load add-ons from localStorage
      const storedAddOns = typeof window !== 'undefined'
        ? localStorage.getItem('autodispatch_addons')
        : null;
      const addOns = storedAddOns ? JSON.parse(storedAddOns) : {};
      const chosenAddOnIds = Object.keys(addOns).filter(k => addOns[k]);

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingCycle: billing,
          addOns: chosenAddOnIds,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const errorMsg = json?.error || 'Checkout failed';
        console.error('[billing] Checkout API error:', errorMsg, json);
        throw new Error(errorMsg);
      }
      if (!json?.url) {
        console.error('[billing] No checkout URL in response:', json);
        throw new Error('No checkout URL received from server');
      }

      // Clear localStorage after successful checkout redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('autodispatch_selected_plan');
        localStorage.removeItem('autodispatch_billing');
        localStorage.removeItem('autodispatch_addons');
      }

      window.location.href = json.url;
    } catch (e: any) {
      setErr(e?.message || 'Checkout error. Please try again.');
      setLoading(false);
    }
  }

  // Show loading state while redirecting to Stripe (but show error if exists)
  if (err) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-600 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Checkout Error</h2>
          <p className="text-neutral-600 mb-6">{err}</p>
          <button
            onClick={() => {
              setErr(null);
              setCheckoutTriggered(false);
              setLoading(false);
            }}
            className="px-6 py-2 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || (checkoutTriggered && plan && plan !== 'ENTERPRISE' && !err)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-neutral-900">Redirecting to checkout...</p>
          <p className="text-sm text-neutral-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Enterprise plan → show Calendly link
  if (plan === 'ENTERPRISE') {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Plan</h1>
            <p className="mt-2 text-neutral-600">Contact our team for custom pricing.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-8 text-center">
            <a
              href="https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Book a Demo
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Subscription</h1>
          <p className="mt-2 text-neutral-600">You're one step away from starting your 14-day free trial.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-8">
          {err && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Continue to Checkout — ${plan} Plan`
            )}
          </button>

          <p className="text-xs text-neutral-500 mt-4 text-center">
            Card required to start trial • Auto-charged after 14 days • Cancel anytime
          </p>
        </div>
      </main>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading...</p>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}

