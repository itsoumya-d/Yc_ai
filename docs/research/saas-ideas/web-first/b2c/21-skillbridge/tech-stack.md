# SkillBridge -- Tech Stack

## Why Web-First

SkillBridge is built as a web-first platform. This is a deliberate strategic decision, not a default:

1. **SEO is critical.** Career content ("how to transition from factory work to tech," "transferable skills for truck drivers") must be indexable by search engines. This is our primary organic acquisition channel.
2. **No app store friction.** Our users are anxious and looking for immediate help. Asking them to download an app is a conversion killer. A URL is frictionless.
3. **Accessibility across devices.** Many displaced workers use older Android phones, shared computers at libraries, or Chromebooks. A responsive web app works everywhere.
4. **Cost efficiency.** One codebase serves all platforms. No iOS/Android development and maintenance overhead.
5. **PWA upgrade path.** When mobile engagement justifies it, we can ship a PWA with offline support and push notifications without building native apps.
6. **Government compatibility.** State workforce agencies access our platform through standard web browsers. No procurement friction for "approved apps."

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                        CLIENT (Browser)                          |
|                                                                  |
|  Next.js 14 App Router                                           |
|  +-------------------+  +------------------+  +---------------+  |
|  | React Server       |  | Client           |  | Static Pages  |  |
|  | Components (RSC)   |  | Components       |  | (ISR/SSG)     |  |
|  | - Career content   |  | - Assessment     |  | - Blog/SEO    |  |
|  | - Job listings     |  | - Dashboard      |  | - Landing     |  |
|  | - Skills profiles  |  | - Resume builder |  | - Careers DB  |  |
|  +-------------------+  +------------------+  +---------------+  |
|                                                                  |
+-------------------------------+----------------------------------+
                                |
                    HTTPS (Edge Network)
                                |
+-------------------------------v----------------------------------+
|                     VERCEL EDGE NETWORK                          |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | Edge Middleware   |  | API Routes       |  | Cron Jobs       | |
|  | - Auth check      |  | - /api/assess    |  | - Job sync      | |
|  | - Rate limiting   |  | - /api/careers   |  | - BLS data pull | |
|  | - Geo routing     |  | - /api/resume    |  | - Email digest  | |
|  +------------------+  | - /api/jobs      |  +-----------------+ |
|                         | - /api/match     |                     |
|                         +------------------+                     |
+-------------------------------+----------------------------------+
                                |
                  Supabase Client SDK / REST
                                |
+-------------------------------v----------------------------------+
|                     SUPABASE (Backend)                           |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | PostgreSQL        |  | Auth (GoTrue)    |  | Edge Functions  | |
|  | - Users           |  | - Email/pass     |  | - AI pipelines  | |
|  | - Skills profiles |  | - Google OAuth   |  | - PDF parsing   | |
|  | - Career paths    |  | - Magic link     |  | - Webhook       | |
|  | - Job listings    |  +------------------+  |   handlers      | |
|  | - Learning plans  |                        +-----------------+ |
|  | - Progress data   |  +------------------+                     |
|  | - Mentor matches  |  | Storage (S3)     |  +-----------------+ |
|  +------------------+  | - Resumes (PDF)   |  | Realtime        | |
|                         | - Profile photos  |  | - Notifications | |
|                         | - Course assets   |  | - Chat          | |
|                         +------------------+  +-----------------+ |
+-------------------------------+----------------------------------+
                                |
                   External API Calls
                                |
