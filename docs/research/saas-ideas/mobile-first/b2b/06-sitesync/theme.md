# Theme

## Blueprint Authority

SiteSync's design language is **"Blueprint Authority"** -- professional, structured, and reliable. The visual identity evokes a well-organized job site trailer: everything in its place, immediately accessible, built for purpose. The design communicates competence and trustworthiness to construction professionals who are skeptical of technology and have zero patience for anything that feels fragile, frivolous, or consumer-grade.

This is not a playful startup aesthetic. This is not a minimalist tech design. This is a tool that looks like it belongs on a construction site -- sturdy, high-visibility, no-nonsense -- while being sophisticated enough that a PM can confidently email its reports to a project owner.

---

## Design Personality

**Blueprint Authority** is defined by five personality traits:

1. **Professional** — Every screen looks like it was designed by an engineering firm, not a startup. Clean lines, structured layouts, precise alignment. No whimsy.

2. **Structured** — Data is organized in clear hierarchies. Information is grouped logically. Navigation is predictable. Like a well-organized set of construction drawings.

3. **Reliable** — The app feels solid and trustworthy. Animations are subtle and purposeful. Loading states are informative, not playful. Error messages are direct and actionable.

4. **High-Visibility** — Like construction safety gear, important information stands out immediately. Construction Yellow for CTAs, Safety Orange for alerts, clear contrast ratios for outdoor sunlight readability.

5. **Efficient** — Every pixel serves a purpose. No decorative elements. Data-dense layouts that communicate maximum information in minimum space. Foremen have 30 seconds, not 3 minutes.

---

## Color System

### Primary Colors

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `primary` | Construction Yellow | `#EAB308` | Primary CTAs, active states, navigation highlights, photo capture button, brand accent |
| `primary-dark` | Dark Yellow | `#CA8A04` | Pressed states, hover effects, text on light backgrounds where yellow would have insufficient contrast |
| `primary-light` | Light Yellow | `#FEF9C3` | Subtle backgrounds for selected/active items, notification badges, highlight backgrounds |

**Construction Yellow rationale:** Yellow is the universal color of construction -- caution tape, hard hats, heavy equipment, high-visibility vests. It immediately communicates "construction tool" to the target user. On the app, it draws attention to primary actions without being aggressive.

### Secondary Colors

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `secondary` | Steel Gray | `#475569` | Headers, body text, secondary buttons, card borders, structural elements |
| `secondary-dark` | Dark Steel | `#334155` | Heavy text, section headers on light backgrounds |
| `secondary-light` | Light Steel | `#94A3B8` | Placeholder text, disabled states, subtle borders, metadata text |

**Steel Gray rationale:** The color of structural steel, concrete, and rebar. It provides a professional, industrial foundation that grounds the bright Construction Yellow. Used extensively for text and structural UI elements.

### Accent Color

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `accent` | Safety Orange | `#EA580C` | Safety alerts, violation badges, critical notifications, warning indicators |
| `accent-light` | Light Orange | `#FED7AA` | Safety alert backgrounds, warning card fills |

**Safety Orange rationale:** OSHA-standard safety color. Used exclusively for safety-related UI elements -- violation alerts, safety report sections, critical notifications. Its restricted use ensures it always commands attention.

### Background Colors

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `bg-light` | Blueprint White | `#F8FAFC` | Primary background (light mode), main screen backgrounds |
| `bg-dark` | Deep Navy | `#0F172A` | Primary background (dark mode), deep blueprint aesthetic |
| `surface-light` | Light Surface | `#F1F5F9` | Card backgrounds, input fields, secondary surfaces (light mode) |
| `surface-dark` | Dark Surface | `#1E293B` | Card backgrounds, input fields, secondary surfaces (dark mode) |

### Semantic Colors

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `success` | Completed Green | `#16A34A` | Completed milestones, resolved violations, on-track schedule, verified items |
| `error` | Violation Red | `#DC2626` | Critical violations, errors, failed uploads, overdue items |
| `warning` | Delay Amber | `#D97706` | At-risk milestones, moderate violations, pending actions, approaching deadlines |
| `info` | Blueprint Blue | `#2563EB` | Informational badges, low-severity observations, help text, links |

