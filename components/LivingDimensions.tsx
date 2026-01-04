import React from 'react'
import type { LivingNotes, LivingRating } from '@/lib/neighbourhood-living-notes'

function ratingMeta(rating: LivingRating): { label: string; className: string } {
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
  return {
    label: 'Mixed',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  }
}

function Row({
  label,
  rating,
  note,
}: {
  label: string
  rating: LivingRating
  note: string
}) {
  const meta = ratingMeta(rating)
  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-100 rounded-md">
      <div className="flex items-center gap-2">
        <span
          className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-semibold ${meta.className}`}
        >
          {meta.label}
        </span>
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
}: {
  notes: LivingNotes
  className?: string
  variant?: 'compressed' | 'expanded'
}) {
  // Count ratings for compressed view
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
    const total = 5
    let summary = ''
    
    // Determine primary rating and show in natural language
    if (goodCount >= 4) {
      summary = `Mostly good (${goodCount}/${total})`
    } else if (goodCount === 3 && mixedCount === 2) {
      summary = `Mostly good (${goodCount}/${total})`
    } else if (goodCount >= 3) {
      summary = `Mostly good (${goodCount}/${total})`
    } else if (mixedCount >= 3) {
      summary = `Mixed (${mixedCount}/${total})`
    } else if (badCount >= 3) {
      summary = `Mostly challenging (${badCount}/${total})`
    } else if (goodCount === 2) {
      summary = `Mixed (${goodCount}/${total} good)`
    } else {
      summary = `Mixed (${goodCount} good, ${mixedCount} mixed, ${badCount} challenging)`
    }
    
    return (
      <div className={className}>
        <div className="rounded-md border border-gray-200 bg-gray-50/60 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-gray-700 tracking-wide">
              Living check:
            </span>
            <span className="text-xs text-gray-600">
              {summary}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Expanded variant for detail page
  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Living check</h3>
          <p className="text-xs text-gray-500">5 dimensions of daily living quality</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Noise & density" rating={notes.noiseDensity.rating} note={notes.noiseDensity.note} />
          <Row label="Daily convenience" rating={notes.dailyConvenience.rating} note={notes.dailyConvenience.note} />
          <Row label="Green & outdoors" rating={notes.greenOutdoor.rating} note={notes.greenOutdoor.note} />
          <Row label="Crowd & vibe" rating={notes.crowdVibe.rating} note={notes.crowdVibe.note} />
          <Row label="Long-term comfort" rating={notes.longTermComfort.rating} note={notes.longTermComfort.note} />
        </div>
      </div>
    </div>
  )
}


