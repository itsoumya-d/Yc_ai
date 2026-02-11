# Skills

## Overview

Building Claimback requires a rare combination of mobile development, AI integration, voice agent engineering, financial domain knowledge, and consumer advocacy expertise. The most critical differentiator is the intersection of AI voice negotiation prompt engineering and deep medical billing domain knowledge -- skills that very few developers possess but that form the core of Claimback's competitive moat.

---

## Technical Skills

### React Native + Expo — Advanced

**Why Advanced:** Claimback's camera scanning pipeline, real-time AI call transcripts, and animated savings dashboards demand deep React Native expertise beyond basic app development.

**Specific Competencies:**
- Expo Camera API with custom overlays, edge detection, and auto-capture logic
- `expo-image-manipulator` for pre-processing bill images (crop, rotate, enhance contrast)
- React Native Reanimated for smooth animations (savings counter roll-up, confetti, status transitions)
- FlashList for high-performance rendering of dispute histories and transaction lists
- Expo Notifications for real-time dispute status updates and fee alerts
- Expo Secure Store for encrypted local storage of sensitive financial data
- Custom native modules if needed for advanced camera functionality
- Deep linking for opening specific disputes from push notifications
- Background task handling for Plaid sync and notification processing
- Performance optimization: lazy loading, memoization, image caching

**Learning Resources:**
- Expo documentation (expo.dev/docs) -- the definitive reference
- William Candillon's "Can it be done in React Native?" YouTube series for advanced animations
- React Native Performance guide by Shopify engineering blog
- Expo Camera examples on GitHub

---

### OpenAI Vision API — Intermediate

**Why Intermediate:** Bill scanning requires structured data extraction from complex visual layouts (tables, line items, codes), but the Vision API handles the heavy lifting. The skill is in prompt engineering for accurate extraction, not model training.

**Specific Competencies:**
- Multimodal prompt engineering for structured data extraction from bill images
- Designing prompts that consistently extract: provider name, dates, line items, CPT codes, amounts, totals
- Handling edge cases: poor image quality, handwritten annotations, multi-format bills
- Response parsing and validation (ensuring extracted amounts sum correctly)
- Cost optimization: image resolution tuning (lower resolution for simple bills, higher for medical)
- Error handling for ambiguous extractions (confidence scoring)
- Batch processing for multi-page bills
- Prompt versioning and A/B testing for accuracy improvement

**Key Prompt Design Patterns:**
- System prompt establishing the AI as a medical billing expert
- Structured output format (JSON) for consistent parsing
- Few-shot examples of correctly extracted medical bills
- Chain-of-thought reasoning for overcharge detection
- Confidence scoring instructions for uncertain extractions

---

### Bland.ai Voice AI Integration — Intermediate (Unique Skill)

**Why This is Unique:** AI phone agent integration is an emerging field with very few experienced practitioners. Building production-quality negotiation agents that can navigate IVRs, wait on hold, and negotiate with human representatives is a specialized skill that gives Claimback its most distinctive capability.

**Specific Competencies:**
- Bland.ai API integration: call initiation, monitoring, transcript streaming, outcome capture
- Negotiation script design: multi-phase scripts with conditional branching
- IVR navigation scripting: automated menu navigation for major providers (Chase, BofA, UnitedHealthcare, etc.)
- Real-time transcript streaming to mobile app via WebSocket/Supabase Realtime
- Call outcome classification and savings verification
- Voice persona design: choosing the right voice, tone, and speaking style for different providers
- Fallback handling: what to do when the AI encounters unexpected scenarios
- Call monitoring and human escalation triggers
- Provider-specific strategy databases: knowing that BofA requires reference to "courtesy fee reversal" vs. Chase's "goodwill adjustment" language
- Compliance: FTC disclosure requirements for automated calls, state-by-state regulations

**Why This Skill is Rare:**
- AI voice agents are less than 2 years old as a production technology
- Most developers have zero experience with telephony AI integration
- The combination of voice AI + domain-specific negotiation is virtually non-existent
- Building effective negotiation scripts requires both technical and interpersonal skills
- Testing requires actual phone calls, making iteration cycles longer than typical software development

---

### Plaid API — Intermediate

