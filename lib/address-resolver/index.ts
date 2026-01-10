/**
 * Main Address Resolver
 * Unified entry point for address resolution
 */

import { ResolvedAddress, Confidence, Source } from './types'
import { normalizeInput, classifyInput } from './classifier'
import { geocodeInput } from './geocoding'
import { findSubzoneByPoint, getPlanningAreaName } from './subzone-mapper'
import { calculateConfidence, getConfidenceMessage } from './confidence'
import { getCachedQuery, setCachedQuery, clearExpiredCache } from './cache'

/**
 * Main resolve function
 * Steps:
 * 1. Check cache
 * 2. Classify input
 * 3. Geocode to coordinates
 * 4. Map coordinates to subzone
 * 5. Calculate confidence
 * 6. Cache result
 */
export async function resolveAddress(query: string): Promise<ResolvedAddress | null> {
  if (!query || !query.trim()) {
    return null
  }

  // Clean up expired cache entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    clearExpiredCache()
  }

  const rawQuery = query.trim()
  const normalizedQuery = normalizeInput(query)
  
  // Step 0: Check cache first
  const cached = getCachedQuery(normalizedQuery)
  if (cached) {
    console.log('[Address Resolver] Cache hit for query:', normalizedQuery)
    return cached
  }

  // Step 1: Classify input
  const inputType = classifyInput(rawQuery)
  console.log('[Address Resolver] Input type:', inputType, 'for query:', rawQuery)

  // Step 2: Geocode input to coordinates
  const geocodeResult = await geocodeInput(rawQuery)
  if (!geocodeResult) {
    console.log('[Address Resolver] Geocoding failed for query:', rawQuery)
    return null
  }

  console.log('[Address Resolver] Geocoded to:', geocodeResult.lat, geocodeResult.lng, 'address:', geocodeResult.address)

  // Step 3: Map coordinates to subzone
  const subzone = await findSubzoneByPoint(geocodeResult.lat, geocodeResult.lng)
  if (!subzone) {
    console.log('[Address Resolver] Subzone mapping failed for coordinates:', geocodeResult.lat, geocodeResult.lng)
    return null
  }

  console.log('[Address Resolver] Mapped to subzone:', subzone.name, subzone.id)

  // Step 4: Get planning area name
  const planningAreaName = subzone.planning_area_id 
    ? await getPlanningAreaName(subzone.planning_area_id)
    : null

  // Step 5: Calculate confidence
  const confidence = calculateConfidence({
    source: geocodeResult.source,
    candidates: geocodeResult.candidates,
    postal: geocodeResult.postal
  })

  // Build source chain
  const sourceChain: Source[] = [...geocodeResult.source, 'subzone']

  // Step 6: Build result
  const result: ResolvedAddress = {
    resolved_address: geocodeResult.address,
    postal: geocodeResult.postal,
    latlng: {
      lat: geocodeResult.lat,
      lng: geocodeResult.lng
    },
    subzone_id: subzone.id,
    subzone_name: subzone.name,
    planning_area_id: subzone.planning_area_id || undefined,
    planning_area_name: planningAreaName || undefined,
    confidence,
    source_chain: sourceChain,
    candidates: geocodeResult.candidates?.map(c => ({
      ...c,
      subzone_id: undefined, // Candidates don't have subzone yet
      subzone_name: undefined
    })),
    raw_query: rawQuery,
    normalized_query: normalizedQuery
  }

  // Step 7: Cache result
  setCachedQuery(normalizedQuery, result)

  return result
}

/**
 * Resolve multiple candidates (for Low confidence cases)
 */
export async function resolveAddressCandidates(
  query: string,
  candidateIndex: number
): Promise<ResolvedAddress | null> {
  const normalizedQuery = normalizeInput(query)
  
  // First, get the geocoding result to access candidates
  const geocodeResult = await geocodeInput(query)
  if (!geocodeResult || !geocodeResult.candidates || geocodeResult.candidates.length === 0) {
    return null
  }

  const candidate = geocodeResult.candidates[candidateIndex]
  if (!candidate) {
    return null
  }

  // Map candidate coordinates to subzone
  const subzone = await findSubzoneByPoint(candidate.latlng.lat, candidate.latlng.lng)
  if (!subzone) {
    return null
  }

  const planningAreaName = subzone.planning_area_id 
    ? await getPlanningAreaName(subzone.planning_area_id)
    : null

  const result: ResolvedAddress = {
    resolved_address: candidate.address,
    postal: candidate.postal,
    latlng: candidate.latlng,
    subzone_id: subzone.id,
    subzone_name: subzone.name,
    planning_area_id: subzone.planning_area_id || undefined,
    planning_area_name: planningAreaName || undefined,
    confidence: 'High', // Selected candidate is High confidence
    source_chain: ['onemap', 'subzone'],
    raw_query: query,
    normalized_query: normalizedQuery
  }

  // Cache the selected candidate result
  setCachedQuery(`${normalizedQuery}:candidate:${candidateIndex}`, result)

  return result
}
