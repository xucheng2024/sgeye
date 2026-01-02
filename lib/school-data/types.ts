/**
 * Type definitions for School Data module
 */

export interface PrimarySchool {
  id: number
  school_name: string
  address: string | null
  postal_code: string | null
  planning_area: string | null
  town: string | null
  latitude: number | null
  longitude: number | null
}

export interface PSLECutoff {
  id: number
  school_id: number
  year: number
  cutoff_range: string | null
  cutoff_min: number | null
  cutoff_max: number | null
}

export interface SchoolLandscape {
  town: string
  schoolCount: number
  cutoffDistribution: {
    low: number // <=230
    mid: number // 231-250
    high: number // >=251
  }
  highDemandSchools: number
}

export interface SchoolPressureIndex {
  town: string
  spi: number // 0-100
  level: 'low' | 'medium' | 'high'
  demandPressure: number // D: 0-100
  choiceConstraint: number // C: 0-100
  uncertainty: number // U: 0-100
  crowding: number // R: 0-100
  dominantFactor: 'demand' | 'choice' | 'uncertainty' | 'crowding'
  explanation: string
  whyExplanations?: string[] // Parent-friendly explanations
}


