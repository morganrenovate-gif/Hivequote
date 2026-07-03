import Link from 'next/link'
import type { Trade } from '@/data/trades'

export default function TradeCard({ trade }: { trade: Trade }) {
  return (
    <Link
      href={`/${trade.slug}`}
      className="group card flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-honey-100 text-2xl">
        <span aria-hidden="true">{trade.icon}</span>
      </div>
      <h3 className="text-lg font-bold text-hive-950 group-hover:text-honey-700">
        {trade.name}
      </h3>
      <p className="text-sm leading-relaxed text-hive-600">{trade.subheadline}</p>
      <span className="mt-auto text-sm font-semibold text-honey-600">
        Get matched →
      </span>
    </Link>
  )
}
