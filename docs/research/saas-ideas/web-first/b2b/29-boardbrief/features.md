# BoardBrief — Features

## Feature Roadmap Overview

```
MVP (Months 1-6)                Post-MVP (Months 7-12)           Year 2+
|                               |                                |
+-- AI Board Deck Generator     +-- Resolution Management        +-- AI Board Advisor
+-- Financial Summary Dashboard +-- Action Item Tracker          +-- Compliance Checker
+-- KPI Tracker                 +-- Investor Update Generator    +-- Board Evaluation Surveys
+-- Meeting Scheduler + Agenda  +-- Cap Table Integration        +-- Fundraising Data Room
+-- Board Member Portal         +-- Board Observer Management    +-- Public Company Module
+-- AI Meeting Minutes          +-- Consent Resolutions          +-- Multi-Entity Governance
                                +-- Document Library + Versioning
```

---

## Phase 1: MVP (Months 1-6)

### 1.1 AI Board Deck Generator

**Description:** The core product feature. BoardBrief connects to a startup's existing tools (Stripe, QuickBooks, HubSpot, Gusto) and automatically generates a complete board deck with financial summaries, KPI charts, operational updates, and narrative sections.

**Functionality:**
- **Data ingestion** — Pull metrics from connected integrations in real-time
- **Template system** — Pre-built deck templates for Seed, Series A, and Series B companies
- **AI narrative generation** — GPT-4o generates executive summaries, financial commentary, and strategic updates from raw data
- **Slide editor** — Drag-and-drop slide reordering, inline editing of AI-generated content
- **Data widgets** — Embeddable charts, metric cards, and tables that auto-update with latest data
- **Version history** — Track changes across deck versions, compare drafts
- **Export** — PDF export for distribution, link sharing for the board portal
- **Regeneration** — Re-run AI generation with updated data or different parameters

**Deck sections generated:**
1. Executive Summary (AI-generated narrative)
2. Financial Overview (revenue, burn, runway, cash position)
3. Key Metrics / KPIs (customizable, with goal tracking)
4. Product Update (manual input with AI formatting)
5. Sales / Pipeline (from CRM data)
6. Team Update (from HRIS data)
7. Strategic Discussion Topics (manual + AI-suggested)
8. Appendix (detailed financials, supporting data)

**User stories:**
- As a founder, I want to generate a board deck from my connected tools so I can prepare for board meetings in hours instead of days
- As a founder, I want to edit AI-generated content directly in the slide editor so I can refine the narrative
- As a founder, I want to reorder slides and add/remove sections so the deck tells the story I want
- As a founder, I want to see which data is being pulled from each integration so I can verify accuracy
- As a founder, I want to regenerate specific slides with updated data so I can refresh the deck before the meeting

**Edge cases:**
- Integration data is stale or disconnected: Show warning badges on affected widgets, allow manual data entry as fallback
- AI generates inaccurate narrative: All AI content is editable, founder must review and approve before publishing
- Company has no historical data (first board meeting): Provide manual input mode with AI formatting assistance
- Multiple currencies: Auto-detect from Stripe/QuickBooks, normalize to reporting currency
- Partial integrations: Generate deck with available data, mark missing sections for manual input

**Dev timeline:**
- Week 1-2: Integration framework and data ingestion pipeline
- Week 3-4: Deck template system and slide data model
- Week 5-8: AI narrative generation (GPT-4o prompt engineering, output formatting)
- Week 9-10: Slide editor UI (drag-and-drop, inline editing, data widgets)
- Week 11-12: PDF export, version history, publishing to board portal

---

### 1.2 Financial Summary Dashboard

**Description:** Auto-populated financial dashboard that pulls data from Stripe and QuickBooks to present a real-time view of the company's financial health. This data feeds into the board deck generator.

**Functionality:**
- **Revenue metrics** — MRR, ARR, revenue growth rate, net revenue retention
- **Burn rate** — Monthly operating expenses, gross burn, net burn
- **Runway** — Months of runway remaining based on current burn and cash position
- **Cash position** — Current bank balance, cash flow trends
- **P&L summary** — Revenue, COGS, gross margin, operating expenses by category
- **MRR trends** — New MRR, expansion MRR, contraction MRR, churned MRR
- **Customer metrics** — Total customers, new customers, churn rate, ARPU
- **Period comparisons** — Month-over-month, quarter-over-quarter, year-over-year

