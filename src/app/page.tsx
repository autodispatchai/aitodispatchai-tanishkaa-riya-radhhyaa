'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Lock,
  Shield,
  Truck,
  Check,
  Info,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

/* =========================================================
   TYPES
========================================================= */
type Theme = {
  border: string;
  ring: string;
  glow: string;
  grad: string;
};

/* =========================================================
   AUTH CHECKER COMPONENT (FIXED: loading state + no redirect loops)
========================================================= */
function AuthChecker({ router }: { router: any }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  React.useEffect(() => {
    if (checkedRef.current) return;
    
    const checkAuth = async () => {
      try {
        checkedRef.current = true;
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', session.user.id)
            .maybeSingle();

          if (company) {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('company_id', company.id)
              .eq('status', 'active')
              .maybeSingle();

            if (subscription) {
              router.replace('/dashboard');
              return;
            } else {
              // Company exists but no subscription → redirect to choose-plan
              router.replace('/choose-plan');
              return;
            }
          } else {
            // No company → redirect to onboarding
            router.replace('/onboarding/create-company');
            return;
          }
        }

        const code = searchParams.get('code');
        if (code) {
          const { data: { session: newSession } } = await supabase.auth.exchangeCodeForSession(code);
          if (newSession) {
            const { data: company } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', newSession.user.id)
              .maybeSingle();

            if (company) {
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('company_id', company.id)
                .eq('status', 'active')
                .maybeSingle();

              if (subscription) {
                router.replace('/dashboard');
              } else {
                router.replace('/choose-plan');
              }
            } else {
              router.replace('/onboarding/create-company');
            }
          }
        }

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session && !checkedRef.current) {
            checkedRef.current = true;
            const { data: company } = await supabase
              .from('companies')
              .select('id')
              .eq('owner_id', session.user.id)
              .maybeSingle();

            if (company) {
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('company_id', company.id)
                .eq('status', 'active')
                .maybeSingle();

              if (subscription) {
                router.replace('/dashboard');
              } else {
                router.replace('/choose-plan');
              }
            } else {
              router.replace('/onboarding/create-company');
            }
          }
        });

        return () => {
          listener?.subscription?.unsubscribe();
        };
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  if (loading) {
    return <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500"></div>;
  }

  return null;
}

