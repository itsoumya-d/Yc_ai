# Cortex -- Skills Required

## Skills Overview

Building Cortex requires a rare intersection of technical depth, domain knowledge, design sensibility, and business acumen. The product sits at the crossroads of database engineering, AI/ML, data visualization, and enterprise B2B -- each demanding specialized expertise.

This document maps the skills needed to build, launch, and grow Cortex from MVP through Year 2+.

---

## Technical Skills

### T1: Electron Desktop Development

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Electron Architecture** | Advanced | Main process vs renderer process separation. IPC communication patterns. Security model (contextBridge, nodeIntegration disabled). |
| **Electron Forge** | Intermediate | Build toolchain for packaging, code signing, and distributing macOS (.dmg), Windows (.exe), Linux (.AppImage) builds. |
| **Auto-Update** | Intermediate | `electron-updater` for seamless background updates from GitHub Releases. Delta updates for faster patching. |
| **OS Integration** | Intermediate | Native menus, dock/taskbar integration, file dialogs, drag-and-drop, OS notifications. |
| **electron-safeStorage** | Intermediate | Encrypting database credentials using the OS keychain (macOS Keychain, Windows Credential Manager). |
| **Performance** | Advanced | Memory management in Electron (avoiding leaks with large datasets). Offloading heavy computation to worker threads. Renderer process optimization. |
| **Security Hardening** | Advanced | Content Security Policy, sandboxing, preventing remote code execution, secure IPC patterns. Electron security checklist compliance. |

**Learning Resources**:
- Electron official documentation (electronjs.org/docs)
- "Electron in Action" by Steve Kinney (Manning)
- Electron Fiddle for prototyping IPC patterns
- electron-vite starter templates for React + Vite + Electron setups

---

### T2: React & Frontend

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **React 19** | Advanced | Component architecture, hooks, Suspense, concurrent features. Large component tree with data tables, charts, and dashboards. |
| **TypeScript** | Advanced | Strict mode. Complex types for database schemas, query results, chart configurations. Generic types for the connector abstraction layer. |
| **Zustand** | Intermediate | Global state for active connection, query history, user preferences, dashboard layout. Middleware for persistence. |
| **React Router v7** | Intermediate | Client-side routing within Electron. Nested routes for settings sub-pages. Route guards for auth. |
| **React Hook Form + Zod** | Intermediate | Connection wizard forms, report builder, alert configuration. Runtime validation of user input. |
| **TanStack Table** | Advanced | Complex data tables with sorting, filtering, pagination, column resizing, virtual scrolling for 100K+ rows. Custom cell renderers for data types. |
| **TanStack Query** | Intermediate | Server state management for Supabase API calls. Cache invalidation, optimistic updates. |
| **cmdk** | Basic | Command palette implementation. Search indexing for queries, dashboards, tables. |
| **CSS-in-JS / Tailwind** | Advanced | Responsive layouts, theme system (dark/light), data-dense UI patterns, chart container sizing. |

**Learning Resources**:
- React documentation (react.dev)
- TanStack Table documentation and examples
- Zustand GitHub repository (examples directory)
- Kent C. Dodds' Epic React course

---

### T3: D3.js & Data Visualization

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **D3.js Core** | Advanced | Scales, axes, shapes, transitions, layouts. Required for custom visualizations (scatter with regression lines, Sankey diagrams, geographic maps). |
| **Recharts** | Intermediate | React wrapper over D3 for standard charts (bar, line, pie, area). Component API, responsive containers, custom tooltips. |
| **SVG** | Intermediate | SVG elements, viewBox, coordinate systems, gradients, masks. All D3 charts render to SVG. |
| **Canvas API** | Basic | Fallback for very large datasets (10K+ points) where SVG performance degrades. |
| **Chart Design** | Advanced | Choosing the right chart type for the data shape. Color palettes for accessibility. Axis labeling, legend placement, annotation. |
| **Responsive Charts** | Intermediate | Charts that resize to fill container. Responsive breakpoints for different tile sizes in dashboards. |
| **Export** | Intermediate | SVG-to-PNG conversion for chart export. PDF generation with embedded charts (using libraries like `jspdf` or `puppeteer` in main process). |

