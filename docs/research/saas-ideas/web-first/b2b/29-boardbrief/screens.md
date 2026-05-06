# BoardBrief — Screens

## Navigation Architecture

```
Top Navigation Bar (persistent)
  |-- Logo (BoardBrief)
  |-- Board Selector (dropdown, for multi-board users)
  |-- Search (global search)
  |-- Notifications (bell icon with badge)
  |-- User Avatar (dropdown: profile, settings, logout)

Sidebar Navigation (founder/admin view)
  |-- Dashboard
  |-- Board Deck
  |     |-- Builder
  |     |-- Drafts
  |     |-- Published
  |-- Meetings
  |     |-- Upcoming
  |     |-- Past
  |     |-- Scheduler
  |-- Resolutions
  |-- Action Items
  |-- KPI Dashboard
  |-- Documents
  |-- Investor Updates
  |-- Settings
        |-- Integrations
        |-- Board Members
        |-- Billing
        |-- Company Profile

Sidebar Navigation (board member portal view)
  |-- Portal Home
  |-- Upcoming Meetings
  |-- Documents
  |-- Voting / Resolutions
  |-- Action Items
  |-- Profile
```

---

## Screen 1: Dashboard

**Route:** `/dashboard`
**Access:** Founder, Admin, Secretary

**Purpose:** Central command center showing the next board meeting countdown, pending actions requiring attention, and a snapshot of key company metrics.

### Layout

```
+------------------------------------------------------------------+
|  [Sidebar]  |  Dashboard                                          |
|             |                                                     |
|             |  +-------------------+  +------------------------+  |
|             |  | NEXT BOARD MTG    |  | QUICK ACTIONS          |  |
|             |  | Dec 15, 2024      |  | [Generate Board Deck]  |  |
|             |  | 12 days away      |  | [Schedule Meeting]     |  |
|             |  | Status: Deck Draft|  | [Create Resolution]    |  |
|             |  +-------------------+  +------------------------+  |
|             |                                                     |
|             |  +----------------------------------------------+   |
|             |  | PENDING ITEMS                          [3]   |   |
|             |  | ! 2 resolutions awaiting votes               |   |
|             |  | ! 1 action item overdue                      |   |
|             |  | ! Board deck draft needs review              |   |
|             |  +----------------------------------------------+   |
|             |                                                     |
|             |  +----------------------------------------------+   |
|             |  | KEY METRICS SNAPSHOT                          |   |
|             |  | +--------+ +--------+ +--------+ +--------+ |   |
|             |  | | MRR    | | Burn   | | Runway | | Team   | |   |
|             |  | | $142K  | | $85K   | | 18 mo  | | 24     | |   |
|             |  | | +12%   | | -3%    | | +2 mo  | | +3     | |   |
|             |  | +--------+ +--------+ +--------+ +--------+ |   |
|             |  +----------------------------------------------+   |
|             |                                                     |
|             |  +----------------------------------------------+   |
|             |  | RECENT ACTIVITY                               |   |
|             |  | - Board deck v2 saved (2h ago)               |   |
|             |  | - John Smith voted on Resolution #12 (1d)    |   |
|             |  | - QuickBooks data synced (3h ago)            |   |
|             |  +----------------------------------------------+   |
+------------------------------------------------------------------+
```

### UI Elements
- **Next meeting card** — Countdown timer, meeting status (deck draft / deck published / ready), link to meeting details
- **Quick action buttons** — Primary CTAs for common tasks, styled as outlined buttons with icons
- **Pending items alert** — Yellow/amber alert cards for items requiring attention, clickable to navigate to the relevant section
- **Metric cards** — Four metric snapshot cards with value, trend arrow (green up / red down), and percentage change vs. previous period
- **Activity feed** — Chronological list of recent actions across the platform, with avatar, description, and relative timestamp

### States
- **Empty state** — First-time user: onboarding checklist (connect integrations, invite board members, schedule first meeting)
- **No upcoming meeting** — CTA to schedule the next meeting
- **All clear** — No pending items: "You're all caught up" message with suggestion to review KPIs
- **Loading** — Skeleton loaders for metric cards and activity feed
- **Error** — Integration sync failure: warning banner at top with retry button

### Accessibility
- Metric cards use semantic HTML with `aria-label` describing the full context ("Monthly Recurring Revenue: $142,000, up 12% from last month")
- Trend arrows accompanied by text labels, not color alone
- Activity feed is a live region (`aria-live="polite"`) for screen readers
- All interactive elements have visible focus indicators

---

## Screen 2: Board Deck Builder

**Route:** `/deck/[meetingId]/builder`
**Access:** Founder, Admin, Secretary

