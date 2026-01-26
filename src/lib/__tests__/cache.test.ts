import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getFromCache,
  setInCache,
  invalidateCache,
  invalidateCachePattern,
  clearCache,
  getCacheStats,
  withCache,
  cacheKeys,
  CACHE_TTL,
} from '../cache';

describe('Cache', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('CACHE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.SHORT).toBe(60);
      expect(CACHE_TTL.MEDIUM).toBe(300);
      expect(CACHE_TTL.LONG).toBe(900);
      expect(CACHE_TTL.VERY_LONG).toBe(3600);
    });
  });

  describe('setInCache / getFromCache', () => {
    it('should store and retrieve data', () => {
      setInCache('test-key', { foo: 'bar' });
      const result = getFromCache<{ foo: string }>('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for non-existent key', () => {
      const result = getFromCache('non-existent');
      expect(result).toBeNull();
    });

    it('should expire after TTL', () => {
      setInCache('test-key', 'value', 60); // 60 seconds TTL

      // Still valid
      vi.advanceTimersByTime(59 * 1000);
      expect(getFromCache('test-key')).toBe('value');

      // Expired
      vi.advanceTimersByTime(2 * 1000);
      expect(getFromCache('test-key')).toBeNull();
    });

    it('should use default TTL if not specified', () => {
      setInCache('test-key', 'value');

      // MEDIUM TTL is 300 seconds
      vi.advanceTimersByTime(299 * 1000);
      expect(getFromCache('test-key')).toBe('value');

      vi.advanceTimersByTime(2 * 1000);
      expect(getFromCache('test-key')).toBeNull();
    });

    it('should handle different data types', () => {
      setInCache('string', 'hello');
      setInCache('number', 42);
      setInCache('array', [1, 2, 3]);
      setInCache('object', { nested: { value: true } });
      setInCache('null', null);

      expect(getFromCache('string')).toBe('hello');
      expect(getFromCache('number')).toBe(42);
      expect(getFromCache('array')).toEqual([1, 2, 3]);
      expect(getFromCache('object')).toEqual({ nested: { value: true } });
      expect(getFromCache('null')).toBeNull(); // Note: null is treated as "not found"
    });
  });

  describe('invalidateCache', () => {
    it('should remove specific key', () => {
      setInCache('key1', 'value1');
      setInCache('key2', 'value2');

      invalidateCache('key1');

      expect(getFromCache('key1')).toBeNull();
      expect(getFromCache('key2')).toBe('value2');
    });

    it('should handle non-existent key', () => {
      expect(() => invalidateCache('non-existent')).not.toThrow();
    });
  });

  describe('invalidateCachePattern', () => {
    it('should remove keys matching pattern', () => {
      setInCache('news:1', 'news1');
      setInCache('news:2', 'news2');
      setInCache('companies:all', 'companies');

      invalidateCachePattern('^news:');

      expect(getFromCache('news:1')).toBeNull();
      expect(getFromCache('news:2')).toBeNull();
      expect(getFromCache('companies:all')).toBe('companies');
    });

    it('should handle complex patterns', () => {
      setInCache('user:123:profile', 'profile1');
      setInCache('user:456:profile', 'profile2');
      setInCache('user:123:settings', 'settings1');

      invalidateCachePattern('user:123:');

      expect(getFromCache('user:123:profile')).toBeNull();
      expect(getFromCache('user:123:settings')).toBeNull();
      expect(getFromCache('user:456:profile')).toBe('profile2');
    });
  });

  describe('clearCache', () => {
    it('should remove all entries', () => {
      setInCache('key1', 'value1');
      setInCache('key2', 'value2');
      setInCache('key3', 'value3');

      clearCache();

      expect(getFromCache('key1')).toBeNull();
      expect(getFromCache('key2')).toBeNull();
      expect(getFromCache('key3')).toBeNull();
      expect(getCacheStats().size).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      setInCache('key1', 'value1');
      setInCache('key2', 'value2');

      const stats = getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should return empty stats for empty cache', () => {
      const stats = getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('withCache', () => {
    it('should return cached data if available', async () => {
      const factory = vi.fn().mockResolvedValue('fresh-data');
      setInCache('test-key', 'cached-data');

      const result = await withCache('test-key', factory);

      expect(result).toBe('cached-data');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not in cache', async () => {
      const factory = vi.fn().mockResolvedValue('fresh-data');

      const result = await withCache('test-key', factory);

      expect(result).toBe('fresh-data');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(getFromCache('test-key')).toBe('fresh-data');
    });

    it('should use custom TTL', async () => {
      const factory = vi.fn().mockResolvedValue('data');

      await withCache('test-key', factory, 30);

      vi.advanceTimersByTime(29 * 1000);
      expect(getFromCache('test-key')).toBe('data');

      vi.advanceTimersByTime(2 * 1000);
      expect(getFromCache('test-key')).toBeNull();
    });

    it('should refetch after cache expires', async () => {
      const factory = vi
        .fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');

      // First call
      const result1 = await withCache('test-key', factory, 60);
      expect(result1).toBe('first');

      // Expire cache
      vi.advanceTimersByTime(61 * 1000);

      // Second call - should refetch
      const result2 = await withCache('test-key', factory, 60);
      expect(result2).toBe('second');
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('cacheKeys', () => {
    it('should generate news cache key', () => {
      expect(cacheKeys.news({})).toBe('news:1:all:all');
      expect(cacheKeys.news({ page: 2 })).toBe('news:2:all:all');
      expect(cacheKeys.news({ companyId: 'abc' })).toBe('news:1:abc:all');
      expect(cacheKeys.news({ category: 'IT_SYSTEM' })).toBe('news:1:all:IT_SYSTEM');
      expect(cacheKeys.news({ page: 3, companyId: 'xyz', category: 'MARKET' })).toBe(
        'news:3:xyz:MARKET'
      );
    });

    it('should generate companies cache key', () => {
      expect(cacheKeys.companies()).toBe('companies:all');
      expect(cacheKeys.companies(false)).toBe('companies:all');
      expect(cacheKeys.companies(true)).toBe('companies:powerbase');
    });

    it('should generate company cache key', () => {
      expect(cacheKeys.company('123')).toBe('company:123');
    });

    it('should generate contract stats cache key', () => {
      expect(cacheKeys.contractStats()).toBe('contracts:stats');
    });

    it('should generate service stats cache key', () => {
      expect(cacheKeys.serviceStats()).toBe('contracts:services');
    });

    it('should generate contract insights cache key', () => {
      expect(cacheKeys.contractInsights()).toBe('contracts:insights');
    });

    it('should generate personnel cache key', () => {
      expect(cacheKeys.personnel({})).toBe('personnel:1:all');
      expect(cacheKeys.personnel({ page: 5 })).toBe('personnel:5:all');
      expect(cacheKeys.personnel({ companyId: 'abc' })).toBe('personnel:1:abc');
    });

    it('should generate search cache key', () => {
      expect(cacheKeys.search('test')).toBe('search:test:all');
      expect(cacheKeys.search('test', 'news')).toBe('search:test:news');
    });
  });
});
