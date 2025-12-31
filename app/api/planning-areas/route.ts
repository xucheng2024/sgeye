/**
 * GET /api/planning-areas
 * 
 * Planning Area list API
 * Returns only basic info (no metrics) - used for navigation/grouping only
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('planning_areas')
      .select('id, name, created_at, updated_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching planning areas:', error)
      return NextResponse.json(
        { error: 'Failed to fetch planning areas', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      planning_areas: data || [],
      count: (data || []).length
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

