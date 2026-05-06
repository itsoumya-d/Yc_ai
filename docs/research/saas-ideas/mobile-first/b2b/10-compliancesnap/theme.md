# ComplianceSnap -- Theme & Design System

## Brand Personality

ComplianceSnap's design communicates four core traits:

| Trait              | Expression                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| **Authoritative**  | Clean data presentation, regulation references, structured reports            |
| **Safety-focused** | OSHA-standard color coding, prominent severity indicators, warning patterns   |
| **Industrial-grade** | High contrast, large touch targets, ruggedized aesthetic, no delicacy       |
| **Trustworthy**    | Consistent design language, predictable interactions, professional typography |

The design system is built for people in hard hats, not behind desks. Every decision optimizes for gloved fingers, bright sunlight, glanceable information, and one-handed operation.

---

## Color Palette

### Primary Colors

| Name               | Hex       | RGB             | Usage                                            |
| ------------------ | --------- | --------------- | ------------------------------------------------ |
| **Safety Yellow**  | `#FFC107` | 255, 193, 7     | Primary brand color, CTAs, scan button, accents  |
| **Industrial Charcoal** | `#2D3436` | 45, 52, 54 | Primary text, headers, dark backgrounds          |
| **White**          | `#FFFFFF` | 255, 255, 255   | Card backgrounds, light mode base                |

### Severity Colors (OSHA-Aligned)

| Name               | Hex       | RGB             | Severity Level  | OSHA Parallel          |
| ------------------ | --------- | --------------- | --------------- | ---------------------- |
| **Alert Red**      | `#FF3B30` | 255, 59, 48     | Critical        | Imminent Danger        |
| **Caution Orange** | `#FF9500` | 255, 149, 0     | Major           | Serious Violation      |
| **Safety Yellow**  | `#FFC107` | 255, 193, 7     | Minor           | Other-than-Serious     |
| **Compliant Green**| `#34C759` | 52, 199, 89     | Observation/OK  | Compliant / De Minimis |

### Extended Palette

| Name               | Hex       | Usage                                          |
| ------------------ | --------- | ---------------------------------------------- |
| **Info Blue**      | `#007AFF` | Informational badges, links, observations      |
| **Admin Purple**   | `#AF52DE` | Admin role badge, premium features             |
| **Surface Gray**   | `#F2F2F7` | Light mode background surface                  |
| **Border Gray**    | `#E5E5EA` | Card borders, dividers (light mode)            |
| **Secondary Text** | `#8E8E93` | Placeholder text, timestamps, captions         |
| **Dark Surface**   | `#1C1C1E` | Dark mode background surface                   |
| **Dark Card**      | `#2C2C2E` | Dark mode card background                      |
| **Dark Border**    | `#3A3A3C` | Dark mode borders and dividers                 |

### Color Usage Rules

1. **Never use color alone to convey information.** Always pair color with an icon, label, or pattern. (Accessibility for color-blind users, ~8% of male industrial workers.)
2. **Severity colors are sacred.** Red always means critical. Green always means compliant. Never use red for non-critical UI elements.
3. **Safety Yellow is the brand.** Use it for primary CTAs, the scan button, and brand accent. Do not use it for caution indicators in violation contexts (use the separate caution orange instead to avoid confusion).
4. **High contrast always.** All text must meet WCAG AA (4.5:1 minimum). In high-contrast mode, meet WCAG AAA (7:1).

---

## Light Mode & Dark Mode

### Light Mode (Default)

```
Background:       #F2F2F7 (Surface Gray)
Card Background:  #FFFFFF (White)
Primary Text:     #2D3436 (Industrial Charcoal)
Secondary Text:   #8E8E93
Borders:          #E5E5EA
Header:           #2D3436 (solid)
Tab Bar:          #FFFFFF with top border
Status Bar:       Dark content
```

### Dark Mode

```
Background:       #000000 (True black for OLED)
Card Background:  #1C1C1E (Dark Surface)
Primary Text:     #FFFFFF
Secondary Text:   #8E8E93
Borders:          #3A3A3C
Header:           #1C1C1E (solid)
Tab Bar:          #1C1C1E with top border
Status Bar:       Light content
```

### High Contrast Mode (Factory / Outdoor)

An additional mode designed for maximum visibility in bright sunlight and dim warehouse conditions:

```
Background:       #000000
Card Background:  #1A1A1A
Primary Text:     #FFFFFF
Secondary Text:   #CCCCCC
Borders:          #555555 (thicker: 2px)
Severity Red:     #FF453A (brighter red)
Severity Orange:  #FF9F0A (brighter orange)
Severity Yellow:  #FFD60A (brighter yellow)
Compliant Green:  #30D158 (brighter green)
Buttons:          Extra-thick borders, larger text
```

