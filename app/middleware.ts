import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from '@/lib/admin-auth-shared'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(ADMIN_COOKIE_NAME)
  const isAuthenticated = authCookie?.value === 'true'

  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/admin', '/codigos', '/qr-print']

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isLoginPage =
    pathname === ADMIN_LOGIN_PATH || pathname === '/admin-login'

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-login',
    '/codigos/:path*',
    '/qr-print/:path*',
  ],
}
