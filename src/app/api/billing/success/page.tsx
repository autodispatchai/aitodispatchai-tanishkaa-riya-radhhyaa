// src/app/billing/success/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'      // avoid static pre-render
export const fetchCache = 'force-no-store'  // be extra safe

function SuccessInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [details, setDetails] = useState<null | {
    amount_total: number | null
    currency: string | null
    customer_email: string | null
    line_items: Array<{
      description: string
      unit_amount: number | null
      interval: string | null
      quantity: number
    }>
  }>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        if (!sessionId) return
        const r = await fetch(`/billing/session?id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        })
        const j = await r.json()
        if (!cancelled) {
          if (j.ok) setDetails(j)
          else setError(j.error || 'Failed to fetch session')
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to fetch session')
      }
    }
    run()
    return () => { cancelled = true }
  }, [sessionId])

  if (!sessionId) {
    return <div className="p-6">Missing <code>session_id</code>.</div>
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!details) return <div className="p-6">Loading your receipt…</div>

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Payment successful 🎉</h1>
      <p>We emailed a receipt to: <b>{details.customer_email ?? '—'}</b></p>

      <div className="rounded-lg border p-4">
        <div>Total: <b>{details.amount_total ?? 0}</b> {details.currency?.toUpperCase() ?? ''}</div>
        <ul className="mt-3 list-disc pl-6">
          {details.line_items?.map((li, i) => (
            <li key={i}>
              {li.description} — {li.quantity} x {(li.unit_amount ?? 0)/100}
              {li.interval ? ` / ${li.interval}` : ''}
            </li>
          ))}
        </ul>
      </div>

      <a href="/app" className="inline-block rounded-lg bg-black px-4 py-2 text-white">
        Go to Dashboard
      </a>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  )
}
