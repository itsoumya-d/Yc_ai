# Revenue Model

SiteSync charges per active construction site per month -- a pricing model that aligns perfectly with how construction firms think about costs (per-project) and scales naturally as customers grow. The economics are exceptional: high willingness to pay (saving $1,980/month in labor per site), low churn dynamics (projects create switching costs), and a clear path from $0 to $1M MRR.

---

## Pricing Tiers

### Starter — $49/site/month

**Target:** Solo contractors, small remodels, residential projects under $500K.

| Feature | Included |
|---------|----------|
| Users per site | 1 |
| Daily AI progress reports | Yes |
| Photos per month | 500 |
| Photo capture with GPS tagging | Yes |
| Floor plan overlay | Yes |
| PDF report export | Yes |
| Email report delivery | Yes |
| Safety violation detection | No |
| Timeline tracking | No |
| Team photo feed | No |
| API access | No |
| Support | Email (48hr response) |

**Why $49:** Low enough that a solo contractor does not need approval to expense it. The $49 price point is an impulse purchase for anyone who has ever spent 2 hours typing a progress report. Even at $49, the ROI is immediate: a contractor billing $75/hour saves $150/day in report-writing time -- paying for the entire month in a single day.

---

### Professional — $149/site/month (Most Popular)

**Target:** Mid-size general contractors, commercial projects, firms with 10-50 employees, projects $1M-$20M.

| Feature | Included |
|---------|----------|
| Users per site | 5 |
| Daily AI progress reports | Yes |
| Photos per month | Unlimited |
| Photo capture with GPS tagging | Yes |
| Floor plan overlay | Yes |
| PDF report export | Yes |
| Email report delivery | Yes |
| Safety violation detection | Yes |
| Timeline tracking | Yes |
| Team photo feed | Yes |
| Weekly summary reports | Yes |
| Photo comparison (date-over-date) | Yes |
| Scheduled report delivery | Yes |
| API access | No |
| Support | Email (24hr) + phone |

**Why $149:** This is the sweet spot for mid-size GCs. A PM managing a $5M project has a documentation budget implicit in their overhead. $149/month is trivial compared to a $50K Procore license. The safety detection feature alone justifies the price -- a single OSHA citation avoided (average $15,625 for serious violations) pays for 8+ years of SiteSync.

---

### Enterprise — $399/site/month

**Target:** Large construction firms, multi-site portfolios, projects $20M-$50M+, firms with 50-200 employees.

| Feature | Included |
|---------|----------|
| Users per site | Unlimited |
| Daily AI progress reports | Yes |
| Photos per month | Unlimited |
| Photo capture with GPS tagging | Yes |
| Floor plan overlay | Yes |
| PDF report export | Yes |
| Email report delivery | Yes |
| Safety violation detection | Yes |
| Timeline tracking | Yes |
| Team photo feed | Yes |
| Weekly summary reports | Yes |
| Photo comparison (date-over-date) | Yes |
| Scheduled report delivery | Yes |
| Custom report templates | Yes |
| API integrations | Yes |
| Multi-site dashboard | Yes |
| SSO authentication | Yes |
| Priority support | Yes (dedicated rep) |
| Custom onboarding | Yes |
| Data export | Full data portability |
| SLA | 99.9% uptime guarantee |

**Why $399:** Enterprise firms manage 10-50+ concurrent sites. At $399/site, a 20-site portfolio costs $7,980/month -- still 85% cheaper than Procore ($50K+/year) with superior field-level functionality. The unlimited users feature is critical: large projects may have 15-20 people who need to contribute photos or view reports.

---

## Unit Economics

### Core Metrics

