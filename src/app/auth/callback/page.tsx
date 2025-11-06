'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      const code = params.get('code');
      const type = params.get('type');

      if (!code) {
        router.replace('/login');
        return;
      }

      // Try exchanging code for session (OAuth, signup, invite)
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Exchange error:', error.message);

        // fallback: redirect login if invite code expired or invalid
        router.replace('/login?error=callback');
        return;
      }

      // ✅ unified redirect after success
      if (type === 'recovery') {
        router.replace('/auth/reset-password');
      } else {
        router.replace('/onboarding/create-company');
      }
    })();
  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen text-sm text-neutral-600">
      Completing sign-in…
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-neutral-600">
      Loading…
    </div>}>
      <CallbackInner />
    </Suspense>
  );
}
