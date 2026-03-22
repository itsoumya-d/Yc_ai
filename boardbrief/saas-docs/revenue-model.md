# BoardBrief — Revenue Model

## Pricing Strategy

### Pricing Philosophy

BoardBrief uses a **value-based tiered pricing** model designed around startup stage and governance complexity. The pricing reflects three realities:

1. **Board governance is mandatory** — Once a startup has a board, it must hold meetings, maintain records, and pass resolutions. This is not optional software. This drives extremely low churn.
2. **Founders will pay for time savings** — Board prep takes 30+ hours per quarter. At a founder's opportunity cost, even $499/mo is trivial if it saves 20+ hours.
3. **Governance complexity scales with company stage** — Seed companies need basic decks and minutes. Series B+ companies need resolutions, compliance tracking, and multi-entity support. Pricing tiers map to this progression.

---

## Pricing Tiers

### Seed Plan — $99/month ($1,188/year)

**Target:** Pre-seed to Seed stage startups with 1-3 board members and basic governance needs.

| Feature | Included |
|---|---|
| **Board limit** | 1 board |
| **Board members** | Up to 5 members |
| **Board deck generator** | Basic templates (Seed stage), manual data entry + CSV upload |
| **AI deck generation** | Not included (manual deck builder only) |
| **Integration connections** | 2 integrations (Stripe + QuickBooks) |
| **Meeting management** | Scheduler, agenda builder, reminders |
| **AI meeting minutes** | 2 meetings/month (Whisper + GPT-4o) |
| **Document portal** | 5GB storage, basic access controls |
| **Resolutions** | Not included |
| **Action items** | Basic tracking (no carry-forward) |
| **Investor updates** | Not included |
| **Support** | Email support, 48-hour response |
| **Security** | Magic link auth, standard encryption |

**Why $99/mo:** Accessible for bootstrapped and pre-seed startups. Low enough that it fits within typical startup tool budgets ($100-300/mo for back-office tools). High enough to signal quality and filter out non-serious users.

---

### Growth Plan — $249/month ($2,988/year)

**Target:** Series A to Series B startups with 3-5 board members and growing governance needs.

| Feature | Included |
|---|---|
| **Board limit** | 1 board + 2 committees |
| **Board members** | Up to 10 members (directors + observers) |
| **Board deck generator** | Advanced templates (Series A/B), all slide types |
| **AI deck generation** | Full AI generation from connected tools |
| **Integration connections** | All integrations (Stripe, QuickBooks, HubSpot/Salesforce, Gusto/Rippling) |
| **Meeting management** | Full suite including live meeting room |
| **AI meeting minutes** | Unlimited meetings |
| **Document portal** | 25GB storage, version control, watermarking |
| **Resolutions** | Full resolution management, digital voting |
| **Action items** | Cross-meeting tracking, carry-forward, reporting |
| **Investor updates** | AI-generated updates, distribution list, tracking |
| **Support** | Priority email + chat support, 24-hour response |
| **Security** | Magic link + MFA, advanced encryption |

**Why $249/mo:** This is where the core AI value lives — auto-generated board decks from connected tools. Series A+ companies have the budget and the need. The jump from $99 to $249 is justified by AI deck generation and resolution management, which are the two most time-saving features.

---

### Enterprise Plan — $499/month ($5,988/year)

**Target:** Series B to Series C+ startups with 5-7+ board members, multiple entities, and formal governance requirements.

| Feature | Included |
|---|---|
| **Board limit** | Unlimited boards and committees |
| **Board members** | Unlimited members |
| **Board deck generator** | All templates + custom templates |
| **AI deck generation** | Full AI generation + custom AI training on company context |
| **Integration connections** | All integrations + custom API connectors |
| **Meeting management** | Full suite + recurring meeting series |
| **AI meeting minutes** | Unlimited meetings + speaker diarization |
| **Document portal** | 100GB storage, version control, watermarking, retention policies |
| **Resolutions** | Full suite + consent resolutions + DocuSign integration |
| **Action items** | Full suite + cross-board tracking |
| **Investor updates** | Full suite + scheduled sends + analytics |
| **Compliance** | Filing tracker, D&O insurance reminders, compliance calendar |
| **Analytics** | Board effectiveness analytics, meeting metrics, governance scoring |
| **Multi-entity** | Multiple legal entities, consolidated reporting |
| **Support** | Dedicated account manager, 4-hour response, onboarding assistance |
| **Security** | SSO (SAML 2.0), IP allowlisting, enhanced audit logging |

