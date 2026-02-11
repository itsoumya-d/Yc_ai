# Screens

Every screen in SiteSync is designed for a construction professional standing on a job site -- bright sunlight, work gloves, one hand free, minimal patience. The UI is photo-centric, data-dense but scannable, and optimized for one-tap actions. Nothing requires a keyboard if it can be avoided. Every action a foreman needs should be reachable within 2 taps from the dashboard.

---

## Screen Map

```
App Launch
├── Onboarding Flow
│   ├── 1.1 Welcome / Value Prop
│   ├── 1.2 Company Setup
│   ├── 1.3 First Site Creation
│   ├── 1.4 Floor Plan Upload
│   ├── 1.5 Floor Plan Calibration
│   ├── 1.6 Team Invite
│   └── 1.7 Plan Selection
│
├── Authentication
│   ├── 2.1 Phone Number Entry
│   ├── 2.2 SMS Verification
│   └── 2.3 Join Company (invite flow)
│
├── Main Tabs
│   ├── 3.0 Site Dashboard (Home)
│   ├── 4.0 Photo Capture
│   ├── 5.0 Reports
│   ├── 6.0 Safety
│   └── 7.0 Team
│
├── Detail Screens
│   ├── 5.1 AI Report Preview / Edit
│   ├── 5.2 Report PDF Viewer
│   ├── 6.1 Safety Violation Detail
│   ├── 7.1 Team Member Profile
│   ├── 8.0 Timeline View
│   ├── 9.0 Photo Gallery
│   └── 9.1 Photo Detail / Compare
│
└── Settings
    ├── 10.1 Site Settings
    ├── 10.2 Team Permissions
    ├── 10.3 Report Schedule
    ├── 10.4 Notification Preferences
    ├── 10.5 Billing
    └── 10.6 Account
```

---

## 1. Onboarding Flow

### 1.1 Welcome / Value Prop

```
┌─────────────────────────────────┐
│                                 │
│      [Isometric illustration    │
│       of foreman taking photo   │
│       → report appearing]       │
│                                 │
│                                 │
│     AI turns your site photos   │
│     into progress reports       │
│                                 │
│   Save 2 hours of paperwork     │
│   every single day.             │
│                                 │
│  ● ○ ○                          │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Get Started            │    │
│  └─────────────────────────┘    │
│                                 │
│  Already have an account? Log in│
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Swipe left/right for 3 value prop slides:
  1. "AI turns your site photos into progress reports"
  2. "Catch safety violations before inspectors do"
  3. "Know if your project is on schedule -- every day"
- "Get Started" navigates to Company Setup
- "Log in" navigates to Phone Number Entry
- Skip button in top-right for returning users

**States:**
- First launch: full onboarding flow
- Returning user (logged out): shows login directly
- Deep link from invite: shows Join Company flow

---

### 1.2 Company Setup

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Set up your company            │
│                                 │
│  Company Name                   │
│  ┌─────────────────────────┐    │
│  │ Riverside Construction   │    │
│  └─────────────────────────┘    │
│                                 │
│  Your Role                      │
│  ┌─────────────────────────┐    │
│  │ ▼ Foreman               │    │
│  └─────────────────────────┘    │
│  Options: Owner, PM, Foreman,   │
│  Superintendent, Safety Mgr     │
│                                 │
│  Company Logo (optional)        │
│  ┌─────────┐                    │
│  │  + Add   │                    │
│  │  Logo    │                    │
│  └─────────┘                    │
│  Used on PDF reports            │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Continue               │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Company name: text input with auto-capitalization
- Role: dropdown picker with construction-specific roles
- Logo: image picker (camera or gallery), cropped to square
- "Continue" validates company name is not empty, navigates to First Site Creation
- Back arrow returns to Welcome

---

### 1.3 First Site Creation

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Add your first site            │
│                                 │
│  Site Name                      │
│  ┌─────────────────────────┐    │
│  │ Riverside Plaza Phase 2  │    │
│  └─────────────────────────┘    │
│                                 │
│  Address                        │
│  ┌─────────────────────────┐    │
│  │ 📍 1234 Oak Street...   │    │
│  └─────────────────────────┘    │
│  [Mapbox map preview with pin]  │
│  ┌─────────────────────────┐    │
│  │         📍               │    │
│  │    [Satellite map]       │    │
│  │                          │    │
│  └─────────────────────────┘    │
│  Drag pin to adjust location    │
│                                 │
│  Project Dates                  │
│  Start: [Jan 15, 2025    ]      │
│  Target End: [Aug 30, 2025]     │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Continue               │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Address field: Mapbox geocoding search with autocomplete
- Map: satellite view with draggable pin for precise location
- Date pickers: native date selection
- "Continue" creates the site record and navigates to Floor Plan Upload
- Address is optional (some early-phase sites do not have a formal address)

---

### 1.4 Floor Plan Upload

```
┌─────────────────────────────────┐
│ ←                         Skip  │
│                                 │
│  Upload floor plans             │
│                                 │
│  SiteSync maps your photos to   │
│  your floor plans automatically │
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │    [Upload area]         │    │
│  │                          │    │
│  │   📄 Tap to upload       │    │
│  │   PDF or image files     │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  Uploaded:                      │
│  ┌─────────────────────────┐    │
│  │ 📄 Level 1 - Ground.pdf │ ✕  │
│  │ 📄 Level 2 - Second.pdf │ ✕  │
│  └─────────────────────────┘    │
│                                 │
│  You can add more later in      │
│  site settings.                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Continue               │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Tap upload area to select files (PDF, JPG, PNG)
- Multiple file upload supported
- Each uploaded file shows with remove button
- "Skip" allows proceeding without floor plans (GPS-only mode)
- "Continue" navigates to Floor Plan Calibration (if plans uploaded) or Team Invite

---

