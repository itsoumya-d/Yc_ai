# ComplianceSnap -- Revenue Model

## Pricing Overview

ComplianceSnap uses a tiered SaaS subscription model priced per facility, with user seats included at each tier. Pricing is designed to align with the value delivered: more facilities and more users means more compliance coverage, more inspections, and more risk reduction.

---

## Pricing Tiers

| Feature                          | Starter            | Professional         | Enterprise            |
| -------------------------------- | ------------------- | -------------------- | --------------------- |
| **Price**                        | **$99/mo**          | **$249/mo**          | **$499/mo+**          |
| **Annual Price**                 | $79/mo (billed $948)| $199/mo (billed $2,388)| Custom              |
| **Facilities**                   | 1                   | Up to 5              | Unlimited             |
| **Users**                        | 5                   | 25                   | Unlimited             |
| **AI Scans/month**               | 200                 | 1,000                | Unlimited             |
| **Inspections/month**            | 50                  | Unlimited            | Unlimited             |
| **Report Generation**            | PDF reports         | PDF + branded reports| PDF + branded + custom|
| **Checklist Templates**          | 10 standard         | 50+ standard + custom| Unlimited + custom    |
| **Regulation Database**          | OSHA core (1910)    | OSHA + ISO + NFPA    | Full library + custom |
| **Corrective Action Tracking**   | Basic               | Full workflow         | Full + SLA tracking   |
| **Analytics**                    | Basic dashboard      | Trend analytics       | Advanced + benchmarking|
| **Photo Evidence Storage**       | 10 GB               | 100 GB               | Unlimited             |
| **Offline Mode**                 | Yes                 | Yes                   | Yes                   |
| **Team Collaboration**           | --                  | Yes                   | Yes + roles/permissions|
| **Multi-Facility Dashboard**     | --                  | Yes                   | Yes                   |
| **Recurring Schedules**          | --                  | Yes                   | Yes                   |
| **EHS System Integration**       | --                  | --                    | Yes (API + webhooks)  |
| **DocuSign Integration**         | --                  | --                    | Yes                   |
| **SSO/SAML Authentication**      | --                  | --                    | Yes                   |
| **Dedicated Support**            | Email (48hr SLA)    | Email + chat (24hr)  | Phone + Slack (4hr)   |
| **Onboarding**                   | Self-serve          | Guided setup call     | Dedicated implementation|
| **Data Retention**               | 1 year              | 3 years              | Custom (up to 30 years)|
| **Audit Export**                 | Basic CSV            | CSV + formatted PDF  | Custom formats + API   |

---

## Pricing Rationale

### Why Per-Facility (Not Per-User)

1. **Aligns with value delivery.** The value of ComplianceSnap scales with facilities inspected, not users logged in. A facility with 1 inspector gets the same compliance benefit as one with 5.
2. **Reduces friction.** Per-user pricing discourages adding team members. We want every safety officer, supervisor, and manager using the app. More users = more inspections = better compliance = stickier product.
3. **Predictable for buyers.** Manufacturing budgets are allocated per facility. "This plant's safety software costs $249/mo" is easier to approve than "we need 15 seats at $30/user."
4. **Competitive differentiation.** SafetyCulture (iAuditor) charges per-user. Our per-facility model with generous user limits is a clear advantage.

### Why These Price Points

| Tier         | Monthly | Annual  | Logic                                                          |
| ------------ | ------- | ------- | -------------------------------------------------------------- |
| Starter $99  | $99     | $948    | Below the threshold for expense report approval at most SMBs   |
| Pro $249     | $249    | $2,388  | Less than a single OSHA consultation visit                     |
| Enterprise $499+| $499+| Custom  | Less than 1/30th the cost of one serious OSHA violation ($15,625)|

The ROI argument is straightforward: **one prevented OSHA citation pays for 13+ months of Professional service.** This makes the value proposition undeniable.

---

## Path to $1M MRR

### The Math

