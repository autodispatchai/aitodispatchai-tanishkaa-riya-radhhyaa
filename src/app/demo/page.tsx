// src/app/demo/page.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

export default function DemoPage() {
  const prefersReducedMotion = useReducedMotion();

  // Replace with your actual Loom video embed URL
  const LOOM_VIDEO_ID = 'YOUR_LOOM_VIDEO_ID'; // e.g., 'abc123def456'

  return (
    <div className="min-h-screen bg-white">
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              See{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                AutoDispatchAI
              </span>{' '}
              in Action
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Watch a 2-minute demo of how AutoDispatchAI automates your dispatch workflow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 shadow-lg bg-neutral-100"
          >
            {LOOM_VIDEO_ID ? (
              <iframe
                src={`https://www.loom.com/embed/${LOOM_VIDEO_ID}`}
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                title="AutoDispatchAI Demo"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-neutral-600 mb-4">Video embed coming soon</p>
                  <Link
                    href="https://calendly.com/autodispatchai/demo?utm_source=website&utm_medium=demo-page"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
                  >
                    Book a Live Demo
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold hover:opacity-90"
            >
              Start 14-Day Trial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

