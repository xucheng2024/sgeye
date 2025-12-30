/**
 * Town Profile generation functions
 */

import { supabase } from '../supabase'
import { DATA_FETCHING, FINANCIAL_CONSTANTS, LEASE_THRESHOLDS, MARKET_THRESHOLDS } from '../constants'
import { getAggregatedMonthly } from './fetch'
import { getMedianRent } from './fetch'
import { calculateMonthlyMortgage, computeLeaseRisk } from './calculations'
import type { TownProfile } from './types'

// Get Town Profile with signals (new unified API)
export async function getTownProfile(
  town: string,
  flatType: string,
  months: number = DATA_FETCHING.DEFAULT_MONTHS, // Use default months for decision tool
  loanYears: number = FINANCIAL_CONSTANTS.DEFAULT_LOAN_YEARS,
  interestRate: number = FINANCIAL_CONSTANTS.DEFAULT_INTEREST_RATE
): Promise<TownProfile | null> {
  try {
    if (supabase) {
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

      // Calculate lease statistics from monthly aggregated data
      // Note: We use median_lease_years from aggregated monthly data
      // For more accurate pctTxBelow60/55, we should ideally query raw transactions
      // But for now, we use the monthly medians as a proxy
      const medianLease = leases.length > 0 
        ? leases.sort((a, b) => a - b)[Math.floor(leases.length / 2)]
        : 0
      
      // For percentage calculations, we approximate using monthly data
      // A more accurate approach would query raw transactions, but this is acceptable for decision tool
      const below60 = leases.filter(l => l < LEASE_THRESHOLDS.HIGH).length
      const below55 = leases.filter(l => l < LEASE_THRESHOLDS.CRITICAL).length
      const pctTxBelow60 = leases.length > 0 ? below60 / leases.length : 0
      const pctTxBelow55 = leases.length > 0 ? below55 / leases.length : 0

      // Get median rent
      const medianRent = await getMedianRent(town, flatType, 6)

      // Calculate mortgage
      const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      const estimatedMortgage = calculateMonthlyMortgage(
        medianPrice * FINANCIAL_CONSTANTS.LTV_RESALE, // LTV for resale flats
        loanYears,
        interestRate
      )

      // Compute lease risk
      const leaseRiskResult = computeLeaseRisk({
        medianRemainingLease: medianLease,
        pctTxBelow60,
        pctTxBelow55,
      })

      // Determine pricing response
      let pricingResponse: 'early_discount' | 'stable' | 'premium'
      if (medianLease < LEASE_THRESHOLDS.HIGH) {
        pricingResponse = 'early_discount'
      } else if (medianLease < LEASE_THRESHOLDS.MODERATE) {
        pricingResponse = 'stable'
      } else {
        pricingResponse = 'premium'
      }

      // Determine stability
      let stability: 'stable' | 'volatile' | 'fragile'
      const totalVolume = data.reduce((sum, d) => sum + d.tx_count, 0)
      if (priceVolatility > MARKET_THRESHOLDS.ISLAND_AVG_VOLATILITY && totalVolume < MARKET_THRESHOLDS.ISLAND_AVG_VOLUME) {
        stability = 'fragile'
      } else if (priceVolatility > MARKET_THRESHOLDS.ISLAND_AVG_VOLATILITY) {
        stability = 'volatile'
      } else {
        stability = 'stable'
      }

      return {
        town,
        flatType,
        medianResalePrice: medianPrice,
        estimatedMonthlyMortgage: estimatedMortgage,
        medianRent,
        rentBuyGapMonthly: medianRent ? medianRent - estimatedMortgage : 0,
        medianRemainingLease: medianLease,
        pctTxBelow60,
        pctTxBelow55,
        volumeRecent: data.reduce((sum, d) => sum + d.tx_count, 0),
        volatility12m: priceVolatility,
        signals: {
          leaseRisk: leaseRiskResult.level,
          leaseSignalReasons: leaseRiskResult.reasons,
          pricingResponse,
          stability,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching town profile:', error)
  }

  return null
}

