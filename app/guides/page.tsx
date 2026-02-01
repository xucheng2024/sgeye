import Link from 'next/link'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { getGuideList } from '@/lib/guides'

export default function GuidesPage() {
  const guides = getGuideList()
  const featured = guides.filter((g) => g.featured)
  const rest = guides.filter((g) => !g.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Guides
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Data-driven guides to help you choose the right HDB neighbourhood and understand trade-offs: transport, school pressure, lease risk, and daily living comfort.
          </p>
        </header>

        {featured.length > 0 && (
          <section className="mb-10">
            <h2 className="sr-only">Featured guide</h2>
            <ul className="space-y-4">
              {featured.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}/`}
                    className="group block rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  >
                    <span className="inline-flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Featured guide
                    </span>
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {guide.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                      Read guide
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
            All guides
          </h2>
          <ul className="space-y-3">
            {rest.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}/`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2 sm:line-clamp-1">
                      {guide.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium shrink-0">
                    Read
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
