import { supabase } from './supabase'
import { getTownAggregated } from './hdb-data'

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

// Sigmoid function
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

// Clamp value between 0 and 100
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

// Get cutoff band from cutoff value or range
function getCutoffBand(cutoff: PSLECutoff): 'low' | 'mid' | 'high' {
  if (cutoff.cutoff_max !== null) {
    if (cutoff.cutoff_max <= 230) return 'low'
    if (cutoff.cutoff_max <= 250) return 'mid'
    return 'high'
  }
  if (cutoff.cutoff_min !== null) {
    if (cutoff.cutoff_min >= 251) return 'high'
    if (cutoff.cutoff_min >= 231) return 'mid'
    return 'low'
  }
  // Fallback to range string
  if (cutoff.cutoff_range) {
    if (cutoff.cutoff_range.includes('≤230') || cutoff.cutoff_range.includes('<=230')) return 'low'
    if (cutoff.cutoff_range.includes('≥251') || cutoff.cutoff_range.includes('>=251')) return 'high'
    if (cutoff.cutoff_range.includes('231') || cutoff.cutoff_range.includes('250')) return 'mid'
  }
  return 'mid' // default
}

// Calculate Demand Pressure D (0-100)
function calculateDemandPressure(schools: PrimarySchool[], cutoffs: PSLECutoff[]): number {
  if (schools.length === 0) return 50 // neutral if no data

  // Get recent cutoffs (last 3-5 years)
  const currentYear = new Date().getFullYear()
  const recentCutoffs = cutoffs.filter(c => c.year >= currentYear - 5)

  // Count high-demand schools
  let highCount = 0
  const schoolCutoffMap = new Map<number, PSLECutoff[]>()
  
  recentCutoffs.forEach(c => {
    if (!schoolCutoffMap.has(c.school_id)) {
      schoolCutoffMap.set(c.school_id, [])
    }
    schoolCutoffMap.get(c.school_id)!.push(c)
  })

  schools.forEach(school => {
    const schoolCutoffs = schoolCutoffMap.get(school.id) || []
    if (schoolCutoffs.length > 0) {
      // Use most recent cutoff
      const latest = schoolCutoffs.sort((a, b) => b.year - a.year)[0]
      if (getCutoffBand(latest) === 'high') {
        highCount++
      }
    }
  })

  const pHigh = highCount / schools.length

  // Logistic mapping: D = 100 * sigmoid((p_high - 0.25) / 0.08)
  const D = 100 * sigmoid((pHigh - 0.25) / 0.08)
  
  return clamp(D)
}

// Calculate Choice Constraint C (0-100)
function calculateChoiceConstraint(schoolCount: number): number {
  if (schoolCount === 0) return 100 // worst case

  // C = 100 * (1 - min(1, log(1+n) / log(1+12)))
  const C = 100 * (1 - Math.min(1, Math.log(1 + schoolCount) / Math.log(1 + 12)))
  
  return clamp(C)
}

// Calculate Uncertainty U (0-100)
function calculateUncertainty(schools: PrimarySchool[], cutoffs: PSLECutoff[]): number {
  if (schools.length === 0 || cutoffs.length === 0) return 50 // neutral

  const currentYear = new Date().getFullYear()
  const recentCutoffs = cutoffs.filter(c => c.year >= currentYear - 5)

  // Calculate std for each school's band variation
  const schoolStd: number[] = []

  schools.forEach(school => {
    const schoolCutoffs = recentCutoffs
      .filter(c => c.school_id === school.id)
      .sort((a, b) => a.year - b.year)

    if (schoolCutoffs.length >= 2) {
      // Convert bands to numeric: low=0, mid=0.5, high=1.0
      const values = schoolCutoffs.map(c => {
        const band = getCutoffBand(c)
        return band === 'low' ? 0 : band === 'mid' ? 0.5 : 1.0
      })

      // Calculate standard deviation
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const std = Math.sqrt(variance)
      schoolStd.push(std)
    }
  })

  if (schoolStd.length === 0) return 50

  // Average std across schools
  const avgStd = schoolStd.reduce((a, b) => a + b, 0) / schoolStd.length

  // U = clamp(avg_std / 0.25 * 100)
  const U = clamp((avgStd / 0.25) * 100)
  
  return U
}

