/**
 * Public API for School Data module
 * Re-exports all types and functions from sub-modules
 */

// Types
export type {
  PrimarySchool,
  PSLECutoff,
  SchoolLandscape,
  SchoolPressureIndex,
} from './types'

// Fetch functions
export {
  calculateSchoolPressureIndex,
  getSchoolLandscape,
  getTownsWithSchools,
} from './fetch'

// Calculation functions (exported for testing or advanced use)
export {
  sigmoid,
  clamp,
  getCutoffBand,
  calculateDemandPressure,
  calculateChoiceConstraint,
  calculateUncertainty,
  calculateCrowding,
} from './calculations'