**Why $499/mo:** Enterprise-grade governance features (compliance, SSO, multi-entity) at a fraction of what incumbents charge (Diligent: $10K+/yr, OnBoard: $5K+/yr). Positions BoardBrief as the "Carta for board meetings" — startup-friendly pricing for enterprise-grade capabilities.

---

## Path to $1M MRR

### Target Mix

| Plan | MRR Target | Customers Needed | Price/Mo | Segment MRR |
|---|---|---|---|---|
| **Seed** | $148,500 | 1,500 | $99 | $148,500 |
| **Growth** | $498,000 | 2,000 | $249 | $498,000 |
| **Enterprise** | $249,500 | 500 | $499 | $249,500 |
| **Total** | **$1,000,000** | **4,000** | | **$1,000,000** |

### Revenue Composition at $1M MRR

```
Seed Plan:      ████████░░░░░░░░░░░░░░░░░  14.9%    ($148.5K)
Growth Plan:    ████████████████████████░░  49.8%    ($498.0K)
Enterprise:     ██████████████░░░░░░░░░░░  24.9%    ($249.5K)
Add-ons:        ██████░░░░░░░░░░░░░░░░░░░  10.4%    ($104.0K)
```

**Add-on revenue sources (10.4% of MRR at scale):**
- Additional entity management: $99/entity/mo
- Public company compliance module: $299/mo add-on
- Advanced analytics and board scoring: $49/mo add-on
- Custom integrations: $199/mo add-on
- White-label portal for VC firms: $999/mo

---

## Unit Economics

### Customer Acquisition Cost (CAC)

| Channel | CAC | % of Acquisitions | Blended Contribution |
|---|---|---|---|
| **VC firm referrals** | $150 | 30% | $45 |
| **Law firm partnerships** | $200 | 15% | $30 |
| **Content marketing / SEO** | $250 | 20% | $50 |
| **Founder community referrals** | $100 | 15% | $15 |
| **Product-led growth** | $300 | 10% | $30 |
| **Paid acquisition (LinkedIn, Google)** | $800 | 10% | $80 |
| **Blended CAC** | | **100%** | **$350** |

**Why CAC is low ($350):** Board governance is a referral-heavy category. VC firms recommend tools to all portfolio companies (one partnership = 20-50 leads). Law firms recommend tools during corporate formation. Board members who use BoardBrief at one company request it at others. These organic channels keep CAC well below typical B2B SaaS ($500-1,500).

### Lifetime Value (LTV)

```
Average Revenue Per Account (ARPA):  $250/mo (blended across tiers)
Gross Margin:                        82%
Monthly Churn Rate:                  1.0%

LTV = ARPA × Gross Margin / Monthly Churn
LTV = $250 × 0.82 / 0.01
LTV = $20,500

Conservative LTV (with expansion):
  Base LTV:                          $20,500
  Expansion Revenue Multiplier:      1.35x (plan upgrades + add-ons)
  Adjusted LTV:                      $27,675
```

**Simplified LTV for modeling (conservative):** $7,164

This conservative figure uses a 3-year customer lifetime assumption rather than the theoretical infinite LTV formula:
```
Conservative LTV = ARPA × Gross Margin × 36 months (3-year lifespan)
                 = $244 × 0.82 × 36
                 = $7,164
```

### LTV:CAC Ratio

| Metric | Value | Benchmark |
|---|---|---|
| **Blended CAC** | $350 | — |
| **Conservative LTV** | $7,164 | — |
| **LTV:CAC** | **20.5x** | Target: > 3x, best-in-class: > 10x |
| **CAC Payback Period** | **1.7 months** | Target: < 12 months |

**Why LTV:CAC is exceptional (20.5x):** Two structural advantages drive this:
1. **Extremely low churn** — Board governance is mandatory. Companies do not stop having board meetings. Churn comes primarily from company failure (startup mortality), not product dissatisfaction.
2. **Low CAC via partnership channels** — VC and law firm referrals are essentially free leads. The partnership development cost is amortized across many referrals.

### Gross Margin Breakdown

