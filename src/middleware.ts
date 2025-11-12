// middleware.ts (ROOT FOLDER MEIN)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl;

  // PROTECTED ROUTES
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/choose-plan')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // AFTER LOGIN → CHECK COMPANY
  if (session && (url.pathname === '/' || url.pathname.startsWith('/signup'))) {
    const { data: company } = await supabase
      .from('companies')
      .select('subscription_status')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (company?.subscription_status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (!company && url.pathname !== '/signup/create-company') {
      return NextResponse.redirect(new URL('/signup/create-company', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};