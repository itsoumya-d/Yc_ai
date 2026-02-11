# Cortex -- Tech Stack

## Architecture Philosophy

Cortex follows a **local-first, desktop-native** architecture. The core principle: **data never leaves the user's machine**. Only natural language questions and schema metadata are sent to the AI layer. Query execution, data processing, and visualization all happen locally or against the user's own database connections.

This architecture solves the #1 enterprise objection ("Where does my data go?") at the infrastructure level, not the policy level.

---

## Architecture Diagram

```
+-------------------------------------------------------------------+
|                        ELECTRON DESKTOP APP                        |
|                                                                    |
|  +---------------------+    +----------------------------------+  |
|  |    RENDERER PROCESS  |    |         MAIN PROCESS             |  |
|  |    (React + UI)      |    |                                  |  |
|  |                      |    |  +----------------------------+  |  |
|  |  +----------------+  |    |  |    DATABASE CONNECTORS     |  |  |
|  |  | Query Input    |  |    |  |                            |  |  |
|  |  | (NL Bar)       |  |    |  |  pg (PostgreSQL)           |  |  |
|  |  +----------------+  |    |  |  mysql2 (MySQL)            |  |  |
|  |  +----------------+  |    |  |  @google-cloud/bigquery    |  |  |
|  |  | SQL Preview    |  |    |  |  snowflake-sdk             |  |  |
|  |  | Panel          |  |    |  |  xlsx (Excel parser)       |  |  |
|  |  +----------------+  |    |  |  csv-parse (CSV parser)    |  |  |
|  |  +----------------+  |    |  +----------------------------+  |  |
|  |  | Results Table  |  |    |                                  |  |
|  |  | (TanStack)     |  |    |  +----------------------------+  |  |
|  |  +----------------+  |    |  |    DuckDB (Local Engine)   |  |  |
|  |  +----------------+  |    |  |                            |  |  |
|  |  | Visualization  |  |    |  |  - Imported CSV/Excel      |  |  |
|  |  | (D3/Recharts)  |  |    |  |  - Cached query results    |  |  |
|  |  +----------------+  |    |  |  - Analytical processing   |  |  |
|  |  +----------------+  |    |  +----------------------------+  |  |
|  |  | Dashboard Grid |  |    |                                  |  |
|  |  | (react-grid)   |  |    |  +----------------------------+  |  |
|  |  +----------------+  |    |  |    FILE SYSTEM              |  |  |
|  |                      |    |  |                            |  |  |
|  +---------------------+    |  |  - User preferences         |  |  |
|                              |  |  - Connection configs       |  |  |
|                              |  |  - Cached schemas           |  |  |
|                              |  |  - Export files             |  |  |
|                              |  +----------------------------+  |  |
|                              +----------------------------------+  |
+-------------------------------------------------------------------+
           |                              |
           | NL Query + Schema            | Auth + Metadata
           | (HTTPS, encrypted)           | (HTTPS)
           v                              v
+--------------------+        +------------------------+
|    OPENAI API      |        |      SUPABASE          |
|                    |        |                        |
|  GPT-4o            |        |  - Auth (email, SSO)   |
|  - NL to SQL       |        |  - Saved queries       |
|  - Chart type      |        |  - Dashboard configs   |
|  - Insight gen     |        |  - Team management     |
|  - Anomaly detect  |        |  - Subscription state  |
+--------------------+        |  - Usage tracking      |
                              +------------------------+
                                         |
                                         v
                              +------------------------+
                              |      SENDGRID          |
                              |                        |
                              |  - Scheduled reports   |
                              |  - Alert notifications |
                              +------------------------+
```

---

## Frontend

### Electron (Desktop Shell)

| Detail | Value |
|--------|-------|
| **Package** | `electron` (latest stable, v33+) |
| **Purpose** | Desktop application shell. Provides native OS integration, file system access, direct database connectivity, and large dataset handling without browser limitations. |
| **Why Electron** | Cross-platform (macOS, Windows, Linux). Mature ecosystem. Direct access to Node.js database drivers. No browser memory limits. Handles multi-GB files. |
| **Alternative Considered** | Tauri (smaller binary, Rust-based). Rejected because Node.js database driver ecosystem is critical -- pg, mysql2, snowflake-sdk all require Node.js. Tauri's Rust backend would require rewriting all connectors. |
| **Build Tool** | Electron Forge (official build toolchain) |
| **Auto-Update** | `electron-updater` for seamless background updates |
| **IPC** | `contextBridge` + `ipcRenderer`/`ipcMain` for secure renderer-to-main communication |

