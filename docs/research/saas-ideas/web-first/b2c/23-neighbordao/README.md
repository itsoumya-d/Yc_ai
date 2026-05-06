# NeighborDAO

**Your neighborhood, organized.**

---

## Elevator Pitch

NeighborDAO replaces the chaotic Nextdoor/Facebook group experience with an AI-powered neighborhood coordination platform. It handles group purchasing (bulk orders from Costco, shared lawn care contracts), shared resource scheduling (tools, equipment, parking spaces), local event planning, neighborhood safety alerts, and community decision-making with transparent voting. The AI mediates disputes, summarizes discussions, and ensures every voice is heard -- not just the loudest.

**Category:** B2C Web-First
**YC Alignment:** AI for Government (community governance), Social Platforms, Vertical AI

---

## The Problem

Neighborhoods are broken. Despite living feet apart, neighbors struggle to coordinate on even basic shared needs:

1. **Fragmented Communication:** Conversations scatter across Nextdoor (complaint-heavy), Facebook Groups (algorithm-driven), WhatsApp chats (chaotic), and paper flyers (ignored). There is no single source of truth for neighborhood information.
2. **Wasted Purchasing Power:** 40 households each pay $60/month for individual lawn care when a group contract could cost $25/household. Bulk Costco runs go uncoordinated. Group solar installations never get organized despite 30% cost savings.
3. **Idle Resources:** The average American household owns $3,000+ in rarely-used tools and equipment. Neighbors buy duplicate leaf blowers, pressure washers, and ladders that sit idle 350 days per year.
4. **Dysfunctional Governance:** HOA boards operate with zero transparency. Decisions happen in closed meetings. Residents feel unheard. Disputes escalate to legal action over issues that mediation could solve in an hour.
5. **Missing Community Connection:** 67% of Americans want more community connection (Pew Research). The infrastructure simply does not exist in a way that works for modern life.

---

## The Solution

NeighborDAO is a web-first platform that transforms neighborhoods from passive residential clusters into coordinated, empowered communities:

- **AI-Powered Feed:** Smart discussion threads with automatic summarization, sentiment analysis, and topic categorization. No more scrolling through 200 comments to find the answer.
- **Group Purchasing Engine:** Create bulk orders, split costs transparently, track deliveries. AI optimizes order timing and vendor selection.
- **Shared Resource Scheduler:** Book neighborhood tools, equipment, and spaces with a calendar interface. Track condition, set deposits, automate returns.
- **Democratic Decision-Making:** Transparent voting on community issues with ranked choice, quorum tracking, and AI-generated impact summaries.
- **AI Dispute Mediator:** Neutral, evidence-based facilitation for neighbor conflicts. The AI presents both sides, suggests compromises, and documents agreements.
- **Neighborhood Treasury:** Transparent group finances with income/expense tracking, budget proposals, and automated dues collection.

---

## Market Opportunity

### Market Size

| Metric | Value | Basis |
|--------|-------|-------|
| **TAM** | $19.5B | 130M US households x $150/yr avg platform spend |
| **SAM** | $4.8B | 32M suburban households in organized neighborhoods/HOAs |
| **SOM (Year 3)** | $48M | 400K households at ~$120/yr blended ARPU |

### Market Context

- **130 million** US households, the majority in suburban/exurban settings with natural neighborhood structures
- **370,000+** HOA communities managing **$100B+** in collective assets with outdated or nonexistent software
- **80 million** Nextdoor users prove demand but the product is ad-driven and complaint-focused
- **67%** of Americans say they want more community connection (Pew Research, 2023)
- **$1.3 trillion** in annual US household spending on services that could be group-negotiated (lawn care, cleaning, childcare, home maintenance)

### Why Now

1. Remote/hybrid work means more people are home and invested in their neighborhoods
2. Cost-of-living pressures make group purchasing and resource sharing increasingly attractive
3. AI is now capable of mediating nuanced social dynamics (summarization, dispute resolution, meeting facilitation)
4. Post-pandemic desire for local community connection remains elevated
5. HOA management software is a decade behind modern SaaS standards

---

## Competitive Landscape

