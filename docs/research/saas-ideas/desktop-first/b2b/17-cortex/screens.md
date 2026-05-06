# Cortex -- Screens & UI Specification

## Screen Architecture

Cortex uses a **sidebar + main content** layout common in desktop productivity tools. The sidebar provides navigation, and the main content area adapts to the active screen. The query bar is persistent across most screens, reinforcing that asking questions is always one keystroke away.

---

## Global Layout

```
+-------------------------------------------------------------------+
|  [Logo] Cortex           [Connection: prod-db]  [Cmd+K]  [Avatar] |
+----------+----------------------------------------------------+---+
|          |                                                     |   |
| SIDEBAR  |              MAIN CONTENT AREA                      |   |
|          |                                                     |   |
| [Query]  |  +----------------------------------------------+  |   |
| [Dashb]  |  | QUERY BAR (persistent)                       |  |   |
| [Schema] |  | "Ask your data anything..."                  |  |   |
| [History]|  +----------------------------------------------+  |   |
| [Reports]|                                                     |   |
| [Alerts] |  +----------------------------------------------+  |   |
| [Setting]|  |                                               |  |   |
|          |  |          SCREEN-SPECIFIC CONTENT               |  |   |
|          |  |                                               |  |   |
|          |  |                                               |  |   |
|          |  |                                               |  |   |
|          |  +----------------------------------------------+  |   |
|          |                                                     |   |
+----------+----------------------------------------------------+---+
|  [Status: Connected]              [Query count: 47/50]  [v1.2.0]  |
+-------------------------------------------------------------------+
```

### Global Elements

| Element | Detail |
|---------|--------|
| **App Title Bar** | Custom title bar (frameless window). Cortex logo, active connection name, Cmd+K search trigger, user avatar with dropdown (account, subscription, sign out). |
| **Sidebar** | Fixed-width (240px), collapsible to icon-only (60px). Navigation items with icons and labels. Active item highlighted with indigo accent. |
| **Query Bar** | Persistent across Query, Dashboard, and Schema screens. Hidden on Settings, Account, and onboarding screens. |
| **Status Bar** | Bottom bar showing connection status, query count (for free tier), app version. Subtle, non-intrusive. |
| **Command Palette** | Cmd+K opens a search overlay (cmdk library). Search queries, dashboards, tables, settings. Fast keyboard navigation. |

---

## Screen 1: Welcome / Data Source Setup

**Route**: `/welcome` (first launch) or `/settings/connections/new` (adding a connection)

**Purpose**: Guide new users through connecting their first data source. This is the critical onboarding moment -- time to first query must be under 5 minutes.

### Layout

```
+-------------------------------------------------------------------+
|                                                                    |
|                    Welcome to Cortex                               |
|              Ask your data anything.                               |
|                                                                    |
|   +-------------------+  +-------------------+                     |
|   |  [PostgreSQL icon]|  |  [MySQL icon]     |                     |
|   |  PostgreSQL       |  |  MySQL            |                     |
|   +-------------------+  +-------------------+                     |
|   +-------------------+  +-------------------+                     |
|   |  [CSV icon]       |  |  [Excel icon]     |                     |
|   |  CSV File         |  |  Excel File       |                     |
|   +-------------------+  +-------------------+                     |
|   +-------------------+  +-------------------+                     |
|   |  [BigQuery icon]  |  |  [Snowflake icon] |                     |
|   |  BigQuery (soon)  |  |  Snowflake (soon) |                     |
|   +-------------------+  +-------------------+                     |
|                                                                    |
|   Or try with sample data: [Load Sample Dataset]                   |
|                                                                    |
+-------------------------------------------------------------------+
```

### Connection Wizard (PostgreSQL/MySQL)

**Step 1: Connection Details**
```
+-------------------------------------------------------------------+
|  < Back                  Connect PostgreSQL                        |
|                                                                    |
|  Connection Name:    [My Production Database        ]              |
|  Host:               [db.example.com                ]              |
|  Port:               [5432                          ]              |
|  Database:           [myapp_production              ]              |
|  Username:           [readonly_user                 ]              |
|  Password:           [********                      ]              |
|                                                                    |
|  [ ] Use SSL          [Upload Certificate]                         |
|  [ ] SSH Tunnel       [Configure Tunnel]                           |
|                                                                    |
|  [Test Connection]                      [Cancel]  [Connect]        |
|                                                                    |
+-------------------------------------------------------------------+
```

