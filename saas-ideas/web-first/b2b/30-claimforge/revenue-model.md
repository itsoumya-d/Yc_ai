# ClaimForge — Revenue Model & Unit Economics

## Revenue Philosophy

ClaimForge monetizes the most expensive problem in whistleblower litigation: **time**. The average False Claims Act case takes 2-5 years. Attorneys working on contingency invest hundreds of hours before seeing any return. ClaimForge compresses months of manual document review into days of AI-assisted analysis. The value is not the software — the value is the cases that become economically viable to pursue.

This creates an unusual pricing dynamic: customers are not price-sensitive on a per-month basis because the tool pays for itself on the first case. A $499/month subscription is trivial compared to a 15-30% contingency fee on a $5M recovery.

---

## Pricing Tiers

### Tier 1: Solo Attorney — $199/month

**Target**: Individual qui tam attorneys, small whistleblower practices (1-3 attorneys), compliance consultants.

| Feature                        | Included                                              |
| ------------------------------ | ----------------------------------------------------- |
| Active Cases                   | 5 concurrent cases                                    |
| Document Storage               | 25 GB                                                 |
| Document Processing            | 5,000 pages/month OCR                                |
| AI Analysis Credits            | 10,000 tokens/month (GPT-4o)                         |
| Fraud Detection                | Basic pattern detection (overbilling, duplicates, round-number analysis) |
| Statistical Analysis           | Benford's Law analysis                                |
| Entity Extraction              | Automatic entity extraction and linking               |
| Network Graph                  | Basic entity relationship graph (up to 200 nodes)    |
| Timeline Builder               | Auto-generated + manual editing                      |
| Evidence Export                 | PDF reports with citations                           |
| Government Data                | USASpending + CMS Open Payments cross-referencing    |
| Team Members                   | 1 user (solo practitioner)                           |
| Collaboration                  | None (single user)                                    |
| FCA Complaint Draft            | Not included                                          |
| Real-Time Monitoring           | Not included                                          |
| Audio Transcription            | Not included                                          |
| API Access                     | Not included                                          |
| Support                        | Email support (48-hour response)                     |
| Data Retention                 | 2 years after case closure                           |

**Annual billing**: $179/month ($2,148/year — 10% discount)

### Tier 2: Firm — $499/month

**Target**: Whistleblower law firms (3-20 attorneys), forensic accounting firms, healthcare compliance departments.

