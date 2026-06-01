import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data: votes } = await supabaseAdmin
    .from('votes')
    .select('dj_id')

  const { data: djs } = await supabaseAdmin
    .from('djs')
    .select('*')

  const counts: Record<string, number> = {}

  votes?.forEach((v) => {
    counts[v.dj_id] = (counts[v.dj_id] || 0) + 1
  })

  const ranking = djs?.map((dj) => ({
    ...dj,
    votes: counts[dj.id] || 0,
  }))

  ranking?.sort((a, b) => b.votes - a.votes)

  return NextResponse.json(ranking)
}