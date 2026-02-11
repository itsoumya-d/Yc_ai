# Revenue Model

## Pricing Tiers

### Free Tier — $0/month

**Purpose:** Low-friction entry point to demonstrate value. Users experience the "magic moment" of scanning a bill and seeing overcharges identified for the first time, creating strong upgrade motivation.

**Includes:**
- 3 bill scans per month
- Basic overcharge detection (identifies overcharges but limits detail)
- Overcharge summary (shows total potential savings)
- Educational content (tips for disputing bills manually)

**Does Not Include:**
- Dispute letter generation
- AI phone calls
- Bank account monitoring
- Detailed CPT code analysis
- Success tracking dashboard

**Conversion Strategy:** After the first scan reveals overcharges, users see: "You could save $342. Upgrade to Pro to generate a dispute letter and get your money back." The gap between seeing the problem and being able to solve it drives conversion.

---

### Pro Tier — $14.99/month

**Purpose:** The core subscription for active bill fighters. Unlimited scanning, full analysis, dispute letters, and bank monitoring cover the needs of most consumers.

**Includes:**
- Unlimited bill scans
- Full overcharge detection with detailed analysis
- CPT code comparison for medical bills
- Dispute letter generation (unlimited)
- Bank account monitoring via Plaid (1 bank connection)
- Push notifications for detected fees
- Success tracking dashboard
- Achievement badges
- Email support

**Does Not Include:**
- AI phone calls
- Medical billing advocacy
- Multiple bank connections
- Priority support

**Value Proposition:** At $14.99/month ($180/year), a single successful dispute saving $200+ pays for the entire year of service. The average Pro user saves $1,200+ per year, representing an 8x return on their subscription cost.

---

### Concierge Tier — $39.99/month

**Purpose:** Premium tier for users who want fully autonomous bill fighting. The AI handles everything, including making phone calls to negotiate on the user's behalf.

**Includes:**
- Everything in Pro, plus:
- AI phone calls for negotiation (up to 5 calls/month)
- Medical billing advocacy (specialized medical bill analysis and dispute)
- Multiple bank connections (up to 5 banks)
- Insurance claim appeal assistance
- Utility rate comparison and switching
- Priority support (24-hour response)
- Monthly savings report

**Value Proposition:** At $39.99/month ($480/year), a single successful medical bill negotiation (average savings $800+) pays for the entire year. Concierge users save an average of $3,600+ per year, representing a 7.5x return.

---

### Performance Fee — 25% of Verified Savings Over $100

**Purpose:** Aligns Claimback's revenue with user outcomes. Users only pay when they actually save money, creating trust and incentivizing Claimback to maximize savings.

**How It Works:**
- Applies to all tiers (Free, Pro, Concierge) when Claimback's actions result in verified savings
- Only charged on savings exceeding $100 per dispute (the first $100 saved is free)
- Verification: savings must be confirmed via provider credit confirmation, adjusted bill, or bank statement reflecting the refund
- Charged after verification, not at dispute initiation
- Billed via Stripe invoice, charged to the user's payment method on file

**Examples:**
| Savings Amount | Performance Fee | User Keeps | Claimback Earns |
|---------------|----------------|------------|-----------------|
| $50 (under threshold) | $0.00 | $50.00 | $0.00 |
| $100 (at threshold) | $0.00 | $100.00 | $0.00 |
| $200 | $25.00 (25% of $100) | $175.00 | $25.00 |
| $500 | $100.00 (25% of $400) | $400.00 | $100.00 |
| $1,000 | $225.00 (25% of $900) | $775.00 | $225.00 |
| $2,500 | $600.00 (25% of $2,400) | $1,900.00 | $600.00 |

**Competitive Comparison:**
- CoPatient (human advocates): 30-50% of savings, no threshold
- Resolve Medical Bills: 30% of savings, no threshold
- Rocket Money: 30-60% of negotiated savings
- Claimback: 25% of savings over $100 -- lower rate AND a free threshold

---

## Unit Economics

### Average Revenue Per User (ARPU)

