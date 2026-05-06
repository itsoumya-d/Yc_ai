# DealRoom -- Tech Stack

## Architecture Overview

DealRoom is built as a modern, AI-native B2B web application optimized for real-time data processing, CRM integration, and generative AI workflows. The architecture prioritizes low-latency deal updates, secure multi-tenant data isolation, and scalable AI inference.

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
|  Next.js 14 (App Router) + React Server Components               |
|  Tailwind CSS + shadcn/ui + Recharts                              |
|  Real-time subscriptions via Supabase Realtime                    |
+------------------------------------------------------------------+
        |               |               |               |
        v               v               v               v
+------------------------------------------------------------------+
|                      API LAYER                                    |
|  Next.js API Routes (Route Handlers)                              |
|  tRPC for type-safe internal APIs                                 |
|  Webhook receivers (Salesforce, HubSpot, Gmail, Zoom)             |
+------------------------------------------------------------------+
        |               |               |               |
        v               v               v               v
+------------------------------------------------------------------+
|                    SERVICE LAYER                                  |
|  Deal Scoring Engine    |  Email Intelligence    |  AI Content    |
|  Pipeline Analytics     |  Call Transcription     |  CRM Sync      |
|  Forecast Engine        |  Coaching Analyzer      |  Alert System  |
+------------------------------------------------------------------+
        |               |               |               |
        v               v               v               v
+------------------------------------------------------------------+
|                     DATA LAYER                                    |
|  Supabase (PostgreSQL + pgvector)                                 |
|  Row-Level Security (multi-tenant isolation)                      |
|  Supabase Realtime (live deal updates)                            |
|  Supabase Storage (call recordings, attachments)                  |
+------------------------------------------------------------------+
        |               |               |               |
        v               v               v               v
+------------------------------------------------------------------+
|                  EXTERNAL SERVICES                                |
|  OpenAI GPT-4o    |  Whisper API    |  Salesforce API             |
|  HubSpot API      |  Gmail API      |  Google Calendar API        |
|  Zoom API         |  Clearbit       |  Apollo.io                  |
+------------------------------------------------------------------+
        |
        v
+------------------------------------------------------------------+
|                  INFRASTRUCTURE                                   |
|  Vercel (hosting + edge functions + cron)                         |
|  Cloudflare (CDN + DDoS protection + WAF)                         |
|  Supabase Cloud (managed PostgreSQL)                              |
|  Upstash (Redis for rate limiting + caching)                      |
+------------------------------------------------------------------+
```

---

## Frontend

### Next.js 14 (App Router)

**Why Next.js 14:** DealRoom is a data-dense dashboard application. Next.js 14 with App Router provides React Server Components for fast initial loads, streaming for progressive data rendering, and built-in API routes for backend logic -- all in a single deployable unit.

| Feature | Implementation |
|---------|---------------|
| **Framework** | Next.js 14 with App Router |
| **Rendering** | React Server Components (RSC) for dashboard layouts; Client Components for interactive elements (deal cards, drag-and-drop, charts) |
| **Streaming** | Suspense boundaries for progressive loading of deal data, forecasts, and AI insights |
| **Routing** | File-based routing with route groups: `(dashboard)`, `(auth)`, `(settings)`, `(admin)` |
| **Middleware** | Auth verification, team/org routing, feature flags |
| **Caching** | ISR for analytics pages, on-demand revalidation for deal updates |

### UI Framework and Styling

| Tool | Purpose |
|------|---------|
| **Tailwind CSS** | Utility-first styling, custom design system tokens |
| **shadcn/ui** | Accessible, unstyled component primitives (dialogs, dropdowns, tables, tooltips) |
| **Radix UI** | Underlying headless components for shadcn/ui |
| **Recharts** | Revenue charts, forecast trend lines, win rate graphs |
| **React DnD** | Drag-and-drop for pipeline kanban board |
| **TipTap** | Rich text editor for email composer with AI inline suggestions |
| **Framer Motion** | Micro-animations for deal stage transitions, score updates, alerts |
| **React Virtual** | Virtualized lists for large deal tables (1000+ deals) |

### Real-Time Updates

```typescript
// Supabase Realtime subscription for live deal updates
const channel = supabase
  .channel('deal-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals',
      filter: `org_id=eq.${orgId}`,
    },
    (payload) => {
      // Update deal in local state
      updateDealInStore(payload.new as Deal);
      // Trigger re-scoring if deal data changed
      if (payload.eventType === 'UPDATE') {
        invalidateDealScore(payload.new.id);
      }
    }
  )
  .subscribe();
