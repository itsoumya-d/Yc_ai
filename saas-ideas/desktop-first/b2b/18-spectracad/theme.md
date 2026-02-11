# SpectraCAD --- Design System & Theme

---

## Brand Personality

SpectraCAD's visual identity reflects its dual nature: the precision of engineering and the approachability of modern software. The design language communicates **technical sophistication** without intimidation, **engineering precision** without sterility, and **innovative intelligence** without gimmickry.

### Brand Attributes

| Attribute            | Expression                                                  |
| -------------------- | ----------------------------------------------------------- |
| **Precise**          | Grid-aligned layouts, exact measurements, clean lines       |
| **Innovative**       | AI-native features presented naturally, not as novelty      |
| **Professional**     | Dark workspace befitting serious engineering tools          |
| **Approachable**     | Clear labels, helpful tooltips, guided workflows            |
| **Trustworthy**      | Consistent behavior, reliable outputs, no surprises         |
| **Efficient**        | Dense information display, keyboard-first, minimal clicks   |

---

## Color System

### Primary Palette

The color system is rooted in the physical world of PCB design: circuit board greens, copper traces, solder mask, and silkscreen white. These domain-authentic colors create instant familiarity for engineers while establishing a unique brand identity.

| Role                  | Color Name        | Hex       | RGB              | Usage                                    |
| --------------------- | ----------------- | --------- | ---------------- | ---------------------------------------- |
| **Primary**           | Circuit Green     | `#00C853` | 0, 200, 83       | Primary actions, active states, success  |
| **Accent**            | Signal Blue       | `#2979FF` | 41, 121, 255     | Links, secondary actions, information    |
| **Tertiary**          | Copper Trace      | `#D4A843` | 212, 168, 67     | Highlights, premium features, emphasis   |
| **Substrate**         | PCB Tan           | `#C8A96E` | 200, 169, 110    | Subtle accents, board preview background |

### Dark Workspace Colors

Dark mode is the default --- this is an EDA convention. Engineers spend hours in these tools; dark backgrounds reduce eye strain and make colored traces and components stand out.

| Role                  | Color Name        | Hex       | RGB              | Usage                                    |
| --------------------- | ----------------- | --------- | ---------------- | ---------------------------------------- |
| **Background**        | Dark Workspace    | `#0D1117` | 13, 17, 23       | App background, canvas background        |
| **Surface**           | Surface           | `#161B22` | 22, 27, 34       | Panels, cards, dialogs, sidebars         |
| **Surface Elevated**  | Elevated Surface  | `#1C2128` | 28, 33, 40       | Dropdown menus, popovers, tooltips       |
| **Surface Hover**     | Hover Surface     | `#21262D` | 33, 38, 45       | Hover states on surface elements         |
| **Border**            | Border Default    | `#30363D` | 48, 54, 61       | Panel borders, dividers, card outlines   |
| **Border Emphasis**   | Border Strong     | `#484F58` | 72, 79, 88       | Active borders, focus rings              |

### Text Colors

| Role                  | Color Name        | Hex       | RGB              | Usage                                    |
| --------------------- | ----------------- | --------- | ---------------- | ---------------------------------------- |
| **Primary Text**      | Silkscreen White  | `#E8E8E8` | 232, 232, 232    | Headings, primary labels, component values|
| **Secondary Text**    | Text Muted        | `#8B949E` | 139, 148, 158    | Secondary labels, descriptions, hints    |
| **Tertiary Text**     | Text Subtle       | `#6E7681` | 110, 118, 129    | Disabled states, timestamps, metadata    |
| **Inverse Text**      | Text Dark         | `#0D1117` | 13, 17, 23       | Text on light/colored backgrounds        |

### Semantic Colors

| Role                  | Color Name        | Hex       | Usage                                    |
| --------------------- | ----------------- | --------- | ---------------------------------------- |
| **Success**           | DRC Pass Green    | `#2EA043` | Passed DRC checks, successful operations |
| **Warning**           | Warning Amber     | `#D29922` | DRC warnings, low stock, attention needed|
| **Error**             | Error Red         | `#F85149` | DRC errors, failed operations, critical  |
| **Info**              | Info Blue         | `#58A6FF` | Informational messages, tips, guidance   |

### PCB Layer Colors

These colors are used in both the schematic/PCB editors and the layer manager. They follow industry conventions while being distinguishable for colorblind users.

