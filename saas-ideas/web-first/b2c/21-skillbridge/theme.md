# SkillBridge -- Theme and Design System

## Brand Personality

SkillBridge's visual identity must convey five qualities in every interaction:

| Quality | What It Means | How It Shows Up |
| ------- | ------------- | --------------- |
| **Hopeful** | The future is bright, even when the present is uncertain | Warm colors, upward visual momentum, sunrise orange accents, success celebration moments |
| **Empowering** | You already have valuable skills; we help you see and use them | Bold type for skill badges, progress visualization, achievement system, confident CTAs |
| **Trustworthy** | We are credible, evidence-based, and honest about timelines | Government data citations, clean layouts, consistent design, professional typography |
| **Warm** | We care about you as a person, not just a data point | Cream backgrounds instead of cold white, friendly illustrations, encouraging microcopy, rounded corners |
| **Accessible** | Everyone can use this, regardless of tech skill, age, or ability | Large text, high contrast, clear hierarchy, simple navigation, no jargon |

**Brand Voice:**
- First person plural ("we" and "your"): "We found 12 transferable skills in your experience"
- Active voice: "Start your assessment" not "Assessment can be started"
- Encouraging without being patronizing: "Great progress!" not "Good job, you did it!"
- Honest about effort: "This transition typically takes 3-4 months of focused learning"
- Plain language: "Jobs that match your skills" not "AI-powered occupational alignment engine"

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
| ----- | --- | --- | ----- |
| **Warm Teal** (Primary) | `#0D9488` | 13, 148, 136 | Primary buttons, active states, navigation highlights, progress indicators, links |
| **Warm Teal Light** | `#14B8A6` | 20, 184, 166 | Hover states, secondary elements, skill badge backgrounds |
| **Warm Teal Dark** | `#0F766E` | 15, 118, 110 | Active/pressed states, primary text on light backgrounds when emphasis needed |
| **Sunrise Orange** (Accent) | `#F97316` | 249, 115, 22 | CTAs that need extra attention, achievement badges, milestone markers, important alerts |
| **Sunrise Orange Light** | `#FB923C` | 251, 146, 60 | Hover states for orange elements, warm highlights |
| **Sunrise Orange Dark** | `#EA580C` | 234, 88, 12 | Active/pressed states for orange elements |

### Background Colors

| Color | Hex | RGB | Usage |
| ----- | --- | --- | ----- |
| **Soft Cream** | `#FFFBF5` | 255, 251, 245 | Page background (light mode). Warm, inviting, not clinical |
| **White** | `#FFFFFF` | 255, 255, 255 | Card surfaces, content containers, input fields |
| **Warm Gray 50** | `#FAFAF9` | 250, 250, 249 | Alternate section backgrounds, sidebar background |
| **Warm Gray 100** | `#F5F5F4` | 245, 245, 244 | Dividers, borders, table header backgrounds |
| **Warm Gray 200** | `#E7E5E4` | 231, 229, 228 | Input borders, disabled backgrounds |

### Text Colors

| Color | Hex | RGB | Usage |
| ----- | --- | --- | ----- |
| **Stone 900** | `#1C1917` | 28, 25, 23 | Primary text (headings, body copy). Warm dark instead of pure black |
| **Stone 700** | `#44403C` | 68, 64, 60 | Secondary text (descriptions, labels, metadata) |
| **Stone 500** | `#78716C` | 120, 113, 108 | Tertiary text (timestamps, helper text, placeholder text) |
| **Stone 400** | `#A8A29E` | 168, 162, 158 | Disabled text, ghost elements |
| **White** | `#FFFFFF` | 255, 255, 255 | Text on dark/colored backgrounds |

### Semantic Colors

| Color | Hex | Name | Usage |
| ----- | --- | ---- | ----- |
| **Success Green** | `#16A34A` | Green 600 | Completed items, skill matches, positive changes, checkmarks |
| **Success Green Light** | `#DCFCE7` | Green 100 | Success notification backgrounds, completed badge backgrounds |
| **Progress Blue** | `#3B82F6` | Blue 500 | Progress indicators, learning content, informational states |
| **Progress Blue Light** | `#DBEAFE` | Blue 100 | Info notification backgrounds, progress bar backgrounds |
| **Milestone Gold** | `#D4A843` | Custom | Achievement badges, milestone markers, premium features indicator |
| **Milestone Gold Light** | `#FEF3C7` | Amber 100 | Achievement badge backgrounds, highlight sections |
| **Warning Amber** | `#F59E0B` | Amber 500 | Skills gaps, areas needing attention, partial matches |
| **Warning Amber Light** | `#FEF3C7` | Amber 100 | Warning notification backgrounds |
| **Error Red** | `#DC2626` | Red 600 | Error states, missing skills, validation errors, critical alerts |
| **Error Red Light** | `#FEE2E2` | Red 100 | Error notification backgrounds, destructive action warnings |

