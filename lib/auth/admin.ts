import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { createServiceClient } from '@/lib/supabase/server'

export const ADMIN_ACCESS_COOKIE = 'hq_admin_access'
export const ADMIN_REFRESH_COOKIE = 'hq_admin_refresh'

export type HiveQuoteAdmin = {
  userId: string
  role: 'admin' | 'operator' | 'support' | 'finance' | 'auditor'
}

export async function resolveAdminAccessToken(accessToken: string): Promise<HiveQuoteAdmin | null> {
  if (!accessToken || !env.supabaseUrl || !env.supabaseAnonKey) return null

  const verifier = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await verifier.auth.getUser(accessToken)
  if (userError || !userData.user) return null

  const service = createServiceClient()
  if (!service) return null
  const { data, error } = await service
    .from('admin_users')
    .select('role,active')
    .eq('auth_user_id', userData.user.id)
    .maybeSingle()

  if (error || !data?.active) return null
  return { userId: userData.user.id, role: data.role as HiveQuoteAdmin['role'] }
}

export async function requireAdmin(req: NextRequest): Promise<HiveQuoteAdmin | null> {
  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  const cookieToken = req.cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? ''
  return resolveAdminAccessToken(bearer || cookieToken)
}
