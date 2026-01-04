/**
 * Living Fit Compare Component
 * Structured comparison view for compare page
 * Shows 5 dimensions in a table format with visual indicators (✅ ◯ ❌)
 */

'use client'

import { useState } from 'react'
import type { LivingNotes, LivingRating } from '@/lib/neighbourhood-living-notes'
import { getLivingNotesForNeighbourhood } from '@/lib/neighbourhood-living-notes'

interface LivingFitCompareProps {
  neighbourhoods: Array<{ id: string; name: string }>
  className?: string
}

function getRatingIcon(rating: LivingRating): string {
  if (rating === 'good') return '✅'
  if (rating === 'bad') return '❌'
  return '◯'
}

function getRatingColor(rating: LivingRating): string {
  if (rating === 'good') return 'text-green-600'
  if (rating === 'bad') return 'text-red-600'
  return 'text-gray-400'
}

export default function LivingFitCompare({ neighbourhoods, className = '' }: LivingFitCompareProps) {
  const [expandedCell, setExpandedCell] = useState<{ row: string; col: number } | null>(null)
  
  const livingNotesArray = neighbourhoods.map(n => getLivingNotesForNeighbourhood(n.name))
  
  // Only show if at least one neighbourhood has living notes
  if (livingNotesArray.every(notes => notes === null)) {
    return null
  }

  const dimensions = [
    { key: 'noiseDensity' as const, label: 'Noise & density' },
    { key: 'dailyConvenience' as const, label: 'Daily convenience' },
    { key: 'greenOutdoor' as const, label: 'Green & outdoors' },
    { key: 'crowdVibe' as const, label: 'Crowd & vibe' },
    { key: 'longTermComfort' as const, label: 'Long-term comfort' },
  ]

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Living fit (5 dimensions)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900"></th>
              {neighbourhoods.map((n, idx) => (
                <th key={n.id} className="text-center py-3 px-4 text-sm font-semibold text-gray-900 min-w-[140px]">
                  {n.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim) => (
              <tr key={dim.key} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-gray-900 align-top">{dim.label}</td>
                {livingNotesArray.map((notes, colIdx) => {
                  if (!notes) {
                    return (
                      <td key={colIdx} className="py-4 px-4 text-center">
                        <span className="text-gray-400">—</span>
                      </td>
                    )
                  }
                  
                  const dimension = notes[dim.key]
                  const rating = dimension.rating
                  const note = dimension.note
                  const isExpanded = expandedCell?.row === dim.key && expandedCell?.col === colIdx
                  
                  return (
                    <td key={colIdx} className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedCell(null)
                            } else {
                              setExpandedCell({ row: dim.key, col: colIdx })
                            }
                          }}
                          className={`text-2xl cursor-pointer hover:scale-110 transition-transform ${getRatingColor(rating)}`}
                          title={`Click to ${isExpanded ? 'hide' : 'view'} explanation`}
                        >
                          {getRatingIcon(rating)}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 text-left max-w-xs border border-gray-200 shadow-sm animate-in fade-in duration-200">
                            {note}
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

