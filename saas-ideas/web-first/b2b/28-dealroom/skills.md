# DealRoom -- Skills

## Skills Overview

Building DealRoom requires a cross-functional blend of technical engineering, B2B sales domain expertise, data-rich design thinking, and go-to-market strategy targeting sales leadership. This guide maps every skill needed, why it matters for DealRoom specifically, where to learn it, and the priority order for the founding team.

---

## Technical Skills

### T1. Next.js 14 (App Router + React Server Components)

**Why:** DealRoom is a data-dense dashboard application. Next.js 14 with App Router enables React Server Components for fast initial loads, streaming Suspense for progressive data rendering, and file-based routing for clean URL structures across `/dashboard`, `/deals`, `/forecast`, and `/coaching`.

| Skill | Relevance |
|-------|-----------|
| React Server Components (RSC) | Pipeline dashboard loads deal data on the server, reducing client-side JavaScript |
| Streaming + Suspense boundaries | AI insights and forecast calculations stream in progressively without blocking the UI |
| Route Handlers (API Routes) | Webhook receivers for Salesforce, HubSpot, Gmail, and Zoom push events |
| Server Actions | Form submissions for deal updates, email sends, and settings changes |
| Middleware | Auth verification, org-based routing, feature flag checks per plan tier |
| Incremental Static Regeneration (ISR) | Analytics and reports pages regenerated on-demand after new data |

**Learning Resources:**
- Next.js Official Documentation -- App Router section (nextjs.org/docs)
- Vercel YouTube channel -- "Next.js App Router" series
- Josh Comeau -- "The Joy of React" course (for RSC mental model)
- Lee Robinson -- "Next.js 14" walkthrough videos

**Priority:** P0 -- Foundation of the entire application

---

### T2. CRM API Integrations (Salesforce REST/SOAP, HubSpot)

**Why:** DealRoom is an intelligence layer on top of CRMs, not a replacement. Bi-directional sync with Salesforce and HubSpot is a P0 requirement. If the CRM sync breaks, DealRoom is useless.

| Skill | Relevance |
|-------|-----------|
| Salesforce REST API | CRUD operations on Opportunities, Contacts, Activities, Accounts |
| Salesforce SOAP API | Metadata operations, bulk describe calls, complex queries |
| Salesforce Bulk API 2.0 | Initial data import of 10K+ records during onboarding |
| Salesforce Streaming API | Real-time push notifications for record changes (PushTopic, CDC) |
| HubSpot CRM API v3 | Alternative CRM sync -- deals, contacts, engagements, timeline events |
| HubSpot Webhooks | Real-time event subscriptions for deal and contact changes |
| OAuth 2.0 (JWT Bearer + Web Server flow) | Secure authentication for both Salesforce and HubSpot connections |
| Conflict resolution patterns | Last-write-wins with audit logging for bi-directional sync |
| Field mapping engines | Configurable mapping between CRM custom fields and DealRoom schema |
| Rate limit management | Exponential backoff, request queuing, API usage dashboards |

**Learning Resources:**
- Salesforce Developer Documentation (developer.salesforce.com)
- Salesforce Trailhead -- "API Basics" and "Integration Architecture" trails
- HubSpot Developer Documentation (developers.hubspot.com)
- "Designing Data-Intensive Applications" by Martin Kleppmann -- Chapter 5 (replication and sync)

**Priority:** P0 -- CRM sync is a hard requirement for every paying customer

---

### T3. Gmail API + Microsoft Graph API

**Why:** Email intelligence is a core differentiator. DealRoom must capture, analyze, and act on every email related to a deal. Gmail API and Microsoft Graph cover 95%+ of B2B email.

| Skill | Relevance |
|-------|-----------|
| Gmail API (messages, threads, labels, history) | Incremental email sync using history IDs for efficient polling |
| Microsoft Graph API (mail, events, contacts) | Outlook/Exchange email sync using delta tokens |
| OAuth 2.0 (Google + Microsoft identity platform) | User-level consent for email access with minimal scopes |
| Email parsing (MIME, headers, threading) | Extracting sender, recipients, subject, body, and thread associations |
| Email-to-deal association logic | Matching email addresses to contacts and contacts to deals |
| Privacy-preserving sync | Only syncing emails to/from known deal contacts, not personal emails |

