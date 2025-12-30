/**
 * Town name normalization utilities
 * Handles inconsistencies in town name formatting (quotes, case, etc.)
 */

/**
 * Normalize town name by removing quotes and trimming
 * @param town - Raw town name (may contain quotes)
 * @returns Cleaned town name
 */
export function normalizeTownName(town: string): string {
  if (!town) return ''
  return town.replace(/^["']|["']$/g, '').trim()
}

/**
 * Normalize town name to uppercase for database queries
 * @param town - Raw town name
 * @returns Uppercase normalized town name
 */
export function normalizeTownNameUpper(town: string): string {
  return normalizeTownName(town).toUpperCase()
}

/**
 * Try multiple town name variations for database queries
 * Handles cases where data might be stored with quotes or different casing
 * @param town - Original town name
 * @param queryFn - Function that takes a town name and returns a query result
 * @returns Query result or null if no match found
 */
export async function queryTownWithVariations<T>(
  town: string,
  queryFn: (normalizedTown: string) => Promise<{ data: T[] | null; error: any }>
): Promise<{ data: T[] | null; error: any }> {
  const cleanTown = normalizeTownName(town)
  
  // Try exact match first (without quotes)
  let result = await queryFn(cleanTown)
  if (result.data && result.data.length > 0 && !result.error) {
    return result
  }

  // Try with quotes (in case data was imported with quotes)
  result = await queryFn(`"${cleanTown}"`)
  if (result.data && result.data.length > 0 && !result.error) {
    return result
  }

  // Try case-insensitive search (without quotes)
  // Note: This requires ilike support in the query function
  // For now, return the last result (which should be empty)
  return result
}

/**
 * Find matching town name from a list of available towns
 * Performs case-insensitive matching
 * @param targetTown - Town name to find
 * @param availableTowns - List of available town names
 * @returns Matching town name or null
 */
export function findMatchingTown(
  targetTown: string,
  availableTowns: string[]
): string | null {
  const normalizedTarget = normalizeTownNameUpper(targetTown)
  
  return (
    availableTowns.find(
      (town) => normalizeTownNameUpper(town) === normalizedTarget
    ) || null
  )
}

