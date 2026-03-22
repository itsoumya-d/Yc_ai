# ProposalPilot -- Skills & Expertise Required

## Overview

Building ProposalPilot requires a blend of deep technical skills (real-time collaboration, document editing, AI integration), domain expertise (agency sales processes, proposal writing, pricing strategies), and product design sensibility (professional document UX, analytics visualization). This document maps the required skills, proficiency levels, learning resources, and unique competencies that give the team a competitive edge.

---

## Technical Skills

### T1: Next.js 14 & React

**Proficiency Required:** Expert

**Core Competencies:**
- **App Router architecture**: Server Components vs Client Components decision framework; understanding when to use `"use client"` for interactive elements (editor, pricing builder) vs keeping data-fetching server-side (dashboard, analytics)
- **Server Actions**: Form mutations for proposal CRUD, status updates, team invitations -- eliminating API route boilerplate
- **Streaming & Suspense**: Progressive loading for analytics dashboards with heavy data; streaming AI generation responses to the editor
- **Route Groups**: Clean separation of authenticated app (`/(app)`), public proposal viewer (`/(public)`), and marketing site (`/(marketing)`)
- **Middleware**: Edge-level auth checks, proposal view tracking, organization routing, rate limiting
- **ISR / Static Generation**: Marketing pages and template gallery with Incremental Static Regeneration
- **Parallel & Intercepting Routes**: Modal-based proposal preview without full navigation, parallel data loading for dashboard
- **Metadata API**: Dynamic Open Graph images for shared proposal links (client sees branded preview in email/Slack)

**Why Expert Level:**
The proposal editor is a complex client-side application embedded within a server-rendered shell. Understanding the SSR/CSR boundary is critical for performance -- the editor must be fully client-side (TipTap + Y.js), while proposal viewing must be SSR for speed and SEO of shared links.

---

### T2: TipTap / ProseMirror Editor Development

**Proficiency Required:** Advanced

**Core Competencies:**
- **ProseMirror fundamentals**: Schema definition, node/mark types, document model, transactions, and state management
- **Custom node development**: Building proposal-specific nodes (PricingTable, SignatureBlock, TeamMember, CaseStudy, MilestoneTimeline) with custom NodeView rendering
- **Extension authoring**: Creating TipTap extensions with proper input rules, keyboard shortcuts, paste handling, and serialization
- **Y.js integration**: CRDT-based collaboration with Yjs provider, awareness protocol for cursor presence, and document state synchronization
- **Serialization**: Bidirectional JSON<->HTML conversion for storage, PDF rendering, and email preview
- **Clipboard handling**: Smart paste behavior for tables, formatted text, images, and content from external sources (Google Docs, Word)
- **Performance**: Lazy loading of large proposals, virtualized rendering for very long documents, efficient re-rendering on collaborative updates

**Why Advanced Level:**
The proposal editor is the heart of ProposalPilot. Users spend the majority of their time here. The editor must feel as polished as Google Docs or Notion while supporting domain-specific elements (pricing tables, signature blocks, dynamic variables) that do not exist in general-purpose editors. Custom ProseMirror node development is notoriously tricky and requires deep understanding of the document model.

**Key Challenges:**
- Pricing table node: must support interactive editing (add/remove rows, calculations, currency formatting) while remaining a first-class document citizen (copy/paste, undo/redo, serialization)
- Signature block: must visually represent a signing area in the editor but map to a DocuSign/HelloSign field on export
- Dynamic variables: must resolve in preview/export but remain editable tokens in the editor

---

### T3: PDF Generation & Document Pipeline

**Proficiency Required:** Intermediate-Advanced

**Core Competencies:**
- **React-PDF** (`@react-pdf/renderer`): Mapping TipTap JSON nodes to PDF components; handling pagination, headers/footers, page breaks, and table of contents
- **Puppeteer/Playwright PDF**: Fallback rendering for complex layouts that React-PDF cannot handle; headless browser PDF generation from SSR'd HTML
- **Font embedding**: Custom fonts (Cal Sans, Inter, Source Serif Pro) embedded in PDF output
- **Image handling**: Base64 encoding for inline images, asset URL resolution, image optimization for PDF file size
- **Cover page design**: Programmatic generation of branded cover pages with logo, title, client name, and date
- **Table rendering**: Complex pricing tables with merged cells, calculations, and formatting translated to PDF accurately

---

### T4: E-Signature Integration

