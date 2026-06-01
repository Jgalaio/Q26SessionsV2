'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function DjPosterPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetchDjs()
  }, [])

  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const djs = await res.json()

    const baseUrl = window.location.origin

    const result = await Promise.all(
      djs.map(async (dj: any) => {
        const url = `${baseUrl}/votar/${dj.slug || dj.id}`
        const qr = await QRCode.toDataURL(url)

        return {
          ...dj,
          qr,
        }
      })
    )

    setItems(result)
  }

  return (
    <main className="bg-black text-white">

      <div className="p-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl"
        >
          🖨️ Imprimir Posters A3
        </button>
      </div>

      {items.map((dj, i) => (
        <div
          key={i}
          className="w-full h-[420mm] flex flex-col items-center justify-between p-16 text-center relative print:break-after-page"
        >

          {/* FUNDO */}
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-black to-cyan-600/30 blur-3xl" />

          {/* LOGO */}
          <img src="/logo.png" className="w-40 z-10" />

          {/* HEADER */}
          <div className="z-10">
            <h1 className="text-7xl font-black bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              VOTA NO TEU DJ
            </h1>

            <p className="text-2xl opacity-70 mt-3">
              Quarentões 26 Sessions
            </p>
          </div>

          {/* DJ */}
          <div className="z-10">
            <img
              src={dj.image_url}
              className="w-[500px] h-[500px] object-cover rounded-[40px] border-8 border-white shadow-2xl"
            />

            <h2 className="text-6xl font-black mt-6">
              {dj.name}
            </h2>
          </div>

          {/* QR */}
          <div className="bg-white p-8 rounded-3xl z-10 shadow-2xl">
            <img src={dj.qr} className="w-72" />
          </div>

          {/* CTA */}
          <div className="z-10">
            <p className="text-3xl font-bold">
              📱 Faz scan e vota
            </p>

            <p className="opacity-60 mt-2">
              Escolhe o teu DJ favorito
            </p>
          </div>

        </div>
      ))}

    </main>
  )
}