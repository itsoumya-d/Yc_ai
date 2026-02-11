# Claimback

**Your AI fights every bill so you don't have to.**

`B2C` | `Mobile-First` | `AI Bill Fighting Agent`

---

## Elevator Pitch

Claimback is an AI-powered mobile app that scans your bills with your phone camera, instantly identifies overcharges and billing errors, generates dispute letters, and makes AI phone calls to negotiate on your behalf. Americans overpay an estimated $3,000+ per year on medical bills, bank fees, insurance charges, and utility overcharges. Claimback's AI agent handles the entire dispute process end-to-end -- from detecting the error to calling the provider and negotiating a reduction -- so users never have to sit on hold or argue with a billing department again. For the 80% of medical bills that contain errors and the millions of Americans paying unnecessary bank fees, Claimback turns a frustrating, time-consuming process into a one-tap experience that puts money back in their pocket.

---

## YC Alignment

### RFS #3: Vertical AI Agents / AI-Native Agencies (Spring 2026)

Claimback maps directly to Y Combinator's Request for Startups #3, which calls for AI agents that can perform real-world tasks autonomously. Claimback is a textbook vertical AI agent: it operates in a specific domain (consumer billing disputes), uses multimodal AI (vision for bill scanning, language models for dispute generation, voice AI for phone negotiation), and executes end-to-end workflows that previously required human advocates charging $15-50 per case. This is exactly the kind of AI-native agency YC is looking for -- one that replaces an entire service category with an autonomous AI pipeline.

### Jared Friedman's Vertical AI Thesis

Jared Friedman has argued that the most valuable AI companies will be those that go deep into specific verticals rather than building horizontal tools. Claimback embodies this thesis by building deep domain expertise in medical billing codes (CPT/ICD-10), bank fee structures, insurance EOB formats, and provider-specific negotiation strategies. The vertical specificity -- knowing that CPT code 99213 is frequently upcoded to 99214, or that Chase will waive overdraft fees for customers who ask -- is the moat that no general-purpose AI tool can replicate.

### Garry Tan on Consumer AI and Fighting for the Little Guy

Garry Tan has emphasized the opportunity in consumer AI applications that solve real pain points for everyday people. Claimback fits this vision by acting as a consumer champion -- giving individuals the same negotiating power that large corporations have. The app democratizes access to billing expertise that was previously available only to those who could afford professional medical billing advocates or consumer attorneys.

### Comparable YC Success: Rocket Money ($1.3B Acquisition)

Rocket Money (formerly Truebill, YC W16) proved that consumers will enthusiastically pay for apps that save them money on bills and subscriptions. Acquired by Rocket Companies for $1.3 billion, Rocket Money demonstrated massive consumer demand for automated financial advocacy. Claimback goes significantly further: where Rocket Money primarily canceled subscriptions and negotiated a few bill categories, Claimback uses AI vision to scan and analyze any bill, detects specific line-item overcharges, and makes autonomous AI phone calls to resolve disputes -- a 10x improvement in capability and scope.

---

## Market Opportunity

### The Overcharge Crisis

- **80% of medical bills contain errors** (Medical Billing Advocates of America), making overcharges the norm rather than the exception
- **$400B+ in annual overcharges** across medical billing, bank fees, insurance, utilities, and telecom in the US alone
- **$210 billion annually** in medical billing errors and fraud (National Health Care Anti-Fraud Association)
- **$15.5 billion in bank overdraft fees** charged annually to US consumers (Consumer Financial Protection Bureau)
- **Americans overpay an average of $3,000+ per year** across all bill categories combined
- **Only 5% of billing errors are ever disputed** -- consumers don't know they're being overcharged, don't know how to dispute, or don't have the time

### Why Now

1. **OpenAI Vision API maturity** -- GPT-4o's multimodal capabilities make real-time bill scanning and analysis accurate enough for production use, with the ability to read itemized medical bills, bank statements, and insurance EOBs with high precision
2. **AI voice agents have arrived** -- Bland.ai, Retell.ai, and Vapi now offer production-ready AI phone agents that can navigate IVR menus, wait on hold, and negotiate with human representatives at $0.09/minute vs. $15-50 for human advocates
3. **Post-pandemic consumer awareness** -- Medical billing transparency became a mainstream issue during COVID, and the No Surprises Act (2022) created new legal leverage for billing disputes
4. **Plaid and open banking** -- Real-time bank account monitoring via Plaid enables automatic detection of excessive fees, duplicate charges, and unauthorized transactions
5. **Rocket Money's $1.3B exit validated the market** -- Consumers have proven they will pay monthly subscriptions for apps that fight bills on their behalf

