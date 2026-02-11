# NeighborDAO -- Required Skills & Learning Resources

## Overview

Building NeighborDAO requires a blend of technical expertise (real-time systems, geospatial, AI), deep domain knowledge (community governance, group economics), design sensitivity (accessibility for ages 18-80+), and hyperlocal go-to-market skills. This document maps every skill needed, its priority, and how to acquire it.

---

## Technical Skills

### 1. Next.js 14 (App Router, React Server Components)

**Priority:** Critical
**Why:** The entire frontend is built on Next.js 14. App Router with React Server Components enables SSR for SEO-critical neighborhood pages, streaming for fast perceived performance, and server actions for form handling.

**Key Competencies:**
- App Router file-based routing with layouts, loading states, and error boundaries
- React Server Components vs Client Components (knowing when to use each)
- Server Actions for form submissions (post creation, voting, booking)
- Dynamic metadata generation for SEO (per-neighborhood pages)
- Middleware for auth checks and geolocation-based redirects
- Streaming with Suspense for progressive page loads
- Image optimization with next/image for community photos
- Incremental Static Regeneration for public neighborhood pages

**Learning Resources:**
- Next.js Official Documentation (nextjs.org/docs) -- the definitive source
- Vercel's Next.js App Router Course (nextjs.org/learn)
- "Understanding React Server Components" by Dan Abramov
- Lee Robinson's YouTube channel for practical Next.js patterns

---

### 2. Supabase (PostgreSQL, Auth, Realtime, Storage)

**Priority:** Critical
**Why:** Supabase is the entire backend. PostgreSQL with PostGIS handles data + geospatial. Auth handles user management. Realtime powers live feed updates and chat. Storage handles media uploads. Row Level Security provides per-neighborhood data isolation.

**Key Competencies:**
- PostgreSQL schema design for multi-tenant community data
- Row Level Security policies for neighborhood-scoped data access
- Supabase Auth (email, OAuth, magic links) with custom claims
- Supabase Realtime subscriptions (postgres_changes, broadcast, presence)
- Supabase Storage with bucket policies for media uploads
- Edge Functions for server-side logic
- Database migrations and version control
- Connection pooling and performance optimization

**Learning Resources:**
- Supabase Official Documentation (supabase.com/docs)
- Supabase YouTube channel (practical tutorials)
- "Supabase in Production" blog series
- PostgreSQL documentation for advanced query patterns

---

### 3. PostGIS (Geospatial Queries)

**Priority:** High
**Why:** Neighborhood boundaries, member locations, resource proximity, and event mapping all require geospatial queries. PostGIS extends PostgreSQL with geographic object support.

**Key Competencies:**
- Geometry types: Point (member location), Polygon (neighborhood boundary), LineString
- Spatial queries: ST_Contains (is address in neighborhood?), ST_DWithin (resources within 0.5 miles), ST_Intersects
- Spatial indexing with GiST for query performance
- Coordinate reference systems (SRID 4326 for GPS coordinates)
- GeoJSON input/output for Mapbox integration
- Boundary editing and validation (no overlapping neighborhoods)

**Example Queries:**
```sql
-- Find which neighborhood contains a given address
SELECT id, name FROM neighborhoods
WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(-73.935, 40.730), 4326));

-- Find all resources within 0.5 miles of a user
SELECT r.* FROM resources r
WHERE ST_DWithin(
  r.location::geography,
  ST_SetSRID(ST_MakePoint(-73.935, 40.730), 4326)::geography,
  804.672  -- 0.5 miles in meters
);

-- Calculate neighborhood area in acres
SELECT name, ST_Area(boundary::geography) / 4046.86 AS acres
FROM neighborhoods;
```

**Learning Resources:**
- PostGIS Official Documentation (postgis.net/documentation)
- "Introduction to PostGIS" workshop (postgis.net/workshops)
- Crunchy Data PostGIS tutorials
- "PostGIS in Action" (book)

---

### 4. Mapbox GL JS

**Priority:** High
**Why:** The neighborhood map view requires interactive, performant mapping with custom markers, boundary drawing, and geocoding. Mapbox provides all of this with a generous free tier.

