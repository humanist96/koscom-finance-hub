import { z } from 'zod';

/**
 * Email validation with Korean error messages
 */
const emailSchema = z
  .string({ error: '이메일을 입력해주세요' })
  .email('유효한 이메일 형식이 아닙니다')
  .max(255, '이메일은 255자를 초과할 수 없습니다');

/**
 * Password validation
 * - Minimum 8 characters
 */
const passwordSchema = z
  .string({ error: '비밀번호를 입력해주세요' })
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(128, '비밀번호는 128자를 초과할 수 없습니다');

/**
 * Strong password schema with additional requirements
 */
export const strongPasswordSchema = passwordSchema
  .regex(/[A-Z]/, '비밀번호에 대문자가 포함되어야 합니다')
  .regex(/[a-z]/, '비밀번호에 소문자가 포함되어야 합니다')
  .regex(/[0-9]/, '비밀번호에 숫자가 포함되어야 합니다');

/**
 * Registration request schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string({ error: '이름을 입력해주세요' })
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다')
    .trim(),
  department: z
    .string()
    .max(100, '부서명은 100자를 초과할 수 없습니다')
    .optional()
    .nullable(),
  position: z
    .string()
    .max(100, '직책은 100자를 초과할 수 없습니다')
    .optional()
    .nullable(),
  employeeId: z
    .string()
    .max(50, '사번은 50자를 초과할 수 없습니다')
    .optional()
    .nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: '비밀번호를 입력해주세요' }),
  remember: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password change schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: '현재 비밀번호를 입력해주세요' }),
    newPassword: passwordSchema,
    confirmPassword: z.string({ error: '비밀번호 확인을 입력해주세요' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '새 비밀번호는 현재 비밀번호와 달라야 합니다',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다')
    .trim()
    .optional(),
  department: z
    .string()
    .max(100, '부서명은 100자를 초과할 수 없습니다')
    .optional()
    .nullable(),
  position: z
    .string()
    .max(100, '직책은 100자를 초과할 수 없습니다')
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
