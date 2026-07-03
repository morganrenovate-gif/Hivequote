import { mockLeads, mockContractors, mockPayments, mockDisputes, mockMonitoring } from '@/lib/mock/store'
import { formatCents } from '@/lib/utils/formatting'
import LeadStatusBadge from '@/components/LeadStatusBadge'

export default function AdminOverviewPage() {
  const revenue = mockPayments
    .filter((p) => p.status === 'succeeded')
    .reduce((s, p) => s + p.amount_cents, 0)
  const won = mockLeads.filter((l) => ['won', 'won_verified'].includes(l.status)).length
  const openDisputes = mockDisputes.filter((d) => d.status === 'open').length

  const stats = [
    { label: 'Leads (7 days)', value: mockLeads.length },
    { label: 'Active contractors', value: mockContractors.filter((c) => c.status === 'active').length },
    { label: 'Jobs won', value: won },
    { label: 'Revenue collected', value: formatCents(revenue) },
    { label: 'Open disputes', value: openDisputes },
    { label: 'Stripe dispute rate', value: `${(mockMonitoring.stripeDisputeRate * 100).toFixed(2)}%` },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Daily audit</h1>
        <p className="text-sm text-hive-500">
          The founder&apos;s 2-minute check. A version of this view is emailed daily at 7 AM MT.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm font-medium text-hive-500">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-hive-950">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card !border-honey-300 bg-honey-50">
        <h2 className="font-bold text-hive-950">System gates</h2>
        <ul className="mt-3 space-y-2 text-sm text-hive-700">
          <li className="flex items-center gap-2">
            <LeadStatusBadge status={mockMonitoring.a2pStatus} />
            A2P 10DLC registration — SMS stays OFF until approved
          </li>
          <li className="flex items-center gap-2">
            <LeadStatusBadge status={mockMonitoring.smsActive ? 'active' : 'paused'} />
            SMS sending ({mockMonitoring.smsActive ? 'active' : 'gated — email-only outreach'})
          </li>
        </ul>
      </div>

      <div className="card !p-0 overflow-hidden">
        <h2 className="px-6 py-4 font-bold text-hive-950">Unrouted / attention queue</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-y border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Trade</th>
              <th className="px-6 py-3">ZIP</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockLeads
              .filter((l) => ['new', 'routing', 'qualifying'].includes(l.status))
              .map((l) => (
                <tr key={l.id}>
                  <td className="px-6 py-3.5 font-semibold text-hive-900">
                    {l.first_name} {l.last_name}
                  </td>
                  <td className="px-6 py-3.5 text-hive-600">{l.trade_slug}</td>
                  <td className="px-6 py-3.5 text-hive-600">{l.zip_code}</td>
                  <td className="px-6 py-3.5"><LeadStatusBadge status={l.status} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
