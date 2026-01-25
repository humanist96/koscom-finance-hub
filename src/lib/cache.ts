/**
 * Simple in-memory cache for serverless functions
 * For production, consider using Redis (Upstash) or Vercel KV
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute - for frequently changing data
  MEDIUM: 300,         // 5 minutes - for moderately changing data
  LONG: 900,           // 15 minutes - for stable data
  VERY_LONG: 3600,     // 1 hour - for rarely changing data
} as const;

/**
 * Get cached data if available and not expired
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set data in cache with TTL
 */
export function setInCache<T>(key: string, data: T, ttlSeconds: number = CACHE_TTL.MEDIUM): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Remove specific key from cache
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Remove all keys matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Cache-aside pattern helper
 * Fetches from cache, falls back to factory function, caches result
 */
export async function withCache<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await factory();

  // Cache the result
  setInCache(key, data, ttlSeconds);

  return data;
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  news: (params: { page?: number; companyId?: string; category?: string }) =>
    `news:${params.page || 1}:${params.companyId || 'all'}:${params.category || 'all'}`,

  companies: (isPowerbase?: boolean) =>
    `companies:${isPowerbase ? 'powerbase' : 'all'}`,

  company: (id: string) => `company:${id}`,

  contractStats: () => 'contracts:stats',

  serviceStats: () => 'contracts:services',

  contractInsights: () => 'contracts:insights',

  personnel: (params: { page?: number; companyId?: string }) =>
    `personnel:${params.page || 1}:${params.companyId || 'all'}`,

  search: (query: string, type?: string) =>
    `search:${query}:${type || 'all'}`,
} as const;
