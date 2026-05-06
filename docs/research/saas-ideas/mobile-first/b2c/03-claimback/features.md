# Features

## MVP Features (Months 1-4)

### 1. Bill Scanning via Camera

**What it does:** Users point their phone camera at any bill (medical, bank statement, utility, insurance EOB, telecom) and the app extracts all text, line items, amounts, and dates using OpenAI Vision API.

**How it works:**
- Camera opens with a bill alignment guide overlay (rectangular frame with corner markers)
- Auto-capture triggers when bill edges are detected and image is stable (no blur)
- Image is cropped, enhanced (contrast/brightness optimization), and uploaded to Supabase Storage
- OpenAI Vision API extracts structured data: provider name, date, line items, amounts, account numbers
- Multi-page support: user can scan additional pages for multi-page bills
- Gallery import option for bills already photographed or received as images

**Technical Details:**
- Edge detection algorithm for auto-capture (detects document boundaries)
- Image quality scoring (rejects blurry or poorly-lit scans with guidance)
- Batch scanning mode for multiple bills in one session
- Local preprocessing before upload to reduce API costs and latency

**User Experience:**
- Scan completes in under 3 seconds
- Haptic feedback on successful capture
- Preview screen shows extracted data for user verification
- Edit capability for any incorrectly extracted fields

---

### 2. Overcharge Detection Engine

**What it does:** Analyzes extracted bill data against fair pricing databases, medical code lookups, and known fee patterns to identify specific overcharges with confidence scores.

**Medical Bill Analysis:**
- **CPT Code Comparison:** Each procedure code (CPT) is compared against Medicare fair pricing schedules and regional averages. Flags charges that exceed the 80th percentile for that code in the user's region.
- **Upcoding Detection:** Identifies when a lower-complexity visit (e.g., CPT 99213 - established patient, low complexity) is billed as a higher-complexity visit (e.g., CPT 99214 - moderate complexity). This is the most common medical billing error, occurring in an estimated 20-30% of medical bills.
- **Unbundling Detection:** Flags when procedures that should be billed as a single bundled code are instead billed as separate line items at higher total cost. Example: billing for individual lab tests when a panel code exists.
- **Duplicate Charge Detection:** Identifies identical charges on the same date of service.
- **Balance Billing Violations:** Detects when in-network providers bill beyond the allowed insurance amount, which violates the No Surprises Act for emergency and certain non-emergency services.
- **Modifier Errors:** Checks for missing or incorrect CPT modifiers that affect pricing.

**Bank Fee Analysis:**
- Identifies overdraft fees, maintenance fees, ATM fees, and other service charges
- Cross-references against bank-specific waiver policies (e.g., Chase waives one overdraft fee per year on request)
- Flags recurring fees that may be eliminable (paper statement fees, account maintenance)
- Detects fee patterns that indicate the user qualifies for a fee-free account tier

**Insurance EOB Analysis:**
- Compares provider charges against insurance allowed amounts
- Identifies surprise billing from out-of-network providers at in-network facilities
- Flags coordination of benefits errors for users with multiple insurance plans
- Detects denied claims that may be overturnable on appeal

**Utility & Telecom Analysis:**
- Compares rates against publicly available rate schedules
- Identifies unexplained surcharges and fees
- Flags rate increases that weren't properly disclosed
- Detects billing for services not requested or received

**Output:**
- Each overcharge flagged with: description, billed amount, fair amount, overcharge amount, confidence score (0-100%), and recommended action
- Total potential savings calculated and prominently displayed
- Color-coded severity: red (high confidence overcharge), yellow (possible overcharge), green (fair pricing)

---

### 3. Dispute Letter Generation

**What it does:** Automatically generates professional, legally-informed dispute letters customized to the specific overcharges detected, the provider type, and applicable consumer protection laws.

**Letter Types:**
- **Medical billing dispute** -- References specific CPT codes, fair pricing data, and requests itemized bill review
- **Insurance claim appeal** -- Cites policy terms, medical necessity documentation, and appeal rights
- **Bank fee reversal request** -- References account terms, customer history, and competitive alternatives
- **Utility/telecom dispute** -- Cites rate schedules, regulatory requirements, and service terms
- **Debt validation request** -- FDCPA-compliant demand for debt verification (for bills sent to collections)