| Feature                        | Included                                              |
| ------------------------------ | ----------------------------------------------------- |
| Active Cases                   | Unlimited                                             |
| Document Storage               | 100 GB                                                |
| Document Processing            | 25,000 pages/month OCR                               |
| AI Analysis Credits            | 50,000 tokens/month (GPT-4o)                         |
| Fraud Detection                | Advanced pattern detection (all patterns including phantom vendor, kickback, quality substitution, bid rigging) |
| Statistical Analysis           | Full suite (Benford's, anomaly detection, clustering, trend analysis, ratio analysis) |
| Entity Extraction              | Advanced extraction with cross-document linking       |
| Network Graph                  | Full interactive graph (unlimited nodes, WebGL rendering) |
| Timeline Builder               | Auto-generated + manual + narrative mode              |
| Evidence Export                 | PDF, CSV, JSON exports. DOJ and client format templates |
| Government Data                | USASpending + CMS Open Payments + FPDS cross-referencing |
| Team Members                   | Up to 10 users                                        |
| Collaboration                  | Real-time collaboration, annotations, threaded comments |
| FCA Complaint Draft            | AI-generated complaint drafts with citations          |
| Audio Transcription            | 10 hours/month (Whisper)                              |
| Real-Time Monitoring           | Not included                                          |
| API Access                     | Not included                                          |
| Support                        | Priority email + chat (24-hour response)              |
| Data Retention                 | 5 years after case closure                           |

**Annual billing**: $449/month ($5,388/year — 10% discount)

### Tier 3: Enterprise — $999/month (starting)

**Target**: Large compliance teams, government contract auditing firms, Big Four forensic practices, healthcare system compliance departments, government agencies (OIG offices).

| Feature                        | Included                                              |
| ------------------------------ | ----------------------------------------------------- |
| Active Cases                   | Unlimited                                             |
| Document Storage               | 1 TB (expandable)                                     |
| Document Processing            | Unlimited OCR                                         |
| AI Analysis Credits            | Unlimited GPT-4o                                      |
| Fraud Detection                | All patterns + custom fraud model configuration       |
| Statistical Analysis           | Full suite + custom statistical models                |
| Entity Extraction              | Advanced + custom entity types                        |
| Network Graph                  | Full interactive + batch graph processing             |
| Timeline Builder               | Full suite + Gantt view + cross-case timelines        |
| Evidence Export                 | All formats + custom templates + white-labeling       |
| Government Data                | All government APIs + custom data source integration  |
| Team Members                   | Unlimited                                             |
| Collaboration                  | Full collaboration + expert witness portal + co-counsel access |
| FCA Complaint Draft            | Full complaint generation + jurisdiction analysis     |
| Audio Transcription            | Unlimited                                             |
| Real-Time Monitoring           | Continuous fraud monitoring with alert dashboard      |
| API Access                     | Full REST API for system integration                  |
| SSO / SAML                     | Enterprise SSO integration                            |
| IP Allowlisting                | Restrict access to approved IP ranges                 |
| Dedicated Support              | Dedicated account manager, phone support, 4-hour SLA  |
| Data Retention                 | Custom retention policies                             |
| Compliance                     | SOC 2 Type II report, HIPAA BAA available             |
| Custom Deployment              | Available (dedicated infrastructure, data residency)  |

**Annual billing**: $899/month ($10,788/year — 10% discount)

**Enterprise add-ons** (priced separately):

| Add-On                         | Price                                                 |
| ------------------------------ | ----------------------------------------------------- |
| Additional storage (per TB)    | $200/month                                            |
| Healthcare Fraud Module        | $300/month                                            |
| Defense Contracting Module     | $300/month                                            |
| Pharmaceutical Fraud Module    | $300/month                                            |
| Custom fraud model training    | $5,000 one-time + $500/month maintenance             |
| Dedicated infrastructure       | $2,000/month                                          |
| HIPAA BAA                      | Included with Enterprise                              |
| FedRAMP environment            | Custom pricing                                        |

---

## Success Fee Model — Alternative Pricing

### Structure

For contingency-fee attorneys who prefer to align ClaimForge's cost with case outcomes:

| Component              | Terms                                                     |
| ---------------------- | --------------------------------------------------------- |
| Base subscription      | $0/month                                                  |
| Success fee            | 2% of recovered amount (attorney's share)                |
| Minimum fee            | $5,000 per successful case                               |
| Maximum fee            | $500,000 per case (cap)                                  |
| Payment trigger        | Settlement or judgment payment received by attorney      |
| Payment timing         | Due within 30 days of attorney receiving recovery funds  |
| Failed case            | $0 owed                                                   |

### Success Fee Economics

| Recovery Amount (Attorney Share) | ClaimForge Fee (2%) | Effective Monthly Cost (3-year case) |
| -------------------------------- | ------------------- | ------------------------------------ |
| $250,000                         | $5,000 (minimum)    | $139/month                           |
| $500,000                         | $10,000             | $278/month                           |
| $1,000,000                       | $20,000             | $556/month                           |
| $5,000,000                       | $100,000            | $2,778/month                         |
| $10,000,000                      | $200,000            | $5,556/month                         |
| $25,000,000+                     | $500,000 (cap)      | $13,889/month                        |

### When to Offer Success Fee

- Attorney is working on pure contingency (no hourly billing)
- Attorney is hesitant to add monthly SaaS cost during case investment phase
- Case has estimated fraud > $1M (ensuring meaningful recovery for both parties)
- Attorney agrees to exclusive use of ClaimForge for the case

### Success Fee Agreement

- Separate legal agreement per case (not per account)
- Attorney provides case registration with estimated fraud amount
- ClaimForge provides full Firm-tier access for the registered case
- Fee is calculated on the attorney's net recovery (after expenses, before attorney fees to client)
- If case settles for less than $250K (attorney share), minimum fee of $5,000 applies
- Attorney can convert to subscription at any time (success fee for existing cases remains)

---

## Path to $1M MRR

### Target Mix

| Tier            | Customers | Revenue/Customer | MRR Contribution | % of MRR |
| --------------- | --------- | ---------------- | ---------------- | -------- |
| Solo ($199/mo)  | 1,000     | $199             | $199,000         | 19.9%    |
| Firm ($499/mo)  | 1,200     | $499             | $598,800         | 59.9%    |
| Enterprise ($999+/mo) | 200 | $1,010 (avg)    | $202,000         | 20.2%    |
| **Total**       | **2,400** |                  | **$999,800**     | **100%** |

### Growth Timeline

| Quarter  | Solo | Firm | Enterprise | MRR        | ARR        | Notes                               |
| -------- | ---- | ---- | ---------- | ---------- | ---------- | ----------------------------------- |
| Q1 (Mo 1-3) | 5  | 2    | 0          | $1,993     | $23,916    | Beta pilots with TAF connections    |
| Q2 (Mo 4-6) | 25 | 10   | 1          | $10,964    | $131,568   | MVP launch, first conference presence |
| Q3 (Mo 7-9) | 80 | 35   | 3          | $36,437    | $437,244   | Word-of-mouth, Law360 coverage      |
| Q4 (Mo 10-12) | 180 | 80 | 8          | $83,812    | $1,005,744 | Second conference cycle, case studies |
| Q5 (Mo 13-15) | 320 | 160 | 18         | $161,462   | $1,937,544 | Referral network active             |
| Q6 (Mo 16-18) | 500 | 300 | 35         | $284,465   | $3,413,580 | Healthcare module launch            |
| Q7 (Mo 19-21) | 700 | 500 | 80         | $469,100   | $5,629,200 | Defense module launch               |
| Q8 (Mo 22-24) | 1,000 | 800 | 140      | $739,560   | $8,874,720 | Approaching target scale            |
| Q9 (Mo 25-27) | 1,000 | 1,000 | 180    | $878,820   | $10,545,840 | Optimization phase                 |
| Q10 (Mo 28-30) | 1,000 | 1,200 | 200   | $999,800   | $11,997,600 | **$1M MRR achieved**              |

### Milestone Markers

| Milestone          | Target      | Timeline  | Significance                             |
| ------------------ | ----------- | --------- | ---------------------------------------- |
| First paying user  | 1 Solo      | Month 2   | Product-market signal                    |
| $10K MRR           | ~25 users   | Month 6   | Validates pricing model                  |
| $100K MRR          | ~250 users  | Month 13  | Series A readiness                       |
| $500K MRR          | ~1,200 users | Month 22 | Growth engine proven                     |
| $1M MRR            | ~2,400 users | Month 30 | Scale-up phase begins                    |

---

## Unit Economics

### Customer Acquisition Cost (CAC)

| Channel                        | Cost Per Lead | Conversion Rate | CAC         | % of Acquisitions |
| ------------------------------ | ------------- | --------------- | ----------- | ----------------- |
| Conference (TAF, Legaltech)    | $150          | 15%             | $1,000      | 20%               |
| Legal publications (Law360)    | $80           | 8%              | $1,000      | 15%               |
| LinkedIn targeted ads          | $40           | 5%              | $800        | 15%               |
| Content marketing / SEO        | $15           | 3%              | $500        | 10%               |
| CLE webinars                   | $25           | 10%             | $250        | 10%               |
| Referral program               | $0            | 25%             | $100        | 15%               |
| DOJ/OIG relationship network   | $50           | 20%             | $250        | 10%               |
| Free Benford's Law tool        | $5            | 2%              | $250        | 5%                |
| **Blended CAC**                |               |                 | **$500**    | **100%**          |

### Lifetime Value (LTV)

| Tier         | ARPU/Mo | Avg Lifetime | Gross Margin | LTV        |
| ------------ | ------- | ------------ | ------------ | ---------- |
| Solo         | $199    | 36 months    | 92%          | $6,595     |
| Firm         | $499    | 48 months    | 92%          | $22,034    |
| Enterprise   | $1,010  | 60 months    | 90%          | $54,540    |
| **Blended**  | **$350**| **38 months**| **91.5%**    | **$11,940**|

### LTV:CAC Ratio

| Metric          | Value      | Benchmark (Good) | Assessment       |
| --------------- | ---------- | ----------------- | ---------------- |
| **Blended LTV** | $11,940    | > $3,000          | Excellent        |
| **Blended CAC** | $500       | < $1,000          | Excellent        |
| **LTV:CAC**     | **23.9x**  | > 3x              | Exceptional      |
| **CAC Payback** | **1.5 months** | < 12 months  | Exceptional      |

> **Why LTV:CAC is so high**: FCA cases take 2-5 years. Once an attorney starts using ClaimForge for a case, they cannot switch tools mid-investigation without losing all analysis, annotations, and evidence organization. This creates extreme lock-in during the case lifecycle. Combined with low CAC from a tight-knit referral community, the ratio is exceptionally favorable.

### Gross Margin Analysis

| Cost Component                 | Per User/Mo (Blended) | % of Revenue |
| ------------------------------ | --------------------- | ------------ |
| Revenue                        | $350.00               | 100.0%       |
| OpenAI GPT-4o                  | $0.62                 | 0.2%         |
| Google Cloud Vision             | $0.38                 | 0.1%         |
| OpenAI Whisper                  | $0.18                 | 0.1%         |
| Supabase (Storage + DB)        | $0.17                 | 0.0%         |
| HelloSign                       | $1.00                 | 0.3%         |
| Vercel hosting                  | $0.50                 | 0.1%         |
| Monitoring (Sentry + Axiom)    | $0.20                 | 0.1%         |
| **Total COGS**                 | **$3.05**             | **0.9%**     |
| **Gross Profit**               | **$346.95**           | **99.1%**    |

> **Note**: This COGS excludes team salaries, office costs, and other operating expenses. Gross margin here refers to infrastructure and API costs only. Fully-loaded operating margins will be lower once team costs are included.

### Fully-Loaded Unit Economics (at $1M MRR)

| Expense Category               | Monthly Cost | % of MRR |
| ------------------------------ | ------------ | -------- |
| **Revenue (MRR)**              | $1,000,000   | 100%     |
| Infrastructure + APIs          | $30,000      | 3%       |
| Engineering team (8 people)    | $200,000     | 20%      |
| Sales + Marketing (4 people)   | $100,000     | 10%      |
| Sales + Marketing (spend)      | $80,000      | 8%       |
| Customer Success (2 people)    | $40,000      | 4%       |
| G&A (legal, accounting, ops)   | $50,000      | 5%       |
| **Total Expenses**             | **$500,000** | **50%**  |
| **Operating Income**           | **$500,000** | **50%**  |

---

## Target Customer Segments

### Segment 1: Whistleblower / Qui Tam Law Firms

**Size**: ~800 firms nationwide with active qui tam practice
**Revenue potential**: 60% of total revenue

| Attribute              | Detail                                                    |
| ---------------------- | --------------------------------------------------------- |
| Firm size              | 2-50 attorneys                                            |
| Primary user           | Lead qui tam attorney + paralegals                        |
| Budget owner           | Managing partner or practice group leader                 |
| Decision cycle         | 2-4 weeks (fast for legal tech)                           |
| Price sensitivity      | Low — cases are worth millions. Tool cost is trivial.     |
| Key driver             | Speed to case building. More cases = more revenue.        |
| Typical plan           | Firm ($499/mo) or Success Fee                            |
| Expansion triggers     | New attorneys join firm, additional practice areas         |
| Retention driver       | Active cases using the platform (cannot migrate mid-case) |

### Segment 2: Healthcare Compliance Teams

**Size**: ~5,000 hospital systems, health plans, and provider groups with compliance departments
**Revenue potential**: 20% of total revenue

| Attribute              | Detail                                                    |
| ---------------------- | --------------------------------------------------------- |
| Team size              | 3-30 compliance professionals                             |
| Primary user           | Chief Compliance Officer + compliance analysts            |
| Budget owner           | CCO or General Counsel                                    |
| Decision cycle         | 2-6 months (requires IT and legal review)                 |
| Price sensitivity      | Moderate — must justify ROI to CFO                        |
| Key driver             | Self-detection before a whistleblower does. DOJ voluntary disclosure credit. |
| Typical plan           | Enterprise ($999+/mo) with Healthcare Module add-on      |
| Expansion triggers     | Regulatory action in sector, OIG audit announcement      |
| Retention driver       | Real-time monitoring becomes operational infrastructure   |

### Segment 3: Government Contract Auditors

**Size**: ~2,000 firms performing government contract auditing (DCAA, OIG, GAO support)
**Revenue potential**: 10% of total revenue

| Attribute              | Detail                                                    |
| ---------------------- | --------------------------------------------------------- |
| Team size              | 5-50 auditors                                             |
| Primary user           | Senior auditors + forensic accountants                    |
| Budget owner           | Audit director or engagement partner                      |
| Decision cycle         | 1-3 months                                                |
| Price sensitivity      | Low — government contracts fund the tools                 |
| Key driver             | Faster audit cycles. Statistical rigor for findings.      |
| Typical plan           | Firm ($499/mo) or Enterprise ($999+/mo)                  |
| Expansion triggers     | New audit engagements, increased government spending      |
| Retention driver       | Audit methodology built around ClaimForge workflows       |

### Segment 4: Forensic Accounting Firms

**Size**: ~1,500 firms with forensic accounting practices (Big Four + regional firms + boutiques)
**Revenue potential**: 10% of total revenue

| Attribute              | Detail                                                    |
| ---------------------- | --------------------------------------------------------- |
| Team size              | 2-20 forensic accountants                                 |
| Primary user           | Senior forensic accountant + analysts                     |
| Budget owner           | Practice leader or engagement partner                     |
| Decision cycle         | 2-4 weeks (if engagement-specific), 2-4 months (if firm-wide) |
| Price sensitivity      | Low — billed to client engagement                         |
| Key driver             | Statistical analysis automation. Expert witness support.  |
| Typical plan           | Firm ($499/mo) or Enterprise ($999/mo)                   |
| Expansion triggers     | New litigation support engagements                        |
| Retention driver       | Report templates and statistical workflows customized     |

---

## Customer Acquisition Strategy

### Channel 1: Whistleblower Attorney Conferences

**Budget**: $15,000-$25,000 per event
**Expected leads**: 50-100 per conference
**Conversion**: 15% to paid

| Conference                              | Timing    | Attendees | Relevance |
| --------------------------------------- | --------- | --------- | --------- |
| TAF Annual Conference                   | Fall      | 400+      | Primary target. Every attendee is a potential customer. |
| ABA Whistleblower Summit               | Spring    | 200+      | High-quality leads, thought leadership positioning. |
| National Whistleblower Day Events       | July      | 150+      | Advocacy-oriented. Build brand as mission-aligned. |
| FCA/Qui Tam Regional Seminars          | Ongoing   | 50-100    | Smaller, higher conversion rate.                |

**Conference strategy**: Product demo booth, lunch-and-learn presentation, free Benford's Law analysis on attendee's sample data, CLE-accredited session.

### Channel 2: Legal Publications

**Budget**: $5,000-$10,000 per month
**Expected leads**: 100-200 per month
**Conversion**: 8% to paid

| Publication                   | Reach       | Format                           | Cost/Mo    |
| ----------------------------- | ----------- | -------------------------------- | ---------- |
| Law360                        | 250K+ legal professionals | Sponsored content, display ads | $5,000   |
| Bloomberg Law                 | 200K+       | Newsletter sponsorship           | $8,000     |
| National Law Journal          | 100K+       | Thought leadership articles      | $3,000     |
| ABA Journal                   | 400K+       | Display advertising              | $4,000     |
| Compliance Week                | 50K+       | Sponsored webinar                | $3,000     |

### Channel 3: DOJ/OIG Relationships

**Budget**: Minimal (networking, event attendance)
**Expected leads**: 20-50 per quarter
**Conversion**: 20% to paid

Strategy: Build relationships with DOJ Civil Fraud Section alumni who are now in private practice. These attorneys are the most respected voices in the qui tam community. Their endorsement drives adoption.

- Attend DOJ Civil Fraud Section CLE events
- Sponsor OIG outreach events
- Advisory board positions for former DOJ attorneys
- Speaking engagements at government fraud conferences

### Channel 4: LinkedIn Targeting

**Budget**: $8,000-$15,000 per month
**Expected leads**: 200-400 per month
**Conversion**: 5% to paid

| Target Audience                | Titles                                            | Estimated Size |
| ------------------------------ | ------------------------------------------------- | -------------- |
| Whistleblower attorneys        | "Qui Tam", "False Claims", "Whistleblower"       | 3,000          |
| Compliance officers            | "Chief Compliance Officer", "Compliance Director" | 25,000         |
| Forensic accountants           | "Forensic Accountant", "Fraud Examiner"           | 15,000         |
| Healthcare compliance          | "Healthcare Compliance", "Medicare Compliance"    | 20,000         |
| Government contract auditors   | "Contract Auditor", "DCAA", "Government Audit"   | 8,000          |

### Channel 5: Referral Program

**Budget**: $0 per referral (credit-based)
**Expected leads**: 15% of all acquisitions at scale
**Conversion**: 25% to paid (highest conversion of any channel)

| Referral Reward                                  | Structure                           |
| ------------------------------------------------ | ----------------------------------- |
| Referring customer receives                      | 1 month free subscription           |
| Referred customer receives                       | 14-day extended trial (vs. 7-day)  |
| Successful conversion bonus                      | Additional month free for referrer  |
| Annual referral bonus (5+ referrals)             | 1 month free                        |

> **Why referrals work**: The whistleblower attorney community is small and tight-knit. Attorneys refer cases to each other, attend the same conferences, and share tool recommendations. One satisfied attorney at TAF Conference can generate 10 referrals.

### Channel 6: Free Tool — Benford's Law Calculator

**Budget**: Development cost only
**Expected leads**: 500+ per month at scale
**Conversion**: 2% to paid (top-of-funnel)

A free, public web tool that performs Benford's Law analysis on uploaded financial data. No account required. Results include a teaser showing what ClaimForge's full analysis would reveal.

- Upload a CSV of financial figures
- Instant Benford's Law first-digit analysis
- Chi-squared test result
- Visual chart comparing expected vs. actual distribution
- CTA: "See what else ClaimForge would find in your data"

---

## Churn Analysis

### Why Churn Is Exceptionally Low

FCA cases are the strongest retention mechanism in SaaS:

| Factor                          | Impact on Churn                                        |
| ------------------------------- | ------------------------------------------------------ |
| Case duration (2-5 years)       | Users cannot cancel while a case is active. Evidence, annotations, and analysis are locked in the platform. |
| Multi-case portfolios           | Firms run 5-20 cases simultaneously. Likelihood of all cases resolving simultaneously is near zero. |
| Data gravity                    | Thousands of documents, entities, relationships, annotations. Migration cost is prohibitive. |
| Compliance requirements         | Audit trail and chain of custody requirements mean evidence must stay in the system of record. |
| Attorney workflow integration   | As attorneys build workflows around ClaimForge, switching costs increase with every case. |

### Churn Rate Projections

| Tier         | Monthly Churn | Annual Churn | Avg Lifetime | Primary Churn Reason            |
| ------------ | ------------- | ------------ | ------------ | ------------------------------- |
| Solo         | 2.3%          | 25%          | 36 months    | Attorney retires, firm merges   |
| Firm         | 1.5%          | 17%          | 48 months    | Firm acquired, practice closes  |
| Enterprise   | 0.8%          | 9%           | 60 months    | Budget cut, vendor consolidation |
| **Blended**  | **1.7%**      | **19%**      | **38 months** |                                |

### Churn Prevention Strategies

| Strategy                          | Implementation                                      |
| --------------------------------- | --------------------------------------------------- |
| Case lock-in awareness            | During onboarding, encourage uploading all case documents immediately. More data = harder to leave. |
| Annual billing incentive          | 10% discount for annual commitment reduces monthly churn decision points. |
| Success fee stickiness            | Cases on success fee model are locked until resolution. Zero churn mid-case. |
| Feature expansion                 | Continuously add features that increase platform usage (deposition prep, expert witness, compliance monitoring). |
| Community building                | ClaimForge user community (Slack/forum) creates social switching cost. |
| Quarterly business reviews        | Enterprise accounts get QBR with account manager reviewing case portfolio ROI. |

---

## Expansion Revenue

### Net Revenue Retention (NRR) Drivers

Target NRR: **125%** (expansion revenue exceeds churn and contraction)

| Expansion Vector                 | Revenue Increase | Trigger                               |
| -------------------------------- | ---------------- | ------------------------------------- |
| Solo to Firm upgrade             | +150% ($199 to $499) | Attorney hires associate or paralegal |
| Firm to Enterprise upgrade       | +100% ($499 to $999) | Firm wins large case, needs team features |
| Enterprise seat expansion        | +20-50%          | Compliance team grows, new department adopts |
| Module add-ons (Healthcare)      | +$300/month      | Firm takes healthcare fraud case      |
| Module add-ons (Defense)         | +$300/month      | Firm takes defense procurement case   |
| Success fee conversion           | Variable         | Successful case recovery triggers fee |
| Storage overage                  | +$200/TB/month   | Large case with 100K+ documents       |
| Custom fraud model               | +$500/month      | Enterprise needs industry-specific detection |

### Success Fee Revenue Projections

Success fee revenue is variable but can be significant:

| Scenario              | Cases/Year | Avg Recovery (Attorney Share) | Fee (2%) | Annual Revenue |
| --------------------- | ---------- | ----------------------------- | -------- | -------------- |
| Conservative          | 20         | $500,000                      | $10,000  | $200,000       |
| Base                  | 50         | $1,000,000                    | $20,000  | $1,000,000     |
| Optimistic            | 100        | $2,000,000                    | $40,000  | $4,000,000     |

> **Note**: Success fee revenue is lumpy and unpredictable but has no marginal cost. It is pure profit on top of subscription revenue. A single $25M recovery generates $500K in success fees.

### Expert Witness Marketplace (Year 2+)

Future expansion into connecting attorneys with forensic accounting expert witnesses through the platform:

| Revenue Component        | Pricing                    | Revenue to ClaimForge      |
| ------------------------ | -------------------------- | -------------------------- |
| Expert witness matching  | $500 per engagement        | ClaimForge earns $500      |
| Expert report generation | $200/report (platform fee) | ClaimForge earns $200      |
| Expert witness directory | $99/month listing fee      | Recurring directory revenue |

---

## Financial Summary

### Revenue Projections (5-Year)

| Year   | Subscription MRR | Success Fee Rev | Total ARR  | Headcount | Operating Margin |
| ------ | ---------------- | --------------- | ---------- | --------- | ---------------- |
| Year 1 | $84K             | $50K            | $1.1M      | 4         | -40%             |
| Year 2 | $500K            | $500K           | $6.5M      | 12        | 15%              |
| Year 3 | $1M              | $2M             | $14M       | 25        | 35%              |
| Year 4 | $2M              | $4M             | $28M       | 40        | 40%              |
| Year 5 | $3.5M            | $6M             | $48M       | 60        | 45%              |

### Key Metrics Dashboard

| Metric                    | Month 6    | Month 12   | Month 18   | Month 24   | Month 30   |
| ------------------------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| MRR                       | $11K       | $84K       | $284K      | $740K      | $1M        |
| Total Customers           | 37         | 268        | 835        | 1,880      | 2,400      |
| Blended ARPU              | $297       | $313       | $340       | $394       | $417       |
| CAC                       | $800       | $600       | $500       | $450       | $420       |
| Monthly Churn             | 3.0%       | 2.5%       | 2.0%       | 1.8%       | 1.7%       |
| NRR                       | 100%       | 110%       | 118%       | 123%       | 125%       |
| LTV:CAC                   | 12x        | 16x        | 20x        | 23x        | 24x        |
| Gross Margin              | 95%        | 95%        | 96%        | 97%        | 97%        |

---

## Competitive Pricing Analysis

| Competitor           | Price Point     | What They Offer              | ClaimForge Advantage            |
| -------------------- | --------------- | ---------------------------- | ------------------------------- |
| Relativity           | $15K-$50K/year  | General e-discovery          | 10x cheaper, FCA-specific       |
| Everlaw              | $10K-$30K/year  | Cloud e-discovery            | 5x cheaper, fraud detection built-in |
| Nuix                 | $20K-$100K/year | Investigative analytics      | 10x cheaper, FCA-focused        |
| FICO Fraud           | Enterprise only | Consumer fraud scoring       | Different market, complementary |
| Manual process       | $500K+/year     | Paralegals + forensic accountants | 10x faster, 50x cheaper      |

> **Pricing position**: ClaimForge is priced below enterprise e-discovery tools but above general legal tech SaaS. The pricing reflects the specialized value and the high willingness to pay in fraud litigation.

---

## Fundraising Implications

### Pre-Seed / Seed (Month 0-6)

| Metric                  | Target                                              |
| ----------------------- | --------------------------------------------------- |
| Raise                   | $1.5M-$2.5M                                        |
| Valuation (pre-money)   | $8M-$12M                                            |
| Use of funds            | Engineering (60%), domain advisory (15%), first customers (15%), operations (10%) |
| Milestone               | MVP with 5 pilot law firms, $10K MRR               |

### Series A (Month 12-18)

| Metric                  | Target                                              |
| ----------------------- | --------------------------------------------------- |
| Raise                   | $8M-$12M                                            |
| Valuation (pre-money)   | $40M-$60M                                           |
| Use of funds            | Engineering (40%), sales+marketing (30%), compliance/security (15%), operations (15%) |
| Milestone               | $100K MRR, 250+ customers, SOC 2 Type I            |

### Series B (Month 24-30)

| Metric                  | Target                                              |
| ----------------------- | --------------------------------------------------- |
| Raise                   | $25M-$40M                                           |
| Valuation (pre-money)   | $150M-$250M                                         |
| Use of funds            | Sales expansion (35%), engineering (30%), international (15%), operations (20%) |
| Milestone               | $1M MRR, 2,400+ customers, vertical modules launched |

---

## Risk Factors

| Risk                           | Probability | Impact | Mitigation                                    |
| ------------------------------ | ----------- | ------ | --------------------------------------------- |
| AI accuracy insufficient       | Medium      | High   | Human-in-the-loop review. Confidence scoring. Conservative claims. |
| Attorney adoption slow         | Medium      | High   | Success fee model removes financial barrier. Free Benford's tool for top-of-funnel. |
| Data breach / security incident | Low        | Critical | SOC 2 from day one. Per-case encryption. Annual pen testing. |
| OpenAI pricing increases       | Medium      | Low    | Multi-model support. Local LLM fallback path. Low API cost ratio (< 1% of revenue). |
| Competitor enters market       | Medium      | Medium | First-mover advantage. Fraud pattern library is a moat. Network effects from case data. |
| Regulatory change (FCA reform) | Low         | High   | Diversify to compliance monitoring (not just litigation). State FCA laws provide resilience. |
| Key customer concentration     | Low         | Medium | Diversify across segments. No customer > 5% of revenue. |

---

*Every dollar we earn represents thousands recovered from fraud. Our revenue model aligns profit with justice.*
