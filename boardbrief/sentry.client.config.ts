import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,

  // Session replay (only in production)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,

  // Filter out noise: network errors, auth failures, cancelled requests
  beforeSend(event, hint) {
    const error = hint?.originalException;
    if (error instanceof Error) {
      // Ignore: network offline, auth 401s, user-cancelled requests
      if (
        error.message?.includes('NetworkError') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('cancelled') ||
        error.message?.includes('AbortError') ||
        error.message?.includes('401') ||
        error.message?.includes('403')
      ) {
        return null;
      }
    }
    return event;
  },

  // Ignore common non-actionable URLs
  denyUrls: [
    /extensions\//i,
    /^chrome:///i,
    /^moz-extension:///i,
  ],

  integrations: [],
  debug: false,
});