| Revenue Source | % of Users | Avg Revenue/User/Mo | Weighted ARPU |
|---------------|-----------|---------------------|---------------|
| Free tier | 60% | $0 (sub) + $2.50 (perf fees) | $1.50 |
| Pro tier | 28% | $14.99 (sub) + $8.00 (perf fees) | $6.44 |
| Concierge tier | 12% | $39.99 (sub) + $25.00 (perf fees) | $7.80 |
| **Blended ARPU** | **100%** | | **$15.74** |

*Note: The $22 ARPU target includes maturation effects -- as the platform accumulates success data, performance fees increase. Early-stage ARPU is ~$16, growing to $22+ by Month 12 as AI negotiation success rates improve from 60% to 78%+.*

### Target ARPU: $22/month

At $22 ARPU, reaching $1M MRR requires:

```
$1,000,000 / $22 = 45,455 paying customers
```

With a 12% free-to-paid conversion rate, this requires approximately 378,788 total users (including free tier).

### Customer Lifetime Value (LTV)

```
LTV = ARPU / Monthly Churn Rate
LTV = $22 / 0.06 (6% monthly churn)
LTV = $366.67

Conservative estimate (accounting for churn acceleration over time):
LTV = $264 (using 8.3% effective churn over 12-month average lifetime)
```

**LTV by tier:**

| Tier | Monthly Revenue | Avg Lifetime | LTV |
|------|----------------|-------------|-----|
| Free (with perf fees) | $2.50 | 6 months | $15 |
| Pro | $22.99 | 14 months | $322 |
| Concierge | $64.99 | 18 months | $1,170 |
| **Blended** | **$22.00** | **12 months** | **$264** |

### Customer Acquisition Cost (CAC)

| Channel | CAC | % of Acquisition |
|---------|-----|-------------------|
| Organic/viral (TikTok, Instagram) | $3 | 35% |
| SEO / content marketing | $8 | 20% |
| Reddit / community | $5 | 15% |
| Influencer partnerships | $15 | 15% |
| Paid social (Meta, TikTok ads) | $35 | 10% |
| Referral program | $10 | 5% |
| **Blended CAC** | **$18** | **100%** |

### LTV:CAC Ratio

```
LTV:CAC = $264 / $18 = 14.7:1
```

This ratio is exceptional (industry benchmark is 3:1 for healthy SaaS). The high ratio is driven by:
1. **Low blended CAC** due to inherently viral content (bill fight videos)
2. **High LTV** due to performance fees on top of subscriptions
3. **Natural retention** because users have ongoing bills to fight

### Payback Period

```
Payback Period = CAC / Monthly ARPU
Payback Period = $18 / $22 = 0.82 months
```

Users pay back their acquisition cost in less than one month, enabling aggressive reinvestment in growth.

---

## Monthly Churn Analysis

### Target: 6% Monthly Churn

| Churn Factor | Impact | Mitigation |
|-------------|--------|-----------|
| Seasonal billing cycles | Higher churn when users have no active bills | Bank monitoring provides continuous value |
| Perceived value gap | Users who don't find overcharges may churn | Proactive fee monitoring and savings alerts |
| Price sensitivity | $14.99-$39.99 feels expensive if savings are low | Performance fee model ensures value alignment |
| Competition | Rocket Money or manual disputes | AI phone calls are a unique differentiator |
| App fatigue | Users forget about the app | Weekly savings reports and fee notifications |

### Churn Reduction Strategies

1. **Continuous value delivery:** Bank monitoring detects fees automatically, so users receive value even when not actively scanning bills
2. **Savings reminders:** Weekly push notifications: "Claimback has saved you $1,247 since you joined"
3. **Seasonal campaigns:** "Tax season bill review" (February-April), "Year-end medical bill audit" (October-December)
4. **Win streaks:** Gamification that rewards consecutive months of savings
5. **Proactive scanning prompts:** "Did you get a new medical bill? Scan it to check for overcharges"
6. **Annual plan discount:** $119.99/year for Pro (33% savings) to lock in long-term commitment

### Churn by Tier

| Tier | Monthly Churn | Avg Lifetime | Reason |
|------|--------------|-------------|--------|
| Free | 15% | 6 months | Low commitment, limited value |
| Pro | 7% | 14 months | Good value but may not use AI calls |
| Concierge | 4% | 18+ months | Highest value, most engaged, AI calls create stickiness |

---

## Conversion Funnel

### Free to Paid Conversion: 12%

