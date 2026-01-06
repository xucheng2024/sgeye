/**
 * Neighbourhood List Page
 * Route: /neighbourhoods
 * 
 * Displays list of neighbourhoods with summary and access data
 * Supports filtering by planning_area_id
 */

'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowRight, List, Map as MapIcon } from 'lucide-react'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import { AnalyticsEvents } from '@/lib/analytics'
import { Neighbourhood, PlanningArea, SortPreset, NeighbourhoodWithFlatType } from '@/lib/types/neighbourhood'
import { normalizeFlatType } from '@/lib/utils/flat-type-normalizer'
import { calculateThresholds, formatFlatType } from '@/lib/utils/neighbourhood-utils'
import { applySortPreset } from '@/lib/utils/neighbourhood-sorting'
import { expandNeighbourhoodsToFlatTypes, applyClientSideFilters, FILTER_RANGES } from '@/lib/utils/neighbourhood-filters'
import { FlatTypeFilter } from '@/components/neighbourhoods/FlatTypeFilter'
import { PlanningAreaFilter } from '@/components/neighbourhoods/PlanningAreaFilter'
import { MarketTierFilter } from '@/components/neighbourhoods/MarketTierFilter'
import { PlanningRegionFilter } from '@/components/neighbourhoods/PlanningRegionFilter'
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

interface SavedFilters {
  version: string
  flatTypes: string[]
  priceTiers: string[]
  leaseTiers: string[]
  mrtTier: string
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
  
  const getInitialMrtTierFromUrl = (): string => {
    if (mrtTierParam) return mrtTierParam
    return 'all'
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
  
  const [neighbourhoods, setNeighbourhoods] = useState<NeighbourhoodWithFlatType[]>([])
  const [originalNeighbourhoods, setOriginalNeighbourhoods] = useState<Neighbourhood[]>([])
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [selectedPlanningAreas, setSelectedPlanningAreas] = useState<Set<string>>(getInitialPlanningAreasFromUrl())
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
  const [mrtTier, setMrtTier] = useState<string>(getInitialMrtTierFromUrl())
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
        if (saved.mrtTier) {
          setMrtTier(saved.mrtTier)
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
    if (mrtTier === 'close') {
      recordBehaviorEvent({ type: 'mrt_filter_close' })
    }
  }, [priceTiers, leaseTiers, mrtTier])

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
    const urlFlatTypes = parseUrlArray(searchParams.get('flat_type') || '')
    const urlPriceTiers = parseUrlArray(searchParams.get('price_tier') || '')
    const urlLeaseTiers = parseUrlArray(searchParams.get('lease_tier') || '')
    const urlMrtTier = searchParams.get('mrt_tier') || 'all'
    const urlRegion = searchParams.get('region') || 'all'
    const addToCompare = searchParams.get('add_to_compare')
    
