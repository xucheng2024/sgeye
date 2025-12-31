/**
 * GET /api/neighbourhoods/:id
 * 
 * Neighbourhood detail API
 * Returns neighbourhood info with summary and access data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch neighbourhood with summary, access, and planning area
    const { data, error } = await supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        type,
        created_at,
        updated_at,
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Neighbourhood not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching neighbourhood:', error)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhood', details: error.message },
        { status: 500 }
      )
    }

    // Transform data
    const neighbourhood = {
      id: data.id,
      name: data.name,
      one_liner: data.one_liner,
      planning_area: data.planning_areas ? {
        id: data.planning_areas.id,
        name: data.planning_areas.name
      } : null,
      type: data.type,
      summary: data.neighbourhood_summary ? {
        tx_12m: data.neighbourhood_summary.tx_12m,
        median_price_12m: data.neighbourhood_summary.median_price_12m,
        median_psm_12m: data.neighbourhood_summary.median_psm_12m,
        median_lease_years_12m: data.neighbourhood_summary.median_lease_years_12m,
        updated_at: data.neighbourhood_summary.updated_at
      } : null,
      access: data.neighbourhood_access ? {
        mrt_station_count: data.neighbourhood_access.mrt_station_count,
        mrt_access_type: data.neighbourhood_access.mrt_access_type,
        avg_distance_to_mrt: data.neighbourhood_access.avg_distance_to_mrt,
        updated_at: data.neighbourhood_access.updated_at
      } : null,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json(neighbourhood)
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