| Metric | Value | Derivation |
|--------|-------|------------|
| **ARPU** | $199/site/month | Blended across tiers (40% Starter, 40% Professional, 20% Enterprise) |
| **Monthly Churn** | 3.0% | Projects end but company accounts persist for next projects |
| **Customer Lifetime** | 33 months | 1 / 0.03 = 33 months |
| **LTV** | $7,164 | $199 ARPU x 33 months + account expansion over time |
| **CAC** | $400 | Blended across trade shows, direct outreach, and referrals |
| **LTV:CAC** | 17.9:1 | $7,164 / $400 |
| **Payback Period** | 2.0 months | $400 CAC / $199 ARPU |
| **Gross Margin** | 83% | $199 revenue - $33 API/infra costs |

### ARPU Breakdown

| Tier | Monthly Price | Mix % | Weighted ARPU |
|------|-------------|-------|---------------|
| Starter | $49 | 40% | $19.60 |
| Professional | $149 | 40% | $59.60 |
| Enterprise | $399 | 20% | $79.80 |
| **Blended** | | **100%** | **$159.00** |

*Note: The $199 ARPU target assumes tier mix shifts toward Professional and Enterprise over time as the product matures and sales team focuses on larger accounts. Initial ARPU may be closer to $159, growing to $199+ by Month 12.*

### Churn Analysis

Construction churn has a unique dynamic: individual projects end (creating natural churn events), but construction firms continuously start new projects (creating natural re-engagement).

**Churn drivers:**
- Project completion (12-18 month projects ending)
- Seasonal slowdowns (winter in northern climates)
- Company dissatisfaction (poor product-market fit)
- Budget cuts (economic downturns)

**Churn mitigation:**
- **Multi-site pricing** incentivizes adding new projects to the same account
- **Historical data value** -- years of project documentation creates switching costs
- **Template customization** -- invested time in report templates locks in users
- **Team familiarity** -- once a crew learns SiteSync, they resist switching
- **Annual contracts** with discount (10% off) reduce monthly churn measurement

**Churn rate of 3% monthly is conservative for B2B SaaS with:**
- Clear daily value delivery (reports generated every day)
- High switching costs (losing photo history, rebuilding templates)
- Low price relative to value ($149/month vs. $1,980/month in saved labor)

---

## Path to $1M MRR

### Milestone Table

| Milestone | Sites Needed | Revenue | Timeline |
|-----------|-------------|---------|----------|
| $10K MRR | 50 sites | $10,000 | Month 3-4 |
| $25K MRR | 126 sites | $25,000 | Month 5-6 |
| $50K MRR | 251 sites | $50,000 | Month 7-9 |
| $100K MRR | 503 sites | $100,000 | Month 10-12 |
| $250K MRR | 1,256 sites | $250,000 | Month 13-15 |
| $500K MRR | 2,513 sites | $500,000 | Month 15-17 |
| **$1M MRR** | **5,025 sites** | **$1,000,000** | **Month 17-18** |

### Growth Timeline

#### Q1: Foundation (Months 1-3)

**Goal: 50 active sites, $10K MRR**

| Activity | Expected Sites |
|----------|---------------|
| Founder's personal network in construction | 10-15 |
| Direct outreach to local GCs | 15-20 |
| First trade show (regional AGC event) | 10-15 |
| Referrals from early users | 5-10 |
| **Total** | **40-60** |

**Key Actions:**
- Launch MVP with core photo capture and AI reports
- Personal demos on active job sites (founder drives to sites)
- Offer first 10 customers founding member pricing ($99/site for life)
- Collect testimonials and before/after case studies
- Establish 30-day free trial with no credit card required

**Unit Economics at This Stage:**
- Revenue: ~$10K/month
- API costs: ~$1.7K/month
- Gross profit: ~$8.3K/month
- CAC: ~$600 (higher due to small scale, founder time)

---

#### Q2: Traction (Months 4-6)

**Goal: 250 active sites, $50K MRR**

| Activity | New Sites/Month |
|----------|----------------|
| World of Concrete / NAHB IBS attendance | 50+ leads, 20 conversions |
| Expanded direct outreach (hire SDR) | 25-30/month |
| Referral program launch (1 free month per referral) | 15-20/month |
| Content marketing (construction blog, LinkedIn) | 5-10/month |
| **Monthly growth rate** | **~65-80 new sites** |

