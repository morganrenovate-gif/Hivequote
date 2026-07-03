import Link from 'next/link'
import Honeycomb from '@/components/Honeycomb'
import { TRADES } from '@/data/trades'
import { formatCents } from '@/lib/utils/formatting'

export const metadata = {
  title: 'Exclusive Utah Leads for Contractors — No Shared Leads, Ever',
  description:
    'HiveQuote delivers exclusive, qualified homeowner leads to one Utah contractor at a time. Transparent per-lead pricing, retainer plans, and zip-code exclusivity.',
}

const RETAINERS = [
  { name: 'Starter', price: '$299/mo', leads: '4 leads/mo', note: 'Anchor tier — try the hive', featured: false },
  { name: 'Growth', price: '$599/mo', leads: '10 leads/mo', note: 'Save ~15% vs. pay-per-lead', featured: true },
  { name: 'Dominance', price: '$1,199/mo', leads: '25 leads/mo', note: 'Save ~25% vs. pay-per-lead', featured: false },
  { name: 'Exclusive Zone', price: '$1,999/mo', leads: '40 leads/mo + zip exclusivity', note: 'First right of refusal in your zips', featured: false },
]

export default function ForContractorsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hive-950">
        <Honeycomb className="text-hive-800/60" />
        <div className="container-site relative py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">For Utah Contractors</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Stop racing three competitors
              <br />
              to the same <span className="text-honey-400">shared lead.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-hive-300">
              Every HiveQuote lead goes to exactly one contractor: you. Leads
              are SMS-qualified for 30-day intent before you ever see them, and
              duplicates are never charged. No annual contract. No lead-credit
              games.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contractor/apply" className="btn-primary">
                Apply to Join — $97 Setup
              </Link>
              <Link href="#pricing" className="btn-ghost !border-hive-700 !bg-transparent !text-white hover:!border-honey-500">
                See Pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-hive-500">
              The $97 setup fee is credited back in lead credits after your first $500 in leads.
            </p>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-20">
        <div className="container-site grid gap-8 md:grid-cols-3">
          {[
            {
              title: '100% exclusive leads',
              body: 'One lead, one contractor. When a homeowner request hits your phone, nobody else in Utah has it. Your close rate reflects your work — not your speed-dial reflexes.',
            },
            {
              title: 'Qualified before delivery',
              body: 'Every lead is confirmed by SMS for 30-day start intent before routing. Tire-kickers go to a nurture track — you only pay for homeowners who are ready.',
            },
            {
              title: 'Fair by design',
              body: 'Duplicate submissions are auto-detected and never charged. Bad lead? Dispute within 48 hours and get a credit or replacement within 72. It’s in the contract.',
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-honey-500 font-extrabold text-hive-950">⬡</div>
              <h2 className="mb-2 text-lg font-bold text-hive-950">{f.title}</h2>
              <p className="text-sm leading-relaxed text-hive-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PPL PRICING */}
      <section id="pricing" className="bg-hive-50 py-20">
        <div className="container-site">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Pay-Per-Lead Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
              Transparent pricing by trade
            </h2>
            <p className="mt-3 text-lg text-hive-600">
              Pre-fund a lead wallet; you&apos;re only debited when a qualified,
              exclusive lead is routed to you. Lead prices are 2–4% of average
              job value.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-hive-200 bg-white shadow-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
                <tr>
                  <th className="px-6 py-4">Trade</th>
                  <th className="px-6 py-4">Typical Job Value</th>
                  <th className="px-6 py-4">Price Per Exclusive Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hive-100">
                {TRADES.map((t) => (
                  <tr key={t.slug} className="hover:bg-honey-50/50">
                    <td className="px-6 py-3.5 font-semibold text-hive-900">
                      {t.icon} {t.name}
                    </td>
                    <td className="px-6 py-3.5 text-hive-600">
                      ${t.avgJobValueLow.toLocaleString()}–${t.avgJobValueHigh.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-honey-700">
                      {formatCents(t.pplPriceCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RETAINERS */}
      <section className="py-20">
        <div className="container-site">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Retainer Plans</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
              Guaranteed volume, better rates
            </h2>
            <p className="mt-3 text-lg text-hive-600">
              Lock in a guaranteed monthly lead minimum. Shortfalls roll over
              automatically — it&apos;s in writing.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {RETAINERS.map((r) => (
              <div
                key={r.name}
                className={`card flex flex-col ${r.featured ? '!border-honey-500 ring-2 ring-honey-200' : ''}`}
              >
                {r.featured && (
                  <span className="mb-3 w-fit rounded-full bg-honey-500 px-3 py-1 text-xs font-bold text-hive-950">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-hive-950">{r.name}</h3>
                <p className="mt-2 text-3xl font-extrabold text-hive-950">{r.price}</p>
                <p className="mt-1 text-sm font-semibold text-honey-700">{r.leads}</p>
                <p className="mt-3 text-sm text-hive-600">{r.note}</p>
                <Link href="/contractor/apply" className={`mt-6 ${r.featured ? 'btn-primary' : 'btn-ghost'} w-full !text-sm`}>
                  Apply
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-sm text-hive-500">
            Seasonal trades note: November–March guaranteed volumes adjust to 50%
            of stated minimums to reflect Utah demand patterns — spelled out in
            your agreement, never a surprise.
          </p>
        </div>
      </section>

      {/* HOW JOINING WORKS */}
      <section className="bg-hive-950 py-20 text-white">
        <div className="container-site">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">Joining the Hive</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              From application to first lead
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { n: '1', t: 'Apply (5 min)', b: 'Business info, trades, service zips, license number, insurance cert.' },
              { n: '2', t: 'We verify', b: 'DOPL license check, insurance review, capacity confirmation. Usually 1–2 business days.' },
              { n: '3', t: 'Fund your wallet', b: 'Pre-fund via ACH. You control the balance; leads debit automatically as delivered.' },
              { n: '4', t: 'Leads flow', b: 'Qualified, exclusive leads hit your phone by SMS + email the moment they route.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-honey-500 text-lg font-extrabold text-hive-950">
                  {s.n}
                </div>
                <h3 className="mb-1 font-bold">{s.t}</h3>
                <p className="text-sm leading-relaxed text-hive-400">{s.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/contractor/apply" className="btn-primary">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
