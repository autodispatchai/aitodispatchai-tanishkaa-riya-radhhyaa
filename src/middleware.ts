// middleware.ts (ROOT FOLDER MEIN)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl;

  // PROTECTED ROUTES (only dashboard requires auth)
  if (url.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // AFTER LOGIN → CHECK COMPANY
  if (session && (url.pathname === '/' || url.pathname.startsWith('/signup'))) {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', session.user.id)
      .maybeSingle();

    if (company) {
      // Check subscription status from subscriptions table
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('company_id', company.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscription) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    if (!company && url.pathname !== '/create-company') {
      return NextResponse.redirect(new URL('/create-company', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};