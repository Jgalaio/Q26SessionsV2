import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function tryGetSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export function getSupabaseClient() {
  const client = tryGetSupabaseClient()

  if (!client) {
    throw new Error('Faltam variaveis publicas do Supabase no ambiente.')
  }

  return client
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
