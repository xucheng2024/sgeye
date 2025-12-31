import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1: Hero - Single Main CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Where should my family live in Singapore?
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Compare neighbourhoods and understand real trade-offs — cost, lease risk, and school competition.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/neighbourhoods"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-lg font-semibold text-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Explore Neighbourhoods
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="/neighbourhoods?group=planning-area"
                className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-5 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
              >
                Browse by Planning Area
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              Based on official public data. No sign-up required.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Why Trust Us */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            This is not a listing site.
            <br />
            It&apos;s a decision tool.
          </h2>
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Uses official public data (HDB, data.gov.sg)</h3>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Highlights hidden risks (lease decay, school pressure)</h3>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Designed for family decisions, not speculation</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What You Can Decide */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            What you can decide here
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-lg text-gray-800 mb-3">
                &quot;Is renting actually cheaper than buying here?&quot;
              </p>
              <Link
                href="/compare"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Compare →
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-lg text-gray-800 mb-3">
                &quot;Does moving reduce school pressure — or just raise prices?&quot;
              </p>
              <Link
                href="/compare"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Compare →
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-lg text-gray-800 mb-3">
                &quot;Which trade-offs matter most for my family?&quot;
              </p>
              <Link
                href="/compare"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Compare →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Other Modules (Capability Showcase - All link to Compare) */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-400 text-center mb-6">
            Explore the data (optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/neighbourhoods"
              className="text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium mb-1">How have resale prices evolved?</div>
              <div className="text-xs text-gray-500">Price trends</div>
            </Link>
            <Link
              href="/neighbourhoods"
              className="text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium mb-1">Where are prices highest and lowest?</div>
              <div className="text-xs text-gray-500">Neighbourhood list</div>
            </Link>
            <Link
              href="/neighbourhoods"
              className="text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium mb-1">How does lease decay affect prices?</div>
              <div className="text-xs text-gray-500">Lease & risk</div>
            </Link>
            <Link
              href="/hdb/transport"
              className="text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium mb-1">How does location affect daily time burden?</div>
              <div className="text-xs text-gray-500">Transport & accessibility</div>
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
