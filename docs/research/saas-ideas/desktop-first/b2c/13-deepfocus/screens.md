# DeepFocus -- Screens

## Navigation Architecture

```
App Launch
  |
  +-- First Launch? --> Onboarding Flow (4 steps)
  |
  +-- Returning User --> Home Dashboard
       |
       +-- Sidebar Navigation
       |    +-- Home (Dashboard)
       |    +-- Session (Start/Active)
       |    +-- Analytics
       |    +-- Soundscapes
       |    +-- Focus History
       |    +-- Settings
       |    +-- Account
       |
       +-- System Tray (always accessible)
            +-- Quick Start Session
            +-- Current Session Status
            +-- Pause / End Session
            +-- Open App
            +-- Quit
```

**Navigation Pattern:** Persistent left sidebar (collapsible to icons). Sidebar is always visible except during an active focus session, where it can be minimized to a floating mini-timer.

---

## Screen 1: Welcome / Onboarding

**Purpose:** First-run experience that gathers user preferences to personalize the AI from day one. Sets expectations and creates initial excitement.

### Step 1: Welcome

**Layout:**
- Full-screen dark background with subtle animated gradient (deep blue to midnight)
- DeepFocus logo centered with gentle breathing animation
- Tagline: "Your AI Focus Architect"
- "Get Started" primary button
- "I've used DeepFocus before" link for account recovery

