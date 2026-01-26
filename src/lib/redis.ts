import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client for serverless caching
 * Falls back gracefully when Redis is not configured
 */

let redis: Redis | null = null;
let connectionAttempted = false;

/**
 * Get Redis client instance (lazy initialization)
 * Returns null if Redis is not configured
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;
  if (connectionAttempted) return null;

  connectionAttempted = true;

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[Redis] Upstash Redis not configured, using in-memory cache fallback');
    }
    return null;
  }

  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (error) {
    console.error('[Redis] Failed to initialize Redis client:', error);
    return null;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}

/**
 * Redis cache wrapper with automatic serialization
 */
export const redisCache = {
  /**
   * Get value from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get<T>(key);
      return value;
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in Redis cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.set(key, value, { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete key from Redis cache
   */
  async del(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`[Redis] Error deleting key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   * Note: Use with caution in production as SCAN can be slow
   */
  async delPattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;

    try {
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [nextCursor, keys] = await client.scan(cursor, { match: pattern, count: 100 });
        cursor = String(nextCursor);

        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (error) {
      console.error(`[Redis] Error deleting pattern ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`[Redis] Error checking existence of key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return -2;

    try {
      return await client.ttl(key);
    } catch (error) {
      console.error(`[Redis] Error getting TTL for key ${key}:`, error);
      return -2;
    }
  },

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      return await client.incr(key);
    } catch (error) {
      console.error(`[Redis] Error incrementing key ${key}:`, error);
      return null;
    }
  },

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const client = getRedisClient();
    if (!client) return keys.map(() => null);

    try {
      return await client.mget<T[]>(...keys);
    } catch (error) {
      console.error(`[Redis] Error getting multiple keys:`, error);
      return keys.map(() => null);
    }
  },

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.flushall();
      return true;
    } catch (error) {
      console.error('[Redis] Error flushing all keys:', error);
      return false;
    }
  },
};

export default redisCache;
