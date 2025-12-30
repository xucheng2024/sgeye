'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTownProfile, generateCompareSummary, TownProfile, CompareSummary, PreferenceLens, TownComparisonData } from '@/lib/hdb-data'
import { FamilyProfile, mapFamilyProfileToRuleProfile } from '@/lib/decision-rules'
import { calculateSchoolPressureIndex, getSchoolLandscape, SchoolPressureIndex, SchoolLandscape } from '@/lib/school-data'
import { formatCurrency } from '@/lib/utils'
import { Scale, AlertTriangle, TrendingUp, Map, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react'
import ChartCard from '@/components/ChartCard'

const TOWNS = ['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH', 'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN']
const FLAT_TYPES = ['3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE']

// Signal Layer: Convert raw data to signals
interface TownSignals {
  affordability: 'Comfortable' | 'Stretch' | 'Out of reach'
  cashflow: 'Strong buy advantage' | 'Buy advantage' | 'Rent competitive'
  leaseRisk: 'High' | 'Moderate' | 'Low'
  stability: 'Fragile' | 'Volatile' | 'Stable'
  valueProfile: 'Early discount' | 'Stable pricing' | 'Premium growth'
}

function generateSignals(
  data: TownComparisonData,
  userBudget: number,
  estimatedMortgage: number,
  islandAvgVolatility: number = 0.12,
  islandAvgVolume: number = 100
): TownSignals {
  // Signal 1: Affordability
  let affordability: 'Comfortable' | 'Stretch' | 'Out of reach'
  if (data.medianPrice <= userBudget * 0.95) {
    affordability = 'Comfortable'
  } else if (data.medianPrice <= userBudget) {
    affordability = 'Stretch'
  } else {
    affordability = 'Out of reach'
  }

  // Signal 2: Cash Flow Advantage
  let cashflow: 'Strong buy advantage' | 'Buy advantage' | 'Rent competitive'
  if (data.medianRent && data.medianRent > estimatedMortgage * 1.2) {
    cashflow = 'Strong buy advantage'
  } else if (data.medianRent && data.medianRent > estimatedMortgage) {
    cashflow = 'Buy advantage'
  } else {
    cashflow = 'Rent competitive'
  }

  // Signal 3: Lease Risk
  let leaseRisk: 'High' | 'Moderate' | 'Low'
  if (data.medianLeaseYears < 60) {
    leaseRisk = 'High'
  } else if (data.medianLeaseYears < 70) {
    leaseRisk = 'Moderate'
  } else {
    leaseRisk = 'Low'
  }
  
  // Correction: Market-wide risk
  if (data.pctBelow55Years > 50) {
    leaseRisk = 'High'
  }

  // Signal 4: Market Stability
  let stability: 'Fragile' | 'Volatile' | 'Stable'
  if (data.priceVolatility > islandAvgVolatility && data.txCount < islandAvgVolume) {
    stability = 'Fragile'
  } else if (data.priceVolatility > islandAvgVolatility) {
    stability = 'Volatile'
  } else {
    stability = 'Stable'
  }

  // Signal 5: Value Profile
  let valueProfile: 'Early discount' | 'Stable pricing' | 'Premium growth'
  if (data.medianLeaseYears < 60) {
    valueProfile = 'Early discount'
  } else if (data.medianLeaseYears < 70) {
    valueProfile = 'Stable pricing'
  } else {
    valueProfile = 'Premium growth'
  }

  return {
    affordability,
    cashflow,
    leaseRisk,
    stability,
    valueProfile
  }
}

// Recommended comparison pairs
const RECOMMENDED_PAIRS = [
  { townA: 'ANG MO KIO', townB: 'BUKIT BATOK', label: 'Popular vs Value', description: 'Compare two popular towns with different price points' },
  { townA: 'QUEENSTOWN', townB: 'CLEMENTI', label: 'Central vs West', description: 'Central location vs established western town' },
  { townA: 'BISHAN', townB: 'TAMPINES', label: 'North vs East', description: 'Two major regional centers' },
  { townA: 'BEDOK', townB: 'WOODLANDS', label: 'East vs North', description: 'Compare eastern and northern options' },
]

// Generate summary from signals (template-based)
function generateSummaryFromSignals(
  townA: string,
  townB: string,
  signalsA: TownSignals,
  signalsB: TownSignals
): string[] {
  const bullets: string[] = []
  
  // Entry cost from affordability signal
  if (signalsA.affordability === 'Comfortable' && signalsB.affordability !== 'Comfortable') {
    bullets.push(`Entry cost: ${townA} lower, ${townB} slightly higher`)
  } else if (signalsB.affordability === 'Comfortable' && signalsA.affordability !== 'Comfortable') {
    bullets.push(`Entry cost: ${townB} lower, ${townA} slightly higher`)
  } else {
    bullets.push(`Entry cost: Similar price points`)
  }
  
  // Lease profile from lease risk signal
  if (signalsA.leaseRisk === 'High' && signalsB.leaseRisk !== 'High') {
    bullets.push(`Lease profile: ${townA} shorter, ${townB} longer`)
  } else if (signalsB.leaseRisk === 'High' && signalsA.leaseRisk !== 'High') {
    bullets.push(`Lease profile: ${townB} shorter, ${townA} longer`)
  } else {
    bullets.push(`Lease profile: Similar remaining lease`)
  }
  
  // Market stability from stability signal
  if (signalsA.stability === 'Fragile' || signalsA.stability === 'Volatile') {
    if (signalsB.stability === 'Stable') {
      bullets.push(`Market stability: ${townA} more volatile, ${townB} more stable`)
    } else {
      bullets.push(`Market stability: ${townA} more volatile, ${townB} moderate`)
    }
  } else if (signalsB.stability === 'Fragile' || signalsB.stability === 'Volatile') {
    bullets.push(`Market stability: ${townB} more volatile, ${townA} more stable`)
  } else {
    bullets.push(`Market stability: Similar transaction volume`)
  }
  
  return bullets
}

// Generate automatic summary as structured bullets (legacy function, kept for compatibility)
function generateSummary(
  townA: TownComparisonData,
  townB: TownComparisonData,
  mortgageA: number,
  mortgageB: number
): string[] {
  const priceDiff = Math.abs(townA.medianPrice - townB.medianPrice) / Math.min(townA.medianPrice, townB.medianPrice)
  const bullets: string[] = []
  
  // Entry cost bullet
  if (townA.medianPrice < townB.medianPrice && priceDiff > 0.03) {
    bullets.push(`Entry cost: ${townA.town} lower, ${townB.town} slightly higher`)
  } else if (townB.medianPrice < townA.medianPrice && priceDiff > 0.03) {
    bullets.push(`Entry cost: ${townB.town} lower, ${townA.town} slightly higher`)
  } else {
    bullets.push(`Entry cost: Similar price points`)
  }
  
  // Lease profile bullet
  if (townA.medianLeaseYears < townB.medianLeaseYears - 5) {
    bullets.push(`Lease profile: ${townA.town} shorter, ${townB.town} longer`)
  } else if (townB.medianLeaseYears < townA.medianLeaseYears - 5) {
    bullets.push(`Lease profile: ${townB.town} shorter, ${townA.town} longer`)
  } else {
    bullets.push(`Lease profile: Similar remaining lease`)
  }
  
  // Market stability bullet
  if (townA.priceVolatility > townB.priceVolatility * 1.2) {
    bullets.push(`Market stability: ${townA.town} more volatile, ${townB.town} more stable`)
  } else if (townB.priceVolatility > townA.priceVolatility * 1.2) {
    bullets.push(`Market stability: ${townB.town} more volatile, ${townA.town} more stable`)
  } else {
    if (townA.txCount > townB.txCount * 1.2) {
      bullets.push(`Market stability: ${townA.town} higher liquidity, ${townB.town} moderate`)
    } else if (townB.txCount > townA.txCount * 1.2) {
      bullets.push(`Market stability: ${townB.town} higher liquidity, ${townA.town} moderate`)
    } else {
      bullets.push(`Market stability: Similar transaction volume`)
    }
  }
  
  return bullets
}

// Generate "Who this suits" and "Who should avoid" from TownProfile
function generateSuitabilityFromProfile(
  profile: TownProfile,
  townName: string
): { suits: string[]; avoids: string[] } {
  const suits: string[] = []
  const avoids: string[] = []
  
  // Based on affordability (if price is lower)
  // This would need userBudget to determine, but we can infer from signals
  
  // Based on cashflow
  if (profile.rentBuyGapMonthly > 0) {
    suits.push('Buyers prioritizing cash flow advantage')
  }
  
  // Based on lease risk
  if (profile.signals.leaseRisk === 'high' || profile.signals.leaseRisk === 'critical') {
    suits.push('Households planning shorter holding periods')
    avoids.push('Buyers relying on future resale')
    avoids.push('Buyers sensitive to lease-related financing risk')
  } else {
    suits.push('Buyers planning long-term ownership')
  }
  
  // Based on stability
  if (profile.signals.stability === 'stable') {
    suits.push('Buyers valuing resale stability')
  } else if (profile.signals.stability === 'fragile') {
    avoids.push('Buyers needing quick resale flexibility')
  }
  
  // Default if no specific signals
  if (suits.length === 0) {
    suits.push('Buyers with specific preferences')
  }
  
  return { suits, avoids }
}

// Generate decision hint from TownProfiles
function generateDecisionHintFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile
): string[] {
  const hints: string[] = []
  
  // Rule: If lease risk is High → mark lease risk
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical' ||
      profileB.signals.leaseRisk === 'high' || profileB.signals.leaseRisk === 'critical') {
    hints.push('If you plan to stay long-term (15+ years), lease profile matters more than entry price.')
  }
  
  // Rule: If volatility high → mark upgrade risk
  if (profileA.signals.stability === 'volatile' || profileA.signals.stability === 'fragile' || 
      profileB.signals.stability === 'volatile' || profileB.signals.stability === 'fragile') {
    hints.push('If you plan to upgrade or move again, market liquidity matters more.')
  }
  
  // Rule: If rent > mortgage → emphasize ownership advantage
  if (profileA.rentBuyGapMonthly > 0 || profileB.rentBuyGapMonthly > 0) {
    hints.push('With rents exceeding mortgage payments, buying builds equity while renting does not.')
  }
  
  // Default hint if no specific rules match
  if (hints.length === 0) {
    hints.push('Consider your timeline: longer stays favor lease security, shorter stays favor liquidity.')
  }
  
  return hints
}

