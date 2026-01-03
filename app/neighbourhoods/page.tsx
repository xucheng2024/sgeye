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
import { MapPin, TrendingUp, Home, Train, Plus, ArrowRight, DollarSign, Clock, Zap, Map as MapIcon, List, Info } from 'lucide-react'
import { REGIONS, getRegionInfo, type RegionType } from '@/lib/region-mapping'

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
}

interface PlanningArea {
  id: string
  name: string
}

type SortPreset = 'affordable' | 'lease' | 'mrt' | 'activity' | 'price' | 'area' | 'psm' | 'default'

function NeighbourhoodsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Read filter states from URL params
  const planningAreaId = searchParams.get('planning_area_id') || ''
  const flatTypeParam = searchParams.get('flat_type') || 'All'
  const priceTierParam = searchParams.get('price_tier') || 'all'
  const leaseTierParam = searchParams.get('lease_tier') || 'all'
  const mrtTierParam = searchParams.get('mrt_tier') || 'all'
  const regionParam = searchParams.get('region') || 'all'
  const priceMaxParam = searchParams.get('price_max')
  const leaseMinParam = searchParams.get('lease_min')
  const sourceParam = searchParams.get('source')
  
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([])
  const [originalNeighbourhoods, setOriginalNeighbourhoods] = useState<Neighbourhood[]>([]) // Store original for map view
  const [planningAreas, setPlanningAreas] = useState<PlanningArea[]>([])
  const [selectedPlanningArea, setSelectedPlanningArea] = useState<string>(planningAreaId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [sortPreset, setSortPreset] = useState<SortPreset>('default')
  const [priceThresholds, setPriceThresholds] = useState({ p25: 550000, p50: 650000, p75: 745000 })
  const [leaseThresholds, setLeaseThresholds] = useState({ p25: 54, p50: 61, p75: 75 })
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  // Filter states - initialize from URL params
  const [selectedFlatType, setSelectedFlatType] = useState<string>(flatTypeParam)
  const [priceTier, setPriceTier] = useState<string>(priceTierParam)
  const [leaseTier, setLeaseTier] = useState<string>(leaseTierParam)
  const [mrtTier, setMrtTier] = useState<string>(mrtTierParam)
  const [region, setRegion] = useState<string>(regionParam)
  
  useEffect(() => {
    loadPlanningAreas()
  }, [])

  // Sync filters from URL params when they change (e.g., when returning from detail page)
  useEffect(() => {
    const urlPlanningArea = searchParams.get('planning_area_id') || ''
    const urlFlatType = searchParams.get('flat_type') || 'All'
    let urlPriceTier = searchParams.get('price_tier') || 'all'
    let urlLeaseTier = searchParams.get('lease_tier') || 'all'
    const urlMrtTier = searchParams.get('mrt_tier') || 'all'
    const urlRegion = searchParams.get('region') || 'all'
    const urlPriceMax = searchParams.get('price_max')
    const urlLeaseMin = searchParams.get('lease_min')
    const addToCompare = searchParams.get('add_to_compare')
    
    // Convert price_max to price_tier if price_tier not provided
    if (urlPriceTier === 'all' && urlPriceMax) {
      const maxPrice = parseFloat(urlPriceMax)
      if (maxPrice <= 500000) {
        urlPriceTier = 'low'
      } else if (maxPrice <= 1000000) {
        urlPriceTier = 'medium'
      } else {
        urlPriceTier = 'high'
      }
    }
    
    // Convert lease_min to lease_tier if lease_tier not provided (unified terminology)
    if (urlLeaseTier === 'all' && urlLeaseMin) {
      const minLease = parseFloat(urlLeaseMin)
      if (minLease >= 80) {
        urlLeaseTier = 'high'
      } else if (minLease >= 70) {
        urlLeaseTier = 'medium'
      } else {
        urlLeaseTier = 'low'
      }
    }
    
    if (urlPlanningArea !== selectedPlanningArea) {
      setSelectedPlanningArea(urlPlanningArea)
    }
    if (urlFlatType !== selectedFlatType) {
      setSelectedFlatType(urlFlatType)
    }
    if (urlPriceTier !== priceTier) {
      setPriceTier(urlPriceTier)
    }
    if (urlLeaseTier !== leaseTier) {
      setLeaseTier(urlLeaseTier)
    }
    if (urlMrtTier !== mrtTier) {
      setMrtTier(urlMrtTier)
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
    if (selectedPlanningArea) params.set('planning_area_id', selectedPlanningArea)
    if (selectedFlatType && selectedFlatType !== 'All') params.set('flat_type', selectedFlatType)
    if (priceTier && priceTier !== 'all') params.set('price_tier', priceTier)
    if (leaseTier && leaseTier !== 'all') params.set('lease_tier', leaseTier)
    if (mrtTier && mrtTier !== 'all') params.set('mrt_tier', mrtTier)
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
  }, [selectedPlanningArea, selectedFlatType, priceTier, leaseTier, mrtTier, region])

  useEffect(() => {
    loadNeighbourhoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanningArea, selectedFlatType, priceTier, leaseTier, mrtTier, region])

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
      if (selectedPlanningArea) params.set('planning_area_id', selectedPlanningArea)
      if (selectedFlatType && selectedFlatType !== 'All') params.set('flat_type', selectedFlatType)
      
      // Set price range based on tier
      if (priceTier !== 'all') {
        const priceRanges = {
          low: [0, 499999],
          medium: [500000, 999999],
          high: [1000000, 2000000]
        }
        const range = priceRanges[priceTier as keyof typeof priceRanges]
        if (range) {
          params.set('price_min', range[0].toString())
          params.set('price_max', range[1].toString())
        }
      }
      
      // Set lease range based on tier (unified with lease_risk: low/medium/high)
      if (leaseTier !== 'all') {
        const leaseRanges = {
          low: [30, 70],      // < 70 years (high risk)
          medium: [70, 80],   // 70-80 years (medium risk)
          high: [80, 99]      // >= 80 years (low risk)
        }
        const range = leaseRanges[leaseTier as keyof typeof leaseRanges]
        if (range) {
          params.set('lease_min', range[0].toString())
          params.set('lease_max', range[1].toString())
        }
      }
      
      console.log('Loading neighbourhoods with filters:', {
        priceTier,
        leaseTier,
        selectedFlatType,
        selectedPlanningArea,
        mrtTier,
        params: params.toString(),
        url: `/api/neighbourhoods?${params.toString()}`
      })
      
      // Set MRT distance based on tier
      if (mrtTier !== 'all') {
        const mrtDistances = {
          close: 500,
          medium: 1000,
          far: 2000
        }
        params.set('mrt_distance_max', mrtDistances[mrtTier as keyof typeof mrtDistances].toString())
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
      
      console.log('Loaded neighbourhoods:', {
        count: loaded.length,
        flatType: selectedFlatType,
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
      
      if (selectedFlatType === 'All') {
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
        // Specific flat type selected: filter to only show neighbourhoods that have this flat type
        displayItems = loaded.filter((neighbourhood: Neighbourhood) => {
          // Check if this neighbourhood has data for the selected flat type
          if (neighbourhood.flat_type_details && neighbourhood.flat_type_details.length > 0) {
            return neighbourhood.flat_type_details.some(ft => ft.flat_type === selectedFlatType)
          }
          // If no flat_type_details, check if summary exists (API might have filtered already)
          // But to be safe, if there's no flat_type_details, we should exclude it
          return false
        })
      }
      
      // Apply client-side price and lease filters when "All" is selected
      // (API filters at neighbourhood level, but we need to filter expanded items)
      if (selectedFlatType === 'All' && (priceTier !== 'all' || leaseTier !== 'all')) {
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
        
        displayItems = displayItems.filter(item => {
          // Price filter
          if (priceTier !== 'all') {
            const range = priceRanges[priceTier as keyof typeof priceRanges]
            if (range) {
              const price = item.summary?.median_price_12m ? Number(item.summary.median_price_12m) : null
              if (price === null || price < range[0] || price > range[1]) {
                return false
              }
            }
          }
          
          // Lease filter
          if (leaseTier !== 'all') {
            const range = leaseRanges[leaseTier as keyof typeof leaseRanges]
            if (range) {
              const lease = item.summary?.median_lease_years_12m ? Number(item.summary.median_lease_years_12m) : null
              if (lease === null || lease < range[0] || lease > range[1]) {
                return false
              }
            }
          }
          
          return true
        })
      }
      
      console.log('Display items after expansion:', {
        count: displayItems.length,
        sample: displayItems.slice(0, 5).map(n => ({
          name: n.name,
          flatType: n.display_flat_type || selectedFlatType,
          price: n.summary?.median_price_12m
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
    if (neighbourhoods.length > 0 && sortPreset !== 'default') {
      const sorted = applySortPreset([...neighbourhoods], sortPreset)
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
            {/* Flat Type Filter */}
            <div>
              <label htmlFor="flat-type" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Flat Type
              </label>
              <select
                id="flat-type"
                value={selectedFlatType}
                onChange={(e) => setSelectedFlatType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Types</option>
                <option value="3 ROOM">3 ROOM</option>
                <option value="4 ROOM">4 ROOM</option>
                <option value="5 ROOM">5 ROOM</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
              </select>
            </div>

            {/* Planning Area Filter */}
            <div className="flex-shrink-0" style={{ minWidth: '180px' }}>
              <div className="flex items-center gap-1 mb-1.5">
                <label htmlFor="planning-area" className="block text-xs font-semibold text-gray-700">
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
              </div>
              <select
                id="planning-area"
                value={selectedPlanningArea}
                onChange={(e) => {
                  setSelectedPlanningArea(e.target.value)
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set('planning_area_id', e.target.value)
                  } else {
                    url.searchParams.delete('planning_area_id')
                  }
                  window.history.pushState({}, '', url.toString())
                }}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="">All Planning Areas</option>
                {planningAreas.map(pa => (
                  <option key={pa.id} value={pa.id}>{pa.name}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex-shrink-0">
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
            {/* Price Range Filter */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Price Range
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPriceTier('all')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    priceTier === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceTier('low')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    priceTier === 'low'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setPriceTier('medium')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    priceTier === 'medium'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  Med
                </button>
                <button
                  onClick={() => setPriceTier('high')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    priceTier === 'high'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Lease Range Filter */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Remaining Lease
                </label>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <p className="mb-2">Why does lease matter?</p>
                    <p className="mb-2 text-gray-300">Shorter remaining leases can limit resale value and future financing.</p>
                    <Link
                      href="/hdb/lease-price"
                      className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn more about lease risks
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setLeaseTier('all')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    leaseTier === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLeaseTier('low')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    leaseTier === 'low'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50'
                  }`}
                  title="< 70 years remaining lease (High Risk)"
                >
                  Low
                </button>
                <button
                  onClick={() => setLeaseTier('medium')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    leaseTier === 'medium'
                      ? 'bg-yellow-600 text-white border-yellow-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                  }`}
                  title="70-80 years remaining lease (Medium Risk)"
                >
                  Med
                </button>
                <button
                  onClick={() => setLeaseTier('high')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    leaseTier === 'high'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                  title="≥ 80 years remaining lease (Low Risk)"
                >
                  High
                </button>
              </div>
            </div>

            {/* MRT Distance Filter */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                MRT Distance
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setMrtTier('all')}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                    mrtTier === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setMrtTier('close')}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                  mrtTier === 'close'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                ≤500m
                </button>
                <button
                  onClick={() => setMrtTier('medium')}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                  mrtTier === 'medium'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                ≤1km
                </button>
                <button
                  onClick={() => setMrtTier('far')}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                  mrtTier === 'far'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                ≤2km
                </button>
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
                    Compare shortlisted neighbourhoods
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    See housing, lease, commute, and school trade-offs side by side.
                  </div>
                </div>
                <button
                  onClick={handleCompareSelected}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Compare now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    1 neighbourhood selected
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
                  {priceTier !== 'all' && (
                    <button
                      onClick={() => setPriceTier('all')}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Price Filter
                    </button>
                  )}
                  {leaseTier !== 'all' && (
                    <button
                      onClick={() => setLeaseTier('all')}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors text-sm"
                    >
                      Clear Lease Filter
                    </button>
                  )}
                  {mrtTier !== 'all' && (
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
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
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        How have prices changed recently?
                      </Link>
                    </div>
                  )}
                </div>
                {viewMode === 'map' ? (
                  <div className="mb-6">
                    {typeof window !== 'undefined' && (
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
                        selectedFlatType={selectedFlatType}
                      />
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {neighbourhoods.map(neighbourhood => {
                const isSelected = selectedForCompare.has(neighbourhood.id)
                const displayFlatType = (neighbourhood as Neighbourhood & { display_flat_type?: string }).display_flat_type
                // Use unique key: neighbourhood_id + flat_type (for "All" mode) or just neighbourhood_id (for specific flat type)
                const uniqueKey = displayFlatType ? `${neighbourhood.id}-${displayFlatType}` : neighbourhood.id
                
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{neighbourhood.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {neighbourhood.planning_area && (
                            <>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                                {neighbourhood.planning_area.name}
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
                          {(neighbourhood as Neighbourhood & { display_flat_type?: string }).display_flat_type && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                              {(neighbourhood as Neighbourhood & { display_flat_type?: string }).display_flat_type}
                            </span>
                          )}
                          {/* Show flat type when specific type is selected */}
                          {selectedFlatType !== 'All' && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                              {selectedFlatType}
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
                          if (selectedPlanningArea) params.set('planning_area_id', selectedPlanningArea)
                          if (selectedFlatType && selectedFlatType !== 'All') params.set('flat_type', selectedFlatType)
                          if (priceTier && priceTier !== 'all') params.set('price_tier', priceTier)
                          if (leaseTier && leaseTier !== 'all') params.set('lease_tier', leaseTier)
                          if (mrtTier && mrtTier !== 'all') params.set('mrt_tier', mrtTier)
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

