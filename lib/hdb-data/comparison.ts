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
import { getAggregatedMonthly, getMedianRent } from './fetch'
import type { TownProfile, TownComparisonData, CompareSummary, PreferenceLens } from './types'

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

// Calculate overall score based on lens weights
function calculateOverallScore(
  scores: CompareSummary['scores'],
  lens: PreferenceLens,
  longTerm: boolean
): CompareSummary['scores'] {
  if (!scores) return null
  
  // Define weights for each lens
  let weights: { entryCost: number; cashFlow: number; leaseSafety: number; schoolPressure: number; stability: number }
  
  if (lens === 'lower_cost') {
    weights = { entryCost: 0.45, cashFlow: 0.20, leaseSafety: 0.20, schoolPressure: 0.10, stability: 0.05 }
  } else if (lens === 'lease_safety') {
    weights = { entryCost: 0.15, cashFlow: 0.10, leaseSafety: 0.45, schoolPressure: 0.10, stability: 0.20 }
  } else if (lens === 'school_pressure') {
    weights = { entryCost: 0.15, cashFlow: 0.10, leaseSafety: 0.10, schoolPressure: 0.45, stability: 0.20 }
  } else { // balanced
    weights = { entryCost: 0.25, cashFlow: 0.20, leaseSafety: 0.25, schoolPressure: 0.20, stability: 0.10 }
  }
  
  // Adjust for long-term holding
  if (longTerm) {
    weights.leaseSafety += 0.10
    weights.entryCost -= 0.05
    weights.cashFlow -= 0.05
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
export function generateCompareSummary(
  A: TownProfile,
  B: TownProfile,
  userBudget?: number,
  spiA?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  spiB?: { spi: number; level: 'low' | 'medium' | 'high' } | null,
  landscapeA?: { schoolCount: number; highDemandSchools: number } | null,
  landscapeB?: { schoolCount: number; highDemandSchools: number } | null,
  lens: PreferenceLens = 'balanced',
  longTerm: boolean = false,
  familyProfile?: FamilyProfile | null
): CompareSummary {
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
  const scoresWithOverall = calculateOverallScore(scores, lens, longTerm)
  
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
  // Block 5: Decision Hint (using Decision Rules)
  // ============================================
  let decisionHint: string = ''
  const preferenceId = preferenceMode.id
  
  // Apply decision hint rules
  for (const condition of SUMMARY_TEXT_RULES.decisionHint.conditions) {
    if (condition.condition === 'preference == long_term' && preferenceId === 'long_term') {
      decisionHint = condition.text
      break
    } else if (condition.condition === 'preference == low_entry && delta_price > 30000' && 
               preferenceId === 'low_entry' && metrics.deltaPrice > COMPARISON_THRESHOLDS.PRICE_SIGNIFICANT) {
      decisionHint = condition.text
      break
    } else if (condition.condition === 'preference == low_school_pressure && abs(delta_spi) >= 8' && 
               preferenceId === 'low_school_pressure' && Math.abs(metrics.deltaSPI) >= COMPARISON_THRESHOLDS.SPI_MODERATE) {
      decisionHint = condition.text
      break
    } else if (condition.condition === 'default') {
      decisionHint = condition.text
    }
  }
  
  // Fallback if no rule matched
  if (!decisionHint) {
    const spiImportance = spiA && spiB ? Math.abs(metrics.deltaSPI) : 0
    const leaseImportance = Math.abs(metrics.deltaLeaseYears)
    
    if (spiImportance > leaseImportance && spiA && spiB) {
      decisionHint = `If primary school pressure matters more to you, location choice may outweigh price differences.`
    } else if (leaseImportance > 0) {
      decisionHint = `If you plan to hold long-term, lease profile may matter more than short-term school pressure.`
    } else {
      decisionHint = `Both options are viable — choose based on your timeline and risk tolerance.`
    }
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
    
    if (parts.length > 0) {
      movingPhrase = `Moving from ${fromTown} to ${toTown} ${parts.join(', but ')}.`
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
    
    // Generate headline using rules (personalized if family profile exists)
    let headline = ''
    const preferenceId = preferenceMode.id
    const overallDiffAbs = Math.abs(overallDiff)
    
    if (ruleProfile && familyProfile) {
      // Personalized headline based on family profile
      const stageDesc = ruleProfile.personalizedContext.stageDescription
      const holdingDesc = ruleProfile.personalizedContext.holdingDescription
      
      if (preferenceId === 'long_term' || familyProfile.costVsValue === 'value') {
        if (metrics.deltaLeaseYears > 0) {
          headline = `For a ${stageDesc.toLowerCase()} planning to stay ${holdingDesc.toLowerCase()}, lease security matters more than upfront price. ${B.town} offers a healthier lease profile, even though entry cost is higher.`
        } else {
          headline = `For a ${stageDesc.toLowerCase()} planning to stay ${holdingDesc.toLowerCase()}, ${A.town} offers better lease security, though entry cost may be higher.`
        }
      } else if (preferenceId === 'low_entry' || familyProfile.costVsValue === 'cost') {
        if (metrics.deltaPrice > 0) {
          headline = `For a ${stageDesc.toLowerCase()} prioritizing lower upfront & monthly cost, ${B.town} offers better affordability, though lease profile may be shorter.`
        } else {
          headline = `For a ${stageDesc.toLowerCase()} prioritizing lower upfront & monthly cost, ${A.town} offers better affordability, though lease profile may be shorter.`
        }
      } else if (preferenceId === 'low_school_pressure' || familyProfile.schoolSensitivity === 'high') {
        if (metrics.deltaSPI > 0) {
          headline = `For a ${stageDesc.toLowerCase()} sensitive to school competition, ${B.town} offers lower primary school pressure, making it a better fit for your priorities.`
        } else {
          headline = `For a ${stageDesc.toLowerCase()} sensitive to school competition, ${A.town} offers lower primary school pressure, making it a better fit for your priorities.`
        }
      } else {
        headline = `For a ${stageDesc.toLowerCase()} planning to stay ${holdingDesc.toLowerCase()}, ${winner} offers a better overall balance for your situation.`
      }
    } else {
      // Fallback to non-personalized headlines
      if (preferenceId === 'balanced') {
        headline = overallDiffAbs > 12
          ? `Choose ${winner} based on balanced factors.`
          : `Both towns are viable — ${winner} has a slight edge.`
      } else if (preferenceId === 'low_entry') {
        headline = metrics.deltaPrice > 0
          ? `Choose ${B.town} if you prioritise lower entry price.`
          : `Choose ${A.town} if you prioritise lower entry price.`
      } else if (preferenceId === 'long_term') {
        headline = metrics.deltaLeaseYears > 0
          ? `Choose ${B.town} if you prioritise long-term lease safety.`
          : `Choose ${A.town} if you prioritise long-term lease safety.`
      } else if (preferenceId === 'low_school_pressure') {
        headline = metrics.deltaSPI > 0
          ? `Choose ${B.town} if you prioritise lower primary school pressure.`
          : `Choose ${A.town} if you prioritise lower primary school pressure.`
      }
    }
    
    // Generate 3 trade-off bullets using rules
    const tradeoffs: string[] = []
    
    // Price tradeoff
    if (Math.abs(metrics.deltaPrice) >= PRICE_SIGNIFICANT) {
      const cheaper = metrics.deltaPrice > 0 ? B.town : A.town
      const diff = Math.abs(metrics.deltaPrice)
      tradeoffs.push(`💰 Upfront: ${cheaper} is cheaper by ~${formatCurrency(diff)}`)
    }
    
    // Lease tradeoff
    if (Math.abs(metrics.deltaLeaseYears) >= LEASE_SIGNIFICANT) {
      const healthier = metrics.deltaLeaseYears > 0 ? B.town : A.town
      const diff = Math.abs(metrics.deltaLeaseYears)
      if (diff >= 20) {
        tradeoffs.push(`🧱 Lease: ${healthier} has significantly healthier lease profile (+${Math.round(diff)} yrs)`)
      } else {
        tradeoffs.push(`🧱 Lease: ${healthier} has healthier lease profile (+${Math.round(diff)} yrs)`)
      }
    }
    
    // School tradeoff (with rules-based messaging)
    if (spiA && spiB) {
      const spiChangeAbs = Math.abs(metrics.deltaSPI)
      const levelChange = spiA.level !== spiB.level
      const finalLevel = metrics.deltaSPI > 0 ? spiB.level : spiA.level
      const levelText = finalLevel === 'low' ? 'still Low' : finalLevel === 'medium' ? 'Moderate' : 'High'
      const direction = metrics.deltaSPI > 0 ? 'decreases' : 'increases'
      const targetTown = metrics.deltaSPI > 0 ? B.town : A.town
      
      if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MODERATE && levelChange) {
        tradeoffs.push(`🎓 School: Moving to ${targetTown} ${direction} SPI significantly (${levelText})`)
      } else if (spiChangeAbs >= COMPARISON_THRESHOLDS.SPI_MINOR) {
        tradeoffs.push(`🎓 School: Moving to ${targetTown} ${direction} SPI slightly (${levelText})`)
      } else if (spiChangeAbs > 0) {
        tradeoffs.push(`🎓 School: School pressure remains similar`)
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
    
    recommendation = { headline, tradeoffs: tradeoffs.slice(0, SCORING_CONSTANTS.MAX_TRADEOFF_BULLETS), confidence }
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

