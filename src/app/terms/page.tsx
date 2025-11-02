'use client';

export default function TermsPage() {
  const updated = new Date().toLocaleDateString();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
          Terms of Service
        </span>
      </h1>
      <p className="mt-3 text-sm text-neutral-500">Last updated: {updated}</p>

      <section className="mt-8 space-y-6 text-[15.5px] leading-7 text-neutral-800">
        <p>
          These Terms govern your access to and use of AutoDispatchAI (“we”, “us”, “our”) and form a binding
          agreement between you and AutoDispatchAI Inc. By using our website, platform, or services, you
          acknowledge that you have read and agree to these Terms.
        </p>

        {/* 1. Eligibility & Accounts */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">1) Eligibility & Accounts</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You must be of legal age and authorized to bind your company to these Terms.</li>
            <li>You are responsible for safeguarding your login credentials and all activity under your account.</li>
            <li>You must provide accurate information during signup and keep it updated.</li>
          </ul>
        </div>

        {/* 2. Acceptable Use */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">2) Acceptable Use</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You may use the service only for lawful business purposes related to dispatch and logistics.</li>
            <li>Do not use the platform to send spam, misuse broker contact data, or engage in abusive or illegal behavior.</li>
            <li>Do not attempt to reverse engineer, bypass security, or interfere with the platform’s operations.</li>
          </ul>
        </div>

        {/* 3. Subscriptions, Trials, Billing */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">3) Subscriptions, Trials & Billing</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Free Trial:</strong> 14 days. No charges apply until you select a paid plan.</li>
            <li><strong>Recurring Billing:</strong> Subscriptions renew automatically unless cancelled before renewal.</li>
            <li><strong>Cancellation:</strong> You can cancel anytime from your dashboard to prevent the next billing cycle.</li>
            <li>Applicable taxes or processing fees may apply based on your region.</li>
          </ul>
        </div>

        {/* 4. Refund Policy */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">4) Refund Policy</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>First Payment Grace:</strong> Refunds may be granted within 7 days of your first paid charge if you are unsatisfied and there has been no material use after payment.</li>
            <li><strong>Ongoing Billing:</strong> Renewals and partial months are generally non-refundable.</li>
            <li>Contact <a className="underline" href="mailto:info@autodispatchai.com">info@autodispatchai.com</a> for any billing issues or refund requests.</li>
          </ul>
        </div>

        {/* 4A. Third-Party API Usage & Billing Clarification */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">4A) Third-Party API Usage & Billing</h2>
          <p className="mt-2">
            AutoDispatchAI integrates with several third-party services such as OpenAI, Gmail, Outlook, Twilio,
            Samsara, and others to deliver automation features like AutoSwap, Scout, Negotiator, and AI-assisted
            broker communication.
          </p>
          <p className="mt-2">
            When AutoDispatchAI’s own infrastructure and API keys are used for these AI-powered workflows,
            all associated API usage costs (for example, OpenAI completions or automated broker messages)
            are covered by AutoDispatchAI and included in your subscription pricing.
          </p>
          <p className="mt-2">
            However, when your company connects its own API keys or accounts (for example, your own Gmail,
            Outlook, Twilio, Samsara, or OpenAI credentials), all usage charges from those providers are
            billed directly to your respective accounts with those providers.
          </p>
          <p className="mt-2">
            AutoDispatchAI does not add any markup or commission to those third-party API costs.
            Your per-truck or subscription plan pricing covers only the use of the AutoDispatchAI platform,
            automation system, and proprietary AI technology layer.
          </p>
        </div>

        {/* 5. Integrations & Data Location */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">5) Integrations & Data Location</h2>
          <p className="mt-2">
            You may connect third-party integrations (such as Gmail, Outlook, ELD, or GPS providers) to enable
            certain features. Data from Canadian companies is stored securely in Canada; data from U.S. companies
            is stored securely in the United States. All storage and processing comply with PIPEDA and U.S. data
            privacy laws.
          </p>
        </div>

        {/* 6. Security & Access Controls */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">6) Security & Access Controls</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Data is encrypted in transit and at rest using industry-standard methods.</li>
            <li>Database Row Level Security and least-privilege access are enforced.</li>
            <li>Access to company data is restricted to authorized company admins or government agencies with valid legal requests.</li>
            <li>Internal employee access is limited and always logged for audit.</li>
          </ul>
        </div>

        {/* 7. AI-Assisted Workflows */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">7) AI-Assisted Workflows & Accuracy</h2>
          <p className="mt-2">
            AutoDispatchAI uses artificial intelligence to automate dispatch and communication workflows.
            However, AI does not replace human judgment. We do not guarantee 100% accuracy in AI outputs.
            You are responsible for reviewing and approving any AI-generated suggestions, messages,
            or bookings before execution. Human oversight remains mandatory at all times.
          </p>
        </div>

        {/* 8. Service Availability */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">8) Service Availability</h2>
          <p className="mt-2">
            We strive for reliable uptime, but temporary disruptions may occur due to maintenance, updates,
            or issues beyond our control (e.g., network, broker systems, or external API outages).
            We will make reasonable efforts to notify users of scheduled downtime.
          </p>
        </div>

        {/* 9. Disclaimers */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">9) Disclaimers</h2>
          <p className="mt-2">
            The service is provided “as is” and “as available.” AutoDispatchAI disclaims all warranties,
            express or implied, including merchantability, fitness for a particular purpose,
            and non-infringement. You use the service at your own risk.
          </p>
        </div>

        {/* 10. Limitation of Liability */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">10) Limitation of Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, AutoDispatchAI, its affiliates, and suppliers
            shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
            including loss of profits, revenue, data, or goodwill. In no event shall our total liability
            exceed the amount you paid to AutoDispatchAI in the three (3) months preceding the claim.
          </p>
        </div>

        {/* 11. Termination */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">11) Suspension & Termination</h2>
          <p className="mt-2">
            We may suspend or terminate access for violations of these Terms or misuse of the platform.
            You may stop using the service anytime. Upon termination, access ceases but you may request
            data export within 14 days as per our Privacy Policy.
          </p>
        </div>

        {/* 12. Governing Law */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">12) Governing Law</h2>
          <p className="mt-2">
            These Terms are governed by the laws of the Province of Ontario, Canada, and the federal laws
            of Canada applicable therein. Any disputes shall be handled exclusively in the courts of Ontario.
          </p>
        </div>

        {/* 13. Changes */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xl font-semibold">13) Changes to These Terms</h2>
          <p className="mt-2">
            We may update these Terms periodically. Updates will be posted here with a new “Last updated” date.
            Continued use of the service after updates means you accept the revised Terms.
          </p>
        </div>

        {/* 14. Contact */}
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

