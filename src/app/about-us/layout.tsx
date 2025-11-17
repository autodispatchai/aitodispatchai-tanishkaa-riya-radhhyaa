// src/app/about-us/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — AutoDispatchAI',
  description: 'Built by dispatchers, for dispatchers. Meet Deepak Sidhu, Danny Singh, and Komal Sidhu — the founders behind AutoDispatchAI.',
  openGraph: {
    title: 'About Us — AutoDispatchAI',
    description: 'Built by dispatchers, for dispatchers — with AI that works 24/7.',
    type: 'website',
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

