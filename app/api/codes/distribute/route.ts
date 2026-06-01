import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { codes } = await req.json()

  if (!Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum codigo recebido' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('vote_codes')
    .update({ distributed: true })
    .in('code', codes)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
