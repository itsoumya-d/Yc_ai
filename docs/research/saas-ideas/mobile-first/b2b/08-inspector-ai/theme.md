# Theme — Inspector AI

> Brand identity, color system, typography, spacing, and component styling for a professional, field-ready insurance inspection app.

---

## Brand Personality

Inspector AI's brand communicates four core traits:

| Trait | Meaning | Design Implication |
|---|---|---|
| **Professional** | Trusted by carriers, respected by adjusters | Clean layouts, conservative color palette, no playful illustrations |
| **Trustworthy** | Data is accurate, reports are reliable | Strong typography hierarchy, clear data presentation, consistent patterns |
| **Efficient** | Saves time, reduces friction | Minimal UI chrome, large touch targets, fast interactions |
| **Field-Ready** | Works outdoors, in bad weather, with gloves | High contrast, readable in sunlight, forgiving touch targets |

**Brand voice**: Direct, knowledgeable, concise. Speaks like a senior adjuster — no jargon for jargon's sake, no unnecessary words. The app respects the user's time and expertise.

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Deep Navy | `#1B2A4A` | 27, 42, 74 | Primary brand color, headers, navigation bars, primary buttons |
| Navy Light | `#2C4470` | 44, 68, 112 | Secondary elements, hover/pressed states |
| Navy Muted | `#4A6190` | 74, 97, 144 | Tertiary text, inactive icons |

### Accent Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Safety Orange | `#E8772E` | 232, 119, 46 | Primary accent, CTAs, important actions, FAB |
| Orange Light | `#F09550` | 240, 149, 80 | Hover/pressed states for accent elements |
| Orange Muted | `#F4B580` | 244, 181, 128 | Subtle accent backgrounds, badges |

### Semantic Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Success Green | `#2D8B4E` | 45, 139, 78 | Success states, synced status, good condition scores |
| Success Light | `#D4EDDA` | 212, 237, 218 | Success background tints |
| Warning Amber | `#D4A017` | 212, 160, 23 | Warning states, offline banner, moderate severity |
| Warning Light | `#FFF3CD` | 255, 243, 205 | Warning background tints |
| Error Red | `#C4372C` | 196, 55, 44 | Error states, critical severity, destructive actions |
| Error Light | `#F8D7DA` | 248, 215, 218 | Error background tints |
| Info Blue | `#2B7CB8` | 43, 124, 184 | Informational states, AI analysis indicators |
| Info Light | `#CCE5FF` | 204, 229, 255 | Info background tints |

### Neutral Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| White | `#FFFFFF` | 255, 255, 255 | Page backgrounds, card backgrounds |
| Gray 50 | `#F8F9FA` | 248, 249, 250 | Subtle backgrounds, section dividers |
| Gray 100 | `#E9ECEF` | 233, 236, 239 | Input borders, divider lines |
| Gray 200 | `#DEE2E6` | 222, 226, 230 | Disabled element borders |
| Gray 300 | `#CED4DA` | 206, 212, 218 | Placeholder text |
| Gray 500 | `#6C757D` | 108, 117, 125 | Secondary text, captions |
| Gray 700 | `#495057` | 73, 80, 87 | Body text |
| Gray 900 | `#212529` | 33, 37, 41 | Primary text, headings |
| Black | `#000000` | 0, 0, 0 | Rarely used — for maximum emphasis only |

### Damage Severity Color Scale

Used for damage severity indicators and property condition scores.

| Severity | Range | Color | Hex |
|---|---|---|---|
| None/Minimal | 0-1 | Green | `#2D8B4E` |
| Low | 2-3 | Teal | `#20897A` |
| Moderate | 4-5 | Amber | `#D4A017` |
| Significant | 6-7 | Orange | `#E8772E` |
| Severe | 8-9 | Red-Orange | `#D4502C` |
| Critical | 10 | Red | `#C4372C` |

---

## Light Mode Specification

```
Background (primary):     #FFFFFF
Background (secondary):   #F8F9FA
Surface (cards):           #FFFFFF
Surface (elevated):        #FFFFFF with shadow
Navigation bar:            #1B2A4A
Tab bar:                   #FFFFFF with top border #E9ECEF
Status bar:                Light content (white text on navy)
Text (primary):            #212529
Text (secondary):          #6C757D
Text (tertiary):           #CED4DA
Text (on primary):         #FFFFFF
Text (on accent):          #FFFFFF
Divider:                   #E9ECEF
Input border:              #CED4DA
Input border (focused):    #1B2A4A
Input background:          #FFFFFF
```