**Key Actions:**
- Attend World of Concrete (January) and/or NAHB IBS (February)
- Hire first sales development representative (SDR)
- Launch referral program with monetary incentives
- Publish case studies with ROI data from Q1 customers
- Introduce Professional tier with safety detection
- Begin collecting safety violation detection accuracy data

---

#### Q3: Acceleration (Months 7-9)

**Goal: 500 active sites, $100K MRR**

| Activity | New Sites/Month |
|----------|----------------|
| Expanded trade show circuit (3-4 shows/quarter) | 40-60 |
| SDR team (2-3 reps) cold outreach | 50-80 |
| Inbound from content + referrals | 30-40 |
| Material supplier partnerships | 10-20 |
| **Monthly growth rate** | **~130-200 new sites** |

**Key Actions:**
- Hire 2 additional SDRs focused on specific regions
- Launch material supplier partnership program
- Begin Enterprise tier with dedicated onboarding
- Attend CONEXPO-CON/AGG if timing aligns
- Develop construction publication advertising
- Introduce annual contract option with 10% discount

---

#### Q4: Scale (Months 10-12)

**Goal: 1,000 active sites, $200K MRR**

| Activity | New Sites/Month |
|----------|----------------|
| Sales team (5+ reps) covering major metros | 100-150 |
| Partner channel (suppliers, associations) | 30-50 |
| Inbound marketing + referrals | 50-80 |
| Enterprise deals (multi-site) | 20-40 |
| **Monthly growth rate** | **~200-320 new sites** |

**Key Actions:**
- Expand sales team to cover top 10 US construction metros
- Launch Enterprise multi-site discount program
- Develop integrations with popular construction PM tools
- Consider Series A fundraise for accelerated growth
- Begin geographic expansion planning (Canada, UK, Australia)

---

#### Q5-Q6: Scaling to $1M MRR (Months 13-18)

**Goal: 5,025 active sites, $1M MRR**

| Channel | Monthly New Sites |
|---------|------------------|
| Direct sales team (10+ reps) | 200-300 |
| Partner channels | 100-150 |
| Inbound + self-serve | 100-200 |
| Enterprise expansion (existing accounts) | 50-100 |
| **Monthly growth rate** | **~450-750 new sites** |

**Key Actions:**
- Scale sales team to 10-15 reps across major US markets
- Launch self-serve onboarding for Starter tier (reduce CAC)
- Develop API integrations ecosystem
- Expand to adjacent verticals (infrastructure, utilities, mining)
- Geographic expansion to Canada, UK, Australia
- Consider raising Series A/B for aggressive scaling

---

## Trial-to-Paid Conversion

### Target: 30% Conversion Rate

**Why 30% is achievable:**

1. **Immediate value**: Unlike many SaaS products where value compounds over time, SiteSync delivers measurable value on Day 1 -- the first AI-generated report saves 2 hours of paperwork
2. **Quantifiable ROI**: A foreman earning $45/hour who saves 2 hours/day generates $90/day in savings. At $149/month, the ROI is 13:1 -- easy to justify to any manager
3. **Behavioral lock-in during trial**: 14 days of photos create a historical record that has value even beyond the trial. Users are reluctant to lose that documentation
4. **Team adoption**: Once multiple crew members are contributing photos, the network effect makes cancellation difficult -- "we can't go back to the old way"

### Conversion Funnel

```
100 trial signups
 ├── 85 complete onboarding (site setup + first photo)     85%
 ├── 70 take photos for 3+ days                            70%
 ├── 55 generate at least one AI report                    55%
 ├── 45 send report to a stakeholder                       45%
 └── 30 convert to paid                                    30%
```

### Conversion Optimization Tactics