### Dark Mode Colors

Dark mode is available but light mode is the default (approachable and warm for our user base).

| Element | Light Mode | Dark Mode |
| ------- | ---------- | --------- |
| Page background | `#FFFBF5` (Soft Cream) | `#1C1917` (Stone 900) |
| Card surface | `#FFFFFF` (White) | `#292524` (Stone 800) |
| Primary text | `#1C1917` (Stone 900) | `#FAFAF9` (Warm Gray 50) |
| Secondary text | `#44403C` (Stone 700) | `#A8A29E` (Stone 400) |
| Borders | `#E7E5E4` (Warm Gray 200) | `#44403C` (Stone 700) |
| Sidebar | `#FAFAF9` (Warm Gray 50) | `#1C1917` (Stone 900) |
| Primary button | `#0D9488` (Warm Teal) | `#14B8A6` (Warm Teal Light) |
| Accent | `#F97316` (Sunrise Orange) | `#FB923C` (Sunrise Orange Light) |

---

## Typography

### Font Families

| Font | Usage | Weights | Fallback |
| ---- | ----- | ------- | -------- |
| **Plus Jakarta Sans** | Headings (H1-H6), navigation labels, feature titles, stat numbers | 500 (Medium), 600 (SemiBold), 700 (Bold) | system-ui, -apple-system, sans-serif |
| **Inter** | Body text, form labels, descriptions, metadata, UI elements | 400 (Regular), 500 (Medium), 600 (SemiBold) | system-ui, -apple-system, sans-serif |
| **System fonts** | Form inputs, textareas, code snippets | 400 (Regular), 500 (Medium) | -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto |

**Why Plus Jakarta Sans:** Friendly, modern, geometric without being cold. Excellent readability at large sizes. Feels approachable and professional simultaneously. Free on Google Fonts.

**Why Inter:** The gold standard for UI body text. Optimized for screen readability, excellent at small sizes, extensive language support. Free on Google Fonts.

### Type Scale

| Level | Size (px) | Size (rem) | Line Height | Weight | Font | Usage |
| ----- | --------- | ---------- | ----------- | ------ | ---- | ----- |
| **Display** | 48 | 3.0 | 1.1 | 700 | Plus Jakarta Sans | Hero headlines only |
| **H1** | 36 | 2.25 | 1.2 | 700 | Plus Jakarta Sans | Page titles |
| **H2** | 30 | 1.875 | 1.25 | 600 | Plus Jakarta Sans | Section headers |
| **H3** | 24 | 1.5 | 1.3 | 600 | Plus Jakarta Sans | Subsection headers, card titles |
| **H4** | 20 | 1.25 | 1.35 | 600 | Plus Jakarta Sans | Component headers |
| **H5** | 18 | 1.125 | 1.4 | 600 | Plus Jakarta Sans | Small section headers |
| **Body Large** | 18 | 1.125 | 1.6 | 400 | Inter | Lead paragraphs, important body text |
| **Body** | 16 | 1.0 | 1.6 | 400 | Inter | Default body text, form labels |
| **Body Small** | 14 | 0.875 | 1.5 | 400 | Inter | Secondary text, metadata, helper text |
| **Caption** | 12 | 0.75 | 1.4 | 500 | Inter | Timestamps, badges, tags |
| **Overline** | 12 | 0.75 | 1.4 | 600 | Inter (uppercase, letter-spacing: 0.05em) | Category labels, section overlines |

**Minimum text size:** 16px for body content (critical for readability with our user base). 14px is the absolute minimum for any text, used only for metadata and secondary labels. Never use text smaller than 12px.

### Mobile Typography Adjustments

| Level | Desktop | Mobile |
| ----- | ------- | ------ |
| Display | 48px | 32px |
| H1 | 36px | 28px |
| H2 | 30px | 24px |
| H3 | 24px | 20px |
| Body | 16px | 16px (unchanged) |
| Body Small | 14px | 14px (unchanged) |

---

## Spacing Scale

Based on a 4px base unit, following Tailwind's default spacing scale:

| Token | Size | Usage |
| ----- | ---- | ----- |
| `space-1` | 4px | Tight gaps between related inline elements |
| `space-2` | 8px | Inner padding for badges, small gaps |
| `space-3` | 12px | Compact component padding |
| `space-4` | 16px | Default component padding, gap between form fields |
| `space-5` | 20px | Medium padding |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Large section gaps, card margins |
| `space-10` | 40px | Page section spacing |
| `space-12` | 48px | Major section dividers |
| `space-16` | 64px | Page top/bottom margins |
| `space-20` | 80px | Hero section spacing |
| `space-24` | 96px | Marketing page section spacing |

**Generous spacing principle:** Our users may have limited tech literacy. Generous whitespace reduces cognitive load, makes interfaces feel less overwhelming, and improves readability. When in doubt, add more space.

---

## Border Radius

| Token | Size | Usage |
| ----- | ---- | ----- |
| `rounded-sm` | 4px | Small badges, tags |
| `rounded` | 6px | Buttons, inputs, small cards |
| `rounded-md` | 8px | Cards, modals, dropdowns |
| `rounded-lg` | 12px | Large cards, feature sections |
| `rounded-xl` | 16px | Hero cards, marketing sections |
| `rounded-full` | 9999px | Avatars, circular progress, pill badges |

**Rounded corners principle:** Rounded corners feel friendlier and less clinical. Our default is `rounded-md` (8px) for most components. Sharp corners (0px) are never used in the UI.

---

## Shadow System

| Token | Shadow | Usage |
| ----- | ------ | ----- |
| `shadow-sm` | `0 1px 2px rgba(28, 25, 23, 0.05)` | Subtle depth for badges, tags |
| `shadow` | `0 1px 3px rgba(28, 25, 23, 0.1), 0 1px 2px rgba(28, 25, 23, 0.06)` | Cards, dropdowns, inputs (on focus) |
| `shadow-md` | `0 4px 6px rgba(28, 25, 23, 0.07), 0 2px 4px rgba(28, 25, 23, 0.06)` | Elevated cards, modals |
| `shadow-lg` | `0 10px 15px rgba(28, 25, 23, 0.1), 0 4px 6px rgba(28, 25, 23, 0.05)` | Tooltips, popovers, sticky navigation |
| `shadow-xl` | `0 20px 25px rgba(28, 25, 23, 0.1), 0 8px 10px rgba(28, 25, 23, 0.04)` | Full-screen modals, dialogs |

**Note:** Shadows use warm Stone tones, not pure black. This maintains the warm visual feel.

---

## Icon Library

**Primary:** Heroicons (by the makers of Tailwind CSS)
- Style: Outline (24px) for navigation and UI, Solid (20px) for status indicators and badges
- Consistent stroke width: 1.5px
- All icons include accessible labels via aria-label or sr-only text

**Key Icon Assignments:**

| Icon | Heroicon Name | Usage |
| ---- | ------------- | ----- |
| Assessment | `clipboard-document-check` | Assessment nav, start assessment CTA |
| Skills | `puzzle-piece` | Skills profile nav, skill badges |
| Careers | `map` | Career explorer nav, career paths |
| Learning | `academic-cap` | Learning dashboard nav, courses |
| Jobs | `briefcase` | Job board nav, job listings |
| Resume | `document-text` | Resume builder nav, document actions |
| Community | `user-group` | Community nav, forums |
| Progress | `chart-bar` | Progress tracker nav, statistics |
| Settings | `cog-6-tooth` | Settings nav |
| Help | `question-mark-circle` | Help/support links |
| Match Score | `fire` | Transferability score indicators |
| Growth | `arrow-trending-up` | Job growth indicators |
| Salary | `currency-dollar` | Salary information |
| Location | `map-pin` | Location filters and displays |
| Remote | `globe-alt` | Remote work indicators |
| Save | `bookmark` | Save/bookmark actions |
| Success | `check-circle` | Completed items, success states |
| Warning | `exclamation-triangle` | Warning states, skills gaps |
| Error | `x-circle` | Error states, failed actions |
| Add | `plus-circle` | Add skill, add course, new thread |
| Search | `magnifying-glass` | Search inputs |
| Filter | `funnel` | Filter panels |
| Calendar | `calendar` | Timeline events, scheduling |
| Star | `star` | Ratings, featured content |
| Upload | `arrow-up-tray` | Resume upload, file upload |
| Download | `arrow-down-tray` | PDF export, download actions |

---

## Component Design Specifications

### Skill Badge