## Dark Mode Specification

```
Background (primary):     #0D1117
Background (secondary):   #161B22
Surface (cards):           #1C2128
Surface (elevated):        #21262D
Navigation bar:            #161B22
Tab bar:                   #161B22 with top border #30363D
Status bar:                Light content (white text)
Text (primary):            #E6EDF3
Text (secondary):          #8B949E
Text (tertiary):           #484F58
Text (on primary):         #FFFFFF
Text (on accent):          #FFFFFF
Divider:                   #30363D
Input border:              #30363D
Input border (focused):    #58A6FF
Input background:          #0D1117
```

### Dark Mode Color Adjustments

Colors are adjusted for dark mode to maintain readability and reduce eye strain:

| Color | Light Mode | Dark Mode | Reason |
|---|---|---|---|
| Deep Navy | `#1B2A4A` | `#58A6FF` | Primary is used as interactive color in dark mode |
| Safety Orange | `#E8772E` | `#F09550` | Slightly lighter for contrast on dark backgrounds |
| Success Green | `#2D8B4E` | `#3FB950` | Brighter for dark background visibility |
| Warning Amber | `#D4A017` | `#E3B341` | Brighter for dark background visibility |
| Error Red | `#C4372C` | `#F85149` | Brighter for dark background visibility |

---

## Typography

### Font Families

| Usage | Font | Fallback | Weight Range |
|---|---|---|---|
| UI elements | Inter | SF Pro (iOS), Roboto (Android) | 400, 500, 600, 700 |
| Monospace (codes, IDs) | JetBrains Mono | SF Mono (iOS), Roboto Mono (Android) | 400, 500 |
| Report PDFs | System serif or Inter | Times New Roman, Georgia | 400, 600, 700 |

### Type Scale

| Name | Size (pt) | Line Height | Weight | Usage |
|---|---|---|---|---|
| Display | 32 | 40 | 700 (Bold) | Property scores, key metrics |
| H1 | 24 | 32 | 700 (Bold) | Screen titles |
| H2 | 20 | 28 | 600 (SemiBold) | Section headers |
| H3 | 17 | 24 | 600 (SemiBold) | Card titles, subsection headers |
| Body Large | 17 | 24 | 400 (Regular) | Primary body text |
| Body | 15 | 22 | 400 (Regular) | Standard body text |
| Body Small | 13 | 18 | 400 (Regular) | Secondary text, captions |
| Caption | 12 | 16 | 500 (Medium) | Labels, metadata, timestamps |
| Overline | 11 | 16 | 600 (SemiBold) | Section labels, uppercase labels |
| Badge | 10 | 12 | 700 (Bold) | Notification badges, status pills |

### Type Usage Examples

```
Screen title:     "New Inspection"          — H1, Deep Navy
Section header:   "Property Information"    — H2, Gray 900
Card title:       "Roof Assessment"         — H3, Gray 900
Body content:     "Hail damage detected..." — Body, Gray 700
Secondary info:   "Captured 2 hours ago"    — Body Small, Gray 500
Label:            "DAMAGE TYPE"             — Overline, Gray 500, uppercase
Status badge:     "SUBMITTED"               — Badge, White on Success Green
```

---

## Spacing System

Based on a 4pt grid with a primary spacing unit of 8pt.

| Token | Value | Usage |
|---|---|---|
| `space-0` | 0 | No spacing |
| `space-1` | 4pt | Tight spacing: between icon and label |
| `space-2` | 8pt | Default: between related elements |
| `space-3` | 12pt | Between moderately related elements |
| `space-4` | 16pt | Component internal padding |
| `space-5` | 20pt | Between components |
| `space-6` | 24pt | Section spacing |
| `space-7` | 32pt | Large section gaps |
| `space-8` | 40pt | Screen section separators |
| `space-9` | 48pt | Major section breaks |
| `space-10` | 64pt | Screen-level spacing |

### Screen Margins