### 1.5 Floor Plan Calibration

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Calibrate floor plan           │
│                                 │
│  Stand at the marked corner     │
│  and tap "Set Point"            │
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │   [Floor plan image      │    │
│  │    with 4 corner markers │    │
│  │    ① ✅ set              │    │
│  │    ② 🔵 current          │    │
│  │    ③ ○ pending           │    │
│  │    ④ ○ pending ]         │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  Point 2 of 4                   │
│  Walk to the next corner...     │
│                                 │
│  ┌─────────────────────────┐    │
│  │   📍 Set Point 2         │    │
│  └─────────────────────────┘    │
│                                 │
│  GPS Accuracy: 2.3m ✅          │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Floor plan displayed with 4 calibration points marked
- User physically walks to each corner of the building
- At each corner, taps "Set Point" to record GPS coordinates
- GPS accuracy indicator shows current precision (green if under 5m, yellow if 5-10m, red if over 10m)
- Progress indicator shows completed/remaining points
- After all 4 points set, system calculates GPS-to-floor-plan coordinate mapping
- "Re-do" button to recalibrate any point

**States:**
- Waiting for GPS lock: spinner with "Acquiring GPS signal..."
- Low accuracy: yellow warning with "Move to open area for better accuracy"
- Point set: green checkmark with recorded coordinates
- All points calibrated: success message with "Your photos will now map to your floor plan automatically"

---

### 1.6 Team Invite

```
┌─────────────────────────────────┐
│ ←                         Skip  │
│                                 │
│  Invite your team               │
│                                 │
│  Everyone on site can take      │
│  photos. More photos = better   │
│  reports.                       │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Phone number or email    │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Role: ▼ Crew Member      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │   + Send Invite          │    │
│  └─────────────────────────┘    │
│                                 │
│  Pending Invites:               │
│  ┌─────────────────────────┐    │
│  │ 📱 (555) 234-5678  Crew  │ ✕  │
│  │ 📱 (555) 345-6789  Crew  │ ✕  │
│  │ 📧 john@riverside.com PM │ ✕  │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Continue               │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Phone number input with auto-formatting
- Email input as alternative
- Role picker: Admin, PM, Foreman, Crew Member
- SMS or email invite sent immediately on "Send Invite"
- Pending invites list with remove option
- "Skip" proceeds without inviting anyone
- "Continue" navigates to Plan Selection

---

### 1.7 Plan Selection

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Choose your plan               │
│                                 │
│  ┌─────────────────────────┐    │
│  │  STARTER         $49/mo │    │
│  │  per active site         │    │
│  │                          │    │
│  │  ✓ 1 user                │    │
│  │  ✓ Daily AI reports      │    │
│  │  ✓ 500 photos/month      │    │
│  │  ✓ PDF export            │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  PROFESSIONAL    $149/mo │ ★  │
│  │  per active site  POPULAR│    │
│  │                          │    │
│  │  ✓ 5 users               │    │
│  │  ✓ Safety detection      │    │
│  │  ✓ Timeline tracking     │    │
│  │  ✓ Unlimited photos      │    │
│  │  ✓ Team feed             │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ENTERPRISE      $399/mo│    │
│  │  per active site         │    │
│  │                          │    │
│  │  ✓ Unlimited users       │    │
│  │  ✓ API integrations      │    │
│  │  ✓ Custom report templates│    │
│  │  ✓ Priority support      │    │
│  │  ✓ SSO authentication    │    │
│  └─────────────────────────┘    │
│                                 │
│  14-day free trial on all plans │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Start Free Trial       │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Tap to select plan (Professional pre-selected as "Popular")
- Selected plan highlighted with Construction Yellow border
- "Start Free Trial" initiates 14-day trial, no payment required upfront
- Enterprise plan shows "Contact Sales" option for custom pricing
- After selection, navigates to Site Dashboard (onboarding complete)

---

## 2. Authentication

### 2.1 Phone Number Entry

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Welcome back                   │
│                                 │
│  Enter your phone number        │
│                                 │
│  ┌───┐ ┌──────────────────┐     │
│  │+1 ▼│ │ (555) 123-4567   │     │
│  └───┘ └──────────────────┘     │
│                                 │
│  We will send you a             │
│  verification code via SMS.     │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Send Code              │    │
│  └─────────────────────────┘    │
│                                 │
│  ── or ──                       │
│                                 │
│  Continue with email            │
│                                 │
└─────────────────────────────────┘
```

**States:**
- Empty: waiting for phone number input
- Invalid: red border with "Enter a valid phone number"
- Loading: "Send Code" button shows spinner
- Rate limited: "Too many attempts. Try again in 60 seconds"

### 2.2 SMS Verification

