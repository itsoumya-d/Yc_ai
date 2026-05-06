# VaultEdit -- Design System & Theme

## Brand Personality

VaultEdit's brand communicates five core attributes:

| Attribute | Expression |
|---|---|
| **Creative** | Electric violet primary color, fluid animations, expressive typography. VaultEdit is a tool for artists, not accountants. |
| **Powerful** | Dense information layout, professional terminology, GPU-accelerated rendering. This is a serious tool, not a toy. |
| **Modern** | Clean sans-serif type, subtle gradients, glassmorphism accents. VaultEdit feels like the future, not a legacy NLE. |
| **Creator-First** | YouTube-specific language ("Shorts," "chapters," "thumbnails"), creator-centric workflows, community templates. |
| **Effortless** | AI-powered automation, one-click presets, minimal configuration. Complex editing should feel simple. |

### Brand Voice

- **Concise**: Button labels are 1-2 words. Descriptions are 1-2 sentences. No filler text.
- **Actionable**: UI text tells the user what to do, not what happened. "Remove silence" not "Silence has been detected."
- **Confident**: "Your video is ready" not "We think your video might be ready."
- **Friendly, not casual**: Professional but approachable. No slang, no exclamation marks in UI, no emojis in interface text.

---

## Color Palette

VaultEdit uses a **dark-mode-only** design. Video editing applications are dark by industry convention -- dark surrounds allow accurate perception of video color and reduce eye strain during long editing sessions.

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Electric Violet** | `#7C3AED` | 124, 58, 237 | Primary brand color, primary buttons, active states, focus rings, selected items |
| **Bright Cyan** | `#06B6D4` | 6, 182, 212 | Secondary accent, AI-related UI elements, links, progress indicators |

### Background Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Deep Black** | `#0A0A0F` | 10, 10, 15 | Application background, behind panels, window frame |
| **Surface** | `#161622` | 22, 22, 34 | Panel backgrounds, card backgrounds, input fields |
| **Surface Elevated** | `#1E1E2E` | 30, 30, 46 | Timeline tracks, elevated panels, dropdown menus, tooltips |
| **Surface Hover** | `#252538` | 37, 37, 56 | Hover state for interactive surfaces |

### Semantic Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Playhead Red** | `#EF4444` | 239, 68, 68 | Video playhead, recording indicator, destructive actions, errors |
| **Waveform Green** | `#10B981` | 16, 185, 129 | Audio waveform, success states, confirmed actions, "done" indicators |
| **Warning Amber** | `#F59E0B` | 245, 158, 11 | Filler word highlights, warnings, caution states |
| **Info Blue** | `#3B82F6` | 59, 130, 246 | Informational messages, selection ranges on timeline |

### Selection & Highlight Colors

| Name | Hex + Opacity | Usage |
|---|---|---|
| **Selection Violet** | `#7C3AED` at 30% opacity | Selected transcript text, selected timeline range |
| **Hover Violet** | `#7C3AED` at 15% opacity | Hover state on transcript words, timeline elements |
| **AI Glow** | `#06B6D4` at 20% opacity | Background glow behind AI command panel during processing |
| **Focus Ring** | `#7C3AED` at 100%, 2px | Keyboard focus indicator on all interactive elements |

### Text Colors

| Name | Hex | Opacity | Usage |
|---|---|---|---|
| **Text Primary** | `#F8FAFC` | 100% | Headings, primary content, button labels |
| **Text Secondary** | `#94A3B8` | 100% | Descriptions, timestamps, metadata |
| **Text Tertiary** | `#64748B` | 100% | Placeholder text, disabled labels, divider labels |
| **Text Inverse** | `#0F172A` | 100% | Text on light/colored backgrounds (primary buttons) |

### Gradient Definitions

```css
/* Primary gradient -- used for AI processing indicator, premium badges */
--gradient-primary: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%);

/* Rendering progress bar */
--gradient-render: linear-gradient(90deg, #7C3AED 0%, #06B6D4 50%, #10B981 100%);

/* Subtle surface gradient -- top of panels */
--gradient-surface: linear-gradient(180deg, #1E1E2E 0%, #161622 100%);

/* AI command bar border glow during processing */
--gradient-ai-glow: linear-gradient(90deg, #7C3AED, #06B6D4, #7C3AED);
```

