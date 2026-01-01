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
    let query = supabase
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
      query = query.eq('planning_area_id', planningAreaId)
    }

    const { data: neighbourhoodsData, error } = await query

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

    // Fetch summary data - if flat_type is specified, get from agg_neighbourhood_monthly instead
    let summaryData: any[] | null = null
    if (flatType) {
      // Get data for specific flat type from agg_neighbourhood_monthly (last 12 months)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 12)
      
      const { data: monthlyData } = await supabase
        .from('agg_neighbourhood_monthly')
        .select('neighbourhood_id, flat_type, median_price, median_psm, median_lease_years, tx_count, month')
        .in('neighbourhood_id', neighbourhoodIds)
        .eq('flat_type', flatType)
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])
      
      // Aggregate by neighbourhood_id
      const tempSummaryMap = new Map()
      if (monthlyData) {
        monthlyData.forEach(item => {
          const nbhdId = item.neighbourhood_id
          if (!tempSummaryMap.has(nbhdId)) {
            tempSummaryMap.set(nbhdId, {
              neighbourhood_id: nbhdId,
              prices: [],
              psms: [],
              leases: [],
              txCounts: []
            })
          }
          const entry = tempSummaryMap.get(nbhdId)
          if (item.median_price) entry.prices.push(Number(item.median_price))
          if (item.median_psm) entry.psms.push(Number(item.median_psm))
          if (item.median_lease_years) entry.leases.push(Number(item.median_lease_years))
          if (item.tx_count) entry.txCounts.push(Number(item.tx_count))
        })
      }
      
      // Calculate medians
      summaryData = Array.from(tempSummaryMap.values()).map(entry => {
        const sortedPrices = entry.prices.sort((a: number, b: number) => a - b)
        const sortedPsms = entry.psms.sort((a: number, b: number) => a - b)
        const sortedLeases = entry.leases.sort((a: number, b: number) => a - b)
        
        return {
          neighbourhood_id: entry.neighbourhood_id,
          tx_12m: entry.txCounts.reduce((a: number, b: number) => a + b, 0),
          median_price_12m: sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : null,
          median_psm_12m: sortedPsms.length > 0 ? sortedPsms[Math.floor(sortedPsms.length / 2)] : null,
          median_lease_years_12m: sortedLeases.length > 0 ? sortedLeases[Math.floor(sortedLeases.length / 2)] : null,
          updated_at: new Date().toISOString()
        }
      })
    } else {
      // Use neighbourhood_summary (aggregated across all flat types)
      const { data } = await supabase
        .from('neighbourhood_summary')
        .select('*')
        .in('neighbourhood_id', neighbourhoodIds)
      summaryData = data
    }

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
          updated_at: summary.updated_at
        } : null,
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

    // Apply filters
    if (priceMin !== null || priceMax !== null || leaseMin !== null || leaseMax !== null || mrtDistanceMax !== null) {
      neighbourhoods = neighbourhoods.filter(n => {
        // Price filter
        if (priceMin !== null || priceMax !== null) {
          const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
          if (price === null) return false
          if (priceMin !== null && price < priceMin) return false
          if (priceMax !== null && price > priceMax) return false
        }
        
        // Lease filter
        if (leaseMin !== null || leaseMax !== null) {
          const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
          if (lease === null) return false
          if (leaseMin !== null && lease < leaseMin) return false
          if (leaseMax !== null && lease > leaseMax) return false
        }
        
        // MRT distance filter
        if (mrtDistanceMax !== null) {
          const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
          // If has stations in boundary, distance is 0, so it passes
          // If no stations, check distance
          if (distance === null || (distance > 0 && distance > mrtDistanceMax)) {
            // Also check if has stations (distance would be 0 or null)
            if (!n.access?.mrt_station_count || n.access.mrt_station_count === 0) {
              return false
            }
          }
        }
        
        return true
      })
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

