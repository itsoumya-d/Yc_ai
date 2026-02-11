# ComplianceSnap -- Skills Required

## Skills Overview

Building ComplianceSnap requires a rare intersection of technical depth, regulatory domain knowledge, industrial design thinking, and manufacturing sales expertise. This document maps every skill needed, why it matters, how to acquire it, and in what order to prioritize learning.

---

## 1. Technical Skills

### 1.1 React Native & Expo Development

**Why it matters**: The entire mobile app is built with React Native + Expo. This is the foundation skill.

**What you need to know**:
- React Native core concepts: components, props, state, hooks, lifecycle
- Expo managed workflow: configuration, build process, OTA updates
- Expo Router (file-based routing): navigation architecture, deep linking, dynamic routes
- Native module integration: camera, file system, location, notifications
- Performance optimization: FlatList virtualization, memo, useMemo, useCallback, Hermes engine
- Platform-specific code: iOS vs. Android differences in camera APIs, permissions, UI conventions
- React Native Reanimated: gesture handling, shared values, layout animations
- NativeWind (Tailwind for RN): responsive styling, dark mode, custom theme tokens

**Proficiency target**: Advanced. You should be able to build complex multi-screen apps with native module integration from scratch.

**Learning resources**:
- React Native official docs (reactnative.dev)
- Expo documentation (docs.expo.dev)
- "React Native in Action" by Nader Dabit
- William Candillon's YouTube channel (animations)
- Catalin Miron's YouTube channel (UI patterns)
- Expo Router documentation and examples

**Priority**: P0 -- Start here. Nothing ships without this.

---

### 1.2 Computer Vision & AI Integration

**Why it matters**: The core value proposition is AI-powered hazard detection from camera input.

**What you need to know**:

**OpenAI Vision API**:
- GPT-4o Vision API: image input formatting, system prompts for structured analysis, response parsing
- Prompt engineering for visual analysis: How to instruct the model to identify specific hazard types
- Structured output: Getting the model to return JSON with hazard type, severity, bounding boxes, confidence, regulation references
- Cost optimization: Image compression, resolution selection, prompt token management
- Latency management: Async processing, loading states, timeout handling

**On-Device ML**:
- TensorFlow Lite: Model conversion, on-device inference, performance tuning
- YOLOv8-nano: Real-time object detection architecture, training pipeline, inference optimization
- Custom training data: Collecting, labeling, and augmenting PPE detection datasets
- Model quantization: Reducing model size for mobile deployment
- React Native integration: Bridging TFLite models with RN via native modules or vision-camera frame processors

**NLP for Regulation Matching**:
- Text embeddings: OpenAI text-embedding-3, vector similarity search
- pgvector: PostgreSQL vector extension for semantic search
- Re-ranking: Using GPT-4o to re-rank candidate regulation matches
- Retrieval-augmented generation (RAG): Feeding regulation context to AI for accurate citations

**Proficiency target**: Intermediate to Advanced. You need to integrate APIs, fine-tune models, and optimize for mobile.

**Learning resources**:
- OpenAI API documentation (platform.openai.com)
- OpenAI Cookbook (GitHub)
- Ultralytics YOLOv8 documentation
- TensorFlow Lite for mobile guides
- "Deep Learning for Computer Vision" by Adrian Rosebrock (PyImageSearch)
- Hugging Face courses on NLP and embeddings
- Supabase pgvector tutorial

**Priority**: P0 -- This is the differentiator. Prototype early.

---

### 1.3 Offline-First Architecture

**Why it matters**: Manufacturing facilities frequently lack connectivity. Offline-first is not optional -- it is the core architecture decision.

**What you need to know**:
- WatermelonDB: Schema definition, model creation, queries, relations, lazy loading
- SQLite fundamentals: Understanding the database underneath WatermelonDB
- Sync protocols: Pull/push sync, delta sync, conflict resolution strategies
- Offline action queuing: FIFO queues for mutations, retry logic, idempotency
- Conflict resolution: Server-wins vs. client-wins strategies, merge algorithms
- Local asset management: Storing photos/files locally, managing device storage limits
- Network detection: NetInfo API, connectivity state management, background sync triggers
- Data consistency: Eventual consistency models, optimistic UI updates, rollback handling
- Encryption: SQLCipher for encrypting local database (compliance data is sensitive)

