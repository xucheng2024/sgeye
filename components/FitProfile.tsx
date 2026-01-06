import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { LivingNotes } from '@/lib/neighbourhood-living-notes'

interface FitProfileProps {
  livingNotes: LivingNotes
  hasMRT: boolean
  avgDistanceToMRT: number | null
  mrtAccessType: string | null
  className?: string
}

interface FitItem {
  text: string
  priority: number
}

function generateFitProfile(
  notes: LivingNotes,
  hasTransport: { hasMRT: boolean; distance: number | null; accessType: string | null }
): { goodFit: string[]; thinkTwice: string[] } {
  const goodFit: FitItem[] = []
  const thinkTwice: FitItem[] = []

  const zoneType = notes.zoneType
  const drivers = notes.drivers || []
  const varianceLevel = notes.varianceLevel

  // A. Noise rules
  if (notes.noiseDensity.rating === 'good') {
    goodFit.push({ text: 'Value quieter evenings', priority: 5 })
    goodFit.push({ text: 'Prefer residential streets over nightlife areas', priority: 4 })
  } else if (notes.noiseDensity.rating === 'mixed') {
    goodFit.push({ text: 'Are okay with some traffic activity nearby', priority: 3 })
    thinkTwice.push({ text: 'Are very sensitive to road or ambient noise', priority: 6 })
  } else if (notes.noiseDensity.rating === 'bad') {
    thinkTwice.push({ text: 'Need a consistently quiet home environment', priority: 9 })
    thinkTwice.push({ text: 'Work from home and require low background noise', priority: 8 })
  }

  // B. Convenience rules
  if (notes.dailyConvenience.rating === 'good') {
    goodFit.push({ text: 'Value efficient daily errands', priority: 5 })
    goodFit.push({ text: 'Prefer mature-estate amenities within walking distance', priority: 4 })
  } else if (notes.dailyConvenience.rating === 'mixed') {
    goodFit.push({ text: 'Are comfortable with short trips for some errands', priority: 3 })
    thinkTwice.push({ text: 'Expect everything (mall, MRT, market) downstairs', priority: 5 })
  } else if (notes.dailyConvenience.rating === 'bad') {
    thinkTwice.push({ text: 'Need walkable daily amenities', priority: 8 })
    thinkTwice.push({ text: 'Rely heavily on spontaneous errands', priority: 7 })
  }

  // C. Transport rules (Critical)
  if (!hasTransport.hasMRT || (hasTransport.distance && hasTransport.distance > 800)) {
    thinkTwice.push({ text: 'Need MRT within short walking distance', priority: 10 })
    thinkTwice.push({ text: 'Prefer rail-first daily commuting', priority: 9 })
  }

  // LRT-only areas
  if (hasTransport.accessType === 'medium' && drivers.includes('lrt_only')) {
    thinkTwice.push({ text: 'Want a simple, single-leg commute', priority: 8 })
    thinkTwice.push({ text: 'Are sensitive to daily commute time', priority: 7 })
  }

  // D. Variance level rules
  if (varianceLevel === 'spread_out') {
    thinkTwice.push({ text: 'Prefer uniform living conditions across blocks', priority: 9 })
    thinkTwice.push({ text: 'Are buying without visiting the exact block', priority: 8 })
  } else if (varianceLevel === 'moderate') {
    thinkTwice.push({ text: 'Expect consistent noise and crowd levels across the area', priority: 4 })
  }

  // E. Drivers → Positive signals
  if (drivers.includes('outdoor_access') || drivers.includes('nature_access')) {
    goodFit.push({ text: 'Value parks and regular outdoor time', priority: 6 })
    goodFit.push({ text: 'Enjoy walking, jogging, or cycling routines', priority: 5 })
  }

  if (drivers.includes('amenity_access') || drivers.includes('mature_amenities')) {
    goodFit.push({ text: 'Want mature-estate convenience', priority: 5 })
    goodFit.push({ text: 'Prefer established food and service options', priority: 4 })
  }

  if (drivers.includes('tradeoffs_for_convenience')) {
    goodFit.push({ text: 'Prioritise convenience over absolute quiet', priority: 4 })
    thinkTwice.push({ text: 'Expect both top-tier convenience and quietness', priority: 6 })
  }

  // F. Green & outdoor
  if (notes.greenOutdoor.rating === 'good') {
    goodFit.push({ text: 'Appreciate nearby green spaces', priority: 4 })
  } else if (notes.greenOutdoor.rating === 'bad') {
    thinkTwice.push({ text: 'Need abundant greenery and outdoor access', priority: 5 })
  }

  // G. Crowd & vibe
  if (notes.crowdVibe.rating === 'good') {
    goodFit.push({ text: 'Prefer established, family-oriented communities', priority: 3 })
  } else if (notes.crowdVibe.rating === 'mixed' && zoneType === 'city_fringe') {
    goodFit.push({ text: 'Are comfortable with higher activity levels', priority: 3 })
    thinkTwice.push({ text: 'Prefer quieter, slower-paced surroundings', priority: 5 })
  } else if (notes.crowdVibe.rating === 'bad') {
    thinkTwice.push({ text: 'Expect calm, low-traffic living', priority: 7 })
  }

  // H. Long-term comfort
  if (notes.longTermComfort.rating === 'bad') {
    thinkTwice.push({ text: 'Plan to stay 15+ years without concerns', priority: 6 })
  }

  // Zone-type modifiers
  if (zoneType === 'city_fringe') {
    goodFit.push({ text: 'Want central access without CBD intensity', priority: 7 })
  }

  // Sort by priority (higher first) and take top 3
  const sortedGoodFit = goodFit.sort((a, b) => b.priority - a.priority).slice(0, 3)
  const sortedThinkTwice = thinkTwice.sort((a, b) => b.priority - a.priority).slice(0, 3)

  return {
    goodFit: sortedGoodFit.map(item => item.text),
    thinkTwice: sortedThinkTwice.map(item => item.text),
  }
}

export default function FitProfile({ livingNotes, hasMRT, avgDistanceToMRT, mrtAccessType, className }: FitProfileProps) {
  // Skip for non-residential areas
  const isScored = livingNotes.ratingMode === 'residential_scored'
  if (!isScored) {
    return null
  }

  const { goodFit, thinkTwice } = generateFitProfile(livingNotes, {
    hasMRT: hasMRT,
    distance: avgDistanceToMRT,
    accessType: mrtAccessType,
  })

  // Don't show if we don't have enough data
  if (goodFit.length === 0 && thinkTwice.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Is this neighbourhood right for you?</h3>
        <p className="text-sm text-gray-500 mb-5">Honest fit check based on structural factors</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Good fit column */}
          {goodFit.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">Good fit if you</h4>
              </div>
              <ul className="space-y-2">
                {goodFit.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Think twice column */}
          {thinkTwice.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-semibold text-gray-900">Think twice if you</h4>
              </div>
              <ul className="space-y-2">
                {thinkTwice.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

