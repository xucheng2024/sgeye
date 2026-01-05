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

    // Fetch neighbourhoods with access (summary will be calculated if flat_type is specified)
    const { data: neighbourhoods, error: neighbourhoodsError } = await supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        planning_areas(id, name),
        neighbourhood_access(
          mrt_station_count,
          mrt_access_type,
          avg_distance_to_mrt,
          updated_at
        ),
        mrt_stations(
          station_code,
          station_name,
          latitude,
          longitude
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

    // Calculate summary from monthly data if flat_type is specified, otherwise use neighbourhood_summary
    const summaryPromises = neighbourhoodIds.map(async (id: string) => {
      if (flat_type && flat_type !== 'All') {
        // Calculate from monthly data for specific flat type
        const { data: monthlyData } = await supabase
          .from('agg_neighbourhood_monthly')
          .select('median_price, median_psm, median_lease_years, tx_count, month')
          .eq('neighbourhood_id', id)
          .eq('flat_type', flat_type)
          .gte('month', startDate.toISOString().split('T')[0])
          .lte('month', endDate.toISOString().split('T')[0])
        
        if (monthlyData && monthlyData.length > 0) {
          // Filter out null/undefined values and convert to numbers
          const prices = monthlyData
            .map(m => m.median_price != null ? Number(m.median_price) : null)
            .filter((p): p is number => p !== null && p > 0 && !isNaN(p))
            .sort((a, b) => a - b)
          
          const psms = monthlyData
            .map(m => m.median_psm != null ? Number(m.median_psm) : null)
            .filter((p): p is number => p !== null && p > 0 && !isNaN(p))
            .sort((a, b) => a - b)
          
          const leases = monthlyData
            .map(m => m.median_lease_years != null ? Number(m.median_lease_years) : null)
            .filter((l): l is number => l !== null && l > 0 && !isNaN(l))
            .sort((a, b) => a - b)
          
          const txCounts = monthlyData.map(m => Number(m.tx_count) || 0)
          const totalTx = txCounts.reduce((a, b) => a + b, 0)
          
          // Calculate median: if even number of elements, take average of middle two
          const getMedian = (arr: number[]): number | null => {
            if (arr.length === 0) return null
            if (arr.length === 1) return arr[0]
            const mid = Math.floor(arr.length / 2)
            return arr.length % 2 === 0 
              ? (arr[mid - 1] + arr[mid]) / 2 
              : arr[mid]
          }
          
          return {
            id,
            summary: {
              tx_12m: totalTx,
              median_price_12m: getMedian(prices),
              median_psm_12m: getMedian(psms),
              median_lease_years_12m: getMedian(leases),
              updated_at: new Date().toISOString()
            }
          }
        }
        return { id, summary: null }
      } else {
        // Use neighbourhood_summary for all flat types
        const { data: summaryData } = await supabase
          .from('neighbourhood_summary')
          .select('tx_12m, median_price_12m, median_psm_12m, median_lease_years_12m, updated_at')
          .eq('neighbourhood_id', id)
          .single()
        
        return {
          id,
          summary: summaryData ? {
            tx_12m: summaryData.tx_12m,
            median_price_12m: summaryData.median_price_12m,
            median_psm_12m: summaryData.median_psm_12m,
            median_lease_years_12m: summaryData.median_lease_years_12m,
            updated_at: summaryData.updated_at
          } : null
        }
      }
    })

    const summaryResults = await Promise.all(summaryPromises)

    // Fetch MRT stations for neighbourhoods
    const mrtStationsMap = new Map<string, string[]>()
    
    // Get stations in area
    const { data: mrtStationsInArea } = await supabase
      .from('mrt_stations')
      .select('neighbourhood_id, station_code, station_name')
      .in('neighbourhood_id', neighbourhoodIds)
      .not('station_code', 'is', null)
    
    if (mrtStationsInArea) {
      mrtStationsInArea.forEach(station => {
        if (station.neighbourhood_id && station.station_code) {
          if (!mrtStationsMap.has(station.neighbourhood_id)) {
            mrtStationsMap.set(station.neighbourhood_id, [])
          }
          mrtStationsMap.get(station.neighbourhood_id)!.push(station.station_code)
        }
      })
    }
    
    // For neighbourhoods without stations in area, find nearest station
    const neighbourhoodsWithoutStations = neighbourhoodIds.filter(id => {
      return !mrtStationsMap.has(id) || mrtStationsMap.get(id)!.length === 0
    })
    
    if (neighbourhoodsWithoutStations.length > 0) {
      const { data: neighbourhoodsWithCenters } = await supabase
        .from('neighbourhoods')
        .select('id, center, bbox')
        .in('id', neighbourhoodsWithoutStations)
      
      const { data: allMrtStations } = await supabase
        .from('mrt_stations')
        .select('station_code, latitude, longitude')
        .not('station_code', 'is', null)
      
      if (neighbourhoodsWithCenters && allMrtStations && allMrtStations.length > 0) {
        for (const n of neighbourhoodsWithCenters) {
          let lat: number | null = null
          let lng: number | null = null
          
          if (n.center) {
            const center = typeof n.center === 'string' ? JSON.parse(n.center) : n.center
            if (center?.lat && center?.lng) {
              lat = center.lat
              lng = center.lng
            }
          }
          
          if ((lat === null || lng === null) && n.bbox) {
            const bbox = typeof n.bbox === 'string' ? JSON.parse(n.bbox) : n.bbox
            if (bbox && Array.isArray(bbox) && bbox.length === 4) {
              lat = (bbox[1] + bbox[3]) / 2
              lng = (bbox[0] + bbox[2]) / 2
            }
          }
          
          if (lat === null || lng === null) continue
          
          let nearestStation: { name: string; distance: number } | null = null
          
          for (const station of allMrtStations) {
            if (!station.latitude || !station.longitude) continue
            
            const R = 6371000
            const lat1 = lat * Math.PI / 180
            const lat2 = Number(station.latitude) * Math.PI / 180
            const deltaLat = (Number(station.latitude) - lat) * Math.PI / 180
            const deltaLng = (Number(station.longitude) - lng) * Math.PI / 180
            
            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                     Math.cos(lat1) * Math.cos(lat2) *
                     Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c
            
            if (!nearestStation || distance < nearestStation.distance) {
              nearestStation = { name: station.station_code, distance }
            }
          }
          
          if (nearestStation) {
            if (!mrtStationsMap.has(n.id)) {
              mrtStationsMap.set(n.id, [])
            }
            mrtStationsMap.get(n.id)!.push(nearestStation.name)
          }
        }
      }
    }

    // Combine data
    const comparison = neighbourhoodIds.map((id: string) => {
      const neighbourhood = neighbourhoods?.find((n: any) => n.id === id)
      const trendsData = trendsResults.find((t: any) => t.id === id)
      const summaryData = summaryResults.find((s: any) => s.id === id)

      // Supabase returns related data differently depending on relationship type
      // planning_areas might be returned as array or object
      // neighbourhood_access might be returned as array or object
      const planningAreaRaw = neighbourhood?.planning_areas
      const planningArea = Array.isArray(planningAreaRaw) 
        ? (planningAreaRaw.length > 0 ? planningAreaRaw[0] : null)
        : planningAreaRaw || null
      const accessRaw = neighbourhood?.neighbourhood_access
      const access = Array.isArray(accessRaw)
        ? (accessRaw.length > 0 ? accessRaw[0] : null)
        : accessRaw || null

      return {
        id,
        name: neighbourhood?.name || null,
        one_liner: neighbourhood?.one_liner || null,
        planning_area: planningArea && typeof planningArea === 'object' && 'id' in planningArea && 'name' in planningArea ? {
          id: planningArea.id,
          name: planningArea.name
        } : null,
        summary: summaryData?.summary || null,
        access: access && typeof access === 'object' && 'mrt_station_count' in access ? {
          mrt_station_count: access.mrt_station_count,
          mrt_access_type: access.mrt_access_type,
          avg_distance_to_mrt: access.avg_distance_to_mrt,
          mrt_station_names: mrtStationsMap.get(id) || [],
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

