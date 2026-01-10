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
  mrtTiers: Set<string>
): NeighbourhoodWithFlatType[] {
  const needsClientSideFiltering = (
    (priceTiers.size > 0) ||
    (leaseTiers.size > 0) ||
    (mrtTiers.size > 0)
  )
  
  if (!needsClientSideFiltering) {
    return displayItems
  }

  return displayItems.filter(item => {
    // After expansion, each item represents one specific flat type
    // Check the item's summary directly
    if (priceTiers.size > 0) {
      const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
      if (!matchesPriceTiers(price, priceTiers as Set<string>)) return false
    }
    
    if (leaseTiers.size > 0) {
      const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
      if (!matchesLeaseTiers(lease, leaseTiers as Set<string>)) return false
    }
    
    // MRT filter
    if (mrtTiers.size > 0) {
      const distance = item.access?.avg_distance_to_mrt ? Number(item.access.avg_distance_to_mrt) : null
      const hasStationInArea = !!(item.access?.mrt_station_count && Number(item.access.mrt_station_count) > 0)
      
      if (!matchesMrtTiers(distance, mrtTiers, hasStationInArea)) return false
    }
    
    return true
  })
}

export function expandNeighbourhoodsToFlatTypes(
  neighbourhoods: Neighbourhood[]
): NeighbourhoodWithFlatType[] {
  // Always expand ALL flat types - filtering will be done later
  let displayItems: NeighbourhoodWithFlatType[] = []
  
  neighbourhoods.forEach((neighbourhood) => {
    if (!neighbourhood.flat_type_details || neighbourhood.flat_type_details.length === 0) return
    
    neighbourhood.flat_type_details.forEach(ftDetail => {
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

