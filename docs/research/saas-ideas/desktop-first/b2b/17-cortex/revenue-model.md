# Cortex -- Revenue Model

## Pricing Philosophy

Cortex pricing is designed around three principles:

1. **Per-seat, not per-query**: Analysts need unlimited freedom to explore data. Charging per query creates anxiety and reduces usage. Per-seat pricing aligns value (each analyst gets a data copilot) with cost.
2. **Generous free tier**: Let analysts fall in love with the product before asking for money. Free tier is genuinely useful (not a crippled demo) but creates natural upgrade triggers.
3. **Enterprise value capture**: Enterprise customers pay more for features that matter to them (SSO, audit logs, SLAs) -- not for the same features at higher prices.

---

## Pricing Tiers

### Tier Comparison

| Feature | Free | Analyst ($29/mo) | Team ($59/mo) | Enterprise ($99/mo) |
|---------|------|-------------------|----------------|---------------------|
| **Data Sources** | 1 connection | 5 connections | Unlimited | Unlimited |
| **Queries** | 50/month | Unlimited | Unlimited | Unlimited |
| **Chart Types** | Basic (bar, line, pie) | All types | All types | All types |
| **SQL Preview** | Yes | Yes | Yes | Yes |
| **Query History** | Last 50 queries | Unlimited | Unlimited | Unlimited |
| **Dashboards** | 1 dashboard, 5 tiles | Unlimited | Unlimited | Unlimited |
| **Export (CSV)** | Yes | Yes | Yes | Yes |
| **Export (PNG/PDF)** | No | Yes | Yes | Yes |
| **Connectors** | PostgreSQL, MySQL, CSV | + BigQuery, Snowflake | + BigQuery, Snowflake | + Custom connectors |
| **DuckDB Local Engine** | Yes | Yes | Yes | Yes |
| **AI Insights** | No | Yes | Yes | Yes |
| **Scheduled Reports** | No | No | Yes (daily/weekly) | Yes (custom cron) |
| **Alerts** | No | No | 5 alerts | Unlimited alerts |
| **Team Collaboration** | No | No | Yes (shared dashboards) | Yes |
| **Slack Integration** | No | No | Yes | Yes |
| **SSO (SAML/OIDC)** | No | No | No | Yes |
| **Audit Log** | No | No | No | Yes |
| **Custom Connectors** | No | No | No | Yes |
| **On-Premise Option** | No | No | No | Yes |
| **SLA** | No | No | No | 99.9% uptime |
| **Support** | Community | Email (48h) | Email (24h) + Chat | Dedicated CSM + Phone |
| **Onboarding** | Self-serve | Self-serve | Guided setup call | White-glove onboarding |

### Pricing Details

| Tier | Monthly (per seat) | Annual (per seat, billed annually) | Discount |
|------|--------------------|------------------------------------|----------|
| **Free** | $0 | $0 | -- |
| **Analyst** | $29 | $24/mo ($288/year) | 17% |
| **Team** | $59 | $49/mo ($588/year) | 17% |
| **Enterprise** | $99 | $84/mo ($1,008/year) | 15% |
| **Enterprise (custom)** | Negotiated | Negotiated | Volume discounts for 100+ seats |

### Free Tier Strategy

The free tier exists to drive adoption and create viral awareness, not to generate revenue. It is intentionally limited to create natural upgrade triggers.

| Free Tier Limit | Upgrade Trigger |
|-----------------|-----------------|
| 50 queries/month | Power users hit this in 2-3 days. Clear upgrade prompt when approaching limit. |
| 1 data source | User wants to connect a second database or CSV. |
| 1 dashboard, 5 tiles | User wants to build a comprehensive dashboard. |
| Basic charts only | User wants scatter plots, heatmaps, or custom charts. |
| No PNG/PDF export | User wants to share charts in presentations or email. |
| No AI insights | User sees the "Insights" tab but it shows "Upgrade for AI insights." |

---

## Path to $1M MRR

### Revenue Model

```
Target: $1,000,000 MRR

Breakdown:
- 8,000 Team seats    x $55/mo avg (mix of monthly and annual)   = $440,000
- 4,000 Enterprise    x $99/mo avg                                = $396,000
- 6,000 Analyst seats x $27/mo avg (mix of monthly and annual)   = $162,000
- Free tier revenue contribution                                  = $0
                                                                    ----------
  Total MRR                                                        ~$1,000,000
  Total paid seats: 18,000
  Total registered users (incl free): ~90,000
```

### Timeline to $1M MRR

