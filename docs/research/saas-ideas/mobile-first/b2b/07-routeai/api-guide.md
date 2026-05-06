# RouteAI — API Guide

## Overview

RouteAI integrates with six external services. Google Maps Platform provides the routing and mapping foundation. OpenAI powers the AI job intake and scheduling assistance. Google OR-Tools handles the mathematical route optimization. Twilio delivers customer SMS notifications. Supabase provides the real-time backend. Stripe manages subscription billing.

This guide covers setup, usage patterns, cost projections, and alternatives for each integration.

---

## 1. Google Maps Platform

Google Maps Platform is the most critical external dependency. It provides the data layer (travel times, routes, addresses) that the optimization engine depends on.

### APIs Used

#### Directions API

**Purpose:** Calculate the optimal route between two or more points, including turn-by-turn navigation data and route polylines for map display.

**Usage in RouteAI:**
- Calculate the driving route for each segment of a technician's daily route
- Get encoded polyline geometry for rendering routes on the fleet map
- Obtain estimated travel times with real-time traffic consideration
- Generate step-by-step navigation instructions for the technician app

**Request Example:**
```typescript
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

async function getRoute(origin: LatLng, destination: LatLng, waypoints?: LatLng[]) {
    const response = await mapsClient.directions({
        params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            waypoints: waypoints?.map(w => `${w.lat},${w.lng}`),
            optimize: false, // We handle optimization ourselves via OR-Tools
            departure_time: 'now',
            traffic_model: 'best_guess',
            key: process.env.GOOGLE_MAPS_API_KEY
        }
    });

    return {
        polyline: response.data.routes[0].overview_polyline.points,
        duration: response.data.routes[0].legs.reduce(
            (sum, leg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0
        ),
        distance: response.data.routes[0].legs.reduce(
            (sum, leg) => sum + leg.distance.value, 0
        ),
        steps: response.data.routes[0].legs.flatMap(leg => leg.steps)
    };
}
```

**Pricing:** $5.00 per 1,000 requests (with traffic: $10.00 per 1,000)

**Optimization Tips:**
- Cache route calculations for the same origin/destination pair within a 15-minute window
- Use the `overview_polyline` for map display instead of requesting detailed step geometry
- Batch waypoints (up to 25 per request) to reduce API calls when calculating a full technician route
- Use `departure_time` for morning planning, omit for rough estimates (cheaper)

---

#### Distance Matrix API

**Purpose:** Compute travel times and distances between every pair of locations in a set. This is the input data for the VRP solver.

**Usage in RouteAI:**
- Before daily optimization: build an NxN matrix of travel times between all job locations + technician starting positions
- Before re-optimization: build a partial matrix for affected technicians and remaining jobs
- Used to calculate ETAs when a technician starts driving to the next job

**Request Example:**
```typescript
async function buildDistanceMatrix(locations: LatLng[]): Promise<{
    durations: number[][];  // seconds
    distances: number[][];  // meters
}> {
    const BATCH_SIZE = 25; // Max 25 origins OR 25 destinations per request
    const n = locations.length;
    const durations: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const distances: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    // Batch origins (rows of the matrix)
    for (let i = 0; i < n; i += BATCH_SIZE) {
        const originBatch = locations.slice(i, Math.min(i + BATCH_SIZE, n));

        const response = await mapsClient.distancematrix({
            params: {
                origins: originBatch.map(l => `${l.lat},${l.lng}`),
                destinations: locations.map(l => `${l.lat},${l.lng}`),
                mode: 'driving',
                departure_time: 'now',
                traffic_model: 'best_guess',
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        response.data.rows.forEach((row, rowIdx) => {
            row.elements.forEach((element, colIdx) => {
                const globalRow = i + rowIdx;
                durations[globalRow][colIdx] =
                    element.duration_in_traffic?.value || element.duration.value;
                distances[globalRow][colIdx] = element.distance.value;
            });
        });
    }

    return { durations, distances };
}

// Example: 20 locations (15 jobs + 5 technician starts)
// = 20 x 20 = 400 elements
// = 1 request (20 origins x 20 destinations, under 25 limit)
// Cost: 400 elements x $0.005 = $2.00

// Example: 80 locations (60 jobs + 20 technician starts)
// = 80 x 80 = 6,400 elements
// = 4 requests (20 origins each x 80 destinations)
// Cost: 6,400 elements x $0.005 = $32.00
```

**Pricing:** $5.00 per 1,000 elements (origin-destination pairs). With traffic data: $10.00 per 1,000 elements.

**Cost Alert:** This is the most expensive API for RouteAI at scale. A company with 20 technicians and 80 jobs needs a 100x100 matrix = 10,000 elements = $50-100 per full optimization run.

