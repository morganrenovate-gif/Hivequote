import crypto from 'crypto'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'

/** Constant-time authentication for internal automation endpoints. */
export function authorizedInternalRequest(req: NextRequest): boolean {
  const supplied = req.headers.get('x-hivequote-internal-key') ?? ''
  const expected = env.internalWebhookSecret
  if (!supplied || !expected) return false

  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