| Tactic | Impact |
|--------|--------|
| **Day 1 value**: First AI report generated within 30 minutes of signup | High |
| **In-app activation prompts**: Guide user through first walk-through | High |
| **Trial extension**: Offer 7-day extension if user requests (shows intent) | Medium |
| **Sales-assisted conversion**: SDR call on Day 10 for Professional/Enterprise trials | High |
| **Social proof in-app**: "Join 500+ construction firms using SiteSync" | Medium |
| **Downgrade option**: Offer Starter tier if Professional trial does not convert | Medium |
| **Team activation**: Prompt to invite team by Day 3 (multi-user increases stickiness) | High |

---

## Customer Acquisition Cost (CAC)

### Blended CAC: $400

| Channel | CAC | Mix % | Weighted CAC |
|---------|-----|-------|-------------|
| Trade shows | $600 | 25% | $150 |
| Direct outreach (SDR) | $500 | 30% | $150 |
| Referrals | $100 | 20% | $20 |
| Inbound/content marketing | $200 | 15% | $30 |
| Partner channels | $350 | 10% | $35 |
| **Blended** | | **100%** | **$385 (~$400)** |

### CAC Breakdown by Channel

#### Trade Shows: $600 CAC

```
Typical Trade Show Budget (Major Show):
  Booth rental:           $5,000
  Travel (2 people):      $3,000
  Materials/swag:         $2,000
  Total:                  $10,000

  Qualified leads:        200
  Trial conversions:      60 (30%)
  Paid conversions:       18 (30% of trials)

  CAC = $10,000 / 18 = ~$556
```

Trade shows have the highest absolute CAC but also the highest quality leads -- construction professionals who physically walked up to the booth and watched a demo.

#### Direct Outreach (SDR): $500 CAC

```
SDR Fully Loaded Cost:     $6,000/month
  (salary + benefits + tools)

  Outreach/month:          300 contacts
  Demo scheduled:          30 (10%)
  Trial started:           20 (67%)
  Paid conversion:         12 (60%)

  CAC = $6,000 / 12 = $500
```

SDR-driven outreach has high conversion rates because the SDR qualifies leads before demo. LinkedIn outreach to construction PMs and superintendents is the primary channel.

#### Referrals: $100 CAC

```
Referral Incentive:        $50 credit (referring user)
  + Free month:            $199 value (but $33 cost)

  Referral cost:           $83/referral
  Conversion rate:         70% (warm referral)

  CAC = $83 / 0.70 = ~$119 (rounded to $100)
```

Referrals have the lowest CAC because the trust is pre-established. Construction is a relationship-driven industry where word-of-mouth is the dominant purchase driver.

#### Inbound/Content Marketing: $200 CAC

```
Monthly Content Budget:    $3,000
  (blog posts, social media, SEO)

  Monthly inbound leads:   50
  Trial conversions:       25 (50%)
  Paid conversions:        15 (60%)

  CAC = $3,000 / 15 = $200
```

Content marketing focuses on construction documentation pain points, OSHA compliance tips, and project management efficiency -- topics construction professionals actively search for.

---

## Lifetime Value (LTV)

### LTV: $7,164

```
LTV = ARPU x Customer Lifetime x Gross Margin Adjusted
LTV = $199/month x 33 months x 1.09 (expansion factor)
LTV = $199 x 33 x 1.09
LTV = $7,164
```

### LTV Components

| Component | Value | Notes |
|-----------|-------|-------|
| Base ARPU | $199/month | Blended across tiers |
| Customer lifetime | 33 months | 1 / 3% monthly churn |
| Expansion revenue | +9% | Tier upgrades + additional sites |
| Gross margin | 83% | After API and infrastructure costs |
| **Gross-margin-adjusted LTV** | **$5,946** | $7,164 x 0.83 |

### Expansion Revenue Drivers

1. **Additional sites**: As a construction firm starts new projects, they add sites to their SiteSync account. A 10-site firm that adds 2 sites/year grows revenue 20% annually without any sales effort.

2. **Tier upgrades**: Users who start on Starter ($49) discover they want safety detection and timeline tracking, upgrading to Professional ($149). This is a 3x revenue increase per site.

3. **User expansion**: Construction firms hire seasonal workers and subcontractors. As more people need access, firms upgrade from Professional (5 users) to Enterprise (unlimited users).

