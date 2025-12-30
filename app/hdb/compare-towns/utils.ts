/**
 * Utility functions for Compare Towns page
 */

import { TownComparisonData, TownProfile } from '@/lib/hdb-data'
import { TownSignals, SuitabilityResult, DecisionGuidance } from './types'

/**
 * Generate signals from raw data
 */
export function generateSignals(
  data: TownComparisonData,
  userBudget: number,
  estimatedMortgage: number,
  islandAvgVolatility: number = 0.12,
  islandAvgVolume: number = 100
): TownSignals {
  // Signal 1: Affordability
  let affordability: 'Comfortable' | 'Stretch' | 'Out of reach'
  if (data.medianPrice <= userBudget * 0.95) {
    affordability = 'Comfortable'
  } else if (data.medianPrice <= userBudget) {
    affordability = 'Stretch'
  } else {
    affordability = 'Out of reach'
  }

  // Signal 2: Cash Flow Advantage
  let cashflow: 'Strong buy advantage' | 'Buy advantage' | 'Rent competitive'
  if (data.medianRent && data.medianRent > estimatedMortgage * 1.2) {
    cashflow = 'Strong buy advantage'
  } else if (data.medianRent && data.medianRent > estimatedMortgage) {
    cashflow = 'Buy advantage'
  } else {
    cashflow = 'Rent competitive'
  }

  // Signal 3: Lease Risk
  let leaseRisk: 'High' | 'Moderate' | 'Low'
  if (data.medianLeaseYears < 60) {
    leaseRisk = 'High'
  } else if (data.medianLeaseYears < 70) {
    leaseRisk = 'Moderate'
  } else {
    leaseRisk = 'Low'
  }
  
  // Correction: Market-wide risk
  if (data.pctBelow55Years > 50) {
    leaseRisk = 'High'
  }

  // Signal 4: Market Stability
  let stability: 'Fragile' | 'Volatile' | 'Stable'
  if (data.priceVolatility > islandAvgVolatility && data.txCount < islandAvgVolume) {
    stability = 'Fragile'
  } else if (data.priceVolatility > islandAvgVolatility) {
    stability = 'Volatile'
  } else {
    stability = 'Stable'
  }

  // Signal 5: Value Profile
  let valueProfile: 'Early discount' | 'Stable pricing' | 'Premium growth'
  if (data.medianLeaseYears < 60) {
    valueProfile = 'Early discount'
  } else if (data.medianLeaseYears < 70) {
    valueProfile = 'Stable pricing'
  } else {
    valueProfile = 'Premium growth'
  }

  return {
    affordability,
    cashflow,
    leaseRisk,
    stability,
    valueProfile
  }
}

/**
 * Generate summary from signals (template-based)
 */
export function generateSummaryFromSignals(
  townA: string,
  townB: string,
  signalsA: TownSignals,
  signalsB: TownSignals
): string[] {
  const bullets: string[] = []
  
  // Entry cost from affordability signal
  if (signalsA.affordability === 'Comfortable' && signalsB.affordability !== 'Comfortable') {
    bullets.push(`Entry cost: ${townA} lower, ${townB} slightly higher`)
  } else if (signalsB.affordability === 'Comfortable' && signalsA.affordability !== 'Comfortable') {
    bullets.push(`Entry cost: ${townB} lower, ${townA} slightly higher`)
  } else {
    bullets.push(`Entry cost: Similar price points`)
  }
  
  // Lease profile from lease risk signal
  if (signalsA.leaseRisk === 'High' && signalsB.leaseRisk !== 'High') {
    bullets.push(`Lease profile: ${townA} shorter, ${townB} longer`)
  } else if (signalsB.leaseRisk === 'High' && signalsA.leaseRisk !== 'High') {
    bullets.push(`Lease profile: ${townB} shorter, ${townA} longer`)
  } else {
    bullets.push(`Lease profile: Similar remaining lease`)
  }
  
  // Market stability from stability signal
  if (signalsA.stability === 'Fragile' || signalsA.stability === 'Volatile') {
    if (signalsB.stability === 'Stable') {
      bullets.push(`Market stability: ${townA} more volatile, ${townB} more stable`)
    } else {
      bullets.push(`Market stability: ${townA} more volatile, ${townB} moderate`)
    }
  } else if (signalsB.stability === 'Fragile' || signalsB.stability === 'Volatile') {
    bullets.push(`Market stability: ${townB} more volatile, ${townA} more stable`)
  } else {
    bullets.push(`Market stability: Similar transaction volume`)
  }
  
  return bullets
}

/**
 * Generate automatic summary as structured bullets (legacy function, kept for compatibility)
 */
