# InvoiceAI — Tech Stack

## Overview

InvoiceAI is a web-first B2C application built for performance, reliability, and rapid iteration. The stack prioritizes server-side rendering (for client-facing invoice portals that must load fast and be SEO-friendly), real-time data (for dashboard updates), and robust scheduled task execution (for automated invoice sending and follow-up reminders).

---

## Architecture Diagram

```
                                    +------------------+
                                    |   Cloudflare     |
                                    |   (CDN + WAF +   |
                                    |    DDoS Prot.)   |
                                    +--------+---------+
                                             |
                                    +--------+---------+
                                    |     Vercel       |
                                    |   (Hosting +     |
                                    |    Edge Runtime) |
                                    +--------+---------+
                                             |
                          +------------------+------------------+
                          |                                     |
               +----------+----------+              +-----------+-----------+
               |    Next.js 14       |              |   Client Portal       |
               |    App Router       |              |   (SSR Public Pages)  |
               |  (Dashboard SPA)    |              |   /pay/[invoiceId]    |
               +----------+----------+              +-----------+-----------+
                          |                                     |
                          +------------------+------------------+
                                             |
                                    +--------+---------+
                                    |    Supabase      |
                                    |  (PostgreSQL +   |
                                    |   Auth + Edge    |
                                    |   Functions +    |
                                    |   Realtime)      |
                                    +--------+---------+
                                             |
                    +------------+-----------+-----------+------------+
                    |            |                       |            |
            +-------+--+  +-----+------+        +-------+---+  +----+-------+
            | OpenAI   |  |  Stripe    |        | SendGrid  |  |   Plaid    |
            | API      |  |  API       |        | (Email)   |  |   API      |
            | (AI/ML)  |  | (Payments) |        |           |  | (Banking)  |
            +----------+  +------------+        +-----------+  +------------+
```

---

## Frontend

### Next.js 14 (App Router)

**Why Next.js 14:**
- **App Router** provides server components by default, reducing client-side JavaScript bundle
- **SSR for invoice portals** — Client-facing payment pages (`/pay/[invoiceId]`) must load instantly and be indexable
- **Server Actions** for form submissions (create invoice, update client, trigger send)
- **Route Groups** to separate authenticated dashboard from public portal pages
- **Streaming** for progressive loading of dashboard widgets
- **Built-in image optimization** for logo uploads in invoice templates

**Route Structure:**
```
app/
  (auth)/
    login/
    signup/
    forgot-password/
  (dashboard)/
    layout.tsx              # Authenticated layout with sidebar
    page.tsx                # Dashboard home
    invoices/
      page.tsx              # Invoice list
      new/page.tsx          # Create invoice (AI-assisted)
      [id]/page.tsx         # Invoice detail
      [id]/edit/page.tsx    # Edit invoice
    clients/
      page.tsx              # Client list
      [id]/page.tsx         # Client detail
    reports/page.tsx        # Reports & analytics
    follow-ups/page.tsx     # Follow-up manager
    expenses/page.tsx       # Expense tracker
    settings/
      page.tsx              # General settings
      billing/page.tsx      # Subscription management
      branding/page.tsx     # Logo, colors, templates
      integrations/page.tsx # Connected services
  (portal)/
    pay/[invoiceId]/page.tsx  # Public client payment page (SSR)
    receipt/[id]/page.tsx     # Payment receipt (SSR)
  api/
    webhooks/
      stripe/route.ts       # Stripe webhook handler
      plaid/route.ts        # Plaid webhook handler
    cron/
      send-invoices/route.ts    # Scheduled invoice sending
      send-reminders/route.ts   # Payment reminder cron
      predict-payments/route.ts # Payment prediction batch
```

### Tailwind CSS

**Why Tailwind:**
- Utility-first for rapid prototyping and consistent spacing
- Custom theme tokens for InvoiceAI design system (money green, status colors)
- `@apply` for reusable invoice template styles
- Print media utilities for PDF-quality invoice rendering
- Dark mode support via `class` strategy

