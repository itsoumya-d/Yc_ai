# Skills

Building SiteSync requires a rare intersection of mobile engineering, AI/ML expertise, construction domain knowledge, and B2B sales ability. This document maps every skill needed, from writing Vision API prompts that understand framing vs. rough-in, to walking onto a job site and demoing the app to a skeptical superintendent.

---

## Technical Skills

### React Native / Expo — Advanced

**Why Advanced:** SiteSync's core value proposition depends on flawless camera capture, GPS tracking, offline queuing, and background uploads -- all areas where React Native requires deep platform knowledge.

**Specific Competencies:**
- **Camera integration**: Expo Camera module with custom viewfinder overlays, manual flash/torch control, resolution settings, and continuous capture mode
- **GPS and location services**: Continuous foreground tracking during walk-throughs, background location for geofencing, high-accuracy mode configuration, altitude and heading data
- **Offline-first architecture**: SQLite for local data persistence, file system management for photo queue, network state monitoring, automatic sync reconciliation
- **Background tasks**: expo-task-manager for background photo uploads, background fetch for report notifications, handling iOS and Android background execution limits
- **File system management**: Large file handling (100+ high-res photos per session), compression pipelines, batch upload optimization, storage monitoring
- **Performance optimization**: Virtualized lists for photo galleries (1000+ photos), image caching strategies, memory management for photo-heavy views, lazy loading
- **Platform-specific code**: Camera permissions on iOS vs. Android, GPS battery optimization differences, file system path differences, notification channel setup
- **Deep linking**: Expo Router file-based routing, universal links for shared reports, push notification deep links to specific violations
- **OTA updates**: EAS Update configuration, update channels for staged rollouts, critical update forcing for bug fixes

**Learning Resources:**
- Expo documentation (camera, location, file system, task manager modules)
- React Native performance optimization guides
- Platform-specific GPS accuracy tuning for iOS Core Location and Android Location Services
- Background execution best practices for both platforms

---

### TypeScript — Advanced

**Why Advanced:** Type safety is critical when processing AI responses, constructing database queries, and handling complex photo metadata pipelines.

**Specific Competencies:**
- **Strict typing for AI responses**: Zod schemas validating OpenAI Vision API JSON responses, discriminated unions for different analysis types, type guards for optional violation data
- **Database type generation**: Supabase CLI-generated types from PostgreSQL schema, typed queries and mutations, real-time subscription payload typing
- **Complex state typing**: Zustand store types with nested state, TanStack Query key factories with typed returns, generic hooks for reusable data patterns
- **Geospatial types**: Coordinate tuples, floor plan calibration matrices, GPS accuracy confidence intervals, compass heading types
- **Type-safe navigation**: Expo Router typed routes, screen parameter types, type-safe deep link handling
- **Build configuration**: tsconfig for React Native (jsx, module resolution), path aliases, strict mode configuration

---

### Supabase Real-Time — Intermediate

**Why Intermediate:** Real-time subscriptions are used for the team photo feed and safety alerts, but the subscription patterns themselves are straightforward.

**Specific Competencies:**
- **Real-time subscriptions**: Channel setup for postgres_changes events, filtered subscriptions by site_id, presence tracking for online team members
- **Row Level Security**: RLS policies for company/site isolation, team role-based access, policy testing and debugging
- **Edge Functions**: Deno runtime for serverless AI processing, secrets management, function invocation from client, scheduled function execution via pg_cron
- **Storage**: Bucket configuration for photo storage, upload policies, image transformations for thumbnails, CDN URL generation, presigned URLs for large uploads
- **Auth**: Magic link authentication (phone and email), JWT token management, session refresh, custom claims for roles
- **Database design**: PostgreSQL schema design for construction data, indexes for common queries (photos by site+date, violations by status), JSONB columns for flexible AI response storage
- **Migrations**: Schema migration management, seed data for development, environment-specific configurations

---

### OpenAI Vision API — Intermediate

