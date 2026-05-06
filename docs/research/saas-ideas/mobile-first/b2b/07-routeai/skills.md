# RouteAI — Skills Required

## Technical Skills

### React Native + Expo — Advanced

**Why Advanced:** RouteAI involves building and maintaining two distinct applications (dispatcher and technician) from a shared monorepo. This requires deep understanding of Expo's managed workflow, code sharing patterns, platform-specific behavior, and performance optimization for map-heavy, real-time interfaces.

**What You Need to Know:**

- **Monorepo architecture:** Configuring an Expo monorepo with shared packages (`packages/shared`, `packages/optimization`, `packages/ai`) that both apps import from. Turborepo or Nx for build orchestration. Shared TypeScript types, utilities, hooks, and Supabase client.
- **Expo Router:** File-based routing for both apps with different navigation structures (sidebar + tabs for dispatcher, bottom tabs for technician). Deep linking for push notification handling (tap notification, open specific job).
- **Expo Location:** Background location tracking on iOS and Android for technician GPS. Requires understanding of iOS background modes, Android foreground services, battery optimization, and permission flows. Location updates every 15-30 seconds while the app is in the background.
- **Expo Notifications:** Push notifications for route changes and new job assignments. Handling notification tokens, notification categories (actionable notifications), and notification handling when the app is in foreground vs. background vs. killed.
- **EAS Build + Updates:** Over-the-air updates for both apps. Understanding of update channels, runtime versions, and rolling out critical fixes to technicians in the field without app store review.
- **react-native-maps:** Google Maps integration with custom markers, polyline routes, clustering for fleet view, marker animations (technician movement), custom map styles, and performance with 50+ markers and multiple route polylines.
- **Performance optimization:** Virtualized lists for large job lists, memoization for map markers, efficient re-rendering when real-time updates arrive, image optimization for job photos.
- **Platform-specific code:** Handling differences between iOS and Android for location permissions, map rendering, navigation to external maps (Google Maps vs. Apple Maps intent), and notification behavior.
- **Gesture handling:** `react-native-gesture-handler` and `react-native-reanimated` for the drag-and-drop schedule board in the dispatcher app. Smooth drag of job cards between technician columns, snapping to time slots, and animated reordering.
- **Offline support:** Caching job details locally using `expo-sqlite` or `@react-native-async-storage/async-storage`, queueing status updates when offline, conflict resolution when reconnecting.

**Key Libraries:**
```
react-native-maps          — Map rendering
react-native-reanimated    — Animations and drag-drop
react-native-gesture-handler — Touch interactions
@gorhom/bottom-sheet       — Bottom sheets (technician app)
expo-location              — GPS tracking
expo-notifications         — Push notifications
expo-router                — Navigation
expo-image                 — Optimized image loading
expo-sqlite                — Local caching
zustand                    — State management
react-native-mmkv          — Fast key-value storage
```

---

### TypeScript — Advanced

**Why Advanced:** Type safety across two apps and multiple shared packages is critical. Complex types for job scheduling constraints, route optimization inputs/outputs, and real-time event payloads require advanced TypeScript patterns.

**What You Need to Know:**

- **Discriminated unions** for job status transitions: `type JobStatus = 'unscheduled' | 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'`
- **Generic types** for Supabase query builders and real-time event handlers
- **Branded types** for IDs to prevent mixing `TechnicianId` with `JobId` at the type level
- **Zod schemas** for runtime validation of AI-parsed job intake data (OpenAI returns JSON that must be validated)
- **Strict null checking** throughout — GPS coordinates, customer phone numbers, and time windows can all be null
- **Type generation** from Supabase schema using `supabase gen types` for database query type safety
- **API response typing** for Google Maps Distance Matrix, Directions, and Geocoding responses
- **Complex constraint types** for the optimization engine:

```typescript
interface OptimizationConstraint {
    type: 'skill_match' | 'time_window' | 'priority' | 'dependency' | 'capacity';
    hard: boolean; // Hard constraints cannot be violated; soft constraints are preferences
    weight: number; // For soft constraints, higher weight = more important
    parameters: SkillConstraint | TimeWindowConstraint | PriorityConstraint | DependencyConstraint;
}

interface ScheduleAssignment {
    technicianId: TechnicianId;
    jobs: Array<{
        jobId: JobId;
        order: number;
        scheduledStart: Date;
        scheduledEnd: Date;
        travelTimeFromPrevious: number; // minutes
    }>;
    totalDriveTime: number;
    totalJobTime: number;
    utilizationRate: number;
}
```

