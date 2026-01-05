/**
 * Filtering logic for neighbourhoods
 */

import type { NeighbourhoodResponse, FlatTypeSummary, NeighbourhoodQueryParams } from './types'

export function applyFilters(
  neighbourhoods: NeighbourhoodResponse[],
  flatTypeSummaries: FlatTypeSummary[],
  params: NeighbourhoodQueryParams
): NeighbourhoodResponse[] {
  const { priceMin, priceMax, leaseMin, leaseMax, mrtDistanceMax, region, majorRegions, flatTypes } = params
  
  // Check if any filters need to be applied
  if (priceMin === null && priceMax === null && 
      leaseMin === null && leaseMax === null && 
      mrtDistanceMax === null && 
      (!region || region === 'all') && 
      majorRegions.length === 0) {
    return neighbourhoods
  }
  
  let beforeFilter = neighbourhoods.length
  let filteredByPrice = 0
  let filteredByMRT = 0
  
  // Determine if we're filtering by specific flat types or showing all
  const isFilteringByFlatType = flatTypes.length > 0
  
  const filtered = neighbourhoods.filter(n => {
    if (!isFilteringByFlatType) {
      // "All" mode: Check each flat type separately
      const flatTypesForNeighbourhood = flatTypeSummaries.filter(
        s => s.neighbourhood_id === n.id
      )
      
      if (flatTypesForNeighbourhood.length === 0) {
        filteredByPrice++
        return false
      }
      
      // Check if at least one flat type meets all filter criteria
      const hasMatchingFlatType = flatTypesForNeighbourhood.some(flatTypeSummary => {
        // Price filter
        if (priceMin !== null || priceMax !== null) {
          const price = flatTypeSummary.median_price_12m
          if (price === null) return false
          if (priceMin !== null && price < priceMin) return false
          if (priceMax !== null && price > priceMax) return false
        }
        
        // Lease filter
        if (leaseMin !== null || leaseMax !== null) {
          const lease = flatTypeSummary.median_lease_years_12m
          if (lease === null) return false
          if (leaseMin !== null && lease < leaseMin) return false
          if (leaseMax !== null && lease > leaseMax) return false
        }
        
        return true
      })
      
      if (!hasMatchingFlatType) {
        filteredByPrice++
        return false
      }
    } else {
      // Specific flat type(s) mode
      const matchingFlatTypes = flatTypeSummaries.filter(
        s => s.neighbourhood_id === n.id && flatTypes.includes(s.flat_type)
      )
      
      if (matchingFlatTypes.length === 0) {
        filteredByPrice++
        return false
      }
      
      // Check if at least one selected flat type meets all filter criteria
      const hasMatchingFlatType = matchingFlatTypes.some(flatTypeSummary => {
        // Price filter
        if (priceMin !== null || priceMax !== null) {
          const price = flatTypeSummary.median_price_12m
          if (price === null) return false
          if (priceMin !== null && price < priceMin) return false
          if (priceMax !== null && price > priceMax) return false
        }
        
        // Lease filter
        if (leaseMin !== null || leaseMax !== null) {
          const lease = flatTypeSummary.median_lease_years_12m
          if (lease === null) return false
          if (leaseMin !== null && lease < leaseMin) return false
          if (leaseMax !== null && lease > leaseMax) return false
        }
        
        return true
      })
      
      if (!hasMatchingFlatType) {
        filteredByPrice++
        return false
      }
    }
    
    // MRT filter (applies to neighbourhood, not flat type)
    if (mrtDistanceMax !== null) {
      const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
      if (distance === null || (distance > 0 && distance > mrtDistanceMax)) {
        if (!n.access?.mrt_station_count || n.access.mrt_station_count === 0) {
          filteredByMRT++
          return false
        }
      }
    }
    
    // Region filter (CCR/RCR/OCR) - applies to neighbourhood
    if (region && region !== 'all') {
      const neighbourhoodRegion = n.planning_area?.region
      if (!neighbourhoodRegion || neighbourhoodRegion.toUpperCase() !== region.toUpperCase()) {
        return false
      }
    }
    
    // Major region filter (5 major regions) - applies to neighbourhood
    if (majorRegions.length > 0) {
      const neighbourhoodMajorRegion = n.subzone_region
      if (!neighbourhoodMajorRegion || !majorRegions.includes(neighbourhoodMajorRegion)) {
        return false
      }
    }
    
    return true
  })
  
  console.log('API: After filtering:', {
    before: beforeFilter,
    after: filtered.length,
    filteredByPrice,
    filteredByMRT
  })
  
  if (filtered.length === 0 && beforeFilter > 0) {
    console.log('API: No results after filtering. Filter criteria:', {
      priceMin,
      priceMax,
      leaseMin,
      leaseMax,
      mrtDistanceMax,
      message: `Filtered out ${filteredByPrice} by price/lease, ${filteredByMRT} by MRT`
    })
  }
  
  return filtered
}