**User stories:**
- As a founder, I want to see my financial metrics auto-populated from Stripe and QuickBooks so I do not have to manually update spreadsheets
- As a founder, I want to see runway calculated automatically so I always know how much time I have
- As a board member, I want to see financial trends over time so I can identify concerning patterns
- As a CFO, I want to verify that auto-populated data matches our accounting records

**Edge cases:**
- Stripe and QuickBooks data do not reconcile: Show both sources with discrepancy alert
- Company uses a different payment processor: Allow manual data entry with CSV upload
- Revenue recognition timing differences: Allow configurable recognition rules
- Non-SaaS companies (one-time revenue): Adapt metrics to show relevant financial data (not just MRR)

**Dev timeline:**
- Week 1-3: Stripe API integration (revenue, subscriptions, customer data)
- Week 4-6: QuickBooks API integration (P&L, balance sheet, cash flow)
- Week 7-8: Financial dashboard UI (charts, metric cards, trend indicators)
- Week 9-10: Data reconciliation and alerting

---

### 1.3 KPI Tracker

**Description:** Customizable KPI tracking system where founders define the metrics that matter to their business, set goals, and track progress over time. KPIs are displayed on the financial dashboard and included in board decks.

**Functionality:**
- **Custom KPI definitions** — Name, category, unit, data source (manual or integration)
- **Goal setting** — Set targets per period (monthly, quarterly, annually)
- **Auto-population** — KPIs connected to integrations update automatically
- **Manual entry** — For KPIs not available via API (NPS, product metrics, etc.)
- **Trend visualization** — Line charts, bar charts with period-over-period comparison
- **Goal tracking** — Visual progress indicators (on track, at risk, behind)
- **Board deck integration** — Selected KPIs appear as a slide in the generated deck
- **Alerts** — Notify founder when a KPI crosses a threshold

**Pre-built KPI templates by stage:**
- **Seed:** MRR, burn rate, runway, user growth, activation rate
- **Series A:** ARR, net revenue retention, CAC, LTV, payback period, headcount
- **Series B:** Revenue growth rate, gross margin, magic number, rule of 40, burn multiple

**User stories:**
- As a founder, I want to define custom KPIs so I can track the metrics my board cares about
- As a founder, I want KPIs to auto-populate from my tools so I do not have to manually update them
- As a board member, I want to see KPI trends over time so I can assess company progress between meetings

**Edge cases:**
- KPI data source changes (switch from Stripe to custom billing): Migration path for historical data
- Goal changes mid-period: Track goal changes with annotations
- Negative KPIs (churn, bug count): Handle inverted goal logic (lower is better)

**Dev timeline:**
- Week 1-2: KPI data model and CRUD operations
- Week 3-4: Integration connectors for auto-population
- Week 5-6: Visualization components (charts, trend indicators, goal tracking)
- Week 7-8: Board deck integration and alerting

---

### 1.4 Board Meeting Scheduler with Agenda Builder

**Description:** Schedule board meetings, build structured agendas, manage attendees, and distribute materials. Integrates with Google Calendar for scheduling and sends automated reminders.

**Functionality:**
- **Meeting creation** — Title, date/time, duration, location (in-person or video link)
- **Calendar integration** — Sync with Google Calendar, check board member availability
- **Agenda builder** — Structured agenda with time allocations per topic
- **Pre-built agenda templates** — Standard board meeting, committee meeting, special meeting
- **Material distribution** — Attach board deck and supporting documents, set distribution date
- **Attendee management** — Track RSVPs, manage proxies, record attendance
- **Automated reminders** — Email reminders at 1 week, 3 days, and 1 day before meeting
- **Pre-meeting questions** — Board members can submit questions in advance

**Agenda item types:**
- Approval items (minutes, financials)
- Discussion items (strategy, key decisions)
- Information items (updates, reports)
- Action items (follow-up from previous meetings)
- Executive session (board-only, no management present)

**User stories:**
- As a founder, I want to schedule a board meeting and sync it with everyone's calendar so I do not have to send individual invites
- As a founder, I want to build an agenda with time allocations so the meeting stays on track
- As a board member, I want to receive materials 5 days before the meeting so I have time to prepare
- As a board member, I want to submit questions before the meeting so the founder can prepare answers

