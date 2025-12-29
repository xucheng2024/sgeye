'use client'

import { useState, useEffect } from 'react'
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine } from 'recharts'
import { getAggregatedMonthly } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { TrendingUp } from 'lucide-react'
import { formatNumber, formatCurrency, formatCurrencyFull } from '@/lib/utils'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']
const TOWNS = ['All', 'ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']

export default function HDBTrendsPage() {
  const [flatType, setFlatType] = useState('All')
  const [town, setTown] = useState('All')
  const [data, setData] = useState<Array<{
    month: string
    monthDate?: Date
    median: number
    p25: number
    p75: number
    volume: number
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getAggregatedMonthly(flatType === 'All' ? undefined : flatType, town === 'All' ? undefined : town)
        if (cancelled) return
        
        // When town is 'All', we need to aggregate across all towns for each month
        // When town is specific, we can use data directly
        let formatted
        if (town === 'All') {
          // Group by month and aggregate across all towns
          const monthMap = new Map<string, { month: string; prices: number[]; volumes: number[] }>()
          result.forEach(item => {
            const monthKey = item.month
            if (!monthMap.has(monthKey)) {
              monthMap.set(monthKey, {
                month: monthKey,
                prices: [],
                volumes: [],
              })
            }
            const entry = monthMap.get(monthKey)!
            entry.prices.push(item.median_price)
            entry.volumes.push(item.tx_count)
          })
          
          // Calculate aggregated values per month
          formatted = Array.from(monthMap.values()).map(entry => {
            const sortedPrices = entry.prices.sort((a: number, b: number) => a - b)
            const median = sortedPrices[Math.floor(sortedPrices.length / 2)]
            const p25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)]
            const p75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)]
            
            const monthDate = new Date(entry.month)
            return {
              month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              monthDate: monthDate,
              median: Math.round(median),
              p25: Math.round(p25),
              p75: Math.round(p75),
              volume: entry.volumes.reduce((a: number, b: number) => a + b, 0),
            }
          }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        } else {
          // Direct mapping when town is specific
          formatted = result.map(item => {
            const monthDate = new Date(item.month)
            return {
              month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              monthDate: monthDate,
              median: Math.round(item.median_price),
              p25: Math.round(item.p25_price),
              p75: Math.round(item.p75_price),
              volume: item.tx_count,
            }
          })
        }
        
        if (!cancelled) {
          setData(formatted)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching data:', err)
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [flatType, town])

  // Format Y-axis tick for prices
  const formatPriceTick = (value: number) => formatCurrency(value)
  
  // Format Y-axis tick for volume
  const formatVolumeTick = (value: number) => formatNumber(value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">HDB Resale Price Trends</h1>
          <p className="text-lg text-gray-600">Island-wide resale prices have risen steadily since 2020, despite fluctuations in transaction volume</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Takeaways - Moved above chart */}
        {data.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📌</span>
              <span>What This Chart Shows</span>
            </h3>
            <ul className="space-y-4 text-lg text-gray-800">
              <li className="font-semibold flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>HDB resale prices have risen steadily since 2020.</span>
              </li>
              <li className="font-semibold flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>Price differences between cheaper and pricier flats are widening.</span>
              </li>
              <li className="font-semibold flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>Transaction volumes fluctuate, but prices remain resilient.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Flat Type</label>
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                {FLAT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Town</label>
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                {TOWNS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {town === 'All' && flatType === 'All' ? (
                <>By default, trends reflect island-wide median prices across all flat types and towns.</>
              ) : town !== 'All' ? (
                <>Trends for {town} may differ from island-wide patterns due to location and flat mix.</>
              ) : (
                <>By default, trends reflect island-wide median prices across all flat types and towns.</>
              )}
            </p>
          </div>
        </div>

        {/* Price Trends Chart */}
        <ChartCard
          title="Price Trends"
          description="Most resale prices fall between the green and orange lines."
          icon={<TrendingUp className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[450px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading data...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[450px] text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            <div className="p-4">
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    yAxisId="left" 
                    tickFormatter={formatPriceTick}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'Price', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: 14, fontWeight: 600 } }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={formatVolumeTick}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'Volume', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#374151', fontSize: 14, fontWeight: 600 } }} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-lg shadow-xl">
                            <div className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">
                              {payload[0]?.payload?.month}
                            </div>
                            {payload.map((entry, index) => (
                              <div key={index} className="text-sm mb-1 last:mb-0">
                                <span className="font-medium text-gray-700">{entry.name}: </span>
                                {entry.name && entry.name.includes('Price') ? (
                                  <span className="font-semibold text-gray-900">{formatCurrencyFull(Number(entry.value))}</span>
                                ) : (
                                  <span className="font-semibold text-gray-900">{formatNumber(Number(entry.value))}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {/* COVID-19 Circuit Breaker annotation */}
                  {(() => {
                    const covidMonth = data.find(d => {
                      const date = d.monthDate || new Date(d.month)
                      return date >= new Date('2020-04-01') && date <= new Date('2020-06-30')
                    })
                    return covidMonth ? (
                      <ReferenceLine 
                        x={covidMonth.month} 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{ value: 'COVID-19 Circuit Breaker', position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 600 }} 
                      />
                    ) : null
                  })()}
                  {/* Order: Median, Lower Range, Upper Range, Volume */}
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Median Price (typical resale price)" 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="p25" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="6 4"
                    dot={false}
                    name="Lower Range (cheaper flats)" 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="p75" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="6 4"
                    dot={false}
                    name="Upper Range (pricier flats)" 
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="volume" 
                    fill="#8b5cf6" 
                    opacity={0.25}
                    radius={[4, 4, 0, 0]}
                    name="Transaction Volume" 
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </main>
    </div>
  )
}
