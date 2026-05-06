# Theme & Design System

## Brand Personality: "Gentle Guardian"

Mortal's design embodies a **Gentle Guardian** -- calm, trustworthy, dignified, and warm. Like a wise friend who helps you face the difficult conversations you've been putting off. The visual language communicates safety and care, never urgency or fear. Not morbid, not clinical -- warm and reassuring.

Every design decision should answer: "Would a thoughtful, gentle guide present it this way?"

**Personality Traits:**
- Warm but not saccharine
- Professional but not clinical
- Secure but not paranoid
- Encouraging but not pushy
- Honest about mortality but not morbid
- Dignified but not pretentious

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Sage Green** | `#5B8C5A` | 91, 140, 90 | Primary buttons, active states, navigation highlights, progress indicators, links, user message bubbles |
| **Forest Green (Primary Dark)** | `#3D6B3C` | 61, 107, 60 | Headings, emphasis text, pressed button state, strong accents |

**Why Sage Green:** Sage Green is the anchor of Mortal's identity. It conveys trust, growth, calm, and life -- deliberately NOT death-associated colors. It avoids the clinical feel of blue (healthcare) and the urgency of red/orange (alerts). It feels organic and alive, fitting for an app about legacy and the life you're preserving for others.

### Secondary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Warm Ivory** | `#E8DFD0` | 232, 223, 208 | AI message bubbles, secondary backgrounds, card borders, subtle dividers |

Warm Ivory provides the warmth that pure white lacks. It makes the app feel like a worn journal or a handwritten letter rather than a sterile document.

### Accent Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Soft Gold** | `#C4A35A` | 196, 163, 90 | Premium badges, onboarding CTAs, document vault accents, achievement markers, "Continue where you left off" card accent |

Soft Gold conveys premium quality, timelessness, and dignity. It is used sparingly to draw attention to key actions and premium features without feeling flashy or commercial.

### Background Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Cream White** | `#FDFBF7` | 253, 251, 247 | Primary light mode background |
| **Deep Slate** | `#1A1D21` | 26, 29, 33 | Primary dark mode background (warm dark, not pure black) |

### Surface Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Surface Light** | `#F5F0EA` | 245, 240, 234 | Card backgrounds, elevated surfaces in light mode |
| **Surface Dark** | `#262A30` | 38, 42, 48 | Card backgrounds in dark mode |

### Semantic Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Affirming Teal (Success)** | `#2D9B8C` | 45, 155, 140 | Success states, completed items, verified contacts, positive confirmations |
| **Gentle Red (Error)** | `#C75050` | 199, 80, 80 | Errors, destructive actions, delete confirmations, crisis banner (softer than typical error red) |
| **Warm Amber (Warning)** | `#D4943A` | 212, 148, 58 | Warnings, pending states, check-in due reminders, partially complete items |

### Text Colors

| Name | Hex | Usage |
|---|---|---|
| **Text Primary** | `#2C2C2C` | Primary body text, headings |
| **Text Secondary** | `#7A7A7A` | Descriptions, metadata, timestamps, helper text |

### Extended Palette (Derived Colors)

| Name | Hex | Usage |
|---|---|---|
| Sage Green Light | `#F0F5EF` | Card hover/press states, subtle backgrounds |
| Sage Green Muted | `#A8C5A7` | Disabled buttons, placeholder icons |
| Teal Light | `#E6F5F3` | Success message backgrounds |
| Red Light | `#FCEAEA` | Error message backgrounds |
| Amber Light | `#FDF3E4` | Warning message backgrounds |
| Dark Surface Elevated | `#2E323A` | Dark mode modals, bottom sheets |
| Dark Border | `#333840` | Dark mode card borders (replaces shadows) |
| Dark Text Primary | `#E8E6E3` | Dark mode primary text (warm off-white) |
| Dark Text Muted | `#9B9A97` | Dark mode secondary text |
| Dark Sage Green | `#6B9C6A` | Dark mode accent (slightly brightened for contrast) |