**Edge cases:**
- Board members in different time zones: Show meeting time in each member's local timezone
- Quorum not met (not enough RSVPs): Alert founder about quorum requirements
- Last-minute agenda changes: Version the agenda, notify attendees of changes
- Recurring meetings (quarterly): Support recurring meeting series with agenda templates

**Dev timeline:**
- Week 1-3: Meeting data model, CRUD, calendar integration
- Week 4-5: Agenda builder UI with drag-and-drop
- Week 6-7: Attendee management, RSVP tracking, reminders
- Week 8: Material distribution and pre-meeting Q&A

---

### 1.5 Board Member Portal

**Description:** A secure, role-based portal where board members access meeting materials, review documents, leave comments, and participate in governance activities. Board members see only what they are authorized to see.

**Functionality:**
- **Personalized dashboard** — Upcoming meetings, pending votes, assigned action items
- **Document access** — View board decks, minutes, supporting materials in-browser
- **Comments** — Comment on specific sections of board decks and documents
- **Meeting preparation** — View agenda, download materials, submit pre-meeting questions
- **Notification center** — New materials available, upcoming deadlines, voting reminders
- **Multi-board view** — Board members who sit on multiple boards see all their boards in one place
- **Mobile-responsive** — Full portal access on tablets and phones
- **Secure access** — Magic link login (no password required), optional MFA

**User stories:**
- As a board member, I want a single place to access all my board materials across multiple companies
- As a board member, I want to be notified when new materials are available so I can review them before the meeting
- As a board member, I want to comment on specific slides in the board deck so I can provide feedback before the meeting
- As a board observer, I want read-only access to meeting materials without voting capabilities
- As a board member, I want to log in with a magic link so I do not need to remember another password

**Edge cases:**
- Board member removed mid-term: Revoke access immediately, retain historical data for audit
- Confidential documents: Per-document access controls (e.g., compensation data visible to comp committee only)
- Board member sits on 10+ boards: Scalable multi-board navigation
- Offline access: Allow PDF download for offline review (with watermarking)

**Dev timeline:**
- Week 1-3: Portal layout, authentication (magic link + MFA), RBAC
- Week 4-6: Document viewer, commenting system
- Week 7-8: Notification system, multi-board navigation
- Week 9-10: Mobile responsiveness, security hardening

---

### 1.6 AI Meeting Minutes

**Description:** Generate professional board meeting minutes from audio transcripts or manual notes. AI formats the minutes according to corporate governance standards, extracts action items, and identifies key decisions.

**Functionality:**
- **Audio transcription** — Upload meeting recording, Whisper transcribes to text
- **AI minutes generation** — GPT-4o converts transcript into formatted board minutes
- **Standard format** — Attendees, quorum confirmation, agenda items discussed, motions, votes, action items
- **Manual editing** — Rich text editor for reviewing and refining AI-generated minutes
- **Action item extraction** — AI identifies action items from the transcript with assignee and deadline
- **Decision logging** — Key decisions are highlighted and linked to relevant agenda items
- **Approval workflow** — Board secretary drafts, board chair reviews, board approves
- **Export** — PDF export with company letterhead formatting

**Minutes sections:**
1. Meeting details (date, time, location, type)
2. Attendees and quorum confirmation
3. Approval of previous minutes
4. Reports and presentations (summary of each agenda item)
5. Motions and resolutions (exact wording, who moved/seconded, vote tally)
6. Discussion summaries (key points, dissenting opinions)
7. Action items (task, owner, deadline)
8. Next meeting date
9. Adjournment time

**User stories:**
- As a founder, I want to upload a meeting recording and get formatted minutes so I do not have to write them manually
- As a board secretary, I want AI-generated minutes as a starting point that I can edit and refine
- As a board chair, I want to review and approve minutes before they are distributed
- As a board member, I want to see action items extracted from the meeting so I know what I need to do

**Edge cases:**
- Poor audio quality: Show confidence scores, highlight low-confidence sections for manual review
- Multiple speakers not identified: Allow manual speaker attribution after transcription
- Sensitive topics discussed: Allow redaction of specific sections
- No recording available: Support manual note-to-minutes conversion with AI formatting

**Dev timeline:**
- Week 1-3: Whisper integration, audio upload and processing pipeline
- Week 4-6: GPT-4o minutes generation prompt engineering
- Week 7-8: Rich text editor for minutes editing
- Week 9-10: Action item extraction, approval workflow, PDF export

