/**
 * Pagination utilities for Supabase queries
 * Handles pagination for queries that exceed Supabase's default limit
 */

import { PostgrestQueryBuilder } from '@supabase/supabase-js'

/**
 * Paginate a Supabase query to fetch all results
 * @param query - Supabase query builder
 * @param pageSize - Number of records per page (default: 1000)
 * @returns Array of all results
 */
export async function paginateQuery<T>(
  query: PostgrestQueryBuilder<any, any, any>,
  pageSize: number = 1000
): Promise<T[]> {
  let allData: T[] = []
  let hasMore = true
  let page = 0

  while (hasMore) {
    const { data, error } = await query.range(
      page * pageSize,
      (page + 1) * pageSize - 1
    )

    if (error) throw error

    if (data && data.length > 0) {
      allData = allData.concat(data)
      hasMore = data.length === pageSize
      page++
    } else {
      hasMore = false
    }
  }

  return allData
}

/**
 * Safe query wrapper with error handling and fallback
 * @param queryFn - Function that returns a promise
 * @param fallback - Fallback value if query fails
 * @returns Query result or fallback
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error('Query error:', error)
    return fallback
  }
}

