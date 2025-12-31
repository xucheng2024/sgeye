'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability, findAffordableProperties, calculateMonthlyMortgage } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Calculator, Home, AlertTriangle, ArrowRight } from 'lucide-react'
import CompareTownsCTA from '@/components/CompareTownsCTA'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatCurrencyFull } from '@/lib/utils'
import Link from 'next/link'

const TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'CENTRAL AREA', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']

export default function HDBAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(8000)
  const [downPayment, setDownPayment] = useState(100000)
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)
  const [otherDebts, setOtherDebts] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [affordableProperties, setAffordableProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    const calc = calculateAffordability(monthlyIncome, downPayment, loanYears, interestRate, otherDebts)
    setResults(calc)

    const properties = await findAffordableProperties(calc.maxPropertyPrice)
    setAffordableProperties(properties)
    setLoading(false)
  }

  useEffect(() => {
    handleCalculate()
  }, [])

  // Find closest matches (top 2-3)
  const budget = results?.maxPropertyPrice || 0
  const sortedByCloseness = [...affordableProperties].sort((a, b) => {
    const diffA = Math.abs(a.medianPrice - budget)
    const diffB = Math.abs(b.medianPrice - budget)
    return diffA - diffB
  })
  const closestMatches = sortedByCloseness.slice(0, 3).map(p => `${p.town}-${p.flatType}`)

  // Select best comparison pair (Town A: price-oriented, Town B: long-term oriented)
  const selectComparisonPair = () => {
    if (affordableProperties.length < 2) return null

    // Step 1: Filter candidates within budget, sorted by closeness
    const candidates = sortedByCloseness.filter(t => t.medianPrice <= budget)

    if (candidates.length < 2) {
      // Fallback: just use first two
      return {
        townA: candidates[0] || affordableProperties[0],
        townB: candidates[1] || affordableProperties[1],
      }
    }

    // Step 2: Select Town A (price-oriented, may have higher lease risk)
    // Prefer towns with shorter lease (< 60 years) as they're typically cheaper
    const townA = candidates.find(t => t.medianLeaseYears < 60) || candidates[0]

    // Step 3: Select Town B (long-term oriented, healthier lease)
    // Prefer towns with longer lease (>= 60 years) and different from Town A
    const townB = candidates.find(
      t => t.medianLeaseYears >= 60 && t.town !== townA.town
    ) || candidates.find(t => t.town !== townA.town) || candidates[1]

    return { townA, townB }
  }

  const comparisonPair = selectComparisonPair()

  const chartData = affordableProperties.slice(0, 15).map(p => ({
    town: p.town.length > 12 ? p.town.substring(0, 12) + '...' : p.town,
    fullTown: p.town,
    medianPrice: p.medianPrice,
    p25Price: p.p25Price,
    txCount: p.txCount,
    flatType: p.flatType,
    medianLeaseYears: Math.round(p.medianLeaseYears || 0),
    label: `${p.town} • ${p.flatType} • ${Math.round(p.medianLeaseYears || 0)}y lease`,
    isClosestMatch: closestMatches.includes(`${p.town}-${p.flatType}`),
    budgetDiff: Math.abs(p.medianPrice - budget),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Can I Afford It?</h1>
          <p className="text-lg text-gray-600 mb-2">Calculate your affordability and find suitable HDB flats</p>
          <p className="text-sm text-gray-500 italic">
            This tool helps you narrow down suitable towns and understand trade-offs. Final unit selection depends on specific flat attributes such as block, floor, and proximity.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <ChartCard
            title="Your Financial Profile"
            description="Enter your financial details to calculate affordability"
            icon={<Calculator className="w-6 h-6" />}
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Gross Income (S$)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Down Payment (S$)
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term (years)
                </label>
                <select
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                >
                  <option value={15}>15 years</option>
                  <option value={20}>20 years</option>
                  <option value={25}>25 years (HDB max)</option>
                  <option value={30}>30 years</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Loan term should align with HDB lease, age, and policy. 25 years is the realistic default for resale HDB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  min="0"
                  max="10"
                />
                <p className="mt-1 text-xs text-gray-500">HDB loan typically 2.6%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Monthly Debts (S$)
                </label>
                <input
                  type="number"
                  value={otherDebts}
                  onChange={(e) => setOtherDebts(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">Car loans, credit cards, etc.</p>
              </div>

              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Calculating...
                  </span>
                ) : (
                  'Calculate Affordability'
                )}
              </button>
            </div>
          </ChartCard>

          {/* Results */}
          <ChartCard
            title="Your Affordability Results"
            description="Based on MSR, TDSR, and LTV regulations"
            icon={<Home className="w-6 h-6" />}
          >
            {/* Section 1: Summary Box */}
            {results && (
              <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">Your Housing Reality (Summary)</h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-2">
                  With your current income and savings, your realistic HDB resale budget is around <span className="font-bold text-blue-600">{formatCurrency(results.maxPropertyPrice)}</span>.
                </p>
                <p className="text-sm text-gray-800 leading-relaxed mb-2">
                  Affordable resale options may carry lease-related risks that should be carefully considered.
                </p>
                <p className="text-xs text-gray-500 italic">
                  In short: You can afford to buy, but only within a limited price range, and lease matters.
                </p>
              </div>
            )}
            
            {/* Transport Burden Hint */}
            {results && (
              <div className="mb-5 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-800 leading-relaxed">
                  <strong>💡 Trade-off reminder:</strong> Lower price often comes with higher daily time burden. When comparing towns, consider how transport differences will affect your daily routine over 10–15 years.
                </p>
              </div>
            )}
            {results ? (
              <div className="space-y-4">
                {/* Final Budget - Most Prominent */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Final Budget</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {formatCurrency(results.maxPropertyPrice)}
                  </div>
                  <div className="text-xs text-gray-600 italic mb-1">
                    This is your realistic cap
                  </div>
                  <div className="text-xs text-gray-500">
                    Used to filter towns and flat types below.
                  </div>
                </div>

                {/* Supporting Details - Less Prominent */}
                <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
                  <div className="text-xs font-medium text-gray-600 mb-1">Maximum Monthly Payment</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(results.maxMonthlyPayment)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">
                    MSR: {formatCurrency(results.constraints.msr)} | TDSR: {formatCurrency(results.constraints.tdsr)}
                  </div>
                </div>

                <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-lg border border-green-200">
                  <div className="text-xs font-medium text-gray-600 mb-1">Maximum Loan Amount</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(results.maxLoanAmount)}
                  </div>
                </div>

                <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-2">Breakdown:</div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between items-center py-0.5">
                      <span>Max by Loan Capacity:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(results.maxPropertyPriceByBudget)}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>Max by Down Payment / LTV:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(results.constraints.ltv)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-2">Regulatory Constraints (for reference):</div>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• MSR (Mortgage Servicing Ratio) ≤ 30%</li>
                    <li>• TDSR (Total Debt Servicing Ratio) ≤ 55%</li>
                    <li>• LTV (Loan-to-Value) ≤ 75% for resale flats</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Click "Calculate" to see results</div>
            )}
          </ChartCard>
        </div>

        {/* Section 3: Lease Risk and Comparison CTA */}
        <div className="space-y-4 mt-8">
          {/* Lease Risk Warning */}
          {results && results.maxPropertyPrice < 500000 && (
            <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-gray-900 mb-1.5">Important Context: Lease Matters</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Many resale flats under {formatCurrency(results.maxPropertyPrice)} tend to have shorter remaining leases (below ~55 years), which may affect long-term resale value and future financing.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison CTA */}
          {affordableProperties.length > 0 && comparisonPair && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1.5">
                    Compare your best options
                  </h4>
                  <p className="text-sm text-gray-600">
                    See what you gain and trade off between two towns that fit your budget.
                  </p>
                </div>
                <Link
                  href={`/hdb/compare-towns?flatType=${encodeURIComponent(comparisonPair.townA.flatType)}&townA=${encodeURIComponent(comparisonPair.townA.town)}&townB=${encodeURIComponent(comparisonPair.townB.town)}`}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg whitespace-nowrap flex-shrink-0"
                >
                  Compare now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Affordable Properties */}
        {affordableProperties.length > 0 && (
          <div className="mt-8">
            <ChartCard
              title="Where your budget works today"
              description="Affordable properties based on your budget"
              icon={<Home className="w-6 h-6" />}
            >
            <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              These towns and flat types are closest to your budget based on recent median prices.
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="town" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold mb-1">{data.fullTown}</p>
                          <p className="text-sm text-gray-600 mb-2">{data.flatType}</p>
                          <div className="text-xs text-gray-500 mb-2">Median Remaining Lease: ~{data.medianLeaseYears} years</div>
                          <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                            <p className="text-sm">P25: {formatCurrency(data.p25Price)}</p>
                            <p className="text-sm">Median: {formatCurrency(data.medianPrice)}</p>
                            <p className="text-xs text-gray-500">Transactions: {data.txCount}</p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="p25Price" 
                  fill="#10b981" 
                  name="P25 Price (Conservative)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="medianPrice" 
                  fill="#3b82f6"
                  name="Median Price"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {closestMatches.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-purple-900 mb-1">✨ Closest match to your budget:</div>
                  <div className="text-purple-700 mb-2">
                    {sortedByCloseness.slice(0, 3).map((p, idx) => (
                      <span key={idx}>
                        {p.town} {p.flatType}
                        {idx < 2 && ', '}
                      </span>
                    ))}
                  </div>
                  <div className="text-purple-600 text-xs italic">
                    These areas are closest to your budget with relatively healthier lease profiles.
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 space-y-2">
                <p className="mb-1">Each bar shows: <span className="font-medium">Town • Flat Type • Median Remaining Lease</span></p>
                <p>Sorted by closest match to your budget (P50 median price)</p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600">
                  <p className="font-medium mb-1">How to use this:</p>
                  <p>These options are based on recent median prices, not individual listings. Actual availability and unit condition may vary.</p>
                </div>
              </div>
            </div>
          </ChartCard>
          </div>
        )}

        {/* Redirect CTA to Compare Towns */}
        <CompareTownsCTA text="Compare neighbourhoods and see what changes" />
      </main>
    </div>
  )
}

