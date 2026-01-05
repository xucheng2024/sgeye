/**
 * Simple in-memory cache for API responses and database queries
 * Uses Map with TTL (time-to-live) for cache expiration
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleCache {
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

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const cache = new SimpleCache()

// Cache key generators
export function getCacheKey(prefix: string, ...parts: (string | number | null | undefined)[]): string {
  return `${prefix}:${parts.filter(Boolean).join(':')}`
}

