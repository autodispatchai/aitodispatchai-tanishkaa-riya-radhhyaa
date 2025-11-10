// src/app/create-company/page.tsx
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';

type Country = 'Canada' | 'USA';

function CreateCompanyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');

  const supabase = createClient();

  // Form state
  const [country, setCountry] = useState<Country>('Canada');
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [regId, setRegId] = useState('');
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

  const validate = () => {
    if (!agreeTos) return 'Please agree to the Terms & Privacy Policy.';
    if (!companyName.trim()) return 'Company name is required.';
    if (!email.trim()) return 'Business email is required.';
    if (!address.trim() || !city.trim() || !stateProv.trim() || !postal.trim())
      return 'Full address is required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email.';
    return null;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);

    const validationError = validate();
    if (validationError) return setErr(validationError);

    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('companies').insert([{
        owner_id: session.user.id,
        company_name: companyName.trim(),
        legal_name: legalName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        mc_number: mcNumber.trim() || null,
        dot_number: regId.trim() || null,
        address: address.trim(),
        city: city.trim(),
        state: stateProv.trim(),
        postal_code: postal.trim(),
        country,
        consent_public_listing: optIn,
        invite_code: inviteCode || null,
      }]);

      if (error) throw error;

      setOk(true);
      setTimeout(() => router.push('/choose-plan'), 800);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save company. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (inviteCode) {
      console.log('Invite code detected:', inviteCode);
    }
  }, [inviteCode]);

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Create a Company Profile</h1>
          <p className="mt-2 text-neutral-600">Enter your legal and contact details to continue.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />

          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-6" autoComplete="off">
            {/* Country & Reg ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Operating Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Canada">Canada</option>
                  <option value="USA">United States</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">{regLabel}</label>
                <input
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder={regPlaceholder}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Company Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            {/* Address */}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">City <span className="text-red-600">*</span></label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Brampton"
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">State / Province <span className="text-red-600">*</span></label>
                <input
                  value={stateProv}
                  onChange={(e) => setStateProv(e.target.value)}
                  placeholder={country === 'Canada' ? 'ON' : 'IL'}
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Postal / ZIP <span className="text-red-600">*</span></label>
                <input
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder={country === 'Canada' ? 'L6X 1A4' : '60601'}
                  required
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Business Email <span className="text-red-600">*</span></label>
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
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">Dispatch Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 416 000 0000"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* MC Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">MC Number (optional, USA)</label>
                <input
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value)}
                  placeholder="MC e.g., 123456"
                  className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-neutral-700">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="underline text-purple-600">Terms & Conditions</a> and{' '}
                  <a href="/privacy" target="_blank" className="underline text-purple-600">Privacy Policy</a>.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {err}
                </motion.div>
              )}
              {ok && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                >
                  Company created successfully! Redirecting to plan selection...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !agreeTos}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 px-6 font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : 'Continue to Choose Plan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateCompanyContent />
    </Suspense>
  );
}