```
Download App ─────────── 100%
  │
  ├── Complete Onboarding ── 70%
  │
  ├── First Bill Scan ────── 55%
  │
  ├── See Overcharges ────── 42% (76% of scans find at least one issue)
  │
  ├── Hit Paywall ────────── 38% (try to generate dispute letter)
  │
  ├── Start Trial ────────── 20%
  │
  └── Convert to Paid ────── 12%
```

### Pro to Concierge Upgrade: 15%

```
Active Pro User ────────── 100%
  │
  ├── Has dispute needing call ── 60%
  │
  ├── Sees AI call feature ────── 55%
  │
  ├── Hits Concierge paywall ──── 40%
  │
  └── Upgrades to Concierge ──── 15%
```

### Key Conversion Triggers

1. **First overcharge discovery:** Seeing a specific dollar amount you're being overcharged is the strongest conversion trigger
2. **Failed manual dispute:** Users who try to dispute on their own and fail are 3x more likely to upgrade
3. **Large medical bill:** Medical bills over $1,000 with identified errors convert at 25%+
4. **Bank fee accumulation:** Users who see $50+ in monthly bank fees are highly motivated to upgrade
5. **Social proof:** Seeing platform-wide stats ("$4.2M saved for 12,000 users") increases conversion by 40%

---

## Growth Timeline

### Q1: Pre-Launch (Months 1-3)
| Metric | Target |
|--------|--------|
| Waitlist signups | 5,000 |
| Beta users | 500 |
| Bill scans (total) | 2,500 |
| First disputes filed | 200 |
| Revenue | $0 (free beta) |

**Activities:**
- Build MVP with camera scanning, overcharge detection, dispute letters
- Beta test with 500 users from waitlist
- Create 10+ TikTok/Instagram bill fight demo videos
- Build relationships with 5 personal finance influencers
- Collect testimonials and savings stories from beta users

### Q2: Launch (Months 4-6)
| Metric | Target |
|--------|--------|
| Total users | 8,000 |
| Paying users | 600 |
| MRR | $9,000 |
| Total savings for users | $180,000 |
| Disputes filed | 3,000 |

**Activities:**
- Public App Store/Google Play launch
- AI phone agent goes live (Concierge tier)
- First influencer partnerships launch (3-5 creators)
- Launch r/personalfinance and r/povertyfinance community presence
- First viral bill fight video (target: 1M+ views)
- SEO content: "How to dispute a medical bill" guides

### Q3: Growth (Months 7-9)
| Metric | Target |
|--------|--------|
| Total users | 35,000 |
| Paying users | 4,200 |
| MRR | $65,000 |
| Total savings for users | $1.2M |
| AI phone calls completed | 2,000 |

**Activities:**
- Scale influencer program to 15-20 creators
- Launch referral program ($10 credit for referrer and referee)
- Expand bank fee monitoring to auto-dispute
- Launch insurance claims navigator (post-MVP feature)
- Begin paid social advertising (Meta, TikTok)
- PR push: consumer advocacy angle, "AI vs. medical billing" story

### Q4: Acceleration (Months 10-12)
| Metric | Target |
|--------|--------|
| Total users | 100,000 |
| Paying users | 12,000 |
| MRR | $220,000 |
| Total savings for users | $4.5M |
| Win rate | 72% |

**Activities:**
- Optimize AI phone negotiation scripts based on 5,000+ call outcomes
- Launch utility rate comparison feature
- Annual plan offering (33% discount for commitment)
- Enterprise partnerships with employee benefits platforms
- Media coverage in consumer finance publications
- Apply for Y Combinator (if not already participating)

### Q5: Scale (Months 13-16)
| Metric | Target |
|--------|--------|
| Total users | 300,000 |
| Paying users | 45,455 |
| **MRR** | **$1,000,000** |
| Total savings for users | $15M |
| Win rate | 78% |
| Team size | 15-20 |

**Activities:**
- Reach $1M MRR milestone
- Raise Series A ($10-15M at $80-120M valuation)
- Launch small business tier
- Begin international expansion research
- Hire dedicated data science team for AI optimization
- SOC 2 Type II compliance certification

---

## Revenue Breakdown at $1M MRR