**Step 2: Schema Discovery** (shown after successful connection test)
```
+-------------------------------------------------------------------+
|  Discovering schema...                                             |
|                                                                    |
|  Found 24 tables, 186 columns                                     |
|                                                                    |
|  [x] users (12 columns)                                           |
|  [x] orders (18 columns)                                          |
|  [x] products (14 columns)                                        |
|  [x] subscriptions (10 columns)                                   |
|  ... (20 more tables)                                              |
|                                                                    |
|  [Select All]  [Deselect All]                                      |
|                                                                    |
|  Tip: You can always add or remove tables later in Schema Explorer |
|                                                                    |
|                                        [Cancel]  [Start Querying]  |
+-------------------------------------------------------------------+
```

### Connection Wizard (CSV/Excel)

```
+-------------------------------------------------------------------+
|  < Back                  Import CSV File                           |
|                                                                    |
|  +------------------------------------------------------+         |
|  |                                                      |         |
|  |     Drag & drop a CSV file here                      |         |
|  |     or [Browse Files]                                |         |
|  |                                                      |         |
|  +------------------------------------------------------+         |
|                                                                    |
|  File: sales_data_2024.csv (2.3 MB)                               |
|  Delimiter: [Comma ,]  v    Header Row: [Row 1]  v                |
|                                                                    |
|  Preview:                                                          |
|  +--------+----------+----------+--------+--------+               |
|  | date   | region   | product  | qty    | revenue|               |
|  +--------+----------+----------+--------+--------+               |
|  | 2024.. | West     | Widget A | 150    | 4500   |               |
|  | 2024.. | East     | Widget B | 220    | 8800   |               |
|  | 2024.. | Central  | Widget A | 180    | 5400   |               |
|  +--------+----------+----------+--------+--------+               |
|  Showing 3 of 15,420 rows                                         |
|                                                                    |
|                                        [Cancel]  [Import & Query] |
+-------------------------------------------------------------------+
```

### States

| State | Behavior |
|-------|----------|
| **Empty** | First launch. No connections. Show welcome screen with data source options. |
| **Testing Connection** | "Test Connection" button shows spinner. Success: green checkmark + "Connected!" Failure: red X + error message with troubleshooting tips. |
| **Discovering Schema** | Progress bar during schema introspection. List tables as they are discovered. |
| **Connection Saved** | Redirect to Query Workspace. Connection appears in sidebar. |
| **Sample Dataset** | One-click load of an e-commerce sample dataset (DuckDB). Lets users try Cortex without their own data. |

### Accessibility

- All form fields have visible labels (not just placeholder text)
- Tab order follows visual layout (top to bottom, left to right)
- Error messages associated with fields via `aria-describedby`
- Color-blind safe status indicators (icon shape changes in addition to color)
- Focus ring on all interactive elements (indigo outline, 2px)

---

## Screen 2: Query Workspace

**Route**: `/query` (default screen after onboarding)