**Why Intermediate:** The core AI features (scene analysis, safety detection, report generation) require solid prompt engineering but not model fine-tuning or custom training.

**Specific Competencies:**
- **Prompt engineering for construction**: Crafting system prompts that reliably identify construction phases, materials, and equipment; iterating on prompts for accuracy; handling edge cases (demolition vs. construction, different building types)
- **Structured output**: Using JSON response format mode, designing schemas for consistent AI output, handling malformed responses gracefully, retry logic for failed analyses
- **Image analysis**: Understanding Vision API detail levels (low/high), image resolution requirements for construction detail, batch analysis strategies, cost optimization
- **Safety violation prompts**: Encoding OSHA standards into system prompts, calibrating severity classification, minimizing false positives while maintaining recall, handling ambiguous situations
- **Report narrative generation**: Generating professional construction report language, maintaining consistency across daily reports, incorporating schedule context, comparing to previous reports
- **Cost management**: Token usage monitoring, image detail level optimization, caching repeated analyses, batching strategies for multi-photo analysis
- **Error handling**: Rate limit management, timeout handling for large batches, fallback strategies when API is unavailable, graceful degradation without AI

---

### Mapbox SDK — Intermediate

**Why Intermediate:** Mapbox provides geolocation, floor plan overlays, and site mapping, but the integration patterns are well-documented.

**Specific Competencies:**
- **React Native Mapbox GL**: Map rendering in React Native, custom map styles, marker clustering for photo locations, offline map tiles for field use
- **Geocoding**: Address-to-coordinate conversion for site setup, reverse geocoding for photo location labels
- **Floor plan overlay**: Custom tile source for floor plan images, coordinate system transformation (GPS to pixel), opacity controls for overlay vs. satellite toggle
- **GPS-to-floor-plan mapping**: Affine transformation from 4 calibration points, bilinear interpolation for coordinate mapping, accuracy estimation and error bounds
- **Walk-through path**: Polyline rendering of GPS path, real-time path updates during capture, coverage heatmap generation, path simplification for performance
- **Offline maps**: Downloading map regions for offline use, tile cache management, automatic region updates

---

### PDF Generation — Basic

**Why Basic:** PDF reports are generated from HTML templates using established libraries. The complexity is in design, not in the PDF engine itself.

**Specific Competencies:**
- **HTML-to-PDF**: Using expo-print and react-native-html-to-pdf for on-device generation, HTML/CSS template design for professional report layouts
- **Server-side PDF**: Supabase Edge Functions with Puppeteer or equivalent for server-generated PDFs (higher quality, consistent rendering)
- **Template design**: Professional construction report layouts, photo grid placement, chart embedding, company branding integration, page break management
- **File handling**: PDF file size optimization (image compression within PDF), sharing via system share sheet, email attachment via SendGrid, file naming conventions

---

## Domain Skills

### Construction Project Management Basics — Required

Understanding how construction projects are organized, scheduled, and managed is essential for building a tool that construction professionals will actually use.

**Specific Knowledge:**

**Project Phases:**
- **Pre-construction**: Permits, design, bidding, subcontractor selection
- **Site preparation**: Demolition, excavation, grading, utilities
- **Foundation**: Footings, foundation walls, slab-on-grade, waterproofing
- **Structure**: Steel/wood framing, floor systems, roof structure
- **Building envelope**: Sheathing, weather barrier, windows, roofing
- **Rough-in (MEP)**: Mechanical, electrical, plumbing rough-in before walls close
- **Insulation and drywall**: Thermal envelope, vapor barriers, drywall hanging and finishing
- **Finish**: Painting, flooring, cabinetry, fixtures, trim
- **Site work and landscaping**: Parking, sidewalks, landscaping, final grading
- **Punch list and close-out**: Final inspection, certificate of occupancy, warranty

**Scheduling:**
- Critical Path Method (CPM) scheduling
- Gantt charts and milestone tracking
- Float and slack calculations
- Look-ahead schedules (2-week, 4-week)
- Schedule of values for progress billing
- Weather day tracking and schedule extensions

