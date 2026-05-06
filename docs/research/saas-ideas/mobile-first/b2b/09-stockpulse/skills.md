# StockPulse — Skills

> Technical, domain, design, and business skills required to build and scale an AI inventory scanner for small retail and restaurants.

---

## Skills Overview

| Category | Priority | Skills Count | Time to Competency |
|----------|----------|-------------|-------------------|
| Technical | Critical | 12 skills | 3-6 months |
| Domain Knowledge | High | 8 skills | 1-3 months |
| Design | High | 6 skills | 2-4 months |
| Business | Critical | 7 skills | Ongoing |

---

## Technical Skills

### 1. React Native + Expo Development

**Priority:** P0 (Critical)
**Time to competency:** 4-8 weeks (with React experience), 12-16 weeks (without)

**What you need to know:**
- React Native core concepts: components, navigation, state management, native modules
- Expo managed workflow: configuration, EAS Build, OTA updates, expo-dev-client
- Performance optimization: FlashList, memoization, avoiding re-renders, bridge overhead
- Platform-specific code: iOS vs Android differences, platform modules
- App Store submission process for both iOS and Google Play

**Key libraries to master:**
- `expo-camera` and `react-native-vision-camera` for camera access
- `@react-navigation/native` for navigation stack
- `zustand` for state management
- `react-native-mmkv` for fast persistent storage
- `react-native-reanimated` for smooth animations
- `@shopify/flash-list` for performant lists

**Learning resources:**
- React Native official docs (reactnative.dev)
- Expo documentation (docs.expo.dev)
- William Candillon's "Can it be done in React Native?" YouTube series
- Infinite Red's React Native Newsletter
- Callstack's React Native blog

---

### 2. Camera APIs and Barcode Scanning

**Priority:** P0 (Critical)
**Time to competency:** 2-4 weeks

**What you need to know:**
- Camera permission handling (iOS and Android differences)
- Frame processing pipeline: capture, compress, send to API
- Real-time barcode/QR detection: UPC-A, UPC-E, EAN-8, EAN-13, Code 128, QR
- Camera overlay rendering (bounding boxes, labels on live camera feed)
- Flash/torch control
- Image quality vs file size tradeoffs
- Frame rate management (balancing quality and battery drain)

**Key concepts:**
- `react-native-vision-camera` frame processors
- `expo-camera` barcode scanning modes
- JPEG compression and resolution control
- Camera orientation handling (portrait lock for scanning)
- Simultaneous barcode + AI vision processing

**Learning resources:**
- react-native-vision-camera docs (mrousavy.com/react-native-vision-camera)
- Marc Rousavy's blog posts on frame processing
- Apple AVFoundation documentation (for understanding iOS camera internals)

---

### 3. Computer Vision and AI Integration

**Priority:** P0 (Critical)
**Time to competency:** 3-6 weeks

**What you need to know:**
- OpenAI GPT-4o Vision API: sending images, structuring prompts, parsing responses
- Prompt engineering for vision tasks: product identification, counting, label reading
- Handling AI uncertainty: confidence scores, fallback strategies
- Response parsing: extracting structured data from AI text responses
- Cost optimization: image compression, caching, selective API calls
- Rate limiting and retry strategies
- Vision API alternatives: Google Cloud Vision, Amazon Rekognition (as backup)

**Key patterns:**
```
User captures frame -> Compress to 1280px JPEG ->
Send to Edge Function -> Edge Function calls GPT-4o ->
Parse JSON response -> Match to product database ->
Return results to app -> Display overlay
```

**Learning resources:**
- OpenAI Vision API documentation
- OpenAI Cookbook (GitHub) for vision examples
- "Building with the OpenAI API" course
- Papers on visual product recognition and retail AI

---

### 4. Offline-First Data Sync

**Priority:** P1 (High)
**Time to competency:** 3-5 weeks

