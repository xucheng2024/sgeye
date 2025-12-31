/**
 * Type definitions for HDB data
 */

export interface RawResaleTransaction {
  month: string
  town: string
  flat_type: string
  storey_range: string
  floor_area_sqm: number
  remaining_lease: string
  resale_price: number
  lease_commence_date?: number
}

export interface AggregatedMonthly {
  month: string
  town: string | null
  flat_type: string
  tx_count: number
  median_price: number
  p25_price: number
  p75_price: number
  median_psm: number
  median_lease_years: number
  avg_floor_area: number
}

export interface AffordabilityResult {
  maxMonthlyPayment: number
  maxLoanAmount: number
  maxPropertyPrice: number
  affordableTowns: Array<{
    town: string
    flatType: string
    medianPrice: number
    p25Price: number
    txCount: number
  }>
}

export interface BinnedLeaseData {
  binLabel: string
  binStart: number
  binEnd: number
  medianPrice: number
  p25Price: number
  p75Price: number
  medianPricePerSqm: number
  p25PricePerSqm: number
  p75PricePerSqm: number
  count: number
}

export type LeaseRiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface TownProfile {
  town: string
  flatType: string

  // Price & cashflow
  medianResalePrice: number
  estimatedMonthlyMortgage: number

  // Lease stats
  medianRemainingLease: number // years
  pctTxBelow60: number // 0-1
  pctTxBelow55: number // 0-1

  // Market stability
  volumeRecent: number
  volatility12m: number

  // Derived signals (engine output)
  signals: {
    leaseRisk: LeaseRiskLevel
    leaseSignalReasons: string[] // explainable
    pricingResponse: 'early_discount' | 'stable' | 'premium'
    stability: 'stable' | 'volatile' | 'fragile'
  }
}

export interface TownComparisonData {
  town: string
  flatType: string
  medianPrice: number
  p25Price: number
  p75Price: number
  medianLeaseYears: number
  pctBelow55Years: number
  txCount: number
  priceVolatility: number // Coefficient of variation
  medianPricePerSqm: number
}

export type PreferenceLens = 'lower_cost' | 'lease_safety' | 'school_pressure' | 'balanced'

// Time & Access types
export type Centrality = 'central' | 'non_central'
export type MrtDensity = 'high' | 'medium' | 'low'
export type TransferComplexity = 'direct' | '1_transfer' | '2_plus'
export type RegionalHubAccess = 'yes' | 'partial' | 'no'

export interface TownTimeAccess {
  town: string
  centrality: Centrality
  mrtDensity: MrtDensity
  transferComplexity: TransferComplexity
  regionalHubAccess: RegionalHubAccess
}

