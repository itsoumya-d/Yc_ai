# Taxonaut -- Features

> Complete feature roadmap from MVP through Year 2+, with user stories, edge cases, and development timeline.

---

## Feature Philosophy

Taxonaut is built on one principle: **proactive beats reactive**. Every feature is evaluated by a single question -- does this help the user pay less in taxes before tax season arrives?

Features are NOT about:
- Filing taxes (there are enough tools for that)
- Replacing accountants entirely (CPAs handle complex situations)
- Being a general bookkeeping tool (QuickBooks exists)

Features ARE about:
- Finding money the user is leaving on the table
- Timing decisions to minimize tax impact
- Making complex tax strategy accessible to non-experts
- Turning tax from an annual panic into a background process

---

## MVP -- Months 1-6

### 1. Bank Account Connection (Plaid Integration)

Connect checking accounts, savings accounts, and credit cards to automatically import transactions.

**User Stories:**
- As a freelancer, I want to connect my business checking account so Taxonaut can automatically track my income and expenses
- As a user with multiple accounts, I want to connect all my financial accounts in one place so I get a complete tax picture
- As a security-conscious user, I want to understand exactly what data Taxonaut can access before connecting my accounts

**Features:**
- Plaid Link integration (bank search, credential entry, MFA handling)
- Support for checking, savings, credit card, and business accounts
- Real-time balance display for each connected account
- Transaction sync (initial 24-month historical pull, then real-time via webhooks)
- Account health status indicators (connected, syncing, error, disconnected)
- Reconnect flow for expired connections (Plaid tokens expire)
- Ability to disconnect and delete account data

**Edge Cases:**
- User has accounts at banks not supported by Plaid (show manual entry option)
- Plaid connection drops mid-setup (retry mechanism with state preservation)
- Bank requires re-authentication every 90 days (proactive notification before expiry)
- User connects personal and business accounts (flag for separation in categorization)
- Duplicate transactions from connected account and manual entry (dedup logic)
- Joint bank accounts where only a portion is business-related (percentage split option)

**Dev Timeline:** 3 weeks

---

### 2. Automatic Transaction Categorization

AI-powered categorization of every transaction into IRS-compliant tax categories.

**User Stories:**
- As a freelancer, I want my transactions automatically categorized so I do not have to manually sort hundreds of entries
- As a user, I want to see why Taxonaut categorized a transaction a certain way so I can verify accuracy
- As a user, I want to correct miscategorized transactions so Taxonaut learns my patterns

**Features:**
- Automatic categorization using AI (GPT-4o) with IRS Schedule C categories
- Confidence score display (high/medium/low) for each categorization
- Manual override with category picker (learning from corrections)
- Bulk categorization for recurring transactions (e.g., "Always categorize Spotify as Software/Subscriptions")
- Business vs personal split (mark transactions as 100% business, partial, or personal)
- Category rules engine (if merchant = X, always categorize as Y)
- Uncategorized transaction queue with suggested categories
- Search and filter by category, date range, amount, account

**IRS Schedule C Categories Supported:**
- Advertising and marketing
- Car and truck expenses
- Contract labor
- Insurance (business)
- Interest (mortgage, business loans)
- Legal and professional services
- Office expenses
- Rent or lease
- Repairs and maintenance
- Supplies
- Taxes and licenses
- Travel
- Meals (50% deductible)
- Utilities
- Home office (simplified and actual method)
- Software and subscriptions
- Education and training
- Equipment and depreciation

**Edge Cases:**
- Transaction description is ambiguous ("AMAZON" could be business or personal)
- Split transactions (dinner that is 50% business, 50% personal)
- Refunds and returns (negative amounts must reverse the original category)
- Foreign currency transactions (conversion to USD at transaction date rate)
- Cash transactions without bank records (manual entry workflow)
- Large one-time purchases that could be expensed or depreciated

**Dev Timeline:** 4 weeks

---

### 3. Real-Time Tax Liability Estimator

