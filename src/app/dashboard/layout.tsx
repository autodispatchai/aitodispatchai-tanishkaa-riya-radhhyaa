// src/app/dashboard/layout.tsx
import type { Metadata } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your AutoDispatchAI dashboard — monitor loads, revenue, and AI efficiency.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('subscription_status')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!company || company.subscription_status !== 'active') {
    redirect('/choose-plan');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
