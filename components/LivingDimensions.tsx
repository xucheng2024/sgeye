import React from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
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
  neighbourhoodId,
}: {
  notes: LivingNotes
  className?: string
  variant?: 'compressed' | 'expanded'
  neighbourhoodId?: string
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
    // Calculate star rating: good = 1, mixed = 0, bad = -1
    // If total is negative, show 0 stars
    const totalScore = goodCount - badCount
    const totalStars = Math.max(0, Math.min(5, totalScore))
    const fullStars = Math.floor(totalStars)
    const emptyStars = 5 - fullStars
    
    // Build star display: ⭐️ for full, empty stars not shown
    const stars = '⭐️'.repeat(fullStars)
    
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Living comfort</span>
          <span className="text-base text-gray-700 tracking-tight">{stars}</span>
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
  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Living comfort</h3>
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


