import { describe, it, expect } from 'vitest';
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  isAppError,
  toAppError,
} from '../errors';

describe('AppError', () => {
  it('should create error with default values', () => {
    const error = new AppError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.name).toBe('AppError');
  });

  it('should create error with custom status and code', () => {
    const error = new AppError('Custom error', 418, 'TEAPOT');

    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
  });

  it('should be instance of Error', () => {
    const error = new AppError('Test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('UnauthorizedError', () => {
  it('should create with default message', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('로그인이 필요합니다');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should create with custom message', () => {
    const error = new UnauthorizedError('세션이 만료되었습니다');

    expect(error.message).toBe('세션이 만료되었습니다');
    expect(error.statusCode).toBe(401);
  });
});

describe('ForbiddenError', () => {
  it('should create with default message', () => {
    const error = new ForbiddenError();

    expect(error.message).toBe('접근 권한이 없습니다');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('NotFoundError', () => {
  it('should create with default message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('요청한 리소스를 찾을 수 없습니다');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create with custom message', () => {
    const error = new NotFoundError('사용자를 찾을 수 없습니다');
    expect(error.message).toBe('사용자를 찾을 수 없습니다');
  });
});

describe('ValidationError', () => {
  it('should create with message only', () => {
    const error = new ValidationError('입력값이 올바르지 않습니다');

    expect(error.message).toBe('입력값이 올바르지 않습니다');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toBeUndefined();
  });

  it('should create with details', () => {
    const details = {
      email: ['유효한 이메일 형식이 아닙니다'],
      password: ['비밀번호는 최소 8자 이상이어야 합니다'],
    };
    const error = new ValidationError('입력값이 올바르지 않습니다', details);

    expect(error.details).toEqual(details);
  });
});

describe('ConflictError', () => {
  it('should create with default message', () => {
    const error = new ConflictError();

    expect(error.message).toBe('리소스 충돌이 발생했습니다');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('should create with default message', () => {
    const error = new RateLimitError();

    expect(error.message).toBe('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('ExternalServiceError', () => {
  it('should create with default values', () => {
    const error = new ExternalServiceError();

    expect(error.message).toBe('외부 서비스 연결에 실패했습니다');
    expect(error.statusCode).toBe(502);
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    expect(error.service).toBeUndefined();
  });

  it('should create with service name', () => {
    const error = new ExternalServiceError('OpenAI 연결 실패', 'openai');

    expect(error.message).toBe('OpenAI 연결 실패');
    expect(error.service).toBe('openai');
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    expect(isAppError(new AppError('test'))).toBe(true);
    expect(isAppError(new UnauthorizedError())).toBe(true);
    expect(isAppError(new ValidationError('test'))).toBe(true);
  });

  it('should return false for non-AppError', () => {
    expect(isAppError(new Error('test'))).toBe(false);
    expect(isAppError('error string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError({ message: 'test' })).toBe(false);
  });
});

describe('toAppError', () => {
  it('should return same error if already AppError', () => {
    const original = new UnauthorizedError();
    const result = toAppError(original);

    expect(result).toBe(original);
  });

  it('should convert Error to AppError', () => {
    const original = new Error('Something failed');
    const result = toAppError(original);

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Something failed');
    expect(result.statusCode).toBe(500);
  });

  it('should handle unknown error types', () => {
    const result1 = toAppError('string error');
    expect(result1.message).toBe('알 수 없는 오류가 발생했습니다');

    const result2 = toAppError(null);
    expect(result2.message).toBe('알 수 없는 오류가 발생했습니다');

    const result3 = toAppError({ custom: 'object' });
    expect(result3.message).toBe('알 수 없는 오류가 발생했습니다');
  });
});
