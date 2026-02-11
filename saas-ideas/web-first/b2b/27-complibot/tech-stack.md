# CompliBot -- Technical Architecture

## Stack Overview

| Layer              | Technology                                    | Rationale                                                  |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------- |
| Frontend           | Next.js 14 (App Router)                       | SSR for dashboard performance, React Server Components     |
| Styling            | Tailwind CSS + Headless UI                    | Rapid UI development, enterprise-grade component patterns  |
| Backend / Database | Supabase (PostgreSQL 15)                      | Row Level Security critical for compliance data isolation   |
| Authentication     | Supabase Auth + SSO (SAML/OIDC)              | Enterprise SSO requirement, built-in MFA                   |
| AI / ML            | OpenAI API (GPT-4o, GPT-4o-mini)             | Policy generation, gap analysis, remediation guidance      |
| Infrastructure Scanning | AWS SDK, Google Cloud API, GitHub API    | Direct API access to customer infrastructure               |
| Communication      | Slack API, SendGrid                           | Task notifications, policy acknowledgments, reports        |
| Payments           | Stripe                                        | Subscription billing, usage-based add-ons                  |
| Hosting            | Vercel                                        | Edge deployment, automatic scaling, preview deploys        |
| CDN / Security     | Cloudflare                                    | DDoS protection, WAF, edge caching                         |
| Monitoring         | Sentry, Datadog                               | Error tracking, APM, infrastructure monitoring             |
| CI/CD              | GitHub Actions                                | Automated testing, deployment, security scanning           |
| Testing            | Vitest, Playwright, MSW                       | Unit, integration, E2E, API mocking                        |
| Language           | TypeScript (strict mode)                      | Type safety across entire codebase                         |

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
|                                                                    |
|  +--------------------+  +-------------------+  +---------------+ |
|  |  Next.js 14 App    |  |  Compliance       |  |  Audit Room   | |
|  |  (App Router)      |  |  Dashboard        |  |  (Auditor     | |
|  |                    |  |  (SSR + Client)    |  |   Portal)     | |
|  +--------+-----------+  +--------+----------+  +-------+-------+ |
+-----------|------------------------|----------------------|--------+
            |                        |                      |
            v                        v                      v