### Mode Selection

- Default: Follow system setting (iOS/Android dark mode preference)
- Manual override in Settings
- High-contrast mode toggle (separate from dark/light)
- Auto-brightness consideration: Recommend high-contrast when screen brightness is >80%

---

## Typography

### Font Stack

| Font              | Weight    | Usage                                        |
| ----------------- | --------- | -------------------------------------------- |
| **Work Sans**     | 600, 700  | Headings (H1-H4), navigation titles, scores  |
| **Source Sans 3** | 400, 600  | Body text, descriptions, form labels          |
| **Fira Code**     | 400       | Regulation codes, inspection IDs, data values |

### Why These Fonts

- **Work Sans**: Geometric, industrial feel. Highly legible at large sizes. The wide letterforms read well on small screens in poor lighting.
- **Source Sans 3** (formerly Source Sans Pro): Adobe's workhorse sans-serif. Excellent readability at body sizes. Clear distinction between similar characters (l/1/I, O/0).
- **Fira Code**: Monospace font with ligatures. Perfect for regulation codes like "29 CFR 1910.212(a)(1)" where every character matters. Also used for inspection IDs and data values.

### Type Scale

| Style        | Font          | Size   | Weight | Line Height | Usage                          |
| ------------ | ------------- | ------ | ------ | ----------- | ------------------------------ |
| **Display**  | Work Sans     | 34px   | 700    | 41px        | Compliance score, hero numbers |
| **H1**       | Work Sans     | 28px   | 700    | 34px        | Screen titles                  |
| **H2**       | Work Sans     | 22px   | 600    | 28px        | Section headers                |
| **H3**       | Work Sans     | 18px   | 600    | 24px        | Card titles, subsection headers|
| **H4**       | Work Sans     | 16px   | 600    | 22px        | List item titles               |
| **Body L**   | Source Sans 3 | 17px   | 400    | 24px        | Primary body text              |
| **Body M**   | Source Sans 3 | 15px   | 400    | 22px        | Secondary body text, descriptions |
| **Body S**   | Source Sans 3 | 13px   | 400    | 18px        | Captions, timestamps           |
| **Label**    | Source Sans 3 | 15px   | 600    | 20px        | Form labels, badge text        |
| **Code**     | Fira Code     | 14px   | 400    | 20px        | Regulation codes, IDs          |
| **Code L**   | Fira Code     | 16px   | 400    | 22px        | Prominent regulation references|

### Typography Rules

1. **Minimum body text: 15px.** No text smaller than 13px anywhere in the app (except legal footnotes).
2. **Support Dynamic Type.** Respect iOS/Android system font scaling up to 200%. Test at maximum scale.
3. **Regulation codes always in Fira Code.** Users must be able to distinguish "1910.212" from "1910.2I2" (capital I vs. numeral 1).
4. **Bold for scannability.** Use 600/700 weight for anything a user needs to find at a glance: severity levels, violation titles, scores.

---

## Spacing & Layout

### Spacing Scale

| Token  | Value | Usage                                   |
| ------ | ----- | --------------------------------------- |
| `xs`   | 4px   | Internal component padding              |
| `sm`   | 8px   | Tight spacing between related elements  |
| `md`   | 12px  | Default element spacing                 |
| `base` | 16px  | Standard padding, gap between cards     |
| `lg`   | 20px  | Section spacing                         |
| `xl`   | 24px  | Major section breaks                    |
| `2xl`  | 32px  | Screen-level padding                    |
| `3xl`  | 48px  | Hero spacing, large gaps                |

### Touch Targets

| Element              | Minimum Size | Recommended | Notes                              |
| -------------------- | ------------ | ----------- | ---------------------------------- |
| **Primary button**   | 56px height  | 56px        | Full width on mobile               |
| **Secondary button** | 48px height  | 48px        | Paired with primary                |
| **Tab bar icon**     | 56px x 56px  | 56px        | Larger than standard 44px          |
| **Scan FAB**         | 64px x 64px  | 72px        | Center tab, elevated               |
| **List item**        | 56px height  | 64px        | Comfortable for gloved fingers     |
| **Checkbox / Radio** | 48px x 48px  | 48px        | Large hit area                     |
| **Icon button**      | 48px x 48px  | 48px        | Back, close, actions               |
| **Form input**       | 56px height  | 56px        | Comfortable text entry             |

### Layout Grid

