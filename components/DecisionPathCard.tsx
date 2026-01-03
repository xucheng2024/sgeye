/**
 * Decision Path Card Component
 * Shows realistic decision paths based on budget reality check
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
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
  const [paths, setPaths] = useState<Array<{
    id: string
    title: string
    description: string[]
    cta: string
    url: string
  }>>([])

  useEffect(() => {
    // Always show both Option A and Option B for contrast
    // This forces users to recognize the trade-off, not just see a recommendation
    const generatedPaths: typeof paths = []

    // Option A: Lease-first (always present)
    generatedPaths.push({
      id: 'lease-first',
      title: 'I want to reduce long-term risk',
      description: [
        'Choose longer remaining lease',
        'Accept longer commute',
        'Lower resale & refinancing risk',
      ],
      cta: 'See lease-safe neighbourhoods',
      url: `/neighbourhoods?price_max=${Math.round(budget * 1.1)}&lease_tier=high&source=affordability`,
    })

    // Option B: Commute-first (always present - the structural opposite)
    generatedPaths.push({
      id: 'commute-first',
      title: 'I want better daily convenience',
      description: [
        'Closer to MRT / central areas',
        'Smaller flats or shorter lease',
        'Higher long-term risk',
      ],
      cta: 'See MRT-first neighbourhoods',
      url: `/neighbourhoods?price_max=${Math.round(budget * 1.15)}&mrt_tier=close&source=affordability`,
    })

    setPaths(generatedPaths)
  }, [budget, realityCheckData])

  if (paths.length === 0) return null

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        What families usually do next
      </h3>
      <div className="space-y-4 mt-4">
        {paths.map((path, index) => (
          <div key={path.id} className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">{index === 0 ? '🅰️' : '🅱️'}</span>
              <span>{path.title}</span>
            </h4>
            <ul className="space-y-2 mb-4">
              {path.description.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={path.url}
              onClick={() => AnalyticsEvents.affordabilityToExplore()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>👉</span>
              {path.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

