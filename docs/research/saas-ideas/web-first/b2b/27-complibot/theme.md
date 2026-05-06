# CompliBot -- Design System and Theme

## Design Philosophy

CompliBot's visual identity must communicate one thing above all: **trust**. Every design decision serves the goal of making a startup's CTO feel confident handing over infrastructure credentials and compliance data to this platform. The design is enterprise-grade but not enterprise-heavy. It is clean, spacious, and professional without feeling like software designed in 2005 by a government contractor.

### Design Principles

1. **Trust Through Clarity**: Compliance is complex. The interface must make complexity feel manageable. No visual clutter, no ambiguous icons, no mystery meat navigation. Every element has a clear purpose and label.

2. **Authority Without Intimidation**: Enterprise buyers expect a polished, professional product. Startup users expect something they can figure out in 10 minutes. CompliBot balances both: authoritative enough for a CISO to approve, intuitive enough for a founding engineer to onboard without a CSM call.

3. **Security as Aesthetic**: Shield icons, lock indicators, encryption badges, and compliance status markers are not just functional -- they are brand elements. The interface should feel like a security product at every touchpoint.

4. **Action-Oriented Layout**: Every screen must make the next action obvious. The compliance journey is sequential (connect, scan, assess, remediate, audit), and the design must guide users forward without confusion.

5. **Data Density Done Right**: Compliance dashboards contain large amounts of data (scores, controls, gaps, evidence, tasks). The design uses progressive disclosure, well-structured tables, and visual hierarchy to prevent information overload while keeping critical data visible.

---

## Brand Personality

| Attribute              | Expression                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| Trustworthy            | Blue-dominant palette, shield iconography, security badges       |
| Authoritative          | Clean typography, structured layouts, professional tone          |
| Secure                 | Lock icons, encryption indicators, audit trail visibility        |
| Clean                  | Generous white space, minimal decoration, consistent spacing     |
| Enterprise-Ready       | Polished components, data tables, PDF exports, SSO support       |
| Startup-Friendly       | Fast onboarding, clear guidance, no unnecessary complexity       |
| Intelligent            | AI-generated content indicators, smart suggestions, automation   |

### Voice and Tone

- **Professional but not corporate**: "Your S3 bucket is publicly accessible" not "A non-compliant configuration was detected in your object storage subsystem."
- **Actionable, not alarming**: "3 critical gaps need attention" not "DANGER: YOUR INFRASTRUCTURE IS AT RISK."
- **Confident, not arrogant**: "CompliBot identified 12 gaps and created remediation tasks" not "Our revolutionary AI discovered..."
- **Concise, not terse**: Use complete sentences in descriptions. Use fragments only in labels and badges.

---

## Color Palette

### Primary Colors

| Name              | Hex       | Usage                                                        |
| ----------------- | --------- | ------------------------------------------------------------ |
| Trust Blue        | `#1D4ED8` | Primary actions, links, active navigation, brand identity    |
| Trust Blue Light  | `#3B82F6` | Hover states, secondary emphasis, active tabs                |
| Trust Blue Dark   | `#1E3A8A` | Pressed states, dark mode primary                            |
| Trust Blue 50     | `#EFF6FF` | Blue tint backgrounds, selected rows, active section bg      |

### Semantic Colors

| Name              | Hex       | Usage                                                        |
| ----------------- | --------- | ------------------------------------------------------------ |
| Shield Green      | `#059669` | Positive actions, connected integrations, healthy status     |
| Compliant Green   | `#22C55E` | Compliant status badges, passing controls, score above 70%   |
| Compliant Green 50| `#F0FDF4` | Green tint backgrounds for success banners                   |
| Alert Red         | `#DC2626` | Destructive actions, error states, system alerts             |
| Non-Compliant Red | `#EF4444` | Non-compliant badges, failing controls, critical severity    |
| Non-Compliant 50  | `#FEF2F2` | Red tint backgrounds for critical gap banners                |
| Warning Amber     | `#D97706` | Warning states, approaching deadlines, medium severity       |
| In-Progress Amber | `#F59E0B` | In-progress badges, pending actions, score between 40-70%    |
| In-Progress 50    | `#FFFBEB` | Amber tint backgrounds for warning banners                   |