---

### Supabase Real-Time — Intermediate

**Why Intermediate:** Real-time subscriptions are the backbone of dispatcher-technician synchronization. You need to understand channel management, subscription filtering, presence, and handling connection drops gracefully.

**What You Need to Know:**

- **Postgres Changes subscriptions:** Listening for INSERT, UPDATE, DELETE on specific tables filtered by `company_id` or `technician_id`. Understanding the difference between `old` and `new` payloads.
- **Broadcast channels:** For technician location broadcasting. Technicians publish their GPS coordinates to a channel that the dispatcher subscribes to. Understanding the difference between Postgres Changes (persisted) and Broadcast (ephemeral).
- **Presence:** Tracking which technicians are online/active. Presence sync and leave events.
- **Row-Level Security:** Multi-tenant RLS policies so companies can only see their own data. Technicians can only see their assigned jobs. Dispatchers can see all company data.
- **Edge Functions:** Deno-based serverless functions for optimization, AI parsing, and notification dispatch. Understanding cold start behavior and keeping functions warm.
- **Connection management:** Handling reconnection after network drops (common for technicians in the field). Queuing real-time events during disconnection and replaying on reconnect.
- **Database functions:** PostgreSQL functions for complex queries like "find the nearest available technician with matching skills."

**Critical Real-Time Flows:**
1. Dispatcher schedules a job → Postgres Change fires → Technician app receives job in real-time
2. Technician updates job status → Postgres Change fires → Dispatcher dashboard updates
3. Technician broadcasts location → Broadcast channel → Dispatcher fleet map updates markers
4. Optimization runs → Multiple job updates → All affected technicians receive updated routes

---

### Google Maps Platform — Intermediate

**Why Intermediate:** Maps are central to both apps, but most interactions use well-documented APIs. The complexity is in managing API costs, building distance matrices efficiently, and creating performant map UIs with many markers and route polylines.

**What You Need to Know:**

- **Directions API:** Calculating routes between job locations with waypoints. Requesting routes with real-time traffic data. Parsing polyline-encoded route geometry for map display. Understanding the difference between `duration` and `duration_in_traffic`.
- **Distance Matrix API:** Building NxN travel time matrices for the VRP solver. Batching requests (max 25 origins or 25 destinations per request). Caching results to minimize API costs. Understanding that traffic data adds significant cost.
- **Geocoding API:** Converting customer addresses to lat/lng coordinates. Handling ambiguous addresses (showing candidates to the user). Reverse geocoding for technician location-to-address.
- **Places API (Autocomplete):** Address autocomplete in job creation forms. Biasing results to the company's service area. Parsing place details for structured address components.
- **Maps SDK (JavaScript + React Native):** Custom map styling to match the "Smart Dispatch" theme. Custom markers with technician photos/initials. Polyline rendering for routes (multiple routes on one map, color-coded). Map clustering when many job markers overlap. Performance optimization with many markers (50+ technicians, 200+ jobs).
- **Cost management:** Understanding per-request pricing, implementing caching layers, using the Routes API (newer, potentially cheaper at scale) vs. Directions API, and monitoring usage dashboards.

**Alternatives to Know About:**
- **Mapbox:** Potentially cheaper at high volume, better map customization, but less accurate traffic data
- **HERE:** Strong routing APIs, competitive pricing, worth evaluating for European expansion
- **OSRM (Open Source):** Free routing engine, no traffic data, useful for development/testing to avoid API costs

---

### OpenAI API — Intermediate

**Why Intermediate:** Two focused use cases (job parsing and schedule optimization) rather than a broad AI integration. The complexity is in prompt engineering, structured output parsing, and handling edge cases reliably.

**What You Need to Know:**

