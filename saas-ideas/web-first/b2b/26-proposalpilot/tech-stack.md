# ProposalPilot -- Technical Architecture

## Architecture Overview

ProposalPilot is a web-first B2B SaaS application built on a modern stack optimized for three core technical challenges: real-time collaborative document editing, AI-powered content generation, and granular analytics tracking on shared proposal links.

```
+-------------------------------------------------------------------+
|                        CLIENT LAYER                                |
|  +-------------------------------------------------------------+  |
|  |  Next.js 14 (App Router)                                    |  |
|  |  - SSR for shared proposal links (SEO + fast load)          |  |
|  |  - RSC for dashboard (streaming, partial hydration)         |  |
|  |  - Client components for editor (TipTap + real-time)        |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
           |                    |                    |
           v                    v                    v
+------------------+  +------------------+  +------------------+
|   SUPABASE       |  |   AI LAYER       |  |   CDN / EDGE     |
|                  |  |                  |  |                  |
|  PostgreSQL      |  |  OpenAI GPT-4o   |  |  Vercel Edge     |
|  Auth (JWT)      |  |  Proposal Draft  |  |  Cloudflare CDN  |
|  Storage (S3)    |  |  Price Suggest   |  |  Image Optim     |
|  Realtime (WS)   |  |  Win Prediction  |  |  Static Assets   |
|  Edge Functions  |  |  Brief Analysis  |  |  Proposal Cache  |
+------------------+  +------------------+  +------------------+
           |                    |                    |
           v                    v                    v
+-------------------------------------------------------------------+
|                     INFRASTRUCTURE                                 |
|  Vercel (hosting) | Cloudflare (CDN/WAF) | Stripe (billing)       |
|  SendGrid (email) | DocuSign (e-sign)    | Cloudinary (assets)    |
+-------------------------------------------------------------------+
```

---

## Frontend

### Framework: Next.js 14 (App Router)

**Why Next.js 14:**
- **App Router with RSC** -- Server Components for the dashboard reduce client bundle size; streaming enables progressive loading of analytics data
- **SSR for proposal links** -- When a client opens a shared proposal URL, it must render instantly with proper meta tags (Open Graph for email previews), fast LCP, and no flash of loading state
- **Route Groups** -- Clean separation between authenticated app routes (`/(app)/dashboard`), public proposal viewer (`/(public)/p/[id]`), and marketing site (`/(marketing)`)
- **Server Actions** -- Mutations (save proposal, update status, send proposal) run server-side without API boilerplate
- **Middleware** -- Auth checks, proposal view tracking (analytics pixel), and org-level routing at the edge

**Route Structure:**
```
app/
  (marketing)/           # Public marketing site
    page.tsx             # Landing page
    pricing/page.tsx
    templates/page.tsx
  (auth)/                # Authentication flows
    login/page.tsx
    signup/page.tsx
    invite/[token]/page.tsx
  (app)/                 # Authenticated application
    dashboard/page.tsx
    proposals/
      page.tsx           # Pipeline view
      new/page.tsx       # New proposal wizard
      [id]/
        edit/page.tsx    # Proposal editor
        analytics/page.tsx
        preview/page.tsx
    content-library/page.tsx
    templates/page.tsx
    clients/page.tsx
    analytics/page.tsx   # Win rate analytics
    settings/
      page.tsx
      team/page.tsx
      branding/page.tsx
      integrations/page.tsx
  (public)/              # Public (unauthenticated) routes
    p/[id]/page.tsx      # Client-facing proposal viewer
    p/[id]/sign/page.tsx # E-signature page
  api/
    webhooks/
      stripe/route.ts
      docusign/route.ts
    ai/
      generate/route.ts
      suggest-pricing/route.ts
    track/route.ts       # Analytics pixel endpoint
```

### Rich Text Editor: TipTap

**Why TipTap:**
- Built on ProseMirror -- battle-tested for collaborative editing
- Headless architecture allows complete UI customization to match ProposalPilot's design system
- Extension system supports custom nodes (pricing tables, signature blocks, dynamic variables)
- Y.js integration for real-time collaboration out of the box
- JSON document format maps cleanly to database storage and PDF rendering

