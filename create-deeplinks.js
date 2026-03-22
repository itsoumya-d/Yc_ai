/**
 * Deep Link + Universal Link Configuration: P5-04
 * 1. Updates app.json with associatedDomains (iOS) + intentFilters (Android)
 * 2. Creates supabase/functions/well-known/index.ts for AASA + assetlinks hosting
 * 3. Enhances app/_layout.tsx with handleDeepLink function
 */
const fs = require('fs');

const mobileApps = [
  { dir: 'mortal',           pkg: 'com.mortal.app',         bundleId: 'com.mortal.app',         scheme: 'mortal',         name: 'Mortal' },
  { dir: 'stockpulse',       pkg: 'com.stockpulse.app',     bundleId: 'com.stockpulse.app',     scheme: 'stockpulse',     name: 'StockPulse' },
  { dir: 'routeai',          pkg: 'com.routeai.app',        bundleId: 'com.routeai.app',        scheme: 'routeai',        name: 'RouteAI' },
  { dir: 'inspector-ai',     pkg: 'com.inspectorai.app',    bundleId: 'com.inspectorai.app',    scheme: 'inspectorai',    name: 'InspectorAI' },
  { dir: 'sitesync',         pkg: 'com.sitesync.app',       bundleId: 'com.sitesync.app',       scheme: 'sitesync',       name: 'SiteSync' },
  { dir: 'govpass',          pkg: 'com.govpass.app',        bundleId: 'com.govpass.app',        scheme: 'govpass',        name: 'GovPass' },
  { dir: 'claimback',        pkg: 'com.claimback.app',      bundleId: 'com.claimback.app',      scheme: 'claimback',      name: 'ClaimBack' },
  { dir: 'aura-check',       pkg: 'com.auracheck.app',      bundleId: 'com.auracheck.app',      scheme: 'auracheck',      name: 'AuraCheck' },
  { dir: 'fieldlens',        pkg: 'com.fieldlens.app',      bundleId: 'com.fieldlens.app',      scheme: 'fieldlens',      name: 'FieldLens' },
  { dir: 'compliancesnap-expo', pkg: 'com.compliancesnap.app', bundleId: 'com.compliancesnap.app', scheme: 'compliancesnap', name: 'ComplianceSnap' },
];

// ── 1. Update app.json ────────────────────────────────────────────────────────
mobileApps.forEach(app => {
  const appJsonPath = `E:/Yc_ai/${app.dir}/app.json`;
  if (!fs.existsSync(appJsonPath)) { console.log('SKIP app.json:', app.dir); return; }

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const expo = appJson.expo;

  // iOS: Associated Domains for Universal Links
  if (!expo.ios) expo.ios = {};
  const existingDomains = expo.ios.associatedDomains || [];
  const newDomains = [
    `applinks:${app.scheme}.app`,           // custom domain (replace with actual)
    `webcredentials:${app.scheme}.app`,     // Shared Web Credentials
  ];
  const mergedDomains = [...new Set([...existingDomains, ...newDomains])];
  expo.ios.associatedDomains = mergedDomains;

  // Android: Intent Filters for App Links
  if (!expo.android) expo.android = {};
  const intentFilters = expo.android.intentFilters || [];
  // Check if App Links filter already exists
  const hasAppLinks = intentFilters.some(f =>
    f.data?.some?.(d => d.scheme === 'https')
  );
  if (!hasAppLinks) {
    intentFilters.push({
      action: 'VIEW',
      autoVerify: true,
      data: [
        {
          scheme: 'https',
          host: `${app.scheme}.app`,    // custom domain (replace with actual)
          pathPrefix: '/',
        },
        {
          scheme: app.scheme,           // custom scheme fallback
        },
      ],
      category: ['BROWSABLE', 'DEFAULT'],
    });
    expo.android.intentFilters = intentFilters;
  }

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
  console.log('Updated app.json:', app.dir);
});