**Learning Resources:**
- Google Workspace API Documentation (developers.google.com/gmail)
- Microsoft Graph API Documentation (learn.microsoft.com/graph)
- OAuth 2.0 Simplified by Aaron Parecki (oauth.com)

**Priority:** P0 -- Email intelligence is an MVP launch requirement

---

### T4. OAuth 2.0 Flows (Authorization Code, JWT Bearer, PKCE)

**Why:** DealRoom connects to 5+ external services (Salesforce, HubSpot, Gmail, Google Calendar, Zoom). Each requires a distinct OAuth flow. Mishandling auth leads to broken integrations and security vulnerabilities.

| Skill | Relevance |
|-------|-----------|
| Authorization Code flow (with PKCE) | Gmail, Google Calendar, Zoom -- user-initiated connections |
| JWT Bearer flow | Salesforce server-to-server authentication for background sync |
| Client Credentials flow | HubSpot private app authentication |
| Token refresh and rotation | Maintaining long-lived connections without user re-authentication |
| Scope management | Requesting minimum necessary permissions for each service |
| Token storage and encryption | Secure storage of access/refresh tokens in Supabase with encryption |

**Learning Resources:**
- OAuth 2.0 Simplified (oauth.com) -- Complete practical guide
- Auth0 documentation (auth0.com/docs) -- Flow diagrams and examples
- Supabase Auth documentation -- Provider setup guides

**Priority:** P0 -- Prerequisite for every external integration

---

### T5. OpenAI Whisper API + GPT-4o

**Why:** AI is the core of DealRoom. Whisper handles call transcription. GPT-4o powers deal scoring, email generation, coaching insights, and sentiment analysis. These are not bolt-on features -- they are the product.

| Skill | Relevance |
|-------|-----------|
| OpenAI Chat Completions API | Deal scoring, email generation, call summarization, coaching |
| Structured output (JSON mode) | Forcing reliable JSON responses for deal scores and action items |
| Streaming responses | Real-time email generation with typing animation in the composer |
| Whisper transcription API | Converting call recordings to accurate transcripts |
| Prompt engineering (system/user/assistant) | Building reliable prompts for deal scoring with consistent outputs |
| Token management and cost optimization | Keeping per-deal AI costs under $0.05 with smart context windowing |
| Fine-tuning (future) | Training custom models on deal outcomes for higher scoring accuracy |
| Function calling / tool use | Enabling AI to take actions (update CRM, send email, create task) |

**Learning Resources:**
- OpenAI API Documentation (platform.openai.com/docs)
- OpenAI Cookbook (github.com/openai/openai-cookbook)
- "Building AI-Powered Products" by Chip Huyen
- Anthropic Prompt Engineering Guide -- transferable principles

**Priority:** P0 -- AI is the product

---

### T6. Real-Time Data Processing + Event-Driven Architecture

**Why:** DealRoom must update deal scores, pipeline views, and alerts in real time as new activities arrive. Stale data kills trust in a sales tool.

| Skill | Relevance |
|-------|-----------|
| Supabase Realtime (Postgres Changes) | Live deal updates across all connected team members |
| Webhook processing | Receiving and handling events from Salesforce, HubSpot, Gmail, Zoom |
| Inngest (event-driven background jobs) | Deal scoring, email sync, CRM sync, forecast calculations |
| Queue management and retry logic | Handling failed API calls, rate limits, and transient errors |
| Optimistic UI updates | Showing deal changes immediately while sync happens in background |
| Debouncing and batching | Grouping multiple rapid updates into single processing cycles |

**Learning Resources:**
- Supabase Realtime documentation (supabase.com/docs/realtime)
- Inngest documentation (inngest.com/docs)
- "Designing Event-Driven Systems" by Ben Stopford (Confluent free ebook)

**Priority:** P0 -- Real-time updates are table stakes for sales tools

---

### T7. Data Visualization (Recharts, D3 Concepts)

**Why:** DealRoom surfaces intelligence through charts -- pipeline funnels, forecast trends, win rate graphs, score history, activity breakdowns. Visualization is how insights become actionable.

