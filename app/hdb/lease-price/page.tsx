'use client'

import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getLeasePriceData } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import HDBNav from '@/components/HDBNav'
import { Clock } from 'lucide-react'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']
const TOWNS = ['All', 'ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'CENTRAL AREA', 'CLEMENTI', 'TAMPINES', 'WOODLANDS']

export default function HDBLeasePricePage() {
  const [flatType, setFlatType] = useState('All')
  const [town, setTown] = useState('All')
  const [priceType, setPriceType] = useState<'total' | 'psm'>('total')
  const [data, setData] = useState<Array<{ leaseYears: number; price: number; pricePerSqm: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLeasePriceData(flatType === 'All' ? undefined : flatType, town === 'All' ? undefined : town, 2000)
      .then(result => {
        setData(result)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [flatType, town])

  const chartData = data.map(item => ({
    x: item.leaseYears,
    y: priceType === 'total' ? item.price : item.pricePerSqm,
    price: item.price,
    pricePerSqm: item.pricePerSqm,
  }))

  // Calculate binned averages for trend line
  const bins: { [key: number]: number[] } = {}
  chartData.forEach(point => {
    const bin = Math.floor(point.x / 5) * 5 // 5-year bins
    if (!bins[bin]) bins[bin] = []
    bins[bin].push(point.y)
  })

  const trendData = Object.keys(bins)
    .map(Number)
    .sort((a, b) => a - b)
    .map(bin => ({
      x: bin + 2.5, // Center of bin
      y: bins[bin].reduce((a, b) => a + b, 0) / bins[bin].length,
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      <HDBNav />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Lease Age vs Price</h1>
          <p className="mt-2 text-gray-600">Relationship between remaining lease and resale prices</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Display</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as 'total' | 'psm')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="total">Total Price</option>
                <option value="psm">Price per sqm</option>
              </select>
            </div>
          </div>
        </div>

        <ChartCard
          title="Remaining Lease vs Price"
          description="Scatter plot showing relationship between remaining lease years and resale price"
          icon={<Clock className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[500px] text-gray-500">Loading...</div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[500px] text-gray-500">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Remaining Lease"
                  unit=" years"
                  label={{ value: 'Remaining Lease (years)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={priceType === 'total' ? 'Price' : 'Price per sqm'}
                  unit={priceType === 'total' ? ' S$' : ' S$/sqm'}
                  label={{ value: priceType === 'total' ? 'Price (S$)' : 'Price per sqm (S$)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <div>Remaining Lease: {data.x.toFixed(1)} years</div>
                          <div>Total Price: S${data.price.toLocaleString()}</div>
                          <div>Price/sqm: S${data.pricePerSqm.toLocaleString()}</div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Scatter name="Transactions" dataKey="y" fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </main>
    </div>
  )
}

