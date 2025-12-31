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
  ThreeTownCompareSummary,
  TownTransportProfile,
} from './types'
export { calculateTBI, getTBILevel, getTBILevelLabel } from './types'
export { getTownTransportProfile, TOWN_TRANSPORT_PROFILES } from './transport-data'

export { getTimeBurdenLevel } from './types'

// Fetch functions
export {
  getAggregatedMonthly,
  getTownAggregated,
  getLeasePriceData,
  getBinnedLeasePriceData,
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
export { generateCompareSummary, getTownComparisonData, generateThreeTownCompareSummary } from './comparison'