+-------------------------------v----------------------------------+
|                     EXTERNAL SERVICES                            |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | OpenAI API        |  | O*NET API        |  | BLS API         | |
|  | - GPT-4 Turbo     |  | - Occupation DB  |  | - Employment    | |
|  | - Skills extract  |  | - Skills taxonomy|  |   projections   | |
|  | - Resume rewrite  |  | - Career details |  | - Wage data     | |
|  | - Mock interview  |  +------------------+  +-----------------+ |
|  +------------------+                                            |
|                         +------------------+  +-----------------+ |
|  +------------------+  | SendGrid          |  | Stripe          | |
|  | Job Board APIs    |  | - Transactional  |  | - Subscriptions | |
|  | - Indeed           |  | - Course remind  |  | - Invoicing     | |
|  | - ZipRecruiter     |  | - Progress email |  | - Webhooks      | |
|  +------------------+  +------------------+  +-----------------+ |
+------------------------------------------------------------------+
```

---

## Frontend

### Next.js 14 (App Router)

| Decision | Rationale |
| -------- | --------- |
| **App Router** | Layout nesting for dashboard, loading states, error boundaries, parallel routes |
| **React Server Components** | Career content pages render on the server for SEO. Job listings, skills profiles, and career explorer benefit from server-side data fetching without client JS overhead |
| **Incremental Static Regeneration** | Career path pages and blog content are regenerated every 6 hours. Fast page loads with fresh data |
| **Streaming SSR** | Dashboard pages stream in sections. Skills profile loads first, then career recommendations, then job matches |
| **Client Components** | Interactive elements only: assessment quiz, resume builder, drag-and-drop learning plan, real-time chat |

### React Ecosystem

| Library | Purpose | Version |
| ------- | ------- | ------- |
| **React 18** | UI framework | ^18.2 |
| **React Hook Form** | Form management (assessment quiz, profile edit, resume builder) | ^7.x |
| **Zod** | Schema validation (form inputs, API responses) | ^3.x |
| **TanStack Query** | Client-side data fetching, caching, optimistic updates | ^5.x |
| **Zustand** | Lightweight client state (UI state, assessment progress) | ^4.x |
| **Framer Motion** | Animations (progress bars, skill badges, transitions) | ^11.x |
| **react-pdf** | Resume PDF preview and export | ^7.x |
| **recharts** | Data visualization (salary charts, job growth, progress tracking) | ^2.x |
| **react-markdown** | Rendering AI-generated content (career descriptions, learning plans) | ^9.x |

### Styling

| Tool | Purpose |
| ---- | ------- |
| **Tailwind CSS 3.4** | Utility-first CSS. Fast iteration, consistent spacing, responsive design |
| **tailwind-merge** | Conditional class merging without conflicts |
| **clsx** | Conditional class composition |
| **Custom design tokens** | Warm teal, sunrise orange, cream backgrounds (see theme.md) |
| **CSS Modules** | Escape hatch for complex component-specific styles |

### Accessibility

| Standard | Implementation |
| -------- | -------------- |
| **WCAG 2.1 AA** | Minimum compliance target. Critical given diverse user base |
| **Radix UI Primitives** | Accessible, unstyled component primitives (dialogs, dropdowns, tabs, tooltips) |
| **aria-live regions** | Screen reader announcements for AI-generated content loading |
| **Focus management** | Keyboard navigation for all interactive elements |
| **Reduced motion** | Respects prefers-reduced-motion media query |
| **Large touch targets** | 44px minimum for mobile (many users have limited dexterity or use older phones) |

---

## Backend

### Supabase

Supabase provides the complete backend layer. It is chosen for speed of development, built-in auth, real-time capabilities, and cost efficiency at our scale.

| Feature | Usage |
| ------- | ----- |
| **PostgreSQL** | Primary database. Relational data: users, skills, career paths, jobs, learning plans, mentor relationships |
| **Row Level Security (RLS)** | Users can only read/write their own data. Employers can only see anonymized candidate profiles until a match is accepted |
| **Auth (GoTrue)** | Email/password, Google OAuth, magic link (important -- many users don't want to remember another password) |
| **Edge Functions (Deno)** | Serverless functions for AI pipeline orchestration, PDF resume parsing, webhook handlers |
| **Storage** | Resume PDFs, profile photos, generated documents. Private buckets with signed URLs |
| **Realtime** | Push notifications for job matches, mentor messages, course reminders |
| **Database Functions** | PostgreSQL functions for complex queries: skills gap calculation, transferability scoring, job matching |

### Database Schema (Key Tables)

```sql
-- Core user data
users (id, email, name, phone, location, created_at, subscription_tier)

