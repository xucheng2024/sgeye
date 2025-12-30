'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTownProfile, generateCompareSummary, TownProfile, CompareSummary, PreferenceLens } from '@/lib/hdb-data'
import { FamilyProfile } from '@/lib/decision-rules'
import { calculateSchoolPressureIndex, getSchoolLandscape, SchoolPressureIndex, SchoolLandscape } from '@/lib/school-data'
import { formatCurrency } from '@/lib/utils'
import { Scale, AlertTriangle, TrendingUp, Map, ChevronDown, ChevronUp, GraduationCap, Clock } from 'lucide-react'
import ChartCard from '@/components/ChartCard'
import { TOWNS, FLAT_TYPES, RECOMMENDED_PAIRS } from './constants'
import {
  generateSuitabilityFromProfile,
  generateDecisionHintFromProfiles,
  generateDecisionVerdictFromProfiles,
  generateDecisionGuidanceFromProfiles,
} from './utils'
import FamilyProfileDisplay from './components/FamilyProfileDisplay'
import FamilyProfileEditor from './components/FamilyProfileEditor'
import TownSelector from './components/TownSelector'
import RecommendationCard from './components/RecommendationCard'


function CompareTownsPageContent() {
  const searchParams = useSearchParams()
  // Use URL params if available, otherwise use default recommended pair
  const defaultPair = RECOMMENDED_PAIRS[0]
  const [townA, setTownA] = useState(searchParams.get('townA') || defaultPair.townA)
  const [townB, setTownB] = useState(searchParams.get('townB') || defaultPair.townB)
  const [flatType, setFlatType] = useState(searchParams.get('flatType') || '4 ROOM')
  const [profileA, setProfileA] = useState<TownProfile | null>(null)
  const [profileB, setProfileB] = useState<TownProfile | null>(null)
  const [spiA, setSpiA] = useState<SchoolPressureIndex | null>(null)
  const [spiB, setSpiB] = useState<SchoolPressureIndex | null>(null)
  const [landscapeA, setLandscapeA] = useState<SchoolLandscape | null>(null)
  const [landscapeB, setLandscapeB] = useState<SchoolLandscape | null>(null)
  const [loading, setLoading] = useState(true)
  const [userBudget, setUserBudget] = useState<number | undefined>(undefined)
  const [compareSummary, setCompareSummary] = useState<CompareSummary | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [preferenceLens, setPreferenceLens] = useState<'lower_cost' | 'lease_safety' | 'school_pressure' | 'balanced'>('balanced')
  const [holdingPeriod, setHoldingPeriod] = useState<'short' | 'medium' | 'long'>('medium')
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(true)
  const [leaseOpen, setLeaseOpen] = useState(true)
  const [marketOpen, setMarketOpen] = useState(false)
  const [schoolAccessOpen, setSchoolAccessOpen] = useState(false)
  const [timeAccessOpen, setTimeAccessOpen] = useState(false)
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  
  // Family profile type mapping
  type FamilyProfileType = 'long_term' | 'budget_first' | 'education_sensitive' | 'balanced'
  const [familyProfileType, setFamilyProfileType] = useState<FamilyProfileType>('balanced')

  // Map family profile type to decision rules
  useEffect(() => {
    if (familyProfileType === 'long_term') {
      setPreferenceLens('lease_safety')
      setHoldingPeriod('long')
      setFamilyProfile({
        stage: 'primary_family',
        holdingYears: 'long',
        costVsValue: 'value',
        schoolSensitivity: 'neutral'
      })
    } else if (familyProfileType === 'budget_first') {
      setPreferenceLens('lower_cost')
      setHoldingPeriod('medium')
      setFamilyProfile({
        stage: 'primary_family',
        holdingYears: 'medium',
        costVsValue: 'cost',
        schoolSensitivity: 'neutral'
      })
    } else if (familyProfileType === 'education_sensitive') {
      setPreferenceLens('school_pressure')
      setHoldingPeriod('medium')
      setFamilyProfile({
        stage: 'primary_family',
        holdingYears: 'medium',
        costVsValue: 'balanced',
        schoolSensitivity: 'high'
      })
    } else {
      setPreferenceLens('balanced')
      setHoldingPeriod('medium')
      setFamilyProfile({
        stage: 'primary_family',
        holdingYears: 'medium',
        costVsValue: 'balanced',
        schoolSensitivity: 'neutral'
      })
    }
  }, [familyProfileType])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [resultA, resultB, spiResultA, spiResultB, landscapeResultA, landscapeResultB] = await Promise.all([
          getTownProfile(townA, flatType, 24), // Use 24 months for decision tool
          getTownProfile(townB, flatType, 24),
          calculateSchoolPressureIndex(townA),
          calculateSchoolPressureIndex(townB),
          getSchoolLandscape(townA),
          getSchoolLandscape(townB),
        ])
        setProfileA(resultA)
        setProfileB(resultB)
        setSpiA(spiResultA)
        setSpiB(spiResultB)
        setLandscapeA(landscapeResultA)
        setLandscapeB(landscapeResultB)
        
        // Debug logging
        console.log('SPI Data:', {
          townA,
          townB,
          spiA: spiResultA,
          spiB: spiResultB,
          landscapeA: landscapeResultA,
          landscapeB: landscapeResultB,
        })
      } catch (error) {
        console.error('Error fetching comparison data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [townA, townB, flatType])

  // Generate Compare Summary from Town Profiles (with SPI, Lens, and Family Profile)
  // Convert holdingPeriod to FamilyProfile format if familyProfile doesn't exist
  const effectiveFamilyProfile: FamilyProfile | null = familyProfile || (holdingPeriod ? {
    stage: 'primary_family',  // Default
    holdingYears: holdingPeriod,
    costVsValue: preferenceLens === 'lower_cost' ? 'cost' : preferenceLens === 'lease_safety' ? 'value' : 'balanced',
    schoolSensitivity: preferenceLens === 'school_pressure' ? 'high' : 'neutral'
  } : null)
  
  useEffect(() => {
    const generateSummary = async () => {
      if (profileA && profileB) {
        const isLongTerm = holdingPeriod === 'long'
        
        const summary = await generateCompareSummary(
          profileA,
          profileB,
          userBudget,
          spiA,
          spiB,
          landscapeA,
          landscapeB,
          preferenceLens,
          isLongTerm,
          effectiveFamilyProfile
        )
        setCompareSummary(summary)
      } else {
        setCompareSummary(null)
      }
    }
    generateSummary()
  }, [profileA, profileB, spiA, spiB, landscapeA, landscapeB, preferenceLens, holdingPeriod, familyProfile, userBudget, effectiveFamilyProfile])


  // Debug: Log compareSummary when evidence is opened
  useEffect(() => {
    if (evidenceOpen && compareSummary) {
      console.log('Evidence opened - Compare Summary:', {
        headlineVerdict: compareSummary.headlineVerdict,
        bottomLine: compareSummary.bottomLine,
        educationPressure: compareSummary.educationPressure,
        housingTradeoff: compareSummary.housingTradeoff,
        bestSuitedFor: compareSummary.bestSuitedFor,
        decisionHint: compareSummary.decisionHint,
      })
    }
  }, [evidenceOpen, compareSummary])

  // Generate suitability from profiles
  const suitabilityA = profileA ? generateSuitabilityFromProfile(profileA, townA) : null
  const suitabilityB = profileB ? generateSuitabilityFromProfile(profileB, townB) : null
  
  // Generate decision hints from profiles
  const decisionHints = profileA && profileB ? generateDecisionHintFromProfiles(profileA, profileB) : []
  const decisionVerdict = profileA && profileB ? generateDecisionVerdictFromProfiles(profileA, profileB) : null
  const guidance = profileA && profileB ? generateDecisionGuidanceFromProfiles(profileA, profileB, townA, townB) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-gray-900">
              This is where we help you decide.
              <br />
              <span className="text-gray-600 font-normal">Everything else explains why.</span>
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Where should my family live — given our priorities?</h1>
          <p className="text-lg text-gray-600 mb-2">Compare towns by cost, lease safety, rent pressure, and primary school competition — and see what changes when you move.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Profile Selector */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Which family best describes you?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              familyProfileType === 'long_term' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="familyProfile"
                value="long_term"
                checked={familyProfileType === 'long_term'}
                onChange={(e) => setFamilyProfileType(e.target.value as FamilyProfileType)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">1️⃣ Long-term family (15+ years)</div>
                <div className="text-xs text-gray-600">Focus on lease safety and resale flexibility</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              familyProfileType === 'budget_first' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="familyProfile"
                value="budget_first"
                checked={familyProfileType === 'budget_first'}
                onChange={(e) => setFamilyProfileType(e.target.value as FamilyProfileType)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">2️⃣ Budget-first family</div>
                <div className="text-xs text-gray-600">Focus on upfront price and monthly cash flow</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              familyProfileType === 'education_sensitive' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="familyProfile"
                value="education_sensitive"
                checked={familyProfileType === 'education_sensitive'}
                onChange={(e) => setFamilyProfileType(e.target.value as FamilyProfileType)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">3️⃣ Education-sensitive family</div>
                <div className="text-xs text-gray-600">Focus on lower school competition</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              familyProfileType === 'balanced' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="familyProfile"
                value="balanced"
                checked={familyProfileType === 'balanced'}
                onChange={(e) => setFamilyProfileType(e.target.value as FamilyProfileType)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">4️⃣ Balanced (default)</div>
                <div className="text-xs text-gray-600">Balanced across all factors</div>
              </div>
            </label>
          </div>
        </div>

        {/* Family Profile Display Bar */}
        {effectiveFamilyProfile && (
          <FamilyProfileDisplay
            profile={effectiveFamilyProfile}
            onEdit={() => setShowProfileEditor(true)}
          />
        )}

        {/* Family Profile Editor Sidebar */}
        <FamilyProfileEditor
          isOpen={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          familyProfile={familyProfile}
          onProfileChange={setFamilyProfile}
          holdingPeriod={holdingPeriod}
          onHoldingPeriodChange={setHoldingPeriod}
          preferenceLens={preferenceLens}
          onPreferenceLensChange={setPreferenceLens}
        />

        {/* Quick Start & Town Selector */}
        <TownSelector
          townA={townA}
          townB={townB}
          flatType={flatType}
          holdingPeriod={holdingPeriod}
          onTownAChange={setTownA}
          onTownBChange={setTownB}
          onFlatTypeChange={setFlatType}
          onHoldingPeriodChange={setHoldingPeriod}
          showQuickStart={!searchParams.get('townA') && !searchParams.get('townB')}
        />

        {/* Third Screen: Preference Lens */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">What matters more to you?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${preferenceLens === 'lower_cost' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="lens"
                value="lower_cost"
                checked={preferenceLens === 'lower_cost'}
                onChange={(e) => setPreferenceLens(e.target.value as PreferenceLens)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">Lower upfront cost</div>
                <div className="text-xs text-gray-600">Prioritise lower entry price</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${preferenceLens === 'lease_safety' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="lens"
                value="lease_safety"
                checked={preferenceLens === 'lease_safety'}
                onChange={(e) => setPreferenceLens(e.target.value as PreferenceLens)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">Long-term resale & lease safety</div>
                <div className="text-xs text-gray-600">Prioritise healthier lease profile</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${preferenceLens === 'school_pressure' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="lens"
                value="school_pressure"
                checked={preferenceLens === 'school_pressure'}
                onChange={(e) => setPreferenceLens(e.target.value as PreferenceLens)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">Lower school pressure</div>
                <div className="text-xs text-gray-600">Prioritise lower SPI & more options</div>
              </div>
            </label>
            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${preferenceLens === 'balanced' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="lens"
                value="balanced"
                checked={preferenceLens === 'balanced'}
                onChange={(e) => setPreferenceLens(e.target.value as PreferenceLens)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 mb-1">Balanced (default)</div>
                <div className="text-xs text-gray-600">Weighted decision across all factors</div>
              </div>
            </label>
          </div>
          <p className="text-xs text-gray-500 italic mb-4 text-center">
            This does not change the data — only how the recommendation is framed.
          </p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="longTerm"
              checked={holdingPeriod === 'long'}
              onChange={(e) => setHoldingPeriod(e.target.checked ? 'long' : 'medium')}
              className="w-4 h-4"
            />
            <label htmlFor="longTerm" className="text-sm text-gray-700 cursor-pointer">
              I plan to stay long-term (15+ years)
            </label>
          </div>
        </div>

        {/* Recommendation (new format) */}
        {compareSummary && compareSummary.recommendation && (
          <RecommendationCard
            compareSummary={compareSummary}
            preferenceLens={preferenceLens}
            holdingPeriod={holdingPeriod}
            townA={townA}
            townB={townB}
            evidenceOpen={evidenceOpen}
            onToggleEvidence={() => setEvidenceOpen(!evidenceOpen)}
            familyProfileType={familyProfileType}
            onFamilyProfileChange={() => {
              // Scroll to family profile selector
              document.querySelector('[name="familyProfile"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          />
        )}

        {/* Evidence (expandable) - Right after Recommendation */}
        {compareSummary && evidenceOpen && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Evidence</h3>
            
            {/* Always show headline verdict first */}
            {compareSummary.headlineVerdict && (
              <div className="mb-6">
                <p className="text-lg font-bold text-gray-900 leading-relaxed">
                  {compareSummary.headlineVerdict}
                </p>
                {compareSummary.movingPhrase && (
                  <p className="text-sm text-gray-700 italic mt-2">
                    {compareSummary.movingPhrase}
                  </p>
                )}
              </div>
            )}
            
            {/* Bottom Line (if exists) */}
            {compareSummary.bottomLine && (
              <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧭</span>
                  <h4 className="text-lg font-bold text-gray-900">Bottom Line</h4>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  If you move from {townA} → {townB}:
                </p>
                <ul className="space-y-2 mb-4">
                  {compareSummary.bottomLine.changes.map((change, idx) => (
                    <li key={idx} className="text-sm text-gray-800">
                      {change}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-gray-900 border-t border-gray-200 pt-3">
                  {compareSummary.bottomLine.bestFor}
                </p>
              </div>
            )}

            {/* Block 2: Education Pressure Comparison */}
            {compareSummary.educationPressure ? (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Education Pressure Comparison</p>
                <div className="text-sm text-gray-800 whitespace-pre-line mb-2">
                  {compareSummary.educationPressure.comparison}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {compareSummary.educationPressure.explanation}
                </p>
                {compareSummary.educationPressure.pressureRangeNote && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-gray-900 mb-1">Pressure scale:</p>
                    <div className="text-xs text-gray-700 space-y-1 mb-2">
                      <div>0–20 🟢 Low pressure</div>
                      <div>20–40 🟡 Moderate pressure</div>
                      <div>40+ 🔴 High pressure</div>
                    </div>
                    <p className="text-xs text-gray-800 italic">
                      {compareSummary.educationPressure.pressureRangeNote}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Education Pressure Comparison</p>
                <p className="text-sm text-gray-700">
                  School pressure data is not available for one or both towns. This may be because the towns don&apos;t have primary schools in our database.
                </p>
              </div>
            )}

            {/* Block 3: Housing Trade-off */}
            {(compareSummary.housingTradeoff.price || compareSummary.housingTradeoff.lease) && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Housing Trade-off</p>
                <div className="space-y-1">
                  {compareSummary.housingTradeoff.price && (
                    <p className="text-sm text-gray-800">
                      <strong>Entry Price:</strong> {compareSummary.housingTradeoff.price}
                    </p>
                  )}
                  {compareSummary.housingTradeoff.lease && (
                    <p className="text-sm text-gray-800">
                      <strong>Lease:</strong> {compareSummary.housingTradeoff.lease}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Block 4: Who Each Town Is Better For */}
            {(compareSummary.bestSuitedFor.townA.length > 0 || compareSummary.bestSuitedFor.townB.length > 0) && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">Best suited for:</p>
                <div className="space-y-2">
                  {compareSummary.bestSuitedFor.townA.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-800">
                      <span className="mr-2 text-green-600">✔</span>
                      <span className="font-medium">{townA}:</span> {item}
                    </p>
                  ))}
                  {compareSummary.bestSuitedFor.townB.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-800">
                      <span className="mr-2 text-green-600">✔</span>
                      <span className="font-medium">{townB}:</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Block 5: Decision Hint - Always show */}
            {compareSummary.decisionHint && (
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-sm font-semibold text-gray-900 mb-1">Decision hint:</p>
                <p className="text-sm text-gray-800">{compareSummary.decisionHint}</p>
              </div>
            )}

            {/* Advanced details (collapsible) */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {advancedOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span>Advanced details</span>
              </button>
              {advancedOpen && (
                <div className="mt-3 space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Rent vs Buy gap:</p>
                    <p>{townA}: {formatCurrency(compareSummary.advanced.rentBuyGapA)}/mo</p>
                    <p>{townB}: {formatCurrency(compareSummary.advanced.rentBuyGapB)}/mo</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Market stability:</p>
                    <p>{townA}: {compareSummary.advanced.stabilityA}</p>
                    <p>{townB}: {compareSummary.advanced.stabilityB}</p>
                  </div>
                  {(compareSummary.advanced.leaseRiskReasonsA.length > 0 || compareSummary.advanced.leaseRiskReasonsB.length > 0) && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Lease risk details:</p>
                      {compareSummary.advanced.leaseRiskReasonsA.length > 0 && (
                        <div className="mb-2">
                          <p className="font-medium">{townA}:</p>
                          <ul className="list-disc list-inside ml-2">
                            {compareSummary.advanced.leaseRiskReasonsA.map((reason, idx) => (
                              <li key={idx} className="text-xs">{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {compareSummary.advanced.leaseRiskReasonsB.length > 0 && (
                        <div>
                          <p className="font-medium">{townB}:</p>
                          <ul className="list-disc list-inside ml-2">
                            {compareSummary.advanced.leaseRiskReasonsB.map((reason, idx) => (
                              <li key={idx} className="text-xs">{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Moving Education Pressure: What Changes (Second Screen) */}
        {compareSummary && compareSummary.movingEducationImpact && spiA && spiB && (
          <ChartCard
            title="Moving Education Pressure: What Changes"
            description="Understand how moving affects primary school competition and choice"
            icon={<GraduationCap className="w-6 h-6" />}
          >
            <div className="space-y-4">
              {/* SPI Explanation */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-700 italic">
                  SPI measures structural pressure (competition + choice constraints), not your child&apos;s score.
                </p>
              </div>

              {/* Four-line changes */}
              <div className="space-y-3">
                {/* SPI Change */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">SPI change:</span>
                    <span className={`text-sm font-semibold ${
                      compareSummary.movingEducationImpact.spiChange > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {compareSummary.movingEducationImpact.spiChange > 0 ? '+' : ''}{compareSummary.movingEducationImpact.spiChangeText}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-2 font-medium">
                    {compareSummary.movingEducationImpact.explanation || 
                      (compareSummary.movingEducationImpact.spiChangeText.includes('Low') 
                        ? 'Still within Low range — unlikely to change day-to-day stress.'
                        : 'In practice: unlikely to change daily study stress unless targeting specific elite schools.')}
                  </p>
                </div>

                {/* High-demand schools */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">High-demand schools:</span>
                  <span className={`text-sm font-semibold ${
                    compareSummary.movingEducationImpact.highDemandSchoolsChange > 0 ? 'text-red-600' : 
                    compareSummary.movingEducationImpact.highDemandSchoolsChange < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {compareSummary.movingEducationImpact.highDemandSchoolsText}
                  </span>
                </div>

                {/* Number of primary schools */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Number of primary schools:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {compareSummary.movingEducationImpact.schoolCountText}
                  </span>
                </div>

                {/* Choice flexibility */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Choice flexibility:</span>
                  <span className={`text-sm font-semibold ${
                    compareSummary.movingEducationImpact.choiceFlexibility === 'Better' ? 'text-green-600' :
                    compareSummary.movingEducationImpact.choiceFlexibility === 'Worse' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {compareSummary.movingEducationImpact.choiceFlexibility}
                  </span>
                </div>
              </div>

              {/* Explanation sentence */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {compareSummary.movingEducationImpact.explanation}
                </p>
              </div>
            </div>
          </ChartCard>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading comparison data...</p>
            </div>
          </div>
        ) : profileA && profileB ? (
          <>
            {/* Moving Pressure: What Changes (Second Screen - Most Important) */}
            {spiA && spiB && profileA && profileB && (
              <ChartCard
                title="Moving Pressure: What Changes"
                description="Compare the impact of moving from one town to another"
                icon={<Map className="w-6 h-6" />}
              >
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Move from: <span className="font-bold">{townA}</span> → <span className="font-bold">{townB}</span>
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Education Pressure:</span>
                        <span className={`text-sm font-semibold ${
                          spiB.spi > spiA.spi ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {spiB.spi > spiA.spi ? '+' : ''}{Math.round((spiB.spi - spiA.spi) * 10) / 10} {spiB.spi > spiA.spi ? '🔺' : '🔻'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Entry Price:</span>
                        <span className={`text-sm font-semibold ${
                          profileB.medianResalePrice > profileA.medianResalePrice ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {profileB.medianResalePrice > profileA.medianResalePrice ? '+' : ''}{formatCurrency(Math.abs(profileB.medianResalePrice - profileA.medianResalePrice))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Remaining Lease:</span>
                        <span className={`text-sm font-semibold ${
                          profileB.medianRemainingLease > profileA.medianRemainingLease ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {profileB.medianRemainingLease > profileA.medianRemainingLease ? '+' : ''}{Math.round(Math.abs(profileB.medianRemainingLease - profileA.medianRemainingLease))} years
                        </span>
                      </div>
                      {profileA.medianRent && profileB.medianRent && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Rent vs Buy Gap:</span>
                          <span className={`text-sm font-semibold ${
                            profileB.rentBuyGapMonthly < profileA.rentBuyGapMonthly ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {profileB.rentBuyGapMonthly < profileA.rentBuyGapMonthly ? '' : '+'}{formatCurrency(profileB.rentBuyGapMonthly - profileA.rentBuyGapMonthly)} / month
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-800 italic">
                      {(() => {
                        const priceHigher = profileB.medianResalePrice > profileA.medianResalePrice
                        const leaseBetter = profileB.medianRemainingLease > profileA.medianRemainingLease
                        const spiHigher = spiB.spi > spiA.spi
                        
                        if (priceHigher && leaseBetter && spiHigher) {
                          return `You pay more upfront to reduce lease risk, but face higher school competition.`
                        } else if (priceHigher && leaseBetter && !spiHigher) {
                          return `You pay more upfront to reduce lease risk and enjoy lower school pressure.`
                        } else if (!priceHigher && !leaseBetter && spiHigher) {
                          return `You save on entry cost but face higher lease risk and school competition.`
                        } else if (!priceHigher && !leaseBetter && !spiHigher) {
                          return `You save on entry cost and enjoy lower school pressure, but face higher lease risk.`
                        } else {
                          return `This move presents a balance between housing costs, lease security, and school environment.`
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </ChartCard>
            )}

            {/* Module A: Price & Cash Flow */}
            <div className="mb-8">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Price & Cash Flow</h3>
                </div>
                {priceOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {priceOpen && (
                <ChartCard
                  title="Price & Cash Flow"
                  description="Monthly costs and rental comparison"
                  icon={<Scale className="w-6 h-6" />}
                >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Median resale price</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(profileA.medianResalePrice)}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(profileB.medianResalePrice)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Estimated monthly mortgage</td>
                      <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(profileA.estimatedMonthlyMortgage)}</td>
                      <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(profileB.estimatedMonthlyMortgage)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Median rent (same flat)</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileA.medianRent ? formatCurrency(profileA.medianRent) : <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileB.medianRent ? formatCurrency(profileB.medianRent) : <span className="text-gray-400">N/A</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Rent vs Buy gap</td>
                      <td className="py-4 px-4 text-right">
                        {profileA.medianRent ? (
                          <span className={`font-semibold ${profileA.rentBuyGapMonthly > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profileA.rentBuyGapMonthly > 0 ? '+' : ''}{formatCurrency(profileA.rentBuyGapMonthly)}
                          </span>
                        ) : <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {profileB.medianRent ? (
                          <span className={`font-semibold ${profileB.rentBuyGapMonthly > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profileB.rentBuyGapMonthly > 0 ? '+' : ''}{formatCurrency(profileB.rentBuyGapMonthly)}
                          </span>
                        ) : <span className="text-gray-400">N/A</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-gray-500 italic">
                Positive values indicate renting costs more per month than buying.
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                <p className="text-xs font-semibold text-gray-700 mb-1">Why it matters:</p>
                <p className="text-xs text-gray-600">
                  When rents exceed mortgage payments, buying builds equity while renting does not. The larger the gap, the stronger the ownership advantage.
                </p>
              </div>
              {profileA.medianRent && profileB.medianRent && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {profileA.rentBuyGapMonthly > profileB.rentBuyGapMonthly ? (
                    <>Renting in {townA} costs significantly more than buying, widening the ownership advantage.</>
                  ) : (
                    <>Renting in {townB} costs significantly more than buying, widening the ownership advantage.</>
                  )}
                </div>
              )}
                </ChartCard>
              )}
            </div>

            {/* Module B: Lease & Risk */}
            <div className="mb-8">
              <button
                onClick={() => setLeaseOpen(!leaseOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Lease & Risk</h3>
                </div>
                {leaseOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {leaseOpen && (
                <ChartCard
                  title="Lease & Risk"
                  description="Long-term value and financing considerations"
                  icon={<AlertTriangle className="w-6 h-6" />}
                >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Typical remaining lease (median)</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        <span className="font-semibold">{Math.round(profileA.medianRemainingLease)} yrs</span>
                        {(profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical') && <span className="ml-2 text-amber-600">⚠️</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        <span className="font-semibold">{Math.round(profileB.medianRemainingLease)} yrs</span>
                        {(profileB.signals.leaseRisk === 'high' || profileB.signals.leaseRisk === 'critical') && <span className="ml-2 text-amber-600">⚠️</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">% of transactions &lt; 55 yrs</td>
                      <td className="py-4 px-4 text-right text-gray-800">{(profileA.pctTxBelow55 * 100).toFixed(0)}%</td>
                      <td className="py-4 px-4 text-right text-gray-800">{(profileB.pctTxBelow55 * 100).toFixed(0)}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Price per sqm trend</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileA.signals.pricingResponse === 'early_discount' ? <span className="text-amber-600 font-medium">Early discount</span> : profileA.signals.pricingResponse === 'premium' ? <span className="text-green-600 font-medium">Premium</span> : <span className="text-green-600 font-medium">Stable</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileB.signals.pricingResponse === 'early_discount' ? <span className="text-amber-600 font-medium">Early discount</span> : profileB.signals.pricingResponse === 'premium' ? <span className="text-green-600 font-medium">Premium</span> : <span className="text-green-600 font-medium">Stable</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
                {profileA.medianRemainingLease < profileB.medianRemainingLease - 5 ? (
                  <>{townA} shows earlier market discounting due to lease decay.</>
                ) : (
                  <>{townB} shows earlier market discounting due to lease decay.</>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 italic">
                Flats with remaining lease below ~60 years may face tighter financing and resale constraints.
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-amber-400">
                <p className="text-xs font-semibold text-gray-700 mb-1">Why it matters:</p>
                <p className="text-xs text-gray-600">
                  Flats below ~60 years remaining may face tighter financing and weaker resale demand over time. This becomes more critical if you plan to stay long-term or need to refinance.
                </p>
              </div>
                </ChartCard>
              )}
            </div>

            {/* Module C: Education Pressure (Primary) */}
            <ChartCard
              title="Education Pressure (Primary)"
              description="School competition and pressure index for primary school stage"
              icon={<GraduationCap className="w-6 h-6" />}
            >
              {spiA && spiB ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300 bg-gray-50">
                          <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700 font-medium">School Pressure Index</td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-gray-900">{spiA.spi}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                              spiA.level === 'low' ? 'bg-green-100 text-green-700' :
                              spiA.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {spiA.level === 'low' ? '🟢 Low' : spiA.level === 'medium' ? '🟡 Moderate' : '🔴 High'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-gray-900">{spiB.spi}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                              spiB.level === 'low' ? 'bg-green-100 text-green-700' :
                              spiB.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {spiB.level === 'low' ? '🟢 Low' : spiB.level === 'medium' ? '🟡 Moderate' : '🔴 High'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {spiA.spi !== spiB.spi && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                      Moving from {spiA.spi < spiB.spi ? townA : townB} → {spiA.spi < spiB.spi ? townB : townA} {spiA.spi < spiB.spi ? 'increases' : 'decreases'} school pressure.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  School pressure data not available for one or both towns.
                </div>
              )}
            </ChartCard>

            {/* Module E: Market Stability */}
            <div className="mb-8">
              <button
                onClick={() => setMarketOpen(!marketOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Market Stability</h3>
                </div>
                {marketOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {marketOpen && (
                <ChartCard
                  title="Market Stability"
                  description="Transaction volume and price volatility"
                  icon={<TrendingUp className="w-6 h-6" />}
                >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Recent transaction volume</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileA.volumeRecent > profileB.volumeRecent * 1.2 ? <span className="font-semibold text-green-600">High</span> : profileA.volumeRecent < profileB.volumeRecent * 0.8 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold">Moderate</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileB.volumeRecent > profileA.volumeRecent * 1.2 ? <span className="font-semibold text-green-600">High</span> : profileB.volumeRecent < profileA.volumeRecent * 0.8 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold">Moderate</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Price volatility (12m)</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileA.volatility12m > profileB.volatility12m * 1.2 ? <span className="font-semibold text-amber-600">Higher</span> : <span className="font-semibold text-green-600">Lower</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileB.volatility12m > profileA.volatility12m * 1.2 ? <span className="font-semibold text-amber-600">Higher</span> : <span className="font-semibold text-green-600">Lower</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Liquidity risk</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileA.volumeRecent < 50 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold text-green-600">Low</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {profileB.volumeRecent < 50 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold text-green-600">Low</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {(profileA.volumeRecent < 50 || profileB.volumeRecent < 50) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  Lower volume towns may show larger price swings.
                </div>
              )}
              <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-green-400">
                <p className="text-xs font-semibold text-gray-700 mb-1">Why it matters:</p>
                <p className="text-xs text-gray-600">
                  Higher transaction volume means easier resale and more stable prices. Lower volume can mean longer selling time and greater price volatility when you need to move.
                </p>
              </div>
                </ChartCard>
              )}
            </div>

            {/* Module D: School Access */}
            <div className="mb-8">
              <button
                onClick={() => setSchoolAccessOpen(!schoolAccessOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2"
              >
                <div className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">School Access</h3>
                </div>
                {schoolAccessOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {schoolAccessOpen && (
                <ChartCard
                  title="School Access"
                  description="Primary school proximity and options"
                  icon={<Map className="w-6 h-6" />}
                >
              {landscapeA && landscapeB ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300 bg-gray-50">
                          <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                          <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700 font-medium">Number of primary schools</td>
                          <td className="py-4 px-4 text-right font-bold text-gray-900">{landscapeA.schoolCount}</td>
                          <td className="py-4 px-4 text-right font-bold text-gray-900">{landscapeB.schoolCount}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700 font-medium">High-demand schools (≥251)</td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeA.highDemandSchools === 0 ? '—' : landscapeA.highDemandSchools}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeB.highDemandSchools === 0 ? '—' : landscapeB.highDemandSchools}
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700 font-medium">Low cut-off schools (≤230)</td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeA.cutoffDistribution.low === 0 ? '—' : landscapeA.cutoffDistribution.low}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeB.cutoffDistribution.low === 0 ? '—' : landscapeB.cutoffDistribution.low}
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700 font-medium">Mid cut-off schools (231-250)</td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeA.cutoffDistribution.mid === 0 ? '—' : landscapeA.cutoffDistribution.mid}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-800">
                            {landscapeB.cutoffDistribution.mid === 0 ? '—' : landscapeB.cutoffDistribution.mid}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                    {landscapeA.schoolCount > landscapeB.schoolCount ? (
                      <>{townA} offers more primary school options ({landscapeA.schoolCount} vs {landscapeB.schoolCount}), providing greater flexibility in school selection.</>
                    ) : landscapeB.schoolCount > landscapeA.schoolCount ? (
                      <>{townB} offers more primary school options ({landscapeB.schoolCount} vs {landscapeA.schoolCount}), providing greater flexibility in school selection.</>
                    ) : (
                      <>Both towns offer similar numbers of primary schools ({landscapeA.schoolCount} each).</>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  School access data not available for one or both towns.
                </div>
              )}
                </ChartCard>
              )}
            </div>

            {/* Module F: Time & Access */}
            <div className="mb-8">
              <button
                onClick={() => setTimeAccessOpen(!timeAccessOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Time & Access</h3>
                </div>
                {timeAccessOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {timeAccessOpen && (
                <ChartCard
                  title="Time & Access"
                  description="Daily commuting time and accessibility structure"
                  icon={<Clock className="w-6 h-6" />}
                >
                  {compareSummary && compareSummary.timeAccess ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                              <th className="text-left py-4 px-4 font-bold text-gray-900">Metric</th>
                              <th className="text-right py-4 px-4 font-bold text-gray-900">{townA}</th>
                              <th className="text-right py-4 px-4 font-bold text-gray-900">{townB}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="py-4 px-4 text-gray-700 font-medium">Daily time burden</td>
                              <td className="py-4 px-4 text-right">
                                <span className={`font-semibold ${
                                  compareSummary.timeAccess.timeBurdenA === 'high' ? 'text-red-600' :
                                  compareSummary.timeAccess.timeBurdenA === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {compareSummary.timeAccess.timeBurdenA === 'high' ? 'High' :
                                   compareSummary.timeAccess.timeBurdenA === 'medium' ? 'Medium' : 'Low'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className={`font-semibold ${
                                  compareSummary.timeAccess.timeBurdenB === 'high' ? 'text-red-600' :
                                  compareSummary.timeAccess.timeBurdenB === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {compareSummary.timeAccess.timeBurdenB === 'high' ? 'High' :
                                   compareSummary.timeAccess.timeBurdenB === 'medium' ? 'Medium' : 'Low'}
                                </span>
                              </td>
                            </tr>
                            {compareSummary.timeAccess.townA && compareSummary.timeAccess.townB && (
                              <>
                                <tr className="hover:bg-gray-50">
                                  <td className="py-4 px-4 text-gray-700 font-medium">Centrality</td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townA.centrality.replace('_', ' ')}
                                  </td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townB.centrality.replace('_', ' ')}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="py-4 px-4 text-gray-700 font-medium">MRT Density</td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townA.mrtDensity}
                                  </td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townB.mrtDensity}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="py-4 px-4 text-gray-700 font-medium">Transfer Complexity</td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townA.transferComplexity.replace('_', ' ')}
                                  </td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townB.transferComplexity.replace('_', ' ')}
                                  </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                  <td className="py-4 px-4 text-gray-700 font-medium">Regional Hub Access</td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townA.regionalHubAccess}
                                  </td>
                                  <td className="py-4 px-4 text-right text-gray-800 capitalize">
                                    {compareSummary.timeAccess.townB.regionalHubAccess}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {compareSummary.timeAccess.movingImpact && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            Moving from {townA} → {townB}:
                          </p>
                          <p className="text-sm text-gray-800">
                            {compareSummary.timeAccess.movingImpact}
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-700 italic">
                          Time & Access reflects structural accessibility attributes, not precise commute times. 
                          This helps you understand long-term daily time burden differences between towns.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Time & Access data not available for one or both towns.
                    </div>
                  )}
                </ChartCard>
              )}
            </div>

            {/* Decision Guidance */}
            {guidance && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to think about this choice</h3>
                <div className="space-y-4 text-gray-700">
                  <p className="text-base leading-relaxed">{guidance.chooseA}</p>
                  <p className="text-base leading-relaxed">{guidance.chooseB}</p>
                  <p className="text-base font-semibold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                    {guidance.conclusion}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p>Unable to load comparison data. Please try different towns or flat types.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CompareTownsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <CompareTownsPageContent />
    </Suspense>
  )
}

