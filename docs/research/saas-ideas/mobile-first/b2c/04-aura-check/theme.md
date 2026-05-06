# Theme

## Brand Personality: "Clinical Calm"

Aura Check occupies a precise emotional space: the confidence of a modern wellness clinic, not the sterility of a hospital and not the frivolity of a beauty app. Every design decision reinforces this positioning.

### What Clinical Calm Means

| Attribute | What It Is | What It Is Not |
|-----------|-----------|---------------|
| **Trustworthy** | Clean, professional, evidence-based | Sterile, cold, intimidating |
| **Calming** | Reassuring, gentle, warm | Dismissive, casual, unserious |
| **Modern** | Contemporary wellness aesthetic | Trendy, flashy, ephemeral |
| **Approachable** | Friendly, inviting, human | Clinical jargon, robotic, impersonal |
| **Empowering** | Gives users control and knowledge | Paternalistic, prescriptive, alarming |

### Voice and Tone

- **Green findings**: Celebratory and reassuring. "Everything looks good. Keep up your routine."
- **Yellow findings**: Gentle and informative. "This is worth keeping an eye on. Check again in two weeks."
- **Red findings**: Calm and clear. "We recommend having a dermatologist take a look at this. Here is how to get an appointment."
- **Never**: Alarming, frightening, or using urgency to manipulate. Even red findings are communicated with calm authority, not panic.

---

## Color System

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Wellness Teal** | `#0D9488` | rgb(13, 148, 136) | Primary brand color. CTAs, active states, navigation highlights, headers, progress indicators. The signature color that users associate with Aura Check. |
| **Wellness Teal Dark** | `#0F766E` | rgb(15, 118, 110) | Pressed/active states for teal elements, hover states, text on light backgrounds when teal is used as text color. |
| **Wellness Teal Light** | `#5EEAD4` | rgb(94, 234, 212) | Subtle highlights, active tab indicators on dark backgrounds, chart accents. |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Soft Lavender** | `#A78BFA` | rgb(167, 139, 250) | Secondary accent. Health data visualizations (sleep line on charts), onboarding illustrations, premium feature indicators, streak celebrations at 30 days. |
| **Soft Lavender Light** | `#C4B5FD` | rgb(196, 181, 253) | Lavender-tinted backgrounds for health insight cards, subtle secondary highlights. |
| **Soft Lavender Dark** | `#7C3AED` | rgb(124, 58, 237) | Text or icons on lavender backgrounds when contrast is needed. |

### Accent Color

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Coral Pink** | `#F472B6` | rgb(244, 114, 182) | Accent for skin severity line on correlation charts, referral CTAs, notification badges, streak celebrations at 100 days. Used sparingly to draw attention. |
| **Coral Pink Light** | `#F9A8D4` | rgb(249, 168, 212) | Subtle backgrounds for urgent referral cards, chart area fills. |
| **Coral Pink Dark** | `#EC4899` | rgb(236, 72, 153) | Pressed states for coral elements. |

### Background Colors

| Name | Hex | Mode | Usage |
|------|-----|------|-------|
| **Pure White** | `#FFFFFF` | Light | Primary background for all screens in light mode. |
| **Charcoal Blue** | `#111827` | Dark | Primary background for all screens in dark mode. Deep blue-black, not pure black (OLED flicker avoidance, softer appearance). |

### Surface Colors

| Name | Hex | Mode | Usage |
|------|-----|------|-------|
| **Teal Tint** | `#F0FDFA` | Light | Cards, input fields, elevated surfaces in light mode. Provides a subtle teal warmth without being overwhelming. |
| **Dark Surface** | `#1F2937` | Dark | Cards, input fields, elevated surfaces in dark mode. Distinguishes surfaces from the background. |
| **Dark Surface Elevated** | `#374151` | Dark | Modals, popovers, elevated cards in dark mode. Third level of elevation. |

### Severity Colors

