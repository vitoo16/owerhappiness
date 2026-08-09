import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'portfolio_session';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/desk');
  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/desk/:path*'],
};
