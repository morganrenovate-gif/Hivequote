import { mockContractors, mockPayments } from '@/lib/mock/store'
import { getTrade } from '@/data/trades'
import WalletStatus from '@/components/WalletStatus'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatCents, formatDate, titleCase } from '@/lib/utils/formatting'

export default function ContractorBillingPage() {
  const me = mockContractors[0]
  const trade = getTrade(me.trade_slug)!
  const myPayments = mockPayments.filter((p) => p.contractor_name === me.business_name)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Billing &amp; wallet</h1>
        <p className="text-sm text-hive-500">
          Pre-funded ACH wallet. Leads debit automatically on delivery — no invoices, no surprises.
        </p>
      </div>

      <WalletStatus
        balanceCents={me.wallet_balance_cents}
        thresholdCents={20000}
        pplPriceCents={trade.pplPriceCents}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-hive-500">Current plan</p>
          <p className="mt-1 text-xl font-extrabold text-hive-950">
            {titleCase(me.billing_model)}
          </p>
          <button className="mt-3 text-sm font-semibold text-honey-600 hover:text-honey-700">
            Change plan →
          </button>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-hive-500">Lead price ({trade.shortName})</p>
          <p className="mt-1 text-xl font-extrabold text-hive-950">
            {formatCents(trade.pplPriceCents)}
          </p>
          <p className="mt-3 text-xs text-hive-400">Exclusive · qualified · dedup-protected</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-hive-500">Payment method</p>
          <p className="mt-1 text-xl font-extrabold text-hive-950">ACH ••7291</p>
          <button className="mt-3 text-sm font-semibold text-honey-600 hover:text-honey-700">
            Update →
          </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <h2 className="px-6 py-4 font-bold text-hive-950">Payment history</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-y border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {myPayments.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3.5 text-hive-500">{formatDate(p.created_at)}</td>
                <td className="px-6 py-3.5 font-medium text-hive-900">{titleCase(p.payment_type)}</td>
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
