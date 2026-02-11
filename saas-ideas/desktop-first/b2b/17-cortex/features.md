# Cortex -- Features & Roadmap

## Feature Philosophy

Every feature in Cortex is evaluated against one question: **Does this reduce the time between a business question and a data-backed answer?**

Features that add steps, require configuration, or demand technical knowledge are deprioritized. Features that eliminate friction, automate decisions, or surface insights proactively are prioritized.

---

## MVP (Months 1-6)

### F1: Natural Language to SQL Query Generation

**Description**: The core of Cortex. Users type a question in plain English. Cortex generates a SQL query, shows it for review, executes it against the connected database, and returns results.

| Detail | Specification |
|--------|---------------|
| **Input** | Free-text query bar at the top of the workspace. Supports English (other languages post-MVP). |
| **AI Model** | GPT-4o for complex queries (joins, CTEs, window functions). GPT-4o-mini for simple queries (single table, basic aggregation). |
| **SQL Preview** | Generated SQL displayed in a syntax-highlighted panel. User can view, copy, or edit before execution. |
| **Dialect Support** | PostgreSQL, MySQL, DuckDB (for local files). Dialect auto-detected from connection type. |
| **Conversational Context** | Supports follow-up queries: "Same thing but for Q2" or "Break that down by product category." Last 5 queries maintained in context. |
| **Error Recovery** | If a query fails, the error is sent back to GPT-4o with the instruction: "Fix this SQL based on the error." Automatic retry with corrected query. |
| **Safety** | Only SELECT statements allowed. Generated SQL parsed and validated before execution. DROP, DELETE, UPDATE, INSERT all blocked. |

**User Story**: As a business analyst, I want to ask "What were our top 10 products by revenue last month?" and get a table of results without writing any SQL.

**Edge Cases**:
- Ambiguous column names (e.g., multiple tables with "name" column) -- Cortex asks for clarification
- Very large result sets (> 100K rows) -- auto-add LIMIT, warn user, offer pagination
- Complex date logic ("last fiscal quarter" vs "last calendar quarter") -- Cortex asks for clarification or uses org-defined fiscal calendar
- Unsupported SQL features for the connected dialect -- Cortex translates to equivalent syntax

---

### F2: Database Connectors (PostgreSQL, MySQL, CSV, Excel)

**Description**: Connect to data sources through a guided wizard. Credentials stored locally in the OS keychain. Schema auto-discovered and cached.

| Connector | Auth | Setup Flow |
|-----------|------|-----------|
| **PostgreSQL** | Host, port, database, user, password, optional SSL certificate | Connection string builder with "Test Connection" button |
| **MySQL** | Host, port, database, user, password, optional SSL | Same as PostgreSQL |
| **CSV** | File picker (local file) | Select file, auto-detect delimiter and headers, preview first 100 rows |
| **Excel** | File picker (local file) | Select file, choose sheet, preview data, configure header row |

| Feature | Detail |
|---------|--------|
| **Schema Discovery** | Auto-read all tables, columns, types, foreign keys, indexes. Display in Schema Explorer. |
| **Schema Caching** | Cache schema locally. Manual refresh button. Auto-refresh option (daily). |
| **Multiple Connections** | Support multiple data sources simultaneously. User selects active connection for queries. |
| **Connection Health** | Status indicator (green/yellow/red) for each connection. Auto-reconnect on failure. |

**User Story**: As a startup founder, I want to connect my production PostgreSQL database in under 2 minutes so I can start asking questions about my data.

**Edge Cases**:
- Database behind a VPN or firewall -- provide SSH tunnel configuration option
- Very large schemas (500+ tables) -- lazy-load tables, search/filter in Schema Explorer
- CSV with inconsistent formatting -- show preview with auto-detected settings, allow manual override
- Excel with merged cells or complex formatting -- flatten and preview, warn about data loss

---

### F3: Auto-Visualization