**Project Roles:**
- **General Contractor (GC)**: Overall project responsibility
- **Project Manager (PM)**: Schedule, budget, client communication
- **Superintendent**: On-site operations management
- **Foreman**: Crew-level management, daily work direction
- **Subcontractors**: Trade-specific work (electrical, plumbing, HVAC, etc.)
- **Owner's Rep**: Client-side project oversight
- **Architect**: Design oversight and field observations

**Documentation Standards:**
- Daily reports (what SiteSync automates)
- RFIs (Requests for Information)
- Submittals and shop drawings
- Change orders
- Pay applications (AIA G702/G703)
- Punch lists
- As-built drawings

---

### OSHA Safety Standards — Required

SiteSync's safety detection feature must reference real OSHA standards to be credible and useful.

**Top 10 Most Cited OSHA Violations (Construction):**

| Rank | Standard | Title | What to Detect |
|------|----------|-------|----------------|
| 1 | 1926.501 | Fall Protection | Workers on surfaces 6+ feet without guardrails, nets, or harnesses |
| 2 | 1910.1200 | Hazard Communication | Missing chemical labels, no SDS available |
| 3 | 1926.451 | Scaffolding | Incomplete scaffolds, missing guardrails, no access ladders |
| 4 | 1926.1053 | Ladders | Wrong angle, no tie-off, damaged rungs, insufficient extension |
| 5 | 1926.503 | Fall Protection Training | Not photo-detectable (documentation requirement) |
| 6 | 1926.102 | Eye/Face Protection | Grinding/cutting without safety glasses, welding without shield |
| 7 | 1910.134 | Respiratory Protection | Dusty conditions without masks, concrete cutting without respirator |
| 8 | 1910.147 | Lockout/Tagout | Energized equipment without lockout procedures |
| 9 | 1910.178 | Powered Industrial Trucks | Forklift safety violations, unattended raised forks |
| 10 | 1910.132 | PPE General | Missing hard hats, no safety vests, improper footwear |

**Additional Standards for Photo Detection:**
- 1926.20(b) — Housekeeping (debris, trip hazards)
- 1926.250 — Material storage and handling (unstable stacking)
- 1926.405 — Electrical safety (exposed wiring, damaged cords)
- 1926.651 — Excavation (unshored trenches, no egress)
- 1926.602 — Material handling equipment (crane safety)

**Knowledge Requirements:**
- Understanding when each standard applies (e.g., fall protection kicks in at 6 feet)
- Corrective action requirements for each violation type
- Severity classification criteria
- Documentation requirements for safety programs
- OSHA inspection process and penalties

---

### Construction Documentation Requirements — Important

Understanding what construction professionals need to document and why ensures SiteSync generates reports that are actually useful.

**Daily Report Requirements (Industry Standard):**
- Weather conditions (temperature, precipitation, wind)
- Manpower on site (by trade/subcontractor)
- Work performed today (by area/trade)
- Materials received
- Equipment on site
- Visitors and inspections
- Safety observations
- Issues, delays, and impacts
- Photos with descriptions

**AIA Document Standards:**
- A201: General Conditions of the Contract (documentation requirements)
- G702/G703: Application and Certificate for Payment (progress tracking)
- G704: Certificate of Substantial Completion
- Understanding how SiteSync reports feed into these formal documents

**Building Inspection Processes:**
- Foundation inspection before backfill
- Framing inspection before covering
- Rough-in inspections (plumbing, electrical, mechanical) before insulation
- Insulation inspection before drywall
- Final inspection for certificate of occupancy
- Understanding what inspectors look for at each stage

---

## Design Skills

### Field-Worker UX — Critical

Designing for construction field workers is fundamentally different from designing for office knowledge workers. Everything must work with work gloves, in bright sunlight, with one hand, in 30-second interactions.

