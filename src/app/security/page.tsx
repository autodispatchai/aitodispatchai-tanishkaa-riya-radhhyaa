'use client';

export default function SecurityPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
          Security
        </span>
      </h1>
      <p className="mt-3 text-sm text-neutral-500">Last updated: {updated}</p>

      <section className="mt-8 space-y-6 text-[15.5px] leading-7 text-neutral-800">
        <p>
          AutoDispatchAI is built with security and privacy at its core. We follow industry best practices to
          ensure that carrier, broker, and load data remains safe, private, and compliant with regional laws.
        </p>

        {/* 1. Data Hosting & Regional Storage */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">1) Data Hosting & Regional Storage</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Canadian companies’ data is stored securely in Canada-based datacenters.</li>
            <li>U.S. companies’ data is stored in datacenters located within the United States.</li>
            <li>
              Data residency and access follow respective national privacy laws — PIPEDA (Canada) and applicable
              U.S. federal and state data protection frameworks.
            </li>
          </ul>
          <p className="mt-2 text-sm text-neutral-600">
            * We strictly enforce regional separation to comply with government and enterprise data policies.
          </p>
        </div>

        {/* 2. Encryption & Access Control */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">2) Encryption & Access Control</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>All communication between your browser and our servers is encrypted using HTTPS/TLS (256-bit SSL).</li>
            <li>Data at rest is encrypted using AES-256 and stored within secure managed environments.</li>
            <li>Row Level Security (RLS) ensures every record can only be accessed by its owning account.</li>
            <li>All internal access is logged and monitored for unauthorized activity.</li>
          </ul>
        </div>

        {/* 3. Authentication & Session Security */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">3) Authentication & Session Security</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Authentication is handled via secure tokens provided by Supabase with expiring sessions.</li>
            <li>Password hashes use modern encryption (bcrypt).</li>
            <li>Multi-factor authentication (MFA) support is planned for enterprise accounts.</li>
          </ul>
        </div>

        {/* 4. Compliance & Audit */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">4) Compliance & Audit</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>SOC 2 Type II compliance program is in progress.</li>
            <li>We align with GDPR, PIPEDA, and CCPA principles for data handling and subject rights.</li>
            <li>Access logs and audit trails are maintained for every admin or system action.</li>
          </ul>
        </div>

        {/* 5. AI Ethics & Human Oversight */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">5) AI Ethics & Human Oversight</h2>
          <p className="mt-2">
            AutoDispatchAI’s automation features are powered by artificial intelligence but always operate under human
            supervision. We believe in <strong>“AI under human control”</strong> — AI assists dispatchers but never
            replaces them.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>We do not use AI systems that make irreversible or autonomous business decisions.</li>
            <li>All AI-generated actions (e.g., broker communication, suggestions) require human review or confirmation.</li>
            <li>We do not claim 100% accuracy or human equivalence — humans always remain in charge.</li>
          </ul>
        </div>

        {/* 6. Limited Access & Government Requests */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">6) Limited Access & Government Requests</h2>
          <p className="mt-2">
            Company data can only be accessed by the company’s authorized admins or by government agencies with a valid
            legal request. No one else — including AutoDispatchAI employees — can view or modify customer data without
            explicit authorization and a complete audit record.
          </p>
        </div>

        {/* 7. Incident Response */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">7) Incident Response</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>We maintain continuous monitoring and alerting for security anomalies.</li>
            <li>In case of a confirmed breach, affected users are notified within 48 hours (or earlier as required by law).</li>
            <li>Post-incident reports include mitigation steps and prevention measures.</li>
          </ul>
        </div>

        {/* 8. Responsible Disclosure */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">8) Responsible Disclosure</h2>
          <p className="mt-2">
            We welcome security researchers and ethical hackers to report potential vulnerabilities responsibly.
            Please contact <a className="underline" href="mailto:security@autodispatchai.com">security@autodispatchai.com</a>.
            We investigate all reports promptly and appreciate the efforts to improve our platform’s security.
          </p>
        </div>

        {/* 9. Contact */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2">
            Security inquiries: <a className="underline" href="mailto:security@autodispatchai.com">security@autodispatchai.com</a><br />
            General support: <a className="underline" href="mailto:info@autodispatchai.com">info@autodispatchai.com</a><br />
            Phone: <a className="underline" href="tel:+14164274542">+1 (416) 427-4542</a>
          </p>
        </div>
      </section>
    </main>
  );
}
