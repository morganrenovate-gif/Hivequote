import { mockPayments, mockMonitoring } from '@/lib/mock/store'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatCents, formatDate, titleCase } from '@/lib/utils/formatting'

export default function AdminPaymentsPage() {
  const disputeRate = mockMonitoring.stripeDisputeRate
  const rateOk = disputeRate < 0.005

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Payments</h1>

      <div className={`card ${rateOk ? '' : '!border-red-400 bg-red-50'}`}>
        <p className="text-sm font-medium text-hive-500">Stripe dispute rate (target &lt; 0.5%)</p>
        <p className={`mt-1 text-3xl font-extrabold ${rateOk ? 'text-green-700' : 'text-red-700'}`}>
          {(disputeRate * 100).toFixed(2)}%
        </p>
        <p className="mt-2 text-xs text-hive-500">
          Warning threshold 0.75% — new contractor onboarding pauses automatically above it.
        </p>
      </div>

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Contractor</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockPayments.map((p) => (
              <tr key={p.id} className="hover:bg-honey-50/40">
                <td className="px-6 py-3.5 text-hive-500">{formatDate(p.created_at)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">{p.contractor_name}</td>
                <td className="px-6 py-3.5 text-hive-600">{titleCase(p.payment_type)}</td>
                <td className="px-6 py-3.5 uppercase text-hive-600">{p.payment_method}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">{formatCents(p.amount_cents)}</td>
                <td className="px-6 py-3.5"><LeadStatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
