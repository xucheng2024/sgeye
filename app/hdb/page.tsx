'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { getAggregatedMonthly } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import HDBNav from '@/components/HDBNav'
import { TrendingUp } from 'lucide-react'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']
const TOWNS = ['All', 'ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']

export default function HDBTrendsPage() {
  const [flatType, setFlatType] = useState('All')
  const [town, setTown] = useState('All')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAggregatedMonthly(flatType === 'All' ? undefined : flatType, town === 'All' ? undefined : town)
      .then(result => {
        console.log('Fetched data:', result.length, 'records')
        if (result.length > 0) {
          console.log('Date range:', result[0].month, 'to', result[result.length - 1].month)
        }
        
        console.log('Fetched data:', result.length, 'records')
        if (result.length > 0) {
          console.log('First record:', result[0])
          console.log('Last record:', result[result.length - 1])
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
            
            return {
              month: new Date(entry.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              median: Math.round(median),
              p25: Math.round(p25),
              p75: Math.round(p75),
              volume: entry.volumes.reduce((a: number, b: number) => a + b, 0),
            }
          }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        } else {
          // Direct mapping when town is specific
          formatted = result.map(item => ({
            month: new Date(item.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            median: Math.round(item.median_price),
            p25: Math.round(item.p25_price),
            p75: Math.round(item.p75_price),
            volume: item.tx_count,
          }))
        }
        
        console.log('Formatted data points:', formatted.length)
        if (formatted.length > 0) {
          console.log('Display range:', formatted[0].month, 'to', formatted[formatted.length - 1].month)
        }
        
        setData(formatted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setLoading(false)
      })
  }, [flatType, town])

  return (
    <div className="min-h-screen bg-gray-50">
      <HDBNav />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">HDB Resale Price Trends</h1>
          <p className="mt-2 text-gray-600">Island-wide price trends and transaction volume</p>
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
        </div>

        {/* Price Trends Chart */}
        <ChartCard
          title="Price Trends (Median, P25, P75)"
          description="Monthly median resale price with 25th and 75th percentiles"
          icon={<TrendingUp className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" label={{ value: 'Price (S$)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Volume', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  formatter={(value: any, name?: string) => {
                    if (name && name.includes('Price')) {
                      return [`S$${value.toLocaleString()}`, name]
                    }
                    return [`S$${value.toLocaleString()}`, name || '']
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={2} name="Median Price (S$)" />
                <Line yAxisId="left" type="monotone" dataKey="p25" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="P25 Price (S$)" />
                <Line yAxisId="left" type="monotone" dataKey="p75" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="P75 Price (S$)" />
                <Bar yAxisId="right" dataKey="volume" fill="#8b5cf6" opacity={0.3} name="Transaction Volume" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </main>
    </div>
  )
}

