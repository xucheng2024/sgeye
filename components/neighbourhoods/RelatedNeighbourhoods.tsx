/**
 * Related Neighbourhoods Component
 * Shows 3-6 related neighbourhoods based on planning area, price, and MRT distance
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedNeighbourhood {
  id: string
  name: string
  description: string
}

interface RelatedNeighbourhoodsProps {
  currentNeighbourhoodId: string
  planningAreaId?: string | null
  medianPrice?: number | null
  mrtDistance?: number | null
  mrtStationCount?: number | null
}

export default function RelatedNeighbourhoods({
  currentNeighbourhoodId,
  planningAreaId,
  medianPrice,
  mrtDistance,
  mrtStationCount: _mrtStationCount
}: RelatedNeighbourhoodsProps) {
  const [related, setRelated] = useState<RelatedNeighbourhood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      if (!planningAreaId) {
        setLoading(false)
        return
      }

      try {
        // Fetch neighbourhoods in the same planning area (priority 1)
        const params = new URLSearchParams()
        params.set('planning_area_id', planningAreaId)
        params.set('limit', '50')
        
        const res = await fetch(`/api/neighbourhoods?${params.toString()}`)
        const data = await res.json()
        
        if (!data.neighbourhoods) {
          setLoading(false)
          return
        }

        // Filter out current neighbourhood
        let candidates = data.neighbourhoods
          .filter((n: any) => n.id !== currentNeighbourhoodId)
          .map((n: any) => {
            const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
            const mrtDist = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
            
            // Calculate similarity scores
            let priceScore = 0
            if (price !== null && medianPrice) {
              const priceDiff = Math.abs(price - medianPrice) / medianPrice
              // Score: 1.0 = exact match, 0.0 = 20%+ difference
              priceScore = Math.max(0, 1 - (priceDiff / 0.2))
            }
            
            let mrtScore = 0
            if (mrtDist !== null && mrtDistance != null) {
              const mrtDiff = Math.abs(mrtDist - mrtDistance)
              // Score: 1.0 = exact match, 0.0 = 500m+ difference
              mrtScore = Math.max(0, 1 - (mrtDiff / 500))
            }

            return {
              ...n,
              priceScore,
              mrtScore,
              totalScore: priceScore * 0.6 + mrtScore * 0.4 // Price similarity weighted more
            }
          })

        // Sort by total similarity score (descending)
        candidates.sort((a: any, b: any) => b.totalScore - a.totalScore)

        // Get top 3-6 most similar
        const topCandidates = candidates.slice(0, 6)

        // Generate descriptions based on characteristics
        const relatedList: RelatedNeighbourhood[] = topCandidates.map((n: any) => {
          let description = ''
          
          // Check if mature estate (has older flats typically)
          // Mature estates typically have lease < 65 years
          const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
          const isMature = lease !== null && lease < 65
          const isNonMature = lease !== null && lease >= 65
          
          // Check MRT access
          const hasMRT = n.access?.mrt_station_count && Number(n.access.mrt_station_count) > 0
          const mrtDist = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
          
          // Check price
          const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
          const isLowerPrice = price && medianPrice && price < medianPrice * 0.9
          const isHigherPrice = price && medianPrice && price > medianPrice * 1.1
          const isSimilarPrice = price && medianPrice && 
            price >= medianPrice * 0.9 && price <= medianPrice * 1.1

          // Build description - be conservative if data missing
          if (isMature) {
            description += 'Mature estate'
          } else if (isNonMature) {
            description += 'Non-mature estate'
          }
          // If lease data missing, don't claim maturity status
          
          if (hasMRT) {
            description += description ? ' · Strong MRT connectivity' : 'Strong MRT connectivity'
          } else if (mrtDist !== null && mrtDist <= 800) {
            description += description ? ' · Walkable to MRT' : 'Walkable to MRT'
          } else if (mrtDist !== null && mrtDist > 800) {
            description += description ? ' · Longer MRT distance' : 'Longer MRT distance'
          }
          
          if (isSimilarPrice) {
            description += description ? ' · Similar price range' : 'Similar price range'
          } else if (isLowerPrice) {
            description += description ? ' · Lower entry price' : 'Lower entry price'
          } else if (isHigherPrice) {
            description += description ? ' · Higher price point' : 'Higher price point'
          }

          return {
            id: n.id,
            name: n.name,
            description: description || 'Similar neighbourhood profile'
          }
        })

        setRelated(relatedList)
      } catch (error) {
        console.error('Error fetching related neighbourhoods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [currentNeighbourhoodId, planningAreaId, medianPrice, mrtDistance])

  if (loading) {
    return null
  }

  if (related.length === 0) {
    return null
  }

  return (
    <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Similar Neighbourhood Profiles
      </h2>
      <ul className="space-y-3">
        {related.map((neighbourhood) => (
          <li key={neighbourhood.id}>
            <Link
              href={`/neighbourhood/${neighbourhood.id}`}
              className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {neighbourhood.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {neighbourhood.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
