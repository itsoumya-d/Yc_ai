# LegalForge -- Screen Specifications

## Navigation Architecture

```
+------------------------------------------------------------------+
|  Sidebar (fixed, 240px)          |  Main Content Area             |
|  +----------------------------+  |  +---------------------------+ |
|  | LegalForge Logo            |  |  | Top Bar                   | |
|  |                            |  |  | (Search, Notifications,   | |
|  | Dashboard                  |  |  |  User Menu)               | |
|  | Contracts                  |  |  +---------------------------+ |
|  |   - All Contracts          |  |  |                           | |
|  |   - Drafts                 |  |  |  Page Content             | |
|  |   - In Review              |  |  |                           | |
|  |   - In Negotiation         |  |  |                           | |
|  |   - Executed               |  |  |                           | |
|  |   - Expired                |  |  |                           | |
|  | Templates                  |  |  |                           | |
|  | Clause Library             |  |  |                           | |
|  | Obligations                |  |  |                           | |
|  | Analytics                  |  |  |                           | |
|  | Team                       |  |  |                           | |
|  |                            |  |  |                           | |
|  | --- bottom ---             |  |  |                           | |
|  | Settings                   |  |  |                           | |
|  | Help                       |  |  |                           | |
|  +----------------------------+  |  +---------------------------+ |
+------------------------------------------------------------------+
```

**Navigation Behavior:**
- Sidebar is collapsible to icon-only mode (56px) for maximum editor space
- Active page highlighted with navy background and gold left border
- Sidebar persists across all screens except full-screen editor mode
- Keyboard shortcut `Cmd/Ctrl + \` toggles sidebar
- Badge counts on sidebar items: pending reviews, overdue obligations, unread notifications

---

## Screen 1: Login

**Purpose:** Authentication entry point for the application.

**Layout:**
```
+------------------------------------------------------------------+
|                                                                    |
|                    [LegalForge Logo + Wordmark]                   |
|                    "AI-Powered Contract Intelligence"             |
|                                                                    |
|                    +----------------------------+                 |
|                    | Email Address               |                 |
|                    +----------------------------+                 |
|                    +----------------------------+                 |
|                    | Password                    |                 |
|                    +----------------------------+                 |
|                    [        Sign In            ]                  |
|                                                                    |
|                    ---- or continue with ----                     |
|                    [ SSO / SAML ]  [ Google ]                     |
|                                                                    |
|                    Forgot password?                                |
|                                                                    |
+------------------------------------------------------------------+
```

**UI Elements:**
- Centered login card on warm white (#FAFAF8) background
- Deep navy (#1E3A5F) logo and heading
- Email field with validation (must match organization domain for SSO accounts)
- Password field with show/hide toggle
- Primary sign-in button (navy background, gold text on hover)
- SSO/SAML button for enterprise customers
- Google OAuth button for non-SSO organizations
- "Forgot password" link triggers Supabase password reset email
- MFA prompt screen appears after initial auth for accounts with MFA enabled

**States:**
- Default: empty form
- Loading: button shows spinner, fields disabled
- Error: red border on invalid field, error message below ("Invalid email or password")
- SSO redirect: brief loading screen while redirecting to identity provider
- MFA: 6-digit code input field with 30-second countdown

**Accessibility:**
- Tab order: email -> password -> sign in -> SSO -> Google -> forgot password
- All fields have visible labels (not just placeholders)
- Error messages associated with fields via aria-describedby
- Focus trap within the login card

---

## Screen 2: Dashboard

**Purpose:** Central command center showing contract pipeline, pending work, and key metrics at a glance.

**Layout:**
```
+------------------------------------------------------------------+
| Top Bar: [Search (Cmd+K)]  [+ New Contract]  [Bell] [Avatar]     |
+------------------------------------------------------------------+
| Metrics Row                                                        |
| [Active Contracts: 47] [Pending Review: 12] [Avg Cycle: 4.2d]   |
| [Risk Score Avg: 34]   [Due This Week: 5]   [Executed MTD: 23]  |
+------------------------------------------------------------------+
| Left Column (60%)              | Right Column (40%)              |
| +----------------------------+ | +----------------------------+ |
| | Contract Pipeline          | | | Pending Reviews            | |
| | [Draft] [Review] [Negot.] | | | - Acme MSA (High Risk)     | |
| | [Exec.] [Expired]         | | | - GlobalCo NDA (Med Risk)  | |
| | Kanban/list view toggle    | | | - TechVend SaaS (Low Risk) | |
| |                            | | |   ... 9 more               | |
| | [Contract cards with       | | +----------------------------+ |
| |  status, counterparty,    | | | Upcoming Deadlines         | |
| |  risk score badge,        | | | - Feb 15: AWS renewal      | |
| |  assigned user avatar,    | | | - Feb 22: Acme payment     | |
| |  days in stage]           | | | - Mar 01: Q1 report due    | |
| |                            | | |   ... 2 more               | |
| +----------------------------+ | +----------------------------+ |
| +----------------------------+ | | Recent Activity            | |
| | Quick Actions              | | | - You reviewed Acme MSA    | |
| | [Draft New] [Import DOCX] | | | - Sarah approved GlobalCo  | |
| | [Review Contract] [Search]| | | - AI flagged 3 risks in... | |
| +----------------------------+ | +----------------------------+ |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Metrics Row**: Six stat cards with icon, label, value, and sparkline trend indicator. Clickable to navigate to filtered contract list
- **Contract Pipeline**: Kanban board (default) or list view toggle. Cards show: contract title, counterparty, type badge, risk score pill, assigned avatar, days-in-stage counter. Drag-and-drop to change status
- **Pending Reviews**: List of contracts assigned to current user for review. Each item shows: title, counterparty, risk level badge (color-coded), due date. Click navigates to review mode
- **Upcoming Deadlines**: Chronological list of next 5 deadlines. Each shows: date, description, contract name. Overdue items in red
- **Recent Activity**: Feed of latest actions across the team. Shows: user avatar, action description, timestamp
- **Quick Actions**: Four large icon buttons for common tasks

