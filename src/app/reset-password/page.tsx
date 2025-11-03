// src/app/reset-password/page.tsx
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function ResetInner() {
  const sp = useSearchParams()

  // common Supabase params: code, token, type, email (varies by provider)
  const code = sp.get('code') || sp.get('token') || ''
  const type = sp.get('type') || 'recovery'
  const email = sp.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState<string>('')

  const disabled = useMemo(() => {
    return status === 'submitting' || password.length < 8 || password !== confirm
  }, [status, password, confirm])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return
    setStatus('submitting')
    setMsg('')

    try {
      // 👉 If you have an API route to finish password reset, call it here.
      // Example (stub):
      // const r = await fetch('/api/auth/finish-reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code, type, password }),
      // })
      // const j = await r.json()
      // if (!j.ok) throw new Error(j.error || 'Reset failed')

      // For now, just simulate success (you can wire Supabase later)
      await new Promise((res) => setTimeout(res, 700))
      setStatus('done')
      setMsg('Password reset successful. You can log in now.')
    } catch (err: any) {
      setStatus('error')
      setMsg(err?.message || 'Reset failed')
    }
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-2xl font-semibold">Reset your password</h1>
      <p className="mb-6 text-sm text-neutral-600">
        {email ? <>Account: <b>{email}</b></> : <>Enter a new password.</>}
      </p>

      {!code && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          Missing <code>code</code>/<code>token</code> in the URL.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !code}
          className={`rounded-md px-4 py-2 text-white ${disabled || !code ? 'bg-neutral-400' : 'bg-black'}`}
        >
          {status === 'submitting' ? 'Saving…' : 'Update password'}
        </button>

        {msg && (
          <div
            className={`rounded-md border p-3 text-sm ${
              status === 'done'
                ? 'border-green-300 bg-green-50 text-green-700'
                : status === 'error'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-neutral-200 bg-neutral-50'
            }`}
          >
            {msg}
          </div>
        )}
      </form>

      <div className="mt-6 text-sm text-neutral-500">
        Token type: <code>{type}</code>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ResetInner />
    </Suspense>
  )
}
