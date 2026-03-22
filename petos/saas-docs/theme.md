# PetOS -- Theme & Design System

## Brand Personality

PetOS's brand voice and visual identity reflect five core traits:

| Trait | Expression | Anti-Pattern |
|-------|------------|--------------|
| **Warm** | Coral tones, rounded shapes, soft shadows, generous whitespace | Cold blues, sharp corners, clinical layouts |
| **Caring** | Empathetic copy, gentle error messages, proactive health nudges | Robotic language, harsh warnings, dismissive tones |
| **Playful** | Paw print accents, celebration animations, friendly illustrations | Overly corporate, sterile, boring |
| **Trustworthy** | Clean design, consistent patterns, medical accuracy, clear disclaimers | Flashy, distracting, vague health claims |
| **Family-Oriented** | Inclusive imagery, multi-pet support, shared access, warm photography | Individual-focused, exclusive, cold |

**Brand Voice Guidelines:**
- First person plural when speaking as PetOS: "We're here to help" (not "PetOS is here to help")
- Pet names used in context: "Luna's vaccination is due" (not "Your pet's vaccination is due")
- Warm but not cutesy: "Schedule a vet visit" (not "Time for a pawsome vet adventure!")
- Empathetic in health contexts: "This can be worrying. Here's what we recommend." (not "Error: symptoms detected")
- Direct in urgent situations: "Go to the nearest emergency vet now." (no softening of true emergencies)

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Warm Coral** | `#F87171` | 248, 113, 113 | Primary buttons, active states, brand accents, CTAs |
| **Soft Teal** | `#2DD4BF` | 45, 212, 191 | Secondary accents, links, progress indicators, success states |
| **Cream** | `#FFF7ED` | 255, 247, 237 | Page background (light mode), warm base tone |
| **White** | `#FFFFFF` | 255, 255, 255 | Card surfaces, input backgrounds, content areas |
| **Dark Stone** | `#292524` | 41, 37, 36 | Primary text, headings, high-contrast elements |

### Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Healthy Green** | `#22C55E` | 34, 197, 94 | Health good, medication administered, success confirmations |
| **Warning Amber** | `#F59E0B` | 245, 158, 11 | Schedule vet, attention needed, upcoming due dates |
| **Urgent Red** | `#DC2626` | 220, 38, 38 | Emergency, overdue, critical alerts, errors |
| **Calm Blue** | `#60A5FA` | 96, 165, 250 | Informational, telehealth, links in body text, community |

### Extended Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Stone 50** | `#FAFAF9` | Subtle backgrounds, alternate rows |
| **Stone 100** | `#F5F5F4` | Dividers, borders on cream background |
| **Stone 200** | `#E7E5E4` | Input borders, separator lines |
| **Stone 300** | `#D6D3D1` | Disabled states, placeholder text |
| **Stone 400** | `#A8A29E` | Secondary text, captions, timestamps |
| **Stone 500** | `#78716C` | Body text (secondary), icons |
| **Stone 600** | `#57534E` | Body text (primary) |
| **Stone 700** | `#44403C` | Subheadings, labels |
| **Stone 800** | `#292524` | Headings, primary text |
| **Stone 900** | `#1C1917` | Maximum contrast text |
| **Coral 50** | `#FFF1F2` | Light coral background (hover states) |
| **Coral 100** | `#FFE4E6` | Coral background (active states, badges) |
| **Coral 200** | `#FECDD3` | Coral borders |
| **Coral 600** | `#E11D48` | Coral dark (hover on primary buttons) |
| **Teal 50** | `#F0FDFA` | Light teal background |
| **Teal 100** | `#CCFBF1` | Teal background (badges, tags) |
| **Teal 700** | `#0F766E` | Teal dark (text on teal backgrounds) |
| **Green 50** | `#F0FDF4` | Success background |
| **Green 700** | `#15803D` | Success text |
| **Amber 50** | `#FFFBEB` | Warning background |
| **Amber 700** | `#B45309` | Warning text |
| **Red 50** | `#FEF2F2` | Error/urgent background |
| **Red 700** | `#B91C1C` | Error/urgent text |

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          coral: {
            50: '#FFF1F2',
            100: '#FFE4E6',
            200: '#FECDD3',
            300: '#FDA4AF',
            400: '#FB7185',
            500: '#F87171',   // Primary
            600: '#E11D48',
            700: '#BE123C',
          },
          teal: {
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            300: '#5EEAD4',
            400: '#2DD4BF',   // Secondary
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
          },
          cream: '#FFF7ED',
        },
        status: {
          healthy: '#22C55E',
          warning: '#F59E0B',
          urgent: '#DC2626',
          info: '#60A5FA',
        },
      },
    },
  },
};