- Screen padding: 16px horizontal
- Card padding: 16px
- Card corner radius: 12px
- Card shadow (light mode): `0 2px 8px rgba(0,0,0,0.08)`
- Card shadow (dark mode): none (use border instead: 1px solid `#3A3A3C`)
- Maximum content width: 428px (iPhone 15 Pro Max width)
- Bottom tab bar height: 83px (including safe area)

---

## Icon Library: Heroicons

### Why Heroicons

- Clean, consistent stroke width (1.5px outline, solid fill variants)
- 300+ icons covering all UI needs
- MIT licensed
- Available as React Native components via `react-native-heroicons`
- Two styles: Outline (default) and Solid (active/selected state)

### Icon Usage by Feature

| Feature Area         | Icons Used                                                          |
| -------------------- | ------------------------------------------------------------------- |
| Navigation           | home, clipboard-list, camera, document-text, ellipsis-horizontal    |
| Inspection           | clipboard-check, magnifying-glass, photo, flag, check-circle       |
| Violations           | exclamation-triangle, exclamation-circle, shield-exclamation        |
| Severity             | x-circle (critical), exclamation-circle (major), information-circle |
| Camera               | camera, video-camera, bolt (flash), squares-2x2 (grid)             |
| Reports              | document-chart-bar, document-arrow-down, printer, share            |
| Teams                | user-group, user-plus, identification                               |
| Facilities           | building-office-2, map-pin, globe-americas                         |
| Settings             | cog-6-tooth, bell, shield-check, paint-brush                       |
| Actions              | arrow-path (sync), arrow-up-tray (upload), trash, pencil-square    |
| Status               | check-circle (resolved), clock (pending), arrow-path (in-progress) |

### Icon Sizing

| Context          | Size  | Notes                          |
| ---------------- | ----- | ------------------------------ |
| Tab bar          | 28px  | With 12px label below          |
| List item icon   | 24px  | Leading icon in list rows      |
| Card action icon | 20px  | Inline action buttons          |
| Header action    | 24px  | Navigation bar buttons         |
| Badge icon       | 16px  | Inside severity badges         |
| Empty state      | 64px  | Illustration-style, centered   |

---

## Component Styling

### Violation Card

The most common component in the app. Used in inspection detail, corrective action tracker, and dashboard.

```
+----------------------------------------------------------+
|  [Severity Band - Full Width Color]                       |
|                                                           |
|  [Severity Badge]  Missing Machine Guard on Press #7      |
|                                                           |
|  [Camera Icon] 3 photos   [Clock] 2 hours ago            |
|                                                           |
|  29 CFR 1910.212(a)(1)    [User Avatar] Assigned: Maria  |
|                                                           |
|  [Status Pill: Open]      [Due: Jan 15]                   |
+----------------------------------------------------------+
```

**Styling**:
- Card background: White (light) / Dark Surface (dark)
- Top severity band: 4px height, full width, severity color
- Severity badge: Rounded pill, severity color background, white text, 13px font
- Title: H4 (Work Sans 600, 16px), Industrial Charcoal
- Metadata: Body S (Source Sans 3, 13px), Secondary Text color
- Regulation code: Fira Code 14px, Info Blue color
- Status pill: Rounded, color-coded (gray=open, blue=in-progress, green=resolved, red=overdue)
- Card padding: 16px
- Card margin-bottom: 12px
- Corner radius: 12px
- Tap feedback: Slight scale-down (0.98) + haptic

---

### Severity Badge

Inline indicator for violation severity level.

```
  [!] CRITICAL       [!] MAJOR       [i] MINOR       [i] OBSERVATION
  (Red bg/white)     (Orange/white)  (Yellow/dark)   (Blue/white)
```

**Styling**:
- Shape: Rounded rectangle (border-radius: 6px)
- Padding: 4px 10px
- Font: Source Sans 3, 12px, 600 weight, uppercase
- Icon: 12px, left-aligned before text
- Colors:
  - Critical: `#FF3B30` background, `#FFFFFF` text
  - Major: `#FF9500` background, `#FFFFFF` text
  - Minor: `#FFC107` background, `#2D3436` text (dark text for readability on yellow)
  - Observation: `#007AFF` background, `#FFFFFF` text

---

### Compliance Score Meter

Circular gauge showing 0-100 compliance score. Used on dashboard and reports.

```
        ___________
      /     87%     \
     |   COMPLIANT   |
      \_____________/
```

