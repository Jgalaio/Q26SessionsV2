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
        <section
          key={i}
          className="relative w-full h-[420mm] overflow-hidden p-10 text-center print:break-after-page md:p-16"
        >
          {posterBackgroundUrl && (
            <img
              src={posterBackgroundUrl}
              alt="Fundo do poster"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-[#050513]/58" />
          <div className="theme-neon-overlay absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,88,208,0.22),transparent_26%),radial-gradient(circle_at_bottom,rgba(110,231,255,0.14),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#04040f]/96 via-[#050513]/76 to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-[980px] flex-col justify-between">
            <div className="theme-neon-shell rounded-[40px] px-8 py-7 md:px-12 md:py-9">
              <div className="theme-neon-chip inline-flex rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.34em]">
                Quarentões 26 Sessions
              </div>

              <img
                src={logoUrl || '/tittle.png'}
                alt="Logo"
                className="theme-neon-logo mx-auto mt-7 h-auto w-auto"
                style={{
                  maxHeight: `${160 * (posterLogoScalePercent / 100)}px`,
                  maxWidth: `${220 * (posterLogoScalePercent / 100)}px`,
                }}
              />

              <h1 className="theme-neon-heading mt-7 text-5xl font-black uppercase tracking-[0.18em] md:text-7xl">
                Vota no teu DJ
              </h1>

              <p className="theme-neon-muted mt-4 text-xl md:text-2xl">
                Faz scan do QR code e escolhe o nome que vai dominar a noite.
              </p>
            </div>

            <div className="theme-neon-shell rounded-[42px] px-8 py-8 md:px-10 md:py-10">
              <div className="theme-neon-chip mx-auto mb-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em]">
                DJ em destaque
              </div>

              <div className="theme-neon-panel rounded-[38px] p-5 md:p-6">
                <img
                  src={dj.image_url}
                  alt={dj.name}
                  className="mx-auto h-[480px] w-full max-w-[520px] rounded-[34px] object-cover border border-white/25 shadow-[0_0_55px_rgba(138,92,255,0.28)]"
                />
              </div>

              <div className="theme-neon-shell mt-6 rounded-[30px] px-6 py-5">
                <h2 className="theme-neon-heading text-4xl font-black uppercase tracking-[0.14em] md:text-6xl">
                  {dj.name}
                </h2>
              </div>

              <div className="mt-8 flex flex-col items-center gap-5">
                <div className="theme-neon-panel rounded-[34px] p-5 md:p-7">
                  <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                    <img src={dj.qr} alt={`QR code para votar em ${dj.name}`} className="w-72" />
                  </div>
                </div>

                <div className="theme-neon-shell rounded-[28px] px-8 py-6">
                  <p className="theme-neon-heading text-3xl font-bold uppercase tracking-[0.12em]">
                    Faz scan e vota
                  </p>

                  <p className="theme-neon-muted mt-3 text-lg md:text-xl">
                    Aponta a câmara ao QR code e regista o teu voto em segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </main>
  )
}
