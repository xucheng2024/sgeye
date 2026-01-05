/**
 * Flat type normalization utilities
 * Handles normalization of flat type input values (3 ROOM, 4 ROOM, etc.)
 */

/**
 * Normalize flat type input
 * Converts various input formats to standardized flat type strings
 * @param value - Raw flat type input (e.g., "3 room", "3-room", "3 ROOM")
 * @returns Normalized flat type (e.g., "3 ROOM") or "All" for any/any size
 */
export function normalizeFlatType(value: string): string {
  const raw = (value || '').trim()
  if (!raw) return ''
  const lower = raw.toLowerCase().replace(/\s+/g, ' ').trim()

  if (lower === 'all' || lower === 'any' || lower === 'any size' || lower === 'any-size') return 'All'
  if (lower === 'executive' || lower === 'exec') return 'EXECUTIVE'

  const roomMatch = lower.match(/^(\d+)\s*[- ]?\s*room$/)
  if (roomMatch?.[1]) return `${roomMatch[1]} ROOM`

  return raw
}

