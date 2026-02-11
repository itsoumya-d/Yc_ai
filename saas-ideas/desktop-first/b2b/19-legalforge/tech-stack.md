# LegalForge -- Technical Architecture

## Technology Stack Overview

LegalForge is a desktop-first application built on Electron with React, purpose-designed for in-house legal teams who work with sensitive contract documents. The architecture prioritizes document editing performance, AI integration, data security, and offline capability.

---

## Architecture Diagram

```
+---------------------------------------------------------------+
|                    Electron Desktop Shell                      |
|  +----------------------------------------------------------+ |
|  |                   React Frontend (UI)                     | |
|  |  +------------+  +-------------+  +-------------------+  | |
|  |  | TipTap     |  | Contract    |  | AI Sidebar        |  | |
|  |  | Editor     |  | Navigator   |  | (Suggestions,     |  | |
|  |  | (Rich Text |  | (Repository |  |  Risk Scores,     |  | |
|  |  |  + Track   |  |  Search,    |  |  Drafting Panel)   |  | |
|  |  |  Changes)  |  |  Filters)   |  |                   |  | |
|  |  +------------+  +-------------+  +-------------------+  | |
|  |  +------------+  +-------------+  +-------------------+  | |
|  |  | Comparison |  | Template    |  | Analytics         |  | |
|  |  | Diff View  |  | Manager     |  | Dashboard         |  | |
|  |  +------------+  +-------------+  +-------------------+  | |
|  +----------------------------------------------------------+ |
|                              |                                 |
|  +----------------------------------------------------------+ |
|  |              Local Data Layer (Electron)                  | |
|  |  +------------------+  +------------------------------+  | |
|  |  | SQLite (offline   |  | Local File System            |  | |
|  |  |  cache, drafts)   |  | (temp docs, exports, cache)  |  | |
|  |  +------------------+  +------------------------------+  | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
                              |
                     HTTPS / WebSocket
                              |
+---------------------------------------------------------------+
|                      Cloud Backend                             |
|  +------------------+  +------------------+  +--------------+ |
|  | Supabase         |  | Cloudflare R2    |  | OpenAI API   | |
|  | - PostgreSQL     |  | - Document       |  | - GPT-4o     | |
|  | - Auth (RBAC)    |  |   Storage        |  | - Embeddings | |
|  | - Realtime       |  | - Version        |  | - Fine-tuned | |
|  | - Edge Functions |  |   Archives       |  |   Models     | |
|  | - Full-Text      |  | - Export Files   |  |              | |
|  |   Search         |  |                  |  |              | |
|  +------------------+  +------------------+  +--------------+ |
|  +------------------+  +------------------+  +--------------+ |
|  | SendGrid         |  | DocuSign API     |  | Google       | |
|  | - Notifications  |  | - E-Signatures   |  | Calendar API | |
|  | - Deadline Alerts |  |                  |  | - Deadlines  | |
|  +------------------+  +------------------+  +--------------+ |
+---------------------------------------------------------------+
```

---

## Frontend

### Electron (Desktop Shell)

| Attribute       | Detail                                              |
| --------------- | --------------------------------------------------- |
| Framework       | Electron 30+                                        |
| Purpose         | Desktop shell, native OS integration, offline support|
| Process Model   | Main process + renderer process isolation            |

**Why Electron for Legal:**
- **Data sensitivity**: Legal teams handle privileged, confidential documents. A desktop app keeps documents local during review, reducing exposure compared to pure web apps
- **Offline review**: Lawyers frequently review contracts on flights, in courtrooms, and in locations without reliable internet. Electron enables full offline editing with sync-on-reconnect
- **Performance**: Document editing with real-time AI suggestions requires the responsiveness that native desktop provides. Web-based editors introduce latency that disrupts document workflows
- **OS integration**: Native file system access for DOCX import/export, print dialog integration, system notifications for deadlines and approvals

**Electron Configuration:**
- Context isolation enabled for security
- Node integration disabled in renderer (use preload scripts)
- Content Security Policy enforced
- Auto-updater via electron-updater (Cloudflare R2 for update hosting)
- Code signing for macOS (Apple Developer) and Windows (EV certificate)
- Custom protocol handler (`legalforge://`) for deep linking from email notifications

### React (UI Framework)

| Attribute       | Detail                                     |
| --------------- | ------------------------------------------ |
| Version         | React 18+                                  |
| State Management| Zustand (lightweight, performant)          |
| Routing         | React Router v6                            |
| Styling         | Tailwind CSS + custom design tokens        |
| Components      | Radix UI primitives (accessible, unstyled) |