```
Screen horizontal padding:  16pt (space-4)
Card internal padding:       16pt (space-4)
List item vertical padding:  12pt (space-3)
Section gap:                 24pt (space-6)
Bottom safe area:            34pt (iPhone) / 16pt (Android)
```

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-none` | 0 | No rounding (table cells, full-width elements) |
| `radius-sm` | 4pt | Small elements: badges, chips, tags |
| `radius-md` | 8pt | Standard: buttons, inputs, cards |
| `radius-lg` | 12pt | Prominent cards, modals |
| `radius-xl` | 16pt | Bottom sheets, large cards |
| `radius-full` | 9999pt | Circular elements: avatars, FABs, pills |

---

## Shadows

### Light Mode Shadows

| Name | Value | Usage |
|---|---|---|
| Shadow SM | `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10)` | Subtle cards, inputs |
| Shadow MD | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Elevated cards, dropdowns |
| Shadow LG | `0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)` | Modals, bottom sheets |
| Shadow XL | `0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)` | Floating action button |

### Dark Mode Shadows

Dark mode uses border-based elevation instead of shadows:

| Name | Value | Usage |
|---|---|---|
| Elevation 1 | `1px border #30363D` | Cards on background |
| Elevation 2 | `1px border #484F58` | Elevated cards, dropdowns |
| Elevation 3 | `1px border #6E7681, background #21262D` | Modals, bottom sheets |

---

## Icon Library: Lucide React Native

**Package**: `lucide-react-native`

### Icon Sizing

| Size | Pixels | Usage |
|---|---|---|
| XS | 16px | Inline with caption text, metadata icons |
| SM | 20px | Inline with body text, list item icons |
| MD | 24px | Standard: navigation, action buttons, card icons |
| LG | 32px | Prominent: empty state icons, feature icons |
| XL | 48px | Hero: onboarding illustrations, major states |

### Key Icons Used

```
Camera               — Photo capture, camera tab
FileText             — Reports, documents
Home                 — Dashboard tab
Search               — Search bars
MapPin               — Property location
Cloud                — Sync status
CloudOff             — Offline indicator
AlertTriangle        — Warning states
CheckCircle          — Success states, synced status
XCircle              — Error states
ChevronRight         — List navigation arrows
Plus                 — Add/create actions
Settings             — Settings tab
User                 — Profile
Users                — Team management
BarChart3            — Analytics
Download             — Export, download
Share2               — Share actions
Edit3                — Edit/annotate
Trash2               — Delete actions
Eye                  — View/preview
Zap                  — AI processing indicator
Wifi / WifiOff       — Connectivity status
Shield               — Security, trust indicators
```

### Icon Color Usage

```
Active/selected:     Deep Navy (#1B2A4A) or Safety Orange (#E8772E)
Inactive:            Gray 500 (#6C757D)
On dark background:  White (#FFFFFF)
Destructive:         Error Red (#C4372C)
Success:             Success Green (#2D8B4E)
```

---

## Component Styling Examples

### Primary Button

```typescript
const primaryButton = {
  backgroundColor: '#E8772E',      // Safety Orange
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 8,                  // radius-md
  minHeight: 48,                    // accessibility minimum
  alignItems: 'center',
  justifyContent: 'center',
  // Shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

const primaryButtonText = {
  fontFamily: 'Inter-SemiBold',
  fontSize: 17,                     // Body Large
  lineHeight: 24,
  color: '#FFFFFF',
  letterSpacing: 0.2,
};

// Pressed state
const primaryButtonPressed = {
  backgroundColor: '#D4692A',       // Darkened orange
  transform: [{ scale: 0.98 }],
};

// Disabled state
const primaryButtonDisabled = {
  backgroundColor: '#CED4DA',       // Gray 300
  shadowOpacity: 0,
  elevation: 0,
};
```

### Card Component

```typescript
const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,                 // radius-lg
  padding: 16,                      // space-4
  marginHorizontal: 16,             // space-4
  marginBottom: 12,                 // space-3
  // Shadow MD
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 4,
};

// Dark mode card
const cardDark = {
  backgroundColor: '#1C2128',
  borderRadius: 12,
  padding: 16,
  marginHorizontal: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#30363D',
};
```

### Input Field

```typescript
const input = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: '#CED4DA',           // Gray 300
  borderRadius: 8,                  // radius-md
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontFamily: 'Inter-Regular',
  fontSize: 15,                     // Body
  lineHeight: 22,
  color: '#212529',                 // Gray 900
  minHeight: 48,                    // accessibility minimum
};

const inputFocused = {
  borderColor: '#1B2A4A',           // Deep Navy
  borderWidth: 2,
  // Subtle glow effect
  shadowColor: '#1B2A4A',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
};

const inputError = {
  borderColor: '#C4372C',           // Error Red
  borderWidth: 2,
};

const inputLabel = {
  fontFamily: 'Inter-Medium',
  fontSize: 13,                     // Body Small
  lineHeight: 18,
  color: '#495057',                 // Gray 700
  marginBottom: 6,
};

const inputErrorText = {
  fontFamily: 'Inter-Regular',
  fontSize: 12,                     // Caption
  lineHeight: 16,
  color: '#C4372C',                 // Error Red
  marginTop: 4,
};
```

