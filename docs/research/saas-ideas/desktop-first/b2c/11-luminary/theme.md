# Luminary -- Theme & Design System

> Brand identity, color palette, typography, spacing, and component styling for a dark-mode-only AI music production companion.

---

## Brand Personality

Luminary's brand personality exists at the intersection of four traits:

| Trait | Expression |
|---|---|
| **Creative** | The app inspires exploration and experimentation. UI encourages "what if?" moments. |
| **Inspiring** | Every interaction should feel like a creative spark. Subtle animations, glowing accents. |
| **Nocturnal** | Music producers work late at night. The visual language is dark, moody, and atmospheric. |
| **Professional-yet-approachable** | Serious enough for experienced producers, welcoming enough for beginners. Not intimidating. |

### Brand Voice

- **Suggestions**: Conversational but knowledgeable. "Try a Dm7 here -- it creates a nice ii-V-I cadence" not "The optimal harmonic choice is..."
- **Errors**: Honest and helpful. "Could not detect the key -- try a longer audio clip" not "Error 404: Analysis failed"
- **Empty states**: Encouraging. "Drop an audio file here and let's get started" not "No files loaded"
- **Celebrations**: Understated. A subtle glow, not confetti. Producers are in a flow state.

---

## Color Palette

### Dark Mode Only

Luminary is dark mode only. Music producers universally work in dark environments -- dark studios, late nights, screens at low brightness. A light mode would be jarring and out of place.

### Core Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Deep Purple** (Primary) | `#6C2BD9` | 108, 43, 217 | Primary buttons, active states, selected items, brand accent |
| **Electric Cyan** (Accent) | `#06D6A0` | 6, 214, 160 | Success states, active connections, "accepted" indicators, BPM/key badges |
| **Warm Coral** (Warning/Energy) | `#FF6B6B` | 255, 107, 107 | Warnings, critical mix issues, energy indicators, clip alerts |
| **Dark Background** | `#0D0D1A` | 13, 13, 26 | Main application background, deepest layer |
| **Surface** | `#1A1A2E` | 26, 26, 46 | Cards, panels, elevated surfaces |
| **Surface Elevated** | `#252540` | 37, 37, 64 | Hover states, active panels, modal backgrounds |
| **Muted Lavender** (Text Primary) | `#B8B8D4` | 184, 184, 212 | Primary body text, labels |
| **Bright White** (Text Emphasis) | `#E8E8F0` | 232, 232, 240 | Headings, emphasized text, active labels |
| **Dim Gray** (Text Muted) | `#6B6B8D` | 107, 107, 141 | Secondary text, timestamps, metadata |
| **Border** | `#2A2A45` | 42, 42, 69 | Panel borders, dividers, input outlines |

### Extended Palette

| Name | Hex | Usage |
|---|---|---|
| **Purple Light** | `#8B5CF6` | Hover state for primary elements |
| **Purple Dark** | `#5521B5` | Pressed state for primary elements |
| **Purple Glow** | `#6C2BD940` | Subtle glow effect behind primary elements (40% opacity) |
| **Cyan Light** | `#34D399` | Hover state for success elements |
| **Cyan Glow** | `#06D6A020` | Subtle glow for active indicators (20% opacity) |
| **Coral Light** | `#FCA5A5` | Hover state for warning elements |
| **Coral Glow** | `#FF6B6B20` | Subtle glow for critical alerts (20% opacity) |
| **Gold** | `#FBBF24` | Pro tier badge, premium features indicator |
| **Blue Info** | `#60A5FA` | Informational tooltips, learning content |

### Semantic Colors

| Purpose | Color | Hex |
|---|---|---|
| **Success / Accepted** | Electric Cyan | `#06D6A0` |
| **Warning / Issue** | Warm Coral | `#FF6B6B` |
| **Info / Learning** | Blue | `#60A5FA` |
| **Active / Selected** | Deep Purple | `#6C2BD9` |
| **Neutral / Default** | Muted Lavender | `#B8B8D4` |
| **Disabled** | Dim Gray | `#6B6B8D` |
| **Destructive** | Red | `#EF4444` |

### Frequency Band Colors (Spectrum Analyzer)

| Band | Range | Color | Hex |
|---|---|---|---|
| Sub | 20-60 Hz | Deep Red | `#DC2626` |
| Low | 60-250 Hz | Orange | `#F97316` |
| Low-Mid | 250-500 Hz | Yellow | `#EAB308` |
| Mid | 500-2kHz | Green | `#22C55E` |
| High-Mid | 2k-6kHz | Cyan | `#06B6D4` |
| High | 6k-20kHz | Purple | `#8B5CF6` |

