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
import { getAggregatedMonthly, getMedianRent, getTownTimeAccess } from './fetch'
import { getTownTransportProfile } from './transport-data'
import type { TownProfile, TownComparisonData, CompareSummary, PreferenceLens, TownTimeAccess, ThreeTownCompareSummary } from './types'
import { getTimeBurdenLevel, calculateTBI, getTBILevel } from './types'

// Generate standardized scores (0-100) for each dimension
function generateStandardizedScores(
  A: TownProfile,
  B: TownProfile,
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
  
  // Cash flow: higher rent-buy gap is better
  const maxGap = Math.max(Math.abs(A.rentBuyGapMonthly), Math.abs(B.rentBuyGapMonthly), 1)
  const cashFlowA = A.rentBuyGapMonthly > 0 ? Math.min(100, (A.rentBuyGapMonthly / maxGap) * 100) : 0
  const cashFlowB = B.rentBuyGapMonthly > 0 ? Math.min(100, (B.rentBuyGapMonthly / maxGap) * 100) : 0
  
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
    townA: {
      entryCost: Math.round(entryCostA),
      cashFlow: Math.round(cashFlowA),
      leaseSafety: Math.round(leaseSafetyA),
      schoolPressure: Math.round(schoolPressureA),
      stability: Math.round(stabilityA),
      overall: 0 // Will be calculated based on lens
    },
    townB: {
      entryCost: Math.round(entryCostB),
      cashFlow: Math.round(cashFlowB),
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
  let baseWeights: { entryCost: number; cashFlow: number; leaseSafety: number; schoolPressure: number; stability: number }
  
  if (lens === 'lower_cost') {
    baseWeights = { entryCost: 0.45, cashFlow: 0.20, leaseSafety: 0.20, schoolPressure: 0.10, stability: 0.05 }
  } else if (lens === 'lease_safety') {
    baseWeights = { entryCost: 0.15, cashFlow: 0.10, leaseSafety: 0.45, schoolPressure: 0.10, stability: 0.20 }
  } else if (lens === 'school_pressure') {
    baseWeights = { entryCost: 0.15, cashFlow: 0.10, leaseSafety: 0.10, schoolPressure: 0.45, stability: 0.20 }
  } else { // balanced
    baseWeights = { entryCost: 0.25, cashFlow: 0.20, leaseSafety: 0.25, schoolPressure: 0.20, stability: 0.10 }
  }
  
  // Adjust for long-term holding (legacy, keep for backward compatibility)
  if (longTerm && planningHorizon === 'medium') {
    baseWeights.leaseSafety += 0.10
    baseWeights.entryCost -= 0.05
    baseWeights.cashFlow -= 0.05
  }
  
  // Reorder weights based on Planning Horizon priority
  // Priority order determines weight redistribution (keeping total = 1.0)
  let weights: { entryCost: number; cashFlow: number; leaseSafety: number; schoolPressure: number; stability: number }
  
  if (planningHorizon === 'short') {
    // Short-term: Entry cost, Cash flow, School pressure, Lease, Time burden (stability)
    weights = {
      entryCost: baseWeights.entryCost * 1.2 + 0.10,  // Boost entry cost
      cashFlow: baseWeights.cashFlow * 1.2 + 0.05,    // Boost cash flow
      schoolPressure: baseWeights.schoolPressure * 1.1,
      leaseSafety: baseWeights.leaseSafety * 0.7,     // Reduce lease importance
      stability: baseWeights.stability * 0.8
    }
  } else if (planningHorizon === 'long') {
    // Long-term: Lease, Time burden (stability), School pressure, Entry cost, Cash flow
    weights = {
      leaseSafety: baseWeights.leaseSafety * 1.3 + 0.15,  // Boost lease
      stability: baseWeights.stability * 1.5 + 0.10,       // Boost time burden (via stability)
      schoolPressure: baseWeights.schoolPressure * 1.0,
      entryCost: baseWeights.entryCost * 0.7,             // Reduce entry cost importance
      cashFlow: baseWeights.cashFlow * 0.7                 // Reduce cash flow importance
    }
  } else {
    // Medium-term: Entry cost, Lease, School pressure, Time burden, Cash flow
    weights = {
      entryCost: baseWeights.entryCost * 1.1,
      leaseSafety: baseWeights.leaseSafety * 1.1,
      schoolPressure: baseWeights.schoolPressure * 1.0,
      stability: baseWeights.stability * 1.2,
      cashFlow: baseWeights.cashFlow * 0.9
    }
  }
  
  // Normalize weights to sum to 1.0
  const total = weights.entryCost + weights.cashFlow + weights.leaseSafety + weights.schoolPressure + weights.stability
  if (total > 0) {
    weights.entryCost /= total
    weights.cashFlow /= total
    weights.leaseSafety /= total
    weights.schoolPressure /= total
    weights.stability /= total
  }
  
  // Calculate overall scores
  const overallA = 
    scores.townA.entryCost * weights.entryCost +
    scores.townA.cashFlow * weights.cashFlow +
    scores.townA.leaseSafety * weights.leaseSafety +
    scores.townA.schoolPressure * weights.schoolPressure +
    scores.townA.stability * weights.stability
  
  const overallB = 
    scores.townB.entryCost * weights.entryCost +
    scores.townB.cashFlow * weights.cashFlow +
    scores.townB.leaseSafety * weights.leaseSafety +
    scores.townB.schoolPressure * weights.schoolPressure +
    scores.townB.stability * weights.stability
  
  return {
    townA: { ...scores.townA, overall: Math.round(overallA) },
    townB: { ...scores.townB, overall: Math.round(overallB) }
  }
}

// Generate Compare Summary from Town Profiles (Fixed 5-block structure)
export async function generateCompareSummary(
  A: TownProfile,
  B: TownProfile,
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
    deltaRentGap: B.rentBuyGapMonthly - A.rentBuyGapMonthly,  // B - A (positive = B better cash flow = better)
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
      headlineVerdict = `${A.town} offers significantly lower primary school pressure than ${B.town}.`
    } else {
      headlineVerdict = `${B.town} offers significantly lower primary school pressure than ${A.town}.`
    }
  } else if (spiA && spiB) {
    // Education pressure is similar
    headlineVerdict = `Both towns face similar levels of primary school competition.`
  } else if (spiA || spiB) {
    // Only one town has SPI data
    const availableTown = spiA ? A.town : B.town
    headlineVerdict = `Primary school pressure data is available for ${availableTown}, but not for ${spiA ? B.town : A.town}.`
  } else {
    // No SPI data - fallback to price/lease
    if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
      headlineVerdict = priceDiff > 0 
        ? `${A.town} commands higher entry prices than ${B.town}.`
        : `${B.town} commands higher entry prices than ${A.town}.`
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
    getTownTimeAccess(A.town),
    getTownTimeAccess(B.town),
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
    
    // Time burden change (Phase 2 v1: only add to tradeoffs, not scoring)
    if (timeAccessA && timeAccessB) {
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
    
    // Monthly affordability (rent vs buy gap)
    if (A.medianRent && B.medianRent) {
      const rentGapDiff = B.rentBuyGapMonthly - A.rentBuyGapMonthly
      if (Math.abs(rentGapDiff) < 200) {
        changes.push('💰 Similar monthly affordability')
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
    const comparison = `Primary school pressure:\n• ${A.town}: SPI ${spiA.spi} (${getSPILabel(spiA.level)})\n• ${B.town}: SPI ${spiB.spi} (${getSPILabel(spiB.level)})`
    
    let explanation = ''
    if (spiDiff >= SPI_SIGNIFICANT) {
      explanation = `Families in ${A.town} face more concentrated competition and fewer lower-risk options.`
    } else if (spiDiff <= -SPI_SIGNIFICANT) {
      explanation = `${A.town} offers a wider range of lower-pressure school options.`
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
    const availableTown = spiA ? A.town : B.town
    const availableSPI = spiA || spiB!
    const comparison = `Primary school pressure:\n• ${availableTown}: SPI ${availableSPI.spi} (${getSPILabel(availableSPI.level)})\n• ${spiA ? B.town : A.town}: Data not available`
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
      ? `Entry cost is higher in ${A.town}.`
      : `Entry cost is lower in ${A.town}.`
  }
  
  if (Math.abs(leaseDiff) >= LEASE_SIGNIFICANT) {
    housingTradeoff.lease = leaseDiff > 0
      ? `Remaining lease is healthier in ${A.town}.`
      : `Remaining lease is healthier in ${B.town}.`
  }
  
  // ============================================
  // Block 4: Who Each Town Is Better For
  // ============================================
  const bestSuitedFor: CompareSummary['bestSuitedFor'] = {
    townA: [],
    townB: []
  }
  
  // Education pressure tags
  if (spiA && spiB) {
    if (spiDiff < -SPI_SIGNIFICANT) {
      bestSuitedFor.townA.push('Families prioritizing lower primary school pressure')
    }
    if (spiDiff > SPI_SIGNIFICANT) {
      bestSuitedFor.townB.push('Families prioritizing lower primary school pressure')
    }
  }
  
  // Price tags
  if (priceDiff < -PRICE_SIGNIFICANT) {
    bestSuitedFor.townA.push('Buyers prioritizing lower upfront cost')
  }
  if (priceDiff > PRICE_SIGNIFICANT) {
    bestSuitedFor.townB.push('Buyers prioritizing lower upfront cost')
  }
  
  // Lease tags
  if (leaseDiff > LEASE_SIGNIFICANT) {
    bestSuitedFor.townA.push('Long-term owners valuing lease security')
  }
  if (leaseDiff < -LEASE_SIGNIFICANT) {
    bestSuitedFor.townB.push('Long-term owners valuing lease security')
  }
  
  // Additional tags for buyers less sensitive to school competition
  if (spiA && spiB) {
    if (spiDiff > SPI_SIGNIFICANT) {
      bestSuitedFor.townB.push('Buyers less sensitive to school competition')
    }
    if (spiDiff < -SPI_SIGNIFICANT) {
      bestSuitedFor.townA.push('Buyers less sensitive to school competition')
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
    const fromTown = A.town
    const toTown = B.town
    
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
    const transportProfileA = getTownTransportProfile(A.town)
    const transportProfileB = getTownTransportProfile(B.town)
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
      movingPhrase = `Moving from ${fromTown} to ${toTown} ${parts.join(', but ')}.`
    }
  }
  
  // ============================================
  // Generate Time & Access Moving Impact (using TBI)
  // ============================================
  let timeAccessMovingImpact: string | null = null
  const transportProfileA = getTownTransportProfile(A.town)
  const transportProfileB = getTownTransportProfile(B.town)
  
  if (transportProfileA && transportProfileB) {
    const tbiA = calculateTBI(transportProfileA)
    const tbiB = calculateTBI(transportProfileB)
    const tbiDiff = tbiB - tbiA
    
    if (Math.abs(tbiDiff) >= 5) {
      if (tbiDiff > 0) {
        if (planningHorizon === 'long') {
          timeAccessMovingImpact = `Moving to ${B.town} increases daily time burden, which compounds over long holding periods.`
        } else {
          timeAccessMovingImpact = `Likely increases daily commuting time`
        }
      } else {
        if (planningHorizon === 'long') {
          timeAccessMovingImpact = `Moving to ${B.town} reduces daily time burden, improving long-term commute sustainability.`
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
    const overallDiff = scoresWithOverall.townB.overall - scoresWithOverall.townA.overall
    const winner = overallDiff > 0 ? B.town : A.town
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
    
    // Generate exactly 3 trade-off bullets (fixed template)
    const tradeoffs: string[] = []
    
    // Always show 3 bullets: Entry cost, Lease profile, School pressure
    // 1. Entry cost
    const cheaper = metrics.deltaPrice > 0 ? B.town : A.town
    const priceDiff = Math.abs(metrics.deltaPrice)
    if (priceDiff >= 1000) {
      const priceDiffK = Math.round(priceDiff / 1000)
      tradeoffs.push(`Entry cost: ${cheaper} is lower by ~S$${priceDiffK}k`)
    } else if (priceDiff > 0) {
      tradeoffs.push(`Entry cost: ${cheaper} is lower by ~S$${Math.round(priceDiff)}`)
    } else {
      tradeoffs.push(`Entry cost: Both towns have similar entry prices`)
    }
    
    // 2. Lease profile (lifecycle-aware phrasing)
    const healthier = metrics.deltaLeaseYears > 0 ? B.town : A.town
    const shorter = metrics.deltaLeaseYears < 0 ? B.town : A.town
    const leaseDiff = Math.abs(metrics.deltaLeaseYears)
    if (leaseDiff >= 1) {
      if (planningHorizon === 'short') {
        tradeoffs.push(`Lease profile: Lease decay is less critical over a short holding period. ${healthier} has ~${Math.round(leaseDiff)} more remaining years.`)
      } else if (planningHorizon === 'long') {
        tradeoffs.push(`Lease profile: ${shorter} has shorter remaining lease (~${Math.round(leaseDiff)} years less), which significantly limits long-term flexibility.`)
      } else {
        tradeoffs.push(`Lease profile: ${healthier} has ~${Math.round(leaseDiff)} more remaining years`)
      }
    } else {
      tradeoffs.push(`Lease profile: Both towns have similar remaining lease`)
    }
    
    // 3. School pressure
    if (spiA && spiB) {
      const spiChange = metrics.deltaSPI
      const spiChangeAbs = Math.abs(spiChange)
      const finalLevel = spiChange > 0 ? spiB.level : spiA.level
      const levelText = finalLevel === 'low' ? 'still Low' : finalLevel === 'medium' ? 'Moderate' : 'High'
      const direction = spiChange > 0 ? 'decreases' : 'increases'
      if (spiChangeAbs > 0.1) {
        tradeoffs.push(`School pressure: Moving ${direction} SPI by +${spiChangeAbs.toFixed(1)} (${levelText})`)
      } else {
        tradeoffs.push(`School pressure: Similar pressure levels (${levelText})`)
      }
    } else {
      tradeoffs.push(`School pressure: Data not available for comparison`)
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
    
    recommendation = { headline, tradeoffs: tradeoffs.slice(0, 3), confidence }
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
        recommendation.headline = `Choose ${A.town} if you prioritise significantly lower primary school pressure.`
      } else {
        recommendation.headline = `Choose ${B.town} if you prioritise significantly lower primary school pressure.`
      }
    } else if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MINOR && spiChangeAbs <= COMPARISON_THRESHOLDS.SPI_MODERATE) {
      // Write as trade-off
      if (movingEducationImpact.spiChange < 0) {
        recommendation.headline = `Choose ${A.town} for lower school pressure, but consider trade-offs with price and lease.`
      } else {
        recommendation.headline = `Choose ${B.town} for lower school pressure, but consider trade-offs with price and lease.`
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
        const lowerSPI = spiChange < 0 ? A.town : B.town
        const diff = spiChangeAbs
        const level = (spiChange < 0 ? spiA : spiB)?.level
        const levelText = level === 'low' ? 'still Low' : level === 'medium' ? 'Moderate' : 'High'
        recommendation.tradeoffs.push(`🎓 School: Moving to ${lowerSPI === A.town ? B.town : A.town} ${spiChange < 0 ? 'decreases' : 'increases'} SPI by +${diff.toFixed(1)} (${levelText})`)
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
    townA: bestSuitedFor.townA,
    townB: bestSuitedFor.townB
  }
  
  const beCautious = {
    townA: [] as string[],
    townB: [] as string[]
  }
  
  // Badges
  if (A.signals.leaseRisk === 'high' || A.signals.leaseRisk === 'critical')
    badges.push({ town: 'A', label: A.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ town: 'A', label: 'Lease healthier', tone: 'good' })

  if (B.signals.leaseRisk === 'high' || B.signals.leaseRisk === 'critical')
    badges.push({ town: 'B', label: B.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ town: 'B', label: 'Lease healthier', tone: 'good' })

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
      townA: timeAccessA,
      townB: timeAccessB,
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
      rentBuyGapA: A.rentBuyGapMonthly,
      rentBuyGapB: B.rentBuyGapMonthly,
      stabilityA: A.signals.stability,
      stabilityB: B.signals.stability,
      leaseRiskReasonsA: A.signals.leaseSignalReasons,
      leaseRiskReasonsB: B.signals.leaseSignalReasons,
    },
    badges,
  }
}

export async function getTownComparisonData(
  town: string,
  flatType: string,
  months: number = 12
): Promise<TownComparisonData | null> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Get aggregated monthly data
    const data = await getAggregatedMonthly(
      flatType,
      town,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
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

    // Get median rent
    const medianRent = await getMedianRent(town, flatType, 6)

    return {
      town,
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
      medianRent,
      medianPricePerSqm: pricesPerSqm.length > 0
        ? pricesPerSqm.sort((a, b) => a - b)[Math.floor(pricesPerSqm.length / 2)]
        : 0,
    }
  } catch (error) {
    console.error('Error fetching town comparison data:', error)
  }

  return null
}

// Generate 3 Town Compare Summary (no ranking, just suitability)
export async function generateThreeTownCompareSummary(
  A: TownProfile,
  B: TownProfile,
  C: TownProfile,
  spiA?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiB?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiC?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  landscapeA?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeB?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeC?: { schoolCount: number; highDemandSchools: number } | null,
  planningHorizon: 'short' | 'medium' | 'long' = 'medium'
): Promise<ThreeTownCompareSummary> {
  // Fetch Time & Access data for all 3 towns
  const [timeAccessA, timeAccessB, timeAccessC] = await Promise.all([
    getTownTimeAccess(A.town),
    getTownTimeAccess(B.town),
    getTownTimeAccess(C.town),
  ])
  
  const timeBurdenA = getTimeBurdenLevel(timeAccessA)
  const timeBurdenB = getTimeBurdenLevel(timeAccessB)
  const timeBurdenC = getTimeBurdenLevel(timeAccessC)
  
  // Determine overall tendencies (no ranking, just "who is better for what")
  const tendencies = {
    townA: '',
    townB: '',
    townC: '',
  }
  
  // Affordability comparison
  const prices = [A.medianResalePrice, B.medianResalePrice, C.medianResalePrice]
  const cheapestIndex = prices.indexOf(Math.min(...prices))
  const cheapestTown = cheapestIndex === 0 ? A.town : cheapestIndex === 1 ? B.town : C.town
  
  // Lease comparison
  const leases = [A.medianRemainingLease, B.medianRemainingLease, C.medianRemainingLease]
  const healthiestLeaseIndex = leases.indexOf(Math.max(...leases))
  const healthiestLeaseTown = healthiestLeaseIndex === 0 ? A.town : healthiestLeaseIndex === 1 ? B.town : C.town
  
  // School pressure comparison
  const spis = [
    spiA?.spi ?? 50,
    spiB?.spi ?? 50,
    spiC?.spi ?? 50,
  ]
  const lowestSPIIndex = spis.indexOf(Math.min(...spis))
  const lowestSPITown = lowestSPIIndex === 0 ? A.town : lowestSPIIndex === 1 ? B.town : C.town
  
  // Time burden comparison
  const timeBurdens = [timeBurdenA, timeBurdenB, timeBurdenC]
  const burdenLevels = { low: 1, medium: 2, high: 3 }
  const burdenScores = timeBurdens.map(tb => burdenLevels[tb])
  const lowestBurdenIndex = burdenScores.indexOf(Math.min(...burdenScores))
  const lowestBurdenTown = lowestBurdenIndex === 0 ? A.town : lowestBurdenIndex === 1 ? B.town : C.town
  
  // Assign tendencies based on strengths (no ranking, just suitability)
  if (A.town === cheapestTown) {
    tendencies.townA = 'Best affordability & flexibility'
  } else if (A.town === healthiestLeaseTown) {
    tendencies.townA = 'Strongest lease safety'
  } else if (A.town === lowestSPITown) {
    tendencies.townA = 'Lowest school pressure'
  } else {
    tendencies.townA = 'Balanced option'
  }
  
  if (B.town === cheapestTown) {
    tendencies.townB = 'Best affordability & flexibility'
  } else if (B.town === healthiestLeaseTown) {
    tendencies.townB = 'Strongest lease safety'
  } else if (B.town === lowestSPITown) {
    tendencies.townB = 'Lowest school pressure'
  } else {
    tendencies.townB = 'Most balanced long-term option'
  }
  
  if (C.town === cheapestTown) {
    tendencies.townC = 'Best affordability & flexibility'
  } else if (C.town === healthiestLeaseTown) {
    tendencies.townC = 'Strongest lease safety'
  } else if (C.town === lowestSPITown) {
    tendencies.townC = 'Lowest school pressure'
  } else {
    tendencies.townC = 'Balanced option'
  }
  
  // Key differences (aggregated, not pairwise)
  const keyDifferences: ThreeTownCompareSummary['keyDifferences'] = {
    affordability: `${cheapestTown} has the lowest entry cost`,
    lease: `${healthiestLeaseTown} shows the healthiest lease profile`,
    schoolPressure: `${lowestSPITown} has consistently lower SPI`,
  }
  
  // Add time burden if significant difference
  if (timeBurdens[0] !== timeBurdens[1] || timeBurdens[1] !== timeBurdens[2]) {
    keyDifferences.timeBurden = `${lowestBurdenTown} has the lowest daily time burden`
  }
  
  // Recommendation (no winner, just scenarios)
  const recommendation: ThreeTownCompareSummary['recommendation'] = {
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