**Description**: After a query runs, Cortex's AI recommends the best chart type based on the data shape and query intent. Users can override the recommendation.

| Data Shape | Recommended Chart | Example |
|-----------|-------------------|---------|
| Single metric | Big number card | "What's our total revenue this month?" |
| Category + value | Bar chart (horizontal if > 7 categories) | "Revenue by region" |
| Time series | Line chart | "Monthly active users over the last year" |
| Two numeric dimensions | Scatter plot | "Revenue vs headcount by department" |
| Parts of a whole (< 7 categories) | Pie/donut chart | "Revenue split by product line" |
| Category + value + group | Grouped bar chart | "Revenue by region, split by quarter" |
| Time series + group | Multi-line chart | "Monthly revenue by product, over time" |
| Ranked list | Horizontal bar chart | "Top 10 customers by LTV" |
| Single row with multiple metrics | KPI dashboard card | "Show me this month's key metrics" |

| Feature | Detail |
|---------|--------|
| **Chart Customization** | Change chart type, colors, axis labels, title, legend position |
| **Responsive Sizing** | Charts resize to fill available space. Optimized for desktop screen sizes. |
| **Hover Tooltips** | Interactive tooltips showing exact values on hover |
| **Data Labels** | Optional data labels on chart elements |
| **Export** | Export chart as PNG (high-res), SVG, or include in PDF report |

**User Story**: As an operations manager, I want Cortex to automatically create a line chart when I ask about trends over time, without me needing to choose the chart type.

---

### F4: Query History with Bookmarks

**Description**: Every query is automatically saved with its natural language input, generated SQL, results summary, and visualization. Users can bookmark, tag, search, and re-run queries.

| Feature | Detail |
|---------|--------|
| **Auto-Save** | Every executed query saved with timestamp, NL input, SQL, chart type, connection used |
| **Bookmarks** | Star important queries for quick access |
| **Tags** | User-defined tags (e.g., "revenue", "churn", "weekly-report") |
| **Search** | Full-text search across NL input and SQL |
| **Re-run** | One-click re-run of any historical query (with current data) |
| **Duplicate & Edit** | Clone a query and modify the natural language input |
| **Retention** | Last 1,000 queries stored. Bookmarked queries never auto-deleted. |

**User Story**: As a finance analyst, I want to find the revenue query I ran last Tuesday and re-run it with this week's data.

---

### F5: Export to CSV / PNG / PDF

**Description**: Export query results and visualizations in multiple formats.

| Format | Content | Use Case |
|--------|---------|----------|
| **CSV** | Raw query results with headers | Import into Excel, share with team |
| **PNG** | Chart visualization (high-resolution, 2x) | Paste into presentations, Slack |
| **PDF** | Formatted report with chart + data table + query description | Email to stakeholders, archive |

| Feature | Detail |
|---------|--------|
| **One-click export** | Export button on every query result and chart |
| **Batch export** | Export entire dashboard as a single PDF |
| **File naming** | Auto-generated name from query (e.g., "revenue-by-region-2024-Q4.csv") |
| **PDF Branding** | Company logo and name in PDF header (configurable in settings) |

---

### F6: Data Schema Explorer

**Description**: Visual browser for connected database schemas. Shows tables, columns, data types, relationships, and sample data.

| Feature | Detail |
|---------|--------|
| **Table List** | All tables with row counts and column counts |
| **Column Details** | Name, data type, nullable, primary key, foreign key references |
| **Relationships** | Visual indicators for foreign key relationships between tables |
| **Sample Data** | Preview first 100 rows of any table (click to expand) |
| **Search** | Search across table names and column names |
| **Copy Column Name** | Click to copy fully qualified column name (schema.table.column) |
| **Schema Statistics** | Table size, row count, last updated (if available) |

**User Story**: As a new analyst on the team, I want to explore the database schema to understand what data is available before I start asking questions.

---

### F7: Basic Dashboards