**States:**
- Empty state (new organization): Welcome wizard with setup steps (import first template, create clause library, import existing contracts)
- Loading: Skeleton loaders for each section
- Filtered: When clicking a metric, pipeline filters to show only matching contracts
- Notification badge: Red dot on bell icon with unread count

**Accessibility:**
- All metrics readable by screen readers with full labels
- Kanban cards have role="listitem" within role="list" for each column
- Keyboard navigation between cards with arrow keys
- Skip links to jump between dashboard sections

---

## Screen 3: Contract Editor

**Purpose:** The primary workspace for drafting, editing, and reviewing contracts. Rich text editor with AI sidebar.

**Layout:**
```
+------------------------------------------------------------------+
| Editor Toolbar                                                     |
| [B] [I] [U] [H1-H4] [List] [Table] [Link] [Comment] [Track On] |
| [Clause Insert] [AI Draft] [Risk Scan] | [Export] [Version: v3] |
+------------------------------------------------------------------+
| Editor Area (65%)                  | AI Sidebar (35%)            |
| +-------------------------------+ | +-------------------------+ |
| | CONTRACT TITLE                 | | | AI Assistant            | |
| |                                | | | [Draft] [Review] [Ask]  | |
| | Section 1. DEFINITIONS         | | |                         | |
| | 1.1 "Agreement" means...       | | | [Tab: Suggestions]      | |
| | 1.2 "Confidential Information" | | | Section 4.2 - HIGH RISK | |
| |     means...                   | | | Indemnification clause   | |
| |                                | | | uncapped. Suggest:      | |
| | Section 2. TERM                | | | "...limited to 2x       | |
| | This Agreement commences on... | | |  contract value..."     | |
| |                                | | | [Apply] [Dismiss]       | |
| | Section 3. SCOPE OF SERVICES   | | |                         | |
| | [AI-generated: highlighted]    | | | Section 7.1 - MEDIUM    | |
| |                                | | | Termination notice is   | |
| | Section 4. INDEMNIFICATION     | | | 15 days. Industry       | |
| | [Risk flagged: red underline]  | | | standard is 30 days.    | |
| | 4.1 Party A shall indemnify... | | | [Apply] [Dismiss]       | |
| |                                | | |                         | |
| | Section 5. LIMITATION OF       | | | [Tab: Clause Library]   | |
| | LIABILITY                      | | | Search clauses...       | |
| | [Track change: strikethrough]  | | | [Indemnification]       | |
| | [Track change: insertion]      | | | [Limitation of Liab.]   | |
| |                                | | | [Confidentiality]       | |
| +-------------------------------+ | +-------------------------+ |
+------------------------------------------------------------------+
| Status Bar: Word Count: 4,230 | Risk Score: 67 (Medium) | Auto-saved |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Editor Toolbar**: Standard rich text controls plus legal-specific tools. Track changes toggle, clause insertion, AI tools. Grouped logically with dividers
- **Editor Area**: TipTap editor rendering contract content. Warm white background (#FAFAF8) with professional serif font (Source Serif Pro). Section numbering, defined term highlighting, risk underlines, track change marks
- **AI Sidebar**: Collapsible panel with three tabs:
  - **Suggestions**: AI-generated risk flags and improvement suggestions. Each suggestion shows: section reference, severity badge, explanation, suggested alternative, Apply/Dismiss buttons
  - **Clause Library**: Searchable clause library with drag-to-insert or click-to-insert functionality
  - **Ask**: Natural language query input ("Is there a non-compete in this contract?", "Summarize the payment terms")
- **Status Bar**: Word count, overall risk score with color indicator, save status (auto-saved / saving / offline)

**States:**
- Drafting mode: Clean editor, AI Sidebar in Draft tab, no risk highlights
- Review mode: Risk highlights active, AI Sidebar in Suggestions tab with findings
- Comparison mode: Side-by-side with previous version (see Screen 7)
- Full-screen mode: Sidebar and app sidebar hidden for focused editing (F11 or Cmd+Shift+F)
- Offline mode: Banner showing "Working offline -- changes will sync when connected"
- AI processing: Loading spinner in sidebar, editor remains editable

**Accessibility:**
- Editor supports screen reader announcements for formatting changes
- Track changes readable via aria-label ("Deletion by Sarah: [deleted text]")
- AI suggestions navigable via keyboard with Ctrl+Alt+arrow keys
- High contrast mode for risk highlights
- Focus management between editor and sidebar via keyboard shortcut (Ctrl+.)

---

## Screen 4: Template Library

**Purpose:** Browse, create, and manage organizational contract templates.

**Layout:**
```
+------------------------------------------------------------------+
| [Search Templates...]  [+ Create Template]  [Filter: Type v]     |
+------------------------------------------------------------------+
| Grid View (default) / List View toggle                            |
| +------------------+ +------------------+ +------------------+   |
| | [NDA Icon]       | | [MSA Icon]       | | [SaaS Icon]      |  |
| | Mutual NDA       | | Master Service   | | SaaS Agreement   |  |
| | Last updated:    | | Agreement        | | Last updated:    |  |
| | Jan 15, 2026     | | Last updated:    | | Dec 2, 2025      |  |
| | Used: 142 times  | | Feb 1, 2026      | | Used: 67 times   |  |
| | Status: Approved | | Used: 89 times   | | Status: Approved |  |
| | [Use] [Edit]     | | Status: Approved | | [Use] [Edit]     |  |
| +------------------+ | [Use] [Edit]     | +------------------+   |
|                      +------------------+                         |
| +------------------+ +------------------+ +------------------+   |
| | [Employment]     | | [Consulting]     | | [DPA Icon]       |  |
| | Employment Agmt  | | Consulting Agmt  | | Data Processing  |  |
| | Last updated:    | | Last updated:    | | Agreement        |  |
| | Nov 20, 2025     | | Jan 8, 2026      | | Last updated:    |  |
| | Used: 34 times   | | Used: 51 times   | | Feb 3, 2026      |  |
| | Status: Approved | | Status: Draft    | | Used: 28 times   |  |
| | [Use] [Edit]     | | [Use] [Edit]     | | Status: Approved |  |
| +------------------+ +------------------+ | [Use] [Edit]     |  |
|                                            +------------------+   |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Search bar**: Full-text search across template names and content
- **Create Template button**: Opens new template editor (same editor as contracts but with variable field insertion tools)
- **Filter dropdown**: Filter by type (NDA, MSA, SaaS, Employment, etc.), status (Draft, Approved, Deprecated)
- **Template cards**: Icon (per contract type), template name, last updated date, usage count, approval status badge, action buttons
- **Use button**: Creates a new contract from this template, opens contract editor with template pre-populated
- **Edit button**: Opens template in editor mode with variable field tools