-- Skills assessment results
skills_profiles (id, user_id, source, raw_data, processed_at)
skills (id, profile_id, skill_name, onet_code, proficiency_level, source)

-- Career exploration
career_paths (id, user_id, target_occupation, onet_soc_code, match_score,
              skills_gap, salary_range, growth_outlook, status)

-- Learning and progress
learning_plans (id, user_id, career_path_id, courses[], milestones[], status)
progress_events (id, user_id, event_type, metadata, created_at)

-- Job matching
job_listings (id, employer_id, title, description, skills_required[],
              transferability_friendly, salary_range, location, posted_at)
job_matches (id, user_id, job_id, match_score, transferability_score, status)

-- Resumes
resumes (id, user_id, career_path_id, original_url, rewritten_content,
         version, created_at)

-- Community
mentor_profiles (id, user_id, transition_story, from_career, to_career,
                 availability, rating)
mentor_matches (id, mentee_id, mentor_id, status, created_at)

-- Employer accounts
employers (id, company_name, industry, plan_tier, career_changer_friendly)
```

---

## AI/ML Layer

### OpenAI API (GPT-4 Turbo)

| Use Case | Model | Approach | Est. Cost/Request |
| -------- | ----- | -------- | ----------------- |
| **Skills extraction from resume** | GPT-4 Turbo | Structured output with JSON mode. Extract skills, experience, education from parsed resume text | $0.03-0.06 |
| **Career path recommendation** | GPT-4 Turbo | Skills profile + O*NET data + BLS projections fed as context. Returns ranked career options with reasoning | $0.04-0.08 |
| **Resume rewriting** | GPT-4 Turbo | Original resume + target career profile. Reframes experience using target industry language | $0.05-0.10 |
| **Learning plan generation** | GPT-4 Turbo | Skills gap + available courses + user constraints (time, budget). Returns sequenced learning plan | $0.03-0.06 |
| **Mock interview** | GPT-4 Turbo (streaming) | Conversational mock interview for target role. Real-time feedback on answers | $0.08-0.15 |
| **Cover letter generation** | GPT-4 Turbo | Job description + rewritten resume. Generates targeted cover letter | $0.03-0.05 |

### Custom ML Models (Future)

| Model | Purpose | Training Data |
| ----- | ------- | ------------- |
| **Transferability Scorer** | Score how well skills transfer between occupations | O*NET skills data + successful transition outcomes |
| **Job Match Ranker** | Rank job listings by fit for career changers | User engagement data (applications, interviews, hires) |
| **Churn Predictor** | Identify users at risk of abandoning their transition | Usage patterns, progress velocity, engagement metrics |
| **Salary Predictor** | Estimate expected salary given skills profile and target role | BLS data + user-reported outcomes |

### AI Pipeline Architecture

```
Resume Upload
     |
     v
PDF Parser (Edge Function)
     |
     v
Text Extraction + Cleanup
     |
     v
OpenAI: Skills Extraction (structured JSON output)
     |
     v
O*NET Skills Taxonomy Mapping
     |
     v
Skills Profile (stored in Supabase)
     |
     +----> Career Path Generator
     |           |
     |           v
     |      OpenAI: Career Recommendations
     |      + O*NET Occupation Data
     |      + BLS Employment Projections
     |           |
     |           v
     |      Ranked Career Paths (stored)
     |
     +----> Resume Rewriter
     |           |
     |           v
     |      OpenAI: Rewrite for target career
     |           |
     |           v
     |      Rewritten Resume (stored, versioned)
     |
     +----> Job Matcher
                 |
                 v
            Skills Profile + Job Listings
            Transferability Score Calculation
                 |
                 v
            Ranked Job Matches (stored, updated daily)
