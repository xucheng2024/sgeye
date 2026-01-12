'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Train, Navigation, ChevronDown } from 'lucide-react'
import { getNeighbourhoodTransportProfile, calculateTBI, getTBILevel, getTBILevelLabel } from '@/lib/hdb-data'
import type { NeighbourhoodTransportProfile } from '@/lib/hdb-data'

interface Neighbourhood {
  id: string
  name: string
  planning_area?: {
    id: string
    name: string
  } | null
}

function TransportPageContent() {
  const searchParams = useSearchParams()
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([])
  const [selectedNeighbourhoodId, setSelectedNeighbourhoodId] = useState<string>('')
  const [transportProfile, setTransportProfile] = useState<NeighbourhoodTransportProfile | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Load neighbourhoods
    const loadNeighbourhoods = async () => {
      try {
        const res = await fetch('/api/neighbourhoods?limit=500')
        const data = await res.json()
        const neighbourhoodsData: Neighbourhood[] = (data.neighbourhoods || []) as Neighbourhood[]
        // Sort by name for easier selection
        const sorted = neighbourhoodsData.sort((a: Neighbourhood, b: Neighbourhood) => 
          (a.name || '').localeCompare(b.name || '')
        )
        setNeighbourhoods(sorted)
        
        // Check if neighbourhood_id is in URL params
        const neighbourhoodIdFromUrl = searchParams.get('neighbourhood_id')
        if (neighbourhoodIdFromUrl && sorted.some((n: Neighbourhood) => n.id === neighbourhoodIdFromUrl)) {
          setSelectedNeighbourhoodId(neighbourhoodIdFromUrl)
        } else if (sorted.length > 0 && !selectedNeighbourhoodId) {
          setSelectedNeighbourhoodId(sorted[0].id)
        }
      } catch (error) {
        console.error('Error loading neighbourhoods:', error)
      }
    }
    loadNeighbourhoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Handle URL parameter change
  useEffect(() => {
    const neighbourhoodIdFromUrl = searchParams.get('neighbourhood_id')
    if (neighbourhoodIdFromUrl && neighbourhoods.some((n: Neighbourhood) => n.id === neighbourhoodIdFromUrl)) {
      setSelectedNeighbourhoodId(neighbourhoodIdFromUrl)
    }
  }, [searchParams, neighbourhoods])
  
  useEffect(() => {
    const loadTransportProfile = async () => {
      if (!selectedNeighbourhoodId) return
      
      setLoading(true)
      try {
        const profile = await getNeighbourhoodTransportProfile(selectedNeighbourhoodId)
        setTransportProfile(profile)
      } catch (error) {
        console.error('Error loading transport profile:', error)
        setTransportProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadTransportProfile()
  }, [selectedNeighbourhoodId])
  
  const tbi = transportProfile ? calculateTBI(transportProfile) : null
  const tbiLevel = tbi !== null ? getTBILevel(tbi) : null
  const tbiLabel = tbiLevel ? getTBILevelLabel(tbiLevel) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm font-semibold text-gray-900">
              ⚠️ Transport here is not about exact travel time.
              <br />
              <span className="text-gray-600 font-normal">It explains structural time burden when choosing where to live.</span>
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Transport & Time Burden</h1>
          <p className="text-lg text-gray-600">Understanding how location affects your daily time investment over 10–15 years</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Neighbourhood Selector */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select neighbourhood (subarea):
          </label>
          <select
            value={selectedNeighbourhoodId}
            onChange={(e) => setSelectedNeighbourhoodId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-base"
            disabled={neighbourhoods.length === 0}
          >
            {neighbourhoods.map(neighbourhood => (
              <option key={neighbourhood.id} value={neighbourhood.id}>
                {neighbourhood.name}
                {neighbourhood.planning_area && ` (${neighbourhood.planning_area.name})`}
              </option>
            ))}
          </select>
          {loading && (
            <p className="text-sm text-gray-500 mt-2">Loading transport profile...</p>
          )}
        </div>

        {/* Structural Indicators */}
        {transportProfile && tbi !== null && tbiLevel && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What makes commuting easier or harder here</h2>
            
            {/* TBI Score */}
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 relative">
              <div className="absolute top-4 right-4">
                <Link
                  href="/neighbourhoods/"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  Compare with another neighbourhood
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-semibold text-gray-900">Transport Burden: {tbiLabel}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {tbiLevel === 'low' && "Light burden: You'll spend minimal time commuting. This location offers strong structural advantages for daily travel."}
                  {tbiLevel === 'moderate' && "Manageable burden: You'll spend a noticeable but sustainable amount of time commuting over the long term."}
                  {tbiLevel === 'high' && "Heavy burden: You'll spend significant time commuting daily. This location requires more travel investment."}
                  {tbiLevel === 'very_high' && "Straining burden: You'll spend substantial time commuting. This location has structural constraints that are hard to sustain long-term."}
                </p>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <span className="text-sm text-gray-600">
                  TBI {tbi} / 100 ({tbiLabel})
                </span>
              </div>
              {/* Comparison Anchor */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs font-medium text-gray-700 mb-2">How this feels compared to other areas:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Central hubs: ~20–25</li>
                  <li>• Most heartland neighbourhoods: ~30–40</li>
                  <li>• Outer / fringe areas: ~45–60</li>
                </ul>
              </div>
            </div>

            {/* Structural Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Train className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Number of MRT lines</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{transportProfile.mrtLinesCount}</p>
                <p className="text-sm text-gray-600 mt-1">Lines accessible from this area</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Average transfers to CBD</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{transportProfile.averageTransfersToCBD}</p>
                <p className="text-sm text-gray-600 mt-1">Transfers needed to reach CBD hubs</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Distance band</span>
                </div>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {transportProfile.distanceBand.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">Structural distance category</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Commute category</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{transportProfile.commuteCategory}</p>
                <p className="text-sm text-gray-600 mt-1">Structural accessibility level</p>
              </div>
            </div>

            {/* TBI Breakdown */}
            <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">Component breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">How far this town is from major job hubs</span>
                    <span className="text-sm font-semibold text-gray-900">{transportProfile.centralAccessBurden}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${transportProfile.centralAccessBurden}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">How often you need to change lines</span>
                    <span className="text-sm font-semibold text-gray-900">{transportProfile.transferBurden}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${transportProfile.transferBurden}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Backup routes when one line is disrupted</span>
                    <span className="text-sm font-semibold text-gray-900">{transportProfile.networkRedundancy}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${transportProfile.networkRedundancy}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Walking distance, waits, and small delays</span>
                    <span className="text-sm font-semibold text-gray-900">{transportProfile.dailyMobilityFriction}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${transportProfile.dailyMobilityFriction}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-4 pt-4 border-t border-blue-200">
                These are structural factors — they don&apos;t change if you switch flats within the same area.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Why time burden matters */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why time burden matters</h2>
          </div>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Choosing where to live is choosing a daily routine for 10–15 years.
            </p>
            <p>
              A small time difference may feel minor today, but it compounds into hundreds of hours over time.
            </p>
            <p className="font-semibold text-gray-900">
              This is about sustainability — not just getting there.
            </p>
          </div>
        </section>

        {/* Section 2: What affects time burden structurally */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What affects time burden structurally</h2>
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">Structural factors you can&apos;t easily change later:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-semibold mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-gray-900">Centrality</span>
                  <span className="text-gray-600"> — distance to major job hubs</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-semibold mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-gray-900">MRT density</span>
                  <span className="text-gray-600"> — number of stations and routes</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-semibold mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-gray-900">Transfer complexity</span>
                  <span className="text-gray-600"> — how many line changes are needed</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-semibold mt-0.5">✓</span>
                <div>
                  <span className="font-medium text-gray-900">Regional hub access</span>
                  <span className="text-gray-600"> — connectivity beyond CBD</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 italic">
              These are structural attributes, not precise travel times.
            </p>
          </div>
        </section>

        {/* Section 3: How this affects your decision */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Navigation className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">How this affects your decision</h2>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-800 leading-relaxed font-medium">
              Transport differences rarely change which flat you buy, but often determine how long you can comfortably stay.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you&apos;re planning to stay 15+ years, a higher time burden town might become less sustainable as your family grows 
              or your priorities shift. If you&apos;re staying 5–10 years, the difference matters less.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The key is understanding the trade-off: a cheaper flat in a less accessible area might save money upfront, 
              but cost you time every day for the next decade.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}

export default function TransportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TransportPageContent />
    </Suspense>
  )
}
