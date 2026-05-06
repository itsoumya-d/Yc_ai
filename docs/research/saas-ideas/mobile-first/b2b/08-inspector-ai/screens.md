# Screens — Inspector AI

> Complete screen inventory with UI elements, navigation flows, states, and accessibility requirements.

---

## Navigation Architecture

```
App Root
├── Auth Stack (unauthenticated)
│   ├── S1: Welcome / Onboarding
│   ├── S2: Login
│   ├── S3: Sign Up
│   └── S4: Forgot Password
│
└── Main Stack (authenticated)
    ├── Tab Navigator
    │   ├── S5: Dashboard (Home)
    │   ├── S6: Inspections List
    │   ├── S7: Camera (center action button)
    │   ├── S8: Reports
    │   └── S9: More (Settings, Profile, Team)
    │
    ├── Inspection Flow Stack
    │   ├── S10: New Inspection Wizard
    │   ├── S11: Camera Capture (with AI Overlay)
    │   ├── S12: Photo Gallery with Annotations
    │   ├── S13: Damage Assessment Results
    │   ├── S14: Report Builder
    │   └── S15: Report Preview / Export
    │
    ├── Detail Screens
    │   ├── S16: Property History
    │   ├── S17: Inspection Detail
    │   └── S18: Photo Detail with Annotations
    │
    ├── Management Screens
    │   ├── S19: Team Management
    │   ├── S20: Analytics Dashboard
    │   └── S21: Assignment Queue
    │
    └── Settings Stack
        ├── S22: Settings
        ├── S23: Profile
        ├── S24: Organization Settings
        ├── S25: Report Templates
        └── S26: Subscription / Billing
```

---

## S1: Welcome / Onboarding

**Purpose**: First-time user introduction to Inspector AI.

**UI Elements:**
- Full-screen illustration carousel (3-4 slides)
  - Slide 1: "Capture Damage with AI" — camera illustration
  - Slide 2: "Instant Reports" — report generation illustration
  - Slide 3: "Works Offline" — no-signal illustration
  - Slide 4: "Close Claims Faster" — speed metric illustration
- Page indicator dots
- "Skip" text button (top right)
- "Next" primary button
- "Get Started" button on final slide
- "Already have an account? Log In" link at bottom

**States:**
- Default: First slide shown
- Progress: User swipes through slides
- Complete: Final slide with "Get Started" CTA

**Accessibility:**
- All illustrations have descriptive alt text
- Swipe gestures have button alternatives
- Minimum 44pt touch targets on all interactive elements
- VoiceOver announces slide content and position ("Slide 1 of 4")

---

## S2: Login

**Purpose**: Authenticate existing users.

**UI Elements:**
- Inspector AI logo (top center, 80pt)
- "Welcome Back" heading
- Email input field with email keyboard type
- Password input field with show/hide toggle
- "Forgot Password?" text link (right-aligned)
- "Log In" primary button (full width)
- Divider with "or" text
- "Sign in with SSO" secondary button (for enterprise users)
- "Don't have an account? Sign Up" link at bottom
- Biometric login prompt (Face ID / Touch ID) if previously authenticated

**States:**
- Default: Empty form
- Validating: Button shows loading spinner
- Error: Red border on invalid fields, error message below field ("Invalid email format", "Incorrect password")
- SSO redirect: Loading indicator while redirecting to identity provider
- Biometric: Face ID / Touch ID system dialog

**Accessibility:**
- Form fields have proper labels and autocomplete attributes
- Error messages are announced by screen reader
- Password show/hide toggle has clear label
- Keyboard navigation order follows visual layout

---

## S3: Sign Up

**Purpose**: Create new account with organization setup.

**UI Elements:**
- Step indicator (1. Account, 2. Organization, 3. Role)
- Step 1: Full name, email, password, confirm password
- Step 2: Organization name, organization size dropdown (Solo, 2-10, 11-50, 50+), state/region
- Step 3: Role selection (Independent Adjuster, Staff Adjuster, Firm Manager, Carrier Rep)
- Terms and Privacy Policy checkbox with links
- "Create Account" primary button
- "Already have an account? Log In" link

**States:**
- Per-step validation before advancing
- Password strength indicator (weak/medium/strong)
- Organization name availability check (debounced)
- Loading state during account creation
- Error: Duplicate email, weak password, required field missing

---

## S4: Forgot Password

