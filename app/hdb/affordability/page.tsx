'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Calculator, Home, ArrowRight, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { LONG_TERM_RISK_DEFINITION } from '@/lib/constants'

export default function HDBAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(8000)
  const [downPayment, setDownPayment] = useState(100000)
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)
  const [otherDebts, setOtherDebts] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    const calc = calculateAffordability(monthlyIncome, downPayment, loanYears, interestRate, otherDebts)
    setResults(calc)
    setLoading(false)
  }

  useEffect(() => {
    handleCalculate()
  }, [])


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
                  For most resale HDB buyers, a 25-year loan is the most common and practical choice.
                  Longer loan terms are often limited by flat age and financing rules.
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
                  Affordable resale flats often have shorter remaining leases.
                  This can make them harder to sell or refinance later.
                  {' '}
                  <Link
                    href="/hdb/lease-price"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    See why lease length matters
                    <ArrowRight className="w-3 h-3" />
                  </Link>
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

                {/* Supporting Details (collapsed by default to reduce scroll) */}
                <details className="group bg-white/60 rounded-lg border border-gray-200">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none">
                    <span className="text-sm font-semibold text-gray-900">More details</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
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

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2">Regulatory Constraints (for reference):</div>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• MSR (Mortgage Servicing Ratio) ≤ 30%</li>
                        <li>• TDSR (Total Debt Servicing Ratio) ≤ 55%</li>
                        <li>• LTV (Loan-to-Value) ≤ 75% for resale flats</li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Click "Calculate" to see results</div>
            )}
          </ChartCard>
        </div>


        {/* Section 4: CTA to Explore Neighbourhoods */}
        {results && (() => {
          const budget = Math.round(results.maxPropertyPrice)
          const budgetFormatted = formatCurrency(results.maxPropertyPrice)
          
          // Convert budget to price tier based on actual ranges
          // low: 0-499999, medium: 500000-999999, high: 1000000+
          let priceTier = 'all'
          if (budget <= 499999) {
            priceTier = 'low'
          } else if (budget <= 999999) {
            priceTier = 'medium'
          } else {
            priceTier = 'high'
          }
          
          const params = new URLSearchParams()
          params.set('price_tier', priceTier)
          params.set('source', 'affordability')
          
          return (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl border border-blue-500 p-8 shadow-lg">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-blue-200 uppercase tracking-wide">Next step</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Where can you actually buy within {budgetFormatted}?
                  </h3>
                  <p className="text-blue-50 text-lg mb-6 leading-relaxed">
                    Based on recent resale prices, see which neighbourhoods are realistically within your budget.
                  </p>
                  <Link
                    href={`/neighbourhoods?${params.toString()}`}
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    See neighbourhoods under {budgetFormatted}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })()}


      </main>
    </div>
  )
}

