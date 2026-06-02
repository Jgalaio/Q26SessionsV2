'use client'

import { useEffect, useState } from 'react'
import { tryGetSupabaseClient } from '@/lib/supabase'
import type { ReactNode } from 'react'

type Tab = 'djs' | 'ranking' | 'control'
type BrandAssetTarget = 'home' | 'vote' | 'poster' | 'logo' | 'homeSubtitle'
type HomeSubtitleMode = 'text' | 'image'
type EventTitleVisibilityOption = {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

const DEFAULT_EVENT_TITLE = 'Q26 Sessions'
const DEFAULT_HOME_SUBTITLE = 'Vota no teu DJ favorito'

const adminInputClass =
  'w-full rounded-2xl border border-white/12 bg-[#0c1230]/82 px-4 py-3 text-white placeholder:text-white/38 outline-none transition focus:border-cyan-300/60 focus:bg-[#11183e]'

const adminFileInputClass =
  'block w-full cursor-pointer rounded-2xl border border-dashed border-white/16 bg-white/6 px-4 py-3 text-sm text-white/78 file:mr-4 file:rounded-xl file:border-0 file:bg-white/12 file:px-4 file:py-2 file:font-semibold file:text-white hover:border-fuchsia-300/35'

const adminPrimaryBtnClass =
  'rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-5 py-3 font-bold text-white shadow-[0_0_28px_rgba(255,88,208,0.24)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100'

const adminSecondaryBtnClass =
  'rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-bold text-white transition hover:bg-white/12 disabled:opacity-50'

const adminDangerBtnClass =
  'rounded-2xl bg-red-500/90 px-5 py-3 font-bold text-white transition hover:bg-red-500 disabled:opacity-50'

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('djs')

  const [djs, setDjs] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [votingOpen, setVotingOpen] = useState(true)
  const [homeBackgroundUrl, setHomeBackgroundUrl] = useState<string | null>(null)
  const [voteBackgroundUrl, setVoteBackgroundUrl] = useState<string | null>(null)
  const [posterBackgroundUrl, setPosterBackgroundUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState(DEFAULT_EVENT_TITLE)
  const [homeSubtitle, setHomeSubtitle] = useState(DEFAULT_HOME_SUBTITLE)
  const [homeSubtitleMode, setHomeSubtitleMode] =
    useState<HomeSubtitleMode>('text')
  const [homeSubtitleImageUrl, setHomeSubtitleImageUrl] = useState<string | null>(null)
  const [homeSubtitleImageScalePercent, setHomeSubtitleImageScalePercent] =
    useState(100)
  const [showEventTitleHome, setShowEventTitleHome] = useState(true)
  const [showEventTitleLive, setShowEventTitleLive] = useState(true)
  const [showEventTitlePoster, setShowEventTitlePoster] = useState(true)
  const [showEventTitlePrint, setShowEventTitlePrint] = useState(true)
  const [homeLogoScalePercent, setHomeLogoScalePercent] = useState(100)
  const [voteLogoScalePercent, setVoteLogoScalePercent] = useState(100)
  const [posterLogoScalePercent, setPosterLogoScalePercent] = useState(100)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [homeBackgroundFile, setHomeBackgroundFile] = useState<File | null>(null)
  const [voteBackgroundFile, setVoteBackgroundFile] = useState<File | null>(null)
  const [posterBackgroundFile, setPosterBackgroundFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [homeSubtitleImageFile, setHomeSubtitleImageFile] =
    useState<File | null>(null)

  const [totalCodes, setTotalCodes] = useState(1000)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  const [savingAsset, setSavingAsset] = useState<BrandAssetTarget | null>(null)
  const [savingLogoScale, setSavingLogoScale] = useState(false)
  const [savingEventTitle, setSavingEventTitle] = useState(false)

  // ================= INIT =================
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = () => {
    fetchDjs()
    fetchRanking()
    void fetchSettings()
  }

  const uploadImage = async (selectedFile: File, folder = 'djs') => {
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('folder', folder)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = await uploadRes.json()

    if (!uploadRes.ok) {
      throw new Error(uploadData.error || 'Erro no upload')
    }

    return uploadData.url as string
  }

  const saveSettings = async (
    updates: Record<string, boolean | string | number | null>
  ) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao guardar definicoes')
    }
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

    try {
      const imageUrl = await uploadImage(file, 'djs')

      const res = await fetch('/api/djs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          image_url: imageUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao adicionar DJ')
      }

      setNewName('')
      setFile(null)
      fetchDjs()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao adicionar DJ')
    }
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
    setVotingOpen(Boolean(data?.voting_open))
    setHomeBackgroundUrl(data?.home_background_url || null)
    setVoteBackgroundUrl(data?.vote_background_url || null)
    setPosterBackgroundUrl(data?.poster_background_url || null)
    setLogoUrl(data?.logo_url || null)
    setEventTitle(data?.event_title || DEFAULT_EVENT_TITLE)
    setHomeSubtitle(data?.home_subtitle || DEFAULT_HOME_SUBTITLE)
    setHomeSubtitleMode(data?.home_subtitle_mode === 'image' ? 'image' : 'text')
    setHomeSubtitleImageUrl(data?.home_subtitle_image_url || null)
    setHomeSubtitleImageScalePercent(
      data?.home_subtitle_image_scale_percent ?? 100
    )
    setShowEventTitleHome(data?.show_event_title_home ?? true)
    setShowEventTitleLive(data?.show_event_title_live ?? true)
    setShowEventTitlePoster(data?.show_event_title_poster ?? true)
    setShowEventTitlePrint(data?.show_event_title_print ?? true)
    const defaultScale = data?.logo_scale_percent ?? 100
    setHomeLogoScalePercent(data?.home_logo_scale_percent ?? defaultScale)
    setVoteLogoScalePercent(data?.vote_logo_scale_percent ?? defaultScale)
    setPosterLogoScalePercent(data?.poster_logo_scale_percent ?? defaultScale)
  }

  const toggleVoting = async () => {
    try {
      await saveSettings({ voting_open: !votingOpen })
      setVotingOpen(!votingOpen)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao atualizar votacao')
    }
  }

  const saveEventTitle = async () => {
    const normalizedTitle = eventTitle.trim()
    const normalizedSubtitle = homeSubtitle.trim()
    const normalizedSubtitleScale = Math.round(homeSubtitleImageScalePercent)

    if (!normalizedTitle || normalizedTitle.length > 80) {
      alert('O título do evento deve ter entre 1 e 80 caracteres.')
      return
    }

    if (
      homeSubtitleMode === 'text' &&
      (!normalizedSubtitle || normalizedSubtitle.length > 120)
    ) {
      alert('O texto da página principal deve ter entre 1 e 120 caracteres.')
      return
    }

    if (normalizedSubtitleScale < 40 || normalizedSubtitleScale > 500) {
      alert('A escala da imagem deve estar entre 40% e 500%.')
      return
    }

    setSavingEventTitle(true)

    try {
      let subtitleImageUrl = homeSubtitleImageUrl

      if (homeSubtitleMode === 'image' && homeSubtitleImageFile) {
        subtitleImageUrl = await uploadImage(homeSubtitleImageFile, 'branding')
      }

      if (homeSubtitleMode === 'image' && !subtitleImageUrl) {
        alert('Escolhe e guarda uma imagem para usar nesta zona.')
        return
      }

      await saveSettings({
        event_title: normalizedTitle,
        home_subtitle: normalizedSubtitle || DEFAULT_HOME_SUBTITLE,
        home_subtitle_mode: homeSubtitleMode,
        home_subtitle_image_url: subtitleImageUrl,
        home_subtitle_image_scale_percent: normalizedSubtitleScale,
        show_event_title_home: showEventTitleHome,
        show_event_title_live: showEventTitleLive,
        show_event_title_poster: showEventTitlePoster,
        show_event_title_print: showEventTitlePrint,
      })
      setEventTitle(normalizedTitle)
      setHomeSubtitle(normalizedSubtitle || DEFAULT_HOME_SUBTITLE)
      setHomeSubtitleImageUrl(subtitleImageUrl)
      setHomeSubtitleImageScalePercent(normalizedSubtitleScale)
      setHomeSubtitleImageFile(null)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao guardar detalhes do evento'
      )
    } finally {
      setSavingEventTitle(false)
    }
  }

  const saveAssetImage = async (target: BrandAssetTarget) => {
    const selectedFile =
      target === 'homeSubtitle'
        ? homeSubtitleImageFile
        : target === 'home'
          ? homeBackgroundFile
          : target === 'vote'
            ? voteBackgroundFile
            : target === 'poster'
              ? posterBackgroundFile
              : logoFile

    if (!selectedFile) {
      alert('Escolhe uma imagem primeiro')
      return
    }

    const subtitleImageScale = Math.round(homeSubtitleImageScalePercent)

    if (
      target === 'homeSubtitle' &&
      (subtitleImageScale < 40 || subtitleImageScale > 500)
    ) {
      alert('A escala da imagem deve estar entre 40% e 500%.')
      return
    }

    setSavingAsset(target)

    try {
      const folder =
        target === 'logo' || target === 'homeSubtitle'
          ? 'branding'
          : 'backgrounds'
      const imageUrl = await uploadImage(selectedFile, folder)

      if (target === 'homeSubtitle') {
        await saveSettings({
          home_subtitle_image_url: imageUrl,
          home_subtitle_mode: 'image',
          home_subtitle_image_scale_percent: subtitleImageScale,
        })
        setHomeSubtitleImageUrl(imageUrl)
        setHomeSubtitleImageScalePercent(subtitleImageScale)
        setHomeSubtitleImageFile(null)
        setHomeSubtitleMode('image')
      } else if (target === 'home') {
        await saveSettings({ home_background_url: imageUrl })
        setHomeBackgroundUrl(imageUrl)
        setHomeBackgroundFile(null)
      } else if (target === 'vote') {
        await saveSettings({ vote_background_url: imageUrl })
        setVoteBackgroundUrl(imageUrl)
        setVoteBackgroundFile(null)
      } else if (target === 'poster') {
        await saveSettings({ poster_background_url: imageUrl })
        setPosterBackgroundUrl(imageUrl)
        setPosterBackgroundFile(null)
      } else {
        await saveSettings({ logo_url: imageUrl })
        setLogoUrl(imageUrl)
        setLogoFile(null)
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar asset'
      )
    } finally {
      setSavingAsset(null)
    }
  }

  const clearAssetImage = async (target: BrandAssetTarget) => {
    setSavingAsset(target)

    try {
      if (target === 'homeSubtitle') {
        await saveSettings({
          home_subtitle_image_url: null,
          home_subtitle_mode: 'text',
        })
        setHomeSubtitleImageUrl(null)
        setHomeSubtitleImageFile(null)
        setHomeSubtitleMode('text')
      } else if (target === 'home') {
        await saveSettings({ home_background_url: null })
        setHomeBackgroundUrl(null)
        setHomeBackgroundFile(null)
      } else if (target === 'vote') {
        await saveSettings({ vote_background_url: null })
        setVoteBackgroundUrl(null)
        setVoteBackgroundFile(null)
      } else if (target === 'poster') {
        await saveSettings({ poster_background_url: null })
        setPosterBackgroundUrl(null)
        setPosterBackgroundFile(null)
      } else {
        await saveSettings({ logo_url: null })
        setLogoUrl(null)
        setLogoFile(null)
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao remover asset'
      )
    } finally {
      setSavingAsset(null)
    }
  }

  const saveLogoScale = async () => {
    const scales = {
      home_logo_scale_percent: Math.round(homeLogoScalePercent),
      vote_logo_scale_percent: Math.round(voteLogoScalePercent),
      poster_logo_scale_percent: Math.round(posterLogoScalePercent),
    }

    const hasInvalidScale = Object.values(scales).some(
      (value) => value < 40 || value > 500
    )

    if (hasInvalidScale) {
      alert('Escolhe tamanhos entre 40% e 500%')
      return
    }

    setSavingLogoScale(true)

    try {
      await saveSettings(scales)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao guardar tamanho do logo'
      )
    } finally {
      setSavingLogoScale(false)
    }
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

  const configuredAssets = [
    homeBackgroundUrl,
    voteBackgroundUrl,
    posterBackgroundUrl,
    logoUrl,
  ].filter(Boolean).length

  const totalVotes = ranking.reduce(
    (sum, dj) => sum + Number(dj.votes || 0),
    0
  )

  const leadingDj = ranking[0]
  const topVotes = Number(leadingDj?.votes || 0)
  const eventTitleVisibilityOptions: EventTitleVisibilityOption[] = [
    {
      label: 'Página principal',
      checked: showEventTitleHome,
      onChange: setShowEventTitleHome,
    },
    {
      label: 'Página Live',
      checked: showEventTitleLive,
      onChange: setShowEventTitleLive,
    },
    {
      label: 'Posters dos DJs',
      checked: showEventTitlePoster,
      onChange: setShowEventTitlePoster,
    },
    {
      label: 'Impressão de códigos',
      checked: showEventTitlePrint,
      onChange: setShowEventTitlePrint,
    },
  ]

  return (
    <main className="theme-neon-page relative min-h-screen overflow-hidden">
      <div className="theme-neon-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,88,208,0.2),transparent_22%),radial-gradient(circle_at_88%_10%,rgba(110,231,255,0.16),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(138,92,255,0.18),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <section className="theme-neon-shell rounded-[34px] p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em]">
                Painel de controlo
              </div>

              <h1 className="theme-neon-heading mt-5 text-3xl font-black uppercase tracking-[0.12em] md:text-5xl">
                Admin {eventTitle}
              </h1>

              <p className="theme-neon-muted mt-4 max-w-xl text-sm leading-6 md:text-base">
                Gere DJs, branding, ranking e materiais de evento a partir de
                um único painel com visual alinhado ao tema da votação.
              </p>

              {!realtimeEnabled && (
                <div className="mt-4 inline-flex rounded-full border border-amber-300/24 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
                  Atualizacao automatica em modo fallback.
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
              <a
                href="/live"
                target="_blank"
                rel="noreferrer"
                className={`${adminPrimaryBtnClass} text-center`}
              >
                🎥 LIVE
              </a>

              <a
                href="/admin/analytics"
                className={`${adminSecondaryBtnClass} text-center`}
              >
                📊 Analytics
              </a>

              <a
                href="/admin/dj-qrcodes"
                target="_blank"
                rel="noreferrer"
                className={`${adminSecondaryBtnClass} text-center`}
              >
                📱 QR DJs
              </a>

              <a
                href="/admin/dj-poster"
                target="_blank"
                rel="noreferrer"
                className={`${adminSecondaryBtnClass} text-center`}
              >
                🎨 Poster DJs
              </a>

              <a
                href="/admin/print"
                target="_blank"
                rel="noreferrer"
                className={`${adminSecondaryBtnClass} text-center sm:col-span-2`}
              >
                🖨️ Impressão de códigos
              </a>

              <button
                onClick={handleLogout}
                className={`${adminDangerBtnClass} sm:col-span-2`}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Estado"
              value={votingOpen ? 'Votação aberta' : 'Votação fechada'}
              detail={votingOpen ? 'Pronta para receber votos' : 'Bloqueada para o público'}
            />
            <AdminStatCard
              label="DJs"
              value={String(djs.length)}
              detail="Artistas disponíveis para voto"
            />
            <AdminStatCard
              label="Total de votos"
              value={String(totalVotes)}
              detail={
                leadingDj
                  ? `Lider atual: ${leadingDj.name}`
                  : 'Sem líder definido'
              }
            />
            <AdminStatCard
              label="Assets"
              value={`${configuredAssets}/4`}
              detail="Home, voto, poster e logo"
            />
          </div>
        </section>

        <div className="theme-neon-panel mt-6 flex flex-wrap gap-3 rounded-[28px] p-3">
          <button onClick={() => setTab('djs')} className={tabBtn(tab === 'djs')}>
            DJs
          </button>
          <button
            onClick={() => setTab('ranking')}
            className={tabBtn(tab === 'ranking')}
          >
            Ranking
          </button>
          <button
            onClick={() => setTab('control')}
            className={tabBtn(tab === 'control')}
          >
            Controlo
          </button>
        </div>

        {tab === 'djs' && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="theme-neon-shell rounded-[30px] p-6">
              <div className="mb-6">
                <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  Catálogo
                </p>
                <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                  Adicionar DJ
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Cria um novo cartão de votação com nome e imagem prontos para
                  a home, live e posters.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  placeholder="Nome do DJ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={adminInputClass}
                />

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className={adminFileInputClass}
                />

                {file && (
                  <p className="text-sm text-white/65">
                    Ficheiro selecionado: {file.name}
                  </p>
                )}

                <button onClick={handleAdd} className={`${adminPrimaryBtnClass} w-full`}>
                  ➕ Adicionar DJ
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="theme-neon-shell rounded-[30px] p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="theme-neon-heading text-2xl font-black">
                      Lista de DJs
                    </h2>
                    <p className="theme-neon-muted mt-2 text-sm">
                      Edita rapidamente os nomes e confirma as imagens ativas.
                    </p>
                  </div>

                  <div className="theme-neon-stat rounded-2xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                      Total
                    </p>
                    <p className="theme-neon-heading text-2xl font-black">
                      {djs.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {djs.map((dj, index) => (
                  <article
                    key={dj.id}
                    className="theme-neon-panel overflow-hidden rounded-[28px]"
                  >
                    <div className="relative">
                      <img
                        src={dj.image_url}
                        alt={dj.name}
                        className="h-48 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050513]/92 via-transparent to-transparent" />
                      <div className="theme-neon-chip absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
                        DJ #{index + 1}
                      </div>
                    </div>

                    <div className="p-4">
                      {editingId === dj.id ? (
                        <div className="space-y-3">
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className={adminInputClass}
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => updateName(dj.id)}
                              className={`${adminPrimaryBtnClass} flex-1 px-4 py-3 text-sm`}
                            >
                              Guardar
                            </button>

                            <button
                              onClick={() => {
                                setEditingId(null)
                                setNewName('')
                              }}
                              className={`${adminSecondaryBtnClass} px-4 py-3 text-sm`}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="theme-neon-heading text-xl font-black">
                            {dj.name}
                          </p>

                          <p className="mt-2 text-sm text-white/60">
                            ID: {dj.id}
                          </p>
                        </>
                      )}

                      {editingId !== dj.id && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(dj.id)
                              setNewName(dj.name)
                            }}
                            className={`${adminSecondaryBtnClass} flex-1 px-4 py-3 text-sm`}
                          >
                            ✏️ Editar
                          </button>

                          <button
                            onClick={() => deleteDj(dj.id)}
                            className={`${adminDangerBtnClass} px-4 py-3 text-sm`}
                          >
                            ❌
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'ranking' && (
          <section className="theme-neon-shell mt-6 rounded-[30px] p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  Ranking ao vivo
                </p>
                <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                  Classificação atual
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Vista rápida da corrida com destaque visual para o líder.
                </p>
              </div>

              <div className="theme-neon-stat rounded-2xl px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Votos totais
                </p>
                <p className="theme-neon-heading text-2xl font-black">
                  {totalVotes}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {ranking.map((dj, i) => {
                const progress =
                  topVotes > 0 ? Math.max(8, Math.round((dj.votes / topVotes) * 100)) : 8

                return (
                  <div
                    key={dj.id}
                    className="theme-neon-panel rounded-[26px] p-4 md:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="theme-neon-stat flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black">
                        #{i + 1}
                      </div>

                      <img
                        src={dj.image_url}
                        alt={dj.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-white/18"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <p className="theme-neon-heading truncate text-lg font-black">
                            {dj.name}
                          </p>

                          <div className="theme-neon-chip inline-flex rounded-full px-3 py-1 text-sm font-semibold">
                            {dj.votes} votos
                          </div>
                        </div>

                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 shadow-[0_0_18px_rgba(110,231,255,0.34)]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {ranking.length === 0 && (
                <div className="theme-neon-panel rounded-[26px] p-6 text-center text-white/65">
                  Ainda não existem votos para mostrar no ranking.
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'control' && (
          <section className="mt-6 space-y-6">
            <div className="theme-neon-shell rounded-[30px] p-5 md:p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                    Detalhes do evento
                  </p>
                  <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                    Título do evento
                  </h2>
                  <p className="theme-neon-muted mt-2 text-sm">
                    Escolhe o nome e os locais onde ele deve aparecer.
                  </p>

                  <input
                    value={eventTitle}
                    maxLength={80}
                    onChange={(event) => setEventTitle(event.target.value)}
                    placeholder="Ex: Q26 Sessions"
                    className={`${adminInputClass} mt-5 max-w-xl`}
                  />

                  <p className="mt-2 text-xs text-white/52">
                    {eventTitle.trim().length || 0}/80 caracteres
                  </p>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-white/82">
                      Mostrar título em
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {eventTitleVisibilityOptions.map((option) => (
                        <label
                          key={option.label}
                          className="theme-neon-panel flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/82"
                        >
                          <input
                            type="checkbox"
                            checked={option.checked}
                            onChange={(event) =>
                              option.onChange(event.target.checked)
                            }
                            className="h-5 w-5 accent-cyan-300"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-white/82">
                      Chamada da página principal
                    </label>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {(['text', 'image'] as HomeSubtitleMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setHomeSubtitleMode(mode)}
                          className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                            homeSubtitleMode === mode
                              ? 'bg-cyan-300 text-slate-950'
                              : 'bg-white/8 text-white/72 hover:bg-white/12'
                          }`}
                        >
                          {mode === 'text' ? 'Texto' : 'Imagem'}
                        </button>
                      ))}
                    </div>

                    {homeSubtitleMode === 'text' ? (
                      <>
                        <input
                          value={homeSubtitle}
                          maxLength={120}
                          onChange={(event) =>
                            setHomeSubtitle(event.target.value)
                          }
                          placeholder="Ex: Vota no teu DJ favorito"
                          className={`${adminInputClass} max-w-xl`}
                        />
                        <p className="mt-2 text-xs text-white/52">
                          {homeSubtitle.trim().length || 0}/120 caracteres
                        </p>
                      </>
                    ) : (
                      <div className="max-w-xl">
                        <AssetCard
                          title="Imagem da chamada"
                          currentImage={homeSubtitleImageUrl}
                          selectedFile={homeSubtitleImageFile}
                          saving={savingAsset === 'homeSubtitle'}
                          previewMode="contain"
                          onFileChange={setHomeSubtitleImageFile}
                          onSave={() => void saveAssetImage('homeSubtitle')}
                          onClear={() => void clearAssetImage('homeSubtitle')}
                        >
                          <LogoScaleControl
                            label="Escala da imagem"
                            value={homeSubtitleImageScalePercent}
                            onChange={setHomeSubtitleImageScalePercent}
                          />
                        </AssetCard>
                        <p className="mt-2 text-xs text-white/52">
                          A imagem mantém sempre a proporção original.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => void saveEventTitle()}
                  disabled={savingEventTitle}
                  className={`${adminPrimaryBtnClass} w-full lg:w-auto`}
                >
                  {savingEventTitle ? 'A guardar...' : 'Guardar detalhes'}
                </button>
              </div>
            </div>

            <div className="theme-neon-shell rounded-[30px] p-5 md:p-6">
              <div className="mb-5">
                <p className="theme-neon-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  Branding e fundos
                </p>
                <h2 className="theme-neon-heading mt-4 text-2xl font-black">
                  Identidade visual
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Atualiza os fundos principais, o poster e o logo da experiência.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                <AssetCard
                  title="Página principal"
                  currentImage={homeBackgroundUrl}
                  selectedFile={homeBackgroundFile}
                  saving={savingAsset === 'home'}
                  onFileChange={setHomeBackgroundFile}
                  onSave={() => void saveAssetImage('home')}
                  onClear={() => void clearAssetImage('home')}
                />

                <AssetCard
                  title="Página de voto"
                  currentImage={voteBackgroundUrl}
                  selectedFile={voteBackgroundFile}
                  saving={savingAsset === 'vote'}
                  onFileChange={setVoteBackgroundFile}
                  onSave={() => void saveAssetImage('vote')}
                  onClear={() => void clearAssetImage('vote')}
                />

                <AssetCard
                  title="Poster"
                  currentImage={posterBackgroundUrl}
                  selectedFile={posterBackgroundFile}
                  saving={savingAsset === 'poster'}
                  onFileChange={setPosterBackgroundFile}
                  onSave={() => void saveAssetImage('poster')}
                  onClear={() => void clearAssetImage('poster')}
                />

                <AssetCard
                  title="Logo"
                  currentImage={logoUrl}
                  selectedFile={logoFile}
                  saving={savingAsset === 'logo'}
                  previewMode="contain"
                  onFileChange={setLogoFile}
                  onSave={() => void saveAssetImage('logo')}
                  onClear={() => void clearAssetImage('logo')}
                >
                  <div className="theme-neon-shell mb-4 rounded-[24px] p-4">
                    <p className="mb-2 text-sm font-semibold text-white/85">
                      Tamanho do logo por página
                    </p>

                    <div className="space-y-4">
                      <LogoScaleControl
                        label="Home"
                        value={homeLogoScalePercent}
                        onChange={setHomeLogoScalePercent}
                      />

                      <LogoScaleControl
                        label="Voto"
                        value={voteLogoScalePercent}
                        onChange={setVoteLogoScalePercent}
                      />

                      <LogoScaleControl
                        label="Poster"
                        value={posterLogoScalePercent}
                        onChange={setPosterLogoScalePercent}
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => void saveLogoScale()}
                        disabled={savingLogoScale}
                        className={`${adminSecondaryBtnClass} px-4 py-2 text-sm`}
                      >
                        {savingLogoScale ? 'A guardar...' : 'Guardar tamanhos'}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-white/52">
                      O sistema mantém sempre a proporção do logo.
                    </p>
                  </div>
                </AssetCard>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="theme-neon-shell rounded-[30px] p-6">
                <h2 className="theme-neon-heading text-xl font-black">
                  Estado da votação
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Liga ou bloqueia a votação pública em tempo real.
                </p>

                <div className="mt-5">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                      votingOpen
                        ? 'bg-emerald-400/16 text-emerald-100 border border-emerald-300/24'
                        : 'bg-red-400/16 text-red-100 border border-red-300/24'
                    }`}
                  >
                    {votingOpen ? 'ABERTA' : 'FECHADA'}
                  </span>
                </div>

                <button
                  onClick={toggleVoting}
                  className={`${adminPrimaryBtnClass} mt-5 w-full`}
                >
                  {votingOpen ? 'Fechar votação' : 'Abrir votação'}
                </button>
              </div>

              <div className="theme-neon-shell rounded-[30px] p-6">
                <h2 className="theme-neon-heading text-xl font-black">
                  Gerar códigos
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Cria novas senhas para distribuição com o volume que precisares.
                </p>

                <input
                  type="number"
                  value={totalCodes}
                  onChange={(e) => setTotalCodes(Number(e.target.value))}
                  className={`${adminInputClass} mt-5`}
                />

                <button
                  onClick={handleGenerateCodes}
                  className={`${adminSecondaryBtnClass} mt-4 w-full`}
                >
                  {loadingCodes ? 'A gerar...' : 'Gerar códigos'}
                </button>
              </div>

              <div className="theme-neon-shell rounded-[30px] p-6">
                <h2 className="theme-neon-heading text-xl font-black">
                  Reset de votos
                </h2>
                <p className="theme-neon-muted mt-2 text-sm">
                  Usa apenas quando quiseres reiniciar a competição do zero.
                </p>

                <button
                  onClick={resetVotes}
                  className={`${adminDangerBtnClass} mt-5 w-full`}
                >
                  {resetLoading ? 'A resetar...' : '🔥 Resetar votos'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function tabBtn(active: boolean) {
  return `rounded-2xl px-5 py-3 font-bold transition ${
    active
      ? 'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_22px_rgba(255,88,208,0.22)]'
      : 'bg-white/6 text-white/72 hover:bg-white/10 hover:text-white'
  }`
}

type AdminStatCardProps = {
  label: string
  value: string
  detail: string
}

function AdminStatCard({
  label,
  value,
  detail,
}: AdminStatCardProps) {
  return (
    <div className="theme-neon-stat rounded-[24px] px-5 py-4">
      <p className="text-xs uppercase tracking-[0.28em] text-white/55">
        {label}
      </p>
      <p className="theme-neon-heading mt-2 text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm text-white/62">{detail}</p>
    </div>
  )
}

type AssetCardProps = {
  title: string
  currentImage: string | null
  selectedFile: File | null
  saving: boolean
  children?: ReactNode
  previewMode?: 'cover' | 'contain'
  onFileChange: (file: File | null) => void
  onSave: () => void
  onClear: () => void
}

function AssetCard({
  title,
  currentImage,
  selectedFile,
  saving,
  children,
  previewMode = 'cover',
  onFileChange,
  onSave,
  onClear,
}: AssetCardProps) {
  return (
    <div className="theme-neon-panel rounded-[28px] p-4">
      <p className="mb-3 text-lg font-black text-white">{title}</p>

      {currentImage ? (
        <img
          src={currentImage}
          alt={title}
          className={`mb-3 h-40 w-full rounded-2xl border border-white/10 ${
            previewMode === 'contain'
              ? 'object-contain bg-[#0b112d] p-3'
              : 'object-cover'
          }`}
        />
      ) : (
        <div className="mb-3 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/16 bg-[#0b112d]/72 text-sm text-white/45">
          Nenhum asset definido
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        className={`${adminFileInputClass} mb-3`}
      />

      {selectedFile && (
        <p className="mb-3 text-sm text-white/65">
          Novo ficheiro: {selectedFile.name}
        </p>
      )}

      {children}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving || !selectedFile}
          className={`${adminPrimaryBtnClass} flex-1 px-4 py-3 text-sm`}
        >
          {saving ? 'A guardar...' : 'Guardar imagem'}
        </button>

        <button
          onClick={onClear}
          disabled={saving || !currentImage}
          className={`${adminSecondaryBtnClass} px-4 py-3 text-sm`}
        >
          Remover
        </button>
      </div>
    </div>
  )
}

type LogoScaleControlProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

function LogoScaleControl({
  label,
  value,
  onChange,
}: LogoScaleControlProps) {
  return (
    <div className="theme-neon-panel rounded-[22px] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/84">{label}</span>
        <span className="text-sm text-white/58">{value}%</span>
      </div>

      <input
        type="range"
        min="40"
        max="500"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-3 w-full accent-cyan-300"
      />

      <input
        type="number"
        min="40"
        max="500"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-24 rounded-xl border border-white/12 bg-[#0c1230]/82 px-3 py-2 text-white outline-none"
      />
    </div>
  )
}