**Purpose:** The primary workspace for creating and editing AI-generated board decks. Displays slides in a panel layout with a slide list, editor, and data widget sidebar.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Board Deck Builder                    [Preview] [Publish]
|           |                                                       |
|  +--------+---+-----------------------------+------------------+  |
|  | SLIDES     |  SLIDE EDITOR               | DATA WIDGETS     |  |
|  |            |                             |                  |  |
|  | [+Add]     |  Executive Summary          | + Revenue Chart  |  |
|  |            |                             | + MRR Trend      |  |
|  | 1. Exec    |  [AI-generated narrative    | + Burn Rate      |  |
|  |    Summary |   with editable text        | + KPI Table      |  |
|  |            |   and embedded data         | + Pipeline       |  |
|  | 2. Financ  |   widgets]                  | + Headcount      |  |
|  |    ials    |                             | + Custom Chart   |  |
|  |            |  +--------+ +--------+     |                  |  |
|  | 3. KPIs    |  | $142K  | | $1.7M  |     | INTEGRATION      |  |
|  |            |  | MRR    | | ARR    |     | STATUS           |  |
|  | 4. Product |  | +12%   | | +14%   |     | * Stripe [ok]    |  |
|  |            |  +--------+ +--------+     | * QB [ok]        |  |
|  | 5. Sales   |                             | * HubSpot [!]    |  |
|  |            |  [Edit] [Regenerate] [...]  | * Gusto [ok]     |  |
|  | 6. Team    |                             |                  |  |
|  |            +-----------------------------+------------------+  |
|  | 7. Discuss |                                                   |
|  |            |  [< Previous]  Slide 1 of 8  [Next >]           |  |
|  | 8. Appendix|                                                   |
|  +------------+---------------------------------------------------+
```

### UI Elements
- **Slide panel (left)** — Thumbnail list of all slides, drag-and-drop reorder, add/delete slide, slide type indicator icon
- **Slide editor (center)** — Rich text editor (TipTap) with AI-generated content, inline data widgets, formatting toolbar
- **Data widget sidebar (right)** — Draggable data widgets that can be dropped into the slide editor, integration status indicators
- **Top action bar** — Deck title, "Preview" button (full-screen deck preview), "Publish" button (distribute to board portal)
- **Regenerate button** — Per-slide AI regeneration with options (more concise, more detailed, different focus)
- **Slide navigation** — Previous/Next buttons with current slide indicator

### States
- **Generating** — Pulsing skeleton with "AI is generating your board deck..." message and progress indicator per slide
- **Draft** — Yellow "DRAFT" badge, all editing features enabled
- **Published** — Green "PUBLISHED" badge, editing still possible but warns about republishing
- **Integration warning** — Orange warning badge on slides that use data from a disconnected integration
- **Unsaved changes** — Dot indicator on save button, confirmation dialog on navigate away

### Accessibility
- Slide panel uses `role="listbox"` with `aria-selected` for current slide
- Drag-and-drop has keyboard alternative (select slide, use arrow keys + Enter to reorder)
- Data widgets have descriptive labels for screen readers
- Rich text editor supports full keyboard navigation

---

## Screen 3: Meeting Scheduler

**Route:** `/meetings/schedule`
**Access:** Founder, Admin, Secretary

**Purpose:** Create and schedule board meetings with calendar integration, agenda building, and attendee management.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Schedule Board Meeting                                |
|           |                                                       |
|           |  Meeting Details                                      |
|           |  +--------------------------------------------------+ |
|           |  | Title: [Q4 2024 Board Meeting              ]     | |
|           |  | Date:  [Dec 15, 2024] Time: [2:00 PM PST]       | |
|           |  | Duration: [60 min v]  Type: [Regular v]          | |
|           |  | Location: [Zoom link or address         ]       | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Agenda Builder                                       |
|           |  +--------------------------------------------------+ |
|           |  | # | Topic               | Type    | Time | Owner | |
|           |  |---|---------------------|---------|------|-------| |
|           |  | 1 | Call to Order       | Admin   | 2m   | Chair | |
|           |  | 2 | Approve Minutes     | Approve | 5m   | Chair | |
|           |  | 3 | CEO Report          | Info    | 15m  | CEO   | |
|           |  | 4 | Financial Review    | Info    | 15m  | CFO   | |
|           |  | 5 | Hiring Plan         | Discuss | 10m  | CEO   | |
|           |  | 6 | Option Grant Vote   | Vote    | 5m   | Chair | |
|           |  | 7 | Exec Session        | Closed  | 10m  | Chair | |
|           |  | [+ Add Agenda Item]                     Total: 62m | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Attendees                                             |
|           |  +--------------------------------------------------+ |
|           |  | [Avatar] Jane Chen (Chair)    Invited  [RSVP: Y]  | |
|           |  | [Avatar] Michael Ross (Dir)   Invited  [RSVP: -]  | |
|           |  | [Avatar] Sarah Liu (Dir)      Invited  [RSVP: Y]  | |
|           |  | [Avatar] David Park (Obs)     Invited  [RSVP: -]  | |
|           |  | [+ Invite Member]                                 | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  [Save Draft]  [Send Invitations]                     |
+------------------------------------------------------------------+
```

