// src/app/dashboard/billing/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { Check } from 'lucide-react';

export default async function BillingPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Billing</h1>
        <p className="text-neutral-600 mt-1">Manage your subscription and invoices.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-neutral-900">PRO Plan</p>
            <p className="text-sm text-neutral-600 mt-1">Billed monthly • $79/truck</p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-neutral-50">
            Change Plan
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        <div className="space-y-3">
          {[
            { id: 'INV-001', date: 'Nov 1, 2025', amount: '$632', status: 'Paid' },
            { id: 'INV-002', date: 'Oct 1, 2025', amount: '$632', status: 'Paid' },
            { id: 'INV-003', date: 'Sep 1, 2025', amount: '$632', status: 'Paid' },
          ].map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
              <div>
                <p className="font-medium text-neutral-900">{invoice.id}</p>
                <p className="text-sm text-neutral-600 mt-0.5">{invoice.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-neutral-900">{invoice.amount}</p>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <Check className="h-3 w-3" />
                  {invoice.status}
                </span>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

