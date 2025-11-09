// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const pathname = url.pathname;

  // Agar login page pe hai aur already logged in → company check karo
  if (session && pathname === '/login') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (company) {
      return NextResponse.redirect(new URL('/app', req.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // Agar billing ya app pe ja raha hai aur company nahi bani → onboarding pe bhej do
  if (session && (pathname.startsWith('/billing') || pathname.startsWith('/app'))) {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (!company) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // Agar onboarding complete kar diya → choose plan pe bhej do
  if (session && pathname === '/onboarding') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (company) {
      return NextResponse.redirect(new URL('/billing/choose-plan', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/login', '/onboarding', '/billing/:path*', '/app/:path*'],
};