**What you need to know:**
- Offline queue design: store actions locally, replay when connected
- Conflict resolution strategies: last-write-wins, merge strategies, manual resolution
- Network state detection: `@react-native-community/netinfo`
- Sync indicators: show users when data is synced vs pending
- MMKV for fast local storage
- Background sync: processing queue when app is backgrounded
- Data integrity: ensuring no scans are lost during offline periods

**Key challenge:** Multiple staff members scanning the same location offline, then syncing simultaneously. Requires intelligent merge logic.

**Architecture pattern:**
```
Action -> Write to local store (MMKV) -> Add to sync queue ->
  If online: Process queue immediately -> Remove from queue on success
  If offline: Queue persists -> On reconnect: process queue in order
```

**Learning resources:**
- "Designing Data-Intensive Applications" by Martin Kleppmann (Chapter 5: Replication)
- Expo offline-first patterns blog post
- Watermelon DB documentation (alternative for complex offline-first needs)

---

### 5. Supabase Backend Development

**Priority:** P0 (Critical)
**Time to competency:** 2-4 weeks

**What you need to know:**
- PostgreSQL fundamentals: queries, indexes, joins, JSON columns
- Row Level Security (RLS): writing policies for multi-tenant isolation
- Supabase Auth: email/password, magic links, OAuth, JWT handling
- Edge Functions: Deno runtime, request handling, environment variables
- Realtime subscriptions: listening for database changes across devices
- Storage: uploading scan images, generating signed URLs
- Database migrations and schema management
- Connection pooling with PgBouncer (for scale)

**Learning resources:**
- Supabase documentation (supabase.com/docs)
- Supabase YouTube channel
- PostgreSQL Tutorial (postgresqltutorial.com)
- "The Art of PostgreSQL" by Dimitri Fontaine

---

### 6. POS API Integrations

**Priority:** P2 (Post-MVP)
**Time to competency:** 3-6 weeks per POS system

**What you need to know:**
- **Square API:** OAuth 2.0, Catalog API, Orders API, Inventory API, Webhooks
- **Toast API:** Partner program requirements, Menu API, Orders API
- **Clover API:** OAuth, Inventory API, Orders API, Merchant API
- RESTful API consumption patterns
- Webhook processing for real-time sales data
- OAuth token management and refresh flows
- Recipe/BOM (Bill of Materials) mapping: 1 menu item = multiple inventory products

**Key challenge:** Each POS has a different data model. Building an abstraction layer that normalizes product and sales data across POS systems.

**Learning resources:**
- Square Developer documentation (developer.squareup.com)
- Toast Partner API documentation
- Clover Developer documentation (docs.clover.com)

---

### 7. TypeScript (End-to-End)

**Priority:** P0 (Critical)
**Time to competency:** 2-4 weeks (with JavaScript experience)

**What you need to know:**
- Strict TypeScript configuration for React Native
- Type-safe API client generation (from Supabase schema)
- Zod for runtime validation of API responses (especially AI responses)
- Shared types between mobile app and Edge Functions
- Generic types for reusable components
- Discriminated unions for state management (loading, success, error states)

**Learning resources:**
- TypeScript Handbook (typescriptlang.org)
- Matt Pocock's Total TypeScript course
- Type Challenges (github.com/type-challenges/type-challenges)

---

### 8. Push Notifications

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- OneSignal SDK integration for React Native
- Push notification permission handling (iOS requires explicit prompt)
- Notification categories: low stock, expiration, order updates
- Background notification processing
- Deep linking from notifications to specific screens
- Notification grouping and batching
- Quiet hours and user preferences

**Learning resources:**
- OneSignal React Native SDK documentation
- Expo Notifications documentation (as alternative)
- Apple Push Notification service (APNs) overview
- Firebase Cloud Messaging (FCM) overview

---

### 9. TensorFlow Lite (On-Device ML)

**Priority:** P2 (Post-MVP)
**Time to competency:** 4-8 weeks

