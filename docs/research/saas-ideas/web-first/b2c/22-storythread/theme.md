# StoryThread - Theme

> Brand personality, color palette, typography, reading optimization, component styling, and design system for the collaborative AI fiction writing platform.

---

## Brand Personality

| Trait                | Expression                                                    |
| -------------------- | ------------------------------------------------------------- |
| **Creative**         | Warm tones, literary references, expressive illustrations     |
| **Warm**             | Parchment backgrounds, golden accents, serif reading fonts    |
| **Literary**         | Classic book aesthetics, elegant typography, rich details     |
| **Imaginative**      | Subtle sparkle/glow on AI features, gradient storytelling     |
| **Community-Driven** | Writer profiles, reader reactions, social engagement patterns |

### Brand Voice

- Encouraging, not pushy: "Your story is waiting" not "Start writing NOW!"
- Literary, not pretentious: Use accessible language with occasional literary references
- Supportive, not condescending: "AI can help" not "AI will fix your writing"
- Inclusive, not gatekeeping: All skill levels welcome, no "real writer" gatekeeping

### Brand Assets

- **Logo**: "StoryThread" in EB Garamond with a subtle thread/quill motif connecting the S and T
- **Favicon**: Stylized "ST" monogram in burgundy
- **App icon**: Open book with golden thread running through pages
- **Illustration style**: Warm, hand-drawn quality with flat color fills; literary/bookish motifs

---

## Color Palette

### Primary Colors

| Color             | Hex       | CSS Variable           | Usage                                    |
| ----------------- | --------- | ---------------------- | ---------------------------------------- |
| **Rich Burgundy** | `#881337` | `--color-primary`      | Primary buttons, links, brand elements   |
| **Burgundy Dark** | `#6B0F2B` | `--color-primary-dark` | Hover states, active states              |
| **Burgundy Light**| `#A91D4E` | `--color-primary-light`| Focus rings, subtle highlights           |
| **Warm Gold**     | `#D4A843` | `--color-accent`       | AI features, premium badges, highlights  |
| **Gold Dark**     | `#B8922E` | `--color-accent-dark`  | Gold hover states                        |
| **Gold Light**    | `#E8C76A` | `--color-accent-light` | Gold backgrounds, subtle AI indicators   |

### Background Colors

| Color              | Hex       | CSS Variable              | Usage                                |
| ------------------ | --------- | ------------------------- | ------------------------------------ |
| **Parchment**      | `#FDF6E3` | `--color-bg-parchment`    | Main background (warm, literary feel) |
| **White Surface**  | `#FFFFFF` | `--color-bg-surface`      | Cards, panels, editor background     |
| **Warm Gray**      | `#F5F0E8` | `--color-bg-secondary`    | Secondary backgrounds, code blocks   |
| **Cream**          | `#FAF5EB` | `--color-bg-reading`      | Reading view background              |

### Text Colors

| Color              | Hex       | CSS Variable              | Usage                                |
| ------------------ | --------- | ------------------------- | ------------------------------------ |
| **Dark Text**      | `#292524` | `--color-text-primary`    | Body text, headings                  |
| **Medium Text**    | `#57534E` | `--color-text-secondary`  | Descriptions, metadata               |
| **Light Text**     | `#A8A29E` | `--color-text-tertiary`   | Placeholders, disabled text          |
| **Inverse Text**   | `#FAFAF9` | `--color-text-inverse`    | Text on dark backgrounds             |

### Semantic Colors

| Color              | Hex       | CSS Variable              | Usage                                |
| ------------------ | --------- | ------------------------- | ------------------------------------ |
| **Chapter Green**  | `#059669` | `--color-chapter`         | Published chapters, success states   |
| **Character Purple** | `#7C3AED` | `--color-character`    | Character mentions, character cards   |
| **World Blue**     | `#2563EB` | `--color-world`           | World-building entries, locations    |
| **AI Gold**        | `#D4A843` | `--color-ai`              | AI suggestions, AI panel, sparkles   |
| **Warning Amber**  | `#D97706` | `--color-warning`         | Consistency warnings, cautions       |
| **Error Red**      | `#DC2626` | `--color-error`           | Errors, destructive actions          |
| **Info Blue**      | `#2563EB` | `--color-info`            | Informational messages               |
| **Draft Gray**     | `#9CA3AF` | `--color-draft`           | Draft status indicators              |

### Color Usage Guidelines