**Key Libraries:**
- `zustand` -- Global state management for contract data, UI state, user preferences
- `@tanstack/react-query` -- Server state, caching, and synchronization with Supabase
- `react-router-dom` -- Client-side routing within the Electron renderer
- `@radix-ui/react-*` -- Accessible primitives for dialogs, dropdowns, tooltips, popovers
- `tailwindcss` -- Utility-first styling with custom design tokens from theme.md
- `framer-motion` -- Subtle animations for transitions, panel reveals, loading states
- `react-hook-form` + `zod` -- Form handling with schema validation for settings, templates
- `date-fns` -- Date manipulation for deadlines, obligation tracking, contract terms

### TipTap (Rich Text Editor)

| Attribute       | Detail                                              |
| --------------- | --------------------------------------------------- |
| Library         | TipTap v2 (ProseMirror-based)                       |
| Purpose         | Contract editing, redline tracking, annotations      |
| Extensions      | Track changes, comments, clause markers, AI suggest  |

**Why TipTap:**
- ProseMirror foundation provides the document model sophistication needed for legal documents (nested sections, numbered clauses, cross-references)
- Extensible architecture allows custom extensions for legal-specific features
- Collaborative editing support via Y.js for team contract review
- Rich formatting that maps cleanly to DOCX export

**Custom TipTap Extensions:**
1. **TrackChanges** -- Records insertions, deletions, and formatting changes with author attribution and timestamps. Visual rendering of redlines (red strikethrough for deletions, blue underline for insertions)
2. **ClauseMarker** -- Marks clause boundaries with section identifiers. Enables clause-level operations (replace clause, compare clause, risk-score clause)
3. **AIAnnotation** -- Inline and margin annotations generated by AI review. Risk level badges, suggestion popups, alternative clause recommendations
4. **CommentThread** -- Threaded comments anchored to text ranges. Team discussion on specific clauses during review
5. **DefinedTerms** -- Automatic detection and highlighting of defined terms. Click-to-navigate to term definition
6. **CrossReference** -- Links between sections (e.g., "as defined in Section 3.2"). Automatic renumbering when sections change

---

## Backend

### Supabase

| Attribute       | Detail                                        |
| --------------- | --------------------------------------------- |
| Database        | PostgreSQL 15 (managed)                       |
| Auth            | Supabase Auth with RBAC                       |
| Realtime        | Supabase Realtime for collaboration           |
| Functions       | Supabase Edge Functions (Deno)                |
| Storage         | Supabase Storage (metadata) + Cloudflare R2   |

**Database Schema (Core Tables):**

```
organizations
  - id, name, domain, plan, settings, created_at

users
  - id, org_id, email, name, role (admin/editor/reviewer/viewer), created_at

contracts
  - id, org_id, title, type, status (draft/review/negotiation/executed/expired)
  - counterparty, effective_date, expiration_date, value
  - risk_score, current_version_id, template_id
  - created_by, assigned_to, created_at, updated_at

contract_versions
  - id, contract_id, version_number, content_json (TipTap document)
  - document_url (R2), changes_summary, created_by, created_at

clauses
  - id, org_id, title, category, body, risk_level, is_approved
  - usage_count, last_used_at, created_by

templates
  - id, org_id, name, type, content_json, variables (JSONB)
  - usage_count, created_by

comments
  - id, contract_id, version_id, user_id, body
  - anchor_start, anchor_end, resolved, parent_id, created_at

obligations
  - id, contract_id, type (deadline/renewal/payment/deliverable)
  - description, due_date, status, assigned_to, reminder_sent

ai_reviews
  - id, contract_id, version_id, risk_score, findings (JSONB)
  - model_version, created_at

audit_logs
  - id, org_id, user_id, action, resource_type, resource_id
  - metadata (JSONB), ip_address, created_at
```

**Row Level Security (RLS):**
- All tables enforce organization-level isolation
- Users can only access contracts within their organization
- Role-based access: admins manage templates and users, editors create/modify contracts, reviewers annotate and approve, viewers read-only
- Audit logs are append-only (no delete/update policies)

### Cloudflare R2 (Document Storage)

| Attribute       | Detail                                     |
| --------------- | ------------------------------------------ |
| Purpose         | Contract document file storage             |
| Content         | DOCX files, PDF exports, version archives  |
| Pricing         | $0.015/GB/month, no egress fees            |