**What you need to know:**
- TFLite model deployment on mobile devices
- Model quantization for small file size (< 15MB target)
- React Native TFLite integration
- Product classification model training (using scan data)
- Model performance benchmarking on various devices
- Fallback strategies when on-device model is uncertain

**Learning resources:**
- TensorFlow Lite documentation (tensorflow.org/lite)
- "react-native-tflite" library documentation
- Google ML Kit for basic on-device vision tasks
- Practical Deep Learning for Coders (fast.ai)

---

### 10. Payment Integration (Stripe)

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- Stripe Subscriptions: creating products, prices, checkout sessions
- Stripe Customer Portal for self-service billing management
- Webhook handling for subscription events (created, updated, canceled)
- React Native Stripe SDK for in-app payment flow
- Metered billing (for per-scan pricing at Enterprise tier)
- Free trial and upgrade flows

**Learning resources:**
- Stripe documentation (stripe.com/docs)
- Stripe YouTube channel
- "Stripe Billing 101" guide

---

### 11. Testing (Jest + Detox)

**Priority:** P1 (High)
**Time to competency:** 2-3 weeks

**What you need to know:**
- Jest unit testing for business logic and utilities
- React Native Testing Library for component tests
- Detox for E2E testing on iOS and Android simulators
- Mocking Supabase client and API responses
- Testing camera interactions (mock camera frames)
- CI/CD integration for automated test runs
- Test coverage targets and reporting

**Learning resources:**
- Jest documentation (jestjs.io)
- React Native Testing Library docs
- Detox documentation (wix.github.io/Detox)

---

### 12. Analytics and Error Tracking

**Priority:** P1 (High)
**Time to competency:** 1 week

**What you need to know:**
- PostHog: event tracking, user identification, feature flags, funnels
- Sentry: crash reporting, performance monitoring, source maps
- Custom event design for inventory-specific metrics
- Privacy-compliant analytics (GDPR, CCPA)
- A/B testing with feature flags

**Learning resources:**
- PostHog documentation (posthog.com/docs)
- Sentry React Native documentation

---

## Domain Knowledge

### 1. Retail Inventory Management

**Priority:** P0 (Critical)
**Time to competency:** 2-4 weeks of research + 2-4 weeks working with beta users

**What you need to know:**
- Inventory counting methods: periodic, perpetual, cycle counting
- Stock keeping unit (SKU) management and numbering systems
- Reorder point calculation: (daily usage rate x lead time) + safety stock
- ABC analysis: categorizing inventory by value (A=high, B=medium, C=low)
- Shrinkage: theft, damage, spoilage, administrative errors
- Par levels: target stock level for each product
- Dead stock identification and management

**Learning resources:**
- "Inventory Management Explained" (online courses on Coursera/Udemy)
- National Retail Federation (NRF) resources
- Trade publications: Retail Dive, Grocery Dive

---

### 2. Restaurant Supply Chain

**Priority:** P0 (Critical)
**Time to competency:** 2-4 weeks

**What you need to know:**
- Restaurant ordering cycles (most order 2-3 times per week)
- Major distributors: Sysco, US Foods, Performance Food Group
- Broadline vs specialty distributors
- Kitchen organization: walk-in cooler, dry storage, prep station, line
- Menu engineering and food cost percentages (target: 28-35%)
- Seasonal menu changes and inventory impact
- Delivery schedules and receiving procedures

---

### 3. Food Safety Regulations (FIFO)

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- FIFO (First In, First Out) inventory rotation
- FDA Food Code requirements for date labeling
- Temperature-sensitive inventory management
- Health department inspection requirements
- Food allergen tracking
- Recall management procedures
- Documentation requirements for food safety audits

**Learning resources:**
- FDA Food Code (fda.gov)
- ServSafe certification materials
- State-specific food safety regulations

---

### 4. Supplier/Distributor Relationships

**Priority:** P2 (Post-MVP)
**Time to competency:** Ongoing