**Key Competencies:**
- Map initialization with custom styles matching the NeighborDAO theme
- Custom markers for members, resources, events, and alerts
- GeoJSON layers for neighborhood boundaries
- Mapbox Draw plugin for admin boundary editing
- Geocoding API for address search and verification
- Clustering for dense marker areas
- Popup/tooltip design for map interactions
- Mobile touch gestures (pinch zoom, pan)
- Performance optimization (viewport-based data loading)

**Learning Resources:**
- Mapbox GL JS Documentation (docs.mapbox.com)
- Mapbox GL JS Examples gallery
- "Building Interactive Maps with Mapbox" tutorials
- react-map-gl library documentation (Uber's React wrapper)

---

### 5. Real-Time Chat Architecture

**Priority:** High
**Why:** Chat and live feed updates are core to the community experience. Supabase Realtime provides the WebSocket infrastructure, but designing performant real-time UX requires specific knowledge.

**Key Competencies:**
- WebSocket connection management (reconnection, heartbeat, backoff)
- Optimistic UI updates (show message immediately, confirm on server)
- Message ordering and conflict resolution
- Presence tracking (who is online in the neighborhood)
- Typing indicators
- Message pagination (load older messages on scroll)
- Offline message queueing
- Notification delivery (in-app, push, email fallback)
- Channel management (group chats, DMs, neighborhood channels)

**Learning Resources:**
- Supabase Realtime documentation
- "Designing Data-Intensive Applications" by Martin Kleppmann (Chapter 11)
- Phoenix LiveView patterns (conceptual reference for real-time UX)
- Discord engineering blog posts on chat scalability

---

### 6. Payment Splitting (Stripe Connect)

**Priority:** High
**Why:** Group purchasing requires collecting payments from multiple participants and (optionally) paying vendors. Stripe Connect handles multi-party payments with regulatory compliance.

**Key Competencies:**
- Stripe Connect account types (Standard vs Express vs Custom)
- Payment Intents for collecting group order payments
- Transfer and payout APIs for distributing funds
- Webhook handling for payment status updates
- Refund workflows (partial refunds when participants drop out)
- Stripe Checkout for simple payment collection
- PCI compliance (Stripe Elements for card input)
- Subscription billing for Pro and HOA plans
- Dispute handling and chargeback management

**Learning Resources:**
- Stripe Connect documentation (stripe.com/docs/connect)
- Stripe's "Connect Onboarding" guide
- "Building a Marketplace with Stripe Connect" tutorial
- Stripe YouTube channel

---

### 7. Calendar & Scheduling Systems

**Priority:** Medium
**Why:** Resource booking and event management require calendar UIs, availability calculation, timezone handling, and conflict prevention.

**Key Competencies:**
- Calendar component libraries (react-big-calendar or custom)
- Date/time handling with date-fns or dayjs (timezone-aware)
- Availability slot calculation (merging owner rules + existing bookings)
- Recurring event patterns (iCalendar RRULE spec)
- Google Calendar API integration for event sync
- Database-level booking conflict prevention (exclusion constraints)
- Drag-and-drop calendar interactions
- Mobile-friendly date/time pickers

**Learning Resources:**
- Google Calendar API documentation
- react-big-calendar documentation
- iCalendar (RFC 5545) specification
- date-fns documentation (date-fns.org)

---

### 8. TypeScript

**Priority:** Critical
**Why:** Type safety across the entire stack prevents bugs, enables better IDE support, and makes the codebase maintainable as features grow.

**Key Competencies:**
- Strict mode TypeScript configuration
- Generic types for reusable components
- Supabase generated types (database schema to TypeScript)
- Zod for runtime validation matching TypeScript types
- Discriminated unions for state management (loading | error | success)
- API route type safety with Next.js
- Type-safe environment variables

**Learning Resources:**
- TypeScript Handbook (typescriptlang.org/docs)
- Matt Pocock's "Total TypeScript" course
- Type Challenges (github.com/type-challenges)

---

### 9. Testing (Vitest + Playwright)

**Priority:** Medium
**Why:** Community platform reliability is critical. Incorrect vote counts, wrong cost splits, or booking conflicts erode trust. Testing prevents these issues.

**Key Competencies:**
- Vitest for unit and integration tests (component rendering, cost calculation, voting logic)
- Playwright for end-to-end tests (post creation flow, booking flow, voting flow)
- Testing Supabase with local development (supabase start)
- Mocking external APIs (OpenAI, Stripe, Mapbox)
- Visual regression testing for UI components
- Accessibility testing with axe-playwright
- CI integration with GitHub Actions

**Learning Resources:**
- Vitest documentation (vitest.dev)
- Playwright documentation (playwright.dev)
- Testing Library documentation (testing-library.com)
- Kent C. Dodds' testing philosophy articles

---

## Domain Knowledge

### 10. Community Organizing & Governance

**Priority:** Critical
**Why:** NeighborDAO is not just software -- it is governance infrastructure. Understanding how communities make decisions, resolve conflicts, and build trust is essential to product design.

**Key Competencies:**
- Robert's Rules of Order (meeting procedures, voting methods)
- Consensus-building techniques (modified Delphi, dot voting, ranked choice)
- HOA governance structures (boards, committees, bylaws, CC&Rs)
- Local government interaction (permits, ordinances, zoning)
- Community land trust models
- Cooperative governance principles (one member, one vote)
- Quorum requirements and their implications
- Parliamentary procedure for digital settings

**Learning Resources:**
- "Robert's Rules of Order Newly Revised" (essential reference)
- Community Associations Institute (caionline.org) for HOA best practices
- "Building Powerful Community Organizations" by Michael Jacoby Brown
- National Civic League resources on community governance

---

### 11. Group Purchasing Dynamics

**Priority:** High
**Why:** Group purchasing is the killer feature. Understanding bulk pricing, minimum order quantities, vendor negotiation, and cost splitting mechanics is essential.

**Key Competencies:**
- Bulk pricing structures (volume discounts, price breaks, wholesale vs retail)
- Minimum order quantities and how to aggregate demand
- Cost splitting algorithms (equal split, proportional, weighted)
- Vendor negotiation for neighborhood-level contracts
- Delivery logistics for group orders (single delivery point vs individual)
- Service contract structures (lawn care, cleaning, snow removal)
- Cooperative purchasing legal frameworks
- Group buying platform mechanics (how Groupon, Costco, GPOs work)

**Learning Resources:**
- Group Purchasing Organization (GPO) industry reports
- Cooperative Extension Service publications on group buying
- "The Art of Negotiation" for vendor contract negotiation
- Costco business model analyses

---

### 12. Conflict Resolution & Mediation

**Priority:** High
**Why:** Neighbor disputes are inevitable. The AI mediator must be grounded in real mediation principles. The product team needs to understand dispute dynamics to design effective workflows.

**Key Competencies:**
- Interest-based negotiation (Fisher & Ury's "Getting to Yes")
- Active listening techniques for AI prompt design
- De-escalation strategies for heated community discussions
- Common neighbor disputes (noise, property lines, pets, parking, aesthetics)
- Mediation process: opening statements, issue identification, option generation, agreement
- When to escalate from AI to human mediation
- Legal boundaries (what AI mediation cannot handle: threats, harassment, discrimination)
- Documentation of agreements for future reference

**Learning Resources:**
- "Getting to Yes" by Roger Fisher and William Ury
- Association for Conflict Resolution (acrnet.org)
- Community Mediation Center training materials
- "Difficult Conversations" by Stone, Patton, and Heen

---

### 13. Trust & Safety / Community Moderation

**Priority:** High
**Why:** Community platforms live or die by moderation quality. Bad actors, misinformation, harassment, and spam can destroy community trust overnight.

**Key Competencies:**
- Content moderation policies (what is allowed, warning vs removal vs ban)
- Reporting and review workflows
- Anti-harassment tools (blocking, muting, restricting)
- Identity verification without being exclusionary
- Handling sensitive content (safety reports, accusations, personal information)
- Moderator burnout prevention
- Transparency reports and appeal processes
- Legal obligations (DMCA, harassment laws, mandated reporting)
- AI-assisted moderation (flagging, sentiment analysis, toxicity detection)

**Learning Resources:**
- Trust & Safety Professional Association (tspa.org)
- "Custodians of the Internet" by Tarleton Gillespie
- Reddit and Discord moderation best practices
- OpenAI Moderation API documentation

---

## Design Skills

### 14. Community Platform UX Design

**Priority:** Critical
**Why:** Community platforms have unique UX challenges: information overload, diverse user needs, trust-building, and engagement without addiction.

**Key Competencies:**
- Information architecture for multi-feature community platforms
- Feed design (chronological vs algorithmic, categorization, summarization)
- Notification design (urgency levels, batching, quiet hours)
- Onboarding flows for community platforms (address verification, profile setup, neighborhood tour)
- Engagement patterns that build community without being addictive
- Empty state design (new neighborhoods with few members)
- Moderation UX (reporting flows, appeal processes, transparency)
- Social proof and trust indicators (verified member badges, activity history)

**Learning Resources:**
- "Building Successful Online Communities" by Kraut & Resnick (MIT Press)
- Nextdoor, Discord, and Slack UX teardowns
- Nielsen Norman Group articles on community platform design
- "Designing for Community" by Derek Powazek

---

### 15. Map-Based Interface Design

**Priority:** Medium
**Why:** The neighborhood map is a key differentiator. Map UX requires specific patterns for markers, popups, layers, and mobile interaction.

**Key Competencies:**
- Map marker hierarchy and visual encoding
- Information density management (clustering, zoom-dependent visibility)
- Popup and tooltip design for map interactions
- Mobile map gestures and accessibility
- Offline map behavior
- Color coding that works for color-blind users (shapes + colors)
- Legend design and layer toggle UX
- Search-on-map patterns

**Learning Resources:**
- Mapbox design guidelines
- Google Maps Platform UX best practices
- "Designing Better Maps" by Cynthia Brewer
- Uber's map design case studies

---

### 16. Accessible Design for Diverse Age Groups (18-80+)

**Priority:** Critical
**Why:** Neighborhoods include everyone from tech-native teenagers to 80-year-old retirees. The platform must be usable by all without feeling dumbed down for any group.

**Key Competencies:**
- WCAG 2.1 AA compliance (contrast, focus management, alt text, ARIA)
- Large touch targets (minimum 44x44px) for older users and motor impairments
- Adjustable font sizing without layout breakage
- Clear, simple language (no jargon, no abbreviations without explanation)
- Error recovery that does not require technical knowledge
- Consistent navigation patterns that build muscle memory
- Progressive disclosure (simple surface, detail available on demand)
- Reduced motion options for users with vestibular disorders
- Screen reader testing with VoiceOver (macOS/iOS) and NVDA (Windows)
- High contrast mode for low vision users
- Color-blind friendly palette with non-color indicators

**Learning Resources:**
- WCAG 2.1 Guidelines (w3.org/WAI/WCAG21)
- "Inclusive Design Patterns" by Heydon Pickering
- A11y Project (a11yproject.com)
- "Don't Make Me Think" by Steve Krug
- NNGroup articles on designing for older adults

---

### 17. Trust-Building Design Patterns

**Priority:** High
**Why:** Community platforms require trust. Users share personal information (address, phone), financial data (group orders), and sensitive content (disputes). Design must communicate safety and transparency.

**Key Competencies:**
- Privacy controls with clear, visible settings
- Transparency in data usage (what is shared with whom)
- Verified member indicators (address verified, identity confirmed)
- Financial transparency (every transaction visible, receipts attached)
- Voting integrity indicators (anonymous votes, tamper-proof results)
- Moderation transparency (why content was removed, appeal path)
- Gradual trust-building (limited access for new members, expanding with tenure)
- Security indicators (encryption badges, data protection notices)

**Learning Resources:**
- "Trust by Design" principles from the UK Design Council
- Airbnb's trust and safety design case studies
- Banking app UX patterns for financial transparency
- GDPR-compliant design patterns

---

## Business & Growth Skills

### 18. Hyperlocal Go-To-Market Strategy

**Priority:** Critical
**Why:** NeighborDAO grows neighborhood by neighborhood. Traditional SaaS marketing does not work. You need boots-on-the-ground, word-of-mouth, and network-density strategies.

**Key Competencies:**
- Neighborhood seeding (how to get the first 10 households in a neighborhood)
- Network density thresholds (what % adoption makes the product valuable)
- Door-to-door outreach techniques
- Local event sponsorship and presence
- Neighborhood ambassador programs (incentivized residents who recruit neighbors)
- Referral mechanics that work at the neighborhood level (not individual)
- Timing strategies (spring is better for outdoor community activities)
- Geographic expansion patterns (seed one neighborhood, spread to adjacent)
- Measuring neighborhood health (DAU/MAU, feature adoption, engagement)

**Learning Resources:**
- Nextdoor's early growth strategy case studies
- "Crossing the Chasm" by Geoffrey Moore (technology adoption lifecycle)
- DoorDash and Uber's hyperlocal launch playbooks
- Community organizing handbooks (grassroots growth tactics)

---

### 19. HOA Board Partnerships

**Priority:** High (Post-MVP)
**Why:** HOA communities are the highest-value segment ($199/mo). Winning HOA boards requires understanding their pain points, governance structure, and purchasing process.

**Key Competencies:**
- HOA board structure (president, treasurer, secretary, committees)
- HOA pain points (communication, dues collection, violation management, vendor management)
- HOA purchasing process (board vote required, budget approval)
- Compliance requirements (state-specific HOA laws, record keeping)
- Transition from existing HOA software (data migration)
- Demo and pitch strategies for board meetings
- ROI calculation for HOA boards (time savings, cost reduction)

**Learning Resources:**
- Community Associations Institute (CAI) publications
- State-specific HOA governance laws
- HOA management company case studies
- "The HOA Handbook" for governance best practices

---

### 20. Local Government Partnerships

**Priority:** Medium (Year 2+)
**Why:** City governments are interested in civic engagement platforms. Partnerships can provide distribution (city endorsement), data (public safety integration), and revenue (government contracts).

**Key Competencies:**
- Municipal government structure (city council, departments, committees)
- Civic tech landscape (existing government platforms and their limitations)
- Government procurement processes (RFP/RFQ, compliance requirements)
- Data privacy in government contexts (FOIA implications)
- Public safety integration (connecting with police/fire non-emergency reporting)
- Grant funding for civic technology
- Pilot program design for government partnerships

**Learning Resources:**
- Code for America resources and case studies
- Government Technology magazine (govtech.com)
- Municipal procurement guides
- Smart Cities Council publications

---

### 21. Local Business Advertising

**Priority:** Medium (Year 2+)
**Why:** Local business ads are a significant revenue stream ($50-200/mo per business). Understanding local business marketing needs and ad platform mechanics is essential.

**Key Competencies:**
- Local business marketing pain points (reaching nearby customers affordably)
- Hyperlocal ad targeting (radius-based, neighborhood-specific)
- Ad formats for community platforms (promoted posts, sponsored events, deals)
- Ad pricing models (CPM, CPC, flat monthly fee)
- Self-serve ad platform UX
- Ad moderation (ensuring ads are relevant and non-intrusive)
- ROI reporting for local businesses
- Sales process for local business ad accounts

**Learning Resources:**
- Nextdoor's local business advertising model
- Yelp and Google Local advertising case studies
- "Local Online Advertising For Dummies" for fundamentals
- Facebook Local Awareness Ads documentation

---

## Unique / Niche Skills

### 22. AI Prompt Engineering for Community Contexts

**Priority:** High
**Why:** The AI features (summarization, mediation, event planning, purchase optimization) require carefully crafted prompts that understand community dynamics, maintain neutrality, and produce actionable outputs.

**Key Competencies:**
- System prompt design for neutral, community-appropriate AI behavior
- Few-shot examples for consistent output formatting
- Chain-of-thought prompting for complex mediation scenarios
- Temperature and parameter tuning (low temp for summaries, moderate for mediation)
- Handling sensitive content in prompts (personal information, accusations)
- Output validation and safety checking
- Cost optimization (choosing GPT-4o-mini vs GPT-4o based on task complexity)
- Prompt versioning and A/B testing
- Bias detection and mitigation in AI responses

**Learning Resources:**
- OpenAI Prompt Engineering Guide (platform.openai.com/docs/guides)
- Anthropic's prompt engineering documentation
- "Prompt Engineering for Developers" (DeepLearning.AI course)
- Community-specific AI ethics papers

---

### 23. Cooperative Economics

**Priority:** Medium
**Why:** NeighborDAO's group purchasing and shared services features are rooted in cooperative economics. Understanding cooperative principles ensures features are designed for genuine collective benefit.

**Key Competencies:**
- Cooperative principles (International Cooperative Alliance)
- Group purchasing organization (GPO) structures
- Shared resource management (Elinor Ostrom's commons governance)
- Babysitting cooperative economics (Capitol Hill Babysitting Co-op model)
- Time banking and mutual aid networks
- Community-supported agriculture (CSA) models
- Energy cooperative structures
- Legal frameworks for informal cooperatives

**Learning Resources:**
- "Governing the Commons" by Elinor Ostrom (Nobel Prize-winning work)
- International Cooperative Alliance principles (ica.coop)
- "The Cooperative Solution" by E.G. Nadeau
- P2P Foundation wiki on cooperative economics

---

## Skill Priority Matrix

| Skill | Priority | Hire or Learn | Phase Needed |
|-------|----------|--------------|-------------|
| Next.js 14 | Critical | Hire | MVP |
| Supabase | Critical | Hire | MVP |
| PostGIS | High | Learn (1-2 weeks) | MVP |
| Mapbox GL JS | High | Learn (1 week) | MVP |
| Real-time Chat | High | Hire | MVP |
| Stripe Connect | High | Learn (1 week) | MVP |
| TypeScript | Critical | Hire | MVP |
| Calendar/Scheduling | Medium | Learn (1 week) | MVP |
| Testing | Medium | Hire | MVP |
| Community Governance | Critical | Learn (ongoing) | MVP |
| Group Purchasing | High | Learn (2 weeks) | MVP |
| Conflict Resolution | High | Learn (ongoing) | Post-MVP |
| Trust & Safety | High | Hire/Learn | MVP |
| Community UX | Critical | Hire | MVP |
| Map Design | Medium | Learn (1 week) | MVP |
| Accessible Design | Critical | Hire | MVP |
| Trust Design | High | Learn (ongoing) | MVP |
| Hyperlocal GTM | Critical | Hire | MVP |
| HOA Partnerships | High | Learn (ongoing) | Post-MVP |
| Local Gov | Medium | Learn (ongoing) | Year 2 |
| Local Ads | Medium | Learn (2 weeks) | Year 2 |
| AI Prompt Engineering | High | Hire | MVP |
| Cooperative Economics | Medium | Learn (ongoing) | Post-MVP |

---

## Team Composition Recommendation

### MVP Team (4 people)

| Role | Primary Skills | Secondary Skills |
|------|---------------|-----------------|
| **Full-Stack Engineer** | Next.js, Supabase, TypeScript, PostGIS | Stripe, Testing, Calendar |
| **AI/ML Engineer** | OpenAI API, prompt engineering, Python | Data pipelines, moderation |
| **Product Designer** | Community UX, accessibility, map design | Trust patterns, user research |
| **Community Lead** | Hyperlocal GTM, community organizing | Domain knowledge, content |

### Post-MVP Additions

| Role | When | Primary Skills |
|------|------|---------------|
| **Backend Engineer** | Month 7 | Supabase, PostGIS, real-time systems, scaling |
| **Trust & Safety Lead** | Month 8 | Content moderation, policy writing, legal |
| **Business Development** | Month 9 | HOA partnerships, local gov, business ads |
| **Mobile Engineer** | Month 10 | React Native or PWA optimization |