// Generate decision verdict from TownProfiles
function generateDecisionVerdictFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile
): string | null {
  // More balanced long-term option
  if ((profileA.rentBuyGapMonthly > 0 && profileA.signals.leaseRisk !== 'high' && profileA.signals.leaseRisk !== 'critical') ||
      (profileB.rentBuyGapMonthly > 0 && profileB.signals.leaseRisk !== 'high' && profileB.signals.leaseRisk !== 'critical')) {
    return 'More balanced long-term option'
  }
  
  // Affordability-driven, higher long-term risk
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical' ||
      profileB.signals.leaseRisk === 'high' || profileB.signals.leaseRisk === 'critical') {
    return 'Affordability-driven, higher long-term risk'
  }
  
  return null
}

// Generate decision hint from signals
function generateDecisionHint(
  signalsA: TownSignals,
  signalsB: TownSignals
): string[] {
  const hints: string[] = []
  
  // Rule: If lease risk is High → mark lease risk
  if (signalsA.leaseRisk === 'High' || signalsB.leaseRisk === 'High') {
    hints.push('If you plan to stay long-term (15+ years), lease profile matters more than entry price.')
  }
  
  // Rule: If volatility high → mark upgrade risk
  if (signalsA.stability === 'Volatile' || signalsA.stability === 'Fragile' || 
      signalsB.stability === 'Volatile' || signalsB.stability === 'Fragile') {
    hints.push('If you plan to upgrade or move again, market liquidity matters more.')
  }
  
  // Rule: If rent > mortgage → emphasize ownership advantage
  if (signalsA.cashflow === 'Strong buy advantage' || signalsA.cashflow === 'Buy advantage' ||
      signalsB.cashflow === 'Strong buy advantage' || signalsB.cashflow === 'Buy advantage') {
    hints.push('With rents exceeding mortgage payments, buying builds equity while renting does not.')
  }
  
  // Default hint if no specific rules match
  if (hints.length === 0) {
    hints.push('Consider your timeline: longer stays favor lease security, shorter stays favor liquidity.')
  }
  
  return hints
}