+------------------------------------------------------------------+
|                      API LAYER (Next.js Route Handlers)           |
|                                                                    |
|  /api/scan/*        /api/compliance/*    /api/audit/*             |
|  /api/policies/*    /api/evidence/*      /api/integrations/*     |
|  /api/tasks/*       /api/reports/*       /api/webhooks/*         |
+--------+-------------------+-------------------+-----------------+
         |                   |                   |
         v                   v                   v
+------------------------------------------------------------------+
|                     SERVICE LAYER                                 |
|                                                                    |
|  +----------------+  +----------------+  +---------------------+  |
|  | Scanner        |  | AI Engine      |  | Evidence Collector  |  |
|  | Service        |  | (OpenAI)       |  | Service             |  |
|  +----------------+  +----------------+  +---------------------+  |
|  +----------------+  +----------------+  +---------------------+  |
|  | Compliance     |  | Policy         |  | Notification        |  |
|  | Engine         |  | Generator      |  | Service             |  |
|  +----------------+  +----------------+  +---------------------+  |
|  +----------------+  +----------------+  +---------------------+  |
|  | Task Manager   |  | Report         |  | Audit Room          |  |
|  | Service        |  | Generator      |  | Service             |  |
|  +----------------+  +----------------+  +---------------------+  |
+--------+-------------------+-------------------+-----------------+
         |                   |                   |
         v                   v                   v
+------------------------------------------------------------------+
|                     DATA LAYER                                    |
|                                                                    |
|  +--------------------+  +-------------------+  +---------------+ |
|  | Supabase           |  | Supabase          |  | Supabase      | |
|  | PostgreSQL 15      |  | Storage           |  | Realtime      | |
|  | (RLS enabled)      |  | (Evidence files)  |  | (Live updates)| |
|  +--------------------+  +-------------------+  +---------------+ |
+------------------------------------------------------------------+
         |                   |                   |
         v                   v                   v
+------------------------------------------------------------------+
|                  EXTERNAL INTEGRATIONS                             |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  |  AWS   |  |  GCP   |  | GitHub |  | Slack  |  | Okta/  |     |
|  |  SDK   |  |  API   |  |  API   |  |  API   |  | Auth0  |     |
|  +--------+  +--------+  +--------+  +--------+  +--------+     |
|  +--------+  +--------+  +--------+                              |
|  | Stripe |  |SendGrid|  |Datadog |                              |
|  |  API   |  |  API   |  |  API   |                              |
|  +--------+  +--------+  +--------+                              |
+------------------------------------------------------------------+
```

---

## Frontend: Next.js 14 (App Router)

### Why Next.js 14

- **Server Components**: Compliance dashboard loads server-side, reducing client bundle and improving initial load time. Critical for enterprise users who expect sub-2-second page loads.
- **App Router**: File-based routing with layouts, loading states, and error boundaries built in. The compliance dashboard has deeply nested routes (framework > category > control > evidence) that benefit from nested layouts.
- **Streaming SSR**: Large compliance reports and gap analyses can stream to the client progressively rather than blocking on full data fetch.
- **API Route Handlers**: Colocated backend logic for webhooks (Slack, GitHub), cron jobs (continuous monitoring), and internal APIs.
- **Middleware**: Request-level auth checks, rate limiting, and audit logging before any route handler executes.

### Frontend Architecture

```
src/
  app/
    (auth)/
      login/
      signup/
      sso/
    (dashboard)/
      layout.tsx              # Main dashboard layout with sidebar
      page.tsx                # Dashboard home (compliance score)
      frameworks/
        [frameworkId]/
          page.tsx            # Framework overview
          gaps/
            page.tsx          # Gap analysis for framework
          controls/
            [controlId]/
              page.tsx        # Individual control detail
      policies/
        page.tsx              # Policy library
        [policyId]/
          page.tsx            # Policy editor
      evidence/
        page.tsx              # Evidence vault
      tasks/
        page.tsx              # Task board
      monitor/
        page.tsx              # Continuous monitoring
      audit-room/
        page.tsx              # Audit room setup
      settings/
        page.tsx              # Account settings
        integrations/
          page.tsx            # Integration management
        team/
          page.tsx            # Team management
    (auditor)/
      [auditRoomId]/
        layout.tsx            # Auditor-facing layout (minimal, clean)
        page.tsx              # Auditor evidence browser
    api/
      scan/
        route.ts              # Infrastructure scanning endpoints
      compliance/
        route.ts              # Compliance score, gap analysis
      policies/
        route.ts              # Policy CRUD, AI generation
      evidence/
        route.ts              # Evidence upload, retrieval
      tasks/
        route.ts              # Task management
      webhooks/
        slack/
          route.ts            # Slack event handling
        github/
          route.ts            # GitHub webhook handling
      cron/
        monitor/
          route.ts            # Continuous monitoring cron
  components/
    compliance/               # Compliance-specific components
    dashboard/                # Dashboard widgets
    forms/                    # Form components
    layout/                   # Layout components (sidebar, header)
    shared/                   # Shared/reusable components
  lib/
    supabase/                 # Supabase client, helpers
    ai/                       # OpenAI integration
    scanners/                 # Infrastructure scanner modules
    compliance/               # Compliance engine logic
    utils/                    # Utility functions
  types/                      # TypeScript type definitions
  hooks/                      # Custom React hooks
  stores/                     # Client state (Zustand)
```

### Key Frontend Libraries

| Library              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| Tailwind CSS 3.4     | Utility-first styling                      |
| Headless UI          | Accessible dropdown, modal, tab components |
| Recharts             | Compliance score charts, trend graphs      |
| TipTap               | Rich text editor for policy editing        |
| React Hook Form      | Form management with Zod validation        |
| Zod                  | Schema validation (shared with API)        |
| Zustand              | Lightweight client state management        |
| TanStack Table       | Data tables for evidence, tasks, gaps      |
| date-fns             | Date formatting for audit timelines        |
| next-themes          | Light/dark mode switching                  |

---

## Backend: Supabase (PostgreSQL 15)

### Why Supabase

1. **Row Level Security (RLS)**: Compliance data is highly sensitive. RLS ensures that every database query is automatically scoped to the authenticated user's organization. No accidental data leaks between tenants.

2. **PostgreSQL**: Full SQL power for complex compliance queries (cross-framework control mapping, multi-dimensional gap analysis, audit trail aggregation).

3. **Built-in Auth**: Email/password, magic links, SSO (SAML for enterprise), MFA -- all required for a compliance product.

4. **Realtime**: Live updates for the task board, monitoring alerts, and audit room collaboration.

5. **Storage**: Secure file storage for evidence (screenshots, PDFs, configurations) with RLS on buckets.

6. **Edge Functions**: Serverless functions for webhook processing, scheduled scans, and background jobs.

### Database Schema (Core Tables)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'startup',
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',  -- admin, member, auditor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Compliance frameworks adopted by org
CREATE TABLE org_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id TEXT NOT NULL,  -- soc2, gdpr, hipaa, iso27001
    framework_variant TEXT,      -- soc2_type1, soc2_type2
    status TEXT DEFAULT 'in_progress',
    target_date DATE,
    compliance_score NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controls (framework requirements)
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id TEXT NOT NULL,
    control_id TEXT NOT NULL,        -- e.g., CC6.1, Art.17
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization's control status
CREATE TABLE org_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id),
    status TEXT DEFAULT 'not_started',  -- not_started, in_progress, compliant, non_compliant
    severity TEXT DEFAULT 'medium',      -- critical, high, medium, low
    notes TEXT,
    last_assessed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gaps identified by scanner or AI
CREATE TABLE gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    remediation TEXT NOT NULL,
    source TEXT NOT NULL,  -- scanner, manual, ai_analysis
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft',  -- draft, review, approved, published
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    framework_ids TEXT[],
    control_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence collected
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,  -- screenshot, config, log, document, automated
    file_path TEXT,
    metadata JSONB,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    collection_method TEXT NOT NULL  -- automatic, manual
);

-- Remediation tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    gap_id UUID REFERENCES gaps(id),
    control_id UUID REFERENCES controls(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'todo',  -- todo, in_progress, review, done
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure scan results
CREATE TABLE scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,  -- aws, gcp, github
    scan_type TEXT NOT NULL,
    findings JSONB NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (immutable)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations (connected accounts)
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- aws, gcp, github, slack, okta
    status TEXT DEFAULT 'connected',
    credentials_encrypted BYTEA,  -- AES-256 encrypted
    last_scan TIMESTAMPTZ,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Every table has RLS policies ensuring tenant isolation:

```sql
-- Example RLS policy for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own org"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT org_id FROM members WHERE user_id = auth.uid()
    ));

-- Example RLS policy for policies table
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org policies"
    ON policies FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can create policies"
    ON policies FOR INSERT
    WITH CHECK (org_id IN (
        SELECT org_id FROM members
        WHERE user_id = auth.uid() AND role = 'admin'
    ));
```

---

## AI / ML: OpenAI API

### AI Pipeline Architecture

```
Input Sources                AI Processing              Output
+-----------------+     +---------------------+     +------------------+
| Infrastructure  |---->| Gap Analysis Engine  |---->| Prioritized Gaps |
| Scan Results    |     | (GPT-4o)            |     | + Remediation    |
+-----------------+     +---------------------+     +------------------+

+-----------------+     +---------------------+     +------------------+
| Org Context     |---->| Policy Generator    |---->| Custom Policies  |
| + Framework     |     | (GPT-4o)            |     | (Markdown/PDF)   |
+-----------------+     +---------------------+     +------------------+

+-----------------+     +---------------------+     +------------------+
| Evidence Data   |---->| Audit Prep Engine   |---->| Audit Readiness  |
| + Controls      |     | (GPT-4o-mini)       |     | Report           |
+-----------------+     +---------------------+     +------------------+

+-----------------+     +---------------------+     +------------------+
| Task Context    |---->| Remediation Advisor |---->| Step-by-Step     |
| + Gap Details   |     | (GPT-4o-mini)       |     | Instructions     |
+-----------------+     +---------------------+     +------------------+
```

### Model Selection

| Use Case                  | Model       | Rationale                                      |
| ------------------------- | ----------- | ---------------------------------------------- |
| Policy generation         | GPT-4o      | Requires high-quality, nuanced writing          |
| Gap analysis              | GPT-4o      | Complex reasoning over infrastructure findings  |
| Remediation suggestions   | GPT-4o-mini | Simpler task, cost optimization                 |
| Evidence summarization    | GPT-4o-mini | Straightforward summarization                   |
| Audit prep Q&A            | GPT-4o      | Needs deep compliance knowledge                 |
| Control mapping           | GPT-4o-mini | Pattern matching across frameworks              |

### Prompt Engineering Strategy

All prompts use structured system messages with compliance framework context:

```typescript
const POLICY_GENERATION_SYSTEM = `
You are an expert information security policy writer.
You write policies that comply with {{framework}} requirements.
The organization uses the following technology stack: {{techStack}}.
The organization has {{employeeCount}} employees.
Generate policies that are:
- Specific to the organization's actual technology and size
- Written in clear, professional language
- Structured with numbered sections
- Compliant with {{framework}} control {{controlId}}
- Actionable (not vague or generic)
`;
```

---

## Security Architecture

CompliBot must practice what it preaches. The platform itself is built to SOC 2 standards.

### Encryption

| Layer              | Standard          | Implementation                         |
| ------------------ | ----------------- | -------------------------------------- |
| Data at rest       | AES-256           | Supabase PostgreSQL encryption         |
| Data in transit    | TLS 1.3           | Enforced on all connections            |
| Credentials        | AES-256-GCM       | Customer API keys encrypted at rest    |
| File storage       | AES-256           | Supabase Storage encryption            |
| Backups            | AES-256           | Encrypted database backups             |

### Authentication and Access Control

- Multi-factor authentication (MFA) available for all users, required for admins
- SSO via SAML 2.0 and OIDC for enterprise customers
- Session management with configurable timeout (default 8 hours)
- API key authentication for programmatic access with scoped permissions
- Role-based access control (RBAC): Owner, Admin, Member, Auditor (read-only)

### Audit Logging

Every action is logged to the immutable `audit_log` table:

- User authentication events (login, logout, MFA, failed attempts)
- Data access events (who viewed which policy, evidence, or report)
- Data modification events (policy edits, task updates, evidence uploads)
- Integration events (scan initiated, credentials updated)
- Administrative events (team changes, role changes, settings updates)

### Infrastructure Security

| Measure                | Implementation                                  |
| ---------------------- | ----------------------------------------------- |
| DDoS Protection        | Cloudflare (automatic)                          |
| WAF                    | Cloudflare WAF with OWASP ruleset               |
| Rate Limiting          | Next.js middleware (100 req/min per user)        |
| CORS                   | Strict origin whitelist                          |
| CSP                    | Content Security Policy headers                 |
| Input Validation       | Zod schemas on all API inputs                   |
| SQL Injection          | Parameterized queries via Supabase client        |
| XSS Prevention         | React auto-escaping + CSP                       |
| Dependency Scanning    | GitHub Dependabot + Snyk                         |
| Secret Management      | Environment variables via Vercel                 |

---

## Infrastructure: Hosting and Deployment

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key"
  },
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/evidence-collect",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx audit-ci --moderate
      - uses: snyk/actions/node@master

  deploy:
    needs: [lint-and-type-check, test, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
```

---

## Testing Strategy

| Test Type        | Tool        | Coverage Target | Focus Area                              |
| ---------------- | ----------- | --------------- | --------------------------------------- |
| Unit Tests       | Vitest      | 80%+            | Compliance engine, scanner logic, utils |
| Component Tests  | Vitest + RTL| 70%+            | Dashboard widgets, form components      |
| Integration Tests| Vitest      | 60%+            | API routes, database operations         |
| E2E Tests        | Playwright  | Critical paths  | Onboarding, scanning, policy generation |
| API Mocking      | MSW         | All external    | OpenAI, AWS, GCP, GitHub APIs           |
| Security Tests   | Custom      | All inputs      | Input validation, auth, RLS             |

---

## Scalability Considerations

### Current Architecture (0-1,000 customers)

- Single Vercel deployment, single Supabase project
- Cron-based scanning (every 6 hours)
- Direct OpenAI API calls
- Estimated infrastructure cost: $500-2,000/month

### Growth Architecture (1,000-10,000 customers)

- Vercel with regional edge functions
- Supabase with read replicas
- Queue-based scanning (BullMQ on Redis)
- OpenAI with response caching and batching
- Estimated infrastructure cost: $5,000-15,000/month

### Scale Architecture (10,000+ customers)

- Multi-region deployment
- Dedicated Supabase instances per region
- Custom scanning infrastructure (dedicated workers)
- Fine-tuned models to reduce OpenAI costs
- Event-driven architecture (Kafka or similar)
- Estimated infrastructure cost: $30,000-80,000/month

---

## Development Environment Setup

```bash
# Clone repository
git clone https://github.com/complibot/complibot.git
cd complibot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Supabase, OpenAI, and other API keys

# Start Supabase locally
npx supabase start

# Run database migrations
npx supabase db push

# Seed compliance framework data
npm run seed:frameworks

# Start development server
npm run dev

# Run tests
npm run test
npm run test:e2e
```

### Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_ORG_ID=

# AWS (for scanning customer infrastructure)
# Note: These are CompliBot's own AWS credentials for its infrastructure.
# Customer AWS credentials are stored encrypted in the database.

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=

# SendGrid
SENDGRID_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=  # 256-bit key for encrypting customer credentials
```

---

## Key Technical Decisions

| Decision                                | Choice                  | Rationale                                         |
| --------------------------------------- | ----------------------- | ------------------------------------------------- |
| Monorepo vs. separate services          | Monorepo (Next.js)      | Faster iteration at early stage, simpler deploys  |
| SQL vs. NoSQL                           | PostgreSQL (SQL)        | Complex relational queries, RLS, audit compliance |
| REST vs. GraphQL                        | REST (Route Handlers)   | Simpler, sufficient for current needs             |
| Server Components vs. Client            | Server-first            | Better performance, less client JS                |
| Custom auth vs. managed                 | Supabase Auth           | Built-in MFA, SSO, session management             |
| Self-hosted AI vs. API                  | OpenAI API              | Faster time to market, no ML infra needed         |
| Real-time vs. polling                   | Supabase Realtime       | Live task board, monitoring alerts                |
| File storage                            | Supabase Storage        | Integrated RLS, same tenant isolation model       |