**Description**: Pin query results and visualizations to a dashboard board. Drag-and-drop layout. Manual refresh.

| Feature | Detail |
|---------|--------|
| **Create Dashboard** | Name, optional description |
| **Pin Queries** | Pin any query result (chart + optional data table) to a dashboard |
| **Grid Layout** | Drag-and-drop positioning. Resize tiles. Snap-to-grid. |
| **Manual Refresh** | "Refresh All" button re-runs all pinned queries with current data |
| **Multiple Dashboards** | Create unlimited dashboards (Free tier: 1 dashboard) |
| **Tile Actions** | Remove, resize, open in workspace (to modify the underlying query) |

**User Story**: As a CEO, I want a single dashboard with our key metrics (MRR, churn, new customers, NPS) that I can refresh each morning.

---

## Post-MVP (Months 7-12)

### F8: Scheduled Reports

**Description**: Automate recurring reports. Cortex runs the dashboard queries on a schedule and emails a PDF/CSV to specified recipients.

| Feature | Detail |
|---------|--------|
| **Schedule Options** | Daily, weekly (pick day), monthly (pick date), custom cron |
| **Report Content** | Full dashboard or selected tiles |
| **Format** | PDF (charts + tables) or CSV (data only) |
| **Recipients** | Email addresses (internal or external) |
| **Delivery** | Via SendGrid. Branded email template with Cortex + company logo. |
| **History** | Log of sent reports with delivery status |

**User Story**: As a VP of Sales, I want a weekly pipeline report emailed to my team every Monday at 8 AM, without anyone needing to manually run queries.

---

### F9: Anomaly Detection & Alerts

**Description**: Set up monitoring on any metric. Cortex runs the query periodically and alerts when a threshold is crossed.

| Feature | Detail |
|---------|--------|
| **Alert Types** | Threshold (above/below value), percentage change (increase/decrease by X%), anomaly (statistical deviation from trend) |
| **Monitoring** | Cortex checks the metric every hour, 6 hours, daily, or weekly |
| **Notification Channels** | Email, Slack (post-MVP), desktop notification |
| **Alert Dashboard** | View all active alerts, trigger history, snooze, disable |
| **NL Setup** | "Alert me when monthly churn exceeds 5%" -- Cortex creates the query and alert automatically |

**User Story**: As a product manager, I want to be alerted immediately if daily active users drop more than 20% from the 7-day average.

**Edge Cases**:
- Flapping alerts (metric oscillates around threshold) -- configurable cooldown period
- Alert on a slow query -- timeout and retry, notify if consistently failing
- Seasonal patterns causing false positives -- option to use seasonal-adjusted baselines

---

### F10: BigQuery & Snowflake Connectors

**Description**: Extend database support to cloud data warehouses.

| Connector | Auth | Notes |
|-----------|------|-------|
| **BigQuery** | Google service account JSON key file | Project and dataset selection. Billing warnings for large queries (estimated bytes scanned). |
| **Snowflake** | Key-pair authentication (RSA) | Warehouse, database, schema selection. Virtual warehouse auto-suspend support. |

**User Story**: As a data analyst at a mid-market company, I want to connect Cortex to our Snowflake data warehouse so I can ask questions about our full dataset without moving data.

---

### F11: Collaborative Dashboards with Team Sharing

**Description**: Share dashboards with team members. Real-time updates when collaborators modify the dashboard.

| Feature | Detail |
|---------|--------|
| **Share** | Invite team members by email. Viewer or editor roles. |
| **Real-time** | See collaborators' cursors and changes in real-time (Supabase Realtime) |
| **Comments** | Add comments to dashboard tiles for async discussion |
| **Version History** | View and restore previous dashboard versions |
| **Org-wide Dashboards** | Pin dashboards to the organization for all members to access |

---

### F12: Python/R Notebook Mode

**Description**: For advanced users who want to go beyond SQL. Embed Python or R code cells alongside NL queries.

