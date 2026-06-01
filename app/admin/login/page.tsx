'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!password.trim()) {
      setError('Introduz a password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro no login')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Nao foi possivel iniciar sessao')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
      >
        <h1 className="text-3xl font-black mb-4">Admin Login</h1>
        <p className="text-zinc-400 mb-6">
          Introduz a password para aceder ao painel.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-4 mb-4 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl p-4 font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>

        {error && (
          <p className="mt-4 text-center text-red-400">{error}</p>
        )}
      </form>
    </main>
  )
}