```
┌─────────────────────────────────┐
│ ←                               │
│                                 │
│  Enter verification code        │
│                                 │
│  Sent to (555) 123-4567         │
│                                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│  │ 4 │ │ 8 │ │ 2 │ │ _ │ │ _ │ │ _ ││
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘│
│                                 │
│  Auto-verifying...              │
│                                 │
│  Didn't receive code?           │
│  Resend in 28s                  │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- 6-digit code input with auto-advance between fields
- Auto-submit when all 6 digits entered
- "Resend" button with 30-second cooldown timer
- On success: navigate to Dashboard (existing user) or Company Setup (new user)
- On failure: shake animation, "Invalid code. Try again."

---

## 3. Site Dashboard

```
┌─────────────────────────────────┐
│  SiteSync    📍 Riverside Plaza │
│              [Site Picker ▼]     │
├─────────────────────────────────┤
│                                 │
│  Good morning, Mike             │
│  Tuesday, January 15            │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ☀️ 45°F  Partly Cloudy   │    │
│  │ Wind: 8mph NW            │    │
│  │ Precip: 0%  Good for work│    │
│  └─────────────────────────┘    │
│                                 │
│  TODAY'S DOCUMENTATION          │
│  ┌─────────────────────────┐    │
│  │ 📸 24 photos captured    │    │
│  │    by 3 team members     │    │
│  │ 📋 Report: ⏳ Generating │    │
│  │ ⚠️  2 safety alerts       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  📸 Start Walk-Through   │    │
│  └─────────────────────────┘    │
│                                 │
│  SCHEDULE STATUS                │
│  ┌─────────────────────────┐    │
│  │ Overall: 43% complete    │    │
│  │ ████████░░░░░░░░░░ 43%  │    │
│  │                          │    │
│  │ Current Phase: Framing   │    │
│  │ Status: ✅ On Track       │    │
│  │ Next: Rough-In (Feb 3)  │    │
│  └─────────────────────────┘    │
│                                 │
│  RECENT ACTIVITY                │
│  ┌─────────────────────────┐    │
│  │ 👤 Carlos M.   2:34 PM  │    │
│  │ 📸 12 photos - Level 2   │    │
│  ├─────────────────────────┤    │
│  │ 👤 Sarah K.    1:15 PM  │    │
│  │ 📸 8 photos - Exterior   │    │
│  ├─────────────────────────┤    │
│  │ 🤖 AI Report   12:00 PM │    │
│  │ 📋 Daily report ready    │    │
│  └─────────────────────────┘    │
│                                 │
│  SAFETY OVERVIEW                │
│  ┌─────────────────────────┐    │
│  │ 🔴 1 Critical  🟡 1 Med  │    │
│  │ Open violations: 3       │    │
│  │ Resolved this week: 5    │    │
│  │ [View All Safety →]      │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│  🏠     📸     📋     ⚠️     👥  │
│ Home  Capture Report Safety Team│
└─────────────────────────────────┘
```

**Interactions:**
- Site Picker dropdown: switch between active sites (for multi-site PMs)
- "Start Walk-Through" button: primary CTA, launches camera in walk-through mode
- Today's Documentation card: tap to view photo feed or report
- Schedule Status card: tap to open full Timeline View
- Recent Activity: tap any item to view photos or report
- Safety Overview: tap to navigate to Safety tab
- Pull-to-refresh updates all dashboard data
- Tab bar navigation at bottom

**States:**
- No photos today: "Start Walk-Through" CTA is prominent, no documentation section
- Report generating: spinner with estimated time
- Report ready: green badge with "Review & Send" button
- No site selected: site picker is prominent, dashboard shows "Select or create a site"
- Offline: yellow banner at top "Offline -- photos will upload when connected"
- Safety critical: red banner "1 Critical Safety Alert -- Tap to review"

---

## 4. Photo Capture (Walk-Through Mode)

```
┌─────────────────────────────────┐
│ ✕ End                  ⚡ 💡 ⚙️  │
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │                          │    │
│  │                          │    │
│  │    [Camera viewfinder    │    │
│  │     full screen]         │    │
│  │                          │    │
│  │                          │    │
│  │                          │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📍 Building A - Level 2  │    │
│  │    Unit 203 - Bedroom    │    │
│  └─────────────────────────┘    │
│  [Mini floor plan with dot]     │
│  ┌───────────────┐              │
│  │  ·  current    │              │
│  │  ○○○ path     │              │
│  │  [floor plan] │              │
│  └───────────────┘              │
│                                 │
│  Photo 14 │ 🧭 NW │ GPS ✅      │
│                                 │
│  ┌──┐         ┌────┐       ┌──┐│
│  │🖼│         │ ⬤  │       │🎤││
│  │  │         │    │       │  ││
│  └──┘         └────┘       └──┘│
│ Gallery     Capture      Voice │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- **Capture button** (center): large, easy to tap with gloves; takes photo, haptic feedback, brief flash animation
- **Gallery button** (left): view photos taken in this session as horizontal scroll
- **Voice note** (right): hold to record voice note attached to next photo
- **Flash toggle** (top): auto/on/off
- **Torch toggle** (top): continuous light for dark areas
- **Settings** (top): resolution, timer, grid overlay
- **End button** (top-left): end walk-through session, shows session summary
- **Floor plan mini-map**: shows current position as dot, walk path as trail, photographed areas shaded
- **Area label**: auto-updates based on GPS position mapped to floor plan zones
- **Photo counter**: sequential count for the current session
- **Compass**: current heading direction
- **GPS indicator**: green checkmark (good fix), yellow (moderate), red (no fix)
- **Tap floor plan mini-map**: expands to full-screen floor plan with all photo locations plotted
- **Long-press capture**: enters burst mode (1 photo/second while held)
- **Swipe up on area label**: manually override the auto-detected zone

**States:**
- GPS acquiring: pulsing blue indicator, "Acquiring GPS..."
- GPS locked: green checkmark with accuracy in meters
- No GPS (indoor): shows "Indoor Mode" with manual zone selection
- Offline: captures normally, yellow indicator "Photos queued for upload"
- Low storage: warning when device storage is below 500MB
- Session summary (on end): total photos, areas covered, coverage percentage, upload status

---

## 5. Reports

### 5.0 Reports List

```
┌─────────────────────────────────┐
│ Reports         📍 Riverside    │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ [Daily] [Weekly] [Safety]│    │
│  └─────────────────────────┘    │
│                                 │
│  TODAY                          │
│  ┌─────────────────────────┐    │
│  │ 📋 Daily Progress Report │    │
│  │ Jan 15, 2025             │    │
│  │ Status: ⏳ Draft          │    │
│  │ 24 photos · 3 areas      │    │
│  │ ⚠️ 2 safety findings      │    │
│  │ [Review & Send →]        │    │
│  └─────────────────────────┘    │
│                                 │
│  YESTERDAY                      │
│  ┌─────────────────────────┐    │
│  │ 📋 Daily Progress Report │    │
│  │ Jan 14, 2025             │    │
│  │ Status: ✅ Sent           │    │
│  │ 31 photos · 4 areas      │    │
│  │ Sent to: 3 recipients    │    │
│  │ [View Report →]          │    │
│  └─────────────────────────┘    │
│                                 │
│  LAST WEEK                      │
│  ┌─────────────────────────┐    │
│  │ 📋 Weekly Summary Report │    │
│  │ Jan 6-12, 2025           │    │
│  │ Status: ✅ Sent           │    │
│  │ 142 photos · 5 days      │    │
│  │ [View Report →]          │    │
│  └─────────────────────────┘    │
│  ...more reports...             │
│                                 │
│  ┌─────────────────────────┐    │
│  │  + Generate Custom Report│    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│  🏠     📸     📋     ⚠️     👥  │
└─────────────────────────────────┘
```

**Interactions:**
- Filter tabs: Daily, Weekly, Safety report types
- Tap report card to view full report
- "Review & Send" on draft reports opens Report Preview
- "Generate Custom Report" allows selecting date range and type
- Pull-to-refresh regenerates today's report if new photos added
- Swipe left on report card to delete (with confirmation)

---

### 5.1 AI Report Preview / Edit