4. **Feature upsells (future)**: Premium features like drone integration, BIM comparison, and insurance documentation create additional revenue opportunities within existing accounts.

---

## LTV:CAC Analysis

| Metric | Value | Benchmark | Rating |
|--------|-------|-----------|--------|
| **LTV:CAC** | 17.9:1 | 3:1 minimum, 5:1+ good | Excellent |
| **Payback Period** | 2.0 months | Under 12 months | Excellent |
| **CAC Recovery** | Month 2 | Within first quarter | Excellent |
| **Gross Margin** | 83% | 70%+ for SaaS | Strong |
| **Net Revenue Retention** | 109% | 100%+ means expansion > churn | Good |

**Why LTV:CAC is so high:**
1. Low CAC ($400) because construction professionals buy through trust and relationship, not expensive digital advertising
2. High ARPU ($199) because B2B construction buyers value time savings highly
3. Long lifetime (33 months) because switching costs are high and projects create natural continuity
4. Expansion revenue because firms add sites as they start new projects

---

## Revenue Channels

### Primary Channels

#### 1. Construction Trade Shows (25% of new customers)

**Strategy:** Demo SiteSync live on a real construction project. Let foremen hold the phone, take a test photo, and see the AI analysis in real-time. The "aha moment" is watching the AI generate a report paragraph from a single photo.

**Key Shows:**
- World of Concrete (January, Las Vegas) -- 60,000+ attendees
- NAHB International Builders' Show (February) -- 75,000+ attendees
- CONEXPO-CON/AGG (March, triennial, Las Vegas) -- 130,000+ attendees
- Regional AGC chapter events (year-round) -- 500-2,000 attendees each

**Cost Per Show:** $5K-15K (booth, travel, materials)
**Expected Qualified Leads:** 150-500 per major show
**Follow-Up:** SMS within 24 hours (not email -- construction workers check SMS, not email)

#### 2. Direct GC Outreach (30% of new customers)

**Strategy:** LinkedIn and cold outreach to PMs, superintendents, and safety managers at construction firms with 10-200 employees.

**Tactics:**
- LinkedIn Sales Navigator targeting construction job titles
- Company research identifying firms with active projects
- Personalized outreach referencing their specific project types
- Offer 14-day trial with free onboarding call
- Follow up by phone (construction professionals prefer phone to email)

**SDR Playbook:**
1. Identify target company (AGC member directory, ENR Top Lists, local permit filings)
2. Find PM or superintendent on LinkedIn
3. Send personalized connection request referencing their project type
4. Follow up with value proposition message (lead with time savings, not features)
5. Schedule 15-minute phone demo
6. After demo, set up trial with hands-on onboarding

#### 3. Word-of-Mouth / Referrals (20% of new customers)

**Strategy:** Construction is a tight-knit industry. A foreman who loves SiteSync will tell every other foreman they know. Formalize this with a referral program.

**Referral Program:**
- Referring user gets $50 credit toward their subscription
- New user gets an extended 21-day trial (instead of 14)
- Both parties get recognition in-app
- Top referrers get featured in quarterly newsletter

#### 4. Inbound / Content Marketing (15% of new customers)

**Content Strategy:**
- Blog posts targeting construction documentation pain points
- "How to write a daily progress report" (SEO for existing pain)
- "OSHA's Top 10 most cited violations" guides
- Case studies with ROI data from real customers
- LinkedIn thought leadership from founder
- YouTube demos of SiteSync workflow (visual medium for visual product)

#### 5. Partner Channels (10% of new customers)

**Material Supplier Partnerships:**
- 84 Lumber, ABC Supply, Ferguson -- they sell to every GC in their territory
- Co-marketing: SiteSync flyer included with material deliveries
- Bundle pricing: discounted subscription for supplier's top accounts
- Integration: material delivery tracking linked to supplier systems

**Construction Software Partnerships:**
- Integration with Procore, Buildertrend, CoConstruct for data sharing
- Listed in partner marketplaces
- Co-selling with complementary tools

