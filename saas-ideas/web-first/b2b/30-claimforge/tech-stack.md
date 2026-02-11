# ClaimForge — Technical Architecture & Stack

## Architecture Overview

ClaimForge follows a secure, modular architecture designed for processing sensitive legal documents at scale. The system is built around three core pipelines: **Document Ingestion**, **Fraud Analysis**, and **Case Building**. Every component prioritizes security (attorney-client privilege), auditability (chain of custody for evidence), and scalability (cases can contain 100K+ documents).

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                              |
|  Next.js 14 (App Router, SSR)  |  Tailwind CSS  |  TypeScript   |
+------------------------------------------------------------------+
         |              |              |              |
    Case Portal    Doc Viewer    Graph Viz     Report Gen
         |              |              |              |
+------------------------------------------------------------------+
|                      API LAYER (Next.js Route Handlers)          |
|  /api/cases  |  /api/documents  |  /api/analysis  |  /api/export |
+------------------------------------------------------------------+
         |              |              |              |
+------------------------------------------------------------------+
|                    PROCESSING LAYER                              |
|  OCR Pipeline  |  AI Analysis  |  Fraud Detection  |  Statistics |
|  (Vision API)  |  (GPT-4o)    |  (Custom Models)  |  (Benford)  |
+------------------------------------------------------------------+
         |              |              |              |
+------------------------------------------------------------------+
|                      DATA LAYER (Supabase)                       |
|  PostgreSQL   |  Auth (RBAC)  |  Storage (S3)  |  Realtime      |
|  + pgvector   |  + RLS        |  + Encryption  |  + Webhooks    |
+------------------------------------------------------------------+
         |              |              |              |
+------------------------------------------------------------------+
|                   EXTERNAL DATA LAYER                            |
|  USASpending  |  CMS Open     |  FPDS API    |  OpenAI API      |
|  API          |  Payments     |              |                   |
+------------------------------------------------------------------+
```

---

## Frontend

### Framework: Next.js 14 (App Router)

| Decision            | Rationale                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| **Next.js 14**      | App Router for nested layouts (case > documents > analysis), SSR for security (no client-side data leaks), streaming for large document views |
| **App Router**      | Parallel routes for side-by-side document comparison, intercepting routes for modal document previews, loading states for heavy analysis operations |
| **SSR by Default**  | Sensitive case data rendered server-side. Client components only for interactive elements (document annotation, graph manipulation, timeline drag) |
| **TypeScript**      | Strict mode. Legal tech demands type safety — incorrect data types in financial analysis are unacceptable |
| **Tailwind CSS**    | Utility-first for rapid prototyping. Custom design tokens for the investigative theme. Dark mode default |

### Frontend Libraries

| Library              | Purpose                                    | Version  |
| -------------------- | ------------------------------------------ | -------- |
| `next`               | Framework (App Router, SSR, API routes)    | 14.x     |
| `react` / `react-dom`| UI rendering                               | 18.x     |
| `tailwindcss`        | Utility-first CSS                          | 3.x      |
| `@tanstack/react-query` | Server state management, caching        | 5.x      |
| `zustand`            | Client state (UI state, active filters)    | 4.x      |
| `d3`                 | Network graph visualization, statistical charts | 7.x  |
| `@visx/visx`         | React-friendly D3 wrappers for charts      | 3.x      |
| `lucide-react`       | Icon library                               | Latest   |
| `@radix-ui/react-*`  | Accessible primitives (dialogs, dropdowns, tooltips) | Latest |
| `react-pdf`          | PDF rendering in document viewer           | 7.x      |
| `cmdk`               | Command palette for power users            | Latest   |
| `react-dropzone`     | File upload with drag-and-drop             | 14.x     |
| `date-fns`           | Date formatting for timelines              | 3.x      |
| `recharts`           | Statistical charts (Benford's Law, trends) | 2.x      |
| `@xyflow/react`      | Interactive network graph (alternative to raw D3) | 12.x |
| `sonner`             | Toast notifications                        | 1.x      |
| `nuqs`               | URL state management for filters/search    | 1.x      |

### Frontend Architecture

```
src/
  app/
    (auth)/
      login/
      register/
      forgot-password/
    (dashboard)/
      layout.tsx              # Authenticated layout with sidebar
      page.tsx                # Dashboard overview
      cases/
        page.tsx              # Case list
        [caseId]/
          layout.tsx          # Case-level layout (tabs: documents, analysis, timeline, report)
          page.tsx            # Case summary
          documents/
            page.tsx          # Document list + upload
            [docId]/
              page.tsx        # Document viewer + annotation
          analysis/
            page.tsx          # Fraud pattern results
            network/
              page.tsx        # Entity network graph
            statistics/
              page.tsx        # Benford's Law, anomaly detection
          timeline/
            page.tsx          # Evidence timeline builder
          report/
            page.tsx          # Report generator + export
          team/
            page.tsx          # Case-level access controls
      settings/
        page.tsx              # Account settings
        billing/
          page.tsx            # Subscription management
    api/
      cases/                  # Case CRUD
      documents/              # Document upload, processing status
      analysis/               # Trigger analysis, get results
      export/                 # Generate reports, PDFs
      webhooks/               # Supabase webhooks, Stripe webhooks
  components/
    ui/                       # Shared UI primitives (Button, Card, Badge, etc.)
    case/                     # Case-specific components
    document/                 # Document viewer, annotation tools
    analysis/                 # Fraud pattern cards, confidence scores
    graph/                    # Network graph components
    timeline/                 # Timeline components
    charts/                   # Statistical chart components
  lib/
    supabase/                 # Supabase client, server, middleware
    ai/                       # OpenAI client, prompt templates
    fraud/                    # Fraud detection logic, pattern definitions
    ocr/                      # OCR pipeline orchestration
    statistics/               # Benford's Law, anomaly detection algorithms
    export/                   # PDF generation, report formatting
    utils/                    # Shared utilities
  types/                      # TypeScript type definitions
  hooks/                      # Custom React hooks
  stores/                     # Zustand stores
