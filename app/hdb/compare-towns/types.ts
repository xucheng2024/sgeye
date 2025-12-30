/**
 * Type definitions for Compare Towns page
 */

import { TownComparisonData, TownProfile } from '@/lib/hdb-data'

/**
 * Signal Layer: Convert raw data to signals
 */
export interface TownSignals {
  affordability: 'Comfortable' | 'Stretch' | 'Out of reach'
  cashflow: 'Strong buy advantage' | 'Buy advantage' | 'Rent competitive'
  leaseRisk: 'High' | 'Moderate' | 'Low'
  stability: 'Fragile' | 'Volatile' | 'Stable'
  valueProfile: 'Early discount' | 'Stable pricing' | 'Premium growth'
}

export interface SuitabilityResult {
  suits: string[]
  avoids: string[]
}

export interface DecisionGuidance {
  chooseA: string
  chooseB: string
  conclusion: string
}

