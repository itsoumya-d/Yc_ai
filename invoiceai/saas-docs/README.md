# InvoiceAI

**Get paid faster with AI.**

> AI-powered invoicing and accounts receivable automation for freelancers and solo businesses. Stop chasing payments. Start getting paid.

---

## Canonical Audit Status

| Field | Current state |
|---|---|
| **Canonical app path** | `E:\Yc_ai\invoiceai` |
| **Canonical audit path** | `E:\Yc_ai\audit-2026-03-12\apps\invoiceai-audit.md` |
| **Current status** | Needs Work |
| **Current completion score** | 22 / 100 |
| **Billing posture** | Paddle is the canonical target; legacy Stripe surfaces remain in code and docs until migrated |
| **Top verified blockers** | Missing OAuth callback coverage, unauthenticated AI generation, missing explicit AI rate limiting, failing build/test verification |

This README remains the app overview, but the launch-readiness source of truth is the canonical audit set in `audit-2026-03-12`.

---

## What is InvoiceAI?

InvoiceAI automates the entire invoicing lifecycle for freelancers and solo businesses. The AI drafts invoices from project descriptions or time logs, sends them at the optimal time for fast payment, chases late payments with escalating follow-up sequences, predicts which clients will pay late, and provides cash flow forecasting. It turns "chasing invoices" from a weekly chore into a set-and-forget system.

**Platform:** B2C Web-First (responsive web app, mobile-optimized)

---

## The Problem

Freelancers lose money and time to a broken invoicing process:

- **58% of freelancers** have trouble getting paid on time
- The average freelancer spends **5 hours per week** on invoicing and admin tasks
- **$825 billion** in late payments globally every year
- Late payments cause **29% of freelancers** to struggle with cash flow
- Most freelancers use Word docs, spreadsheets, or basic templates with zero automation
- Chasing payments is emotionally draining and damages client relationships
- Freelancers lack the data to predict cash flow or identify risky clients

## The Solution

InvoiceAI replaces the entire invoicing workflow with an AI-powered system:

1. **Describe your work** in plain language or connect your time tracker
2. **AI drafts a professional invoice** with line items, terms, and notes
3. **One-click send** at the AI-recommended optimal time for fast payment
4. **Clients pay online** via credit card or bank transfer through a branded portal
5. **Automated follow-ups** chase late payments with escalating sequences
6. **AI predicts** which clients will pay late before you even send the invoice
7. **Cash flow forecasting** shows your projected income for the next 90 days

**The result:** Freelancers get paid 2x faster, spend 80% less time on admin, and never have to write an awkward payment reminder again.

---

## YC Alignment

InvoiceAI aligns with several active YC thesis areas:

| YC Category | Alignment |
|---|---|
| **Stablecoin Finance** | Adjacent fintech — payment processing and cash flow management for the freelance economy |
| **Vertical AI** | Deep AI integration in a specific domain (freelance invoicing) rather than horizontal tooling |
| **AI-Native Agencies** | Replacing bookkeepers and collections agents with AI — the "AI accountant" for freelancers |
| **SMB Software** | Purpose-built for the underserved solo business / freelancer segment |

---

## Market Opportunity

### The Freelance Economy

| Metric | Value |
|---|---|
| Freelancers in the US | 60 million |
| US freelance economy value | $1.4 trillion |
| Global freelance market size | $4.5 trillion |
| Freelancers with late payment issues | 58% (34.8M in US) |
| Average time spent on invoicing/admin | 5 hours/week |
| Global late payments | $825 billion |
| Freelancers who would pay for better tools | 72% |
| Average freelancer income | $30K - $200K |

### TAM / SAM / SOM

| Segment | Calculation | Value |
|---|---|---|
| **TAM** (Total Addressable Market) | 60M US freelancers x $156/yr avg pricing | $9.36B |
| **SAM** (Serviceable Addressable Market) | 15M freelancers earning $30K+ who actively invoice clients | $2.34B |
| **SOM** (Serviceable Obtainable Market) | 0.5% of SAM in Year 1 (75K subscribers) | $11.7M |

### Why Now?

1. **AI maturity** — LLMs can now draft professional invoices and predict payment behavior
2. **Freelance growth** — The freelance workforce grows 3x faster than the overall workforce
3. **Payment digitization** — Clients expect online payment options (credit card, ACH)
4. **Remote work normalization** — More people freelancing post-COVID than ever before
5. **Existing tools are not AI-native** — FreshBooks, Wave, and Bonsai were built before LLMs existed

---

## Competitive Landscape

### Comparison Table

| Feature | InvoiceAI | FreshBooks | Wave | Bonsai | HoneyBook |
|---|---|---|---|---|---|
| **AI Invoice Drafting** | Yes | No | No | No | No |
| **AI Payment Prediction** | Yes | No | No | No | No |
| **Automated Follow-ups** | AI-powered escalating | Basic reminders | No | Basic | Basic |
| **Cash Flow Forecasting** | AI-powered (90-day) | Manual reports | No | No | No |
| **Online Payments** | Stripe + ACH | Yes | Yes | Yes | Yes |
| **Client Portal** | Branded portal | Yes | No | Yes | Yes |
| **Free Tier** | 5 invoices/mo | No (trial only) | Yes (ads) | No | No |
| **Pricing** | $12.99/mo | $17/mo | Free (limited) | $25/mo | $19/mo |
| **Target User** | Freelancers | Small businesses | Micro businesses | Freelancers | Creatives |
| **Freelancer-Specific** | 100% | Partial | No | Yes | Partial |

