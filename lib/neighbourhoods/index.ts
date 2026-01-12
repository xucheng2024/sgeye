/**
 * Main service for neighbourhoods API
 */

import { normalizeFlatType } from '@/lib/utils/flat-type-normalizer'
import { fetchNeighbourhoods, fetchAccessData, fetchPlanningAreas, fetchSubzones, fetchLivingNotesMetadata } from './fetch'
import { calculateCenterPoints } from './centers'
import { buildMrtStationsMap } from './mrt'
import { aggregateMonthlyData } from './aggregation'
import { applyFilters } from './filters'
import type { 
  NeighbourhoodQueryParams, 
  NeighbourhoodResponse, 
  NeighbourhoodRawData,
  AccessData,
  PlanningAreaData,
  SubzoneData,
  FlatTypeSummary
} from './types'

export async function getNeighbourhoods(params: NeighbourhoodQueryParams): Promise<{
  neighbourhoods: NeighbourhoodResponse[]
  count: number
  limit: number
  offset: number
}> {
  const { planningAreaIds, subzoneIds, flatTypes, limit, offset } = params
  
  // Fetch neighbourhoods
  const { data: neighbourhoodsData, error } = await fetchNeighbourhoods(
    planningAreaIds,
    subzoneIds,
    limit,
    offset
  )
  
  console.log('API: Fetched neighbourhoods from DB:', {
    flatTypes: flatTypes.length > 0 ? flatTypes : ['All'],
    count: neighbourhoodsData?.length || 0,
    planningAreaIds: planningAreaIds.length > 0 ? planningAreaIds : 'All'
  })
  
  if (error) {
    console.error('Error fetching neighbourhoods:', error)
    throw new Error(`Failed to fetch neighbourhoods: ${error.message}`)
  }
  
  if (!neighbourhoodsData || neighbourhoodsData.length === 0) {
    return {
      neighbourhoods: [],
      count: 0,
      limit,
      offset
    }
  }
  
  const neighbourhoodIds = neighbourhoodsData.map(n => n.id)
  
  // Extract IDs for planning areas and subzones
  const fetchedPlanningAreaIds = [...new Set(neighbourhoodsData.map(n => n.planning_area_id).filter((id): id is string => Boolean(id)))]
  const fetchedSubzoneIds = [...new Set(neighbourhoodsData.map(n => n.parent_subzone_id).filter((id): id is string => Boolean(id)))]
  
  // Parallelize independent database queries
  const [
    centerPointsMap,
    { flatTypeSummaries },
    accessData,
    mrtStationsMap,
    planningAreasData,
    subzonesData,
    livingNotesMetadataMap
  ] = await Promise.all([
    calculateCenterPoints(neighbourhoodsData, neighbourhoodIds),
    aggregateMonthlyData(neighbourhoodIds, flatTypes),
    fetchAccessData(neighbourhoodIds),
    buildMrtStationsMap(neighbourhoodIds),
    fetchPlanningAreas(fetchedPlanningAreaIds),
    fetchSubzones(fetchedSubzoneIds),
    fetchLivingNotesMetadata(neighbourhoodsData.map(n => n.name))
  ])
  
  const planningAreaMap = new Map(planningAreasData.map(pa => [pa.id, pa]))
  const subzoneMap = new Map(subzonesData.map(sz => [sz.id, sz]))
  
  // Create lookup maps
  const accessMap = new Map(accessData.map(a => [a.neighbourhood_id, a]))
  
  // Create map of neighbourhood IDs that have transaction data (based on flat_type summaries)
  const neighbourhoodsWithData = new Set(
    flatTypeSummaries
      .filter(ft => ft.tx_12m > 0)
      .map(ft => ft.neighbourhood_id)
  )
  
  // Filter neighbourhoods to only those with transaction data
  const filteredNeighbourhoodsData = neighbourhoodsData.filter(n => 
    neighbourhoodsWithData.has(n.id)
  )
  
  // Transform data
  let neighbourhoods = transformNeighbourhoods(
    filteredNeighbourhoodsData,
    centerPointsMap,
    accessMap,
    planningAreaMap,
    subzoneMap,
    mrtStationsMap,
    flatTypeSummaries,
    flatTypes,
    livingNotesMetadataMap
  )
  
  console.log('API: After filtering by transaction data, neighbourhoods count:', neighbourhoods.length)
  console.log('API: Filter params:', { 
    priceMin: params.priceMin, 
    priceMax: params.priceMax, 
    leaseMin: params.leaseMin, 
    leaseMax: params.leaseMax, 
    mrtDistanceMax: params.mrtDistanceMax, 
    flatTypes: flatTypes.length > 0 ? flatTypes : ['All'], 
    region: params.region, 
    majorRegions: params.majorRegions 
  })
  
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
  
  // Apply filters
  neighbourhoods = applyFilters(neighbourhoods, flatTypeSummaries, params)
  
  return {
    neighbourhoods,
    count: neighbourhoods.length,
    limit,
    offset
  }
}

