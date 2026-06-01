'use client'

import { useEffect, useState } from 'react'

export default function LivePage() {
  const [data, setData] = useState<any>(null)

  const fetchData = async () => {
    const res = await fetch('/api/analytics')
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-3xl">
        A carregar...
      </div>
    )
  }

  const leader = data.stats[0]
  const others = data.stats.slice(1)

  return (
    <main className="h-screen bg-black text-white p-8 flex flex-col">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black tracking-widest">
          🔥 LIVE VOTAÇÃO 🔥
        </h1>
        <p className="text-xl opacity-70">
          Total votos: {data.totalVotes}
        </p>
      </div>

      {/* LÍDER */}
      {leader && (
        <div className="mb-10 text-center">

          <div className="text-2xl mb-2 opacity-70">
            🥇 EM 1º LUGAR
          </div>

          <div className="inline-block p-6 rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-500">

            <img
              src={leader.image_url}
              className="w-48 h-48 object-cover rounded-2xl mx-auto mb-4 border-4 border-white"
            />

            <h2 className="text-4xl font-black">
              {leader.name}
            </h2>

            <p className="text-2xl mt-2">
              {leader.votes} votos ({leader.percent}%)
            </p>

          </div>

        </div>
      )}

      {/* RESTO */}
      <div className="flex-1 space-y-4 overflow-hidden">

        {others.map((dj: any, i: number) => (
          <div
            key={dj.id}
            className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4"
          >

            <div className="text-2xl font-black w-12 text-center">
              #{i + 2}
            </div>

            <img
              src={dj.image_url}
              className="w-16 h-16 rounded-xl object-cover"
            />

            <div className="flex-1">
              <p className="text-xl font-bold">{dj.name}</p>

              <div className="w-full bg-zinc-700 rounded-full h-4 mt-2">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${dj.percent}%` }}
                />
              </div>
            </div>

            <div className="text-xl font-bold w-32 text-right">
              {dj.votes} votos
            </div>

          </div>
        ))}

      </div>

    </main>
  )
}