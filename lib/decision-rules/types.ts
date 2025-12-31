/**
 * Type definitions for Decision Rules module
 */

// ============================================
// Family Profile Types
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
        threshold?: number
      }>
    }
    lease: {
      thresholds: Array<{
        condition: string
        text: string
        threshold?: number
      }>
    }
    school: {
      thresholds: Array<{
        condition: string
        text: string
        threshold?: number
      }>
    }
  }
  decisionHint: {
    conditions: Array<{
      condition: string
      text: string
      threshold?: number
    }>
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

