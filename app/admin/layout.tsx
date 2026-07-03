import Link from 'next/link'

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/contractors', label: 'Contractors' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/disputes', label: 'Disputes' },
  { href: '/admin/monitoring', label: 'Monitoring' },
  { href: '/admin/consents', label: 'TCPA Consents' },
]

export const metadata = { title: 'Admin', robots: { index: false } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-hive-50">
      <div className="border-b border-hive-800 bg-hive-950">
        <div className="container-site flex flex-wrap items-center gap-1 py-2">
          <span className="mr-4 text-sm font-bold text-honey-400">HiveQuote Admin</span>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-hive-300 transition hover:bg-hive-800 hover:text-white"
            >
              {t.label}
            </Link>
          ))}
          <span className="ml-auto rounded-full bg-hive-800 px-3 py-1 text-xs font-semibold text-honey-400">
            Demo mode
          </span>
        </div>
      </div>
      <div className="container-site py-10">{children}</div>
    </div>
  )
}