### Neutral Colors (Light Mode)

| Name              | Hex       | Usage                                                        |
| ----------------- | --------- | ------------------------------------------------------------ |
| White             | `#FFFFFF` | Page background, card background, input background           |
| Gray 50           | `#F8FAFC` | Alternate row background, sidebar background, section bg     |
| Gray 100          | `#F1F5F9` | Dividers, borders, disabled backgrounds                      |
| Gray 200          | `#E2E8F0` | Borders, separators, input borders                           |
| Gray 300          | `#CBD5E1` | Placeholder text, disabled icons                             |
| Gray 400          | `#94A3B8` | Secondary text, timestamps, metadata                         |
| Gray 500          | `#64748B` | Body text (secondary), descriptions                          |
| Gray 600          | `#475569` | Body text (primary), table cell text                         |
| Gray 700          | `#334155` | Headings (secondary), labels                                 |
| Gray 800          | `#1E293B` | Headings (primary), navigation text                          |
| Gray 900          | `#0F172A` | Page titles, emphasis text, maximum contrast                 |

### Dark Mode Colors

| Name              | Hex       | Usage                                                        |
| ----------------- | --------- | ------------------------------------------------------------ |
| Dark Background   | `#0F172A` | Page background                                              |
| Dark Surface      | `#1E293B` | Card background, sidebar background, modal background        |
| Dark Surface 2    | `#334155` | Elevated surfaces, dropdown backgrounds, hover states        |
| Dark Border       | `#475569` | Card borders, dividers, input borders                        |
| Dark Text Primary | `#F8FAFC` | Primary text, headings                                       |
| Dark Text Second. | `#94A3B8` | Secondary text, descriptions, metadata                       |
| Dark Text Tertiary| `#64748B` | Placeholder text, disabled text                              |

### Color Mode Strategy

Light mode is the default. Enterprise compliance tools are typically used in office environments where light mode is the professional expectation. Dark mode is available as a toggle (using `next-themes`) for engineering-heavy users who prefer it.

```typescript
// Tailwind CSS configuration for color modes
// tailwind.config.ts
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trust: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1D4ED8',  // Primary
          700: '#1E3A8A',
          800: '#1E3A5C',
          900: '#0F172A',
        },
        compliant: '#22C55E',
        'non-compliant': '#EF4444',
        'in-progress': '#F59E0B',
        shield: '#059669',
      },
    },
  },
};
```

---

## Typography

### Font Stack

| Font       | Weight           | Usage                                                     |
| ---------- | ---------------- | --------------------------------------------------------- |
| Inter      | 400 (Regular)    | Body text, descriptions, table cells, form inputs         |
| Inter      | 500 (Medium)     | Labels, navigation items, badge text, button text         |
| Inter      | 600 (Semibold)   | Card titles, section headings, sidebar items (active)     |
| Inter      | 700 (Bold)       | Page titles, compliance scores, emphasis text             |
| DM Mono    | 400 (Regular)    | Control IDs (CC6.1), policy section numbers, code blocks  |
| DM Mono    | 500 (Medium)     | Evidence hashes, scan timestamps, API references          |

### Why Inter

Inter was designed specifically for screen readability. It has excellent legibility at small sizes (critical for dense compliance tables), a large x-height, and a professional aesthetic that avoids the sterility of system fonts. It signals "modern tech company" without the playfulness of rounded fonts.

### Why DM Mono

DM Mono is used exclusively for compliance-specific identifiers: control IDs (CC6.1, Art. 17, 164.312), policy section numbers (1.1, 2.3.4), evidence hashes, and technical configuration data. The monospace treatment distinguishes machine-readable identifiers from human-readable content, which is important when users scan dense control tables.

### Type Scale

