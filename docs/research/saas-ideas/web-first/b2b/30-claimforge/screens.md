# ClaimForge — Screen Designs & UI Specifications

## Design Philosophy

ClaimForge's interface serves investigators. Every pixel must earn its place by helping attorneys and analysts find fraud faster. The design follows three principles:

1. **Evidence-Centric**: Documents and data are the primary content. Chrome and decoration are minimal.
2. **Dense but Clear**: Investigators need information density. Every screen maximizes data visibility while maintaining clear visual hierarchy.
3. **Investigative Flow**: The UI guides the natural investigation workflow — ingest, analyze, detect, build, present.

---

## Navigation Architecture

```
Sidebar (persistent, collapsible)
  |
  +-- Dashboard (home)
  +-- Cases
  |     +-- Case List
  |     +-- [Selected Case]
  |           +-- Overview (tab)
  |           +-- Documents (tab)
  |           |     +-- Document Viewer (modal/panel)
  |           +-- Analysis (tab)
  |           |     +-- Fraud Patterns (sub-tab)
  |           |     +-- Network Graph (sub-tab)
  |           |     +-- Statistics (sub-tab)
  |           +-- Timeline (tab)
  |           +-- Report (tab)
  |           +-- Team (tab)
  +-- Settings
  |     +-- Account
  |     +-- Billing
  |     +-- Security
  |     +-- Integrations
  +-- Help & Support
```

### Global Navigation Elements

