import { describe, it, expect } from 'vitest';
import { searchQuerySchema, parseSearchQuery, searchType } from '../search';

describe('searchType', () => {
  it('should accept valid search types', () => {
    expect(searchType.safeParse('all').success).toBe(true);
    expect(searchType.safeParse('news').success).toBe(true);
    expect(searchType.safeParse('personnel').success).toBe(true);
    expect(searchType.safeParse('companies').success).toBe(true);
  });

  it('should reject invalid search types', () => {
    expect(searchType.safeParse('invalid').success).toBe(false);
    expect(searchType.safeParse('').success).toBe(false);
  });
});

describe('searchQuerySchema', () => {
  it('should validate valid query', () => {
    const result = searchQuerySchema.safeParse({
      q: '삼성증권',
      type: 'news',
      limit: 20,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('삼성증권');
      expect(result.data.type).toBe('news');
      expect(result.data.limit).toBe(20);
    }
  });

  it('should use default values', () => {
    const result = searchQuerySchema.safeParse({ q: '테스트' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('all');
      expect(result.data.limit).toBe(10);
    }
  });

  it('should trim query', () => {
    const result = searchQuerySchema.safeParse({ q: '  test  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('test');
    }
  });

  it('should reject query shorter than 2 characters', () => {
    const result = searchQuerySchema.safeParse({ q: 'a' });
    expect(result.success).toBe(false);
  });

  it('should reject query longer than 200 characters', () => {
    const result = searchQuerySchema.safeParse({ q: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should reject limit less than 1', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', limit: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 50', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', limit: 51 });
    expect(result.success).toBe(false);
  });

  it('should coerce limit from string', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', limit: '25' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });
});

describe('parseSearchQuery', () => {
  it('should parse valid search params', () => {
    const params = new URLSearchParams('q=삼성증권&type=news&limit=15');
    const result = parseSearchQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.q).toBe('삼성증권');
    expect(result.data?.type).toBe('news');
    expect(result.data?.limit).toBe(15);
  });

  it('should return error for missing query', () => {
    const params = new URLSearchParams('type=news');
    const result = parseSearchQuery(params);

    expect(result.success).toBe(false);
    expect(result.error).toBe('입력값이 올바르지 않습니다');
    expect(result.details?.q).toBeDefined();
  });

  it('should return error for short query', () => {
    const params = new URLSearchParams('q=a');
    const result = parseSearchQuery(params);

    expect(result.success).toBe(false);
    expect(result.details?.q).toContain('검색어는 2글자 이상 입력해주세요');
  });

  it('should use defaults for missing optional params', () => {
    const params = new URLSearchParams('q=테스트검색어');
    const result = parseSearchQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('all');
    expect(result.data?.limit).toBe(10);
  });

  it('should handle empty search params', () => {
    const params = new URLSearchParams();
    const result = parseSearchQuery(params);

    expect(result.success).toBe(false);
  });

  it('should return field-specific errors', () => {
    const params = new URLSearchParams('q=a&limit=-5');
    const result = parseSearchQuery(params);

    expect(result.success).toBe(false);
    expect(result.details).toBeDefined();
  });
});