- **Primary burgundy** should be used sparingly — main CTAs, active navigation, brand elements
- **Warm gold** is reserved for AI features to create a visual association between gold and AI assistance
- **Parchment background** gives the platform a warm, literary feel distinct from cold white SaaS apps
- **Semantic colors** (green, purple, blue) differentiate content types at a glance: chapters, characters, world
- Avoid pure black (`#000000`) — use dark warm gray (`#292524`) for softer reading experience
- Avoid pure white backgrounds for reading — use parchment (`#FDF6E3`) or cream (`#FAF5EB`)

---

## Color Modes

### Light Mode (Default)

Light mode is the default because StoryThread is primarily a **reading platform**, and most readers prefer light backgrounds for extended reading.

```css
:root {
  --bg-page: #FDF6E3;        /* Parchment */
  --bg-surface: #FFFFFF;      /* Cards, panels */
  --bg-reading: #FAF5EB;      /* Reading view */
  --text-primary: #292524;    /* Body text */
  --text-secondary: #57534E;  /* Metadata */
  --border: #E7E5E4;          /* Borders */
  --shadow: rgba(41, 37, 36, 0.08);
}
```

### Dark Mode (Night Reading)

Optimized for nighttime reading with warm tones to reduce eye strain.

```css
[data-theme="dark"] {
  --bg-page: #1C1917;         /* Warm dark background */
  --bg-surface: #292524;      /* Cards, panels */
  --bg-reading: #1C1917;      /* Reading view */
  --text-primary: #E7E5E4;    /* Body text (warm off-white) */
  --text-secondary: #A8A29E;  /* Metadata */
  --border: #44403C;          /* Borders */
  --shadow: rgba(0, 0, 0, 0.3);

  /* Burgundy adjusts for dark mode readability */
  --color-primary: #C2255C;   /* Lighter burgundy for contrast */
  --color-accent: #E8C76A;    /* Brighter gold */
}
```

### Sepia Mode (Classic Reading)

For readers who prefer a warm, book-like reading experience.

```css
[data-theme="sepia"] {
  --bg-page: #F4ECD8;         /* Warm sepia */
  --bg-surface: #FAF5EB;      /* Lighter sepia */
  --bg-reading: #F4ECD8;      /* Reading view */
  --text-primary: #3D3229;    /* Warm dark brown */
  --text-secondary: #6B5D4F;  /* Medium brown */
  --border: #D4C5A9;          /* Warm border */
}
```

---

## Typography

### Font Stack

| Font               | Category     | CSS Variable        | Usage                                    |
| ------------------ | ------------ | ------------------- | ---------------------------------------- |
| **Lora**           | Serif        | `--font-reading`    | Story text, chapter content, reading view |
| **Plus Jakarta Sans** | Sans-serif | `--font-ui`        | UI elements, buttons, navigation, forms  |
| **EB Garamond**    | Serif        | `--font-display`    | Story titles, chapter headings, hero text |
| **JetBrains Mono** | Monospace    | `--font-mono`       | Word count, metadata, code blocks        |

### Why These Fonts

- **Lora**: Designed specifically for body text reading. Elegant serif with good screen readability. Has italic and bold weights — essential for fiction (emphasis, internal thoughts).
- **Plus Jakarta Sans**: Clean, geometric sans-serif with excellent legibility at small sizes. Modern feel for UI without competing with the literary reading fonts.
- **EB Garamond**: Classic Garamond adapted for screen use. Provides a traditional literary feel for titles and headings that evokes printed books.
- **JetBrains Mono**: Clear monospace for data display (word counts, timestamps, technical info). Its distinct character shapes prevent confusion between similar characters.

### Font Loading Strategy

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');
```

Use `font-display: swap` to prevent FOIT (Flash of Invisible Text). System font fallbacks:
- Lora -> Georgia -> serif
- Plus Jakarta Sans -> -apple-system -> Segoe UI -> sans-serif
- EB Garamond -> Garamond -> Georgia -> serif
- JetBrains Mono -> Menlo -> Consolas -> monospace

### Type Scale

```
--text-xs:    0.75rem  (12px)   — Timestamps, metadata labels
--text-sm:    0.875rem (14px)   — Secondary text, captions
--text-base:  1rem     (16px)   — UI body text
--text-lg:    1.125rem (18px)   — Reading body text (min)
--text-xl:    1.25rem  (20px)   — Reading body text (default)
--text-2xl:   1.5rem   (24px)   — Section headings
--text-3xl:   1.875rem (30px)   — Chapter titles
--text-4xl:   2.25rem  (36px)   — Story titles
--text-5xl:   3rem     (48px)   — Hero headings (landing page)
```

### Font Weights

```
--font-normal:   400   — Body text, reading content
--font-medium:   500   — UI labels, subtitles, emphasis
--font-semibold: 600   — Button text, navigation, active tabs
--font-bold:     700   — Headings, story titles, strong emphasis
```

---

## Reading Optimization

Reading is the primary user activity on StoryThread. These specifications ensure comfortable long-form reading.

### Line Length

```css
.reading-content {
  max-width: 680px;         /* ~65-75 characters per line at 20px font */
  margin: 0 auto;
  padding: 0 1.5rem;        /* Mobile padding */
}
```

**Why 680px**: At 20px Lora font, this produces approximately 65-75 characters per line — the optimal range for comfortable reading according to typographic research. Shorter lines cause too many line breaks; longer lines make it hard to find the next line.

### Line Height

```css
.reading-content p {
  line-height: 1.6;          /* Generous spacing for reading comfort */
}

