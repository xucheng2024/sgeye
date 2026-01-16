'use client'

import Link from 'next/link'
import { AnalyticsEvents } from '@/lib/analytics'
import { ExternalLink } from 'lucide-react'

export default function HomeCTAs() {
  const handleHDBBudgetClick = () => {
    // HDB official affordability calculator URL
    const hdbUrl = 'https://homes.hdb.gov.sg/home/calculator?utm_source=chatgpt.com'
    window.open(hdbUrl, '_blank', 'noopener,noreferrer')
    AnalyticsEvents.ctaStartGuided()
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
      <Link
        href="/neighbourhoods"
        onClick={() => AnalyticsEvents.ctaBrowseDirect()}
        className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto sm:min-w-[280px]"
      >
        Explore neighbourhoods
      </Link>
      <button
        onClick={handleHDBBudgetClick}
        className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-lg font-semibold text-white border border-white/40 hover:bg-white/10 hover:border-white/60 transition-colors w-full sm:w-auto sm:min-w-[280px]"
      >
        Calculate budget
        <span className="text-sm font-normal opacity-75 ml-1">(optional)</span>
        <ExternalLink className="w-4 h-4 opacity-75" />
      </button>
    </div>
  )
}

