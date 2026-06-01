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

  const body = await req.json()
  const updates: Record<string, boolean | string | null> = {}

  if ('voting_open' in body) {
    if (typeof body.voting_open !== 'boolean') {
      return NextResponse.json(
        { error: 'Estado invalido' },
        { status: 400 }
      )
    }

    updates.voting_open = body.voting_open
  }

  if ('home_background_url' in body) {
    if (
      body.home_background_url !== null &&
      typeof body.home_background_url !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Fundo da pagina principal invalido' },
        { status: 400 }
      )
    }

    updates.home_background_url = body.home_background_url?.trim() || null
  }

  if ('vote_background_url' in body) {
    if (
      body.vote_background_url !== null &&
      typeof body.vote_background_url !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Fundo da pagina de voto invalido' },
        { status: 400 }
      )
    }

    updates.vote_background_url = body.vote_background_url?.trim() || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma alteracao recebida' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('settings')
    .update(updates)
    .eq('id', 1)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
