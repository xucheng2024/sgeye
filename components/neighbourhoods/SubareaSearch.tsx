/**
 * Subarea (Planning Area) Search Component
 * Allows users to search for planning areas by:
 * - Name (planning area name)
 * - Postal code (uses OneMap API to geocode, then finds subarea)
 * - Street name (finds subarea from HDB transaction data)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { PlanningArea } from '@/lib/types/neighbourhood'

interface SubareaSearchProps {
  planningAreas: PlanningArea[]
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
  selectedSubzones: Set<string>
  onSubzonesChange: (subzones: Set<string>) => void
}

interface SubzoneResult {
  id: string
  name: string
  planning_area_id: string
  region: string
}

// Detect if query is a postal code (6 digits)
function isPostalCode(query: string): boolean {
  return /^\d{6}$/.test(query.trim().replace(/\s+/g, ''))
}

// Detect if query looks like a street name (contains letters, not just numbers)
function isStreetName(query: string): boolean {
  const trimmed = query.trim()
  return trimmed.length > 2 && /[a-zA-Z]/.test(trimmed) && !isPostalCode(trimmed)
}

export function SubareaSearch({ 
  planningAreas, 
  selectedPlanningAreas, 
  onPlanningAreasChange,
  selectedSubzones,
  onSubzonesChange
}: SubareaSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAreas, setFilteredAreas] = useState<PlanningArea[]>([])
  const [subzoneResult, setSubzoneResult] = useState<SubzoneResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter planning areas by name (for name-based search)
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredAreas([])
      setSubzoneResult(null)
      setShowResults(false)
      setSearchError(null)
      return
    }

    const query = searchQuery.trim()
    
    // If it's a postal code or street name, don't show name-based results
    if (isPostalCode(query) || isStreetName(query)) {
      setFilteredAreas([])
      return
    }

    // Name-based search
    const queryLower = query.toLowerCase()
    const filtered = planningAreas.filter(pa => 
      pa.name.toLowerCase().includes(queryLower)
    ).slice(0, 10) // Limit to 10 results

    setFilteredAreas(filtered)
    setShowResults(filtered.length > 0)
  }, [searchQuery, planningAreas])

  // Search for subzone by postal code or street name
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    const query = searchQuery.trim()
    if (query.length === 0) {
      setSubzoneResult(null)
      setSearchError(null)
      return
    }

    // Only search if it's a postal code or street name
    if (!isPostalCode(query) && !isStreetName(query)) {
      setSubzoneResult(null)
      setSearchError(null)
      return
    }

    // Debounce the search
    setIsSearching(true)
    setSearchError(null)
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const type = isPostalCode(query) ? 'postal' : 'street'
        const response = await fetch('/api/subzones/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, query }),
        })

        const data = await response.json()

        if (!response.ok) {
          setSearchError(data.error || 'Search failed')
          setSubzoneResult(null)
          setShowResults(false)
          return
        }

        if (data.subzone) {
          setSubzoneResult(data.subzone)
          setShowResults(true)
        } else {
          setSubzoneResult(null)
          setSearchError('No subarea found')
          setShowResults(false)
        }
      } catch (error) {
        console.error('Error searching subzone:', error)
        setSearchError('Search failed. Please try again.')
        setSubzoneResult(null)
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

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
    // Keep search query visible, just close dropdown
    setShowResults(false)
    setSubzoneResult(null)
    setSearchError(null)
  }

  const handleSelectSubzone = () => {
    if (!subzoneResult) return
    
    // Add subzone to selected subzones (not planning area)
    const newSet = new Set(selectedSubzones)
    newSet.add(subzoneResult.id)
    onSubzonesChange(newSet)
    // Keep search query visible, just close dropdown
    setShowResults(false)
    setSearchError(null)
  }

  const handleClear = () => {
    // Clear search query
    setSearchQuery('')
    setFilteredAreas([])
    setSubzoneResult(null)
    setShowResults(false)
    setSearchError(null)
    // Clear subzone filter to restore previous display
    onSubzonesChange(new Set())
  }

  const getPlaceholder = () => {
    // Only show dynamic placeholder when there's no input
    if (searchQuery.trim().length === 0) {
      return 'Search subarea, postal code, or street name...'
    }
    // When user is typing, show static placeholder
    return 'Search subarea, postal code, or street name...'
  }

  const hasResults = filteredAreas.length > 0 || subzoneResult !== null
  const showDropdown = showResults && (hasResults || searchError || isSearching)
  
  // Show clear button if there's a search query or selected subzones
  const showClearButton = searchQuery.length > 0 || selectedSubzones.size > 0

  return (
    <div className="relative flex-1 min-w-[200px] max-w-[400px]" ref={containerRef}>
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
          }}
          onFocus={() => {
            if (hasResults) {
              setShowResults(true)
            }
          }}
          placeholder={getPlaceholder()}
          className="w-full pl-8 pr-8 py-1.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
        {isSearching && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {showClearButton && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search and restore all results"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-center text-xs text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
              Searching...
            </div>
          ) : searchError ? (
            <div className="p-3 text-center text-xs text-red-600">
              {searchError}
            </div>
          ) : subzoneResult ? (
            <div className="py-1">
              <button
                onClick={handleSelectSubzone}
                className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                  selectedSubzones.has(subzoneResult.id)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{subzoneResult.name}</div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  Planning Area: {planningAreas.find(pa => pa.id === subzoneResult.planning_area_id)?.name || subzoneResult.planning_area_id}
                </div>
                {selectedSubzones.has(subzoneResult.id) && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            </div>
          ) : filteredAreas.length === 0 ? (
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