| Month | Milestone | Paid Seats | MRR | Key Action |
|-------|-----------|-----------|-----|------------|
| 0-3 | Private beta | 0 | $0 | Build MVP. 50 beta testers (no charge). |
| 4-6 | Public launch | 200 | $8,000 | ProductHunt launch. Free tier. First paying customers. |
| 7-9 | Early traction | 800 | $32,000 | Content marketing ramp. First enterprise pilots. |
| 10-12 | Product-market fit | 2,000 | $85,000 | Team tier adoption. Scheduled reports drive stickiness. |
| 13-18 | Growth | 5,000 | $250,000 | Enterprise sales ramp. First CSM hire. Expansion revenue. |
| 19-24 | Scale | 10,000 | $550,000 | Channel partnerships. International expansion. |
| 25-30 | Acceleration | 15,000 | $825,000 | Embedded analytics revenue. Platform play. |
| 31-36 | Target | 18,000 | $1,000,000 | Compounding growth from retention + expansion. |

---

## Unit Economics

### Customer Acquisition Cost (CAC)

| Channel | CAC | % of Spend | Notes |
|---------|-----|-----------|-------|
| **Content Marketing** | $80 | 30% | Blog posts ("Cortex vs Tableau"), YouTube tutorials, data community content |
| **LinkedIn Ads** | $350 | 25% | Targeted ads to job titles: "Business Analyst", "Data Analyst", "Operations Analyst" |
| **Organic/SEO** | $30 | 15% | Long-tail: "how to query database without SQL", "natural language SQL tool" |
| **ProductHunt / Community** | $50 | 10% | Launch campaigns, community engagement, dbt Community presence |
| **Webinars** | $150 | 10% | "From Question to Chart in 60 Seconds" live demos |
| **Referrals** | $40 | 10% | "Invite 3 colleagues, get 1 month free" program |
| **Blended CAC** | **$150** | 100% | Weighted average across all channels |

**Enterprise CAC**: $500-$1,000 (higher due to longer sales cycle, POC costs, security reviews). Justified by higher ACV and longer retention.

### Lifetime Value (LTV)

| Metric | Value | Calculation |
|--------|-------|-------------|
| **Average Revenue per Seat per Month** | $49 | Blended across Analyst ($29), Team ($59), Enterprise ($99) |
| **Gross Margin** | 85% | Revenue minus OpenAI API costs (~3%), Supabase (~1%), SendGrid (<1%), support (~10%) |
| **Monthly Churn** | 2.3% | BI tools are very sticky once embedded in workflows |
| **Average Customer Lifetime** | 43 months | 1 / 0.023 = ~43 months |
| **LTV** | **$1,791** | $49 x 0.85 x 43 = $1,791 per seat |
| **LTV (Team/Enterprise blended)** | **$4,248** | $72 avg x 0.85 x 70 months (lower churn for larger accounts) |

### LTV:CAC Ratio

| Segment | LTV | CAC | LTV:CAC | Payback Period |
|---------|-----|-----|---------|----------------|
| **Self-serve (Analyst)** | $1,791 | $150 | 11.9x | 3.6 months |
| **Team** | $3,200 | $250 | 12.8x | 5.0 months |
| **Enterprise** | $7,128 | $800 | 8.9x | 9.5 months |
| **Blended** | $4,248 | $250 | **17.0x** | 6.0 months |

**Benchmark**: SaaS companies with LTV:CAC > 3x are considered healthy. Cortex targets 17x due to:
- Low CAC (product-led growth, strong content marketing)
- High retention (BI tools are embedded in daily workflows -- switching costs are high)
- Expansion revenue (seats grow as more analysts adopt within the org)

---

## Acquisition Channels

### Channel Strategy

| Channel | Priority | Target | Content Type |
|---------|----------|--------|-------------|
| **LinkedIn** | High | Business analysts, data analysts, ops managers | Targeted ads: "Stop waiting on the data team." Short video demos. |
| **Content Marketing (SEO)** | High | People searching for SQL help, BI tool comparisons | Blog: "Cortex vs Tableau", "How to Query Your Database Without SQL", "The Business Analyst's Guide to Self-Serve Analytics" |
| **Data Community** | High | dbt Community, Data Twitter, Analytics Engineering Slack | Authentic participation. Sponsorship. Guest posts. Community events. |
| **ProductHunt** | Medium | Early adopters, startup founders, tech-savvy analysts | Launch with demo video. Founder story. |
| **Comparison Content** | Medium | People evaluating BI tools | Landing pages: "Cortex vs Tableau", "Cortex vs ThoughtSpot", "Cortex vs Metabase" |
| **Webinars** | Medium | Mid-market companies evaluating BI solutions | "From Question to Chart in 60 Seconds" live demo. "Self-Serve Analytics Without Hiring a Data Team" |
| **Free Tier Virality** | Medium | Analysts who share dashboards or query results | "Made with Cortex" watermark on free exports. Shareable dashboard links. |
| **Partnerships** | Low (Year 2) | Data consultancies, system integrators, dbt shops | Referral partnerships. Certified integrations. |