```

---

## Infrastructure

### Hosting and Deployment

| Service | Purpose | Tier |
| ------- | ------- | ---- |
| **Vercel** | Next.js hosting, edge network, serverless functions, preview deployments | Pro ($20/mo initially, scale as needed) |
| **Supabase** | Backend-as-a-service (database, auth, storage, edge functions) | Pro ($25/mo initially) |
| **Cloudflare** | CDN, DDoS protection, DNS, page rules | Free tier initially |

### CI/CD Pipeline

```
GitHub Push
     |
     v
GitHub Actions
  +-- Lint (ESLint + Prettier)
  +-- Type Check (TypeScript)
  +-- Unit Tests (Vitest)
  +-- Integration Tests (Playwright)
  +-- Build Check
     |
     v (on main merge)
Vercel Production Deploy
     |
     v
Post-deploy smoke tests
     |
     v
Supabase migrations (if any)
```

### Environment Strategy

| Environment | Purpose | URL Pattern |
| ----------- | ------- | ----------- |
| **Local** | Development | localhost:3000 |
| **Preview** | PR review, QA | pr-123.skillbridge.vercel.app |
| **Staging** | Pre-production testing | staging.skillbridge.app |
| **Production** | Live users | skillbridge.app |

---

## Development Tools

### Code Quality

| Tool | Purpose |
| ---- | ------- |
| **TypeScript 5.3+** | Type safety across the entire codebase. Strict mode enabled |
| **ESLint** | Code linting with Next.js, accessibility, and import order rules |
| **Prettier** | Code formatting. Consistent style, no debates |
| **Husky + lint-staged** | Pre-commit hooks: lint, format, type-check changed files |
| **commitlint** | Conventional commit messages for clean git history |

### Testing

| Tool | Purpose | Coverage Target |
| ---- | ------- | --------------- |
| **Vitest** | Unit and integration tests. Fast, Vite-native | 80% for business logic |
| **React Testing Library** | Component testing. User-centric testing approach | Key user flows |
| **Playwright** | End-to-end testing. Cross-browser (Chrome, Firefox, Safari) | Critical paths: assessment, career explorer, resume builder |
| **MSW (Mock Service Worker)** | API mocking for tests. Intercepts network requests | All external API calls |
| **Axe-core** | Automated accessibility testing integrated into Playwright | All pages |

### Monitoring and Observability

| Tool | Purpose | Tier |
| ---- | ------- | ---- |
| **Vercel Analytics** | Web vitals, performance metrics, visitor insights | Included with Pro |
| **Sentry** | Error tracking, performance monitoring, session replay | Developer (free) |
| **PostHog** | Product analytics, feature flags, session recordings | Free tier (1M events/mo) |
| **Uptime Robot** | Uptime monitoring, alerting | Free tier (50 monitors) |

---

## Scalability Plan

### Phase 1: Launch (0-10K users)

- Single Supabase instance (Pro tier)
- Vercel Pro plan
- OpenAI API with basic rate limiting
- Estimated infrastructure cost: $50-100/month

### Phase 2: Growth (10K-100K users)

- Supabase connection pooling (PgBouncer)
- Read replicas for job listing queries and career content
- Redis cache layer (Upstash) for frequently accessed data (career paths, O*NET data)
- OpenAI batch processing for non-real-time tasks (daily job matching)
- CDN caching for static career content pages
- Estimated infrastructure cost: $300-800/month

### Phase 3: Scale (100K-1M users)

- Supabase Enterprise or migrate to managed PostgreSQL (AWS RDS or Neon)
- Dedicated OpenAI fine-tuned models for skills extraction and career matching
- Background job queue (Inngest or Trigger.dev) for heavy processing
- Multi-region deployment for government contracts
- Data warehouse (BigQuery or Snowflake) for analytics and ML training
- Estimated infrastructure cost: $2,000-5,000/month

### Phase 4: Enterprise (1M+ users)

- Multi-tenant architecture for government white-label deployments
- Custom ML model inference (self-hosted or AWS SageMaker)
- Dedicated database clusters per major region
- SOC 2 Type II compliance infrastructure
- Estimated infrastructure cost: $10,000-25,000/month

---

## Security Considerations

| Area | Approach |
| ---- | -------- |
| **Authentication** | Supabase Auth with MFA support. Magic links for low-friction access |
| **Authorization** | Row Level Security policies in PostgreSQL. Role-based access (user, mentor, employer, admin) |
| **Data encryption** | TLS in transit (enforced). AES-256 at rest (Supabase default). Resume files encrypted in storage |
| **PII handling** | Resumes and personal data stored in encrypted buckets. Employer access to candidates is anonymized until mutual opt-in |
| **API security** | Rate limiting on all endpoints. API key rotation for third-party services. Request signing for webhooks |
| **GDPR/CCPA** | Data export, deletion requests, consent management. Users can delete all data including AI-generated profiles |
| **Compliance path** | SOC 2 Type II planned for Phase 3 (required for government contracts) |

---

## Key Technical Decisions Log

| Decision | Chosen | Alternatives Considered | Rationale |
| -------- | ------ | ----------------------- | --------- |
| Framework | Next.js 14 | Remix, Astro, SvelteKit | Best RSC support, largest ecosystem, Vercel integration, SEO features |
| Backend | Supabase | Firebase, Convex, custom Express | PostgreSQL (relational data fits our model), RLS, built-in auth, cost-effective |
| AI Provider | OpenAI | Anthropic Claude, Google Gemini, open-source | Best structured output support, most reliable for production, widest adoption |
| Hosting | Vercel | Netlify, AWS Amplify, Railway | Native Next.js support, edge network, preview deployments, analytics |
| Styling | Tailwind CSS | Styled Components, CSS Modules only, Panda CSS | Rapid prototyping, consistent design tokens, great DX, small bundle |
| State Management | Zustand | Redux, Jotai, Context API | Minimal boilerplate, TypeScript-first, works well with RSC architecture |
| Testing | Vitest + Playwright | Jest + Cypress, Testing Library + Puppeteer | Faster than Jest, native ESM, Playwright is more reliable than Cypress |
| Email | SendGrid | Resend, AWS SES, Postmark | Best deliverability, transactional + marketing, free tier generous |
| Payments | Stripe | Paddle, LemonSqueezy | Industry standard, best API, handles subscriptions and invoicing |

---

## Package Structure

```
skillbridge/
  +-- app/                    # Next.js App Router
  |   +-- (marketing)/        # Public pages (landing, blog, careers DB)
  |   +-- (auth)/             # Login, signup, magic link
  |   +-- (dashboard)/        # Authenticated user dashboard
  |   |   +-- assessment/     # Skills assessment flow
  |   |   +-- careers/        # Career explorer
  |   |   +-- learning/       # Learning dashboard
  |   |   +-- jobs/           # Job matching
  |   |   +-- resume/         # Resume builder
  |   |   +-- community/      # Forums, mentors
  |   |   +-- progress/       # Progress tracker
  |   |   +-- settings/       # Profile and subscription
  |   +-- api/                # API routes
  |   +-- layout.tsx          # Root layout
  |   +-- page.tsx            # Landing page
  +-- components/
  |   +-- ui/                 # Base UI components (buttons, cards, inputs)
  |   +-- features/           # Feature-specific components
  |   +-- layouts/            # Layout components (sidebar, nav, footer)
  +-- lib/
  |   +-- supabase/           # Supabase client, queries, types
  |   +-- openai/             # OpenAI client, prompts, parsers
  |   +-- onet/               # O*NET API client
  |   +-- bls/                # BLS API client
  |   +-- jobs/               # Job board API integrations
  |   +-- utils/              # Shared utilities
  |   +-- hooks/              # Custom React hooks
  |   +-- validators/         # Zod schemas
  +-- types/                  # TypeScript type definitions
  +-- styles/                 # Global styles, Tailwind config
  +-- public/                 # Static assets
  +-- tests/
  |   +-- unit/               # Vitest unit tests
  |   +-- e2e/                # Playwright E2E tests
  |   +-- fixtures/           # Test fixtures and mocks
  +-- supabase/
  |   +-- migrations/         # Database migrations
  |   +-- functions/          # Edge functions
  |   +-- seed.sql            # Seed data
  +-- .env.local              # Environment variables (not committed)
  +-- next.config.js
  +-- tailwind.config.ts
  +-- tsconfig.json
  +-- vitest.config.ts
  +-- playwright.config.ts
