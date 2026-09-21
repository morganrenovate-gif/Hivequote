import type { MetadataRoute } from 'next'
import { TRADES } from '@/data/trades'
import { POSTS } from '@/data/posts'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hivequote.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = ['', '/how-it-works', '/about', '/for-contractors', '/directory', '/blog', '/privacy'].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })
  )
  const trades = TRADES.map((t) => ({
    url: `${BASE}/${t.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  const posts = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))
  return [...statics, ...trades, ...posts]
}
