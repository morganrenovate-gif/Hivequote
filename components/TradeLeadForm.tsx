'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Trade } from '@/data/trades'
import { CONSENT_LANGUAGE_TEXT, isValidUsPhone } from '@/lib/utils/tcpa'

interface Props {
  trade: Trade
  compact?: boolean
}

const TIMELINES = ['ASAP', 'Within 30 days', '1–3 months', 'Planning stage']
const PROPERTY_TYPES = [
  { value: 'residential', label: 'My home' },
  { value: 'commercial', label: 'Commercial property' },
  { value: 'hoa', label: 'HOA / community' },
  { value: 'property_management', label: 'Property I manage' },
]

export default function TradeLeadForm({ trade }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    project_type: '',
    property_type: 'residential',
    timeline: '',
    zip_code: '',
    city: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    sms_opt_in: true,
    consent_confirmed: false,
  })

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const stepValid = () => {
    if (step === 0) return form.project_type !== ''
    if (step === 1)
      return form.timeline !== '' && /^\d{5}$/.test(form.zip_code)
    return (
      form.first_name.trim() !== '' &&
      isValidUsPhone(form.phone) &&
      /.+@.+\..+/.test(form.email) &&
      form.consent_confirmed
    )
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          trade_slug: trade.slug,
          utm_source: new URLSearchParams(window.location.search).get('utm_source') ?? undefined,
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium') ?? undefined,
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      router.push(`/${trade.slug}/thank-you`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div id="get-matched" className="card !p-0 overflow-hidden shadow-lift">
      <div className="bg-hive-950 px-6 py-4">
        <p className="text-sm font-semibold text-honey-400">
          Free · Exclusive match · No spam calls
        </p>
        <h3 className="text-lg font-bold text-white">
          Get matched with one vetted {trade.shortName.toLowerCase()} pro
        </h3>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 px-6 pt-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-honey-500' : 'bg-hive-200'}`}
          />
        ))}
      </div>

      <div className="p-6">
        {step === 0 && (
          <fieldset>
            <legend className="label-field !text-base !font-semibold !text-hive-900">
              What does your project involve?
            </legend>
            <div className="mt-3 grid gap-2">
              {trade.projectTypes.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => {
                    set('project_type', pt)
                    setStep(1)
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    form.project_type === pt
                      ? 'border-honey-500 bg-honey-50 text-hive-950'
                      : 'border-hive-200 text-hive-700 hover:border-honey-400'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label-field">When do you want to start?</label>
              <div className="grid grid-cols-2 gap-2">
                {TIMELINES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('timeline', t)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      form.timeline === t
                        ? 'border-honey-500 bg-honey-50 text-hive-950'
                        : 'border-hive-200 text-hive-700 hover:border-honey-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="property_type" className="label-field">This project is for</label>
              <select
                id="property_type"
                className="input-field"
                value={form.property_type}
                onChange={(e) => set('property_type', e.target.value)}
              >
                {PROPERTY_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="zip" className="label-field">ZIP code</label>
                <input
                  id="zip"
                  className="input-field"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="84020"
                  value={form.zip_code}
                  onChange={(e) => set('zip_code', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label htmlFor="city" className="label-field">City</label>
                <input
                  id="city"
                  className="input-field"
                  placeholder="Draper"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-ghost flex-1" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary flex-1 disabled:opacity-40"
                disabled={!stepValid()}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="label-field">First name</label>
                <input
                  id="first_name"
                  className="input-field"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="label-field">Last name</label>
                <input
                  id="last_name"
                  className="input-field"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="label-field">Phone</label>
              <input
                id="phone"
                className="input-field"
                type="tel"
                autoComplete="tel"
                placeholder="(801) 555-0123"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="label-field">Email</label>
              <input
                id="email"
                className="input-field"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-hive-200 bg-hive-50 p-4">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-honey-500"
                checked={form.consent_confirmed}
                onChange={(e) => {
                  set('consent_confirmed', e.target.checked)
                  set('sms_opt_in', e.target.checked)
                }}
              />
              <span className="text-xs leading-relaxed text-hive-600">
                {CONSENT_LANGUAGE_TEXT}
              </span>
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <div className="flex gap-3">
              <button type="button" className="btn-ghost flex-1" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary flex-1 disabled:opacity-40"
                disabled={!stepValid() || submitting}
                onClick={submit}
              >
                {submitting ? 'Matching…' : 'Get My Match'}
              </button>
            </div>
            <p className="text-center text-xs text-hive-400">
              100% free for homeowners. One pro. Zero spam.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
