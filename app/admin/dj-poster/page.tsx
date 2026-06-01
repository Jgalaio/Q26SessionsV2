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
    <main className="theme-neon-page bg-black pb-8 text-white print:pb-0">
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
          className="poster-a3-page relative mx-auto mb-8 aspect-[297/420] w-full max-w-[297mm] overflow-hidden text-center shadow-2xl print:mb-0 print:h-[420mm] print:w-[297mm] print:break-after-page print:shadow-none"
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

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[245mm] flex-col justify-between p-8 md:p-10 print:p-[12mm]">
            <div className="theme-neon-shell rounded-[40px] px-8 py-7 md:px-12 md:py-9 print:rounded-[10mm] print:px-[10mm] print:py-[8mm]">
              <div className="theme-neon-chip inline-flex rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.34em]">
                Quarentões 26 Sessions
              </div>

              <img
                src={logoUrl || '/tittle.png'}
                alt="Logo"
                className="theme-neon-logo mx-auto mt-7 h-auto w-auto"
                style={{
                  maxHeight: `${36 * (posterLogoScalePercent / 100)}mm`,
                  maxWidth: `${62 * (posterLogoScalePercent / 100)}mm`,
                }}
              />

              <h1 className="theme-neon-heading mt-7 text-4xl font-black uppercase tracking-[0.16em] md:text-6xl print:mt-[6mm] print:text-[16mm]">
                Vota no teu DJ
              </h1>

              <p className="theme-neon-muted mt-4 text-lg md:text-2xl print:mt-[4mm] print:text-[5.4mm]">
                Faz scan do QR code e escolhe o nome que vai dominar a noite.
              </p>
            </div>

            <div className="theme-neon-shell rounded-[42px] px-8 py-8 md:px-10 md:py-10 print:rounded-[10mm] print:px-[8mm] print:py-[8mm]">
              <div className="theme-neon-chip mx-auto mb-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em]">
                DJ em destaque
              </div>

              <div className="theme-neon-panel rounded-[38px] p-5 md:p-6 print:rounded-[9mm] print:p-[5mm]">
                <img
                  src={dj.image_url}
                  alt={dj.name}
                  className="mx-auto h-[420px] w-full max-w-[520px] rounded-[34px] border border-white/25 object-cover shadow-[0_0_55px_rgba(138,92,255,0.28)] md:h-[460px] print:h-[110mm] print:max-w-[126mm] print:rounded-[8mm]"
                />
              </div>

              <div className="theme-neon-shell mt-6 rounded-[30px] px-6 py-5 print:mt-[5mm] print:rounded-[8mm] print:px-[6mm] print:py-[5mm]">
                <h2 className="theme-neon-heading text-3xl font-black uppercase tracking-[0.14em] md:text-5xl print:text-[12mm]">
                  {dj.name}
                </h2>
              </div>

              <div className="mt-8 flex flex-col items-center gap-5 print:mt-[6mm] print:gap-[4mm]">
                <div className="theme-neon-panel rounded-[34px] p-5 md:p-7 print:rounded-[8mm] print:p-[5mm]">
                  <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] print:rounded-[6mm] print:p-[4mm]">
                    <img
                      src={dj.qr}
                      alt={`QR code para votar em ${dj.name}`}
                      className="w-64 md:w-72 print:w-[58mm]"
                    />
                  </div>
                </div>

                <div className="theme-neon-shell rounded-[28px] px-8 py-6 print:rounded-[8mm] print:px-[6mm] print:py-[5mm]">
                  <p className="theme-neon-heading text-2xl font-bold uppercase tracking-[0.12em] md:text-3xl print:text-[7mm]">
                    Faz scan e vota
                  </p>

                  <p className="theme-neon-muted mt-3 text-base md:text-xl print:mt-[3mm] print:text-[4.6mm]">
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
