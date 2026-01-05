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
  offset: number
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
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (planningAreaIds.length > 0) {
    if (planningAreaIds.length === 1) {
      query = query.eq('planning_area_id', planningAreaIds[0])
    } else {
      query = query.in('planning_area_id', planningAreaIds)
    }
  }

  return await query
}

export async function fetchMonthlyData(
  neighbourhoodIds: string[],
  flatTypes: string[],
  months: number = 12
): Promise<any[]> {
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

  return await paginateQuery<any>(query, 1000)
}

export async function fetchAccessData(neighbourhoodIds: string[]): Promise<AccessData[]> {
  const { data, error } = await supabase
    .from('neighbourhood_access')
    .select('*')
    .in('neighbourhood_id', neighbourhoodIds)

  if (error) {
    console.error('Error fetching access data:', error)
    return []
  }

  return (data || []) as AccessData[]
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

