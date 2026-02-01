import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { guideContent, isGuidePublished } from '@/lib/guides'
import type { GuideData } from '@/lib/guides'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params
  if (!isGuidePublished(resolvedParams.slug)) {
    return {
      title: 'Guide not found | Singapore Data Eye',
      description: 'The guide you are looking for does not exist.',
    }
  }
  const guide = guideContent[resolvedParams.slug]

  if (!guide) {
    return {
      title: 'Guide not found | Singapore Data Eye',
      description: 'The guide you are looking for does not exist.',
    }
  }

  return {
    title: `${guide.title} | Singapore Data Eye`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${resolvedParams.slug}/`,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guides/${resolvedParams.slug}/`,
    },
    twitter: {
      title: guide.title,
      description: guide.description,
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params
  if (!isGuidePublished(resolvedParams.slug)) {
    notFound()
  }
  const guide = guideContent[resolvedParams.slug]

  if (!guide) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sgeye.vercel.app'
  const canonicalPath = `/guides/${resolvedParams.slug}/`
  const nowIso = new Date().toISOString()
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: `${siteUrl}${canonicalPath}`,
    datePublished: nowIso,
    dateModified: nowIso,
    publisher: {
      '@type': 'Organization',
      name: 'Singapore Data Eye',
      url: siteUrl,
    },
  }

  type RelatedItem = { slug: string } & GuideData
  const relatedGuides: RelatedItem[] = (guide.relatedGuides ?? [])
    .filter((s: string): s is string => isGuidePublished(s))
    .map((s: string) => ({ slug: s, ...guideContent[s] }))
    .filter((g: RelatedItem): g is RelatedItem => Boolean(g.title))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link
            href="/guides/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to guides
          </Link>
        </nav>

        <article className="guide-prose">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {guide.title}
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {guide.description}
            </p>
          </header>

          <div className="mt-2">
            {guide.content}
          </div>

          {relatedGuides.length > 0 && (
            <aside className="mt-14 pt-10 border-t border-slate-200" aria-label="Related guides">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Related guides
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedGuides.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/guides/${related.slug}/`}
                    className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {related.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                      Read
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <aside className="mt-14 pt-10 border-t border-slate-200" aria-label="Next steps">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Next steps
            </h2>
            <Link
              href="/neighbourhoods"
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Browse neighbourhoods
                </span>
                <p className="text-sm text-slate-600 mt-0.5">
                  Compare price trends, transport, lease safety & school pressure
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </aside>
        </article>
      </div>
    </div>
  )
}
