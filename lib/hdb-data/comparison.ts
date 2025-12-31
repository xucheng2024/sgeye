/**
 * Comparison summary generation functions
 */

import { formatCurrency } from '../utils'
import {
  ComparisonMetrics,
  getPreferenceMode,
  checkHardRules,
  evaluateSchoolRules,
  SUMMARY_TEXT_RULES,
  FamilyProfile,
  RuleProfile,
  mapFamilyProfileToRuleProfile,
  applyRuleProfile,
} from '../decision-rules'
import {
  COMPARISON_THRESHOLDS,
  LEASE_THRESHOLDS,
  SCORING_CONSTANTS,
} from '../constants'
import { getAggregatedMonthly, getNeighbourhoodTimeAccess } from './fetch'
import { getNeighbourhoodTransportProfile } from './transport-data'
import { supabase } from '../supabase'
import type { NeighbourhoodProfile, NeighbourhoodComparisonData, CompareSummary, PreferenceLens, NeighbourhoodTimeAccess, ThreeNeighbourhoodCompareSummary } from './types'
import { getTimeBurdenLevel, calculateTBI, getTBILevel } from './types'

// Generate standardized scores (0-100) for each dimension
function generateStandardizedScores(
  A: NeighbourhoodProfile,
  B: NeighbourhoodProfile,
  spiA: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiB: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  landscapeA: { schoolCount: number; highDemandSchools: number } | null,
  landscapeB: { schoolCount: number; highDemandSchools: number } | null
): CompareSummary['scores'] {
  // Normalize to 0-100 scale (relative to A vs B comparison)
  const minPrice = Math.min(A.medianResalePrice, B.medianResalePrice)
  const maxPrice = Math.max(A.medianResalePrice, B.medianResalePrice)
  const priceRange = maxPrice - minPrice || 1
  
  // Entry cost: lower is better, so invert (lower price = higher score)
  const entryCostA = priceRange > 0 ? 100 - ((A.medianResalePrice - minPrice) / priceRange * 100) : 50
  const entryCostB = priceRange > 0 ? 100 - ((B.medianResalePrice - minPrice) / priceRange * 100) : 50
  
  // Lease safety: higher remaining lease is better
  const minLease = Math.min(A.medianRemainingLease, B.medianRemainingLease)
  const maxLease = Math.max(A.medianRemainingLease, B.medianRemainingLease)
  const leaseRange = maxLease - minLease || 1
  const leaseSafetyA = leaseRange > 0 ? ((A.medianRemainingLease - minLease) / leaseRange * 100) : 50
  const leaseSafetyB = leaseRange > 0 ? ((B.medianRemainingLease - minLease) / leaseRange * 100) : 50
  
  // School pressure: lower SPI is better, so invert
  const spiAValue = spiA?.spi ?? 50
  const spiBValue = spiB?.spi ?? 50
  const minSPI = Math.min(spiAValue, spiBValue)
  const maxSPI = Math.max(spiAValue, spiBValue)
  const spiRange = maxSPI - minSPI || 1
  const schoolPressureA = spiRange > 0 ? 100 - ((spiAValue - minSPI) / spiRange * 100) : 50
  const schoolPressureB = spiRange > 0 ? 100 - ((spiBValue - minSPI) / spiRange * 100) : 50
  
  // Stability: lower volatility and higher volume is better
  const maxVolatility = Math.max(A.volatility12m, B.volatility12m, 0.01)
  const maxVolume = Math.max(A.volumeRecent, B.volumeRecent, 1)
  const stabilityA = (1 - Math.min(1, A.volatility12m / maxVolatility)) * 50 + (A.volumeRecent / maxVolume) * 50
  const stabilityB = (1 - Math.min(1, B.volatility12m / maxVolatility)) * 50 + (B.volumeRecent / maxVolume) * 50
  
  return {
    neighbourhoodA: {
      entryCost: Math.round(entryCostA),
      leaseSafety: Math.round(leaseSafetyA),
      schoolPressure: Math.round(schoolPressureA),
      stability: Math.round(stabilityA),
      overall: 0 // Will be calculated based on lens
    },
    neighbourhoodB: {
      entryCost: Math.round(entryCostB),
      leaseSafety: Math.round(leaseSafetyB),
      schoolPressure: Math.round(schoolPressureB),
      stability: Math.round(stabilityB),
      overall: 0 // Will be calculated based on lens
    }
  }
}

// Calculate overall score based on lens weights and planning horizon
function calculateOverallScore(
  scores: CompareSummary['scores'],
  lens: PreferenceLens,
  longTerm: boolean,
  planningHorizon: 'short' | 'medium' | 'long' = 'medium'
): CompareSummary['scores'] {
  if (!scores) return null
  
  // Define base weights for each lens
  let baseWeights: { entryCost: number; leaseSafety: number; schoolPressure: number; stability: number }
  
  if (lens === 'lower_cost') {
    baseWeights = { entryCost: 0.55, leaseSafety: 0.25, schoolPressure: 0.15, stability: 0.05 }
  } else if (lens === 'lease_safety') {
    baseWeights = { entryCost: 0.20, leaseSafety: 0.50, schoolPressure: 0.15, stability: 0.15 }
  } else if (lens === 'school_pressure') {
    baseWeights = { entryCost: 0.20, leaseSafety: 0.15, schoolPressure: 0.50, stability: 0.15 }
  } else { // balanced
    baseWeights = { entryCost: 0.30, leaseSafety: 0.30, schoolPressure: 0.25, stability: 0.15 }
  }
  
  // Adjust for long-term holding (legacy, keep for backward compatibility)
  if (longTerm && planningHorizon === 'medium') {
    baseWeights.leaseSafety += 0.10
    baseWeights.entryCost -= 0.10
  }
  
  // Reorder weights based on Planning Horizon priority
  // Priority order determines weight redistribution (keeping total = 1.0)
  let weights: { entryCost: number; leaseSafety: number; schoolPressure: number; stability: number }
  
  if (planningHorizon === 'short') {
    // Short-term: Entry cost, School pressure, Lease, Time burden (stability)
    weights = {
      entryCost: baseWeights.entryCost * 1.2 + 0.15,  // Boost entry cost
      schoolPressure: baseWeights.schoolPressure * 1.1,
      leaseSafety: baseWeights.leaseSafety * 0.7,     // Reduce lease importance
      stability: baseWeights.stability * 0.8
    }
  } else if (planningHorizon === 'long') {
    // Long-term: Lease, Time burden (stability), School pressure, Entry cost
    weights = {
      leaseSafety: baseWeights.leaseSafety * 1.3 + 0.20,  // Boost lease
      stability: baseWeights.stability * 1.5 + 0.15,       // Boost time burden (via stability)
      schoolPressure: baseWeights.schoolPressure * 1.0,
      entryCost: baseWeights.entryCost * 0.7             // Reduce entry cost importance
    }
  } else {
    // Medium-term: Entry cost, Lease, School pressure, Time burden
    weights = {
      entryCost: baseWeights.entryCost * 1.1,
      leaseSafety: baseWeights.leaseSafety * 1.1,
      schoolPressure: baseWeights.schoolPressure * 1.0,
      stability: baseWeights.stability * 1.2
    }
  }
  
  // Normalize weights to sum to 1.0
  const total = weights.entryCost + weights.leaseSafety + weights.schoolPressure + weights.stability
  if (total > 0) {
    weights.entryCost /= total
    weights.leaseSafety /= total
    weights.schoolPressure /= total
    weights.stability /= total
  }
  
  // Calculate overall scores
  const overallA = 
    scores.neighbourhoodA.entryCost * weights.entryCost +
    scores.neighbourhoodA.leaseSafety * weights.leaseSafety +
    scores.neighbourhoodA.schoolPressure * weights.schoolPressure +
    scores.neighbourhoodA.stability * weights.stability
  
  const overallB = 
    scores.neighbourhoodB.entryCost * weights.entryCost +
    scores.neighbourhoodB.leaseSafety * weights.leaseSafety +
    scores.neighbourhoodB.schoolPressure * weights.schoolPressure +
    scores.neighbourhoodB.stability * weights.stability
  
  return {
    neighbourhoodA: { ...scores.neighbourhoodA, overall: Math.round(overallA) },
    neighbourhoodB: { ...scores.neighbourhoodB, overall: Math.round(overallB) }
  }
}