```
┌─────────────────────────────────┐
│ ← Report Preview        Edit ✏️ │
├─────────────────────────────────┤
│                                 │
│  DAILY PROGRESS REPORT          │
│  Riverside Plaza Phase 2        │
│  January 15, 2025               │
│  Report #RP-2025-015            │
│                                 │
│  ── EXECUTIVE SUMMARY ──        │
│  ┌─────────────────────────┐    │
│  │ Framing on Building A    │    │
│  │ Level 2 progressed to    │    │
│  │ approximately 73%        │    │
│  │ complete, up from 68%    │    │
│  │ yesterday. Exterior      │    │
│  │ sheathing has begun on   │    │
│  │ the east elevation.      │    │
│  │ Two safety findings were │    │
│  │ identified...            │    │
│  └─────────────────────────┘    │
│  [Edit Section ✏️]               │
│                                 │
│  ── BUILDING A - LEVEL 2 ──     │
│  ┌──────┬──────┬──────┐         │
│  │[img] │[img] │[img] │         │
│  │      │      │      │         │
│  └──────┴──────┴──────┘         │
│  Progress: 73% (↑5%)            │
│  - East wall framing complete   │
│  - Headers installed over       │
│  - window openings              │
│  - Sheathing started on east    │
│  [Edit Section ✏️]               │
│                                 │
│  ── BUILDING A - LEVEL 3 ──     │
│  ┌──────┬──────┬──────┐         │
│  │[img] │[img] │[img] │         │
│  └──────┴──────┴──────┘         │
│  Progress: 41% (↑6%)            │
│  - Floor joists complete        │
│  - Wall framing 40% complete    │
│  [Edit Section ✏️]               │
│                                 │
│  ── SAFETY FINDINGS ──          │
│  ┌─────────────────────────┐    │
│  │ 🔴 CRITICAL: Missing      │    │
│  │ guardrail at stairwell   │    │
│  │ opening, Level 3         │    │
│  │ OSHA 1926.501(b)(1)      │    │
│  │ [Photo] [Details →]      │    │
│  ├─────────────────────────┤    │
│  │ 🟡 MEDIUM: Debris in     │    │
│  │ walkway near south       │    │
│  │ staircase, Level 2       │    │
│  │ OSHA 1926.25(a)          │    │
│  │ [Photo] [Details →]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ── SCHEDULE STATUS ──          │
│  ┌─────────────────────────┐    │
│  │ [Timeline chart graphic] │    │
│  │ Framing: ✅ On Track      │    │
│  │ Rough-In: ⏳ Upcoming     │    │
│  │ Estimated delay: None    │    │
│  └─────────────────────────┘    │
│                                 │
│  ── WEATHER ──                  │
│  45°F, Partly Cloudy            │
│  No weather impact on work      │
│                                 │
│  ┌─────────────────────────┐    │
│  │  📄 Export PDF            │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  📧 Send to Stakeholders │    │
│  └─────────────────────────┘    │
│                                 │
│  Recipients:                    │
│  owner@riverside.com ✕          │
│  architect@smith.com ✕          │
│  + Add recipient                │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- "Edit" button toggles edit mode for the entire report
- "Edit Section" buttons allow editing individual sections
- In edit mode: text fields become editable, can rewrite AI-generated content
- Photo grids: tap to view full-size, long-press to remove from report, drag to reorder
- "Add Photos" button appears in edit mode to include additional photos
- Safety findings: tap to view full violation detail
- "Export PDF" generates downloadable PDF with company branding
- "Send to Stakeholders" sends PDF via email to listed recipients
- "Add recipient" shows contact picker or email entry
- Scroll through entire report vertically
- Shake device to regenerate AI content (or button in edit mode)

**States:**
- Generating: skeleton loading with progress indicator "Analyzing 24 photos..."
- Draft: full report visible, "Review & Send" CTA prominent
- Edited: shows "Modified" badge, original AI text available via "Show original"
- Sent: report locked, shows sent timestamp and recipients
- Error: "Report generation failed. Tap to retry." with error details

---

### 5.2 Report PDF Viewer

```
┌─────────────────────────────────┐
│ ← PDF Report      📤 Share     │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │  [Full PDF preview       │    │
│  │   with company logo,     │    │
│  │   formatted text,        │    │
│  │   photo grids,           │    │
│  │   charts,                │    │
│  │   professional layout]   │    │
│  │                          │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  Page 1 of 4                    │
│  ┌─────────────────────────┐    │
│  │  📧 Email  📥 Save  🖨 Print│
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Pinch to zoom on PDF
- Swipe to change pages
- Share button opens system share sheet
- Email sends to configured recipients
- Save downloads to device
- Print via AirPrint/system print dialog

---

## 6. Safety

### 6.0 Safety Dashboard

```
┌─────────────────────────────────┐
│ Safety Alerts    📍 Riverside   │
├─────────────────────────────────┤
│                                 │
│  ┌────┬────┬────┬────┐          │
│  │ 🔴 │ 🟠 │ 🟡 │ 🔵 │          │
│  │  1 │  2 │  3 │  1 │          │
│  │CRIT│HIGH│ MED│ LOW│          │
│  └────┴────┴────┴────┘          │
│                                 │
│  [Open] [In Progress] [Resolved]│
│                                 │
│  CRITICAL                       │
│  ┌─────────────────────────┐    │
│  │ 🔴 Missing Guardrail     │    │
│  │ Level 3 Stairwell        │    │
│  │ OSHA 1926.501(b)(1)      │    │
│  │ Detected: Today 2:34 PM  │    │
│  │ ┌────┐                   │    │
│  │ │[img]│  Fall Protection  │    │
│  │ └────┘  Unprotected      │    │
│  │         opening >6ft     │    │
│  │ Assigned: Carlos M.      │    │
│  │ Due: Today               │    │
│  │ [View Details →]         │    │
│  └─────────────────────────┘    │
│                                 │
│  HIGH                           │
│  ┌─────────────────────────┐    │
│  │ 🟠 Worker Without Hardhat│    │
│  │ Exterior - South Side    │    │
│  │ OSHA 1926.100(a)         │    │
│  │ Detected: Today 1:15 PM  │    │
│  │ [View Details →]         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🟠 Damaged Extension Cord│    │
│  │ Level 2 - Unit 205       │    │
│  │ OSHA 1926.405(a)(2)      │    │
│  │ Detected: Today 10:22 AM │    │
│  │ [View Details →]         │    │
│  └─────────────────────────┘    │
│                                 │
│  MEDIUM                         │
│  ┌─────────────────────────┐    │
│  │ 🟡 Debris in Walkway     │    │
│  │ Level 2 - Corridor       │    │
│  │ ...                      │    │
│  └─────────────────────────┘    │
│                                 │
│  This Week: 7 detected,        │
│  5 resolved, avg 4hr resolution │
│                                 │
├─────────────────────────────────┤
│  🏠     📸     📋     ⚠️     👥  │
└─────────────────────────────────┘
```