**States:**
- Empty state: "No templates yet. Create your first template or import from DOCX."
- Filtered: Applied filter shown as removable chip above the grid
- Template detail modal: Click card to see full template preview, version history, usage analytics
- Deprecated template: Grayed out card with "Deprecated" badge, "Use" button disabled

---

## Screen 5: Clause Library

**Purpose:** Browse, search, and manage pre-approved clauses organized by category.

**Layout:**
```
+------------------------------------------------------------------+
| [Search Clauses...]  [+ Add Clause]  [Import Clauses]            |
+------------------------------------------------------------------+
| Categories (left, 220px)      | Clause List (right)              |
| +---------------------------+ | +------------------------------+ |
| | All Clauses (342)         | | | Indemnification - Standard   | |
| | Indemnification (28)      | | | Risk: Low | Approved          | |
| | Limitation of Liability   | | | "Each party shall indemnify  | |
| |   (24)                    | | |  and hold harmless the       | |
| | Confidentiality (31)      | | |  other party from..."        | |
| | IP Assignment (18)        | | | Used: 89 times               | |
| | Termination (22)          | | | [Insert] [Edit] [Copy]       | |
| | Governing Law (15)        | | +------------------------------+ |
| | Force Majeure (12)        | | | Indemnification - Capped     | |
| | Data Protection (19)      | | | Risk: Medium | Approved       | |
| | Warranties (16)           | | | "Party A shall indemnify     | |
| | Non-Compete (14)          | | |  Party B, provided that      | |
| | Non-Solicitation (11)     | | |  aggregate liability..."     | |
| | Dispute Resolution (13)   | | | Used: 45 times               | |
| | Insurance (9)             | | | [Insert] [Edit] [Copy]       | |
| | Audit Rights (8)          | | +------------------------------+ |
| | Assignment (10)           | | | Indemnification - Broad      | |
| | Notices (7)               | | | Risk: High | Under Review     | |
| | Other (85)                | | | "Party A shall indemnify,    | |
| +---------------------------+ | |  defend, and hold harmless   | |
|                               | |  Party B from any and all..."| |
|                               | | Used: 12 times               | |
|                               | | [Insert] [Edit] [Copy]       | |
|                               | +------------------------------+ |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Category sidebar**: Collapsible category tree with clause counts. Click to filter the clause list
- **Clause cards**: Title, risk level badge (green/amber/red), approval status pill, preview text (first 2 lines), usage count, action buttons
- **Insert button**: Inserts clause at cursor position in active contract editor (button disabled when no contract is open)
- **Edit button**: Opens clause in editor for modification (creates new version)
- **Copy button**: Copies clause text to clipboard
- **Tags**: Below clause text, showing tags like "customer-friendly", "standard", "aggressive"
- **Version history**: Expandable section on each clause showing change history

**States:**
- Search active: category filter combined with text search, results highlighted
- Insert mode: When accessed from within the contract editor via sidebar, shows "Insert" prominently
- Standalone mode: When accessed from main navigation, "Insert" disabled with tooltip "Open a contract to insert clauses"
- Clause detail panel: Click clause title to expand full text, version history, and usage analytics

---

## Screen 6: Review Mode

**Purpose:** Structured workflow for reviewing incoming contracts with AI risk analysis, annotations, and approval actions.

**Layout:**
```
+------------------------------------------------------------------+
| Review Header                                                      |
| Contract: Acme Corp MSA v2  |  Assigned to: You  | Due: Feb 14   |
| [Approve] [Request Changes] [Reject] [Send to GC]                |
+------------------------------------------------------------------+
| Risk Summary Bar                                                   |
| Overall: 67/100 (Medium) | Critical: 2 | High: 5 | Med: 8 | Low: 12 |
+------------------------------------------------------------------+
| Contract (65%)                    | Review Panel (35%)            |
| +-------------------------------+ | +-------------------------+ |
| | [Full contract with risk       | | | Risk Findings           | |
| |  highlights]                   | | | [All] [Critical] [High] | |
| |                                | | | [Medium] [Low]          | |
| | Section 4.2 [RED HIGHLIGHT]    | | |                         | |
| | "Party A shall indemnify       | | | 1. S4.2 Indemnification | |
| |  Party B against any and all   | | |    CRITICAL             | |
| |  claims, damages, losses..."   | | |    Uncapped indemnity   | |
| |                                | | |    clause exposes to    | |
| | Section 7.1 [AMBER HIGHLIGHT]  | | |    unlimited liability. | |
| | "Either party may terminate    | | |    [View] [Fix]         | |
| |  with 15 days written          | | |                         | |
| |  notice..."                    | | | 2. S7.1 Termination     | |
| |                                | | |    HIGH                 | |
| | Section 9 [GREEN - OK]         | | |    15-day notice below  | |
| | "This Agreement shall be       | | |    industry standard    | |
| |  governed by the laws of..."   | | |    (30 days).           | |
| |                                | | |    [View] [Fix]         | |
| |                                | | |                         | |
| | [Comment anchors visible]      | | | Comments (3)            | |
| |                                | | | Approval Chain:         | |
| |                                | | | [x] Junior Review       | |
| |                                | | | [ ] Senior Review       | |
| |                                | | | [ ] GC Approval         | |
| +-------------------------------+ | +-------------------------+ |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Review Header**: Contract name, version, assigned reviewer, due date, action buttons
- **Risk Summary Bar**: Overall score with severity distribution. Clickable severity badges filter the findings panel
- **Contract Pane**: Full contract text with color-coded risk highlights. Click a highlight to jump to the corresponding finding in the review panel
- **Review Panel tabs**:
  - **Risk Findings**: Ordered list of AI-identified risks. Each finding has: section reference, severity badge, explanation, View (scrolls to clause) and Fix (applies AI suggestion) buttons
  - **Comments**: Threaded comment discussions anchored to specific text ranges
  - **Approval Chain**: Visual progress of the approval workflow with checkmarks