**Purpose**: The primary screen. Where analysts spend 80% of their time. Natural language input at the top, SQL preview, results table, and visualization below.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  +--------------------------------------------------+   |
|         |  | [sparkle] Ask your data anything...       [Enter] |   |
|         |  +--------------------------------------------------+   |
|         |                                                         |
|         |  +--------------------------------------------------+   |
|         |  | SQL Preview (collapsible)                 [Copy] |   |
|         |  | SELECT region, SUM(revenue) as total_rev,        |   |
|         |  |   SUM(revenue) - LAG(SUM(revenue)) OVER          |   |
|         |  |   (ORDER BY quarter) as change                   |   |
|         |  | FROM orders                                      |   |
|         |  | WHERE date >= '2024-10-01'                        |   |
|         |  | GROUP BY region                                  |   |
|         |  | ORDER BY total_rev DESC                          |   |
|         |  +--------------------------------------------------+   |
|         |                                                         |
|         |  +--------------------------------------------------+   |
|         |  | [Table] [Chart] [Insights]          [Export v]    |   |
|         |  |                                     [Pin to Dash] |   |
|         |  |  +--------------------------------------------+  |   |
|         |  |  |                                            |  |   |
|         |  |  |         VISUALIZATION / TABLE              |  |   |
|         |  |  |                                            |  |   |
|         |  |  |    [Bar chart showing revenue by region]   |  |   |
|         |  |  |                                            |  |   |
|         |  |  |                                            |  |   |
|         |  |  +--------------------------------------------+  |   |
|         |  +--------------------------------------------------+   |
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Query Input Bar** | Large text input at the top. Placeholder: "Ask your data anything..." AI sparkle icon on the left. Enter to submit. Shift+Enter for multiline. Auto-suggest previous queries as you type. |
| **SQL Preview Panel** | Collapsible panel below the query bar. Syntax-highlighted SQL (JetBrains Mono font). Copy button. Edit toggle (advanced users can modify SQL before running). Read-only by default. |
| **Results Tab Bar** | Three tabs: Table, Chart, Insights. Table shows raw results. Chart shows AI-recommended visualization. Insights shows AI-generated bullet points. |
| **Results Table** | TanStack Table with column sorting (click header), filtering (funnel icon per column), pagination (25/50/100 rows per page), virtual scrolling for large result sets. |
| **Chart Panel** | Recharts/D3 visualization. Chart type selector (bar, line, pie, scatter, etc.). Hover tooltips. Responsive sizing. |
| **Insights Panel** | 2-4 AI-generated bullet points summarizing key findings. E.g., "West region leads with $1.2M revenue, up 23% YoY." |
| **Export Dropdown** | Export as CSV (data), PNG (chart), PDF (report with chart + table + query). |
| **Pin to Dashboard** | Select a dashboard to pin this query result as a tile. |
| **Thumbs Up/Down** | Quick feedback on query accuracy. Thumbs down opens a "What went wrong?" dialog to improve future queries. |

### States

| State | Behavior |
|-------|----------|
| **Empty** | Query bar with placeholder text. Below: "Try asking..." with 3-4 example queries as clickable chips. |
| **Loading** | Query bar disabled. Skeleton loader in results area. "Generating SQL..." then "Running query..." status messages. |
| **Results Displayed** | Table tab active by default. Switch to Chart tab to see visualization. Smooth transition animation. |
| **No Results** | "No results found" message. Suggestions: "Try broadening the date range" or "Check filter values." |
| **Error** | Red error banner with the error message. "Retry with fix" button (sends error back to AI for correction). |
| **Follow-up Mode** | After a query, the bar shows context: "Following up on: revenue by region..." User types the follow-up. |
| **Large Result Set** | Warning: "Query returned 150,000 rows. Showing first 1,000. Export to CSV for full results." |

---

## Screen 3: Dashboard Builder

**Route**: `/dashboards/:id`