**Optimization Tips:**
- Cache the distance matrix for the day. Only recompute affected rows/columns during re-optimization.
- Use Euclidean distance as a first approximation, then only call the Distance Matrix API for the top candidate assignments.
- Consider building a local travel time model for common routes based on historical data, reducing API dependency over time.
- For companies with fixed service areas, pre-compute a zone-to-zone travel time table that rarely changes.

---

#### Geocoding API

**Purpose:** Convert street addresses to latitude/longitude coordinates and vice versa.

**Usage in RouteAI:**
- When a new job is created: convert the customer address to lat/lng for map placement and optimization
- When AI parses a job intake: validate and geocode the extracted address
- Reverse geocoding: convert technician GPS coordinates to a human-readable address for status updates
- Address validation: confirm that an entered address is a real, deliverable location

**Request Example:**
```typescript
async function geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
    placeId: string;
} | null> {
    const response = await mapsClient.geocode({
        params: {
            address,
            components: { country: 'US' }, // Bias to US addresses
            key: process.env.GOOGLE_MAPS_API_KEY
        }
    });

    if (response.data.results.length === 0) {
        return null; // Address not found
    }

    const result = response.data.results[0];
    return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
    };
}

// Address autocomplete for job creation forms
async function addressAutocomplete(input: string, sessionToken: string) {
    const response = await mapsClient.placeAutocomplete({
        params: {
            input,
            sessiontoken: sessionToken, // Session tokens reduce cost
            types: 'address',
            components: { country: 'us' },
            key: process.env.GOOGLE_MAPS_API_KEY
        }
    });

    return response.data.predictions.map(p => ({
        description: p.description,
        placeId: p.place_id
    }));
}
```

**Pricing:** $5.00 per 1,000 requests. Places Autocomplete: $2.83 per session (with session tokens).

---

#### Maps JavaScript SDK / Maps SDK for React Native

**Purpose:** Render interactive maps in both the dispatcher app (web/tablet) and technician app (mobile).

**Usage in RouteAI:**
- Dispatcher fleet map: all technician routes, job markers, real-time positions
- Dispatcher route detail: individual technician route with turn-by-turn detail
- Technician navigation preview: next job on a map with route preview

**Implementation:**
```typescript
// React Native (Technician App)
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

function FleetMap({ technicians, routes }: FleetMapProps) {
    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            customMapStyle={SMART_DISPATCH_MAP_STYLE}
            showsTraffic={showTraffic}
            initialRegion={companyServiceArea}
        >
            {technicians.map(tech => (
                <Marker
                    key={tech.id}
                    coordinate={{ latitude: tech.lat, longitude: tech.lng }}
                    title={tech.name}
                    description={tech.status}
                >
                    <TechnicianAvatarMarker
                        name={tech.name}
                        photo={tech.photo}
                        status={tech.status}
                    />
                </Marker>
            ))}

            {routes.map(route => (
                <Polyline
                    key={route.technicianId}
                    coordinates={decodePolyline(route.polyline)}
                    strokeColor={route.color}
                    strokeWidth={4}
                />
            ))}
        </MapView>
    );
}
```

**Pricing:**
- Maps JavaScript API: $7.00 per 1,000 loads (web dispatcher app)
- Maps SDK for Android/iOS: free (included with other API usage)
- Dynamic Maps (with markers, routes): $7.00 per 1,000 loads

**Custom Map Style:**
RouteAI uses a custom Google Maps style to desaturate the base map and make route lines and markers stand out. This is defined as a JSON style array:

```json
[
    { "featureType": "all", "elementType": "geometry", "stylers": [{ "saturation": -40 }] },
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748B" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#E2E8F0" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#CBD5E1" }] },
    { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#DBEAFE" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
]
```

### Google Maps Setup

**1. Create a Google Cloud Project:**
```
1. Go to https://console.cloud.google.com
2. Create a new project: "RouteAI Production"
3. Enable billing (required for Maps APIs)
```

**2. Enable Required APIs:**
```
- Directions API
- Distance Matrix API
- Geocoding API
- Places API
- Maps JavaScript API
- Maps SDK for Android
- Maps SDK for iOS
```

**3. Create API Keys:**

Create separate API keys for different contexts with appropriate restrictions:

| Key | Restriction | Usage |
|-----|------------|-------|
| Server key | IP restriction (your server IPs) | Distance Matrix, Directions, Geocoding (server-side) |
| Web key | HTTP referrer restriction (yourdomain.com/*) | Maps JavaScript API (dispatcher web app) |
| iOS key | iOS bundle ID restriction | Maps SDK for iOS (technician app) |
| Android key | Android package + fingerprint | Maps SDK for Android (technician app) |

**4. Set Budget Alerts:**
```
Google Cloud Console → Billing → Budgets & Alerts
- Set monthly budget: $500 initially
- Alert at 50%, 80%, 100%
- Enable automatic shutdown at budget limit (optional, careful with production)
```

### Google Maps Alternatives

| Alternative | Pros | Cons | When to Consider |
|------------|------|------|-----------------|
| **Mapbox** | Cheaper at high volume ($0.60/1K map loads vs $7), better map customization, vector tiles, offline maps | Less accurate traffic data, smaller address database, routing less reliable in suburban areas | When scaling past 500+ companies and Maps costs become significant |
| **HERE** | Excellent routing APIs, strong in Europe, competitive pricing, fleet management features built-in | Smaller developer community, fewer tutorials, less React Native support | When expanding to European markets |
| **OSRM** | Free (open source), self-hosted, no per-request costs, good for development/testing | No real-time traffic data, requires server infrastructure, address data is OpenStreetMap quality | For development/testing to avoid API costs. Not recommended for production routing. |
| **Valhalla** | Free (open source), turn-by-turn routing, time-dependent routing | Self-hosted complexity, no traffic data, smaller community than OSRM | If building a hybrid approach with cached routes |

**Recommended Migration Path:**
1. Start with Google Maps (best data quality, fastest to ship)
2. Monitor costs monthly per company
3. At 500+ companies, evaluate Mapbox for map rendering (keep Google for routing/geocoding)
4. At 1,000+ companies, build a hybrid: Google for real-time traffic-aware routing, self-hosted OSRM for rough estimates and development

---

## 2. OpenAI API

### Schedule Optimization (Constraint Reasoning)

**Purpose:** Assign jobs to technicians based on complex, interrelated constraints that mathematical solvers cannot handle well (soft preferences, context-dependent rules, natural language business logic).

**Model:** GPT-4o (complex reasoning required)

**Token Usage Per Optimization:**
- System prompt: ~500 tokens
- Technician data (20 techs): ~1,000 tokens
- Job data (50 jobs): ~2,500 tokens
- Response (assignments + reasoning): ~2,000 tokens
- Total per optimization: ~6,000 tokens
- At GPT-4o pricing ($2.50/1M input, $10.00/1M output): ~$0.03 per optimization

**Implementation:**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function optimizeSchedule(
    technicians: Technician[],
    jobs: Job[],
    constraints: CompanyConstraints
): Promise<ScheduleAssignment[]> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are an expert field service dispatcher. Assign jobs to technicians optimally.

Rules:
1. Match technician skills to job requirements (HARD - never violate)
2. Respect customer time windows (HARD - never violate)
3. Respect technician shift hours (HARD - never violate)
4. Minimize total fleet drive time (OPTIMIZE)
5. Balance workload across technicians (SOFT - within 20% of mean)
6. Prefer technicians who have served this customer before (SOFT)
7. Emergency jobs get priority scheduling (HARD)
8. Allow 15-minute buffer between jobs (HARD)

Company-specific rules:
${constraints.customRules.join('\n')}

Return a JSON object with:
{
    "assignments": [
        {
            "technician_id": "uuid",
            "job_ids": ["uuid1", "uuid2"],
            "reasoning": "Why this technician for these jobs"
        }
    ],
    "unassignable_jobs": [
        {
            "job_id": "uuid",
            "reason": "No technician with required skills available"
        }
    ]
}`
            },
            {
                role: 'user',
                content: JSON.stringify({
                    technicians: technicians.map(t => ({
                        id: t.id,
                        name: t.name,
                        skills: t.skills,
                        shift: { start: t.shiftStart, end: t.shiftEnd },
                        home_location: { lat: t.homeLat, lng: t.homeLng },
                        max_jobs: constraints.maxJobsPerTech
                    })),
                    jobs: jobs.map(j => ({
                        id: j.id,
                        title: j.title,
                        type: j.jobType,
                        required_skills: j.requiredSkills,
                        priority: j.priority,
                        location: { lat: j.lat, lng: j.lng, address: j.address },
                        time_window: { start: j.timeWindowStart, end: j.timeWindowEnd },
                        duration_minutes: j.estimatedDurationMinutes,
                        preferred_technician: j.preferredTechnicianId
                    }))
                })
            }
        ],
        temperature: 0.2, // Low temperature for consistent, logical assignments
        max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.assignments;
}
```

---

### Natural Language Job Intake

**Purpose:** Parse unstructured customer communications (call transcripts, text messages, emails) into structured job objects.

**Model:** GPT-4o-mini (fast, cheap, structured output)

**Token Usage Per Parse:**
- System prompt: ~400 tokens
- Customer message: ~50-200 tokens
- Response: ~200-400 tokens
- Total per parse: ~800 tokens
- At GPT-4o-mini pricing ($0.15/1M input, $0.60/1M output): ~$0.0004 per parse

**Implementation:**

```typescript
async function parseJobIntake(
    customerMessage: string,
    companyContext: CompanyContext
): Promise<ParsedJob> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are a job intake specialist for ${companyContext.companyName},
a ${companyContext.industry} company.

Parse the customer request into a structured job.
Available job types: ${companyContext.jobTypes.join(', ')}
Available skills: ${companyContext.skillTaxonomy.join(', ')}

Return JSON:
{
    "title": "Short descriptive title",
    "description": "Detailed description of the issue",
    "job_type": "repair|install|maintenance|inspection|emergency",
    "priority": "low|normal|high|emergency",
    "required_skills": ["skill1", "skill2"],
    "estimated_duration_minutes": 60,
    "preferred_time_window": {"start": "HH:MM", "end": "HH:MM"} or null,
    "address": "Extracted address" or null,
    "special_instructions": "Any special notes" or null,
    "confidence": 0.0-1.0
}`
            },
            {
                role: 'user',
                content: customerMessage
            }
        ],
        temperature: 0.1, // Very low temp for consistent parsing
        max_tokens: 500
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Validate with Zod schema
    const validated = ParsedJobSchema.parse(parsed);

    // If confidence < 0.7, flag for dispatcher review
    if (validated.confidence < 0.7) {
        validated.requiresReview = true;
    }

    return validated;
}
```

### OpenAI Setup

```bash
# 1. Create an OpenAI API account at https://platform.openai.com

# 2. Generate an API key
#    Settings → API Keys → Create new secret key
#    Name: "RouteAI Production"

# 3. Set usage limits
#    Settings → Limits → Set monthly budget ($50 initially)

# 4. Store the key securely
OPENAI_API_KEY=OPENAI_API_KEY_PLACEHOLDER
```

### OpenAI Cost Projections

| Usage | Per Company/Month | 100 Companies | 500 Companies | 2,000 Companies |
|-------|-------------------|---------------|---------------|-----------------|
| Job intake parsing (50 jobs/day) | $0.60 | $60 | $300 | $1,200 |
| Schedule optimization (1-2/day) | $1.80 | $180 | $900 | $3,600 |
| Re-optimization (3-5/day) | $1.50 | $150 | $750 | $3,000 |
| **Total** | **$3.90** | **$390** | **$1,950** | **$7,800** |

---

## 3. Google OR-Tools

### Overview

Google OR-Tools is an open-source combinatorial optimization library. RouteAI uses it to solve the Vehicle Routing Problem with Time Windows (VRPTW) — finding the optimal order of job visits for each technician to minimize total drive time.

**Key Advantage:** OR-Tools is free and open-source. There are no per-request costs. The only cost is compute time in the serverless environment.

### Setup for Node.js

OR-Tools is primarily a C++ library with official bindings for Python, Java, and C#. For Node.js, there are several options:

**Option A: WASM Build (Recommended for Serverless)**
```bash
# Use a community WASM build of OR-Tools
npm install or-tools-wasm

# Or build from source using Emscripten
# (Complex but gives full control)
```

**Option B: Python Microservice**
```bash
# Run OR-Tools via a Python microservice that the Node.js backend calls
pip install ortools

# Deploy as a separate Cloud Run / Cloud Function
# Node.js Edge Function calls Python service via HTTP
```

**Option C: Native Node.js Addon**
```bash
# Use node-gyp to build native bindings
# Best performance but hardest to deploy in serverless
npm install @anthropic/node-ortools  # hypothetical package
```

**Recommended Approach:** Start with Option B (Python microservice) for fastest development, then migrate to Option A (WASM) for better serverless integration.

### VRP Problem Formulation

```python
# Python OR-Tools implementation (microservice)
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

def solve_vrp(
    distance_matrix: list[list[int]],  # Travel times in seconds
    time_windows: list[tuple[int, int]],  # (earliest, latest) arrival in seconds from midnight
    service_times: list[int],  # Time spent at each location in seconds
    num_vehicles: int,  # Number of technicians
    depot: int,  # Index of depot (or per-vehicle start locations)
    vehicle_start_indices: list[int],  # Per-technician start locations
    vehicle_end_indices: list[int],  # Per-technician end locations (home)
    max_route_duration: int = 28800,  # 8 hours in seconds
    solve_time_limit: int = 15  # Max seconds to solve
):
    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix),  # Number of locations
        num_vehicles,
        vehicle_start_indices,
        vehicle_end_indices
    )

    # Create the routing model
    routing = pywrapcp.RoutingModel(manager)

    # Define transit callback (travel time between locations)
    def transit_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node] + service_times[from_node]

    transit_callback_index = routing.RegisterTransitCallback(transit_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add time window constraints
    routing.AddDimension(
        transit_callback_index,
        1800,  # Allow 30 min of waiting time (slack)
        max_route_duration,  # Max route duration
        False,  # Don't force start cumul to zero
        'Time'
    )
    time_dimension = routing.GetDimensionOrDie('Time')

    for location_idx in range(len(time_windows)):
        if location_idx in vehicle_start_indices:
            continue
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(
            time_windows[location_idx][0],
            time_windows[location_idx][1]
        )

    # Minimize waiting time at each node
    for i in range(num_vehicles):
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.Start(i))
        )
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.End(i))
        )

    # Set search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = solve_time_limit

    # Solve
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return None  # No feasible solution found

    # Extract solution
    routes = []
    for vehicle_id in range(num_vehicles):
        route = []
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            time_var = time_dimension.CumulVar(index)
            route.append({
                'location_index': node,
                'arrival_time': solution.Value(time_var),
            })
            index = solution.Value(routing.NextVar(index))

        routes.append({
            'vehicle_id': vehicle_id,
            'stops': route,
            'total_time': solution.Value(time_dimension.CumulVar(
                routing.End(vehicle_id)
            ))
        })

    return {
        'routes': routes,
        'total_cost': solution.ObjectiveValue(),
        'status': 'optimal' if routing.status() == 1 else 'feasible'
    }
```

### Performance Benchmarks

| Problem Size | Techs | Jobs | Matrix Size | Solve Time (15s limit) | Solution Quality |
|-------------|-------|------|------------|----------------------|-----------------|
| Small | 5 | 20 | 25x25 | < 1 second | Optimal |
| Medium | 15 | 60 | 75x75 | 3-5 seconds | Near-optimal |
| Large | 30 | 120 | 150x150 | 10-15 seconds | Good feasible |
| Very Large | 50 | 200 | 250x250 | 15 seconds (limit) | Feasible |

For RouteAI's target market (5-50 technicians), solve times are well within acceptable limits.

---

## 4. Twilio

### Customer SMS Notifications

**Purpose:** Send automated SMS notifications to customers at key points in the job lifecycle: appointment confirmation, technician en route, ETA update, and job completion.

### Setup

```bash
# 1. Create a Twilio account at https://www.twilio.com

# 2. Get your Account SID and Auth Token from the Twilio Console

# 3. Purchase a phone number (or use a toll-free number)
#    - Local number: $1.00/month + $0.0079/SMS
#    - Toll-free: $2.00/month + $0.0079/SMS

# 4. Register for A2P 10DLC (required for US SMS at scale)
#    - Brand registration: one-time $4
#    - Campaign registration: $15/month
#    - Required for sending SMS from local numbers at volume

# 5. Store credentials
TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID_PLACEHOLDER
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

### Implementation

```typescript
import twilio from 'twilio';

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Notification templates
const TEMPLATES = {
    appointment_confirmed: (data: AppointmentData) =>
        `Hi ${data.customerName}, your ${data.jobType} appointment is confirmed for ` +
        `${data.date} between ${data.windowStart}-${data.windowEnd}. ` +
        `Your technician: ${data.techName}. Reply C to confirm or call to reschedule.`,

    tech_en_route: (data: EnRouteData) =>
        `${data.techName} is on the way to ${data.address}! ` +
        `ETA: ${data.eta}. Track: ${data.trackingUrl}`,

    eta_update: (data: ETAUpdateData) =>
        `Updated arrival time for your ${data.jobType}: ${data.newEta}. ` +
        `Apologies for the change. ${data.techName} is on the way.`,

    job_completed: (data: CompletionData) =>
        `Your ${data.jobType} is complete. ${data.techName} has finished. ` +
        `How was your experience? Reply 1-5 (5=excellent).`,

    reschedule: (data: RescheduleData) =>
        `Your ${data.jobType} on ${data.originalDate} needs to be rescheduled. ` +
        `We'll contact you shortly to find a new time. Sorry for the inconvenience.`
};

// Send notification
async function sendCustomerNotification(
    type: keyof typeof TEMPLATES,
    data: any,
    customerPhone: string,
    jobId: string
): Promise<NotificationResult> {
    // Check customer opt-in
    const customer = await supabase
        .from('customers')
        .select('notification_opt_in')
        .eq('phone', customerPhone)
        .single();

    if (!customer.data?.notification_opt_in) {
        return { sent: false, reason: 'customer_opted_out' };
    }

    // Check business hours (don't send SMS before 8 AM or after 8 PM)
    const hour = new Date().getHours();
    if (hour < 8 || hour >= 20) {
        // Queue for 8 AM tomorrow
        await queueNotification(type, data, customerPhone, jobId);
        return { sent: false, reason: 'outside_business_hours', queued: true };
    }

    // Send SMS
    const message = await twilioClient.messages.create({
        body: TEMPLATES[type](data),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customerPhone,
        statusCallback: `${process.env.API_URL}/webhooks/twilio/status`
    });

    // Log notification
    await supabase.from('notifications').insert({
        job_id: jobId,
        customer_id: data.customerId,
        type,
        channel: 'sms',
        message: TEMPLATES[type](data),
        twilio_sid: message.sid,
        sent_at: new Date().toISOString()
    });

    return { sent: true, sid: message.sid };
}
```

### Handling Incoming SMS (Two-Way)

```typescript
// Webhook endpoint for incoming SMS
app.post('/webhooks/twilio/incoming', async (req, res) => {
    const { Body, From } = req.body;
    const message = Body.trim().toUpperCase();

    // Find the most recent job notification for this phone number
    const recentNotification = await findRecentNotification(From);

    if (!recentNotification) {
        // Unknown sender or no recent interaction
        return res.send('<Response></Response>');
    }

    if (message === 'C' || message === 'CONFIRM') {
        await confirmAppointment(recentNotification.job_id);
        await twilioClient.messages.create({
            body: 'Great! Your appointment is confirmed. We\'ll text you when your technician is on the way.',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: From
        });
    } else if (message === 'STOP') {
        await optOutCustomer(From);
        // Twilio handles STOP automatically, but we also update our records
    } else if (['1', '2', '3', '4', '5'].includes(message)) {
        await recordSatisfactionRating(recentNotification.job_id, parseInt(message));
        await twilioClient.messages.create({
            body: 'Thank you for your feedback!',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: From
        });
    }

    res.send('<Response></Response>');
});
```

### Twilio Pricing

| Item | Cost |
|------|------|
| SMS (outbound, US) | $0.0079 per segment |
| SMS (inbound, US) | $0.0079 per segment |
| Phone number (local) | $1.00/month |
| Phone number (toll-free) | $2.00/month |
| A2P 10DLC brand registration | $4 one-time |
| A2P 10DLC campaign | $15/month |

**Per Company Cost Estimate (15 technicians, 50 jobs/day):**
- Appointment confirmations: 50/day x 30 = 1,500 SMS
- En route notifications: 50/day x 30 = 1,500 SMS
- Completion notifications: 50/day x 30 = 1,500 SMS
- ETA updates (10% of jobs): 150 SMS
- Customer replies: ~500 SMS
- **Total: ~5,150 SMS/month = $40.69/month**

For the average company on the Growth plan ($249/month), SMS costs are ~16% of revenue per company. This is included in the subscription cost — RouteAI absorbs it.

---

## 5. Supabase

### Real-Time Subscriptions

**Purpose:** Instant synchronization between the dispatcher app and technician apps. When a dispatcher changes a schedule, the technician sees it immediately. When a technician completes a job, the dashboard updates.

### Setup

```bash
# 1. Create a Supabase project at https://supabase.com

# 2. Choose the Pro plan ($25/month) for production
#    - Includes 500 MB database, 5 GB bandwidth
#    - Real-time connections: 200 concurrent (sufficient for ~50 companies)

# 3. Get project credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# 4. Apply database migrations
npx supabase db push

# 5. Deploy Edge Functions
npx supabase functions deploy optimize-routes
npx supabase functions deploy parse-job-intake
npx supabase functions deploy send-notification
```

### Real-Time Channel Architecture

```typescript
// Channel structure for multi-tenant real-time
const CHANNEL_PATTERNS = {
    // Company-wide job updates (dispatcher subscribes)
    companyJobs: (companyId: string) => `company:${companyId}:jobs`,

    // Technician-specific route updates (technician subscribes)
    technicianRoute: (techId: string) => `technician:${techId}:route`,

    // Fleet location broadcast (dispatcher subscribes, technicians publish)
    fleetLocations: (companyId: string) => `company:${companyId}:locations`,

    // Optimization events (dispatcher subscribes)
    optimizationEvents: (companyId: string) => `company:${companyId}:optimization`,

    // Alerts (dispatcher subscribes)
    alerts: (companyId: string) => `company:${companyId}:alerts`
};
```

### Edge Functions

```typescript
// supabase/functions/optimize-routes/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
    const { companyId, date } = await req.json();

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch technicians and unscheduled jobs
    const { data: technicians } = await supabase
        .from('technicians')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'available');

    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .eq('scheduled_date', date)
        .in('status', ['unscheduled', 'scheduled']);

    // 2. Call OpenAI for job-to-technician assignment
    const assignments = await optimizeWithAI(technicians, jobs);

    // 3. Build distance matrix via Google Maps
    const matrix = await buildDistanceMatrix(/* all locations */);

    // 4. Solve VRP via OR-Tools microservice
    const routes = await solveVRP(matrix, assignments);

    // 5. Update jobs in database (triggers real-time updates to all clients)
    for (const route of routes) {
        for (const stop of route.stops) {
            await supabase
                .from('jobs')
                .update({
                    technician_id: route.technicianId,
                    route_order: stop.order,
                    scheduled_start: stop.scheduledStart,
                    status: 'scheduled'
                })
                .eq('id', stop.jobId);
        }
    }

    return new Response(JSON.stringify({ success: true, routes }));
});
```

### Supabase Pricing

| Plan | Price | Includes | When to Use |
|------|-------|----------|-------------|
| Free | $0/month | 500 MB DB, 1 GB bandwidth, 50 concurrent RT | Development |
| Pro | $25/month | 8 GB DB, 50 GB bandwidth, 200 concurrent RT | 1-50 companies |
| Team | $599/month | 16 GB DB, 200 GB bandwidth, 500 concurrent RT | 50-500 companies |
| Enterprise | Custom | Custom scaling | 500+ companies |

**Scaling Consideration:** Each company typically has 1 dispatcher + 5-50 technicians using real-time connections. 50 companies x 20 users average = 1,000 concurrent connections. This requires the Team plan or Enterprise.

---

## 6. Stripe

### B2B Subscription Billing

**Purpose:** Manage monthly subscription billing for RouteAI's three pricing tiers, handle upgrades/downgrades, usage metering for SMS and API overage, and B2B invoicing.

### Setup

```bash
# 1. Create a Stripe account at https://stripe.com

