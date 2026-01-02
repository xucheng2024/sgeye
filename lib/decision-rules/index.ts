/**
 * Public API for Decision Rules module
 * Re-exports all types and functions from sub-modules
 */

// Types
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
} from './types'

// Configuration
export {
  PREFERENCE_MODES,
  SUMMARY_TEXT_RULES,
  SUITABILITY_RULES,
} from './config'

// Functions
export {
  getPreferenceMode,
  calculateWeightedScore,
  checkHardRules,
  evaluateSchoolRules,
  mapFamilyProfileToRuleProfile,
  applyRuleProfile,
} from './functions'


