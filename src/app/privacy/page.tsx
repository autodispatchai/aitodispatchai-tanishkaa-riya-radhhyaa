'use client';

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
          Privacy Policy
        </span>
      </h1>
      <p className="mt-3 text-sm text-neutral-500">Last updated: {updated}</p>

      <section className="mt-8 space-y-6 text-[15.5px] leading-7 text-neutral-800">
        <p>
          This Privacy Policy explains how AutoDispatchAI (“we”, “our”, “us”) collects,
          uses, and protects your information. We follow a simple principle:
          <strong> minimum data, clear purpose, and full control.</strong>
        </p>

        {/* 1. Data Collection */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">1) Information We Collect</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account Information:</strong> Email, password (hashed), and name (if provided).</li>
            <li><strong>Company Details:</strong> Company name, number of trucks, preferred lanes.</li>
            <li><strong>Product Logs:</strong> Error logs, performance metrics, and basic analytics for improving the platform.</li>
            <li><strong>Integrations:</strong> Gmail/Outlook tokens, ELD or GPS identifiers, only when needed for features you enable.</li>
          </ul>
          <p className="mt-2 text-sm text-neutral-600">
            We never sell or publicly share your personal data.
          </p>
        </div>

        {/* 2. Data Storage */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">2) Data Storage Locations</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Canadian companies:</strong> Data is securely stored in Canada.</li>
            <li><strong>U.S. companies:</strong> Data is securely stored in the United States.</li>
          </ul>
          <p className="mt-2">
            * We store data regionally to comply with Canadian PIPEDA and U.S. privacy regulations.
          </p>
        </div>

        {/* 3. Security */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">3) Security & Compliance</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>256-bit SSL encryption in transit and at rest.</li>
            <li>Database Row Level Security (RLS) and least-privilege access controls.</li>
            <li>SOC 2 program in progress; practices align with PIPEDA (Canada) and GDPR (EU).</li>
          </ul>
        </div>

        {/* 4. Data Sharing */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">4) Data Sharing</h2>
          <p className="mt-2">
            We share information only when necessary to operate the service (e.g., email provider, secure hosting),
            or when required by law.
          </p>
          <p className="mt-2">
            * Company data can only be accessed by authorized company admins or
            government agencies with a valid legal request. No one else, including internal employees,
            can view client data without a recorded audit trail.
          </p>
        </div>

        {/* 5. Cookies */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">5) Cookies & Analytics</h2>
          <p className="mt-2">
            We use essential cookies for login and session management, and lightweight analytics
            to improve product experience. We do not use advertising or tracking cookies.
          </p>
        </div>

        {/* 6. User Rights */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">6) Your Rights</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You may request to export or permanently delete your account data.</li>
            <li>You may disconnect integrations (e.g., Gmail, Outlook) at any time.</li>
          </ul>
          <p className="mt-2 text-sm text-neutral-600">
            For any request, contact <a className="underline" href="mailto:info@autodispatchai.com">info@autodispatchai.com</a>.
          </p>
        </div>

        {/* 7. Updates */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">7) Updates to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. Any changes will be posted here,
            and the “Last updated” date will be adjusted accordingly.
          </p>
        </div>

        {/* 8. Contact */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2">
            Email: <a className="underline" href="mailto:info@autodispatchai.com">info@autodispatchai.com</a><br />
            Phone: <a className="underline" href="tel:+14164274542">+1 (416) 427-4542</a>
          </p>
        </div>
      </section>
    </main>
  );
}
