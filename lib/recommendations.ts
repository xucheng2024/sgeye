/**
 * Recommendation Logic based on Decision Profile
 * 
 * Provides neighbourhood recommendations tailored to user's decision profile
 */

import { type DecisionProfileType, calculateDecisionProfile, getProfileDisplay } from './decision-profile'

export interface NeighbourhoodForRecommendation {
  id: string
  name: string
  summary: {
    median_price_12m: number | null
    median_lease_years_12m: number | null
    tx_12m: number
  } | null
  access: {
    mrt_station_count: number
    mrt_access_type: string
    avg_distance_to_mrt: number | null
  } | null
  planning_area?: {
    id: string
    name: string
  } | null
}

export interface RecommendationCriteria {
  profile: DecisionProfileType
  referencePrice?: number | null
  referenceLease?: number | null
  referenceMRT?: number | null
  maxPriceIncrease?: number // Percentage, default 15
}

/**
 * Calculate recommendation score for a neighbourhood based on profile
 */
function calculateProfileScore(
  nbhd: NeighbourhoodForRecommendation,
  profile: DecisionProfileType,
  referencePrice?: number | null,
  referenceLease?: number | null,
  referenceMRT?: number | null
): number {
  let score = 0
  const price = nbhd.summary?.median_price_12m ? Number(nbhd.summary.median_price_12m) : null
  const lease = nbhd.summary?.median_lease_years_12m ? Number(nbhd.summary.median_lease_years_12m) : null
  const mrtCount = nbhd.access?.mrt_station_count || 0
  const mrtDistance = nbhd.access?.avg_distance_to_mrt ? Number(nbhd.access.avg_distance_to_mrt) : null

  switch (profile) {
    case 'budget-first':
      // Prioritize lower price
      if (price && referencePrice) {
        const priceDiff = ((referencePrice - price) / referencePrice) * 100
        if (priceDiff > 0) score += priceDiff * 2 // Bonus for lower price
        if (priceDiff < -15) score -= 20 // Penalty if >15% more expensive
      } else if (price) {
        // No reference, prioritize absolute low price
        if (price < 500000) score += 30
        else if (price < 650000) score += 15
        else if (price > 800000) score -= 10
      }
      // Lease still matters but less
      if (lease && referenceLease) {
        if (lease >= referenceLease) score += 5
      }
      break

    case 'long-term-stability':
      // Prioritize longer lease
      if (lease && referenceLease) {
        const leaseDiff = lease - referenceLease
        if (leaseDiff > 5) score += 30
        else if (leaseDiff > 0) score += 15
        else if (leaseDiff < -5) score -= 20
      } else if (lease) {
        if (lease >= 80) score += 30
        else if (lease >= 70) score += 15
        else if (lease < 60) score -= 20
      }
      // Price tolerance up to 15% more
      if (price && referencePrice) {
        const priceDiff = ((price - referencePrice) / referencePrice) * 100
        if (priceDiff <= 15) score += 10
        if (priceDiff > 15) score -= 15
      }
      break

    case 'school-stability':
      // Prioritize areas with more schools (lower SPI), but we don't have SPI here
      // Instead, we'll use planning area info if available
      // For now, give moderate bonus for any school-related data
      if (nbhd.planning_area) score += 10
      // Price tolerance similar to long-term
      if (price && referencePrice) {
        const priceDiff = ((price - referencePrice) / referencePrice) * 100
        if (priceDiff <= 15) score += 5
      }
      // Lease matters too
      if (lease && referenceLease && lease >= referenceLease) {
        score += 10
      }
      break

    case 'convenience-driven':
      // Prioritize MRT access
      if (mrtCount > 0) {
        score += mrtCount * 15
      } else if (mrtDistance && mrtDistance <= 500) {
        score += 20
      } else if (mrtDistance && mrtDistance <= 1000) {
        score += 10
      } else {
        score -= 10
      }
      // Compare with reference
      if (referenceMRT !== undefined && referenceMRT !== null) {
        if (mrtCount > referenceMRT) score += 15
        if (mrtDistance && referenceMRT > 0 && mrtDistance < referenceMRT) score += 10
      }
      // Price tolerance higher (willing to pay more)
      if (price && referencePrice) {
        const priceDiff = ((price - referencePrice) / referencePrice) * 100
        if (priceDiff <= 25) score += 5
      }
      break
  }

  // Transaction volume bonus (more active = better)
  const txCount = nbhd.summary?.tx_12m || 0
  if (txCount > 100) score += 5
  else if (txCount > 50) score += 2

  return score
}

/**
 * Get recommended neighbourhoods for Compare page
 * Based on current comparison
 */
