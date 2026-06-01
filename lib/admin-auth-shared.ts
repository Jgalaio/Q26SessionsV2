export const ADMIN_COOKIE_NAME = 'admin_auth'
export const ADMIN_LOGIN_PATH = '/admin/login'

export function getAdminCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  }
}
