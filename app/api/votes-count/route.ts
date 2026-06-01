import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { count } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ count: count ?? 0 })
}
