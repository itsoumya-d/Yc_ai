# CompliBot Web App — Comprehensive Audit Report

**Date:** 2026-03-11
**Auditor:** Claude Opus 4.6
**App Path:** `E:\Yc_ai\complibot`
**Stack:** Next.js 16.1.6 · React 19 · Tailwind v4 · Supabase SSR · Framer Motion · Zod

---

## Executive Summary

CompliBot is an AI-powered compliance automation platform targeting startups and SMBs pursuing SOC 2, GDPR, HIPAA, ISO 27001, PCI DSS, and NIST CSF certifications. The codebase demonstrates solid architectural foundations — proper server/client component separation, parallelized DB queries on the dashboard, Zod validation schemas, comprehensive RLS policies, and a well-structured migration pipeline (8 migrations). However, the app has meaningful gaps in input validation coverage across most server actions, the dashboard client component has zero dark mode support, and there is no root-level Next.js middleware.ts (meaning rate limiting is library-only, not wired into the request pipeline). The landing page is polished with Framer Motion animations but lacks dark mode in most sections. Competitors like Vanta, Drata, and Secureframe set a high bar for real-time monitoring dashboards, integration depth, and multi-tenant RBAC — areas where CompliBot needs investment.

**Overall Score: 74 / 100**

---

## Section Scores

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Frontend Quality | 15 | 20 | Strong landing page, good component system, but dashboard has zero dark mode, limited animations |
| Backend Quality | 14 | 20 | Good dashboard query optimization, but 18 `select('*')` calls, only 2/12 actions use Zod, no root middleware |
| Performance | 16 | 20 | Server components for data fetching, `unstable_cache` on frameworks, `Promise.all` parallelization, but `select('*')` waste and no ISR |
| Accessibility | 12 | 20 | 22 aria attributes across components, sidebar has `aria-label`, but 0 aria in dashboard-client, no skip nav, no focus management |
| Security | 17 | 20 | Comprehensive CSP, HSTS, RLS policies on all tables, but no root middleware for rate limiting, gap-analysis has no input validation |

**Total: 74 / 100**

---

## Detailed Evaluation

### 1. Frontend Quality (15/20)

**Strengths:**
- Landing page (`app/page.tsx`) is a comprehensive 712-line page with Framer Motion scroll animations (`fadeUp`, `stagger`, `AnimatedSection`), shimmer text gradient, framework pills, dashboard preview with SVG score rings, testimonials, FAQ accordion with `AnimatePresence`, annual/monthly pricing toggle, newsletter signup, and ROI calculator
- Button component (`components/ui/Button.tsx`) uses `forwardRef`, 6 variants, 3 sizes, loading spinner, `active:scale-[0.97]` micro-interaction, and `focus:ring-2` focus styles
- Sidebar (`components/layout/Sidebar.tsx`) has 14 nav items, collapsible state with smooth transitions, active route highlighting, and proper `aria-label` on the collapse button
- TopBar (`components/layout/TopBar.tsx`) has full dark mode support with `dark:` variants on header, search input, profile dropdown, and menu items
- Dashboard uses `StatCard` with `animateValue` and `trend` props, `ComplianceScoreRing`, `GettingStartedChecklist`, and `ProgressRing` SVG components
- 17 loading.tsx skeleton screens covering all dashboard routes

**Weaknesses:**
- **Dashboard-client.tsx has zero `dark:` classes** — all hardcoded white/gray backgrounds. This is the most-used view and will appear broken in dark mode
- Landing page dark mode coverage is partial — only FAQ and trusted-by sections have `dark:` variants; hero, features, frameworks, pricing, testimonials, how-it-works, and final CTA sections are all hardcoded light
- Sidebar uses hardcoded `bg-[#0F172A]` dark colors (no `dark:` variant awareness — works visually but does not respond to theme toggling)
- `ProgressRing` in dashboard uses hardcoded `stroke="#E2E8F0"` — invisible in dark mode
- Footer copyright says "2024" — should be "2026"
- No mobile hamburger menu on landing page nav

### 2. Backend Quality (14/20)

**Strengths:**
- `getDashboardStats()` is exemplary — uses `Promise.all` with 9 parallel queries, `{ count: 'exact', head: true }` for count-only queries, explicit column selection, `getCachedFrameworks` with `unstable_cache` (1h TTL)
- Zod validation schemas in `lib/validations/index.ts` cover frameworks, controls, policies, and integrations with proper enum constraints, min/max lengths, and optional fields
- `frameworks.ts` uses `frameworkSchema.pick({ type: true }).safeParse()` for both create and update operations
- `lib/rate-limit.ts` provides both a sliding-window rate limiter and a simpler functional API with specific limits for AI (5/min), API (60/min), and auth (10/15min)
- 8 well-structured migrations covering schema, billing, infrastructure scanning, drip emails, storage, RLS, performance indexes, and notifications
- RLS policies in `006_rls_policies.sql` are comprehensive — per-operation (SELECT/INSERT/UPDATE/DELETE) for all 8 tables with org-scoped and user-scoped patterns