- **Structured Outputs:** Using JSON mode and function calling to get reliable structured data from the LLM. Defining response schemas with Zod for validation. Handling cases where the LLM returns unexpected formats.
- **Prompt engineering for job intake:** Building prompts that reliably extract job type, priority, skills, duration estimates, time windows, and addresses from diverse customer communication styles. Handling abbreviations, slang, and incomplete information.
- **Prompt engineering for scheduling:** Crafting prompts that reason about multi-variable constraints (technician skills, locations, time windows, priorities, workload balance). Including company-specific context (service types, skill taxonomy, business rules).
- **Model selection:** GPT-4o-mini for fast, cheap job parsing. GPT-4o for complex schedule optimization reasoning. Understanding token costs and latency tradeoffs.
- **Error handling:** Rate limiting, timeout handling, fallback behavior when the API is down (manual job entry, manual scheduling).
- **Evaluation:** Building test sets of customer messages to measure parsing accuracy. A/B testing different prompts. Tracking which AI suggestions dispatchers accept vs. override.
- **Token optimization:** Keeping prompts concise, using system messages efficiently, caching common context, and batching requests where possible.

---

### Google OR-Tools — Basic to Intermediate

**Why Basic to Intermediate:** OR-Tools is a specialized library. You need enough understanding to formulate the Vehicle Routing Problem correctly and interpret results, but the library handles the actual solving.

**What You Need to Know:**

- **Vehicle Routing Problem (VRP):** Understanding the mathematical formulation. Vehicles = technicians, nodes = job locations, depot = technician start location, edges = travel times from the distance matrix.
- **VRP with Time Windows (VRPTW):** Adding time window constraints (customer availability) to the base VRP. Understanding feasibility — sometimes not all jobs can be scheduled within their time windows.
- **Capacity constraints:** Limiting the number of jobs per technician per day based on shift hours.
- **OR-Tools Node.js bindings:** Setting up the library in a Node.js/Deno environment (Supabase Edge Functions). Understanding the manager, routing model, and dimension concepts.
- **Search strategies:** First solution strategies (PATH_CHEAPEST_ARC, SAVINGS) and local search metaheuristics (GUIDED_LOCAL_SEARCH, SIMULATED_ANNEALING). Understanding the tradeoff between solve time and solution quality.
- **Time limits:** Setting appropriate solve time limits (5-15 seconds) to balance quality with responsiveness.
- **Interpreting results:** Extracting the solution (route order per vehicle, arrival times, wait times) and translating back to job assignments.
- **Partial re-optimization:** Fixing completed/in-progress jobs and only re-optimizing remaining jobs for real-time re-routing.

**Learning Path:**
1. Start with OR-Tools VRP tutorial (Python examples, translate to Node.js)
2. Implement basic VRP with distance matrix
3. Add time window constraints
4. Add capacity constraints (shift hours)
5. Implement partial re-optimization (fix some nodes)
6. Benchmark solve times with realistic data sizes (20 techs, 80 jobs)

---

### Twilio — Basic

**Why Basic:** Straightforward SMS sending with template rendering. The main work is in building the notification triggers, not the SMS integration itself.

**What You Need to Know:**

- **Programmable SMS:** Sending SMS via the REST API. Template-based messages with variable substitution. Handling delivery status callbacks (sent, delivered, failed).
- **Phone number setup:** Provisioning a Twilio phone number for each company (or using a shared number with company identification). Understanding toll-free vs. local numbers and A2P 10DLC registration for US SMS.
- **Two-way SMS:** Receiving customer replies (CONFIRM, STOP, reschedule requests). Setting up webhooks for incoming messages. Routing replies to the correct job/customer.
- **Rate limiting:** Understanding Twilio's sending rate limits and queuing messages appropriately during bulk notification events (morning route confirmations to all customers).
- **Cost awareness:** $0.0079 per SMS segment. Long messages (>160 chars) split into multiple segments. URL shortening to reduce message length. Estimating monthly SMS costs per company.

---

## Domain Skills

### Field Service Management Operations

**What You Need to Understand:**

- **Dispatch workflows:** How a dispatch center operates from morning planning through end of day. The role of the dispatcher as the coordinator between customers, technicians, and company management. Common pain points: phone-based job intake, manual route planning, reactive (not proactive) scheduling.
- **Scheduling and SLAs:** Service Level Agreements that define response times (emergency: 2 hours, standard: same day, maintenance: within a week). How SLAs drive scheduling priority. The concept of "fill rate" — what percentage of available technician hours are booked with revenue-generating work.
- **Job lifecycle:** From customer request through scheduling, dispatch, travel, arrival, work, completion, and invoicing. Status tracking at each stage. Common interruptions: customer not home, parts not available, job more complex than expected, emergency preemption.
- **Fleet management:** Tracking vehicle locations, managing vehicle maintenance schedules, fuel tracking, mileage reporting. Understanding that the vehicle is a mobile warehouse of parts and tools.
- **Aftermarket service economics:** The service department is often the most profitable division of an HVAC/plumbing company (50-60% gross margins vs. 20-30% for new installations). Maximizing service jobs per day directly impacts company profitability.

