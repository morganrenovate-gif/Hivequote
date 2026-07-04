import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hivequote.com'),
  title: {
    default: 'HiveQuote — Utah Home Services, One Vetted Pro Per Project',
    template: '%s | HiveQuote',
  },
  description:
    'HiveQuote matches Utah homeowners with one licensed, vetted contractor per project. Exclusive matching — your info is never sold to a list. Electricians, plumbers, flooring, epoxy, cabinets, and more.',
  keywords: [
    'Utah contractors',
    'Utah electrician',
    'Utah plumber',
    'epoxy floor Utah',
    'home services Utah',
    'contractor quotes Utah',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HiveQuote',
    title: 'HiveQuote — Utah Home Services, One Vetted Pro Per Project',
    description:
      'One project request. One licensed Utah pro. Zero spam calls. Free for homeowners.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'HiveQuote — One project. One vetted pro. Zero spam calls.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HiveQuote — Utah Home Services, One Vetted Pro Per Project',
    description:
      'One project request. One licensed Utah pro. Zero spam calls. Free for homeowners.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