- **Sidebar**: Fixed left panel (240px expanded, 64px collapsed). Dark background (#0C0A09). Contains: logo, navigation links, active case indicator, user avatar/menu.
- **Top Bar**: Breadcrumb path, global search (Cmd+K command palette), notifications bell, user menu.
- **Command Palette**: Cmd+K opens a search-everything palette. Search cases, documents, entities, fraud patterns. Power user shortcut.
- **Keyboard Shortcuts**: Extensive keyboard navigation for power users (Tab through elements, Enter to open, Escape to close).

---

## Screen 1: Dashboard

**Route**: `/dashboard`
**Purpose**: At-a-glance overview of all active investigations. The attorney's command center.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Breadcrumb: Dashboard                    [Search] [Bell] [Avatar] |
|         |-----------------------------------------------------------|
|  Logo   |  +------------------+  +------------------+              |
|         |  | ACTIVE CASES     |  | DOCUMENTS        |              |
| Cases   |  | 12               |  | 4,832 processed  |              |
| Settings|  | 3 in analysis    |  | 127 pending      |              |
|         |  +------------------+  +------------------+              |
|         |  +------------------+  +------------------+              |
|         |  | FRAUD PATTERNS   |  | ESTIMATED FRAUD  |              |
|         |  | 47 detected      |  | $12.4M           |              |
|         |  | 8 critical       |  | across all cases |              |
|         |  +------------------+  +------------------+              |
|         |-----------------------------------------------------------|
|         |  RECENT ACTIVITY                                          |
|         |  [icon] Document analysis completed - Case #2024-031      |
|         |  [icon] Critical fraud pattern detected - Case #2024-028  |
|         |  [icon] New documents uploaded - Case #2024-031 (47 files) |
|         |  [icon] Report exported - Case #2024-019                   |
|         |-----------------------------------------------------------|
|         |  CASES REQUIRING ATTENTION                                 |
|         |  +-------------------------------------------------------+|
|         |  | Case #2024-028 | Healthcare Overbilling | 3 CRITICAL  ||
|         |  | Case #2024-031 | Defense Procurement    | Analysis... ||
|         |  | Case #2024-025 | Pharma Kickbacks       | Report Due  ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  FRAUD PATTERN SUMMARY (bar chart by type)                 |
|         |  [Overbilling: 18] [Duplicate: 12] [Phantom: 8] [Other: 9]|
+------------------------------------------------------------------+
```

### UI Elements

| Element                 | Component        | Behavior                                              |
| ----------------------- | ---------------- | ----------------------------------------------------- |
| Stat Cards (4)          | `<StatCard>`     | Number + label + trend indicator. Click navigates to filtered view |
| Recent Activity Feed    | `<ActivityFeed>` | Scrollable list, infinite scroll. Click navigates to source |
| Cases Requiring Attention| `<CaseAlert>`   | Cases with critical patterns, pending analysis, or approaching deadlines |
| Fraud Pattern Chart     | `<BarChart>`     | Recharts horizontal bar. Click bar filters to pattern type |

### States

- **Empty State**: No cases yet. Large CTA: "Create Your First Case" with illustration.
- **Loading State**: Skeleton placeholders for stat cards and activity feed.
- **Error State**: Error banner at top with retry button. Individual cards show error state independently.

---

## Screen 2: Case Manager

**Route**: `/dashboard/cases`
**Purpose**: Browse, search, and manage all cases.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Cases                                     [+ New Case]  |
|         |-----------------------------------------------------------|
|         |  [Search cases...]  [Filter: Status v] [Filter: Type v]   |
|         |  [Sort: Recent v]                                         |
|         |-----------------------------------------------------------|
|         |  CASE LIST                                                 |
|         |  +-------------------------------------------------------+|
|         |  | #2024-031 | Defense Procurement Fraud                  ||
|         |  | Status: Investigation | Docs: 1,247 | Patterns: 12   ||
|         |  | Est. Fraud: $4.2M | Last Activity: 2h ago             ||
|         |  | Tags: [defense] [phantom-vendor] [critical]             ||
|         |  +-------------------------------------------------------+|
|         |  +-------------------------------------------------------+|
|         |  | #2024-028 | Medicare Overbilling - Regional Health      ||
|         |  | Status: Analysis | Docs: 3,102 | Patterns: 23         ||
|         |  | Est. Fraud: $6.8M | Last Activity: 1d ago              ||
|         |  | Tags: [healthcare] [upcoding] [critical]                ||
|         |  +-------------------------------------------------------+|
|         |  ... (more cases)                                         |
+------------------------------------------------------------------+
```

### New Case Modal

```
+--------------------------------------------+
| Create New Case                      [X]   |
|--------------------------------------------|
| Case Title*:    [                        ] |
| Case Number:    [                        ] |
| Fraud Type:     [Healthcare         v    ] |
| Description:    [                        ] |
|                 [                        ] |
| Est. Amount:    [$                       ] |
|                                            |
|        [Cancel]  [Create Case]             |
+--------------------------------------------+
```

### UI Elements

- **Case Cards**: Each case is a card showing title, case number, status badge, document count, fraud pattern count, estimated fraud amount, last activity timestamp, tags.
- **Filters**: Multi-select dropdowns for Status (all statuses) and Fraud Type (healthcare, defense, procurement, pharmaceutical, other).
- **Sort**: By date created, last activity, fraud amount, document count.
- **Search**: Full-text search across case titles, descriptions, and case numbers.
- **Bulk Actions**: Select multiple cases for bulk tag assignment or export.

### States

- **Empty**: "No cases found. Create your first case to begin investigating."
- **Filtered Empty**: "No cases match your filters. Try adjusting your search."
- **Loading**: Skeleton cards with shimmer animation.

---

## Screen 3: Document Upload

**Route**: `/dashboard/cases/[caseId]/documents`
**Purpose**: Upload documents and monitor processing status.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Documents                [Upload]     |
|         |-----------------------------------------------------------|
|   Case  |  +----------------------------------------------------+  |
|   Tabs: |  |  DROP FILES HERE                                    |  |
| Overview|  |  or click to browse                                 |  |
| >Docs   |  |  PDF, Excel, CSV, Images, Email                    |  |
| Analysis|  |  Max 500 files, 2GB total                           |  |
| Timeline|  +----------------------------------------------------+  |
| Report  |-----------------------------------------------------------|
| Team    |  PROCESSING QUEUE (127 pending)                            |
|         |  +-------------------------------------------------------+|
|         |  | invoice_2024_001.pdf  | OCR: Processing... [=====>  ] ||
|         |  | contract_mod_3.pdf    | OCR: Completed | AI: Analyzing ||
|         |  | email_chain_47.eml    | Parsed | AI: Completed          ||
|         |  | billing_data.xlsx     | Parsed | AI: Completed          ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  PROCESSED DOCUMENTS (1,120 total)                         |
|         |  [Search] [Filter: Type v] [Filter: Status v] [Sort v]    |
|         |  +-------------------------------------------------------+|
|         |  | invoice_2023_847.pdf | Invoice | 3 entities | 1 flag   ||
|         |  | contract_prime.pdf   | Contract | 12 entities | 0 flags ||
|         |  | ...                                                     ||
|         |  +-------------------------------------------------------+|
+------------------------------------------------------------------+
```

### UI Elements

- **Drop Zone**: Large drag-and-drop area with visual feedback (border highlight on hover, file count on drop).
- **Upload Progress**: Per-file progress bars during upload.
- **Processing Queue**: Real-time status updates (WebSocket via Supabase Realtime). Stages: Uploading, OCR Processing, AI Analyzing, Complete.
- **Document List**: Sortable table with columns: Name, Type (auto-classified), Entities Extracted, Red Flags, Date Uploaded.
- **Batch Upload**: ZIP file support. Progress bar for extraction + individual file processing.

### States

- **Empty**: "No documents yet. Upload files to begin analysis."
- **Uploading**: Progress bar per file, overall progress bar, cancel button.
- **Processing**: Real-time queue with status per document. Estimated time remaining.
- **Error**: Failed documents highlighted in red with error message and retry button.
- **Complete**: Green check mark, entity count, red flag count visible per document.

---

## Screen 4: Document Viewer

**Route**: `/dashboard/cases/[caseId]/documents/[docId]`
**Purpose**: View, annotate, and analyze individual documents.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Documents > invoice_2024_001.pdf      |
|         |-----------------------------------------------------------|
|         |  +-----------------------------+--------------------------+|
|         |  | DOCUMENT VIEW               | ANALYSIS PANEL          ||
|         |  |                             |                          ||
|         |  | [PDF/Image Render]          | ENTITIES EXTRACTED       ||
|         |  |                             | Person: John Smith       ||
|         |  | [Page rendered with         | Org: Acme Defense LLC    ||
|         |  |  highlights on extracted    | Amount: $847,320.00      ||
|         |  |  entities]                  | Date: 2024-03-15         ||
|         |  |                             | Contract: W911QX-22-C-0042||
|         |  |                             |                          ||
|         |  | ANNOTATION TOOLBAR          | RED FLAGS                ||
|         |  | [Highlight] [Note] [Tag]    | ! Overbilling: Amount    ||
|         |  | [Link] [Redact]             |   exceeds contract rate  ||
|         |  |                             |   by 23% (confidence: 87%)||
|         |  |                             |                          ||
|         |  | Page: [< 1 of 4 >]         | LINKED DOCUMENTS         ||
|         |  |                             | - contract_prime.pdf     ||
|         |  |                             | - payment_record_847.csv ||
|         |  |                             |                          ||
|         |  |                             | AI SUMMARY               ||
|         |  |                             | "Invoice from Acme for..." ||
|         |  +-----------------------------+--------------------------+|
+------------------------------------------------------------------+
```

### UI Elements

- **Document Renderer**: PDF.js for PDFs, native image for images, table view for spreadsheets.
- **Entity Highlights**: Extracted entities highlighted in document with color-coded overlays (amounts in gold, names in blue, dates in green).
- **Annotation Toolbar**: Highlight (custom colors), sticky notes, tags, link to other documents, redact (for privilege review).
- **Analysis Panel**: Right sidebar showing extracted entities, red flags, linked documents, AI summary.
- **Navigation**: Page controls for multi-page documents. Thumbnail strip for quick navigation.
- **Zoom Controls**: Zoom in/out, fit to width, fit to page.

### Keyboard Shortcuts

| Shortcut   | Action                    |
| ---------- | ------------------------- |
| `H`        | Highlight selection       |
| `N`        | Add note at cursor        |
| `T`        | Tag selection             |
| `L`        | Link to another document  |
| `[` / `]`  | Previous / next page      |
| `+` / `-`  | Zoom in / out             |
| `Esc`      | Close annotation tool     |

---

## Screen 5: Fraud Pattern Analyzer

**Route**: `/dashboard/cases/[caseId]/analysis`
**Purpose**: View all detected fraud patterns with evidence and confidence scores.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Analysis > Fraud Patterns             |
|         |-----------------------------------------------------------|
|   Case  |  ANALYSIS TABS: [>Fraud Patterns] [Network] [Statistics]  |
|   Tabs  |-----------------------------------------------------------|
|         |  SUMMARY: 12 patterns detected | 3 critical | Est: $4.2M  |
|         |-----------------------------------------------------------|
|         |  [Filter: Severity v] [Filter: Type v] [Sort: Confidence v]|
|         |-----------------------------------------------------------|
|         |  +-------------------------------------------------------+|
|         |  | CRITICAL | Phantom Vendor                              ||
|         |  | Confidence: 94%  [==================================] ||
|         |  |                                                        ||
|         |  | Vendor "TechServ Solutions LLC" appears in 23 invoices  ||
|         |  | totaling $1.2M but has no verifiable business address,  ||
|         |  | no registered agent, and was incorporated 2 weeks       ||
|         |  | before first invoice.                                   ||
|         |  |                                                        ||
|         |  | Evidence: invoice_001.pdf, invoice_047.pdf, (+21 more)  ||
|         |  | Entities: TechServ Solutions LLC, [3 linked persons]    ||
|         |  |                                                        ||
|         |  | [View Evidence] [Add to Timeline] [Export Finding]      ||
|         |  +-------------------------------------------------------+|
|         |  +-------------------------------------------------------+|
|         |  | HIGH | Duplicate Billing                                ||
|         |  | Confidence: 88%  [==============================    ] ||
|         |  |                                                        ||
|         |  | 7 pairs of invoices with matching amounts and similar   ||
|         |  | descriptions billed 3-5 days apart. Total duplicate     ||
|         |  | amount: $847,000.                                       ||
|         |  |                                                        ||
|         |  | Evidence: billing_data.xlsx (rows 142-189)              ||
|         |  | [View Evidence] [Add to Timeline] [Export Finding]      ||
|         |  +-------------------------------------------------------+|
|         |  ... (more patterns)                                      |
+------------------------------------------------------------------+
```

### UI Elements

- **Pattern Cards**: Expandable cards with severity badge (color-coded), confidence bar, description, evidence links, action buttons.
- **Confidence Score Badge**: Visual bar + percentage. Color: green (>80%), amber (50-80%), red (<50%).
- **Severity Badges**: Critical (red, pulsing), High (orange), Medium (amber), Low (gray).
- **Evidence Links**: Clickable links to source documents. Opens in document viewer with relevant section highlighted.
- **Action Buttons**: "View Evidence" (opens linked documents), "Add to Timeline" (creates timeline event), "Export Finding" (adds to report).
- **Filter Bar**: Filter by severity, fraud type, confidence threshold slider, date range.

---

## Screen 6: Entity Network Graph

**Route**: `/dashboard/cases/[caseId]/analysis/network`
**Purpose**: Visualize relationships between entities (people, companies, payments, contracts).

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Analysis > Network Graph              |
|         |-----------------------------------------------------------|
|   Case  |  ANALYSIS TABS: [Fraud Patterns] [>Network] [Statistics]  |
|   Tabs  |-----------------------------------------------------------|
|         |  TOOLBAR: [Zoom+] [Zoom-] [Fit] [Filter] [Layout] [Export]|
|         |  [Search entities...] [Legend: Person|Org|Payment|Contract]|
|         |-----------------------------------------------------------|
|         |  +-------------------------------------------------------+|
|         |  |                                                        ||
|         |  |            [Prime Contractor]                          ||
|         |  |            /        |        \                         ||
|         |  |    [Sub A] --- [Sub B] --- [Sub C]                     ||
|         |  |        \       / |  \        |                         ||
|         |  |    [Employee 1]  |  [Employee 2]                      ||
|         |  |                  |                                     ||
|         |  |          [Phantom Vendor] <-- highlighted red           ||
|         |  |                  |                                     ||
|         |  |          [Payments: $1.2M]                             ||
|         |  |                                                        ||
|         |  |  (Interactive: drag nodes, zoom, click for details)    ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  ENTITY DETAIL PANEL (shown on node click)                |
|         |  Entity: TechServ Solutions LLC | Type: Organization      |
|         |  Documents: 23 | Payments Received: $1.2M                |
|         |  Relationships: 4 incoming, 2 outgoing                   |
|         |  Flags: Phantom vendor (94% confidence)                  |
|         |  [View Documents] [View Timeline] [Expand Connections]    |
+------------------------------------------------------------------+
```

### UI Elements

- **Graph Canvas**: @xyflow/react (React Flow) or D3.js force-directed graph. WebGL rendering for large graphs.
- **Node Types**: Color-coded by entity type. Person (blue circle), Organization (gold rectangle), Payment (green diamond), Contract (gray hexagon).
- **Edge Types**: Line style by relationship type. Solid (payment), dashed (contract), dotted (employment). Edge thickness proportional to amount.
- **Fraud Highlighting**: Suspicious nodes/edges highlighted with red glow. Pulsing animation for critical findings.
- **Detail Panel**: Bottom panel appears on node click. Shows entity details, connected documents, fraud flags.
- **Controls**: Zoom (scroll/buttons), pan (drag background), fit to screen, toggle layout algorithm (force-directed, hierarchical, radial).
- **Filters**: Show/hide node types, filter by relationship type, filter by amount threshold.
- **Search**: Search entities by name, highlight matching node in graph.
- **Export**: Export graph as PNG/SVG for reports. Export graph data as JSON.

### Interaction Patterns

- **Hover**: Show tooltip with entity name and type.
- **Click**: Select node, show detail panel, highlight connected edges.
- **Double-Click**: Expand node to show second-degree connections.
- **Drag**: Move individual nodes to reorganize layout.
- **Right-Click**: Context menu (expand, collapse, hide, add to timeline, view documents).
- **Multi-Select**: Shift+click to select multiple nodes. Group actions (tag, export, timeline).

---

## Screen 7: Evidence Timeline

**Route**: `/dashboard/cases/[caseId]/timeline`
**Purpose**: Build and view a chronological narrative of the fraud.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Timeline                  [+ Event]   |
|         |-----------------------------------------------------------|
|   Case  |  VIEW: [>Chronological] [Gantt] [Compact]                |
|   Tabs  |  FILTER: [All Types v] [All Entities v] [Date Range]     |
|         |-----------------------------------------------------------|
|         |  2022-01-15 | CONTRACT AWARDED                             |
|         |  --------------------------------------------------------- |
|         |  | Prime contract W911QX-22-C-0042 awarded to DefenseCo   ||
|         |  | for logistics support. Value: $12.4M over 3 years.     ||
|         |  | Docs: contract_prime.pdf, award_notice.pdf              ||
|         |  | [Edit] [Delete] [Link Evidence]                         ||
|         |  --------------------------------------------------------- |
|         |                     |                                      |
|         |  2022-03-02 | SUBCONTRACT ISSUED                            |
|         |  --------------------------------------------------------- |
|         |  | DefenseCo subcontracts to TechServ Solutions LLC.       ||
|         |  | TechServ incorporated just 2 weeks prior. [!]           ||
|         |  | Docs: subcontract_techserv.pdf, incorporation_docs.pdf  ||
|         |  | Flags: Phantom vendor (94%)                             ||
|         |  --------------------------------------------------------- |
|         |                     |                                      |
|         |  2022-04-01 | FIRST INVOICES                                |
|         |  --------------------------------------------------------- |
|         |  | TechServ submits first invoice: $127,000.               ||
|         |  | No deliverables documentation attached.                 ||
|         |  | Docs: invoice_001.pdf                                   ||
|         |  | Flags: Missing deliverables, round number               ||
|         |  --------------------------------------------------------- |
|         |                     |                                      |
|         |  ... (more events chronologically)                        |
+------------------------------------------------------------------+
```

### UI Elements

- **Timeline Track**: Vertical line with date markers. Events displayed as cards along the line.
- **Event Cards**: Date, title, description, linked documents, linked entities, fraud flags.
- **Auto-Generation**: Button to auto-generate timeline from extracted dates across all documents. Attorney reviews and edits.
- **Manual Events**: "+" button to add custom events with date, title, description, document links.
- **Narrative Mode**: Toggle to view AI-generated narrative paragraphs connecting timeline events.
- **Views**: Chronological (vertical), Gantt (horizontal, for overlapping periods), Compact (condensed list).
- **Filters**: By event type, by entity, by date range, by fraud flag presence.
- **Drag Reorder**: Drag events to reorder (within same date).
- **Export**: Export timeline as standalone PDF section for evidence package.

---

## Screen 8: Statistical Analysis

**Route**: `/dashboard/cases/[caseId]/analysis/statistics`
**Purpose**: Quantitative fraud detection with statistical charts and analysis.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Analysis > Statistics                  |
|         |-----------------------------------------------------------|
|   Case  |  ANALYSIS TABS: [Fraud Patterns] [Network] [>Statistics]  |
|   Tabs  |-----------------------------------------------------------|
|         |  DATA SOURCE: [All Invoices v] [Date Range: 2022-2024]     |
|         |-----------------------------------------------------------|
|         |  BENFORD'S LAW ANALYSIS                                    |
|         |  +-------------------------------------------------------+|
|         |  | [Bar chart: Expected vs Actual first-digit frequency]  ||
|         |  |  1: Expected 30.1% | Actual 18.2% | DEVIATION         ||
|         |  |  2: Expected 17.6% | Actual 12.1% | deviation          ||
|         |  |  ...                                                    ||
|         |  |  5: Expected  7.9% | Actual 22.4% | MAJOR DEVIATION   ||
|         |  |  Chi-squared: 47.3 | p-value: < 0.001 | SIGNIFICANT   ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  ANOMALY DETECTION                                         |
|         |  +-------------------------------------------------------+|
|         |  | [Scatter plot: Invoice amounts over time]               ||
|         |  |  Red dots: statistical outliers (>2 SD from mean)      ||
|         |  |  Hover for details: amount, vendor, date               ||
|         |  |  23 outliers detected out of 1,247 invoices            ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  BILLING TREND ANALYSIS                                    |
|         |  +-------------------------------------------------------+|
|         |  | [Line chart: Monthly billing totals over time]          ||
|         |  |  Sudden spike in Q3 2023 (+340% vs prior quarter)      ||
|         |  |  Annotation: "Correlates with contract modification 3" ||
|         |  +-------------------------------------------------------+|
+------------------------------------------------------------------+
```

### Chart Components

| Chart Type          | Library     | Data Source                    | Interaction                    |
| ------------------- | ----------- | ------------------------------ | ------------------------------ |
| Benford's Law       | Recharts    | First digits of financial amounts | Hover for exact values, click bar to filter documents |
| Anomaly Scatter     | Recharts    | Invoice amounts vs. time       | Hover for details, click to open document |
| Billing Trends      | Recharts    | Monthly/quarterly billing totals | Hover for amounts, click annotations |
| Distribution        | Recharts    | Histogram of invoice amounts   | Hover for bin details          |
| Ratio Analysis      | Recharts    | Financial ratios over time     | Compare against benchmarks     |

---

## Screen 9: Report Generator

**Route**: `/dashboard/cases/[caseId]/report`
**Purpose**: Generate, review, and export case evidence packages.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Report                    [Generate]   |
|         |-----------------------------------------------------------|
|   Case  |  REPORT SECTIONS:                                        |
|   Tabs  |  [x] Executive Summary  [x] Fraud Findings               |
|         |  [x] Entity Analysis    [x] Statistical Analysis          |
|         |  [x] Evidence Timeline  [x] Document Index                |
|         |  [ ] FCA Complaint Draft [ ] Appendices                   |
|         |-----------------------------------------------------------|
|         |  REPORT PREVIEW                                            |
|         |  +-------------------------------------------------------+|
|         |  | CLAIMFORGE EVIDENCE PACKAGE                            ||
|         |  | Case #2024-031: Defense Procurement Fraud               ||
|         |  | Generated: 2024-12-15                                   ||
|         |  |                                                        ||
|         |  | 1. EXECUTIVE SUMMARY                                   ||
|         |  | [AI-generated summary — editable]                      ||
|         |  |                                                        ||
|         |  | This case involves suspected procurement fraud in      ||
|         |  | connection with Contract W911QX-22-C-0042...            ||
|         |  | [Edit] [Regenerate]                                     ||
|         |  |                                                        ||
|         |  | 2. FRAUD FINDINGS                                      ||
|         |  | 2.1 Phantom Vendor (Confidence: 94%)                   ||
|         |  | Evidence: See Documents 1-23, Entity Analysis 4.2      ||
|         |  | ...                                                     ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  EXPORT: [PDF] [CSV Data] [JSON]    FORMAT: [DOJ] [Client] |
+------------------------------------------------------------------+
```

### UI Elements

- **Section Checklist**: Toggle which sections to include in the report.
- **Live Preview**: WYSIWYG preview of the report. Click any section to edit.
- **AI Regeneration**: "Regenerate" button on each AI-written section.
- **Citation Markers**: Clickable citation markers that link to source documents.
- **Export Options**: PDF (formatted report), CSV (raw data), JSON (structured data).
- **Format Templates**: DOJ submission format, client presentation format, internal memo format.

---

## Screen 10: Team Management

**Route**: `/dashboard/cases/[caseId]/team`
**Purpose**: Manage case-level access controls and team members.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |  Case #2024-031 > Team                    [+ Add Member] |
|         |-----------------------------------------------------------|
|   Case  |  CASE TEAM MEMBERS                                       |
|   Tabs  |  +-------------------------------------------------------+|
|         |  | Jane Smith    | Lead Attorney | Full Access | [Edit]   ||
|         |  | Mike Johnson  | Associate     | Read/Write  | [Edit]   ||
|         |  | Sarah Lee     | Paralegal     | Read/Write  | [Edit]   ||
|         |  | Dr. Tom Brown | Expert Witness| Read Only   | [Edit]   ||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  PENDING INVITATIONS                                       |
|         |  +-------------------------------------------------------+|
|         |  | co-counsel@firmb.com | Co-Counsel | Read/Write | Pending||
|         |  +-------------------------------------------------------+|
|         |-----------------------------------------------------------|
|         |  AUDIT LOG (recent)                                        |
|         |  | 2024-12-15 14:23 | Jane Smith | Viewed document_047    ||
|         |  | 2024-12-15 14:01 | Mike Johnson | Uploaded 12 documents ||
|         |  | 2024-12-15 13:45 | Sarah Lee | Added annotation          ||
+------------------------------------------------------------------+
```

### Roles and Permissions

| Role              | View Docs | Upload | Annotate | Analysis | Export | Team Mgmt |
| ----------------- | --------- | ------ | -------- | -------- | ------ | --------- |
| Lead Attorney     | Yes       | Yes    | Yes      | Yes      | Yes    | Yes       |
| Associate         | Yes       | Yes    | Yes      | Yes      | Yes    | No        |
| Paralegal         | Yes       | Yes    | Yes      | Limited  | No     | No        |
| Expert Witness    | Limited   | No     | Comment  | View     | No     | No        |
| Co-Counsel        | Yes       | Yes    | Yes      | Yes      | Yes    | No        |
| Viewer            | Yes       | No     | No       | View     | No     | No        |

---

## Screen 11: Settings

**Route**: `/dashboard/settings`
**Purpose**: Account, billing, security, and integration configuration.

### Sub-Screens

#### Account Settings (`/dashboard/settings`)

```
+------------------------------------------------------------------+
| SIDEBAR |  Settings > Account                                      |
|         |-----------------------------------------------------------|
|         |  PROFILE                                                   |
|         |  Name:     [Jane Smith              ]                     |
|         |  Email:    [jane@whistleblowerfirm.com]                   |
|         |  Firm:     [Smith & Associates, LLP  ]                    |
|         |  Role:     Admin                                          |
|         |                                       [Save Changes]       |
|         |-----------------------------------------------------------|
|         |  SECURITY                                                  |
|         |  Password:        [Change Password]                       |
|         |  Two-Factor Auth: Enabled [Manage]                        |
|         |  Active Sessions: 2 devices [View All]                    |
|         |  IP Allowlist:    [Configure] (Enterprise only)           |
|         |-----------------------------------------------------------|
|         |  DATA & PRIVACY                                            |
|         |  Data Export:     [Request Full Export]                    |
|         |  Data Deletion:   [Request Account Deletion]              |
|         |  Audit Logs:      [Download Audit Log]                    |
+------------------------------------------------------------------+
```

#### Billing Settings (`/dashboard/settings/billing`)

```
+------------------------------------------------------------------+
| SIDEBAR |  Settings > Billing                                      |
|         |-----------------------------------------------------------|
|         |  CURRENT PLAN: Firm ($499/mo)                             |
|         |  Next billing date: January 15, 2025                      |
|         |  [Change Plan] [Cancel Subscription]                      |
|         |-----------------------------------------------------------|
|         |  USAGE THIS MONTH                                          |
|         |  Cases: 8 / Unlimited                                     |
|         |  Documents Processed: 4,832                                |
|         |  AI Analysis Credits: 12,400 / 50,000                     |
|         |  Storage: 12.4 GB / 100 GB                                |
|         |  [============================        ] 62% used           |
|         |-----------------------------------------------------------|
|         |  BILLING HISTORY                                           |
|         |  Dec 2024 | $499.00 | Paid | [Invoice]                   |
|         |  Nov 2024 | $499.00 | Paid | [Invoice]                   |
|         |  Oct 2024 | $499.00 | Paid | [Invoice]                   |
+------------------------------------------------------------------+
```

---

## Accessibility Requirements

| Requirement             | Implementation                                        |
| ----------------------- | ----------------------------------------------------- |
| **WCAG 2.1 AA**         | All screens meet AA compliance minimum                |
| **Keyboard Navigation** | Full keyboard accessibility. Visible focus indicators |
| **Screen Readers**      | ARIA labels on all interactive elements               |
| **Color Contrast**      | Minimum 4.5:1 for text, 3:1 for UI elements          |
| **Focus Management**    | Logical tab order, focus trapped in modals            |
| **Alt Text**            | All images and charts have descriptive alt text       |
| **Motion**              | Respect `prefers-reduced-motion` for animations       |
| **Font Scaling**        | UI functional at 200% browser zoom                    |

---

## Responsive Breakpoints

| Breakpoint  | Width       | Layout Changes                                    |
| ----------- | ----------- | ------------------------------------------------- |
| Desktop XL  | >= 1440px   | Full sidebar + content + analysis panel           |
| Desktop     | >= 1024px   | Collapsible sidebar + content + panel overlay     |
| Tablet      | >= 768px    | Hidden sidebar (hamburger) + full content         |
| Mobile      | < 768px     | Bottom tab navigation, stacked layouts. Limited functionality note: "For full investigation experience, use desktop." |

> **Note**: ClaimForge is web-first B2B. Desktop is the primary experience. Tablet is supported for court/meeting use. Mobile is informational only (view case status, read notifications).

---

## Loading & Empty States Summary

| Screen               | Loading State                    | Empty State                                 |
| -------------------- | -------------------------------- | ------------------------------------------- |
| Dashboard            | Skeleton stat cards + feed       | "Create your first case" CTA                |
| Case Manager         | Skeleton case cards              | "No cases yet" + create button              |
| Document Upload      | Upload progress bars             | "Upload documents to begin" + drop zone     |
| Document Viewer      | Document skeleton + spinner      | N/A (always has document)                   |
| Fraud Patterns       | Skeleton pattern cards           | "No patterns detected yet" + analysis CTA   |
| Network Graph        | Spinner with "Building graph..." | "Upload documents to build entity network"  |
| Timeline             | Skeleton timeline entries        | "No events yet" + auto-generate or add CTA  |
| Statistics           | Chart skeletons                  | "Need financial data for statistical analysis"|
| Report               | "Generating report..."           | "Complete analysis first" + checklist       |

---

*Every screen answers: Where is the fraud? How do we prove it?*
