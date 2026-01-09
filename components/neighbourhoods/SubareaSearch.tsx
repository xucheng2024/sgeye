/**
 * Subarea (Planning Area) Search Component
 * Allows users to search for planning areas by name
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { PlanningArea } from '@/lib/types/neighbourhood'

interface SubareaSearchProps {
  planningAreas: PlanningArea[]
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
}

export function SubareaSearch({ planningAreas, selectedPlanningAreas, onPlanningAreasChange }: SubareaSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAreas, setFilteredAreas] = useState<PlanningArea[]>([])
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter planning areas based on search query
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredAreas([])
      setShowResults(false)
      return
    }

    const query = searchQuery.trim().toLowerCase()
    const filtered = planningAreas.filter(pa => 
      pa.name.toLowerCase().includes(query)
    ).slice(0, 10) // Limit to 10 results

    setFilteredAreas(filtered)
    setShowResults(filtered.length > 0)
  }, [searchQuery, planningAreas])

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectPlanningArea = (planningAreaId: string) => {
    const newSet = new Set(selectedPlanningAreas)
    newSet.add(planningAreaId)
    onPlanningAreasChange(newSet)
    setSearchQuery('')
    setShowResults(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setFilteredAreas([])
    setShowResults(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (filteredAreas.length > 0) {
              setShowResults(true)
            }
          }}
          placeholder="Search subarea..."
          className="w-full min-w-[200px] pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {filteredAreas.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-500">
              No results found
            </div>
          ) : (
            <div className="py-1">
              {filteredAreas.map((pa) => {
                const isSelected = selectedPlanningAreas.has(pa.id)
                return (
                  <button
                    key={pa.id}
                    onClick={() => handleSelectPlanningArea(pa.id)}
                    className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {pa.name}
                    {isSelected && <span className="ml-2 text-blue-600">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
