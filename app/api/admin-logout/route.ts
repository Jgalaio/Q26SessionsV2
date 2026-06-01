import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from '@/lib/admin-auth-shared'

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, '', getAdminCookieOptions(0))

  return NextResponse.json({ success: true })
}
