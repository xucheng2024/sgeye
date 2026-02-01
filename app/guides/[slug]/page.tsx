import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { guideContent, isGuidePublished } from '@/lib/guides'


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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/guides/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to guides
          </Link>

        <article className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {guide.title}
          </h1>
          {guide.content}
          
          {/* Related Guides */}
          {guide.relatedGuides && guide.relatedGuides.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related guides</h2>
              <div className="space-y-3">
                {guide.relatedGuides.map((relatedSlug: string) => {
                  if (!isGuidePublished(relatedSlug)) return null
                  const relatedGuide = guideContent[relatedSlug]
                  if (!relatedGuide) return null
                  return (
                    <Link
                      key={relatedSlug}
                      href={`/guides/${relatedSlug}/`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{relatedGuide.title}</h3>
                      <p className="text-sm text-gray-600">{relatedGuide.description.substring(0, 120)}...</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next steps</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/neighbourhoods"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse all neighbourhoods
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Explore neighbourhoods to see price trends, transport access, lease safety, and school pressure data.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