---

## Phase 2: Post-MVP (Months 7-12)

### 2.1 Board Resolution Management

**Description:** Create, circulate, vote on, and sign board resolutions digitally. Supports both meeting resolutions (voted during meetings) and consent resolutions (voted asynchronously between meetings).

**Functionality:**
- **Resolution drafting** — Rich text editor with legal templates (standard, unanimous consent, committee)
- **Circulation** — Send resolution to board members with voting deadline
- **Digital voting** — For, Against, Abstain — with quorum tracking
- **E-signature** — DocuSign integration for formal resolution signing
- **Status tracking** — Draft, circulated, voting open, passed, failed, signed, archived
- **Resolution library** — Searchable archive of all past resolutions
- **Legal compliance** — Resolution format compliant with Delaware corporate law
- **Notification** — Automated reminders for pending votes

**Common resolution templates:**
- Approval of meeting minutes
- Approval of stock option grants
- Approval of annual budget
- Appointment/removal of officers
- Approval of financing (equity or debt)
- Approval of material contracts
- Amendment of bylaws
- Establishment of committees

**User stories:**
- As a founder, I want to create a resolution from a template so I do not have to draft legal language from scratch
- As a board member, I want to vote on resolutions digitally so I do not have to sign physical documents
- As a founder, I want to see resolution status at a glance so I know which resolutions are pending
- As a board secretary, I want to track quorum for each resolution so I know if we have enough votes

**Edge cases:**
- Board member does not vote by deadline: Escalation notifications, option to extend deadline
- Tied vote: Follow bylaws (typically chair breaks tie), alert for manual resolution
- Resolution requires unanimous consent: Track and enforce unanimous requirement
- Board member recuses due to conflict: Adjust quorum requirements, record recusal

**Dev timeline:**
- Week 1-3: Resolution data model, templates, drafting editor
- Week 4-5: Voting system, quorum tracking
- Week 6-7: DocuSign integration for e-signature
- Week 8: Resolution library, search, archival

---

### 2.2 Action Item Tracker

**Description:** Cross-meeting action item tracker that persists between board meetings. Action items are created during meetings (manually or via AI extraction) and tracked until completion.

**Functionality:**
- **Creation** — Manual creation or AI-extracted from meeting transcript
- **Assignment** — Assign to board members, executives, or teams
- **Due dates** — Set deadlines, automated reminders
- **Status tracking** — Open, in progress, completed, overdue, deferred
- **Meeting linkage** — Each action item linked to the meeting where it originated
- **Carry-forward** — Incomplete items automatically appear on the next meeting's agenda
- **Reporting** — Completion rates by assignee, average time to completion, overdue count
- **Board deck integration** — Action item status summary included in the next board deck

**User stories:**
- As a founder, I want action items from last meeting to automatically appear in the next meeting's agenda
- As a board member, I want to see all my action items across all boards in one view
- As a founder, I want completion rate metrics so I can report on accountability to the board

**Dev timeline:**
- Week 1-2: Action item data model, CRUD, assignment
- Week 3-4: Status tracking, reminders, carry-forward logic
- Week 5-6: Reporting dashboard, board deck integration

---

### 2.3 Investor Update Generator

**Description:** Generate monthly or quarterly investor updates from the same data used for board decks. Automatically drafts an email-ready update with key metrics, highlights, and asks.

**Functionality:**
- **Template system** — Monthly and quarterly email templates
- **Data reuse** — Pull metrics from the same integrations used for board decks
- **AI drafting** — GPT-4o generates narrative sections (highlights, lowlights, asks)
- **Distribution list** — Manage investor email list separate from board members
- **Scheduling** — Schedule sends for optimal timing
- **Tracking** — Open rates, click rates per investor (via email tracking pixel)
- **Archive** — Historical investor updates searchable and linked to board data

**User stories:**
- As a founder, I want to generate investor updates from the same data as my board deck so I do not have to rewrite content
- As a founder, I want to see which investors opened my update so I know who is engaged
- As a founder, I want to schedule updates to send on a specific date so I can batch communications

**Dev timeline:**
- Week 1-2: Investor update templates and data reuse from board deck pipeline
- Week 3-4: AI narrative generation for updates
- Week 5-6: Email distribution, scheduling, tracking

---

### 2.4 Cap Table Summary Integration (Carta)

