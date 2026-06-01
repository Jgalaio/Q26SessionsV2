'use client'

import { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Erro analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  // ================= AUTO REFRESH =================
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch('/api/analytics')
        const json = await res.json()

        if (isMounted) {
          setData(json)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // 🔥 primeira carga
    load()

    // 🔁 atualizar a cada 5 segundos
    const interval = setInterval(load, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // ================= LOADING =================
  if (loading) {
    return (
      <main className="p-6 text-center">
        <p className="text-xl font-bold">A carregar analytics...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-6 text-center">
        <p>Erro ao carregar dados</p>
      </main>
    )
  }

  const top3 = data.stats.slice(0, 3)

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <h1 className="text-3xl font-black">📊 Analytics</h1>

      {/* TOTAL */}
      <div className="p-6 bg-black text-white rounded-2xl text-center">
        <p className="text-lg">Total de votos</p>
        <p className="text-4xl font-black">{data.totalVotes}</p>
      </div>

      {/* TOP 3 */}
      <div className="grid grid-cols-3 gap-4">
        {top3.map((dj: any, i: number) => (
          <div key={dj.id} className="p-4 border rounded-xl text-center">
            <img
              src={dj.image_url}
              className="h-24 w-full object-cover rounded mb-2"
            />
            <p className="font-bold">#{i + 1} {dj.name}</p>
            <p>{dj.votes} votos</p>
          </div>
        ))}
      </div>

      {/* LISTA + BARRAS */}
      <div className="space-y-3">
        {data.stats.map((dj: any) => (
          <div key={dj.id} className="border p-3 rounded-xl">

            <div className="flex justify-between mb-1">
              <span>{dj.name}</span>
              <span>{dj.percent}%</span>
            </div>

            <div className="w-full bg-zinc-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${dj.percent}%` }}
              />
            </div>

          </div>
        ))}
      </div>

    </main>
  )
}