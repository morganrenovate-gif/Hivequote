import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  resolveAdminAccessToken,
} from '@/lib/auth/admin'

const SessionSchema = z.object({
  access_token: z.string().min(20),
  refresh_token: z.string().min(20),
  expires_in: z.number().int().positive().max(86400).optional(),
})

export async function POST(req: NextRequest) {
  const parsed = SessionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid session' }, { status: 400 })

  const admin = await resolveAdminAccessToken(parsed.data.access_token)
  if (!admin) return NextResponse.json({ error: 'Admin access denied' }, { status: 403 })

  const res = NextResponse.json({ success: true, role: admin.role })
  const secure = process.env.NODE_ENV === 'production'
  res.cookies.set(ADMIN_ACCESS_COOKIE, parsed.data.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.expires_in ?? 3600,
  })
  res.cookies.set(ADMIN_REFRESH_COOKIE, parsed.data.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  res.cookies.set(ADMIN_REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
