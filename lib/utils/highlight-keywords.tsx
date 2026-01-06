import React from 'react'

/**
 * Keywords that provide quick value to users - highlight these for quick scanning
 * These help users quickly understand key characteristics without reading full sentences
 */
export const HIGHLIGHT_KEYWORDS = [
  // Noise & atmosphere (most important for quick scanning)
  'quiet', 'quieter', 'calm', 'calmer', 'noisy', 'noise', 'busy', 'busier',
  'traffic noise', 'heavy vehicles', 'aircraft noise',
  
  // Convenience & access
  'convenient', 'convenience', 'accessible', 'limited', 'requires travel', 
  'errands', 'amenities', 'daily needs', 'short trip',
  
  // Environment & nature
  'green', 'greenery', 'park', 'parks', 'coastal', 'outdoor', 'nature',
  'reservoir', 'beach', 'walking', 'cycling',
  
  // Community & vibe
  'family', 'family-friendly', 'family-oriented', 'tourist', 'workforce', 
  'residential', 'local', 'renter',
  
  // Comfort & suitability
  'comfortable', 'suitable', 'not suitable', 'long-term', 'well-suited',
  'good for', 'great for', 'ideal for',
  
  // Location characteristics
  'hub', 'hubs', 'town centre', 'town-centre', 'city-fringe', 
  'mature', 'mature-estate', 'newer', 'new development', 'industrial', 
  'business park', 'residential pocket', 'interior blocks',
  
  // Key descriptors
  'excellent', 'strong', 'good', 'mixed', 'bad', 'minimal', 'abundant',
  'decent', 'generally',
  
  // Important qualifiers & warnings
  'depends on', 'varies', 'trade-offs', 'tradeoffs', 'pocket choice matters',
  'block orientation', 'distance from', 'proximity to', 'block facing',
  'not designed for', 'not a residential'
] as const

/**
 * Highlight keywords in text by wrapping them in a span with a class
 */
export function highlightKeywords(text: string): React.ReactNode {
  if (!text) return text

  // Sort keywords by length (longest first) to match longer phrases first
  const sortedKeywords = [...HIGHLIGHT_KEYWORDS].sort((a, b) => b.length - a.length)
  
  // Create regex pattern that matches whole words/phrases (case insensitive)
  const pattern = new RegExp(
    `\\b(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi'
  )

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  // Reset regex lastIndex
  pattern.lastIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add highlighted match
    parts.push(
      <span
        key={match.index}
        className="font-semibold text-gray-900 bg-amber-50 border-b border-amber-200"
      >
        {match[0]}
      </span>
    )

    lastIndex = pattern.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}

