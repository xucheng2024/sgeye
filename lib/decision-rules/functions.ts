/**
 * Helper functions for Decision Rules module
 */

import {
  FAMILY_PROFILE_ADJUSTMENTS,
  HOLDING_PERIOD,
} from '../constants'
import { PREFERENCE_MODES } from './config'
import {
  FamilyProfile,
  RuleProfile,
  ComparisonMetrics,
  PreferenceMode,
  FamilyStage,
  HoldingYears,
  CostVsValue,
} from './types'

/**
 * Get preference mode based on lens and long-term flag
 */
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

/**
 * Calculate weighted score based on metrics and preference mode
 */
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

/**
 * Check hard rules and return warnings/penalties
 */
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
          message: `⚠ Lease Risk: One or both towns have median lease below ${rule.threshold} years, which may face financing constraints.`
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

/**
 * Evaluate school rules and return impact assessment
 */
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

/**
 * Map family profile to rule profile
 */
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
    adjustments.school += FAMILY_PROFILE_ADJUSTMENTS.SCHOOL.NO_CHILDREN
  } else if (profile.stage === 'primary_family' || profile.stage === 'planning_primary') {
    adjustments.school += FAMILY_PROFILE_ADJUSTMENTS.SCHOOL.PRIMARY_FAMILY
  } else if (profile.stage === 'older_children') {
    adjustments.lease += 0.05
    adjustments.stability += 0.05  // ↑ Lease + Stability
  }
  
  // Holding years adjustments
  if (profile.holdingYears === 'short') {
    adjustments.lease += FAMILY_PROFILE_ADJUSTMENTS.LEASE.SHORT
    adjustments.price += 0.05
  } else if (profile.holdingYears === 'long') {
    adjustments.lease += FAMILY_PROFILE_ADJUSTMENTS.LEASE.LONG
    adjustments.stability += 0.05
  }
  
  // School sensitivity adjustments
  if (profile.schoolSensitivity === 'high') {
    adjustments.school += FAMILY_PROFILE_ADJUSTMENTS.SENSITIVITY.HIGH
  } else if (profile.schoolSensitivity === 'low') {
    adjustments.school += FAMILY_PROFILE_ADJUSTMENTS.SENSITIVITY.LOW
  }
  
  // Normalize adjustments (ensure weights sum to 1)
  const totalAdjustment = Object.values(adjustments).reduce((sum, val) => sum + Math.abs(val), 0)
  if (totalAdjustment > FAMILY_PROFILE_ADJUSTMENTS.MAX_TOTAL_ADJUSTMENT) {
    // Scale down if adjustments are too large
    const scale = FAMILY_PROFILE_ADJUSTMENTS.MAX_TOTAL_ADJUSTMENT / totalAdjustment
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
    'short': `< ${HOLDING_PERIOD.SHORT} years`,
    'medium': `${HOLDING_PERIOD.SHORT}–${HOLDING_PERIOD.MEDIUM} years`,
    'long': `${HOLDING_PERIOD.MEDIUM}+ years`
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

/**
 * Apply rule profile to preference mode (with adjustments)
 */
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

