# Cortex

## "Ask your data anything."

---

## What is Cortex?

Cortex replaces SQL queries and Excel pivot tables with natural language. Business analysts connect their databases, spreadsheets, or data warehouses and ask questions in plain English: "What was our revenue by region last quarter, compared to the same period last year?" Cortex generates the query, runs it, and creates beautiful visualizations -- all without writing a single line of code. It's an AI data analyst that never sleeps.

Cortex is a **desktop-first B2B application** built on Electron, designed for analysts who work with sensitive data, large datasets, and enterprise database connections. Data stays on the user's machine. Queries run locally or against connected databases directly. No cloud middleman touching your numbers.

---

## Why Now?

Three converging forces make Cortex inevitable:

1. **LLMs can finally translate natural language to SQL reliably.** GPT-4o-class models handle complex joins, CTEs, window functions, and dialect-specific SQL with production-grade accuracy.
2. **80% of business users cannot write SQL.** They depend on data teams with 2-week backlogs. Every unanswered question is a missed decision.
3. **The $30B BI market is ripe for disruption.** Tableau, Looker, and Power BI were built for dashboard consumers, not question askers. They require weeks of setup, dedicated admins, and SQL-literate creators.

Cortex flips the model: **questions first, dashboards second.**

---

## YC Alignment

| Theme | Cortex Fit |
|-------|-----------|
| **Cursor for PMs/Analysts** | Cursor gave developers an AI copilot for code. Cortex gives business analysts an AI copilot for data. Same pattern: take a technical workflow, make it conversational. |
| **AI-Native Tools** | Not a BI tool with AI bolted on. Built from the ground up around natural language as the primary interface. The query bar is the product. |
| **Vertical AI for Business Users** | Deeply specialized for the analyst workflow: connect data, ask questions, visualize answers, share insights. Not a horizontal chatbot. |
| **Desktop-First Advantage** | Enterprise data cannot leave the network. Desktop app with local processing solves the #1 objection in enterprise sales: "Where does my data go?" Answer: nowhere. |

---

## Market Opportunity

### The Problem in Numbers

- **3.5 million** business analysts in the US alone (BLS, 2024)
- **60%** of analyst time is spent on data preparation, not analysis (Gartner)
- **80%** of business users cannot write SQL (Gartner)
- **2-week average backlog** for ad-hoc data requests at mid-market companies
- **$30B** global business intelligence and analytics market (2024)
- **12.3% CAGR** projected through 2030

### TAM / SAM / SOM

| Metric | Value | Calculation |
|--------|-------|-------------|
| **TAM** | $8.4B | 3.5M US analysts x $200/mo average BI spend x 12 months |
| **SAM** | $2.1B | ~25% at companies with 50-2,000 employees (mid-market sweet spot) |
| **SOM (Year 3)** | $21M | ~10,000 paid seats at ~$175/mo blended average |
| **SOM (Year 5)** | $84M | ~40,000 paid seats with enterprise expansion |

### Why Desktop-First?

| Advantage | Detail |
|-----------|--------|
| **Data Security** | Data never leaves the analyst's machine. Solves the #1 enterprise objection. |
| **Performance** | DuckDB processes millions of rows locally in milliseconds. No network latency. |
| **Database Connectivity** | Direct connections to PostgreSQL, MySQL, BigQuery, Snowflake from the desktop. No cloud proxy needed. |
| **Offline Capability** | Analysts can query imported CSV/Excel data without internet. AI features require connection. |
| **Large File Handling** | Desktop apps handle multi-GB files that crash browser tabs. |

---

## Competitive Landscape

### Comparison Table

| Feature | Cortex | Tableau | Looker | Mode | ThoughtSpot | Metabase |
|---------|--------|---------|--------|------|-------------|----------|
| **Natural Language First** | Primary interface | Add-on (Ask Data) | No | No | Yes (search-based) | No |
| **No SQL Required** | Full NL-to-SQL | Requires setup | LookML required | SQL required | Search syntax | SQL or GUI builder |
| **Desktop App** | Yes (Electron) | Yes (heavy) | No (web only) | No (web only) | No (web only) | Self-hosted web |
| **Data Stays Local** | Yes | Partial | No | No | No | Self-hosted option |
| **AI Visualizations** | Auto-picks chart type | Manual | Manual | Manual | Auto | Manual |
| **Time to First Query** | < 5 minutes | Hours/days | Days/weeks | 30 min | Days | 30 min |
| **Starting Price** | Free / $29/seat | $75/user | $5,000+/mo | $35/user | Enterprise only | Free / $85/mo |
| **Setup Complexity** | Install + connect | Install + configure | Deploy + model | Sign up + connect | Deploy + index | Deploy + connect |

### Competitive Moat

1. **NL-First vs. Dashboard-First**: Competitors bolt AI onto dashboard products. Cortex is built around the question. The query bar is the product, not a feature.
2. **Desktop Performance**: Local DuckDB engine processes analytical queries on millions of rows in milliseconds. Web-based tools hit browser memory limits.
3. **Data Privacy by Architecture**: Data never touches Cortex servers. Only the natural language question and schema metadata reach the AI. This is a structural advantage, not a policy promise.
4. **Speed to Insight**: Connect a database, type a question, get a chart. Under 5 minutes from install to first insight. Competitors take days to weeks.
5. **Compound Learning**: Every query improves Cortex's understanding of the user's schema, naming conventions, and common questions. The product gets smarter per-organization over time.