**Configuration:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#059669',
          light: '#34D399',
          dark: '#047857',
        },
        status: {
          paid: '#22C55E',
          overdue: '#DC2626',
          pending: '#F59E0B',
          draft: '#6B7280',
          sent: '#3B82F6',
          viewed: '#8B5CF6',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
}
```

### State Management

- **Server Components** for data fetching (no client state needed for read-only views)
- **React Server Actions** for mutations (create invoice, update client)
- **Zustand** for lightweight client-side state (UI toggles, form wizards, optimistic updates)
- **SWR** for client-side data revalidation (real-time invoice status updates)
- **URL state** for filters and pagination (searchParams-based, shareable)

### UI Component Library

- **Radix UI** primitives for accessible dropdowns, modals, tooltips, tabs
- **Recharts** for dashboard charts (revenue trends, cash flow, payment speed)
- **React-PDF** (@react-pdf/renderer) for generating downloadable invoice PDFs
- **react-email** for invoice email templates (preview in dev, render to HTML for SendGrid)
- **date-fns** for date formatting and manipulation (due dates, payment terms)
- **nuqs** for type-safe URL search params

---

## Backend

### Supabase

**Why Supabase:**
- **PostgreSQL** with full SQL power for financial data (transactions, aggregations, reporting)
- **Row Level Security (RLS)** — Critical for multi-tenant invoicing data isolation
- **Auth** with magic link, Google, and email/password sign-in
- **Edge Functions** (Deno) for scheduled tasks (invoice sending, reminders, predictions)
- **Realtime** subscriptions for live invoice status updates (client viewed, payment received)
- **Storage** for logo uploads, receipt images, and generated PDF invoices

**Database Schema (Core Tables):**
```sql
-- Users / Business Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_name TEXT,
  email TEXT NOT NULL,
  logo_url TEXT,
  address JSONB,
  default_payment_terms INTEGER DEFAULT 30,
  default_currency TEXT DEFAULT 'USD',
  stripe_account_id TEXT,
  plaid_access_token TEXT,
  branding JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  address JSONB,
  payment_terms INTEGER DEFAULT 30,
  preferred_currency TEXT DEFAULT 'USD',
  health_score REAL DEFAULT 100.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','paid','overdue','cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  line_items JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(12,2),
  viewed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  pdf_url TEXT,
  prediction_score REAL,
  recurring_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-up Sequences
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  sequence_step INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  message_type TEXT CHECK (message_type IN ('friendly','reminder','firm','final')),
  message_content TEXT,
  channel TEXT DEFAULT 'email',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','cancelled','skipped'))
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  stripe_payment_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method TEXT CHECK (method IN ('card','ach','wire','manual')),
  status TEXT DEFAULT 'succeeded',
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  client_id UUID REFERENCES clients(id),
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security:**
```sql
-- Every table has RLS enabled. Example for invoices:
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own invoices"
  ON invoices FOR ALL
  USING (user_id = auth.uid());

-- Public access for client portal (view only, by invoice ID)
CREATE POLICY "Clients can view their invoices via portal"
  ON invoices FOR SELECT
  USING (true);  -- Protected by invoice ID knowledge + portal auth
```

### Supabase Edge Functions

Used for scheduled/background tasks that cannot run in Vercel's serverless environment:

| Function | Trigger | Purpose |
|---|---|---|
| `send-scheduled-invoices` | Cron (every hour) | Send invoices scheduled for optimal send time |
| `send-reminders` | Cron (daily 9am) | Process follow-up queue, send due reminders |
| `update-overdue-status` | Cron (daily midnight) | Mark invoices past due date as overdue |
| `predict-payment` | On invoice creation | Run AI prediction for payment likelihood |
| `generate-cash-flow` | Cron (weekly) | Regenerate 90-day cash flow forecast |
| `update-client-health` | On payment event | Recalculate client health scores |

---

## AI / ML Layer

### OpenAI API

**Models Used:**