### Home Services Industry

**What You Need to Understand:**

- **HVAC workflows:** Installation (4-8 hours, requires EPA certification for refrigerant), repair (1-3 hours, diagnostic + fix), maintenance/tune-up (45-90 minutes, seasonal), inspection (30-60 minutes). Seasonal patterns: AC in summer, heating in winter. Peak demand causes scheduling crunches.
- **Plumbing workflows:** Emergency repairs (leaks, burst pipes — must respond within hours), scheduled repairs (1-3 hours), installations (water heaters, fixtures — 2-6 hours), drain cleaning (30-90 minutes). Less seasonal than HVAC but more emergency-driven.
- **Electrical workflows:** Panel upgrades (4-8 hours, licensed electrician required), outlet/switch work (30-60 minutes), troubleshooting (1-3 hours), inspections (1-2 hours). Strict licensing requirements vary by state.
- **Pest control workflows:** Initial treatment (1-2 hours), follow-up treatments (30-60 minutes), inspections (30 minutes), recurring service (monthly/quarterly). Route-dense: many short stops per day.
- **Cleaning workflows:** Residential cleaning (2-4 hours), commercial cleaning (varies), move-in/move-out deep clean (4-8 hours). High route density, predictable durations, recurring schedules.
- **Industry terminology:** Service call, callback, warranty work, flat-rate pricing, demand service, maintenance agreement, equipment changeout.
- **Technician certifications:** EPA 608 (refrigerant handling), NATE (HVAC), journeyman/master licenses (plumbing, electrical), state-specific requirements.

### Route Optimization Theory

**What You Need to Understand:**

- **Vehicle Routing Problem (VRP):** The generalization of the Traveling Salesman Problem (TSP) to multiple vehicles. NP-hard, meaning optimal solutions are computationally infeasible for large instances. Solved using heuristics and metaheuristics.
- **VRP variants relevant to home services:**
  - VRPTW (with Time Windows): customers are only available during specific hours
  - HFVRP (Heterogeneous Fleet): technicians have different skills/capabilities
  - DVRP (Dynamic VRP): new jobs appear during the day, requiring re-optimization
  - VRPPD (Pickup and Delivery): technicians may need to pick up parts from a warehouse
- **Constraint satisfaction:** Understanding hard constraints (must be satisfied) vs. soft constraints (preferences to optimize). The concept of feasibility — not all constraint combinations may have a valid solution.
- **Objective functions:** What to optimize: minimize total drive time, minimize total distance, maximize jobs per technician, minimize latest arrival, balance workload. Often multi-objective.
- **Real-time re-optimization:** The challenge of re-optimizing mid-day without causing excessive disruption. Minimizing the number of changes while still improving efficiency.
- **Traffic modeling:** Using historical and real-time traffic data to estimate travel times. Time-dependent travel times (morning rush hour vs. midday). The impact of traffic on route optimization (optimal route at 8 AM may differ from optimal route at 2 PM).

### Customer Appointment Management

**What You Need to Understand:**

- **Appointment window narrowing:** The industry standard is 4-hour windows ("between 8 AM and 12 PM"). Route optimization enables 30-60 minute windows. This is a major customer satisfaction driver and competitive differentiator.
- **ETA communication:** Customers expect real-time updates. The technician "on the way" notification with ETA is the highest-impact customer communication. Accuracy matters — an ETA that is 30 minutes off is worse than no ETA.
- **No-show management:** 5-10% of appointments result in a customer not being home. Detection (technician marks "customer not home"), rebooking, and filling the now-empty time slot.
- **Customer satisfaction measurement:** Post-service SMS survey (1-5 rating). Net Promoter Score. Correlation between on-time arrival and satisfaction score. Using satisfaction data to improve scheduling (e.g., chronically late technicians get more buffer time).

---

## Design Skills

### Map-Heavy UX

**What You Need to Know:**