---

## Typography

### Font Stack

| Purpose | Font | Weight | Fallback |
|---|---|---|---|
| **Headings** | Space Grotesk | 600 (SemiBold), 700 (Bold) | system-ui, sans-serif |
| **Body Text** | Inter | 400 (Regular), 500 (Medium) | system-ui, sans-serif |
| **Technical Values** | JetBrains Mono | 400 (Regular), 500 (Medium) | monospace |

### Why These Fonts

- **Space Grotesk**: Geometric sans-serif with a technical, modern feel. Used by many developer/creative tools. The slightly rounded terminals feel approachable without being casual.
- **Inter**: Designed specifically for screens, excellent legibility at small sizes. Critical for dense DAW-style layouts where body text is often 12-13px.
- **JetBrains Mono**: Monospace font for technical data (BPM, frequency values, MIDI notes). The ligatures and distinct character shapes prevent misreading numbers like "128.5 BPM" or "-14.2 LUFS".

### Type Scale

| Name | Size | Line Height | Weight | Font | Usage |
|---|---|---|---|---|---|
| **Display** | 28px | 36px | 700 | Space Grotesk | Onboarding headlines |
| **H1** | 22px | 28px | 700 | Space Grotesk | Screen titles |
| **H2** | 18px | 24px | 600 | Space Grotesk | Section headers |
| **H3** | 15px | 20px | 600 | Space Grotesk | Panel titles, card headers |
| **Body** | 14px | 20px | 400 | Inter | Default body text |
| **Body Small** | 13px | 18px | 400 | Inter | Dense UI areas, descriptions |
| **Caption** | 11px | 16px | 400 | Inter | Timestamps, metadata, labels |
| **Technical** | 14px | 20px | 500 | JetBrains Mono | BPM, key, frequency, LUFS values |
| **Technical Small** | 12px | 16px | 400 | JetBrains Mono | MIDI note numbers, dB values |
| **Button** | 13px | 18px | 500 | Inter | Button labels |

### Font Loading Strategy

All three fonts are bundled with the Electron app (not loaded from CDN). This ensures:
- Zero FOUT (Flash of Unstyled Text)
- Offline availability
- Consistent rendering across macOS and Windows

Estimated font bundle size: ~400KB total (variable fonts for Space Grotesk and Inter, static weights for JetBrains Mono).

---

## Spacing System

Optimized for dense information display. Music production UIs pack more information per pixel than typical web apps.

### Base Unit: 4px

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Minimum gap, icon-text spacing in badges |
| `space-2` | 8px | Tight spacing, between related items |
| `space-3` | 12px | Default padding inside small components |
| `space-4` | 16px | Default padding inside cards and panels |
| `space-5` | 20px | Section spacing within a panel |
| `space-6` | 24px | Major section dividers |
| `space-8` | 32px | Panel-level spacing |
| `space-10` | 40px | Screen-level top/bottom padding |
| `space-12` | 48px | Generous spacing for breathing room |
| `space-16` | 64px | Maximum spacing (onboarding, empty states) |

### Panel & Card Spacing

```
+-- Panel (padding: space-4 = 16px) ---------------------------+
|                                                                |
|  +-- Card (padding: space-3 = 12px) ------+                  |
|  |  H3: Card Title                        |                  |
|  |  (margin-bottom: space-2 = 8px)        |                  |
|  |  Body text content here.               |                  |
|  |  (margin-bottom: space-3 = 12px)       |                  |
|  |  [Button]  [Button]                    |                  |
|  |  (gap: space-2 = 8px)                  |                  |
|  +----------------------------------------+                  |
|  (margin-bottom: space-3 = 12px)                              |
|  +-- Card --+                                                 |
|  |  ...     |                                                 |
|  +----------+                                                 |
+---------------------------------------------------------------+
```

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, chips, small buttons |
| `radius-md` | 6px | Cards, inputs, dropdowns |
| `radius-lg` | 8px | Panels, modals |
| `radius-xl` | 12px | Large cards, onboarding elements |
| `radius-full` | 9999px | Pills, circular buttons, avatars |

---

## Shadows & Elevation

Since the app is dark-mode-only, traditional box shadows are barely visible. Instead, Luminary uses **glow effects** and **border highlighting** for elevation.

