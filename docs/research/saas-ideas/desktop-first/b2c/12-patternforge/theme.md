# PatternForge -- Theme & Design System

## Brand Personality

| Trait | Description | Expression |
|---|---|---|
| **Innovative** | Cutting-edge AI meets physical fabrication | Futuristic but grounded design language; glowing accents on dark surfaces |
| **Maker-Spirited** | Born from the maker community, respects craft | Authentic, workshop-inspired textures; tool-like UI components |
| **Precision-Focused** | Engineering accuracy matters for printing | Monospace numerals, grid-aligned layouts, exact measurements displayed |
| **Accessible** | Complex technology made simple for everyone | Clean hierarchy, generous spacing, clear iconography, beginner-friendly defaults |

### Brand Voice

- **Tone:** Confident, helpful, direct -- like a knowledgeable friend in a maker space
- **Language:** Plain English, avoids jargon unless user sets "Expert" mode
- **Error Messages:** Constructive and specific ("Wall thickness is 0.3mm -- increase to at least 0.8mm for FDM printing")
- **Celebrations:** Subtle and satisfying (brief animation when design generates, not confetti)

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Forge Orange** | `#F97316` | 249, 115, 22 | Primary CTAs, active states, brand accent, generation progress |
| **Forge Orange Hover** | `#EA580C` | 234, 88, 12 | Hover state for orange elements |
| **Forge Orange Light** | `#FED7AA` | 254, 215, 170 | Orange tint for light backgrounds, selection highlights |
| **Forge Orange Subtle** | `#F973161A` | 249, 115, 22 (10% alpha) | Subtle orange backgrounds, active tab indicators |

### Accent Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Steel Blue** | `#3B82F6` | 59, 130, 246 | Secondary accent, links, Z-axis, info states |
| **Steel Blue Hover** | `#2563EB` | 37, 99, 235 | Hover state for blue elements |
| **Steel Blue Light** | `#BFDBFE` | 191, 219, 254 | Light blue for backgrounds, selection |
| **Steel Blue Subtle** | `#3B82F61A` | 59, 130, 246 (10% alpha) | Subtle blue backgrounds |

### Workspace Colors (Dark Mode -- Default)

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Workspace Background** | `#111827` | 17, 24, 39 | Main application background, viewport background |
| **Surface / Panel** | `#1F2937` | 31, 41, 55 | Sidebar panels, chat panel, parameter panels |
| **Surface Elevated** | `#374151` | 55, 65, 81 | Cards, dropdowns, tooltips, elevated elements |
| **Surface Hover** | `#4B5563` | 75, 85, 99 | Hover states on surfaces |
| **Grid Lines** | `#374151` | 55, 65, 81 | 3D viewport grid, divider lines |
| **Grid Lines Subtle** | `#1F2937` | 31, 41, 55 | Minor grid lines in viewport |
| **Border** | `#374151` | 55, 65, 81 | Panel borders, input borders |
| **Border Focus** | `#F97316` | 249, 115, 22 | Focused input borders, active panel indicators |

### Text Colors (Dark Mode)

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Text Primary** | `#F9FAFB` | 249, 250, 251 | Headings, primary content |
| **Text Secondary** | `#D1D5DB` | 209, 213, 219 | Body text, descriptions |
| **Text Tertiary** | `#9CA3AF` | 156, 163, 175 | Placeholder text, timestamps, metadata |
| **Text Disabled** | `#6B7280` | 107, 114, 128 | Disabled states |
| **Text Inverse** | `#111827` | 17, 24, 39 | Text on orange/light backgrounds |

### Semantic Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Success Green** | `#10B981` | 16, 185, 129 | Printability pass, generation complete, check icons |
| **Success Green BG** | `#10B98120` | 16, 185, 129 (12% alpha) | Success notification background |
| **Warning Amber** | `#FBBF24` | 251, 191, 36 | Printability warnings, overhang alerts |
| **Warning Amber BG** | `#FBBF2420` | 251, 191, 36 (12% alpha) | Warning notification background |
| **Error Red** | `#EF4444` | 239, 68, 68 | Printability errors, validation failures, X-axis |
| **Error Red BG** | `#EF444420` | 239, 68, 68 (12% alpha) | Error notification background |
| **Info Blue** | `#3B82F6` | 59, 130, 246 | Info notifications, support suggestions |
| **Info Blue BG** | `#3B82F620` | 59, 130, 246 (12% alpha) | Info notification background |