**Purpose**: Grid-based dashboard with pinned query tiles. Each tile shows a chart or KPI from a saved query.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Dashboard: Weekly KPIs          [Edit] [Share] [More]  |
|         |                                                         |
|         |  +----------------+ +----------------+ +--------------+ |
|         |  | MRR            | | Active Users   | | Churn Rate   | |
|         |  |                | |                | |              | |
|         |  | $142,500       | | 3,847          | | 3.2%         | |
|         |  | +12% vs last mo| | -5% vs last mo | | -0.3pp      | |
|         |  +----------------+ +----------------+ +--------------+ |
|         |                                                         |
|         |  +----------------------------------+ +----------------+ |
|         |  | Revenue by Region                | | Top Products   | |
|         |  |                                  | |                | |
|         |  | [Grouped bar chart]              | | 1. Widget Pro  | |
|         |  |                                  | | 2. DataSync    | |
|         |  |                                  | | 3. CloudKit    | |
|         |  |                                  | | 4. Automate    | |
|         |  +----------------------------------+ +----------------+ |
|         |                                                         |
|         |  +---------------------------------------------------+  |
|         |  | Monthly Revenue Trend                              |  |
|         |  |                                                   |  |
|         |  | [Line chart with 12-month trend]                  |  |
|         |  |                                                   |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Dashboard Header** | Dashboard name (editable inline). Edit mode toggle. Share button. More menu (duplicate, delete, export PDF). |
| **Tile Grid** | react-grid-layout. Drag to reposition. Drag corner to resize. Snap-to-grid (12-column grid). |
| **KPI Tile** | Big number with label, value, comparison (vs last period). Compact format for dashboard use. |
| **Chart Tile** | Embedded chart from a pinned query. Responsive to tile size. |
| **Table Tile** | Compact data table. Scrollable within tile bounds. |
| **Tile Actions** | Hover to reveal: Open in Workspace, Refresh, Remove, Resize. |
| **Add Tile Button** | "+" button in empty grid space. Opens query picker (search saved queries) or "New Query" option. |
| **Refresh All** | Button in header. Re-runs all tile queries with current data. Shows progress for each tile. |
| **Edit Mode** | Toggle edit mode to rearrange tiles. Tiles show drag handles and resize grips. Exit edit mode to lock layout. |

### States

| State | Behavior |
|-------|----------|
| **Empty Dashboard** | "Add your first tile" prompt with illustration. Quick-add buttons for common KPIs. |
| **Loading** | Each tile shows individual loading state (shimmer placeholder). Non-blocking -- tiles load independently. |
| **Edit Mode** | Tiles show blue dashed borders and drag handles. Grid guidelines visible. |
| **Shared Dashboard** | "Shared" badge in header. Viewer badge for non-editors. Comments icon with count. |
| **Refreshing** | Each tile shows a subtle spinning indicator. Completed tiles update in place. |

---

## Screen 4: Schema Explorer

**Route**: `/schema`

**Purpose**: Browse the connected database schema. Understand what data is available. Reference table and column names.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Schema Explorer          [Refresh Schema]  [Search]    |
|         |                                                         |
|         |  Connection: [prod-db v]                                |
|         |                                                         |
|         |  +-------------------+  +------------------------------+|
|         |  | TABLES            |  | TABLE: orders                ||
|         |  |                   |  |                              ||
|         |  | [search tables..] |  | 245,000 rows | 18 columns   ||
|         |  |                   |  |                              ||
|         |  | > users (12)      |  | COLUMNS                     ||
|         |  | > orders (18)  <--+  | +--------+--------+-------+ ||
|         |  | > products (14)   |  | | Name   | Type   | Key   | ||
|         |  | > subscriptions   |  | +--------+--------+-------+ ||
|         |  | > payments (8)    |  | | id     | uuid   | PK    | ||
|         |  | > events (22)     |  | | user_id| uuid   | FK->  | ||
|         |  | > categories (5)  |  | | amount | decimal|       | ||
|         |  | > regions (4)     |  | | status | varchar|       | ||
|         |  | > campaigns (15)  |  | | created| timestp|       | ||
|         |  | > invoices (11)   |  | +--------+--------+-------+ ||
|         |  |                   |  |                              ||
|         |  |                   |  | RELATIONSHIPS                ||
|         |  |                   |  | user_id -> users.id          ||
|         |  |                   |  | product_id -> products.id    ||
|         |  |                   |  |                              ||
|         |  |                   |  | SAMPLE DATA        [Load]   ||
|         |  |                   |  | (Click Load to preview)     ||
|         |  +-------------------+  +------------------------------+|
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Connection Selector** | Dropdown to switch between connected data sources |
| **Table List** | Left panel. All tables with column count. Click to select. Search/filter at top. Grouped by schema if multiple schemas. |
| **Table Detail** | Right panel. Table name, row count, column count. List of columns with name, type, key status (PK/FK), nullable indicator. |
| **Relationships** | Foreign key relationships with clickable links to referenced tables |
| **Sample Data** | "Load" button to preview first 100 rows in a data table. Expandable panel at the bottom. |
| **Copy Column** | Click any column name to copy `schema.table.column` to clipboard. Toast notification on copy. |
| **Refresh Schema** | Re-introspect the database schema. Shows diff: "2 new tables found, 1 column added to orders." |