- **Map performance:** Handling 50+ markers with smooth pan/zoom. Marker clustering to prevent overlap. Lazy loading of route polylines (only render visible routes). GPU-accelerated animations for technician movement.
- **Map interaction patterns:** Tap marker for popup, long press for context menu, pinch to zoom, swipe to pan. Preventing accidental taps on overlapping elements. Map vs. list toggle for different user preferences.
- **Map styling:** Custom Google Maps styles that match the brand. Desaturated base map to let data layers stand out. High contrast between route colors. Accessible color palette that works for colorblind users.
- **Status visualization on maps:** Communicating technician status, job status, route progress, and delays through map markers without creating visual clutter. Progressive disclosure: overview at zoom-out, detail at zoom-in.

### Dispatcher Dashboard Design (Data-Dense)

**What You Need to Know:**

- **Information density:** Dispatchers monitor 10-50 technicians and 50-200 jobs simultaneously. Every pixel matters. Design for scanning, not reading. Use spatial layout to convey meaning (position on map = location, position on timeline = time, color = status).
- **Dashboard layout patterns:** KPI cards at top, map/primary visual in center, detail tables below. Sidebar navigation always visible. Alert panel always accessible. No unnecessary whitespace.
- **Table design:** Sortable, filterable tables with compact row heights (40-48px). Status-coded cells. Quick actions on hover/click. Inline editing for common changes. Pagination for large datasets.
- **Schedule board design:** Gantt-chart-like interface with time on Y-axis and technicians on X-axis. Drag-drop job assignment. Visual indication of conflicts, gaps, and overloads. Zooming between day/half-day/hour views.
- **Real-time update patterns:** How to show that data has changed without being disruptive. Subtle highlight on changed values. Animation for new items. Toast notifications for important changes. Avoid full-page refreshes.

### Technician App UX (Glanceable While Driving)

**What You Need to Know:**

- **Large touch targets:** Minimum 44px (iOS) to 48px (Material). Primary actions (Navigate, Start Job, Complete) should be 52-56px. Technicians wear work gloves. Thumbs are the primary input method while driving (phone in a mount).
- **Glanceable information:** The most important information (next job, ETA, address) must be visible without scrolling and readable at arm's length (phone mounted on dashboard). Minimum 16px text for any information the technician needs while driving.
- **Minimal interaction depth:** From unlocking the phone to navigating to the next job should be 1-2 taps maximum. Ideally: open app, tap "Navigate." No menus, no scrolling, no typing.
- **Audio and haptic feedback:** Confirmation sounds for job completion. Haptic feedback on button taps. Audio alerts for route changes (distinct sound that is audible over road noise and HVAC equipment noise).
- **One-handed operation:** All primary actions reachable with one thumb (right hand) on a mounted phone. Bottom-sheet patterns instead of top navigation. Floating action buttons in thumb-reach zone.
- **Dark mode priority:** Many technicians work in dark attics, crawl spaces, and basements. Dark mode reduces screen glare. Also reduces battery consumption (OLED screens).

### Real-Time Status Interfaces

**What You Need to Know:**

- **Optimistic updates:** When a technician taps "Complete Job," update the UI immediately (green checkmark) before the server confirms. If the server rejects, roll back with an error message. Users should never wait for a spinner on critical actions.
- **Stale data indicators:** Show when data was last updated. "Updated 30 seconds ago." If the connection drops, show "Offline — last sync 5 min ago" in a yellow banner. Never show stale data as if it were current.
- **Transition animations:** Smooth transitions between job statuses. Job card slides from "upcoming" to "current" section. Completed jobs fade to gray and slide down. New jobs animate in from the top.
- **Conflict resolution:** Two dispatchers editing the same job simultaneously. Last-write-wins with a "This job was updated by another user" notification. Supabase real-time handles the sync.

---

## Business Skills

### Direct Outreach to HVAC/Plumbing Companies

**What You Need to Know:**

- **Identifying prospects:** Home service companies with 5-50 technicians, $500K-5M revenue. Finding them via Google Maps (search "HVAC companies near me"), Yelp, Angi, HomeAdvisor, state licensing databases, and trade association member directories.
- **LinkedIn outreach:** Connecting with company owners, operations managers, and dispatch managers. Personalized messages referencing their company size, service area, and current dispatch challenges. Not selling software — selling "2 more jobs per tech per day."
- **Cold email sequences:** 3-5 email sequence targeting owners. Subject lines that reference the ROI ("How [Company] could fit 3 more jobs into tomorrow's schedule"). Including a concrete savings calculator: "With 15 technicians at $75/hr, saving 1.5 hours per tech per day = $1,125/day in recovered revenue."
- **Discovery calls:** Understanding the prospect's current dispatch workflow (whiteboard? Google Calendar? ServiceTitan?). Quantifying their pain (how many hours does your dispatcher spend planning routes? How wide are your appointment windows?). Positioning RouteAI as the solution to their specific pain.
- **Demo structure:** Show the AI route optimization with their actual service area and job types. Before/after drive time comparison. Customer SMS notification flow. Technician app walkthrough. ROI calculator with their numbers.