- **Action Buttons**: Approve (green), Request Changes (amber), Reject (red), Send to GC (navy). Each triggers confirmation dialog with optional comment

**States:**
- Pre-review: Contract loaded but AI analysis not yet run. "Run AI Review" button prominent
- Analyzing: Progress bar showing AI review in progress, sections highlighting as analysis completes
- Review complete: All findings loaded, summary bar populated
- Partially approved: Some approval chain steps complete, awaiting next reviewer
- Approved: Green banner, contract moves to "Executed" pipeline or e-signature flow

---

## Screen 7: Comparison View

**Purpose:** Side-by-side redline comparison between two contract versions.

**Layout:**
```
+------------------------------------------------------------------+
| Compare: [Version 1 (Original) v] <-> [Version 3 (Current) v]   |
| [Sync Scroll: On]  [Show Changes Only]  [Export Redline]         |
+------------------------------------------------------------------+
| Version 1 (Left, 50%)            | Version 3 (Right, 50%)        |
| +-------------------------------+ | +----------------------------+|
| | Section 4. INDEMNIFICATION     | | | Section 4. INDEMNIFICATION ||
| |                                | | |                            ||
| | 4.1 Party A shall indemnify   | | | 4.1 Party A shall indemni- ||
| | and hold harmless Party B     | | | fy and hold harmless Party ||
| | from any and all claims,      | | | B from any and all claims, ||
| | damages, and losses arising   | | | damages, and losses arising||
| | from this Agreement.          | | | from this Agreement,       ||
| |                                | | | [GREEN: provided that      ||
| |                                | | | aggregate liability shall  ||
| |                                | | | not exceed 2x the total    ||
| |                                | | | fees paid under this       ||
| |                                | | | Agreement.]                ||
| |                                | | |                            ||
| | 4.2 [RED: The indemnifying    | | | 4.2 [Removed in v3]        ||
| | party shall bear all costs    | | |                            ||
| | of defense...]               | | |                            ||
| +-------------------------------+ | +----------------------------+|
+------------------------------------------------------------------+
| Change Summary: 14 insertions, 6 deletions, 3 modifications      |
| [Previous Change] [Next Change] (3 of 23)                        |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Version selectors**: Dropdowns to pick any two versions for comparison
- **Sync scroll toggle**: When enabled, both panes scroll together. When disabled, independent scrolling
- **Show changes only**: Hides identical sections, showing only modified areas with context lines
- **Export redline**: Generates a DOCX with track changes showing the diff
- **Change highlighting**: Green for insertions, red for deletions, amber background for modifications
- **Change navigation**: Previous/Next buttons to jump between changes, showing current position (e.g., "3 of 23")
- **Change summary bar**: Total counts of insertions, deletions, modifications

**States:**
- Loading: Diff computation in progress (can take a few seconds for long documents)
- No changes: "These versions are identical" message
- Many changes: "Show changes only" toggle prominently suggested when more than 50 changes
- Inline diff mode: Alternative to side-by-side, showing unified diff in a single column (toggleable)

---

## Screen 8: Contract Repository

**Purpose:** Searchable archive of all contracts with rich filtering and metadata.

**Layout:**
```
+------------------------------------------------------------------+
| [Search contracts... (Cmd+K)]  [Filters v]  [Export CSV]         |
| Active Filters: [Status: Executed x] [Type: MSA x] [Clear All]  |
+------------------------------------------------------------------+
| Table View                                                         |
| +----------------------------------------------------------------+|
| | Title          | Counterparty | Type | Status    | Risk | Date ||
| |----------------|-------------|------|-----------|------|-------||
| | Acme MSA 2026  | Acme Corp   | MSA  | Executed  | 34   | Jan 5||
| | GlobalCo NDA   | GlobalCo    | NDA  | In Review | 67   | Jan 12|
| | TechVend SaaS  | TechVend    | SaaS | Draft     | --   | Jan 18|
| | DataCo DPA     | DataCo Inc  | DPA  | Executed  | 22   | Dec 8||
| | CloudServ MSA  | CloudServ   | MSA  | Negotiation| 54  | Jan 22|
| | NewHire Emp    | J. Smith    | Emp  | Executed  | 15   | Jan 3||
| |                |             |      |           |      |       ||
| +----------------------------------------------------------------+|
| Showing 1-25 of 342  [< Prev] [1] [2] [3] ... [14] [Next >]     |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Search**: Full-text search with instant results, searches across content and metadata
- **Filter panel**: Expandable panel with filters for: status, type, counterparty, assigned user, date range, risk score range, has obligations (yes/no)
- **Active filter chips**: Visible below search bar, each with remove (x) button
- **Table**: Sortable columns, clickable rows to open contract. Risk score shows colored badge. Status shows colored pill
- **Bulk actions**: Checkbox column for selecting multiple contracts. Bulk actions: export, assign, change status
- **Pagination**: Standard pagination with page size selector (25, 50, 100)