**Proficiency Required:** Intermediate

**Core Competencies:**
- **DocuSign eSignature API**: Envelope creation, template management, recipient routing, embedded signing ceremony, webhook handling for status updates
- **HelloSign API**: Signature request creation, embedded signing, template variables, event callbacks
- **OAuth flows**: Connecting user's DocuSign/HelloSign accounts with proper token management and refresh
- **Field mapping**: Translating editor signature block positions to e-signature provider field coordinates in the final document
- **Audit trail**: Storing signature metadata, timestamps, IP addresses for legal compliance
- **Status management**: Webhook-driven proposal status updates (pending -> signed -> completed)

---

### T5: Analytics & Tracking Implementation

**Proficiency Required:** Intermediate-Advanced

**Core Competencies:**
- **Intersection Observer API**: Tracking which proposal sections are visible in the viewport, measuring time-in-view for engagement analytics
- **Beacon API**: Reliable event delivery on page close/navigation (critical for accurate time-spent data)
- **Fingerprinting (privacy-safe)**: Identifying unique viewers without PII storage; anonymous session tracking
- **Event pipeline**: Batching analytics events, debouncing rapid scroll events, handling offline/slow connections
- **Pixel tracking**: 1x1 transparent pixel for email open detection
- **Data aggregation**: Efficient queries for engagement heatmaps, time-per-section charts, and viewer timelines from raw event data
- **Privacy compliance**: GDPR-compliant tracking without personal data storage; cookie-less tracking option

---

### T6: Real-Time Collaboration

**Proficiency Required:** Advanced

**Core Competencies:**
- **Y.js (CRDT)**: Conflict-free document synchronization, awareness protocol for user presence
- **Supabase Realtime**: WebSocket subscription management, channel-based communication, presence tracking
- **Cursor presence**: Showing collaborator cursors with names and colors in the editor
- **Optimistic updates**: Applying local changes immediately while syncing with server
- **Conflict resolution**: Handling concurrent edits to atomic fields (proposal title, status, pricing) outside the CRDT document
- **Offline support**: Queuing changes when disconnected, replaying on reconnection

---

### T7: Supabase & PostgreSQL

**Proficiency Required:** Advanced

**Core Competencies:**
- **Schema design**: Normalized relational schema for multi-tenant SaaS with proper indexes and constraints
- **Row Level Security (RLS)**: Writing policies for organization isolation, role-based access, and public proposal viewing
- **Edge Functions**: Deno-based serverless functions for webhooks, background jobs, and AI orchestration
- **Storage**: File upload/download with signed URLs, access policies, and CDN integration
- **Migrations**: Supabase CLI-based migration management for schema changes across environments
- **Performance**: Query optimization, connection pooling (PgBouncer), materialized views for analytics, and partitioning for event tables
- **Full-text search**: PostgreSQL `tsvector` for searching proposals, content blocks, and clients

---

### T8: OpenAI API & Prompt Engineering

**Proficiency Required:** Advanced

**Core Competencies:**
- **GPT-4o API**: Chat completions with system/user/assistant messages, streaming responses, function calling, structured output (JSON mode)
- **Prompt engineering**: System prompt design for agency voice capture, few-shot examples from past proposals, context window management for long briefs
- **Structured output**: Defining JSON schemas for proposal sections that map directly to TipTap document nodes
- **Streaming**: Server-Sent Events for real-time proposal generation feedback in the editor
- **Context management**: Selecting and ranking relevant past proposals, content blocks, and service catalog items to fit within token limits
- **Cost optimization**: Prompt caching, response caching for similar briefs, model selection (GPT-4o vs GPT-4o-mini based on task complexity)
- **Safety**: Content filtering, output validation, preventing prompt injection from client brief content
- **Fine-tuning** (future): Preparing training data from agency's best proposals, evaluating fine-tuned model quality

---

### T9: TypeScript & Testing

**Proficiency Required:** Expert

**Core Competencies:**
- **TypeScript 5.3+**: Strict mode, discriminated unions for proposal status, branded types for IDs, generic utilities for API responses
- **Zod validation**: Runtime type validation for API inputs, AI outputs, and form data
- **Vitest**: Unit testing for pricing calculations, AI prompt builders, permission checks, and analytics aggregation
- **Testing Library**: Component tests for editor elements, proposal cards, pricing tables, and analytics charts
- **Playwright**: E2E tests for complete proposal creation flow, editor interactions, e-signature flow, and client portal experience
- **MSW (Mock Service Worker)**: Mocking OpenAI, DocuSign, and CRM APIs in integration tests

