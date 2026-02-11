# LegalForge -- Design System & Theme

## Brand Personality

LegalForge's visual identity communicates **professional authority**, **trustworthiness**, and **sophisticated intelligence**. The design should feel like a premium legal tool -- not a consumer app. Every visual choice reinforces that this is software built for serious professionals handling high-stakes documents.

### Design Principles

1. **Authoritative**: Deep, rich colors and classic typography signal professionalism. This is not a startup toy -- it is a tool for legal professionals managing millions of dollars in contract value.
2. **Trustworthy**: Clean layouts, consistent patterns, and restrained design build trust. Legal teams need to trust the tool with their most sensitive documents.
3. **Readable**: Contracts are dense text. Every design decision prioritizes reading comfort -- generous whitespace, optimal line heights, and carefully chosen typography.
4. **Sophisticated**: Subtle gold accents, refined shadows, and polished interactions convey premium quality. This justifies the $79-249/seat price point.
5. **Calm**: Legal work is stressful enough. The interface should feel calm and organized, never busy or overwhelming. Risk indicators should be clear without being alarming.

---

## Color Palette

### Primary Colors

| Color          | Hex       | Usage                                          |
| -------------- | --------- | ---------------------------------------------- |
| Deep Navy      | `#1E3A5F` | Primary brand color, sidebar, headers, buttons |
| Gold Accent    | `#C8A951` | Accents, highlights, premium indicators, hover |
| Paper White    | `#FAFAF8` | Document background (warm white for eye comfort)|

### Light Mode

| Color            | Hex       | Usage                                        |
| ---------------- | --------- | -------------------------------------------- |
| Background       | `#FFFFFF` | App background                               |
| Surface          | `#F8FAFC` | Cards, panels, sidebars                      |
| Paper            | `#FAFAF8` | Document editor background (warm white)      |
| Border           | `#E2E8F0` | Card borders, dividers                       |
| Border Subtle    | `#F1F5F9` | Light separators, table rows                 |
| Text Primary     | `#0F172A` | Headlines, body text                         |
| Text Secondary   | `#475569` | Labels, captions, metadata                   |
| Text Muted       | `#94A3B8` | Placeholders, disabled text                  |
| Navy Primary     | `#1E3A5F` | Buttons, links, active states                |
| Navy Hover       | `#16304F` | Button hover state                           |
| Navy Light       | `#E8EDF4` | Navy tint for backgrounds, selections        |
| Gold Primary     | `#C8A951` | Accents, star ratings, premium badges        |
| Gold Hover       | `#B89840` | Gold hover state                             |
| Gold Light       | `#FDF8E8` | Gold tint for backgrounds                    |

### Dark Mode

| Color            | Hex       | Usage                                        |
| ---------------- | --------- | -------------------------------------------- |
| Background       | `#0F172A` | App background                               |
| Surface          | `#1E293B` | Cards, panels, sidebars                      |
| Paper            | `#1A2332` | Document editor background (dark warm)       |
| Border           | `#334155` | Card borders, dividers                       |
| Border Subtle    | `#1E293B` | Light separators                             |
| Text Primary     | `#F1F5F9` | Headlines, body text                         |
| Text Secondary   | `#94A3B8` | Labels, captions, metadata                   |
| Text Muted       | `#64748B` | Placeholders, disabled text                  |
| Navy Primary     | `#5B8DB8` | Buttons, links (lighter navy for contrast)   |
| Navy Hover       | `#6E9DC5` | Button hover state                           |
| Gold Primary     | `#D4B85C` | Accents (slightly brighter for dark bg)      |

### Semantic Colors

| Color          | Hex       | Usage                                          |
| -------------- | --------- | ---------------------------------------------- |
| Risk Red       | `#DC2626` | High risk clauses, critical alerts, overdue    |
| Risk Red Bg    | `#FEF2F2` | Risk red background tint (light mode)          |
| Risk Red Dark  | `#991B1B` | Risk red text on light backgrounds             |
| Caution Amber  | `#D97706` | Medium risk, warnings, approaching deadlines   |
| Caution Bg     | `#FFFBEB` | Amber background tint (light mode)             |
| Caution Dark   | `#92400E` | Amber text on light backgrounds                |
| Safe Green     | `#16A34A` | Low risk, approved, completed, safe clauses    |
| Safe Green Bg  | `#F0FDF4` | Green background tint (light mode)             |
| Safe Green Dark| `#166534` | Green text on light backgrounds                |
| Info Blue      | `#2563EB` | Informational, AI suggestions, inserted text   |
| Info Blue Bg   | `#EFF6FF` | Blue background tint (light mode)              |
| Info Blue Dark | `#1E40AF` | Blue text on light backgrounds                 |

