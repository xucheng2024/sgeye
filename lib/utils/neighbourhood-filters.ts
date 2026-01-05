/**
 * Filter processing utilities for neighbourhoods
 */

import { Neighbourhood, NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'

interface FilterRanges {
  priceRanges: Record<string, [number, number]>
  leaseRanges: Record<string, [number, number]>
  mrtDistances: Record<string, number>
}

export const FILTER_RANGES: FilterRanges = {
  priceRanges: {
    low: [0, 499999],
    medium: [500000, 999999],
    high: [1000000, 2000000]
  },
  leaseRanges: {
    low: [30, 70],
    medium: [70, 80],
    high: [80, 99]
  },
  mrtDistances: {
    close: 500,
    medium: 1000,
    far: 2000
  }
}

export function matchesPriceTiers(price: number | null, priceTiers: Set<string>): boolean {
  if (priceTiers.size === 0) return true
  if (price == null || !Number.isFinite(price)) return false
  return Array.from(priceTiers).some(tier => {
    const range = FILTER_RANGES.priceRanges[tier]
    return !!range && price >= range[0] && price <= range[1]
  })
}

export function matchesLeaseTiers(lease: number | null, leaseTiers: Set<string>): boolean {
  if (leaseTiers.size === 0) return true
  if (lease == null || !Number.isFinite(lease)) return false
  return Array.from(leaseTiers).some(tier => {
    const range = FILTER_RANGES.leaseRanges[tier]
    return !!range && lease >= range[0] && lease <= range[1]
  })
}

export function applyClientSideFilters(
  displayItems: NeighbourhoodWithFlatType[],
  priceTiers: Set<string>,
  leaseTiers: Set<string>,
  mrtTiers: Set<string>,
  isAllFlatTypes: boolean
): NeighbourhoodWithFlatType[] {
  const needsClientSideFiltering = (
    (priceTiers.size > 1) ||
    (leaseTiers.size > 1) ||
    (mrtTiers.size > 1)
  )
  
  if (!needsClientSideFiltering) {
    return displayItems
  }

  return displayItems.filter(item => {
    // For "Any size" mode, check if ANY flat type meets criteria
    if (isAllFlatTypes && item.flat_type_details && item.flat_type_details.length > 0) {
      const hasMatchingFlatType = item.flat_type_details.some(ftDetail => {
        if (priceTiers.size > 1) {
          const price = ftDetail.median_price_12m ? Number(ftDetail.median_price_12m) : null
          if (!matchesPriceTiers(price, priceTiers)) return false
        }
        
        if (leaseTiers.size > 1) {
          const lease = ftDetail.median_lease_years_12m ? Number(ftDetail.median_lease_years_12m) : null
          if (!matchesLeaseTiers(lease, leaseTiers)) return false
        }
        
        return true
      })
      
      if (!hasMatchingFlatType) return false
    } else {
      // Specific flat type mode: check the item's summary
      if (priceTiers.size > 1) {
        const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
        if (!matchesPriceTiers(price, priceTiers)) return false
      }
      
      if (leaseTiers.size > 1) {
        const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
        if (!matchesLeaseTiers(lease, leaseTiers)) return false
      }
    }
    
    // MRT filter
    if (mrtTiers.size > 1) {
      const distance = item.access?.avg_distance_to_mrt ? Number(item.access.avg_distance_to_mrt) : null
      const hasStationInArea = item.access?.mrt_station_count && Number(item.access.mrt_station_count) > 0
      
      if (hasStationInArea) return true
      
      if (distance === null || distance <= 0) return false
      
      const matchesMrtTier = Array.from(mrtTiers).some(tier => {
        const maxDist = FILTER_RANGES.mrtDistances[tier]
        return maxDist && distance <= maxDist
      })
      if (!matchesMrtTier) return false
    }
    
    return true
  })
}

export function expandNeighbourhoodsToFlatTypes(
  neighbourhoods: Neighbourhood[],
  selectedFlatTypes: Set<string>,
  priceTiers: Set<string>,
  leaseTiers: Set<string>
): NeighbourhoodWithFlatType[] {
  const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
  const selectedFlatTypesArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
  let displayItems: NeighbourhoodWithFlatType[] = []
  
  if (isAllFlatTypes) {
    displayItems = neighbourhoods
      .map((neighbourhood): NeighbourhoodWithFlatType | null => {
        const details = neighbourhood.flat_type_details || []

        if (priceTiers.size === 0 && leaseTiers.size === 0) {
          return {
            ...neighbourhood,
            display_flat_type: undefined
          }
        }

        const candidates = details.filter(d => {
          const p = d.median_price_12m != null ? Number(d.median_price_12m) : null
          const l = d.median_lease_years_12m != null ? Number(d.median_lease_years_12m) : null
          return matchesPriceTiers(p, priceTiers) && matchesLeaseTiers(l, leaseTiers)
        })
        if (candidates.length === 0) return null

        const best = [...candidates].sort((a, b) => {
          const priceA = a.median_price_12m != null ? Number(a.median_price_12m) : Infinity
          const priceB = b.median_price_12m != null ? Number(b.median_price_12m) : Infinity
          const leaseA = a.median_lease_years_12m != null ? Number(a.median_lease_years_12m) : -Infinity
          const leaseB = b.median_lease_years_12m != null ? Number(b.median_lease_years_12m) : -Infinity

          if (priceTiers.size > 0 && priceA !== priceB) return priceA - priceB
          return leaseB - leaseA
        })[0]

        return {
          ...neighbourhood,
          display_flat_type: best.flat_type,
          summary: {
            tx_12m: best.tx_12m,
            median_price_12m: best.median_price_12m,
            median_psm_12m: best.median_psm_12m,
            median_lease_years_12m: best.median_lease_years_12m,
            avg_floor_area_12m: best.avg_floor_area_12m
          }
        }
      })
      .filter((n): n is NeighbourhoodWithFlatType => n !== null)
  } else {
    neighbourhoods.forEach((neighbourhood) => {
      if (neighbourhood.flat_type_details && neighbourhood.flat_type_details.length > 0) {
        neighbourhood.flat_type_details.forEach(ftDetail => {
          if (!selectedFlatTypesArray.includes(ftDetail.flat_type)) return

          const p = ftDetail.median_price_12m != null ? Number(ftDetail.median_price_12m) : null
          const l = ftDetail.median_lease_years_12m != null ? Number(ftDetail.median_lease_years_12m) : null
          if (!matchesPriceTiers(p, priceTiers) || !matchesLeaseTiers(l, leaseTiers)) return

          displayItems.push({
            ...neighbourhood,
            display_flat_type: ftDetail.flat_type,
            summary: {
              tx_12m: ftDetail.tx_12m,
              median_price_12m: ftDetail.median_price_12m,
              median_psm_12m: ftDetail.median_psm_12m,
              median_lease_years_12m: ftDetail.median_lease_years_12m,
              avg_floor_area_12m: ftDetail.avg_floor_area_12m
            }
          })
        })
      }
    })
  }
  
  return displayItems
}