| Use Case | Model | Why |
|---|---|---|
| Invoice Drafting | GPT-4o | Complex reasoning for line item extraction from project descriptions |
| Follow-up Messages | GPT-4o-mini | Faster/cheaper for template-based message generation |
| Payment Prediction | GPT-4o-mini + Fine-tuned | Pattern recognition from historical payment data |
| Cash Flow Forecast | GPT-4o | Multi-variable financial projection |

**Invoice Drafting Pipeline:**
```
User Input (project description / time log)
    → System Prompt (invoice formatting rules, user's business context)
    → GPT-4o (structured output mode)
    → JSON response (line items, descriptions, amounts, suggested terms)
    → User review & edit
    → Final invoice
```

**Payment Prediction Features:**
- Client's historical payment speed (average days to pay)
- Invoice amount relative to client's typical invoices
- Day of week / month sent
- Client industry
- Payment terms (Net 15/30/60)
- Number of line items
- Previous follow-ups required
- Output: probability score (0-100) of on-time payment

**Cost Estimates (at scale):**

| Usage Level | Monthly API Cost |
|---|---|
| 1,000 invoices/month | ~$50 |
| 10,000 invoices/month | ~$350 |
| 100,000 invoices/month | ~$2,500 |
| 500,000 invoices/month | ~$10,000 |

---

## Payments Infrastructure

### Stripe

- **Stripe Checkout** for subscription billing (Free/Pro/Business tiers)
- **Stripe Connect** (Standard) for processing client payments to freelancer accounts
- **Stripe Invoicing API** as fallback/reference for invoice data model
- **Webhooks** for payment confirmation, subscription changes, disputes
- **Stripe Tax** for automatic sales tax calculation (post-MVP)

### Plaid

- **Auth** product for bank account verification (ACH payments)
- **Identity** for client verification (optional, for large invoices)
- Reduces payment processing cost from 2.9% (card) to 0.8% (ACH)

---

## Email Infrastructure

### SendGrid

- **Transactional emails:** Invoice delivery, payment receipts, reminders
- **Dynamic templates:** Branded invoice emails with inline payment buttons
- **Scheduled sending:** Queue emails for AI-determined optimal send time
- **Event tracking:** Open tracking, click tracking (to detect "viewed" status)
- **Suppression management:** Handle bounces, unsubscribes

**Email Types:**

| Email | Trigger | Template |
|---|---|---|
| Invoice Delivery | User sends invoice | Branded with line items + "Pay Now" button |
| Payment Received | Stripe webhook | Receipt confirmation |
| Friendly Reminder | 3 days before due | Soft reminder with payment link |
| Overdue Notice | 1 day after due | Firmer tone, payment link |
| Final Notice | 14+ days overdue | Professional escalation |
| Weekly Digest | Cron (Monday 9am) | Revenue summary, outstanding invoices |

---

## Infrastructure

### Vercel

- **Hosting:** Next.js deployment with automatic preview deployments
- **Edge Runtime:** For client portal pages (low latency globally)
- **Serverless Functions:** API routes for webhook handlers
- **Cron Jobs:** Vercel Cron for triggering Supabase Edge Functions
- **Analytics:** Web Vitals monitoring for portal page performance

### Cloudflare

- **CDN:** Static asset caching (JS, CSS, images, fonts)
- **WAF:** Protection against common web attacks
- **DDoS Protection:** Critical for a financial application
- **SSL:** End-to-end encryption
- **DNS:** Fast DNS resolution

### Monitoring & Observability

| Tool | Purpose |
|---|---|
| **Sentry** | Error tracking, performance monitoring |
| **Vercel Analytics** | Web Vitals, page load times |
| **Supabase Dashboard** | Database performance, query analysis |
| **PostHog** | Product analytics, feature flags, session replay |
| **BetterStack (Logtail)** | Log aggregation, uptime monitoring |

---

## Development Tools

### Language & Framework

| Tool | Version | Purpose |
|---|---|---|
| **TypeScript** | 5.x | Type safety across entire codebase |
| **Next.js** | 14.x | Full-stack React framework |
| **React** | 18.x | UI library |
| **Node.js** | 20.x LTS | Runtime |

