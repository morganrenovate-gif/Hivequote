import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { createServiceClient } from '@/lib/supabase/server'

export const CONTRACTOR_ACCESS_COOKIE = 'hq_contractor_access'
export const CONTRACTOR_REFRESH_COOKIE = 'hq_contractor_refresh'

export type AuthenticatedContractor = {
  userId: string
  contractorId: string
  stripeCustomerId: string | null
}

async function resolveContractorFromToken(accessToken: string): Promise<AuthenticatedContractor | null> {
  if (!accessToken || !env.supabaseUrl || !env.supabaseAnonKey) return null

  const verifier = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await verifier.auth.getUser(accessToken)
  if (userError || !userData.user) return null

  const service = createServiceClient()
  if (!service) return null

  const { data, error } = await service
    .from('contractors')
    .select('id,stripe_customer_id')
    .eq('auth_user_id', userData.user.id)
    .maybeSingle()

  if (error || !data) return null
  return {
    userId: userData.user.id,
    contractorId: data.id,
    stripeCustomerId: data.stripe_customer_id,
  }
}

/** Resolve authenticated contractor from HttpOnly portal cookie or explicit bearer token. */
export async function requireContractor(req: NextRequest): Promise<AuthenticatedContractor | null> {
  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  const cookieToken = req.cookies.get(CONTRACTOR_ACCESS_COOKIE)?.value ?? ''
  return resolveContractorFromToken(bearer || cookieToken)
}

export async function resolveContractorAccessToken(accessToken: string) {
  return resolveContractorFromToken(accessToken)
}