| Skill | Relevance |
|-------|-----------|
| Recharts (React charting library) | Pipeline bar charts, forecast trend lines, win rate graphs |
| Chart design principles | Choosing the right chart type for sales data (bar, line, funnel, gauge) |
| Interactive charts (tooltips, click-to-drill) | Managers click on a bar segment to see underlying deals |
| Responsive chart layouts | Charts that adapt from full dashboard to mobile views |
| Performance with large datasets | Rendering 12 months of daily data without lag |
| Accessibility in data visualization | Screen reader descriptions, colorblind-safe palettes |

**Learning Resources:**
- Recharts documentation (recharts.org)
- "Storytelling with Data" by Cole Nussbaumer Knaflic
- Observable (observablehq.com) -- interactive visualization examples
- Datawrapper blog -- practical chart design advice

**Priority:** P1 -- Critical for dashboard and analytics screens

---

## Domain Skills

### D1. B2B Sales Methodology (MEDDPICC, SPIN, Challenger)

**Why:** DealRoom's AI must understand how professional sales teams operate. The deal scoring model, coaching insights, and follow-up suggestions must align with established sales methodologies. If the AI gives advice that contradicts how sales teams actually work, they will churn immediately.

| Methodology | DealRoom Application |
|-------------|---------------------|
| **MEDDPICC** (Metrics, Economic Buyer, Decision criteria, Decision process, Paper process, Identify pain, Champion, Competition) | Deal scoring weights each MEDDPICC element. Missing an Economic Buyer triggers an alert. Champion engagement is a top scoring factor. |
| **SPIN Selling** (Situation, Problem, Implication, Need-payoff) | AI email generation uses SPIN framing in discovery-stage follow-ups. Call analysis detects question types. |
| **Challenger Sale** (Teach, Tailor, Take control) | Coaching insights compare rep behavior to Challenger patterns. AI suggests "teaching moments" for follow-up emails. |
| **Sandler System** | Pain/budget/decision qualification tracking in deal metadata |
| **BANT** (Budget, Authority, Need, Timeline) | Simplified qualification framework for smaller deals and SDR workflows |

**Learning Resources:**
- "MEDDPICC: The Ultimate Guide" by Andy Whyte
- "SPIN Selling" by Neil Rackham
- "The Challenger Sale" by Matthew Dixon and Brent Adamson
- Pavilion (joinpavilion.com) -- Sales methodology courses
- Gong Labs blog -- data-driven insights on what top sellers do differently

**Priority:** P0 -- Without deep sales domain knowledge, the AI will give bad advice

---

### D2. Sales Pipeline Management + Revenue Forecasting

**Why:** DealRoom's core screens are the pipeline dashboard and forecast view. Understanding how sales teams manage pipelines, qualify deals, and forecast revenue is essential for building a tool they will actually use.

| Concept | DealRoom Application |
|---------|---------------------|
| Pipeline stages and exit criteria | Configurable stages with recommended exit criteria per stage |
| Pipeline coverage ratios (3-5x quota) | Coverage metric on forecast dashboard, alerts when coverage drops |
| Weighted pipeline vs. unweighted | AI score replaces traditional stage-based weighting |
| Commit / Best Case / Pipeline categories | Forecast breakdown with AI-suggested categorization |
| Sales velocity formula (Deals x Win Rate x ASP / Cycle Time) | Analytics dashboard tracks all four velocity components |
| Quota attainment tracking | Rep and team quota tracking with real-time attainment percentage |
| Month-end / quarter-end deal acceleration | AI detects and recommends acceleration strategies for end-of-period |

**Learning Resources:**
- "The Sales Acceleration Formula" by Mark Roberge
- "Predictable Revenue" by Aaron Ross and Marylou Tyler
- RevOps Co-op community (revopscoop.com)
- Clari blog -- revenue forecasting best practices
- SaaStr Annual conference content (saastr.com)

**Priority:** P0 -- Pipeline and forecast are the two most-used screens

---

### D3. Sales Coaching + Rep Performance Analysis

**Why:** DealRoom's coaching hub is a key retention driver. Managers stay because coaching insights save them 5+ hours per week on 1:1 preparation. The AI must understand what "good" selling behavior looks like.

