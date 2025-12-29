import Link from 'next/link'
import { TrendingUp, AlertTriangle, Scale, CheckCircle2, ArrowRight, GraduationCap, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1: Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Can You Really Afford to Live in Singapore?
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Data-driven insights into housing costs, rental pressure, and everyday affordability.
            </p>
            <Link
              href="/hdb/affordability"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Check Your Housing Reality
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-blue-200">
              Based on official public data. No sign-up required.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Reality Hook (extended from Hero) */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-2xl md:text-3xl text-center text-gray-800 font-medium">
            For many households, renting now costs more than buying.
          </p>
        </div>
      </section>

      {/* Section 3: Core Entry Points */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Housing Reality</h2>
          <p className="text-gray-600">Understand prices, risks, and your options</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Market Trends */}
          <Link href="/hdb" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Price Trends</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              How HDB resale prices and volumes have changed over time.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
              Explore Trends
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 2: Structural Risk */}
          <Link href="/hdb/lease-price" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Lease & Risk</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Why cheaper flats may carry long-term resale and financing risks.
            </p>
            <div className="flex items-center text-amber-600 text-sm font-medium group-hover:gap-2 transition-all">
              Analyze Lease Risk
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 3: Personal Decision */}
          <Link href="/hdb/affordability" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scale className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Rent vs Buy</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Compare buying and renting costs based on your situation.
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium group-hover:gap-2 transition-all">
              Compare Options
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Family with Children Section */}
        <div className="text-center mb-12 mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Family with Children</h2>
          <p className="text-gray-600">Make informed decisions about education and location</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: PSLE & School Location */}
          <Link href="/family/psle-school" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">PSLE & School Location</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Understand school zones, PSLE cut-off points, and housing location trade-offs.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
              Explore Schools
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Card 2: Childcare (Coming later) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400">Childcare</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Childcare availability and costs by location.
            </p>
            <div className="text-xs text-gray-400 font-medium">
              Coming later
            </div>
          </div>

          {/* Card 3: Secondary (Coming later) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400">Secondary</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Secondary school options and admission criteria.
            </p>
            <div className="text-xs text-gray-400 font-medium">
              Coming later
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Value Proposition (Compressed) */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Why This Tool Is Different
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Uses official public data</h3>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Highlights risks and constraints</h3>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Designed for decision-making</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Final CTA */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 mb-6">Start with your own situation</p>
          <Link
            href="/hdb/affordability"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            See What You Can Really Afford
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            No sign-up. No ads. Just data.
          </p>
        </div>
      </section>

      {/* Section 6: Future Dimensions (Reserved for Future) */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-400 text-center mb-6">More Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
            <div className="text-center p-4">
              <div className="text-sm font-medium text-gray-500">Transport</div>
              <div className="text-xs text-gray-400 mt-1">Coming later</div>
            </div>
            <div className="text-center p-4">
              <div className="text-sm font-medium text-gray-500">Healthcare</div>
              <div className="text-xs text-gray-400 mt-1">Coming later</div>
            </div>
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
