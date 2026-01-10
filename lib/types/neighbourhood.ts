/**
 * Type definitions for neighbourhood data
 */

export interface Neighbourhood {
  id: string
  name: string
  one_liner: string | null
  planning_area: {
    id: string
    name: string
    region?: 'CCR' | 'RCR' | 'OCR' | null
  } | null
  parent_subzone_id?: string | null
  subzone_region?: 'Central' | 'East' | 'North' | 'North-East' | 'West' | null
  summary: {
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
    avg_floor_area_12m?: number | null
  } | null
  flat_type_details?: Array<{
    flat_type: string
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
    avg_floor_area_12m?: number | null
    growth_assessment?: {
      growth_potential: 'high' | 'medium' | 'low' | 'insufficient'
      lease_risk: 'green' | 'amber' | 'red'
      trend_stability: 'stable' | 'volatile' | 'insufficient'
      net_growth_rate?: number | null
      net_growth_score?: number | null
    } | null
  }>
  access: {
    mrt_station_count: number
    mrt_access_type: string
    avg_distance_to_mrt: number | null
    mrt_station_names?: string[]
  } | null
  bbox?: number[] | null
  center?: { lat: number; lng: number } | null
  growth_assessment?: {
    growth_potential: 'high' | 'medium' | 'low' | 'insufficient'
    lease_risk: 'green' | 'amber' | 'red'
    trend_stability: 'stable' | 'volatile' | 'insufficient'
    net_growth_score?: number
  } | null
  rating_mode?: 'residential_scored' | 'not_scored' | null
  short_note?: string | null
  variance_level?: 'compact' | 'moderate' | 'spread_out' | null
}

export interface PlanningArea {
  id: string
  name: string
}

export type SortPreset = 'affordable' | 'lease' | 'mrt' | 'activity' | 'price' | 'area' | 'psm' | 'default'

export interface NeighbourhoodWithFlatType extends Neighbourhood {
  display_flat_type?: string
}