### UI Elements
- **Meeting details form** — Standard form inputs with date picker, time picker (with timezone selector), duration dropdown, meeting type dropdown (Regular, Special, Committee, Annual)
- **Agenda builder** — Table with drag-and-drop rows, inline editing, topic type dropdown (Admin, Approval, Information, Discussion, Vote, Closed Session), time allocation, owner assignment
- **Time tracker** — Running total of allocated time vs. meeting duration, warning when agenda exceeds duration
- **Attendee list** — Board member avatars with name, role, invitation status, RSVP status
- **Template selector** — Load pre-built agenda templates (Standard Board Meeting, Committee Meeting, Special Meeting)

### States
- **New meeting** — Empty form with template selector prominent
- **Draft saved** — "Draft" badge, editable, not yet sent to attendees
- **Invitations sent** — "Invited" badge, RSVP tracking active
- **Quorum check** — Green checkmark when enough RSVPs for quorum, red warning if quorum at risk
- **Past meeting** — Read-only view with links to minutes, deck, and recordings

### Accessibility
- Agenda table rows are focusable and reorderable via keyboard
- Date/time pickers have ARIA labels with timezone context
- RSVP status uses both icon and text (not color alone)

---

## Screen 4: Board Portal (Board Member View)

**Route:** `/portal`
**Access:** Board Members (Directors, Observers)

**Purpose:** The board member's home screen. Shows upcoming meetings, pending votes, assigned action items, and recent documents. Designed for board members who sit on multiple boards.

### Layout

