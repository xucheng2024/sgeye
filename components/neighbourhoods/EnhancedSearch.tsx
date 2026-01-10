/**
 * Enhanced Search Component
 * Improved UX with keyboard shortcuts, search history, and better visual design
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Loader2, Clock, TrendingUp, MapPin, Home, Building2 } from 'lucide-react'
import { PlanningArea, Neighbourhood } from '@/lib/types/neighbourhood'

interface EnhancedSearchProps {
  planningAreas: PlanningArea[]
  selectedPlanningAreas: Set<string>
  onPlanningAreasChange: (areas: Set<string>) => void
  selectedSubzones: Set<string>
  onSubzonesChange: (subzones: Set<string>) => void
  neighbourhoods?: Neighbourhood[]
  onNeighbourhoodSelect?: (neighbourhoodId: string) => void
}

interface SubzoneResult {
  id: string
  name: string
  planning_area_id: string
  region: string
}

interface SearchHistoryItem {
  query: string
  timestamp: number
  type: 'planning_area' | 'subzone' | 'postal' | 'street'
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 5

// Detect query type
function detectQueryType(query: string): 'postal' | 'street' | 'name' {
  const trimmed = query.trim()
  const lowerQuery = trimmed.toLowerCase()
  
  // Check for postal code (6 digits)
  if (/^\d{6}$/.test(trimmed.replace(/\s+/g, ''))) return 'postal'
  
  // Check for full address with block number (e.g., "38 Lorong 30 Geylang", "123A Bukit Batok St 25")
  if (/^\d{1,4}[A-Z]?\s+[A-Za-z]/i.test(trimmed)) return 'street'
  
  // Check for street keywords - common Singapore street name patterns
  const streetKeywords = [
    'lorong', 'jalan', 'street', 'st', 'avenue', 'ave', 'road', 'rd', 
    'drive', 'dr', 'crescent', 'cres', 'close', 'walk', 'way', 'link',
    'place', 'pl', 'lane', 'terrace', 'park', 'grove', 'central', 'north',
    'south', 'east', 'west'
  ]
  
  // If query contains street keywords, treat as street search
  const hasStreetKeyword = streetKeywords.some(keyword => {
    // Match keyword as whole word or part of compound (e.g., "Lorong 30")
    return lowerQuery.includes(keyword)
  })
  
  // If contains numbers + street keywords, definitely a street
  const hasNumbers = /\d/.test(trimmed)
  if (hasStreetKeyword && hasNumbers) return 'street'
  
  // If starts with common street keywords, also treat as street
  const startsWithStreetKeyword = streetKeywords.some(keyword => 
    lowerQuery.startsWith(keyword + ' ') || lowerQuery === keyword
  )
  if (startsWithStreetKeyword) return 'street'
  
  // Everything else is a name search (neighbourhoods, planning areas)
  return 'name'
}

// Fuzzy match function
function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Exact match or includes
  if (textLower.includes(queryLower)) return true
  
  // Word start match
  const words = textLower.split(/\s+/)
  return words.some(word => word.startsWith(queryLower))
}

export function EnhancedSearch({ 
  planningAreas, 
  selectedPlanningAreas, 
  onPlanningAreasChange,
  selectedSubzones,
  onSubzonesChange,
  neighbourhoods = [],
  onNeighbourhoodSelect
}: EnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAreas, setFilteredAreas] = useState<PlanningArea[]>([])
  const [filteredNeighbourhoods, setFilteredNeighbourhoods] = useState<Neighbourhood[]>([])
  const [subzoneResult, setSubzoneResult] = useState<SubzoneResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [isFocused, setIsFocused] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load search history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as SearchHistoryItem[]
          setSearchHistory(parsed.slice(0, MAX_HISTORY_ITEMS))
        }
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }, [])

  // Save to search history
  const saveToHistory = useCallback((query: string, type: SearchHistoryItem['type']) => {
    if (typeof window === 'undefined' || !query.trim()) return
    
    try {
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp: Date.now(),
        type
      }
      
      const updated = [
        newItem,
        ...searchHistory.filter(item => item.query !== query.trim())
      ].slice(0, MAX_HISTORY_ITEMS)
      
      setSearchHistory(updated)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save search history:', e)
    }
  }, [searchHistory])

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    }
  }, [])

  // Keyboard shortcut to focus search (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        setShowResults(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused])

  // Filter planning areas and neighbourhoods by name with fuzzy matching
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredAreas([])
      setFilteredNeighbourhoods([])
      setSubzoneResult(null)
      setSearchError(null)
      return
    }

    const query = searchQuery.trim()
    const queryType = detectQueryType(query)
    
    // If it's a postal code or street name, don't show name-based results
    if (queryType !== 'name') {
      setFilteredAreas([])
      setFilteredNeighbourhoods([])
      return
    }

    // Name-based search with fuzzy matching for planning areas
    const filteredPA = planningAreas
      .filter(pa => fuzzyMatch(pa.name, query))
      .slice(0, 5)

    setFilteredAreas(filteredPA)

    // Search neighbourhoods if available
    if (neighbourhoods.length > 0) {
      const filteredNH = neighbourhoods
        .filter(n => fuzzyMatch(n.name, query))
        .slice(0, 8)
      setFilteredNeighbourhoods(filteredNH)
    }

    setShowResults((filteredPA.length > 0 || filteredNeighbourhoods.length > 0) || isFocused)
  }, [searchQuery, planningAreas, neighbourhoods, isFocused])

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

    const queryType = detectQueryType(query)
    
    // Only trigger street/postal API search for those types
    if (queryType === 'postal' || queryType === 'street') {
      setIsSearching(true)
      setSearchError(null)
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const type = queryType
          const response = await fetch('/api/subzones/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, query }),
          })

          const data = await response.json()

          if (!response.ok) {
            setSearchError(data.error || 'Search failed')
            setSubzoneResult(null)
            setShowResults(true)
            return
          }

          if (data.subzone) {
            setSubzoneResult(data.subzone)
            setShowResults(true)
          } else {
            setSubzoneResult(null)
            setSearchError('No subarea found')
            setShowResults(true)
          }
        } catch (error) {
          console.error('Error searching subzone:', error)
          setSearchError('Search failed')
          setSubzoneResult(null)
          setShowResults(true)
        } finally {
          setIsSearching(false)
        }
      }, 400)
    } else {
      // For name searches, clear any previous subzone results
      setSubzoneResult(null)
      setSearchError(null)
    }

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
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectPlanningArea = useCallback((planningAreaId: string, query: string) => {
    const newSet = new Set(selectedPlanningAreas)
    newSet.add(planningAreaId)
    onPlanningAreasChange(newSet)
    saveToHistory(query, 'planning_area')
    setShowResults(false)
    setSearchError(null)
  }, [selectedPlanningAreas, onPlanningAreasChange, saveToHistory])

  const handleSelectSubzone = useCallback(() => {
    if (!subzoneResult) return
    
    const newSet = new Set(selectedSubzones)
    newSet.add(subzoneResult.id)
    onSubzonesChange(newSet)
    saveToHistory(searchQuery, 'subzone')
    setShowResults(false)
    setSearchError(null)
  }, [subzoneResult, selectedSubzones, onSubzonesChange, searchQuery, saveToHistory])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    setFilteredAreas([])
    setFilteredNeighbourhoods([])
    setSubzoneResult(null)
    setShowResults(false)
    setSearchError(null)
    onSubzonesChange(new Set())
  }, [onSubzonesChange])

  const handleSelectNeighbourhood = useCallback((neighbourhoodId: string, name: string) => {
    if (onNeighbourhoodSelect) {
      onNeighbourhoodSelect(neighbourhoodId)
      saveToHistory(name, 'planning_area')
      setShowResults(false)
      setSearchError(null)
    }
  }, [onNeighbourhoodSelect, saveToHistory])

  const handleHistoryClick = useCallback((query: string) => {
    setSearchQuery(query)
    setShowResults(true)
  }, [])

  const hasResults = filteredAreas.length > 0 || filteredNeighbourhoods.length > 0 || subzoneResult !== null
  const showDropdown = showResults && (hasResults || searchError || isSearching || (isFocused && searchQuery.length === 0))
  const showClearButton = searchQuery.length > 0 || selectedSubzones.size > 0

  // Popular searches
  const popularSearches = [
    { name: 'Punggol', icon: TrendingUp },
    { name: 'Tampines', icon: TrendingUp },
    { name: 'Bishan', icon: TrendingUp },
    { name: 'Jurong', icon: TrendingUp },
  ]

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setShowResults(true)
          }}
          placeholder="Search area, postal code, or street name..."
          className="w-full pl-12 pr-24 py-3 text-sm text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {!searchQuery && !isSearching && (
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              /
            </kbd>
          )}
          {isSearching && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {showClearButton && !isSearching && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[480px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          ) : searchError ? (
            <div className="p-4 text-center">
              <div className="text-sm text-red-600 mb-2">{searchError}</div>
              <p className="text-xs text-gray-500">Try a different search term</p>
            </div>
          ) : subzoneResult ? (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Found Subarea
              </div>
              <button
                onClick={handleSelectSubzone}
                className={`w-full px-4 py-3 text-sm text-left transition-colors hover:bg-blue-50 ${
                  selectedSubzones.has(subzoneResult.id)
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{subzoneResult.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Planning Area: {planningAreas.find(pa => pa.id === subzoneResult.planning_area_id)?.name || subzoneResult.planning_area_id}
                    </div>
                  </div>
                  {selectedSubzones.has(subzoneResult.id) && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </div>
              </button>
            </div>
          ) : (filteredNeighbourhoods.length > 0 || filteredAreas.length > 0) ? (
            <div className="py-2">
              {/* Neighbourhoods */}
              {filteredNeighbourhoods.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Neighbourhoods
                  </div>
                  {filteredNeighbourhoods.map((neighbourhood) => (
                    <button
                      key={neighbourhood.id}
                      onClick={() => handleSelectNeighbourhood(neighbourhood.id, neighbourhood.name)}
                      className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-blue-50"
                    >
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{neighbourhood.name}</div>
                          {neighbourhood.planning_area && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {neighbourhood.planning_area.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Planning Areas */}
              {filteredAreas.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Planning Areas
                  </div>
                  {filteredAreas.map((pa) => {
                    const isSelected = selectedPlanningAreas.has(pa.id)
                    return (
                      <button
                        key={pa.id}
                        onClick={() => handleSelectPlanningArea(pa.id, pa.name)}
                        className={`w-full px-4 py-3 text-sm text-left transition-colors hover:bg-blue-50 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={`flex-1 ${isSelected ? 'font-medium text-blue-700' : 'text-gray-900'}`}>
                            {pa.name}
                          </span>
                          {isSelected && (
                            <span className="text-blue-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : searchQuery.length === 0 ? (
            <div className="py-2">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Recent Searches
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item.query)}
                      className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{item.query}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Popular Searches */}
              <div>
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Popular Areas
                </div>
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item.name)}
                    className="w-full px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">No results found</p>
              <p className="text-xs text-gray-400">Try searching by area name, postal code, or street</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
