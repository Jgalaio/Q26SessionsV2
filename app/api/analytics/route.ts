import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: votes } = await supabase.from('votes').select('dj_id')
  const { data: djs } = await supabase.from('djs').select('*')

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