**Custom TipTap Extensions:**
```
extensions/
  PricingTable/          # Interactive pricing table node
    - Line items with quantity, rate, subtotal
    - Optional/included toggles for clients
    - Tax and discount calculations
    - Multiple pricing models (fixed, T&M, retainer)
  SignatureBlock/        # E-signature placeholder
    - Maps to DocuSign/HelloSign fields on export
    - Visual signature line in editor
  DynamicVariable/       # Template variables
    - {{client.name}}, {{project.deadline}}, {{team.lead}}
    - Auto-populated from client/project data
  SectionBreak/          # Proposal section dividers
    - Named sections for analytics tracking
    - Table of contents generation
  TeamMember/            # Team bio cards
    - Pull from content library
    - Photo, role, bio, relevant experience
  CaseStudy/             # Case study embed
    - Pull from content library
    - Client logo, metrics, testimonial
  MilestoneTimeline/     # Visual timeline
    - Gantt-style milestone visualization
    - Deliverables per phase
```

### Styling: Tailwind CSS

- Utility-first CSS with custom design tokens matching the ProposalPilot theme
- `tailwind.config.ts` extended with proposal-specific colors (won-deal gold, lost-deal gray, pipeline stage colors)
- `@tailwindcss/typography` for proposal content rendering
- Component variants via `class-variance-authority` (CVA)
- Responsive: dashboard optimized for desktop (1280px+), proposal viewer responsive for all devices

### State Management

- **Server state**: TanStack Query v5 for API data (proposals, clients, analytics)
- **Editor state**: TipTap/ProseMirror internal state with Y.js CRDT for collaboration
- **UI state**: Zustand for local UI (sidebar collapse, modal state, wizard step)
- **URL state**: `nuqs` for searchable/filterable views (proposal pipeline filters, analytics date range)

---

## Backend

### Database & Auth: Supabase

**Why Supabase:**
- **PostgreSQL** -- Relational data model fits proposals (org -> users -> proposals -> sections -> analytics events) perfectly
- **Row Level Security (RLS)** -- Multi-tenant isolation at the database level; users only see their organization's data
- **Auth** -- Email/password, Google OAuth, magic links, and SSO (Enterprise tier) with JWT-based sessions
- **Storage** -- S3-compatible object storage for proposal assets (images, logos, attachments, exported PDFs)
- **Realtime** -- WebSocket subscriptions for collaborative editing presence and live proposal status updates
- **Edge Functions** -- Deno-based serverless functions for webhooks, AI orchestration, and background jobs

**Database Schema (Core Tables):**

```sql
-- Multi-tenant organization
organizations (
  id uuid PRIMARY KEY,
  name text,
  slug text UNIQUE,
  branding jsonb,          -- logo_url, colors, fonts
  settings jsonb,          -- default terms, payment terms
  subscription_tier text,  -- free, pro, agency, enterprise
  stripe_customer_id text,
  created_at timestamptz
)

-- Users within organizations
users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  org_id uuid REFERENCES organizations,
  role text,               -- owner, admin, member, viewer
  full_name text,
  avatar_url text,
  title text,              -- "Senior Consultant", "Account Director"
  bio text,
  created_at timestamptz
)

-- Client companies
clients (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations,
  name text,
  industry text,
  website text,
  contacts jsonb,          -- [{name, email, role}]
  crm_id text,             -- external CRM reference
  metadata jsonb,
  created_at timestamptz
)

-- Proposals
proposals (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations,
  client_id uuid REFERENCES clients,
  created_by uuid REFERENCES users,
  title text,
  status text,             -- draft, review, sent, viewed, won, lost
  content jsonb,           -- TipTap JSON document
  pricing jsonb,           -- structured pricing data
  brief text,              -- original client brief
  template_id uuid REFERENCES templates,
  share_token text UNIQUE, -- public access token
  sent_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  total_value numeric,
  valid_until date,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
)

-- Proposal analytics events
proposal_events (
  id uuid PRIMARY KEY,
  proposal_id uuid REFERENCES proposals,
  event_type text,         -- view, section_view, download, share, sign
  section_id text,
  viewer_ip inet,
  viewer_agent text,
  duration_ms integer,     -- time spent on section
  metadata jsonb,
  created_at timestamptz
)

-- Reusable content blocks
content_blocks (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations,
  type text,               -- case_study, team_bio, methodology, terms
  title text,
  content jsonb,           -- TipTap JSON
  tags text[],
  usage_count integer DEFAULT 0,
  created_at timestamptz
)

-- Proposal templates
templates (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations,
  name text,
  description text,
  content jsonb,           -- TipTap JSON template with variables
  category text,           -- web_dev, branding, consulting, etc.
  is_default boolean,
  usage_count integer DEFAULT 0,
  win_rate numeric,        -- calculated from proposals using this template
  created_at timestamptz
)

-- E-signature records
signatures (
  id uuid PRIMARY KEY,
  proposal_id uuid REFERENCES proposals,
  signer_name text,
  signer_email text,
  provider text,           -- docusign, hellosign
  provider_envelope_id text,
  status text,             -- pending, signed, declined
  signed_at timestamptz,
  created_at timestamptz
)

-- Comments for collaboration
comments (
  id uuid PRIMARY KEY,
  proposal_id uuid REFERENCES proposals,
  user_id uuid REFERENCES users,
  content text,
  section_id text,         -- which section the comment is on
  resolved boolean DEFAULT false,
  parent_id uuid REFERENCES comments, -- threading
  created_at timestamptz
)
```

