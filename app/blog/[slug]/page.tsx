import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS, getPost } from '@/data/posts'
import { getTrade } from '@/data/trades'
import { formatDate } from '@/lib/utils/formatting'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: Props) {
  const post = getPost(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug)
  if (!post) notFound()
  const trade = getTrade(post.tradeSlug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'HiveQuote' },
  }

  return (
    <article className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-site max-w-3xl">
        <p className="text-sm text-hive-500">
          <Link href="/blog" className="text-honey-600 hover:text-honey-700">Guides</Link>
          {' '}· {formatDate(post.date)} · {post.readMinutes} min read
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-hive-950 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-8 space-y-6 text-lg leading-relaxed text-hive-700">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {trade && (
          <div className="card mt-12 bg-honey-50 !border-honey-200 text-center">
            <h2 className="text-xl font-bold text-hive-950">
              Ready for an exact quote?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-hive-600">
              Get matched with one vetted Utah {trade.shortName.toLowerCase()} pro
              — free, exclusive, no spam calls.
            </p>
            <Link href={`/${trade.slug}`} className="btn-primary mt-5">
              Get Matched Free
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
