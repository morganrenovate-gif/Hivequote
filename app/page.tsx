import Link from 'next/link'
import { TRADES, UTAH_CITIES } from '@/data/trades'
import TradeCard from '@/components/TradeCard'
import Honeycomb from '@/components/Honeycomb'

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hive-950">
        <Honeycomb className="text-hive-800/60" />
        <div className="container-site relative py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Utah&apos;s Home Services Lead Exchange</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              One project.
              <br />
              One vetted Utah pro.
              <br />
              <span className="text-honey-400">Zero spam calls.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-hive-300">
              The big lead sites sell your phone number to four contractors at
              once. HiveQuote matches your project with exactly one licensed,
              insured Utah pro — verified against the state license database
              and backed by real reviews.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#services" className="btn-primary">
                Get Matched Free
              </Link>
              <Link href="/how-it-works" className="btn-ghost !border-hive-700 !bg-transparent !text-white hover:!border-honey-500">
                How It Works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-hive-400">
              <span className="flex items-center gap-2">
                <CheckIcon /> DOPL license verified
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Insurance on file
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Exclusive — never a shared lead
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon /> Free for homeowners
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section id="services" className="bg-hive-50 py-20">
        <div className="container-site">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">Services</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
              What are you working on?
            </h2>
            <p className="mt-3 text-lg text-hive-600">
              Pick your project and we&apos;ll match you with one vetted Utah
              specialist — usually within 2 business hours.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRADES.map((t) => (
              <TradeCard key={t.slug} trade={t} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY HIVEQUOTE */}
      <section className="py-20">
        <div className="container-site">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">Why HiveQuote</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
              Built to be everything the big lead sites aren&apos;t
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Exclusive matching',
                body: 'National platforms sell your request to 4+ contractors who race to call you first. We match one pro per project. You have one conversation, not a phone that rings for a week.',
              },
              {
                title: 'Verified, not just listed',
                body: 'Every contractor is verified against Utah DOPL licensing before joining — and re-verified every month. Insurance certificates are collected and kept current. Listings anyone can buy; verification has to be earned.',
              },
              {
                title: 'Local and accountable',
                body: 'HiveQuote is built in Utah, for Utah. If a match goes wrong, we follow up within 24 hours and rematch you with a backup pro — automatically, at no cost.',
              },
            ].map((f) => (
              <div key={f.title} className="card">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-honey-500 font-extrabold text-hive-950">
                  ⬡
                </div>
                <h3 className="mb-2 text-lg font-bold text-hive-950">{f.title}</h3>
                <p className="text-sm leading-relaxed text-hive-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS STRIP */}
      <section className="bg-hive-950 py-20 text-white">
        <div className="container-site">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Simple by design</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              From request to quote in three steps
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                title: 'Tell us about your project',
                body: '60-second form. Project type, timeline, ZIP code. That’s it.',
              },
              {
                n: '2',
                title: 'We match one vetted pro',
                body: 'Our routing engine picks the best licensed pro for your trade, area, and timeline — exclusively.',
              },
              {
                n: '3',
                title: 'They reach out — fast',
                body: 'Most homeowners hear from their pro within 2 business hours. We follow up to make sure it happened.',
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-honey-500 text-xl font-extrabold text-hive-950">
                  {s.n}
                </div>
                <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-hive-400">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="#services" className="btn-primary">
              Start Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section className="py-20">
        <div className="container-site">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">Service Area</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
              Serving the Wasatch Front and beyond
            </h2>
            <p className="mt-3 text-lg text-hive-600">
              From Ogden to Provo — and growing into St. George.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {UTAH_CITIES.map((c) => (
              <span
                key={c}
                className="rounded-full border border-hive-200 bg-hive-50 px-4 py-1.5 text-sm font-medium text-hive-700"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CONTRACTOR CTA */}
      <section className="border-t border-hive-200 bg-honey-50 py-16">
        <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-hive-950 sm:text-3xl">
              Utah contractor? Stop buying shared leads.
            </h2>
            <p className="mt-2 max-w-xl text-hive-700">
              Exclusive leads, transparent pricing, and no long-term contracts.
              Pay only for leads routed to you — never split with competitors.
            </p>
          </div>
          <Link href="/for-contractors" className="btn-dark shrink-0">
            Join the Network
          </Link>
        </div>
      </section>
    </>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#F59F0B" />
      <path d="M6 10.2l2.6 2.6L14 7.4" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
