// src/app/billing/choose-plan/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

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
  { id: 'city',       title: 'City Dispatch Maestro',  desc: 'Plans city0 pickups & deliveries automatically.', monthly: 15 },
  { id: 'highway',    title: 'Highway Chess Master',   desc: 'Triangle Load Hunter, HOS-aware scheduling.', monthly: 20 },
  { id: 'bestfinder', title: 'Best Load Finder',       desc: 'Pins the most profitable loads automatically.', monthly: 15 },
  { id: 'safety',     title: 'AI Safety Supervisor',   desc: 'Alerts for overspeeding or harsh braking.', monthly: 10 },
  { id: 'cb',         title: 'Cross-Border Compliance', desc: 'Files ACE/ACI e-Manifests automatically.', monthly: 20 },
  { id: 'voice',      title: '24/7 Voice & SMS Assistant', desc: 'AI assistant that talks to brokers & drivers.', monthly: 10 },
  { id: 'agent',      title: 'Personalized AI Agent',  desc: 'Builds relationships with your top brokers.', monthly: 15 },
  { id: 'pay',        title: 'Automated Invoicing & Payroll', desc: 'CLERK agent for invoicing + payroll.', monthly: 15 },
  { id: 'score',      title: 'Broker Scorecard & Risk Alerts', desc: 'Credit/OTR risk & fraud prevention.', monthly: 10 },
];

function priceForCycle(monthly: number, cycle: BillingCycle, discount: number): number {
  if (cycle === 'monthly') return monthly;
  return Math.round(monthly * 12 * (1 - discount));
}
function pct(discount: number): number { return Math.round(discount * 100); }

export default function ChoosePlanPage() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('PRO');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    setSelectedAddOns(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function checkout() {
    try {
      setErr(null);
      setLoading(true);

      if (plan.name === 'ENTERPRISE') {
        window.location.href = 'mailto:info@autodispatchai.com?subject=AutoDispatchAI%20Enterprise';
        return;
      }

      const chosenAddOnIds = Object.keys(selectedAddOns).filter(k => selectedAddOns[k]);

      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,        // FIXED: selectedPlan (not plan.name)
          billing: billing,
          addOns: chosenAddOnIds,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || 'Checkout failed');
      }

      if (!json?.url) {
        throw new Error('No checkout URL');
      }

      window.location.href = json.url;

    } catch (e: any) {
      console.error('Checkout error:', e);
      setErr(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
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
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            {isEnterprise ? (
              <div className="flex flex-col items-center gap-3">
                <span className="px-4 py-2 rounded-full text-sm font-semibold border bg-neutral-100 text-neutral-900">
                  <span className="font-bold">Custom pricing</span> — Contact Sales
                </span>
                <div className="flex gap-3">
                  <a href="mailto:info@autodispatchai.com?subject=AutoDispatchAI%20Enterprise" className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-medium flex items-center justify-center hover:bg-neutral-800">
                    Email Sales
                  </a>
                  <a href="tel:+14164274542" className="h-10 px-4 rounded-xl border border-neutral-300 text-sm font-medium flex items-center justify-center hover:bg-neutral-50">
                    Call Sales (+1 416-427-4542)
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

          {/* ERROR */}
          {err && (
            <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center font-medium">
              ERROR: {err}
            </div>
          )}

          {/* PLANS GRID */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, idx) => {
              const active = p.name === selectedPlan;
              const showSave = p.monthly != null && billing === 'yearly' && p.yearlyDiscount > 0;
              const perCycle = p.monthly != null ? priceForCycle(p.monthly, billing, p.yearlyDiscount) : 0;
              const savedAmount = p.monthly != null && billing === 'yearly' ? p.monthly * 12 - perCycle : 0;

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
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-neutral-900 text-white px-3 py-1 rounded-full">
                      MOST POPULAR
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
              Select add-ons to include with <span className="font-medium">{selectedPlan}</span>.
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

        {/* SUMMARY + BUTTONS */}
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

          <div className="mt-5 space-y-3">
            {/* START TRIAL BUTTON */}
            <button
              onClick={checkout}
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition"
            >
              {loading ? 'Processing…' : 'Start 14-Day Free Trial'}
            </button>

            {/* JUST VIEW PRICING BUTTON — FIXED */}
            <button
              type="button"
              onClick={() => {}}
              className="w-full h-11 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Just View Pricing
            </button>
          </div>

          <p className="text-xs text-neutral-500 mt-4 text-center">
            Card required to start trial • Auto-charged after 14 days • Cancel anytime
          </p>
        </aside>
      </main>
    </div>
  );
}