```

---

## Backend

### Primary: Supabase

| Component            | Usage                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| **PostgreSQL**       | All structured data: cases, documents (metadata), entities, relationships, analysis results, audit logs |
| **pgvector**         | Vector embeddings for document similarity search, semantic search across evidence |
| **Auth**             | Email/password, SSO (for enterprise firms). RBAC: Admin, Attorney, Analyst, Viewer |
| **Row-Level Security** | Every table has RLS policies. Users can only access cases they are assigned to. Attorney-client privilege enforced at the database level |
| **Storage**          | Evidence document storage (PDFs, images, spreadsheets). AES-256 encryption at rest. Per-case bucket isolation |
| **Realtime**         | Live updates when new documents are processed, analysis completes, team members annotate |
| **Edge Functions**   | Lightweight processing: document metadata extraction, webhook handlers |
| **Database Webhooks**| Trigger processing pipelines when documents are uploaded |

### Database Schema (Core Tables)

```sql
-- Organizations (law firms, compliance teams)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('law_firm', 'compliance_team', 'forensic_accounting', 'government')),
  subscription_tier TEXT CHECK (subscription_tier IN ('solo', 'firm', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  case_number TEXT,
  fraud_type TEXT CHECK (fraud_type IN ('healthcare', 'defense', 'procurement', 'pharmaceutical', 'other')),
  status TEXT CHECK (status IN ('intake', 'investigation', 'analysis', 'reporting', 'filed', 'settled', 'closed')),
  description TEXT,
  estimated_fraud_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  ocr_status TEXT CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_text TEXT,
  ai_summary TEXT,
  embedding VECTOR(1536),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted Entities
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  document_id UUID REFERENCES documents(id),
  entity_type TEXT CHECK (entity_type IN ('person', 'organization', 'amount', 'date', 'contract', 'invoice', 'payment', 'address')),
  entity_value TEXT NOT NULL,
  confidence FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity Relationships (for network graph)
CREATE TABLE entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  source_entity_id UUID REFERENCES entities(id),
  target_entity_id UUID REFERENCES entities(id),
  relationship_type TEXT CHECK (relationship_type IN ('payment', 'contract', 'employment', 'ownership', 'referral', 'subcontract')),
  amount NUMERIC,
  date TIMESTAMPTZ,
  document_id UUID REFERENCES documents(id),
  metadata JSONB
);

-- Fraud Patterns Detected
CREATE TABLE fraud_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  pattern_type TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  evidence_document_ids UUID[],
  evidence_entity_ids UUID[],
  statistical_support JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (chain of custody)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  event_date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  document_ids UUID[],
  entity_ids UUID[],
  fraud_pattern_ids UUID[],
  event_type TEXT CHECK (event_type IN ('transaction', 'communication', 'contract', 'filing', 'meeting', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security Example

```sql
-- Users can only access cases belonging to their organization
CREATE POLICY "Users can view own org cases" ON cases
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Case-level access control (per-case team assignment)
CREATE POLICY "Users can view assigned case documents" ON documents
  FOR SELECT
  USING (
    case_id IN (
      SELECT case_id FROM case_team_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## AI / ML Pipeline

### Document Analysis (OpenAI GPT-4o)

| Task                     | Model       | Input                          | Output                                  |
| ------------------------ | ----------- | ------------------------------ | ---------------------------------------- |
| Entity Extraction        | GPT-4o      | OCR text from document         | Structured entities (people, orgs, amounts, dates) |
| Document Classification  | GPT-4o      | Document text + metadata       | Type (invoice, contract, email, report)  |
| Relationship Mapping     | GPT-4o      | Entities across documents      | Entity relationship graph data           |
| Fraud Pattern Detection  | GPT-4o + Custom | Financial data + patterns  | Fraud indicators with confidence scores  |
| Summary Generation       | GPT-4o      | Full document text             | Concise case-relevant summary            |
| Complaint Drafting       | GPT-4o      | Evidence package + FCA template| FCA complaint draft with citations       |
| Deposition Questions     | GPT-4o      | Evidence + entity profiles     | Targeted questions for depositions       |

### Custom Fraud Detection Models

These models run in addition to GPT-4o analysis, providing statistical and rule-based fraud detection:

```
Fraud Detection Pipeline
========================

1. RULE-BASED DETECTION
   - Duplicate invoice detection (fuzzy matching on amounts, dates, vendors)
   - Round-number analysis (fraudulent invoices cluster at round numbers)
   - Weekend/holiday billing (services billed on non-business days)
   - Pricing anomalies (charges exceeding contracted rates)
   - Phantom vendor detection (vendors with no verifiable address/registration)

2. STATISTICAL DETECTION
   - Benford's Law analysis (first-digit distribution of financial figures)
   - Z-score anomaly detection (billing amounts vs. historical norms)
   - Clustering analysis (identify billing pattern groups, find outliers)
   - Time-series analysis (sudden changes in billing patterns)
   - Ratio analysis (cost-to-revenue ratios outside industry norms)

3. ML CLASSIFICATION
   - Binary classifier: fraudulent vs. legitimate transaction
   - Multi-class: fraud type classification (overbilling, kickback, phantom, etc.)
   - Trained on historical FCA case data (anonymized)
   - Confidence scoring with explainability (which features triggered detection)

4. NETWORK ANALYSIS
   - Entity resolution (merge duplicate entities across documents)
   - Relationship strength scoring (frequency, amount, duration of relationships)
   - Circular payment detection (A pays B pays C pays A)
   - Unusual relationship patterns (subcontractor paying prime contractor)
```

### OCR Pipeline

```
Document Upload
     |
     v
File Type Detection
     |
     +---> PDF (native text) ---> Extract text directly
     |
     +---> PDF (scanned/image) ---> Google Cloud Vision OCR ---> Text
     |
     +---> Image (JPG, PNG, TIFF) ---> Google Cloud Vision OCR ---> Text
     |
     +---> Spreadsheet (XLSX, CSV) ---> Parse with SheetJS ---> Structured data
     |
     +---> Email (EML, MSG) ---> Parse headers + body + attachments
     |
     v
Text Cleaning & Normalization
     |
     v
AI Analysis Pipeline (GPT-4o)
     |
     v
Entity Extraction & Storage
```

---

## Security Architecture

### Threat Model

ClaimForge handles attorney-client privileged information. A data breach could compromise active investigations, endanger whistleblowers, and violate legal ethics rules. Security is not optional — it is the foundation.

### Security Layers

| Layer                    | Implementation                                                     |
| ------------------------ | ------------------------------------------------------------------ |
| **Transport**            | TLS 1.3 everywhere. HSTS headers. Certificate pinning for API calls |
| **Authentication**       | Supabase Auth with MFA required for all accounts. SSO (SAML/OIDC) for enterprise |
| **Authorization**        | RBAC (Admin, Attorney, Analyst, Viewer). Per-case team assignment. RLS at database level |
| **Data at Rest**         | AES-256 encryption for all stored documents. Database encryption via Supabase |
| **Data in Transit**      | TLS 1.3 for all API calls. End-to-end encryption for document uploads |
| **Document Isolation**   | Per-case storage buckets. Cross-case access requires explicit permission |
| **Audit Logging**        | Every action logged: who, what, when, from where. Immutable audit trail |
| **Key Management**       | Per-organization encryption keys. Key rotation on schedule |
| **Session Management**   | Short-lived JWTs (15-minute access, 7-day refresh). Session invalidation on password change |
| **IP Restrictions**      | Enterprise: whitelist office IP ranges. Solo/Firm: optional |
| **Data Retention**       | Configurable per case. Auto-deletion after case closure + retention period |
| **Penetration Testing**  | Annual third-party pen test. Bug bounty program |

### Compliance Path

| Standard      | Status   | Timeline   | Notes                                          |
| ------------- | -------- | ---------- | ---------------------------------------------- |
| **SOC 2 Type I**  | Planned  | Month 8    | Trust Service Criteria: Security, Confidentiality |
| **SOC 2 Type II** | Planned  | Month 14   | 6-month observation period after Type I         |
| **CJIS**          | Planned  | Month 12   | Required for law enforcement data access        |
| **HIPAA**         | Planned  | Month 10   | Required for healthcare fraud cases (PHI)       |
| **FedRAMP**       | Future   | Year 2+    | Required for direct government agency use       |

### Zero-Knowledge Architecture (Where Possible)

- AI analysis results are stored; raw prompts/completions to OpenAI are not retained by OpenAI (zero-retention API agreement required)
- Document content is encrypted at rest with organization-specific keys
- Search indexes use encrypted embeddings
- Audit logs capture actions but not document content
- Admin access to customer data requires documented justification and customer notification

---

## Infrastructure

### Hosting & Deployment

| Component         | Service           | Rationale                                      |
| ----------------- | ----------------- | ---------------------------------------------- |
| **Frontend**      | Vercel            | Edge rendering, automatic scaling, preview deployments |
| **Backend**       | Supabase Cloud    | Managed PostgreSQL, Auth, Storage, Realtime     |
| **CDN**           | Cloudflare        | DDoS protection, WAF, edge caching for static assets |
| **AI Processing** | Vercel Functions  | Serverless for AI API calls (with 5-minute timeout for large documents) |
| **Background Jobs** | Inngest          | Document processing queues, batch analysis, scheduled jobs |
| **Monitoring**    | Sentry + Axiom    | Error tracking, performance monitoring, log aggregation |
| **Secrets**       | Vercel Environment Variables | API keys, database URLs, encryption keys |

### Scalability Considerations

| Scenario                      | Solution                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| Large document uploads (10K+) | Chunked upload to Supabase Storage, background OCR processing via queue |
| Concurrent AI analysis        | Rate-limited queue (Inngest) to manage OpenAI API limits      |
| Large network graphs          | WebGL rendering (via @xyflow/react) for 1K+ node graphs      |
| Full-text search              | PostgreSQL full-text search + pgvector for semantic search    |
| Multi-tenant isolation        | RLS + per-org storage buckets + separate encryption keys      |
| Case with 100K+ documents     | Paginated loading, virtual scrolling, background processing   |

---

## Development Tools

### Testing

| Tool          | Purpose                                           |
| ------------- | ------------------------------------------------- |
| **Vitest**    | Unit tests for fraud detection logic, utilities   |
| **Playwright**| E2E tests for critical flows (upload, analysis, export) |
| **MSW**       | Mock API handlers for AI responses during testing |
| **Supabase CLI** | Local development database, migration testing  |

### CI/CD

| Tool           | Purpose                                          |
| -------------- | ------------------------------------------------ |
| **GitHub Actions** | CI pipeline: lint, type-check, test, build   |
| **Vercel**     | Preview deployments on PR, production on merge   |
| **Supabase CLI** | Database migration management                  |
| **Changesets** | Version management for releases                  |

### Code Quality

| Tool           | Purpose                                          |
| -------------- | ------------------------------------------------ |
| **ESLint**     | Code linting (strict config)                     |
| **Prettier**   | Code formatting                                  |
| **TypeScript** | Strict mode, no `any` types allowed              |
| **Husky**      | Pre-commit hooks (lint, type-check)              |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_ORG_ID=

# Google Cloud Vision (OCR)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_CREDENTIALS=

# Government APIs
USASPENDING_API_KEY=
CMS_OPEN_PAYMENTS_API_KEY=

# Stripe (Billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Encryption
DOCUMENT_ENCRYPTION_KEY=
ENCRYPTION_KEY_SALT=

# Monitoring
SENTRY_DSN=
AXIOM_TOKEN=

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

## Performance Targets

| Metric                         | Target         | Measurement                          |
| ------------------------------ | -------------- | ------------------------------------ |
| Page load (dashboard)          | < 1.5s         | Lighthouse, Vercel Analytics         |
| Document upload (100MB)        | < 30s          | Chunked upload with progress bar     |
| OCR processing (per page)      | < 5s           | Background queue with status updates |
| AI entity extraction           | < 15s/document | Streaming response from GPT-4o      |
| Fraud pattern analysis         | < 60s/case     | Background job with progress         |
| Network graph render (500 nodes)| < 2s          | WebGL rendering, lazy loading        |
| Search results                 | < 500ms        | PostgreSQL FTS + pgvector            |
| Report generation (PDF)        | < 30s          | Server-side PDF generation           |

---

*Security is not a feature. It is the architecture.*