**Row Level Security (RLS) Policy Example:**
```sql
-- Users can only access proposals belonging to their organization
CREATE POLICY "org_isolation" ON proposals
  FOR ALL
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Public proposal viewer (unauthenticated access via share token)
CREATE POLICY "public_view" ON proposals
  FOR SELECT
  USING (share_token IS NOT NULL AND status IN ('sent', 'viewed'));
```

### Realtime Collaboration

```
Collaboration Architecture:
  Y.js (CRDT) <---> Supabase Realtime (WebSocket) <---> PostgreSQL

  - Y.js handles conflict resolution for concurrent edits
  - Supabase Realtime broadcasts presence (cursor positions, active users)
  - Document state persisted to PostgreSQL on debounced intervals
  - Awareness protocol shows collaborator cursors and selections
```

---

## AI / ML Layer

### OpenAI GPT-4o Integration

**Use Cases:**

| Function | Model | Input | Output |
| -------- | ----- | ----- | ------ |
| Proposal drafting | GPT-4o | Client brief + service catalog + past proposals + template | Full proposal JSON (sections, pricing, timeline) |
| Pricing suggestion | GPT-4o | Project scope + historical win data + client industry | Recommended pricing with confidence score |
| Brief analysis | GPT-4o | Raw client brief/email | Structured requirements, red flags, clarification questions |
| Win prediction | GPT-4o (fine-tuned) | Proposal attributes + client data | Win probability percentage |
| Section improvement | GPT-4o | Selected text + context | Rewritten section with improvements |
| Executive summary | GPT-4o | Full proposal content | Concise executive summary |

**AI Pipeline Architecture:**
```
Client Brief Input
       |
       v
  Brief Analysis (GPT-4o)
  - Extract requirements
  - Identify scope boundaries
  - Flag ambiguities
  - Suggest clarifications
       |
       v
  Template Selection
  - Match to similar past proposals
  - Select best-performing template
  - Load relevant content blocks
       |
       v
  Proposal Generation (GPT-4o)
  - System prompt: agency voice profile + writing guidelines
  - Context: brief analysis + template + content blocks + service catalog
  - Output: structured JSON (sections + pricing + timeline)
       |
       v
  Pricing Optimization (GPT-4o)
  - Historical win rate by price point
  - Industry benchmarks
  - Scope complexity scoring
  - Recommended pricing with confidence
       |
       v
  Human Review (TipTap Editor)
  - AI-generated draft loaded into editor
  - Team review, comments, approvals
  - Final adjustments before send
```

**Prompt Engineering Strategy:**
- Organization-level system prompt capturing agency voice, terminology, and style
- Few-shot examples pulled from the organization's highest-performing past proposals
- Structured output format (JSON) ensuring consistent section mapping to TipTap nodes
- Temperature: 0.3 for pricing/scope (precision), 0.7 for executive summaries (creativity)

### Cost Management

| Operation | Tokens (est.) | Cost per Call | Monthly (100 proposals) |
| --------- | ------------- | ------------- | ----------------------- |
| Brief analysis | ~2K in / ~1K out | $0.02 | $2.00 |
| Full proposal draft | ~8K in / ~6K out | $0.09 | $9.00 |
| Pricing suggestion | ~4K in / ~1K out | $0.03 | $3.00 |
| Section improvement | ~2K in / ~1K out | $0.02 | $2.00 |
| **Total per proposal** | -- | **~$0.16** | **$16.00** |

---

## Document Pipeline

### PDF Export

```
TipTap JSON Document
       |
       v
  React-PDF (@react-pdf/renderer)
  - Maps TipTap nodes to PDF components
  - Applies organization branding (logo, colors, fonts)
  - Renders pricing tables with calculations
  - Generates table of contents
  - Adds page numbers and footers
       |
       v
  Puppeteer (fallback for complex layouts)
  - SSR the proposal view
  - Generate PDF from rendered HTML
  - Higher fidelity for complex designs
       |
       v
  Supabase Storage
  - Store generated PDF
  - Serve via signed URL
```

