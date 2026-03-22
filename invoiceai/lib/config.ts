/**
 * Environment variable validation for InvoiceAI.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`[InvoiceAI] Missing required environment variable: ${key}`);
  return value;
}
function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

function buildConfig() {
  if (typeof window !== 'undefined') {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://invoiceai.app',
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
      supabaseServiceKey: '', stripeSecretKey: '', stripeWebhookSecret: '',
      sendgridApiKey: '', fromEmail: '', fromName: 'InvoiceAI', openaiApiKey: '',
    };
  }
  return {
    supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    appUrl: optionalEnv('NEXT_PUBLIC_APP_URL', 'https://invoiceai.app'),
    posthogKey: optionalEnv('NEXT_PUBLIC_POSTHOG_KEY'),
    sentryDsn: optionalEnv('NEXT_PUBLIC_SENTRY_DSN'),
    supabaseServiceKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    openaiApiKey: requireEnv('OPENAI_API_KEY'),
    stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    sendgridApiKey: requireEnv('SENDGRID_API_KEY'),
    fromEmail: optionalEnv('FROM_EMAIL', 'hello@invoiceai.app'),
    fromName: optionalEnv('FROM_NAME', 'InvoiceAI'),
  };
}

export type AppConfig = ReturnType<typeof buildConfig>;
let _config: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!_config) _config = buildConfig();
  return _config;
}
export const config = new Proxy({} as AppConfig, {
  get(_t, key: string) { return getConfig()[key as keyof AppConfig]; },
});