.ui-text {
  line-height: 1.5;          /* Slightly tighter for UI elements */
}
```

### Paragraph Spacing

```css
.reading-content p {
  margin-bottom: 1.5em;      /* Clear paragraph separation */
}

/* Alternative: first-line indent (more book-like) */
.reading-content.indent-style p + p {
  text-indent: 2em;
  margin-bottom: 0;
}
.reading-content.indent-style p:first-of-type {
  text-indent: 0;
}
```

### Reading View Typography Presets

Users can customize their reading experience:

| Setting        | Options                                | Default    |
| -------------- | -------------------------------------- | ---------- |
| Font size      | 16px, 18px, 20px, 22px, 24px          | 20px       |
| Line spacing   | Compact (1.4), Normal (1.6), Relaxed (1.8) | Normal |
| Font           | Lora (serif), Plus Jakarta Sans (sans) | Lora       |
| Theme          | Light, Dark, Sepia                     | Light      |
| Text alignment | Left, Justified                        | Left       |
| Page width     | Narrow (560px), Normal (680px), Wide (800px) | Normal |

---

## Icon Library: Lucide React

**Package**: `lucide-react`

Lucide is chosen for its consistent stroke width, comprehensive set, and lightweight bundle size. Use only outlined (not filled) icons for consistency.

### Icon Usage by Context

| Context                | Icons Used                                           |
| ---------------------- | ---------------------------------------------------- |
| Navigation             | `Home`, `Compass`, `PenTool`, `Bell`, `User`         |
| Editor toolbar         | `Bold`, `Italic`, `Underline`, `Heading1-3`, `Quote`, `List` |
| AI features            | `Sparkles`, `Wand2`, `MessageSquare`, `RefreshCw`    |
| Story management       | `BookOpen`, `FileText`, `FolderOpen`, `Settings`     |
| Characters             | `Users`, `UserCircle`, `Heart`, `Swords`             |
| World building         | `Globe`, `MapPin`, `Scroll`, `Crown`, `Shield`       |
| Reader engagement      | `Heart`, `MessageCircle`, `Bookmark`, `Share2`       |
| Status indicators      | `Circle` (draft), `CheckCircle` (published), `Clock` (scheduled) |
| Analytics              | `BarChart3`, `TrendingUp`, `Eye`, `Users`            |
| Actions                | `Plus`, `Edit`, `Trash2`, `Download`, `Upload`       |

### Icon Sizing

```
--icon-xs:  14px   — Inline with small text
--icon-sm:  16px   — Buttons, inline with body text
--icon-md:  20px   — Navigation, primary actions
--icon-lg:  24px   — Section headers, empty states
--icon-xl:  32px   — Feature icons, landing page
```

---

## Component Styling

### 1. Story Card

The most reused component across Discovery, profiles, and reading lists.

```
+---------------------------+
| +-------------------------+|
| |                         ||
| |     [Cover Image]       ||
| |     or gradient          ||
| |                         ||
| +-------------------------+|
|                            |
| Story Title (2 lines max) |
| by Author Name             |
|                            |
| [Fantasy] [Romance]       |
| 12 chapters | 47K words    |
| 3.4K reads                 |
+---------------------------+
```

**Styling:**
```css
.story-card {
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.story-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow);
}

.story-card__cover {
  aspect-ratio: 2/3;           /* Book cover proportions */
  object-fit: cover;
  width: 100%;
}

.story-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.story-card__author {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.story-card__genre-badge {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-inverse);
}