### Proposal Analytics Tracking

```
Client opens proposal link (/p/[id])
       |
       v
  Middleware (Edge)
  - Record view event (IP, user agent, referrer)
  - Set anonymous tracking cookie
       |
       v
  Intersection Observer (Client)
  - Track which sections enter viewport
  - Measure time spent per section
  - Record scroll depth
       |
       v
  Beacon API (on page leave)
  - Batch send analytics events
  - Reliable delivery even on tab close
       |
       v
  proposal_events table
  - Aggregated in analytics dashboard
  - Engagement heatmap generation
  - Section-level time tracking
```

---

## Infrastructure

### Hosting: Vercel

- **Edge Network** -- Global CDN for fast proposal loading worldwide
- **Serverless Functions** -- API routes auto-scale for AI generation spikes
- **Preview Deployments** -- Every PR gets a preview URL for QA
- **Edge Middleware** -- Auth checks and analytics tracking at the edge
- **ISR** -- Incremental Static Regeneration for marketing pages and template gallery

### CDN: Cloudflare

- **WAF** -- Web Application Firewall for DDoS protection
- **Image Optimization** -- Resize and optimize proposal images on the fly
- **Cache** -- Static assets, proposal PDFs (with cache invalidation on update)
- **DNS** -- Fast DNS resolution with DNSSEC

### Monitoring & Observability

| Tool | Purpose |
| ---- | ------- |
| **Sentry** | Error tracking, performance monitoring, session replay |
| **Vercel Analytics** | Web vitals, page load performance |
| **PostHog** | Product analytics, feature flags, session recordings |
| **Axiom** | Log aggregation and search |
| **Checkly** | Uptime monitoring and API health checks |

---

## Development Tools

### Language & Build

| Tool | Purpose |
| ---- | ------- |
| **TypeScript 5.3+** | Type safety across frontend, backend, and AI layer |
| **pnpm** | Fast, disk-efficient package manager |
| **Turbopack** | Next.js dev server for fast HMR |
| **ESLint + Prettier** | Code quality and formatting |
| **Husky + lint-staged** | Pre-commit hooks |

### Testing

| Layer | Tool | Coverage Target |
| ----- | ---- | --------------- |
| Unit | **Vitest** | Business logic, pricing calculations, AI prompt builders -- 85% |
| Component | **Testing Library** | Editor components, proposal cards, analytics charts -- 75% |
| Integration | **Vitest + MSW** | API routes, AI pipeline, webhook handlers -- 80% |
| E2E | **Playwright** | Proposal creation flow, editor interactions, e-sign flow -- Critical paths |
| Visual | **Chromatic** | Storybook visual regression for proposal templates |

### CI/CD Pipeline

```
Push to GitHub
       |
       v
  GitHub Actions
  - Lint (ESLint, Prettier check)
  - Type check (tsc --noEmit)
  - Unit + Integration tests (Vitest)
  - E2E tests (Playwright against preview)
  - Visual regression (Chromatic)
  - Bundle size check
       |
       v
  Vercel Preview Deployment
  - Auto-deploy on PR
  - Preview URL for QA review
       |
       v
  Merge to main
  - Auto-deploy to production
  - Database migrations (Supabase CLI)
  - Sentry release tracking
```

---

## Scalability Considerations

### Performance Targets

| Metric | Target |
| ------ | ------ |
| Proposal page load (LCP) | < 1.2s |
| Editor interaction latency | < 50ms |
| AI generation time | < 15s for full proposal |
| Collaboration sync latency | < 200ms |
| Analytics event ingestion | 10,000 events/min |

### Scaling Strategy

1. **Database** -- Supabase Pro with connection pooling (PgBouncer); partition `proposal_events` by month for analytics query performance; read replicas for analytics dashboards
2. **AI Generation** -- Queue-based with rate limiting; OpenAI tier-2 rate limits (500 RPM); fallback to GPT-4o-mini for non-critical operations; response streaming for perceived speed
3. **File Storage** -- Supabase Storage (S3-backed) with Cloudflare CDN caching; lazy PDF generation (generate on first download, cache thereafter)
4. **Real-time** -- Supabase Realtime handles WebSocket connections; Y.js document sync via awareness protocol; presence limited to active editors (not viewers)
5. **Multi-tenancy** -- RLS ensures data isolation; per-org rate limiting on AI generation; subscription tier enforcement at middleware level

### Security

