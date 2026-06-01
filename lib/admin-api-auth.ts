import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from './admin-auth-shared'

export async function requireAdminApiAccess() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'true'

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Nao autorizado' },
      { status: 401 }
    )
  }

  return null
}
