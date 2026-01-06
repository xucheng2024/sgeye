import React from 'react'
import { ChevronRight, Info } from 'lucide-react'
import Link from 'next/link'
import type { LivingNotes, LivingRating, VarianceLevel } from '@/lib/neighbourhood-living-notes'

function ratingMeta(rating: LivingRating): { label: string; className: string } | null {
  if (rating === 'good') {
    return {
      label: 'Good',
      className: 'border-green-200 bg-green-50 text-green-800',
    }
  }
  if (rating === 'bad') {
    return {
      label: 'Bad',
      className: 'border-red-200 bg-red-50 text-red-800',
    }
  }
  if (rating === 'mixed') {
    return {
      label: 'Mixed',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
    }
  }
  return null
}

function Row({
  label,
  rating,
  note,
  showRating = true,
}: {
  label: string
  rating: LivingRating
  note: string
  showRating?: boolean
}) {
  const meta = showRating ? ratingMeta(rating) : null
  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-100 rounded-md">
      <div className="flex items-center gap-2">
        {meta && (
          <span
            className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-semibold ${meta.className}`}
          >
            {meta.label}
          </span>
        )}
        <div className="text-sm font-semibold text-gray-900">{label}</div>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">{note}</div>
    </div>
  )
}

export default function LivingDimensions({
  notes,
  className,
  variant = 'expanded',
  neighbourhoodId,
}: {
  notes: LivingNotes
  className?: string
  variant?: 'compressed' | 'expanded'
  neighbourhoodId?: string
}) {
  const ratingMode = notes.ratingMode || 'residential_scored'
  const zoneType = notes.zoneType
  const isScored = ratingMode === 'residential_scored'

  // Count ratings for compressed view (only for scored areas)
  const ratings = [
    notes.noiseDensity.rating,
    notes.dailyConvenience.rating,
    notes.greenOutdoor.rating,
    notes.crowdVibe.rating,
    notes.longTermComfort.rating,
  ]
  const goodCount = ratings.filter(r => r === 'good').length
  const mixedCount = ratings.filter(r => r === 'mixed').length
  const badCount = ratings.filter(r => r === 'bad').length

  // Compressed variant for list page
  if (variant === 'compressed') {
    // For non-scored areas (industrial, nature, offshore, etc.)
    if (!isScored) {
      const zoneTypeLabels: Record<string, string> = {
        industrial: 'Industrial zone',
        nature: 'Nature reserve',
        offshore: 'Offshore area',
        business_park: 'Business park',
        city_core: 'Downtown lifestyle',
      }
      const label = zoneTypeLabels[zoneType || ''] || 'Not residential-first area'
      
      return (
        <div className={className}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Living comfort</span>
            <span className="text-sm font-medium text-gray-500">{label}</span>
            {neighbourhoodId && (
              <Link
                href={`/neighbourhood/${neighbourhoodId}`}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
                title="View details"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )
    }

    // For scored areas (residential, city_fringe)
    // Calculate total score: good = 1, mixed = 0, bad = -1
    const totalScore = goodCount - badCount
    
    // Map score to user-friendly label with color
    let label = ''
    let labelColor = ''
    if (totalScore >= 3) {
      label = 'Comfortable'
      labelColor = 'text-green-600'
    } else if (totalScore >= 1) {
      label = 'Balanced'
      labelColor = 'text-blue-600'
    } else if (totalScore >= -1) {
      label = 'Trade-offs'
      labelColor = 'text-amber-600'
    } else {
      label = 'Niche fit'
      labelColor = 'text-red-600'
    }
    
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Living comfort</span>
          {neighbourhoodId ? (
            <Link
              href={`/neighbourhood/${neighbourhoodId}`}
              className={`text-sm font-medium ${labelColor} hover:underline transition-colors`}
            >
              {label}
            </Link>
          ) : (
            <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
          )}
          {neighbourhoodId && (
            <Link
              href={`/neighbourhood/${neighbourhoodId}`}
              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
              title="View details"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Expanded variant for detail page
  // For non-scored areas
  if (!isScored) {
    const zoneTypeLabels: Record<string, { label: string; description: string }> = {
      industrial: {
        label: 'Industrial zone',
        description: 'Primarily an industrial/logistics zone. Not designed for residential routines.',
      },
      nature: {
        label: 'Nature reserve',
        description: 'This zone is primarily non-residential (nature reserve). We don\'t score Living Comfort here.',
      },
      offshore: {
        label: 'Offshore area',
        description: 'This zone is primarily non-residential (offshore). We don\'t score Living Comfort here.',
      },
      business_park: {
        label: 'Business park',
        description: 'Primarily a business park area. Not designed for residential routines.',
      },
      city_core: {
        label: 'Downtown lifestyle',
        description: 'CBD core area with commute-first living. High churn, renter-heavy, nightlife/construction cycles.',
      },
    }
    const zoneInfo = zoneTypeLabels[zoneType || ''] || {
      label: 'Not a residential neighbourhood',
      description: 'This zone is primarily non-residential. We don\'t score Living Comfort here.',
    }

    return (
      <div className={className}>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{zoneInfo.label}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{notes.shortNote || zoneInfo.description}</p>
            {notes.drivers && notes.drivers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {notes.drivers.map((driver, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {driver}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Helper function to get variance badge styling and text
  const getVarianceMeta = (level: VarianceLevel | undefined) => {
    if (!level) return null
    
    const meta = {
      'compact': {
        label: 'Consistent',
        badgeColor: 'bg-green-50 border-green-200 text-green-700',
        tooltip: 'Living quality is fairly consistent across all blocks in this neighbourhood.',
      },
      'moderate': {
        label: 'Moderate',
        badgeColor: 'bg-blue-50 border-blue-200 text-blue-700',
        tooltip: 'Some blocks are quieter or better positioned than others. Block orientation matters.',
      },
      'spread_out': {
        label: 'High variation',
        badgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
        tooltip: 'Blocks vary significantly—some near expressways, others quieter. Research the specific block carefully.',
      },
    }
    
    return meta[level]
  }

  const varianceMeta = getVarianceMeta(notes.varianceLevel)

  // For scored areas (residential, city_fringe)
  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">Living comfort</h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="font-semibold mb-2">How to read Living Comfort</div>
                  <div className="space-y-1.5">
                    <div><span className="font-medium">Good</span> — Works well for most households with minimal trade-offs.</div>
                    <div><span className="font-medium">Mixed</span> — Clear trade-offs exist. Comfort varies significantly by block location, road exposure, or lifestyle preferences.</div>
                    <div><span className="font-medium">Bad</span> — Structural factors make comfortable long-term residential living difficult for most households.</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Variance Level Badge */}
            {varianceMeta && (
              <div className="relative group">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${varianceMeta.badgeColor}`}>
                  <span className="text-[10px] text-gray-500">Block variation:</span>
                  <span>{varianceMeta.label}</span>
                </div>
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="font-semibold mb-1.5">Why this matters</div>
                  <div>{varianceMeta.tooltip}</div>
                  <div className="mt-2 pt-2 border-t border-white/20 text-[11px] text-gray-300">
                    Don't just look at neighbourhood name—the specific block is crucial.
                  </div>
                </div>
              </div>
            )}
          </div>
          {notes.shortNote && (
            <p className="text-sm text-gray-600 mt-2">{notes.shortNote}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Noise & density" rating={notes.noiseDensity.rating} note={notes.noiseDensity.note} showRating={isScored} />
          <Row label="Daily convenience" rating={notes.dailyConvenience.rating} note={notes.dailyConvenience.note} showRating={isScored} />
          <Row label="Green & outdoors" rating={notes.greenOutdoor.rating} note={notes.greenOutdoor.note} showRating={isScored} />
          <Row label="Crowd & vibe" rating={notes.crowdVibe.rating} note={notes.crowdVibe.note} showRating={isScored} />
          <Row label="Long-term comfort" rating={notes.longTermComfort.rating} note={notes.longTermComfort.note} showRating={isScored} />
        </div>
      </div>
    </div>
  )
}