| Revenue Source | Monthly Revenue | % of MRR |
|---------------|----------------|----------|
| Pro subscriptions (28% of 45,455 = 12,727 users at $14.99) | $190,738 | 19.1% |
| Concierge subscriptions (12% of 45,455 = 5,455 users at $39.99) | $218,145 | 21.8% |
| Performance fees (all tiers) | $591,117 | 59.1% |
| **Total** | **$1,000,000** | **100%** |

**Key Insight:** Performance fees become the dominant revenue source at scale because the AI gets better at saving money over time. As win rates improve from 60% to 78%, performance fee revenue per user increases significantly. This creates a powerful flywheel: better AI > more savings > more performance fees > more revenue to invest in better AI.

---

## Customer Acquisition Channels

### 1. Viral TikTok & Instagram Content (35% of acquisition)

**Strategy:** Create and distribute short-form videos showing the dramatic before/after of AI bill fighting. The emotional arc of "I got a $4,200 hospital bill... then my AI called and negotiated it down to $1,200" is inherently compelling content.

**Content Types:**
- Screen recordings of bill scanning with overcharge reveal
- AI phone call transcripts with real-time savings counter
- Before/after bill comparisons
- "I saved $X in Y minutes" testimonials
- "Bill fight of the week" series featuring the most outrageous overcharges
- Educational content: "5 medical billing errors on every bill"

**Metrics:** 3-5 posts per week, targeting 500K-2M impressions per post, 0.5% app install rate per view

### 2. SEO & Content Marketing (20% of acquisition)

**Strategy:** Capture high-intent search traffic from people actively looking for help with their bills.

**Target Keywords:**
- "how to dispute a medical bill" (12,100 monthly searches)
- "fight hospital bill" (3,600)
- "overdraft fee reversal" (8,100)
- "medical bill too high" (6,600)
- "insurance claim denied what to do" (4,400)
- "negotiate phone bill" (5,400)
- "medical billing errors" (9,900)

**Content Strategy:**
- Long-form guides for each keyword cluster
- State-specific medical billing rights guides (50 states)
- Provider-specific dispute guides (top 20 hospitals, banks, insurance companies)
- Interactive "bill audit checklist" tools
- Free bill scanning tool (web version, leads to app download)

### 3. Reddit & Community Marketing (15% of acquisition)

**Strategy:** Become a trusted resource in personal finance communities where bill frustration is a daily topic.

**Target Communities:**
- r/personalfinance (18M members)
- r/povertyfinance (2.8M members)
- r/insurance (220K members)
- r/HealthInsurance (125K members)
- r/Frugal (3.5M members)
- r/CreditCards (580K members)
- Facebook groups: Medical Bill Help, Consumer Advocacy

**Approach:** Share genuine, helpful advice about disputing bills. Include Claimback as a tool when relevant, but lead with value. Community members who see Claimback mentioned consistently in helpful contexts become organic advocates.

### 4. Influencer Partnerships (15% of acquisition)

**Strategy:** Partner with personal finance creators who have engaged audiences in Claimback's target demographic.

**Tiers:**
- **Mega influencers** (1M+ followers): 2-3 partnerships for brand awareness
- **Mid-tier** (100K-1M followers): 10-15 partnerships for consistent reach
- **Micro-influencers** (10K-100K followers): 50+ partnerships for niche targeting
- **Nano-influencers** (1K-10K followers): User-generated content program

**Partnership Models:**
- Sponsored content: $500-5,000 per post depending on reach
- Affiliate: $5-10 per paid conversion (CPA)
- Revenue share: 10% of first-year revenue from referred users
- Equity: offer small equity stakes to top-performing influencers (advisory shares)

### 5. Paid Social Advertising (10% of acquisition)

**Strategy:** Scale proven organic content into paid distribution once CAC economics are validated.

**Platforms:**
- TikTok Ads: Video ads using top-performing organic content
- Meta Ads (Facebook/Instagram): Retargeting website visitors and app installers
- Google Ads: Capture high-intent search queries (branded and non-branded)
- Apple Search Ads: App Store discovery for relevant keywords

**Budget Allocation:**
- Months 1-6: $0 (organic only, validate content and CAC)
- Months 7-9: $5,000/month (test and optimize)
- Months 10-12: $20,000/month (scale winners)
- Months 13-16: $50,000-100,000/month (aggressive scaling with proven CAC)

