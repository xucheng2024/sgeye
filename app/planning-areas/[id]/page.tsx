/**
 * Planning Area Detail Page
 * Route: /planning-areas/:id
 * 
 * Shows neighbourhoods within a specific planning area
 * This is a browsing view - no sorting, no comparison metrics
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

interface Neighbourhood {
  id: string
  name: string
  one_liner: string | null
}

interface PlanningArea {
  id: string
  name: string
}

function PlanningAreaDetailContent() {
  const params = useParams()
  const planningAreaId = params.id as string

  const [planningArea, setPlanningArea] = useState<PlanningArea | null>(null)
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (planningAreaId) {
      loadData()
    }
  }, [planningAreaId])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      // Load planning area info
      const paRes = await fetch('/api/planning-areas')
      const paData = await paRes.json()
      const pa = paData.planning_areas?.find((p: PlanningArea) => p.id === planningAreaId)
      setPlanningArea(pa || null)

      // Load neighbourhoods in this planning area
      const nbhdRes = await fetch(`/api/neighbourhoods?planning_area_id=${planningAreaId}&limit=500`)
      const nbhdData = await nbhdRes.json()
      
      if (!nbhdRes.ok) {
        throw new Error(nbhdData.error || 'Failed to load neighbourhoods')
      }
      
      setNeighbourhoods(nbhdData.neighbourhoods || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/planning-areas" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Planning Areas
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {planningArea?.name || 'Planning Area'}
            </h1>
          </div>
          <p className="text-gray-600">Neighbourhoods in this planning area</p>
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

        {/* Neighbourhoods List */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {neighbourhoods.length} neighbourhood{neighbourhoods.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {neighbourhoods.map(neighbourhood => (
                <Link
                  key={neighbourhood.id}
                  href={`/neighbourhood/${neighbourhood.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{neighbourhood.name}</h3>
                  {neighbourhood.one_liner && (
                    <p className="text-sm text-gray-600 line-clamp-2">{neighbourhood.one_liner}</p>
                  )}
                </Link>
              ))}
            </div>
            {neighbourhoods.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No neighbourhoods found in this planning area.</p>
              </div>
            )}
          </>
        )}

        {/* Note */}
        {!loading && !error && neighbourhoods.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a browsing view. To compare neighbourhoods by price, transactions, and other metrics, use the{' '}
              <Link href="/neighbourhoods" className="underline font-semibold">Explore Neighbourhoods</Link> page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlanningAreaDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlanningAreaDetailContent />
    </Suspense>
  )
}

