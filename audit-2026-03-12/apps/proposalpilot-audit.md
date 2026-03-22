# ProposalPilot - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/proposalpilot`
- Product category: AI proposal generation and sales enablement
- Status: Completion Score: 44 / 100

## App Inventory

- Source files scanned: 230
- Approximate source lines scanned: 41174
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2b/26-proposalpilot`
- Live page/screen routes found: 33
- Live API routes found: 6
- Build result: failed -   6 | import { headers } from 'next/headers';



Import trace:
  App Route:
    ./lib/actions/billing.ts
    ./app/api/webhooks/stripe/route.ts

https://nextjs.org/docs/messages/module-not-found


    at async DummySpan.traceAsyncFn (turbopack:///[turbopack-node]/transforms/webpack-loaders.ts:115:12) [E:\Yc_ai\proposalpilot\.next\build\chunks\[root-of-the-server]__6e020478._.js:126:16])
    at async DummySpan.traceAsyncFn (turbopack:///[turbopack-node]/transforms/webpack-loaders.ts:115:12) [E:\Yc_ai\proposalpilot\.next\build\chunks\[root-of-the-server]__6e020478._.js:126:16])
    at <unknown> (./lib/actions/billing.ts:3:1)
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

 Test Files  3 failed | 2 passed (5)
      Tests  9 passed (9)
   Start at  10:41:05
   Duration  3.89s (transform 134ms, setup 674ms, collect 215ms, tests 12ms, environment 4.52s, prepare 880ms)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 12
- Missing documented routes in live code: 12

| Documented route | Live route found | Notes |
| --- | --- | --- |
| `/(app)/analytics` | no | Not found in live route scan |
| `/(app)/clients` | no | Not found in live route scan |
| `/(app)/content-library` | no | Not found in live route scan |
| `/(app)/dashboard` | no | Not found in live route scan |
| `/(app)/proposals` | no | Not found in live route scan |
| `/(app)/proposals/[id]/analytics` | no | Not found in live route scan |
| `/(app)/proposals/[id]/edit` | no | Not found in live route scan |
| `/(app)/proposals/new` | no | Not found in live route scan |
| `/(app)/settings/branding` | no | Not found in live route scan |
| `/(app)/settings/team` | no | Not found in live route scan |
| `/(app)/templates` | no | Not found in live route scan |
| `/(public)/p/[id]` | no | Not found in live route scan |

### Feature headings observed in docs

- F1.1 AI Proposal Generator
- F1.2 Proposal Template Library
- F1.3 Rich Text Editor
- F1.4 Pricing Table Builder
- F1.5 E-Signature Integration
- F1.6 Proposal Analytics
- F1.7 PDF & Web Export
- F1.8 Client-Facing Proposal Portal
- F2.1 Win Rate Analytics
- F2.2 SOW Generator

## Module Intent Summary

The codebase for ProposalPilot is organized around a route-driven web application with the following dominant module buckets:

- `app`: 92 source files
- `components`: 58 source files
- `lib`: 28 source files
- `supabase`: 11 source files
- `26-proposalpilot`: 9 source files
- `saas-docs`: 9 source files
- `e2e`: 3 source files
- `tests`: 3 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=present, privacy=present, terms=present.

## Critical Line-Level Appendix

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/proposalpilot/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/proposalpilot/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### HIGH: Documented screens are not fully matched in live routes

The docs describe 12 route(s), but 12 route(s) were not mapped to a live page or screen implementation.

- `documentation` - /(app)/analytics
- `documentation` - /(app)/clients
- `documentation` - /(app)/content-library
- `documentation` - /(app)/dashboard
- `documentation` - /(app)/proposals

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/proposalpilot/app/(dashboard)/settings/referral/page.tsx:19` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/proposalpilot/components/CommandPalette.tsx:191` - debounceRef.current = setTimeout(async () => {
- `E:/Yc_ai/proposalpilot/components/CommandPalette.tsx:208` - setTimeout(() => inputRef.current?.focus(), 50);
- `E:/Yc_ai/proposalpilot/components/proposals/proposal-detail.tsx:597` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/proposalpilot/components/proposals/proposal-section-list.tsx:39` - await new Promise((resolve) => setTimeout(resolve, 1800));
- `E:/Yc_ai/proposalpilot/components/settings/team-settings.tsx:49` - await new Promise((r) => setTimeout(r, 800));
- `E:/Yc_ai/proposalpilot/components/ui/toast.tsx:31` - setTimeout(() => {
- `E:/Yc_ai/proposalpilot/lib/hooks/useAutoSave.ts:49` - timerRef.current = setTimeout(async () => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/proposalpilot/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/proposalpilot/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/proposalpilot/lib/actions/clients.ts:14` - const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
- `E:/Yc_ai/proposalpilot/lib/actions/clients.ts:23` - const { data, error } = await supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single();
- `E:/Yc_ai/proposalpilot/lib/actions/content-blocks.ts:13` - const { data, error } = await supabase.from('content_blocks').select('*').eq('user_id', user.id).order('block_type').order('title');

### HIGH: Build verification failed

The recorded runtime build check failed:   6 | import { headers } from 'next/headers';



Import trace:
  App Route:
    ./lib/actions/billing.ts
    ./app/api/webhooks/stripe/route.ts

https://nextjs.org/docs/messages/module-not-found


    at async DummySpan.traceAsyncFn (turbopack:///[turbopack-node]/transforms/webpack-loaders.ts:115:12) [E:\Yc_ai\proposalpilot\.next\build\chunks\[root-of-the-server]__6e020478._.js:126:16])
    at async DummySpan.traceAsyncFn (turbopack:///[turbopack-node]/transforms/webpack-loaders.ts:115:12) [E:\Yc_ai\proposalpilot\.next\build\chunks\[root-of-the-server]__6e020478._.js:126:16])
    at <unknown> (./lib/actions/billing.ts:3:1)
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

 Test Files  3 failed | 2 passed (5)
      Tests  9 passed (9)
   Start at  10:41:05
   Duration  3.89s (transform 134ms, setup 674ms, collect 215ms, tests 12ms, environment 4.52s, prepare 880ms)


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
- The audit found 1 critical and 4 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for ProposalPilot:
- [PandaDoc](https://www.pandadoc.com/)
- [Proposify](https://www.proposify.com/)
- [Qwilr](https://qwilr.com/)

Observed market pain points:
- Proposal creation is repetitive and error-prone
- Sales teams struggle to keep branding, pricing, and approvals consistent
- Tracking engagement after a proposal is sent is often weak

Applied lessons for this audit:
- Pair reusable templates with AI drafting, versioning, and approval-safe data models
- Treat proposal analytics and follow-up prompts as first-class product surfaces

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 44 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 4
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: yes
- Prior app-level audit score/status: n/a / 100, n/a

Completion Score: 44 / 100

## Task List

### Task 1: Secure AI endpoints for ProposalPilot

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 2: Close documented screen and feature gaps for ProposalPilot

Research using the internet before implementing.

- Task description: Implement or reconcile routes and flows that are described in product docs but not proven in the live code.
- Mandatory internet research: Research using the internet before implementing. Benchmark best-in-class navigation, onboarding, dashboard, and edge-state patterns for this product category.
- Frontend implementation: Build the missing screens, empty/loading/error states, and navigation hooks described in the spec.
- Backend implementation: Add any missing data, APIs, or actions required to make those screens real and connected.
- Animations & usability improvements: Apply purposeful page transitions, skeletons, and completion feedback that fit the product tone.
- Market/User pain points: Users feel misled when advertised or expected flows are absent at launch.
- Deliverables: Doc-matched routes, working feature paths, and acceptance coverage.
- Market impact: Closes expectation gaps and raises completion toward a true launch-ready surface.

### Task 3: Remove stubbed behaviors from ProposalPilot

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 4: Harden broad data queries in ProposalPilot

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 5: Complete runtime launch verification for ProposalPilot

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 6: Increase automated verification for ProposalPilot

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

### Task 7: Reconcile stale readiness reporting for ProposalPilot

Research using the internet before implementing.

- Task description: Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.
- Mandatory internet research: Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.
- Frontend implementation: No direct feature work unless the stale reporting masked a UI gap.
- Backend implementation: No direct backend change unless the stale reporting masked a backend gap.
- Animations & usability improvements: Not applicable beyond keeping any status UI calm and clear.
- Market/User pain points: Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.
- Deliverables: Updated audit trail, corrected status reporting, and aligned acceptance criteria.
- Market impact: Improves planning accuracy and reduces false launch confidence.