**What you need to know:**
- How small businesses select and manage suppliers
- Minimum order quantities and lead times
- Payment terms (Net 30, COD, credit accounts)
- Order submission methods (phone, fax, email, online portal)
- Price negotiation and volume discounts
- Backup supplier strategies
- Supplier evaluation criteria

---

### 5. SKU Management

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- SKU numbering conventions
- UPC and EAN barcode standards
- Product variants (size, flavor, packaging)
- Product categorization taxonomies
- Unit of measure conversions (case to each, pound to ounce)
- Product lifecycle management (new, active, discontinued)

---

### 6. Barcode Standards

**Priority:** P1 (High)
**Time to competency:** 1 week

**What you need to know:**
- UPC-A (12 digits, US standard)
- EAN-13 (13 digits, international)
- Code 128 (used in shipping and logistics)
- QR codes (2D, used for custom product encoding)
- GS1 standards for product identification
- PLU codes for produce (4-5 digits)

---

### 7. Small Business Operations

**Priority:** P1 (High)
**Time to competency:** Ongoing (customer conversations)

**What you need to know:**
- How small business owners spend their time (they wear every hat)
- Technology adoption patterns (prefer simple, mobile, low-learning-curve)
- Budget constraints and ROI sensitivity
- Decision-making: often one person (owner) makes all tech decisions
- Pain points: time, waste, cash flow, staffing
- Trust building: they trust referrals from other local business owners

---

### 8. Food Waste Economics

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- Average food waste rates by restaurant type (4-10% of food purchased)
- Cost of waste: $25K-$75K per restaurant per year
- Waste causes: over-ordering, improper storage, expiration, prep waste
- Waste reduction strategies and their ROI
- Industry benchmarks for waste percentage
- Sustainability reporting requirements (emerging regulations)

**Learning resources:**
- ReFED.org (food waste data and solutions)
- USDA Food Waste research
- EPA Food Recovery Hierarchy

---

## Design Skills

### 1. Camera-First UX Design

**Priority:** P0 (Critical)
**Time to competency:** 3-4 weeks

**What you need to know:**
- Designing interfaces where the camera is the primary input
- Real-time overlay rendering on camera feeds
- Managing cognitive load during scanning (too much info = overwhelming)
- Progressive disclosure: show more details on tap, not by default
- Scanning session flow design: start, scan, review, confirm
- Error recovery: what happens when the AI gets it wrong
- Camera permission UX (not just a system dialog — explain why you need it)

**Reference apps to study:**
- Google Lens (product scanning UX)
- Shazam (single-action scanning paradigm)
- Amazon app's barcode scanner
- Scandit barcode scanning demos

---

### 2. One-Handed Scanning Interface

**Priority:** P0 (Critical)
**Time to competency:** 2-3 weeks

**What you need to know:**
- Thumb zone ergonomics: reachable areas on a 6" phone screen
- Bottom-sheet patterns for action menus
- Large touch targets (48px minimum, 64px preferred for primary actions)
- Avoiding pinch, spread, and two-finger gestures during scanning
- Haptic feedback as a substitute for visual feedback (hands may be full)
- Portrait-lock during scanning (prevent accidental rotation)

**Design principles:**
- Primary actions in bottom third of screen (thumb zone)
- Confirmations via single tap, not swipe or long press
- Audio/haptic feedback for successful scans (eyes may be on shelf, not screen)
- Minimal text entry — use pickers, steppers, and voice input

---

### 3. Warehouse/Kitchen-Friendly Design

**Priority:** P1 (High)
**Time to competency:** 2-3 weeks

**What you need to know:**
- High contrast for bright fluorescent lighting
- Dark mode default for dim walk-in coolers and basements
- Glove-friendly touch targets (extra large)
- Splash/grease-proof UX (no critical gestures that wet hands would trigger)
- Loud environment considerations (visual indicators over audio)
- Quick in-and-out interactions (users have 30 seconds, not 5 minutes)

---

### 4. Data Visualization for Non-Technical Users