**Proficiency target**: Advanced. Offline sync is notoriously complex. Expect to iterate.

**Learning resources**:
- WatermelonDB documentation and GitHub repo
- "Designing Data-Intensive Applications" by Martin Kleppmann (chapters on replication and consistency)
- Expo offline-first patterns and community examples
- CouchDB/PouchDB sync protocol documentation (conceptual reference)
- React Native NetInfo documentation

**Priority**: P0 -- Architect this from day one. Retrofitting offline is extremely painful.

---

### 1.4 PDF Generation

**Why it matters**: Inspection reports are the primary deliverable. They must be professional, audit-ready, and generated on-device.

**What you need to know**:
- @react-pdf/renderer: React-based PDF generation, layout system, styling, images
- On-device generation: Performance considerations, memory management for large reports with many photos
- PDF templating: Reusable report templates, dynamic content insertion, conditional sections
- Chart embedding: Rendering compliance score charts as SVG, then embedding in PDF
- Photo embedding: Compressing and embedding inspection photos efficiently
- Multi-page layout: Page breaks, headers/footers, page numbering, table of contents
- Digital signatures: Embedding signature images, timestamp verification
- File sharing: Native share sheet integration, email attachment, cloud storage upload

**Proficiency target**: Intermediate. PDF generation is well-documented but requires attention to layout details.

**Learning resources**:
- @react-pdf/renderer documentation
- react-native-pdf-lib as alternative approach
- expo-sharing and expo-file-system documentation

**Priority**: P1 -- Important but can start with basic reports and iterate on design.

---

### 1.5 Supabase (Backend)

**Why it matters**: The entire backend -- auth, database, storage, real-time, edge functions -- runs on Supabase.

**What you need to know**:
- PostgreSQL: Schema design, indexing, full-text search, JSON operations, CTEs
- Row Level Security (RLS): Multi-tenant data isolation policies, testing RLS
- Supabase Auth: Email/password, magic link, SSO (SAML/OIDC) for enterprise
- Supabase Storage: File upload, signed URLs, image transformations, retention policies
- Edge Functions: Deno runtime, HTTP handlers, database connections, secrets management
- Real-time: Subscriptions, presence, broadcast for team collaboration features
- Database webhooks: Triggering edge functions on data changes
- Migrations: Schema versioning, migration scripts, CI/CD integration

**Proficiency target**: Intermediate to Advanced. Supabase is approachable but multi-tenant RLS requires careful design.

**Learning resources**:
- Supabase documentation (supabase.com/docs)
- Supabase YouTube channel (official tutorials)
- PostgreSQL documentation (for deep SQL)
- "The Art of PostgreSQL" by Dimitri Fontaine
- Supabase community Discord

**Priority**: P0 -- Backend foundations must be solid from day one.

---

### 1.6 State Management & Data Flow

**Why it matters**: ComplianceSnap has complex state: server state, offline cache, camera state, AI processing state, form state, sync state.

**What you need to know**:
- Zustand: Client state management for UI state, camera settings, user preferences
- TanStack React Query: Server state, caching, background refetching, optimistic updates
- WatermelonDB observables: Reactive database queries for offline data
- State architecture: When to use which tool (Zustand vs. React Query vs. WatermelonDB)
- Form management: react-hook-form for inspection checklists, validation, multi-step wizard state
- Context: Minimal React Context for theme, auth, and feature flags

**Proficiency target**: Intermediate. The concepts are standard React patterns.

**Learning resources**:
- Zustand documentation
- TanStack React Query documentation
- react-hook-form documentation
- Kent C. Dodds articles on state management

**Priority**: P1 -- Foundational but builds on React knowledge.

---

### 1.7 Testing & Quality Assurance