**Purpose**: Password reset flow.

**UI Elements:**
- Email input field
- "Send Reset Link" primary button
- Success illustration and "Check your email" confirmation
- "Back to Login" link

**States:**
- Default: Email input
- Sending: Button loading state
- Sent: Success confirmation with email address shown
- Error: Email not found

---

## S5: Dashboard (Home)

**Purpose**: Primary landing screen showing inspection overview and quick actions.

**UI Elements:**
- Header: Greeting ("Good morning, Sarah"), notification bell with badge count
- Sync status bar (when offline or syncing): "3 inspections pending sync" with progress
- Quick action cards (horizontal scroll):
  - "New Inspection" (primary, large)
  - "Continue Draft" (if incomplete inspections exist)
  - "Scan Assignment" (import from email/photo)
- Today's Schedule section:
  - List of scheduled inspections with address, time, policyholder name
  - Map preview showing inspection locations
- Recent Activity feed:
  - Last 5 inspections with status badges (Draft, Submitted, Approved)
  - Tap to open inspection detail
- Stats summary bar at bottom:
  - "12 This Week" | "47 This Month" | "4.8 Avg Score"

**States:**
- Loading: Skeleton placeholders for all sections
- Empty: "No inspections yet. Start your first inspection!" with illustration
- Offline: Yellow banner "Working Offline" with sync queue count
- Syncing: Progress bar in header showing upload progress
- Error: "Could not load dashboard. Pull to retry."
- Notification badge: Red dot with count on bell icon

**Accessibility:**
- All cards and list items are tappable with minimum 48pt height
- Stats are read as "12 inspections this week, 47 this month, 4.8 average score"
- Offline banner is announced as an alert
- Pull-to-refresh has haptic feedback

---

## S6: Inspections List

**Purpose**: Browse, search, and filter all inspections.

**UI Elements:**
- Search bar with property address and policyholder name search
- Filter chips (horizontal scroll): All, Draft, In Progress, Submitted, Approved, Rejected
- Sort dropdown: Newest, Oldest, Address A-Z, Status
- Inspection list cards:
  - Property thumbnail photo
  - Address (primary text)
  - Policyholder name
  - Date of inspection
  - Status badge (color-coded)
  - Damage severity indicator (low/medium/high/critical)
  - Sync status icon (synced/pending/error)
- FAB (Floating Action Button): "+" for new inspection
- Pull-to-refresh

**States:**
- Loading: Skeleton cards
- Empty (no inspections): Illustration + "No inspections found" + CTA
- Empty (filter yields no results): "No inspections match this filter" + clear filter button
- Error: Retry prompt
- Searching: Real-time results as user types

---

## S7: Camera Quick Access (Tab Bar Center Button)

**Purpose**: Quick-launch camera for immediate photo capture.

**UI Elements:**
- Enlarged center tab bar button (56pt diameter, accent color)
- Bottom sheet on tap with options:
  - "New Inspection" — start full wizard
  - "Add to Existing" — pick from recent inspections list
  - "Quick Capture" — photo only, assign later

---

## S10: New Inspection Wizard

**Purpose**: Step-by-step setup for a new property inspection.

**UI Elements:**
- Progress bar (4 steps)
- Step 1 — Property Information:
  - Address input with Google Places autocomplete
  - Property type picker: Single Family, Multi-Family, Commercial, Condo, Townhome
  - Year built input (numeric)
  - Square footage input (numeric)
  - Stories count selector (1, 2, 3+)
  - "Use Current Location" button with GPS icon
- Step 2 — Claim Information:
  - Claim number input
  - Date of loss date picker
  - Cause of loss picker: Wind, Hail, Water, Fire, Lightning, Other
  - Carrier name dropdown (searchable, top 50 carriers)
  - Policy number input (optional)
- Step 3 — Contact Information:
  - Policyholder name
  - Phone number with tel keyboard
  - Email address
  - Preferred contact method toggle (Phone / Email / Text)
- Step 4 — Inspection Plan:
  - Checklist of areas to inspect (pre-populated based on cause of loss):
    - Roof, Gutters, Siding, Windows, Foundation, Interior, HVAC, Plumbing
  - Notes textarea
  - "Start Inspection" primary button
- Back and Next navigation buttons
- "Save as Draft" option on every step

**States:**
- Per-step validation
- Address autocomplete loading and results
- GPS location fetching with accuracy indicator
- Draft saved confirmation toast
- Carrier not found: "Add custom carrier" option

