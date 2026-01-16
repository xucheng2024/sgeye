/**
 * GET /api/neighbourhoods/:id/transport-profile
 * 
 * Transport profile API for neighbourhood
 * Returns transport burden metrics and accessibility data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get access data
    const { data: accessData, error: accessError } = await supabase
      .from('neighbourhood_access')
      .select('*')
      .eq('neighbourhood_id', id)
      .maybeSingle()

    if (accessError) {
      console.error('Error fetching neighbourhood access:', accessError)
      return NextResponse.json(
        { error: 'Failed to fetch transport data', details: accessError.message },
        { status: 500 }
      )
    }

    if (!accessData) {
      return NextResponse.json(
        { error: 'Transport data not available for this neighbourhood' },
        { status: 404 }
      )
    }

    // Get neighbourhood name
    const { data: neighbourhood } = await supabase
      .from('neighbourhoods')
      .select('id, name')
      .eq('id', id)
      .maybeSingle()

    // Calculate transport burden metrics from access data
    const mrtStationCount = Number(accessData.mrt_station_count) || 0
    const busStopCount = Number(accessData.bus_stop_count) || 0
    const mrtAccessType = accessData.mrt_access_type || 'none'
    const transferComplexity = accessData.transfer_complexity || '1_transfer'
    const busDependency = accessData.bus_dependency || 'high'

    // Calculate central access burden (0-100)
    let centralAccessBurden = 50
    if (mrtAccessType === 'high') {
      if (mrtStationCount >= 4) centralAccessBurden = 10
      else if (mrtStationCount >= 2) centralAccessBurden = 15
      else centralAccessBurden = 20
    } else if (mrtAccessType === 'medium') {
      if (mrtStationCount >= 2) centralAccessBurden = 25
      else centralAccessBurden = 35
    } else if (mrtAccessType === 'low') {
      centralAccessBurden = 45
    } else {
      centralAccessBurden = 60
    }

    // Transfer burden (0-100)
    let transferBurden = 20
    if (transferComplexity === 'direct') {
      transferBurden = centralAccessBurden >= 40 ? 15 : 10
    } else if (transferComplexity === '1_transfer') {
      transferBurden = 25
    } else {
      transferBurden = 50
    }

    // Network redundancy (0-100, lower is better)
    let networkRedundancy = 30
    if (mrtStationCount >= 3) {
      networkRedundancy = 10
    } else if (mrtStationCount >= 1) {
      if (busStopCount >= 10) {
        networkRedundancy = 20
      } else if (busStopCount >= 5) {
        networkRedundancy = 28
      } else {
        networkRedundancy = 35
      }
    } else if (busStopCount >= 10) {
      networkRedundancy = 40
    } else {
      networkRedundancy = 55
    }

    // Daily mobility friction (0-100)
    let dailyMobilityFriction = 30
    if (busDependency === 'low') {
      dailyMobilityFriction = 10
    } else if (busDependency === 'medium') {
      dailyMobilityFriction = 20
    } else {
      dailyMobilityFriction = 35
    }

    // Determine distance band and commute category
    let distanceBand: 'central' | 'well_connected' | 'peripheral' = 'peripheral'
    let commuteCategory: 'Central' | 'Well-connected' | 'Peripheral' = 'Peripheral'
    
    if (centralAccessBurden <= 15) {
      distanceBand = 'central'
      commuteCategory = 'Central'
    } else if (centralAccessBurden <= 35) {
      distanceBand = 'well_connected'
      commuteCategory = 'Well-connected'
    }

    // Estimate MRT lines count
    const mrtLinesCount = mrtStationCount > 2 ? 2 : (mrtStationCount > 0 ? 1 : 0)
    
    // Average transfers to CBD
    const averageTransfersToCBD = transferComplexity === 'direct' ? 0 : (transferComplexity === '1_transfer' ? 1 : 2)

    const transportProfile = {
      neighbourhoodId: id,
      neighbourhoodName: neighbourhood?.name || null,
      centralAccessBurden,
      transferBurden,
      networkRedundancy,
      dailyMobilityFriction,
      mrtLinesCount,
      averageTransfersToCBD,
      distanceBand,
      commuteCategory,
    }

    return NextResponse.json(transportProfile, {
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
