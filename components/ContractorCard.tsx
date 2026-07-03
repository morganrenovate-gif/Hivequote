import Link from 'next/link'
import ReviewStars from './ReviewStars'
import { getTrade } from '@/data/trades'
import type { MockContractor } from '@/lib/mock/store'

export default function ContractorCard({ contractor }: { contractor: MockContractor }) {
  const trade = getTrade(contractor.trade_slug)
  return (
    <Link
      href={`/directory/${contractor.slug}`}
      className="group card flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-honey-100 px-3 py-1 text-xs font-semibold text-honey-800">
          {trade?.shortName ?? contractor.trade_slug}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1l3 2 3.6.5.5 3.6 2 3-2 3-.5 3.6-3.6.5-3 2-3-2-3.6-.5L2.9 13l-2-3 2-3 .5-3.6L7 3l3-2z" />
            <path d="M6.5 10.2l2.3 2.3 4.7-4.9" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
          License verified
        </span>
      </div>
      <h3 className="text-lg font-bold text-hive-950 group-hover:text-honey-700">
        {contractor.business_name}
      </h3>
      <ReviewStars rating={contractor.rating} count={contractor.review_count} />
      <p className="text-sm leading-relaxed text-hive-600">{contractor.blurb}</p>
      <p className="mt-auto text-sm text-hive-500">
        Based in {contractor.city} · {contractor.total_jobs_won}+ HiveQuote jobs completed
      </p>
    </Link>
  )
}
