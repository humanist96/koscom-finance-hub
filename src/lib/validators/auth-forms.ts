import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

/**
 * Registration form validation schema
 */
export const registerFormSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식을 입력해주세요.'),
    name: z
      .string()
      .min(1, '이름을 입력해주세요.')
      .min(2, '이름은 2글자 이상 입력해주세요.')
      .max(50, '이름은 50자를 초과할 수 없습니다.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요.')
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자를 초과할 수 없습니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    department: z.string().max(100, '부서명은 100자를 초과할 수 없습니다.').optional(),
    position: z.string().max(50, '직책은 50자를 초과할 수 없습니다.').optional(),
    employeeId: z.string().max(20, '사번은 20자를 초과할 수 없습니다.').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