### Track Changes Colors

| Color              | Hex       | Usage                                      |
| ------------------ | --------- | ------------------------------------------ |
| Insertion          | `#2563EB` | Inserted text (blue underline)             |
| Insertion Bg       | `#DBEAFE` | Inserted text background                   |
| Deletion           | `#DC2626` | Deleted text (red strikethrough)            |
| Deletion Bg        | `#FEE2E2` | Deleted text background                    |
| Modification       | `#D97706` | Modified formatting (amber highlight)      |
| Author 1           | `#2563EB` | First author's changes (blue)              |
| Author 2           | `#7C3AED` | Second author's changes (purple)           |
| Author 3           | `#059669` | Third author's changes (teal)              |
| Author 4           | `#DC2626` | Fourth author's changes (red)              |

---

## Typography

### Font Families

| Font               | Role                  | Fallback Stack                        |
| ------------------- | -------------------- | ------------------------------------- |
| Libre Baskerville   | Document headings    | Georgia, "Times New Roman", serif     |
| Inter               | UI text              | -apple-system, system-ui, sans-serif  |
| Source Serif Pro     | Contract body text   | Georgia, "Times New Roman", serif     |
| JetBrains Mono      | Clause IDs, codes    | "Fira Code", "Courier New", monospace |

**Why These Fonts:**
- **Libre Baskerville**: A transitional serif that evokes legal tradition and authority. Used for contract headings and document titles to create the visual weight lawyers expect.
- **Inter**: A modern, highly readable sans-serif for all UI elements. Excellent screen rendering, large x-height, and clear at small sizes. Familiar from modern SaaS tools.
- **Source Serif Pro**: Designed specifically for comfortable long-form reading on screen. Slightly more modern than traditional serif faces, with excellent readability at body text sizes. Used for contract content to reduce eye fatigue during extended review sessions.
- **JetBrains Mono**: Monospace font for clause identifiers (Section 3.2(a)(i)), version numbers, and code-like elements. Clear differentiation between similar characters (0 vs O, 1 vs l).

### Type Scale

| Level          | Font              | Size  | Weight   | Line Height | Letter Spacing |
| -------------- | ----------------- | ----- | -------- | ----------- | -------------- |
| Display        | Libre Baskerville | 32px  | 700      | 1.2         | -0.02em        |
| H1             | Libre Baskerville | 24px  | 700      | 1.3         | -0.01em        |
| H2             | Libre Baskerville | 20px  | 700      | 1.3         | -0.01em        |
| H3             | Inter             | 18px  | 600      | 1.4         | 0              |
| H4             | Inter             | 16px  | 600      | 1.4         | 0              |
| Body           | Inter             | 14px  | 400      | 1.6         | 0              |
| Body Small     | Inter             | 13px  | 400      | 1.5         | 0              |
| Caption        | Inter             | 12px  | 400      | 1.4         | 0.01em         |
| Overline       | Inter             | 11px  | 600      | 1.4         | 0.05em         |
| Contract Title | Libre Baskerville | 22px  | 700      | 1.3         | 0              |
| Contract Body  | Source Serif Pro  | 15px  | 400      | 1.8         | 0              |
| Contract H1    | Libre Baskerville | 18px  | 700      | 1.4         | 0              |
| Contract H2    | Source Serif Pro  | 16px  | 600      | 1.5         | 0              |
| Clause ID      | JetBrains Mono   | 13px  | 400      | 1.4         | 0              |

**Readability Notes:**
- Contract body text uses 1.8 line height -- significantly more generous than UI text. Lawyers read contracts for hours; reduced eye fatigue is critical
- Maximum line width for contract text: 72 characters (approximately 680px). Longer lines reduce reading comprehension
- Print layout: 12pt Source Serif Pro, 1.5 line spacing, standard legal margins (1" top/bottom, 1.25" sides)

---

## Default Theme Mode

