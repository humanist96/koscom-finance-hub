import { z } from 'zod';

/**
 * Common pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Contracts query schema
 */
export const contractsQuerySchema = paginationSchema.extend({
  sortBy: z
    .enum([
      'orderNumber',
      'companyName',
      'powerbaseRevenue',
      'year2025Revenue',
      'year2024Revenue',
      'createdAt',
    ])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  search: z
    .string()
    .max(100, '검색어는 100자를 초과할 수 없습니다')
    .optional(),
  companyId: z.string().uuid('유효하지 않은 회사 ID입니다').optional(),
  status: z
    .enum(['ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED'])
    .optional(),
  minRevenue: z.coerce.number().min(0).optional(),
  maxRevenue: z.coerce.number().min(0).optional(),
});

export type ContractsQueryInput = z.infer<typeof contractsQuerySchema>;

/**
 * Contract creation schema
 */
export const createContractSchema = z.object({
  companyId: z.string().uuid('유효하지 않은 회사 ID입니다'),
  orderNumber: z
    .string()
    .min(1, '주문번호를 입력해주세요')
    .max(50, '주문번호는 50자를 초과할 수 없습니다'),
  contractDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  powerbaseRevenue: z.coerce.number().min(0, '매출액은 0 이상이어야 합니다'),
  notes: z
    .string()
    .max(1000, '메모는 1000자를 초과할 수 없습니다')
    .optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;

/**
 * Contract update schema
 */
export const updateContractSchema = createContractSchema.partial();

export type UpdateContractInput = z.infer<typeof updateContractSchema>;

/**
 * Contract stats query schema
 */
export const contractStatsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  groupBy: z.enum(['company', 'month', 'quarter', 'year']).optional(),
});

export type ContractStatsQueryInput = z.infer<typeof contractStatsQuerySchema>;

/**
 * Bulk upload validation schema
 */
export const contractBulkUploadRowSchema = z.object({
  orderNumber: z.string().min(1),
  companyName: z.string().min(1),
  revenue: z.coerce.number().min(0),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type ContractBulkUploadRow = z.infer<typeof contractBulkUploadRowSchema>;
