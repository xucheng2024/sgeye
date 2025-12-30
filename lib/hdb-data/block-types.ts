/**
 * Type definitions for block-level data
 */

export interface Block {
  id: string
  town: string
  blockNo: string
  street: string
  address: string
  lat: number | null
  lon: number | null
}

export interface BlockMetric {
  id: string
  blockId: string
  town: string
  flatType: string
  windowYears: number // 5 or 10
  txCount: number
  medianPricePsm: number | null
  medianResalePrice: number | null
  qoqChangePsm: number | null
  rolling6mChangePsm: number | null
  medianRemainingLeaseYears: number | null
  leasePercentileInTown: number | null
  mrtBand: '<400' | '400-800' | '>800' | null
  nearestMrtName: string | null
  nearestMrtDistM: number | null
  busStops400m: number
  primaryWithin1km: number
  periodStart: string
  periodEnd: string
  updatedAt: string
}

export interface BlockWithMetrics extends Block {
  metrics: BlockMetric | null
}

export type SortOption = 'lease_healthiest' | 'closest_mrt' | 'best_value' | 'balanced'
export type MrtBandFilter = '<400' | '<800' | 'any'
export type PriceVsTownFilter = 'below' | 'any'

export interface BlockFilters {
  towns: string[]
  flatType: string
  window: 5 | 10
  leaseMinYears?: number
  mrtBand?: MrtBandFilter
  busStopsMin?: number
  priceVsTown?: PriceVsTownFilter
  sort: SortOption
}

