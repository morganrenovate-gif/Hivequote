import { mockDisputes } from '@/lib/mock/store'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatDate, titleCase } from '@/lib/utils/formatting'

export default function AdminDisputesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Disputes</h1>
        <p className="text-sm text-hive-500">
          48-hour filing window · 72-hour resolution SLA · binary outcome: credit or documented denial.
        </p>
      </div>

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Filed</th>
              <th className="px-6 py-3">Contractor</th>
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Satisfaction</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockDisputes.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-3.5 text-hive-500">{formatDate(d.created_at)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">{d.contractor_name}</td>
                <td className="px-6 py-3.5 text-hive-600">{d.lead_name}</td>
                <td className="px-6 py-3.5 text-hive-600">{titleCase(d.dispute_type)}</td>
                <td className="px-6 py-3.5 text-hive-600">{d.score ?? '—'}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={d.status} /></td>
                <td className="px-6 py-3.5">
                  {d.status === 'open' && (
                    <button className="text-sm font-semibold text-honey-600 hover:text-honey-700">
                      Review evidence
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-hive-400">
        Resolution options: lead credit, replacement lead, or partial credit —
        never cash refunds on delivered leads. 3+ disputes in 90 days flags the
        contractor relationship for review.
      </p>
    </div>
  )
}