| Feature | Detail |
|---------|--------|
| **Code Cells** | Write Python (pandas, numpy, scipy) or R code |
| **Data Handoff** | Query results automatically available as a DataFrame in code cells |
| **Execution** | Local Python/R runtime (user must have installed) |
| **Visualization** | Matplotlib/Plotly charts rendered inline |
| **Use Case** | Statistical tests, custom transformations, ML model prototyping |

**User Story**: As a senior analyst, I want to run a query in natural language, then apply a custom statistical test in Python on the results, all in one workflow.

---

### F13: Custom Metric Definitions

**Description**: Define reusable business metrics that Cortex understands in future queries.

| Feature | Detail |
|---------|--------|
| **Define Metric** | "MRR = SUM(subscription_amount) WHERE status = 'active', grouped by month" |
| **NL Understanding** | After defining MRR, users can ask "What's our MRR trend?" and Cortex knows the formula |
| **Metric Library** | Shared across the organization. Version-controlled. |
| **Categories** | Revenue, Growth, Engagement, Retention, Operations (user-defined) |
| **Consistency** | Ensures everyone in the org uses the same metric definitions |

**User Story**: As a Head of Analytics, I want to define "Net Revenue Retention" once and have every analyst on my team get the same calculation when they ask about it.

---

## Year 2+ Features

### F14: Predictive Analytics

**Description**: Forecasting, trend analysis, and what-if scenarios powered by statistical models and AI.

| Feature | Detail |
|---------|--------|
| **Forecasting** | "Predict next quarter's revenue based on the last 8 quarters." Time series forecasting with confidence intervals. |
| **What-If** | "What would revenue look like if we increased prices by 10%?" Scenario modeling based on historical elasticity. |
| **Trend Detection** | Automatically surface accelerating or decelerating trends |
| **Seasonality** | Detect and account for seasonal patterns in forecasts |
| **Model Selection** | Auto-select between linear regression, exponential smoothing, ARIMA based on data characteristics |

---

### F15: Embedded Analytics

**Description**: Share interactive dashboards via URL. Recipients view live data without needing a Cortex account.

| Feature | Detail |
|---------|--------|
| **Shareable Links** | Generate a URL for any dashboard. Password-protected or public. |
| **Embed Iframe** | Embed Cortex dashboards in internal wikis, Notion pages, or websites |
| **Branding** | White-label option for Enterprise tier (remove Cortex branding) |
| **Permissions** | View-only. No ability to modify queries or access underlying data. |
| **Data Refresh** | Embedded dashboards refresh on a schedule (hourly, daily) |

---

### F16: AI Data Quality Checks

**Description**: Cortex proactively scans connected databases for data quality issues.

| Check | Detail |
|-------|--------|
| **Null Analysis** | Flag columns with unexpectedly high null rates |
| **Duplicate Detection** | Identify potential duplicate rows in key tables |
| **Type Mismatches** | Find columns stored as strings that contain numbers or dates |
| **Freshness** | Alert when tables haven't been updated in an unexpected timeframe |
| **Referential Integrity** | Check foreign key relationships for orphaned records |
| **Outlier Detection** | Flag statistical outliers in numeric columns |

---

### F17: Automated Data Pipeline Suggestions

**Description**: Based on usage patterns, Cortex suggests data transformations, materializations, and pipeline optimizations.

| Suggestion | Trigger |
|-----------|---------|
| "Create a materialized view for this query" | Query runs frequently and is slow |
| "Add an index on this column" | Column used in WHERE clauses frequently |
| "Denormalize these joined tables" | Same join pattern appears in 50%+ of queries |
| "Pre-aggregate this daily data to monthly" | Users always aggregate daily data to monthly |

---

### F18: Voice Queries

**Description**: Ask questions by voice. Cortex transcribes and processes the query.

