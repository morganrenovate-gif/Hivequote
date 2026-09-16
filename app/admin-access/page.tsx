'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function AdminAccessPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function login(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    if (!supabase) {
      setError('Admin authentication is not configured.')
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !data.session) {
      setError(signInError?.message ?? 'Unable to establish a session.')
      setLoading(false)
      return
    }

    const response = await fetch('/api/auth/admin-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      }),
    })

    if (!response.ok) {
      await supabase.auth.signOut()
      setError('Admin access denied.')
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <section className="bg-hive-950 py-24 min-h-[70vh]">
      <div className="container-site max-w-md">
        <div className="card">
          <h1 className="text-2xl font-extrabold text-hive-950">HiveQuote Admin</h1>
          <p className="mt-1 text-sm text-hive-500">Authorized operators only.</p>
          <form className="mt-6 space-y-4" onSubmit={login}>
            <div>
              <label className="label-field" htmlFor="email">Email</label>
              <input className="input-field" id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label-field" htmlFor="password">Password</label>
              <input className="input-field" id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
