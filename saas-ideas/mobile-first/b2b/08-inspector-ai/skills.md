# Skills — Inspector AI

> Technical, domain, design, and business skills required to build and scale Inspector AI.

---

## Technical Skills

### T1: React Native + Expo Development

**Why it matters**: The entire mobile application runs on React Native. Every feature — camera, offline storage, AI overlay, report generation — depends on deep React Native expertise.

**Required competencies:**
- React Native component architecture with TypeScript
- Expo managed workflow and EAS Build/Update pipeline
- Custom native modules (when Expo modules fall short)
- Performance optimization: FlatList virtualization, memo, useCallback
- Navigation: React Navigation v6+ with nested stack/tab navigators
- Gesture handling: React Native Gesture Handler for annotation tools
- Animation: Reanimated v3 for smooth AI overlay animations
- Deep linking for assignment intake from emails and SMS

**Learning resources:**
- React Native documentation (reactnative.dev)
- Expo documentation (docs.expo.dev)
- "React Native in Action" by Nader Dabit
- Infinite Red's React Native Newsletter
- William Candillon's "Can it be done in React Native?" YouTube series
- React Native Radio podcast

---

### T2: TypeScript (Strict Mode)

**Why it matters**: Type safety prevents runtime crashes in the field where adjusters cannot afford app failures. Strict TypeScript catches bugs before they reach production.

**Required competencies:**
- Strict mode configuration (no `any`, no implicit returns)
- Generic types for API response typing
- Discriminated unions for damage type classification
- Zod for runtime validation of API responses and user input
- Type-safe navigation with React Navigation typed routes
- Shared types between mobile app and edge functions

**Learning resources:**
- TypeScript Handbook (typescriptlang.org/docs)
- "Effective TypeScript" by Dan Vanderkam
- Matt Pocock's Total TypeScript course
- Type Challenges GitHub repository

---

### T3: Computer Vision API Integration

**Why it matters**: The core value proposition — AI damage detection — depends on reliable, accurate integration with vision models.

**Required competencies:**
- OpenAI GPT-4o Vision API: prompt engineering, structured output, token management
- Image preprocessing: resizing, compression, format conversion before API submission
- Prompt engineering for domain-specific damage classification
- Structured JSON output parsing from vision model responses
- Confidence score calibration and threshold tuning
- Fallback strategies when primary AI provider is unavailable
- On-device inference with ONNX Runtime and TensorFlow Lite
- Model evaluation metrics: precision, recall, F1 for damage classification

**Learning resources:**
- OpenAI API documentation (platform.openai.com)
- "Building LLM Apps" by Valentina Alto
- Hugging Face computer vision course
- ONNX Runtime documentation
- Google ML Kit documentation for on-device vision

---

### T4: PDF Generation

**Why it matters**: The deliverable product is a PDF report. Quality, speed, and reliability of PDF generation directly impact user satisfaction and professional credibility.

**Required competencies:**
- React-based PDF rendering (react-pdf or expo-print with HTML/CSS)
- Complex layouts: multi-column, photo grids, tables, headers/footers
- Image embedding and compression within PDFs
- Dynamic page breaking and pagination
- Font embedding for consistent rendering across devices
- PDF/A compliance for archival requirements
- On-device generation for offline scenarios
- Cloud-based generation for complex reports (Vercel serverless)

**Learning resources:**
- react-pdf documentation (react-pdf.org)
- expo-print documentation
- PDF specification reference (Adobe)
- Puppeteer for server-side PDF generation

---

### T5: Offline-First Architecture

**Why it matters**: Adjusters work in disaster zones with no connectivity. Offline capability is not a nice-to-have — it is a hard requirement for the target market.

**Required competencies:**
- WatermelonDB for relational offline data management
- SQLite for structured local storage
- MMKV for fast key-value persistence
- Conflict resolution strategies (last-write-wins, merge, manual)
- Background sync with retry logic and exponential backoff
- Queue management for pending uploads
- Connectivity detection and graceful mode switching
- Data integrity guarantees during partial sync
- Local-first architecture patterns

**Learning resources:**
- WatermelonDB documentation and architecture guide
- "Designing Data-Intensive Applications" by Martin Kleppmann (Chapter 5: Replication)
- "Local-First Software" paper by Ink & Switch
- CRDTs and operational transformation concepts

