/**
 * Confidence Scoring Logic
 * Determines confidence level based on geocoding results
 */

import { Confidence, AddressCandidate } from './types'

export function calculateConfidence(
  geocodeResult: {
    source: string[]
    candidates?: AddressCandidate[]
    postal?: string
  } | null
): Confidence {
  if (!geocodeResult) {
    return 'Low'
  }

  // High confidence: postal code match (unique)
  if (geocodeResult.postal && geocodeResult.source.includes('postal')) {
    return 'High'
  }

  // High confidence: single result with exact address match
  if (!geocodeResult.candidates || geocodeResult.candidates.length === 0) {
    // Single result - check if it's from postal or exact address
    if (geocodeResult.source.includes('postal')) {
      return 'High'
    }
    // Exact address match (no candidates means single match)
    return 'Medium'
  }

  // Multiple candidates
  const candidates = geocodeResult.candidates
  if (candidates.length === 0) {
    // Single result - high confidence if from postal
    return geocodeResult.source.includes('postal') ? 'High' : 'Medium'
  }

  // Check score gap between top candidates
  if (candidates.length >= 2) {
    const topScore = candidates[0]?.score || 0
    const secondScore = candidates[1]?.score || 0
    const scoreGap = topScore - secondScore

    // If top result is significantly better (gap > 30), medium confidence
    if (scoreGap > 30) {
      return 'Medium'
    }

    // If scores are close (gap <= 30), low confidence - user should select
    if (scoreGap <= 30 && topScore < 80) {
      return 'Low'
    }
  }

  // Medium confidence: top result has good score (>80)
  if (candidates[0]?.score && candidates[0].score > 80) {
    return 'Medium'
  }

  // Low confidence: multiple candidates with similar scores
  return 'Low'
}

export function getConfidenceMessage(confidence: Confidence, subzoneName?: string): string {
  switch (confidence) {
    case 'High':
      return subzoneName ? `Neighbourhood: ${subzoneName}` : 'Neighbourhood found'
    case 'Medium':
      return subzoneName ? `Likely: ${subzoneName} (based on best match)` : 'Likely neighbourhood found'
    case 'Low':
      return 'Multiple matches found — select your address'
    default:
      return 'Unable to determine neighbourhood'
  }
}