---

## Typography

### Font Families

**Headings: Source Serif 4**
- Style: Serif, variable weight
- Why: Serif fonts convey tradition, trust, and gravitas -- appropriate for legal documents and life planning. Source Serif 4 has a warm, literary quality that feels personal and dignified. Highly readable, excellent weight range, available on Google Fonts (free).
- Weights used: Regular (400) for subtitle headings, SemiBold (600) for section headings, Bold (700) for page titles

**Body: Inter**
- Style: Sans-serif, variable weight
- Why: Inter was designed specifically for screen readability. Excellent x-height, open apertures, and tabular number support make it ideal for forms, data-heavy screens, and long-reading AI conversations. Legible at all sizes, modern without being trendy.
- Weights used: Regular (400) for body text, Medium (500) for labels and emphasis, SemiBold (600) for card titles and buttons

### Type Scale

| Level | Font | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| Display | Source Serif 4 | Bold | 32px | 40px | Welcome screen title |
| H1 | Source Serif 4 | Bold | 28px | 36px | Page titles |
| H2 | Source Serif 4 | SemiBold | 24px | 32px | Section headings |
| H3 | Source Serif 4 | SemiBold | 20px | 28px | Card titles, dialog titles |
| H4 | Source Serif 4 | Regular | 18px | 26px | Subsection headings |
| Body Large | Inter | Regular | 18px | 28px | AI conversation messages |
| Body | Inter | Regular | 16px | 24px | Default body text |
| Body Small | Inter | Regular | 14px | 20px | Secondary text, descriptions |
| Caption | Inter | Medium | 12px | 16px | Timestamps, metadata |
| Overline | Inter | SemiBold | 11px | 16px | Category labels, badges |
| Button | Inter | SemiBold | 16px | 20px | Button text |
| Button Small | Inter | SemiBold | 14px | 18px | Small buttons, text links |

### Dynamic Type Support

All text sizes scale proportionally with the system font size setting:

| System Setting | Scale Factor | Body Text Becomes |
|---|---|---|
| Extra Small | 0.8x | 13px |
| Small | 0.9x | 14px |
| Default | 1.0x | 16px |
| Large | 1.1x | 18px |
| Extra Large | 1.2x | 19px |
| XXL | 1.3x | 21px |
| XXXL (Accessibility) | 1.5x | 24px |

Layout must accommodate text up to 1.5x default size without clipping, overlapping, or breaking.

---

## Spacing System

### Base Unit: 8px

All spacing values are multiples of the 8px base unit. This creates consistent rhythm and generous breathing room throughout the app.

| Token | Value | Usage |
|---|---|---|
| `space-xs` | 4px | Between inline elements, icon-to-text gap |
| `space-sm` | 8px | Between related items, section heading to content |
| `space-md` | 16px | Between cards, between form fields, list item padding |
| `space-lg` | 24px | Screen edge padding, section separation |
| `space-xl` | 32px | Major section breaks, header to content |
| `space-2xl` | 48px | Screen top/bottom padding, breathing room between major sections |

**Screen Edge Padding:** 24px horizontal (generous, not cramped)
**Between Cards:** 16px vertical gap (room to breathe)
**Between Form Fields:** 20px vertical gap (clear separation)
**Card Internal Padding:** 16px (compact) / 20px (standard) / 24px (featured)

---

## Border Radius

| Element | Radius | Notes |
|---|---|---|
| Cards | 16px | Soft, approachable, inviting |
| Buttons | 12px | Slightly less rounded than cards, feels clickable |
| Input fields | 12px | Matches button radius |
| Badges/Pills | Full pill (height/2) | Fully rounded for status indicators |
| Bottom sheets | 20px (top corners) | Generous rounding for sheet handles |
| Avatars | Full circle | Always perfectly circular |
| Chat bubbles | 16px (3 corners), 4px (pointer corner) | Creates natural speech bubble shape |
| Progress bars | 4px | Subtle rounding on thin bars |

---

## Iconography

