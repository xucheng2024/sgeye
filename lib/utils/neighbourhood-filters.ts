/**
 * Filter processing utilities for neighbourhoods
 */

import { Neighbourhood, NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'
import { 
  FILTER_RANGES, 
  matchesPriceTiers, 
  matchesLeaseTiers, 
  matchesMrtTiers 
} from '@/lib/utils/shared-filters'

// Re-export for backward compatibility
export { FILTER_RANGES, matchesPriceTiers, matchesLeaseTiers }

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
          if (!matchesPriceTiers(price, priceTiers as Set<string>)) return false
        }
        
        if (leaseTiers.size > 1) {
          const lease = ftDetail.median_lease_years_12m ? Number(ftDetail.median_lease_years_12m) : null
          if (!matchesLeaseTiers(lease, leaseTiers as Set<string>)) return false
        }
        
        return true
      })
      
      if (!hasMatchingFlatType) return false
    } else {
      // Specific flat type mode: check the item's summary
      if (priceTiers.size > 1) {
        const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
        if (!matchesPriceTiers(price, priceTiers as Set<string>)) return false
      }
      
      if (leaseTiers.size > 1) {
        const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
        if (!matchesLeaseTiers(lease, leaseTiers as Set<string>)) return false
      }
    }
    
    // MRT filter
    if (mrtTiers.size > 1) {
      const distance = item.access?.avg_distance_to_mrt ? Number(item.access.avg_distance_to_mrt) : null
      const hasStationInArea = !!(item.access?.mrt_station_count && Number(item.access.mrt_station_count) > 0)
      
      if (!matchesMrtTiers(distance, mrtTiers, hasStationInArea)) return false
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

        // Filter candidates based on price/lease tiers if specified
        const candidates = details.filter(d => {
          const p = d.median_price_12m != null ? Number(d.median_price_12m) : null
          const l = d.median_lease_years_12m != null ? Number(d.median_lease_years_12m) : null
          
          // If no filters, include all flat types
          if (priceTiers.size === 0 && leaseTiers.size === 0) return true
          
          return matchesPriceTiers(p, priceTiers as Set<string>) && matchesLeaseTiers(l, leaseTiers as Set<string>)
        })
        if (candidates.length === 0) return null

        // Select best matching flat type
        const best = [...candidates].sort((a, b) => {
          const priceA = a.median_price_12m != null ? Number(a.median_price_12m) : Infinity
          const priceB = b.median_price_12m != null ? Number(b.median_price_12m) : Infinity
          const leaseA = a.median_lease_years_12m != null ? Number(a.median_lease_years_12m) : -Infinity
          const leaseB = b.median_lease_years_12m != null ? Number(b.median_lease_years_12m) : -Infinity

          if (priceTiers.size > 0 && priceA !== priceB) return priceA - priceB
          if (leaseB !== leaseA) return leaseB - leaseA
          // If no clear winner, prefer 4 ROOM as most common
          return 0
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
          if (!matchesPriceTiers(p, priceTiers as Set<string>) || !matchesLeaseTiers(l, leaseTiers as Set<string>)) return

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

