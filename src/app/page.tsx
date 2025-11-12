// src/app/page.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Menu,
  X,
  Lock,
  Shield,
  Truck,
  Check,
  Info,
} from 'lucide-react';

/* =========================================================
   PAGE
========================================================= */
type Theme = {
  border: string;
  ring: string;
  glow: string;
  grad: string;
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Client-side redirect to /dashboard if session + active subscription
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('autodispatch_session');
      const subscription = localStorage.getItem('autodispatch_subscription');
      if (session && subscription === 'active') {
        window.location.href = '/dashboard';
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* ================= HEADER ================= */}
      <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

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
                  href="#team"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                  aria-label="Book a 15-minute demo"
                >
                  Book a 15-minute demo
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
      <section id="loop" className="py-20 px-4 bg-neutral-50">
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
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
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
      <section id="steps" className="py-16 px-4">
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

            {/* ================= TEAM (Leadership + Departments) ================= */}
      <TeamSection />

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

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-neutral-200 py-10 text-center text-sm text-neutral-600">
        <p>© {new Date().getFullYear()} AutoDispatchAI Inc., Canada</p>
        <p className="mt-2 flex flex-wrap gap-4 justify-center">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/security" className="hover:underline">Security</a>
          <a href="mailto:info@autodispatchai.com" className="hover:underline">info@autodispatchai.com</a>
        </p>
      </footer>
    </div>
  );
}

