/**
 * Environment variable validation for StoryThread.
 * Import this at the top of server-side code to catch missing config early.
 *
 * Usage: import { config } from '@/lib/config';
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[StoryThread] Missing required environment variable: ${key}\n` +
      `Add it to .env.local (development) or your hosting provider's env config (production).`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

// Validate all required variables on first import (server-side only)
function buildConfig() {
  if (typeof window !== 'undefined') {
    // Client-side: only expose public vars
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://storythread.app',
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
      // Server-only vars not available client-side
      supabaseServiceKey: '',
      openaiApiKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      sendgridApiKey: '',
      fromEmail: '',
      fromName: 'StoryThread',
    };
  }

  return {
    // Public (also available client-side)
    supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    appUrl: optionalEnv('NEXT_PUBLIC_APP_URL', 'https://storythread.app'),
    posthogKey: optionalEnv('NEXT_PUBLIC_POSTHOG_KEY'),
    sentryDsn: optionalEnv('NEXT_PUBLIC_SENTRY_DSN'),
    // Server-only secrets
    supabaseServiceKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    openaiApiKey: requireEnv('OPENAI_API_KEY'),
    stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    sendgridApiKey: requireEnv('SENDGRID_API_KEY'),
    fromEmail: optionalEnv('FROM_EMAIL', 'hello@storythread.app'),
    fromName: optionalEnv('FROM_NAME', 'StoryThread'),
  };
}

export type AppConfig = ReturnType<typeof buildConfig>;

// Lazily validated — throws on first access in server context if a var is missing
let _config: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!_config) _config = buildConfig();
  return _config;
}

// Named shorthand for common usage
export const config = new Proxy({} as AppConfig, {
  get(_t, key: string) {
    return getConfig()[key as keyof AppConfig];
  },
});