**Description:** Pull cap table summary data from Carta to include in board decks. Shows ownership breakdown, option pool status, and recent activity.

**Functionality:**
- **Ownership summary** — Pie chart of ownership breakdown (founders, investors, option pool)
- **Option pool** — Authorized vs. issued vs. available, recent grants
- **Round history** — Summary of previous funding rounds
- **409A valuation** — Current FMV and last valuation date
- **Board deck slide** — Auto-generated cap table slide for board decks

**Dev timeline:**
- Week 1-3: Carta API partnership and integration
- Week 4-5: Cap table summary components and board deck slide

---

### 2.5 Board Observer Management

**Description:** Manage board observers (investors or advisors with board observation rights but no voting rights). Observers receive materials but cannot vote on resolutions.

**Functionality:**
- **Observer roles** — Separate from directors with distinct permissions
- **Material access** — Configurable per observer (some may be excluded from compensation discussions)
- **Meeting attendance** — Track observer attendance separately
- **Information rights** — Manage information rights agreements

**Dev timeline:**
- Week 1-2: Observer role and permissions
- Week 3-4: Configurable material access, attendance tracking

---

### 2.6 Consent Resolutions (Async Voting)

**Description:** Support for written consent resolutions that do not require a meeting. Board members vote asynchronously via the portal within a specified deadline.

**Functionality:**
- **Async workflow** — Create resolution, set voting deadline, distribute via portal and email
- **Voting without meeting** — Board members vote from the portal without attending a meeting
- **Legal compliance** — Ensure consent resolution format meets Delaware requirements
- **Tracking** — Real-time vote tracking with quorum monitoring

**Dev timeline:**
- Week 1-2: Async voting workflow
- Week 3-4: Notification system, legal formatting

---

### 2.7 Document Library with Version Control

**Description:** Centralized document repository for all board-related materials. Version-controlled, categorized, and access-controlled.

**Functionality:**
- **Categorization** — Board decks, minutes, resolutions, financials, legal, other
- **Version control** — Track document versions, view version history, compare versions
- **Access control** — Per-document permissions (committee-only, board-only, management)
- **Search** — Full-text search across all documents
- **Retention policies** — Configurable document retention periods
- **Bulk upload** — Upload multiple documents at once (for initial onboarding)
- **Watermarking** — Dynamic watermarks on downloaded PDFs (recipient name, date)

**Dev timeline:**
- Week 1-3: Document management system, version control
- Week 4-5: Search, categorization, access controls
- Week 6: Watermarking, retention policies

---

## Phase 3: Year 2+ Features

### 3.1 AI Board Advisor

**Description:** AI-powered board advisor that benchmarks a startup's performance against industry data and suggests strategic discussion topics for upcoming board meetings.

**Functionality:**
- **Industry benchmarking** — Compare KPIs against anonymized peer data (by stage, industry, geography)
- **Strategic topic suggestions** — AI suggests discussion topics based on company data trends and market conditions
- **Best practice recommendations** — Governance best practices based on company stage
- **Board composition analysis** — Suggest skills gaps in board composition
- **Meeting effectiveness scoring** — Rate board meeting quality based on agenda coverage, action item completion, resolution throughput

**Dev timeline:**
- Quarter 1: Benchmarking data collection and anonymization pipeline
- Quarter 2: AI advisor prompt engineering and recommendation system
- Quarter 3: Board composition analysis and meeting effectiveness scoring

---

### 3.2 Compliance Checker

**Description:** Automated compliance monitoring for corporate governance requirements. Alerts founders when filings are due, committees need to be formed, or D&O insurance needs renewal.

**Functionality:**
- **State filing tracker** — Annual report deadlines, franchise tax due dates by state of incorporation
- **Committee requirements** — Alert when company stage requires audit, compensation, or nominating committees
- **D&O insurance** — Track policy dates, coverage amounts, renewal reminders
- **Board composition** — Monitor independent director requirements
- **Document retention** — Ensure required documents are maintained per retention policies
- **Compliance calendar** — Visual calendar of all upcoming governance deadlines

**Dev timeline:**
- Quarter 1: Filing requirement database (all 50 states)
- Quarter 2: Automated monitoring and alerting system
- Quarter 3: Compliance dashboard and calendar

---

### 3.3 Board Evaluation Surveys

**Description:** Anonymous board evaluation surveys to assess board effectiveness, individual director contributions, and meeting quality.

