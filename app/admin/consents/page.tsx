import { mockConsents } from '@/lib/mock/store'
import { formatDate } from '@/lib/utils/formatting'
import { CONSENT_LANGUAGE_TEXT, CONSENT_LANGUAGE_VERSION } from '@/lib/utils/tcpa'

export default function AdminConsentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-hive-950">TCPA consent audit log</h1>
        <p className="text-sm text-hive-500">
          Every record stores phone, timestamp, IP, form URL, and the exact
          consent language shown. Retained 4+ years.
        </p>
      </div>

      <div className="card">
        <p className="text-xs font-bold uppercase tracking-wider text-hive-400">
          Active consent language ({CONSENT_LANGUAGE_VERSION})
        </p>
        <p className="mt-2 text-sm leading-relaxed text-hive-700">{CONSENT_LANGUAGE_TEXT}</p>
      </div>

      <div className="card !p-0 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-hive-200 bg-hive-50 text-xs uppercase tracking-wider text-hive-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Form URL</th>
              <th className="px-6 py-3">Version</th>
              <th className="px-6 py-3">Opt-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hive-100">
            {mockConsents.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-3.5 text-hive-500">{formatDate(c.created_at)}</td>
                <td className="px-6 py-3.5 font-semibold text-hive-900">{c.phone}</td>
                <td className="px-6 py-3.5 text-hive-600">{c.form_url}</td>
                <td className="px-6 py-3.5 text-hive-600">{c.version}</td>
                <td className="px-6 py-3.5">{c.opt_in ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
