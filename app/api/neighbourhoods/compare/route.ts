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

      // Supabase returns related data as arrays even for one-to-one relationships
      const planningArea = Array.isArray(neighbourhood?.planning_areas) && neighbourhood.planning_areas.length > 0
        ? neighbourhood.planning_areas[0]
        : null
      const summary = Array.isArray(neighbourhood?.neighbourhood_summary) && neighbourhood.neighbourhood_summary.length > 0
        ? neighbourhood.neighbourhood_summary[0]
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

