# StockPulse

**AI inventory that counts itself.**

> B2B Mobile-First SaaS | AI Inventory Scanner for Small Retail & Restaurants

---

## The Pitch

StockPulse uses your phone camera to scan shelves, walk-in coolers, and storage rooms — instantly counting inventory, detecting low stock, identifying expiring items, and generating purchase orders. Built for the 30M+ small retailers and restaurants that still count inventory by hand. No expensive hardware, no complex setup, no desktop software. Just point your phone and scan.

---

## Why Now

### YC Alignment

- **AI for Physical Work** — Bringing computer vision out of the lab and into the stockroom. StockPulse turns any smartphone into an enterprise-grade inventory scanner, eliminating hours of manual counting.
- **Vertical AI Agents ("10x bigger than SaaS")** — This is not a generic AI tool. StockPulse is a deeply vertical AI agent that understands retail shelves, restaurant walk-ins, expiration dates, and supplier catalogs. It replaces an entire workflow, not just a feature.
- **Democratized AI** — The same computer vision technology that powers Amazon Go's $1M+ sensor arrays, now available to a corner store owner for $39/month on the phone already in their pocket.

### Why This Matters Right Now

1. **GPT-4o Vision is production-ready** — Multimodal AI can now reliably identify products, read labels, and count items from phone camera feeds.
2. **70% of small businesses still count manually** — The existing tools (Lightspeed, MarketMan) are desktop-first, expensive, and require manual data entry.
3. **Food waste is a $162B/year crisis** — Restaurants throw away 4-10% of purchased food. Expiration tracking alone justifies the subscription cost.
4. **Post-COVID labor shortage** — Managers who used to have staff count inventory are now doing it themselves at 11 PM. StockPulse gives them that time back.

---

## Market Opportunity

### Market Size

| Segment | Value | Source |
|---------|-------|--------|
| **TAM** — Global inventory management software | $3.2B (2024), growing 6.1% CAGR | Grand View Research |
| **SAM** — SMB inventory tools (< 50 employees) | $890M | Estimated at 28% of TAM |
| **SOM** — US small retail + restaurants, mobile-first | $178M | 200K locations at ~$75/mo avg |

### Target Customers

| Customer Type | Count (US) | Pain Level | Avg Revenue/Location |
|--------------|-----------|------------|---------------------|
| Independent restaurants (1-5 locations) | 620,000 | Very High | $850K/yr |
| Convenience stores | 150,000 | High | $1.2M/yr |
| Specialty retail (boutiques, gift shops) | 280,000 | Medium-High | $450K/yr |
| Food trucks & pop-ups | 35,000 | Medium | $250K/yr |
| Small grocery & bodegas | 45,000 | Very High | $1.5M/yr |
| **Total addressable locations** | **1,130,000** | | |

### Why These Customers

- **They count inventory by hand** — clipboard, pen, spreadsheet. 2-4 hours per count, often weekly.
- **They over-order or under-order** — Without accurate data, they guess. This leads to waste (over) or lost sales (under).
- **They lose money to expiration** — Restaurants throw away $25K-$75K in food per year. A corner store loses $8K-$15K.
- **They cannot afford existing solutions** — Enterprise inventory systems cost $500-$2,000/month and require dedicated hardware.

---

## Competitive Landscape

| Feature | StockPulse | Lightspeed | MarketMan | BlueCart | Sortly |
|---------|-----------|------------|-----------|---------|--------|
| **AI camera scanning** | Yes | No | No | No | Barcode only |
| **Mobile-first** | Yes | No (desktop) | No (web) | No (web) | Yes |
| **Product recognition (no barcode needed)** | Yes | No | No | No | No |
| **Expiration tracking** | Yes | No | Yes | No | No |
| **Auto purchase orders** | Yes | Manual | Yes | Yes | No |
| **POS integration** | Square, Toast, Clover | Own POS | Limited | No | No |
| **Offline scanning** | Yes | No | No | No | Limited |
| **Starting price** | Free / $39/mo | $89/mo | $200/mo | $99/mo | $49/mo |
| **Setup time** | 5 minutes | Days | Days | Hours | Hours |
| **Target customer** | SMB retail + restaurants | Mid-market retail | Mid-market restaurants | Restaurants | General inventory |

