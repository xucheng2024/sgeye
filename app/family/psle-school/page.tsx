'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { GraduationCap, AlertCircle, Home, TrendingUp, GitCompare } from 'lucide-react'
import CompareTownsCTA from '@/components/CompareTownsCTA'
import ChartCard from '@/components/ChartCard'
import Link from 'next/link'
import { 
  calculateSchoolPressureIndex, 
  getSchoolLandscape, 
  getTownsWithSchools,
  SchoolPressureIndex,
  SchoolLandscape 
} from '@/lib/school-data'
import { getNeighbourhoodProfile, NeighbourhoodProfile, getNeighbourhoodIdFromTown } from '@/lib/hdb-data'
import { formatCurrency } from '@/lib/utils'

// Note: TOWNS list is kept for UI filtering/display only
// All data aggregation is done by neighbourhood_id
const TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']

function PSLESchoolPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const compareParam = searchParams.get('compare')
  const compareAreas = compareParam ? compareParam.split(',').filter(Boolean).slice(0, 2) : []
  const isCompareMode = compareAreas.length >= 2
  
  const [selectedTown, setSelectedTown] = useState<string>(compareAreas[0] || 'ANG MO KIO')
  const [landscape, setLandscape] = useState<SchoolLandscape | null>(null)
  const [spi, setSpi] = useState<SchoolPressureIndex | null>(null)
  const [housingProfile, setHousingProfile] = useState<NeighbourhoodProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableTowns, setAvailableTowns] = useState<string[]>(TOWNS)
  
  // Compare mode state
  const [compareLandscape1, setCompareLandscape1] = useState<SchoolLandscape | null>(null)
  const [compareLandscape2, setCompareLandscape2] = useState<SchoolLandscape | null>(null)
  const [compareSpi1, setCompareSpi1] = useState<SchoolPressureIndex | null>(null)
  const [compareSpi2, setCompareSpi2] = useState<SchoolPressureIndex | null>(null)
  const [compareHousing1, setCompareHousing1] = useState<NeighbourhoodProfile | null>(null)
  const [compareHousing2, setCompareHousing2] = useState<NeighbourhoodProfile | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)

  useEffect(() => {
    loadTowns()
  }, [])

  useEffect(() => {
    if (isCompareMode) {
      loadCompareData()
    } else if (selectedTown) {
      loadData()
    }
  }, [selectedTown, isCompareMode, compareAreas.join(',')])
  
  async function loadCompareData() {
    if (compareAreas.length < 2) return
    
    setCompareLoading(true)
    try {
      const [area1, area2] = compareAreas
      
      // Load data for both areas in parallel
      const [
        landscape1, landscape2,
        spi1, spi2,
        neighbourhoodId1, neighbourhoodId2
      ] = await Promise.all([
        getSchoolLandscape(area1),
        getSchoolLandscape(area2),
        calculateSchoolPressureIndex(area1),
        calculateSchoolPressureIndex(area2),
        getNeighbourhoodIdFromTown(area1),
        getNeighbourhoodIdFromTown(area2)
      ])
      
      setCompareLandscape1(landscape1)
      setCompareLandscape2(landscape2)
      setCompareSpi1(spi1)
      setCompareSpi2(spi2)
      
      // Load housing profiles if neighbourhood IDs are available
      if (neighbourhoodId1) {
        const housing1 = await getNeighbourhoodProfile(neighbourhoodId1, '4 ROOM')
        setCompareHousing1(housing1)
      }
      if (neighbourhoodId2) {
        const housing2 = await getNeighbourhoodProfile(neighbourhoodId2, '4 ROOM')
        setCompareHousing2(housing2)
      }
    } catch (error) {
      console.error('Error loading compare data:', error)
    } finally {
      setCompareLoading(false)
    }
  }

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
      const neighbourhoodId = await getNeighbourhoodIdFromTown(selectedTown)
      if (!neighbourhoodId) {
        console.error('Failed to get neighbourhood_id for town:', selectedTown)
        setLoading(false)
        return
      }
      
      const [landscapeData, spiData, housingData] = await Promise.all([
        getSchoolLandscape(selectedTown),
        calculateSchoolPressureIndex(selectedTown),
        getNeighbourhoodProfile(neighbourhoodId, '4 ROOM')
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

  function getHousingSummary(profile: NeighbourhoodProfile | null): string {
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

  // Compare mode UI
  if (isCompareMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Compare school pressure by planning area</h1>
                <p className="mt-2 text-gray-600">
                  Side-by-side comparison of school competition and housing trade-offs
                </p>
              </div>
              <Link
                href="/family/psle-school"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to explore mode
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {compareLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading comparison data...
            </div>
          ) : (
            <>
              {/* Compare Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-center gap-4 text-2xl font-bold text-gray-900">
                  <span className="px-4 py-2 bg-blue-50 rounded-lg">{compareAreas[0]}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="px-4 py-2 bg-blue-50 rounded-lg">{compareAreas[1]}</span>
                </div>
              </div>

              {/* Quick Takeaway */}
              {compareSpi1 && compareSpi2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick takeaway</h2>
                  {(() => {
                    const spi1 = compareSpi1.spi
                    const spi2 = compareSpi2.spi
                    const level1 = compareSpi1.level
                    const level2 = compareSpi2.level
                    const landscape1 = compareLandscape1
                    const landscape2 = compareLandscape2
                    
                    if (spi1 < spi2 - 5) {
                      return (
                        <p className="text-base text-gray-800">
                          <strong>{compareAreas[0]}</strong> offers lower overall school pressure and more choice stability.
                          <strong> {compareAreas[1]}</strong> has {landscape2?.schoolCount || 'fewer'} schools and {landscape2?.highDemandSchools && landscape2.highDemandSchools > (landscape1?.highDemandSchools || 0) ? 'higher' : 'similar'} concentration in popular ones.
                        </p>
                      )
                    } else if (spi2 < spi1 - 5) {
                      return (
                        <p className="text-base text-gray-800">
                          <strong>{compareAreas[1]}</strong> offers lower overall school pressure and more choice stability.
                          <strong> {compareAreas[0]}</strong> has {landscape1?.schoolCount || 'fewer'} schools and {landscape1?.highDemandSchools && landscape1.highDemandSchools > (landscape2?.highDemandSchools || 0) ? 'higher' : 'similar'} concentration in popular ones.
                        </p>
                      )
                    } else {
                      return (
                        <p className="text-base text-gray-800">
                          Both areas have similar school pressure levels, with different trade-offs in school distribution and housing costs.
                        </p>
                      )
                    }
                  })()}
                </div>
              )}

              {/* Core Comparison Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparison</h2>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{compareAreas[0]}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{compareAreas[1]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">SPI</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {compareSpi1 ? (
                          <div>
                            <span className="font-semibold">{compareSpi1.spi}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({compareSpi1.level === 'low' ? 'Low' : compareSpi1.level === 'medium' ? 'Medium' : 'High'})
                            </span>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {compareSpi2 ? (
                          <div>
                            <span className="font-semibold">{compareSpi2.spi}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({compareSpi2.level === 'low' ? 'Low' : compareSpi2.level === 'medium' ? 'Medium' : 'High'})
                            </span>
                          </div>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Primary schools</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{compareLandscape1?.schoolCount || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{compareLandscape2?.schoolCount || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">High-demand schools</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{compareLandscape1?.highDemandSchools || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{compareLandscape2?.highDemandSchools || 0}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Choice breadth</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {compareLandscape1 && compareLandscape2 ? (
                          compareLandscape1.schoolCount > compareLandscape2.schoolCount ? 'Wider' :
                          compareLandscape1.schoolCount < compareLandscape2.schoolCount ? 'Narrower' : 'Similar'
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {compareLandscape1 && compareLandscape2 ? (
                          compareLandscape2.schoolCount > compareLandscape1.schoolCount ? 'Wider' :
                          compareLandscape2.schoolCount < compareLandscape1.schoolCount ? 'Narrower' : 'Similar'
                        ) : 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Trade-off Interpretation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Trade-off interpretation</h2>
                <p className="text-sm text-gray-800 mb-3">
                  This comparison reflects a common trade-off:
                </p>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>Central areas often face higher school concentration and competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>Larger heartland areas tend to offer more distributed school options</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    )
  }

  // Explore mode UI (existing)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PSLE & School Location</h1>
          <p className="mt-2 text-gray-600">
            Understand structural school pressure and housing trade-offs by planning area
          </p>
          <p className="mt-1 text-xs text-gray-500 italic">
            Analysis is at planning area level. Housing data shows a representative neighbourhood within the area.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Planning Area Selector */}
        <div className="mb-6 flex items-end gap-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="town-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Planning Area
            </label>
            <select
              id="town-select"
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            >
              {availableTowns.map(town => (
                <option key={town} value={town}>{town}</option>
              ))}
            </select>
          </div>
          <Link
            href={`/family/psle-school?compare=${selectedTown},${availableTowns.find(t => t !== selectedTown) || availableTowns[0]}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Compare with another area
          </Link>
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
                      <strong>Structural insight:</strong> Most families here face relatively low competition for primary schools.
                    </p>
                  </div>
                ) : spi.level === 'high' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔴</span>
                    <p className="text-base text-gray-800">
                      <strong>Overall pattern:</strong> Competition for primary schools is more intense here, with fewer lower-risk options.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟡</span>
                    <p className="text-base text-gray-800">
                      <strong>Overall pattern:</strong> School competition varies, with a mix of options available.
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
                    <strong>Note:</strong> This shows structural trends for {selectedTown} planning area. 
                    School data is aggregated at planning area level. Housing data represents a typical neighbourhood within this area.
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
                          return `This area commands higher prices but offers lower school pressure and more options. This reflects a common trade-off: families often pay a price premium to reduce school competition and increase choice flexibility.`
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

            {/* Redirect CTA to Compare Planning Areas */}
            <CompareTownsCTA text="See how school pressure changes across planning areas" />
          </>
        )}
      </main>
    </div>
  )
}

export default function PSLESchoolPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <PSLESchoolPageContent />
    </Suspense>
  )
}