# 2. Get API keys
STRIPE_SECRET_KEY=STRIPE_LIVE_SECRET_PLACEHOLDER
STRIPE_PUBLISHABLE_KEY=STRIPE_LIVE_PUBLIC_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET_PLACEHOLDER

# 3. Create Products and Prices in Stripe Dashboard
# Product: RouteAI Starter
#   Price: $99/month, recurring
# Product: RouteAI Growth
#   Price: $249/month, recurring
# Product: RouteAI Scale
#   Price: $499/month, recurring
```

### Implementation

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create customer when company signs up
async function createStripeCustomer(company: Company): Promise<string> {
    const customer = await stripe.customers.create({
        name: company.name,
        email: company.billingEmail,
        metadata: {
            company_id: company.id,
            industry: company.industry
        }
    });
    return customer.id;
}

// Create subscription
async function createSubscription(
    stripeCustomerId: string,
    tier: 'starter' | 'growth' | 'scale'
): Promise<Stripe.Subscription> {
    const priceIds = {
        starter: 'price_starter_monthly_id',
        growth: 'price_growth_monthly_id',
        scale: 'price_scale_monthly_id'
    };

    const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceIds[tier] }],
        trial_period_days: 14,
        payment_behavior: 'default_incomplete',
        payment_settings: {
            save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent']
    });

    return subscription;
}

// Webhook handler for subscription events
async function handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
        case 'customer.subscription.created':
            await activateCompany(event.data.object);
            break;
        case 'customer.subscription.updated':
            await updateCompanyTier(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await deactivateCompany(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handleFailedPayment(event.data.object);
            break;
        case 'invoice.paid':
            await recordPayment(event.data.object);
            break;
    }
}
```

