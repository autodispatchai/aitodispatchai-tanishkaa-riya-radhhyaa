// src/app/integrations/page.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, Mail, Truck, Shield } from 'lucide-react';

export default function IntegrationsPage() {
  const prefersReducedMotion = useReducedMotion();

  const integrations = [
    {
      name: 'Gmail',
      status: 'Live',
      desc: 'Read load emails, auto-parse lanes, RPM, and pickup windows.',
      icon: Mail,
      color: 'text-[#DB4437]',
    },
    {
      name: 'Outlook',
      status: 'Live',
      desc: 'Microsoft 365 & Outlook.com support for email parsing.',
      icon: Mail,
      color: 'text-[#0A66C2]',
    },
    {
      name: 'Samsara',
      status: 'In Progress',
      desc: 'Real-time GPS, HOS, and driver location sync.',
      icon: Truck,
      color: 'text-[#06B6D4]',
    },
    {
      name: 'DAT',
      status: 'Coming Soon',
      desc: 'Load board integration for automated load discovery.',
      icon: Zap,
      color: 'text-neutral-800',
    },
    {
      name: 'Truckstop',
      status: 'Coming Soon',
      desc: 'Load board access for expanded load matching.',
      icon: Zap,
      color: 'text-neutral-800',
    },
    {
      name: 'Motive',
      status: 'In Progress',
      desc: 'ELD integration for HOS and driver management.',
      icon: Truck,
      color: 'text-[#10B981]',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Integrations &{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                API Network
              </span>
            </h1>
            <p className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
              Connect your existing tools. AutoDispatchAI works with major brokers, load boards, ELDs, and messaging platforms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, i) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : i * 0.1 }}
                  className="rounded-2xl border border-neutral-200 p-6 bg-white hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${integration.color}`} />
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      integration.status === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                      integration.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{integration.name}</h3>
                  <p className="text-sm text-neutral-600">{integration.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-sm">
              <Shield className="h-4 w-4" />
              <span>All integrations secured via least-privilege API access</span>
            </div>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Start 14-Day Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

