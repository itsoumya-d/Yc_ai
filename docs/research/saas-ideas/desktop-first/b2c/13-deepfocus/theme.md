# DeepFocus -- Theme and Design System

## Brand Personality

DeepFocus embodies the feeling of a perfectly still, deep ocean at night -- calm, vast, powerful, and intelligent. The design communicates that this is a premium, professional tool that respects the user's attention as much as the user wants to protect it.

| Trait         | Expression                                                    |
| ------------- | ------------------------------------------------------------- |
| Calm          | Muted colors, generous whitespace, slow animations            |
| Focused       | Minimal UI elements, no visual clutter, purposeful hierarchy  |
| Premium       | Rich dark surfaces, refined typography, subtle depth          |
| Zen-like      | Breathing animations, gentle transitions, no jarring elements |
| Intelligent   | Data-rich dashboards, AI insight cards, adaptive behavior     |

**Design Principles:**
1. **Reduce, don't add.** Every element earns its place. If it doesn't help the user focus, it's removed.
2. **Calm over exciting.** Animations are slow and breathing. No bounce, no shake, no attention-grabbing tricks.
3. **Dark is default.** The app signals "focus time" through its visual weight. Dark mode reduces eye strain during long sessions.
4. **Data should motivate, not overwhelm.** Analytics are presented as progress narratives, not spreadsheets.
5. **Sound and sight in harmony.** Visual elements echo the ambient audio -- when rain plays, the UI feels cooler and softer.

---

## Color Palette

### Dark Mode Only

DeepFocus uses dark mode exclusively. This is a deliberate product decision:
- Reduces eye strain during long focus sessions
- Creates a visual signal that "focus time" is different from regular screen time
- Makes the timer, scores, and progress elements pop with luminosity contrast
- Aligns with the calm, premium, zen-like brand personality

### Primary Colors

| Name             | Hex       | RGB              | Usage                                          |
| ---------------- | --------- | ---------------- | ---------------------------------------------- |
| Deep Ocean Blue  | `#1E3A5F` | 30, 58, 95       | Primary brand color, interactive elements, links |
| Soft Sage Green  | `#7FB069` | 127, 176, 105    | Success states, completed sessions, positive metrics |
| Warm Amber       | `#E8A838` | 232, 168, 56     | Active sessions, CTAs, streaks, attention-drawing elements |

### Background Colors

| Name             | Hex       | RGB              | Usage                                          |
| ---------------- | --------- | ---------------- | ---------------------------------------------- |
| Midnight         | `#0A0E1A` | 10, 14, 26       | App background, deepest layer                  |
| Surface          | `#141B2D` | 20, 27, 45       | Cards, panels, elevated surfaces               |
| Surface Raised   | `#1C2540` | 28, 37, 64       | Hover states, selected items, active tabs      |
| Surface Overlay  | `#243052` | 36, 48, 82       | Modals, dropdowns, tooltips                    |

### Text Colors

| Name             | Hex       | RGB              | Usage                                          |
| ---------------- | --------- | ---------------- | ---------------------------------------------- |
| Primary Text     | `#F0F2F5` | 240, 242, 245    | Headings, important labels, timer display      |
| Secondary Text   | `#9CA3AF` | 156, 163, 175    | Body text, descriptions, secondary information |
| Muted Text       | `#6B7280` | 107, 114, 128    | Timestamps, captions, disabled labels          |
| Inverse Text     | `#0A0E1A` | 10, 14, 26       | Text on amber/green buttons                    |

### Semantic Colors

| Name             | Hex       | RGB              | Usage                                          |
| ---------------- | --------- | ---------------- | ---------------------------------------------- |
| Success          | `#7FB069` | 127, 176, 105    | Completed sessions, positive trends, achievements |
| Warning          | `#E8A838` | 232, 168, 56     | Streak at risk, session ending soon            |
| Error            | `#EF4444` | 239, 68, 68      | Failed actions, destructive buttons            |
| Info             | `#60A5FA` | 96, 165, 250     | Informational toasts, tips, links              |

### Special Effect Colors