// ── 2. Supabase Edge Function: serve .well-known files ──────────────────────
const wellKnownFunction = (app) => `import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// ============================================================
// Well-Known Files Server — ${app.name}
// Serves apple-app-site-association (iOS Universal Links) and
// assetlinks.json (Android App Links) at the correct paths.
//
// Deploy: supabase functions deploy well-known
// Host these at your custom domain's /.well-known/ path.
// See: https://docs.expo.dev/guides/deep-linking/
// ============================================================

// iOS Universal Links — apple-app-site-association
// Replace '${app.bundleId}' with your actual bundle ID on App Store.
// The 'components' array lists URL paths the app handles.
const AASA = {
  applinks: {
    details: [
      {
        appIDs: ['TEAMID.${app.bundleId}'], // Replace TEAMID with your Apple Team ID
        components: [
          { '/': '/auth/callback', comment: 'Supabase OAuth callback' },
          { '/': '/link/*', comment: 'All deep link paths' },
          { '/': '/shared/*', comment: 'Shared content links' },
          { '/': '/reset-password', comment: 'Password reset' },
        ],
      },
    ],
  },
  webcredentials: {
    apps: ['TEAMID.${app.bundleId}'], // Replace TEAMID with your Apple Team ID
  },
};

// Android App Links — assetlinks.json
// Replace SHA256_CERT_FINGERPRINT with your app's signing certificate SHA-256 fingerprint.
// Run: keytool -list -v -keystore your-key.jks | grep SHA256
const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: '${app.pkg}',
      sha256_cert_fingerprints: [
        'REPLACE_WITH_YOUR_SHA256_FINGERPRINT', // from EAS build credentials
      ],
    },
  },
];

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === '/.well-known/apple-app-site-association' || path === '/apple-app-site-association') {
    return new Response(JSON.stringify(AASA, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (path === '/.well-known/assetlinks.json') {
    return new Response(JSON.stringify(ASSET_LINKS, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return new Response('Not Found', { status: 404 });
});
`;

// ── 3. Enhanced deep link handler snippet ────────────────────────────────────
// Inject enhanced handleDeepLink into existing _layout.tsx
// The existing stub uses Linking.addEventListener but just console.logs.
// We replace that useEffect with a proper router-based handler.

const deepLinkUseEffect = `
  useEffect(() => {
    // Handle deep links when app is already open (foreground)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    // Handle the initial URL that launched the app (cold start)
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });
    return () => subscription.remove();
  }, []);`;

const handleDeepLinkFn = `
  // Handle Universal Links, App Links, and custom scheme deep links.
  // Called both on cold start (getInitialURL) and when app is in foreground.
  function handleDeepLink(url: string) {
    if (!url) return;
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const params = Object.fromEntries(parsed.searchParams.entries());

      // Auth callback from Supabase OAuth / magic link / password reset
      if (pathname.includes('/auth/callback') || pathname.includes('/auth/confirm')) {
        const token = params.token_hash || params.token;
        const type = params.type;
        if (type === 'recovery') {
          router.replace({ pathname: '/(auth)/reset-password' as any, params: { token } });
        } else if (type === 'signup' || type === 'magiclink') {
          router.replace('/(tabs)/' as any);
        } else {
          router.replace('/(tabs)/' as any);
        }
        return;
      }

      // Reset password link
      if (pathname.includes('/reset-password')) {
        router.replace({ pathname: '/(auth)/reset-password' as any, params });
        return;
      }

      // Notification tap deep links: /link/[screen]
      if (pathname.startsWith('/link/')) {
        const screen = pathname.replace('/link/', '');
        if (screen) router.push(('/' + screen) as any);
        return;
      }

      // Shared content: /shared/[type]/[id]
      if (pathname.startsWith('/shared/')) {
        router.push(pathname as any);
        return;
      }

      // Custom scheme: appname://screen/[params]
      if (url.startsWith(parsed.protocol) && !url.startsWith('http')) {
        const path = pathname.startsWith('/') ? pathname : '/' + pathname;
        if (path && path !== '/') router.push(path as any);
      }
    } catch {
      // Malformed URL — ignore
    }
  }
`;

mobileApps.forEach(app => {
  const appDir = `E:/Yc_ai/${app.dir}`;

  // 2a. Create supabase/functions/well-known/index.ts
  const funcDir = `${appDir}/supabase/functions/well-known`;
  if (!fs.existsSync(funcDir)) fs.mkdirSync(funcDir, { recursive: true });
  fs.writeFileSync(`${funcDir}/index.ts`, wellKnownFunction(app), 'utf8');
  console.log('Written well-known function:', app.dir);

  // 3a. Enhance _layout.tsx
  const layoutPath = `${appDir}/app/_layout.tsx`;
  if (!fs.existsSync(layoutPath)) { console.log('SKIP _layout.tsx:', app.dir); return; }

  let content = fs.readFileSync(layoutPath, 'utf8');

  // Only patch if we haven't already
  if (content.includes('handleDeepLink')) { console.log('SKIP _layout.tsx (already patched):', app.dir); return; }

  // Replace the existing simple deep link useEffect
  const oldEffect = `  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      // expo-router handles the actual navigation automatically
    });
    return () => subscription.remove();
  }, []);`;

  if (content.includes('Linking.addEventListener')) {
    content = content.replace(oldEffect, deepLinkUseEffect);
    // Insert handleDeepLink function before the final return statement
    content = content.replace(
      /\n  return \(/,
      handleDeepLinkFn + '\n  return ('
    );
  } else {
    // No existing Linking code — inject both before the return
    content = content.replace(
      /\n  return \(/,
      deepLinkUseEffect + handleDeepLinkFn + '\n  return ('
    );
  }

  fs.writeFileSync(layoutPath, content, 'utf8');
  console.log('Patched _layout.tsx:', app.dir);
});

console.log('Done!');
