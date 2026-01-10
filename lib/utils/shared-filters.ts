/**
 * Shared filter utilities for client and server
 * Consolidates filtering logic to avoid duplication
 */

export interface FilterRanges {
  priceRanges: Record<string, [number, number]>
  leaseRanges: Record<string, [number, number]>
  mrtDistances: Record<string, [number, number]>
}

export const FILTER_RANGES: FilterRanges = {
  priceRanges: {
    low: [0, 499999],
    medium: [500000, 999999],
    high: [1000000, Number.MAX_SAFE_INTEGER]
  },
  leaseRanges: {
    low: [0, 59],
    medium: [60, 69],
    high: [70, 99]
  },
  mrtDistances: {
    close: [0, 499],      // <500m
    medium: [500, 1000],  // 500m~1km
    far: [1001, Number.MAX_SAFE_INTEGER]  // >1km
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
 * Convert MRT tiers to max distance (for backward compatibility)
 */
export function mrtTiersToMaxDistance(tiers: Set<string> | string[]): number | null {
  const tierArray = Array.isArray(tiers) ? tiers : Array.from(tiers)
  if (tierArray.length === 0) return null
  
  const ranges = tierArray
    .map(tier => FILTER_RANGES.mrtDistances[tier])
    .filter((range): range is [number, number] => Array.isArray(range) && range.length === 2)
  
  if (ranges.length === 0) return null
  
  return Math.max(...ranges.map(r => r[1]))
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
  
  // If has station in area, treat distance as 0 (within area = <500m)
  // Only match if "close" tier is selected
  if (hasStation) {
    return tierArray.includes('close')
  }
  
  // If no distance data, can't match any tier
  if (distance === null || isNaN(distance)) {
    return false
  }
  
  // Distance of 0 should match "close" tier (0-499m)
  // Check if distance matches any selected tier range
  return tierArray.some(tier => {
    const range = FILTER_RANGES.mrtDistances[tier]
    if (!range || !Array.isArray(range)) {
      return false
    }
    return distance >= range[0] && distance <= range[1]
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
 * Check if MRT distance matches max distance (for backward compatibility)
 */
export function matchesMrtDistance(distance: number | null, mrtDistanceMax: number | null, hasStation: boolean): boolean {
  if (mrtDistanceMax === null) return true
  
  // If has station in area, always match
  if (hasStation) return true
  
  if (distance === null || distance <= 0) return false
  return distance <= mrtDistanceMax
}

