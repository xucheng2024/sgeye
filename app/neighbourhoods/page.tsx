/**
 * Neighbourhood List Page
 * Route: /neighbourhoods
 * 
 * Displays list of neighbourhoods with summary and access data
 * Supports filtering by planning_area_id
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowRight, List, Map as MapIcon } from 'lucide-react'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import { AnalyticsEvents } from '@/lib/analytics'
import { Neighbourhood, PlanningArea, SortPreset, NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'
import { normalizeFlatType } from '@/lib/utils/flat-type-normalizer'
import { calculateThresholds, formatFlatType } from '@/lib/utils/neighbourhood-utils'
import { applySortPreset } from '@/lib/utils/neighbourhood-sorting'
import { expandNeighbourhoodsToFlatTypes, applyClientSideFilters, FILTER_RANGES, matchesPriceTiers, matchesLeaseTiers } from '@/lib/utils/neighbourhood-filters'
import { matchesMrtTiers } from '@/lib/utils/shared-filters'
import { FlatTypeFilter } from '@/components/neighbourhoods/FlatTypeFilter'
import { PlanningAreaFilter } from '@/components/neighbourhoods/PlanningAreaFilter'
import { MarketTierFilter } from '@/components/neighbourhoods/MarketTierFilter'
import { PlanningRegionFilter } from '@/components/neighbourhoods/PlanningRegionFilter'
import { EnhancedSearch } from '@/components/neighbourhoods/EnhancedSearch'
import { PriceRangeFilter } from '@/components/neighbourhoods/PriceRangeFilter'
import { LeaseSafetyFilter } from '@/components/neighbourhoods/LeaseSafetyFilter'
import { MRTDistanceFilter } from '@/components/neighbourhoods/MRTDistanceFilter'
import { SortControls } from '@/components/neighbourhoods/SortControls'
import { NeighbourhoodCard } from '@/components/neighbourhoods/NeighbourhoodCard'
import { FilterWizard } from '@/components/neighbourhoods/FilterWizard'

// Dynamically import map component to avoid SSR issues
const NeighbourhoodMap = dynamic(() => import('@/components/NeighbourhoodMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

// Parse comma-separated values from URL
const parseUrlArray = (value: string): string[] => {
  if (!value) return []
  return value
    .split(',')
    .map(v => normalizeFlatType(v))
    .filter(v => v.trim() !== '')
}

// Filter storage keys
const FILTER_STORAGE_KEY = 'neighbourhood_filters'
const FILTER_STORAGE_VERSION = '1'

// Cache storage keys
const NEIGHBOURHOODS_CACHE_PREFIX = 'neighbourhoods_cache_'
const CACHE_EXPIRY_DAYS = 1 // Cache for 1 day (data updates monthly)

interface CachedData {
  data: Neighbourhood[]
  timestamp: number
  cacheKey: string
}

// Cache storage keys
const NEIGHBOURHOODS_CACHE_KEY = 'neighbourhoods_data_cache'
const NEIGHBOURHOODS_CACHE_VERSION = '1'
const CACHE_EXPIRY_HOURS = 24 // Cache for 24 hours (data updates monthly)

interface SavedFilters {
  version: string
  flatTypes: string[]
  priceTiers: string[]
  leaseTiers: string[]
  mrtTiers: string[]
  region: string
  majorRegions: string[]
  planningAreas: string[]
  showOnlyWithData: boolean
}

// Load saved filters from localStorage
function loadSavedFilters(): Partial<SavedFilters> | null {
  if (typeof window === 'undefined') return null
  
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (!saved) return null
    
    const parsed = JSON.parse(saved) as SavedFilters
    // Check version compatibility
    if (parsed.version !== FILTER_STORAGE_VERSION) return null
    
    return parsed
  } catch {
    return null
  }
}

// Save filters to localStorage
function saveFilters(filters: Omit<SavedFilters, 'version'>): void {
  if (typeof window === 'undefined') return
  
  try {
    const toSave: SavedFilters = {
      ...filters,
      version: FILTER_STORAGE_VERSION,
    }
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.error('Failed to save filters:', error)
  }
}

function NeighbourhoodsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Read filter states from URL params (priority 1)
  const planningAreaIdParam = searchParams.get('planning_area_id') || ''
  const subzoneIdParam = searchParams.get('subzone_id') || ''
  const flatTypeParam = searchParams.get('flat_type') || ''
  const priceTierParam = searchParams.get('price_tier') || ''
  const leaseTierParam = searchParams.get('lease_tier') || ''
  const mrtTierParam = searchParams.get('mrt_tier') || ''
  const regionParam = searchParams.get('region') || ''
  const majorRegionParam = searchParams.get('major_region') || ''
  
  // Determine initial values from URL params (priority 1)
  const getInitialFlatTypesFromUrl = (): Set<string> => {
    if (flatTypeParam) {
      const urlTypes = parseUrlArray(flatTypeParam)
      return new Set(urlTypes.length > 0 ? urlTypes : ['All'])
    }
    return new Set(['All'])
  }
  
  const getInitialPriceTiersFromUrl = (): Set<string> => {
    if (priceTierParam) return new Set(parseUrlArray(priceTierParam))
    return new Set<string>()
  }
  
  const getInitialLeaseTiersFromUrl = (): Set<string> => {
    if (leaseTierParam) return new Set(parseUrlArray(leaseTierParam))
    return new Set<string>()
  }
  
  const getInitialMrtTiersFromUrl = (): Set<string> => {
    if (mrtTierParam) return new Set(parseUrlArray(mrtTierParam))
    return new Set<string>()
  }
  
  const getInitialRegionFromUrl = (): string => {
    if (regionParam) return regionParam
    return 'all'
  }
  
  const getInitialMajorRegionsFromUrl = (): Set<string> => {
    if (majorRegionParam) return new Set(parseUrlArray(majorRegionParam))
    return new Set<string>()
  }
  
  const getInitialPlanningAreasFromUrl = (): Set<string> => {
    if (planningAreaIdParam) return new Set(parseUrlArray(planningAreaIdParam))
    return new Set<string>()
  }
  
  const getInitialSubzonesFromUrl = (): Set<string> => {
    if (subzoneIdParam) return new Set(parseUrlArray(subzoneIdParam))
    return new Set<string>()
  }
  
  const [neighbourhoods, setNeighbourhoods] = useState<NeighbourhoodWithFlatType[]>([])
  const [originalNeighbourhoods, setOriginalNeighbourhoods] = useState<Neighbourhood[]>([])
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [selectedPlanningAreas, setSelectedPlanningAreas] = useState<Set<string>>(getInitialPlanningAreasFromUrl())
  const [selectedSubzones, setSelectedSubzones] = useState<Set<string>>(getInitialSubzonesFromUrl())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [sortPreset, setSortPreset] = useState<SortPreset>('default')
  const [priceThresholds, setPriceThresholds] = useState({ p25: 550000, p50: 650000, p75: 745000 })
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  // Filter states - initialize from URL params
  const [selectedFlatTypes, setSelectedFlatTypes] = useState<Set<string>>(getInitialFlatTypesFromUrl())
  const [priceTiers, setPriceTiers] = useState<Set<string>>(getInitialPriceTiersFromUrl())
  const [leaseTiers, setLeaseTiers] = useState<Set<string>>(getInitialLeaseTiersFromUrl())
  const [mrtTiers, setMrtTiers] = useState<Set<string>>(getInitialMrtTiersFromUrl())
  const [region, setRegion] = useState<string>(getInitialRegionFromUrl())
  const [majorRegions, setMajorRegions] = useState<Set<string>>(getInitialMajorRegionsFromUrl())
  const [showOnlyWithData, setShowOnlyWithData] = useState<boolean>(true)
  
  // Load saved filters from localStorage on mount (only if no URL params)
  useEffect(() => {
    // Only load from localStorage if there are no URL params
    const hasUrlParams = planningAreaIdParam || flatTypeParam || priceTierParam || 
                        leaseTierParam || mrtTierParam || regionParam || majorRegionParam
    
    if (!hasUrlParams) {
      const saved = loadSavedFilters()
      if (saved) {
        if (saved.flatTypes && saved.flatTypes.length > 0) {
          setSelectedFlatTypes(new Set(saved.flatTypes))
        }
        if (saved.priceTiers && saved.priceTiers.length > 0) {
          setPriceTiers(new Set(saved.priceTiers))
        }
        if (saved.leaseTiers && saved.leaseTiers.length > 0) {
          setLeaseTiers(new Set(saved.leaseTiers))
        }
        if (saved.mrtTiers && saved.mrtTiers.length > 0) {
          setMrtTiers(new Set(saved.mrtTiers))
        }
        if (saved.region) {
          setRegion(saved.region)
        }
        if (saved.majorRegions && saved.majorRegions.length > 0) {
          setMajorRegions(new Set(saved.majorRegions))
        }
        if (saved.planningAreas && saved.planningAreas.length > 0) {
          setSelectedPlanningAreas(new Set(saved.planningAreas))
        }
        if (saved.showOnlyWithData !== undefined) {
          setShowOnlyWithData(saved.showOnlyWithData)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
    // Load planning areas immediately (neighbourhoods load separately when filters are ready)
    loadPlanningAreas()
    AnalyticsEvents.viewExplore()
  }, [])

  useEffect(() => {
    // Track filter usage
    if (priceTiers.has('low')) {
      recordBehaviorEvent({ type: 'price_filter', metadata: { tier: 'low' } })
    }
    if (leaseTiers.size > 0) {
      Array.from(leaseTiers).forEach(tier => {
        recordBehaviorEvent({ type: 'lease_filter', metadata: { tier } })
        if (tier === 'low' || tier === 'medium') {
          recordBehaviorEvent({ type: 'short_lease_warning' })
        }
      })
    }
    if (mrtTiers.has('close')) {
      recordBehaviorEvent({ type: 'mrt_filter_close' })
    }
  }, [priceTiers, leaseTiers, mrtTiers])

  useEffect(() => {
    // Track clicks on low-priced neighbourhoods
    if (priceTiers.has('low') && neighbourhoods.length > 0) {
      const lowPriceCount = neighbourhoods.filter(n => 
        n.summary?.median_price_12m && Number(n.summary.median_price_12m) < priceThresholds.p25
      ).length
      if (lowPriceCount > 5) {
        recordBehaviorEvent({ type: 'low_price_click', metadata: { count: lowPriceCount } })
      }
    }
  }, [neighbourhoods, priceTiers, priceThresholds])

  // Sync filters from URL params
  useEffect(() => {
    const urlPlanningAreas = parseUrlArray(searchParams.get('planning_area_id') || '')
    const urlSubzones = parseUrlArray(searchParams.get('subzone_id') || '')
    const urlFlatTypes = parseUrlArray(searchParams.get('flat_type') || '')
    const urlPriceTiers = parseUrlArray(searchParams.get('price_tier') || '')
    const urlLeaseTiers = parseUrlArray(searchParams.get('lease_tier') || '')
    const urlMrtTiers = parseUrlArray(searchParams.get('mrt_tier') || '')
    const urlMajorRegions = parseUrlArray(searchParams.get('major_region') || '')
    const urlRegion = searchParams.get('region') || 'all'
    const addToCompare = searchParams.get('add_to_compare')
    
    const urlPlanningAreaSet = new Set(urlPlanningAreas)
    if (Array.from(selectedPlanningAreas).sort().join(',') !== Array.from(urlPlanningAreaSet).sort().join(',')) {
      setSelectedPlanningAreas(urlPlanningAreaSet)
    }
    
    const urlSubzoneSet = new Set(urlSubzones)
    if (Array.from(selectedSubzones).sort().join(',') !== Array.from(urlSubzoneSet).sort().join(',')) {
      setSelectedSubzones(urlSubzoneSet)
    }
    
    const urlFlatTypeSet = new Set(urlFlatTypes.length > 0 ? urlFlatTypes : ['All'])
    if (Array.from(selectedFlatTypes).sort().join(',') !== Array.from(urlFlatTypeSet).sort().join(',')) {
      setSelectedFlatTypes(urlFlatTypeSet)
    }
    
    if (Array.from(priceTiers).sort().join(',') !== Array.from(new Set(urlPriceTiers)).sort().join(',')) {
      setPriceTiers(new Set(urlPriceTiers))
    }
    
    if (Array.from(leaseTiers).sort().join(',') !== Array.from(new Set(urlLeaseTiers)).sort().join(',')) {
      setLeaseTiers(new Set(urlLeaseTiers))
    }
    
    const urlMrtTiersSet = new Set(urlMrtTiers)
    if (Array.from(mrtTiers).sort().join(',') !== Array.from(urlMrtTiersSet).sort().join(',')) {
      setMrtTiers(urlMrtTiersSet)
    }
    
    const urlMajorRegionsSet = new Set(urlMajorRegions)
    if (Array.from(majorRegions).sort().join(',') !== Array.from(urlMajorRegionsSet).sort().join(',')) {
      setMajorRegions(urlMajorRegionsSet)
    }
    
    if (urlRegion !== region) {
      setRegion(urlRegion)
    }
    
    // Handle add_to_compare parameter (expects neighbourhood ID only, not unique key)
    if (addToCompare) {
      // Check if any key starts with this neighbourhood ID
      const alreadySelected = Array.from(selectedForCompare).some(key => key.startsWith(addToCompare + '-') || key === addToCompare)
      if (!alreadySelected) {
        const newSet = new Set(selectedForCompare)
        if (newSet.size < 3) {
          newSet.add(addToCompare)
          setSelectedForCompare(newSet)
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('add_to_compare')
          window.history.replaceState({}, '', newUrl.toString())
          setTimeout(() => {
            const element = document.getElementById(`neighbourhood-${addToCompare}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Track last saved filters to avoid unnecessary saves
  const lastSavedFiltersRef = useRef<string>('')
  
  // Save filters to localStorage when they change (only if actually changed)
  useEffect(() => {
    const currentFilters = JSON.stringify({
      flatTypes: Array.from(selectedFlatTypes).sort(),
      priceTiers: Array.from(priceTiers).sort(),
      leaseTiers: Array.from(leaseTiers).sort(),
      mrtTiers: Array.from(mrtTiers).sort(),
      region,
      majorRegions: Array.from(majorRegions).sort(),
      planningAreas: Array.from(selectedPlanningAreas).sort(),
      showOnlyWithData,
    })
    
    if (currentFilters !== lastSavedFiltersRef.current) {
      lastSavedFiltersRef.current = currentFilters
      saveFilters({
      flatTypes: Array.from(selectedFlatTypes),
      priceTiers: Array.from(priceTiers),
      leaseTiers: Array.from(leaseTiers),
      mrtTiers: Array.from(mrtTiers),
      region: region,
      majorRegions: Array.from(majorRegions),
      planningAreas: Array.from(selectedPlanningAreas),
      showOnlyWithData: showOnlyWithData,
      })
    }
  }, [selectedFlatTypes, priceTiers, leaseTiers, mrtTiers, region, majorRegions, selectedPlanningAreas, showOnlyWithData])

  // Memoize URL params building to avoid recalculation
  const urlParamsString = useMemo(() => {
    const params = new URLSearchParams()
    
    // Subzone filter takes priority
    const subzoneArray = Array.from(selectedSubzones).filter(Boolean)
    if (subzoneArray.length > 0) {
      params.set('subzone_id', subzoneArray.join(','))
    } else {
      const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
      if (planningAreaArray.length > 0) {
        params.set('planning_area_id', planningAreaArray.join(','))
      }
    }
    
    const flatTypeArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
    if (flatTypeArray.length > 0) {
      params.set('flat_type', flatTypeArray.join(','))
    }
    
    const priceTierArray = Array.from(priceTiers).filter(Boolean)
    if (priceTierArray.length > 0) {
      params.set('price_tier', priceTierArray.join(','))
    }
    
    const leaseTierArray = Array.from(leaseTiers).filter(Boolean)
    if (leaseTierArray.length > 0) {
      params.set('lease_tier', leaseTierArray.join(','))
    }
    
    const mrtTierArray = Array.from(mrtTiers).filter(Boolean)
    if (mrtTierArray.length > 0) {
      params.set('mrt_tier', mrtTierArray.join(','))
    }
    
    if (region && region !== 'all') params.set('region', region)
    
    if (majorRegions.size > 0) {
      const majorRegionArray = Array.from(majorRegions)
      params.set('major_region', majorRegionArray.join(','))
    }
    
    return params.toString()
  }, [selectedPlanningAreas, selectedSubzones, selectedFlatTypes, priceTiers, leaseTiers, mrtTiers, region, majorRegions])
  
  // Track last URL to avoid unnecessary updates
  const lastUrlRef = useRef<string>('')
  
  // Update URL when filters change (only if actually changed)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const newParamsString = urlParamsString
    const newUrl = newParamsString ? `/neighbourhoods?${newParamsString}` : '/neighbourhoods'
    
    // Only update if URL actually changed
    if (lastUrlRef.current !== newUrl) {
      lastUrlRef.current = newUrl
      window.history.replaceState({}, '', newUrl)
    }
  }, [urlParamsString])

  // Expand neighbourhoods to flat types - memoized to only recalculate when original data changes
  const expandedNeighbourhoods = useMemo(() => {
    if (originalNeighbourhoods.length === 0) return []
    return expandNeighbourhoodsToFlatTypes(originalNeighbourhoods)
  }, [originalNeighbourhoods])
  
  // Load neighbourhoods only once on mount - all filters are now client-side
  // This ensures we fetch all data once and filter everything client-side for better performance
  useEffect(() => {
    loadNeighbourhoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Apply client-side filters when they change - use memoized expanded data
  // Now includes planning area and subzone filters (all filters are client-side)
  useEffect(() => {
    if (expandedNeighbourhoods.length === 0) {
      setNeighbourhoods([])
      return
    }
    applyClientSideFiltersAndDisplay(expandedNeighbourhoods)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedNeighbourhoods, selectedPlanningAreas, selectedSubzones, selectedFlatTypes, priceTiers, leaseTiers, mrtTiers, majorRegions, region, sortPreset])

  async function loadPlanningAreas() {
    // Check localStorage cache first (planning areas rarely change)
    const cacheKey = 'planning_areas_cache'
    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 1 hour
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          setPlanningAreas(data)
          return
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }
    
    try {
      const res = await fetch('/api/planning-areas')
      const data = await res.json()
      const planningAreasData = data.planning_areas || []
      setPlanningAreas(planningAreasData)
      
      // Cache in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: planningAreasData,
          timestamp: Date.now()
        }))
      }
    } catch (err) {
      console.error('Error loading planning areas:', err)
    }
  }

  function getCacheKey(): string {
    // All filters are now client-side, so we always cache all data with the same key
    // This allows us to fetch all data once and filter everything client-side
    return 'all'
  }

  function getCachedData(): Neighbourhood[] | null {
    try {
      const cacheKey = getCacheKey()
      const storageKey = `${NEIGHBOURHOODS_CACHE_PREFIX}${cacheKey}`
      const cachedStr = localStorage.getItem(storageKey)
      
      if (!cachedStr) return null
      
      const cached: CachedData = JSON.parse(cachedStr)
      
      // Check if cache is still valid (within expiry time)
      const now = Date.now()
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // Convert days to milliseconds
      const isExpired = (now - cached.timestamp) > expiryTime
      
      if (isExpired) {
        console.log('Cache expired, will fetch fresh data')
        localStorage.removeItem(storageKey)
        return null
      }
      
      console.log('Using cached data', { cacheKey, age: Math.round((now - cached.timestamp) / (1000 * 60 * 60)) + ' hours' })
      return cached.data
    } catch (err) {
      console.error('Error reading cache:', err)
      return null
    }
  }

  function saveToCache(data: Neighbourhood[]) {
    try {
      const cacheKey = getCacheKey()
      const storageKey = `${NEIGHBOURHOODS_CACHE_PREFIX}${cacheKey}`
      const cached: CachedData = {
        data,
        timestamp: Date.now(),
        cacheKey
      }
      localStorage.setItem(storageKey, JSON.stringify(cached))
      console.log('Data saved to cache', { cacheKey, count: data.length })
    } catch (err) {
      console.error('Error saving cache:', err)
      // If storage is full, try to clear old caches
      try {
        const keys = Object.keys(localStorage)
        keys.filter(k => k.startsWith(NEIGHBOURHOODS_CACHE_PREFIX)).forEach(k => localStorage.removeItem(k))
        // Retry save
        const cacheKey = getCacheKey()
        const storageKey = `${NEIGHBOURHOODS_CACHE_PREFIX}${cacheKey}`
        const cached: CachedData = {
          data,
          timestamp: Date.now(),
          cacheKey
        }
        localStorage.setItem(storageKey, JSON.stringify(cached))
      } catch (retryErr) {
        console.error('Failed to save cache after cleanup:', retryErr)
      }
    }
  }

  async function loadNeighbourhoods() {
    setLoading(true)
    setError(null)
    
    // Check cache first
    const cachedData = getCachedData()
    if (cachedData && cachedData.length > 0) {
      console.log('Loading from cache', { count: cachedData.length })
      setOriginalNeighbourhoods(cachedData)
      setLoading(false)
      return
    }
    
    // No valid cache, fetch from API
    try {
      const params = new URLSearchParams()
      
      // Don't send any filters to API - fetch all data once
      // All filters (planning area, subzone, flat_type, price, lease, mrt, region, majorRegions) are applied client-side
      // Set a high limit to get all neighbourhoods with transaction data
      params.set('limit', '1000')
      
      const url = `/api/neighbourhoods?${params.toString()}`
      console.log('Fetching from API', { url })
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhoods')
      }
      
      const loaded = data.neighbourhoods || []
      setOriginalNeighbourhoods(loaded)
      
      // Save to cache
      saveToCache(loaded)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to load neighbourhoods')
      console.error('Error loading neighbourhoods:', err)
    } finally {
      setLoading(false)
    }
  }
  
  function applyClientSideFiltersAndDisplay(expandedData: NeighbourhoodWithFlatType[]) {
    if (expandedData.length === 0) {
      setNeighbourhoods([])
      return
    }
    
    const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
    const selectedFlatTypesArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
    
    // Apply all filters in one pass for better performance
    let displayItems = expandedData.filter(item => {
      // Filter by flat type (if not "All")
      if (!isAllFlatTypes && selectedFlatTypesArray.length > 0) {
        if (!item.display_flat_type || !selectedFlatTypesArray.includes(item.display_flat_type)) {
          return false
        }
      }
      
      // Filter by 12-month transaction data
      if (!item.summary?.tx_12m || Number(item.summary.tx_12m) === 0) {
        return false
      }
      
      // Apply price filter
      if (priceTiers.size > 0) {
        const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
        if (!matchesPriceTiers(price, priceTiers)) return false
      }
      
      // Apply lease filter
      if (leaseTiers.size > 0) {
        const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
        if (!matchesLeaseTiers(lease, leaseTiers)) return false
      }
      
      // Apply MRT filter
      if (mrtTiers.size > 0) {
        const distance = item.access?.avg_distance_to_mrt != null ? Number(item.access.avg_distance_to_mrt) : null
        const hasStationInArea = !!(item.access?.mrt_station_count && Number(item.access.mrt_station_count) > 0)
        if (!matchesMrtTiers(distance, mrtTiers, hasStationInArea)) {
          return false
        }
      }
      
      // Apply region filter (CCR/RCR/OCR) - client-side using planning_area.region field
      if (region && region !== 'all') {
        const neighbourhoodRegion = item.planning_area?.region
        if (!neighbourhoodRegion || neighbourhoodRegion !== region) {
          return false
        }
      }
      
      // Apply major region filter (client-side using subzone_region field)
      if (majorRegions.size > 0) {
        const neighbourhoodMajorRegion = item.subzone_region
        // Match exact value (case-sensitive): 'Central', 'East', 'North', 'North-East', 'West'
        if (!neighbourhoodMajorRegion || !majorRegions.has(neighbourhoodMajorRegion)) {
          return false
        }
      }
      
      // Apply planning area filter (client-side using planning_area.id field)
      if (selectedPlanningAreas.size > 0) {
        const neighbourhoodPlanningAreaId = item.planning_area?.id
        if (!neighbourhoodPlanningAreaId || !selectedPlanningAreas.has(neighbourhoodPlanningAreaId)) {
          return false
        }
      }
      
      // Apply subzone filter (client-side using parent_subzone_id field)
      if (selectedSubzones.size > 0) {
        const neighbourhoodSubzoneId = item.parent_subzone_id
        if (!neighbourhoodSubzoneId || !selectedSubzones.has(neighbourhoodSubzoneId)) {
          return false
        }
      }
      
      return true
    })
    
    // Calculate thresholds (only after filtering for better performance)
    const thresholds = calculateThresholds(displayItems)
    setPriceThresholds(thresholds.price)
    
    // Apply sorting
    displayItems = applySortPreset(displayItems, sortPreset)
    
    setNeighbourhoods(displayItems)
  }


  const toggleCompare = useCallback((uniqueKey: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setSelectedForCompare(prev => {
      const newSet = new Set(prev)
      if (newSet.has(uniqueKey)) {
        newSet.delete(uniqueKey)
      } else {
        if (newSet.size >= 3) {
          alert('You can compare up to 3 neighbourhoods at a time')
          return prev
        }
        newSet.add(uniqueKey)
        // Extract neighbourhood ID for analytics by finding the matching neighbourhood
        const neighbourhood = neighbourhoods.find(n => {
          const nKey = n.display_flat_type ? `${n.id}-${n.display_flat_type}` : n.id
          return nKey === uniqueKey
        })
        if (neighbourhood) {
          AnalyticsEvents.addToCompare({ neighbourhoodId: neighbourhood.id })
        }
      }
      return newSet
    })
  }, [neighbourhoods])

  function handleCompareSelected() {
    if (selectedForCompare.size === 0) {
      alert('Please select at least one neighbourhood to compare')
      return
    }
    // Extract neighbourhood IDs from unique keys by finding matching neighbourhoods
    const ids = Array.from(selectedForCompare)
      .map(uniqueKey => {
        const neighbourhood = neighbourhoods.find(n => {
          const nKey = n.display_flat_type ? `${n.id}-${n.display_flat_type}` : n.id
          return nKey === uniqueKey
        })
        return neighbourhood?.id
      })
      .filter(Boolean)
      .join(',')
    router.push(`/compare?ids=${ids}`)
  }

  // Build filter params string for return links
  const filterParams = (() => {
    const params = new URLSearchParams()
    const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
    if (planningAreaArray.length > 0) params.set('planning_area_id', planningAreaArray.join(','))
    const flatTypeArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
    if (flatTypeArray.length > 0) params.set('flat_type', flatTypeArray.join(','))
    const priceTierArray = Array.from(priceTiers).filter(Boolean)
    if (priceTierArray.length > 0) params.set('price_tier', priceTierArray.join(','))
    const leaseTierArray = Array.from(leaseTiers).filter(Boolean)
    if (leaseTierArray.length > 0) params.set('lease_tier', leaseTierArray.join(','))
    const mrtTierArray = Array.from(mrtTiers).filter(Boolean)
    if (mrtTierArray.length > 0) params.set('mrt_tier', mrtTierArray.join(','))
    return params.toString()
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterWizard
        selectedFlatTypes={selectedFlatTypes}
        onFlatTypesChange={setSelectedFlatTypes}
        priceTiers={priceTiers}
        onPriceTiersChange={setPriceTiers}
        leaseTiers={leaseTiers}
        onLeaseTiersChange={setLeaseTiers}
        mrtTiers={mrtTiers}
        onMrtTiersChange={setMrtTiers}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Neighbourhoods</h1>
          <p className="text-lg text-gray-700">
            Narrow down neighbourhoods that fit your family's budget, lease safety, and commute — then compare what you gain and what you trade off.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            School pressure is assessed at the planning area level in the next step.
          </p>
        </div>

        {/* Enhanced Search - Prominent placement */}
        <div className="mb-6">
          <EnhancedSearch
            planningAreas={planningAreas}
            selectedPlanningAreas={selectedPlanningAreas}
            onPlanningAreasChange={setSelectedPlanningAreas}
            selectedSubzones={selectedSubzones}
            onSubzonesChange={setSelectedSubzones}
            neighbourhoods={originalNeighbourhoods}
            onNeighbourhoodSelect={(neighbourhoodId) => {
              // Scroll to the neighbourhood card
              setTimeout(() => {
                const element = document.getElementById(`neighbourhood-${neighbourhoodId}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
                  }, 2000)
                }
              }, 100)
            }}
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Header with Clear All Button */}
          <div className="mb-4 pb-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Only showing neighbourhoods with transactions in the last 12 months
              </span>
            </div>
            {(selectedFlatTypes.size > 0 && !selectedFlatTypes.has('All') || priceTiers.size > 0 || leaseTiers.size > 0 || mrtTiers.size > 0 || region !== 'all' || majorRegions.size > 0 || selectedPlanningAreas.size > 0 || selectedSubzones.size > 0) && (
              <button
                onClick={() => {
                  setSelectedFlatTypes(new Set(['All']))
                  setPriceTiers(new Set())
                  setLeaseTiers(new Set())
                  setMrtTiers(new Set())
                  setRegion('all')
                  setMajorRegions(new Set())
                  setSelectedPlanningAreas(new Set())
                  setSelectedSubzones(new Set())
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          {/* First Row - Essence Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <FlatTypeFilter 
              selectedFlatTypes={selectedFlatTypes}
              onFlatTypesChange={setSelectedFlatTypes}
            />
            <PriceRangeFilter 
              priceTiers={priceTiers}
              onPriceTiersChange={setPriceTiers}
            />
            <LeaseSafetyFilter 
              leaseTiers={leaseTiers}
              onLeaseTiersChange={setLeaseTiers}
            />
            <MRTDistanceFilter 
              mrtTiers={mrtTiers}
              onMrtTiersChange={setMrtTiers}
            />
          </div>

          {/* Second Row - Location Filters */}
          <div className="flex flex-wrap gap-4">
            <PlanningAreaFilter 
              planningAreas={planningAreas}
              selectedPlanningAreas={selectedPlanningAreas}
              onPlanningAreasChange={setSelectedPlanningAreas}
            />
            <MarketTierFilter 
              region={region}
              onRegionChange={setRegion}
            />
            <PlanningRegionFilter 
              majorRegions={majorRegions}
              onMajorRegionsChange={setMajorRegions}
            />
          </div>
        </div>

        {/* Compare Status Bar */}
        {selectedForCompare.size >= 1 && (
          <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
            {selectedForCompare.size >= 2 ? (
              <>
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    Compare: {Array.from(selectedForCompare)
                      .map(uniqueKey => {
                        const neighbourhood = neighbourhoods.find(n => {
                          const nKey = n.display_flat_type ? `${n.id}-${n.display_flat_type}` : n.id
                          return nKey === uniqueKey
                        })
                        if (!neighbourhood) return null
                        return neighbourhood.display_flat_type 
                          ? `${neighbourhood.name} (${formatFlatType(neighbourhood.display_flat_type)})`
                          : neighbourhood.name
                      })
                      .filter(Boolean)
                      .join(' vs ')}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    See housing, lease, commute, and school trade-offs side by side.
                  </div>
                </div>
                <button
                  onClick={handleCompareSelected}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Compare now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    {Array.from(selectedForCompare)
                      .map(uniqueKey => {
                        const neighbourhood = neighbourhoods.find(n => {
                          const nKey = n.display_flat_type ? `${n.id}-${n.display_flat_type}` : n.id
                          return nKey === uniqueKey
                        })
                        if (!neighbourhood) return null
                        return neighbourhood.display_flat_type 
                          ? `${neighbourhood.name} (${formatFlatType(neighbourhood.display_flat_type)})`
                          : neighbourhood.name
                      })
                      .filter(Boolean)
                      .join('')} selected
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    Select one more to compare side by side.
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (selectedForCompare.size < 2) {
                      const firstCard = document.querySelector('[id^="neighbourhood-"]')
                      if (firstCard) {
                        firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    } else {
                      handleCompareSelected()
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {selectedForCompare.size >= 2 ? 'Compare now' : 'Select one more'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading neighbourhoods...</p>
          </div>
        )}

        {/* Neighbourhood List */}
        {!loading && !error && (
          <>
            {neighbourhoods.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <p className="text-amber-900 font-medium mb-2">No neighbourhoods found matching your criteria</p>
                <p className="text-sm text-amber-700 mb-4">
                  Try adjusting your filters - remove price, lease, or MRT restrictions to see more options.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {priceTiers.size > 0 && (
                    <button
                      onClick={() => setPriceTiers(new Set())}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Price Filter
                    </button>
                  )}
                  {leaseTiers.size > 0 && (
                    <button
                      onClick={() => setLeaseTiers(new Set())}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Lease Filter
                    </button>
                  )}
                  {mrtTiers.size > 0 && (
                    <button
                      onClick={() => setMrtTiers(new Set())}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear MRT Filter
                    </button>
                  )}
                  {region !== 'all' && (
                    <button
                      onClick={() => setRegion('all')}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Market Tier Filter
                    </button>
                  )}
                  {majorRegions.size > 0 && (
                    <button
                      onClick={() => setMajorRegions(new Set())}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Planning Region Filter
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <List className="w-4 h-4 inline mr-1" />
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          viewMode === 'map'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <MapIcon className="w-4 h-4 inline mr-1" />
                        Map
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {neighbourhoods.length} record{neighbourhoods.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                  {viewMode === 'list' && (
                    <SortControls 
                      sortPreset={sortPreset}
                      onSortPresetChange={setSortPreset}
                    />
                  )}
                </div>
                {viewMode === 'map' ? (
                  <div className="mb-6">
                    {typeof window !== 'undefined' && (() => {
                      const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
                      const selectedFlatTypesArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
                      return (
                        <NeighbourhoodMap 
                          neighbourhoods={(() => {
                            const uniqueMap = new Map<string, typeof originalNeighbourhoods[0]>()
                            neighbourhoods.forEach(n => {
                              if (!uniqueMap.has(n.id)) {
                                uniqueMap.set(n.id, n)
                              }
                            })
                            return Array.from(uniqueMap.values())
                          })()} 
                          selectedFlatType={isAllFlatTypes ? 'All' : selectedFlatTypesArray.join(',')}
                        />
                      )
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {neighbourhoods.map((neighbourhood) => {
                      const displayFlatType = neighbourhood.display_flat_type
                      const uniqueKey = displayFlatType ? `${neighbourhood.id}-${displayFlatType}` : neighbourhood.id
                      
                      return (
                        <NeighbourhoodCard
                          key={uniqueKey}
                          neighbourhood={neighbourhood}
                          isSelected={selectedForCompare.has(uniqueKey)}
                          onToggleCompare={toggleCompare}
                          filterParams={filterParams}
                          uniqueKey={uniqueKey}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function NeighbourhoodsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NeighbourhoodsPageContent />
    </Suspense>
  )
}