| Cost Component | Per Customer/Month | % of ARPA |
|---|---|---|
| **Revenue (ARPA)** | $250.00 | 100% |
| **Infrastructure** (Vercel, Supabase, Cloudflare) | ($8.00) | 3.2% |
| **AI costs** (OpenAI GPT-4o + Whisper) | ($12.00) | 4.8% |
| **Third-party APIs** (DocuSign, etc.) | ($3.00) | 1.2% |
| **Email delivery** (Resend) | ($1.50) | 0.6% |
| **Payment processing** (Stripe billing) | ($7.50) | 3.0% |
| **Support** (amortized) | ($13.00) | 5.2% |
| **Gross Profit** | **$205.00** | **82.0%** |

---

## Customer Acquisition Strategy

### Channel 1: VC Firm Partnerships (30% of acquisitions)

**Strategy:** Partner with VC firms to recommend BoardBrief to their portfolio companies. Each VC firm partnership yields 20-50 potential customers (their portfolio companies that have boards).

**Tactics:**
- Target top 50 VC firms with active portfolio support (platform teams)
- Offer VCs a portfolio dashboard showing aggregate board meeting metrics across portfolio
- Provide free or discounted accounts for VC partners to use as board members
- Joint content: governance guides co-branded with the VC firm
- Integrate into VC onboarding: new portfolio company setup includes BoardBrief account

**Target partnerships (priority order):**
1. a16z (portfolio operations team)
2. Sequoia (portfolio support)
3. First Round Capital (platform team)
4. Bessemer Venture Partners
5. Accel
6. Index Ventures
7. Greylock Partners
8. Founders Fund
9. Lightspeed Venture Partners
10. General Catalyst

**Metrics:**
- Target: 20 VC firm partnerships in Year 1
- Average portfolio companies per firm: 30
- Conversion rate (recommendation to signup): 15%
- Expected customers from channel: 20 × 30 × 0.15 = 90 customers in Year 1

### Channel 2: Startup Law Firm Partnerships (15% of acquisitions)

**Strategy:** Partner with the startup law firms that handle corporate formation and governance for VC-backed companies. Lawyers recommending BoardBrief during incorporation or post-funding carry enormous trust and credibility.

**Target firms:**
1. Wilson Sonsini Goodrich & Rosati (WSGR) — largest startup law practice
2. Cooley LLP — known for venture capital transactions
3. Gunderson Dettmer — exclusively represents growth companies
4. Fenwick & West — Silicon Valley focused
5. Goodwin Procter — strong East Coast startup practice
6. Orrick, Herrington & Sutcliffe

**Tactics:**
- Provide BoardBrief resolution templates that align with each firm's standard governance language
- Offer co-branded governance guides and board meeting playbooks
- Free BoardBrief accounts for law firm attorneys who serve as board observers
- CLE (Continuing Legal Education) credit webinars on startup governance technology
- Integration with firm document management systems

**Metrics:**
- Target: 6 law firm partnerships in Year 1
- Average new startups per firm per year: 200
- Conversion rate: 8%
- Expected customers: 6 × 200 × 0.08 = 96 customers in Year 1

### Channel 3: Content Marketing and SEO (20% of acquisitions)

**Strategy:** Own the "startup board meeting" content category. Create the definitive resources that founders search for when preparing for their first board meeting.

**Content pillars:**
1. "How to run your first board meeting" — targeting post-seed founders
2. "Board deck templates by stage" — downloadable templates with BoardBrief CTA
3. "Board resolution templates" — legal templates for common resolutions
4. "Startup governance checklist" — comprehensive governance requirements by stage
5. "Board meeting best practices" — ongoing blog content

**SEO targets:**
- "board deck template startup"
- "how to run a board meeting"
- "board resolution template"
- "startup board meeting agenda"
- "board minutes template"
- "startup governance requirements"

**Distribution:**
- Blog on boardbrief.com (SEO)
- LinkedIn thought leadership (founder and board governance content)
- Twitter/X (startup community engagement)
- YouTube (board meeting walkthrough videos)

### Channel 4: Founder Community Referrals (15% of acquisitions)

**Strategy:** Penetrate founder communities where startup operators share tool recommendations.

**Target communities:**
1. Y Combinator alumni network (YC Bookface, YC Slack)
2. Techstars alumni network
3. On Deck fellowship alumni
4. South Park Commons
5. Reforge community
6. SaaStr community
7. Startup Twitter/X

**Tactics:**
- Board member network effects: board members who sit on 3-7 boards bring BoardBrief to each company
- Referral program: $50 credit per referred paying customer
- Community-specific onboarding: "BoardBrief for YC companies" with YC-specific templates
- Founder testimonials and case studies

### Channel 5: Product-Led Growth (10% of acquisitions)

