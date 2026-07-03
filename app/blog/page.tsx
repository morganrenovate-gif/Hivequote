import Link from 'next/link'
import { POSTS } from '@/data/posts'
import { getTrade } from '@/data/trades'
import { formatDate } from '@/lib/utils/formatting'

export const metadata = {
  title: 'Utah Home Project Guides — Costs, Timing & Hiring Tips',
  description:
    'Real Utah pricing guides for home projects: epoxy floors, EV chargers, pickleball courts, and more. Written for Utah homeowners.',
}

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-hive-950 py-16 text-white">
        <div className="container-site max-w-3xl">
          <p className="eyebrow mb-4">Guides</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Utah project guides
          </h1>
          <p className="mt-4 text-lg text-hive-300">
            What things actually cost here — not national averages.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-site grid gap-6 md:grid-cols-3">
          {POSTS.map((p) => {
            const trade = getTrade(p.tradeSlug)
            return (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group card flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="w-fit rounded-full bg-honey-100 px-3 py-1 text-xs font-semibold text-honey-800">
                  {trade?.shortName}
                </span>
                <h2 className="text-lg font-bold leading-snug text-hive-950 group-hover:text-honey-700">
                  {p.title}
                </h2>
                <p className="text-sm leading-relaxed text-hive-600">{p.description}</p>
                <p className="mt-auto text-xs text-hive-400">
                  {formatDate(p.date)} · {p.readMinutes} min read
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
