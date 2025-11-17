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
        throw new Error(json?.error || 'Checkout failed');
      }
      if (!json?.url) throw new Error('No checkout URL');

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

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Subscription</h1>
          <p className="mt-2 text-neutral-600">You're one step away from starting your 14-day free trial.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Selected Plan</span>
              <span className="text-lg font-bold">{plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Billing Cycle</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    billing === 'monthly'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    billing === 'yearly'
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

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

