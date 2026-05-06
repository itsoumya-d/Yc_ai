# CompliBot - Fresh Launch Readiness Audit

- Audit date: 2026-03-12
- Platform: web
- Canonical path: `E:/Yc_ai/complibot`
- Product category: Compliance automation and policy management
- Status: Completion Score: 35 / 100

## App Inventory

- Source files scanned: 203
- Approximate source lines scanned: 37541
- Document set loaded: 8 files from `E:/Yc_ai/saas-ideas/web-first/b2b/27-complibot`
- Live page/screen routes found: 31
- Live API routes found: 4
- Build result: failed -     at <unknown> (./app/(dashboard)/policies/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/policies/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/reports/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/reports/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/billing/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/billing/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/profile/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/profile/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/tasks/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/tasks/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/training/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/training/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/vendors/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/vendors/error.tsx:3:1)
- Test result: failed -   4  |  import { redirect } from "next/navigation";
 ? TransformPluginContext._formatError node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41
 ? TransformPluginContext.error node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16
 ? normalizeUrl node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23
 ? node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39
 ? TransformPluginContext.transform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7
 ? PluginContainer.transform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18
 ? loadAndTransform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27

????????????????????????[4/4]?

 Test Files  4 failed | 4 passed (8)
      Tests  26 passed (26)
   Start at  10:42:00
   Duration  4.12s (transform 307ms, setup 1.19s, collect 396ms, tests 28ms, environment 8.51s, prepare 1.37s)


## Doc-to-Code Page And Feature Map

- Documented routes discovered from `screens.md`: 0
- Missing documented routes in live code: 0

| Documented route | Live route found | Notes |
| --- | --- | --- |
| n/a | n/a | No document routes parsed |

### Feature headings observed in docs

- F1: Framework Selector
- F2: Infrastructure Scanner
- F3: AI Policy Generator
- F4: Evidence Collector
- F5: Compliance Dashboard
- F6: Task Tracker
- F7: Continuous Monitoring
- F8: Employee Training Modules
- F9: Vendor Risk Management
- F10: Audit Room

## Module Intent Summary

The codebase for CompliBot is organized around a route-driven web application with the following dominant module buckets:

- `app`: 93 source files
- `components`: 34 source files
- `lib`: 32 source files
- `supabase`: 12 source files
- `saas-docs`: 9 source files
- `tests`: 6 source files
- `e2e`: 3 source files
- `next-env.d.ts`: 1 source files

Auth intent from live code: Google=present, Email login=present, Email signup=present, Apple=missing/unproven.

Store/runtime intent: proxy=present, OAuth callback=missing, privacy=present, terms=present.

## Critical Line-Level Appendix

### HIGH: OAuth callback route is missing

Social auth flows need a callback/code-exchange route to complete reliably in production.

- No direct line-level evidence captured for this issue.

### CRITICAL: AI generation endpoint lacks caller authentication

The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.

- `E:/Yc_ai/complibot/app/api/ai/generate/route.ts:1` - POST handler lacks a proven auth guard before OpenAI usage.

### HIGH: AI generation endpoint lacks explicit rate limiting

The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.

- `E:/Yc_ai/complibot/app/api/ai/generate/route.ts:1` - POST handler streams OpenAI output without visible AI throttle.

### HIGH: Mock or placeholder data is still present in production code paths

The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.

- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:51` - const MOCK_CATEGORIES = [
- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:80` - // Generate deterministic mock data
- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:90` - MOCK_CATEGORIES.forEach((cat, ci) => {
- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:104` - return { categories: MOCK_CATEGORIES, frameworks, cells: mockData };
- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:141` - return { categories: cats.length > 0 ? cats : MOCK_CATEGORIES, frameworks, cells };
- `E:/Yc_ai/complibot/app/(dashboard)/gap-analysis/gap-analysis-client.tsx:574` - {(controls.length > 0 ? categories : MOCK_CATEGORIES).map((cat) => (
- `E:/Yc_ai/complibot/app/(dashboard)/policies/[id]/page.tsx:102` - // Static mock data — in a real app this would be fetched by `id` from Supabase
- `E:/Yc_ai/complibot/app/(dashboard)/policies/[id]/policy-detail-client.tsx:108` - // Static mock data — in a real app this would be fetched by `id` from Supabase

### MEDIUM: Timeout-based stubs are present

The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.

- `E:/Yc_ai/complibot/app/(auth)/signup/page.tsx:47` - setTimeout(() => router.push("/onboarding/company"), 1500);
- `E:/Yc_ai/complibot/app/(dashboard)/policies/[id]/page.tsx:260` - setTimeout(() => setSaved(false), 2500);
- `E:/Yc_ai/complibot/app/(dashboard)/policies/[id]/policy-detail-client.tsx:272` - setTimeout(() => setSaved(false), 2500);
- `E:/Yc_ai/complibot/app/(dashboard)/reports/reports-client.tsx:51` - setTimeout(() => setGenerating(null), 2500);
- `E:/Yc_ai/complibot/app/(dashboard)/settings/referral/page.tsx:19` - setTimeout(() => setCopied(false), 2000);
- `E:/Yc_ai/complibot/app/(dashboard)/settings/settings-client.tsx:81` - setTimeout(() => setSaved(false), 2000);
- `E:/Yc_ai/complibot/app/onboarding/complete/page.tsx:24` - const timer = setTimeout(() => {
- `E:/Yc_ai/complibot/components/CommandPalette.tsx:243` - debounceRef.current = setTimeout(async () => {

### MEDIUM: Broad select(*) queries remain in the data layer

Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.

- `E:/Yc_ai/complibot/components/NotificationCenter.tsx:67` - .select('*')
- `E:/Yc_ai/complibot/lib/actions/account.ts:70` - .select('*')
- `E:/Yc_ai/complibot/lib/actions/audit.ts:12` - .select('*')
- `E:/Yc_ai/complibot/lib/actions/audit.ts:29` - .select('*')
- `E:/Yc_ai/complibot/lib/actions/audit.ts:52` - .select('*')

### MEDIUM: Open TODO/FIXME markers remain in the shipped code

There are still explicit unfinished-code markers in the repository, which should be resolved or converted to tracked issues before launch.

- `E:/Yc_ai/complibot/app/(dashboard)/tasks/tasks-client.tsx:6` - type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
- `E:/Yc_ai/complibot/app/(dashboard)/tasks/tasks-client.tsx:23` - { id: "todo", label: "To Do", color: "bg-gray-400", headerBg: "bg-gray-50" },
- `E:/Yc_ai/complibot/components/CommandPalette.tsx:98` - keywords: ['tasks', 'todo', 'action items'],
- `E:/Yc_ai/complibot/lib/actions/dashboard.ts:49` - .in('status', ['todo', 'in_progress', 'in_review']),
- `E:/Yc_ai/complibot/lib/actions/dashboard.ts:55` - .in('status', ['todo', 'in_progress'])
- `E:/Yc_ai/complibot/lib/actions/dashboard.ts:84` - .in('status', ['todo', 'in_progress'])
- `E:/Yc_ai/complibot/lib/schema.sql:110` - status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
- `E:/Yc_ai/complibot/lib/utils.ts:44` - case "todo":

### HIGH: Build verification failed

The recorded runtime build check failed:     at <unknown> (./app/(dashboard)/policies/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/policies/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/reports/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/reports/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/billing/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/billing/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/profile/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/settings/profile/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/tasks/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/tasks/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/training/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/training/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/vendors/error.tsx:3:1)
    at <unknown> (./app/(dashboard)/vendors/error.tsx:3:1)

- No direct line-level evidence captured for this issue.

### HIGH: Automated tests/checks failed

The recorded runtime test or typecheck failed:   4  |  import { redirect } from "next/navigation";
 ? TransformPluginContext._formatError node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41
 ? TransformPluginContext.error node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16
 ? normalizeUrl node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23
 ? node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39
 ? TransformPluginContext.transform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7
 ? PluginContainer.transform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18
 ? loadAndTransform node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27

????????????????????????[4/4]?

 Test Files  4 failed | 4 passed (8)
      Tests  26 passed (26)
   Start at  10:42:00
   Duration  4.12s (transform 307ms, setup 1.19s, collect 396ms, tests 28ms, environment 8.51s, prepare 1.37s)


- No direct line-level evidence captured for this issue.


## Frontend Audit

- Route/screen surface appears aligned with the documentation.
- UX state coverage is reasonably complete based on route evidence, but runtime proof is still missing.
- Design-system and interaction quality require follow-up wherever the findings list flags mock data, missing screens, or stubbed flows.

## Backend Audit

- Backend readiness is partially provable from the checked-in schema/config state.
- Data validation and access control require follow-up wherever auth coverage, AI endpoint hardening, or RLS findings remain open.
- Supabase integration is present in package metadata in the live project.

## Integration Audit

- Frontend/backend integration cannot be considered launch-ready while build status is `failed` and test status is `failed`.
- The audit found 1 critical and 5 high issue(s) that still interrupt full end-to-end confidence.

## Research And Benchmarking

Benchmark set for CompliBot:
- [Vanta](https://www.vanta.com/)
- [Drata](https://drata.com/)
- [Secureframe](https://secureframe.com/)

Observed market pain points:
- Compliance work is repetitive, evidence-heavy, and easy to let drift
- Framework views often bury actual remediation tasks and policy ownership
- Automation loses value when integrations and approvals are partial

Applied lessons for this audit:
- Expose framework progress, policy editing, and evidence gaps in one place
- Keep control ownership, audit evidence, and integrations visibly connected

Current official launch-policy references used during this audit: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo SDK](https://expo.dev/sdk), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Review Prep](https://developer.apple.com/app-store/review/), [Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [Play Console Help](https://support.google.com/googleplay/android-developer/).

## Launch-Readiness Verdict

- Fresh score: 35 / 100
- Current status: Needs Work
- Critical findings: 1
- High findings: 5
- Medium findings: 3
- Low findings: 0
- Earlier portfolio report marked app ready: no
- Prior app-level audit score/status: n/a / 100, n/a

Completion Score: 35 / 100

## Task List

### Task 1: Close authentication coverage gaps for CompliBot

Research using the internet before implementing.

- Task description: Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.
- Mandatory internet research: Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.
- Frontend implementation: Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.
- Backend implementation: Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.
- Animations & usability improvements: Polish auth feedback states, success transitions, and error handling to reduce drop-off.
- Market/User pain points: Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.
- Deliverables: Working auth flows, connected backend session handling, QA checklist, and regression coverage.
- Market impact: Improves first-run conversion, lowers abandonment, and removes a core launch blocker.

### Task 2: Secure AI endpoints for CompliBot

Research using the internet before implementing.

- Task description: Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.
- Mandatory internet research: Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.
- Frontend implementation: Show auth-required, quota, retry, and degraded-service states in AI surfaces.
- Backend implementation: Add authenticated callers, throttling, logging, and validation before any model invocation.
- Animations & usability improvements: Use lightweight progress and retry feedback without hiding failure states.
- Market/User pain points: Unprotected AI endpoints create cost risk and inconsistent user trust.
- Deliverables: Protected AI routes, rate-limit telemetry, and verified client feedback states.
- Market impact: Protects margin, reduces abuse, and stabilizes a visible product differentiator.

### Task 3: Replace mock data with production data wiring in CompliBot

Research using the internet before implementing.

- Task description: Remove mock or placeholder datasets from active flows and connect them to live backend state.
- Mandatory internet research: Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.
- Frontend implementation: Swap mock collections for real fetch/store state with resilient loading and empty states.
- Backend implementation: Provide live queries, writes, validation, and test data seeding where needed.
- Animations & usability improvements: Use skeletons and optimistic feedback rather than fake completed states.
- Market/User pain points: Mock data destroys trust the moment a user notices it.
- Deliverables: Real data integrations, migration-safe seed strategy, and QA proof.
- Market impact: Improves credibility, retention, and supportability.

### Task 4: Remove stubbed behaviors from CompliBot

Research using the internet before implementing.

- Task description: Replace timeout-driven or simulated behaviors with real integrations and state transitions.
- Mandatory internet research: Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.
- Frontend implementation: Swap simulated completion logic for true async state handling and recovery UX.
- Backend implementation: Connect the real service integrations or API calls that the stub currently imitates.
- Animations & usability improvements: Preserve smooth progress feedback while accurately reflecting real operation state.
- Market/User pain points: Stubbed flows mislead users and hide integration risk until launch.
- Deliverables: Real end-to-end behavior and clearly bounded failure states.
- Market impact: Reduces false confidence and eliminates last-mile launch surprises.

### Task 5: Harden broad data queries in CompliBot

Research using the internet before implementing.

- Task description: Replace wildcard reads with explicit selects and tighten payload shape and permissions.
- Mandatory internet research: Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.
- Frontend implementation: Adjust consumers to accept explicit typed payloads and clear fallback states.
- Backend implementation: Scope queries, reduce overfetching, and align returned fields with UI needs.
- Animations & usability improvements: Keep list loading and refresh transitions responsive after payload tightening.
- Market/User pain points: Overfetching slows mobile and web surfaces and makes security review harder.
- Deliverables: Explicit field queries, stable types, and verified behavior parity.
- Market impact: Improves performance, privacy posture, and maintenance safety.

### Task 6: Resolve open implementation markers in CompliBot

Research using the internet before implementing.

- Task description: Convert TODO/FIXME code markers into completed work or intentionally deferred tracked items.
- Mandatory internet research: Research using the internet before implementing. Review launch-readiness checklists and best practices for converting temporary scaffolding into production-safe behavior.
- Frontend implementation: Remove unfinished UI branches and clarify any intentionally deferred surfaces.
- Backend implementation: Finish or isolate incomplete logic, logging, and validation paths.
- Animations & usability improvements: Ensure no unfinished state transitions remain visible to users.
- Market/User pain points: Open implementation markers often map directly to real defects at launch.
- Deliverables: Clean code paths, resolved notes, and release-safe backlog decisions.
- Market impact: Reduces regressions and improves confidence in the shipped surface.

### Task 7: Complete runtime launch verification for CompliBot

Research using the internet before implementing.

- Task description: Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.
- Mandatory internet research: Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.
- Frontend implementation: Fix runtime regressions, broken routes, and environment-gated UI failures.
- Backend implementation: Resolve env, callback, API, and integration issues blocking true end-to-end verification.
- Animations & usability improvements: Verify loading, error, and retry flows under realistic runtime conditions.
- Market/User pain points: A codebase can look complete while failing at build or first-run runtime.
- Deliverables: Passing build evidence, smoke-test notes, and updated readiness status.
- Market impact: Turns static readiness into deployable confidence.

### Task 8: Increase automated verification for CompliBot

Research using the internet before implementing.

- Task description: Add or repair build, test, typecheck, and smoke-test coverage for critical paths.
- Mandatory internet research: Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.
- Frontend implementation: Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.
- Backend implementation: Add integration and validation tests for actions, APIs, and permission boundaries.
- Animations & usability improvements: Include visual or interaction checks where motion affects usability or trust.
- Market/User pain points: Unverified launches create hidden breakage across auth, billing, and onboarding.
- Deliverables: Reliable build/test commands, coverage around critical flows, and CI-ready scripts.
- Market impact: Raises release confidence and shortens future audit cycles.

