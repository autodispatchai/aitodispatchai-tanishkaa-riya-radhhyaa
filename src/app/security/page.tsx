// src/app/security/page.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Lock, CheckCircle, FileCheck } from 'lucide-react';

export default function SecurityPage() {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    {
      icon: Shield,
      title: 'SOC 2 Program',
      desc: 'Currently undergoing SOC 2 Type II certification. Regular audits and compliance checks.',
      status: 'In Progress',
    },
    {
      icon: Lock,
      title: 'Encryption',
      desc: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256). End-to-end encryption for sensitive fields.',
      status: 'Active',
    },
    {
      icon: CheckCircle,
      title: 'Row Level Security',
      desc: 'Supabase RLS ensures users only access their own company data. Least-privilege API access.',
      status: 'Active',
    },
    {
      icon: FileCheck,
      title: 'Compliance',
      desc: 'GDPR-ready, transport regulations compliant. Regular security audits and penetration testing.',
      status: 'Active',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Security &{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                Compliance
              </span>
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Your data is protected with enterprise-grade security measures.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : i * 0.1 }}
                  className="rounded-2xl border border-neutral-200 p-6 bg-white"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{feature.desc}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    feature.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {feature.status}
                  </span>
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
            <p className="text-sm text-neutral-600 mb-4">
              Questions about security? Contact us at{' '}
              <a href="mailto:security@autodispatchai.com" className="text-indigo-600 hover:underline">
                security@autodispatchai.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
