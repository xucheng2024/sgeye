/**
 * Caching Mechanism
 * Two layers: project_name cache and raw_query cache
 */

import { ResolvedAddress } from './types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// In-memory cache (can be extended to Redis for production)
const projectCache = new Map<string, CacheEntry<{ address: string; postal?: string; latlng: { lat: number; lng: number } }>>()
const queryCache = new Map<string, CacheEntry<ResolvedAddress>>()

const PROJECT_CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days
const QUERY_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Get cached project address
 */
export function getCachedProject(projectName: string): { address: string; postal?: string; latlng: { lat: number; lng: number } } | null {
  const normalized = projectName.toLowerCase().trim()
  const entry = projectCache.get(normalized)
  
  if (!entry) {
    return null
  }
  
  // Check if expired
  if (Date.now() - entry.timestamp > entry.ttl) {
    projectCache.delete(normalized)
    return null
  }
  
  return entry.data
}

/**
 * Set cached project address
 */
export function setCachedProject(projectName: string, data: { address: string; postal?: string; latlng: { lat: number; lng: number } }): void {
  const normalized = projectName.toLowerCase().trim()
  projectCache.set(normalized, {
    data,
    timestamp: Date.now(),
    ttl: PROJECT_CACHE_TTL
  })
}

/**
 * Get cached query result
 */
export function getCachedQuery(query: string): ResolvedAddress | null {
  const normalized = query.toLowerCase().trim()
  const entry = queryCache.get(normalized)
  
  if (!entry) {
    return null
  }
  
  // Check if expired
  if (Date.now() - entry.timestamp > entry.ttl) {
    queryCache.delete(normalized)
    return null
  }
  
  return entry.data
}

/**
 * Set cached query result
 */
export function setCachedQuery(query: string, data: ResolvedAddress): void {
  const normalized = query.toLowerCase().trim()
  queryCache.set(normalized, {
    data,
    timestamp: Date.now(),
    ttl: QUERY_CACHE_TTL
  })
}

/**
 * Clear expired cache entries (cleanup function)
 */
export function clearExpiredCache(): void {
  const now = Date.now()
  
  // Clear expired project cache
  Array.from(projectCache.entries()).forEach(([key, entry]) => {
    if (now - entry.timestamp > entry.ttl) {
      projectCache.delete(key)
    }
  })
  
  // Clear expired query cache
  Array.from(queryCache.entries()).forEach(([key, entry]) => {
    if (now - entry.timestamp > entry.ttl) {
      queryCache.delete(key)
    }
  })
}