```
+------------------------------------------------------------------+
| [Portal Nav] | Board Portal                     [Board Selector v] |
|              |                                                     |
|              |  +-------------------+  +------------------------+ |
|              |  | UPCOMING MEETINGS |  | PENDING ACTIONS        | |
|              |  |                   |  |                        | |
|              |  | Dec 15 - Acme Inc |  | 2 Votes pending        | |
|              |  | Board Meeting     |  | 1 Action item due      | |
|              |  | [View Materials]  |  | 3 Documents to review  | |
|              |  |                   |  |                        | |
|              |  | Jan 20 - Beta Co  |  | [View All]             | |
|              |  | Board Meeting     |  +------------------------+ |
|              |  | [View Materials]  |                              |
|              |  +-------------------+                              |
|              |                                                     |
|              |  +------------------------------------------------+ |
|              |  | RECENT DOCUMENTS                                | |
|              |  | +----+ Q4 Board Deck - Acme Inc   Dec 10      | |
|              |  | |PDF | Financial Summary attached               | |
|              |  | +----+ [View] [Download]                        | |
|              |  |                                                  | |
|              |  | +----+ November Minutes - Acme     Nov 22      | |
|              |  | |DOC | Approved by board                       | |
|              |  | +----+ [View] [Download]                        | |
|              |  +------------------------------------------------+ |
|              |                                                     |
|              |  +------------------------------------------------+ |
|              |  | MY ACTION ITEMS                                  | |
|              |  | [ ] Review Series B term sheet      Due: Dec 12 | |
|              |  | [ ] Intro to CFO candidate          Due: Dec 20 | |
|              |  | [x] Review Q3 financials            Done Nov 15 | |
|              |  +------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements
- **Board selector** — Dropdown for members who sit on multiple boards, shows board name + company logo
- **Upcoming meetings card** — Meeting date, company name, "View Materials" button that opens the board deck and agenda
- **Pending actions badge** — Count of items requiring action (votes, documents to review, overdue action items)
- **Document list** — Recent documents with type icon (PDF, DOC), title, date, and quick action buttons
- **Action item checklist** — Checkbox list with due dates, status colors (green = done, yellow = upcoming, red = overdue)

### States
- **No upcoming meetings** — Calm state: "No upcoming meetings" with past meeting archive link
- **New materials available** — Blue dot notification on documents section
- **Voting deadline approaching** — Amber urgency indicator on pending votes
- **Multi-board view** — Aggregated view across all boards with company labels

### Accessibility
- Board selector announces current board context to screen readers
- Document list uses semantic list markup
- Action items use checkbox pattern with `aria-checked`
- All status indicators use text + icon, not color alone

---

## Screen 5: Meeting Room (Live)

**Route:** `/meetings/[id]/room`
**Access:** All meeting attendees

**Purpose:** The live meeting interface used during board meetings. Shows the agenda with timer, real-time notes, and action item capture.

### Layout

```
+------------------------------------------------------------------+
| Board Meeting: Q4 2024 Review        [Timer: 0:32:15]  [End Mtg]  |
+------------------------------------------------------------------+
|           |                                    |                   |
| AGENDA    | NOTES                              | ACTIONS           |
|           |                                    |                   |
| 1. [done] | CEO Report                         | + Add Action Item |
|    Call    |                                    |                   |
|            | Key updates discussed:             | [ ] Review term   |
| 2. [done] | - Product launch on track for Q1   |     sheet         |
|    Minutes | - Pipeline at $2.1M               |     -> Jane       |
|            | - Three new enterprise deals       |     Due: Dec 20   |
| 3.[active]|                                    |                   |
|   CEO Rpt | Michael asked about competitive    | [ ] Send customer |
|   (15 min) | landscape changes...              |     NPS report    |
|   [8:23]  |                                    |     -> Sarah      |
|            | [Recording] [AI: Capture Point]   |     Due: Dec 15   |
| 4. Financ |                                    |                   |
|            |                                    |                   |
| 5. Hiring |                                    |                   |
|            |                                    |                   |
| 6. Vote   |                                    |                   |
|            |                                    |                   |
| 7. Exec   |                                    |                   |
+------------------------------------------------------------------+
```

### UI Elements
- **Agenda sidebar** — Checklist of agenda items with status (done/active/upcoming), time allocation, elapsed time per item
- **Current topic indicator** — Highlighted active agenda item with countdown timer
- **Notes panel** — Rich text editor for real-time note-taking during the meeting
- **AI capture button** — One-click to mark a point for AI to expand in minutes
- **Action item panel** — Quick-add action items with assignee and due date
- **Meeting timer** — Running clock at the top, changes color when over time
- **Recording indicator** — Red dot when recording for transcription
- **End meeting button** — Triggers minutes generation workflow

### States
- **Pre-meeting** — Agenda visible, notes empty, timer not started, "Start Meeting" button
- **In-progress** — Timer running, active agenda item highlighted, notes editable
- **Over time** — Timer turns red, current agenda item shows "over by X min"
- **Ended** — Timer stopped, "Generate Minutes" button appears, notes locked

### Accessibility
- Timer has `aria-live="assertive"` for time announcements
- Agenda items are navigable via keyboard with status announced
- Notes panel supports screen reader compatibility
- Action item creation has labeled form fields

---

## Screen 6: Minutes Editor

**Route:** `/meetings/[id]/minutes`
**Access:** Founder, Admin, Secretary

**Purpose:** Review and edit AI-generated meeting minutes. The AI produces formatted minutes from the meeting transcript and notes, which can be refined before distribution.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Meeting Minutes: Q4 2024 Board Meeting                |
|           |                                                       |
|           |  Status: [Draft v]  [Preview PDF] [Send for Approval]  |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | MINUTES OF THE BOARD OF DIRECTORS                 | |
|           |  | Acme Inc.                                        | |
|           |  | December 15, 2024                                | |
|           |  |                                                  | |
|           |  | ATTENDEES                                        | |
|           |  | Present: Jane Chen (Chair), Michael Ross,        | |
|           |  | Sarah Liu                                        | |
|           |  | Observers: David Park                            | |
|           |  | Absent: None                                     | |
|           |  | Quorum: Confirmed                                | |
|           |  |                                                  | |
|           |  | 1. CALL TO ORDER                                 | |
|           |  | The meeting was called to order at 2:00 PM PST   | |
|           |  | by the Chair.                                    | |
|           |  |                                                  | |
|           |  | 2. APPROVAL OF PREVIOUS MINUTES                  | |
|           |  | The minutes of the October 20, 2024 meeting      | |
|           |  | were approved unanimously.                       | |
|           |  |                                                  | |
|           |  | RESOLUTION: On motion duly made and seconded,    | |
|           |  | the Board unanimously approved the minutes of    | |
|           |  | the October 20, 2024 meeting.                    | |
|           |  |                                                  | |
|           |  | [... continues with all agenda items ...]        | |
|           |  |                                                  | |
|           |  | ACTION ITEMS                                     | |
|           |  | - Review term sheet (Jane, Due: Dec 20)          | |
|           |  | - Send NPS report (Sarah, Due: Dec 15)           | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Source: [Transcript] [Meeting Notes]                   |
|           |  AI Confidence: 94%                                    |
+------------------------------------------------------------------+
```

### UI Elements
- **Rich text editor** — Full TipTap editor with formatting toolbar, auto-save
- **Status selector** — Draft, Under Review, Approved — dropdown in header
- **Source toggle** — Switch between viewing the original transcript, meeting notes, and generated minutes
- **AI confidence indicator** — Overall confidence score, low-confidence sections highlighted in yellow
- **Resolution blocks** — Styled blocks for formal resolutions with "RESOLVED" prefix
- **Action item extraction** — Highlighted action items with assignee and due date, editable
- **PDF preview** — Side panel or modal showing formatted PDF output
- **Approval workflow** — Send to board chair for review, track approval status

