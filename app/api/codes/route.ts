import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdminApiAccess } from '@/lib/admin-api-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 1000

type VoteCodeRow = {
  code: string
  used: boolean | null
  distributed: boolean | null
}

export async function GET() {
  const unauthorized = await requireAdminApiAccess()

  if (unauthorized) {
    return unauthorized
  }

  const codes: VoteCodeRow[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('vote_codes')
      .select('code, used, distributed')
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    codes.push(...(data || []))

    if (!data || data.length < PAGE_SIZE) {
      break
    }

    from += PAGE_SIZE
  }

  return NextResponse.json(codes, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
