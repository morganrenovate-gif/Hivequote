import { createHash, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { env, isSupabaseConfigured } from '@/lib/env'

/**
 * Shared-secret gate for inbound webhooks that mutate lead state
 * (/api/leads/qualify, /api/webhooks/ghl). Stripe has its own signature
 * verification; these two are called by GHL, which signs nothing.
 *
 * The secret may arrive as an `x-webhook-secret` header or a `?key=` query
 * param — both are accepted because GHL's webhook action only exposes
 * custom headers on some plans.
 *
 * Fails CLOSED whenever Supabase is configured: an unset secret in front of
 * a real database would leave lead status writable by anyone who has a lead
 * ID. In pure mock mode (no Supabase) the check is skipped so the app still
 * runs end-to-end with zero env vars.
 */
const sha256 = (value: string): Buffer =>
  createHash('sha256').update(value).digest()

export function isAuthorizedWebhook(req: NextRequest): boolean {
  const expected = env.ghlWebhookSecret

  if (!expected) return !isSupabaseConfigured

  const provided =
    req.headers.get('x-webhook-secret') ??
    new URL(req.url).searchParams.get('key') ??
    ''

  if (!provided) return false

  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(sha256(provided), sha256(expected))
}
