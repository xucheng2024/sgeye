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
  onClear?: () => void
  searchedNeighbourhoodId?: string | null
  onActiveSearchChange?: (hasActiveSearch: boolean) => void
}

interface SubzoneResult {
  id: string
  name: string
  planning_area_id: string
  region: string
}

interface ResolvedAddressResult {
  resolved_address: string
  postal?: string
  latlng: { lat: number; lng: number }
  subzone_id: string
  subzone_name: string
  planning_area_id?: string
  planning_area_name?: string
  confidence: 'High' | 'Medium' | 'Low'
  source_chain: string[]
  candidates?: Array<{
    address: string
    postal?: string
    latlng: { lat: number; lng: number }
    score?: number
  }>
  raw_query: string
  normalized_query: string
}

interface SearchHistoryItem {
  query: string
  timestamp: number
  type: 'planning_area' | 'subzone' | 'postal' | 'street'
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 5

// Detect query type - aligned with unified address resolver classifier
function detectQueryType(query: string): 'postal' | 'street' | 'name' | 'mixed' | 'project' {
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
  
  // Check for project/POI indicators
  const projectIndicators = [
    'edge', 'estate', 'residence', 'condo', 'condominium', 'apartment', 
    'apartments', 'villa', 'villas', 'park', 'gardens', 'court', 'plaza',
    'centre', 'center', 'mall', 'complex', 'tower', 'towers', 'heights',
    'view', 'cove', 'bay', 'island', 'point', 'hill', 'hills', 'vale',
    'green', 'village', 'town', 'city', 'place', 'square'
  ]
  
  const hasProjectIndicator = projectIndicators.some(indicator => 
    lowerQuery.includes(indicator)
  )
  
  // Check for location indicators (near, at, around)
  const locationIndicators = ['near', 'at', 'around', 'beside', 'next to']
  const hasLocationIndicator = locationIndicators.some(indicator => 
    lowerQuery.includes(indicator)
  )
  
  // If has project indicators or location indicators, likely a project/mixed query
  if (hasProjectIndicator || hasLocationIndicator) {
    return 'mixed'
  }
  
  // If has numbers but no street keywords, might be a project name
  if (hasNumbers && !hasStreetKeyword) {
    return 'project'
  }
  
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
  onNeighbourhoodSelect,
  onClear,
  searchedNeighbourhoodId = null,
  onActiveSearchChange
}: EnhancedSearchProps) {
  // Store selected subzone name when user selects a subzone
  const [selectedSubzoneName, setSelectedSubzoneName] = useState<string>('')
  
  // Get current search display value based on selected items
  const getCurrentSearchDisplay = useCallback((): string => {
    if (searchedNeighbourhoodId) {
      const neighbourhood = neighbourhoods.find(n => n.id === searchedNeighbourhoodId)
      return neighbourhood?.name || ''
    }
    if (selectedSubzones.size > 0 && selectedSubzoneName) {
      // Return the selected subzone name
      return selectedSubzoneName
    }
    if (selectedPlanningAreas.size > 0) {
      const selectedArea = planningAreas.find(pa => selectedPlanningAreas.has(pa.id))
      return selectedArea?.name || ''
    }
    return ''
  }, [searchedNeighbourhoodId, selectedSubzones, selectedSubzoneName, selectedPlanningAreas, neighbourhoods, planningAreas])

  const [searchQuery, setSearchQuery] = useState('')
  const [currentSearchDisplay, setCurrentSearchDisplay] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
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
  const isSelectingRef = useRef<boolean>(false) // Flag to prevent new searches when selecting a result

  // Clear subzone name when subzones are cleared externally
  useEffect(() => {
    if (selectedSubzones.size === 0 && selectedSubzoneName) {
      setSelectedSubzoneName('')
    }
  }, [selectedSubzones, selectedSubzoneName])

  // Detect if user has active search (typing but no results and no selection made)
  useEffect(() => {
    if (!onActiveSearchChange) return
    
    // Don't update hasActiveSearch while selecting to avoid race conditions
    if (isSelectingRef.current) {
      return
    }
    
    // Check if there's a search query
    const hasSearchQuery = searchQuery.trim().length > 0
    
    // Check if user has made a selection
    const hasActiveSelection = searchedNeighbourhoodId || selectedSubzones.size > 0 || selectedPlanningAreas.size > 0
    
    // Calculate what the display should be based on selections
    // Use currentSearchDisplay which is already calculated and stable
    const expectedDisplay = currentSearchDisplay
    
    // Check if there are any search results available (not selected, but available to select)
    // Include subzoneResult check - if subzoneResult exists, it means we have a result ready to select
    const hasSearchResults = filteredAreas.length > 0 || filteredNeighbourhoods.length > 0 || subzoneResult !== null
    
    // Active search (should show no results) means:
    // 1. User has typed something
    // 2. The typed text doesn't match the current selection display
    // 3. User hasn't made a selection yet
    // 4. AND there are no search results available (nothing matches)
    // 5. AND not currently searching (wait for search to complete)
    // 6. AND no subzoneResult (if subzoneResult exists, we have a result ready to select)
    // 7. AND no search error (if there's an error, we show error message instead)
    const hasActiveSearch = hasSearchQuery && 
                           searchQuery.trim() !== expectedDisplay && 
                           !hasActiveSelection && 
                           !hasSearchResults &&
                           !isSearching &&
                           !searchError &&
                           subzoneResult === null  // If subzoneResult exists, we have a result ready to select
    
    onActiveSearchChange(hasActiveSearch)
  }, [searchQuery, searchedNeighbourhoodId, selectedSubzones.size, selectedSubzoneName, selectedPlanningAreas.size, filteredAreas.length, filteredNeighbourhoods.length, subzoneResult, isSearching, searchError, onActiveSearchChange, currentSearchDisplay])

  // Update search display when selections change (only when user is NOT actively typing)
  // This effect should NOT interfere with user input - only update after selections are made
  useEffect(() => {
    // IMPORTANT: Skip if user is currently editing/typing to avoid overwriting their input
    if (isEditing || isFocused) {
      return
    }
    
    // Calculate display based on current selections
    let display = ''
    if (searchedNeighbourhoodId) {
      const neighbourhood = neighbourhoods.find(n => n.id === searchedNeighbourhoodId)
      display = neighbourhood?.name || ''
    } else if (selectedSubzones.size > 0 && selectedSubzoneName) {
      display = selectedSubzoneName
    } else if (selectedPlanningAreas.size > 0) {
      const selectedArea = planningAreas.find(pa => selectedPlanningAreas.has(pa.id))
      display = selectedArea?.name || ''
    }
    
    // Only update if:
    // 1. Display has actually changed
    // 2. User is NOT actively typing (isEditing and isFocused are both false)
    // 3. Search query is empty or matches the previous display (user hasn't typed something new)
    if (display && display !== currentSearchDisplay) {
      setCurrentSearchDisplay(display)
      // Only update searchQuery if it's empty or matches previous display (user hasn't typed yet)
      if (!searchQuery || searchQuery === currentSearchDisplay || searchQuery === '') {
        setSearchQuery(display)
      }
    } else if (!display && currentSearchDisplay && !searchQuery) {
      // Selection was cleared and search is empty
      setCurrentSearchDisplay('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedNeighbourhoodId, selectedSubzones.size, selectedSubzoneName, selectedPlanningAreas.size])

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
  // ALWAYS search locally first, regardless of query type (postal/street/name)
  // Only call API if no local matches are found
  useEffect(() => {
    // Don't filter while selecting to avoid race conditions
    if (isSelectingRef.current) return
    
    if (searchQuery.trim().length === 0) {
      setFilteredAreas([])
      setFilteredNeighbourhoods([])
      setSubzoneResult(null)
      setSearchError(null)
      return
    }

    const query = searchQuery.trim()
    
    // ALWAYS search locally first (for better UX and less API calls)
    // Name-based search with fuzzy matching for planning areas
    const filteredPA = planningAreas
      .filter(pa => fuzzyMatch(pa.name, query))
      .slice(0, 5)

    setFilteredAreas(filteredPA)

    // Search neighbourhoods if available
    let filteredNH: typeof neighbourhoods = []
    if (neighbourhoods.length > 0) {
      filteredNH = neighbourhoods
        .filter(n => fuzzyMatch(n.name, query))
        .slice(0, 8)
      setFilteredNeighbourhoods(filteredNH)
    } else {
      setFilteredNeighbourhoods([])
    }
    
    // If we have local results, immediately clear hasActiveSearch
    // If no local results, API fallback will be triggered in the other useEffect
    if ((filteredPA.length > 0 || filteredNH.length > 0) && onActiveSearchChange && !isSelectingRef.current) {
      onActiveSearchChange(false)
    }

    setShowResults((filteredPA.length > 0 || filteredNH.length > 0) || isFocused)
  }, [searchQuery, planningAreas, neighbourhoods, isFocused, onActiveSearchChange])

  // Search for subzone using unified address resolver API
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

    // Don't trigger new search if we're currently selecting a result
    if (isSelectingRef.current) {
      return
    }
    
    // Don't trigger new search if query matches selected subzone name
    // This prevents re-searching when user clicks on a result (which sets searchQuery to subzone name)
    // Also check if subzone is already selected to prevent race conditions
    if (selectedSubzoneName && query.toLowerCase() === selectedSubzoneName.toLowerCase()) {
      // Query matches selected subzone, don't trigger new search
      return
    }
    
    // Also prevent search if a subzone is already selected (even if names don't match yet)
    // This prevents race conditions during selection process
    if (selectedSubzones.size > 0) {
      return
    }

    // Check if local search found any results
    const hasLocalResults = filteredAreas.length > 0 || filteredNeighbourhoods.length > 0
    
    // If we have local results, clear any API search state and results
    if (hasLocalResults) {
      setIsSearching(false)
      setSearchError(null)
      setSubzoneResult(null) // Clear API results when local results are available
      return
    }
    
    // Call API only if local search has no results (fallback for all query types)
    // This includes streets, postal codes, and unrecognized names like "guillemard"
    setIsSearching(true)
    setSearchError(null)
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Use new unified address resolver API
        const response = await fetch('/api/address/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        const data = await response.json()

        if (!response.ok) {
          setSearchError(data.error || 'Search failed')
          setSubzoneResult(null)
          setShowResults(true)
          return
        }

        if (data.resolved_address) {
          const resolved = data.resolved_address as ResolvedAddressResult
          // Convert resolved address to SubzoneResult format
          setSubzoneResult({
            id: resolved.subzone_id,
            name: resolved.subzone_name,
            planning_area_id: resolved.planning_area_id || '',
            region: '' // Will be filled from planning area if needed
          })
          setShowResults(true)
          
          // Immediately clear hasActiveSearch when result is found
          // This ensures content is not filtered out before user clicks
          if (onActiveSearchChange && !isSelectingRef.current) {
            onActiveSearchChange(false)
          }
          
          // If there are candidates (Low confidence), we could show them in UI
          // For now, we just set the top result
          if (resolved.confidence === 'Low' && resolved.candidates && resolved.candidates.length > 0) {
            console.log('[EnhancedSearch] Low confidence result with', resolved.candidates.length, 'candidates')
            // Could enhance UI to show candidates for user selection
          }
        } else {
          setSubzoneResult(null)
          setSearchError('No subarea found')
          setShowResults(true)
          // Keep hasActiveSearch as true if no result found (will show "no results" message)
        }
      } catch (error) {
        console.error('Error resolving address:', error)
        setSearchError('Search failed')
        setSubzoneResult(null)
        setShowResults(true)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, selectedSubzones.size, selectedSubzoneName, onActiveSearchChange, filteredAreas.length, filteredNeighbourhoods.length])

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
    // Set flag to prevent new searches while selecting
    isSelectingRef.current = true
    
    const newSet = new Set(selectedPlanningAreas)
    newSet.add(planningAreaId)
    
    // Keep the selected area name in search box
    const selectedArea = planningAreas.find(pa => pa.id === planningAreaId)
    const selectedName = selectedArea?.name || query
    
    // Clear all search-related states
    setFilteredAreas([])
    setFilteredNeighbourhoods([])
    setSubzoneResult(null)
    setShowResults(false)
    setSearchError(null)
    setIsEditing(false)
    setIsFocused(false)
    
    // Update search query
    setSearchQuery(selectedName)
    setCurrentSearchDisplay(selectedName)
    
    // Clear active search state immediately before calling parent
    if (onActiveSearchChange) {
      onActiveSearchChange(false)
    }
    
    // Update parent
    onPlanningAreasChange(newSet)
    
    saveToHistory(query, 'planning_area')
    
    // Clear flag after delay
    setTimeout(() => {
      isSelectingRef.current = false
    }, 1000)
  }, [selectedPlanningAreas, onPlanningAreasChange, saveToHistory, planningAreas, onActiveSearchChange])

  const handleSelectSubzone = useCallback(() => {
    if (!subzoneResult) return
    
    // Set flag to prevent new searches and hasActiveSearch updates while selecting
    isSelectingRef.current = true
    
    // Save the selected subzone values before any state updates that might trigger new searches
    const selectedId = subzoneResult.id
    const selectedName = subzoneResult.name
    
    // Build the new set with the selected subzone
    const newSet = new Set(selectedSubzones)
    newSet.add(selectedId)
    
    // Batch all state updates together using flushSync if available
    // This reduces re-renders and prevents intermediate states
    const updateStates = () => {
      // Clear all search-related states first
      setSubzoneResult(null)
      setShowResults(false)
      setSearchError(null)
      setFilteredAreas([])
      setFilteredNeighbourhoods([])
      setIsEditing(false)
      setIsFocused(false)
      
      // Set the display name and search query
      setSelectedSubzoneName(selectedName)
      setSearchQuery(selectedName)
      setCurrentSearchDisplay(selectedName)
    }
    
    // Update all internal states first
    updateStates()
    
    // IMPORTANT: Clear hasActiveSearch immediately before calling parent callback
    if (onActiveSearchChange) {
      onActiveSearchChange(false)
    }
    
    // Update the selected subzones in parent - this uses flushSync internally
    onSubzonesChange(newSet)
    
    saveToHistory(selectedName, 'subzone')
    
    // Keep the flag set for longer to prevent any race conditions
    setTimeout(() => {
      isSelectingRef.current = false
    }, 1000)
  }, [subzoneResult, selectedSubzones, onSubzonesChange, saveToHistory, onActiveSearchChange])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    setCurrentSearchDisplay('')
    setSelectedSubzoneName('')
    setIsEditing(false)
    setFilteredAreas([])
    setFilteredNeighbourhoods([])
    setSubzoneResult(null)
    setShowResults(false)
    setSearchError(null)
    onSubzonesChange(new Set())
    onPlanningAreasChange(new Set())
    // Call parent's onClear callback if provided
    if (onClear) {
      onClear()
    }
  }, [onSubzonesChange, onPlanningAreasChange, onClear])

  const handleSelectNeighbourhood = useCallback((neighbourhoodId: string, name: string) => {
    if (onNeighbourhoodSelect) {
      // Set flag to prevent new searches while selecting
      isSelectingRef.current = true
      
      // Clear all search-related states
      setFilteredAreas([])
      setFilteredNeighbourhoods([])
      setSubzoneResult(null)
      setShowResults(false)
      setSearchError(null)
      setIsEditing(false)
      setIsFocused(false)
      
      // Keep the neighbourhood name in search box
      setSearchQuery(name)
      setCurrentSearchDisplay(name)
      
      // Clear active search state immediately before calling parent
      if (onActiveSearchChange) {
        onActiveSearchChange(false)
      }
      
      // Call parent callback
      onNeighbourhoodSelect(neighbourhoodId)
      
      saveToHistory(name, 'planning_area')
      
      // Clear flag after delay
      setTimeout(() => {
        isSelectingRef.current = false
      }, 1000)
    }
  }, [onNeighbourhoodSelect, saveToHistory, onActiveSearchChange])

  const handleHistoryClick = useCallback((query: string) => {
    setSearchQuery(query)
    setShowResults(true)
  }, [])

  const hasResults = filteredAreas.length > 0 || filteredNeighbourhoods.length > 0 || subzoneResult !== null
  const showDropdown = showResults && (hasResults || searchError || isSearching || (isFocused && searchQuery.length === 0))
  const showClearButton = searchQuery.length > 0 || selectedSubzones.size > 0 || selectedPlanningAreas.size > 0

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
          onChange={(e) => {
            const newValue = e.target.value
            setSearchQuery(newValue)
            setIsEditing(true)
            
            // If user deletes all text, clear all selections to restore full list
            if (!newValue.trim()) {
              // User cleared the search - clear all selections to show all results
              setCurrentSearchDisplay('')
              setSelectedSubzoneName('')
              if (onClear) {
                onClear()
              }
              onSubzonesChange(new Set())
              onPlanningAreasChange(new Set())
            }
            // If user is typing something different, allow them to search
            // Don't automatically clear selections until they complete or clear the search
          }}
          onFocus={() => {
            setIsFocused(true)
            setIsEditing(true)
            setShowResults(true)
          }}
          onBlur={() => {
            // Delay to allow click events on dropdown items
            setTimeout(() => {
              setIsFocused(false)
              // Only clear editing state if search is empty
              // Otherwise keep it true so search filtering continues to work
              if (!searchQuery.trim()) {
                setCurrentSearchDisplay('')
                setIsEditing(false)
              } else {
                // If user has typed something, keep isEditing true initially
                // Set it to false after a short delay so useEffect can handle display updates
                setTimeout(() => {
                  setIsEditing(false)
                }, 300)
              }
            }, 200)
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
