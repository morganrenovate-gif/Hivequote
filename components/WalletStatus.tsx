import { formatCents } from '@/lib/utils/formatting'

export default function WalletStatus({
  balanceCents,
  thresholdCents,
  pplPriceCents,
}: {
  balanceCents: number
  thresholdCents: number
  pplPriceCents: number
}) {
  const low = balanceCents < thresholdCents
  const leadsRemaining = Math.floor(balanceCents / pplPriceCents)

  return (
    <div className={`card ${low ? '!border-honey-500 bg-honey-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-hive-500">Lead wallet balance</p>
          <p className="mt-1 text-3xl font-extrabold text-hive-950">
            {formatCents(balanceCents)}
          </p>
          <p className="mt-1 text-sm text-hive-600">
            ≈ {leadsRemaining} lead{leadsRemaining === 1 ? '' : 's'} remaining at your trade rate
          </p>
        </div>
        <button className="btn-primary !px-5 !py-2.5 !text-sm">Top Up via ACH</button>
      </div>
      {low && (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-honey-800">
          ⚠ Balance is below your {formatCents(thresholdCents)} threshold. Leads
          hold for up to 4 hours pending top-up, then route to backup pros.
        </p>
      )}
    </div>
  )
}
