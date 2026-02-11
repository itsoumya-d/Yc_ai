# StockPulse — Revenue Model

> Pricing tiers, unit economics, acquisition strategy, churn analysis, expansion revenue, and the path to $1M MRR.

---

## Pricing Tiers

| Feature | Free | Growth ($39/mo) | Business ($99/mo) | Enterprise (Custom) |
|---------|------|-----------------|-------------------|---------------------|
| **Locations** | 1 | 3 | Unlimited | Unlimited |
| **SKUs** | 100 | Unlimited | Unlimited | Unlimited |
| **AI scans/month** | 50 | 500 | Unlimited | Unlimited |
| **Barcode scanning** | Yes | Yes | Yes | Yes |
| **Low-stock alerts** | Basic (in-app only) | Push + email | Push + email + SMS | Custom routing |
| **Manual count entry** | Yes | Yes | Yes | Yes |
| **Basic reporting** | Yes | Yes | Yes | Yes |
| **Advanced reporting** | No | Yes | Yes | Yes |
| **Purchase order generation** | No | Yes | Yes | Yes |
| **Expiration tracking** | No | Yes | Yes | Yes |
| **Waste analytics** | No | No | Yes | Yes |
| **POS integration** | No | No | Yes (Square, Toast, Clover) | Yes + custom |
| **Team members** | 1 | 3 | Unlimited | Unlimited |
| **Google Sheets export** | No | Yes | Yes | Yes |
| **Predictive ordering** | No | No | No | Yes |
| **API access** | No | No | No | Yes |
| **SSO/SAML** | No | No | No | Yes |
| **Dedicated support** | No | No | Priority email | Dedicated CSM |
| **Data retention** | 30 days | 1 year | 3 years | Custom |
| **Annual discount** | - | $31/mo (billed annually) | $79/mo (billed annually) | Negotiated |

### Pricing Rationale

- **Free tier** is a marketing tool, not charity. It gets the app on phones and builds word-of-mouth. 100 SKU limit is enough for a food truck or small pop-up, but quickly outgrown by any real retail or restaurant operation.
- **$39/mo Growth** is the "no-brainer" tier. A restaurant manager making $55K/year saves 4+ hours/week on inventory counting. At $39/mo, StockPulse costs less than 1 hour of their time and saves 16+ hours per month.
- **$99/mo Business** is the "serious operator" tier. POS integration alone justifies this price — it automates inventory deduction on every sale, something that currently requires manual tracking.
- **Enterprise** is for multi-unit operators (10+ locations) and requires custom scoping (volume discounts, integrations, compliance requirements).

### Upgrade Triggers

| Trigger | From | To | Conversion Rate (est.) |
|---------|------|----|----------------------|
| Hit 100 SKU limit | Free | Growth | 25% |
| Want push notification alerts | Free | Growth | 15% |
| Add 2nd location | Free/Growth | Growth/Business | 35% |
| Need POS integration | Growth | Business | 40% |
| Add 4th team member | Growth | Business | 20% |
| Need waste analytics | Growth | Business | 15% |
| Exceed 500 AI scans/month | Growth | Business | 30% |

---

## Path to $1M MRR

### The Math

```
$1,000,000 MRR = 15,000 paying locations x $67 average revenue per location

Breakdown:
- 9,000 Growth locations x $39/mo = $351,000
- 5,500 Business locations x $99/mo = $544,500
- 500 Enterprise locations x $250/mo avg = $125,000
- Total: $1,020,500 MRR
```

### Timeline to $1M MRR

| Month | Paying Locations | MRR | Key Milestone |
|-------|-----------------|-----|---------------|
| 1-3 | 0 | $0 | Building MVP, beta testing with 20 local businesses |
| 4-6 | 50 | $2,500 | MVP launch, first paying customers from beta cohort |
| 7-9 | 200 | $10,000 | Product-market fit signal, first repeat referrals |
| 10-12 | 600 | $32,000 | Hired first local sales rep, POS integrations live |
| 13-18 | 2,000 | $110,000 | Listed on Square/Toast app marketplaces |
| 19-24 | 5,500 | $320,000 | 3 sales reps, multi-city expansion |
| 25-30 | 10,000 | $600,000 | Series A raised, national sales team |
| 31-36 | 15,000 | $1,000,000 | $1M MRR milestone |