**Styling**:
- Size: 120px diameter (dashboard), 80px (facility card), 200px (report cover)
- Ring thickness: 8px (dashboard), 6px (card), 12px (report)
- Ring color gradient based on score:
  - 0-39: `#FF3B30` (red)
  - 40-59: `#FF9500` (orange)
  - 60-79: `#FFC107` (yellow)
  - 80-100: `#34C759` (green)
- Background ring: `#E5E5EA` (light) / `#3A3A3C` (dark)
- Center text: Display font (Work Sans 700, 34px for dashboard size)
- Label below score: "COMPLIANT" / "NEEDS ATTENTION" / "AT RISK" / "CRITICAL"
- Animation: Score fills from 0 to final value over 1 second on mount (ease-out)

---

### Camera Scanner Overlay

AR overlay elements shown during live camera scanning.

**Bounding Boxes**:
- Border: 3px solid, severity color
- Corner markers: Thicker (5px) L-shaped corners at each corner of the box (like a camera viewfinder)
- Background: Severity color at 15% opacity fill
- Label: Rounded tag attached to top-left corner of box
  - Font: Source Sans 3, 12px, 600 weight, white text
  - Background: Severity color, solid
  - Padding: 2px 8px
  - Corner radius: 4px
- Animation: Boxes pulse gently (opacity 80%-100% over 1.5s cycle) for newly detected hazards

**Detection Summary Strip**:
- Position: Above capture button, full width
- Background: Semi-transparent black (rgba(0,0,0,0.7))
- Content: Horizontal scroll of severity chips
- Each chip: [Icon] [Count] with severity color
- Height: 44px

**Capture Button**:
- Size: 72px diameter
- Outer ring: 72px, 4px white border
- Inner circle: 60px, solid white (at rest)
- Capture animation: Inner circle shrinks to 52px for 150ms, then snaps back
- Disabled state: Gray, 50% opacity

---

### Status Pill

Inline status indicator used throughout the app for violations, corrective actions, and inspections.

| Status       | Background    | Text Color  | Icon            |
| ------------ | ------------- | ----------- | --------------- |
| Open         | `#E5E5EA`     | `#8E8E93`   | Circle outline  |
| In Progress  | `#007AFF20`   | `#007AFF`   | Arrow path      |
| Completed    | `#34C75920`   | `#34C759`   | Check circle    |
| Overdue      | `#FF3B3020`   | `#FF3B30`   | Exclamation     |
| Resolved     | `#34C75920`   | `#34C759`   | Shield check    |
| Draft        | `#8E8E9320`   | `#8E8E93`   | Pencil          |
| Syncing      | `#FFC10720`   | `#FFC107`   | Arrow path anim |

**Styling**:
- Shape: Rounded pill (border-radius: 999px)
- Padding: 4px 12px
- Font: Source Sans 3, 12px, 600 weight
- Icon: 14px, left of text, 4px gap

---

### Offline Banner

Persistent banner shown when device has no connectivity.

```
+----------------------------------------------------------+
|  [Wifi-Off Icon]  Offline mode -- data will sync later   |
+----------------------------------------------------------+
```

**Styling**:
- Position: Fixed at top of screen, below status bar
- Background: `#FF9500` (Caution Orange)
- Text: White, Source Sans 3, 14px, 600 weight
- Icon: Wifi-off, 18px, white
- Height: 36px
- Animation: Slides down from top on connectivity loss, slides up on reconnection
- Tap action: Shows sync queue details in bottom sheet

---

### Sync Status Bar

Shows data synchronization state, always visible on dashboard.

| State         | Icon           | Color      | Text                          |
| ------------- | -------------- | ---------- | ----------------------------- |
| All synced    | Check circle   | Green      | "All data synced"             |
| Syncing       | Arrow path     | Yellow     | "Syncing 3 items..."          |
| Pending       | Clock          | Amber      | "5 items waiting to sync"     |
| Error         | X circle       | Red        | "Sync failed. Tap to retry."  |

---

## Motion & Animation

### Principles

1. **Purposeful, not decorative.** Every animation communicates state change or provides feedback.
2. **Respect system settings.** If "Reduce Motion" is enabled, replace animations with instant transitions.
3. **Fast.** Maximum animation duration: 300ms for transitions, 150ms for feedback.
4. **Factory-appropriate.** No bouncy, playful animations. Smooth, professional, industrial feel.

### Animation Specifications

