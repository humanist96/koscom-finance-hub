import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Debug mode for development
  debug: false,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Additional server-side configuration
  beforeSend(event) {
    // Don't send events for certain error types
    if (event.exception?.values) {
      const message = event.exception.values[0]?.value || '';

      // Filter out expected errors
      if (message.includes('NEXT_NOT_FOUND')) {
        return null;
      }

      // Filter out Prisma connection errors during cold starts
      if (message.includes('PrismaClientInitializationError')) {
        return null;
      }
    }

    return event;
  },

  // Add additional context
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});
