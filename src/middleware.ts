import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has session cookie (lightweight check)
  const sessionCookie = request.cookies.get('session');
  const hasSession = !!sessionCookie;

  // Public routes that don't require authentication
  const isPublicMenuRoute = /^\/[a-z0-9\-]+$/i.test(pathname); // /:slug format
  const isLoginRoute = pathname === '/login';
  const isApiPublicRoute = pathname.startsWith('/api/public');
  const isApiAuthRoute = pathname.startsWith('/api/auth'); // Auth routes should be accessible

  // Allow public routes
  if (isPublicMenuRoute || isLoginRoute || isApiPublicRoute || isApiAuthRoute) {
    return NextResponse.next();
  }

  // Protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isTenantRoute = pathname.startsWith('/dashboard') ||
                        pathname.startsWith('/menu') ||
                        pathname.startsWith('/settings') ||
                        pathname.startsWith('/preview');
  const isApiRoute = pathname.startsWith('/api') && !isApiPublicRoute;

  // Redirect to login if not authenticated and trying to access protected route
  if (!hasSession && (isAdminRoute || isTenantRoute || isApiRoute)) {
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow authenticated users to access - RBAC will be checked in each page/API route
  // This keeps middleware edge-compatible

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