    const urlPlanningAreaSet = new Set(urlPlanningAreas)
    if (Array.from(selectedPlanningAreas).sort().join(',') !== Array.from(urlPlanningAreaSet).sort().join(',')) {
      setSelectedPlanningAreas(urlPlanningAreaSet)
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
    
    if (urlMrtTier !== mrtTier) {
      setMrtTier(urlMrtTier)
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

  // Save filters to localStorage when they change
  useEffect(() => {
    saveFilters({
      flatTypes: Array.from(selectedFlatTypes),
      priceTiers: Array.from(priceTiers),
      leaseTiers: Array.from(leaseTiers),
      mrtTier: mrtTier,
      region: region,
      majorRegions: Array.from(majorRegions),
      planningAreas: Array.from(selectedPlanningAreas),
      showOnlyWithData: showOnlyWithData,
    })
  }, [selectedFlatTypes, priceTiers, leaseTiers, mrtTier, region, majorRegions, selectedPlanningAreas, showOnlyWithData])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
    if (planningAreaArray.length > 0) {
      params.set('planning_area_id', planningAreaArray.join(','))
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
    
    if (mrtTier && mrtTier !== 'all') {
      params.set('mrt_tier', mrtTier)
    }
    
    if (region && region !== 'all') params.set('region', region)
    
    if (majorRegions.size > 0) {
      const majorRegionArray = Array.from(majorRegions)
      params.set('major_region', majorRegionArray.join(','))
    }
    
    const currentParams = new URLSearchParams(window.location.search)
    const newParamsString = params.toString()
    const currentParamsString = Array.from(currentParams.entries())
      .filter(([key]) => ['planning_area_id', 'flat_type', 'price_tier', 'lease_tier', 'mrt_tier', 'region', 'major_region'].includes(key))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    
    if (newParamsString !== currentParamsString) {
      const newUrl = newParamsString ? `/neighbourhoods?${newParamsString}` : '/neighbourhoods'
      window.history.replaceState({}, '', newUrl)
    }
  }, [selectedPlanningAreas, selectedFlatTypes, priceTiers, leaseTiers, mrtTier, region, majorRegions])

  // Combined effect to load neighbourhoods when filters change (including showOnlyWithData)
  useEffect(() => {
    loadNeighbourhoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanningAreas, selectedFlatTypes, priceTiers, leaseTiers, mrtTier, region, majorRegions, showOnlyWithData])

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

  async function loadNeighbourhoods() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
      if (planningAreaArray.length > 0) {
        params.set('planning_area_id', planningAreaArray.join(','))
      }
      
      const flatTypeArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
      if (flatTypeArray.length > 0) {
        params.set('flat_type', flatTypeArray.join(','))
      }
      
      // Only set API filters if exactly one tier is selected
      if (priceTiers.size === 1) {
        const tier = Array.from(priceTiers)[0]
        const range = FILTER_RANGES.priceRanges[tier]
        if (range) {
          params.set('price_min', range[0].toString())
          params.set('price_max', range[1].toString())
        }
      }
      
      if (leaseTiers.size === 1) {
        const tier = Array.from(leaseTiers)[0]
        const range = FILTER_RANGES.leaseRanges[tier]
        if (range) {
          params.set('lease_min', range[0].toString())
          params.set('lease_max', range[1].toString())
        }
      }
      
      if (mrtTier && mrtTier !== 'all') {
        const distance = FILTER_RANGES.mrtDistances[mrtTier]
        if (distance) {
          params.set('mrt_distance_max', distance.toString())
        }
      }
      
      if (region && region !== 'all') {
        params.set('region', region)
      }
      
      if (majorRegions.size > 0) {
        const majorRegionArray = Array.from(majorRegions)
        params.set('major_region', majorRegionArray.join(','))
      }
      
      // Reduce initial load size for faster first render
      const initialLimit = neighbourhoods.length === 0 ? 100 : 500
      params.set('limit', initialLimit.toString())
      
      const url = `/api/neighbourhoods?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhoods')
      }
      
      const loaded = data.neighbourhoods || []
      setOriginalNeighbourhoods(loaded)
      
      const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
      
      // Expand neighbourhoods to flat types
      let displayItems = expandNeighbourhoodsToFlatTypes(
        loaded,
        selectedFlatTypes,
        priceTiers,
        leaseTiers
      )
      
      // Apply client-side filters
      const mrtTiersForFilter = mrtTier && mrtTier !== 'all' ? new Set([mrtTier]) : new Set<string>()
      displayItems = applyClientSideFilters(
        displayItems,
        priceTiers,
        leaseTiers,
        mrtTiersForFilter,
        isAllFlatTypes
      )
      
      // Apply 12-month data filter
      if (showOnlyWithData) {
        displayItems = displayItems.filter(item => {
          return item.summary?.tx_12m != null && Number(item.summary.tx_12m) > 0
        })
      }
      
      // Calculate thresholds
      const thresholds = calculateThresholds(displayItems)
      setPriceThresholds(thresholds.price)
      
      // Apply sorting
      displayItems = applySortPreset(displayItems, sortPreset)
      
      setNeighbourhoods(displayItems)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to load neighbourhoods')
      console.error('Error loading neighbourhoods:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (neighbourhoods.length > 0 && sortPreset !== 'default') {
      const sorted = applySortPreset([...neighbourhoods], sortPreset)
      setNeighbourhoods(sorted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortPreset])

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
    if (mrtTier && mrtTier !== 'all') params.set('mrt_tier', mrtTier)
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
        mrtTier={mrtTier}
        onMrtTierChange={setMrtTier}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Neighbourhoods</h1>
          <p className="text-lg text-gray-700">
            Narrow down neighbourhoods that fit your family's budget, lease safety, and commute — then compare what you gain and what you trade off.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            School pressure is assessed at the planning area level in the next step.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Data Availability Filter */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithData}
                onChange={(e) => setShowOnlyWithData(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Only show neighbourhoods with 12-month data
              </span>
            </label>
          </div>
          
          {/* First Row */}
          <div className="flex flex-wrap gap-4 mb-4">
            <FlatTypeFilter 
              selectedFlatTypes={selectedFlatTypes}
              onFlatTypesChange={setSelectedFlatTypes}
            />
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

          {/* Second Row */}
          <div className="flex flex-wrap gap-4">
            <PriceRangeFilter 
              priceTiers={priceTiers}
              onPriceTiersChange={setPriceTiers}
            />
            <LeaseSafetyFilter 
              leaseTiers={leaseTiers}
              onLeaseTiersChange={setLeaseTiers}
            />
            <MRTDistanceFilter 
              mrtTier={mrtTier}
              onMrtTierChange={setMrtTier}
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
                  {mrtTier && mrtTier !== 'all' && (
                    <button
                      onClick={() => setMrtTier('all')}
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
                    <div className="text-sm text-gray-600">
                      {neighbourhoods.length} neighbourhood{neighbourhoods.length !== 1 ? 's' : ''} found
                    </div>
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
