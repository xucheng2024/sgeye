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
  priceTiers: Set<string>,
  leaseTiers: Set<string>
): NeighbourhoodWithFlatType[] {
  // Always expand ALL flat types - don't filter here
  // Filtering by flat_type will be done later in applyClientSideFiltersAndDisplay
  let displayItems: NeighbourhoodWithFlatType[] = []
  
  neighbourhoods.forEach((neighbourhood) => {
    if (!neighbourhood.flat_type_details || neighbourhood.flat_type_details.length === 0) return
    
    neighbourhood.flat_type_details.forEach(ftDetail => {
      // Generate card for every flat type - no filtering here
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
  })
  
  return displayItems
}

