// src/app/integrations/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations — AutoDispatchAI',
  description: 'Connect Gmail, Outlook, Samsara, DAT, Truckstop, and more. AutoDispatchAI integrates with your existing dispatch tools.',
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

