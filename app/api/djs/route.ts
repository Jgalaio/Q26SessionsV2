import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('djs')
    .select('*')
    .order('created_at')

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { name, image_url } = await req.json()

  if (
    typeof name !== 'string' ||
    typeof image_url !== 'string' ||
    !name.trim() ||
    !image_url.trim()
  ) {
    return NextResponse.json(
      { error: 'Dados invalidos' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin.from('djs').insert([
    { name: name.trim(), image_url: image_url.trim() },
  ])

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { id } = await req.json()

  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json(
      { error: 'ID invalido' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('djs')
    .delete()
    .eq('id', id.trim())

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
