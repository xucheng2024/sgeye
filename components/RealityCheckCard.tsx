/**
 * Reality Check Card Component
 * Shows what families typically see at a given budget range
 */

'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface RealityCheckData {
  lease: { p25: number | null; p75: number | null }
  size: { p25: number | null; p75: number | null }
  mrtAccess: { category: string; percentage: number }
  schoolPressure: { level: string }
  resaleActivity: { level: string; medianTx: number }
}

interface RealityCheckCardProps {
  budget: number
  flatType?: string | null
  className?: string
}

export default function RealityCheckCard({ budget, flatType, className = '' }: RealityCheckCardProps) {
  const [data, setData] = useState<RealityCheckData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRealityCheck() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('budget', budget.toString())
        if (flatType) {
          params.set('flat_type', flatType)
        }

        const res = await fetch(`/api/affordability/reality-check?${params.toString()}`)
        const result = await res.json()

        if (res.ok) {
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching reality check:', error)
      } finally {
        setLoading(false)
      }
    }

    if (budget > 0) {
      fetchRealityCheck()
    }
  }, [budget, flatType])

  if (loading || !data) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-sm text-gray-600">Loading reality check...</div>
      </div>
    )
  }

  const formatMRTAccess = () => {
    if (data.mrtAccess.category === 'mrt-first') {
      return 'Often MRT-first'
    } else if (data.mrtAccess.category === 'mixed') {
      return 'Mixed (MRT and bus)'
    } else {
      return 'Often bus-first'
    }
  }

  const formatSchoolPressure = () => {
    return 'Varies significantly by area'
  }

  const formatResaleActivity = () => {
    if (data.resaleActivity.level === 'active') {
      return 'Active'
    } else if (data.resaleActivity.level === 'moderate') {
      return 'Moderate'
    } else {
      return 'Moderate to thin'
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Reality check — what {formatCurrency(budget)} really buys today
      </h3>
      <p className="text-base font-medium text-gray-900 mb-4">
        With a budget around {formatCurrency(budget)}, most families are not choosing neighbourhoods — they are choosing trade-offs.
      </p>
      <p className="text-sm text-gray-700 mb-4">
        Here's what that typically looks like:
      </p>
      <ul className="space-y-3">
        {data.lease.p25 !== null && data.lease.p75 !== null && (
          <li className="text-sm text-gray-700">
            <span className="font-medium">Remaining lease:</span>{' '}
            {data.lease.p25}–{data.lease.p75} years
          </li>
        )}
        {data.size.p25 !== null && data.size.p75 !== null && (
          <li className="text-sm text-gray-700">
            <span className="font-medium">Flat size:</span>{' '}
            {data.size.p25}–{data.size.p75} sqm
          </li>
        )}
        <li className="text-sm text-gray-700">
          <span className="font-medium">MRT access:</span>{' '}
          {formatMRTAccess()}
        </li>
        <li className="text-sm text-gray-700">
          <span className="font-medium">School pressure:</span>{' '}
          {formatSchoolPressure()}
        </li>
        <li className="text-sm text-gray-700">
          <span className="font-medium">Resale activity:</span>{' '}
          {formatResaleActivity()}
        </li>
      </ul>
    </div>
  )
}