| Feature | NeighborDAO | Nextdoor | Facebook Groups | TownSq | Condo Control |
|---------|-------------|----------|-----------------|--------|---------------|
| Community Feed | AI-summarized, categorized | Ad-heavy, complaint-focused | Algorithm-driven | Basic feed | Announcements only |
| Group Purchasing | Full coordination + cost splitting | None | Informal | None | None |
| Resource Scheduling | Calendar + booking + deposits | None | None | None | Amenity booking only |
| Democratic Voting | Ranked choice, quorum, AI summaries | Polls only | Polls only | Basic voting | Board voting |
| AI Mediation | Neutral dispute facilitation | None | None | None | None |
| Treasury Management | Transparent ledger + budgets | None | None | None | Dues collection |
| Geolocation | PostGIS boundaries + map view | Address-based | None | Property-based | Property-based |
| Pricing | Free + $4.99/mo Pro | Free (ad-driven) | Free (data-driven) | $1-3/unit/mo | $0.50-2/unit/mo |
| Target User | All residents | All residents | All users | HOA residents | Condo residents |

### Competitive Moat

1. **AI-Mediated Governance:** No competitor offers AI dispute mediation, discussion summarization, or decision-support analysis. This transforms community dynamics from adversarial to collaborative.
2. **Group Economics Engine:** The group purchasing and resource sharing features create direct financial value ($200-500/yr per household in savings) that no competitor provides.
3. **Network Density Effects:** Unlike Nextdoor (which works with any number of users), NeighborDAO becomes exponentially more valuable as neighborhood adoption density increases. A neighborhood at 80%+ adoption unlocks group purchasing power, resource pools, and democratic legitimacy.
4. **Data Flywheel:** Each neighborhood interaction trains the AI to better mediate, summarize, and optimize for that specific community's dynamics.
5. **Switching Cost:** Once a neighborhood's governance, treasury, resources, and purchasing history live on NeighborDAO, migration is extremely costly for the entire community (not just one user).

---

## Business Model Summary

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Feed, events, directory, basic voting, neighborhood map |
| **Neighborhood Pro** | $4.99/mo per household | Group purchasing, resource scheduling, AI features, treasury |
| **HOA Plan** | $199/mo per community | Full HOA management, compliance, maintenance, official records |

Additional revenue: Local business advertising ($50-200/mo), service provider marketplace commissions (10-15%).

---

## Key Metrics (Target Year 3)

| Metric | Target |
|--------|--------|
| Active Neighborhoods | 8,000 |
| Active Households | 400,000 |
| Monthly Active Users | 600,000 |
| MRR | $1.2M |
| Monthly Churn | < 2% |
| NPS | 65+ |
| LTV:CAC | 30x |

---

## Quick Links

| Resource | File |
|----------|------|
| Technical Architecture | [tech-stack.md](./tech-stack.md) |
| Feature Roadmap | [features.md](./features.md) |
| Screen Designs | [screens.md](./screens.md) |
| Required Skills | [skills.md](./skills.md) |
| Design System | [theme.md](./theme.md) |
| API Integration Guide | [api-guide.md](./api-guide.md) |
| Revenue & Growth Model | [revenue-model.md](./revenue-model.md) |

---

## Team Requirements

- **Full-Stack Engineer** (Next.js + Supabase + PostGIS)
- **AI/ML Engineer** (OpenAI API, prompt engineering, mediation workflows)
- **Product Designer** (Community platform UX, accessibility for ages 18-80+)
- **Community Lead** (Seed neighborhoods, build ambassador programs, trust-building)

---

## Why This Wins

The insight behind NeighborDAO is simple: **neighborhoods are the original DAOs** -- decentralized groups of stakeholders making collective decisions about shared resources. They just lack the software. Nextdoor proved that neighbors want to connect digitally. NeighborDAO proves they can coordinate, save money, share resources, and govern themselves when given the right tools.

The wedge is financial: group purchasing saves real money from day one. The retention is social: once your neighborhood is on NeighborDAO, you stay because your community is there. The moat is governance: once decisions, budgets, and agreements live on the platform, switching costs are enormous.

**NeighborDAO: Your neighborhood, organized.**
