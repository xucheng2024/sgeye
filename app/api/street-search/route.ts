/**
 * GET /api/street-search
 * 
 * Search for street names and return associated planning area (subarea)
 * 
 * Query params:
 * - q: Search query (street name)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface StreetSearchResult {
  street_name: string
  planning_areas: { id: string; name: string }[]
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic' // Force dynamic rendering

async function processStreetData(streetData: any[]): Promise<StreetSearchResult[]> {
  if (!streetData || streetData.length === 0) {
    return []
  }

  // Get unique street names and neighbourhood IDs
  const streetNeighbourhoodMap = new Map<string, Set<string>>()
  const neighbourhoodIds = new Set<string>()

  streetData.forEach((item: any) => {
    const streetName = item.street_name
    const neighbourhoodId = item.neighbourhood_id

    if (streetName && neighbourhoodId) {
      if (!streetNeighbourhoodMap.has(streetName)) {
        streetNeighbourhoodMap.set(streetName, new Set())
      }
      streetNeighbourhoodMap.get(streetName)!.add(neighbourhoodId)
      neighbourhoodIds.add(neighbourhoodId)
    }
  })

  if (neighbourhoodIds.size === 0) {
    return []
  }

  // Fetch neighbourhoods with their planning areas
  const { data: neighbourhoodsData, error: neighbourhoodsError } = await supabase
    .from('neighbourhoods')
    .select('id, planning_area_id')
    .in('id', Array.from(neighbourhoodIds))

  if (neighbourhoodsError) {
    console.error('Error fetching neighbourhoods:', neighbourhoodsError)
    return []
  }

  // Get unique planning area IDs
  const planningAreaIds = new Set<string>()
  const neighbourhoodToPlanningArea = new Map<string, string>()

  neighbourhoodsData?.forEach((n: any) => {
    if (n.planning_area_id) {
      planningAreaIds.add(n.planning_area_id)
      neighbourhoodToPlanningArea.set(n.id, n.planning_area_id)
    }
  })

  if (planningAreaIds.size === 0) {
    return []
  }

  // Fetch planning areas
  const { data: planningAreasData, error: planningAreasError } = await supabase
    .from('planning_areas')
    .select('id, name')
    .in('id', Array.from(planningAreaIds))

  if (planningAreasError) {
    console.error('Error fetching planning areas:', planningAreasError)
    return []
  }

  // Build planning area map
  const planningAreaMap = new Map<string, { id: string; name: string }>()
  planningAreasData?.forEach((pa: any) => {
    planningAreaMap.set(pa.id, { id: pa.id, name: pa.name })
  })

  // Build results: street name -> planning areas
  const results: StreetSearchResult[] = []
  const processedStreets = new Set<string>()

  Array.from(streetNeighbourhoodMap.entries()).forEach(([streetName, neighbourhoodIdSet]) => {
    const planningAreaSet = new Set<string>()
    
    neighbourhoodIdSet.forEach(neighbourhoodId => {
      const planningAreaId = neighbourhoodToPlanningArea.get(neighbourhoodId)
      if (planningAreaId) {
        planningAreaSet.add(planningAreaId)
      }
    })

    if (planningAreaSet.size > 0 && !processedStreets.has(streetName)) {
      processedStreets.add(streetName)
      results.push({
        street_name: streetName,
        planning_areas: Array.from(planningAreaSet)
          .map(id => planningAreaMap.get(id))
          .filter(Boolean) as { id: string; name: string }[]
      })
    }
  })

  return results
}


export async function GET(request: NextRequest) {
  try {
    console.log('=== Street Search API Called ===')
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim()
    console.log('Received query:', query)

    if (!query || query.length < 2) {
      console.log('Query too short, returning empty results')
      return NextResponse.json({ results: [] }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      })
    }


    // Normalize query: split into words
    const queryWords = query.trim().split(/\s+/).filter(w => w.length > 0)
    
    console.log('Street search query:', { original: query, words: queryWords })

    let streetData: any[] = []

    // First, try exact phrase match (case-insensitive)
    console.log('Trying exact phrase match first...')
    console.log('Search query:', query.trim())
    
    // First check if there are ANY results (even without neighbourhood_id)
    const { data: anyResults, error: anyError } = await supabase
      .from('raw_resale_2017')
      .select('street_name, neighbourhood_id')
      .ilike('street_name', `%${query.trim()}%`)
      .not('street_name', 'is', null)
      .limit(10)
    
    console.log('Any results (including null neighbourhood_id):', anyResults?.length || 0)
    if (anyResults && anyResults.length > 0) {
      console.log('Sample street names found:', anyResults.slice(0, 5).map((d: any) => ({
        street: d.street_name,
        hasNeighbourhood: !!d.neighbourhood_id
      })))
    }
    
    // Now search with neighbourhood_id requirement
    const { data: exactMatchData, error: exactMatchError } = await supabase
      .from('raw_resale_2017')
      .select('street_name, neighbourhood_id')
      .ilike('street_name', `%${query.trim()}%`)
      .not('neighbourhood_id', 'is', null)
      .not('street_name', 'is', null)
      .limit(200)

    if (exactMatchError) {
      console.error('Error in exact match search:', exactMatchError)
    }

    if (!exactMatchError && exactMatchData && exactMatchData.length > 0) {
      console.log(`Found ${exactMatchData.length} results with exact phrase match`)
      console.log('Sample exact matches:', exactMatchData.slice(0, 5).map((d: any) => d.street_name))
      streetData = exactMatchData
    } else {
      console.log('No exact phrase match with neighbourhood_id, trying word-by-word search...')

      if (queryWords.length === 1) {
      // Single word: simple ILIKE search
      console.log(`Single word search for: "${queryWords[0]}"`)
      const { data, error } = await supabase
        .from('raw_resale_2017')
        .select('street_name, neighbourhood_id')
        .ilike('street_name', `%${queryWords[0]}%`)
        .not('neighbourhood_id', 'is', null)
        .not('street_name', 'is', null)
        .limit(200)

      if (error) {
        console.error('Error searching street names:', error)
        return NextResponse.json(
          { error: 'Failed to search street names', details: error.message },
          { status: 500 }
        )
      }

      console.log(`Found ${data?.length || 0} results for "${queryWords[0]}"`)
      if (data && data.length > 0) {
        console.log('Sample street names:', data.slice(0, 5).map((d: any) => d.street_name))
      }
      streetData = data || []
    } else {
      // Multiple words: search for each word separately, then filter to include only streets with ALL words
      const allResults: any[] = []
      
      console.log('Multiple words search, searching for:', queryWords)
      
      for (const word of queryWords) {
        console.log(`Searching for word: "${word}"`)
        const { data: wordData, error: wordError } = await supabase
          .from('raw_resale_2017')
          .select('street_name, neighbourhood_id')
          .ilike('street_name', `%${word}%`)
          .not('neighbourhood_id', 'is', null)
          .not('street_name', 'is', null)
          .limit(200)
        
        if (wordError) {
          console.error(`Error searching for word "${word}":`, wordError)
          continue
        }
        
        console.log(`Found ${wordData?.length || 0} results for word "${word}"`)
        if (wordData && wordData.length > 0) {
          console.log('Sample results:', wordData.slice(0, 3).map((d: any) => d.street_name))
          allResults.push(...wordData)
        }
      }
      
      console.log(`Total results before filtering: ${allResults.length}`)
      
      // Filter to only include street names that contain ALL words (case-insensitive)
      const queryWordsUpper = queryWords.map(w => w.toUpperCase())
      const filteredResults = allResults.filter((item: any) => {
        const streetName = (item.street_name || '').toUpperCase()
        const containsAll = queryWordsUpper.every(word => streetName.includes(word))
        if (containsAll) {
          console.log(`Match found: "${item.street_name}" contains all words`)
        }
        return containsAll
      })
      
      console.log(`Results after filtering: ${filteredResults.length}`)
      
      // Remove duplicates based on street_name + neighbourhood_id combination
      const uniqueMap = new Map<string, any>()
      filteredResults.forEach((item: any) => {
        const key = `${item.street_name}|${item.neighbourhood_id}`
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item)
        }
      })
      
      streetData = Array.from(uniqueMap.values())
      console.log(`Final unique results: ${streetData.length}`)
      }
    }

    console.log('Street search results count:', streetData.length)
    if (streetData.length > 0) {
      const sampleStreets = streetData.slice(0, 5).map((d: any) => d.street_name)
      console.log('Sample street names found:', sampleStreets)
    }

    const results = await processStreetData(streetData)

    return NextResponse.json({ results }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
