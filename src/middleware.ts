import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host === 'autodispatchai.com') {
    const url = new URL(req.url);
    url.host = 'www.autodispatchai.com';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Run on all pages
export const config = {
  matcher: ['/((?!_next|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|txt)).*)'],
};