| Level | Technique | Usage |
|---|---|---|
| **Level 0** (Base) | No shadow, `#0D0D1A` background | Main background |
| **Level 1** (Surface) | `#1A1A2E` background, 1px `#2A2A45` border | Cards, panels |
| **Level 2** (Elevated) | `#252540` background, 1px `#2A2A45` border | Active panels, dropdowns |
| **Level 3** (Modal) | `#252540` background, `0 0 40px rgba(0,0,0,0.5)` shadow | Modals, overlays |
| **Glow** (Interactive) | `0 0 20px rgba(108, 43, 217, 0.25)` | Hovered primary elements, active states |

---

## Icon Library: Lucide React

Luminary uses [Lucide React](https://lucide.dev/) for all icons. Lucide provides clean, consistent SVG icons with a 24x24 grid.

### Icon Sizing

| Context | Size | Stroke Width |
|---|---|---|
| Navigation sidebar | 20px | 1.5px |
| Inline with text | 16px | 1.5px |
| Button icons | 16px | 2px |
| Feature icons (cards) | 24px | 1.5px |
| Empty state illustrations | 48px | 1px |

### Key Icons Used

| Icon Name | Usage |
|---|---|
| `Music` | Chord Lab navigation |
| `AudioWaveform` | Melody Generator navigation |
| `LayoutGrid` | Arrangement View |
| `SlidersHorizontal` | Mix Console |
| `Volume2` | Master Bus |
| `FolderOpen` | Sample Browser |
| `Library` | Project Library |
| `GraduationCap` | Learning Center |
| `Settings` | Settings |
| `User` | Account |
| `Play`, `Pause`, `SkipForward`, `SkipBack` | Transport controls |
| `Check`, `X`, `AlertTriangle` | Suggestion actions |
| `Download` | Export |
| `Upload` | Import |
| `Wifi`, `WifiOff` | Connection status |

---

## Component Styling

### Chord Card

```css
.chord-card {
  background: #1A1A2E;
  border: 1px solid #2A2A45;
  border-radius: 6px;
  padding: 12px 16px;
  min-width: 80px;
  text-align: center;
  cursor: pointer;
  transition: all 150ms ease;
}

.chord-card:hover {
  background: #252540;
  border-color: #6C2BD9;
  box-shadow: 0 0 16px rgba(108, 43, 217, 0.2);
}

.chord-card.selected {
  background: #252540;
  border-color: #6C2BD9;
  box-shadow: 0 0 20px rgba(108, 43, 217, 0.3);
}

.chord-card .chord-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #E8E8F0;
}

.chord-card .chord-numeral {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #6B6B8D;
  margin-top: 4px;
}
```

### Waveform Display

```css
.waveform-container {
  background: #0D0D1A;
  border: 1px solid #2A2A45;
  border-radius: 6px;
  padding: 8px;
  position: relative;
  overflow: hidden;
}

.waveform-canvas {
  width: 100%;
  height: 80px;
}

/* Waveform rendered via Canvas API */
/* Colors: #6C2BD9 (positive), #5521B5 (negative), #6C2BD940 (fill) */

.waveform-playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #06D6A0;
  box-shadow: 0 0 8px rgba(6, 214, 160, 0.5);
}
```

### Mixing Meter (Level)

```css
.meter-container {
  width: 12px;
  height: 200px;
  background: #0D0D1A;
  border: 1px solid #2A2A45;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.meter-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Gradient from green (bottom) to yellow (mid) to red (top) */
  background: linear-gradient(
    to top,
    #22C55E 0%,
    #22C55E 60%,
    #EAB308 60%,
    #EAB308 85%,
    #EF4444 85%,
    #EF4444 100%
  );
  transition: height 50ms linear;
}

.meter-peak {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #E8E8F0;
  /* Peak hold: stays at highest point for 1.5s, then falls */
}

.meter-clip-indicator {
  position: absolute;
  top: 0;
  width: 100%;
  height: 4px;
  background: #EF4444;
  opacity: 0;
}

.meter-clip-indicator.clipping {
  opacity: 1;
  animation: clip-flash 200ms ease-in-out;
}
```

### Transport Controls

```css
.transport-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1A1A2E;
  border: 1px solid #2A2A45;
  border-radius: 8px;
}

.transport-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #B8B8D4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.transport-button:hover {
  background: #252540;
  color: #E8E8F0;
}

.transport-button.active {
  background: #6C2BD9;
  color: #FFFFFF;
  box-shadow: 0 0 12px rgba(108, 43, 217, 0.4);
}

.transport-bpm {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #06D6A0;
  padding: 4px 8px;
  background: #0D0D1A;
  border: 1px solid #2A2A45;
  border-radius: 4px;
}
```

### Suggestion Card

```css
.suggestion-card {
  background: #1A1A2E;
  border: 1px solid #2A2A45;
  border-left: 3px solid #6C2BD9;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 150ms ease;
}

.suggestion-card:hover {
  background: #252540;
}

.suggestion-card .type-badge {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #6C2BD9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-card .text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #E8E8F0;
  margin: 8px 0;
}

.suggestion-card .actions {
  display: flex;
  gap: 8px;
}

.suggestion-card .action-accept {
  color: #06D6A0;
  font-size: 13px;
  cursor: pointer;
}

.suggestion-card .action-reject {
  color: #6B6B8D;
  font-size: 13px;
  cursor: pointer;
}

.suggestion-card.accepted {
  border-left-color: #06D6A0;
  opacity: 0.7;
}

.suggestion-card.rejected {
  opacity: 0.3;
  height: 0;
  padding: 0;
  overflow: hidden;
  transition: all 300ms ease;
}
```

### Knob Control

```css
.knob {
  width: 40px;
  height: 40px;
  position: relative;
  cursor: grab;
}

.knob-track {
  /* SVG arc, 270 degrees */
  stroke: #2A2A45;
  stroke-width: 3;
  fill: none;
}

.knob-value {
  /* SVG arc, proportional to value */
  stroke: #6C2BD9;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
}

.knob-indicator {
  /* Small dot at current position */
  fill: #E8E8F0;
  r: 3px;
}

.knob-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #6B6B8D;
  text-align: center;
  margin-top: 4px;
}

.knob-value-display {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #B8B8D4;
  text-align: center;
}
```

---

## Animation & Motion

### Principles

- **Subtle over dramatic**: Producers are in a flow state. Animations should enhance, not distract.
- **Fast transitions**: 100-200ms for UI transitions. Nothing should feel sluggish.
- **Audio-responsive**: Some elements can subtly pulse or glow in response to audio playback.
- **Reduced motion**: Respect `prefers-reduced-motion` system setting. Provide a toggle in Settings.

### Timing Defaults

| Type | Duration | Easing |
|---|---|---|
| Hover state | 100ms | ease |
| Panel open/close | 200ms | ease-out |
| Modal appear | 200ms | ease-out |
| Modal dismiss | 150ms | ease-in |
| Suggestion card slide-in | 300ms | ease-out |
| Suggestion card dismiss | 200ms | ease-in |
| Toast notification | 300ms in, 200ms out | ease |
| Glow pulse (idle) | 2000ms | ease-in-out (infinite) |

### Key Animations

| Element | Animation |
|---|---|
| **Active chord** | Subtle purple glow pulse (2s cycle) |
| **Playhead** | Smooth horizontal translation (synced to BPM) |
| **Meter levels** | 50ms linear transitions (smooth but responsive) |
| **Suggestion appear** | Slide in from left, fade in (300ms) |
| **Suggestion accept** | Border color transition to cyan (200ms) |
| **Suggestion reject** | Collapse height to 0, fade out (200ms) |
| **DAW connected** | Green dot pulse once (500ms) |
| **Generation loading** | Subtle music note particles floating upward |

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class', // Always dark
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#6C2BD9',
          light: '#8B5CF6',
          dark: '#5521B5',
          glow: 'rgba(108, 43, 217, 0.25)',
        },
        cyan: {
          DEFAULT: '#06D6A0',
          light: '#34D399',
          glow: 'rgba(6, 214, 160, 0.2)',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FCA5A5',
          glow: 'rgba(255, 107, 107, 0.2)',
        },
        bg: {
          deep: '#0D0D1A',
          surface: '#1A1A2E',
          elevated: '#252540',
        },
        text: {
          primary: '#B8B8D4',
          bright: '#E8E8F0',
          muted: '#6B6B8D',
        },
        border: {
          DEFAULT: '#2A2A45',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-in': 'slide-in 300ms ease-out',
        'fade-out': 'fade-out 200ms ease-in forwards',
      },
    },
  },
};
```

---

*Luminary's design language speaks the visual vocabulary of the studio -- dark, focused, precise, and quietly beautiful.*
