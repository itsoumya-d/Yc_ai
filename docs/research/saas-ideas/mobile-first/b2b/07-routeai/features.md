# RouteAI — Features

## MVP Features (Months 1-4)

### 1. AI Job Intake

**What:** Automatically process customer calls and text messages into structured, schedulable jobs. No more manual data entry from phone conversations.

**How It Works:**
- Customer calls the service company. The call is transcribed (via existing VoIP integration or Twilio voice).
- Customer texts a request to the company number.
- AI parses the natural language into a structured job: job type, urgency, required skills, estimated duration, preferred time window, address, and special instructions.
- The parsed job appears on the dispatcher's job queue with all fields pre-filled and ready for scheduling.
- Dispatcher reviews and confirms, or edits before scheduling.

**AI Parsing Examples:**

| Customer Input | Parsed Job |
|----------------|------------|
| "My furnace is making a banging noise. I'm at 1420 Elm St. Can someone come this afternoon?" | Type: HVAC Repair, Priority: High, Skills: [hvac_repair], Duration: 90 min, Window: 12-5 PM, Address: 1420 Elm St |
| "I need my annual AC tune-up. Any day next week works." | Type: Maintenance, Priority: Normal, Skills: [hvac_maintenance], Duration: 60 min, Window: Flexible (next week), Recurring flag |
| "Water is leaking from my ceiling! Please send someone now!" | Type: Emergency Repair, Priority: Emergency, Skills: [plumbing_repair], Duration: 120 min, Window: ASAP, Address: (pull from customer record) |
| "Can you install a new Carrier 24ACC636A003? I already bought it." | Type: Install, Priority: Normal, Skills: [hvac_install, carrier_certified], Duration: 240 min, Equipment: Customer-supplied Carrier 24ACC636A003 |

**Acceptance Criteria:**
- AI correctly identifies job type in 95%+ of cases
- Required skills are matched to company's skill taxonomy
- Address extraction and geocoding succeeds for 98%+ of inputs
- Dispatcher can edit any AI-parsed field before scheduling
- Original customer text is preserved alongside structured data
- Processing time under 3 seconds from message receipt to job creation

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| OpenAI parsing fails or times out | "Job intake processing delayed. Queued for retry." | Auto-retry 3x with 10s delay | Route raw message to dispatcher for manual parsing |
| Address geocoding fails | "Address could not be verified. Please confirm location." | Auto-retry 1x with normalized address | Prompt dispatcher to manually enter/select address on map |
| Twilio voice transcription fails | "Call transcription unavailable. Audio recording saved." | Auto-retry 1x | Provide audio playback; dispatcher transcribes manually |
| Customer not found in CRM | "New customer detected. Please confirm details." | N/A | Auto-create customer stub; dispatcher fills remaining fields |
| AI assigns wrong skill taxonomy | (No user-facing error — dispatcher reviews) | N/A | Dispatcher corrects skill assignment before scheduling |
| Duplicate job detected (same customer, same window) | "Possible duplicate job detected. Merge or keep both?" | N/A | Prompt dispatcher to merge or create separate job |
| SMS gateway unavailable | "Unable to receive text messages. Voice intake active." | Auto-retry every 60s | Voice-only intake; queue SMS processing for when restored |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| job_id | uuid | yes | — | UUID v4 | — |
| customer_id | uuid | no | — | UUID v4 | — |
| job_type | enum | yes | — | repair/maintenance/install/emergency/inspection | — |
| priority | enum | yes | — | emergency/high/normal/low | — |
| required_skills | string[] | yes | 1/10 items | valid skill taxonomy codes | trim, lowercase |
| estimated_duration_min | integer | yes | 15/480 | positive integer | clamp to range |
| address_line | string | yes | 5/500 | — | trim, XSS strip |
| latitude | float | yes | -90/90 | decimal degrees | clamp to range |
| longitude | float | yes | -180/180 | decimal degrees | clamp to range |
| time_window_start | ISO 8601 | no | — | yyyy-MM-ddTHH:mm:ssZ | — |
| time_window_end | ISO 8601 | no | — | yyyy-MM-ddTHH:mm:ssZ, must be > start | — |
| special_instructions | string | no | 0/2000 | — | trim, XSS strip |
| raw_customer_text | string | yes | 1/5000 | — | trim, preserve original |
| source_type | enum | yes | — | voice/sms/web/manual | — |

