/**
 * GET /api/neighbourhoods
 * 
 * Neighbourhood list API
 * Supports filtering by planning_area_id, flat_type, price, lease, MRT distance
 * 
 * Query params:
 * - planning_area_id: Filter by planning area (optional)
 * - flat_type: Filter by flat type (3 ROOM, 4 ROOM, 5 ROOM, etc.) (optional)
 * - price_min: Minimum price filter (optional)
 * - price_max: Maximum price filter (optional)
 * - lease_min: Minimum lease years filter (optional)
 * - lease_max: Maximum lease years filter (optional)
 * - mrt_distance_max: Maximum MRT distance in meters (optional)
 * - limit: Limit results (default: 100)
 * - offset: Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const planningAreaId = searchParams.get('planning_area_id')
    const flatType = searchParams.get('flat_type')
    const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null
    const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null
    const leaseMin = searchParams.get('lease_min') ? parseFloat(searchParams.get('lease_min')!) : null
    const leaseMax = searchParams.get('lease_max') ? parseFloat(searchParams.get('lease_max')!) : null
    const mrtDistanceMax = searchParams.get('mrt_distance_max') ? parseFloat(searchParams.get('mrt_distance_max')!) : null
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query: fetch neighbourhoods first, then join summary and access separately
    // This avoids Supabase join syntax issues
    let neighbourhoodsQuery = supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        type,
        created_at,
        updated_at,
        planning_areas(id, name)
      `)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter by planning area if provided
    if (planningAreaId) {
      neighbourhoodsQuery = neighbourhoodsQuery.eq('planning_area_id', planningAreaId)
    }

    const { data: neighbourhoodsData, error } = await neighbourhoodsQuery

    console.log('API: Fetched neighbourhoods from DB:', {
      flatType: flatType || 'All',
      count: neighbourhoodsData?.length || 0,
      planningAreaId
    })

    if (error) {
      console.error('Error fetching neighbourhoods:', error)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhoods', details: error.message },
        { status: 500 }
      )
    }

    if (!neighbourhoodsData || neighbourhoodsData.length === 0) {
      return NextResponse.json({
        neighbourhoods: [],
        count: 0,
        limit,
        offset
      })
    }

    // Get neighbourhood IDs
    const neighbourhoodIds = neighbourhoodsData.map(n => n.id)

    // Fetch summary data from agg_neighbourhood_monthly (last 12 months)
    // If flat_type is specified, filter by that type. Otherwise, get all types and merge.
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12)
    
    let monthlyQuery = supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id, flat_type, median_price, median_psm, median_lease_years, tx_count, avg_floor_area, month')
      .in('neighbourhood_id', neighbourhoodIds)
      .gte('month', startDate.toISOString().split('T')[0])
      .lte('month', endDate.toISOString().split('T')[0])
    
    // Filter by flat_type if specified
    if (flatType) {
      monthlyQuery = monthlyQuery.eq('flat_type', flatType)
    }
    
    const { data: monthlyData } = await monthlyQuery
    
    console.log('API: Monthly data from agg_neighbourhood_monthly:', {
      flatType: flatType || 'All',
      monthlyDataCount: monthlyData?.length || 0,
      uniqueNeighbourhoods: monthlyData ? [...new Set(monthlyData.map(m => m.neighbourhood_id))].length : 0,
      flatTypesInData: monthlyData ? [...new Set(monthlyData.map(m => m.flat_type))].sort() : []
    })
    
    // Aggregate by neighbourhood_id and flat_type first
    // Then combine all flat types for "All"
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
      flatType: flatType || 'All Types',
      neighbourhoodIdsQueried: neighbourhoodIds.length,
      flatTypeSummariesCount: flatTypeSummaries.length,
      neighbourhoodSummariesCount: neighbourhoodSummaries.size,
      finalSummaryDataCount: summaryData.length,
      neighbourhoodsWithSummary: summaryData.map(s => {
        const nbhd = neighbourhoodsData.find(n => n.id === s.neighbourhood_id)
        return nbhd?.name
      }).sort()
    })

    // Fetch access data separately
    const { data: accessData } = await supabase
      .from('neighbourhood_access')
      .select('*')
      .in('neighbourhood_id', neighbourhoodIds)

    // Create lookup maps
    const summaryMap = new Map()
    if (summaryData) {
      summaryData.forEach(s => {
        summaryMap.set(s.neighbourhood_id, s)
      })
    }

    const accessMap = new Map()
    if (accessData) {
      accessData.forEach(a => {
        accessMap.set(a.neighbourhood_id, a)
      })
    }

    // Transform data to flatten structure and apply filters
    let neighbourhoods = neighbourhoodsData.map(n => {
      const planningArea = Array.isArray(n.planning_areas) && n.planning_areas.length > 0
        ? n.planning_areas[0]
        : null
      const summary = summaryMap.get(n.id) || null
      const access = accessMap.get(n.id) || null
      
      // Get flat type summaries for this neighbourhood (for "All" mode)
      const flatTypeData = flatTypeSummaries.filter(s => s.neighbourhood_id === n.id)

      return {
        id: n.id,
        name: n.name,
        one_liner: n.one_liner,
        planning_area: planningArea ? {
          id: planningArea.id,
          name: planningArea.name
        } : null,
        type: n.type,
        summary: summary ? {
          tx_12m: summary.tx_12m,
          median_price_12m: summary.median_price_12m,
          median_psm_12m: summary.median_psm_12m,
          median_lease_years_12m: summary.median_lease_years_12m,
          avg_floor_area_12m: flatType ? 
            (flatTypeData.find(ft => ft.flat_type === flatType)?.avg_floor_area_12m ?? summary.avg_floor_area_12m) :
            summary.avg_floor_area_12m,
          updated_at: summary.updated_at
        } : null,
        flat_type_details: flatTypeData.map(ft => ({
          flat_type: ft.flat_type,
          tx_12m: ft.tx_12m,
          median_price_12m: ft.median_price_12m,
          median_psm_12m: ft.median_psm_12m,
          median_lease_years_12m: ft.median_lease_years_12m,
          avg_floor_area_12m: ft.avg_floor_area_12m
        })),
        access: access ? {
          mrt_station_count: access.mrt_station_count,
          mrt_access_type: access.mrt_access_type,
          avg_distance_to_mrt: access.avg_distance_to_mrt,
          updated_at: access.updated_at
        } : null,
        created_at: n.created_at,
        updated_at: n.updated_at
      }
    })

    console.log('API: Before filtering, neighbourhoods count:', neighbourhoods.length)
    console.log('API: Filter params:', { priceMin, priceMax, leaseMin, leaseMax, mrtDistanceMax, flatType })
    
    // Apply filters
    if (priceMin !== null || priceMax !== null || leaseMin !== null || leaseMax !== null || mrtDistanceMax !== null) {
      let beforeFilter = neighbourhoods.length
      let filteredByPrice = 0
      let filteredByLease = 0
      let filteredByMRT = 0
      
      neighbourhoods = neighbourhoods.filter(n => {
        // When flat_type is NOT specified ("All"), check if ANY flat type meets criteria
        // When flat_type IS specified, check that specific flat type's data
        
        if (!flatType) {
          // "All" mode: Check each flat type separately
          // A neighbourhood passes if ANY of its flat types meet the criteria
          const flatTypesForNeighbourhood = flatTypeSummaries.filter(
            s => s.neighbourhood_id === n.id
          )
          
          if (flatTypesForNeighbourhood.length === 0) {
            // No data for any flat type
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
            filteredByPrice++ // Could be price or lease, but we count it
            return false
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
          
          return true
          
        } else {
          // Specific flat type mode: Use the aggregated summary data
          
          // Price filter
          if (priceMin !== null || priceMax !== null) {
            const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
            if (price === null) {
              filteredByPrice++
              return false
            }
            if (priceMin !== null && price < priceMin) {
              filteredByPrice++
              return false
            }
            if (priceMax !== null && price > priceMax) {
              filteredByPrice++
              return false
            }
          }
          
          // Lease filter
          if (leaseMin !== null || leaseMax !== null) {
            const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
            if (lease === null) {
              filteredByLease++
              return false
            }
            if (leaseMin !== null && lease < leaseMin) {
              filteredByLease++
              return false
            }
            if (leaseMax !== null && lease > leaseMax) {
              filteredByLease++
              return false
            }
          }
          
          // MRT distance filter
          if (mrtDistanceMax !== null) {
            const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
            if (distance === null || (distance > 0 && distance > mrtDistanceMax)) {
              if (!n.access?.mrt_station_count || n.access.mrt_station_count === 0) {
                filteredByMRT++
                return false
              }
            }
          }
          
          return true
        }
      })
      
      console.log('API: After filtering:', {
        before: beforeFilter,
        after: neighbourhoods.length,
        filteredByPrice,
        filteredByLease,
        filteredByMRT
      })
      
      // Debug: if no results after filtering, log more details
      if (neighbourhoods.length === 0 && beforeFilter > 0) {
        console.log('API: No results after filtering. Filter criteria:', {
          priceMin,
          priceMax,
          leaseMin,
          leaseMax,
          mrtDistanceMax,
          message: `Filtered out ${filteredByPrice} by price, ${filteredByLease} by lease, ${filteredByMRT} by MRT`
        })
      }
    }

    return NextResponse.json({
      neighbourhoods,
      count: neighbourhoods.length,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

