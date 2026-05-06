# BoardBrief — Skills

## Skills Overview

Building BoardBrief requires a cross-functional blend of technical engineering, corporate governance domain expertise, executive-grade design sensibility, and startup ecosystem business acumen. This document maps every skill needed, organized by category, with priority levels and learning resources.

**Priority levels:**
- **P0 — Must have before starting:** Cannot build the MVP without this skill
- **P1 — Must have before launch:** Needed for a production-quality MVP
- **P2 — Should have post-launch:** Important for scaling and differentiation
- **P3 — Nice to have:** Enhances the product but not blocking

---

## Technical Skills

### T1. Next.js 14 (App Router, RSC, Server Actions)

**Priority:** P0
**Why:** The entire frontend and API layer runs on Next.js 14 with App Router. Server Components are critical for rendering financial dashboards server-side (keeping sensitive data processing off the client). Server Actions power form submissions for resolutions, action items, and meeting notes.

**Key competencies:**
- App Router architecture (route groups, parallel routes, intercepting routes)
- React Server Components vs. Client Components — knowing the boundary
- Server Actions for mutations (resolution voting, action item creation)
- Streaming SSR for progressive loading of data-heavy board decks
- Middleware for auth checks and RBAC enforcement
- Edge runtime vs. Node runtime tradeoffs for API routes

