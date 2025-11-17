// src/app/about-us/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Info } from 'lucide-react';

type Theme = {
  border: string;
  ring: string;
  glow: string;
  grad: string;
};

export default function AboutUs() {
  const prefersReducedMotion = useReducedMotion();

  const founders = [
    {
      name: 'Deepak Sidhu',
      role: 'CEO & Founder',
      bio: 'Serial entrepreneur. Built 3 logistics startups. Loves trucks & AI.',
      image: '/deepak-sidhu.png',
      linkedin: 'https://www.linkedin.com/in/deepaksidhu1',
      placeholder: 'DS',
      fallback: 'https://ui-avatars.com/api?name=Deepak+Sidhu&size=112&background=6366f1&color=fff&bold=true',
    },
    {
      name: 'Danny Singh',
      role: 'Co-Founder & Head of Operations',
      bio: 'Frontline carrier experience. Designs practical workflows.',
      image: '/danny-singh.png',
      email: 'danny@autodispatchai.com',
      placeholder: 'DS',
      fallback: 'https://ui-avatars.com/api?name=Danny+Singh&size=112&background=8b5cf6&color=fff&bold=true',
    },
    {
      name: 'Komal Sidhu',
      role: 'Co-Founder & Head of Tech/AI',
      bio: 'Leads AI & Tech. Ensures automation reliability.',
      image: '/komal-sidhu.png',
      email: 'komal@autodispatchai.com',
      placeholder: 'KS',
      fallback: 'https://ui-avatars.com/api?name=Komal+Sidhu&size=112&background=d946ef&color=fff&bold=true',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero */}
          <motion.h1
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Meet the Team Behind{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
              AutoDispatchAI
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.1 }}
            className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto"
          >
           Our human teams drive every aspect of AutoDispatchAI — from operations to revenue, R&D, and client success. Guided by our three founders and backed by supervised AI agents, we deliver automation, operational efficiency, and measurable profit clarity
          </motion.p>

          {/* Founders Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {founders.map((founder, i) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion ? 0 : i * 0.1 }}
                className="group p-6 rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative w-28 h-28 mx-auto mb-4">
                  {founder.image ? (
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      width={112}
                      height={112}
                      className="rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = founder.fallback;
                      }}
                    />
                  ) : (
                    <img
                      src={founder.fallback}
                      alt={founder.name}
                      className="w-full h-full rounded-full border-4 border-white shadow-md"
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold text-neutral-900">{founder.name}</h3>
                <p className="text-indigo-600 font-medium">{founder.role}</p>
                <p className="mt-3 text-neutral-700 text-sm leading-relaxed">{founder.bio}</p>

                <div className="mt-5 flex justify-center">
                  {founder.linkedin ? (
                    <Link
                      href={founder.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#094a8f] transition"
                    >
                      LinkedIn
                    </Link>
                  ) : (
                    <a
                      href={`mailto:${founder.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
                    >
                      Email
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Internal Departments */}
          <div className="mt-24">
            <motion.h2
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4"
            >
              Internal Departments
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.1 }}
              className="text-center text-neutral-600 mb-12 max-w-3xl mx-auto"
            >
             Below are our core departments. Day-to-day operations are powered by supervised AI agents, while Deepak, Danny, and Komal oversee strategy, safety, and escalation. Each department is continuously audited by our AI Verification and Monitoring Teams to ensure precision, compliance, and uninterrupted performance. (hover/tap to preview).
            </motion.p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {DEPARTMENTS.map((dept, i) => (
                <FeatureCard
                  key={dept.title}
                  index={i}
                  title={dept.title}
                  desc={dept.desc}
                  example={dept.example}
                  theme={dept.theme}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
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
  const [active, setActive] = useState(false);
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
      onClick={() => setActive((v) => !v)}
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
