# ProposalPilot -- Screen Designs & UI Architecture

## Navigation Structure

ProposalPilot uses a persistent left sidebar navigation for the main application, with a top bar for contextual actions. The proposal editor uses a full-width layout with a floating toolbar. The client-facing proposal viewer is a separate, minimal layout with no app chrome.

```
+-------+----------------------------------------------------------+
| SIDE  |  TOP BAR (breadcrumb + search + notifications + avatar)  |
| BAR   +----------------------------------------------------------+
|       |                                                          |
|  Logo |                                                          |
|       |                    MAIN CONTENT                          |
|  Nav  |                                                          |
| Items |                                                          |
|       |                                                          |
|  ...  |                                                          |
|       |                                                          |
| Org   |                                                          |
| Switch|                                                          |
+-------+----------------------------------------------------------+
```

### Sidebar Navigation Items

```
[Logo: ProposalPilot]

Dashboard              (home icon)
Proposals              (document icon)
  - All Proposals
  - Pipeline View
Content Library        (library icon)
Templates              (layout icon)
Clients                (building icon)
Analytics              (chart icon)

--- divider ---

Settings               (gear icon)
  - General
  - Team
  - Branding
  - Integrations
  - Billing

--- bottom ---

[Org Switcher]
[User Avatar + Menu]
```

---

## Screen 1: Dashboard

**Route:** `/(app)/dashboard`
**Purpose:** At-a-glance view of proposal activity, pipeline health, and key performance metrics.

### Layout