**Interactions:**
- Severity filter pills at top (tap to filter by severity)
- Status tabs: Open, In Progress, Resolved
- Tap any violation card to view full detail
- Pull-to-refresh checks for new AI-detected violations
- Badge on tab bar shows count of open critical/high violations
- Weekly summary stats at bottom

---

### 6.1 Safety Violation Detail

```
┌─────────────────────────────────┐
│ ← Violation Detail              │
├─────────────────────────────────┤
│                                 │
│  🔴 CRITICAL                     │
│  Missing Guardrail              │
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │  [Photo with violation   │    │
│  │   area highlighted with  │    │
│  │   red overlay/box]       │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  OSHA STANDARD                  │
│  ┌─────────────────────────┐    │
│  │ 1926.501(b)(1)           │    │
│  │ Fall Protection           │    │
│  │                          │    │
│  │ "Each employee on a      │    │
│  │ walking/working surface  │    │
│  │ with an unprotected side │    │
│  │ or edge 6+ feet above    │    │
│  │ a lower level shall be   │    │
│  │ protected..."            │    │
│  └─────────────────────────┘    │
│                                 │
│  LOCATION                       │
│  Level 3 - Stairwell Opening    │
│  [Mini floor plan with pin]     │
│                                 │
│  DESCRIPTION                    │
│  Stairwell opening on Level 3   │
│  lacks temporary guardrail.     │
│  Opening is approximately       │
│  10 feet above Level 2 landing. │
│  No barricade tape or warning   │
│  signage present.               │
│                                 │
│  CORRECTIVE ACTION              │
│  ┌─────────────────────────┐    │
│  │ Install temporary        │    │
│  │ guardrail system at      │    │
│  │ stairwell opening per    │    │
│  │ OSHA 1926.502(b).        │    │
│  │ Minimum 42" top rail,    │    │
│  │ 21" mid rail, 4" toe     │    │
│  │ board. Mark with high-   │    │
│  │ visibility tape until    │    │
│  │ permanent rail installed.│    │
│  └─────────────────────────┘    │
│                                 │
│  ASSIGNMENT                     │
│  ┌─────────────────────────┐    │
│  │ Assigned to: Carlos M.   │    │
│  │ Due: Today by 5:00 PM    │    │
│  │ Status: In Progress      │    │
│  └─────────────────────────┘    │
│  [Change Assignee]              │
│                                 │
│  RESOLUTION                     │
│  ┌─────────────────────────┐    │
│  │ 📸 Take Resolution Photo │    │
│  │ Photo required to mark   │    │
│  │ as resolved.             │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ✅ Mark as Resolved      │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Photo: tap for full-screen view with highlighted violation area
- OSHA standard: tap for full standard text (expandable)
- Floor plan: tap to see full floor plan with violation location
- "Change Assignee": opens team member picker
- "Take Resolution Photo": opens camera to photograph the fix
- "Mark as Resolved": requires resolution photo, adds timestamp and resolver name
- Edit button (top-right) to modify AI-detected details
- Share button to send violation details via text/email

**States:**
- Open: red header, assignment controls visible, "Mark as Resolved" button active
- In Progress: orange header, shows assigned member and due date
- Resolved: green header, shows resolution photo, resolver name, and timestamp
- Overdue: pulsing red badge, due date in red, escalation notification sent

---

## 7. Team

### 7.0 Team Management

```
┌─────────────────────────────────┐
│ Team             📍 Riverside   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │  + Invite Team Member    │    │
│  └─────────────────────────┘    │
│                                 │
│  ACTIVE TODAY (3)               │
│  ┌─────────────────────────┐    │
│  │ 👤 Mike Johnson          │    │
│  │    Foreman · Admin       │    │
│  │    📸 14 photos today     │    │
│  │    Last active: 2:45 PM  │    │
│  ├─────────────────────────┤    │
│  │ 👤 Carlos Martinez       │    │
│  │    Crew Member           │    │
│  │    📸 12 photos today     │    │
│  │    Last active: 2:34 PM  │    │
│  │    ⚠️ 1 task assigned     │    │
│  ├─────────────────────────┤    │
│  │ 👤 Sarah Kim             │    │
│  │    Project Manager       │    │
│  │    📸 8 photos today      │    │
│  │    Last active: 1:15 PM  │    │
│  └─────────────────────────┘    │
│                                 │
│  NOT ACTIVE TODAY (2)           │
│  ┌─────────────────────────┐    │
│  │ 👤 James Wilson          │    │
│  │    Superintendent        │    │
│  │    Last active: Yesterday│    │
│  ├─────────────────────────┤    │
│  │ 👤 Tom Davis             │    │
│  │    Crew Member           │    │
│  │    Last active: 2 days   │    │
│  └─────────────────────────┘    │
│                                 │
│  PENDING INVITES (1)            │
│  ┌─────────────────────────┐    │
│  │ 📱 (555) 456-7890        │    │
│  │    Sent: Jan 14          │    │
│  │    [Resend] [Cancel]     │    │
│  └─────────────────────────┘    │
│                                 │
│  TEAM STATS THIS WEEK           │
│  ┌─────────────────────────┐    │
│  │ Total photos: 142        │    │
│  │ Reports generated: 5     │    │
│  │ Safety items resolved: 5 │    │
│  │ Active days: 5/5         │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│  🏠     📸     📋     ⚠️     👥  │
└─────────────────────────────────┘
```

**Interactions:**
- "Invite Team Member" opens invite flow (phone number or email)
- Tap any team member to view their profile
- Swipe left on pending invite to cancel
- "Resend" resends invitation SMS/email
- Pull-to-refresh updates activity status
- Admin users see role badges and can tap to change roles

---

### 7.1 Team Member Profile

```
┌─────────────────────────────────┐
│ ← Carlos Martinez              │
├─────────────────────────────────┤
│                                 │
│  ┌────┐                         │
│  │    │  Carlos Martinez        │
│  │ 👤 │  Crew Member            │
│  │    │  (555) 234-5678         │
│  └────┘  Active since Jan 5     │
│                                 │
│  THIS WEEK                      │
│  ┌──────┬──────┬──────┐         │
│  │  42  │  5   │  2   │         │
│  │photos│ days │ tasks│         │
│  └──────┴──────┴──────┘         │
│                                 │
│  PHOTO CONTRIBUTIONS            │
│  ┌──────┬──────┬──────┐         │
│  │[img] │[img] │[img] │         │
│  │[img] │[img] │[img] │         │
│  │[img] │[img] │[img] │         │
│  └──────┴──────┴──────┘         │
│  [View All Photos →]            │
│                                 │
│  ASSIGNED TASKS                 │
│  ┌─────────────────────────┐    │
│  │ ⚠️ Install guardrail     │    │
│  │   Due: Today 5:00 PM    │    │
│  │   Status: In Progress   │    │
│  └─────────────────────────┘    │
│                                 │
│  NOTIFICATION SETTINGS          │
│  ┌─────────────────────────┐    │
│  │ Safety alerts    [ON]    │    │
│  │ Daily summary    [ON]    │    │
│  │ Photo reminders  [OFF]   │    │
│  └─────────────────────────┘    │
│                                 │
│  [Change Role ▼]                │
│  [Remove from Site]             │
│                                 │
└─────────────────────────────────┘
```

---

## 8. Timeline View

```
┌─────────────────────────────────┐
│ ← Timeline       📍 Riverside  │
├─────────────────────────────────┤
│                                 │
│  PROJECT PROGRESS               │
│  ████████████░░░░░░░░ 43%      │
│  Started: Jan 15 · Target: Aug 30│
│                                 │
│  ┌─────────────────────────┐    │
│  │  [Gantt-style chart]     │    │
│  │                          │    │
│  │  Foundation ████████ ✅   │    │
│  │  Framing    █████░░░ 73% │    │
│  │  Rough-In   ░░░░░░░      │    │
│  │  Insulation ░░░░░░░      │    │
│  │  Drywall    ░░░░░░░      │    │
│  │  Finish     ░░░░░░░      │    │
│  │  Landscape  ░░░░░░░      │    │
│  │                          │    │
│  │  ── Today               │    │
│  │                          │    │
│  │  Scheduled ───            │    │
│  │  Actual    ═══            │    │
│  │  Predicted ┅┅┅            │    │
│  └─────────────────────────┘    │
│                                 │
│  CURRENT PHASE                  │
│  ┌─────────────────────────┐    │
│  │ Framing                  │    │
│  │ Status: ✅ On Track       │    │
│  │ Scheduled: Jan 20-Feb 15│    │
│  │ AI Estimate: Feb 14      │    │
│  │ Confidence: 87%          │    │
│  │ Progress: 73%            │    │
│  └─────────────────────────┘    │
│                                 │
│  UPCOMING MILESTONES            │
│  ┌─────────────────────────┐    │
│  │ Feb 3   Rough-In Start   │    │
│  │         ✅ On Track       │    │
│  ├─────────────────────────┤    │
│  │ Mar 1   Insulation Start │    │
│  │         ✅ On Track       │    │
│  ├─────────────────────────┤    │
│  │ Mar 15  Drywall Start    │    │
│  │         ⚠️ At Risk (-2d)  │    │
│  └─────────────────────────┘    │
│                                 │
│  AI DELAY PREDICTIONS           │
│  ┌─────────────────────────┐    │
│  │ "Based on current framing│    │
│  │ progress rate and 3      │    │
│  │ weather days forecast    │    │
│  │ next week, drywall start │    │
│  │ may slip 2-3 days.       │    │
│  │ Critical path impact:    │    │
│  │ Minimal -- buffer exists │    │
│  │ in finish schedule."     │    │
│  └─────────────────────────┘    │
│                                 │
│  CRITICAL PATH                  │
│  ┌─────────────────────────┐    │
│  │ Framing → Rough-In →     │    │
│  │ Insulation → Drywall →   │    │
│  │ Paint → Finish → CO      │    │
│  │                          │    │
│  │ Total Float: 12 days     │    │
│  │ Status: ✅ Healthy        │    │
│  └─────────────────────────┘    │
│                                 │
│  WEATHER IMPACT                 │
│  ┌─────────────────────────┐    │
│  │ Days lost to weather: 3  │    │
│  │ Upcoming risk: 2 days    │    │
│  │ (rain forecast Jan 22-23)│    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Gantt chart: horizontal scroll for long timelines, pinch to zoom time scale
- Tap any phase bar to see phase detail (photos, progress, team)
- Milestone items: tap for detail with supporting photos
- AI prediction expandable/collapsible
- Critical path: tap for full critical path analysis
- "Edit Schedule" button (admin only) to update milestone dates
- Compare toggle: show/hide scheduled vs. actual lines on chart