### Growth Rate Assumptions

- Month 4-12: 30-40% month-over-month growth (early traction)
- Month 13-24: 20-25% month-over-month growth (scaling sales)
- Month 25-36: 10-15% month-over-month growth (maturing)

These rates are realistic for vertical B2B SaaS with local sales motion. Comparable companies (Toast, ServiceTitan) achieved similar growth curves in their early years.

---

## Unit Economics

### Customer Acquisition Cost (CAC)

| Channel | Cost per Lead | Conversion Rate | CAC | % of Customers |
|---------|--------------|-----------------|-----|----------------|
| Google Ads (search) | $8 | 5% | $160 | 20% |
| Local sales reps (door-to-door) | $15/visit | 12% | $125 | 35% |
| POS app marketplace | $0 organic | 8% | $15 (listing/maintenance) | 20% |
| Referral program | Free month ($39 value) | 40% | $39 | 10% |
| Trade shows/events | $2,000/event | 3% per attendee | $200 | 5% |
| Content/SEO | $0.50/visitor | 2% | $25 | 10% |
| **Blended CAC** | | | **$85** | **100%** |

### Lifetime Value (LTV)

```
LTV = ARPU x Gross Margin x Average Lifespan

Where:
- ARPU (Average Revenue Per User) = $67/month
- Gross Margin = 88%
- Average Lifespan = 24 months (based on 4.2% monthly churn)
  - Lifespan = 1 / churn rate = 1 / 0.042 = 23.8 months

LTV = $67 x 0.88 x 23.8 = $1,403

With expansion revenue (upgrades, additional locations):
Adjusted LTV = $1,608

LTV:CAC Ratio = $1,608 / $85 = 18.9x
```

### LTV:CAC Analysis

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| LTV | $1,608 | > $1,000 for SMB SaaS | Excellent |
| CAC | $85 | < $200 for SMB SaaS | Excellent |
| LTV:CAC | 18.9x | > 3x is healthy | Exceptional |
| CAC Payback | 1.4 months | < 12 months is healthy | Exceptional |
| Gross Margin | 88% | > 70% for SaaS | Excellent |

**Why LTV:CAC is so high:** Low CAC from local sales (direct, high-conversion) combined with sticky product (inventory data is hard to migrate) and low marginal cost of serving (API costs < $1/user/month).

---

## Revenue Per Customer Breakdown

### Gross Margin Waterfall

```
Monthly revenue per Growth customer:          $39.00 (100%)
  - Stripe processing fees (2.9% + $0.30):   -$1.43 (3.7%)
  - OpenAI API costs:                         -$0.90 (2.3%)
  - Supabase (amortized):                     -$0.50 (1.3%)
  - Cloudflare R2 storage:                    -$0.10 (0.3%)
  - OneSignal push notifications:             -$0.00 (0.0%)
  - Barcode Lookup API:                       -$0.05 (0.1%)
  - Support (amortized):                      -$1.50 (3.8%)
                                              --------
  Gross Profit:                               $34.52 (88.5%)
```

```
Monthly revenue per Business customer:        $99.00 (100%)
  - Stripe processing fees:                   -$3.17 (3.2%)
  - OpenAI API costs:                         -$1.50 (1.5%)
  - Supabase (amortized):                     -$1.00 (1.0%)
  - Cloudflare R2 storage:                    -$0.25 (0.3%)
  - POS API integration costs:                -$0.00 (0.0%)
  - Support (amortized):                      -$2.00 (2.0%)
                                              --------
  Gross Profit:                               $91.08 (92.0%)
```

---

## Customer Acquisition Strategy

### Channel 1: Local Direct Sales (35% of customers)

**Strategy:** Hire local sales reps in target markets (cities with high restaurant density). They walk into restaurants and retail stores, demo the app on the owner's actual shelves, and sign them up on the spot.

**Tactics:**
- Identify target neighborhoods with high density of independent restaurants
- Walk in during off-peak hours (2-4 PM for restaurants)
- Demo takes 3 minutes: scan their actual shelf, show results instantly
- Free trial signup on their phone before leaving
- Follow-up call at day 3 and day 7
- Goal: 3-4 signups per rep per day

