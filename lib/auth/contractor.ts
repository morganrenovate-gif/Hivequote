import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { createServiceClient } from '@/lib/supabase/server'

export type AuthenticatedContractor = {
  userId: string
  contractorId: string
  stripeCustomerId: string | null
}

/**
 * Resolve the authenticated Supabase user from a bearer token, then map that user to
 * exactly one HiveQuote contractor record. Client-supplied contractor/customer IDs are
 * never trusted for financial operations.
 */
export async function requireContractor(req: NextRequest): Promise<AuthenticatedContractor | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ') || !env.supabaseUrl || !env.supabaseAnonKey) return null

  const accessToken = auth.slice('Bearer '.length).trim()
  if (!accessToken) return null

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