### Stripe Pricing

| Item | Cost |
|------|------|
| Transaction fee | 2.9% + $0.30 per charge |
| Invoicing | $0.50 per paid invoice |
| Billing portal | Included |

**Per Company Revenue After Stripe Fees:**

| Tier | Price | Stripe Fee | Net Revenue |
|------|-------|------------|-------------|
| Starter | $99 | $3.17 | $95.83 |
| Growth | $249 | $7.52 | $241.48 |
| Scale | $499 | $14.77 | $484.23 |

---

## Cost Projections at Scale

### Total API/Infrastructure Cost per Company per Month

| Service | Starter (5 techs) | Growth (15 techs) | Scale (30 techs) |
|---------|-------------------|-------------------|-------------------|
| Google Maps (all APIs) | $4.00 | $12.00 | $25.00 |
| OpenAI API | $1.50 | $4.00 | $8.00 |
| Twilio SMS | $8.00 | $25.00 | $50.00 |
| Supabase (allocated) | $1.00 | $2.50 | $5.00 |
| Stripe fees | $3.17 | $7.52 | $14.77 |
| **Total COGS** | **$17.67** | **$51.02** | **$102.77** |
| **Revenue** | **$99.00** | **$249.00** | **$499.00** |
| **Gross Margin** | **82.2%** | **79.5%** | **79.4%** |