### Trade Publication Advertising

**What You Need to Know:**

- **Key publications:** ACHR News (HVAC trade), Plumbing & Mechanical Magazine, Pest Management Professional, Cleaning & Maintenance Management, Contracting Business. Mix of print, digital, and newsletter advertising.
- **Trade show presence:** AHR Expo (HVAC industry, 60K+ attendees), PHCC Connect (plumbing), National Pest Management Association PestWorld. Booth presence for demos, speaking slots for thought leadership, sponsored sessions.
- **Content marketing for trades:** Case studies showing ROI ("ABC Plumbing increased jobs per tech by 22% in 3 months"). Guest articles in trade publications. Webinars on "modern dispatch operations." YouTube videos showing the product in action with real technicians.
- **Advertising budget allocation:** Trade publication ads: $2K-5K/month. Trade show booth: $10K-25K per event. Digital advertising (Google Ads targeting "dispatch software," "route optimization for HVAC"): $3K-8K/month. LinkedIn Ads targeting operations managers at home service companies: $2K-5K/month.

### Equipment Distributor Partnerships

**What You Need to Know:**

- **The distribution channel:** HVAC equipment is sold through distributors (Carrier Enterprise, Lennox distributors, Trane Supply). These distributors have direct relationships with every HVAC company in their territory. A partnership with distributors gives RouteAI access to their customer base.
- **Partnership model:** Distributor recommends RouteAI to their contractor customers. RouteAI provides a co-branded version or integration. Distributor earns referral fee ($100-200 per converted customer) or revenue share (10-15% of subscription).
- **Value to distributors:** Helping their contractors be more efficient means they can serve more customers and sell more equipment. It is a value-add that differentiates the distributor from competitors.
- **Key distributors:** Carrier Enterprise (1,000+ locations), Lennox International distribution network, Trane Supply, Watsco (largest HVAC distributor in the US), Ferguson (plumbing + HVAC).

### Referral Incentives

**What You Need to Know:**

- **Referral program structure:** Existing customers refer other home service companies. Referrer receives $100 credit per signed customer. Referred company gets 1 month free trial extension. Double-sided incentive increases conversion.
- **Referral tracking:** Unique referral codes per customer. Track referral source through signup flow. Dashboard for customers to see their referral status and credits.
- **Network effects in trades:** HVAC/plumbing company owners know each other. They attend the same trade events, use the same distributors, and are in the same local business groups. One happy customer can generate 3-5 referrals within their network.
- **Case study incentives:** Offer 3 months free in exchange for a detailed case study with named company, metrics, and testimonial. Case studies are the most effective sales tool for B2B home services software.

### Local SEO

**What You Need to Know:**

- **Target keywords:** "route optimization for HVAC," "field service dispatch software," "technician scheduling app," "plumbing dispatch system," "home service route planning." Long-tail: "how to reduce drive time for HVAC technicians," "best dispatch software for small plumbing company."
- **Content strategy:** Blog posts targeting each keyword cluster. Comparison pages (RouteAI vs. ServiceTitan, RouteAI vs. Jobber). Industry-specific landing pages (RouteAI for HVAC, RouteAI for Plumbing). ROI calculators that rank for "HVAC route optimization calculator."
- **SEO technical requirements:** Fast-loading landing pages (Core Web Vitals), mobile-optimized (most trade owners search on mobile), schema markup for software product, customer review integration.

---

## Unique / Specialized Skills

### Constraint-Based Scheduling AI

This is the core technical differentiator. Combining LLM reasoning with mathematical optimization to handle the unique constraints of home service scheduling.

**What Makes This Unique:**

Traditional route optimization tools (Route4Me, OptimoRoute) solve the vehicle routing problem purely mathematically. They optimize for distance or time but cannot reason about soft constraints like:

- "This customer prefers Mike because he installed their system"
- "This technician is new — don't schedule more than 4 jobs"
- "This job might need a second visit — leave buffer in the afternoon"
- "The customer said 'afternoon' on the phone — that means 12-5 PM"