```

---

*Tech stack designed for rapid MVP development, SEO-first content delivery, and a clear path to enterprise scale.*

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 14 (App Router) as Frontend Framework

- **Status:** Accepted
- **Context:** SkillBridge needs SEO-optimized career content pages, streaming SSR for dashboards, and a modern React architecture that minimizes client-side JS for users on older devices.
- **Decision:** Use Next.js 14 with the App Router.
- **Alternatives Considered:** Remix (strong loader pattern but smaller ecosystem), Astro (excellent for static content but weaker for interactive dashboard), SvelteKit (smaller talent pool, fewer integrations).
- **Consequences:** Lock-in to Vercel deployment model for best DX. React Server Components reduce bundle size for career content pages. App Router's nested layouts simplify dashboard/auth/marketing route groups.

### ADR-002: Supabase as Backend-as-a-Service

- **Status:** Accepted
- **Context:** SkillBridge's data model is highly relational (users, skills, career paths, jobs, mentor matches). We need auth, real-time notifications, file storage, and row-level security without building a custom backend.
- **Decision:** Use Supabase (PostgreSQL + GoTrue Auth + Realtime + Storage + Edge Functions).
- **Alternatives Considered:** Firebase (NoSQL mismatch for relational career data), Convex (newer, smaller community), custom Express/Fastify (higher maintenance, slower time-to-market).
- **Consequences:** PostgreSQL gives us full relational power with RLS for multi-role access (user, mentor, employer, admin). Edge Functions (Deno) handle AI pipelines. Vendor dependency on Supabase, but migration path to self-hosted PostgreSQL exists.

### ADR-003: OpenAI GPT-4 Turbo as Primary AI Model

- **Status:** Accepted
- **Context:** SkillBridge relies on AI for skills extraction, career recommendations, resume rewriting, mock interviews, and learning plan generation. These require high-quality structured outputs and strong reasoning.
- **Decision:** Use OpenAI GPT-4 Turbo with structured JSON output mode.
- **Alternatives Considered:** Anthropic Claude (strong reasoning but weaker structured output at time of evaluation), Google Gemini (multimodal but less reliable for production structured outputs), open-source models (no managed API, significant ops overhead).
- **Consequences:** ~$0.03-0.15 per AI request depending on complexity. Vendor lock-in to OpenAI API. JSON mode ensures parseable outputs for skills extraction and career matching pipelines.

### ADR-004: Vercel as Hosting and Deployment Platform

- **Status:** Accepted
- **Context:** We need zero-config Next.js deployment, preview deployments for PR review, edge network for global latency, and built-in analytics.
- **Decision:** Deploy on Vercel Pro.
- **Alternatives Considered:** Netlify (weaker Next.js App Router support), AWS Amplify (more complex configuration), Railway (less mature edge network).
- **Consequences:** Native Next.js integration with automatic ISR, edge middleware, and serverless functions. Preview deployments for every PR. Vendor lock-in to Vercel, but the app is standard Next.js and can be deployed elsewhere if needed.

### ADR-005: Supabase Auth with Magic Links

- **Status:** Accepted
- **Context:** SkillBridge's users are displaced workers who may be anxious and unfamiliar with tech platforms. Authentication must be low-friction. Many users access from library computers or shared devices.
- **Decision:** Use Supabase Auth with magic link as the primary method, plus email/password and Google OAuth as alternatives.
- **Alternatives Considered:** Auth0 (additional cost, overkill for our needs), Clerk (more features but higher price), NextAuth.js (more DIY, less integrated with Supabase RLS).
- **Consequences:** Magic links eliminate the "forgot password" problem. GoTrue integrates directly with RLS policies. MFA can be added for employer/admin accounts later.

### ADR-006: Zustand for Client-Side State Management

- **Status:** Accepted
- **Context:** Most data fetching happens server-side via RSC. Client state is limited to UI state (assessment progress, form wizard steps, sidebar toggles) and optimistic updates.
- **Decision:** Use Zustand for lightweight client state combined with TanStack Query for server-state caching.
- **Alternatives Considered:** Redux Toolkit (too heavy for our needs), Jotai (atomic model less intuitive for team), React Context (performance issues with frequent updates).
- **Consequences:** Minimal boilerplate. TypeScript-first API. Small bundle (~1KB). Works well alongside Server Components since it only runs in Client Components.

### ADR-007: Tailwind CSS for Styling

- **Status:** Accepted
- **Context:** SkillBridge needs rapid UI iteration with a consistent design system. The team needs to build responsive layouts that work on older phones, Chromebooks, and desktop browsers.
- **Decision:** Use Tailwind CSS 3.4 with custom design tokens (warm teal, sunrise orange, cream backgrounds).
- **Alternatives Considered:** Styled Components (runtime CSS-in-JS, larger bundle), CSS Modules only (less velocity for prototyping), Panda CSS (newer, smaller community).
- **Consequences:** Utility-first approach enables fast iteration. Custom design tokens maintain brand consistency. Small CSS bundle with purging. CSS Modules kept as escape hatch for complex component styles.

---

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 200ms | WebPageTest |
| JS Bundle (gzipped) | < 250KB | next-bundle-analyzer |
| Total Page Weight | < 1MB | Lighthouse |
| Lighthouse Score | > 90 | Lighthouse |
| API Response (p95) | < 300ms | Vercel Analytics |
| Core Web Vitals Pass Rate | > 75% | CrUX |
| Build Time | < 120s | Vercel |

**Notes:**
- Career content pages (ISR/SSG) should achieve LCP < 1.5s due to edge caching.
- Dashboard pages use streaming SSR; initial meaningful paint should appear within 2s even on slower connections.
- Assessment quiz and resume builder are Client Components with heavier JS; ensure code splitting keeps individual route bundles under 100KB gzipped.
- AI-generated content streams progressively via Server-Sent Events to avoid blocking LCP.

---

## Environment Variable Catalog

### Public Variables (exposed to the browser via `NEXT_PUBLIC_` prefix)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | `https://skillbridge.app` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | `phc_xxxx` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion host | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client-side DSN | `https://xxxx@sentry.io/xxxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side Checkout | `STRIPE_LIVE_PUBLIC_PLACEHOLDER` |

