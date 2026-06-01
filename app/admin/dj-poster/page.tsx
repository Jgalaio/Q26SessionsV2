'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function DjPosterPage() {
  const [items, setItems] = useState<any[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [posterLogoScalePercent, setPosterLogoScalePercent] = useState(100)
  const [posterBackgroundUrl, setPosterBackgroundUrl] = useState<string | null>(null)

  useEffect(() => {
    void fetchDjs()
    void fetchSettings()
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

  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setLogoUrl(data?.logo_url || null)
    setPosterBackgroundUrl(data?.poster_background_url || null)
    setPosterLogoScalePercent(
      data?.poster_logo_scale_percent ?? data?.logo_scale_percent ?? 100
    )
  }

  return (
    <main className="theme-neon-page bg-black text-white">

      <div className="p-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="theme-neon-panel px-6 py-3 font-bold rounded-2xl"
        >
          🖨️ Imprimir Posters A3
        </button>
      </div>

      {items.map((dj, i) => (
        <div
          key={i}
          className="w-full h-[420mm] flex flex-col items-center justify-between p-16 text-center relative print:break-after-page"
        >
          {posterBackgroundUrl && (
            <img
              src={posterBackgroundUrl}
              alt="Fundo do poster"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* FUNDO */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="theme-neon-overlay absolute inset-0" />

          {/* LOGO */}
          <img
            src={logoUrl || '/tittle.png'}
            className="theme-neon-logo z-10 h-auto w-auto"
            style={{
              maxHeight: `${160 * (posterLogoScalePercent / 100)}px`,
              maxWidth: `${220 * (posterLogoScalePercent / 100)}px`,
            }}
          />

          {/* HEADER */}
          <div className="theme-neon-shell z-10 rounded-[36px] px-10 py-8">
            <h1 className="theme-neon-heading text-7xl font-black uppercase tracking-[0.18em]">
              VOTA NO TEU DJ
            </h1>

            <p className="theme-neon-muted text-2xl mt-3">
              Quarentões 26 Sessions
            </p>
          </div>

          {/* DJ */}
          <div className="z-10">
            <img
              src={dj.image_url}
              className="w-[500px] h-[500px] object-cover rounded-[40px] border border-white/30 shadow-[0_0_55px_rgba(138,92,255,0.28)]"
            />

            <div className="theme-neon-shell mt-6 rounded-[28px] px-8 py-5">
              <h2 className="theme-neon-heading text-6xl font-black">
                {dj.name}
              </h2>
            </div>
          </div>

          {/* QR */}
          <div className="theme-neon-panel p-8 rounded-[30px] z-10 shadow-2xl">
            <img src={dj.qr} className="w-72" />
          </div>

          {/* CTA */}
          <div className="theme-neon-shell z-10 rounded-[28px] px-8 py-6">
            <p className="theme-neon-heading text-3xl font-bold">
              📱 Faz scan e vota
            </p>

            <p className="theme-neon-muted mt-2 text-lg">
              Escolhe o teu DJ favorito
            </p>
          </div>

        </div>
      ))}

    </main>
  )
}