### States
- **Generating** — Loading state with progress bar: "Generating minutes from transcript..."
- **Draft** — Editable, low-confidence sections highlighted, AI badge visible
- **Under review** — Sent to chair, edit access limited to secretary
- **Approved** — Locked, green "Approved" badge, distributed to all board members
- **No transcript** — Manual entry mode with AI formatting assistance

### Accessibility
- Editor supports full keyboard navigation and screen reader compatibility
- Resolution blocks have distinct visual styling and ARIA role
- Confidence indicators use text labels in addition to color
- Status changes announced via `aria-live`

---

## Screen 7: Resolution Manager

**Route:** `/resolutions`
**Access:** Founder, Admin, Secretary, Board Members (voting)

**Purpose:** Manage the full lifecycle of board resolutions from drafting through voting to signing and archival.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Resolutions                    [+ New Resolution]      |
|           |                                                       |
|           |  [All] [Pending Vote] [Passed] [Archived]              |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | Resolution #14                    STATUS: VOTING   | |
|           |  | Approval of Q4 Option Grants                      | |
|           |  |                                                   | |
|           |  | Voting Progress: 2/3 directors voted               | |
|           |  | [============================------] 67%            | |
|           |  |                                                   | |
|           |  | Jane Chen: FOR    Michael Ross: FOR                | |
|           |  | Sarah Liu: PENDING                                 | |
|           |  |                                                   | |
|           |  | Deadline: Dec 20, 2024                             | |
|           |  | [View Details] [Send Reminder]                     | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | Resolution #13                    STATUS: PASSED   | |
|           |  | Approval of Series B Financing                    | |
|           |  | Passed: 3/3 FOR, 0 AGAINST                        | |
|           |  | Signed: Dec 1, 2024                                | |
|           |  | [View] [Download Signed Copy]                      | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | Resolution #12                    STATUS: SIGNED   | |
|           |  | Appointment of CFO                                | |
|           |  | Passed: 3/3 FOR, 0 AGAINST                        | |
|           |  | Signed: Nov 15, 2024                               | |
|           |  | [View] [Download Signed Copy]                      | |
|           |  +--------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements
- **Resolution cards** — Card per resolution with title, status badge, voting progress bar, vote tallies, deadline
- **Status badges** — Draft (gray), Circulated (blue), Voting (amber), Passed (green), Failed (red), Signed (purple), Archived (slate)
- **Voting progress bar** — Visual progress of votes received vs. total required
- **Individual vote display** — Each board member's vote shown (For/Against/Abstain/Pending)
- **Filter tabs** — All, Pending Vote, Passed, Archived
- **Action buttons** — View Details, Send Reminder, Download Signed Copy
- **New Resolution button** — Opens drafting workflow with template selector

### States
- **Empty state** — No resolutions yet: "Create your first board resolution" with template suggestions
- **Voting open** — Amber highlight, countdown to deadline, reminder button visible
- **Quorum not met** — Warning when insufficient votes to reach quorum
- **Signing required** — After passing, DocuSign integration prompts for signatures
- **Expired** — Resolution deadline passed without sufficient votes: red warning

### Accessibility
- Status badges use both color and text label
- Voting progress bar has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Vote tallies use semantic list markup
- Filter tabs use `role="tablist"` pattern

---

## Screen 8: Action Items

**Route:** `/action-items`
**Access:** Founder, Admin, Secretary, Board Members (their items)

