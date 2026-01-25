import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */
export const commonSchemas = {
  /**
   * UUID validation
   */
  uuid: z.string().uuid('유효하지 않은 ID입니다'),

  /**
   * Korean phone number validation
   */
  phoneKR: z
    .string()
    .regex(
      /^01[016789]-?\d{3,4}-?\d{4}$/,
      '유효한 휴대폰 번호 형식이 아닙니다'
    )
    .transform((val) => val.replace(/-/g, '')),

  /**
   * Date string validation (YYYY-MM-DD)
   */
  dateString: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다')
    .refine(
      (val) => !isNaN(Date.parse(val)),
      '유효하지 않은 날짜입니다'
    ),

  /**
   * Non-empty string
   */
  nonEmptyString: z
    .string()
    .min(1, '값을 입력해주세요')
    .trim(),

  /**
   * Positive integer
   */
  positiveInt: z.coerce
    .number()
    .int('정수를 입력해주세요')
    .positive('양수를 입력해주세요'),

  /**
   * Non-negative number
   */
  nonNegativeNumber: z.coerce
    .number()
    .min(0, '0 이상의 숫자를 입력해주세요'),

  /**
   * URL validation
   */
  url: z.string().url('유효한 URL 형식이 아닙니다'),

  /**
   * Slug validation (URL-safe string)
   */
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '영문 소문자, 숫자, 하이픈만 사용 가능합니다'
    ),

  /**
   * Year validation
   */
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100),

  /**
   * Boolean from string (for query params)
   */
  booleanFromString: z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1'),

  /**
   * Comma-separated list to array
   */
  csvToArray: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean)),

  /**
   * JSON string to object
   */
  jsonString: <T extends z.ZodTypeAny>(schema: T) =>
    z.string().transform((val, ctx) => {
      try {
        return schema.parse(JSON.parse(val));
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON format',
        });
        return z.NEVER;
      }
    }),
} as const;

/**
 * Sort order type used in queries
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * ID param validation helper
 */
export function createIdParamSchema(name: string = 'id') {
  return z.object({
    [name]: commonSchemas.uuid,
  });
}

/**
 * Search query with optional filters
 */
export function createSearchSchema<T extends z.ZodRawShape>(filters: T) {
  return z.object({
    q: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortOrder: sortOrderSchema,
    ...filters,
  });
}