### Content Marketing Calendar (Example)

| Week | Content | Target Keyword | Format |
|------|---------|----------------|--------|
| 1 | "5 Questions Every Analyst Should Ask Their Data Daily" | data analysis questions | Blog |
| 2 | "Cortex vs Tableau: A Side-by-Side Comparison" | cortex vs tableau | Comparison page |
| 3 | "How to Build a Dashboard Without Writing Code" | no-code dashboard builder | Blog + Video |
| 4 | "The True Cost of Ad-Hoc Data Requests" | ad hoc data requests | Blog |
| 5 | "Natural Language SQL: How AI is Changing Data Analysis" | natural language SQL | Blog |
| 6 | "From CSV to Chart in 60 Seconds" (demo video) | CSV data analysis tool | YouTube + LinkedIn |
| 7 | "Why Your Data Team Has a 2-Week Backlog (and How to Fix It)" | data team backlog | Blog |
| 8 | "Self-Serve Analytics: A Guide for Non-Technical Teams" | self serve analytics | Long-form guide |

---

## Target Customer Profiles

### Primary Target

| Attribute | Specification |
|-----------|---------------|
| **Company Size** | 50-500 employees |
| **Stage** | Series A through growth stage (or profitable mid-market) |
| **Industry** | SaaS, e-commerce, fintech, marketplaces, logistics |
| **Data Stack** | PostgreSQL or MySQL as primary database. Possibly BigQuery/Snowflake for analytics. |
| **Data Team** | 0-3 dedicated data people (or no data team at all) |
| **Current BI** | None, spreadsheets, or a poorly adopted Tableau/Looker deployment |
| **Pain** | Business stakeholders can't get data without waiting 1-2 weeks for the data team |
| **Budget** | $500-$5,000/mo for BI tooling |
| **Decision Maker** | VP of Operations, Head of Analytics, CFO, or technical founder |
| **Champion** | Business analyst or ops manager frustrated with the current process |

### Buyer Personas

| Persona | Title | Motivation | Objection | Response |
|---------|-------|-----------|-----------|----------|
| **Champion** | Business Analyst / Ops Manager | "I want to answer my own questions without waiting on the data team." | "Will AI generate correct SQL?" | Show 85%+ accuracy. SQL preview lets you verify before running. |
| **Decision Maker** | VP Ops / Head of Analytics / CFO | "I want my team to be self-sufficient with data." | "We already have Tableau." | Cortex coexists. It handles ad-hoc questions. Tableau handles production dashboards. |
| **Blocker** | CTO / VP Engineering / Security | "Where does our data go?" | "We can't send data to a third party." | Data never leaves the desktop. Only NL questions and schema metadata reach AI. Show architecture diagram. |
| **Economic Buyer** | CFO / VP Finance | "Is this worth the cost?" | "$29-$99/seat adds up." | Compare to $75/seat Tableau. Calculate time saved on ad-hoc requests. ROI usually 5-10x. |

---

## Churn Analysis

### Expected Churn by Tier

| Tier | Monthly Churn | Annual Churn | Retention | Why |
|------|---------------|--------------|-----------|-----|
| **Free** | 15% | 87% | 13% | Expected. Free users are testing. Many won't convert. |
| **Analyst** | 4% | 39% | 61% | Individual users. May leave if they change roles or companies. |
| **Team** | 2% | 22% | 78% | Team adoption creates stickiness. Shared dashboards, reports. |
| **Enterprise** | 0.8% | 9% | 91% | Annual contracts. Deep integration. SSO. Very high switching costs. |
| **Blended (paid)** | 2.3% | 25% | 75% | Weighted across paid tiers |

### Churn Drivers and Mitigations