### React (UI Framework)

| Detail | Value |
|--------|-------|
| **Package** | `react` + `react-dom` (v19+) |
| **Purpose** | Component-based UI. Handles the query workspace, dashboards, schema explorer, settings, and all interactive elements. |
| **Bundler** | Vite (fast HMR, optimized builds for Electron renderer process) |
| **State Management** | Zustand (lightweight, minimal boilerplate, perfect for desktop app state) |
| **Routing** | React Router v7 (screen navigation within the desktop app) |
| **Forms** | React Hook Form + Zod (connection setup, settings, report configuration) |

### Visualization Libraries

| Library | Purpose | Why |
|---------|---------|-----|
| **D3.js** | Custom, complex visualizations (scatter plots with trend lines, geographic maps, Sankey diagrams) | Maximum flexibility for advanced chart types. Industry standard. |
| **Recharts** | Standard charts (bar, line, pie, area) | Built on D3 but provides React components. Faster development for common chart types. Responsive. |
| **TanStack Table** | Data tables with sorting, filtering, pagination, virtual scrolling | Handles 100K+ rows with virtualization. Headless -- full styling control. |
| **react-grid-layout** | Dashboard grid system | Drag-and-drop dashboard builder. Resize, reorder, responsive breakpoints. |

### Additional Frontend Packages

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management for Supabase calls and API requests |
| `cmdk` | Command palette (Cmd+K for quick actions, query search) |
| `sonner` | Toast notifications (query complete, export done, errors) |
| `framer-motion` | Subtle animations (chart transitions, panel reveals) |
| `react-syntax-highlighter` | SQL syntax highlighting in the preview panel |
| `date-fns` | Date formatting and manipulation for time-based queries |
| `lodash` | Utility functions for data transformation |

---

## Backend (Supabase)

Supabase handles everything that needs to persist across devices or involve multi-user collaboration. Cortex does **not** send query data or results to Supabase -- only metadata.

### Supabase Services Used

| Service | Purpose | Details |
|---------|---------|---------|
| **Auth** | User authentication | Email/password, Google SSO, SAML (enterprise). JWT-based session management. |
| **PostgreSQL** | Metadata storage | Saved queries, dashboard configs, team memberships, connection metadata (encrypted), subscription state, usage logs. |
| **Row Level Security** | Multi-tenant data isolation | Every table has RLS policies ensuring users only see their own data. Team data scoped to organization. |
| **Edge Functions** | Serverless API | Stripe webhook handler, SendGrid email triggers, usage metering, license validation. |
| **Realtime** | Live collaboration | Real-time dashboard updates when team members modify shared dashboards. Presence indicators. |
| **Storage** | File storage | Exported reports (PDF/PNG) for scheduled email delivery. Temporary storage, auto-deleted after send. |

### Database Schema (Supabase PostgreSQL)

```sql
-- Core tables
users                  -- id, email, name, avatar, created_at
organizations          -- id, name, slug, plan, stripe_customer_id
org_memberships        -- user_id, org_id, role (admin/member/viewer)

-- Connection metadata (credentials encrypted, stored locally on desktop)
connections            -- id, org_id, name, type (pg/mysql/bigquery/snowflake/csv),
                       -- schema_cache (JSON), last_synced_at

-- Query history and saved queries
queries                -- id, org_id, user_id, connection_id, nl_input,
                       -- generated_sql, chart_type, chart_config (JSON),
                       -- is_bookmarked, tags, created_at

-- Dashboards
dashboards             -- id, org_id, name, description, is_shared, layout (JSON)
dashboard_tiles        -- id, dashboard_id, query_id, position (JSON), size (JSON)

-- Scheduled reports
scheduled_reports      -- id, org_id, dashboard_id, cron_expression,
                       -- recipients (JSON), format (pdf/csv), is_active

-- Alerts
alerts                 -- id, org_id, query_id, condition (JSON),
                       -- threshold, recipients, last_triggered_at

-- Usage tracking
usage_events           -- id, org_id, user_id, event_type, metadata (JSON), created_at
```

---

