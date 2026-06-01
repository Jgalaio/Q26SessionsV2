'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

type Dj = {
  id: string
  image_url: string
  name: string
}

const CODE_REGEX = /^PS-[A-Z0-9]{4}-\d{6}$/

export default function VotePage() {
  const params = useParams<{ dj: string }>()
  const dj = Array.isArray(params.dj) ? params.dj[0] : params.dj
  const router = useRouter()

  const [djData, setDjData] = useState<Dj | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [voteBackgroundUrl, setVoteBackgroundUrl] = useState<string | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<string | null>(null)
  const voteInFlightRef = useRef(false)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}

      try {
        await scannerRef.current.clear()
      } catch {}

      scannerRef.current = null
    }

    setScanning(false)
  }

  useEffect(() => {
    let isMounted = true

    setScanning(false)
    setSuccess(false)
    setManualCode('')
    lastScanRef.current = null
    voteInFlightRef.current = false

    const loadDj = async () => {
      if (!dj) {
        setErrorMessage('DJ inválido.')
        setPageLoading(false)
        return
      }

      setPageLoading(true)
      setErrorMessage('')

      try {
        const res = await fetch(`/api/djs/${dj}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'DJ não encontrado')
        }

        if (isMounted) {
          setDjData(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar este DJ.'
          )
        }
      } finally {
        if (isMounted) {
          setPageLoading(false)
        }
      }
    }

    void loadDj()

    return () => {
      isMounted = false

      const scanner = scannerRef.current

      if (scanner) {
        scannerRef.current = null

        void (async () => {
          try {
            await scanner.stop()
          } catch {}

          try {
            scanner.clear()
          } catch {}
        })()
      }
    }
  }, [dj])

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()

        if (isMounted) {
          setVoteBackgroundUrl(data?.vote_background_url || null)
        }
      } catch {}
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  const feedback = () => {
    const audio = new Audio('/beep.mp3')
    void audio.play().catch(() => {})

    if (navigator.vibrate) {
      navigator.vibrate(150)
    }
  }

  const autoVote = async (code: string) => {
    if (loading || voteInFlightRef.current || !dj) return

    const normalizedCode = code.trim().toUpperCase()

    if (!CODE_REGEX.test(normalizedCode)) {
      setErrorMessage('Código inválido. Confirma o formato e tenta novamente.')
      return
    }

    voteInFlightRef.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: normalizedCode,
          dj_id: dj,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        lastScanRef.current = null
        setErrorMessage(data.error || 'Não foi possível registar o voto.')
        return
      }

      feedback()
      setManualCode('')
      setSuccess(true)

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      lastScanRef.current = null
      setErrorMessage('Erro de ligação. Tenta novamente.')
    } finally {
      voteInFlightRef.current = false
      setLoading(false)
    }
  }

  const startScanner = async () => {
    if (scanning || loading) return

    setErrorMessage('')
    setScanning(true)

    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: 260 },
        (decodedText) => {
          const match = decodedText.match(CODE_REGEX)

          if (!match) return

          const code = match[0]

          if (code === lastScanRef.current || voteInFlightRef.current) return

          lastScanRef.current = code
          void stopScanner()
          void autoVote(code)
        },
        () => {}
      )
    } catch {
      setErrorMessage(
        'Não foi possível abrir a câmara. Podes introduzir o código manualmente.'
      )
      setScanning(false)
      scannerRef.current = null
    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <p className="text-zinc-500">A carregar DJ...</p>
      </main>
    )
  }

  if (!djData) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-xl">
          <p className="mb-2 text-lg font-bold">
            Não conseguimos abrir esta página.
          </p>
          <p className="text-zinc-500">
            {errorMessage || 'DJ não encontrado.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      className="relative min-h-screen bg-white flex items-center justify-center p-6 bg-cover bg-center"
      style={
        voteBackgroundUrl
          ? { backgroundImage: `url(${voteBackgroundUrl})` }
          : undefined
      }
    >
      {voteBackgroundUrl && (
        <div className="absolute inset-0 bg-black/55" />
      )}

      <div className="relative z-10 max-w-md w-full">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
          <div className="relative group">
            <img
              src={djData.image_url}
              className="w-full h-64 object-cover"
              alt={djData.name}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 blur-xl" />

            <h1 className="absolute bottom-4 left-4 text-white text-2xl font-black tracking-wide">
              {djData.name}
            </h1>
          </div>

          <div className="p-5 space-y-4">
            {success && (
              <div className="bg-green-500 text-white p-3 rounded-xl text-center font-bold animate-pulse">
                ✅ VOTO REGISTADO
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-500 animate-pulse">
                A registar voto...
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {!scanning ? (
              <button
                onClick={startScanner}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'A validar...' : '📷 SCAN & VOTAR'}
              </button>
            ) : (
              <button
                onClick={() => void stopScanner()}
                className="w-full py-4 rounded-xl text-white font-bold bg-red-500"
              >
                ❌ PARAR
              </button>
            )}

            <div className="relative">
              <div
                id="reader"
                className={`w-full rounded-xl overflow-hidden ${
                  scanning ? 'block' : 'hidden'
                }`}
              />

              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-red-500 animate-[scan_2s_linear_infinite]" />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-700 mb-3">
                Se o QR não ler, introduz o código manualmente.
              </p>

              <div className="flex gap-2">
                <input
                  value={manualCode}
                  onChange={(event) =>
                    setManualCode(event.target.value.toUpperCase())
                  }
                  placeholder="PS-ABCD-000001"
                  className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none"
                />

                <button
                  onClick={() => void autoVote(manualCode)}
                  disabled={loading || !manualCode.trim()}
                  className="rounded-xl bg-black px-4 py-3 font-bold text-white disabled:opacity-40"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(250px);
          }
        }
      `}</style>
    </main>
  )
}
