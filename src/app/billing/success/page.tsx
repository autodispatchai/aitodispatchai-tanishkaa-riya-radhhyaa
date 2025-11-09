'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleSuccess() {
      const supabase = createClient();
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        alert('No payment session found');
        router.push('/billing/choose-plan');
        return;
      }

      try {
        // 1. Verify payment with our API
        const verifyRes = await fetch(`/api/billing/verify-session?session_id=${sessionId}`);
        const verifyData = await verifyRes.json();

        if (!verifyData.ok || !verifyData.customer_email) {
          alert('Payment verification failed');
          router.push('/billing/choose-plan');
          return;
        }

        const email = verifyData.customer_email;

        // 2. Magic link login (no password needed)
        await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });

        // 3. Wait for user to be authenticated
        let user = null;
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            user = data.user;
            break;
          }
          await new Promise(r => setTimeout(r, 800));
        }

        if (!user) {
          alert('Login failed. Please try again.');
          router.push('/login');
          return;
        }

        // 4. Create company if not exists
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!existingCompany) {
          await supabase.from('companies').insert({
            owner_id: user.id,
            name: 'My Fleet',
            email: email,
          });
        }

        // 5. Final redirect to dashboard
        router.push('/app');
      } catch (err) {
        console.error('Success page error:', err);
        alert('Something went wrong. Contact support.');
        router.push('/billing/choose-plan');
      }
    }

    handleSuccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 flex items-center justify-center">
      <div className="text-center p-10 bg-white rounded-3xl shadow-2xl max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Successful!</h1>
        <p className="text-lg text-neutral-600">Setting up your account...</p>
        <p className="text-sm text-neutral-500 mt-4">You will be redirected to your dashboard in a moment.</p>
      </div>
    </div>
  );
}