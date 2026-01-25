import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // Disable source maps in production for smaller bundles
  // Enable if you want source maps uploaded to Sentry
  productionBrowserSourceMaps: false,

  // Sentry will be initialized via config files
  // sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,

  // Organization and project are set via env vars:
  // SENTRY_ORG and SENTRY_PROJECT
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (set in CI/CD)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only upload source maps in production builds
  // disabled: process.env.NODE_ENV !== 'production',

  // Hide source maps from client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Disable Sentry webpack plugin if no DSN is configured
  dryRun: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
};

// Wrap config with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
