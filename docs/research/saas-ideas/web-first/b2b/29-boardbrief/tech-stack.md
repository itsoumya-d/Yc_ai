# BoardBrief — Tech Stack

## Architecture Overview

```
                                    +-----------------------+
                                    |     Cloudflare CDN    |
                                    |   WAF + DDoS + Edge   |
                                    +-----------+-----------+
                                                |
                                    +-----------+-----------+
                                    |    Vercel (Hosting)    |
                                    |  Edge Functions + SSR  |
                                    +-----------+-----------+
                                                |
                          +---------------------+---------------------+
                          |                                           |
              +-----------+-----------+               +---------------+---------------+
              |   Next.js 14 Frontend |               |        API Routes             |
              |   App Router (SSR)    |               |   /api/deck, /api/meeting,    |
              |   Board Portal (RSC)  |               |   /api/resolution, /api/kpi   |
              +-----------+-----------+               +---------------+---------------+
                          |                                           |
                          +---------------------+---------------------+
                                                |
                                    +-----------+-----------+
                                    |   Supabase Backend     |
                                    |                       |
                                    |  PostgreSQL (Data)    |
                                    |  Auth (RBAC)          |
                                    |  Storage (Documents)  |
                                    |  Realtime (Live)      |
                                    +-----------+-----------+
                                                |
                    +---------------------------+---------------------------+
                    |               |               |               |       |
              +-----+-----+  +-----+-----+  +------+----+  +------+----+  |
              |  Stripe   |  | QuickBooks|  |  HubSpot  |  |   Gusto   |  |
              |  API      |  |   API     |  |   API     |  |   API     |  |
              +-----------+  +-----------+  +-----------+  +-----------+  |
                                                                          |
                                                               +----------+----------+
                                                               |   OpenAI APIs       |
                                                               |  GPT-4o + Whisper   |
                                                               +---------------------+
```

---

## Frontend

### Next.js 14 (App Router)

**Why Next.js 14:**
- **App Router with Server Components** — Board portal pages are server-rendered for fast initial loads and SEO (board members accessing shared documents)
- **React Server Components (RSC)** — Financial dashboards render on the server, reducing client-side JavaScript bundle and keeping sensitive financial data processing server-side
- **Streaming SSR** — Board decks with multiple data widgets stream progressively as each API integration resolves
- **Route Groups** — Clean separation between `(portal)` (board member views), `(dashboard)` (founder views), and `(auth)` (login/signup)
- **Parallel Routes** — Meeting room view loads agenda, notes, and timer as parallel routes for independent loading
- **Server Actions** — Form submissions for resolutions, action items, and meeting notes use server actions for reduced client code

**Project structure:**
```
src/
  app/
    (auth)/
      login/
      signup/
      invite/[token]/          # Board member invitation flow
    (dashboard)/
      dashboard/               # Founder dashboard
      deck/
        [meetingId]/
          builder/             # AI deck builder
          preview/             # Deck preview
      meetings/
        [id]/
          room/                # Live meeting room
          minutes/             # AI-generated minutes
      resolutions/
      action-items/
      kpis/
      documents/
      investor-updates/
      settings/
        integrations/
        members/
        billing/
    (portal)/
      portal/                  # Board member portal
        meetings/
        documents/
        voting/
    api/
      deck/generate/           # AI deck generation
      meeting/transcribe/      # Whisper transcription
      integrations/
        stripe/
        quickbooks/
        hubspot/
        gusto/
      resolutions/vote/
      webhooks/
        stripe/
        quickbooks/
  components/
    ui/                        # Shared UI components (shadcn/ui)
    deck/                      # Deck builder components
    charts/                    # Financial chart components
    meeting/                   # Meeting room components
    portal/                    # Board portal components
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    ai/
      deck-generator.ts
      minutes-generator.ts
      transcription.ts
    integrations/
      stripe.ts
      quickbooks.ts
      hubspot.ts
      gusto.ts
    utils/
  types/
  hooks/
  stores/
```

### Key frontend libraries

