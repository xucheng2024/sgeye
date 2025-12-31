/**
 * Planning Areas List Page
 * Route: /planning-areas
 * 
 * Browse-type entry: Shows all planning areas as cards
 * User intent: "I know roughly which area, want to see what's inside"
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

interface PlanningArea {
  id: string
  name: string
}

export default function PlanningAreasPage() {
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlanningAreas()
  }, [])

  async function loadPlanningAreas() {
    try {
      const res = await fetch('/api/planning-areas')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load planning areas')
      }
      
      setPlanningAreas(data.planning_areas || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load planning areas')
      console.error('Error loading planning areas:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse by Planning Area</h1>
          <p className="text-gray-600">Explore neighbourhoods organized by planning area. This is a browsing view, not a comparison tool.</p>
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
            <p className="mt-2 text-gray-600">Loading planning areas...</p>
          </div>
        )}

        {/* Planning Areas Grid */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {planningAreas.length} planning area{planningAreas.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planningAreas.map(area => (
                <Link
                  key={area.id}
                  href={`/planning-areas/${area.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-600">View neighbourhoods in this area →</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