### States

| State | Behavior |
|-------|----------|
| **No Connection** | "Connect a data source to explore its schema" with link to connection setup. |
| **Loading Schema** | Skeleton loader on table list. Progress indicator if schema is large. |
| **Schema Loaded** | Table list populated. First table auto-selected. |
| **Sample Data Loading** | Shimmer placeholder in data preview area while loading rows. |
| **Schema Refreshing** | Progress bar at top. Diff summary shown after refresh completes. |

---

## Screen 5: Query History

**Route**: `/history`

**Purpose**: Searchable, filterable list of all past queries. Find, re-run, bookmark, and organize queries.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Query History                          [Search...]     |
|         |                                                         |
|         |  [All] [Bookmarked] [Tagged: revenue] [Tagged: churn]   |
|         |                                                         |
|         |  +---------------------------------------------------+  |
|         |  | [star] "Revenue by region last quarter"            |  |
|         |  | prod-db | Bar chart | 2 hours ago       [Re-run] |  |
|         |  +---------------------------------------------------+  |
|         |  | [star] "Top 10 customers by LTV"                  |  |
|         |  | prod-db | Table | Yesterday              [Re-run] |  |
|         |  +---------------------------------------------------+  |
|         |  |        "Monthly active users trend"               |  |
|         |  | prod-db | Line chart | 3 days ago        [Re-run] |  |
|         |  +---------------------------------------------------+  |
|         |  |        "Churn rate by cohort"                     |  |
|         |  | prod-db | Grouped bar | Last week        [Re-run] |  |
|         |  +---------------------------------------------------+  |
|         |  |        "Average order value this month"           |  |
|         |  | prod-db | Big number | Last week         [Re-run] |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  Showing 5 of 47 queries         [Load More]            |
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Search Bar** | Full-text search across NL input and generated SQL. Real-time filtering. |
| **Filter Chips** | All, Bookmarked, and user-defined tag filters. Click to toggle. Multiple tags selectable. |
| **Query Card** | NL input text (primary), connection name, chart type icon, relative timestamp. Star icon for bookmarks. |
| **Re-run Button** | One-click re-run with current data. Opens in Query Workspace with results. |
| **Card Actions** | Hover reveals: Bookmark/unbookmark, Add tag, Duplicate & edit, Delete, View SQL, Open in Workspace. |
| **Pagination** | Infinite scroll or "Load More" button. Most recent queries first. |

### States

| State | Behavior |
|-------|----------|
| **Empty** | "No queries yet. Ask your first question!" with link to Query Workspace. |
| **Filtered (no results)** | "No queries match your search. Try different keywords." |
| **Bookmarked view** | Only starred queries shown. Empty state: "No bookmarked queries. Star important queries to find them quickly." |

---

## Screen 6: Report Builder

**Route**: `/reports/:id` or `/reports/new`

**Purpose**: Configure scheduled reports. Select a dashboard, set a schedule, choose recipients and format.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Scheduled Report: Weekly Pipeline                      |
|         |                                                         |
|         |  Source Dashboard:  [Sales Pipeline Dashboard  v]        |
|         |                                                         |
|         |  Tiles to include:                                      |
|         |  [x] Pipeline value by stage                            |
|         |  [x] New opportunities this week                        |
|         |  [x] Win rate trend                                     |
|         |  [ ] Rep leaderboard                                    |
|         |                                                         |
|         |  Schedule:                                               |
|         |  Frequency:  [Weekly  v]                                 |
|         |  Day:        [Monday  v]                                 |
|         |  Time:       [8:00 AM v]  Timezone: [US/Eastern v]       |
|         |                                                         |
|         |  Format:     [PDF  v]  (PDF report with charts and data) |
|         |                                                         |
|         |  Recipients:                                             |
|         |  [john@company.com  ] [x]                                |
|         |  [sarah@company.com ] [x]                                |
|         |  [+ Add recipient    ]                                   |
|         |                                                         |
|         |  [Send Test Report]              [Cancel]  [Save & Activate]|
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Dashboard Selector** | Dropdown of all dashboards. Preview thumbnail shown on selection. |
| **Tile Checkboxes** | Select which dashboard tiles to include in the report. Select all/none toggle. |
| **Schedule Config** | Frequency (daily/weekly/monthly/custom cron), day of week, time, timezone. |
| **Format Selector** | PDF (charts + tables formatted for email) or CSV (raw data, attached). |
| **Recipient List** | Email input with add/remove. Validate email format. Show team members as suggestions. |
| **Send Test** | Send a one-time test report immediately to preview the output. |
| **Report History** | Below the form: list of previous sends with delivery status (sent/failed/opened). |

