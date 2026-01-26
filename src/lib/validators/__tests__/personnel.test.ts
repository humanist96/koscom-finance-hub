import { describe, it, expect } from 'vitest';
import {
  personnelQuerySchema,
  parsePersonnelQuery,
  personnelDateRange,
} from '../personnel';

describe('personnelDateRange', () => {
  it('should accept valid date ranges', () => {
    expect(personnelDateRange.safeParse('1week').success).toBe(true);
    expect(personnelDateRange.safeParse('1month').success).toBe(true);
    expect(personnelDateRange.safeParse('3months').success).toBe(true);
    expect(personnelDateRange.safeParse('all').success).toBe(true);
  });

  it('should reject invalid date ranges', () => {
    expect(personnelDateRange.safeParse('invalid').success).toBe(false);
    expect(personnelDateRange.safeParse('1year').success).toBe(false);
    expect(personnelDateRange.safeParse('').success).toBe(false);
  });
});

describe('personnelQuerySchema', () => {
  it('should validate with default values', () => {
    const result = personnelQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.dateRange).toBe('1month');
    }
  });

  it('should validate all fields', () => {
    const result = personnelQuerySchema.safeParse({
      page: 2,
      limit: 50,
      companyIds: 'uuid-1,uuid-2',
      keyword: '대표이사',
      dateRange: '3months',
    });

    expect(result.success).toBe(false); // companyIds need to be valid UUIDs
  });

  it('should coerce page from string', () => {
    const result = personnelQuerySchema.safeParse({ page: '5' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
    }
  });

  it('should reject page less than 1', () => {
    const result = personnelQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const result = personnelQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should trim keyword', () => {
    const result = personnelQuerySchema.safeParse({ keyword: '  부사장  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.keyword).toBe('부사장');
    }
  });

  it('should reject keyword over 200 characters', () => {
    const result = personnelQuerySchema.safeParse({ keyword: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should parse companyIds as array', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440001';
    const uuid2 = '550e8400-e29b-41d4-a716-446655440002';
    const result = personnelQuerySchema.safeParse({
      companyIds: `${uuid1},${uuid2}`,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyIds).toEqual([uuid1, uuid2]);
    }
  });

  it('should reject invalid UUIDs in companyIds', () => {
    const result = personnelQuerySchema.safeParse({
      companyIds: 'invalid-uuid,another-invalid',
    });

    expect(result.success).toBe(false);
  });

  it('should handle startDate as dateRange alias', () => {
    const result = personnelQuerySchema.safeParse({ startDate: '1week' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('1week');
    }
  });
});

describe('parsePersonnelQuery', () => {
  it('should parse valid search params', () => {
    const params = new URLSearchParams('page=2&limit=30&dateRange=1month');
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(2);
    expect(result.data?.limit).toBe(30);
    expect(result.data?.dateRange).toBe('1month');
  });

  it('should use defaults for empty params', () => {
    const params = new URLSearchParams();
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.limit).toBe(20);
    expect(result.data?.dateRange).toBe('1month');
  });

  it('should return validation errors', () => {
    const params = new URLSearchParams('page=-1&limit=500');
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(false);
    expect(result.error).toBe('입력값이 올바르지 않습니다');
    expect(result.details).toBeDefined();
  });

  it('should parse keyword', () => {
    const params = new URLSearchParams('keyword=사장');
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.keyword).toBe('사장');
  });

  it('should parse companyIds with valid UUIDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const params = new URLSearchParams(`companyIds=${uuid}`);
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.companyIds).toEqual([uuid]);
  });

  it('should handle startDate parameter', () => {
    const params = new URLSearchParams('startDate=3months');
    const result = parsePersonnelQuery(params);

    expect(result.success).toBe(true);
    expect(result.data?.startDate).toBe('3months');
  });
});