| Name             | Hex / Value                     | Usage                                          |
| ---------------- | ------------------------------- | ---------------------------------------------- |
| Session Glow     | `#1E3A5F` at 20% opacity       | Ambient glow behind timer during active session|
| Flow State Glow  | `#E8A838` at 15% opacity       | Golden glow when flow state is detected        |
| Focus Ring       | `#E8A838` at 100%, 2px         | Keyboard focus indicator for accessibility     |
| Card Border      | `#1E3A5F` at 30% opacity       | Subtle borders on surface cards                |
| Gradient Overlay | `#0A0E1A` to transparent       | Fade effects on scrollable content edges       |

### Heatmap Scale (Analytics)

| Level | Hex       | Meaning                    |
| ----- | --------- | -------------------------- |
| 0     | `#141B2D` | No data / no sessions      |
| 1     | `#1C3A2D` | Low focus (1-30 min)       |
| 2     | `#2D5A3D` | Moderate focus (30-60 min) |
| 3     | `#4D8A5D` | Good focus (60-120 min)    |
| 4     | `#7FB069` | Excellent focus (120+ min) |

---

## Typography

### Font Stack

| Role        | Font Family | Weight Range | Fallback Stack                          |
| ----------- | ----------- | ------------ | --------------------------------------- |
| Headings    | Satoshi     | 500-700      | system-ui, -apple-system, sans-serif    |
| Body        | Inter       | 400-600      | system-ui, -apple-system, sans-serif    |
| Monospace   | DM Mono     | 400-500      | 'SF Mono', 'Fira Code', monospace       |

**Why These Fonts:**
- **Satoshi** -- Modern geometric sans-serif with a calm, premium feel. Clean letterforms that don't demand attention. Available via Fontshare (free for commercial use).
- **Inter** -- Designed specifically for screen readability. Excellent at small sizes, which matters for analytics data and secondary labels. Variable font for optimal file size.
- **DM Mono** -- Clean monospace for timer displays and numerical data. Tabular lining figures ensure numbers align vertically in dashboards. Available via Google Fonts.

### Type Scale

| Level      | Font    | Size  | Weight | Line Height | Letter Spacing | Usage                        |
| ---------- | ------- | ----- | ------ | ----------- | -------------- | ---------------------------- |
| Display    | Satoshi | 48px  | 700    | 1.1         | -0.02em        | Timer countdown display      |
| H1         | Satoshi | 32px  | 700    | 1.2         | -0.01em        | Page titles                  |
| H2         | Satoshi | 24px  | 600    | 1.3         | -0.005em       | Section headers              |
| H3         | Satoshi | 20px  | 600    | 1.4         | 0              | Card titles, subsections     |
| H4         | Satoshi | 16px  | 600    | 1.4         | 0              | Widget titles, labels        |
| Body L     | Inter   | 16px  | 400    | 1.6         | 0              | Primary body text            |
| Body M     | Inter   | 14px  | 400    | 1.5         | 0              | Secondary text, descriptions |
| Body S     | Inter   | 12px  | 400    | 1.4         | 0.01em         | Captions, timestamps         |
| Label      | Inter   | 14px  | 500    | 1.0         | 0.02em         | Button text, nav items       |
| Mono L     | DM Mono | 48px  | 500    | 1.0         | -0.02em        | Timer display                |
| Mono M     | DM Mono | 20px  | 400    | 1.0         | 0              | Focus score numbers          |
| Mono S     | DM Mono | 14px  | 400    | 1.0         | 0              | Small numerical data         |

### Tabular Lining Numbers

DM Mono uses tabular lining figures by default, ensuring:
- Timer digits don't shift width as they change (00:00 to 99:59)
- Dashboard numbers align in columns
- Focus scores and percentages maintain consistent layout

---

## Spacing and Layout

### Spacing Scale

| Token | Value | Usage                                           |
| ----- | ----- | ----------------------------------------------- |
| xs    | 4px   | Inline gaps, icon-to-text spacing               |
| sm    | 8px   | Compact element padding, tight list spacing     |
| md    | 16px  | Standard card padding, section gaps             |
| lg    | 24px  | Card-to-card spacing, major section gaps        |
| xl    | 32px  | Page-level padding, large component separation  |
| 2xl   | 48px  | Screen-level vertical rhythm, hero spacing      |
| 3xl   | 64px  | Onboarding step spacing, major layout gaps      |

