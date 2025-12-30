/**
 * Decision Rules Module - Re-export from sub-modules
 *
 * This file re-exports all types and functions from the modular structure
 * in lib/decision-rules/ for backward compatibility.
 *
 * All implementations have been moved to:
 * - lib/decision-rules/types.ts - Type definitions
 * - lib/decision-rules/config.ts - Configuration constants
 * - lib/decision-rules/functions.ts - Helper functions
 * - lib/decision-rules/index.ts - Public API
 */

// Re-export types from new structure
export type {
  FamilyStage,
  HoldingYears,
  CostVsValue,
  SchoolSensitivity,
  FamilyProfile,
  RuleProfile,
  ComparisonMetrics,
  PreferenceMode,
  HardRule,
  SchoolRule,
  SummaryTextRules,
  SuitabilityRule,
} from './decision-rules/types'

// Re-export configuration from new structure
export {
  PREFERENCE_MODES,
  SUMMARY_TEXT_RULES,
  SUITABILITY_RULES,
} from './decision-rules/config'

// Re-export functions from new structure
export {
  getPreferenceMode,
  calculateWeightedScore,
  checkHardRules,
  evaluateSchoolRules,
  mapFamilyProfileToRuleProfile,
  applyRuleProfile,
} from './decision-rules/functions'