---

### 2. AI Route Optimization

**What:** Build optimal daily routes for every technician that minimize total fleet drive time while respecting all business constraints.

**How It Works:**
- Each morning (or when triggered by dispatcher), the optimization engine runs across all scheduled jobs for the day.
- The system considers: technician skills and certifications, technician start/end locations, customer time windows, job priorities, estimated job durations, real-time traffic conditions, and job dependencies.
- Google OR-Tools solves the Vehicle Routing Problem (VRP) with time windows.
- The result: each technician gets an ordered list of jobs with turn-by-turn navigation and accurate time estimates.
- Before/after metrics are displayed: "Optimization saved 4.2 hours of total drive time across your fleet today."

**Constraint Types:**

| Constraint | Type | Example |
|------------|------|---------|
| Technician skills | Hard | Only EPA-certified techs can handle refrigerant |
| Customer time window | Hard | Customer available 2-4 PM only |
| Shift hours | Hard | Tech works 8 AM - 5 PM |
| Job priority | Soft | Emergency jobs scheduled first, but can flex |
| Drive time minimization | Optimization objective | Minimize total miles across fleet |
| Workload balance | Soft | No tech should have 2x the jobs of another |
| End-of-day location | Soft | Techs should end near home when possible |
| Buffer time | Hard | 15-minute buffer between jobs |
| Job dependencies | Hard | Inspection must happen before repair |

**Optimization Metrics Displayed:**
- Total fleet drive time (before vs. after optimization)
- Average jobs per technician
- Fleet utilization rate (billable hours / total hours)
- Estimated on-time arrival rate
- Total miles saved

**Acceptance Criteria:**
- Optimization completes in under 30 seconds for 50 jobs / 20 technicians
- Achieves 25-35% reduction in total drive time vs. manual scheduling
- Respects all hard constraints (skills, time windows, shift hours)
- Produces balanced workloads (no technician deviates more than 20% from mean)
- Dispatcher can lock specific jobs/assignments before optimization runs
- Dispatcher can manually override any AI assignment after optimization

#### Error Handling
| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| VRP solver times out (>30s) | "Optimization taking longer than expected. Simplifying..." | Auto-retry with relaxed soft constraints | Return best partial solution found before timeout |
| Google Distance Matrix API unavailable | "Traffic data unavailable. Using estimated drive times." | Auto-retry 2x with 15s delay | Use cached/historical drive time averages |
| Infeasible constraint set (no valid solution) | "Cannot build valid routes. [X] constraint conflicts detected." | N/A | Highlight conflicting constraints; suggest which to relax |
| Technician skill data missing | "Skill data missing for [tech name]. Excluded from optimization." | N/A | Exclude technician; alert dispatcher to update profile |
| No jobs scheduled for the day | "No jobs to optimize for today." | N/A | Dashboard shows empty state with prompt to add jobs |
| Optimization result worse than manual | "Optimization did not improve current routes. Keeping existing plan." | N/A | Retain manual assignments; log for model tuning |
| API rate limit on Distance Matrix | "Route calculation delayed due to high demand." | Exponential backoff (30s, 60s, 120s) | Use cached distance data for affected routes |