- **Authentication**: Supabase Auth with JWT, MFA support for Enterprise tier
- **Authorization**: RLS policies + application-level role checks (owner/admin/member/viewer)
- **Data Encryption**: AES-256 at rest (Supabase default), TLS 1.3 in transit
- **Proposal Access**: Share tokens are UUIDv4 (unguessable), revocable, with optional password protection
- **SOC 2 Compliance**: Target for Year 2 (required for Enterprise clients)
- **GDPR**: Data deletion workflows, export API, consent management

---

## Third-Party Integration Architecture

```
ProposalPilot Core
       |
       +-- OpenAI API (AI generation, pricing, analysis)
       +-- DocuSign / HelloSign (e-signatures)
       +-- Stripe (subscription billing)
       +-- SendGrid (proposal delivery emails, follow-ups)
       +-- Cloudinary (image/asset management)
       +-- HubSpot API (CRM sync -- deals, contacts)
       +-- Salesforce API (CRM sync -- opportunities, accounts)
       +-- Pipedrive API (CRM sync -- deals, contacts)
       +-- Slack (notifications -- proposal viewed, signed, won)
       +-- Zapier (custom integrations for Agency/Enterprise)
```

Each integration is implemented as an isolated module with:
- Typed API client wrapper
- Retry logic with exponential backoff
- Circuit breaker pattern for external service failures
- Webhook handlers with signature verification
- Feature-flagged by subscription tier

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 14 App Router as Frontend Framework

**Status:** Accepted
**Date:** 2024-01-15
**Context:** ProposalPilot requires SSR for shared proposal links (SEO, Open Graph previews, fast LCP), streaming for analytics-heavy dashboards, and a unified full-stack framework to reduce operational complexity.
**Decision:** Adopt Next.js 14 with App Router, React Server Components, and Server Actions.
**Consequences:**
- (+) SSR proposal viewer delivers sub-1.2s LCP for client-facing links
- (+) RSC reduces client bundle size for the dashboard by keeping data-fetching server-side
- (+) Server Actions eliminate API boilerplate for mutations (save proposal, update status)
- (+) Route Groups cleanly separate marketing, app, and public proposal viewer
- (-) App Router ecosystem is newer; some community libraries lag behind Pages Router support
- (-) Team must learn RSC mental model (server vs. client component boundaries)

### ADR-002: Supabase as Backend Platform (Database, Auth, Storage, Realtime)

**Status:** Accepted
**Date:** 2024-01-15
**Context:** ProposalPilot is a multi-tenant B2B SaaS requiring relational data modeling (org > users > proposals > sections > analytics), real-time collaboration, secure file storage, and built-in authentication with SSO support for enterprise clients.
**Decision:** Use Supabase (PostgreSQL 15, Auth, Storage, Realtime, Edge Functions) as the unified backend platform.
**Consequences:**
- (+) Row Level Security (RLS) enforces tenant isolation at the database level, preventing cross-org data leaks even if application code has bugs
- (+) PostgreSQL's relational model fits the deeply hierarchical proposal data structure
- (+) Supabase Auth provides email/password, OAuth, magic links, and SAML SSO out of the box
- (+) Supabase Realtime enables collaborative editing presence via WebSockets
- (+) Supabase Storage offers S3-compatible object storage with RLS-protected buckets
- (-) Vendor lock-in to Supabase; migration would require rewriting auth and storage layers
- (-) Edge Functions are Deno-based, which limits some npm package compatibility

### ADR-003: OpenAI GPT-4o as Primary AI Model

**Status:** Accepted
**Date:** 2024-01-20
**Context:** ProposalPilot's core value proposition is AI-powered proposal generation, pricing suggestions, brief analysis, and win prediction. The AI must produce high-quality, structured output (TipTap JSON) and reason over complex business context (past proposals, pricing history, industry data).
**Decision:** Use OpenAI GPT-4o as the primary model for all AI features, with structured JSON output mode.
**Consequences:**
- (+) GPT-4o provides the best combination of reasoning quality and cost for structured content generation
- (+) JSON output mode ensures consistent mapping to TipTap editor nodes
- (+) Supports temperature tuning: 0.3 for pricing precision, 0.7 for creative summaries
- (+) Estimated cost of ~$0.16 per proposal generation is commercially viable
- (-) Dependency on a single AI provider; OpenAI outages directly impact core functionality
- (-) No data residency guarantees for EU enterprise clients (data processed by OpenAI servers)
- **Mitigation:** Implement fallback to GPT-4o-mini for non-critical operations; cache AI responses

### ADR-004: Vercel as Hosting Platform

