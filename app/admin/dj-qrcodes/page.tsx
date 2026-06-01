'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function DjQRCodesPage() {
  const [djs, setDjs] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetchDjs()
  }, [])

  useEffect(() => {
    generateQR()
  }, [djs])

  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data || [])
  }

  const generateQR = async () => {
    const baseUrl = window.location.origin

    const result = await Promise.all(
      djs.map(async (dj) => {
        const url = `${baseUrl}/votar/${dj.slug || dj.id}`

        const qr = await QRCode.toDataURL(url)

        return {
          ...dj,
          qr,
          url,
        }
      })
    )

    setItems(result)
  }

  return (
    <main className="p-6 bg-white">

      {/* BOTÃO PRINT */}
      <div className="mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded"
        >
          🖨️ Imprimir QR Codes
        </button>
      </div>

      {/* GRID A4 */}
      <div className="grid grid-cols-2 gap-6">

        {items.map((dj, i) => (
          <div
            key={i}
            className="border p-4 text-center flex flex-col items-center"
            style={{ height: '400px' }}
          >

            <p className="text-lg font-bold mb-2">
              VOTA NO TEU DJ
            </p>

            <img
              src={dj.image_url}
              className="w-32 h-32 object-cover rounded-xl mb-3"
            />

            <h2 className="text-xl font-black mb-3">
              {dj.name}
            </h2>

            <img
              src={dj.qr}
              className="w-40 mb-2"
            />

            <p className="text-xs break-all opacity-60">
              {dj.url}
            </p>

          </div>
        ))}

      </div>

    </main>
  )
}