**What you need to know**:
- Unit testing: Jest + React Native Testing Library for components and hooks
- Integration testing: Testing offline sync, AI pipeline, PDF generation
- E2E testing: Detox or Maestro for mobile E2E testing across iOS and Android
- Snapshot testing: For UI consistency, especially report templates
- Performance testing: Frame rate monitoring (60 FPS target during camera scanning)
- Accessibility testing: iOS Accessibility Inspector, Android Accessibility Scanner
- Device testing: Matrix of devices (screen sizes, OS versions, camera capabilities)
- CI/CD: GitHub Actions for running tests, EAS Build for native builds

**Priority**: P1 -- Quality matters enormously in compliance software. Bugs can mean missed violations.

---

## 2. Domain Skills

### 2.1 OSHA Regulations (29 CFR 1910 / 1926)

**Why it matters**: OSHA regulations are the core compliance framework the app validates against. You must understand the structure, key standards, and how inspectors apply them.

**What you need to know**:

**Regulation Structure**:
- 29 CFR 1910: General Industry standards (applies to manufacturing)
- 29 CFR 1926: Construction standards
- Subpart organization: Each subpart covers a domain (PPE, fire, electrical, etc.)
- Section/paragraph numbering: How to cite "29 CFR 1910.134(c)(1)(i)"
- General Duty Clause (Section 5(a)(1)): Catch-all for hazards not covered by specific standard

**Key Standards to Know Deeply**:
- 1910.132-138: Personal Protective Equipment (PPE)
- 1910.146: Permit-Required Confined Spaces
- 1910.147: Control of Hazardous Energy (Lockout/Tagout)
- 1910.212: Machine Guarding
- 1910.303-308: Electrical
- 1910.1200: Hazard Communication (GHS)
- 1910.157: Portable Fire Extinguishers
- 1926.501-503: Fall Protection (construction)
- 1926.1153: Respirable Crystalline Silica

**Inspection Process**:
- How OSHA conducts inspections (opening conference, walkaround, closing conference)
- Citation types: Willful, Serious, Other-than-Serious, De Minimis, Repeat
- Penalty calculation: Gravity-based penalty system, adjustment factors
- Abatement periods: How long companies have to fix violations
- Contest process: How to challenge citations

**Learning resources**:
- OSHA.gov (standards, directives, interpretive letters)
- OSHA Training Institute Education Centers (OSHA 10/30 courses)
- "OSHA 2024 General Industry Regulations" (Mancomm)
- OSHA Federal Register notices (for new/amended standards)
- OSHA inspection data (publicly available on OSHA website)

**Priority**: P0 -- This is domain expertise that gives the product credibility.

---

### 2.2 ISO 45001 -- Occupational Health & Safety

**Why it matters**: International standard that many manufacturers certify against, especially those with global operations.

**What you need to know**:
- Plan-Do-Check-Act framework within ISO 45001
- Key clauses: Context of organization, Leadership, Planning, Support, Operation, Performance Evaluation, Improvement
- How ISO 45001 differs from OSHA (management system vs. prescriptive standards)
- Audit process: Internal audits, third-party certification audits
- Integration with ISO 9001 (quality) and ISO 14001 (environmental)

**Learning resources**:
- ISO 45001:2018 standard text (purchase from ISO)
- BSI Group free guides and webinars
- "ISO 45001 Implementation" by Dejan Kosutic

**Priority**: P2 -- Important for enterprise customers but not MVP-critical.

---

### 2.3 NFPA Codes

**Why it matters**: Fire safety is one of the most commonly cited OSHA categories.

**What you need to know**:
- NFPA 70E: Electrical safety in the workplace (arc flash, PPE requirements)
- NFPA 101: Life Safety Code (egress, exit routes, signage)
- NFPA 30: Flammable and combustible liquids storage
- NFPA 13: Sprinkler systems
- NFPA fire extinguisher inspection requirements (monthly visual, annual maintenance)

**Priority**: P1 -- Fire safety is a top-3 inspection category.

---

### 2.4 GHS Chemical Labeling

**Why it matters**: Hazard Communication (HazCom) is consistently OSHA's most-cited standard.

**What you need to know**:
- GHS label elements: Product identifier, signal word, hazard statements, precautionary statements, pictograms, supplier info
- Safety Data Sheets (SDS): 16-section format, required availability
- Secondary container labeling requirements
- Chemical compatibility and proper storage (segregation requirements)
- OSHA 1910.1200 requirements for written HazCom program

