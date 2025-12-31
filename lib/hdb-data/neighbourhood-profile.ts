/**
 * Neighbourhood Profile generation functions
 */

import { supabase } from '../supabase'
import { DATA_FETCHING, FINANCIAL_CONSTANTS, LEASE_THRESHOLDS, MARKET_THRESHOLDS } from '../constants'
import { getAggregatedMonthly } from './fetch'
import { calculateMonthlyMortgage, computeLeaseRisk } from './calculations'
import type { NeighbourhoodProfile } from './types'

// Get Neighbourhood Profile with signals
export async function getNeighbourhoodProfile(
  neighbourhoodId: string,
  flatType: string,
  months: number = DATA_FETCHING.DEFAULT_MONTHS,
  loanYears: number = FINANCIAL_CONSTANTS.DEFAULT_LOAN_YEARS,
  interestRate: number = FINANCIAL_CONSTANTS.DEFAULT_INTEREST_RATE
): Promise<NeighbourhoodProfile | null> {
  try {
    if (supabase) {
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

      // Get neighbourhood name for display
      const { data: neighbourhood } = await supabase
        .from('neighbourhoods')
        .select('id, name')
        .eq('id', neighbourhoodId)
        .single()

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

      // Calculate lease statistics
      const medianLease = leases.length > 0 
        ? leases.sort((a, b) => a - b)[Math.floor(leases.length / 2)]
        : 0
      
      const below60 = leases.filter(l => l < LEASE_THRESHOLDS.HIGH).length
      const below55 = leases.filter(l => l < LEASE_THRESHOLDS.CRITICAL).length
      const pctTxBelow60 = leases.length > 0 ? below60 / leases.length : 0
      const pctTxBelow55 = leases.length > 0 ? below55 / leases.length : 0

      // Calculate mortgage
      const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      const estimatedMortgage = calculateMonthlyMortgage(
        medianPrice * FINANCIAL_CONSTANTS.LTV_RESALE,
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
        neighbourhoodId,
        neighbourhoodName: neighbourhood?.name,
        flatType,
        medianResalePrice: medianPrice,
        estimatedMonthlyMortgage: estimatedMortgage,
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
    console.error('Error fetching neighbourhood profile:', error)
  }

  return null
}