**Status:** Accepted
**Date:** 2024-01-15
**Context:** ProposalPilot needs global CDN distribution (proposals are shared with clients worldwide), serverless auto-scaling for AI generation spikes, preview deployments for QA, and tight integration with Next.js.
**Decision:** Deploy on Vercel Pro plan with Edge Middleware, Serverless Functions, and ISR.
**Consequences:**
- (+) First-class Next.js support with zero-config deployment
- (+) Global Edge Network ensures fast proposal loading for clients in any geography
- (+) Serverless Functions auto-scale for AI generation request spikes
- (+) Preview Deployments on every PR enable comprehensive QA workflows
- (+) Edge Middleware runs auth checks and analytics tracking at the edge with sub-millisecond overhead
- (-) Serverless function cold starts can add 200-500ms latency on first AI generation request
- (-) Vendor lock-in to Vercel; self-hosting Next.js loses some optimizations (ISR, Edge Runtime)

### ADR-005: Supabase Auth with SAML SSO for Enterprise Authentication

**Status:** Accepted
**Date:** 2024-02-01
**Context:** B2B enterprise clients require SAML 2.0 SSO integration with their identity providers (Okta, Azure AD, Google Workspace). ProposalPilot needs MFA support, role-based access control (owner/admin/member/viewer), and magic link invitations for team onboarding.
**Decision:** Use Supabase Auth as the primary authentication layer with SAML SSO enabled on the Enterprise subscription tier.
**Consequences:**
- (+) Built-in SAML 2.0 and OIDC support without custom implementation
- (+) MFA (TOTP) available for all users, enforceable per organization
- (+) JWT-based sessions integrate seamlessly with RLS policies
- (+) Magic link invitations simplify team onboarding
- (-) SAML SSO is only available on Supabase's Enterprise plan, increasing infrastructure costs
- (-) Custom RBAC logic (owner/admin/member/viewer) must be implemented in application code on top of Supabase Auth

### ADR-006: Zustand + TanStack Query + Y.js for State Management

**Status:** Accepted
**Date:** 2024-01-20
**Context:** ProposalPilot has four distinct state management needs: server data (proposals, clients, analytics), collaborative editor state (real-time multi-user editing), local UI state (sidebar, modals, wizards), and URL-driven filter/search state.
**Decision:** Use TanStack Query v5 for server state, TipTap/Y.js CRDT for collaborative editor state, Zustand for local UI state, and `nuqs` for URL state.
**Consequences:**
- (+) Each state domain uses the best-fit tool rather than forcing everything into a single store
- (+) TanStack Query handles caching, deduplication, and background refetching for API data
- (+) Y.js CRDT provides conflict-free collaborative editing without a custom sync server
- (+) Zustand is lightweight (~1KB) and avoids Redux boilerplate for simple UI state
- (-) Four state management approaches increase cognitive load for new developers
- (-) Edge cases where state boundaries overlap (e.g., optimistic UI updates that touch both server and UI state)

### ADR-007: Tailwind CSS with CVA for Styling

**Status:** Accepted
**Date:** 2024-01-15
**Context:** ProposalPilot requires a custom design system with proposal-specific tokens (won-deal gold, pipeline stage colors), responsive layouts for both desktop dashboards and mobile proposal viewers, and typography for rich proposal content rendering.
**Decision:** Use Tailwind CSS with custom design tokens, `@tailwindcss/typography` for prose content, and `class-variance-authority` (CVA) for component variants.
**Consequences:**
- (+) Utility-first approach enables rapid UI iteration without CSS naming debates
- (+) Custom design tokens in `tailwind.config.ts` enforce consistent brand application
- (+) `@tailwindcss/typography` provides beautiful prose rendering for proposal content out of the box
- (+) CVA provides type-safe component variants without runtime overhead
- (-) Long class strings in JSX can reduce readability without editor extensions
- (-) Custom design tokens require upfront investment in `tailwind.config.ts` configuration

---

## Performance Budgets

### Core Web Vitals Targets

| Metric | Target | Measurement Tool | Enforcement |
| ------ | ------ | ---------------- | ----------- |
| **Largest Contentful Paint (LCP)** | < 2.5s | Vercel Analytics, Lighthouse | CI/CD budget check |
| **First Input Delay (FID)** | < 100ms | Vercel Analytics, Chrome UX Report | CI/CD budget check |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Vercel Analytics, Lighthouse | CI/CD budget check |
| **Time to First Byte (TTFB)** | < 200ms | Vercel Analytics, Checkly | Edge Middleware optimization |
| **Core Web Vitals pass rate** | > 75% of sessions | Chrome UX Report | Monthly review |