**UI Elements:**
- Logo: 120px, centered, animated opacity pulse
- Tagline: Satoshi font, 20px, muted silver
- CTA button: Full-width (max 320px), amber accent (#E8A838), rounded-lg
- Background: CSS animated gradient, 8-second cycle

### Step 2: Work Style Quiz

**Layout:**
- Progress bar (Step 2 of 4) at top
- Question card centered with large text
- Option cards in a 2x2 grid or vertical list

**Questions:**
1. "What best describes your work?" -- Developer / Writer / Designer / Researcher / Student / Other
2. "When do you feel most focused?" -- Early morning / Late morning / Afternoon / Evening / Night
3. "How long can you typically focus without a break?" -- 15 min / 25 min / 45 min / 60+ min
4. "What's your biggest distraction?" -- Social media / News / Messages / Email / Other apps

**UI Elements:**
- Question text: Satoshi, 24px, white
- Option cards: Surface background (#141B2D), border on hover (sage green), selected state with checkmark
- Progress dots: 4 dots, active dot is amber, inactive dots are muted
- Back/Next buttons at bottom

### Step 3: App Permissions

**Layout:**
- List of permission requests with toggle switches
- Each permission has icon, title, and explanation

**Permissions Requested:**
- Notification access: "Silence notifications during focus sessions"
- Accessibility access (macOS): "Detect which app you're using to block distractions"
- Calendar access (optional): "Read your calendar to plan around meetings"
- Microphone (optional, future): "Ambient noise detection for soundscape adjustment"

**UI Elements:**
- Permission row: Icon (24px Lucide) + Title (16px, white) + Description (14px, muted) + Toggle
- Toggle: Custom styled, sage green when active
- "Skip for now" link at bottom
- System permission dialogs triggered by toggle activation

### Step 4: First Session Prompt

**Layout:**
- Celebratory message: "You're all set!"
- Summary card showing personalized defaults based on quiz answers
- "Start Your First Session" large CTA button
- "Explore the app first" secondary link

**UI Elements:**
- Confetti-like particle animation (subtle, 3 seconds)
- Summary card: shows recommended session duration, soundscape, blocking mode
- CTA: Amber button, large (48px height), full-width max 320px

**States:**
- Loading: Skeleton screens during permission checks
- Error: If a required permission is denied, show explanation and retry option
- Complete: Redirect to Home Dashboard with a one-time tooltip tour

---

## Screen 2: Home Dashboard

**Purpose:** The daily command center. Shows today's focus plan, current streak, focus score, and quick-start session options.

### Layout (Three-Column)

**Left Column (Sidebar, 240px):**
- App logo (compact, 32px)
- Navigation items with icons: Home, Session, Analytics, Soundscapes, History, Settings, Account
- Active state: sage green left border, slightly lighter background
- Bottom: user avatar, name, subscription badge
- Collapse button to shrink to 64px icon-only mode

**Center Column (Main Content):**
- Greeting: "Good morning, [Name]" (time-aware)
- Today's Focus Plan card (AI-generated or manual)
  - List of planned sessions with task name, estimated duration, suggested time
  - "Start Next" button on the top session
  - Drag to reorder, click to edit
- Quick Start card
  - "Start a focus session" with task description input and duration selector
  - Recent tasks dropdown for quick repeat
- Today's Progress bar
  - Visual bar showing completed vs. planned focus time
  - "2h 15m of 4h goal completed"

**Right Column (Stats Sidebar, 280px):**
- Focus Score gauge (circular, 0-100, current score with trend arrow)
- Streak counter: flame icon + "12 days" with streak badge
- Today's stats: Sessions completed, distractions blocked, total focus time
- Weekly mini-chart: bar chart of focus hours per day this week
- Tip of the day: AI-generated productivity tip

### UI Elements

| Element              | Specs                                                    |
| -------------------- | -------------------------------------------------------- |
| Greeting             | Satoshi, 28px, white, dynamically time-aware             |
| Focus Plan card      | Surface bg, 16px padding, rounded-xl, subtle border     |
| Session item         | 48px row, task name + duration + soundscape icon         |
| Quick Start input    | 44px height, placeholder "What are you working on?"     |
| Focus Score gauge    | 120px diameter, SVG ring, score number in DM Mono       |
| Streak badge         | Amber gradient background, flame Lucide icon             |
| Mini chart           | 7 bars, sage green fill, current day highlighted amber   |

### States

- **Empty state (new user):** Replace plan card with onboarding CTA -- "Plan your first focus day"
- **All sessions complete:** Celebratory state -- "You crushed it today!" with confetti
- **Session active:** Dashboard shows mini-timer in header, "Return to session" banner
- **Offline:** Show cached data with "Offline" badge, sync when reconnected

---

## Screen 3: Session Setup

**Purpose:** Configure and launch a focus session. User describes their task, selects duration and environment, and starts focusing.

### Layout

**Center Card (max-width 560px, centered):**

**Task Input Section:**
- "What are you working on?" -- large text input (Satoshi, 20px)
- AI suggestion chips below input based on recent tasks and calendar events
- Task category auto-detected badge (Writing, Coding, Design, Research, Admin)

**Duration Section:**
- Horizontal slider with preset markers: 15, 25, 30, 45, 60, 90 min
- "AI Recommended: 45 min" label above slider when AI has a suggestion
- Custom input field for exact minutes
- Break duration auto-set (scales with session: 5 min for <30, 10 min for 30-60, 15 min for 60+)

**Environment Section:**
- Soundscape selector: horizontal scroll of soundscape cards (Rain, Coffee Shop, Lo-fi, etc.)
- Each card: 80x100px, icon, name, "Preview" button (plays 5-second sample)
- "None" option for silence preference
- Blocking mode selector: Strict / Moderate / Light (with tooltip explaining each)

**Action:**
- "Start Focusing" large CTA button (amber, 52px height, full-width)
- Keyboard shortcut hint: "or press Enter"

### States

- **Loading:** AI classification shimmer on task category badge
- **AI suggestion available:** Pulsing badge "AI suggests 45 min with Lo-fi for coding tasks"
- **Returning user:** "Repeat last session" quick-start option
- **Error:** If audio engine fails to initialize, fall back to silence with notification

---

## Screen 4: Active Session

**Purpose:** The focus experience. Minimal, distraction-free interface showing timer, ambient controls, and blocked notification summary.

### Layout

**Full-Screen Mode (default):**

**Center: Timer Ring**
- Large circular timer (280px diameter)
- SVG ring with smooth countdown animation
- Time remaining in DM Mono font (48px): "23:47"
- Task name below timer (Satoshi, 18px, muted)
- Session type badge: "Deep Focus" / "Light Focus"
- Subtle breathing animation on the ring (gentle opacity pulse synced to 4-second cycle)

**Bottom Left: Ambient Controls**
- Current soundscape name and icon
- Volume slider (horizontal, 120px)
- "Change Sound" button opens soundscape mini-picker (overlay, not full navigation)
- Individual layer controls (expandable)

**Bottom Right: Session Controls**
- Pause button (circle, 48px)
- End Session button (secondary, text-only)
- Extend Session button: "+15 min"
- Mini-stats: "3 distractions blocked" with shield icon

**Top Right: Minimal Status**
- Current time (small, muted)
- Battery indicator (if low)
- "Blocked notifications: 4" -- clickable to see list (expands panel)

**Blocked Notification Panel (Slide-in from right):**
- List of suppressed notifications with app icon, preview text, and timestamp
- "These will be delivered when your session ends"
- "Allow this app" button per notification (adds to allowlist for current session)

### Distraction Interception Overlay

**When user switches to a blocked app:**
- Semi-transparent overlay covers the blocked app window
- Message: "This app is blocked during your session"
- Timer: "Session ends in 23:47"
- "Return to focus" button (primary, amber)
- "Allow for 2 minutes" button (secondary, muted)
- "Allow for this session" text link (adds friction -- must type app name)

### UI Elements

| Element                | Specs                                                |
| ---------------------- | ---------------------------------------------------- |
| Timer ring             | SVG, 4px stroke, sage green track, amber progress    |
| Time display           | DM Mono, 48px, white, tabular lining numerals        |
| Task name              | Satoshi, 18px, muted silver                          |
| Soundscape controls    | 32px icons, horizontal layout, subtle bg on hover    |
| Pause button           | 48px circle, border only, pause icon centered        |
| Blocked count badge    | 24px circle, amber bg, white number                  |
| Distraction overlay    | rgba(10,14,26,0.92), blur(8px) backdrop              |

### States

- **Focusing:** Default state, timer counting down, ambient playing
- **Paused:** Timer stops, ring dims, "Resume" button replaces Pause, pause duration tracked
- **Extended:** Timer updated with new duration, subtle flash confirmation
- **Flow state detected:** Ring glow intensifies (amber to gold gradient), small "In Flow" badge
- **Session ending (final 60 seconds):** Gentle pulse animation on timer, volume auto-reduces
- **Auto-pause (idle >5 min):** "Are you still focusing?" prompt with resume/end options

---

## Screen 5: Session Complete

**Purpose:** Post-session summary with stats, reflection prompt, and transition to break or next session.

### Layout

**Center Card (max-width 520px):**

**Header:**
- Checkmark animation (green circle expanding)
- "Session Complete!" (Satoshi, 28px)
- Task name recalled

**Stats Grid (2x2):**
- Duration: "45 minutes" (actual time)
- Focus Score: "87/100" with circular mini-gauge
- Distractions Blocked: "7 attempts"
- Soundscape Used: "Coffee Shop"

**Reflection Prompt (optional):**
- "How was this session?" -- 5-star rating (or 3 emoji: rough/okay/great)
- Optional text field: "Any notes?" (for personal journaling)

**Next Actions:**
- "Take a Break" button (primary) -- starts break timer with activity suggestion
- "Start Another Session" button (secondary)
- "Done for Now" text link

**Achievement Toast (conditional):**
- Slides in from top if a milestone is reached: "New personal best: 3 sessions today!"

### States

- **First ever session:** Extra celebration, tutorial tooltip pointing to analytics
- **Session abandoned (ended early):** Supportive message -- "Every session counts, even short ones"
- **Streak milestone reached:** Special badge animation
- **All daily sessions complete:** "You've completed your focus plan for today!"

---

## Screen 6: Analytics

**Purpose:** Deep dive into focus patterns and trends. Helps users understand their productivity profile and track improvement.

### Layout

**Tab Bar (top):** Daily | Weekly | Monthly

**Daily View:**
- Date picker (left/right arrows, click to open calendar)
- Timeline visualization: 24-hour horizontal bar showing focus sessions as colored blocks
- Session list below timeline with expandable details
- Daily summary stats: total time, sessions, avg score, avg session length

**Weekly View:**
- Bar chart: focus hours per day (7 bars)
- Focus score line chart overlaid on bars
- Heatmap: 7x24 grid showing focus quality by hour and day
- Category breakdown: horizontal stacked bar (writing, coding, design, etc.)
- AI insight card: "Your most productive slot this week was Tuesday 9-11 AM"

**Monthly View:**
- Calendar grid with color-coded days (green=good, amber=moderate, gray=no sessions)
- Monthly totals: hours, sessions, avg score, streak
- Trend line: focus score over 30 days with trendline
- Month-over-month comparison: "+12% focus time vs. last month"
- Export button: download CSV

### UI Elements

| Element              | Specs                                                    |
| -------------------- | -------------------------------------------------------- |
| Tab bar              | Pill-style tabs, active tab has sage green bg            |
| Bar chart            | Sage green bars, amber accent for current/selected day   |
| Heatmap              | 5 color levels from #141B2D (no data) to #7FB069 (peak) |
| Category badges      | Colored dots with labels, consistent across app          |
| AI insight card      | Subtle border, lightbulb icon, italic text               |
| Date picker          | Compact, arrow nav, calendar dropdown on click           |

### States

- **No data for period:** "No sessions recorded this [day/week/month]" with CTA to start
- **Loading:** Skeleton chart placeholders with shimmer
- **Data export in progress:** Progress indicator, success toast on completion

---

## Screen 7: Soundscape Library

**Purpose:** Browse, preview, and customize ambient soundscapes. Save custom mixes.

### Layout

**Header:** "Soundscapes" title + search bar

**Category Tabs:** All | Nature | Urban | Music | Noise | Custom

**Soundscape Grid (3 columns):**
- Each card: 200x180px
  - Background: subtle gradient matching soundscape mood
  - Icon (centered, 48px): rain cloud, coffee cup, headphones, etc.
  - Name (16px, white): "Rain on Window"
  - Preview button (play icon overlay on hover)
  - "Customize" link below name

**Selected Soundscape Detail Panel (expands below grid or slides in):**
- Layer mixer: vertical sliders for each audio layer
  - Rain: Main rain | Thunder | Gutter drip | Wind
  - Coffee Shop: Crowd murmur | Espresso machine | Cup clinks | Background music
- Master volume slider
- "Save as Preset" button
- "Set as Default" toggle (per task category)

**Custom Mix Section:**
- "Create New Mix" card in grid
- Opens layer selector: choose layers from different soundscapes
- Name your mix, save to library

### States

- **Playing preview:** Card has pulsing border (amber), speaker icon animated
- **Customizing:** Detail panel expanded, other cards dimmed
- **Free tier limit:** Some soundscapes show lock icon, "Upgrade to unlock" tooltip
- **Loading audio:** Waveform loading animation inside card

---

## Screen 8: Settings

**Purpose:** Configure blocking rules, app permissions, notification preferences, and session defaults.

### Layout

**Settings Sections (vertical scroll, section anchors in right-side mini-nav):**

**General:**
- Start DeepFocus at login (toggle)
- Show in system tray (toggle)
- Default session duration (number input with stepper)
- Default break duration (number input with stepper)
- Day start time (for analytics grouping, dropdown: 5 AM - 12 PM)
- Keyboard shortcuts (customizable, table of action + shortcut)

**Blocking Rules:**
- App/website list with three-state toggle: Always Block | Context-Dependent | Always Allow
- "Add app or website" input with autocomplete from installed apps
- Blocking mode default: Strict / Moderate / Light (radio group)
- "Emergency bypass" settings: enable/disable, cooldown period
- "Blocked app behavior" toggle: Overlay vs. Redirect to DeepFocus

**Notifications:**
- Suppress all notifications during sessions (toggle)
- Allow notifications from specific apps (multi-select)
- Session start/end sounds (toggle + sound picker)
- Daily report notification time (time picker)
- Weekly report day (dropdown: Sunday - Saturday)

**Audio:**
- Default soundscape (dropdown)
- Audio output device (dropdown of system audio devices)
- Master volume default (slider)
- Fade-in duration at session start (slider: 0-10 seconds)
- Fade-out duration at session end (slider: 0-10 seconds)

**Privacy:**
- Keep data on device only (toggle -- disables cloud sync)
- Analytics data retention period (dropdown: 30 days, 90 days, 1 year, forever)
- Delete all session data (destructive button with confirmation dialog)
- Export all data (JSON/CSV download)

**Integrations:**
- Google Calendar: Connect/Disconnect, sync status
- Slack: Connect/Disconnect, workspace name shown
- Spotify: Connect/Disconnect, for ambient playlist alternative
- Apple Health: Connect/Disconnect, data access scope shown

### UI Elements

| Element              | Specs                                                    |
| -------------------- | -------------------------------------------------------- |
| Section headers      | Satoshi, 20px, white, sticky on scroll                   |
| Toggle switches      | 44x24px, sage green active, muted inactive               |
| Input fields         | 40px height, surface bg, subtle border, focus ring amber |
| Destructive buttons  | Red text, confirmation dialog with "Type DELETE to confirm" |
| Integration cards    | App icon + name + status badge (Connected/Disconnected)  |

---

## Screen 9: Focus History

**Purpose:** Chronological log of all past focus sessions with search and filter capabilities.

### Layout

**Top Bar:**
- Search input: "Search by task name..."
- Filter dropdowns: Date range | Task category | Soundscape | Min. focus score
- Sort: Newest first / Oldest first / Highest score / Longest duration

**Session List (scrollable):**
- Each session row: Date/time | Task name | Duration | Focus score badge | Soundscape icon
- Expandable detail on click: full stats, blocked apps list, user notes/reflection, score breakdown
- Batch select for deletion (checkbox per row)

**Summary Footer (sticky bottom):**
- "Showing 47 sessions | Total: 38h 22m | Avg Score: 74"

### States

- **Empty history:** "Complete your first session to see it here" with CTA
- **Filtered with no results:** "No sessions match your filters" with clear filters button
- **Loading more:** Infinite scroll with skeleton rows

---

## Screen 10: Account / Subscription

**Purpose:** User profile, subscription management, and account actions.

### Layout

**Profile Section:**
- Avatar (uploadable, 80px circle, fallback to initials)
- Display name (editable inline)
- Email (shown, not editable inline -- "Change email" link)
- Work type (dropdown, editable)
- Timezone (auto-detected, editable dropdown)

**Subscription Section:**
- Current plan card: plan name, price, renewal date
- Feature comparison table (Free vs. Focus vs. Pro)
- "Upgrade" / "Manage Subscription" button
- Billing history link (opens Stripe customer portal)
- Cancel subscription link (with retention survey)

**Account Actions:**
- Change password
- Connected accounts (Google, Apple)
- Sign out
- Delete account (destructive, requires password confirmation)

### States

- **Free tier:** Upgrade CTA prominent, feature limits shown
- **Paid tier:** "Manage" button, next billing date shown
- **Trial active:** Days remaining banner, upgrade CTA

---

## Screen 11: Break Screen

**Purpose:** Guided break experience between focus sessions. Encourages restorative activities instead of phone scrolling.

### Layout

**Full-Screen (replaces session screen):**

**Header:**
- "Break Time" (Satoshi, 24px)
- Break timer: countdown in DM Mono (e.g., "4:32 remaining")

**Activity Suggestion Card (centered, max-width 400px):**
- Activity icon (64px, Lucide)
- Activity name: "Box Breathing" / "Desk Stretch" / "Hydration Check" / "Walk Around"
- Brief description (1-2 sentences)
- Guided content (if applicable):
  - Breathing: animated circle expanding/contracting with inhale/exhale labels
  - Stretch: simple illustration + text instructions (3 steps)
  - Walk: step counter estimate ("A 5-minute walk is ~500 steps")
  - Hydrate: water glass icon filling animation

**Bottom Controls:**
- "Try a different activity" (secondary button, cycles to next suggestion)
- "Skip break" link (muted text)
- "Extend break" button (+5 minutes)
- "Start Next Session" button (appears when break timer ends, becomes primary)

**Ambient:**
- Soundscape continues at reduced volume during break (unless user paused)
- Nature sounds preferred during breaks regardless of session soundscape

### States

- **Active break:** Timer counting, activity displayed
- **Break extended:** Timer updated, no judgment
- **Break skipped:** Logged but no penalty, goes to session setup or dashboard
- **Break complete:** Gentle chime, "Ready for another session?" prompt with auto-start countdown (10 seconds)

---

## Global UI Patterns

### Command Palette (Cmd+K / Ctrl+K)

- Quick access to all major actions: Start session, open settings, switch soundscape, view analytics
- Fuzzy search across tasks, soundscapes, settings
- Recent items section at top
- Keyboard-navigable

### Toast Notifications (In-App)

- Position: bottom-right
- Duration: 4 seconds (auto-dismiss), persistent for errors
- Types: Success (sage green border), Info (blue border), Warning (amber border), Error (red border)
- Action button optional (e.g., "Undo" on session end)

### Loading States

- Skeleton screens for content areas (matching layout shapes)
- Spinner for action buttons (replaces button text)
- Shimmer effect for data loading (subtle left-to-right shine)

### Empty States

- Every screen with potential empty state has: illustration/icon, message, CTA
- Messages are encouraging, not clinical ("Start your first session" not "No data available")

### Accessibility

| Requirement              | Implementation                                    |
| ------------------------ | ------------------------------------------------- |
| Keyboard navigation      | Full tab-order, focus rings (amber), skip links   |
| Screen reader            | ARIA labels on all interactive elements, live regions for timer updates |
| Color contrast           | WCAG AA minimum on all text (4.5:1 ratio)         |
| Motion reduction         | Respects `prefers-reduced-motion`, disables animations |
| Font scaling             | Responsive to system font size preferences         |
| Focus indicators         | Visible, high-contrast focus rings (2px amber)     |

### Responsive Behavior (Window Resizing)

| Window Width     | Layout Adaptation                                  |
| ---------------- | -------------------------------------------------- |
| > 1200px         | Full three-column layout (sidebar + main + stats)  |
| 900-1200px       | Two columns (sidebar collapses to icons, stats below main) |
| 600-900px        | Single column (sidebar hidden, hamburger menu)     |
| < 600px          | Compact mode (mini-timer only, minimal controls)   |

### System Tray Menu

- Always accessible even when main window is closed
- Items: Quick Start (opens session setup), Current Status (Focusing / On Break / Idle), Pause/Resume/End Session, Today's Stats (inline), Open DeepFocus, Quit
- Tray icon changes state: default (gray), focusing (amber glow), break (sage green)
