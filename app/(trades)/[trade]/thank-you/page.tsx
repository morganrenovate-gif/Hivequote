import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TRADES, getTrade } from '@/data/trades'

export function generateStaticParams() {
  return TRADES.map((t) => ({ trade: t.slug }))
}

export const dynamicParams = false

export const metadata = {
  title: 'Request Received',
  robots: { index: false },
}

export default function ThankYouPage({ params }: { params: { trade: string } }) {
  const trade = getTrade(params.trade)
  if (!trade) notFound()

  return (
    <section className="bg-hive-50 py-24">
      <div className="container-site max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-honey-500 text-3xl">
          🐝
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
          You&apos;re matched — hang tight!
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-hive-600">
          Your {trade.name.toLowerCase()} request is being routed to the best
          available vetted pro in your area. Here&apos;s what happens next:
        </p>

        <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
          {[
            'We confirm your project details by text (reply YES to speed things up).',
            'One licensed pro — not four — receives your project exclusively.',
            'They reach out directly, usually within 2 business hours.',
            'We follow up within 24 hours to make sure contact happened.',
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hive-950 text-xs font-bold text-honey-400">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-hive-700">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-dark">Back to Home</Link>
          <Link href="/blog" className="btn-ghost">Read Project Guides</Link>
        </div>
      </div>
    </section>
  )
}
