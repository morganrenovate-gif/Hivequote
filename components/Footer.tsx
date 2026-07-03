import Link from 'next/link'
import Logo from './Logo'
import { TRADES } from '@/data/trades'

export default function Footer() {
  return (
    <footer className="border-t border-hive-800 bg-hive-950 text-hive-300">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-hive-400">
            Utah&apos;s exclusive home services lead exchange. One project, one
            vetted pro — never a shared lead.
          </p>
          <p className="mt-4 text-sm text-hive-500">Salt Lake City, Utah</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Services
          </h3>
          <ul className="space-y-2 text-sm">
            {TRADES.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="transition hover:text-honey-400">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            More Services
          </h3>
          <ul className="space-y-2 text-sm">
            {TRADES.slice(6).map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="transition hover:text-honey-400">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Company
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/how-it-works" className="transition hover:text-honey-400">How It Works</Link></li>
            <li><Link href="/about" className="transition hover:text-honey-400">About</Link></li>
            <li><Link href="/directory" className="transition hover:text-honey-400">Contractor Directory</Link></li>
            <li><Link href="/for-contractors" className="transition hover:text-honey-400">Join as a Contractor</Link></li>
            <li><Link href="/contractor/login" className="transition hover:text-honey-400">Contractor Login</Link></li>
            <li><Link href="/privacy" className="transition hover:text-honey-400">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hive-800">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-hive-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HiveQuote LLC. All rights reserved.</p>
          <p>
            HiveQuote is a lead generation service. We connect homeowners with
            independent, licensed contractors. We do not perform construction
            services.
          </p>
        </div>
      </div>
    </footer>
  )
}