**Specific Competencies:**
- **Large touch targets**: Minimum 48x48dp, preferably 56x56dp for primary actions (capture button, navigation tabs)
- **High contrast**: Text and icons must be readable in direct sunlight; avoid subtle grays; use Construction Yellow on dark backgrounds
- **One-handed operation**: All primary actions reachable with thumb; swipe gestures for common actions; no two-hand interactions required
- **Minimal text input**: Voice-to-text for notes, picker wheels for selections, smart defaults for everything; construction workers should never type paragraphs
- **Fast interactions**: Capture-to-done in under 3 seconds; no loading screens between captures; instant feedback (haptic, visual) on every tap
- **Glove-friendly**: Capacitive glove compatibility guidance in onboarding; large button spacing; no precision taps or long-press-only actions
- **Error tolerance**: Undo for accidental deletions; confirm for destructive actions; never lose captured photos due to app crashes
- **Progressive disclosure**: Show essential info first (photo, location, time); reveal details (AI analysis, safety findings) on tap; do not overwhelm the field view

---

### Photo-Centric Interface Design — Important

SiteSync is fundamentally a photo application. The interface must make photos the primary content with supporting metadata and AI analysis as secondary.

**Specific Competencies:**
- Photo grid layouts that scale from 3-column (phone) to 5-column (tablet)
- Full-screen photo viewer with smooth pinch-to-zoom
- Photo comparison layouts (side-by-side, slider overlay)
- Photo annotation overlays (safety violation highlights)
- Efficient thumbnail loading and caching for large galleries
- Photo capture UI with minimal chrome (maximize viewfinder)
- Photo metadata display without obscuring the image

---

### Report and Document Design — Important

SiteSync generates professional PDF reports that represent the user's company. The report design must be polished enough that a foreman is proud to send it to a project owner.

**Specific Competencies:**
- Professional document layout (headers, sections, page numbers, footers)
- Photo grid placement within document flow
- Chart and graph embedding (timeline charts, progress bars)
- Company branding integration (logo, colors, fonts)
- Multi-page PDF design with proper page breaks
- Table design for data-dense sections (schedule comparison, safety findings)
- Print-friendly design (appropriate margins, font sizes, contrast)

---

### Professional PDF Layouts — Important

**Specific Competencies:**
- Construction-industry-standard report formatting
- AIA-style document headers and numbering
- Photo captioning and cross-referencing
- Executive summary formatting for owner-facing reports
- Safety report formatting with OSHA standard references
- Timeline/Gantt chart rendering for schedule sections
- Mobile-generated PDF quality matching desktop-generated standards

---

## Business Skills

### Construction Trade Show Marketing — Important

Construction professionals buy tools they see demonstrated at trade shows, not tools they find through Google ads. Trade show presence is the primary customer acquisition channel.

**Key Trade Shows:**

| Show | Timing | Audience | Estimated Attendees |
|------|--------|----------|-------------------|
| **World of Concrete** | January, Las Vegas | Commercial contractors, concrete professionals | 60,000+ |
| **NAHB International Builders' Show (IBS)** | February, Various | Residential builders, remodelers | 75,000+ |
| **CONEXPO-CON/AGG** | March (triennial), Las Vegas | Heavy construction, infrastructure | 130,000+ |
| **Greenbuild** | November, Various | Green building, sustainability | 25,000+ |
| **ENR FutureTech** | Various | Construction technology | 2,000+ |
| **Regional AGC events** | Throughout year | General contractors by region | 500-2,000 |

**Trade Show Strategy:**
- Live demo on actual job site photos (bring photos from a real project)
- "Before and after" comparison: show the 2-hour manual process vs. 5-minute SiteSync process
- Hardware: just hold up a phone -- "This is all you need"
- Collect phone numbers, not emails (construction professionals check email infrequently)
- Follow up with SMS, not email campaigns
- Estimated cost: $5K-15K per show (booth, travel, materials)
- Expected leads: 200-500 qualified contacts per major show

---

### Direct GC Outreach — Important

General contractors with 10-200 employees are SiteSync's sweet spot. Direct outreach to PMs and superintendents is the second most effective acquisition channel.

