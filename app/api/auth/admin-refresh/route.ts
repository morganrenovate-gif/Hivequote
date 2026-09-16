import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  resolveAdminAccessToken,
} from '@/lib/auth/admin'

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? ''
  const loginUrl = new URL('/admin-access', req.url)
  if (!refreshToken || !env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session) {
    const res = NextResponse.redirect(loginUrl)
    res.cookies.set(ADMIN_ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    res.cookies.set(ADMIN_REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    return res
  }

  const admin = await resolveAdminAccessToken(data.session.access_token)
  if (!admin) return NextResponse.redirect(loginUrl)

  const next = req.nextUrl.searchParams.get('next')
  const safeNext = next?.startsWith('/admin') ? next : '/admin'
  const res = NextResponse.redirect(new URL(safeNext, req.url))
  const secure = process.env.NODE_ENV === 'production'
  res.cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: data.session.expires_in ?? 3600,
  })
  res.cookies.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token, {
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
