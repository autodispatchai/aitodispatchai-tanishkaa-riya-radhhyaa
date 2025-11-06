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

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Exchange error:', error);
        router.replace('/login?error=callback');
        return;
      }

      let next = '/onboarding/create-company';
      if (type === 'invite') next += '?from=invite';
      else if (type === 'signup') next += '?from=verify';
      else if (type === 'oauth') next += '?from=oauth';
      else if (type === 'recovery') next = '/auth/reset-password';

      router.replace(next);
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
