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
        const formatted = result.map(item => ({
          month: new Date(item.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          median: Math.round(item.median_price),
          p25: Math.round(item.p25_price),
          p75: Math.round(item.p75_price),
          volume: item.tx_count,
        }))
        setData(formatted)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
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