## AI / ML Layer

### OpenAI GPT-4o

| Detail | Value |
|--------|-------|
| **Model** | `gpt-4o` (primary), `gpt-4o-mini` (fallback for simple queries) |
| **Purpose** | Natural language to SQL translation, chart type recommendation, data insight generation, anomaly explanation |
| **Integration** | OpenAI API via `openai` Node.js SDK |
| **Data Sent to OpenAI** | Natural language question + database schema (table names, column names, column types, sample values). **Never** raw data, query results, or actual row-level data. |
| **Context Window** | Schema context + conversation history (last 5 queries for follow-up context) |
| **Temperature** | 0.1 for SQL generation (deterministic), 0.5 for insight generation (creative) |

### AI Pipeline

```
User types: "What was revenue by region last quarter vs last year?"
    |
    v
1. SCHEMA CONTEXT BUILDER
   - Load cached schema for connected database
   - Include table names, column names, types, relationships (foreign keys)
   - Include sample values for categorical columns (e.g., region names)
   - Include common metrics/definitions if user has defined them
    |
    v
2. NL-TO-SQL PROMPT
   - System prompt: "You are a SQL expert. Generate a single SQL query..."
   - Include: database dialect (PostgreSQL/MySQL/BigQuery/Snowflake)
   - Include: schema context
   - Include: user question
   - Include: last 3 queries for conversational context ("same but for Q2")
    |
    v
3. SQL VALIDATION
   - Parse generated SQL with a SQL parser (node-sql-parser)
   - Validate table/column names against schema
   - Check for dangerous operations (DROP, DELETE, UPDATE, INSERT)
   - Block any non-SELECT queries
   - Estimate query complexity (warn if full table scan on large tables)
    |
    v
4. CHART RECOMMENDATION
   - Second API call (or combined prompt): "Given this SQL and result schema,
     what visualization best represents this data?"
   - Returns: chart_type, x_axis, y_axis, group_by, color_mapping
    |
    v
5. INSIGHT GENERATION (optional, post-query)
   - "Given these results, what are the key takeaways?"
   - Returns: 2-3 bullet point insights
   - Example: "Revenue grew 23% YoY in West region but declined 8% in Northeast"
```

### Prompt Engineering Strategy

| Strategy | Detail |
|----------|--------|
| **Few-shot examples** | Include 5-8 example NL-to-SQL pairs in the system prompt, tailored to the connected database dialect |
| **Schema-aware** | Full schema context with types, relationships, and sample values |
| **Dialect-specific** | Separate prompt templates for PostgreSQL, MySQL, BigQuery, Snowflake (syntax differences) |
| **Conversational** | Support follow-up queries: "Same thing but for this quarter" uses context from the previous query |
| **Error recovery** | If a query fails, send the error message back to GPT-4o: "This query returned error X. Fix the SQL." |
| **Cost optimization** | Use `gpt-4o-mini` for simple queries (single table, no joins). Route to `gpt-4o` for complex queries (joins, subqueries, window functions). |

---

## Data Layer

### DuckDB (Local Analytical Engine)

| Detail | Value |
|--------|-------|
| **Package** | `duckdb` (Node.js bindings) or `@duckdb/duckdb-wasm` |
| **Purpose** | Embedded analytical database for fast local queries. Handles imported CSV/Excel files and cached query results. |
| **Why DuckDB** | Column-oriented, vectorized execution. Processes millions of rows in milliseconds on a laptop. No server required. Free and open source. |
| **Use Cases** | (1) Query imported CSV/Excel files with SQL. (2) Cache results from remote databases for fast re-querying. (3) Join data across multiple sources locally. (4) Run analytical functions (window functions, aggregations) without hitting remote database. |
| **File Format** | Parquet for persistent storage (compressed, columnar, fast reads) |
| **Memory** | Configurable memory limit (default: 50% of available RAM) |

### Database Connectors

