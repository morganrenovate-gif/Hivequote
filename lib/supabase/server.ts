import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/env'

let cached: SupabaseClient | null = null

/**
 * Service-role Supabase client for API routes and server components.
 * Returns null when Supabase is not configured — callers fall back to
 * the in-memory mock store (lib/mock/store.ts).
 */
export function createServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!cached) {
    cached = createSupabaseClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return cached
}
