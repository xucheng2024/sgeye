'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Train, Navigation, ChevronDown } from 'lucide-react'
import { getNeighbourhoodTransportProfile, getNeighbourhoodIdFromTown, calculateTBI, getTBILevel, getTBILevelLabel } from '@/lib/hdb-data'
import { TOWNS } from './constants'
import type { NeighbourhoodTransportProfile } from '@/lib/hdb-data'

export default function TransportPage() {
  const [selectedTown, setSelectedTown] = useState<string>('ANG MO KIO')
  const [transportProfile, setTransportProfile] = useState<NeighbourhoodTransportProfile | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const loadTransportProfile = async () => {
      setLoading(true)
      try {
        const neighbourhoodId = await getNeighbourhoodIdFromTown(selectedTown)
        if (neighbourhoodId) {
          const profile = await getNeighbourhoodTransportProfile(neighbourhoodId)
          setTransportProfile(profile)
        } else {
          setTransportProfile(null)
        }
      } catch (error) {
        console.error('Error loading transport profile:', error)
        setTransportProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadTransportProfile()
  }, [selectedTown])
  
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
        {/* Town Selector */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Town / Planning Area:
          </label>
          <select
            value={selectedTown}
            onChange={(e) => setSelectedTown(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-base"
          >
            {TOWNS.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>

        {/* Structural Indicators */}
        {transportProfile && tbi !== null && tbiLevel && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Structural Transport Indicators</h2>
            
            {/* TBI Score */}
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">Transport Burden Index (TBI)</span>
                <span className={`text-3xl font-bold ${
                  tbiLevel === 'low' ? 'text-green-600' :
                  tbiLevel === 'moderate' ? 'text-yellow-600' :
                  tbiLevel === 'high' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {tbi}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  tbiLevel === 'low' ? 'bg-green-100 text-green-800' :
                  tbiLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  tbiLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tbiLabel}
                </span>
                <span className="text-sm text-gray-600">
                  (0-100 scale, lower is better)
                </span>
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
                <p className="text-sm text-gray-600 mt-1">Lines serving this town</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">TBI Component Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">Central Access Burden (40%)</span>
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
                    <span className="text-sm text-gray-700">Transfer Burden (25%)</span>
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
                    <span className="text-sm text-gray-700">Network Redundancy (20%)</span>
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
                    <span className="text-sm text-gray-700">Daily Mobility Friction (15%)</span>
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
            </div>
          </div>
        )}

        {/* Section 1: Why time burden matters */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why time burden matters</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              When you choose where to live, you&apos;re committing to a daily routine that lasts 10–15 years. 
              A 15–30 minute difference each way might seem small, but it adds up.
            </p>
            <p>
              Over a decade, that&apos;s hundreds of hours spent commuting instead of with family, 
              on hobbies, or simply resting. The cumulative effect is real.
            </p>
            <p>
              This isn&apos;t about one-off trips or occasional delays. It&apos;s about the structural reality 
              of your location: how many transfers you need, how far you are from major hubs, 
              and how accessible your town is to the rest of Singapore.
            </p>
            <p className="font-semibold text-gray-900 mt-4">
              The question isn&apos;t &quot;Can I get there?&quot; It&apos;s &quot;How sustainable is this commute for the next 15 years?&quot;
            </p>
          </div>
        </section>

        {/* Section 2: What affects time burden structurally */}
        <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What affects time burden structurally</h2>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Centrality</h3>
              <p className="text-gray-700">
                Central areas and city fringe towns are closer to major employment hubs, reducing baseline travel time.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">MRT Density</h3>
              <p className="text-gray-700">
                Towns with more MRT stations offer more route options and shorter walking distances to transit.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Transfer Complexity</h3>
              <p className="text-gray-700">
                Direct connections to major lines mean fewer transfers, less waiting, and more predictable journeys.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Regional Hub Access</h3>
              <p className="text-gray-700">
                Proximity to regional centres (Jurong East, Tampines, Woodlands, Punggol) provides better connectivity to multiple destinations.
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 italic">
              These are structural attributes of your town, not precise travel times. 
              They don&apos;t change based on your specific workplace or school.
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

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-center">
          <Train className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            See how transport trade-offs affect your neighbourhood comparison
          </h3>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Compare Towns
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  )
}