---

## Domain Skills

### D1: Agency & Consultancy Sales Processes

**Proficiency Required:** Expert (domain co-founder)

**Knowledge Areas:**
- **Sales cycle stages**: Lead qualification, discovery calls, brief/RFP receipt, proposal creation, presentation, negotiation, close, onboarding
- **Proposal types**: Proactive proposals (unsolicited), reactive proposals (responding to briefs), RFP responses, retainer renewals, upsell proposals
- **Win/loss analysis**: Factors that influence proposal outcomes (price, relationship, timing, scope clarity, competitive positioning, presentation quality)
- **Follow-up strategies**: When and how to follow up on sent proposals, reading engagement signals, knowing when to pivot strategy
- **Agency structures**: How agencies of different sizes (solo, boutique, mid-size, large) handle proposals differently
- **Client expectations**: What clients look for in proposals at different budget levels and industries

**Why This Matters:**
ProposalPilot is not a generic document tool. Every design decision, AI prompt, and feature must reflect deep understanding of how agencies actually sell. A proposal is not just a document -- it is a sales tool, a trust signal, and a scope agreement all in one.

---

### D2: Proposal Writing Best Practices

**Proficiency Required:** Advanced

**Knowledge Areas:**
- **Proposal structure**: Executive summary, problem statement, proposed solution, methodology/approach, timeline/milestones, pricing, team, case studies, terms and conditions
- **Persuasion techniques**: Leading with client outcomes (not agency capabilities), social proof via case studies, risk mitigation through process transparency
- **Executive summary crafting**: Condensing the entire value proposition into 1-2 paragraphs that a busy executive will read
- **Scope definition**: Writing clear, unambiguous scope that protects against scope creep while demonstrating thoroughness
- **Pricing presentation**: Anchoring strategies, option tiers (good/better/best), value framing, investment language vs cost language
- **Visual design**: White space, hierarchy, consistent formatting, professional imagery, brand alignment
- **Common mistakes**: Proposals that talk about the agency instead of the client, missing deadlines, unclear pricing, no call to action

---

### D3: SOW Structures & Contract Fundamentals

**Proficiency Required:** Intermediate-Advanced

**Knowledge Areas:**
- **SOW components**: Project overview, scope of work (inclusions and exclusions), deliverables with acceptance criteria, milestones with dates, roles and responsibilities (RACI), communication plan, change management process, assumptions and dependencies
- **Acceptance criteria**: Defining measurable, objective criteria for each deliverable (e.g., "Homepage loads in under 2 seconds on 3G connection" vs "Homepage is fast")
- **Change orders**: Process for handling scope changes, impact assessment, re-estimation, and approval workflow
- **Risk management**: Identifying project risks, probability/impact assessment, mitigation strategies
- **Payment milestones**: Tying payments to deliverable acceptance, deposit structures, retainer terms
- **Legal fundamentals**: Limitation of liability, intellectual property ownership, confidentiality, termination clauses, warranty and indemnification

---

### D4: Pricing Strategies for Professional Services

**Proficiency Required:** Advanced

**Knowledge Areas:**
- **Fixed price**: Estimating total effort, building in contingency, managing margin risk, when to use (well-defined scope, predictable work)
- **Time & Materials (T&M)**: Hourly/daily rate structures, rate cards by seniority, estimated vs capped hours, when to use (exploratory, evolving scope)
- **Value-based pricing**: Pricing tied to client outcomes rather than effort, calculating ROI, when to use (measurable impact, strategic projects)
- **Retainer models**: Monthly fee structures, included hours, overage rates, scope boundaries, renewal terms
- **Milestone-based**: Payment tied to project phases, partial payment schedules, deposit requirements
- **Hybrid models**: Combining pricing approaches (e.g., fixed discovery + T&M implementation)
- **Pricing psychology**: Anchoring, decoy pricing, option framing, investment vs cost language, package bundling

---

### D5: RFP Processes

**Proficiency Required:** Intermediate

**Knowledge Areas:**
- **RFP anatomy**: Understanding the structure of Requests for Proposal (background, requirements, evaluation criteria, submission format, timeline)
- **Compliance requirements**: Meeting mandatory requirements, providing all requested information, following submission formats
- **Evaluation criteria**: Understanding how proposals are scored (technical approach, team, price, past performance, references)
- **Response strategies**: Win themes, discriminators, ghost competitors, compliance matrices
- **Go/no-go decisions**: Qualifying RFPs before investing effort (fit, competition, relationship, capacity)