// Calculate Crowding R (0-100) using HDB volume as proxy
async function calculateCrowding(town: string): Promise<number> {
  try {
    // Get last 12 months of HDB transaction volume for this town
    const allTownData = await getTownAggregated(12, '4 ROOM') // Use 4-room as proxy
    
    if (!allTownData || allTownData.length === 0) return 50 // neutral

    // Find this town's data
    const townData = allTownData.find(d => d.town === town)
    
    if (!townData) return 50 // neutral if no data for this town

    // For MVP: simple normalization (can enhance with percentile later)
    // Assume typical range: 0-5000 transactions per year
    // R = clamp((volume / 5000) * 100)
    const R = clamp((townData.txCount / 5000) * 100)
    
    return R
  } catch (error) {
    console.error('Error calculating crowding:', error)
    return 50 // neutral fallback
  }
}

// Calculate School Pressure Index for a town
export async function calculateSchoolPressureIndex(town: string): Promise<SchoolPressureIndex | null> {
  try {
    // Fetch schools in this town
    const { data: schools, error: schoolsError } = await supabase
      .from('primary_schools')
      .select('*')
      .eq('town', town)

    if (schoolsError) throw schoolsError
    if (!schools || schools.length === 0) {
      return null // No schools data
    }

    // Fetch cutoffs for these schools
    const schoolIds = schools.map(s => s.id)
    const { data: cutoffs, error: cutoffsError } = await supabase
      .from('psle_cutoff')
      .select('*')
      .in('school_id', schoolIds)

    if (cutoffsError) throw cutoffsError

    // Calculate sub-scores
    const D = calculateDemandPressure(schools, cutoffs || [])
    const C = calculateChoiceConstraint(schools.length)
    const U = calculateUncertainty(schools, cutoffs || [])
    const R = await calculateCrowding(town)

    // Calculate SPI: 0.40*D + 0.30*C + 0.20*U + 0.10*R
    const spi = 0.40 * D + 0.30 * C + 0.20 * U + 0.10 * R

    // Determine level
    let level: 'low' | 'medium' | 'high'
    if (spi <= 33) level = 'low'
    else if (spi <= 66) level = 'medium'
    else level = 'high'

    // Find dominant factor
    const factors = [
      { name: 'demand' as const, value: D },
      { name: 'choice' as const, value: C },
      { name: 'uncertainty' as const, value: U },
      { name: 'crowding' as const, value: R }
    ]
    const dominant = factors.reduce((max, f) => f.value > max.value ? f : max)

    // Generate explanation (matched to SPI level)
    let explanation = ''
    if (spi < 25) {
      // Low pressure - emphasize positive aspects
      switch (dominant.name) {
        case 'demand':
          explanation = 'A wide range of lower-demand schools keeps competition manageable.'
          break
        case 'choice':
          explanation = 'Multiple school options provide flexibility and reduce pressure.'
          break
        case 'uncertainty':
          explanation = 'Stable cut-off patterns make outcomes more predictable.'
          break
        case 'crowding':
          explanation = 'Lower local demand keeps competition manageable.'
          break
      }
    } else if (spi > 50) {
      // High pressure - emphasize challenges
      switch (dominant.name) {
        case 'demand':
          explanation = 'Competition is concentrated in a few high-demand schools.'
          break
        case 'choice':
          explanation = 'Fewer nearby schools means fewer alternatives; distance bands matter more.'
          break
        case 'uncertainty':
          explanation = 'Cut-off levels fluctuate more here, making outcomes less predictable.'
          break
        case 'crowding':
          explanation = 'Higher demand indicators suggest tighter competition for popular schools.'
          break
      }
    } else {
      // Medium pressure - balanced
      switch (dominant.name) {
        case 'demand':
          explanation = 'Moderate mix of school demand levels, with some competition for popular schools.'
          break
        case 'choice':
          explanation = 'Adequate school options, but distance bands still matter.'
          break
        case 'uncertainty':
          explanation = 'Cut-off patterns show moderate variability year to year.'
          break
        case 'crowding':
          explanation = 'Moderate local demand suggests balanced competition levels.'
          break
      }
    }

    // Generate parent-friendly "Why" explanations
    const whyExplanations: string[] = []
    
    // Demand pressure explanation
    if (D < 30) {
      whyExplanations.push('Few high-demand schools → less concentrated competition')
    } else if (D > 70) {
      whyExplanations.push('Many high-demand schools → more concentrated competition')
    } else {
      whyExplanations.push('Moderate mix of school demand levels')
    }
    
    // Choice constraint explanation
    if (C < 30) {
      whyExplanations.push('Multiple school options → wider safety net')
    } else if (C > 70) {
      whyExplanations.push('Fewer school options → distance bands matter more')
    } else {
      whyExplanations.push('Moderate number of school choices available')
    }
    
    // Uncertainty explanation
    if (U < 30) {
      whyExplanations.push('Stable cut-off patterns → outcomes more predictable')
    } else if (U > 70) {
      whyExplanations.push('Fluctuating cut-off patterns → outcomes less predictable')
    } else {
      whyExplanations.push('Moderate cut-off stability')
    }
    
    // Crowding explanation (optional, only if significant)
    if (R > 70) {
      whyExplanations.push('Higher local demand → tighter competition for popular schools')
    }

    return {
      town,
      spi: Math.round(spi * 10) / 10, // Round to 1 decimal
      level,
      demandPressure: Math.round(D * 10) / 10,
      choiceConstraint: Math.round(C * 10) / 10,
      uncertainty: Math.round(U * 10) / 10,
      crowding: Math.round(R * 10) / 10,
      dominantFactor: dominant.name,
      explanation,
      whyExplanations
    }
  } catch (error) {
    console.error('Error calculating School Pressure Index:', error)
    return null
  }
}

