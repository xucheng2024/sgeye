'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTownProfile, generateCompareSummary, TownProfile, CompareSummary } from '@/lib/hdb-data'
import { calculateSchoolPressureIndex, SchoolPressureIndex } from '@/lib/school-data'
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

export default function CompareTownsPage() {
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
  const [loading, setLoading] = useState(true)
  const [userBudget, setUserBudget] = useState<number | undefined>(undefined)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [resultA, resultB, spiResultA, spiResultB] = await Promise.all([
          getTownProfile(townA, flatType, 24), // Use 24 months for decision tool
          getTownProfile(townB, flatType, 24),
          calculateSchoolPressureIndex(townA),
          calculateSchoolPressureIndex(townB),
        ])
        setProfileA(resultA)
        setProfileB(resultB)
        setSpiA(spiResultA)
        setSpiB(spiResultB)
        
        // Debug logging
        console.log('SPI Data:', {
          townA,
          townB,
          spiA: spiResultA,
          spiB: spiResultB,
        })
      } catch (error) {
        console.error('Error fetching comparison data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [townA, townB, flatType])

  // Generate Compare Summary from Town Profiles (with SPI)
  const compareSummary: CompareSummary | null = profileA && profileB 
    ? generateCompareSummary(profileA, profileB, userBudget, spiA, spiB)
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Compare Two Towns — What You Gain, What You Trade Off</h1>
          <p className="text-lg text-gray-600 mb-2">A side-by-side comparison based on resale prices, rent, lease profile, and long-term risks.</p>
          <p className="text-sm text-gray-500 italic">
            This tool helps you narrow down suitable towns and understand trade-offs. Final unit selection depends on specific flat attributes such as block, floor, and proximity.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Select Recommended Pairs */}
        {!searchParams.get('townA') && !searchParams.get('townB') && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Start — Try a recommended comparison:</h3>
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
                  <div className="text-xs text-gray-600 mb-2">{pair.townA} vs {pair.townB}</div>
                  <div className="text-xs text-gray-500">{pair.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Town Selection */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
          <div className="mt-4">
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
        </div>

        {/* Auto-generated Summary - Fixed 5-block structure */}
        {compareSummary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Summary</h3>
              <div className="flex items-center gap-2">
                {compareSummary.badges
                  .filter(b => b.town === 'A')
                  .map((badge, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        badge.tone === 'warn'
                          ? 'bg-red-100 text-red-700'
                          : badge.tone === 'good'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {townA}: {badge.label}
                    </span>
                  ))}
                {compareSummary.badges
                  .filter(b => b.town === 'B')
                  .map((badge, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        badge.tone === 'warn'
                          ? 'bg-red-100 text-red-700'
                          : badge.tone === 'good'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {townB}: {badge.label}
                    </span>
                  ))}
              </div>
            </div>

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
                <p className="text-sm text-gray-700">
                  {compareSummary.educationPressure.explanation}
                </p>
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
            {/* Module A: Price & Cash Flow */}
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

            {/* Module B: Lease & Risk */}
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

            {/* Module D: Moving Pressure Visualization */}
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

            {/* Module E: Market Stability */}
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

            {/* Module D: School Access (Coming soon) */}
            <ChartCard
              title="School Access"
              description="Primary school proximity and options"
              icon={<Map className="w-6 h-6" />}
            >
              <div className="flex items-center justify-center h-32 text-gray-400">
                <p>Coming soon</p>
              </div>
            </ChartCard>

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

