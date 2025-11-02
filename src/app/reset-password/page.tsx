'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const code = search.get('code'); // Supabase sends `code` for recovery links

  const [mode, setMode] = useState<'request' | 'update'>(code ? 'update' : 'request');
  const [loading, setLoading] = useState(!!code); // if we have code, we’ll exchange it immediately
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Request form
  const [email, setEmail] = useState('');

  // Update form
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // When arriving via email link: exchange the code for a session
  useEffect(() => {
    const doExchange = async () => {
      if (!code) return;
      try {
        setErr(null);
        setOk(null);
        setLoading(true);
        // Establish a session from the recovery code
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        setMode('update');
      } catch (e: any) {
        setErr(e?.message ?? 'Could not verify reset link. Please request a new reset email.');
        setMode('request');
      } finally {
        setLoading(false);
      }
    };
    doExchange();
  }, [code]);

  // Simple validators
  const reqIssues = useMemo(() => {
    const m: string[] = [];
    if (!/^\S+@\S+\.\S+$/.test(email)) m.push('Enter a valid email.');
    return m;
  }, [email]);

  const updIssues = useMemo(() => {
    const m: string[] = [];
    if (pw.length < 8) m.push('Password must be at least 8 characters.');
    if (pw !== pw2) m.push('Passwords do not match.');
    return m;
  }, [pw, pw2]);

  const onRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (reqIssues.length) return setErr(reqIssues[0]);

    try {
      setLoading(true);
      setErr(null);
      setOk(null);

      const redirectTo = `${window.location.origin}/reset-password`; // we’ll handle the code here
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;

      setOk('Check your inbox for the reset link.');
      setEmail('');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (updIssues.length) return setErr(updIssues[0]);

    try {
      setLoading(true);
      setErr(null);
      setOk(null);

      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      setOk('Password updated! You can now log in.');
      setPw('');
      setPw2('');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 flex items-center justify-center px-4">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_40px_-16px_rgba(0,0,0,0.25)] p-8"
      >
        {/* Brand */}
        <div className="flex items-center justify-center select-none">
          <span className="font-extrabold tracking-tight text-2xl sm:text-3xl">
            Auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Dispatch
            </span>
            AI
          </span>
        </div>

        {mode === 'request' && (
          <>
            <p className="mt-2 text-center text-sm text-neutral-500">
              Enter your email and we’ll send you a reset link.
            </p>

            <form onSubmit={onRequest} className="mt-6 grid gap-5" autoComplete="off">
              <div className="grid gap-2">
                <label htmlFor="reset_email" className="text-sm text-neutral-700">Email</label>
                <input
                  id="reset_email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="h-11 rounded-xl border border-neutral-300 px-3 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
                />
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 px-3 py-2">
                  {err}
                </div>
              )}
              {ok && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 px-3 py-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {ok}
                </div>
              )}

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold tracking-tight shadow-md disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Sending…' : 'Send reset link'}
              </motion.button>

              <p className="text-sm text-neutral-500 text-center mt-2">
                Remembered your password?{' '}
                <Link href="/login" className="font-medium underline">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
                    Log in
                  </span>
                </Link>
              </p>
            </form>
          </>
        )}

        {mode === 'update' && (
          <>
            <p className="mt-2 text-center text-sm text-neutral-500">
              Set a new password for your account.
            </p>

            <form onSubmit={onUpdate} className="mt-6 grid gap-5" autoComplete="off">
              <div className="grid gap-2">
                <label htmlFor="new_password" className="text-sm text-neutral-700">New password</label>
                <div className="relative">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-neutral-300 px-3 pr-10 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-purple-700 transition"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500">8+ characters recommended.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="confirm_password" className="text-sm text-neutral-700">Confirm new password</label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showPw2 ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-neutral-300 px-3 pr-10 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-purple-700 transition"
                    aria-label={showPw2 ? 'Hide password' : 'Show password'}
                  >
                    {showPw2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 px-3 py-2">
                  {err}
                </div>
              )}
              {ok && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 px-3 py-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {ok}
                </div>
              )}

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                type="submit"
                className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold tracking-tight shadow-md disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Updating…' : 'Update password'}
              </motion.button>

              <p className="text-sm text-neutral-500 text-center mt-2">
                Done here?{' '}
                <Link href="/login" className="font-medium underline">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
                    Log in
                  </span>
                </Link>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
