import pino from 'pino';

/**
 * Structured logger for the application
 * Uses pino for high-performance JSON logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Base logger configuration
 */
const baseConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
};

/**
 * Development transport configuration for pretty printing
 */
const devTransport: pino.TransportSingleOptions = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
};

/**
 * Create the logger instance
 * - Development: pretty-printed colored output
 * - Production: JSON output for log aggregation
 * - Test: silent by default
 */
export const logger = isTest
  ? pino({ ...baseConfig, level: 'silent' })
  : isDevelopment
    ? pino(baseConfig, pino.transport(devTransport))
    : pino(baseConfig);

/**
 * Create a child logger with additional context
 * Useful for adding request-specific or module-specific metadata
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Pre-configured loggers for specific modules
 */
export const loggers = {
  api: createLogger({ module: 'api' }),
  crawler: createLogger({ module: 'crawler' }),
  auth: createLogger({ module: 'auth' }),
  db: createLogger({ module: 'database' }),
  ai: createLogger({ module: 'ai' }),
  email: createLogger({ module: 'email' }),
  cron: createLogger({ module: 'cron' }),
} as const;

/**
 * Log an API request with standard fields
 */
export function logApiRequest(
  method: string,
  path: string,
  extra?: Record<string, unknown>
) {
  loggers.api.info({ method, path, ...extra }, `${method} ${path}`);
}

/**
 * Log an API response with timing
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  extra?: Record<string, unknown>
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  loggers.api[level](
    { method, path, statusCode, durationMs, ...extra },
    `${method} ${path} ${statusCode} ${durationMs}ms`
  );
}

/**
 * Log an error with stack trace
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      ...context,
    },
    err.message
  );
}

/**
 * Performance logging helper
 */
export function createTimer(operation: string) {
  const start = Date.now();
  return {
    end: (extra?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      logger.info({ operation, durationMs: duration, ...extra }, `${operation} completed in ${duration}ms`);
      return duration;
    },
    endWithError: (error: Error | unknown, extra?: Record<string, unknown>) => {
      const duration = Date.now() - start;
      logError(error, { operation, durationMs: duration, ...extra });
      return duration;
    },
  };
}

export default logger;
