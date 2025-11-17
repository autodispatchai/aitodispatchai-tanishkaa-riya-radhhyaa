// src/app/choose-plan/page.tsx
'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';
type PlanName = 'ESSENTIALS' | 'PRO' | 'ENTERPRISE';

type Plan = {
  name: PlanName;
  popular: boolean;
  monthly: number | null;
  tagline: string;
  features: string[];
  yearlyDiscount: number;
};

type AddOn = {
  id: string;
  title: string;
  desc: string;
  monthly: number;
};

const PLANS: Plan[] = [
  {
    name: 'ESSENTIALS',
    popular: false,
    monthly: 49,
    tagline: 'Stop drowning in emails. We organize your loads, you close the deals.',
    features: [
      'Smart Email Reader (Reads & adds load emails automatically)',
      'Load Profit Checker (Shows which loads pay best)',
      'Live Dispatch Dashboard (No more spreadsheets)',
      '1-Click Broker Reply (Send offers in seconds)',
      'Standard Email Support',
    ],
    yearlyDiscount: 0.15,
  },
  {
    name: 'PRO',
    popular: true,
    monthly: 79,
    tagline: 'Get a 360°, real-time view of your operations.',
    features: [
      'Everything in ESSENTIALS, PLUS:',
      'Smart Driver Matching (AI matches loads to drivers)',
      'Hot Load Alerts (High-profit load pings)',
      'Live ELD Integration (Samsara)',
      'Auto-Book Trusted Brokers',
      'Advanced Analytics Dashboard',
    ],
    yearlyDiscount: 0.22,
  },
  {
    name: 'ENTERPRISE',
    popular: false,
    monthly: null,
    tagline: 'Your complete, AI-powered dispatch department.',
    features: [
      'Everything in PRO, PLUS:',
      'Advanced Route Optimizer (Profitable triangle loads)',
      'Proactive Problem Solver (Trailer swap suggestions)',
      'Multi-User Roles & Permissions',
      'Dedicated Account Manager & 24/7 Priority Support',
    ],
    yearlyDiscount: 0,
  },
];

const ADD_ONS: AddOn[] = [
  { id: 'city', title: 'City Dispatch Maestro', desc: 'Plans city pickups & deliveries automatically.', monthly: 15 },
  { id: 'highway', title: 'Highway Chess Master', desc: 'Triangle Load Hunter, HOS-aware scheduling, swap suggestions.', monthly: 20 },
  { id: 'bestfinder', title: 'Best Load Finder', desc: 'Pins the most profitable loads across boards automatically.', monthly: 15 },
  { id: 'safety', title: 'AI Safety Supervisor', desc: 'Alerts for overspeeding or harsh braking.', monthly: 10 },
  { id: 'cb', title: 'Cross-Border Compliance', desc: 'Files ACE/ACI e-Manifests automatically.', monthly: 20 },
  { id: 'voice', title: '24/7 Voice & SMS Assistant', desc: 'AI assistant that talks to brokers & drivers.', monthly: 10 },
  { id: 'agent', title: 'Personalized AI Agent', desc: 'Builds relationships with your top brokers.', monthly: 15 },
  { id: 'pay', title: 'Automated Invoicing & Payroll', desc: 'CLERK agent for invoicing + payroll-ready reports.', monthly: 15 },
  { id: 'score', title: 'Broker Scorecard & Risk Alerts', desc: 'Credit/OTR risk & fraud prevention alerts.', monthly: 10 },
];

function priceForCycle(monthly: number, cycle: BillingCycle, discount: number): number {
  if (cycle === 'monthly') return monthly;
  return Math.round(monthly * 12 * (1 - discount));
}

function pct(discount: number): number {
  return Math.round(discount * 100);
}

function ChoosePlanContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  // Load from localStorage on mount
  const [billing, setBilling] = useState<BillingCycle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autodispatch_billing');
      return (saved === 'yearly' || saved === 'monthly') ? saved : 'monthly';
    }
    return 'monthly';
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanName>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autodispatch_plan');
      return (saved === 'ESSENTIALS' || saved === 'PRO' || saved === 'ENTERPRISE') ? saved : 'PRO';
    }
    return 'PRO';
  });
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autodispatch_addons');
      try {
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const plan = useMemo(() => PLANS.find(p => p.name === selectedPlan)!, [selectedPlan]);
  const isEnterprise = plan.monthly == null;

  const planPrice = useMemo(() => {
    if (plan.monthly == null) return 0;
    return priceForCycle(plan.monthly, billing, plan.yearlyDiscount);
  }, [plan, billing]);

  const addOnsMonthlySum = useMemo(
    () => ADD_ONS.filter(a => selectedAddOns[a.id]).reduce((sum, a) => sum + a.monthly, 0),
    [selectedAddOns]
  );

  const addOnsTotal = useMemo(() => {
    if (billing === 'monthly') return addOnsMonthlySum;
    return Math.round(addOnsMonthlySum * 12 * (1 - plan.yearlyDiscount));
  }, [addOnsMonthlySum, billing, plan.yearlyDiscount]);

  const grandTotal = useMemo(() => {
    if (plan.monthly == null) return 0;
    return planPrice + addOnsTotal;
  }, [planPrice, addOnsTotal]);

  function toggleAddOn(id: string) {
    setSelectedAddOns(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('autodispatch_addons', JSON.stringify(updated));
      }
      return updated;
    });
  }

  // Persist billing and plan changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autodispatch_billing', billing);
      localStorage.setItem('autodispatch_plan', selectedPlan);
    }
  }, [billing, selectedPlan]);

  async function handleChoosePlan() {
    if (loading) return;
    
    setLoading(true);
    
    // Store plan selection in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('autodispatch_selected_plan', selectedPlan);
      localStorage.setItem('autodispatch_billing', billing);
      localStorage.setItem('autodispatch_addons', JSON.stringify(selectedAddOns));
    }

    // Check if user is logged in
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const planParam = selectedPlan.toLowerCase();

    if (!session) {
      // User not logged in → go to signup
      window.location.href = `/signup?plan=${planParam}`;
      return;
    }

    // User is logged in → directly create Stripe checkout session
    if (selectedPlan === 'ENTERPRISE') {
      window.location.href = 'https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=billing';
      return;
    }

    try {
      // Get selected add-ons
      const chosenAddOnIds = Object.keys(selectedAddOns).filter(k => selectedAddOns[k]);

      // Create Stripe checkout session directly
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle: billing,
          addOns: chosenAddOnIds,
        }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        const errorMsg = json?.error || 'Checkout failed';
        console.error('[choose-plan] Checkout API error:', errorMsg);
        setLoading(false);
        // Fallback to billing page if checkout fails
        window.location.href = `/billing?plan=${planParam}`;
        return;
      }

      if (!json?.url) {
        console.error('[choose-plan] No checkout URL in response:', json);
        setLoading(false);
        // Fallback to billing page
        window.location.href = `/billing?plan=${planParam}`;
        return;
      }

      // Clear localStorage after successful checkout redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('autodispatch_selected_plan');
        localStorage.removeItem('autodispatch_billing');
        localStorage.removeItem('autodispatch_addons');
      }

      // Redirect directly to Stripe checkout
      window.location.href = json.url;
    } catch (error: any) {
      console.error('[choose-plan] Checkout error:', error);
      setLoading(false);
      // Fallback to billing page on error
      window.location.href = `/billing?plan=${planParam}`;
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
      <header className="py-10 text-center">
        <div className="font-extrabold tracking-tight text-3xl sm:text-4xl">
          Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">Dispatch</span>AI
        </div>
        <p className="text-sm text-neutral-600 mt-2">Choose your plan • 14-day free trial • Cancel anytime</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-[1fr,380px] gap-10">
        <section>
          <div className="flex justify-center mb-8">
            {isEnterprise ? (
              <div className="flex flex-col items-center gap-3">
                <span className="px-4 py-2 rounded-full text-sm font-semibold border bg-neutral-100 text-neutral-900">
                  <span className="font-bold">Custom pricing</span> — Talk to Our Team
                </span>
                <div className="flex gap-3">
                  <a href="https://calendly.com/autodispatchai/enterprise?utm_source=website&utm_medium=choose-plan" target="_blank" rel="noreferrer" className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-medium flex items-center justify-center hover:bg-neutral-800">
                    Book a Demo
                  </a>
                  <a href="mailto:info@autodispatchai.com?subject=AutoDispatchAI%20Enterprise" className="h-10 px-4 rounded-xl border border-neutral-300 text-sm font-medium flex items-center justify-center hover:bg-neutral-50">
                    Email Sales
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 border rounded-full px-2 py-1 bg-neutral-100">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${billing === 'monthly' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-white'}`}
                  onClick={() => setBilling('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${billing === 'yearly' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-white'}`}
                  onClick={() => setBilling('yearly')}
                >
                  Yearly <span className="text-emerald-600 font-semibold ml-1">Save {pct(plan.yearlyDiscount)}%</span>
                </button>
              </div>
            )}
          </div>


          {/* PLANS GRID */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, idx) => {
              const active = p.name === selectedPlan;
              const showSave = p.monthly != null && billing === 'yearly' && p.yearlyDiscount > 0;
              const perCycle = p.monthly != null ? priceForCycle(p.monthly, billing, p.yearlyDiscount) : 0;
              const compareAnnual = p.monthly != null ? p.monthly * 12 : 0;
              const savedAmount = p.monthly != null && billing === 'yearly' ? compareAnnual - perCycle : 0;
              const discountPct = p.monthly != null && billing === 'yearly' ? pct(p.yearlyDiscount) : 0;

              return (
                <motion.button
                  key={p.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedPlan(p.name)}
                  className={`relative text-left border rounded-2xl p-6 shadow-sm transition ${active ? 'border-neutral-900 shadow-md' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-neutral-900 text-white px-3 py-1 rounded-full font-semibold">
                      MOST POPULAR
                    </span>
                  )}
                  {showSave && (
                    <span className="absolute -top-3 right-4 text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-semibold">
                      Save {discountPct}%
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{p.tagline}</p>
                  <div className="mt-5">
                    {p.monthly == null ? (
                      <p className="text-3xl font-bold">Custom</p>
                    ) : (
                      <>
                        <p className="text-3xl font-bold">
                          ${perCycle}
                          <span className="text-base font-normal text-neutral-500"> {billing === 'yearly' ? '/year' : '/month'}</span>
                          <span className="block text-xs text-neutral-500">(per truck)</span>
                        </p>
                        {showSave && (
                          <p className="text-xs text-emerald-600 mt-1">Save ${savedAmount} ({pct(p.yearlyDiscount)}%) yearly</p>
                        )}
                      </>
                    )}
                  </div>
                  <ul className="mt-5 text-sm text-neutral-800 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-[6px] block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* ADD-ONS */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold">Build Your Own Add-Ons</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Select add-ons to include with <span className="font-medium">{selectedPlan}</span>. Each add-on is billed per truck, per {isEnterprise ? '—' : (billing === 'yearly' ? 'year' : 'month')}.
            </p>
            <div className="mt-6 grid gap-3">
              {ADD_ONS.map((a) => {
                const cyclePrice = isEnterprise
                  ? a.monthly
                  : (billing === 'monthly' ? a.monthly : Math.round(a.monthly * 12 * (1 - plan.yearlyDiscount)));

                return (
                  <label
                    key={a.id}
                    className={`flex items-start gap-3 border rounded-xl p-4 ${isEnterprise ? 'opacity-60' : 'hover:bg-neutral-50 cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!!selectedAddOns[a.id]}
                      onChange={() => toggleAddOn(a.id)}
                      disabled={isEnterprise}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{a.title}</span>
                        <span className="text-sm font-medium">
                          +${cyclePrice} {isEnterprise ? '' : ` / ${billing === 'yearly' ? 'year' : 'month'}`}{' '}
                          <span className="text-xs text-neutral-500">(per truck)</span>
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">{a.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* SUMMARY SIDEBAR */}
        <aside className="sticky top-6 h-fit border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="text-sm text-neutral-500">Per truck • {isEnterprise ? 'Custom' : (billing === 'yearly' ? 'Yearly' : 'Monthly')} billing</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Plan — {plan.name}</span>
              <span>{isEnterprise ? 'Custom' : `$${planPrice}`}</span>
            </div>
            {!isEnterprise && ADD_ONS.filter(a => selectedAddOns[a.id]).map(a => {
              const c = billing === 'monthly' ? a.monthly : Math.round(a.monthly * 12 * (1 - plan.yearlyDiscount));
              return (
                <div key={a.id} className="flex justify-between text-neutral-700">
                  <span>+ {a.title}</span>
                  <span>${c}</span>
                </div>
              );
            })}
            <hr className="my-3" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{isEnterprise ? 'Contact Sales' : `$${grandTotal}`}</span>
            </div>
          </div>
          {isLoggedIn === false ? (
            <div className="mt-5 space-y-3">
              <Link
                href={`/signup?plan=${selectedPlan.toLowerCase()}`}
                className="block h-11 w-full rounded-xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {plan.name === 'ENTERPRISE' ? (
                  'Talk to Our Team'
                ) : (
                  `Sign up for ${plan.name} Plan`
                )}
              </Link>
              <div className="text-center">
                <p className="text-xs text-neutral-500">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleChoosePlan}
                disabled={loading || isEnterprise}
                className="mt-5 h-11 w-full rounded-xl font-semibold tracking-tight bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : plan.name === 'ENTERPRISE' ? (
                  'Talk to Our Team'
                ) : (
                  `Choose ${plan.name} Plan`
                )}
              </button>
              <p className="text-xs text-neutral-500 mt-3 text-center">
                Card required to start trial • Auto-charged after 14 days • Cancel anytime
              </p>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading plans...</p>
        </div>
      </div>
    }>
      <ChoosePlanContent />
    </Suspense>
  );
}