export default config;
```

---

## Light Mode and Dark Mode

### Light Mode (Default)

Light mode is the default and primary experience. It uses the warm cream background to create an inviting, friendly atmosphere.

```
Background:   #FFF7ED (cream)
Surface:      #FFFFFF (white cards)
Text Primary: #292524 (dark stone)
Text Secondary: #78716C (stone 500)
Borders:      #E7E5E4 (stone 200)
```

### Dark Mode

Dark mode uses warm dark tones (stone, not pure black) to maintain the brand's warmth even in low-light usage.

```
Background:   #1C1917 (stone 900)
Surface:      #292524 (stone 800)
Text Primary: #FAFAF9 (stone 50)
Text Secondary: #A8A29E (stone 400)
Borders:      #44403C (stone 700)
Coral:        #FB7185 (coral 400, slightly lighter for contrast)
Teal:         #5EEAD4 (teal 300, slightly lighter for contrast)
```

**Dark Mode Implementation:**
- Toggle in settings (manual) + system preference detection
- `prefers-color-scheme` media query as default
- Tailwind `dark:` prefix for all color tokens
- Smooth transition on toggle (150ms opacity fade)
- Pet photos maintain full color in both modes
- Charts and data visualizations adjust for dark backgrounds

---

## Typography

### Font Stack

| Role | Font | Weight | Fallback | Why |
|------|------|--------|----------|-----|
| **Headings** | Quicksand | 600, 700 | `system-ui, -apple-system, sans-serif` | Rounded letterforms feel friendly and pet-appropriate without being childish |
| **Body** | Inter | 400, 500, 600 | `system-ui, -apple-system, sans-serif` | Highly legible at all sizes, excellent for health data and long-form content |
| **Monospace** | JetBrains Mono | 400 | `ui-monospace, monospace` | Microchip IDs, medication dosages, numerical data |
| **Forms** | System fonts | 400 | `-apple-system, system-ui` | Native feel for form inputs, fastest rendering |

### Type Scale

| Level | Size (rem) | Line Height | Weight | Usage |
|-------|-----------|-------------|--------|-------|
| **Display** | 2.25 (36px) | 1.2 | 700 | Landing page hero heading |
| **H1** | 1.875 (30px) | 1.3 | 700 | Page titles |
| **H2** | 1.5 (24px) | 1.35 | 600 | Section headings |
| **H3** | 1.25 (20px) | 1.4 | 600 | Card titles, subsections |
| **H4** | 1.125 (18px) | 1.4 | 600 | Small headings, labels |
| **Body Large** | 1.125 (18px) | 1.6 | 400 | Landing page body, feature descriptions |
| **Body** | 1 (16px) | 1.6 | 400 | Default body text |
| **Body Small** | 0.875 (14px) | 1.5 | 400 | Secondary info, captions, timestamps |
| **Caption** | 0.75 (12px) | 1.4 | 500 | Badges, labels, fine print |

### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/quicksand-600.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin />
```

- Self-hosted fonts (not Google Fonts CDN) for performance and privacy
- `font-display: swap` for all fonts (show system font immediately, swap when loaded)
- Subset fonts to Latin characters only (smaller file size)
- Quicksand headings file: ~25KB, Inter body file: ~30KB

---

## Spacing and Layout

### Spacing Scale

Using a 4px base unit, consistent with Tailwind's default spacing scale:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing (icon padding, badge padding) |
| `space-2` | 8px | Compact spacing (between icon and label) |
| `space-3` | 12px | Inner card padding (compact cards) |
| `space-4` | 16px | Standard card padding, form field gap |
| `space-5` | 20px | Section padding (mobile) |
| `space-6` | 24px | Card padding (desktop), between cards |
| `space-8` | 32px | Section spacing |
| `space-10` | 40px | Large section gaps |
| `space-12` | 48px | Page section dividers |
| `space-16` | 64px | Major page sections |
| `space-20` | 80px | Landing page sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Input fields, small buttons |
| `rounded-md` | 8px | Tags, badges, chips |
| `rounded-lg` | 12px | Medium cards, dropdown menus |
| `rounded-xl` | 16px | Primary cards (pet profile card, health record card) |
| `rounded-2xl` | 20px | Large feature cards, modal dialogs |
| `rounded-full` | 9999px | Pet profile photo (circular), pills, avatars |

**Design principle:** PetOS uses generous border radius throughout. Sharp corners are avoided. The rounded aesthetic feels friendly, soft, and pet-appropriate. The 16px default card radius is a signature element of the design.

### Shadows