| Concept | DealRoom Application |
|---------|---------------------|
| Rep performance metrics (win rate, cycle time, activity volume) | Coaching scorecard compares rep to team averages |
| Behavior analysis (follow-up speed, multi-threading, discovery depth) | AI identifies specific behaviors that correlate with winning |
| Coaching frameworks (Observe, Analyze, Coach, Measure) | Coaching insights follow this structure for manager consumption |
| 1:1 meeting preparation | AI generates coaching agendas before scheduled 1:1 meetings |
| Skill gap identification | Radar chart comparing rep skills to top performers |
| Ramp time optimization | Track new hire ramp and identify where they need support |

**Learning Resources:**
- "Coaching Salespeople into Sales Champions" by Keith Rosen
- "The Coaching Habit" by Michael Bungay Stanier
- Gong Labs research on top performer behaviors
- Second Nature AI blog -- sales coaching methodologies

**Priority:** P1 -- Post-MVP but critical for manager retention

---

### D4. Deal Qualification Frameworks

**Why:** DealRoom's AI must assess deal quality against established qualification criteria. The scoring model needs to understand what makes a deal "qualified" versus "hopeful."

| Framework | Key Qualification Criteria | DealRoom Implementation |
|-----------|---------------------------|------------------------|
| **MEDDPICC** | 8 criteria from Metrics to Competition | Full MEDDPICC tracking in deal metadata with completion percentage |
| **BANT** | Budget, Authority, Need, Timeline | Simplified qualification checklist for SMB deals |
| **SCOTSMAN** | Solution, Competition, Originality, Timescales, Size, Money, Authority, Need | Extended qualification for enterprise deals |
| **CHAMP** | Challenges, Authority, Money, Prioritization | Alternative framework for customer-centric selling |

**Learning Resources:**
- Force Management (forcemanagement.com) -- MEDDPICC certification
- Sales Hacker blog (saleshacker.com) -- framework comparisons
- Winning by Design (winningbydesign.com) -- qualification methodology courses

**Priority:** P1 -- Enhances deal scoring accuracy

---

### D5. CRM Best Practices + Data Hygiene

**Why:** DealRoom promises to fix CRM data quality. The team must deeply understand why CRM data goes stale, how sales orgs structure their CRM, and what "clean" data looks like. DealRoom's auto-CRM update feature depends on understanding CRM data models.

| Concept | DealRoom Application |
|---------|---------------------|
| Salesforce data model (Accounts, Opportunities, Contacts, Activities) | Field mapping engine respects SF data relationships |
| HubSpot CRM data model (Companies, Deals, Contacts, Engagements) | Alternative mapping for HubSpot customers |
| Custom fields and picklist values | DealRoom handles arbitrary custom fields from customer CRMs |
| Data validation rules | Sync engine respects CRM validation rules to avoid sync failures |
| Duplicate management | Dedup logic when contacts appear across multiple deals |
| CRM admin workflows | Settings UI mirrors CRM admin patterns for familiarity |

**Learning Resources:**
- Salesforce Admin Trailhead (trailhead.salesforce.com)
- HubSpot Academy -- CRM Administration course
- SalesOps.io -- CRM architecture best practices
- "Salesforce for Dummies" by Liz Kao -- for understanding admin perspective

**Priority:** P0 -- CRM sync failures are the number one reason users churn from sales tools

---

## Design Skills

### DS1. Sales Dashboard UX + Data-Dense Interface Design

**Why:** Sales reps live in DealRoom 8+ hours per day. The dashboard must surface the right information at the right time without overwhelming users. Getting this wrong means reps revert to spreadsheets.

| Skill | DealRoom Application |
|-------|---------------------|
| Information hierarchy in dense UIs | Dashboard prioritizes "Today's Priorities" above metrics |
| Progressive disclosure | Summary cards expand to detailed views on click |
| Skeleton loading states | Every widget has a skeleton state to avoid layout shift |
| Empty states with clear CTAs | First-time users see setup checklists, not blank screens |
| Error isolation | Widget-level errors with retry buttons, not full-page errors |
| Dark mode design for data-dense apps | Reducing eye strain for all-day dashboard usage |

