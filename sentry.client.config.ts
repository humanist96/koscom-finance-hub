import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session Replay (optional - for debugging user sessions)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Debug mode for development
  debug: false,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Filter out known non-errors
  beforeSend(event) {
    // Don't send events for certain error types
    if (event.exception?.values) {
      const message = event.exception.values[0]?.value || '';

      // Filter out network errors that are expected
      if (message.includes('Network request failed')) {
        return null;
      }

      // Filter out user-canceled operations
      if (message.includes('AbortError')) {
        return null;
      }
    }

    return event;
  },

  // Ignore specific URLs
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
  ],
});
