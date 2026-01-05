/**
 * Simple client-side fetch cache with TTL
 * Used for caching API responses in the browser
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class FetchCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTL
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expiresAt })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Singleton instance for browser-side caching
export const fetchCache = typeof window !== 'undefined' ? new FetchCache() : null

/**
 * Cached fetch wrapper
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param ttl - Cache TTL in milliseconds (default: 5 minutes)
 * @returns Promise with cached or fresh data
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit,
  ttl?: number
): Promise<T> {
  // Server-side: no caching, just fetch
  if (!fetchCache) {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }
    return response.json()
  }

  // Client-side: check cache first
  const cacheKey = `${url}:${JSON.stringify(options || {})}`
  const cached = fetchCache.get<T>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch and cache
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }
  const data = await response.json()
  fetchCache.set(cacheKey, data, ttl)
  return data
}

