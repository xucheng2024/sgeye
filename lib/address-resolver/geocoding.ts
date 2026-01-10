/**
 * Step A: Geocoding - Convert input to coordinates/standard address
 * Priority: Postal → OneMap → Project Resolver
 */

import { OneMapResponse, OneMapResult, AddressCandidate, Source } from './types'
import { normalizeInput, extractPostalCode, cleanStreetName } from './classifier'

const ONEMAP_API_BASE = 'https://www.onemap.gov.sg/api/common/elastic/search'

/**
 * Geocode postal code using OneMap
 */
export async function geocodePostalCode(postalCode: string): Promise<{
  lat: number
  lng: number
  address: string
  result: OneMapResult
} | null> {
  try {
    const normalizedPostal = postalCode.replace(/\s+/g, '')
    if (!/^\d{6}$/.test(normalizedPostal)) {
      return null
    }

    const response = await fetch(
      `${ONEMAP_API_BASE}?searchVal=${encodeURIComponent(normalizedPostal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    )
    
    if (!response.ok) {
      console.error('[Geocoding] OneMap API error:', response.status, response.statusText)
      return null
    }
    
    const data: OneMapResponse = await response.json()
    
    if (data.found === 0 || !data.results || data.results.length === 0) {
      return null
    }
    
    const result = data.results[0]
    const lat = parseFloat(result.LATITUDE)
    const lng = parseFloat(result.LONGITUDE || result.LONGTITUDE || '0')
    
    if (isNaN(lat) || isNaN(lng)) {
      return null
    }
    
    return {
      lat,
      lng,
      address: result.ADDRESS || result.SEARCHVAL,
      result
    }
  } catch (error) {
    console.error('[Geocoding] Error geocoding postal code:', error)
    return null
  }
}

/**
 * Geocode address using OneMap (allows fuzzy matching)
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number
  lng: number
  address: string
  postal?: string
  candidates: AddressCandidate[]
  result: OneMapResult
} | null> {
  try {
    const normalized = normalizeInput(address)
    const cleaned = cleanStreetName(normalized)
    
    const response = await fetch(
      `${ONEMAP_API_BASE}?searchVal=${encodeURIComponent(normalized)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    )
    
    if (!response.ok) {
      console.error('[Geocoding] OneMap API error:', response.status, response.statusText)
      return null
    }
    
    const data: OneMapResponse = await response.json()
    
    if (data.found === 0 || !data.results || data.results.length === 0) {
      return null
    }
    
    // Filter results within Singapore (lat: 1.2-1.5, lng: 103.6-104.0)
    const singaporeResults = data.results.filter(r => {
      const lat = parseFloat(r.LATITUDE)
      const lng = parseFloat(r.LONGITUDE || r.LONGTITUDE || '0')
      return lat >= 1.2 && lat <= 1.5 && lng >= 103.6 && lng <= 104.0
    })
    
    if (singaporeResults.length === 0) {
      return null
    }
    
    // Score results by similarity (simple match on address/road name)
    const scoredResults = singaporeResults.map(r => {
      const lat = parseFloat(r.LATITUDE)
      const lng = parseFloat(r.LONGITUDE || r.LONGTITUDE || '0')
      const address = r.ADDRESS || r.SEARCHVAL || ''
      const roadName = r.ROAD_NAME || ''
      
      // Simple scoring: exact match = 100, partial match = 50, etc.
      let score = 0
      const lowerQuery = cleaned.toLowerCase()
      const lowerAddress = address.toLowerCase()
      const lowerRoad = roadName.toLowerCase()
      
      if (lowerAddress.includes(lowerQuery) || lowerQuery.includes(lowerAddress)) {
        score = 100
      } else if (lowerRoad.includes(lowerQuery) || lowerQuery.includes(lowerRoad)) {
        score = 80
      } else {
        // Partial match
        const queryWords = lowerQuery.split(/\s+/)
        const addressWords = lowerAddress.split(/\s+/)
        const matchingWords = queryWords.filter(qw => addressWords.some(aw => aw.includes(qw) || qw.includes(aw)))
        score = (matchingWords.length / queryWords.length) * 50
      }
      
      return { ...r, score, lat, lng, address }
    })
    
    // Sort by score descending
    scoredResults.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    const topResult = scoredResults[0]
    if (!topResult || isNaN(topResult.lat) || isNaN(topResult.lng)) {
      return null
    }
    
    // Build candidates list
    const candidates: AddressCandidate[] = scoredResults.slice(0, 5).map(r => ({
      address: r.address,
      postal: r.POSTAL || undefined,
      latlng: { lat: r.lat, lng: r.lng },
      score: r.score
    }))
    
    return {
      lat: topResult.lat,
      lng: topResult.lng,
      address: topResult.address,
      postal: topResult.POSTAL || undefined,
      candidates: candidates.slice(1), // Exclude top result from candidates
      result: topResult
    }
  } catch (error) {
    console.error('[Geocoding] Error geocoding address:', error)
    return null
  }
}

/**
 * Geocode project/POI name (placeholder - can be extended with Google Places or project database)
 */
export async function geocodeProject(projectName: string): Promise<{
  lat: number
  lng: number
  address: string
  postal?: string
  source: 'onemap' | 'project' | 'google'
} | null> {
  // Try OneMap first as fallback
  const onemapResult = await geocodeAddress(projectName)
  if (onemapResult) {
    return {
      lat: onemapResult.lat,
      lng: onemapResult.lng,
      address: onemapResult.address,
      postal: onemapResult.postal,
      source: 'onemap'
    }
  }
  
  // TODO: Implement Google Places API or project database lookup
  // For now, return null if OneMap fails
  return null
}

/**
 * Main geocoding function - tries all methods in priority order
 */
export async function geocodeInput(query: string): Promise<{
  lat: number
  lng: number
  address: string
  postal?: string
  candidates?: AddressCandidate[]
  source: Source[]
  result?: OneMapResult
} | null> {
  const normalized = normalizeInput(query)
  
  // A1. Try postal code first
  const postal = extractPostalCode(query)
  if (postal) {
    const postalResult = await geocodePostalCode(postal)
    if (postalResult) {
      return {
        lat: postalResult.lat,
        lng: postalResult.lng,
        address: postalResult.address,
        postal: postal,
        source: ['postal', 'onemap'],
        result: postalResult.result
      }
    }
  }
  
  // A2. Try address geocoding (allows fuzzy matching)
  const addressResult = await geocodeAddress(query)
  if (addressResult) {
    return {
      lat: addressResult.lat,
      lng: addressResult.lng,
      address: addressResult.address,
      postal: addressResult.postal,
      candidates: addressResult.candidates,
      source: ['onemap'],
      result: addressResult.result
    }
  }
  
  // A3. Try project/POI (fallback to OneMap)
  const projectResult = await geocodeProject(query)
  if (projectResult) {
    return {
      lat: projectResult.lat,
      lng: projectResult.lng,
      address: projectResult.address,
      postal: projectResult.postal,
      source: projectResult.source === 'onemap' ? ['onemap'] : ['project', 'onemap']
    }
  }
  
  return null
}
