import { mockLeads } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatDate } from '@/lib/utils/formatting'

export default function AdminLeadsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">All leads</h1>
      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Trade</th>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">SMS Consent</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockLeads.map((l) => (
              <tr key={l.id} className="hover:bg-honey-50/40">
                <td className="px-6 py-3.5 text-hive-500">{formatDate(l.created_at)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">
                  {l.first_name} {l.last_name}
                </td>
                <td className="px-6 py-3.5 text-hive-600">{getTrade(l.trade_slug)?.shortName}</td>
                <td className="px-6 py-3.5 text-hive-600">{l.project_type}</td>
                <td className="px-6 py-3.5 text-hive-600">{l.city} {l.zip_code}</td>
                <td className="px-6 py-3.5 text-hive-500">{l.source}</td>
                <td className="px-6 py-3.5">{l.sms_opt_in ? '✓' : '—'}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
