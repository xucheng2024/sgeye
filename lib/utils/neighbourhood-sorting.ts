/**
 * Sorting utilities for neighbourhood data
 */

import { Neighbourhood, SortPreset } from '@/lib/types/neighbourhood'

export function applySortPreset(data: Neighbourhood[], preset: SortPreset): Neighbourhood[] {
  const sorted = [...data]
  
  switch (preset) {
    case 'affordable':
      return sorted.sort((a, b) => {
        const priceA = a.summary?.median_price_12m || Infinity
        const priceB = b.summary?.median_price_12m || Infinity
        return priceA - priceB
      })
    
    case 'lease':
      return sorted.sort((a, b) => {
        const leaseA = a.summary?.median_lease_years_12m || 0
        const leaseB = b.summary?.median_lease_years_12m || 0
        return leaseB - leaseA
      })
    
    case 'mrt':
      return sorted.sort((a, b) => {
        const accessA = a.access?.mrt_access_type || 'none'
        const accessB = b.access?.mrt_access_type || 'none'
        const accessOrder: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 }
        return accessOrder[accessB] - accessOrder[accessA]
      })
    
    case 'activity':
      return sorted.sort((a, b) => {
        const txA = a.summary?.tx_12m || 0
        const txB = b.summary?.tx_12m || 0
        return txB - txA
      })
    
    case 'price':
      return sorted.sort((a, b) => {
        const priceA = a.summary?.median_price_12m ? Number(a.summary.median_price_12m) : Infinity
        const priceB = b.summary?.median_price_12m ? Number(b.summary.median_price_12m) : Infinity
        if (priceA === Infinity && priceB === Infinity) return 0
        if (priceA === Infinity) return 1
        if (priceB === Infinity) return -1
        return priceA - priceB
      })
    
    case 'area':
      return sorted.sort((a, b) => {
        const areaA = a.summary?.avg_floor_area_12m ? Number(a.summary.avg_floor_area_12m) : -1
        const areaB = b.summary?.avg_floor_area_12m ? Number(b.summary.avg_floor_area_12m) : -1
        if (areaA === -1 && areaB === -1) return 0
        if (areaA === -1) return 1
        if (areaB === -1) return -1
        return areaB - areaA
      })
    
    case 'psm':
      return sorted.sort((a, b) => {
        const psmA = a.summary?.median_psm_12m ? Number(a.summary.median_psm_12m) : Infinity
        const psmB = b.summary?.median_psm_12m ? Number(b.summary.median_psm_12m) : Infinity
        if (psmA === Infinity && psmB === Infinity) return 0
        if (psmA === Infinity) return 1
        if (psmB === Infinity) return -1
        return psmA - psmB
      })
    
    default:
      return sorted
  }
}