| Feature | Detail |
|---------|--------|
| **Input** | Microphone button on query bar. Push-to-talk or always-listening mode. |
| **Transcription** | OpenAI Whisper API or browser native Speech API |
| **Confirmation** | Transcribed text shown in query bar. User confirms before execution. |
| **Use Case** | Executives in meetings: "Show me last month's revenue by product" |

---

### F19: Slack / Teams Bot

**Description**: Ask Cortex questions directly from Slack or Microsoft Teams. Responses posted as formatted messages with chart images.

| Feature | Detail |
|---------|--------|
| **Slash Command** | `/cortex What was revenue last month?` |
| **Threaded Responses** | Reply in thread with results table and chart image |
| **Channel Dashboards** | Pin a dashboard to a Slack channel. Auto-post updates daily. |
| **Permissions** | Respects user-level permissions from Cortex account |

---

## User Stories Summary

| ID | Persona | Story | Feature | Priority |
|----|---------|-------|---------|----------|
| US-01 | Business Analyst | Ask a data question in English and get results | F1 | P0 (MVP) |
| US-02 | Startup Founder | Connect my PostgreSQL database in < 2 minutes | F2 | P0 (MVP) |
| US-03 | Ops Manager | Get an auto-generated chart that matches my data | F3 | P0 (MVP) |
| US-04 | Finance Analyst | Find and re-run a query from last week | F4 | P0 (MVP) |
| US-05 | Product Manager | Export a chart to paste into my presentation | F5 | P0 (MVP) |
| US-06 | New Team Member | Explore the database schema to learn what data exists | F6 | P0 (MVP) |
| US-07 | CEO | See key metrics on a single refreshable dashboard | F7 | P0 (MVP) |
| US-08 | VP Sales | Get a weekly pipeline report emailed automatically | F8 | P1 (Post-MVP) |
| US-09 | Product Manager | Get alerted when a key metric drops unexpectedly | F9 | P1 (Post-MVP) |
| US-10 | Data Analyst | Connect to our Snowflake warehouse from Cortex | F10 | P1 (Post-MVP) |
| US-11 | Team Lead | Share a dashboard with my team and discuss findings | F11 | P1 (Post-MVP) |
| US-12 | Senior Analyst | Run Python analysis on query results | F12 | P1 (Post-MVP) |
| US-13 | Head of Analytics | Define standard metrics so everyone calculates them the same | F13 | P1 (Post-MVP) |
| US-14 | CFO | Forecast next quarter's revenue with confidence intervals | F14 | P2 (Year 2) |
| US-15 | Marketing Director | Share a live dashboard with the board via URL | F15 | P2 (Year 2) |
| US-16 | Data Engineer | Get alerts about data quality issues in our database | F16 | P2 (Year 2) |
| US-17 | Exec in a meeting | Ask a question by voice and get an instant chart | F18 | P2 (Year 2) |
| US-18 | Sales Rep | Ask Cortex a quick question from Slack | F19 | P2 (Year 2) |

---

## Edge Cases & Special Handling

### Query Edge Cases

| Scenario | Handling |
|----------|----------|
| **Ambiguous question** | Cortex asks a clarifying question before generating SQL. "Did you mean revenue from the orders table or the invoices table?" |
| **No results** | Display "No results found" with suggestions: "Try broadening the date range" or "Check if the filter values exist in the data." |
| **Very slow query (> 30s)** | Show progress indicator. Offer to cancel. Suggest adding filters to reduce data volume. |
| **Query timeout (> 2 min)** | Cancel automatically. Suggest optimization: "This query scans 50M rows. Try adding a date filter." |
| **Incorrect results** | "Thumbs down" button on results. User can describe the error. Cortex regenerates SQL with the feedback. |
| **Multiple valid interpretations** | Show the SQL with explanation: "I interpreted 'last quarter' as Q4 2024 (Oct-Dec). Is that correct?" |

### Data Edge Cases

