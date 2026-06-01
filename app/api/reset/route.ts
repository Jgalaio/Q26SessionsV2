import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  try {
    // 🔥 apagar TODOS os votos
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .delete()
      .not('id', 'is', null) // ✅ FIX REAL

    if (votesError) throw votesError

    // 🔥 reset códigos
    const { error: codesError } = await supabaseAdmin
      .from('vote_codes')
      .update({
        used: false,
      })
      .not('id', 'is', null) // ✅ igual aqui

    if (codesError) throw codesError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('RESET ERROR:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
