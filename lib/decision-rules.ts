/**
 * Compare Towns Decision Rules
 * 
 * This file contains the structured decision rules for generating Compare Towns summaries.
 * All rules are configurable, explainable, and extensible.
 */

// ============================================
// Family Profile (MVP: 4 Questions)
// ============================================

export type FamilyStage = 'no_children' | 'primary_family' | 'planning_primary' | 'older_children'
export type HoldingYears = 'short' | 'medium' | 'long'  // <5, 5-15, 15+
export type CostVsValue = 'cost' | 'value' | 'balanced'
export type SchoolSensitivity = 'high' | 'neutral' | 'low'

export interface FamilyProfile {
  stage: FamilyStage
  holdingYears: HoldingYears
  costVsValue: CostVsValue
  schoolSensitivity: SchoolSensitivity
}

export interface RuleProfile {
  activeRuleSet: string  // 'balanced' | 'low_entry' | 'long_term' | 'low_school_pressure'
  weightAdjustments: {
    school: number
    lease: number
    price: number
    rent: number
    stability: number
  }
  personalizedContext: {
    stageDescription: string
    holdingDescription: string
    priorityDescription: string
  }
}

// ============================================
// Input Metrics (Standardized)
// ============================================
// All metrics are normalized: positive = favorable for Town B (moving from A → B)

export interface ComparisonMetrics {
  deltaPrice: number        // Entry price difference (B - A) in S$
  deltaLeaseYears: number   // Remaining lease years difference (B - A)
  deltaSPI: number          // School Pressure Index change (B - A)
  deltaRentGap: number      // Rent vs Buy gap difference (B - A) in S$/month
  deltaStability: number    // Market stability difference (qualitative → numeric)
  
  // Additional context
  leaseA: number            // Town A median remaining lease
  leaseB: number            // Town B median remaining lease
  spiLevelA: 'low' | 'medium' | 'high' | null
  spiLevelB: 'low' | 'medium' | 'high' | null
  pctTxBelow55A: number     // % transactions < 55 years in Town A
  pctTxBelow55B: number     // % transactions < 55 years in Town B
}

// ============================================
// Preference Modes
// ============================================

export interface PreferenceMode {
  id: string
  weights: {
    price: number
    lease: number
    school: number
    rent: number
    stability: number
  }
  description: string
  hardRules?: HardRule[]
  schoolRules?: SchoolRule[]
}

export interface HardRule {
  condition: string
  effect: 'penalty' | 'warning' | 'override'
  threshold?: number
}

export interface SchoolRule {
  condition: string
  impact: 'significant' | 'muted' | 'neutral'
  threshold?: number
}

// Preference Mode Definitions
export const PREFERENCE_MODES: Record<string, PreferenceMode> = {
  balanced: {
    id: 'balanced',
    weights: {
      price: 0.25,
      lease: 0.30,
      school: 0.15,
      rent: 0.20,
      stability: 0.10
    },
    description: 'Weighted across affordability, lease safety, school pressure, and cash flow.'
  },
  
  low_entry: {
    id: 'low_entry',
    weights: {
      price: 0.45,
      rent: 0.25,
      lease: 0.15,
      school: 0.10,
      stability: 0.05
    },
    description: 'Prioritises lower upfront cost and monthly cash flow.',
    hardRules: [
      {
        condition: 'price_diff > 20000',
        effect: 'override',
        threshold: 20000
      }
    ]
  },
  
  long_term: {
    id: 'long_term',
    weights: {
      lease: 0.45,
      stability: 0.20,
      school: 0.15,
      price: 0.10,
      rent: 0.10
    },
    description: 'Optimised for long holding periods and future resale.',
    hardRules: [
      {
        condition: 'lease < 60',
        effect: 'warning',
        threshold: 60
      }
    ]
  },
  
  low_school_pressure: {
    id: 'low_school_pressure',
    weights: {
      school: 0.45,
      lease: 0.20,
      price: 0.15,
      stability: 0.10,
      rent: 0.10
    },
    description: 'Prioritises lower primary school competition and flexibility.',
    schoolRules: [
      {
        condition: 'delta_spi >= 10',
        impact: 'significant',
        threshold: 10
      },
      {
        condition: 'spi_level == Low',
        impact: 'muted'
      }
    ]
  }
}