| Database | Package | Auth Method | Notes |
|----------|---------|-------------|-------|
| **PostgreSQL** | `pg` (node-postgres) | Connection string, SSL certificates | Most common. Supports all PostgreSQL versions 10+. |
| **MySQL** | `mysql2` | Connection string, SSL | Supports MySQL 5.7+ and MariaDB 10.2+ |
| **BigQuery** | `@google-cloud/bigquery` | Service account JSON key file | User uploads key file. Stored locally, encrypted. |
| **Snowflake** | `snowflake-sdk` | Key-pair authentication | RSA key pair. Private key stored locally, encrypted. |
| **CSV** | `csv-parse` (Node.js stream parser) | N/A (local file) | Streaming parser handles files up to 10GB. Auto-detect delimiter. |
| **Excel** | `xlsx` (SheetJS) | N/A (local file) | Supports .xlsx, .xls, .xlsb. Multi-sheet support. |

### Data Flow

```
REMOTE DATABASES                    LOCAL PROCESSING
+------------------+               +------------------+
| PostgreSQL       |---SQL query--->| Results in       |
| MySQL            |   via driver   | memory (JS)      |
| BigQuery         |               |        |          |
| Snowflake        |               |        v          |
+------------------+               | DuckDB cache     |
                                   | (optional)        |
LOCAL FILES                        |        |          |
+------------------+               |        v          |
| CSV files        |---import----->| DuckDB tables    |
| Excel files      |   to DuckDB   | (Parquet on disk)|
+------------------+               |        |          |
                                   |        v          |
                                   | React renderer   |
                                   | (D3/Recharts)    |
                                   +------------------+
```

---

## Infrastructure

### Local-First Processing

| Principle | Implementation |
|-----------|----------------|
| **Data stays local** | All query results processed in Electron main process. Never sent to Cortex servers. |
| **Credentials stored locally** | Database connection strings encrypted with `electron-safeStorage` (OS keychain integration). |
| **Schema caching** | Database schemas cached locally in SQLite. Synced to Supabase as metadata (table/column names only, no data). |
| **Offline mode** | CSV/Excel queries work fully offline via DuckDB. AI features require internet. |

### Cloud Services (Minimal)

| Service | Provider | Purpose | Data Exposure |
|---------|----------|---------|---------------|
| **Auth + Metadata** | Supabase | User accounts, saved query metadata, dashboard configs | No query data. No results. |
| **AI** | OpenAI | NL-to-SQL translation | Schema metadata only. No row-level data. |
| **Email** | SendGrid | Scheduled report delivery | Report PDFs (generated locally, uploaded temporarily) |
| **Payments** | Stripe | Subscription management | Standard payment flow |
| **Updates** | GitHub Releases / Electron Updater | App distribution and auto-updates | None |

### Security Architecture

```
+-------------------------------------------------------------------+
|                    SECURITY BOUNDARIES                              |
|                                                                    |
|  LOCAL (Trusted)                    REMOTE (Minimal Trust)         |
|  +---------------------------+     +---------------------------+  |
|  | Database credentials      |     | Supabase                  |  |
|  |   (OS Keychain encrypted) |     |   User auth tokens        |  |
|  | Query results             |     |   Saved query metadata    |  |
|  |   (in-memory only)        |     |   Dashboard layouts       |  |
|  | Imported data files       |     |   NO data, NO results     |  |
|  |   (DuckDB / Parquet)      |     +---------------------------+  |
|  | Export files              |     +---------------------------+  |
|  |   (user's file system)    |     | OpenAI                    |  |
|  +---------------------------+     |   NL question text        |  |
|                                    |   Schema metadata         |  |
|                                    |   NO row-level data       |  |
|                                    +---------------------------+  |
+-------------------------------------------------------------------+
```

### Security Measures

