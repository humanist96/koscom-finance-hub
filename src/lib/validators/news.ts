import { z } from 'zod';
import { paginationSchema } from './contracts';

/**
 * News category enum
 */
export const newsCategory = z.enum([
  'IT_SYSTEM',
  'PERSONNEL',
  'BUSINESS',
  'REGULATION',
  'MARKET',
  'PRODUCT',
  'OTHER',
]);

export type NewsCategory = z.infer<typeof newsCategory>;

/**
 * News query schema
 */
export const newsQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .optional(),
  companyId: z.string().uuid('유효하지 않은 회사 ID입니다').optional(),
  companyIds: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .optional(),
  category: newsCategory.optional(),
  categories: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(newsCategory))
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z
    .enum(['publishedAt', 'createdAt', 'title', 'relevanceScore'])
    .optional()
    .default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  onlyWithSummary: z.coerce.boolean().optional().default(false),
});

export type NewsQueryInput = z.infer<typeof newsQuerySchema>;

/**
 * News ID param schema
 */
export const newsIdSchema = z.object({
  id: z.string().uuid('유효하지 않은 뉴스 ID입니다'),
});

export type NewsIdInput = z.infer<typeof newsIdSchema>;

/**
 * News search schema (for full-text search)
 */
export const newsSearchSchema = z.object({
  query: z
    .string({ error: '검색어를 입력해주세요' })
    .min(2, '검색어는 최소 2자 이상이어야 합니다')
    .max(200, '검색어는 200자를 초과할 수 없습니다'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  filters: z
    .object({
      companyIds: z.array(z.string().uuid()).optional(),
      categories: z.array(newsCategory).optional(),
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional(),
    })
    .optional(),
});

export type NewsSearchInput = z.infer<typeof newsSearchSchema>;

/**
 * Keyword schema for alert subscriptions
 */
export const keywordSchema = z
  .string()
  .min(2, '키워드는 최소 2자 이상이어야 합니다')
  .max(50, '키워드는 50자를 초과할 수 없습니다')
  .trim();

export const keywordListSchema = z
  .array(keywordSchema)
  .min(1, '최소 1개의 키워드가 필요합니다')
  .max(20, '키워드는 최대 20개까지 등록 가능합니다');

export type KeywordListInput = z.infer<typeof keywordListSchema>;

/**
 * Date range enum for news filtering
 */
export const newsDateRange = z.enum(['today', '3days', '1week', '1month', 'all']);

export type NewsDateRange = z.infer<typeof newsDateRange>;

/**
 * News list query schema (for /api/news endpoint)
 */
export const newsListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('페이지는 정수여야 합니다')
    .min(1, '페이지는 1 이상이어야 합니다')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int('제한값은 정수여야 합니다')
    .min(1, '최소 1개 이상 조회해야 합니다')
    .max(100, '최대 100개까지 조회 가능합니다')
    .optional()
    .default(20),
  companyIds: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .optional(),
  categories: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(newsCategory))
    .optional(),
  isPersonnel: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isPowerbaseOnly: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default(false),
  keyword: z
    .string()
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .transform((val) => val.trim())
    .optional(),
  dateRange: newsDateRange.optional().default('1week'),
});

export type NewsListQueryInput = z.infer<typeof newsListQuerySchema>;

/**
 * Parse and validate news list query from URL search params
 */
export function parseNewsListQuery(searchParams: URLSearchParams): {
  success: boolean;
  data?: NewsListQueryInput;
  error?: string;
  details?: Record<string, string>;
} {
  const rawData: Record<string, string | undefined> = {
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    companyIds: searchParams.get('companyIds') ?? undefined,
    categories: searchParams.get('categories') ?? undefined,
    isPersonnel: searchParams.get('isPersonnel') ?? undefined,
    isPowerbaseOnly: searchParams.get('isPowerbaseOnly') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    dateRange: searchParams.get('dateRange') ?? undefined,
  };

  // Remove undefined values
  const filteredData = Object.fromEntries(
    Object.entries(rawData).filter(([, v]) => v !== undefined)
  );

  const result = newsListQuerySchema.safeParse(filteredData);

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