**Learning resources:**
1. [Next.js Documentation — App Router](https://nextjs.org/docs/app) — Official docs, start here
2. [Next.js Learn Course](https://nextjs.org/learn) — Hands-on tutorial covering App Router patterns
3. [Lee Robinson's YouTube Channel](https://www.youtube.com/@leerob) — Next.js core team member walkthroughs
4. [Josh Tried Coding — Next.js 14 SaaS Build](https://www.youtube.com/c/joshtriedcoding) — Full SaaS project tutorials
5. [Vercel Templates](https://vercel.com/templates/next.js) — Production-ready starter templates

---

### T2. Supabase (PostgreSQL, Auth, RLS, Storage, Realtime)

**Priority:** P0
**Why:** Supabase is the entire backend — database, authentication, file storage, and real-time subscriptions. Row Level Security (RLS) is the cornerstone of BoardBrief's security model, ensuring board members only access documents for their authorized boards.

**Key competencies:**
- PostgreSQL schema design for relational governance data (boards, meetings, resolutions, votes)
- Row Level Security policies — writing complex policies for multi-tenant, multi-role access
- Supabase Auth with custom claims for RBAC (founder, board_chair, director, observer, secretary)
- Supabase Storage with per-bucket access policies for board documents
- Realtime subscriptions for live meeting features (agenda progress, voting, action items)
- Edge Functions for webhook processing and background jobs
- Supabase Vault for encrypting integration API tokens

**Learning resources:**
1. [Supabase Documentation](https://supabase.com/docs) — Comprehensive official docs
2. [Supabase YouTube Channel](https://www.youtube.com/@Supabase) — Tutorials and architecture deep dives
3. [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) — Critical for this project
4. [Build a SaaS with Next.js and Supabase (egghead.io)](https://egghead.io/courses/build-a-saas-product-with-next-js-supabase) — End-to-end SaaS course
5. [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) — Foundational SQL and PostgreSQL skills

---

### T3. Stripe and QuickBooks API Integration

**Priority:** P0
**Why:** These two integrations power the core value proposition — auto-generated board decks from live financial data. Stripe provides revenue, MRR, churn, and subscription metrics. QuickBooks provides P&L, balance sheet, burn rate, and runway calculations.

**Key competencies:**
- Stripe API — retrieving subscription data, MRR calculations, customer metrics, webhook handling
- QuickBooks Online API — OAuth 2.0 flow, fetching financial statements (P&L, balance sheet, cash flow)
- Financial metric derivation — calculating burn rate, runway, net revenue retention from raw API data
- Data normalization — reconciling Stripe revenue data with QuickBooks accounting data
- Token management — securely storing and refreshing OAuth tokens
- Rate limiting — handling API rate limits gracefully with retry logic and queuing
- Webhook processing — real-time data updates from Stripe events

**Learning resources:**
1. [Stripe API Reference](https://stripe.com/docs/api) — Official API documentation
2. [QuickBooks Online API Docs](https://developer.intuit.com/app/developer/qbo/docs/get-started) — Official QuickBooks developer docs
3. [Stripe Billing Guide](https://stripe.com/docs/billing) — Subscription and revenue data models
4. [OAuth 2.0 Simplified (Aaron Parecki)](https://aaronparecki.com/oauth-2-simplified/) — Best OAuth learning resource
5. [Building Financial Dashboards (Stripe Blog)](https://stripe.com/blog/engineering) — Engineering blog with data patterns

---

### T4. PDF Generation and Document Management

**Priority:** P0
**Why:** Board decks must export to professionally formatted PDFs for distribution. Meeting minutes require PDF export with company letterhead. The document management system handles versioning, access control, and watermarking.

**Key competencies:**
- react-pdf for client-side PDF rendering and preview
- Server-side PDF generation (Puppeteer or @react-pdf/renderer for Node.js)
- PDF formatting — page layouts, headers/footers, chart embedding, table formatting
- Document versioning — tracking changes across document versions
- Watermarking — dynamic watermarks on downloaded PDFs (recipient name, date, confidentiality)
- File upload handling — chunked uploads for large documents, progress tracking
- Document search — full-text search across document contents using PostgreSQL tsvector

**Learning resources:**
1. [@react-pdf/renderer Documentation](https://react-pdf.org/) — React-based PDF generation
2. [Puppeteer Documentation](https://pptr.dev/) — Headless Chrome for server-side PDF generation
3. [Supabase Storage Guide](https://supabase.com/docs/guides/storage) — File storage with access policies
4. [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html) — For document search functionality
5. [PDF.js (Mozilla)](https://mozilla.github.io/pdf.js/) — PDF rendering in the browser

---

### T5. Real-Time Collaboration and Live Meeting Features

**Priority:** P1
**Why:** The live meeting room requires real-time updates — agenda progress visible to all attendees, collaborative note-taking, live action item creation, and voting during meetings. Supabase Realtime powers the sync layer.

**Key competencies:**
- Supabase Realtime — channel subscriptions, broadcast, presence tracking
- Conflict resolution — handling concurrent edits to meeting notes
- Optimistic updates — instant UI feedback before server confirmation
- WebSocket connection management — reconnection logic, connection health monitoring
- TipTap collaborative editing — real-time rich text editing with Y.js or similar CRDT
- Presence indicators — showing who is viewing which slide, who is typing

**Learning resources:**
1. [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime) — Official realtime documentation
2. [TipTap Collaboration Docs](https://tiptap.dev/docs/editor/extensions/functionality/collaboration) — Collaborative editing setup
3. [Y.js Documentation](https://docs.yjs.dev/) — CRDT framework for real-time collaboration
4. [Building Real-Time Apps with Supabase (LogRocket)](https://blog.logrocket.com/building-real-time-apps-supabase/) — Tutorial
5. [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/) — Foundational concepts for distributed data

---

### T6. OpenAI Whisper API (Meeting Transcription)

**Priority:** P1
**Why:** AI-generated meeting minutes depend on accurate transcription. Whisper converts board meeting recordings into text, which GPT-4o then formats into professional minutes with action item extraction.

**Key competencies:**
- Whisper API — audio file formats, response formats (verbose JSON for timestamps and segments)
- Audio processing — handling large audio files (chunking for meetings over 25MB limit)
- Speaker diarization — post-processing transcripts to identify individual speakers
- Confidence scoring — identifying low-confidence segments for manual review
- Audio quality optimization — preprocessing audio for better transcription accuracy
- Cost management — estimating and monitoring transcription costs per meeting

**Learning resources:**
1. [OpenAI Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text) — Official documentation
2. [Whisper GitHub Repository](https://github.com/openai/whisper) — Open-source model for local testing
3. [Speaker Diarization with pyannote](https://github.com/pyannote/pyannote-audio) — Open-source speaker identification
4. [Audio Processing with FFmpeg](https://ffmpeg.org/documentation.html) — Audio format conversion and preprocessing
5. [Building Transcription Pipelines (AssemblyAI Blog)](https://www.assemblyai.com/blog) — Practical transcription architecture

---

### T7. OpenAI GPT-4o (Narrative Generation, Minutes Formatting)

**Priority:** P0
**Why:** GPT-4o is the AI engine behind board deck narrative generation, meeting minutes formatting, action item extraction, KPI commentary, and investor update drafting. Prompt engineering quality directly determines product quality.

**Key competencies:**
- Prompt engineering — crafting system prompts for executive-quality board deck content
- Structured output — using JSON mode and function calling for predictable output formats
- Context window management — fitting financial data, company context, and previous decks into the context
- Temperature and parameter tuning — lower temperature for financial content, higher for narrative
- Streaming responses — progressive rendering of generated content for better UX
- Cost optimization — balancing quality with token usage, caching repeated context
- Guardrails — preventing hallucination of financial figures, ensuring AI-generated content is flagged for review

**Learning resources:**
1. [OpenAI API Documentation](https://platform.openai.com/docs/) — Official API reference
2. [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) — Best practices
3. [Vercel AI SDK](https://sdk.vercel.ai/docs) — Streaming AI responses in Next.js
4. [Building AI-Powered SaaS (Fireship)](https://fireship.io/) — Practical AI integration tutorials
5. [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) — Transferable prompt engineering techniques

---

### T8. CRM API Integration (HubSpot / Salesforce)

**Priority:** P1
**Why:** Pipeline data is a standard component of board decks. Integrating with HubSpot or Salesforce allows auto-population of pipeline value, deal count, win rate, and sales velocity into the deck.

**Key competencies:**
- HubSpot CRM API — deals, pipeline stages, contact data, reporting endpoints
- Salesforce REST API — SOQL queries, opportunity data, forecast data
- OAuth 2.0 flow for both platforms
- Data mapping — translating CRM data structures into BoardBrief's standardized pipeline metrics
- Incremental sync — efficient data fetching (only changed records since last sync)

**Learning resources:**
1. [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview) — Official docs
2. [Salesforce REST API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/) — Official docs
3. [HubSpot Developer Tutorials](https://developers.hubspot.com/docs/api/tutorials) — Practical integration guides
4. [Trailhead (Salesforce)](https://trailhead.salesforce.com/) — Salesforce development learning platform

---

### T9. HRIS API Integration (Gusto / Rippling)

**Priority:** P1
**Why:** Headcount, hiring pace, and organizational data are standard board deck components. HRIS integration eliminates manual data entry for team updates.

**Key competencies:**
- Gusto API — employee directory, department data, payroll summaries
- Rippling API — headcount, org chart data, compensation data
- Sensitive data handling — payroll and compensation data requires extra encryption and access controls
- Data aggregation — summarizing granular HRIS data into board-level metrics (headcount by department, hiring pace)

**Learning resources:**
1. [Gusto API Documentation](https://docs.gusto.com/app-integrations/docs/introduction) — Official docs
2. [Rippling API Documentation](https://developer.rippling.com/) — Official docs
3. [Merge.dev](https://merge.dev/) — Unified HRIS API (alternative to direct integration)
4. [Finch API](https://tryfinch.com/) — Unified employment API for HRIS and payroll

---

### T10. DocuSign API (E-Signature for Resolutions)

**Priority:** P2
**Why:** Board resolutions that have been voted on need formal signing. DocuSign integration allows digital execution of resolutions directly from BoardBrief.

**Key competencies:**
- DocuSign eSignature API — envelope creation, recipient management, signing flow
- Embedded signing — in-app signing experience without redirecting to DocuSign
- Template management — pre-built resolution templates in DocuSign
- Status tracking — webhook-based tracking of signing status

**Learning resources:**
1. [DocuSign Developer Center](https://developers.docusign.com/) — Official documentation
2. [DocuSign eSignature REST API Guide](https://developers.docusign.com/docs/esign-rest-api/) — API reference
3. [DocuSign Code Examples (GitHub)](https://github.com/docusign/code-examples-node) — Node.js examples

---

## Domain Skills

### D1. Corporate Governance Fundamentals

**Priority:** P0
**Why:** BoardBrief is a governance tool. The team must understand board composition, fiduciary duties, committee structures, and the legal framework that governs board operations. Every feature — from resolution templates to minutes formatting — must be legally sound.

**Key competencies:**
- Board of directors structure — roles (chair, independent directors, investor directors, founders), composition requirements
- Fiduciary duties — duty of care, duty of loyalty, business judgment rule
- Committee structures — audit committee, compensation committee, nominating and governance committee
- Board meetings — quorum requirements, voting procedures, parliamentary procedure basics
- Corporate records — what must be maintained (minutes, resolutions, stock ledger, bylaws, certificate of incorporation)

**Learning resources:**
1. [The Startup Board (Brad Feld)](https://www.amazon.com/Startup-Board-Getting-Most-Directors/dp/1118516826) — Essential reading for startup board dynamics
2. [NVCA Model Legal Documents](https://nvca.org/model-legal-documents/) — Standard VC legal templates including board-related provisions
3. [Startup Boards: A Field Guide (Mahendra Ramsinghani)](https://www.amazon.com/Startup-Boards-Getting-Board-Directors/dp/1119981921) — Practical startup board guide
4. [Harvard Law School Forum on Corporate Governance](https://corpgov.law.harvard.edu/) — Academic articles on governance topics
5. [Clerky's Startup Incorporation Documents](https://www.clerky.com/) — Standard Delaware incorporation documents

---

### D2. Startup Board Dynamics by Stage

**Priority:** P0
**Why:** Board composition, meeting cadence, and governance needs differ dramatically between Seed, Series A, and Series B+ companies. BoardBrief must adapt its templates, recommendations, and workflows to each stage.

**Key competencies:**
- **Seed stage** — Typically 2-3 board members (founders + maybe one investor), informal meetings, quarterly cadence, minimal governance requirements
- **Series A** — 3-5 board members (2 founders, 2 investors, 1 independent), more formal meetings, board consent actions become common
- **Series B+** — 5-7 board members, committee formation begins, compensation committee required for option grants, audit committee for financial oversight
- Board observer rights — who gets them, what access they have, when to formalize
- Protective provisions — understanding investor voting rights on key decisions
- Board composition evolution — planning for independent directors, managing board dynamics

**Learning resources:**
1. [Venture Deals (Brad Feld & Jason Mendelson)](https://www.amazon.com/Venture-Deals-Smarter-Lawyer-Capitalist/dp/1119594820) — The bible for VC term sheets and board provisions
2. [YC Library — Board of Directors](https://www.ycombinator.com/library) — YC's advice on board management
3. [First Round Review — Board Management Articles](https://review.firstround.com/) — Practical startup board advice
4. [SaaStr — Board Meeting Posts](https://www.saastr.com/) — Jason Lemkin's board meeting advice for SaaS founders
5. [Carta's Guide to Board Management](https://carta.com/blog/) — Board management best practices

---

### D3. Financial Reporting for Boards

**Priority:** P0
**Why:** Financial data is the centerpiece of most board decks. The team must understand which metrics matter at each stage, how to calculate them from raw data, and how to present them in a board-ready format.

**Key competencies:**
- SaaS metrics — MRR, ARR, churn (logo and revenue), net revenue retention, expansion MRR, contraction MRR
- Burn rate and runway — gross burn, net burn, runway calculation, cash flow forecasting
- Unit economics — CAC, LTV, LTV:CAC ratio, payback period, contribution margin
- Financial statements — P&L, balance sheet, cash flow statement (board-level summaries, not full statements)
- Growth metrics — month-over-month growth rate, compound monthly growth rate, Rule of 40, burn multiple
- Fundraising metrics — dilution, pre/post-money valuation, option pool, 409A valuation context

**Learning resources:**
1. [SaaS Metrics 2.0 (David Skok)](https://www.forentrepreneurs.com/saas-metrics-2/) — Definitive guide to SaaS metrics
2. [Christoph Janz's SaaS Metrics Templates](https://christophjanz.blogspot.com/) — Spreadsheet templates for SaaS financial modeling
3. [a16z's Guide to SaaS Metrics](https://a16z.com/saas-metrics/) — Andreessen Horowitz's SaaS metrics framework
4. [Stripe Atlas Guides](https://stripe.com/atlas/guides) — Financial fundamentals for startups
5. [Baremetrics Open Startups](https://baremetrics.com/) — Real-world SaaS financial dashboards for reference

---

### D4. Legal Compliance (Delaware Corporate Law)

**Priority:** P1
**Why:** Most VC-backed startups are Delaware corporations. BoardBrief's resolution templates, voting procedures, and consent actions must comply with Delaware General Corporation Law (DGCL). Errors in governance documentation can create legal liability.

**Key competencies:**
- Delaware General Corporation Law (DGCL) — key sections affecting boards (Sections 141, 228, 242, 251)
- Board resolutions — proper format, required language, voting thresholds
- Written consent actions — requirements for unanimous vs. majority written consent
- Annual requirements — annual report filings, franchise tax, registered agent
- D&O insurance — what it covers, why startups need it, standard coverage amounts
- Stock option administration — board approval requirements, 409A compliance, vesting schedules
- Bylaws — standard provisions affecting board operations

**Learning resources:**
1. [Delaware General Corporation Law (Full Text)](https://delcode.delaware.gov/title8/) — Primary legal source
2. [WSGR's Corporate Governance Guides](https://www.wsgr.com/) — Wilson Sonsini governance publications
3. [Cooley GO (Cooley LLP)](https://www.cooleygo.com/) — Startup legal resources including board governance
4. [Gunderson Dettmer Publications](https://www.gunder.com/) — Startup-focused legal guides
5. [Startup Law 101 (Joe Wallin)](https://www.startuplawblog.com/) — Accessible legal concepts for startups

---

### D5. Investor Relations

**Priority:** P1
**Why:** BoardBrief includes investor update generation and board-to-investor communication tools. Understanding what investors expect from portfolio company reporting, and how to frame data for investor audiences, is critical for generating useful content.

**Key competencies:**
- Investor update best practices — frequency, format, key sections (metrics, highlights, lowlights, asks)
- Board-investor communication norms — what to share, what not to share, information rights
- VC portfolio management — how VCs track portfolio companies, what data they need
- Fundraising communication — how board deck data flows into fundraising data rooms
- Managing different investor types — lead investors vs. follow-on, angels vs. institutions

**Learning resources:**
1. [Visible.vc Investor Update Templates](https://visible.vc/) — Templates and best practices
2. [Lenny's Newsletter — Investor Updates](https://www.lennysnewsletter.com/) — Practical founder advice
3. [Elizabeth Yin's Blog (Hustle Fund)](https://elizabethyin.com/) — VC perspective on portfolio communication
4. [OpenVC's Investor Update Guide](https://openvc.app/) — Community-driven best practices
5. [NFX's Guide to Investor Updates](https://www.nfx.com/) — Framework for effective investor communication

---

## Design Skills

### DS1. Board Deck Design and Executive Data Visualization

**Priority:** P0
**Why:** Board decks must look premium and executive-grade. The data visualizations (financial charts, KPI dashboards, metric cards) must convey complex information clearly at a glance. Board members are senior executives who expect polished, professional materials.

**Key competencies:**
- Executive dashboard design — information hierarchy, progressive disclosure, scannable layouts
- Financial chart design — choosing the right chart type for each metric, axis labeling, annotations
- Data density — presenting maximum information with minimum clutter (Tufte principles)
- Color-coded status — using color to convey performance (on track, at risk, behind) without relying solely on color
- Print-ready design — board decks must look good when exported to PDF and printed
- Responsive data visualization — charts that work on desktop, tablet, and mobile
- Recharts customization — custom chart components, themed styling, interactive tooltips

**Learning resources:**
1. [The Visual Display of Quantitative Information (Edward Tufte)](https://www.edwardtufte.com/tufte/books_vdqi) — The foundational text on data visualization
2. [Storytelling with Data (Cole Nussbaumer Knaflic)](https://www.storytellingwithdata.com/) — Practical data visualization for business
3. [Recharts Documentation](https://recharts.org/en-US/) — Chart library used in BoardBrief
4. [Refactoring UI (Adam Wathan & Steve Schoger)](https://www.refactoringui.com/) — Design fundamentals for developers
5. [Material Design Data Visualization Guidelines](https://m3.material.io/) — Google's data visualization principles

---

### DS2. Secure Document Portal UX

**Priority:** P0
**Why:** Board portals handle confidential corporate documents. The UX must convey security and trust while remaining intuitive for non-technical board members who may be in their 50s-60s. Security features (MFA, access controls) must be frictionless.

**Key competencies:**
- Trust-building UI patterns — security indicators, access badges, audit trail visibility
- Document viewer UX — in-browser PDF viewing, annotation, watermarking
- Permission-aware interfaces — showing/hiding content based on user role without confusion
- Magic link authentication — seamless login flow for board members
- MFA flows — TOTP setup, recovery codes, graceful degradation
- Accessibility for older users — larger touch targets, clear labels, simple navigation

**Learning resources:**
1. [Nielsen Norman Group — Enterprise UX](https://www.nngroup.com/) — Research-backed enterprise design patterns
2. [Laws of UX](https://lawsofux.com/) — Foundational UX principles
3. [Inclusive Design Principles](https://inclusivedesignprinciples.org/) — Designing for diverse users
4. [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — World-class UX patterns
5. [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility standards

---

### DS3. Meeting Management Interface Design

**Priority:** P1
**Why:** The live meeting room is the most interaction-dense screen in BoardBrief. It combines an agenda timer, real-time notes, action item capture, and voting — all while a meeting is in progress. The interface must be calming, not overwhelming.

**Key competencies:**
- Real-time interface design — handling live data updates without jarring the user
- Timer and progress UI — countdown timers, progress indicators, over-time warnings
- Split-panel layouts — managing multiple panels of content (agenda, notes, actions) in limited space
- Distraction-free writing — note-taking interface that encourages focus
- Keyboard-first interactions — power users should never need to touch the mouse during a meeting

**Learning resources:**
1. [Linear App](https://linear.app/) — Best-in-class real-time interface design
2. [Notion](https://www.notion.so/) — Reference for clean, distraction-free editing interfaces
3. [Figma Community — Meeting Templates](https://www.figma.com/community) — UI design inspiration
4. [Designing for Real-Time (Smashing Magazine)](https://www.smashingmagazine.com/) — Real-time UI design patterns

---

### DS4. Enterprise-Grade but Founder-Friendly Design Language

**Priority:** P0
**Why:** BoardBrief serves two audiences with different expectations. Founders expect modern, intuitive SaaS UX (think Linear, Notion). Board members expect polished, professional enterprise UX (think Bloomberg, board portals). The design must satisfy both.

**Key competencies:**
- Dual-audience design — different interface modes for different user types without maintaining two separate UIs
- Premium visual design — spacing, typography, and color that communicate quality and trustworthiness
- Shadcn/ui customization — extending the component library with boardroom-appropriate styling
- Micro-interactions — subtle animations that add polish without slowing the experience (Framer Motion)
- Dark mode implementation — maintaining premium feel in both light and dark themes
- Brand consistency — cohesive visual language across all surfaces (web app, emails, PDFs, portal)

**Learning resources:**
1. [shadcn/ui Documentation](https://ui.shadcn.com/) — The component library used in BoardBrief
2. [Tailwind CSS Documentation](https://tailwindcss.com/docs) — Utility-first CSS framework
3. [Framer Motion Documentation](https://www.framer.com/motion/) — Animation library
4. [Designjoy](https://www.designjoy.co/) — Premium SaaS design reference
5. [SaaS UI Patterns (Mobbin)](https://mobbin.com/) — Real-world SaaS design patterns

---

## Business Skills

### B1. Startup Founder Persona Understanding

**Priority:** P0
**Why:** The primary user is a VC-backed startup founder (or COO/CFO) who has never run a board meeting before, is time-starved, and views board prep as a painful obligation. Understanding this persona drives every product, design, and marketing decision.

**Key competencies:**
- Founder pain points — board prep time burden, governance anxiety, investor relationship management
- Buying behavior — founders research tools in Slack communities, Twitter, and peer recommendations
- Price sensitivity — startups are cost-conscious but will pay for tools that save founder time
- Onboarding expectations — must deliver value within 30 minutes of signup (connect Stripe, generate first deck)
- Churn triggers — understanding why founders might stop using the tool (CFO hire, outgrow the product, company fails)

**Learning resources:**
1. [The Mom Test (Rob Fitzpatrick)](https://www.momtestbook.com/) — Customer interview techniques
2. [Lenny Rachitsky's Newsletter](https://www.lennysnewsletter.com/) — Product management for B2B SaaS
3. [First Round Review](https://review.firstround.com/) — Startup founder insights
4. [Indie Hackers](https://www.indiehackers.com/) — Founder community and case studies
5. [SaaStr Podcast](https://www.saastr.com/podcast/) — B2B SaaS founder interviews

---

### B2. VC Firm Partnership Development

**Priority:** P1
**Why:** VC firms are the highest-leverage acquisition channel. A single VC firm with 30 portfolio companies can drive 30 customers. VCs are incentivized to recommend BoardBrief because better board prep means better board meetings for their partners.

**Key competencies:**
- VC firm structure — understanding GP, LP, partner, principal, associate roles
- Portfolio operations — how VC platform teams support portfolio companies
- Partnership deal structure — revenue share vs. co-marketing vs. preferred pricing
- VC firm personas — what partners care about (board meeting quality), what platform teams care about (portfolio company support tools)
- Referral program design — incentive structures that motivate VC firms to actively recommend the product

**Learning resources:**
1. [Venture Deals (Brad Feld)](https://www.amazon.com/Venture-Deals-Smarter-Lawyer-Capitalist/dp/1119594820) — Understanding VC firm operations
2. [a16z Portfolio Operations](https://a16z.com/) — How top firms run platform teams
3. [First Round's Portfolio Platform](https://firstround.com/) — Example of world-class portfolio support
4. [Bessemer's Portfolio Support](https://www.bvp.com/) — Another leading portfolio operations model
5. [NVCA Resources](https://nvca.org/) — Industry association resources

---

### B3. Startup Law Firm Partnerships (WSGR, Cooley, Gunderson)

**Priority:** P1
**Why:** Startup law firms (Wilson Sonsini, Cooley, Gunderson Dettmer, Fenwick) counsel hundreds of startups on corporate governance. A partnership with even one firm creates a trusted referral channel. Lawyers recommending BoardBrief carries enormous credibility.

**Key competencies:**
- Law firm business models — understanding billable hours, client acquisition, and how law firms evaluate partnerships
- Legal technology landscape — where BoardBrief fits relative to contract management, cap table, and legal ops tools
- Compliance alignment — ensuring BoardBrief's templates and workflows align with what these firms recommend to clients
- Co-marketing opportunities — joint webinars, published governance guides, template libraries
- Integration opportunities — linking BoardBrief's resolution templates to firms' preferred legal language

**Learning resources:**
1. [Cooley GO](https://www.cooleygo.com/) — Cooley's startup resource platform (model for partnership)
2. [WSGR Publications](https://www.wsgr.com/) — Wilson Sonsini's startup governance resources
3. [Gunderson Dettmer Resources](https://www.gunder.com/) — Startup legal guides
4. [Legal Technology Buyers Guide (Thomson Reuters)](https://legal.thomsonreuters.com/) — Legal tech market overview
5. [ABA Journal — Legal Technology](https://www.abajournal.com/) — Legal industry trends

---

### B4. Accelerator and Founder Community Partnerships

**Priority:** P2
**Why:** Accelerators (YC, Techstars, 500 Global) and founder communities (On Deck, South Park Commons, Sequoia Arc) are concentrated pools of the target customer. Getting included in an accelerator's recommended tool stack creates a recurring pipeline of new cohort companies.

**Key competencies:**
- Accelerator program structures — when startups join, when they need board tools (post-demo day, post-funding)
- Community partnership models — sponsored tools, cohort deals, batch presentations
- PLG within communities — how to get organic adoption within founder networks
- Timing — companies need BoardBrief after their first priced round, which is typically post-accelerator
- Content marketing for communities — governance guides, board prep templates, board meeting playbooks

**Learning resources:**
1. [YC Startup School](https://www.startupschool.org/) — Understanding YC company needs
2. [Techstars Toolkit](https://www.techstars.com/) — Accelerator ecosystem resources
3. [On Deck](https://www.beondeck.com/) — Founder community model
4. [South Park Commons](https://www.southparkcommons.com/) — Builder community model
5. [Startup Toolchain Reports (SaaStr)](https://www.saastr.com/) — What tools startups use at each stage

---

## Unique Skills for BoardBrief

These skills are specifically unique to BoardBrief and not commonly found in general SaaS development.

### U1. Board Meeting Parliamentary Procedure

**Priority:** P1
**Why:** Board meetings follow formal procedures (calling to order, establishing quorum, motions, seconds, voting). BoardBrief's agenda builder, meeting room, and minutes generator must understand and enforce these procedures.

**Key concepts:** Quorum requirements, motion/second protocol, voting procedures (unanimous, majority, supermajority), executive sessions, recusal for conflicts of interest.

**Learning resources:**
1. [Robert's Rules of Order (Simplified)](https://robertsrules.com/) — The standard for meeting procedure
2. [Board Meeting Procedures (BoardEffect)](https://www.boardeffect.com/) — Simplified board meeting procedures

---

### U2. Financial Data Reconciliation

**Priority:** P0
**Why:** Stripe revenue data and QuickBooks accounting data often do not match due to revenue recognition timing, refunds, and accrual accounting. BoardBrief must handle discrepancies gracefully and present reconciled data to boards.

**Key concepts:** Cash vs. accrual accounting, revenue recognition (ASC 606), deferred revenue, timing differences between payment processor and accounting system.

**Learning resources:**
1. [ASC 606 Revenue Recognition (Deloitte)](https://www.iasplus.com/) — Revenue recognition standard
2. [SaaS Revenue Recognition Guide (Chargebee)](https://www.chargebee.com/) — Practical SaaS revenue recognition

---

### U3. Multi-Board Member Experience Design

**Priority:** P1
**Why:** Board members typically sit on 3-7 boards. BoardBrief's portal must provide a unified experience across multiple companies without confusion. This is a unique UX challenge not found in most SaaS products.

**Key concepts:** Multi-tenant context switching, data isolation between companies, unified notification center, cross-board action item tracking.

**Learning resources:**
1. [Slack's Workspace Switching UX](https://slack.com/) — Reference for multi-context UX
2. [Linear's Team Switching](https://linear.app/) — Clean context switching patterns

---

## Skills Priority Matrix

| Skill | Category | Priority | Complexity | Timeline |
|---|---|---|---|---|
| Next.js 14 (App Router) | Technical | P0 | High | Pre-build |
| Supabase (PostgreSQL, RLS, Auth) | Technical | P0 | High | Pre-build |
| Stripe + QuickBooks API | Technical | P0 | High | Month 1-2 |
| GPT-4o (Narrative Generation) | Technical | P0 | Medium | Month 2-3 |
| PDF Generation | Technical | P0 | Medium | Month 3-4 |
| Corporate Governance Fundamentals | Domain | P0 | Medium | Pre-build |
| Startup Board Dynamics by Stage | Domain | P0 | Medium | Pre-build |
| Financial Reporting for Boards | Domain | P0 | Medium | Pre-build |
| Board Deck Data Visualization | Design | P0 | High | Month 1-2 |
| Secure Portal UX | Design | P0 | Medium | Month 2-3 |
| Founder-Friendly Enterprise Design | Design | P0 | Medium | Pre-build |
| Founder Persona Understanding | Business | P0 | Low | Pre-build |
| Financial Data Reconciliation | Unique | P0 | High | Month 2-3 |
| Real-Time Collaboration | Technical | P1 | High | Month 4-5 |
| Whisper API (Transcription) | Technical | P1 | Medium | Month 3-4 |
| CRM API (HubSpot/Salesforce) | Technical | P1 | Medium | Month 4-5 |
| HRIS API (Gusto/Rippling) | Technical | P1 | Medium | Month 4-5 |
| Delaware Corporate Law | Domain | P1 | High | Month 3-6 |
| Investor Relations | Domain | P1 | Medium | Month 5-6 |
| Meeting Management Interface | Design | P1 | Medium | Month 3-4 |
| Parliamentary Procedure | Unique | P1 | Low | Month 3-4 |
| Multi-Board UX | Unique | P1 | Medium | Month 4-5 |
| VC Firm Partnerships | Business | P1 | Medium | Month 4-6 |
| Law Firm Partnerships | Business | P1 | Medium | Month 5-7 |
| DocuSign API | Technical | P2 | Low | Month 7-9 |
| Accelerator Partnerships | Business | P2 | Low | Month 7-12 |

---

## Team Skill Distribution

For a founding team of 2-3 people, the ideal skill distribution:

| Role | Primary Skills | Secondary Skills |
|---|---|---|
| **Technical Co-founder** | T1, T2, T3, T4, T5, T7 | T6, T8, T9, U2 |
| **Product/Design Lead** | DS1, DS2, DS3, DS4 | B1, U3, D3 |
| **Business/Domain Lead** | D1, D2, D4, D5, B2, B3 | B4, D3, U1 |

For a solo founder, prioritize in this order:
1. T1 + T2 (Next.js + Supabase — the foundation)
2. T3 + T7 (Stripe/QuickBooks + GPT-4o — the core value proposition)
3. D1 + D2 + D3 (governance + stage dynamics + financial reporting — domain credibility)
4. DS1 + DS4 (data visualization + dual-audience design — product quality)
5. B1 (founder persona — go-to-market readiness)