---

### T6: Image Processing

**Why it matters**: Inspector AI captures, processes, annotates, and transmits thousands of images daily. Efficient image handling affects storage costs, upload times, and user experience.

**Required competencies:**
- Camera API configuration for high-resolution capture
- Image compression: JPEG quality tuning, WebP conversion
- EXIF metadata reading and writing (GPS, orientation, timestamp)
- Thumbnail generation for gallery views
- Canvas-based annotation rendering
- Image comparison algorithms for before/after analysis
- Batch processing for upload queues
- Memory management for handling large image sets without crashes

**Learning resources:**
- expo-camera and expo-image-manipulator documentation
- Sharp library documentation (for server-side processing)
- Digital image processing fundamentals (Gonzalez & Woods)

---

### T7: Supabase Backend Development

**Why it matters**: Supabase is the entire backend. Auth, database, storage, real-time sync, and edge functions all run on Supabase.

**Required competencies:**
- PostgreSQL schema design with proper indexing
- Row-Level Security (RLS) policies for multi-tenant isolation
- Supabase Auth: email/password, SSO (SAML/OIDC), session management
- Supabase Storage: bucket management, signed URLs, upload policies
- Edge Functions (Deno): API orchestration, webhook handlers, AI pipeline
- Realtime subscriptions for live data sync
- Database migrations and version control
- pgvector for semantic search across inspection data
- Database performance optimization (EXPLAIN ANALYZE, index tuning)

**Learning resources:**
- Supabase documentation (supabase.com/docs)
- PostgreSQL documentation (postgresql.org)
- "The Art of PostgreSQL" by Dimitri Fontaine
- Supabase YouTube channel (official tutorials)

---

## Domain Skills

### D1: Insurance Inspection Workflows

**Why it matters**: Building for adjusters without understanding their workflow results in a product nobody uses. Domain expertise is the difference between a tool and a toy.

**Required competencies:**
- End-to-end claims process: FNOL, assignment, inspection, estimation, settlement
- Independent adjuster vs. staff adjuster vs. public adjuster workflows
- Catastrophe (CAT) response deployment and surge operations
- Desk adjuster vs. field adjuster responsibilities
- Reinspection and supplement workflows
- Claims file documentation requirements
- State-specific insurance regulations affecting inspections
- Common fraud indicators and documentation requirements

**Learning resources:**
- AIC (Associate in Claims) certification coursework
- TWIA (Texas Windstorm Insurance Association) inspection guidelines
- NAIC (National Association of Insurance Commissioners) publications
- Shadow 5-10 adjusters during actual inspections (irreplaceable)
- Insurance Journal and Claims Magazine publications
- PLRB (Property Loss Research Bureau) resources

---

### D2: Property Damage Classification

**Why it matters**: The AI must accurately classify damage types. Misclassification leads to incorrect reports, carrier rejections, and loss of trust.

**Required competencies:**
- **Roof damage**: Hail impact patterns (bruising, granule loss, cracking), wind damage (lifted/missing shingles, creasing), age-related wear vs. storm damage differentiation, material-specific damage signatures (asphalt, metal, tile, slate, TPO, EPDM)
- **Siding damage**: Impact damage vs. weathering, vinyl, fiber cement, wood, stucco, brick damage patterns
- **Foundation damage**: Structural cracking patterns (settlement vs. hydrostatic pressure), water intrusion signs, grading issues
- **Water damage**: IICRC water damage categories (1-4) and classes (1-4), mold identification, moisture mapping concepts
- **Fire damage**: Char patterns, smoke damage severity, salvageable vs. total loss assessment
- **Wind damage**: Beaufort scale correlation, debris impact vs. wind uplift, tree fall patterns
- **Interior damage**: Ceiling, wall, and flooring damage classification, content vs. structural damage

**Learning resources:**
- Haag Engineering "Residential Roof Inspection" course
- IICRC S500 Standard for water damage restoration
- IICRC S520 Standard for mold remediation
- InterNACHI inspection training materials
- Forensic weather data analysis resources

---

### D3: Carrier-Specific Reporting Standards

**Why it matters**: Each insurance carrier has different report format requirements. Non-compliant reports are rejected, delaying claims and frustrating adjusters.

