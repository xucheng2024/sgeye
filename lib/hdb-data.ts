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
 * - lib/hdb-data/neighbourhood-profile.ts - Neighbourhood profile generation
 * - lib/hdb-data/comparison.ts - Comparison summary generation
 * - lib/hdb-data/index.ts - Public API
 */

// Re-export types from new structure
export type {
  RawResaleTransaction,
  AggregatedMonthly,
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
} from './hdb-data/types'

// Re-export fetch functions from new structure
export {
  getAggregatedMonthly,
  getTownAggregated,
  getNeighbourhoodAggregated,
  getLeasePriceData,
  getBinnedLeasePriceData,
  findAffordableProperties,
  getNeighbourhoodTimeAccess,
  getNeighbourhoodIdFromTown,
  getNeighbourhoodIdFromPlanningArea,
} from './hdb-data/fetch'

// Re-export calculation functions from new structure
export {
  calculateMonthlyMortgage,
  computeLeaseRisk,
} from './hdb-data/calculations'

// Re-export neighbourhood profile functions from new structure
export { getNeighbourhoodProfile } from './hdb-data/neighbourhood-profile'

// Re-export comparison functions from new structure
export { generateCompareSummary, getNeighbourhoodComparisonData, generateThreeNeighbourhoodCompareSummary } from './hdb-data/comparison'

// Re-export helper functions
export { getTimeBurdenLevel, calculateTBI, getTBILevel, getTBILevelLabel } from './hdb-data/types'

// Re-export transport functions
export { getNeighbourhoodTransportProfile } from './hdb-data/transport-data'

// Re-exported above for backward compatibility