**Accessibility:**
- Date pickers use native iOS/Android controls
- Autocomplete results are navigable with VoiceOver
- Required fields are marked with asterisk and aria-required
- Step progress is announced ("Step 2 of 4: Claim Information")

---

## S11: Camera Capture (with AI Overlay)

**Purpose**: The primary inspection tool — capture photos with real-time AI damage detection.

**UI Elements:**
- Full-screen camera viewfinder
- AI overlay layer:
  - Bounding boxes around detected damage (color-coded by type)
  - Damage type labels on bounding boxes ("Hail Impact", "Missing Shingle")
  - Confidence percentage badge
  - Pulsing animation when new damage is detected
- Top bar (translucent):
  - Back arrow
  - Current area label ("Roof - North Face")
  - Photo count badge ("12 photos")
  - Flash toggle (auto/on/off)
- Bottom controls:
  - Capture button (large, center, 72pt)
  - Gallery thumbnail (last photo, bottom left)
  - Area selector button (bottom right) — opens picker for inspection area
- Photo quality indicator:
  - Green checkmark: good quality
  - Yellow warning: "Hold steady" for blur
  - Red X: "Too dark, use flash"
- Alignment guide overlay (optional):
  - Grid lines for composition
  - Level indicator for straight photos
- Capture animation: Shutter flash effect + haptic feedback

**States:**
- Default: Camera active with AI scanning
- AI Detecting: Bounding boxes appearing with animation
- Capturing: Shutter animation, brief freeze
- Processing: Small spinner while AI analyzes captured photo
- Offline: "Basic mode" banner — on-device AI only, simpler analysis
- Low light: Auto-flash suggestion popup
- Permission denied: Full-screen prompt to enable camera access

**Accessibility:**
- VoiceOver announces detected damage types and confidence
- Haptic feedback on capture and damage detection
- All controls are reachable with one hand (bottom third of screen)
- High contrast mode available for outdoor visibility

---

## S12: Photo Gallery with Annotations

**Purpose**: Review, organize, and annotate captured photos.

**UI Elements:**
- Grid view (3 columns) with photo thumbnails
- Each thumbnail shows:
  - Damage type icon overlay (bottom left)
  - Severity color dot (bottom right)
  - Sync status icon (top right)
- Toggle between Grid and List views
- Filter by area (Roof, Siding, Interior, etc.)
- Sort by capture time or damage severity
- Bulk select mode (long press to activate):
  - Select all / deselect all
  - Delete selected
  - Move to different area
  - Re-analyze selected
- Tap photo to open S18: Photo Detail

**States:**
- Loading: Skeleton grid
- Empty: "No photos captured yet. Open camera to start." with camera icon
- Selecting: Checkmarks on selected photos, action bar at bottom
- Uploading: Progress overlay on individual photos

---

## S13: Damage Assessment Results

**Purpose**: Review AI-generated damage assessment for the entire inspection.

**UI Elements:**
- Overall Property Score: Large circular gauge (1-100) with color gradient
- Score breakdown cards (horizontal scroll):
  - Roof: 72/100
  - Siding: 85/100
  - Foundation: 91/100
  - Interior: 68/100
- Damage Findings list:
  - Each finding card shows:
    - Thumbnail photo
    - Damage type and location
    - Severity rating (1-10 with bar visualization)
    - AI confidence percentage
    - Suggested action: "Repair" or "Replace"
    - Estimated cost range
    - "Edit" button to override AI assessment
- "Add Manual Finding" button for damage AI missed
- Summary statistics:
  - Total findings count
  - Average severity
  - Estimated total repair cost range
- "Generate Report" primary button at bottom

**States:**
- Analyzing: Progress bar with "AI is analyzing your photos..." message
- Complete: All findings displayed
- Partial (offline): "Basic analysis complete. Full AI assessment will run when online."
- No damage: "No significant damage detected" with option to override
- Error: "Analysis could not be completed. Retry or add findings manually."

**Accessibility:**
- Score gauge has text alternative ("Property score: 72 out of 100, Fair condition")
- Severity bars use both color and pattern for colorblind users
- All findings are navigable as a list with VoiceOver

---

## S14: Report Builder

**Purpose**: Customize and finalize the inspection report before generation.

