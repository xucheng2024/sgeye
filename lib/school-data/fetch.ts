/**
 * Data fetching functions for School Data module
 */

import { supabase } from '../supabase'
import { SPI_CONSTANTS } from '../constants'
import { normalizeTownName } from '../utils/town-normalizer'
import {
  calculateDemandPressure,
  calculateChoiceConstraint,
  calculateUncertainty,
  calculateCrowding,
  getCutoffBand,
} from './calculations'
import { PrimarySchool, PSLECutoff, SchoolLandscape, SchoolPressureIndex } from './types'

// SPI level thresholds
const SPI_LEVEL_LOW = SPI_CONSTANTS.LEVELS.LOW
const SPI_LEVEL_MEDIUM = SPI_CONSTANTS.LEVELS.MEDIUM

/**
 * Generate explanation text based on SPI level and dominant factor
 */
function generateExplanation(spi: number, dominant: { name: string; value: number }): string {
  if (spi < 25) {
    // Low pressure - emphasize positive aspects
    switch (dominant.name) {
      case 'demand':
        return 'A wide range of lower-demand schools keeps competition manageable.'
      case 'choice':
        return 'Multiple school options provide flexibility and reduce pressure.'
      case 'uncertainty':
        return 'Stable cut-off patterns make outcomes more predictable.'
      case 'crowding':
        return 'Lower local demand keeps competition manageable.'
      default:
        return 'Lower competition levels provide more flexibility.'
    }
  } else if (spi > 50) {
    // High pressure - emphasize challenges
    switch (dominant.name) {
      case 'demand':
        return 'Competition is concentrated in a few high-demand schools.'
      case 'choice':
        return 'Fewer nearby schools means fewer alternatives; distance bands matter more.'
      case 'uncertainty':
        return 'Cut-off levels fluctuate more here, making outcomes less predictable.'
      case 'crowding':
        return 'Higher demand indicators suggest tighter competition for popular schools.'
      default:
        return 'Higher competition levels require more strategic planning.'
    }
  } else {
    // Medium pressure - balanced
    switch (dominant.name) {
      case 'demand':
        return 'Moderate mix of school demand levels, with some competition for popular schools.'
      case 'choice':
        return 'Adequate school options, but distance bands still matter.'
      case 'uncertainty':
        return 'Cut-off patterns show moderate variability year to year.'
      case 'crowding':
        return 'Moderate local demand suggests balanced competition levels.'
      default:
        return 'Moderate competition levels with balanced factors.'
    }
  }
}

/**
 * Generate parent-friendly "Why" explanations
 */
function generateWhyExplanations(
  D: number,
  C: number,
  U: number,
  R: number
): string[] {
  const whyExplanations: string[] = []
  const LOW_THRESHOLD = 30
  const HIGH_THRESHOLD = 70
  
  // Demand pressure explanation
  if (D < LOW_THRESHOLD) {
    whyExplanations.push('Few high-demand schools → less concentrated competition')
  } else if (D > HIGH_THRESHOLD) {
    whyExplanations.push('Many high-demand schools → more concentrated competition')
  } else {
    whyExplanations.push('Moderate mix of school demand levels')
  }
  
  // Choice constraint explanation
  if (C < LOW_THRESHOLD) {
    whyExplanations.push('Multiple school options → wider safety net')
  } else if (C > HIGH_THRESHOLD) {
    whyExplanations.push('Fewer school options → distance bands matter more')
  } else {
    whyExplanations.push('Moderate number of school choices available')
  }
  
  // Uncertainty explanation
  if (U < LOW_THRESHOLD) {
    whyExplanations.push('Stable cut-off patterns → outcomes more predictable')
  } else if (U > HIGH_THRESHOLD) {
    whyExplanations.push('Fluctuating cut-off patterns → outcomes less predictable')
  } else {
    whyExplanations.push('Moderate cut-off stability')
  }
  
  // Crowding explanation (optional, only if significant)
  if (R > HIGH_THRESHOLD) {
    whyExplanations.push('Higher local demand → tighter competition for popular schools')
  }

  return whyExplanations
}

/**
 * Fetch schools for a town with fallback strategies
 */
async function fetchSchoolsForTown(town: string): Promise<PrimarySchool[] | null> {
  if (!supabase) return null
  
  const cleanTown = normalizeTownName(town)
  
  // Try exact match first (without quotes)
  let result = await supabase
    .from('primary_schools')
    .select('*')
    .eq('town', cleanTown)
  
  if (result.data && result.data.length > 0 && !result.error) {
    return result.data as PrimarySchool[]
  }
  
  // Try with quotes (in case data was imported with quotes)
  result = await supabase
    .from('primary_schools')
    .select('*')
    .eq('town', `"${cleanTown}"`)
  
  if (result.data && result.data.length > 0 && !result.error) {
    return result.data as PrimarySchool[]
  }
  
  if (result.error) {
    console.error(`Error fetching schools for ${town}:`, result.error)
    throw result.error
  }
  
  // Try case-insensitive search as fallback
  let { data: schoolsCI, error: ciError } = await supabase
    .from('primary_schools')
    .select('*')
    .ilike('town', cleanTown)
  
  if (!ciError && schoolsCI && schoolsCI.length > 0) {
    return schoolsCI as PrimarySchool[]
  }
  
  // Try with quotes (case-insensitive)
  const { data: schoolsCIQuotes, error: ciQuotesError } = await supabase
    .from('primary_schools')
    .select('*')
    .ilike('town', `"${cleanTown}"`)
  
  if (!ciQuotesError && schoolsCIQuotes && schoolsCIQuotes.length > 0) {
    return schoolsCIQuotes as PrimarySchool[]
  }
  
  if (ciQuotesError || ciError) {
    console.error(`Error in case-insensitive search for ${town}:`, ciQuotesError || ciError)
  }
  
  return null
}