| Layer                 | Color Name        | Hex       | Usage                                    |
| --------------------- | ----------------- | --------- | ---------------------------------------- |
| **Top Copper (F.Cu)** | Layer Red         | `#EF4444` | Front copper layer traces and pads       |
| **Bottom Copper (B.Cu)**| Layer Blue      | `#3B82F6` | Back copper layer traces and pads        |
| **Inner 1 (In1.Cu)** | Layer Violet      | `#A855F7` | Inner copper layer 1 (4+ layer boards)   |
| **Inner 2 (In2.Cu)** | Layer Teal        | `#14B8A6` | Inner copper layer 2 (4+ layer boards)   |
| **Silkscreen (F.Silk)**| Silkscreen White| `#FFFFFF` | Component outlines, reference designators|
| **Solder Mask (F.Mask)**| Solder Mask Green| `#22C55E`| Solder mask openings                     |
| **Board Outline**     | Outline Yellow    | `#F59E0B` | Board edge, cutouts, slots               |
| **Drill**             | Drill Cyan        | `#06B6D4` | Through-hole and via drill markers       |
| **Courtyard**         | Courtyard Pink    | `#EC4899` | Component courtyard boundaries           |
| **Fabrication**       | Fab Gray          | `#9CA3AF` | Fabrication layer markings               |

### Light Mode (Optional)

While dark mode is default, a light mode is available for users who prefer it (e.g., printing, presentations, well-lit environments).

| Role                  | Hex (Light)  | Notes                                     |
| --------------------- | ------------ | ----------------------------------------- |
| Background            | `#FFFFFF`    | Pure white canvas                         |
| Surface               | `#F6F8FA`    | Light gray panels                         |
| Surface Elevated      | `#FFFFFF`    | White dropdowns with shadow               |
| Border                | `#D0D7DE`    | Light gray borders                        |
| Primary Text          | `#1F2328`    | Near-black text                           |
| Secondary Text        | `#656D76`    | Medium gray                               |

---

## Typography

### Font Stack

| Role                  | Font Family       | Weight     | Usage                                    |
| --------------------- | ----------------- | ---------- | ---------------------------------------- |
| **Headings**          | IBM Plex Sans     | 600 (Semi) | Panel titles, dialog headers, section heads |
| **UI Text**           | Inter             | 400, 500   | Labels, buttons, menus, body text        |
| **Monospace**         | IBM Plex Mono     | 400, 500   | Component values, pin numbers, coordinates, code |

### Why These Fonts

- **IBM Plex Sans:** Engineering heritage (IBM), excellent readability, professional weight. Communicates technical competence without being cold.
- **Inter:** The standard for UI text. Optimized for screen readability at small sizes, extensive language support, open source.
- **IBM Plex Mono:** Consistent character width is essential for displaying pin numbers (Pin 1, Pin 12), component values (10K, 100nF), and coordinates (23.4mm, 15.7mm). Pairs perfectly with IBM Plex Sans.

### Type Scale

| Level    | Size   | Line Height | Weight     | Font            | Usage                         |
| -------- | ------ | ----------- | ---------- | --------------- | ----------------------------- |
| **H1**   | 24px   | 32px        | 600        | IBM Plex Sans   | Page titles (rare)            |
| **H2**   | 20px   | 28px        | 600        | IBM Plex Sans   | Panel titles                  |
| **H3**   | 16px   | 24px        | 600        | IBM Plex Sans   | Section headers               |
| **H4**   | 14px   | 20px        | 600        | IBM Plex Sans   | Sub-section headers           |
| **Body** | 14px   | 20px        | 400        | Inter           | General UI text               |
| **Small**| 12px   | 16px        | 400        | Inter           | Secondary labels, metadata    |
| **Tiny** | 11px   | 14px        | 400        | Inter           | Status bar, coordinates       |
| **Mono** | 13px   | 18px        | 400        | IBM Plex Mono   | Component values, pin numbers |
| **Mono-S**| 11px  | 14px        | 400        | IBM Plex Mono   | Grid coordinates, rulers      |

### Typography Rules

- Maximum line length: 80 characters for readability in panels
- No all-caps except for acronyms (DRC, BOM, PCB, IC)
- Reference designators always in monospace (R1, C5, U3)
- Component values always in monospace with standard notation (10K, 100nF, 4.7uH)
- Coordinates always in monospace with unit suffix (23.4mm, 15.70mm)

---

## Spacing & Layout

### Grid System

The UI uses an 8px base grid for consistent spacing across all elements.

