/**
 * MRT station mapping for neighbourhoods
 */

import { fetchMrtStationsInArea, fetchAllMrtStations, fetchNeighbourhoodsWithCenters } from './fetch'
import { extractCenterFromBbox } from './centers'

export async function buildMrtStationsMap(
  neighbourhoodIds: string[]
): Promise<Map<string, string[]>> {
  const mrtStationsMap = new Map<string, string[]>()
  
  // First, get stations within neighbourhoods (in area)
  const mrtStationsInArea = await fetchMrtStationsInArea(neighbourhoodIds)
  
  console.log('MRT stations in area:', { 
    count: mrtStationsInArea.length, 
    sample: mrtStationsInArea.slice(0, 3) 
  })
  
  // Add stations in area
  mrtStationsInArea.forEach(station => {
    if (station.neighbourhood_id && station.station_code) {
      if (!mrtStationsMap.has(station.neighbourhood_id)) {
        mrtStationsMap.set(station.neighbourhood_id, [])
      }
      mrtStationsMap.get(station.neighbourhood_id)!.push(station.station_code)
    }
  })
  
  console.log('MRT stations map (in area):', { 
    size: mrtStationsMap.size, 
    sample: Array.from(mrtStationsMap.entries()).slice(0, 3) 
  })
  
  // For neighbourhoods without stations in area, find nearest station
  const neighbourhoodsWithoutStations = neighbourhoodIds.filter(id => {
    return !mrtStationsMap.has(id) || mrtStationsMap.get(id)!.length === 0
  })
  
  if (neighbourhoodsWithoutStations.length > 0) {
    const neighbourhoodsWithCenters = await fetchNeighbourhoodsWithCenters(neighbourhoodsWithoutStations)
    const allMrtStations = await fetchAllMrtStations()
    
    if (neighbourhoodsWithCenters.length > 0 && allMrtStations.length > 0) {
      // For each neighbourhood, find nearest station using Haversine formula
      for (const n of neighbourhoodsWithCenters) {
        const center = getNeighbourhoodCenter(n)
        if (!center) continue
        
        const nearestStation = findNearestStation(center, allMrtStations)
        
        if (nearestStation) {
          if (!mrtStationsMap.has(n.id)) {
            mrtStationsMap.set(n.id, [])
          }
          mrtStationsMap.get(n.id)!.push(nearestStation.station_code)
        }
      }
    }
  }
  
  return mrtStationsMap
}

function getNeighbourhoodCenter(n: any): { lat: number; lng: number } | null {
  // Try to get coordinates from center first
  if (n.center) {
    try {
      const center = typeof n.center === 'string' ? JSON.parse(n.center) : n.center
      if (center?.lat && center?.lng) {
        return { lat: center.lat, lng: center.lng }
      }
    } catch (e) {
      // Continue to bbox fallback
    }
  }
  
  // Fallback to bbox center if center is not available
  if (n.bbox) {
    return extractCenterFromBbox(n.bbox)
  }
  
  return null
}

function findNearestStation(
  point: { lat: number; lng: number },
  stations: any[]
): { station_code: string; distance: number } | null {
  let nearestStation: { station_code: string; distance: number } | null = null
  
  for (const station of stations) {
    if (!station.latitude || !station.longitude) continue
    
    const distance = haversineDistance(
      point.lat,
      point.lng,
      Number(station.latitude),
      Number(station.longitude)
    )
    
    if (!nearestStation || distance < nearestStation.distance) {
      nearestStation = { station_code: station.station_code, distance }
    }
  }
  
  return nearestStation
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // Earth radius in meters
  const lat1Rad = lat1 * Math.PI / 180
  const lat2Rad = lat2 * Math.PI / 180
  const deltaLat = (lat2 - lat1) * Math.PI / 180
  const deltaLng = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
           Math.cos(lat1Rad) * Math.cos(lat2Rad) *
           Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