**Purpose:** Cross-meeting action item tracker. Shows all action items across meetings with filters by status, assignee, and meeting.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Action Items                      [+ New Action Item]  |
|           |                                                       |
|           |  Filters: [Status v] [Assignee v] [Meeting v]          |
|           |                                                       |
|           |  OVERDUE (2)                                           |
|           |  +--------------------------------------------------+ |
|           |  | [ ] Review Series B term sheet                    | |
|           |  |     Assigned: Jane Chen  |  Due: Dec 12 (3d late) | |
|           |  |     From: Q4 Board Meeting  |  Priority: High     | |
|           |  +--------------------------------------------------+ |
|           |  | [ ] Intro to CFO candidate                        | |
|           |  |     Assigned: Michael Ross  |  Due: Dec 14 (1d)   | |
|           |  |     From: Q4 Board Meeting  |  Priority: Medium   | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  UPCOMING (3)                                          |
|           |  +--------------------------------------------------+ |
|           |  | [ ] Send customer NPS report to board             | |
|           |  |     Assigned: Sarah Liu  |  Due: Dec 20           | |
|           |  |     From: Q4 Board Meeting  |  Priority: Medium   | |
|           |  +--------------------------------------------------+ |
|           |  | [ ] Draft hiring plan for Q1                      | |
|           |  |     Assigned: CEO  |  Due: Jan 5                  | |
|           |  |     From: Q4 Board Meeting  |  Priority: High     | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  COMPLETED (5)                                         |
|           |  +--------------------------------------------------+ |
|           |  | [x] Review Q3 financials      Done: Nov 15        | |
|           |  | [x] Update D&O policy         Done: Nov 10        | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Completion Rate: 71%  |  Avg Time: 12 days            |
+------------------------------------------------------------------+
```

### UI Elements
- **Action item rows** — Checkbox, title, assignee avatar + name, due date (with relative time for overdue), source meeting, priority badge
- **Status groups** — Overdue (red header), Upcoming (default), Completed (green header, collapsed by default)
- **Filter dropdowns** — Status (All/Open/Overdue/Completed), Assignee, Meeting
- **Completion metrics** — Completion rate percentage, average time to completion
- **Inline editing** — Click to edit title, assignee, due date, priority
- **Carry-forward indicator** — Badge on items that were carried forward from a previous meeting

### States
- **Empty state** — No action items: "Action items from your board meetings will appear here"
- **All complete** — Celebratory state: "All action items complete" with completion rate
- **Overdue items** — Red highlight, days overdue shown, option to send reminder
- **Board member view** — Filtered to show only their assigned items

### Accessibility
- Checkboxes have `aria-label` with full action item description
- Overdue indicators use text ("3 days overdue") not just color
- Groups are collapsible with `aria-expanded`
- Filter controls are keyboard navigable

---

## Screen 9: Document Library

**Route:** `/documents`
**Access:** Founder, Admin, Secretary, Board Members (per document permissions)

**Purpose:** Centralized repository for all board-related documents with categorization, version control, and access management.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Documents                          [Upload] [Search]   |
|           |                                                       |
|           |  Categories: [All] [Decks] [Minutes] [Resolutions]     |
|           |              [Financials] [Legal] [Other]               |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | Name              | Category  | Date    | Version | |
|           |  |-------------------|-----------|---------|---------|  |
|           |  | [PDF] Q4 Board    | Deck      | Dec 10  | v3      | |
|           |  |       Deck 2024   |           |         | [...]   | |
|           |  |-------------------|-----------|---------|---------|  |
|           |  | [DOC] Nov 2024    | Minutes   | Nov 22  | v1      | |
|           |  |       Minutes     |           |         | [...]   | |
|           |  |-------------------|-----------|---------|---------|  |
|           |  | [PDF] Resolution  | Resolution| Dec 1   | v1      | |
|           |  |       #13 Signed  |           |         | [...]   | |
|           |  |-------------------|-----------|---------|---------|  |
|           |  | [XLS] Q3 P&L      | Financial | Oct 30  | v2      | |
|           |  |       Statement   |           |         | [...]   | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Showing 12 of 47 documents                            |
|           |  [< Previous]  Page 1 of 4  [Next >]                   |
+------------------------------------------------------------------+
```

### UI Elements
- **Document table** — Sortable columns for name, category, upload date, version, uploader
- **File type icon** — Visual indicator (PDF, DOC, XLS, PPT) with color coding
- **Version indicator** — Version number with dropdown to view version history
- **Category filter tabs** — Quick filter by document category
- **Search** — Full-text search across document names and content
- **Upload button** — Drag-and-drop upload zone with category assignment
- **Context menu** — View, download, share, version history, delete, manage access
- **Access badges** — Board-only, Committee-only, Management icons per document

### States
- **Empty state** — "Upload your first board document" with drag-and-drop zone
- **Loading** — Skeleton rows during data fetch
- **Search active** — Search results with highlighted matching terms
- **Version history expanded** — Side panel showing version timeline with diff highlights
- **Access restricted** — Grayed-out rows for documents the current user cannot access (with "Request Access" link)

### Accessibility
- Table uses semantic `<table>` markup with proper headers
- Sort controls announce sort direction to screen readers
- File type icons have `aria-label` describing the file type
- Pagination controls are keyboard navigable

---

## Screen 10: KPI Dashboard

**Route:** `/kpis`
**Access:** Founder, Admin, Secretary