#### Data Validation
| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|--------------|
| org_id | uuid | yes | — | UUID v4 | — |
| optimization_id | uuid | yes | — | UUID v4 | — |
| optimization_date | date | yes | — | yyyy-MM-dd | — |
| technician_ids | uuid[] | yes | 1/100 | UUID v4 array | — |
| job_ids | uuid[] | yes | 1/500 | UUID v4 array | — |
| locked_assignments | JSON[] | no | 0/500 | {job_id: uuid, tech_id: uuid} | validate nested UUIDs |
| shift_start | time | yes | — | HH:mm (24h) | — |
| shift_end | time | yes | — | HH:mm, must be > shift_start | — |
| buffer_minutes | integer | yes | 0/60 | non-negative integer | clamp to range |
| max_drive_time_min | integer | no | 0/480 | non-negative integer | clamp to range |
| optimization_objective | enum | yes | — | minimize_drive_time/minimize_total_time/balance_workload | — |

---

### 3. Real-Time Re-Optimization

**What:** When conditions change during the day, automatically re-optimize affected routes. Not just one technician, the entire fleet if needed.

**Trigger Events:**

| Trigger | Response | Scope |
|---------|----------|-------|
| Job runs 30+ min over estimate | Recalculate ETAs for remaining jobs. If any customer time window is at risk, re-route. | Affected technician + potentially neighbors |
| Job cancelled by customer | Remove from route, re-optimize remaining jobs. Potentially pull a job from an overloaded tech. | Affected technician + fleet rebalance |
| Emergency job inserted | Find the best technician (nearest + skilled + least impact on existing schedule). Re-route that tech. | Full fleet evaluation |
| Technician calls in sick | Redistribute all their jobs across remaining fleet. Full re-optimization. | Full fleet |
| Severe traffic event | Recalculate affected routes with updated traffic data. Swap job order if faster. | Affected technicians |
| Customer reschedules same-day | Move job to new time slot. Re-optimize if position in route changes. | Affected technician |

**Re-Optimization Decision Logic:**
1. Detect trigger event
2. AI evaluates severity: minor (just update ETAs), moderate (re-route one tech), major (re-route fleet)
3. For moderate/major: run partial VRP solve on affected technicians only
4. Calculate disruption score: how many jobs change order? how many customers need new ETAs?
5. If disruption is low, apply automatically. If high, propose to dispatcher for approval.
6. Push updates to all affected technician apps and send customer notifications.

**Acceptance Criteria:**
- Re-optimization triggers within 60 seconds of a status change
- Partial re-solve completes in under 15 seconds
- Customer ETA updates are sent within 2 minutes of a re-route
- Dispatcher is notified of all re-routes with before/after comparison
- Dispatcher can reject a re-route and manually adjust
- Re-routes minimize disruption: prefer changing order over reassigning to a different technician

---

### 4. Customer Notifications

**What:** Automated SMS notifications that keep customers informed with accurate, narrow appointment windows instead of the industry-standard 4-hour window.

**Notification Flow:**

```
Job Scheduled
    │
    ▼
SMS: "Your HVAC repair is confirmed for Tuesday, March 15
      between 10:00-10:30 AM. Your technician will be Mike R."
    │
    ▼ (Day of appointment, tech starts route)
SMS: "Mike R. is starting his route. Your appointment is on
      track for 10:15 AM."
    │
    ▼ (Tech completes previous job, starts driving)
SMS: "Mike R. is on the way! ETA: 10:12 AM.
      Track: routeai.app/track/abc123"
    │
    ▼ (If ETA shifts significantly)
SMS: "Updated ETA for your HVAC repair: 10:45 AM.
      Mike's previous job took longer than expected. Sorry for the wait."
    │
    ▼ (Job completed)
SMS: "Your HVAC repair is complete! How was your experience
      with Mike? Reply 1-5 (5 = excellent)."
```

**Key Capabilities:**
- **30-minute appointment windows** instead of 4-hour windows (enabled by route optimization)
- **Real-time ETA tracking** via unique tracking links
- **Two-way SMS:** Customer can reply to confirm, reschedule, or provide access instructions
- **Smart timing:** Notifications are only sent during appropriate hours (8 AM - 8 PM)
- **Opt-out management:** Customers can opt out of SMS notifications
- **Multi-language support:** English and Spanish initially

