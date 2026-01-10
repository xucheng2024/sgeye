/**
 * Input Classification and Normalization
 * Automatically determines input type without asking user
 */

import { InputType } from './types'

export function normalizeInput(query: string): string {
  // trim, lowercase, remove extra spaces
  return query.trim().replace(/\s+/g, ' ')
}

export function classifyInput(query: string): InputType {
  const normalized = normalizeInput(query)
  const lowerQuery = normalized.toLowerCase()
  
  // Check for postal code (6 digits)
  const postalMatch = normalized.replace(/\s+/g, '').match(/^\d{6}$/)
  if (postalMatch) {
    return 'postal'
  }
  
  // Check for full address with block number (e.g., "38 Lorong 30 Geylang", "123A Bukit Batok St 25")
  if (/^\d{1,4}[A-Z]?\s+[A-Za-z]/i.test(normalized)) {
    return 'address'
  }
  
  // Check for street keywords - common Singapore street name patterns
  const streetKeywords = [
    'lorong', 'jalan', 'street', 'st', 'avenue', 'ave', 'road', 'rd', 
    'drive', 'dr', 'crescent', 'cres', 'close', 'walk', 'way', 'link',
    'place', 'pl', 'lane', 'terrace', 'park', 'grove', 'central', 'north',
    'south', 'east', 'west', 'boulevard', 'blvd', 'court', 'ct'
  ]
  
  // If query contains street keywords, treat as address
  const hasStreetKeyword = streetKeywords.some(keyword => {
    return lowerQuery.includes(keyword)
  })
  
  // If contains numbers + street keywords, definitely an address
  const hasNumbers = /\d/.test(normalized)
  if (hasStreetKeyword && hasNumbers) {
    return 'address'
  }
  
  // If starts with common street keywords, also treat as address
  const startsWithStreetKeyword = streetKeywords.some(keyword => 
    lowerQuery.startsWith(keyword + ' ') || lowerQuery === keyword
  )
  if (startsWithStreetKeyword) {
    return 'address'
  }
  
  // Check for project/POI indicators (typically building names, estates, condos)
  const projectIndicators = [
    'edge', 'estate', 'residence', 'condo', 'condominium', 'apartment', 
    'apartments', 'villa', 'villas', 'park', 'gardens', 'court', 'plaza',
    'centre', 'center', 'mall', 'complex', 'tower', 'towers', 'heights',
    'view', 'cove', 'bay', 'island', 'point', 'hill', 'hills', 'vale',
    'green', 'village', 'town', 'city', 'place', 'square'
  ]
  
  const hasProjectIndicator = projectIndicators.some(indicator => 
    lowerQuery.includes(indicator)
  )
  
  // Check for location indicators (near, at, around)
  const locationIndicators = ['near', 'at', 'around', 'beside', 'next to']
  const hasLocationIndicator = locationIndicators.some(indicator => 
    lowerQuery.includes(indicator)
  )
  
  // If has project indicators or location indicators, likely a project/mixed query
  if (hasProjectIndicator || hasLocationIndicator) {
    return 'mixed'
  }
  
  // If has numbers but no street keywords, might be a project name
  if (hasNumbers && !hasStreetKeyword) {
    return 'project'
  }
  
  // Everything else defaults to project/mixed
  return 'project'
}

export function extractPostalCode(query: string): string | null {
  const normalized = query.replace(/\s+/g, '')
  const postalMatch = normalized.match(/\d{6}/)
  return postalMatch ? postalMatch[0] : null
}

export function cleanStreetName(query: string): string {
  // Remove house numbers if present (e.g., "38 Lorong 30 Geylang" -> "Lorong 30 Geylang")
  return query.trim().replace(/^\d+[A-Z]?\s+/i, '').trim()
}