**Strategy:** Free governance assessment tool that captures leads and demonstrates value before signup.

**PLG funnel:**
1. "Board Meeting Readiness Score" — free assessment tool (name, email, stage, board composition)
2. Score report with specific recommendations (gaps in governance, missing documents)
3. CTA: "Fix these with BoardBrief" — direct to free trial
4. 14-day free trial of Growth plan (full AI features)

### Channel 6: Paid Acquisition (10% of acquisitions)

**Strategy:** LinkedIn and Google Ads targeting startup founders and CFOs.

**LinkedIn targeting:**
- Title: Founder, CEO, CFO, COO at companies with 10-500 employees
- Industry: Technology, SaaS
- Seniority: C-suite, VP, Director
- Groups: Startup founder groups
- Estimated CPC: $8-15
- Estimated conversion rate: 2-3%
- CAC: $600-800

**Google Ads:**
- Keywords: "board meeting software", "board deck template", "board portal startup"
- Estimated CPC: $5-12
- Landing page: stage-specific (Seed, Series A, Series B)

---

## Target Customer Segments

### Primary Segment: VC-Backed Startups (Seed to Series C)

| Attribute | Details |
|---|---|
| **Company stage** | Post-seed (first priced round) through Series C |
| **Revenue** | $0 - $50M ARR |
| **Headcount** | 5 - 500 employees |
| **Board size** | 3 - 7 members |
| **Meeting frequency** | Quarterly (sometimes monthly for early stage) |
| **Decision maker** | Founder/CEO (Seed-A), COO/CFO (B+), Chief of Staff (C+) |
| **Budget authority** | Can expense $99-499/mo without board approval |
| **Pain intensity** | Very high — board prep is a dreaded quarterly ritual |
| **Market size** | ~400,000 VC-backed startups globally (Seed-Series C) |

### Secondary Segment: Startup CFOs and COOs

| Attribute | Details |
|---|---|
| **Role** | First finance or operations hire at Series A+ startup |
| **Responsibility** | Often inherits board prep from the founder |
| **Pain point** | Needs to build board reporting processes from scratch |
| **Buying behavior** | Researches tools independently, presents to CEO for approval |
| **Value proposition** | BoardBrief makes them look good in their first board meeting |

### Tertiary Segment: Board Members on Multiple Boards

| Attribute | Details |
|---|---|
| **Role** | VC partner, independent director, or angel investor |
| **Board seats** | 3 - 7 simultaneous board seats |
| **Pain point** | Inconsistent materials across companies, no unified view |
| **Buying behavior** | Recommends tools to portfolio company founders |
| **Value proposition** | Single portal for all board materials across companies |
| **Network effect** | Each board member who adopts brings 3-7 companies into the funnel |

---

## Churn Analysis

### Why Churn is Structurally Low

Board governance tools have inherently low churn because:

1. **Governance is mandatory** — As long as a company has a board, it must hold meetings, pass resolutions, and maintain records. A company cannot "decide not to do governance."

2. **Historical data lock-in** — Past board decks, minutes, resolutions, and action items accumulate over time. Migrating this data to another tool is painful. After 2+ years, switching costs are very high.

3. **Multi-stakeholder adoption** — Board members, founders, secretaries, and observers all use the platform. Switching requires retraining all parties and migrating permissions.

4. **Compliance risk of switching** — Changing governance tools mid-year creates documentation gaps that could become legal liabilities. Companies defer switches to year-end or never.

### Churn Sources

| Churn Source | Est. Monthly Rate | Mitigation |
|---|---|---|
| **Company failure (startup mortality)** | 0.5% | Unavoidable — budget for it. Offer data export for records |
| **Outgrew the product (IPO / acquisition)** | 0.1% | Public company module (Year 2+), enterprise expansion |
| **Hired a Chief of Staff who prefers manual** | 0.1% | Ensure value prop resonates with CoS persona, not just founder |
| **Price sensitivity** | 0.1% | Annual billing discount (20%), demonstrate ROI in time saved |
| **Product dissatisfaction** | 0.2% | Continuous feature development, responsive support |
| **Total monthly churn** | **1.0%** | — |
| **Annual churn** | **~11.4%** | — |

### Churn Benchmarks

| Metric | BoardBrief Target | B2B SaaS Median | Best-in-Class |
|---|---|---|---|
| Monthly logo churn | 1.0% | 3-5% | < 1% |
| Annual logo churn | 11.4% | 30-50% | < 10% |
| Net revenue retention | 115% | 100-110% | > 130% |
| Gross revenue retention | 92% | 80-90% | > 95% |