### Icon Library: Lucide Icons

**Why Lucide:**
- Clean, consistent stroke-based design with warm visual weight
- 1,000+ icons covering all Mortal use cases
- Open source (ISC license)
- 24x24 default size with consistent 1.5px stroke
- React Native compatible via `lucide-react-native`

### Icon Sizing

| Context | Size | Stroke Width |
|---|---|---|
| Navigation tab bar | 24x24 | 1.5px |
| Section card icon | 28x28 in 40x40 circle | 1.5px |
| Large feature icon (onboarding) | 48x48 | 2px |
| Inline text icon | 16x16 | 1.5px |
| Button leading icon | 20x20 | 1.5px |
| FAB icon | 24x24 | 2px |

### Key Icons

| Purpose | Lucide Icon | Default Color |
|---|---|---|
| Home/Dashboard | `home` | Tab bar color |
| Document Vault | `lock` | Tab bar color |
| Trusted Contacts | `users` | Tab bar color |
| Settings | `settings` | Tab bar color |
| AI Conversation | `message-circle` | Sage Green |
| Digital Legacy | `globe` | Sage Green |
| Documents | `shield-check` | Sage Green |
| Legal | `scale` | Sage Green |
| Check-In | `heart-pulse` | Sage Green |
| Encryption | `lock` | Affirming Teal |
| Camera/Scan | `camera` | Context-dependent |
| Upload | `upload` | Context-dependent |
| Add | `plus` | White (on green bg) |
| Search | `search` | Text Secondary |
| Success | `check-circle` | Affirming Teal |
| Warning | `alert-triangle` | Warm Amber |
| Error | `alert-circle` | Gentle Red |
| Edit | `pencil` | Sage Green |
| Delete | `trash-2` | Gentle Red |
| Share | `share-2` | Sage Green |
| Biometric | `scan-face` | Sage Green |
| Back | `arrow-left` | Text Primary |

---

## Illustrations

### Style: Soft Watercolor Nature Imagery

**Art Direction:**
- Medium: digital watercolor with soft edges, no hard outlines
- Subjects: trees, leaves, light, journals, hands, paths, gardens -- abstract and non-literal
- Color palette: muted Sage Green, Warm Ivory, Soft Gold, touches of sky blue and earth tones
- Mood: peaceful, warm, contemplative -- like a nature walk at golden hour
- No people with identifiable features (inclusive by default)
- No religious symbols in default illustrations (culturally neutral)
- Anatomically vague when hands appear: stylized and non-specific

**Illustration Inventory:**

| Screen | Illustration | Description |
|---|---|---|
| Welcome | Guardian Tree | Large oak tree with warm light filtering through canopy |
| Onboarding | Three Seeds | Seeds in stages: planted, sprouting, blooming -- growth metaphor |
| Empty Vault | Shield Garden | Soft shield shape with document icons protected within |
| Empty Digital Assets | Floating Icons | App icons drifting like leaves in warm light |
| Empty Contacts | Connected Hands | Two stylized hands reaching toward each other |
| Error State | Cloud & Sunbreak | Small cloud with gentle rain, sun peeking through |
| Completion | Full Tree | Guardian tree from welcome, now with golden autumn leaves |
| Loading | Drifting Leaf | Single leaf turning gently in a breeze |

**Dark Mode Variants:** All illustrations have dark mode versions with darker background tones, slightly luminous light sources, and reduced saturation for comfort.

---

## Design Principles

### 1. Generous Whitespace (Calm)

Space communicates calm. Dense layouts create anxiety; generous whitespace creates breathing room. This is especially important when the content concerns mortality.

- Screen edges never feel crowded (24px horizontal padding)
- Cards float in space with clear separation (16px gaps)
- Form fields have room between them (20px)
- No section feels cramped or urgently packed

### 2. Gentle Transitions (No Jarring Animations)

Every state transition should feel intentional and calm. Nothing should snap, pop, or startle.