```css
/* Soft, warm shadows -- no harsh black */
--shadow-sm: 0 1px 2px 0 rgba(41, 37, 36, 0.05);
--shadow-md: 0 4px 6px -1px rgba(41, 37, 36, 0.07), 0 2px 4px -2px rgba(41, 37, 36, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(41, 37, 36, 0.08), 0 4px 6px -4px rgba(41, 37, 36, 0.04);
--shadow-xl: 0 20px 25px -5px rgba(41, 37, 36, 0.1), 0 8px 10px -6px rgba(41, 37, 36, 0.04);

/* Colored shadows for interactive elements */
--shadow-coral: 0 4px 14px 0 rgba(248, 113, 113, 0.25);
--shadow-teal: 0 4px 14px 0 rgba(45, 212, 191, 0.25);
```

---

## Icon Library

### Primary: Lucide React

Lucide React provides the base icon set. It is clean, consistent, and has excellent coverage for general UI needs.

**Common icons used:**

| Icon | Usage |
|------|-------|
| `Home` | Dashboard navigation |
| `Heart` | Health features, favorites |
| `Calendar` | Appointments, scheduling |
| `Bell` | Notifications, reminders |
| `Camera` | Photo upload, symptom photo |
| `Search` | Search bars |
| `Plus` | Add pet, add record |
| `ChevronRight` | Navigation, list items |
| `Star` | Ratings, reviews |
| `MapPin` | Location, vet finder |
| `Phone` | Call vet, emergency |
| `Video` | Telehealth |
| `MessageCircle` | Chat, community |
| `Settings` | Settings, preferences |
| `Shield` | Verification, security |
| `TrendingUp` | Weight trends, growth |
| `AlertTriangle` | Warnings, urgent alerts |
| `CheckCircle` | Success, completed |
| `Clock` | Time, schedule, upcoming |
| `Download` | Export, download records |

### Custom Pet-Specific Icons

Custom SVG icons designed to match Lucide's style (24x24, 1.5px stroke, round caps):

| Icon | Design | Usage |
|------|--------|-------|
| **Paw Print** | Dog paw outline | App logo accent, loading animation, navigation marker |
| **Dog Face** | Simplified dog head | Dog species selector, dog-specific content |
| **Cat Face** | Simplified cat head | Cat species selector, cat-specific content |
| **Bird** | Small bird silhouette | Bird species selector |
| **Fish** | Simple fish outline | Fish species selector |
| **Stethoscope** | Medical stethoscope | AI health checker, vet features |
| **Pill** | Capsule/pill shape | Medication tracker, pharmacy |
| **Syringe** | Vaccine syringe | Vaccination records |
| **Bone** | Dog bone | Treats, nutrition, playful accents |
| **Food Bowl** | Pet food dish | Nutrition planner, feeding |
| **Leash** | Dog leash | Walking services |
| **Scissors** | Grooming scissors | Grooming services |
| **Weight Scale** | Pet scale | Weight tracker |
| **DNA Helix** | Double helix | DNA tests, breed genetics |
| **Collar** | Pet collar with tag | Wearable integration, pet ID |

---

## Component Styling

### Pet Profile Card

```
+------------------------------------------+
|  [rounded-xl, shadow-md, bg-white]       |
|                                          |
|  +------+                                |
|  | Pet  |  Luna                          |
|  | Photo|  Golden Retriever              |
|  | 64x64|  3 years old, 28.5 kg         |
|  |circle|                                |
|  +------+  Health: [green dot] Good      |
|            Next: Rabies in 14 days       |
|                                          |
|  [View Profile]  [Quick Check]           |
|  (coral outline)  (teal outline)         |
+------------------------------------------+
```

**Specs:**
- Card: `bg-white rounded-xl shadow-md p-6 border border-stone-100`
- Photo: `w-16 h-16 rounded-full object-cover ring-2 ring-coral-100`
- Name: `text-xl font-semibold font-quicksand text-stone-800`
- Breed: `text-sm text-stone-500`
- Health indicator: 8px colored dot (green/amber/red) + label
- Buttons: `rounded-lg px-4 py-2 text-sm font-medium border-2`
- Hover: Card lifts slightly (`transform: translateY(-2px)`, shadow increases)

---

### Health Record Entry

```
+------------------------------------------+
|  o  Jan 15, 2025                         |
|  |                                       |
|  |  [vaccine icon]  VACCINATION          |
|  |  Bordetella (Kennel Cough)            |
|  |  Dr. Smith, Happy Paws Clinic         |
|  |  Next due: Jan 15, 2026              |
|  |  [paperclip] 1 attachment             |
|  |                                       |
+------------------------------------------+
```