.story-card__stats {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

**Cover image fallback**: When no cover is uploaded, show a gradient based on genre:
- Fantasy: burgundy to purple gradient
- Sci-Fi: blue to cyan gradient
- Romance: rose to pink gradient
- Mystery: dark gray to amber gradient
- Horror: dark red to black gradient

---

### 2. Chapter List Item

Used in Story Manager and Reading View chapter navigation.

```
+--------------------------------------------------------------+
| [Status dot] Ch. 3: The Bridge       3,800 words  Jan 29     |
|              ~15 min read             [Published]              |
+--------------------------------------------------------------+
```

**Styling:**
```css
.chapter-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}

.chapter-item__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.chapter-item__status-dot--published { background: var(--color-chapter); }
.chapter-item__status-dot--draft { background: var(--color-draft); }
.chapter-item__status-dot--scheduled { background: var(--color-warning); }

.chapter-item__title {
  font-family: var(--font-ui);
  font-weight: var(--font-medium);
  flex: 1;
}

.chapter-item__meta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

---

### 3. Character Card

Used in Character Bible and AI Panel quick references.

```
+---------------------------+
| [Portrait]  Maria Elena   |
|             Vasquez        |
|             Protagonist    |
|                            |
| Green eyes, dark curly     |
| hair, stubborn, loyal      |
|                            |
| Chapters: 1, 3, 5, 7, 8   |
| [Edit] [AI Check]         |
+---------------------------+
```

**Styling:**
```css
.character-card {
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  border-left: 4px solid var(--color-character);  /* Purple accent */
  padding: 16px;
}

.character-card__name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-character);
}

