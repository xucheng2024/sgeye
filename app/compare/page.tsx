/**
 * Neighbourhood Compare Page
 * Route: /compare?ids=nbhd1,nbhd2,nbhd3
 * 
 * Compares multiple neighbourhoods side by side
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface NeighbourhoodComparison {
  id: string
  name: string
  one_liner: string | null
  planning_area: {
    id: string
    name: string
  } | null
  summary: {
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
  } | null
  access: {
    mrt_station_count: number
    mrt_access_type: string
    avg_distance_to_mrt: number | null
  } | null
  trends: any[]
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idsParam = searchParams.get('ids')
  const ids = idsParam ? idsParam.split(',').filter(Boolean).slice(0, 3) : []
  
  const [comparisons, setComparisons] = useState<NeighbourhoodComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flatType, setFlatType] = useState<string>('4 ROOM')
  const [months, setMonths] = useState<number>(24)

  useEffect(() => {
    if (ids.length > 0) {
      loadComparison()
    }
  }, [idsParam, flatType, months])

  async function loadComparison() {
    if (ids.length === 0) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/neighbourhoods/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          months,
          flat_type: flatType
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compare neighbourhoods')
      }
      
      setComparisons(data.comparison || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison')
      console.error('Error loading comparison:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number | null): string {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDistance(meters: number | null): string {
    if (!meters) return 'N/A'
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  function getMRTAccessLabel(type: string | null | undefined): string {
    const labels: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: 'None'
    }
    return labels[type || 'none'] || 'Unknown'
  }

  // Get MRT convenience description
  function getMRTConvenienceDescription(c: NeighbourhoodComparison): string {
    const stationCount = c.access?.mrt_station_count || 0
    const distance = c.access?.avg_distance_to_mrt
    const accessType = c.access?.mrt_access_type
    
    if (stationCount > 0) {
      return 'Within walking distance'
    }
    
    if (distance && distance > 0) {
      if (distance <= 500) {
        return '~5–10 min walk'
      } else if (distance <= 1000) {
        return '~10–15 min walk'
      } else if (distance <= 1500) {
        return '~15–20 min walk / bus required'
      } else {
        return '~20+ min walk / bus required'
      }
    }
    
    if (accessType === 'low') {
      return '~15–20 min walk / bus required'
    }
    
    return 'Bus or driving required'
  }

  function getPublicTransportConvenience(c: NeighbourhoodComparison): string {
    const stationCount = c.access?.mrt_station_count || 0
    const distance = c.access?.avg_distance_to_mrt
    const accessType = c.access?.mrt_access_type
    
    if (stationCount >= 2 || accessType === 'high') {
      return 'High'
    } else if (stationCount === 1 || accessType === 'medium' || (distance && distance <= 800)) {
      return 'Medium'
    } else if (accessType === 'low' || (distance && distance <= 1500)) {
      return 'Low–medium'
    } else {
      return 'Low'
    }
  }

  // Generate "Who is this for" analysis
  function generateWhoIsThisFor() {
    if (comparisons.length < 2) return []
    
    return comparisons.map((c, idx) => {
      const price = c.summary?.median_price_12m
      const psm = c.summary?.median_psm_12m
      const lease = c.summary?.median_lease_years_12m
      const txCount = c.summary?.tx_12m || 0
      const mrtStations = c.access?.mrt_station_count || 0
      const mrtDistance = c.access?.avg_distance_to_mrt
      
      const pros: string[] = []
      const cons: string[] = []
      
      // Compare with others
      const otherPrices = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_price_12m).filter(p => p !== null && p !== undefined) as number[]
      const otherPsms = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_psm_12m).filter(p => p !== null && p !== undefined) as number[]
      const otherLeases = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_lease_years_12m).filter(l => l !== null && l !== undefined) as number[]
      const otherStations = comparisons.filter((_, i) => i !== idx).map(c => c.access?.mrt_station_count || 0)
      const otherDistances = comparisons.filter((_, i) => i !== idx).map(c => c.access?.avg_distance_to_mrt).filter(d => d !== null && d !== undefined) as number[]
      
      // Price analysis
      if (price && otherPrices.length > 0) {
        const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
        if (price < avgOtherPrice * 0.85) {
          pros.push('First-time buyer / Value for money')
        } else if (price > avgOtherPrice * 1.15) {
          pros.push('Accepts higher unit price')
          cons.push('Budget-sensitive buyer')
        }
      }
      
      // Transport convenience analysis
      if (mrtStations > 0 || (mrtDistance && mrtDistance <= 500)) {
        pros.push('Prioritises MRT accessibility')
      } else if (mrtDistance && mrtDistance > 1500) {
        cons.push('Relies on bus or driving')
      }
      
      // Lease analysis
      if (lease && otherLeases.length > 0) {
        const avgOtherLease = otherLeases.reduce((a, b) => a + b, 0) / otherLeases.length
        if (lease > avgOtherLease + 5) {
          pros.push('Long-term holding')
        }
      }
      
      // Market activity
      if (txCount > 100) {
        pros.push('Active resale market')
      } else if (txCount < 50) {
        cons.push('Limited recent resale activity')
      }
      
      return {
        id: c.id,
        name: c.name,
        pros,
        cons
      }
    })
  }

  // Generate verdict for each metric row
  function getMetricVerdict(metric: string, rawValues: (number | null | string)[]): { text: string; icon: string } | null {
    if (rawValues.length < 2) return null
    
    // Extract numeric values from raw values
    let numericValues: number[] = []
    
    switch (metric) {
      case 'Transactions (12m)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseInt(v.replace(/,/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Median Price':
      case 'Price per sqm':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Median Lease (years)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'MRT Stations':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseInt(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Distance to MRT':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            if (v === 'N/A' || v === '') return null
            const num = parseFloat(v.replace(/[^0-9.]/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      default:
        return null
    }
    
    if (numericValues.length < 2) return null
    
    switch (metric) {
      case 'Transactions (12m)':
        const maxTx = Math.max(...numericValues)
        const minTx = Math.min(...numericValues)
        if (maxTx === minTx) return { text: 'Similar', icon: '⚖️' }
        const maxTxIdx = numericValues.indexOf(maxTx)
        const txDiffPercent = ((maxTx - minTx) / minTx) * 100
        if (txDiffPercent > 50) {
          return { text: `${comparisons[maxTxIdx]?.name || 'The former'} is clearly more active`, icon: '🔼' }
        } else if (txDiffPercent > 20) {
          return { text: `${comparisons[maxTxIdx]?.name || 'The former'} is more active`, icon: '🔼' }
        } else {
          return { text: `${comparisons[maxTxIdx]?.name || 'The former'} is slightly more active`, icon: '🔼' }
        }
      
      case 'Median Price':
      case 'Price per sqm':
        const maxPrice = Math.max(...numericValues)
        const minPrice = Math.min(...numericValues)
        const diffPercent = ((maxPrice - minPrice) / minPrice) * 100
        if (diffPercent < 5) return { text: 'Similar', icon: '⚖️' }
        const maxPriceIdx = numericValues.indexOf(maxPrice)
        if (diffPercent > 30) {
          return { text: `${comparisons[maxPriceIdx]?.name || 'The former'} is substantially higher`, icon: '🔴' }
        } else if (diffPercent > 15) {
          return { text: `${comparisons[maxPriceIdx]?.name || 'The former'} is clearly higher`, icon: '🔴' }
        } else {
          return { text: `${comparisons[maxPriceIdx]?.name || 'The former'} is higher`, icon: '🔴' }
        }
      
      case 'Median Lease (years)':
        const maxLease = Math.max(...numericValues)
        const minLease = Math.min(...numericValues)
        const leaseDiff = maxLease - minLease
        if (leaseDiff < 2) return { text: 'Similar', icon: '⚖️' }
        const maxLeaseIdx = numericValues.indexOf(maxLease)
        if (leaseDiff > 10) {
          return { text: `${comparisons[maxLeaseIdx]?.name || 'The former'} has substantially longer lease`, icon: '🔼' }
        } else if (leaseDiff > 5) {
          return { text: `${comparisons[maxLeaseIdx]?.name || 'The former'} has longer lease`, icon: '🔼' }
        } else {
          return { text: `${comparisons[maxLeaseIdx]?.name || 'The former'} has slightly longer lease`, icon: '🔼' }
        }
      
      case 'MRT Stations':
        const maxStations = Math.max(...numericValues)
        const minStations = Math.min(...numericValues)
        if (maxStations === minStations) return { text: 'Same', icon: '⚖️' }
        const maxStationsIdx = numericValues.indexOf(maxStations)
        return { text: `${comparisons[maxStationsIdx]?.name || 'The former'} has more`, icon: '🔼' }
      
      case 'Distance to MRT':
        const minDist = Math.min(...numericValues)
        const maxDist = Math.max(...numericValues)
        if (Math.abs(maxDist - minDist) < 100) return { text: 'Similar', icon: '⚖️' }
        const minDistIdx = numericValues.indexOf(minDist)
        const distDiffPercent = ((maxDist - minDist) / minDist) * 100
        if (distDiffPercent > 50) {
          return { text: `${comparisons[minDistIdx]?.name || 'The former'} is substantially closer`, icon: '🔼' }
        } else if (distDiffPercent > 20) {
          return { text: `${comparisons[minDistIdx]?.name || 'The former'} is closer`, icon: '🔼' }
        } else {
          return { text: `${comparisons[minDistIdx]?.name || 'The former'} is slightly closer`, icon: '🔼' }
        }
      
      default:
        return null
    }
  }

  // Generate Quick Verdict
  function generateQuickVerdict(): string[] {
    if (comparisons.length < 2) return []
    
    const verdicts: string[] = []
    
    comparisons.forEach((c, idx) => {
      const price = c.summary?.median_price_12m
      const psm = c.summary?.median_psm_12m
      const lease = c.summary?.median_lease_years_12m
      const txCount = c.summary?.tx_12m || 0
      const mrtStations = c.access?.mrt_station_count || 0
      const mrtDistance = c.access?.avg_distance_to_mrt
      
      const features: string[] = []
      
      // Price analysis
      const otherPrices = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_price_12m).filter(p => p !== null && p !== undefined) as number[]
      if (price && otherPrices.length > 0) {
        const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
        const priceDiffPercent = ((price - avgOtherPrice) / avgOtherPrice) * 100
        if (priceDiffPercent > 30) {
          features.push('Substantially higher price')
        } else if (priceDiffPercent > 15) {
          features.push('Clearly higher price')
        } else if (priceDiffPercent > 0) {
          features.push('Higher price')
        } else if (priceDiffPercent < -30) {
          features.push('Substantially lower price')
        } else if (priceDiffPercent < -15) {
          features.push('Clearly lower price')
        } else if (priceDiffPercent < 0) {
          features.push('Lower price')
        }
      }
      
      // Lease analysis
      const otherLeases = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_lease_years_12m).filter(l => l !== null && l !== undefined) as number[]
      if (lease && otherLeases.length > 0) {
        const avgOtherLease = otherLeases.reduce((a, b) => a + b, 0) / otherLeases.length
        if (lease > avgOtherLease + 5) {
          features.push('Longer lease')
        } else if (lease < avgOtherLease - 5) {
          features.push('Shorter lease')
        }
      }
      
      // MRT analysis
      const otherStations = comparisons.filter((_, i) => i !== idx).map(c => c.access?.mrt_station_count || 0)
      if (mrtStations > 0 && otherStations.every(s => s === 0)) {
        features.push('Has MRT coverage')
      } else if (mrtStations === 0 && otherStations.some(s => s > 0)) {
        features.push('No MRT coverage')
      }
      
      // Market activity
      const otherTxCounts = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.tx_12m || 0)
      if (txCount > 0 && otherTxCounts.length > 0) {
        const avgOtherTx = otherTxCounts.reduce((a, b) => a + b, 0) / otherTxCounts.length
        if (txCount > avgOtherTx * 1.3) {
          features.push('More active market')
        } else if (txCount < avgOtherTx * 0.7) {
          features.push('Quieter market')
        }
      }
      
      // Character description
      let character = ''
      if (price && otherPrices.length > 0) {
        const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
        if (price > avgOtherPrice * 1.15 && mrtStations > 0) {
          character = 'Mature, central area'
        } else if (price < avgOtherPrice * 0.85) {
          character = 'More value-oriented'
        }
      }
      
      if (features.length > 0 || character) {
        const desc = features.length > 0 ? features.join(', ') : ''
        const fullDesc = character ? (desc ? `${desc}, ${character}` : character) : desc
        verdicts.push(`${c.name}: ${fullDesc}`)
      }
    })
    
    return verdicts
  }

  const whoIsThisFor = generateWhoIsThisFor()

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Compare Neighbourhoods</h1>
          <p className="text-gray-600 mb-6">
            Select neighbourhoods to compare from the list page, or add IDs to the URL:
          </p>
          <code className="block bg-gray-100 p-3 rounded mb-6 text-sm">
            /compare?ids=neighbourhood-id-1,neighbourhood-id-2
          </code>
          <Link
            href="/neighbourhoods"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Neighbourhoods
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/neighbourhoods" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Neighbourhoods
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Neighbourhoods</h1>
              <p className="text-gray-600">Side-by-side comparison of {comparisons.length} neighbourhood{comparisons.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-4">
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="3 ROOM">3 ROOM</option>
                <option value="4 ROOM">4 ROOM</option>
                <option value="5 ROOM">5 ROOM</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
              </select>
              <select
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading comparison...</p>
          </div>
        )}

        {/* Comparison Table */}
        {!loading && !error && comparisons.length > 0 && (
          <>
            {/* Quick Verdict */}
            {comparisons.length >= 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Quick verdict ({flatType}, {months}m)
                </h2>
                <div className="space-y-2">
                  {generateQuickVerdict().map((verdict, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {idx === 0 ? '💰' : idx === 1 ? '🏠' : '🏘️'} {verdict}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary Comparison</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                    {comparisons.map((c, i) => (
                      <th key={c.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {c.name}
                        {c.planning_area && (
                          <div className="text-xs text-gray-400 mt-1">{c.planning_area.name}</div>
                        )}
                      </th>
                    ))}
                    {comparisons.length >= 2 && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conclusion</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Transactions (12m)</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.tx_12m ? c.summary.tx_12m.toLocaleString() : 'N/A'}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Transactions (12m)', comparisons.map(c => c.summary?.tx_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {verdict ? <span>{verdict.icon} {verdict.text}</span> : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Median Price</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(c.summary?.median_price_12m ?? null)}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Median Price', comparisons.map(c => c.summary?.median_price_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {verdict ? <span>{verdict.icon} {verdict.text}</span> : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Price per sqm</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.median_psm_12m ? `$${Math.round(c.summary.median_psm_12m).toLocaleString()}` : 'N/A'}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Price per sqm', comparisons.map(c => c.summary?.median_psm_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {verdict ? <span>{verdict.icon} {verdict.text}</span> : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Median Lease (years)</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.median_lease_years_12m ? `${c.summary.median_lease_years_12m.toFixed(1)}` : 'N/A'}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Median Lease (years)', comparisons.map(c => c.summary?.median_lease_years_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {verdict ? <span>{verdict.icon} {verdict.text}</span> : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Nearest MRT (typical)</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {getMRTConvenienceDescription(c)}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Distance to MRT', comparisons.map(c => c.access?.avg_distance_to_mrt ?? null))
                      return (
                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                          {verdict ? <span>{verdict.icon} {verdict.text}</span> : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Public transport convenience</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {getPublicTransportConvenience(c)}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (
                      <td className="px-4 py-3 text-sm text-gray-600 italic">—</td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Who is this neighbourhood for */}
            {whoIsThisFor.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Who is this neighbourhood for?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {whoIsThisFor.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{item.name}</h3>
                      {item.pros.length > 0 && (
                        <div className="mb-3">
                          {item.pros.map((pro, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1.5">
                              <span className="text-green-600 mt-0.5">✔️</span>
                              <span>{pro}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.cons.length > 0 && (
                        <div className="mb-3">
                          {item.cons.map((con, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1.5">
                              <span className="text-red-600 mt-0.5">❌</span>
                              <span>{con}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/neighbourhood/${item.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 pt-3 border-t border-gray-200"
                      >
                        View details →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}