**Acceptance Criteria:**
- SMS delivery rate above 97%
- Customer tracking links load in under 2 seconds
- ETA accuracy within 10 minutes for 85%+ of appointments
- Appointment window is 30 minutes or less for 80%+ of jobs
- Customers can reply STOP to opt out
- Notification templates are customizable per company

---

### 5. Technician Mobile App

**What:** A purpose-built mobile app for field technicians that provides turn-by-turn navigation, job details, and one-tap status updates. Designed for glanceable use while driving with large touch targets.

**Core Flows:**

**Morning Start:**
1. Technician opens app, sees today's route: ordered list of jobs with addresses and times
2. Taps "Start Route" to begin
3. Turn-by-turn navigation launches to first job
4. Estimated arrival time displayed

**At Each Job:**
1. App auto-detects arrival (geofencing) or technician taps "Arrived"
2. Job detail screen shows: customer name, address, job description, required tools, previous job history at this address, special instructions, customer phone number
3. Technician taps "Start Job" to begin time tracking
4. During job: can add notes, take photos, log parts used
5. Taps "Complete Job" when done
6. Next job auto-loads with navigation

**Key Design Principles:**
- **Large touch targets:** All primary actions are 48px+ tap targets. Technicians wear gloves.
- **Glanceable:** Key info (next job, ETA, address) visible without scrolling
- **Offline-capable:** Job details cached locally. Status updates queue and sync when connectivity returns.
- **Minimal typing:** Use dropdowns, toggles, and voice notes instead of text fields
- **Dark mode default:** Reduces glare on the road

**Acceptance Criteria:**
- App loads in under 2 seconds on 4G connection
- Turn-by-turn navigation integrates with Google Maps or Apple Maps
- Job details are available offline after initial sync
- Status updates sync within 30 seconds of connectivity
- Time tracking is accurate to the minute
- Technician can call customer with one tap
- Notification sound for route changes is distinct and audible

---

### 6. Fleet Utilization Dashboard

**What:** A real-time overview of the entire fleet's performance for dispatchers and company owners. Shows where every technician is, how optimized routes are, and key business metrics.

**Dashboard Sections:**

**Live Fleet Map:**
- All technician locations on a map in real time
- Color-coded routes (one color per technician)
- Job markers showing status: upcoming (blue), in progress (green), completed (gray), late (red)
- Traffic overlay toggle
- Click any technician to see their full route and job list

**Today's Metrics (Real-Time):**

| Metric | Description | Example |
|--------|-------------|---------|
| Jobs Completed | Completed / Total scheduled | 34 / 62 (55%) |
| On-Time Rate | Jobs started within 15 min of scheduled time | 89% |
| Fleet Utilization | Billable hours / Total hours across all techs | 72% |
| Drive Time Saved | vs. unoptimized routes | 3.8 hours today |
| Active Technicians | Currently on duty | 14 / 18 |
| Average Jobs/Tech | Mean jobs completed per technician today | 2.4 of 4.1 avg |

**Alerts:**
- Technician running behind schedule (yellow alert)
- Job at risk of missing time window (orange alert)
- Technician has been idle for 30+ minutes (investigation needed)
- Emergency job waiting for assignment (red alert)
- Route optimization available (new unscheduled jobs could be inserted)

**Historical Analytics:**
- Daily/weekly/monthly trends for all metrics
- Drive time savings over time (shows ROI)
- Technician performance comparison (jobs/day, on-time rate, customer ratings)
- Peak demand hours and days
- Customer satisfaction trends

**Acceptance Criteria:**
- Dashboard loads in under 3 seconds
- Technician positions update every 30 seconds
- Metrics refresh every 60 seconds
- Alerts appear within 2 minutes of trigger condition
- Dashboard is usable on both desktop monitors and tablets
- Data exports to CSV for reporting

---

## Post-MVP Features (Months 5-12)

### 7. GPS Fleet Tracking

**What:** Real-time GPS tracking of all technician vehicles with historical route replay, geofencing, and mileage tracking.

