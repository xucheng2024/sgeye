import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1: Hero - Single Main CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find the neighbourhood that fits your family — not just your budget.
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Compare neighbourhoods and see real trade-offs in cost, lease risk, schools, and daily convenience.
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <Link
                href="/hdb/affordability"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-lg font-semibold text-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start with my budget & family
                <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="text-sm text-blue-200 mb-2">
                Takes about 2 minutes. No sign-up required.
              </p>
              <Link
                href="/neighbourhoods"
                className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors text-lg"
              >
                Browse neighbourhoods directly
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-xs text-blue-300/80 mb-3 leading-relaxed">
                A decision tool for families — not a property listing site.
                <br />
                Uses official public data (HDB, data.gov.sg)
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-blue-300/70 leading-relaxed">
                <span>Official public data</span>
                <span className="text-blue-300/40">·</span>
                <span>Hidden risks highlighted</span>
                <span className="text-blue-300/40">·</span>
                <span>Family-focused decisions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: What You'll Get */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            What you&apos;ll get
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">Step 1</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Calculate your HDB affordability and find suitable neighbourhoods
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your budget, lease length, and holding period
                  </p>
                  <Link
                    href="/hdb/affordability"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    View analysis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">Step 2</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Understand the trade-off between school competition and housing cost
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Compare neighbourhoods by school demand and resale pressure
                  </p>
                  <Link
                    href="/compare"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    View comparison
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">Step 3</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Discover which factors matter most for families like yours
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Budget, commute, schools, lease risk
                  </p>
                  <Link
                    href="/compare"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    Start guided comparison
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: For Data Explorers (Optional) */}
      <section className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-gray-400 text-center mb-4">
            For data explorers
          </h2>
          <p className="text-xs text-gray-500 text-center mb-4">
            Dive into raw trends and neighbourhood-level data
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Link
              href="/neighbourhoods"
              className="text-left p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="font-medium mb-0.5">How have resale prices evolved?</div>
              <div className="text-xs text-gray-400">Price trends</div>
            </Link>
            <Link
              href="/neighbourhoods"
              className="text-left p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="font-medium mb-0.5">Where are prices highest and lowest?</div>
              <div className="text-xs text-gray-400">Neighbourhood list</div>
            </Link>
            <Link
              href="/neighbourhoods"
              className="text-left p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="font-medium mb-0.5">How does lease decay affect prices?</div>
              <div className="text-xs text-gray-400">Lease & risk</div>
            </Link>
            <Link
              href="/hdb/transport"
              className="text-left p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="font-medium mb-0.5">How does location affect daily time burden?</div>
              <div className="text-xs text-gray-400">Transport & accessibility</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm">Singapore Data Eye</p>
              <p className="text-xs mt-1">Living in Singapore • Built with official public data from data.gov.sg</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