| Severity | Hex | RGB | Usage |
|----------|-----|-----|-------|
| **Green (All Clear)** | `#10B981` | rgb(16, 185, 129) | All-clear banners, green severity badges, stable change indicators, positive health trends. |
| **Green Light** | `#D1FAE5` | Light mode badge backgrounds. |
| **Green Dark** | `#065F46` | Dark mode badge text on green backgrounds. |
| **Yellow (Monitor)** | `#F59E0B` | rgb(245, 158, 11) | Monitor severity badges, attention-needed indicators, moderate change indicators. |
| **Yellow Light** | `#FEF3C7` | Light mode badge backgrounds. |
| **Yellow Dark** | `#92400E` | Dark mode badge text on yellow backgrounds. |
| **Red (Concerning)** | `#EF4444` | rgb(239, 68, 68) | Concerning severity badges, urgent change indicators, referral CTAs. |
| **Red Light** | `#FEE2E2` | Light mode badge backgrounds. |
| **Red Dark** | `#991B1B` | Dark mode badge text on red backgrounds. |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Text Primary** | `#111827` (light) / `#F9FAFB` (dark) | Main body text, headings |
| **Text Secondary** | `#6B7280` (light) / `#9CA3AF` (dark) | Subtext, captions, timestamps |
| **Text Tertiary** | `#9CA3AF` (light) / `#6B7280` (dark) | Placeholders, disabled text |
| **Border** | `#E5E7EB` (light) / `#374151` (dark) | Card borders, dividers, input borders |
| **Border Focus** | `#0D9488` | Focused input borders (teal) |

### Color Application Rules

1. **Severity colors are never used decoratively.** Green, yellow, and red are reserved exclusively for health severity communication. Using them decoratively dilutes their meaning.
2. **Teal is the action color.** Buttons, links, active states, and progress indicators use Wellness Teal. It means "tap here" or "active."
3. **Lavender is the insight color.** Health data, correlations, and AI insights use Soft Lavender. It means "here is something to learn."
4. **Coral is the attention color.** Referral CTAs, notification badges, and the skin severity line on charts use Coral Pink. It means "notice this."
5. **Backgrounds stay neutral.** White/charcoal backgrounds let content breathe. Tinted surfaces (Teal Tint) are used only for cards and elevated elements.

---

## Typography

### Font Stack

| Role | Font | Weight | Why |
|------|------|--------|-----|
| **Headings** | DM Sans | Bold (700), SemiBold (600) | Geometric sans-serif with a warm, modern feel. Professional without being cold. Excellent legibility at display sizes. |
| **Body** | Inter | Regular (400), Medium (500), SemiBold (600) | Highly legible variable font optimized for screen reading. Excellent at small sizes for medical descriptions and disclaimers. |
| **Monospace** (data values) | JetBrains Mono | Regular (400) | Used exclusively for numerical data in charts and measurements (e.g., "3.2mm," "7.5 hrs"). |

### Type Scale

| Name | Size | Line Height | Weight | Font | Usage |
|------|------|-------------|--------|------|-------|
| **Display** | 32px | 40px | DM Sans Bold | Headings | Welcome screen, major section titles |
| **H1** | 28px | 36px | DM Sans Bold | Headings | Screen titles |
| **H2** | 24px | 32px | DM Sans SemiBold | Headings | Section headers |
| **H3** | 20px | 28px | DM Sans SemiBold | Headings | Card titles, subsection headers |
| **H4** | 18px | 24px | Inter SemiBold | Body | Finding titles, list headers |
| **Body Large** | 17px | 26px | Inter Regular | Body | Descriptions, analysis text |
| **Body** | 15px | 22px | Inter Regular | Body | Default body text |
| **Body Small** | 13px | 18px | Inter Regular | Body | Captions, timestamps, secondary info |
| **Caption** | 11px | 16px | Inter Medium | Body | Badges, labels, overlines |
| **Disclaimer** | 11px | 16px | Inter Regular | Body | Medical disclaimers, legal text |

### Typography Rules

1. **Maximum 2 fonts per screen.** DM Sans for headings, Inter for everything else.
2. **Never use all caps for medical content.** All caps reads as alarming. Sentence case for all findings and recommendations.
3. **Minimum 13px for health information.** Any text communicating health data must be readable without squinting.
4. **Bold for severity, not for emphasis.** Bold text in finding descriptions should be reserved for severity-relevant terms, not generic emphasis.
5. **Dynamic Type support.** All text scales with iOS Dynamic Type and Android font size settings up to 200%.

---

## Spacing System

### Base Unit: 8px

All spacing values are multiples of 8px for consistent visual rhythm.

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Tight spacing within badges, between icon and label |
| `space-sm` | 8px | Internal padding in chips, small gaps between elements |
| `space-md` | 16px | Standard content padding, gap between cards |
| `space-lg` | 24px | Section spacing, large card padding |
| `space-xl` | 32px | Screen edge padding, major section separation |
| `space-2xl` | 48px | Top/bottom screen padding, major structural separation |
| `space-3xl` | 64px | Hero areas, onboarding illustration spacing |