**Priority:** P1 (High)
**Time to competency:** 2-4 weeks

**What you need to know:**
- Simple chart types: bar, line, pie (avoid scatter plots, heat maps)
- Color-coded status indicators (green/amber/red with icon pairing)
- Summary cards with one key number and trend arrow
- Comparative visuals: this week vs last week
- Actionable insights, not just data dumps
- Mobile-friendly chart sizing and interaction

**Learning resources:**
- "Storytelling with Data" by Cole Nussbaumer Knaflic
- Victory Native (React Native charting library)
- Apple Human Interface Guidelines (Charts section)

---

### 5. Mobile Design Systems

**Priority:** P1 (High)
**Time to competency:** 3-4 weeks

**What you need to know:**
- Building a component library in React Native
- Design tokens: colors, spacing, typography, shadows
- Consistent spacing scale (4px base unit)
- Component variants and states (default, hover, pressed, disabled, error)
- Platform-adaptive design (iOS conventions vs Android Material)
- Accessibility in component design
- Dark mode implementation with theme switching

**Tools:**
- Figma for design (with React Native plugin for handoff)
- Storybook for component documentation
- Phosphor Icons for consistent iconography

---

### 6. Onboarding and Empty State Design

**Priority:** P1 (High)
**Time to competency:** 1-2 weeks

**What you need to know:**
- Progressive onboarding: teach features as users encounter them
- Empty state design: illustration + explanation + CTA
- Tooltip-based feature discovery
- Reducing time-to-first-value (get user to first successful scan in < 5 minutes)
- Skeleton screens over loading spinners
- Celebration moments (confetti on first scan, milestone achievements)

---

## Business Skills

### 1. SMB Sales (Local, Direct Sales)

**Priority:** P0 (Critical)
**Time to competency:** Ongoing (start immediately)

**What you need to know:**
- Door-to-door restaurant and retail sales techniques
- The 30-second pitch: "Can I show you how to count inventory in 15 minutes instead of 2 hours?"
- Objection handling: "I don't trust technology", "My current system works fine", "I can't afford it"
- Free trial conversion techniques
- Relationship selling: become a trusted advisor, not just a vendor
- Local business networking: BNI groups, Chamber of Commerce, restaurant associations
- Referral programs: "Refer a restaurant, get a free month"

**Key insight:** SMB SaaS is sold, not bought. You will walk into restaurants and demo the app on their shelves. This is the primary acquisition channel for the first 500 customers.

---

### 2. Digital Marketing for Local B2B

**Priority:** P1 (High)
**Time to competency:** 2-4 weeks

**What you need to know:**
- Google Ads for local intent keywords: "inventory app for restaurants", "stock counting app", "restaurant inventory management"
- Local SEO: Google Business Profile, local directory listings
- Content marketing: blog posts on inventory management tips, food waste reduction
- Social proof: case studies, testimonials, before/after stories
- App Store Optimization (ASO): keywords, screenshots, description
- Trade publication advertising: Restaurant Business, Nation's Restaurant News

---

### 3. POS Marketplace Distribution

**Priority:** P2 (Post-MVP)
**Time to competency:** 4-8 weeks per marketplace

**What you need to know:**
- Square App Marketplace: submission process, revenue share, marketing
- Toast Partner Program: requirements, integration certification
- Clover App Market: listing, pricing, installation flow
- Building for marketplace discovery: screenshots, descriptions, reviews
- Marketplace-specific requirements (security audits, data handling policies)

**Key insight:** POS marketplaces are distribution goldmines. A restaurant owner browsing the Square marketplace is already looking for tools. This is high-intent, low-cost acquisition.

---

### 4. Restaurant/Retail Partnerships

**Priority:** P1 (High)
**Time to competency:** Ongoing

**What you need to know:**
- Restaurant group relationships (one deal = multiple locations)
- Franchise consultants as referral channels
- Restaurant technology consultants as partners
- Food service distributor partnerships (Sysco, US Foods could recommend StockPulse to their customers)
- Restaurant association memberships and events
- Co-marketing with complementary tools (POS, accounting, scheduling software)

