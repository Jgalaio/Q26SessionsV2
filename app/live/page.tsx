'use client'

import { useEffect, useState } from 'react'

const DEFAULT_EVENT_TITLE = 'Q26 Sessions'

type LiveDj = {
  id: string
  name: string
  image_url: string
  votes: number
  percent: number | string
}

type LiveData = {
  totalVotes: number
  stats: LiveDj[]
}

export default function LivePage() {
  const [data, setData] = useState<LiveData | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState(DEFAULT_EVENT_TITLE)
  const [showEventTitle, setShowEventTitle] = useState(true)
  const [homeLogoScalePercent, setHomeLogoScalePercent] = useState(100)

  useEffect(() => {
    void fetchData()
    void fetchSettings()

    const interval = setInterval(() => {
      void fetchData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    const res = await fetch('/api/analytics')
    const json = await res.json()
    setData(json)
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const json = await res.json()

      setLogoUrl(json?.logo_url || null)
      setEventTitle(json?.event_title || DEFAULT_EVENT_TITLE)
      setShowEventTitle(json?.show_event_title_live ?? true)
      setBackgroundUrl(
        json?.home_background_url || json?.vote_background_url || null
      )
      setHomeLogoScalePercent(
        json?.home_logo_scale_percent ?? json?.logo_scale_percent ?? 100
      )
    } catch {}
  }

  if (!data) {
    return (
      <main className="theme-neon-page flex min-h-screen items-center justify-center p-6">
        <div className="theme-neon-shell rounded-[30px] px-8 py-6">
          <p className="theme-neon-heading text-2xl font-black">
            A carregar live...
          </p>
        </div>
      </main>
    )
  }

  const leader = data.stats[0]
  const runnersUp = data.stats.slice(1, 4)
  const remaining = data.stats.slice(4)

  return (
    <main
      className="theme-neon-page relative min-h-screen overflow-hidden bg-cover bg-center px-4 py-6 text-white md:px-6 md:py-8"
      style={
        backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined
      }
    >
      <div className="theme-neon-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,88,208,0.24),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(110,231,255,0.16),transparent_18%),linear-gradient(180deg,rgba(4,4,15,0.35),rgba(4,4,15,0.72),rgba(3,3,11,0.95))]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <section className="theme-neon-shell rounded-[34px] p-5 md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em]">
                Live ranking
              </div>

              <h1 className="theme-neon-heading mt-4 text-3xl font-black uppercase tracking-[0.18em] md:text-5xl">
                Votação em direto
              </h1>

              <p className="theme-neon-muted mt-3 text-sm leading-6 md:text-lg">
                {showEventTitle
                  ? `Acompanha em tempo real quem está a dominar a pista nesta edição do ${eventTitle}.`
                  : 'Acompanha em tempo real quem está a dominar a pista nesta edição.'}
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <img
                src={logoUrl || '/tittle.png'}
                alt="Logo"
                className="theme-neon-logo h-auto w-auto"
                style={{
                  maxHeight: `${86 * (homeLogoScalePercent / 100)}px`,
                  maxWidth: `${230 * (homeLogoScalePercent / 100)}px`,
                }}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <LiveStatCard
                  label="Votos totais"
                  value={String(data.totalVotes)}
                />
                <LiveStatCard
                  label="DJs ativos"
                  value={String(data.stats.length)}
                />
                <LiveStatCard
                  label="Líder"
                  value={leader ? `#1 ${leader.name}` : 'Sem dados'}
                />
              </div>
            </div>
          </div>
        </section>

        {leader ? (
          <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
            <div className="theme-neon-shell rounded-[34px] p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                    Em 1º lugar
                  </p>
                  <h2 className="theme-neon-heading mt-4 text-2xl font-black uppercase tracking-[0.14em] md:text-4xl">
                    {leader.name}
                  </h2>
                </div>

                <div className="theme-neon-stat rounded-2xl px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                    Votos
                  </p>
                  <p className="theme-neon-heading text-3xl font-black">
                    {leader.votes}
                  </p>
                  <p className="text-sm text-white/60">
                    {formatPercent(leader.percent)} do total
                  </p>
                </div>
              </div>

              <div className="theme-neon-panel overflow-hidden rounded-[30px]">
                <div className="relative">
                  <img
                    src={leader.image_url}
                    alt={leader.name}
                    className="h-[300px] w-full object-cover md:h-[420px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050513]/96 via-[#0b1130]/24 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(110,231,255,0.45)]">
                    🥇 Líder atual
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="theme-neon-shell rounded-[26px] px-5 py-4">
                      <p className="theme-neon-heading text-2xl font-black md:text-3xl">
                        {leader.name}
                      </p>
                      <p className="mt-2 text-base text-white/74 md:text-lg">
                        {leader.votes} votos com {formatPercent(leader.percent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <section className="theme-neon-shell rounded-[34px] p-5 md:p-6">
                <div className="mb-5">
                  <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                    Pódio perseguidor
                  </p>
                  <h3 className="theme-neon-heading mt-4 text-2xl font-black">
                    Quem vem a seguir
                  </h3>
                </div>

                <div className="space-y-4">
                  {runnersUp.map((dj, index) => (
                    <LiveRankingRow
                      key={dj.id}
                      rank={index + 2}
                      name={dj.name}
                      imageUrl={dj.image_url}
                      votes={dj.votes}
                      percent={formatPercent(dj.percent)}
                    />
                  ))}

                  {runnersUp.length === 0 && (
                    <div className="theme-neon-panel rounded-[24px] p-5 text-center text-white/60">
                      Ainda não há mais posições para mostrar.
                    </div>
                  )}
                </div>
              </section>

              <section className="theme-neon-shell rounded-[34px] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                      Grelha completa
                    </p>
                    <h3 className="theme-neon-heading mt-4 text-2xl font-black">
                      Restantes posições
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {remaining.map((dj, index) => (
                    <LiveCompactCard
                      key={dj.id}
                      rank={index + 5}
                      name={dj.name}
                      imageUrl={dj.image_url}
                      votes={dj.votes}
                      percent={formatPercent(dj.percent)}
                    />
                  ))}

                  {remaining.length === 0 && (
                    <div className="theme-neon-panel rounded-[24px] p-5 text-center text-white/60 md:col-span-2">
                      Não existem mais DJs fora do top 4 neste momento.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>
        ) : (
          <section className="theme-neon-shell flex flex-1 items-center justify-center rounded-[34px] p-6 text-center">
            <div>
              <p className="theme-neon-heading text-3xl font-black">
                Ainda sem votos
              </p>
              <p className="theme-neon-muted mt-3 text-lg">
                A live vai ganhar vida assim que entrarem os primeiros votos.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function formatPercent(value: number | string) {
  return `${value}%`
}

type LiveStatCardProps = {
  label: string
  value: string
}

function LiveStatCard({
  label,
  value,
}: LiveStatCardProps) {
  return (
    <div className="theme-neon-stat rounded-2xl px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">
        {label}
      </p>
      <p className="theme-neon-heading mt-2 text-xl font-black md:text-2xl">
        {value}
      </p>
    </div>
  )
}

type LiveRankingRowProps = {
  rank: number
  name: string
  imageUrl: string
  votes: number
  percent: string
}

function LiveRankingRow({
  rank,
  name,
  imageUrl,
  votes,
  percent,
}: LiveRankingRowProps) {
  return (
    <div className="theme-neon-panel rounded-[24px] p-4">
      <div className="flex items-center gap-4">
        <div className="theme-neon-stat flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black">
          #{rank}
        </div>

        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 rounded-2xl border border-white/14 object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="theme-neon-heading truncate text-lg font-black">
            {name}
          </p>
          <p className="mt-1 text-sm text-white/62">
            {votes} votos • {percent}
          </p>
        </div>
      </div>
    </div>
  )
}

type LiveCompactCardProps = {
  rank: number
  name: string
  imageUrl: string
  votes: number
  percent: string
}

function LiveCompactCard({
  rank,
  name,
  imageUrl,
  votes,
  percent,
}: LiveCompactCardProps) {
  return (
    <div className="theme-neon-panel rounded-[24px] p-4">
      <div className="flex items-center gap-3">
        <img
          src={imageUrl}
          alt={name}
          className="h-14 w-14 rounded-2xl border border-white/14 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="theme-neon-heading truncate text-base font-black md:text-lg">
              #{rank} {name}
            </p>
            <span className="theme-neon-chip rounded-full px-3 py-1 text-xs font-semibold">
              {votes}
            </span>
          </div>

          <p className="mt-2 text-sm text-white/62">{percent} do total</p>
        </div>
      </div>
    </div>
  )
}
