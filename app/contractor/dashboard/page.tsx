import { mockContractors, mockLeads } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import WalletStatus from '@/components/WalletStatus'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatRelative } from '@/lib/utils/formatting'

export default function ContractorDashboardPage() {
  const me = mockContractors[0] // demo contractor
  const trade = getTrade(me.trade_slug)!
  const myLeads = mockLeads.filter((l) => l.trade_slug === me.trade_slug)

  const stats = [
    { label: 'Leads this month', value: me.leads_delivered_this_month },
    { label: 'Total leads received', value: me.total_leads_delivered },
    { label: 'Jobs won', value: me.total_jobs_won },
    { label: 'Close rate', value: `${me.close_rate_pct.toFixed(0)}%` },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">
          Welcome back, {me.owner_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-hive-500">
          {me.business_name} · {trade.name} · {me.billing_model.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm font-medium text-hive-500">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-hive-950">{s.value}</p>
          </div>
        ))}
      </div>

      <WalletStatus
        balanceCents={me.wallet_balance_cents}
        thresholdCents={20000}
        pplPriceCents={trade.pplPriceCents}
      />

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-bold text-hive-950">Recent leads</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-y border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Homeowner</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {myLeads.map((l) => (
              <tr key={l.id}>
                <td className="px-6 py-3.5 font-semibold text-hive-900">
                  {l.first_name} {l.last_name[0]}.
                </td>
                <td className="px-6 py-3.5 text-hive-600">{l.project_type}</td>
                <td className="px-6 py-3.5 text-hive-600">{l.city} {l.zip_code}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={l.status} /></td>
                <td className="px-6 py-3.5 text-hive-500">{formatRelative(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
