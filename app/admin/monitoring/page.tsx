import { mockMonitoring } from '@/lib/mock/store'
import LeadStatusBadge from '@/components/LeadStatusBadge'
import { formatRelative } from '@/lib/utils/formatting'

export default function AdminMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">Automation health</h1>
        <p className="text-sm text-hive-500">
          Automation without monitoring is unattended failure. Every scenario
          logs errors to Supabase and pages the founder by SMS on failure.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockMonitoring.automationHealth.map((s) => (
          <div key={s.scenario} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-hive-900">{s.scenario}</p>
              <p className="mt-1 text-xs text-hive-400">
                Last run {formatRelative(s.lastRun)} · {s.errors24h} error{s.errors24h === 1 ? '' : 's'} in 24h
              </p>
            </div>
            <LeadStatusBadge status={s.status} />
          </div>
        ))}
      </div>

      <div className="card !border-honey-300 bg-honey-50">
        <h2 className="font-bold text-hive-950">Compliance gates</h2>
        <ul className="mt-3 space-y-2 text-sm text-hive-700">
          <li>• A2P 10DLC: <strong>{mockMonitoring.a2pStatus}</strong> — SMS automation stays disabled until approved.</li>
          <li>• SMS active flag: <strong>{String(mockMonitoring.smsActive)}</strong> (config key <code>sms_active</code>).</li>
          <li>• Every SMS send checks the suppression list first. STOP replies suppress globally and permanently.</li>
          <li>• Webhook-triggered routing only — polling is prohibited for lead routing.</li>
        </ul>
      </div>
    </div>
  )
}