**Economics:**
- Sales rep compensation: $45K base + $15K commission = $60K/year
- Rep signs up 50 locations/month, 30% convert to paid = 15 paying/month
- Rep cost per paying customer: $333/month salary / 15 customers = $22
- Add overhead and tools: ~$125 CAC per customer from this channel

**Scaling:**
- Month 1-6: Founder does all sales (0 reps)
- Month 7-12: Hire 1 local rep in home market
- Month 13-18: Hire 3 reps in 3 cities
- Month 19-24: 8 reps in 8 cities
- Month 25-36: 15 reps nationally

---

### Channel 2: Google Ads (20% of customers)

**Target keywords:**

| Keyword | Monthly Search Volume | CPC (est.) | Intent |
|---------|----------------------|-----------|--------|
| "inventory app for restaurants" | 1,200 | $4.50 | Very High |
| "restaurant inventory management" | 2,800 | $6.20 | High |
| "stock counting app" | 900 | $2.80 | High |
| "inventory scanner app" | 1,500 | $3.50 | High |
| "small business inventory software" | 3,200 | $5.80 | Medium-High |
| "food cost calculator" | 2,100 | $2.20 | Medium |
| "reduce restaurant food waste" | 800 | $3.10 | Medium |

**Funnel:**
- Click to landing page -> Free trial signup (landing page conversion: 8%)
- Free trial -> Active user (activation rate: 60%)
- Active user -> Paid conversion (conversion rate: 25%)
- Overall: 100 clicks -> 8 signups -> 5 active -> 1.2 paid

---

### Channel 3: POS App Marketplaces (20% of customers)

**Square App Marketplace:**
- List StockPulse as a Square integration
- Square merchants browsing marketplace have high intent
- No customer acquisition cost (organic discovery)
- Square takes no revenue share for marketplace listings

**Toast Partner Marketplace:**
- Toast restaurants specifically looking for inventory tools
- Toast's partner program promotes approved integrations
- Requires partner program approval

**Clover App Market:**
- Similar to Square marketplace
- Clover merchants tend to be smaller retail (convenience stores, boutiques)

---

### Channel 4: Referral Program (10% of customers)

**Structure:**
- Referrer gets 1 month free (value: $39-$99)
- Referee gets 1 month free
- Both must be active paying customers after the free month

**Expected viral coefficient:**
- 20% of customers make a referral
- 40% of referrals convert to paid
- Viral coefficient: 0.20 x 0.40 = 0.08 (each customer brings 0.08 new customers)

---

### Channel 5: Content/SEO (10% of customers)

**Blog content strategy:**
- "How to Count Restaurant Inventory in 15 Minutes"
- "The True Cost of Food Waste (And How to Cut It)"
- "Manual vs Automated Inventory: ROI Calculator"
- "Best Inventory Apps for Small Restaurants (2026 Guide)"
- "How to Set Par Levels for Your Restaurant"

**SEO targets:**
- Domain authority 30+ within 12 months
- Rank top 5 for 15+ inventory-related long-tail keywords
- 10,000 organic monthly visitors by month 18

---

### Channel 6: Trade Shows and Events (5% of customers)

**Target events:**
- National Restaurant Association Show (Chicago)
- Specialty Food Association Fancy Food Show
- Regional restaurant association events
- Local food service distributor expos
- POS vendor partner events

**ROI per event:**
- Cost: $2,000-5,000 (booth, travel, materials)
- Leads: 50-150 qualified contacts
- Conversions: 5-15 paying customers
- CAC: $200-400 per customer

---

## Target Customer Segments

### Segment 1: Independent Restaurants (1-5 locations)

**Profile:**
- 620,000 locations in the US
- Average revenue: $850K/year
- Average food cost: $280K/year (33%)
- Food waste: $25K-$75K/year
- Current inventory method: Clipboard + spreadsheet, 2-4 hours weekly
- Decision maker: Owner or general manager
- Tech comfort: Moderate (they use Toast/Square already)

**Why they buy:** Save 4+ hours/week on counting. Reduce food waste by 15-30% ($4K-$22K/year savings). $39-99/month pays for itself in the first week.

**Conversion tactic:** Demo on their walk-in cooler. Show them an instant count vs their current 45-minute process.

---

### Segment 2: Convenience Stores and Bodegas

