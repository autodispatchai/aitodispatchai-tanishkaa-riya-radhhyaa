// src/app/dashboard/reports/page.tsx
export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Reports</h1>
        <p className="text-neutral-600 mt-1">Analytics and insights for your fleet operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <p className="text-sm text-neutral-500">Chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Load Completion Rate</h3>
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <p className="text-sm text-neutral-500">Chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Driver Performance</h3>
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <p className="text-sm text-neutral-500">Chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">AI Efficiency Metrics</h3>
          <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
            <p className="text-sm text-neutral-500">Chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

