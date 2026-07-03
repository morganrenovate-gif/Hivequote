import { mockContractors } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatCents, titleCase } from '@/lib/utils/formatting'

export default function AdminContractorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Contractors</h1>
      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Business</th>
              <th className="px-6 py-3">Trade</th>
              <th className="px-6 py-3">License</th>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3">Wallet</th>
              <th className="px-6 py-3">Leads (mo)</th>
              <th className="px-6 py-3">Close rate</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockContractors.map((c) => (
              <tr key={c.id} className="hover:bg-honey-50/40">
                <td className="px-6 py-3.5">
                  <span className="font-semibold text-hive-900">{c.business_name}</span>
                  <span className="block text-xs text-hive-400">{c.owner_name} · {c.city}</span>
                </td>
                <td className="px-6 py-3.5 text-hive-600">{getTrade(c.trade_slug)?.shortName}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={c.license_status} /></td>
                <td className="px-6 py-3.5 text-hive-600">{titleCase(c.billing_model)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">{formatCents(c.wallet_balance_cents)}</td>
                <td className="px-6 py-3.5 text-hive-600">{c.leads_delivered_this_month}</td>
                <td className="px-6 py-3.5 text-hive-600">{c.close_rate_pct.toFixed(0)}%</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-hive-400">
        Licenses re-verified monthly against dopl.utah.gov. Contractors with 3+
        consecutive non-responses are auto-flagged for review.
      </p>
    </div>
  )
}