### Comparable Companies

| Company | Valuation / Revenue | What They Do |
|---|---|---|
| **FreshBooks** | $200M+ ARR | Cloud accounting for small businesses |
| **Wave** | Acquired by H&R Block ($537M) | Free invoicing with paid payroll |
| **Bonsai** | $40M+ raised | All-in-one freelance management |
| **HoneyBook** | $2.4B valuation | Client management for creatives |
| **Deel** | $12B valuation | Global payroll and contractor payments |

### InvoiceAI's Moat

1. **AI payment prediction** — No competitor predicts which clients will pay late, enabling proactive intervention
2. **Automated collections sequences** — AI-generated follow-ups that escalate intelligently vs. generic reminders
3. **Cash flow intelligence** — ML-powered forecasting that learns from your actual payment patterns
4. **Freelancer-first design** — Built exclusively for solo operators, not adapted from SMB accounting tools
5. **Network effects** — Payment data across clients improves prediction models for all users
6. **Data flywheel** — More invoices processed = better AI predictions = more value = more users

---

## Key Metrics (Target Year 1)

| Metric | Target |
|---|---|
| Monthly Active Users | 50,000 |
| Paid Subscribers | 12,000 |
| MRR | $180,000 |
| Average Invoice Size | $2,500 |
| Invoice Volume (monthly) | 200,000 |
| Payment Speed Improvement | 2x faster than manual |
| User Retention (12-month) | 78% |
| NPS | 55+ |

---

## Business Model Summary

| Revenue Stream | Description |
|---|---|
| **Subscription** | Free / Pro ($12.99/mo) / Business ($24.99/mo) |
| **Transaction Fee** | 1% on payments processed through platform |
| **Future: Invoice Financing** | Advance payments on outstanding invoices (margin on factoring) |
| **Future: Premium Templates** | Designer invoice templates ($2.99 each) |

See [revenue-model.md](./revenue-model.md) for the complete financial model.

---

## Tech Stack Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.1.6 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions / server actions) |
| AI/ML | OpenAI API (GPT-4o, GPT-4o-mini) |
| Payments | Paddle target architecture, with legacy Stripe-era code paths still pending migration |
| Email | SendGrid |
| Infrastructure | Vercel, Cloudflare |
| PDF Generation | React-PDF |

See [tech-stack.md](./tech-stack.md) for the complete architecture.

---

## Quick Links

| Document | Description |
|---|---|
| [README.md](./README.md) | Product overview (this file) |
| [tech-stack.md](./tech-stack.md) | Architecture, infrastructure, and tooling |
| [features.md](./features.md) | Feature roadmap with MVP and post-MVP phases |
| [screens.md](./screens.md) | Every screen, UI elements, navigation flows |
| [skills.md](./skills.md) | Technical, domain, and design skills required |
| [theme.md](./theme.md) | Design system, colors, typography, components |
| [api-guide.md](./api-guide.md) | Third-party API integrations and setup |
| [revenue-model.md](./revenue-model.md) | Pricing, unit economics, growth model |

---

## One-Liner Pitch

> InvoiceAI is the AI-powered accounts receivable platform that drafts, sends, and collects invoices for freelancers — so they get paid faster and never chase a payment again.

## Elevator Pitch (30 seconds)

> 60 million freelancers in the US spend 5 hours a week on invoicing and 58% have trouble getting paid on time. InvoiceAI fixes this with AI that drafts invoices from project descriptions, sends them at the optimal time, chases late payments automatically, and predicts which clients will pay late before you even hit send. We are FreshBooks meets ChatGPT — but built from scratch for the freelance economy. Our target is $12.99/mo per user with a 1% transaction fee, giving us a path to $1M MRR with 55,000 subscribers.

---

## Team Requirements

| Role | Priority | Responsibility |
|---|---|---|
| **Full-Stack Engineer** | P0 | Next.js, Supabase, Stripe integration |
| **AI/ML Engineer** | P0 | Payment prediction models, invoice drafting |
| **Designer** | P1 | Invoice templates, dashboard UX, brand |
| **Growth Marketer** | P1 | SEO, freelancer community outreach |
| **Finance Domain Expert** | P2 | Payment terms, tax compliance, collections |

---

## Development Timeline

| Phase | Timeline | Milestone |
|---|---|---|
| **MVP** | Months 1-6 | AI invoice drafting, online payments, basic reminders |
| **Growth** | Months 7-12 | Payment prediction, automated follow-ups, cash flow |
| **Scale** | Year 2+ | Invoice financing, integrations, team features |

---

## Contact

- **Product:** InvoiceAI
- **Category:** AI Fintech / Invoicing / Accounts Receivable
- **Stage:** Pre-MVP
- **Model:** B2C SaaS + Transaction Fees

---

*Last updated: February 2026*