**Learning Resources:**
- "Refactoring UI" by Adam Wathan and Steve Schoger
- Stripe Dashboard -- gold standard for data-dense SaaS UX
- Linear app -- modern B2B SaaS design patterns
- Figma Community -- B2B dashboard design systems

**Priority:** P0 -- Dashboard UX determines first-impression retention

---

### DS2. Pipeline Visualization + Kanban Design

**Why:** The deal board is the second most-used screen. It must handle drag-and-drop interactions, 500+ deals, and complex filtering while remaining visually clear and performant.

| Skill | DealRoom Application |
|-------|---------------------|
| Kanban board design | Pipeline stages as columns with deal cards |
| Drag-and-drop interaction design | Smooth card dragging with visual insertion indicators |
| Card design with dense information | Deal card shows name, amount, score, health, owner, last activity |
| Virtualized rendering | Rendering 500+ cards without performance degradation |
| Filter UX for complex queries | Multi-select dropdowns for owner, amount, health, date range |
| Responsive kanban (horizontal scroll on mobile) | Tablet users can swipe between stages |

**Learning Resources:**
- Trello and Linear -- kanban UX patterns
- React DnD documentation (react-dnd.github.io)
- Atlassian Design System -- drag-and-drop guidelines
- "Don't Make Me Think" by Steve Krug -- simplicity in complex interfaces

**Priority:** P0 -- Pipeline board is a daily-use screen

---

### DS3. Activity Timeline + Email Composer UX

**Why:** The deal detail page centers on an activity timeline. The email composer must balance AI generation with manual editing. Both require careful interaction design.

| Skill | DealRoom Application |
|-------|---------------------|
| Timeline design (chronological event feeds) | Activity timeline with icons, timestamps, and expandable details |
| Rich text editing UX | TipTap editor for email composition with formatting toolbar |
| AI generation UX (streaming, editing, regenerating) | Email appears word-by-word, editable after generation |
| Inline editing patterns | Deal fields editable directly in the detail view |
| Slide-over panels | Contact details and quick actions without full navigation |
| Modal stacking (compose email over deal detail) | Proper z-index and focus management for layered UIs |

**Learning Resources:**
- GitHub activity feeds -- timeline design patterns
- Notion editor UX -- rich text editing
- TipTap documentation (tiptap.dev) -- editor customization
- Superhuman -- email composer UX inspiration

**Priority:** P0 -- Activity timeline and email composer are daily workflows

---

### DS4. Data Visualization Design (Charts, Gauges, Indicators)

**Why:** DealRoom communicates intelligence through visual elements -- score gauges, pipeline charts, forecast trend lines, coaching radar charts. Poorly designed charts lead to misinterpretation and lost trust.

| Skill | DealRoom Application |
|-------|---------------------|
| Chart type selection | Choosing bar vs. line vs. funnel based on the data story |
| Color encoding for data | Consistent color usage (green = healthy, red = critical, amber = at risk) |
| Gauge and radial chart design | Deal score displayed as a radial gauge with color zones |
| Sparklines and inline trends | Small trend lines in table cells and summary cards |
| Interactive chart design | Tooltips, click-to-drill, zoom, and brush selection |
| Accessible visualization | Patterns and labels alongside colors for colorblind users |

**Learning Resources:**
- "Storytelling with Data" by Cole Nussbaumer Knaflic
- "The Visual Display of Quantitative Information" by Edward Tufte
- Recharts examples (recharts.org/en-US/examples)
- Apple Human Interface Guidelines -- charts and graphs section

**Priority:** P1 -- Important for analytics and forecasting screens

---

## Business Skills

### B1. B2B SaaS Sales (Selling to Sales Teams)

**Why:** DealRoom's buyers are sales leaders -- VP Sales, CRO, Head of Revenue Operations. Selling to sales people is uniquely challenging because they know every sales tactic. The GTM strategy must be authentic, data-driven, and value-first.

