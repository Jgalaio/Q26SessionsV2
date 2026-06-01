import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from './admin-auth-shared'

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'true'
}

export async function requireAdminPageAccess() {
  if (!(await isAdminAuthenticated())) {
    redirect(ADMIN_LOGIN_PATH)
  }
}