| Token         | Value  | Usage                                              |
| ------------- | ------ | -------------------------------------------------- |
| `space-0`     | 0px    | No spacing                                         |
| `space-1`     | 4px    | Tight spacing (between icon and label)             |
| `space-2`     | 8px    | Default element spacing                            |
| `space-3`     | 12px   | Between related items                              |
| `space-4`     | 16px   | Section padding, card padding                      |
| `space-5`     | 20px   | Between sections                                   |
| `space-6`     | 24px   | Panel padding                                      |
| `space-7`     | 32px   | Large section gaps                                 |
| `space-8`     | 40px   | Page-level spacing                                 |
| `space-9`     | 48px   | Major section dividers                             |

### Panel Layout

| Element              | Width          | Notes                                     |
| -------------------- | -------------- | ----------------------------------------- |
| Left sidebar         | 240px (fixed)  | Component palette, layer manager          |
| Right panel          | 280px (fixed)  | Properties, AI assistant, DRC             |
| Both sidebars        | Collapsible    | Toggle with keyboard shortcuts            |
| Canvas               | Remaining      | Fills available space, min 600px          |
| Status bar           | 100% x 28px    | Fixed bottom, full width                  |
| Menu bar             | 100% x 32px    | Fixed top, native menu on macOS           |
| Toolbar              | 100% x 40px    | Below menu bar, tool icons                |

### CAD Canvas Specifics

| Element              | Value          | Notes                                     |
| -------------------- | -------------- | ----------------------------------------- |
| Grid line color      | `#1C2128` (subtle) | Barely visible, non-distracting       |
| Grid dot color       | `#30363D`      | Dot grid option (less visual noise)       |
| Grid spacing display | Top-left overlay| "Grid: 0.5mm" in monospace               |
| Origin marker        | `#F59E0B` crosshair | Visible at all zoom levels           |
| Cursor crosshair     | `#E8E8E8` thin | Extends to canvas edges when routing      |
| Snap indicator       | `#00C853` dot  | Appears on valid snap points              |
| Measurement overlay  | `#D4A843` text | Distance labels near cursor during move   |
| Selection box        | `#2979FF` dashed| Dashed blue rectangle during area select |
| Selection highlight  | `#2979FF` at 30%| Semi-transparent fill on selected items  |

---

## Border Radius

| Token          | Value  | Usage                                              |
| -------------- | ------ | -------------------------------------------------- |
| `radius-none`  | 0px    | Toolbar buttons (block style for tool groups)      |
| `radius-sm`    | 4px    | Input fields, small buttons                        |
| `radius-md`    | 6px    | Cards, panels, dialogs                             |
| `radius-lg`    | 8px    | Large cards, modals                                |
| `radius-xl`    | 12px   | Floating panels, toast notifications               |
| `radius-full`  | 9999px | Avatar circles, pill badges                        |

---

## Shadows & Elevation

Dark mode uses subtle border emphasis rather than drop shadows for elevation hierarchy.

| Level          | Style                                    | Usage                          |
| -------------- | ---------------------------------------- | ------------------------------ |
| **Level 0**    | No shadow, no border                     | Flat surfaces                  |
| **Level 1**    | 1px border `#30363D`                     | Cards, panels                  |
| **Level 2**    | 1px border `#484F58` + subtle shadow     | Dropdown menus, tooltips       |
| **Level 3**    | 2px border `#484F58` + medium shadow     | Modals, dialogs                |
| **Shadow-sm**  | `0 1px 2px rgba(0,0,0,0.3)`             | Subtle floating                |
| **Shadow-md**  | `0 4px 12px rgba(0,0,0,0.4)`            | Dropdowns                      |
| **Shadow-lg**  | `0 8px 24px rgba(0,0,0,0.5)`            | Modals                         |

---

## Icon Library

### Primary: Tabler Icons

Tabler Icons is the primary icon library. It provides 4,000+ icons with consistent 24x24 stroke-based design, MIT licensed.

**Why Tabler Icons:**
- Stroke-based icons match the technical, line-drawing aesthetic of EDA tools
- Comprehensive set covering all UI needs (navigation, actions, status indicators)
- Consistent 1.5px stroke weight at 24x24 default size
- SVG format for clean scaling
- MIT license for commercial use

### Icon Sizing

| Size    | Pixels | Usage                                               |
| ------- | ------ | --------------------------------------------------- |
| **xs**  | 14px   | Inline with small text, status indicators           |
| **sm**  | 16px   | Inline with body text, menu items                   |
| **md**  | 20px   | Toolbar buttons, panel headers                      |
| **lg**  | 24px   | Primary toolbar (default Tabler size)               |
| **xl**  | 32px   | Welcome screen cards, empty states                  |
| **2xl** | 48px   | Onboarding illustrations                            |

### Custom EDA Icons

Some EDA-specific icons are not available in Tabler and must be custom-designed:

