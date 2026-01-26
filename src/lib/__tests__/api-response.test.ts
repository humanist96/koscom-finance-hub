import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
  AppError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '../errors';

// Define mock response type
interface MockResponse {
  body: Record<string, unknown>;
  status: number;
}

// Mock NextResponse before importing api-response
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: Record<string, unknown>, options?: { status?: number }): MockResponse => ({
      body,
      status: options?.status || 200,
    })),
  },
}));

// Import after mock is set up
import {
  successResponse,
  errorResponse,
  handleApiError,
  paginatedResponse,
  fromZodError,
} from '../api-response';

// Helper to safely cast response
function getMockResponse(response: unknown): MockResponse {
  return response as MockResponse;
}

describe('successResponse', () => {
  it('should create success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = getMockResponse(successResponse(data));

    expect(response.body).toEqual({
      success: true,
      data: { id: 1, name: 'Test' },
    });
    expect(response.status).toBe(200);
  });

  it('should create success response with custom status', () => {
    const response = getMockResponse(successResponse({ created: true }, { status: 201 }));

    expect(response.status).toBe(201);
  });

  it('should include meta when provided', () => {
    const response = getMockResponse(successResponse([1, 2, 3], {
      meta: { total: 100, page: 1, limit: 10 },
    }));

    expect(response.body).toEqual({
      success: true,
      data: [1, 2, 3],
      meta: { total: 100, page: 1, limit: 10 },
    });
  });

  it('should handle null/undefined data', () => {
    const nullResponse = getMockResponse(successResponse(null));
    expect(nullResponse.body.data).toBeNull();

    const undefinedResponse = getMockResponse(successResponse(undefined));
    expect(undefinedResponse.body.data).toBeUndefined();
  });
});

describe('errorResponse', () => {
  it('should create error response from AppError', () => {
    const error = new NotFoundError('User not found');
    const response = getMockResponse(errorResponse(error));

    expect(response.body).toEqual({
      success: false,
      error: 'User not found',
      code: 'NOT_FOUND',
    });
    expect(response.status).toBe(404);
  });

  it('should create validation error response', () => {
    const details = {
      email: ['Invalid email format'],
      password: ['Too short', 'No special characters'],
    };
    const error = new ValidationError('Validation failed', details);
    const response = getMockResponse(errorResponse(error));

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.error).toBe('Validation failed');
  });

  it('should convert Error to AppError', () => {
    const error = new Error('Something went wrong');
    const response = getMockResponse(errorResponse(error));

    expect(response.body).toEqual({
      success: false,
      error: 'Something went wrong',
      code: 'INTERNAL_ERROR',
    });
    expect(response.status).toBe(500);
  });

  it('should handle unknown error types', () => {
    const response = getMockResponse(errorResponse('string error'));

    expect(response.body.error).toBe('알 수 없는 오류가 발생했습니다');
    expect(response.status).toBe(500);
  });
});

describe('fromZodError', () => {
  it('should convert ZodError to ValidationError', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(0),
    });

    const result = schema.safeParse({ email: 'invalid', age: -5 });
    if (!result.success) {
      const validationError = fromZodError(result.error);

      expect(validationError.name).toBe('ValidationError');
      expect(validationError.statusCode).toBe(400);
      expect(validationError.code).toBe('VALIDATION_ERROR');
      expect(validationError.details).toBeDefined();
      expect(validationError.details?.email).toBeDefined();
      expect(validationError.details?.age).toBeDefined();
    }
  });

  it('should use _root for root-level errors', () => {
    const schema = z.string().min(5);

    const result = schema.safeParse('ab');
    if (!result.success) {
      const validationError = fromZodError(result.error);

      expect(validationError.details?._root).toBeDefined();
    }
  });

  it('should handle nested paths', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string().min(2),
        }),
      }),
    });

    const result = schema.safeParse({ user: { profile: { name: 'a' } } });
    if (!result.success) {
      const validationError = fromZodError(result.error);

      expect(validationError.details?.['user.profile.name']).toBeDefined();
    }
  });
});

describe('handleApiError', () => {
  it('should handle ZodError', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({});

    if (!result.success) {
      const response = getMockResponse(handleApiError(result.error));

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.status).toBe(400);
    }
  });

  it('should handle AppError', () => {
    const error = new UnauthorizedError();
    const response = getMockResponse(handleApiError(error));

    expect(response.body.error).toBe('로그인이 필요합니다');
    expect(response.status).toBe(401);
  });

  it('should handle unknown errors', () => {
    const response = getMockResponse(handleApiError(new Error('Unknown')));

    expect(response.body.code).toBe('INTERNAL_ERROR');
    expect(response.status).toBe(500);
  });

  it('should handle errors with context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    handleApiError(new Error('Test error'), 'UserController');

    expect(consoleSpy).toHaveBeenCalledWith(
      'API Error [UserController]:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe('paginatedResponse', () => {
  it('should create paginated response', () => {
    const data = [1, 2, 3, 4, 5];
    const response = getMockResponse(paginatedResponse(data, {
      total: 100,
      page: 1,
      limit: 5,
    }));

    expect(response.body).toEqual({
      success: true,
      data: [1, 2, 3, 4, 5],
      meta: {
        total: 100,
        page: 1,
        limit: 5,
        hasMore: true,
      },
    });
  });

  it('should set hasMore to false on last page', () => {
    const data = [96, 97, 98, 99, 100];
    const response = getMockResponse(paginatedResponse(data, {
      total: 100,
      page: 20,
      limit: 5,
    }));

    const meta = response.body.meta as { hasMore: boolean } | undefined;
    expect(meta?.hasMore).toBe(false);
  });

  it('should handle single page results', () => {
    const data = [1, 2, 3];
    const response = getMockResponse(paginatedResponse(data, {
      total: 3,
      page: 1,
      limit: 10,
    }));

    const meta = response.body.meta as { hasMore: boolean } | undefined;
    expect(meta?.hasMore).toBe(false);
  });

  it('should handle empty data', () => {
    const response = getMockResponse(paginatedResponse([], {
      total: 0,
      page: 1,
      limit: 10,
    }));

    expect(response.body.data).toEqual([]);
    const meta = response.body.meta as { total: number; hasMore: boolean } | undefined;
    expect(meta?.total).toBe(0);
    expect(meta?.hasMore).toBe(false);
  });
});
