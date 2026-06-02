'use client'

import { useEffect, useState } from 'react'

type AnalyticsDj = {
  id: string
  name: string
  image_url: string
  votes: number
  percent: number | string
}

type AnalyticsData = {
  totalVotes: number
  stats: AnalyticsDj[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [homeLogoScalePercent, setHomeLogoScalePercent] = useState(100)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch('/api/analytics')
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Erro ao carregar analytics')
        }

        if (isMounted) {
          setData(json)
          setErrorMessage('')
          setLastUpdated(
            new Date().toLocaleTimeString('pt-PT', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          )
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Erro ao carregar analytics'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const json = await res.json()

        if (isMounted) {
          setLogoUrl(json?.logo_url || null)
          setBackgroundUrl(
            json?.home_background_url || json?.vote_background_url || null
          )
          setHomeLogoScalePercent(
            json?.home_logo_scale_percent ?? json?.logo_scale_percent ?? 100
          )
        }
      } catch {}
    }

    void load()
    void loadSettings()

    const interval = setInterval(() => {
      void load()
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <main className="theme-neon-page flex min-h-screen items-center justify-center p-6">
        <div className="theme-neon-shell rounded-[30px] px-8 py-6 text-center">
          <p className="theme-neon-heading text-2xl font-black">
            A carregar analytics...
          </p>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="theme-neon-page flex min-h-screen items-center justify-center p-6">
        <div className="theme-neon-shell max-w-md rounded-[30px] p-6 text-center">
          <p className="theme-neon-heading text-2xl font-black">
            Analytics indisponível
          </p>
          <p className="theme-neon-muted mt-3">
            {errorMessage || 'Não foi possível carregar os dados.'}
          </p>
        </div>
      </main>
    )
  }

  const top3 = data.stats.slice(0, 3)
  const remaining = data.stats.slice(3)
  const leader = data.stats[0]
  const activeDjs = data.stats.filter((dj) => dj.votes > 0).length
  const maxVotes = Math.max(0, ...data.stats.map((dj) => dj.votes))
  const averageVotes =
    data.stats.length > 0 ? Math.round(data.totalVotes / data.stats.length) : 0

  return (
    <main
      className="theme-neon-page relative min-h-screen overflow-hidden bg-cover bg-center px-4 py-6 text-white md:px-6 md:py-8"
      style={
        backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined
      }
    >
      <div className="theme-neon-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,88,208,0.22),transparent_22%),radial-gradient(circle_at_88%_12%,rgba(110,231,255,0.16),transparent_18%),linear-gradient(180deg,rgba(4,4,15,0.42),rgba(4,4,15,0.78),rgba(3,3,11,0.96))]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="theme-neon-shell rounded-[34px] p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em]">
                Analytics
              </div>

              <h1 className="theme-neon-heading mt-5 text-3xl font-black uppercase tracking-[0.14em] md:text-5xl">
                Métricas da votação
              </h1>

              <p className="theme-neon-muted mt-4 max-w-2xl text-sm leading-6 md:text-base">
                Leitura rápida da distribuição de votos, liderança atual e
                participação por DJ.
              </p>

              {lastUpdated && (
                <p className="mt-4 text-sm text-white/55">
                  Última atualização: {lastUpdated}
                </p>
              )}
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

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[440px]">
                <MetricCard label="Total de votos" value={String(data.totalVotes)} />
                <MetricCard label="DJs com votos" value={`${activeDjs}/${data.stats.length}`} />
                <MetricCard
                  label="Líder atual"
                  value={leader ? leader.name : 'Sem dados'}
                />
                <MetricCard label="Média por DJ" value={String(averageVotes)} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="theme-neon-shell rounded-[34px] p-5 md:p-6">
            <div className="mb-5">
              <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                Top 3
              </p>
              <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                Pódio da noite
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {top3.map((dj, index) => (
                <TopDjCard
                  key={dj.id}
                  rank={index + 1}
                  name={dj.name}
                  imageUrl={dj.image_url}
                  votes={dj.votes}
                  percent={formatPercent(dj.percent)}
                />
              ))}

              {top3.length === 0 && (
                <div className="theme-neon-panel rounded-[24px] p-6 text-center text-white/62">
                  Ainda não há votos para formar o pódio.
                </div>
              )}
            </div>
          </div>

          <div className="theme-neon-shell rounded-[34px] p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  Distribuição
                </p>
                <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                  Votos por DJ
                </h2>
              </div>

              <div className="theme-neon-stat rounded-2xl px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Maior votação
                </p>
                <p className="theme-neon-heading text-2xl font-black">
                  {maxVotes}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {data.stats.map((dj, index) => (
                <DistributionRow
                  key={dj.id}
                  rank={index + 1}
                  name={dj.name}
                  imageUrl={dj.image_url}
                  votes={dj.votes}
                  percent={formatPercent(dj.percent)}
                  width={percentWidth(dj.percent)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="theme-neon-shell rounded-[34px] p-5 md:p-6">
          <div className="mb-5">
            <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
              Tabela completa
            </p>
            <h2 className="theme-neon-heading mt-4 text-2xl font-black">
              Restantes posições
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {remaining.map((dj, index) => (
              <CompactDjCard
                key={dj.id}
                rank={index + 4}
                name={dj.name}
                imageUrl={dj.image_url}
                votes={dj.votes}
                percent={formatPercent(dj.percent)}
              />
            ))}

            {remaining.length === 0 && (
              <div className="theme-neon-panel rounded-[24px] p-6 text-center text-white/62 md:col-span-2 xl:col-span-3">
                Não existem mais posições para mostrar.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function formatPercent(value: number | string) {
  return `${value}%`
}

function percentWidth(value: number | string) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return 0
  }

  return Math.max(0, Math.min(100, numeric))
}

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({
  label,
  value,
}: MetricCardProps) {
  return (
    <div className="theme-neon-stat rounded-[24px] px-5 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">
        {label}
      </p>
      <p className="theme-neon-heading mt-2 truncate text-2xl font-black">
        {value}
      </p>
    </div>
  )
}

type TopDjCardProps = {
  rank: number
  name: string
  imageUrl: string
  votes: number
  percent: string
}

function TopDjCard({
  rank,
  name,
  imageUrl,
  votes,
  percent,
}: TopDjCardProps) {
  const label = rank === 1 ? 'Líder' : `#${rank}`

  return (
    <article className="theme-neon-panel overflow-hidden rounded-[28px]">
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="h-44 w-full object-cover md:h-52 xl:h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050513]/95 via-[#0c1230]/28 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
          {label}
        </div>
      </div>

      <div className="p-5">
        <p className="theme-neon-heading truncate text-2xl font-black">
          {name}
        </p>
        <p className="mt-2 text-sm text-white/65">
          {votes} votos • {percent}
        </p>
      </div>
    </article>
  )
}

type DistributionRowProps = {
  rank: number
  name: string
  imageUrl: string
  votes: number
  percent: string
  width: number
}

function DistributionRow({
  rank,
  name,
  imageUrl,
  votes,
  percent,
  width,
}: DistributionRowProps) {
  return (
    <div className="theme-neon-panel rounded-[24px] p-4">
      <div className="flex items-center gap-4">
        <div className="theme-neon-stat flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black">
          #{rank}
        </div>

        <img
          src={imageUrl}
          alt={name}
          className="h-14 w-14 rounded-2xl border border-white/14 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="theme-neon-heading truncate text-lg font-black">
              {name}
            </p>
            <p className="text-sm font-semibold text-white/70">
              {votes} votos • {percent}
            </p>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 shadow-[0_0_18px_rgba(110,231,255,0.34)] transition-all duration-700"
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type CompactDjCardProps = {
  rank: number
  name: string
  imageUrl: string
  votes: number
  percent: string
}

function CompactDjCard({
  rank,
  name,
  imageUrl,
  votes,
  percent,
}: CompactDjCardProps) {
  return (
    <article className="theme-neon-panel rounded-[24px] p-4">
      <div className="flex items-center gap-3">
        <img
          src={imageUrl}
          alt={name}
          className="h-14 w-14 rounded-2xl border border-white/14 object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="theme-neon-heading truncate text-base font-black md:text-lg">
            #{rank} {name}
          </p>
          <p className="mt-1 text-sm text-white/62">
            {votes} votos • {percent}
          </p>
        </div>
      </div>
    </article>
  )
}