// Generate Compare Summary from Neighbourhood Profiles (Fixed 5-block structure)
export async function generateCompareSummary(
  A: NeighbourhoodProfile,
  B: NeighbourhoodProfile,
  userBudget?: number,
  spiA?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiB?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  landscapeA?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeB?: { schoolCount: number; highDemandSchools: number } | null,
  lens: PreferenceLens = 'balanced',
  longTerm: boolean = false,
  familyProfile?: FamilyProfile | null,
  planningHorizon: 'short' | 'medium' | 'long' = 'medium'
): Promise<CompareSummary> {
  const badges: CompareSummary['badges'] = []
  
  // Calculate differences
  const spiDiff = spiA && spiB ? spiA.spi - spiB.spi : 0 // >0 means A has higher pressure
  const priceDiff = A.medianResalePrice - B.medianResalePrice // >0 means A is more expensive
  const leaseDiff = A.medianRemainingLease - B.medianRemainingLease // >0 means A has healthier lease
  
  // Use thresholds from constants
  const SPI_SIGNIFICANT = COMPARISON_THRESHOLDS.SPI_SIGNIFICANT
  const PRICE_SIGNIFICANT = COMPARISON_THRESHOLDS.PRICE_SIGNIFICANT
  const LEASE_SIGNIFICANT = COMPARISON_THRESHOLDS.LEASE_SIGNIFICANT
  
  // ============================================
  // Decision Rules System: Build Comparison Metrics (early)
  // ============================================
  const metrics: ComparisonMetrics = {
    deltaPrice: -priceDiff,  // B - A (positive = B cheaper = better)
    deltaLeaseYears: -leaseDiff,  // B - A (positive = B healthier = better)
    deltaSPI: -spiDiff,  // B - A (positive = B lower pressure = better)
    deltaStability: 0,  // Placeholder for now
    leaseA: A.medianRemainingLease,
    leaseB: B.medianRemainingLease,
    spiLevelA: spiA?.level ?? null,
    spiLevelB: spiB?.level ?? null,
    pctTxBelow55A: A.pctTxBelow55,
    pctTxBelow55B: B.pctTxBelow55
  }
  
  // Get preference mode based on lens and long-term flag (or family profile)
  let preferenceMode: ReturnType<typeof getPreferenceMode>
  let ruleProfile: RuleProfile | null = null
  
  if (familyProfile) {
    // Use family profile to generate rule profile
    ruleProfile = mapFamilyProfileToRuleProfile(familyProfile)
    const baseMode = getPreferenceMode(ruleProfile.activeRuleSet, familyProfile.holdingYears === 'long')
    preferenceMode = applyRuleProfile(baseMode, ruleProfile)
  } else {
    // Fallback to lens-based mode
    preferenceMode = getPreferenceMode(lens, longTerm)
  }
  
  // Generate standardized scores
  const scores = generateStandardizedScores(A, B, spiA ?? null, spiB ?? null, landscapeA ?? null, landscapeB ?? null)
  const scoresWithOverall = calculateOverallScore(scores, lens, longTerm, planningHorizon)
  
  // Helper function to get SPI label
  const getSPILabel = (level: 'low' | 'medium' | 'high'): string => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }
  
  // ============================================
  // Block 1: Headline Verdict
  // ============================================
  let headlineVerdict: string
  if (spiA && spiB && Math.abs(spiDiff) >= SPI_SIGNIFICANT) {
    // Education pressure difference is significant
    if (spiDiff < 0) {
      headlineVerdict = `${A.neighbourhoodName || A.neighbourhoodId} offers significantly lower primary school pressure than ${B.neighbourhoodName || B.neighbourhoodId}.`
    } else {
      headlineVerdict = `${B.neighbourhoodName || B.neighbourhoodId} offers significantly lower primary school pressure than ${A.neighbourhoodName || A.neighbourhoodId}.`
    }
  } else if (spiA && spiB) {
    // Education pressure is similar
    headlineVerdict = `Both towns face similar levels of primary school competition.`
  } else if (spiA || spiB) {
    // Only one town has SPI data
    const availableTown = spiA ? A.neighbourhoodName || A.neighbourhoodId : B.neighbourhoodName || B.neighbourhoodId
    headlineVerdict = `Primary school pressure data is available for ${availableTown}, but not for ${spiA ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId}.`
  } else {
    // No SPI data - fallback to price/lease
    if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
      headlineVerdict = priceDiff > 0 
        ? `${A.neighbourhoodName || A.neighbourhoodId} commands higher entry prices than ${B.neighbourhoodName || B.neighbourhoodId}.`
        : `${B.neighbourhoodName || B.neighbourhoodId} commands higher entry prices than ${A.neighbourhoodName || A.neighbourhoodId}.`
    } else {
      headlineVerdict = `Both towns offer similar housing profiles.`
    }
  }
  
  // ============================================
  // Fetch Time & Access data
  // ============================================
  // IMPORTANT: Transport/Time & Access rules (Phase 2 v1):
  // 1. Transport does NOT participate in scoring (not in generateStandardizedScores)
  // 2. Transport does NOT influence recommendation (not in recommendation headline/decision)
  // 3. Transport ONLY appears in trade-offs (bottomLine.changes, movingPhrase)
  // 
  // Allowed: "This move improves lease safety, but increases daily time burden."
  // NOT allowed: "Therefore choose A instead of B" (based on transport)
  const [timeAccessA, timeAccessB] = await Promise.all([
    getNeighbourhoodTimeAccess(A.neighbourhoodId),
    getNeighbourhoodTimeAccess(B.neighbourhoodId),
  ])
  
  const timeBurdenA = getTimeBurdenLevel(timeAccessA)
  const timeBurdenB = getTimeBurdenLevel(timeAccessB)
  
  // ============================================
  // Bottom Line (Top Section)
  // ============================================
  let bottomLine: CompareSummary['bottomLine'] = null
  if (A && B) {
    const changes: string[] = []
    
    // Lease security change
    if (Math.abs(leaseDiff) >= LEASE_SIGNIFICANT) {
      if (leaseDiff < 0) {
        changes.push('👍 Lease security improves significantly')
      } else {
        changes.push('⚠ Lease security decreases')
      }
    }
    
    // School pressure change
    if (spiA && spiB && Math.abs(spiDiff) >= SPI_SIGNIFICANT) {
      if (spiDiff < 0) {
        changes.push('👍 School pressure decreases')
      } else {
        changes.push('⚠ School pressure increases slightly')
      }
    } else if (spiA && spiB && Math.abs(spiDiff) > 0) {
      if (spiDiff < 0) {
        changes.push('👍 School pressure decreases slightly')
      } else {
        changes.push('⚠ School pressure increases slightly')
      }
    }
    
    // Time burden change (Phase 2 v1: only add to tradeoffs, not scoring) - using TBI
    const [transportProfileA, transportProfileB] = await Promise.all([
      getNeighbourhoodTransportProfile(A.neighbourhoodId),
      getNeighbourhoodTransportProfile(B.neighbourhoodId),
    ])
    if (transportProfileA && transportProfileB) {
      const tbiA = calculateTBI(transportProfileA)
      const tbiB = calculateTBI(transportProfileB)
      const tbiDiff = tbiB - tbiA
      
      if (Math.abs(tbiDiff) >= 3) {
        if (tbiDiff > 0) {
          changes.push(`⚠ Transport burden: +${tbiDiff} (higher daily time cost)`)
        } else {
          changes.push(`👍 Transport burden: ${tbiDiff} (lower daily time cost)`)
        }
      }
    } else if (timeAccessA && timeAccessB) {
      // Fallback to qualitative assessment
      const burdenLevels = { low: 1, medium: 2, high: 3 }
      const burdenDiff = burdenLevels[timeBurdenB] - burdenLevels[timeBurdenA]
      if (burdenDiff > 0) {
        changes.push('⚠ Increases daily time burden')
      } else if (burdenDiff < 0) {
        changes.push('👍 Reduces daily time burden')
      }
    }
    
    // Price change
    if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
      if (priceDiff < 0) {
        changes.push('💰 Lower upfront price')
      } else {
        changes.push('💰 Higher upfront price')
      }
    }
    
    // Generate "Best for" statement
    let bestFor = ''
    if (spiA && spiB && leaseDiff < -LEASE_SIGNIFICANT) {
      bestFor = `Best for families planning long-term ownership and prioritising lease stability.`
    } else if (spiA && spiB && spiDiff < -SPI_SIGNIFICANT) {
      bestFor = `Best for families prioritising lower primary school pressure.`
    } else if (priceDiff < -PRICE_SIGNIFICANT) {
      bestFor = `Best for buyers prioritising lower upfront cost.`
    } else {
      bestFor = `Both towns offer viable options — choose based on your priorities.`
    }
    
    if (changes.length > 0) {
      bottomLine = { changes, bestFor }
    }
  }
  
  // ============================================
  // Block 2: Education Pressure Comparison
  // ============================================
  let educationPressure: CompareSummary['educationPressure'] = null
  if (spiA && spiB) {
    const comparison = `Primary school pressure:\n• ${A.neighbourhoodName || A.neighbourhoodId}: SPI ${spiA.spi} (${getSPILabel(spiA.level)})\n• ${B.neighbourhoodName || B.neighbourhoodId}: SPI ${spiB.spi} (${getSPILabel(spiB.level)})`
    
    let explanation = ''
    if (spiDiff >= SPI_SIGNIFICANT) {
      explanation = `Families in ${A.neighbourhoodName || A.neighbourhoodId} face more concentrated competition and fewer lower-risk options.`
    } else if (spiDiff <= -SPI_SIGNIFICANT) {
      explanation = `${A.neighbourhoodName || A.neighbourhoodId} offers a wider range of lower-pressure school options.`
    } else {
      explanation = `Both towns offer similar school competition levels.`
    }
    
    // Add pressure range note
    let pressureRangeNote = ''
    if (spiA.spi <= 20 && spiB.spi <= 20) {
      pressureRangeNote = `Both towns fall within the Low pressure range (0–20), meaning primary school competition is generally manageable.`
    } else if (spiA.spi <= 40 && spiB.spi <= 40 && spiA.spi > 20 && spiB.spi > 20) {
      pressureRangeNote = `Both towns fall within the Moderate pressure range (20–40), with moderate competition levels.`
    } else if (spiA.spi > 40 || spiB.spi > 40) {
      pressureRangeNote = `One or both towns have higher pressure (40+), indicating more concentrated competition.`
    } else {
      pressureRangeNote = `Both towns fall within manageable pressure ranges, meaning primary school competition is generally manageable.`
    }
    
    educationPressure = { comparison, explanation, pressureRangeNote }
  } else if (spiA || spiB) {
    // Show partial data if only one town has SPI data
    const availableTown = spiA ? A.neighbourhoodName || A.neighbourhoodId : B.neighbourhoodName || B.neighbourhoodId
    const availableSPI = spiA || spiB!
    const comparison = `Primary school pressure:\n• ${availableTown}: SPI ${availableSPI.spi} (${getSPILabel(availableSPI.level)})\n• ${spiA ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId}: Data not available`
    const explanation = `School pressure data is only available for ${availableTown}.`
    educationPressure = { comparison, explanation }
  }
  
  // ============================================
  // Block 3: Housing Trade-off
  // ============================================
  const housingTradeoff: CompareSummary['housingTradeoff'] = {
    price: null,
    lease: null
  }
  
  if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
    housingTradeoff.price = priceDiff > 0
      ? `Entry cost is higher in ${A.neighbourhoodName || A.neighbourhoodId}.`
      : `Entry cost is lower in ${A.neighbourhoodName || A.neighbourhoodId}.`
  }
  
  if (Math.abs(leaseDiff) >= LEASE_SIGNIFICANT) {
    housingTradeoff.lease = leaseDiff > 0
      ? `Remaining lease is healthier in ${A.neighbourhoodName || A.neighbourhoodId}.`
      : `Remaining lease is healthier in ${B.neighbourhoodName || B.neighbourhoodId}.`
  }
  
  // ============================================
  // Block 4: Who Each Town Is Better For
  // ============================================
  const bestSuitedFor: CompareSummary['bestSuitedFor'] = {
    neighbourhoodA: [],
    neighbourhoodB: []
  }
  
  // Education pressure tags
  if (spiA && spiB) {
    if (spiDiff < -SPI_SIGNIFICANT) {
      bestSuitedFor.neighbourhoodA.push('Families prioritizing lower primary school pressure')
    }
    if (spiDiff > SPI_SIGNIFICANT) {
      bestSuitedFor.neighbourhoodB.push('Families prioritizing lower primary school pressure')
    }
  }
  
  // Price tags
  if (priceDiff < -PRICE_SIGNIFICANT) {
    bestSuitedFor.neighbourhoodA.push('Buyers prioritizing lower upfront cost')
  }
  if (priceDiff > PRICE_SIGNIFICANT) {
    bestSuitedFor.neighbourhoodB.push('Buyers prioritizing lower upfront cost')
  }
  
  // Lease tags
  if (leaseDiff > LEASE_SIGNIFICANT) {
    bestSuitedFor.neighbourhoodA.push('Long-term owners valuing lease security')
  }
  if (leaseDiff < -LEASE_SIGNIFICANT) {
    bestSuitedFor.neighbourhoodB.push('Long-term owners valuing lease security')
  }
  
  // Additional tags for buyers less sensitive to school competition
  if (spiA && spiB) {
    if (spiDiff > SPI_SIGNIFICANT) {
      bestSuitedFor.neighbourhoodB.push('Buyers less sensitive to school competition')
    }
    if (spiDiff < -SPI_SIGNIFICANT) {
      bestSuitedFor.neighbourhoodA.push('Buyers less sensitive to school competition')
    }
  }
  
  // ============================================
  // Block 5: Decision Hint (fixed templates)
  // ============================================
  let decisionHint: string = ''
  const preferenceId = preferenceMode.id
  
  // Fixed decision hint templates
  if (preferenceId === 'long_term') {
    decisionHint = `Over long holding periods, lease profile tends to matter more than upfront price.`
  } else if (preferenceId === 'low_school_pressure') {
    decisionHint = `Structural pressure matters more than individual outcomes.`
  } else if (preferenceId === 'low_entry') {
    decisionHint = `Monthly cash flow constraints often dominate long-term considerations.`
  } else {
    // Balanced
    decisionHint = `Both options are viable — choose based on your timeline and risk tolerance.`
  }
  
  // ============================================
  // Killer Phrase: Moving from A to B
  // ============================================
  let movingPhrase: string | null = null
  if (spiA && spiB) {
    const parts: string[] = []
    const fromTown = A.neighbourhoodName || A.neighbourhoodId
    const toTown = B.neighbourhoodName || B.neighbourhoodId
    
    // School pressure change
    if (Math.abs(spiDiff) >= SPI_SIGNIFICANT) {
      if (spiDiff < 0) {
        parts.push('reduces school pressure')
      } else {
        parts.push('increases school pressure')
      }
    }
    
    // Price change
    if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
      if (priceDiff < 0) {
        parts.push('reduces entry cost')
      } else {
        parts.push('increases entry cost')
      }
    }
    
    // Lease change
    if (Math.abs(leaseDiff) >= LEASE_SIGNIFICANT) {
      if (leaseDiff < 0) {
        parts.push('improves lease security')
      } else {
        parts.push('reduces lease security')
      }
    }
    
    // Time burden change (Phase 2 v1) - using TBI for more precise assessment
    const [transportProfileA, transportProfileB] = await Promise.all([
      getNeighbourhoodTransportProfile(A.neighbourhoodId),
      getNeighbourhoodTransportProfile(B.neighbourhoodId),
    ])
    if (transportProfileA && transportProfileB) {
      const tbiA = calculateTBI(transportProfileA)
      const tbiB = calculateTBI(transportProfileB)
      const tbiDiff = tbiB - tbiA
      
      if (Math.abs(tbiDiff) >= 5) { // Significant change threshold
        if (tbiDiff > 0) {
          parts.push('increases daily time burden')
        } else {
          parts.push('reduces daily time burden')
        }
      } else if (timeAccessA && timeAccessB) {
        // Fallback to qualitative assessment if TBI difference is small
        const burdenLevels = { low: 1, medium: 2, high: 3 }
        const burdenDiff = burdenLevels[timeBurdenB] - burdenLevels[timeBurdenA]
        if (burdenDiff > 0) {
          parts.push('increases daily time burden')
        } else if (burdenDiff < 0) {
          parts.push('reduces daily time burden')
        }
      }
    } else if (timeAccessA && timeAccessB) {
      // Fallback if transport profiles not available
      const burdenLevels = { low: 1, medium: 2, high: 3 }
      const burdenDiff = burdenLevels[timeBurdenB] - burdenLevels[timeBurdenA]
      if (burdenDiff > 0) {
        parts.push('increases daily time burden')
      } else if (burdenDiff < 0) {
        parts.push('reduces daily time burden')
      }
    }
    
    if (parts.length > 0) {
      // Generate moving phrase with better structure for Transport burden
      const [transportProfileA, transportProfileB] = await Promise.all([
        getNeighbourhoodTransportProfile(A.neighbourhoodId),
        getNeighbourhoodTransportProfile(B.neighbourhoodId),
      ])
      let transportPart = ''
      
      if (transportProfileA && transportProfileB) {
        const tbiA = calculateTBI(transportProfileA)
        const tbiB = calculateTBI(transportProfileB)
        const tbiDiff = tbiB - tbiA
        
        if (Math.abs(tbiDiff) >= 5) {
          if (planningHorizon === 'long') {
            transportPart = tbiDiff > 0 
              ? 'increases daily time burden over a 10–15 year horizon'
              : 'reduces daily time burden over a 10–15 year horizon'
          } else {
            transportPart = tbiDiff > 0 
              ? 'increases daily time burden'
              : 'reduces daily time burden'
          }
        }
      }
      
      // Build the phrase: prioritize lease and transport if significant
      // Format: "Moving from A to B reduces lease risk significantly, but increases daily time burden over a 10–15 year horizon."
      const leaseParts: string[] = []
      const transportParts: string[] = []
      const otherParts: string[] = []
      
      parts.forEach(part => {
        if (part.includes('lease') || part.includes('Lease')) {
          // Transform lease language
          let leaseText = part
          if (part.includes('improves lease security')) {
            leaseText = 'reduces lease risk significantly'
          } else if (part.includes('reduces lease security')) {
            leaseText = 'increases lease risk'
          }
          leaseParts.push(leaseText)
        } else if (part.includes('time burden') || part === transportPart) {
          if (transportPart) {
            transportParts.push(transportPart)
          } else {
            transportParts.push(part)
          }
        } else {
          otherParts.push(part)
        }
      })
      
      // Build final phrase with proper structure
      const phraseParts: string[] = []
      
      // Add lease first if present
      if (leaseParts.length > 0) {
        phraseParts.push(leaseParts[0])
      }
      
      // Add transport with "but" if it contrasts with lease
      if (transportParts.length > 0) {
        if (leaseParts.length > 0) {
          // Use "but" to show contrast
          phraseParts.push(`but ${transportParts[0]}`)
        } else {
          phraseParts.push(transportParts[0])
        }
      }
      
      // Add other parts
      otherParts.forEach(part => {
        if (phraseParts.length > 0) {
          phraseParts.push(`, and ${part}`)
        } else {
          phraseParts.push(part)
        }
      })
      
      if (phraseParts.length > 0) {
        movingPhrase = `Moving from ${fromTown} to ${toTown} ${phraseParts.join('')}.`
      }
    }
  }
  
  // ============================================
  // Generate Time & Access Moving Impact (using TBI)
  // ============================================
  let timeAccessMovingImpact: string | null = null
  const [transportProfileA, transportProfileB] = await Promise.all([
    getNeighbourhoodTransportProfile(A.neighbourhoodId),
    getNeighbourhoodTransportProfile(B.neighbourhoodId),
  ])
  
  if (transportProfileA && transportProfileB) {
    const tbiA = calculateTBI(transportProfileA)
    const tbiB = calculateTBI(transportProfileB)
    const tbiDiff = tbiB - tbiA
    
    if (Math.abs(tbiDiff) >= 5) {
      if (tbiDiff > 0) {
        if (planningHorizon === 'long') {
          timeAccessMovingImpact = `Moving to ${B.neighbourhoodName || B.neighbourhoodId} increases daily time burden, which compounds over long holding periods.`
        } else {
          timeAccessMovingImpact = `Likely increases daily commuting time`
        }
      } else {
        if (planningHorizon === 'long') {
          timeAccessMovingImpact = `Moving to ${B.neighbourhoodName || B.neighbourhoodId} reduces daily time burden, improving long-term commute sustainability.`
        } else {
          timeAccessMovingImpact = `Likely reduces daily commuting time`
        }
      }
    } else {
      timeAccessMovingImpact = `Similar daily time burden`
    }
  } else if (timeAccessA && timeAccessB) {
    // Fallback to qualitative assessment
    const burdenLevels = { low: 1, medium: 2, high: 3 }
    const burdenDiff = burdenLevels[timeBurdenB] - burdenLevels[timeBurdenA]
    
    if (burdenDiff > 0) {
      timeAccessMovingImpact = `Likely increases daily commuting time`
    } else if (burdenDiff < 0) {
      timeAccessMovingImpact = `Likely reduces daily commuting time`
    } else {
      timeAccessMovingImpact = `Similar daily time burden`
    }
    
    // Add transfer complexity info if different
    if (timeAccessA.transferComplexity !== timeAccessB.transferComplexity) {
      if (timeAccessB.transferComplexity === '2_plus' || timeAccessB.transferComplexity === '1_transfer') {
        timeAccessMovingImpact += `; more transfers for work and school`
      }
    }
  }
  
  // Check hard rules (warnings, penalties, overrides)
  const hardRuleWarnings = checkHardRules(metrics, preferenceMode)
  
  // Evaluate school-specific rules
  const schoolRulesResult = evaluateSchoolRules(metrics, preferenceMode)
  
  // ============================================
  // Lens-based Recommendation (using Decision Rules)
  // ============================================
  let recommendation: CompareSummary['recommendation'] = null
  if (scoresWithOverall) {
    const overallDiff = scoresWithOverall.neighbourhoodB.overall - scoresWithOverall.neighbourhoodA.overall
    const winner = overallDiff > 0 ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId
    const winnerIsB = overallDiff > 0
    
    // Generate headline using fixed templates based on planning horizon and family profile
    let headline = ''
    const preferenceId = preferenceMode.id
    const overallDiffAbs = Math.abs(overallDiff)
    
    // Planning Horizon-aware opening (takes priority over profile type)
    if (planningHorizon === 'short') {
      headline = `For families planning a shorter stay, upfront cost and flexibility matter more than long-term lease decay. ${winner} offers a better fit for your timeline.`
    } else if (planningHorizon === 'long') {
      headline = `For families planning to stay long-term, lease profile and daily time burden matter more than entry price. ${winner} offers stronger long-term stability.`
    } else {
      // Medium-term: use profile-based templates
      if (preferenceId === 'balanced') {
        headline = `Based on a balanced trade-off, ${winner} is the better overall choice.`
      } else if (preferenceId === 'low_entry') {
        headline = `If keeping upfront and monthly costs low matters most, ${winner} offers a clearer affordability advantage.`
      } else if (preferenceId === 'long_term') {
        headline = `For families prioritizing lease safety, ${winner} offers stronger lease profile despite higher entry cost.`
      } else if (preferenceId === 'low_school_pressure') {
        headline = `For families sensitive to school competition, ${winner} offers lower structural primary school pressure.`
      } else {
        headline = `Based on a balanced trade-off, ${winner} is the better overall choice.`
      }
    }
    
    // Generate exactly 3-4 trade-off bullets (fixed template)
    const tradeoffs: string[] = []
    
    // Always show: Entry cost, Lease profile, School pressure, Transport burden
    // 1. Entry cost (with emoji)
    const cheaper = metrics.deltaPrice > 0 ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId
    const priceDiff = Math.abs(metrics.deltaPrice)
    if (priceDiff >= 1000) {
      const priceDiffK = Math.round(priceDiff / 1000)
      tradeoffs.push(`💰 Entry cost: ${cheaper} is lower by ~S$${priceDiffK}k`)
    } else if (priceDiff > 0) {
      tradeoffs.push(`💰 Entry cost: ${cheaper} is lower by ~S$${Math.round(priceDiff)}`)
    } else {
      tradeoffs.push(`💰 Entry cost: Both towns have similar entry prices`)
    }
    
    // 2. Lease profile (lifecycle-aware phrasing, with emoji)
    const healthier = metrics.deltaLeaseYears > 0 ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId
    const shorter = metrics.deltaLeaseYears < 0 ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId
    const leaseDiff = Math.abs(metrics.deltaLeaseYears)
    if (leaseDiff >= 1) {
      if (planningHorizon === 'short') {
        tradeoffs.push(`🧱 Lease profile: Lease decay is less critical over a short holding period. ${healthier} has ~${Math.round(leaseDiff)} more remaining years.`)
      } else if (planningHorizon === 'long') {
        tradeoffs.push(`🧱 Lease profile: ${shorter} has shorter remaining lease (~${Math.round(leaseDiff)} years less), which significantly limits long-term flexibility.`)
      } else {
        tradeoffs.push(`🧱 Lease profile: ${healthier} has ~${Math.round(leaseDiff)} more remaining years`)
      }
    } else {
      tradeoffs.push(`🧱 Lease profile: Both towns have similar remaining lease`)
    }
    
    // 3. School pressure (human-readable format, no SPI numbers)
    if (spiA && spiB) {
      const spiChange = metrics.deltaSPI
      const spiChangeAbs = Math.abs(spiChange)
      const finalLevel = spiChange > 0 ? spiB.level : spiA.level
      const direction = spiChange > 0 ? 'decreases' : 'increases'
      
      if (spiChangeAbs > 0.1) {
        // Human-readable format based on level and change
        if (finalLevel === 'low') {
          if (spiChangeAbs < 2) {
            tradeoffs.push(`🎓 School competition: Slightly ${direction === 'increases' ? 'higher' : 'lower'}, but still low — unlikely to affect daily stress`)
          } else {
            tradeoffs.push(`🎓 School competition: ${direction === 'increases' ? 'Increases' : 'Decreases'} to low level — manageable for most families`)
          }
        } else if (finalLevel === 'medium') {
          tradeoffs.push(`🎓 School competition: ${direction === 'increases' ? 'Increases' : 'Decreases'} to moderate level — may require more planning`)
        } else {
          tradeoffs.push(`🎓 School competition: ${direction === 'increases' ? 'Increases' : 'Decreases'} to high level — significant competition expected`)
        }
      } else {
        if (finalLevel === 'low') {
          tradeoffs.push(`🎓 School competition: Similar low level — comfortable for most families`)
        } else if (finalLevel === 'medium') {
          tradeoffs.push(`🎓 School competition: Similar moderate level — manageable with planning`)
        } else {
          tradeoffs.push(`🎓 School competition: Similar high level — competitive environment`)
        }
      }
    } else {
      tradeoffs.push(`🎓 School competition: Data not available for comparison`)
    }
    
    // 4. Transport burden (human-readable format, no TBI numbers)
    const [transportProfileA, transportProfileB] = await Promise.all([
      getNeighbourhoodTransportProfile(A.neighbourhoodId),
      getNeighbourhoodTransportProfile(B.neighbourhoodId),
    ])
    if (transportProfileA && transportProfileB) {
      const tbiA = calculateTBI(transportProfileA)
      const tbiB = calculateTBI(transportProfileB)
      const tbiDiff = tbiB - tbiA
      
      if (Math.abs(tbiDiff) >= 3) { // Show if significant difference
        if (tbiDiff > 0) {
          if (tbiDiff >= 15) {
            tradeoffs.push(`🚗 Daily time cost: Commute becomes noticeably longer over time — consider long-term impact`)
          } else if (tbiDiff >= 8) {
            tradeoffs.push(`🚗 Daily time cost: Commute likely becomes a bit longer over time`)
          } else {
            tradeoffs.push(`🚗 Daily time cost: Slightly longer commute — minor impact`)
          }
        } else {
          if (Math.abs(tbiDiff) >= 15) {
            tradeoffs.push(`🚗 Daily time cost: Commute becomes noticeably shorter over time — meaningful improvement`)
          } else if (Math.abs(tbiDiff) >= 8) {
            tradeoffs.push(`🚗 Daily time cost: Commute likely becomes a bit shorter over time`)
          } else {
            tradeoffs.push(`🚗 Daily time cost: Slightly shorter commute — minor improvement`)
          }
        }
      } else {
        tradeoffs.push(`🚗 Daily time cost: Similar commute structure — no significant change`)
      }
    }
    
    // Confidence badge
    let confidence: 'clear_winner' | 'balanced' | 'depends_on_preference'
    if (overallDiffAbs > SCORING_CONSTANTS.CONFIDENCE.CLEAR_WINNER) {
      confidence = 'clear_winner'
    } else if (overallDiffAbs > SCORING_CONSTANTS.CONFIDENCE.BALANCED) {
      confidence = 'balanced'
    } else {
      confidence = 'depends_on_preference'
    }
    
    recommendation = { headline, tradeoffs: tradeoffs.slice(0, 4), confidence }
  }
  
  // ============================================
  // Moving Education Impact
  // ============================================
  let movingEducationImpact: CompareSummary['movingEducationImpact'] = null
  if (spiA && spiB && landscapeA && landscapeB && 
      typeof landscapeA.schoolCount === 'number' && 
      typeof landscapeB.schoolCount === 'number' &&
      typeof landscapeA.highDemandSchools === 'number' &&
      typeof landscapeB.highDemandSchools === 'number') {
    const spiChange = spiB.spi - spiA.spi
    const spiChangeAbs = Math.abs(spiChange)
    
    // Determine SPI change text with level
    const higherSPI = spiChange > 0 ? spiB : spiA
    const lowerSPI = spiChange > 0 ? spiA : spiB
    const finalLevel = higherSPI.level
    const levelText = finalLevel === 'low' ? 'still Low' : finalLevel === 'medium' ? 'Moderate' : 'High'
    const spiChangeText = `${spiChange > 0 ? '+' : ''}${spiChangeAbs.toFixed(1)} (${levelText})`
    
    // High-demand schools change
    const highDemandChange = landscapeB.highDemandSchools - landscapeA.highDemandSchools
    const highDemandSchoolsText = highDemandChange > 0 ? `+${highDemandChange}` : highDemandChange < 0 ? `${highDemandChange}` : '+0'
    
    // School count change
    const schoolCountChange = landscapeB.schoolCount - landscapeA.schoolCount
    const schoolCountText = `${landscapeA.schoolCount} → ${landscapeB.schoolCount}`
    
    // Choice flexibility (based on school count and cutoff distribution)
    let choiceFlexibility: 'Similar' | 'Better' | 'Worse'
    if (schoolCountChange > 2 && highDemandChange <= 0) {
      choiceFlexibility = 'Better'
    } else if (schoolCountChange < -2 || (schoolCountChange <= 0 && highDemandChange > 0)) {
      choiceFlexibility = 'Worse'
    } else {
      choiceFlexibility = 'Similar'
    }
    
    // Generate explanation sentence
    let explanation = ''
    if (spiChangeAbs < COMPARISON_THRESHOLDS.SPI_MINOR) {
      explanation = `Pressure remains similar — moving is unlikely to materially change day-to-day stress.`
    } else if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MINOR && spiChangeAbs < COMPARISON_THRESHOLDS.SPI_MODERATE) {
      if (spiChange > 0) {
        explanation = `Pressure increases slightly, but stays within ${finalLevel === 'low' ? 'Low' : 'Moderate'} range — moving is unlikely to materially change day-to-day stress unless you target specific elite schools.`
      } else {
        explanation = `Pressure decreases slightly — moving may reduce competition, especially if you're targeting mid-tier schools.`
      }
    } else if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MODERATE) {
      if (spiChange > 0) {
        const levelChange = spiA.level !== spiB.level
        if (levelChange) {
          explanation = `Pressure increases significantly and crosses into ${finalLevel === 'medium' ? 'Moderate' : 'High'} range — moving may meaningfully increase competition, especially for popular schools.`
        } else {
          explanation = `Pressure increases significantly — moving may meaningfully increase competition, especially for popular schools.`
        }
      } else {
        explanation = `Pressure decreases significantly — moving may meaningfully reduce competition and increase your school options.`
      }
    }
    
    movingEducationImpact = {
      spiChange,
      spiChangeText,
      highDemandSchoolsChange: highDemandChange,
      highDemandSchoolsText,
      schoolCountChange,
      schoolCountText,
      choiceFlexibility,
      explanation
    }
  }
  
  // ============================================
  // Update Recommendation based on Education Impact (when lens = school_pressure)
  // ============================================
  if (recommendation && movingEducationImpact && lens === 'school_pressure') {
    const spiChangeAbs = Math.abs(movingEducationImpact.spiChange)
    
    // If SPI difference is significant: Education dimension can override price/lease
    if (spiChangeAbs > COMPARISON_THRESHOLDS.SPI_MODERATE) {
      // Education becomes primary factor in headline
      if (movingEducationImpact.spiChange < 0) {
        recommendation.headline = `Choose ${A.neighbourhoodName || A.neighbourhoodId} if you prioritise significantly lower primary school pressure.`
      } else {
        recommendation.headline = `Choose ${B.neighbourhoodName || B.neighbourhoodId} if you prioritise significantly lower primary school pressure.`
      }
    } else if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MINOR && spiChangeAbs <= COMPARISON_THRESHOLDS.SPI_MODERATE) {
      // Write as trade-off
      if (movingEducationImpact.spiChange < 0) {
        recommendation.headline = `Choose ${A.neighbourhoodName || A.neighbourhoodId} for lower school pressure, but consider trade-offs with price and lease.`
      } else {
        recommendation.headline = `Choose ${B.neighbourhoodName || B.neighbourhoodId} for lower school pressure, but consider trade-offs with price and lease.`
      }
    }
    // If SPI difference is minor: Keep existing headline (education mentioned in trade-offs)
  }
  
  // ============================================
  // Force education mention when lens ≠ school_pressure but education difference is significant
  // ============================================
  if (recommendation && movingEducationImpact && lens !== 'school_pressure') {
    const spiChangeAbs = Math.abs(movingEducationImpact.spiChange)
    const levelChange = spiA && spiB && spiA.level !== spiB.level
    const highDemandDiff = Math.abs(movingEducationImpact.highDemandSchoolsChange)
    const schoolCountDiff = Math.abs(movingEducationImpact.schoolCountChange)
    
    // Force education mention if:
    // 1. SPI crosses level (Low → Moderate or Moderate → High)
    // 2. High-demand schools difference is significant
    // 3. Primary school count difference is significant
    if (levelChange || highDemandDiff >= COMPARISON_THRESHOLDS.HIGH_DEMAND_SCHOOLS_SIGNIFICANT || schoolCountDiff >= COMPARISON_THRESHOLDS.SCHOOL_COUNT_SIGNIFICANT) {
      // Add education to trade-offs if not already there
      const hasEducation = recommendation.tradeoffs.some(t => t.includes('School') || t.includes('🎓'))
      if (!hasEducation && recommendation.tradeoffs.length < SCORING_CONSTANTS.MAX_TRADEOFF_BULLETS) {
        const spiChange = movingEducationImpact.spiChange
        const lowerSPI = spiChange < 0 ? A.neighbourhoodName || A.neighbourhoodId : B.neighbourhoodName || B.neighbourhoodId
        const diff = spiChangeAbs
        const level = (spiChange < 0 ? spiA : spiB)?.level
        const levelText = level === 'low' ? 'still Low' : level === 'medium' ? 'Moderate' : 'High'
        recommendation.tradeoffs.push(`🎓 School: Moving to ${lowerSPI === A.neighbourhoodName || A.neighbourhoodId ? B.neighbourhoodName || B.neighbourhoodId : A.neighbourhoodName || A.neighbourhoodId} ${spiChange < 0 ? 'decreases' : 'increases'} SPI by +${diff.toFixed(1)} (${levelText})`)
      }
      
      // Update headline to mention education if significant
      if (levelChange && recommendation.headline && !recommendation.headline.includes('school')) {
        recommendation.headline = recommendation.headline.replace('.', ', but note the school pressure difference.')
      }
    }
  }
  
  // ============================================
  // Legacy fields (for backward compatibility)
  // ============================================
  const oneLiner = headlineVerdict
  const keyDifferences: string[] = []
  if (educationPressure) {
    keyDifferences.push(educationPressure.comparison.replace(/\n/g, ' '))
  }
  if (housingTradeoff.price) keyDifferences.push(housingTradeoff.price)
  if (housingTradeoff.lease) keyDifferences.push(housingTradeoff.lease)
  
  const bestFor = {
    neighbourhoodA: bestSuitedFor.neighbourhoodA,
    neighbourhoodB: bestSuitedFor.neighbourhoodB
  }
  
  const beCautious = {
    neighbourhoodA: [] as string[],
    neighbourhoodB: [] as string[]
  }
  
  // Badges
  if (A.signals.leaseRisk === 'high' || A.signals.leaseRisk === 'critical')
    badges.push({ neighbourhood: 'A', label: A.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ neighbourhood: 'A', label: 'Lease healthier', tone: 'good' })

  if (B.signals.leaseRisk === 'high' || B.signals.leaseRisk === 'critical')
    badges.push({ neighbourhood: 'B', label: B.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ neighbourhood: 'B', label: 'Lease healthier', tone: 'good' })

  return {
    // Bottom Line (top section)
    bottomLine,
    // Lens-based Recommendation
    recommendation,
    // Standardized scores
    scores: scoresWithOverall,
    // Moving Education Impact
    movingEducationImpact,
    // New 5-block structure
    headlineVerdict,
    educationPressure,
    housingTradeoff,
    bestSuitedFor,
    decisionHint,
    movingPhrase,
    
    // Time & Access comparison
    timeAccess: timeAccessA || timeAccessB ? {
      neighbourhoodA: timeAccessA,
      neighbourhoodB: timeAccessB,
      timeBurdenA,
      timeBurdenB,
      movingImpact: timeAccessMovingImpact,
    } : null,
    
    // Legacy fields
    oneLiner,
    keyDifferences,
    bestFor,
    beCautious,
    advanced: {
      stabilityA: A.signals.stability,
      stabilityB: B.signals.stability,
      leaseRiskReasonsA: A.signals.leaseSignalReasons,
      leaseRiskReasonsB: B.signals.leaseSignalReasons,
    },
    badges,
  }
}