**Required competencies:**
- Xactimate estimate format and line-item codes
- Symbility estimate platform integration
- Carrier-specific photo requirements (minimum counts, required angles)
- Report narrative standards per carrier
- Supplement documentation requirements
- Digital submission formats (XML, API, portal upload)
- State-specific disclosure and certification requirements

**Learning resources:**
- Xactimate training courses (Verisk)
- Symbility training resources
- Individual carrier adjuster portals and guidelines
- AINS (Associate in Insurance) coursework

---

### D4: Xactimate and Symbility Familiarity

**Why it matters**: Xactimate is the de facto standard for property claims estimation. Integration with Xactimate is essential for adoption.

**Required competencies:**
- Xactimate desktop and Xactimate Online (XO) workflows
- Xactimate pricing database and line-item structure
- Sketch tool and area measurement integration
- ESX (Xactimate data exchange) file format
- Symbility platform workflows and data formats
- Two-way data sync between Inspector AI and estimation platforms

**Learning resources:**
- Verisk Xactimate certification program
- CoreLogic Symbility training
- YouTube tutorials from experienced Xactimate trainers

---

## Design Skills

### DS1: Mobile Photography UX

**Why it matters**: The camera interface is where adjusters spend most of their time. If the photo capture experience is slow, confusing, or unreliable, the entire product fails.

**Required competencies:**
- Camera UI design for field conditions (bright sun, rain, wind)
- One-handed operation design (controls in thumb-reach zone)
- Real-time overlay design that informs without obstructing
- Photo quality feedback indicators
- Batch capture mode UX
- Annotation tool design for touch screens
- Accessible design for adjusters of all ages (many are 50+)

**Learning resources:**
- Apple Human Interface Guidelines (Camera and Photos)
- Google Material Design 3 (Camera patterns)
- Study camera UIs: iPhone Camera, ProCamera, Halide, Google Lens
- Field testing with actual adjusters in outdoor conditions

---

### DS2: Annotation Tool Design

**Why it matters**: Adjusters need to draw on photos to highlight damage areas, add arrows and labels, and communicate findings visually.

**Required competencies:**
- Touch-based drawing tools (freehand, shapes, arrows, text)
- Canvas rendering performance for smooth drawing
- Undo/redo stack management
- Color and stroke width selection interfaces
- Layer management (original photo, AI overlay, manual annotations)
- Export of annotated images as flat JPEG/PNG

**Learning resources:**
- Sketchbook app UX analysis
- Markup tool in iOS Photos (study its interaction patterns)
- Canvas API documentation for React Native (react-native-canvas, Skia)

---

### DS3: Report Template Design

**Why it matters**: The PDF report is what adjusters submit to carriers. Its design reflects on the adjuster's professionalism and directly impacts carrier acceptance rates.

**Required competencies:**
- Professional document layout design
- Multi-page report structures with consistent headers/footers
- Photo grid layouts optimized for damage documentation
- Data table design for damage findings
- Typography for print-quality documents
- Brand-consistent templates that work for any adjusting firm

**Learning resources:**
- Professional report design examples from McKinsey, Deloitte
- Adobe InDesign layout principles (applied to programmatic PDF)
- Print design fundamentals (margins, bleed, safe areas)

---

## Business Skills

### B1: Insurance Industry Partnerships

**Why it matters**: Inspector AI's success depends on relationships with carriers, adjusting firms, and industry organizations. This is a relationship-driven industry.

**Required competencies:**
- Insurance industry conference circuit (PLRB, NAIC, InsureTech Connect)
- Carrier technology partnership programs
- MGA (Managing General Agent) relationships
- State department of insurance compliance requirements
- Insurance industry lobbying landscape and regulatory trends
- Data privacy requirements (state-specific insurance data laws)

**Learning resources:**
- Attend PLRB Claims Conference and InsureTech Connect
- Join NAPIA (National Association of Public Insurance Adjusters)
- Subscribe to Insurance Journal and Carrier Management
- Build relationships with insurance tech accelerators (Plug and Play, Startupbootcamp)

---

### B2: Adjuster Workflow Optimization

**Why it matters**: Understanding exactly how adjusters work — their pain points, their daily routine, their tool preferences — determines product-market fit.

