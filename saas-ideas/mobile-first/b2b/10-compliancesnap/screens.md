# ComplianceSnap -- Screens & Navigation

## Navigation Architecture

```
[Auth Stack]                          [Main Tab Navigator]
  |                                      |
  +-- Login                              +-- Dashboard (Tab 1)
  +-- Forgot Password                    |     +-- Facility Detail
  +-- SSO/Enterprise Login               |     +-- Analytics/Trends
                                         |
                                         +-- Inspections (Tab 2)
                                         |     +-- New Inspection (Wizard)
                                         |     +-- Inspection Detail
                                         |     +-- Violation Detail
                                         |
                                         +-- Scanner (Tab 3 -- Center FAB)
                                         |     +-- Camera Scanner
                                         |     +-- Scan Results
                                         |
                                         +-- Reports (Tab 4)
                                         |     +-- Report History
                                         |     +-- Report Builder
                                         |     +-- Report Preview
                                         |
                                         +-- More (Tab 5)
                                               +-- Corrective Action Tracker
                                               +-- Regulation Library
                                               +-- Team Management
                                               +-- Facility Management
                                               +-- Settings
```

### Tab Bar Design

The bottom tab bar uses 5 tabs with the center tab (Scanner) as an elevated floating action button (FAB) -- the primary action. The FAB is safety yellow (#FFC107) and 20% larger than other tab icons.

```
+--------+--------+--------+--------+--------+
|        |        |  [AI]  |        |        |
| Dash   | Inspec |  SCAN  | Report |  More  |
+--------+--------+--------+--------+--------+
```

---

## Screen 1: Login

**Purpose**: Authenticate users. Support email/password, SSO, and magic link for enterprise customers.

**UI Elements**:
- ComplianceSnap logo (centered, top 25% of screen)
- Tagline: "OSHA-ready in one snap" below logo
- Email input field (56px height, large touch target)
- Password input field with show/hide toggle
- "Sign In" primary button (full width, safety yellow background, charcoal text)
- "Forgot Password?" text link below sign-in button
- Divider: "or continue with"
- SSO buttons: "Sign in with Microsoft" / "Sign in with Google" (enterprise SSO)
- "Sign in with Magic Link" option (email-based passwordless)
- Footer: "Don't have an account? Contact Sales"

**States**:
- Default: Empty form
- Loading: Spinner on sign-in button, inputs disabled
- Error: Red border on invalid fields, error message below field ("Invalid email address", "Incorrect password")
- SSO redirect: Loading overlay with "Redirecting to your identity provider..."
- Offline: Banner at top "No internet connection. Sign-in requires connectivity."

**Accessibility**:
- All inputs labeled with accessible names
- Error messages announced to screen reader
- Minimum 4.5:1 contrast ratio on all text
- Tab order: email -> password -> sign in -> forgot password -> SSO options

---

## Screen 2: Facility Dashboard

**Purpose**: Primary home screen showing compliance status across all facilities the user has access to.

**UI Elements**:
- **Header**: Organization name, user avatar (profile menu), notification bell with badge count
- **Sync status bar** (top): Green "All synced" or amber "3 items pending sync" with progress indicator
- **Compliance score card** (prominent): Large circular gauge showing overall compliance score (0-100), color-coded (green >80, yellow 60-80, red <60)
- **Quick stats row**: 4 mini cards:
  - Open violations (count, red if critical exist)
  - Inspections this month (count vs. target)
  - Overdue actions (count, red if any)
  - Risk score (trending arrow)
- **Facility list** (scrollable): Each facility card shows:
  - Facility name and type icon (factory, warehouse, job site)
  - Mini compliance score gauge
  - Open violation count by severity (color-coded dots)
  - Last inspection date
  - Next scheduled inspection date
  - Chevron for drill-down
- **Floating scan button**: Persistent FAB in bottom-right (safety yellow, camera icon) for quick scan access
- **Pull-to-refresh**: Updates data from server

**States**:
- Loading: Skeleton cards while data fetches
- Empty: "No facilities yet. Add your first facility to get started." with "Add Facility" button
- Offline: Amber banner with "Offline mode -- showing cached data"
- Single facility: Simplified view without facility list (starter plan)
- Multi-facility: Map toggle option showing facilities on map with color-coded pins

**Navigation**:
- Tap facility card -> Facility Detail screen
- Tap notification bell -> Notification list
- Tap compliance score -> Analytics/Trends screen
- Tap scan FAB -> Camera Scanner screen
- Tap "Open violations" stat -> Filtered violation list

---

## Screen 3: New Inspection (Wizard)

**Purpose**: Guide the user through setting up a new inspection with a step-by-step wizard.

**Wizard Steps**:

**Step 1: Select Facility**
- List of user's facilities with search filter
- Each facility shows name, address, last inspection date
- "Add New Facility" option at bottom
- Single-tap selection with checkmark indicator

**Step 2: Inspection Type**
- Card grid (2 columns) of inspection types:
  - Routine Safety Walk
  - PPE Compliance Audit
  - Fire Safety Inspection
  - Chemical Storage Check
  - Machine Guarding Audit
  - Pre-OSHA Audit Prep
  - Incident Follow-up
  - Custom Inspection
- Each card: Icon, name, estimated duration, item count
- Single selection

**Step 3: Checklist Selection**
- Recommended checklist based on type (pre-selected)
- Browse checklist library option
- "Create custom checklist" option
- Checklist preview: Expandable list of items
- Item count and estimated completion time

**Step 4: Team Assignment** (optional)
- List of team members with role badges
- Multi-select for co-inspectors
- "Just me" quick option
- Assignment notifications preview

**Step 5: Confirm & Start**
- Summary card showing: Facility, Type, Checklist, Team, Date/Time
- GPS location auto-detected and displayed
- "Start Inspection" primary button (safety yellow, full width)
- "Save as Draft" secondary button

**UI Elements Common to All Steps**:
- Progress bar at top (5 segments)
- Step title and description
- Back button (top-left)
- Step indicator dots
- "Skip" option on optional steps

**States**:
- GPS unavailable: Manual location entry fallback
- No checklists available: "Create your first checklist" prompt
- Offline: Wizard works fully offline; inspection queued for sync

---

## Screen 4: Camera Scanner

**Purpose**: The core AI-powered scanning experience. Point camera at any area and see hazards highlighted in real-time.

**UI Elements**:
- **Full-screen camera viewfinder**: Live camera feed occupying 80% of screen
- **AR overlay layer**: Semi-transparent bounding boxes around detected hazards
  - Red boxes: Critical hazards
  - Orange boxes: Major hazards
  - Yellow boxes: Minor hazards
  - Blue boxes: Observations
  - Each box has a small label (e.g., "No hard hat", "Blocked exit")
  - Pulsing animation on new detections
- **Top bar** (semi-transparent dark overlay):
  - Back button (X to close scanner)
  - Inspection name/area label
  - AI status indicator (green dot = active, amber = processing, gray = offline)
  - Flash toggle (on/off/auto)
  - Grid toggle (composition guide)
- **Bottom capture bar**:
  - Large capture button (center, 72px, white circle with red inner ring)
  - Gallery thumbnail (bottom-left, last captured photo)
  - Scan mode toggle (bottom-right): "PPE" / "General" / "Chemical" / "Fire"
- **Detection summary strip** (above capture bar):
  - Horizontal scrollable chips showing detected hazards
  - Tap chip to highlight corresponding bounding box
  - Badge count on each severity level
- **Confidence meter**: Small gauge showing AI detection confidence for current frame

**States**:
- Scanning: Live AR overlay with real-time detection (on-device YOLO)
- Capturing: Flash animation, capture confirmation haptic
- Processing: After capture, "Analyzing..." overlay with spinner while GPT-4o processes
- Results: Transition to Scan Results screen with findings
- Low light: Warning banner "Low light detected -- results may be less accurate"
- Offline: PPE detection works; "Deep analysis available when online" note
- No hazards detected: Green border glow, "No hazards detected in frame" message
- Camera permission denied: Full-screen prompt to enable camera in settings

**Accessibility**:
- VoiceOver announces detected hazards as they appear
- Haptic feedback: Short pulse for minor, double pulse for major, long pulse for critical
- High contrast mode: Bounding boxes have thick white borders for visibility in bright conditions
- One-handed operation: All controls reachable within thumb zone

**Gestures**:
- Pinch to zoom
- Double-tap to capture
- Swipe left to view last capture
- Long press capture button for burst mode (3 photos)

---

## Screen 5: Violation Detail

**Purpose**: Comprehensive view of a single violation with all context needed for remediation.

**UI Elements**:
- **Header**: Severity badge (full-width color band: red/orange/yellow/blue)
- **Violation title**: AI-generated description (e.g., "Missing machine guard on press #7")
- **Photo evidence**: Full-width photo with AI annotation overlay (bounding boxes). Swipeable if multiple photos. Tap to view full-screen with zoom.
- **Severity card**:
  - Severity level with icon (Critical/Major/Minor/Observation)
  - AI confidence percentage
  - "Override Severity" button (opens picker with reason field)
- **Regulation reference card**:
  - Regulation code (e.g., "29 CFR 1910.212(a)(1)")
  - Regulation title ("General Requirements for Machine Guarding")
  - Brief excerpt of relevant regulation text
  - "View Full Regulation" link -> Regulation Library
  - Fine range: "$15,625 - $156,259"
- **Location card**:
  - Facility name
  - Area/zone within facility
  - GPS coordinates
  - Timestamp of detection
- **Corrective action card**:
  - AI-suggested corrective action
  - Assigned to: [Team member selector]
  - Due date: [Date picker]
  - Priority: Critical / High / Medium / Low
  - Status: Open / In Progress / Resolved / Accepted Risk
  - "Add Corrective Action" button
- **History section**:
  - Timeline of actions taken on this violation
  - Who flagged it, when assigned, status changes, comments
- **Action buttons** (sticky bottom bar):
  - "Add Photo" (secondary)
  - "Assign" (secondary)
  - "Resolve" (primary, green) -- requires verification photo
  - Three-dot menu: Edit, Duplicate, Delete, Export

**States**:
- Open violation: Full edit capabilities
- Resolved violation: Read-only with green "Resolved" banner and verification photo
- Overdue violation: Red "Overdue" banner with days overdue count
- AI-flagged but unreviewed: "Needs Review" badge, confirm/dismiss buttons prominent
- Disputed: Yellow "Severity Override" badge showing original vs. overridden severity

---

## Screen 6: Inspection Report Builder

**Purpose**: Customize and generate the final inspection report before sharing.

**UI Elements**:
- **Report title** (editable text input)
- **Cover page preview**: Thumbnail showing how the cover page will look with company logo, date, inspector name
- **Section toggles** (each expandable):
  - Executive Summary (auto-generated, editable)
  - Findings by Severity (Critical first, then Major, Minor, Observation)
  - Photo Evidence Gallery
  - Compliance Score Breakdown (by category chart)
  - Corrective Action Plan (table)
  - Regulation References
  - Sign-off Section
  - Appendix
- **Each finding row**: Checkbox (include/exclude), photo thumbnail, violation title, severity badge, regulation code
- **Reorder handle**: Drag to reorder findings within sections
- **Notes field**: Free-text area for inspector comments per section
- **Recipients section**:
  - Add email recipients for report delivery
  - "CC" and "BCC" options
  - Scheduled delivery option (send at specific date/time)
- **Bottom action bar**:
  - "Preview PDF" (secondary)
  - "Generate & Share" (primary, safety yellow)
  - "Save Draft" (text link)

**States**:
- Building: All sections editable, drag-and-drop active
- Previewing: Full-screen PDF preview with page navigation
- Generating: Progress bar "Generating report..." (2-5 seconds)
- Generated: Share sheet with options (email, AirDrop, save to files, copy link)
- Offline: "Report will be generated and shared when connectivity returns"

---

## Screen 7: Report History

**Purpose**: Browse and manage all past inspection reports.

**UI Elements**:
- **Search bar**: Search by facility name, inspector, date, or report content
- **Filter chips** (horizontal scroll): All, This Week, This Month, By Facility, By Inspector, By Type
- **Sort dropdown**: Newest first, Oldest first, Score (low to high), Score (high to low)
- **Report list** (scrollable cards): Each card shows:
  - Report title
  - Facility name and icon
  - Inspection date
  - Inspector name and avatar
  - Overall compliance score (color-coded number)
  - Violation count by severity (colored dots with counts)
  - Status badge: Draft, Completed, Signed, Sent
  - Chevron for detail view
- **Batch actions**: Select mode with checkboxes for multi-select
  - "Export Selected" (ZIP of PDFs)
  - "Delete Selected" (with confirmation)

**States**:
- Loading: Skeleton list
- Empty: "No reports yet. Complete your first inspection to generate a report."
- Filtered with no results: "No reports match your filters. Try adjusting your search."
- Offline: Shows cached reports with "Offline" badge; new reports may not be visible

**Navigation**:
- Tap card -> Report preview (full PDF viewer)
- Long press -> Context menu (Share, Download, Delete, View Inspection)

---

## Screen 8: Corrective Action Tracker

**Purpose**: Manage all corrective actions across facilities with filtering, assignment, and status tracking.

**UI Elements**:
- **Summary bar**: 4 stat chips:
  - Total Open (count)
  - Overdue (count, red)
  - Due This Week (count, amber)
  - Completed This Month (count, green)
- **Filter tabs**: All | Open | In Progress | Overdue | Completed
- **Sort**: By due date, priority, facility, assignee
- **Action list** (scrollable cards): Each card shows:
  - Violation title (linked to original violation)
  - Facility name
  - Severity badge (Critical/Major/Minor)
  - Assigned to (avatar + name)
  - Due date (red if overdue, amber if within 48 hours)
  - Status pill: Pending (gray), In Progress (blue), Completed (green), Overdue (red)
  - Progress bar (if multi-step corrective action)
  - Chevron for detail
- **Quick actions per card**:
  - Swipe right: Mark as complete (requires verification photo)
  - Swipe left: Reassign
  - Tap: Open detail view

**States**:
- All clear: Celebratory state -- "All corrective actions completed! Great safety culture."
- Overdue items: Red banner at top with count
- Loading: Skeleton cards
- Offline: Cached data with sync indicator

---

## Screen 9: Regulation Library

**Purpose**: Browse, search, and bookmark workplace safety regulations.

**UI Elements**:
- **Search bar**: Natural language search ("What are the requirements for forklift aisle width?")
- **Category tabs**: OSHA General Industry | OSHA Construction | ISO 45001 | NFPA | GHS | All
- **Browse tree** (expandable):
  - OSHA General Industry (29 CFR 1910)
    - Subpart D -- Walking-Working Surfaces
    - Subpart E -- Exit Routes
    - Subpart F -- Powered Platforms
    - Subpart G -- Health and Environmental Controls
    - Subpart H -- Hazardous Materials
    - Subpart I -- PPE
    - Subpart J -- General Environmental Controls
    - Subpart K -- Medical and First Aid
    - Subpart L -- Fire Protection
    - Subpart M -- Compressed Gases
    - Subpart N -- Materials Handling
    - Subpart O -- Machinery and Machine Guarding
    - Subpart P -- Hand and Portable Power Tools
    - Subpart Q -- Welding, Cutting, Brazing
    - Subpart R -- Special Industries
    - Subpart S -- Electrical
    - Subpart Z -- Toxic Substances
  - (Similar tree for 29 CFR 1926, ISO, NFPA, GHS)
- **Regulation detail view** (drill-in):
  - Full regulation code and title
  - Full text of regulation
  - Plain language summary (AI-generated)
  - Related violations in user's history
  - Fine range for non-compliance
  - Bookmark toggle (star icon)
  - Share button
  - "Applicable to my facilities?" AI assessment

**States**:
- Search results: Ranked list with relevance score and snippet
- No results: "No matching regulations found. Try different terms or browse categories."
- Offline: Cached regulations searchable; full text may require connectivity for less common standards
- Bookmarked view: Filtered to user's bookmarked regulations

---

## Screen 10: Team Management

**Purpose**: Manage team members, roles, and permissions within the organization.

**UI Elements**:
- **Team header**: Organization name, team member count, plan limit indicator
- **Invite button**: "Invite Team Member" (primary action, top-right)
- **Team list** (scrollable): Each member row shows:
  - Avatar (photo or initials)
  - Full name
  - Email
  - Role badge: Admin (purple), EHS Manager (blue), Inspector (green), Viewer (gray)
  - Status: Active (green dot), Invited (amber dot), Deactivated (red dot)
  - Last active date
  - Inspections completed (count)
- **Invite modal**:
  - Email input
  - Role selector (dropdown)
  - Facility access selector (multi-select)
  - Personal message (optional)
  - "Send Invite" button
- **Member detail** (tap to expand):
  - Edit role
  - Manage facility access
  - View activity log
  - Deactivate account
  - Remove from team (with confirmation)

**States**:
- At plan limit: "Upgrade to add more team members" banner with upgrade button
- Pending invites: Separate section showing invitations not yet accepted
- Empty: "You're the only team member. Invite your safety team to get started."

---

## Screen 11: Facility Management

**Purpose**: Add, edit, and configure facilities within the organization.

**UI Elements**:
- **Facility list** with map toggle:
  - List view: Cards with facility name, address, type, compliance score, member count
  - Map view: Interactive map with color-coded pins (green = compliant, yellow = needs attention, red = critical)
- **Add Facility button**: "Add Facility" (primary, top-right)
- **Facility detail** (tap to open):
  - Facility name (editable)
  - Address with map preview
  - Facility type selector (Manufacturing Plant, Warehouse, Distribution Center, Job Site, Office, Other)
  - Square footage
  - Employee count at facility
  - Primary contact person
  - Operating hours
  - Industry classification (SIC/NAICS code)
  - Photo gallery of facility
  - Areas/zones configuration (Production Floor, Receiving, Shipping, Break Room, Lab, Office, Exterior)
  - Assigned inspectors
  - Inspection schedule configuration
  - Risk score display (read-only, calculated)
- **Danger zones** (bottom, red section):
  - Archive facility
  - Transfer facility to another organization
  - Delete facility (with double confirmation)

**States**:
- No facilities: "Add your first facility to start inspecting"
- Single facility (Starter plan): "Upgrade to add more facilities" on add button
- Facility with critical violations: Red badge on facility card

---

## Screen 12: Analytics & Trends

**Purpose**: Visualize compliance data over time with charts, trends, and insights.

**UI Elements**:
- **Date range selector**: This Week | This Month | This Quarter | This Year | Custom Range
- **Compliance score trend chart**: Line chart showing overall score over time with goal line
- **Violations by category**: Horizontal bar chart (PPE, Fire Safety, Machine Guarding, Chemical, Electrical, Housekeeping, Signage, Other)
- **Violations by severity**: Donut chart (Critical, Major, Minor, Observation)
- **Inspection frequency**: Bar chart showing inspections per week/month
- **Top violations**: Ranked list of most common violation types
- **Corrective action metrics**:
  - Average time to resolution (days)
  - Resolution rate (%)
  - Overdue rate (%)
- **Facility comparison** (multi-facility orgs): Bar chart comparing compliance scores across facilities
- **Inspector leaderboard**: Table showing inspections completed, violations found, avg time per inspection
- **AI insight cards**: Auto-generated observations:
  - "PPE violations have increased 23% this month. Most occur in Building B production floor."
  - "Fire safety compliance has improved from 72% to 91% since implementing monthly extinguisher checks."
  - "Your facility's compliance score is in the 78th percentile for metalworking manufacturers."
- **Export button**: Download analytics as PDF or CSV

**States**:
- Loading: Chart skeleton placeholders
- Insufficient data: "Complete more inspections to see trends. At least 5 inspections needed."
- Offline: Shows cached analytics data with "Last updated" timestamp

---

## Screen 13: Settings

**Purpose**: Configure app behavior, account settings, notification preferences, and organization settings.

**UI Elements**:

**Account Section**:
- Profile photo, name, email, role
- Edit profile button
- Change password
- Two-factor authentication toggle

**Organization Section** (Admin only):
- Organization name and logo
- Subscription plan with upgrade option
- Billing management link
- API keys and webhooks configuration

**Inspection Settings**:
- Default inspection type
- Auto-save interval (30s, 1min, 5min)
- Photo quality (High/Medium/Low -- tradeoff with storage)
- GPS precision level
- Default checklist selection

**AI Settings**:
- AI confidence threshold for auto-flagging (slider: 0.5-0.95)
- Hazard detection categories to enable/disable
- Language preference for AI analysis
- Auto-detect vs. manual trigger mode

**Notification Preferences**:
- Push notification toggles:
  - New violation assigned to me
  - Corrective action due soon
  - Corrective action overdue
  - Inspection scheduled reminder
  - Report ready for review
  - Regulatory update alert
- Email notification toggles (mirror of push options)
- Quiet hours configuration

**Report Settings**:
- Company logo upload for reports
- Default report template selection
- Auto-include/exclude sections
- Default recipients list
- Report branding colors

**Data & Privacy**:
- Data export (all data as JSON/CSV)
- Photo retention policy display
- Privacy mode toggle (auto-blur faces)
- Cache management (clear offline data)
- Storage usage display

**About**:
- App version
- Terms of service link
- Privacy policy link
- Support contact (email, chat)
- Feedback submission

**Danger Zone**:
- Sign out
- Sign out of all devices
- Delete account (with data export prompt first)

---

## Global UI Patterns

### Navigation Patterns

| Pattern                     | Implementation                                       |
| --------------------------- | ---------------------------------------------------- |
| Primary navigation          | Bottom tab bar (5 tabs)                              |
| Secondary navigation        | Stack navigation within each tab                     |
| Modal presentation          | Bottom sheet modals for filters, pickers, quick actions |
| Wizard flows                | Full-screen stack with progress bar                  |
| Deep linking                | Universal links to specific violation/inspection     |

### Common Components

| Component              | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| Violation Card         | Reusable card showing violation summary, severity, status      |
| Severity Badge         | Color-coded pill (Critical/Major/Minor/Observation)            |
| Compliance Score Gauge | Circular gauge 0-100 with color gradient                       |
| Photo Viewer           | Full-screen image viewer with zoom, AI overlay toggle          |
| Sync Status Bar        | Top bar showing sync state (synced/pending/error)              |
| Offline Banner         | Amber banner shown when device is offline                      |
| Empty State            | Illustration + message + CTA for screens with no data          |
| Skeleton Loader        | Content placeholder while data loads                           |
| Toast Notification     | Non-blocking success/error messages at top of screen           |
| Bottom Sheet           | Draggable sheet for filters, options, quick actions             |

### Accessibility Requirements

| Requirement                  | Implementation                                          |
| ---------------------------- | ------------------------------------------------------- |
| Minimum touch target         | 56px x 56px (larger than standard 44px for gloved use)  |
| Text contrast                | Minimum 4.5:1 (WCAG AA); 7:1 in high-contrast mode     |
| Font scaling                 | Support Dynamic Type / system font scaling up to 200%   |
| Screen reader                | Full VoiceOver and TalkBack support                     |
| Color independence           | Never use color alone to convey information (+ icons)   |
| Reduce motion                | Respect system reduce motion setting                    |
| One-handed operation         | Critical actions within thumb-reachable zone            |
| Haptic feedback              | Confirm actions and hazard severity via vibration        |
| Outdoor visibility           | High contrast mode for bright sunlight conditions       |
| Glove-friendly               | Extra-large buttons, no precision gestures required     |
