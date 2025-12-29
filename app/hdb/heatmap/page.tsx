'use client'

import { useState, useEffect } from 'react'
import { getTownAggregated } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import HDBNav from '@/components/HDBNav'
import { Map } from 'lucide-react'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']

export default function HDBHeatmapPage() {
  const [flatType, setFlatType] = useState('All')
  const [months, setMonths] = useState(3)
  const [data, setData] = useState<Array<{ town: string; medianPrice: number; txCount: number }>>([])
  const [loading, setLoading] = useState(true)
  const [hoveredTown, setHoveredTown] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getTownAggregated(months, flatType === 'All' ? undefined : flatType)
      .then(result => {
        setData(result.sort((a, b) => b.medianPrice - a.medianPrice))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [flatType, months])

  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.medianPrice)) : 1
  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.medianPrice)) : 0

  const getColorIntensity = (price: number) => {
    if (maxPrice === minPrice) return 100
    const ratio = (price - minPrice) / (maxPrice - minPrice)
    return Math.round(20 + ratio * 80) // 20% to 100% opacity
  }

  const getColor = (price: number) => {
    const intensity = getColorIntensity(price)
    return `rgba(59, 130, 246, ${intensity / 100})` // Blue scale
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HDBNav />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">HDB Price Heatmap by Town</h1>
          <p className="mt-2 text-gray-600">Visual representation of resale prices across Singapore</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period (months)</label>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Last 1 month</option>
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
              </select>
            </div>
          </div>
        </div>

        <ChartCard
          title="Town Price Heatmap"
          description={`Median resale prices by town (${months} month${months > 1 ? 's' : ''} rolling)`}
          icon={<Map className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[600px] text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[600px] text-gray-500">No data available</div>
          ) : (
            <div className="space-y-4">
              {/* Color Legend */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">Price Range:</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 bg-blue-200 rounded"></div>
                  <span className="text-gray-600">S${minPrice.toLocaleString()}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">S${maxPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Town Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.map((item) => (
                  <div
                    key={item.town}
                    className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor: getColor(item.medianPrice),
                      borderColor: hoveredTown === item.town ? '#3b82f6' : 'transparent',
                      color: 'white',
                    }}
                    onMouseEnter={() => setHoveredTown(item.town)}
                    onMouseLeave={() => setHoveredTown(null)}
                  >
                    <div className="font-semibold text-sm mb-1">{item.town}</div>
                    <div className="text-xs opacity-90">
                      <div>Median: S${item.medianPrice.toLocaleString()}</div>
                      <div>Volume: {item.txCount} transactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </main>
    </div>
  )
}