| Name       | Size    | Line Height | Weight   | Usage                                         |
| ---------- | ------- | ----------- | -------- | --------------------------------------------- |
| Display    | 36px    | 40px        | Bold     | Compliance score number (78%)                 |
| H1         | 30px    | 36px        | Bold     | Page titles (Dashboard, Gap Analysis)         |
| H2         | 24px    | 32px        | Semibold | Section headings (Critical Gaps, Tasks)       |
| H3         | 20px    | 28px        | Semibold | Card titles (policy name, gap title)          |
| H4         | 16px    | 24px        | Semibold | Subsection labels, table headers              |
| Body       | 14px    | 20px        | Regular  | Default body text, descriptions               |
| Body Small | 13px    | 18px        | Regular  | Table cells, metadata, timestamps             |
| Caption    | 12px    | 16px        | Medium   | Badges, labels, helper text                   |
| Overline   | 11px    | 16px        | Medium   | Uppercase labels, category headers            |
| Mono       | 13px    | 18px        | Regular  | Control IDs, section numbers, hashes          |

### Tailwind Typography Configuration

```typescript
// Font loading in layout.tsx
import { Inter } from 'next/font/google';
import { DM_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Usage in Tailwind
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

---

## Layout System

### Grid and Spacing

| Property              | Value   | Usage                                                    |
| --------------------- | ------- | -------------------------------------------------------- |
| Base unit             | 4px     | All spacing is a multiple of 4px                         |
| Content max-width     | 1280px  | Maximum width of main content area                       |
| Sidebar width         | 256px   | Expanded sidebar (fixed on desktop)                      |
| Sidebar collapsed     | 64px    | Icons-only sidebar (tablets, user toggle)                |
| Page padding          | 32px    | Padding around main content area                         |
| Card padding          | 24px    | Internal padding for cards                               |
| Section gap           | 24px    | Vertical gap between dashboard sections                  |
| Card gap              | 16px    | Gap between cards in a grid                              |
| Element gap           | 8px     | Gap between small elements (icon + label, badge + text)  |
| Border radius (card)  | 12px    | Cards, modals, dropdowns                                 |
| Border radius (button)| 8px     | Buttons, inputs, badges                                  |
| Border radius (badge) | 6px     | Small badges, status indicators                          |
| Border radius (full)  | 9999px  | Pills, avatar circles, score rings                       |

### Layout Pattern

CompliBot uses a fixed sidebar with scrollable main content. The sidebar contains primary navigation. The top bar contains breadcrumbs, search, and notifications. The main content area uses a responsive grid.

```
+------+----------------------------------------------------------+
|      | TOP BAR (breadcrumbs, search, notifications)  h: 64px    |
|      +----------------------------------------------------------+
|SIDE  |                                                          |
|BAR   |  MAIN CONTENT (scrollable)                               |
|      |                                                          |
|w:256 |  +--grid-cols-1 md:grid-cols-2 lg:grid-cols-3----------+ |
|      |  |                                                      | |
|      |  |  Dashboard widgets, cards, tables                   | |
|      |  |                                                      | |
|      |  +------------------------------------------------------+ |
|      |                                                          |
+------+----------------------------------------------------------+
```

### Enterprise-Grade Spacing Philosophy

Compliance data is dense. The design uses generous spacing to prevent cognitive overload. Cards have 24px internal padding. Sections have 24px gaps. The overall effect is a layout that breathes, giving each piece of information room to be read without competing with adjacent elements. This is a deliberate contrast to the cramped dashboards common in legacy GRC tools.

---

## Iconography

### Icon Library: Heroicons

CompliBot uses Heroicons (by the makers of Tailwind CSS) as the primary icon library. Heroicons provide outline and solid variants, integrate natively with Tailwind, and have a professional aesthetic that matches the enterprise-grade design language.

### Icon Size Scale

| Size    | Pixels | Usage                                                       |
| ------- | ------ | ----------------------------------------------------------- |
| xs      | 16px   | Inline with body text, badge icons, table cell icons        |
| sm      | 20px   | Navigation items, button icons, form field icons            |
| md      | 24px   | Card header icons, section icons, default icon size         |
| lg      | 32px   | Dashboard widget icons, empty state illustrations           |
| xl      | 48px   | Framework cards, onboarding step icons                      |

### Icon Usage by Context

| Context                    | Icon (Heroicons)          | Variant  |
| -------------------------- | ------------------------- | -------- |
| Dashboard / Home           | `HomeIcon`                | Outline  |
| Frameworks                 | `ShieldCheckIcon`         | Outline  |
| Gap Analysis               | `MagnifyingGlassIcon`     | Outline  |
| Policies                   | `DocumentTextIcon`        | Outline  |
| Evidence                   | `ArchiveBoxIcon`          | Outline  |
| Tasks                      | `ClipboardDocumentListIcon` | Outline|
| Monitoring                 | `SignalIcon`              | Outline  |
| Audit Room                 | `LockClosedIcon`          | Outline  |
| Training                   | `AcademicCapIcon`         | Outline  |
| Vendors                    | `BuildingOfficeIcon`      | Outline  |
| Reports                    | `ChartBarIcon`            | Outline  |
| Settings                   | `Cog6ToothIcon`           | Outline  |
| Compliant status           | `CheckCircleIcon`         | Solid    |
| Non-compliant status       | `XCircleIcon`             | Solid    |
| In-progress status         | `ClockIcon`               | Solid    |
| Warning / Alert            | `ExclamationTriangleIcon` | Solid    |
| Critical severity          | `FireIcon`                | Solid    |
| Connected integration      | `CheckBadgeIcon`          | Solid    |
| Disconnected integration   | `MinusCircleIcon`         | Solid    |
| AI-generated content       | `SparklesIcon`            | Outline  |
| Security / Encryption      | `ShieldExclamationIcon`   | Outline  |
| User / Team                | `UserGroupIcon`           | Outline  |
| Notification               | `BellIcon`                | Outline  |
| Search                     | `MagnifyingGlassIcon`     | Outline  |

### Icon Color Rules

- **Navigation icons**: `text-gray-400` default, `text-trust-600` when active (light mode)
- **Status icons**: Use semantic colors (compliant green, non-compliant red, in-progress amber)
- **Action icons**: Match button color (`text-white` on primary buttons, `text-gray-600` on secondary)
- **Decorative icons**: `text-gray-300` (never draw attention away from content)

---

## Component Styling

### Compliance Score Ring

The centerpiece of the dashboard. A large circular progress indicator showing overall compliance percentage.

```
Specifications:
- Size: 200px x 200px (desktop), 160px x 160px (tablet)
- Ring thickness: 12px
- Background ring: gray-200 (light), dark-border (dark)
- Progress ring: gradient based on score
  - 0-39%:   non-compliant red (#EF4444)
  - 40-69%:  in-progress amber (#F59E0B)
  - 70-100%: compliant green (#22C55E)
- Center text: score percentage in Display type (36px, bold)
- Sub-text: "Overall Score" in Caption type (12px, gray-500)
- Animation: ring fills clockwise on page load (800ms ease-out)
- Respect prefers-reduced-motion: skip animation if set
- Screen reader: "Compliance score: 78 percent"
```

### Gap Card with Severity

Cards displaying individual compliance gaps with color-coded severity indicators.

```
Specifications:
- Width: full width of content column
- Padding: 24px
- Background: white (light), dark-surface (dark)
- Border: 1px gray-200 (light), dark-border (dark)
- Border radius: 12px
- Left border: 4px solid, color by severity
  - Critical: non-compliant red (#EF4444)
  - High: warning amber (#D97706)
  - Medium: in-progress amber (#F59E0B)
  - Low: trust blue (#3B82F6)
- Severity badge: top-right corner
  - Background: severity color at 10% opacity
  - Text: severity color, Caption type, uppercase
- Title: H3 type (20px, semibold)
- Control ID: DM Mono, gray-500, inline with title
- Description: Body type (14px, gray-600)
- Remediation section: collapsible, numbered list, Body type
- Actions: right-aligned, secondary buttons (Create Task, Mark Resolved)
- Hover: subtle shadow elevation (shadow-md)
- Focus: trust blue ring (ring-2 ring-trust-600)
```

### Policy Document Card

Cards representing generated compliance policies in the policy library.

```
Specifications:
- Width: full width of content column
- Padding: 24px
- Background: white (light), dark-surface (dark)
- Border: 1px gray-200
- Border radius: 12px
- Header row: policy title (H3) + version badge (DM Mono, gray pill)
- Metadata row: framework tags (small pills), last updated date
- Status badge: positioned top-right
  - Draft: gray-100 bg, gray-600 text
  - Review: in-progress-50 bg, warning amber text
  - Approved: compliant green 50 bg, shield green text
  - Published: trust-50 bg, trust blue text
- Acknowledgment bar: horizontal progress bar (compliant green)
  - "42/45 employees acknowledged" in Caption type
- Actions: View, Edit, Version History (text buttons, trust blue)
- AI indicator: SparklesIcon + "AI Generated" in Caption, gray-400
```

### Evidence Item

Individual evidence entries within the evidence vault.

```
Specifications:
- Layout: horizontal row within accordion group
- Height: 56px (collapsed)
- Padding: 12px 16px
- Left element: type icon (20px)
  - Screenshot: CameraIcon
  - Config: CodeBracketIcon
  - Document: DocumentIcon
  - Log: CommandLineIcon
  - Access review: UserGroupIcon
- Title: Body type (14px, medium weight), truncate with ellipsis
- Collection method: "Auto" with robot icon or "Manual" with person icon
  - Caption type, gray-400
- Collection date: Caption type, gray-400
- Freshness badge: right-aligned
  - Fresh (< 30 days): compliant green pill
  - Stale (30-90 days): in-progress amber pill
  - Expired (> 90 days): non-compliant red pill
  - Missing: gray pill with dashed border
- Hover: gray-50 background
- Click: opens evidence detail panel (slide-over from right)
- Divider: 1px gray-100 between items
```

### Task Card (Kanban Board)

Draggable task cards used on the compliance task board.

```
Specifications:
- Width: column width minus padding (typically 280px)
- Padding: 16px
- Background: white (light), dark-surface (dark)
- Border: 1px gray-200
- Border radius: 8px
- Title: Body type (14px, medium weight), max 2 lines with ellipsis
- Priority indicator: left border 3px
  - Critical: non-compliant red
  - High: warning amber
  - Medium: in-progress amber
  - Low: trust blue
- Priority badge: inline with title
  - Small pill, severity colors, Caption type
- Assignee: avatar circle (24px) + name in Caption type
- Due date: CalendarIcon (16px) + date in Caption type
  - Overdue: non-compliant red text
  - Due today: warning amber text
  - Future: gray-500 text
- Framework tag: small pill (trust-50 bg, trust blue text)
- Control ID: DM Mono, gray-400, Caption size
- Drag handle: 6 dots icon, gray-300, visible on hover
- Hover: shadow-sm elevation
- Dragging: shadow-lg elevation, slight rotation (2deg), opacity 0.9
- Drop target: dashed border, trust-50 background
```

### Framework Progress Bar

Horizontal progress bars showing completion by framework.

```
Specifications:
- Width: full width of container
- Height: 8px (bar), 28px total (with label row)
- Label row: framework name (Body, medium) + percentage (Body, semibold)
- Track: gray-200 (light), dark-surface-2 (dark)
- Fill: gradient based on percentage
  - 0-39%: non-compliant red
  - 40-69%: in-progress amber
  - 70-100%: compliant green
- Border radius: 9999px (fully rounded)
- Animation: width fills left-to-right on mount (600ms ease-out)
- Hover: tooltip showing category breakdown
- Screen reader: "SOC 2 compliance: 72 percent complete"
```

### Integration Connection Status

Cards showing connected/available infrastructure integrations.

```
Specifications:
- Width: 50% of content area (2-column grid)
- Padding: 24px
- Background: white (light), dark-surface (dark)
- Border: 1px gray-200
- Border radius: 12px
- Logo: integration logo (40px x 40px) in a gray-50 rounded square
- Name: H4 type (16px, semibold)
- Description: Body Small (13px, gray-500), 2 lines max
- Status indicator: right-aligned
  - Connected: green dot (8px) + "Connected" in Caption, shield green
  - Not connected: gray dot (8px) + "Not Connected" in Caption, gray-400
  - Error: red dot (8px) + "Error" in Caption, non-compliant red
  - Scanning: animated pulse dot (amber) + "Scanning..." in Caption
- Connected metadata: "Last scan: 2h ago" in Caption, gray-400
- Actions (connected): Test Connection, Reconfigure, Disconnect
- Actions (not connected): Connect button (primary, trust blue)
- Hover: shadow-sm elevation
```

---

## Button Styles

### Button Variants

| Variant     | Background          | Text            | Border           | Usage                          |
| ----------- | ------------------- | --------------- | ---------------- | ------------------------------ |
| Primary     | trust-600           | white           | none             | Main actions (Save, Generate)  |
| Secondary   | white               | gray-700        | 1px gray-200     | Secondary actions (Cancel)     |
| Danger      | alert red           | white           | none             | Destructive (Delete, Disconnect)|
| Ghost       | transparent         | trust-600       | none             | Tertiary actions, links        |
| Success     | shield green        | white           | none             | Positive confirm (Approve)     |

### Button Sizes

| Size   | Height | Padding (x)  | Font Size | Icon Size | Usage                    |
| ------ | ------ | ------------- | --------- | --------- | ------------------------ |
| sm     | 32px   | 12px          | 13px      | 16px      | Table actions, inline    |
| md     | 40px   | 16px          | 14px      | 20px      | Default, form buttons    |
| lg     | 48px   | 24px          | 16px      | 20px      | CTAs, page-level actions |

### Button States

- **Default**: base colors as specified above
- **Hover**: darken background by one shade (trust-600 becomes trust-700)
- **Active/Pressed**: darken by two shades, slight scale (0.98)
- **Focused**: ring-2 ring-offset-2 ring-trust-600
- **Disabled**: opacity-50, cursor-not-allowed
- **Loading**: spinner icon replaces content, maintain button width

---

## Badge Styles

### Status Badges

```
Specifications:
- Height: 24px
- Padding: 4px 10px
- Border radius: 6px
- Font: Caption (12px, medium weight)
- Text transform: capitalize

Variants:
- Compliant:     bg-green-50   text-green-700   (dark: bg-green-900/20 text-green-400)
- Non-compliant: bg-red-50     text-red-700     (dark: bg-red-900/20 text-red-400)
- In progress:   bg-amber-50   text-amber-700   (dark: bg-amber-900/20 text-amber-400)
- Draft:         bg-gray-100   text-gray-600    (dark: bg-gray-800 text-gray-400)
- Critical:      bg-red-100    text-red-800     (dark: bg-red-900/30 text-red-400)
- High:          bg-orange-100 text-orange-800  (dark: bg-orange-900/30 text-orange-400)
- Medium:        bg-amber-100  text-amber-800   (dark: bg-amber-900/30 text-amber-400)
- Low:           bg-blue-100   text-blue-800    (dark: bg-blue-900/30 text-blue-400)
```

### Framework Tags

```
Specifications:
- Height: 22px
- Padding: 2px 8px
- Border radius: 4px
- Font: Caption (11px, medium weight)
- Background: trust-50
- Text: trust-600
- Used for: tagging policies, evidence, and tasks with their framework
- Examples: "SOC 2", "GDPR", "HIPAA", "ISO 27001"
```

---

## Shadow System

| Level   | CSS Shadow                                          | Usage                              |
| ------- | --------------------------------------------------- | ---------------------------------- |
| None    | none                                                | Default card state, flat surfaces  |
| sm      | `0 1px 2px rgba(0, 0, 0, 0.05)`                    | Card hover, subtle elevation       |
| md      | `0 4px 6px -1px rgba(0, 0, 0, 0.1)`                | Dropdowns, popovers, active cards  |
| lg      | `0 10px 15px -3px rgba(0, 0, 0, 0.1)`              | Modals, slide-overs, drag state    |
| xl      | `0 20px 25px -5px rgba(0, 0, 0, 0.1)`              | Full-page modals, overlay dialogs  |

In dark mode, shadows are replaced with border emphasis (brighter borders on elevated surfaces) since shadows are not visible against dark backgrounds.

---

## Animation and Motion

### Principles

- Animations serve function, not decoration. They communicate state changes and guide attention.
- All animations respect `prefers-reduced-motion`. When reduced motion is preferred, transitions are instant (0ms).
- No animation should delay a user from completing a task. Loading states use skeleton screens, not spinners that block interaction.

### Transition Specifications

| Element                    | Duration | Easing          | Property                    |
| -------------------------- | -------- | --------------- | --------------------------- |
| Button hover               | 150ms    | ease-in-out     | background-color, shadow    |
| Card hover                 | 200ms    | ease-out        | shadow, transform           |
| Sidebar collapse/expand    | 200ms    | ease-in-out     | width                       |
| Modal open/close           | 200ms    | ease-out / in   | opacity, transform (scale)  |
| Slide-over open/close      | 300ms    | ease-out / in   | transform (translateX)      |
| Dropdown open/close        | 150ms    | ease-out / in   | opacity, transform (scaleY) |
| Score ring animation       | 800ms    | ease-out        | stroke-dashoffset           |
| Progress bar fill          | 600ms    | ease-out        | width                       |
| Toast notification         | 300ms    | ease-out        | transform (translateY)      |
| Skeleton loader            | 1500ms   | ease-in-out     | opacity (pulse)             |
| Alert banner enter         | 300ms    | ease-out        | opacity, max-height         |

---

## Responsive Breakpoints

| Breakpoint | Width     | Layout Changes                                              |
| ---------- | --------- | ----------------------------------------------------------- |
| 2xl        | >= 1536px | Full sidebar, 3-column grid, spacious padding               |
| xl         | >= 1280px | Full sidebar, 3-column grid, standard padding               |
| lg         | >= 1024px | Collapsed sidebar (64px icons), 2-column grid               |
| md         | >= 768px  | Hidden sidebar (hamburger), 2-column grid                   |
| sm         | >= 640px  | Hidden sidebar, 1-column grid, stacked cards                |
| xs         | < 640px   | Hidden sidebar, 1-column, monitoring and tasks only         |

### Desktop-First Approach

CompliBot is designed desktop-first. The primary users (CTOs, compliance leads, engineers) use the product at a desk during work hours. Mobile is a monitoring-only fallback: view compliance score, check alerts, update task status. Policy editing, evidence management, and audit room functionality require a desktop viewport.

---

## Dark Mode Implementation

### Switching Mechanism

Dark mode uses the `next-themes` library with `class` strategy. The toggle is in the top bar settings dropdown. The user's preference is persisted in `localStorage` and respected on subsequent visits.

### Dark Mode Color Mapping

| Light Mode          | Dark Mode              | Notes                              |
| ------------------- | ---------------------- | ---------------------------------- |
| White (`#FFFFFF`)   | Dark BG (`#0F172A`)    | Page background                    |
| Gray-50 (`#F8FAFC`) | Dark Surface (`#1E293B`)| Card backgrounds, sidebar          |
| Gray-100 (`#F1F5F9`)| Dark Surface 2 (`#334155`)| Elevated surfaces               |
| Gray-200 (`#E2E8F0`)| Dark Border (`#475569`)| Borders, dividers                  |
| Gray-900 (`#0F172A`)| Gray-50 (`#F8FAFC`)    | Primary text (inverted)            |
| Gray-600 (`#475569`)| Gray-300 (`#CBD5E1`)   | Body text (inverted)               |
| Trust-600 (`#1D4ED8`)| Trust-400 (`#60A5FA`) | Primary blue (lighter for contrast)|

### Dark Mode Semantic Colors

Semantic colors (compliant green, non-compliant red, warning amber) remain the same in dark mode but are used with reduced-opacity backgrounds for badges and banners. Text colors for status use lighter shades (green-400, red-400, amber-400) to maintain contrast against dark surfaces.

---

## Accessibility Requirements

### Color Contrast

All text-background combinations meet WCAG 2.1 AA standards:
- Normal text (< 18px): minimum 4.5:1 contrast ratio
- Large text (>= 18px bold or >= 24px): minimum 3:1 contrast ratio
- UI components and graphical objects: minimum 3:1 contrast ratio

### Color-Independent Communication

Color is never the sole indicator of status. Every color-coded element includes:
- An icon (CheckCircleIcon for compliant, XCircleIcon for non-compliant)
- A text label ("Compliant", "Non-Compliant", "In Progress")
- A position indicator (severity badges use both color and position in the severity scale)

### Focus Management

- All interactive elements have visible focus indicators: `ring-2 ring-offset-2 ring-trust-600`
- Focus rings are visible in both light and dark modes
- Modal and slide-over dialogs trap focus within the dialog
- Focus returns to the trigger element when dialogs close
- Skip navigation link is the first focusable element on every page

### Screen Reader Support

- All icons have `aria-label` attributes describing their meaning in context
- Compliance score ring uses `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Progress bars use `role="progressbar"` with appropriate ARIA attributes
- Status changes in monitoring alerts use `aria-live="polite"` regions
- Critical alerts use `role="alert"` for immediate announcement
- Data tables use proper `<th>` scope attributes and captions

---

## Security Visual Language

### Trust Indicators

CompliBot uses visual cues throughout the interface to reinforce the security-first brand:

| Indicator                  | Placement                    | Purpose                                |
| -------------------------- | ---------------------------- | -------------------------------------- |
| Shield icon in logo        | Top-left of sidebar          | Brand identity as security product     |
| Lock icon on audit room    | Navigation and page headers  | Communicates restricted access         |
| Encryption badge           | Evidence items, credentials  | Shows data is encrypted at rest        |
| "SOC 2 Compliant" badge    | Footer, about page           | CompliBot practices what it preaches   |
| Audit log indicator        | Settings, admin actions      | Transparency about action logging      |
| Read-only badge            | Auditor portal               | Clear permission boundaries            |
| MFA required badge         | Login, settings              | Reinforces security requirements       |

### Sensitive Data Display

- Customer credentials: never displayed in full, always masked with bullet characters
- API keys: show only last 4 characters, masked prefix
- Evidence files: watermarked in audit room (configurable)
- Scan results: sensitive resource identifiers partially masked by default, reveal on click with audit log entry

---

## Component Library Structure

All components follow a consistent file structure:

```
src/components/
  compliance/
    ComplianceScoreRing.tsx        # Animated SVG score ring
    FrameworkProgressBar.tsx        # Horizontal progress bar per framework
    GapCard.tsx                     # Gap detail card with severity
    ControlStatusTable.tsx          # Table of controls with status
    ComplianceTrendChart.tsx        # 30-day compliance trend (Recharts)
  dashboard/
    DashboardWidget.tsx             # Base widget wrapper (card + header)
    CriticalGapsBanner.tsx          # Red alert banner for critical gaps
    RecentActivityFeed.tsx          # Scrollable activity list
    TaskSummaryCard.tsx             # Task count stats card
    IntegrationStatusCard.tsx       # Integration connection status
    UpcomingDeadlines.tsx           # Timeline of upcoming dates
  policies/
    PolicyCard.tsx                  # Policy library list item
    PolicyEditor.tsx                # TipTap rich text editor wrapper
    PolicyVersionHistory.tsx        # Version diff viewer
    PolicyAcknowledgmentBar.tsx     # Employee acknowledgment progress
  evidence/
    EvidenceItem.tsx                # Single evidence row
    EvidenceGroupAccordion.tsx      # Control-grouped accordion
    EvidenceUploadZone.tsx          # Drag-and-drop upload area
    FreshnessBadge.tsx              # Evidence freshness indicator
  tasks/
    TaskCard.tsx                    # Kanban board task card
    TaskDetailModal.tsx             # Task detail slide-over
    TaskBoard.tsx                   # Full kanban board layout
    TaskListView.tsx                # Alternative list view
  shared/
    Badge.tsx                       # Status badges (all variants)
    Button.tsx                      # Button (all variants and sizes)
    Card.tsx                        # Base card component
    Modal.tsx                       # Headless UI modal wrapper
    SlideOver.tsx                   # Right-panel slide-over
    Table.tsx                       # TanStack Table wrapper
    SkeletonLoader.tsx              # Loading skeleton components
    EmptyState.tsx                  # Empty state with illustration
    Toast.tsx                       # Notification toast
    Tooltip.tsx                     # Headless UI tooltip wrapper
  layout/
    Sidebar.tsx                     # Main navigation sidebar
    TopBar.tsx                      # Breadcrumbs, search, notifications
    PageHeader.tsx                  # Page title + actions row
    DashboardLayout.tsx             # Full dashboard layout wrapper
```

---

*The CompliBot design system prioritizes trust, clarity, and professionalism. Every color, component, and interaction pattern is chosen to make compliance feel achievable, not overwhelming.*