**Priority**: P1 -- HazCom violations are extremely common. High-value detection category.

---

### 2.5 PPE Standards

**Why it matters**: PPE compliance is visually detectable (ideal for computer vision) and frequently cited.

**What you need to know**:
- ANSI Z87.1: Eye and face protection
- ANSI Z89.1: Head protection (hard hats, classes, types)
- ANSI/ISEA 107: High-visibility safety apparel (classes, types)
- ASTM F2413: Protective footwear (steel/composite toe ratings)
- ANSI S3.19 / S12.6: Hearing protection (NRR ratings)
- EN 388 / ANSI/ISEA 138: Hand protection (cut resistance levels)
- Respirator standards (NIOSH certification, fit testing requirements per 1910.134)

**Priority**: P0 -- PPE detection is the core AI feature.

---

### 2.6 Manufacturing Floor Operations

**Why it matters**: You cannot build a tool for manufacturing without understanding how factories actually work.

**What you need to know**:
- Common manufacturing processes: CNC machining, stamping, welding, painting, assembly, packaging
- Floor layout: Production cells, material flow, staging areas, maintenance shops
- Shift operations: Multiple shifts, changeover procedures, handoff communication
- Equipment types: Presses, lathes, conveyors, forklifts, cranes, compressors
- Maintenance: Preventive maintenance schedules, lockout/tagout procedures
- Lean manufacturing concepts: 5S, Kaizen, visual management (relevant to housekeeping inspections)
- Common hazard areas: Pinch points, rotating machinery, elevated work, confined spaces, chemical storage

**Learning resources**:
- Factory tours (reach out to local manufacturers -- most are proud to show their operations)
- "The Goal" by Eliyahu Goldratt (manufacturing operations classic)
- YouTube channels: Engineering Explained, Practical Engineering, How It's Made
- OSHA eTool modules for specific industries (machining, welding, etc.)
- Manufacturing trade publications: IndustryWeek, Modern Machine Shop

**Priority**: P0 -- Visit real factories. Observe real inspections. Talk to real safety officers.

---

## 3. Design Skills

### 3.1 Industrial-Environment UX

**Why it matters**: Standard mobile UX patterns fail on a factory floor. The environment is hostile to normal phone use.

**Design constraints**:
- **Gloves**: Workers often wear gloves. Touch targets must be 56px minimum (vs. standard 44px). No precision gestures (no pinch-to-zoom for primary actions -- button-based zoom instead).
- **Bright sunlight / poor lighting**: Screens must be readable in direct sunlight and dim warehouse interiors. High contrast mode is essential, not optional.
- **One-handed use**: Inspectors hold equipment, open doors, or carry tools with one hand. The phone is in the other. All primary actions must be one-handed.
- **Dirty screens**: Greasy, dusty fingers. Avoid swipe-dependent navigation. Use large tap targets.
- **Noise**: Cannot rely on audio feedback alone. Haptic + visual feedback for all confirmations.
- **Interruptions**: Inspectors get interrupted constantly (radio calls, questions, emergencies). Auto-save aggressively. Resume from where they left off.

**Design principles**:
1. **Big, bold, obvious**: Every element earns its screen space. No small text. No subtle buttons.
2. **Safety color conventions**: Red = danger/critical. Orange = warning. Yellow = caution. Green = compliant/safe. Blue = informational. These are universal in industrial settings.
3. **Minimal typing**: Dropdowns, toggles, voice input, and photo evidence over text entry.
4. **Status always visible**: Sync status, battery, connectivity, inspection progress -- always visible at a glance.
5. **Fail-safe**: If something goes wrong, data is never lost. Inspections resume, photos are cached, reports recover.

**Learning resources**:
- Observe safety officers using their current tools (paper checklists, camera apps)
- Nielsen Norman Group articles on field worker UX
- "Designing for the Digital Age" by Kim Goodwin (contextual inquiry chapters)
- Apple Human Interface Guidelines (accessibility sections)
- Google Material Design (large screen / adaptive layout guidelines)

**Priority**: P0 -- Get this wrong and the app is unusable in the one environment that matters.

---

### 3.2 Safety Color Conventions

