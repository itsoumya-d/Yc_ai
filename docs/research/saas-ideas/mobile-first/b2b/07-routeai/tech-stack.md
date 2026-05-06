# RouteAI — Tech Stack

## Architecture Overview

RouteAI operates as a dual-app system with a shared backend. The dispatcher app runs on tablets and web browsers in the office. The technician app runs on smartphones in the field. Both connect through Supabase real-time for instant synchronization of job assignments, route changes, and status updates.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                                                                     │
│  ┌─────────────────────┐         ┌─────────────────────┐           │
│  │   Dispatcher App    │         │   Technician App    │           │
│  │   (React Native +   │         │   (React Native +   │           │
│  │    Expo / Web)       │◄───────►│    Expo / Mobile)   │           │
│  │                     │  Real-   │                     │           │
│  │  - Schedule Board   │  Time    │  - My Route         │           │
│  │  - Fleet Map        │  Sync    │  - Job Details      │           │
│  │  - Job Manager      │         │  - Turn-by-Turn Nav  │           │
│  │  - Analytics        │         │  - Time Tracker      │           │
│  └────────┬────────────┘         └────────┬────────────┘           │
│           │                               │                         │
└───────────┼───────────────────────────────┼─────────────────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Supabase                                  │   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │   │
│  │  │ Postgres │  │  Real-Time   │  │   Edge Functions   │   │   │
│  │  │ Database │  │  Subscriptions│  │                    │   │   │
│  │  │          │  │              │  │  - Optimization    │   │   │
│  │  │ - Jobs   │  │  - Job       │  │  - AI Job Parsing  │   │   │
│  │  │ - Routes │  │    Updates   │  │  - Notification    │   │   │
│  │  │ - Techs  │  │  - Route     │  │    Dispatch        │   │   │
│  │  │ - Companies│ │    Changes  │  │  - Billing         │   │   │
│  │  │ - Customers│ │  - Status   │  │                    │   │   │
│  │  └──────────┘  └──────────────┘  └────────┬───────────┘   │   │
│  │                                            │               │   │
│  └────────────────────────────────────────────┼───────────────┘   │
│                                               │                     │
└───────────────────────────────────────────────┼─────────────────────┘
                                                │
                    ┌───────────────────────────┼────────────────┐
                    │          EXTERNAL SERVICES                  │
                    │                                             │
                    │  ┌──────────────┐  ┌──────────────────┐   │
                    │  │ Google Maps  │  │    OpenAI API    │   │
                    │  │  Platform    │  │                  │   │
                    │  │              │  │  - GPT-4o for    │   │
                    │  │  - Directions│  │    scheduling    │   │
                    │  │  - Distance  │  │  - Job parsing   │   │
                    │  │    Matrix    │  │  - Constraint    │   │
                    │  │  - Geocoding │  │    reasoning     │   │
                    │  │  - Maps SDK  │  │                  │   │
                    │  └──────────────┘  └──────────────────┘   │
                    │                                             │
                    │  ┌──────────────┐  ┌──────────────────┐   │
                    │  │   Twilio     │  │     Stripe       │   │
                    │  │              │  │                  │   │
                    │  │  - Customer  │  │  - Subscription  │   │
                    │  │    SMS       │  │    billing       │   │
                    │  │  - ETA       │  │  - Usage-based   │   │
                    │  │    updates   │  │    metering      │   │
                    │  └──────────────┘  └──────────────────┘   │
                    │                                             │
                    │  ┌──────────────┐                          │
                    │  │ Google       │                          │
                    │  │ OR-Tools     │                          │
                    │  │              │                          │
                    │  │ - VRP Solver │                          │
                    │  │ - TSP        │                          │
                    │  │ - Constraint │                          │
                    │  │   Programming│                          │
                    │  └──────────────┘                          │
                    └─────────────────────────────────────────────┘
```

---

## Core Technologies

### React Native + Expo (Client Applications)

**Why:** Two distinct apps serving two distinct user personas, both built from a shared codebase using Expo's managed workflow.

| App | Platform | Primary Use |
|-----|----------|-------------|
| Dispatcher App | iPad/Tablet + Web | Office-based fleet management, scheduling, analytics |
| Technician App | iPhone/Android | Field navigation, job completion, time tracking |

**Expo Advantages for RouteAI:**
- **Monorepo support:** Shared packages between both apps (types, utilities, API clients, theme)
- **EAS Build:** Over-the-air updates mean bug fixes reach technicians in the field without app store delays
- **Expo Location:** Background location tracking for technician GPS (with proper permissions)
- **Expo Notifications:** Push notifications for route changes and new job assignments
- **Web support:** Dispatcher app also runs as a web app for office desktop use

**Project Structure:**
```
apps/
├── dispatcher/
│   ├── app/                    # Expo Router file-based routing
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx   # Fleet overview
│   │   │   ├── schedule.tsx    # Schedule board
│   │   │   ├── jobs.tsx        # Job management
│   │   │   ├── routes.tsx      # Fleet map
│   │   │   └── analytics.tsx   # Performance metrics
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScheduleBoard/  # Drag-drop job assignment
│   │   │   ├── FleetMap/       # All technician routes
│   │   │   ├── JobCard/        # Job summary cards
│   │   │   └── OptimizeButton/ # AI optimization trigger
│   │   ├── hooks/
│   │   │   ├── useRealtimeJobs.ts
│   │   │   ├── useOptimization.ts
│   │   │   └── useFleetStatus.ts
│   │   └── services/
│   │       ├── optimization.ts
│   │       └── jobParser.ts
│   └── app.json
│
├── technician/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── route.tsx       # Today's route + navigation
│   │   │   ├── jobs.tsx        # Job list
│   │   │   └── time.tsx        # Time tracking
│   │   ├── job/[id].tsx        # Job detail
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── components/
│   │   │   ├── RouteList/      # Ordered job list
│   │   │   ├── NavigationCard/ # Turn-by-turn preview
│   │   │   ├── JobActions/     # Complete/reschedule
│   │   │   └── StatusButton/   # Large touch targets
│   │   ├── hooks/
│   │   │   ├── useLocation.ts  # GPS tracking
│   │   │   ├── useNavigation.ts
│   │   │   └── useJobUpdates.ts
│   │   └── services/
│   │       └── locationService.ts
│   └── app.json
│
packages/
├── shared/                     # Shared between both apps
│   ├── types/                  # TypeScript interfaces
│   │   ├── job.ts
│   │   ├── technician.ts
│   │   ├── route.ts
│   │   └── company.ts
│   ├── constants/
│   ├── utils/
│   └── supabase/               # Supabase client + queries
├── optimization/               # Route optimization engine
│   ├── vrpSolver.ts            # Google OR-Tools wrapper
│   ├── constraintBuilder.ts    # Build constraint models
│   └── reoptimizer.ts          # Real-time re-routing
├── ai/                         # OpenAI integration
│   ├── jobParser.ts            # NL → structured job
│   ├── scheduleOptimizer.ts    # AI constraint reasoning
│   └── prompts/                # Prompt templates
└── notifications/              # Twilio SMS service
    ├── smsService.ts
    └── templates/