A continuously updating estimate of federal and state tax liability based on current YTD income and deductions.

**User Stories:**
- As a freelancer, I want to know my estimated tax bill at any moment so I can plan my cash flow
- As a user, I want to see how my tax liability changes when I make a large purchase so I can time expenses strategically
- As a user, I want separate views of federal vs state tax liability

**Features:**
- Real-time federal income tax estimate (using current year brackets)
- Self-employment tax calculation (Social Security + Medicare, 15.3%)
- State income tax estimate (all 50 states + DC)
- Effective tax rate display
- Marginal tax rate display (what the next dollar earned is taxed at)
- YTD income tracking (broken down by month)
- YTD deduction tracking (broken down by category)
- "What if" scenario tool (what if I earn $X more? what if I spend $Y on equipment?)
- Comparison to prior year (are you on track to owe more or less?)
- Tax bracket visualization (where you are in your current bracket, how close to the next)

**Calculation Methodology:**
- Federal: Apply progressive tax brackets to (Gross Income - Deductions - QBI deduction)
- SE Tax: 92.35% of net earnings x 15.3% (Social Security cap applied)
- State: State-specific rates applied to state taxable income
- Update frequency: Recalculate on every new transaction or user edit

**Edge Cases:**
- User crosses into a new tax bracket mid-year (update marginal rate display)
- User lives in one state but works in another (multi-state allocation)
- User's income is highly variable month to month (show rolling estimate, not linear projection)
- Negative net income months (carry forward, show impact on annual picture)
- User has W-2 income AND freelance income (combined tax picture)

**Dev Timeline:** 3 weeks

---

### 4. Deduction Finder

AI-powered scanner that identifies missed deductions in transaction history.

**User Stories:**
- As a freelancer, I want Taxonaut to find deductions I am missing so I can reduce my tax bill
- As a user, I want to understand WHY something is deductible with a plain-English explanation
- As a user new to freelancing, I want to learn about deductions I did not know existed

**Features:**
- Automatic scan of all transactions for potential deductions
- Missed deduction alerts ("You drove 2,400 miles this month but haven't logged mileage -- potential $1,584 deduction")
- Deduction explanations with IRS code references
- Deduction documentation requirements (what receipts/records to keep)
- Deduction limits and phase-outs (meals at 50%, home office caps)
- Common deductions checklist (have you considered these?)
- Annual deduction summary with category breakdown
- Savings counter (total deductions found by Taxonaut in dollars)

**Common Deductions Identified:**
- Home office (simplified: $5/sq ft up to 300 sq ft, or actual expenses)
- Vehicle mileage (standard rate vs actual expenses)
- Health insurance premiums (self-employed health insurance deduction)
- Retirement contributions (SEP IRA, Solo 401k)
- Software and subscriptions used for business
- Professional development, courses, books
- Internet and phone (business percentage)
- Business meals (50% deductible with documentation)
- Travel expenses for business purposes
- Professional services (legal, accounting)
- Business insurance
- Equipment purchases (Section 179 immediate expensing)

**Edge Cases:**
- Deduction that requires additional documentation the user may not have (guide them on reconstruction)
- Deductions that conflict (standard mileage vs actual vehicle expenses -- cannot use both)
- Home office deduction for users in apartments vs owned homes
- Shared expenses between two freelancers in same household
- Hobby vs business distinction (IRS 3-of-5-year profit test)

**Dev Timeline:** 4 weeks

---

### 5. Quarterly Estimated Tax Calculator with Reminders

Calculate quarterly estimated tax payments and send reminders before deadlines.

**User Stories:**
- As a freelancer, I want to know exactly how much to pay in quarterly estimates so I avoid underpayment penalties
- As a user, I want reminders before each quarterly deadline so I never miss a payment
- As a user, I want to track what I have already paid vs what I owe