### Aggregate Cost at Scale

| Metric | 100 Companies | 500 Companies | 2,000 Companies |
|--------|---------------|---------------|-----------------|
| MRR | $29,900 | $149,500 | $598,000 |
| Google Maps | $800 | $4,000 | $16,000 |
| OpenAI | $300 | $1,500 | $6,000 |
| Twilio | $1,500 | $7,500 | $30,000 |
| Supabase | $250 | $1,500 | $6,000 |
| Stripe | $600 | $3,000 | $12,000 |
| Infrastructure (hosting) | $200 | $800 | $3,000 |
| **Total COGS** | **$3,650** | **$18,300** | **$73,000** |
| **Gross Margin** | **87.8%** | **87.8%** | **87.8%** |

### Cost Scaling Notes

1. **Google Maps is the largest variable cost.** It scales linearly with the number of jobs/day. At high scale, consider Mapbox for map rendering (cheaper) while keeping Google for routing/geocoding.

2. **Twilio SMS is the second largest variable cost.** At scale, negotiate volume discounts (Twilio offers custom pricing above 100K SMS/month). Consider adding email notifications as a cheaper alternative for non-urgent messages.

3. **OpenAI costs are relatively low** because job parsing (the high-volume use case) uses GPT-4o-mini, which is very cheap. Schedule optimization is infrequent (1-5 times/day per company).