```

**Key Libraries:**
- `react-native-maps` — Map rendering (Google Maps provider)
- `react-native-reanimated` — Smooth drag-drop on schedule board
- `@gorhom/bottom-sheet` — Job detail sheets in technician app
- `expo-location` — Background GPS tracking
- `expo-notifications` — Push notifications
- `react-native-gesture-handler` — Swipe actions on job cards

---

### Supabase (Backend + Real-Time)

**Why:** Real-time subscriptions are the backbone of fleet dispatch. When a dispatcher reassigns a job, the technician's app must update instantly. Supabase provides this out of the box with PostgreSQL and real-time channels.

**Database Schema:**

```sql
-- Companies (multi-tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'pest_control', 'cleaning'
    subscription_tier TEXT DEFAULT 'starter', -- 'starter', 'growth', 'scale'
    stripe_customer_id TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Technicians
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    phone TEXT,
    skills TEXT[] DEFAULT '{}', -- ['hvac_install', 'hvac_repair', 'epa_certified']
    certifications JSONB DEFAULT '[]',
    home_address TEXT,
    home_lat FLOAT,
    home_lng FLOAT,
    status TEXT DEFAULT 'off_duty', -- 'available', 'en_route', 'on_job', 'break', 'off_duty'
    current_lat FLOAT,
    current_lng FLOAT,
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    technician_id UUID REFERENCES technicians(id),
    title TEXT NOT NULL,
    description TEXT,
    job_type TEXT NOT NULL, -- 'repair', 'install', 'maintenance', 'inspection', 'emergency'
    required_skills TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
    status TEXT DEFAULT 'unscheduled', -- 'unscheduled', 'scheduled', 'en_route', 'in_progress', 'completed', 'cancelled'
    estimated_duration_minutes INT DEFAULT 60,
    actual_duration_minutes INT,
    scheduled_date DATE,
    time_window_start TIME,
    time_window_end TIME,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    address TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    notes TEXT,
    route_order INT, -- Position in technician's daily route
    source TEXT DEFAULT 'manual', -- 'manual', 'phone_ai', 'sms_ai', 'recurring'
    raw_intake_text TEXT, -- Original customer request text
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    lat FLOAT,
    lng FLOAT,
    preferences JSONB DEFAULT '{}', -- time preferences, access instructions, etc.
    notification_opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Routes (daily optimized routes per technician)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    technician_id UUID REFERENCES technicians(id),
    route_date DATE NOT NULL,
    optimized_at TIMESTAMPTZ,
    total_drive_time_minutes INT,
    total_jobs INT,
    total_distance_miles FLOAT,
    route_polyline TEXT, -- Encoded polyline for map display
    optimization_score FLOAT, -- 0-100 efficiency score
    status TEXT DEFAULT 'draft', -- 'draft', 'optimized', 'active', 'completed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Route History (for before/after optimization comparisons)
CREATE TABLE route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    route_date DATE NOT NULL,
    before_total_drive_minutes INT,
    after_total_drive_minutes INT,
    time_saved_minutes INT,
    jobs_affected INT,
    technicians_affected INT,
    optimization_type TEXT, -- 'daily_plan', 'reoptimize', 'emergency_insert'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications Log
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    customer_id UUID REFERENCES customers(id),
    type TEXT NOT NULL, -- 'appointment_confirmed', 'eta_update', 'tech_en_route', 'completed'
    channel TEXT DEFAULT 'sms', -- 'sms', 'email', 'push'
    message TEXT,
    sent_at TIMESTAMPTZ,
    delivered BOOLEAN DEFAULT false,
    twilio_sid TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Real-Time Subscriptions:**

```typescript
// Dispatcher subscribes to all job updates for their company
const jobSubscription = supabase
    .channel('company-jobs')
    .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'jobs',
            filter: `company_id=eq.${companyId}`
        },
        (payload) => {
            // Update local state — job created, updated, or completed
            handleJobChange(payload);
        }
    )
    .subscribe();

// Technician subscribes to their specific route changes
const routeSubscription = supabase
    .channel('my-route')
    .on(
        'postgres_changes',
        {
            event: 'UPDATE',
            schema: 'public',
            table: 'jobs',
            filter: `technician_id=eq.${technicianId}`
        },
        (payload) => {
            // Route changed — new job assigned, job reordered, etc.
            handleRouteUpdate(payload);
        }
    )
    .subscribe();

// Live technician location broadcast (every 30 seconds)
const locationChannel = supabase
    .channel('technician-locations')
    .on('broadcast', { event: 'location' }, (payload) => {
        updateTechnicianMarker(payload);
    })
    .subscribe();
```

**Edge Functions:**

```
supabase/functions/
├── optimize-routes/        # Calls OR-Tools solver
├── parse-job-intake/       # OpenAI NL job parsing
├── send-notification/      # Twilio SMS dispatch
├── reoptimize/             # Real-time re-routing
├── daily-schedule/         # Morning optimization run
├── billing-webhook/        # Stripe webhook handler
└── analytics-aggregate/    # Nightly metrics rollup
```

---

### Google Maps Platform (Routing + Geocoding)

**Why:** The routing engine behind every technician's daily plan. Google Maps provides the most accurate real-time traffic data, the broadest address coverage, and the most reliable directions API.

**APIs Used:**

| API | Purpose | Usage Pattern |
|-----|---------|---------------|
| Directions API | Route calculation between jobs | Per route segment |
| Distance Matrix API | Travel times between all job pairs | Daily optimization (N x N matrix) |
| Geocoding API | Address to lat/lng conversion | Per new job/customer |
| Maps JavaScript SDK | Map display in dispatcher app | Continuous |
| Maps SDK for React Native | Map display in technician app | Continuous |
| Places API | Address autocomplete in job creation | Per job entry |

**Distance Matrix for Optimization:**

The Distance Matrix API is critical for the VRP solver. Before optimizing, we compute travel times between every pair of locations (all jobs + technician start locations):

```typescript
// Build distance matrix for daily optimization
async function buildDistanceMatrix(
    locations: LatLng[]
): Promise<number[][]> {
    const batchSize = 25; // API limit: 25 origins OR destinations per request
    const matrix: number[][] = [];

    for (let i = 0; i < locations.length; i += batchSize) {
        const origins = locations.slice(i, i + batchSize);
        const response = await mapsClient.distancematrix({
            origins: origins.map(l => `${l.lat},${l.lng}`),
            destinations: locations.map(l => `${l.lat},${l.lng}`),
            mode: 'driving',
            departure_time: 'now', // Real-time traffic
            traffic_model: 'best_guess'
        });

        // Extract duration_in_traffic values
        response.data.rows.forEach(row => {
            matrix.push(
                row.elements.map(el => el.duration_in_traffic?.value || el.duration.value)
            );
        });
    }

    return matrix;
}
```

---

### OpenAI API (AI Scheduling + NL Job Intake)

**Why:** Two critical AI functions that differentiate RouteAI from every competitor.

**1. Natural Language Job Intake:**

Processes customer calls (via transcription) and texts into structured job objects:

```typescript
const JOB_INTAKE_PROMPT = `
You are a job intake specialist for a home services company.
Parse the following customer request into a structured job.
Extract: job type, urgency, preferred time window, address, description,
required skills, estimated duration, and any special instructions.

Company services: ${company.services.join(', ')}
Available job types: repair, install, maintenance, inspection, emergency

Customer request:
"${customerMessage}"

Return JSON matching this schema:
{
    title: string,
    description: string,
    job_type: 'repair' | 'install' | 'maintenance' | 'inspection' | 'emergency',
    priority: 'low' | 'normal' | 'high' | 'emergency',
    required_skills: string[],
    estimated_duration_minutes: number,
    preferred_time_window: { start: string, end: string } | null,
    address: string | null,
    special_instructions: string | null
}
`;

// Example input: "Hey, my AC unit stopped blowing cold air yesterday.
// I'm at 4521 Oak Street. Can someone come tomorrow afternoon?
// It's a Carrier unit, maybe 10 years old."

// Example output:
{
    title: "AC Unit Not Cooling - Carrier",
    description: "Customer reports AC unit stopped blowing cold air. Carrier unit, approximately 10 years old.",
    job_type: "repair",
    priority: "high",
    required_skills: ["hvac_repair", "carrier_certified"],
    estimated_duration_minutes: 90,
    preferred_time_window: { start: "12:00", end: "17:00" },
    address: "4521 Oak Street",
    special_instructions: "Carrier unit, approx 10 years old"
}
```

**2. Constraint-Based Schedule Optimization:**

The LLM handles the "soft" constraint reasoning that OR-Tools cannot:

```typescript
const SCHEDULE_OPTIMIZATION_PROMPT = `
You are a dispatch optimization specialist.
Given these constraints, assign jobs to technicians and determine optimal ordering.

Technicians available:
${technicians.map(t => `- ${t.name}: Skills [${t.skills}], starts at ${t.home_address}, available ${t.shift_start}-${t.shift_end}`).join('\n')}

Unassigned jobs:
${jobs.map(j => `- ${j.title}: Type ${j.job_type}, needs [${j.required_skills}], est ${j.estimated_duration_minutes}min, at ${j.address}, window ${j.time_window_start}-${j.time_window_end}, priority ${j.priority}`).join('\n')}

Rules:
1. Technicians can only do jobs matching their skills
2. Respect customer time windows
3. Emergency jobs take priority
4. Minimize total drive time across the fleet
5. Balance workload across technicians (no one gets 10 jobs while another gets 2)
6. Account for 15-minute buffer between jobs
7. Technicians should end near their home if possible

Return assignments as JSON array of { technician_id, job_ids_in_order, reasoning }.
`;
```

**Model Selection:**
- Job intake parsing: GPT-4o-mini (fast, cheap, structured output)
- Schedule optimization: GPT-4o (complex constraint reasoning)
- Re-optimization triggers: GPT-4o-mini (quick decision on whether to reroute)

---

### Google OR-Tools (Route Optimization Engine)

**Why:** Open-source optimization library from Google that solves the Vehicle Routing Problem (VRP) with time windows. This is the mathematical backbone of route optimization.

**Integration Architecture:**

OR-Tools runs in a Supabase Edge Function (or a dedicated microservice for scale). The LLM handles job-to-technician assignment (soft constraints), then OR-Tools optimizes the route ordering for each technician (hard optimization).

```typescript
// VRP Solver using OR-Tools (Node.js binding)
import { RoutingModel, RoutingIndexManager } from 'google-or-tools';

interface VRPInput {
    distanceMatrix: number[][];      // Travel times between all locations
    timeWindows: [number, number][]; // Customer time preferences
    serviceTimes: number[];          // Time spent at each job
    vehicleCount: number;            // Number of technicians
    depot: number;                   // Index of depot/start location
}

function solveVRP(input: VRPInput): VRPSolution {
    const manager = new RoutingIndexManager(
        input.distanceMatrix.length,
        input.vehicleCount,
        input.depot
    );

    const routing = new RoutingModel(manager);

    // Distance callback
    const transitCallback = routing.registerTransitCallback((fromIndex, toIndex) => {
        const from = manager.indexToNode(fromIndex);
        const to = manager.indexToNode(toIndex);
        return input.distanceMatrix[from][to];
    });
    routing.setArcCostEvaluatorOfAllVehicles(transitCallback);

    // Time window constraints
    const timeDimension = routing.addDimension(
        transitCallback,
        30,     // Max waiting time (30 min slack)
        28800,  // Max time per route (8 hours in seconds)
        false,
        'Time'
    );

    input.timeWindows.forEach((window, i) => {
        if (i === input.depot) return;
        const index = manager.nodeToIndex(i);
        timeDimension.cumulVar(index).setRange(window[0], window[1]);
    });

    // Service time at each location
    input.serviceTimes.forEach((serviceTime, i) => {
        if (i === input.depot) return;
        const index = manager.nodeToIndex(i);
        routing.addVariableMinimizedByFinalizer(
            timeDimension.slackVar(index)
        );
    });

    // Solve
    const searchParams = routing.defaultSearchParameters();
    searchParams.firstSolutionStrategy = 'PATH_CHEAPEST_ARC';
    searchParams.localSearchMetaheuristic = 'GUIDED_LOCAL_SEARCH';
    searchParams.timeLimit = { seconds: 10 }; // Max 10 seconds to solve

    const solution = routing.solveWithParameters(searchParams);

    return extractSolution(routing, manager, solution);
}
```

**Optimization Pipeline:**

```
1. AI assigns jobs to technicians (constraint reasoning)
         │
         ▼
2. Build distance matrix via Google Maps Distance Matrix API
         │
         ▼
3. OR-Tools solves VRP with time windows for each technician
         │
         ▼
4. Calculate route details via Google Maps Directions API
         │
         ▼
5. Store optimized routes in Supabase
         │
         ▼
6. Push updates to dispatcher + technician apps via real-time
```

---

### Twilio (Customer Notifications)

**Why:** Customers expect SMS updates. Twilio provides reliable, scalable SMS with delivery tracking.

**Notification Types:**

```typescript
const NOTIFICATION_TEMPLATES = {
    appointment_confirmed: {
        template: "Hi {{customerName}}, your {{jobType}} appointment is confirmed for {{date}} between {{windowStart}}-{{windowEnd}}. Your technician will be {{techName}}. Reply CONFIRM or call to reschedule.",
        trigger: 'job_scheduled'
    },
    tech_en_route: {
        template: "{{techName}} is on the way! Estimated arrival: {{eta}}. Track your technician: {{trackingLink}}",
        trigger: 'status_change_to_en_route'
    },
    eta_update: {
        template: "Updated ETA for your {{jobType}} appointment: {{newEta}}. We apologize for any inconvenience.",
        trigger: 'eta_changed_by_15_plus_minutes'
    },
    completed: {
        template: "Your {{jobType}} job is complete! {{techName}} has finished. How was your experience? Reply 1-5.",
        trigger: 'status_change_to_completed'
    },
    reschedule: {
        template: "Your {{jobType}} appointment on {{originalDate}} needs to be rescheduled. We'll call you shortly to find a new time.",
        trigger: 'job_rescheduled'
    }
};
```

---

### Stripe (B2B Subscription Billing)

**Why:** B2B subscription management with usage-based metering for API overage.

**Implementation:**

```typescript
const STRIPE_PLANS = {
    starter: {
        priceId: 'price_starter_monthly',
        amount: 9900, // $99/mo
        limits: {
            technicians: 5,
            jobsPerMonth: 500,
            smsNotifications: 1000,
            optimizationsPerDay: 2
        }
    },
    growth: {
        priceId: 'price_growth_monthly',
        amount: 24900, // $249/mo
        limits: {
            technicians: 20,
            jobsPerMonth: 2000,
            smsNotifications: 5000,
            optimizationsPerDay: 10
        }
    },
    scale: {
        priceId: 'price_scale_monthly',
        amount: 49900, // $499/mo
        limits: {
            technicians: -1, // Unlimited
            jobsPerMonth: -1,
            smsNotifications: 15000,
            optimizationsPerDay: -1
        }
    }
};
```

---

## Data Flow: Job Lifecycle

```
Customer calls/texts                    Manual entry by dispatcher
        │                                        │
        ▼                                        ▼
┌──────────────────┐                  ┌──────────────────┐
│ AI Job Intake    │                  │ Job Creation     │
│ (OpenAI)         │                  │ Form             │
│                  │                  │                  │
│ NL → structured  │                  │ Structured       │
│ job object       │                  │ job entry        │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Job Queue (Supabase)                   │
│                    status: 'unscheduled'                  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              AI Schedule Optimization                    │
│                                                         │
│  1. LLM assigns jobs to technicians (constraint match)  │
│  2. Distance Matrix API builds travel time grid         │
│  3. OR-Tools optimizes route ordering (VRP)             │
│  4. Directions API calculates exact routes              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Route Published to Both Apps                 │
│                                                         │
│  Dispatcher: sees all routes on fleet map               │
│  Technician: sees ordered job list with navigation      │
│  Customer: receives SMS appointment confirmation        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Real-Time Execution                         │
│                                                         │
│  Technician navigates to job → marks en_route           │
│  Customer gets "tech on the way" SMS with ETA           │
│  Technician arrives → marks in_progress                 │
│  Job runs long → triggers fleet re-optimization         │
│  Technician completes → marks completed                 │
│  Customer gets completion SMS + satisfaction survey      │
│  Next job auto-loads with navigation                    │
└─────────────────────────────────────────────────────────┘
```

---

## Real-Time Re-Routing Flow

This is what separates RouteAI from static route planners. When conditions change during the day, the system re-optimizes:

```
Trigger Events:
├── Job runs 30+ min over estimate
├── Job cancelled by customer
├── Emergency job inserted
├── Technician calls in sick
├── Severe traffic event
└── Customer reschedules same-day

         │
         ▼
┌─────────────────────────────────────────────┐
│         Re-Optimization Decision (AI)        │
│                                             │
│  "Should we re-route? If so, which techs?" │
│  - Minor delay: just update ETAs            │
│  - Major delay: re-route affected tech      │
│  - Emergency: re-route entire fleet         │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         Partial VRP Re-Solve                 │
│                                             │
│  Only re-optimize affected technicians      │
│  Keep completed/in-progress jobs fixed      │
│  Minimize disruption to other routes        │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         Update All Stakeholders              │
│                                             │
│  Dispatcher: route map updates instantly    │
│  Affected technicians: new route pushed     │
│  Affected customers: updated ETA SMS        │
│  Analytics: log optimization event          │
└─────────────────────────────────────────────┘
```

---

## Infrastructure Costs at Scale

### Per Company (Average: 15 technicians, 50 jobs/day)

| Service | Monthly Cost | Calculation |
|---------|-------------|-------------|
| Supabase (Pro) | $2.50 allocated | $25/project shared across 10+ companies |
| Google Maps Distance Matrix | $3.75 | 50 jobs x 30 days = 1,500 matrix elements |
| Google Maps Directions | $2.50 | 50 routes/day x 30 = 1,500 requests |
| Google Maps Geocoding | $0.75 | 50 new addresses/month |
| OpenAI API | $4.00 | ~100 job parses + 30 optimizations |
| Twilio SMS | $6.00 | ~750 SMS/month |
| **Total per company** | **~$19.50** | |

### At Scale

| Metric | 100 Companies | 500 Companies | 2,000 Companies |
|--------|---------------|---------------|-----------------|
| Revenue (MRR) | $29,900 | $149,500 | $598,000 |
| Google Maps | $700 | $3,500 | $14,000 |
| OpenAI | $400 | $2,000 | $8,000 |
| Twilio | $600 | $3,000 | $12,000 |
| Supabase | $250 | $1,250 | $5,000 |
| Total COGS | $1,950 | $9,750 | $39,000 |
| **Gross Margin** | **93.5%** | **93.5%** | **93.5%** |

---

## Future-Proof Architecture

### Phase 2: GPS Fleet Tracking
- Add real-time GPS tracking with `expo-location` background mode
- Geofencing for automatic job arrival/departure detection
- Historical route replay for dispute resolution
- Mileage tracking for tax purposes

### Phase 3: Inventory Management
- Track parts/equipment per technician vehicle
- Auto-suggest required parts based on job type
- Low-stock alerts before routes are planned
- Integration with parts distributors (Carrier, Lennox)

### Phase 4: Customer CRM
- Full customer history (all jobs, communications, satisfaction scores)
- Predictive maintenance alerts ("This HVAC system is due for service")
- Customer self-service portal for scheduling
- Review generation and reputation management

### Phase 5: Financial Services
- Job costing with actual vs. estimated tracking
- Equipment financing partnerships
- Insurance integration for service guarantees
- Payroll integration based on time tracking data

---

## Development Environment Setup

```bash
# Prerequisites
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0

# Environment variables (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GOOGLE_MAPS_API_KEY=your-google-maps-key
GOOGLE_MAPS_API_KEY_IOS=your-ios-restricted-key
GOOGLE_MAPS_API_KEY_ANDROID=your-android-restricted-key

OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL_SCHEDULING=gpt-4o
OPENAI_MODEL_PARSING=gpt-4o-mini

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

STRIPE_SECRET_KEY=sk_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Start development
npx expo start --dev-client
```

---

## Technology Decision Log

| Decision | Chosen | Alternative Considered | Reasoning |
|----------|--------|----------------------|-----------|
| Client framework | React Native + Expo | Flutter, Native | Shared codebase for 2 apps + web, large ecosystem, OTA updates |
| Backend | Supabase | Firebase, Custom Node | Real-time subscriptions built-in, PostgreSQL for complex queries, Edge Functions |
| Maps | Google Maps Platform | Mapbox, HERE | Best traffic data, most accurate routing, widest address coverage |
| AI | OpenAI API | Anthropic, Gemini | Best structured output, function calling for job parsing |
| Optimization | Google OR-Tools | OptaPlanner, custom | Open-source, proven VRP solver, Google-backed |
| SMS | Twilio | MessageBird, Vonage | Most reliable delivery, best developer experience |
| Payments | Stripe | Paddle, Chargebee | Best B2B subscription management, usage metering |
| State management | Zustand | Redux, MobX | Lightweight, works well with real-time updates |
| Navigation | Expo Router | React Navigation | File-based routing, type-safe, SSR-ready for web |

---

## Architecture Decision Records (ADRs)

### ADR-001: Mobile Framework -- React Native + Expo (Monorepo)

- **Context:** RouteAI requires two distinct apps (Dispatcher for office/tablet, Technician for field/phone) sharing a backend, types, and utilities. The Dispatcher app must also run as a web app for desktop use. Both apps need real-time updates, push notifications, and background GPS tracking. The team is 2-3 engineers targeting both platforms.
- **Decision:** React Native with Expo managed workflow in a monorepo structure (apps/dispatcher, apps/technician, packages/shared).
- **Consequences:**
  - Shared packages (types, Supabase client, utilities) eliminate duplication between the two apps.
  - Expo's web support enables the Dispatcher app to run in a browser for office desktop use without a separate codebase.
  - EAS Build handles native builds for both apps from one CI pipeline.
  - EAS Update enables OTA fixes to reach technicians in the field without app store delays.
  - expo-location provides background GPS tracking with proper permission handling.
  - Monorepo adds complexity to the build configuration but pays off immediately with shared code.
- **Alternatives Considered:**
  - **Flutter:** Strong cross-platform but no web support for the Dispatcher app without significant compromise; Dart ecosystem smaller for maps/GPS plugins.
  - **Native (Swift + Kotlin) + React web:** Best performance for each platform but 3 codebases, 5+ engineers required, 3x development cost.
  - **Single app with role-based UI:** Simpler to build but Dispatcher needs tablet-optimized layout (drag-drop schedule board) that differs fundamentally from Technician's phone-first design.

### ADR-002: Database -- Supabase (PostgreSQL + Real-Time)

- **Context:** RouteAI's core value proposition depends on real-time synchronization: when a dispatcher reassigns a job, the technician's app must update instantly. The system needs multi-tenant data isolation per company, complex relational queries (jobs by technician, routes by date, optimization history), and server-side functions for AI processing and notification dispatch.
- **Decision:** Supabase as the unified backend (PostgreSQL, Real-time, Auth, Edge Functions).
- **Consequences:**
  - Real-time subscriptions via WebSocket channels enable instant job updates, route changes, and technician location broadcasts.
  - PostgreSQL handles complex fleet queries (join jobs with technicians, routes, customers) efficiently.
  - Row Level Security provides multi-tenant isolation per company without custom middleware.
  - Edge Functions handle optimization triggers, job parsing, and SMS dispatch.
  - Single vendor for database, auth, real-time, and serverless reduces operational complexity.
  - Vendor dependency on Supabase, though PostgreSQL data is fully portable.
- **Alternatives Considered:**
  - **Firebase (Firestore):** Real-time is excellent but document model makes relational fleet queries (distance matrices, route histories) difficult and expensive.
  - **Custom Node.js + PostgreSQL + Socket.io:** Full control but 3-4 months additional backend development, dedicated DevOps hire.
  - **Hasura + PostgreSQL:** GraphQL subscriptions are powerful but adds another infrastructure layer, learning curve for the team.

### ADR-003: AI Model -- OpenAI GPT-4o + GPT-4o-mini

- **Context:** RouteAI uses AI for two distinct functions: (1) natural language job intake parsing (customer calls/texts to structured job objects) requiring fast, cheap inference, and (2) constraint-based schedule optimization (matching jobs to technicians considering skills, time windows, priority, workload balance) requiring complex reasoning.
- **Decision:** GPT-4o-mini for job intake parsing and re-optimization triggers; GPT-4o for schedule optimization and constraint reasoning.
- **Consequences:**
  - GPT-4o-mini processes job intake in < 2 seconds at $0.15/1M input tokens, keeping per-job AI cost under $0.01.
  - GPT-4o handles complex multi-constraint optimization with skill matching, time windows, and workload balancing.
  - Structured JSON output mode ensures reliable parsing for both use cases.
  - Two model tiers optimize cost: high-volume parsing on cheap model, low-volume optimization on powerful model.
  - Total AI cost per company averages $4/month (100 job parses + 30 optimizations), well within margins.
- **Alternatives Considered:**
  - **Claude (Anthropic):** Strong reasoning for optimization but less mature function calling and structured output at the time of evaluation.
  - **Google Gemini:** Good multimodal capabilities but less proven for structured job parsing with consistent schema adherence.
  - **Custom fine-tuned model:** Would reduce per-call cost but requires 6+ months of training data collection and ML engineering.

### ADR-004: Hosting -- Supabase Cloud + Vercel (Web Dashboard)

- **Context:** RouteAI needs low-latency API responses for real-time fleet tracking, reliable Edge Function execution for optimization triggers, and a web dashboard for the Dispatcher app's desktop version. The system must handle concurrent real-time connections from all technicians in a company's fleet.
- **Decision:** Supabase Cloud for backend (database, real-time, Edge Functions); Vercel for the web version of the Dispatcher app and marketing site.
- **Consequences:**
  - Supabase handles all real-time WebSocket connections (technician locations, job updates) at infrastructure level.
  - Edge Functions execute close to users for low-latency optimization triggers.
  - Vercel provides edge SSR for the web Dispatcher app with zero-config deployment.
  - Cost scales predictably: $25/mo Supabase Pro + $20/mo Vercel Pro at launch.
  - Limited to Supabase's available regions; mitigated by CDN caching for static assets.
- **Alternatives Considered:**
  - **AWS (ECS + RDS + API Gateway):** Full control but requires dedicated DevOps, 3-4 month setup, $3K+/mo baseline.
  - **Railway + PlanetScale:** Good DX but lacks built-in real-time subscriptions, would need Socket.io or Pusher.
  - **Fly.io:** Global edge deployment is attractive but more operational complexity for a small team.

### ADR-005: Authentication -- Supabase Auth with Email/Password + Magic Links

- **Context:** RouteAI serves two user personas with different auth needs: dispatchers (office workers who can handle standard login) and technicians (field workers who need quick access and may share devices). The system must support team invitations, role-based access (admin, dispatcher, technician), and multi-tenant company isolation.
- **Decision:** Supabase Auth with email/password as primary, magic link as fallback for technicians, team invite flow for company onboarding.
- **Consequences:**
  - Built-in role metadata in Supabase Auth JWT enables role-based UI and RLS policies.
  - Team invite flow (admin generates invite link) simplifies onboarding new technicians.
  - Magic links provide password-free access for technicians who struggle with credentials.
  - Long session durations (30-day refresh tokens) minimize re-authentication friction in the field.
  - SSO (SAML/OIDC) available for enterprise fleet companies on the Scale plan.
- **Alternatives Considered:**
  - **Auth0:** More features (MFA, adaptive auth) but $23/1000 MAU adds significant cost for large fleets (20+ technicians per company).
  - **Clerk:** Excellent DX and pre-built components but higher cost and less integrated with Supabase RLS.
  - **Firebase Auth:** Good integration if using Firebase, but we chose Supabase for the backend.

### ADR-006: State Management -- Zustand + TanStack Query

- **Context:** RouteAI needs to manage real-time fleet state (technician locations, job statuses, route updates) alongside local UI state (selected technician, map viewport, drag-drop schedule state). Both apps receive frequent real-time updates via WebSocket that must be reflected instantly in the UI. The Technician app also needs offline support for areas with poor connectivity.
- **Decision:** Zustand for client/UI state, TanStack Query for server state with real-time invalidation, custom hooks for Supabase real-time subscription management.
- **Consequences:**
  - Zustand stores ephemeral UI state (map viewport, selected items, drag state) with minimal re-renders.
  - TanStack Query caches server data (jobs, routes, customers) and supports background refetch on reconnection.
  - Real-time subscription callbacks invalidate TanStack Query caches for instant UI updates.
  - Offline persistence via TanStack Query's persistQueryClient keeps the technician's route accessible without network.
  - Clear separation of concerns: Zustand for "what the user is doing," TanStack Query for "what the server says."
- **Alternatives Considered:**
  - **Redux Toolkit + RTK Query:** More boilerplate, larger bundle, slower development iteration for a small team.
  - **MobX:** Observable-based reactivity is powerful but harder to debug real-time update flows.
  - **Zustand alone:** Could handle everything but reinventing server state caching and sync is wasteful when TanStack Query exists.

### ADR-007: Styling -- Tamagui

- **Context:** RouteAI's Dispatcher app runs on tablets and web with complex layouts (drag-drop schedule board, fleet map, analytics charts). The Technician app runs on phones with large touch targets for field use. The styling solution must handle responsive layouts across phone, tablet, and web while maintaining consistent design tokens.
- **Decision:** Tamagui for cross-platform styling with compile-time optimizations, shared design tokens across both apps.
- **Consequences:**
  - Compile-time CSS extraction reduces runtime styling overhead, critical for smooth drag-drop and map interactions.
  - Responsive props (`$sm`, `$md`, `$lg`) handle phone-to-tablet-to-web layouts without separate stylesheets.
  - Shared design tokens ensure visual consistency between Dispatcher and Technician apps.
  - Theme support enables white-label customization for enterprise fleet companies.
  - Steeper learning curve than NativeWind but better performance for complex layouts.
- **Alternatives Considered:**
  - **NativeWind (Tailwind CSS):** Faster to learn but runtime overhead for complex responsive layouts, less performant for drag-drop interactions.
  - **StyleSheet (built-in):** Zero dependency but verbose, no responsive utilities, slow to iterate across two apps.
  - **Styled Components:** Runtime overhead on mobile, no compile-time optimization, poor performance for real-time map updates.

---

## Performance Budgets

RouteAI operates in real-time fleet dispatch scenarios where delays directly impact customer satisfaction and technician productivity. Performance budgets are optimized for both the tablet-based Dispatcher and the phone-based Technician app.

| Metric | Budget | Measurement | Rationale |
|--------|--------|-------------|-----------|
| **Time to Interactive (TTI)** | < 3s | Measured on mid-range Android (Samsung Galaxy A54) on 4G | Technicians check route between jobs; must be instant |
| **iOS App Bundle Size** | < 50MB | IPA size after EAS Build | Keeps download fast; avoids iOS cellular download limit |
| **Android App Bundle Size** | < 30MB | AAB size after EAS Build | Many technician devices are budget Android phones with limited storage |
| **JavaScript Bundle Size** | < 15MB | Hermes bytecode bundle (per app) | Keeps cold start fast; reduces OTA update download time over cellular |
| **Frame Rate** | 60fps | Map rendering, schedule board drag-drop, route list scrolling | Smooth map panning and drag-drop are core UX requirements |
| **Cold Start Time** | < 2s | App launch to interactive route list (Technician) or fleet map (Dispatcher) | Technicians open the app frequently between stops |
| **API Response Time (p95)** | < 500ms | Supabase REST queries, Edge Function responses | Job updates and route queries must feel instantaneous |
| **Offline Sync Time** | < 5s | Time to sync pending job status updates when connectivity returns | Technician enters coverage area; pending updates must push immediately |
| **Peak Memory Usage** | < 300MB | During fleet map with 50+ technician markers and route polylines | Dispatcher map with full fleet view is the most memory-intensive screen |
| **Real-Time Update Latency** | < 1s | Time from dispatcher action to technician app update | Job reassignment must appear instantly on technician's device |
| **Route Optimization Time** | < 30s | Full daily optimization for 20 technicians, 100 jobs | Dispatcher clicks "Optimize" and sees results within half a minute |
| **Distance Matrix API Latency** | < 10s | Google Maps Distance Matrix for 25x25 location grid | Blocking step before VRP solve; must complete quickly |
| **GPS Location Update** | Every 30s | Background location broadcast frequency | Balances battery life with fleet visibility accuracy |
| **Map Tile Load Time** | < 2s | Google Maps tiles fully rendered on viewport change | Smooth map experience for dispatcher fleet overview |

---

## Environment Variable Catalog

All environment variables required to run RouteAI. Variables are grouped by service. Both the Dispatcher and Technician apps share the same Supabase backend.

| Variable | Description | Required | Example | Where to Get It |
|----------|-------------|----------|---------|-----------------|
| `SUPABASE_URL` | Supabase project API URL (used by both apps) | Required | `https://abcdefg.supabase.co` | Supabase Dashboard > Project Settings > API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key (safe for client) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for admin operations (Edge Functions only -- never expose to client) | Required | `eyJhbGciOiJIUzI1NiIs...` | Supabase Dashboard > Project Settings > API > service_role secret |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string for migrations and admin scripts | Required (dev) | `postgresql://postgres:pass@db.abcdefg.supabase.co:5432/postgres` | Supabase Dashboard > Project Settings > Database |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key for server-side Distance Matrix and Directions (Edge Functions) | Required | `AIzaSyAbc123...` | Google Cloud Console > APIs & Services > Credentials |
| `GOOGLE_MAPS_API_KEY_IOS` | iOS-restricted Google Maps API key for Maps SDK | Required | `AIzaSyDef456...` | Google Cloud Console > Credentials (restrict to iOS bundle ID) |
| `GOOGLE_MAPS_API_KEY_ANDROID` | Android-restricted Google Maps API key for Maps SDK | Required | `AIzaSyGhi789...` | Google Cloud Console > Credentials (restrict to Android package + SHA-1) |
| `GOOGLE_MAPS_API_KEY_WEB` | Web-restricted Google Maps API key for Dispatcher web app | Required | `AIzaSyJkl012...` | Google Cloud Console > Credentials (restrict to web domain) |
| `OPENAI_API_KEY` | OpenAI API key for job parsing and schedule optimization (Edge Functions only) | Required | `OPENAI_API_KEY_PLACEHOLDER` | OpenAI Platform > API Keys |
| `OPENAI_ORG_ID` | OpenAI organization ID for billing tracking | Optional | `org-abc123` | OpenAI Platform > Settings > Organization |
| `OPENAI_MODEL_SCHEDULING` | Model ID for schedule optimization | Optional | `gpt-4o` | Default: gpt-4o |
| `OPENAI_MODEL_PARSING` | Model ID for job intake parsing | Optional | `gpt-4o-mini` | Default: gpt-4o-mini |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS notifications (Edge Functions only) | Required | `AC1234567890abcdef...` | Twilio Console > Account > Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token for SMS API access | Required | `your_auth_token_here` | Twilio Console > Account > Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS (E.164 format) | Required | `+14155551234` | Twilio Console > Phone Numbers > Active Numbers |
| `STRIPE_SECRET_KEY` | Stripe secret key for subscription management (Edge Functions only) | Required | `STRIPE_LIVE_SECRET_PLACEHOLDER` | Stripe Dashboard > Developers > API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side payment UI | Required | `STRIPE_LIVE_PUBLIC_PLACEHOLDER` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for verifying events | Required | `whsec_abc123...` | Stripe Dashboard > Developers > Webhooks |
| `SENTRY_DSN` | Sentry DSN for crash reporting (shared across both apps) | Required | `https://abc@o123.ingest.sentry.io/456` | Sentry > Project Settings > Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads during CI | Required (CI) | `sntrys_abc123...` | Sentry > Settings > Auth Tokens |
| `POSTHOG_API_KEY` | PostHog project API key for analytics | Optional | `phc_abc123...` | PostHog > Project Settings |
| `EAS_PROJECT_ID_DISPATCHER` | Expo EAS project ID for the Dispatcher app | Required (CI) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Expo Dashboard > Dispatcher Project |
| `EAS_PROJECT_ID_TECHNICIAN` | Expo EAS project ID for the Technician app | Required (CI) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Expo Dashboard > Technician Project |

**Notes:**
- Google Maps API keys should be platform-restricted (iOS bundle ID, Android package + SHA-1, web domain) to prevent unauthorized usage.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `TWILIO_AUTH_TOKEN`, and `STRIPE_SECRET_KEY` are server-only secrets used exclusively in Edge Functions.
- For local development, use Supabase CLI local keys and Stripe/Twilio test credentials.
- Each B2B company tenant shares the same infrastructure; tenant isolation is handled by RLS, not separate environments.

---

## Local Development Setup

Complete guide to get RouteAI running on a clean machine. Both the Dispatcher and Technician apps are developed from the same monorepo.

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | >= 18.0 | `brew install node` or https://nodejs.org |
| **npm** | >= 9.0 | Bundled with Node.js |
| **Expo CLI** | Latest | Used via `npx expo` (no global install needed) |
| **Supabase CLI** | >= 1.100 | `brew install supabase/tap/supabase` |
| **Docker Desktop** | Latest | Required for Supabase local dev (https://docker.com) |
| **Xcode** | >= 15.0 | Mac App Store (iOS Simulator for Technician app) |
| **Android Studio** | Latest | https://developer.android.com/studio (Android Emulator) |
| **Git** | >= 2.40 | `brew install git` |
| **Watchman** | Latest | `brew install watchman` |
| **Google Maps API Key** | N/A | Free tier available at https://console.cloud.google.com (enable Maps SDK, Directions, Distance Matrix, Geocoding, Places) |

### Step 1: Clone the Monorepo

```bash
git clone https://github.com/routeai/platform.git
cd platform
```

### Step 2: Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

The monorepo structure installs dependencies for both apps and all shared packages.

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with the required values. For local development you need:
- Supabase local keys (provided by `supabase start`)
- A Google Maps API key (free tier, enable required APIs in Google Cloud Console)
- An OpenAI API key for testing job parsing and optimization
- Twilio test credentials (`TWILIO_TEST_*`) for SMS testing without sending real messages
- Stripe test keys (`sk_test_*`, `pk_test_*`) for billing feature development

### Step 4: Start Supabase Locally

```bash
# Ensure Docker Desktop is running
supabase start
```

Note the local API URL and keys output by the CLI. Update `.env.local` with these values.

### Step 5: Run Database Migrations and Seed Data

```bash
# Apply all migrations
supabase db push

# Seed with sample company, technicians, jobs, and customers
supabase db seed
```

The seed data creates a sample HVAC company with 5 technicians, 25 jobs, and 15 customers for development.

### Step 6: Start Edge Functions

```bash
supabase functions serve
```

This starts the optimization, job parsing, notification, and billing Edge Functions locally.

### Step 7: Start the Dispatcher App

```bash
# In a new terminal
cd apps/dispatcher
npx expo start
```

- Press `w` to open in web browser (primary Dispatcher interface)
- Press `i` for iOS Simulator (tablet layout)
- Press `a` for Android Emulator

### Step 8: Start the Technician App

```bash
# In another terminal
cd apps/technician
npx expo start --port 8082
```

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go on a physical device for GPS testing

### Step 9: Verify the Setup

1. **Dispatcher App:** Open the web version, verify the fleet map loads with sample technician markers
2. **Technician App:** Open on simulator/device, verify today's route loads with sample jobs
3. **Real-time sync:** Mark a job as "en_route" in the Technician app, verify the Dispatcher map updates instantly
4. **Optimization:** Click "Optimize Routes" in the Dispatcher app, verify OR-Tools solver returns results
5. **Job parsing:** Create a job via natural language input in the Dispatcher app, verify AI parses it correctly

### Running Tests

```bash
# All tests from monorepo root
npm test

# Dispatcher app tests only
npm test --workspace=apps/dispatcher

# Technician app tests only
npm test --workspace=apps/technician

# Shared package tests
npm test --workspace=packages/shared
npm test --workspace=packages/optimization

# Type checking across all workspaces
npx tsc --noEmit --project tsconfig.json

# Lint all workspaces
npx eslint . --ext .ts,.tsx

# E2E tests (requires running simulators)
npm run test:e2e --workspace=apps/technician
npm run test:e2e --workspace=apps/dispatcher
```

### Team Onboarding for B2B Development

When onboarding a new developer to the RouteAI team:

1. Grant access to the Supabase project (Dashboard > Team) with appropriate role (admin for backend, developer for frontend)
2. Grant access to both Expo EAS projects (Dispatcher and Technician) via Expo Dashboard
3. Share `.env.local` values via a secure secrets manager (1Password, Doppler, or Vault)
4. Ensure they set up platform-restricted Google Maps API keys for their local environment
5. Provide Twilio test credentials (never share production SMS credentials)
6. Add them to the Sentry project for error monitoring
7. Walk through the monorepo structure: `apps/`, `packages/shared`, `packages/optimization`, `packages/ai`
8. Assign a sample company in the seed data for their development and testing
