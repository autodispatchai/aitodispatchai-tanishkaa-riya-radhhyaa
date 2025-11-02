'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Country = 'Canada' | 'USA';

export default function CreateCompanyProfile() {
  const router = useRouter();

  // Form state (no defaults)
  const [country, setCountry] = useState<Country>('Canada');
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [regId, setRegId] = useState(''); // DOT (USA) or CVOR (Canada)
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [postal, setPostal] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  const [optIn, setOptIn] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const regLabel = useMemo(() => (country === 'USA' ? 'USDOT Number' : 'CVOR Number'), [country]);
  const regPlaceholder = country === 'USA' ? 'USDOT e.g., 1234567' : 'CVOR e.g., 123-456-789';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Minimal client validation
    if (!agreeTos) return setErr('Please agree to the Terms & Privacy Policy.');
    if (!companyName.trim()) return setErr('Company name is required.');
    if (!email.trim()) return setErr('Business email is required.');
    if (!address.trim() || !city.trim() || !stateProv.trim() || !postal.trim())
      return setErr('Address, City, State/Province, and Postal/ZIP are required.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email.');

    try {
      setLoading(true);

      // Map regulatory ID to DB columns:
      // - USA: DOT in dot_number
      // - Canada: CVOR stored in dot_number (for now; you can add dedicated column later)
      const body = {
        company_name: companyName.trim(),
        legal_name: legalName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        mc_number: mcNumber.trim() || undefined,
        dot_number: regId.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: stateProv.trim(),
        postal_code: postal.trim(),
        country: country,
      };

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        const msg = payload?.error || `Failed to save company (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setOk(true);
      // Go next (you can change to /billing/choose-plan later)
      setTimeout(() => router.push('/'), 700);
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* brand accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Create a Company Profile
          </h1>
          <p className="mt-2 text-neutral-600">
            Enter your legal and contact details to continue.
          </p>
        </div>

        {/* card */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />

          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-6" autoComplete="off">
            {/* Country + Regulatory ID */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Operating Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="USA">🇺🇸 United States</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  {regLabel}
                </label>
                <input
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={regPlaceholder}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Optional for now; helps with verification.
                </p>
              </div>
            </div>

            {/* Company names */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Legal Company Name <span className="text-red-600">*</span>
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., ABC Freight Solutions Inc."
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Trade / Legal Name (optional)
                </label>
                <input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g., ABC Freight"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Address lines */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                Business Address <span className="text-red-600">*</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Unit 2"
                required
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Brampton"
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  State / Province <span className="text-red-600">*</span>
                </label>
                <input
                  value={stateProv}
                  onChange={(e) => setStateProv(e.target.value)}
                  placeholder={country === 'Canada' ? 'ON' : 'IL'}
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Postal / ZIP <span className="text-red-600">*</span>
                </label>
                <input
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder={country === 'Canada' ? 'L6X 1A4' : '60601'}
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Contact & IDs */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Business Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dispatch@company.ai"
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Dispatch Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 416 000 0000"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  MC Number (optional, USA)
                </label>
                <input
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value)}
                  placeholder="MC e.g., 123456"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  {regLabel} (optional)
                </label>
                <input
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={regPlaceholder}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-neutral-700">
                  I agree to the{' '}
                  <a className="underline" href="/terms" target="_blank" rel="noreferrer">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a className="underline" href="/privacy" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-neutral-700">
                  I’d like to receive product updates and onboarding emails. (Optional)
                </span>
              </label>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {err}
                </motion.div>
              )}
              {ok && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  Company created successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
