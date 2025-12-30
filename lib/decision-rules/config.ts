/**
 * Configuration constants for Decision Rules module
 */

import {
  COMPARISON_THRESHOLDS,
  LEASE_THRESHOLDS,
  PREFERENCE_WEIGHTS,
} from '../constants'
import { PreferenceMode, SummaryTextRules, SuitabilityRule } from './types'

// ============================================
// Preference Mode Definitions
// ============================================

export const PREFERENCE_MODES: Record<string, PreferenceMode> = {
  balanced: {
    id: 'balanced',
    weights: PREFERENCE_WEIGHTS.BALANCED,
    description: 'Weighted across affordability, lease safety, school pressure, and cash flow.'
  },
  
  low_entry: {
    id: 'low_entry',
    weights: PREFERENCE_WEIGHTS.LOW_ENTRY,
    description: 'Prioritises lower upfront cost and monthly cash flow.',
    hardRules: [
      {
        condition: 'price_diff > 20000',
        effect: 'override',
        threshold: COMPARISON_THRESHOLDS.PRICE_MODERATE
      }
    ]
  },
  
  long_term: {
    id: 'long_term',
    weights: PREFERENCE_WEIGHTS.LONG_TERM,
    description: 'Optimised for long holding periods and future resale.',
    hardRules: [
      {
        condition: 'lease < 60',
        effect: 'warning',
        threshold: LEASE_THRESHOLDS.HIGH
      }
    ]
  },
  
  low_school_pressure: {
    id: 'low_school_pressure',
    weights: PREFERENCE_WEIGHTS.LOW_SCHOOL_PRESSURE,
    description: 'Prioritises lower primary school competition and flexibility.',
    schoolRules: [
      {
        condition: 'delta_spi >= 10',
        impact: 'significant',
        threshold: 10 // Keep 10 for school-specific rule (different from general SPI_MODERATE)
      },
      {
        condition: 'spi_level == Low',
        impact: 'muted'
      }
    ]
  }
}

// ============================================
// Summary Text Generation Rules
// ============================================

export const SUMMARY_TEXT_RULES: SummaryTextRules = {
  headline: {
    template: 'Choose {town} based on {preference}.',
    conditions: [
      {
        condition: 'preference == balanced && overall_diff > 12',
        template: 'Choose {town} based on balanced factors.'
      },
      {
        condition: 'preference == balanced && overall_diff <= 12',
        template: 'Both towns are viable — {town} has a slight edge.'
      },
      {
        condition: 'preference == low_entry',
        template: 'Choose {town} if you prioritise lower entry price.'
      },
      {
        condition: 'preference == long_term',
        template: 'Choose {town} if you prioritise long-term lease safety.'
      },
      {
        condition: 'preference == low_school_pressure',
        template: 'Choose {town} if you prioritise lower primary school pressure.'
      }
    ]
  },
  
  tradeoffs: {
    price: {
      thresholds: [
      {
        condition: 'abs(delta_price) >= 30000',
        text: '{cheaper} is cheaper by ~{diff}',
        threshold: COMPARISON_THRESHOLDS.PRICE_SIGNIFICANT
      },
      {
        condition: 'abs(delta_price) >= 20000',
        text: '{cheaper} is cheaper by ~{diff}',
        threshold: COMPARISON_THRESHOLDS.PRICE_MODERATE
      }
      ]
    },
    lease: {
      thresholds: [
        {
          condition: 'abs(delta_lease_years) >= 20',
          text: '{healthier} has significantly healthier lease profile (+{diff} yrs)'
        },
        {
          condition: 'abs(delta_lease_years) > 0',
          text: '{healthier} has healthier lease profile (+{diff} yrs)'
        },
        {
          condition: 'abs(delta_lease_years) < 0',
          text: '{shorter} has shorter remaining leases'
        }
      ]
    },
    school: {
      thresholds: [
      {
        condition: 'abs(delta_spi) >= 8 && spi_level_change',
        text: 'Moving to {town} {direction} SPI significantly ({level})',
        threshold: COMPARISON_THRESHOLDS.SPI_MODERATE
      },
      {
        condition: 'abs(delta_spi) >= 3',
        text: 'Moving to {town} {direction} SPI slightly ({level})',
        threshold: COMPARISON_THRESHOLDS.SPI_MINOR
      },
        {
          condition: 'abs(delta_spi) < 3',
          text: 'School pressure remains similar'
        }
      ]
    }
  },
  
  decisionHint: {
    conditions: [
      {
        condition: 'preference == long_term',
        text: 'If you plan to hold long-term (15+ years), lease profile matters more than upfront price.'
      },
      {
        condition: 'preference == low_entry && delta_price > 30000',
        text: 'If upfront cost is your primary concern, the price difference may outweigh other factors.',
        threshold: COMPARISON_THRESHOLDS.PRICE_SIGNIFICANT
      },
      {
        condition: 'preference == low_school_pressure && abs(delta_spi) >= 8',
        text: 'If primary school pressure is your priority, the SPI difference should be your main consideration.',
        threshold: COMPARISON_THRESHOLDS.SPI_MODERATE
      },
      {
        condition: 'default',
        text: 'Consider your holding period and priorities when making this decision.'
      }
    ]
  }
}

// ============================================
// Best Suited For / Be Cautious If Rules
// ============================================

export const SUITABILITY_RULES: SuitabilityRule[] = [
  {
    type: 'best_suited',
    conditions: [
      {
        metric: 'lease',
        operator: '>=',
        value: LEASE_THRESHOLDS.MODERATE,
        text: 'Long-term owners valuing lease security'
      },
      {
        metric: 'rent_gap',
        operator: '>',
        value: 0,
        text: 'Buyers seeking monthly cash flow advantage'
      },
      {
        metric: 'spi_level',
        operator: '==',
        value: 'Low',
        text: 'Families prioritising lower primary school pressure'
      }
    ]
  },
  {
    type: 'be_cautious',
    conditions: [
      {
        metric: 'lease',
        operator: '<',
        value: LEASE_THRESHOLDS.HIGH,
        text: `High lease risk — may face financing constraints (below ${LEASE_THRESHOLDS.HIGH} years)`
      },
      {
        metric: 'pct_tx_below_55',
        operator: '>',
        value: LEASE_THRESHOLDS.PCT_BELOW_55_HIGH * 100, // Convert to percentage
        text: `Significant portion of flats below ${LEASE_THRESHOLDS.CRITICAL} years remaining`
      }
    ]
  }
]

