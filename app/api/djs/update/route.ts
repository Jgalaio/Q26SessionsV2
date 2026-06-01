import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { id, name } = await req.json()

  if (
    typeof id !== 'string' ||
    !id.trim() ||
    typeof name !== 'string' ||
    !name.trim()
  ) {
    return NextResponse.json(
      { error: 'Dados invalidos' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('djs')
    .update({ name: name.trim() })
    .eq('id', id.trim())

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