---

## Unicorn Trajectory

| Metric | Value |
|--------|-------|
| **TAM** (Total Addressable Market) | $400B+ annual overcharges across all US bill categories |
| **SAM** (Serviceable Available Market) | $80B medical billing errors + bank fees + insurance overcharges |
| **SOM** (Serviceable Obtainable Market) | $4B AI-assisted bill dispute market (5-year horizon) |

### Comparable Companies

| Company | Valuation | Relevance to Claimback |
|---------|-----------|----------------------|
| **Rocket Money (Truebill)** | $1.3B (acquired) | Bill negotiation + subscription cancellation; proved consumers pay for financial advocacy; Claimback does 10x more with AI vision + phone agents |
| **Credit Karma** | $8.3B (acquired by Intuit) | Consumer financial empowerment via free tools; built massive user base with savings-focused value prop; adjacent model |
| **Experian Boost** | Part of $37B Experian | Consumer-facing financial data product; validates demand for tools that improve personal finances automatically |
| **Collectly** | $30M raised | Medical billing on the provider side; validates the medical billing market but serves providers, not consumers |
| **Resolve Medical Bills** | $3M raised | Human-powered medical bill negotiation; proves demand but cannot scale due to human labor costs |

### Path to $1B Valuation

- **$1M MRR** (Month 14): 45,455 paying subscribers at $22 ARPU
- **$5M MRR** (Month 24): 227,273 paying subscribers + performance fee revenue accelerating
- **$10M MRR** (Month 30): 400,000+ subscribers across all tiers + substantial performance fees
- At 20-30x revenue multiple (standard for high-growth consumer AI fintech): **$10M MRR = $2.4B-$3.6B valuation**

---

## Competition

| Capability | Claimback | Rocket Money | CoPatient | Resolve | Generic AI (ChatGPT) |
|-----------|-----------|-------------|-----------|---------|----------------------|
| Bill scanning (camera) | Yes (AI Vision) | No | No | No | No |
| Overcharge detection | Yes (automated) | Limited | Yes (human) | Yes (human) | No |
| Medical CPT analysis | Yes (automated) | No | Yes (human) | Yes (human) | Partial |
| AI phone negotiation | Yes (autonomous) | Human agents | Human agents | Human agents | No |
| Bank fee monitoring | Yes (Plaid) | Yes (Plaid) | No | No | No |
| Dispute letter generation | Yes (AI) | No | No | Yes (human) | Partial |
| Real-time tracking | Yes | Basic | Basic | Basic | No |
| Performance pricing | Yes (25%) | Partial | Yes (30-50%) | Yes (30-50%) | N/A |
| Monthly cost | $0-$39.99 | $12/mo | $0 (fee only) | $0 (fee only) | $20/mo |
| Scalability | Infinite (AI) | Limited (humans) | Very limited | Very limited | N/A |

**Key Insight:** Every existing competitor relies on human advocates to negotiate bills, creating a fundamental scalability constraint that caps their growth and keeps costs high. Claimback is the first fully AI-native bill fighting agent -- using Vision AI for scanning, language models for analysis and letter generation, and voice AI for phone negotiation. This means Claimback can handle 100,000 disputes simultaneously at a marginal cost of $0.10-0.50 per dispute vs. $15-50 for human-powered competitors. The AI-native architecture is not just a feature advantage -- it is a structural economic advantage that makes Claimback 50-100x cheaper to operate at scale.

---

## Project Documentation

| Document | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, AI pipeline, voice integration, bank monitoring, and scalability plan |
| [Features](./features.md) | MVP features, post-MVP roadmap, user stories, and month-by-month timeline |
| [Screens](./screens.md) | All 9 app screens with UI elements, interactions, states, and navigation flow |
| [Skills](./skills.md) | Technical, domain, design, and business skills needed to build Claimback |
| [Theme](./theme.md) | Consumer Champion brand identity, color system, typography, and component specs |
| [API Guide](./api-guide.md) | All external APIs with pricing, setup, code snippets, and cost projections |
| [Revenue Model](./revenue-model.md) | Pricing tiers, unit economics, growth timeline, acquisition channels, and expansion |

---

## One-Liner

> Claimback is Rocket Money with AI superpowers -- an autonomous agent that scans your bills, finds every overcharge, and fights to get your money back without you lifting a finger.
