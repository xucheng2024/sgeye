'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Calculator, Home, ArrowRight, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { LONG_TERM_RISK_DEFINITION } from '@/lib/constants'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import RealityCheckCard from '@/components/RealityCheckCard'
import DecisionPathCard from '@/components/DecisionPathCard'

export default function HDBAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(8000)
  const [downPayment, setDownPayment] = useState(100000)
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)
  const [otherDebts, setOtherDebts] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [realityCheckData, setRealityCheckData] = useState<any>(null)

  const handleCalculate = async () => {
    setLoading(true)
    const calc = calculateAffordability(monthlyIncome, downPayment, loanYears, interestRate, otherDebts)
    setResults(calc)
    setLoading(false)
  }

  useEffect(() => {
    handleCalculate()
    // Track affordability calculator usage
    recordBehaviorEvent({ type: 'affordability_calculator' })
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
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  What {formatCurrency(results.maxPropertyPrice)} means in reality
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-2">
                  With this budget, most families are choosing between:
                </p>
                <ul className="text-sm text-gray-800 space-y-1 mb-2 list-disc list-inside">
                  <li>Older flats with longer lease</li>
                  <li>Smaller homes closer to MRT</li>
                  <li>Lower school pressure areas further out</li>
                </ul>
                <p className="text-xs text-gray-600 italic">
                  The actual trade-offs depend on your priorities, not just the budget number.
                </p>
              </div>
            )}
            
            {results ? (
              <div className="space-y-4">
                {/* Budget - As emphasis only */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Your Budget Cap</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {formatCurrency(results.maxPropertyPrice)}
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


        {/* Reality Check Card */}
        {results && (
          <RealityCheckCard 
            budget={results.maxPropertyPrice}
            className="mt-8"
          />
        )}

        {/* Decision Path Card */}
        {results && realityCheckData && (
          <DecisionPathCard
            budget={results.maxPropertyPrice}
            realityCheckData={realityCheckData}
            className="mt-6"
          />
        )}


      </main>
    </div>
  )
}

