const STATUS_STYLES: Record<string, string> = {
  new: 'bg-hive-100 text-hive-700',
  qualifying: 'bg-honey-100 text-honey-800',
  qualified: 'bg-honey-200 text-honey-900',
  nurture: 'bg-hive-100 text-hive-600',
  routing: 'bg-blue-100 text-blue-800',
  assigned: 'bg-blue-100 text-blue-800',
  contacted: 'bg-indigo-100 text-indigo-800',
  won: 'bg-green-100 text-green-800',
  won_verified: 'bg-green-200 text-green-900',
  lost: 'bg-hive-200 text-hive-600',
  disputed: 'bg-red-100 text-red-800',
  unresponsive: 'bg-hive-100 text-hive-500',
  deduplicated: 'bg-hive-100 text-hive-500',
  open: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-honey-100 text-honey-800',
  failed: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-hive-100 text-hive-600',
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-honey-100 text-honey-800',
  down: 'bg-red-100 text-red-800',
}

export default function LeadStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-hive-100 text-hive-700'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