**Functionality:**
- **Survey templates** — Annual board evaluation, individual director assessment, meeting feedback
- **Anonymous responses** — Aggregate results without identifying individual respondents
- **Benchmarking** — Compare results against governance benchmarks
- **Action planning** — Generate improvement recommendations from survey results
- **Historical tracking** — Track evaluation scores over time

**Dev timeline:**
- Quarter 1: Survey system, templates, anonymous response collection
- Quarter 2: Benchmarking and action planning

---

### 3.4 Fundraising Data Room Preparation

**Description:** Automatically prepare a data room for fundraising using existing board materials, financial data, and corporate documents.

**Functionality:**
- **Auto-populate** — Pull board decks, financials, cap table, corporate documents into a structured data room
- **Data room templates** — Standard VC due diligence structure
- **Access management** — Per-investor access with tracking (who viewed what, when)
- **Q&A module** — Investors ask questions, founders respond within the platform
- **Analytics** — Track investor engagement with data room materials

**Dev timeline:**
- Quarter 1: Data room structure and auto-population
- Quarter 2: Access management, analytics, Q&A

---

### 3.5 Public Company Board Compliance (SOX)

**Description:** Compliance features for companies preparing for or completing an IPO. Sarbanes-Oxley (SOX) compliance, committee management, and enhanced reporting.

**Functionality:**
- **SOX compliance tracker** — Section 302/404 requirements, internal controls documentation
- **Committee management** — Audit, compensation, and nominating committee workflows
- **Enhanced minutes** — Public company board minutes standards
- **Insider trading windows** — Manage trading blackout periods
- **Proxy statement preparation** — Assist with annual proxy statement data compilation

**Dev timeline:**
- Quarter 1-2: SOX compliance framework
- Quarter 3-4: Committee management and enhanced reporting

---

### 3.6 Multi-Entity Governance

**Description:** Support for companies with multiple legal entities (subsidiaries, holding companies, international entities). Manage multiple boards with shared and distinct governance workflows.

**Functionality:**
- **Entity hierarchy** — Parent/subsidiary relationships
- **Shared board members** — Members who sit on multiple entity boards
- **Consolidated reporting** — Roll up financials and KPIs across entities
- **Entity-specific compliance** — Per-jurisdiction requirements
- **Intercompany governance** — Cross-entity resolution management

**Dev timeline:**
- Quarter 1-2: Multi-entity data model and navigation
- Quarter 3: Consolidated reporting and cross-entity workflows

---

## Development Timeline Summary

| Phase | Timeline | Key Milestones |
|---|---|---|
| **Alpha** | Months 1-3 | Core deck generator, financial dashboard, basic portal |
| **Beta** | Months 4-5 | KPI tracker, meeting scheduler, minutes generation |
| **MVP Launch** | Month 6 | Public launch with all Phase 1 features |
| **Post-MVP Sprint 1** | Months 7-9 | Resolutions, action items, investor updates |
| **Post-MVP Sprint 2** | Months 10-12 | Document library, consent resolutions, Carta integration |
| **Year 2 Q1** | Months 13-15 | AI board advisor, compliance checker |
| **Year 2 Q2** | Months 16-18 | Board evaluations, data room, multi-entity |
| **Year 2 Q3-Q4** | Months 19-24 | Public company module, enterprise features |

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---|---|---|---|
| AI Board Deck Generator | Very High | High | P0 |
| Financial Summary Dashboard | Very High | Medium | P0 |
| Board Member Portal | High | Medium | P0 |
| KPI Tracker | High | Medium | P0 |
| Meeting Scheduler + Agenda | Medium | Low | P0 |
| AI Meeting Minutes | High | Medium | P0 |
| Resolution Management | High | Medium | P1 |
| Action Item Tracker | Medium | Low | P1 |
| Investor Update Generator | Medium | Low | P1 |
| Document Library | Medium | Medium | P1 |
| Consent Resolutions | Medium | Low | P1 |
| Cap Table Integration | Medium | Medium | P1 |
| Board Observer Mgmt | Low | Low | P1 |
| AI Board Advisor | High | High | P2 |
| Compliance Checker | High | High | P2 |
| Board Evaluations | Low | Medium | P2 |
| Data Room Prep | Medium | Medium | P2 |
| Public Company Module | High | Very High | P3 |
| Multi-Entity Governance | Medium | High | P3 |
