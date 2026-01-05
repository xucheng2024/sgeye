/**
 * Neighbourhood List Page
 * Route: /neighbourhoods
 * 
 * Displays list of neighbourhoods with summary and access data
 * Supports filtering by planning_area_id
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, TrendingUp, Home, Train, Plus, ArrowRight, DollarSign, Clock, Zap, Map as MapIcon, List, Info, ChevronDown } from 'lucide-react'
import { REGIONS, getRegionInfo, type RegionType } from '@/lib/region-mapping'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import { AnalyticsEvents } from '@/lib/analytics'
import LivingDimensions from '@/components/LivingDimensions'
import { getLivingNotesForNeighbourhood } from '@/lib/neighbourhood-living-notes'

// Dynamically import map component to avoid SSR issues
const NeighbourhoodMap = dynamic(() => import('@/components/NeighbourhoodMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

interface Neighbourhood {
  id: string
  name: string
  one_liner: string | null
  planning_area: {
    id: string
    name: string
    region?: 'CCR' | 'RCR' | 'OCR' | null
  } | null
  summary: {
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
    avg_floor_area_12m?: number | null
  } | null
  flat_type_details?: Array<{
    flat_type: string
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
    avg_floor_area_12m?: number | null
    growth_assessment?: {
      growth_potential: 'high' | 'medium' | 'low' | 'insufficient'
      lease_risk: 'green' | 'amber' | 'red'
      trend_stability: 'stable' | 'volatile' | 'insufficient'
      net_growth_rate?: number | null
      net_growth_score?: number | null
    } | null
  }>
  access: {
    mrt_station_count: number
    mrt_access_type: string
    avg_distance_to_mrt: number | null
    mrt_station_names?: string[]
  } | null
  bbox?: number[] | null
  center?: { lat: number; lng: number } | null
  growth_assessment?: {
    growth_potential: 'high' | 'medium' | 'low' | 'insufficient'
    lease_risk: 'green' | 'amber' | 'red'
    trend_stability: 'stable' | 'volatile' | 'insufficient'
    net_growth_score?: number
  } | null
}

interface PlanningArea {
  id: string
  name: string
}

type SortPreset = 'affordable' | 'lease' | 'mrt' | 'activity' | 'price' | 'area' | 'psm' | 'default'

// Convert string to Title Case (first letter uppercase, rest lowercase, handle multi-word)
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format flat type to lowercase with hyphen (e.g., "4 ROOM" -> "4-room")
function formatFlatType(flatType: string): string {
  if (flatType === 'All' || flatType === 'EXECUTIVE') {
    return flatType === 'All' ? 'Any size' : 'Executive'
  }
  // Convert "3 ROOM" -> "3-room", "4 ROOM" -> "4-room", etc.
  return flatType.toLowerCase().replace(/\s+/g, '-')
}

function NeighbourhoodsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Read filter states from URL params - support comma-separated values for multi-select
  const planningAreaIdParam = searchParams.get('planning_area_id') || ''
  const flatTypeParam = searchParams.get('flat_type') || ''
  const priceTierParam = searchParams.get('price_tier') || ''
  const leaseTierParam = searchParams.get('lease_tier') || ''
  const mrtTierParam = searchParams.get('mrt_tier') || ''
  const regionParam = searchParams.get('region') || 'all'
  const priceMaxParam = searchParams.get('price_max')
  const leaseMinParam = searchParams.get('lease_min')
  const sourceParam = searchParams.get('source')
  
  // Parse comma-separated values from URL
  const parseUrlArray = (value: string): string[] => {
    if (!value) return []
    return value.split(',').filter(v => v.trim() !== '')
  }
  
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([])
  const [originalNeighbourhoods, setOriginalNeighbourhoods] = useState<Neighbourhood[]>([]) // Store original for map view
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [selectedPlanningAreas, setSelectedPlanningAreas] = useState<Set<string>>(new Set(parseUrlArray(planningAreaIdParam)))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [sortPreset, setSortPreset] = useState<SortPreset>('default')
  const [priceThresholds, setPriceThresholds] = useState({ p25: 550000, p50: 650000, p75: 745000 })
  const [leaseThresholds, setLeaseThresholds] = useState({ p25: 54, p50: 61, p75: 75 })
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [isPlanningAreaExpanded, setIsPlanningAreaExpanded] = useState(false)
  
  // Filter states - initialize from URL params (multi-select)
  const [selectedFlatTypes, setSelectedFlatTypes] = useState<Set<string>>(
    new Set(parseUrlArray(flatTypeParam).length > 0 ? parseUrlArray(flatTypeParam) : ['All'])
  )
  const [priceTiers, setPriceTiers] = useState<Set<string>>(new Set(parseUrlArray(priceTierParam)))
  const [leaseTiers, setLeaseTiers] = useState<Set<string>>(new Set(parseUrlArray(leaseTierParam)))
  const [mrtTiers, setMrtTiers] = useState<Set<string>>(new Set(parseUrlArray(mrtTierParam)))
  const [region, setRegion] = useState<string>(regionParam)
  
  useEffect(() => {
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
    const handleLowPriceClick = (price: number | null) => {
      if (price && price < priceThresholds.p25) {
        recordBehaviorEvent({ type: 'low_price_click', metadata: { price } })
      }
    }
    // This will be called when user clicks on a neighbourhood card
    // For now, we'll track when viewing filtered results with low price tier
    if (priceTiers.has('low') && neighbourhoods.length > 0) {
      // Implicit signal that user is browsing low-price options
      const lowPriceCount = neighbourhoods.filter(n => 
        n.summary?.median_price_12m && Number(n.summary.median_price_12m) < priceThresholds.p25
      ).length
      if (lowPriceCount > 5) {
        recordBehaviorEvent({ type: 'low_price_click', metadata: { count: lowPriceCount } })
      }
    }
  }, [neighbourhoods, priceTiers, priceThresholds])

  // Sync filters from URL params when they change (e.g., when returning from detail page)
  useEffect(() => {
    const urlPlanningAreas = parseUrlArray(searchParams.get('planning_area_id') || '')
    const urlFlatTypes = parseUrlArray(searchParams.get('flat_type') || '')
    const urlPriceTiers = parseUrlArray(searchParams.get('price_tier') || '')
    const urlLeaseTiers = parseUrlArray(searchParams.get('lease_tier') || '')
    const urlMrtTiers = parseUrlArray(searchParams.get('mrt_tier') || '')
    const urlRegion = searchParams.get('region') || 'all'
    const urlPriceMax = searchParams.get('price_max')
    const urlLeaseMin = searchParams.get('lease_min')
    const addToCompare = searchParams.get('add_to_compare')
    
    // Convert price_max to price_tier if price_tier not provided (backward compatibility)
    let finalPriceTiers = new Set(urlPriceTiers)
    if (finalPriceTiers.size === 0 && urlPriceMax) {
      const maxPrice = parseFloat(urlPriceMax)
      if (!isNaN(maxPrice)) {
        if (maxPrice <= 500000) {
          finalPriceTiers = new Set(['low'])
        } else if (maxPrice <= 1000000) {
          finalPriceTiers = new Set(['medium'])
        } else {
          finalPriceTiers = new Set(['high'])
        }
      }
    }
    
    // Convert lease_min to lease_tier if lease_tier not provided (backward compatibility)
    let finalLeaseTiers = new Set(urlLeaseTiers)
    if (finalLeaseTiers.size === 0 && urlLeaseMin) {
      const minLease = parseFloat(urlLeaseMin)
      if (minLease >= 80) {
        finalLeaseTiers = new Set(['high'])
      } else if (minLease >= 70) {
        finalLeaseTiers = new Set(['medium'])
      } else {
        finalLeaseTiers = new Set(['low'])
      }
    }
    
    // Compare sets for planning areas
    const urlPlanningAreaSet = new Set(urlPlanningAreas)
    if (Array.from(selectedPlanningAreas).sort().join(',') !== Array.from(urlPlanningAreaSet).sort().join(',')) {
      setSelectedPlanningAreas(urlPlanningAreaSet)
    }
    
    // Compare sets for flat types (default to 'All' if empty)
    const urlFlatTypeSet = new Set(urlFlatTypes.length > 0 ? urlFlatTypes : ['All'])
    if (Array.from(selectedFlatTypes).sort().join(',') !== Array.from(urlFlatTypeSet).sort().join(',')) {
      setSelectedFlatTypes(urlFlatTypeSet)
    }
    
    // Compare sets for price tiers
    if (Array.from(priceTiers).sort().join(',') !== Array.from(finalPriceTiers).sort().join(',')) {
      setPriceTiers(finalPriceTiers)
    }
    
    // Compare sets for lease tiers
    if (Array.from(leaseTiers).sort().join(',') !== Array.from(finalLeaseTiers).sort().join(',')) {
      setLeaseTiers(finalLeaseTiers)
    }
    
    // Compare sets for MRT tiers
    const urlMrtTierSet = new Set(urlMrtTiers)
    if (Array.from(mrtTiers).sort().join(',') !== Array.from(urlMrtTierSet).sort().join(',')) {
      setMrtTiers(urlMrtTierSet)
    }
    
    if (urlRegion !== region) {
      setRegion(urlRegion)
    }
    
    // Handle add_to_compare parameter
    if (addToCompare && !selectedForCompare.has(addToCompare)) {
      const newSet = new Set(selectedForCompare)
      if (newSet.size < 3) {
        newSet.add(addToCompare)
        setSelectedForCompare(newSet)
        // Remove the parameter from URL after processing
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('add_to_compare')
        window.history.replaceState({}, '', newUrl.toString())
        // Scroll to the selected card after a short delay to allow rendering
        setTimeout(() => {
          const element = document.getElementById(`neighbourhood-${addToCompare}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Update URL when filters change (but skip if values match URL to avoid loops)
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Handle multiple planning areas (comma-separated)
    const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
    if (planningAreaArray.length > 0) {
      params.set('planning_area_id', planningAreaArray.join(','))
    }
    
    // Handle multiple flat types (comma-separated, exclude 'All' if others selected)
    const flatTypeArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
    if (flatTypeArray.length > 0) {
      params.set('flat_type', flatTypeArray.join(','))
    }
    
    // Handle multiple price tiers
    const priceTierArray = Array.from(priceTiers).filter(Boolean)
    if (priceTierArray.length > 0) {
      params.set('price_tier', priceTierArray.join(','))
    }
    
    // Handle multiple lease tiers
    const leaseTierArray = Array.from(leaseTiers).filter(Boolean)
    if (leaseTierArray.length > 0) {
      params.set('lease_tier', leaseTierArray.join(','))
    }
    
    // Handle multiple MRT tiers
    const mrtTierArray = Array.from(mrtTiers).filter(Boolean)
    if (mrtTierArray.length > 0) {
      params.set('mrt_tier', mrtTierArray.join(','))
    }
    
    if (region && region !== 'all') params.set('region', region)
    
    const currentParams = new URLSearchParams(window.location.search)
    const newParamsString = params.toString()
    const currentParamsString = Array.from(currentParams.entries())
      .filter(([key]) => ['planning_area_id', 'flat_type', 'price_tier', 'lease_tier', 'mrt_tier', 'region'].includes(key))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    
    // Only update URL if it's different to avoid unnecessary updates
    if (newParamsString !== currentParamsString) {
      const newUrl = newParamsString ? `/neighbourhoods?${newParamsString}` : '/neighbourhoods'
      window.history.replaceState({}, '', newUrl)
    }
  }, [selectedPlanningAreas, selectedFlatTypes, priceTiers, leaseTiers, mrtTiers, region])

  useEffect(() => {
    loadNeighbourhoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanningAreas, selectedFlatTypes, priceTiers, leaseTiers, mrtTiers, region])

  async function loadPlanningAreas() {
    try {
      const res = await fetch('/api/planning-areas')
      const data = await res.json()
      setPlanningAreas(data.planning_areas || [])
    } catch (err) {
      console.error('Error loading planning areas:', err)
    }
  }

  async function loadNeighbourhoods() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      // Handle multiple planning areas
      const planningAreaArray = Array.from(selectedPlanningAreas).filter(Boolean)
      if (planningAreaArray.length > 0) {
        params.set('planning_area_id', planningAreaArray.join(','))
      }
      
      // Handle multiple flat types (exclude 'All' if others selected)
      const flatTypeArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
      if (flatTypeArray.length > 0) {
        params.set('flat_type', flatTypeArray.join(','))
      }
      
      // For price and lease, we'll do client-side filtering for multiple tiers
      // because the API only supports single ranges, and we need to check if values
      // fall within ANY of the selected tier ranges (not the union which would include gaps)
      // So we don't set price_min/max or lease_min/max here when multiple tiers are selected
      // Instead, we'll filter on the client side after receiving data
      
      // Only set API filters if exactly one tier is selected
      if (priceTiers.size === 1) {
        const priceRanges = {
          low: [0, 499999],
          medium: [500000, 999999],
          high: [1000000, 2000000]
        }
        const tier = Array.from(priceTiers)[0]
        const range = priceRanges[tier as keyof typeof priceRanges]
        if (range) {
          params.set('price_min', range[0].toString())
          params.set('price_max', range[1].toString())
        }
      }
      
      if (leaseTiers.size === 1) {
        const leaseRanges = {
          low: [30, 70],      // < 70 years (high risk)
          medium: [70, 80],   // 70-80 years (medium risk)
          high: [80, 99]      // >= 80 years (low risk)
        }
        const tier = Array.from(leaseTiers)[0]
        const range = leaseRanges[tier as keyof typeof leaseRanges]
        if (range) {
          params.set('lease_min', range[0].toString())
          params.set('lease_max', range[1].toString())
        }
      }
      
      console.log('Loading neighbourhoods with filters:', {
        priceTiers: Array.from(priceTiers),
        leaseTiers: Array.from(leaseTiers),
        selectedFlatTypes: Array.from(selectedFlatTypes),
        selectedPlanningAreas: Array.from(selectedPlanningAreas),
        mrtTiers: Array.from(mrtTiers),
        params: params.toString(),
        url: `/api/neighbourhoods?${params.toString()}`
      })
      
      // Don't set MRT filter at API level for multi-tier selection
      // We'll handle it client-side for accurate OR logic
      if (mrtTiers.size === 1) {
        const mrtDistances = {
          close: 500,
          medium: 1000,
          far: 2000
        }
        const tier = Array.from(mrtTiers)[0]
        const distance = mrtDistances[tier as keyof typeof mrtDistances]
        if (distance) {
          params.set('mrt_distance_max', distance.toString())
        }
      }
      
      // Set region filter
      if (region && region !== 'all') {
        params.set('region', region)
      }
      
      params.set('limit', '500')
      
      const url = `/api/neighbourhoods?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load neighbourhoods')
      }
      
      const loaded = data.neighbourhoods || []
      
      // Store original data for map view (before expansion)
      setOriginalNeighbourhoods(loaded)
      
      // Calculate if showing all flat types
      const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
      const selectedFlatTypesArray = Array.from(selectedFlatTypes).filter(ft => ft !== 'All')
      
      console.log('Loaded neighbourhoods:', {
        count: loaded.length,
        flatTypes: isAllFlatTypes ? 'All' : selectedFlatTypesArray,
        sample: loaded.slice(0, 5).map((n: Neighbourhood) => ({
          name: n.name,
          hasSummary: !!n.summary,
          price: n.summary?.median_price_12m,
          lease: n.summary?.median_lease_years_12m,
          tx: n.summary?.tx_12m,
          flatTypeDetailsCount: n.flat_type_details?.length || 0
        })),
        allNames: loaded.map((n: Neighbourhood) => n.name).sort()
      })
      
      // When "All" is selected, expand each neighbourhood into multiple cards (one per flat type)
      let displayItems: Array<Neighbourhood & { display_flat_type?: string }> = []
      
      if (isAllFlatTypes) {
        // Expand: create one card per flat type
        loaded.forEach((neighbourhood: Neighbourhood) => {
          if (neighbourhood.flat_type_details && neighbourhood.flat_type_details.length > 0) {
            // Create a card for each flat type
            neighbourhood.flat_type_details.forEach(ftDetail => {
              displayItems.push({
                ...neighbourhood,
                display_flat_type: ftDetail.flat_type,
                summary: {
                  tx_12m: ftDetail.tx_12m,
                  median_price_12m: ftDetail.median_price_12m,
                  median_psm_12m: ftDetail.median_psm_12m,
                  median_lease_years_12m: ftDetail.median_lease_years_12m,
                  avg_floor_area_12m: ftDetail.avg_floor_area_12m
                }
              })
            })
          } else {
            // No flat type details, show as is
            displayItems.push(neighbourhood)
          }
        })
      } else {
        // Specific flat types selected: filter to only show neighbourhoods that have these flat types
        // Expand to show one card per selected flat type
        loaded.forEach((neighbourhood: Neighbourhood) => {
          if (neighbourhood.flat_type_details && neighbourhood.flat_type_details.length > 0) {
            neighbourhood.flat_type_details.forEach(ftDetail => {
              if (selectedFlatTypesArray.includes(ftDetail.flat_type)) {
                displayItems.push({
                  ...neighbourhood,
                  display_flat_type: ftDetail.flat_type,
                  summary: {
                    tx_12m: ftDetail.tx_12m,
                    median_price_12m: ftDetail.median_price_12m,
                    median_psm_12m: ftDetail.median_psm_12m,
                    median_lease_years_12m: ftDetail.median_lease_years_12m,
                    avg_floor_area_12m: ftDetail.avg_floor_area_12m
                  }
                })
              }
            })
          }
        })
      }
      
      // Apply client-side filters for price, lease, and MRT when any filters are active
      // When multiple tiers are selected, we need to check if values fall within
      // ANY of the selected tier ranges (OR logic, not AND)
      if (priceTiers.size > 0 || leaseTiers.size > 0 || mrtTiers.size > 0) {
        console.log('Applying client-side filters:', {
          priceTiers: Array.from(priceTiers),
          leaseTiers: Array.from(leaseTiers),
          mrtTiers: Array.from(mrtTiers),
          itemsBeforeFilter: displayItems.length
        })
        
        const priceRanges = {
          low: [0, 499999],
          medium: [500000, 999999],
          high: [1000000, 2000000]
        }
        const leaseRanges = {
          low: [30, 70],      // < 70 years (high risk)
          medium: [70, 80],   // 70-80 years (medium risk)
          high: [80, 99]      // >= 80 years (low risk)
        }
        const mrtDistances = {
          close: 500,
          medium: 1000,
          far: 2000
        }
        
        let priceFiltered = 0
        let leaseFiltered = 0
        let mrtFiltered = 0
        
        displayItems = displayItems.filter(item => {
          // Price filter - check if item matches any selected price tier
          if (priceTiers.size > 0) {
            const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
            if (price === null) {
              priceFiltered++
              return false
            }
            const matchesPriceTier = Array.from(priceTiers).some(tier => {
              const range = priceRanges[tier as keyof typeof priceRanges]
              return range && price >= range[0] && price <= range[1]
            })
            if (!matchesPriceTier) {
              priceFiltered++
              return false
            }
          }
          
          // Lease filter - check if item matches any selected lease tier
          if (leaseTiers.size > 0) {
            const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
            if (lease === null) {
              leaseFiltered++
              return false
            }
            const matchesLeaseTier = Array.from(leaseTiers).some(tier => {
              const range = leaseRanges[tier as keyof typeof leaseRanges]
              return range && lease >= range[0] && lease <= range[1]
            })
            if (!matchesLeaseTier) {
              leaseFiltered++
              return false
            }
          }
          
          // MRT filter - check if neighbourhood matches any selected MRT tier
          // Only apply client-side filtering when multiple tiers selected
          if (mrtTiers.size > 1) {
            const distance = item.access?.avg_distance_to_mrt ? Number(item.access.avg_distance_to_mrt) : null
            const hasStationInArea = item.access?.mrt_station_count && Number(item.access.mrt_station_count) > 0
            
            // If has station in area, matches all tiers
            if (hasStationInArea) return true
            
            // Otherwise check distance against selected tiers
            if (distance === null || distance <= 0) {
              mrtFiltered++
              return false
            }
            
            const matchesMrtTier = Array.from(mrtTiers).some(tier => {
              const maxDist = mrtDistances[tier as keyof typeof mrtDistances]
              return maxDist && distance <= maxDist
            })
            if (!matchesMrtTier) {
              mrtFiltered++
              return false
            }
          }
          
          return true
        })
        
        console.log('Client-side filtering results:', {
          itemsAfterFilter: displayItems.length,
          filteredByPrice: priceFiltered,
          filteredByLease: leaseFiltered,
          filteredByMRT: mrtFiltered
        })
      }
      
      console.log('Display items after expansion and client-side filtering:', {
        count: displayItems.length,
        appliedFilters: {
          priceTiers: Array.from(priceTiers),
          leaseTiers: Array.from(leaseTiers),
          mrtTiers: Array.from(mrtTiers)
        },
        sample: displayItems.slice(0, 5).map(n => ({
          name: n.name,
          flatType: (n as Neighbourhood & { display_flat_type?: string }).display_flat_type || (isAllFlatTypes ? 'All' : selectedFlatTypesArray[0]),
          price: n.summary?.median_price_12m,
          lease: n.summary?.median_lease_years_12m,
          mrtDistance: n.access?.avg_distance_to_mrt,
          mrtStationCount: n.access?.mrt_station_count
        }))
      })
      
      // Calculate dynamic thresholds based on actual data
      const thresholds = calculateThresholds(displayItems)
      setPriceThresholds(thresholds.price)
      setLeaseThresholds(thresholds.lease)
      
      // Apply sorting based on preset
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

  function calculateThresholds(data: Neighbourhood[]): {
    price: { p25: number; p50: number; p75: number }
    lease: { p25: number; p50: number; p75: number }
  } {
    const prices = data
      .map(n => n.summary?.median_price_12m)
      .filter((p): p is number => p != null && p > 0)
      .sort((a, b) => a - b)
    
    const leases = data
      .map(n => n.summary?.median_lease_years_12m)
      .filter((l): l is number => l != null && l > 0)
      .sort((a, b) => a - b)
    
    const getPercentile = (arr: number[], percentile: number): number => {
      if (arr.length === 0) return 0
      const index = Math.floor((arr.length - 1) * percentile)
      return arr[index] || 0
    }
    
    return {
      price: {
        p25: prices.length > 0 ? getPercentile(prices, 0.25) : 550000,
        p50: prices.length > 0 ? getPercentile(prices, 0.5) : 650000,
        p75: prices.length > 0 ? getPercentile(prices, 0.75) : 745000,
      },
      lease: {
        p25: leases.length > 0 ? getPercentile(leases, 0.25) : 54,
        p50: leases.length > 0 ? getPercentile(leases, 0.5) : 61,
        p75: leases.length > 0 ? getPercentile(leases, 0.75) : 75,
      }
    }
  }

  function applySortPreset(data: Neighbourhood[], preset: SortPreset): Neighbourhood[] {
    const sorted = [...data]
    
    switch (preset) {
      case 'affordable':
        return sorted.sort((a, b) => {
          const priceA = a.summary?.median_price_12m || Infinity
          const priceB = b.summary?.median_price_12m || Infinity
          return priceA - priceB
        })
      
      case 'lease':
        return sorted.sort((a, b) => {
          const leaseA = a.summary?.median_lease_years_12m || 0
          const leaseB = b.summary?.median_lease_years_12m || 0
          return leaseB - leaseA // Higher lease first
        })
      
      case 'mrt':
        return sorted.sort((a, b) => {
          const accessA = a.access?.mrt_access_type || 'none'
          const accessB = b.access?.mrt_access_type || 'none'
          const accessOrder: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 }
          return accessOrder[accessB] - accessOrder[accessA]
        })
      
      case 'activity':
        return sorted.sort((a, b) => {
          const txA = a.summary?.tx_12m || 0
          const txB = b.summary?.tx_12m || 0
          return txB - txA // Higher transaction count first
        })
      
      case 'price':
        return sorted.sort((a, b) => {
          const priceA = a.summary?.median_price_12m ? Number(a.summary.median_price_12m) : Infinity
          const priceB = b.summary?.median_price_12m ? Number(b.summary.median_price_12m) : Infinity
          // Put null/undefined values at the end
          if (priceA === Infinity && priceB === Infinity) return 0
          if (priceA === Infinity) return 1
          if (priceB === Infinity) return -1
          return priceA - priceB // Lower price first
        })
      
      case 'area':
        return sorted.sort((a, b) => {
          const areaA = a.summary?.avg_floor_area_12m ? Number(a.summary.avg_floor_area_12m) : -1
          const areaB = b.summary?.avg_floor_area_12m ? Number(b.summary.avg_floor_area_12m) : -1
          // Put null/undefined values at the end
          if (areaA === -1 && areaB === -1) return 0
          if (areaA === -1) return 1
          if (areaB === -1) return -1
          return areaB - areaA // Larger area first
        })
      
      case 'psm':
        return sorted.sort((a, b) => {
          const psmA = a.summary?.median_psm_12m ? Number(a.summary.median_psm_12m) : Infinity
          const psmB = b.summary?.median_psm_12m ? Number(b.summary.median_psm_12m) : Infinity
          // Put null/undefined values at the end
          if (psmA === Infinity && psmB === Infinity) return 0
          if (psmA === Infinity) return 1
          if (psmB === Infinity) return -1
          return psmA - psmB // Lower price per sqm first
        })
      
      default:
        return sorted
    }
  }

  useEffect(() => {
    if (neighbourhoods.length > 0) {
      let sorted = [...neighbourhoods]
      
      // Apply preset sort first
      if (sortPreset !== 'default') {
        sorted = applySortPreset(sorted, sortPreset)
      }
      
      setNeighbourhoods(sorted)
    }
  }, [sortPreset])

  function handlePresetClick(preset: SortPreset) {
    setSortPreset(preset)
  }

  function toggleCompare(neighbourhoodId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const newSet = new Set(selectedForCompare)
    if (newSet.has(neighbourhoodId)) {
      newSet.delete(neighbourhoodId)
    } else {
      if (newSet.size >= 3) {
        alert('You can compare up to 3 neighbourhoods at a time')
        return
      }
      newSet.add(neighbourhoodId)
      AnalyticsEvents.addToCompare({ neighbourhoodId })
    }
    setSelectedForCompare(newSet)
  }

  function handleCompareSelected() {
    if (selectedForCompare.size === 0) {
      alert('Please select at least one neighbourhood to compare')
      return
    }
    const ids = Array.from(selectedForCompare).join(',')
    router.push(`/compare?ids=${ids}`)
  }

  function generateCardDescription(n: Neighbourhood): string {
    // Convert to numbers (handle string values from API)
    const price = n.summary?.median_price_12m ? Number(n.summary.median_price_12m) : null
    const lease = n.summary?.median_lease_years_12m ? Number(n.summary.median_lease_years_12m) : null
    const mrtAccess = n.access?.mrt_access_type
    const txCount = n.summary?.tx_12m ? Number(n.summary.tx_12m) : 0
    
    // Check if we have any data at all
    const hasPrice = price !== null && price !== undefined && !isNaN(price) && price > 0
    const hasLease = lease !== null && lease !== undefined && !isNaN(lease) && lease > 0
    const hasMRT = mrtAccess !== null && mrtAccess !== undefined && mrtAccess !== ''
    const hasTx = txCount > 0
    const hasSummary = n.summary !== null && n.summary !== undefined
    const hasAccess = n.access !== null && n.access !== undefined
    
    // Clear messaging for missing data
    if (!hasSummary && !hasAccess) {
      return 'No recent data available (last 12 months)'
    }
    
    if (!hasSummary && hasAccess) {
      // Has access data but no summary (no transactions in last 12 months)
      return 'No recent transactions (last 12 months), check access details'
    }
    
    if (hasSummary && !hasPrice && !hasLease && !hasTx) {
      // Summary exists but all values are null/zero
      return 'Limited recent data, check details for availability'
    }
    
    // Determine price tier using dynamic thresholds (based on actual data percentiles)
    // Affordable: < P25 (bottom 25%)
    // Moderate: P25-P75 (middle 50%)
    // Expensive: >= P75 (top 25%)
    const isAffordable = hasPrice && price < priceThresholds.p25
    const isModerate = hasPrice && price >= priceThresholds.p25 && price < priceThresholds.p75
    const isExpensive = hasPrice && price >= priceThresholds.p75
    
    // Determine lease status using dynamic thresholds (based on actual data percentiles)
    // Short: < P25 (bottom 25%)
    // Medium: P25-P75 (middle 50%)
    // Long: >= P75 (top 25%)
    const hasLongLease = hasLease && lease >= leaseThresholds.p75
    const hasMediumLease = hasLease && lease >= leaseThresholds.p25 && lease < leaseThresholds.p75
    const hasShortLease = hasLease && lease < leaseThresholds.p25
    
    // Determine MRT access (consider both station count and distance)
    // If distance is within walkable range (800m), consider it as accessible even if not in boundary
    const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
    const isWalkableMRT = distance !== null && distance > 0 && distance <= 800 // 800m is walkable distance (about 10 min walk)
    
    const hasHighMRT = mrtAccess === 'high' || (mrtAccess === 'none' && isWalkableMRT && distance && distance <= 500)
    const hasMediumMRT = mrtAccess === 'medium' || (mrtAccess === 'none' && isWalkableMRT && distance && distance > 500)
    const hasLimitedMRT = !hasHighMRT && !hasMediumMRT && (mrtAccess === 'low' || mrtAccess === 'none' || !hasMRT)
    
    // Determine market activity
    const isActive = txCount > 100
    const isQuiet = txCount > 0 && txCount < 50
    
    // Generate specific descriptions with one main signal + one reminder
    // Priority: Price > Lease > MRT > Activity
    
    // Price-based descriptions (if we have price)
    if (isAffordable) {
      if (hasShortLease) return 'Lower entry price, shorter remaining lease'
      if (hasLimitedMRT) return 'Lower entry price, limited MRT access'
      if (hasLongLease) return 'Lower entry price, long remaining lease'
      return 'Lower entry price, moderate characteristics'
    }
    
    if (isExpensive) {
      if (hasHighMRT) return 'Well-connected, higher price pressure'
      if (hasLongLease) return 'Higher price point, long remaining lease'
      if (isActive) return 'Active market, higher price pressure'
      return 'Higher price point, check value carefully'
    }
    
    // Lease-based descriptions (if we have lease but no strong price signal)
    if (hasLongLease) {
      if (hasLimitedMRT) return 'Long remaining lease, limited MRT access'
      if (isExpensive) return 'Long remaining lease, higher price point'
      return 'Long remaining lease, moderate price and access'
    }
    
    if (hasShortLease) {
      return 'Shorter remaining lease, consider long-term plans'
    }
    
    // MRT-based descriptions
    if (hasHighMRT) {
      if (isExpensive) return 'Well-connected, higher price pressure'
      if (hasShortLease) return 'Well-connected, shorter remaining lease'
      return 'Well-connected, moderate price and lease'
    }
    
    if (hasLimitedMRT && hasPrice) {
      return 'Limited MRT access, consider transport needs'
    }
    
    // Activity-based descriptions
    if (isActive) {
      if (isExpensive) return 'Active market, higher price pressure'
      if (hasShortLease) return 'Active market, shorter remaining lease'
      return 'Active market, good choice availability'
    }
    
    
    // Moderate/balanced cases
    if (isModerate && hasMediumLease) {
      return 'Moderate price, balanced lease and access'
    }
    
    // Fallbacks with partial data - be explicit about what's missing
    if (hasPrice && !hasLease && !hasMRT) {
      return `Median price ${formatCurrency(price)}, no lease or MRT data available`
    }
    if (hasPrice && !hasLease) {
      return `Median price ${formatCurrency(price)}, no lease data available`
    }
    if (hasLease && !hasPrice && !hasMRT) {
      return `Remaining lease ${lease.toFixed(0)} years, no price or MRT data available`
    }
    if (hasLease && !hasPrice) {
      return `Remaining lease ${lease.toFixed(0)} years, no price data available`
    }
    if (hasMRT && !hasPrice && !hasLease) {
      const distance = n.access?.avg_distance_to_mrt ? Number(n.access.avg_distance_to_mrt) : null
      const stationCount = n.access?.mrt_station_count ? Number(n.access.mrt_station_count) : null
      const mrtInfo = getMRTAccessLabel(mrtAccess, distance, stationCount, n.access?.mrt_station_names || [])
      return `MRT access: ${mrtInfo.text}, no price or lease data (last 12 months)`
    }
    if (hasTx && !hasPrice && !hasLease) {
      return `${txCount} recent transactions, but no price or lease data available`
    }
    
    // If we have summary but no meaningful data
    if (hasSummary && !hasPrice && !hasLease && !hasTx) {
      return 'No recent transaction data (last 12 months)'
    }
    
    // Last resort - should rarely reach here
    if (hasAccess && !hasSummary) {
      return 'No recent transactions (last 12 months)'
    }
    
    return 'Data availability limited, check details'
  }

  function formatCurrency(amount: number | null): string {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatDistance(meters: number | null): string {
    if (!meters) return 'N/A'
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  function getMRTAccessLabel(
    type: string | null, 
    distance: number | null = null, 
    stationCount: number | null = null,
    stationNames: string[] = []
  ): { text: string; isInArea: boolean } {
    // If there are stations within the neighbourhood (in area)
    if (stationCount !== null && stationCount > 0) {
      if (stationNames.length > 0) {
        // Show station names: "MRT1, MRT2 in area"
        const stationNamesText = stationNames.slice(0, 3).join(', ') + (stationNames.length > 3 ? ` +${stationNames.length - 3} more` : '')
        return {
          text: `${stationNamesText} in area`,
          isInArea: true
        }
      } else {
        // Fallback to count if names not available
        return {
          text: `${stationCount} station${stationCount > 1 ? 's' : ''} in area`,
          isInArea: true
        }
      }
    }
    
    // If no stations in area but distance data available (outside area)
    if (distance !== null && distance > 0) {
      if (stationNames.length > 0) {
        // Show nearest station name: "MRT 461m outside area"
        const nearestStation = stationNames[0]
        return {
          text: `${nearestStation} ${formatDistance(distance)} outside area`,
          isInArea: false
        }
      } else {
        // Fallback to distance only if names not available
        return {
          text: `${formatDistance(distance)} outside area`,
          isInArea: false
        }
      }
    }
    
    // No MRT access
    return {
      text: 'None',
      isInArea: false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Neighbourhoods</h1>
          <p className="text-lg text-gray-700">
            Start by narrowing down neighbourhoods that fit your budget, lease comfort, and daily commute — then compare the trade-offs.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            School pressure is assessed at the planning area level in the next step.
          </p>
          {sourceParam === 'affordability' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Filters applied from affordability calculator:</strong> Your search is pre-filtered based on your budget and selected flat type.
              </p>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* First Row: Flat Type, Planning Area, Region */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Flat Type Filter - Multi-select */}
            <div className="min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Flat size
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['All', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as const).map((ft) => {
                  const isAll = ft === 'All'
                  const isSelected = selectedFlatTypes.has(ft)
                  const showAll = isAll && (selectedFlatTypes.size === 0 || selectedFlatTypes.has('All'))
                  const displayLabel = isAll ? 'Any size' : formatFlatType(ft)
                  
                  return (
                    <button
                      key={ft}
                      onClick={() => {
                        const newSet = new Set(selectedFlatTypes)
                        if (isAll) {
                          // Toggle "All" - if selected, clear all; if not, select only "All"
                          if (isSelected) {
                            newSet.clear()
                          } else {
                            newSet.clear()
                            newSet.add('All')
                          }
                        } else {
                          // Toggle specific flat type
                          if (newSet.has('All')) {
                            newSet.delete('All')
                          }
                          if (isSelected) {
                            newSet.delete(ft)
                            // If nothing left, select "All"
                            if (newSet.size === 0) {
                              newSet.add('All')
                            }
                          } else {
                            newSet.add(ft)
                          }
                        }
                        setSelectedFlatTypes(newSet)
                      }}
                      className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {displayLabel}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Planning Area Filter - Multi-select */}
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
                    onClick={() => setSelectedPlanningAreas(new Set())}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear ({selectedPlanningAreas.size})
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsPlanningAreaExpanded(!isPlanningAreaExpanded)}
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
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPlanningAreaExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isPlanningAreaExpanded && (
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
                                setSelectedPlanningAreas(newSet)
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

            {/* Region Filter */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Region
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setRegion('all')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    region === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRegion('CCR')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    region === 'CCR'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  title="Core Central Region"
                >
                  CCR
                </button>
                <button
                  onClick={() => setRegion('RCR')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    region === 'RCR'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  title="Rest of Central Region"
                >
                  RCR
                </button>
                <button
                  onClick={() => setRegion('OCR')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    region === 'OCR'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                  title="Outside Central Region"
                >
                  OCR
                </button>
              </div>
            </div>
          </div>

          {/* Second Row: Price Range, Remaining Lease, MRT Distance */}
          <div className="flex flex-wrap gap-4">
            {/* Price Range Filter - Multi-select */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Price Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['low', 'medium', 'high'] as const).map((tier) => {
                  const isSelected = priceTiers.has(tier)
                  const labels = { low: 'Lower-priced', medium: 'Mid-range', high: 'Higher-priced' }
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        const newSet = new Set(priceTiers)
                        if (isSelected) {
                          newSet.delete(tier)
                        } else {
                          newSet.add(tier)
                        }
                        setPriceTiers(newSet)
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {labels[tier]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Remaining Lease Filter - Multi-select */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lease safety
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['low', 'medium', 'high'] as const).map((tier) => {
                  const isSelected = leaseTiers.has(tier)
                  const labels = { low: 'Short', medium: 'Typical', high: 'Safe' }
                  const titles = { 
                    low: '< 70 years remaining lease', 
                    medium: '70-80 years remaining lease', 
                    high: '≥ 80 years remaining lease' 
                  }
                  const selectedColors = {
                    low: 'bg-red-600 text-white border-red-600',
                    medium: 'bg-yellow-600 text-white border-yellow-600',
                    high: 'bg-green-600 text-white border-green-600'
                  }
                  const hoverColors = {
                    low: 'hover:border-red-400 hover:bg-red-50',
                    medium: 'hover:border-yellow-400 hover:bg-yellow-50',
                    high: 'hover:border-green-400 hover:bg-green-50'
                  }
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        const newSet = new Set(leaseTiers)
                        if (isSelected) {
                          newSet.delete(tier)
                        } else {
                          newSet.add(tier)
                        }
                        setLeaseTiers(newSet)
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? selectedColors[tier]
                          : `bg-white text-gray-700 border-gray-300 ${hoverColors[tier]}`
                      }`}
                      title={titles[tier]}
                    >
                      {labels[tier]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* MRT Distance Filter - Multi-select */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                MRT Distance
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['close', 'medium', 'far'] as const).map((tier) => {
                  const isSelected = mrtTiers.has(tier)
                  const labels = { close: '≤500m', medium: '≤1km', far: '≤2km' }
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        const newSet = new Set(mrtTiers)
                        if (isSelected) {
                          newSet.delete(tier)
                        } else {
                          newSet.add(tier)
                        }
                        setMrtTiers(newSet)
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {labels[tier]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Compare Status Bar - Show when ≥1 selected */}
        {selectedForCompare.size >= 1 && (
          <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
            {selectedForCompare.size >= 2 ? (
              <>
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    Compare: {Array.from(selectedForCompare)
                      .map(id => neighbourhoods.find(n => n.id === id)?.name)
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
                      .map(id => neighbourhoods.find(n => n.id === id)?.name)
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
                      // Scroll to top of neighbourhood list to help user find another one
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
                      Clear Region Filter
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 mr-2">Sort by:</span>
                        <button
                          onClick={() => setSortPreset(sortPreset === 'price' ? 'default' : 'price')}
                          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                            sortPreset === 'price'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          Price
                        </button>
                        <button
                          onClick={() => setSortPreset(sortPreset === 'area' ? 'default' : 'area')}
                          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                            sortPreset === 'area'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          Area
                        </button>
                        <button
                          onClick={() => setSortPreset(sortPreset === 'psm' ? 'default' : 'psm')}
                          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                            sortPreset === 'psm'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          Price/m²
                        </button>
                      </div>
                      <Link
                        href="/hdb"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors sm:ml-auto whitespace-nowrap"
                      >
                        How have prices changed recently?
                      </Link>
                    </div>
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
                            // Deduplicate neighbourhoods for map view (remove duplicate IDs from expanded "All" view)
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
                  {neighbourhoods.map(neighbourhood => {
                const isSelected = selectedForCompare.has(neighbourhood.id)
                const displayFlatType = (neighbourhood as Neighbourhood & { display_flat_type?: string }).display_flat_type
                const isAllFlatTypes = selectedFlatTypes.has('All') || selectedFlatTypes.size === 0
                // Use unique key: neighbourhood_id + flat_type (for "All" mode) or just neighbourhood_id (for specific flat type)
                const uniqueKey = displayFlatType ? `${neighbourhood.id}-${displayFlatType}` : neighbourhood.id
                const livingNotes = getLivingNotesForNeighbourhood(neighbourhood.name)
                
                return (
                  <div
                    id={`neighbourhood-${neighbourhood.id}`}
                    key={uniqueKey}
                    className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all relative ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{toTitleCase(neighbourhood.name)}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {neighbourhood.planning_area && (
                            <>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                                {toTitleCase(neighbourhood.planning_area.name)}
                              </span>
                              {neighbourhood.planning_area.region && (() => {
                                const regionInfo = getRegionInfo(neighbourhood.planning_area.region as RegionType)
                                if (!regionInfo) return null
                                return (
                                  <span className={`text-xs px-2 py-1 rounded border font-medium ${regionInfo.bgColor} ${regionInfo.color} ${regionInfo.borderColor}`} title={regionInfo.fullName}>
                                    {regionInfo.code}
                                  </span>
                                )
                              })()}
                            </>
                          )}
                          {/* Show the specific flat type when "All" is selected and expanded */}
                          {(() => {
                            const displayFlatTypeValue = (neighbourhood as Neighbourhood & { display_flat_type?: string }).display_flat_type;
                            return displayFlatTypeValue && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                                {formatFlatType(displayFlatTypeValue)}
                              </span>
                            );
                          })()}
                          {/* Show flat type when specific type(s) are selected (not "All") */}
                          {!isAllFlatTypes && displayFlatType && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                              {formatFlatType(displayFlatType)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleCompare(neighbourhood.id, e)}
                        className={`ml-2 p-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isSelected ? 'Remove from compare' : 'Add to compare'}
                      >
                        <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''} transition-transform`} />
                      </button>
                    </div>

                    {livingNotes && <LivingDimensions notes={livingNotes} variant="compressed" className="mb-4" />}

                    {/* Key metrics (condensed) - Fixed order: Price → Area → Lease → MRT */}
                    <div className="space-y-1.5 text-sm mb-4">
                      {/* Price */}
                      {neighbourhood.summary?.median_price_12m != null && Number(neighbourhood.summary.median_price_12m) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(Number(neighbourhood.summary.median_price_12m))}</span>
                        </div>
                      )}
                      
                      {/* Area */}
                      {neighbourhood.summary?.avg_floor_area_12m != null && Number(neighbourhood.summary.avg_floor_area_12m) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-semibold text-gray-900">{Number(neighbourhood.summary.avg_floor_area_12m).toFixed(1)} m²</span>
                        </div>
                      )}
                      
                      {/* Lease */}
                      {neighbourhood.summary?.median_lease_years_12m != null && Number(neighbourhood.summary.median_lease_years_12m) > 0 && (() => {
                        const leaseYears = Number(neighbourhood.summary.median_lease_years_12m)
                        const isShortLease = leaseYears < 70
                        const isLongLease = leaseYears >= 80
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Lease:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{leaseYears.toFixed(1)} years</span>
                              {isShortLease && (
                                <div className="relative group">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 cursor-help">
                                    ⚠ Short lease
                                  </span>
                                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <p className="mb-2">Flats with shorter leases may face resale and financing constraints.</p>
                                    <Link
                                      href="/hdb/lease-price"
                                      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      See how lease length affects long-term value
                                      <ArrowRight className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </div>
                              )}
                              {isLongLease && (
                                <div className="relative group">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 cursor-help">
                                    ✓ Long lease
                                  </span>
                                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <p className="mb-2">Longer remaining leases provide more flexibility for resale and financing.</p>
                                    <Link
                                      href="/hdb/lease-price"
                                      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      See how lease length affects long-term value
                                      <ArrowRight className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                      
                      {/* MRT */}
                      {neighbourhood.access && (() => {
                        const stationNames = neighbourhood.access.mrt_station_names || []
                        console.log('MRT display for', neighbourhood.name, { 
                          stationCount: neighbourhood.access.mrt_station_count,
                          stationNames,
                          distance: neighbourhood.access.avg_distance_to_mrt 
                        })
                        const mrtInfo = getMRTAccessLabel(
                          neighbourhood.access.mrt_access_type,
                          neighbourhood.access.avg_distance_to_mrt ? Number(neighbourhood.access.avg_distance_to_mrt) : null,
                          neighbourhood.access.mrt_station_count ? Number(neighbourhood.access.mrt_station_count) : null,
                          stationNames
                        )
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">MRT:</span>
                            {mrtInfo.isInArea ? (
                              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                ✓ {mrtInfo.text}
                              </span>
                            ) : mrtInfo.text !== 'None' ? (
                              <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                {mrtInfo.text}
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-500">
                                {mrtInfo.text}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                      
                      {/* Show message if no transaction data (price/lease) is available */}
                      {(!neighbourhood.summary || 
                        neighbourhood.summary.tx_12m === 0 ||
                        ((!neighbourhood.summary.median_price_12m || Number(neighbourhood.summary.median_price_12m) <= 0) && 
                         (!neighbourhood.summary.median_lease_years_12m || Number(neighbourhood.summary.median_lease_years_12m) <= 0))) && (
                        <div className="text-xs text-gray-500 italic mt-2">
                          No recent transaction data (last 12 months)
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Link
                        href={(() => {
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
                          const mrtTierArray = Array.from(mrtTiers).filter(Boolean)
                          if (mrtTierArray.length > 0) {
                            params.set('mrt_tier', mrtTierArray.join(','))
                          }
                          const returnParams = params.toString()
                          return `/neighbourhood/${neighbourhood.id}${returnParams ? `?return_to=${encodeURIComponent('/neighbourhoods?' + returnParams)}` : ''}`
                        })()}
                        className="flex-1 text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded hover:bg-blue-50 transition-colors"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
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

