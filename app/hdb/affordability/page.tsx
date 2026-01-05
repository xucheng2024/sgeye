'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Calculator, Home, ArrowRight, ChevronDown, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { LONG_TERM_RISK_DEFINITION } from '@/lib/constants'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import FeedbackForm from '@/components/FeedbackForm'
import { AnalyticsEvents } from '@/lib/analytics'

// Helper function to parse k unit input
function parseKInput(value: string): number {
  if (!value) return 0
  const cleaned = value.trim().toLowerCase().replace(/\s+/g, '')
  // Handle "8k", "8.5k", "8,000" etc.
  if (cleaned.endsWith('k')) {
    const num = parseFloat(cleaned.slice(0, -1))
    return isNaN(num) ? 0 : num * 1000
  }
  // Handle regular numbers
  const num = parseFloat(cleaned.replace(/,/g, ''))
  return isNaN(num) ? 0 : num
}

// Helper function to format input value for display (with k suffix if appropriate)
function formatInputValue(value: number, isIncome: boolean = false): string {
  if (!value) return ''
  // For income, show k format if >= 1000
  if (isIncome && value >= 1000 && value % 1000 === 0) {
    return (value / 1000).toString()
  }
  // For down payment, show k format if >= 1000
  if (!isIncome && value >= 1000 && value % 1000 === 0) {
    return (value / 1000).toString()
  }
  return value.toString()
}

export default function HDBAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(8000)
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState('8')
  const [downPayment, setDownPayment] = useState(100000)
  const [downPaymentInput, setDownPaymentInput] = useState('100')
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)
  const [otherDebts, setOtherDebts] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [realityCheckData, setRealityCheckData] = useState<any>(null)

  const handleCalculate = async () => {
    if (monthlyIncome <= 0 && downPayment <= 0) return
    setLoading(true)
    const calc = calculateAffordability(monthlyIncome, downPayment, loanYears, interestRate, otherDebts)
    setResults(calc)
    setLoading(false)
    // Track affordability calculation event
    AnalyticsEvents.affordabilityCalculate({ maxPrice: calc.maxPropertyPrice })
  }

  useEffect(() => {
    AnalyticsEvents.viewAffordability()
    handleCalculate()
    // Track affordability calculator usage
    recordBehaviorEvent({ type: 'affordability_calculator' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Track when user calculates (stronger signal)
    if (results) {
      recordBehaviorEvent({ 
        type: 'affordability_calculator',
        metadata: { maxPrice: results.maxPropertyPrice }
      })
      
      // Fetch reality check data
      async function fetchRealityCheck() {
        try {
          const params = new URLSearchParams()
          params.set('budget', results.maxPropertyPrice.toString())
          
          const res = await fetch(`/api/affordability/reality-check?${params.toString()}`)
          const data = await res.json()
          if (res.ok) {
            setRealityCheckData(data)
          }
        } catch (error) {
          console.error('Error fetching reality check:', error)
        }
      }
      
      fetchRealityCheck()
    }
  }, [results])


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Start with a comfortable range</h1>
          <p className="text-lg text-gray-600">Let's see what feels right for your household.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <ChartCard
            title="About your household"
            description="Tell us a bit about your household"
            icon={<Calculator className="w-6 h-6" />}
          >
            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Household Income <span className="text-xs font-normal text-gray-500">((Key factor for bank loan assessment))</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={monthlyIncomeInput}
                    onChange={(e) => {
                      const input = e.target.value
                      setMonthlyIncomeInput(input)
                      const parsed = parseKInput(input)
                      setMonthlyIncome(parsed)
                    }}
                    placeholder="e.g. 8k"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">k</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Common ranges:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyIncomeInput('7')
                      setMonthlyIncome(7000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    6–8k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyIncomeInput('9')
                      setMonthlyIncome(9000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    8–10k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyIncomeInput('11')
                      setMonthlyIncome(11000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    10–12k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyIncomeInput('12')
                      setMonthlyIncome(12000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    12k+
                  </button>
                </div>
                {monthlyIncome > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    ≈ {formatCurrency(monthlyIncome)} per month
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Down Payment
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={downPaymentInput}
                    onChange={(e) => {
                      const input = e.target.value
                      setDownPaymentInput(input)
                      const parsed = parseKInput(input)
                      setDownPayment(parsed)
                    }}
                    placeholder="e.g. 100k"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">k</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Typical amounts:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDownPaymentInput('50')
                      setDownPayment(50000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    50k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDownPaymentInput('100')
                      setDownPayment(100000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    100k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDownPaymentInput('150')
                      setDownPayment(150000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    150k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDownPaymentInput('200')
                      setDownPayment(200000)
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    200k+
                  </button>
                </div>
                {downPayment > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    ≈ {formatCurrency(downPayment)}
                  </p>
                )}
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
                  'Show my range'
                )}
              </button>
              {results && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Based on recent HDB resale transactions (last 12–24 months)
                </p>
              )}
            </div>
          </ChartCard>

          {/* Results */}
          <ChartCard
            title="A comfortable price range"
            description="Based on current HDB and bank guidelines."
            icon={<Home className="w-6 h-6" />}
          >
            {results ? (
              <div className="space-y-4">
                {/* Budget - As emphasis only */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">A comfortable price range</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-4xl font-bold text-purple-600">
                      {formatCurrency(results.maxPropertyPrice)}
                    </div>
                    <Link
                      href={(() => {
                        // Determine price tier based on budget
                        const budget = Math.round(results.maxPropertyPrice * 1.1)
                        let priceTier = 'all'
                        if (budget <= 500000) {
                          priceTier = 'low'
                        } else if (budget <= 1000000) {
                          priceTier = 'medium'
                        } else {
                          priceTier = 'high'
                        }
                        return `/neighbourhoods?price_tier=${priceTier}&source=affordability`
                      })()}
                      onClick={() => AnalyticsEvents.affordabilityToExplore()}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap"
                    >
                      See neighbourhoods that fit
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Supporting Details (expanded by default) */}
                <details open className="group bg-white/60 rounded-lg border border-gray-200">
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

        {/* Feedback Form */}
        {results && (
          <FeedbackForm
            context="affordability"
            question="Is this result very different from your expectation? What confuses you most? (Just one sentence)"
            placeholder="My situation is..."
            metadata={{ budget: results.maxPropertyPrice }}
            className="mt-8"
          />
        )}

      </main>
    </div>
  )
}