---

## Design Skills

### DS1: Document Design & Professional Typography

**Proficiency Required:** Advanced

**Knowledge Areas:**
- **Document hierarchy**: Using type scale, weight, color, and spacing to create clear visual hierarchy in proposals
- **Professional layout**: Grid-based layouts, consistent margins, section spacing, page break management
- **Typography pairing**: Selecting complementary heading and body fonts that convey professionalism (Cal Sans + Inter + Source Serif Pro)
- **Color application**: Using brand colors consistently without overwhelming the content; accent colors for emphasis, not decoration
- **White space**: Generous margins and padding that make proposals feel premium and easy to scan
- **Table design**: Clean pricing tables with alternating rows, clear headers, aligned decimals, and summary rows
- **Cover page design**: Striking but professional first impressions with logo, imagery, and minimal text

---

### DS2: Data Visualization for Analytics

**Proficiency Required:** Intermediate-Advanced

**Knowledge Areas:**
- **Chart selection**: Choosing the right chart type for each analytics metric (bar for comparisons, line for trends, gauge for single metrics, heatmap for section engagement)
- **Color encoding**: Consistent color usage across charts (green for wins, red for losses, blue for neutral metrics)
- **Interactive charts**: Hover states, click-to-filter, drill-down, and responsive sizing
- **Dashboard layout**: Information hierarchy, metric grouping, progressive disclosure of detail
- **Engagement heatmap**: Visual representation of section-level engagement intensity
- **Funnel visualization**: Proposal pipeline conversion funnel with stage-over-stage drop-off rates
- **Sparklines and trends**: Small inline charts showing directional movement for key metrics

**Libraries:**
- Recharts (primary) -- React-native charting with good customization
- D3.js (selective) -- Custom visualizations (engagement heatmap, pipeline funnel)
- Chart.js (lightweight alternative)

---

### DS3: Collaborative Editing UX

**Proficiency Required:** Intermediate-Advanced

**Knowledge Areas:**
- **Multi-cursor UX**: Showing collaborator cursors with names, handling overlap, fading inactive cursors
- **Presence indicators**: Who is online, who is viewing which section, activity indicators
- **Comment UX**: Inline comment creation (select text -> comment), threaded replies, resolve/unresolve, comment indicators in document margin
- **Version history**: Timeline UI for version navigation, diff visualization (additions in green, deletions in red), restore to version
- **Approval workflow UX**: Clear status indicators (pending review, approved, changes requested), reviewer assignment, approval actions
- **Conflict resolution UI**: Rare but important -- when atomic field conflicts occur (two users change proposal title simultaneously), surface a resolution prompt

---

### DS4: Professional Template Design

**Proficiency Required:** Advanced

**Knowledge Areas:**
- **Template systems**: Designing reusable templates that balance structure with flexibility
- **Variable systems**: Visual design for template variables ({{client.name}}) that are clearly distinguished from static content
- **Preview fidelity**: Template previews that accurately represent the final output (WYSIWYG principle)
- **Customization boundaries**: Allowing brand customization (colors, fonts, logos) while maintaining professional design quality
- **Responsive documents**: Ensuring proposals look great on desktop (primary), tablet, and mobile
- **Print considerations**: Designing for both screen and print/PDF output (color modes, margins, bleeds)

---

## Business Skills

### B1: Agency Owner Persona Understanding

**Proficiency Required:** Expert

**Persona Profile:**
- **Demographics**: 30-50 years old, founded or co-founded the agency, 5-15 years in the industry
- **Daily challenges**: Cash flow management, hiring/retention, business development, client management, wearing multiple hats
- **Proposal pain points**: Senior staff time consumed by proposals, inconsistent quality across team members, no visibility into what works, pricing is guesswork
- **Technology adoption**: Uses 5-15 SaaS tools, comfortable with technology but has no patience for complexity, evaluates ROI ruthlessly, values integrations with existing tools
- **Buying behavior**: Wants to see ROI quickly, prefers monthly billing, will trial before committing, influenced by peer recommendations and agency communities
- **Success metrics**: Win rate, time-to-proposal, revenue per proposal, team utilization

---