**Why Intermediate:** Plaid integration is well-documented and widely used, but Claimback's bank fee detection layer requires understanding transaction categorization, fee pattern recognition, and webhook handling for real-time monitoring.

**Specific Competencies:**
- Plaid Link SDK integration in React Native (Plaid's React Native SDK)
- Transaction sync and categorization using Plaid's transaction endpoints
- Webhook configuration for real-time transaction alerts
- Fee pattern recognition: distinguishing overdraft fees from legitimate charges in transaction data
- Institution-specific handling: different banks report fees differently in Plaid data
- Token management: Plaid access token storage, refresh, and error recovery
- Handling Link re-authentication when bank connections expire
- Balances and liabilities endpoints for account monitoring
- Multi-account management (users with multiple banks)

---

### Supabase — Intermediate

**Why Intermediate:** Supabase provides a comprehensive backend, but Claimback requires Row Level Security policies for medical data, real-time subscriptions for call transcripts, Edge Functions for AI pipelines, and Storage for encrypted bill images.

**Specific Competencies:**
- PostgreSQL schema design with JSONB for flexible bill data structures
- Row Level Security (RLS) policies for user data isolation
- Real-time subscriptions for live call transcript updates
- Edge Functions (Deno/TypeScript) for serverless API routes
- Supabase Storage with encryption for bill images
- Auth integration (social login, magic link, biometric)
- Database functions for savings calculations and aggregations
- Migrations and schema versioning
- Performance optimization: indexes, query optimization, connection pooling
- pgvector for similarity matching against billing pattern databases (future)

---

### Stripe + RevenueCat — Intermediate

**Specific Competencies:**
- RevenueCat SDK integration for iOS and Android subscription management
- Paywall design and A/B testing via RevenueCat
- Stripe payment processing for performance fee collection
- Webhook handling for subscription events (upgrade, downgrade, cancellation, renewal)
- Subscription analytics and churn tracking
- Promo code and free trial management
- App Store and Google Play billing compliance
- Performance fee calculation and transparent billing

---

## Domain Skills

### Medical Billing & CPT Codes — Critical

**Why Critical:** Medical billing errors are Claimback's largest revenue opportunity. Understanding CPT codes, ICD-10 codes, Medicare pricing, and common billing errors is essential for accurate overcharge detection and effective disputes.

**Specific Knowledge Areas:**
- **CPT Code System:** Understanding the hierarchical structure of Current Procedural Terminology codes, including E/M (Evaluation and Management) codes (99201-99215), surgical codes, radiology codes, and lab codes
- **ICD-10 Diagnosis Codes:** How diagnosis codes relate to procedure codes and when mismatches indicate billing errors
- **Medicare Fair Pricing:** Using Medicare fee schedules as baseline fair pricing for procedure comparison
- **Common Billing Errors:**
  - Upcoding: billing for a higher-complexity visit than documented (most common error)
  - Unbundling: billing procedures separately that should be bundled under a single code
  - Duplicate billing: charging for the same procedure twice
  - Balance billing: billing patients for amounts above insurance allowed rates
  - Modifier errors: incorrect or missing modifiers that affect pricing
  - Never events: billing for procedures that resulted from hospital errors
- **Explanation of Benefits (EOB):** Understanding insurance EOB format, allowed amounts, patient responsibility calculations, coordination of benefits
- **No Surprises Act:** Understanding the federal law prohibiting surprise medical billing and how to cite it in disputes
- **Hospital Chargemaster:** How hospitals set list prices vs. negotiated insurance rates
- **Charity Care:** Hospital financial assistance programs that can reduce bills by 50-100%

**Learning Path:**
- AAPC (American Academy of Professional Coders) online courses for CPT fundamentals
- Medical Billing Advocates of America training materials
- CMS.gov Medicare fee schedule database
- NAIC consumer guides on insurance billing rights
- No Surprises Act guidance from HHS.gov

---

### Consumer Protection Law (FCRA/FDCPA) — Important

**Why Important:** Dispute letters must contain proper legal citations and comply with federal and state consumer protection laws to be effective and avoid liability.

**Specific Knowledge Areas:**
- **Fair Credit Reporting Act (FCRA):** How billing disputes affect credit reports, consumer rights to dispute inaccurate information, credit bureau response requirements
- **Fair Debt Collection Practices Act (FDCPA):** Consumer rights when bills are sent to collections, debt validation requirements, prohibited collector practices
- **No Surprises Act (NSA):** Federal protections against surprise medical billing, independent dispute resolution (IDR) process
- **Truth in Lending Act (TILA):** Disclosure requirements for payment plans and interest charges
- **State consumer protection laws:** Each state has additional protections (California Consumer Protection Act, New York General Business Law, etc.)
- **CFPB complaint process:** How to file complaints with the Consumer Financial Protection Bureau as an escalation tactic
- **State Attorney General complaints:** Filing consumer complaints at the state level
- **Small claims court:** When and how to use small claims court as a dispute escalation

---

### Bank Fee Structures — Important

**Why Important:** Effective bank fee disputes require understanding each bank's specific fee policies, waiver criteria, and negotiation leverage points.

**Specific Knowledge Areas:**
- Major bank fee schedules: Chase, Bank of America, Wells Fargo, Citibank, Capital One, US Bank
- Overdraft fee policies: opt-in requirements, daily limits, courtesy reversal policies
- Maintenance fee waiver requirements: minimum balance, direct deposit, debit card usage
- ATM fee reimbursement programs and eligibility
- Credit card fee structures: annual fees, late payment fees, foreign transaction fees
- Regulatory landscape: CFPB overdraft fee reform proposals, Reg E compliance
- Credit union and online bank alternatives with lower fee structures
- Competitive leverage: knowing which banks offer fee-free alternatives

---

### Insurance EOB Format — Important

**Why Important:** Insurance Explanations of Benefits are the most complex bill format users will scan. Understanding their structure is essential for accurate analysis.

**Specific Knowledge Areas:**
- EOB layout interpretation: claim information, service details, charges, allowed amounts, adjustments, patient responsibility
- Coordination of benefits: primary vs. secondary insurance, how dual coverage affects patient responsibility
- Denial codes: understanding why claims are denied and which denials are overturnable
- Appeal rights and timelines: internal appeal, external review, state insurance commissioner complaints
- Network status implications: in-network vs. out-of-network cost differences
- Pre-authorization and retroactive authorization processes
- Formulary and step therapy for prescription drug claims

---

## Design Skills

### Financial App Trust UX — Advanced

**Why Advanced:** Claimback handles sensitive financial and medical data. Users must trust the app enough to share bill photos, bank credentials (via Plaid), and account information for AI phone calls. Trust UX is the difference between adoption and abandonment.

**Specific Competencies:**
- Trust indicator design: security badges, encryption notices, data handling transparency
- Progressive disclosure of sensitive permissions (don't ask for everything upfront)
- Plaid Link integration UX: calming users during bank connection process
- AI call authorization UX: clear consent flows before AI makes phone calls
- Financial data visualization: clear, honest presentation of savings and fees
- Error handling UX: financial apps cannot afford confusing error states
- Social proof integration: showing platform-wide success rates and savings
- Privacy-first design: making data retention settings prominent and easy to configure
- Notification UX: balancing engagement with notification fatigue in a financial context

---

### Scanning UI Design — Intermediate

**Why Intermediate:** The camera scanning experience is the first interaction most users will have with Claimback. It must be instantly intuitive, fast, and reliable across varying lighting conditions and bill formats.

**Specific Competencies:**
- Camera overlay design: alignment guides that work across different bill sizes and orientations
- Auto-capture feedback: clear visual and haptic cues when a bill is detected and captured
- Image quality assessment UI: guiding users to improve lighting, angle, and focus
- Multi-page scanning flow: intuitive page management for long medical bills
- Preview and edit interface: cropping, rotation, and manual correction tools
- Loading/processing state design: keeping users engaged during the 2-3 second analysis
- OCR result verification UI: presenting extracted data for user confirmation without overwhelming detail

---

### Real-Time Status Design — Intermediate

**Why Intermediate:** AI phone calls and dispute tracking require real-time status updates that keep users informed and engaged without creating anxiety.

**Specific Competencies:**
- Status progression design: visual progress through multi-step processes (submitted > reviewed > negotiating > resolved)
- Live transcript UI: readable, auto-scrolling text that distinguishes speakers and system messages
- Hold timer design: making wait times feel manageable with estimated wait and engaging visuals
- Push notification design: actionable notifications that drive re-engagement
- Status badge system: clear, color-coded status indicators across the app
- Transition animations: smooth state changes that orient users without disorienting them

---

## Business Skills

### Viral Content Creation (Bill Fight Demos) — Critical

**Why Critical:** Claimback's primary growth channel is viral social media content showing the AI fighting bills in real-time. The dramatic before/after of a $4,000 medical bill reduced to $1,200 is inherently shareable content. Execution quality determines whether videos get 1,000 or 1,000,000 views.

**Specific Competencies:**
- Short-form video production: TikTok (15-60 sec), Instagram Reels, YouTube Shorts
- Screen recording and editing: capturing the bill scanning and AI call process in compelling video format
- Storytelling structure for bill fight content: "I got a $4,200 hospital bill. Here's what happened when my AI called to fight it."
- Hook optimization: first 3 seconds must grab attention (showing the outrageous bill amount)
- Sound design: satisfying money-counting sounds, notification pings, celebration effects
- Caption/subtitle optimization for silent viewing (85% of social video is watched without sound)
- Community engagement: responding to comments, encouraging users to share their own stories
- Hashtag strategy: #billfight #overcharged #moneysaved #medicalbilling #personalfinance
- User-generated content (UGC) pipeline: incentivizing users to share their savings stories
- Trend jacking: adapting bill-fighting content to current social media trends

---

### Personal Finance Influencer Partnerships — Important

**Why Important:** Personal finance influencers on TikTok, Instagram, and YouTube have highly engaged audiences who are exactly Claimback's target demographic. A single influencer partnership can drive 10,000+ downloads.

**Specific Competencies:**
- Influencer identification and vetting: finding creators whose audience matches Claimback's target (25-55 year olds, interested in saving money, frustrated with bills)
- Partnership structures: sponsored content, affiliate programs, equity partnerships, revenue sharing
- Content brief development: guiding influencers to create authentic content that drives downloads
- Campaign tracking: unique referral codes, UTM parameters, install attribution
- Relationship management: ongoing partnerships with top-performing creators
- Key influencer categories:
  - Personal finance TikTokers (Graham Stephan, Humphrey Yang tier and micro-influencers)
  - Medical billing advocates with social followings
  - Frugal living content creators
  - Consumer rights advocates and journalists
  - Reddit r/personalfinance and r/povertyfinance community contributors

---

### Performance Pricing Strategy — Important

**Why Important:** Claimback's 25% performance fee on savings over $100 is a critical revenue driver that must be implemented transparently to maintain user trust while maximizing revenue.

**Specific Competencies:**
- Performance fee calculation: accurate tracking of verified savings attributable to Claimback's actions
- Transparent pricing communication: clearly explaining when and how the performance fee applies
- Threshold optimization: determining the $100 minimum threshold (below which no performance fee is charged)
- Verification process: confirming that savings actually occurred (provider credit confirmation, bank statement verification)
- Revenue recognition: when to recognize performance fee revenue (at dispute resolution vs. at refund receipt)
- User psychology: framing the fee as "we only make money when you save money" (aligned incentives)
- Competitive benchmarking: CoPatient charges 30-50%, establishing Claimback's 25% as competitive
- Churn impact: ensuring performance fees don't drive churn by maintaining clear value communication

---

## Unique / Rare Skills

### AI Voice Negotiation Prompt Engineering — Rare and Critical

**What makes this rare:** This is the intersection of prompt engineering, negotiation psychology, telephony systems, and provider-specific domain knowledge. There are very few people in the world with production experience building AI agents that negotiate with human representatives over the phone.

**Specific Competencies:**
- **Negotiation Script Architecture:** Designing multi-phase scripts with conditional branching based on representative responses. Phase 1 (identification) > Phase 2 (dispute presentation) > Phase 3 (negotiation) > Phase 4 (resolution), with escalation paths at each stage.
- **Voice Persona Engineering:** Selecting and customizing voice characteristics (tone, pace, formality level) for different provider types. Medical billing departments respond better to professional, empathetic tones. Bank customer service responds to polite but firm tones.
- **IVR Navigation Mapping:** Documenting the phone menu trees of major providers and scripting reliable navigation paths. This is tedious but essential work -- a wrong menu selection means the AI agent reaches the wrong department.
- **Dynamic Adaptation:** Building prompts that allow the AI to adapt its strategy based on the representative's responses, objections, and emotional state.
- **Escalation Triggers:** Knowing when to ask for a supervisor, when to threaten regulatory complaints, and when to accept a partial victory.
- **Compliance Guardrails:** Ensuring the AI never makes unauthorized commitments, lies about account information, or violates FTC regulations on automated calls.

---

### Medical Billing Analysis — Rare and Critical

**What makes this rare:** Deep medical billing expertise typically exists only among professional medical billing advocates (a niche profession with ~5,000 practitioners in the US). Translating this expertise into AI prompts and detection algorithms is an extremely rare combination.

**Specific Competencies:**
- **Upcoding detection algorithms:** Rules for identifying when E/M codes don't match the likely visit complexity based on diagnosis codes and provider type
- **Unbundling detection:** Maintaining a database of bundled procedure codes and flagging when components are billed separately
- **Regional fair pricing:** Using Medicare fee schedules adjusted by geographic cost indices (GPCI) for accurate regional pricing
- **Specialty-specific patterns:** Knowing that dermatologists commonly overbill for biopsies, that ER physicians commonly upcode, and that anesthesiologists commonly bill excessive time units
- **Insurance-specific strategies:** Different insurance companies have different appeal processes, different denial patterns, and different negotiation leverage points
- **Provider psychology:** Understanding what motivates billing departments (avoiding audits, maintaining clean claim rates, patient satisfaction scores) and using that knowledge in negotiation scripts

---

### Provider-Specific Negotiation Strategies — Rare

**What makes this rare:** Effective bill negotiation requires knowing the specific policies, scripts, and leverage points that work for each major provider. This knowledge is typically held by experienced human billing advocates and is not documented anywhere.

**Examples of Provider-Specific Knowledge:**
- **Chase Bank:** First overdraft fee in 12 months is automatically reversible on request. Use the phrase "courtesy fee reversal." Customer retention department has more authority than front-line agents.
- **Bank of America:** Maintenance fees are waived with $1,500 minimum balance OR one qualifying direct deposit. Reference "Preferred Rewards" program for additional fee waivers.
- **UnitedHealthcare:** Claim appeals must reference the specific plan document section. Appeals to state insurance commissioner are highly effective for denied claims.
- **HCA Healthcare (hospital system):** Financial assistance applications can reduce bills by 50-100% for patients under 400% of federal poverty level. Billing departments have authority to offer 20-40% self-pay discounts without supervisor approval.
- **Comcast/Xfinity:** Customer retention department ("loyalty department") can offer promotional rates. Mention competitor pricing (AT&T Fiber, T-Mobile Home Internet) for best results.
- **AT&T:** Wireless plan optimization can save $20-50/month. Reference "loyalty department" specifically. Best results when approaching contract renewal dates.

---

## Skills Acquisition Priority

| Skill | Priority | Time to Acquire | Availability |
|-------|----------|----------------|-------------|
| React Native + Expo | P0 | Already widespread | Common |
| OpenAI Vision API | P0 | 2-4 weeks | Moderate |
| Bland.ai voice integration | P0 | 4-8 weeks | Rare |
| Medical billing / CPT codes | P0 | 8-12 weeks | Rare |
| Plaid API | P1 | 2-3 weeks | Common |
| Supabase | P1 | 2-3 weeks | Common |
| Consumer protection law | P1 | 4-6 weeks | Moderate |
| Financial trust UX | P1 | 4-6 weeks | Moderate |
| Viral content creation | P1 | Ongoing | Moderate |
| AI voice negotiation prompts | P0 | 8-16 weeks | Very rare |
| Provider-specific strategies | P0 | Ongoing (data-driven) | Very rare |
| Performance pricing strategy | P2 | 2-3 weeks | Moderate |
| Influencer partnerships | P2 | 4-6 weeks | Moderate |
| RevenueCat + Stripe | P2 | 1-2 weeks | Common |