| Skill | DealRoom Application |
|-------|---------------------|
| Selling to VP Sales / CRO persona | Understanding their pain (forecast accuracy, pipeline visibility, rep productivity) |
| Product-led growth (PLG) for B2B | Free trial with CRM connection, value demonstrated in 24 hours |
| Enterprise sales cycles | 3-6 month cycles for enterprise tier with security reviews and procurement |
| Champion building | Identifying internal champions who will drive DealRoom adoption |
| Multi-stakeholder selling | Selling to sales leadership, IT/security, and end-user reps simultaneously |
| Competitive positioning | Positioning against Gong, Clari, People.ai with clear differentiation |

**Learning Resources:**
- "From Impossible to Inevitable" by Aaron Ross and Jason Lemkin
- SaaStr Annual conference (saastr.com) -- B2B sales leadership content
- Pavilion (joinpavilion.com) -- CRO/VP Sales peer community
- "Obviously Awesome" by April Dunford -- positioning strategy

**Priority:** P0 -- Must deeply understand the buyer to build the right product

---

### B2. VP Sales / CRO Persona Expertise

**Why:** The primary buyer is a VP of Sales or Chief Revenue Officer at a B2B SaaS company with 5-50 reps. Understanding their daily life, priorities, KPIs, and frustrations is essential for product-market fit.

| Persona Insight | Product Implication |
|----------------|---------------------|
| Spends 30% of time on forecast calls | AI forecast replaces manual forecast assembly |
| Held accountable for pipeline accuracy | Real-time pipeline health dashboard with AI scoring |
| Coaches reps in 1:1 meetings weekly | Coaching hub with AI-generated agendas and insights |
| Reports to CEO/board quarterly | Board-ready reports exportable in one click |
| Evaluates new tools based on ROI within 90 days | Time-to-value must be under 48 hours |
| Skeptical of AI accuracy claims | Transparent scoring with explainable factors |
| Cares about rep adoption (tools reps hate get canceled) | Rep-first UX design, daily email digest, one-click actions |

**Learning Resources:**
- Sales Hacker community (saleshacker.com) -- VP Sales perspectives
- RevGenius community (revgenius.com) -- Revenue leader discussions
- "Sales Management Simplified" by Mike Weinberg
- Podcast: "The Revenue Builders" by Force Management

**Priority:** P0 -- Persona understanding drives every product decision

---

### B3. Sales Tech Ecosystem + Partnership Strategy

**Why:** DealRoom operates within a crowded sales tech ecosystem. Success depends on integrating with the tools teams already use (Salesforce, Slack, Zoom) and positioning as complementary rather than competitive.

| Skill | DealRoom Application |
|-------|---------------------|
| Salesforce AppExchange listing | Distribution channel reaching 150K+ Salesforce customers |
| HubSpot App Marketplace listing | Distribution channel for HubSpot ecosystem |
| Technology partnership programs | Zoom, Slack, Google Workspace partnership tiers |
| Integration marketplace design | Building DealRoom's own integration marketplace (Year 2) |
| Channel partnerships | Sales consulting firms reselling DealRoom to their clients |
| Competitive analysis | Continuous monitoring of Gong, Clari, People.ai feature releases |

**Learning Resources:**
- Salesforce AppExchange Partner Guide (partners.salesforce.com)
- HubSpot Solutions Partner Program (hubspot.com/partners)
- "Platform Revolution" by Geoffrey Parker -- marketplace strategy
- "Crossing the Chasm" by Geoffrey Moore -- technology adoption lifecycle

**Priority:** P1 -- Partnerships accelerate distribution after initial traction

---

### B4. Content Marketing + Thought Leadership for Sales Leaders

**Why:** VP Sales and CROs consume content to stay current on best practices. DealRoom's content marketing must establish authority on AI-powered sales intelligence to drive inbound demand.

| Content Type | Purpose | Distribution |
|-------------|---------|--------------|
| Data reports ("State of B2B Sales 2025") | Establish authority, generate press coverage | Blog, LinkedIn, email |
| Sales methodology guides | SEO traffic, lead generation | Blog, gated downloads |
| Benchmark data ("Average win rates by industry") | Unique data asset from DealRoom's anonymized dataset | Blog, social media |
| Video content (product walkthroughs, tips) | YouTube SEO, social sharing | YouTube, LinkedIn |
| Podcast appearances | Reach VP Sales audience where they listen | Guest appearances |
| Conference speaking | Brand awareness and credibility | SaaStr, Pavilion, sales conferences |