| Icon                  | Description                                           |
| --------------------- | ----------------------------------------------------- |
| Wire tool             | Horizontal line with dots at endpoints                |
| Bus tool              | Three parallel lines with dots                        |
| Via                   | Concentric circles (inner filled, outer ring)         |
| Copper fill           | Hatched rectangle                                     |
| Component symbol      | Simple resistor or IC outline                         |
| Trace route           | Right-angle path with arrow                           |
| Layer stack           | Stacked horizontal lines with colors                  |
| DRC check             | Shield with checkmark                                 |
| Gerber file           | Document with layer lines                             |
| PCB board             | Rectangle with trace patterns                         |
| Net label             | Diamond with letter                                   |
| Ratsnest              | Thin dashed line with endpoints                       |

---

## Component Styling

### Component Card (Library / BOM)

```
+--------------------------------------------------+
|  [Resistor Icon]  10K Ohm Resistor         [Star]|
|  MPN: RC0402JR-0710KL                            |
|  Package: 0402 | Yageo | $0.01                   |
|  [In Stock: 500,000+]                            |
|  [Add to Schematic]              [View Datasheet] |
+--------------------------------------------------+

Styling:
- Background: Surface (#161B22)
- Border: 1px solid Border (#30363D)
- Border-radius: 6px
- Padding: 16px
- Hover: border changes to Border Strong (#484F58)
- Star icon: Copper Trace (#D4A843) when favorited
- Stock badge: green/amber/red based on availability
- Add button: Primary (Circuit Green #00C853)
- Datasheet button: Ghost (transparent bg, blue text)
```

### Trace Highlight (PCB Editor)

```
Styling:
- Default trace: Layer color at 100% opacity, width per design rules
- Hover trace: Layer color at 100% + 2px glow effect
- Selected trace: Bright white outline (#FFFFFF) around trace
- Active routing: Layer color with animated dash pattern
- DRC violation trace: Red (#F85149) overlay with pulsing animation
```

### DRC Violation Marker

```
Styling:
- Error marker: Filled circle (#F85149) with white "X" icon
- Warning marker: Filled triangle (#D29922) with white "!" icon
- Info marker: Filled circle (#58A6FF) with white "i" icon
- Size: 16px diameter at 100% zoom, scales with zoom level
- Position: Centered on violation location
- Hover: Tooltip with violation description
- Click: Zoom to violation, open DRC panel detail
- Animation: Gentle pulse (scale 1.0 to 1.15) every 2 seconds
```

### Layer Toggle (Layer Manager)

```
+-----------------------------------------------+
|  [x] [==] F.Cu (Top Copper)          [Opacity] |
|  [x] [==] B.Cu (Bottom Copper)       [Opacity] |
|  [x] [==] F.Silkscreen              [Opacity] |
|  [ ] [==] B.Silkscreen              [Opacity] |
|  [x] [==] F.Solder Mask             [Opacity] |
|  [x] [==] Edge Cuts                 [Opacity] |
+-----------------------------------------------+

Styling:
- Checkbox: Custom styled, uses layer color as fill when checked
- Color swatch [==]: 16x16px square filled with layer color
- Layer name: Body text (Inter 14px)
- Opacity slider: Appears on hover, range 0-100%
- Active layer: Bold text + left accent border (4px, layer color)
- Inactive (unchecked) layer: Muted text (#6E7681)
- Row height: 32px
- Hover: Background changes to Hover Surface (#21262D)
```

### BOM Row

```
+--------+------------------+-------+---------+-----+--------+--------+---------+
| Ref    | Component        | Value | Package | Qty | Unit$  | Ext$   | Stock   |
+--------+------------------+-------+---------+-----+--------+--------+---------+
| U1     | ATmega328P-AU    |       | TQFP-32 | 1   | $2.45  | $2.45  | 15,234  |
+--------+------------------+-------+---------+-----+--------+--------+---------+

Styling:
- Background: Surface (#161B22)
- Alternate row: Elevated Surface (#1C2128)
- Header row: Bold, uppercase, Border bottom 2px
- Reference: Monospace (IBM Plex Mono), Circuit Green (#00C853)
- Value column: Monospace
- Price columns: Right-aligned, Monospace
- Stock badge: Green pill (>1000), Amber pill (100-1000), Red pill (<100)
- Row hover: Background Hover Surface (#21262D)
- Selected row: Left border 3px Circuit Green
- Sortable headers: Arrow icon on hover, solid on active sort
```

---

## Animation & Motion

### Principles

