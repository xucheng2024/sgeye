'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, AlertCircle, Home, TrendingUp } from 'lucide-react'
import CompareTownsCTA from '@/components/CompareTownsCTA'
import ChartCard from '@/components/ChartCard'
import { 
  calculateSchoolPressureIndex, 
  getSchoolLandscape, 
  getTownsWithSchools,
  SchoolPressureIndex,
  SchoolLandscape 
} from '@/lib/school-data'
import { getTownProfile, TownProfile } from '@/lib/hdb-data'
import { formatCurrency } from '@/lib/utils'

const TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']

export default function PSLESchoolPage() {
  const [selectedTown, setSelectedTown] = useState<string>('ANG MO KIO')
  const [landscape, setLandscape] = useState<SchoolLandscape | null>(null)
  const [spi, setSpi] = useState<SchoolPressureIndex | null>(null)
  const [housingProfile, setHousingProfile] = useState<TownProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableTowns, setAvailableTowns] = useState<string[]>(TOWNS)

  useEffect(() => {
    loadTowns()
  }, [])

  useEffect(() => {
    if (selectedTown) {
      loadData()
    }
  }, [selectedTown])

  async function loadTowns() {
    try {
      const towns = await getTownsWithSchools()
      if (towns.length > 0) {
        setAvailableTowns(towns)
        if (!towns.includes(selectedTown)) {
          setSelectedTown(towns[0])
        }
      }
    } catch (error) {
      console.error('Error loading towns:', error)
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const [landscapeData, spiData, housingData] = await Promise.all([
        getSchoolLandscape(selectedTown),
        calculateSchoolPressureIndex(selectedTown),
        getTownProfile(selectedTown, '4 ROOM')
      ])
      
      setLandscape(landscapeData)
      setSpi(spiData)
      setHousingProfile(housingData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getSPIColor(level: string) {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  function getSPIBadge(level: string) {
    switch (level) {
      case 'low': return '🟢 Low pressure'
      case 'medium': return '🟡 Medium'
      case 'high': return '🔴 High pressure'
      default: return '⚪ Unknown'
    }
  }

  function getHousingSummary(profile: TownProfile | null): string {
    if (!profile) return 'No housing data available'
    
    const price = profile.medianResalePrice
    const lease = profile.medianRemainingLease
    
    let summary = 'Housing:\n'
    
    if (price < 400000) {
      summary += 'Prices are lower'
    } else if (price < 600000) {
      summary += 'Prices are moderate'
    } else {
      summary += 'Prices are higher'
    }
    
    summary += ', and remaining lease is '
    
    if (lease < 60) {
      summary += 'shorter (higher risk)'
    } else if (lease < 70) {
      summary += 'moderate'
    } else {
      summary += 'relatively healthy'
    }
    
    summary += '.'
    
    return summary
  }

  function getSchoolSummary(landscape: SchoolLandscape | null, spi: SchoolPressureIndex | null): string {
    if (!landscape && !spi) return 'No school data available'
    
    let summary = 'Schools:\n'
    
    if (spi) {
      if (spi.level === 'high') {
        summary += 'Higher competition pressure'
      } else if (spi.level === 'medium') {
        summary += 'Moderate competition pressure'
      } else {
        summary += 'Lower competition pressure'
      }
    }
    
    if (landscape) {
      summary += ', '
      if (landscape.highDemandSchools === 0) {
        summary += 'many lower-pressure options, fewer &quot;must-fight&quot; schools'
      } else if (landscape.highDemandSchools <= 2) {
        summary += 'some high-demand schools, but also many lower-pressure options'
      } else {
        summary += 'more high-demand schools, requiring more strategic planning'
      }
    }
    
    summary += '.'
    
    return summary
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PSLE & School Location</h1>
          <p className="mt-2 text-gray-600">
            Understand structural school pressure and housing trade-offs by location
          </p>
          <p className="mt-1 text-xs text-gray-500 italic">
            This tool helps you understand structural constraints, not individual school selection.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Town Selector */}
        <div className="mb-6">
          <label htmlFor="town-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Town / Planning Area
          </label>
          <select
            id="town-select"
            value={selectedTown}
            onChange={(e) => setSelectedTown(e.target.value)}
            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          >
            {availableTowns.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading school and housing data...
          </div>
        ) : (
          <>
            {/* Module 1: School Landscape */}
            <ChartCard
              title="School Landscape"
              description="Primary school distribution and cut-off patterns in this area"
              icon={<GraduationCap className="w-6 h-6" />}
            >
              {landscape ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">{landscape.schoolCount}</div>
                      <div className="text-sm text-blue-700">Primary Schools</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">
                        {landscape.cutoffDistribution.low === 0 ? '—' : landscape.cutoffDistribution.low}
                      </div>
                      <div className="text-sm text-green-700">Low Cut-off (≤230)</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-900">
                        {landscape.cutoffDistribution.mid === 0 ? '—' : landscape.cutoffDistribution.mid}
                      </div>
                      <div className="text-sm text-yellow-700">Mid Cut-off (231-250)</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-900">
                        {landscape.cutoffDistribution.high === 0 ? '—' : landscape.cutoffDistribution.high}
                      </div>
                      <div className="text-sm text-red-700">High Cut-off (≥251)</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {landscape.highDemandSchools > 0 
                        ? `${landscape.highDemandSchools} high-demand school${landscape.highDemandSchools > 1 ? 's' : ''} in this area.`
                        : landscape.cutoffDistribution.low === 0 && landscape.cutoffDistribution.mid === 0 && landscape.cutoffDistribution.high === 0
                        ? 'Cut-off data not yet available for schools in this area. Most schools here typically fall into lower-to-mid demand ranges.'
                        : 'No high-demand schools identified in recent data. Most schools here fall into lower-to-mid demand ranges.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No school data available for {selectedTown}
                </div>
              )}
            </ChartCard>

            {/* Module 2: Education Reality Conclusion Card */}
            {spi && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Education Reality for {selectedTown}
                </h3>
                {spi.level === 'low' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟢</span>
                    <p className="text-base text-gray-800">
                      <strong>Good news:</strong> Most families here face relatively low competition for primary schools.
                    </p>
                  </div>
                ) : spi.level === 'high' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔴</span>
                    <p className="text-base text-gray-800">
                      <strong>Higher pressure:</strong> Competition for primary schools is more intense here, with fewer lower-risk options.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟡</span>
                    <p className="text-base text-gray-800">
                      <strong>Moderate pressure:</strong> School competition varies, with a mix of options available.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Module 2: School Pressure Index */}
            <ChartCard
              title="School Pressure Index"
              description="Structural pressure level based on competition, choice constraints, and market dynamics"
              icon={<TrendingUp className="w-6 h-6" />}
            >
              {spi ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-gray-900">SPI: {spi.spi}</div>
                      <div className="text-sm text-gray-600 font-medium mt-1">
                        ({spi.level === 'low' ? 'Low pressure' : spi.level === 'medium' ? 'Moderate pressure' : 'High pressure'})
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Pressure Index (0-100)</div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold ${getSPIColor(spi.level)}`}>
                      {getSPIBadge(spi.level)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Demand Pressure</div>
                      <div className="text-lg font-semibold">{spi.demandPressure}</div>
                      <div className="text-xs text-gray-500 mt-1">→ How many families are competing for top schools</div>
                      <div className="text-xs text-gray-400 mt-1">Weight: 40%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Choice Constraint</div>
                      <div className="text-lg font-semibold">{spi.choiceConstraint}</div>
                      <div className="text-xs text-gray-500 mt-1">→ How many &quot;safe&quot; school options you have</div>
                      <div className="text-xs text-gray-400 mt-1">Weight: 30%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Uncertainty</div>
                      <div className="text-lg font-semibold">{spi.uncertainty}</div>
                      <div className="text-xs text-gray-500 mt-1">→ How predictable outcomes are year to year</div>
                      <div className="text-xs text-gray-400 mt-1">Weight: 20%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Crowding</div>
                      <div className="text-lg font-semibold">{spi.crowding}</div>
                      <div className="text-xs text-gray-500 mt-1">→ How stretched local schools may be</div>
                      <div className="text-xs text-gray-400 mt-1">Weight: 10%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-800 mb-2">
                      <strong>Key factor:</strong> {spi.explanation}
                    </p>
                    {spi.dominantFactor === 'uncertainty' && (
                      <p className="text-xs text-gray-700 italic">
                        This may matter more for families relying on balloting margins.
                      </p>
                    )}
                    {spi.dominantFactor === 'demand' && (
                      <p className="text-xs text-gray-700 italic">
                        Families with children near cut-off thresholds may face higher competition here.
                      </p>
                    )}
                    {spi.dominantFactor === 'choice' && (
                      <p className="text-xs text-gray-700 italic">
                        Distance bands become more critical when school options are limited.
                      </p>
                    )}
                    {spi.dominantFactor === 'crowding' && (
                      <p className="text-xs text-gray-700 italic">
                        Higher demand indicators suggest tighter competition for popular schools.
                      </p>
                    )}
                  </div>

                  {/* Why section - parent-friendly translation */}
                  {spi.whyExplanations && spi.whyExplanations.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Why:</p>
                      <ul className="space-y-2">
                        {spi.whyExplanations.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-800 flex items-start">
                            <span className="text-gray-500 mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pressure index data available for {selectedTown}
                </div>
              )}
            </ChartCard>

            {/* Module 3: Housing × School Trade-off */}
            <ChartCard
              title="Housing × School Trade-off"
              description="Structural comparison of housing affordability and school pressure"
              icon={<Home className="w-6 h-6" />}
            >
              <div className="space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{selectedTown}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Housing</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                        {getHousingSummary(housingProfile)}
                      </div>
                      {housingProfile && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Median price: {formatCurrency(housingProfile.medianResalePrice)}</div>
                          <div>Lease: {housingProfile.medianRemainingLease.toFixed(1)} years remaining</div>
                          <div>Volume: {housingProfile.volumeRecent} transactions (24m)</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Schools</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                        {getSchoolSummary(landscape, spi)}
                      </div>
                      {landscape && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Schools: {landscape.schoolCount} primary schools</div>
                          <div>High-demand: {landscape.highDemandSchools} schools</div>
                          {spi && <div>Pressure: {spi.level} ({spi.spi})</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-xs text-gray-700">
                    <strong>Note:</strong> This shows structural trends for {selectedTown}. 
                    Final school allocation depends on specific unit location, distance bands, and cohort demand.
                  </p>
                </div>
                {housingProfile && landscape && spi && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-800 italic">
                      {(() => {
                        const isAffordable = housingProfile.medianResalePrice < 500000
                        const isLowPressure = spi.level === 'low'
                        const hasFewElite = landscape.highDemandSchools === 0
                        
                        if (isAffordable && isLowPressure && hasFewElite) {
                          return `This area favors affordability with relatively lower school pressure, but may offer fewer elite-school options.`
                        } else if (isAffordable && !isLowPressure) {
                          return `This area offers lower entry costs but comes with higher school competition pressure.`
                        } else if (!isAffordable && isLowPressure) {
                          return `This area commands higher prices but offers lower school pressure and more options.`
                        } else {
                          return `This area presents a balance between housing costs and school environment, with trade-offs to consider.`
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Module 4: Reality Check */}
            <ChartCard
              title="Important Context"
              description="Understanding what this tool does and doesn't do"
              icon={<AlertCircle className="w-6 h-6" />}
            >
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">What This Tool Shows</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Structural school pressure patterns by location</li>
                    <li>Housing affordability vs school environment trade-offs</li>
                    <li>Long-term constraints you&apos;ll face in different areas</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-semibold text-gray-900 mb-2">What This Tool Doesn&apos;t Do</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Predict specific school allocation outcomes</li>
                    <li>Guarantee admission to any school</li>
                    <li>Replace official MOE distance band information</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>Reality Check:</strong> PSLE allocation depends on distance bands and cohort demand. 
                    This tool shows structural trends, not guaranteed outcomes. 
                    Final unit selection should consider specific block location, floor level, and proximity to preferred schools.
                  </p>
                </div>
              </div>
            </ChartCard>

            {/* Redirect CTA to Compare Towns */}
            <CompareTownsCTA text="Compare education impact when moving between towns" />
          </>
        )}
      </main>
    </div>
  )
}
