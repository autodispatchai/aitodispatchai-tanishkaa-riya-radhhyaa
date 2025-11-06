'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Form = { name: string; email: string; password: string };
type OAuthProvider = 'google' | 'azure';

export default function SignupPage() {
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // simple validation
  const issues = useMemo(() => {
    const m: string[] = [];
    if (!form.name.trim()) m.push('Full name is required.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) m.push('Enter a valid email.');
    if (form.password.length < 8) m.push('Password must be at least 8 characters.');
    return m;
  }, [form]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // 🔹 Email + Password Signup
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (issues.length) return setErr(issues[0]);

    setLoading(true);
    setErr(null);
    setOk(null);

    try {
      // 🔸 Redirects to callback (so after email verify → Create Company)
      const emailRedirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim() },
          emailRedirectTo,
        },
      });

      if (error) throw error;
      setOk('Account created! Check your inbox to verify your email.');
      setForm({ name: '', email: '', password: '' });
    } catch (e: any) {
      setErr(e?.message ?? 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gmail & Outlook signup (OAuth)
  const handleOAuth = async (provider: OAuthProvider) => {
    if (loading) return;
    try {
      setErr(null);
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // ✅ unified callback
          queryParams:
            provider === 'google'
              ? { access_type: 'offline', prompt: 'consent' }
              : undefined,
        },
      });
      // Supabase handles redirect automatically
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
          Create your account to get started
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
            title="Microsoft (Outlook)"
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
            <span className="bg-white px-2 text-neutral-500">or sign up with email</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={onSubmit} className="mt-6 grid gap-5" autoComplete="off">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm text-neutral-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={onChange}
              required
              autoComplete="off"
              className="h-11 rounded-xl border border-neutral-300 px-3 text-[15px] focus:ring-2 focus:ring-purple-500/25 focus:outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-neutral-700">
              Email
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="text-sm text-neutral-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="new-password"
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
            <p className="text-xs text-neutral-500">
              8+ characters recommended. You’ll verify your email next.
            </p>
          </div>

          {/* Alerts */}
          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 px-3 py-2">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 px-3 py-2">
              {ok}
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
            {loading ? 'Creating Account…' : 'Sign Up'}
          </motion.button>

          <p className="text-[12px] text-neutral-500 text-center">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline text-neutral-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
                Terms
              </span>
            </Link>{' '}
            &{' '}
            <Link href="/privacy" className="underline text-neutral-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
                Privacy
              </span>
            </Link>
            .
          </p>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium underline">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Log in
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