```

### State Management

| Layer | Tool | Purpose |
|-------|------|---------|
| **Server State** | React Server Components + Supabase | Deal data, pipeline, contacts |
| **Client Cache** | TanStack Query (React Query) | API response caching, optimistic updates |
| **UI State** | Zustand | Sidebar open/close, active filters, selected deals |
| **Form State** | React Hook Form + Zod | Settings forms, email composer, CRM configuration |
| **URL State** | nuqs (type-safe search params) | Pipeline filters, date ranges, sort orders |

---

## Backend

### Supabase (PostgreSQL + Auth + Realtime + Storage)

**Why Supabase:** DealRoom needs a relational database (deals have complex relationships), real-time subscriptions (live deal updates), row-level security (multi-tenant isolation), and file storage (call recordings). Supabase provides all of this as a managed service with a generous free tier for development.

#### Database Schema (Core Tables)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter',
  salesforce_connected BOOLEAN DEFAULT FALSE,
  hubspot_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (sales reps, managers)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'rep', -- rep, manager, admin, viewer
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deals (pipeline)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  owner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  amount DECIMAL(12, 2),
  stage TEXT NOT NULL, -- prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  close_date DATE,
  ai_score DECIMAL(5, 2), -- 0.00 to 100.00
  health_status TEXT DEFAULT 'healthy', -- healthy, at_risk, critical, stalled
  days_in_stage INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  crm_id TEXT, -- Salesforce/HubSpot ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts / Stakeholders
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  role_in_deal TEXT, -- champion, decision_maker, influencer, blocker, end_user
  engagement_score DECIMAL(5, 2),
  last_contacted_at TIMESTAMPTZ,
  linkedin_url TEXT,
  crm_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activities (emails, calls, meetings)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  user_id UUID REFERENCES users(id),
  contact_id UUID REFERENCES contacts(id),
  type TEXT NOT NULL, -- email_sent, email_received, call, meeting, note, crm_update
  subject TEXT,
  body TEXT,
  sentiment DECIMAL(3, 2), -- -1.00 to 1.00
  action_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  type TEXT NOT NULL, -- risk_alert, next_action, coaching_tip, competitor_mention
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  dismissed BOOLEAN DEFAULT FALSE,
  acted_on BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Call Recordings
CREATE TABLE call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  activity_id UUID REFERENCES activities(id),
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER,
  transcript TEXT,
  summary TEXT,
  key_moments JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deal Score History (for trend analysis)
CREATE TABLE deal_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  score DECIMAL(5, 2),
  factors JSONB DEFAULT '{}',
  scored_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy example: Users can only see their org's deals
CREATE POLICY "Users see own org deals" ON deals
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
```

#### Row-Level Security (Multi-Tenant Isolation)

Every table uses RLS policies to ensure strict tenant isolation. Users can only access data belonging to their organization. This is enforced at the database level, so even if application code has a bug, data cannot leak between tenants.

#### Supabase Auth

| Feature | Implementation |
|---------|---------------|
| **Sign-up / Login** | Email + password, Google OAuth, Microsoft OAuth |
| **SSO (Enterprise)** | SAML 2.0 via Supabase Auth (Enterprise plan) |
| **Session Management** | JWT tokens, automatic refresh |
| **Role-Based Access** | Custom claims: `rep`, `manager`, `admin`, `viewer` |
| **Team Invites** | Magic link invitations via Supabase Auth |

#### Supabase Realtime

Used for live deal updates across the team. When a deal stage changes, score updates, or a new activity is logged, all connected team members see the update instantly without page refresh.

