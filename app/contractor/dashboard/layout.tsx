import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerContractor, hasContractorRefreshSession } from '@/lib/auth/server'

const tabs = [
  { href: '/contractor/dashboard', label: 'Overview' },
  { href: '/contractor/dashboard/leads', label: 'Leads' },
  { href: '/contractor/dashboard/billing', label: 'Billing & Wallet' },
  { href: '/contractor/dashboard/profile', label: 'Profile' },
]

export const metadata = { title: 'Contractor Dashboard', robots: { index: false } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const contractor = await getServerContractor()
  if (!contractor) {
    if (hasContractorRefreshSession()) {
      redirect('/api/auth/contractor-refresh?next=/contractor/dashboard')
    }
    redirect('/contractor/login')
  }

  return (
    <div className="bg-hive-50">
      <div className="border-b border-hive-200 bg-white">
        <div className="container-site flex flex-wrap items-center gap-1 py-2">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-hive-600 transition hover:bg-hive-100 hover:text-hive-950">
              {t.label}
            </Link>
          ))}
          <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Authenticated contractor
          </span>
        </div>
      </div>
      <div className="container-site py-10">{children}</div>
    </div>
  )
}
