import { mockContractors, mockLeads } from '@/lib/mock/store'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatDate } from '@/lib/utils/formatting'

export default function ContractorLeadsPage() {
  const me = mockContractors[0]
  const myLeads = mockLeads.filter((l) => l.trade_slug === me.trade_slug)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Lead history</h1>
        <p className="text-sm text-hive-500">
          Every lead routed to {me.business_name}, with current status. Dispute
          window: 48 hours from delivery.
        </p>
      </div>

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Homeowner</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {myLeads.map((l) => (
              <tr key={l.id}>
                <td className="px-6 py-3.5 text-hive-500">{formatDate(l.created_at)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">
                  {l.first_name} {l.last_name}
                </td>
                <td className="px-6 py-3.5 text-hive-600">{l.project_type}</td>
                <td className="px-6 py-3.5 text-hive-600">{l.phone}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={l.status} /></td>
                <td className="px-6 py-3.5">
                  <button className="text-sm font-semibold text-honey-600 hover:text-honey-700">
                    Update status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-hive-400">
        Reply WON / LOST / PENDING to lead SMS messages to update status from
        your phone — updates sync here automatically.
      </p>
    </div>
  )
}