### Screen Layout Standards

| Aspect | Value |
|--------|-------|
| **Screen horizontal padding** | 24px (left and right) |
| **Card internal padding** | 16px |
| **Card border radius** | 16px |
| **Button height** | 56px (primary), 48px (secondary) |
| **Button border radius** | 12px |
| **Input height** | 52px |
| **Input border radius** | 12px |
| **Tab bar height** | 80px (including safe area) |
| **Bottom sheet border radius** | 24px (top corners) |
| **Minimum touch target** | 48x48px |

---

## Iconography

### Icon Set: Lucide

| Aspect | Detail |
|--------|--------|
| **Library** | Lucide React Native (`lucide-react-native`) |
| **Why Lucide** | Clean, consistent stroke width (2px default). Medical-appropriate without being clinical. MIT licensed. Comprehensive coverage of health, camera, chart, and navigation icons. |
| **Stroke Width** | 2px for standard icons, 1.5px for dense UI areas (tab bar, badges) |
| **Size** | 24px standard, 20px in compact areas, 32px for feature icons |
| **Color** | Inherits from context. Teal for active states, neutral for inactive, severity colors for health indicators. |

### Key Icons

| Purpose | Lucide Icon | Context |
|---------|-------------|---------|
| Home | `Home` | Tab bar |
| Camera / Scan | `ScanLine` | Tab bar, capture CTA |
| Body Map | `User` | Tab bar |
| Health / Heart | `Heart` | Tab bar, health correlations |
| Settings | `Settings` | Tab bar or header |
| Checkmark (all clear) | `CheckCircle` | Green severity |
| Eye (monitor) | `Eye` | Yellow severity |
| Alert (concerning) | `AlertTriangle` | Red severity |
| Camera | `Camera` | Capture-related actions |
| Sun | `Sun` | UV exposure, lighting indicator |
| Moon | `Moon` | Sleep data |
| Droplets | `Droplets` | Hydration data |
| Activity | `Activity` | Activity data, HRV |
| Clock | `Clock` | History, timeline |
| Calendar | `Calendar` | Date-related elements |
| Shield | `Shield` | Privacy, encryption |
| Lock | `Lock` | Biometric auth, data security |
| Share | `Share2` | Report sharing |
| Flame | `Flame` | Streak counter |

---

## Illustrations and Visual Language

### Style

| Aspect | Detail |
|--------|--------|
| **Body Outlines** | Soft gradient body silhouettes using teal-to-lavender gradients. Gender-neutral, abstract human forms. No photographic bodies. |
| **Skin Cell Patterns** | Abstract hexagonal cell patterns in soft teal/lavender as background textures. Evoke biology without being clinical. |
| **Nature Backgrounds** | Calm, abstract nature gradients (sky, water, leaves) in teal/lavender palette for onboarding and empty states. |
| **Illustration Style** | Flat illustration with soft gradients. No outlines (borderless). Rounded shapes. Limited palette (teal, lavender, coral, neutral). |

### Key Illustrations

| Screen | Illustration |
|--------|-------------|
| **Onboarding Welcome** | Abstract body outline with gentle teal glow, floating skin cell patterns |
| **Camera Permission** | Phone illustration showing AR overlay preview |
| **All Clear** | Soft checkmark with nature gradient background, subtle confetti particles |
| **Empty Body Map** | Ghost body outline with "tap to start" pulse indicators |
| **No Health Data** | Heart icon with data streams flowing into it |
| **Insufficient Data** | Growing plant illustration with progress indicator (metaphor for data growing) |

### Animation Principles

| Principle | Detail |
|-----------|--------|
| **Duration** | 200-300ms for micro-interactions, 500-800ms for transitions, 2000ms for celebrations |
| **Easing** | `Easing.bezier(0.4, 0, 0.2, 1)` for standard transitions (Material ease-in-out) |
| **Celebration** | Confetti (teal + lavender particles) for all-clear results and streak milestones. Subtle, not overwhelming. 2 seconds max. |
| **Loading** | Gentle pulsing teal ring. Calming, not frantic. |
| **Severity Transitions** | Smooth color fade between severity states (300ms). No abrupt color changes. |
| **Camera Indicators** | Continuous smooth animation for distance/angle/lighting indicators. 60fps via Reanimated on UI thread. |

