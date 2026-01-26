import { describe, it, expect } from 'vitest';
import {
  newsCategory,
  newsDateRange,
  newsListQuerySchema,
  parseNewsListQuery,
  keywordSchema,
  keywordListSchema,
} from '../news';

describe('newsCategory', () => {
  it('should accept valid categories', () => {
    const validCategories = [
      'IT_SYSTEM',
      'PERSONNEL',
      'BUSINESS',
      'REGULATION',
      'MARKET',
      'PRODUCT',
      'OTHER',
    ];

    validCategories.forEach((category) => {
      expect(newsCategory.safeParse(category).success).toBe(true);
    });
  });

  it('should reject invalid categories', () => {
    expect(newsCategory.safeParse('INVALID').success).toBe(false);
    expect(newsCategory.safeParse('').success).toBe(false);
    expect(newsCategory.safeParse('it_system').success).toBe(false);
  });
});

describe('newsDateRange', () => {
  it('should accept valid date ranges', () => {
    expect(newsDateRange.safeParse('today').success).toBe(true);
    expect(newsDateRange.safeParse('3days').success).toBe(true);
    expect(newsDateRange.safeParse('1week').success).toBe(true);
    expect(newsDateRange.safeParse('1month').success).toBe(true);
    expect(newsDateRange.safeParse('all').success).toBe(true);
  });

  it('should reject invalid date ranges', () => {
    expect(newsDateRange.safeParse('invalid').success).toBe(false);
    expect(newsDateRange.safeParse('1year').success).toBe(false);
  });
});

describe('newsListQuerySchema', () => {
  it('should validate with default values', () => {
    const result = newsListQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.dateRange).toBe('1week');
      expect(result.data.isPowerbaseOnly).toBe(false);
    }
  });

  it('should validate all fields', () => {
    const result = newsListQuerySchema.safeParse({
      page: '3',
      limit: '50',
      categories: 'IT_SYSTEM,MARKET',
      keyword: '삼성증권',
      dateRange: '1month',
      isPowerbaseOnly: 'true',
      isPersonnel: 'true',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
      expect(result.data.categories).toEqual(['IT_SYSTEM', 'MARKET']);
      expect(result.data.keyword).toBe('삼성증권');
      expect(result.data.dateRange).toBe('1month');
      expect(result.data.isPowerbaseOnly).toBe(true);
      expect(result.data.isPersonnel).toBe(true);
    }
  });

  it('should reject page less than 1', () => {
    const result = newsListQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const result = newsListQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should reject keyword over 200 characters', () => {
    const result = newsListQuerySchema.safeParse({ keyword: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should parse companyIds as array', () => {
    const result = newsListQuerySchema.safeParse({
      companyIds: 'id1,id2,id3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyIds).toEqual(['id1', 'id2', 'id3']);
    }
  });

  it('should filter empty companyIds', () => {
    const result = newsListQuerySchema.safeParse({
      companyIds: 'id1,,id2,',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyIds).toEqual(['id1', 'id2']);
    }
  });

  it('should parse categories and validate against enum', () => {
    const validResult = newsListQuerySchema.safeParse({
      categories: 'IT_SYSTEM,BUSINESS',
    });
    expect(validResult.success).toBe(true);

    const invalidResult = newsListQuerySchema.safeParse({
      categories: 'INVALID,CATEGORY',
    });
    expect(invalidResult.success).toBe(false);
  });

  it('should transform isPersonnel string to boolean', () => {
    const trueResult = newsListQuerySchema.safeParse({ isPersonnel: 'true' });
    expect(trueResult.success).toBe(true);
    if (trueResult.success) {
      expect(trueResult.data.isPersonnel).toBe(true);
    }

    const falseResult = newsListQuerySchema.safeParse({ isPersonnel: 'false' });
    expect(falseResult.success).toBe(true);
    if (falseResult.success) {
      expect(falseResult.data.isPersonnel).toBe(false);
    }
  });
});

describe('parseNewsListQuery', () => {
  it('should parse valid search params', () => {
    const params = new URLSearchParams(
      'page=2&limit=30&dateRange=1month&keyword=테스트'
    );
    const result = parseNewsListQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(2);
    expect(result.data?.limit).toBe(30);
    expect(result.data?.dateRange).toBe('1month');
    expect(result.data?.keyword).toBe('테스트');
  });

  it('should use defaults for empty params', () => {
    const params = new URLSearchParams();
    const result = parseNewsListQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.limit).toBe(20);
    expect(result.data?.dateRange).toBe('1week');
    expect(result.data?.isPowerbaseOnly).toBe(false);
  });

  it('should return validation errors with details', () => {
    const params = new URLSearchParams('page=-1&limit=500');
    const result = parseNewsListQuery(params);

    expect(result.success).toBe(false);
    expect(result.error).toBe('입력값이 올바르지 않습니다');
    expect(result.details).toBeDefined();
  });

  it('should parse categories from comma-separated string', () => {
    const params = new URLSearchParams('categories=IT_SYSTEM,PERSONNEL,MARKET');
    const result = parseNewsListQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.categories).toEqual(['IT_SYSTEM', 'PERSONNEL', 'MARKET']);
  });

  it('should handle isPowerbaseOnly flag', () => {
    const params = new URLSearchParams('isPowerbaseOnly=true');
    const result = parseNewsListQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.isPowerbaseOnly).toBe(true);
  });
});

describe('keywordSchema', () => {
  it('should accept valid keywords', () => {
    expect(keywordSchema.safeParse('삼성').success).toBe(true);
    expect(keywordSchema.safeParse('증권시장').success).toBe(true);
    expect(keywordSchema.safeParse('IT투자').success).toBe(true);
  });

  it('should reject keywords shorter than 2 characters', () => {
    expect(keywordSchema.safeParse('a').success).toBe(false);
    expect(keywordSchema.safeParse('').success).toBe(false);
  });

  it('should reject keywords longer than 50 characters', () => {
    expect(keywordSchema.safeParse('a'.repeat(51)).success).toBe(false);
  });

  it('should trim keywords', () => {
    const result = keywordSchema.safeParse('  테스트  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('테스트');
    }
  });
});

describe('keywordListSchema', () => {
  it('should accept valid keyword list', () => {
    const result = keywordListSchema.safeParse(['삼성', '현대', 'KB']);
    expect(result.success).toBe(true);
  });

  it('should require at least 1 keyword', () => {
    expect(keywordListSchema.safeParse([]).success).toBe(false);
  });

  it('should reject more than 20 keywords', () => {
    const keywords = Array(21).fill('키워드');
    expect(keywordListSchema.safeParse(keywords).success).toBe(false);
  });

  it('should validate each keyword', () => {
    const result = keywordListSchema.safeParse(['valid', 'a']); // 'a' is too short
    expect(result.success).toBe(false);
  });
});