---

## How It Works

```
1. CONNECT     -->  Point Cortex at your database, CSV, or data warehouse
2. ASK         -->  Type a question in plain English
3. UNDERSTAND  -->  Cortex reads your schema, generates SQL, shows you the query
4. EXECUTE     -->  Run the query against your data (locally or against the database)
5. VISUALIZE   -->  AI picks the best chart type. Adjust if you want.
6. SAVE & SHARE --> Pin to a dashboard, export, or schedule a recurring report
```

### Example Queries

| Natural Language | What Cortex Does |
|-----------------|-------------------|
| "What was revenue by region last quarter vs same period last year?" | Generates SQL with date filtering, GROUP BY region, year-over-year comparison. Creates grouped bar chart. |
| "Show me the top 10 customers by lifetime value" | Aggregates order history, calculates LTV, sorts descending, limits to 10. Creates horizontal bar chart. |
| "Why did churn spike in March?" | Identifies churn metric, compares March cohort to prior months, surfaces correlated variables. Creates annotated line chart with callouts. |
| "Which sales rep has the highest win rate this quarter?" | Joins opportunities and reps, calculates win rate per rep, filters current quarter. Creates leaderboard table. |
| "Predict next quarter's revenue based on the last 8 quarters" | Runs time series analysis on historical revenue, fits trend model, generates forecast with confidence intervals. Creates line chart with projection. |

---

## Target Users

### Primary Personas

| Persona | Role | Pain Point | Cortex Value |
|---------|------|-----------|--------------|
| **Data-Curious Analyst** | Business/Operations Analyst | Knows what questions to ask but can't write SQL. Waits on data team. | Ask questions directly. No SQL needed. |
| **Overloaded Data Analyst** | Data/BI Analyst | Spends 60% of time on ad-hoc requests from stakeholders. | Empower stakeholders to self-serve. Focus on complex analysis. |
| **Startup Founder** | CEO/COO at 20-100 person company | No data team. Lives in spreadsheets. Needs answers fast. | Connect the database, ask questions. Instant BI without hiring. |
| **Finance Manager** | FP&A / Controller | Monthly reporting is manual Excel hell. | Automate recurring reports. NL queries for ad-hoc analysis. |
| **Ops Manager** | Operations / Supply Chain | Needs real-time visibility but can't build dashboards. | Pin key queries to a live dashboard. Updated on refresh. |

### Company Profile

- **Size**: 50-500 employees (mid-market sweet spot)
- **Stage**: Series A through growth stage
- **Data Maturity**: Has a database (PostgreSQL/MySQL) but limited BI tooling
- **Decision Maker**: VP of Operations, Head of Analytics, CFO, or technical founder
- **Budget**: $500-$5,000/mo for BI tooling (currently spent on Tableau, Looker, or nothing)

---

## Quick Links

| Resource | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, frameworks, infrastructure |
| [Features](./features.md) | MVP, post-MVP, and Year 2+ roadmap |
| [Screens](./screens.md) | Every screen, UI elements, navigation flows |
| [Skills Required](./skills.md) | Technical, domain, design, and business skills |
| [Theme & Design](./theme.md) | Colors, typography, component styling |
| [API Guide](./api-guide.md) | Third-party APIs, pricing, setup, code snippets |
| [Revenue Model](./revenue-model.md) | Pricing, unit economics, growth projections |

---

## One-Liner for Every Audience

| Audience | Pitch |
|----------|-------|
| **Analyst** | "Stop waiting on the data team. Ask your database questions in English." |
| **Data Team Lead** | "Give your stakeholders self-serve analytics. Cut ad-hoc requests by 80%." |
| **CTO/VP Eng** | "Data never leaves the desktop. No cloud risk. Direct database connections." |
| **CFO** | "Replace $75/seat Tableau licenses with $29/seat Cortex. Better ROI, faster adoption." |
| **Investor** | "Cursor for data. $30B market. 80% of business users locked out of their own data." |

---

## Key Metrics to Track

| Metric | Target (Month 6) | Target (Month 12) | Target (Month 24) |
|--------|-------------------|--------------------|--------------------|
| Registered Users | 5,000 | 25,000 | 100,000 |
| Paid Seats | 200 | 1,500 | 8,000 |
| MRR | $8,000 | $65,000 | $440,000 |
| Queries per Active User per Week | 15 | 25 | 40 |
| Query Success Rate (NL to correct result) | 75% | 85% | 92% |
| Time to First Query (from install) | < 5 min | < 3 min | < 2 min |
| Net Revenue Retention | 110% | 120% | 130% |
| Monthly Churn | 5% | 3% | 2% |

---

## Tech Stack at a Glance

```
Frontend:       Electron + React + TypeScript
Visualization:  D3.js + Recharts
Local Engine:   DuckDB (embedded analytical DB)
AI:             OpenAI GPT-4o (NL-to-SQL, chart selection, insights)
Backend:        Supabase (auth, metadata, saved queries)
Connectors:     PostgreSQL, MySQL, BigQuery, Snowflake, CSV, Excel
Desktop:        Local-first. Data never leaves the machine.
```

---

*Cortex: Because every business user deserves a data analyst. And every data analyst deserves fewer ad-hoc requests.*