| Library | Purpose | Version |
|---|---|---|
| **React 18** | UI framework | ^18.3 |
| **Next.js 14** | Full-stack React framework | ^14.2 |
| **TypeScript** | Type safety across the stack | ^5.4 |
| **Tailwind CSS** | Utility-first styling | ^3.4 |
| **shadcn/ui** | Accessible component primitives | latest |
| **Recharts** | Financial charts and KPI visualizations | ^2.12 |
| **@tanstack/react-table** | Board resolution tables, action item lists | ^8.15 |
| **@tiptap/react** | Rich text editor for meeting notes and minutes | ^2.3 |
| **react-pdf** | Board deck PDF generation and preview | ^7.7 |
| **@dnd-kit/core** | Drag-and-drop for deck slide reordering | ^6.1 |
| **date-fns** | Date formatting for meetings and deadlines | ^3.6 |
| **Zustand** | Client-side state management | ^4.5 |
| **nuqs** | URL search params state management | ^1.17 |
| **Framer Motion** | Micro-animations and transitions | ^11.0 |
| **react-hot-toast** | Toast notifications | ^2.4 |

---

## Backend

### Supabase

**Why Supabase:**
- **PostgreSQL** — Relational data model fits board governance perfectly (boards, meetings, resolutions, votes, action items have clear relationships)
- **Row Level Security (RLS)** — Critical for board governance; ensures board members only see documents for boards they belong to
- **Auth with RBAC** — Built-in authentication with custom roles (founder, board_member, board_observer, admin)
- **Storage** — Secure document storage for board decks, minutes, and supporting documents with per-bucket access policies
- **Realtime** — Live updates during board meetings (agenda progress, action items, voting results)
- **Edge Functions** — Serverless functions for webhook processing and background jobs

**Database schema (key tables):**