**Learning Resources:**
- "They Ask, You Answer" by Marcus Sheridan -- content marketing framework
- Gong Labs blog -- benchmark for sales data content marketing
- HubSpot Marketing Blog -- B2B content strategy
- "Building a StoryBrand" by Donald Miller -- messaging frameworks

**Priority:** P2 -- Matters after product-market fit is established

---

## Skill Priority Matrix

| Priority | Skill | Category | When Needed |
|----------|-------|----------|-------------|
| P0 | Next.js 14 + App Router | Technical | Month 1 |
| P0 | Salesforce / HubSpot API | Technical | Month 1 |
| P0 | Gmail / Graph API | Technical | Month 2 |
| P0 | OAuth 2.0 flows | Technical | Month 1 |
| P0 | OpenAI GPT-4o + Whisper | Technical | Month 2 |
| P0 | Real-time data processing | Technical | Month 2 |
| P0 | B2B sales methodology (MEDDPICC, SPIN) | Domain | Month 1 |
| P0 | Pipeline management + forecasting | Domain | Month 1 |
| P0 | CRM best practices | Domain | Month 1 |
| P0 | Dashboard UX design | Design | Month 1 |
| P0 | Pipeline visualization + kanban | Design | Month 1 |
| P0 | Activity timeline + email composer UX | Design | Month 2 |
| P0 | Selling to VP Sales / CRO persona | Business | Month 1 |
| P0 | VP Sales persona expertise | Business | Month 1 |
| P1 | Data visualization (Recharts) | Technical | Month 3 |
| P1 | Sales coaching analysis | Domain | Month 7 |
| P1 | Deal qualification frameworks | Domain | Month 3 |
| P1 | Chart and gauge design | Design | Month 3 |
| P1 | Sales tech ecosystem partnerships | Business | Month 6 |
| P2 | Content marketing for sales leaders | Business | Month 9 |

---

## Unique Skills for DealRoom

These skills are particularly rare and valuable for DealRoom, differentiating the team from generic SaaS builders.

### 1. AI + Sales Domain Intersection

The ability to translate sales methodology concepts (MEDDPICC stages, champion engagement patterns, multi-threading depth) into AI prompts and scoring algorithms. This requires someone who has both closed B2B deals and built ML/AI systems.

### 2. CRM Sync Engineering

Building reliable bi-directional sync with Salesforce and HubSpot is notoriously difficult. Conflict resolution, field mapping, rate limit handling, and bulk operations require specialized experience. Most failed sales tools die because their CRM sync broke.

### 3. Sales Data Storytelling

Turning raw deal data into compelling visual narratives that sales leaders trust and act on. This combines data visualization skill with deep understanding of what metrics matter to a VP Sales versus a CRO versus a rep.

### 4. Real-Time AI Pipeline Processing

Orchestrating multiple AI calls (deal scoring, sentiment analysis, email generation, call summarization) across thousands of deals without exceeding cost budgets or latency targets. This requires both AI engineering and cost optimization experience.

### 5. B2B Sales Tool Go-To-Market

Selling a sales tool to sales teams is a unique meta-challenge. The buyers evaluate your product using the same criteria they evaluate their own deals. The GTM motion must be flawless because VP Sales buyers will notice every sales mistake.

---

## Team Skill Distribution

| Role | Primary Skills | Secondary Skills |
|------|---------------|-----------------|
| **CEO / Sales Domain Expert** | D1, D2, D3, D4, D5, B1, B2, B3 | DS1, B4 |
| **CTO / AI Engineer** | T1, T2, T3, T4, T5, T6 | T7, D5 |
| **Head of Product / Design** | DS1, DS2, DS3, DS4, D1, D2 | T7, B2 |
| **First Sales Hire** | B1, B2, B3, B4 | D1, D2 |
| **First Engineer Hire** | T1, T2, T3, T6 | T5, T7 |

---

*Skills designed to cover the full stack -- from CRM API plumbing to AI prompt engineering to closing VP Sales buyers -- required to build and sell a winning deal intelligence platform.*
