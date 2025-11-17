// src/app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="Your Company Name"
                className="w-full h-10 px-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="dispatch@company.com"
                className="w-full h-10 px-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            {[
              { label: 'Email notifications', checked: true },
              { label: 'SMS alerts', checked: false },
              { label: 'Push notifications', checked: true },
            ].map((setting) => (
              <label key={setting.label} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={setting.checked}
                  className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-neutral-700">{setting.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

