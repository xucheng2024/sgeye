/**
 * Calculation functions for School Pressure Index (SPI)
 */

import { SPI_CONSTANTS } from '../constants'
import { getTownAggregated } from '../hdb-data'
import { PrimarySchool, PSLECutoff } from './types'

/**
 * Sigmoid function for logistic mapping
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Get cutoff band from cutoff value or range
 */
export function getCutoffBand(cutoff: PSLECutoff): 'low' | 'mid' | 'high' {
  if (cutoff.cutoff_max !== null) {
    if (cutoff.cutoff_max <= 230) return 'low'
    if (cutoff.cutoff_max <= 250) return 'mid'
    return 'high'
  }
  if (cutoff.cutoff_min !== null) {
    if (cutoff.cutoff_min >= 251) return 'high'
    if (cutoff.cutoff_min >= 231) return 'mid'
    return 'low'
  }
  // Fallback to range string
  if (cutoff.cutoff_range) {
    if (cutoff.cutoff_range.includes('≤230') || cutoff.cutoff_range.includes('<=230')) return 'low'
    if (cutoff.cutoff_range.includes('≥251') || cutoff.cutoff_range.includes('>=251')) return 'high'
    if (cutoff.cutoff_range.includes('231') || cutoff.cutoff_range.includes('250')) return 'mid'
  }
  return 'mid' // default
}

/**
 * Calculate Demand Pressure D (0-100)
 */
export function calculateDemandPressure(schools: PrimarySchool[], cutoffs: PSLECutoff[]): number {
  if (schools.length === 0) return 50 // neutral if no data

  // Get recent cutoffs
  const currentYear = new Date().getFullYear()
  const recentCutoffs = cutoffs.filter(c => c.year >= currentYear - SPI_CONSTANTS.RECENT_CUTOFF_YEARS)

  // Count high-demand schools
  let highCount = 0
  const schoolCutoffMap = new Map<number, PSLECutoff[]>()
  
  recentCutoffs.forEach(c => {
    if (!schoolCutoffMap.has(c.school_id)) {
      schoolCutoffMap.set(c.school_id, [])
    }
    schoolCutoffMap.get(c.school_id)!.push(c)
  })

  schools.forEach(school => {
    const schoolCutoffs = schoolCutoffMap.get(school.id) || []
    if (schoolCutoffs.length > 0) {
      // Use most recent cutoff
      const latest = schoolCutoffs.sort((a, b) => b.year - a.year)[0]
      if (getCutoffBand(latest) === 'high') {
        highCount++
      }
    }
  })

  const pHigh = highCount / schools.length

  // Logistic mapping: D = 100 * sigmoid((p_high - threshold) / scale)
  const D = 100 * sigmoid(
    (pHigh - SPI_CONSTANTS.DEMAND.HIGH_DEMAND_THRESHOLD) / SPI_CONSTANTS.DEMAND.SIGMOID_SCALE
  )
  
  return clamp(D)
}

/**
 * Calculate Choice Constraint C (0-100)
 */
export function calculateChoiceConstraint(schoolCount: number): number {
  if (schoolCount === 0) return 100 // worst case

  // C = 100 * (1 - min(1, log(1+n) / log(1+reference)))
  const C = 100 * (1 - Math.min(1, Math.log(1 + schoolCount) / Math.log(1 + SPI_CONSTANTS.CHOICE.REFERENCE_SCHOOL_COUNT)))
  
  return clamp(C)
}

/**
 * Calculate Uncertainty U (0-100)
 */
export function calculateUncertainty(schools: PrimarySchool[], cutoffs: PSLECutoff[]): number {
  if (schools.length === 0 || cutoffs.length === 0) return 50 // neutral

  const currentYear = new Date().getFullYear()
  const recentCutoffs = cutoffs.filter(c => c.year >= currentYear - 5)

  // Calculate std for each school's band variation
  const schoolStd: number[] = []

  schools.forEach(school => {
    const schoolCutoffs = recentCutoffs
      .filter(c => c.school_id === school.id)
      .sort((a, b) => a.year - b.year)

    if (schoolCutoffs.length >= SPI_CONSTANTS.UNCERTAINTY.MIN_CUTOFF_YEARS) {
      // Convert bands to numeric: low=0, mid=0.5, high=1.0
      const values: number[] = schoolCutoffs.map(c => {
        const band = getCutoffBand(c)
        return band === 'low' ? 0 : band === 'mid' ? 0.5 : 1.0
      })

      // Calculate standard deviation
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const std = Math.sqrt(variance)
      schoolStd.push(std)
    }
  })

  if (schoolStd.length === 0) return 50

  // Average std across schools
  const avgStd = schoolStd.reduce((a, b) => a + b, 0) / schoolStd.length

  // U = clamp(avg_std / scale * 100)
  const U = clamp((avgStd / SPI_CONSTANTS.UNCERTAINTY.STD_SCALE) * 100)
  
  return U
}

/**
 * Calculate Crowding R (0-100) using HDB volume as proxy
 */
export async function calculateCrowding(town: string): Promise<number> {
  try {
    // Get last 12 months of HDB transaction volume for this town
    const allTownData = await getTownAggregated(12, '4 ROOM') // Use 4-room as proxy
    
    if (!allTownData || allTownData.length === 0) return 50 // neutral

    // Find this town's data
    const townData = allTownData.find(d => d.town === town)
    
    if (!townData) return 50 // neutral if no data for this town

    // For MVP: simple normalization (can enhance with percentile later)
    // R = clamp((volume / max_volume) * 100)
    const R = clamp((townData.txCount / SPI_CONSTANTS.CROWDING.MAX_VOLUME) * 100)
    
    return R
  } catch (error) {
    console.error('Error calculating crowding:', error)
    return 50 // neutral fallback
  }
}



