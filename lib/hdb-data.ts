import { supabase } from './supabase'
import { formatCurrency } from './utils'

export interface RawResaleTransaction {
  month: string
  town: string
  flat_type: string
  storey_range: string
  floor_area_sqm: number
  remaining_lease: string
  resale_price: number
  lease_commence_date?: number
}

export interface AggregatedMonthly {
  month: string
  town: string | null
  flat_type: string
  tx_count: number
  median_price: number
  p25_price: number
  p75_price: number
  median_psm: number
  median_lease_years: number
  avg_floor_area: number
}

export interface AffordabilityResult {
  maxMonthlyPayment: number
  maxLoanAmount: number
  maxPropertyPrice: number
  affordableTowns: Array<{
    town: string
    flatType: string
    medianPrice: number
    p25Price: number
    txCount: number
  }>
}

// Fetch aggregated monthly data
export async function getAggregatedMonthly(
  flatType?: string,
  town?: string,
  startMonth?: string,
  endMonth?: string
): Promise<AggregatedMonthly[]> {
  try {
    if (supabase) {
      let query = supabase
        .from('agg_monthly')
        .select('*')
        .order('month', { ascending: true })

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      if (town && town !== 'All') {
        query = query.eq('town', town)
      }

      if (startMonth) {
        query = query.gte('month', startMonth)
      }

      if (endMonth) {
        query = query.lte('month', endMonth)
      }

      // Supabase has a default limit of 1000, we need to fetch all data
      let allData: AggregatedMonthly[] = []
      let hasMore = true
      let page = 0
      const pageSize = 1000

      while (hasMore) {
        const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error
        
        if (data && data.length > 0) {
          allData = allData.concat(data)
          hasMore = data.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }

      if (allData.length > 0) {
        return allData.map(item => ({
          month: item.month,
          town: item.town,
          flat_type: item.flat_type,
          tx_count: Number(item.tx_count),
          median_price: Number(item.median_price),
          p25_price: Number(item.p25_price),
          p75_price: Number(item.p75_price),
          median_psm: Number(item.median_psm),
          median_lease_years: Number(item.median_lease_years),
          avg_floor_area: Number(item.avg_floor_area),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching aggregated monthly data:', error)
  }

  // Fallback sample data for testing/demo
  console.log('Using fallback sample data - Supabase not configured or no data available')
  const sampleMonths = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06']
  return sampleMonths.map(month => ({
    month,
    town: null,
    flat_type: flatType && flatType !== 'All' ? flatType : '4 ROOM',
    tx_count: Math.floor(Math.random() * 200) + 100,
    median_price: 500000 + Math.floor(Math.random() * 100000),
    p25_price: 450000 + Math.floor(Math.random() * 80000),
    p75_price: 550000 + Math.floor(Math.random() * 120000),
    median_psm: 500 + Math.floor(Math.random() * 100),
    median_lease_years: 80 + Math.random() * 10,
    avg_floor_area: 100 + Math.random() * 20,
  }))
}

// Get town-level aggregated data for heatmap
export async function getTownAggregated(
  months: number = 3,
  flatType?: string
): Promise<Array<{
  town: string
  medianPrice: number
  txCount: number
  flatType: string
}>> {
  try {
    if (supabase) {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      let query = supabase
        .from('agg_monthly')
        .select('town, flat_type, median_price, tx_count')
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      // Fetch all data with pagination
      let allData: Array<{ town: string; flat_type: string; median_price: number; tx_count: number }> = []
      let hasMore = true
      let page = 0
      const pageSize = 1000

      while (hasMore) {
        const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error
        
        if (data && data.length > 0) {
          allData = allData.concat(data)
          hasMore = data.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }

      if (allData.length > 0) {
        // Aggregate by town
        const townMap = new Map<string, {
          town: string
          prices: number[]
          txCount: number
          flatType: string
        }>()

        allData.forEach(item => {
          const town = item.town || 'Unknown'
          if (!townMap.has(town)) {
            townMap.set(town, {
              town,
              prices: [],
              txCount: 0,
              flatType: item.flat_type,
            })
          }
          const entry = townMap.get(town)!
          entry.prices.push(Number(item.median_price))
          entry.txCount += Number(item.tx_count)
        })

        return Array.from(townMap.values()).map(entry => ({
          town: entry.town,
          medianPrice: entry.prices.sort((a, b) => a - b)[Math.floor(entry.prices.length / 2)],
          txCount: entry.txCount,
          flatType: entry.flatType,
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching town aggregated data:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for heatmap')
  const sampleTowns = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'TAMPINES', 'WOODLANDS', 'CLEMENTI']
  return sampleTowns.map(town => ({
    town,
    medianPrice: 450000 + Math.floor(Math.random() * 150000),
    txCount: Math.floor(Math.random() * 300) + 50,
    flatType: flatType && flatType !== 'All' ? flatType : '4 ROOM',
  }))
}

// Parse remaining_lease string to decimal years
// Handles formats like: "84 years 3 months", "61 years", "49 years 11 months"
function parseLeaseYears(leaseText: string): number | null {
  if (!leaseText || typeof leaseText !== 'string') {
    return null
  }

  const trimmed = leaseText.trim()
  if (!trimmed) return null

  // Extract years (e.g., "84 years 3 months" -> 84, "61 years" -> 61)
  const yearsMatch = trimmed.match(/(\d+)\s*years?/i)
  const years = yearsMatch ? parseFloat(yearsMatch[1]) : 0

  // Extract months (e.g., "84 years 3 months" -> 3, "49 years 11 months" -> 11)
  const monthsMatch = trimmed.match(/(\d+)\s*months?/i)
  const months = monthsMatch ? parseFloat(monthsMatch[1]) : 0

  // Validate: must have at least years
  if (years === 0 && months === 0) {
    return null
  }

  // Convert to decimal years
  const leaseYears = years + months / 12

  // Validate range (0-99 years is reasonable for HDB)
  if (leaseYears <= 0 || leaseYears > 99) {
    return null
  }

  return leaseYears
}

// Get lease age vs price data
export async function getLeasePriceData(
  flatType?: string,
  town?: string,
  limit: number = 10000
): Promise<Array<{
  leaseYears: number
  price: number
  pricePerSqm: number
  town: string
  flatType: string
}>> {
  try {
    if (supabase) {
      let query = supabase
        .from('raw_resale_2017')
        .select('remaining_lease, resale_price, floor_area_sqm, town, flat_type')
        .not('remaining_lease', 'is', null)
        .not('resale_price', 'is', null)
        .limit(limit)

      if (flatType && flatType !== 'All') {
        query = query.eq('flat_type', flatType)
      }

      if (town && town !== 'All') {
        query = query.eq('town', town)
      }

      const { data, error } = await query

      if (error) throw error
      if (data && data.length > 0) {
        return data
          .map(item => {
            const leaseYears = parseLeaseYears(item.remaining_lease || '')
            if (leaseYears === null) return null

            const price = Number(item.resale_price)
            const area = Number(item.floor_area_sqm) || 1
            const pricePerSqm = price / area

            if (price <= 0 || area <= 0) return null

            return {
              leaseYears,
              price,
              pricePerSqm,
              town: item.town || 'Unknown',
              flatType: item.flat_type || 'Unknown',
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      }
    }
  } catch (error) {
    console.error('Error fetching lease price data:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for lease-price')
  const sampleData = []
  for (let i = 0; i < 200; i++) {
    const leaseYears = 60 + Math.random() * 30
    const price = 400000 + leaseYears * 2000 + Math.random() * 100000
    sampleData.push({
      leaseYears,
      price,
      pricePerSqm: price / (90 + Math.random() * 20),
      town: ['ANG MO KIO', 'BEDOK', 'TAMPINES'][Math.floor(Math.random() * 3)],
      flatType: flatType && flatType !== 'All' ? flatType : '4 ROOM',
    })
  }
  return sampleData
}

// Binned lease data with statistics
export interface BinnedLeaseData {
  binLabel: string
  binStart: number
  binEnd: number
  medianPrice: number
  p25Price: number
  p75Price: number
  medianPricePerSqm: number
  p25PricePerSqm: number
  p75PricePerSqm: number
  count: number
}

// Get binned lease price data with statistics
export async function getBinnedLeasePriceData(
  flatType?: string,
  town?: string,
  limit: number = 10000
): Promise<BinnedLeaseData[]> {
  const rawData = await getLeasePriceData(flatType, town, limit)

  // Define bins: 0-40, 40-50, 50-60, 60-70, 70-80, 80-99
  const bins = [
    { start: 0, end: 40, label: '0-40' },
    { start: 40, end: 50, label: '40-50' },
    { start: 50, end: 60, label: '50-60' },
    { start: 60, end: 70, label: '60-70' },
    { start: 70, end: 80, label: '70-80' },
    { start: 80, end: 99, label: '80-99' },
  ]

  // Helper function to calculate percentile
  function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const index = Math.floor(sorted.length * p)
    return sorted[Math.min(index, sorted.length - 1)]
  }

  // Group data by bins
  const binnedData = bins.map(bin => {
    const itemsInBin = rawData.filter(
      item => item.leaseYears >= bin.start && item.leaseYears < bin.end
    )

    if (itemsInBin.length === 0) {
      return {
        binLabel: bin.label,
        binStart: bin.start,
        binEnd: bin.end,
        medianPrice: 0,
        p25Price: 0,
        p75Price: 0,
        medianPricePerSqm: 0,
        p25PricePerSqm: 0,
        p75PricePerSqm: 0,
        count: 0,
      }
    }

    const prices = itemsInBin.map(item => item.price)
    const pricesPerSqm = itemsInBin.map(item => item.pricePerSqm)

    return {
      binLabel: bin.label,
      binStart: bin.start,
      binEnd: bin.end,
      medianPrice: percentile(prices, 0.5),
      p25Price: percentile(prices, 0.25),
      p75Price: percentile(prices, 0.75),
      medianPricePerSqm: percentile(pricesPerSqm, 0.5),
      p25PricePerSqm: percentile(pricesPerSqm, 0.25),
      p75PricePerSqm: percentile(pricesPerSqm, 0.75),
      count: itemsInBin.length,
    }
  })

  // Filter out empty bins
  return binnedData.filter(bin => bin.count > 0)
}

// Calculate affordability
export function calculateAffordability(
  monthlyIncome: number,
  downPayment: number,
  loanYears: number,
  interestRate: number,
  otherDebts: number = 0
): {
  maxMonthlyPayment: number
  maxLoanAmount: number
  maxPropertyPrice: number
  maxPropertyPriceByBudget: number
  constraints: {
    msr: number
    tdsr: number
    ltv: number
  }
} {
  // MSR: Mortgage Servicing Ratio ≤ 30%
  const maxMonthlyPaymentMSR = monthlyIncome * 0.30

  // TDSR: Total Debt Servicing Ratio ≤ 55%
  const maxMonthlyPaymentTDSR = monthlyIncome * 0.55 - otherDebts

  // Take the stricter constraint
  const maxMonthlyPayment = Math.min(maxMonthlyPaymentMSR, maxMonthlyPaymentTDSR)

  // Calculate max loan amount from monthly payment (annuity formula)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanYears * 12

  let maxLoanAmount = 0
  if (monthlyRate > 0) {
    maxLoanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate)
  } else {
    maxLoanAmount = maxMonthlyPayment * numPayments
  }

  // LTV: Loan-to-Value ≤ 75% (for resale flats)
  const maxPropertyPriceByLTV = downPayment / 0.25

  // Max property price = loan + downpayment, but also constrained by LTV
  const maxPropertyPriceByBudget = maxLoanAmount + downPayment
  const maxPropertyPrice = Math.min(maxPropertyPriceByBudget, maxPropertyPriceByLTV)

  return {
    maxMonthlyPayment,
    maxLoanAmount,
    maxPropertyPrice,
    maxPropertyPriceByBudget, // Loan capacity limit
    constraints: {
      msr: maxMonthlyPaymentMSR,
      tdsr: maxMonthlyPaymentTDSR,
      ltv: maxPropertyPriceByLTV,
    },
  }
}

// Find affordable properties
export async function findAffordableProperties(
  maxPrice: number,
  flatTypes: string[] = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'],
  months: number = 6
): Promise<Array<{
  town: string
  flatType: string
  medianPrice: number
  p25Price: number
  txCount: number
  medianLeaseYears: number
}>> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const data = await getAggregatedMonthly(
      undefined,
      undefined,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    // Filter by affordable price and flat types
    const affordable = data
      .filter(item => {
        const isAffordable = item.p25_price <= maxPrice // Use P25 for conservative estimate
        const isDesiredType = flatTypes.includes(item.flat_type)
        return isAffordable && isDesiredType
      })
      .map(item => ({
        town: item.town || 'Unknown',
        flatType: item.flat_type,
        medianPrice: item.median_price,
        p25Price: item.p25_price,
        txCount: item.tx_count,
        medianLeaseYears: item.median_lease_years || 0,
      }))
      .sort((a, b) => Math.abs(a.medianPrice - maxPrice) - Math.abs(b.medianPrice - maxPrice)) // Sort by closest match to budget

    // Group by town and flat type, take best option per town
    const townMap = new Map<string, typeof affordable[0]>()
    affordable.forEach(item => {
      const key = `${item.town}-${item.flatType}`
      if (!townMap.has(key) || Math.abs(item.medianPrice - maxPrice) < Math.abs(townMap.get(key)!.medianPrice - maxPrice)) {
        townMap.set(key, item)
      }
    })

    return Array.from(townMap.values()).slice(0, 20) // Top 20 affordable options
  } catch (error) {
    console.error('Error finding affordable properties:', error)
  }

  // Fallback sample data
  console.log('Using fallback sample data for affordable properties')
  const sampleTowns = ['ANG MO KIO', 'BEDOK', 'BUKIT BATOK', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']
  return sampleTowns.slice(0, 10).map(town => ({
    town,
    flatType: '4 ROOM',
    medianPrice: maxPrice * 0.8 + Math.random() * maxPrice * 0.2,
    p25Price: maxPrice * 0.7 + Math.random() * maxPrice * 0.15,
    txCount: Math.floor(Math.random() * 100) + 20,
    medianLeaseYears: 50 + Math.random() * 30,
  })).sort((a, b) => Math.abs(a.medianPrice - maxPrice) - Math.abs(b.medianPrice - maxPrice))
}

// Get median rent for a specific town and flat type (6-month rolling median)
export async function getMedianRent(
  town: string,
  flatType: string,
  months: number = 6
): Promise<number | null> {
  try {
    if (supabase) {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      // Normalize inputs to match database format
      const normalizedTown = town.toUpperCase().trim()
      const normalizedFlatType = flatType.toUpperCase().trim()

      console.log('Fetching rental data:', { town: normalizedTown, flatType: normalizedFlatType, months })

      const { data, error } = await supabase
        .from('hdb_rental_stats')
        .select('median_rent, month')
        .eq('town', normalizedTown)
        .eq('flat_type', normalizedFlatType)
        .gte('month', startDate.toISOString().split('T')[0])
        .lte('month', endDate.toISOString().split('T')[0])
        .not('median_rent', 'is', null)
        .order('month', { ascending: true })

      if (error) {
        console.error('Error fetching rental data:', error)
        throw error
      }

      console.log('Rental query result:', { count: data?.length || 0, town: normalizedTown, flatType: normalizedFlatType })

      // If no recent data, try to get any available data (fallback to last 12 months)
      if (!data || data.length === 0) {
        console.log('No data in last 6 months, trying last 12 months...')
        const fallbackStartDate = new Date()
        fallbackStartDate.setMonth(fallbackStartDate.getMonth() - 12)

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('hdb_rental_stats')
          .select('median_rent, month')
          .eq('town', normalizedTown)
          .eq('flat_type', normalizedFlatType)
          .gte('month', fallbackStartDate.toISOString().split('T')[0])
          .lte('month', endDate.toISOString().split('T')[0])
          .not('median_rent', 'is', null)
          .order('month', { ascending: false })
          .limit(6) // Get last 6 available months

        if (fallbackError) {
          console.error('Error fetching fallback rental data:', fallbackError)
          return null
        }

        if (fallbackData && fallbackData.length > 0) {
          console.log('Found fallback data:', fallbackData.length, 'records')
          const rents = fallbackData.map(item => Number(item.median_rent)).filter(r => r > 0)
          if (rents.length === 0) return null

          const sorted = rents.sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid]
        }

        // If still no data, check what's available in database
        const { data: anyData } = await supabase
          .from('hdb_rental_stats')
          .select('town, flat_type, month')
          .eq('town', normalizedTown)
          .eq('flat_type', normalizedFlatType)
          .limit(1)

        if (anyData && anyData.length > 0) {
          console.log('Data exists but outside time range. Latest month:', anyData[0].month)
        } else {
          console.log('No data found for:', { town: normalizedTown, flatType: normalizedFlatType })
        }

        return null
      }

      const rents = data.map(item => Number(item.median_rent)).filter(r => r > 0)
      if (rents.length === 0) return null

      // Calculate median of medians (6-month rolling median)
      const sorted = rents.sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
    }
  } catch (error) {
    console.error('Error fetching median rent:', error)
  }

  return null
}

// Calculate monthly mortgage payment
export function calculateMonthlyMortgage(
  loanAmount: number,
  loanYears: number,
  interestRate: number
): number {
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanYears * 12

  if (monthlyRate === 0) {
    return loanAmount / numPayments
  }

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  )
}

// Lease Risk Types
export type LeaseRiskLevel = 'low' | 'moderate' | 'high' | 'critical'

// Town Profile - Complete decision profile with signals
export interface TownProfile {
  town: string
  flatType: string

  // Price & cashflow
  medianResalePrice: number
  estimatedMonthlyMortgage: number
  medianRent: number | null
  rentBuyGapMonthly: number // rent - mortgage

  // Lease stats
  medianRemainingLease: number // years
  pctTxBelow60: number // 0-1
  pctTxBelow55: number // 0-1

  // Market stability
  volumeRecent: number
  volatility12m: number

  // Derived signals (engine output)
  signals: {
    leaseRisk: LeaseRiskLevel
    leaseSignalReasons: string[] // explainable
    pricingResponse: 'early_discount' | 'stable' | 'premium'
    stability: 'stable' | 'volatile' | 'fragile'
  }
}

// Compare Summary output
export interface CompareSummary {
  // Bottom Line (new top section)
  bottomLine: {
    changes: string[] // List of changes (👍, ⚠, 💰)
    bestFor: string // Best for statement
  } | null
  
  // Lens-based Recommendation (new format)
  recommendation: {
    headline: string // "Choose BUKIT BATOK if you prioritise..."
    tradeoffs: string[] // 3 fixed format bullets
    confidence: 'clear_winner' | 'balanced' | 'depends_on_preference'
  } | null
  
  // Standardized scores (0-100)
  scores: {
    townA: {
      entryCost: number
      cashFlow: number
      leaseSafety: number
      schoolPressure: number
      stability: number
      overall: number
    }
    townB: {
      entryCost: number
      cashFlow: number
      leaseSafety: number
      schoolPressure: number
      stability: number
      overall: number
    }
  } | null
  
  // Moving Education Impact
  movingEducationImpact: {
    spiChange: number // SPI difference (B - A)
    spiChangeText: string // e.g., "+4.3 (still Low)"
    highDemandSchoolsChange: number // Change in high-demand schools count
    highDemandSchoolsText: string // e.g., "+0 / +1"
    schoolCountChange: number // Change in number of primary schools
    schoolCountText: string // e.g., "7 → 6"
    choiceFlexibility: 'Similar' | 'Better' | 'Worse'
    explanation: string // Auto-generated explanation sentence
  } | null
  
  // Fixed 5-block structure
  headlineVerdict: string // Block 1: Headline Verdict
  educationPressure: {
    comparison: string // SPI comparison text
    explanation: string // Additional explanation
    pressureRangeNote?: string // Pressure range explanation
  } | null // Block 2: Education Pressure Comparison
  housingTradeoff: {
    price: string | null
    lease: string | null
  } // Block 3: Housing Trade-off
  bestSuitedFor: {
    townA: string[]
    townB: string[]
  } // Block 4: Who Each Town Is Better For
  decisionHint: string // Block 5: Decision Hint
  
  // Legacy fields (kept for compatibility)
  oneLiner: string
  keyDifferences: string[]
  bestFor: {
    townA: string[]
    townB: string[]
  }
  beCautious: {
    townA: string[]
    townB: string[]
  }
  advanced: {
    rentBuyGapA: number
    rentBuyGapB: number
    stabilityA: string
    stabilityB: string
    leaseRiskReasonsA: string[]
    leaseRiskReasonsB: string[]
  }
  badges: Array<{ town: 'A' | 'B'; label: string; tone: 'good' | 'warn' | 'neutral' }>
  
  // Killer phrase: Moving from A to B
  movingPhrase?: string | null
}

// Get detailed town comparison data (legacy, kept for compatibility)
export interface TownComparisonData {
  town: string
  flatType: string
  medianPrice: number
  p25Price: number
  p75Price: number
  medianLeaseYears: number
  pctBelow55Years: number
  txCount: number
  priceVolatility: number // Coefficient of variation
  medianRent: number | null
  medianPricePerSqm: number
}

// Compute Lease Risk from raw data
export function computeLeaseRisk(input: {
  medianRemainingLease: number
  pctTxBelow60: number
  pctTxBelow55: number
}): { level: LeaseRiskLevel; reasons: string[] } {
  const reasons: string[] = []
  const { medianRemainingLease, pctTxBelow60, pctTxBelow55 } = input

  // Baseline by median
  let score = 0

  if (medianRemainingLease < 55) {
    score += 3
    reasons.push('Median remaining lease is below 55 years')
  } else if (medianRemainingLease < 60) {
    score += 2
    reasons.push('Median remaining lease is below 60 years')
  } else if (medianRemainingLease < 70) {
    score += 1
    reasons.push('Median remaining lease is below 70 years')
  }

  // Concentration checks
  if (pctTxBelow55 >= 0.3) {
    score += 2
    reasons.push('High share of transactions below 55 years')
  } else if (pctTxBelow55 >= 0.15) {
    score += 1
    reasons.push('Meaningful share of transactions below 55 years')
  }

  if (pctTxBelow60 >= 0.5) {
    score += 1
    reasons.push('Majority of transactions below 60 years')
  }

  // Map score → level
  let level: LeaseRiskLevel = 'low'
  if (score >= 5) level = 'critical'
  else if (score >= 3) level = 'high'
  else if (score >= 1) level = 'moderate'

  return { level, reasons }
}

// Get Town Profile with signals (new unified API)
export async function getTownProfile(
  town: string,
  flatType: string,
  months: number = 24, // Use 24 months for decision tool
  loanYears: number = 25,
  interestRate: number = 2.6
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
      const below60 = leases.filter(l => l < 60).length
      const below55 = leases.filter(l => l < 55).length
      const pctTxBelow60 = leases.length > 0 ? below60 / leases.length : 0
      const pctTxBelow55 = leases.length > 0 ? below55 / leases.length : 0

      // Get median rent
      const medianRent = await getMedianRent(town, flatType, 6)

      // Calculate mortgage
      const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      const estimatedMortgage = calculateMonthlyMortgage(
        medianPrice * 0.75, // 75% LTV
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
      if (medianLease < 60) {
        pricingResponse = 'early_discount'
      } else if (medianLease < 70) {
        pricingResponse = 'stable'
      } else {
        pricingResponse = 'premium'
      }

      // Determine stability
      const islandAvgVolatility = 0.12
      const islandAvgVolume = 100
      let stability: 'stable' | 'volatile' | 'fragile'
      if (priceVolatility > islandAvgVolatility && data.reduce((sum, d) => sum + d.tx_count, 0) < islandAvgVolume) {
        stability = 'fragile'
      } else if (priceVolatility > islandAvgVolatility) {
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

// Lens type definition
export type PreferenceLens = 'lower_cost' | 'lease_safety' | 'school_pressure' | 'balanced'

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
  longTerm: boolean = false
): CompareSummary {
  const badges: CompareSummary['badges'] = []
  
  // Thresholds
  const SPI_SIGNIFICANT = 15
  const PRICE_SIGNIFICANT = 30000 // S$30k
  const LEASE_SIGNIFICANT = 15 // years
  
  // Calculate differences
  const spiDiff = spiA && spiB ? spiA.spi - spiB.spi : 0 // >0 means A has higher pressure
  const priceDiff = A.medianResalePrice - B.medianResalePrice // >0 means A is more expensive
  const leaseDiff = A.medianRemainingLease - B.medianRemainingLease // >0 means A has healthier lease
  
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
  // Block 5: Decision Hint
  // ============================================
  let decisionHint: string
  const spiImportance = spiA && spiB ? Math.abs(spiDiff) : 0
  const leaseImportance = Math.abs(leaseDiff)
  
  if (spiImportance > leaseImportance && spiA && spiB) {
    decisionHint = `If primary school pressure matters more to you, location choice may outweigh price differences.`
  } else if (leaseImportance > 0) {
    decisionHint = `If you plan to hold long-term, lease profile may matter more than short-term school pressure.`
  } else {
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
    
    if (parts.length > 0) {
      movingPhrase = `Moving from ${fromTown} to ${toTown} ${parts.join(', but ')}.`
    }
  }
  
  // ============================================
  // Lens-based Recommendation (new format)
  // ============================================
  let recommendation: CompareSummary['recommendation'] = null
  if (scoresWithOverall) {
    const overallDiff = scoresWithOverall.townB.overall - scoresWithOverall.townA.overall
    const winner = overallDiff > 0 ? B.town : A.town
    const loser = overallDiff > 0 ? A.town : B.town
    
    // Generate headline based on lens
    let headline = ''
    if (lens === 'lower_cost') {
      headline = priceDiff < 0 
        ? `Choose ${A.town} if you prioritise lower entry price.`
        : `Choose ${B.town} if you prioritise lower entry price.`
    } else if (lens === 'lease_safety') {
      headline = leaseDiff > 0
        ? `Choose ${A.town} if you prioritise long-term lease safety.`
        : `Choose ${B.town} if you prioritise long-term lease safety.`
    } else if (lens === 'school_pressure') {
      headline = spiDiff < 0
        ? `Choose ${A.town} if you prioritise lower primary school pressure.`
        : `Choose ${B.town} if you prioritise lower primary school pressure.`
    } else {
      headline = Math.abs(overallDiff) > 12
        ? `Choose ${winner} based on balanced factors.`
        : `Both towns are viable — ${winner} has a slight edge.`
    }
    
    // Generate 3 trade-off bullets (fixed format)
    const tradeoffs: string[] = []
    
    // Upfront cost
    if (Math.abs(priceDiff) >= PRICE_SIGNIFICANT) {
      const cheaper = priceDiff < 0 ? A.town : B.town
      const diff = Math.abs(priceDiff)
      tradeoffs.push(`💰 Upfront: ${cheaper} is cheaper by ~${formatCurrency(diff)}`)
    }
    
    // Lease
    if (Math.abs(leaseDiff) >= LEASE_SIGNIFICANT) {
      const healthier = leaseDiff > 0 ? A.town : B.town
      const diff = Math.abs(leaseDiff)
      tradeoffs.push(`🧱 Lease: ${healthier} has +${Math.round(diff)} yrs healthier lease profile`)
    }
    
    // School
    if (spiA && spiB) {
      const lowerSPI = spiDiff < 0 ? A.town : B.town
      const diff = Math.abs(spiDiff)
      const level = (spiDiff < 0 ? spiA : spiB).level
      const levelText = level === 'low' ? 'still Low' : level === 'medium' ? 'Moderate' : 'High'
      tradeoffs.push(`🎓 School: Moving to ${lowerSPI === A.town ? B.town : A.town} ${spiDiff < 0 ? 'decreases' : 'increases'} SPI by +${diff.toFixed(1)} (${levelText})`)
    }
    
    // Confidence badge
    let confidence: 'clear_winner' | 'balanced' | 'depends_on_preference'
    if (Math.abs(overallDiff) > 12) {
      confidence = 'clear_winner'
    } else if (Math.abs(overallDiff) > 5) {
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
    if (spiChangeAbs < 3) {
      explanation = `Pressure remains similar — moving is unlikely to materially change day-to-day stress.`
    } else if (spiChangeAbs >= 3 && spiChangeAbs < 8) {
      if (spiChange > 0) {
        explanation = `Pressure increases slightly, but stays within ${finalLevel === 'low' ? 'Low' : 'Moderate'} range — moving is unlikely to materially change day-to-day stress unless you target specific elite schools.`
      } else {
        explanation = `Pressure decreases slightly — moving may reduce competition, especially if you're targeting mid-tier schools.`
      }
    } else if (spiChangeAbs >= 8) {
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
    
    // If SPI difference > 8: Education dimension can override price/lease
    if (spiChangeAbs > 8) {
      // Education becomes primary factor in headline
      if (movingEducationImpact.spiChange < 0) {
        recommendation.headline = `Choose ${A.town} if you prioritise significantly lower primary school pressure.`
      } else {
        recommendation.headline = `Choose ${B.town} if you prioritise significantly lower primary school pressure.`
      }
    } else if (spiChangeAbs >= 3 && spiChangeAbs <= 8) {
      // Write as trade-off
      if (movingEducationImpact.spiChange < 0) {
        recommendation.headline = `Choose ${A.town} for lower school pressure, but consider trade-offs with price and lease.`
      } else {
        recommendation.headline = `Choose ${B.town} for lower school pressure, but consider trade-offs with price and lease.`
      }
    }
    // If SPI difference < 3: Keep existing headline (education mentioned in trade-offs)
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
    // 2. High-demand schools difference ≥ 2
    // 3. Primary school count difference ≥ 4
    if (levelChange || highDemandDiff >= 2 || schoolCountDiff >= 4) {
      // Add education to trade-offs if not already there
      const hasEducation = recommendation.tradeoffs.some(t => t.includes('School') || t.includes('🎓'))
      if (!hasEducation && recommendation.tradeoffs.length < 3) {
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

      // % below 55 years
      const below55 = leases.filter(l => l < 55).length
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
    }
  } catch (error) {
    console.error('Error fetching town comparison data:', error)
  }

  return null
}

