// src/app/demo/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo — AutoDispatchAI',
  description: 'Watch AutoDispatchAI in action. See how AI automates dispatch workflows for modern fleets.',
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

