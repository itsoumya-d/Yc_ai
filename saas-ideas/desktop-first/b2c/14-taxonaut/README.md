# Taxonaut

> **Your AI tax strategist, year-round.**

Taxonaut is not tax filing software -- it is an AI tax strategist that works year-round. It connects to your bank accounts and invoicing tools, monitors your income and expenses in real-time, and proactively suggests tax-saving strategies: retirement contributions, equipment purchases, entity restructuring, estimated payments, deduction optimization. It turns reactive April panic into proactive year-round tax minimization.

**Desktop-First B2C SaaS** -- built as an Electron app because freelancers and small business owners trust desktop applications with sensitive financial data more than browser tabs.

---

## The Problem

Freelancers and small business owners are hemorrhaging money to the IRS every single year -- not because the tax code is unfair, but because they lack year-round strategic guidance.

- The average US freelancer overpays **$5,400/year** in taxes due to missed deductions and poor timing
- CPAs charge **$200-500/hour** for strategic tax advice, pricing out 80% of freelancers
- Existing tools (TurboTax, H&R Block) only help during filing season -- they are **reactive**, not proactive
- Quarterly estimated taxes are confusing, leading to underpayment penalties or massive overpayments
- Entity structure decisions (LLC vs S-Corp) can save $10K-30K/year but most freelancers never get this advice
- Tax strategy is a **year-round activity** but the entire industry treats it as a once-a-year event

The gap is massive: **there is no affordable, proactive, AI-powered tax strategist for the 60 million US freelancers.**

---

## The Solution

Taxonaut sits on your desktop, quietly connected to your bank accounts and invoicing tools. It watches your income and expenses flow in real-time and acts like a $500/hour tax strategist working for you every single day.

### How It Works

1. **Connect** -- Link your bank accounts, credit cards, and invoicing tools via Plaid
2. **Categorize** -- AI automatically categorizes every transaction (meals, travel, software, home office)
3. **Analyze** -- Real-time tax liability calculation updates as income and expenses flow in
4. **Strategize** -- Proactive recommendations appear: "You're $4,200 away from the QBI deduction threshold -- here's what to do" or "Purchasing that equipment before Dec 31 saves you $3,100 via Section 179"
5. **Act** -- One-click estimated payment calculations, deadline reminders, exportable reports for your CPA

### What Makes It Different

Taxonaut does not help you file taxes. It helps you **pay less taxes, legally**, all year long.

| Feature | TurboTax | Keeper | Collective | **Taxonaut** |
|---------|----------|--------|------------|--------------|
| Tax filing | Yes | No | Yes | No (by design) |
| Transaction categorization | No | Yes | Yes | **Yes** |
| Real-time tax liability | No | Limited | Yes | **Yes** |
| Proactive strategy | No | No | Limited | **Yes -- core product** |
| Entity optimization | No | No | Yes (manual) | **Yes (AI-powered)** |
| Retirement planning | No | No | Limited | **Yes** |
| Quarterly estimates | Basic | Basic | Yes | **Yes + reminders** |
| Desktop app | No | No | No | **Yes** |
| Price | $89-219/yr | $16/mo | $299/mo | **$19.99-39.99/mo** |

---

## YC Alignment

Taxonaut aligns with multiple Y Combinator thesis areas:

- **Stablecoin Finance (adjacent)** -- Fintech for underserved populations. Freelancers are the most financially underserved segment in the US. They earn like businesses but get treated like W-2 employees by every financial tool
- **AI-Native Agencies** -- Replacing expensive CPAs with AI that provides strategic tax advice at 1/10th the cost. This is the vertical AI play: domain-specific AI that outperforms generalist human advisors for 90% of use cases
- **Vertical AI** -- Deep, narrow AI in a specific domain (US tax code) rather than broad horizontal AI. The tax code is 75,000+ pages -- perfect for AI to parse, cross-reference, and apply to individual situations

---

## Market Sizing

### TAM (Total Addressable Market)

- **$23 billion** -- US tax preparation and advisory market
- Growing at 3.2% CAGR, accelerating with gig economy growth

### SAM (Serviceable Addressable Market)

