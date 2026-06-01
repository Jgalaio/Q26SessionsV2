import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const CODE_REGEX = /^PS-[A-Z0-9]{4}-\d{6}$/

export async function POST(req: Request) {
  let reservedCode: string | null = null

  try {
    const { code, dj_id } = await req.json()
    const normalizedCode =
      typeof code === 'string' ? code.trim().toUpperCase() : ''

    if (!CODE_REGEX.test(normalizedCode)) {
      return NextResponse.json(
        { error: 'Codigo invalido' },
        { status: 400 }
      )
    }

    if (typeof dj_id !== 'string' || !dj_id.trim()) {
      return NextResponse.json(
        { error: 'DJ invalido' },
        { status: 400 }
      )
    }

    // ================= IP REAL =================
    const rawIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const ip = rawIp.split(',')[0].trim()

    // ================= SETTINGS =================
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsError) throw settingsError

    if (!settings?.voting_open) {
      return NextResponse.json(
        { error: 'Votacao fechada' },
        { status: 403 }
      )
    }

    // ================= VALIDAR DJ =================
    const { data: djData, error: djError } = await supabaseAdmin
      .from('djs')
      .select('id')
      .eq('id', dj_id)
      .maybeSingle()

    if (djError) throw djError

    if (!djData) {
      return NextResponse.json(
        { error: 'DJ invalido' },
        { status: 400 }
      )
    }

    // ================= LIMITE POR IP =================
    const LIMIT = 50

    const { count, error: countError } = await supabaseAdmin
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)

    if (countError) throw countError

    if ((count || 0) >= LIMIT) {
      return NextResponse.json(
        { error: 'Limite de votos atingido' },
        { status: 429 }
      )
    }

    // ================= RESERVAR CÓDIGO =================
    const { data: reservedVoteCode, error: reserveError } = await supabaseAdmin
      .from('vote_codes')
      .update({ used: true })
      .eq('code', normalizedCode)
      .eq('used', false)
      .select('code')
      .maybeSingle()

    if (reserveError) throw reserveError

    if (!reservedVoteCode) {
      const { data: voteCode, error: codeError } = await supabaseAdmin
        .from('vote_codes')
        .select('used')
        .eq('code', normalizedCode)
        .maybeSingle()

      if (codeError) throw codeError

      return NextResponse.json(
        {
          error: voteCode ? 'Codigo ja utilizado' : 'Codigo invalido',
        },
        { status: 400 }
      )
    }

    reservedCode = normalizedCode

    // ================= INSERIR VOTO =================
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert([
        {
          code: normalizedCode,
          dj_id,
          ip,
        },
      ])

    if (voteError) throw voteError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    if (reservedCode) {
      await supabaseAdmin
        .from('vote_codes')
        .update({ used: false })
        .eq('code', reservedCode)
    }

    console.error('🔥 ERRO VOTO:', error)

    return NextResponse.json(
      { error: error.message || 'Erro ao votar' },
      { status: 500 }
    )
  }
}
