import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from '@/lib/admin-auth-shared'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD nao configurada' },
      { status: 500 }
    )
  }

  if (typeof password !== 'string' || !password.trim()) {
    return NextResponse.json(
      { error: 'Password obrigatoria' },
      { status: 400 }
    )
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Password errada' },
      { status: 401 }
    )
  }

  const cookieStore = await cookies()

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    'true',
    getAdminCookieOptions(60 * 60 * 8)
  )

  return NextResponse.json({ success: true })
}