#### Supabase Storage

Used for call recording files (audio/video), email attachments, and exported reports. Files are organized by org ID with signed URL access.

### API Layer

| Pattern | Tool | Usage |
|---------|------|-------|
| **Internal APIs** | tRPC | Type-safe RPC between frontend and backend |
| **External Webhooks** | Next.js Route Handlers | Receiving webhooks from Salesforce, HubSpot, Gmail |
| **Background Jobs** | Vercel Cron + Inngest | Deal scoring, email sync, CRM sync, forecast calculations |
| **Rate Limiting** | Upstash Redis | API rate limiting, AI call throttling |

### Background Processing

```typescript
// Inngest function for AI deal scoring (runs every hour)
export const scoreDeal = inngest.createFunction(
  { id: 'score-deal', concurrency: { limit: 10 } },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const deals = await step.run('fetch-active-deals', async () => {
      return supabase
        .from('deals')
        .select('*')
        .not('stage', 'in', '("closed_won","closed_lost")')
        .order('updated_at', { ascending: false });
    });

    for (const deal of deals.data ?? []) {
      await step.run(`score-${deal.id}`, async () => {
        const activities = await getRecentActivities(deal.id);
        const contacts = await getDealContacts(deal.id);
        const score = await calculateDealScore(deal, activities, contacts);

        await supabase.from('deals').update({ ai_score: score.value, health_status: score.health }).eq('id', deal.id);
        await supabase.from('deal_score_history').insert({ deal_id: deal.id, score: score.value, factors: score.factors });

        if (score.health === 'critical') {
          await createAlert(deal, score);
        }
      });
    }
  }
);
```

---

## AI/ML Stack

### OpenAI GPT-4o

**Primary AI engine** for deal analysis, content generation, and coaching insights.

| Use Case | Model | Prompt Strategy |
|----------|-------|----------------|
| **Deal Scoring** | GPT-4o | Structured output: score (0-100) + factors + recommendations |
| **Email Generation** | GPT-4o | System prompt with deal context, contact history, company info |
| **Call Summarization** | GPT-4o | Transcript + structured extraction (summary, action items, objections) |
| **Coaching Insights** | GPT-4o | Compare rep behavior against top performers, generate suggestions |
| **Sentiment Analysis** | GPT-4o-mini | Classify email/call sentiment for deal health tracking |
| **CRM Auto-Updates** | GPT-4o-mini | Extract structured data (next steps, close dates) from emails |
| **Competitor Detection** | GPT-4o-mini | Identify competitor mentions in calls and emails |

```typescript
// AI deal scoring prompt structure
const dealScoringPrompt = `
You are a B2B sales intelligence engine. Analyze this deal and provide a close probability score.

DEAL CONTEXT:
- Deal: ${deal.name} at ${deal.company}
- Amount: $${deal.amount}
- Stage: ${deal.stage}
- Days in stage: ${deal.days_in_stage}
- Close date: ${deal.close_date}

ACTIVITY HISTORY (last 30 days):
${activities.map(a => `- ${a.type}: ${a.subject} (${a.occurred_at})`).join('\n')}

STAKEHOLDER MAP:
${contacts.map(c => `- ${c.full_name} (${c.title}) - Role: ${c.role_in_deal} - Last contact: ${c.last_contacted_at}`).join('\n')}

Respond in JSON:
{
  "score": number (0-100),
  "health": "healthy" | "at_risk" | "critical" | "stalled",
  "factors": {
    "positive": ["string"],
    "negative": ["string"]
  },
  "next_actions": ["string"],
  "risk_summary": "string"
}
`;
```

### OpenAI Whisper API

**Call transcription engine.** Processes uploaded call recordings or Zoom meeting recordings into accurate transcripts.

| Specification | Detail |
|---------------|--------|
| **Model** | Whisper large-v3 |
| **Cost** | $0.006 per minute |
| **Supported Formats** | mp3, mp4, mpeg, mpga, m4a, wav, webm |
| **Max File Size** | 25 MB (chunk larger files) |
| **Languages** | 57 languages (primarily English for B2B sales) |
| **Speaker Diarization** | Post-processing with pyannote or custom model |