---

## Screen 7: Settings

**Route**: `/settings` with sub-routes: `/settings/connections`, `/settings/team`, `/settings/preferences`

### Settings > Connections

```
+-------------------------------------------------------------------+
| SIDEBAR |  Settings > Connections                                 |
|         |                                                         |
|         |  +---------------------------------------------------+  |
|         |  | [PostgreSQL icon]  prod-db                         |  |
|         |  | db.example.com:5432/production                     |  |
|         |  | Status: Connected (green dot)   [Test] [Edit] [x] |  |
|         |  +---------------------------------------------------+  |
|         |  +---------------------------------------------------+  |
|         |  | [CSV icon]  sales_data_2024.csv                   |  |
|         |  | 15,420 rows | Imported 2 days ago                 |  |
|         |  | Status: Loaded (green dot)      [Reload]     [x]  |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  [+ Add Connection]                                     |
|         |                                                         |
+-------------------------------------------------------------------+
```

### Settings > Team (Team/Enterprise tiers)

```
+-------------------------------------------------------------------+
| SIDEBAR |  Settings > Team                                        |
|         |                                                         |
|         |  Organization: Acme Corp                                |
|         |  Plan: Team ($59/seat/mo)    Seats: 8/10 used           |
|         |                                                         |
|         |  +---------------------------------------------------+  |
|         |  | Avatar  John Smith    john@acme.com    Admin   [...] |  |
|         |  | Avatar  Sarah Lee     sarah@acme.com   Editor  [...] |  |
|         |  | Avatar  Mike Chen     mike@acme.com    Viewer  [...] |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  [+ Invite Member]                                      |
|         |                                                         |
+-------------------------------------------------------------------+
```

### Settings > Preferences

```
+-------------------------------------------------------------------+
| SIDEBAR |  Settings > Preferences                                 |
|         |                                                         |
|         |  Appearance                                              |
|         |  Theme:          [Dark v]  (Dark / Light / System)       |
|         |  Density:        [Comfortable v]  (Compact / Comfortable)|
|         |                                                         |
|         |  Query Defaults                                          |
|         |  Default row limit: [1000  ]                             |
|         |  Show SQL preview:  [Always v]  (Always / Collapsed)     |
|         |  Auto-visualize:    [On v]                                |
|         |                                                         |
|         |  AI Settings                                             |
|         |  OpenAI API Key:    [sk-...****      ] [Update]          |
|         |  Model preference:  [Auto v]  (Auto / GPT-4o / Mini)     |
|         |                                                         |
|         |  Fiscal Calendar                                         |
|         |  Fiscal year start: [January v]                          |
|         |                                                         |
|         |  Data                                                    |
|         |  DuckDB memory limit: [4 GB v]                           |
|         |  Cache query results: [On v]                              |
|         |                                                         |
|         |  Export                                                   |
|         |  Company name for reports: [Acme Corp           ]        |
|         |  Company logo:             [Upload Logo]                  |
|         |                                                         |
+-------------------------------------------------------------------+
```

---

## Screen 8: Account / Subscription

**Route**: `/account`

