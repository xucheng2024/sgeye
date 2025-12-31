/**
 * Data fetching functions for HDB data
 */

import { supabase } from '../supabase'
import { DATA_FETCHING, LEASE_BINS } from '../constants'
import { paginateQuery } from '../utils/pagination'
import type { AggregatedMonthly, BinnedLeaseData, NeighbourhoodTimeAccess, Centrality, MrtDensity, TransferComplexity, RegionalHubAccess } from './types'

// Parse remaining_lease string to decimal years
// Handles formats like: "84 years 3 months", "61 years", "49 years 11 months"
function parseLeaseYears(leaseText: string): number | null {
  if (!leaseText || typeof leaseText !== 'string') {
    return null
  }

  const trimmed = leaseText.trim()
  if (!trimmed) return null

  // Extract years (e.g., "84 years 3 months" -> 84, "61 years" -> 61)
  const yearsMatch = trimmed.match(/(\d+)\s*years?/i)
  const years = yearsMatch ? parseFloat(yearsMatch[1]) : 0

  // Extract months (e.g., "84 years 3 months" -> 3, "49 years 11 months" -> 11)
  const monthsMatch = trimmed.match(/(\d+)\s*months?/i)
  const months = monthsMatch ? parseFloat(monthsMatch[1]) : 0

  // Validate: must have at least years
  if (years === 0 && months === 0) {
    return null
  }

  // Convert to decimal years
  const leaseYears = years + months / 12

  // Validate range (0-99 years is reasonable for HDB)
  if (leaseYears <= 0 || leaseYears > 99) {
    return null
  }

  return leaseYears
}

