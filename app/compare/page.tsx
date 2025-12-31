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
import { ArrowLeft, TrendingUp, Home, Train, Calendar, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  // Prepare comparison chart data
  const chartData = comparisons.map(c => ({
    name: c.name,
    price: c.summary?.median_price_12m || 0,
    psm: c.summary?.median_psm_12m || 0,
    lease: c.summary?.median_lease_years_12m || 0,
    transactions: c.summary?.tx_12m || 0,
    mrt_stations: c.access?.mrt_station_count || 0
  }))

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Transactions (12m)</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.tx_12m.toLocaleString() || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Median Price</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(c.summary?.median_price_12m ?? null)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Price per sqm</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.median_psm_12m ? `$${Math.round(c.summary.median_psm_12m).toLocaleString()}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Median Lease (years)</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.summary?.median_lease_years_12m ? `${c.summary.median_lease_years_12m.toFixed(1)}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">MRT Stations</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {c.access?.mrt_station_count || 0}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">MRT Access</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {getMRTAccessLabel(c.access?.mrt_access_type)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Distance to MRT</td>
                    {comparisons.map(c => (
                      <td key={c.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatDistance(c.access?.avg_distance_to_mrt ?? null)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Visual Comparison</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="price" fill="#3b82f6" name="Median Price" />
                    <Bar yAxisId="right" dataKey="mrt_stations" fill="#8b5cf6" name="MRT Stations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Individual Neighbourhood Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisons.map(c => (
                <Link
                  key={c.id}
                  href={`/neighbourhood/${c.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-600">View details →</p>
                </Link>
              ))}
            </div>
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