### 3D Viewport Axis Colors

| Axis | Color | Hex | Convention |
|---|---|---|---|
| **X-Axis** | Red | `#EF4444` | Standard CAD convention (right/left) |
| **Y-Axis** | Green | `#22C55E` | Standard CAD convention (up/down in Three.js) |
| **Z-Axis** | Blue | `#3B82F6` | Standard CAD convention (forward/back in Three.js) |
| **X-Axis Muted** | Light Red | `#EF444480` | Grid axis lines (50% alpha) |
| **Y-Axis Muted** | Light Green | `#22C55E80` | Grid axis lines (50% alpha) |
| **Z-Axis Muted** | Light Blue | `#3B82F680` | Grid axis lines (50% alpha) |

### Printability Heatmap Colors

| Score Range | Color | Hex | Meaning |
|---|---|---|---|
| 90-100 | Green | `#10B981` | Excellent -- will print without issues |
| 70-89 | Yellow-Green | `#84CC16` | Good -- minor considerations |
| 50-69 | Amber | `#FBBF24` | Fair -- modifications recommended |
| 30-49 | Orange | `#F97316` | Poor -- likely to fail |
| 0-29 | Red | `#EF4444` | Critical -- will not print successfully |

---

## Light Mode (Alternative)

While dark mode is the default (matching CAD convention and reducing eye strain during long design sessions), light mode is available.

### Light Mode Colors

| Name | Hex | Usage |
|---|---|---|
| Background | `#FFFFFF` | Main background |
| Surface | `#F9FAFB` | Panels |
| Surface Elevated | `#F3F4F6` | Cards, dropdowns |
| Border | `#E5E7EB` | Borders |
| Text Primary | `#111827` | Headings |
| Text Secondary | `#374151` | Body text |
| Text Tertiary | `#6B7280` | Placeholder, metadata |
| Viewport Background | `#E5E7EB` | 3D viewport (light gray) |
| Grid Lines | `#D1D5DB` | Viewport grid |

All semantic, accent, and axis colors remain the same in light mode.

---

## Typography

### Font Families

| Font | Usage | Weight Range | Fallback |
|---|---|---|---|
| **Outfit** | Headings, navigation labels, feature titles | 500 (Medium), 600 (SemiBold), 700 (Bold) | system-ui, sans-serif |
| **Inter** | Body text, descriptions, chat messages, form labels | 400 (Regular), 500 (Medium), 600 (SemiBold) | system-ui, sans-serif |
| **IBM Plex Mono** | Dimensions, coordinates, measurements, code, parameters | 400 (Regular), 500 (Medium) | monospace |

### Type Scale

| Name | Size | Line Height | Weight | Font | Usage |
|---|---|---|---|---|---|
| **Display** | 32px | 40px | 700 Bold | Outfit | Welcome screen hero, empty states |
| **H1** | 24px | 32px | 700 Bold | Outfit | Page titles (Settings, Gallery) |
| **H2** | 20px | 28px | 600 SemiBold | Outfit | Section headings |
| **H3** | 16px | 24px | 600 SemiBold | Outfit | Card titles, panel headers |
| **H4** | 14px | 20px | 600 SemiBold | Outfit | Sub-section headers |
| **Body Large** | 16px | 24px | 400 Regular | Inter | Chat messages, descriptions |
| **Body** | 14px | 20px | 400 Regular | Inter | Default body text, form labels |
| **Body Small** | 13px | 18px | 400 Regular | Inter | Secondary info, timestamps |
| **Caption** | 12px | 16px | 400 Regular | Inter | Metadata, hints, helper text |
| **Overline** | 11px | 16px | 600 SemiBold | Inter | Category labels, section markers (uppercase + tracking) |
| **Dimension** | 13px | 16px | 500 Medium | IBM Plex Mono | Dimension values (100mm), coordinates |
| **Dimension Large** | 16px | 20px | 500 Medium | IBM Plex Mono | Large dimension annotations in viewport |
| **Parameter** | 14px | 20px | 400 Regular | IBM Plex Mono | Parameter values in edit panel |
| **Code** | 13px | 18px | 400 Regular | IBM Plex Mono | OpenSCAD script preview, technical output |