4. **Supabase costs increase with concurrent connections.** Each technician with the app open is a real-time connection. At 2,000 companies with an average of 15 technicians, that is 30,000 potential concurrent connections. This requires Supabase Enterprise or migrating to self-hosted Supabase.

5. **Stripe fees are fixed at 2.9% + $0.30.** At scale, negotiate for lower rates (2.5% + $0.25 is achievable above $1M MRR).

---

## API Key Management

### Security Best Practices

```
1. NEVER commit API keys to source control
2. Use environment variables exclusively
3. Create separate keys for development, staging, and production
4. Restrict Google Maps keys by platform (HTTP referrer for web, bundle ID for iOS, package for Android)
5. Set budget alerts on all paid APIs
6. Rotate keys quarterly
7. Use Supabase Edge Functions for server-side API calls (keys never exposed to client)
8. Monitor usage dashboards weekly for anomalies
```

### Environment Variable Structure

```bash
# .env.development
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=dev_anon_key
GOOGLE_MAPS_API_KEY=dev_unrestricted_key
OPENAI_API_KEY=sk-dev-key
TWILIO_ACCOUNT_SID=test_account_sid
TWILIO_AUTH_TOKEN=test_auth_token
STRIPE_SECRET_KEY=sk_test_key

# .env.production
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod_anon_key
GOOGLE_MAPS_API_KEY=prod_restricted_key
OPENAI_API_KEY=sk-prod-key
TWILIO_ACCOUNT_SID=prod_account_sid
TWILIO_AUTH_TOKEN=prod_auth_token
STRIPE_SECRET_KEY=sk_live_key
```

