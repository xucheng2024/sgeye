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
import { getNeighbourhoods, parseQueryParams } from '@/lib/neighbourhoods'

export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = parseQueryParams(searchParams)
    
    const result = await getNeighbourhoods(params)
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
