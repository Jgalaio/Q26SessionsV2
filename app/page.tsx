'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_EVENT_TITLE = 'Q26 Sessions'
const DEFAULT_HOME_SUBTITLE = 'Vota no teu DJ favorito'
type HomeSubtitleMode = 'text' | 'image'

export default function HomePage() {
  const [djs, setDjs] = useState<any[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [homeBackgroundUrl, setHomeBackgroundUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState(DEFAULT_EVENT_TITLE)
  const [homeSubtitle, setHomeSubtitle] = useState(DEFAULT_HOME_SUBTITLE)
  const [homeSubtitleMode, setHomeSubtitleMode] =
    useState<HomeSubtitleMode>('text')
  const [homeSubtitleImageUrl, setHomeSubtitleImageUrl] = useState<string | null>(null)
  const [homeSubtitleImageScalePercent, setHomeSubtitleImageScalePercent] =
    useState(100)
  const [showEventTitle, setShowEventTitle] = useState(true)
  const [homeLogoScalePercent, setHomeLogoScalePercent] = useState(100)

  useEffect(() => {
    fetchRanking()
    fetchSettings()
  }, [])

  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()

    const total = data.reduce((acc: number, dj: any) => acc + dj.votes, 0)

    setTotalVotes(total)
    setDjs(data)
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setHomeBackgroundUrl(data?.home_background_url || null)
    setLogoUrl(data?.logo_url || null)
    setEventTitle(data?.event_title || DEFAULT_EVENT_TITLE)
    setHomeSubtitle(data?.home_subtitle || DEFAULT_HOME_SUBTITLE)
    setHomeSubtitleMode(data?.home_subtitle_mode === 'image' ? 'image' : 'text')
    setHomeSubtitleImageUrl(data?.home_subtitle_image_url || null)
    setHomeSubtitleImageScalePercent(
      data?.home_subtitle_image_scale_percent ?? 100
    )
    setShowEventTitle(data?.show_event_title_home ?? true)
    setHomeLogoScalePercent(
      data?.home_logo_scale_percent ?? data?.logo_scale_percent ?? 100
    )
  }

  return (
    <main
      className="theme-neon-page relative min-h-screen overflow-hidden px-6 py-8 bg-cover bg-center"
      style={
        homeBackgroundUrl
          ? { backgroundImage: `url(${homeBackgroundUrl})` }
          : undefined
      }
    >
      <div className="theme-neon-overlay absolute inset-0" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* TÍTULO */}
        <div className="theme-neon-shell rounded-[32px] px-6 py-8 md:px-10 md:py-10 text-center mb-10">
          {showEventTitle && (
            <div className="theme-neon-chip inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em]">
              {eventTitle}
            </div>
          )}

          <img
            src={logoUrl || '/tittle.png'}
            alt="Logo"
            className={`theme-neon-logo mx-auto mb-4 h-auto w-auto ${
              showEventTitle ? 'mt-6' : ''
            }`}
            style={{
              maxHeight: `${112 * (homeLogoScalePercent / 100)}px`,
              maxWidth: `${250 * (homeLogoScalePercent / 100)}px`,
            }}
          />

          {homeSubtitleMode === 'image' && homeSubtitleImageUrl ? (
            <img
              src={homeSubtitleImageUrl}
              alt={homeSubtitle}
              className="theme-neon-logo mx-auto h-auto w-auto"
              style={{
                maxHeight: `${82 * (homeSubtitleImageScalePercent / 100)}px`,
                maxWidth: `${520 * (homeSubtitleImageScalePercent / 100)}px`,
              }}
            />
          ) : (
            <p className="theme-neon-heading text-lg font-semibold md:text-xl">
              {homeSubtitle}
            </p>
          )}
        </div>

        {/* 🏆 TOP 3 */}
        {djs.length >= 3 && (
          <div className="mb-10 text-center">
            <div className="theme-neon-shell rounded-[28px] px-5 py-6 md:px-8">
              <h2 className="theme-neon-heading text-xl font-black mb-5 uppercase tracking-[0.22em]">
                Top DJs
              </h2>

              <div className="flex flex-col md:flex-row justify-center gap-4">

                {djs.slice(0, 3).map((dj, index) => {
                  const percent =
                    totalVotes > 0
                      ? Math.round((dj.votes / totalVotes) * 100)
                      : 0

                  const medals = ['🥇', '🥈', '🥉']

                  return (
                    <div
                      key={dj.id}
                      className="theme-neon-stat px-6 py-5 rounded-3xl min-w-[210px]"
                    >
                      <p className="text-lg font-black theme-neon-heading">
                        {medals[index]} {dj.name}
                      </p>

                      <p className="mt-2 text-sm theme-neon-muted">
                        {percent}% dos votos
                      </p>
                    </div>
                  )
                })}

              </div>
            </div>
          </div>
        )}

        {/* GRID DJs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

          {djs.map((dj, index) => {
            const percent =
              totalVotes > 0
                ? Math.round((dj.votes / totalVotes) * 100)
                : 0

            const isLeader = index === 0

            return (
              <motion.a
                key={dj.id}
                href={`/votar/${dj.id}`}
                whileHover={{ scale: 1.03 }}
                className={`relative rounded-[28px] overflow-hidden shadow-2xl border border-white/10 ${
                  isLeader ? 'ring-2 ring-cyan-300/90 shadow-[0_0_34px_rgba(110,231,255,0.35)]' : ''
                }`}
              >

                {/* 🏆 BADGE RANKING */}
                {index < 3 && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md
                      ${index === 0 ? 'bg-cyan-300 text-slate-950' : ''}
                      ${index === 1 ? 'bg-white/80 text-slate-950' : ''}
                      ${index === 2 ? 'bg-fuchsia-300 text-slate-950' : ''}
                    `}>
                      {index === 0 && '🥇 #1'}
                      {index === 1 && '🥈 #2'}
                      {index === 2 && '🥉 #3'}
                    </div>
                  </div>
                )}

                {/* IMAGEM */}
                <img
                  src={dj.image_url}
                  className="w-full h-[280px] object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050513]/95 via-[#0c1230]/45 to-[#14081f]/12" />

                {/* CONTEÚDO */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">

                  <h2 className="theme-neon-heading text-2xl font-black">
                    {dj.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="theme-neon-chip rounded-full px-3 py-1 text-xs font-bold">
                      {percent}%
                    </span>
                    <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-bold text-white/82 backdrop-blur-md">
                      {dj.votes} votos
                    </span>
                  </div>

                  {/* BARRA */}
                  <div className="w-full h-2.5 bg-white/15 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 shadow-[0_0_18px_rgba(110,231,255,0.35)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                </div>

              </motion.a>
            )
          })}

        </div>

        <div className="mt-8 flex justify-center">
          <div className="theme-neon-shell rounded-[28px] px-8 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
              Total de votos
            </p>
            <p className="theme-neon-heading mt-2 text-4xl font-black md:text-5xl">
              {totalVotes}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