```
+-----------------------------------+
| [icon] Skill Name        [level]  |
+-----------------------------------+

States:
- Default: bg-teal-50, border-teal-200, text-teal-800
- Expert: bg-teal-100, border-teal-400, bold text
- Gap (missing skill): bg-amber-50, border-amber-200, text-amber-800
- Earned (from course): bg-green-50, border-green-200, text-green-800, checkmark icon
- Editable: hover shows X button and edit cursor

Sizing:
- Padding: 6px 12px (space-2 space-3)
- Border radius: rounded-full
- Font: Body Small (14px), Medium weight
- Proficiency dots: 4 small circles, filled = achieved
```

---

### Career Path Card

```
+--------------------------------------------------+
|  [Industry Badge]                    [Save Icon]  |
|                                                   |
|  Data Quality Analyst                             |
|  Technology                                       |
|                                                   |
|  +------+  Match: 78%                             |
|  | 78%  |  ||||||||||||--------                   |
|  +------+                                         |
|                                                   |
|  $ $45K - $85K    ^ 12% growth    @ 2,340 jobs    |
|  ~ 3-4 months     [Remote badge]                  |
|                                                   |
|  Skills gap: 3 skills needed                      |
|                                                   |
|  [     Explore This Path     ]                    |
+--------------------------------------------------+

Sizing:
- Width: responsive (1/3 desktop, full mobile)
- Padding: space-6 (24px)
- Border radius: rounded-lg (12px)
- Shadow: shadow (default), shadow-md (hover)
- Background: white
- Border: 1px warm-gray-100

Match Score Circle:
- Size: 56px diameter
- Stroke width: 4px
- Color: teal (>70%), amber (50-70%), red (<50%)
- Center text: percentage, 20px bold Plus Jakarta Sans

Hover State:
- Shadow elevates to shadow-md
- Subtle border-teal-200
- Scale: 1.01 (transform, 200ms ease)
```

---

### Progress Bar

```
Overall Progress
[|||||||||||||||||||||||                          ] 47%
Milestone 3 of 7: Core Skills

States:
- Default: bg-warm-gray-100 track, bg-teal-500 fill
- Milestone reached: bg-sunrise-orange fill animation
- Complete: bg-green-500 fill, checkmark icon

Sizing:
- Height: 8px (regular), 12px (large/hero)
- Border radius: rounded-full
- Label: above bar, Body Small, Stone 700
- Percentage: right-aligned, Body Small, Stone 900 bold
- Animation: width transition 600ms ease-out
```

---

### Course Card

```
+--------------------------------------------------+
|  [Provider Logo]  Coursera                        |
|                                                   |
|  Introduction to Data Analysis                    |
|  with Python                                      |
|                                                   |
|  Duration: 4 weeks  |  Cost: Free (audit)         |
|                                                   |
|  Skills: [Data Analysis] [Python] [Statistics]    |
|                                                   |
|  [||||||||||||||||||||||||             ] 60%       |
|                                                   |
|  [  Continue  ]          [  Swap Course  ]        |
+--------------------------------------------------+

Sizing:
- Width: full (within list layout)
- Padding: space-5 (20px)
- Border radius: rounded-md (8px)
- Background: white
- Border: 1px warm-gray-100, left border 3px teal (in progress) or green (completed)
- Provider logo: 24px height

Status Indicators:
- Not started: left border warm-gray-200
- In progress: left border teal-500, progress bar visible
- Completed: left border green-500, checkmark overlay
- Locked: opacity 50%, lock icon, "Complete prerequisite" text
```

---

### Job Match Card

```
+--------------------------------------------------+
|  [Company Logo]                      [Save Icon]  |
|                                                   |
|  Data Entry Specialist                            |
|  Acme Corporation  |  Chicago, IL  |  Full-time   |
|                                                   |
|  $42,000 - $55,000  |  Posted 3 days ago          |
|                                                   |
|  Transferability: 82%                             |
|  [||||||||||||||||||||||||||||||----] 82%          |
|                                                   |
|  Matching skills: 7 of 9                          |
|  [Excel] [Data Entry] [Attention to Detail] ...   |
|                                                   |
|  Missing: [SQL (basic)] [Tableau]                 |
|                                                   |
|  [Career Changer Friendly badge]                  |
|                                                   |
|  [  View Details  ]     [  Quick Apply  ]         |
+--------------------------------------------------+

Transferability Score Bar:
- Same as progress bar but color-coded:
  - Green (>80%): strong match
  - Teal (60-80%): good match
  - Amber (40-60%): moderate match (skills gap needs work)
  - Red (<40%): not shown in results by default

Career Changer Friendly Badge:
- bg-sunrise-orange/10, text-sunrise-orange-700
- Border: 1px sunrise-orange/30
- Icon: heart-handshake or sparkles
- "Career Changer Friendly" text
```