### Testing

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests (utilities, AI prompt builders, calculations) |
| **React Testing Library** | Component tests (invoice form, client list) |
| **Playwright** | E2E tests (full invoice creation flow, payment flow) |
| **MSW** | API mocking for Stripe/OpenAI in tests |

### Code Quality

| Tool | Purpose |
|---|---|
| **ESLint** | Linting with strict TypeScript rules |
| **Prettier** | Code formatting |
| **Husky** | Pre-commit hooks |
| **lint-staged** | Run linters on staged files only |
| **commitlint** | Conventional commit messages |

### CI/CD

| Stage | Tool | Action |
|---|---|---|
| **Lint** | GitHub Actions | ESLint + Prettier check |
| **Test** | GitHub Actions | Vitest + Playwright |
| **Build** | Vercel | Automatic on push to main |
| **Preview** | Vercel | Preview deployment on PR |
| **Deploy** | Vercel | Production on merge to main |
| **DB Migration** | Supabase CLI | Schema migrations in version control |

---

## Scalability Plan

### Phase 1: MVP (0 - 10K users)

- Single Supabase project (free tier handles this)
- Vercel Hobby/Pro plan
- OpenAI API with standard rate limits
- SendGrid free tier (100 emails/day) then Essentials ($19.95/mo)
- **Monthly infrastructure cost:** ~$50-100

### Phase 2: Growth (10K - 100K users)

- Supabase Pro plan ($25/mo + usage)
- Vercel Pro plan ($20/mo)
- Connection pooling via Supabase (PgBouncer)
- Redis caching layer (Upstash) for frequently accessed data
- OpenAI API with increased rate limits
- SendGrid Pro ($89.95/mo for 100K emails)
- **Monthly infrastructure cost:** ~$500-1,500

### Phase 3: Scale (100K - 1M users)

- Supabase Team plan with read replicas
- Vercel Enterprise
- Dedicated OpenAI fine-tuned models for payment prediction
- Separate database for analytics (read replica or data warehouse)
- Queue system (Inngest or Trigger.dev) for background jobs
- Multi-region deployment for global freelancers
- **Monthly infrastructure cost:** ~$5,000-15,000

### Phase 4: Enterprise (1M+ users)

- Consider migrating to self-managed PostgreSQL (AWS RDS) for cost optimization
- Custom ML models (potentially move off OpenAI for prediction)
- Kafka for event streaming
- Data warehouse (BigQuery or Snowflake) for analytics
- SOC 2 compliance infrastructure
- **Monthly infrastructure cost:** ~$30,000-80,000

---

## Security Considerations

| Area | Implementation |
|---|---|
| **Authentication** | Supabase Auth with MFA (TOTP) |
| **Authorization** | Row Level Security on all tables |
| **Data Encryption** | TLS in transit, AES-256 at rest (Supabase default) |
| **PII Handling** | Stripe handles card data (PCI DSS compliant) |
| **API Keys** | Environment variables, never client-side |
| **CSRF Protection** | SameSite cookies, CSRF tokens |
| **Rate Limiting** | Vercel Edge Middleware + Supabase RLS |
| **Audit Logging** | All invoice actions logged with timestamps |
| **Backup** | Daily automated PostgreSQL backups (Supabase) |
| **Vulnerability Scanning** | Dependabot + Snyk for dependency monitoring |

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| SSR vs SPA | SSR for portal, SPA-like for dashboard | Portal needs fast load + SEO; dashboard needs interactivity |
| Supabase vs custom backend | Supabase | Faster to build, built-in auth/RLS, PostgreSQL for financial data |
| OpenAI vs local models | OpenAI API | Best quality for invoice drafting, no ML ops overhead at MVP |
| Stripe vs custom payments | Stripe Connect | Regulatory compliance, trusted by clients, fast integration |
| Edge Functions vs Workers | Supabase Edge Functions | Co-located with database, simpler deployment |
| PDF generation | React-PDF | React-native approach, better than Puppeteer for structured docs |

---

*Last updated: February 2026*
