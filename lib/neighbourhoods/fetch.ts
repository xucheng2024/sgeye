/**
 * Data fetching functions for neighbourhoods API
 */

import { createClient } from '@supabase/supabase-js'
import { paginateQuery } from '@/lib/utils/pagination'
import { cache, getCacheKey } from '@/lib/utils/cache'
import type {
  NeighbourhoodRawData,
  FlatTypeSummary,
  NeighbourhoodSummary,
  PlanningAreaData,
  SubzoneData,
  AccessData,
} from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function fetchNeighbourhoods(
  planningAreaIds: string[],
  limit: number,
  offset: number,
  includeCityCore: boolean = false
): Promise<{ data: NeighbourhoodRawData[] | null; error: any }> {
  let query = supabase
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
      planning_areas(id, name, region),
      parent_subzone_id
    `)
    .eq('non_residential', false)  // Exclude non-residential areas from explore/compare
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (planningAreaIds.length > 0) {
    if (planningAreaIds.length === 1) {
      query = query.eq('planning_area_id', planningAreaIds[0])
    } else {
      query = query.in('planning_area_id', planningAreaIds)
    }
  }

  const result = await query
  
  // Filter city_core zones if not included
  // BUT: If a neighbourhood has HDB resale data, it means there are HDB flats there, so don't filter it out
  if (!includeCityCore && result.data) {
    // Normalize names for lookup
    function norm(name: string): string {
      return (name || '').trim().toUpperCase().replace(/\s+/g, ' ')
    }
    
    // Cache zone_type map (rarely changes, cache for 1 hour)
    const zoneTypeCacheKey = 'zone_type_map'
    let zoneTypeMap = cache.get<Map<string, string>>(zoneTypeCacheKey)
    
    if (!zoneTypeMap) {
      // Fetch zone_types for all neighbourhoods
      const { data: livingNotes } = await supabase
        .from('neighbourhood_living_notes')
        .select('neighbourhood_name, zone_type')
      
      zoneTypeMap = new Map<string, string>()
      if (livingNotes) {
        livingNotes.forEach(note => {
          zoneTypeMap!.set(norm(note.neighbourhood_name), note.zone_type)
        })
      }
      // Cache for 1 hour
      cache.set(zoneTypeCacheKey, zoneTypeMap, 60 * 60 * 1000)
    }
    
    // Check which neighbourhoods have HDB resale data
    const neighbourhoodIds = result.data.map(n => n.id)
    const { data: hdbData } = await supabase
      .from('agg_neighbourhood_monthly')
      .select('neighbourhood_id')
      .in('neighbourhood_id', neighbourhoodIds)
      .gt('tx_count', 0)
      .limit(10000) // Should be enough
    
    const neighbourhoodsWithHdbData = new Set(
      (hdbData || []).map(d => d.neighbourhood_id)
    )
    
    // Filter out city_core zones ONLY if they don't have HDB data
    // If they have HDB data, they should be shown (because there are HDB flats there)
    result.data = result.data.filter(n => {
      const zoneType = zoneTypeMap.get(norm(n.name))
      const hasHdbData = neighbourhoodsWithHdbData.has(n.id)
      
      // Keep if: not city_core, OR is city_core but has HDB data
      return zoneType !== 'city_core' || hasHdbData
    })
  }
  
  return result
}

export async function fetchMonthlyData(
  neighbourhoodIds: string[],
  flatTypes: string[],
  months: number = 12
): Promise<any[]> {
  if (neighbourhoodIds.length === 0) return []

  // Cache monthly data queries (data changes monthly, cache for 1 hour)
  const cacheKey = getCacheKey(
    'monthly_data',
    neighbourhoodIds.sort().join(','),
    flatTypes.sort().join(','),
    months.toString()
  )
  const cached = cache.get<any[]>(cacheKey)
  if (cached) {
    return cached
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  let query = supabase
    .from('agg_neighbourhood_monthly')
    .select('neighbourhood_id, flat_type, median_price, median_psm, median_lease_years, tx_count, avg_floor_area, month')
    .in('neighbourhood_id', neighbourhoodIds)
    .gte('month', startDate.toISOString().split('T')[0])
    .lte('month', endDate.toISOString().split('T')[0])
    .order('neighbourhood_id', { ascending: true })
    .order('flat_type', { ascending: true })
    .order('month', { ascending: true })

  if (flatTypes.length > 0) {
    if (flatTypes.length === 1) {
      query = query.eq('flat_type', flatTypes[0])
    } else {
      query = query.in('flat_type', flatTypes)
    }
  }

  const result = await paginateQuery<any>(query, 1000)
  // Cache for 1 hour
  cache.set(cacheKey, result, 60 * 60 * 1000)
  return result
}

export async function fetchAccessData(neighbourhoodIds: string[]): Promise<AccessData[]> {
  if (neighbourhoodIds.length === 0) return []

  // Cache access data (changes infrequently, cache for 15 minutes)
  const cacheKey = getCacheKey('access_data', neighbourhoodIds.sort().join(','))
  const cached = cache.get<AccessData[]>(cacheKey)
  if (cached) {
    return cached
  }

  const { data, error } = await supabase
    .from('neighbourhood_access')
    .select('*')
    .in('neighbourhood_id', neighbourhoodIds)

  if (error) {
    console.error('Error fetching access data:', error)
    return []
  }

  const result = (data || []) as AccessData[]
  // Cache for 15 minutes
  cache.set(cacheKey, result, 15 * 60 * 1000)
  return result
}

export async function fetchPlanningAreas(planningAreaIds: string[]): Promise<PlanningAreaData[]> {
  if (planningAreaIds.length === 0) return []

  // Cache planning areas (rarely changes, cache for 1 hour)
  const cacheKey = getCacheKey('planning_areas', planningAreaIds.sort().join(','))
  const cached = cache.get<PlanningAreaData[]>(cacheKey)
  if (cached) {
    return cached
  }

  const { data, error } = await supabase
    .from('planning_areas')
    .select('id, name, region')
    .in('id', planningAreaIds)

  if (error) {
    console.error('Error fetching planning areas:', error)
    return []
  }

  const result = (data || []) as PlanningAreaData[]
  cache.set(cacheKey, result, 60 * 60 * 1000) // 1 hour cache
  return result
}

export async function fetchSubzones(subzoneIds: string[]): Promise<SubzoneData[]> {
  if (subzoneIds.length === 0) return []

  // Cache subzones (rarely changes, cache for 1 hour)
  const cacheKey = getCacheKey('subzones', subzoneIds.sort().join(','))
  const cached = cache.get<SubzoneData[]>(cacheKey)
  if (cached) {
    return cached
  }

  const { data, error } = await supabase
    .from('subzones')
    .select('id, name, region')
    .in('id', subzoneIds)

  if (error) {
    console.error('Error fetching subzones:', error)
    return []
  }

  const result = (data || []) as SubzoneData[]
  cache.set(cacheKey, result, 60 * 60 * 1000) // 1 hour cache
  return result
}

export async function fetchLocationData(neighbourhoodIds: string[]): Promise<any[]> {
  const { data, error } = await supabase
    .from('raw_resale_2017')
    .select('neighbourhood_id, latitude, longitude')
    .in('neighbourhood_id', neighbourhoodIds)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(50000)

  if (error) {
    console.error('Error fetching location data:', error)
    return []
  }

  return data || []
}

export async function fetchNeighbourhoodsWithCenters(neighbourhoodIds: string[]): Promise<any[]> {
  const { data, error } = await supabase
    .from('neighbourhoods')
    .select('id, center, bbox')
    .in('id', neighbourhoodIds)

  if (error) {
    console.error('Error fetching neighbourhoods with centers:', error)
    return []
  }

  return data || []
}

export async function fetchAllMrtStations(): Promise<any[]> {
  const { data, error } = await supabase
    .from('mrt_stations')
    .select('station_code, latitude, longitude')
    .not('station_code', 'is', null)

  if (error) {
    console.error('Error fetching MRT stations:', error)
    return []
  }

  return data || []
}

export async function fetchMrtStationsInArea(neighbourhoodIds: string[]): Promise<any[]> {
  const { data, error } = await supabase
    .from('mrt_stations')
    .select('neighbourhood_id, station_code')
    .in('neighbourhood_id', neighbourhoodIds)
    .not('station_code', 'is', null)
    .order('station_code', { ascending: true })

  if (error) {
    console.error('Error fetching MRT stations in area:', error)
    return []
  }

  return data || []
}

export async function fetchLivingNotesMetadata(neighbourhoodNames: string[]): Promise<Map<string, { rating_mode: string | null; short_note: string | null; variance_level: string | null }>> {
  if (neighbourhoodNames.length === 0) return new Map()

  // Normalize names for lookup
  function norm(name: string): string {
    return (name || '').trim().toUpperCase().replace(/\s+/g, ' ')
  }

  // Cache living notes metadata (rarely changes, cache for 30 minutes)
  const cacheKey = getCacheKey('living_notes_metadata', neighbourhoodNames.length.toString())
  const cached = cache.get<Map<string, { rating_mode: string | null; short_note: string | null; variance_level: string | null }>>(cacheKey)
  if (cached) {
    return cached
  }

  // For small sets, use IN query. For large sets, fetch all (but cache it)
  const normalizedInputNames = new Set(neighbourhoodNames.map(norm))
  let query = supabase
    .from('neighbourhood_living_notes')
    .select('neighbourhood_name, rating_mode, short_note, variance_level')

  // If we have many names, it's more efficient to fetch all and filter
  // But we'll cache the result
  const { data, error } = await query

  if (error) {
    console.error('Error fetching living notes metadata:', error)
    return new Map()
  }

  const metadataMap = new Map<string, { rating_mode: string | null; short_note: string | null; variance_level: string | null }>()
  
  if (data) {
    data.forEach(note => {
      const normalizedNoteName = norm(note.neighbourhood_name)
      if (normalizedInputNames.has(normalizedNoteName)) {
        metadataMap.set(normalizedNoteName, {
          rating_mode: note.rating_mode || null,
          short_note: note.short_note || null,
          variance_level: note.variance_level || null
        })
      }
    })
  }

  // Cache the result for 30 minutes
  cache.set(cacheKey, metadataMap, 30 * 60 * 1000)
  return metadataMap
}

