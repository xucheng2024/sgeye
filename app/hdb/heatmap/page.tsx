'use client'

import { useState, useEffect } from 'react'
import { getNeighbourhoodAggregated } from '@/lib/hdb-data'
import ChartCard from '@/components/ChartCard'
import { Map, ArrowRight } from 'lucide-react'
import { formatCurrency, formatCurrencyFull } from '@/lib/utils'
import Link from 'next/link'

const FLAT_TYPES = ['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']

interface NeighbourhoodData {
  neighbourhoodId: string
  neighbourhoodName: string
  planningAreaName: string | null
  medianPrice: number
  txCount: number
  flatType: string
}

export default function HDBHeatmapPage() {
  const [flatType, setFlatType] = useState('All')
  const [months, setMonths] = useState(3)
  const [data, setData] = useState<NeighbourhoodData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNeighbourhood, setHoveredNeighbourhood] = useState<string | null>(null)
  const [tooltipNeighbourhood, setTooltipNeighbourhood] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getNeighbourhoodAggregated(months, flatType === 'All' ? undefined : flatType)
      .then(result => {
        setData(result.sort((a, b) => b.medianPrice - a.medianPrice))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [flatType, months])

  // Calculate quantile buckets (5 equal groups)
  const getQuantileBuckets = () => {
    if (data.length === 0) return { buckets: [], priceRanges: [] }
    
    const sortedData = [...data].sort((a, b) => b.medianPrice - a.medianPrice)
    const bucketSize = Math.ceil(sortedData.length / 5)
    const buckets: Array<{ min: number; max: number; index: number }> = []
    const priceRanges: Array<{ min: number; max: number; label: string }> = []
    
    for (let i = 0; i < 5; i++) {
      const start = i * bucketSize
      const end = Math.min(start + bucketSize, sortedData.length)
      const bucketData = sortedData.slice(start, end)
      
      if (bucketData.length > 0) {
        const min = Math.min(...bucketData.map(d => d.medianPrice))
        const max = Math.max(...bucketData.map(d => d.medianPrice))
        buckets.push({ min, max, index: i })
        
        // Create label for price range (i=0 is highest, i=4 is lowest)
        let label = ''
        if (i === 0) label = 'Most expensive'
        else if (i === 1) label = 'Higher'
        else if (i === 2) label = 'Moderate'
        else if (i === 3) label = 'Lower'
        else label = 'Most affordable'
        priceRanges.push({ min, max, label })
      }
    }
    
    return { buckets, priceRanges }
  }

  const { buckets, priceRanges } = getQuantileBuckets()

  // Get color and border based on quantile bucket
  const getColorAndStyle = (price: number) => {
    if (buckets.length === 0) return { bg: 'rgba(59, 130, 246, 0.2)', border: 'transparent', textColor: 'text-gray-900' }
    
    // Find which bucket this price belongs to
    const bucketIndex = buckets.findIndex(b => price >= b.min && price <= b.max)
    const index = bucketIndex >= 0 ? bucketIndex : 4
    
    // 5 distinct color intensities: 100%, 80%, 60%, 40%, 30% (increased from 20% for better visibility)
    const intensities = [1.0, 0.8, 0.6, 0.4, 0.3]
    const intensity = intensities[index] || 0.3
    
    // Bottom 20% (most affordable) gets special treatment: lighter blue with prominent border
    if (index === 4) {
      return {
        bg: 'rgba(59, 130, 246, 0.3)',
        border: 'rgba(59, 130, 246, 0.8)',
        textColor: 'text-gray-900' // Dark text for light background
      }
    }
    
    // For darker backgrounds, use white text; for lighter, use dark text
    const textColor = intensity > 0.5 ? 'text-white' : 'text-gray-900'
    
    return {
      bg: `rgba(59, 130, 246, ${intensity})`,
      border: 'transparent',
      textColor
    }
  }

  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.medianPrice)) : 1
  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.medianPrice)) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">HDB Price Heatmap by Neighbourhood</h1>
          <p className="mt-2 text-gray-600">Use this view to compare typical resale prices across neighbourhoods. Data is aggregated by neighbourhood for more precise analysis.</p>
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

        <div className="mb-4 flex items-center justify-end">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Compare neighbourhoods
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ChartCard
          title="Neighbourhood Price Heatmap"
          description={`Neighbourhoods grouped by planning area, ranked by typical resale price (${months} month${months > 1 ? 's' : ''} rolling). Click any neighbourhood to view details.`}
          icon={<Map className="w-6 h-6" />}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[600px] text-gray-500">Loading...</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[600px] text-gray-500">No data available</div>
          ) : (
            <div className="space-y-4">
              {/* Color Legend */}
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Color indicates relative price level (ranked by median price), not exact differences.</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {priceRanges.map((range, index) => {
                    const intensities = [1.0, 0.8, 0.6, 0.4, 0.3]
                    const intensity = intensities[index] || 0.3
                    const isLast = index === priceRanges.length - 1
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-8 h-4 rounded flex-shrink-0"
                          style={{ 
                            backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                            border: isLast ? '2px solid rgba(59, 130, 246, 0.8)' : 'none'
                          }}
                        ></div>
                        <div className="text-xs text-gray-700">
                          <div className="font-semibold">{range.label}</div>
                        </div>
                        {index < priceRanges.length - 1 && (
                          <span className="text-gray-400 mx-1">→</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sample Size Warning */}
              {data.some(item => item.txCount < 50) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                  <div className="text-xs text-blue-800">
                    Some neighbourhoods have fewer recent transactions. Prices may fluctuate more due to limited data.
                  </div>
                </div>
              )}

              {/* Neighbourhood Grid - Grouped by Planning Area */}
              {(() => {
                // Group by planning area
                const groupedByPA: Record<string, NeighbourhoodData[]> = {}
                data.forEach(item => {
                  const paKey = item.planningAreaName || 'Other'
                  if (!groupedByPA[paKey]) {
                    groupedByPA[paKey] = []
                  }
                  groupedByPA[paKey].push(item)
                })

                return Object.entries(groupedByPA)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([planningArea, neighbourhoods]) => (
                    <div key={planningArea} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{planningArea}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {neighbourhoods.map((item) => {
                          const { bg, border, textColor } = getColorAndStyle(item.medianPrice)
                          const borderStyle = border !== 'transparent' ? `2px solid ${border}` : hoveredNeighbourhood === item.neighbourhoodId ? '2px solid #3b82f6' : '2px solid transparent'
                          
                          return (
                            <Link
                              key={item.neighbourhoodId}
                              href={`/neighbourhood/${item.neighbourhoodId}`}
                              className="p-4 rounded-lg transition-all cursor-pointer relative group"
                              style={{
                                backgroundColor: bg,
                                border: borderStyle,
                              }}
                              onMouseEnter={() => setHoveredNeighbourhood(item.neighbourhoodId)}
                              onMouseLeave={() => setHoveredNeighbourhood(null)}
                            >
                              <div className={`font-semibold text-sm mb-1 ${textColor}`}>{item.neighbourhoodName}</div>
                              <div className={`text-xs ${textColor} ${textColor === 'text-white' ? 'opacity-90' : 'opacity-80'}`}>
                                <div>Median: {formatCurrency(item.medianPrice)}</div>
                                <div>Volume: {item.txCount} transactions</div>
                                {item.txCount < 50 && (
                                  <div 
                                    className="mt-1 relative"
                                    onMouseEnter={() => setTooltipNeighbourhood(item.neighbourhoodId)}
                                    onMouseLeave={() => setTooltipNeighbourhood(null)}
                                  >
                                    <span className={`${textColor === 'text-white' ? 'text-blue-200' : 'text-blue-600'} cursor-help`}>Fewer recent transactions</span>
                                    {tooltipNeighbourhood === item.neighbourhoodId && (
                                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl z-50">
                                        Prices may fluctuate more due to limited data.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))
              })()}
            </div>
          )}
        </ChartCard>
      </main>
    </div>
  )
}

