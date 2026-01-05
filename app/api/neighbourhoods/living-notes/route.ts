/**
 * GET /api/neighbourhoods/living-notes?name=NEIGHBOURHOOD_NAME
 * 
 * Fetch living notes for a neighbourhood by name
 * Returns structured living quality dimensions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

function norm(name: string): string {
  return (name || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Neighbourhood name is required' },
        { status: 400 }
      )
    }

    const normalizedName = norm(name)

    // Try exact match first
    let { data, error } = await supabase
      .from('neighbourhood_living_notes')
      .select('*')
      .eq('neighbourhood_name', normalizedName)
      .single()

    // If no exact match, try fuzzy match (contains)
    if (error && error.code === 'PGRST116') {
      const { data: allNotes } = await supabase
        .from('neighbourhood_living_notes')
        .select('*')

      if (allNotes) {
        // Find a match where the normalized name contains the key or vice versa
        const match = allNotes.find(note => {
          const noteKey = norm(note.neighbourhood_name)
          return normalizedName.includes(noteKey) || noteKey.includes(normalizedName)
        })

        if (match) {
          data = match
          error = null
        }
      }
    }

    if (error || !data) {
      return NextResponse.json(null, { status: 200 }) // Return null instead of error for missing data
    }

    // Transform database format to API format
    const livingNotes = {
      noiseDensity: {
        rating: data.noise_density_rating,
        note: data.noise_density_note
      },
      dailyConvenience: {
        rating: data.daily_convenience_rating,
        note: data.daily_convenience_note
      },
      greenOutdoor: {
        rating: data.green_outdoor_rating,
        note: data.green_outdoor_note
      },
      crowdVibe: {
        rating: data.crowd_vibe_rating,
        note: data.crowd_vibe_note
      },
      longTermComfort: {
        rating: data.long_term_comfort_rating,
        note: data.long_term_comfort_note
      }
    }

    return NextResponse.json(livingNotes)
  } catch (error: any) {
    console.error('Error fetching living notes:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