**Weaknesses:**
- **18 `.select('*')` calls** across server actions (gap-analysis, frameworks, vendors, evidence, policies, audit, training, reports, monitoring, tasks, settings) — only `dashboard.ts` uses explicit column selection
- **Only 2 of ~12 server action files use Zod validation** (frameworks.ts, policies.ts) — gap-analysis, evidence, vendors, tasks, training, monitoring, and audit accept unvalidated user input
- **No root-level `middleware.ts`** — the rate-limit library exists but is never wired into the Next.js request pipeline. The supabase middleware at `lib/supabase/middleware.ts` only handles auth session refresh and protected route redirects
- `deleteFramework` and `deleteGapControl` do not verify user ownership before deletion — they rely entirely on RLS, which is good but defense-in-depth would add an explicit check
- 17 `console.error` calls in server actions — acceptable for logging but no structured logging or error reporting service integration
- `organization_id` columns in 001_init.sql are bare UUIDs with no foreign key constraint to an organizations table — the org model is implicit
- The `complibot_get_org_id()` function in 006_rls casts `organization_name::uuid` which is fragile if org_name is not actually a UUID

### 3. Performance (16/20)

**Strengths:**
- Dashboard page is a proper server component that fetches data then passes to client component — ideal for SSR
- `Promise.all` parallelization in dashboard with 9 concurrent queries
- `unstable_cache` with 1h revalidation on framework list (semi-static data)
- `{ count: 'exact', head: true }` avoids full row fetch for count queries
- Performance indexes in 007_performance_indexes.sql cover the 8 most common query patterns (org+status, org+due_date, control_id, risk_level, etc.)
- `next.config.ts` enables AVIF/WebP image optimization and compression
- Service worker (`sw.js`) implements cache-first for static assets and network-first with offline fallback for navigation
- `@import url(...)` for Inter font in CSS could be replaced with Next.js `next/font` (already used in layout.tsx — duplicate font load)

**Weaknesses:**
- 18 `select('*')` calls fetch all columns when only a subset is needed — this is the single biggest performance issue
- No `revalidateTag()` or `revalidatePath()` usage after mutations — stale data risk
- Landing page is `'use client'` — the entire 712-line page is client-rendered. This prevents SSR of static content like features, frameworks, testimonials, pricing
- No API routes exist — all data fetching is via server actions, which is fine but means no REST API for external integrations or mobile apps
- No `Suspense` boundaries in dashboard layout for progressive loading
- Globals.css imports Google Fonts via `@import url()` — redundant with the `next/font/google` Inter import in layout.tsx, causing a double font load

### 4. Accessibility (12/20)

**Strengths:**
- Sidebar has `aria-label="Main navigation"` on the nav element and `aria-label` on collapse button
- TopBar has `aria-label="User menu"`, `aria-haspopup="true"`, `aria-expanded` on profile dropdown, and `aria-label` on search input
- Button component has proper `disabled` state with `disabled:opacity-60 disabled:cursor-not-allowed`
- `html` tag has `lang="en"`
- Focus styles via `focus:ring-2 focus:ring-offset-2` on Button component
- FAQ buttons are actual `<button>` elements (not divs)

