'use client'

import { useState } from 'react'
import { TRADES } from '@/data/trades'
import { isValidUsPhone } from '@/lib/utils/tcpa'

const CAPACITY_OPTIONS = [
  { value: '1-2', label: 'I can take 1–2 new jobs in the next 30 days' },
  { value: '3+', label: 'I can take 3+ new jobs in the next 30 days' },
  { value: 'full', label: 'I am fully booked right now' },
]

export default function ContractorOnboardingForm() {
  const [submitted, setSubmitted] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    email: '',
    license_number: '',
    trades: [] as string[],
    zips: '',
    capacity: '',
    agree: false,
  })

  const set = (k: string, v: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const toggleTrade = (slug: string) =>
    set(
      'trades',
      form.trades.includes(slug)
        ? form.trades.filter((t) => t !== slug)
        : [...form.trades, slug]
    )

  const valid =
    form.business_name.trim() !== '' &&
    form.owner_name.trim() !== '' &&
    isValidUsPhone(form.phone) &&
    /.+@.+\..+/.test(form.email) &&
    form.trades.length > 0 &&
    form.zips.trim() !== '' &&
    form.capacity !== '' &&
    form.agree

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contractors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setWaitlisted(Boolean(data.waitlisted))
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-honey-500 text-2xl">
          🐝
        </div>
        {waitlisted ? (
          <>
            <h3 className="text-xl font-bold text-hive-950">You&apos;re on the capacity waitlist</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-hive-600">
              Since you&apos;re fully booked, we won&apos;t route leads you can&apos;t
              take — that protects your reputation and ours. We&apos;ll reach
              out as soon as you have capacity. Reply to our confirmation email
              anytime to activate.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-hive-950">Application received!</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-hive-600">
              We&apos;ll verify your DOPL license and insurance and get back to
              you within 1–2 business days with your agreement and setup link.
              Watch your email and phone.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="business_name" className="label-field">Business name</label>
            <input id="business_name" className="input-field" value={form.business_name}
              onChange={(e) => set('business_name', e.target.value)} />
          </div>
          <div>
            <label htmlFor="owner_name" className="label-field">Owner name</label>
            <input id="owner_name" className="input-field" value={form.owner_name}
              onChange={(e) => set('owner_name', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c_phone" className="label-field">Phone</label>
            <input id="c_phone" type="tel" className="input-field" placeholder="(801) 555-0123"
              value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label htmlFor="c_email" className="label-field">Email</label>
            <input id="c_email" type="email" className="input-field" value={form.email}
              onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        <div>
          <label htmlFor="license" className="label-field">
            Utah DOPL license number{' '}
            <span className="font-normal text-hive-400">(required for licensed trades)</span>
          </label>
          <input id="license" className="input-field" placeholder="e.g. 11542876-5501"
            value={form.license_number} onChange={(e) => set('license_number', e.target.value)} />
        </div>

        <div>
          <span className="label-field">Trades you want leads for</span>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {TRADES.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggleTrade(t.slug)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                  form.trades.includes(t.slug)
                    ? 'border-honey-500 bg-honey-50 text-hive-950'
                    : 'border-hive-200 text-hive-700 hover:border-honey-400'
                }`}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="zips" className="label-field">
            Service area ZIP codes <span className="font-normal text-hive-400">(comma-separated)</span>
          </label>
          <input id="zips" className="input-field" placeholder="84020, 84092, 84093"
            value={form.zips} onChange={(e) => set('zips', e.target.value)} />
        </div>

        <div>
          <span className="label-field">Current capacity</span>
          <div className="mt-1 grid gap-2">
            {CAPACITY_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('capacity', c.value)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  form.capacity === c.value
                    ? 'border-honey-500 bg-honey-50 text-hive-950'
                    : 'border-hive-200 text-hive-700 hover:border-honey-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-hive-200 bg-hive-50 p-4">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-honey-500"
            checked={form.agree} onChange={(e) => set('agree', e.target.checked)} />
          <span className="text-xs leading-relaxed text-hive-600">
            I understand HiveQuote will verify my license with Utah DOPL and
            request a current insurance certificate before activation. I agree
            to be contacted about my application by phone, text, and email. The
            $97 setup fee is collected only after my agreement is signed, and is
            credited back after my first $500 in lead purchases.
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="button"
          className="btn-primary w-full disabled:opacity-40"
          disabled={!valid || submitting}
          onClick={submit}
        >
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