**Profile:**
- 150,000 locations in the US
- Average revenue: $1.2M/year
- SKUs: 2,000-5,000
- Current method: Manual count or basic POS inventory
- Decision maker: Owner (often family-run)
- Tech comfort: Low-Medium

**Why they buy:** Prevent stockouts on high-margin items (tobacco, beverages, snacks). Barcode scanning is familiar and easy.

**Conversion tactic:** Show barcode scanning speed. Scan 50 products in 5 minutes vs 30 minutes manual.

---

### Segment 3: Specialty Retail

**Profile:**
- 280,000 locations (boutiques, gift shops, pet stores, health food)
- Average revenue: $450K/year
- SKUs: 500-3,000
- Current method: Spreadsheet or basic POS inventory
- Decision maker: Owner
- Tech comfort: Medium-High

**Why they buy:** Better stock visibility, avoid over-ordering seasonal items, professional reporting for accountants.

---

### Segment 4: Food Trucks and Pop-Ups

**Profile:**
- 35,000 in the US (and growing fast)
- Average revenue: $250K/year
- SKUs: 20-80 (very focused menus)
- Current method: Notebook or nothing
- Decision maker: Owner-operator
- Tech comfort: High (younger demographic)

**Why they buy:** Free tier is perfect for them. They become advocates and evangelists. When they open a brick-and-mortar, they upgrade.

---

## Churn Analysis

### Expected Churn Rates

| Period | Monthly Churn | Annual Churn | Reasons |
|--------|--------------|-------------|---------|
| Month 1-6 (MVP) | 8-10% | 65-72% | Product immaturity, limited features, bugs |
| Month 7-12 | 5-7% | 46-58% | Feature gaps filled, better onboarding |
| Month 13-24 | 3.5-5% | 35-46% | POS integrations create stickiness |
| Month 25+ | 2.5-3.5% | 26-35% | Data lock-in, workflow dependency |

### Churn Drivers

| Reason | % of Churn | Mitigation |
|--------|-----------|------------|
| "Too expensive, not enough ROI" | 30% | ROI dashboard showing money saved per month |
| "Not enough features" | 20% | Faster feature development, public roadmap |
| "Business closed" | 15% | Cannot control (restaurants have high failure rate) |
| "Switched to competitor" | 10% | Build data moat, POS integration stickiness |
| "Never got set up properly" | 15% | Better onboarding, in-app guidance, day-7 check-in |
| "Staff wouldn't adopt it" | 10% | Simpler UX, training materials, team incentives |

### Churn Prevention Strategies

1. **Day 1-7 activation program:** Ensure first scan, first product added, first alert configured within 7 days
2. **ROI dashboard:** Show "StockPulse saved you X hours and $Y this month" prominently
3. **Health scoring:** Track scan frequency, feature adoption. Proactive outreach when engagement drops
4. **Quarterly business reviews:** For Business and Enterprise customers, review their usage and savings
5. **Annual contracts:** Offer 20% discount for annual commitment (reduces churn by 40%)
6. **Community:** Facebook/WhatsApp group for restaurant owners to share tips (peer support reduces churn)

---

## Expansion Revenue

### Revenue Expansion Sources

| Source | Mechanism | Revenue Uplift |
|--------|-----------|---------------|
| **Tier upgrades** | Free to Growth, Growth to Business | 2.5x per upgrade |
| **Additional locations** | Per-location pricing on Growth/Business | $39-99 per new location |
| **Supplier marketplace** (Year 2+) | Commission on supplier orders placed through StockPulse | 1-3% of order value |
| **Per-scan overage** (Enterprise) | Metered billing above included scan limit | $0.05-0.10 per scan |
| **Premium analytics** (Year 2+) | Predictive ordering add-on | $29/mo add-on |
| **Advertising** (Year 3+) | Suppliers pay for preferred placement in PO suggestions | CPM-based |

### Net Revenue Retention (NRR)

```
NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR

Target NRR by period:
- Month 1-12: 95% (some churn, minimal expansion)
- Month 13-24: 105% (upgrades + locations outpace churn)
- Month 25+: 115%+ (marketplace revenue + predictive ordering add-on)
```

**NRR > 100% means the business grows even with zero new customer acquisition.** This is the holy grail of B2B SaaS and is achievable once multi-location expansion and supplier marketplace are live.

---

