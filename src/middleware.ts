import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add privacy and security headers
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
