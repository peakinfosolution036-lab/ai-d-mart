import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/api/auth/forgot-password',
  '/api/auth/resend-code',
  '/api/health',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('/')) {
      return pathname.startsWith(route) || pathname === route.slice(0, -1);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const userId = request.cookies.get('user_id')?.value;

  // If no token, redirect to login
  if (!accessToken || !userId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, allow request to proceed
  // The API routes will validate the token
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