```
$1,000,000 MRR = 2,500 facilities x $400 average revenue per facility

Breakdown by tier:
  500 Starter facilities  x  $99   =   $49,500
  1,500 Professional      x  $249  =  $373,500
  500 Enterprise          x  $499+ =  $577,000 (avg $1,154/facility for multi-facility deals)
                                      ----------
  Total                              $1,000,000 MRR
```

### Timeline to $1M MRR

| Milestone           | Facilities | MRR       | Timeline  |
| ------------------- | ---------- | --------- | --------- |
| Launch               | 0          | $0        | Month 0   |
| First 10 customers   | 15         | $3,000    | Month 3   |
| Product-market fit   | 50         | $12,500   | Month 6   |
| Growth acceleration  | 150        | $45,000   | Month 9   |
| Series A territory   | 250        | $75,000   | Month 12  |
| Scaling              | 750        | $250,000  | Month 18  |
| $1M MRR              | 2,500      | $1,000,000| Month 24  |

### Growth Assumptions

- Month 1-6: 15% MoM facility growth (founder-led sales, 10 facilities/month)
- Month 7-12: 25% MoM growth (first sales hire, inbound marketing kicking in)
- Month 13-18: 30% MoM growth (2 sales reps, trade show pipeline, partnership channel)
- Month 19-24: 25% MoM growth (scaling sales team, enterprise deals closing)

---

## Unit Economics

### Customer Acquisition Cost (CAC)

| Channel                        | CAC         | % of Customers | Notes                             |
| ------------------------------ | ----------- | -------------- | --------------------------------- |
| Organic / Inbound              | $200        | 20%            | SEO, content marketing, referrals |
| LinkedIn / Google Ads          | $800        | 25%            | Targeted EHS professional ads     |
| Trade Shows (ASSP, NSC)        | $1,500      | 20%            | Booth + travel + lead follow-up   |
| Inside Sales (outbound)        | $1,800      | 25%            | SDR + AE cost per closed deal     |
| Channel Partners               | $600        | 10%            | Consultant/insurance referrals    |
| **Blended CAC**                | **$1,200**  | **100%**       |                                   |

### Lifetime Value (LTV)

```
LTV = ARPA x Gross Margin x (1 / Monthly Churn Rate)

Where:
  ARPA (Avg Revenue Per Account) = $400/month
  Gross Margin = 85%
  Monthly Churn Rate = 2.5% (monthly, ~26% annual)

  LTV = $400 x 0.85 x (1 / 0.025)
  LTV = $400 x 0.85 x 40
  LTV = $13,600

At mature churn rate (1.5% monthly / ~17% annual):
  LTV = $400 x 0.85 x 66.7
  LTV = $22,667
```

### LTV:CAC Ratio

| Stage        | LTV      | CAC    | LTV:CAC | Health           |
| ------------ | -------- | ------ | ------- | ---------------- |
| Early (Y1)   | $13,600  | $1,200 | 11.3x   | Excellent        |
| Mature (Y2+) | $22,667  | $1,200 | 18.9x   | Exceptional      |
| Benchmark    | --       | --     | 3x+     | Minimum healthy  |

### CAC Payback Period

```
CAC Payback = CAC / (ARPA x Gross Margin)
            = $1,200 / ($400 x 0.85)
            = $1,200 / $340
            = 3.5 months
```

A 3.5-month payback period is outstanding for B2B SaaS. Most VCs consider <12 months as excellent.

### Gross Margin Breakdown

| Cost Component           | Per Facility/Month | % Revenue |
| ------------------------ | ------------------ | --------- |
| **Revenue (avg)**        | $400.00            | 100%      |
| OpenAI API (AI scans)    | $5.00              | 1.3%      |
| Supabase (database)      | $2.00              | 0.5%      |
| Cloudflare R2 (storage)  | $0.50              | 0.1%      |
| SendGrid (email)         | $0.20              | 0.1%      |
| Google Maps              | $0.05              | 0.0%      |
| Infrastructure (Vercel)  | $0.30              | 0.1%      |
| Customer support (shared)| $12.00             | 3.0%      |
| **Total COGS**           | **$20.05**         | **5.0%**  |
| **Gross Margin**         | **$379.95**        | **95.0%** |