---

## Design Principles

### 1. Non-Alarming Colors

Severity colors are used with restraint. Green is the dominant color in most user sessions (most checks are "all clear"). Yellow is presented gently -- as information, not warning. Red is used with calm authority, never with flashing or urgent visual treatment. The goal is to inform, not frighten.

### 2. Progressive Disclosure

Medical information is layered. Users see the headline first (severity badge), then the summary (one sentence), then the detail (full finding card), then the context (ABCDE breakdown). Each layer is opt-in via tap/expand. Users who want depth get it; users who want a quick check get a quick check.

### 3. Celebratory for "All Clear"

The majority of skin checks will come back green. This is a positive moment that should feel rewarding -- it reinforces the daily habit. Subtle confetti, green tint, encouraging language ("Everything looks good. You are taking great care of your skin."). The celebration is calm and affirming, not over-the-top.

### 4. Gentle for Concerning Findings

Red severity findings are delivered with empathy and calm. No exclamation marks, no red flashing, no alarming sounds. The design says: "We noticed something. Here is what we see. Here is what we recommend. Here is how to take the next step." The user should feel supported, not scared.

### 5. Large Photo Areas

Skin images are the primary content. Analysis results give the photo 60% of the screen height. Body map photos are prominently displayed. Timeline comparisons use full-width images. The app respects that users want to see their skin, not just read about it.

---

## Dark Mode

### Approach: Charcoal Blue, Not Pure Black

| Aspect | Detail |
|--------|--------|
| **Background** | `#111827` Charcoal Blue (not `#000000`). Pure black causes OLED flicker and feels harsh. Charcoal blue is warm and clinical. |
| **Surfaces** | `#1F2937` for cards and elevated elements. Clear visual hierarchy through subtle elevation. |
| **Elevated Surfaces** | `#374151` for modals, bottom sheets, and popovers. Third elevation level. |
| **Text** | Primary `#F9FAFB` (warm white, not pure white). Secondary `#9CA3AF`. Tertiary `#6B7280`. |
| **Teal on Dark** | Wellness Teal `#0D9488` works on dark backgrounds with sufficient contrast (4.8:1). For small text, use Teal Light `#5EEAD4` (7.2:1). |
| **Severity on Dark** | Severity badges use the same colors but with dark-mode-specific badge backgrounds for sufficient contrast. |
| **Images** | Skin photos displayed at full brightness (no dimming). The photo area uses a pure black background for maximum image fidelity. |
| **Automatic Switch** | Follows system setting by default. Manual override in Settings. |

### Dark Mode Severity Badges

| Severity | Badge Background | Text Color | Border |
|----------|-----------------|------------|--------|
| Green | `#064E3B` | `#6EE7B7` | None |
| Yellow | `#78350F` | `#FCD34D` | None |
| Red | `#7F1D1D` | `#FCA5A5` | None |

---

## Component Specifications

### Severity Badge

```
Layout: Horizontal, pill-shaped
Height: 28px
Padding: 4px vertical, 12px horizontal
Border Radius: 14px (full pill)
Icon: 16px, left-aligned (CheckCircle for green, Eye for yellow, AlertTriangle for red)
Text: 13px, Inter Medium, 4px left of icon
Background: Severity Light color (light mode) / Severity Dark background (dark mode)
Text Color: Severity Dark color (light mode) / Severity Light color (dark mode)
```

### Body Map Marker

```
Shape: Circle
Size: 20px (default), 28px (selected/zoomed)
Fill: Severity color at 100% opacity
Border: 2px white (light mode) / 2px charcoal (dark mode) for contrast against body outline
Pulse Animation: For areas with recent changes, gentle scale pulse (1.0 -> 1.15 -> 1.0) over 2 seconds, repeating
Tap Target: 48x48px (invisible hit area larger than visual marker)
```

### Comparison Slider

```
Layout: Full-width, two images side by side separated by draggable divider
Divider: 3px width, white with subtle drop shadow
Handle: 40px diameter circle, centered on divider, white with teal border
Handle Icon: Horizontal arrows (ChevronLeft + ChevronRight)
Drag: Horizontal only, constrained to image bounds
Labels: Date badges positioned at top corners of each image
    Label Style: 12px, Inter Medium, white text on semi-transparent black chip (rgba(0,0,0,0.6)), border radius 8px
Image Sizing: Both images scale to fill container, maintaining aspect ratio, overflow hidden
```