---

### 5. Pricing Strategy and Optimization

**Priority:** P1 (High)
**Time to competency:** 2-4 weeks initial, then ongoing testing

**What you need to know:**
- Value-based pricing: price against money saved, not features delivered
- Free tier as acquisition tool (not charity — it is marketing spend)
- Upgrade triggers: hitting SKU limit, adding second location, needing POS integration
- Annual discount strategy: offer 20% off for annual commitment
- Price sensitivity in SMB market: $39/mo is impulse, $99/mo requires ROI justification
- Competitive pricing analysis and positioning

---

### 6. Customer Success for SMBs

**Priority:** P1 (High)
**Time to competency:** Ongoing

**What you need to know:**
- Onboarding handholding: first 7 days determine retention
- Health scoring: scan frequency, feature adoption, support tickets
- Churn signals: decreased scan frequency, no login in 14 days
- Proactive outreach: check in at day 7, day 30, day 90
- In-app guidance: tooltips, walkthroughs, contextual help
- NPS surveys and feedback loops
- Community building: Facebook group, WhatsApp group for restaurant owners

---

### 7. Unit Economics and Financial Modeling

**Priority:** P1 (High)
**Time to competency:** 2-3 weeks

**What you need to know:**
- SaaS metrics: MRR, ARR, churn, LTV, CAC, LTV:CAC ratio
- Cohort analysis: retention by signup month, by acquisition channel
- Gross margin calculation: revenue minus infrastructure, API costs, support costs
- Burn rate management and runway planning
- Fundraising metrics that investors care about
- Financial modeling in spreadsheets (12-month and 36-month projections)

**Learning resources:**
- "SaaS Metrics 2.0" by David Skok (forEntrepreneurs.com)
- Christoph Janz's SaaS funding napkin
- Baremetrics blog on SaaS metrics

---

## Learning Priority Order

For a solo founder or 2-person team, learn in this order:

### Month 1: Foundation
1. React Native + Expo (if not already proficient)
2. TypeScript fundamentals
3. Supabase setup and basic CRUD
4. Retail/restaurant domain research (talk to 20 potential customers)

### Month 2: Core Technical
5. Camera APIs and barcode scanning
6. OpenAI Vision API integration
7. Offline data sync patterns
8. Mobile design system basics

### Month 3: Product Completion
9. Push notifications (OneSignal)
10. Camera-first UX refinement
11. Testing (Jest basics)
12. Analytics and error tracking

### Month 4-6: Business Skills
13. Local SMB sales (start selling while building)
14. Stripe payment integration
15. Digital marketing basics
16. Customer success processes

### Month 7-12: Advanced
17. POS API integrations (Square first)
18. TensorFlow Lite on-device ML
19. POS marketplace distribution
20. Financial modeling and fundraising prep

---

## Skill Gap Assessment

Use this matrix to evaluate your current team:

| Skill | No Experience | Beginner | Intermediate | Advanced | Expert |
|-------|:---:|:---:|:---:|:---:|:---:|
| React Native | | | Need here | | |
| Camera/Barcode | | | Need here | | |
| Computer Vision/AI | | Need here | | | |
| Offline Sync | | | Need here | | |
| Supabase/PostgreSQL | | | Need here | | |
| TypeScript | | | Need here | | |
| Mobile UI/UX | | | Need here | | |
| Restaurant Industry | | Need here | | | |
| SMB Sales | | Need here | | | |
| SaaS Metrics | | Need here | | | |

**Minimum viable team:** One full-stack mobile developer (technical skills) + one business/domain person (sales, restaurant knowledge, customer success). The technical person should be strong in React Native and willing to learn AI/ML integration. The business person should be comfortable walking into restaurants and pitching.

---

*Skills prioritized for speed-to-market. Learn just enough to ship, then deepen expertise based on customer feedback.*