// Get Town Comparison Data
// Note: town parameter is kept for backward compatibility but data is aggregated by neighbourhood_id
// Town is only used for filtering, not for aggregation
export async function getNeighbourhoodComparisonData(
  neighbourhoodId: string,
  flatType: string,
  months: number = 12
): Promise<NeighbourhoodComparisonData | null> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Get aggregated monthly data by neighbourhood_id
    const data = await getAggregatedMonthly(
      flatType,
      undefined, // town - not used
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      neighbourhoodId // Use neighbourhood_id directly
    )

    if (data.length === 0) return null

    // Calculate statistics
    const prices = data.map(d => d.median_price)
    const leases = data.map(d => d.median_lease_years).filter(l => l > 0)
    const pricesPerSqm = data.map(d => d.median_psm).filter(p => p > 0)
    
    // Price volatility (coefficient of variation)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const priceStdDev = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    )
    const priceVolatility = avgPrice > 0 ? priceStdDev / avgPrice : 0

    // % below critical threshold
    const below55 = leases.filter(l => l < LEASE_THRESHOLDS.CRITICAL).length
    const pctBelow55Years = leases.length > 0 ? (below55 / leases.length) * 100 : 0

    // Get neighbourhood name for display
    if (!supabase) {
      console.error('Supabase not initialized')
      return null
    }
    const { data: neighbourhood } = await supabase
      .from('neighbourhoods')
      .select('id, name')
      .eq('id', neighbourhoodId)
      .single()

    return {
      neighbourhoodId,
      neighbourhoodName: neighbourhood?.name,
      flatType,
      medianPrice: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      p25Price: prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.25)],
      p75Price: prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.75)],
      medianLeaseYears: leases.length > 0 
        ? leases.sort((a, b) => a - b)[Math.floor(leases.length / 2)]
        : 0,
      pctBelow55Years,
      txCount: data.reduce((sum, d) => sum + d.tx_count, 0),
      priceVolatility,
      medianPricePerSqm: pricesPerSqm.length > 0
        ? pricesPerSqm.sort((a, b) => a - b)[Math.floor(pricesPerSqm.length / 2)]
        : 0,
    }
  } catch (error) {
    console.error('Error fetching town comparison data:', error)
  }

  return null
}

