/**
 * Recommendation Card Component
 * Displays the comparison recommendation with confidence badge
 */

'use client'

import { CompareSummary, PreferenceLens } from '@/lib/hdb-data'
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface RecommendationCardProps {
  compareSummary: CompareSummary
  preferenceLens: PreferenceLens
  holdingPeriod: 'short' | 'medium' | 'long'
  townA: string
  townB: string
  evidenceOpen: boolean
  onToggleEvidence: () => void
  familyProfileType?: 'long_term' | 'budget_first' | 'education_sensitive' | 'balanced'
  onFamilyProfileChange?: () => void
}

export default function RecommendationCard({
  compareSummary,
  preferenceLens,
  holdingPeriod,
  townA,
  townB,
  evidenceOpen,
  onToggleEvidence,
  familyProfileType,
  onFamilyProfileChange,
}: RecommendationCardProps) {
  if (!compareSummary.recommendation) return null

  const getFamilyProfileLabel = () => {
    if (familyProfileType === 'long_term') return 'Long-term family'
    if (familyProfileType === 'budget_first') return 'Budget-first family'
    if (familyProfileType === 'education_sensitive') return 'Education-sensitive family'
    return 'Balanced family'
  }

  // Parse trade-off to determine direction and color
  const parseTradeoff = (tradeoff: string) => {
    const lowerText = tradeoff.toLowerCase()
    let icon = '💰'
    let direction: 'up' | 'down' | 'neutral' = 'neutral'
    let color = 'text-gray-600'
    
    if (tradeoff.includes('Entry cost')) {
      icon = '💰'
      if (lowerText.includes('lower') || lowerText.includes('cheaper')) {
        direction = 'down'
        color = 'text-green-600'
      } else if (lowerText.includes('higher') || lowerText.includes('more expensive')) {
        direction = 'up'
        color = 'text-orange-600'
      } else {
        direction = 'neutral'
        color = 'text-gray-600'
      }
    } else if (tradeoff.includes('Lease')) {
      icon = '🧱'
      if (lowerText.includes('more') || lowerText.includes('healthier')) {
        direction = 'up'
        color = 'text-green-600'
      } else if (lowerText.includes('less') || lowerText.includes('shorter')) {
        direction = 'down'
        color = 'text-orange-600'
      } else {
        direction = 'neutral'
        color = 'text-gray-600'
      }
    } else if (tradeoff.includes('School')) {
      icon = '🎓'
      if (lowerText.includes('decreases') || lowerText.includes('lower')) {
        direction = 'down'
        color = 'text-green-600'
      } else if (lowerText.includes('increases') || lowerText.includes('higher')) {
        direction = 'up'
        color = 'text-orange-600'
      } else {
        direction = 'neutral'
        color = 'text-gray-600'
      }
    }
    
    return { icon, direction, color }
  }

  return (
    <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 p-8 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recommendation</h3>
          {familyProfileType && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">Recommendation based on:</span>
              <span className="text-xs font-medium text-gray-700">{getFamilyProfileLabel()}</span>
              {onFamilyProfileChange && (
                <button
                  onClick={onFamilyProfileChange}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Change
                </button>
              )}
            </div>
          )}
        </div>
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

      {/* Decision Layer (Default Expanded) - For 80% of users */}
      <div className="space-y-6">
        {/* 1. Recommendation (极简) */}
        <div className="p-6 bg-white rounded-xl border-2 border-blue-300">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {compareSummary.recommendation.headline}
          </p>
        </div>

        {/* 2. Key trade-offs (最多4条，人话格式) */}
        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4">Key trade-offs:</p>
          <ul className="space-y-3">
            {compareSummary.recommendation.tradeoffs.slice(0, 4).map((tradeoff, idx) => {
              // Extract emoji and text (tradeoffs now include emojis at the start)
              let emoji = '•'
              let text = tradeoff
              
              // Check if tradeoff starts with known emojis
              if (tradeoff.startsWith('🎓')) {
                emoji = '🎓'
                text = tradeoff.replace(/^🎓\s*/, '')
              } else if (tradeoff.startsWith('🚗')) {
                emoji = '🚗'
                text = tradeoff.replace(/^🚗\s*/, '')
              } else if (tradeoff.startsWith('💰')) {
                emoji = '💰'
                text = tradeoff.replace(/^💰\s*/, '')
              } else if (tradeoff.startsWith('🧱')) {
                emoji = '🧱'
                text = tradeoff.replace(/^🧱\s*/, '')
              }
              
              return (
                <li key={idx} className="text-sm text-gray-800 flex items-start gap-3">
                  <span className="text-lg mt-0.5">{emoji}</span>
                  <span className="flex-1 leading-relaxed">{text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* 3. One-line decision hint (必须，放在Recommendation下) */}
        {compareSummary.decisionHint && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              <strong>Decision hint:</strong> {compareSummary.decisionHint}
            </p>
          </div>
        )}
      </div>

      {/* Why we reached this conclusion button (第二层：Evidence Layer) */}
      <button
        onClick={onToggleEvidence}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-6 pt-6 border-t border-gray-200"
      >
        {evidenceOpen ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide evidence
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Why we reached this conclusion
          </>
        )}
      </button>
    </div>
  )
}