---

### Mentor Profile Card

```
+--------------------------------------------------+
|  +--------+                                       |
|  | Avatar |  Sarah Johnson                        |
|  |  56px  |  Data Analyst at Google                |
|  +--------+                                       |
|                                                   |
|  Factory Worker -> Data Analyst                   |
|  Transitioned 2 years ago                         |
|                                                   |
|  Rating: **** (4.8)  |  12 mentees helped          |
|                                                   |
|  Specialties: [Career Change] [Tech Entry]        |
|               [Resume Help]                       |
|                                                   |
|  [green dot] Available this week                  |
|                                                   |
|  [  Request Session  ]                            |
+--------------------------------------------------+

Avatar:
- Size: 56px diameter
- Border radius: rounded-full
- Border: 2px white, shadow-sm
- Fallback: initials on teal background

Transition Badge:
- Arrow icon between "from" and "to" career
- bg-teal-50, text-teal-800
- Rounded-full
```

---

## Animation Guidelines

### Principles

1. **Purposeful:** Animations serve a function (indicate progress, confirm action, guide attention). No decorative motion.
2. **Subtle:** Durations between 150ms-400ms. No dramatic flourishes.
3. **Respectful:** Honor `prefers-reduced-motion`. When reduced motion is preferred, animations become instant state changes.

### Animation Tokens

| Animation | Duration | Easing | Usage |
| --------- | -------- | ------ | ----- |
| **Fade in** | 200ms | ease-out | Page content appearing, cards loading |
| **Slide up** | 300ms | ease-out | Modals, toasts, bottom sheets |
| **Scale** | 200ms | ease-out | Card hover effects, button press feedback |
| **Progress** | 600ms | ease-out | Progress bars filling, score circles drawing |
| **Celebration** | 800ms | spring(1, 80, 10) | Confetti, badge unlock, milestone reached |
| **Skeleton pulse** | 1500ms | ease-in-out (infinite) | Loading skeleton shimmer |
| **Collapse/expand** | 250ms | ease-in-out | Accordion sections, filter panel toggle |

### Celebration Moments

These deserve special animation treatment (but always subtle and respectful):

1. **Assessment complete:** Confetti particles (Framer Motion, 10-15 particles, 800ms, then fade)
2. **Course completed:** Checkmark draw animation + green pulse
3. **Badge earned:** Badge scale-up from 0.5 to 1.0 with gold shimmer
4. **Milestone reached:** Progress bar pulse + milestone marker bounce
5. **Job interview scheduled:** Success card slide-up with green accent

---

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FFFBF5',
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',  // Primary
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        sunrise: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',  // Accent
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        milestone: {
          DEFAULT: '#D4A843',
          light: '#FEF3C7',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(28, 25, 23, 0.05)',
        'warm': '0 1px 3px rgba(28, 25, 23, 0.1), 0 1px 2px rgba(28, 25, 23, 0.06)',
        'warm-md': '0 4px 6px rgba(28, 25, 23, 0.07), 0 2px 4px rgba(28, 25, 23, 0.06)',
        'warm-lg': '0 10px 15px rgba(28, 25, 23, 0.1), 0 4px 6px rgba(28, 25, 23, 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Illustration Style

### Guidelines

- **Warm and diverse:** Illustrations feature people of different ages (30-60+), races, genders, and body types reflecting our user base
- **Abstract-geometric:** Clean, modern shapes with warm color fills. Not photographic, not cartoon
- **Metaphorical:** Bridge imagery (subtle), paths/roads, doors opening, stepping stones, sunrise/dawn motifs
- **Not patronizing:** Avoid clipart, stock photo aesthetic, or infantilizing imagery. These are adults going through a serious life change
- **Color palette:** Use brand colors (teal, sunrise orange, cream, warm grays) in illustrations

### Illustration Use Cases

| Location | Style | Subject |
| -------- | ----- | ------- |
| Hero section | Large, detailed | Diverse workers walking across a bridge (abstract), destination glowing warmly |
| Empty states | Small, simple | Relevant metaphor for missing content (empty desk, blank map, open book) |
| Success stories | Small portraits | Abstract/geometric portrait of each person (or real photo if provided) |
| Error pages | Medium, playful | Slightly humorous but respectful (lost compass, wrong turn on a path) |
| Onboarding | Medium, step-by-step | Sequential illustrations showing the journey from assessment to new career |
| Celebration moments | Small, animated | Confetti, stars, sunrise burst |

---

*A design system built on the belief that good design can make a scary life change feel manageable, even exciting.*
