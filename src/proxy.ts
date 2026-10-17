import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * BrewFlow Route Guard & Demo Dispatcher
 * Allows zero-config exploration of Customer Ordering, Barista Queue, and Owner Dashboard for portfolio evaluators.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authUserCookie = request.cookies.get('auth_user')?.value;

  // In demo portfolio mode, all primary surfaces are directly accessible.
  // We attach a simulated role cookie if none is present so downstream components work seamlessly.
  const response = NextResponse.next();

  if (!authUserCookie) {
    let demoRole = 'customer';
    let demoName = 'Demo Visitor';

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/rewards') || pathname.startsWith('/staff')) {
      demoRole = 'owner';
      demoName = 'Eleanor Roaster (Owner)';
    } else if (pathname.startsWith('/queue') || pathname.startsWith('/pos')) {
      demoRole = 'staff';
      demoName = 'Chloe Barista';
    }

    response.cookies.set(
      'auth_user',
      JSON.stringify({
        id: `demo-${demoRole}`,
        email: `${demoRole}@brewflow.internal`,
        name: demoName,
        role: demoRole,
      }),
      { path: '/', maxAge: 60 * 60 * 24 * 7 }
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/staff/:path*',
    '/rewards/:path*',
    '/pos/:path*',
    '/queue/:path*',
    '/wallet/:path*',
  ],
};
