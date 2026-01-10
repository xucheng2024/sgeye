/**
 * API Route: Search Subzones by Postal Code or Street Name
 * 
 * POST /api/subzones/search
 * Body: { type: 'postal' | 'street', query: string }
 * 
 * For postal code: Uses OneMap API to geocode, then finds subzone using PostGIS
 * For street name: Finds coordinates from raw_resale_2017, then finds subzone
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface OneMapResponse {
  found: number
  totalNumPages: number
  pageNum: number
  results: Array<{
    SEARCHVAL: string
    BLK_NO: string
    ROAD_NAME: string
    BUILDING: string
    ADDRESS: string
    POSTAL: string
    X: string
    Y: string
    LATITUDE: string
    LONGITUDE: string
    LONGTITUDE: string
  }>
}

async function geocodePostalCode(postalCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    )
    
    if (!response.ok) {
      console.error('OneMap API error:', response.status, response.statusText)
      return null
    }
    
    const data: OneMapResponse = await response.json()
    
    if (data.found === 0 || !data.results || data.results.length === 0) {
      return null
    }
    
    const result = data.results[0]
    const lat = parseFloat(result.LATITUDE)
    const lng = parseFloat(result.LONGITUDE || result.LONGTITUDE)
    
    if (isNaN(lat) || isNaN(lng)) {
      return null
    }
    
    return { lat, lng }
  } catch (error) {
    console.error('Error geocoding postal code:', error)
    return null
  }
}

async function findSubzoneByPoint(lat: number, lng: number) {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  // Try using the PostGIS function first (more accurate)
  const { data: pgisResult, error: pgisError } = await supabase
    .rpc('find_subzone_by_point', {
      p_lat: lat,
      p_lng: lng
    })

  if (!pgisError && pgisResult && pgisResult.length > 0) {
    return pgisResult[0]
  }

  // Fallback: Use bounding box filtering (works if PostGIS function doesn't exist)
  const { data: subzones, error: subzoneError } = await supabase
    .from('subzones')
    .select('id, name, planning_area_id, region, bbox')
    .limit(1000)

  if (subzoneError) {
    throw subzoneError
  }

  if (!subzones || subzones.length === 0) {
    return null
  }

  // Filter by bounding box (fast pre-filter)
  const candidates = subzones.filter(sz => {
    if (!sz.bbox) return false
    const bbox = sz.bbox as { minLat: number; maxLat: number; minLng: number; maxLng: number }
    return lat >= bbox.minLat && lat <= bbox.maxLat && 
           lng >= bbox.minLng && lng <= bbox.maxLng
  })

  if (candidates.length === 0) {
    return null
  }

  // If only one candidate, return it
  if (candidates.length === 1) {
    return candidates[0]
  }

  // For multiple candidates, try PostGIS check on each
  // This is more accurate than just returning the first candidate
  for (const candidate of candidates) {
    const { data: checkResult, error: checkError } = await supabase
      .rpc('check_point_in_subzone', {
        subzone_id: candidate.id,
        p_lat: lat,
        p_lng: lng
      })

    if (!checkError && checkResult && checkResult.length > 0 && checkResult[0].contains) {
      return candidate
    }
  }

  // Fallback: return first candidate if PostGIS checks fail
  return candidates[0]
}

async function findSubzoneByStreetName(streetName: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  // Clean the input: remove house numbers if present (e.g., "38 Lorong 30 Geylang" -> "Lorong 30 Geylang")
  // House numbers are typically 1-4 digits followed by letters/space
  const cleanedStreet = streetName.trim().replace(/^\d+[A-Z]?\s+/i, '')

  console.log(`[Street Search] Original: "${streetName}", Cleaned: "${cleanedStreet}"`)

  // Try exact match first, then fallback to partial match
  let transactions = null
  let error = null

  // Try 1: Exact cleaned street name
  const exactResult = await supabase
    .from('raw_resale_2017')
    .select('latitude, longitude, street_name')
    .ilike('street_name', cleanedStreet)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(10)

  console.log(`[Street Search] Exact match result:`, exactResult.data?.length || 0, 'records')

  if (!exactResult.error && exactResult.data && exactResult.data.length > 0) {
    transactions = exactResult.data
  } else {
    // Try 2: Partial match with original query
    const partialResult = await supabase
      .from('raw_resale_2017')
      .select('latitude, longitude, street_name')
      .ilike('street_name', `%${cleanedStreet}%`)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(10)

    console.log(`[Street Search] Partial match result:`, partialResult.data?.length || 0, 'records')

    if (partialResult.error) {
      throw partialResult.error
    }
    transactions = partialResult.data
  }

  if (!transactions || transactions.length === 0) {
    console.log(`[Street Search] No transactions found for "${cleanedStreet}"`)
    return null
  }

  console.log(`[Street Search] Found ${transactions.length} transactions, sample streets:`, 
    transactions.slice(0, 3).map(t => t.street_name))

  // Try to find subzone using the first valid coordinate
  for (const transaction of transactions) {
    const lat = Number(transaction.latitude)
    const lng = Number(transaction.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      continue
    }

    const subzone = await findSubzoneByPoint(lat, lng)
    if (subzone) {
      console.log(`[Street Search] Found subzone: ${subzone.name}`)
      return subzone
    }
  }

  console.log(`[Street Search] No subzone found for coordinates`)
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, query } = body

    if (!type || !query) {
      return NextResponse.json(
        { error: 'Missing type or query parameter' },
        { status: 400 }
      )
    }

    if (type !== 'postal' && type !== 'street') {
      return NextResponse.json(
        { error: 'Type must be "postal" or "street"' },
        { status: 400 }
      )
    }

    let subzone = null

    if (type === 'postal') {
      // Validate postal code format (6 digits)
      const postalCode = query.trim().replace(/\s+/g, '')
      if (!/^\d{6}$/.test(postalCode)) {
        return NextResponse.json(
          { error: 'Invalid postal code format. Please enter 6 digits.' },
          { status: 400 }
        )
      }

      const coords = await geocodePostalCode(postalCode)
      if (!coords) {
        return NextResponse.json(
          { error: 'Postal code not found' },
          { status: 404 }
        )
      }

      subzone = await findSubzoneByPoint(coords.lat, coords.lng)
    } else if (type === 'street') {
      subzone = await findSubzoneByStreetName(query.trim())
    }

    if (!subzone) {
      return NextResponse.json(
        { error: 'Subarea not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subzone: {
        id: subzone.id,
        name: subzone.name,
        planning_area_id: subzone.planning_area_id,
        region: subzone.region
      }
    })
  } catch (error) {
    console.error('Error searching subzone:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
