// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => req.cookies.get(name)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl;

  // Agar logged in nahi → login pe bhej do
  const protectedPaths = ['/billing', '/app', '/onboarding'];
  if (!session && protectedPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Agar logged in hai lekin company nahi → onboarding pe bhej do
  if (session && url.pathname === '/billing/choose-plan') {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (!company) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/billing/:path*', '/onboarding', '/app/:path*'],
};