**Letter Components:**
- Formal header with sender and recipient information
- Specific charge references with dates and amounts
- Fair pricing evidence and data citations
- Applicable legal citations (No Surprises Act, FCRA, FDCPA, state consumer protection laws)
- Clear demand for action (refund, credit, charge removal, itemized review)
- Deadline for response (typically 30 days per federal requirements)
- Notice of escalation options (state attorney general, CFPB, insurance commissioner)

**Delivery Options:**
- Copy to clipboard for manual sending
- Direct email dispatch to provider billing department (when email address is known)
- PDF generation for printing and mailing
- Certified mail tracking integration (future)

---

### 4. AI Phone Agent for Negotiation

**What it does:** Makes autonomous phone calls to provider billing departments to negotiate charge reductions, fee waivers, and payment plan adjustments using Bland.ai voice AI.

**Pre-Call Setup:**
- User reviews dispute details and approves AI call
- User provides any required account information (account number, last 4 SSN if needed)
- Negotiation strategy selected based on provider type and dispute category
- Estimated call duration and cost displayed

**During Call:**
- AI agent navigates IVR menus to reach billing department
- Real-time transcript displayed in-app as the call progresses
- Hold time counter shows how long the AI is waiting
- User can send real-time instructions to the AI agent via text
- AI follows provider-specific negotiation scripts with dynamic adaptation
- Human escalation available if AI encounters unexpected scenarios

**Negotiation Strategies:**
- **Polite persistence:** Start with a friendly request, cite specific errors, escalate to supervisor if needed
- **Competitive leverage:** Reference lower rates from competitors (telecom/utilities)
- **Loyalty appeal:** Cite length of customer relationship and payment history
- **Legal citation:** Reference applicable consumer protection laws and threaten formal complaints
- **Hardship appeal:** Present financial hardship case for medical bill reductions (with user authorization)

**Post-Call:**
- Full transcript saved and accessible in-app
- Outcome recorded: amount reduced, confirmation number, follow-up required
- Savings added to user's total and dashboard updated
- Follow-up reminder set if provider promised a callback or adjustment
- Success/failure analytics feed into strategy optimization

---

### 5. Bank Statement Monitoring via Plaid

**What it does:** Connects to user's bank accounts via Plaid to automatically monitor for excessive fees, duplicate charges, unauthorized transactions, and other disputable charges.

**Setup:**
- User connects bank accounts through Plaid Link SDK (secure, in-app flow)
- Initial sync pulls 90 days of transaction history
- Fee detection algorithm scans all transactions for disputable charges
- User sets preferences: auto-dispute thresholds, notification preferences, monitoring frequency

**Monitoring Capabilities:**
- **Overdraft fee detection:** Flags overdraft and NSF fees, checks if bank's fee waiver policy applies
- **Maintenance fee detection:** Identifies monthly maintenance fees that may be waivable based on balance or activity
- **ATM fee detection:** Flags out-of-network ATM fees that exceed reasonable thresholds
- **Duplicate charge detection:** Identifies identical transactions within short time windows
- **Subscription creep:** Detects new recurring charges that the user may not have authorized
- **Price increase detection:** Flags recurring charges that have increased in amount
- **Foreign transaction fees:** Identifies and flags international transaction surcharges

**Auto-Dispute Feature:**
- User can enable auto-dispute for specific fee categories
- When a qualifying fee is detected, Claimback automatically generates a dispute letter and/or initiates an AI phone call
- User receives notification of auto-disputed charges with option to cancel
- Monthly auto-dispute report shows all fees challenged and outcomes

---

### 6. Success Tracking Dashboard

**What it does:** Displays cumulative savings, active dispute statuses, success rates, and historical performance in a motivating, gamified interface.

**Dashboard Elements:**
- **Total Saved counter:** Large, animated number showing lifetime savings with money-counting animation on updates
- **Active Disputes:** List of in-progress disputes with status indicators (submitted, in review, negotiating, resolved)
- **Monthly Savings Graph:** Bar chart showing savings by month with trend line
- **Success Rate:** Percentage of disputes that resulted in savings, with comparison to platform average
- **Category Breakdown:** Pie chart showing savings by category (medical, bank, insurance, utility, telecom)
- **Recent Activity Feed:** Timeline of recent scans, disputes, calls, and outcomes
- **Achievement Badges:** Gamification elements for milestones (first scan, first save, $100 saved, $1000 saved, etc.)