**Storage Structure:**
```
/{org_id}/contracts/{contract_id}/v{version}/document.docx
/{org_id}/contracts/{contract_id}/v{version}/document.pdf
/{org_id}/templates/{template_id}/template.docx
/{org_id}/exports/{export_id}/batch_export.zip
```

---

## AI/ML Layer

### OpenAI GPT-4o (Primary AI Engine)

| Use Case              | Model        | Context         |
| --------------------- | ------------ | --------------- |
| Contract Drafting     | GPT-4o       | 128K tokens     |
| Clause Review         | GPT-4o       | 128K tokens     |
| Risk Assessment       | GPT-4o       | 128K tokens     |
| NL Contract Queries   | GPT-4o-mini  | 128K tokens     |
| Embeddings            | text-embedding-3-large | 8K tokens |

**AI Pipeline for Contract Drafting:**
1. User provides natural language instructions ("Draft an NDA with Acme Corp, 2-year term, mutual, with carve-outs for publicly available information")
2. System retrieves the matching template from the organization's template library
3. System retrieves relevant approved clauses from the clause library
4. GPT-4o generates the draft using template structure + approved clauses + user instructions
5. Generated draft is parsed into TipTap document format
6. AI highlights any sections that deviated from approved templates for human review

**AI Pipeline for Risk Review:**
1. Contract document is segmented into individual clauses
2. Each clause is classified by type (indemnification, limitation of liability, IP, etc.)
3. Named Entity Recognition extracts parties, dates, dollar amounts, obligations
4. Each clause is scored for risk against the organization's playbook and market benchmarks
5. High-risk clauses receive detailed explanations and suggested alternatives
6. Overall contract risk score is computed as weighted aggregate

### Custom Fine-Tuned Models

| Model                  | Base        | Training Data                        |
| ---------------------- | ----------- | ------------------------------------ |
| Clause Classifier      | GPT-4o-mini | 50K labeled clauses by category      |
| Risk Scorer            | GPT-4o-mini | 20K clauses with risk annotations    |
| NER Legal              | spaCy/Custom| Legal entities (parties, dates, terms)|

### Embedding & Search

- Contract content is embedded using `text-embedding-3-large`
- Embeddings stored in Supabase `pgvector` extension
- Semantic search enables natural language queries across the entire contract repository
- Example: "Find all contracts with Acme that have indemnification caps over $1M"

---

## Document Processing

### DOCX Import/Export

| Library       | Purpose                              |
| ------------- | ------------------------------------ |
| mammoth.js    | DOCX to HTML conversion (import)     |
| docx          | Programmatic DOCX generation (export)|
| pdf-lib       | PDF generation for executed contracts|

**Import Pipeline:**
1. User drops a `.docx` file into LegalForge
2. `mammoth.js` converts DOCX to semantic HTML
3. Custom parser transforms HTML to TipTap JSON document format
4. Track changes from DOCX are preserved and mapped to TipTap TrackChanges extension
5. Styles and formatting are normalized to LegalForge's document styling
6. Original DOCX is archived in R2 for reference

**Export Pipeline:**
1. TipTap JSON document is converted to structured DOCX using the `docx` library
2. Track changes, comments, and formatting are preserved in DOCX format
3. PDF version is generated via `pdf-lib` with print-optimized layout
4. Both formats are uploaded to R2 and available for download

---

## Security

### Encryption

| Layer          | Method                                  |
| -------------- | --------------------------------------- |
| In Transit     | TLS 1.3 (all API communication)         |
| At Rest        | AES-256 (Supabase, R2 default)          |
| Application    | Client-side encryption for sensitive fields |
| Local Storage  | Electron safeStorage API for credentials |

### SOC 2 Compliance Path

- **Access Controls**: RBAC enforced at database level via Supabase RLS
- **Audit Logging**: Every action logged with user, timestamp, IP, and resource
- **Data Retention**: Configurable retention policies per organization
- **Encryption**: End-to-end for document content, AES-256 at rest
- **Incident Response**: Automated alerting for suspicious access patterns
- **Vendor Management**: Supabase (SOC 2 Type II), Cloudflare (SOC 2 Type II), OpenAI (SOC 2 Type II)

### RBAC Model

| Role     | Create | Edit  | Review | Approve | Delete | Admin |
| -------- | ------ | ----- | ------ | ------- | ------ | ----- |
| Admin    | Yes    | Yes   | Yes    | Yes     | Yes    | Yes   |
| Editor   | Yes    | Yes   | Yes    | No      | No     | No    |
| Reviewer | No     | No    | Yes    | Yes     | No     | No    |
| Viewer   | No     | No    | No     | No      | No     | No    |