// ============================================
// Summary Text Generation Rules
// ============================================

export interface SummaryTextRules {
  headline: {
    template: string
    conditions: Array<{
      condition: string
      template: string
    }>
  }
  tradeoffs: {
    price: {
      thresholds: Array<{
        condition: string
        text: string
      }>
    }
    lease: {
      thresholds: Array<{
        condition: string
        text: string
      }>
    }
    school: {
      thresholds: Array<{
        condition: string
        text: string
      }>
    }
  }
  decisionHint: {
    conditions: Array<{
      condition: string
      text: string
    }>
  }
}

export const SUMMARY_TEXT_RULES: SummaryTextRules = {
  headline: {
    template: 'Choose {town} based on {preference}.',
    conditions: [
      {
        condition: 'preference == balanced && overall_diff > 12',
        template: 'Choose {town} based on balanced factors.'
      },
      {
        condition: 'preference == balanced && overall_diff <= 12',
        template: 'Both towns are viable — {town} has a slight edge.'
      },
      {
        condition: 'preference == low_entry',
        template: 'Choose {town} if you prioritise lower entry price.'
      },
      {
        condition: 'preference == long_term',
        template: 'Choose {town} if you prioritise long-term lease safety.'
      },
      {
        condition: 'preference == low_school_pressure',
        template: 'Choose {town} if you prioritise lower primary school pressure.'
      }
    ]
  },
  
  tradeoffs: {
    price: {
      thresholds: [
        {
          condition: 'abs(delta_price) >= 30000',
          text: '{cheaper} is cheaper by ~{diff}'
        },
        {
          condition: 'abs(delta_price) >= 20000',
          text: '{cheaper} is cheaper by ~{diff}'
        }
      ]
    },
    lease: {
      thresholds: [
        {
          condition: 'abs(delta_lease_years) >= 20',
          text: '{healthier} has significantly healthier lease profile (+{diff} yrs)'
        },
        {
          condition: 'abs(delta_lease_years) > 0',
          text: '{healthier} has healthier lease profile (+{diff} yrs)'
        },
        {
          condition: 'abs(delta_lease_years) < 0',
          text: '{shorter} has shorter remaining leases'
        }
      ]
    },
    school: {
      thresholds: [
        {
          condition: 'abs(delta_spi) >= 8 && spi_level_change',
          text: 'Moving to {town} {direction} SPI significantly ({level})'
        },
        {
          condition: 'abs(delta_spi) >= 3',
          text: 'Moving to {town} {direction} SPI slightly ({level})'
        },
        {
          condition: 'abs(delta_spi) < 3',
          text: 'School pressure remains similar'
        }
      ]
    }
  },
  
  decisionHint: {
    conditions: [
      {
        condition: 'preference == long_term',
        text: 'If you plan to hold long-term (15+ years), lease profile matters more than upfront price.'
      },
      {
        condition: 'preference == low_entry && delta_price > 30000',
        text: 'If upfront cost is your primary concern, the price difference may outweigh other factors.'
      },
      {
        condition: 'preference == low_school_pressure && abs(delta_spi) >= 8',
        text: 'If primary school pressure is your priority, the SPI difference should be your main consideration.'
      },
      {
        condition: 'default',
        text: 'Consider your holding period and priorities when making this decision.'
      }
    ]
  }
}

// ============================================
// Best Suited For / Be Cautious If Rules
// ============================================

export interface SuitabilityRule {
  type: 'best_suited' | 'be_cautious'
  conditions: Array<{
    metric: string
    operator: '>=' | '<=' | '>' | '<' | '=='
    value: number | string
    text: string
  }>
}

export const SUITABILITY_RULES: SuitabilityRule[] = [
  {
    type: 'best_suited',
    conditions: [
      {
        metric: 'lease',
        operator: '>=',
        value: 70,
        text: 'Long-term owners valuing lease security'
      },
      {
        metric: 'rent_gap',
        operator: '>',
        value: 0,
        text: 'Buyers seeking monthly cash flow advantage'
      },
      {
        metric: 'spi_level',
        operator: '==',
        value: 'Low',
        text: 'Families prioritising lower primary school pressure'
      }
    ]
  },
  {
    type: 'be_cautious',
    conditions: [
      {
        metric: 'lease',
        operator: '<',
        value: 60,
        text: 'High lease risk — may face financing constraints'
      },
      {
        metric: 'pct_tx_below_55',
        operator: '>',
        value: 30,
        text: 'Significant portion of flats below 55 years remaining'
      }
    ]
  }
]