**Capabilities:**
- Live tracking with 15-second position updates
- Automatic arrival/departure detection via geofencing (200m radius around job address)
- Historical route replay: see exactly where a technician went on any past day
- Mileage tracking for tax deductions and expense reporting
- Speed monitoring and driving behavior scoring
- Idle time detection and alerts
- Breadcrumb trail on the fleet map showing actual routes taken

**Business Value:**
- Eliminates disputed arrival times ("I was there at 2 PM" vs. GPS shows 2:45 PM)
- Automatic mileage logs save technicians 30 minutes/week of manual logging
- Reduces unauthorized vehicle use (after-hours, personal errands)
- Improves time estimate accuracy over time (actual drive times feed back into the optimization model)

---

### 8. Job Costing

**What:** Track actual costs per job against estimates. Know profitability at the job, technician, and job-type level.

**Capabilities:**
- Automatic labor cost calculation from time tracking data
- Parts/materials cost entry (barcode scanning of parts used)
- Drive time cost allocation (fuel + wear at IRS rate)
- Overhead allocation per job
- Profit margin per job with alerts for unprofitable jobs
- Comparison: estimated cost vs. actual cost by job type
- Technician efficiency scoring (actual time / estimated time)

**Business Value:**
- Most service companies have no idea which jobs are profitable
- Identifies job types that should be priced higher
- Identifies technicians who consistently run over/under estimates
- Feeds back into AI time estimation (actual durations improve future predictions)

---

### 9. Customer CRM

**What:** Full customer relationship management built specifically for home services. Every customer interaction, job history, equipment record, and preference in one place.

**Capabilities:**
- Complete job history per customer with photos, notes, and invoices
- Equipment registry: what systems are installed at each address (make, model, install date, warranty)
- Predictive maintenance: "This customer's AC unit was installed 9 years ago. Schedule a tune-up proactively."
- Customer preferences: preferred technician, time-of-day preferences, access instructions, pet information
- Communication log: all calls, texts, and emails
- Customer satisfaction scoring based on SMS survey responses
- Service agreement tracking with renewal reminders
- Referral tracking

**Business Value:**
- Technicians arrive knowing the customer's history and equipment
- Proactive maintenance outreach generates recurring revenue
- Higher customer satisfaction from personalized service
- Reduces call center time (all info available without asking)

---

### 10. Inventory Management

**What:** Track parts and equipment in each technician's vehicle. Know what is in stock before scheduling a job.

**Capabilities:**
- Per-vehicle inventory with barcode/QR scanning
- Auto-suggest required parts based on job type and equipment model
- Low-stock alerts: "Mike's van only has 1 capacitor left. He has 3 AC repairs today."
- Part usage logging per job (links to job costing)
- Purchase order generation when stock drops below threshold
- Integration with parts distributors (Carrier, Lennox, Trane)
- Morning inventory check workflow in technician app

**Business Value:**
- Eliminates trips to the supply house mid-route (each trip wastes 45-90 minutes)
- Ensures technicians have the right parts for each job (reduces "I need to come back" rate)
- Accurate cost tracking per job
- Optimized purchasing with bulk discount identification

---

## Year 2+ Features

### 11. Equipment Financing Integration

**What:** Partner with equipment financing companies to offer customers instant financing for large installations (HVAC systems, water heaters, etc.) directly through the technician app.

**How It Works:**
- Technician quotes a $6,000 HVAC replacement
- Customer sees financing options on the technician's tablet: 0% for 12 months, 4.9% for 60 months
- Customer applies and gets approved in minutes via integrated lending partner
- Service company gets paid in full upfront; financing partner owns the loan
- RouteAI earns referral fee per funded loan

**Revenue:** 1-3% referral fee on financed amount. Average HVAC install: $7,500. At 10% financing adoption: ~$50/job additional revenue.

---

### 12. Insurance Partnerships

**What:** Offer service guarantee insurance to customers. "If we don't show up on time, your visit is free."

