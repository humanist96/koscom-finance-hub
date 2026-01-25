import { NextResponse } from 'next/server';
import { AppError, isAppError, toAppError, ValidationError } from './errors';
import { ZodError } from 'zod';

/**
 * Standard API response types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    meta?: ApiSuccessResponse<T>['meta'];
  }
): NextResponse<ApiSuccessResponse<T>> {
  const { status = 200, meta } = options ?? {};

  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: AppError | Error | unknown
): NextResponse<ApiErrorResponse> {
  const appError = isAppError(error) ? error : toAppError(error);

  const response: ApiErrorResponse = {
    success: false,
    error: appError.message,
    code: appError.code,
  };

  if (appError instanceof ValidationError && appError.details) {
    response.details = appError.details;
  }

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Convert ZodError to ValidationError
 */
export function fromZodError(error: ZodError): ValidationError {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }

  return new ValidationError('입력값이 올바르지 않습니다', details);
}

/**
 * Handle API errors consistently
 * Logs the error and returns appropriate response
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(fromZodError(error));
  }

  // Log unexpected errors
  if (!isAppError(error)) {
    console.error(`API Error${context ? ` [${context}]` : ''}:`, error);
  }

  return errorResponse(error);
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  options: {
    total: number;
    page: number;
    limit: number;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const { total, page, limit } = options;

  return successResponse(data, {
    meta: {
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  });
}
