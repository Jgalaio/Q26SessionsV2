const DJs = [
  'dj-001',
  'dj-002',
  'dj-003',
  'dj-004',
  'dj-005',
  'dj-006',
  'dj-007',
  'dj-008',
  'dj-009',
  'dj-010',
]

export default function QRPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Purificação Sessions
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Escolhe o teu DJ favorito, lê o QR Code e vota com o teu código único.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {DJs.map((dj) => (
            <div
              key={dj}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-center shadow-xl"
            >
              <h2 className="text-xl font-black mb-4">{dj.toUpperCase()}</h2>

              <img
                src={`/qrs/${dj}.png`}
                alt={`QR ${dj}`}
                className="w-full rounded-2xl bg-white p-3 mb-4"
              />

              <p className="text-sm text-zinc-400 break-all">
                /votar/{dj}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}