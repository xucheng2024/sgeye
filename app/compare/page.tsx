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

  // Get MRT coverage tier (for structural comparison)
  function getMRTCoverage(c: NeighbourhoodComparison): string {
    const stationCount = c.access?.mrt_station_count || 0
    if (stationCount === 0) return 'None'
    if (stationCount === 1) return 'Single-line'
    return 'Multi-line'
  }

  // Get walkability tier (for structural comparison)
  function getWalkability(c: NeighbourhoodComparison): string {
    const stationCount = c.access?.mrt_station_count || 0
    const distance = c.access?.avg_distance_to_mrt
    
    if (stationCount > 0) {
      // Has MRT stations in area
      if (distance && distance <= 500) {
        return '≤500m'
      } else if (distance && distance <= 1000) {
        return '500–1000m'
      } else {
        return '1000m+'
      }
    } else {
      // No MRT in area
      if (distance && distance <= 1000) {
        return '500–1000m'
      } else {
        return 'Bus-dependent'
      }
    }
  }

  // Get transport tier (for structural comparison)
  function getTransportTier(c: NeighbourhoodComparison): string {
    const stationCount = c.access?.mrt_station_count || 0
    const distance = c.access?.avg_distance_to_mrt
    const accessType = c.access?.mrt_access_type
    
    if (stationCount >= 2 || accessType === 'high') {
      return 'Rail-accessible'
    } else if (stationCount === 1 || (distance && distance <= 1000)) {
      return 'Feeder-dependent'
    } else {
      return 'Bus-first'
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
      let personaHeadline = ''
      
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
          personaHeadline = 'Better for first-time buyers and long-term holding'
        } else if (price > avgOtherPrice * 1.15) {
          pros.push('Accepts higher unit price')
          cons.push('Budget-sensitive buyer')
          if (mrtStations > 0) {
            personaHeadline = 'Better if you prioritise location over price'
          }
        }
      }
      
      // Transport convenience analysis
      if (mrtStations > 0 || (mrtDistance && mrtDistance <= 500)) {
        pros.push('Prioritises MRT accessibility')
        if (!personaHeadline && price && otherPrices.length > 0) {
          const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
          if (price > avgOtherPrice * 1.15) {
            personaHeadline = 'Better if you prioritise location over price'
          }
        }
      } else if (mrtDistance && mrtDistance > 1500) {
        cons.push('Relies on bus or driving')
      }
      
      // Lease analysis
      if (lease && otherLeases.length > 0) {
        const avgOtherLease = otherLeases.reduce((a, b) => a + b, 0) / otherLeases.length
        if (lease > avgOtherLease + 5) {
          pros.push('Long-term holding')
          if (!personaHeadline) {
            personaHeadline = 'Better for first-time buyers and long-term holding'
          }
        }
      }
      
      // Market activity
      if (txCount > 100) {
        pros.push('Active resale market')
      } else if (txCount < 50) {
        cons.push('Limited recent resale activity')
      }
      
      // Default persona if none set
      if (!personaHeadline) {
        personaHeadline = 'Better for families seeking balanced trade-offs'
      }
      
      return {
        id: c.id,
        name: c.name,
        personaHeadline,
        pros,
        cons
      }
    })
  }

  // Generate verdict for each metric row - returns icon+keyword for display, full text for tooltip
  function getMetricVerdict(metric: string, rawValues: (number | null | string)[]): { display: string; tooltip: string; icon: string } | null {
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
        if (maxTx === minTx) return { display: '≈ Similar', tooltip: 'Similar transaction volume', icon: '≈' }
        const maxTxIdx = numericValues.indexOf(maxTx)
        const txDiffPercent = ((maxTx - minTx) / minTx) * 100
        if (txDiffPercent > 50) {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxTxIdx]?.name || 'The former'} is clearly more active`, icon: '🔺' }
        } else if (txDiffPercent > 20) {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxTxIdx]?.name || 'The former'} is more active`, icon: '🔺' }
        } else {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxTxIdx]?.name || 'The former'} is slightly more active`, icon: '🔺' }
        }
      
      case 'Median Price':
      case 'Price per sqm':
        const maxPrice = Math.max(...numericValues)
        const minPrice = Math.min(...numericValues)
        const diffPercent = ((maxPrice - minPrice) / minPrice) * 100
        if (diffPercent < 5) return { display: '≈ Similar', tooltip: 'Similar price', icon: '≈' }
        const maxPriceIdx = numericValues.indexOf(maxPrice)
        if (diffPercent > 30) {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxPriceIdx]?.name || 'The former'} is substantially higher`, icon: '🔺' }
        } else if (diffPercent > 15) {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxPriceIdx]?.name || 'The former'} is clearly higher`, icon: '🔺' }
        } else {
          return { display: '🔺 Higher', tooltip: `${comparisons[maxPriceIdx]?.name || 'The former'} is higher`, icon: '🔺' }
        }
      
      case 'Median Lease (years)':
        const maxLease = Math.max(...numericValues)
        const minLease = Math.min(...numericValues)
        const leaseDiff = maxLease - minLease
        if (leaseDiff < 2) return { display: '≈ Similar', tooltip: 'Similar remaining lease', icon: '≈' }
        const maxLeaseIdx = numericValues.indexOf(maxLease)
        if (leaseDiff > 10) {
          return { display: '✓ Longer lease', tooltip: `${comparisons[maxLeaseIdx]?.name || 'The former'} has substantially longer lease`, icon: '✓' }
        } else if (leaseDiff > 5) {
          return { display: '✓ Longer lease', tooltip: `${comparisons[maxLeaseIdx]?.name || 'The former'} has longer lease`, icon: '✓' }
        } else {
          return { display: '✓ Longer lease', tooltip: `${comparisons[maxLeaseIdx]?.name || 'The former'} has slightly longer lease`, icon: '✓' }
        }
      
      case 'MRT Stations':
        const maxStations = Math.max(...numericValues)
        const minStations = Math.min(...numericValues)
        if (maxStations === minStations) return { display: '≈ Similar', tooltip: 'Same MRT coverage', icon: '≈' }
        const maxStationsIdx = numericValues.indexOf(maxStations)
        return { display: '🔺 More', tooltip: `${comparisons[maxStationsIdx]?.name || 'The former'} has more MRT stations`, icon: '🔺' }
      
      case 'Distance to MRT':
        const minDist = Math.min(...numericValues)
        const maxDist = Math.max(...numericValues)
        if (Math.abs(maxDist - minDist) < 100) return { display: '≈ Similar', tooltip: 'Similar distance to MRT', icon: '≈' }
        const minDistIdx = numericValues.indexOf(minDist)
        const distDiffPercent = ((maxDist - minDist) / minDist) * 100
        if (distDiffPercent > 50) {
          return { display: '🔻 Closer', tooltip: `${comparisons[minDistIdx]?.name || 'The former'} is substantially closer`, icon: '🔻' }
        } else if (distDiffPercent > 20) {
          return { display: '🔻 Closer', tooltip: `${comparisons[minDistIdx]?.name || 'The former'} is closer`, icon: '🔻' }
        } else {
          return { display: '🔻 Closer', tooltip: `${comparisons[minDistIdx]?.name || 'The former'} is slightly closer`, icon: '🔻' }
        }
      
      default:
        return null
    }
  }

  // Generate Quick Verdict - returns human-readable conclusion + supporting facts
  function generateQuickVerdict(): { conclusion: string; facts: string[] } | null {
    if (comparisons.length < 2) return null
    
    const c1 = comparisons[0]
    const c2 = comparisons[1]
    
    const price1 = c1.summary?.median_price_12m
    const price2 = c2.summary?.median_price_12m
    const psm1 = c1.summary?.median_psm_12m
    const psm2 = c2.summary?.median_psm_12m
    const lease1 = c1.summary?.median_lease_years_12m
    const lease2 = c2.summary?.median_lease_years_12m
    const mrtStations1 = c1.access?.mrt_station_count || 0
    const mrtStations2 = c2.access?.mrt_station_count || 0
    
    const facts: string[] = []
    let conclusion = ''
    
    // Determine primary trade-off
    if (price1 && price2 && lease1 && lease2) {
      const priceDiff = ((price1 - price2) / price2) * 100
      const leaseDiff = lease1 - lease2
      
      // Budget + long-term value focus (c1 cheaper and longer lease)
      if (priceDiff < -15 && leaseDiff > 5) {
        conclusion = `If budget and long-term value matter more, ${c1.name.toUpperCase()} is the safer choice.`
        facts.push(`${c1.name} has lower price and longer remaining lease`)
        if (priceDiff < -30) facts.push(`Substantially lower entry cost`)
        if (leaseDiff > 10) facts.push(`Significantly longer lease provides more flexibility`)
      }
      // Budget + long-term value focus (c2 cheaper and longer lease)
      else if (priceDiff > 15 && leaseDiff < -5) {
        conclusion = `If budget and long-term value matter more, ${c2.name.toUpperCase()} is the safer choice.`
        facts.push(`${c2.name} has lower price and longer remaining lease`)
        if (priceDiff > 30) facts.push(`Substantially lower entry cost`)
        if (leaseDiff < -10) facts.push(`Significantly longer lease provides more flexibility`)
      }
      // Location + price premium (c1 more expensive but better location)
      else if (priceDiff > 15 && mrtStations1 > mrtStations2) {
        conclusion = `If you prioritise location and are comfortable paying more per sqm, ${c1.name.toUpperCase()} may suit you better.`
        facts.push(`${c1.name} offers better MRT access`)
        if (psm1 && psm2 && psm1 > psm2) facts.push(`Higher price per sqm reflects location premium`)
      }
      // Location + price premium (c2 more expensive but better location)
      else if (priceDiff < -15 && mrtStations2 > mrtStations1) {
        conclusion = `If you prioritise location and are comfortable paying more per sqm, ${c2.name.toUpperCase()} may suit you better.`
        facts.push(`${c2.name} offers better MRT access`)
        if (psm2 && psm1 && psm2 > psm1) facts.push(`Higher price per sqm reflects location premium`)
      }
      // Balanced comparison
      else {
        if (priceDiff < -15) {
          conclusion = `${c1.name.toUpperCase()} offers better value, while ${c2.name.toUpperCase()} may have other advantages.`
          facts.push(`${c1.name} has lower price`)
        } else if (priceDiff > 15) {
          conclusion = `${c2.name.toUpperCase()} offers better value, while ${c1.name.toUpperCase()} may have other advantages.`
          facts.push(`${c2.name} has lower price`)
        } else {
          conclusion = `Both neighbourhoods are similar in price, with different trade-offs to consider.`
        }
      }
    } else if (price1 && price2) {
      // Only price data available
      const priceDiff = ((price1 - price2) / price2) * 100
      if (priceDiff < -15) {
        conclusion = `${c1.name.toUpperCase()} offers better value, while ${c2.name.toUpperCase()} may have other advantages.`
        facts.push(`${c1.name} has lower price`)
      } else if (priceDiff > 15) {
        conclusion = `${c2.name.toUpperCase()} offers better value, while ${c1.name.toUpperCase()} may have other advantages.`
        facts.push(`${c2.name} has lower price`)
      } else {
        conclusion = `Both neighbourhoods are similar in price, with different trade-offs to consider.`
      }
    }
    
    // Add supporting facts
    if (lease1 && lease2) {
      const leaseDiff = lease1 - lease2
      if (Math.abs(leaseDiff) > 5) {
        if (leaseDiff > 0) {
          facts.push(`${c1.name} has ${leaseDiff.toFixed(0)} more years of remaining lease`)
        } else {
          facts.push(`${c2.name} has ${Math.abs(leaseDiff).toFixed(0)} more years of remaining lease`)
        }
      }
    }
    
    if (mrtStations1 !== mrtStations2) {
      if (mrtStations1 > mrtStations2) {
        facts.push(`${c1.name} has better MRT coverage`)
      } else {
        facts.push(`${c2.name} has better MRT coverage`)
      }
    }
    
    return conclusion ? { conclusion, facts } : null
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
            {comparisons.length >= 2 && (() => {
              const verdict = generateQuickVerdict()
              if (!verdict) return null
              
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Quick verdict ({flatType}, {months}m)
                  </h2>
                  <p className="text-base font-medium text-gray-900 mb-4">
                    {verdict.conclusion}
                  </p>
                  {verdict.facts.length > 0 && (
                    <div className="space-y-1.5">
                      {verdict.facts.map((fact, idx) => (
                        <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

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
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <div className="relative group inline-block">
                              <span className="font-medium text-gray-700 cursor-help">{verdict.display}</span>
                              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {verdict.tooltip}
                              </div>
                            </div>
                          ) : ''}
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
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <div className="relative group inline-block">
                              <span className="font-medium text-gray-700 cursor-help">{verdict.display}</span>
                              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {verdict.tooltip}
                              </div>
                            </div>
                          ) : ''}
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
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <div className="relative group inline-block">
                              <span className="font-medium text-gray-700 cursor-help">{verdict.display}</span>
                              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {verdict.tooltip}
                              </div>
                            </div>
                          ) : ''}
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
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <div className="relative group inline-block">
                              <span className="font-medium text-gray-700 cursor-help">{verdict.display}</span>
                              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {verdict.tooltip}
                              </div>
                            </div>
                          ) : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  {(() => {
                    // Only show transport rows if there's a meaningful difference
                    const mrtDescriptions = comparisons.map(c => getMRTConvenienceDescription(c))
                    const transportConvenience = comparisons.map(c => getPublicTransportConvenience(c))
                    const allMrtSame = mrtDescriptions.every(d => d === mrtDescriptions[0])
                    const allTransportSame = transportConvenience.every(t => t === transportConvenience[0])
                    
                    // If both are the same, don't show transport rows
                    if (allMrtSame && allTransportSame) {
                      return null
                    }
                    
                    // If only one is different, merge into one row
                    if (allMrtSame && !allTransportSame) {
                      return (
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">Transport access</td>
                          {comparisons.map(c => (
                            <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                              {getPublicTransportConvenience(c)}
                            </td>
                          ))}
                          {comparisons.length >= 2 && (
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-gray-700">≈ Similar</span>
                            </td>
                          )}
                        </tr>
                      )
                    }
                    
                    // Show both rows if MRT differs
                    return (
                      <>
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
                              <td className="px-4 py-3 text-sm">
                                {verdict ? (
                                  <div className="relative group inline-block">
                                    <span className="font-medium text-gray-700 cursor-help">{verdict.display}</span>
                                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                      {verdict.tooltip}
                                    </div>
                                  </div>
                                ) : <span className="font-medium text-gray-700">≈ Similar</span>}
                              </td>
                            )
                          })()}
                        </tr>
                        {!allTransportSame && (
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">Public transport convenience</td>
                            {comparisons.map(c => (
                              <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                                {getPublicTransportConvenience(c)}
                              </td>
                            ))}
                            {comparisons.length >= 2 && (
                              <td className="px-4 py-3 text-sm">
                                <span className="font-medium text-gray-700">—</span>
                              </td>
                            )}
                          </tr>
                        )}
                      </>
                    )
                  })()}
                </tbody>
              </table>
            </div>

            {/* Transport Accessibility (Structural) */}
            {comparisons.length >= 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Transport accessibility (structural)
                </h2>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      {comparisons.map((c, i) => (
                        <th key={c.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {c.name}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conclusion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">MRT coverage</td>
                      {comparisons.map(c => (
                        <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                          {getMRTCoverage(c)}
                        </td>
                      ))}
                      {(() => {
                        const coverages = comparisons.map(c => getMRTCoverage(c))
                        if (coverages[0] === coverages[1]) {
                          return <td className="px-4 py-3 text-sm text-gray-600">Similar</td>
                        }
                        const multiLineIdx = coverages.findIndex(c => c === 'Multi-line')
                        const singleLineIdx = coverages.findIndex(c => c === 'Single-line')
                        if (multiLineIdx >= 0 && coverages[1 - multiLineIdx] !== 'Multi-line') {
                          return <td className="px-4 py-3 text-sm text-gray-600">{comparisons[multiLineIdx].name} has broader access</td>
                        } else if (singleLineIdx >= 0 && coverages[1 - singleLineIdx] === 'None') {
                          return <td className="px-4 py-3 text-sm text-gray-600">{comparisons[singleLineIdx].name} has MRT access</td>
                        }
                        return <td className="px-4 py-3 text-sm text-gray-600">Different coverage</td>
                      })()}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Walkability to MRT</td>
                      {comparisons.map(c => (
                        <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                          {getWalkability(c)}
                        </td>
                      ))}
                      {(() => {
                        const walkabilities = comparisons.map(c => getWalkability(c))
                        if (walkabilities[0] === walkabilities[1]) {
                          return <td className="px-4 py-3 text-sm text-gray-600">Similar</td>
                        }
                        const betterIdx = walkabilities.findIndex(w => w === '≤500m')
                        if (betterIdx >= 0) {
                          return <td className="px-4 py-3 text-sm text-gray-600">{comparisons[betterIdx].name} more walkable</td>
                        }
                        return <td className="px-4 py-3 text-sm text-gray-600">Different walkability</td>
                      })()}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Transport tier</td>
                      {comparisons.map(c => (
                        <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                          {getTransportTier(c)}
                        </td>
                      ))}
                      {(() => {
                        const tiers = comparisons.map(c => getTransportTier(c))
                        if (tiers[0] === tiers[1]) {
                          return <td className="px-4 py-3 text-sm text-gray-600">Similar tier</td>
                        }
                        const railIdx = tiers.findIndex(t => t === 'Rail-accessible')
                        if (railIdx >= 0) {
                          return <td className="px-4 py-3 text-sm text-gray-600">{comparisons[railIdx].name} more rail-accessible</td>
                        }
                        return <td className="px-4 py-3 text-sm text-gray-600">Different experience</td>
                      })()}
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const tier1 = getTransportTier(comparisons[0])
                      const tier2 = getTransportTier(comparisons[1])
                      const coverage1 = getMRTCoverage(comparisons[0])
                      const coverage2 = getMRTCoverage(comparisons[1])
                      
                      if (tier1 === tier2 && coverage1 === coverage2) {
                        return `Both areas have similar transport accessibility. This may affect daily commute convenience over time.`
                      } else {
                        const getDesc = (tier: string, name: string) => {
                          if (tier === 'Bus-first') return `${name}: Mostly bus-dependent, limited MRT access`
                          if (tier === 'Feeder-dependent') return `${name}: Feeder-dependent, single MRT line`
                          return `${name}: Rail-accessible, multiple lines nearby`
                        }
                        return `${getDesc(tier1, comparisons[0].name)}. ${getDesc(tier2, comparisons[1].name)}. → This may affect daily commute convenience over time.`
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}

            {/* Who is this neighbourhood for */}
            {whoIsThisFor.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Who is this neighbourhood for?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {whoIsThisFor.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm font-medium text-gray-700 mb-3">{item.personaHeadline}</p>
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

            {/* Next dimension: School considerations */}
            {comparisons.length >= 2 && (() => {
              const planningAreas = comparisons
                .map(c => c.planning_area?.name)
                .filter((name): name is string => name !== null && name !== undefined)
                .filter((name, index, self) => self.indexOf(name) === index) // unique
              
              if (planningAreas.length < 2) return null
              
              const compareUrl = `/family/psle-school?compare=${planningAreas.slice(0, 2).join(',')}`
              
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Next: School considerations
                  </h2>
                  <p className="text-sm text-gray-700 mb-4">
                    Housing trade-offs are only part of the decision. School competition differs by planning area and can significantly affect family experience.
                  </p>
                  <Link
                    href={compareUrl}
                    className="inline-flex items-center gap-2 text-base font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    Compare school pressure for these areas →
                  </Link>
                </div>
              )
            })()}
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

