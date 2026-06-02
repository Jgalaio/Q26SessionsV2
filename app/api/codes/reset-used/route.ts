import { NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const { data, error } = await supabaseAdmin
    .from('vote_codes')
    .update({
      used: false,
      distributed: false,
    })
    .not('id', 'is', null)
    .select('code')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    total: data?.length || 0,
  })
}