---

## Expansion Revenue

### Plan Upgrades (Natural Stage Progression)

As startups raise funding rounds, their governance needs grow. BoardBrief tiers map directly to funding stages, creating a natural upgrade path:

```
Seed funding → Seed Plan ($99/mo)
                  |
                  | Series A raised, board grows to 5 members, needs AI decks
                  v
              Growth Plan ($249/mo)  — 151% expansion
                  |
                  | Series B raised, compliance needs, multiple committees
                  v
              Enterprise Plan ($499/mo) — 100% expansion
```

**Upgrade rate assumptions:**
- Seed → Growth: 25% of customers within 18 months (driven by Series A funding)
- Growth → Enterprise: 15% of customers within 24 months (driven by Series B+ funding)

### Add-On Revenue

| Add-On | Price | Target Segment | Expected Attach Rate |
|---|---|---|---|
| Additional legal entity | $99/entity/mo | Enterprise with subsidiaries | 20% of Enterprise |
| Public company compliance module | $299/mo | Pre-IPO companies | 5% of Enterprise |
| Advanced analytics + board scoring | $49/mo | Growth and Enterprise | 15% of Growth, 30% of Enterprise |
| Custom API integrations | $199/mo | Enterprise with custom tools | 10% of Enterprise |
| White-label portal for VC firms | $999/mo | VC firm partnerships | Separate sales motion |

### Net Revenue Retention Model

```
Starting MRR (Month 0):           $100,000

Gross churn (1%/mo):               -$1,000
Contraction (downgrades):            -$200
Expansion (upgrades):               +$1,800
Add-on revenue:                      +$400

Ending MRR (Month 1):             $101,000

Monthly NRR:                         101.0%
Annual NRR:                          112.7%

Target NRR at scale:                 115.0%
```

---

## Financial Projections

### Revenue Ramp (Months 1-36)

| Month | Seed Customers | Growth Customers | Enterprise Customers | Total MRR | ARR |
|---|---|---|---|---|---|
| 3 | 30 | 5 | 0 | $4,215 | $50.6K |
| 6 | 100 | 30 | 5 | $19,895 | $238.7K |
| 9 | 200 | 80 | 15 | $42,375 | $508.5K |
| 12 | 350 | 180 | 40 | $99,570 | $1.19M |
| 18 | 700 | 500 | 120 | $253,680 | $3.04M |
| 24 | 1,100 | 1,000 | 250 | $483,650 | $5.80M |
| 30 | 1,350 | 1,500 | 400 | $706,950 | $8.48M |
| 36 | 1,500 | 2,000 | 500 | $1,000,000 | $12.0M |

### Path to $1M MRR Timeline

```
Month 1-6:    Foundation phase — first 100 customers, $20K MRR
              Focus: MVP launch, initial partnerships, content marketing

Month 7-12:   Growth phase — 500 customers, $100K MRR
              Focus: AI deck generator drives word-of-mouth, VC partnerships active

Month 13-24:  Scale phase — 2,000 customers, $500K MRR
              Focus: Growth plan adoption, Enterprise launched, law firm partnerships

Month 25-36:  Expansion phase — 4,000 customers, $1M MRR
              Focus: Net revenue retention, add-ons, public company module
```

### Annual Financial Summary

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| **ARR (ending)** | $1.19M | $5.80M | $12.0M |
| **Total Customers** | 570 | 2,350 | 4,000 |
| **Revenue (annual)** | $660K | $3.5M | $8.9M |
| **Gross Margin** | 80% | 82% | 84% |
| **Gross Profit** | $528K | $2.87M | $7.48M |
| **Operating Expenses** | $1.8M | $3.2M | $5.5M |
| **Net Income** | ($1.27M) | ($330K) | $1.98M |
| **Monthly Burn** | $106K | $27.5K | — |
| **Breakeven Month** | — | Month 22 | — |

### Operating Expense Breakdown (Year 1)

| Category | Annual Cost | % of Total |
|---|---|---|
| **Engineering** (3 FTEs) | $750K | 41.7% |
| **Sales & Marketing** | $400K | 22.2% |
| **G&A** (legal, accounting, ops) | $300K | 16.7% |
| **Infrastructure & APIs** | $150K | 8.3% |
| **Customer Support** | $100K | 5.6% |
| **Miscellaneous** | $100K | 5.6% |
| **Total** | **$1.8M** | **100%** |

