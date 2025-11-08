// File: src/app/auth/callback/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  // Je code hi nahi, seedha login te bhej do
  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // ✅ Next.js cookies helper (Next 15 style - async)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0, // delete
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Supabase exchange code error:', error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // ✅ Code sahi → session set → seedha Create Company wal
  return NextResponse.redirect(`${origin}/onboarding/create-company`);
}