// Fetch aggregated monthly data by neighbourhood
// Note: town parameter is kept for backward compatibility but only used for filtering
// All aggregation is done by neighbourhood_id
export async function getAggregatedMonthly(
  flatType?: string,
  town?: string,
  startMonth?: string,
  endMonth?: string,
  neighbourhoodId?: string
): Promise<AggregatedMonthly[]> {
  try {
    if (supabase) {
      // Use neighbourhood-based aggregation table
      let query = supabase
        .from('agg_neighbourhood_monthly')
        .select(`
          *,
          neighbourhoods!inner(id, name, planning_area_id)
        `)
        .order('month', { ascending: true })

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      // Filter by neighbourhood_id if provided (primary method)
      if (neighbourhoodId) {
        query = query.eq('neighbourhood_id', neighbourhoodId)
      }
      // Otherwise, filter by town if provided (for backward compatibility - town is for filtering only)
      else if (town && town !== 'All') {
        // Get unique neighbourhood_ids for this town from raw data
        // Town is only used for filtering, not for aggregation
        const { data: townNeighbourhoods } = await supabase
          .from('raw_resale_2017')
          .select('neighbourhood_id')
          .eq('town', town)
          .not('neighbourhood_id', 'is', null)
          .limit(5000)
        
        if (townNeighbourhoods && townNeighbourhoods.length > 0) {
          const uniqueNeighbourhoodIds = [...new Set(townNeighbourhoods.map(r => r.neighbourhood_id).filter(Boolean))]
          if (uniqueNeighbourhoodIds.length > 0) {
            query = query.in('neighbourhood_id', uniqueNeighbourhoodIds)
          } else {
            return []
          }
        } else {
          // No data found for this town
          return []
        }
      }

      if (startMonth) {
        query = query.gte('month', startMonth)
      }

      if (endMonth) {
        query = query.lte('month', endMonth)
      }

      // Fetch all data with pagination
      const allData = await paginateQuery<any>(
        query,
        DATA_FETCHING.PAGE_SIZE
      )

      if (allData.length > 0) {
        // Get town info from raw_resale_2017 for display purposes
        const neighbourhoodIds = [...new Set(allData.map(item => item.neighbourhood_id).filter(Boolean))]
        const { data: townMapping } = await supabase
          .from('raw_resale_2017')
          .select('neighbourhood_id, town')
          .in('neighbourhood_id', neighbourhoodIds)
          .not('town', 'is', null)
          .limit(10000)
        
        const neighbourhoodToTown = new Map<string, string>()
        if (townMapping) {
          townMapping.forEach(item => {
            if (item.neighbourhood_id && item.town && !neighbourhoodToTown.has(item.neighbourhood_id)) {
              neighbourhoodToTown.set(item.neighbourhood_id, item.town)
            }
          })
        }

        return allData.map(item => ({
          month: item.month,
          town: neighbourhoodToTown.get(item.neighbourhood_id) || null, // For display only
          flat_type: item.flat_type,
          tx_count: Number(item.tx_count),
          median_price: Number(item.median_price),
          p25_price: Number(item.p25_price),
          p75_price: Number(item.p75_price),
          median_psm: Number(item.median_psm),
          median_lease_years: Number(item.median_lease_years),
          avg_floor_area: Number(item.avg_floor_area),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching aggregated monthly data:', error)
  }

  // Fallback sample data for testing/demo
  console.log('Using fallback sample data - Supabase not configured or no data available')
  const sampleMonths = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06']
  return sampleMonths.map(month => ({
    month,
    town: null,
    flat_type: flatType && flatType !== 'All' ? flatType : '4 ROOM',
    tx_count: Math.floor(Math.random() * 200) + 100,
    median_price: 500000 + Math.floor(Math.random() * 100000),
    p25_price: 450000 + Math.floor(Math.random() * 80000),
    p75_price: 550000 + Math.floor(Math.random() * 120000),
    median_psm: 500 + Math.floor(Math.random() * 100),
    median_lease_years: 80 + Math.random() * 10,
    avg_floor_area: 100 + Math.random() * 20,
  }))
}

// Get neighbourhood-level aggregated data for heatmap (returns neighbourhood data directly)
export async function getNeighbourhoodAggregated(
  months: number = 3,
  flatType?: string
): Promise<Array<{
  neighbourhoodId: string
  neighbourhoodName: string
  planningAreaName: string | null
  medianPrice: number
  txCount: number
  flatType: string
}>> {
  try {
    if (supabase) {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      // Query from neighbourhood-based aggregation table
      let query = supabase
        .from('agg_neighbourhood_monthly')
        .select('neighbourhood_id, flat_type, median_price, tx_count')
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      // Fetch all data with pagination
      const allData = await paginateQuery<{ neighbourhood_id: string; flat_type: string; median_price: number; tx_count: number }>(
        query,
        DATA_FETCHING.PAGE_SIZE
      )

      if (allData.length > 0) {
        // Get neighbourhood info
        const neighbourhoodIds = [...new Set(allData.map(item => item.neighbourhood_id).filter(Boolean))]
        const { data: neighbourhoodData } = await supabase
          .from('neighbourhoods')
          .select('id, name, planning_area_id, planning_areas(name)')
          .in('id', neighbourhoodIds)

        const neighbourhoodInfo = new Map<string, { name: string; planningAreaName: string | null }>()
        if (neighbourhoodData) {
          neighbourhoodData.forEach(nbhd => {
            const planningArea = Array.isArray(nbhd.planning_areas) && nbhd.planning_areas.length > 0
              ? nbhd.planning_areas[0]?.name
              : null
            neighbourhoodInfo.set(nbhd.id, {
              name: nbhd.name,
              planningAreaName: planningArea
            })
          })
        }

        // Aggregate by neighbourhood_id (combine multiple months)
        const neighbourhoodMap = new Map<string, {
          neighbourhoodId: string
          neighbourhoodName: string
          planningAreaName: string | null
          prices: number[]
          txCount: number
          flatType: string
        }>()

        allData.forEach(item => {
          const nbhdId = item.neighbourhood_id
          const info = neighbourhoodInfo.get(nbhdId) || { name: 'Unknown', planningAreaName: null }

          if (!neighbourhoodMap.has(nbhdId)) {
            neighbourhoodMap.set(nbhdId, {
              neighbourhoodId: nbhdId,
              neighbourhoodName: info.name,
              planningAreaName: info.planningAreaName,
              prices: [],
              txCount: 0,
              flatType: item.flat_type,
            })
          }
          const entry = neighbourhoodMap.get(nbhdId)!
          entry.prices.push(Number(item.median_price))
          entry.txCount += Number(item.tx_count)
        })

        return Array.from(neighbourhoodMap.values()).map(entry => ({
          neighbourhoodId: entry.neighbourhoodId,
          neighbourhoodName: entry.neighbourhoodName,
          planningAreaName: entry.planningAreaName,
          medianPrice: entry.prices.sort((a, b) => a - b)[Math.floor(entry.prices.length / 2)],
          txCount: entry.txCount,
          flatType: entry.flatType,
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching neighbourhood aggregated data:', error)
  }

  return []
}

// Get neighbourhood-level aggregated data for heatmap (legacy - returns town data for backward compatibility)
// Data is aggregated by neighbourhood_id, then grouped by town for display (town is for UI context only, not for analysis)
// Get aggregated data by neighbourhood, then group by town for display
// Note: Data is aggregated by neighbourhood_id internally, but returned grouped by town for UI display
export async function getTownAggregated(
  months: number = 3, // Keep 3 months for heatmap (different use case)
  flatType?: string
): Promise<Array<{
  town: string
  medianPrice: number
  txCount: number
  flatType: string
}>> {
  try {
    if (supabase) {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      // Query from neighbourhood-based aggregation table
      let query = supabase
        .from('agg_neighbourhood_monthly')
        .select('neighbourhood_id, flat_type, median_price, tx_count')
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      // Fetch all data with pagination
      const allData = await paginateQuery<{ neighbourhood_id: string; flat_type: string; median_price: number; tx_count: number }>(
        query,
        DATA_FETCHING.PAGE_SIZE
      )

      if (allData.length > 0) {
        // Get town mapping from raw_resale_2017 for display
        const neighbourhoodIds = [...new Set(allData.map(item => item.neighbourhood_id).filter(Boolean))]
        const { data: townMapping } = await supabase
          .from('raw_resale_2017')
          .select('neighbourhood_id, town')
          .in('neighbourhood_id', neighbourhoodIds)
          .not('town', 'is', null)
          .limit(10000)
        
        const neighbourhoodToTown = new Map<string, string>()
        if (townMapping) {
          townMapping.forEach(item => {
            if (item.neighbourhood_id && item.town && !neighbourhoodToTown.has(item.neighbourhood_id)) {
              neighbourhoodToTown.set(item.neighbourhood_id, item.town)
            }
          })
        }

        // Aggregate by town (for display only) - actual data aggregation is by neighbourhood_id
        const townMap = new Map<string, {
          town: string
          prices: number[]
          txCount: number
          flatType: string
        }>()

        allData.forEach(item => {
          const town = neighbourhoodToTown.get(item.neighbourhood_id) || 'Unknown'
          if (!townMap.has(town)) {
            townMap.set(town, {
              town,
              prices: [],
              txCount: 0,
              flatType: item.flat_type,
            })
          }
          const entry = townMap.get(town)!
          entry.prices.push(Number(item.median_price))
          entry.txCount += Number(item.tx_count)
        })

        return Array.from(townMap.values()).map(entry => ({
          town: entry.town,
          medianPrice: entry.prices.sort((a, b) => a - b)[Math.floor(entry.prices.length / 2)],
          txCount: entry.txCount,
          flatType: entry.flatType,
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching neighbourhood aggregated data:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for heatmap')
  const sampleTowns = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'TAMPINES', 'WOODLANDS', 'CLEMENTI']
  return sampleTowns.map(town => ({
    town,
    medianPrice: 450000 + Math.floor(Math.random() * 150000),
    txCount: Math.floor(Math.random() * 300) + 50,
    flatType: flatType && flatType !== 'All' ? flatType : '4 ROOM',
  }))
}

// Get lease age vs price data
export async function getLeasePriceData(
  flatType?: string,
  town?: string,
  limit: number = DATA_FETCHING.DEFAULT_LEASE_LIMIT
): Promise<Array<{
  leaseYears: number
  price: number
  pricePerSqm: number
  town: string
  flatType: string
}>> {
  try {
    if (supabase) {
      let query = supabase
        .from('raw_resale_2017')
        .select('remaining_lease, resale_price, floor_area_sqm, town, flat_type')
        .not('remaining_lease', 'is', null)
        .not('resale_price', 'is', null)
        .limit(limit)

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      if (town && town !== 'All') {
        query = query.eq('town', town)
      }

      const { data, error } = await query

      if (error) throw error
      if (data && data.length > 0) {
        return data
          .map(item => {
            const leaseYears = parseLeaseYears(item.remaining_lease || '')
            if (leaseYears === null) return null

            const price = Number(item.resale_price)
            const area = Number(item.floor_area_sqm) || 1
            const pricePerSqm = price / area

            if (price <= 0 || area <= 0) return null

            return {
              leaseYears,
              price,
              pricePerSqm,
              town: item.town || 'Unknown',
              flatType: item.flat_type || 'Unknown',
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      }
    }
  } catch (error) {
    console.error('Error fetching lease price data:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for lease-price')
  const sampleData = []
  for (let i = 0; i < 200; i++) {
    const leaseYears = 60 + Math.random() * 30
    const price = 400000 + leaseYears * 2000 + Math.random() * 100000
    sampleData.push({
      leaseYears,
      price,
      pricePerSqm: price / (90 + Math.random() * 20),
      town: ['ANG MO KIO', 'BEDOK', 'TAMPINES'][Math.floor(Math.random() * 3)],
      flatType: flatType && flatType !== 'All' ? flatType : '4 ROOM',
    })
  }
  return sampleData
}

// Get binned lease price data with statistics
export async function getBinnedLeasePriceData(
  flatType?: string,
  town?: string,
  limit: number = DATA_FETCHING.DEFAULT_LEASE_LIMIT
): Promise<BinnedLeaseData[]> {
  const rawData = await getLeasePriceData(flatType, town, limit)

  // Use lease bins from constants
  const bins = LEASE_BINS

  // Helper function to calculate percentile
  function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const index = Math.floor(sorted.length * p)
    return sorted[Math.min(index, sorted.length - 1)]
  }

  // Group data by bins
  const binnedData = bins.map(bin => {
    const itemsInBin = rawData.filter(
      item => item.leaseYears >= bin.start && item.leaseYears < bin.end
    )

    if (itemsInBin.length === 0) {
      return {
        binLabel: bin.label,
        binStart: bin.start,
        binEnd: bin.end,
        medianPrice: 0,
        p25Price: 0,
        p75Price: 0,
        medianPricePerSqm: 0,
        p25PricePerSqm: 0,
        p75PricePerSqm: 0,
        count: 0,
      }
    }

    const prices = itemsInBin.map(item => item.price)
    const pricesPerSqm = itemsInBin.map(item => item.pricePerSqm)

    return {
      binLabel: bin.label,
      binStart: bin.start,
      binEnd: bin.end,
      medianPrice: percentile(prices, 0.5),
      p25Price: percentile(prices, 0.25),
      p75Price: percentile(prices, 0.75),
      medianPricePerSqm: percentile(pricesPerSqm, 0.5),
      p25PricePerSqm: percentile(pricesPerSqm, 0.25),
      p75PricePerSqm: percentile(pricesPerSqm, 0.75),
      count: itemsInBin.length,
    }
  })

  // Filter out empty bins
  return binnedData.filter(bin => bin.count > 0)
}

// Find affordable properties
export async function findAffordableProperties(
  maxPrice: number,
  flatTypes: string[] = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'],
  months: number = DATA_FETCHING.DEFAULT_MONTHS
): Promise<Array<{
  town: string
  flatType: string
  medianPrice: number
  p25Price: number
  txCount: number
  medianLeaseYears: number
}>> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const data = await getAggregatedMonthly(
      undefined,
      undefined,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    // Filter by affordable price and flat types
    const affordable = data
      .filter(item => {
        const isAffordable = item.p25_price <= maxPrice // Use P25 for conservative estimate
        const isDesiredType = flatTypes.includes(item.flat_type)
        return isAffordable && isDesiredType
      })
      .map(item => ({
        town: item.town || 'Unknown',
        flatType: item.flat_type,
        medianPrice: item.median_price,
        p25Price: item.p25_price,
        txCount: item.tx_count,
        medianLeaseYears: item.median_lease_years || 0,
      }))
      .sort((a, b) => Math.abs(a.medianPrice - maxPrice) - Math.abs(b.medianPrice - maxPrice)) // Sort by closest match to budget

    // Group by town and flat type for display (town is for UI context only)
    // Data is already aggregated by neighbourhood_id, we group by town only for presentation
    const townMap = new Map<string, typeof affordable[0]>()
    affordable.forEach(item => {
      const key = `${item.town}-${item.flatType}`
      if (!townMap.has(key) || Math.abs(item.medianPrice - maxPrice) < Math.abs(townMap.get(key)!.medianPrice - maxPrice)) {
        townMap.set(key, item)
      }
    })

    return Array.from(townMap.values()).slice(0, 20) // Top 20 affordable options
  } catch (error) {
    console.error('Error finding affordable properties:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for affordable properties')
  const sampleTowns = ['ANG MO KIO', 'BEDOK', 'BUKIT BATOK', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']
  return sampleTowns.slice(0, 10).map(town => ({
    town,
    flatType: '4 ROOM',
    medianPrice: maxPrice * 0.8 + Math.random() * maxPrice * 0.2,
    p25Price: maxPrice * 0.7 + Math.random() * maxPrice * 0.15,
    txCount: Math.floor(Math.random() * 100) + 20,
    medianLeaseYears: 50 + Math.random() * 30,
  })).sort((a, b) => Math.abs(a.medianPrice - maxPrice) - Math.abs(b.medianPrice - maxPrice))
}

// Get Time & Access data directly by neighbourhood_id
export async function getNeighbourhoodTimeAccess(neighbourhoodId: string): Promise<NeighbourhoodTimeAccess | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('neighbourhood_access')
        .select('*')
        .eq('neighbourhood_id', neighbourhoodId)
        .single()
      
      if (error) {
        console.error('Error fetching neighbourhood access data:', error)
        return null
      }
      
      if (data) {
        // Get neighbourhood name for display
        const { data: neighbourhood } = await supabase
          .from('neighbourhoods')
          .select('id, name')
          .eq('id', neighbourhoodId)
          .single()

        // Map mrt_access_type to mrtDensity
        const getMrtDensity = (accessType: string): MrtDensity => {
          if (accessType === 'high') return 'high'
          if (accessType === 'medium') return 'medium'
          return 'low'
        }

        const mrtDensity = getMrtDensity(data.mrt_access_type || 'low')
        const transferComplexity = (data.transfer_complexity || '1_transfer') as TransferComplexity
        
        // Infer centrality and regionalHubAccess from MRT access
        const centrality: Centrality = mrtDensity === 'high' ? 'central' : 'non_central'
        const regionalHubAccess: RegionalHubAccess = mrtDensity === 'high' ? 'yes' : (mrtDensity === 'medium' ? 'partial' : 'no')

        return {
          neighbourhoodId: data.neighbourhood_id,
          neighbourhoodName: neighbourhood?.name,
          centrality,
          mrtDensity,
          transferComplexity,
          regionalHubAccess,
        }
      }
    }
  } catch (error) {
    console.error('Error fetching neighbourhood time access:', error)
  }
  
  return null
}

// Helper function: Get a representative neighbourhood_id for a town
// Returns the most common neighbourhood_id for the given town
export async function getNeighbourhoodIdFromTown(town: string): Promise<string | null> {
  try {
    if (supabase) {
      const normalizedTown = town.toUpperCase().trim()
      
      // Get neighbourhood_ids for this town, ordered by frequency
      const { data, error } = await supabase
        .from('raw_resale_2017')
        .select('neighbourhood_id')
        .eq('town', normalizedTown)
        .not('neighbourhood_id', 'is', null)
        .limit(10000)
      
      if (error) {
        console.error('Error fetching neighbourhood_id from town:', error)
        return null
      }
      
      if (!data || data.length === 0) {
        return null
      }
      
      // Count frequency of each neighbourhood_id
      const frequencyMap = new Map<string, number>()
      data.forEach(item => {
        if (item.neighbourhood_id) {
          frequencyMap.set(item.neighbourhood_id, (frequencyMap.get(item.neighbourhood_id) || 0) + 1)
        }
      })
      
      // Return the most common neighbourhood_id
      let maxCount = 0
      let mostCommonId: string | null = null
      frequencyMap.forEach((count, id) => {
        if (count > maxCount) {
          maxCount = count
          mostCommonId = id
        }
      })
      
      return mostCommonId
    }
  } catch (error) {
    console.error('Error getting neighbourhood_id from town:', error)
  }
  
  return null
}