| Animation                      | Duration | Easing          | Trigger                       |
| ------------------------------ | -------- | --------------- | ----------------------------- |
| Screen transition (push)       | 250ms    | ease-out        | Navigation push               |
| Screen transition (pop)        | 200ms    | ease-in         | Navigation back               |
| Card press feedback            | 100ms    | ease-out        | Touch down on card             |
| Severity badge appear          | 200ms    | spring(300,20)  | New violation detected         |
| Compliance score fill          | 1000ms   | ease-out        | Score meter mount              |
| Bottom sheet open              | 300ms    | ease-out        | Filter/option sheet trigger    |
| Bottom sheet close             | 200ms    | ease-in         | Sheet dismiss                  |
| Toast notification             | 200ms in, 150ms out | ease  | Success/error feedback         |
| Hazard bounding box pulse      | 1500ms   | ease-in-out     | Continuous loop during scan    |
| Capture button press           | 150ms    | ease-out        | Photo capture                  |
| Offline banner slide           | 250ms    | ease-out        | Connectivity change            |
| List item swipe action reveal  | 200ms    | ease-out        | Swipe gesture                  |

### Haptic Feedback

| Event                          | Haptic Type                        |
| ------------------------------ | ---------------------------------- |
| Photo captured                 | Medium impact                      |
| Critical violation detected    | Heavy impact (double pulse)        |
| Major violation detected       | Medium impact                      |
| Minor violation detected       | Light impact                       |
| Button press                   | Selection tap                      |
| Swipe action complete          | Success notification               |
| Error (sync fail, invalid)     | Error notification                 |
| Pull-to-refresh trigger        | Light impact                       |
| Tab switch                     | Selection tap                      |

---

## NativeWind Configuration

### tailwind.config.js

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        safety: {
          yellow: '#FFC107',
          'yellow-light': '#FFF3CD',
          'yellow-dark': '#E5AC00',
        },
        industrial: {
          charcoal: '#2D3436',
          'charcoal-light': '#636E72',
        },
        severity: {
          critical: '#FF3B30',
          'critical-bg': '#FF3B3020',
          major: '#FF9500',
          'major-bg': '#FF950020',
          minor: '#FFC107',
          'minor-bg': '#FFC10720',
          observation: '#007AFF',
          'observation-bg': '#007AFF20',
        },
        compliant: {
          green: '#34C759',
          'green-bg': '#34C75920',
        },
        surface: {
          light: '#F2F2F7',
          dark: '#1C1C1E',
          'card-dark': '#2C2C2E',
        },
        border: {
          light: '#E5E5EA',
          dark: '#3A3A3C',
        },
        text: {
          secondary: '#8E8E93',
        },
      },
      fontFamily: {
        heading: ['WorkSans-Bold', 'Work Sans'],
        'heading-semibold': ['WorkSans-SemiBold', 'Work Sans'],
        body: ['SourceSans3-Regular', 'Source Sans 3'],
        'body-semibold': ['SourceSans3-SemiBold', 'Source Sans 3'],
        code: ['FiraCode-Regular', 'Fira Code'],
      },
      fontSize: {
        'display': ['34px', { lineHeight: '41px' }],
        'h1': ['28px', { lineHeight: '34px' }],
        'h2': ['22px', { lineHeight: '28px' }],
        'h3': ['18px', { lineHeight: '24px' }],
        'h4': ['16px', { lineHeight: '22px' }],
        'body-l': ['17px', { lineHeight: '24px' }],
        'body-m': ['15px', { lineHeight: '22px' }],
        'body-s': ['13px', { lineHeight: '18px' }],
        'label': ['15px', { lineHeight: '20px' }],
        'code': ['14px', { lineHeight: '20px' }],
        'code-l': ['16px', { lineHeight: '22px' }],
      },
      spacing: {
        'touch-min': '56px',
        'touch-fab': '72px',
        'tab-bar': '83px',
      },
      borderRadius: {
        'card': '12px',
        'badge': '6px',
        'pill': '999px',
      },
    },
  },
  plugins: [],
};
```

---

## Design System Checklist

Before shipping any screen, verify:

- [ ] All touch targets >= 56px
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Severity colors used correctly (red=critical, orange=major, yellow=minor, green=compliant)
- [ ] Color is never the only indicator (icon or text accompanies every colored element)
- [ ] Works in light mode, dark mode, and high-contrast mode
- [ ] Readable at 200% font scaling
- [ ] One-handed operation tested (all primary actions in thumb zone)
- [ ] Offline state has clear visual indicator
- [ ] Loading state uses skeleton placeholders (no spinners blocking content)
- [ ] Empty state has illustration + message + CTA
- [ ] Haptic feedback implemented for primary interactions
- [ ] Reduce motion setting respected (no animation when system setting is on)
- [ ] Screen reader labels on all interactive elements
- [ ] Fira Code used for all regulation codes and IDs
