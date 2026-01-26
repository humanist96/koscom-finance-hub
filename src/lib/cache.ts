/**
 * Hybrid cache with Redis (Upstash) primary and in-memory fallback
 * For serverless environments, Redis provides persistence across cold starts
 */

import { redisCache, isRedisAvailable } from './redis';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory cache as fallback
const memoryCache = new Map<string, CacheEntry<unknown>>();

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
 * Tries Redis first, falls back to memory cache
 */
export async function getFromCacheAsync<T>(key: string): Promise<T | null> {
  // Try Redis first
  if (isRedisAvailable()) {
    const value = await redisCache.get<T>(key);
    if (value !== null) {
      return value;
    }
  }

  // Fallback to memory cache
  return getFromCache<T>(key);
}

/**
 * Get cached data from memory cache (synchronous)
 */
export function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set data in cache with TTL
 * Stores in both Redis (if available) and memory cache
 */
export async function setInCacheAsync<T>(
  key: string,
  data: T,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<void> {
  // Set in Redis if available
  if (isRedisAvailable()) {
    await redisCache.set(key, data, ttlSeconds);
  }

  // Also set in memory cache for this instance
  setInCache(key, data, ttlSeconds);
}

/**
 * Set data in memory cache (synchronous)
 */
export function setInCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Remove specific key from cache
 */
export async function invalidateCacheAsync(key: string): Promise<void> {
  if (isRedisAvailable()) {
    await redisCache.del(key);
  }
  invalidateCache(key);
}

/**
 * Remove specific key from memory cache (synchronous)
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
}

/**
 * Remove all keys matching a pattern
 */
export async function invalidateCachePatternAsync(pattern: string): Promise<void> {
  // Redis pattern matching
  if (isRedisAvailable()) {
    await redisCache.delPattern(`*${pattern}*`);
  }

  // Memory cache pattern matching
  invalidateCachePattern(pattern);
}

/**
 * Remove all keys matching a pattern from memory cache (synchronous)
 */
export function invalidateCachePattern(pattern: string): void {
  const regex = new RegExp(pattern);
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Clear entire cache
 */
export async function clearCacheAsync(): Promise<void> {
  if (isRedisAvailable()) {
    // Be careful with this in production!
    await redisCache.delPattern('*');
  }
  clearCache();
}

/**
 * Clear memory cache (synchronous)
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}

/**
 * Check if Redis is being used
 */
export function isUsingRedis(): boolean {
  return isRedisAvailable();
}

/**
 * Cache-aside pattern helper (async version with Redis support)
 * Fetches from cache, falls back to factory function, caches result
 */
export async function withCacheAsync<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache (Redis first, then memory)
  const cached = await getFromCacheAsync<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await factory();

  // Cache the result
  await setInCacheAsync(key, data, ttlSeconds);

  return data;
}

/**
 * Cache-aside pattern helper (synchronous, memory-only)
 * For backwards compatibility
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

/**
 * Recommended TTLs for different data types
 */
export const recommendedTTL = {
  // Frequently changing data
  newsList: CACHE_TTL.SHORT,
  searchResults: CACHE_TTL.SHORT,

  // Moderately changing data
  contractStats: CACHE_TTL.MEDIUM,
  serviceStats: CACHE_TTL.MEDIUM,

  // Stable data
  companiesList: CACHE_TTL.LONG,
  companyDetails: CACHE_TTL.LONG,

  // Rarely changing data
  contractInsights: CACHE_TTL.VERY_LONG,
} as const;