### Status Badge

```typescript
const badge = (status: 'draft' | 'submitted' | 'approved' | 'rejected') => {
  const colors = {
    draft:     { bg: '#E9ECEF', text: '#495057' },     // Gray
    submitted: { bg: '#CCE5FF', text: '#2B7CB8' },     // Info Blue
    approved:  { bg: '#D4EDDA', text: '#2D8B4E' },     // Success Green
    rejected:  { bg: '#F8D7DA', text: '#C4372C' },     // Error Red
  };

  return {
    backgroundColor: colors[status].bg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,             // radius-full (pill shape)
    alignSelf: 'flex-start',
  };
};

const badgeText = (status: string) => ({
  fontFamily: 'Inter-Bold',
  fontSize: 10,                    // Badge size
  lineHeight: 12,
  color: colors[status].text,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
});
```

### Tab Bar

```typescript
const tabBar = {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E9ECEF',        // Gray 100
  paddingBottom: 34,                 // Safe area (iPhone)
  paddingTop: 8,
  height: 83,                       // 49 + 34 safe area
};

const tabBarItem = {
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,                           // space-1
};

const tabBarLabel = {
  fontFamily: 'Inter-Medium',
  fontSize: 10,
};

const tabBarLabelActive = {
  color: '#E8772E',                 // Safety Orange
};

const tabBarLabelInactive = {
  color: '#6C757D',                 // Gray 500
};
```

### Floating Action Button (FAB)

```typescript
const fab = {
  position: 'absolute',
  bottom: 100,                      // Above tab bar
  right: 20,
  width: 56,
  height: 56,
  borderRadius: 28,                 // Circular
  backgroundColor: '#E8772E',       // Safety Orange
  alignItems: 'center',
  justifyContent: 'center',
  // Shadow XL
  shadowColor: '#E8772E',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
};
```

### Damage Severity Bar

```typescript
const severityBar = (severity: number) => {
  const getColor = (s: number) => {
    if (s <= 1) return '#2D8B4E';
    if (s <= 3) return '#20897A';
    if (s <= 5) return '#D4A017';
    if (s <= 7) return '#E8772E';
    if (s <= 9) return '#D4502C';
    return '#C4372C';
  };

  return {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',       // Gray 100 (track)
    overflow: 'hidden',
    // Fill
    fillWidth: `${severity * 10}%`,
    fillColor: getColor(severity),
  };
};
```

---

## Motion and Animation

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Button press | 100ms | ease-out | Scale to 0.98 on press |
| Screen transition | 300ms | ease-in-out | Slide/fade between screens |
| Card appearance | 200ms | ease-out | Fade in + slight slide up |
| Toast notification | 250ms in, 200ms out | spring (damping: 15) | Slide up from bottom |
| AI detection overlay | 150ms | ease-out | Fade in bounding boxes |
| Score counter | 800ms | ease-out | Animated number count up |
| Sync spinner | continuous | linear | 360-degree rotation |
| Skeleton shimmer | 1500ms | linear, loop | Left-to-right gradient sweep |

### Reduced Motion

When the system "Reduce Motion" setting is enabled:
- Replace all slide transitions with cross-dissolve
- Disable scale animations on button press
- Disable score counter animation (show final number immediately)
- Keep essential motion only: loading spinners, progress bars

---

## Outdoor Readability

Since adjusters use the app in direct sunlight, rain, and other challenging conditions:

| Consideration | Solution |
|---|---|
| Bright sunlight | High contrast ratios (7:1+ for critical text), avoid light gray on white |
| Wet screen (rain) | Large touch targets (48pt minimum), forgiving tap detection |
| Gloves | Extra-large touch targets on camera screen (56pt+ capture button) |
| Moving vehicle (reviewing) | Large text sizes, simple layouts, minimal scrolling |
| Quick glance reading | Bold status badges, color-coded severity, icon + text pairing |

---

*Every design decision serves the adjuster in the field — not the designer at the desk.*
