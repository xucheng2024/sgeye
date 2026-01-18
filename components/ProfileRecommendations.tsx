/**
 * Profile-Based Recommendations Component
 * Shows neighbourhood recommendations based on user's decision profile
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { calculateDecisionProfile, getProfileDisplay, type DecisionProfileType } from '@/lib/decision-profile'
import { 
  getRecommendationsForCompare, 
  getProfileFitReasons,
  type NeighbourhoodForRecommendation 
} from '@/lib/recommendations'

interface ProfileRecommendationsProps {
  variant: 'compare' | 'detail'
  currentNeighbourhoods?: NeighbourhoodForRecommendation[]
  currentNeighbourhood?: NeighbourhoodForRecommendation
  className?: string
}

export function ProfileRecommendationsForCompare({ 
  currentNeighbourhoods = [], 
  className = '' 
}: { currentNeighbourhoods: NeighbourhoodForRecommendation[], className?: string }) {
  const [recommendations, setRecommendations] = useState<NeighbourhoodForRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecommendations() {
      if (currentNeighbourhoods.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Fetch all neighbourhoods for recommendations
        const res = await fetch('/api/neighbourhoods?limit=200')
        const data = await res.json()
        
        if (res.ok && data.neighbourhoods) {
          const recommended = getRecommendationsForCompare(
            currentNeighbourhoods,
            data.neighbourhoods,
            3
          )
          setRecommendations(recommended)
        }
      } catch (error) {
        console.error('Error loading recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [currentNeighbourhoods])

  const profile = calculateDecisionProfile()
  if (!profile || recommendations.length === 0) return null

  const display = getProfileDisplay(profile.type)

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-2 mb-4">
        <span className="text-2xl">{display.emoji}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Based on your profile ({display.name})
          </h3>
          <p className="text-sm text-gray-700">
            Families like you often also consider:
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-sm text-gray-600">Loading recommendations...</div>
      ) : (
        <ul className="space-y-2">
          {recommendations.map(nbhd => (
            <li key={nbhd.id} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
              <Link
                href={`/neighbourhood/${nbhd.id}`}
                className="text-base font-medium text-blue-700 hover:text-blue-900 flex items-center gap-2"
              >
                {nbhd.name}
                {nbhd.planning_area && (
                  <span className="text-xs text-gray-500">({nbhd.planning_area.name})</span>
                )}
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ProfileFitReasons({ 
  neighbourhood, 
  className = '' 
}: { 
  neighbourhood: NeighbourhoodForRecommendation, 
  className?: string 
}) {
  const profile = calculateDecisionProfile()
  if (!profile) return null

  const display = getProfileDisplay(profile.type)
  const reasons = getProfileFitReasons(neighbourhood, profile.type)

  if (reasons.length === 0) return null

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{display.emoji}</span>
        <h3 className="text-base font-semibold text-gray-900">
          Why this fits your profile
        </h3>
      </div>
      <ul className="space-y-1.5">
        {reasons.map((reason, idx) => (
          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