**How It Works:**
- Service companies opt into the guarantee program
- Customers see the guarantee badge on appointment confirmations
- If the technician arrives more than 30 minutes late, the job is credited
- Insurance underwriter covers the cost; RouteAI earns premium share
- Only works because RouteAI's optimization makes on-time arrival rate 90%+

**Revenue:** Insurance premium share per guaranteed appointment. Priced based on historical on-time rate.

---

### 13. Delivery and Logistics Expansion

**What:** Expand RouteAI's optimization engine beyond home services into delivery, logistics, and any last-mile routing scenario.

**Target Verticals:**
- Medical supply delivery
- Restaurant/grocery delivery fleet management
- Commercial cleaning companies
- Home healthcare visits
- Equipment rental delivery/pickup
- Waste management route optimization

**Technical Foundation:** The VRP solver, real-time re-routing, and customer notification system are domain-agnostic. Expansion requires vertical-specific UI customization and constraint definitions.

---

### 14. International Expansion

**What:** Expand beyond the US market to Canada, UK, Australia, and Western Europe.

**Requirements:**
- Multi-currency billing
- Localized SMS (country-specific providers or Twilio international)
- Metric/imperial unit handling
- Localized address formats and geocoding
- Language support (French for Quebec, etc.)
- Regional maps API coverage (Google Maps covers all target markets)

**Market Sizing:**
- Canada: 60,000+ home service companies
- UK: 150,000+ trades businesses
- Australia: 40,000+ service companies
- Western Europe: 300,000+ combined

---

## User Stories

### Dispatcher Stories

| ID | Story | Priority |
|----|-------|----------|
| D1 | As a dispatcher, I want to see all unscheduled jobs in a queue so I can assign them to technicians. | MVP |
| D2 | As a dispatcher, I want to click "Optimize" and have AI build optimal routes for all technicians so I save hours of manual planning. | MVP |
| D3 | As a dispatcher, I want to drag and drop jobs between technicians on the schedule board so I can manually adjust assignments. | MVP |
| D4 | As a dispatcher, I want to see all technicians on a map with their current location so I know where my fleet is. | MVP |
| D5 | As a dispatcher, I want to be alerted when a technician is running behind so I can proactively manage customer expectations. | MVP |
| D6 | As a dispatcher, I want to insert an emergency job and have the system re-optimize routes automatically. | MVP |
| D7 | As a dispatcher, I want to see before/after optimization metrics so I can demonstrate ROI to my boss. | MVP |
| D8 | As a dispatcher, I want AI to parse incoming customer calls into structured jobs so I spend less time on data entry. | MVP |
| D9 | As a dispatcher, I want to lock specific job assignments before running optimization so my VIP customers keep their preferred tech. | MVP |
| D10 | As a dispatcher, I want weekly analytics reports so I can track fleet performance trends. | Post-MVP |

### Technician Stories

| ID | Story | Priority |
|----|-------|----------|
| T1 | As a technician, I want to see my daily route as an ordered list with addresses so I know where to go. | MVP |
| T2 | As a technician, I want one-tap navigation to my next job so I don't waste time typing addresses. | MVP |
| T3 | As a technician, I want to see the job details (description, customer info, required tools) before I arrive so I am prepared. | MVP |
| T4 | As a technician, I want to mark jobs as complete with one tap so I can move to the next job quickly. | MVP |
| T5 | As a technician, I want my time tracked automatically so I don't have to fill out timesheets. | MVP |
| T6 | As a technician, I want to be notified instantly when my route changes so I am never surprised. | MVP |
| T7 | As a technician, I want to add notes and photos to completed jobs so there is a record of my work. | MVP |
| T8 | As a technician, I want to call the customer with one tap so I don't have to look up their number. | MVP |
| T9 | As a technician, I want the app to work offline so I can see job details in areas with poor signal. | MVP |
| T10 | As a technician, I want to request a schedule change (swap, reschedule) from the app so I don't have to call dispatch. | Post-MVP |

### Company Owner Stories

