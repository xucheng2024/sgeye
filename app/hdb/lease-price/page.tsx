'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getBinnedLeasePriceData, BinnedLeaseData } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Clock } from 'lucide-react'

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
            description="Median, P25, and P75 prices by lease range (binned)"
            icon={<Clock className="w-6 h-6" />}
          >
            {loading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">Loading...</div>
            ) : totalPriceChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={totalPriceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="leaseRange" 
                    label={{ value: 'Remaining Lease (years)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Price (S$)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `S$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                            <div className="font-semibold mb-2">Lease Range: {data.leaseRange} years</div>
                            <div>Median: S${data.median.toLocaleString()}</div>
                            <div>P25: S${data.p25.toLocaleString()}</div>
                            <div>P75: S${data.p75.toLocaleString()}</div>
                            <div className="mt-2 text-sm text-gray-500">Count: {data.count} transactions</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Median Price"
                    dot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p25" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="P25 Price"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p75" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="P75 Price"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Price per sqm Chart */}
        <div>
          <ChartCard
            title="Price per sqm vs Remaining Lease"
            description="Median, P25, and P75 prices per sqm by lease range (binned) - shows market's early response to lease decay"
            icon={<Clock className="w-6 h-6" />}
          >
            {loading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">Loading...</div>
            ) : pricePerSqmChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={pricePerSqmChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="leaseRange" 
                    label={{ value: 'Remaining Lease (years)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Price per sqm (S$)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                            <div className="font-semibold mb-2">Lease Range: {data.leaseRange} years</div>
                            <div>Median: S${data.median.toLocaleString()}</div>
                            <div>P25: S${data.p25.toLocaleString()}</div>
                            <div>P75: S${data.p75.toLocaleString()}</div>
                            <div className="mt-2 text-sm text-gray-500">Count: {data.count} transactions</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Median Price/sqm"
                    dot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p25" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="P25 Price/sqm"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p75" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="P75 Price/sqm"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  )
}