---

## Infrastructure

### Deployment

| Component           | Host              | Purpose                      |
| ------------------- | ----------------- | ---------------------------- |
| Desktop App         | Electron (local)  | Primary UI                   |
| Edge Functions      | Supabase          | API logic, AI orchestration  |
| Database            | Supabase          | PostgreSQL + pgvector        |
| File Storage        | Cloudflare R2     | Document files               |
| App Updates         | Cloudflare R2     | Electron auto-update hosting |
| Landing/Marketing   | Vercel            | Marketing site, docs         |
| Email               | SendGrid          | Notifications, alerts        |

### Offline Architecture

```
Online Mode:
  Electron App <-> Supabase (primary data store)
                <-> Cloudflare R2 (documents)
                <-> OpenAI API (AI features)

Offline Mode:
  Electron App <-> Local SQLite (cached contracts, drafts)
                <-> Local File System (cached documents)
                <-> [AI features unavailable -- queued for sync]

Reconnection:
  Local changes sync to Supabase with conflict resolution
  Queued AI requests are processed
  Document versions are reconciled
```

### Scalability Considerations

| Scale Point       | Strategy                                          |
| ------------------ | ------------------------------------------------- |
| Users: 0-1K       | Single Supabase project, shared AI quota           |
| Users: 1K-10K     | Supabase Pro, dedicated AI inference, R2 CDN       |
| Users: 10K-50K    | Supabase Enterprise, multiple regions, model caching|
| Users: 50K+       | Self-hosted PostgreSQL, custom AI infrastructure   |

---

## Development Tools

### Core Tooling

| Tool          | Purpose                                    |
| ------------- | ------------------------------------------ |
| TypeScript    | Type safety across frontend and backend    |
| Vitest        | Unit and integration testing               |
| Playwright    | E2E testing (Electron app)                 |
| ESLint        | Code linting with legal-specific rules     |
| Prettier      | Code formatting                            |
| Husky         | Git hooks for pre-commit checks            |
| Turborepo     | Monorepo management                        |

### Monorepo Structure

```
legalforge/
  apps/
    desktop/          # Electron + React app
    web/              # Marketing site (Vercel)
  packages/
    ui/               # Shared UI components
    editor/           # TipTap editor + extensions
    ai/               # AI pipeline and prompts
    contracts/        # Contract parsing, diff, models
    shared/           # Types, utilities, constants
  supabase/
    migrations/       # Database migrations
    functions/        # Edge Functions
    seed/             # Development seed data
```

### Testing Strategy

| Test Type       | Tool       | Coverage Target | Scope                          |
| --------------- | ---------- | --------------- | ------------------------------ |
| Unit            | Vitest     | 85%+            | AI prompts, parsers, utilities |
| Integration     | Vitest     | 70%+            | API routes, database queries   |
| E2E             | Playwright | Key flows       | Contract creation to export    |
| Visual          | Playwright | Key screens     | Editor, diff view, dashboard   |

### CI/CD Pipeline

1. **Push to branch**: Lint, type check, unit tests
2. **Pull request**: Integration tests, visual regression
3. **Merge to main**: E2E tests, build Electron app
4. **Release tag**: Code sign, notarize (macOS), build installers, upload to R2, trigger auto-update

---

## Why Desktop-First for Legal

1. **Confidentiality**: Attorney-client privilege and confidential business information require that documents can be reviewed without constant cloud transmission
2. **Offline Access**: Lawyers review contracts in courtrooms, on planes, and in meetings -- offline access is not optional
3. **Performance**: Legal documents can be 100+ pages. Native performance ensures smooth editing, search, and AI suggestion rendering
4. **Data Sovereignty**: Enterprise legal teams often have strict data residency requirements. Desktop-first with selective cloud sync gives IT teams control
5. **Integration**: Native file system access enables seamless DOCX import/export workflows that lawyers already use
6. **Trust**: Legal teams are conservative adopters. A desktop application signals permanence, security, and seriousness in a way that web apps do not

---

## Performance Targets

| Metric                        | Target           |
| ----------------------------- | ---------------- |
| App cold start                | < 3 seconds      |
| Document open (50 pages)      | < 1 second       |
| AI draft generation           | < 15 seconds     |
| AI risk review (full contract)| < 30 seconds     |
| Search results                | < 500ms          |
| DOCX import (100 pages)       | < 5 seconds      |
| DOCX export                   | < 3 seconds      |
| Offline sync (reconnect)      | < 10 seconds     |