### Typography Examples

```css
/* Heading: Page Title */
.page-title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: #F9FAFB;
  letter-spacing: -0.01em;
}

/* Body: Chat Message */
.chat-message {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #D1D5DB;
}

/* Dimension: Viewport Annotation */
.dimension-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #F9FAFB;
  background: rgba(17, 24, 39, 0.85);
  padding: 2px 6px;
  border-radius: 3px;
}
```

---

## Spacing System

Based on a 4px grid system:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight spacing (icon-to-text) |
| `space-2` | 8px | Default element spacing |
| `space-3` | 12px | Form element padding |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | Panel padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Page-level spacing |
| `space-12` | 48px | Hero spacing |
| `space-16` | 64px | Major layout gaps |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Small buttons, badges, tags |
| `radius-md` | 6px | Inputs, standard buttons |
| `radius-lg` | 8px | Cards, panels, dropdowns |
| `radius-xl` | 12px | Modal dialogs, large cards |
| `radius-2xl` | 16px | Onboarding cards, hero sections |
| `radius-full` | 9999px | Pill buttons, avatars, circular elements |

---

## Shadows (Dark Mode)

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation (buttons) |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Modals, floating panels |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.6)` | Overlay dialogs |
| `shadow-glow-orange` | `0 0 20px rgba(249,115,22,0.3)` | Active/generating state glow |
| `shadow-glow-blue` | `0 0 15px rgba(59,130,246,0.2)` | Info/support highlight glow |

---

## Icon Library

### Primary: Tabler Icons

| Attribute | Detail |
|---|---|
| Library | Tabler Icons (https://tabler.io/icons) |
| Style | Outline (default), Filled (active states) |
| Size | 20px (default), 16px (small), 24px (large) |
| Stroke Width | 1.5px (default), 2px (emphasis) |
| Color | Inherits text color, semantic colors for status icons |
| License | MIT |

### Icon Usage Map

| Context | Icon Name | Usage |
|---|---|---|
| Design Studio | `cube` + `sparkles` | Nav icon for main workspace |
| My Designs | `layout-grid` | Nav icon for design gallery |
| Marketplace | `building-store` | Nav icon for community marketplace |
| Learn | `school` | Nav icon for tutorials |
| Settings | `settings` | Nav icon for settings |
| Generate | `wand` | Generate/create button |
| Export | `download` | Export/download action |
| Print Settings | `printer` | Print configuration |
| Undo | `arrow-back-up` | Undo action |
| Redo | `arrow-forward-up` | Redo action |
| Wireframe | `box` | Wireframe view mode |
| Solid | `box-model` | Solid view mode |
| X-ray | `eye` | X-ray transparency mode |
| Printability | `shield-check` | Printability check mode |
| Zoom Fit | `arrows-maximize` | Zoom to fit model |
| Grid Toggle | `grid-dots` | Toggle grid visibility |
| Favorite | `star` / `star-filled` | Favorite toggle |
| Delete | `trash` | Delete action |
| Duplicate | `copy` | Duplicate action |
| Share | `share` | Share action |
| Search | `search` | Search input |
| Close | `x` | Close/dismiss |
| Menu | `menu-2` | Hamburger menu |
| Chat Send | `send` | Send chat message |
| Microphone | `microphone` | Voice input |
| Camera | `camera` | Image upload |
| Check | `circle-check` | Success/complete |
| Warning | `alert-triangle` | Warning state |
| Error | `circle-x` | Error state |
| Info | `info-circle` | Information |
| Dimension | `ruler-2` | Measurement/dimension tool |
| Rotate | `rotate` | Rotate view |

---

## Component Styling

### Buttons

```css
/* Primary Button (Forge Orange) */
.btn-primary {
  background: #F97316;
  color: #111827;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}
.btn-primary:hover {
  background: #EA580C;
}
.btn-primary:active {
  background: #C2410C;
}
.btn-primary:disabled {
  background: #374151;
  color: #6B7280;
  cursor: not-allowed;
}

/* Secondary Button */
.btn-secondary {
  background: #1F2937;
  color: #D1D5DB;
  border: 1px solid #374151;
  /* Same spacing and typography as primary */
}
.btn-secondary:hover {
  background: #374151;
  color: #F9FAFB;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #9CA3AF;
  border: none;
}
.btn-ghost:hover {
  background: #1F2937;
  color: #F9FAFB;
}

/* Danger Button */
.btn-danger {
  background: transparent;
  color: #EF4444;
  border: 1px solid #EF444440;
}
.btn-danger:hover {
  background: #EF444420;
}
```

### Viewport Controls

```css
/* View Mode Toggle Group */
.view-mode-group {
  display: flex;
  background: #1F2937;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}
.view-mode-btn {
  padding: 6px 12px;
  border-radius: 4px;
  color: #9CA3AF;
  font-size: 13px;
  background: transparent;
  border: none;
}
.view-mode-btn.active {
  background: #374151;
  color: #F9FAFB;
}
.view-mode-btn:hover:not(.active) {
  color: #D1D5DB;
}
```

### Dimension Labels (3D Viewport Overlay)

```css
/* Dimension annotation in 3D viewport */
.dimension-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: #F9FAFB;
  background: rgba(17, 24, 39, 0.85);
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid #374151;
  white-space: nowrap;
  pointer-events: none; /* Non-interactive in viewport */
}

/* Dimension line (SVG overlay) */
.dimension-line {
  stroke: #9CA3AF;
  stroke-width: 1;
  stroke-dasharray: 4 2;
}

/* Dimension arrow endpoints */
.dimension-arrow {
  fill: #9CA3AF;
}
```

### Printability Score Badge

```css
/* Printability score badge */
.printability-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 500;
}