**Purpose**: Manage account details, subscription, and billing.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Account                                                |
|         |                                                         |
|         |  Profile                                                 |
|         |  Name:     [John Smith                    ]              |
|         |  Email:    john@acme.com (verified)                      |
|         |  Avatar:   [Upload]                                      |
|         |                                                         |
|         |  Subscription                                            |
|         |  +---------------------------------------------------+  |
|         |  | Current Plan: Team                                |  |
|         |  | $59/seat/month x 8 seats = $472/month              |  |
|         |  | Next billing date: Feb 15, 2025                    |  |
|         |  | Payment method: Visa ending in 4242                |  |
|         |  |                                                   |  |
|         |  | [Change Plan]  [Manage Payment]  [View Invoices]   |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  Usage This Month                                        |
|         |  Queries:     847 / unlimited                            |
|         |  Connections: 4 / unlimited                              |
|         |  Dashboards:  6 / unlimited                              |
|         |  Team seats:  8 / 10                                     |
|         |                                                         |
|         |  Danger Zone                                              |
|         |  [Delete Account]                                        |
|         |                                                         |
+-------------------------------------------------------------------+
```

### States

| State | Behavior |
|-------|----------|
| **Free Tier** | Show usage bars (47/50 queries, 1/1 connection). "Upgrade" CTA prominent but not aggressive. |
| **Trial** | Show days remaining. "Your trial ends in 7 days. [Choose a Plan]" banner at top. |
| **Paid** | Show current plan, billing info, usage stats. |
| **Past Due** | Red warning banner. "Payment failed. Update your payment method to avoid service interruption." |

---

## Screen 9: Alert Manager

**Route**: `/alerts`

**Purpose**: View, create, and manage metric alerts.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Alerts                                  [+ New Alert]  |
|         |                                                         |
|         |  Active Alerts                                           |
|         |  +---------------------------------------------------+  |
|         |  | [bell] Churn rate exceeds 5%           [Active]    |  |
|         |  | Checks: Every 6 hours | Last checked: 2 hours ago  |  |
|         |  | Current value: 3.2% (OK)              [Edit] [x]  |  |
|         |  +---------------------------------------------------+  |
|         |  +---------------------------------------------------+  |
|         |  | [bell!] DAU drops > 20% from 7-day avg [TRIGGERED] |  |
|         |  | Checks: Hourly | Triggered: 45 min ago             |  |
|         |  | Current: 2,100 (avg: 3,200, -34%)   [Snooze] [x]  |  |
|         |  +---------------------------------------------------+  |
|         |  +---------------------------------------------------+  |
|         |  | [bell] MRR drops below $100K            [Active]   |  |
|         |  | Checks: Daily | Last checked: 12 hours ago         |  |
|         |  | Current value: $142,500 (OK)          [Edit] [x]  |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  Alert History                                           |
|         |  +---------------------------------------------------+  |
|         |  | Feb 3, 2025 - DAU alert triggered (2,100, -34%)    |  |
|         |  | Jan 28, 2025 - Churn alert triggered (5.3%)        |  |
|         |  | Jan 15, 2025 - MRR alert triggered ($98,200)       |  |
|         |  +---------------------------------------------------+  |
+-------------------------------------------------------------------+
```

### New Alert Dialog

```
+-------------------------------------------+
|  Create New Alert                         |
|                                           |
|  Describe your alert in plain English:    |
|  [Alert me when monthly churn > 5%    ]   |
|                                           |
|  -- OR configure manually --              |
|                                           |
|  Metric Query: [Select saved query v]     |
|  Condition:    [Greater than       v]     |
|  Threshold:    [5                   ] %   |
|  Check Every:  [6 hours            v]     |
|                                           |
|  Notify via:                              |
|  [x] Email   [john@acme.com]              |
|  [ ] Slack   [Configure]                  |
|  [x] Desktop notification                 |
|                                           |
|           [Cancel]  [Create Alert]        |
+-------------------------------------------+
```

---

## Screen 10: Data Preview

**Route**: `/preview/:connectionId/:tableName`

**Purpose**: View sample data from any connected table. Quick reference for data shapes, values, and quality.

### Layout

