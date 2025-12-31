/**
 * GET /api/neighbourhoods
 * 
 * Neighbourhood list API
 * Supports filtering by planning_area_id
 * 
 * Query params:
 * - planning_area_id: Filter by planning area (optional)
 * - limit: Limit results (default: 100)
 * - offset: Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const planningAreaId = searchParams.get('planning_area_id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query: join neighbourhoods with summary and access
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
        planning_areas!inner(id, name),
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
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter by planning area if provided
    if (planningAreaId) {
      query = query.eq('planning_area_id', planningAreaId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching neighbourhoods:', error)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhoods', details: error.message },
        { status: 500 }
      )
    }

    // Transform data to flatten structure
    const neighbourhoods = (data || []).map(n => ({
      id: n.id,
      name: n.name,
      one_liner: n.one_liner,
      planning_area: n.planning_areas ? {
        id: n.planning_areas.id,
        name: n.planning_areas.name
      } : null,
      type: n.type,
      summary: n.neighbourhood_summary ? {
        tx_12m: n.neighbourhood_summary.tx_12m,
        median_price_12m: n.neighbourhood_summary.median_price_12m,
        median_psm_12m: n.neighbourhood_summary.median_psm_12m,
        median_lease_years_12m: n.neighbourhood_summary.median_lease_years_12m,
        updated_at: n.neighbourhood_summary.updated_at
      } : null,
      access: n.neighbourhood_access ? {
        mrt_station_count: n.neighbourhood_access.mrt_station_count,
        mrt_access_type: n.neighbourhood_access.mrt_access_type,
        avg_distance_to_mrt: n.neighbourhood_access.avg_distance_to_mrt,
        updated_at: n.neighbourhood_access.updated_at
      } : null,
      created_at: n.created_at,
      updated_at: n.updated_at
    }))

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