### Competitive Moat

1. **AI-first, not AI-added** — Competitors are bolting AI onto legacy desktop platforms. StockPulse is built from the ground up around the camera-scan workflow.
2. **Mobile-native** — Designed for one-handed scanning in a walk-in cooler, not sitting at a desk. This is a fundamentally different UX.
3. **Data flywheel** — Every scan improves our product recognition model. At 10K locations scanning daily, we build an unassailable training dataset of retail/restaurant products.
4. **Network effects via suppliers** — As we connect more restaurants to suppliers, the platform becomes more valuable for both sides (marketplace dynamics).
5. **Low switching cost in, high switching cost out** — Easy to start (just scan), but once your entire product catalog, supplier relationships, and ordering history live in StockPulse, switching is painful.

---

## Business Model Summary

| Metric | Value |
|--------|-------|
| **Free tier** | 1 location, 100 SKUs, basic scanning |
| **Growth** | $39/mo — unlimited SKUs, 3 locations |
| **Business** | $99/mo — unlimited locations, POS integrations, team access |
| **Enterprise** | Custom pricing |
| **Path to $1M MRR** | 15,000 paying locations at avg $67/mo |
| **CAC** | $85 (blended digital + local sales) |
| **LTV** | $1,608 (24-month avg retention) |
| **LTV:CAC** | 18.9x |

---

## Founder Advantage

The ideal founder for StockPulse:

- Has worked in or closely with restaurants/retail (understands the pain viscerally)
- Can build React Native + AI integrations (or has a technical co-founder who can)
- Is comfortable doing direct sales — walking into restaurants, pitching to store owners
- Understands that this is a local-sales-first business with digital scale later

---

## Key Metrics to Track

| Metric | Target (Month 6) | Target (Month 12) | Target (Month 24) |
|--------|-------------------|--------------------|--------------------|
| Active locations | 500 | 2,500 | 12,000 |
| Monthly scans | 15,000 | 125,000 | 1,200,000 |
| MRR | $12K | $85K | $450K |
| Scan accuracy | 92% | 96% | 98% |
| Churn (monthly) | 8% | 5% | 3.5% |
| NPS | 40 | 55 | 65 |

---

## Risk Factors

| Risk | Severity | Mitigation |
|------|----------|------------|
| AI accuracy insufficient for production | High | Barcode fallback always available; hybrid AI + manual approach |
| Square/Toast build their own scanner | Medium | Move fast, build data moat, focus on multi-POS support |
| SMB churn is high | Medium | Strong onboarding, ROI dashboard showing money saved |
| Long sales cycles with restaurants | Medium | Free tier removes friction; local sales reps for conversion |
| Camera quality varies across devices | Low | On-device preprocessing; minimum device requirements |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Architecture, frameworks, infrastructure, and scalability plan |
| [Features](./features.md) | MVP roadmap, post-MVP features, and Year 2+ vision |
| [Screens](./screens.md) | Every screen, navigation flow, UI elements, and states |
| [Skills](./skills.md) | Technical, domain, design, and business skills required |
| [Theme](./theme.md) | Brand identity, color palette, typography, and component styling |
| [API Guide](./api-guide.md) | Third-party APIs, pricing, auth, code snippets, and cost projections |
| [Revenue Model](./revenue-model.md) | Pricing tiers, unit economics, acquisition strategy, and path to $1M MRR |

---

## One-Liner for YC Application

> StockPulse replaces the clipboard-and-spreadsheet inventory count with AI-powered phone scanning — saving small restaurants and retailers 4+ hours per week and reducing waste by 30%.

---

*StockPulse — Because your inventory should count itself.*
