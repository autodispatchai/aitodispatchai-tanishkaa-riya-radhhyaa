// src/app/dashboard/drivers/page.tsx
export default function DriversPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Drivers</h1>
        <p className="text-neutral-600 mt-1">Manage your driver roster and assignments.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Driver ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">HOS Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'D-027', name: 'John Smith', vehicle: 'V-001', hos: '8h 30m', status: 'Active' },
                { id: 'D-015', name: 'Mike Johnson', vehicle: 'V-002', hos: '6h 15m', status: 'Active' },
                { id: 'D-008', name: 'David Lee', vehicle: 'V-003', hos: 'Off Duty', status: 'On Break' },
              ].map((driver) => (
                <tr key={driver.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm font-medium">{driver.id}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{driver.name}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{driver.vehicle}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{driver.hos}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

