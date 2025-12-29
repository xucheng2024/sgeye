'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTownComparisonData, calculateMonthlyMortgage, TownComparisonData } from '@/lib/hdb-data'
import { formatCurrency } from '@/lib/utils'
import { Scale, AlertTriangle, TrendingUp, Map } from 'lucide-react'
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

// Generate "Who this suits" and "Who should avoid" from signals
function generateSuitability(
  signals: TownSignals,
  townName: string
): { suits: string[]; avoids: string[] } {
  const suits: string[] = []
  const avoids: string[] = []
  
  // Based on affordability
  if (signals.affordability === 'Comfortable') {
    suits.push('First-time buyers on tighter budgets')
    suits.push('Households prioritizing monthly cash flow')
  }
  
  // Based on cashflow
  if (signals.cashflow === 'Strong buy advantage' || signals.cashflow === 'Buy advantage') {
    suits.push('Buyers prioritizing cash flow advantage')
  }
  
  // Based on lease risk
  if (signals.leaseRisk === 'High') {
    suits.push('Households planning shorter holding periods')
    avoids.push('Buyers relying on future resale')
    avoids.push('Buyers sensitive to lease-related financing risk')
  } else {
    suits.push('Buyers planning long-term ownership')
  }
  
  // Based on stability
  if (signals.stability === 'Stable') {
    suits.push('Buyers valuing resale stability')
  } else if (signals.stability === 'Fragile') {
    avoids.push('Buyers needing quick resale flexibility')
  }
  
  // Default if no specific signals
  if (suits.length === 0) {
    suits.push('Buyers with specific preferences')
  }
  
  return { suits, avoids }
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

// Generate decision guidance
function generateDecisionGuidance(
  townA: TownComparisonData,
  townB: TownComparisonData,
  mortgageA: number,
  mortgageB: number
): { chooseA: string; chooseB: string; conclusion: string } {
  const chooseAParts: string[] = []
  const chooseBParts: string[] = []
  
  // Town A advantages
  if (townA.medianPrice < townB.medianPrice) {
    chooseAParts.push('lower upfront cost')
  }
  if (townA.txCount > townB.txCount * 1.2) {
    chooseAParts.push('higher liquidity')
  }
  if (townA.medianLeaseYears < 55 && townB.medianLeaseYears >= 55) {
    chooseAParts.push('comfortable with lease trade-offs')
  }
  
  // Town B advantages
  if (townB.medianLeaseYears > townA.medianLeaseYears + 5) {
    chooseBParts.push('longer remaining leases')
  }
  if (townB.priceVolatility < townA.priceVolatility * 0.8) {
    chooseBParts.push('more stable long-term ownership')
  }
  if (townB.medianPrice > townA.medianPrice) {
    chooseBParts.push('at a slightly higher cost')
  }
  
  return {
    chooseA: chooseAParts.length > 0 
      ? `Choose ${townA.town} if you prioritize ${chooseAParts.join(' and ')}.`
      : `Choose ${townA.town} based on your specific preferences.`,
    chooseB: chooseBParts.length > 0
      ? `Choose ${townB.town} if you value ${chooseBParts.join(' and ')}.`
      : `Choose ${townB.town} based on your specific preferences.`,
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
  const [dataA, setDataA] = useState<TownComparisonData | null>(null)
  const [dataB, setDataB] = useState<TownComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loanYears, setLoanYears] = useState(25)
  const [interestRate, setInterestRate] = useState(2.6)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [resultA, resultB] = await Promise.all([
        getTownComparisonData(townA, flatType),
        getTownComparisonData(townB, flatType),
      ])
      setDataA(resultA)
      setDataB(resultB)
      setLoading(false)
    }
    fetchData()
  }, [townA, townB, flatType])

  const mortgageA = dataA ? calculateMonthlyMortgage(
    dataA.medianPrice * 0.75, // Assume 75% LTV
    loanYears,
    interestRate
  ) : 0

  const mortgageB = dataB ? calculateMonthlyMortgage(
    dataB.medianPrice * 0.75,
    loanYears,
    interestRate
  ) : 0

  // Generate signals from raw data
  const userBudget = 500000 // Default, could be from props or context
  const signalsA = dataA ? generateSignals(dataA, userBudget, mortgageA) : null
  const signalsB = dataB ? generateSignals(dataB, userBudget, mortgageB) : null
  
  // Generate content from signals
  const summaryBullets = signalsA && signalsB && dataA && dataB 
    ? generateSummaryFromSignals(townA, townB, signalsA, signalsB) 
    : []
  const suitabilityA = signalsA ? generateSuitability(signalsA, townA) : null
  const suitabilityB = signalsB ? generateSuitability(signalsB, townB) : null
  const decisionHints = signalsA && signalsB ? generateDecisionHint(signalsA, signalsB) : []
  const decisionVerdict = signalsA && signalsB ? generateDecisionVerdict(signalsA, signalsB) : null
  const guidance = dataA && dataB ? generateDecisionGuidance(dataA, dataB, mortgageA, mortgageB) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Compare Two Towns — What You Gain, What You Trade Off</h1>
          <p className="text-lg text-gray-600">A side-by-side comparison based on resale prices, rent, lease profile, and long-term risks.</p>
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

        {/* Auto-generated Summary */}
        {summaryBullets.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <ul className="space-y-2 mb-4">
              {summaryBullets.map((bullet, index) => (
                <li key={index} className="text-base text-gray-800 flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-blue-200 space-y-2">
              <p className="text-base text-gray-800 font-medium">
                Both towns are within your budget.
              </p>
              {(suitabilityA || suitabilityB) && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Best for:</p>
                    <div className="space-y-1">
                      {suitabilityA && suitabilityA.suits.map((suit, idx) => (
                        <p key={idx} className="text-sm text-gray-800 flex items-start">
                          <span className="text-green-600 mr-2">✔</span>
                          <span><span className="font-medium">{townA}:</span> {suit}</span>
                        </p>
                      ))}
                      {suitabilityB && suitabilityB.suits.map((suit, idx) => (
                        <p key={idx} className="text-sm text-gray-800 flex items-start">
                          <span className="text-green-600 mr-2">✔</span>
                          <span><span className="font-medium">{townB}:</span> {suit}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  {(suitabilityA?.avoids.length || suitabilityB?.avoids.length) > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Be cautious if:</p>
                      <div className="space-y-1">
                        {suitabilityA && suitabilityA.avoids.map((avoid, idx) => (
                          <p key={idx} className="text-sm text-gray-800 flex items-start">
                            <span className="text-amber-600 mr-2">⚠</span>
                            <span><span className="font-medium">{townA}:</span> {avoid}</span>
                          </p>
                        ))}
                        {suitabilityB && suitabilityB.avoids.map((avoid, idx) => (
                          <p key={idx} className="text-sm text-gray-800 flex items-start">
                            <span className="text-amber-600 mr-2">⚠</span>
                            <span><span className="font-medium">{townB}:</span> {avoid}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {decisionHints.length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-xs font-semibold text-gray-700 mb-2">Decision Hint:</p>
                {decisionHints.map((hint, index) => (
                  <p key={index} className="text-xs text-gray-600 mb-1">{hint}</p>
                ))}
              </div>
            )}
            {decisionVerdict && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">🧭 Decision Lens:</p>
                <p className="text-sm text-gray-800">
                  This comparison highlights a trade-off between affordability and long-term lease security.
                </p>
                <p className="text-xs text-gray-600 mt-2 italic">{decisionVerdict}</p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading comparison data...</p>
            </div>
          </div>
        ) : dataA && dataB ? (
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
                      <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(dataA.medianPrice)}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(dataB.medianPrice)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Estimated monthly mortgage</td>
                      <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(mortgageA)}</td>
                      <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(mortgageB)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Median rent (same flat)</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataA.medianRent ? formatCurrency(dataA.medianRent) : <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataB.medianRent ? formatCurrency(dataB.medianRent) : <span className="text-gray-400">N/A</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Rent vs Buy gap</td>
                      <td className="py-4 px-4 text-right">
                        {dataA.medianRent ? (
                          <span className={`font-semibold ${dataA.medianRent > mortgageA ? 'text-green-600' : 'text-red-600'}`}>
                            {dataA.medianRent > mortgageA ? '+' : ''}{formatCurrency(dataA.medianRent - mortgageA)}
                          </span>
                        ) : <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {dataB.medianRent ? (
                          <span className={`font-semibold ${dataB.medianRent > mortgageB ? 'text-green-600' : 'text-red-600'}`}>
                            {dataB.medianRent > mortgageB ? '+' : ''}{formatCurrency(dataB.medianRent - mortgageB)}
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
              {dataA.medianRent && dataB.medianRent && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {dataA.medianRent - mortgageA > dataB.medianRent - mortgageB ? (
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
                        <span className="font-semibold">{Math.round(dataA.medianLeaseYears)} yrs</span>
                        {dataA.medianLeaseYears < 55 && <span className="ml-2 text-amber-600">⚠️</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        <span className="font-semibold">{Math.round(dataB.medianLeaseYears)} yrs</span>
                        {dataB.medianLeaseYears < 55 && <span className="ml-2 text-amber-600">⚠️</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">% of transactions &lt; 55 yrs</td>
                      <td className="py-4 px-4 text-right text-gray-800">{dataA.pctBelow55Years.toFixed(0)}%</td>
                      <td className="py-4 px-4 text-right text-gray-800">{dataB.pctBelow55Years.toFixed(0)}%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Price per sqm trend</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataA.medianLeaseYears < 60 ? <span className="text-amber-600 font-medium">Early discount</span> : <span className="text-green-600 font-medium">Stable</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataB.medianLeaseYears < 60 ? <span className="text-amber-600 font-medium">Early discount</span> : <span className="text-green-600 font-medium">Stable</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
                {dataA.medianLeaseYears < dataB.medianLeaseYears - 5 ? (
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

            {/* Module C: Market Stability */}
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
                        {dataA.txCount > dataB.txCount * 1.2 ? <span className="font-semibold text-green-600">High</span> : dataA.txCount < dataB.txCount * 0.8 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold">Moderate</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataB.txCount > dataA.txCount * 1.2 ? <span className="font-semibold text-green-600">High</span> : dataB.txCount < dataA.txCount * 0.8 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold">Moderate</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Price volatility (12m)</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataA.priceVolatility > dataB.priceVolatility * 1.2 ? <span className="font-semibold text-amber-600">Higher</span> : <span className="font-semibold text-green-600">Lower</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataB.priceVolatility > dataA.priceVolatility * 1.2 ? <span className="font-semibold text-amber-600">Higher</span> : <span className="font-semibold text-green-600">Lower</span>}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700 font-medium">Liquidity risk</td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataA.txCount < 50 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold text-green-600">Low</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-800">
                        {dataB.txCount < 50 ? <span className="font-semibold text-amber-600">Moderate</span> : <span className="font-semibold text-green-600">Low</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {(dataA.txCount < 50 || dataB.txCount < 50) && (
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

