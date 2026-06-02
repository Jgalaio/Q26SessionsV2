'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function PrintClient() {
  const [codes, setCodes] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)
  const [onlyAvailable, setOnlyAvailable] = useState(true)

  const [mode, setMode] = useState<'ticket' | 'a4-12' | 'a4-24' | 'label-62x29'>('ticket')

  // ================= INIT =================
  useEffect(() => {
    fetchCodes()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [codes, start, end, onlyAvailable])

  useEffect(() => {
    generateQR()
  }, [filtered])

  // ================= FETCH =================
  const fetchCodes = async () => {
    const res = await fetch('/api/codes')
    const data = await res.json()
    setCodes(data || [])
  }

  // ================= FILTER =================
  const applyFilter = () => {
    let list = [...codes]

    if (onlyAvailable) {
      list = list.filter(c => !c.distributed)
    }

    const slice = list.slice(start - 1, end)
    setFiltered(slice)
  }

  // ================= QR =================
  const generateQR = async () => {
    const result = await Promise.all(
      filtered.map(async (c: any) => {
        const qr = await QRCode.toDataURL(c.code)

        return {
          ...c,
          qr,
        }
      })
    )

    setItems(result)
  }

  // ================= DISTRIBUTE =================
  const markAsDistributed = async () => {
    const codesToUpdate = filtered.map(c => c.code)

    await fetch('/api/codes/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codesToUpdate }),
    })

    alert('✅ Marcados como distribuídos')
    fetchCodes()
  }

  return (
    <main className="bg-white p-4 font-mono">

      {/* ================= CONTROLOS ================= */}
      <div className="mb-4 print:hidden flex flex-wrap gap-2 items-center">

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
          onChange={(e) => setMode(e.target.value as any)}
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
