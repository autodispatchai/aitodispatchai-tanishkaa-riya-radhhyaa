// src/app/metadata.ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoDispatchAI — Your Dispatcher Never Sleeps',
  description: 'AI dispatch automation for modern fleets. Your 24/7 digital dispatcher that finds loads, negotiates, tracks, and notifies — built for cross-border carriers.',
  openGraph: {
    title: 'AutoDispatchAI — Your Dispatcher Never Sleeps',
    description: 'AI dispatch automation for modern fleets. 24/7 digital dispatcher that finds loads, negotiates, tracks, and notifies.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDispatchAI',
    description: 'Your dispatcher never sleeps. Neither should your profits.',
    images: ['/og.png'],
  },
};