/* Score variants */
.printability-badge.excellent {
  background: #10B98120;
  color: #10B981;
  border: 1px solid #10B98140;
}
.printability-badge.good {
  background: #84CC1620;
  color: #84CC16;
  border: 1px solid #84CC1640;
}
.printability-badge.fair {
  background: #FBBF2420;
  color: #FBBF24;
  border: 1px solid #FBBF2440;
}
.printability-badge.poor {
  background: #F9731620;
  color: #F97316;
  border: 1px solid #F9731640;
}
.printability-badge.critical {
  background: #EF444420;
  color: #EF4444;
  border: 1px solid #EF444440;
}
```

### Chat Panel

```css
/* Chat container */
.chat-panel {
  background: #1F2937;
  border-left: 1px solid #374151;
  display: flex;
  flex-direction: column;
  min-width: 280px;
  max-width: 500px;
}

/* User message bubble */
.chat-bubble-user {
  background: #374151;
  color: #F9FAFB;
  padding: 10px 14px;
  border-radius: 12px 12px 4px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 20px;
  max-width: 85%;
  align-self: flex-end;
}

/* AI message bubble */
.chat-bubble-ai {
  background: #111827;
  color: #D1D5DB;
  padding: 10px 14px;
  border-radius: 12px 12px 12px 4px;
  border: 1px solid #374151;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 20px;
  max-width: 85%;
  align-self: flex-start;
}

/* Chat input */
.chat-input {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
  color: #F9FAFB;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  resize: none;
}
.chat-input:focus {
  border-color: #F97316;
  outline: none;
  box-shadow: 0 0 0 2px #F973161A;
}
```

### Parameter Panel

```css
/* Parameter input field */
.param-input {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 4px;
  color: #F9FAFB;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  padding: 6px 8px;
  width: 80px;
  text-align: right;
}
.param-input:focus {
  border-color: #F97316;
  outline: none;
}

/* Parameter label */
.param-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #9CA3AF;
}

/* Parameter unit suffix */
.param-unit {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6B7280;
  margin-left: 4px;
}

/* Parameter slider */
.param-slider {
  accent-color: #F97316;
  width: 100%;
  height: 4px;
}
```

### Design Cards (Gallery / Marketplace)

```css
/* Design card */
.design-card {
  background: #1F2937;
  border: 1px solid #374151;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.design-card:hover {
  border-color: #4B5563;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}

/* Card thumbnail area */
.design-card-thumbnail {
  background: #111827;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card content area */
.design-card-content {
  padding: 12px;
}

/* Card title */
.design-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #F9FAFB;
  margin-bottom: 4px;
}

/* Card metadata */
.design-card-meta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #9CA3AF;
}
```

### Toast Notifications

```css
/* Toast container */
.toast {
  background: #1F2937;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #374151;
  min-width: 320px;
  max-width: 480px;
}