**Features:**
- Quarterly estimated tax calculation using IRS safe harbor rules
- Two methods: 100% of prior year liability OR 90% of current year liability
- Payment amount recommendations with explanation of safe harbor
- Deadline tracking with countdown timers (April 15, June 15, September 15, January 15)
- Native desktop notifications 2 weeks and 3 days before each deadline
- Payment history tracker (record payments made via EFTPS or check)
- Underpayment penalty calculator (if you miss a payment, how much is the penalty?)
- Annualized income installment method for irregular income
- IRS Form 1040-ES pre-fill data export

**Safe Harbor Rules Explained in App:**
- Pay 100% of prior year tax liability (110% if AGI > $150K) OR
- Pay 90% of current year tax liability
- Meeting either threshold avoids underpayment penalties

**Edge Cases:**
- User just started freelancing and has no prior year data (use current year projection only)
- User's income is heavily weighted to Q4 (annualized installment method is better)
- User made a large estimated payment that exceeds the quarterly amount (show credit for future quarters)
- State estimated taxes on different schedules than federal
- User receives a large one-time payment that skews estimates

**Dev Timeline:** 2 weeks

---

### 6. Basic Tax Strategy Recommendations

AI-generated suggestions for reducing tax liability based on the user's financial situation.

**User Stories:**
- As a freelancer, I want proactive suggestions for how to reduce my tax bill so I keep more of what I earn
- As a user, I want each recommendation ranked by potential savings so I can prioritize
- As a user, I want to understand the trade-offs of each strategy

**Features:**
- Monthly strategy generation based on current financial snapshot
- Strategies ranked by estimated dollar savings
- Plain-English explanations with IRS code references
- Implementation steps for each strategy
- Deadline awareness (strategies that are time-sensitive get priority)
- Strategy status tracking (pending, in progress, implemented, dismissed)
- "Dismiss with reason" option (helps AI learn user preferences)
- Notification when new high-value strategies are identified

**Example Strategies Generated:**
- "Contribute $6,500 to a SEP IRA before year-end to save $1,820 in taxes"
- "Your income suggests an S-Corp election could save $8,400/year in SE tax"
- "Purchase that new laptop before December 31 to deduct $2,300 via Section 179"
- "You're $3,200 below the QBI deduction threshold -- here's how to optimize"
- "Prepay January rent in December to shift $2,000 in deductions to this tax year"

**Edge Cases:**
- Strategy conflicts with another strategy (show trade-offs)
- User's situation changes mid-year (recalculate and update strategies)
- Strategy requires action by a specific date that has passed (archive with explanation)
- Strategy involves financial risk (clearly label risk level)
- User implements strategy but does it incorrectly (follow-up verification)

**Dev Timeline:** 4 weeks

---

### 7. Expense Reports

Generate professional expense reports for record-keeping, CPA sharing, or personal reference.

**User Stories:**
- As a freelancer, I want to generate expense reports to share with my accountant at tax time
- As a user, I want to export my categorized expenses as a PDF or CSV
- As a user, I want a P&L statement generated from my transaction data

**Features:**
- Profit & Loss statement (monthly, quarterly, annual)
- Expense breakdown by category with visualizations
- Tax summary report (income, deductions, estimated liability, payments made)
- Export formats: PDF, CSV, Excel
- Date range filtering
- Custom report builder (select which categories/accounts to include)
- Year-over-year comparison reports
- Report scheduling (auto-generate monthly reports)

**Dev Timeline:** 2 weeks

---

### MVP Development Summary

| Feature | Timeline | Priority | Complexity |
|---------|----------|----------|------------|
| Bank Account Connection | 3 weeks | P0 | High |
| Transaction Categorization | 4 weeks | P0 | High |
| Tax Liability Estimator | 3 weeks | P0 | Medium |
| Deduction Finder | 4 weeks | P0 | High |
| Quarterly Estimator | 2 weeks | P1 | Medium |
| Strategy Recommendations | 4 weeks | P1 | High |
| Expense Reports | 2 weeks | P2 | Low |
| **Total MVP** | **~22 weeks** | | |