```typescript
// Transcription pipeline
async function transcribeCall(recordingId: string) {
  const recording = await getRecording(recordingId);
  const audioFile = await downloadFromStorage(recording.storage_path);

  // 1. Transcribe with Whisper
  const transcript = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  // 2. Summarize with GPT-4o
  const summary = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CALL_SUMMARY_PROMPT },
      { role: 'user', content: transcript.text },
    ],
    response_format: { type: 'json_object' },
  });

  // 3. Save results
  await supabase.from('call_recordings').update({
    transcript: transcript.text,
    summary: summary.choices[0].message.content,
    processed: true,
  }).eq('id', recordingId);
}
```

### Custom Deal Scoring Model

In addition to GPT-4o-based scoring, DealRoom trains a custom ML model on historical deal outcomes:

| Component | Tool |
|-----------|------|
| **Feature Store** | Supabase PostgreSQL (materialized views) |
| **Training** | Python + scikit-learn (gradient boosted trees) |
| **Features** | 45+ signals: activity frequency, email sentiment trend, stakeholder count, stage velocity, response time |
| **Serving** | ONNX Runtime in Vercel Edge Functions |
| **Retraining** | Weekly, triggered by Inngest cron job |

### pgvector (Semantic Search)

Used for finding similar past deals, relevant coaching content, and semantic search across call transcripts.

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to deals
ALTER TABLE deals ADD COLUMN embedding vector(1536);

-- Similarity search for "deals like this one"
SELECT id, name, company, stage, ai_score,
  1 - (embedding <=> $1) as similarity
FROM deals
WHERE org_id = $2
  AND stage IN ('closed_won', 'closed_lost')
ORDER BY embedding <=> $1
LIMIT 5;
```

---

## Integrations Architecture

### CRM Sync (Salesforce / HubSpot)

```
+------------------+       +-----------------+       +------------------+
|   Salesforce     | <---> |   DealRoom      | <---> |   HubSpot        |
|   REST API       |       |   Sync Engine   |       |   API            |
+------------------+       +-----------------+       +------------------+
       |                          |                          |
  Outbound Webhooks          Conflict                  Webhooks
  (Push changes)             Resolution               (Push changes)
                             + Dedup
