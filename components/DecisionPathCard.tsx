/**
 * Decision Path Card Component
 * Shows realistic decision paths based on budget reality check
 */

'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AnalyticsEvents } from '@/lib/analytics'

interface DecisionPathCardProps {
  budget: number
  realityCheckData?: {
    lease?: { p25: number | null; p75: number | null }
    mrtAccess?: { category: string; percentage: number }
    resaleActivity?: { level: string }
  }
  className?: string
}

export default function DecisionPathCard({ budget, realityCheckData, className = '' }: DecisionPathCardProps) {
  const exploreUrl = `/neighbourhoods?price_max=${Math.round(budget * 1.1)}`

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Next step
      </h3>
      <p className="text-sm text-gray-700 mb-4">
        Explore neighbourhoods that fit your budget, lease comfort, and commute.
      </p>
      <Link
        href={exploreUrl}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Explore neighbourhoods
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}