/**
 * Calculate School Pressure Index for a town
 */
export async function calculateSchoolPressureIndex(town: string): Promise<SchoolPressureIndex | null> {
  try {
    if (!supabase) return null
    
    const schools = await fetchSchoolsForTown(town)
    
    if (!schools || schools.length === 0) {
      console.warn(`No schools found for town: ${town}. Checking all towns in database...`)
      
      // Debug: Check what towns are actually in the database
      const { data: allTowns, error: allTownsError } = await supabase
        .from('primary_schools')
        .select('town')
        .not('town', 'is', null)
      
      if (!allTownsError && allTowns) {
        const uniqueTowns = [...new Set(allTowns.map(s => s.town))].sort()
        console.log(`Available towns in database:`, uniqueTowns)
        console.log(`Looking for: "${town}"`)
        const match = uniqueTowns.find(t => t.toLowerCase() === town.toLowerCase())
        if (match) {
          console.log(`Found case-insensitive match: "${match}"`)
        }
      }
      
      return null // No schools data
    }

    console.log(`Query result for ${town}:`, { 
      schoolsCount: schools.length, 
      sampleSchool: schools[0]?.school_name 
    })

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

    // Calculate SPI using weights from constants
    const spi = 
      SPI_CONSTANTS.WEIGHTS.DEMAND_PRESSURE * D +
      SPI_CONSTANTS.WEIGHTS.CHOICE_CONSTRAINT * C +
      SPI_CONSTANTS.WEIGHTS.UNCERTAINTY * U +
      SPI_CONSTANTS.WEIGHTS.CROWDING * R

    // Determine level
    let level: 'low' | 'medium' | 'high'
    if (spi <= SPI_LEVEL_LOW) level = 'low'
    else if (spi <= SPI_LEVEL_MEDIUM) level = 'medium'
    else level = 'high'

    // Find dominant factor
    const factors = [
      { name: 'demand' as const, value: D },
      { name: 'choice' as const, value: C },
      { name: 'uncertainty' as const, value: U },
      { name: 'crowding' as const, value: R }
    ]
    const dominant = factors.reduce((max, f) => f.value > max.value ? f : max)

    // Generate explanation
    const explanation = generateExplanation(spi, dominant)
    const whyExplanations = generateWhyExplanations(D, C, U, R)

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

/**
 * Get school landscape for a town
 */
export async function getSchoolLandscape(town: string): Promise<SchoolLandscape | null> {
  try {
    if (!supabase) return null
    
    const cleanTown = normalizeTownName(town)
    
    // Try exact match first (without quotes)
    let { data: schools, error: schoolsError } = await supabase
      .from('primary_schools')
      .select('*')
      .eq('town', cleanTown)
    
    // If no results, try with quotes (in case data was imported with quotes)
    if ((!schools || schools.length === 0) && !schoolsError) {
      const { data: schoolsWithQuotes, error: quotesError } = await supabase
        .from('primary_schools')
        .select('*')
        .eq('town', `"${cleanTown}"`)
      
      if (!quotesError && schoolsWithQuotes && schoolsWithQuotes.length > 0) {
        schools = schoolsWithQuotes
        schoolsError = null
      }
    }

    if (schoolsError) throw schoolsError
    if (!schools || schools.length === 0) return null

    const schoolIds = schools.map(s => s.id)
    const { data: cutoffs, error: cutoffsError } = await supabase
      .from('psle_cutoff')
      .select('*')
      .in('school_id', schoolIds)

    if (cutoffsError) throw cutoffsError

    const currentYear = new Date().getFullYear()
    const recentCutoffs = (cutoffs || []).filter(c => c.year >= currentYear - 3) // Use 3 years for landscape

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

/**
 * Get all towns with schools
 */
export async function getTownsWithSchools(): Promise<string[]> {
  try {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('primary_schools')
      .select('town')
      .not('town', 'is', null)

    if (error) throw error

    // Normalize town names by removing quotes
    const uniqueTowns = [...new Set((data || [])
      .map(s => s.town)
      .filter(Boolean)
      .map(town => town.replace(/^["']|["']$/g, '').trim()))]
    return uniqueTowns.sort()
  } catch (error) {
    console.error('Error getting towns with schools:', error)
    return []
  }
}


