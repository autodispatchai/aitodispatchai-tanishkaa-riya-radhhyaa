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

  // AFTER LOGIN → RESUME FLOW
  if (session) {
    // Skip redirect if already on correct page
    if (url.pathname.startsWith('/dashboard') || 
        url.pathname.startsWith('/billing') || 
        url.pathname.startsWith('/onboarding/create-company') ||
        url.pathname.startsWith('/choose-plan') ||
        url.pathname.startsWith('/api')) {
      return res;
    }

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
        // User has active subscription → redirect to dashboard
        if (url.pathname === '/' || url.pathname.startsWith('/signup') || url.pathname.startsWith('/login')) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } else {
        // Company exists but no active subscription → redirect to choose-plan
        if (url.pathname === '/' || url.pathname.startsWith('/signup') || url.pathname.startsWith('/login')) {
          return NextResponse.redirect(new URL('/choose-plan', req.url));
        }
      }
    } else {
      // No company → redirect to onboarding
      if (url.pathname === '/' || url.pathname.startsWith('/signup') || url.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/onboarding/create-company', req.url));
      }
    }
  }

  // PROTECT BILLING ROUTE (requires auth)
  if (url.pathname.startsWith('/billing')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};