**Outreach Strategy:**
- **LinkedIn**: Connect with construction PMs, superintendents, and safety managers; share before/after report examples; join construction LinkedIn groups
- **Local AGC chapters**: Attend monthly meetings, sponsor events, present at education sessions
- **Construction job site visits**: Cold-visit active job sites with a demo on your phone (construction professionals respect showing up)
- **Referral program**: Offer free months for referrals (construction is a relationship-driven industry, word-of-mouth is dominant)
- **Partner with construction attorneys**: They see documentation failures daily and can recommend SiteSync to clients
- **Target pain points**: Lead with "save 2 hours/day" and "catch safety violations before OSHA does"

---

### Construction Material Supplier Partnerships — Useful

Material suppliers (lumber yards, concrete companies, equipment rental) have existing relationships with every GC in their territory. Channel partnerships with suppliers create warm introduction paths.

**Partnership Types:**
- **Co-marketing**: Supplier includes SiteSync flyer with material deliveries
- **Bundle pricing**: Discounted SiteSync subscription for supplier's top customers
- **Integration**: Material delivery tracking integrated with supplier systems
- **Trade show co-sponsorship**: Share booth costs at regional events
- **Target suppliers**: 84 Lumber, ABC Supply, Ferguson, Sunbelt Rentals, United Rentals

---

### Construction Publication Advertising — Useful

**Target Publications:**
- **Engineering News-Record (ENR)**: Largest construction industry publication, decision-maker readership
- **Construction Executive**: CEO/owner-level audience
- **For Construction Pros**: Field-level professional audience
- **Builder Magazine**: Residential construction focus
- **Construction Dive**: Digital-first, tech-savvy construction audience
- **Regional construction publications**: State and metro-level trade publications

**Ad Strategy:**
- Before/after case studies showing time savings
- Testimonial ads from real foremen (credibility is everything)
- ROI calculators: "$149/month saves $1,980/month in labor"
- Digital ads targeting construction job titles on LinkedIn

---

## Unique and Differentiating Skills

### Construction Scene AI Analysis Prompts — Critical

The quality of SiteSync's AI output depends entirely on how well the system prompts are engineered for construction contexts. This is the most defensible technical moat.

**Specific Competencies:**
- Writing prompts that distinguish between construction phases (foundation vs. framing vs. rough-in vs. drywall vs. finish) with high accuracy
- Encoding construction-specific vocabulary (headers, joists, rafters, studs, sheathing, rough-in, trim-out)
- Handling diverse construction types (wood frame residential, steel commercial, concrete tilt-up, renovation/remodel)
- Progress estimation calibration (what does "40% framing complete" look like vs. "80%"?)
- Multi-photo context: aggregating findings across 30+ photos into coherent area-by-area observations
- Handling photo quality variations (low light, dust, water droplets, wide-angle distortion)
- Seasonal and regional variations (different building methods by climate zone)
- Building type differentiation (single-family, multi-family, commercial, industrial, institutional)

**Prompt Development Process:**
1. Collect 500+ construction site photos across all phases and building types
2. Manually label each photo with phase, progress, materials, and safety observations
3. Iterate prompts against labeled dataset, measuring accuracy
4. Build a prompt version control system to track improvements
5. A/B test prompt versions on real user photos with feedback loops

---

### Geolocation-to-Floor-Plan Mapping Without Specialized Hardware — Critical

Mapping GPS coordinates to specific rooms on a floor plan using only a phone (no 360 cameras, no BLE beacons, no specialized hardware) is a unique technical challenge that defines SiteSync's accessibility advantage.

**Specific Competencies:**
- **4-point calibration algorithm**: Using 4 known GPS-to-floor-plan coordinate pairs to calculate an affine transformation matrix
- **Indoor GPS accuracy handling**: GPS accuracy degrades to 5-15 meters indoors; handling this uncertainty with zone-level (not room-level) precision
- **Multi-floor disambiguation**: Using barometric altitude sensors and floor plan metadata to determine which floor the user is on
- **Compass integration**: Using device magnetometer to determine photo direction, correlated with floor plan orientation
- **Dead reckoning fallback**: When GPS is unavailable indoors, using accelerometer and compass for relative position tracking from last known good GPS fix
- **Zone boundary definition**: UI for defining named zones on floor plans (rooms, areas, wings) with polygon boundaries
- **Accuracy indicators**: Communicating to the user when zone assignment is confident vs. uncertain
- **Calibration quality assessment**: Detecting poor calibrations (non-rectangular buildings, multi-building sites) and guiding recalibration

