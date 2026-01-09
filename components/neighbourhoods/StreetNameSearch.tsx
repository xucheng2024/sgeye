/**
 * Street Name Search Component
 * Allows users to search by street name to find the associated planning area (subarea)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface StreetSearchResult {
  street_name: string
  planning_areas: { id: string; name: string }[]
}

interface StreetNameSearchProps {
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
}

export function StreetNameSearch({ selectedPlanningAreas, onPlanningAreasChange }: StreetNameSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<StreetSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Search with debounce
  useEffect(() => {
    console.log('Street search: Query changed', searchQuery, 'Length:', searchQuery.length)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 2) {
      console.log('Street search: Query too short, clearing results')
      setResults([])
      setIsSearching(false)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = `/api/street-search?q=${encodeURIComponent(searchQuery)}`
        console.log('Street search: Fetching from', url)
        
        const response = await fetch(url)
        console.log('Street search: Response status', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Street search: API error', response.status, errorText)
          setResults([])
          setIsSearching(false)
          return
        }
        
        const data = await response.json()
        console.log('Street search: Received data', data)
        console.log('Street search: Results count', data.results?.length || 0)
        
        setResults(data.results || [])
        setShowResults(true)
      } catch (error) {
        console.error('Street search: Fetch error', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSelectPlanningArea = (planningAreaId: string) => {
    const newSet = new Set(selectedPlanningAreas)
    newSet.add(planningAreaId)
    onPlanningAreasChange(newSet)
    setSearchQuery('')
    setShowResults(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="shrink-0 relative min-w-[200px]" ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        Search by Street
      </label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true)
              }
            }}
            placeholder="Enter street name..."
            className="w-full min-w-[200px] pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.length >= 2) {
                console.log('Street search: Enter pressed, triggering search')
              }
            }}
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
        {showResults && (results.length > 0 || isSearching) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-xs text-gray-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-500">
                No results found
              </div>
            ) : (
              <div className="py-1">
                {results.map((result, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50">
                      {result.street_name}
                    </div>
                    {result.planning_areas.map((pa) => (
                      <button
                        key={pa.id}
                        onClick={() => handleSelectPlanningArea(pa.id)}
                        className="w-full px-5 py-2 text-xs text-left text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        {pa.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