**Purpose:** Visual dashboard of all tracked KPIs with goal tracking, trend charts, and period-over-period comparisons. This data feeds into the board deck generator.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | KPI Dashboard              [Edit KPIs] [Export]        |
|           |                                                       |
|           |  Period: [Q4 2024 v]  Compare: [Q3 2024 v]             |
|           |                                                       |
|           |  +------------+ +------------+ +------------+          |
|           |  | MRR        | | ARR        | | Runway     |          |
|           |  | $142,000   | | $1.7M      | | 18 months  |          |
|           |  | +12% QoQ   | | +14% QoQ   | | +2 mo QoQ  |          |
|           |  | Goal: $150K| | Goal: $2M  | | Goal: 18mo |          |
|           |  | [====--] 95%| [===---] 85%| [======] 100%|          |
|           |  +------------+ +------------+ +------------+          |
|           |                                                       |
|           |  +----------------------------------------------+      |
|           |  | REVENUE TRENDS                                |      |
|           |  | [Line chart: MRR over 12 months with goal    |      |
|           |  |  line, actual vs target, shaded variance]    |      |
|           |  +----------------------------------------------+      |
|           |                                                       |
|           |  +----------------------------------------------+      |
|           |  | UNIT ECONOMICS         | GROWTH METRICS       |      |
|           |  | CAC: $245 (Goal: $200) | NRR: 118% (G: 120%) |      |
|           |  | LTV: $4,200            | Logo Churn: 2.1%     |      |
|           |  | Payback: 5.2 mo        | NDR: 115%            |      |
|           |  +----------------------------------------------+      |
|           |                                                       |
|           |  +----------------------------------------------+      |
|           |  | CUSTOM KPIs                                   |      |
|           |  | [Table of custom-defined KPIs with values,   |      |
|           |  |  goals, trends, and data source indicators]  |      |
|           |  +----------------------------------------------+      |
+------------------------------------------------------------------+
```

### UI Elements
- **Metric cards** — Value, trend arrow with percentage, goal bar with progress percentage
- **Period selector** — Dropdown to select current period and comparison period
- **Trend charts** — Recharts line/bar charts with tooltips, goal lines, variance shading
- **Goal indicators** — Progress bars with green (on track), amber (at risk), red (behind) coloring
- **Data source badges** — Small icons showing where each KPI data comes from (Stripe, QuickBooks, Manual)
- **Edit KPIs button** — Opens KPI configuration panel for adding, removing, and reordering KPIs

### States
- **Empty state** — No KPIs configured: template selector for stage-appropriate KPI sets
- **Data loading** — Skeleton loaders for metric cards and charts
- **Goal exceeded** — Green glow effect on metric cards that exceeded their goal
- **Goal at risk** — Amber border on metric cards trending below goal
- **Integration disconnected** — Warning badge on affected KPIs with "Reconnect" link

### Accessibility
- Charts have text-based data tables as fallback (`aria-describedby` linking to hidden data table)
- Goal progress bars have `aria-valuenow` and `aria-label` with full context
- Trend arrows use `aria-label` describing direction and magnitude
- Color-coded status has corresponding text label

---

## Screen 11: Investor Updates

**Route:** `/investor-updates`
**Access:** Founder, Admin

**Purpose:** Generate and send monthly/quarterly investor updates using the same data pipeline as board decks.

### Layout

```
+------------------------------------------------------------------+
| [Sidebar] | Investor Updates              [+ New Update]           |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | November 2024 Update          STATUS: SENT         | |
|           |  | Sent: Nov 30 to 24 recipients                     | |
|           |  | Open rate: 87%  |  Click rate: 34%                 | |
|           |  | [View] [Analytics] [Resend]                        | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | December 2024 Update          STATUS: DRAFT        | |
|           |  |                                                    | |
|           |  | [AI-generated email preview with metrics,          | |
|           |  |  highlights, lowlights, and asks sections]         | |
|           |  |                                                    | |
|           |  | Metrics: MRR $142K | Runway 18mo | Team 24        | |
|           |  |                                                    | |
|           |  | [Edit] [Preview] [Schedule Send]                   | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Distribution List (24 investors)                      |
|           |  +--------------------------------------------------+ |
|           |  | [Avatar] Jane Chen    jane@vc.com      [Active]    | |
|           |  | [Avatar] Fund ABC     partner@abc.vc   [Active]    | |
|           |  | [+ Add Investor]  [Manage List]                    | |
|           |  +--------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements
- **Update cards** — Status badge (Draft/Scheduled/Sent), date, recipient count, engagement metrics
- **Email preview** — Rendered email preview with metric highlights, narrative sections
- **AI generation controls** — Regenerate sections, adjust tone (formal/casual), include/exclude metrics
- **Distribution list** — Investor email list with active/inactive toggle
- **Analytics** — Open rate, click rate per recipient (post-send)
- **Schedule controls** — Date/time picker for scheduled sends

### States
- **Empty state** — "Send your first investor update" with template preview
- **Generating** — AI generating update content with progress indicator
- **Draft** — Editable, preview available, send/schedule buttons
- **Scheduled** — Countdown to send time, option to cancel
- **Sent** — Engagement analytics visible, resend option

---

## Screen 12: Settings

**Route:** `/settings`
**Access:** Founder, Admin

**Purpose:** Configuration hub for integrations, board member management, billing, and company profile.

### Layout — Integrations Tab

