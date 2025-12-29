'use client'

import { useState, useEffect } from 'react'
import { calculateAffordability, findAffordableProperties, getMedianRent, calculateMonthlyMortgage } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Calculator, Home, Scale } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'CENTRAL AREA', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']
const FLAT_TYPES_RENT = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']

export default function HDBAffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(8000)
  const [downPayment, setDownPayment] = useState(100000)
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)
  const [otherDebts, setOtherDebts] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [affordableProperties, setAffordableProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Rent vs Buy state
  const [rentTown, setRentTown] = useState('ANG MO KIO')
  const [rentFlatType, setRentFlatType] = useState('4 ROOM')
  const [medianRent, setMedianRent] = useState<number | null>(null)
  const [rentLoading, setRentLoading] = useState(false)

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

  // Fetch median rent when town or flat type changes
  useEffect(() => {
    const fetchRent = async () => {
      setRentLoading(true)
      const rent = await getMedianRent(rentTown, rentFlatType, 6)
      setMedianRent(rent)
      setRentLoading(false)
    }
    fetchRent()
  }, [rentTown, rentFlatType])

  const chartData = affordableProperties.slice(0, 15).map(p => ({
    town: p.town.length > 12 ? p.town.substring(0, 12) + '...' : p.town,
    fullTown: p.town,
    medianPrice: p.medianPrice,
    p25Price: p.p25Price,
    txCount: p.txCount,
    flatType: p.flatType,
    medianLeaseYears: Math.round(p.medianLeaseYears || 0),
    label: `${p.town} • ${p.flatType} • ${Math.round(p.medianLeaseYears || 0)}y lease`,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <div className="text-sm text-gray-600 mb-2">Maximum Property Price</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Max by Loan Capacity:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        S${results.maxPropertyPriceByBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Max by Down Payment / LTV:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        S${results.constraints.ltv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-purple-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">👉 Final Budget:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          S${results.maxPropertyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 italic">
                    Your purchase price is limited by down payment and LTV, not monthly affordability.
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

        {/* Lease Risk Warning */}
        {results && results.maxPropertyPrice < 500000 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-xl">⚠️</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-amber-900 mb-1">Lease Risk Consideration</div>
                <div className="text-xs text-amber-800">
                  Based on recent resale data, properties under S${results.maxPropertyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} are mostly concentrated in flats with remaining lease below ~55 years.
                  Such flats may face future resale and financing constraints.
                </div>
                <div className="text-xs text-amber-700 mt-2 italic">
                  Remember: "Affordable" ≠ "Worth buying". This tool helps you avoid pitfalls, not just find listings.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affordable Properties */}
        {affordableProperties.length > 0 && (
          <ChartCard
            title="Affordable Properties"
            description={`Top ${Math.min(15, affordableProperties.length)} affordable options sorted by closest match to your budget (P50 price)`}
            icon={<Home className="w-6 h-6" />}
          >
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
                <YAxis label={{ value: 'Price (S$)', angle: -90, position: 'insideLeft' }} />
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
                            <p className="text-sm">P25: S${data.p25Price.toLocaleString()}</p>
                            <p className="text-sm">Median: S${data.medianPrice.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Transactions: {data.txCount}</p>
                          </div>
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
            <div className="mt-4 text-xs text-gray-500">
              <p className="mb-1">Each bar shows: <span className="font-medium">Town • Flat Type • Median Remaining Lease</span></p>
              <p>Sorted by closest match to your budget (P50 median price)</p>
            </div>
          </ChartCard>
        )}

        {/* Rent vs Buy Comparison */}
        {results && (
          <ChartCard
            title="Rent vs Buy Comparison"
            description="Compare monthly mortgage payment with median rental costs"
            icon={<Scale className="w-6 h-6" />}
          >
            <div className="space-y-6">
              {/* Selection for comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
                  <select
                    value={rentTown}
                    onChange={(e) => setRentTown(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TOWNS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type</label>
                  <select
                    value={rentFlatType}
                    onChange={(e) => setRentFlatType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FLAT_TYPES_RENT.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Results */}
              {rentLoading ? (
                <div className="text-center text-gray-500 py-8">Loading rental data...</div>
              ) : medianRent ? (
                <div className="space-y-4">
                  {/* Buy Option */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏠</span>
                      <span className="text-lg font-semibold text-gray-900">Buy</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Monthly mortgage:</div>
                      <div className="text-2xl font-bold text-blue-600">
                        S${calculateMonthlyMortgage(results.maxLoanAmount, loanYears, interestRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Assumes {loanYears}y loan @ {interestRate}%)
                      </div>
                    </div>
                  </div>

                  {/* Rent Option */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏡</span>
                      <span className="text-lg font-semibold text-gray-900">Rent</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Median rent (same town & flat type):</div>
                      <div className="text-2xl font-bold text-green-600">
                        S${medianRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Based on last 6 months)
                      </div>
                    </div>
                  </div>

                  {/* Difference */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔍</span>
                      <span className="text-lg font-semibold text-gray-900">Difference</span>
                    </div>
                    {(() => {
                      const mortgage = calculateMonthlyMortgage(results.maxLoanAmount, loanYears, interestRate)
                      const diff = medianRent - mortgage
                      const isRentHigher = diff > 0
                      return (
                        <div className="space-y-1">
                          <div className={`text-lg font-semibold ${isRentHigher ? 'text-green-600' : 'text-blue-600'}`}>
                            {isRentHigher ? (
                              <>Renting costs ~S${Math.abs(diff).toLocaleString(undefined, { maximumFractionDigits: 0 })} more per month</>
                            ) : (
                              <>Buying costs ~S${Math.abs(diff).toLocaleString(undefined, { maximumFractionDigits: 0 })} more per month</>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            {isRentHigher ? (
                              <>No equity accumulation with renting</>
                            ) : (
                              <>Buying builds equity over time</>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No rental data available for {rentTown} {rentFlatType}
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-sm">ℹ️</span>
                  <div className="text-xs text-amber-800">
                    <div className="font-medium mb-1">Important Note:</div>
                    <div>Rental figures are based on historical median rents for whole-flat rentals in the selected town and flat type. Actual rents vary by floor level, condition, and furnishings. This comparison is for reference only and does not constitute financial advice.</div>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        )}
      </main>
    </div>
  )
}

