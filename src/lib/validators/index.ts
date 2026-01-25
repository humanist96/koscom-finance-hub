/**
 * Centralized validation exports
 * Import validators from this file for consistent validation across the app
 */

// Auth validators
export {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  strongPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from './auth';

// Contract validators
export {
  paginationSchema,
  contractsQuerySchema,
  createContractSchema,
  updateContractSchema,
  contractStatsQuerySchema,
  contractBulkUploadRowSchema,
  type PaginationInput,
  type ContractsQueryInput,
  type CreateContractInput,
  type UpdateContractInput,
  type ContractStatsQueryInput,
  type ContractBulkUploadRow,
} from './contracts';

// News validators
export {
  newsCategory,
  newsQuerySchema,
  newsIdSchema,
  newsSearchSchema,
  keywordSchema,
  keywordListSchema,
  type NewsCategory,
  type NewsQueryInput,
  type NewsIdInput,
  type NewsSearchInput,
  type KeywordListInput,
} from './news';

// Common validators
export { commonSchemas } from './common';
