import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  contractsQuerySchema,
  newsQuerySchema,
  paginationSchema,
} from '../validators';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        department: '개발팀',
        position: '팀장',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.name).toBe('홍길동');
      }
    });

    it('should require email, password, and name', () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('email');
        expect(paths).toContain('password');
        expect(paths).toContain('name');
      }
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
        name: '홍길동',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('email');
        expect(result.error.issues[0].message).toContain('이메일');
      }
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: '1234567',
        name: '홍길동',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('password');
        expect(result.error.issues[0].message).toContain('8자');
      }
    });

    it('should reject short name', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: '김',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('name');
        expect(result.error.issues[0].message).toContain('2자');
      }
    });

    it('should allow optional fields to be null', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        department: null,
        position: null,
        employeeId: null,
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should trim name whitespace', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: '  홍길동  ',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('홍길동');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.remember).toBe(false); // default
      }
    });

    it('should accept remember option', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        remember: true,
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.remember).toBe(true);
      }
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate matching passwords', () => {
      const data = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'different',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('일치');
      }
    });

    it('should reject same current and new password', () => {
      const data = {
        currentPassword: 'samepassword',
        newPassword: 'samepassword',
        confirmPassword: 'samepassword',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('달라야');
      }
    });
  });
});

describe('Pagination Schema', () => {
  it('should have default values', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should coerce string to number', () => {
    const result = paginationSchema.safeParse({
      page: '5',
      limit: '20',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should reject page less than 1', () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const result = paginationSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe('Contracts Query Schema', () => {
  it('should validate with all options', () => {
    const data = {
      page: 2,
      limit: 25,
      sortBy: 'powerbaseRevenue',
      sortOrder: 'desc',
      search: '삼성증권',
    };

    const result = contractsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('powerbaseRevenue');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should reject invalid sortBy value', () => {
    const data = {
      sortBy: 'invalidField',
    };

    const result = contractsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate UUID companyId', () => {
    const validResult = contractsQuerySchema.safeParse({
      companyId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(validResult.success).toBe(true);

    const invalidResult = contractsQuerySchema.safeParse({
      companyId: 'not-a-uuid',
    });
    expect(invalidResult.success).toBe(false);
  });
});

describe('News Query Schema', () => {
  it('should validate with date filters', () => {
    const data = {
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      category: 'IT_SYSTEM',
    };

    const result = newsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateFrom).toBeInstanceOf(Date);
      expect(result.data.dateTo).toBeInstanceOf(Date);
    }
  });

  it('should have default sort values', () => {
    const result = newsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('publishedAt');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should reject invalid category', () => {
    const result = newsQuerySchema.safeParse({
      category: 'INVALID_CATEGORY',
    });
    expect(result.success).toBe(false);
  });

  it('should transform comma-separated companyIds', () => {
    const result = newsQuerySchema.safeParse({
      companyIds: 'id1,id2,id3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyIds).toEqual(['id1', 'id2', 'id3']);
    }
  });
});