**Industry Association Partnerships:**
- AGC (Associated General Contractors) chapter sponsorships
- NAHB (National Association of Home Builders) member benefits
- ABC (Associated Builders and Contractors) preferred vendor

---

## Target Customer Profile

### Ideal Customer

| Attribute | Target |
|-----------|--------|
| **Company Size** | 10-200 employees |
| **Project Size** | $1M - $50M |
| **Project Type** | Commercial construction, multi-family residential, institutional |
| **Geography** | US initially, then Canada, UK, Australia |
| **Decision Maker** | VP of Operations, Senior PM, Superintendent |
| **Primary User** | Foreman, Assistant Superintendent |
| **Pain Level** | Currently spending 1-3 hours/day on manual documentation |
| **Technology Comfort** | Moderate -- uses smartphone daily, some app experience |
| **Buying Process** | 1-2 week trial evaluation, PM or superintendent decision, VP approval for company-wide rollout |

### Customer Segments

#### Segment 1: Mid-Size Commercial GCs (Primary)

- 20-100 employees
- 3-10 active projects simultaneously
- $5M-$30M average project size
- Professional and Enterprise tier
- 5-15 sites per account
- Decision maker: VP Operations or Senior PM
- **Why they buy:** Time savings, professional reports, safety compliance

#### Segment 2: Residential Builders (Secondary)

- 10-50 employees
- 5-20 active projects simultaneously
- $500K-$5M average project size
- Starter and Professional tier
- 5-20 sites per account
- Decision maker: Owner or General Superintendent
- **Why they buy:** Documentation for clients, warranty protection, efficiency

#### Segment 3: Specialty Contractors (Tertiary)

- 10-100 employees
- Focused on specific trades (electrical, mechanical, concrete)
- Subcontract under GCs
- Starter and Professional tier
- 3-10 sites per account
- Decision maker: Project Manager or Foreman
- **Why they buy:** Daily logs required by GC, progress documentation for billing

#### Segment 4: Large ENR-Ranked GCs (Enterprise, Year 2+)

- 200-5,000+ employees
- 20-100+ active projects
- $50M-$500M+ average project size
- Enterprise tier with custom pricing
- 20-100+ sites per account
- Decision maker: VP of Innovation, CTO, VP Operations
- **Why they buy:** Standardized documentation, safety program, portfolio visibility

---

## Expansion Revenue Strategy

### Year 1-2: Core Platform

```
Photo Documentation + AI Reports
├── Starter ($49/site/month)
├── Professional ($149/site/month)
└── Enterprise ($399/site/month)

Revenue Target: $1M MRR (5,025 sites)
```

### Year 2-3: Safety Compliance Platform

```
Safety compliance becomes a standalone value proposition:
├── Safety-specific subscription add-on ($50/site/month)
├── OSHA documentation packages
├── Safety training integration
├── Insurance compliance reporting
├── Incident documentation and tracking

Revenue Impact: +15% ARPU increase ($199 → $229)
```

### Year 3-4: Insurance Documentation

```
Construction insurance is a massive market:
├── Builder's risk documentation
├── Progress-based valuation reports for lenders
├── Damage documentation packages
├── Warranty and latent defect records
├── Subcontractor COI tracking

Revenue Impact: +20% ARPU or separate product ($99/site/month add-on)
```

### Year 4-5: Building Inspection Automation

```
Municipal permit and inspection integration:
├── Pre-inspection readiness checklists
├── Inspection scheduling and documentation
├── Code compliance verification from photos
├── Certificate of occupancy preparation
├── Multi-jurisdiction compliance

Revenue Impact: New revenue stream targeting municipalities ($50K-200K/year per city)
```

### Year 5+: Construction Intelligence Platform

```
Full platform play:
├── All documentation and compliance features
├── Predictive project analytics
├── Cross-project benchmarking
├── Industry intelligence reports
├── Marketplace for construction services

Revenue Target: $100M+ ARR, $1B+ valuation path
```

---

