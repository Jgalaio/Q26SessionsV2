import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomBlock(length = 4) {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function generateCode(index: number) {
  return `PS-${randomBlock(4)}-${String(index).padStart(6, '0')}`
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { total } = await req.json()

  if (!Number.isInteger(total) || total <= 0 || total > 100000) {
    return NextResponse.json(
      { error: 'Número inválido (máx 100k)' },
      { status: 400 }
    )
  }

  const used = new Set()
  const codes = []

  for (let i = 1; i <= total; i++) {
    let code
    do {
      code = generateCode(i)
    } while (used.has(code))

    used.add(code)

    codes.push({
      code,
      used: false,
    })
  }

  const { error } = await supabaseAdmin
    .from('vote_codes')
    .insert(codes)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    total,
  })
}