### Bundle and Payload Budgets

| Metric | Budget | Enforcement |
| ------ | ------ | ----------- |
| **JavaScript bundle (gzipped)** | < 250KB | `@next/bundle-analyzer` in CI |
| **Total page weight** | < 1MB | Lighthouse CI budget |
| **First-load JS (per route)** | < 130KB | Next.js build output analysis |
| **CSS (gzipped)** | < 50KB | Build step validation |
| **Image payload (per page)** | < 500KB | Next.js `<Image>` with quality optimization |

### API and Backend Performance Budgets

| Metric | Budget | Measurement |
| ------ | ------ | ----------- |
| **API response time (p95)** | < 300ms | Vercel Functions metrics, Axiom |
| **API response time (p99)** | < 500ms | Vercel Functions metrics, Axiom |
| **Lighthouse Performance score** | > 90 | Lighthouse CI in GitHub Actions |
| **Build time** | < 120s | Vercel build logs, GitHub Actions |
| **AI generation (full proposal)** | < 15s | Custom instrumentation, Sentry |
| **Supabase query time (p95)** | < 50ms | Supabase Dashboard, Axiom |
| **WebSocket connection setup** | < 500ms | Custom instrumentation |

### Enforcement Strategy

```
CI/CD Pipeline Checks:
  1. next build --experimental-build-mode=compile
     - Fail if any route exceeds 130KB first-load JS
  2. @next/bundle-analyzer
     - Fail if total JS bundle > 250KB gzipped
  3. Lighthouse CI (lhci)
     - Fail if Performance score < 90
     - Fail if LCP > 2.5s, FID > 100ms, CLS > 0.1
  4. Vercel Analytics (production)
     - Weekly review of CWV pass rate (target > 75%)
     - Alert if TTFB p95 > 200ms
```

---

## Environment Variable Catalog

### Client-Side Variables (NEXT_PUBLIC_ prefix — exposed to browser)

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes | `https://proposalpilot.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side billing | Yes | `pk_live_...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for product analytics | Yes | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion endpoint | No | `https://app.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for client-side error tracking | Yes | `https://xxxx@sentry.io/xxxx` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for asset management | Yes | `proposalpilot` |

### Server-Side Variables (never exposed to browser)

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | Yes | `eyJhbGciOiJIUzI1NiIs...` |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o access | Yes | `sk-...` |
| `OPENAI_ORG_ID` | OpenAI organization ID | No | `org-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing operations | Yes | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes | `whsec_...` |
| `SENDGRID_API_KEY` | SendGrid API key for proposal delivery emails | Yes | `SG....` |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign integration key for e-signatures | Yes | `xxxxxxxx-xxxx-xxxx-xxxx` |
| `DOCUSIGN_SECRET_KEY` | DocuSign secret key | Yes | (secret) |
| `DOCUSIGN_ACCOUNT_ID` | DocuSign account ID | Yes | (account id) |
| `DOCUSIGN_WEBHOOK_SECRET` | DocuSign Connect webhook signing secret | Yes | (secret) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret for server-side uploads | Yes | (secret) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | (key) |

### B2B Enterprise / SSO Variables

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `SAML_SSO_ISSUER` | SAML SSO issuer/entity ID for enterprise auth | Enterprise only | `https://proposalpilot.com/saml` |
| `SAML_SSO_METADATA_URL` | IdP metadata URL for SSO configuration | Enterprise only | `https://idp.example.com/metadata.xml` |
| `SAML_SSO_CALLBACK_URL` | SAML assertion consumer service URL | Enterprise only | `https://proposalpilot.com/api/auth/saml/callback` |

### CRM Integration Variables

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `HUBSPOT_CLIENT_ID` | HubSpot OAuth app client ID | If CRM enabled | (client id) |
| `HUBSPOT_CLIENT_SECRET` | HubSpot OAuth app client secret | If CRM enabled | (secret) |
| `SALESFORCE_CLIENT_ID` | Salesforce Connected App client ID | If CRM enabled | (client id) |
| `SALESFORCE_CLIENT_SECRET` | Salesforce Connected App client secret | If CRM enabled | (secret) |
| `PIPEDRIVE_CLIENT_ID` | Pipedrive OAuth app client ID | If CRM enabled | (client id) |
| `PIPEDRIVE_CLIENT_SECRET` | Pipedrive OAuth app client secret | If CRM enabled | (secret) |