**Why it matters**: Manufacturing workers intuitively understand safety color coding. Using these conventions makes the app immediately legible.

| Color            | Industrial Meaning     | ComplianceSnap Usage              | Hex       |
| ---------------- | ---------------------- | --------------------------------- | --------- |
| Red              | Danger / Stop / Fire   | Critical violations, alerts       | #FF3B30   |
| Orange           | Warning                | Major violations, caution         | #FF9500   |
| Yellow           | Caution                | Minor violations, brand accent    | #FFC107   |
| Green            | Safety / First Aid     | Compliant, resolved, go           | #34C759   |
| Blue             | Information / Notice   | Observations, informational       | #007AFF   |
| Purple           | Radiation (specific)   | Admin role badge (non-standard)   | #AF52DE   |
| White            | Housekeeping/Traffic   | Background, cards                 | #FFFFFF   |
| Black/Charcoal   | Boundaries/Text        | Primary text, backgrounds         | #2D3436   |

**Priority**: P0 -- Embedded in the design system from day one.

---

### 3.3 Data Visualization for Compliance

**What you need to know**:
- Compliance score gauges (circular, 0-100, color-gradient)
- Trend line charts (score over time with goal lines and thresholds)
- Severity distribution charts (donut/pie with safety colors)
- Risk heatmaps (facility floor plan with color-coded zones)
- Comparison bar charts (facility vs. facility, period vs. period)
- React Native charting libraries: Victory Native, react-native-svg-charts, react-native-chart-kit

**Priority**: P1 -- Analytics screens rely on clear, readable charts.

---

## 4. Business Skills

### 4.1 Manufacturing Sales Cycles

**Why it matters**: Selling to manufacturers is fundamentally different from selling to tech companies.

**What you need to know**:
- Sales cycles are long (3-6 months for mid-market, 6-12 months for enterprise)
- Decision makers: EHS Director (champion), Plant Manager (budget), VP Operations (approval), Procurement (process)
- Proof of concept (POC) is essential: Manufacturers want to see it work in their specific facility before committing
- On-site demos win deals: Remote demos are supplementary. The sale happens on the factory floor.
- ROI justification: "How many OSHA fines will this prevent?" is the closing argument
- Budget cycles: Manufacturing budgets are set annually. Timing matters.
- Risk aversion: Manufacturers are conservative adopters. References from peer companies are critical.
- Procurement process: PO-based purchasing, vendor qualification, insurance certificate requirements

**Learning resources**:
- "The Challenger Sale" by Brent Adamson & Matthew Dixon
- "Selling to Big Companies" by Jill Konrath
- Manufacturing trade show attendance (ASSP Safety Conference, NSC Congress)
- EHS professional LinkedIn groups and forums

**Priority**: P1 -- Product-market fit first, but understand the sales motion early.

---

### 4.2 EHS Director Relationships

**Why it matters**: EHS Directors are the primary buyers and champions for ComplianceSnap.

**What you need to know**:
- Their daily pain: Too many regulations, too little time, too few resources, fear of OSHA citations
- Their professional organizations: American Society of Safety Professionals (ASSP), National Safety Council (NSC), Board of Certified Safety Professionals (BCSP)
- Their career motivations: Protecting workers, avoiding fines, proving value to management
- How they evaluate tools: Ease of use on the floor, report quality for management, regulatory accuracy
- Communication style: They value precision, authority, and evidence. Do not oversell.
- Trust signals: Compliance certifications, endorsements from OSHA consultation programs, references from peers

**Priority**: P1 -- Build relationships with 10+ EHS directors before MVP launch.

---

### 4.3 Compliance Consulting Partnerships

**Why it matters**: EHS consultants can be both users and channel partners, bringing multiple client facilities.

**What you need to know**:
- Independent EHS consultants typically serve 10-50 client companies
- Insurance loss control specialists inspect client facilities regularly
- OSHA On-Site Consultation Program (free OSHA consulting for small businesses) is a potential partnership channel
- Consultant partnership model: Revenue share or referral fee for bringing clients
- White-label opportunity: Consultants want reports branded with their firm's logo

**Priority**: P2 -- Channel strategy for post-MVP growth.