### B2: B2B SaaS Sales & Go-to-Market

**Proficiency Required:** Advanced

**Knowledge Areas:**
- **Product-led growth (PLG)**: Free tier as acquisition funnel, in-app upgrade prompts, usage-based triggers for upsell
- **Sales-assisted PLG**: Self-serve for Pro tier, sales touch for Agency/Enterprise tiers
- **Content marketing**: SEO-driven content targeting agency owners ("how to write a proposal," "proposal templates," "SOW template," "agency pricing strategies")
- **LinkedIn strategy**: Targeting agency owners and founders with educational content, case studies, and product-led content
- **Partnership development**: CRM marketplace listings (HubSpot, Salesforce), agency community partnerships (Agency Vista, Clutch, AIGA), technology partnerships
- **Conference presence**: Agency-focused events (Agency Summit, INBOUND, MAICON, Owner Summit) for brand awareness and direct sales
- **Pricing and packaging**: Seat-based pricing, tier feature differentiation, enterprise custom pricing, annual discount incentives

---

### B3: Content Marketing for B2B SaaS

**Proficiency Required:** Intermediate-Advanced

**Content Pillars:**
- **SEO content**: "How to write a proposal" (90K monthly searches), "proposal template" (60K), "statement of work template" (40K), "agency pricing models" (8K)
- **Template downloads**: Free downloadable proposal templates (lead magnet, email capture)
- **Case studies**: "How [Agency Name] increased win rate by X% with ProposalPilot"
- **Industry reports**: "State of Agency Proposals" annual report with original data from platform usage
- **Webinars**: "Proposal Masterclass" series with agency leaders
- **Email nurture**: Educational sequences for free users demonstrating Pro/Agency tier value
- **Social proof**: Win rate improvements, time saved, testimonials from recognizable agencies

---

### B4: Partnership & Integration Strategy

**Proficiency Required:** Intermediate

**Key Partnerships:**
- **CRM marketplaces**: HubSpot App Marketplace (140K+ customers), Salesforce AppExchange, Pipedrive Marketplace -- listing ProposalPilot as a recommended proposal solution within CRM workflows
- **Agency communities**: Agency Vista, Clutch.co, DesignRush, AIGA -- community partnerships, sponsored content, member benefits
- **Complementary tools**: Toggl (time tracking), Harvest (invoicing), Asana/Monday (project management) -- integration partnerships and co-marketing
- **Freelance platforms**: Toptal, Upwork Pro -- partnership for freelancer-tier adoption
- **Accounting integrations**: QuickBooks, Xero -- invoice generation from won proposals

---

## Unique & Differentiating Skills

### U1: Win Rate Intelligence Engineering

**What Makes This Unique:**
No existing proposal tool provides genuine win-rate analytics that correlate proposal attributes with outcomes. This requires:
- **Statistical analysis**: Building meaningful correlations from relatively small datasets (an agency might have 50-200 proposals) while avoiding false signals
- **Feature engineering**: Defining which proposal attributes to track (pricing model, word count, number of case studies, time-to-send, section structure, price relative to market) and how to normalize them
- **Actionable insights**: Translating raw correlations into specific, actionable recommendations ("Include 2+ case studies" not "Case studies correlate with r=0.34")
- **Bayesian updating**: Improving prediction confidence as more data is collected, starting with industry benchmarks and refining with organization-specific data
- **Privacy-preserving analytics**: Aggregating cross-organization insights without exposing individual agency data

---

### U2: Agency Voice Learning

**What Makes This Unique:**
ProposalPilot must learn each agency's unique tone, terminology, and writing style so that AI-generated proposals are indistinguishable from human-written ones. This requires:
- **Style extraction**: Analyzing past proposals to identify vocabulary patterns, sentence structure, level of formality, industry jargon usage, and persuasion techniques
- **System prompt engineering**: Dynamically constructing system prompts that encode the agency's voice characteristics
- **Few-shot selection**: Choosing the most relevant past proposal excerpts to include as examples in the prompt context
- **Quality evaluation**: Automated and human evaluation of whether generated content matches the agency's voice (A/B testing generated vs human-written sections)
- **Iterative refinement**: Allowing users to rate and correct AI output, feeding corrections back into the voice profile

---

### U3: Proposal Engagement Signal Processing