---

### Safety Violation Detection Against OSHA Standards — Critical

Detecting safety violations from photos requires both AI prompt engineering and deep OSHA knowledge. The AI must identify specific violation types, reference the correct OSHA standard, assess severity, and recommend corrective actions.

**Specific Competencies:**
- Training/prompting AI to detect visual safety indicators (missing guardrails, PPE violations, housekeeping issues, electrical hazards)
- Mapping detected issues to specific OSHA standard numbers with plain-language explanations
- Severity calibration: understanding what constitutes "critical" (immediate life safety) vs. "low" (best practice improvement)
- False positive minimization: understanding when apparent violations are actually compliant (e.g., workers on scaffolds with harnesses that are not visible in the photo)
- Corrective action knowledge: knowing the specific fix for each violation type (e.g., guardrail specifications per 1926.502(b))
- Context-aware detection: understanding that different standards apply to different phases (fall protection requirements change between framing and finish)
- Resolution verification: determining from a follow-up photo whether a corrective action was properly implemented

---

### Professional Construction Report Formatting — Important

SiteSync's reports must look like they were written by an experienced PM, not generated by an AI tool. The formatting, language, and structure must match construction industry norms.

**Specific Competencies:**
- Construction report narrative style (factual, specific, professional, impersonal)
- Area/zone naming conventions that match industry standards
- Progress percentage estimation language (avoid false precision -- "approximately 70-75%" not "73.2%")
- Weather impact reporting style
- Safety observation language (factual, non-accusatory, OSHA-referenced)
- Schedule impact language (construction contract terminology for delays, float, critical path)
- Photo captioning conventions (location, direction, subject, observation)
- Report numbering and dating systems (project number + sequential report number)
- Multi-stakeholder report adaptation (owner-facing vs. internal vs. inspector-facing)

---

## Skill Acquisition Priority

| Priority | Skill | Timeline to Competence |
|----------|-------|----------------------|
| 1 | React Native/Expo (camera + GPS) | 2-3 weeks if experienced RN developer |
| 2 | Construction domain basics | 2-4 weeks of job site visits + study |
| 3 | OpenAI Vision prompting for construction | 3-4 weeks of prompt iteration |
| 4 | OSHA safety standards | 1-2 weeks of study + field validation |
| 5 | Supabase real-time + storage | 1-2 weeks |
| 6 | Field-worker UX design | Ongoing, requires field testing |
| 7 | Mapbox + geolocation mapping | 2-3 weeks |
| 8 | PDF generation | 1 week |
| 9 | B2B construction sales | 3-6 months of relationship building |
| 10 | Trade show marketing | Learn by doing at first show |

---

## Recommended Learning Path

**Week 1-2:** Set up Expo project with camera capture, GPS tracking, and Supabase backend. Get a photo upload pipeline working end-to-end.

**Week 3-4:** Visit 3-5 active construction sites. Walk the site with a foreman. Take 100+ photos. Understand the daily documentation workflow firsthand.

**Week 5-6:** Build OpenAI Vision integration. Iterate on construction analysis prompts using photos from site visits. Measure accuracy against manual labels.

**Week 7-8:** Study OSHA Top 10 standards. Build safety detection prompts. Test against photos with known violations.

**Week 9-10:** Build floor plan upload and GPS calibration. Test mapping accuracy on a real job site.

**Week 11-12:** Build report generation and PDF export. Get feedback from foremen on report quality and format.

**Month 4+:** Begin B2B outreach. Attend first trade show. Start building construction industry relationships.
