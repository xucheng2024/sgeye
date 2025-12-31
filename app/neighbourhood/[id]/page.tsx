/**
 * Neighbourhood Detail Page
 * Route: /neighbourhood/:id
 * 
 * Displays detailed information about a neighbourhood
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, TrendingUp, Home, Train, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const id = params.id as string
  
  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood | null>(null)
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flatType, setFlatType] = useState<string>('4 ROOM')

  useEffect(() => {
    if (id) {
      loadNeighbourhood()
      loadTrends()
    }
  }, [id, flatType])

  async function loadNeighbourhood() {
    try {
      const res = await fetch(`/api/neighbourhoods/${id}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhood')
      }
      
      setNeighbourhood(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load neighbourhood')
      console.error('Error loading neighbourhood:', err)
    } finally {
      setLoading(false)
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
          <Link href="/neighbourhoods" className="text-blue-600 hover:text-blue-700">
            ← Back to Neighbourhoods
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{neighbourhood.name}</h1>
              {neighbourhood.one_liner && (
                <p className="text-gray-600 mb-2">{neighbourhood.one_liner}</p>
              )}
              {neighbourhood.planning_area && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{neighbourhood.planning_area.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {neighbourhood.summary && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-600">Transactions (12m)</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{neighbourhood.summary.tx_12m.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-600">Median Price</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(neighbourhood.summary.median_price_12m)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-600">Price per sqm</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {neighbourhood.summary.median_psm_12m ? `$${Math.round(neighbourhood.summary.median_psm_12m).toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-medium text-gray-600">Median Lease</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {neighbourhood.summary.median_lease_years_12m ? `${neighbourhood.summary.median_lease_years_12m.toFixed(1)} years` : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* MRT Access */}
        {neighbourhood.access && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Train className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">MRT Access</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stations</p>
                <p className="text-lg font-semibold">{neighbourhood.access.mrt_station_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Access Type</p>
                <p className="text-lg font-semibold">{getMRTAccessLabel(neighbourhood.access.mrt_access_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Distance to Nearest</p>
                <p className="text-lg font-semibold">{formatDistance(neighbourhood.access.avg_distance_to_mrt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Price Trends (24 months)</h2>
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
          </div>
          {chartData.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 text-center py-8">No trend data available</p>
          )}
        </div>

        {/* Compare CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Want to compare this neighbourhood with others?</p>
          <Link
            href={`/compare?ids=${id}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Compare Neighbourhoods
          </Link>
        </div>
      </div>
    </div>
  )
}

