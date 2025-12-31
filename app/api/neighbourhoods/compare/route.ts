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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

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

    // Fetch neighbourhoods with summary and access
    const { data: neighbourhoods, error: neighbourhoodsError } = await supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        planning_areas(id, name),
        neighbourhood_summary(
          tx_12m,
          median_price_12m,
          median_psm_12m,
          median_lease_years_12m,
          updated_at
        ),
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

    // Combine data
    const comparison = neighbourhoodIds.map((id: string) => {
      const neighbourhood = neighbourhoods?.find((n: any) => n.id === id)
      const trendsData = trendsResults.find((t: any) => t.id === id)

      return {
        id,
        name: neighbourhood?.name || null,
        one_liner: neighbourhood?.one_liner || null,
        planning_area: neighbourhood?.planning_areas ? {
          id: neighbourhood.planning_areas.id,
          name: neighbourhood.planning_areas.name
        } : null,
        summary: neighbourhood?.neighbourhood_summary ? {
          tx_12m: neighbourhood.neighbourhood_summary.tx_12m,
          median_price_12m: neighbourhood.neighbourhood_summary.median_price_12m,
          median_psm_12m: neighbourhood.neighbourhood_summary.median_psm_12m,
          median_lease_years_12m: neighbourhood.neighbourhood_summary.median_lease_years_12m,
          updated_at: neighbourhood.neighbourhood_summary.updated_at
        } : null,
        access: neighbourhood?.neighbourhood_access ? {
          mrt_station_count: neighbourhood.neighbourhood_access.mrt_station_count,
          mrt_access_type: neighbourhood.neighbourhood_access.mrt_access_type,
          avg_distance_to_mrt: neighbourhood.neighbourhood_access.avg_distance_to_mrt,
          updated_at: neighbourhood.neighbourhood_access.updated_at
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

