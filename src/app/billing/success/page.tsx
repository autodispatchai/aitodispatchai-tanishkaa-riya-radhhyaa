'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type SessionInfo = {
  ok: boolean;
  id: string;
  status: string | null;
  customer_email: string | null;
  currency: string | null;
  amount_total: number | null;
  line_items: Array<{
    description: string;
    price_id: string | null;
    interval: string | null; // 'month' | 'year' | null
    unit_amount: number | null;
    quantity: number;
  }>;
};

export default function BillingSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get('session_id') || '';

  const shortId = useMemo(() => (sessionId ? '…' + sessionId.slice(-8) : ''), [sessionId]);

  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!sessionId) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/billing/session?id=${encodeURIComponent(sessionId)}`);
        const json = (await res.json()) as SessionInfo & { error?: string };
        if (!res.ok || !json.ok) throw new Error(json.error || 'Lookup failed');
        if (!cancelled) setInfo(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Lookup failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* brand accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="font-extrabold tracking-tight text-3xl sm:text-4xl">
            Auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Dispatch
            </span>
            AI
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-bold">Payment Successful</h1>
          <p className="mt-2 text-neutral-600">Thanks for subscribing! Your workspace is being prepared.</p>
          {sessionId ? (
            <p className="mt-2 text-xs text-neutral-500">
              Stripe session: <span className="font-mono">{shortId}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Subscription Details</h2>
              {loading && <p className="text-sm text-neutral-500 mt-2">Loading Stripe details…</p>}
              {err && <p className="text-sm text-red-600 mt-2">{err}</p>}

              {info && (
                <div className="mt-3 text-[15px] text-neutral-700 space-y-1">
                  <p>Status: <span className="font-medium">{info.status ?? '—'}</span></p>
                  <p>Email: <span className="font-medium">{info.customer_email ?? '—'}</span></p>
                  <p>
                    Total:{' '}
                    <span className="font-medium">
                      {info.amount_total != null && info.currency
                        ? `${(info.amount_total / 100).toLocaleString()} ${info.currency.toUpperCase()}`
                        : '—'}
                    </span>
                  </p>
                  <div className="mt-2">
                    <p className="font-medium">Items:</p>
                    <ul className="list-disc pl-5">
                      {info.line_items.map((li, i) => (
                        <li key={i}>
                          {li.description} — {li.interval ?? 'one-time'}
                          {li.unit_amount != null
                            ? ` • ${(li.unit_amount / 100).toLocaleString()} ${info.currency?.toUpperCase() ?? ''}`
                            : ''}
                          {li.quantity ? ` × ${li.quantity}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => router.push('/onboarding/connect')}
                className="h-11 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800"
              >
                Continue Onboarding
              </button>
              <button
                onClick={() => router.push('/')}
                className="h-11 rounded-xl border border-neutral-300 font-semibold hover:bg-neutral-50"
              >
                Go to Home
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Need help? Email <a className="underline" href="mailto:info@autodispatchai.com">info@autodispatchai.com</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
