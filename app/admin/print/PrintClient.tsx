'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type VoteCode = {
  code: string
  used?: boolean
  distributed?: boolean
}

type PrintableCode = VoteCode & {
  qr: string
}

type PrintMode = 'ticket' | 'a4-12' | 'a4-24' | 'label-62x29'

const modeLabels: Record<PrintMode, string> = {
  ticket: 'Talão térmico',
  'a4-12': 'A4 grande, 12 por folha',
  'a4-24': 'A4 compacto, 24 por folha',
  'label-62x29': 'Etiqueta 62x29mm',
}

export default function PrintClient() {
  const [codes, setCodes] = useState<VoteCode[]>([])
  const [filtered, setFiltered] = useState<VoteCode[]>([])
  const [items, setItems] = useState<PrintableCode[]>([])

  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [markingDistributed, setMarkingDistributed] = useState(false)

  const [mode, setMode] = useState<PrintMode>('a4-12')

  useEffect(() => {
    void fetchCodes()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [codes, start, end, onlyAvailable])

  useEffect(() => {
    void generateQR()
  }, [filtered])

  const fetchCodes = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/codes')
      const data = await res.json()

      setCodes(data || [])
    } catch {
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    const safeStart = Math.max(1, start || 1)
    const safeEnd = Math.max(safeStart, end || safeStart)
    let list = [...codes]

    if (onlyAvailable) {
      list = list.filter((code) => !code.distributed && !code.used)
    }

    setFiltered(list.slice(safeStart - 1, safeEnd))
  }

  const generateQR = async () => {
    setGenerating(true)

    try {
      const result = await Promise.all(
        filtered.map(async (code) => {
          const qr = await QRCode.toDataURL(code.code, {
            errorCorrectionLevel: 'M',
            margin: 1,
            scale: 8,
          })

          return {
            ...code,
            qr,
          }
        })
      )

      setItems(result)
    } finally {
      setGenerating(false)
    }
  }

  const markAsDistributed = async () => {
    if (filtered.length === 0) {
      alert('Não há códigos selecionados para marcar como entregues.')
      return
    }

    setMarkingDistributed(true)

    try {
      const codesToUpdate = filtered.map((code) => code.code)

      const res = await fetch('/api/codes/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: codesToUpdate }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao marcar códigos')
      }

      alert('Códigos marcados como entregues.')
      await fetchCodes()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao marcar códigos como entregues'
      )
    } finally {
      setMarkingDistributed(false)
    }
  }

  const availableCount = codes.filter(
    (code) => !code.distributed && !code.used
  ).length
  const distributedCount = codes.filter((code) => code.distributed).length
  const usedCount = codes.filter((code) => code.used).length
  const a4ChunkSize = mode === 'a4-24' ? 24 : 12

  return (
    <main className="code-print-root theme-neon-page relative min-h-screen overflow-hidden bg-[#050513] text-white print:bg-white print:text-black">
      <div className="theme-neon-overlay absolute inset-0 print:hidden" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,88,208,0.22),transparent_22%),radial-gradient(circle_at_88%_14%,rgba(110,231,255,0.16),transparent_18%),linear-gradient(180deg,rgba(4,4,15,0.36),rgba(4,4,15,0.86))] print:hidden" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8 print:max-w-none print:p-0">
        <section className="theme-neon-shell mb-6 rounded-[34px] p-5 md:p-7 print:hidden">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em]">
                Impressão de códigos
              </div>

              <h1 className="theme-neon-heading mt-5 text-3xl font-black uppercase tracking-[0.12em] md:text-5xl">
                Senhas de votação
              </h1>

              <p className="theme-neon-muted mt-4 max-w-2xl text-sm leading-6 md:text-base">
                Escolhe o intervalo, confirma o layout e imprime códigos com QR
                pronto para leitura no scanner da votação.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[440px]">
              <PrintStat label="Total" value={String(codes.length)} />
              <PrintStat label="Disponíveis" value={String(availableCount)} />
              <PrintStat label="Entregues" value={String(distributedCount)} />
              <PrintStat label="Usados" value={String(usedCount)} />
            </div>
          </div>
        </section>

        <section className="theme-neon-panel mb-6 rounded-[30px] p-5 print:hidden">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
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
                disabled={items.length === 0 || generating}
                className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-5 py-3 font-bold text-white shadow-[0_0_28px_rgba(255,88,208,0.24)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                Imprimir
              </button>

              <button
                onClick={markAsDistributed}
                disabled={filtered.length === 0 || markingDistributed}
                className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-bold text-white transition hover:bg-white/12 disabled:opacity-50"
              >
                {markingDistributed ? 'A marcar...' : 'Marcar entregue'}
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
              Mostrar apenas códigos disponíveis
            </label>

            <div className="flex flex-wrap gap-3 text-sm text-white/62">
              <span>{filtered.length} selecionados</span>
              <span>{items.length} preparados</span>
              <span>{modeLabels[mode]}</span>
            </div>
          </div>
        </section>

        {loading || generating ? (
          <div className="theme-neon-shell rounded-[30px] p-8 text-center print:hidden">
            <p className="theme-neon-heading text-xl font-black">
              {loading ? 'A carregar códigos...' : 'A preparar QR codes...'}
            </p>
          </div>
        ) : (
          <section className="code-print-preview">
            {items.length === 0 ? (
              <div className="theme-neon-shell rounded-[30px] p-8 text-center print:hidden">
                <p className="theme-neon-heading text-xl font-black">
                  Nenhum código selecionado.
                </p>
                <p className="theme-neon-muted mt-3">
                  Ajusta o intervalo ou desativa o filtro de disponíveis.
                </p>
              </div>
            ) : (
              <>
                {mode === 'ticket' && <TicketLayout items={items} />}
                {mode === 'label-62x29' && <LabelLayout items={items} />}
                {mode === 'a4-12' && (
                  <A4Layout
                    items={items}
                    itemsPerPage={a4ChunkSize}
                    compact={false}
                  />
                )}
                {mode === 'a4-24' && (
                  <A4Layout items={items} itemsPerPage={a4ChunkSize} compact />
                )}
              </>
            )}
          </section>
        )}
      </div>
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

function TicketLayout({ items }: { items: PrintableCode[] }) {
  return (
    <div className="mx-auto flex max-w-[360px] flex-col gap-4 print:max-w-none print:gap-0">
      {items.map((item) => (
        <article
          key={item.code}
          className="code-ticket-item mx-auto w-[78mm] break-inside-avoid bg-white px-[5mm] py-[4mm] text-center text-black shadow-xl print:shadow-none"
        >
          <TicketHeader compact={false} />

          <img
            src={item.qr}
            alt={`QR ${item.code}`}
            className="mx-auto my-[3mm] h-[30mm] w-[30mm]"
          />

          <CodeValue code={item.code} large />
          <CodeStatus item={item} />
          <CutLine text="cortar aqui" />
        </article>
      ))}
    </div>
  )
}

function LabelLayout({ items }: { items: PrintableCode[] }) {
  return (
    <div className="mx-auto flex max-w-[380px] flex-col items-center gap-4 print:max-w-none print:gap-0">
      {items.map((item) => (
        <article
          key={item.code}
          className="code-label-item flex h-[29mm] w-[62mm] break-inside-avoid items-center gap-[2mm] bg-white p-[2mm] text-black shadow-xl print:shadow-none"
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

function A4Layout({
  items,
  itemsPerPage,
  compact,
}: {
  items: PrintableCode[]
  itemsPerPage: number
  compact: boolean
}) {
  const pages = chunk(items, itemsPerPage)

  return (
    <div className="space-y-8 print:space-y-0">
      {pages.map((pageItems, pageIndex) => (
        <section
          key={pageIndex}
          className={`code-a4-page mx-auto bg-white text-black shadow-2xl print:shadow-none ${
            compact ? 'p-[7mm]' : 'p-[8mm]'
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
              <A4CodeCard key={item.code} item={item} compact={compact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function A4CodeCard({
  item,
  compact,
}: {
  item: PrintableCode
  compact: boolean
}) {
  return (
    <article
      className={`break-inside-avoid rounded-[3mm] border border-dashed border-zinc-500 bg-white text-center ${
        compact ? 'min-h-[39mm] p-[2.5mm]' : 'min-h-[58mm] p-[4mm]'
      }`}
    >
      <TicketHeader compact={compact} />

      <img
        src={item.qr}
        alt={`QR ${item.code}`}
        className={`mx-auto ${
          compact
            ? 'my-[1.5mm] h-[18mm] w-[18mm]'
            : 'my-[2.5mm] h-[27mm] w-[27mm]'
        }`}
      />

      <CodeValue code={item.code} large={!compact} />
      <CodeStatus item={item} />
      <CutLine text={compact ? 'cortar' : 'cortar aqui'} />
    </article>
  )
}

function TicketHeader({ compact }: { compact: boolean }) {
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

function CodeValue({
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

function CodeStatus({ item }: { item: PrintableCode }) {
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

function CutLine({ text }: { text: string }) {
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
