import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  CONTRACTOR_ACCESS_COOKIE,
  CONTRACTOR_REFRESH_COOKIE,
  resolveContractorAccessToken,
} from '@/lib/auth/contractor'

const SessionSchema = z.object({
  access_token: z.string().min(20),
  refresh_token: z.string().min(20),
  expires_in: z.number().int().positive().max(86400).optional(),
})

export async function POST(req: NextRequest) {
  const parsed = SessionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  const contractor = await resolveContractorAccessToken(parsed.data.access_token)
  if (!contractor) {
    return NextResponse.json({ error: 'No contractor account is linked to this login' }, { status: 403 })
  }

  const res = NextResponse.json({ success: true, contractor_id: contractor.contractorId })
  const secure = process.env.NODE_ENV === 'production'
  res.cookies.set(CONTRACTOR_ACCESS_COOKIE, parsed.data.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.expires_in ?? 3600,
  })
  res.cookies.set(CONTRACTOR_REFRESH_COOKIE, parsed.data.refresh_token, {
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
  res.cookies.set(CONTRACTOR_ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  res.cookies.set(CONTRACTOR_REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
