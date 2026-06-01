'use client'

import { useEffect, useState } from 'react'
import { tryGetSupabaseClient } from '@/lib/supabase'

type Tab = 'djs' | 'ranking' | 'control'

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('djs')

  const [djs, setDjs] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [votingOpen, setVotingOpen] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [totalCodes, setTotalCodes] = useState(1000)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)

  // ================= INIT =================
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = () => {
    fetchDjs()
    fetchRanking()
    fetchSettings()
  }

  // ================= DJs =================
  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data || [])
  }

  const deleteDj = async (id: string) => {
    await fetch('/api/djs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchDjs()
  }

  const updateName = async (id: string) => {
    await fetch('/api/djs/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: newName }),
    })

    setEditingId(null)
    setNewName('')
    fetchDjs()
  }

  const handleAdd = async () => {
    if (!newName || !file) {
      alert('Preenche nome e imagem')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = await uploadRes.json()

    await fetch('/api/djs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        image_url: uploadData.url,
      }),
    })

    setNewName('')
    setFile(null)
    fetchDjs()
  }

  // ================= RANKING =================
  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()
    setRanking(data || [])
  }

  useEffect(() => {
    const client = tryGetSupabaseClient()

    if (!client) {
      return
    }

    setRealtimeEnabled(true)

    const channel = client
      .channel('votes-pro')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => fetchRanking()
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (realtimeEnabled) {
      return
    }

    const interval = setInterval(() => {
      fetchRanking()
    }, 10000)

    return () => clearInterval(interval)
  }, [realtimeEnabled])

  // ================= SETTINGS =================
  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setVotingOpen(data.voting_open)
  }

  const toggleVoting = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voting_open: !votingOpen }),
    })

    setVotingOpen(!votingOpen)
  }

  // ================= RESET =================
  const resetVotes = async () => {
    const confirmReset = confirm(
      '⚠️ ATENÇÃO!\n\nIsto vai apagar TODOS os votos.\n\nContinuar?'
    )

    if (!confirmReset) return

    setResetLoading(true)

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
      } else {
        alert('✅ Votos resetados com sucesso')
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao fazer reset')
    }

    setResetLoading(false)
  }

  // ================= GERAR CÓDIGOS =================
  const handleGenerateCodes = async () => {
    setLoadingCodes(true)

    try {
      const res = await fetch('/api/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalCodes }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
      } else {
        alert(`✅ ${data.total} códigos criados!`)
      }
    } catch {
      alert('Erro ao gerar códigos')
    }

    setLoadingCodes(false)
  }

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Admin Panel</h1>
          {!realtimeEnabled && (
            <p className="text-sm text-amber-600 mt-1">
              Atualizacao automatica em modo fallback.
            </p>
          )}
        </div>

        <div className="flex gap-2">

          <a
            href="/live"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold"
          >
            🎥 LIVE
          </a>

          <a
            href="/admin/analytics"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
          >
            📊 Analytics
          </a>

          <a
            href="/admin/dj-qrcodes"
             target="_blank"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
          >
            📱 QR DJs
          </a>

          <a
            href="/admin/dj-poster"
              target="_blank"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
          >
            🎨 Poster DJs
          </a>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl"
          >
            Logout
          </button>

        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setTab('djs')} className={tabBtn(tab === 'djs')}>DJs</button>
        <button onClick={() => setTab('ranking')} className={tabBtn(tab === 'ranking')}>Ranking</button>
        <button onClick={() => setTab('control')} className={tabBtn(tab === 'control')}>Controlo</button>
      </div>

      {/* ================= DJs ================= */}
      {tab === 'djs' && (
        <div>

          <div className="mb-8 p-4 border rounded-xl">
            <h3 className="font-bold mb-3">Adicionar DJ</h3>

            <input
              placeholder="Nome do DJ"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-3"
            />

            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-black text-white rounded"
            >
              ➕ Adicionar
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {djs.map((dj) => (
              <div key={dj.id} className="border rounded-xl p-3">
                <img src={dj.image_url} className="h-40 w-full object-cover rounded mb-2" />

                {editingId === dj.id ? (
                  <>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border p-2 w-full mb-2"
                    />
                    <button onClick={() => updateName(dj.id)}>Guardar</button>
                  </>
                ) : (
                  <p className="font-bold">{dj.name}</p>
                )}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => {
                    setEditingId(dj.id)
                    setNewName(dj.name)
                  }}>✏️</button>

                  <button onClick={() => deleteDj(dj.id)}>❌</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= RANKING ================= */}
      {tab === 'ranking' && (
        <div className="space-y-3">
          {ranking.map((dj, i) => (
            <div key={dj.id} className="flex items-center gap-4 border p-3 rounded-xl">
              <div className="w-10 font-black">#{i + 1}</div>
              <img src={dj.image_url} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1">{dj.name}</div>
              <div className="font-bold">{dj.votes}</div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CONTROL ================= */}
      {tab === 'control' && (
        <div className="space-y-6">

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-2">Estado da votação</h2>

            <p className="mb-4">
              <span className={votingOpen ? 'text-green-500' : 'text-red-500'}>
                {votingOpen ? 'ABERTA' : 'FECHADA'}
              </span>
            </p>

            <button
              onClick={toggleVoting}
              className="px-6 py-3 bg-black text-white rounded-xl"
            >
              {votingOpen ? 'Fechar votação' : 'Abrir votação'}
            </button>
          </div>

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-2">Reset</h2>

            <button
              onClick={resetVotes}
              className="px-6 py-3 bg-red-500 text-white rounded-xl w-full"
            >
              {resetLoading ? 'A resetar...' : '🔥 Resetar votos'}
            </button>
          </div>

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-3">Gerar códigos</h2>

            <input
              type="number"
              value={totalCodes}
              onChange={(e) => setTotalCodes(Number(e.target.value))}
              className="border p-3 rounded w-full mb-4"
            />

            <button
              onClick={handleGenerateCodes}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl w-full"
            >
              {loadingCodes ? 'A gerar...' : 'Gerar códigos'}
            </button>
          </div>

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-3">Impressão de senhas</h2>

            <a
              href="/admin/print"
              target="_blank"
              className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-xl"
            >
              🖨️ Abrir impressão de códigos
            </a>
          </div>

        </div>
      )}

    </main>
  )
}

function tabBtn(active: boolean) {
  return `px-4 py-2 rounded-xl font-bold ${
    active ? 'bg-black text-white' : 'bg-zinc-200'
  }`
}
