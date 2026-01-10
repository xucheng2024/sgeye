/**
 * Types for neighbourhood API service
 */

export interface NeighbourhoodQueryParams {
  planningAreaIds: string[]
  subzoneIds: string[]  // Filter by subzone (subarea)
  flatTypes: string[]
  region?: string | null
  majorRegions: string[]
  priceMin: number | null
  priceMax: number | null
  leaseMin: number | null
  leaseMax: number | null
  mrtDistanceMax: number | null
  limit: number
  offset: number
}

export interface NeighbourhoodRawData {
  id: string
  name: string
  one_liner: string | null
  planning_area_id: string | null
  type: string | null
  bbox: any
  center: any
  created_at: string
  updated_at: string
  planning_areas: Array<{
    id: string
    name: string
    region: string | null
  }> | null
  parent_subzone_id: string | null
}

export interface FlatTypeSummary {
  neighbourhood_id: string
  flat_type: string
  tx_12m: number
  p25_price_12m: number | null
  median_price_12m: number | null
  p75_price_12m: number | null
  median_psm_12m: number | null
  median_lease_years_12m: number | null
  avg_floor_area_12m: number | null
}

export interface NeighbourhoodSummary {
  neighbourhood_id: string
  tx_12m: number
  median_price_12m: number | null
  median_psm_12m: number | null
  median_lease_years_12m: number | null
  avg_floor_area_12m: number | null
  updated_at: string
}

export interface CenterPoint {
  lat: number
  lng: number
}

export interface PlanningAreaData {
  id: string
  name: string
  region: string | null
}

export interface SubzoneData {
  id: string
  name: string
  region: string | null
}

export interface AccessData {
  neighbourhood_id: string
  mrt_station_count: number | null
  mrt_access_type: string | null
  avg_distance_to_mrt: number | null
  updated_at: string
}

export interface NeighbourhoodResponse {
  id: string
  name: string
  one_liner: string | null
  planning_area: PlanningAreaData | null
  parent_subzone_id: string | null
  subzone_region: string | null
  type: string | null
  bbox: any
  center: CenterPoint | null
  summary: {
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
    avg_floor_area_12m: number | null
    updated_at: string
  } | null
  flat_type_details: FlatTypeSummary[]
  access: {
    mrt_station_count: number | null
    mrt_access_type: string | null
    avg_distance_to_mrt: number | null
    mrt_station_names: string[]
    updated_at: string
  } | null
  rating_mode?: 'residential_scored' | 'not_scored' | null
  short_note?: string | null
  variance_level?: 'compact' | 'moderate' | 'spread_out' | null
  created_at: string
  updated_at: string
}

