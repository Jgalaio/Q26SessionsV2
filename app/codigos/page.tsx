import codes from '@/data/codes.json'
import { requireAdminPageAccess } from '@/lib/admin-page-auth'

export default async function CodigosPage() {
  await requireAdminPageAccess()

  return (
    <main className="min-h-screen bg-white text-black p-6 print:p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-2 text-center">
          Purificação Sessions
        </h1>
        <p className="text-center text-base mb-8">
          Senhas de Votação
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {codes.map((code) => (
            <div
              key={code}
              className="border-2 border-dashed border-black rounded-2xl p-5 text-center break-inside-avoid bg-white"
            >
              <p className="text-xs uppercase tracking-[0.25em] mb-2">
                Purificação Sessions
              </p>

              <p className="text-sm font-semibold mb-3">
                Código de Voto
              </p>

              <p className="text-xl font-black tracking-wide mb-3">
                {code}
              </p>

              <div className="border-t border-dashed border-zinc-500 pt-2">
                <p className="text-[11px] text-zinc-600">
                  1 código = 1 voto
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