// Generate 3 Neighbourhood Compare Summary (no ranking, just suitability)
// Note: Function name kept for backward compatibility, but data is aggregated by neighbourhood_id
export async function generateThreeNeighbourhoodCompareSummary(
  A: NeighbourhoodProfile,
  B: NeighbourhoodProfile,
  C: NeighbourhoodProfile,
  spiA?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiB?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiC?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  landscapeA?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeB?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeC?: { schoolCount: number; highDemandSchools: number } | null,
  planningHorizon: 'short' | 'medium' | 'long' = 'medium'
): Promise<ThreeNeighbourhoodCompareSummary> {
  // Fetch Time & Access data for all 3 towns
  const [timeAccessA, timeAccessB, timeAccessC] = await Promise.all([
    getNeighbourhoodTimeAccess(A.neighbourhoodId),
    getNeighbourhoodTimeAccess(B.neighbourhoodId),
    getNeighbourhoodTimeAccess(C.neighbourhoodId),
  ])
  
  const timeBurdenA = getTimeBurdenLevel(timeAccessA)
  const timeBurdenB = getTimeBurdenLevel(timeAccessB)
  const timeBurdenC = getTimeBurdenLevel(timeAccessC)
  
  // Determine overall tendencies (no ranking, just "who is better for what")
  const tendencies = {
    neighbourhoodA: '',
    neighbourhoodB: '',
    neighbourhoodC: '',
  }
  
  // Affordability comparison
  const prices = [A.medianResalePrice, B.medianResalePrice, C.medianResalePrice]
  const cheapestIndex = prices.indexOf(Math.min(...prices))
  const cheapestTown = cheapestIndex === 0 ? A.neighbourhoodName || A.neighbourhoodId : cheapestIndex === 1 ? B.neighbourhoodName || B.neighbourhoodId : C.neighbourhoodName || C.neighbourhoodId
  
  // Lease comparison
  const leases = [A.medianRemainingLease, B.medianRemainingLease, C.medianRemainingLease]
  const healthiestLeaseIndex = leases.indexOf(Math.max(...leases))
  const healthiestLeaseTown = healthiestLeaseIndex === 0 ? A.neighbourhoodName || A.neighbourhoodId : healthiestLeaseIndex === 1 ? B.neighbourhoodName || B.neighbourhoodId : C.neighbourhoodName || C.neighbourhoodId
  
  // School pressure comparison
  const spis = [
    spiA?.spi ?? 50,
    spiB?.spi ?? 50,
    spiC?.spi ?? 50,
  ]
  const lowestSPIIndex = spis.indexOf(Math.min(...spis))
  const lowestSPITown = lowestSPIIndex === 0 ? A.neighbourhoodName || A.neighbourhoodId : lowestSPIIndex === 1 ? B.neighbourhoodName || B.neighbourhoodId : C.neighbourhoodName || C.neighbourhoodId
  
  // Time burden comparison
  const timeBurdens = [timeBurdenA, timeBurdenB, timeBurdenC]
  const burdenLevels = { low: 1, medium: 2, high: 3 }
  const burdenScores = timeBurdens.map(tb => burdenLevels[tb])
  const lowestBurdenIndex = burdenScores.indexOf(Math.min(...burdenScores))
  const lowestBurdenTown = lowestBurdenIndex === 0 ? A.neighbourhoodName || A.neighbourhoodId : lowestBurdenIndex === 1 ? B.neighbourhoodName || B.neighbourhoodId : C.neighbourhoodName || C.neighbourhoodId
  
  // Assign tendencies based on strengths (no ranking, just suitability)
  if (A.neighbourhoodName || A.neighbourhoodId === cheapestTown) {
    tendencies.neighbourhoodA = 'Best affordability & flexibility'
  } else if ((A.neighbourhoodName || A.neighbourhoodId) === healthiestLeaseTown) {
    tendencies.neighbourhoodA = 'Strongest lease safety'
  } else if ((A.neighbourhoodName || A.neighbourhoodId) === lowestSPITown) {
    tendencies.neighbourhoodA = 'Lowest school pressure'
  } else {
    tendencies.neighbourhoodA = 'Balanced option'
  }
  
  if ((B.neighbourhoodName || B.neighbourhoodId) === cheapestTown) {
    tendencies.neighbourhoodB = 'Best affordability & flexibility'
  } else if ((B.neighbourhoodName || B.neighbourhoodId) === healthiestLeaseTown) {
    tendencies.neighbourhoodB = 'Strongest lease safety'
  } else if ((B.neighbourhoodName || B.neighbourhoodId) === lowestSPITown) {
    tendencies.neighbourhoodB = 'Lowest school pressure'
  } else {
    tendencies.neighbourhoodB = 'Most balanced long-term option'
  }
  
  if ((C.neighbourhoodName || C.neighbourhoodId) === cheapestTown) {
    tendencies.neighbourhoodC = 'Best affordability & flexibility'
  } else if ((C.neighbourhoodName || C.neighbourhoodId) === healthiestLeaseTown) {
    tendencies.neighbourhoodC = 'Strongest lease safety'
  } else if ((C.neighbourhoodName || C.neighbourhoodId) === lowestSPITown) {
    tendencies.neighbourhoodC = 'Lowest school pressure'
  } else {
    tendencies.neighbourhoodC = 'Balanced option'
  }
  
  // Key differences (aggregated, not pairwise)
  const keyDifferences: ThreeNeighbourhoodCompareSummary['keyDifferences'] = {
    affordability: `${cheapestTown} has the lowest entry cost`,
    lease: `${healthiestLeaseTown} shows the healthiest lease profile`,
    schoolPressure: `${lowestSPITown} has consistently lower SPI`,
  }
  
  // Add time burden if significant difference
  if (timeBurdens[0] !== timeBurdens[1] || timeBurdens[1] !== timeBurdens[2]) {
    keyDifferences.timeBurden = `${lowestBurdenTown || 'This neighbourhood'} has the lowest daily time burden`
  }
  
  // Recommendation (no winner, just scenarios)
  const recommendation: ThreeNeighbourhoodCompareSummary['recommendation'] = {
    ifLongTerm: planningHorizon === 'long' 
      ? `For long-term planning: ${healthiestLeaseTown} is structurally safer, while ${lowestSPITown} trades stability for lower school pressure.`
      : `If long-term stability matters most, ${healthiestLeaseTown} stands out.`,
    ifAffordability: `If affordability matters more, ${cheapestTown} remains attractive.`,
  }
  
  return {
    planningHorizon,
    overallTendencies: tendencies,
    keyDifferences,
    recommendation,
  }
}