| Churn Driver | Likelihood | Mitigation |
|--------------|------------|------------|
| **Query accuracy too low** | High (early) | Invest in prompt engineering. User feedback loop. Continuous improvement. Target 85%+ accuracy by Month 6. |
| **User outgrows Cortex (needs full BI tool)** | Medium | Add advanced features (Python notebook mode, custom metrics, embedded analytics) to retain power users. |
| **Company switches databases** | Low | Support all major databases. Adding a new connector takes 2-4 weeks. |
| **Budget cuts** | Medium | Demonstrate clear ROI. Provide usage reports showing time saved. |
| **Champion leaves company** | Medium | Drive team-wide adoption (not just one user). Make Cortex a team tool, not an individual tool. |
| **Competitor launches similar product** | Medium | Move fast. Build moat through compound learning (per-org model improvement), desktop performance, and data privacy architecture. |

### Churn Reduction Strategies

| Strategy | Detail | Expected Impact |
|----------|--------|-----------------|
| **Onboarding drip campaign** | 7-day email sequence: Day 1 connect data, Day 3 first dashboard, Day 5 invite colleague, Day 7 schedule a report | +15% activation rate |
| **Usage monitoring** | Alert when a user's query frequency drops below their 30-day average | Early intervention, -20% churn |
| **Quarterly business reviews** | Enterprise accounts get quarterly reviews showing usage, ROI, and new features | -30% enterprise churn |
| **Feature stickiness** | Scheduled reports and alerts create recurring value -- users depend on them daily/weekly | -25% team tier churn |
| **Team expansion** | When 1 user loves it, prompt them to invite colleagues. Team adoption = lower churn. | -20% overall churn |

---

## Expansion Revenue

### Expansion Vectors

| Vector | Mechanism | Revenue Impact |
|--------|-----------|----------------|
| **Seat Expansion** | More analysts at the same company adopt Cortex. 1 analyst becomes 5. | Primary growth driver. 30-50% of revenue growth. |
| **Tier Upgrades** | Analyst -> Team (collaboration, scheduled reports) -> Enterprise (SSO, audit, SLA) | 15-25% of revenue growth. |
| **Embedded Analytics (Year 2+)** | Customers pay for sharing interactive dashboards externally via URL. Add-on pricing ($500-$2,000/mo). | 10-20% of revenue at scale. |
| **Custom Connectors (Enterprise)** | Build custom connectors for enterprise databases (Oracle, SAP, etc.). Professional services or add-on fee. | $5K-$20K per connector (one-time). |
| **Training & Onboarding** | White-glove onboarding and training sessions for enterprise deployments. | $2K-$10K per engagement. |
| **Data Quality Add-on (Year 2+)** | AI-powered data quality monitoring as a separate product or premium add-on. | $10-$20/seat/mo additional. |

### Net Revenue Retention (NRR) Target

| Period | NRR Target | Composition |
|--------|------------|-------------|
| **Year 1** | 110% | Moderate expansion, some churn in early cohorts |
| **Year 2** | 120% | Strong seat expansion as product matures. Lower churn. |
| **Year 3** | 130% | Enterprise expansion + embedded analytics add-on. Minimal churn. |

**Benchmark**: Best-in-class B2B SaaS companies (Snowflake, Datadog, Twilio) have NRR of 120-160%. Cortex targets the high end because:
- BI tools naturally expand to more users as value is demonstrated
- Enterprise analytics needs grow with company size
- Add-on products (embedded analytics, data quality) create new revenue from existing customers

---

## Financial Projections

### Year 1 Monthly Projections

| Month | Free Users | Paid Seats | Avg Revenue/Seat | MRR | OpenAI Cost | Net MRR |
|-------|-----------|-----------|-------------------|-----|-------------|---------|
| 1 | 50 | 0 | $0 | $0 | $25 | -$25 |
| 2 | 200 | 10 | $29 | $290 | $50 | $240 |
| 3 | 500 | 40 | $31 | $1,240 | $100 | $1,140 |
| 4 | 1,200 | 100 | $35 | $3,500 | $200 | $3,300 |
| 5 | 2,500 | 200 | $38 | $7,600 | $350 | $7,250 |
| 6 | 5,000 | 400 | $40 | $16,000 | $600 | $15,400 |
| 7 | 7,500 | 650 | $42 | $27,300 | $900 | $26,400 |
| 8 | 10,000 | 900 | $44 | $39,600 | $1,200 | $38,400 |
| 9 | 13,000 | 1,200 | $45 | $54,000 | $1,600 | $52,400 |
| 10 | 16,000 | 1,500 | $46 | $69,000 | $2,000 | $67,000 |
| 11 | 19,000 | 1,800 | $47 | $84,600 | $2,400 | $82,200 |
| 12 | 25,000 | 2,200 | $48 | $105,600 | $2,900 | $102,700 |

### Year 1 Summary