```
+----------------------------------------------------------------+
| Good morning, Sarah            [+ New Proposal]   [Notifications]|
+----------------------------------------------------------------+
|                                                                  |
| +-- KEY METRICS (4 cards) ----------------------------------+   |
| |                                                            |   |
| | [Proposals    ] [Win Rate    ] [Pipeline     ] [Avg Deal  ]|   |
| | [  This Month ] [  This Qtr  ] [  Value      ] [  Size    ]|   |
| | [     12      ] [   54%      ] [  $340K      ] [  $28K    ]|   |
| | [  +3 vs last ] [ +6% vs last] [  8 active   ] [ +$4K    ]|   |
| |                                                            |   |
| +------------------------------------------------------------+   |
|                                                                  |
| +-- RECENT PROPOSALS --------+  +-- ACTIVITY FEED ----------+   |
| |                             |  |                           |   |
| | [Card] Acme Corp Rebrand   |  | [icon] Marcus viewed     |   |
| |   Sent 2h ago | $45,000    |  |   Acme proposal - 12m ago|   |
| |   [Viewed: 3 times]        |  |                           |   |
| |                             |  | [icon] Client opened     |   |
| | [Card] TechStart MVP       |  |   TechStart proposal     |   |
| |   Draft | $120,000         |  |   - 45m ago               |   |
| |   [AI Draft Ready]         |  |                           |   |
| |                             |  | [icon] Proposal won!     |   |
| | [Card] GreenCo Marketing   |  |   GreenCo - $32K         |   |
| |   Won 1d ago | $32,000     |  |   - 1d ago               |   |
| |   [Signed]                  |  |                           |   |
| |                             |  | [icon] New comment       |   |
| | [View All ->]               |  |   from Priya on TechStart|   |
| +-----------------------------+  +---------------------------+   |
|                                                                  |
| +-- PIPELINE SNAPSHOT -------------------------------------------+|
| |                                                                ||
| | Draft(4)  |  Sent(3)  |  Viewed(5)  |  Won(2)  |  Lost(1)    ||
| | $180K     |  $95K     |  $210K      |  $52K    |  $28K       ||
| | [==============================-----------========------]      ||
| |                                                                ||
| +----------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### UI Elements

- **Metric Cards**: White cards with large number, label, and trend indicator (green up arrow / red down arrow). Click to drill into analytics.
- **Proposal Cards**: Show proposal title, client name, status badge (color-coded), value, and last activity. Hover reveals quick actions (edit, preview, duplicate).
- **Activity Feed**: Chronological list with icons for each event type. Real-time updates via Supabase Realtime subscription.
- **Pipeline Bar**: Horizontal stacked bar showing value distribution across stages. Each segment is clickable to filter proposals.

### States

- **Empty state** (new user): Illustration with "Create your first proposal" CTA and quick-start wizard
- **Loading state**: Skeleton cards with pulsing animation for each section
- **Error state**: Inline error banners with retry buttons, never a full-page error

### Accessibility

- All metric cards are `<article>` elements with `aria-label` describing the metric and trend
- Activity feed items use `role="log"` with `aria-live="polite"` for real-time updates
- Pipeline bar segments have `aria-label` with stage name and value
- Keyboard navigation: Tab through cards, Enter to open, arrow keys within pipeline

---

## Screen 2: New Proposal Wizard

**Route:** `/(app)/proposals/new`
**Purpose:** Guided multi-step flow to create a new proposal, from client details through AI generation.

### Steps

```
Step 1: Client Details     Step 2: Project Brief     Step 3: Configure     Step 4: Generate
[======]                   [============]             [==================] [========================]
```

### Step 1: Client Details

```
+----------------------------------------------------------------+
| New Proposal                                    Step 1 of 4     |
+----------------------------------------------------------------+
|                                                                  |
|  Client *                                                        |
|  +-- [Search or create client...] --------------------------+   |
|  |  Acme Corp                                  [Selected]   |   |
|  |  TechStart Inc                                           |   |
|  |  + Create new client                                     |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  Contact Person *                                                |
|  [John Smith - john@acmecorp.com          ] [dropdown]           |
|                                                                  |
|  Project Title *                                                 |
|  [Brand Refresh & Website Redesign                      ]        |
|                                                                  |
|  Industry                                                        |
|  [Technology               ] [dropdown]                          |
|                                                                  |
|  Deal Value (Estimate)                                           |
|  [$] [50,000              ]                                      |
|                                                                  |
|                           [Cancel]  [Next: Project Brief ->]     |
+------------------------------------------------------------------+
```

### Step 2: Project Brief

```
+----------------------------------------------------------------+
| New Proposal                                    Step 2 of 4     |
+----------------------------------------------------------------+
|                                                                  |
|  How would you like to provide the project brief?                |
|                                                                  |
|  [Paste Text]    [Upload File]    [Structured Form]              |
|   (selected)                                                     |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | Paste the client's brief, email, or project description  |   |
|  | here. The more detail you provide, the better the AI     |   |
|  | can tailor the proposal.                                  |   |
|  |                                                          |   |
|  | "We need a complete brand refresh including new logo,    |   |
|  |  visual identity system, and website redesign. Our       |   |
|  |  current site is built on WordPress and we want to       |   |
|  |  move to a modern stack. Target launch is Q2 2026.       |   |
|  |  Budget range is $40-60K..."                             |   |
|  |                                                          |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  [AI Brief Analysis will run on the next step]                   |
|                                                                  |
|                     [<- Back]  [Next: Configure ->]              |
+------------------------------------------------------------------+
```

### Step 3: Configure

```
+----------------------------------------------------------------+
| New Proposal                                    Step 3 of 4     |
+----------------------------------------------------------------+
|                                                                  |
|  +-- AI BRIEF ANALYSIS -----------------------------------+     |
|  | Key Requirements Identified:                           |     |
|  |  [x] Brand identity design (logo, color, typography)   |     |
|  |  [x] Website redesign (WordPress -> modern stack)      |     |
|  |  [x] Visual identity system / brand guidelines         |     |
|  |  [ ] Content migration (not mentioned, recommend?)     |     |
|  |                                                        |     |
|  | Suggested Clarifications:                               |     |
|  |  - Number of website pages / templates needed?          |     |
|  |  - Existing brand assets to retain?                     |     |
|  |  - CMS preferences for new site?                        |     |
|  +--------------------------------------------------------+     |
|                                                                  |
|  Template                                                        |
|  [AI Recommended: Brand & Web Proposal] [dropdown]               |
|    Win rate: 62% | Used 23 times                                 |
|                                                                  |
|  Services to Include                                             |
|  [x] Brand Strategy & Discovery     [x] Logo Design             |
|  [x] Visual Identity System         [x] Website Design           |
|  [x] Website Development            [ ] Content Writing          |
|  [ ] SEO Setup                      [ ] Ongoing Maintenance      |
|                                                                  |
|  Pricing Model                                                   |
|  (o) Fixed Price  ( ) Time & Materials  ( ) Value-Based          |
|                                                                  |
|  Proposal Tone                                                   |
|  [Professional & Confident    ] [dropdown]                       |
|                                                                  |
|                     [<- Back]  [Generate Proposal ->]            |
+------------------------------------------------------------------+
```

### Step 4: Generate

```
+----------------------------------------------------------------+
| New Proposal                                    Step 4 of 4     |
+----------------------------------------------------------------+
|                                                                  |
|  +-- GENERATING PROPOSAL ---------------------------------+     |
|  |                                                        |     |
|  |  [Animated logo / progress indicator]                  |     |
|  |                                                        |     |
|  |  Analyzing brief...                         [done]     |     |
|  |  Selecting relevant case studies...         [done]     |     |
|  |  Generating executive summary...            [done]     |     |
|  |  Writing scope of work...                   [active]   |     |
|  |  Building pricing table...                  [pending]  |     |
|  |  Drafting timeline...                       [pending]  |     |
|  |  Adding terms & conditions...               [pending]  |     |
|  |                                                        |     |
|  |  Estimated time remaining: 8 seconds                   |     |
|  |                                                        |     |
|  +--------------------------------------------------------+     |
|                                                                  |
|  +-- LIVE PREVIEW (streaming) ----------------------------+     |
|  |                                                        |     |
|  |  # Acme Corp Brand Refresh & Website Redesign          |     |
|  |                                                        |     |
|  |  ## Executive Summary                                  |     |
|  |  Acme Corp is at a pivotal moment in its growth        |     |
|  |  trajectory. As you expand into new markets, your      |     |
|  |  brand identity and digital presence need to...        |     |
|  |  [streaming text appearing...]                         |     |
|  |                                                        |     |
|  +--------------------------------------------------------+     |
|                                                                  |
|                     [Cancel]  [Open in Editor ->]                |
+------------------------------------------------------------------+
```

---

## Screen 3: Proposal Editor

**Route:** `/(app)/proposals/[id]/edit`
**Purpose:** Full-featured document editor for refining AI-generated proposals.

### Layout

```
+----------------------------------------------------------------+
| [<- Back]  Acme Corp Proposal  [Draft v]  [Preview] [Send]     |
+----------------------------------------------------------------+
| [B] [I] [U] [H1v] [List] [Table] [Image] [+Block v] | [AI v] |
+----------------------------------------------------------------+
| +-- OUTLINE --+  +-- EDITOR AREA --------------------------+   |
| |              |  |                                          |   |
| | Cover Page   |  |  [Logo]                                 |   |
| | Exec Summary |  |                                         |   |
| | > (active)   |  |  # Brand Refresh &                      |   |
| | About Us     |  |    Website Redesign                     |   |
| | Scope        |  |                                         |   |
| | Approach     |  |  Prepared for: Acme Corp                |   |
| | Timeline     |  |  Prepared by: Studio Creative            |   |
| | Pricing      |  |  Date: February 7, 2026                 |   |
| | Case Studies |  |                                         |   |
| | Team         |  |  ---                                    |   |
| | Terms        |  |                                         |   |
| | Signature    |  |  ## Executive Summary                    |   |
| |              |  |                                         |   |
| | + Add Section|  |  Acme Corp is at a pivotal moment in    |   |
| |              |  |  its growth trajectory. As you expand    |   |
| |              |  |  into new markets, your brand identity   |   |
| |              |  |  and digital presence need to evolve     |   |
| |              |  |  to match the caliber of your...         |   |
| |              |  |                                         |   |
| |              |  |  [Cursor blinking]                      |   |
| |              |  |                                         |   |
| +--------------+  |  +-- PRICING TABLE ----------------+   |   |
|                    |  | Item          | Qty | Rate | Total|   |   |
|                    |  | Brand Strategy|  1  | $8K  | $8K  |   |   |
|                    |  | Logo Design   |  1  | $6K  | $6K  |   |   |
|                    |  | Visual System |  1  | $10K | $10K |   |   |
|                    |  | Web Design    |  1  | $14K | $14K |   |   |
|                    |  | Web Dev       |  1  | $12K | $12K |   |   |
|                    |  +-----------------------------+------+   |   |
|                    |  | Subtotal                    | $50K |   |   |
|                    |  +------------------------------------+   |   |
|                    |                                         |   |
|                    +-----------------------------------------+   |
+------------------------------------------------------------------+
| Word count: 2,340  |  Reading time: ~10 min  |  Last saved: 2s  |
+------------------------------------------------------------------+
```

### Toolbar Elements

**Formatting Row:**
- Text formatting: Bold, Italic, Underline, Strikethrough, Text color, Highlight
- Headings: H1, H2, H3, H4 (dropdown)
- Lists: Bullet, Numbered, Checklist
- Alignment: Left, Center, Right
- Insert: Table, Image, Video, Divider, Page break
- Block insert (dropdown): Pricing table, Signature block, Team member, Case study, Milestone timeline, Callout box, Dynamic variable

**AI Actions (dropdown):**
- Improve this section
- Make it shorter / longer
- Change tone (more formal / more casual)
- Regenerate section
- Suggest additions
- Check for inconsistencies

### Editor States

- **Editing**: Full toolbar visible, all content editable
- **Commenting**: Toolbar hidden, click text to add comment, comment thread panel on right
- **Preview**: Read-only view matching exactly what the client sees
- **Presentation**: Full-screen, section-by-section with navigation arrows (for screen-sharing during sales calls)

### Collaboration Indicators

- Active collaborators shown as avatars in top bar with colored cursors in the document
- Colored cursor labels show collaborator name and current position
- Selection highlighting shows what each collaborator has selected

---

## Screen 4: Proposal Preview (Client View)

**Route:** `/(public)/p/[id]`
**Purpose:** The client-facing proposal viewer. Clean, professional, distraction-free.

### Layout

```
+----------------------------------------------------------------+
| [Agency Logo]                        [Download PDF] [Sign]      |
+----------------------------------------------------------------+
| +-- TOC SIDEBAR --+  +-- PROPOSAL CONTENT ------------------+  |
| |                  |  |                                       |  |
| | Table of Contents|  |  [Cover Image / Hero]                |  |
| |                  |  |                                       |  |
| | 1. Exec Summary |  |  # Brand Refresh &                   |  |
| | 2. About Us     |  |    Website Redesign                   |  |
| | 3. Scope        |  |                                       |  |
| | 4. Approach     |  |  Prepared for: Acme Corp              |  |
| | 5. Timeline     |  |  Date: February 7, 2026               |  |
| | 6. Pricing      |  |                                       |  |
| | 7. Case Studies |  |  ---                                  |  |
| | 8. Our Team     |  |                                       |  |
| | 9. Terms        |  |  ## Executive Summary                  |  |
| |                  |  |                                       |  |
| |                  |  |  [Professional proposal content       |  |
| | ---              |  |   rendered beautifully with the       |  |
| | Valid until:     |  |   agency's brand colors and fonts]     |  |
| | March 15, 2026  |  |                                       |  |
| |                  |  |  ...                                  |  |
| |                  |  |                                       |  |
| | [Accept]         |  |  +-- INTERACTIVE PRICING TABLE ---+  |  |
| | [Request Changes]|  |  | Item        | Incl | Total     |  |  |
| | [Decline]        |  |  | Brand Strat | [x]  | $8,000    |  |  |
| |                  |  |  | Logo Design | [x]  | $6,000    |  |  |
| |                  |  |  | SEO Setup   | [ ]  | $3,000    |  |  |
| |                  |  |  +------------------------------+  |  |
| |                  |  |  | Your Total:        $50,000    |  |  |
| |                  |  |  +-------------------------------+  |  |
| |                  |  |                                       |  |
| |                  |  |  +-- SIGNATURE BLOCK -------------+  |  |
| |                  |  |  | Sign here:  [Click to sign]    |  |  |
| |                  |  |  +--------------------------------+  |  |
| +------------------+  +--------------------------------------+  |
+------------------------------------------------------------------+
| Powered by ProposalPilot                     [Leave a comment]   |
+------------------------------------------------------------------+
```

### Interactive Elements

- **TOC Sidebar**: Sticky on scroll, highlights current section, smooth scroll to section on click. Collapses to hamburger on mobile.
- **Pricing Table**: Clients can toggle optional line items on/off and see the total update in real time.
- **Comment Button**: Opens a slide-in panel where the client can leave comments on specific sections.
- **Accept / Request Changes / Decline**: Action buttons that update proposal status and notify the agency team.
- **Signature Block**: Clicking initiates the e-signature flow via DocuSign/HelloSign.

### Mobile Responsive

- TOC becomes a sticky top bar with horizontal scroll or hamburger dropdown
- Pricing table scrolls horizontally with sticky first column
- Signature block becomes full-width with larger touch targets
- All text sizes adjusted for mobile readability (16px minimum body text)

---

## Screen 5: Analytics Per Proposal

**Route:** `/(app)/proposals/[id]/analytics`
**Purpose:** Detailed engagement analytics for a single sent proposal.

### Layout

```
+----------------------------------------------------------------+
| [<- Proposals]  Acme Corp Proposal Analytics                    |
+----------------------------------------------------------------+
|                                                                  |
| +-- ENGAGEMENT SUMMARY (3 cards) ---------------------------+   |
| | [Total Views] [Unique Viewers] [Total Time Spent]         |   |
| | [    12     ] [      3       ] [   18 min 42s   ]         |   |
| +-----------------------------------------------------------+   |
|                                                                  |
| +-- VIEWER TIMELINE ----------------------------------------+   |
| |                                                            |   |
| | Feb 5, 2:14 PM  John Smith (Desktop, Chrome)              |   |
| |   Viewed: Exec Summary (2m), Pricing (4m), Team (1m)      |   |
| |                                                            |   |
| | Feb 5, 3:30 PM  Unknown viewer (Mobile, Safari)            |   |
| |   Viewed: Exec Summary (1m), Scope (3m), Pricing (2m)     |   |
| |                                                            |   |
| | Feb 6, 9:15 AM  John Smith (Desktop, Chrome)               |   |
| |   Downloaded PDF                                           |   |
| |   Viewed: Pricing (6m), Terms (3m)                         |   |
| |                                                            |   |
| +------------------------------------------------------------+   |
|                                                                  |
| +-- ENGAGEMENT HEATMAP ----------+  +-- TIME PER SECTION ---+   |
| |                                 |  |                        |   |
| | Section        Engagement       |  | Pricing     ======= 12m|  |
| | Cover          [===           ] |  | Scope       =====   8m |  |
| | Exec Summary   [========      ] |  | Exec Summary ====  6m |   |
| | About Us       [===           ] |  | Terms       ===     5m |  |
| | Scope          [==========    ] |  | Team        ==      3m |  |
| | Approach       [=====         ] |  | Approach    ==      3m |  |
| | Timeline       [======        ] |  | Timeline    =       2m |  |
| | Pricing        [==============] |  | About Us    =       1m |  |
| | Case Studies   [====          ] |  |                        |  |
| | Team           [======        ] |  |                        |  |
| | Terms          [=========     ] |  |                        |  |
| |                                 |  |                        |  |
| +---------------------------------+  +------------------------+  |
|                                                                  |
| +-- ENGAGEMENT SCORE ----------------------------------------+   |
| |  Score: 82/100 (High Interest)                             |   |
| |  [=======================================-----]            |   |
| |                                                            |   |
| |  Signals: Multiple views, pricing focus, PDF download,     |   |
| |  shared internally, returned after initial view            |   |
| +------------------------------------------------------------+   |
+------------------------------------------------------------------+
```

---

## Screen 6: Proposal Pipeline

**Route:** `/(app)/proposals` (Pipeline View)
**Purpose:** Kanban-style view of all proposals organized by status stage.

### Layout

```
+----------------------------------------------------------------+
| Proposals    [List View | Pipeline View]   [Filter v] [+ New]   |
+----------------------------------------------------------------+
|                                                                  |
| DRAFT         SENT          VIEWED        WON          LOST     |
| (4) $180K     (3) $95K      (5) $210K     (2) $52K     (1) $28K|
|                                                                  |
| +----------+  +----------+  +----------+  +----------+ +------+ |
| |Acme Corp |  |DataFlow  |  |GreenCo   |  |BlueSky  | |Peak   | |
| |Rebrand   |  |Analytics |  |Marketing |  |App Dev  | |Design | |
| |$50,000   |  |$35,000   |  |$32,000   |  |$28,000  | |$28,000| |
| |Updated   |  |Sent 2d   |  |Viewed 6x |  |Won 3d   | |Lost   | |
| |today     |  |ago       |  |Last: 1h  |  |ago      | |1w ago | |
| |[avatar]  |  |[avatar]  |  |[avatar]  |  |[avatar] | |       | |
| +----------+  +----------+  +----------+  +----------+ +------+ |
|                                                                  |
| +----------+  +----------+  +----------+                         |
| |TechStart |  |Meridian  |  |Nova Inc  |                         |
| |MVP Build |  |Consulting|  |Website   |                         |
| |$120,000  |  |$28,000   |  |$45,000   |                         |
| |Draft     |  |Sent 5d   |  |Viewed 2x |                         |
| |[avatar]  |  |ago       |  |Last: 3d  |                         |
| +----------+  +----------+  +----------+                         |
|                                                                  |
| +----------+               +----------+                          |
| |FreshFood |               |Apex      |                          |
| |SEO       |               |Platform  |                          |
| |$18,000   |               |$85,000   |                          |
| |Draft     |               |Viewed 12x|                          |
| +----------+               +----------+                          |
+------------------------------------------------------------------+
```

### Kanban Card Details

Each card displays:
- Client name (bold)
- Project title
- Deal value
- Status-specific info (e.g., "Viewed 6x" for viewed stage)
- Time in current stage
- Assigned team member avatar
- Engagement indicator (green/yellow/red dot based on engagement score)

### Interactions

- **Drag and drop**: Move cards between columns (with confirmation for Won/Lost)
- **Click card**: Opens proposal detail slide-over panel
- **Right-click card**: Quick actions (edit, duplicate, archive, delete)
- **Column headers**: Click to see stage-specific metrics

### Filters

- Date range (created, sent, last viewed)
- Client
- Template used
- Assigned team member
- Value range
- Tags

---

## Screen 7: Content Library

**Route:** `/(app)/content-library`
**Purpose:** Searchable repository of reusable content blocks.

### Layout

```
+----------------------------------------------------------------+
| Content Library                    [Search...        ] [+ New]   |
+----------------------------------------------------------------+
| Type:  [All] [Case Studies] [Team Bios] [Methodology]           |
|        [Terms] [About] [Portfolio] [FAQ]                         |
+----------------------------------------------------------------+
|                                                                  |
| +-- CONTENT BLOCK CARD -+  +-- CONTENT BLOCK CARD -+            |
| | [Case Study]          |  | [Team Bio]            |            |
| |                       |  |                       |            |
| | Acme Corp Rebrand     |  | Sarah Chen, Founder  |            |
| |                       |  |                       |            |
| | Challenge: Outdated   |  | [Photo]               |            |
| | brand identity...     |  | 15 years in digital   |            |
| |                       |  | marketing strategy... |            |
| | Results: 40% increase |  |                       |            |
| | in qualified leads    |  | Used in: 18 proposals |            |
| |                       |  | Win rate: 58%         |            |
| | Used in: 12 proposals |  |                       |            |
| | Tags: branding, B2B   |  | Tags: leadership      |            |
| |                       |  |                       |            |
| | [Edit] [Insert] [...]|  | [Edit] [Insert] [...]|            |
| +------------------------+  +-----------------------+            |
|                                                                  |
| +-- CONTENT BLOCK CARD -+  +-- CONTENT BLOCK CARD -+            |
| | [Methodology]          |  | [Terms]               |            |
| |                       |  |                       |            |
| | Agile Web Dev Process |  | Standard Terms v3.1  |            |
| |                       |  |                       |            |
| | Our proven 4-phase    |  | Payment: 50% deposit, |            |
| | approach to web...    |  | milestones, Net 30... |            |
| |                       |  |                       |            |
| | Used in: 31 proposals |  | Used in: 45 proposals |            |
| | Win rate: 61%         |  |                       |            |
| |                       |  |                       |            |
| | [Edit] [Insert] [...]|  | [Edit] [Insert] [...]|            |
| +------------------------+  +-----------------------+            |
+------------------------------------------------------------------+
```

---

## Screen 8: Template Manager

**Route:** `/(app)/templates`
**Purpose:** Manage proposal templates with performance data.

### Layout

```
+----------------------------------------------------------------+
| Templates                          [Filter v]  [+ New Template]  |
+----------------------------------------------------------------+
|                                                                  |
| +-- TEMPLATE CARD -------------------------------------------+  |
| |                                                             |  |
| | [Preview    ]  Web Development Proposal                     |  |
| | [Thumbnail  ]                                               |  |
| | [           ]  Category: Web Development                    |  |
| | [           ]  Last updated: Jan 15, 2026                   |  |
| |                                                             |  |
| |  Used: 23 times  |  Win Rate: 62%  |  Avg Value: $45K      |  |
| |  [=================================]                        |  |
| |                                                             |  |
| |  [Use Template]  [Edit]  [Duplicate]  [...]                 |  |
| +-------------------------------------------------------------+  |
|                                                                  |
| +-- TEMPLATE CARD -------------------------------------------+  |
| |                                                             |  |
| | [Preview    ]  Brand & Identity Proposal                    |  |
| | [Thumbnail  ]                                               |  |
| | [           ]  Category: Branding                           |  |
| | [           ]  Last updated: Feb 1, 2026                    |  |
| |                                                             |  |
| |  Used: 18 times  |  Win Rate: 55%  |  Avg Value: $32K      |  |
| |  [==========================]                               |  |
| |                                                             |  |
| |  [Use Template]  [Edit]  [Duplicate]  [...]                 |  |
| +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

## Screen 9: Client Directory

**Route:** `/(app)/clients`
**Purpose:** Manage client contacts and view per-client proposal history.

### Layout

```
+----------------------------------------------------------------+
| Clients                            [Search...     ]  [+ New]    |
+----------------------------------------------------------------+
|                                                                  |
| Client            Industry     Proposals  Win Rate  Total Value  |
| -------           --------     ---------  --------  -----------  |
| Acme Corp         Technology      8         63%       $210K     |
| TechStart Inc     SaaS            3         33%       $120K     |
| GreenCo           Sustainability  5         60%       $85K      |
| DataFlow          Analytics       2         50%       $70K      |
| Nova Inc          E-commerce      4         75%       $65K      |
|                                                                  |
+----------------------------------------------------------------+
```

### Client Detail (Slide-over Panel)

```
+-- CLIENT DETAIL PANEL ----------------------------------+
|                                                          |
| Acme Corp                                    [Edit]      |
| Industry: Technology                                     |
| Website: acmecorp.com                                    |
|                                                          |
| Contacts:                                                |
|  John Smith - CEO - john@acmecorp.com                    |
|  Lisa Park - CMO - lisa@acmecorp.com                     |
|                                                          |
| --- Proposal History ---                                 |
|                                                          |
| [Won] Brand Refresh - $50K - Jan 2026                    |
| [Lost] SEO Campaign - $18K - Nov 2025                    |
| [Won] Website MVP - $35K - Aug 2025                      |
|                                                          |
| Win Rate: 63% (5 won / 8 sent)                           |
| Total Revenue: $210K                                     |
| Avg Deal Size: $26K                                      |
|                                                          |
| CRM: HubSpot (synced)  [View in HubSpot ->]             |
+----------------------------------------------------------+
```

---

## Screen 10: Team Settings

**Route:** `/(app)/settings/team`
**Purpose:** Manage team members, roles, and approval workflows.

### Layout

```
+----------------------------------------------------------------+
| Settings > Team                                  [+ Invite]      |
+----------------------------------------------------------------+
|                                                                  |
| TEAM MEMBERS                                                     |
|                                                                  |
| [Avatar] Sarah Chen         Owner        sarah@agency.com       |
|          12 proposals this month                                 |
|                                                                  |
| [Avatar] Marcus Rivera      Admin        marcus@agency.com      |
|          8 proposals this month          [Edit Role] [Remove]    |
|                                                                  |
| [Avatar] Priya Sharma       Member       priya@agency.com       |
|          5 proposals this month          [Edit Role] [Remove]    |
|                                                                  |
| [Avatar] Alex Kim           Viewer       alex@agency.com        |
|          View only                       [Edit Role] [Remove]    |
|                                                                  |
| --- PENDING INVITATIONS ---                                      |
|                                                                  |
| david@agency.com    Member    Invited Feb 5    [Resend] [Revoke]|
|                                                                  |
| --- APPROVAL WORKFLOWS ---                                       |
|                                                                  |
| [x] Require approval before sending proposals                    |
|     Required approvers: [Sarah Chen v] [Marcus Rivera v]         |
|     Minimum approvals needed: [1 v]                              |
|                                                                  |
| [ ] Require approval for proposals over $___                     |
|                                                                  |
| [x] Notify team on proposal status changes                       |
|     Channels: [x] Email  [x] In-app  [ ] Slack                  |
+------------------------------------------------------------------+
```

---

## Screen 11: Settings / Branding

**Route:** `/(app)/settings/branding`
**Purpose:** Customize how proposals look with agency branding.

### Layout

```
+----------------------------------------------------------------+
| Settings > Branding                              [Save Changes]  |
+----------------------------------------------------------------+
|                                                                  |
| +-- BRAND IDENTITY --------+  +-- LIVE PREVIEW -----------+    |
| |                           |  |                            |    |
| | Logo                      |  | [Preview of a proposal    |    |
| | [Upload Logo] [Remove]    |  |  header/cover page with   |    |
| | [current-logo.svg]        |  |  current branding applied]|    |
| |                           |  |                            |    |
| | Primary Color             |  |  Agency Name               |    |
| | [#2563EB] [color picker]  |  |  Proposal for Client Co   |    |
| |                           |  |                            |    |
| | Secondary Color           |  |  [Logo positioned in       |    |
| | [#0F172A] [color picker]  |  |   selected location]       |    |
| |                           |  |                            |    |
| | Accent Color              |  |                            |    |
| | [#D4A843] [color picker]  |  |                            |    |
| |                           |  |                            |    |
| | Heading Font              |  |                            |    |
| | [Cal Sans        v]       |  |                            |    |
| |                           |  |                            |    |
| | Body Font                 |  |                            |    |
| | [Inter           v]       |  |                            |    |
| |                           |  |                            |    |
| | Logo Position             |  |                            |    |
| | (o) Top Left              |  |                            |    |
| | ( ) Top Center            |  |                            |    |
| | ( ) Top Right             |  |                            |    |
| |                           |  |                            |    |
| +---------------------------+  +----------------------------+    |
|                                                                  |
| +-- PROPOSAL DEFAULTS ------------------------------------------+|
| |                                                                ||
| | Default Valid Until: [30 days v] after sending                  ||
| | Default Payment Terms: [Net 30 v]                              ||
| | Footer Text: [Your Agency Name | youragency.com          ]    ||
| | Custom Domain: [proposals.youragency.com      ] [Verify]       ||
| |                                                                ||
| +----------------------------------------------------------------+|
+------------------------------------------------------------------+
```

---

## Screen 12: Win Rate Analytics

**Route:** `/(app)/analytics`
**Purpose:** Organization-wide analytics revealing what proposal attributes correlate with wins.

### Layout

```
+----------------------------------------------------------------+
| Analytics                    [Date Range: Last 6 Months v]       |
+----------------------------------------------------------------+
|                                                                  |
| +-- OVERVIEW METRICS (4 cards) -----------------------------+   |
| | [Total      ] [Win Rate   ] [Avg Deal  ] [Total Revenue  ]|   |
| | [Proposals  ] [           ] [Size      ] [Won            ]|   |
| | [   87      ] [   54%     ] [  $38K    ] [   $1.78M      ]|   |
| | [ +12 vs    ] [ +6% vs    ] [ +$5K vs  ] [ +$340K vs     ]|   |
| | [ last qtr  ] [ last qtr  ] [ last qtr ] [ last qtr      ]|   |
| +------------------------------------------------------------+   |
|                                                                  |
| +-- WIN RATE BY PRICING MODEL --+  +-- WIN RATE BY TEMPLATE -+  |
| |                                |  |                         |  |
| | Value-Based  [==========] 68% |  | Web Dev     [======] 62%|  |
| | Fixed Price  [========  ] 55% |  | Branding    [=====] 55% |  |
| | Retainer     [=======   ] 51% |  | Marketing   [======] 58%|  |
| | T&M          [======    ] 42% |  | Consulting  [====] 48%  |  |
| |                                |  | SEO         [===] 40%   |  |
| +--------------------------------+  +-------------------------+  |
|                                                                  |
| +-- WIN RATE BY DEAL SIZE -----------------------------------+   |
| |                                                             |   |
| |  70% |        *                                             |   |
| |  60% |   *         *                                        |   |
| |  50% | *                  *                                  |   |
| |  40% |                         *          *                  |   |
| |  30% |                                         *            |   |
| |      +--+-----+-----+-----+-----+-----+-----+-----+       |   |
| |       $5K   $15K   $30K   $50K   $75K  $100K $150K $200K+  |   |
| |                                                             |   |
| |  Sweet spot: $15K-$50K range (58-65% win rate)              |   |
| +-------------------------------------------------------------+   |
|                                                                  |
| +-- AI INSIGHTS ---------------------------------------------+   |
| |                                                             |   |
| |  Based on your last 87 proposals:                           |   |
| |                                                             |   |
| |  1. Proposals with detailed timelines win 34% more often    |   |
| |  2. Including 2+ case studies increases win rate by 22%     |   |
| |  3. Proposals sent within 48 hours have 28% higher close    |   |
| |  4. Value-based pricing outperforms T&M by 26% for $50K+   |   |
| |  5. Clients in healthcare spend 2x more time on compliance  |   |
| |                                                             |   |
| +-------------------------------------------------------------+   |
|                                                                  |
| +-- CONVERSION FUNNEL ----------------------------------------+  |
| |                                                              |  |
| |  Draft (87) --> Sent (72) --> Viewed (68) --> Won (39)       |  |
| |  [===========================================================] |
| |  [==========================================]     Lost (29)  |  |
| |  [=====================================]         Expired (4) |  |
| |                                                              |  |
| |  Draft->Sent: 83%  |  Sent->Viewed: 94%  |  Viewed->Won: 57%| |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Global UI Elements

### Notification Center

```
+-- NOTIFICATION DROPDOWN ----------+
|                                    |
| [blue dot] John opened Acme       |
|   proposal - 5 min ago            |
|                                    |
| [green dot] GreenCo proposal won! |
|   Signed by Lisa Park - 1h ago    |
|                                    |
| [gray dot] Marcus commented on    |
|   TechStart scope section - 3h ago|
|                                    |
| [See All Notifications ->]        |
+------------------------------------+
```

### Command Palette (Cmd+K)

```
+-- COMMAND PALETTE ----------------+
| [Search proposals, clients...]    |
|                                    |
| Recent:                            |
|   Acme Corp Rebrand proposal      |
|   TechStart MVP proposal          |
|                                    |
| Quick Actions:                     |
|   + New Proposal                   |
|   + New Client                     |
|   View Analytics                   |
|   Open Settings                    |
+------------------------------------+
```

### Toast Notifications

- Success (green): "Proposal sent to john@acmecorp.com"
- Info (blue): "AI generation complete - draft ready"
- Warning (amber): "Proposal expires in 3 days"
- Error (red): "Failed to save. Retrying..."

---

## Accessibility Requirements

| Requirement | Implementation |
| ----------- | -------------- |
| Keyboard navigation | All interactive elements focusable, logical tab order, skip-to-content link |
| Screen readers | ARIA labels on all controls, live regions for real-time updates, semantic HTML |
| Color contrast | WCAG AA minimum (4.5:1 for text, 3:1 for large text), never rely on color alone |
| Focus indicators | Visible focus ring (2px blue outline) on all interactive elements |
| Motion | `prefers-reduced-motion` respected, no auto-playing animations |
| Text scaling | Layout supports 200% text zoom without horizontal scrolling |
| Editor accessibility | TipTap configured with ARIA roles, keyboard shortcuts for all formatting |
| Forms | All inputs have visible labels, error messages linked via `aria-describedby` |
