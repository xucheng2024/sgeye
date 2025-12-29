'use client'

import { useState, useEffect } from 'react'
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine } from 'recharts'
import { getAggregatedMonthly } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { TrendingUp } from 'lucide-react'

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
        
        console.log('Fetched data:', result.length, 'records')
        if (result.length > 0) {
          console.log('Date range:', result[0].month, 'to', result[result.length - 1].month)
        }
        
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
        
        console.log('Formatted data points:', formatted.length)
        if (formatted.length > 0) {
          console.log('Display range:', formatted[0].month, 'to', formatted[formatted.length - 1].month)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">HDB Resale Price Trends</h1>
          <p className="mt-2 text-gray-600">Island-wide resale prices have risen steadily since 2020, despite fluctuations in transaction volume</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
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
          title="Price Trends (Median, P25, P75)"
          description="Post-2020 resale prices show sustained growth, with widening price dispersion"
          icon={<TrendingUp className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500">No data available</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  P25 / P75 show the lower and upper bounds of typical resale prices, indicating market dispersion.
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" label={{ value: 'Median Price (S$)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Volume', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                            {payload.map((entry, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{entry.name}: </span>
                                {entry.name && entry.name.includes('Price') ? (
                                  <span>S${Number(entry.value).toLocaleString()}</span>
                                ) : (
                                  <span>{Number(entry.value).toLocaleString()}</span>
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
                        strokeDasharray="3 3"
                        label={{ value: 'COVID-19 Circuit Breaker', position: 'top', fill: '#ef4444', fontSize: 10 }}
                      />
                    ) : null
                  })()}
                  {/* Order: Median, P25, P75, Volume */}
                  <Line yAxisId="left" type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={2} name="Median Price (S$)" />
                  <Line yAxisId="left" type="monotone" dataKey="p25" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="P25 Price (S$)" />
                  <Line yAxisId="left" type="monotone" dataKey="p75" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="P75 Price (S$)" />
                  <Bar yAxisId="right" dataKey="volume" fill="#8b5cf6" opacity={0.3} name="Transaction Volume" />
                  <Legend />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Key Takeaways */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Takeaways</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Median resale prices have shown a sustained upward trend since 2020.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Transaction volumes fluctuated significantly during the pandemic but recovered thereafter.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>The widening gap between P25 and P75 suggests increasing price dispersion across the market.</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}

