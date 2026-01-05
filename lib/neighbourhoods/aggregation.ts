/**
 * Aggregation logic for monthly neighbourhood data
 */

import { fetchMonthlyData } from './fetch'
import type { FlatTypeSummary, NeighbourhoodSummary } from './types'

export async function aggregateMonthlyData(
  neighbourhoodIds: string[],
  flatTypes: string[],
  months: number = 12
): Promise<{
  flatTypeSummaries: FlatTypeSummary[]
  neighbourhoodSummaries: NeighbourhoodSummary[]
}> {
  const monthlyData = await fetchMonthlyData(neighbourhoodIds, flatTypes, months)
  
  console.log('API: Monthly data from agg_neighbourhood_monthly:', {
    flatTypes: flatTypes.length > 0 ? flatTypes : ['All'],
    monthlyDataCount: monthlyData?.length || 0,
    uniqueNeighbourhoods: monthlyData ? [...new Set(monthlyData.map(m => m.neighbourhood_id))].length : 0,
    flatTypesInData: monthlyData ? [...new Set(monthlyData.map(m => m.flat_type))].sort() : []
  })
  
  // Aggregate by neighbourhood_id and flat_type first
  const tempSummaryMap = new Map<string, {
    neighbourhood_id: string
    flat_type: string
    prices: number[]
    psms: number[]
    leases: number[]
    areas: number[]
    total_tx: number
  }>()
  
  if (monthlyData) {
    monthlyData.forEach(item => {
      const nbhdId = item.neighbourhood_id
      const flatTypeKey = item.flat_type
      const key = `${nbhdId}__${flatTypeKey}` // Group by neighbourhood + flat_type
      
      if (!tempSummaryMap.has(key)) {
        tempSummaryMap.set(key, {
          neighbourhood_id: nbhdId,
          flat_type: flatTypeKey,
          prices: [],
          psms: [],
          leases: [],
          areas: [],
          total_tx: 0
        })
      }
      const entry = tempSummaryMap.get(key)!
      
      // Collect values for this neighbourhood + flat_type combination
      if (item.median_price) entry.prices.push(Number(item.median_price))
      if (item.median_psm) entry.psms.push(Number(item.median_psm))
      if (item.median_lease_years) entry.leases.push(Number(item.median_lease_years))
      if (item.avg_floor_area) entry.areas.push(Number(item.avg_floor_area))
      if (item.tx_count) entry.total_tx += Number(item.tx_count)
    })
  }
  
  // Calculate medians for each neighbourhood + flat_type combination
  const flatTypeSummaries = Array.from(tempSummaryMap.values()).map(entry => {
    const sortedPrices = entry.prices.sort((a, b) => a - b)
    const sortedPsms = entry.psms.sort((a, b) => a - b)
    const sortedLeases = entry.leases.sort((a, b) => a - b)
    
    // Calculate average area (use average of monthly averages, not median)
    const avgArea = entry.areas.length > 0 
      ? entry.areas.reduce((sum, val) => sum + val, 0) / entry.areas.length 
      : null
    
    return {
      neighbourhood_id: entry.neighbourhood_id,
      flat_type: entry.flat_type,
      tx_12m: entry.total_tx,
      median_price_12m: sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : null,
      median_psm_12m: sortedPsms.length > 0 ? sortedPsms[Math.floor(sortedPsms.length / 2)] : null,
      median_lease_years_12m: sortedLeases.length > 0 ? sortedLeases[Math.floor(sortedLeases.length / 2)] : null,
      avg_floor_area_12m: avgArea,
    }
  })
  
  // Now combine all flat types for each neighbourhood (for "All" view)
  const neighbourhoodSummaries = new Map<string, {
    prices: number[]
    psms: number[]
    leases: number[]
    areas: number[]
    total_tx: number
  }>()
  
  flatTypeSummaries.forEach(summary => {
    if (!neighbourhoodSummaries.has(summary.neighbourhood_id)) {
      neighbourhoodSummaries.set(summary.neighbourhood_id, {
        prices: [],
        psms: [],
        leases: [],
        areas: [],
        total_tx: 0
      })
    }
    const nbhdSummary = neighbourhoodSummaries.get(summary.neighbourhood_id)!
    
    // Add the flat_type's median to the neighbourhood's collection
    if (summary.median_price_12m) nbhdSummary.prices.push(summary.median_price_12m)
    if (summary.median_psm_12m) nbhdSummary.psms.push(summary.median_psm_12m)
    if (summary.median_lease_years_12m) nbhdSummary.leases.push(summary.median_lease_years_12m)
    if (summary.avg_floor_area_12m) nbhdSummary.areas.push(summary.avg_floor_area_12m)
    nbhdSummary.total_tx += summary.tx_12m
  })
  
  // Final aggregation: median of flat_type medians
  const summaryData = Array.from(neighbourhoodSummaries.entries()).map(([nbhdId, data]) => {
    const sortedPrices = data.prices.sort((a, b) => a - b)
    const sortedPsms = data.psms.sort((a, b) => a - b)
    const sortedLeases = data.leases.sort((a, b) => a - b)
    
    // Calculate average area (average of flat_type averages)
    const avgArea = data.areas.length > 0 
      ? data.areas.reduce((sum, val) => sum + val, 0) / data.areas.length 
      : null
    
    return {
      neighbourhood_id: nbhdId,
      tx_12m: data.total_tx,
      median_price_12m: sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : null,
      median_psm_12m: sortedPsms.length > 0 ? sortedPsms[Math.floor(sortedPsms.length / 2)] : null,
      median_lease_years_12m: sortedLeases.length > 0 ? sortedLeases[Math.floor(sortedLeases.length / 2)] : null,
      avg_floor_area_12m: avgArea,
      updated_at: new Date().toISOString()
    }
  })
  
  console.log('API: After aggregation:', {
    flatTypes: flatTypes.length > 0 ? flatTypes : ['All Types'],
    neighbourhoodIdsQueried: neighbourhoodIds.length,
    flatTypeSummariesCount: flatTypeSummaries.length,
    neighbourhoodSummariesCount: neighbourhoodSummaries.size,
    finalSummaryDataCount: summaryData.length
  })
  
  return {
    flatTypeSummaries,
    neighbourhoodSummaries: summaryData
  }
}

