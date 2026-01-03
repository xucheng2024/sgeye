/**
 * Decision Path Card Component
 * Shows realistic decision paths based on budget reality check
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DecisionPathCardProps {
  budget: number
  realityCheckData: {
    lease: { p25: number | null; p75: number | null }
    mrtAccess: { category: string; percentage: number }
    resaleActivity: { level: string }
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
      title: 'Option A — Prioritise long-term safety',
      description: [
        'Choose longer remaining lease',
        'Accept longer commute',
        'Lower resale and financing risk',
      ],
      cta: 'Explore Option A: lease-safe neighbourhoods',
      url: `/neighbourhoods?price_max=${Math.round(budget * 1.1)}&lease_tier=high&source=affordability`,
    })

    // Option B: Commute-first (always present - the structural opposite)
    generatedPaths.push({
      id: 'commute-first',
      title: 'Option B — Prioritise daily convenience',
      description: [
        'Live closer to MRT or central areas',
        'Accept shorter remaining lease',
        'Higher long-term resale uncertainty',
      ],
      cta: 'Explore Option B: MRT-first neighbourhoods',
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
      <p className="text-sm text-gray-700 mb-4">
        With this budget, most families realize they are choosing between two paths — not just neighbourhoods:
      </p>
      <div className="space-y-4">
        {paths.map((path) => (
          <div key={path.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{path.title}</h4>
            <ul className="space-y-1 mb-4">
              {path.description.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={path.url}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2"
            >
              <ArrowRight className="w-4 h-4" />
              {path.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 italic mt-4 pt-4 border-t border-blue-100">
        Most families with similar budgets tend to lean one of these ways.
        You'll see both paths clearly in the next step.
      </p>
    </div>
  )
}