**What Makes This Unique:**
Transforming raw analytics events (page views, scroll depth, time-per-section) into actionable sales intelligence requires:
- **Engagement scoring**: Weighted algorithm that considers view frequency, time depth, section focus patterns, return visits, sharing behavior, and PDF downloads
- **Intent signals**: Distinguishing "casual browsing" from "serious evaluation" based on engagement patterns
- **Alert triggers**: Real-time notifications when engagement patterns suggest high buying intent ("Client returned to pricing for the 3rd time")
- **Benchmarking**: Comparing a proposal's engagement against the agency's historical average to surface outliers
- **Predictive modeling**: Using engagement patterns from past proposals to predict win probability for active proposals

---

## Learning Resources

### Technical

| Skill | Resource | Type | Level |
| ----- | -------- | ---- | ----- |
| Next.js 14 App Router | Next.js official docs + Lee Robinson tutorials | Docs/Video | Intermediate |
| TipTap / ProseMirror | TipTap docs + ProseMirror Guide | Docs | Advanced |
| Y.js collaboration | Y.js docs + "CRDTs for Mortals" by James Long | Docs/Talk | Advanced |
| Supabase | Supabase docs + "Build in a Weekend" series | Docs/Video | Beginner-Intermediate |
| OpenAI API | OpenAI Cookbook + "Prompt Engineering Guide" | Docs/Guide | Intermediate |
| PDF generation | React-PDF docs + Puppeteer docs | Docs | Intermediate |
| TypeScript | "Effective TypeScript" by Dan Vanderkam | Book | Advanced |
| Testing | "Testing JavaScript" by Kent C. Dodds | Course | Intermediate |

### Domain

| Skill | Resource | Type | Level |
| ----- | -------- | ---- | ----- |
| Proposal writing | "The Proposal" by Rohit Bhargava | Book | Beginner |
| Agency operations | "Built to Sell" by John Warrillow | Book | Intermediate |
| Pricing strategies | "Pricing Creativity" by Blair Enns | Book | Advanced |
| Professional services sales | "The Win Without Pitching Manifesto" by Blair Enns | Book | Advanced |
| SOW creation | PMI Practice Standard for SOWs | Standard | Intermediate |
| B2B SaaS | "Obviously Awesome" by April Dunford (positioning) | Book | Intermediate |
| Agency growth | Agency podcasts (The Agency Accelerator, 2Bobs) | Podcast | Ongoing |

### Design

| Skill | Resource | Type | Level |
| ----- | -------- | ---- | ----- |
| Document design | "The Non-Designer's Design Book" by Robin Williams | Book | Beginner |
| Data visualization | "Storytelling with Data" by Cole Nussbaumer Knaflic | Book | Intermediate |
| Editor UX | Google Docs, Notion, Coda (study and deconstruct) | Product analysis | Ongoing |
| Tailwind CSS | Tailwind CSS docs + Tailwind UI component library | Docs/Library | Intermediate |
| Accessibility | W3C WAI-ARIA Authoring Practices | Standard | Intermediate |

---

## Team Skill Matrix (Ideal Founding Team)

| Skill Area | CTO / Tech Lead | Domain Lead | Design Lead |
| ---------- | --------------- | ----------- | ----------- |
| Next.js / React | Expert | -- | Intermediate |
| TipTap / ProseMirror | Expert | -- | -- |
| AI / Prompt Engineering | Advanced | Intermediate | -- |
| Supabase / PostgreSQL | Expert | -- | -- |
| Agency sales process | Intermediate | Expert | Intermediate |
| Proposal writing | Intermediate | Expert | Advanced |
| Pricing strategies | Intermediate | Expert | -- |
| Document design | Intermediate | Intermediate | Expert |
| Data visualization | Intermediate | -- | Expert |
| B2B SaaS GTM | Intermediate | Advanced | Intermediate |
| User research | Intermediate | Advanced | Expert |
| TypeScript / Testing | Expert | -- | Intermediate |

---

## Skill Development Priority

**Phase 1 (Pre-MVP):** TipTap/ProseMirror mastery, OpenAI prompt engineering, Supabase RLS patterns, proposal writing domain knowledge

**Phase 2 (MVP Build):** PDF generation pipeline, analytics tracking implementation, e-signature integration, real-time collaboration

**Phase 3 (Post-MVP):** Win rate intelligence engineering, CRM integration patterns, voice learning system, advanced analytics visualization

**Ongoing:** Agency industry knowledge (attend conferences, interview users, read industry publications), AI model updates and capabilities, competitive product analysis