function transformNeighbourhoods(
  neighbourhoodsData: NeighbourhoodRawData[],
  centerPointsMap: Map<string, { lat: number; lng: number }>,
  accessMap: Map<string, AccessData>,
  planningAreaMap: Map<string, PlanningAreaData>,
  subzoneMap: Map<string, SubzoneData>,
  mrtStationsMap: Map<string, string[]>,
  flatTypeSummaries: FlatTypeSummary[],
  flatTypes: string[],
  livingNotesMetadataMap: Map<string, { rating_mode: string | null; short_note: string | null; variance_level: string | null }>
): NeighbourhoodResponse[] {
  // Normalize names for lookup
  function norm(name: string): string {
    return (name || '').trim().toUpperCase().replace(/\s+/g, ' ')
  }
  return neighbourhoodsData.map(n => {
    // Get planning area
    let planningArea = null
    if (Array.isArray(n.planning_areas) && n.planning_areas.length > 0) {
      planningArea = n.planning_areas[0]
    } else if (n.planning_area_id) {
      planningArea = planningAreaMap.get(n.planning_area_id) || null
    }
    
    if (planningArea && !planningArea.region && planningArea.id) {
      const paFromMap = planningAreaMap.get(planningArea.id)
      if (paFromMap && paFromMap.region) {
        planningArea.region = paFromMap.region
      }
    }
    
    // Get subzone region
    let subzoneRegion = null
    if (n.parent_subzone_id) {
      const subzone = subzoneMap.get(n.parent_subzone_id)
      if (subzone) {
        subzoneRegion = subzone.region || null
      }
    }
    
    const access = accessMap.get(n.id) || null
    const flatTypeData = flatTypeSummaries.filter(s => s.neighbourhood_id === n.id)
    const livingNotesMetadata = livingNotesMetadataMap.get(norm(n.name)) || null
    
    // No summary calculation needed - client will generate from flat_type_details
    // Each card displays data for a specific flat_type, not aggregated across all flat types
    
    return {
      id: n.id,
      name: n.name,
      one_liner: n.one_liner,
      planning_area: planningArea ? {
        id: planningArea.id,
        name: planningArea.name,
        region: planningArea.region || null
      } : null,
      parent_subzone_id: n.parent_subzone_id || null,
      subzone_region: subzoneRegion,
      type: n.type,
      bbox: n.bbox,
      center: centerPointsMap.get(n.id) || null,
      summary: null,
      flat_type_details: flatTypeData.map(ft => ({
        neighbourhood_id: ft.neighbourhood_id,
        flat_type: ft.flat_type,
        tx_12m: ft.tx_12m,
        p25_price_12m: ft.p25_price_12m,
        median_price_12m: ft.median_price_12m,
        p75_price_12m: ft.p75_price_12m,
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
      rating_mode: livingNotesMetadata?.rating_mode as 'residential_scored' | 'not_scored' | null | undefined,
      short_note: livingNotesMetadata?.short_note || null,
      variance_level: livingNotesMetadata?.variance_level as 'compact' | 'moderate' | 'spread_out' | null | undefined,
      created_at: n.created_at,
      updated_at: n.updated_at
    }
  })
}

export function parseQueryParams(searchParams: URLSearchParams): NeighbourhoodQueryParams {
  const planningAreaIdParam = searchParams.get('planning_area_id')
  const subzoneIdParam = searchParams.get('subzone_id')
  const flatTypeParam = searchParams.get('flat_type')
  const planningAreaIds = planningAreaIdParam ? planningAreaIdParam.split(',').filter(id => id.trim() !== '') : []
  const subzoneIds = subzoneIdParam ? subzoneIdParam.split(',').filter(id => id.trim() !== '') : []
  const flatTypes = flatTypeParam
    ? flatTypeParam
        .split(',')
        .map(ft => normalizeFlatType(ft))
        .filter(ft => ft.trim() !== '' && ft !== 'All')
    : []
  
  const region = searchParams.get('region')
  const majorRegionParam = searchParams.get('major_region')
  const majorRegions = majorRegionParam ? majorRegionParam.split(',').filter(r => r.trim() !== '') : []
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null
  const leaseMin = searchParams.get('lease_min') ? parseFloat(searchParams.get('lease_min')!) : null
  const leaseMax = searchParams.get('lease_max') ? parseFloat(searchParams.get('lease_max')!) : null
  const mrtDistanceMax = searchParams.get('mrt_distance_max') ? parseFloat(searchParams.get('mrt_distance_max')!) : null
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  return {
    planningAreaIds,
    subzoneIds,
    flatTypes,
    region,
    majorRegions,
    priceMin,
    priceMax,
    leaseMin,
    leaseMax,
    mrtDistanceMax,
    limit,
    offset
  }
}