**UI Elements:**
- Report template selector (dropdown): carrier-specific templates
- Section list with drag-to-reorder:
  - Cover Page (editable title, date, adjuster info)
  - Property Information (auto-filled, editable)
  - Inspection Summary (AI-generated, editable textarea)
  - Damage Findings (reorderable list of findings)
  - Photo Documentation (layout options: grid, full-page, annotated)
  - Cost Estimate Summary
  - Recommendations
  - Adjuster Certification
- Per-section editing:
  - Tap section to expand and edit content
  - AI-generated text highlighted in light blue
  - "Regenerate" button to get new AI suggestion
  - Rich text formatting (bold, italic, bullet lists)
- Photo layout options per section:
  - 2-up, 3-up, 4-up grid
  - Full page with caption
  - Before/after comparison
- "Preview Report" secondary button
- "Generate PDF" primary button
- Auto-save indicator ("Saved 2 seconds ago")

**States:**
- Loading: Template loading skeleton
- Editing: Active cursor in text field, keyboard visible
- Saving: "Saving..." indicator
- Generating: Full-screen loading with progress ("Generating report... 60%")
- Error: "Report could not be saved. Changes stored locally."

---

## S15: Report Preview / Export

**Purpose**: Final review and distribution of the completed report.

**UI Elements:**
- Full PDF preview with page-by-page scroll
- Page counter ("Page 3 of 12")
- Zoom controls (pinch to zoom)
- Bottom action bar:
  - "Edit" — return to report builder
  - "Share" — native share sheet (email, AirDrop, messaging)
  - "Export PDF" — save to device files
  - "Send to Carrier" — direct submission (if carrier API available)
- Report metadata:
  - File size
  - Page count
  - Generation timestamp
- Mark as "Final" toggle (locks report from further editing)

**States:**
- Loading: PDF rendering progress bar
- Rendered: Full PDF scrollable preview
- Sharing: Native share sheet open
- Sent: "Report submitted to [Carrier Name]" confirmation
- Error: "PDF could not be rendered. Try regenerating."

---

## S16: Property History

**Purpose**: View all past inspections for a specific property address.

**UI Elements:**
- Property header card:
  - Street view photo (Google Maps API)
  - Full address
  - Property type, year built, square footage
  - GPS coordinates
  - Last inspected date
- Inspection timeline (vertical):
  - Date and time
  - Adjuster name
  - Cause of loss
  - Overall score with trend arrow (improved/declined)
  - Status badge
  - Tap to open full inspection
- Property score trend chart (line graph over time)
- "New Inspection" button for this property

**States:**
- Loading: Skeleton layout
- Single inspection: Only one entry, no trend chart
- Multiple inspections: Full timeline and trend chart
- No history: "First inspection for this property"

---

## S17: Inspection Detail

**Purpose**: Comprehensive view of a single completed inspection.

**UI Elements:**
- Header with property address and date
- Status badge and sync status
- Tab bar: Overview | Photos | Findings | Report
- Overview tab:
  - Property score gauge
  - Claim information summary
  - Adjuster notes
  - Inspection duration
- Photos tab: Gallery grid of all inspection photos
- Findings tab: List of all damage findings with details
- Report tab: PDF preview with share options
- "Edit Inspection" button (if not finalized)
- "Duplicate Inspection" for re-inspection workflows

---

## S18: Photo Detail with Annotations

**Purpose**: View individual photo with AI analysis and annotation tools.

**UI Elements:**
- Full-screen photo view with pinch-to-zoom
- AI analysis overlay (toggleable):
  - Damage bounding boxes
  - Damage type labels
  - Severity indicators
- Annotation toolbar (bottom):
  - Draw freehand (finger painting)
  - Arrow tool
  - Rectangle/circle tool
  - Text label tool
  - Color picker (red, yellow, blue, white, black)
  - Undo/redo
  - Clear all annotations
- Metadata panel (swipe up):
  - Capture date and time
  - GPS coordinates with map preview
  - Camera direction (compass)
  - AI damage classification
  - Severity score
  - Confidence percentage
- "Set as Cover Photo" option
- Delete photo with confirmation

**States:**
- Viewing: Photo displayed with AI overlay
- Annotating: Toolbar active, drawing mode enabled
- Zoomed: Pinch-zoomed in, annotations scale with zoom
- Saving: "Saving annotation..." indicator

---

## S19: Team Management

**Purpose**: Manage adjuster team for firm managers.