// Generate decision verdict from signals
function generateDecisionVerdict(
  signalsA: TownSignals,
  signalsB: TownSignals
): string | null {
  // More balanced long-term option
  if ((signalsA.cashflow === 'Strong buy advantage' && signalsA.leaseRisk !== 'High') ||
      (signalsB.cashflow === 'Strong buy advantage' && signalsB.leaseRisk !== 'High')) {
    return 'More balanced long-term option'
  }
  
  // Affordability-driven, higher long-term risk
  if (signalsA.leaseRisk === 'High' || signalsB.leaseRisk === 'High') {
    return 'Affordability-driven, higher long-term risk'
  }
  
  return null
}

// Generate decision guidance from TownProfiles
function generateDecisionGuidanceFromProfiles(
  profileA: TownProfile,
  profileB: TownProfile,
  townA: string,
  townB: string
): { chooseA: string; chooseB: string; conclusion: string } {
  const chooseAParts: string[] = []
  const chooseBParts: string[] = []
  
  // Town A advantages
  if (profileA.medianResalePrice < profileB.medianResalePrice) {
    chooseAParts.push('lower upfront cost')
  }
  if (profileA.volumeRecent > profileB.volumeRecent * 1.2) {
    chooseAParts.push('higher liquidity')
  }
  if (profileA.signals.leaseRisk === 'high' || profileA.signals.leaseRisk === 'critical') {
    chooseAParts.push('comfortable with lease trade-offs')
  }
  if (profileA.rentBuyGapMonthly > profileB.rentBuyGapMonthly) {
    chooseAParts.push('stronger cash flow advantage')
  }
  
  // Town B advantages
  if (profileB.medianRemainingLease > profileA.medianRemainingLease + 5) {
    chooseBParts.push('longer remaining leases')
  }
  if (profileB.volatility12m < profileA.volatility12m * 0.8) {
    chooseBParts.push('more stable long-term ownership')
  }
  if (profileB.signals.leaseRisk === 'low' || profileB.signals.leaseRisk === 'moderate') {
    chooseBParts.push('healthier lease profile')
  }
  if (profileB.medianResalePrice > profileA.medianResalePrice) {
    chooseBParts.push('at a slightly higher cost')
  }
  
  return {
    chooseA: chooseAParts.length > 0 
      ? `Choose ${townA} if you prioritize ${chooseAParts.join(' and ')}.`
      : `Choose ${townA} based on your specific preferences.`,
    chooseB: chooseBParts.length > 0
      ? `Choose ${townB} if you value ${chooseBParts.join(' and ')}.`
      : `Choose ${townB} based on your specific preferences.`,
    conclusion: 'There is no universally better town — only a better fit for your situation.'
  }
}

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
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [preferenceLens, setPreferenceLens] = useState<'lower_cost' | 'lease_safety' | 'school_pressure' | 'balanced'>('balanced')
  const [holdingPeriod, setHoldingPeriod] = useState<'short' | 'medium' | 'long'>('medium')
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(true)
  const [leaseOpen, setLeaseOpen] = useState(true)
  const [marketOpen, setMarketOpen] = useState(false)
  const [schoolAccessOpen, setSchoolAccessOpen] = useState(false)
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null)
  const [showProfileEditor, setShowProfileEditor] = useState(false)

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
  const isLongTerm = holdingPeriod === 'long'
  // Convert holdingPeriod to FamilyProfile format if familyProfile doesn't exist
  const effectiveFamilyProfile: FamilyProfile | null = familyProfile || (holdingPeriod ? {
    stage: 'primary_family',  // Default
    holdingYears: holdingPeriod,
    costVsValue: preferenceLens === 'lower_cost' ? 'cost' : preferenceLens === 'lease_safety' ? 'value' : 'balanced',
    schoolSensitivity: preferenceLens === 'school_pressure' ? 'high' : 'neutral'
  } : null)
  
  const compareSummary: CompareSummary | null = profileA && profileB 
    ? generateCompareSummary(profileA, profileB, userBudget, spiA, spiB, landscapeA, landscapeB, preferenceLens, isLongTerm, effectiveFamilyProfile)
    : null

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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Where should my family live — given our priorities?</h1>
          <p className="text-lg text-gray-600 mb-2">Compare towns by cost, lease safety, rent pressure, and primary school competition — and see what changes when you move.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Profile Display Bar */}
        {effectiveFamilyProfile && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">👨‍👩‍👧 Family profile:</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  {effectiveFamilyProfile.stage === 'no_children' ? 'Young couple / No children yet' :
                   effectiveFamilyProfile.stage === 'primary_family' ? 'Primary school family' :
                   effectiveFamilyProfile.stage === 'planning_primary' ? 'Planning for primary school soon' :
                   'Older children / Long-term stability'}
                </span>
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                  {effectiveFamilyProfile.holdingYears === 'short' ? '< 5 years' :
                   effectiveFamilyProfile.holdingYears === 'medium' ? '5–15 years' :
                   '15+ years'}
                </span>
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                  {effectiveFamilyProfile.costVsValue === 'cost' ? 'Cost-focused' :
                   effectiveFamilyProfile.costVsValue === 'value' ? 'Value-focused' :
                   'Balanced'}
                </span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                  {effectiveFamilyProfile.schoolSensitivity === 'high' ? 'Low school pressure' :
                   effectiveFamilyProfile.schoolSensitivity === 'low' ? 'Comfortable with competition' :
                   'Neutral'}
                </span>
              </div>
              <button
                onClick={() => setShowProfileEditor(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                (Edit)
              </button>
            </div>
          </div>
        )}

        {/* Family Profile Editor Sidebar */}
        {showProfileEditor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
            <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Family Profile</h2>
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Question 1: Family Stage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your family stage
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'no_children', label: 'Young couple / No children yet' },
                      { value: 'primary_family', label: 'Family with primary-school child(ren)' },
                      { value: 'planning_primary', label: 'Planning for primary school soon' },
                      { value: 'older_children', label: 'Older children / Long-term stability focus' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                        (familyProfile?.stage === option.value || (!familyProfile && option.value === 'primary_family')) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="stage"
                          value={option.value}
                          checked={familyProfile?.stage === option.value || (!familyProfile && option.value === 'primary_family')}
                          onChange={(e) => setFamilyProfile(prev => ({
                            ...(prev || { stage: 'primary_family', holdingYears: 'medium', costVsValue: 'balanced', schoolSensitivity: 'neutral' }),
                            stage: e.target.value as FamilyProfile['stage']
                          }))}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 2: Holding Years */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    How long do you expect to stay in this home?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'short', label: '< 5 years' },
                      { value: 'medium', label: '5–15 years' },
                      { value: 'long', label: '15+ years' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                        (familyProfile?.holdingYears === option.value || (!familyProfile && holdingPeriod === option.value)) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="holdingYears"
                          value={option.value}
                          checked={familyProfile?.holdingYears === option.value || (!familyProfile && holdingPeriod === option.value)}
                          onChange={(e) => {
                            const value = e.target.value as FamilyProfile['holdingYears']
                            setFamilyProfile(prev => ({
                              ...(prev || { stage: 'primary_family', holdingYears: 'medium', costVsValue: 'balanced', schoolSensitivity: 'neutral' }),
                              holdingYears: value
                            }))
                            setHoldingPeriod(value)
                          }}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 3: Cost vs Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Which matters more right now?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'cost', label: 'Lower upfront & monthly cost' },
                      { value: 'value', label: 'Long-term value & resale safety' },
                      { value: 'balanced', label: 'Balanced' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                        (familyProfile?.costVsValue === option.value || (!familyProfile && (
                          (preferenceLens === 'lower_cost' && option.value === 'cost') ||
                          (preferenceLens === 'lease_safety' && option.value === 'value') ||
                          (preferenceLens === 'balanced' && option.value === 'balanced')
                        ))) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="costVsValue"
                          value={option.value}
                          checked={familyProfile?.costVsValue === option.value || (!familyProfile && (
                            (preferenceLens === 'lower_cost' && option.value === 'cost') ||
                            (preferenceLens === 'lease_safety' && option.value === 'value') ||
                            (preferenceLens === 'balanced' && option.value === 'balanced')
                          ))}
                          onChange={(e) => {
                            const value = e.target.value as FamilyProfile['costVsValue']
                            setFamilyProfile(prev => ({
                              ...(prev || { stage: 'primary_family', holdingYears: 'medium', costVsValue: 'balanced', schoolSensitivity: 'neutral' }),
                              costVsValue: value
                            }))
                            // Auto-update preference lens
                            if (value === 'cost') setPreferenceLens('lower_cost')
                            else if (value === 'value') setPreferenceLens('lease_safety')
                            else setPreferenceLens('balanced')
                          }}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 4: School Sensitivity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    How sensitive are you to school competition?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'high', label: 'Very sensitive (prefer lower pressure)' },
                      { value: 'neutral', label: 'Neutral' },
                      { value: 'low', label: 'Comfortable with competition' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                        (familyProfile?.schoolSensitivity === option.value || (!familyProfile && (
                          (preferenceLens === 'school_pressure' && option.value === 'high') ||
                          (!familyProfile && option.value === 'neutral')
                        ))) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="schoolSensitivity"
                          value={option.value}
                          checked={familyProfile?.schoolSensitivity === option.value || (!familyProfile && (
                            (preferenceLens === 'school_pressure' && option.value === 'high') ||
                            (!familyProfile && option.value === 'neutral')
                          ))}
                          onChange={(e) => {
                            const value = e.target.value as FamilyProfile['schoolSensitivity']
                            setFamilyProfile(prev => ({
                              ...(prev || { stage: 'primary_family', holdingYears: 'medium', costVsValue: 'balanced', schoolSensitivity: 'neutral' }),
                              schoolSensitivity: value
                            }))
                            // Auto-update preference lens if very sensitive
                            if (value === 'high') setPreferenceLens('school_pressure')
                          }}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowProfileEditor(false)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First Screen: Quick Start */}
        {!searchParams.get('townA') && !searchParams.get('townB') && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {RECOMMENDED_PAIRS.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setTownA(pair.townA)
                    setTownB(pair.townB)
                  }}
                  className="text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="font-semibold text-sm text-gray-900 mb-1">{pair.label}</div>
                  <div className="text-xs text-gray-600">{pair.townA} vs {pair.townB}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Second Screen: My Situation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">My situation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Town A</label>
              <select
                value={townA}
                onChange={(e) => setTownA(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                {TOWNS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="text-center text-gray-400 font-semibold text-lg">vs</div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Town B</label>
              <select
                value={townB}
                onChange={(e) => setTownB(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                {TOWNS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flat Type</label>
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                {FLAT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Holding period</label>
              <select
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(e.target.value as 'short' | 'medium' | 'long')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="short">&lt;5 years</option>
                <option value="medium">5–15 years</option>
                <option value="long">15+ years</option>
              </select>
            </div>
          </div>
        </div>

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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recommendation</h3>
              {compareSummary.recommendation.confidence === 'clear_winner' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Clear winner
                </span>
              )}
              {compareSummary.recommendation.confidence === 'balanced' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Balanced
                </span>
              )}
              {compareSummary.recommendation.confidence === 'depends_on_preference' && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  Depends on preference
                </span>
              )}
            </div>

            {/* Verdict-style Recommendation */}
            <div className="space-y-6">
              {/* Main recommendation */}
              <div className="p-5 bg-white rounded-lg border-2 border-blue-300">
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  {preferenceLens === 'balanced' 
                    ? 'If you value a balanced trade-off:'
                    : preferenceLens === 'lower_cost'
                    ? 'If you prioritise lower upfront cost:'
                    : preferenceLens === 'lease_safety'
                    ? 'If you prioritise long-term lease safety:'
                    : 'If you prioritise lower school pressure:'}
                </p>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  → {(() => {
                    const headline = compareSummary.recommendation.headline
                    if (headline.includes('Choose ')) {
                      const town = headline.match(/Choose ([^ ]+)/)?.[1] || ''
                      return `${town} is the better overall choice.`
                    }
                    return headline
                  })()}
                </p>
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Why:</p>
                  <ul className="space-y-1.5">
                    {compareSummary.recommendation.tradeoffs.map((tradeoff, idx) => {
                      // Extract key points from tradeoffs
                      const point = tradeoff.replace(/💰 |🧱 |🎓 /, '').replace(/^[^:]+: /, '')
                      return (
                        <li key={idx} className="text-sm text-gray-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              {/* Alternative recommendation (if long-term holding) */}
              {holdingPeriod === 'long' && compareSummary.recommendation.tradeoffs.some(t => t.includes('Lease')) && (
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    If you plan to hold long-term (15+ years):
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    → Consider {compareSummary.recommendation.headline.includes(townA) ? townB : townA} for stronger lease safety.
                  </p>
                </div>
              )}

              {/* Final note */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-700 italic">
                  This is not a &quot;right vs wrong&quot; choice — it depends on what you optimize for.
                </p>
              </div>
            </div>

            {/* See the evidence button */}
            <button
              onClick={() => setEvidenceOpen(!evidenceOpen)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {evidenceOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide evidence
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  See the evidence
                </>
              )}
            </button>
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
                  <p className="text-xs text-gray-600 italic mt-1">
                    In practice: unlikely to change daily study stress unless targeting specific elite schools.
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

        {/* Evidence (expandable) */}
        {compareSummary && evidenceOpen && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Evidence</h3>
            
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

            {/* Block 1: Headline Verdict */}
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

            {/* Block 5: Decision Hint */}
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-1">Decision hint:</p>
              <p className="text-sm text-gray-800">{compareSummary.decisionHint}</p>
            </div>

            {/* Advanced details (collapsible) */}
            <div className="border-t border-blue-200 pt-4">
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