---

## Typography

### Font Stack

| Font | Usage | Fallback |
|---|---|---|
| **Geist Sans** | Headings, section titles, screen names, menu bar | -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif |
| **Inter** | Body text, UI labels, button text, transcript text, descriptions | -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif |
| **Geist Mono** | Timecodes, frame numbers, technical values, codec info, file sizes | "SF Mono", "Fira Code", "Cascadia Code", monospace |

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Font | Usage |
|---|---|---|---|---|---|---|
| **Display** | 28px | 700 | 1.2 | -0.02em | Geist Sans | Welcome screen title, empty state headings |
| **Heading 1** | 22px | 600 | 1.3 | -0.01em | Geist Sans | Screen titles (Project Library, Settings) |
| **Heading 2** | 18px | 600 | 1.35 | -0.005em | Geist Sans | Section headings within screens |
| **Heading 3** | 15px | 600 | 1.4 | 0 | Geist Sans | Card titles, panel headers |
| **Body** | 14px | 400 | 1.5 | 0 | Inter | General UI text, descriptions |
| **Body Small** | 13px | 400 | 1.5 | 0 | Inter | Transcript text, secondary information |
| **Label** | 12px | 500 | 1.4 | 0.02em | Inter | Input labels, tag labels, badge text |
| **Caption** | 11px | 400 | 1.4 | 0.02em | Inter | Timestamps, metadata, helper text |
| **Mono** | 13px | 400 | 1.4 | 0 | Geist Mono | Timecodes (00:12:34), frame numbers, file sizes |
| **Mono Small** | 11px | 400 | 1.4 | 0 | Geist Mono | Export settings values, codec details |

### Typography Rules

- **Headings**: Geist Sans, semibold or bold, tight letter spacing for larger sizes
- **Body text**: Inter, regular weight, optimized for readability at small sizes on dark backgrounds
- **Technical values**: Always Geist Mono -- timecodes, frame counts, bitrates, file sizes, resolution values
- **Button text**: Inter, medium weight (500), 14px, uppercase NOT used (buttons use sentence case)
- **Transcript text**: Inter, regular weight, 13px -- optimized for reading long passages, 1.6 line height for clarity
- **Menu items**: Inter, regular weight, 14px
- **Minimum text size**: 11px (Caption) -- nothing smaller for accessibility compliance

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight gaps (between icon and label, between badge elements) |
| `space-2` | 8px | Default element gap (between list items, form field gap) |
| `space-3` | 12px | Panel internal padding |
| `space-4` | 16px | Section spacing, card padding |
| `space-5` | 20px | Between major sections |
| `space-6` | 24px | Panel header height padding |
| `space-7` | 32px | Screen-level padding |
| `space-8` | 40px | Large section breaks |
| `space-9` | 48px | Screen top margin |
| `space-10` | 64px | Extra-large spacing (welcome screen sections) |

### Panel Layout

VaultEdit uses a **dense panel layout** consistent with professional video editing applications. Users expect high information density -- screen real estate is valuable.

```
+------------------------------------------------------------------+
|  Menu Bar: height 32px                                            |
+----------------------------------------------+-------------------+
|                                              |                   |
|  Preview Panel                               |  Transcript Panel |
|  min-width: 400px                            |  min-width: 280px |
|  default: 60% width                         |  default: 40% w   |
|                                              |                   |
+----------------------------------------------+                   |
|                                              |                   |
|  Timeline Panel                              |                   |
|  height: 180px (resizable)                   |                   |
|  min-height: 120px                           |                   |
|  max-height: 50% of window                   |                   |
|                                              |                   |
+----------------------------------------------+-------------------+
|  AI Command Bar: height 48px                                      |
+------------------------------------------------------------------+
```

### Panel Dividers