### Server-Only Variables (never exposed to the browser)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | `eyJhbGciOiJIUzI1NiIs...` |
| `OPENAI_API_KEY` | OpenAI API secret key | `sk-xxxx` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `STRIPE_LIVE_SECRET_PLACEHOLDER` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxxx` |
| `SENDGRID_API_KEY` | SendGrid transactional email key | `SENDGRID_API_KEY_PLACEHOLDER` |
| `SENTRY_AUTH_TOKEN` | Sentry release/sourcemap upload token | `sntrys_xxxx` |
| `ONET_API_KEY` | O*NET Web Services API key | `xxxx` |
| `BLS_API_KEY` | Bureau of Labor Statistics API key (v2) | `xxxx` |
| `INDEED_API_KEY` | Indeed job board API key | `xxxx` |
| `ZIPRECRUITER_API_KEY` | ZipRecruiter job board API key | `xxxx` |

### Vercel-Specific Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_URL` | Auto-set by Vercel: deployment URL (no protocol) | `skillbridge-xxxx.vercel.app` |
| `VERCEL_ENV` | Auto-set by Vercel: `production`, `preview`, or `development` | `production` |
| `VERCEL_GIT_COMMIT_SHA` | Auto-set by Vercel: current Git commit hash | `a1b2c3d4...` |
| `VERCEL_GIT_COMMIT_REF` | Auto-set by Vercel: current Git branch | `main` |

