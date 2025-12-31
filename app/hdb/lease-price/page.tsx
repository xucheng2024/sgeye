'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getBinnedLeasePriceData, BinnedLeaseData } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react'
import CompareTownsCTA from '@/components/CompareTownsCTA'
import { formatCurrency, formatCurrencyFull } from '@/lib/utils'
import Link from 'next/link'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']
const TOWNS = ['All', 'ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'CENTRAL AREA', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']

export default function HDBLeasePricePage() {
  const [flatType, setFlatType] = useState('All')
  const [town, setTown] = useState('All')
  const [binnedData, setBinnedData] = useState<BinnedLeaseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getBinnedLeasePriceData(
          flatType === 'All' ? undefined : flatType,
          town === 'All' ? undefined : town,
          10000
        )
        if (!cancelled) {
          console.log('Binned lease data:', result)
          setBinnedData(result)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching binned lease data:', err)
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [flatType, town])

  // Format data for total price chart
  const totalPriceChartData = binnedData.map(bin => ({
    leaseRange: bin.binLabel,
    median: Math.round(bin.medianPrice),
    p25: Math.round(bin.p25Price),
    p75: Math.round(bin.p75Price),
    count: bin.count,
  }))

  // Format data for price per sqm chart
  const pricePerSqmChartData = binnedData.map(bin => ({
    leaseRange: bin.binLabel,
    median: Math.round(bin.medianPricePerSqm),
    p25: Math.round(bin.p25PricePerSqm),
    p75: Math.round(bin.p75PricePerSqm),
    count: bin.count,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Lease Depreciation Analysis</h1>
          <p className="mt-2 text-gray-600">Relationship between remaining lease years and resale prices (binned with median, P25, P75)</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Insight - Layer 1 */}
        {binnedData.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Key Insight</h3>
                <p className="text-base text-gray-800 leading-relaxed">
                  Based on recent resale data, HDB prices begin to show significant discounting when remaining lease falls below 60 years.
                  The market appears to price lease decay earlier through price per sqm, even when total prices remain relatively stable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Module 1: Lease Risk Threshold */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📌</span>
            Lease Risk Guide
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Remaining Lease</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Market Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">≥ 80 years</td>
                  <td className="py-3 px-4 text-gray-700">Low risk. Market treats as long-term asset</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">70–79 years</td>
                  <td className="py-3 px-4 text-gray-700">Generally stable pricing</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-amber-50/30">
                  <td className="py-3 px-4 font-semibold text-amber-700">60–69 years</td>
                  <td className="py-3 px-4 text-gray-700">Early discounting begins (watch carefully)</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-orange-50/30">
                  <td className="py-3 px-4 font-semibold text-orange-700">&lt; 60 years</td>
                  <td className="py-3 px-4 text-gray-700">Higher resale &amp; financing risk</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-red-50/30">
                  <td className="py-3 px-4 font-semibold text-red-700">&lt; 55 years</td>
                  <td className="py-3 px-4 text-gray-700">Limited buyer pool, bank constraints likely</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flat Type</label>
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FLAT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TOWNS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Total Price Chart */}
        <div className="mb-6">
          <ChartCard
            title="Total Price vs Remaining Lease"
            description="How total resale prices change as remaining lease decreases"
            icon={<Clock className="w-6 h-6" />}
          >
            {loading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">Loading...</div>
            ) : totalPriceChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={totalPriceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="leaseRange" 
                    label={{ value: 'Remaining Lease (years)', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Price (S$)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  {/* 60 years reference line */}
                  {(() => {
                    const sixtyYearBin = totalPriceChartData.find(d => {
                      const range = d.leaseRange.split('–')
                      if (range.length === 2) {
                        const min = parseInt(range[0])
                        const max = parseInt(range[1])
                        return min <= 60 && max >= 60
                      }
                      return false
                    })
                    return sixtyYearBin ? (
                      <ReferenceLine 
                        x={sixtyYearBin.leaseRange} 
                        stroke="#9ca3af" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{ value: 'Common financing caution zone (~60 years)', position: 'top', fill: '#6b7280', fontSize: 11 }}
                      />
                    ) : null
                  })()}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-lg shadow-xl">
                            <div className="font-semibold mb-3 text-gray-900 border-b border-gray-200 pb-2">
                              Lease Range: {data.leaseRange} years
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Typical prices (median): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.median)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Lower-bound prices (25% below): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.p25)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Upper-bound prices (top 25%): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.p75)}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 text-xs text-gray-500 border-t border-gray-200">
                              {data.count} transactions
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                  {/* Order: Median (bold), then P25/P75 (dashed, lighter) */}
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    name="Typical prices (median)"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p25" 
                    stroke="#10b981" 
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeOpacity={0.6}
                    name="Lower-bound prices (25% of transactions below)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p75" 
                    stroke="#f59e0b" 
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeOpacity={0.6}
                    name="Upper-bound prices (top 25%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Price per sqm Chart */}
        <div className="mb-8">
          <ChartCard
            title="Price per sqm vs Remaining Lease"
            description="Shows market's early response to lease decay - price per sqm often declines earlier than total price"
            icon={<Clock className="w-6 h-6" />}
          >
            {loading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">Loading...</div>
            ) : pricePerSqmChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={pricePerSqmChartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="leaseRange" 
                    label={{ value: 'Remaining Lease (years)', position: 'insideBottom', offset: -5 }}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Price per sqm (S$)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  {/* 60 years reference line */}
                  {(() => {
                    const sixtyYearBin = pricePerSqmChartData.find(d => {
                      const range = d.leaseRange.split('–')
                      if (range.length === 2) {
                        const min = parseInt(range[0])
                        const max = parseInt(range[1])
                        return min <= 60 && max >= 60
                      }
                      return false
                    })
                    return sixtyYearBin ? (
                      <ReferenceLine 
                        x={sixtyYearBin.leaseRange} 
                        stroke="#9ca3af" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{ value: 'Common financing caution zone (~60 years)', position: 'top', fill: '#6b7280', fontSize: 11 }}
                      />
                    ) : null
                  })()}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        // Calculate percentage difference from 70-80 years bin if available
                        const referenceBin = pricePerSqmChartData.find(d => d.leaseRange.includes('70') || d.leaseRange.includes('80'))
                        const percentDiff = referenceBin ? ((data.median - referenceBin.median) / referenceBin.median * 100) : null
                        
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-lg shadow-xl">
                            <div className="font-semibold mb-3 text-gray-900 border-b border-gray-200 pb-2">
                              Lease Range: {data.leaseRange} years
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Typical prices (median): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.median)}</span>
                              </div>
                              {percentDiff !== null && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {percentDiff < 0 ? `${Math.abs(percentDiff).toFixed(1)}% lower` : `${percentDiff.toFixed(1)}% higher`} than 70–80 years range
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-700">Lower-bound prices (25% below): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.p25)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Upper-bound prices (top 25%): </span>
                                <span className="font-semibold text-gray-900">{formatCurrencyFull(data.p75)}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 text-xs text-gray-500 border-t border-gray-200">
                              {data.count} transactions
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                  {/* Order: Median (bold), then P25/P75 (dashed, lighter) */}
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    name="Typical prices (median)"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p25" 
                    stroke="#10b981" 
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeOpacity={0.6}
                    name="Lower-bound prices (25% of transactions below)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p75" 
                    stroke="#f59e0b" 
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeOpacity={0.6}
                    name="Upper-bound prices (top 25%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Module 2: Decision Signals */}
        {binnedData.length > 0 && (() => {
          // Calculate decision signals from data
          const lowLeaseBins = binnedData.filter(bin => {
            const range = bin.binLabel.split('–')
            if (range.length === 2) {
              const max = parseInt(range[1])
              return max < 60
            }
            return false
          })
          const hasLowLease = lowLeaseBins.length > 0
          const hasEarlyDiscount = binnedData.some(bin => {
            const range = bin.binLabel.split('–')
            if (range.length === 2) {
              const min = parseInt(range[0])
              const max = parseInt(range[1])
              return min >= 60 && max < 70
            }
            return false
          })
          
          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🧭</span>
                Decision Signals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Lease Risk:</span>
                    <span className={`text-sm font-semibold ${hasLowLease ? 'text-red-600' : hasEarlyDiscount ? 'text-amber-600' : 'text-green-600'}`}>
                      {hasLowLease ? '⚠ High' : hasEarlyDiscount ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Market Pricing:</span>
                    <span className={`text-sm font-semibold ${hasEarlyDiscount || hasLowLease ? 'text-amber-600' : 'text-green-600'}`}>
                      {hasEarlyDiscount || hasLowLease ? 'Early discount detected' : 'Stable pricing'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Financing Outlook:</span>
                    <span className={`text-sm font-semibold ${hasLowLease ? 'text-red-600' : hasEarlyDiscount ? 'text-amber-600' : 'text-green-600'}`}>
                      {hasLowLease ? 'Increasingly constrained' : hasEarlyDiscount ? 'Watch carefully' : 'Generally available'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Best For:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {hasLowLease ? (
                        <>
                          <li>• Shorter holding periods</li>
                          <li>• Cash buyers</li>
                          <li>• Buyers comfortable with lease trade-offs</li>
                        </>
                      ) : (
                        <>
                          <li>• Long-term owner-occupiers</li>
                          <li>• Buyers seeking stable resale value</li>
                        </>
                      )}
                    </ul>
                  </div>
                  {(hasLowLease || hasEarlyDiscount) && (
                    <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Caution If:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Relying on future resale</li>
                        <li>• Planning to upgrade or move</li>
                        {hasLowLease && <li>• Need financing flexibility</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* What this means for buyers - Layer 3 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">What this means for buyers</h3>
          <div className="space-y-4 text-gray-700 mb-6">
            <p>
              Flats with &lt;60 years remaining lease may appear affordable but carry higher resale and financing risk.
            </p>
            <p>
              For owner-occupiers planning long-term stay, price per sqm reflects market caution earlier than total price.
            </p>
            <p>
              Consider combining this with the Affordability and Rent vs Buy tools.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/hdb/affordability"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Check how lease risk affects your buying options
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-500">
              See what flats are affordable without crossing risky lease thresholds
            </p>
          </div>
        </div>

        {/* Redirect CTA to Compare Towns */}
        <CompareTownsCTA text="See how lease risk affects your neighbourhood choice" />
      </main>
    </div>
  )
}

