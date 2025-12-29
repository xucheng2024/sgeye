'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability, findAffordableProperties } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import HDBNav from '@/components/HDBNav'
import { Calculator, Home } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  const chartData = affordableProperties.slice(0, 15).map(p => ({
    town: p.town.length > 12 ? p.town.substring(0, 12) + '...' : p.town,
    fullTown: p.town,
    medianPrice: p.medianPrice,
    p25Price: p.p25Price,
    txCount: p.txCount,
    flatType: p.flatType,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <HDBNav />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Can I Afford It?</h1>
          <p className="mt-2 text-gray-600">Calculate your affordability and find suitable HDB flats</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <ChartCard
            title="Your Financial Profile"
            description="Enter your financial details to calculate affordability"
            icon={<Calculator className="w-6 h-6" />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Gross Income (S$)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20 years</option>
                  <option value={25}>25 years (HDB max)</option>
                  <option value={30}>30 years (Bank loan)</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">Car loans, credit cards, etc.</p>
              </div>

              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate Affordability'}
              </button>
            </div>
          </ChartCard>

          {/* Results */}
          <ChartCard
            title="Your Affordability Results"
            description="Based on MSR, TDSR, and LTV regulations"
            icon={<Home className="w-6 h-6" />}
          >
            {results ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Maximum Monthly Payment</div>
                  <div className="text-2xl font-bold text-blue-600">
                    S${results.maxMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    MSR: S${results.constraints.msr.toLocaleString()} | TDSR: S${results.constraints.tdsr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Maximum Loan Amount</div>
                  <div className="text-2xl font-bold text-green-600">
                    S${results.maxLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Maximum Property Price</div>
                  <div className="text-2xl font-bold text-purple-600">
                    S${results.maxPropertyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    LTV limit: S${results.constraints.ltv.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Regulatory Constraints:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
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

        {/* Affordable Properties */}
        {affordableProperties.length > 0 && (
          <ChartCard
            title="Affordable Properties"
            description={`Top ${Math.min(15, affordableProperties.length)} affordable options based on your budget`}
            icon={<Home className="w-6 h-6" />}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="town" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Price (S$)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value: any, name?: string) => {
                    if (name === 'P25 Price') {
                      return [`S$${value.toLocaleString()}`, 'P25 Price (Conservative)']
                    }
                    if (name === 'Median Price') {
                      return [`S$${value.toLocaleString()}`, 'Median Price']
                    }
                    return [`S$${value.toLocaleString()}`, name || '']
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{data.fullTown}</p>
                          <p className="text-sm text-gray-600">{data.flatType}</p>
                          <p className="text-sm">P25: S${data.p25Price.toLocaleString()}</p>
                          <p className="text-sm">Median: S${data.medianPrice.toLocaleString()}</p>
                          <p className="text-sm">Transactions: {data.txCount}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="p25Price" fill="#10b981" name="P25 Price (Conservative)" />
                <Bar dataKey="medianPrice" fill="#3b82f6" name="Median Price" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </main>
    </div>
  )
}