**Weaknesses:**
- **Dashboard-client.tsx has zero aria attributes** — no `aria-label` on any interactive element, no `role` attributes on data sections
- No skip navigation link at the top of the layout
- Landing page has no `aria-label` on any of the navigation anchor links, no `role="region"` on sections, no `aria-live` for the newsletter success message
- Progress rings (SVG) in dashboard have no `role="progressbar"`, no `aria-valuenow`, no `aria-valuemin`/`aria-valuemax`
- Color contrast concern: `text-gray-400` on `bg-white` may fail WCAG AA 4.5:1 ratio (gray-400 is ~#9CA3AF which has ~3:1 contrast against white)
- FAQ accordion buttons have no `aria-expanded` attribute
- Pricing toggle has no `role="switch"` or `aria-checked`
- Framework pills on landing page are not keyboard-focusable
- No `prefers-reduced-motion` media query — all Framer Motion animations run regardless of user preference

### 5. Security (17/20)

**Strengths:**
- Comprehensive CSP header in `next.config.ts` with `frame-ancestors 'none'`, specific `connect-src` allowlist for Supabase and PostHog
- HSTS with 2-year max-age, includeSubDomains, and preload directive
- `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` restricting camera/microphone/geolocation
- RLS enabled on all 8 tables with per-operation policies (006_rls_policies.sql)
- Auth-gated protected routes in supabase middleware
- Rate limit library with separate tiers (AI: 5/min, API: 60/min, Auth: 10/15min)
- OAuth credentials table (`infrastructure_connections`) is strictly user_id-scoped in RLS
- `security definer` on the auto-create profile trigger
- PostHog consent-gated with `opt_out_capturing_by_default`

**Weaknesses:**
- **No root middleware.ts** — rate limiting exists as a library but is never invoked in the request pipeline. Any route can be hit without rate limits
- `gap-analysis.ts`, `evidence.ts`, `vendors.ts`, `tasks.ts`, `training.ts`, `monitoring.ts`, `audit.ts` server actions accept raw user input with no validation — potential for injection via Supabase query parameters
- `deleteFramework` and `deleteGapControl` have no server-side ownership check — rely solely on RLS
- CSP includes `'unsafe-eval'` and `'unsafe-inline'` for scripts — weakens XSS protection significantly
- `complibot_get_org_id()` function casts `organization_name::uuid` which could throw an error if the value is not a valid UUID
- No CSRF protection beyond Supabase's built-in cookie handling
- Service worker caches all GET responses including potentially sensitive pages — no cache exclusion for auth-protected content

---

## Competitor Analysis

### Market Landscape (2026)

| Feature | Vanta | Drata | Secureframe | CompliBot |
|---------|-------|-------|-------------|-----------|
| Frameworks | 30+ | 25+ | 35+ | 6 (SOC 2, GDPR, HIPAA, ISO 27001, PCI DSS, NIST CSF) |
| Integrations | 200+ | 150+ | 200+ | ~10 (planned 50+) |
| Automation Depth | Basic test + alert | 90%+ control automation | AI-assisted | AI gap analysis + policy generation |
| Pricing | $10k+/yr | Custom | $8k+/yr | $199-499/mo (accessible) |
| Audit Room | No | Yes | Yes | Yes |
| Vendor Risk Mgmt | Yes | Yes | Yes | Yes (basic) |
| Continuous Monitoring | Real-time | Real-time | Real-time | Alert-based |
| Multi-tenant RBAC | Full | Full | Full | Implicit org model |
| Trust Center | Yes | Yes | Yes | No |
| Employee Training | Via partners | Built-in | Via partners | Built-in |

### Key Competitive Gaps
1. **Trust Center / Security Page** — Vanta and Drata offer a public-facing trust center that customers can share with prospects. CompliBot lacks this entirely
2. **Integration Depth** — Competitors have 150-200+ native integrations; CompliBot's integration system exists in the DB schema but the UI/API surface is minimal
3. **Real-time Continuous Monitoring** — Competitors scan infrastructure in real-time; CompliBot has a monitoring section but the backend implementation appears to be alert-based
4. **Multi-tenant RBAC** — No proper organizations table; the org model uses an implicit `organization_name` text field. Competitors offer role-based access (admin, auditor, viewer, etc.)
5. **Compliance Score Benchmarking** — Competitors show how you compare against similar companies in your industry

### CompliBot's Competitive Advantages
1. **Pricing** — 5-10x cheaper than enterprise competitors ($199/mo vs $10k+/yr)
2. **AI-first Approach** — AI streaming for gap analysis, policy generation, and compliance recommendations is more prominent than competitors
3. **Developer-friendly** — Modern stack (Next.js 16, React 19), clean codebase, PWA-ready
4. **Audit Room** — Dedicated auditor portal matches enterprise competitors
5. **Built-in Training** — Training module is built-in rather than via third-party

---

## Task List: 12 Improvement Tasks

---

### Task 1: Dashboard Dark Mode Overhaul

**Description:** The main dashboard (`dashboard-client.tsx`) has zero `dark:` CSS classes. Every background, border, and text color is hardcoded for light mode. Users who toggle dark mode see white cards on a dark shell — broken UX that undermines trust in a compliance product.

**Research:** Vanta and Drata both offer consistent dark/light mode across all dashboard views. Users spend 60%+ of their time on the dashboard, making this the highest-impact visual fix. Dark mode reduces eye strain during long audit prep sessions.

**Frontend:**
- Add `dark:bg-gray-900` to the dashboard wrapper, `dark:bg-gray-800` to all card containers, `dark:border-gray-700` to all borders
- Update all `text-gray-900` to include `dark:text-gray-100`, `text-gray-500` to `dark:text-gray-400`, `text-gray-400` to `dark:text-gray-500`
- Fix `ProgressRing` SVG: change hardcoded `stroke="#E2E8F0"` to use CSS variable or conditional class
- Update critical items list, activity feed, upcoming audits section with full dark variants
- Test in both modes; ensure no white flashes on theme toggle

**Backend:** No backend changes needed.

**Animations & UX:**
- Add smooth `transition-colors duration-200` on card containers for seamless theme switching
- Ensure `ComplianceScoreRing` and `StatCard` components also have dark mode support

**Pain Points Addressed:** Broken dark mode on the most-used page; visual inconsistency with Sidebar/TopBar which already support dark mode.

**Deliverables:**
- Updated `dashboard-client.tsx` with full `dark:` variant coverage
- Updated `ProgressRing` component
- Visual regression test screenshots for both themes

**Market Impact:** Dark mode parity is table stakes for 2026 SaaS — without it, the product looks unfinished to technical buyers evaluating compliance tools.

---

### Task 2: Root Middleware with Rate Limiting

**Description:** There is no root-level `middleware.ts` file. The rate-limit library (`lib/rate-limit.ts`) is well-implemented but never wired into the Next.js middleware pipeline. This means every route — including auth endpoints — can be hit without any rate limiting.

**Research:** OWASP rates brute force and credential stuffing as top-10 API risks. Competitors like Drata and Secureframe implement rate limiting at the edge. For a compliance automation product, having unprotected endpoints is particularly damaging to credibility.

**Frontend:** No frontend changes.

**Backend:**
- Create `middleware.ts` at project root
- Import `updateSession` from `lib/supabase/middleware`
- Import `checkRateLimit`, `rateLimitResponse`, `addRateLimitHeaders` from `lib/rate-limit`
- Apply rate limits: 100/min for general API, 10/min for auth routes (`/login`, `/signup`, `/auth/callback`), 5/min for AI routes
- Exclude static assets, `_next`, and webhook paths from rate limiting
- Extract client IP from `x-forwarded-for` or `request.ip`
- Add `addRateLimitHeaders` to all passing responses

**Animations & UX:** Show a user-friendly toast when rate limited rather than a raw JSON error.

**Pain Points Addressed:** Unprotected auth endpoints vulnerable to brute force; compliance product with weak security posture.

**Deliverables:**
- `middleware.ts` at project root with rate limiting + session refresh
- Rate limit response includes `Retry-After` header
- Integration test for rate limit behavior

**Market Impact:** Critical for sales to security-conscious buyers; a compliance tool must demonstrate its own security hygiene.

---

### Task 3: Input Validation on All Server Actions

**Description:** Only 2 of ~12 server action files use Zod validation (frameworks.ts, policies.ts). The remaining 10 accept raw user input that passes directly to Supabase queries. While RLS provides a safety net, defense-in-depth requires server-side validation.

**Research:** OWASP A03:2021 (Injection) and A04:2021 (Insecure Design) both cite insufficient input validation. In a compliance product handling sensitive organizational data, this is especially critical.

**Frontend:** Display validation error messages from server actions in form UI using the existing toast system.

**Backend:**
- Add Zod schemas to `lib/validations/index.ts` for: gap controls, evidence, vendors, tasks, training modules, monitoring rules, audit entries, reports
- Apply `.safeParse()` in every `create*` and `update*` server action
- Return structured `{ error: string }` on validation failure
- Validate ID parameters (UUIDs) in update/delete operations
- Add max-length constraints to all text fields to prevent payload abuse

**Animations & UX:** Inline validation errors with shake animation on invalid fields (reuse existing `@keyframes shake` from globals.css).

**Pain Points Addressed:** 10 server actions accept unvalidated input; potential for malformed data to enter the DB.

**Deliverables:**
- Extended `lib/validations/index.ts` with schemas for all entity types
- All server actions in `lib/actions/` using Zod validation
- Unit tests for validation schemas

**Market Impact:** Defense-in-depth validates CompliBot's own security story — essential when selling to security teams.

---

### Task 4: Replace `select('*')` with Explicit Columns

**Description:** 18 `.select('*')` calls across server actions fetch every column including large text fields, timestamps, and metadata that the UI never displays. Only `dashboard.ts` uses explicit column selection.

**Research:** PostgreSQL `SELECT *` has measurable performance impact: increased network payload, higher memory usage, and prevents covering index optimizations. Supabase's PostgREST layer serializes all columns to JSON, compounding the cost.

**Frontend:** No frontend changes needed; UI already destructures only the fields it needs.

**Backend:**
- Audit each server action's return type and the client component that consumes it
- Replace `.select('*')` with explicit column lists matching what the UI renders
- For list views, fetch only summary fields; add separate `getById` actions for detail views
- Use `{ count: 'exact', head: true }` for any count-only queries (follow dashboard.ts pattern)
- Verify all affected pages still render correctly after column restriction

**Animations & UX:** Faster initial page loads will make skeleton-to-content transitions feel snappier.

**Pain Points Addressed:** Unnecessary data transfer; missed covering index opportunities; slower page loads.

**Deliverables:**
- All 18 `select('*')` calls replaced with explicit column lists
- Performance benchmark before/after (network payload size)
- No UI regressions

**Market Impact:** Faster dashboard loads directly impact user retention — compliance teams spend hours in the tool daily.

---

### Task 5: Landing Page SSR Optimization

**Description:** The entire landing page (`app/page.tsx`) is a `'use client'` component at 712 lines. This means the full page (features, frameworks, pricing, testimonials, FAQ data) is client-rendered, losing SSR benefits for SEO and initial load performance.

**Research:** Next.js 16 recommends server components by default. For marketing/landing pages, SSR is critical for SEO crawlers (Google bot renders JS but deprioritizes client-rendered content). Competitors' landing pages are fully SSR with selective client interactivity.

**Frontend:**
- Convert `page.tsx` to a server component
- Extract interactive elements into separate client components: `HeroAnimations.tsx`, `PricingToggle.tsx`, `FAQAccordion.tsx`, `NewsletterForm.tsx`
- Keep static content (features array, frameworks array, testimonials, stats) as server-rendered
- Use `Suspense` boundaries around interactive sections

**Backend:** No backend changes.

**Animations & UX:**
- Framer Motion animations still work in client component islands
- First Contentful Paint (FCP) will improve significantly since static content renders server-side
- Consider adding `motion` with `initial={false}` to prevent animation flash on SSR

**Pain Points Addressed:** Client-rendered landing page hurts SEO and initial load; 712-line client component is a code smell.

**Deliverables:**
- Server component `page.tsx` with 4-5 client component islands
- Lighthouse score improvement (target: 90+ Performance)
- Verified OG image and metadata still work

**Market Impact:** SEO-critical for organic acquisition — compliance buyers heavily research before purchasing.

---

### Task 6: Proper Organizations Table and Multi-tenant RBAC

**Description:** CompliBot uses an implicit organization model — `organization_id` is a bare UUID column with no foreign key, and `organization_name` is a text field on profiles used in RLS policies. There is no organizations table, no roles (admin/member/auditor/viewer), and the `complibot_get_org_id()` function unsafely casts `organization_name::uuid`.

**Research:** Vanta, Drata, and Secureframe all support multi-user organizations with role-based access. Enterprise buyers require admin/auditor/viewer roles to give auditors read-only access. The current implicit model will break at scale.

**Frontend:**
- Create an Organization Settings page with member management UI
- Add role badges in the sidebar (Admin, Auditor, Viewer)
- Conditional UI based on role (e.g., auditors cannot create/delete controls)
- Invite flow via email

**Backend:**
- Create migration `009_organizations.sql` with tables: `organizations` (id, name, slug, plan, created_at), `organization_members` (org_id, user_id, role ENUM, invited_at, accepted_at)
- Add `organization_id UUID REFERENCES organizations(id)` FK to all relevant tables
- Update all RLS policies to use proper org membership lookup
- Create server actions: `createOrganization`, `inviteMember`, `updateMemberRole`, `removeMember`
- Migrate existing data: create org records from distinct organization_name values

**Animations & UX:**
- Role-based sidebar: greyed-out nav items for insufficient permissions with tooltip explanation
- Invite member modal with email input and role selector
- Member list with avatar, role badge, and status (active/pending)

**Pain Points Addressed:** No proper multi-tenancy; fragile org model; no RBAC; blocks enterprise sales.

**Deliverables:**
- `009_organizations.sql` migration
- Organization settings page with member management
- Updated RLS policies
- Role-based UI gating

**Market Impact:** RBAC is a hard requirement for enterprise sales — this is the #1 blocker for moving upmarket.

---

### Task 7: Trust Center / Public Compliance Page

**Description:** Competitors (Vanta, Drata, Secureframe) all offer a public-facing trust center that companies can share with prospects and partners to demonstrate their compliance posture. CompliBot has no equivalent feature.

**Research:** Trust centers have become a standard B2B sales enablement tool. Vanta's Trust Center is cited as a key differentiator. Prospects evaluate vendors by reviewing their public compliance status before even requesting a demo.

**Frontend:**
- Create `/trust` public page with: company name, active certifications (SOC 2 badge, ISO 27001 badge, etc.), last audit date, data processing locations, sub-processors list, downloadable documents (SOC 2 report, privacy policy)
- Custom branding: company logo, brand colors
- Status badges: "Compliant", "In Progress", "Renewal Pending"
- Document request form (gated behind email capture)

**Backend:**
- Create `trust_center_settings` table: org_id, enabled, custom_domain, brand_color, logo_url, visible_frameworks, visible_documents
- Server actions: `getTrustCenterConfig`, `updateTrustCenterConfig`
- Public API route for trust center data (no auth required for public view)
- Document access logging for analytics

**Animations & UX:**
- Animated certification badges that "stamp" in on load
- Smooth scroll sections
- Download button with progress indicator
- Mobile-responsive single-column layout

**Pain Points Addressed:** No way for CompliBot customers to showcase their compliance status to their own prospects.

**Deliverables:**
- `/trust` public page with customizable layout
- Trust center settings in organization dashboard
- Custom domain support (CNAME)
- Analytics on document downloads

**Market Impact:** Trust centers are a key sales differentiator and create viral distribution — every prospect who views a trust center is a potential CompliBot customer.

---

### Task 8: Accessibility Overhaul (WCAG AA)

**Description:** The app has 22 aria attributes across components but the main dashboard-client.tsx has zero. Landing page lacks skip navigation, proper ARIA landmarks, and `prefers-reduced-motion` support. SVG progress rings have no accessible labels.

**Research:** WCAG 2.1 AA compliance is increasingly required for enterprise procurement (especially in regulated industries that CompliBot targets). SOC 2 Trust Services Criteria include accessibility considerations.

**Frontend:**
- Add skip navigation link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`
- Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label` to all SVG progress rings
- Add `aria-expanded` to FAQ accordion buttons on landing page
- Add `role="switch"`, `aria-checked` to pricing toggle
- Add `aria-live="polite"` to newsletter success message
- Add `role="region"` and `aria-label` to major landing page sections
- Add `@media (prefers-reduced-motion: reduce)` to globals.css to disable animations
- Fix color contrast: replace `text-gray-400` on white backgrounds with `text-gray-500` (4.6:1 ratio)
- Add keyboard navigation to landing page framework pills
- Ensure all icon-only buttons in dashboard have `aria-label`

**Backend:** No backend changes.

**Animations & UX:**
- `prefers-reduced-motion` media query wrapping all keyframe animations
- Focus visible outlines on all interactive elements
- Tab order audit across all dashboard pages

**Pain Points Addressed:** Fails WCAG AA on several criteria; blocks enterprise procurement in regulated industries.

**Deliverables:**
- Accessibility audit checklist (axe-core scan results)
- All WCAG AA violations fixed
- `prefers-reduced-motion` support
- Keyboard navigation tested across all pages

**Market Impact:** Accessibility compliance is a procurement checkbox for healthcare (HIPAA) and government (Section 508) customers — core CompliBot segments.

---

### Task 9: Integration Hub with Real Connectors

**Description:** CompliBot's landing page advertises 50+ integrations, but the actual codebase has only the schema (`003_infrastructure_scanning.sql`) and a basic integrations page. Competitors like Vanta have 200+ working connectors that continuously collect evidence.

**Research:** Automated evidence collection via integrations is the #1 value driver for compliance tools. Users cite "connecting their stack" as the primary reason for choosing one tool over another. Drata automates 90%+ of controls through deep integrations.

**Frontend:**
- Create `/integrations` hub page with categories: Cloud (AWS, GCP, Azure), Version Control (GitHub, GitLab), Identity (Okta, Auth0), HR (Rippling, BambooHR), MDM (Jamf, Kandji), Monitoring (Datadog, PagerDuty)
- OAuth connect flow with status indicators (Connected, Disconnected, Error)
- Per-integration health check dashboard showing last sync time, evidence collected, errors
- Integration detail page showing which controls the integration satisfies

**Backend:**
- Create integration adapters for top 5 priority connectors: AWS (IAM, S3, CloudTrail), GitHub (branch protection, code scanning), Okta (user provisioning, MFA status), GCP (IAM, audit logs), Jira (issue tracking)
- OAuth 2.0 flow handlers in API routes
- Background sync job (Supabase Edge Functions) that polls integrations hourly
- Evidence auto-mapping: integration data -> framework controls
- Webhook receivers for real-time updates (GitHub webhooks, AWS EventBridge)

**Animations & UX:**
- Integration card grid with status pulse dots (green=healthy, amber=warning, red=error)
- Connect modal with step-by-step OAuth wizard
- Sync progress indicator with live log streaming
- Evidence auto-collection animation (data flowing from integration to evidence vault)

**Pain Points Addressed:** Advertised integrations do not exist; manual evidence collection defeats the product's value proposition.

**Deliverables:**
- 5 working integration connectors with OAuth flows
- Evidence auto-collection pipeline
- Integration health monitoring dashboard
- Control-to-integration mapping

**Market Impact:** Integrations are the #1 buying criterion for compliance tools. Without working connectors, CompliBot cannot compete.

---

### Task 10: Continuous Monitoring Real-time Dashboard

**Description:** The monitoring section exists in the sidebar but the current implementation is basic alert rules. Competitors offer real-time infrastructure scanning with live status dashboards showing green/amber/red for every control.

**Research:** Drata's real-time monitoring is cited as its strongest differentiator. Continuous monitoring means compliance is maintained 24/7, not just at audit time. This is the shift from "point-in-time" to "continuous" compliance.

**Frontend:**
- Real-time control status grid: each control shows green (passing), amber (degraded), or red (failing) with last-checked timestamp
- Infrastructure topology view showing connected services and their compliance status
- Alert timeline with severity (critical, high, medium, low), affected control, and remediation steps
- Compliance drift detection: visual diff showing what changed and when
- SLA uptime tracker for each control

**Backend:**
- Create `monitoring_checks` table: control_id, integration_id, status (pass/fail/warn), last_checked, details_json
- Background Edge Function running every 15 minutes to check all connected integrations
- Push notification on status change (use existing web push infrastructure)
- Alert rules engine: conditions + actions (notify, create task, escalate)
- Compliance posture history: time-series data for trend analysis

**Animations & UX:**
- Pulsing green dots for healthy controls, static red for failing
- Animated status transitions (green->amber->red) with Framer Motion
- Real-time counter showing "X controls monitored, Y passing, Z failing"
- Toast notifications for new alerts with quick-action buttons

**Pain Points Addressed:** No real-time monitoring; compliance status is only known at manual check time.

**Deliverables:**
- Real-time monitoring dashboard
- 15-minute background check pipeline
- Alert rules engine
- Push notifications on status change
- Compliance posture history chart

**Market Impact:** Continuous monitoring is the defining feature of modern compliance platforms. Without it, CompliBot is positioned as a "preparation tool" rather than an "always-on compliance platform."

---

### Task 11: Audit Preparation Wizard

**Description:** While CompliBot has an Audit Room for auditor collaboration, there is no guided preparation workflow that walks users through getting audit-ready. Competitors offer structured readiness checklists with percentage-complete tracking.

**Research:** First-time SOC 2 audit preparation is the highest-anxiety moment for CompliBot's target customer. A guided wizard that breaks the process into manageable steps significantly reduces churn and support load.

**Frontend:**
- Multi-step wizard: (1) Framework Selection -> (2) Scope Definition -> (3) Gap Analysis Review -> (4) Policy Generation -> (5) Evidence Collection -> (6) Team Training -> (7) Mock Audit -> (8) Auditor Invitation
- Each step shows: progress percentage, required items, completed items, blockers
- Contextual help tooltips explaining why each step matters
- "Time to audit" estimate based on current progress
- Shareable readiness report (PDF export)

**Backend:**
- Create `audit_preparations` table: org_id, framework, current_step, started_at, target_date, completed_steps (jsonb)
- Server actions: `startAuditPrep`, `updateStep`, `generateReadinessReport`
- AI-powered recommendations: based on current gaps, suggest priority order
- PDF generation for readiness report (using @react-pdf/renderer or similar)

**Animations & UX:**
- Step-by-step progress bar at the top with animated fill
- Confetti animation on step completion
- Checklist items animate from pending to complete
- Estimated completion time countdown

**Pain Points Addressed:** Users do not know where to start with audit prep; high support load for onboarding.

**Deliverables:**
- 8-step audit preparation wizard
- Readiness percentage tracking
- AI-powered prioritization
- PDF readiness report

**Market Impact:** Reduces time-to-value for new users; decreases onboarding support costs; differentiates from competitors that assume domain expertise.

---

### Task 12: Remove Duplicate Font Loading and Fix CSS Issues

**Description:** `globals.css` imports Inter via `@import url('https://fonts.googleapis.com/css2?...')` while `layout.tsx` already loads Inter via `next/font/google`. This causes a duplicate font download. Additionally, the landing page footer says "2024" instead of "2026", and the Sidebar has no dark mode responsiveness.

**Research:** Double font loading adds 15-30KB of unnecessary network transfer and can cause layout shifts (CLS penalty). Google Lighthouse penalizes both duplicate resources and render-blocking `@import` statements.

**Frontend:**
- Remove the `@import url(...)` line from `globals.css` — the `next/font/google` import in layout.tsx is the correct approach (self-hosted, no external request)
- Update footer copyright from "2024" to dynamic year: `{new Date().getFullYear()}`
- Audit Sidebar for theme awareness: while the dark navy color scheme works in both modes, add explicit `dark:` variants for consistency
- Fix landing page sections missing dark mode: hero, features, frameworks, pricing, testimonials, how-it-works, final CTA

**Backend:** No backend changes.

**Animations & UX:** Faster font loading = fewer layout shifts = better perceived performance.

**Pain Points Addressed:** Duplicate font download; outdated copyright year; inconsistent dark mode coverage.

**Deliverables:**
- Removed `@import url()` from globals.css
- Dynamic copyright year
- Full dark mode coverage on landing page
- Lighthouse performance score improvement

**Market Impact:** Polish signals quality — compliance buyers evaluate attention to detail as a proxy for product reliability.

---

## File Reference

| File | Path | Key Findings |
|------|------|-------------|
| Landing Page | `E:\Yc_ai\complibot\app\page.tsx` | 712 lines, `'use client'`, partial dark mode, strong animations |
| Dashboard | `E:\Yc_ai\complibot\app\(dashboard)\dashboard\page.tsx` | Proper server component, delegates to client |
| Dashboard Client | `E:\Yc_ai\complibot\app\(dashboard)\dashboard\dashboard-client.tsx` | 390 lines, zero dark mode, zero aria attributes |
| Root Layout | `E:\Yc_ai\complibot\app\layout.tsx` | Proper providers, JSON-LD, OG metadata |
| Button | `E:\Yc_ai\complibot\components\ui\Button.tsx` | forwardRef, 6 variants, loading state, micro-interactions |
| Sidebar | `E:\Yc_ai\complibot\components\layout\Sidebar.tsx` | 14 items, collapsible, good aria |
| TopBar | `E:\Yc_ai\complibot\components\layout\TopBar.tsx` | Full dark mode, good aria, notification center |
| Dashboard Actions | `E:\Yc_ai\complibot\lib\actions\dashboard.ts` | Exemplary: Promise.all, unstable_cache, explicit columns |
| Frameworks Actions | `E:\Yc_ai\complibot\lib\actions\frameworks.ts` | Zod validation on create/update, but `select('*')` on read |
| Gap Analysis Actions | `E:\Yc_ai\complibot\lib\actions\gap-analysis.ts` | No input validation, `select('*')` |
| Rate Limit | `E:\Yc_ai\complibot\lib\rate-limit.ts` | Well-implemented but never wired into middleware |
| Validations | `E:\Yc_ai\complibot\lib\validations\index.ts` | Zod schemas for 4 entity types |
| Supabase Middleware | `E:\Yc_ai\complibot\lib\supabase\middleware.ts` | Auth session refresh, protected routes |
| Init Migration | `E:\Yc_ai\complibot\supabase\migrations\001_init.sql` | 6 tables, RLS enabled, auto-profile trigger |
| RLS Policies | `E:\Yc_ai\complibot\supabase\migrations\006_rls_policies.sql` | Comprehensive per-operation policies, 8 tables |
| Performance Indexes | `E:\Yc_ai\complibot\supabase\migrations\007_performance_indexes.sql` | 8 composite indexes |
| Next Config | `E:\Yc_ai\complibot\next.config.ts` | Strong security headers, CSP, HSTS |
| Globals CSS | `E:\Yc_ai\complibot\app\globals.css` | Theme system, custom animations, duplicate font import |
| Service Worker | `E:\Yc_ai\complibot\public\sw.js` | Cache-first/network-first, push notifications |

---

## Competitor Research Sources

- [Secureframe vs Vanta vs Drata: Core Differences](https://drata.com/blog/secureframe-vs-vanta-vs-drata)
- [Drata vs Vanta vs Secureframe: Which Compliance Tool Is Best?](https://silentsector.com/blog/drata-vs-vanta-secureframe)
- [Secureframe vs Vanta vs Drata: Who actually delivers on Compliance?](https://sprinto.com/blog/secureframe-vs-vanta-vs-drata/)
- [Top 8 Vanta Competitors & Alternatives](https://www.upguard.com/blog/vanta-competitors)
- [Best Compliance Automation Software: Top 12 Tools in 2026](https://cynomi.com/learn/compliance-automation-tools/)
- [Top 13 Compliance Automation Tools in 2026](https://www.zluri.com/blog/compliance-automation-tools)
- [10 Best SOC 2 Compliance Software for 2026](https://www.brightdefense.com/resources/best-soc-2-compliance-software/)
- [8 Best SOC 2 Compliance Softwares in 2026](https://sprinto.com/blog/soc-2-software/)
- [Compliance Automation Tools Comparison](https://inventivehq.com/blog/compliance-automation-tools-comparison)

---

*Report generated 2026-03-11 by Claude Opus 4.6*