| Animation | Duration | Easing |
|---|---|---|
| Screen transition (push) | 300ms | ease-in-out-cubic |
| Modal open | 250ms | ease-out-cubic |
| Card press feedback | 150ms | ease-out |
| Content fade-in | 200ms | ease-out |
| Progress bar fill | 800ms | ease-out-cubic |
| Toast slide-in | 200ms | ease-out-cubic |
| Bottom sheet open | 300ms | spring (damping 20) |
| Chat message appear | 200ms | slide-up + fade |
| Typing indicator dots | 600ms loop | ease-in-out |
| Leaf confetti (celebration) | 2000ms | linear |

**Reduced Motion:** When system "Reduce Motion" is enabled: all spring/bounce animations become simple opacity fades (200ms), no parallax effects, no confetti, screen transitions use crossfade instead of slide.

### 3. Warm Color Temperature

The entire palette skews warm. No cold blues, no stark whites, no clinical grays. Even the background cream (#FDFBF7) has warm undertones. The app should feel like afternoon sunlight, not fluorescent lighting.

### 4. Large Text Options

The app must be fully functional at 1.5x text scale:
- Never set fixed heights on text containers -- use minHeight or auto
- Use flexbox for all layouts
- Test every screen at XXXL Accessibility text size
- Truncate with ellipsis only as a last resort; prefer wrapping
- Buttons grow vertically to accommodate larger text

### 5. Progress Indicators That Feel Encouraging, Not Overwhelming

- Progress never starts at 0% (account creation = 5%)
- Progress copy changes with level: always positive, never punitive
- No deadlines, no "you're behind" messaging
- Incomplete sections shown with light sage, not red or grey
- Section counts say "3 of 8 topics" not "5 remaining"

---

## Dark Mode

### Warm Dark (Not Pure Black)

Dark mode is not just an inverted light mode. Pure black (#000000) feels harsh and void-like -- inappropriate for an app about life and legacy. Mortal uses **warm dark** tones that feel cozy and enveloping.

**Dark Mode Principles:**
- Background: Deep Slate (#1A1D21) -- warm undertone, not pure black
- Surfaces: progressively lighter for elevation (#262A30, #2E323A)
- Text: warm off-white (#E8E6E3) -- not pure white, reduces eye strain
- Accent colors: same hues, slightly adjusted for contrast (Sage Green becomes #6B9C6A)
- Shadows: removed entirely, replaced with 1px borders (#333840) for elevation hierarchy
- Illustrations: dedicated dark mode variants with adjusted color palettes
- System bar: dark background with light status bar text

**Dark Mode Color Mappings:**

| Light Mode | Dark Mode |
|---|---|
| Cream White (#FDFBF7) | Deep Slate (#1A1D21) |
| White (cards) | Dark Surface (#262A30) |
| Surface Light (#F5F0EA) | Dark Elevated (#2E323A) |
| Warm Ivory (#E8DFD0) | Dark Elevated (#2E323A) |
| Text Primary (#2C2C2C) | Dark Text (#E8E6E3) |
| Text Secondary (#7A7A7A) | Dark Text Muted (#9B9A97) |
| Card shadow | Card border (#333840) |
| Sage Green (#5B8C5A) | Dark Sage (#6B9C6A) |
| Teal Light (#E6F5F3) | Dark Teal Tint (#1A3330) |
| Red Light (#FCEAEA) | Dark Red Tint (#3A1A1A) |

---

## Component Specifications

### Primary Button

```
Background: Sage Green (#5B8C5A)
Text: White (#FFFFFF)
Font: Inter SemiBold, 16px
Height: 52px
Border Radius: 12px
Padding: 0 24px
Shadow: 0 2px 8px rgba(91, 140, 90, 0.25) [light mode only]

States:
- Default: as above
- Pressed: background Forest Green (#3D6B3C), scale 0.98
- Disabled: background Sage Green Muted (#A8C5A7), no shadow
- Loading: text replaced with white spinner (20x20)
```

### Trust Badges

```
Layout: horizontal row of 3 badges, centered
Each badge: [icon 20x20] + [label text]
Icon color: Sage Green
Text: Inter Medium, 12px, Text Secondary
Spacing: 16px between badges

Examples:
- Lock icon + "Bank-level encryption"
- Shield icon + "Zero-knowledge storage"
- Heart icon + "Designed with empathy"
```

### Document Cards with Lock Icons

```
Background: Surface Light (#F5F0EA) / Dark Surface (#262A30)
Border Radius: 16px
Left Border: 2px solid category color (Legal: sage, Insurance: gold, Medical: teal, Financial: amber)
Padding: 16px
Lock icon: 16x16, Affirming Teal, positioned top-right as "encrypted" indicator

Layout:
- Row 1: [Document icon 24x24] [Document name - Inter SemiBold 15px] [Lock icon]
- Row 2: [AI summary - Inter Regular 13px, Text Secondary]
- Row 3: [Upload date] [File size] [Shared contact avatars]
```

### Progress Wheels

```
Size: 160x160px
Stroke Width: 12px
Background Track: #E8E8E8 / Dark Border (#333840)
Track Cap: round
Fill Direction: clockwise from top

Center:
- Percentage: Source Serif 4 Bold, 48px, Text Primary
- Label beneath: Inter Regular, 14px, Text Secondary

Animation: fills from 0 to current value over 800ms with ease-out-cubic
Segment gap: 4px transparent between sections
```

### Chat Bubbles

```
AI Message:
- Background: Warm Ivory (#E8DFD0) / Dark Elevated (#2E323A)
- Border Radius: 16px top-right, 16px bottom-right, 16px bottom-left, 4px top-left
- Max Width: 85%
- Padding: 12px 16px
- Font: Inter Regular, 16px
- Avatar: sage green tree icon, 32x32 circle

User Message:
- Background: Sage Green (#5B8C5A) / Dark Sage (#6B9C6A)
- Border Radius: 16px top-left, 16px bottom-left, 16px bottom-right, 4px top-right
- Max Width: 85%
- Padding: 12px 16px
- Font: Inter Regular, 16px, White
- Alignment: right
```

### Bottom Tab Bar

```
Background: White (#FFFFFF) / Dark Surface (#262A30)
Height: 84px (including safe area)
Border Top: 1px solid #E8E8E8 / Dark Border (#333840)

Tab Item:
- Icon: Lucide 24x24
- Label: Inter Medium, 10px, 4px below icon
- Inactive: Text Secondary (#7A7A7A)
- Active: Sage Green (#5B8C5A) / Dark Sage (#6B9C6A)
- Touch target: full tab width x 48px minimum height

Tabs: Home, Plan, Vault, Settings
```

### Toast Notifications

```
Position: top of screen, below status bar, 16px horizontal inset
Background: White / Dark Elevated
Border Radius: 12px
Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
Padding: 14px 16px

Layout: [Icon 20x20] [Message - Inter Medium 14px] [Dismiss X]
Icon colors by type: Teal (success), Gentle Red (error), Warm Amber (warning), Sage Green (info)
Auto-dismiss: 4 seconds
Animation: slide down 200ms, slide up 150ms
```

### Bottom Sheet

```
Background: White / Dark Surface
Border Radius: 20px top corners
Overlay: Black 40% opacity
Max Height: 90% screen

Handle: 40px wide x 4px tall, centered, #D1D1D1 / #666666, 12px from top
Animation: slide up 300ms spring, slide down 200ms ease-in
Dismiss: drag down past 30% threshold or tap overlay
```

### Status Badges

```
Height: 24px
Border Radius: 12px (full pill)
Padding: 0 10px
Font: Inter SemiBold, 11px

Variants:
- Active/Confirmed: background Affirming Teal, text White
- Pending: background Warm Amber, text White
- Error/Declined: background Gentle Red, text White
- Inactive: background #E0E0E0 / #333840, text #666
- Premium: background Soft Gold, text White
```
