'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type VoteCode = {
  code: string
  used?: boolean
  distributed?: boolean
  qr?: string
}

type PrintMode = 'ticket' | 'a4-12' | 'a4-24' | 'label-62x29'
type PrintVersion = 'v1' | 'v2'

const modeLabels: Record<PrintMode, string> = {
  ticket: 'Talão térmico',
  'a4-12': 'A4 3x4, 12 códigos',
  'a4-24': 'A4 4x6, 24 códigos',
  'label-62x29': 'Etiqueta 62x29mm',
}

export default function PrintClient() {
  const [codes, setCodes] = useState<VoteCode[]>([])
  const [filtered, setFiltered] = useState<VoteCode[]>([])
  const [items, setItems] = useState<VoteCode[]>([])

  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [mode, setMode] = useState<PrintMode>('ticket')
  const [version, setVersion] = useState<PrintVersion>('v1')

  useEffect(() => {
    void fetchCodes()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [codes, start, end, onlyAvailable])

  useEffect(() => {
    void generateQR()
  }, [filtered, version])

  const fetchCodes = async () => {
    const res = await fetch('/api/codes')
    const data = await res.json()
    setCodes(data || [])
  }

  const applyFilter = () => {
    let list = [...codes]

    if (onlyAvailable) {
      list = list.filter((code) => !code.distributed)
    }

    const slice = list.slice(start - 1, end)
    setFiltered(slice)
  }

  const generateQR = async () => {
    const result = await Promise.all(
      filtered.map(async (code) => {
        const qr =
          version === 'v2'
            ? await QRCode.toDataURL(code.code, {
                errorCorrectionLevel: 'M',
                margin: 1,
                scale: 8,
              })
            : await QRCode.toDataURL(code.code)

        return {
          ...code,
          qr,
        }
      })
    )

    setItems(result)
  }

  const markAsDistributed = async () => {
    const codesToUpdate = filtered.map((code) => code.code)

    await fetch('/api/codes/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codesToUpdate }),
    })

    alert('✅ Marcados como distribuídos')
    void fetchCodes()
  }

  const sharedProps = {
    start,
    end,
    onlyAvailable,
    mode,
    version,
    items,
    codes,
    filtered,
    setStart,
    setEnd,
    setOnlyAvailable,
    setMode,
    setVersion,
    markAsDistributed,
  }

  if (version === 'v2') {
    return <PrintVersionTwo {...sharedProps} />
  }

  return <PrintVersionOne {...sharedProps} />
}

type PrintViewProps = {
  start: number
  end: number
  onlyAvailable: boolean
  mode: PrintMode
  version: PrintVersion
  items: VoteCode[]
  codes: VoteCode[]
  filtered: VoteCode[]
  setStart: (value: number) => void
  setEnd: (value: number) => void
  setOnlyAvailable: (value: boolean) => void
  setMode: (value: PrintMode) => void
  setVersion: (value: PrintVersion) => void
  markAsDistributed: () => void
}

