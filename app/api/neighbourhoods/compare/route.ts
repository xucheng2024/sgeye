/**
 * POST /api/neighbourhoods/compare
 * 
 * Neighbourhood comparison API
 * 
 * Body:
 * {
 *   "ids": ["neighbourhood-id-1", "neighbourhood-id-2"],
 *   "months": 24,
 *   "flat_type": "4 ROOM"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, months = 24, flat_type } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    // Limit to 3 neighbourhoods for comparison
    const neighbourhoodIds = ids.slice(0, 3)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Fetch neighbourhoods with access (summary will be calculated if flat_type is specified)
    const { data: neighbourhoods, error: neighbourhoodsError } = await supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        planning_areas(id, name),
        neighbourhood_access(
          mrt_station_count,
          mrt_access_type,
          avg_distance_to_mrt,
          updated_at
        )
      `)
      .in('id', neighbourhoodIds)

    if (neighbourhoodsError) {
      console.error('Error fetching neighbourhoods:', neighbourhoodsError)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhoods', details: neighbourhoodsError.message },
        { status: 500 }
      )
    }

    // Fetch trends for each neighbourhood
    const trendsPromises = neighbourhoodIds.map(async (id: string) => {
      let query = supabase
        .from('agg_neighbourhood_monthly')
        .select('*')
        .eq('neighbourhood_id', id)
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])
        .order('month', { ascending: true })

      if (flat_type && flat_type !== 'All') {
        query = query.eq('flat_type', flat_type)
      }

      const { data, error } = await query
      return { id, trends: data || [], error }
    })

    const trendsResults = await Promise.all(trendsPromises)

    // Calculate summary from monthly data if flat_type is specified, otherwise use neighbourhood_summary
    const summaryPromises = neighbourhoodIds.map(async (id: string) => {
      if (flat_type && flat_type !== 'All') {
        // Calculate from monthly data for specific flat type
        const { data: monthlyData } = await supabase
          .from('agg_neighbourhood_monthly')
          .select('median_price, median_psm, median_lease_years, tx_count, month')
          .eq('neighbourhood_id', id)
          .eq('flat_type', flat_type)
          .gte('month', startDate.toISOString().split('T')[0])
          .lte('month', endDate.toISOString().split('T')[0])
        
        if (monthlyData && monthlyData.length > 0) {
          const prices = monthlyData.map(m => Number(m.median_price)).filter(p => p > 0 && !isNaN(p)).sort((a, b) => a - b)
          const psms = monthlyData.map(m => Number(m.median_psm)).filter(p => p > 0 && !isNaN(p)).sort((a, b) => a - b)
          const leases = monthlyData.map(m => Number(m.median_lease_years)).filter(l => l > 0 && !isNaN(l)).sort((a, b) => a - b)
          const txCounts = monthlyData.map(m => Number(m.tx_count) || 0)
          
          return {
            id,
            summary: {
              tx_12m: txCounts.reduce((a, b) => a + b, 0),
              median_price_12m: prices.length > 0 ? prices[Math.floor(prices.length / 2)] : null,
              median_psm_12m: psms.length > 0 ? psms[Math.floor(psms.length / 2)] : null,
              median_lease_years_12m: leases.length > 0 ? leases[Math.floor(leases.length / 2)] : null,
              updated_at: new Date().toISOString()
            }
          }
        }
        return { id, summary: null }
      } else {
        // Use neighbourhood_summary for all flat types
        const { data: summaryData } = await supabase
          .from('neighbourhood_summary')
          .select('tx_12m, median_price_12m, median_psm_12m, median_lease_years_12m, updated_at')
          .eq('neighbourhood_id', id)
          .single()
        
        return {
          id,
          summary: summaryData ? {
            tx_12m: summaryData.tx_12m,
            median_price_12m: summaryData.median_price_12m,
            median_psm_12m: summaryData.median_psm_12m,
            median_lease_years_12m: summaryData.median_lease_years_12m,
            updated_at: summaryData.updated_at
          } : null
        }
      }
    })

    const summaryResults = await Promise.all(summaryPromises)

    // Combine data
    const comparison = neighbourhoodIds.map((id: string) => {
      const neighbourhood = neighbourhoods?.find((n: any) => n.id === id)
      const trendsData = trendsResults.find((t: any) => t.id === id)
      const summaryData = summaryResults.find((s: any) => s.id === id)

      // Supabase returns related data as arrays even for one-to-one relationships
      const planningArea = Array.isArray(neighbourhood?.planning_areas) && neighbourhood.planning_areas.length > 0
        ? neighbourhood.planning_areas[0]
        : null
      const access = Array.isArray(neighbourhood?.neighbourhood_access) && neighbourhood.neighbourhood_access.length > 0
        ? neighbourhood.neighbourhood_access[0]
        : null

      return {
        id,
        name: neighbourhood?.name || null,
        one_liner: neighbourhood?.one_liner || null,
        planning_area: planningArea ? {
          id: planningArea.id,
          name: planningArea.name
        } : null,
        summary: summaryData?.summary || null,
        access: access ? {
          mrt_station_count: access.mrt_station_count,
          mrt_access_type: access.mrt_access_type,
          avg_distance_to_mrt: access.avg_distance_to_mrt,
          updated_at: access.updated_at
        } : null,
        trends: trendsData?.trends || []
      }
    })

    return NextResponse.json({
      comparison,
      months,
      flat_type: flat_type || 'All'
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