// Get school landscape for a town
export async function getSchoolLandscape(town: string): Promise<SchoolLandscape | null> {
  try {
    const { data: schools, error: schoolsError } = await supabase
      .from('primary_schools')
      .select('*')
      .eq('town', town)

    if (schoolsError) throw schoolsError
    if (!schools || schools.length === 0) return null

    const schoolIds = schools.map(s => s.id)
    const { data: cutoffs, error: cutoffsError } = await supabase
      .from('psle_cutoff')
      .select('*')
      .in('school_id', schoolIds)

    if (cutoffsError) throw cutoffsError

    const currentYear = new Date().getFullYear()
    const recentCutoffs = (cutoffs || []).filter(c => c.year >= currentYear - 3)

    const distribution = { low: 0, mid: 0, high: 0 }
    let highDemandCount = 0

    schools.forEach(school => {
      const schoolCutoffs = recentCutoffs.filter(c => c.school_id === school.id)
      if (schoolCutoffs.length > 0) {
        const latest = schoolCutoffs.sort((a, b) => b.year - a.year)[0]
        const band = getCutoffBand(latest)
        distribution[band]++
        if (band === 'high') highDemandCount++
      }
    })

    return {
      town,
      schoolCount: schools.length,
      cutoffDistribution: distribution,
      highDemandSchools: highDemandCount
    }
  } catch (error) {
    console.error('Error getting school landscape:', error)
    return null
  }
}

// Get all towns with schools
export async function getTownsWithSchools(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('primary_schools')
      .select('town')
      .not('town', 'is', null)

    if (error) throw error

    const uniqueTowns = [...new Set((data || []).map(s => s.town).filter(Boolean))]
    return uniqueTowns.sort()
  } catch (error) {
    console.error('Error getting towns with schools:', error)
    return []
  }
}

