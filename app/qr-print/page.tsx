import { requireAdminPageAccess } from '@/lib/admin-page-auth'

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

export default async function QRPrintPage() {
  await requireAdminPageAccess()

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-4 text-center">
          Purificação Sessions
        </h1>

        <p className="text-center text-lg mb-10">
          Vota no teu DJ favorito
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {DJs.map((dj) => (
            <div
              key={dj}
              className="rounded-3xl border border-zinc-300 bg-white p-5 text-center"
            >
              <h2 className="text-xl font-black mb-4">{dj.toUpperCase()}</h2>

              <img
                src={`/qrs/${dj}.png`}
                alt={`QR ${dj}`}
                className="w-full rounded-2xl bg-white p-2 mb-4"
              />

              <p className="text-sm text-zinc-500">
                /votar/{dj}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