---

## 9. Photo Gallery

### 9.0 Photo Gallery

```
┌─────────────────────────────────┐
│ ← Photos         📍 Riverside  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🔍 Search photos...      │    │
│  └─────────────────────────┘    │
│                                 │
│  Filters:                       │
│  [All] [Today] [This Week]      │
│  [By Area ▼] [By Person ▼]     │
│                                 │
│  TODAY · Jan 15 · 24 photos     │
│  ┌──────┬──────┬──────┐         │
│  │[img] │[img] │[img] │         │
│  │2:34p │2:35p │2:36p │         │
│  │L2-203│L2-203│L2-204│         │
│  ├──────┼──────┼──────┤         │
│  │[img] │[img] │[img] │         │
│  │2:37p │2:38p │2:39p │         │
│  │L2-205│L2-Cor│L2-Cor│         │
│  ├──────┼──────┼──────┤         │
│  │[img] │[img] │[img] │         │
│  │1:15p │1:16p │1:17p │         │
│  │Ext-S │Ext-S │Ext-E │         │
│  └──────┴──────┴──────┘         │
│  ... more photos ...            │
│                                 │
│  YESTERDAY · Jan 14 · 31 photos │
│  ┌──────┬──────┬──────┐         │
│  │[img] │[img] │[img] │         │
│  │      │      │      │         │
│  └──────┴──────┴──────┘         │
│  ... more photos ...            │
│                                 │
│  ┌─────────────────────────┐    │
│  │  📥 Download Selected    │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  🔀 Compare Dates        │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Search bar: AI-powered search by description ("show me framing photos", "exterior east side")
- Filter chips: tap to toggle date, area, or person filters
- Photo grid: 3-column, tap to view full-screen
- Long-press to enter selection mode (multi-select for download/share)
- "Compare Dates": select two dates and an area to see side-by-side comparison
- "Download Selected": creates ZIP of selected photos
- Each photo shows time and floor plan zone label
- Safety violation badge overlay on photos with detected violations
- Scroll by date groups with sticky date headers
- Pull-to-refresh loads newest photos

---

### 9.1 Photo Detail / Compare

```
┌─────────────────────────────────┐
│ ✕                    📤 Share   │
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │  [Full-screen photo      │    │
│  │   with pinch-to-zoom]    │    │
│  │                          │    │
│  │                          │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│  📍 Building A - Level 2        │
│     Unit 203 - Bedroom          │
│  🕐 Jan 15, 2:34 PM             │
│  👤 Carlos Martinez             │
│  🧭 Northwest                   │
│                                 │
│  AI ANALYSIS                    │
│  ┌─────────────────────────┐    │
│  │ Phase: Framing            │    │
│  │ Progress: ~75% for area  │    │
│  │ Observed: East wall       │    │
│  │ framing complete, headers │    │
│  │ installed, window bucks   │    │
│  │ in place.                 │    │
│  └─────────────────────────┘    │
│                                 │
│  ⚠️ SAFETY FINDING              │
│  ┌─────────────────────────┐    │
│  │ No violations detected   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🔀 Compare with...      │    │
│  └─────────────────────────┘    │
│                                 │
│  ← Swipe for next photo →      │
│                                 │
└─────────────────────────────────┘
```

**Compare Mode:**
```
┌─────────────────────────────────┐
│ ← Compare Mode                 │
│                                 │
│  Unit 203 - Bedroom             │
│                                 │
│  ┌────────────┬────────────┐    │
│  │            │            │    │
│  │  Jan 8     │  Jan 15    │    │
│  │  [photo]   │  [photo]   │    │
│  │            │            │    │
│  └────────────┴────────────┘    │
│                                 │
│  Progress: 45% → 75%           │
│  Change: +30% in 7 days        │
│                                 │
│  [Slider compare mode]         │
│  [Side-by-side mode] ✅         │
│  [Overlay mode]                 │
│                                 │
│  Select dates to compare:       │
│  [◀ Jan 1] [Jan 8] [Jan 15 ▶] │
│                                 │
└─────────────────────────────────┘
```

**Interactions:**
- Pinch-to-zoom on photo
- Swipe left/right to navigate between photos in the set
- "Compare with..." opens date picker to select comparison date for same area
- Compare modes: side-by-side, slider (drag divider), overlay (transparency)
- AI analysis expandable/collapsible
- Share button: standard system share sheet
- Download: save to device photo library

---

## 10. Settings

### 10.1 Site Settings

```
┌─────────────────────────────────┐
│ ← Site Settings                 │
├─────────────────────────────────┤
│                                 │
│  SITE DETAILS                   │
│  ┌─────────────────────────┐    │
│  │ Name: Riverside Plaza P2 │    │
│  │ Address: 1234 Oak Street │    │
│  │ Start: Jan 15, 2025      │    │
│  │ Target End: Aug 30, 2025 │    │
│  │ [Edit Details]           │    │
│  └─────────────────────────┘    │
│                                 │
│  FLOOR PLANS                    │
│  ┌─────────────────────────┐    │
│  │ 📄 Level 1 - Ground      │ ✏️ │
│  │ 📄 Level 2 - Second      │ ✏️ │
│  │ [+ Add Floor Plan]       │    │
│  │ [Recalibrate GPS]        │    │
│  └─────────────────────────┘    │
│                                 │
│  SCHEDULE                       │
│  ┌─────────────────────────┐    │
│  │ [Import Schedule]        │    │
│  │ [Edit Milestones]        │    │
│  │ Last updated: Jan 14     │    │
│  └─────────────────────────┘    │
│                                 │
│  REPORT BRANDING                │
│  ┌─────────────────────────┐    │
│  │ Company Logo: [logo] ✏️  │    │
│  │ Report Footer: [edit]    │    │
│  │ Color Accent: [picker]   │    │
│  └─────────────────────────┘    │
│                                 │
│  DANGER ZONE                    │
│  ┌─────────────────────────┐    │
│  │ [Archive Site]           │    │
│  │ [Delete Site]            │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 10.2 Team Permissions

