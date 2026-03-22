#!/usr/bin/env tsx
/**
 * Pre-deployment checklist for StoryThread.
 *
 * Run before every production deployment:
 *   npx tsx scripts/pre-deploy.ts
 *
 * Checks:
 *  1. All required environment variables are set
 *  2. Supabase connection is reachable
 *  3. No console.log statements left in production code
 *  4. No hardcoded secrets in source files
 *  5. package.json has correct version
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const APP_NAME = 'ClaimForge';

// ─── Types ─────────────────────────────────────────────────────────────────
interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function pass(name: string, message: string) {
  results.push({ name, status: 'pass', message });
}
function fail(name: string, message: string) {
  results.push({ name, status: 'fail', message });
}
function warn(name: string, message: string) {
  results.push({ name, status: 'warn', message });
}

// ─── Check 1: Environment Variables ─────────────────────────────────────────
function checkEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  const optional = [
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
    'FROM_EMAIL',
    'FROM_NAME',
  ];

  const missing = required.filter((k) => !process.env[k]);
  const missingOptional = optional.filter((k) => !process.env[k]);

  if (missing.length === 0) {
    pass('env-required', `All ${required.length} required env vars present`);
  } else {
    fail('env-required', `Missing required env vars: ${missing.join(', ')}`);
  }

  if (missingOptional.length > 0) {
    warn('env-optional', `Missing optional env vars: ${missingOptional.join(', ')}`);
  } else {
    pass('env-optional', 'All optional env vars present');
  }
}

// ─── Check 2: Supabase Connectivity ────────────────────────────────────────
async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    fail('supabase', 'Cannot check — SUPABASE_URL or SERVICE_ROLE_KEY missing');
    return;
  }
  try {
    const supabase = createClient(url, key);
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      fail('supabase', `DB query failed: ${error.message}`);
    } else {
      pass('supabase', 'Supabase connection and profiles table reachable');
    }
  } catch (e) {
    fail('supabase', `Connection error: ${(e as Error).message}`);
  }
}

// ─── Check 3: No console.log in production code ─────────────────────────────
function checkConsoleLogs() {
  const dirs = ['app', 'lib', 'components'];
  const extensions = ['.ts', '.tsx'];
  let count = 0;
  const files: string[] = [];

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(entry))) {
        const content = readFileSync(fullPath, 'utf8');
        const matches = content.match(/console\.log\s*\(/g);
        if (matches) {
          count += matches.length;
          files.push(`${fullPath} (${matches.length})`);
        }
      }
    }
  }

  dirs.forEach(walk);

  if (count === 0) {
    pass('no-console-log', 'No console.log found in production code');
  } else {
    warn('no-console-log', `Found ${count} console.log call(s) — consider removing:\n  ${files.slice(0, 5).join('\n  ')}`);
  }
}

// ─── Check 4: No hardcoded secrets ─────────────────────────────────────────
function checkHardcodedSecrets() {
  const secretPatterns = [
    /sk_live_[a-zA-Z0-9]{24,}/,         // Stripe live key
    /sk_test_[a-zA-Z0-9]{24,}/,         // Stripe test key
    /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/, // SendGrid
    /eyJhbGciOiJIUzI1NiJ9\.[a-zA-Z0-9._-]+/,    // JWT (Supabase service key)
    /AIza[0-9A-Za-z_-]{35}/,            // Google API key
  ];

  const dirs = ['app', 'lib', 'components'];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const found: string[] = [];

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(extname(entry))) {
        const content = readFileSync(fullPath, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            found.push(fullPath);
            break;
          }
        }
      }
    }
  }

  dirs.forEach(walk);

  if (found.length === 0) {
    pass('no-hardcoded-secrets', 'No hardcoded secrets detected in source files');
  } else {
    fail('no-hardcoded-secrets', `Potential hardcoded secrets in: ${found.join(', ')}`);
  }
}

// ─── Check 5: Package version ───────────────────────────────────────────────
function checkPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const version = pkg.version ?? '0.0.0';
    if (version === '0.0.0' || version === '0.1.0') {
      warn('version', `package.json version is ${version} — update before public launch`);
    } else {
      pass('version', `package.json version: ${version}`);
    }
  } catch {
    warn('version', 'Could not read package.json');
  }
}

// ─── Check 6: .env.local not committed ─────────────────────────────────────
function checkGitignore() {
  try {
    const gitignore = readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env.local')) {
      pass('gitignore', '.env.local is in .gitignore');
    } else {
      fail('gitignore', '.env.local is NOT in .gitignore — risk of leaking secrets!');
    }
  } catch {
    warn('gitignore', 'No .gitignore found');
  }
}

// Node.js existsSync workaround (import from fs)
import { existsSync } from 'fs';

// ─── Run all checks ─────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀 Pre-deployment checklist — ${APP_NAME}\n${'─'.repeat(50)}`);

  checkEnvVars();
  await checkSupabase();
  checkConsoleLogs();
  checkHardcodedSecrets();
  checkPackageVersion();
  checkGitignore();

  console.log('');
  const passed = results.filter((r) => r.status === 'pass').length;
  const warnings = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  for (const r of results) {
    const icon = r.status === 'pass' ? '✅' : r.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} [${r.name}] ${r.message}`);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

  if (failed > 0) {
    console.error(`❌ ${failed} check(s) failed. Fix before deploying.\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.warn(`⚠️  ${warnings} warning(s). Review before deploying.\n`);
  } else {
    console.log(`✅ All checks passed! ${APP_NAME} is ready to deploy.\n`);
  }
}

run().catch((e) => {
  console.error('Pre-deploy script error:', e);
  process.exit(1);
});