```
+------------------------------------------------------------------+
| [Sidebar] | Settings > Integrations                                |
|           |                                                       |
|           |  [Integrations] [Board Members] [Billing] [Company]    |
|           |                                                       |
|           |  Financial Data                                        |
|           |  +--------------------------------------------------+ |
|           |  | [Stripe Logo] Stripe           [Connected]         | |
|           |  | Last sync: 2 hours ago  |  Data: Revenue, MRR     | |
|           |  | [Configure] [Disconnect]                           | |
|           |  +--------------------------------------------------+ |
|           |  | [QB Logo] QuickBooks           [Connected]         | |
|           |  | Last sync: 6 hours ago  |  Data: P&L, Cash        | |
|           |  | [Configure] [Disconnect]                           | |
|           |  +--------------------------------------------------+ |
|           |  | [HubSpot Logo] HubSpot        [Not Connected]     | |
|           |  | Pipeline, deals, customer data                     | |
|           |  | [Connect]                                          | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Team & HR                                              |
|           |  +--------------------------------------------------+ |
|           |  | [Gusto Logo] Gusto             [Connected]         | |
|           |  | Last sync: 1 day ago  |  Data: Headcount          | |
|           |  | [Configure] [Disconnect]                           | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Governance                                             |
|           |  +--------------------------------------------------+ |
|           |  | [DocuSign Logo] DocuSign       [Not Connected]     | |
|           |  | E-signature for resolutions                        | |
|           |  | [Connect]                                          | |
|           |  +--------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Layout — Board Members Tab

```
+------------------------------------------------------------------+
| [Sidebar] | Settings > Board Members        [+ Invite Member]      |
|           |                                                       |
|           |  +--------------------------------------------------+ |
|           |  | [Avatar] Jane Chen                                 | |
|           |  | Chair  |  jane@venture.com  |  Joined: Mar 2023   | |
|           |  | Boards: Board of Directors, Compensation Committee | |
|           |  | [Edit Role] [Remove]                               | |
|           |  +--------------------------------------------------+ |
|           |  | [Avatar] Michael Ross                              | |
|           |  | Director  |  michael@firm.com  | Joined: Jun 2023 | |
|           |  | Boards: Board of Directors                         | |
|           |  | [Edit Role] [Remove]                               | |
|           |  +--------------------------------------------------+ |
|           |  | [Avatar] David Park                                | |
|           |  | Observer  |  david@lp.com  |  Joined: Sep 2024    | |
|           |  | Boards: Board of Directors                         | |
|           |  | [Edit Role] [Remove]                               | |
|           |  +--------------------------------------------------+ |
|           |                                                       |
|           |  Pending Invitations (1)                                |
|           |  +--------------------------------------------------+ |
|           |  | sarah@newvc.com  |  Director  |  Sent: Dec 5       | |
|           |  | [Resend Invitation] [Cancel]                       | |
|           |  +--------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements
- **Integration cards** — Provider logo, connection status badge, last sync time, data summary, configure/disconnect buttons
- **OAuth connect flow** — Opens provider's OAuth consent screen in popup
- **Member cards** — Avatar, name, role badge, email, join date, board assignments
- **Invite modal** — Email input, role selector, board assignment, personal message
- **Billing section** — Current plan, usage metrics, upgrade/downgrade options, payment method, invoice history
- **Company profile** — Company name, logo, state of incorporation, fiscal year end

### States
- **Integration connecting** — Loading spinner during OAuth flow
- **Integration error** — Red error badge with troubleshooting link
- **Invitation pending** — Amber "Pending" badge with resend option
- **Plan limit reached** — Warning when approaching plan limits (boards, members, meetings)
- **Billing overdue** — Red banner for overdue payments with update payment link

### Accessibility
- Integration status badges use both color and text
- OAuth flow has proper focus management (returns focus after popup)
- Member list uses semantic list markup
- Role selectors have descriptive labels
- All forms have proper label associations

---

## Global UI Patterns

### Navigation
- Persistent sidebar with icon + text labels, collapsible to icon-only on smaller viewports
- Breadcrumb trail on nested pages
- Global search accessible via keyboard shortcut (Cmd+K)
- Notification bell with unread count badge

### Responsive Behavior
- **Desktop (1280px+):** Full sidebar + content + optional right panel
- **Tablet (768-1279px):** Collapsed sidebar (icon-only), full content
- **Mobile (< 768px):** Hidden sidebar (hamburger menu), single-column content
- Board portal optimized for tablet use (board members reviewing materials on iPad)

### Loading States
- Skeleton loaders matching content layout (not generic spinners)
- Progressive loading for data-heavy screens (metrics load individually)
- Optimistic updates for user actions (checkbox toggle, vote submission)

### Error States
- Inline error messages for form validation
- Toast notifications for transient errors (network issues, API failures)
- Full-page error for critical failures with retry button
- Integration-specific error handling with reconnect prompts

### Empty States
- Illustrated empty states with clear CTAs for each section
- Contextual onboarding prompts for first-time users
- Template suggestions when creating new items (decks, resolutions, agendas)