Note: At early stage with lower facility counts, support cost per facility is higher (~$40), bringing gross margin to ~85%. At scale, support cost per facility drops as the team serves more facilities per agent.

---

## Customer Acquisition Strategy

### Channel 1: Manufacturing Trade Shows

**Target events**:
- **ASSP Safety Conference** (American Society of Safety Professionals): 6,000+ attendees, all EHS professionals
- **NSC Congress & Expo** (National Safety Council): 14,000+ attendees, largest safety event
- **IMTS** (International Manufacturing Technology Show): 86,000+ attendees, manufacturing decision-makers
- **FABTECH**: 40,000+ attendees, metalworking and fabrication
- **Pack Expo**: 45,000+ attendees, packaging and processing

**Strategy**:
- Booth with live demo: Set up a mock workstation with intentional violations. Let attendees scan it with ComplianceSnap.
- Speaking sessions: Present on "AI-Powered Safety Inspection" at conference workshops.
- Lead capture: Offer free 30-day trial with on-site setup at their facility.
- Budget: $15,000-$25,000 per show (booth, travel, materials)
- Expected leads per show: 50-100 qualified leads, 10-20 trials, 5-10 paid conversions

### Channel 2: EHS LinkedIn Groups & Content Marketing

**Strategy**:
- Publish weekly content on LinkedIn targeting EHS professionals:
  - "Top 10 OSHA Violations Found by AI This Month" (anonymized, aggregated)
  - "How to Prepare for an OSHA Inspection in 2025"
  - "Paper Checklists vs. AI Inspections: A Side-by-Side Comparison"
  - Video demos of ComplianceSnap detecting hazards in real facilities
- Join and contribute to LinkedIn groups: EHS Daily Advisor, Safety Professionals, OSHA Compliance
- Target: 5,000 LinkedIn followers in 6 months, 500 inbound leads/month by month 12

### Channel 3: OSHA Training Partnerships

**Strategy**:
- Partner with OSHA Training Institute Education Centers (OTI Education Centers)
- Offer ComplianceSnap as a practical tool during OSHA 10/30 courses
- Co-develop "AI-Assisted Inspection" training module
- Reach: 30+ OTI Education Centers, thousands of students annually
- Conversion: Students become ComplianceSnap champions when they return to their companies

### Channel 4: Insurance Carrier Referrals

**Strategy**:
- Partner with workers' compensation insurance carriers
- Carriers recommend ComplianceSnap to policyholders
- Policyholders who use ComplianceSnap get 5-15% premium discount
- ComplianceSnap gets customer acquisition at near-zero CAC
- Carrier gets lower claim rates (better loss ratios)
- Win-win-win structure