export function getRecommendationsForCompare(
  currentNeighbourhoods: NeighbourhoodForRecommendation[],
  allNeighbourhoods: NeighbourhoodForRecommendation[],
  maxResults: number = 3
): NeighbourhoodForRecommendation[] {
  const profile = calculateDecisionProfile()
  if (!profile) return []

  const display = getProfileDisplay(profile.type)

  // Find best reference values from current comparison
  const prices = currentNeighbourhoods
    .map(n => n.summary?.median_price_12m)
    .filter((p): p is number => p !== null && p !== undefined)
  const leases = currentNeighbourhoods
    .map(n => n.summary?.median_lease_years_12m)
    .filter((l): l is number => l !== null && l !== undefined)
  const mrtCounts = currentNeighbourhoods
    .map(n => n.access?.mrt_station_count || 0)
    .filter(c => c !== null && c !== undefined)

  const referencePrice = prices.length > 0 ? Math.min(...prices) : null
  const referenceLease = leases.length > 0 ? Math.max(...leases) : null // Best = highest
  const referenceMRT = mrtCounts.length > 0 ? Math.max(...mrtCounts) : null // Best = highest count

  // Exclude current neighbourhoods
  const currentIds = new Set(currentNeighbourhoods.map(n => n.id))
  const candidates = allNeighbourhoods.filter(n => !currentIds.has(n.id))

  // Calculate scores
  const scored = candidates
    .map(nbhd => ({
      nbhd,
      score: calculateProfileScore(
        nbhd,
        profile.type,
        referencePrice,
        referenceLease,
        referenceMRT || undefined
      ),
    }))
    .filter(item => {
      // Apply basic filters based on profile
      const price = item.nbhd.summary?.median_price_12m ? Number(item.nbhd.summary.median_price_12m) : null
      const lease = item.nbhd.summary?.median_lease_years_12m ? Number(item.nbhd.summary.median_lease_years_12m) : null

      switch (profile.type) {
        case 'budget-first':
          // Price not higher than 15%
          if (referencePrice && price) {
            const increase = ((price - referencePrice) / referencePrice) * 100
            if (increase > 15) return false
          }
          // Lease at least not worse
          if (referenceLease && lease && lease < referenceLease - 2) return false
          break

        case 'long-term-stability':
          // Lease at least as good or better
          if (referenceLease && lease && lease < referenceLease) return false
          // Price not more than 15% higher
          if (referencePrice && price) {
            const increase = ((price - referencePrice) / referencePrice) * 100
            if (increase > 15) return false
          }
          break

        case 'school-stability':
          // Similar constraints as long-term
          if (referenceLease && lease && lease < referenceLease - 2) return false
          if (referencePrice && price) {
            const increase = ((price - referencePrice) / referencePrice) * 100
            if (increase > 15) return false
          }
          break

        case 'convenience-driven':
          // MRT at least not worse
          const mrtCount = item.nbhd.access?.mrt_station_count || 0
          if (referenceMRT !== null && referenceMRT !== undefined && mrtCount < referenceMRT) {
            // Still allow if distance is good
            const distance = item.nbhd.access?.avg_distance_to_mrt ? Number(item.nbhd.access.avg_distance_to_mrt) : null
            if (!distance || distance > 500) return false
          }
          // Price tolerance higher (up to 25%)
          if (referencePrice && price) {
            const increase = ((price - referencePrice) / referencePrice) * 100
            if (increase > 25) return false
          }
          break
      }

      // Must have some data
      return price !== null || lease !== null
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.nbhd)

  return scored
}

/**
 * Sort neighbourhoods by profile fit for Explore page
 */
export function sortByProfileFit(
  neighbourhoods: NeighbourhoodForRecommendation[]
): NeighbourhoodForRecommendation[] {
  const profile = calculateDecisionProfile()
  if (!profile) return neighbourhoods

  // Calculate average values as reference
  const prices = neighbourhoods
    .map(n => n.summary?.median_price_12m)
    .filter((p): p is number => p !== null && p !== undefined)
  const leases = neighbourhoods
    .map(n => n.summary?.median_lease_years_12m)
    .filter((l): l is number => l !== null && l !== undefined)

  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null
  const avgLease = leases.length > 0 ? leases.reduce((a, b) => a + b, 0) / leases.length : null

  const scored = neighbourhoods.map(nbhd => ({
    nbhd,
    score: calculateProfileScore(nbhd, profile.type, avgPrice, avgLease),
  }))

  return scored.sort((a, b) => b.score - a.score).map(item => item.nbhd)
}

/**
 * Generate "Why this fits your profile" reasons for Detail page
 */
export function getProfileFitReasons(
  nbhd: NeighbourhoodForRecommendation,
  profile: DecisionProfileType
): string[] {
  const reasons: string[] = []
  const price = nbhd.summary?.median_price_12m ? Number(nbhd.summary.median_price_12m) : null
  const lease = nbhd.summary?.median_lease_years_12m ? Number(nbhd.summary.median_lease_years_12m) : null
  const mrtCount = nbhd.access?.mrt_station_count || 0
  const mrtDistance = nbhd.access?.avg_distance_to_mrt ? Number(nbhd.access.avg_distance_to_mrt) : null

  switch (profile) {
    case 'budget-first':
      if (price && price < 600000) {
        reasons.push('Lower entry price than many similar areas')
      }
      if (lease && lease >= 70) {
        reasons.push('Acceptable remaining lease for the price point')
      }
      break

    case 'long-term-stability':
      if (lease && lease >= 80) {
        reasons.push('Longer remaining lease than similar-priced areas')
      } else if (lease && lease >= 70) {
        reasons.push('Relatively healthy remaining lease')
      }
      if (price && price < 800000) {
        reasons.push('Lower long-term resale risk')
      }
      if (lease && lease >= 75) {
        reasons.push('Greater flexibility for future resale')
      }
      break

    case 'school-stability':
      if (nbhd.planning_area) {
        reasons.push('Planning area with multiple school options')
      }
      if (lease && lease >= 70) {
        reasons.push('Sufficient lease for long-term planning')
      }
      break

    case 'convenience-driven':
      if (mrtCount > 0) {
        reasons.push(`Direct MRT access with ${mrtCount} station${mrtCount > 1 ? 's' : ''} in area`)
      } else if (mrtDistance && mrtDistance <= 500) {
        reasons.push('Within walking distance to MRT')
      }
      if (mrtCount >= 2) {
        reasons.push('Multiple MRT lines for better connectivity')
      }
      break
  }

  return reasons
}

