'use client'

import Link from 'next/link'
import { useState } from 'react'
import Logo from './Logo'

const links = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/directory', label: 'Find a Pro' },
  { href: '/blog', label: 'Guides' },
  { href: '/for-contractors', label: 'For Contractors' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-hive-200 bg-white/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Link href="/" aria-label="HiveQuote home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-hive-600 transition hover:text-hive-950"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contractor/login" className="text-sm font-medium text-hive-600 hover:text-hive-950">
            Pro Login
          </Link>
          <Link href="/#get-matched" className="btn-primary !px-5 !py-2.5 !text-sm">
            Get Matched Free
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 text-hive-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-hive-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1 text-base font-medium text-hive-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/contractor/login" className="py-1 text-base font-medium text-hive-700" onClick={() => setOpen(false)}>
              Pro Login
            </Link>
            <Link href="/#get-matched" className="btn-primary mt-2" onClick={() => setOpen(false)}>
              Get Matched Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
