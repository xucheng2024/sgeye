/**
 * Application-wide constants and thresholds
 * Centralized configuration for business rules and calculations
 */

// ============================================
// Comparison Thresholds
// ============================================
export const COMPARISON_THRESHOLDS = {
  /** SPI difference considered significant (points) */
  SPI_SIGNIFICANT: 15,
  /** SPI difference for moderate impact (points) */
  SPI_MODERATE: 8,
  /** SPI difference for minor impact (points) */
  SPI_MINOR: 3,
  /** Price difference considered significant (S$) */
  PRICE_SIGNIFICANT: 30000,
  /** Price difference for moderate impact (S$) */
  PRICE_MODERATE: 20000,
  /** Lease years difference considered significant */
  LEASE_SIGNIFICANT: 15,
  /** School count difference considered significant */
  SCHOOL_COUNT_SIGNIFICANT: 4,
  /** High-demand schools difference considered significant */
  HIGH_DEMAND_SCHOOLS_SIGNIFICANT: 2,
} as const

// ============================================
// Lease Risk Thresholds
// ============================================
export const LEASE_THRESHOLDS = {
  /** Critical lease risk threshold (years) */
  CRITICAL: 55,
  /** High lease risk threshold (years) */
  HIGH: 60,
  /** Moderate lease risk threshold (years) */
  MODERATE: 70,
  /** Percentage of transactions below 55 years for high risk */
  PCT_BELOW_55_HIGH: 0.3,
  /** Percentage of transactions below 55 years for moderate risk */
  PCT_BELOW_55_MODERATE: 0.15,
  /** Percentage of transactions below 60 years for warning */
  PCT_BELOW_60_WARNING: 0.5,
} as const

// ============================================
// Market Stability Thresholds
// ============================================
export const MARKET_THRESHOLDS = {
  /** Island-wide average price volatility (coefficient of variation) */
  ISLAND_AVG_VOLATILITY: 0.12,
  /** Island-wide average transaction volume */
  ISLAND_AVG_VOLUME: 100,
  /** Low volume threshold for liquidity risk */
  LOW_VOLUME_THRESHOLD: 50,
} as const

// ============================================
// Financial Calculation Constants
// ============================================
export const FINANCIAL_CONSTANTS = {
  /** Mortgage Servicing Ratio limit (%) */
  MSR_LIMIT: 0.30,
  /** Total Debt Servicing Ratio limit (%) */
  TDSR_LIMIT: 0.55,
  /** Loan-to-Value ratio for resale flats (%) */
  LTV_RESALE: 0.75,
  /** Default interest rate (%) */
  DEFAULT_INTEREST_RATE: 2.6,
  /** Default loan term (years) */
  DEFAULT_LOAN_YEARS: 25,
} as const

// ============================================
// School Pressure Index (SPI) Constants
// ============================================
export const SPI_CONSTANTS = {
  /** SPI level thresholds */
  LEVELS: {
    LOW: 33,
    MEDIUM: 66,
  },
  /** SPI component weights */
  WEIGHTS: {
    DEMAND_PRESSURE: 0.40,
    CHOICE_CONSTRAINT: 0.30,
    UNCERTAINTY: 0.20,
    CROWDING: 0.10,
  },
  /** Demand pressure calculation parameters */
  DEMAND: {
    HIGH_DEMAND_THRESHOLD: 0.25,
    SIGMOID_SCALE: 0.08,
  },
  /** Choice constraint calculation parameters */
  CHOICE: {
    REFERENCE_SCHOOL_COUNT: 12,
  },
  /** Uncertainty calculation parameters */
  UNCERTAINTY: {
    STD_SCALE: 0.25,
    MIN_CUTOFF_YEARS: 2,
  },
  /** Crowding calculation parameters */
  CROWDING: {
    MAX_VOLUME: 5000,
  },
  /** Recent cutoff years to consider */
  RECENT_CUTOFF_YEARS: 5,
} as const

// ============================================
// Scoring Constants
// ============================================
export const SCORING_CONSTANTS = {
  /** Score range */
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  DEFAULT_SCORE: 50,
  /** Overall score thresholds for confidence levels */
  CONFIDENCE: {
    CLEAR_WINNER: 12,
    BALANCED: 5,
  },
  /** Maximum trade-off bullets to show */
  MAX_TRADEOFF_BULLETS: 3,
} as const

// ============================================
// Data Fetching Constants
// ============================================
export const DATA_FETCHING = {
  /** Default pagination page size */
  PAGE_SIZE: 1000,
  /** Default limit for lease price data */
  DEFAULT_LEASE_LIMIT: 10000,
  /** Default months for aggregation */
  DEFAULT_MONTHS: 24,
} as const

// ============================================
// Lease Binning Constants
// ============================================
export const LEASE_BINS = [
  { start: 0, end: 40, label: '0-40' },
  { start: 40, end: 50, label: '40-50' },
  { start: 50, end: 60, label: '50-60' },
  { start: 60, end: 70, label: '60-70' },
  { start: 70, end: 80, label: '70-80' },
  { start: 80, end: 99, label: '80-99' },
] as const

// ============================================
// Preference Mode Weights
// ============================================
export const PREFERENCE_WEIGHTS = {
  BALANCED: {
    price: 0.30,
    lease: 0.35,
    school: 0.30,
    stability: 0.05,
  },
  LOW_ENTRY: {
    price: 0.60,
    lease: 0.20,
    school: 0.15,
    stability: 0.05,
  },
  LONG_TERM: {
    price: 0.15,
    lease: 0.55,
    school: 0.20,
    stability: 0.10,
  },
  LOW_SCHOOL_PRESSURE: {
    price: 0.20,
    lease: 0.20,
    school: 0.55,
    stability: 0.05,
  },
}

// Long-term risk definition (reusable across the site)
export const LONG_TERM_RISK_DEFINITION = 'Long-term risk refers to how remaining lease length affects resale value, financing options, and price sustainability over time.' as const

// ============================================
// Family Profile Adjustment Constants
// ============================================
export const FAMILY_PROFILE_ADJUSTMENTS = {
  /** Maximum total adjustment allowed */
  MAX_TOTAL_ADJUSTMENT: 0.3,
  /** School weight adjustments by stage */
  SCHOOL: {
    NO_CHILDREN: -0.10,
    PRIMARY_FAMILY: 0.15,
    PLANNING_PRIMARY: 0.15,
  },
  /** Lease weight adjustments by holding period */
  LEASE: {
    SHORT: -0.10,
    LONG: 0.10,
  },
  /** School sensitivity adjustments */
  SENSITIVITY: {
    HIGH: 0.20,
    LOW: -0.10,
  },
} as const

// ============================================
// Holding Period Thresholds
// ============================================
export const HOLDING_PERIOD = {
  SHORT: 5,
  MEDIUM: 15,
} as const

