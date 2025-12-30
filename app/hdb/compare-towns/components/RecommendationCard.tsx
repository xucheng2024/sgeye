/**
 * Recommendation Card Component
 * Displays the comparison recommendation with confidence badge
 */

'use client'

import { CompareSummary, PreferenceLens } from '@/lib/hdb-data'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
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
            <p className="text-sm font-semibold text-gray-700 mb-2">Key trade-offs:</p>
            <ul className="space-y-1.5">
              {compareSummary.recommendation.tradeoffs.map((tradeoff, idx) => (
                <li key={idx} className="text-sm text-gray-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{tradeoff}</span>
                </li>
              ))}
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

        {/* Decision Hint */}
        {compareSummary.decisionHint && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800">
              {compareSummary.decisionHint}
            </p>
          </div>
        )}

        {/* Completion message */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            This comparison helps you narrow down locations — not choose a specific flat.
            <br />
            Use it to decide where to focus your search next.
          </p>
        </div>
      </div>

      {/* See the evidence button */}
      <button
        onClick={onToggleEvidence}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
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
  )
}