**Light mode is the default.** Lawyers read documents on light backgrounds -- this is the universal convention in legal practice (paper, Word, PDF). Dark mode is available for users who prefer it, particularly for non-document screens (dashboard, analytics, settings), but the document editor defaults to warm paper white (#FAFAF8) even in dark mode for optimal reading.

### Dark Mode Document Options

Users can choose their document background in dark mode:
- **Paper White** (default): Standard warm white paper background, even in dark mode. Surroundings are dark, document is light.
- **Dark Paper**: Dark warm background (#1A2332) with light text. For users who prefer fully dark editing.
- **Sepia**: Warm sepia tone (#F5F0E1) for reduced blue light during extended reading.

---

## Icon Library

**Primary**: Heroicons (heroicons.com) -- 24px outline and solid variants

**Usage Guidelines:**
- Use outline style for navigation and non-active states
- Use solid style for active states, emphasis, and small sizes (16px and below)
- Custom icons for legal-specific concepts: clause, contract, redline, gavel, shield (risk), scales (negotiation)

**Icon Sizes:**
| Size  | Usage                                    |
| ----- | ---------------------------------------- |
| 16px  | Inline with text, table actions, badges  |
| 20px  | Buttons, list items, navigation items    |
| 24px  | Section headers, feature icons           |
| 32px  | Empty states, onboarding illustrations   |
| 48px  | Template type icons, large empty states  |

---

## Component Styling

### Clause Card

```
+----------------------------------------------------------+
| [Category Icon]  Indemnification - Standard               |
|                                                            |
| "Each party shall indemnify and hold harmless the other   |
|  party from and against any third-party claims..."        |
|                                                            |
| [Risk: Low]  [Approved]  [customer-friendly]              |
|                                                            |
| Used 89 times  |  Last used: Jan 15, 2026                 |
| [Insert]  [Edit]  [Copy]                                  |
+----------------------------------------------------------+

Styling:
- Background: white (light) / Surface (dark)
- Border: 1px solid Border color
- Border-radius: 8px
- Padding: 16px
- Shadow: sm (0 1px 2px rgba(0,0,0,0.05))
- Hover: shadow-md, border color transitions to Navy Light
- Category icon: 20px, colored by category
- Title: H4 (Inter 16px 600)
- Body preview: Body Small (Inter 13px 400), Text Secondary, max 2 lines with ellipsis
- Tags: pill badges below body text
```

### Risk Badge

```
Variants:
- Critical: Red background (#FEF2F2), red text (#991B1B), red left border (2px #DC2626)
- High:     Red background (#FEF2F2), red text (#991B1B)
- Medium:   Amber background (#FFFBEB), amber text (#92400E)
- Low:      Green background (#F0FDF4), green text (#166534)
- Info:     Blue background (#EFF6FF), blue text (#1E40AF)

Styling:
- Padding: 2px 8px
- Border-radius: 4px
- Font: Overline (Inter 11px 600, uppercase, 0.05em tracking)
- Icon: 14px filled circle or shield icon matching color
```

### Redline Highlight

```
Insertion:
- Background: #DBEAFE (light blue)
- Text decoration: underline, color #2563EB
- Border-left: 2px solid #2563EB (margin mark)

Deletion:
- Background: #FEE2E2 (light red)
- Text decoration: line-through, color #DC2626
- Border-left: 2px solid #DC2626 (margin mark)
- Text color: #94A3B8 (muted, to de-emphasize deleted content)

Modification:
- Background: #FFFBEB (light amber)
- Border-left: 2px solid #D97706 (margin mark)

Hover state (all): tooltip showing author, timestamp, and change description
```

### Approval Button

```
Approve:
- Background: #16A34A (Safe Green)
- Text: white, Inter 14px 600
- Hover: #15803D
- Icon: CheckCircle (Heroicons)
- Border-radius: 6px
- Padding: 8px 16px

Request Changes:
- Background: #D97706 (Caution Amber)
- Text: white
- Hover: #B45309
- Icon: ExclamationTriangle

Reject:
- Background: #DC2626 (Risk Red)
- Text: white
- Hover: #B91C1C
- Icon: XCircle

All buttons:
- Font-weight: 600
- Transition: background-color 150ms ease
- Focus: 2px ring offset, matching button color
- Disabled: opacity 0.5, cursor not-allowed
```

### Deadline Indicator

```
Overdue:
- Dot: 8px filled circle, #DC2626
- Text: #991B1B, font-weight 600
- Background: #FEF2F2
- Pulse animation on dot

Urgent (within 7 days):
- Dot: 8px filled circle, #D97706
- Text: #92400E, font-weight 500
- Background: #FFFBEB

Upcoming (within 30 days):
- Dot: 8px filled circle, #2563EB
- Text: #1E40AF
- Background: transparent

Normal (30+ days):
- Dot: 8px filled circle, #94A3B8
- Text: #475569
- Background: transparent

Styling:
- Layout: flex row, gap 8px
- Date format: "Feb 15, 2026" or "in 3 days" (relative for <7 days)
- Padding: 4px 8px
- Border-radius: 4px
```

### Contract Status Pill

```
Variants:
- Draft:        bg #F1F5F9, text #475569, border #E2E8F0
- In Review:    bg #EFF6FF, text #1E40AF, border #BFDBFE
- In Negotiation: bg #FFFBEB, text #92400E, border #FDE68A
- Executed:     bg #F0FDF4, text #166534, border #BBF7D0
- Expired:      bg #FEF2F2, text #991B1B, border #FECACA
- Archived:     bg #F8FAFC, text #94A3B8, border #E2E8F0

Styling:
- Padding: 2px 10px
- Border-radius: 9999px (fully rounded)
- Font: Body Small (Inter 13px 400)
- Border: 1px solid
- Dot indicator: 6px circle matching text color, left of label
```

### Sidebar Navigation Item

```
Default:
- Background: transparent
- Text: #94A3B8 (Text Muted)
- Icon: 20px, outline style, #94A3B8
- Padding: 8px 16px
- Border-radius: 6px
- Border-left: 3px solid transparent

Hover:
- Background: rgba(30, 58, 95, 0.08) -- navy at 8% opacity
- Text: #1E3A5F
- Icon: #1E3A5F

Active:
- Background: rgba(30, 58, 95, 0.12) -- navy at 12% opacity
- Text: #1E3A5F
- Font-weight: 600
- Icon: 20px, solid style, #1E3A5F
- Border-left: 3px solid #C8A951 (Gold accent)

Badge (notification count):
- Background: #DC2626
- Text: white, 11px, bold
- Border-radius: 9999px
- Min-width: 18px
- Padding: 1px 5px
- Position: right side of nav item
```

---

## Spacing System

| Token | Value | Usage                                     |
| ----- | ----- | ----------------------------------------- |
| xs    | 4px   | Tight gaps, inline spacing                |
| sm    | 8px   | Component internal padding, small gaps    |
| md    | 16px  | Standard padding, section gaps            |
| lg    | 24px  | Section spacing, card padding             |
| xl    | 32px  | Page section spacing                      |
| 2xl   | 48px  | Major section separation                  |
| 3xl   | 64px  | Page-level spacing, hero sections         |

---

## Shadow System

| Level  | Value                                     | Usage                          |
| ------ | ----------------------------------------- | ------------------------------ |
| sm     | 0 1px 2px rgba(0,0,0,0.05)               | Cards, subtle elevation        |
| md     | 0 4px 6px rgba(0,0,0,0.07)               | Dropdowns, hover cards         |
| lg     | 0 10px 15px rgba(0,0,0,0.10)             | Modals, dialogs                |
| xl     | 0 20px 25px rgba(0,0,0,0.12)             | Floating panels, command palette|

---

## Border Radius

| Token   | Value | Usage                               |
| ------- | ----- | ----------------------------------- |
| sm      | 4px   | Badges, small elements              |
| md      | 6px   | Buttons, inputs                     |
| lg      | 8px   | Cards, panels                       |
| xl      | 12px  | Modals, large containers            |
| full    | 9999px| Pills, circular avatars             |

---

## Animation & Transitions

| Property        | Duration | Easing                | Usage                          |
| --------------- | -------- | --------------------- | ------------------------------ |
| Background      | 150ms    | ease                  | Button hover, nav item hover   |
| Border color    | 150ms    | ease                  | Input focus, card hover        |
| Shadow          | 200ms    | ease-out              | Card hover elevation           |
| Opacity         | 200ms    | ease                  | Fade in/out elements           |
| Transform       | 200ms    | ease-out              | Sidebar collapse, panel slide  |
| Color            | 100ms    | ease                  | Text color changes             |

**Animation Guidelines:**
- Animations should be subtle and professional -- no bouncing, no playful effects
- Respect `prefers-reduced-motion` media query: disable all non-essential animations
- Loading states use gentle pulse or skeleton loaders, never spinners that feel frantic
- AI processing: subtle pulsing glow on the AI sidebar border to indicate processing

---

## Print Styles

Contracts must print well. Print stylesheet considerations:

- Font: Source Serif Pro at 12pt
- Line spacing: 1.5
- Margins: 1" top/bottom, 1.25" left/right
- Page numbers: bottom center
- Header: contract title on every page (top right)
- Colors: all risk highlights converted to grayscale borders
- Track changes: visible in print with strikethrough/underline
- No UI elements printed (sidebar, toolbar, status bar hidden)
- Page breaks: avoid breaking in the middle of a clause
- Watermark support: DRAFT, CONFIDENTIAL, FINAL (light gray, diagonal, centered)

---

## Responsive Considerations (Desktop)

While LegalForge is desktop-first, the Electron window can be resized:

| Window Width   | Layout Adjustment                                    |
| -------------- | ---------------------------------------------------- |
| > 1440px       | Full layout, sidebar + editor + AI panel             |
| 1200-1440px    | Sidebar collapsed to icons, editor + AI panel        |
| 1024-1200px    | Sidebar hidden, editor + AI panel (toggleable)       |
| < 1024px       | Minimum supported width. Single panel with tabs      |

Minimum supported window size: 1024 x 768px
