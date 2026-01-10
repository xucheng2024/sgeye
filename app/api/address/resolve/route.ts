/**
 * Unified Address Resolution API
 * POST /api/address/resolve
 * 
 * Resolves any user input to standardized address + subzone (neighbourhood)
 * 
 * Body: { query: string }
 * 
 * Returns: {
 *   resolved_address: ResolvedAddress
 *   message?: string (confidence message for UI)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAddress, resolveAddressCandidates } from '@/lib/address-resolver'
import { getConfidenceMessage } from '@/lib/address-resolver/confidence'
import type { ResolvedAddress } from '@/lib/address-resolver/types'

export const revalidate = 300 // Revalidate every 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, candidateIndex } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query parameter' },
        { status: 400 }
      )
    }

    // If candidateIndex is provided, resolve specific candidate
    if (typeof candidateIndex === 'number' && candidateIndex >= 0) {
      const result = await resolveAddressCandidates(query, candidateIndex)
      
      if (!result) {
        return NextResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        resolved_address: result,
        message: getConfidenceMessage(result.confidence, result.subzone_name)
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      })
    }

    // Normal resolution
    const result = await resolveAddress(query)

    if (!result) {
      return NextResponse.json(
        { error: 'Unable to resolve address' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      resolved_address: result,
      message: getConfidenceMessage(result.confidence, result.subzone_name)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[Address Resolve API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
