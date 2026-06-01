import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data: votes } = await supabaseAdmin.from('votes').select('dj_id')
  const { data: djs } = await supabaseAdmin.from('djs').select('*')

  const totalVotes = votes?.length || 0

  const stats = djs?.map((dj) => {
    const djVotes = votes?.filter(v => v.dj_id === dj.id).length || 0

    return {
      ...dj,
      votes: djVotes,
      percent: totalVotes ? ((djVotes / totalVotes) * 100).toFixed(1) : 0,
    }
  }) || []

  stats.sort((a, b) => b.votes - a.votes)

  return NextResponse.json({
    totalVotes,
    stats,
  })
}
