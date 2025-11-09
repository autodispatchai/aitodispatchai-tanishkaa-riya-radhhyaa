'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

type Form = { email: string; password: string };
type OAuthProvider = 'google' | 'azure';

const REMEMBER_KEY = 'ada_login_email';

export default function LoginPage() {
  const [form, setForm] = useState<Form>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load remembered email ONLY if user opted-in earlier
  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem(REMEMBER_KEY)
      : null;
    if (saved) {
      setForm((p) => ({ ...p, email: saved }));
      setRemember(true);
    }
  }, []);

  const issues = useMemo(() => {
    const m: string[] = [];
    if (!/^\S+@\S+\.\S+$/.test(form.email)) m.push('Enter a valid email.');
    if (form.password.length < 1) m.push('Password is required.');
    return m;
  }, [form]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (issues.length) {
      setErr(issues[0]);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) throw error;

      // Remember email (never password)
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, form.email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      window.location.href = '/onboarding/create-company';
    } catch (e: any) {
      setErr(
        (e?.message ?? 'Login failed.') +
          ' If you signed up with Google or Outlook, please use the same button above.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    if (loading) return;

    try {
      setErr(null);
      setLoading(true);

      const supabase = createClient();

      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding/create-company`,
          queryParams:
            provider === 'google'
              ? { access_type: 'offline', prompt: 'consent' }
              : undefined,
        },
      });
    } catch (e: any) {
      setErr(e?.message ?? 'OAuth sign-in failed.');
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
        <p className="mt-2 text-center text-sm text-neutral-500">
          If you signed up with <strong>Google</strong> or <strong>Outlook</strong>, please use the same here.
        </p>

        {/* OAuth */}
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="h-11 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('azure')}
            disabled={loading}
            className="h-11 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            title="Microsoft (Azure AD)"
          >
            <img src="/microsoft-icon.svg" alt="Microsoft" className="w-5 h-5" />
            Continue with Outlook
          </button>
        </div>

        {/* Divider */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-500">or log in with email</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={onSubmit} className="mt-6 grid gap-5" autoComplete="off">
          {/* Autofill bait */}
          <input type="text" name="username" autoComplete="username" className="hidden" />
          <input type="password" name="password" autoComplete="current-password" className="hidden" />

          <div className="grid gap-2">
            <label htmlFor="login_email" className="text-sm text-neutral-700">Email</label>
            <input
              id="login_email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="off"
              className="h-11 rounded-xl border border-neutral-300 px-3 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="login_password" className="text-sm text-neutral-700">Password</label>
            <div className="relative">
              <input
                id="login_password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 pr-10 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-neutral-500 hover:text-purple-700 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-neutral-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500/20"
                />
                Remember me (email only)
              </label>

              <Link href="/reset-password" className="text-xs text-neutral-500 hover:text-neutral-800 underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 px-3 py-2">
              {err}
            </div>
          )}

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            type="submit"
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white font-semibold tracking-tight shadow-md disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Log In'}
          </motion.button>

          <p className="text-sm text-neutral-500 text-center mt-4">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-medium underline">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
                Sign up
              </span>
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