## Financial Projections (36 Months)

| Metric | Month 6 | Month 12 | Month 18 | Month 24 | Month 36 |
|--------|---------|----------|----------|----------|----------|
| **Free locations** | 200 | 800 | 2,000 | 4,000 | 8,000 |
| **Paying locations** | 50 | 600 | 2,000 | 5,500 | 15,000 |
| **MRR** | $2,500 | $32,000 | $110,000 | $320,000 | $1,000,000 |
| **ARR** | $30,000 | $384,000 | $1,320,000 | $3,840,000 | $12,000,000 |
| **Monthly revenue growth** | 35% | 20% | 15% | 12% | 8% |
| **Gross margin** | 85% | 87% | 88% | 89% | 90% |
| **Monthly burn** | $15,000 | $35,000 | $80,000 | $150,000 | $350,000 |
| **Team size** | 2 | 5 | 12 | 25 | 50 |
| **Months of runway** | 18 | 12 | Profitable* | Profitable | Profitable |

*Target breakeven at month 16-18.

### Revenue Mix at $1M MRR

```
$1,000,000 MRR breakdown:

Subscriptions:        $920,000 (92%)
  - Growth ($39):     $351,000 (35%)
  - Business ($99):   $544,500 (54%)
  - Enterprise:       $125,000 (13%)

Marketplace/Other:    $80,000 (8%)
  - Supplier commissions: $50,000
  - Overage fees:         $20,000
  - Analytics add-on:     $10,000
```

---

## Fundraising Strategy

### Pre-Seed (Month 0-3)

- **Raise:** $250K-500K
- **Source:** Angel investors, friends and family, pre-seed funds
- **Use of funds:** Build MVP, 6 months runway for 2-person team
- **Metrics to show:** Customer interviews (30+), LOIs from beta users, working prototype

### Seed (Month 9-15)

- **Raise:** $1.5M-3M
- **Source:** Seed-stage VCs (vertical SaaS focused)
- **Use of funds:** Hire engineers (3-4), sales reps (2-3), 18 months runway
- **Metrics to show:** $20K+ MRR, 500+ locations, 5%+ monthly growth, < 6% churn, LTV:CAC > 5x
- **Target investors:** VCs who have backed vertical SaaS (Toast, ServiceTitan, Mindbody early investors)

### Series A (Month 24-30)

- **Raise:** $8M-15M
- **Source:** Series A VCs
- **Use of funds:** National sales team, enterprise features, marketplace build
- **Metrics to show:** $300K+ MRR, 5,000+ locations, NRR > 105%, clear path to $1M MRR

---

## Key Revenue Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| SMB churn higher than projected | Slower MRR growth | Medium | Annual contracts, better onboarding, ROI dashboard |
| Google/Apple builds native inventory scanner | Existential | Low | Vertical depth (POS integration, supplier network) cannot be replicated easily |
| OpenAI pricing increases significantly | Margin compression | Low-Medium | Custom ML models as fallback, negotiate enterprise pricing |
| Recession reduces SMB tech spending | Slower acquisition | Medium | Position as cost-saving tool (saves money, not costs money) |
| POS providers (Square/Toast) build their own scanner | Major competitive threat | Medium | Move fast, build data moat, offer multi-POS support (their tools would be single-POS) |
| Slow local sales scaling | Slower growth | Medium | Complement with digital channels, POS marketplace distribution |

---

## Revenue Model Assumptions

| Assumption | Value | Basis |
|-----------|-------|-------|
| Free-to-paid conversion rate | 12% | Industry average for freemium B2B SaaS is 5-15% |
| Average contract duration | 24 months | Based on comparable SMB SaaS (Toast, ServiceTitan) |
| Monthly churn (steady state) | 4.2% | SMB SaaS benchmark: 3-7% |
| Expansion rate | 8% annually | From tier upgrades and additional locations |
| Gross margin | 88% | API costs < $1/user, support costs amortized |
| Sales cycle | 14 days (SMB), 60 days (Enterprise) | Direct sales shortens SMB cycle |
| Payback period | 1.4 months | Low CAC from local sales + high ARPU |

---

*Revenue model built on a simple principle: if StockPulse saves a business $500/month in time and waste, charging $39-99/month is a 5-12x ROI for the customer. That is an easy sell.*
