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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Support comma-separated values for multi-select
    const planningAreaIdParam = searchParams.get('planning_area_id')
    const flatTypeParam = searchParams.get('flat_type')
    const planningAreaIds = planningAreaIdParam ? planningAreaIdParam.split(',').filter(id => id.trim() !== '') : []
    const flatTypes = flatTypeParam ? flatTypeParam.split(',').filter(ft => ft.trim() !== '') : []
    
    const region = searchParams.get('region')
    const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null
    const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null
    const leaseMin = searchParams.get('lease_min') ? parseFloat(searchParams.get('lease_min')!) : null
    const leaseMax = searchParams.get('lease_max') ? parseFloat(searchParams.get('lease_max')!) : null
    const mrtDistanceMax = searchParams.get('mrt_distance_max') ? parseFloat(searchParams.get('mrt_distance_max')!) : null
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query: fetch neighbourhoods first, then join summary and access separately
    // This avoids Supabase join syntax issues
    // Calculate center point from geom using PostGIS ST_Centroid
    // We'll use a raw query to get the centroid
    let neighbourhoodsQuery = supabase
      .from('neighbourhoods')
      .select(`
        id,
        name,
        one_liner,
        planning_area_id,
        type,
        bbox,
        center,
        created_at,
        updated_at,
        planning_areas(id, name, region)
      `)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter by planning area(s) if provided (multi-select support)
    if (planningAreaIds.length > 0) {
      if (planningAreaIds.length === 1) {
        neighbourhoodsQuery = neighbourhoodsQuery.eq('planning_area_id', planningAreaIds[0])
      } else {
        neighbourhoodsQuery = neighbourhoodsQuery.in('planning_area_id', planningAreaIds)
      }
    }

    const { data: neighbourhoodsData, error } = await neighbourhoodsQuery

    console.log('API: Fetched neighbourhoods from DB:', {
      flatTypes: flatTypes.length > 0 ? flatTypes : ['All'],
      count: neighbourhoodsData?.length || 0,
      planningAreaIds: planningAreaIds.length > 0 ? planningAreaIds : 'All'
    })
    
    // Debug: Check if region is being returned in planning_areas
    if (neighbourhoodsData && neighbourhoodsData.length > 0) {
      const sample = neighbourhoodsData.find(n => n.planning_areas && n.planning_areas.length > 0)
      if (sample && sample.planning_areas && sample.planning_areas[0]) {
        console.log('Sample planning_area structure:', {
          id: sample.planning_areas[0].id,
          name: sample.planning_areas[0].name,
          region: sample.planning_areas[0].region,
          allKeys: Object.keys(sample.planning_areas[0])
        })
      }
    }

    if (error) {
      console.error('Error fetching neighbourhoods:', error)
      return NextResponse.json(
        { error: 'Failed to fetch neighbourhoods', details: error.message },
        { status: 500 }
      )
    }

    if (!neighbourhoodsData || neighbourhoodsData.length === 0) {
      return NextResponse.json({
        neighbourhoods: [],
        count: 0,
        limit,
        offset
      })
    }

    // Get neighbourhood IDs
    const neighbourhoodIds = neighbourhoodsData.map(n => n.id)

    // Get centre points - prefer database center, fallback to calculating from transactions
    const centerPointsMap = new Map<string, { lat: number; lng: number }>()
    
    // First, use centers from database if available
    neighbourhoodsData.forEach(n => {
      if (n.center) {
        try {
          const center = typeof n.center === 'string' ? JSON.parse(n.center) : n.center
          if (center?.lat && center?.lng) {
            centerPointsMap.set(n.id, { lat: center.lat, lng: center.lng })
          }
        } catch (e) {
          console.error('Error parsing center for neighbourhood', n.id, ':', e)
        }
      }
    })
    
    console.log('Centers from database:', {
      count: centerPointsMap.size,
      sample: Array.from(centerPointsMap.entries()).slice(0, 3)
    })
    
    // For neighbourhoods without database center, try to calculate from raw_resale_2017
    const neighbourhoodsNeedingCenter = neighbourhoodIds.filter(id => !centerPointsMap.has(id))
    if (neighbourhoodsNeedingCenter.length > 0) {
      console.log('Calculating centers for', neighbourhoodsNeedingCenter.length, 'neighbourhoods from transaction data')
      console.log('Fetching location data for neighbourhood IDs:', neighbourhoodsNeedingCenter.slice(0, 5))
      
      // Remove limit to get all data, or use a much higher limit
      const { data: locationData, error: locationError } = await supabase
        .from('raw_resale_2017')
        .select('neighbourhood_id, latitude, longitude')
        .in('neighbourhood_id', neighbourhoodsNeedingCenter)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(50000) // Increased limit to ensure we get all data
      
      if (locationError) {
        console.error('Error fetching location data:', locationError)
      }
      
      console.log('Raw location query result:', { 
        returned: locationData?.length || 0,
        sampleIds: locationData?.slice(0, 5).map(d => d.neighbourhood_id) || []
      })
      
      if (locationData && locationData.length > 0) {
        const uniqueIdsInData = [...new Set(locationData.map(item => item.neighbourhood_id).filter(Boolean))]
        const missingIds = neighbourhoodIds.filter(id => !uniqueIdsInData.includes(id))
        console.log('Location data fetched:', { 
          count: locationData.length, 
          sample: locationData.slice(0, 3),
          neighbourhoodIdsQueried: neighbourhoodIds.length,
          uniqueNeighbourhoodIdsInData: uniqueIdsInData.length,
          uniqueIdsList: uniqueIdsInData.slice(0, 10),
          queriedIds: neighbourhoodIds.slice(0, 10),
          missingFromData: missingIds.slice(0, 10),
          missingNames: missingIds.map(id => neighbourhoodsData.find(n => n.id === id)?.name).slice(0, 10)
        })
        
        // Calculate average lat/lng for each neighbourhood
        const locationMap = new Map<string, { lats: number[]; lngs: number[] }>()
        let skippedCount = 0
        let skippedSamples: any[] = []
        locationData.forEach(item => {
          if (item.neighbourhood_id && item.latitude != null && item.longitude != null) {
            const lat = Number(item.latitude)
            const lng = Number(item.longitude)
            // More lenient coordinate validation - Singapore bounds approximately
            if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lat < 2 && lng > 100 && lng < 110) {
              if (!locationMap.has(item.neighbourhood_id)) {
                locationMap.set(item.neighbourhood_id, { lats: [], lngs: [] })
              }
              const loc = locationMap.get(item.neighbourhood_id)!
              loc.lats.push(lat)
              loc.lngs.push(lng)
            } else {
              skippedCount++
              if (skippedSamples.length < 3) {
                skippedSamples.push({ neighbourhood_id: item.neighbourhood_id, lat, lng })
              }
            }
          }
        })
        
        if (skippedCount > 0) {
          console.log(`Skipped ${skippedCount} records due to coordinate validation, samples:`, skippedSamples)
        }
        
        console.log('Location map after processing:', { 
          size: locationMap.size, 
          sample: Array.from(locationMap.entries()).slice(0, 5).map(([id, loc]) => ({
            id,
            count: loc.lats.length,
            avgLat: loc.lats.reduce((sum, val) => sum + val, 0) / loc.lats.length,
            avgLng: loc.lngs.reduce((sum, val) => sum + val, 0) / loc.lngs.length
          }))
        })
        
        // Calculate average center for each neighbourhood
        locationMap.forEach((loc, nbhdId) => {
          if (loc.lats.length > 0 && loc.lngs.length > 0) {
            const avgLat = loc.lats.reduce((sum, val) => sum + val, 0) / loc.lats.length
            const avgLng = loc.lngs.reduce((sum, val) => sum + val, 0) / loc.lngs.length
            centerPointsMap.set(nbhdId, { lat: avgLat, lng: avgLng })
          }
        })
      } else {
        console.log('No location data found for neighbourhoods:', neighbourhoodIds.slice(0, 5))
      }
    }
    
    // Also try to extract from bbox if available
    neighbourhoodsData.forEach(n => {
      if (!centerPointsMap.has(n.id) && n.bbox) {
        let minLng: number, minLat: number, maxLng: number, maxLat: number
        
        // Handle different bbox formats
        if (Array.isArray(n.bbox) && n.bbox.length >= 4) {
          [minLng, minLat, maxLng, maxLat] = n.bbox
        } else if (typeof n.bbox === 'object' && n.bbox !== null) {
          // Try to parse as JSON string first
          try {
            const parsed = typeof n.bbox === 'string' ? JSON.parse(n.bbox) : n.bbox
            if (Array.isArray(parsed) && parsed.length >= 4) {
              [minLng, minLat, maxLng, maxLat] = parsed
            } else if (parsed.minLng !== undefined && parsed.minLat !== undefined && 
                       parsed.maxLng !== undefined && parsed.maxLat !== undefined) {
              minLng = parsed.minLng
              minLat = parsed.minLat
              maxLng = parsed.maxLng
              maxLat = parsed.maxLat
            } else {
              return // Skip if can't parse
            }
          } catch (e) {
            return // Skip if parse error
          }
        } else {
          return // Skip if not array or object
        }
        
        // Validate coordinates
        if (typeof minLng === 'number' && typeof minLat === 'number' && 
            typeof maxLng === 'number' && typeof maxLat === 'number' &&
            !isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
          centerPointsMap.set(n.id, {
            lat: (minLat + maxLat) / 2,
            lng: (minLng + maxLng) / 2
          })
        }
      }
    })
    
    const finalMissingCenterIds = neighbourhoodIds.filter(id => !centerPointsMap.has(id))
    console.log('Center points map:', { 
      size: centerPointsMap.size, 
      total: neighbourhoodIds.length,
      sample: Array.from(centerPointsMap.entries()).slice(0, 3),
      missingCount: finalMissingCenterIds.length,
      missing: finalMissingCenterIds.slice(0, 10),
      missingNames: finalMissingCenterIds.slice(0, 10).map(id => 
        neighbourhoodsData.find(n => n.id === id)?.name
      )
    })
    
    // If we're still missing centers for some neighbourhoods, try a more aggressive query
    const stillMissingIds = neighbourhoodIds.filter(id => !centerPointsMap.has(id))
    if (stillMissingIds.length > 0) {
      console.log(`Missing centers for ${stillMissingIds.length} neighbourhoods, trying alternative query...`)
      // Try querying with a smaller batch or different approach
      const { data: altLocationData } = await supabase
        .from('raw_resale_2017')
        .select('neighbourhood_id, latitude, longitude')
        .in('neighbourhood_id', stillMissingIds)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      
      if (altLocationData && altLocationData.length > 0) {
        console.log('Alternative location query returned:', altLocationData.length, 'records')
        const locationMap = new Map<string, { lats: number[]; lngs: number[] }>()
        let altSkippedCount = 0
        altLocationData.forEach(item => {
          if (item.neighbourhood_id && item.latitude != null && item.longitude != null) {
            const lat = Number(item.latitude)
            const lng = Number(item.longitude)
            // More lenient coordinate validation - Singapore bounds approximately
            if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lat < 2 && lng > 100 && lng < 110) {
              if (!locationMap.has(item.neighbourhood_id)) {
                locationMap.set(item.neighbourhood_id, { lats: [], lngs: [] })
              }
              locationMap.get(item.neighbourhood_id)!.lats.push(lat)
              locationMap.get(item.neighbourhood_id)!.lngs.push(lng)
            } else {
              altSkippedCount++
            }
          }
        })
        
        if (altSkippedCount > 0) {
          console.log(`Alternative query: Skipped ${altSkippedCount} records due to coordinate validation`)
        }
        
        console.log('Alternative location map after processing:', { 
          size: locationMap.size, 
          sample: Array.from(locationMap.entries()).slice(0, 5).map(([id, loc]) => ({
            id,
            count: loc.lats.length
          }))
        })
        
        locationMap.forEach((loc, nbhdId) => {
          if (loc.lats.length > 0 && loc.lngs.length > 0 && !centerPointsMap.has(nbhdId)) {
            const avgLat = loc.lats.reduce((sum, val) => sum + val, 0) / loc.lats.length
            const avgLng = loc.lngs.reduce((sum, val) => sum + val, 0) / loc.lngs.length
            centerPointsMap.set(nbhdId, { lat: avgLat, lng: avgLng })
            console.log('Added center for', nbhdId, 'from alternative query:', { lat: avgLat, lng: avgLng })
          }
        })
      } else {
        console.log('Alternative query returned no data for missing neighbourhoods:', stillMissingIds.slice(0, 5))
      }
    }

    // Fetch summary data from agg_neighbourhood_monthly (last 12 months)
    // If flat_type is specified, filter by that type. Otherwise, get all types and merge.
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12)
    
    let monthlyQuery = supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id, flat_type, median_price, median_psm, median_lease_years, tx_count, avg_floor_area, month')
      .in('neighbourhood_id', neighbourhoodIds)
      .gte('month', startDate.toISOString().split('T')[0])
      .lte('month', endDate.toISOString().split('T')[0])
    
    // Filter by flat_type(s) if specified (multi-select support)
    if (flatTypes.length > 0) {
      if (flatTypes.length === 1) {
        monthlyQuery = monthlyQuery.eq('flat_type', flatTypes[0])
      } else {
        monthlyQuery = monthlyQuery.in('flat_type', flatTypes)
      }
    }
    
    const { data: monthlyData } = await monthlyQuery
    
    console.log('API: Monthly data from agg_neighbourhood_monthly:', {
      flatTypes: flatTypes.length > 0 ? flatTypes : ['All'],
      monthlyDataCount: monthlyData?.length || 0,
      uniqueNeighbourhoods: monthlyData ? [...new Set(monthlyData.map(m => m.neighbourhood_id))].length : 0,
      flatTypesInData: monthlyData ? [...new Set(monthlyData.map(m => m.flat_type))].sort() : []
    })
    
    // Aggregate by neighbourhood_id and flat_type first
    // Then combine all flat types for "All"
    const tempSummaryMap = new Map<string, {
      neighbourhood_id: string
      flat_type: string
      prices: number[]
      psms: number[]
      leases: number[]
      areas: number[]
      total_tx: number
    }>()
    
    if (monthlyData) {
      monthlyData.forEach(item => {
        const nbhdId = item.neighbourhood_id
        const flatTypeKey = item.flat_type
        const key = `${nbhdId}__${flatTypeKey}` // Group by neighbourhood + flat_type
        
        if (!tempSummaryMap.has(key)) {
          tempSummaryMap.set(key, {
            neighbourhood_id: nbhdId,
            flat_type: flatTypeKey,
            prices: [],
            psms: [],
            leases: [],
            areas: [],
            total_tx: 0
          })
        }
        const entry = tempSummaryMap.get(key)!
        
        // Collect values for this neighbourhood + flat_type combination
        if (item.median_price) entry.prices.push(Number(item.median_price))
        if (item.median_psm) entry.psms.push(Number(item.median_psm))
        if (item.median_lease_years) entry.leases.push(Number(item.median_lease_years))
        if (item.avg_floor_area) entry.areas.push(Number(item.avg_floor_area))
        if (item.tx_count) entry.total_tx += Number(item.tx_count)
      })
    }
    
    // Calculate medians for each neighbourhood + flat_type combination
    const flatTypeSummaries = Array.from(tempSummaryMap.values()).map(entry => {
      const sortedPrices = entry.prices.sort((a, b) => a - b)
      const sortedPsms = entry.psms.sort((a, b) => a - b)
      const sortedLeases = entry.leases.sort((a, b) => a - b)
      
      // Calculate average area (use average of monthly averages, not median)
      const avgArea = entry.areas.length > 0 
        ? entry.areas.reduce((sum, val) => sum + val, 0) / entry.areas.length 
        : null
      
      return {
        neighbourhood_id: entry.neighbourhood_id,
        flat_type: entry.flat_type,
        tx_12m: entry.total_tx,
        median_price_12m: sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : null,
        median_psm_12m: sortedPsms.length > 0 ? sortedPsms[Math.floor(sortedPsms.length / 2)] : null,
        median_lease_years_12m: sortedLeases.length > 0 ? sortedLeases[Math.floor(sortedLeases.length / 2)] : null,
        avg_floor_area_12m: avgArea,
      }
    })
    
    // Now combine all flat types for each neighbourhood (for "All" view)
    const neighbourhoodSummaries = new Map<string, {
      prices: number[]
      psms: number[]
      leases: number[]
      areas: number[]
      total_tx: number
    }>()
    
    flatTypeSummaries.forEach(summary => {
      if (!neighbourhoodSummaries.has(summary.neighbourhood_id)) {
        neighbourhoodSummaries.set(summary.neighbourhood_id, {
          prices: [],
          psms: [],
          leases: [],
          areas: [],
          total_tx: 0
        })
      }
      const nbhdSummary = neighbourhoodSummaries.get(summary.neighbourhood_id)!
      
      // Add the flat_type's median to the neighbourhood's collection
      if (summary.median_price_12m) nbhdSummary.prices.push(summary.median_price_12m)
      if (summary.median_psm_12m) nbhdSummary.psms.push(summary.median_psm_12m)
      if (summary.median_lease_years_12m) nbhdSummary.leases.push(summary.median_lease_years_12m)
      if (summary.avg_floor_area_12m) nbhdSummary.areas.push(summary.avg_floor_area_12m)
      nbhdSummary.total_tx += summary.tx_12m
    })
    
    // Final aggregation: median of flat_type medians
    const summaryData = Array.from(neighbourhoodSummaries.entries()).map(([nbhdId, data]) => {
      const sortedPrices = data.prices.sort((a, b) => a - b)
      const sortedPsms = data.psms.sort((a, b) => a - b)
      const sortedLeases = data.leases.sort((a, b) => a - b)
      
      // Calculate average area (average of flat_type averages)
      const avgArea = data.areas.length > 0 
        ? data.areas.reduce((sum, val) => sum + val, 0) / data.areas.length 
        : null
      
      return {
        neighbourhood_id: nbhdId,
        tx_12m: data.total_tx,
        median_price_12m: sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : null,
        median_psm_12m: sortedPsms.length > 0 ? sortedPsms[Math.floor(sortedPsms.length / 2)] : null,
        median_lease_years_12m: sortedLeases.length > 0 ? sortedLeases[Math.floor(sortedLeases.length / 2)] : null,
        avg_floor_area_12m: avgArea,
        updated_at: new Date().toISOString()
      }
    })
    
    console.log('API: After aggregation:', {
      flatTypes: flatTypes.length > 0 ? flatTypes : ['All Types'],
      neighbourhoodIdsQueried: neighbourhoodIds.length,
      flatTypeSummariesCount: flatTypeSummaries.length,
      neighbourhoodSummariesCount: neighbourhoodSummaries.size,
      finalSummaryDataCount: summaryData.length,
      neighbourhoodsWithSummary: summaryData.map(s => {
        const nbhd = neighbourhoodsData.find(n => n.id === s.neighbourhood_id)
        return nbhd?.name
      }).sort()
    })

    // Fetch access data separately
    const { data: accessData } = await supabase
      .from('neighbourhood_access')
      .select('*')
      .in('neighbourhood_id', neighbourhoodIds)

    // Fetch MRT stations for each neighbourhood
    // First, get stations within neighbourhoods (in area)
    const { data: mrtStationsInArea, error: mrtError } = await supabase
      .from('mrt_stations')
      .select('neighbourhood_id, station_code')
      .in('neighbourhood_id', neighbourhoodIds)
      .not('station_code', 'is', null)
      .order('station_code', { ascending: true })
    
    if (mrtError) {
      console.error('Error fetching MRT stations:', mrtError)
    }
    
    console.log('MRT stations in area:', { count: mrtStationsInArea?.length || 0, sample: mrtStationsInArea?.slice(0, 3) })
    
    // Create MRT stations map by neighbourhood
    const mrtStationsMap = new Map<string, string[]>()
    
    // Add stations in area
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
    
    console.log('MRT stations map (in area):', { size: mrtStationsMap.size, sample: Array.from(mrtStationsMap.entries()).slice(0, 3) })
    
    // For neighbourhoods without stations in area, find nearest station using PostGIS
    const neighbourhoodsWithoutStations = neighbourhoodIds.filter(id => {
      return !mrtStationsMap.has(id) || mrtStationsMap.get(id)!.length === 0
    })
    
    if (neighbourhoodsWithoutStations.length > 0) {
      // Query nearest MRT station for each neighbourhood
      // Get neighbourhood centers (try center first, fallback to bbox if needed)
      const { data: neighbourhoodsWithCenters } = await supabase
        .from('neighbourhoods')
        .select('id, center, bbox')
        .in('id', neighbourhoodsWithoutStations)
      
      // Get all MRT stations with coordinates
      const { data: allMrtStations } = await supabase
        .from('mrt_stations')
        .select('station_code, latitude, longitude')
        .not('station_code', 'is', null)
      
      if (neighbourhoodsWithCenters && allMrtStations && allMrtStations.length > 0) {
        // For each neighbourhood, find nearest station using Haversine formula
        for (const n of neighbourhoodsWithCenters) {
          let lat: number | null = null
          let lng: number | null = null
          
          // Try to get coordinates from center first
          if (n.center) {
            const center = typeof n.center === 'string' ? JSON.parse(n.center) : n.center
            if (center?.lat && center?.lng) {
              lat = center.lat
              lng = center.lng
            }
          }
          
          // Fallback to bbox center if center is not available
          if ((lat === null || lng === null) && n.bbox) {
            const bbox = typeof n.bbox === 'string' ? JSON.parse(n.bbox) : n.bbox
            if (bbox && Array.isArray(bbox) && bbox.length === 4) {
              // bbox format: [minLng, minLat, maxLng, maxLat]
              lat = (bbox[1] + bbox[3]) / 2
              lng = (bbox[0] + bbox[2]) / 2
            }
          }
          
          if (lat === null || lng === null) continue
          
          // Find nearest station
          let nearestStation: { name: string; distance: number } | null = null
          
          for (const station of allMrtStations) {
            if (!station.latitude || !station.longitude) continue
            
            // Haversine distance calculation (in meters)
            const R = 6371000 // Earth radius in meters
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

    // Fetch planning areas with region data separately to ensure region is included
    const fetchedPlanningAreaIds = [...new Set(neighbourhoodsData.map(n => n.planning_area_id).filter(Boolean))]
    const { data: planningAreasData } = await supabase
      .from('planning_areas')
      .select('id, name, region')
      .in('id', fetchedPlanningAreaIds)
    
    // Create planning area lookup map
    const planningAreaMap = new Map()
    if (planningAreasData) {
      planningAreasData.forEach(pa => {
        planningAreaMap.set(pa.id, pa)
      })
    }

    // Create lookup maps
    const summaryMap = new Map()
    if (summaryData) {
      summaryData.forEach(s => {
        summaryMap.set(s.neighbourhood_id, s)
      })
    }

    const accessMap = new Map()
    if (accessData) {
      accessData.forEach(a => {
        accessMap.set(a.neighbourhood_id, a)
      })
    }

    // Transform data to flatten structure and apply filters
    let neighbourhoods = neighbourhoodsData.map(n => {
      // Try to get planning area from nested query first, fallback to lookup map
      let planningArea = null
      if (Array.isArray(n.planning_areas) && n.planning_areas.length > 0) {
        planningArea = n.planning_areas[0]
      } else if (n.planning_area_id) {
        // Fallback: use lookup map if nested query didn't work
        planningArea = planningAreaMap.get(n.planning_area_id) || null
      }
      
      // If planning area exists but missing region, try to get it from map
      if (planningArea && !planningArea.region && planningArea.id) {
        const paFromMap = planningAreaMap.get(planningArea.id)
        if (paFromMap && paFromMap.region) {
          planningArea.region = paFromMap.region
        }
      }
      
      const summary = summaryMap.get(n.id) || null
      const access = accessMap.get(n.id) || null
      
      // Get flat type summaries for this neighbourhood (for "All" mode)
      const flatTypeData = flatTypeSummaries.filter(s => s.neighbourhood_id === n.id)

      return {
        id: n.id,
        name: n.name,
        one_liner: n.one_liner,
        planning_area: planningArea ? {
          id: planningArea.id,
          name: planningArea.name,
          region: planningArea.region || null
        } : null,
        type: n.type,
        bbox: n.bbox,
        center: centerPointsMap.get(n.id) || null,
        summary: summary ? {
          tx_12m: summary.tx_12m,
          median_price_12m: summary.median_price_12m,
          median_psm_12m: summary.median_psm_12m,
          median_lease_years_12m: summary.median_lease_years_12m,
          avg_floor_area_12m: flatTypes.length > 0 && flatTypes.length === 1 ? 
            (flatTypeData.find(ft => ft.flat_type === flatTypes[0])?.avg_floor_area_12m ?? summary.avg_floor_area_12m) :
            summary.avg_floor_area_12m,
          updated_at: summary.updated_at
        } : null,
        flat_type_details: flatTypeData.map(ft => ({
          flat_type: ft.flat_type,
          tx_12m: ft.tx_12m,
          median_price_12m: ft.median_price_12m,
          median_psm_12m: ft.median_psm_12m,
          median_lease_years_12m: ft.median_lease_years_12m,
          avg_floor_area_12m: ft.avg_floor_area_12m
        })),
        access: access ? {
          mrt_station_count: access.mrt_station_count,
          mrt_access_type: access.mrt_access_type,
          avg_distance_to_mrt: access.avg_distance_to_mrt,
          mrt_station_names: mrtStationsMap.get(n.id) || [],
          updated_at: access.updated_at
        } : null,
        created_at: n.created_at,
        updated_at: n.updated_at
      }
    })

    console.log('API: Before filtering, neighbourhoods count:', neighbourhoods.length)
    console.log('API: Filter params:', { priceMin, priceMax, leaseMin, leaseMax, mrtDistanceMax, flatTypes: flatTypes.length > 0 ? flatTypes : ['All'], region })
    
    // Debug: Log centre point statistics
    const withCenter = neighbourhoods.filter(n => n.center !== null).length
    const withoutCenter = neighbourhoods.filter(n => n.center === null).length
    console.log('API: Center point stats:', { 
      total: neighbourhoods.length, 
      withCenter, 
      withoutCenter,
      withoutCenterNames: neighbourhoods.filter(n => n.center === null).slice(0, 5).map(n => n.name)
    })
    
    // Debug: Log sample neighbourhood with MRT data
    if (neighbourhoods.length > 0) {
      const sampleWithMRT = neighbourhoods.find(n => n.access?.mrt_station_names && n.access.mrt_station_names.length > 0)
      if (sampleWithMRT) {
        console.log('Sample neighbourhood with MRT:', {
          name: sampleWithMRT.name,
          mrt_station_names: sampleWithMRT.access?.mrt_station_names,
          mrt_station_count: sampleWithMRT.access?.mrt_station_count,
          distance: sampleWithMRT.access?.avg_distance_to_mrt
        })
      } else {
        console.log('No neighbourhoods with MRT station names found in response')
      }
    }
    
    // Apply filters (including region filter)
    if (priceMin !== null || priceMax !== null || leaseMin !== null || leaseMax !== null || mrtDistanceMax !== null || (region && region !== 'all')) {
      let beforeFilter = neighbourhoods.length
      let filteredByPrice = 0
      let filteredByLease = 0
      let filteredByMRT = 0
      
      // Determine if we're filtering by specific flat types or showing all
      const isFilteringByFlatType = flatTypes.length > 0
      
      neighbourhoods = neighbourhoods.filter(n => {
        // When flat_type is NOT specified ("All"), check if ANY flat type meets criteria
        // When flat_type(s) IS specified, check that those specific flat type's data
        
        if (!isFilteringByFlatType) {
          // "All" mode: Check each flat type separately
          // A neighbourhood passes if ANY of its flat types meet the criteria
          const flatTypesForNeighbourhood = flatTypeSummaries.filter(
            s => s.neighbourhood_id === n.id
          )
          
          if (flatTypesForNeighbourhood.length === 0) {
            // No data for any flat type
            filteredByPrice++
            return false
          }
          
          // Check if at least one flat type meets all filter criteria
          const hasMatchingFlatType = flatTypesForNeighbourhood.some(flatTypeSummary => {
            // Price filter
            if (priceMin !== null || priceMax !== null) {
              const price = flatTypeSummary.median_price_12m
              if (price === null) return false
              if (priceMin !== null && price < priceMin) return false
              if (priceMax !== null && price > priceMax) return false
            }
            
            // Lease filter
            if (leaseMin !== null || leaseMax !== null) {
              const lease = flatTypeSummary.median_lease_years_12m
              if (lease === null) return false
              if (leaseMin !== null && lease < leaseMin) return false
              if (leaseMax !== null && lease > leaseMax) return false
            }
            
            return true
          })
          
          if (!hasMatchingFlatType) {
            filteredByPrice++ // Could be price or lease, but we count it
            return false
          }
          
          // MRT filter (applies to neighbourhood, not flat type)
          if (mrtDistanceMax !== null) {
            const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
            if (distance === null || (distance > 0 && distance > mrtDistanceMax)) {
              if (!n.access?.mrt_station_count || n.access.mrt_station_count === 0) {
                filteredByMRT++
                return false
              }
            }
          }
          
          // Region filter (CCR/RCR/OCR) - applies to neighbourhood
          if (region && region !== 'all') {
            const neighbourhoodRegion = n.planning_area?.region
            // Case-insensitive comparison
            if (!neighbourhoodRegion || neighbourhoodRegion.toUpperCase() !== region.toUpperCase()) {
              return false
            }
          }
          
          return true
          
        } else {
          // Specific flat type(s) mode: Check if any of the selected flat types meet criteria
          // First check if this neighbourhood has data for any of the selected flat types
          const matchingFlatTypes = flatTypeSummaries.filter(
            s => s.neighbourhood_id === n.id && flatTypes.includes(s.flat_type)
          )
          
          if (matchingFlatTypes.length === 0) {
            // No data for any selected flat type
            filteredByPrice++
            return false
          }
          
          // Check if at least one selected flat type meets all filter criteria
          const hasMatchingFlatType = matchingFlatTypes.some(flatTypeSummary => {
            // Price filter
            if (priceMin !== null || priceMax !== null) {
              const price = flatTypeSummary.median_price_12m
              if (price === null) return false
              if (priceMin !== null && price < priceMin) return false
              if (priceMax !== null && price > priceMax) return false
            }
            
            // Lease filter
            if (leaseMin !== null || leaseMax !== null) {
              const lease = flatTypeSummary.median_lease_years_12m
              if (lease === null) return false
              if (leaseMin !== null && lease < leaseMin) return false
              if (leaseMax !== null && lease > leaseMax) return false
            }
            
            return true
          })
          
          if (!hasMatchingFlatType) {
            filteredByPrice++
            return false
          }
          
          // MRT filter (applies to neighbourhood, not flat type)
          if (mrtDistanceMax !== null) {
            const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
            if (distance === null || (distance > 0 && distance > mrtDistanceMax)) {
              if (!n.access?.mrt_station_count || n.access.mrt_station_count === 0) {
                filteredByMRT++
                return false
              }
            }
          }
          
          // Region filter (CCR/RCR/OCR) - applies to neighbourhood
          if (region && region !== 'all') {
            const neighbourhoodRegion = n.planning_area?.region
            if (!neighbourhoodRegion || neighbourhoodRegion.toUpperCase() !== region.toUpperCase()) {
              return false
            }
          }
          
          return true
        }
      })
      
      console.log('API: After filtering:', {
        before: beforeFilter,
        after: neighbourhoods.length,
        filteredByPrice,
        filteredByLease,
        filteredByMRT
      })
      
      // Debug: if no results after filtering, log more details
      if (neighbourhoods.length === 0 && beforeFilter > 0) {
        console.log('API: No results after filtering. Filter criteria:', {
          priceMin,
          priceMax,
          leaseMin,
          leaseMax,
          mrtDistanceMax,
          message: `Filtered out ${filteredByPrice} by price, ${filteredByLease} by lease, ${filteredByMRT} by MRT`
        })
      }
    }

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

