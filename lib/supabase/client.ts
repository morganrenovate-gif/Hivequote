import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

let cached: SupabaseClient | null = null

/** Browser client (anon key) for the contractor portal. Null in mock mode. */
export function createBrowserClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null
  if (!cached) {
    cached = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey)
  }
  return cached
}
