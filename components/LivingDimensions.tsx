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
    <div className="flex gap-2 text-xs leading-snug">
      <span
        className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${meta.className}`}
      >
        {meta.label}
      </span>
      <div className="min-w-0">
        <span className="font-semibold text-gray-900">{label}: </span>
        <span className="text-gray-700">{note}</span>
      </div>
    </div>
  )
}

export default function LivingDimensions({
  notes,
  className,
}: {
  notes: LivingNotes
  className?: string
}) {
  return (
    <div className={className}>
      <div className="rounded-md border border-gray-200 bg-gray-50/60 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-[11px] font-semibold text-gray-700 tracking-wide">
            Living check (5 dimensions)
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border ${ratingMeta('good').className}`}>Good</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border ${ratingMeta('mixed').className}`}>Mixed</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full border ${ratingMeta('bad').className}`}>Bad</span>
          </div>
        </div>
        <div className="space-y-1.5">
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