**Learning Resources**:
- "D3.js in Action" by Elijah Meeks (Manning)
- Observable HQ notebooks (observablehq.com) for D3 patterns
- Recharts documentation and Storybook examples
- "The Visual Display of Quantitative Information" by Edward Tufte

---

### T4: SQL (Advanced)

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **SQL Fundamentals** | Expert | SELECT, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET. Cortex must validate and understand all generated SQL. |
| **Joins** | Expert | INNER, LEFT, RIGHT, FULL OUTER, CROSS joins. Understanding join semantics for accurate AI prompt engineering. |
| **CTEs (Common Table Expressions)** | Advanced | WITH clauses for complex multi-step queries. AI frequently generates CTEs for readability. |
| **Window Functions** | Advanced | ROW_NUMBER, RANK, LAG, LEAD, SUM OVER, moving averages. Critical for time-series and ranking queries. |
| **Subqueries** | Advanced | Correlated and non-correlated subqueries. Used in filtering, comparison, and existence checks. |
| **Date/Time Functions** | Advanced | Date arithmetic, intervals, EXTRACT, DATE_TRUNC. Dialect differences between PostgreSQL, MySQL, BigQuery, Snowflake. |
| **Dialect Differences** | Advanced | PostgreSQL vs MySQL vs BigQuery vs Snowflake syntax. String functions, date functions, type casting, array handling all differ. |
| **Query Optimization** | Intermediate | Understanding EXPLAIN plans. Knowing when a query will be slow (full table scans, cartesian joins). Warning users before execution. |
| **SQL Parsing** | Intermediate | Using `node-sql-parser` to parse, validate, and analyze generated SQL. Extracting table names, column references, and query structure. |

**Learning Resources**:
- "SQL for Data Scientists" by Renee Teate
- PostgreSQL documentation (best reference for advanced SQL)
- Mode Analytics SQL tutorial (mode.com/sql-tutorial)
- SQLBolt interactive exercises (sqlbolt.com)
- DuckDB documentation for analytical SQL patterns

---

### T5: DuckDB

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **DuckDB API** | Advanced | Node.js bindings for DuckDB. Connection management, query execution, prepared statements, streaming results. |
| **Analytical SQL** | Advanced | DuckDB's extended SQL: QUALIFY, PIVOT, UNPIVOT, list aggregations, struct types. Leveraging DuckDB-specific optimizations. |
| **CSV/Parquet Ingestion** | Intermediate | `COPY`, `READ_CSV_AUTO`, `READ_PARQUET`. Importing user files into DuckDB tables. |
| **Memory Management** | Intermediate | Configuring memory limits. Spilling to disk for queries that exceed RAM. Monitoring memory usage. |
| **Performance Tuning** | Intermediate | Understanding DuckDB's columnar, vectorized execution. Writing queries that leverage column pruning and predicate pushdown. |
| **WASM (optional)** | Basic | DuckDB-WASM for potential future web version. Understanding differences from native Node.js bindings. |

**Learning Resources**:
- DuckDB official documentation (duckdb.org/docs)
- DuckDB blog (technical deep-dives on internals)
- "DuckDB in Action" (Manning, early access)
- MotherDuck blog (analytics patterns with DuckDB)

---