---

## Post-MVP Features (Months 5-8)

### 7. Insurance Claims Navigator

**What it does:** Guides users through the insurance claim appeal process when claims are denied, with step-by-step instructions, automated appeal letter generation, and deadline tracking.

**Capabilities:**
- EOB scanning and interpretation (explains insurance jargon in plain language)
- Denial reason analysis with appeal success probability
- Multi-level appeal letter generation (internal appeal, external review, state insurance commissioner complaint)
- Deadline tracking with reminders (most appeals must be filed within 180 days)
- Supporting documentation checklist (medical records, doctor's letters, prior authorization)

### 8. Utility Rate Comparison

**What it does:** Compares current utility and telecom rates against available alternatives in the user's area, and handles the switching process.

**Capabilities:**
- Rate comparison for electricity, gas, internet, phone, and streaming services
- Estimated annual savings calculation for each alternative
- One-tap switching initiation (where available via provider APIs)
- Contract termination fee analysis (whether savings exceed early termination costs)
- Seasonal rate optimization recommendations

### 9. Recurring Bill Monitoring

**What it does:** Continuously monitors recurring bills for price increases, new fees, and billing changes, alerting users proactively.

**Capabilities:**
- Automatic scan of recurring bill PDFs (received via email integration)
- Month-over-month comparison highlighting changes
- Alert on price increases with dispute recommendation
- Annual rate review reminders for negotiable services (insurance, telecom)
- Contract renewal tracking with renegotiation prompts

### 10. Medical Bill Negotiation Templates

**What it does:** Provides pre-built negotiation strategies for the most common medical billing scenarios, informed by thousands of successful negotiations.

**Templates:**
- Emergency room visit dispute (balance billing, facility fees)
- Lab work overcharge (bundled vs. unbundled pricing)
- Specialist visit upcoding (99213 vs. 99214 disputes)
- Surgical facility fee dispute
- Anesthesia time-based billing dispute
- Physical therapy session count dispute
- Prescription cost challenge (manufacturer coupons, generic alternatives)

---

## Year 2+ Features (Months 9-16)

### 11. Small Business Bill Management

**What it does:** Extends Claimback's capabilities to small business owners, handling vendor invoices, commercial insurance, and business banking fees.

**Capabilities:**
- Vendor invoice scanning and comparison against contracted rates
- Commercial insurance premium analysis and negotiation
- Business bank fee monitoring and dispute automation
- Tax-deductible expense flagging
- Multi-user access for business teams

### 12. Tax Deduction Finder

**What it does:** Analyzes scanned bills and bank transactions to identify potential tax deductions the user may be missing.

**Capabilities:**
- Medical expense deduction tracking (expenses exceeding 7.5% AGI threshold)
- Home office deduction identification from utility and internet bills
- Charitable donation receipt scanning and tracking
- State and local tax deduction optimization
- Integration with popular tax software (TurboTax, H&R Block)

### 13. International Expansion

**What it does:** Adapts Claimback's bill fighting capabilities for international markets, starting with Canada, UK, and Australia.

**Capabilities:**
- Country-specific billing formats and analysis rules
- Local consumer protection law citations
- Currency-specific fair pricing databases
- Local language support for AI phone negotiations
- Country-specific bank fee structures and dispute strategies

### 14. Bill Sharing & Family Plans

**What it does:** Allows families to manage bills together, with shared savings tracking and delegated dispute authority.

**Capabilities:**
- Family plan with up to 5 members
- Shared savings dashboard
- Delegated scanning (adult children managing parents' medical bills)
- Elderly parent monitoring (detect unusual charges or potential scams)
- Shared dispute history and outcome tracking

---

## User Stories

### Medical Bill User Story
> **As a** patient who just received a $4,200 hospital bill,
> **I want to** scan the bill with my phone and instantly know if I'm being overcharged,
> **So that** I can dispute any errors and reduce my bill without spending hours on the phone.

**Acceptance Criteria:**
- Bill is scanned and analyzed in under 5 seconds
- Each line item is individually assessed with a confidence score
- Overcharges are highlighted with fair price comparison
- One-tap dispute letter generation with all necessary details
- Option to initiate AI phone call to billing department

### Bank Fee User Story
> **As a** checking account holder who was charged a $35 overdraft fee,
> **I want** Claimback to automatically detect the fee and call my bank to get it waived,
> **So that** I get my money back without spending 30 minutes on hold.

**Acceptance Criteria:**
- Overdraft fee detected within 1 hour of posting via Plaid
- Notification sent to user with one-tap dispute option
- AI phone call navigates bank IVR and negotiates fee reversal
- Real-time transcript shows negotiation progress
- Outcome recorded and savings added to dashboard

### Insurance EOB User Story
> **As a** policyholder who received a denied insurance claim,
> **I want to** understand why my claim was denied and have an appeal letter generated automatically,
> **So that** I can maximize my chances of getting the claim paid without hiring a claims advocate.

**Acceptance Criteria:**
- EOB scanned and denial reason extracted
- Plain-language explanation of denial reason provided
- Appeal success probability displayed based on denial type
- Appeal letter generated with appropriate medical and legal citations
- Submission deadline tracked with reminders

---

## Development Timeline

### Month 1: Foundation
- React Native + Expo project setup with navigation and auth
- Supabase project creation, database schema, and auth integration
- Camera module with alignment guide and auto-capture
- Basic image upload pipeline to Supabase Storage
- RevenueCat subscription setup with paywall

### Month 2: Core AI Pipeline
- OpenAI Vision API integration for bill text extraction
- Bill type classification engine (medical, bank, insurance, utility, telecom)
- CPT code database and Medicare fair pricing data integration
- Overcharge detection algorithm for medical bills
- Bill analysis results display with annotated overcharges
- Dispute letter generation engine

### Month 3: Phone Agent & Bank Monitoring
- Bland.ai integration for AI phone calls
- IVR navigation scripts for top 20 providers
- Real-time call transcript display
- Plaid Link integration for bank account connection
- Bank fee detection algorithm
- Push notification system for detected fees

### Month 4: MVP Polish & Launch
- Success tracking dashboard with savings graphs
- Achievement badge system
- Auto-dispute feature for bank fees
- End-to-end testing of full dispute pipeline
- App Store and Google Play submission
- Beta launch to 500 users from waitlist
- Performance monitoring and error tracking setup

### Month 5-6: Post-MVP Phase 1
- Insurance claims navigator
- Utility rate comparison engine
- Recurring bill monitoring
- Medical negotiation template library
- AI phone script optimization based on outcome data

### Month 7-8: Post-MVP Phase 2
- Email integration for automatic bill ingestion
- Provider-specific success rate analytics
- A/B testing for negotiation strategies
- Referral program implementation
- Community features (anonymized success stories)

### Month 9-12: Year 2 Expansion
- Small business bill management
- Tax deduction finder
- Family plan and bill sharing
- Enterprise API for financial advisors
- Partnership integrations with consumer advocacy organizations

### Month 13-16: Scale
- International expansion (Canada, UK, Australia)
- Custom fine-tuned models for bill classification
- Self-hosted OCR for cost reduction
- White-label API for financial institutions
- SOC 2 Type II and HIPAA compliance certifications

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Bill scanning (camera) | Critical | Medium | P0 | MVP |
| Overcharge detection | Critical | High | P0 | MVP |
| Dispute letter generation | High | Medium | P0 | MVP |
| AI phone negotiation | Critical | High | P0 | MVP |
| Bank fee monitoring (Plaid) | High | Medium | P0 | MVP |
| Success tracking dashboard | Medium | Low | P1 | MVP |
| Insurance claims navigator | High | High | P1 | Post-MVP |
| Utility rate comparison | Medium | Medium | P2 | Post-MVP |
| Recurring bill monitoring | Medium | Medium | P2 | Post-MVP |
| Medical negotiation templates | High | Low | P1 | Post-MVP |
| Small business support | High | High | P2 | Year 2 |
| Tax deduction finder | Medium | Medium | P3 | Year 2 |
| International expansion | High | Very High | P3 | Year 2 |
| Family plans | Medium | Medium | P2 | Year 2 |