/* =========================================================
   PAGE
========================================================= */
export default function LandingPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* AUTH CHECKER — SUSPENSE MEIN */}
      <Suspense fallback={<div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500"></div>}>
        <AuthChecker router={router} />
      </Suspense>

      {/* ================= HEADER ================= */}
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="py-24 text-center px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="block bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            Your Dispatcher Never Sleeps.
          </span>
          <span className="block mt-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
            Neither Should Your Profits.
          </span>
        </h1>
        <p className="max-w-4xl mx-auto mt-6 text-xl text-neutral-700">
          AI dispatch automation for modern fleets — your 24/7 digital dispatcher that finds loads, negotiates, tracks, and notifies.
          Built by dispatchers & engineers. Cross-border ready.
        </p>
        <div className="mt-6 flex justify-center">
          <span className="text-sm rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1">
            Human-in-the-loop • Up to 80% automation*
          </span>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/choose-plan" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition-opacity text-base">
            Choose Plan
          </a>
          <a href="/signup" className="px-7 py-3.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 text-base">
            Start 14-Day Trial
          </a>
          <a href="#features" className="px-7 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-base">
            Explore Features
          </a>
        </div>
        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-neutral-700 text-[15px]">
          <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-600" /> SOC 2 program in progress</div>
          <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-emerald-600" /> Gmail & Outlook live</div>
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-600" /> RLS & least-privilege</div>
        </div>
      </section>

      {/* ================= PREMIUM INTEGRATION TICKER ================= */}
      <IntegrationTicker />

      {/* ================= FEATURES (hover/tap popovers) ================= */}
      <section id="features" className="py-20 border-t border-neutral-200 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight">All-in-one dispatch cockpit</h2>
            <p className="mt-3 text-lg text-neutral-700">Win better loads faster — in one clean, modern app.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.title}
                index={i}
                title={f.title}
                desc={f.desc}
                example={f.example}
                theme={f.theme}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY FLEETS CHOOSE ================= */}
      <section id="why-fleets" className="py-16 px-4 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Why fleets choose AutoDispatchAI</h2>
            <p className="mt-3 text-neutral-600">Smart Load Bot • Live Ops Map • Border-Ready</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Smart Load Bot', d: 'Auto-search & shortlist loads (LTL/FTL) with target RPM.' },
              { t: 'Live Ops Map', d: 'Real-time GPS (Samsara), ETAs, and exception alerts.' },
              { t: 'Border-Ready', d: 'eManifest automation (US↔CA) with status updates.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="font-semibold text-lg">{c.t}</div>
                <p className="mt-2 text-[15px] text-neutral-700">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= IMPACT ================= */}
      <section id="impact" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Real impact, real savings</h2>
            <p className="mt-3 text-neutral-600">Early pilots with human-in-the-loop show strong gains for busy dispatch teams.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                Up to 80%
              </div>
              <div className="mt-1 text-lg font-semibold">Workflows automated</div>
              <p className="mt-2 text-[15px] text-neutral-700">Email triage, matching, draft replies, status updates</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                30–50%
              </div>
              <div className="mt-1 text-lg font-semibold">Planner time saved</div>
              <p className="mt-2 text-[15px] text-neutral-700">Fewer tabs; faster, guard-railed approvals</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                3–7%
              </div>
              <div className="mt-1 text-lg font-semibold">Margin lift</div>
              <p className="mt-2 text-[15px] text-neutral-700">Faster replies, better RPM discipline, fewer misses</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            *Directional estimates from early pilots and internal benchmarks; results vary by fleet size, lanes, and workflow.
          </p>
        </div>
      </section>

      {/* ================= ROI: CALCULATOR + NARRATIVE CAROUSEL ================= */}
      <section id="roi" className="py-16 px-4 bg-neutral-50">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-start">
          {/* LEFT: Calculator */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur">
            <div className="h-2 rounded-t-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
            <div className="p-6">
              <h2 className="text-2xl font-bold tracking-tight">Estimate your savings</h2>
              <p className="mt-2 text-neutral-700">Quick back-of-the-envelope: time saved × cost per hour.</p>

              <ROIForm />

              <p className="mt-3 text-xs text-neutral-500">
                Example: 10 dispatchers ≈ $60k/mo → after: 4 dispatchers + platform ≈ $19k/mo →
                <strong> $40k+/mo saved</strong> for a 100-truck fleet (varies).
              </p>

              <div className="mt-6">
                <a
                  href="/about-us"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                  aria-label="About Us"
                >
                  About Us
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Story carousel */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur overflow-hidden">
            <div className="h-2 bg-neutral-100" />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">How the savings actually show up</h3>
                  <p className="text-[15px] text-neutral-600 leading-snug">
                    A simple before→after story, animated right to left.
                  </p>
                </div>
                <span className="text-[11px] text-neutral-500 px-2 py-1 rounded border border-neutral-200">
                  Hover to pause
                </span>
              </div>

              <SavingsStoryCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MID-PAGE CTA STRIP ================= */}
      <section className="px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 p-[1px]">
            <div className="rounded-2xl bg-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Ready to try it on your lanes?</h3>
                <p className="text-neutral-700 mt-1">Connect inbox, set guardrails, and see results in days — not months.</p>
              </div>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                aria-label="Start 14-Day Trial"
                data-cta="trial"
                data-location="mid-strip"
              >
                Start 14-Day Trial →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HUMAN + AI LOOP ================= */}
      <section id="how-it-works" className="py-20 px-4 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Human + AI, one continuous loop</h2>
            <p className="mt-3 text-neutral-600">AI does the grunt work; your team stays in control. Review → Approve → Scale.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { n: '1', t: 'Scan & Classify', d: 'AI reads emails & load boards 24/7 — zero missed opportunities.' },
              { n: '2', t: 'Match & Recommend', d: 'Suggests profitable driver↔load pairs by lane, HOS & RPM.' },
              { n: '3', t: 'Negotiate & Book', d: 'Generates replies and books trusted brokers with your approval.' },
              { n: '4', t: 'Track & Update', d: 'Live status, docs, and alerts roll up to the dashboard automatically.' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : i * 0.05 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-neutral-200 p-5 bg-white"
              >
                <div className="text-sm text-neutral-500">Step {s.n}</div>
                <div className="mt-1 font-semibold text-lg">{s.t}</div>
                <p className="mt-2 text-[15px] text-neutral-700">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOUR STEPS ================= */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Your Dispatch, Fully Automated</h2>
            <p className="mt-3 text-neutral-600">Four steps to value — simple for trucking teams</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { t: 'Ingest', d: 'Secure login (Supabase). Connect Gmail/Outlook for load emails; Samsara for GPS/HOS.' },
              { t: 'Discover', d: 'AI spots good lanes near your drops and ranks loads by RPM & fit.' },
              { t: 'Book', d: 'AI drafts broker replies with guardrails. You approve — we send and confirm.' },
              { t: 'Deliver', d: 'Driver updates auto-sync. RateCon & POD tracked; invoice handoff is one click.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="font-semibold text-lg">{c.t}</div>
                <p className="mt-2 text-[15px] text-neutral-700">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY WE BUILT THIS (story + CTA) ================= */}
      <section id="why" className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Built for real fleets, not demos</h2>
            <p className="mt-4 text-neutral-700 text-[16px] leading-7">
              Dispatch is chaos — missed emails, slow replies, wrong pairings, and money left on the table.
              AutoDispatchAI gives carriers a calm cockpit: load intel in one place, smart matching, guard-railed replies,
              and live status without spreadsheet drama.
            </p>
            <ul className="mt-6 space-y-3 text-[15.5px] text-neutral-800">
              {[
                { h: 'Cut manual triage', s: 'The system reads and organizes your load emails.' },
                { h: 'See true profit first', s: 'Check RPM and fit before you commit.' },
                { h: 'Keep humans in control', s: 'The AI proposes; you approve with guardrails.' },
                { h: 'Scale with trust', s: 'Audit trail, RLS, SOC 2 program in progress.' },
              ].map((item) => (
                <li key={item.h} className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-1 text-emerald-600" />
                  <span><span className="font-medium">{item.h} — </span>{item.s}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Start 14-Day Trial <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
            <div className="p-6">
              <SectionStorySlide />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="py-20 px-4 bg-neutral-50 text-center">
        <h3 className="text-3xl font-bold">Questions?</h3>
        <p className="text-neutral-600 mt-2 mb-6">We reply fast during business hours.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:info@autodispatchai.com"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90"
          >
            info@autodispatchai.com
          </a>
          <a
            href="tel:+14164274542"
            className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
          >
            Call +1 (416) 427-4542
          </a>
        </div>
      </section>

      {/* ================= FAQ (trimmed) ================= */}
      <FAQSection />

    </div>
  );
}


/* ============ PREMIUM INTEGRATION TICKER ============ */
function IntegrationTicker() {
  const [paused, setPaused] = useState(false);

  const brands = [
    { name: 'Gmail', color: 'text-[#DB4437]' },
    { name: 'Outlook', color: 'text-[#0A66C2]' },
    { name: 'C.H. Robinson', color: 'text-neutral-800' },
    { name: 'Loadlink', color: 'text-neutral-800' },
    { name: 'Coyote', color: 'text-[#1DB954]' },
    { name: 'Landstar', color: 'text-[#1DA1F2]' },
    { name: 'TQL', color: 'text-[#6D28D9]' },
    { name: 'Schneider', color: 'text-[#F97316]' },
    { name: 'JB Hunt', color: 'text-[#EAB308]' },
    { name: 'ArcBest', color: 'text-neutral-800' },
    { name: 'Twilio', color: 'text-[#E31B23]' },
    { name: 'Motive', color: 'text-[#10B981]' },
    { name: 'Samsara', color: 'text-[#06B6D4]' },
    { name: 'n8n Automations', color: 'text-[#DB2777]' },
    { name: 'BorderConnect', color: 'text-[#6366F1]' },
    { name: 'TriumphPay', color: 'text-neutral-800' },
    { name: 'Project44', color: 'text-neutral-800' },
    { name: 'FourKites', color: 'text-neutral-800' },
    { name: 'ELD Integrations', color: 'text-neutral-800' },
  ];

  const nb = (s: string) => s.replace(/ /g, '\u00A0');

  const Track = ({ offset = 0 }: { offset?: number }) => (
    <motion.div
      className="absolute left-0 top-1/2 -translate-y-1/2 flex whitespace-nowrap"
      animate={paused ? {} : { x: ['0%', '-50%'] }}
      transition={
        paused
          ? {}
          : { repeat: Infinity, duration: 45, ease: 'linear', delay: offset }
      }
    >
      {brands.map((b, i) => (
        <div key={`${b.name}-${i}`} className="flex items-center">
          <span
            className={`mx-8 text-[17px] md:text-[19px] font-semibold italic tracking-wide ${b.color} hover:text-neutral-900 transition-colors`}
          >
            {nb(b.name)}
          </span>
          <span className="text-neutral-300 select-none">•</span>
        </div>
      ))}
    </motion.div>
  );

  return (
    <section
      className="relative bg-white border-y border-neutral-200"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Trusted integrations and API network"
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
          <h3 className="text-[14px] md:text-sm font-semibold text-neutral-700 tracking-wide">
            Integrations —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 font-bold">
              API&nbsp;&amp;&nbsp;Connectors
            </span>
          </h3>
          <p className="hidden md:block text-xs text-neutral-500">
            Works with major brokers, load boards, ELDs, and messaging tools — secured via least-privilege API access.
          </p>
        </div>

        <div className="relative h-12 md:h-14 overflow-hidden rounded-xl">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <div className="h-full w-[160%] -translate-x-1/8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600 via-purple-600 to-fuchsia-500 blur-3xl" />
          </div>

          <Track />
          <Track offset={0} />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURES — CARDS WITH HOVER/TAP POPOVERS
========================================================= */
const FEATURES: Array<{
  title: string;
  desc: string;
  example: React.ReactNode;
  theme: Theme;
}> = [
  {
    title: 'Smart Email Reader',
    desc: 'Reads load emails and extracts lanes, RPM, pickup/delivery windows — auto-adds to your queue.',
    theme: {
      border: 'border-fuchsia-300',
      ring: 'ring-fuchsia-400/30',
      glow: 'shadow-[0_10px_30px_rgba(217,70,239,.15)]',
      grad: 'from-fuchsia-500 via-pink-500 to-rose-500',
    },
    example: (
      <PreviewStory
        title="Email → Structured load"
        subtitle="The bot parses broker emails and fills your load queue automatically."
        lines={[
          'Lane: Toronto, ON → Chicago, IL',
          'Pickup: Mon 9:00–12:00 • Delivery: Tue 8:00–16:00',
          'Equipment: 53’ Dry Van • RPM target: $2.65',
          'Next: Auto-queue + driver matches suggested',
        ]}
      />
    ),
  },
  {
    title: 'Hot Load Alerts',
    desc: 'Instant pings for high-profit loads that match your lanes & driver availability.',
    theme: {
      border: 'border-amber-300',
      ring: 'ring-amber-400/30',
      glow: 'shadow-[0_10px_30px_rgba(251,191,36,.18)]',
      grad: 'from-amber-500 via-orange-500 to-yellow-500',
    },
    example: (
      <PreviewStory
        title="Right load, right time"
        subtitle="We ping you when a high-RPM lane appears near available drivers."
        lines={[
          '🔥 CHI → DAL (RPM trending ↑)',
          'Pickup: Today 14:00 • Driver #27 9h HOS',
          'ETA meets window • Suggested counter ready',
        ]}
      />
    ),
  },
  {
    title: 'AI Negotiator',
    desc: 'Prepares broker replies with your target RPM and guardrails — you approve, we send.',
    theme: {
      border: 'border-sky-300',
      ring: 'ring-sky-400/30',
      glow: 'shadow-[0_10px_30px_rgba(56,189,248,.15)]',
      grad: 'from-sky-500 via-cyan-500 to-teal-500',
    },
    example: (
      <PreviewStory
        title="One-tap counter"
        subtitle="Draft replies keep margin discipline while speeding up bookings."
        lines={[
          'Subject: Re: TOR → CHI 53’ Dry',
          'We can take this at $2.75 RPM all-in.',
          'Window ok • Driver ready 10am • Please confirm',
        ]}
        code
      />
    ),
  },
  {
    title: 'Driver Matching',
    desc: 'AI pairs loads to drivers using hometime, HOS, lane history, and equipment type.',
    theme: {
      border: 'border-emerald-300',
      ring: 'ring-emerald-400/30',
      glow: 'shadow-[0_10px_30px_rgba(16,185,129,.16)]',
      grad: 'from-emerald-500 via-green-500 to-lime-500',
    },
    example: (
      <PreviewStory
        title="Best-fit matches"
        subtitle="HOS + location + lane history + equipment preference."
        lines={[
          '• #12 Singh — 8h HOS • 12km from pickup',
          '• #27 Riya — loves CHI lane • home Fri',
          '• #33 Tan — team-ready • Reefer-capable',
        ]}
      />
    ),
  },
  {
    title: 'Live Ops Dashboard',
    desc: 'One screen for ETAs, docs, notes, and exceptions — no more spreadsheets.',
    theme: {
      border: 'border-violet-300',
      ring: 'ring-violet-400/30',
      glow: 'shadow-[0_10px_30px_rgba(139,92,246,.16)]',
      grad: 'from-violet-500 via-purple-500 to-fuchsia-500',
    },
    example: (
      <PreviewStory
        title="All signals, one cockpit"
        subtitle="ETAs, delays, docs — prioritized and clear."
        lines={['6 active • 1 delay risk • 2 docs pending', 'Exceptions bubble to top • Notes centralized']}
      />
    ),
  },
  {
    title: 'Cross-Border Ready',
    desc: 'ACE/ACI e-Manifests workflow designed for US↔CA carriers (coming soon).',
    theme: {
      border: 'border-rose-300',
      ring: 'ring-rose-400/30',
      glow: 'shadow-[0_10px_30px_rgba(244,63,94,.15)]',
      grad: 'from-rose-500 via-red-500 to-orange-500',
    },
    example: (
      <PreviewStory
        title="Border without drama"
        subtitle="Guided steps keep drivers moving and ops informed."
        lines={['1) Docs check  2) ACE create  3) Driver notify', '4) Status watch • Flags on exceptions']}
      />
    ),
  },
];

function FeatureCard({
  index,
  title,
  desc,
  example,
  theme,
}: {
  index: number;
  title: string;
  desc: string;
  example: React.ReactNode;
  theme: Theme;
}) {
  const [active, setActive] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const openAbove = index < 3;
  const open = active;

  return (
    <div
      className={`relative rounded-2xl border p-6 bg-white transition ${theme.border} hover:shadow-md hover:ring-2 ${theme.ring} cursor-help`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onClick={() => setActive((v) => !v)} // mobile tap
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${title} — hover or tap to preview`}
    >
      <h3 className="font-semibold text-[18px]">{title}</h3>
      <p className="mt-2 text-[15.5px] leading-7 text-neutral-700">{desc}</p>

      {/* Hover/Tap hint */}
      <motion.div
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.6 }}
        className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1 shadow-sm text-[11px] text-neutral-600"
      >
        <Info className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Hover to preview</span>
        <span className="md:hidden">Tap</span>
      </motion.div>

      {/* Floating preview (desktop) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : (openAbove ? 10 : -10), scale: prefersReducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : (openAbove ? 10 : -10), scale: prefersReducedMotion ? 1 : 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            className={`hidden md:block absolute left-1/2 -translate-x-1/2 z-40 w-[520px] ${
              openAbove ? 'bottom-[calc(100%+14px)]' : 'top-[calc(100%+14px)]'
            }`}
          >
            <div className={`rounded-2xl border bg-white shadow-xl ${theme.border} ${theme.glow}`}>
              <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${theme.grad}`} />
              <div className="p-5">{example}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile inline expand */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="block md:hidden mt-4"
          >
            <div className={`rounded-2xl border bg-white p-5 shadow ${theme.border}`}>
              <div className={`h-2 rounded-t-xl -mt-5 -mx-5 mb-4 bg-gradient-to-r ${theme.grad}`} />
              {example}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreviewStory({
  title,
  subtitle,
  lines,
  code,
}: {
  title: string;
  subtitle?: string;
  lines: string[];
  code?: boolean;
}) {
  return (
    <div>
      <div className="text-[15.5px] font-semibold">{title}</div>
      {subtitle && <div className="text-[13px] text-neutral-500 mt-1">{subtitle}</div>}
      <div
        className={`mt-3 rounded-xl border border-neutral-200 p-4 bg-white ${
          code ? 'font-mono text-[12px] leading-6' : 'text-[14.5px] leading-7'
        }`}
      >
        {lines.map((l, idx) => (
          <div key={idx}>{l}</div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-neutral-500 italic">story preview — quick peek of the next steps</div>
    </div>
  );
}

/* ROI FORM */
function ROIForm() {
  const [wage, setWage] = useState<number>(35);
  const [hours, setHours] = useState<number>(15);
  const [planners, setPlanners] = useState<number>(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (wage < 0 || wage > 200) errs.wage = 'Wage must be between $0 and $200/hr';
    if (hours < 0 || hours > 160) errs.hours = 'Hours must be between 0 and 160/month';
    if (planners < 1 || planners > 50) errs.planners = 'Planners must be between 1 and 50';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWageChange = (val: number) => {
    setWage(val);
    if (errors.wage) validate();
  };

  const handleHoursChange = (val: number) => {
    setHours(val);
    if (errors.hours) validate();
  };

  const handlePlannersChange = (val: number) => {
    setPlanners(val);
    if (errors.planners) validate();
  };

  const monthly = Math.max(0, Math.round(wage * hours * planners));
  const yearly = monthly * 12;

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="text-sm">
          <div className="text-neutral-600 mb-1">Dispatcher cost ($/hr)</div>
          <input
            type="number"
            min={0}
            max={200}
            step="1"
            value={wage}
            onChange={(e) => handleWageChange(Number(e.target.value))}
            onBlur={validate}
            className={`w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              errors.wage ? 'border-red-300' : 'border-neutral-300'
            }`}
          />
          {errors.wage && <p className="mt-1 text-xs text-red-600">{errors.wage}</p>}
        </label>
        <label className="text-sm">
          <div className="text-neutral-600 mb-1">Hours saved / mo (per planner)</div>
          <input
            type="number"
            min={0}
            max={160}
            step="1"
            value={hours}
            onChange={(e) => handleHoursChange(Number(e.target.value))}
            onBlur={validate}
            className={`w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              errors.hours ? 'border-red-300' : 'border-neutral-300'
            }`}
          />
          {errors.hours && <p className="mt-1 text-xs text-red-600">{errors.hours}</p>}
        </label>
        <label className="text-sm">
          <div className="text-neutral-600 mb-1"># of planners</div>
          <input
            type="number"
            min={1}
            max={50}
            step="1"
            value={planners}
            onChange={(e) => handlePlannersChange(Number(e.target.value))}
            onBlur={validate}
            className={`w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              errors.planners ? 'border-red-300' : 'border-neutral-300'
            }`}
          />
          {errors.planners && <p className="mt-1 text-xs text-red-600">{errors.planners}</p>}
        </label>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-xs text-neutral-500">Estimated monthly savings</div>
          <div className="mt-1 text-2xl font-extrabold">${monthly.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-xs text-neutral-500">Estimated yearly savings</div>
          <div className="mt-1 text-2xl font-extrabold">${yearly.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

/* Savings carousel */
function SavingsStoryCarousel() {
  const slides = useMemo(
    () => [
      {
        tag: 'Before',
        title: '10 dispatchers @ $30/hr (Canada avg)',
        lines: [
          '40 hrs/week each = 1,600 hrs/mo',
          'Monthly cost ≈ $48,000 (plus overhead)',
          'Email triage + load matching mostly manual',
        ],
      },
      {
        tag: 'After',
        title: '4 dispatchers + AutoDispatchAI',
        lines: [
          'Saved 60–70% planner hours',
          'Monthly cost ≈ $19,000 (incl. platform)',
          'AI drafting + matching + alerts = faster bookings',
        ],
      },
      {
        tag: 'Result',
        title: 'Savings ≈ $25k–$40k/mo',
        lines: [
          'Fewer misses, tighter RPM discipline',
          'Faster replies, higher hit-rate',
          'Audit trail + human approvals',
        ],
      },
      {
        tag: 'Scale',
        title: '100-truck fleet, cross-border ready',
        lines: ['Samsara HOS, email parsing, negotiation', 'Guard-rails you control', '24×7 AI + human loop'],
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = window.setInterval(() => {
      setIdx((p) => (p + 1) % slides.length);
    }, 5000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, slides.length]);

  return (
    <div
      className="mt-5 rounded-xl border border-neutral-200 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
      <div className="relative h-60">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 p-5 grid grid-rows-[auto_1fr]"
          >
            <div className="text-xs uppercase tracking-widest text-neutral-500">{slides[idx].tag}</div>
            <div>
              <div className="mt-1 text-lg font-semibold">{slides[idx].title}</div>
              <ul className="mt-3 space-y-2 text-[15px] text-neutral-700">
                {slides[idx].lines.map((l: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/60">
        <div className="flex gap-2">
          {slides.map((_slide: any, i: number) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-neutral-900' : 'w-2.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-500">{paused ? 'Paused (hover)' : 'Auto-playing'}</span>
      </div>
    </div>
  );
}

/* Section story slide */
function SectionStorySlide() {
  const cards = useMemo(
    () => [
      {
        h: 'Calm cockpit',
        p: 'All signals on one screen — ETAs, docs, exceptions — no spreadsheet drama.',
      },
      {
        h: 'Guard-railed AI',
        p: 'AI drafts, you approve. Keep control while moving faster.',
      },
      {
        h: 'Cross-border',
        p: 'ACE/ACI workflow ready. Keep drivers moving, ops informed.',
      },
    ],
    []
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % cards.length), 5000);
    return () => clearInterval(t);
  }, [cards.length]);

  return (
    <div className="relative h-56">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 rounded-xl border border-neutral-200 p-5 bg-white"
        >
          <div className="text-sm text-neutral-500">Story</div>
          <div className="mt-1 text-xl font-semibold">{cards[i].h}</div>
          <p className="mt-3 text-[15px] text-neutral-700 leading-7">{cards[i].p}</p>
          <div className="mt-4 text-xs text-neutral-500">Auto-advances every 5s</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ================= FAQ Section ================= */
function FAQSection() {
  const faqs = [
    { q: 'What exactly is AutoDispatchAI?', a: 'An AI-assisted dispatch platform that reads emails, finds and negotiates loads, matches drivers, and updates ops with a human-in-the-loop.' },
    { q: 'Is there a free trial?', a: 'Yes — 14 days on all plans.' },
    { q: 'Does it work with my ELD?', a: 'Gmail/Outlook are live. Samsara/Motive integrations are in progress with HOS/location sync.' },
    { q: 'What about cross-border?', a: 'ACE/ACI e-Manifest workflow is designed for US↔CA carriers (coming soon).' },
    { q: 'Is my data secure?', a: 'Least-privilege access, Row Level Security, encryption in transit/at rest; SOC 2 program in progress.' },
    { q: 'How long does onboarding take?', a: 'Most fleets see value in week 1. Inbox connect is minutes; guardrails same day.' },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold tracking-tight text-center mb-10">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-4 text-left font-medium flex items-center justify-between"
              >
                <span>{f.q}</span>
                <span className="text-neutral-400">{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-[15px] text-neutral-700 leading-7"
                  >
                    {f.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}