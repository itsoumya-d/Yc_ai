# DealRoom -- Screens

## Screen Architecture

DealRoom follows a standard B2B SaaS dashboard layout optimized for data-dense sales workflows on desktop screens (1280px+). The interface adapts to tablet (768px+) for on-the-go use but is not designed as a mobile-first experience.

### Navigation Structure

```
+------------------------------------------------------------------+
|  TOPBAR: Logo | Search (Cmd+K) | Notifications | Profile         |
+------+-----------------------------------------------------------+
|      |                                                            |
| SIDE |                    MAIN CONTENT AREA                       |
| BAR  |                                                            |
|      |  +------------------------------------------------------+  |
|  D   |  |  PAGE HEADER: Title | Actions | Filters              |  |
|  a   |  +------------------------------------------------------+  |
|  s   |  |                                                      |  |
|  h   |  |  PRIMARY CONTENT                                     |  |
|  b   |  |  (Dashboard widgets / Deal board / Detail view)       |  |
|  o   |  |                                                      |  |
|  a   |  +------------------------------------------------------+  |
|  r   |  |  SECONDARY CONTENT (if applicable)                   |  |
|  d   |  |  (Activity feed / AI insights panel)                 |  |
|      |  +------------------------------------------------------+  |
|      |                                                            |
+------+-----------------------------------------------------------+
```

### Sidebar Navigation Items

| Icon | Label | Route | Badge |
|------|-------|-------|-------|
| LayoutDashboard | Dashboard | `/dashboard` | -- |
| Kanban | Deal Board | `/deals` | Deal count |
| Mail | Emails | `/emails` | Unread count |
| Phone | Calls | `/calls` | New recordings |
| TrendingUp | Forecast | `/forecast` | -- |
| Users | Contacts | `/contacts` | -- |
| GraduationCap | Coaching | `/coaching` | New insights |
| BarChart3 | Analytics | `/analytics` | -- |
| FileText | Reports | `/reports` | -- |
| Settings | Settings | `/settings` | -- |

### Global Elements

- **Command Palette (Cmd+K):** Quick search across deals, contacts, emails. Supports actions ("Create deal", "Generate follow-up for Acme deal").
- **Notification Bell:** Unread count badge, dropdown with recent alerts (deal health, CRM sync issues, AI insights).
- **Profile Menu:** User settings, team switch (for users in multiple orgs), sign out.
- **Breadcrumbs:** Context-aware breadcrumb trail on detail pages.

---

## Screen 1: Dashboard

**Route:** `/dashboard`
**Purpose:** Daily command center for sales reps and managers. Shows everything needed to start the workday.

### Layout

```
+------------------------------------------------------------------+
| TOPBAR                                                            |
+------+-----------------------------------------------------------+
| SIDE | DASHBOARD                                      [Date Range]|
| BAR  +-----------------------------------------------------------+
|      | +------------------+ +------------------+ +---------------+|
|      | | PIPELINE VALUE   | | FORECAST THIS QTR| | DEALS AT RISK ||
|      | | $2.4M            | | $890K / $1.2M    | | 7 deals       ||
|      | | +12% vs last mo  | | 74% of quota     | | $340K at risk ||
|      | +------------------+ +------------------+ +---------------+|
|      +-----------------------------------------------------------+|
|      | TODAY'S PRIORITIES                           [View All]    ||
|      | +--------------------------------------------------------+||
|      | | 1. Acme Corp - Follow up (ghosted 5 days)  [Score: 42] |||
|      | | 2. TechStart - Send proposal (close date Fri) [Score:71]|||
|      | | 3. DataFlow - Engage CFO (single-threaded)  [Score: 55] |||
|      | | 4. CloudBase - Demo scheduled tomorrow       [Score: 83] |||
|      | | 5. SecureNet - Competitor detected (Gong)    [Score: 61] |||
|      | +--------------------------------------------------------+||
|      +-----------------------------------------------------------+|
|      | PIPELINE BY STAGE              | RECENT ACTIVITY           ||
|      | +----------------------------+ | +------------------------+||
|      | | [Bar chart showing deal    | | | 10:23 Email from J.Smith|||
|      | |  count and value per stage]| | | 09:45 Call with Acme    |||
|      | |                            | | | 09:12 Deal stage updated|||
|      | |                            | | | Yesterday               |||
|      | |                            | | | 16:30 AI Insight: ...   |||
|      | +----------------------------+ | +------------------------+||
|      +-----------------------------------------------------------+|
|      | AI INSIGHTS                                                ||
|      | +--------------------------------------------------------+||
|      | | "3 deals have been in Proposal stage for 14+ days.      |||
|      | |  This is 2x your average. Consider accelerating."       |||
|      | |                               [View Deals] [Dismiss]    |||
|      | +--------------------------------------------------------+||
+------+-----------------------------------------------------------+
```

