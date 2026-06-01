import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltam variaveis publicas do Supabase no ambiente.')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseClient()
      const value = client[prop as keyof typeof client]
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
) as ReturnType<typeof createClient>