| Measure | Detail |
|---------|--------|
| **Credential Encryption** | `electron-safeStorage` wraps OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) |
| **SQL Injection Prevention** | Generated SQL parsed and validated before execution. Only SELECT statements allowed. Parameterized queries for any user-provided values. |
| **Content Security Policy** | Strict CSP in Electron renderer. No remote code execution. No eval(). |
| **IPC Security** | `contextBridge` with explicit API exposure. No `nodeIntegration` in renderer. |
| **Network Security** | All external API calls over HTTPS/TLS 1.3. Certificate pinning for Supabase and OpenAI endpoints. |
| **Audit Logging** | Enterprise tier: all queries logged with user, timestamp, and SQL (stored locally or to customer's SIEM). |
| **SOC 2 Path** | Architecture designed for SOC 2 Type II compliance. Data-local model simplifies audit scope. |

---

## Development Tools

### Core Dev Stack

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety across the entire codebase. Strict mode enabled. |
| **ESLint** | Code quality. Airbnb config + custom rules for Electron security patterns. |
| **Prettier** | Code formatting. Consistent style across the team. |
| **Husky + lint-staged** | Pre-commit hooks. Lint and format on every commit. |

### Testing

| Tool | Purpose | Scope |
|------|---------|-------|
| **Vitest** | Unit and integration tests | SQL generation, data transformation, schema parsing, chart recommendation logic |
| **Playwright** | End-to-end tests | Full user flows in Electron: connect database, run query, verify chart, export |
| **Testing Library** | React component tests | UI component behavior, form validation, state management |
| **MSW (Mock Service Worker)** | API mocking | Mock OpenAI responses, Supabase calls during tests |

### CI/CD

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI pipeline: lint, test, build, package |
| **Electron Forge** | Package and distribute: `.dmg` (macOS), `.exe` (Windows), `.AppImage` (Linux) |
| **Code Signing** | Apple Developer Certificate (macOS), Windows Authenticode (Windows) |
| **Auto-Update** | `electron-updater` checks GitHub Releases for new versions |
| **Sentry** | Error tracking and crash reporting (opt-in, no data sent) |

---

## Scalability Considerations

### Data Volume Handling

| Scale | Strategy |
|-------|----------|
| **< 100K rows** | In-memory processing in renderer. Fast chart rendering. |
| **100K - 1M rows** | DuckDB for aggregation. Virtual scrolling for tables. Sampled data for scatter plots. |
| **1M - 100M rows** | DuckDB with Parquet files on disk. Streaming aggregation. Pre-aggregated chart data. |
| **> 100M rows** | Push-down queries to remote database (PostgreSQL/BigQuery/Snowflake). Only fetch aggregated results. |

### Performance Targets

| Metric | Target |
|--------|--------|
| App cold start | < 3 seconds |
| NL-to-SQL generation | < 2 seconds (API latency) |
| Query execution (local DuckDB, 1M rows) | < 500ms |
| Chart render (10K data points) | < 200ms |
| Dashboard load (10 tiles) | < 1 second |
| Memory usage (idle) | < 200MB |
| Memory usage (active, 1M row dataset) | < 1GB |

### Future Architecture Considerations

| Consideration | Detail |
|---------------|--------|
| **Self-hosted option** | Enterprise customers may want to run the Supabase backend on their own infrastructure. Architecture supports this via environment variable configuration. |
| **Plugin system** | Year 2+ feature. Allow custom connectors and visualization types via a plugin API. |
| **Multi-model AI** | Abstract AI layer to support Claude, Gemini, or self-hosted models (Llama) for customers who cannot use OpenAI. |
| **Collaboration server** | If real-time collaboration demand grows, consider a dedicated WebSocket server instead of Supabase Realtime. |

---

## Package Summary

### Production Dependencies

```json
{
  "electron": "^33.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.0.0",
  "zustand": "^5.0.0",
  "d3": "^7.0.0",
  "recharts": "^2.12.0",
  "@tanstack/react-table": "^8.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-grid-layout": "^1.4.0",
  "duckdb": "^1.1.0",
  "pg": "^8.13.0",
  "mysql2": "^3.11.0",
  "@google-cloud/bigquery": "^7.9.0",
  "snowflake-sdk": "^1.14.0",
  "xlsx": "^0.18.0",
  "csv-parse": "^5.5.0",
  "openai": "^4.70.0",
  "@supabase/supabase-js": "^2.46.0",
  "@sendgrid/mail": "^8.1.0",
  "cmdk": "^1.0.0",
  "sonner": "^1.7.0",
  "framer-motion": "^11.11.0",
  "react-syntax-highlighter": "^15.6.0",
  "date-fns": "^4.1.0",
  "zod": "^3.23.0",
  "react-hook-form": "^7.53.0",
  "lucide-react": "^0.460.0",
  "node-sql-parser": "^5.3.0"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.6.0",
  "vite": "^6.0.0",
  "@electron-forge/cli": "^7.0.0",
  "vitest": "^2.1.0",
  "@playwright/test": "^1.49.0",
  "@testing-library/react": "^16.0.0",
  "msw": "^2.6.0",
  "eslint": "^9.0.0",
  "prettier": "^3.4.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0"
}
```

---

*Architecture designed for the principle: your data, your machine, your answers.*
