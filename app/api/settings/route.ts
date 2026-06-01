import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { voting_open } = await req.json()

  if (typeof voting_open !== 'boolean') {
    return NextResponse.json(
      { error: 'Estado invalido' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('settings')
    .update({ voting_open })
    .eq('id', 1)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