Buffer for integration testing, bug fixes, and polish: 4 weeks.
**Total MVP timeline: 26 weeks (6 months).**

---

## Post-MVP -- Months 7-12

### 8. Entity Structure Optimizer (LLC vs S-Corp Analysis)

The single most impactful tax decision a freelancer can make is choosing the right business entity. Most freelancers operating as sole proprietors are overpaying $5,000-$15,000/year in self-employment tax.

**Features:**
- Side-by-side comparison of Sole Prop vs LLC vs S-Corp vs C-Corp
- Personalized savings calculation based on actual income
- Reasonable salary calculator for S-Corp (IRS compliance)
- Break-even analysis (at what income level does S-Corp make sense?)
- State-specific filing fees and compliance costs included in analysis
- Formation cost estimates and ongoing compliance requirements
- Timeline recommendation (when to make the switch)
- List of formation services (LegalZoom, Stripe Atlas, Clerky)

**Why This Matters:**
- An S-Corp election can save $8,000-$20,000/year for freelancers earning $100K+
- The savings come from avoiding self-employment tax on distributions above reasonable salary
- But S-Corp has compliance costs ($1,000-3,000/year for payroll, tax filings)
- The break-even point is typically around $60,000-80,000 net income
- Taxonaut calculates the exact break-even for each user

**Dev Timeline:** 4 weeks

---

### 9. Retirement Contribution Planner

Optimize retirement contributions for maximum tax benefit.

**Features:**
- SEP IRA vs Solo 401(k) vs Traditional IRA comparison
- Maximum contribution calculator based on net self-employment income
- Tax impact calculator (how much does a $10K contribution save?)
- Contribution deadline tracking (SEP IRA: tax filing deadline, Solo 401k: Dec 31 for employee contributions)
- Catch-up contribution eligibility (age 50+)
- Roth vs Traditional analysis based on projected future tax brackets
- Auto-contribution recommendations based on cash flow

**Contribution Limits Tracked (2024):**
- SEP IRA: 25% of net SE income, up to $69,000
- Solo 401(k): $23,000 employee + 25% employer, up to $69,000
- Traditional/Roth IRA: $7,000 ($8,000 if 50+)

**Dev Timeline:** 3 weeks

---

### 10. Income Splitting Strategies

For freelancers who are married or have family members involved in the business.

**Features:**
- Spousal hire analysis (paying spouse a salary to split income)
- Family employment strategies (employing children in the business)
- Income shifting between tax years (defer invoicing, prepay expenses)
- Gift and estate tax implications
- Qualified business income (QBI) deduction optimization through income splitting

**Dev Timeline:** 3 weeks

---

### 11. Tax Loss Harvesting for Investment Accounts

For freelancers with investment accounts alongside their business income.

**Features:**
- Connect investment accounts via Plaid
- Identify positions with unrealized losses
- Tax loss harvesting recommendations (sell losing positions to offset gains)
- Wash sale rule compliance (30-day tracking)
- Short-term vs long-term capital gains impact
- Harvest calendar (best times to harvest based on portfolio and income)

**Dev Timeline:** 4 weeks

---

### 12. CPA Collaboration Mode

Share financial data securely with an accountant or tax professional.

**Features:**
- Generate shareable read-only portal link (time-limited, password-protected)
- CPA can view: transactions, categories, deductions, strategies, reports
- CPA can leave comments and notes on specific transactions or strategies
- Export CPA-ready tax package (organized by Schedule C category)
- Audit trail of all CPA access
- Revoke access at any time

**Dev Timeline:** 4 weeks

---

### 13. State Tax Optimization for Multi-State Income

For freelancers who earn income from clients in multiple states or who are considering relocation.

**Features:**
- Multi-state income allocation
- State tax comparison tool (what if I moved to Texas vs California?)
- Nexus analysis (do you owe taxes in states where you have clients?)
- State-specific deductions and credits
- Reciprocity agreement tracking (states with mutual tax agreements)
- Remote work tax implications by state