.character-card__role {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.character-card__portrait {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid var(--color-character);
}
```

---

### 4. Writing Editor Toolbar

Floating toolbar that appears on text selection in the editor.

```
+---------------------------------------------------+
| B  I  U  S  | H1 H2 H3 | "  -  [] | AI: Continue |
+---------------------------------------------------+
```

**Styling:**
```css
.editor-toolbar {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  padding: 4px;
  display: flex;
  gap: 2px;
}

.editor-toolbar__button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.editor-toolbar__button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.editor-toolbar__button--active {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.editor-toolbar__button--ai {
  color: var(--color-ai);       /* Gold for AI actions */
}

.editor-toolbar__divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 6px 4px;
}
```

---

### 5. Reading Progress Bar

Thin bar at the top of the reading view that fills as the reader scrolls.

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--border);
  z-index: 50;
}

.reading-progress__bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.1s ease-out;
  border-radius: 0 2px 2px 0;
}
```

---

### 6. Comment Bubble

Used in the reading view for chapter comments.

```
+----------------------------------------------+
| [Avatar] @bookworm23              2 hours ago |
|                                                |
| This chapter gave me chills! The way Maria     |
| crossed the bridge was so atmospheric.         |
|                                                |
| [Heart 12]  [Reply]  [Report]                  |
+----------------------------------------------+
    |
    +-- [Avatar] @maria_writes  (Writer)  1h ago |
    |   Thank you! Wait until Chapter 4...        |
    +---------------------------------------------+
```

**Styling:**
```css
.comment {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.comment__author {
  font-family: var(--font-ui);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.comment__author-badge--writer {
  font-size: var(--text-xs);
  background: var(--color-primary);
  color: var(--text-inverse);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.comment__body {
  font-family: var(--font-reading);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--text-primary);
  margin-top: 4px;
}

.comment__spoiler {
  background: var(--text-primary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 2px;
  padding: 0 4px;
}

.comment__spoiler:hover,
.comment__spoiler--revealed {
  background: var(--color-warning);
  color: var(--text-primary);
}

.comment--reply {
  margin-left: 48px;
  border-left: 2px solid var(--border);
  padding-left: 16px;
}
```

---

### 7. AI Suggestion Panel

The right sidebar in the Writing Studio showing AI options and output.

```
+---------------------------+
| AI Assistant        [x]   |
+---------------------------+
|                            |
| [Sparkle] Continue Story  |
| [Chat]    Suggest Dialogue|
| [Edit]    Rephrase        |
| [Eye]     Describe Scene  |
| [Check]   Fix Prose       |
|                            |
| ------- Tone -------      |
| [Dramatic] [Humorous]     |
| [Dark] [Lyrical] [Neutral]|
|                            |
| ------- Output -------    |
| "Maria paused at the      |
|  bridge's center, her     |
|  hand trailing along the  |
|  weathered stone..."      |
|                            |
| [Accept] [Reject] [Redo]  |
|                            |
| 187/200 AI uses remaining |
+---------------------------+
```

**Styling:**
```css
.ai-panel {
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  width: 320px;
  padding: 16px;
  overflow-y: auto;
}

.ai-panel__title {
  font-family: var(--font-ui);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-panel__title .sparkle-icon {
  color: var(--color-ai);
}

.ai-panel__action-button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  text-align: left;
  font-family: var(--font-ui);
  font-weight: var(--font-medium);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.15s, background 0.15s;
}

.ai-panel__action-button:hover {
  border-color: var(--color-ai);
  background: rgba(212, 168, 67, 0.05);
}

.ai-panel__output {
  background: rgba(212, 168, 67, 0.08);  /* Subtle gold tint */
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: 8px;
  padding: 16px;
  font-family: var(--font-reading);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
}

.ai-panel__accept-btn {
  background: var(--color-chapter);     /* Green = insert */
  color: var(--text-inverse);
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: var(--font-semibold);
}

.ai-panel__reject-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 16px;
}

.ai-panel__usage-counter {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 16px;
}
```

---

## Spacing System

Based on a 4px base unit:

```
--space-1:   4px     (0.25rem)
--space-2:   8px     (0.5rem)
--space-3:   12px    (0.75rem)
--space-4:   16px    (1rem)
--space-5:   20px    (1.25rem)
--space-6:   24px    (1.5rem)
--space-8:   32px    (2rem)
--space-10:  40px    (2.5rem)
--space-12:  48px    (3rem)
--space-16:  64px    (4rem)
--space-20:  80px    (5rem)
--space-24:  96px    (6rem)
```

---

## Border Radius

```
--radius-sm:   4px    — Small elements (badges, chips)
--radius-md:   8px    — Buttons, inputs, toolbar
--radius-lg:   12px   — Cards, panels, modals
--radius-xl:   16px   — Large containers
--radius-full: 9999px — Avatars, pills, dots
```

---

## Shadows

```css
--shadow-sm:  0 1px 2px rgba(41, 37, 36, 0.05);           /* Subtle lift */
--shadow-md:  0 4px 12px rgba(41, 37, 36, 0.08);          /* Cards */
--shadow-lg:  0 8px 24px rgba(41, 37, 36, 0.12);          /* Hover cards, dropdowns */
--shadow-xl:  0 16px 48px rgba(41, 37, 36, 0.16);         /* Modals */
--shadow-inner: inset 0 2px 4px rgba(41, 37, 36, 0.06);   /* Inputs */
```

---

## Animation & Transitions

```css
--transition-fast:   150ms ease;    /* Hover states, toggles */
--transition-normal: 200ms ease;    /* Panel open/close */
--transition-slow:   300ms ease;    /* Page transitions, modals */

/* AI suggestion shimmer */
@keyframes ai-shimmer {
  0% { opacity: 0.4; }
  50% { opacity: 0.7; }
  100% { opacity: 0.4; }
}

.ai-ghost-text {
  color: var(--color-ai);
  opacity: 0.5;
  animation: ai-shimmer 2s ease-in-out infinite;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

| Requirement              | Implementation                                    |
| ------------------------ | ------------------------------------------------- |
| Color contrast           | WCAG AA (4.5:1 body, 3:1 large text) minimum      |
| Focus indicators         | 2px burgundy outline with 2px offset              |
| Screen reader support    | Semantic HTML, ARIA labels, live regions           |
| Keyboard navigation      | All interactive elements reachable, logical tab order |
| Reduced motion           | Respects `prefers-reduced-motion` media query      |
| Font scaling             | Responds to browser font size settings (rem units) |
| Reading mode support     | User-adjustable font size, spacing, colors         |
| High contrast mode       | `prefers-contrast: high` support                   |

---

## Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#881337',
          dark: '#6B0F2B',
          light: '#A91D4E',
        },
        accent: {
          DEFAULT: '#D4A843',
          dark: '#B8922E',
          light: '#E8C76A',
        },
        parchment: '#FDF6E3',
        cream: '#FAF5EB',
        chapter: '#059669',
        character: '#7C3AED',
        world: '#2563EB',
        ai: '#D4A843',
      },
      fontFamily: {
        reading: ['Lora', 'Georgia', 'serif'],
        ui: ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        display: ['EB Garamond', 'Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: {
        reading: '680px',
        'reading-narrow': '560px',
        'reading-wide': '800px',
      },
      lineHeight: {
        reading: '1.6',
        'reading-relaxed': '1.8',
        'reading-compact': '1.4',
      },
    },
  },
};
```

---

*Theme designed to evoke the warmth of physical books while providing the functionality of a modern web application — literary aesthetics meet digital-first UX.*