### Rate Limiting and Error Handling

```typescript
// Centralized API client with retry logic
class APIClient {
    private rateLimiter: RateLimiter;

    async callWithRetry<T>(
        fn: () => Promise<T>,
        options: { maxRetries: number; backoff: 'linear' | 'exponential' }
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
            try {
                await this.rateLimiter.waitForSlot();
                return await fn();
            } catch (error) {
                lastError = error;

                if (error.status === 429) {
                    // Rate limited — wait and retry
                    const waitMs = options.backoff === 'exponential'
                        ? Math.pow(2, attempt) * 1000
                        : attempt * 1000;
                    await sleep(waitMs);
                } else if (error.status >= 500) {
                    // Server error — retry
                    await sleep(1000);
                } else {
                    // Client error — don't retry
                    throw error;
                }
            }
        }

        throw lastError;
    }
}
```

### Fallback Strategies

| API | If Down/Rate Limited | Degraded Experience |
|-----|---------------------|-------------------|
| Google Maps | Use cached distance matrix, Euclidean distance estimates | Routes may be slightly suboptimal |
| OpenAI | Manual job entry form (no AI parsing), manual scheduling | Dispatchers do what they did before RouteAI |
| Twilio | Queue notifications, retry later, fall back to email | Customers don't get SMS updates temporarily |
| Supabase | Local state continues to work, queue updates | Dispatcher and technician apps may show stale data |
| Stripe | Existing subscriptions continue, new signups queued | No impact on core dispatch functionality |