- **Divider width**: 1px visible line + 4px invisible grab area (total 5px interaction target)
- **Divider color**: `#252538` (Surface Hover)
- **Divider hover**: `#7C3AED` at 50% opacity
- **Divider dragging**: `#7C3AED` at 100%
- **Cursor on divider**: `col-resize` (vertical dividers) or `row-resize` (horizontal dividers)

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Buttons, input fields, small badges |
| `radius-md` | 6px | Cards, dropdowns, panels |
| `radius-lg` | 8px | Modal dialogs, large cards |
| `radius-xl` | 12px | Project thumbnail cards, template cards |
| `radius-full` | 9999px | Pill badges, avatar circles, toggle switches |

---

## Icon Library

### Phosphor Icons

VaultEdit uses **Phosphor Icons** (https://phosphoricons.com) as its icon library.

| Detail | Value |
|---|---|
| **Library** | Phosphor Icons |
| **Style** | Regular weight (default), Bold weight (active/selected states) |
| **Size** | 16px (inline), 20px (buttons/menu), 24px (toolbar), 32px (empty states) |
| **Color** | Inherits text color (Text Secondary for default, Text Primary for active) |

**Why Phosphor:**

- Consistent 1.5px stroke weight across all icons
- Comprehensive set (1,000+ icons) covering video editing concepts
- Multiple weights (Thin, Light, Regular, Bold, Fill, Duotone) for state differentiation
- MIT license, free for commercial use
- Excellent React component library (`@phosphor-icons/react`)

### Key Icons Used

| Icon | Phosphor Name | Usage |
|---|---|---|
| Play | `Play` | Playback control |
| Pause | `Pause` | Playback control |
| Skip forward | `SkipForward` | Jump ahead 5 seconds |
| Skip back | `SkipBack` | Jump back 5 seconds |
| Scissors | `Scissors` | Cut/split operation |
| Waveform | `Waveform` | Audio track indicator |
| Text | `TextAa` | Caption/text tool |
| Magic wand | `MagicWand` | AI features |
| Robot | `Robot` | AI command panel |
| Export | `Export` | Export action |
| Folder | `FolderOpen` | Project library |
| Settings | `GearSix` | Settings screen |
| Timer | `Timer` | Timecode display |
| Palette | `Palette` | Color correction |
| Image | `Image` | Thumbnail tool |
| Microphone | `Microphone` | Audio/recording |
| Speaker | `SpeakerHigh` | Volume control |
| Trash | `Trash` | Delete action |
| Undo | `ArrowCounterClockwise` | Undo |
| Redo | `ArrowClockwise` | Redo |

---

## Component Styling

### Timeline Track

```
+------------------------------------------------------------------+
| Track Label |  [thumbnail] [thumbnail] [gap] [thumbnail] [thumb] |
| V1          |  [strip of video frames with gaps at cut points]   |
+------------------------------------------------------------------+

- Track height: 64px (video), 40px (audio), 32px (caption/music)
- Track label width: 48px, fixed
- Track background: #1E1E2E (Surface Elevated)
- Track label background: #161622 (Surface)
- Track label text: 11px Geist Mono, Text Secondary
- Frame thumbnail: extracted every 2 seconds at current zoom level
- Cut gap: 2px wide, #0A0A0F (Deep Black)
- Selected range: #7C3AED at 30% opacity overlay
- Playhead: 2px wide, #EF4444, full track height, with triangle head (6px)
```

### Video Thumbnail Strip

```
- Frame width: proportional to zoom level (32px-128px)
- Frame height: fills track height minus 4px padding
- Frame border: none (frames butt against each other seamlessly)
- Cut indicator: 2px gap between segments
- Hover frame: 1px border #7C3AED
- Loading: skeleton shimmer while frames generate
```

### Audio Waveform

```
- Waveform color: #10B981 (Waveform Green) at 70% opacity
- Waveform peak color: #10B981 at 100% opacity
- Waveform background: transparent (track background shows through)
- Waveform style: mirrored (symmetric above and below center line)
- Center line: 1px, #252538 (Surface Hover)
- Silence regions: waveform near-flat, optionally highlighted with #F59E0B at 10% opacity
- RMS vs peak: RMS shown as filled area, peaks shown as lines
```

### Caption Bubble (on video preview)

```
+----------------------------------------+
|  This is how your captions look        |
+----------------------------------------+

Default style:
- Background: #000000 at 75% opacity
- Text: #FFFFFF, Inter 24px bold
- Padding: 8px 16px
- Border radius: 4px
- Position: bottom center, 48px from bottom edge
- Shadow: 0 2px 8px rgba(0,0,0,0.5)
- Max width: 80% of video width
- Word highlight (active): #7C3AED background on current word
```

### AI Command Input

```
+------------------------------------------------------------------+
| [Robot icon]  Type an editing command...              [Send] [?]  |
+------------------------------------------------------------------+

- Height: 48px
- Background: #161622 (Surface)
- Border-top: 1px solid #252538 (Surface Hover)
- Input text: 14px Inter, Text Primary
- Placeholder text: 14px Inter, Text Tertiary
- Robot icon: 20px, #06B6D4 (Bright Cyan)
- Send button: 32px square, #7C3AED background, white arrow icon
- Help button: 32px square, transparent, Text Secondary icon
- Processing state: animated gradient border (#7C3AED -> #06B6D4), pulsing
- Focus state: border-top color changes to #7C3AED
```

### Render Progress Bar

```
[=======================================.............]  78%

- Height: 8px (inline), 12px (full-screen render view)
- Background: #252538 (Surface Hover)
- Fill: linear-gradient(90deg, #7C3AED, #06B6D4)
- Border radius: radius-full (pill shape)
- Animation: fill width transitions smoothly (CSS transition 0.3s ease)
- Completed: fill becomes #10B981 (Waveform Green), checkmark icon appears
- Error: fill becomes #EF4444 (Playhead Red), X icon appears
```

### Export Preset Card

```
+----------+
| [YT icon]|
| YouTube  |
| 16:9     |
|          |
+----------+

- Width: 96px
- Height: 80px
- Background: #161622 (Surface)
- Border: 1px solid #252538 (Surface Hover)
- Border radius: radius-lg (8px)
- Icon: 24px, centered, platform-specific color
- Label: 13px Inter semibold, Text Primary
- Sublabel: 11px Inter, Text Secondary
- Hover: border-color #7C3AED at 50%, background #1E1E2E
- Selected: border-color #7C3AED at 100%, background #7C3AED at 15%
- Transition: all 150ms ease
```

### Project Card (Library)

```
+------------------+
| [Video thumbnail]|
| 16:9 preview     |
|                  |
| Project Name     |
| 12:34 | Draft    |
| 2 hours ago      |
+------------------+

- Width: 240px (grid), full-width (list)
- Thumbnail height: 135px (16:9 ratio at 240px width)
- Background: #161622 (Surface)
- Border: 1px solid transparent
- Border radius: radius-xl (12px)
- Thumbnail border-radius: radius-xl radius-xl 0 0 (top corners only)
- Padding (text area): 12px
- Title: 14px Inter semibold, Text Primary, single-line truncate
- Duration badge: 11px Geist Mono, positioned over thumbnail bottom-right
- Duration badge background: #0A0A0F at 80%
- Status badge: 11px Inter medium, pill shape, color-coded
- Timestamp: 12px Inter, Text Tertiary
- Hover: border-color #252538, translateY(-2px), box-shadow 0 4px 12px rgba(0,0,0,0.3)
- Selected: border-color #7C3AED
```

---

## Animation & Motion

### Motion Principles

- **Purposeful**: Every animation communicates a state change. No decorative motion.
- **Fast**: Most transitions are 150-200ms. Video editors work fast and expect instant feedback.
- **Reducible**: All animations respect `prefers-reduced-motion`. Critical state changes use opacity fades only.

### Animation Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion-fast` | 100ms | ease-out | Button hover, focus ring, icon state |
| `motion-normal` | 200ms | ease-in-out | Panel transitions, dropdown open, card hover lift |
| `motion-slow` | 300ms | ease-in-out | Modal open/close, drawer slide, overlay fade |
| `motion-playhead` | 16ms | linear | Playhead movement during playback (60fps sync) |

### Key Animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Panel resize | Width/height transition | 100ms | ease-out |
| Dropdown open | Opacity 0->1, translateY(-4px)->0 | 150ms | ease-out |
| Modal open | Opacity 0->1, scale(0.95)->1 | 200ms | ease-out |
| Modal close | Opacity 1->0, scale(1)->0.95 | 150ms | ease-in |
| Toast notification | Slide in from right, 5s hold, slide out | 300ms in, 200ms out | ease-in-out |
| AI processing | Gradient border rotation (infinite) | 2000ms per rotation | linear |
| Render progress | Width expansion (smooth) | 300ms | ease |
| Card hover lift | translateY(-2px), shadow increase | 200ms | ease-out |
| Skeleton shimmer | Background position sweep | 1500ms | linear, infinite |
| Export complete | Scale(0.8)->1 with spring, checkmark draw | 400ms | spring(1, 80, 10) |

---

## Shadows & Elevation

| Level | Shadow | Usage |
|---|---|---|
| **Level 0** | None | Flat elements (timeline tracks, transcript text) |
| **Level 1** | `0 1px 3px rgba(0,0,0,0.3)` | Cards, buttons |
| **Level 2** | `0 4px 12px rgba(0,0,0,0.4)` | Dropdowns, elevated panels, hover cards |
| **Level 3** | `0 8px 24px rgba(0,0,0,0.5)` | Modals, popovers, command palette |
| **Level 4** | `0 16px 48px rgba(0,0,0,0.6)` | Full-screen overlays |

---

## Scrollbar Styling

```css
/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #252538;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}

/* Timeline horizontal scrollbar -- always visible */
.timeline-scroll::-webkit-scrollbar {
  height: 6px;
}

/* Transcript scrollbar -- appears on hover only */
.transcript-panel::-webkit-scrollbar-thumb {
  background: transparent;
}
.transcript-panel:hover::-webkit-scrollbar-thumb {
  background: #252538;
}
```

---

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors */
  --color-primary: #7C3AED;
  --color-secondary: #06B6D4;
  --color-bg: #0A0A0F;
  --color-surface: #161622;
  --color-surface-elevated: #1E1E2E;
  --color-surface-hover: #252538;
  --color-playhead: #EF4444;
  --color-waveform: #10B981;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-tertiary: #64748B;
  --color-text-inverse: #0F172A;
  --color-selection: rgba(124, 58, 237, 0.3);
  --color-hover: rgba(124, 58, 237, 0.15);
  --color-ai-glow: rgba(6, 182, 212, 0.2);
  --color-focus: #7C3AED;

  /* Typography */
  --font-heading: "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", "SF Mono", "Fira Code", monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-2: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-3: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-4: 0 16px 48px rgba(0, 0, 0, 0.6);

  /* Motion */
  --motion-fast: 100ms ease-out;
  --motion-normal: 200ms ease-in-out;
  --motion-slow: 300ms ease-in-out;

  /* Z-index layers */
  --z-base: 0;
  --z-panel: 10;
  --z-playhead: 20;
  --z-dropdown: 30;
  --z-modal: 40;
  --z-toast: 50;
  --z-tooltip: 60;
}
```

---

## Tailwind CSS Configuration

```js
// tailwind.config.js (relevant excerpt)
module.exports = {
  darkMode: 'class', // always dark
  theme: {
    extend: {
      colors: {
        vault: {
          primary: '#7C3AED',
          secondary: '#06B6D4',
          bg: '#0A0A0F',
          surface: '#161622',
          'surface-elevated': '#1E1E2E',
          'surface-hover': '#252538',
          playhead: '#EF4444',
          waveform: '#10B981',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          inverse: '#0F172A',
        },
      },
      fontFamily: {
        heading: ['Geist Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
}
```

---

*Dark by default. Dense by design. Every pixel serves the creator.*
