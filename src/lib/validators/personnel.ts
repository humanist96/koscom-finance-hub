import { z } from 'zod';

/**
 * Date range enum for personnel filtering
 */
export const personnelDateRange = z.enum(['1week', '1month', '3months', 'all']);

export type PersonnelDateRange = z.infer<typeof personnelDateRange>;

/**
 * Personnel query schema
 */
export const personnelQuerySchema = z.object({
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
    .pipe(
      z.array(
        z.string().uuid('유효하지 않은 회사 ID입니다')
      )
    )
    .optional(),
  keyword: z
    .string()
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .transform((val) => val.trim())
    .optional(),
  dateRange: personnelDateRange.optional().default('1month'),
  startDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      // startDate can be used as alias for dateRange
      if (['1week', '1month', '3months', 'all'].includes(val)) {
        return val as PersonnelDateRange;
      }
      return undefined;
    }),
});

export type PersonnelQueryInput = z.infer<typeof personnelQuerySchema>;

/**
 * Parse and validate personnel query from URL search params
 */
export function parsePersonnelQuery(searchParams: URLSearchParams): {
  success: boolean;
  data?: PersonnelQueryInput;
  error?: string;
  details?: Record<string, string>;
} {
  const rawData: Record<string, string | undefined> = {
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    companyIds: searchParams.get('companyIds') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    dateRange: searchParams.get('dateRange') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
  };

  // Remove undefined values
  const filteredData = Object.fromEntries(
    Object.entries(rawData).filter(([, v]) => v !== undefined)
  );

  const result = personnelQuerySchema.safeParse(filteredData);

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
