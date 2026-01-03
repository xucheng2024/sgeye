'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AnalyticsEvents } from '@/lib/analytics'

export default function HomeCTAs() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
      <Link
        href="/hdb/affordability"
        onClick={() => AnalyticsEvents.ctaStartGuided()}
        className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto sm:min-w-[280px]"
      >
        Start with my budget
        <ArrowRight className="w-5 h-5" />
      </Link>
      <Link
        href="/neighbourhoods"
        onClick={() => AnalyticsEvents.ctaBrowseDirect()}
        className="inline-flex items-center justify-center px-6 py-4 rounded-lg text-lg font-semibold text-white border border-white/40 hover:bg-white/10 hover:border-white/60 transition-colors w-full sm:w-auto sm:min-w-[280px]"
      >
        Browse all neighbourhoods
      </Link>
    </div>
  )
}