| ID | Story | Priority |
|----|-------|----------|
| O1 | As a company owner, I want to see how much drive time RouteAI is saving so I can measure ROI. | MVP |
| O2 | As a company owner, I want to see fleet utilization rates so I know if I need more or fewer technicians. | MVP |
| O3 | As a company owner, I want customer satisfaction scores so I can identify training opportunities. | MVP |
| O4 | As a company owner, I want to compare technician performance so I can reward top performers. | Post-MVP |
| O5 | As a company owner, I want job costing data so I know which services are most profitable. | Post-MVP |
| O6 | As a company owner, I want predictive analytics so I can plan hiring and capacity. | Year 2 |

### Customer Stories

| ID | Story | Priority |
|----|-------|----------|
| C1 | As a customer, I want a 30-minute appointment window instead of a 4-hour window so I can plan my day. | MVP |
| C2 | As a customer, I want SMS updates when my technician is on the way so I know exactly when to expect them. | MVP |
| C3 | As a customer, I want to track my technician's location in real time so I can see how far away they are. | MVP |
| C4 | As a customer, I want to be notified immediately if my appointment time changes so I can adjust. | MVP |
| C5 | As a customer, I want to rate my service experience via text so I can provide feedback easily. | MVP |
| C6 | As a customer, I want to text the company to schedule a job so I don't have to call during business hours. | MVP |

---

## Development Timeline

### Phase 1: Foundation (Weeks 1-4)
- Supabase project setup, database schema, authentication
- React Native + Expo monorepo configuration
- Shared packages: types, Supabase client, theme
- Basic navigation structure for both apps
- Google Maps integration (map display, geocoding)

### Phase 2: Core Dispatcher App (Weeks 5-8)
- Job creation form with address autocomplete and geocoding
- Job queue (unscheduled jobs list)
- Schedule board with drag-drop assignment
- Fleet map with technician markers
- Basic metrics dashboard

### Phase 3: Core Technician App (Weeks 9-10)
- Daily route view (ordered job list)
- Job detail screen with customer info
- Status buttons (en route, arrived, started, completed)
- Navigation launch to Google Maps / Apple Maps
- Time tracking (automatic start/stop)

### Phase 4: AI + Optimization (Weeks 11-14)
- Google OR-Tools VRP solver integration
- Distance Matrix API integration for travel time computation
- OpenAI job intake parsing
- OpenAI constraint-based scheduling assistance
- Optimization button with before/after metrics
- Real-time re-optimization triggers

### Phase 5: Notifications + Polish (Weeks 15-16)
- Twilio SMS integration (appointment confirmation, en route, ETA, completion)
- Customer tracking link page
- Push notifications for route changes
- Real-time Supabase subscriptions (dispatcher ↔ technician sync)
- Offline support for technician app
- Performance optimization and testing

### Phase 6: Billing + Launch (Weeks 17-18)
- Stripe subscription integration
- Usage metering and plan enforcement
- Onboarding flow for new companies
- Demo mode with sample data
- App Store / Play Store submission
- Landing page and documentation

---

## Feature Prioritization Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| AI Route Optimization | Very High | High | P0 | MVP |
| Technician Mobile App | Very High | Medium | P0 | MVP |
| Real-Time Re-Optimization | High | High | P0 | MVP |
| Customer SMS Notifications | High | Low | P0 | MVP |
| Fleet Dashboard | High | Medium | P0 | MVP |
| AI Job Intake | High | Medium | P0 | MVP |
| Schedule Board (Drag-Drop) | Medium | Medium | P1 | MVP |
| GPS Fleet Tracking | Medium | Medium | P1 | Post-MVP |
| Job Costing | Medium | Medium | P2 | Post-MVP |
| Customer CRM | Medium | High | P2 | Post-MVP |
| Inventory Management | Medium | High | P2 | Post-MVP |
| Equipment Financing | Low | Medium | P3 | Year 2 |
| Insurance Partnerships | Low | Medium | P3 | Year 2 |
| International Expansion | Medium | Very High | P3 | Year 2 |