```
┌─────────────────────────────────┐
│ ← Team Permissions              │
├─────────────────────────────────┤
│                                 │
│  ROLES                          │
│  ┌─────────────────────────┐    │
│  │ Admin                    │    │
│  │ ✓ All permissions        │    │
│  │ ✓ Manage billing         │    │
│  │ ✓ Delete sites           │    │
│  ├─────────────────────────┤    │
│  │ Project Manager          │    │
│  │ ✓ View all sites         │    │
│  │ ✓ Edit reports           │    │
│  │ ✓ Manage team            │    │
│  │ ✗ Billing access         │    │
│  ├─────────────────────────┤    │
│  │ Foreman                  │    │
│  │ ✓ Capture photos         │    │
│  │ ✓ Generate reports       │    │
│  │ ✓ View safety alerts     │    │
│  │ ✗ Manage team            │    │
│  ├─────────────────────────┤    │
│  │ Crew Member              │    │
│  │ ✓ Capture photos         │    │
│  │ ✓ View team feed         │    │
│  │ ✗ Generate reports       │    │
│  │ ✗ Manage team            │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 10.3 Report Schedule

```
┌─────────────────────────────────┐
│ ← Report Schedule               │
├─────────────────────────────────┤
│                                 │
│  DAILY REPORT                   │
│  ┌─────────────────────────┐    │
│  │ Auto-generate: [ON]      │    │
│  │ Generate at: [4:00 PM ▼] │    │
│  │ Auto-send: [OFF]         │    │
│  │ Recipients:              │    │
│  │  owner@riverside.com     │    │
│  │  architect@smith.com     │    │
│  │  [+ Add Recipient]       │    │
│  └─────────────────────────┘    │
│                                 │
│  WEEKLY SUMMARY                 │
│  ┌─────────────────────────┐    │
│  │ Auto-generate: [ON]      │    │
│  │ Generate on: [Friday ▼]  │    │
│  │ Generate at: [5:00 PM ▼] │    │
│  │ Auto-send: [ON]          │    │
│  │ Recipients:              │    │
│  │  owner@riverside.com     │    │
│  │  [+ Add Recipient]       │    │
│  └─────────────────────────┘    │
│                                 │
│  SAFETY REPORT                  │
│  ┌─────────────────────────┐    │
│  │ Auto-generate: [ON]      │    │
│  │ Frequency: [Weekly ▼]    │    │
│  │ Include resolved: [ON]   │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 10.4 Notification Preferences

