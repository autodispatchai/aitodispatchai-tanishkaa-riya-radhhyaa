// src/app/dashboard/jobs/page.tsx
export default function JobsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Jobs</h1>
        <p className="text-neutral-600 mt-1">Manage all your dispatch jobs in one place.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Job ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Route</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Driver</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'J-001', route: 'Toronto → Chicago', driver: 'Driver #27', status: 'Active', revenue: '$1,250' },
                { id: 'J-002', route: 'Chicago → Dallas', driver: 'Driver #15', status: 'Completed', revenue: '$1,800' },
                { id: 'J-003', route: 'Dallas → Houston', driver: 'Driver #08', status: 'Pending', revenue: '$950' },
              ].map((job) => (
                <tr key={job.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm font-medium">{job.id}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{job.route}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{job.driver}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-neutral-900">{job.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

