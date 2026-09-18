export default function HedyMigrationGate({
  area,
  detail = 'This surface is intentionally unavailable while HiveQuote moves its operational state to Hedy.',
}: {
  area: string
  detail?: string
}) {
  return (
    <section className="bg-hive-50 py-16">
      <div className="container-site max-w-2xl">
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-wider text-honey-700">HQ-1 migration gate</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-hive-950">{area}</h1>
          <p className="mt-3 text-sm leading-relaxed text-hive-600">{detail}</p>
          <p className="mt-4 rounded-lg bg-hive-100 px-4 py-3 text-xs text-hive-600">
            No demo credentials, fabricated records, or mock-success actions are available.
          </p>
        </div>
      </div>
    </section>
  )
}
