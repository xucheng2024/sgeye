/**
 * Public API for HDB data module
 * Re-exports all types and functions from sub-modules
 */

// Types
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
} from './types'

export { getTimeBurdenLevel } from './types'

// Fetch functions
export {
  getAggregatedMonthly,
  getTownAggregated,
  getLeasePriceData,
  getBinnedLeasePriceData,
  getMedianRent,
  findAffordableProperties,
  getTownTimeAccess,
} from './fetch'

// Calculation functions
export {
  calculateAffordability,
  calculateMonthlyMortgage,
  computeLeaseRisk,
} from './calculations'

// Town profile functions
export { getTownProfile } from './town-profile'

// Comparison functions
export { generateCompareSummary, getTownComparisonData } from './comparison'