```

| Sync Feature | Implementation |
|-------------|----------------|
| **Direction** | Bi-directional (read and write) |
| **Frequency** | Real-time via webhooks + hourly full sync |
| **Conflict Resolution** | Last-write-wins with audit log |
| **Field Mapping** | Configurable per organization |
| **Bulk Operations** | Salesforce Bulk API 2.0 for initial import |

### Email Sync (Gmail / Microsoft Graph)

| Feature | Implementation |
|---------|---------------|
| **Protocol** | Gmail API (Google), Microsoft Graph API (Outlook) |
| **Sync Method** | Incremental via history IDs (Gmail) / delta tokens (Graph) |
| **Matching** | Email address to contact/deal association |
| **Privacy** | Only syncs emails to/from known contacts in deals |
| **Storage** | Metadata + body stored in Supabase, encrypted at rest |

### Calendar Sync (Google Calendar)

Detects meetings with deal contacts, auto-creates activity records, and enables pre-meeting AI briefings.

### Zoom Integration

Accesses meeting recordings via Zoom API, downloads audio, and feeds into the Whisper transcription pipeline.

---

## Infrastructure

### Hosting and Deployment

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Vercel** | Application hosting | Pro plan, US East region, preview deployments per PR |
| **Supabase Cloud** | Database + Auth + Realtime + Storage | Pro plan, US East, daily backups, PITR |
| **Cloudflare** | CDN + WAF + DDoS protection | Pro plan, custom domain, SSL |
| **Upstash** | Redis (rate limiting + caching) | Pay-per-use, global replication |
| **Inngest** | Background job orchestration | Pro plan, event-driven workflows |

### CI/CD Pipeline

```
GitHub Push --> GitHub Actions --> Lint + Type Check --> Unit Tests (Vitest) --> Integration Tests (Playwright) --> Deploy to Vercel Preview --> Manual QA --> Merge to main --> Auto-deploy to Production
```

### Monitoring and Observability

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Core Web Vitals, page load performance |
| **Sentry** | Error tracking, session replay |
| **PostHog** | Product analytics, feature flags, session recording |
| **Axiom** | Log aggregation, structured logging |
| **Better Uptime** | Uptime monitoring, status page |
| **PlanetScale Insights** | Query performance (if migrating from Supabase) |

---

## Development Tools

### Language and Type Safety

| Tool | Purpose |
|------|---------|
| **TypeScript** | Strict mode, end-to-end type safety |
| **Zod** | Runtime schema validation for API inputs, AI outputs |
| **tRPC** | Type-safe API layer between frontend and backend |
| **Supabase Gen Types** | Auto-generated TypeScript types from database schema |

### Testing

| Level | Tool | Coverage Target |
|-------|------|----------------|
| **Unit Tests** | Vitest | 80%+ for business logic (deal scoring, sync engine) |
| **Component Tests** | Vitest + Testing Library | Critical UI components (deal card, pipeline board) |
| **Integration Tests** | Playwright | CRM sync flows, email composition, AI generation |
| **E2E Tests** | Playwright | Full user journeys (onboarding, deal creation, email send) |
| **API Tests** | Vitest + msw | Webhook handlers, tRPC routes |
| **AI Output Tests** | Custom harness | Structured output validation, prompt regression |

### Code Quality

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting (strict Next.js + TypeScript rules) |
| **Prettier** | Code formatting |
| **Husky** | Git hooks (pre-commit lint, pre-push test) |
| **lint-staged** | Only lint changed files |
| **Commitlint** | Conventional commit messages |

---

## Scalability Considerations

### Current Architecture (0-1000 users)

- Single Supabase instance (PostgreSQL)
- Vercel serverless functions
- OpenAI API direct calls
- Inngest for background processing

### Growth Phase (1000-10000 users)

- Supabase connection pooling (Supavisor)
- Read replicas for analytics queries
- Redis caching layer for frequently accessed deal data
- OpenAI API with batching and queue management
- Dedicated Inngest workers for CRM sync

### Scale Phase (10000+ users)

- Consider migration to dedicated PostgreSQL (e.g., Neon or RDS) for more control
- Dedicated ML inference servers (GPU instances for custom models)
- Event-driven architecture with message queues (e.g., Upstash Kafka)
- Multi-region deployment for global customers
- Data warehouse (ClickHouse or BigQuery) for analytics at scale
- Custom fine-tuned models to reduce per-query AI costs

### Performance Targets

| Metric | Target |
|--------|--------|
| **Dashboard Load** | < 1.5 seconds (LCP) |
| **Deal Score Update** | < 3 seconds after new activity |
| **Email Generation** | < 5 seconds (streaming response) |
| **Call Transcription** | < 2x real-time (30-min call transcribed in < 15 min) |
| **CRM Sync Latency** | < 30 seconds (webhook-triggered) |
| **Search Results** | < 500ms for deal/contact search |
| **API Response (p99)** | < 200ms for read operations |

---

## Security

| Concern | Solution |
|---------|----------|
| **Data Isolation** | Row-Level Security at database level |
| **Encryption at Rest** | AES-256 (Supabase managed) |
| **Encryption in Transit** | TLS 1.3 everywhere |
| **Auth** | JWT + refresh tokens, MFA support |
| **API Security** | Rate limiting, input validation (Zod), CORS |
| **Secrets Management** | Vercel environment variables, encrypted |
| **SOC 2 Compliance** | Target for Year 2 (Supabase and Vercel are both SOC 2 compliant) |
| **GDPR** | Data deletion workflows, export capability, consent management |
| **Audit Logging** | All CRM sync operations and data access logged |

---

*Tech stack designed for rapid MVP development with a clear path to enterprise scale.*
