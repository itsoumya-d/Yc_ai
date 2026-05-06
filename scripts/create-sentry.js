/**
 * Sentry upgrade script: P5-02
 * 1. Upgrades web app sentry configs with release tracking + environment + beforeSend
 * 2. Adds @sentry/react-native to all 10 mobile apps + creates lib/sentry.ts
 */
const fs = require('fs');
const path = require('path');

// ── 1. Web apps: upgrade sentry configs ────────────────────────────────────
const webApps = [
  'skillbridge', 'storythread', 'neighbordao', 'invoiceai', 'petos',
  'proposalpilot', 'complibot', 'dealroom', 'boardbrief', 'claimforge',
];

const webClientConfig = (app) => `import * as Sentry from "@sentry/nextjs";

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
    /extensions\\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],

  integrations: [],
  debug: false,
});
`;

const webServerConfig = `import * as Sentry from "@sentry/nextjs";

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
`;

webApps.forEach(app => {
  const dir = `E:/Yc_ai/${app}`;
  if (!fs.existsSync(dir)) { console.log('SKIP web:', app); return; }

  fs.writeFileSync(`${dir}/sentry.client.config.ts`, webClientConfig(app), 'utf8');
  fs.writeFileSync(`${dir}/sentry.server.config.ts`, webServerConfig, 'utf8');
  console.log('Updated Sentry web configs:', app);
});

// ── 2. Mobile apps: add @sentry/react-native + lib/sentry.ts ─────────────
const mobileApps = [
  { dir: 'mortal', pkg: 'com.mortal.app', name: 'Mortal' },
  { dir: 'stockpulse', pkg: 'com.stockpulse.app', name: 'StockPulse' },
  { dir: 'routeai', pkg: 'com.routeai.app', name: 'RouteAI' },
  { dir: 'inspector-ai', pkg: 'com.inspectorai.app', name: 'InspectorAI' },
  { dir: 'sitesync', pkg: 'com.sitesync.app', name: 'SiteSync' },
  { dir: 'govpass', pkg: 'com.govpass.app', name: 'GovPass' },
  { dir: 'claimback', pkg: 'com.claimback.app', name: 'ClaimBack' },
  { dir: 'aura-check', pkg: 'com.auracheck.app', name: 'AuraCheck' },
  { dir: 'fieldlens', pkg: 'com.fieldlens.app', name: 'FieldLens' },
  { dir: 'compliancesnap-expo', pkg: 'com.compliancesnap.app', name: 'ComplianceSnap' },
];

const mobileSentryLib = (app) => `import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

// Initialize Sentry — called once at app startup
export function initSentry() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: \`${app.name}@\${Constants.expoConfig?.version ?? '1.0.0'}\`,
    dist: Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode?.toString() ?? '1',

    // Performance
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    profilesSampleRate: 0.05,

    // Filter noise
    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (error instanceof Error) {
        if (
          error.message?.includes('Network request failed') ||
          error.message?.includes('AbortError') ||
          error.message?.includes('cancelled')
        ) {
          return null;
        }
      }
      return event;
    },

    enableAutoPerformanceTracing: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
  });
}

// Identify user after login
export function identifySentryUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

// Clear user on logout
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Capture an exception with optional context
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!DSN) return;
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

// Capture a breadcrumb for debugging
export function addBreadcrumb(message: string, category = 'app', data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message, category, data, level: 'info' });
}

// Wrap a navigation component for route tracking
export const SentryNavigationWrapper = Sentry.wrap;
`;

mobileApps.forEach(app => {
  const dir = `E:/Yc_ai/${app.dir}`;
  if (!fs.existsSync(dir)) { console.log('SKIP mobile:', app.dir); return; }

  // Write lib/sentry.ts
  fs.writeFileSync(`${dir}/lib/sentry.ts`, mobileSentryLib(app), 'utf8');

  // Add @sentry/react-native to package.json
  const pkgPath = `${dir}/package.json`;
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.dependencies['@sentry/react-native']) {
      pkg.dependencies['@sentry/react-native'] = '^6.15.0';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    }
  }

  // Add initSentry() import to app/_layout.tsx (first import)
  const layoutPath = `${dir}/app/_layout.tsx`;
  if (fs.existsSync(layoutPath)) {
    let c = fs.readFileSync(layoutPath, 'utf8');
    if (!c.includes('@/lib/sentry')) {
      const hasCRLF = c.includes('\r\n');
      const NL = hasCRLF ? '\r\n' : '\n';
      // Add import at the very top + call initSentry before exports
      c = `import { initSentry } from '@/lib/sentry';${NL}${c}`;
      // Add initSentry() call after the import section (before first export/const)
      c = c.replace(
        /(import[^\n]+\n)+/,
        (match) => match + `${NL}// Initialize Sentry error monitoring${NL}initSentry();${NL}${NL}`
      );
      fs.writeFileSync(layoutPath, c, 'utf8');
    }
  }

  console.log('Added Sentry mobile:', app.dir);
});

console.log('Done!');