/* Toast variants (left accent border) */
.toast.success { border-left: 3px solid #10B981; }
.toast.warning { border-left: 3px solid #FBBF24; }
.toast.error   { border-left: 3px solid #EF4444; }
.toast.info    { border-left: 3px solid #3B82F6; }
```

---

## 3D Viewport Specific Styling

### Viewport Background

| Mode | Color | Description |
|---|---|---|
| Dark (default) | `#111827` | Neutral dark, matches workspace |
| Light | `#E5E7EB` | Light gray for light mode |
| Gradient (optional) | `#111827` to `#1F2937` | Subtle gradient for depth |

### Grid

| Element | Color | Description |
|---|---|---|
| Major grid lines | `#374151` | Every 10mm (configurable) |
| Minor grid lines | `#1F2937` | Every 1mm (visible at high zoom) |
| X-axis line | `#EF444480` | Red, 50% alpha |
| Z-axis line | `#3B82F680` | Blue, 50% alpha (forward/back) |
| Grid plane | `#1F293740` | Subtle ground plane fill |

### Model Material Preview

| Material | Base Color | Roughness | Metalness | Notes |
|---|---|---|---|---|
| PLA (default) | `#D1D5DB` | 0.7 | 0.0 | Matte, slightly warm |
| PLA (colored) | User-selected | 0.7 | 0.0 | Same roughness, different hue |
| PETG | `#D1D5DB` | 0.4 | 0.0 | Semi-glossy |
| ABS | `#D1D5DB` | 0.6 | 0.0 | Slightly less matte than PLA |
| Resin | `#D1D5DB` | 0.2 | 0.0 | Glossy, smooth |
| TPU | `#D1D5DB` | 0.8 | 0.0 | Very matte, flexible look |

### Viewport Lighting Setup

```javascript
// Three.js viewport lighting configuration
const lightingSetup = {
  ambient: {
    color: '#FFFFFF',
    intensity: 0.4,
  },
  directional: {
    color: '#FFFFFF',
    intensity: 0.8,
    position: [5, 10, 7],
    castShadow: true,
  },
  hemisphere: {
    skyColor: '#B0D4FF',    // Slight blue sky tint
    groundColor: '#3B2F2F', // Warm ground bounce
    intensity: 0.3,
  },
  fill: {
    color: '#FFFFFF',
    intensity: 0.2,
    position: [-3, 2, -5],  // Fill light from opposite side
  },
};
```

---

## Animation & Motion

### Transition Durations

| Duration | Usage |
|---|---|
| 100ms | Micro-interactions (button press, checkbox) |
| 150ms | Hover states, color transitions |
| 200ms | Panel toggles, dropdown open/close |
| 300ms | Modal open/close, page transitions |
| 500ms | Complex transitions (view mode change, camera move) |
| 800ms | Generation progress animation |

### Easing Functions

| Name | CSS Value | Usage |
|---|---|---|
| Default | `ease` | Most transitions |
| Smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | Camera movements, panel slides |
| Bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebration micro-animations |
| Sharp | `cubic-bezier(0.4, 0, 0.6, 1)` | Quick state changes |

### Reduced Motion

When the system `prefers-reduced-motion` is set:
- All viewport animations become instant transitions
- Camera movements snap instead of smoothly interpolating
- Generation progress shows static steps instead of animation
- Toast notifications appear without slide-in
- No hover scaling effects on cards

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Primary
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        steel: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Primary
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        workspace: {
          bg:      '#111827',
          surface: '#1F2937',
          elevated:'#374151',
          hover:   '#4B5563',
        },
        axis: {
          x: '#EF4444',
          y: '#22C55E',
          z: '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        dimension:  ['13px', '16px'],
        'dimension-lg': ['16px', '20px'],
      },
      borderRadius: {
        'viewport': '0px', // Viewport canvas has no rounding
      },
    },
  },
};
```

---

*Last updated: February 2026*