/* ================= Header Component ================= */
function Header({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void; }) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between gap-3">
        <a href="/" aria-label="AutoDispatchAI" className="flex items-center gap-2">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="font-extrabold tracking-tight text-2xl sm:text-3xl"
          >
            Auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Dispatch
            </span>
            AI
          </motion.span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-[15px]">
            <a href="#features" className="hover:text-purple-700">Features</a>
            <a href="#why-fleets" className="hover:text-purple-700">Why Fleets</a>
            <a href="#impact" className="hover:text-purple-700">Impact</a>
            <a href="#roi" className="hover:text-purple-700">ROI</a>
            <a href="#loop" className="hover:text-purple-700 whitespace-nowrap">Human&nbsp;+&nbsp;AI</a>
            <a href="#steps" className="hover:text-purple-700">4 Steps</a>
            <a href="#why" className="hover:text-purple-700">Why Us</a>
            <a href="#team" className="hover:text-purple-700">Team</a>
            <a href="#faq" className="hover:text-purple-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-purple-700">
              Log in
            </a>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90"
              aria-label="Start 14-Day Trial (Sign up)"
            >
              Start 14-Day Trial
            </a>
          </div>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(true)} aria-label="Open Menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-white"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
              <span className="font-extrabold">AutoDispatchAI</span>
              <button className="p-2" onClick={() => setMobileOpen(false)} aria-label="Close Menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 grid gap-4 text-lg">
              {[
                ['#features', 'Features'],
                ['#why-fleets', 'Why Fleets'],
                ['#impact', 'Impact'],
                ['#roi', 'ROI'],
                ['#loop', 'Human + AI'],
                ['#steps', '4 Steps'],
                ['#why', 'Why Us'],
                ['#team', 'Team'],
                ['#faq', 'FAQ'],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)} className="hover:text-purple-700">
                  {label}
                </a>
              ))}
              <div className="pt-2">
                <a href="/login" className="block py-3">Log in</a>
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90"
                  aria-label="Start 14-Day Trial (Sign up)"
                  onClick={() => setMobileOpen(false)}
                >
                  Start 14-Day Trial
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
            initial={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openAbove ? 10 : -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
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
            step="1"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value))}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </label>
        <label className="text-sm">
          <div className="text-neutral-600 mb-1">Hours saved / mo (per planner)</div>
          <input
            type="number"
            min={0}
            max={160}
            step="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </label>
        <label className="text-sm">
          <div className="text-neutral-600 mb-1"># of planners</div>
          <input
            type="number"
            min={1}
            max={50}
            step="1"
            value={planners}
            onChange={(e) => setPlanners(Number(e.target.value))}
            className="w-full h-11 rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
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
                {slides[idx].lines.map((l, i) => (
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
          {slides.map((_, i) => (
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

/* ================= TEAM SECTION (leadership + departments) ================= */

/* Departments array */
const DEPARTMENTS: Array<{
  title: string;
  desc: string;
  example: React.ReactNode;
  theme: Theme;
}> = [
  {
    title: 'AI & Automation Department',
    desc: 'Manages AI agents, workflow automation, and internal AI initiatives under Komal.',
    theme: { border: 'border-purple-300', ring: 'ring-purple-400/30', glow: 'shadow-[0_10px_30px_rgba(139,92,246,.16)]', grad: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Build, run and monitor AI agents that handle lead-gen, load parsing, negotiation drafts and continual automation improvements.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>24/7 agent monitoring & health checks</li>
          <li>Automation playbooks (n8n / Notiflank)</li>
          <li>Lead pipeline & priority routing</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">
          KPI: agent uptime, leads generated, automation accuracy.
        </div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Automation (human supervisor reviews agent outputs)
        </div>
      </div>
    ),
  },

  {
    title: 'R&D',
    desc: 'Focuses on new features, innovation, and prototyping for transport solutions.',
    theme: { border: 'border-fuchsia-300', ring: 'ring-fuchsia-400/30', glow: 'shadow-[0_10px_30px_rgba(217,70,239,.15)]', grad: 'from-fuchsia-500 via-pink-500 to-rose-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Prototype features, test model improvements, and run controlled pilots with carrier partners.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Feature experiments & A/B validation</li>
          <li>Model fine-tuning and evaluation</li>
          <li>Pilot integrations with fleets</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: feature velocity, experiment win rate</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — R&D (human QA on model outputs)
        </div>
      </div>
    ),
  },

  {
    title: 'Problem Solving / Safety',
    desc: 'Ensures compliance, resolves critical issues, and manages operational safety.',
    theme: { border: 'border-amber-300', ring: 'ring-amber-400/30', glow: 'shadow-[0_10px_30px_rgba(251,191,36,.18)]', grad: 'from-amber-500 via-orange-500 to-yellow-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Monitor incidents, run safety audits, and close tickets—ensuring driver & cargo safety and regulatory compliance.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Incident triage & remediation</li>
          <li>Compliance checks (cross-border workflows)</li>
          <li>Safety training & SOP updates</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: incidents closed, compliance score</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Safety (human supervisor reviews automated flags)
        </div>
      </div>
    ),
  },

  {
    title: 'HR',
    desc: 'Manages hiring, retention, and employee onboarding for all departments.',
    theme: { border: 'border-sky-300', ring: 'ring-sky-400/30', glow: 'shadow-[0_10px_30px_rgba(56,189,248,.15)]', grad: 'from-sky-500 via-cyan-500 to-teal-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Recruit and onboard team members, manage payroll, and track retention & engagement.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Hiring & onboarding flows</li>
          <li>Employee engagement and training</li>
          <li>Policy & benefits management</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: time-to-hire, retention rate</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — HR (human reviews automated candidate shortlists)
        </div>
      </div>
    ),
  },

  {
    title: 'Investor Relations',
    desc: 'Coordinates with investors, manages reports, and organizes meetings.',
    theme: { border: 'border-emerald-300', ring: 'ring-emerald-400/30', glow: 'shadow-[0_10px_30px_rgba(16,185,129,.16)]', grad: 'from-emerald-500 via-green-500 to-lime-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Prepare financial updates, investor decks, and coordinate diligence requests.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Quarterly reporting & KPIs</li>
          <li>Fundraising coordination</li>
          <li>Investor communications</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: investor satisfaction, report cadence</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Investor Relations (human verifies generated reports)
        </div>
      </div>
    ),
  },

  {
    title: 'Financial Department',
    desc: 'Tracks budgets, ROI, forecasts, and overall financial health of the platform.',
    theme: { border: 'border-violet-300', ring: 'ring-violet-400/30', glow: 'shadow-[0_10px_30px_rgba(139,92,246,.16)]', grad: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Budgeting, cashflow, unit economics and pre/post-loan spending analysis to keep the business healthy.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Forecasting & variance tracking</li>
          <li>Cost controls & spend approvals</li>
          <li>Billing & Stripe reconciliation</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: burn rate, margin, forecast accuracy</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Finance (human reviews automated forecasts)
        </div>
      </div>
    ),
  },

  {
    title: 'Media & Social Media Department',
    desc: 'Manages press, social media, digital campaigns, and advertising strategies.',
    theme: { border: 'border-rose-300', ring: 'ring-rose-400/30', glow: 'shadow-[0_10px_30px_rgba(244,63,94,.15)]', grad: 'from-rose-500 via-red-500 to-orange-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          PR, social content, paid campaigns and creative — building brand trust and lead funnels.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Press outreach & media relations</li>
          <li>Organic social & creative production</li>
          <li>Ad campaigns and performance tracking</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: reach, engagement, ad CPA</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Media (human QA for campaign copy & targeting)
        </div>
      </div>
    ),
  },

  {
    title: 'Tech Department',
    desc: 'Maintains uptime, bug fixes, integrations, and infrastructure for web and backend.',
    theme: { border: 'border-sky-300', ring: 'ring-sky-400/30', glow: 'shadow-[0_10px_30px_rgba(56,189,248,.15)]', grad: 'from-sky-500 via-cyan-500 to-teal-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Ensure production stability (Vercel frontend, Supabase backend), integrations, and incident response.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Monitoring & SLOs</li>
          <li>Bug triage & releases</li>
          <li>Integration ops (Samsara, Gmail, ELDs)</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: uptime, MTTR, deployment frequency</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Tech (human checks automated alerts & fixes)
        </div>
      </div>
    ),
  },

  {
    title: 'Sales & Revenue',
    desc: 'Tracks leads, revenue growth, and AI-assisted sales for transport clients.',
    theme: { border: 'border-amber-300', ring: 'ring-amber-400/30', glow: 'shadow-[0_10px_30px_rgba(251,191,36,.18)]', grad: 'from-amber-500 via-orange-500 to-yellow-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Convert inbound leads, run demos, and grow recurring ARR using a mix of human reps + AI-sourced leads.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Lead qualification & scoring</li>
          <li>Demo & onboarding handoff</li>
          <li>Renewal & expansion playbooks</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: MRR, conversion rate, LTV:CAC</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Revenue (human validates AI lead recommendations)
        </div>
      </div>
    ),
  },

  {
    title: 'Customer Support / Client Relations',
    desc: 'Handles client queries, escalations, and service support for carriers.',
    theme: { border: 'border-fuchsia-300', ring: 'ring-fuchsia-400/30', glow: 'shadow-[0_10px_30px_rgba(217,70,239,.15)]', grad: 'from-fuchsia-500 via-pink-500 to-rose-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          24×7 ticketing, SLA management, and escalation for operational or billing issues.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Ticket triage & SLAs</li>
          <li>Onboarding hand-holding</li>
          <li>Client success check-ins</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: CSAT, SLA adherence</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Client Relations (human reviews automated replies)
        </div>
      </div>
    ),
  },

  {
    title: 'Legal / Compliance',
    desc: 'Ensures contracts, regulations, and data compliance for all operations.',
    theme: { border: 'border-violet-300', ring: 'ring-violet-400/30', glow: 'shadow-[0_10px_30px_rgba(139,92,246,.16)]', grad: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Maintain contracts, privacy controls, and regulatory compliance (GDPR, transport rules, SOC 2 prep).
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Contract review & templates</li>
          <li>Data processing & privacy controls</li>
          <li>Audit readiness</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: compliance incidents, audit readiness</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Compliance (human approves automated legal summaries)
        </div>
      </div>
    ),
  },

  {
    title: 'Product Management',
    desc: 'Coordinates feature roadmap between R&D, Tech, and AI teams.',
    theme: { border: 'border-emerald-300', ring: 'ring-emerald-400/30', glow: 'shadow-[0_10px_30px_rgba(16,185,129,.16)]', grad: 'from-emerald-500 via-green-500 to-lime-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Prioritize roadmap, collect fleet feedback, and coordinate cross-team releases.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Roadmap & release planning</li>
          <li>Customer feedback loops</li>
          <li>Cross-team coordination</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: feature adoption, time-to-release</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Verified by: AI Head — Product (human reviews automated prioritization)
        </div>
      </div>
    ),
  },

  {
    title: 'AI Verification Team',
    desc: 'Verifies AI outputs and ensures accuracy before client delivery.',
    theme: { border: 'border-purple-300', ring: 'ring-purple-400/30', glow: 'shadow-[0_10px_30px_rgba(139,92,246,.16)]', grad: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    example: (
      <div>
        <div className="font-semibold">What we do</div>
        <div className="mt-1 text-[14px] text-neutral-700">
          Manual QA, spot checks, and anomaly investigation for agent-generated suggestions and actions.
        </div>
        <ul className="mt-2 text-[14px] list-disc ml-5 text-neutral-700">
          <li>Daily QA samples of agent actions</li>
          <li>Anomaly detection & escalations</li>
          <li>Training data curation for model improvements</li>
        </ul>
        <div className="mt-2 text-sm text-neutral-500 italic">KPI: QA pass rate, false-positive reduction</div>
        <div className="mt-2 text-sm text-emerald-700 font-medium">
          Note: This team signs off on critical agent outputs before client impact.
        </div>
      </div>
    ),
  },
];


function TeamSection() {
  return (
    <section id="team" className="py-24 px-4 border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Leadership & Internal Teams</h2>
        <p className="text-neutral-600 max-w-3xl mx-auto mb-10">
          Our human teams drive every aspect of AutoDispatchAI — from operations to revenue, R&D, and client success. Guided by our three founders and backed by supervised AI agents, we deliver automation, operational efficiency, and measurable profit clarity
        </p>

        {/* Leadership row */}
        <div className="mb-12 grid gap-8 grid-cols-1 sm:grid-cols-3 items-stretch">
          {/* Deepak — with real image */}
          <div className="p-8 rounded-2xl border border-neutral-200 bg-gradient-to-b from-[#f8fafc] to-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center gap-4">
              <img
                src="/deepak-sidhu.png"
                alt="Deepak Sidhu — Founder & CEO"
                className="h-20 w-20 rounded-full object-cover shadow-sm"
              />
              <div className="text-left">
                <div className="text-xl font-semibold text-neutral-900">Deepak Sidhu</div>
                <div className="text-sm text-neutral-500">Founder & CEO</div>
              </div>
            </div>
            <p className="mt-4 text-[15px] text-neutral-700 leading-7 flex-1">
              Deepak ensures the product solves real dispatch problems — bringing automation, operational efficiency, and profit clarity to carriers.
            </p>
            <div className="mt-6">
              <a
                href="https://www.linkedin.com/in/deepaksidhu1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A66C2] text-white font-semibold hover:bg-[#094a8f]"
              >
                Connect on LinkedIn
              </a>
            </div>
          </div>

          {/* Danny — placeholder avatar */}
          <div className="p-8 rounded-2xl border border-neutral-200 bg-gradient-to-b from-[#f8fafc] to-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-700">
                DS
              </div>
              <div className="text-left">
                <div className="text-xl font-semibold text-neutral-900">Danny Singh</div>
                <div className="text-sm text-neutral-500">Co-Founder & Head of Operations</div>
              </div>
            </div>
            <p className="mt-4 text-[15px] text-neutral-700 leading-7 flex-1">
              Danny brings frontline carrier experience and designs workflows that are practical, reliable, and scale-ready.
            </p>
            <div className="mt-6">
              <a
                href="mailto:danny@autodispatchai.com"
                className="inline-block w-full text-center px-5 py-2.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Email Danny
              </a>
            </div>
          </div>

          {/* Komal — placeholder avatar + short professional one-liner */}
          <div className="p-8 rounded-2xl border border-neutral-200 bg-gradient-to-b from-[#f8fafc] to-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-700">
                KS
              </div>
              <div className="text-left">
                <div className="text-xl font-semibold text-neutral-900">Komal Sidhu</div>
                <div className="text-sm text-neutral-500">Co-Founder & Head of Technology / AI</div>
              </div>
            </div>
            <p className="mt-4 text-[15px] text-neutral-700 leading-7 flex-1">
              Komal leads our AI & Tech division — overseeing automation, platform reliability, and accuracy of AI outputs.
            </p>
            <div className="mt-6">
              <a
                href="mailto:komal@autodispatchai.com"
                className="inline-block w-full text-center px-5 py-2.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Email Komal
              </a>
            </div>
          </div>
        </div>

        {/* Internal departments intro */}
<h3 className="text-2xl md:text-3xl font-bold mb-3 text-center">
  Internal Departments
</h3>
<p className="text-neutral-600 max-w-3xl mx-auto mb-8 text-center">
  Below are our core departments. Day-to-day operations are powered by supervised AI agents, while Deepak, Danny, and Komal oversee strategy, safety, and escalation. Each department is continuously audited by our AI Verification and Monitoring Teams to ensure precision, compliance, and uninterrupted performance. (hover/tap to preview).
</p>



        {/* Departments grid — uses FeatureCard component */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d, idx) => (
            <FeatureCard
              key={d.title}
              index={idx}
              title={d.title}
              desc={d.desc}
              example={d.example}
              theme={d.theme}
            />
          ))}
        </div>
      </div>
    </section>
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
