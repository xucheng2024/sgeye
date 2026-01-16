/**
 * Neighbourhood Compare Page
 * Route: /compare?ids=nbhd1,nbhd2,nbhd3
 * 
 * Compares multiple neighbourhoods side by side
 */

'use client'

import React, { useState, useEffect, Suspense, type ReactElement } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { recordBehaviorEvent } from '@/lib/decision-profile'
import FeedbackForm from '@/components/FeedbackForm'
import { AnalyticsEvents } from '@/lib/analytics'
import { getLivingNotesForNeighbourhood } from '@/lib/neighbourhood-living-notes'
import type { LivingRating } from '@/lib/neighbourhood-living-notes'
import { calculateTBI, getTBILevel, getTBILevelLabel } from '@/lib/hdb-data'
import FloatingButton from '@/components/FloatingButton'

interface NeighbourhoodComparison {
  id: string
  name: string
  one_liner: string | null
  planning_area: {
    id: string
    name: string
  } | null
  summary: {
    tx_12m: number
    median_price_12m: number | null
    median_psm_12m: number | null
    median_lease_years_12m: number | null
  } | null
  access: {
    mrt_station_count: number
    mrt_access_type: string
    avg_distance_to_mrt: number | null
    mrt_station_names?: string[]
  } | null
  trends: any[]
}

