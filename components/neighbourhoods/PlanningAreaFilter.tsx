/**
 * Planning Area Filter Component
 */

import { useState } from 'react'
import Link from 'next/link'
import { Info, ChevronDown, ArrowRight } from 'lucide-react'
import { PlanningArea } from '@/lib/types/neighbourhood'
import { toTitleCase } from '@/lib/utils/neighbourhood-utils'

interface PlanningAreaFilterProps {
  planningAreas: PlanningArea[]
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
}

export function PlanningAreaFilter({ 
  planningAreas, 
  selectedPlanningAreas, 
  onPlanningAreasChange 
}: PlanningAreaFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <label className="block text-xs font-semibold text-gray-700">
          Planning Area
        </label>
        <div className="relative group">
          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p className="mb-2">Why planning area?</p>
            <p className="mb-2 text-gray-300">Primary school competition is evaluated at the planning area level.</p>
            <Link
              href="/family/psle-school"
              className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              View school pressure by area
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        {selectedPlanningAreas.size > 0 && (
          <button
            onClick={() => onPlanningAreasChange(new Set())}
            className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear ({selectedPlanningAreas.size})
          </button>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 text-left"
      >
        <span className="text-xs text-gray-700">
          {selectedPlanningAreas.size === 0 
            ? 'All Planning Areas' 
            : selectedPlanningAreas.size === 1
              ? planningAreas.find(pa => selectedPlanningAreas.has(pa.id))?.name 
                  ? toTitleCase(planningAreas.find(pa => selectedPlanningAreas.has(pa.id))!.name)
                  : '1 selected'
              : `${selectedPlanningAreas.size} selected`
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="mt-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
          {planningAreas.length === 0 ? (
            <div className="text-xs text-gray-500 py-1">Loading...</div>
          ) : (
            <div className="space-y-1">
              {planningAreas.map(pa => {
                const isSelected = selectedPlanningAreas.has(pa.id)
                return (
                  <label
                    key={pa.id}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSet = new Set(selectedPlanningAreas)
                        if (e.target.checked) {
                          newSet.add(pa.id)
                        } else {
                          newSet.delete(pa.id)
                        }
                        onPlanningAreasChange(newSet)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{toTitleCase(pa.name)}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