### Extended Palette

```
Construction Yellow Scale:
50:  #FEFCE8    100: #FEF9C3    200: #FEF08A    300: #FDE047
400: #FACC15    500: #EAB308    600: #CA8A04    700: #A16207
800: #854D0E    900: #713F12

Steel Gray Scale:
50:  #F8FAFC    100: #F1F5F9    200: #E2E8F0    300: #CBD5E1
400: #94A3B8    500: #64748B    600: #475569    700: #334155
800: #1E293B    900: #0F172A
```

### Color Accessibility

All color combinations meet WCAG 2.1 AA standards minimum (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Contrast Ratio | Rating |
|------------|------------|---------------|--------|
| `#475569` (Steel Gray) | `#F8FAFC` (Blueprint White) | 7.1:1 | AAA |
| `#CA8A04` (Primary Dark) | `#F8FAFC` (Blueprint White) | 4.7:1 | AA |
| `#DC2626` (Violation Red) | `#F8FAFC` (Blueprint White) | 5.3:1 | AA |
| `#F8FAFC` (Blueprint White) | `#0F172A` (Deep Navy) | 17.4:1 | AAA |
| `#EAB308` (Construction Yellow) | `#0F172A` (Deep Navy) | 9.8:1 | AAA |
| `#EA580C` (Safety Orange) | `#0F172A` (Deep Navy) | 5.7:1 | AA |

**Sunlight readability:** All primary UI elements maintain readable contrast at 50% brightness reduction (simulating direct sunlight washout). Critical safety alerts use the highest-contrast combinations.

---

## Typography

### Font Stack

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Headings** | IBM Plex Sans | Bold (700), SemiBold (600) | SF Pro Display, Roboto, system-ui |
| **Body** | Inter | Regular (400), Medium (500) | SF Pro Text, Roboto, system-ui |
| **Data/Mono** | IBM Plex Mono | Regular (400) | SF Mono, Roboto Mono, monospace |

**IBM Plex Sans rationale:** Designed by IBM with an industrial, engineered aesthetic. The geometric precision and open letterforms communicate technical competence. The "Plex" name itself evokes complexity and interconnection -- fitting for construction project documentation.

**Inter rationale:** Optimized for screen readability at all sizes, with distinct letterforms that prevent misreading in data-dense layouts. Excellent for body text, metadata, and report content.

**IBM Plex Mono rationale:** Used exclusively for data values -- report numbers, OSHA standards, GPS coordinates, measurements. The monospace alignment creates clean data columns.

### Type Scale

```
Display:      32px / 40px line-height / IBM Plex Sans Bold
              App title, onboarding headlines

Heading 1:    24px / 32px line-height / IBM Plex Sans Bold
              Screen titles, section headers

Heading 2:    20px / 28px line-height / IBM Plex Sans SemiBold
              Card titles, subsection headers

Heading 3:    17px / 24px line-height / IBM Plex Sans SemiBold
              Group labels, list section headers

Body Large:   17px / 26px line-height / Inter Regular
              Report narrative text, descriptions

Body:         15px / 22px line-height / Inter Regular
              General body text, list items, form labels

Body Small:   13px / 18px line-height / Inter Regular
              Metadata, timestamps, secondary information

Caption:      11px / 16px line-height / Inter Medium
              Photo labels, badges, data labels, status indicators

Data:         15px / 22px line-height / IBM Plex Mono Regular
              OSHA standards, coordinates, report numbers, measurements
```

### Typography Rules

1. **No text smaller than 13px** -- field workers may have reduced vision, bright sunlight reduces readability
2. **Maximum 65 characters per line** in report text for optimal readability
3. **Headings are always uppercase-capable** but default to title case (avoid all-caps except for severity badges)
4. **Data values use monospace** to ensure column alignment in tables and data displays
5. **Bold is used sparingly** -- only for section headers and emphasis, never for entire paragraphs
6. **Line height is generous** -- minimum 1.4x font size for all body text to aid scanning

---

## Spacing System

### Base Unit: 4px

All spacing values are multiples of 4px for consistent visual rhythm:

```
space-1:    4px     Tight spacing (icon-to-label gaps)
space-2:    8px     Component internal padding (badge padding, tight groups)
space-3:    12px    Between related elements (label to input, icon rows)
space-4:    16px    Standard component padding (card padding, list item padding)
space-5:    20px    Between sections within a card
space-6:    24px    Between cards, section spacing
space-8:    32px    Major section spacing, screen padding
space-10:   40px    Large section breaks
space-12:   48px    Screen top/bottom margins
space-16:   64px    Onboarding illustration spacing
```

### Layout Grid

- **Screen padding**: 16px horizontal on phone, 24px on tablet
- **Card padding**: 16px all sides
- **Photo grid gap**: 4px (tight grid for maximum photo visibility)
- **List item padding**: 16px horizontal, 12px vertical
- **Section spacing**: 24px between card groups
- **Tab bar height**: 56px (large enough for work-gloved taps)
- **Header height**: 56px
- **Bottom safe area**: 34px (iPhone) + tab bar

---

## Iconography

### Icon Set: Lucide

**Why Lucide:** Clean, professional line icons with consistent 24x24 grid and 1.5px stroke weight. The professional weight avoids both the thin fragility of some icon sets and the heavy cartoon feel of others. Lucide icons communicate precision and clarity.

### Core Icons

```
Navigation:
  home          → Dashboard tab
  camera        → Capture tab
  file-text     → Reports tab
  shield-alert  → Safety tab
  users         → Team tab

Actions:
  plus          → Add/Create
  upload        → Upload file
  download      → Download/Export
  send          → Send report
  edit-2        → Edit content
  trash-2       → Delete
  share-2       → Share
  search        → Search
  filter        → Filter
  settings      → Settings

Status:
  check-circle  → Complete/Resolved
  alert-triangle→ Warning/At Risk
  alert-octagon → Critical/Error
  clock         → Pending/In Progress
  circle        → Not started
  trending-up   → Ahead of schedule
  trending-down → Behind schedule

Construction:
  map-pin       → Location/GPS
  compass       → Heading/Direction
  layers        → Floor plans
  building      → Site
  hard-hat      → Safety (custom)
  ruler         → Measurements
  calendar      → Schedule/Timeline

Data:
  bar-chart-3   → Reports/Analytics
  image         → Photos
  file-check    → PDF report
  mail          → Email
  phone         → Phone number
  user          → Team member
```

### Icon Usage Rules

1. **24x24px** standard size for navigation and inline icons
2. **20x20px** for compact contexts (list item secondary icons, badges)
3. **32x32px** for empty states and card header icons
4. **48x48px** for onboarding illustrations and feature highlights
5. **1.5px stroke** weight (Lucide default) -- never adjust
6. **Steel Gray** (`#475569`) for inactive state, **Construction Yellow** (`#EAB308`) for active/selected state
7. **Always paired with text labels** in navigation -- no icon-only navigation (construction workers should not guess meanings)

---

## Illustrations

### Style: Isometric Construction Elements

Illustrations use an isometric perspective with a technical, blueprint-inspired aesthetic:

- **Isometric construction scenes**: Job site elements (buildings under construction, cranes, scaffolding, workers) rendered in clean isometric style
- **Blueprint-style technical drawings**: Thin lines on deep navy background with Construction Yellow accent lines -- used for onboarding, empty states, and feature explanations
- **Color palette**: Steel Gray base with Construction Yellow and Safety Orange highlights
- **No gradients**: Flat colors only, maintaining the technical/blueprint feel
- **Line weight**: 1.5-2px consistent with icon set
- **Detail level**: Enough to be recognizable as construction elements, not so detailed that they become noisy

### Illustration Contexts

| Context | Style | Example |
|---------|-------|---------|
| Onboarding slides | Full isometric scene | Foreman taking photo, report appearing on tablet |
| Empty states | Blueprint line drawing | "No photos yet" with camera and construction element outline |
| Feature highlights | Isometric vignette | AI brain analyzing a photo, safety shield detecting violation |
| Error states | Simple line icon | Disconnected cloud with construction elements |
| Loading states | Animated blueprint | Blueprint lines drawing themselves |
| Success states | Isometric celebration | Completed building with checkmark |

---

## Design Principles

### 1. Data-Dense But Scannable

Construction professionals need to see a lot of information at once -- they are managing complex projects with dozens of variables. SiteSync shows dense data but organizes it so the eye naturally flows to what matters most.

**Rules:**
- Use card-based layouts with clear section headers
- Primary metrics are large and prominent (progress percentage, photo count, violation count)
- Secondary data is visible but smaller (timestamps, metadata, detailed descriptions)
- Color-code status immediately (green/yellow/red for schedule, severity badges for safety)
- Never hide critical information behind a tap -- if it is important, it is visible on the surface

### 2. Photo-First Layouts

Photos are SiteSync's primary content. Every screen that displays photos should maximize photo visibility.

**Rules:**
- Photo grids use maximum available width with minimal gaps (4px)
- Full-screen photo view is always one tap away
- Photo thumbnails are large enough to assess content (minimum 110px)
- AI analysis and metadata appear below or beside photos, never overlaid on them (except safety violation highlights)
- Photo capture mode maximizes viewfinder area -- minimal UI chrome

### 3. One-Tap Actions for Field Use

In the field, every extra tap is a burden. A foreman's hands may be occupied, the sun may be blinding, and attention may be split across a dozen concerns.

**Rules:**
- Primary actions require exactly one tap (capture photo, view report, see violation)
- Secondary actions require maximum two taps
- Destructive actions require confirmation but no navigation
- Swipe gestures supplement but never replace tap targets
- The most common action on each screen has the largest, most prominent button

### 4. Professional PDF Output

Reports generated by SiteSync represent the user's company. They must be indistinguishable from reports produced by a professional PM.

**Rules:**
- Company logo prominently placed on every report
- Consistent formatting across all report types
- Photos are high-quality and properly sized (not stretched, not pixelated)
- Charts and graphs are clean and professional
- Section headers follow AIA/industry conventions
- Page numbers, dates, and report numbers on every page

### 5. Rugged Feel

The app should feel like it belongs on a job site, not in a Silicon Valley coffee shop. This does not mean ugly -- it means purposeful, sturdy, and built for the environment.

**Rules:**
- Generous touch targets (48px minimum, 56px preferred for primary actions)
- High-contrast color combinations that work in direct sunlight
- Thick borders and clear boundaries between interactive elements
- Feedback on every interaction (haptic, visual, or auditory)
- No fragile-looking thin lines or subtle hover states

---

## Dark Mode

### Deep Navy Blueprint

Dark mode uses a deep navy aesthetic inspired by blueprint paper -- not pure black, which feels harsh and disconnected from the construction identity.

```
Dark Mode Mapping:
bg-light (#F8FAFC)        → bg-dark (#0F172A)         Deep Navy
surface-light (#F1F5F9)   → surface-dark (#1E293B)    Dark Slate
secondary (#475569)       → #94A3B8                   Lighter Steel
secondary-dark (#334155)  → #CBD5E1                   Light Gray
secondary-light (#94A3B8) → #64748B                   Medium Steel

primary (#EAB308)         → #EAB308                   Unchanged
accent (#EA580C)          → #EA580C                   Unchanged
success (#16A34A)         → #22C55E                   Slightly brighter
error (#DC2626)           → #EF4444                   Slightly brighter
warning (#D97706)         → #F59E0B                   Slightly brighter
```

**Dark mode principles:**
- Construction Yellow stands out even more dramatically against deep navy
- Safety Orange alerts maintain high visibility
- Photo thumbnails are the brightest elements on screen (photos naturally draw the eye)
- Cards use `surface-dark` to create subtle depth against `bg-dark`
- Text uses light gray (`#CBD5E1`) for body, white (`#F8FAFC`) for headings
- Borders use `#334155` for subtle definition

---

## Component Specifications

### Site Card

The primary card component for displaying a construction site on the dashboard.

```
┌─────────────────────────────────────────────┐
│  ┌─────┐                                    │
│  │ MAP │  Riverside Plaza Phase 2            │
│  │ IMG │  1234 Oak Street, Austin TX         │
│  └─────┘                                    │
│                                              │
│  ████████████░░░░░░░░░ 43%  ✅ On Track      │
│                                              │
│  📸 24 today  │  ⚠️ 2 alerts  │  📋 Report ✓  │
│                                              │
└─────────────────────────────────────────────┘

Specs:
- Background: surface-light (#F1F5F9) / surface-dark (#1E293B)
- Border: 1px solid #E2E8F0 / #334155
- Border-radius: 12px
- Padding: 16px
- Map thumbnail: 64x64px, border-radius 8px
- Site name: Heading 3 (17px IBM Plex Sans SemiBold)
- Address: Body Small (13px Inter Regular, secondary-light)
- Progress bar: height 6px, border-radius 3px, primary fill
- Status badge: colored per schedule status (success/warning/error)
- Stats row: Body Small, icons 16px, separated by thin vertical dividers
- Shadow: 0 1px 3px rgba(0,0,0,0.06) (light mode only)
- Tap: entire card is tappable, subtle scale animation on press (0.98)
```

### Photo Grid

The photo display component used in galleries, reports, and team feeds.

```
┌──────┬──────┬──────┐
│      │      │      │
│ img  │ img  │ img  │
│      │      │      │
│ 2:34p│ 2:35p│ 2:36p│
│L2-203│L2-203│L2-204│
├──────┼──────┼──────┤
│      │      │      │
│ img  │ img  │ img  │
│      │      │      │
│ 2:37p│ 2:38p│ 2:39p│
│L2-205│L2-Cor│L2-Cor│
└──────┴──────┴──────┘

Specs:
- Columns: 3 (phone), 4 (tablet portrait), 5 (tablet landscape)
- Gap: 4px
- Image aspect ratio: 4:3 (matching camera default)
- Image fit: cover
- Image border-radius: 4px
- Label overlay: 24px height at bottom, semi-transparent background (rgba(15,23,42,0.7))
- Label text: Caption (11px Inter Medium, white)
- Safety violation badge: 16px red dot in top-right corner, 4px inset
- Selection mode: blue check circle overlay in top-left
- Loading: gray placeholder with subtle shimmer animation
```

### Report Section

A section within the AI-generated report preview.

```
┌─────────────────────────────────────────────┐
│  BUILDING A - LEVEL 2                  ✏️    │
│                                              │
│  ┌──────┬──────┬──────┐                      │
│  │[img] │[img] │[img] │                      │
│  └──────┴──────┴──────┘                      │
│                                              │
│  Progress: 73% (↑5% from yesterday)         │
│  ████████████████████░░░░░░ 73%              │
│                                              │
│  - East wall framing complete                │
│  - Headers installed over window openings    │
│  - Sheathing started on east elevation       │
│  - Electrical rough-in marked for next week  │
│                                              │
└─────────────────────────────────────────────┘

Specs:
- Background: white (#FFFFFF) / surface-dark (#1E293B)
- Border: 1px solid #E2E8F0 / #334155
- Border-left: 4px solid primary (#EAB308) -- indicates active section
- Border-radius: 8px
- Padding: 16px
- Section title: Heading 3, all caps, letter-spacing 0.5px
- Edit button: 24px icon, secondary-light color, top-right
- Photo row: 3 photos, 4px gap, 8px margin-bottom
- Progress text: Body, bold percentage, colored delta (green for +, red for -)
- Progress bar: height 4px, border-radius 2px
- Bullet points: Body, 8px left indent, 4px vertical spacing
```

### Safety Alert Badge

The badge component used to indicate safety violation severity.

```
┌─────────────────────────────────────────────┐
│  🔴 CRITICAL                                 │
│                                              │
│  Missing Guardrail at Stairwell Opening      │
│                                              │
│  ┌────┐  OSHA 1926.501(b)(1)                 │
│  │ img│  Fall Protection                     │
│  └────┘  Level 3 - Stairwell                 │
│          Detected: Today 2:34 PM             │
│                                              │
│  Assigned: Carlos M.  │  Due: Today 5:00 PM  │
│                                              │
└─────────────────────────────────────────────┘

Specs:
- Border-left: 4px solid (severity color: error/accent/warning/info)
- Background: severity tint (error: #FEE2E2, warning: #FEF3C7, etc.)
- Dark mode background: severity dark tint (#450A0A, #451A03, etc.)
- Border-radius: 8px
- Padding: 16px
- Severity badge: Capsule shape, 6px vertical 12px horizontal padding
  - CRITICAL: bg error (#DC2626), text white, font Caption bold
  - HIGH: bg accent (#EA580C), text white
  - MEDIUM: bg warning (#D97706), text white
  - LOW: bg info (#2563EB), text white
- Violation title: Heading 3
- Photo thumbnail: 48x48px, border-radius 4px, left-aligned
- OSHA standard: Data font (IBM Plex Mono), info color
- Location: Body Small, secondary color
- Assignment row: Body Small, vertical divider separator
```

### Timeline Chart

The schedule visualization component.

```
┌─────────────────────────────────────────────┐
│                                              │
│  Foundation  ████████████████ ✅              │
│  Framing     ████████████░░░░ 73%            │
│  Rough-In    ░░░░░░░░░░░░░░░                 │
│  Insulation  ░░░░░░░░░░░░░                   │
│  Drywall     ░░░░░░░░░░░░░                   │
│  Finish      ░░░░░░░░░░░░░░░░░               │
│  Landscape   ░░░░░░░░                        │
│              │                               │
│           Today                              │
│                                              │
│  ─── Scheduled    ═══ Actual    ┅┅┅ Predicted│
│                                              │
└─────────────────────────────────────────────┘

Specs:
- Rendered with react-native-skia for smooth performance
- Bar height: 24px per phase
- Bar spacing: 8px vertical gap
- Bar border-radius: 4px
- Completed: success color (#16A34A)
- In progress: primary color (#EAB308)
- Not started: #E2E8F0 (light) / #334155 (dark)
- Delayed: error color (#DC2626)
- At risk: warning color (#D97706)
- Today line: 2px dashed, secondary color
- Phase labels: Body Small, left-aligned, fixed 100px width
- Percentage: Caption, right of active bar
- Status icons: 16px, color-matched to status
- Horizontal scroll for long timelines
- Pinch-to-zoom for time scale adjustment
- Tap phase bar to expand detail view
```

### Team Avatar Row

A horizontal row of team member avatars used on the dashboard and team sections.

```
┌──────────────────────────────────────┐
│  [MJ] [CM] [SK] [JW] [TD]  +2 more  │
└──────────────────────────────────────┘

Specs:
- Avatar size: 36px circle
- Avatar overlap: -8px margin (stacked effect)
- Avatar border: 2px solid bg-light / bg-dark (creates separation)
- Active indicator: 8px green dot, bottom-right, 2px white border
- Initials: Caption bold, white on primary-dark background
- Photo avatar: cover fit, circle clip
- "+N more" text: Caption, secondary-light color
- Maximum visible: 5 avatars before "+N" overflow
- Tap avatar: navigate to team member profile
- Tap "+N": navigate to full team list
```

---

## Animation Guidelines

### Principles

1. **Purpose over polish**: Every animation must serve a functional purpose (feedback, orientation, or transition)
2. **Speed over smoothness**: Animations should be fast (150-250ms) because field users are in a hurry
3. **Haptic pairing**: Critical actions pair with haptic feedback (photo capture, violation detection, report sent)

### Standard Animations

| Action | Animation | Duration | Easing |
|--------|-----------|----------|--------|
| Photo capture | Flash + scale down 0.95 → 1.0 | 150ms | ease-out |
| Card press | Scale 0.98 | 100ms | ease-in-out |
| Screen transition | Slide from right | 250ms | ease-out |
| Modal open | Slide up + fade bg | 200ms | ease-out |
| Modal close | Slide down + fade bg | 150ms | ease-in |
| Loading spinner | Continuous rotation | 800ms/rev | linear |
| Success checkmark | Scale 0 → 1 + fade | 300ms | spring(200, 15) |
| Error shake | Horizontal shake 3x | 400ms | ease-in-out |
| Pull-to-refresh | Custom blueprint drawing animation | Variable | ease-out |
| Skeleton loading | Shimmer left to right | 1500ms | linear, repeat |
| Safety alert appear | Slide down from top + bounce | 350ms | spring(180, 12) |
| Photo upload progress | Width increase on progress bar | Continuous | linear |

### Haptic Feedback

| Action | Haptic Type |
|--------|-------------|
| Photo captured | Light impact |
| Safety violation detected | Warning notification |
| Report sent | Success notification |
| Error/failure | Error notification |
| Button press | Selection tap |
| Walk-through started | Medium impact |
| Walk-through ended | Success notification |

---

## Platform-Specific Guidelines

### iOS

- Safe area insets respected on all screens (notch, home indicator, dynamic island)
- System blur effects for modal backgrounds
- Native date/time pickers
- SF Symbols as fallback if Lucide icons fail to load
- Haptic engine integration via Expo Haptics
- Share sheet via UIActivityViewController

### Android

- Material You dynamic color support (optional, respects system theme)
- Edge-to-edge layout with system bar transparency
- Android-specific notification channels (Safety Critical, Reports, General)
- Back gesture handling
- Foreground service notification for walk-through GPS tracking
- Photo gallery access via MediaStore

---

## Accessibility

### Standards

- WCAG 2.1 AA compliance minimum across all screens
- VoiceOver (iOS) and TalkBack (Android) full support
- Minimum touch target: 48x48dp
- All images have descriptive alt text (including AI-generated photo descriptions)
- Focus indicators visible on all interactive elements
- No information conveyed by color alone (always paired with icon or text)
- Reduced motion support (disable animations when system preference is set)

### Screen Reader Considerations

- Photo galleries announce: "Photo [N] of [total], [area name], [timestamp], [AI description]"
- Safety alerts announce severity before description: "Critical safety alert: Missing guardrail..."
- Progress bars announce: "[Phase name], [percentage] complete, [status]"
- Navigation tabs announce current selection and badge counts

---

## Design Tokens (Implementation Reference)

```typescript
export const theme = {
  colors: {
    primary: '#EAB308',
    primaryDark: '#CA8A04',
    primaryLight: '#FEF9C3',
    secondary: '#475569',
    secondaryDark: '#334155',
    secondaryLight: '#94A3B8',
    accent: '#EA580C',
    accentLight: '#FED7AA',
    bgLight: '#F8FAFC',
    bgDark: '#0F172A',
    surfaceLight: '#F1F5F9',
    surfaceDark: '#1E293B',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
    white: '#FFFFFF',
    black: '#000000',
  },
  fonts: {
    heading: 'IBMPlexSans-Bold',
    headingSemiBold: 'IBMPlexSans-SemiBold',
    body: 'Inter-Regular',
    bodyMedium: 'Inter-Medium',
    mono: 'IBMPlexMono-Regular',
  },
  fontSize: {
    display: 32,
    h1: 24,
    h2: 20,
    h3: 17,
    bodyLarge: 17,
    body: 15,
    bodySmall: 13,
    caption: 11,
  },
  lineHeight: {
    display: 40,
    h1: 32,
    h2: 28,
    h3: 24,
    bodyLarge: 26,
    body: 22,
    bodySmall: 18,
    caption: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;
```
