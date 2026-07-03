import Link from 'next/link'
import { notFound } from 'next/navigation'
import { mockContractors } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import ReviewStars from '@/components/ReviewStars'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return mockContractors.map((c) => ({ slug: c.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: Props) {
  const c = mockContractors.find((x) => x.slug === params.slug)
  if (!c) return {}
  return {
    title: `${c.business_name} — Vetted ${getTrade(c.trade_slug)?.shortName} Pro in ${c.city}, Utah`,
    description: c.blurb,
  }
}

export default function ContractorProfilePage({ params }: Props) {
  const c = mockContractors.find((x) => x.slug === params.slug)
  if (!c) notFound()
  const trade = getTrade(c.trade_slug)

  return (
    <>
      <section className="bg-hive-950 py-16 text-white">
        <div className="container-site">
          <p className="eyebrow mb-3">{trade?.subBrand}</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {c.business_name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-hive-300">
            <ReviewStars rating={c.rating} count={c.review_count} />
            <span>·</span>
            <span>Based in {c.city}</span>
            <span>·</span>
            <span className="text-green-400">✓ DOPL license verified</span>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-site grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-hive-950">About</h2>
            <p className="mt-3 leading-relaxed text-hive-600">{c.blurb}</p>

            <h2 className="mt-10 text-xl font-bold text-hive-950">Verification</h2>
            <ul className="mt-4 space-y-3 text-sm text-hive-700">
              <li className="flex items-center gap-3">
                <Check /> Utah DOPL license on file (re-verified monthly)
              </li>
              <li className="flex items-center gap-3">
                <Check /> General liability insurance certificate current
              </li>
              <li className="flex items-center gap-3">
                <Check /> {c.total_jobs_won}+ completed HiveQuote projects
              </li>
              <li className="flex items-center gap-3">
                <Check /> Homeowner satisfaction monitored on every job
              </li>
            </ul>

            <h2 className="mt-10 text-xl font-bold text-hive-950">Service area</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.zips.map((z) => (
                <span key={z} className="rounded-full border border-hive-200 bg-hive-50 px-3 py-1 text-sm text-hive-700">
                  {z}
                </span>
              ))}
            </div>
          </div>

          <aside>
            <div className="card sticky top-24 text-center">
              <p className="text-sm text-hive-600">
                Want {c.business_name} — or the best available pro — on your project?
              </p>
              {trade && (
                <Link href={`/${trade.slug}`} className="btn-primary mt-4 w-full">
                  Request a Free Match
                </Link>
              )}
              <p className="mt-3 text-xs text-hive-400">
                Matching is based on availability, area, and fit. Free for homeowners.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill="#F59F0B" />
      <path d="M6 10.2l2.6 2.6L14 7.4" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
