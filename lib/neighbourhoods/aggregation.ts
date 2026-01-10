/**
 * Aggregation logic for monthly neighbourhood data
 */

import { fetchMonthlyData } from './fetch'
import type { FlatTypeSummary } from './types'

/**
 * Calculate weighted percentile using transaction count as weight
 * @param values Array of {value, weight} pairs
 * @param percentile Percentile to calculate (0.0 to 1.0, e.g., 0.25 for p25, 0.5 for median, 0.75 for p75)
 */
function weightedPercentile(values: Array<{ value: number; weight: number }>, percentile: number): number | null {
  if (values.length === 0) return null
  if (percentile < 0 || percentile > 1) return null
  
  // Sort by value
  const sorted = [...values].sort((a, b) => a.value - b.value)
  
  // Calculate total weight
  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight === 0) return null
  
  // Find percentile position (e.g., 25% of total weight for p25)
  const targetWeight = totalWeight * percentile
  let cumulativeWeight = 0
  
  for (const item of sorted) {
    cumulativeWeight += item.weight
    if (cumulativeWeight >= targetWeight) {
      return item.value
    }
  }
  
  return sorted[sorted.length - 1].value
}

/**
 * Calculate weighted median using transaction count as weight (50th percentile)
 */
function weightedMedian(values: Array<{ value: number; weight: number }>): number | null {
  return weightedPercentile(values, 0.5)
}

export async function aggregateMonthlyData(
  neighbourhoodIds: string[],
  flatTypes: string[],
  months: number = 12
): Promise<{
  flatTypeSummaries: FlatTypeSummary[]
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
    prices: Array<{ value: number; weight: number }>
    prices_p25: Array<{ value: number; weight: number }>
    prices_p75: Array<{ value: number; weight: number }>
    psms: Array<{ value: number; weight: number }>
    leases: Array<{ value: number; weight: number }>
    areas: Array<{ value: number; weight: number }>
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
          prices_p25: [],
          prices_p75: [],
          psms: [],
          leases: [],
          areas: [],
          total_tx: 0
        })
      }
      const entry = tempSummaryMap.get(key)!
      
      const txCount = Number(item.tx_count) || 0
      
      // Collect values with weights (tx_count) for weighted percentile calculation
      if (item.median_price && txCount > 0) {
        entry.prices.push({ value: Number(item.median_price), weight: txCount })
      }
      if (item.p25_price && txCount > 0) {
        entry.prices_p25.push({ value: Number(item.p25_price), weight: txCount })
      }
      if (item.p75_price && txCount > 0) {
        entry.prices_p75.push({ value: Number(item.p75_price), weight: txCount })
      }
      if (item.median_psm && txCount > 0) {
        entry.psms.push({ value: Number(item.median_psm), weight: txCount })
      }
      if (item.median_lease_years && txCount > 0) {
        entry.leases.push({ value: Number(item.median_lease_years), weight: txCount })
      }
      // For area, use weighted average (average of monthly averages weighted by tx_count)
      if (item.avg_floor_area && txCount > 0) {
        entry.areas.push({ value: Number(item.avg_floor_area), weight: txCount })
      }
      if (txCount > 0) {
        entry.total_tx += txCount
      }
    })
  }
  
  // Calculate weighted percentiles for each neighbourhood + flat_type combination
  const flatTypeSummaries = Array.from(tempSummaryMap.values()).map(entry => {
    // Calculate weighted medians for price percentiles
    // Each month's p25_price is already a 25th percentile, we take weighted median of these
    // to get the "typical" 25th percentile across 12 months, weighted by transaction volume
    const weightedP25Price = weightedMedian(entry.prices_p25)
    const weightedMedianPrice = weightedMedian(entry.prices)
    const weightedP75Price = weightedMedian(entry.prices_p75)
    
    // Calculate weighted medians for other metrics
    const weightedMedianPsm = weightedMedian(entry.psms)
    const weightedMedianLease = weightedMedian(entry.leases)
    
    // Calculate weighted average for area
    const totalAreaWeight = entry.areas.reduce((sum, item) => sum + item.weight, 0)
    const weightedAvgArea = totalAreaWeight > 0
      ? entry.areas.reduce((sum, item) => sum + item.value * item.weight, 0) / totalAreaWeight
      : null
    
    return {
      neighbourhood_id: entry.neighbourhood_id,
      flat_type: entry.flat_type,
      tx_12m: entry.total_tx,
      p25_price_12m: weightedP25Price,
      median_price_12m: weightedMedianPrice,
      p75_price_12m: weightedP75Price,
      median_psm_12m: weightedMedianPsm,
      median_lease_years_12m: weightedMedianLease,
      avg_floor_area_12m: weightedAvgArea,
    }
  })
  
  console.log('API: After aggregation:', {
    flatTypes: flatTypes.length > 0 ? flatTypes : ['All Types'],
    neighbourhoodIdsQueried: neighbourhoodIds.length,
    flatTypeSummariesCount: flatTypeSummaries.length,
  })
  
  return {
    flatTypeSummaries
  }
}

