/**
 * Decision Profile Display Component
 * Shows user's inferred decision profile based on behavior
 */

'use client'

import { useState, useEffect } from 'react'
import { calculateDecisionProfile, getProfileDisplay, type DecisionProfileType } from '@/lib/decision-profile'
import { Info } from 'lucide-react'

interface DecisionProfileDisplayProps {
  variant?: 'compare' | 'explore' | 'detail'
  className?: string
}

export default function DecisionProfileDisplay({ variant = 'compare', className = '' }: DecisionProfileDisplayProps) {
  const [profile, setProfile] = useState<{ type: DecisionProfileType; score: number; reason: string } | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const calculated = calculateDecisionProfile()
    setProfile(calculated)
  }, [])

  if (!profile) return null

  const display = getProfileDisplay(profile.type)

  // Variant-specific rendering
  if (variant === 'compare') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{display.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-900">Your decision profile</h3>
            </div>
            <p className="text-base font-medium text-gray-900 mb-2">
              {display.name}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              {display.description}
            </p>
            {profile.reason && (
              <p className="text-xs text-gray-600 italic mt-2">
                {profile.reason}
              </p>
            )}
          </div>
          <div className="relative group ml-4">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="font-semibold mb-2">What is a decision profile?</p>
              <p className="mb-2 text-gray-300">
                Based on your browsing patterns, we've inferred your decision priorities.
                This helps show you insights relevant to families like yours.
              </p>
              <p className="text-gray-400 italic">
                Your profile updates as you explore the site.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'explore') {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{display.emoji}</span>
            <div>
              <span className="text-sm text-gray-600">Viewing neighbourhoods as: </span>
              <span className="text-sm font-semibold text-gray-900">{display.name}</span>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showDetails ? 'Less' : 'Why this?'}
          </button>
        </div>
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-700 mb-2">{display.description}</p>
            {profile.reason && (
              <p className="text-xs text-gray-600 italic">{profile.reason}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // detail variant - return null to hide this component on detail page
  return null
}

