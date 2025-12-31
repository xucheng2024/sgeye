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
  NeighbourhoodProfile,
  NeighbourhoodComparisonData,
  CompareSummary,
  PreferenceLens,
  NeighbourhoodTimeAccess,
  Centrality,
  MrtDensity,
  TransferComplexity,
  RegionalHubAccess,
  ThreeNeighbourhoodCompareSummary,
  NeighbourhoodTransportProfile,
} from './types'
export { calculateTBI, getTBILevel, getTBILevelLabel } from './types'
export { getNeighbourhoodTransportProfile } from './transport-data'

export { getTimeBurdenLevel } from './types'

// Fetch functions
export {
  getAggregatedMonthly,
  getTownAggregated,
  getLeasePriceData,
  getBinnedLeasePriceData,
  findAffordableProperties,
  getNeighbourhoodTimeAccess,
  getNeighbourhoodIdFromTown,
} from './fetch'

// Calculation functions
export {
  calculateAffordability,
  calculateMonthlyMortgage,
  computeLeaseRisk,
} from './calculations'

// Neighbourhood profile functions
export { getNeighbourhoodProfile } from './neighbourhood-profile'

// Comparison functions
export { generateCompareSummary, getNeighbourhoodComparisonData, generateThreeNeighbourhoodCompareSummary } from './comparison'

