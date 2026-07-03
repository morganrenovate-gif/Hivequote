'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ContractorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    if (!supabase) {
      // Mock mode: any credentials open the demo dashboard
      router.push('/contractor/dashboard')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/contractor/dashboard')
  }

  return (
    <section className="bg-hive-50 py-20">
      <div className="container-site max-w-md">
        <div className="card">
          <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">
            Contractor login
          </h1>
          <p className="mt-1 text-sm text-hive-500">
            Access your leads, wallet, and performance stats.
          </p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label-field">Email</label>
              <input id="email" type="email" className="input-field" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <input id="password" type="password" className="input-field" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-hive-500">
            Not in the network yet?{' '}
            <Link href="/contractor/apply" className="font-semibold text-honey-600 hover:text-honey-700">
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
