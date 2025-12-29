import { supabase } from './supabase'

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
  oneLiner: string // 一句话结论
  keyDifferences: string[] // 最多3条
  decisionHint: string // 一条决策提示
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

// Generate Compare Summary from Town Profiles (simplified 4-layer structure)
export function generateCompareSummary(
  A: TownProfile,
  B: TownProfile,
  userBudget?: number
): CompareSummary {
  const badges: CompareSummary['badges'] = []
  const leaseRiskLevels = { low: 0, moderate: 1, high: 2, critical: 3 }
  const leaseA = leaseRiskLevels[A.signals.leaseRisk]
  const leaseB = leaseRiskLevels[B.signals.leaseRisk]
  const cheaper = A.medianResalePrice <= B.medianResalePrice ? 'A' : 'B'

  // 1) One-liner conclusion
  let oneLiner: string
  if (leaseA > leaseB) {
    oneLiner = `${A.town} offers lower upfront cost but comes with higher lease risk. ${B.town} is more expensive, but offers stronger long-term lease security.`
  } else if (leaseB > leaseA) {
    oneLiner = `${B.town} offers lower upfront cost but comes with higher lease risk. ${A.town} is more expensive, but offers stronger long-term lease security.`
  } else {
    oneLiner = `${cheaper === 'A' ? A.town : B.town} offers lower upfront cost. Both towns have similar lease profiles.`
  }

  // 2) Key differences (max 3 bullets, no numbers)
  const keyDifferences: string[] = []
  keyDifferences.push(`Entry price: ${cheaper === 'A' ? A.town : B.town} lower, ${cheaper === 'A' ? B.town : A.town} higher`)
  
  const leaseTextA = leaseA >= 2 ? 'shorter (<60 yrs common)' : 'healthier'
  const leaseTextB = leaseB >= 2 ? 'shorter (<60 yrs common)' : 'healthier'
  keyDifferences.push(`Lease profile: ${A.town} ${leaseTextA}, ${B.town} ${leaseTextB}`)
  
  const bothRentAdvantage = A.rentBuyGapMonthly > 0 && B.rentBuyGapMonthly > 0
  if (bothRentAdvantage) {
    keyDifferences.push(`Rent vs Buy: Buying beats renting in both towns`)
  } else {
    keyDifferences.push(`Rent vs Buy: ${A.rentBuyGapMonthly > 0 ? A.town : B.town} shows stronger buy advantage`)
  }

  // 3) Decision hint (one line)
  const decisionHint = leaseA !== leaseB
    ? 'If you plan to stay long-term, lease profile matters more than entry price.'
    : 'Both options are viable — choose based on your timeline and risk tolerance.'

  // 4) Best for / Be cautious (only most differentiating)
  const bestForA: string[] = []
  const bestForB: string[] = []
  const beCautiousA: string[] = []
  const beCautiousB: string[] = []

  // Best for - only show differentiating factors
  if (A.medianResalePrice < B.medianResalePrice) {
    bestForA.push('buyers prioritizing lower upfront price or short-term holding')
  }
  if (leaseB < leaseA) {
    bestForB.push('buyers planning long-term stay (15+ years)')
  }
  if (leaseA < leaseB) {
    bestForA.push('buyers comfortable with lease trade-offs')
  }

  // Be cautious - only show differentiating risks
  if (leaseA >= 2) {
    beCautiousA.push('relying on future resale or tight financing')
  }
  if (B.medianResalePrice > A.medianResalePrice * 1.1) {
    beCautiousB.push('highly sensitive to upfront cost')
  }
  if (leaseB >= 2) {
    beCautiousB.push('relying on future resale or tight financing')
  }

  // Badges
  if (A.signals.leaseRisk === 'high' || A.signals.leaseRisk === 'critical')
    badges.push({ town: 'A', label: A.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ town: 'A', label: 'Lease healthier', tone: 'good' })

  if (B.signals.leaseRisk === 'high' || B.signals.leaseRisk === 'critical')
    badges.push({ town: 'B', label: B.signals.leaseRisk === 'critical' ? 'High lease risk' : 'Lease risk', tone: 'warn' })
  else badges.push({ town: 'B', label: 'Lease healthier', tone: 'good' })

  return {
    oneLiner,
    keyDifferences,
    decisionHint,
    bestFor: {
      townA: bestForA,
      townB: bestForB,
    },
    beCautious: {
      townA: beCautiousA,
      townB: beCautiousB,
    },
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

