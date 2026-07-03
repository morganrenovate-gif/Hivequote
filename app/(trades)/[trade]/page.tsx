import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TRADES, getTrade } from '@/data/trades'
import TradeLeadForm from '@/components/TradeLeadForm'
import Honeycomb from '@/components/Honeycomb'

interface Props {
  params: { trade: string }
}

export function generateStaticParams() {
  return TRADES.map((t) => ({ trade: t.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: Props): Metadata {
  const trade = getTrade(params.trade)
  if (!trade) return {}
  return {
    title: `${trade.headline} — Free Quotes`,
    description: trade.subheadline,
    alternates: { canonical: `/${trade.slug}` },
    openGraph: { title: trade.headline, description: trade.subheadline },
  }
}

export default function TradePage({ params }: Props) {
  const trade = getTrade(params.trade)
  if (!trade) notFound()

  const related = TRADES.filter((t) => t.slug !== trade.slug).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: trade.subBrand,
    parentOrganization: { '@type': 'Organization', name: 'HiveQuote' },
    areaServed: { '@type': 'State', name: 'Utah' },
    description: trade.description,
    url: `https://hivequote.com/${trade.slug}`,
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trade.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* HERO + FORM */}
      <section className="relative overflow-hidden bg-hive-950">
        <Honeycomb className="text-hive-800/60" />
        <div className="container-site relative grid items-start gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow mb-4">{trade.subBrand}</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {trade.headline}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-hive-300">
              {trade.subheadline}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-hive-300">
              <li className="flex items-center gap-3">
                <Dot /> Typical Utah project: ${trade.avgJobValueLow.toLocaleString()}–$
                {trade.avgJobValueHigh.toLocaleString()}
              </li>
              <li className="flex items-center gap-3">
                <Dot /> DOPL-verified licensing &amp; insurance on file
              </li>
              <li className="flex items-center gap-3">
                <Dot /> Exclusive match — your info is never sold to a list
              </li>
              <li className="flex items-center gap-3">
                <Dot /> Most homeowners hear back within 2 business hours
              </li>
            </ul>
          </div>
          <div className="lg:pl-6">
            <TradeLeadForm trade={trade} />
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="py-16">
        <div className="container-site grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-hive-950 sm:text-3xl">
              {trade.name} in Utah, without the lead-site circus
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-hive-600">
              {trade.description}
            </p>

            <h3 className="mt-10 text-lg font-bold text-hive-950">
              Common projects we match
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {trade.projectTypes.map((pt) => (
                <span
                  key={pt}
                  className="rounded-full border border-hive-200 bg-hive-50 px-4 py-1.5 text-sm font-medium text-hive-700"
                >
                  {pt}
                </span>
              ))}
            </div>

            <h3 className="mt-12 text-lg font-bold text-hive-950">
              Frequently asked questions
            </h3>
            <div className="mt-4 space-y-4">
              {trade.faqs.map((f) => (
                <details key={f.q} className="card !p-0">
                  <summary className="cursor-pointer px-6 py-4 font-semibold text-hive-900">
                    {f.q}
                  </summary>
                  <p className="border-t border-hive-100 px-6 py-4 text-sm leading-relaxed text-hive-600">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <aside>
            <div className="card sticky top-24">
              <h3 className="text-base font-bold text-hive-950">Related services</h3>
              <ul className="mt-4 space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/${r.slug}`}
                      className="flex items-center gap-3 text-sm font-medium text-hive-700 transition hover:text-honey-700"
                    >
                      <span>{r.icon}</span> {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-hive-100 pt-5">
                <p className="text-xs text-hive-500">
                  Are you a Utah {trade.shortName.toLowerCase()} contractor?
                </p>
                <Link
                  href="/for-contractors"
                  className="mt-1 inline-block text-sm font-semibold text-honey-600 hover:text-honey-700"
                >
                  Get exclusive leads →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

function Dot() {
  return <span className="h-2 w-2 shrink-0 rounded-full bg-honey-500" aria-hidden="true" />
}