**States:**
- Empty state: "No contracts match your search. Try different filters or import your first contract."
- Loading: Row skeleton loaders
- Search active: Matching terms highlighted in results
- Selected rows: Blue background, bulk action bar appears above table

---

## Screen 9: Obligation Tracker

**Purpose:** Calendar and list view of all contract obligations, deadlines, and renewal dates.

**Layout:**
```
+------------------------------------------------------------------+
| Obligations  [Calendar View] [List View]  [+ Add Obligation]     |
| [Filter: All Types v]  [Show: Upcoming v]                        |
+------------------------------------------------------------------+
| Calendar View                                                      |
| +----------------------------------------------------------------+|
| |  February 2026                              [< Prev] [Next >] ||
| |  Mon   Tue   Wed   Thu   Fri   Sat   Sun                      ||
| |                                                                ||
| |  9     10    11    12    13    14    15                        ||
| |              [2]               [1]   [AWS                     ||
| |                                       Renewal]                ||
| |  16    17    18    19    20    21    22                        ||
| |  [Acme       [1]                     [Payment                 ||
| |   Report]                             Due]                    ||
| |                                                                ||
| +----------------------------------------------------------------+|
| Upcoming Obligations (below calendar)                              |
| +----------------------------------------------------------------+|
| | Feb 15 | AWS Contract Renewal  | Renewal  | URGENT | [View]   ||
| | Feb 17 | Acme Q1 Report Due    | Report   | Soon   | [View]   ||
| | Feb 22 | GlobalCo Payment      | Payment  | Normal | [View]   ||
| | Mar 01 | TechVend SLA Review   | Review   | Normal | [View]   ||
| | Mar 15 | DataCo DPA Renewal    | Renewal  | Normal | [View]   ||
| +----------------------------------------------------------------+|
+------------------------------------------------------------------+
```

