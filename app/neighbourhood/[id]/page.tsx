/**
 * Neighbourhood Detail Page
 * Route: /neighbourhood/:id
 * 
 * Displays detailed information about a neighbourhood
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, TrendingUp, Home, Train, Calendar, ArrowRight, School, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import DecisionProfileDisplay from '@/components/DecisionProfile'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import { ProfileFitReasons } from '@/components/ProfileRecommendations'
import { AnalyticsEvents } from '@/lib/analytics'
import LivingDimensions from '@/components/LivingDimensions'
import { getLivingNotesForNeighbourhood } from '@/lib/neighbourhood-living-notes'

interface Neighbourhood {
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
}

interface Trend {
  month: string
  flat_type: string
  tx_count: number
  median_price: number | null
  median_psm: number | null
  median_lease_years: number | null
}

export default function NeighbourhoodDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const returnTo = searchParams.get('return_to')
  
  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood | null>(null)
  const [trends, setTrends] = useState<Trend[]>([])
  const [nearbyNeighbourhoods, setNearbyNeighbourhoods] = useState<Neighbourhood[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flatType, setFlatType] = useState<string>('4 ROOM')
  const [priceThresholds, setPriceThresholds] = useState({ p25: 550000, p50: 650000, p75: 745000 })
  const [leaseThresholds, setLeaseThresholds] = useState({ p25: 54, p50: 61, p75: 75 })

  useEffect(() => {
    if (id) {
      loadNeighbourhood()
      loadTrends()
      // Track neighbourhood detail page visit
      recordBehaviorEvent({ type: 'neighbourhood_detail', metadata: { id } })
      AnalyticsEvents.neighbourDetailView({ neighbourhoodId: id })
    }
  }, [id, flatType])

  useEffect(() => {
    // Track lease-related interactions
    if (neighbourhood?.summary?.median_lease_years_12m) {
      const lease = Number(neighbourhood.summary.median_lease_years_12m)
      if (lease < 70) {
        recordBehaviorEvent({ type: 'short_lease_warning', metadata: { lease } })
      }
      recordBehaviorEvent({ type: 'lease_view', metadata: { lease } })
    }
  }, [neighbourhood])

  useEffect(() => {
    if (neighbourhood?.planning_area?.id) {
      loadNearbyNeighbourhoods()
    }
  }, [neighbourhood?.planning_area?.id])

  async function loadNeighbourhood() {
    try {
      const res = await fetch(`/api/neighbourhoods/${id}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhood')
      }
      
      setNeighbourhood(data)
      
      // Calculate thresholds from nearby neighbourhoods (will be updated when nearby loaded)
      if (data.planning_area?.id) {
        const nearbyRes = await fetch(`/api/neighbourhoods?planning_area_id=${data.planning_area.id}&limit=50`)
        const nearbyData = await nearbyRes.json()
        if (nearbyData.neighbourhoods) {
          calculateThresholds(nearbyData.neighbourhoods)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load neighbourhood')
      console.error('Error loading neighbourhood:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadNearbyNeighbourhoods() {
    if (!neighbourhood?.planning_area?.id) return
    
    try {
      const res = await fetch(`/api/neighbourhoods?planning_area_id=${neighbourhood.planning_area.id}&limit=20`)
      const data = await res.json()
      
      if (res.ok && data.neighbourhoods) {
        // Exclude current neighbourhood
        const nearby = data.neighbourhoods.filter((n: Neighbourhood) => n.id !== id)
        setNearbyNeighbourhoods(nearby)
        calculateThresholds(data.neighbourhoods)
      }
    } catch (err) {
      console.error('Error loading nearby neighbourhoods:', err)
    }
  }

  async function loadTrends() {
    try {
      const res = await fetch(`/api/neighbourhoods/${id}/trends?flat_type=${flatType}&months=24`)
      const data = await res.json()
      
      if (res.ok && data.trends) {
        setTrends(data.trends)
      }
    } catch (err) {
      console.error('Error loading trends:', err)
    }
  }

  function calculateThresholds(neighbourhoods: Neighbourhood[]) {
    const prices = neighbourhoods
      .map(n => n.summary?.median_price_12m)
      .filter((p): p is number => p !== null && p !== undefined && !isNaN(p) && p > 0)
      .sort((a, b) => a - b)
    
    const leases = neighbourhoods
      .map(n => n.summary?.median_lease_years_12m)
      .filter((l): l is number => l !== null && l !== undefined && !isNaN(l) && l > 0)
      .sort((a, b) => a - b)
    
    if (prices.length > 0) {
      setPriceThresholds({
        p25: prices[Math.floor(prices.length * 0.25)],
        p50: prices[Math.floor(prices.length * 0.5)],
        p75: prices[Math.floor(prices.length * 0.75)]
      })
    }
    
    if (leases.length > 0) {
      setLeaseThresholds({
        p25: leases[Math.floor(leases.length * 0.25)],
        p50: leases[Math.floor(leases.length * 0.5)],
        p75: leases[Math.floor(leases.length * 0.75)]
      })
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

  function getMRTAccessLabel(distance: number | null, stationCount: number | null): string {
    if (stationCount !== null && stationCount > 0) {
      return `${stationCount} station${stationCount > 1 ? 's' : ''} in area`
    }
    if (distance !== null && distance > 0) {
      return `${formatDistance(distance)} outside area`
    }
    return 'None'
  }

  function getTransportLabel(): string {
    const mrtAccess = neighbourhood?.access?.mrt_access_type
    const mrtStationCount = neighbourhood?.access?.mrt_station_count || 0
    const mrtDistance = neighbourhood?.access?.avg_distance_to_mrt ? Number(neighbourhood.access.avg_distance_to_mrt) : null
    
    if (mrtAccess === 'high' || mrtStationCount > 0) {
      return 'Good'
    } else if (mrtAccess === 'medium' || (mrtDistance && mrtDistance > 0 && mrtDistance <= 800)) {
      return 'Moderate'
    } else if (mrtAccess === 'low' || (mrtDistance && mrtDistance > 800)) {
      return 'Limited'
    }
    return 'Limited'
  }

  function getLeaseRange(): { min: number; max: number } | null {
    if (!neighbourhood?.summary?.median_lease_years_12m) return null
    
    const currentLease = Number(neighbourhood.summary.median_lease_years_12m)
    // Estimate range: ±5 years from median
    return {
      min: Math.max(0, Math.floor(currentLease - 5)),
      max: Math.ceil(currentLease + 5)
    }
  }

  function getLeaseRiskLevel(): 'low' | 'medium' | 'high' {
    const lease = neighbourhood?.summary?.median_lease_years_12m ? Number(neighbourhood.summary.median_lease_years_12m) : null
    if (!lease) return 'medium'
    
    if (lease >= 80) return 'low'
    if (lease >= 70) return 'medium'
    return 'high'
  }

  function getMainSignal(n: Neighbourhood): { strengths: string[]; watchOuts: string[] } {
    const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
    const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
    const mrtAccess = n.access?.mrt_access_type
    const mrtDistance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
    const mrtStationCount = n.access?.mrt_station_count ? Number(n.access.mrt_station_count) : 0
    const txCount = n.summary?.tx_12m ? Number(n.summary.tx_12m) : 0
    
    const strengths: string[] = []
    const watchOuts: string[] = []
    
    // Strengths - full sentences explaining benefits
    if (lease && lease >= leaseThresholds.p75) {
      strengths.push('Long remaining lease offers long-term peace of mind')
    }
    if (price && price < priceThresholds.p25) {
      strengths.push('Lower entry price makes it more accessible')
    }
    if (mrtAccess === 'high' || mrtStationCount > 0) {
      strengths.push('Good MRT connectivity for daily commute')
    } else if (mrtDistance && mrtDistance > 0 && mrtDistance <= 800) {
      strengths.push('Walkable distance to MRT stations')
    }
    if (txCount > 100) {
      strengths.push('Active resale market with more choices')
    }
    if (trends.length > 0 && trends[trends.length - 1].median_price && trends[0].median_price) {
      const priceChange = ((Number(trends[trends.length - 1].median_price) - Number(trends[0].median_price)) / Number(trends[0].median_price)) * 100
      if (Math.abs(priceChange) < 10) {
        strengths.push('Prices have been relatively stable over the past 2 years')
      }
    }
    
    // Watch outs - full sentences explaining consequences
    if (lease && lease < leaseThresholds.p25) {
      watchOuts.push('Shorter lease may limit long-term resale')
    }
    if ((mrtAccess === 'none' || !mrtAccess) && (!mrtDistance || mrtDistance > 800)) {
      watchOuts.push('Limited MRT access may affect daily commute')
    }
    if (price && price >= priceThresholds.p75) {
      watchOuts.push('Higher price point requires careful value assessment')
    }
    if (txCount > 0 && txCount < 20) {
      watchOuts.push('Lower transaction volume means fewer resale choices')
    }
    
    return { strengths, watchOuts }
  }

  function getMarketActivityLabel(txCount: number): string {
    if (txCount > 100) return 'High'
    if (txCount > 50) return 'Moderate'
    if (txCount > 20) return 'Low–moderate'
    if (txCount > 0) return 'Low'
    return 'Very low'
  }

  function getLeaseLabel(lease: number | null): string {
    if (!lease) return 'N/A'
    if (lease >= 80) return 'Long (80+ years)'
    if (lease >= 60) return 'Medium (60–80 years)'
    return 'Short (<60 years)'
  }

  function getComparisonPoints(current: Neighbourhood, nearby: Neighbourhood[]): string[] {
    const points: string[] = []
    const currentPrice = current.summary?.median_price_12m ? Number(current.summary.median_price_12m) : null
    const currentLease = current.summary?.median_lease_years_12m ? Number(current.summary.median_lease_years_12m) : null
    const currentMRT = current.access?.mrt_station_count || 0
    
    const nearbyWithData = nearby.filter(n => n.summary || n.access)
    
    if (currentPrice && nearbyWithData.length > 0) {
      const higherPrice = nearbyWithData.filter(n => {
        const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
        return price && price > currentPrice
      })
      const lowerPrice = nearbyWithData.filter(n => {
        const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
        return price && price < currentPrice
      })
      
      if (lowerPrice.length > 0 && lowerPrice.length <= 2) {
        points.push(`Lower price than ${lowerPrice.map(n => n.name).join(' and ')}`)
      } else if (higherPrice.length > 0 && higherPrice.length <= 2) {
        points.push(`Higher price than ${higherPrice.map(n => n.name).join(' and ')}`)
      } else if (nearbyWithData.length > 0) {
        points.push(`Similar price range to nearby neighbourhoods`)
      }
    }
    
    if (currentLease && nearbyWithData.length > 0) {
      const higherLease = nearbyWithData.filter(n => {
        const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
        return lease && lease > currentLease
      })
      const lowerLease = nearbyWithData.filter(n => {
        const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
        return lease && lease < currentLease
      })
      
      if (higherLease.length > 0 && higherLease.length <= 2) {
        points.push(`Higher remaining lease than ${higherLease.map(n => n.name).join(' and ')}`)
      } else if (lowerLease.length > 0 && lowerLease.length <= 2) {
        points.push(`Lower remaining lease than ${lowerLease.map(n => n.name).join(' and ')}`)
      }
    }
    
    if (currentMRT >= 0 && nearbyWithData.length > 0) {
      const moreMRT = nearbyWithData.filter(n => (n.access?.mrt_station_count || 0) > currentMRT)
      const fewerMRT = nearbyWithData.filter(n => (n.access?.mrt_station_count || 0) < currentMRT)
      
      if (fewerMRT.length > 0 && fewerMRT.length <= 2) {
        points.push(`More MRT options than ${fewerMRT.map(n => n.name).join(' and ')}`)
      } else if (moreMRT.length > 0 && moreMRT.length <= 2) {
        points.push(`Fewer MRT options than ${moreMRT.map(n => n.name).join(' and ')}`)
      }
    }
    
    return points.slice(0, 3) // Limit to 3 points
  }

  // Prepare chart data
  const chartData = trends.map(t => ({
    month: new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    price: t.median_price,
    psm: t.median_psm,
    lease: t.median_lease_years,
    transactions: t.tx_count
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading neighbourhood...</p>
        </div>
      </div>
    )
  }

  if (error || !neighbourhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Neighbourhood not found'}</p>
          <Link href={returnTo || '/neighbourhoods'} className="text-blue-600 hover:text-blue-700">
            ← Back to Neighbourhoods
          </Link>
        </div>
      </div>
    )
  }

  const signal = getMainSignal(neighbourhood)
  const comparisonPoints = getComparisonPoints(neighbourhood, nearbyNeighbourhoods)
  const livingNotes = getLivingNotesForNeighbourhood(neighbourhood.name)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={returnTo || '/neighbourhoods'} 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {returnTo?.includes('/compare') ? 'Back to comparison' : 'Back to Neighbourhoods'}
          </Link>

          {/* Decision Profile */}
          <DecisionProfileDisplay variant="detail" className="mb-4" />

          {/* Why this fits your profile */}
          {neighbourhood && (
            <ProfileFitReasons 
              neighbourhood={{
                id: neighbourhood.id,
                name: neighbourhood.name,
                summary: neighbourhood.summary,
                access: neighbourhood.access,
                planning_area: neighbourhood.planning_area,
              }}
              className="mb-4"
            />
          )}

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{neighbourhood.name}</h1>
              {(() => {
                const price = neighbourhood.summary?.median_price_12m ? Number(neighbourhood.summary.median_price_12m) : null
                const lease = neighbourhood.summary?.median_lease_years_12m ? Number(neighbourhood.summary.median_lease_years_12m) : null
                const mrtAccess = neighbourhood.access?.mrt_access_type
                const mrtDistance = neighbourhood.access?.avg_distance_to_mrt ? Number(neighbourhood.access.avg_distance_to_mrt) : null
                const mrtStationCount = neighbourhood.access?.mrt_station_count || 0
                const hasStablePrices = signal.strengths.some(s => s.includes('stable'))
                const hasLimitedMRT = (mrtAccess === 'none' || !mrtAccess) && (!mrtDistance || mrtDistance > 800)
                const hasGoodMRT = mrtAccess === 'high' || mrtStationCount > 0
                
                let positioning = ''
                
                // Priority: price stability + MRT trade-off
                if (hasStablePrices && hasLimitedMRT) {
                  positioning = 'Best for: Buyers prioritising price stability over MRT convenience'
                } else if (price && price < priceThresholds.p25 && hasLimitedMRT) {
                  positioning = 'Best for: Buyers prioritising entry price over MRT convenience'
                } else if (lease && lease >= leaseThresholds.p75 && hasLimitedMRT) {
                  positioning = 'Best for: Buyers prioritising long lease over MRT convenience'
                } else if (hasStablePrices) {
                  positioning = 'Best for: Buyers seeking price stability'
                } else if (price && price < priceThresholds.p25) {
                  positioning = 'Best for: Buyers prioritising entry price'
                } else if (lease && lease >= leaseThresholds.p75) {
                  positioning = 'Best for: Long-term families'
                } else if (hasGoodMRT) {
                  positioning = 'Best for: Daily MRT commuters'
                } else if (mrtDistance && mrtDistance > 0 && mrtDistance <= 800) {
                  positioning = 'Best for: Buyers who can accept a longer walk to MRT'
                }
                
                return positioning ? (
                  <p className="text-sm text-gray-600 mb-2">{positioning}</p>
                ) : null
              })()}
              {neighbourhood.planning_area && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{neighbourhood.planning_area.name}</span>
                </div>
              )}
              {livingNotes && <LivingDimensions notes={livingNotes} className="mb-2" />}
            </div>
          </div>
        </div>

        {/* Module 2: Strengths & Trade-offs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {signal.strengths.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why {neighbourhood.name} works well
              </h2>
              <ul className="space-y-3">
                {signal.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {signal.watchOuts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                When {neighbourhood.name} may not fit
              </h2>
              <ul className="space-y-3">
                {signal.watchOuts.map((watchOut, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>{watchOut}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transport hint */}
        {neighbourhood.access && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Train className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Transport access: {getTransportLabel()}
                  </div>
                  {(() => {
                    const mrtAccess = neighbourhood.access?.mrt_access_type
                    const mrtDistance = neighbourhood.access?.avg_distance_to_mrt ? Number(neighbourhood.access.avg_distance_to_mrt) : null
                    if (mrtAccess === 'none' || !mrtAccess) {
                      return <div className="text-xs text-gray-600">Bus-first, limited walkable MRT</div>
                    }
                    return null
                  })()}
                </div>
              </div>
              <Link
                href="/hdb/transport"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Explore transport accessibility
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Lease context */}
        {neighbourhood.summary?.median_lease_years_12m && (() => {
          const leaseRange = getLeaseRange()
          const riskLevel = getLeaseRiskLevel()
          const lease = Number(neighbourhood.summary.median_lease_years_12m)
          
          return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className={`w-5 h-5 ${
                  riskLevel === 'high' ? 'text-red-600' : 
                  riskLevel === 'medium' ? 'text-amber-600' : 
                  'text-green-600'
                }`} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Lease context
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {leaseRange ? (
                      <>Most resale flats in {neighbourhood.name} have remaining leases between {leaseRange.min}–{leaseRange.max} years.</>
                    ) : (
                      <>Most resale flats in {neighbourhood.name} have remaining leases around {lease.toFixed(0)} years.</>
                    )}
                    {riskLevel === 'high' ? (
                      <> This may affect long-term resale value and financing options.</>
                    ) : riskLevel === 'medium' ? (
                      <> This is generally acceptable for owner-occupation, but may affect long-term resale.</>
                    ) : (
                      <> This is generally acceptable for owner-occupation and long-term resale.</>
                    )}
                  </p>
                  <Link
                    href="/hdb/lease-price"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Understand lease decay and long-term risk
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Module 3: Contextual Comparison */}
        {neighbourhood.planning_area && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compared to nearby neighbourhoods
            </h2>
            {comparisonPoints.length > 0 ? (
              <ul className="space-y-2">
                {comparisonPoints.map((point, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : nearbyNeighbourhoods.length > 0 ? (
              <p className="text-gray-500 text-sm">Similar characteristics to nearby neighbourhoods in {neighbourhood.planning_area.name}</p>
            ) : (
              <p className="text-gray-500 text-sm">Loading comparison data...</p>
            )}
          </div>
        )}

        {/* Trends Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Price Trends (24 months)</h2>
            <div className="flex items-center gap-3">
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
              <Link
                href="/hdb"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View broader market trends →
              </Link>
            </div>
          </div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3b82f6" name="Median Price" />
                </LineChart>
              </ResponsiveContainer>
              {(() => {
                const prices = chartData.map(d => d.price).filter((p): p is number => p !== null && p !== undefined)
                if (prices.length < 2) return null
                
                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)
                const priceRange = ((maxPrice - minPrice) / minPrice) * 100
                
                if (priceRange < 15) {
                  return <p className="text-sm text-gray-500 mt-4">Prices have fluctuated within a narrow range, indicating a relatively stable resale market.</p>
                } else if (priceRange < 30) {
                  return <p className="text-sm text-gray-500 mt-4">Prices show moderate fluctuations, suggesting a balanced resale market.</p>
                } else {
                  return <p className="text-sm text-gray-500 mt-4">Prices show significant variations, indicating a more volatile resale market.</p>
                }
              })()}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No trend data available</p>
          )}
        </div>

        {/* School context */}
        {neighbourhood.planning_area && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-3">
              <School className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  School considerations
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  School competition is assessed at the planning area level.
                  <br />
                  <strong>{neighbourhood.name}</strong> belongs to the <strong>{neighbourhood.planning_area.name}</strong> planning area.
                </p>
                <Link
                  href={`/family/psle-school?planning_area_id=${neighbourhood.planning_area.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View school pressure in {neighbourhood.planning_area.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Compare CTA */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Compare {neighbourhood.name} with another neighbourhood
              </h3>
              <p className="text-sm text-gray-600">
                See side-by-side trade-offs in price, lease, transport, and school pressure.
              </p>
            </div>
            <Link
              href={`/neighbourhoods?add_to_compare=${neighbourhood.id}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Compare now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
