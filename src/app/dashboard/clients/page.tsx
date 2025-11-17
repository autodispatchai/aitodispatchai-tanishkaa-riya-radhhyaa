// src/app/dashboard/clients/page.tsx
export default function ClientsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Clients</h1>
        <p className="text-neutral-600 mt-1">Manage your broker and client relationships.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Client Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Active Loads</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Total Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ABC Logistics', type: 'Broker', loads: 5, revenue: '$12,450', status: 'Active' },
                { name: 'XYZ Freight', type: 'Broker', loads: 3, revenue: '$8,200', status: 'Active' },
                { name: 'Global Shipping', type: 'Direct', loads: 2, revenue: '$5,600', status: 'Active' },
              ].map((client, i) => (
                <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm font-medium">{client.name}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{client.type}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{client.loads}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-neutral-900">{client.revenue}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {client.status}
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

