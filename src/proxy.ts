import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authUserCookie = request.cookies.get('auth_user')?.value;

  const isOwnerRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/rewards');
  const isStaffRoute = pathname.startsWith('/pos');
  const isCustomerRoute = pathname.startsWith('/wallet');

  if (!authUserCookie) {
    if (isOwnerRoute || isStaffRoute || isCustomerRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const user = JSON.parse(authUserCookie) as { role?: string };

    if (isOwnerRoute && user.role !== 'owner') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (isStaffRoute && user.role !== 'staff' && user.role !== 'owner') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/staff/:path*',
    '/rewards/:path*',
    '/pos/:path*',
    '/wallet/:path*',
  ],
};