**Specs:**
- Timeline line: `border-l-2 border-stone-200 ml-4`
- Timeline dot: `w-3 h-3 rounded-full bg-coral-500 ring-4 ring-coral-50`
- Date: `text-sm font-medium text-stone-500`
- Type badge: `text-xs font-semibold uppercase tracking-wide text-coral-600 bg-coral-50 px-2 py-0.5 rounded-md`
- Title: `text-base font-medium text-stone-800`
- Details: `text-sm text-stone-600`
- Attachment: `text-xs text-teal-600 flex items-center gap-1`

---

### Symptom Checker Input Card

```
+------------------------------------------+
|  [rounded-2xl, bg-white, shadow-lg]      |
|                                          |
|  How can we help [pet name]?             |
|                                          |
|  [Describe] [Upload Photo] [Guided]      |
|  (tabs with underline active indicator)  |
|                                          |
|  +------------------------------------+ |
|  |                                    | |
|  | Tell us what's going on...         | |
|  |                                    | |
|  | (textarea, 4 rows, auto-expand)    | |
|  |                                    | |
|  +------------------------------------+ |
|                                          |
|  Duration: [dropdown]  Severity: [dropdown]|
|                                          |
|  [Check Symptoms]                        |
|  (full-width coral button)               |
|                                          |
+------------------------------------------+
```

**Specs:**
- Card: `bg-white rounded-2xl shadow-lg p-8 border border-stone-100`
- Heading: `text-2xl font-bold font-quicksand text-stone-800`
- Tabs: `flex gap-6 border-b border-stone-200`, active tab `border-b-2 border-coral-500 text-coral-600`
- Textarea: `rounded-lg border-stone-200 focus:ring-2 focus:ring-coral-200 focus:border-coral-400`
- Submit button: `w-full bg-coral-500 hover:bg-coral-600 text-white rounded-xl py-3 font-semibold shadow-coral`

---

### Medication Reminder Card

```
+------------------------------------------+
|  [rounded-xl, bg-white, shadow-sm]       |
|                                          |
|  [pill icon]  Morning (8:00 AM)          |
|                                          |
|  Heartgard Plus                          |
|  1 chewable - Monthly heartworm          |
|  prevention                              |
|                                          |
|  [checkmark button]  Mark as Given       |
|  (green when completed)                  |
|                                          |
+------------------------------------------+
```

**Specs:**
- Card: `bg-white rounded-xl shadow-sm p-4 border border-stone-100`
- Overdue state: `border-l-4 border-red-500 bg-red-50`
- Due now state: `border-l-4 border-amber-500 bg-amber-50`
- Completed state: `border-l-4 border-green-500 bg-green-50 opacity-75`
- Check button (pending): `w-10 h-10 rounded-full border-2 border-stone-300 hover:border-green-500`
- Check button (done): `w-10 h-10 rounded-full bg-green-500 text-white` with checkmark icon
- Animation: Checkmark button scales up slightly on hover, green fill animation on click

---

### Service Provider Card

```
+------------------------------------------+
|  [rounded-xl, bg-white, shadow-md]       |
|                                          |
|  [Provider    Sarah M.                   |
|   Photo       Dog Walker                 |
|   48x48       ****+ 4.8 (127 reviews)   |
|   circle]     0.5 miles away             |
|                                          |
|  $22/walk | Available Mon-Fri            |
|                                          |
|  "Experienced with large breeds.         |
|   CPR certified."                        |
|                                          |
|  [View Profile]     [Book Now]           |
|  (stone outline)    (coral solid)        |
|                                          |
+------------------------------------------+
```

**Specs:**
- Card: `bg-white rounded-xl shadow-md p-5 border border-stone-100 hover:shadow-lg transition-shadow`
- Provider photo: `w-12 h-12 rounded-full object-cover`
- Stars: Filled stars in `text-amber-400`, empty in `text-stone-200`
- Price: `text-lg font-semibold text-stone-800`
- Book button: `bg-coral-500 text-white rounded-lg px-4 py-2 hover:bg-coral-600`
- Verified badge: `text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 text-xs font-medium`

---

### Nutrition Plan Card

```
+------------------------------------------+
|  [rounded-xl, bg-white, shadow-sm]       |
|                                          |
|  Morning Meal (7:00 AM) -- 675 kcal      |
|                                          |
|  [food bowl icon]                        |
|  1.5 cups dry food (salmon-based)        |
|  + 2 tbsp pumpkin puree                  |
|  + 1 fish oil capsule                    |
|                                          |
|  [Fed] checkbox                          |
|                                          |
+------------------------------------------+
```

---

### Weight Chart Component

