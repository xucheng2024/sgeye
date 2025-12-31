/**
 * Neighbourhood List Page
 * Route: /neighbourhoods
 * 
 * Displays list of neighbourhoods with summary and access data
 * Supports filtering by planning_area_id
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, TrendingUp, Home, Train } from 'lucide-react'

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

interface PlanningArea {
  id: string
  name: string
}

function NeighbourhoodsPageContent() {
  const searchParams = useSearchParams()
  const planningAreaId = searchParams.get('planning_area_id')
  
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([])
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [selectedPlanningArea, setSelectedPlanningArea] = useState<string>(planningAreaId || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlanningAreas()
  }, [])

  useEffect(() => {
    loadNeighbourhoods()
  }, [selectedPlanningArea])

  async function loadPlanningAreas() {
    try {
      const res = await fetch('/api/planning-areas')
      const data = await res.json()
      setPlanningAreas(data.planning_areas || [])
    } catch (err) {
      console.error('Error loading planning areas:', err)
    }
  }

  async function loadNeighbourhoods() {
    setLoading(true)
    setError(null)
    try {
      const url = selectedPlanningArea
        ? `/api/neighbourhoods?planning_area_id=${selectedPlanningArea}`
        : '/api/neighbourhoods'
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhoods')
      }
      
      setNeighbourhoods(data.neighbourhoods || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load neighbourhoods')
      console.error('Error loading neighbourhoods:', err)
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

  function getMRTAccessLabel(type: string | null): string {
    const labels: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: 'None'
    }
    return labels[type || 'none'] || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Neighbourhoods</h1>
          <p className="text-gray-600">Compare neighbourhoods by price, transactions, lease, and MRT access</p>
        </div>

        {/* Planning Area Filter */}
        <div className="mb-6">
          <label htmlFor="planning-area" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Planning Area (optional)
          </label>
          <select
            id="planning-area"
            value={selectedPlanningArea}
            onChange={(e) => {
              setSelectedPlanningArea(e.target.value)
              const url = new URL(window.location.href)
              if (e.target.value) {
                url.searchParams.set('planning_area_id', e.target.value)
              } else {
                url.searchParams.delete('planning_area_id')
              }
              window.history.pushState({}, '', url.toString())
            }}
            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Planning Areas</option>
            {planningAreas.map(pa => (
              <option key={pa.id} value={pa.id}>{pa.name}</option>
            ))}
          </select>
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
            <p className="mt-2 text-gray-600">Loading neighbourhoods...</p>
          </div>
        )}

        {/* Neighbourhood List */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {neighbourhoods.length} neighbourhood{neighbourhoods.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {neighbourhoods.map(neighbourhood => (
                <Link
                  key={neighbourhood.id}
                  href={`/neighbourhood/${neighbourhood.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{neighbourhood.name}</h3>
                    {neighbourhood.planning_area && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {neighbourhood.planning_area.name}
                      </span>
                    )}
                  </div>
                  
                  {neighbourhood.one_liner && (
                    <p className="text-sm text-gray-600 mb-4">{neighbourhood.one_liner}</p>
                  )}

                  <div className="space-y-2">
                    {neighbourhood.summary && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Transactions (12m):</span>
                          <span className="font-medium">{neighbourhood.summary.tx_12m.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Median Price:</span>
                          <span className="font-medium">{formatCurrency(neighbourhood.summary.median_price_12m)}</span>
                        </div>
                        {neighbourhood.summary.median_lease_years_12m && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Lease (median):</span>
                            <span className="font-medium">{neighbourhood.summary.median_lease_years_12m.toFixed(1)} years</span>
                          </div>
                        )}
                      </>
                    )}
                    {neighbourhood.access && (
                      <div className="flex items-center gap-2 text-sm">
                        <Train className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">MRT:</span>
                        <span className="font-medium">
                          {neighbourhood.access.mrt_station_count} station{neighbourhood.access.mrt_station_count !== 1 ? 's' : ''}
                          {neighbourhood.access.avg_distance_to_mrt !== null && neighbourhood.access.avg_distance_to_mrt > 0 && (
                            <span className="text-gray-500 ml-1">
                              ({formatDistance(neighbourhood.access.avg_distance_to_mrt)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function NeighbourhoodsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NeighbourhoodsPageContent />
    </Suspense>
  )
}

