/**
 * HDB Data Module - Re-export from sub-modules
 * 
 * This file re-exports all types and functions from the modular structure
 * in lib/hdb-data/ for backward compatibility.
 * 
 * All implementations have been moved to:
 * - lib/hdb-data/types.ts - Type definitions
 * - lib/hdb-data/fetch.ts - Data fetching functions
 * - lib/hdb-data/calculations.ts - Calculation functions
 * - lib/hdb-data/town-profile.ts - Town profile generation
 * - lib/hdb-data/comparison.ts - Comparison summary generation
 * - lib/hdb-data/index.ts - Public API
 */

// Re-export types from new structure
export type {
  RawResaleTransaction,
  AggregatedMonthly,
  AffordabilityResult,
  BinnedLeaseData,
  LeaseRiskLevel,
  TownProfile,
  TownComparisonData,
  CompareSummary,
  PreferenceLens,
  TownTimeAccess,
  Centrality,
  MrtDensity,
  TransferComplexity,
  RegionalHubAccess,
  ThreeTownCompareSummary,
} from './hdb-data/types'

// Re-export fetch functions from new structure
export {
  getAggregatedMonthly,
  getTownAggregated,
  getLeasePriceData,
  getBinnedLeasePriceData,
  getMedianRent,
  findAffordableProperties,
  getTownTimeAccess,
} from './hdb-data/fetch'

// Re-export calculation functions from new structure
export {
  calculateAffordability,
  calculateMonthlyMortgage,
  computeLeaseRisk,
} from './hdb-data/calculations'

// Re-export town profile functions from new structure
export { getTownProfile } from './hdb-data/town-profile'

// Re-export comparison functions from new structure
export { generateCompareSummary, getTownComparisonData, generateThreeTownCompareSummary } from './hdb-data/comparison'

// Re-export helper functions
export { getTimeBurdenLevel } from './hdb-data/types'

// Re-exported above for backward compatibility