## Financial Projections Summary

### Month-by-Month (Year 1)

| Month | New Sites | Total Sites | MRR | Cumulative Revenue |
|-------|-----------|-------------|-----|-------------------|
| 1 | 10 | 10 | $1,990 | $1,990 |
| 2 | 15 | 25 | $4,975 | $6,965 |
| 3 | 25 | 49 | $9,751 | $16,716 |
| 4 | 35 | 82 | $16,318 | $33,034 |
| 5 | 50 | 129 | $25,671 | $58,705 |
| 6 | 65 | 190 | $37,810 | $96,515 |
| 7 | 80 | 264 | $52,536 | $149,051 |
| 8 | 100 | 356 | $70,844 | $219,895 |
| 9 | 120 | 465 | $92,535 | $312,430 |
| 10 | 150 | 601 | $119,599 | $432,029 |
| 11 | 180 | 763 | $151,837 | $583,866 |
| 12 | 210 | 951 | $189,249 | $773,115 |

*Assumes 3% monthly churn applied to existing base, ARPU of $199*

### Year 1 Summary

| Metric | Value |
|--------|-------|
| **Total Sites (end of Year 1)** | ~950 |
| **MRR (end of Year 1)** | ~$189K |
| **ARR Run Rate (end of Year 1)** | ~$2.3M |
| **Total Year 1 Revenue** | ~$773K |
| **Total Year 1 API Costs** | ~$130K |
| **Gross Profit** | ~$643K |
| **Gross Margin** | 83% |

### Path to $1M MRR (Month 17-18)

Continuing the growth trajectory with accelerating site additions from expanded sales team and partner channels:

| Month | Total Sites | MRR |
|-------|-------------|-----|
| 13 | 1,200 | $238K |
| 14 | 1,500 | $298K |
| 15 | 2,000 | $398K |
| 16 | 2,800 | $557K |
| 17 | 3,800 | $756K |
| **18** | **5,025** | **$1,000K** |

---

## Key Assumptions and Risks

### Assumptions

| Assumption | Value | Sensitivity |
|------------|-------|-------------|
| Trial-to-paid conversion | 30% | High -- every 5% change = $33K MRR impact at scale |
| Monthly churn | 3% | High -- every 1% change = significant LTV impact |
| ARPU | $199 | Medium -- tier mix could shift lower initially |
| AI report quality | Good enough to send without heavy editing | Critical -- if reports need 30+ min editing, value prop weakens |
| Safety detection accuracy | 85%+ precision | Medium -- too many false positives erode trust |
| CAC | $400 | Low -- construction relationships provide predictable channels |

### Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OpenAI raises Vision API prices | Margin compression | Medium | Build Gemini fallback, negotiate volume pricing |
| Procore launches AI features | Competitive pressure | High | Move faster, field-first UX advantage, lower price point |
| Construction downturn | Reduced new sites | Medium | Counter-cyclical: documentation more valuable during disputes |
| AI accuracy insufficient | Product-market fit failure | Low | Extensive prompt testing, human-in-the-loop editing |
| Slow adoption by field workers | Growth below projections | Medium | Extreme UX simplicity, SDR-led onboarding, foreman champion program |
| Data privacy/security breach | Reputation damage, churn | Low | SOC2 compliance, encrypted storage, RLS policies, regular audits |

---

## Fundraising Milestones

| Round | Timing | Amount | Valuation | Use of Funds |
|-------|--------|--------|-----------|--------------|
| **Pre-seed** | Month 0 | $500K | $5M | MVP development, founder salaries, first trade show |
| **Seed** | Month 6-8 | $2-3M | $15-20M | Sales team (5 reps), marketing, product expansion |
| **Series A** | Month 14-18 | $10-15M | $75-100M | Scale sales to 15+ reps, geographic expansion, platform features |
| **Series B** | Month 24-30 | $30-50M | $250-400M | International expansion, adjacent markets, enterprise features |

*Valuations based on 10-15x ARR multiple for high-growth vertical SaaS in construction tech.*
