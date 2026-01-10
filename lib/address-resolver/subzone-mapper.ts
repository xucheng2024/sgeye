/**
 * Step B: Coordinate to Subzone (Neighbourhood) Mapping
 * Uses URA Subzone polygon (PostGIS) - most stable and controllable
 */

import { supabase } from '@/lib/supabase'
import { SubzoneData, Source } from './types'

/**
 * Find subzone by point using PostGIS (most accurate)
 */
export async function findSubzoneByPoint(lat: number, lng: number): Promise<SubzoneData | null> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  // Try using PostGIS function first (most accurate)
  try {
    const { data: pgisResult, error: pgisError } = await supabase
      .rpc('find_subzone_by_point', {
        p_lat: lat,
        p_lng: lng
      })

    if (!pgisError && pgisResult && pgisResult.length > 0) {
      const result = pgisResult[0]
      return {
        id: result.id || result.subzone_id,
        name: result.name || result.subzone_name,
        planning_area_id: result.planning_area_id || result.planning_area_id,
        region: result.region
      }
    }
  } catch (error) {
    console.error('[Subzone Mapper] PostGIS RPC error:', error)
    // Continue to fallback method
  }

  // Fallback: Use bounding box filtering
  const { data: subzones, error: subzoneError } = await supabase
    .from('subzones')
    .select('id, name, planning_area_id, region, bbox')
    .limit(1000)

  if (subzoneError) {
    console.error('[Subzone Mapper] Error fetching subzones:', subzoneError)
    throw subzoneError
  }

  if (!subzones || subzones.length === 0) {
    return null
  }

  // Filter by bounding box (fast pre-filter)
  const candidates = subzones.filter(sz => {
    if (!sz.bbox) return false
    try {
      const bbox = typeof sz.bbox === 'string' ? JSON.parse(sz.bbox) : sz.bbox
      const { minLat, maxLat, minLng, maxLng } = bbox as { minLat: number; maxLat: number; minLng: number; maxLng: number }
      return lat >= minLat && lat <= maxLat && 
             lng >= minLng && lng <= maxLng
    } catch {
      return false
    }
  })

  if (candidates.length === 0) {
    return null
  }

  // If only one candidate, return it
  if (candidates.length === 1) {
    return {
      id: candidates[0].id,
      name: candidates[0].name,
      planning_area_id: candidates[0].planning_area_id || '',
      region: candidates[0].region
    }
  }

  // For multiple candidates, try PostGIS check on each
  for (const candidate of candidates) {
    try {
      const { data: checkResult, error: checkError } = await supabase
        .rpc('check_point_in_subzone', {
          subzone_id: candidate.id,
          p_lat: lat,
          p_lng: lng
        })

      if (!checkError && checkResult && checkResult.length > 0 && checkResult[0].contains) {
        return {
          id: candidate.id,
          name: candidate.name,
          planning_area_id: candidate.planning_area_id || '',
          region: candidate.region
        }
      }
    } catch (error) {
      // Continue to next candidate
      continue
    }
  }

  // Fallback: return first candidate if PostGIS checks fail
  return {
    id: candidates[0].id,
    name: candidates[0].name,
    planning_area_id: candidates[0].planning_area_id || '',
    region: candidates[0].region
  }
}

/**
 * Get planning area name by ID
 */
export async function getPlanningAreaName(planningAreaId: string): Promise<string | null> {
  if (!supabase || !planningAreaId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('planning_areas')
      .select('name')
      .eq('id', planningAreaId)
      .single()

    if (error || !data) {
      return null
    }

    return data.name
  } catch (error) {
    console.error('[Subzone Mapper] Error fetching planning area:', error)
    return null
  }
}