---

## Funding Requirements

### Seed Round

| Item | Details |
|---|---|
| **Raise amount** | $2.5M |
| **Runway** | 24 months (to Month 22 breakeven) |
| **Use of funds** | Engineering (50%), sales & marketing (25%), operations (25%) |
| **Target investors** | Fintech/B2B SaaS focused funds, angels with governance experience |
| **Valuation target** | $10-12M pre-money (based on $1M+ ARR trajectory) |

### Key Milestones for Series A

| Milestone | Target | Timing |
|---|---|---|
| $1M ARR | Demonstrated product-market fit | Month 12-14 |
| 500+ paying customers | Market validation | Month 12 |
| Net revenue retention > 110% | Expansion revenue working | Month 15 |
| 3+ VC firm partnerships active | Channel validation | Month 10 |
| < 2% monthly churn | Retention thesis proven | Month 12 |

---

## Competitive Pricing Comparison

| Product | Price | What You Get | BoardBrief Advantage |
|---|---|---|---|
| **BoardBrief Seed** | $99/mo | Basic deck builder, minutes, portal | AI-powered, modern UX, startup-focused |
| **BoardBrief Growth** | $249/mo | AI deck generation, resolutions, full suite | Auto-pulls from Stripe/QB/CRM |
| **BoardBrief Enterprise** | $499/mo | Compliance, multi-entity, SSO | Enterprise features at startup price |
| **Carta Board Mgmt** | $2,500+/yr | Basic board management, no AI | BoardBrief: AI decks, deeper integrations, lower price |
| **Diligent Boards** | $10,000+/yr | Enterprise board portal | BoardBrief: 90% cheaper, AI-native, startup-focused |
| **OnBoard** | $5,000+/yr | Mid-market board management | BoardBrief: 85% cheaper, AI deck generation |
| **Visible.vc** | $79-199/mo | Investor updates and basic metrics | BoardBrief: full governance suite, not just updates |

BoardBrief is positioned as **10-20x cheaper than enterprise incumbents** while delivering AI capabilities none of them offer. Against startup-focused tools like Visible.vc, BoardBrief provides a complete governance platform (not just investor updates).

---

## Revenue Model Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Startup market downturn reduces new formation** | Medium | Medium | Diversify to established private companies, governance is needed in any market |
| **Carta or Diligent adds AI deck generation** | Medium | High | Move faster, build deeper integrations, community-driven moat |
| **OpenAI pricing increases** | Low | Medium | Model-agnostic architecture, can switch to Claude, Gemini, or open-source |
| **VC firm partners build in-house tools** | Low | Medium | Integration depth and product breadth are hard to replicate in-house |
| **Higher-than-expected churn from startup mortality** | Medium | Medium | Target post-Series A companies (lower mortality), diversify to non-VC companies |
| **Slow partnership development** | Medium | Medium | Invest in direct acquisition channels (content, PLG) as hedge |
| **Enterprise customers demand on-premise** | Low | Low | Year 2+ roadmap includes on-premise option for regulated industries |

---

## Key Metrics to Track

### North Star Metric
**Board decks generated per month** — This measures the core value delivered. A customer who generates a board deck is actively using the product for its intended purpose.

### Primary Metrics

| Metric | Definition | Target |
|---|---|---|
| **MRR** | Monthly recurring revenue | $1M by Month 36 |
| **Net Revenue Retention** | (MRR at end of month from cohort) / (MRR at start of month from cohort) | > 115% |
| **Monthly Logo Churn** | Customers lost / customers at start of month | < 1% |
| **CAC** | Total sales & marketing spend / new customers acquired | < $350 |
| **CAC Payback** | CAC / (ARPA x Gross Margin) | < 2 months |
| **Activation Rate** | % of signups who generate first board deck within 14 days | > 60% |

### Secondary Metrics

| Metric | Definition | Target |
|---|---|---|
| **Trial-to-Paid** | % of free trial users who convert to paid | > 25% |
| **Expansion Revenue %** | MRR from upgrades and add-ons / total new MRR | > 30% |
| **Board Decks per Customer** | Average decks generated per customer per quarter | > 1.5 |
| **Integration Connections** | Average integrations connected per customer | > 2.5 |
| **Board Member Portal MAU** | Monthly active board member users / total board members | > 70% |
| **NPS** | Net Promoter Score | > 60 |