```
+-------------------------------------------------------------------+
| SIDEBAR |  Data Preview: orders                                   |
|         |  Connection: prod-db | 245,000 rows | 18 columns        |
|         |                                                         |
|         |  +---------------------------------------------------+  |
|         |  | Column Stats                                      |  |
|         |  | id: uuid, 0% null, 245K unique                    |  |
|         |  | user_id: uuid, 0.1% null, 12K unique              |  |
|         |  | amount: decimal, 0% null, min:$1, max:$9,999      |  |
|         |  | status: varchar, 0% null, 4 values (pending,      |  |
|         |  |         completed, refunded, cancelled)            |  |
|         |  | created_at: timestamp, 0% null, range: 2020-2024  |  |
|         |  +---------------------------------------------------+  |
|         |                                                         |
|         |  Sample Data (first 100 rows)                            |
|         |  +------+--------+---------+--------+-----------+       |
|         |  | id   | user_id| amount  | status | created_at|       |
|         |  +------+--------+---------+--------+-----------+       |
|         |  | a1b2 | c3d4   | 149.99  | compl  | 2024-12-01|       |
|         |  | e5f6 | g7h8   | 299.00  | pend   | 2024-12-01|       |
|         |  | i9j0 | c3d4   | 49.99   | compl  | 2024-11-30|       |
|         |  +------+--------+---------+--------+-----------+       |
|         |                                                         |
|         |  [Query this table]  [View in Schema Explorer]          |
+-------------------------------------------------------------------+
```

### UI Elements

| Element | Detail |
|---------|--------|
| **Column Statistics** | For each column: data type, null percentage, unique count, min/max (numeric), distinct values (categorical, if < 20 values) |
| **Sample Table** | First 100 rows with sortable columns. Virtual scrolling if wide (many columns). |
| **Quick Actions** | "Query this table" opens Query Workspace with context set to this table. "View in Schema Explorer" navigates to schema view. |
| **Value Distribution** | Click any categorical column to see a mini bar chart of value distribution (top 10 values). |

---

## Navigation Flow

```
Welcome / Setup ---> Query Workspace (default home)
                          |
                          +---> Dashboard Builder
                          |         |
                          |         +---> Report Builder
                          |
                          +---> Schema Explorer
                          |         |
                          |         +---> Data Preview
                          |
                          +---> Query History
                          |
                          +---> Alert Manager
                          |
                          +---> Settings
                          |       |
                          |       +---> Connections
                          |       +---> Team
                          |       +---> Preferences
                          |
                          +---> Account / Subscription
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette (search everything) |
| `Cmd+Enter` | Execute query |
| `Cmd+S` | Save/bookmark current query |
| `Cmd+E` | Export current results |
| `Cmd+D` | Pin to dashboard |
| `Cmd+1` | Go to Query Workspace |
| `Cmd+2` | Go to Dashboards |
| `Cmd+3` | Go to Schema Explorer |
| `Cmd+4` | Go to History |
| `Cmd+/` | Toggle SQL preview panel |
| `Cmd+,` | Open Settings |
| `Esc` | Close modal / cancel action |

---

## Accessibility Standards

| Standard | Implementation |
|----------|----------------|
| **WCAG 2.1 AA** | Target compliance level for all screens |
| **Keyboard Navigation** | Full keyboard access. Tab order follows visual layout. Skip-to-content link. |
| **Screen Reader** | ARIA labels on all interactive elements. Live regions for query status updates. |
| **Color Contrast** | Minimum 4.5:1 for body text, 3:1 for large text. Verified in both dark and light themes. |
| **Focus Indicators** | Visible focus ring (2px indigo outline) on all focusable elements. |
| **Motion** | Respect `prefers-reduced-motion`. Disable chart animations and transitions when set. |
| **Text Scaling** | UI adapts to system font size settings up to 200% zoom. |
| **Error Identification** | Errors identified by icon shape + color + text (not color alone). |
| **Data Tables** | Proper `<table>`, `<th>`, `<td>` semantics. Column headers associated with cells. Sortable columns announced to screen readers. |

---

*Every screen serves one purpose: reduce the distance between a question and an answer.*