RouteAI uses the LLM to handle these soft constraints and assign jobs to technicians, then uses OR-Tools to optimize the route ordering mathematically. This two-stage approach combines the strengths of both.

**Skills Required:**
- Prompt engineering for multi-variable constraint reasoning
- Understanding when to use LLM reasoning vs. mathematical optimization
- Building reliable pipelines that chain AI output into optimization input
- Evaluating AI assignment quality (acceptance rate by dispatchers)
- Handling edge cases where AI makes poor assignments (graceful fallback to manual)

### Real-Time Re-Routing Algorithms

**What Makes This Unique:**

Most route optimization tools run once in the morning and produce a static plan. RouteAI re-optimizes continuously throughout the day as conditions change. This requires:

- Detecting when re-optimization is warranted (minor delay vs. major disruption)
- Running partial VRP solves that only affect impacted technicians
- Minimizing disruption to the existing plan (don't rearrange 10 routes because one job ran 20 minutes long)
- Propagating changes to all stakeholders (dispatcher, affected technicians, affected customers) within 60 seconds
- Maintaining optimization history for analytics (what changed, why, what was the impact)

**Skills Required:**
- Event-driven architecture for trigger detection
- Partial constraint re-formulation (fixing completed nodes, re-solving remaining)
- Disruption scoring algorithms (how much does this change impact the fleet?)
- Real-time system design (latency requirements, event ordering, consistency)

### Multi-App Synchronization

**What Makes This Unique:**

RouteAI is not one app — it is two apps that must stay perfectly synchronized in real-time. A dispatcher drags a job from one technician to another, and within seconds, both technicians' apps update. One technician's phone loses connectivity in a basement, and the system handles the reconnection gracefully.

**Skills Required:**
- Supabase real-time channel architecture (per-company, per-technician, broadcast)
- Optimistic UI updates with server reconciliation
- Conflict resolution strategies (two dispatchers editing the same schedule)
- Offline queue management (technician loses connectivity, queues status updates)
- State synchronization patterns (ensuring both apps have a consistent view of the schedule)
- Background sync strategies (push notifications to wake the app for critical updates)

### Google OR-Tools Integration for VRP

**What Makes This Unique:**

Integrating a C++ optimization library (OR-Tools) into a JavaScript/TypeScript serverless environment requires careful architecture:

**Skills Required:**
- OR-Tools WASM compilation or Node.js native bindings
- VRP model formulation with custom constraints
- Performance profiling and time-budget management (must solve within 10-15 seconds)
- Translation layer between business domain (jobs, technicians, skills) and OR-Tools domain (nodes, vehicles, dimensions)
- Solution quality evaluation (is the OR-Tools result actually better than the current plan?)
- Fallback strategies when OR-Tools cannot find a feasible solution (relax constraints, alert dispatcher)

---

## Skills Summary Matrix

| Skill | Level | Learning Time | Priority |
|-------|-------|---------------|----------|
| React Native + Expo | Advanced | 3-6 months | Critical |
| TypeScript | Advanced | 2-4 months | Critical |
| Supabase Real-Time | Intermediate | 2-4 weeks | Critical |
| Google Maps Platform | Intermediate | 2-4 weeks | Critical |
| OpenAI API | Intermediate | 1-2 weeks | Critical |
| Google OR-Tools | Basic-Intermediate | 3-6 weeks | Critical |
| Twilio | Basic | 1 week | Important |
| Stripe | Basic | 1 week | Important |
| Field Service Ops | Domain expertise | Ongoing | Critical |
| Home Services Industry | Domain expertise | Ongoing | Critical |
| Route Optimization Theory | Academic/Applied | 2-4 weeks | Important |
| Map-Heavy UX Design | Intermediate | 2-4 weeks | Important |
| Data-Dense Dashboard Design | Intermediate | 2-4 weeks | Important |
| Glanceable Mobile UX | Intermediate | 1-2 weeks | Important |
| B2B Sales (Trades) | Business | Ongoing | Critical |
| Trade Publication Marketing | Business | 1-2 weeks | Important |
| Distributor Partnerships | Business | Ongoing | Important |

**Estimated total ramp-up time for a skilled full-stack developer new to this domain:** 3-4 months to be productive, 6-9 months to be expert across all required areas.