**Dev Timeline:** 4 weeks

---

## Year 2+ Features

### 14. AI Tax Attorney for Audit Defense

If the IRS comes knocking, Taxonaut has your back.

**Features:**
- Audit risk score based on return characteristics
- Red flag identification (deductions that trigger audits)
- Documentation gap analysis (what records are you missing?)
- Audit response templates
- Correspondence audit assistant (help draft responses to IRS letters)
- Connection to vetted tax attorneys (referral marketplace)

**Dev Timeline:** 8 weeks

---

### 15. International Tax for Digital Nomads

For freelancers working abroad or earning international income.

**Features:**
- Foreign earned income exclusion calculator (FEIE)
- Foreign tax credit analysis
- Tax treaty lookup by country
- Physical presence test tracker (330 days)
- Bona fide residence test guidance
- FBAR and FATCA compliance reminders
- Currency conversion for international transactions

**Dev Timeline:** 8 weeks

---

### 16. Real Estate Tax Strategies

For freelancers who own rental property or use real estate for tax benefits.

**Features:**
- Rental income and expense tracking
- Depreciation calculator (27.5 year straight-line for residential)
- 1031 exchange analysis
- Real estate professional status qualification tracker
- Short-term rental (Airbnb) tax implications
- Home sale exclusion calculator ($250K/$500K)

**Dev Timeline:** 6 weeks

---

### 17. Crypto Tax Tracking

For freelancers paid in cryptocurrency or who trade crypto.

**Features:**
- Crypto wallet and exchange connection
- Cost basis tracking (FIFO, LIFO, specific identification)
- Capital gains/losses calculation
- Mining and staking income tracking
- DeFi transaction categorization
- NFT tax treatment
- Form 8949 data export

**Dev Timeline:** 6 weeks

---

### 18. Tax Filing Integration

Partner with filing platforms so users can one-click export to file.

**Features:**
- TurboTax export (IRS-compatible data format)
- TaxAct export
- FreeTaxUSA export
- Direct IRS e-file integration (long-term)
- Pre-populated Schedule C, Schedule SE, Form 1040-ES
- CPA-ready tax package with all supporting documents

**Dev Timeline:** 4 weeks per integration

---

### 19. Business Entity Formation

Help users form LLCs, S-Corps, and other entities directly from Taxonaut.

**Features:**
- State-specific formation wizard
- EIN application assistance
- Operating agreement templates
- S-Corp election (Form 2553) guidance
- Registered agent service partnerships
- Annual compliance calendar and reminders

**Dev Timeline:** 6 weeks

---

## Complete Development Timeline

```
Month 1-2:   Bank Connection + Transaction Categorization
Month 3:     Tax Liability Estimator + Quarterly Calculator
Month 4-5:   Deduction Finder + Strategy Recommendations
Month 6:     Expense Reports + Polish + Beta Launch
Month 7-8:   Entity Optimizer + Retirement Planner
Month 9:     Income Splitting + CPA Collaboration
Month 10-11: Tax Loss Harvesting + Multi-State
Month 12:    Polish + Scale
Year 2:      Audit Defense, International, Real Estate, Crypto, Filing Integration
```

---

## Feature Prioritization Framework

Every feature is scored on three dimensions:

| Dimension | Weight | Question |
|-----------|--------|----------|
| **Tax Savings Impact** | 40% | How much money does this save the average user? |
| **User Demand** | 35% | How many users are asking for this? |
| **Development Effort** | 25% | How long does this take to build? (inverse -- lower effort = higher score) |

Features scoring 7+ out of 10 on this framework make it into the next sprint.

---

## Disclaimer

All features provide tax education and strategy suggestions for informational purposes only. Taxonaut does not file taxes, provide legal tax advice, or act as a CPA. Users should consult qualified tax professionals before implementing any strategy.
