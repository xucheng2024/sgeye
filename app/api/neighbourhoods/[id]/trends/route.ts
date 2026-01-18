/**
 * GET /api/neighbourhoods/:id/trends
 * 
 * Neighbourhood trends (time series) API
 * Returns monthly aggregated data for the neighbourhood
 * 
 * Query params:
 * - flat_type: Filter by flat type (optional)
 * - months: Number of months to return (default: 24)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export const revalidate = 3600 // Revalidate every hour (data changes daily)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const flatType = searchParams.get('flat_type')
    const months = parseInt(searchParams.get('months') || '24')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Build query
    let query = supabase
      .from('agg_neighbourhood_monthly')
      .select('*')
      .eq('neighbourhood_id', id)
      .gte('month', startDate.toISOString().split('T')[0])
      .lte('month', endDate.toISOString().split('T')[0])
      .order('month', { ascending: true })

    if (flatType && flatType !== 'All') {
      query = query.eq('flat_type', flatType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching trends:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trends', details: error.message },
        { status: 500 }
      )
    }

    // Transform data
    const trends = (data || []).map(item => ({
      month: item.month,
      flat_type: item.flat_type,
      tx_count: item.tx_count,
      median_price: item.median_price,
      p25_price: item.p25_price,
      p75_price: item.p75_price,
      median_psm: item.median_psm,
      median_lease_years: item.median_lease_years,
      avg_floor_area: item.avg_floor_area
    }))

    return NextResponse.json({
      neighbourhood_id: id,
      trends,
      count: trends.length,
      months_requested: months
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

