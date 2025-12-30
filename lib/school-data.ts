/**
 * School Data Module - Re-export from sub-modules
 *
 * This file re-exports all types and functions from the modular structure
 * in lib/school-data/ for backward compatibility.
 *
 * All implementations have been moved to:
 * - lib/school-data/types.ts - Type definitions
 * - lib/school-data/calculations.ts - SPI calculation functions
 * - lib/school-data/fetch.ts - Data fetching functions
 * - lib/school-data/index.ts - Public API
 */

// Re-export types from new structure
export type {
  PrimarySchool,
  PSLECutoff,
  SchoolLandscape,
  SchoolPressureIndex,
} from './school-data/types'

// Re-export fetch functions from new structure
export {
  calculateSchoolPressureIndex,
  getSchoolLandscape,
  getTownsWithSchools,
} from './school-data/fetch'

// Re-export calculation functions from new structure (for advanced use)
export {
  sigmoid,
  clamp,
  getCutoffBand,
  calculateDemandPressure,
  calculateChoiceConstraint,
  calculateUncertainty,
  calculateCrowding,
} from './school-data/calculations'
