# RouteAI — Screens

RouteAI consists of two separate applications: the **Dispatcher App** (tablet/web) for office-based fleet management, and the **Technician App** (mobile) for field use. Both share design language but are optimized for their respective use contexts.

---

## DISPATCHER APP

The dispatcher app is designed for iPad, Android tablets, and web browsers. It is a data-dense application used all day by dispatchers managing 5-50 technicians. The layout prioritizes information density, quick scanning, and rapid action.

---

### Screen D1: Login

**Purpose:** Authenticate dispatcher users and route to their company's dispatch center.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    ┌──────────────┐                      │
│                    │  RouteAI     │                      │
│                    │  [GPS Icon]  │                      │
│                    └──────────────┘                      │
│                                                          │
│                 Smart Dispatch Center                     │
│                                                          │
│              ┌──────────────────────────┐                │
│              │  Email                    │                │
│              └──────────────────────────┘                │
│              ┌──────────────────────────┐                │
│              │  Password         [Eye]  │                │
│              └──────────────────────────┘                │
│                                                          │
│              ┌──────────────────────────┐                │
│              │      Sign In             │                │
│              └──────────────────────────┘                │
│                                                          │
│              Forgot password?                            │
│                                                          │
│              ─── or continue with ───                    │
│                                                          │
│              [Google SSO]  [Microsoft SSO]               │
│                                                          │
│              Don't have an account? Start free trial     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**UI Details:**
- Background: Map White (#F8FAFC) with a subtle topographic map pattern
- Logo: RouteAI wordmark with GPS pin icon in Route Blue (#0369A1)
- Input fields: 48px height, rounded corners (8px), light gray border (#D1D5DB), focus state border Route Blue
- Sign In button: Route Blue (#0369A1) background, white text, 48px height, full width of form area, hover darkens to #075985
- SSO buttons: outlined style with provider logos
- Form width: 400px centered on screen

**States:**
- Default: empty form, Sign In button disabled
- Valid input: Sign In button enabled (full opacity)
- Loading: Sign In button shows spinner, inputs disabled
- Error: red border on invalid field, error message below ("Invalid email or password")
- Success: brief checkmark animation, then redirect to Dashboard

**Interactions:**
- Tab between email and password fields
- Enter key submits form
- Password visibility toggle (eye icon)
- "Forgot password?" opens email reset flow
- SSO buttons redirect to OAuth provider

---

### Screen D2: Dashboard

**Purpose:** Real-time overview of today's operations. The first screen the dispatcher sees every morning and monitors throughout the day.

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [=] RouteAI          Today: Tue, March 15      ABC Plumbing    [J.D.]▼ │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│ ●        │  │ Jobs Today │ │  On-Time   │ │  Fleet     │ │  Drive   │ │
│          │  │            │ │  Rate      │ │  Util.     │ │  Saved   │ │
│ Schedule │  │  34 / 62   │ │   89%      │ │   72%      │ │  3.8 hrs │ │
│          │  │  ▲ +5 vs   │ │  ▲ +4% vs  │ │  ▼ -2% vs  │ │  ▲ vs    │ │
│ Jobs     │  │  last Tue  │ │  last wk   │ │  last wk   │ │  manual  │ │
│          │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│ Routes   │                                                              │
│          │  ┌──────────────────────────────────┬────────────────────────┤
│ Analytics│  │                                  │  ALERTS (3)            │
│          │  │         FLEET MAP                 │                        │
│ ─────    │  │                                  │  ⚠ Mike R. running     │
│          │  │    [Map with technician           │    25 min behind       │
│ Settings │  │     markers, color-coded          │    → 3 jobs affected   │
│          │  │     routes, job pins]             │    [Re-optimize]       │
│          │  │                                  │                        │
│          │  │   🔴 Behind  🟢 On Track         │  🔴 Emergency job      │
│          │  │   🔵 En Route  ⚪ Idle           │    Water heater burst   │
│          │  │                                  │    1842 Pine St         │
│          │  │   [Mike R.] [Sarah K.]           │    [Assign Now]        │
│          │  │   [Tom B.]  [Lisa M.]            │                        │
│          │  │   [Jake P.] [Amy W.]             │  ⚡ Optimization avail  │
│          │  │                                  │    3 new jobs can be    │
│          │  │                                  │    inserted today       │
│          │  │                                  │    [Run Optimization]   │
│          │  │                                  │                        │
│          │  ├──────────────────────────────────┤────────────────────────┤
│          │  │                                                          │
│          │  │  TECHNICIAN STATUS                                        │
│          │  │                                                          │
│          │  │  ┌──────┬─────────┬───────┬────────┬──────┬───────────┐ │
│          │  │  │ Tech │ Status  │ Job   │ ETA    │ Jobs │ Util.     │ │
│          │  │  ├──────┼─────────┼───────┼────────┼──────┼───────────┤ │
│          │  │  │🟢Mike│ On Job  │ AC Rpr│ --     │ 3/5  │ 78%       │ │
│          │  │  │🔵Sara│ Driving │ Inspc │ 10 min │ 2/6  │ 65%       │ │
│          │  │  │🟢Tom │ On Job  │ Instl │ --     │ 1/3  │ 82%       │ │
│          │  │  │⚪Lisa│ Idle    │ --    │ --     │ 4/4  │ 90%  Done │ │
│          │  │  │🔴Jake│ Behind  │ Rpr   │ +25min │ 2/5  │ 55%       │ │
│          │  │  │🔵Amy │ Driving │ Maint │ 5 min  │ 3/7  │ 60%       │ │
│          │  │  └──────┴─────────┴───────┴────────┴──────┴───────────┘ │
│          │  │                                                          │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**UI Details:**

**Header Bar:**
- Height: 56px, background: white, bottom border: 1px #E5E7EB
- Hamburger menu icon (mobile/tablet), RouteAI logo, current date, company name, user avatar with dropdown
- User dropdown: Profile, Company Settings, Billing, Logout

**Sidebar Navigation:**
- Width: 200px (collapsible to 64px icon-only on smaller screens)
- Background: #F0F4F8 (Surface Light)
- Active item: Route Blue (#0369A1) left border (3px), blue text, light blue background tint
- Items: Dashboard, Schedule, Jobs, Routes, Analytics, Settings (separator before Settings)
- Lucide icons for each item

**Metric Cards (Top Row):**
- 4 cards in a row, equal width, 100px height
- Background: white, border-radius: 12px, subtle shadow (0 1px 3px rgba(0,0,0,0.1))
- Primary metric: 28px bold, color varies by context
- Comparison line: 14px, green up-arrow for improvement, red down-arrow for decline
- "Drive Saved" card has a subtle green tint background to highlight the key value prop

**Fleet Map:**
- Takes 60% of the main content width
- Google Maps with custom styling (desaturated base map so markers/routes stand out)
- Technician markers: circular avatars (32px) with colored status ring
- Route lines: 4px width, each technician a different color from a palette that contrasts well
- Job markers: small circles (12px) at job addresses, color indicates status
- Map controls: zoom, satellite toggle, traffic overlay toggle, center on fleet button

**Alerts Panel:**
- Takes 40% of the main content width, right side
- Background: white, left border varies by severity (orange for warning, red for critical, blue for info)
- Each alert: severity icon, title (16px bold), description (14px), action button (text button, Route Blue)
- Maximum 5 alerts visible, scroll for more, badge count on section header
- Alert types: behind schedule (orange), emergency job (red), optimization available (blue), technician idle (yellow)

**Technician Status Table:**
- Full width below map/alerts row
- Alternating row backgrounds: white / #F8FAFC
- Status column: colored dot + text (green: On Job, blue: Driving/En Route, red: Behind, gray: Idle/Off Duty)
- Click any row to navigate to that technician's route detail
- Sortable columns (click header to sort)
- Utilization column: progress bar fill in green, turns yellow below 60%, red below 40%

**States:**
- Loading: skeleton screens for map and metric cards
- No jobs scheduled: empty state with illustration, "No jobs scheduled for today" + CTA to create jobs
- All complete: celebratory state, "All 62 jobs completed! Fleet averaged 89% on-time."
- After hours: shows tomorrow's scheduled jobs count and optimization status

**Interactions:**
- Click technician marker on map: popup with tech name, current job, ETA, quick actions (call, message, view route)
- Click metric card: navigates to detailed analytics view for that metric
- Click "Re-optimize" alert: runs re-optimization, shows before/after dialog
- Click "Assign Now" on emergency: opens technician picker with AI recommendation highlighted
- Pull down to refresh (tablet), auto-refresh every 60 seconds
- Click technician row in table: navigates to Routes screen filtered to that technician

---

### Screen D3: Schedule Board

**Purpose:** Visual scheduling interface where dispatchers assign jobs to technicians across time slots. Supports drag-and-drop and AI optimization.

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [=] RouteAI           Schedule Board           [◀ Mar 14] Mar 15 [▶]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  ┌─────────────────────────────────────────────────────────┐ │
│          │  │  Unscheduled Jobs (7)         [+ New Job]   [⚡Optimize]│ │
│ Schedule │  │                                                         │ │
│ ●        │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│          │  │  │🔴 EMERG  │ │🟡 Repair │ │🔵 Maint  │ │🔵 Inspec │ │ │
│ Jobs     │  │  │Water htr │ │ AC not   │ │ Annual   │ │ Pre-sale │ │ │
│          │  │  │burst     │ │ cooling  │ │ furnace  │ │ inspect  │ │ │
│ Routes   │  │  │1842 Pine │ │ 903 Oak  │ │ 2105 Elm │ │ 445 Main │ │ │
│          │  │  │ASAP      │ │ PM pref  │ │ Flexible │ │ 10-12    │ │ │
│ Analytics│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│          │  └─────────────────────────────────────────────────────────┘ │
│          │                                                              │
│          │  ┌───────┬──────────┬──────────┬──────────┬──────────┬─────┐│
│          │  │ Time  │ Mike R.  │ Sarah K. │ Tom B.   │ Lisa M.  │ ... ││
│          │  │       │ HVAC     │ Plumbing │ HVAC     │ Elec     │     ││
│          │  ├───────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│          │  │ 8:00  │┌────────┐│          │┌────────┐│┌────────┐│     ││
│          │  │       ││AC Inst ││          ││Furnace ││ │Rewire  ││     ││
│          │  │ 9:00  ││4521 Oak││          ││Maint   │││ 112    ││     ││
│          │  │       ││240 min ││          ││2hr     │││ Cedar  ││     ││
│          │  │10:00  ││🟢 OnJob│││Leak Rpr ││✅ Done ││ │180min ││     ││
│          │  │       │└────────┘││178 Pine ││        │││        ││     ││
│          │  │11:00  │  🚗 30m ││90 min   ││        ││ │🟢OnJob││     ││
│          │  │       │┌────────┐│🔵EnRoute│├────────┤│└────────┘│     ││
│          │  │12:00  ││AC Repr ││└────────┘│┌────────┐│          │     ││
│          │  │       ││903 Oak ││  🚗 20m ││Htr Inst│││┌────────┐│     ││
│          │  │ 1:00  ││90 min  ││┌────────┐││331 Elm │││Panel   ││     ││
│          │  │       ││        │││Pipe Rpl │││240 min│││ Upgr   ││     ││
│          │  │ 2:00  │└────────┘││250 Birch│││       │││ 567    ││     ││
│          │  │       │  🚗 15m ││120 min ││ │       │││ Maple  ││     ││
│          │  │ 3:00  │┌────────┐││        │││       │││120min  ││     ││
│          │  │       ││Thermo  │││🟡Sched │││🟡Sched││ │🟡Sched││     ││
│          │  │ 4:00  ││Instl   ││└────────┘│└────────┘│└────────┘│     ││
│          │  │       ││60 min  ││          │          │          │     ││
│          │  │ 5:00  │└────────┘│          │          │          │     ││
│          │  └───────┴──────────┴──────────┴──────────┴──────────┴─────┘│
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**UI Details:**

**Unscheduled Jobs Bar (Top):**
- Horizontal scrollable container, height: 120px
- Background: #FEF3C7 (light yellow tint) to draw attention
- Each job card: 160px wide, 100px tall, white background, rounded corners (8px)
- Priority badge: top-left pill (red for emergency, yellow for high, blue for normal)
- Card content: job type (bold), address (truncated), time window preference
- Draggable: cards can be dragged down into the schedule grid
- "[+ New Job]" button: opens job creation modal
- "[Optimize]" button: lightning bolt icon, Route Blue background, pulses subtly when unscheduled jobs exist

**Schedule Grid:**
- Column per technician (scrollable horizontally if more than 5 technicians)
- Column header: technician name, primary skill badge, today's job count
- Time axis: 30-minute increments, 7 AM - 6 PM (configurable)
- Background: white grid lines (#E5E7EB) every 30 minutes, darker line (#9CA3AF) every hour

**Job Blocks in Grid:**
- Height proportional to duration (60 min = 2 grid rows)
- Background: varies by status
  - Scheduled (future): light blue (#DBEAFE) with blue left border
  - In Progress: light green (#DCFCE7) with green left border
  - Completed: light gray (#F3F4F6) with checkmark overlay
  - En Route: light blue with pulsing dot
  - Behind Schedule: light red (#FEE2E2) with red left border
- Content: job title, address, duration, status icon
- Drive time gaps: shown as small gray blocks between jobs with car icon and duration

**Optimize Button States:**
- Default: Route Blue background, white text, lightning icon
- Hover: darker blue (#075985)
- Running: animated gradient shimmer, "Optimizing..." text, disabled
- Complete: green flash, shows "Saved X hrs" toast notification, schedule re-renders with new assignments

**Interactions:**
- Drag job from unscheduled bar to a technician column time slot
- Drag job between technician columns to reassign
- Drag job vertically within a column to reschedule time
- Click job block: opens job detail side panel
- Right-click job block: context menu (edit, lock, unschedule, cancel)
- Click Optimize: runs AI optimization on all unscheduled jobs + unlocked scheduled jobs
- Pinch to zoom time scale (tablet)
- Scroll horizontally to see more technicians
- Double-click empty time slot: opens quick job creation for that technician/time

**States:**
- Drag in progress: ghost of card follows cursor, valid drop zones highlight in green, invalid zones in red
- Skill mismatch warning: if dropping a job on a technician without required skills, warning tooltip appears
- Conflict warning: if job overlaps another, red outline and "Time conflict" message
- Locked jobs: padlock icon on job block, cannot be moved or reassigned by optimizer

---

### Screen D4: Job Manager

**Purpose:** Create, edit, search, and manage all jobs. The central registry of work for the company.

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [=] RouteAI              Job Manager                                     │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  ┌──────────────────────────────────────────────────────────┐│
│          │  │ 🔍 Search jobs...        [Filters ▼]     [+ Create Job] ││
│ Schedule │  └──────────────────────────────────────────────────────────┘│
│          │                                                              │
│ Jobs ●   │  [All] [Unscheduled (7)] [Scheduled (55)] [In Progress (6)] │
│          │  [Completed (34)] [Cancelled (2)]                            │
│ Routes   │                                                              │
│          │  ┌──────────────────────────────────────────────────────────┐│
│ Analytics│  │                                                          ││
│          │  │  ┌─────┬────────────┬───────────┬────────┬──────┬─────┐││
│          │  │  │ Pri │ Job        │ Customer  │ Tech   │Status│ Time│││
│          │  │  ├─────┼────────────┼───────────┼────────┼──────┼─────┤││
│          │  │  │ 🔴  │ Water htr  │ J. Smith  │ --     │Unscd │ ASAP│││
│          │  │  │     │ burst      │ 1842 Pine │        │      │     │││
│          │  │  ├─────┼────────────┼───────────┼────────┼──────┼─────┤││
│          │  │  │ 🟡  │ AC not     │ M. Jones  │ Mike R │Sched │ 1PM │││
│          │  │  │     │ cooling    │ 903 Oak   │        │      │     │││
│          │  │  ├─────┼────────────┼───────────┼────────┼──────┼─────┤││
│          │  │  │ 🔵  │ Annual     │ K. Brown  │ Tom B  │Done  │ 9AM │││
│          │  │  │     │ furnace    │ 2105 Elm  │        │✅    │     │││
│          │  │  ├─────┼────────────┼───────────┼────────┼──────┼─────┤││
│          │  │  │ 🔵  │ Thermostat │ P. Davis  │ Mike R │InPrg │ 3PM │││
│          │  │  │     │ install    │ 771 Maple │        │🟢    │     │││
│          │  │  └─────┴────────────┴───────────┴────────┴──────┴─────┘││
│          │  │                                                          ││
│          │  │  Showing 1-20 of 98 jobs          [◀] 1 2 3 4 5 [▶]   ││
│          │  └──────────────────────────────────────────────────────────┘│
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**Job Creation / Edit Modal:**
```
┌────────────────────────────────────────────────────┐
│  Create New Job                              [✕]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ AI Intake ──────────────────────────────────┐ │
│  │ Paste customer message or call transcript:    │ │
│  │ ┌──────────────────────────────────────────┐  │ │
│  │ │ "My AC stopped blowing cold air           │  │ │
│  │ │  yesterday. I'm at 4521 Oak. Can          │  │ │
│  │ │  someone come tomorrow afternoon?"        │  │ │
│  │ └──────────────────────────────────────────┘  │ │
│  │                          [✨ Parse with AI]   │ │
│  └───────────────────────────────────────────────┘ │
│                                                    │
│  ── or fill manually ──                            │
│                                                    │
│  Job Title     [AC Unit Not Cooling - Carrier    ] │
│  Job Type      [Repair              ▼]             │
│  Priority      [High                ▼]             │
│  Description   [Customer reports AC stopped...   ] │
│                [                                 ] │
│                                                    │
│  ── Customer ──                                    │
│  Customer      [🔍 Search or create...           ] │
│  Address       [4521 Oak Street      📍 Verify   ] │
│  Phone         [(555) 234-5678                   ] │
│                                                    │
│  ── Scheduling ──                                  │
│  Date          [Mar 16, 2025        📅]            │
│  Time Window   [12:00 PM] to [5:00 PM]            │
│  Est. Duration [90 min              ▼]             │
│  Required Skills [hvac_repair ✕] [+ Add]          │
│                                                    │
│  ── Notes ──                                       │
│  Notes         [Carrier unit, ~10 yrs old.       ] │
│                [Dog in backyard - use side gate.  ] │
│                                                    │
│            [Cancel]              [Save Job]        │
│                                                    │
└────────────────────────────────────────────────────┘
```

**UI Details:**

**Search and Filters:**
- Search bar: full width, 44px height, search icon left, clear button right
- Searches job title, customer name, address, technician name
- Filter dropdown: date range, job type, technician, priority, status
- Active filters shown as removable pills below the search bar

**Status Tabs:**
- Horizontal tab bar below search
- Each tab shows count in parentheses
- Active tab: underline in Route Blue, bold text
- Counts update in real-time

**Job Table:**
- Sortable columns (click header): Priority, Job, Customer, Technician, Status, Scheduled Time
- Priority column: colored dots (red = emergency, yellow = high, blue = normal, gray = low)
- Status column: colored pill badges
- Row hover: light blue background (#EFF6FF)
- Row click: opens job detail side panel or navigates to full job detail
- Bulk actions: checkbox column, select multiple, batch assign/reschedule/cancel

**AI Intake Section (Job Creation Modal):**
- Expandable section at top of the creation form
- Large text area for pasting customer messages
- "Parse with AI" button with sparkle icon
- When clicked: loading spinner, then form fields populate with AI-parsed values
- AI-populated fields have a subtle sparkle indicator to show they were auto-filled
- All AI-filled fields are editable by the dispatcher

**Address Verification:**
- "Verify" button next to address field triggers geocoding
- Success: green checkmark, lat/lng stored, mini map preview appears
- Failure: red alert, "Address not found. Please verify."
- Address autocomplete via Google Places API as user types

**Interactions:**
- Type in search: results filter in real-time (debounced 300ms)
- Click column header: sort ascending, click again: descending, third click: remove sort
- Click "+ Create Job": modal slides in from right (or opens overlay)
- Click "Parse with AI": sends text to OpenAI, populates form fields
- Click "Save Job": validates required fields, creates job, shows in list
- Click job row: opens detail side panel with full job info, edit button, assign button
- Swipe left on job row (tablet): quick actions (assign, reschedule, cancel)

---

### Screen D5: Route Map

**Purpose:** Full-screen map view showing all technician routes with real-time positions. The operational command center for tracking fleet movement.

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [=] RouteAI              Route Map                 [Traffic] [Satellite]│
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  ┌──────────────────────────────────────────────────────────┐│
│          │  │                                                          ││
│ Schedule │  │                    FULL MAP VIEW                          ││
│          │  │                                                          ││
│ Jobs     │  │     [Mike R. 🟢]                                         ││
│          │  │        ╱                                                  ││
│ Routes ● │  │   ────╱──── (blue route line)                            ││
│          │  │  📍 Job 1 (done)                                          ││
│ Analytics│  │       │                                                   ││
│          │  │  📍 Job 2 (current) ←── Mike is here                      ││
│          │  │       │                                                   ││
│          │  │  📍 Job 3 (next)                                          ││
│          │  │                                                          ││
│          │  │              [Sarah K. 🔵]                                ││
│          │  │                  ╱                                        ││
│          │  │          ──────╱──── (green route line)                   ││
│          │  │         📍 Job 1                                          ││
│          │  │              │                                            ││
│          │  │         📍 Job 2                                          ││
│          │  │                                                          ││
│          │  │                                                          ││
│          │  │  ┌─────────────────────────────────┐                     ││
│          │  │  │ TECHNICIAN PANEL        [▲ ▼]   │                     ││
│          │  │  │                                 │                     ││
│          │  │  │ 🟢 Mike R.  3/5 jobs  78% util  │                     ││
│          │  │  │ 🔵 Sarah K. 2/6 jobs  En Route  │                     ││
│          │  │  │ 🟢 Tom B.   1/3 jobs  On Job    │                     ││
│          │  │  │ ⚪ Lisa M.  4/4 jobs  Done ✅   │                     ││
│          │  │  │ 🔴 Jake P.  2/5 jobs  Behind    │                     ││
│          │  │  │ 🔵 Amy W.   3/7 jobs  Driving   │                     ││
│          │  │  └─────────────────────────────────┘                     ││
│          │  │                                                          ││
│          │  └──────────────────────────────────────────────────────────┘│
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**Technician Detail Popup (Click Technician):**
```
┌──────────────────────────────────────┐
│  Mike R.                    [✕]      │
│  HVAC Specialist                     │
│  Status: On Job (since 10:15 AM)     │
│                                      │
│  Current Job:                        │
│  AC Installation - 4521 Oak St       │
│  Est. Complete: 11:45 AM             │
│                                      │
│  Today's Route:                      │
│  ✅ Furnace Maint - 2105 Elm    8AM  │
│  🟢 AC Install - 4521 Oak     10AM  │
│  🔵 AC Repair - 903 Oak       12PM  │
│  ⚪ Thermostat - 771 Maple     3PM  │
│  ⚪ Inspection - 445 Main      4PM  │
│                                      │
│  📊 Today: 3.2 hrs driving saved     │
│                                      │
│  [📞 Call]  [💬 Message]  [📋 Full]  │
└──────────────────────────────────────┘
```

**UI Details:**

**Map:**
- Full screen minus sidebar, Google Maps with custom "Smart Dispatch" style
- Base map: desaturated/light gray so routes and markers stand out
- Each technician gets a unique route color from a predefined palette
- Route lines: 4px solid, with directional arrows every 200px
- Completed route segments: dashed line, 50% opacity
- Active segment (current travel): animated dashed line (pulse effect)

**Technician Markers:**
- Circular avatar photo (40px) with colored status ring (4px)
- Status ring colors: green (on job), blue (driving), red (behind), gray (idle)
- Real-time position updates every 30 seconds
- Smooth animation between position updates (interpolated movement)
- Tap/click to open detail popup

**Job Markers:**
- Small circles (16px) at job addresses
- Completed: gray filled circle with checkmark
- Current: green pulsing circle
- Upcoming: blue outlined circle
- Click to see job title and assigned technician

**Technician Panel:**
- Bottom-left overlay, collapsible (click header to minimize)
- Semi-transparent white background with blur effect
- Shows all technicians with status dot, name, progress, utilization
- Click technician: map zooms/pans to their location, highlights their route
- Checkboxes to show/hide individual technician routes

**Map Controls:**
- Top-right: Traffic overlay toggle, Satellite view toggle
- Zoom controls (+ / -)
- "Fit All" button: zooms to show all technicians
- Fullscreen toggle

**States:**
- Loading: map loads with skeleton technician panel
- No technicians active: "No technicians are currently on duty" message overlay
- Single technician selected: all other routes fade to 20% opacity
- Traffic overlay enabled: Google traffic layer with color-coded congestion

**Interactions:**
- Click technician marker: popup with full route summary and actions
- Click job marker: popup with job details
- Click technician in panel: map centers on them, highlights their route
- Hover route line: tooltip shows drive time for that segment
- Traffic toggle: overlays real-time traffic data
- Keyboard shortcut: 1-9 to select technicians by order

---

### Screen D6: Analytics

**Purpose:** Historical performance data showing the ROI of RouteAI's optimization. The screen company owners use to justify the subscription cost.

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [=] RouteAI              Analytics       [This Week ▼]  [Export CSV]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│          │  │ Drive Time │ │ Jobs/Day   │ │ Fleet      │ │ Customer │ │
│ Schedule │  │ Saved      │ │            │ │ Util. Rate │ │ Sat.     │ │
│          │  │            │ │            │ │            │ │          │ │
│ Jobs     │  │  22.4 hrs  │ │   5.8      │ │   74%      │ │  4.6/5   │ │
│          │  │  this week │ │  avg/tech  │ │  avg       │ │  avg     │ │
│ Routes   │  │  ▲ +12%    │ │  ▲ +0.4    │ │  ▲ +3%     │ │  ▲ +0.2  │ │
│          │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│ Analytics│                                                              │
│ ●        │  ┌──────────────────────────────────────────────────────────┐│
│          │  │  DRIVE TIME SAVINGS                                      ││
│          │  │                                                          ││
│          │  │  hrs │                                                    ││
│          │  │   5  │          ╱╲                                        ││
│          │  │   4  │    ╱╲  ╱    ╲    ╱╲                               ││
│          │  │   3  │  ╱    ╲╱      ╲╱    ╲                             ││
│          │  │   2  │╱                      ╲╱╲                         ││
│          │  │   1  │                           ╲                       ││
│          │  │      └───┬───┬───┬───┬───┬───┬───┬──                    ││
│          │  │         Mon Tue Wed Thu Fri Sat Sun                      ││
│          │  │                                                          ││
│          │  │  ── Optimized (actual)  -- Manual (estimated baseline)   ││
│          │  └──────────────────────────────────────────────────────────┘│
│          │                                                              │
│          │  ┌────────────────────────┐ ┌──────────────────────────────┐│
│          │  │  TECHNICIAN PERF.      │ │  ON-TIME DELIVERY           ││
│          │  │                        │ │                              ││
│          │  │  Mike R.  ████████ 5.8 │ │  On Time  ████████████ 89%  ││
│          │  │  Sarah K. ███████  5.2 │ │  <15 min  ███         7%   ││
│          │  │  Tom B.   █████    4.1 │ │  >15 min  ██          4%   ││
│          │  │  Lisa M.  ████████ 6.0 │ │                              ││
│          │  │  Jake P.  ████     3.5 │ │  Target: 90%                ││
│          │  │  Amy W.   ██████   4.8 │ │                              ││
│          │  │                        │ │                              ││
│          │  │  avg jobs/day per tech  │ │                              ││
│          │  └────────────────────────┘ └──────────────────────────────┘│
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**UI Details:**

**Time Range Selector:**
- Dropdown: Today, This Week, This Month, Last 30 Days, Custom Range
- Custom range: date picker with start and end dates
- All charts and metrics update when range changes

**Summary Cards (Top Row):**
- Same style as dashboard metric cards
- "Drive Time Saved" is the hero metric, largest font, green highlight
- Comparison arrows show trend vs. previous period

**Drive Time Savings Chart:**
- Line chart with two series: actual (optimized) vs. estimated manual baseline
- Area fill between the two lines to visually show savings
- Optimized line: Route Blue (#0369A1)
- Manual baseline: dashed gray line
- Shaded savings area: light green tint
- Hover any data point: tooltip with exact values
- X-axis: time period, Y-axis: hours of drive time

**Technician Performance (Bar Chart):**
- Horizontal bar chart, one bar per technician
- Sorted by jobs/day (or configurable: on-time rate, utilization, satisfaction)
- Bar color: gradient from green (top performer) to yellow (average) to red (below target)
- Click technician name: drill down to individual technician dashboard

**On-Time Delivery (Donut Chart):**
- Three segments: On Time (green), Slight Delay <15 min (yellow), Late >15 min (red)
- Center: large percentage number for on-time rate
- Target line indicator on the chart
- Hover segment: shows count and percentage

**Additional Charts (scrollable):**
- **Weekly Trends:** multi-line chart of key metrics over 12 weeks
- **Job Type Distribution:** pie chart of repair/install/maintenance/inspection/emergency
- **Peak Hours:** heatmap of job volume by hour-of-day and day-of-week
- **Customer Satisfaction Distribution:** histogram of 1-5 ratings

**Interactions:**
- Click any chart: expands to full-width view with more detail
- Hover data points: tooltips with exact values
- Click "Export CSV": downloads all analytics data for the selected time range
- Click technician in performance chart: navigates to technician detail view
- Toggle between chart types (line/bar/table) for each section

---

## TECHNICIAN APP

The technician app is designed for smartphones (iPhone and Android). It is used in the field, often while driving or wearing work gloves. Every design decision prioritizes glanceability, large touch targets, and minimal interaction.

---

### Screen T1: Login

**Purpose:** Simple login for technicians. Most will stay logged in permanently.

**Layout:**
```
┌─────────────────────────┐
│                         │
│      ┌──────────┐       │
│      │ RouteAI  │       │
│      │ [Icon]   │       │
│      └──────────┘       │
│                         │
│    Technician App       │
│                         │
│  ┌───────────────────┐  │
│  │ Email             │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Password    [Eye] │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    Sign In        │  │
│  └───────────────────┘  │
│                         │
│  Forgot password?       │
│                         │
│  ── or ──               │
│                         │
│  [Sign in with company  │
│   SSO]                  │
│                         │
└─────────────────────────┘
```

**UI Details:**
- Full-screen Route Blue (#0369A1) gradient background (top darker #075985, bottom lighter)
- White card in center with form fields
- Input fields: 52px height (larger than dispatcher for gloved hands)
- Sign In button: GPS Green (#15803D), white text, 52px height
- Company SSO: alternative login for companies with SSO configured
- Biometric login option after first sign-in (Face ID / fingerprint)
- "Stay signed in" toggle checked by default

**States:**
- Default: empty form
- Error: shake animation on form, red error message
- Loading: full-screen spinner with "Connecting to dispatch..." text
- Success: green checkmark, transitions to My Route

---

### Screen T2: My Route

**Purpose:** The primary screen technicians see all day. Shows today's jobs in order with the next job prominently displayed. One tap to start navigation.

**Layout:**
```
┌─────────────────────────┐
│ RouteAI       Mike R. 🟢│
│ Tue, Mar 15   5 jobs    │
├─────────────────────────┤
│                         │
│  NEXT UP                │
│  ┌─────────────────────┐│
│  │                     ││
│  │  AC Repair          ││
│  │  M. Jones           ││
│  │                     ││
│  │  📍 903 Oak Street  ││
│  │                     ││
│  │  🕐 12:00 - 12:30   ││
│  │  ⏱  90 min est.     ││
│  │                     ││
│  │  🚗 15 min away     ││
│  │                     ││
│  │ ┌─────────────────┐ ││
│  │ │   🧭 NAVIGATE   │ ││
│  │ │                 │ ││
│  │ └─────────────────┘ ││
│  │                     ││
│  └─────────────────────┘│
│                         │
│  TODAY'S ROUTE          │
│                         │
│  ✅ AC Install          │
│     4521 Oak  ·  8-10AM │
│     240 min  ·  Done ✓  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  🟢 AC Repair     ← NOW│
│     903 Oak  ·  12-12:30│
│     90 min              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  ⚪ Thermostat Install  │
│     771 Maple ·  3-3:30 │
│     60 min              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  ⚪ Inspection          │
│     445 Main  ·  4-4:30 │
│     45 min              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  ⚪ Furnace Check       │
│     220 Birch ·  5-5:30 │
│     30 min              │
│                         │
├─────────────────────────┤
│  [Route]  [Jobs]  [Time]│
└─────────────────────────┘
```

**UI Details:**

**Header:**
- Height: 64px, background: Route Blue (#0369A1)
- White text: "RouteAI" left, technician name + status dot right
- Subheader: date and total job count

**Next Up Card:**
- Prominent card, takes ~50% of screen height
- White background, rounded corners (16px), heavy shadow (elevation 8)
- Job title: 22px bold, dark text
- Customer name: 18px, gray text
- Address: 18px with pin icon, tappable (opens in maps if tapped before Navigate)
- Appointment window: 18px with clock icon
- Estimated duration: 16px with timer icon
- Drive time: 16px with car icon, updates in real time based on current location and traffic
- NAVIGATE button: GPS Green (#15803D), white text, 56px height, full width of card, rounded (12px), large font (18px bold)

**Today's Route List:**
- Vertical list below the Next Up card
- Each job row: 80px height
- Left side: status icon (checkmark for done, green dot for current, white dot for upcoming)
- Content: job title (16px bold), address (14px gray), time window (14px), duration (14px)
- Current job: highlighted with light green background
- Completed jobs: gray text, strikethrough-style subtle treatment
- Dashed lines between jobs represent drive time segments
- Tap any job: navigates to Job Detail screen

**Bottom Tab Bar:**
- 3 tabs: Route (active, house icon), Jobs (list icon), Time (clock icon)
- Height: 60px (larger for thumb reach)
- Active tab: Route Blue fill icon + text, inactive: gray
- Safe area padding on iPhone X+ devices

**States:**
- No jobs today: "No jobs scheduled for today. Enjoy your day off!" with illustration
- All jobs completed: "All done! Great work today. 5 jobs completed." with stats summary
- Route changed: modal overlay "Route Updated! A new job has been added." with before/after comparison, dismiss button
- Offline: yellow banner at top "Offline. Route data cached. Will sync when connected."

**Interactions:**
- Tap "NAVIGATE": opens Google Maps / Apple Maps with turn-by-turn directions to job address
- Tap any job in the list: navigates to Job Detail screen (T3)
- Pull down to refresh: syncs latest route data from server
- Swipe left on current job: quick "Complete" action
- Swipe right on current job: quick "Call Customer" action
- Long press any upcoming job: options menu (view details, call customer, request reschedule)

---

### Screen T3: Job Detail

**Purpose:** Everything the technician needs to know about a specific job. Customer info, job description, required tools, previous history, and action buttons.

**Layout:**
```
┌─────────────────────────┐
│  ← Back      Job Detail │
├─────────────────────────┤
│                         │
│  AC Repair              │
│  🟡 High Priority       │
│                         │
│  ── Customer ──         │
│                         │
│  M. Jones               │
│  📍 903 Oak Street      │
│     Apt 2B              │
│  📞 (555) 234-5678  [📞]│
│                         │
│  ── Schedule ──         │
│                         │
│  📅 Tue, Mar 15         │
│  🕐 12:00 - 12:30 PM    │
│  ⏱  90 min estimated    │
│                         │
│  ── Description ──      │
│                         │
│  AC unit stopped blowing │
│  cold air yesterday.    │
│  Carrier unit, approx   │
│  10 years old. Customer │
│  says it was serviced    │
│  last spring.           │
│                         │
│  ── Required Tools ──   │
│                         │
│  • Refrigerant gauges   │
│  • Multimeter           │
│  • Carrier service kit  │
│                         │
│  ── Notes ──            │
│                         │
│  Dog in backyard - use  │
│  side gate. Ring        │
│  doorbell, don't knock. │
│                         │
│  ── Previous Visits ──  │
│                         │
│  Mar 12, 2024 - Annual  │
│  tune-up by Tom B.      │
│  "Noted low refrigerant"│
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   ▶ START JOB       ││
│  │                     ││
│  └─────────────────────┘│
│                         │
│  [🔄 Reschedule]  [📋 Add Note]│
│                         │
├─────────────────────────┤
│  [Route]  [Jobs]  [Time]│
└─────────────────────────┘
```

**UI Details:**

**Header:**
- Back arrow + "Job Detail" title
- Tapping back returns to My Route

**Job Title + Priority:**
- Title: 24px bold
- Priority pill: colored badge (red/yellow/blue/gray) next to title

**Customer Section:**
- Name: 20px bold
- Address: 16px, tappable (opens maps)
- Phone: 16px with phone icon, tap-to-call button (green circle with phone icon, 44px)
- If customer has special access instructions, they appear here with a key icon

**Schedule Section:**
- Date, time window, estimated duration
- Clear icons for each (calendar, clock, timer)
- If job is running late, the time window shows in red with "DELAYED" badge

**Description Section:**
- Full job description text, 16px
- If AI-parsed, shows the source (e.g., "From customer text message")
- Scrollable if description is long

**Required Tools Section:**
- Bulleted list of tools/equipment needed
- Auto-generated from job type and equipment model
- Checkable: technician can check off tools they have in the van

**Notes Section:**
- Dispatcher notes and customer notes
- Editable: technician can add notes
- Each note shows author and timestamp
- "Add Note" button opens text input

**Previous Visits Section:**
- Last 3 visits to this address (any customer at this address)
- Shows date, job type, technician name, and key notes
- Helps technician understand history before arriving

**Action Buttons:**
- START JOB: GPS Green (#15803D), 56px height, full width, white text 18px bold
  - Only appears when technician has arrived (or can be tapped manually)
  - When tapped: starts time tracking, updates job status to "in_progress"
  - Changes to "COMPLETE JOB" while job is in progress
- Reschedule: outlined button, opens reschedule reason picker
- Add Note: outlined button, opens note input with optional photo attachment

**States:**
- En Route: NAVIGATE button shown instead of START JOB
- In Progress: START JOB becomes COMPLETE JOB (blue background)
- Completed: all fields visible but read-only, green "Completed" banner at top, "Add Post-Job Notes" option
- Cancelled: gray overlay, "This job has been cancelled by dispatch" message

**Interactions:**
- Tap phone number: initiates phone call
- Tap address: opens in maps app
- Tap "START JOB": starts time tracking, sends "technician arrived" notification to customer
- Tap "COMPLETE JOB": opens completion form (notes, photos, signature if required), marks job done
- Tap "Reschedule": picker with reasons (parts needed, customer not home, job too complex, other)
- Tap "Add Note": text input with camera button for photo attachment
- Swipe photos in previous visits section to see work documentation

---

### Screen T4: Time Tracker

**Purpose:** Automatic time tracking for payroll and job costing. Shows clock-in status, current job timer, and daily time summary.

**Layout:**
```
┌─────────────────────────┐
│  RouteAI     Time Track │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   CLOCKED IN        ││
│  │   Since 7:45 AM     ││
│  │                     ││
│  │   Total Today       ││
│  │   ┌───────────────┐ ││
│  │   │   4h 32m      │ ││
│  │   └───────────────┘ ││
│  │                     ││
│  │  [🔴 Clock Out]     ││
│  │                     ││
│  └─────────────────────┘│
│                         │
│  ── Current Job ──      │
│                         │
│  AC Repair - 903 Oak    │
│  ┌─────────────────────┐│
│  │  ⏱  01:15:33       ││
│  │  (Running...)       ││
│  └─────────────────────┘│
│                         │
│  ── Today's Breakdown ──│
│                         │
│  ┌─────────────────────┐│
│  │ ████████████░░░░░░░ ││
│  │ Job Time   Travel   ││
│  │ 3h 12m     1h 20m   ││
│  └─────────────────────┘│
│                         │
│  ── Time Log ──         │
│                         │
│  7:45 AM  🟢 Clocked In │
│  7:45 AM  🚗 Travel     │
│           → 4521 Oak    │
│           32 min        │
│  8:17 AM  🔧 AC Install │
│           4521 Oak      │
│           3h 15m        │
│  11:32 AM 🚗 Travel     │
│           → 903 Oak     │
│           18 min        │
│  11:50 AM 🔧 AC Repair  │
│           903 Oak       │
│           1h 15m (now)  │
│                         │
│                         │
├─────────────────────────┤
│  [Route]  [Jobs]  [Time]│
└─────────────────────────┘
```

**UI Details:**

**Clock In/Out Card:**
- Top card, prominent, white background with green left border (clocked in) or red (clocked out)
- Status text: "CLOCKED IN" in green or "CLOCKED OUT" in red, 18px bold
- Since time: 14px gray
- Total today: large digital clock style numbers, 36px bold, Route Blue
- Clock Out button: red background, white text, 52px height
  - Clock In button: green background when clocked out
- Confirmation dialog before clock out: "Are you sure? You have 1 job remaining."

**Current Job Timer:**
- Running stopwatch showing time spent on current job
- Large monospace numbers (28px)
- "(Running...)" indicator with pulsing dot
- Only visible when a job is in progress

**Today's Breakdown Bar:**
- Horizontal stacked bar chart
- Green segment: job time (billable)
- Blue segment: travel time
- Gray segment: idle/break time
- Text below: hours and minutes for each category
- Width proportional to shift hours

**Time Log:**
- Chronological list of all events today
- Each entry: timestamp, icon (clock for in/out, car for travel, wrench for job), description, duration
- Travel entries show origin to destination with duration
- Job entries show address and running/final duration
- Current activity has a pulsing green indicator

**States:**
- Not clocked in: large "CLOCK IN" button dominates the screen, no other data shown
- Clocked in, no active job: shows total time, breakdown, and log but no current job timer
- On job: full layout as shown
- End of day: summary card with total hours, billable hours, travel time, jobs completed
- Break: "ON BREAK" status with break timer, resume button

**Interactions:**
- Tap "Clock In": starts the day, records timestamp, shows full time tracker
- Tap "Clock Out": confirmation dialog, then ends the day, shows summary
- Tap "Start Break": pauses work timer, starts break timer
- Tap any time log entry: shows details (for travel: route taken, for job: job detail link)
- Time log is read-only (no manual editing to prevent timesheet fraud)
- Auto-detection: clock in reminder at shift start time, clock out reminder at shift end

---

### Screen T5: Notifications

**Purpose:** Real-time alerts for route changes, new job assignments, and schedule updates. Accessible from any screen via notification badge.

**Layout:**
```
┌─────────────────────────┐
│  ← Back   Notifications │
├─────────────────────────┤
│                         │
│  TODAY                  │
│                         │
│  ┌─────────────────────┐│
│  │ 🔴 Route Changed     ││
│  │ 2 min ago           ││
│  │                     ││
│  │ Emergency job added ││
│  │ to your route.      ││
│  │ Water heater burst  ││
│  │ at 1842 Pine St.    ││
│  │ Inserted as Job #3. ││
│  │                     ││
│  │ [View Updated Route]││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 🔵 New Assignment    ││
│  │ 45 min ago          ││
│  │                     ││
│  │ Thermostat Install  ││
│  │ added for 3:00 PM   ││
│  │ at 771 Maple St.    ││
│  │                     ││
│  │ [View Job Details]  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 🟢 Schedule Updated  ││
│  │ 3 hrs ago           ││
│  │                     ││
│  │ Your route has been ││
│  │ optimized. Jobs     ││
│  │ reordered for less  ││
│  │ drive time.         ││
│  │ Saved: 35 min.      ││
│  │                     ││
│  │ [View Route]        ││
│  └─────────────────────┘│
│                         │
│  YESTERDAY              │
│                         │
│  ┌─────────────────────┐│
│  │ ⚪ Shift Reminder    ││
│  │ Yesterday, 6:30 PM  ││
│  │                     ││
│  │ Tomorrow you have   ││
│  │ 5 jobs starting at  ││
│  │ 8:00 AM. First job: ││
│  │ AC Install at       ││
│  │ 4521 Oak Street.    ││
│  └─────────────────────┘│
│                         │
├─────────────────────────┤
│  [Route]  [Jobs]  [Time]│
└─────────────────────────┘
```

**UI Details:**

**Notification Cards:**
- White background, rounded corners (12px), subtle shadow
- Left border color varies by type:
  - Red: route change / emergency
  - Blue: new job assignment
  - Green: optimization / positive update
  - Gray: informational / reminder
- Header: icon + type label (16px bold) + relative timestamp (14px gray)
- Body: description text (16px), clear and concise
- Action button: text button in Route Blue, navigates to relevant screen
- Unread: dot indicator and slightly bolder background

**Section Headers:**
- "TODAY", "YESTERDAY", "OLDER" — gray uppercase text, 12px, with horizontal rule

**Badge:**
- Notification count badge on the bell icon in the header (visible from any screen)
- Red circle with white number, max "9+"
- Clears when notifications screen is opened

**Notification Types:**
- Route Changed: any modification to today's route (new job, reorder, job removed)
- New Assignment: job assigned to this technician
- Schedule Updated: optimization ran, route reordered
- Job Cancelled: a scheduled job was cancelled
- Shift Reminder: evening reminder about tomorrow's schedule
- Message from Dispatch: free-text message from dispatcher

**States:**
- No notifications: "All caught up! No new notifications." with checkmark illustration
- Unread notifications: blue dot on each unread card, badge count in tab bar
- Loading: skeleton cards

**Interactions:**
- Tap notification card: navigates to relevant screen (route, job detail, etc.)
- Swipe left on notification: dismiss/archive
- "Mark all as read" option in header (overflow menu)
- Push notification tapped from outside app: deep links to relevant screen
- Critical notifications (route change, emergency) trigger a full-screen interstitial that must be acknowledged

---

## Shared Design Patterns

### Navigation Architecture

**Dispatcher App:**
```
Sidebar Navigation (always visible on tablet/desktop)
├── Dashboard
├── Schedule Board
├── Job Manager
├── Route Map
├── Analytics
└── Settings
    ├── Company Profile
    ├── Technician Management
    ├── Notification Templates
    ├── Integrations
    └── Billing
```

**Technician App:**
```
Bottom Tab Navigation (3 tabs)
├── Route (My Route)
│   └── Job Detail (stack)
├── Jobs (All Jobs list)
│   └── Job Detail (stack)
└── Time (Time Tracker)

Notifications: Accessible via bell icon in header from any tab
```

### Component Library

**Job Card (Used in both apps):**
```
┌──────────────────────────┐
│ 🟡 High   AC Repair      │
│                          │
│ 📍 903 Oak Street        │
│ 🕐 12:00 - 12:30 PM      │
│ ⏱  90 min  │ 🔧 Mike R.  │
│                          │
│ [In Progress ●]          │
└──────────────────────────┘
```
- Rounded corners: 12px
- Padding: 16px
- Status pill: bottom-left, colored background with white text
- Shadow: subtle elevation (2px)
- Tap: navigates to job detail
- Long press (technician app): quick actions menu

**Status Pill:**
```
[Unscheduled]  — Gray background (#6B7280), white text
[Scheduled]    — Blue background (#0369A1), white text
[En Route]     — Blue with pulsing animation
[In Progress]  — Green background (#15803D), white text
[Completed]    — Green background, checkmark icon
[Behind]       — Red background (#DC2626), white text
[Cancelled]    — Dark gray, strikethrough text
```

**Technician Avatar with Status:**
```
┌────┐
│ MR │ ← Initials or photo
│    │
└────┘
  🟢   ← Status dot (green/blue/red/gray)
```
- Circular, 40px (dispatcher) or 48px (technician)
- Photo or initials on colored background
- Status dot: 12px, positioned bottom-right, with white outline ring

**Optimize Button:**
```
┌─────────────────────────┐
│  ⚡ Optimize Routes      │
│                         │
│  Before: 18.5 hrs drive │
│  After:  12.1 hrs drive │
│  Saved:  6.4 hrs (35%)  │
└─────────────────────────┘
```
- Pre-optimization: Route Blue button with lightning icon
- Post-optimization: expanded card showing before/after metrics
- Metrics in green to emphasize savings
- "Apply" and "Discard" buttons on the results card

### Responsive Breakpoints

| Breakpoint | Device | Layout |
|------------|--------|--------|
| < 768px | Phone (Technician App) | Single column, bottom tabs, large touch targets |
| 768-1024px | Tablet Portrait (Dispatcher) | Sidebar collapsed to icons, main content full width |
| 1024-1440px | Tablet Landscape / Small Desktop | Sidebar expanded, two-column layouts |
| > 1440px | Desktop Monitor | Sidebar expanded, three-column layouts, full analytics |

### Accessibility

- All interactive elements: minimum 44px touch target (iOS HIG), 48px preferred for technician app
- Color contrast: AA minimum (4.5:1 for normal text, 3:1 for large text)
- Status is never conveyed by color alone (always paired with icon/text)
- Screen reader labels on all map markers and interactive elements
- Reduced motion option: disable route line animations and pulse effects
- Dark mode: deep navy (#0C1322) background for all-day use, all text/icon contrasts verified