**Target carriers**:
- Liberty Mutual (largest workers' comp writer)
- The Hartford
- Travelers
- CNA
- Regional/specialty carriers focused on manufacturing

**Model**:
```
Insurance carrier recommends ComplianceSnap
  -> Manufacturer adopts at $249/mo
  -> Manufacturer gets $500/mo premium reduction (net positive for manufacturer)
  -> Carrier saves $2,000/year in avoided claims (net positive for carrier)
  -> ComplianceSnap gets $249/mo revenue at $0 CAC (net positive for ComplianceSnap)
```

### Channel 5: Outbound Sales (Inside Sales)

**Strategy**:
- SDR (Sales Development Rep) team targets mid-size manufacturers
- Target list: Companies with 50-500 employees in SIC codes for manufacturing
- Outreach: LinkedIn + email sequences referencing industry-specific OSHA data
- Personalization: "Companies in [industry] in [state] received [X] OSHA citations last year. Here's how to prevent them."
- Data source: OSHA inspection data is public -- use it for prospecting intelligence

**Metrics target**:
- 1 SDR: 100 outreach/week, 10 conversations, 3 demos, 1 close
- Ramp: 3 months per SDR
- Cost per SDR: $60,000-$80,000/year base + commission

---

## Target Customer Segments

### Primary: Mid-Size Manufacturers (50-500 employees)

| Attribute               | Detail                                    |
| ----------------------- | ----------------------------------------- |
| Employee count           | 50-500                                    |
| Revenue                  | $10M-$250M                                |
| Facilities               | 1-5                                       |
| Current inspection method| Paper checklists, spreadsheets, photos     |
| Budget for safety tools  | $1,000-$5,000/mo                          |
| Decision maker           | EHS Director or Plant Manager             |
| Sales cycle              | 30-90 days                                |
| Key industries           | Metalworking, plastics, automotive parts, aerospace components, electronics assembly |

### Secondary: Construction Companies (100-1,000 employees)

| Attribute               | Detail                                    |
| ----------------------- | ----------------------------------------- |
| Employee count           | 100-1,000                                 |
| Revenue                  | $25M-$500M                                |
| Facilities               | 5-50 active job sites                     |
| Current inspection method| Paper checklists, general contractor audits|
| Budget for safety tools  | $2,000-$10,000/mo                         |
| Decision maker           | Safety Director or VP of Operations       |
| Sales cycle              | 60-120 days                               |
| Key drivers              | OSHA construction standards (1926), subcontractor compliance, multi-site management |

### Tertiary: Food Processing Plants

| Attribute               | Detail                                    |
| ----------------------- | ----------------------------------------- |
| Employee count           | 100-2,000                                 |
| Revenue                  | $50M-$1B                                  |
| Facilities               | 1-10                                      |
| Current inspection method| Paper checklists, third-party audits       |
| Budget for safety tools  | $2,000-$15,000/mo                         |
| Decision maker           | EHS Manager or Quality Director           |
| Sales cycle              | 60-120 days                               |
| Key drivers              | OSHA + FDA overlap, chemical handling (GHS), PPE for food-contact environments, FSMA compliance |

---

## Churn Analysis

### Expected Churn Rates

| Period      | Monthly Churn | Annual Churn | Driver                                           |
| ----------- | ------------- | ------------ | ------------------------------------------------ |
| Months 1-6  | 4-5%          | 40-50%       | PMF iteration, early adopter attrition           |
| Months 7-12 | 2.5-3%        | 26-31%       | Product improvements, better onboarding          |
| Year 2      | 1.5-2%        | 17-22%       | Strong product, switching costs, habit formation |
| Year 3+     | 1-1.5%        | 12-17%       | Platform lock-in, historical data, integrations  |

### Churn Reasons (Predicted)

| Reason                              | % of Churn | Mitigation                                    |
| ----------------------------------- | ---------- | --------------------------------------------- |
| "We stopped doing inspections"      | 5%         | Recurring schedule reminders, OSHA fine alerts|
| "Too expensive for our budget"      | 20%        | Annual discount, starter tier, ROI calculator |
| "Not enough features"               | 15%        | Roadmap communication, feature request tracking|
| "Switched to competitor"            | 15%        | Competitive monitoring, switching cost moat   |
| "Champion left the company"         | 20%        | Multi-stakeholder onboarding, org-level value |
| "Did not see ROI"                   | 15%        | Usage monitoring, proactive success outreach  |
| "Company closed / downsized"        | 10%        | Not preventable                               |

### Churn Prevention Strategies

1. **Usage monitoring**: Alert CSM when inspection frequency drops below baseline
2. **Onboarding depth**: Ensure 3+ users are active in first 30 days (not just the champion)
3. **Quarterly business reviews**: Show ROI metrics (violations found, estimated fines avoided, compliance score improvement)
4. **Switching cost building**: Historical data, custom checklists, trained team members all increase switching cost
5. **Annual contracts with discount**: 20% discount for annual commitment; locks in revenue and reduces churn window

---

## Expansion Revenue

### Net Revenue Retention (NRR) Target

| Period    | NRR Target | Meaning                                                |
| --------- | ---------- | ------------------------------------------------------ |
| Year 1    | 105%       | Slight expansion exceeding churn                       |
| Year 2    | 115%       | Healthy expansion from upgrades and add-ons            |
| Year 3+   | 120%+      | Strong expansion from multi-facility growth            |

### Expansion Levers

| Lever                           | Revenue Impact | Trigger                                          |
| ------------------------------- | -------------- | ------------------------------------------------ |
| **Tier upgrade (Starter->Pro)** | +$150/mo       | Customer adds 2nd facility or needs team features|
| **Tier upgrade (Pro->Ent)**     | +$250/mo+      | Customer needs SSO, integrations, or >5 facilities|
| **Additional facilities**       | +$99-$499/fac  | Org expands to new plants or job sites           |
| **Additional AI scan packs**    | +$49/500 scans | Heavy scanning users exceed plan limit           |
| **Extended storage**            | +$29/100GB     | Long retention requirements exceed plan storage  |
| **Premium support add-on**      | +$99/mo        | Starter/Pro customers wanting phone support      |
| **Training & certification**    | +$499 one-time | ComplianceSnap Certified Inspector program       |
| **Custom integrations**         | +$2,500 setup  | Enterprise customers needing EHS system integration|
| **Compliance consulting**       | +$199/hr       | Expert review of inspection results (partner-delivered)|

### Expansion Revenue Math

```
Starting: Customer on Professional ($249/mo) with 3 facilities

Month 1:  $249/mo (3 facilities, Professional)
Month 4:  +1 facility -> $249/mo (still within 5-facility limit)
Month 8:  +2 facilities (6 total) -> upgrade to Enterprise -> $499/mo
Month 12: +storage pack ($29) + support add-on ($99) -> $627/mo
Month 18: +3 facilities (9 total) + custom integration -> $627/mo + $2,500 one-time

Revenue growth: 152% increase from $249 to $627/mo without acquiring a new customer
```

---

## Financial Projections

### Year 1 P&L (Monthly, at Month 12)

| Line Item                    | Monthly     | % Revenue |
| ---------------------------- | ----------- | --------- |
| **Revenue (MRR)**            | $75,000     | 100%      |
| COGS (API, hosting, support) | ($11,250)   | 15%       |
| **Gross Profit**             | $63,750     | 85%       |
| Engineering (3 FTEs)         | ($37,500)   | 50%       |
| Sales (1 AE + 1 SDR)        | ($18,333)   | 24%       |
| Marketing                    | ($8,000)    | 11%       |
| G&A                          | ($5,000)    | 7%        |
| **Net Income (Loss)**        | **($5,083)**| **-7%**   |

### Year 2 P&L (Monthly, at Month 24)

| Line Item                    | Monthly     | % Revenue |
| ---------------------------- | ----------- | --------- |
| **Revenue (MRR)**            | $600,000    | 100%      |
| COGS                         | ($60,000)   | 10%       |
| **Gross Profit**             | $540,000    | 90%       |
| Engineering (6 FTEs)         | ($75,000)   | 13%       |
| Sales (3 AEs + 3 SDRs)      | ($55,000)   | 9%        |
| Marketing                    | ($40,000)   | 7%        |
| Customer Success (2 CSMs)    | ($16,667)   | 3%        |
| G&A                          | ($20,000)   | 3%        |
| **Net Income**               | **$333,333**| **56%**   |

### Funding Requirements

| Round      | Amount    | Timeline | Use of Funds                                           |
| ---------- | --------- | -------- | ------------------------------------------------------ |
| Pre-seed   | $500K     | Month 0  | 2 founders + 1 engineer, 6 months to MVP + first 50 customers |
| Seed       | $2.5M     | Month 6  | Scale to 250 facilities, hire sales + engineering      |
| Series A   | $10M      | Month 18 | Scale to 2,500 facilities, enterprise features, partnerships |

---

## Revenue Model Risks

| Risk                                    | Impact | Mitigation                                              |
| --------------------------------------- | ------ | ------------------------------------------------------- |
| OpenAI price increases                  | Medium | Build fallback to Claude Vision / custom models         |
| Competitors copy AI features            | High   | Data moat (more scans = better models), regulation depth|
| Manufacturing downturn reduces budgets  | Medium | Position as cost-saving (fines avoided > subscription)  |
| Long sales cycles delay revenue         | High   | Start with Starter tier (self-serve), consultants, SMBs |
| Enterprise deals take longer than expected | Medium | Build pipeline early; do not depend on large deals for Year 1 |
| Regulation changes (OSHA administration) | Low   | Diversify across OSHA, ISO, NFPA, state regulations    |
| Free alternatives emerge                | Medium | Depth of regulation mapping and offline reliability as moat |

---

## Key Metrics to Track

### Revenue Metrics

| Metric                    | Definition                                     | Target (Month 12) |
| ------------------------- | ---------------------------------------------- | ------------------ |
| MRR                       | Monthly Recurring Revenue                      | $75,000            |
| ARR                       | Annual Recurring Revenue (MRR x 12)            | $900,000           |
| ARPA                      | Average Revenue Per Account                    | $400/mo            |
| Net New MRR               | New MRR - Churned MRR - Contracted MRR        | $10,000+/mo        |
| Expansion MRR             | Revenue from upgrades and add-ons              | $5,000/mo          |
| Churned MRR               | Revenue lost from cancellations                | <$2,500/mo         |

### Unit Economics Metrics

| Metric                    | Definition                                     | Target             |
| ------------------------- | ---------------------------------------------- | ------------------ |
| CAC                       | Customer Acquisition Cost                      | <$1,500            |
| LTV                       | Lifetime Value                                 | >$12,000           |
| LTV:CAC                   | Ratio of lifetime value to acquisition cost    | >8x               |
| CAC Payback               | Months to recover acquisition cost             | <4 months          |
| Gross Margin              | (Revenue - COGS) / Revenue                     | >82%               |

### Product Metrics (Leading Indicators of Revenue)

| Metric                    | Definition                                     | Target (Month 12) |
| ------------------------- | ---------------------------------------------- | ------------------ |
| Paying Facilities         | Facilities on paid plans                       | 250                |
| Weekly Active Users       | Users completing at least 1 action/week        | 500+               |
| Inspections/Facility/Month| Average inspections per facility per month     | 4+                 |
| AI Scans/Inspection       | Average photos analyzed per inspection         | 10+                |
| Report Generation Rate    | % of inspections that generate a PDF report    | >80%               |
| Corrective Action Close Rate | % of violations with completed corrective action | >70%          |
| Time to First Inspection  | Days from signup to first completed inspection | <3 days            |
| Feature Adoption (offline)| % of inspections conducted offline             | 30-50%             |

---

## Competitive Pricing Comparison

| Feature              | ComplianceSnap Pro | SafetyCulture | KPA       | VelocityEHS |
| -------------------- | ------------------ | ------------- | --------- | ----------- |
| Price                | $249/mo            | $24/user/mo   | Custom    | Custom      |
| Users included       | 25                 | 1             | Custom    | Custom      |
| Cost for 10 users    | $249               | $240          | ~$500+    | ~$800+      |
| Cost for 25 users    | $249               | $600          | ~$1,200+  | ~$2,000+    |
| AI hazard detection  | Yes                | No            | No        | No          |
| Offline mode         | Yes                | Yes           | Limited   | No          |
| Regulation mapping   | Automatic          | Manual        | Manual    | Manual      |
| Mobile-first         | Yes                | Yes           | No        | No          |

At 25 users, ComplianceSnap Professional is **58% cheaper** than SafetyCulture and **75%+ cheaper** than enterprise alternatives -- while offering AI capabilities none of them have.

---

*Revenue model last updated: February 2026. All projections are estimates based on market research and comparable company benchmarks.*