- **Purposeful:** Animations convey state changes, not decoration
- **Fast:** 150--200ms for micro-interactions, 300ms for panel transitions
- **Non-blocking:** Never prevent user from working while animation plays
- **Reducible:** Respect `prefers-reduced-motion` --- skip all non-essential animation

### Motion Tokens

| Token              | Duration | Easing                    | Usage                           |
| ------------------ | -------- | ------------------------- | ------------------------------- |
| `motion-instant`   | 0ms      | ---                       | State toggles (checkbox, layer) |
| `motion-fast`      | 100ms    | ease-out                  | Hover states, tooltips          |
| `motion-normal`    | 200ms    | ease-in-out               | Panel expand/collapse           |
| `motion-slow`      | 300ms    | ease-in-out               | Modal open/close, page transition|
| `motion-emphasis`  | 500ms    | spring(1, 0.85, 0.25)     | Celebration (DRC all-pass)      |

### Specific Animations

| Animation                  | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| Panel slide                | Sidebar panels slide from edge, 200ms ease-in-out   |
| Component drop             | Subtle scale-in (0.95 to 1.0) when placed on canvas |
| DRC violation pulse        | Scale 1.0 to 1.15, opacity 1.0 to 0.7, repeating   |
| Auto-route progress        | Traces appear sequentially as they are routed        |
| Wire drawing               | Rubber-band line follows cursor in real time         |
| Zoom                       | Smooth interpolation between zoom levels, 150ms     |
| Toast notification         | Slide up from bottom-right, auto-dismiss after 4s   |
| AI thinking                | Three-dot pulse animation in chat panel              |
| Layer fade                 | Opacity transition when toggling layers, 150ms       |

---

## Responsive Behavior (Desktop)

As a desktop app, SpectraCAD does not need mobile responsiveness but must handle varying window sizes.

| Window Width     | Behavior                                               |
| ---------------- | ------------------------------------------------------ |
| < 1024px         | Single sidebar mode; second sidebar becomes floating   |
| 1024--1440px     | Default layout; both sidebars visible                  |
| 1440--1920px     | Wider canvas area; sidebars at fixed width             |
| > 1920px         | Canvas expands; optional wider panels                  |
| Full screen       | Hide title bar (macOS); maximize canvas area          |

### Minimum Window Size

- **Width:** 900px (below this, layout breaks are unacceptable)
- **Height:** 600px (below this, toolbars overlap canvas)

---

## Dark Mode Implementation

Dark mode is default. The entire color system is designed dark-first.

```css
/* CSS custom properties approach */
:root {
  --bg-primary: #0D1117;
  --bg-surface: #161B22;
  --bg-elevated: #1C2128;
  --bg-hover: #21262D;
  --border-default: #30363D;
  --border-strong: #484F58;
  --text-primary: #E8E8E8;
  --text-secondary: #8B949E;
  --text-subtle: #6E7681;
  --accent-primary: #00C853;
  --accent-secondary: #2979FF;
  --accent-tertiary: #D4A843;
  --semantic-success: #2EA043;
  --semantic-warning: #D29922;
  --semantic-error: #F85149;
  --semantic-info: #58A6FF;
}

[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-surface: #F6F8FA;
  --bg-elevated: #FFFFFF;
  --bg-hover: #F3F4F6;
  --border-default: #D0D7DE;
  --border-strong: #AFB8C1;
  --text-primary: #1F2328;
  --text-secondary: #656D76;
  --text-subtle: #8B949E;
  /* Accent colors remain the same */
}
```

---

## Accessibility Checklist

| Requirement                      | Implementation                                       |
| -------------------------------- | ---------------------------------------------------- |
| Contrast ratio (text)            | 4.5:1 minimum (all text passes against backgrounds)  |
| Contrast ratio (UI components)   | 3:1 minimum for borders, icons, interactive elements |
| Focus indicators                 | 2px solid `#2979FF` outline, 2px offset              |
| Keyboard navigation              | Tab order follows visual order; Esc cancels any mode |
| Screen reader support            | ARIA labels on all icon buttons and canvas elements  |
| Color not sole indicator         | All status uses icon + color (checkmark + green, X + red) |
| Reduced motion                   | `@media (prefers-reduced-motion: reduce)` disables animations |
| High contrast mode               | Windows high contrast support; increased border weights |
| Font scaling                     | UI adapts to system font size preferences             |
| Colorblind safety                | Layer colors chosen from colorblind-safe palette; pattern fills available |

---

*The theme is the product's first impression and constant companion. Every pixel should make the engineer feel like they are using a serious, capable, trustworthy tool --- the kind of tool they would recommend to a colleague.*