### 6. Referral Program (5% of acquisition)

**Structure:**
- Referrer receives $10 account credit per successful referral
- Referee receives $10 account credit on signup
- Referrer receives 10% of referee's performance fees for first year
- Leaderboard and bonus tiers for top referrers

**Mechanics:**
- Unique referral link and code per user
- Shareable "savings card" after each win (branded image with savings amount + referral code)
- In-app referral prompt after every successful dispute: "Share your win and earn $10"
- Deep link for seamless referral attribution

---

## Expansion Revenue Opportunities

### Year 2: New Revenue Streams

**1. Small Business Tier — $99-299/month**
- Vendor invoice scanning and rate verification
- Commercial insurance analysis
- Business bank fee monitoring
- Employee expense audit
- Tax deduction identification
- Estimated market: 33M small businesses in the US

**2. Insurance Plan Optimization — $49.99 one-time**
- Annual insurance plan comparison during open enrollment
- Out-of-pocket cost modeling based on user's health history
- Plan switching recommendation with estimated savings
- Estimated take rate: 15% of active users during open enrollment (October-December)

**3. Tax Deduction Report — $29.99 one-time**
- Annual report of all medical expenses, bank fees, and other potentially deductible charges
- Formatted for import into TurboTax, H&R Block, or accountant handoff
- Estimated take rate: 20% of active users during tax season (January-April)

### Year 3+: Expansion Markets

**4. International Expansion**
- Canada (universal healthcare but prescription and dental billing issues)
- United Kingdom (private insurance disputes, utility overcharges)
- Australia (private health insurance, utility deregulation)
- Estimated addressable market expansion: 3-5x the US market

**5. White-Label API**
- License Claimback's bill analysis and dispute technology to:
  - Banks (offer to customers as a retention feature)
  - Insurance companies (reduce claim disputes through proactive billing audit)
  - Employee benefits platforms (offer as a workplace perk)
  - Financial advisors (add bill fighting to their service offering)
- Pricing: $0.50-2.00 per API call or $5-10 per user per month

**6. Data & Insights**
- Anonymized billing data analytics for:
  - Healthcare policy researchers
  - Consumer advocacy organizations
  - Insurance regulators
  - Hospital pricing transparency initiatives
- Revenue model: enterprise data licensing agreements ($50K-500K/year)

---

## Financial Projections Summary

| Month | Total Users | Paying Users | MRR | ARR (Annualized) | Cumulative Savings |
|-------|-------------|-------------|------|-------------------|-------------------|
| 3 | 1,000 | 60 | $1,320 | $15,840 | $25,000 |
| 6 | 8,000 | 600 | $9,000 | $108,000 | $200,000 |
| 9 | 35,000 | 4,200 | $65,000 | $780,000 | $1,400,000 |
| 12 | 100,000 | 12,000 | $220,000 | $2,640,000 | $5,000,000 |
| 14 | 200,000 | 27,000 | $594,000 | $7,128,000 | $10,000,000 |
| 16 | 380,000 | 45,455 | $1,000,000 | $12,000,000 | $20,000,000 |

### Key Metrics at $1M MRR

| Metric | Value |
|--------|-------|
| Monthly Recurring Revenue | $1,000,000 |
| Annual Run Rate | $12,000,000 |
| Total Users | ~380,000 |
| Paying Users | 45,455 |
| ARPU | $22 |
| Conversion Rate | 12% |
| Monthly Churn | 6% |
| CAC | $18 |
| LTV | $264 |
| LTV:CAC | 14.7:1 |
| Payback Period | <1 month |
| Gross Margin | 87% |
| Total Savings Delivered | $20,000,000+ |
| AI Phone Calls Completed | 50,000+ |
| Win Rate | 78% |

### Path to Fundraising

| Stage | Timeline | Amount | Valuation | Milestone |
|-------|----------|--------|-----------|-----------|
| Pre-Seed | Month 1-3 | $500K | $5M | MVP + 500 beta users |
| Seed / YC | Month 4-8 | $2M | $20M | Launch + $50K MRR |
| Series A | Month 14-16 | $15M | $120M | $1M MRR + 78% win rate |
| Series B | Month 24-28 | $50M | $500M | $5M MRR + international |
