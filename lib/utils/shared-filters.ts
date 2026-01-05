/**
 * Shared filter utilities for client and server
 * Consolidates filtering logic to avoid duplication
 */

export interface FilterRanges {
  priceRanges: Record<string, [number, number]>
  leaseRanges: Record<string, [number, number]>
  mrtDistances: Record<string, number>
}

export const FILTER_RANGES: FilterRanges = {
  priceRanges: {
    low: [0, 499999],
    medium: [500000, 999999],
    high: [1000000, 2000000]
  },
  leaseRanges: {
    low: [0, 59],
    medium: [60, 69],
    high: [70, 99]
  },
  mrtDistances: {
    close: 500,
    medium: 1000,
    far: 2000
  }
}

/**
 * Convert price tiers to min/max range
 */
export function priceTiersToRange(tiers: Set<string> | string[]): { min: number | null; max: number | null } {
  const tierArray = Array.isArray(tiers) ? tiers : Array.from(tiers)
  if (tierArray.length === 0) return { min: null, max: null }
  
  const ranges = tierArray
    .map(tier => FILTER_RANGES.priceRanges[tier])
    .filter((range): range is [number, number] => range !== undefined)
  
  if (ranges.length === 0) return { min: null, max: null }
  
  return {
    min: Math.min(...ranges.map(r => r[0])),
    max: Math.max(...ranges.map(r => r[1]))
  }
}

/**
 * Convert lease tiers to min/max range
 */
export function leaseTiersToRange(tiers: Set<string> | string[]): { min: number | null; max: number | null } {
  const tierArray = Array.isArray(tiers) ? tiers : Array.from(tiers)
  if (tierArray.length === 0) return { min: null, max: null }
  
  const ranges = tierArray
    .map(tier => FILTER_RANGES.leaseRanges[tier])
    .filter((range): range is [number, number] => range !== undefined)
  
  if (ranges.length === 0) return { min: null, max: null }
  
  return {
    min: Math.min(...ranges.map(r => r[0])),
    max: Math.max(...ranges.map(r => r[1]))
  }
}

/**
 * Convert MRT tiers to max distance
 */
export function mrtTiersToMaxDistance(tiers: Set<string> | string[]): number | null {
  const tierArray = Array.isArray(tiers) ? tiers : Array.from(tiers)
  if (tierArray.length === 0) return null
  
  const distances = tierArray
    .map(tier => FILTER_RANGES.mrtDistances[tier])
    .filter((dist): dist is number => dist !== undefined)
  
  if (distances.length === 0) return null
  
  return Math.max(...distances)
}

/**
 * Check if price matches price tiers
 */
export function matchesPriceTiers(price: number | null, priceTiers: Set<string> | string[]): boolean {
  const tierArray = Array.isArray(priceTiers) ? priceTiers : Array.from(priceTiers)
  if (tierArray.length === 0) return true
  if (price == null || !Number.isFinite(price)) return false
  
  return tierArray.some(tier => {
    const range = FILTER_RANGES.priceRanges[tier]
    return !!range && price >= range[0] && price <= range[1]
  })
}

/**
 * Check if lease matches lease tiers
 */
export function matchesLeaseTiers(lease: number | null, leaseTiers: Set<string> | string[]): boolean {
  const tierArray = Array.isArray(leaseTiers) ? leaseTiers : Array.from(leaseTiers)
  if (tierArray.length === 0) return true
  if (lease == null || !Number.isFinite(lease)) return false
  
  return tierArray.some(tier => {
    const range = FILTER_RANGES.leaseRanges[tier]
    return !!range && lease >= range[0] && lease <= range[1]
  })
}

/**
 * Check if MRT distance matches MRT tiers
 */
export function matchesMrtTiers(distance: number | null, mrtTiers: Set<string> | string[], hasStation: boolean): boolean {
  const tierArray = Array.isArray(mrtTiers) ? mrtTiers : Array.from(mrtTiers)
  if (tierArray.length === 0) return true
  
  // If has station in area, always match
  if (hasStation) return true
  
  if (distance === null || distance <= 0) return false
  
  return tierArray.some(tier => {
    const maxDist = FILTER_RANGES.mrtDistances[tier]
    return maxDist && distance <= maxDist
  })
}

/**
 * Check if price matches min/max range
 */
export function matchesPriceRange(price: number | null, priceMin: number | null, priceMax: number | null): boolean {
  if (priceMin === null && priceMax === null) return true
  if (price === null || !Number.isFinite(price)) return false
  if (priceMin !== null && price < priceMin) return false
  if (priceMax !== null && price > priceMax) return false
  return true
}

/**
 * Check if lease matches min/max range
 */
export function matchesLeaseRange(lease: number | null, leaseMin: number | null, leaseMax: number | null): boolean {
  if (leaseMin === null && leaseMax === null) return true
  if (lease === null || !Number.isFinite(lease)) return false
  if (leaseMin !== null && lease < leaseMin) return false
  if (leaseMax !== null && lease > leaseMax) return false
  return true
}

/**
 * Check if MRT distance matches max distance
 */
export function matchesMrtDistance(distance: number | null, mrtDistanceMax: number | null, hasStation: boolean): boolean {
  if (mrtDistanceMax === null) return true
  
  // If has station in area, always match
  if (hasStation) return true
  
  if (distance === null || distance <= 0) return false
  return distance <= mrtDistanceMax
}

