import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signInWithGoogle() {
  return supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signInWithOutlook() {
  return supabaseClient.auth.signInWithOAuth({
    provider: 'azure', // Supabase Auth → Provider name jida tusi enable kita
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