### T6: Database Connectors

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **node-postgres (pg)** | Advanced | Connection pooling, SSL/TLS configuration, query parameterization, streaming large result sets, LISTEN/NOTIFY for real-time. |
| **mysql2** | Intermediate | Connection setup, prepared statements, SSL configuration. Handling MySQL-specific types (ENUM, SET, JSON). |
| **BigQuery Client** | Intermediate | Service account authentication, project/dataset/table navigation, query cost estimation (bytes scanned), job management. |
| **Snowflake SDK** | Intermediate | Key-pair authentication, warehouse/database/schema selection, query execution, result fetching, session management. |
| **Connection Pooling** | Advanced | Managing connection pools for concurrent queries. Idle timeout, max connections, connection health checks. |
| **Schema Introspection** | Advanced | Querying `information_schema` across different database engines. Extracting tables, columns, types, constraints, foreign keys. |
| **SSH Tunneling** | Intermediate | Tunneling database connections through SSH for databases behind firewalls. Using `ssh2` Node.js library. |

**Learning Resources**:
- node-postgres documentation (node-postgres.com)
- mysql2 GitHub repository documentation
- Google Cloud BigQuery Node.js client library reference
- Snowflake Node.js driver documentation

---

### T7: Large Dataset Handling

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Streaming** | Advanced | Node.js streams for processing large CSV files and query results without loading everything into memory. |
| **Virtual Scrolling** | Intermediate | Rendering large tables (100K+ rows) without DOM overload. TanStack Table virtualization. |
| **Data Sampling** | Intermediate | Sampling strategies for visualizations when full dataset is too large to render (random sampling, reservoir sampling, stratified sampling). |
| **Worker Threads** | Intermediate | Offloading heavy data processing to Node.js worker threads to keep the Electron UI responsive. |
| **Memory Profiling** | Basic | Chrome DevTools memory profiler in Electron. Identifying and fixing memory leaks from retained data. |

---

## Domain Skills

### D1: Business Intelligence Workflows

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **BI Tool Landscape** | Advanced | Deep understanding of Tableau, Looker, Mode, ThoughtSpot, Metabase, Power BI. What they do well, where they fail, and how users actually use them. |
| **Analyst Workflow** | Advanced | How business analysts actually work: receive request, clarify question, find data, query, analyze, visualize, present. Cortex must fit this workflow. |
| **Self-Serve Analytics** | Intermediate | The spectrum from full self-serve to analyst-mediated. Understanding organizational data maturity levels. |
| **Dashboard Design** | Intermediate | What makes a good business dashboard. KPI hierarchy, drill-down patterns, refresh frequency, audience-specific views. |
| **Report Automation** | Intermediate | Recurring reports: weekly business reviews, monthly board decks, daily operational reports. Formats, distribution, cadence. |