export function generateSummary(
  townA: TownComparisonData,
  townB: TownComparisonData,
  mortgageA: number,
  mortgageB: number
): string[] {
  const priceDiff = Math.abs(townA.medianPrice - townB.medianPrice) / Math.min(townA.medianPrice, townB.medianPrice)
  const bullets: string[] = []
  
  // Entry cost bullet
  if (townA.medianPrice < townB.medianPrice && priceDiff > 0.03) {
    bullets.push(`Entry cost: ${townA.town} lower, ${townB.town} slightly higher`)
  } else if (townB.medianPrice < townA.medianPrice && priceDiff > 0.03) {
    bullets.push(`Entry cost: ${townB.town} lower, ${townA.town} slightly higher`)
  } else {
    bullets.push(`Entry cost: Similar price points`)
  }
  
  // Lease profile bullet
  if (townA.medianLeaseYears < townB.medianLeaseYears - 5) {
    bullets.push(`Lease profile: ${townA.town} shorter, ${townB.town} longer`)
  } else if (townB.medianLeaseYears < townA.medianLeaseYears - 5) {
    bullets.push(`Lease profile: ${townB.town} shorter, ${townA.town} longer`)
  } else {
    bullets.push(`Lease profile: Similar remaining lease`)
  }
  
  // Market stability bullet
  if (townA.priceVolatility > townB.priceVolatility * 1.2) {
    bullets.push(`Market stability: ${townA.town} more volatile, ${townB.town} more stable`)
  } else if (townB.priceVolatility > townA.priceVolatility * 1.2) {
    bullets.push(`Market stability: ${townB.town} more volatile, ${townA.town} more stable`)
  } else {
    if (townA.txCount > townB.txCount * 1.2) {
      bullets.push(`Market stability: ${townA.town} higher liquidity, ${townB.town} moderate`)
    } else if (townB.txCount > townA.txCount * 1.2) {
      bullets.push(`Market stability: ${townB.town} higher liquidity, ${townA.town} moderate`)
    } else {
      bullets.push(`Market stability: Similar transaction volume`)
    }
  }
  
  return bullets
}

/**
 * Generate "Who this suits" and "Who should avoid" from TownProfile
 */
export function generateSuitabilityFromProfile(
  profile: TownProfile,
  townName: string
): SuitabilityResult {
  const suits: string[] = []
  const avoids: string[] = []
  
  // Based on cashflow
  if (profile.rentBuyGapMonthly > 0) {
    suits.push('Buyers prioritizing cash flow advantage')
  }
  
  // Based on lease risk
  if (profile.signals.leaseRisk === 'high' || profile.signals.leaseRisk === 'critical') {
    suits.push('Households planning shorter holding periods')
    avoids.push('Buyers relying on future resale')
    avoids.push('Buyers sensitive to lease-related financing risk')
  } else {
    suits.push('Buyers planning long-term ownership')
  }
  
  // Based on stability
  if (profile.signals.stability === 'stable') {
    suits.push('Buyers valuing resale stability')
  } else if (profile.signals.stability === 'fragile') {
    avoids.push('Buyers needing quick resale flexibility')
  }
  
  // Default if no specific signals
  if (suits.length === 0) {
    suits.push('Buyers with specific preferences')
  }
  
  return { suits, avoids }
}

/**
 * Generate decision hint from TownProfiles
 */
export function generateDecisionHintFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile
): string[] {
  const hints: string[] = []
  
  // Rule: If lease risk is High → mark lease risk
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical' ||
      profileB.signals.leaseRisk === 'high' || profileB.signals.leaseRisk === 'critical') {
    hints.push('If you plan to stay long-term (15+ years), lease profile matters more than entry price.')
  }
  
  // Rule: If volatility high → mark upgrade risk
  if (profileA.signals.stability === 'volatile' || profileA.signals.stability === 'fragile' || 
      profileB.signals.stability === 'volatile' || profileB.signals.stability === 'fragile') {
    hints.push('If you plan to upgrade or move again, market liquidity matters more.')
  }
  
  // Rule: If rent > mortgage → emphasize ownership advantage
  if (profileA.rentBuyGapMonthly > 0 || profileB.rentBuyGapMonthly > 0) {
    hints.push('With rents exceeding mortgage payments, buying builds equity while renting does not.')
  }
  
  // Default hint if no specific rules match
  if (hints.length === 0) {
    hints.push('Consider your timeline: longer stays favor lease security, shorter stays favor liquidity.')
  }
  
  return hints
}

/**
 * Generate decision verdict from TownProfiles
 */