function PrintVersionOne({
  start,
  end,
  onlyAvailable,
  mode,
  version,
  items,
  setStart,
  setEnd,
  setOnlyAvailable,
  setMode,
  setVersion,
  markAsDistributed,
}: PrintViewProps) {
  return (
    <main className="bg-white p-4 font-mono">

      {/* ================= CONTROLOS ================= */}
      <div className="mb-4 print:hidden flex flex-wrap gap-2 items-center">

        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as PrintVersion)}
          className="border p-2"
        >
          <option value="v1">Versão 1</option>
          <option value="v2">Versão 2</option>
        </select>

        <input
          type="number"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          className="border p-2 w-20"
        />

        <span>até</span>

        <input
          type="number"
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
          className="border p-2 w-20"
        />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as PrintMode)}
          className="border p-2"
        >
          <option value="ticket">🧾 Talão térmico</option>
          <option value="a4-12">📄 A4 (3x4 - 12)</option>
          <option value="a4-24">📄 A4 (4x6 - 24)</option>
          <option value="label-62x29">🏷️ Etiqueta 62x29mm</option>
        </select>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded"
        >
          🖨️ Imprimir
        </button>

        <button
          onClick={markAsDistributed}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ✅ Marcar como entregue
        </button>

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={() => setOnlyAvailable(!onlyAvailable)}
          />
          Só não entregues
        </label>

      </div>

      {/* ================= TALÃO ================= */}
      {mode === 'ticket' && (
        <div className="flex flex-col items-center gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className={`w-[260px] border px-3 py-2 text-center ${
                item.distributed ? 'bg-red-100' : 'bg-white'
              }`}
            >
              <p className="text-[10px] font-bold">
                VOTA NO TEU DJ PREFERIDO
              </p>

              <p className="text-[9px] text-gray-600 mb-1">
                Quarentões 26 Sessions
              </p>

              <img src={item.qr} className="w-24 mx-auto mb-2" />

              <p className="text-sm font-bold tracking-widest">
                {item.code}
              </p>

              <p className="text-[8px]">
                {item.distributed ? 'ENTREGUE' : 'DISPONÍVEL'}
              </p>

              <div className="border-t border-dashed border-black text-[8px] mt-2">
                ✂ cortar
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ================= Label 62x29 ================= */}
      {mode === 'label-62x29' && (
        <div className="flex flex-col items-start">

          {items.map((item, i) => (
            <div
              key={i}
              style={{
                width: '62mm',
                height: '29mm',
                border: '0px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2mm',
                boxSizing: 'border-box',
              }}
            >

              {/* QR */}
              <img
                src={item.qr}
                style={{
                  width: '24mm',
                  height: '24mm',
                }}
              />

              {/* TEXTO */}
              <div style={{ textAlign: 'center', flex: 1 }}>

                <div style={{ fontSize: '6px' }}>
                  VOTA NO TEU DJ
                </div>

                <div style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}>
                  {item.code}
                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ================= A4 3x4 (12) ================= */}
      {mode === 'a4-12' && (
        <div>
          {Array.from({ length: Math.ceil(items.length / 12) }).map((_, pageIndex) => {
            const pageItems = items.slice(pageIndex * 12, (pageIndex + 1) * 12)

            return (
              <div
                key={pageIndex}
                className="grid grid-cols-3 gap-4 mb-6 print:mb-0 print:break-after-page"
              >
                {pageItems.map((item, i) => (
                  <div
                    key={i}
                    className={`border p-3 text-center ${
                      item.distributed ? 'bg-red-100' : 'bg-white'
                    }`}
                    style={{ height: '240px' }}
                  >
                    <p className="text-[10px] font-bold">
                      VOTA NO TEU DJ PREFERIDO
                    </p>

                    <p className="text-[9px] text-gray-600 mb-2">
                      Quarentões 26 Sessions
                    </p>

                    <img src={item.qr} className="w-24 mx-auto mb-3" />

                    <p className="text-sm font-bold tracking-[0.2em]">
                      {item.code}
                    </p>

                    <p className="text-[9px] mt-1">
                      {item.distributed ? 'ENTREGUE' : 'DISPONÍVEL'}
                    </p>

                    <div className="border-t border-dashed border-black text-[9px] mt-2">
                      ✂ cortar aqui
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ================= A4 4x6 (24) ================= */}
      {mode === 'a4-24' && (
        <div>
          {Array.from({ length: Math.ceil(items.length / 24) }).map((_, pageIndex) => {
            const pageItems = items.slice(pageIndex * 24, (pageIndex + 1) * 24)

            return (
              <div
                key={pageIndex}
                className="grid grid-cols-4 gap-3 mb-6 print:mb-0 print:break-after-page"
              >
                {pageItems.map((item, i) => (
                  <div
                    key={i}
                    className={`border p-2 text-center ${
                      item.distributed ? 'bg-red-100' : 'bg-white'
                    }`}
                    style={{ height: '160px' }}
                  >
                    <p className="text-[8px]">
                      VOTA NO TEU DJ
                    </p>

                    <p className="text-[7px] text-gray-600 mb-1">
                      Q26 Sessions
                    </p>

                    <img src={item.qr} className="w-16 mx-auto mb-1" />

                    <p className="text-[9px] font-bold tracking-widest">
                      {item.code}
                    </p>

                    <div className="border-t border-dashed border-black text-[7px] mt-1">
                      ✂
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

    </main>
  )
}

function PrintVersionTwo({
  start,
  end,
  onlyAvailable,
  mode,
  version,
  items,
  codes,
  filtered,
  setStart,
  setEnd,
  setOnlyAvailable,
  setMode,
  setVersion,
  markAsDistributed,
}: PrintViewProps) {
  const availableCount = codes.filter((code) => !code.distributed).length
  const distributedCount = codes.filter((code) => code.distributed).length
  const usedCount = codes.filter((code) => code.used).length

  return (
    <main className="q26-print-v2-root theme-neon-page relative min-h-screen overflow-hidden bg-[#050513] text-white print:bg-white print:text-black">
      <div className="theme-neon-overlay absolute inset-0 print:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,88,208,0.2),transparent_22%),radial-gradient(circle_at_86%_12%,rgba(110,231,255,0.14),transparent_18%),linear-gradient(180deg,rgba(4,4,15,0.4),rgba(4,4,15,0.9))] print:hidden" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8 print:max-w-none print:p-0">
        <section className="theme-neon-shell mb-6 rounded-[34px] p-5 md:p-7 print:hidden">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em]">
                Impressão de códigos
              </div>

              <h1 className="theme-neon-heading mt-5 text-3xl font-black uppercase tracking-[0.12em] md:text-5xl">
                Senhas de votação V2
              </h1>

              <p className="theme-neon-muted mt-4 max-w-2xl text-sm leading-6 md:text-base">
                Uma versão mais limpa para impressão, com QR destacado, código
                grande e cortes mais fáceis de alinhar.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[440px]">
              <PrintStat label="Total" value={String(codes.length)} />
              <PrintStat label="Selecionados" value={String(filtered.length)} />
              <PrintStat label="Disponíveis" value={String(availableCount)} />
              <PrintStat label="Entregues" value={String(distributedCount)} />
              <PrintStat label="Usados" value={String(usedCount)} />
              <PrintStat label="Preparados" value={String(items.length)} />
            </div>
          </div>
        </section>

        <section className="theme-neon-panel mb-6 rounded-[30px] p-5 print:hidden">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_1fr_auto] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold text-white/78">
                Versão
              </p>
              <select
                value={version}
                onChange={(event) => setVersion(event.target.value as PrintVersion)}
                className="w-full rounded-2xl border border-white/12 bg-[#0c1230]/82 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
              >
                <option value="v1">Versão 1</option>
                <option value="v2">Versão 2</option>
              </select>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white/78">
                Intervalo
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={start}
                  onChange={(event) => setStart(Number(event.target.value))}
                  className="rounded-2xl border border-white/12 bg-[#0c1230]/82 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />

                <span className="text-sm text-white/58">até</span>

                <input
                  type="number"
                  min="1"
                  value={end}
                  onChange={(event) => setEnd(Number(event.target.value))}
                  className="rounded-2xl border border-white/12 bg-[#0c1230]/82 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white/78">
                Layout
              </p>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as PrintMode)}
                className="w-full rounded-2xl border border-white/12 bg-[#0c1230]/82 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
              >
                <option value="ticket">{modeLabels.ticket}</option>
                <option value="a4-12">{modeLabels['a4-12']}</option>
                <option value="a4-24">{modeLabels['a4-24']}</option>
                <option value="label-62x29">{modeLabels['label-62x29']}</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button
                onClick={() => window.print()}
                className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-5 py-3 font-bold text-white shadow-[0_0_28px_rgba(255,88,208,0.24)] transition hover:scale-[1.02]"
              >
                Imprimir
              </button>

              <button
                onClick={markAsDistributed}
                className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-bold text-white transition hover:bg-white/12"
              >
                Marcar entregue
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-white/78">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={() => setOnlyAvailable(!onlyAvailable)}
                className="h-5 w-5 accent-cyan-300"
              />
              Só códigos não entregues
            </label>

            <div className="flex flex-wrap gap-3 text-sm text-white/62">
              <span>{filtered.length} selecionados</span>
              <span>{items.length} QR preparados</span>
              <span>{modeLabels[mode]}</span>
            </div>
          </div>
        </section>

        <section className="q26-print-v2-preview">
          {items.length === 0 ? (
            <div className="theme-neon-shell rounded-[30px] p-8 text-center print:hidden">
              <p className="theme-neon-heading text-xl font-black">
                Nenhum código selecionado.
              </p>
            </div>
          ) : (
            <>
              {mode === 'ticket' && <V2TicketLayout items={items} />}
              {mode === 'label-62x29' && <V2LabelLayout items={items} />}
              {mode === 'a4-12' && (
                <V2A4Layout items={items} itemsPerPage={12} compact={false} />
              )}
              {mode === 'a4-24' && (
                <V2A4Layout items={items} itemsPerPage={24} compact />
              )}
            </>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media print {
          @page q26-code-v2-a4 {
            size: A4 portrait;
            margin: 7mm;
          }

          @page q26-code-v2-ticket {
            size: 80mm 120mm;
            margin: 0;
          }

          @page q26-code-v2-label {
            size: 62mm 29mm;
            margin: 0;
          }

          .q26-print-v2-root {
            background: white !important;
            color: black !important;
          }

          .q26-v2-a4-page {
            page: q26-code-v2-a4;
            width: 196mm !important;
            min-height: 283mm !important;
            margin: 0 auto !important;
            break-after: page;
            break-inside: avoid;
          }

          .q26-v2-a4-page:last-child,
          .q26-v2-ticket:last-child,
          .q26-v2-label:last-child {
            break-after: auto !important;
          }

          .q26-v2-ticket {
            page: q26-code-v2-ticket;
            break-after: page;
            break-inside: avoid;
          }

          .q26-v2-label {
            page: q26-code-v2-label;
            break-after: page;
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  )
}

function PrintStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="theme-neon-stat rounded-[24px] px-5 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">
        {label}
      </p>
      <p className="theme-neon-heading mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function V2TicketLayout({ items }: { items: VoteCode[] }) {
  return (
    <div className="mx-auto flex max-w-[360px] flex-col gap-4 print:max-w-none print:gap-0">
      {items.map((item) => (
        <article
          key={item.code}
          className="q26-v2-ticket mx-auto w-[78mm] bg-white px-[5mm] py-[4mm] text-center text-black shadow-xl print:shadow-none"
        >
          <V2TicketHeader compact={false} />

          <img
            src={item.qr}
            alt={`QR ${item.code}`}
            className="mx-auto my-[3mm] h-[30mm] w-[30mm]"
          />

          <V2CodeValue code={item.code} large />
          <V2Status item={item} />
          <V2CutLine text="cortar aqui" />
        </article>
      ))}
    </div>
  )
}

function V2LabelLayout({ items }: { items: VoteCode[] }) {
  return (
    <div className="mx-auto flex max-w-[380px] flex-col items-center gap-4 print:max-w-none print:gap-0">
      {items.map((item) => (
        <article
          key={item.code}
          className="q26-v2-label flex h-[29mm] w-[62mm] items-center gap-[2mm] bg-white p-[2mm] text-black shadow-xl print:shadow-none"
        >
          <img
            src={item.qr}
            alt={`QR ${item.code}`}
            className="h-[24mm] w-[24mm]"
          />

          <div className="min-w-0 flex-1 text-center">
            <p className="text-[6px] font-black uppercase tracking-[0.16em]">
              Q26 Sessions
            </p>
            <p className="mt-[1mm] text-[10px] font-black tracking-[0.12em]">
              {item.code}
            </p>
            <p className="mt-[1mm] text-[6px] uppercase tracking-[0.14em] text-zinc-600">
              1 código = 1 voto
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

function V2A4Layout({
  items,
  itemsPerPage,
  compact,
}: {
  items: VoteCode[]
  itemsPerPage: number
  compact: boolean
}) {
  const pages = chunk(items, itemsPerPage)

  return (
    <div className="space-y-8 print:space-y-0">
      {pages.map((pageItems, pageIndex) => (
        <section
          key={pageIndex}
          className={`q26-v2-a4-page mx-auto bg-white text-black shadow-2xl print:shadow-none ${
            compact ? 'p-[6mm]' : 'p-[7mm]'
          }`}
        >
          <div className="mb-[5mm] flex items-end justify-between border-b border-zinc-300 pb-[3mm]">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em]">
                Q26 Sessions
              </p>
              <h2 className="mt-[1mm] text-[18px] font-black">
                Senhas de votação
              </h2>
            </div>

            <p className="text-right text-[9px] text-zinc-500">
              Página {pageIndex + 1} de {pages.length}
            </p>
          </div>

          <div
            className={`grid ${
              compact ? 'grid-cols-4 gap-[4mm]' : 'grid-cols-3 gap-[5mm]'
            }`}
          >
            {pageItems.map((item) => (
              <V2A4Card key={item.code} item={item} compact={compact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function V2A4Card({
  item,
  compact,
}: {
  item: VoteCode
  compact: boolean
}) {
  return (
    <article
      className={`break-inside-avoid rounded-[3mm] border border-dashed border-zinc-500 bg-white text-center ${
        compact ? 'min-h-[39mm] p-[2.5mm]' : 'min-h-[58mm] p-[4mm]'
      }`}
    >
      <V2TicketHeader compact={compact} />

      <img
        src={item.qr}
        alt={`QR ${item.code}`}
        className={`mx-auto ${
          compact
            ? 'my-[1.5mm] h-[18mm] w-[18mm]'
            : 'my-[2.5mm] h-[27mm] w-[27mm]'
        }`}
      />

      <V2CodeValue code={item.code} large={!compact} />
      <V2Status item={item} />
      <V2CutLine text={compact ? 'cortar' : 'cortar aqui'} />
    </article>
  )
}

function V2TicketHeader({ compact }: { compact: boolean }) {
  return (
    <div>
      <p
        className={`font-black uppercase tracking-[0.18em] ${
          compact ? 'text-[6px]' : 'text-[9px]'
        }`}
      >
        Vota no teu DJ
      </p>
      <p
        className={
          compact ? 'text-[6px] text-zinc-500' : 'text-[8px] text-zinc-500'
        }
      >
        Q26 Sessions
      </p>
    </div>
  )
}

function V2CodeValue({
  code,
  large,
}: {
  code: string
  large: boolean
}) {
  return (
    <p
      className={`font-black tracking-[0.13em] ${
        large ? 'text-[13px]' : 'text-[8px]'
      }`}
    >
      {code}
    </p>
  )
}

function V2Status({ item }: { item: VoteCode }) {
  const text = item.used
    ? 'USADO'
    : item.distributed
      ? 'ENTREGUE'
      : 'DISPONÍVEL'

  return (
    <p className="mt-[1mm] text-[7px] font-bold uppercase tracking-[0.18em] text-zinc-500">
      {text}
    </p>
  )
}

function V2CutLine({ text }: { text: string }) {
  return (
    <div className="mt-[2mm] border-t border-dashed border-zinc-500 pt-[1mm] text-[7px] uppercase tracking-[0.14em] text-zinc-500">
      {text}
    </div>
  )
}

function chunk<T>(items: T[], size: number) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, index * size + size)
  )
}