**UI Elements:**
- Team member list:
  - Avatar, name, role
  - Status (Active, Invited, Inactive)
  - Inspections count (this month)
  - Average quality score
- "Invite Member" button — opens email invite form
- Member detail on tap:
  - Performance stats
  - Recent inspections list
  - Role editor (Adjuster, Manager, Admin)
  - Deactivate option
- Team stats summary:
  - Total members
  - Active this week
  - Average inspections per adjuster

---

## S20: Analytics Dashboard

**Purpose**: Business intelligence and performance metrics.

**UI Elements:**
- Date range picker (This Week, This Month, This Quarter, Custom)
- KPI cards row:
  - Total Inspections
  - Avg Time per Inspection
  - Reports Submitted
  - Revenue (if tracking enabled)
- Charts:
  - Inspections over time (bar chart)
  - Damage type distribution (pie chart)
  - Average severity trend (line chart)
  - Geographic heat map of inspections
- Adjuster leaderboard (sortable by volume, speed, quality)
- Export button (CSV, PDF summary)

---

## S22: Settings

**Purpose**: App configuration and preferences.

**UI Elements:**
- Grouped settings list:
  - Account: Profile, Change Password, Notification Preferences
  - Inspection: Default checklist, Photo quality setting (Standard/High/Maximum), Measurement units
  - Reports: Default template, Company branding (logo upload), Signature setup
  - Data: Storage usage, Clear cache, Export all data
  - Offline: Auto-download maps, Storage limit for offline photos
  - Appearance: Dark/Light/System theme, Text size
  - About: Version number, Terms of Service, Privacy Policy, Support contact
- Logout button at bottom (red text)

**States:**
- Default: All settings with current values shown
- Editing: Inline editing for text fields, pickers for options
- Saving: Saving indicator per setting
- Storage warning: Red text showing storage usage if above 80%

**Accessibility:**
- All settings have descriptive labels
- Toggle switches announce state ("Dark mode: on")
- Grouped sections are announced as groups
- Text size setting previews immediately

---

## Global UI Patterns

### Loading States

| Context | Pattern |
|---|---|
| Screen load | Skeleton placeholders matching content layout |
| Button action | Button shows spinner, text changes to "Processing..." |
| Data fetch | Pull-to-refresh spinner at top |
| Photo upload | Progress bar overlay on photo thumbnail |
| Report generation | Full-screen modal with progress percentage |
| AI analysis | Animated shimmer on analysis cards |

### Empty States

| Context | Pattern |
|---|---|
| No inspections | Illustration + "Start your first inspection" + CTA button |
| No photos | Camera icon + "Open camera to capture photos" |
| No findings | Checkmark icon + "No damage detected" |
| No team members | People icon + "Invite your first team member" |
| Search no results | Search icon + "No results for [query]" + clear search |

### Error States

| Context | Pattern |
|---|---|
| Network error | Banner at top: "No connection. Working offline." (yellow) |
| API error | Inline error message with retry button |
| Form validation | Red border + error text below field |
| Fatal error | Full-screen error with illustration + "Something went wrong" + retry |
| Permission denied | Full-screen prompt explaining why permission is needed + settings link |

### Toast Notifications

- Success: Green background, checkmark icon, 3-second auto-dismiss
- Warning: Amber background, warning icon, 5-second auto-dismiss
- Error: Red background, X icon, manual dismiss required
- Info: Blue background, info icon, 3-second auto-dismiss
- Position: Bottom of screen, above tab bar, 16pt margin

---

## Accessibility Requirements (Global)

| Requirement | Implementation |
|---|---|
| Minimum touch target | 44x44pt for all interactive elements |
| Color contrast | WCAG AA minimum (4.5:1 for text, 3:1 for large text) |
| Screen reader support | All elements have accessible labels and roles |
| Dynamic type | Supports iOS Dynamic Type and Android font scaling |
| Reduced motion | Respects system "Reduce Motion" setting |
| Color independence | Never convey information through color alone — use icons and text |
| Keyboard navigation | Full keyboard navigation support for external keyboards |
| Focus management | Logical focus order, focus trapped in modals |
| Error announcement | Errors are announced immediately via accessibility live regions |
| Haptic feedback | Meaningful haptics for capture, detection, and confirmations |

---

*Every screen is designed for one-handed operation in the field — large touch targets, bottom-aligned actions, and minimal typing.*