```sql
-- Organizations (companies using BoardBrief)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards (a company can have multiple boards)
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  board_type TEXT DEFAULT 'board_of_directors',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board Members
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('chair', 'director', 'observer', 'secretary')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  company TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  agenda JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board Decks
CREATE TABLE board_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  title TEXT NOT NULL,
  slides JSONB DEFAULT '[]',
  generated_by TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Minutes
CREATE TABLE meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  content TEXT,
  transcript TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resolutions
CREATE TABLE resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id),
  meeting_id UUID REFERENCES meetings(id),
  title TEXT NOT NULL,
  description TEXT,
  resolution_type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'draft',
  voting_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID REFERENCES resolutions(id),
  member_id UUID REFERENCES board_members(id),
  vote TEXT CHECK (vote IN ('for', 'against', 'abstain')),
  voted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Items
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  board_id UUID REFERENCES boards(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES board_members(id),
  due_date DATE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id),
  meeting_id UUID REFERENCES meetings(id),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT,
  version INTEGER DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  data_source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI History (for trend charts)
CREATE TABLE kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES kpis(id),
  value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration Connections
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL,
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  token_expires_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'connected',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security (RLS) policies:**

```sql
-- Board members can only see boards they belong to
CREATE POLICY "Board members see their boards"
  ON boards FOR SELECT
  USING (
    id IN (
      SELECT board_id FROM board_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Documents are visible only to board members of that board
CREATE POLICY "Board documents access"
  ON documents FOR SELECT
  USING (
    board_id IN (
      SELECT board_id FROM board_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Founders (org members) can manage their boards
CREATE POLICY "Org members manage boards"
  ON boards FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations
      WHERE id IN (
        SELECT organization_id FROM org_members
        WHERE user_id = auth.uid()
      )
    )
  );
```

### RBAC Role Hierarchy

```
Founder/Admin
  |-- Full access to all boards, meetings, documents
  |-- Manage integrations, billing, team
  |-- Generate and publish board decks
  |-- Create and manage resolutions

Board Chair
  |-- View and comment on all board materials
  |-- Approve minutes
  |-- Call meetings
  |-- Vote on resolutions

Board Director
  |-- View board materials for their boards
  |-- Vote on resolutions
  |-- Comment on documents
  |-- View action items assigned to them

Board Observer
  |-- View board materials (read-only)
  |-- No voting rights
  |-- Can comment on documents

Secretary
  |-- Manage meeting logistics
  |-- Edit minutes
  |-- Manage resolutions workflow
  |-- Document management
```

---

## AI / ML Layer

### OpenAI GPT-4o — Narrative Generation

**Use cases:**
1. **Board deck narrative sections** — Generates executive summaries, financial commentary, strategic updates from raw data
2. **Meeting minutes formatting** — Converts raw transcript into structured, professional board minutes
3. **Action item extraction** — Identifies commitments, deadlines, and assignments from meeting transcripts
4. **Investor update generation** — Drafts monthly/quarterly investor emails from the same data used for board decks
5. **KPI commentary** — Generates explanations for metric changes ("MRR increased 12% due to...")

**Implementation approach:**
```typescript
// lib/ai/deck-generator.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DeckGenerationInput {
  financialData: FinancialSummary;
  kpiData: KPISnapshot[];
  pipelineData: PipelineMetrics;
  headcountData: HeadcountSummary;
  previousDeck?: DeckSlide[];
  companyContext: string;
}

export async function generateBoardDeck(input: DeckGenerationInput): Promise<DeckSlide[]> {
  const systemPrompt = `You are a board deck generator for a venture-backed startup.
Generate professional, concise board deck content that:
- Leads with the most important metrics
- Provides context for changes (up/down and why)
- Uses executive-level language
- Includes specific numbers, not vague statements
- Highlights risks and asks for the board`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(input) }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content) as DeckSlide[];
}
```

### OpenAI Whisper — Meeting Transcription

**Use cases:**
- Real-time meeting transcription (via audio upload or recording)
- Post-meeting transcript processing for minutes generation
- Speaker identification for attribution in minutes

**Pricing:** $0.006 per minute of audio

**Implementation:**
```typescript
// lib/ai/transcription.ts
export async function transcribeMeeting(audioFile: File): Promise<TranscriptSegment[]> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  return response.segments.map(seg => ({
    start: seg.start,
    end: seg.end,
    text: seg.text,
    speaker: null, // Post-process with speaker diarization
  }));
}
```

---

## Integrations Layer

| Integration | Data Pulled | Auth Method | Sync Frequency |
|---|---|---|---|
| **Stripe** | Revenue, MRR, churn, customer count, subscription data | API Key | Real-time webhooks + hourly |
| **QuickBooks** | P&L, balance sheet, burn rate, runway, cash position | OAuth 2.0 | Daily |
| **HubSpot** | Pipeline value, deal count, win rate, sales velocity | OAuth 2.0 | Every 6 hours |
| **Salesforce** | Pipeline, bookings, forecast, customer metrics | OAuth 2.0 | Every 6 hours |
| **Gusto** | Headcount, departments, hiring pace, payroll expense | OAuth 2.0 | Daily |
| **Rippling** | Headcount, org chart, compensation data | API Key | Daily |
| **Google Calendar** | Meeting scheduling, availability | OAuth 2.0 | Real-time |
| **DocuSign** | Resolution signing, document execution | OAuth 2.0 | On-demand |
| **Carta** | Cap table summary, option pool, 409A | Partnership API | On-demand |

---

## Security Architecture

### Data Protection

| Layer | Implementation |
|---|---|
| **Encryption at rest** | AES-256 via Supabase (PostgreSQL TDE) |
| **Encryption in transit** | TLS 1.3 enforced across all connections |
| **Document encryption** | Client-side encryption for sensitive documents before storage |
| **Token storage** | Integration API tokens encrypted with Supabase Vault |
| **Password hashing** | bcrypt with cost factor 12 (via Supabase Auth) |

### Access Control

| Control | Implementation |
|---|---|
| **Authentication** | Supabase Auth with email/password + SSO (SAML 2.0 for Enterprise) |
| **Authorization** | Row Level Security (RLS) policies per table |
| **Session management** | JWT with 1-hour expiry, refresh tokens with 7-day expiry |
| **IP allowlisting** | Enterprise plan — restrict board portal access by IP |
| **MFA** | TOTP-based MFA available for all users, required for Enterprise |

### Compliance

| Standard | Status | Notes |
|---|---|---|
| **SOC 2 Type II** | Target by month 12 | Audit logging, access controls, encryption |
| **GDPR** | Compliant from launch | Data residency options, DPA, right to deletion |
| **CCPA** | Compliant from launch | Privacy notices, data access requests |
| **Delaware Corporate Law** | Built-in compliance | Resolution formats, voting requirements, consent actions |

### Audit Logging

Every action in BoardBrief is logged:
```typescript
interface AuditLogEntry {
  userId: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'download' | 'share' | 'vote' | 'sign';
  resourceType: 'deck' | 'document' | 'resolution' | 'meeting' | 'minutes' | 'action_item';
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
```

---

## Infrastructure

### Hosting and Deployment

| Service | Purpose | Configuration |
|---|---|---|
| **Vercel** | Frontend hosting + API routes | Pro plan, US-East region |
| **Supabase** | Database, auth, storage, realtime | Pro plan, US-East |
| **Cloudflare** | CDN, WAF, DDoS protection, edge caching | Pro plan |
| **Upstash Redis** | Rate limiting, session caching, job queues | Pay-as-you-go |
| **Resend** | Transactional email (invitations, notifications) | Pro plan |
| **Inngest** | Background jobs (data sync, deck generation) | Pro plan |

### CI/CD Pipeline

```
GitHub Push
    |
    v
GitHub Actions
    |
    +-- Lint (ESLint + Prettier)
    +-- Type Check (tsc --noEmit)
    +-- Unit Tests (Vitest)
    +-- E2E Tests (Playwright)
    +-- Security Scan (Snyk)
    |
    v
Vercel Preview Deploy (PR branches)
    |
    v
Vercel Production Deploy (main branch)
    |
    v
Post-deploy health checks
```

### Monitoring and Observability

| Tool | Purpose |
|---|---|
| **Vercel Analytics** | Web vitals, performance monitoring |
| **Sentry** | Error tracking and alerting |
| **PostHog** | Product analytics, feature flags, session replay |
| **Checkly** | Synthetic monitoring, API uptime checks |
| **PagerDuty** | Incident alerting and on-call management |
| **Supabase Dashboard** | Database performance, query analysis |

---

## Development Tools

| Tool | Purpose |
|---|---|
| **TypeScript 5.4** | Type safety across frontend and backend |
| **ESLint** | Code quality and consistency |
| **Prettier** | Code formatting |
| **Vitest** | Unit and integration testing |
| **Playwright** | End-to-end browser testing |
| **Storybook** | Component development and documentation |
| **Husky** | Git hooks for pre-commit checks |
| **lint-staged** | Run linters on staged files only |
| **Turborepo** | Monorepo build system (if multi-package) |

---

## Scalability Considerations

### Current Architecture (0 - 10,000 customers)
- Vercel serverless handles request scaling automatically
- Supabase Pro handles up to 100K monthly active users
- Document storage scales with Supabase Storage (S3-backed)
- Background jobs via Inngest handle async processing

### Growth Architecture (10,000 - 100,000 customers)
- Move heavy AI processing to dedicated GPU instances (Modal or Replicate)
- Add read replicas for PostgreSQL to handle reporting queries
- Implement CDN caching for published board decks (Cloudflare R2)
- Add dedicated queue system for integration data syncing (BullMQ + Redis)
- Implement connection pooling with PgBouncer for database connections

### Enterprise Architecture (100,000+ customers)
- Multi-region deployment for data residency (EU, APAC)
- Dedicated database instances for enterprise customers
- Custom SSO/SAML integration infrastructure
- On-premise deployment option for regulated industries
- Dedicated AI model fine-tuning for enterprise customers

### Performance Targets

| Metric | Target |
|---|---|
| **Time to First Byte (TTFB)** | < 200ms |
| **Largest Contentful Paint (LCP)** | < 1.5s |
| **Board deck generation** | < 30 seconds |
| **Meeting transcription** | < 2x real-time |
| **Document upload** | < 5 seconds for 50MB |
| **Search latency** | < 100ms |
| **API response time (p99)** | < 500ms |
| **Uptime SLA** | 99.9% (Enterprise: 99.95%) |
