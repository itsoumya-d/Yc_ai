import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  beforeSend(event, hint) {
    const error = hint?.originalException as Error | null;
    // Don't capture expected HTTP 4xx on server
    if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('404')) {
      return null;
    }
    return event;
  },

  debug: false,
});