**Learning Resources**:
- "Designing Data-Intensive Applications" by Martin Kleppmann (O'Reilly)
- "Storytelling with Data" by Cole Nussbaumer Knaflic
- Benn Stancil's blog (benn.substack.com) on BI industry trends
- dbt Community Discourse (discourse.getdbt.com) for data team workflows

---

### D2: Data Modeling

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Star Schema** | Advanced | Fact tables, dimension tables. Understanding how data warehouses are modeled so Cortex can navigate them intelligently. |
| **Normalization** | Intermediate | 1NF through 3NF. Understanding why schemas are structured the way they are. Handling denormalized data. |
| **Entity-Relationship Diagrams** | Intermediate | Reading ERDs. Displaying relationships in the Schema Explorer. |
| **Slowly Changing Dimensions** | Basic | Type 1, Type 2 SCD patterns. Relevant for historical queries ("What was the region assignment last quarter?"). |
| **Common Business Models** | Intermediate | SaaS metrics (MRR, churn, LTV, CAC), e-commerce (orders, products, carts), marketplace (supply/demand) data models. |

---

### D3: KPI Frameworks & Metrics

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **SaaS Metrics** | Advanced | MRR, ARR, churn rate, net revenue retention, LTV, CAC, LTV:CAC ratio, payback period. Cortex's target users live in these metrics. |
| **OKRs** | Intermediate | How organizations define objectives and key results. Cortex dashboards often map to OKR tracking. |
| **Financial Metrics** | Intermediate | Revenue, gross margin, EBITDA, burn rate, runway. Finance users are a key persona. |
| **Operational Metrics** | Intermediate | NPS, CSAT, support ticket volume, resolution time, conversion rates. Ops managers use Cortex daily. |
| **Statistical Concepts** | Intermediate | Mean, median, percentiles, standard deviation, correlation, significance testing. For insight generation and anomaly detection. |

---

### D4: Data Warehousing Concepts

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **ETL vs ELT** | Intermediate | Understanding data pipeline patterns. Cortex reads from the output of ETL/ELT processes. |
| **Data Warehouse Architecture** | Intermediate | BigQuery, Snowflake, Redshift architecture. How they differ from OLTP databases. Query optimization for analytical workloads. |
| **dbt** | Basic | Many modern data teams use dbt. Understanding dbt models and the semantic layer helps Cortex map to user-defined transformations. |
| **Data Freshness** | Basic | Understanding replication lag, batch processing schedules. Informing users when data might be stale. |

---

## Design Skills

### DS1: Dashboard & Data Visualization UX

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Information Architecture** | Advanced | Organizing complex data into digestible layouts. Dashboard hierarchy: summary -> detail. Progressive disclosure. |
| **Data-Dense UI Design** | Advanced | Designing screens that show maximum data with minimum chrome. Tables, charts, and KPIs competing for screen real estate on a desktop monitor. |
| **Interaction Design** | Advanced | Query input UX (auto-complete, suggestions, conversational follow-ups). Chart interactions (hover, click-through, zoom, pan). Dashboard editing (drag, resize, snap). |
| **Desktop-Specific UX** | Intermediate | Keyboard shortcuts, multi-window support, right-click context menus, drag-and-drop, native feeling on macOS/Windows/Linux. |
| **Onboarding UX** | Intermediate | Reducing time-to-first-query. Progressive onboarding (don't show everything at once). Sample dataset for zero-friction start. |

---

### DS2: Chart Design Best Practices

| Principle | Application in Cortex |
|-----------|----------------------|
| **Data-Ink Ratio** (Tufte) | Maximize the share of ink (pixels) used for data. Remove unnecessary gridlines, borders, backgrounds, and decorations. |
| **Lie Factor** (Tufte) | Never distort proportions. Always start bar charts at zero. Use consistent scales. |
| **Small Multiples** (Tufte) | When comparing categories, use small multiples (identical charts for each category) instead of cramming everything into one chart. |
| **Preattentive Attributes** | Use color, size, position, and orientation to guide the eye to the most important data points. |
| **Color for Meaning** | Use color intentionally. Green for positive, red for negative, blue for neutral. Avoid using color for decoration. |
| **Annotation** | Label key data points directly on the chart rather than relying only on legends. Callout boxes for anomalies. |
| **Responsive Typography** | Axis labels that scale with chart size. Truncation with tooltip for long labels. |
| **Accessible Palettes** | Chart color palette verified for deuteranopia, protanopia, and tritanopia. Patterns (dashes, dots) as backup to color differentiation. |

**Learning Resources**:
- "The Visual Display of Quantitative Information" by Edward Tufte
- "Information Dashboard Design" by Stephen Few
- "Storytelling with Data" by Cole Nussbaumer Knaflic
- Datawrapper blog (datawrapper.de/blog) for chart design best practices
- Chartability (chartability.fizz.studio) for accessible chart design

---

### DS3: Data Table Design

| Skill | Application |
|-------|-------------|
| **Column Alignment** | Right-align numbers, left-align text, center-align dates and booleans. |
| **Number Formatting** | Thousands separators, currency symbols, percentage formatting, decimal precision. Context-dependent (revenue in $K, counts in integers). |
| **Row Striping** | Subtle alternating row backgrounds for readability in dense tables. Use theme colors (#1E293B / #0F172A). |
| **Sticky Headers** | Column headers stick to the top when scrolling. First column can optionally be sticky (for identifier columns). |
| **Null Display** | Show NULL values as a muted "null" or "--" instead of empty cells. Distinguishes between NULL and empty string. |
| **Sorting Indicators** | Clear up/down arrows on sortable columns. Active sort highlighted. |
| **Column Resizing** | Draggable column borders. Double-click to auto-fit column width to content. |
| **Overflow Handling** | Truncate long text with ellipsis. Full value shown on hover/tooltip. |

---

### DS4: Query Builder UX

| Skill | Application |
|-------|-------------|
| **Progressive Disclosure** | Simple query bar by default. Advanced options (SQL editing, query parameters) revealed on demand. |
| **Smart Suggestions** | Auto-suggest table names, column names, metric names, and previous queries as the user types. |
| **Conversational UX** | After a query, show context: "Following up on: revenue by region." Allow natural follow-ups. |
| **Error UX** | Clear, actionable error messages. "Column 'revnue' not found. Did you mean 'revenue'?" |
| **Feedback Loop** | Thumbs up/down on results. "What went wrong?" dialog for negative feedback. This trains the system and improves prompts. |

---

## Business Skills

### B1: Enterprise B2B Sales

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **B2B SaaS Sales** | Advanced | Selling to mid-market and enterprise buyers. Multi-stakeholder deals (analyst champion, VP decision-maker, IT security review). |
| **POC / Pilot Process** | Advanced | Running proof-of-concept trials for enterprise customers. 30-day trials with success criteria. Data security review process. |
| **Enterprise Objections** | Advanced | Handling "Where does my data go?" (desktop-first architecture), "Do you have SOC 2?" (on roadmap), "Can you integrate with Okta?" (SAML SSO on Enterprise tier). |
| **Pricing Strategy** | Intermediate | Per-seat pricing, tier design, free-to-paid conversion, enterprise contract negotiation. |
| **Channel Partnerships** | Basic | Potential partnerships with data consultancies, system integrators, and dbt shops. |

---

### B2: Data Team Workflows

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Data Team Structure** | Advanced | How data teams are organized (analytics engineers, data analysts, data scientists, analytics managers). Where Cortex fits in the stack. |
| **Ad-Hoc Request Workflow** | Advanced | How stakeholders request data from data teams. The pain of the request queue. How Cortex empowers self-serve to reduce this queue. |
| **Data Governance** | Intermediate | Data access controls, sensitive data handling, audit requirements. Enterprise customers require these. |
| **Tool Evaluation** | Intermediate | How data teams evaluate new tools. POC criteria, integration requirements, migration concerns. |

---

### B3: BI Tool Migration

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Migration Playbook** | Intermediate | How to migrate teams from Tableau/Looker/Mode to Cortex. Phased approach: start with ad-hoc queries, then dashboards, then scheduled reports. |
| **Coexistence Strategy** | Intermediate | Cortex doesn't need to replace Tableau day one. It can coexist as the "quick question" tool while Tableau handles production dashboards. |
| **ROI Calculation** | Intermediate | Build an ROI calculator: Cortex cost vs current tool cost + time saved on ad-hoc requests + faster decision-making. |

---

### B4: POC / Pilot Process

| Skill | Depth Required | Why |
|-------|----------------|-----|
| **Trial Design** | Intermediate | 14-day or 30-day free trials with clear success metrics: number of queries, time to first insight, user satisfaction score. |
| **Onboarding Assistance** | Intermediate | White-glove onboarding for enterprise pilots. Help connect databases, load sample queries, train power users. |
| **Success Metrics** | Intermediate | Define and track pilot success: adoption rate, query frequency, support tickets saved, stakeholder satisfaction. |
| **Contract Conversion** | Basic | Converting a successful pilot into a paid annual contract. Negotiation, procurement process, legal review. |

---

## Unique / Rare Skill Combinations

Building Cortex requires rare skill intersections that are difficult to find in a single person. The founding team should collectively cover these:

| Skill Combination | Why It's Rare | Who Has It |
|-------------------|---------------|------------|
| **SQL Expert + AI Prompt Engineer** | Must deeply understand SQL semantics to build reliable NL-to-SQL prompts. Most AI engineers don't know advanced SQL; most SQL experts don't know prompt engineering. | Former data engineers who've worked with LLMs |
| **Electron Developer + Data Viz Expert** | Desktop development and data visualization are separate specializations. Combining them for performant charts in Electron requires both. | Very rare. Look for developers who've built desktop BI tools. |
| **BI Domain Expert + Product Designer** | Understanding analyst workflows deeply enough to design a tool that replaces Tableau requires both BI domain knowledge and product design skill. | Former BI consultants turned product designers |
| **Enterprise Sales + Developer Tool Sales** | Cortex sells like a developer tool (bottoms-up, PLG) but closes like enterprise software (security review, procurement). Need both muscles. | Former sales at companies like Datadog, Snowflake, or Figma |

---

## Hiring Priorities

### Phase 1: MVP (Months 1-6) -- 3-4 People

| Role | Key Skills | Priority |
|------|-----------|----------|
| **Full-Stack Engineer (Founding)** | Electron, React, TypeScript, SQL, DuckDB, database connectors | Critical |
| **AI/ML Engineer** | OpenAI API, prompt engineering, SQL generation, evaluation pipelines | Critical |
| **Product Designer** | Data visualization UX, dashboard design, desktop application patterns | High |
| **Founder/CEO** | Product vision, domain expertise (BI/analytics), early sales | Critical |

### Phase 2: Post-MVP (Months 7-12) -- Add 3-5 People

| Role | Key Skills |
|------|-----------|
| **Frontend Engineer** | React, D3.js, advanced data table implementation, chart interactions |
| **Backend Engineer** | Supabase, database connectors (BigQuery, Snowflake), scheduled jobs |
| **Growth / Marketing** | Content marketing for data community, comparison content, ProductHunt launch |
| **Customer Success** | Enterprise pilot management, onboarding, technical support |

### Phase 3: Scale (Year 2) -- Add 5-8 People

| Role | Key Skills |
|------|-----------|
| **Data Engineer** | Data pipeline suggestions, query optimization, schema analysis |
| **Enterprise Sales** | Mid-market and enterprise B2B sales, POC management |
| **Security Engineer** | SOC 2 compliance, security audits, penetration testing |
| **Additional Frontend/Backend Engineers** | Scale the team as feature set grows |

---

## Skill Development Plan

For a solo founder or small team, here is the recommended learning path:

### Month 1-2: Foundation

- [ ] Complete the Electron official tutorial (build a basic app)
- [ ] Build a React + Vite + Electron starter with IPC communication
- [ ] Connect to a PostgreSQL database from Electron main process using `pg`
- [ ] Write your first DuckDB queries (import a CSV, run analytical queries)
- [ ] Complete the OpenAI API quickstart (chat completions)

### Month 3-4: Core Product Skills

- [ ] Build a working NL-to-SQL prototype (hardcoded schema, 10 test queries)
- [ ] Implement a basic data table with TanStack Table (sorting, pagination)
- [ ] Create 3 chart types with Recharts (bar, line, pie)
- [ ] Build the connection wizard UI (form validation with Zod)
- [ ] Study "The Visual Display of Quantitative Information" (Tufte)

### Month 5-6: Production Skills

- [ ] Implement SQL validation with `node-sql-parser`
- [ ] Build the dashboard grid with react-grid-layout
- [ ] Set up Supabase auth and metadata storage
- [ ] Implement CSV/PDF export
- [ ] Security hardening (CSP, safe IPC, credential encryption)
- [ ] E2E testing with Playwright for Electron

---

*The rarest skill in building Cortex is not any single technology -- it is the ability to think like a business analyst while engineering like a systems developer.*