| Scenario | Handling |
|----------|----------|
| **Empty database** | Show "No tables found" with helpful message. Suggest importing a CSV to get started. |
| **Schema changes** | Detect changes on next schema refresh. Warn if saved queries reference deleted columns. Offer to re-map. |
| **Very wide tables (100+ columns)** | Show columns in collapsible groups. Search filter in Schema Explorer. |
| **Mixed data types in CSV** | Auto-detect types. Show preview with detected types. Allow manual override. |
| **Unicode / special characters** | Full UTF-8 support. Properly escape in SQL generation. |
| **NULL values in visualizations** | Configurable: exclude, show as zero, or show as separate category. Default: exclude with note. |

### Connection Edge Cases

| Scenario | Handling |
|----------|----------|
| **Connection dropped mid-query** | Auto-retry with exponential backoff (3 attempts). Show error if persistent. |
| **Database credentials changed** | Prompt to update credentials. Don't auto-delete saved queries. |
| **Firewall blocks connection** | Clear error message with troubleshooting steps (check IP whitelist, VPN, SSH tunnel). |
| **Read replica lag** | Note in UI: "Connected to a read replica. Data may be up to X seconds behind." |

---

## Development Timeline

### Month 1: Foundation

- [ ] Electron app shell with React, Vite, TypeScript
- [ ] Basic UI layout (sidebar, query bar, results panel)
- [ ] PostgreSQL connector with connection wizard
- [ ] Schema discovery and caching
- [ ] OpenAI integration for NL-to-SQL (basic prompts)

### Month 2: Core Query Experience

- [ ] SQL preview panel with syntax highlighting
- [ ] Query execution against connected PostgreSQL
- [ ] Results table with sorting and pagination (TanStack Table)
- [ ] Error handling and display
- [ ] MySQL connector

### Month 3: Visualization

- [ ] AI chart type recommendation
- [ ] Bar chart, line chart, pie chart (Recharts)
- [ ] Scatter plot (D3.js)
- [ ] Big number card for single metrics
- [ ] Chart customization (colors, labels, title)
- [ ] CSV/Excel import via DuckDB

### Month 4: History & Export

- [ ] Query history with auto-save
- [ ] Bookmarks and tags
- [ ] Search across history
- [ ] Export: CSV, PNG, PDF
- [ ] Conversational follow-up queries

### Month 5: Dashboards & Polish

- [ ] Dashboard creation and tile pinning
- [ ] Drag-and-drop grid layout
- [ ] Manual refresh for dashboards
- [ ] Settings screen (connections, preferences)
- [ ] Supabase integration (auth, saved queries sync)

### Month 6: MVP Launch

- [ ] User onboarding flow
- [ ] Stripe integration (free + paid tiers)
- [ ] Auto-update system
- [ ] Error tracking (Sentry)
- [ ] Performance optimization
- [ ] Beta testing with 50 users
- [ ] ProductHunt launch prep

### Months 7-9: Post-MVP Phase 1

- [ ] Scheduled reports (SendGrid integration)
- [ ] Anomaly detection and alerts
- [ ] BigQuery connector
- [ ] Snowflake connector
- [ ] Custom metric definitions

### Months 10-12: Post-MVP Phase 2

- [ ] Collaborative dashboards (team sharing)
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Python notebook mode
- [ ] Advanced chart types (heatmap, treemap, funnel)
- [ ] SSO (SAML) for Enterprise tier

---

## Feature Prioritization Framework

| Criteria | Weight | Description |
|----------|--------|-------------|
| **Time to Value** | 30% | How quickly does the user get value from this feature? |
| **Retention Impact** | 25% | Does this feature increase daily/weekly usage? |
| **Revenue Impact** | 20% | Does this unlock a paid tier or expansion revenue? |
| **Technical Feasibility** | 15% | Can we build this with our current stack in a reasonable time? |
| **Competitive Differentiation** | 10% | Does this set us apart from Tableau/Looker/ThoughtSpot? |

---

*Every feature exists to serve one mission: get from question to answer faster.*