### Health Chart Card

```
Layout: Full-width card
Border Radius: 16px
Padding: 16px
Background: Surface (Teal Tint light / Dark Surface dark)
Title: 18px, DM Sans SemiBold, Text Primary
Chart: Victory Native dual-axis line chart
    Height: 200px
    Left Axis: Skin severity (0-10), Coral Pink line
    Right Axis: Health metric, metric-specific color
    Grid Lines: Subtle, Border color, horizontal only
    Data Points: 6px circles at each data point, filled with line color
    Touch Interaction: Tap data point to show tooltip with date and values
Correlation Badge: Below chart, pill shape, color based on strength (teal for strong, lavender for moderate, gray for weak)
AI Insight: Below badge, Body text, 2-3 sentences, Lavender-tinted background card
```

### Capture Guide Overlay

```
Layout: Full-screen overlay on camera preview
Capture Circle:
    Diameter: 60% of screen width
    Border: 3px, color transitions based on distance (red -> yellow -> green)
    Background: Transparent center, semi-transparent black outside (rgba(0,0,0,0.5))
    Animation: Border color transitions are 200ms ease-in-out
Distance Ring:
    Concentric ring outside capture circle
    Width: 8px
    Color: Same as capture circle border (synced)
    Opacity: Pulses gently when in optimal range (0.5 -> 1.0 -> 0.5, 1.5s cycle)
Angle Indicator:
    Position: Top-right corner, 16px from edges
    Icon: Gyroscope icon (custom SVG), 32px
    Color: Red/yellow/green based on angle
    Label: 12px, Inter Medium, below icon ("Hold straight" / "Good angle")
Lighting Bar:
    Position: Top of screen, below status bar, 16px horizontal margin
    Height: 8px, border radius 4px
    Background: Gray track
    Fill: Gradient from left (too dark, orange) through center (optimal, green) to right (too bright, orange)
    Current Position: White marker dot (12px) indicating current ambient light level
    Label: 13px, Inter Regular, centered below bar ("Add more light" / "Good lighting" / "Too bright")
Shutter Button:
    Position: Bottom center, 32px from bottom safe area
    Size: 70px diameter
    Style: White circle with 3px teal border when all indicators green, gray border when any indicator red
    Inner Circle: 60px diameter, white
    Disabled State: 50% opacity, non-interactive
    Capture Animation: Scale to 0.9 and back on press (100ms)
```

### Finding Card

```
Layout: Full-width card, expandable
Border Radius: 16px
Border Left: 4px, severity color
Padding: 16px
Background: White (light) / Dark Surface (dark)
Collapsed State:
    Height: ~72px
    Row 1: Finding number (circle, 24px, severity color) + Type badge (pill) + Severity badge (pill)
    Row 2: First line of description, truncated with ellipsis
    Chevron: Right edge, pointing down, Tertiary text color
Expanded State:
    Full description text (Body Large)
    ABCDE Assessment (if mole): 5 rows, each with criterion name + status + icon
    Recommendation: Teal-tinted background strip, Inter Medium
    Animation: Height expansion 300ms ease-in-out, content fade-in 200ms
Tap Target: Entire card is tappable for expand/collapse
```

---

## Accessibility Standards

| Standard | Requirement |
|----------|-------------|
| **WCAG 2.1 AA** | Minimum compliance level for all elements |
| **Color Contrast** | 4.5:1 minimum for body text, 3:1 minimum for large text (18px+), 3:1 minimum for UI components |
| **Screen Reader** | Full VoiceOver (iOS) and TalkBack (Android) support. All interactive elements labeled. |
| **Dynamic Type** | All text scales with system font size settings up to 200% |
| **Reduced Motion** | Respect `prefers-reduced-motion`. Disable confetti, pulse animations, and transition effects when enabled. |
| **Color-Blind Safety** | Severity uses icons (checkmark, eye, triangle) and text labels in addition to color. Never rely on color alone to communicate severity. |
| **Touch Targets** | Minimum 48x48px for all interactive elements |
| **Focus Indicators** | Visible focus rings (3px teal outline) for keyboard/switch control navigation |
| **Haptic Feedback** | Supplement visual feedback with haptic cues (capture ready, severity reveal, button press) |