- **$4.8 billion** -- Freelancer and small business tax advisory segment
- 60 million US freelancers + 33 million small businesses (1-10 employees)
- Average spend on tax preparation and advice: $500-2,000/year

### SOM (Serviceable Obtainable Market)

- **$252 million** -- Realistic 5-year capture
- 700,000 paying users at average $30/month = $252M ARR
- Represents 0.75% of freelancer population

### Market Tailwinds

- Gig economy growing 15% YoY
- Remote work creating multi-state tax complexity
- AI acceptance in financial services increasing rapidly
- IRS increasing audit rates for Schedule C filers (freelancers are 5x more likely to be audited)
- Tax code complexity increasing with every new legislation

---

## Competitive Landscape

### Direct Competitors

| Company | What They Do | Weakness | Taxonaut Advantage |
|---------|-------------|----------|-------------------|
| **TurboTax** (Intuit, $12B rev) | Tax filing software | Filing only, no year-round strategy | Year-round proactive strategy |
| **Keeper** ($16/mo) | Freelancer expense tracking | Categorization focus, limited strategy | Deep strategic recommendations |
| **Collective** ($299/mo) | S-Corp formation + bookkeeping | Expensive, S-Corp only | Affordable, entity-agnostic |
| **Bench** ($299/mo) | Bookkeeping service | Human bookkeepers, no strategy | AI-powered strategy at 1/10th cost |
| **Wingspan** | Freelancer financial platform | Payment focus, light on tax | Tax strategy is the core product |

### Indirect Competitors

| Company | Overlap | Why We Win |
|---------|---------|-----------|
| **CPAs/Tax advisors** | Strategic advice | 95% cheaper, available 24/7, data-driven |
| **QuickBooks Self-Employed** | Expense tracking | Deeper tax strategy, better UX |
| **Freshbooks** | Invoicing + expenses | We complement, not compete (integration partner) |

### Competitive Moat

1. **Proactive vs Reactive** -- Every competitor waits for tax season. Taxonaut works 365 days/year
2. **Strategy vs Filing** -- We deliberately do NOT file taxes. This lets us focus entirely on savings optimization
3. **Data Flywheel** -- More transactions processed means better categorization, better strategy, better outcomes. Each user's data makes the AI smarter for all users
4. **Switching Costs** -- Once financial accounts are connected and 12+ months of categorized data exists, switching to a competitor means losing all that history and strategy context
5. **Desktop Trust** -- Financial data in a desktop app feels inherently more secure than a browser tab. This is a psychological moat for the target audience
6. **Network Effects (future)** -- CPA collaboration mode creates a two-sided network where CPAs recommend Taxonaut to clients

---

## Key Metrics (Targets)

| Metric | Month 6 | Month 12 | Month 24 |
|--------|---------|----------|----------|
| Registered Users | 5,000 | 25,000 | 120,000 |
| Paid Users | 500 | 5,000 | 35,000 |
| MRR | $12,500 | $142,500 | $1,000,000 |
| Avg Savings Found/User | $1,200 | $3,400 | $5,400 |
| Monthly Churn | 5% | 3% | 2.1% |
| NPS | 40 | 55 | 65 |

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, infrastructure, and technology decisions |
| [Features](./features.md) | MVP roadmap, post-MVP features, and user stories |
| [Screens](./screens.md) | Every screen in the application with UI details |
| [Skills](./skills.md) | Technical and domain skills required to build Taxonaut |
| [Theme](./theme.md) | Design system, colors, typography, and component styling |
| [API Guide](./api-guide.md) | Third-party integrations, pricing, and code snippets |
| [Revenue Model](./revenue-model.md) | Pricing, unit economics, and path to $1M MRR |

---

## Team Requirements

- **Full-stack engineer** with Electron + React experience
- **AI/ML engineer** for tax strategy model fine-tuning
- **Domain expert** -- enrolled agent or CPA advisor (part-time/advisory)
- **Designer** -- fintech dashboard experience, data visualization

---

## Disclaimer

Taxonaut provides tax education and strategy suggestions for informational purposes only. It does not constitute tax advice, legal advice, or accounting services. Users should consult with a qualified tax professional before making tax-related decisions. Taxonaut is not a CPA firm, law firm, or registered investment advisor.

---

## License

Proprietary. All rights reserved.