// Helper function to determine time burden level
export function getTimeBurdenLevel(timeAccess: TownTimeAccess | null): 'low' | 'medium' | 'high' {
  if (!timeAccess) return 'medium'
  
  let score = 0
  
  // Centrality: central = lower burden, non_central = higher burden
  if (timeAccess.centrality === 'non_central') score += 1
  
  // MRT Density: high = lower burden, low = higher burden
  if (timeAccess.mrtDensity === 'low') score += 2
  else if (timeAccess.mrtDensity === 'medium') score += 1
  
  // Transfer Complexity: direct = lower burden, 2_plus = higher burden
  if (timeAccess.transferComplexity === '2_plus') score += 2
  else if (timeAccess.transferComplexity === '1_transfer') score += 1
  
  // Regional Hub Access: yes = lower burden, no = higher burden
  if (timeAccess.regionalHubAccess === 'no') score += 1
  else if (timeAccess.regionalHubAccess === 'partial') score += 0.5
  
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

// Transport Burden Index (TBI) types
export interface TownTransportProfile {
  town: string
  // Central Access Burden (0-100)
  centralAccessBurden: number // Average transfers to CBD/Orchard/One-North
  // Transfer Burden (0-100)
  transferBurden: number // Line complexity and interchange crowding
  // Network Redundancy (0-100)
  networkRedundancy: number // Alternative route availability
  // Daily Mobility Friction (0-100)
  dailyMobilityFriction: number // Non-commute accessibility
  // Structural indicators
  mrtLinesCount: number // Number of MRT lines serving town
  averageTransfersToCBD: number // Average transfers to CBD hubs
  distanceBand: 'central' | 'well_connected' | 'peripheral' // Distance category
  commuteCategory: 'Central' | 'Well-connected' | 'Peripheral'
}

// Calculate TBI from transport profile
export function calculateTBI(profile: TownTransportProfile): number {
  const tbi = 
    0.40 * profile.centralAccessBurden +
    0.25 * profile.transferBurden +
    0.20 * profile.networkRedundancy +
    0.15 * profile.dailyMobilityFriction
  
  return Math.round(tbi)
}

// Get TBI level from score
export function getTBILevel(tbi: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (tbi <= 25) return 'low'
  if (tbi <= 50) return 'moderate'
  if (tbi <= 75) return 'high'
  return 'very_high'
}

// Get TBI level label
export function getTBILevelLabel(level: 'low' | 'moderate' | 'high' | 'very_high'): string {
  const labels = {
    low: 'Low burden',
    moderate: 'Moderate',
    high: 'High',
    very_high: 'Very High',
  }
  return labels[level]
}

// Compare Summary output
export interface CompareSummary {
  // Bottom Line (new top section)
  bottomLine: {
    changes: string[] // List of changes (👍, ⚠, 💰)
    bestFor: string // Best for statement
  } | null
  
  // Lens-based Recommendation (new format)
  recommendation: {
    headline: string // "Choose BUKIT BATOK if you prioritise..."
    tradeoffs: string[] // 3 fixed format bullets
    confidence: 'clear_winner' | 'balanced' | 'depends_on_preference'
  } | null
  
  // Standardized scores (0-100)
  scores: {
    townA: {
      entryCost: number
      leaseSafety: number
      schoolPressure: number
      stability: number
      overall: number
    }
    townB: {
      entryCost: number
      leaseSafety: number
      schoolPressure: number
      stability: number
      overall: number
    }
  } | null
  
  // Moving Education Impact
  movingEducationImpact: {
    spiChange: number // SPI difference (B - A)
    spiChangeText: string // e.g., "+4.3 (still Low)"
    highDemandSchoolsChange: number // Change in high-demand schools count
    highDemandSchoolsText: string // e.g., "+0 / +1"
    schoolCountChange: number // Change in number of primary schools
    schoolCountText: string // e.g., "7 → 6"
    choiceFlexibility: 'Similar' | 'Better' | 'Worse'
    explanation: string // Auto-generated explanation sentence
  } | null
  
  // Fixed 5-block structure
  headlineVerdict: string // Block 1: Headline Verdict
  educationPressure: {
    comparison: string // SPI comparison text
    explanation: string // Additional explanation
    pressureRangeNote?: string // Pressure range explanation
  } | null // Block 2: Education Pressure Comparison
  housingTradeoff: {
    price: string | null
    lease: string | null
  } // Block 3: Housing Trade-off
  bestSuitedFor: {
    townA: string[]
    townB: string[]
  } // Block 4: Who Each Town Is Better For
  decisionHint: string // Block 5: Decision Hint
  
  // Legacy fields (kept for compatibility)
  oneLiner: string
  keyDifferences: string[]
  bestFor: {
    townA: string[]
    townB: string[]
  }
  beCautious: {
    townA: string[]
    townB: string[]
  }
  advanced: {
    stabilityA: string
    stabilityB: string
    leaseRiskReasonsA: string[]
    leaseRiskReasonsB: string[]
  }
  badges: Array<{ town: 'A' | 'B'; label: string; tone: 'good' | 'warn' | 'neutral' }>
  
  // Killer phrase: Moving from A to B
  movingPhrase?: string | null
  
  // Time & Access comparison
  timeAccess?: {
    townA: TownTimeAccess | null
    townB: TownTimeAccess | null
    timeBurdenA: 'low' | 'medium' | 'high'
    timeBurdenB: 'low' | 'medium' | 'high'
    movingImpact: string | null // e.g., "Likely increases daily commuting time"
  } | null
}

// 3 Town Compare Summary (no ranking, just suitability)
export interface ThreeTownCompareSummary {
  planningHorizon: 'short' | 'medium' | 'long'
  overallTendencies: {
    townA: string // e.g., "Best affordability & flexibility"
    townB: string // e.g., "Most balanced long-term option"
    townC: string // e.g., "Lowest school pressure"
  }
  keyDifferences: {
    affordability: string // e.g., "Town A has the lowest entry cost"
    lease: string // e.g., "Town B shows the healthiest lease profile"
    schoolPressure: string // e.g., "Town C has consistently lower SPI"
    timeBurden?: string // Optional
  }
  recommendation: {
    ifLongTerm: string // e.g., "If long-term stability matters most, Town B stands out."
    ifAffordability: string // e.g., "If affordability matters more, Town A remains attractive."
  }
}