```
+------------------------------------------+
|  Weight Tracker                          |
|                                          |
|  [Interactive line chart]                |
|  Y-axis: Weight (kg)                     |
|  X-axis: Date (months)                   |
|  Line: coral-500, 2px stroke             |
|  Points: coral-500, 6px circles          |
|  Fill: coral-50 gradient below line      |
|  Breed range: teal-50 shaded band        |
|  Goal line: teal-500, dashed             |
|                                          |
|  Current: 28.5 kg | Goal: 28 kg         |
|  Trend: Stable [-> icon]                 |
|                                          |
+------------------------------------------+
```

**Chart specs (Recharts):**
- Line color: `#F87171` (coral 500)
- Area fill: Linear gradient from `rgba(248, 113, 113, 0.1)` to `transparent`
- Grid lines: `#E7E5E4` (stone 200), dashed
- Axis text: `#78716C` (stone 500), Inter 12px
- Tooltip: `bg-white rounded-lg shadow-lg p-3 border border-stone-100`
- Breed range band: `rgba(45, 212, 191, 0.1)` (teal 10% opacity)
- Interactive: Hover shows tooltip with exact weight, date, and change from previous

---

## Animation and Motion

### Principles

- Animations should feel natural, smooth, and purposeful
- Respect `prefers-reduced-motion` -- disable non-essential animations when set
- Timing: 150ms for micro-interactions, 300ms for transitions, 500ms for page transitions
- Easing: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for transforms

### Key Animations

| Animation | Trigger | Duration | Description |
|-----------|---------|----------|-------------|
| **Card hover lift** | Mouse enter card | 150ms | `translateY(-2px)`, shadow increase |
| **Medication check** | Tap checkmark | 300ms | Circle fills with green, checkmark scales in |
| **Page transition** | Route change | 300ms | Fade in with slight upward slide |
| **Loading spinner** | Data fetching | Continuous | Paw print rotating, coral color |
| **Success confetti** | Pet added, milestone | 2000ms | Paw print confetti from top, gravity fall |
| **Alert slide** | New notification | 300ms | Slide down from top with bounce |
| **Skeleton shimmer** | Loading state | Continuous | Left-to-right shimmer on placeholder shapes |
| **Tab switch** | Tab selection | 200ms | Underline slides to active tab |
| **Modal open** | Dialog trigger | 300ms | Fade backdrop + scale modal from 95% to 100% |
| **Urgency pulse** | Emergency result | Continuous | Gentle pulse on red urgency badge |

### Framer Motion Configuration

```typescript
// Shared animation variants
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  hover: { y: -2, boxShadow: '0 10px 25px -5px rgba(41,37,36,0.1)' },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const staggerChildren = {
  visible: { transition: { staggerChildren: 0.05 } },
};
```

---

## Imagery and Photography

### Pet Photography Style

- **Warm, natural lighting** -- Indoor with window light or outdoor golden hour
- **Authentic moments** -- Real pets in real settings, not overly staged
- **Diverse pets** -- Dogs, cats, birds, small animals; various breeds, sizes, ages
- **Diverse owners** -- Inclusive representation of pet parents
- **Emotional connection** -- Photos showing bond between pet and owner
- **High quality** -- Crisp, well-composed, professional or high-quality amateur

### Illustration Style

- **Flat, geometric** with rounded shapes
- **Warm color palette** matching brand colors
- **Minimal detail** -- simple, recognizable animal silhouettes
- **Used for:** Empty states, onboarding, error pages, feature explainers
- **Not used for:** Replacing real pet photos in user-facing features

### Image Sources

- Landing page and marketing: Licensed stock photography (Unsplash, Pexels premium)
- User content: User-uploaded pet photos (the primary imagery in the product)
- Illustrations: Custom-designed or Undraw (customized to brand colors)
- Icons: Lucide React + custom SVG set

---

## Responsive Design Tokens

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Small tablets, large phones (landscape) |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Layout Patterns by Breakpoint

| Element | Mobile (< 640px) | Tablet (640-1024px) | Desktop (> 1024px) |
|---------|-------------------|---------------------|---------------------|
| Navigation | Bottom bar (5 items) | Bottom bar | Left sidebar (240px) |
| Pet cards | Full-width stack | 2-column grid | 3-column grid |
| Health timeline | Full-width | Full-width | 2/3 width + sidebar |
| Service cards | Full-width stack | 2-column grid | 3-column grid |
| Forms | Full-width | 600px centered | 600px centered |
| Modals | Full-screen sheet | Centered modal | Centered modal (max 600px) |
| Charts | Full-width, touch | Full-width | Contained in card (max 800px) |