### Layout Principles

- **Generous whitespace.** The app should feel spacious, not cramped. When in doubt, add more space.
- **Content max-width.** Main content area maxes out at 960px. Prevents text lines from becoming too long.
- **Card-based layout.** Information is grouped in cards with Surface background, 16px padding, rounded-xl corners.
- **Consistent grid.** 8px base grid. All dimensions are multiples of 8.
- **Sidebar width.** Expanded: 240px. Collapsed: 64px. Transition: 200ms ease.

### Border Radius Scale

| Token    | Value | Usage                                      |
| -------- | ----- | ------------------------------------------ |
| sm       | 6px   | Small buttons, badges, input fields        |
| md       | 8px   | Standard buttons, toggles                  |
| lg       | 12px  | Cards, panels, dropdown menus              |
| xl       | 16px  | Large cards, modal containers              |
| full     | 9999px| Pills, circular buttons, avatars, badges   |

---

## Animation and Motion

### Principles

- All animations are **slow and intentional** -- the app should feel like it's breathing, not bouncing
- Default duration: 200-400ms for interactions, 2000-8000ms for ambient effects
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions (ease-out feel)
- Respect `prefers-reduced-motion`: disable all non-essential animations

### Specific Animations

| Animation              | Duration | Easing              | Description                                    |
| ---------------------- | -------- | ------------------- | ---------------------------------------------- |
| Breathing pulse        | 4000ms   | ease-in-out         | Timer ring opacity 0.7 to 1.0 and back         |
| Session glow           | 6000ms   | ease-in-out         | Background glow intensity oscillation           |
| Timer countdown        | 1000ms   | linear              | Per-second timer update, smooth ring reduction  |
| Page transition        | 300ms    | ease-out            | Cross-fade between screens                     |
| Card hover             | 200ms    | ease-out            | Subtle lift (translateY -2px) + border glow    |
| Button press           | 100ms    | ease-in             | Scale to 0.97, then back to 1.0                |
| Toast enter            | 300ms    | ease-out            | Slide up from bottom-right + fade in           |
| Toast exit             | 200ms    | ease-in             | Fade out + slide down                          |
| Sidebar collapse       | 200ms    | ease-out            | Width transition 240px to 64px                 |
| Soundscape crossfade   | 3000ms   | linear              | Volume crossfade between two audio sources     |
| Focus score gauge fill | 1000ms   | ease-out            | SVG stroke-dashoffset animation on mount       |
| Streak flame flicker   | 2000ms   | ease-in-out         | Subtle scale oscillation (1.0 to 1.05)         |
| Confetti (milestone)   | 3000ms   | ease-out            | Particle burst, gravity fall, fade out         |

### Ambient Visual Effects

