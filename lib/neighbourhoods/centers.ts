/**
 * Center point calculation for neighbourhoods
 */

import type { NeighbourhoodRawData, CenterPoint } from './types'
import { fetchLocationData, fetchNeighbourhoodsWithCenters } from './fetch'

export async function calculateCenterPoints(
  neighbourhoodsData: NeighbourhoodRawData[],
  neighbourhoodIds: string[]
): Promise<Map<string, CenterPoint>> {
  const centerPointsMap = new Map<string, CenterPoint>()
  
  // First, use centers from database if available
  neighbourhoodsData.forEach(n => {
    if (n.center) {
      try {
        const center = typeof n.center === 'string' ? JSON.parse(n.center) : n.center
        if (center?.lat && center?.lng) {
          centerPointsMap.set(n.id, { lat: center.lat, lng: center.lng })
        }
      } catch (e) {
        console.error('Error parsing center for neighbourhood', n.id, ':', e)
      }
    }
  })
  
  console.log('Centers from database:', {
    count: centerPointsMap.size,
    sample: Array.from(centerPointsMap.entries()).slice(0, 3)
  })
  
  // For neighbourhoods without database center, try to calculate from raw_resale_2017
  const neighbourhoodsNeedingCenter = neighbourhoodIds.filter(id => !centerPointsMap.has(id))
  if (neighbourhoodsNeedingCenter.length > 0) {
    console.log('Calculating centers for', neighbourhoodsNeedingCenter.length, 'neighbourhoods from transaction data')
    
    const locationData = await fetchLocationData(neighbourhoodsNeedingCenter)
    
    if (locationData && locationData.length > 0) {
      const locationMap = new Map<string, { lats: number[]; lngs: number[] }>()
      let skippedCount = 0
      
      locationData.forEach(item => {
        if (item.neighbourhood_id && item.latitude != null && item.longitude != null) {
          const lat = Number(item.latitude)
          const lng = Number(item.longitude)
          // More lenient coordinate validation - Singapore bounds approximately
          if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lat < 2 && lng > 100 && lng < 110) {
            if (!locationMap.has(item.neighbourhood_id)) {
              locationMap.set(item.neighbourhood_id, { lats: [], lngs: [] })
            }
            const loc = locationMap.get(item.neighbourhood_id)!
            loc.lats.push(lat)
            loc.lngs.push(lng)
          } else {
            skippedCount++
          }
        }
      })
      
      if (skippedCount > 0) {
        console.log(`Skipped ${skippedCount} records due to coordinate validation`)
      }
      
      // Calculate average center for each neighbourhood
      locationMap.forEach((loc, nbhdId) => {
        if (loc.lats.length > 0 && loc.lngs.length > 0) {
          const avgLat = loc.lats.reduce((sum, val) => sum + val, 0) / loc.lats.length
          const avgLng = loc.lngs.reduce((sum, val) => sum + val, 0) / loc.lngs.length
          centerPointsMap.set(nbhdId, { lat: avgLat, lng: avgLng })
        }
      })
    }
  }
  
  // Also try to extract from bbox if available
  neighbourhoodsData.forEach(n => {
    if (!centerPointsMap.has(n.id) && n.bbox) {
      const center = extractCenterFromBbox(n.bbox)
      if (center) {
        centerPointsMap.set(n.id, center)
      }
    }
  })
  
  // If we're still missing centers, try alternative query
  const stillMissingIds = neighbourhoodIds.filter(id => !centerPointsMap.has(id))
  if (stillMissingIds.length > 0) {
    console.log(`Missing centers for ${stillMissingIds.length} neighbourhoods, trying alternative query...`)
    
    const altLocationData = await fetchLocationData(stillMissingIds)
    
    if (altLocationData && altLocationData.length > 0) {
      const locationMap = new Map<string, { lats: number[]; lngs: number[] }>()
      
      altLocationData.forEach(item => {
        if (item.neighbourhood_id && item.latitude != null && item.longitude != null) {
          const lat = Number(item.latitude)
          const lng = Number(item.longitude)
          if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lat < 2 && lng > 100 && lng < 110) {
            if (!locationMap.has(item.neighbourhood_id)) {
              locationMap.set(item.neighbourhood_id, { lats: [], lngs: [] })
            }
            locationMap.get(item.neighbourhood_id)!.lats.push(lat)
            locationMap.get(item.neighbourhood_id)!.lngs.push(lng)
          }
        }
      })
      
      locationMap.forEach((loc, nbhdId) => {
        if (loc.lats.length > 0 && loc.lngs.length > 0 && !centerPointsMap.has(nbhdId)) {
          const avgLat = loc.lats.reduce((sum, val) => sum + val, 0) / loc.lats.length
          const avgLng = loc.lngs.reduce((sum, val) => sum + val, 0) / loc.lngs.length
          centerPointsMap.set(nbhdId, { lat: avgLat, lng: avgLng })
        }
      })
    }
  }
  
  console.log('Center points map:', { 
    size: centerPointsMap.size, 
    total: neighbourhoodIds.length,
    missingCount: neighbourhoodIds.filter(id => !centerPointsMap.has(id)).length
  })
  
  return centerPointsMap
}

export function extractCenterFromBbox(bbox: any): CenterPoint | null {
  let minLng: number, minLat: number, maxLng: number, maxLat: number
  
  // Handle different bbox formats
  if (Array.isArray(bbox) && bbox.length >= 4) {
    [minLng, minLat, maxLng, maxLat] = bbox
  } else if (typeof bbox === 'object' && bbox !== null) {
    try {
      const parsed = typeof bbox === 'string' ? JSON.parse(bbox) : bbox
      if (Array.isArray(parsed) && parsed.length >= 4) {
        [minLng, minLat, maxLng, maxLat] = parsed
      } else if (parsed.minLng !== undefined && parsed.minLat !== undefined && 
                 parsed.maxLng !== undefined && parsed.maxLat !== undefined) {
        minLng = parsed.minLng
        minLat = parsed.minLat
        maxLng = parsed.maxLng
        maxLat = parsed.maxLat
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  } else {
    return null
  }
  
  // Validate coordinates
  if (typeof minLng === 'number' && typeof minLat === 'number' && 
      typeof maxLng === 'number' && typeof maxLat === 'number' &&
      !isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    }
  }
  
  return null
}