### Preview Deployment Configuration

Preview deployments automatically inherit all environment variables. Override specific values per environment in Vercel Dashboard > Settings > Environment Variables:

- **Production:** Uses `NEXT_PUBLIC_APP_URL=https://skillbridge.app` and live Stripe/SendGrid keys.
- **Preview:** Uses `NEXT_PUBLIC_APP_URL=https://${VERCEL_URL}` and test Stripe/SendGrid keys.
- **Development:** Uses `NEXT_PUBLIC_APP_URL=http://localhost:3000` and local Supabase.

### Edge Function Environment

Supabase Edge Functions have their own environment variables configured via the Supabase dashboard or CLI:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Same OpenAI key, configured separately for Edge Functions |
| `SUPABASE_URL` | Internal Supabase URL for Edge Function access |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for bypassing RLS in Edge Functions |

---

## Local Development Setup

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | 20+ (LTS) | `brew install node@20` or [nodejs.org](https://nodejs.org) |
| **pnpm** | 9+ | `npm install -g pnpm` |
| **Supabase CLI** | Latest | `brew install supabase/tap/supabase` |
| **Docker Desktop** | Latest | Required for local Supabase (PostgreSQL, GoTrue, Storage) |
| **Git** | 2.40+ | `brew install git` |

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/skillbridge/skillbridge.git
cd skillbridge

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Fill in: OpenAI API key, Stripe test keys, SendGrid test key, O*NET API key

# Start local Supabase (requires Docker running)
pnpm supabase start

# Apply database migrations and seed data
pnpm supabase db reset

# Generate TypeScript types from database schema
pnpm supabase gen types typescript --local > types/database.ts

# Start the development server
pnpm dev
# App is now running at http://localhost:3000
```

### Development Commands

```bash
pnpm dev                # Start Next.js dev server (port 3000)
pnpm build              # Production build
pnpm start              # Start production server locally
pnpm lint               # Run ESLint + Prettier check
pnpm lint:fix           # Auto-fix lint issues
pnpm type-check         # TypeScript compilation check (tsc --noEmit)
pnpm test               # Run Vitest unit/integration tests
pnpm test:watch         # Run Vitest in watch mode
pnpm test:e2e           # Run Playwright end-to-end tests
pnpm test:e2e:ui        # Run Playwright with interactive UI
pnpm supabase start     # Start local Supabase services
pnpm supabase stop      # Stop local Supabase services
pnpm supabase db reset  # Reset database with migrations + seed data
pnpm supabase migration new <name>  # Create new database migration
pnpm analyze            # Run next-bundle-analyzer to inspect bundle size
```

### Local Supabase Services

When `supabase start` runs, the following services are available locally:

| Service | URL |
|---------|-----|
| Supabase Studio (DB GUI) | `http://localhost:54323` |
| PostgreSQL | `postgresql://postgres:postgres@localhost:54322/postgres` |
| API Gateway | `http://localhost:54321` |
| Auth (GoTrue) | `http://localhost:54321/auth/v1` |
| Storage | `http://localhost:54321/storage/v1` |
| Edge Functions | `http://localhost:54321/functions/v1` |
| Realtime | `ws://localhost:54321/realtime/v1` |
| Inbucket (email testing) | `http://localhost:54324` |

### Vercel CLI (Optional)

```bash
# Install Vercel CLI for local preview deployment testing
pnpm add -g vercel

# Link to Vercel project
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local

# Run local build matching Vercel environment
vercel build

# Deploy preview from local
vercel deploy
```