**Session Active Background:**
- Subtle gradient animation on the midnight background
- Two color stops slowly orbiting: Deep Ocean Blue (#1E3A5F at 10%) and a second tone based on soundscape
- Rain soundscape: cooler blue shift
- Coffee shop: warmer amber shift
- Lo-fi: purple/indigo shift
- Animation cycle: 20 seconds, seamless loop

**Flow State Indicator:**
- When AI detects flow state (or biometric confirms it):
- Timer ring transitions from sage green to a warm gold gradient
- Background glow intensifies (amber at 15% opacity)
- A subtle "In Flow" badge fades in below the timer
- All effects are gentle enough to not break the flow state they're indicating

---

## Icon Library

### Lucide React

**Why Lucide:** Clean, consistent line icons with 1.5px stroke width. The thin strokes complement the minimal, zen-like aesthetic. MIT licensed, tree-shakeable, React-native components.

### Core Icons Used

| Icon Name         | Usage                                    |
| ----------------- | ---------------------------------------- |
| `Play`            | Start session                            |
| `Pause`           | Pause session                            |
| `Square`          | Stop/end session                         |
| `Timer`           | Session timer, duration settings         |
| `Shield`          | Distraction blocking, security           |
| `ShieldCheck`     | Blocking active indicator                |
| `Music`           | Soundscape controls                      |
| `Volume2`         | Volume control                           |
| `BarChart3`       | Analytics                                |
| `TrendingUp`      | Positive trend indicator                 |
| `TrendingDown`    | Negative trend indicator                 |
| `Flame`           | Streak                                   |
| `Target`          | Focus score                              |
| `Calendar`        | Calendar integration                     |
| `Settings`        | Settings screen                          |
| `User`            | Account/profile                          |
| `Clock`           | Session history                          |
| `CloudRain`       | Rain soundscape                          |
| `Coffee`          | Coffee shop soundscape                   |
| `Headphones`      | Lo-fi / music soundscape                 |
| `Wind`            | White noise soundscape                   |
| `Trees`           | Forest soundscape                        |
| `Waves`           | Ocean soundscape                         |
| `Moon`            | Night / dark mode indicator              |
| `Zap`             | Quick start                              |
| `Bell`            | Notifications                            |
| `BellOff`         | Notifications silenced                   |
| `Check`           | Completed / success                      |
| `X`               | Close / cancel                           |
| `ChevronRight`    | Navigation forward                       |
| `Command`         | Keyboard shortcut hint                   |
| `Users`           | Team focus rooms                         |
| `Brain`           | AI features                              |
| `Heart`           | Biometric / health data                  |
| `Eye`             | Eye tracking / attention                 |
| `Download`        | Export data                              |

### Icon Sizing

| Context          | Size  | Stroke Width |
| ---------------- | ----- | ------------ |
| Navigation       | 20px  | 1.5px        |
| Inline with text | 16px  | 1.5px        |
| Card accent      | 24px  | 1.5px        |
| Feature icon     | 32px  | 1.5px        |
| Onboarding hero  | 48px  | 1.5px        |
| Empty state      | 64px  | 1.25px       |

---

## Component Styling

### Timer Ring

```
Container: 280px x 280px (active session), 120px x 120px (dashboard mini)
Track: SVG circle, stroke #1C2540, stroke-width 4px
Progress: SVG circle, stroke gradient (#7FB069 to #E8A838), stroke-width 4px
  - stroke-dasharray for progress calculation
  - stroke-linecap: round
Time text: DM Mono, 48px (active) / 20px (mini), centered inside ring
Task name: Inter, 14px, #9CA3AF, below ring (active session)
Breathing animation: opacity oscillation 0.85 to 1.0, 4s cycle, ease-in-out
Flow state: stroke gradient shifts to (#E8A838 to #F59E0B), background glow amber
```

### Soundscape Card

```
Container: 180px x 140px, background #141B2D, border-radius 12px
Border: 1px solid rgba(30, 58, 95, 0.3)
Hover: border-color #1E3A5F, translateY -2px, box-shadow 0 4px 12px rgba(0,0,0,0.3)
Selected: border-color #7FB069, background #1C2540
Icon: Lucide, 32px, centered, color #9CA3AF (default), #F0F2F5 (selected)
Name: Inter 14px, 500 weight, centered below icon, 8px gap
Preview button: Play icon overlay, appears on hover, 32px circle, rgba(232,168,56,0.9) bg
```

### Focus Score Gauge

```
Container: 120px x 120px (dashboard), 80px x 80px (compact)
Track: SVG circle, stroke #1C2540, stroke-width 6px
Fill: SVG circle, stroke varies by score:
  - 0-39: #EF4444 (red -- needs improvement)
  - 40-69: #E8A838 (amber -- building)
  - 70-89: #7FB069 (green -- good)
  - 90-100: #60A5FA (blue -- excellent)
Score number: DM Mono, 24px (dashboard) / 16px (compact), centered
Label: Inter 12px, #6B7280, "Focus Score" below gauge
Animation: stroke-dashoffset animates on mount, 1000ms ease-out
```

### Streak Badge

```
Container: pill shape (border-radius: full), padding 8px 16px
Background: linear-gradient(135deg, #E8A838 0%, #F59E0B 100%)
Icon: Flame (Lucide), 16px, #0A0E1A
Text: Inter 14px, 600 weight, #0A0E1A, "{count} day streak"
Flame animation: subtle scale pulse 1.0 to 1.05, 2s cycle
At-risk state (missed yesterday): border 2px dashed #EF4444, muted background
```

### Session Summary Card

```
Container: max-width 520px, background #141B2D, border-radius 16px, padding 24px
Header: checkmark icon (animated) + "Session Complete!" Satoshi 24px
Stats grid: 2x2, each cell has:
  - Label: Inter 12px, #6B7280, uppercase, letter-spacing 0.05em
  - Value: DM Mono 24px, #F0F2F5
  - Trend arrow (if applicable): TrendingUp/Down icon, colored accordingly
Divider: 1px solid rgba(30, 58, 95, 0.2), 16px vertical margin
Reflection section: 3 emoji buttons (rough/okay/great), optional text input
Action buttons: full-width stack, primary (amber) + secondary (outline) + text link
```

### Navigation Sidebar

```
Container: width 240px (expanded), 64px (collapsed), background #0A0E1A
Logo: 32px, top-left, with app name (expanded) or icon-only (collapsed)
Nav items:
  - Height: 44px
  - Padding: 12px 16px
  - Icon: 20px, #6B7280 (inactive), #F0F2F5 (active)
  - Label: Inter 14px, 500 weight, #6B7280 (inactive), #F0F2F5 (active)
  - Active indicator: 3px left border, #7FB069, background rgba(127, 176, 105, 0.08)
  - Hover: background rgba(28, 37, 64, 0.5)
Collapse button: ChevronLeft icon, bottom of sidebar, 36px
User section: bottom of sidebar, avatar (32px circle) + name + plan badge
Transition: width change 200ms ease-out, labels fade 150ms
```

### Data Visualization Colors

For charts and graphs, use this ordered palette to ensure consistency:

| Index | Color     | Category Example |
| ----- | --------- | ---------------- |
| 1     | `#60A5FA` | Coding           |
| 2     | `#7FB069` | Writing          |
| 3     | `#E8A838` | Design           |
| 4     | `#A78BFA` | Research         |
| 5     | `#F472B6` | Admin            |
| 6     | `#34D399` | Learning         |
| 7     | `#FB923C` | Planning         |
| 8     | `#94A3B8` | Other            |

---

## Shadows and Elevation

| Level    | Value                                        | Usage                          |
| -------- | -------------------------------------------- | ------------------------------ |
| None     | none                                         | Flat elements on surface       |
| Subtle   | `0 1px 3px rgba(0, 0, 0, 0.3)`              | Cards resting on background    |
| Medium   | `0 4px 12px rgba(0, 0, 0, 0.4)`             | Hovered cards, dropdowns       |
| Large    | `0 8px 24px rgba(0, 0, 0, 0.5)`             | Modals, overlays               |
| Glow     | `0 0 20px rgba(30, 58, 95, 0.3)`            | Active session ambient glow    |
| Amber Glow| `0 0 24px rgba(232, 168, 56, 0.2)`          | Flow state, CTA hover          |

---

## Responsive Breakpoints (Desktop Window Sizes)

| Name       | Min Width | Layout Changes                              |
| ---------- | --------- | ------------------------------------------- |
| Compact    | 600px     | Single column, no sidebar, simplified UI    |
| Standard   | 900px     | Sidebar icons only, two-column main         |
| Wide       | 1200px    | Full sidebar, three-column dashboard        |
| Ultrawide  | 1600px    | Max-width constraint, centered content      |

---

## Accessibility Compliance

| Requirement                  | Implementation                              |
| ---------------------------- | ------------------------------------------- |
| Color contrast (WCAG AA)    | All text meets 4.5:1 ratio against backgrounds |
| Focus indicators             | 2px amber ring on all interactive elements  |
| Reduced motion               | `prefers-reduced-motion` disables animations|
| High contrast mode           | Fallback to higher contrast color values    |
| Screen reader announcements  | Live regions for timer updates, session events |
| Keyboard navigability        | Full tab order, Enter/Space activation      |
| Font scaling                 | rem-based sizing, respects system preferences|