### Webhook Secrets

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `WEBHOOK_SIGNING_SECRET` | Internal webhook signing secret for inter-service calls | Yes | (256-bit hex) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for notifications | No | `https://hooks.slack.com/services/...` |
| `SLACK_SIGNING_SECRET` | Slack request signing secret for verification | If Slack enabled | (secret) |

### Monitoring and Observability

| Variable | Description | Required | Example |
| -------- | ----------- | -------- | ------- |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for release tracking | Yes | `sntrys_...` |
| `SENTRY_ORG` | Sentry organization slug | Yes | `proposalpilot` |
| `SENTRY_PROJECT` | Sentry project slug | Yes | `proposalpilot-web` |
| `AXIOM_TOKEN` | Axiom API token for log aggregation | Yes | `xaat-...` |
| `AXIOM_DATASET` | Axiom dataset name | Yes | `proposalpilot-logs` |
| `CHECKLY_API_KEY` | Checkly API key for uptime monitoring | No | (key) |

---

## Local Development Setup

### Prerequisites

| Tool | Version | Purpose |
| ---- | ------- | ------- |
| **Node.js** | >= 20.x LTS | JavaScript runtime |
| **pnpm** | >= 9.x | Package manager |
| **Docker** | >= 24.x | Running Supabase locally |
| **Supabase CLI** | >= 1.x | Local Supabase instance management |
| **Git** | >= 2.40 | Version control |

### Step-by-Step: Clean Machine to Running App

```bash
# 1. Clone the repository
git clone https://github.com/proposalpilot/proposalpilot.git
cd proposalpilot

# 2. Install dependencies
pnpm install

# 3. Copy environment variables template
cp .env.example .env.local

# 4. Start local Supabase instance (requires Docker running)
pnpm supabase start
# This outputs local Supabase URL and anon key — copy these to .env.local

# 5. Apply database migrations
pnpm supabase db push

# 6. Seed the database with sample data
pnpm db:seed
# Seeds: sample org, users, proposal templates, content blocks, sample clients

# 7. Fill in remaining .env.local values
# Required for full functionality:
#   - OPENAI_API_KEY (get from https://platform.openai.com/api-keys)
#   - STRIPE_SECRET_KEY (get from Stripe dashboard, use test mode key)
#   - STRIPE_WEBHOOK_SECRET (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)
# Optional (features will be disabled without these):
#   - SENDGRID_API_KEY, DOCUSIGN_*, CLOUDINARY_*, CRM keys

# 8. Start the development server
pnpm dev
# App will be available at http://localhost:3000

# 9. (Optional) Start Stripe webhook listener for billing testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 10. (Optional) Run the test suite
pnpm test              # Unit + integration tests (Vitest)
pnpm test:e2e          # E2E tests (Playwright)
pnpm test:visual       # Visual regression (Chromatic/Storybook)
```

### Common Development Commands

```bash
pnpm dev               # Start Next.js dev server (Turbopack)
pnpm build             # Production build
pnpm start             # Start production server
pnpm lint              # Run ESLint
pnpm format            # Run Prettier
pnpm type-check        # Run TypeScript compiler (tsc --noEmit)
pnpm test              # Run Vitest unit/integration tests
pnpm test:e2e          # Run Playwright E2E tests
pnpm test:coverage     # Run tests with coverage report
pnpm db:seed           # Seed local database
pnpm db:reset          # Reset local database and re-seed
pnpm supabase start    # Start local Supabase
pnpm supabase stop     # Stop local Supabase
pnpm supabase db push  # Apply migrations to local database
pnpm supabase gen types typescript --local > types/supabase.ts  # Generate DB types
pnpm analyze           # Bundle analyzer
```

### Enterprise Deployment Notes

- **SSO Configuration:** Enterprise clients configure SAML SSO via the Settings > Integrations page. The `SAML_SSO_ISSUER`, `SAML_SSO_METADATA_URL`, and `SAML_SSO_CALLBACK_URL` env vars are set per-deployment. Supabase Auth handles the SAML flow; the application only needs to configure the IdP metadata URL.
- **Webhook Security:** All incoming webhooks (Stripe, DocuSign, CRM, Slack) are verified using their respective signing secrets before processing. Webhook handlers validate signatures using `crypto.timingSafeEqual` to prevent timing attacks.
- **Multi-Region:** Enterprise deployments can be configured with Vercel regional functions (`iad1` for US, `cdg1` for EU) and Supabase projects in the corresponding region for data residency compliance.
- **Data Isolation:** Each organization's data is isolated via RLS policies. The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and is used only in trusted server-side contexts (webhook handlers, cron jobs, admin operations).
