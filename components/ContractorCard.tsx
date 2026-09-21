import Link from 'next/link'
import ReviewStars from './ReviewStars'
import { getTrade } from '@/data/trades'

export interface ContractorCardData {
  slug: string
  trade_slug: string
  business_name: string
  rating: number
  review_count: number
  blurb: string
  city: string
  total_jobs_won: number
}

export default function ContractorCard({ contractor }: { contractor: ContractorCardData }) {
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
        <span className="text-xs font-medium text-hive-500">Verification pending</span>
      </div>
      <h3 className="text-lg font-bold text-hive-950 group-hover:text-honey-700">
        {contractor.business_name}
      </h3>
      <ReviewStars rating={contractor.rating} count={contractor.review_count} />
      <p className="text-sm leading-relaxed text-hive-600">{contractor.blurb}</p>
      <p className="mt-auto text-sm text-hive-500">Based in {contractor.city}</p>
    </Link>
  )
}
