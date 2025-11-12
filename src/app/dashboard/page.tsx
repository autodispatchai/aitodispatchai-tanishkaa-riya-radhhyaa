// src/app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id, company_name, subscription_status')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!company) {
    redirect('/signup/create-company');
  }

  if (company.subscription_status !== 'active') {
    redirect('/choose-plan');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back, {company.company_name}!
        </h1>
        <p className="text-neutral-600">Your AI dispatch is ready.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg">Active Loads</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg">Revenue Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">$4,820</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-lg">AI Efficiency</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">94%</p>
          </div>
        </div>
      </div>
    </div>
  );
}