| Metric | Value |
|--------|-------|
| **Total Revenue (Year 1)** | ~$410,000 |
| **Ending MRR** | ~$106,000 |
| **Total Paid Seats (end of Year 1)** | ~2,200 |
| **Free Users** | ~25,000 |
| **Free-to-Paid Conversion Rate** | ~8.8% |
| **Blended CAC** | $150 |
| **Total CAC Spend** | ~$330,000 |
| **OpenAI API Costs** | ~$12,000 |
| **Gross Margin** | ~85% |

### 3-Year Revenue Projection

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Ending MRR** | $106K | $500K | $1.2M |
| **Annual Revenue** | $410K | $3.6M | $10.2M |
| **Paid Seats** | 2,200 | 10,000 | 25,000 |
| **Free Users** | 25,000 | 80,000 | 200,000 |
| **Team Size** | 6 | 20 | 45 |
| **Gross Margin** | 85% | 87% | 89% |
| **NRR** | 110% | 120% | 130% |

---

## Revenue Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **OpenAI price increase** | Medium | Medium | Abstract AI layer. Support multiple models. Enterprise customers can bring their own API key. |
| **OpenAI rate limits** | Low | High | Implement request queuing, caching of common query patterns, and fallback to GPT-4o-mini. |
| **Competitor with better NL-to-SQL** | Medium | High | Moat through compound learning (per-org model improvement), desktop performance, and deep BI workflow integration. |
| **Enterprise sales cycle too long** | Medium | Medium | Focus on mid-market (faster sales cycles). Use free tier + bottoms-up adoption to shorten enterprise cycles. |
| **Free tier abuse** | Low | Low | Rate limiting. 50 queries/month is generous enough to be useful but not enough for production use. |
| **Desktop app adoption friction** | Medium | Medium | Make installation seamless. Auto-update. Consider web version for users who can't install desktop apps. |

---

## Pricing Comparison with Competitors

| Product | Starting Price | Model | Notes |
|---------|---------------|-------|-------|
| **Cortex** | $0 (free) / $29/seat | Per-seat, tiered | NL-first. Desktop. Data stays local. |
| **Tableau** | $75/user/mo (Creator) | Per-user, role-based | $15/Viewer, $42/Explorer, $75/Creator. Most users need Creator. |
| **Looker** | ~$5,000/mo minimum | Platform fee + per-user | Requires LookML modeling. Long implementation. |
| **Mode** | $35/user/mo | Per-user | SQL-focused. Less accessible to non-technical users. |
| **ThoughtSpot** | Custom (enterprise only) | Platform + per-user | Search-based BI. Requires indexing and setup. |
| **Metabase** | $0 (OSS) / $85/mo (Cloud) | Flat fee or self-hosted | Good for simple use cases. No NL interface. |
| **Power BI** | $10/user/mo (Pro) | Per-user | Cheap but Microsoft-centric. Complex. |

**Cortex Positioning**: Priced between Metabase (cheap/basic) and Tableau (expensive/complex). Better NL experience than all competitors. Desktop privacy advantage over all web-based competitors.

---

## Financial Operating Model

### Cost Structure at $1M MRR

| Category | Monthly Cost | % of Revenue |
|----------|-------------|-------------|
| **People** (45 FTEs, avg $12K/mo fully loaded) | $540,000 | 54% |
| **OpenAI API** | $25,000 | 2.5% |
| **Supabase** | $600 | <0.1% |
| **SendGrid** | $90 | <0.1% |
| **Infrastructure** (CI/CD, monitoring, code signing) | $2,000 | 0.2% |
| **Sales & Marketing** | $150,000 | 15% |
| **G&A** (legal, accounting, insurance) | $30,000 | 3% |
| **Total Costs** | ~$748,000 | ~75% |
| **Operating Profit** | ~$252,000 | ~25% |

### Key Efficiency Metrics

| Metric | Target | Benchmark |
|--------|--------|-----------|
| **Gross Margin** | 85-89% | SaaS median: 70-75%. Cortex higher because no hosting costs for data processing. |
| **CAC Payback** | 6 months | SaaS median: 12-18 months |
| **LTV:CAC** | 17x | SaaS healthy: >3x |
| **Magic Number** | 1.2+ | (Net new ARR / Sales & Marketing spend). >1 = efficient growth. |
| **Burn Multiple** | <1.5x | (Net burn / Net new ARR). <1x = efficient. <2x = good. |
| **Rule of 40** | 50%+ | (Revenue growth rate % + profit margin %). >40% = healthy. |

---

*Revenue follows value. Make analysts 10x faster, and the revenue model takes care of itself.*