**UI Elements:**
- **View toggle**: Switch between calendar and list views
- **Calendar**: Monthly calendar with obligation indicators on dates. Color-coded by type (renewal=blue, payment=green, report=amber, deadline=red). Click a date to see all obligations for that day
- **Obligation list**: Below calendar (or standalone in list view). Columns: date, description, type badge, urgency indicator, linked contract, assigned user, action button
- **Urgency indicators**: URGENT (red, due within 7 days), Soon (amber, due within 30 days), Normal (green, due later), Overdue (dark red, past due)
- **Add Obligation**: Manual obligation creation form (linked to a contract)
- **Filters**: Type (renewal, payment, deadline, report, deliverable), status (upcoming, overdue, completed), assigned user

**States:**
- No obligations: "No upcoming obligations. Obligations are automatically extracted from your contracts."
- Overdue present: Red alert banner at top showing count of overdue obligations
- Obligation detail panel: Slide-over panel showing full obligation details, linked contract, reminder settings

---

## Screen 10: Analytics Dashboard

**Purpose:** Visual analytics on contract cycle times, risk trends, negotiation patterns, and team performance.

**Layout:**
```
+------------------------------------------------------------------+
| Analytics  [Date Range: Last 90 Days v]  [Export Report]          |
+------------------------------------------------------------------+
| Top Metrics Row                                                    |
| [Avg Cycle Time: 4.2 days] [Contracts Closed: 67] [Avg Risk: 34]|
| [AI Drafts: 45]            [Redlines Avg: 2.3]    [On Time: 94%]|
+------------------------------------------------------------------+
| Charts Row 1                                                       |
| +----------------------------+ +-------------------------------+  |
| | Contract Cycle Time Trend  | | Risk Score Distribution       |  |
| | (Line chart, monthly)      | | (Histogram, score buckets)    |  |
| |                            | |                               |  |
| +----------------------------+ +-------------------------------+  |
| Charts Row 2                                                       |
| +----------------------------+ +-------------------------------+  |
| | Contracts by Status        | | Most Negotiated Clauses       |  |
| | (Donut chart)              | | (Horizontal bar chart)        |  |
| |                            | |                               |  |
| +----------------------------+ +-------------------------------+  |
| Charts Row 3                                                       |
| +----------------------------+ +-------------------------------+  |
| | Team Workload              | | AI Usage Metrics              |  |
| | (Stacked bar per user)     | | (Drafts generated, reviews,   |  |
| |                            | |  suggestions accepted)        |  |
| +----------------------------+ +-------------------------------+  |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Date range selector**: Predefined ranges (7 days, 30 days, 90 days, 1 year, custom)
- **Metric cards**: Six KPI cards with value, trend arrow (up/down vs previous period), sparkline
- **Charts**: Interactive charts built with a charting library (Recharts or Nivo). Hover for tooltips, click to drill down
- **Export**: Generate PDF report of current dashboard view

**States:**
- Loading: Chart skeleton loaders
- No data: "Not enough data yet. Analytics will populate as you process contracts."
- Drill-down: Click chart element to see underlying contracts (e.g., click "High Risk" bucket to see those contracts)

---

## Screen 11: Team Management

**Purpose:** Manage team members, roles, permissions, and workload assignments.

**Layout:**
```
+------------------------------------------------------------------+
| Team  [+ Invite Member]  [Roles & Permissions]                    |
+------------------------------------------------------------------+
| +----------------------------------------------------------------+|
| | Name             | Email              | Role     | Contracts   ||
| |------------------|--------------------|----------|-------------||
| | Sarah Chen       | sarah@company.com  | Admin    | 12 active   ||
| | James Lee        | james@company.com  | Editor   | 8 active    ||
| | Maria Rodriguez  | maria@company.com  | Reviewer | 15 active   ||
| | Alex Kim         | alex@company.com   | Editor   | 6 active    ||
| | Pat Johnson      | pat@company.com    | Viewer   | 0 active    ||
| +----------------------------------------------------------------+|
|                                                                    |
| Invite: [email@company.com]  [Role: Editor v]  [Send Invite]     |
+------------------------------------------------------------------+
```

**UI Elements:**
- **Member table**: Name, email, role badge (color-coded), active contract count, last active date
- **Row actions**: Click row to open user detail panel (change role, view activity, deactivate)
- **Invite form**: Email input with domain validation, role selector dropdown, send button
- **Roles & Permissions**: Link to modal showing the RBAC matrix
- **Pending invites**: Section below the table showing outstanding invitations with resend/revoke options

**States:**
- Single user: Table shows only the admin user with prominent "Invite your team" CTA
- Invite sent: Success toast, pending invite appears in table
- Role change: Confirmation dialog with impact explanation
- Deactivate user: Confirmation with option to reassign their contracts

---

## Screen 12: Settings

**Purpose:** Application, organization, and user preference configuration.

**Layout:**
```
+------------------------------------------------------------------+
| Settings                                                           |
+------------------------------------------------------------------+
| Left Nav (200px)               | Settings Content                 |
| +----------------------------+ | +------------------------------+ |
| | General                    | | | Organization Settings        | |
| | Organization               | | |                              | |
| | Integrations               | | | Company Name: [___________]  | |
| | AI Configuration           | | | Domain: [company.com]        | |
| | Notifications              | | | Default Jurisdiction:        | |
| | Security                   | | |   [State of Delaware v]      | |
| | Billing                    | | | Default Currency: [USD v]    | |
| | Data & Privacy             | | | Logo: [Upload]               | |
| | About                      | | |                              | |
| +----------------------------+ | | AI Settings                  | |
|                               | | | AI Model: [GPT-4o v]        | |
|                               | | | Risk Sensitivity:            | |
|                               | | |   [Conservative v]           | |
|                               | | | Auto-review on import:       | |
|                               | | |   [Toggle: On]               | |
|                               | | |                              | |
|                               | | | [Save Changes]               | |
|                               | +------------------------------+ |
+------------------------------------------------------------------+
```

**Settings Sections:**
- **General**: Theme (light/dark/system), language, date format, default view preferences
- **Organization**: Company name, domain, logo, default jurisdiction, default governing law, standard contract terms
- **Integrations**: DocuSign connection, HelloSign connection, Google Calendar sync, Salesforce connection, HubSpot connection. Each with connect/disconnect and status indicator
- **AI Configuration**: Model selection, risk sensitivity (conservative/balanced/aggressive), auto-review toggle, AI suggestion verbosity, custom AI instructions
- **Notifications**: Email notification preferences per event type (contract assigned, review due, deadline approaching, approval needed). Configurable reminder intervals
- **Security**: MFA setup, session timeout, password policy, API key management, SSO configuration (Enterprise)
- **Billing**: Current plan, seat count, usage metrics, upgrade/downgrade, payment method, invoice history
- **Data & Privacy**: Data retention policy, export all data, delete account/organization
- **About**: App version, release notes link, support contact, license information

**Accessibility:**
- Settings navigation via keyboard with clear focus indicators
- All toggles have visible labels and aria-checked states
- Form validation with inline error messages
- Save confirmation via non-blocking toast notification
