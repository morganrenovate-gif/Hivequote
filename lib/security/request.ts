import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'

function normalizedOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

/**
 * Cookie-authenticated mutation endpoints must be same-origin.
 * Explicit Bearer-token callers do not rely on ambient cookies and are allowed without Origin.
 */
export function authorizedMutationOrigin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ') && auth.slice('Bearer '.length).trim()) return true

  const origin = normalizedOrigin(req.headers.get('origin') ?? '')
  if (!origin) return false

  const requestOrigin = normalizedOrigin(req.nextUrl.origin)
  const configuredOrigin = normalizedOrigin(env.siteUrl)
  return origin === requestOrigin || origin === configuredOrigin
}
