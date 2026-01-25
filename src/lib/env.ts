import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all required and optional environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // AI Services (at least one should be configured)
  OPENAI_API_KEY: z
    .string()
    .startsWith('sk-', 'OPENAI_API_KEY must start with "sk-"')
    .optional(),
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with "sk-ant-"')
    .optional(),

  // Cron Security
  CRON_SECRET: z
    .string()
    .min(16, 'CRON_SECRET must be at least 16 characters')
    .optional(),

  // Email Service (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Server-only environment variables type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup to catch configuration issues early
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );

    console.error(
      '❌ Environment validation failed:\n' + errorMessages.join('\n')
    );

    // In production, fail fast on invalid configuration
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Invalid environment configuration. Check server logs for details.'
      );
    }

    // In development, warn but continue with partial config
    console.warn(
      '⚠️ Continuing with invalid environment configuration (development mode)'
    );
  }

  return result.success ? result.data : (process.env as unknown as Env);
}

/**
 * Validated environment variables
 * Use this instead of process.env for type-safe access
 */
export const env = validateEnv();

/**
 * Check if a specific feature is configured
 */
export const features = {
  hasOpenAI: !!env.OPENAI_API_KEY,
  hasAnthropic: !!env.ANTHROPIC_API_KEY,
  hasAI: !!env.OPENAI_API_KEY || !!env.ANTHROPIC_API_KEY,
  hasEmail: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD),
  hasCronAuth: !!env.CRON_SECRET,
} as const;

/**
 * Get required environment variable or throw
 */
export function requireEnv(key: keyof Env): string {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return String(value);
}