```
┌─────────────────────────────────┐
│ ← Notifications                 │
├─────────────────────────────────┤
│                                 │
│  PUSH NOTIFICATIONS             │
│  ┌─────────────────────────┐    │
│  │ Safety alerts (Critical)     │
│  │                     [ON] │    │
│  │ Safety alerts (All)          │
│  │                    [OFF] │    │
│  │ Report ready                 │
│  │                     [ON] │    │
│  │ Team photo activity          │
│  │                    [OFF] │    │
│  │ Schedule delay alerts        │
│  │                     [ON] │    │
│  │ Daily summary                │
│  │                     [ON] │    │
│  └─────────────────────────┘    │
│                                 │
│  QUIET HOURS                    │
│  ┌─────────────────────────┐    │
│  │ Enabled: [ON]            │    │
│  │ From: [8:00 PM]          │    │
│  │ To: [6:00 AM]            │    │
│  │ Exception: Critical      │    │
│  │ safety alerts always on  │    │
│  └─────────────────────────┘    │
│                                 │
│  EMAIL NOTIFICATIONS            │
│  ┌─────────────────────────┐    │
│  │ Daily report: [ON]       │    │
│  │ Weekly summary: [ON]     │    │
│  │ Safety digest: [ON]      │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 10.5 Billing

```
┌─────────────────────────────────┐
│ ← Billing                       │
├─────────────────────────────────┤
│                                 │
│  CURRENT PLAN                   │
│  ┌─────────────────────────┐    │
│  │ Professional - $149/site │    │
│  │ Active Sites: 3          │    │
│  │ Monthly Total: $447      │    │
│  │ Next Invoice: Feb 1      │    │
│  │ [Change Plan]            │    │
│  └─────────────────────────┘    │
│                                 │
│  USAGE THIS MONTH               │
│  ┌─────────────────────────┐    │
│  │ Photos: 1,247 / unlimited│    │
│  │ Reports: 42              │    │
│  │ Team Members: 4 / 5      │    │
│  │ AI Analyses: 1,247       │    │
│  └─────────────────────────┘    │
│                                 │
│  PAYMENT METHOD                 │
│  ┌─────────────────────────┐    │
│  │ Invoice billing          │    │
│  │ Net 30 terms             │    │
│  │ [Update Payment]         │    │
│  └─────────────────────────┘    │
│                                 │
│  INVOICE HISTORY                │
│  ┌─────────────────────────┐    │
│  │ Jan 2025  $447  ✅ Paid   │    │
│  │ Dec 2024  $298  ✅ Paid   │    │
│  │ Nov 2024  $149  ✅ Paid   │    │
│  │ [View All Invoices]      │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### 10.6 Account

```
┌─────────────────────────────────┐
│ ← Account                       │
├─────────────────────────────────┤
│                                 │
│  PROFILE                        │
│  ┌─────────────────────────┐    │
│  │ Name: Mike Johnson       │    │
│  │ Phone: (555) 123-4567    │    │
│  │ Email: mike@riverside.com│    │
│  │ Company: Riverside Const.│    │
│  │ [Edit Profile]           │    │
│  └─────────────────────────┘    │
│                                 │
│  APP SETTINGS                   │
│  ┌─────────────────────────┐    │
│  │ Theme: [Auto ▼]          │    │
│  │ Photo Quality: [High ▼]  │    │
│  │ Upload on WiFi only: [ON]│    │
│  │ Offline Storage: 2.3 GB  │    │
│  │ [Clear Offline Data]     │    │
│  └─────────────────────────┘    │
│                                 │
│  SUPPORT                        │
│  ┌─────────────────────────┐    │
│  │ [Help Center]            │    │
│  │ [Contact Support]        │    │
│  │ [Feature Requests]       │    │
│  └─────────────────────────┘    │
│                                 │
│  LEGAL                          │
│  ┌─────────────────────────┐    │
│  │ [Privacy Policy]         │    │
│  │ [Terms of Service]       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Log Out                 │    │
│  └─────────────────────────┘    │
│                                 │
│  Version 1.0.0 (Build 42)      │
│                                 │
└─────────────────────────────────┘
```

---

## Navigation Architecture

```
Tab Navigation (Bottom Bar)
├── Home Tab → Site Dashboard (3.0)
│   ├── → Timeline View (8.0)
│   └── → Photo Gallery (9.0)
│       └── → Photo Detail (9.1)
│
├── Capture Tab → Photo Capture (4.0)
│   └── → Session Summary (modal)
│
├── Reports Tab → Reports List (5.0)
│   ├── → Report Preview (5.1)
│   └── → PDF Viewer (5.2)
│
├── Safety Tab → Safety Dashboard (6.0)
│   └── → Violation Detail (6.1)
│
└── Team Tab → Team Management (7.0)
    └── → Member Profile (7.1)

Settings (accessible from Dashboard header)
├── Site Settings (10.1)
├── Team Permissions (10.2)
├── Report Schedule (10.3)
├── Notifications (10.4)
├── Billing (10.5)
└── Account (10.6)
```

---

## Responsive Considerations

While SiteSync is mobile-first, tablet and web access are important for PMs working from the office trailer:

**Phone (primary):** All screens as documented above. One-column layout. Large touch targets.

**Tablet (secondary):** Split-view on Dashboard (photo feed + map). Larger photo grids (4-5 columns). Side-by-side report editing. Full floor plan view with photo pins.

**Web (future):** Full dashboard with multi-site overview. Large timeline/Gantt charts. Report generation and template editing. Admin and billing management. Photo gallery with larger previews.