export function generateDecisionVerdictFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile
): string | null {
  // More balanced long-term option
  if ((profileA.rentBuyGapMonthly > 0 && profileA.signals.leaseRisk !== 'high' && profileA.signals.leaseRisk !== 'critical') ||
      (profileB.rentBuyGapMonthly > 0 && profileB.signals.leaseRisk !== 'high' && profileB.signals.leaseRisk !== 'critical')) {
    return 'More balanced long-term option'
  }
  
  // Affordability-driven, higher long-term risk
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical' ||
      profileB.signals.leaseRisk === 'high' || profileB.signals.leaseRisk === 'critical') {
    return 'Affordability-driven, higher long-term risk'
  }
  
  return null
}

/**
 * Generate decision hint from signals
 */
export function generateDecisionHint(
  signalsA: TownSignals,
  signalsB: TownSignals
): string[] {
  const hints: string[] = []
  
  // Rule: If lease risk is High → mark lease risk
  if (signalsA.leaseRisk === 'High' || signalsB.leaseRisk === 'High') {
    hints.push('If you plan to stay long-term (15+ years), lease profile matters more than entry price.')
  }
  
  // Rule: If volatility high → mark upgrade risk
  if (signalsA.stability === 'Volatile' || signalsA.stability === 'Fragile' || 
      signalsB.stability === 'Volatile' || signalsB.stability === 'Fragile') {
    hints.push('If you plan to upgrade or move again, market liquidity matters more.')
  }
  
  // Rule: If rent > mortgage → emphasize ownership advantage
  if (signalsA.cashflow === 'Strong buy advantage' || signalsA.cashflow === 'Buy advantage' ||
      signalsB.cashflow === 'Strong buy advantage' || signalsB.cashflow === 'Buy advantage') {
    hints.push('With rents exceeding mortgage payments, buying builds equity while renting does not.')
  }
  
  // Default hint if no specific rules match
  if (hints.length === 0) {
    hints.push('Consider your timeline: longer stays favor lease security, shorter stays favor liquidity.')
  }
  
  return hints
}

/**
 * Generate decision verdict from signals
 */
export function generateDecisionVerdict(
  signalsA: TownSignals,
  signalsB: TownSignals
): string | null {
  // More balanced long-term option
  if ((signalsA.cashflow === 'Strong buy advantage' && signalsA.leaseRisk !== 'High') ||
      (signalsB.cashflow === 'Strong buy advantage' && signalsB.leaseRisk !== 'High')) {
    return 'More balanced long-term option'
  }
  
  // Affordability-driven, higher long-term risk
  if (signalsA.leaseRisk === 'High' || signalsB.leaseRisk === 'High') {
    return 'Affordability-driven, higher long-term risk'
  }
  
  return null
}

/**
 * Generate decision guidance from TownProfiles
 */
export function generateDecisionGuidanceFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile,
  townA: string,
  townB: string
): DecisionGuidance {
  const chooseAParts: string[] = []
  const chooseBParts: string[] = []
  
  // Town A advantages
  if (profileA.medianResalePrice < profileB.medianResalePrice) {
    chooseAParts.push('lower upfront cost')
  }
  if (profileA.volumeRecent > profileB.volumeRecent * 1.2) {
    chooseAParts.push('higher liquidity')
  }
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical') {
    chooseAParts.push('comfortable with lease trade-offs')
  }
  if (profileA.rentBuyGapMonthly > profileB.rentBuyGapMonthly) {
    chooseAParts.push('stronger cash flow advantage')
  }
  
  // Town B advantages
  if (profileB.medianRemainingLease > profileA.medianRemainingLease + 5) {
    chooseBParts.push('longer remaining leases')
  }
  if (profileB.volatility12m < profileA.volatility12m * 0.8) {
    chooseBParts.push('more stable long-term ownership')
  }
  if (profileB.signals.leaseRisk === 'low' || profileB.signals.leaseRisk === 'moderate') {
    chooseBParts.push('healthier lease profile')
  }
  if (profileB.medianResalePrice > profileA.medianResalePrice) {
    chooseBParts.push('at a slightly higher cost')
  }
  
  return {
    chooseA: chooseAParts.length > 0 
      ? `Choose ${townA} if you prioritize ${chooseAParts.join(' and ')}.`
      : `Choose ${townA} based on your specific preferences.`,
    chooseB: chooseBParts.length > 0
      ? `Choose ${townB} if you value ${chooseBParts.join(' and ')}.`
      : `Choose ${townB} based on your specific preferences.`,
    conclusion: 'There is no universally better town — only a better fit for your situation.'
  }
}