---

### 4.4 Insurance Carrier Partnerships

**Why it matters**: Insurance companies want their policyholders to be safer (fewer claims). They can incentivize ComplianceSnap adoption through premium discounts.

**What you need to know**:
- Workers' compensation insurance: Premium calculation based on experience modification rate (EMR)
- Loss control programs: Insurance carriers employ loss control reps who inspect policyholder facilities
- Premium discount programs: Carriers offer 5-15% discounts for documented safety programs
- Data sharing (with consent): Aggregated compliance data can help carriers price risk more accurately
- Partnership structure: Carrier recommends ComplianceSnap; policyholder gets discount; ComplianceSnap gets customer acquisition at near-zero CAC

**Priority**: P2 -- High-leverage partnership for scaling acquisition.

---

## 5. Skills Priority Order

The recommended order for skill acquisition, optimized for getting to MVP fastest:

| Priority | Skill                              | Timeline to Proficiency | Phase         |
| -------- | ---------------------------------- | ----------------------- | ------------- |
| 1        | React Native + Expo                | 4-6 weeks               | MVP           |
| 2        | Supabase (PostgreSQL, Auth, RLS)   | 2-3 weeks               | MVP           |
| 3        | OSHA Regulations (core standards)  | 4-8 weeks (ongoing)     | MVP           |
| 4        | OpenAI Vision API integration      | 2-3 weeks               | MVP           |
| 5        | Offline-first architecture         | 4-6 weeks               | MVP           |
| 6        | Industrial-environment UX design   | 2-4 weeks               | MVP           |
| 7        | On-device ML (YOLO/TFLite)         | 3-5 weeks               | MVP           |
| 8        | PDF report generation              | 1-2 weeks               | MVP           |
| 9        | PPE standards (ANSI)               | 2-3 weeks               | MVP           |
| 10       | Manufacturing floor operations     | Ongoing (factory visits) | MVP + ongoing |
| 11       | GHS chemical labeling              | 1-2 weeks               | MVP           |
| 12       | State management patterns          | 1-2 weeks               | MVP           |
| 13       | Data visualization                 | 1-2 weeks               | Post-MVP      |
| 14       | Manufacturing sales cycles         | Ongoing                 | Post-MVP      |
| 15       | NFPA fire codes                    | 2-3 weeks               | Post-MVP      |
| 16       | ISO 45001                          | 2-3 weeks               | Post-MVP      |
| 17       | EHS director relationship building | Ongoing                 | Post-MVP      |
| 18       | Testing & QA (Detox/Maestro)       | 2-3 weeks               | Post-MVP      |
| 19       | NLP & RAG for regulation search    | 2-3 weeks               | Post-MVP      |
| 20       | Insurance/consulting partnerships  | Ongoing                 | Year 2        |

---

## Skill Gap Assessment Template

Use this to evaluate your current team's readiness:

| Skill Area                 | Required Level   | Current Level | Gap     | Plan to Close                    |
| -------------------------- | ---------------- | ------------- | ------- | -------------------------------- |
| React Native               | Advanced         |               |         |                                  |
| Computer Vision / AI       | Advanced         |               |         |                                  |
| Offline Architecture       | Advanced         |               |         |                                  |
| OSHA Regulations           | Intermediate     |               |         |                                  |
| PostgreSQL / Supabase      | Intermediate     |               |         |                                  |
| Industrial UX Design       | Intermediate     |               |         |                                  |
| PDF Generation             | Intermediate     |               |         |                                  |
| Manufacturing Operations   | Basic            |               |         |                                  |
| B2B Sales (Manufacturing)  | Intermediate     |               |         |                                  |

---

## Hiring Priorities

If building a founding team from scratch:

1. **Full-stack mobile engineer** with React Native + offline sync experience (most critical hire)
2. **ML/AI engineer** with computer vision and model deployment experience (core differentiator)
3. **Domain advisor** -- former EHS director or safety consultant (part-time/advisory, not full-time initially)
4. **Designer** with industrial/field-worker UX experience (contract initially, then full-time)
5. **Sales/GTM lead** with manufacturing B2B experience (post-MVP hire)
