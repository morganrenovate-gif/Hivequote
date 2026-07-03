import { mockContractors } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import { formatDate } from '@/lib/utils/formatting'

export default function ContractorProfilePage() {
  const me = mockContractors[0]
  const trade = getTrade(me.trade_slug)!

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Profile &amp; service area</h1>
        <p className="text-sm text-hive-500">
          What homeowners see on your public directory profile, plus your routing settings.
        </p>
      </div>

      <div className="card space-y-5">
        <Row label="Business name" value={me.business_name} />
        <Row label="Owner" value={me.owner_name} />
        <Row label="Trade" value={trade.name} />
        <Row label="Phone" value={me.phone} />
        <Row label="Email" value={me.email} />
        <Row
          label="DOPL license"
          value={`${me.license_number} · verified ${formatDate(me.created_at)} · re-checked monthly`}
        />
      </div>

      <div className="card">
        <h2 className="font-bold text-hive-950">Service ZIP codes</h2>
        <p className="mt-1 text-sm text-hive-500">Leads route only within these ZIPs.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {me.zips.map((z) => (
            <span key={z} className="rounded-full border border-hive-200 bg-hive-50 px-3 py-1 text-sm text-hive-700">
              {z}
            </span>
          ))}
          <button className="rounded-full border border-dashed border-honey-500 px-3 py-1 text-sm font-semibold text-honey-600 hover:bg-honey-50">
            + Add ZIP
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-hive-950">Capacity</h2>
        <p className="mt-1 text-sm text-hive-500">
          Tell us when you&apos;re slammed — we&apos;ll pause routing instead of
          burning leads (and your response stats).
        </p>
        <div className="mt-4 flex gap-2">
          {['Available', 'Limited', 'Fully booked'].map((c, i) => (
            <button
              key={c}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                i === 0
                  ? 'border-honey-500 bg-honey-50 text-hive-950'
                  : 'border-hive-200 text-hive-600 hover:border-honey-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-hive-500">{label}</span>
      <span className="text-sm font-semibold text-hive-900">{value}</span>
    </div>
  )
}
