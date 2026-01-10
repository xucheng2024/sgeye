/**
 * Utility functions for neighbourhood data processing
 */

import { Neighbourhood } from '@/lib/types/neighbourhood'

// Convert string to Title Case
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format flat type for display
export function formatFlatType(flatType: string): string {
  if (flatType === 'All') return 'Any size'
  if (flatType === 'EXECUTIVE') return 'Executive'
  return toTitleCase(flatType)
}

// Re-export normalizeFlatType from dedicated module
export { normalizeFlatType } from './flat-type-normalizer'

// Format currency
export function formatCurrency(amount: number | null): string {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format distance
export function formatDistance(meters: number | null): string {
  if (!meters) return 'N/A'
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// Get MRT access label
export function getMRTAccessLabel(
  type: string | null, 
  distance: number | null = null, 
  stationCount: number | null = null,
  stationNames: string[] = []
): { text: string; isInArea: boolean } {
  if (stationCount !== null && stationCount > 0) {
    if (stationNames.length > 0) {
      const stationNamesText = stationNames.slice(0, 3).join(', ') + (stationNames.length > 3 ? ` +${stationNames.length - 3} more` : '')
      return {
        text: `${stationNamesText} in area`,
        isInArea: true
      }
    } else {
      return {
        text: `${stationCount} station${stationCount > 1 ? 's' : ''} in area`,
        isInArea: true
      }
    }
  }
  
  if (distance !== null && distance > 0) {
    if (stationNames.length > 0) {
      const nearestStation = stationNames[0]
      return {
        text: `${nearestStation} ${formatDistance(distance)} outside area`,
        isInArea: false
      }
    } else {
      return {
        text: `${formatDistance(distance)} outside area`,
        isInArea: false
      }
    }
  }
  
  return {
    text: 'None',
    isInArea: false
  }
}

// Calculate thresholds for price and lease (optimized version)
export function calculateThresholds(data: Neighbourhood[]): {
  price: { p25: number; p50: number; p75: number }
  lease: { p25: number; p50: number; p75: number }
} {
  // Early return for empty data
  if (data.length === 0) {
    return {
      price: { p25: 550000, p50: 650000, p75: 745000 },
      lease: { p25: 54, p50: 61, p75: 75 }
    }
  }
  
  // Use single pass for better performance
  const prices: number[] = []
  const leases: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const price = data[i].summary?.median_price_12m
    const lease = data[i].summary?.median_lease_years_12m
    
    if (price != null && price > 0 && typeof price === 'number') {
      prices.push(price)
    }
    
    if (lease != null && lease > 0 && typeof lease === 'number') {
      leases.push(lease)
    }
  }
  
  // Sort only if we have data (avoid unnecessary sorting)
  if (prices.length > 0) {
    prices.sort((a, b) => a - b)
  }
  if (leases.length > 0) {
    leases.sort((a, b) => a - b)
  }
  
  const getPercentile = (arr: number[], percentile: number, fallback: number): number => {
    if (arr.length === 0) return fallback
    const index = Math.floor((arr.length - 1) * percentile)
    return arr[index] ?? fallback
  }
  
  return {
    price: {
      p25: getPercentile(prices, 0.25, 550000),
      p50: getPercentile(prices, 0.5, 650000),
      p75: getPercentile(prices, 0.75, 745000),
    },
    lease: {
      p25: getPercentile(leases, 0.25, 54),
      p50: getPercentile(leases, 0.5, 61),
      p75: getPercentile(leases, 0.75, 75),
    }
  }
}

// Generate card description based on neighbourhood data
export function generateCardDescription(
  n: Neighbourhood,
  priceThresholds: { p25: number; p50: number; p75: number },
  leaseThresholds: { p25: number; p50: number; p75: number }
): string {
  const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
  const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
  const mrtAccess = n.access?.mrt_access_type
  const txCount = n.summary?.tx_12m ? Number(n.summary.tx_12m) : 0
  
  const hasPrice = price !== null && price !== undefined && !isNaN(price) && price > 0
  const hasLease = lease !== null && lease !== undefined && !isNaN(lease) && lease > 0
  const hasMRT = mrtAccess !== null && mrtAccess !== undefined && mrtAccess !== ''
  const hasTx = txCount > 0
  const hasSummary = n.summary !== null && n.summary !== undefined
  const hasAccess = n.access !== null && n.access !== undefined
  
  if (!hasSummary && !hasAccess) {
    return 'No recent data available (last 12 months)'
  }
  
  if (!hasSummary && hasAccess) {
    return 'No recent transactions (last 12 months), check access details'
  }
  
  if (hasSummary && !hasPrice && !hasLease && !hasTx) {
    return 'Limited recent data, check details for availability'
  }
  
  const isAffordable = hasPrice && price < priceThresholds.p25
  const isModerate = hasPrice && price >= priceThresholds.p25 && price < priceThresholds.p75
  const isExpensive = hasPrice && price >= priceThresholds.p75
  
  const hasLongLease = hasLease && lease >= leaseThresholds.p75
  const hasMediumLease = hasLease && lease >= leaseThresholds.p25 && lease < leaseThresholds.p75
  const hasShortLease = hasLease && lease < leaseThresholds.p25
  
  const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
  const isWalkableMRT = distance !== null && distance > 0 && distance <= 800
  
  const hasHighMRT = mrtAccess === 'high' || (mrtAccess === 'none' && isWalkableMRT && distance && distance <= 500)
  const hasMediumMRT = mrtAccess === 'medium' || (mrtAccess === 'none' && isWalkableMRT && distance && distance > 500)
  const hasLimitedMRT = !hasHighMRT && !hasMediumMRT && (mrtAccess === 'low' || mrtAccess === 'none' || !hasMRT)
  
  const isActive = txCount > 100
  
  if (isAffordable) {
    if (hasShortLease) return 'Lower entry price, shorter remaining lease'
    if (hasLimitedMRT) return 'Lower entry price, limited MRT access'
    if (hasLongLease) return 'Lower entry price, long remaining lease'
    return 'Lower entry price, moderate characteristics'
  }
  
  if (isExpensive) {
    if (hasHighMRT) return 'Well-connected, higher price pressure'
    if (hasLongLease) return 'Higher price point, long remaining lease'
    if (isActive) return 'Active market, higher price pressure'
    return 'Higher price point, check value carefully'
  }
  
  if (hasLongLease) {
    if (hasLimitedMRT) return 'Long remaining lease, limited MRT access'
    if (isExpensive) return 'Long remaining lease, higher price point'
    return 'Long remaining lease, moderate price and access'
  }
  
  if (hasShortLease) {
    return 'Shorter remaining lease, consider long-term plans'
  }
  
  if (hasHighMRT) {
    if (isExpensive) return 'Well-connected, higher price pressure'
    if (hasShortLease) return 'Well-connected, shorter remaining lease'
    return 'Well-connected, moderate price and lease'
  }
  
  if (hasLimitedMRT && hasPrice) {
    return 'Limited MRT access, consider transport needs'
  }
  
  if (isActive) {
    if (isExpensive) return 'Active market, higher price pressure'
    if (hasShortLease) return 'Active market, shorter remaining lease'
    return 'Active market, good choice availability'
  }
  
  if (isModerate && hasMediumLease) {
    return 'Moderate price, balanced lease and access'
  }
  
  if (hasPrice && !hasLease && !hasMRT) {
    return `Median price ${formatCurrency(price)}, no lease or MRT data available`
  }
  if (hasPrice && !hasLease) {
    return `Median price ${formatCurrency(price)}, no lease data available`
  }
  if (hasLease && !hasPrice && !hasMRT) {
    return `Remaining lease ${lease.toFixed(0)} years, no price or MRT data available`
  }
  if (hasLease && !hasPrice) {
    return `Remaining lease ${lease.toFixed(0)} years, no price data available`
  }
  if (hasMRT && !hasPrice && !hasLease) {
    const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
    const stationCount = n.access?.mrt_station_count ? Number(n.access.mrt_station_count) : null
    const mrtInfo = getMRTAccessLabel(mrtAccess, distance, stationCount, n.access?.mrt_station_names || [])
    return `MRT access: ${mrtInfo.text}, no price or lease data (last 12 months)`
  }
  if (hasTx && !hasPrice && !hasLease) {
    return `${txCount} recent transactions, but no price or lease data available`
  }
  
  if (hasSummary && !hasPrice && !hasLease && !hasTx) {
    return 'No recent transaction data (last 12 months)'
  }
  
  if (hasAccess && !hasSummary) {
    return 'No recent transactions (last 12 months)'
  }
  
  return 'Data availability limited, check details'
}

