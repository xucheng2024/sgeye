/**
 * GET /api/affordability/reality-check
 * 
 * Returns reality check statistics based on budget and flat type
 * Calculates P25-P75 ranges for key dimensions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const budget = parseFloat(searchParams.get('budget') || '0')
    const flatType = searchParams.get('flat_type') || null
    const budgetTolerance = parseFloat(searchParams.get('tolerance') || '0.1') // Default ±10%

    if (budget <= 0) {
      return NextResponse.json(
        { error: 'Budget is required' },
        { status: 400 }
      )
    }

    const priceMin = budget * (1 - budgetTolerance)
    const priceMax = budget * (1 + budgetTolerance)

    // Get last 12 months data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12)

    // Query aggregated monthly data within budget range
    // First, get all monthly data for the period
    let query = supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id, flat_type, median_price, median_lease_years, avg_floor_area, tx_count, month')
      .gte('month', startDate.toISOString().split('T')[0])
      .lte('month', endDate.toISOString().split('T')[0])
      .not('median_price', 'is', null)

    if (flatType) {
      query = query.eq('flat_type', flatType)
    }

    const { data: monthlyData, error } = await query

    if (error) {
      console.error('Error fetching reality check data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reality check data', details: error.message },
        { status: 500 }
      )
    }

    if (!monthlyData || monthlyData.length === 0) {
      return NextResponse.json({
        lease: { p25: null, p75: null },
        size: { p25: null, p75: null },
        mrtAccess: { category: 'unknown', percentage: 0 },
        schoolPressure: { level: 'varies' },
        resaleActivity: { level: 'unknown', medianTx: 0 },
      })
    }

    // Filter by budget range after fetching (to get better coverage)
    const filteredData = monthlyData.filter(d => {
      const price = d.median_price ? Number(d.median_price) : null
      return price !== null && price >= priceMin && price <= priceMax
    })

    if (filteredData.length === 0) {
      return NextResponse.json({
        lease: { p25: null, p75: null },
        size: { p25: null, p75: null },
        mrtAccess: { category: 'unknown', percentage: 0 },
        schoolPressure: { level: 'varies' },
        resaleActivity: { level: 'unknown', medianTx: 0 },
      })
    }

    // Aggregate by neighbourhood + flat_type (to get representative values)
    // Group by neighbourhood_id + flat_type, then take median of medians
    const grouped = new Map<string, {
      leases: number[]
      sizes: number[]
      txCounts: number[]
    }>()

    filteredData.forEach(d => {
      const key = `${d.neighbourhood_id}__${d.flat_type}`
      if (!grouped.has(key)) {
        grouped.set(key, { leases: [], sizes: [], txCounts: [] })
      }
      const group = grouped.get(key)!
      
      if (d.median_lease_years !== null && d.median_lease_years !== undefined) {
        const lease = Number(d.median_lease_years)
        if (!isNaN(lease)) group.leases.push(lease)
      }
      if (d.avg_floor_area !== null && d.avg_floor_area !== undefined) {
        const size = Number(d.avg_floor_area)
        if (!isNaN(size)) group.sizes.push(size)
      }
      if (d.tx_count !== null && d.tx_count !== undefined) {
        group.txCounts.push(Number(d.tx_count))
      }
    })

    // Calculate representative values per neighbourhood+flat_type (median of monthly medians)
    const representativeLeases: number[] = []
    const representativeSizes: number[] = []
    const totalTxCounts: number[] = []

    grouped.forEach(group => {
      // Median of monthly medians for lease
      if (group.leases.length > 0) {
        const sorted = group.leases.sort((a, b) => a - b)
        representativeLeases.push(sorted[Math.floor(sorted.length / 2)])
      }
      // Average of monthly averages for size (or median if preferred)
      if (group.sizes.length > 0) {
        const sorted = group.sizes.sort((a, b) => a - b)
        representativeSizes.push(sorted[Math.floor(sorted.length / 2)])
      }
      // Sum of tx_counts (total transactions over period)
      if (group.txCounts.length > 0) {
        totalTxCounts.push(group.txCounts.reduce((a, b) => a + b, 0))
      }
    })

    // Calculate percentiles from representative values
    representativeLeases.sort((a, b) => a - b)
    representativeSizes.sort((a, b) => a - b)
    totalTxCounts.sort((a, b) => a - b)

    const leaseP25 = representativeLeases.length > 0 ? representativeLeases[Math.floor(representativeLeases.length * 0.25)] : null
    const leaseP75 = representativeLeases.length > 0 ? representativeLeases[Math.floor(representativeLeases.length * 0.75)] : null

    const sizeP25 = representativeSizes.length > 0 ? representativeSizes[Math.floor(representativeSizes.length * 0.25)] : null
    const sizeP75 = representativeSizes.length > 0 ? representativeSizes[Math.floor(representativeSizes.length * 0.75)] : null

    // Get neighbourhood IDs to check MRT access (from filtered data)
    const neighbourhoodIds = [...new Set(filteredData.map(d => d.neighbourhood_id))]
    const { data: accessData } = await supabase
      .from('neighbourhood_access')
      .select('neighbourhood_id, mrt_station_count, avg_distance_to_mrt')
      .in('neighbourhood_id', neighbourhoodIds)

    // Categorize MRT access
    const mrtCategories: Record<string, number> = { 'mrt-first': 0, 'mixed': 0, 'bus-first': 0 }
    
    if (accessData && accessData.length > 0) {
      accessData.forEach(access => {
        const distance = access.avg_distance_to_mrt ? Number(access.avg_distance_to_mrt) : null
        const stationCount = access.mrt_station_count || 0

        if (stationCount > 0) {
          // Has stations in area = MRT-first
          mrtCategories['mrt-first']++
        } else if (distance !== null && distance > 0 && distance <= 500) {
          // Walkable distance = MRT-first
          mrtCategories['mrt-first']++
        } else if (distance !== null && distance > 500 && distance <= 1000) {
          // Medium distance = Mixed
          mrtCategories['mixed']++
        } else {
          // Far or no data = Bus-first
          mrtCategories['bus-first']++
        }
      })
    } else {
      // No access data = assume bus-first
      mrtCategories['bus-first'] = neighbourhoodIds.length
    }

    const totalAccess = accessData?.length || neighbourhoodIds.length || 1
    const dominantMrtCategory = Object.entries(mrtCategories)
      .sort((a, b) => b[1] - a[1])[0]

    // Calculate resale activity (using total transactions per neighbourhood+flat_type)
    const medianTx = totalTxCounts.length > 0 ? totalTxCounts[Math.floor(totalTxCounts.length / 2)] : 0

    let resaleActivityLevel = 'unknown'
    if (medianTx < 20) {
      resaleActivityLevel = 'thin'
    } else if (medianTx < 50) {
      resaleActivityLevel = 'moderate'
    } else {
      resaleActivityLevel = 'active'
    }

    return NextResponse.json({
      lease: {
        p25: leaseP25 ? Math.round(leaseP25) : null,
        p75: leaseP75 ? Math.round(leaseP75) : null,
      },
      size: {
        p25: sizeP25 ? Math.round(sizeP25) : null,
        p75: sizeP75 ? Math.round(sizeP75) : null,
      },
      mrtAccess: {
        category: dominantMrtCategory[0],
        percentage: Math.round((dominantMrtCategory[1] / totalAccess) * 100),
      },
      schoolPressure: {
        level: 'varies', // We'll enhance this later with SPI data
      },
      resaleActivity: {
        level: resaleActivityLevel,
        medianTx: medianTx,
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

