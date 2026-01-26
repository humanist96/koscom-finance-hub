import { describe, it, expect, vi } from 'vitest';
import { toTsQuery } from '../search';

describe('toTsQuery', () => {
  it('should convert single word to tsquery format', () => {
    expect(toTsQuery('삼성')).toBe('삼성:*');
  });

  it('should convert multiple words to OR query', () => {
    expect(toTsQuery('삼성 증권')).toBe('삼성:* | 증권:*');
  });

  it('should handle multiple spaces between words', () => {
    expect(toTsQuery('삼성   증권')).toBe('삼성:* | 증권:*');
  });

  it('should trim whitespace', () => {
    expect(toTsQuery('  삼성증권  ')).toBe('삼성증권:*');
  });

  it('should return empty string for empty input', () => {
    expect(toTsQuery('')).toBe('');
    expect(toTsQuery('   ')).toBe('');
  });

  it('should sanitize dangerous characters', () => {
    // Removes quotes and semicolons, but each word still gets :* suffix for prefix matching
    expect(toTsQuery("삼성'; DROP TABLE news;--")).toBe('삼성:* | DROP:* | TABLE:* | news--:*');
  });

  it('should remove quotes', () => {
    expect(toTsQuery('"삼성증권"')).toBe('삼성증권:*');
  });

  it('should handle Korean and English mixed', () => {
    expect(toTsQuery('삼성 Samsung')).toBe('삼성:* | Samsung:*');
  });

  it('should handle special search terms', () => {
    expect(toTsQuery('인사 발령')).toBe('인사:* | 발령:*');
  });
});

// Note: Database-dependent functions (searchNews, searchPersonnel, etc.)
// are tested via integration tests as they require a real database connection
describe('Search integration (mocked)', () => {
  it('should have unified search function exported', async () => {
    const searchModule = await import('../search');
    expect(searchModule.unifiedSearch).toBeDefined();
    expect(typeof searchModule.unifiedSearch).toBe('function');
  });

  it('should have all search functions exported', async () => {
    const searchModule = await import('../search');
    expect(searchModule.searchNews).toBeDefined();
    expect(searchModule.searchPersonnel).toBeDefined();
    expect(searchModule.searchCompanies).toBeDefined();
    expect(searchModule.fallbackSearchNews).toBeDefined();
    expect(searchModule.fallbackSearchPersonnel).toBeDefined();
    expect(searchModule.fallbackSearchCompanies).toBeDefined();
    expect(searchModule.isFullTextSearchAvailable).toBeDefined();
  });
});
