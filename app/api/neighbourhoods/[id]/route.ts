/**
 * GET /api/neighbourhoods/:id
 * 
 * Neighbourhood detail API
 * Returns neighbourhood info with summary and access data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch neighbourhood with summary, access, and planning area
    // First try with join, if that fails, fetch separately
    let { data, error } = await supabase
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
      .eq('id', id)
      .single()
    
    // If inner join fails (no planning area), try with left join
    if (error && error.code === 'PGRST116') {
      const { data: data2, error: error2 } = await supabase
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
      
      if (!error2) {
        data = data2
        error = null
      }
    }

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

    if (!data) {
      return NextResponse.json(
        { error: 'Neighbourhood not found' },
        { status: 404 }
      )
    }

    // Transform data
    // Supabase returns related data as arrays even for one-to-one relationships
    const planningArea = Array.isArray(data.planning_areas) && data.planning_areas.length > 0 
      ? data.planning_areas[0] 
      : null
    const summary = Array.isArray(data.neighbourhood_summary) && data.neighbourhood_summary.length > 0
      ? data.neighbourhood_summary[0]
      : null
    const access = Array.isArray(data.neighbourhood_access) && data.neighbourhood_access.length > 0
      ? data.neighbourhood_access[0]
      : null

    // If planning_area is null but planning_area_id exists, try to fetch it separately
    let finalPlanningArea = planningArea
    if (!finalPlanningArea && data.planning_area_id) {
      const { data: paData } = await supabase
        .from('planning_areas')
        .select('id, name')
        .eq('id', data.planning_area_id)
        .single()
      
      if (paData) {
        finalPlanningArea = paData
      }
    }

    const neighbourhood = {
      id: data.id,
      name: data.name,
      one_liner: data.one_liner,
      planning_area: finalPlanningArea ? {
        id: finalPlanningArea.id,
        name: finalPlanningArea.name
      } : (data.planning_area_id ? {
        id: data.planning_area_id,
        name: null // Will be filled by frontend if needed
      } : null),
      type: data.type,
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

