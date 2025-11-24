import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/choose-plan(.*)',
]);

// Define public routes that should redirect if authenticated
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // Protect routes that require authentication
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('redirect_url', url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from public auth pages
  if (isPublicRoute(req) && userId) {
    // TODO: Check company and subscription status
    // For now, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