**Required competencies:**
- Day-in-the-life understanding of independent adjusters
- Catastrophe deployment logistics and workflows
- Adjuster compensation models (per-claim fees, salary, hybrid)
- Tool adoption patterns in a traditionally low-tech workforce
- Training and onboarding program design for field tools
- Change management in insurance organizations

**Learning resources:**
- Shadow adjusters during CAT deployments (most valuable experience)
- Adjuster forums and communities (AdjusterForum.com, Facebook groups)
- TWIA and Citizens Property Insurance inspection programs
- Interview 50+ adjusters about their workflow pain points

---

### B3: Carrier Relationship Management

**Why it matters**: Enterprise sales to carriers and large adjusting firms require multi-stakeholder relationship management and long sales cycles.

**Required competencies:**
- Enterprise B2B sales cycles (6-18 months for carriers)
- Procurement and vendor management processes at carriers
- Security and compliance requirements (SOC 2, data residency)
- Pilot program design and success metrics
- API integration partnership models
- Volume-based pricing negotiations
- Multi-stakeholder decision mapping (claims VP, IT, compliance, field ops)

**Learning resources:**
- "The Challenger Sale" by Matthew Dixon and Brent Adamson
- "Crossing the Chasm" by Geoffrey Moore
- Insurance industry CRM and sales cycle case studies
- YC Startup School on enterprise sales

---

## Skills Unique to Inspector AI

These skills are specifically required because of Inspector AI's unique positioning at the intersection of AI, mobile, and insurance:

### U1: Field-Condition AI Deployment

Unlike typical AI products that run in controlled environments, Inspector AI's AI must work in unpredictable field conditions — bright sunlight, rain, dust, low light, damaged structures. This requires understanding how environmental factors affect computer vision accuracy and designing robust fallback strategies.

### U2: Insurance-Grade Documentation Standards

Every photo, annotation, and report generated by Inspector AI may be used in legal proceedings, fraud investigations, or regulatory reviews. The skill of building systems that produce legally defensible documentation — with proper chain of custody, timestamp verification, and audit trails — is unique to insurance tech.

### U3: Catastrophe-Scale System Design

During major storms, Inspector AI must handle 10-100x normal load as thousands of adjusters are deployed simultaneously in affected areas. Designing systems that scale elastically during catastrophes while maintaining reliability in degraded network conditions is a skill that combines disaster response planning with distributed systems engineering.

### U4: Offline-First AI Hybrid Architecture

Most AI products assume always-on connectivity. Inspector AI must provide useful AI analysis even without internet, then seamlessly upgrade to full cloud AI analysis when connectivity returns — without duplicate processing, data loss, or inconsistent results. This hybrid on-device/cloud AI architecture is uncommon and requires deep expertise in both mobile ML deployment and cloud AI orchestration.

### U5: Cross-Carrier Report Compliance

Each insurance carrier has unique report requirements that change frequently. Building a template system that stays current across 50+ carriers, adapts to regulatory changes, and produces compliant output every time requires a blend of insurance domain expertise and template engineering that is rarely found in a single person or team.

---

## Team Composition (Recommended)

### MVP Team (Months 1-6): 5-6 people

| Role | Skills Required | Count |
|---|---|---|
| Founding Engineer (Mobile) | T1, T2, T5, T6 | 1 |
| Founding Engineer (Backend/AI) | T3, T7, D2 | 1 |
| Product Designer | DS1, DS2, DS3 | 1 |
| Insurance Domain Expert | D1, D2, D3, D4 | 1 |
| Founder/CEO | B1, B2, B3 | 1 |
| Part-time QA / Beta Coordinator | — | 0.5 |

### Growth Team (Months 7-18): 10-12 people

Add:
- 2 additional mobile engineers
- 1 ML engineer (custom model training)
- 1 full-stack engineer (analytics dashboard, web admin)
- 1 sales/partnerships lead
- 1 customer success manager
- 1 additional designer

### Scale Team (Year 2+): 20-30 people

Add:
- Platform engineering team (3-4)
- ML/AI team (2-3)
- Sales team (3-4)
- Customer success team (2-3)
- Marketing (1-2)
- Operations/compliance (1-2)

---

*The rarest and most valuable skill for Inspector AI is the combination of mobile engineering excellence and insurance domain expertise. Finding or developing this hybrid competency is the single biggest hiring challenge.*
