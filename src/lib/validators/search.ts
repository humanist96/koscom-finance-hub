import { z } from 'zod';

/**
 * Search type enum
 */
export const searchType = z.enum(['all', 'news', 'personnel', 'companies']);

export type SearchType = z.infer<typeof searchType>;

/**
 * Unified search query schema
 */
export const searchQuerySchema = z.object({
  q: z
    .string({ message: '검색어를 입력해주세요' })
    .min(2, '검색어는 2글자 이상 입력해주세요')
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .transform((val) => val.trim()),
  type: searchType.optional().default('all'),
  limit: z.coerce
    .number()
    .int('정수만 입력 가능합니다')
    .min(1, '최소 1개 이상 조회해야 합니다')
    .max(50, '최대 50개까지 조회 가능합니다')
    .optional()
    .default(10),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

/**
 * Parse and validate search query from URL search params
 */
export function parseSearchQuery(searchParams: URLSearchParams): {
  success: boolean;
  data?: SearchQueryInput;
  error?: string;
  details?: Record<string, string>;
} {
  const rawData = {
    q: searchParams.get('q') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  };

  const result = searchQuerySchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((err: z.ZodIssue) => {
      const field = err.path.join('.');
      fieldErrors[field] = err.message;
    });

    return {
      success: false,
      error: '입력값이 올바르지 않습니다',
      details: fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
