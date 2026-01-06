'use client'

import Link from 'next/link'
import { ArrowRight, Database, Home as HomeIcon, Users } from 'lucide-react'
import HomeCTAs from '@/components/HomeCTAs'
import FeedbackForm from '@/components/FeedbackForm'
import { AnalyticsEvents } from '@/lib/analytics'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    AnalyticsEvents.viewHome()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1: Hero - Single Main CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              Choose the right neighbourhood<br className="hidden sm:block" />
              <span className="sm:ml-0"> — before choosing a home.</span>
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-white/90 leading-relaxed mb-10 md:mb-12 max-w-2xl mx-auto">
              Neighbourhood determines your daily life — commute, schools, routines, and long-term comfort.
            </p>
            <HomeCTAs />
            <div className="mt-10 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-blue-200/85 leading-relaxed">
                <span className="inline-flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-blue-200/80" />
                  Official data
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HomeIcon className="w-5 h-5 text-blue-200/80" />
                  No agents, no listings
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-blue-200/80" />
                  Built for families
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="bg-gray-50 py-12 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            How it works
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">1</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start with neighbourhoods that fit your life
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Daily routines, commute, amenities, and community shape how a place feels to live in.</p>
                  <Link
                    href="/neighbourhoods"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    Explore neighbourhoods
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">2</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Check long-term comfort and risk
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Remaining lease, estate age, and neighbourhood stability affect long-term peace of mind.</p>
                  <Link
                    href="/hdb/lease-price"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    View lease & long-term comfort
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold text-gray-400 mt-1">3</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Understand school and family pressure
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">School demand varies widely by planning area and can affect daily stress and future options.</p>
                  <Link
                    href="/family/psle-school"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    View schools by area
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: For Data Explorers (Optional) */}
      <section className="bg-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-gray-400 text-center mb-4">
            Explore quickly
          </h2>
          <p className="text-xs text-gray-500 text-center mb-4">
            Jump straight to the pages you need.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Link
              href="/hdb"
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
              href="/hdb/lease-price"
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

      {/* Feedback Form */}
      <section className="bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeedbackForm
            context="home"
            question="What are you hesitating about? (One sentence)"
            placeholder="My situation is..."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm">Singapore Data Eye</p>
              <p className="text-xs mt-1">Built with official public data</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