// ============================================
// Helper Functions
// ============================================

export function getPreferenceMode(lens: string, longTerm: boolean): PreferenceMode {
  // Map lens to preference mode
  const modeMap: Record<string, string> = {
    'lower_cost': 'low_entry',
    'lease_safety': 'long_term',
    'school_pressure': 'low_school_pressure',
    'balanced': 'balanced'
  }
  
  let modeId = modeMap[lens] || 'balanced'
  
  // Override to long_term if long-term holding is selected
  if (longTerm && modeId !== 'low_school_pressure') {
    modeId = 'long_term'
  }
  
  return PREFERENCE_MODES[modeId]
}

export function calculateWeightedScore(
  metrics: ComparisonMetrics,
  mode: PreferenceMode
): number {
  // Normalize metrics to 0-100 scale (relative to comparison)
  const priceScore = metrics.deltaPrice < 0 ? 100 : 0  // Negative = B cheaper = better
  const leaseScore = metrics.deltaLeaseYears > 0 ? 100 : 0  // Positive = B healthier = better
  const schoolScore = metrics.deltaSPI < 0 ? 100 : 0  // Negative = B lower pressure = better
  const rentScore = metrics.deltaRentGap > 0 ? 100 : 0  // Positive = B better cash flow = better
  const stabilityScore = metrics.deltaStability > 0 ? 50 : 0  // Neutral for now
  
  return (
    priceScore * mode.weights.price +
    leaseScore * mode.weights.lease +
    schoolScore * mode.weights.school +
    rentScore * mode.weights.rent +
    stabilityScore * mode.weights.stability
  )
}

export function checkHardRules(
  metrics: ComparisonMetrics,
  mode: PreferenceMode
): Array<{ type: 'warning' | 'penalty' | 'override'; message: string }> {
  const warnings: Array<{ type: 'warning' | 'penalty' | 'override'; message: string }> = []
  
  if (!mode.hardRules) return warnings
  
  for (const rule of mode.hardRules) {
    if (rule.condition === 'lease < 60' && rule.threshold) {
      if (metrics.leaseA < rule.threshold || metrics.leaseB < rule.threshold) {
        warnings.push({
          type: rule.effect as 'warning' | 'penalty' | 'override',
          message: '⚠ Lease Risk: One or both towns have median lease below 60 years, which may face financing constraints.'
        })
      }
    }
    
    if (rule.condition === 'price_diff > 20000' && rule.threshold) {
      if (Math.abs(metrics.deltaPrice) > rule.threshold) {
        warnings.push({
          type: rule.effect as 'warning' | 'penalty' | 'override',
          message: '💰 Significant price difference detected — this may be the primary factor.'
        })
      }
    }
  }
  
  return warnings
}

export function evaluateSchoolRules(
  metrics: ComparisonMetrics,
  mode: PreferenceMode
): { impact: 'significant' | 'muted' | 'neutral'; message: string } {
  if (!mode.schoolRules) {
    return { impact: 'neutral', message: '' }
  }
  
  const spiChangeAbs = Math.abs(metrics.deltaSPI)
  const finalLevel = metrics.deltaSPI > 0 ? metrics.spiLevelB : metrics.spiLevelA
  
  for (const rule of mode.schoolRules) {
    if (rule.condition === 'delta_spi >= 10' && rule.threshold) {
      if (spiChangeAbs >= rule.threshold) {
        return {
          impact: 'significant',
          message: 'School pressure changes significantly — this should be a primary consideration.'
        }
      }
    }
    
    if (rule.condition === 'spi_level == Low') {
      if (finalLevel === 'low') {
        return {
          impact: 'muted',
          message: 'School pressure changes slightly, but stays within Low range — unlikely to materially affect daily stress.'
        }
      }
    }
  }
  
  return { impact: 'neutral', message: '' }
}

// ============================================
// Family Profile → Rule Profile Mapping
// ============================================