// Convert string to Title Case (first letter uppercase, rest lowercase, handle multi-word)
function toTitleCase(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format neighbourhood name with subarea (planning_area) if available
function formatNeighbourhoodNameWithSubarea(comparison: NeighbourhoodComparison): string {
  const name = comparison.name ? toTitleCase(comparison.name) : 'The former'
  if (comparison.planning_area?.name) {
    return `${name} (${toTitleCase(comparison.planning_area.name)})`
  }
  return name
}

// Format conclusion text with highlighted neighbourhood name
function formatConclusionWithHighlight(text: string, comparisons: NeighbourhoodComparison[]): ReactElement {
  // Find all neighbourhood names and their positions (case-insensitive)
  const matches: Array<{ name: string; originalName: string; index: number }> = []
  
  for (const comp of comparisons) {
    if (!comp.name) continue
    
    const originalName = comp.name
    const titleCaseName = toTitleCase(originalName)
    
    // Try both original and title case
    const namesToTry = [titleCaseName, originalName]
    if (originalName.toLowerCase() !== titleCaseName.toLowerCase()) {
      namesToTry.push(originalName.toLowerCase())
      namesToTry.push(originalName.toUpperCase())
    }
    
    for (const name of namesToTry) {
      if (!name) continue
      let searchIndex = 0
      while (true) {
        const index = text.indexOf(name, searchIndex)
        if (index === -1) break
        
        // Check if this match is already covered
        const isOverlapping = matches.some(m => 
          (index >= m.index && index < m.index + m.name.length) ||
          (m.index >= index && m.index < index + name.length)
        )
        
        if (!isOverlapping) {
          matches.push({ name, originalName: titleCaseName, index })
        }
        searchIndex = index + 1
      }
    }
  }
  
  // Sort matches by index
  matches.sort((a, b) => a.index - b.index)
  
  // Remove overlapping matches (keep the first one)
  const filteredMatches: Array<{ name: string; originalName: string; index: number }> = []
  for (const match of matches) {
    const overlaps = filteredMatches.some(m => 
      (match.index >= m.index && match.index < m.index + m.name.length) ||
      (m.index >= match.index && m.index < match.index + match.name.length)
    )
    if (!overlaps) {
      filteredMatches.push(match)
    }
  }
  
  // If no matches, return original text
  if (filteredMatches.length === 0) {
    return <>{text}</>
  }
  
  // Build parts array
  const parts: (string | ReactElement)[] = []
  let lastIndex = 0
  
  for (const match of filteredMatches) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    // Add highlighted name (use originalName for display)
    parts.push(
      <span key={`${match.originalName}-${match.index}`} className="text-gray-900 font-semibold">{match.name}</span>
    )
    lastIndex = match.index + match.name.length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return <>{parts}</>
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idsParam = searchParams.get('ids')
  const ids = idsParam ? idsParam.split(',').filter(Boolean).slice(0, 3) : []
  
  const [comparisons, setComparisons] = useState<NeighbourhoodComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flatType, setFlatType] = useState<string>('4 ROOM')
  const [months, setMonths] = useState<number>(24)
  const [livingNotesMap, setLivingNotesMap] = useState<Map<string, import('@/lib/neighbourhood-living-notes').LivingNotes | null>>(new Map())
  const [tbiDataMap, setTbiDataMap] = useState<Map<string, { tbi: number; level: 'low' | 'moderate' | 'high' | 'very_high'; label: string }>>(new Map())

  useEffect(() => {
    if (ids.length > 0) {
      loadComparison()
      // Track compare page visit
      recordBehaviorEvent({ type: 'compare_page' })
      AnalyticsEvents.viewCompare()
      AnalyticsEvents.compareView({ count: ids.length })
    }
  }, [idsParam, flatType, months])

  useEffect(() => {
    // Track transport section focus (when user looks at transport metrics in comparison)
    if (comparisons.length >= 2) {
      const hasTransportFocus = comparisons.some(c => 
        c.access?.mrt_station_count && Number(c.access.mrt_station_count) > 0
      )
      if (hasTransportFocus) {
        recordBehaviorEvent({ type: 'transport_section' })
      }
    }
  }, [comparisons])

  async function loadComparison() {
    if (ids.length === 0) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/neighbourhoods/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          months,
          flat_type: flatType
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compare neighbourhoods')
      }
      
      const comparisonData = data.comparison || []
      setComparisons(comparisonData)
      
      // Load living notes for all comparisons
      const notesPromises = comparisonData.map(async (c: NeighbourhoodComparison) => {
        const notes = c.name ? await getLivingNotesForNeighbourhood(c.name) : null
        return [c.id, notes] as [string, import('@/lib/neighbourhood-living-notes').LivingNotes | null]
      })
      const notesResults = await Promise.all(notesPromises)
      const notesMap = new Map<string, import('@/lib/neighbourhood-living-notes').LivingNotes | null>(notesResults)
      setLivingNotesMap(notesMap)

      // Load transport profiles and calculate TBI for all comparisons
      const tbiPromises = comparisonData.map(async (c: NeighbourhoodComparison) => {
        try {
          const res = await fetch(`/api/neighbourhoods/${c.id}/transport-profile`)
          if (!res.ok) return { id: c.id, tbi: null, level: null, label: null, profile: null }
          
          const profile = await res.json()
          if (profile) {
            const tbi = calculateTBI(profile)
            const level = getTBILevel(tbi)
            const label = getTBILevelLabel(level)
            return [c.id, { tbi, level, label }] as [string, { tbi: number; level: 'low' | 'moderate' | 'high' | 'very_high'; label: string }]
          }
        } catch (error) {
          console.error(`Error loading transport profile for ${c.id}:`, error)
        }
        return [c.id, null] as [string, null]
      })
      const tbiResults = await Promise.all(tbiPromises)
      const tbiMap = new Map<string, { tbi: number; level: 'low' | 'moderate' | 'high' | 'very_high'; label: string }>()
      tbiResults.forEach(([id, data]) => {
        if (data) {
          tbiMap.set(id, data)
        }
      })
      setTbiDataMap(tbiMap)
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison')
      console.error('Error loading comparison:', err)
    } finally {
      setLoading(false)
    }
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

  // Get MRT access label matching the card format
  function getMRTAccessLabelForCard(c: NeighbourhoodComparison): { text: string; isInArea: boolean } {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    const stationNames = c.access?.mrt_station_names || []
    
    // If there are stations within the neighbourhood (in area)
    if (stationCount > 0) {
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

  function getMRTAccessLabel(type: string | null | undefined): string {
    const labels: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: 'None'
    }
    return labels[type || 'none'] || 'Unknown'
  }

  // Get MRT convenience description
  function getMRTConvenienceDescription(c: NeighbourhoodComparison): string {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    const accessType = c.access?.mrt_access_type
    
    // If has stations in area
    if (stationCount > 0) {
      if (distance && distance > 0) {
        if (distance <= 500) {
          return 'Within walking distance (≤500m)'
        } else if (distance <= 1000) {
          return 'Within walking distance (500–1000m)'
        } else {
          return 'Within walking distance (1000m+)'
        }
      }
      return 'Within walking distance'
    }
    
    // No stations in area, check distance to nearest
    if (distance && distance > 0) {
      if (distance <= 500) {
        return '~5–10 min walk'
      } else if (distance <= 1000) {
        return '~10–15 min walk'
      } else if (distance <= 1500) {
        return '~15–20 min walk / bus required'
      } else {
        return '~20+ min walk / bus required'
      }
    }
    
    if (accessType === 'low') {
      return '~15–20 min walk / bus required'
    }
    
    return 'Bus or driving required'
  }

  function getPublicTransportConvenience(c: NeighbourhoodComparison): string {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    const accessType = c.access?.mrt_access_type
    
    if (stationCount >= 2 || accessType === 'high') {
      return 'High'
    } else if (stationCount === 1 || accessType === 'medium' || (distance && distance > 0 && distance <= 800)) {
      return 'Medium'
    } else if (accessType === 'low' || (distance && distance > 0 && distance <= 1500)) {
      return 'Low–medium'
    } else {
      return 'Low'
    }
  }

  // Get MRT coverage tier (for structural comparison)
  function getMRTCoverage(c: NeighbourhoodComparison): string {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    if (stationCount === 0) {
      // Check if there's walkable distance
      if (distance && distance > 0 && distance <= 800) {
        return 'No direct MRT access'
      }
      return 'No walkable MRT'
    }
    if (stationCount === 1) return 'Single-line'
    return 'Multi-line'
  }

  // Get walkability tier (for structural comparison)
  function getWalkability(c: NeighbourhoodComparison): string {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    
    if (stationCount > 0) {
      // Has MRT stations in area
      if (distance === 0 || distance === null) {
        // Stations are IN the neighbourhood
        return '≤500m'
      } else if (distance > 0 && distance <= 500) {
        return '≤500m'
      } else if (distance > 500 && distance <= 1000) {
        return '500–1000m'
      } else {
        return '1000m+'
      }
    } else {
      // No MRT in area
      if (distance && distance > 0 && distance <= 1000) {
        return '500–1000m'
      } else {
        return 'Bus-dependent'
      }
    }
  }

  // Get transport tier (for structural comparison)
  function getTransportTier(c: NeighbourhoodComparison): string {
    const stationCount = Number(c.access?.mrt_station_count) || 0
    const distance = c.access?.avg_distance_to_mrt ? Number(c.access.avg_distance_to_mrt) : null
    const accessType = c.access?.mrt_access_type
    
    if (stationCount >= 2 || accessType === 'high') {
      return 'Rail-accessible'
    } else if (stationCount === 1 || (distance && distance > 0 && distance <= 1000)) {
      return 'Feeder-dependent'
    } else {
      return 'Bus-first'
    }
  }

  // Generate "Who is this for" analysis
  function generateWhoIsThisFor() {
    if (comparisons.length < 2) return []
    
    return comparisons.map((c, idx) => {
      const price = c.summary?.median_price_12m
      const psm = c.summary?.median_psm_12m
      const lease = c.summary?.median_lease_years_12m
      const txCount = c.summary?.tx_12m || 0
      const mrtStations = c.access?.mrt_station_count || 0
      const mrtDistance = c.access?.avg_distance_to_mrt
      
      const pros: string[] = []
      const cons: string[] = []
      
      // Compare with others
      const otherPrices = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_price_12m).filter(p => p !== null && p !== undefined) as number[]
      const otherPsms = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_psm_12m).filter(p => p !== null && p !== undefined) as number[]
      const otherLeases = comparisons.filter((_, i) => i !== idx).map(c => c.summary?.median_lease_years_12m).filter(l => l !== null && l !== undefined) as number[]
      const otherStations = comparisons.filter((_, i) => i !== idx).map(c => c.access?.mrt_station_count || 0)
      const otherDistances = comparisons.filter((_, i) => i !== idx).map(c => c.access?.avg_distance_to_mrt).filter(d => d !== null && d !== undefined) as number[]
      
      // Helper to add unique items
      const addUnique = (arr: string[], item: string) => {
        if (!arr.includes(item)) {
          arr.push(item)
        }
      }
      
      // Price analysis - using "you" statements
      if (price && otherPrices.length > 0) {
        const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
        if (price < avgOtherPrice * 0.85) {
          addUnique(pros, "You're buying your first HDB")
          addUnique(pros, "You prioritise value and lease length")
        } else if (price > avgOtherPrice * 1.15) {
          addUnique(pros, "You're okay paying more for central access")
          addUnique(cons, "You're very price-sensitive")
        }
      }
      
      // Transport convenience analysis - using "you" statements
      if (mrtStations > 0 || (mrtDistance && mrtDistance <= 500)) {
        addUnique(pros, "You value mature-estate convenience")
        if (price && otherPrices.length > 0) {
          const avgOtherPrice = otherPrices.reduce((a, b) => a + b, 0) / otherPrices.length
          if (price > avgOtherPrice * 1.15) {
            addUnique(pros, "You're okay paying more for central access")
          }
        }
      } else if (mrtDistance && mrtDistance > 1500) {
        addUnique(cons, "You need central-city access")
        addUnique(cons, "You dislike longer commutes")
      }
      
      // Lease analysis - using "you" statements
      if (lease && otherLeases.length > 0) {
        const avgOtherLease = otherLeases.reduce((a, b) => a + b, 0) / otherLeases.length
        if (lease > avgOtherLease + 5) {
          addUnique(pros, "You prioritise value and lease length")
        } else if (lease < avgOtherLease - 5) {
          addUnique(cons, "You need strong lease safety")
        }
      }
      
      // Market activity - using "you" statements
      if (txCount > 100) {
        // Active market is generally good, but don't add as explicit pro unless it's a key differentiator
      } else if (txCount < 50) {
        addUnique(cons, "You need strong recent resale activity")
      }
      
      return {
        id: c.id,
        name: c.name,
        pros,
        cons
      }
    })
  }

  // Get which cell should be highlighted for a metric (returns index or null)
  function getHighlightedCellIndex(metric: string, rawValues: (number | null | string)[]): number | null {
    if (rawValues.length < 2) return null
    
    // Extract numeric values
    let numericValues: number[] = []
    
    switch (metric) {
      case 'Transactions (12m)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseInt(v.replace(/,/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        if (numericValues.length < 2) return null
        const maxTx = Math.max(...numericValues)
        const minTx = Math.min(...numericValues)
        // Threshold: ≥ 1.5×
        if (maxTx >= minTx * 1.5) {
          return numericValues.indexOf(maxTx)
        }
        return null
      
      case 'Median Price':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        if (numericValues.length < 2) return null
        const maxPrice = Math.max(...numericValues)
        const minPrice = Math.min(...numericValues)
        // Threshold: ≥ $150k
        if (maxPrice - minPrice >= 150000) {
          return numericValues.indexOf(maxPrice)
        }
        return null
      
      case 'Median Lease (years)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        if (numericValues.length < 2) return null
        const maxLease = Math.max(...numericValues)
        const minLease = Math.min(...numericValues)
        // Threshold: ≥ 10 years
        if (maxLease - minLease >= 10) {
          return numericValues.indexOf(maxLease)
        }
        return null
      
      case 'Transport Burden (TBI)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        if (numericValues.length < 2) return null
        const maxTbi = Math.max(...numericValues)
        const minTbi = Math.min(...numericValues)
        // Threshold: ≥ 8 points difference (lower is better, so highlight the one with lower TBI)
        if (maxTbi - minTbi >= 8) {
          return numericValues.indexOf(minTbi)
        }
        return null
      
      // Price per sqm: no highlighting (as per requirements)
      default:
        return null
    }
  }

  // Generate verdict for each metric row - returns neighbourhood name + value judgment
  function getMetricVerdict(metric: string, rawValues: (number | null | string)[]): { display: string; tooltip: string } | null {
    if (rawValues.length < 2) return null
    
    // Extract numeric values from raw values
    let numericValues: number[] = []
    
    switch (metric) {
      case 'Transactions (12m)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseInt(v.replace(/,/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Median Price':
      case 'Price per sqm':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Median Lease (years)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'MRT Stations':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseInt(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Distance to MRT':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            if (v === 'N/A' || v === '') return null
            const num = parseFloat(v.replace(/[^0-9.]/g, ''))
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      case 'Transport Burden (TBI)':
        numericValues = rawValues.map(v => {
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const num = parseFloat(v)
            return isNaN(num) ? null : num
          }
          return null
        }).filter(v => v !== null) as number[]
        break
      
      default:
        return null
    }
    
    if (numericValues.length < 2) return null
    
    switch (metric) {
      case 'Transactions (12m)':
        const maxTx = Math.max(...numericValues)
        const minTx = Math.min(...numericValues)
        if (maxTx === minTx) return { display: 'Similar activity', tooltip: 'Both have similar transaction volume' }
        const maxTxIdx = numericValues.indexOf(maxTx)
        const txDiffPercent = ((maxTx - minTx) / minTx) * 100
        const neighbourhoodName = comparisons[maxTxIdx]?.name ? toTitleCase(comparisons[maxTxIdx].name) : 'The former'
        if (txDiffPercent > 50) {
          return { display: `${neighbourhoodName} is more active`, tooltip: `${neighbourhoodName} has clearly more active resale market` }
        } else if (txDiffPercent > 20) {
          return { display: `${neighbourhoodName} is more active`, tooltip: `${neighbourhoodName} has more active resale market` }
        } else {
          return { display: `${neighbourhoodName} is more active`, tooltip: `${neighbourhoodName} has slightly more active resale market` }
        }
      
      case 'Median Price':
        const maxPrice = Math.max(...numericValues)
        const minPrice = Math.min(...numericValues)
        const diffPercent = ((maxPrice - minPrice) / minPrice) * 100
        if (diffPercent < 5) return { display: 'Similar prices', tooltip: 'Both have similar median prices' }
        const maxPriceIdx = numericValues.indexOf(maxPrice)
        const neighbourhoodNamePrice = comparisons[maxPriceIdx]?.name ? toTitleCase(comparisons[maxPriceIdx].name) : 'The former'
        if (diffPercent > 30) {
          return { display: `${neighbourhoodNamePrice} is more expensive`, tooltip: `${neighbourhoodNamePrice} is substantially higher` }
        } else if (diffPercent > 15) {
          return { display: `${neighbourhoodNamePrice} is more expensive`, tooltip: `${neighbourhoodNamePrice} is clearly higher` }
        } else {
          return { display: `${neighbourhoodNamePrice} is more expensive`, tooltip: `${neighbourhoodNamePrice} is higher` }
        }
      case 'Price per sqm':
        const maxPsm = Math.max(...numericValues)
        const minPsm = Math.min(...numericValues)
        const psmDiffPercent = ((maxPsm - minPsm) / minPsm) * 100
        if (psmDiffPercent < 5) return { display: 'Similar unit prices', tooltip: 'Both have similar price per sqm' }
        const maxPsmIdx = numericValues.indexOf(maxPsm)
        const neighbourhoodNamePsm = comparisons[maxPsmIdx]?.name ? toTitleCase(comparisons[maxPsmIdx].name) : 'The former'
        if (psmDiffPercent > 30) {
          return { display: `${neighbourhoodNamePsm} has higher unit prices`, tooltip: `${neighbourhoodNamePsm} has substantially higher price per sqm` }
        } else if (psmDiffPercent > 15) {
          return { display: `${neighbourhoodNamePsm} has higher unit prices`, tooltip: `${neighbourhoodNamePsm} has clearly higher price per sqm` }
        } else {
          return { display: `${neighbourhoodNamePsm} has higher unit prices`, tooltip: `${neighbourhoodNamePsm} has higher price per sqm` }
        }
      
      case 'Median Lease (years)':
        const maxLease = Math.max(...numericValues)
        const minLease = Math.min(...numericValues)
        const leaseDiff = maxLease - minLease
        if (leaseDiff < 2) return { display: 'Similar remaining lease', tooltip: 'Both have similar remaining lease' }
        const maxLeaseIdx = numericValues.indexOf(maxLease)
        const neighbourhoodNameLease = comparisons[maxLeaseIdx]?.name ? toTitleCase(comparisons[maxLeaseIdx].name) : 'The former'
        if (leaseDiff > 10) {
          return { display: `${neighbourhoodNameLease} has a longer remaining lease`, tooltip: `${neighbourhoodNameLease} has substantially longer lease` }
        } else if (leaseDiff > 5) {
          return { display: `${neighbourhoodNameLease} has a longer remaining lease`, tooltip: `${neighbourhoodNameLease} has longer lease` }
        } else {
          return { display: `${neighbourhoodNameLease} has a longer remaining lease`, tooltip: `${neighbourhoodNameLease} has slightly longer lease` }
        }
      
      case 'MRT Stations':
        const maxStations = Math.max(...numericValues)
        const minStations = Math.min(...numericValues)
        if (maxStations === minStations) return { display: 'Similar MRT coverage', tooltip: 'Both have same number of MRT stations' }
        const maxStationsIdx = numericValues.indexOf(maxStations)
        const neighbourhoodNameStations = comparisons[maxStationsIdx]?.name ? toTitleCase(comparisons[maxStationsIdx].name) : 'The former'
        return { display: `${neighbourhoodNameStations} has more MRT stations`, tooltip: `${neighbourhoodNameStations} has better MRT coverage` }
      
      case 'Distance to MRT':
        const minDist = Math.min(...numericValues)
        const maxDist = Math.max(...numericValues)
        if (Math.abs(maxDist - minDist) < 100) return { display: 'Similar distance to MRT', tooltip: 'Both have similar distance to nearest MRT' }
        const minDistIdx = numericValues.indexOf(minDist)
        const neighbourhoodNameDist = comparisons[minDistIdx]?.name ? toTitleCase(comparisons[minDistIdx].name) : 'The former'
        const distDiffPercent = ((maxDist - minDist) / minDist) * 100
        if (distDiffPercent > 50) {
          return { display: `${neighbourhoodNameDist} is closer to MRT`, tooltip: `${neighbourhoodNameDist} is substantially closer to nearest MRT` }
        } else if (distDiffPercent > 20) {
          return { display: `${neighbourhoodNameDist} is closer to MRT`, tooltip: `${neighbourhoodNameDist} is closer to nearest MRT` }
        } else {
          return { display: `${neighbourhoodNameDist} is closer to MRT`, tooltip: `${neighbourhoodNameDist} is slightly closer to nearest MRT` }
        }
      
      case 'Transport Burden (TBI)':
        const minTbi = Math.min(...numericValues)
        const maxTbi = Math.max(...numericValues)
        if (Math.abs(maxTbi - minTbi) < 3) return { display: 'Similar transport burden', tooltip: 'Both have similar time burden for commuting' }
        const minTbiIdx = numericValues.indexOf(minTbi)
        const neighbourhoodNameTbi = comparisons[minTbiIdx]?.name ? toTitleCase(comparisons[minTbiIdx].name) : 'The former'
        const tbiDiff = maxTbi - minTbi
        if (tbiDiff > 15) {
          return { display: `${neighbourhoodNameTbi} has lower transport burden`, tooltip: `${neighbourhoodNameTbi} has substantially lower time burden` }
        } else if (tbiDiff > 8) {
          return { display: `${neighbourhoodNameTbi} has lower transport burden`, tooltip: `${neighbourhoodNameTbi} has lower time burden` }
        } else {
          return { display: `${neighbourhoodNameTbi} has lower transport burden`, tooltip: `${neighbourhoodNameTbi} has slightly lower time burden` }
        }
      
      default:
        return null
    }
  }

  const whoIsThisFor = generateWhoIsThisFor()

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Compare Neighbourhoods</h1>
          <p className="text-gray-600 mb-6">
            Select neighbourhoods to compare from the list page, or add IDs to the URL:
          </p>
          <code className="block bg-gray-100 p-3 rounded mb-6 text-sm">
            /compare?ids=neighbourhood-id-1,neighbourhood-id-2
          </code>
          <Link
            href="/neighbourhoods"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Neighbourhoods
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/neighbourhoods" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Neighbourhoods
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Neighbourhoods</h1>
              <p className="text-gray-600">Side-by-side comparison of {comparisons.length} neighbourhood{comparisons.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-4">
              <select
                value={flatType}
                onChange={(e) => setFlatType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="3 ROOM">3 ROOM</option>
                <option value="4 ROOM">4 ROOM</option>
                <option value="5 ROOM">5 ROOM</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
              </select>
              <select
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>
        </div>

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
            <p className="mt-2 text-gray-600">Loading comparison...</p>
          </div>
        )}

        {/* Comparison Table */}
        {!loading && !error && comparisons.length > 0 && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary Comparison</h2>
              <table className="responsive-table w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                    {comparisons.map((c, i) => (
                      <th key={`${c.id}-${i}`} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {toTitleCase(c.name)}
                        {c.planning_area && (
                          <div className="text-xs text-gray-400 mt-1">{toTitleCase(c.planning_area.name)}</div>
                        )}
                      </th>
                    ))}
                    {comparisons.length >= 2 && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conclusion</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Transactions (12m)</td>
                    {comparisons.map((c, idx) => {
                      const rawValues = comparisons.map(c => c.summary?.tx_12m ?? null)
                      const highlightIdx = getHighlightedCellIndex('Transactions (12m)', rawValues)
                      const shouldHighlight = highlightIdx === idx
                      return (
                        <td key={`${c.id}-${idx}`} className={`px-4 py-3 text-sm ${shouldHighlight ? 'text-gray-900 font-semibold' : 'text-gray-600 font-normal'}`}>
                          {c.summary?.tx_12m ? c.summary.tx_12m.toLocaleString() : 'N/A'}
                        </td>
                      )
                    })}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Transactions (12m)', comparisons.map(c => c.summary?.tx_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <span className="text-gray-700">{formatConclusionWithHighlight(verdict.display, comparisons)}</span>
                          ) : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Median Price</td>
                    {comparisons.map((c, idx) => {
                      const rawValues = comparisons.map(c => c.summary?.median_price_12m ?? null)
                      const highlightIdx = getHighlightedCellIndex('Median Price', rawValues)
                      const shouldHighlight = highlightIdx === idx
                      return (
                        <td key={`${c.id}-${idx}`} className={`px-4 py-3 text-sm ${shouldHighlight ? 'text-gray-900 font-semibold' : 'text-gray-600 font-normal'}`}>
                          {formatCurrency(c.summary?.median_price_12m ?? null)}
                        </td>
                      )
                    })}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Median Price', comparisons.map(c => c.summary?.median_price_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <span className="text-gray-700">{formatConclusionWithHighlight(verdict.display, comparisons)}</span>
                          ) : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Price per sqm</td>
                    {comparisons.map((c, idx) => (
                      <td key={`${c.id}-${idx}`} className="px-4 py-3 text-sm text-gray-600 font-normal">
                        {c.summary?.median_psm_12m ? `$${Math.round(c.summary.median_psm_12m).toLocaleString()}` : 'N/A'}
                      </td>
                    ))}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Price per sqm', comparisons.map(c => c.summary?.median_psm_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <span className="text-gray-700">{formatConclusionWithHighlight(verdict.display, comparisons)}</span>
                          ) : ''}
                        </td>
                      )
                    })()}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Lease safety</td>
                    {comparisons.map((c, idx) => {
                      const rawValues = comparisons.map(c => c.summary?.median_lease_years_12m ?? null)
                      const highlightIdx = getHighlightedCellIndex('Median Lease (years)', rawValues)
                      const shouldHighlight = highlightIdx === idx
                      return (
                        <td key={`${c.id}-${idx}`} className={`px-4 py-3 text-sm ${shouldHighlight ? 'text-gray-900 font-semibold' : 'text-gray-600 font-normal'}`}>
                          {c.summary?.median_lease_years_12m ? `${c.summary.median_lease_years_12m.toFixed(1)} years` : 'N/A'}
                        </td>
                      )
                    })}
                    {comparisons.length >= 2 && (() => {
                      const verdict = getMetricVerdict('Median Lease (years)', comparisons.map(c => c.summary?.median_lease_years_12m ?? null))
                      return (
                        <td className="px-4 py-3 text-sm">
                          {verdict ? (
                            <span className="text-gray-700">{formatConclusionWithHighlight(verdict.display, comparisons)}</span>
                          ) : ''}
                        </td>
                      )
                    })()}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Transport Accessibility */}
            {comparisons.length >= 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 overflow-x-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Transport accessibility
                </h2>
                <table className="responsive-table w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      {comparisons.map((c, i) => (
                        <th key={`${c.id}-${i}`} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {toTitleCase(c.name)}
                        </th>
                      ))}
                      {comparisons.length >= 2 && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conclusion</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">MRT</td>
                      {comparisons.map((c, idx) => {
                        const mrtInfo = getMRTAccessLabelForCard(c)
                        const hasAccess = mrtInfo.text !== 'None'
                        
                        return (
                          <td key={`${c.id}-mrt-${idx}`} className="px-4 py-3 text-sm">
                            {mrtInfo.isInArea ? (
                              <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                ✓ {mrtInfo.text}
                              </span>
                            ) : hasAccess ? (
                              <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                {mrtInfo.text}
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-500">
                                {mrtInfo.text}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      {comparisons.length >= 2 && (
                        <td className="px-4 py-3 text-sm text-gray-400">—</td>
                      )}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Transport Burden</td>
                      {comparisons.map((c, idx) => {
                        const tbiData = tbiDataMap.get(c.id)
                        const rawValues = comparisons.map(c => tbiDataMap.get(c.id)?.tbi ?? null)
                        const highlightIdx = getHighlightedCellIndex('Transport Burden (TBI)', rawValues)
                        const shouldHighlight = highlightIdx === idx
                        
                        if (!tbiData) {
                          return (
                            <td key={`${c.id}-tbi-${idx}`} className="px-4 py-3 text-sm text-gray-400">
                              N/A
                            </td>
                          )
                        }
                        
                        return (
                          <td key={`${c.id}-tbi-${idx}`} className={`px-4 py-3 text-sm ${shouldHighlight ? 'text-gray-900 font-semibold' : 'text-gray-600 font-normal'}`}>
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold">{tbiData.label}</span>
                              <span className="text-xs text-gray-500">TBI {tbiData.tbi} / 100</span>
                            </div>
                          </td>
                        )
                      })}
                      {comparisons.length >= 2 && (() => {
                        const verdict = getMetricVerdict('Transport Burden (TBI)', comparisons.map(c => tbiDataMap.get(c.id)?.tbi ?? null))
                        return (
                          <td className="px-4 py-3 text-sm">
                            {verdict ? (
                              <span className="text-gray-700">{formatConclusionWithHighlight(verdict.display, comparisons)}</span>
                            ) : ''}
                          </td>
                        )
                      })()}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Living Comfort */}
            {comparisons.length >= 2 && (() => {
              const livingNotesArray = comparisons.map(c => livingNotesMap.get(c.id) || null)
              const hasAnyNotes = livingNotesArray.some(notes => notes !== null)
              
              if (!hasAnyNotes) return null
              
              function getRatingMeta(rating: LivingRating): { label: string; className: string } {
                if (rating === 'good') {
                  return {
                    label: '✓',
                    className: 'border-green-200 bg-green-50 text-green-800',
                  }
                }
                if (rating === 'bad') {
                  return {
                    label: '✗',
                    className: 'border-red-200 bg-red-50 text-red-800',
                  }
                }
                return {
                  label: '?',
                  className: 'border-amber-200 bg-amber-50 text-amber-800',
                }
              }
              
              // Helper to capitalize first letter of a string
              function capitalizeFirst(str: string): string {
                if (!str) return str
                return str.charAt(0).toUpperCase() + str.slice(1)
              }
              
              // Helper to format description with line breaks for better scanability
              function formatDescription(note: string): ReactElement {
                // Split at semicolons first (natural break points)
                if (note.includes(';')) {
                  const parts = note.split(';').map(s => s.trim()).filter(Boolean)
                  if (parts.length > 1) {
                    return (
                      <>
                        {capitalizeFirst(parts[0])}.
                        {parts.slice(1).map((part, idx) => {
                          const capitalized = capitalizeFirst(part)
                          return (
                            <span key={idx}>
                              <br />
                              {capitalized}{capitalized.endsWith('.') ? '' : '.'}
                            </span>
                          )
                        })}
                      </>
                    )
                  }
                }
                
                // If no semicolons, try splitting at first period if text is long enough
                const firstPeriodIndex = note.indexOf('.')
                if (firstPeriodIndex > 0 && firstPeriodIndex < note.length - 10) {
                  const firstPart = note.substring(0, firstPeriodIndex + 1).trim()
                  const restPart = note.substring(firstPeriodIndex + 1).trim()
                  if (restPart) {
                    return (
                      <>
                        {capitalizeFirst(firstPart)}
                        <br />
                        {capitalizeFirst(restPart)}
                      </>
                    )
                  }
                }
                
                // No suitable break point, return as is (capitalized)
                return <>{capitalizeFirst(note)}</>
              }
              
              const dimensions = [
                { key: 'noiseDensity', label: 'Noise & density' },
                { key: 'dailyConvenience', label: 'Daily convenience' },
                { key: 'greenOutdoor', label: 'Green & outdoors' },
                { key: 'crowdVibe', label: 'Crowd & vibe' },
                { key: 'longTermComfort', label: 'Long-term comfort' },
              ] as const
              
              return (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 overflow-x-auto">
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-900">Living comfort</h2>
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                          <div className="font-semibold mb-2">How to read Living Comfort</div>
                          <div className="space-y-1.5">
                            <div><span className="font-medium text-green-400">✓</span> — Works well for most households with minimal trade-offs.</div>
                            <div><span className="font-medium text-amber-400">?</span> — Clear trade-offs exist. Comfort varies significantly by block location, road exposure, or lifestyle preferences.</div>
                            <div><span className="font-medium text-red-400">×</span> — Structural factors make comfortable long-term residential living difficult for most households.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <table className="responsive-table w-auto divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Dimension</th>
                        {comparisons.map((c, i) => (
                          <th key={`${c.id}-${i}`} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-auto">
                            {toTitleCase(c.name)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dimensions.map(dim => (
                        <tr key={dim.key}>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900 w-[120px]">{dim.label}</td>
                          {comparisons.map((c, idx) => {
                            const notes = livingNotesArray[idx]
                            const dimension = notes?.[dim.key]
                            
                            if (!dimension) {
                              return (
                                <td key={`${c.id}-${dim.key}-${idx}`} className="px-6 py-3 text-sm text-gray-400 w-auto">
                                  —
                                </td>
                              )
                            }
                            
                            const ratingMeta = getRatingMeta(dimension.rating)
                            
                            return (
                              <td key={`${c.id}-${dim.key}-${idx}`} className="px-6 py-3 text-sm w-auto">
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border flex-shrink-0 ${ratingMeta.className}`}>
                                    {ratingMeta.label}
                                  </span>
                                  <div className="text-sm text-gray-600 leading-relaxed">
                                    {formatDescription(dimension.note)}
                                  </div>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {/* If you are this type of buyer */}
            {whoIsThisFor.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">If you are this type of buyer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {whoIsThisFor.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">{toTitleCase(item.name)}</h3>
                      {item.pros.length > 0 && (
                        <div className="mb-3">
                          {item.pros.map((pro, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1.5">
                              <span className="text-green-600 mt-0.5 font-semibold">✔</span>
                              <span>{pro}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.cons.length > 0 && (
                        <div className="mb-3">
                          {item.cons.map((con, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1.5">
                              <span className="text-red-600 mt-0.5 font-semibold">✖</span>
                              <span>{con}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/neighbourhood/${item.id}/`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 pt-3 border-t border-gray-200"
                      >
                        View details →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next dimension: School considerations */}
            {comparisons.length >= 2 && (() => {
              const planningAreas = comparisons
                .map(c => c.planning_area)
                .filter((pa): pa is { id: string; name: string } => pa !== null && pa !== undefined)
              
              const uniquePlanningAreas = planningAreas.filter((pa, index, self) => 
                self.findIndex(p => p.id === pa.id) === index
              )
              
              if (uniquePlanningAreas.length < 2) {
                // If same planning area, still show link but to single area
                if (uniquePlanningAreas.length === 1) {
                  return (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8">
                      <p className="text-sm text-gray-700 mb-2">
                        Next step: Consider school pressure at the planning area level
                      </p>
                      <Link
                        href={`/family/psle-school?planning_area_id=${uniquePlanningAreas[0].id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Compare school pressure →
                      </Link>
                    </div>
                  )
                }
                return null
              }
              
              const compareUrl = `/family/psle-school?compare=${uniquePlanningAreas.slice(0, 2).map(pa => pa.name).join(',')}`
              
              return (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8">
                  <p className="text-sm text-gray-700 mb-2">
                    Next step: Consider school pressure at the planning area level
                  </p>
                  <Link
                    href={compareUrl}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Compare school pressure →
                  </Link>
                </div>
              )
            })()}

            {/* Feedback Form */}
            <FeedbackForm
              context="compare"
              question="Which side are you leaning towards now? Why? (Optional)"
              placeholder="My situation is..."
              metadata={ids.length > 0 ? { neighbourhood_ids: ids } : undefined}
              className="mt-8"
            />
          </>
        )}

        {/* Floating Button - Ask the builder */}
        {comparisons.length >= 2 && (
          <FloatingButton
            context={{
              page: 'Compare Neighbourhoods',
              comparing_neighbourhoods: comparisons.map(c => toTitleCase(c.name)).join(', '),
              neighbourhood_ids: ids,
              flat_type: flatType,
              months: months
            }}
            triggerAfterScroll={true}
            scrollThreshold={200}
          />
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}

