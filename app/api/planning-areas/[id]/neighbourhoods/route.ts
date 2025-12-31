/**
 * GET /api/planning-areas/:id/neighbourhoods
 * 
 * Get neighbourhoods for a planning area
 * Returns only neighbourhood list + names (no metrics) - for navigation only
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

    // Fetch planning area
    const { data: planningArea, error: paError } = await supabase
      .from('planning_areas')
      .select('id, name')
      .eq('id', id)
      .single()

    if (paError) {
      if (paError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Planning area not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch planning area', details: paError.message },
        { status: 500 }
      )
    }

    // Fetch neighbourhoods (only basic info, no metrics)
    const { data: neighbourhoods, error: neighbourhoodsError } = await supabase
      .from('neighbourhoods')
      .select('id, name, one_liner, type')
      .eq('planning_area_id', id)
      .order('name', { ascending: true })

    if (neighbourhoodsError) {
      console.error('Error fetching neighbourhoods:', neighbourhoodsError)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhoods', details: neighbourhoodsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      planning_area: {
        id: planningArea.id,
        name: planningArea.name
      },
      neighbourhoods: (neighbourhoods || []).map(n => ({
        id: n.id,
        name: n.name,
        one_liner: n.one_liner,
        type: n.type
      })),
      count: (neighbourhoods || []).length
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