### UI Elements

| Element | Component | States |
|---------|-----------|--------|
| **Summary Cards** | Stat card with trend indicator | Loading (skeleton), populated, error |
| **Priority List** | Numbered list with deal name, reason, score badge | Empty ("No priorities today"), 1-10 items |
| **Pipeline Chart** | Horizontal stacked bar (Recharts) | Loading, populated, empty pipeline |
| **Activity Feed** | Chronological list with avatars and icons | Loading, populated, empty |
| **AI Insight Card** | Dismissable card with action buttons | New, viewed, dismissed, acted-on |

### States

- **First Visit (Onboarding):** Empty state with setup checklist (Connect CRM, Connect Email, Import Deals)
- **No Deals:** Empty state illustration with "Import your first deals" CTA
- **Loading:** Skeleton placeholders for all widgets
- **Error:** Individual widget error states with retry buttons (don't block the whole page)
- **Manager View:** Toggle between "My Deals" and "Team Deals" -- manager sees aggregate metrics and team member breakdown

### Accessibility

- All charts have text alternatives and screen reader descriptions
- Summary cards use semantic headings (h2 for card titles)
- Color is never the only indicator -- icons and text labels accompany color-coded statuses
- Keyboard navigation: Tab through widgets, Enter to drill down
- Focus management: After dismissing an insight, focus moves to next insight

---

## Screen 2: Deal Board

**Route:** `/deals`
**Purpose:** Visual pipeline management with drag-and-drop stage updates.

### Layout

```
+------------------------------------------------------------------+
| DEAL BOARD                    [View: Kanban | List] [+ New Deal]  |
| Filters: [Owner v] [Amount v] [Health v] [Close Date v] [Reset]  |
+------------------------------------------------------------------+
| PROSPECTING  | QUALIFICATION | PROPOSAL    | NEGOTIATION | CLOSED|
| 12 deals     | 8 deals       | 5 deals     | 3 deals     | WON  |
| $180K        | $420K         | $890K       | $340K       | 2     |
+--------------|---------------|-------------|-------------|-------|
| +----------+ | +----------+  | +----------+| +----------+|      |
| | Acme Corp| | | TechStart|  | | DataFlow || | CloudBase||      |
| | $45,000  | | | $120,000 |  | | $250,000 || | $180,000 ||      |
| | Score: 42| | | Score: 71|  | | Score: 55 || | Score: 83||      |
| | [!] Risk | | | J. Smith |  | | M. Lee   || | A. Patel ||      |
| | 5d ago   | | | Today    |  | | 3d ago   || | Tomorrow ||      |
| +----------+ | +----------+  | +----------+| +----------+|      |
| +----------+ | +----------+  | +----------+|             |      |
| | SecureNet| | | BioTech  |  | | FinServ  ||             |      |
| | $32,000  | | | $85,000  |  | | $350,000 ||             |      |
| | Score: 61| | | Score: 78|  | | Score: 68||             |      |
| | R. Chen  | | | L. Park  |  | | K. Wong  ||             |      |
| | 1d ago   | | | 2d ago   |  | | Today    ||             |      |
| +----------+ | +----------+  | +----------+|             |      |
+------------------------------------------------------------------+
```

### Deal Card Component

Each deal card in the kanban displays:

| Element | Position | Detail |
|---------|----------|--------|
| **Company Name** | Top, bold | Primary identifier |
| **Deal Amount** | Below name | Formatted currency ($45,000) |
| **AI Score Badge** | Right side | Color-coded circle (green/amber/red) with number |
| **Health Indicator** | Left border | 4px colored left border matching health status |
| **Owner Avatar** | Bottom left | Small circular avatar with initials |
| **Last Activity** | Bottom right | Relative time ("2h ago", "Yesterday") |
| **Alert Icon** | Top right | Warning triangle for at-risk/critical deals |
| **Close Date** | Tooltip on hover | Full date displayed on hover |

### Deal Card States

- **Default:** White background, subtle border
- **Hover:** Slight elevation (shadow), cursor: grab
- **Dragging:** Elevated, semi-transparent, placeholder in original position
- **Drop Target:** Column header highlights, insertion indicator shows
- **At Risk:** Amber left border, warning icon
- **Critical:** Red left border, pulsing warning icon
- **Selected:** Blue outline (for bulk actions)

### List View Alternative

Tabular view with columns: Deal Name, Company, Amount, Stage, AI Score, Health, Owner, Close Date, Last Activity, Days in Stage. Sortable by any column. Bulk actions (change owner, change stage) available.

### Interactions

- **Drag and Drop:** Drag deal card to new stage column to update stage (syncs to CRM)
- **Click Deal Card:** Opens deal detail page
- **Right-Click Deal Card:** Context menu (Edit, Change Owner, Add Note, Generate Follow-Up)
- **Column Header Click:** Sort deals within column
- **New Deal Button:** Opens deal creation form (slide-over panel)

---

## Screen 3: Deal Detail

**Route:** `/deals/[dealId]`
**Purpose:** Deep dive into a single deal -- all context, history, and AI recommendations in one place.

### Layout

```
+------------------------------------------------------------------+
| < Back to Board    ACME CORP - Enterprise License    [Edit] [...] |
+------------------------------------------------------------------+
| +--------------------+ +----------------------------------------+ |
| | DEAL SUMMARY       | | ACTIVITY TIMELINE                      | |
| | Amount: $45,000    | | +------------------------------------+ | |
| | Stage: Proposal    | | | Today                              | | |
| | Close: Mar 15      | | | 10:23 Email sent to J. Smith       | | |
| | Owner: Sarah T.    | | |   "Following up on proposal..."    | | |
| | Created: Jan 8     | | | 09:15 AI Insight: Champion         | | |
| | Days in stage: 12  | | |   engagement dropping               | | |
| +--------------------+ | | Yesterday                          | | |
| | AI DEAL SCORE      | | | 14:30 Meeting with J. Smith        | | |
| | +----------------+ | | |   [View Summary] [Action Items]    | | |
| | |     72 / 100   | | | | 11:00 Email from J. Smith          | | |
| | |   [trend: -5]  | | | |   Sentiment: Positive              | | |
| | +----------------+ | | | Jan 28                             | | |
| | Positive:          | | | 16:00 Stage changed: Qual->Prop    | | |
| | + Active champion  | | | 10:30 Call with M. Johnson (CFO)   | | |
| | + Multi-threaded   | | |   Duration: 32 min                 | | |
| | Negative:          | | +------------------------------------+ | |
| | - No recent call   | |                                        | |
| | - CFO not engaged  | | STAKEHOLDER MAP                        | |
| +--------------------+ | +------------------------------------+ | |
| | NEXT BEST ACTIONS  | | | [Champion] J. Smith - VP Eng       | | |
| | 1. Schedule call   | | |   Last contact: Today              | | |
| |    with CFO        | | |   Engagement: High                 | | |
| | 2. Send pricing    | | | [Decision Maker] M. Johnson - CFO  | | |
| |    comparison      | | |   Last contact: 14 days ago        | | |
| | 3. Ask champion    | | |   Engagement: Low [!]              | | |
| |    for intro to    | | | [End User] R. Davis - Sr. Eng      | | |
| |    procurement     | | |   Last contact: 7 days ago         | | |
| | [Generate Email]   | | |   Engagement: Medium               | | |
| +--------------------+ | +------------------------------------+ | |
+------------------------------------------------------------------+
```

### Sections

| Section | Position | Description |
|---------|----------|-------------|
| **Deal Summary** | Left sidebar top | Key deal metadata (editable inline) |
| **AI Deal Score** | Left sidebar middle | Score with breakdown, trend chart |
| **Next Best Actions** | Left sidebar bottom | AI-recommended actions with CTAs |
| **Activity Timeline** | Center column | Chronological feed of all deal activities |
| **Stakeholder Map** | Right of timeline | Visual stakeholder relationships and engagement |
| **Notes** | Tab or expandable section | Free-form notes, shared with team |
| **Files** | Tab or expandable section | Attachments, proposals, contracts |
| **CRM Data** | Tab or expandable section | Raw CRM fields for reference |

### States

- **Loading:** Progressive loading -- summary first, then timeline, then AI insights
- **Deal Won:** Celebration confetti animation, green banner, "Deal Closed!" message
- **Deal Lost:** Somber gray treatment, "Loss Analysis" tab appears with AI post-mortem
- **Stalled:** Amber banner at top with "This deal has had no activity for X days" warning

---

## Screen 4: Email Composer

**Route:** `/deals/[dealId]/compose` or modal overlay
**Purpose:** AI-assisted email drafting for deal follow-ups.

### Layout

```
+------------------------------------------------------------------+
| COMPOSE EMAIL                                           [X Close] |
+------------------------------------------------------------------+
| To: [john.smith@acme.com]              [CC] [BCC]                 |
| Subject: [Following up on our proposal discussion]                |
+------------------------------------------------------------------+
| AI GENERATION                                                     |
| +--------------------------------------------------------------+ |
| | Context: Acme Corp - Enterprise License ($45K)                | |
| | Stage: Proposal | Last Contact: 2 days ago                   | |
| |                                                               | |
| | Tone: [Professional v]  Type: [Follow-up v]  Length: [Med v]  | |
| |                                                               | |
| | [Generate Email]  [Regenerate]  [Use Template v]              | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| | Hi John,                                                      | |
| |                                                               | |
| | Thank you for taking the time to review our proposal on       | |
| | Tuesday. I wanted to follow up on the pricing discussion      | |
| | and address the questions your team raised about the          | |
| | implementation timeline.                                      | |
| |                                                               | |
| | Based on our conversation, I've prepared a revised timeline   | |
| | that accounts for your Q2 launch target...                   | |
| |                                                               | |
| | [Rich text editor with formatting toolbar]                    | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| [Attach File]  [Schedule Send v]        [Save Draft]  [Send]     |
+------------------------------------------------------------------+
| AI SUGGESTIONS                                                    |
| +--------------------------------------------------------------+ |
| | "Consider mentioning the ROI data from the case study John   | |
| |  requested during the demo."                                  | |
| | "Add a specific call-to-action with proposed meeting times." | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Component | Behavior |
|---------|-----------|----------|
| **To/CC/BCC Fields** | Auto-complete with deal contacts | Shows contact role badge |
| **Subject Line** | AI-suggested, editable | Updates as tone/type changes |
| **AI Generation Panel** | Collapsible panel | Shows deal context, generation controls |
| **Tone Selector** | Dropdown | Professional, Casual, Urgent, Executive |
| **Type Selector** | Dropdown | Follow-up, Introduction, Proposal, Re-engagement, Thank You |
| **Length Selector** | Dropdown | Short (2-3 sentences), Medium (1-2 paragraphs), Long (3+ paragraphs) |
| **Rich Text Editor** | TipTap editor | Bold, italic, lists, links, variables, signature |
| **AI Suggestions Panel** | Collapsible bottom panel | Contextual writing tips based on deal history |
| **Schedule Send** | Dropdown button | Send now, Schedule (date/time picker), Best time (AI-recommended) |

### States

- **Generating:** Streaming text animation as AI generates the email content
- **Generated:** Full email displayed in editor, "Generated by AI" badge, edit freely
- **Edited:** "Edited" badge replaces "Generated" badge after user modifies AI text
- **Sending:** Button disabled, spinner, "Sending..." text
- **Sent:** Success toast notification, redirect to deal detail, activity logged
- **Error:** Error toast with retry button, draft auto-saved

---

## Screen 5: Call Intelligence

**Route:** `/calls/[callId]`
**Purpose:** Review call recordings with AI-generated summaries, transcripts, and action items.

### Layout

```
+------------------------------------------------------------------+
| CALL: Acme Corp Demo - Jan 28, 2025               Duration: 32m  |
| Participants: Sarah T. (rep), John Smith, Maria Lee               |
+------------------------------------------------------------------+
| +----------------------------+ +--------------------------------+ |
| | AUDIO PLAYER               | | KEY MOMENTS                    | |
| | [====>-----------] 12:34   | | +----------------------------+ | |
| | [<<] [Play] [>>] [1.5x]   | | | 03:21 Pricing Discussion   | | |
| +----------------------------+ | | 12:45 Competitor Mention    | | |
| | SUMMARY                    | | | 18:30 Technical Objection   | | |
| | +------------------------+ | | | 25:10 Next Steps Agreed     | | |
| | | John expressed interest | | | 28:45 Champion Buy-In       | | |
| | | in the enterprise plan  | | +----------------------------+ | |
| | | but raised concerns     | | | ACTION ITEMS                   | |
| | | about implementation    | | | +----------------------------+ | |
| | | timeline. Maria asked   | | | | [ ] Send revised timeline  | | |
| | | about API integration   | | | | [ ] Share API docs         | | |
| | | capabilities. Both were | | | | [ ] Schedule follow-up     | | |
| | | positive about the ROI  | | | |     with CFO               | | |
| | | analysis presented.     | | | | [ ] Prepare pricing comp   | | |
| | +------------------------+ | | +----------------------------+ | |
| +----------------------------+ |                                  | |
| | TRANSCRIPT                 | | OBJECTIONS RAISED              | |
| | +------------------------+ | | +----------------------------+ | |
| | | [Sarah] 00:00          | | | | 1. Implementation takes    | | |
| | | Welcome everyone to    | | | |    too long (6 months)     | | |
| | | today's demo...        | | | | 2. API documentation       | | |
| | |                        | | | |    quality concerns        | | |
| | | [John] 00:45           | | | | 3. Price vs. Gong for      | | |
| | | Thanks Sarah, we're    | | | |    similar features        | | |
| | | excited to see the     | | | +----------------------------+ | |
| | | platform in action...  | | |                                  | |
| | |                        | | | SENTIMENT ANALYSIS              | |
| | | [Sarah] 01:12          | | | +----------------------------+ | |
| | | Let me start with an   | | | | Overall: Positive (0.72)   | | |
| | | overview of how...     | | | | John: Positive (0.65)      | | |
| | +------------------------+ | | | Maria: Neutral (0.48)      | | |
| +----------------------------+ +--------------------------------+ |
+------------------------------------------------------------------+
```

### States

- **Processing:** "Transcription in progress..." with progress bar
- **Ready:** Full transcript and AI analysis available
- **Playing:** Transcript auto-scrolls to match playback position, current line highlighted
- **Key Moment Click:** Audio jumps to that timestamp, transcript scrolls

---

## Screen 6: Forecasting

**Route:** `/forecast`
**Purpose:** AI-powered revenue forecasting for managers and executives.

### Layout

```
+------------------------------------------------------------------+
| FORECAST - Q1 2025                        [Quarter v] [Team v]    |
+------------------------------------------------------------------+
| +------------------+ +------------------+ +---------------------+ |
| | FORECAST         | | QUOTA            | | COVERAGE            | |
| | $890K            | | $1.2M            | | 3.2x                | |
| | 74% of quota     | | Team target       | | Pipeline / Quota    | |
| +------------------+ +------------------+ +---------------------+ |
+------------------------------------------------------------------+
| FORECAST BREAKDOWN                                                |
| +--------------------------------------------------------------+ |
| | Category    | Amount   | Deals | AI Confidence | Rep Forecast| |
| |-------------|----------|-------|---------------|-------------| |
| | Commit      | $340K    | 4     | 89%           | $380K       | |
| | Best Case   | $280K    | 6     | 62%           | $350K       | |
| | Pipeline    | $520K    | 12    | 34%           | $400K       | |
| | Omit        | $180K    | 5     | 12%           | $0          | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| FORECAST TREND                    | DEALS DRIVING FORECAST       |
| +----------------------------+   | +---------------------------+ |
| | [Line chart: AI forecast   |   | | CloudBase  $180K Commit   | |
| |  vs. quota vs. actual      |   | | FinServ    $350K Best     | |
| |  over past 12 weeks]       |   | | TechStart  $120K Commit   | |
| +----------------------------+   | | DataFlow   $250K Pipeline | |
|                                   | +---------------------------+ |
+------------------------------------------------------------------+
| TEAM BREAKDOWN                                                    |
| +--------------------------------------------------------------+ |
| | Rep          | Pipeline | Forecast | Quota  | Attainment     | |
| |--------------|----------|----------|--------|----------------| |
| | Sarah T.     | $420K    | $280K    | $300K  | 93% [=====-]   | |
| | Mike R.      | $380K    | $210K    | $300K  | 70% [===----]  | |
| | Lisa P.      | $290K    | $190K    | $300K  | 63% [===----]  | |
| | Kevin W.     | $510K    | $310K    | $300K  | 103%[======]   | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### States

- **No Data:** Empty state with "Connect your CRM to enable forecasting" CTA
- **Insufficient History:** "At least 1 quarter of data needed for AI forecasting" message
- **On Track:** Green trend indicators, confidence messaging
- **Behind:** Amber/red trend indicators, AI suggestions for acceleration

---

## Screen 7: Coaching Hub

**Route:** `/coaching`
**Purpose:** AI-generated coaching insights for managers and self-improvement for reps.

### Layout

```
+------------------------------------------------------------------+
| COACHING HUB                                    [Rep v] [Period v]|
+------------------------------------------------------------------+
| REP SCORECARD: Sarah T.                                           |
| +--------------------------------------------------------------+ |
| | Win Rate    | Cycle Time  | Activity   | Multi-Thread | Score  | |
| | 34%         | 42 days     | 8.2/day    | 3.1 avg      | B+    | |
| | Team: 28%   | Team: 56d   | Team: 6.1  | Team: 2.4    |       | |
| | [^] Above   | [^] Faster  | [^] Above  | [^] Above    |       | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| AI COACHING INSIGHTS                                              |
| +--------------------------------------------------------------+ |
| | STRENGTH: Early Multi-Threading                               | |
| | Sarah engages 3.1 stakeholders on average by the              | |
| | Qualification stage, vs. team average of 2.4. This            | |
| | correlates with her higher win rate.                           | |
| |                                                 [View Deals]  | |
| +--------------------------------------------------------------+ |
| | IMPROVEMENT: Proposal Follow-Up Speed                         | |
| | Sarah's average time from proposal sent to follow-up is 4.2   | |
| | days. Top performers follow up within 1.5 days. Faster        | |
| | follow-up correlates with 23% higher close rates.             | |
| |                            [Create Reminder] [View Examples]  | |
| +--------------------------------------------------------------+ |
| | COACHING TIP: Executive Engagement                            | |
| | In deals over $50K, Sarah rarely engages C-level contacts.    | |
| | Consider coaching on executive outreach strategies.            | |
| |                                    [Suggested Talk Track]     | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| BEHAVIOR COMPARISON                                               |
| +--------------------------------------------------------------+ |
| | [Radar chart comparing Sarah's behaviors vs. top performers   | |
| |  across: Follow-up speed, Multi-threading, Discovery depth,  | |
| |  Executive engagement, Competitive handling, Close velocity]  | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### States

- **Rep View:** Self-coaching mode with personal metrics and AI suggestions
- **Manager View:** Dropdown to select any team member, team-wide patterns
- **Insufficient Data:** "Complete 10+ deals to enable coaching insights" message

---

## Screen 8: Analytics

**Route:** `/analytics`
**Purpose:** Win rates, cycle time, activity metrics, and trend analysis.

### Layout

```
+------------------------------------------------------------------+
| ANALYTICS                          [Date Range v] [Team v] [Rep v]|
+------------------------------------------------------------------+
| +---------------+ +---------------+ +---------------+ +----------+|
| | WIN RATE      | | AVG CYCLE     | | AVG DEAL SIZE | | ACTIVITY ||
| | 28%           | | 56 days       | | $82K          | | 6.1/day  ||
| | vs 24% prev  | | vs 62d prev   | | vs $74K prev  | | vs 5.8   ||
| +---------------+ +---------------+ +---------------+ +----------+|
+------------------------------------------------------------------+
| WIN RATE OVER TIME              | WIN/LOSS REASONS                |
| +----------------------------+  | +-----------------------------+ |
| | [Line chart: monthly win   |  | | No Decision     34%        | |
| |  rate with trend line]     |  | | Lost to Comp    22%        | |
| +----------------------------+  | | Budget          18%        | |
| PIPELINE CREATION vs CLOSE     | | Timing          15%        | |
| +----------------------------+  | | Champion Left   11%        | |
| | [Bar chart: pipeline       |  | +-----------------------------+ |
| |  created vs closed/won     |  |                                 |
| |  per month]                |  | STAGE CONVERSION RATES          |
| +----------------------------+  | +-----------------------------+ |
|                                  | | Prospect > Qual    62%     | |
| ACTIVITY BREAKDOWN               | | Qual > Proposal    48%     | |
| +----------------------------+   | | Proposal > Nego    55%     | |
| | [Stacked bar: emails,     |   | | Nego > Won         41%     | |
| |  calls, meetings per week] |   | +-----------------------------+ |
| +----------------------------+   |                                  |
+------------------------------------------------------------------+
```

### Interaction Patterns

- All charts are interactive -- hover for details, click to drill down
- Date range selector applies globally to all charts on the page
- Export to CSV/PDF for any chart or the full analytics page
- Filter by team, individual rep, deal amount range, or industry

---

## Screen 9: Contacts / Stakeholders

**Route:** `/contacts`
**Purpose:** Master contact list with engagement tracking across all deals.

### Layout

```
+------------------------------------------------------------------+
| CONTACTS                              [Search...] [+ Add Contact] |
| Filters: [Company v] [Role v] [Engagement v] [Last Contact v]    |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| | Name          | Company    | Title       | Role     | Engmt  | |
| |---------------|------------|-------------|----------|--------| |
| | John Smith    | Acme Corp  | VP Eng      | Champion | High   | |
| | Maria Lee     | Acme Corp  | Sr. Eng     | End User | Med    | |
| | Michael J.    | Acme Corp  | CFO         | Dec.Maker| Low [!]| |
| | Lisa Park     | BioTech    | CTO         | Champion | High   | |
| | Robert Chen   | SecureNet  | Dir. Sales  | Influencr| Med    | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Contact Detail (Slide-Over Panel)

Clicking a contact opens a slide-over with:
- Contact info (name, email, phone, title, LinkedIn)
- Engagement score with trend
- Associated deals (with role in each deal)
- Communication history (emails, calls, meetings)
- AI relationship summary
- Quick actions: Email, Schedule Meeting, Add to Deal

---

## Screen 10: Settings

**Route:** `/settings`
**Purpose:** Configuration for CRM connections, email sync, team management, and preferences.

### Sub-Pages

| Setting | Route | Description |
|---------|-------|-------------|
| **General** | `/settings/general` | Organization name, timezone, date format |
| **CRM Connection** | `/settings/crm` | Connect/disconnect Salesforce or HubSpot, field mapping, sync status |
| **Email Sync** | `/settings/email` | Connect Gmail/Outlook, sync frequency, filtering rules |
| **Calendar** | `/settings/calendar` | Connect Google Calendar, meeting detection settings |
| **Zoom** | `/settings/zoom` | Connect Zoom for recording access |
| **Team** | `/settings/team` | Invite members, assign roles, manage seats |
| **Pipeline** | `/settings/pipeline` | Custom stages, stage order, stage rules |
| **Notifications** | `/settings/notifications` | Alert preferences, digest schedule, channels |
| **Billing** | `/settings/billing` | Plan details, usage, invoices, upgrade/downgrade |
| **API** | `/settings/api` | API keys, webhook configuration (Enterprise) |

### CRM Connection Screen Detail

```
+------------------------------------------------------------------+
| CRM CONNECTION                                                    |
+------------------------------------------------------------------+
| SALESFORCE                                                        |
| +--------------------------------------------------------------+ |
| | Status: Connected                           [Disconnect]      | |
| | Instance: na45.salesforce.com                                 | |
| | Last Sync: 2 minutes ago                    [Sync Now]        | |
| | Objects Synced: Opportunities, Contacts, Activities           | |
| +--------------------------------------------------------------+ |
| | FIELD MAPPING                                [+ Add Mapping]  | |
| | +----------------------------------------------------------+ | |
| | | Salesforce Field     | DealRoom Field    | Direction      | | |
| | |--------------------|-------------------|----------------| | |
| | | Opportunity.Name   | Deal.name         | Bi-directional | | |
| | | Opportunity.Amount | Deal.amount       | Bi-directional | | |
| | | Opportunity.Stage  | Deal.stage        | Bi-directional | | |
| | | Opportunity.Close  | Deal.close_date   | Bi-directional | | |
| | | Custom: MEDDPICC   | Deal.metadata     | Read from CRM  | | |
| | +----------------------------------------------------------+ | |
| +--------------------------------------------------------------+ |
| | SYNC LOG                                                      | |
| | +----------------------------------------------------------+ | |
| | | 10:23 Synced 12 opportunities (0 errors)                  | | |
| | | 10:22 Synced 8 contacts (1 duplicate skipped)             | | |
| | | 09:45 Synced 23 activities (0 errors)                     | | |
| | +----------------------------------------------------------+ | |
+------------------------------------------------------------------+
```

---

## Screen 11: Reports

**Route:** `/reports`
**Purpose:** Pre-built and custom reports for management and board consumption.

### Pre-Built Reports

| Report | Description | Audience |
|--------|-------------|----------|
| **Pipeline Summary** | Pipeline by stage, owner, amount range | VP Sales |
| **Forecast vs. Actual** | Predicted vs. realized revenue by quarter | CRO / Board |
| **Rep Activity** | Emails, calls, meetings per rep per week | Sales Manager |
| **Deal Velocity** | Average time in each stage, bottleneck identification | Rev Ops |
| **Win/Loss Analysis** | Win rates by segment, size, rep, with AI loss reasons | VP Sales |
| **AI Accuracy** | AI deal score vs. actual outcomes over time | Rev Ops |
| **Coaching Summary** | Team strengths, improvement areas, top performer behaviors | Sales Manager |

### Report Builder (Post-MVP)

- Drag-and-drop report builder
- Custom metrics and dimensions
- Scheduled delivery (weekly PDF to VP Sales email)
- Shareable links (read-only, no login required)

---

## Navigation Flow

### Primary User Flows

```
Login --> Dashboard --> Deal Board --> Deal Detail --> Email Composer --> Send
                  |                       |
                  |                       +--> Call Intelligence --> Action Items
                  |
                  +--> Forecast --> Drill into Category --> Deal Detail
                  |
                  +--> Coaching --> Rep Scorecard --> View Deals --> Deal Detail
                  |
                  +--> Analytics --> Drill into Chart --> Filtered Deal List
```

### Onboarding Flow (First-Time User)

```
Sign Up --> Org Setup --> Connect CRM --> Map Fields --> Connect Email --> Import Deals --> Dashboard (with tutorial overlay)
```

### Key Transitions

| From | To | Trigger | Animation |
|------|----|---------|-----------|
| Deal Board | Deal Detail | Click deal card | Slide from right |
| Deal Detail | Email Composer | "Generate Follow-Up" button | Modal overlay with backdrop |
| Dashboard | Deal Detail | Click priority deal | Navigate with breadcrumb update |
| Any Screen | Command Palette | Cmd+K | Fade-in overlay from top |
| Settings | CRM Sync | Sidebar sub-nav click | No animation (instant) |

---

## Responsive Behavior

| Breakpoint | Layout Adjustment |
|------------|-------------------|
| **1440px+** | Full layout with all panels visible |
| **1280px** | Standard layout, sidebar collapsible |
| **1024px** | Collapsed sidebar (icons only), single-column deal detail |
| **768px** | Hidden sidebar (hamburger menu), stacked dashboard widgets |
| **< 768px** | Basic mobile view -- limited to deal list, alerts, and email |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| **WCAG 2.1 AA** | Minimum compliance target |
| **Keyboard Navigation** | Full keyboard access to all features, visible focus indicators |
| **Screen Reader** | ARIA labels on all interactive elements, chart descriptions |
| **Color Contrast** | 4.5:1 minimum for text, 3:1 for large text and UI elements |
| **Motion Sensitivity** | Respect `prefers-reduced-motion`, no auto-playing animations |
| **Focus Management** | Logical tab order, focus trapping in modals, skip links |
| **Error Handling** | Clear error messages with suggestions, not just color changes |
| **Zoom** | Usable at 200% zoom without horizontal scrolling |

---

*Screen designs optimized for the high-information, multi-tasking workflow of B2B sales professionals.*