export function mapFamilyProfileToRuleProfile(profile: FamilyProfile): RuleProfile {
  // Step 1: Determine base rule set from cost_vs_value
  let activeRuleSet: string
  if (profile.costVsValue === 'cost') {
    activeRuleSet = 'low_entry'
  } else if (profile.costVsValue === 'value') {
    activeRuleSet = 'long_term'
  } else {
    activeRuleSet = 'balanced'
  }
  
  // Step 2: Apply holding years adjustment
  if (profile.holdingYears === 'long' && activeRuleSet !== 'low_school_pressure') {
    activeRuleSet = 'long_term'
  }
  
  // Step 3: Calculate weight adjustments
  const adjustments = {
    school: 0,
    lease: 0,
    price: 0,
    rent: 0,
    stability: 0
  }
  
  // Family stage adjustments
  if (profile.stage === 'no_children') {
    adjustments.school -= 0.10  // ↓ School weight
  } else if (profile.stage === 'primary_family' || profile.stage === 'planning_primary') {
    adjustments.school += 0.15  // ↑ School weight
  } else if (profile.stage === 'older_children') {
    adjustments.lease += 0.05
    adjustments.stability += 0.05  // ↑ Lease + Stability
  }
  
  // Holding years adjustments
  if (profile.holdingYears === 'short') {
    adjustments.lease -= 0.10  // ↓ Lease importance
    adjustments.price += 0.05
  } else if (profile.holdingYears === 'long') {
    adjustments.lease += 0.10  // ↑ Lease & resale
    adjustments.stability += 0.05
  }
  
  // School sensitivity adjustments
  if (profile.schoolSensitivity === 'high') {
    adjustments.school += 0.20  // +0.2
  } else if (profile.schoolSensitivity === 'low') {
    adjustments.school -= 0.10  // -0.1
  }
  
  // Normalize adjustments (ensure weights sum to 1)
  const totalAdjustment = Object.values(adjustments).reduce((sum, val) => sum + Math.abs(val), 0)
  if (totalAdjustment > 0.3) {
    // Scale down if adjustments are too large
    const scale = 0.3 / totalAdjustment
    Object.keys(adjustments).forEach(key => {
      adjustments[key as keyof typeof adjustments] *= scale
    })
  }
  
  // Step 4: Generate personalized context descriptions
  const stageDescriptions: Record<FamilyStage, string> = {
    'no_children': 'Young couple / No children yet',
    'primary_family': 'Family with primary-school child(ren)',
    'planning_primary': 'Planning for primary school soon',
    'older_children': 'Older children / Long-term stability focus'
  }
  
  const holdingDescriptions: Record<HoldingYears, string> = {
    'short': '< 5 years',
    'medium': '5–15 years',
    'long': '15+ years'
  }
  
  const priorityDescriptions: Record<CostVsValue, string> = {
    'cost': 'Lower upfront & monthly cost',
    'value': 'Long-term value & resale safety',
    'balanced': 'Balanced'
  }
  
  return {
    activeRuleSet,
    weightAdjustments: adjustments,
    personalizedContext: {
      stageDescription: stageDescriptions[profile.stage],
      holdingDescription: holdingDescriptions[profile.holdingYears],
      priorityDescription: priorityDescriptions[profile.costVsValue]
    }
  }
}

// Apply rule profile to preference mode (with adjustments)
export function applyRuleProfile(baseMode: PreferenceMode, ruleProfile: RuleProfile): PreferenceMode {
  const adjustedWeights = {
    price: Math.max(0, Math.min(1, baseMode.weights.price + ruleProfile.weightAdjustments.price)),
    lease: Math.max(0, Math.min(1, baseMode.weights.lease + ruleProfile.weightAdjustments.lease)),
    school: Math.max(0, Math.min(1, baseMode.weights.school + ruleProfile.weightAdjustments.school)),
    rent: Math.max(0, Math.min(1, baseMode.weights.rent + ruleProfile.weightAdjustments.rent)),
    stability: Math.max(0, Math.min(1, baseMode.weights.stability + ruleProfile.weightAdjustments.stability))
  }
  
  // Normalize weights to sum to 1
  const total = Object.values(adjustedWeights).reduce((sum, val) => sum + val, 0)
  if (total > 0) {
    Object.keys(adjustedWeights).forEach(key => {
      adjustedWeights[key as keyof typeof adjustedWeights] /= total
    })
  }
  
  return {
    ...baseMode,
    id: ruleProfile.activeRuleSet,
    weights: adjustedWeights,
    description: baseMode.description
  }
}

