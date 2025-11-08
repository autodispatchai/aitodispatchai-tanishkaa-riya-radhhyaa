// File: src/app/auth/callback/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Je code hi nahi, user nu login te pa de
  if (!code) {
    return NextResponse.redirect(
      new URL('/login', requestUrl.origin)
    );
  }

  // Next.js da cookie store (Next 14/15 compatible)
  const cookieStore = await cookies();

  // Supabase server client with proper cookie methods
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
          // maxAge 0 = delete
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Supabase nu bolo: eh code use karke session bna
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Supabase exchange code error:', error.message);
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', requestUrl.origin)
    );
  }

  // Sab theek → sidha Create Company onboarding te
  return NextResponse.redirect(
    new URL('/onboarding/create-company', requestUrl.origin)
  );
}
