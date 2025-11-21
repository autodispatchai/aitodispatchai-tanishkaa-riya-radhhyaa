// src/app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { MapPin, Clock, TrendingUp, Briefcase, Users } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('id, company_name')
    .eq('owner_id', session.user.id)
    .maybeSingle();

  if (!company) {
    redirect('/onboarding/create-company');
  }

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at, plan')
    .eq('company_id', company.id)
    .maybeSingle();

  // If no subscription, redirect to choose-plan
  if (!subscription) {
    redirect('/choose-plan');
  }

  // Check if trial is active
  const isTrialing = subscription.status === 'trialing' || 
    (subscription.trial_ends_at && new Date(subscription.trial_ends_at) > new Date());
  
  const isActive = subscription.status === 'active' && !isTrialing;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back, {company?.company_name || 'User'}!
        </h1>
        <p className="text-neutral-600">Your AI dispatch is ready.</p>
        
        {/* Trial Status Banner */}
        {isTrialing && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm font-medium text-indigo-900">
              🎉 14-day free trial active
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              {subscription.trial_ends_at 
                ? `Trial ends: ${new Date(subscription.trial_ends_at).toLocaleDateString()}`
                : 'Enjoy full access during your trial period'}
            </p>
          </div>
        )}

        {/* Active Subscription Banner */}
        {isActive && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm font-medium text-emerald-900">
              ✅ Active Subscription - {subscription.plan} Plan
            </p>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Jobs Today</h3>
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">12</p>
          <p className="text-xs text-emerald-600 mt-1">+3 from yesterday</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Active Drivers</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">8</p>
          <p className="text-xs text-neutral-500 mt-1">2 on break</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Pending</h3>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">5</p>
          <p className="text-xs text-neutral-500 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Revenue</h3>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">$4,820</p>
          <p className="text-xs text-emerald-600 mt-1">Today</p>
        </div>
      </div>

      {/* Live Map + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Map Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Live Map</h3>
          <div className="h-96 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Map integration coming soon</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New load assigned', driver: 'Driver #27', time: '2 min ago', status: 'success' },
              { action: 'Load completed', driver: 'Driver #15', time: '15 min ago', status: 'success' },
              { action: 'Exception alert', driver: 'Driver #08', time: '1 hour ago', status: 'warning' },
              { action: 'Route optimized', driver: 'Driver #22', time: '2 hours ago', status: 'info' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-emerald-500' :
                  activity.status === 'warning' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{activity.driver} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
