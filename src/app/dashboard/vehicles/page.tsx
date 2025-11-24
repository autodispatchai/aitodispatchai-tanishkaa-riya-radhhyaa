// src/app/dashboard/vehicles/page.tsx
export const dynamic = 'force-dynamic';

export default function VehiclesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Vehicles</h1>
        <p className="text-neutral-600 mt-1">Track and manage your fleet vehicles.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Vehicle ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Driver</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Location</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'V-001', type: '53\' Dry Van', driver: 'Driver #27', status: 'On Route', location: 'Chicago, IL' },
                { id: 'V-002', type: '48\' Flatbed', driver: 'Driver #15', status: 'Available', location: 'Dallas, TX' },
                { id: 'V-003', type: '53\' Reefer', driver: 'Driver #08', status: 'Maintenance', location: 'Houston, TX' },
              ].map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm font-medium">{vehicle.id}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{vehicle.type}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{vehicle.driver}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'On Route' ? 'bg-blue-100 text-blue-700' :
                      vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{vehicle.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

