'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [djs, setDjs] = useState<any[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [homeBackgroundUrl, setHomeBackgroundUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoScalePercent, setLogoScalePercent] = useState(100)

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
    setLogoScalePercent(data?.logo_scale_percent ?? 100)
  }

  return (
    <main
      className="relative min-h-screen bg-white px-6 py-8 bg-cover bg-center"
      style={
        homeBackgroundUrl
          ? { backgroundImage: `url(${homeBackgroundUrl})` }
          : undefined
      }
    >
      {homeBackgroundUrl && (
        <div className="absolute inset-0 bg-black/55" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* TÍTULO */}
        <div className="text-center mb-12">
          <img
            src={logoUrl || '/tittle.png'}
            alt="Logo"
            className="mx-auto mb-4 h-auto w-auto"
            style={{
              maxHeight: `${112 * (logoScalePercent / 100)}px`,
              maxWidth: `${250 * (logoScalePercent / 100)}px`,
            }}
          />

          <p className={homeBackgroundUrl ? 'text-white/90' : 'text-zinc-600'}>
            Vota no teu DJ favorito
          </p>

          <p className={homeBackgroundUrl ? 'text-sm text-white/70 mt-2' : 'text-sm text-zinc-400 mt-2'}>
            {totalVotes} votos registados
          </p>
        </div>

        {/* 🏆 TOP 3 */}
        {djs.length >= 3 && (
          <div className="mb-12 text-center">
            <h2 className="text-xl font-bold mb-4">
              Top DJs 🔥
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
                    className="px-6 py-4 rounded-2xl border shadow-sm bg-white/90 backdrop-blur-sm"
                  >
                    <p className="text-lg font-bold">
                      {medals[index]} {dj.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {percent}% dos votos
                    </p>
                  </div>
                )
              })}

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
                className={`relative rounded-2xl overflow-hidden shadow-lg ${
                  isLeader ? 'ring-4 ring-yellow-400' : ''
                }`}
              >

                {/* 🏆 BADGE RANKING */}
                {index < 3 && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-bold shadow-md
                      ${index === 0 ? 'bg-yellow-400 text-black' : ''}
                      ${index === 1 ? 'bg-gray-300 text-black' : ''}
                      ${index === 2 ? 'bg-orange-400 text-black' : ''}
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
                  className="w-full h-[260px] object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/40" />

                {/* CONTEÚDO */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">

                  <h2 className="text-xl font-bold">
                    {dj.name}
                  </h2>

                  {/* PERCENTAGEM */}
                  <p className="text-sm font-medium">
                    {percent}%
                  </p>

                  {/* BARRA */}
                  <div className="w-full h-2 bg-white/20 rounded mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                </div>

              </motion.a>
            )
          })}

        </div>
      </div>
    </main>
  )
}
