// src/app/security/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security — AutoDispatchAI',
  description: 'Enterprise-grade security: SOC 2 program, encryption, Row Level Security, and compliance measures.',
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}

