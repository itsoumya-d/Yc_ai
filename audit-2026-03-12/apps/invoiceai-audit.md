# InvoiceAI - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/invoiceai`
- Product category: AI invoicing and payment collection for freelancers
- Status: Completion Score: 22 / 100

## App Inventory

- Source files scanned: 263
- Approximate source lines scanned: 53404
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2c/24-invoiceai`
- Live page/screen routes found: 37
- Live API routes found: 10
- Build result: failed - Import trace:
  Server Component:
    ./components/pay/payment-form.tsx
    ./app/(portal)/pay/[invoiceId]/page.tsx

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./components/pay/payment-form.tsx:5:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:6:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:10:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
- Test result: failed -  ? Function.describe node_modules/playwright/lib/transform/transform.js:282:12
 ? e2e/public-pages.spec.ts:3:6
      1| import { test, expect } from '@playwright/test';
      2| 
      3| test.describe('Public Pages', () => {
       |      ^
      4|   test('homepage loads', async ({ page }) => {
      5|     await page.goto('/');

????????????????????????[3/3]?

 Test Files  3 failed | 3 passed (6)
      Tests  14 passed (14)
   Start at  10:40:14
   Duration  3.94s (transform 232ms, setup 789ms, collect 285ms, tests 19ms, environment 5.58s, prepare 1.01s)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 26
- Missing documented routes in live code: 5

| Documented route | Live route found | Notes |
| --- | --- | --- |
| `/` | yes | Mapped to live route tree |
| `/clients` | yes | Mapped to live route tree |
| `/clients/[id` | no | Not found in live route scan |
| `/clients/[id]` | yes | Mapped to live route tree |
| `/dashboard` | yes | Mapped to live route tree |
| `/expenses` | yes | Mapped to live route tree |
| `/follow-ups` | yes | Mapped to live route tree |
| `/forgot-password` | yes | Mapped to live route tree |
| `/invoices` | yes | Mapped to live route tree |
| `/invoices/[id` | no | Not found in live route scan |
| `/invoices/[id]` | yes | Mapped to live route tree |
| `/invoices/[id]/edit` | yes | Mapped to live route tree |
| `/invoices/new` | yes | Mapped to live route tree |
| `/login` | yes | Mapped to live route tree |
| `/pay/[invoiceId` | no | Not found in live route scan |
| `/pay/[invoiceId]` | yes | Mapped to live route tree |
| `/pricing` | yes | Mapped to live route tree |
| `/receipt/[paymentId` | no | Not found in live route scan |

### Feature headings observed in docs

- F1. AI Invoice Generator
- F2. Client Management
- F3. One-Click Invoice Sending
- F4. Online Payment Processing
- F5. Automated Payment Reminders
- F6. Invoice Templates
- F7. Basic Reporting
- MVP Development Timeline Summary
- F8. AI Payment Predictor
- F9. Automated Follow-Up Sequences

## Module Intent Summary

The codebase for InvoiceAI is organized around a route-driven web application with the following dominant module buckets:

- `app`: 107 source files
- `components`: 64 source files
- `lib`: 28 source files
- `supabase`: 20 source files
- `24-invoiceai`: 9 source files
- `saas-docs`: 9 source files
- `e2e`: 4 source files
- `tests`: 4 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=missing, privacy=present, terms=present.

## Critical Line-Level Appendix

### HIGH: OAuth callback route is missing

Social auth flows need a callback/code-exchange route to complete reliably in production.

- No direct line-level evidence captured for this issue.

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/invoiceai/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/invoiceai/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### CRITICAL: Portal-token RLS looks overly permissive

The schema appears to allow invoice reads whenever a portal token exists instead of matching a supplied token, which is a serious data-exposure risk.

- `E:/Yc_ai/invoiceai/supabase/migrations/005_create_invoices.sql:71` - FOR SELECT USING (portal_token IS NOT NULL);
- `E:/Yc_ai/invoiceai/supabase/migrations/006_create_invoice_items.sql:54` - SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.portal_token IS NOT NULL
- `E:/Yc_ai/invoiceai/supabase/migrations/015_rls_policies.sql:103` - FOR SELECT USING (portal_token IS NOT NULL);
- `E:/Yc_ai/invoiceai/supabase/migrations/015_rls_policies.sql:142` - AND invoices.portal_token IS NOT NULL

### HIGH: Documented screens are not fully matched in live routes

The docs describe 26 route(s), but 5 route(s) were not mapped to a live page or screen implementation.

- `documentation` - /clients/[id
- `documentation` - /invoices/[id
- `documentation` - /pay/[invoiceId
- `documentation` - /receipt/[paymentId
- `documentation` - /settings/notifications

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/invoiceai/24-invoiceai/api-guide.md:1045` - await new Promise(resolve => setTimeout(resolve, delay));
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/branding/page.tsx:54` - await new Promise(r => setTimeout(r, 800));
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/branding/page.tsx:57` - setTimeout(() => setSaved(false), 2500);
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/email-templates/page.tsx:124` - await new Promise(r => setTimeout(r, 700));
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/email-templates/page.tsx:127` - setTimeout(() => setSaved(null), 2000);
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/integrations/page.tsx:88` - await new Promise(r => setTimeout(r, 900));
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/integrations/page.tsx:97` - setTimeout(() => setApiKeyCopied(false), 2000);
- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/integrations/page.tsx:100` - setTimeout(() => setWebhookCopied(false), 2000);

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/invoiceai/app/(dashboard)/settings/page.tsx:18` - .select('*')
- `E:/Yc_ai/invoiceai/app/api/invoices/[id]/pdf/route.ts:40` - .select('*')
- `E:/Yc_ai/invoiceai/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/invoiceai/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/invoiceai/lib/actions/analytics.ts:127` - .select('*')

### HIGH: Build verification failed

The recorded runtime build check failed: Import trace:
  Server Component:
    ./components/pay/payment-form.tsx
    ./app/(portal)/pay/[invoiceId]/page.tsx

https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./components/pay/payment-form.tsx:5:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:6:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./components/pay/payment-form.tsx:10:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed:  ? Function.describe node_modules/playwright/lib/transform/transform.js:282:12
 ? e2e/public-pages.spec.ts:3:6
      1| import { test, expect } from '@playwright/test';
      2| 
      3| test.describe('Public Pages', () => {
       |      ^
      4|   test('homepage loads', async ({ page }) => {
      5|     await page.goto('/');

????????????????????????[3/3]?

 Test Files  3 failed | 3 passed (6)
      Tests  14 passed (14)
   Start at  10:40:14
   Duration  3.94s (transform 232ms, setup 789ms, collect 285ms, tests 19ms, environment 5.58s, prepare 1.01s)


- No direct line-level evidence captured for this issue.

### MEDIUM: Fresh audit contradicts the earlier portfolio readiness report

The March 2026 portfolio report marked this app as launch-ready, but the live-code re-audit still found unresolved gaps.

- No direct line-level evidence captured for this issue.


## Frontend Audit

- Route/screen surface appears partially aligned with the documentation.
- UX state coverage is not yet complete, but runtime proof is still missing.
- Design-system and interaction quality require follow-up wherever the findings list flags mock data, missing screens, or stubbed flows.

## Backend Audit

- Backend readiness is partially provable from the checked-in schema/config state.
- Data validation and access control require follow-up wherever auth coverage, AI endpoint hardening, or RLS findings remain open.
- Supabase integration is present in package metadata in the live project.

## Integration Audit

- Frontend/backend integration cannot be considered launch-ready while build status is `failed` and test status is `failed`.
- The audit found 2 critical and 5 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for InvoiceAI:
- [FreshBooks](https://www.freshbooks.com/)
- [Wave](https://www.waveapps.com/)
- [Zoho Invoice](https://www.zoho.com/invoice/)

Observed market pain points:
- Manual invoice drafting takes too long
- Late payment follow-up is awkward and inconsistent
- Freelancers lack forward-looking cash visibility

Applied lessons for this audit:
- Keep AI drafting editable and paired with strong invoice previews
- Make payment links frictionless and reminder schedules transparent

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 22 / 100
- Current status: Needs Work
- Critical findings: 2
- High findings: 5
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: 86 / 100, LAUNCH-READY (with recommended improvements)

Completion Score: 22 / 100

## Task List

### Task 1: Close authentication coverage gaps for InvoiceAI

Research using the internet before implementing.

- Task description: Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.
- Mandatory internet research: Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.
- Frontend implementation: Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.
- Backend implementation: Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.
- Animations & usability improvements: Polish auth feedback states, success transitions, and error handling to reduce drop-off.
- Market/User pain points: Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.
- Deliverables: Working auth flows, connected backend session handling, QA checklist, and regression coverage.
- Market impact: Improves first-run conversion, lowers abandonment, and removes a core launch blocker.

### Task 2: Secure AI endpoints for InvoiceAI

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 3: Complete schema and access-control verification for InvoiceAI

Research using the internet before implementing.

- Task description: Close migration, RLS, or backend data-access gaps and ensure code and schema align.
- Mandatory internet research: Research using the internet before implementing. Review current Supabase and production database hardening patterns for apps with similar data sensitivity.
- Frontend implementation: Reflect permission-denied, empty, and sync states cleanly where backend rules affect the UI.
- Backend implementation: Add or repair migrations, validation, indexes, and RLS policies; remove overly permissive access patterns.
- Animations & usability improvements: Keep protected-state messaging calm and informative instead of abrupt.
- Market/User pain points: Data leaks, schema drift, and confusing access errors are severe launch blockers.
- Deliverables: Verified migrations, tightened policies, and updated data contracts.
- Market impact: Improves security posture, operational confidence, and auditability.

### Task 4: Close documented screen and feature gaps for InvoiceAI

Research using the internet before implementing.

- Task description: Implement or reconcile routes and flows that are described in product docs but not proven in the live code.
- Mandatory internet research: Research using the internet before implementing. Benchmark best-in-class navigation, onboarding, dashboard, and edge-state patterns for this product category.
- Frontend implementation: Build the missing screens, empty/loading/error states, and navigation hooks described in the spec.
- Backend implementation: Add any missing data, APIs, or actions required to make those screens real and connected.
- Animations & usability improvements: Apply purposeful page transitions, skeletons, and completion feedback that fit the product tone.
- Market/User pain points: Users feel misled when advertised or expected flows are absent at launch.
- Deliverables: Doc-matched routes, working feature paths, and acceptance coverage.
- Market impact: Closes expectation gaps and raises completion toward a true launch-ready surface.

### Task 5: Remove stubbed behaviors from InvoiceAI

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 6: Harden broad data queries in InvoiceAI

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 7: Complete runtime launch verification for InvoiceAI

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 8: Increase automated verification for InvoiceAI

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 9: Reconcile stale readiness reporting for InvoiceAI

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

