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

      const { data, error } = await query

      if (error) throw error
      if (data && data.length > 0) {
        return data.map(item => ({
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

      const { data, error } = await query

      if (error) throw error
      if (data && data.length > 0) {
        // Aggregate by town
        const townMap = new Map<string, {
          town: string
          prices: number[]
          txCount: number
          flatType: string
        }>()

        data.forEach(item => {
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

// Get lease age vs price data
export async function getLeasePriceData(
  flatType?: string,
  town?: string,
  limit: number = 1000
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
            const leaseText = item.remaining_lease || ''
            const yearsMatch = leaseText.match(/(\d+)\s*years?/)
            const monthsMatch = leaseText.match(/(\d+)\s*months?/)
            const years = yearsMatch ? parseFloat(yearsMatch[1]) : 0
            const months = monthsMatch ? parseFloat(monthsMatch[1]) : 0
            const leaseYears = years + months / 12
            const price = Number(item.resale_price)
            const area = Number(item.floor_area_sqm) || 1
            const pricePerSqm = price / area

            return {
              leaseYears,
              price,
              pricePerSqm,
              town: item.town || 'Unknown',
              flatType: item.flat_type || 'Unknown',
            }
          })
          .filter(item => item.leaseYears > 0 && item.price > 0)
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
      }))
      .sort((a, b) => a.p25Price - b.p25Price) // Sort by price ascending

    // Group by town and flat type, take best option per town
    const townMap = new Map<string, typeof affordable[0]>()
    affordable.forEach(item => {
      const key = `${item.town}-${item.flatType}`
      if (!townMap.has(key) || item.p25Price < townMap.get(key)!.p25Price) {
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
  })).sort((a, b) => a.p25Price - b.p25Price)
}

