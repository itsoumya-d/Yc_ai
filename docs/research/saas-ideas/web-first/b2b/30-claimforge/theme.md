# ClaimForge — Brand Theme & Design System

## Design Philosophy

ClaimForge serves investigators who build cases against fraud. The design must communicate authority without intimidation, precision without sterility, and seriousness without darkness. Every visual decision reinforces one message: **this tool finds the truth**.

The interface is an investigator's workbench — dense with evidence, organized for analysis, built for long sessions. It is not a consumer app. It is not playful. It is the visual equivalent of a forensic accountant's office: meticulous, well-lit, and deeply functional.

---

## Brand Personality

| Trait              | Expression                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Authoritative**  | Deep blues, serif headings, structured layouts. The tool speaks with the weight of evidence. |
| **Investigative**  | Dense information layouts, network graphs, data overlays. Every element invites deeper exploration. |
| **Precise**        | Monospaced financial figures, exact confidence percentages, pixel-perfect alignment. No ambiguity. |
| **Justice-Oriented** | Gold accents recall scales of justice. Green for verified. Red for fraud. The palette tells the story of right and wrong. |
| **Serious**        | Restrained animations, no gratuitous decoration, no emoji. Every pixel earns its place. |
| **Not Intimidating** | Warm stone backgrounds (not cold gray), readable typography, generous whitespace in content areas. The tool is approachable to attorneys who are not technical. |

### Voice & Tone

- **Headlines**: Declarative, concise. "3 Critical Patterns Detected." Not "We Found Some Issues!"
- **Body Text**: Professional, factual. Written for attorneys and analysts. No jargon simplification unless in onboarding.
- **Error Messages**: Direct and actionable. "OCR failed on page 3. Retry or upload a clearer scan." Not "Oops! Something went wrong."
- **Empty States**: Instructive, not cute. "Upload documents to begin analysis." Not "It's lonely in here!"
- **Confidence Scores**: Always displayed as percentages with one decimal. "87.3% confidence." Not "High confidence."

---

## Color Palette

### Primary Colors

| Name               | Hex       | Usage                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| **Justice Blue**   | `#1E40AF` | Primary brand color. Buttons, links, active states, sidebar accents. Conveys authority and trust. |
| **Evidence Gold**  | `#B45309` | Secondary accent. Highlights, important callouts, financial figures, badge accents. Evokes scales of justice. |
| **White**          | `#FFFFFF` | Primary text on dark surfaces, card backgrounds in light mode, icons on colored backgrounds. |

### Background Colors

| Name               | Hex       | Usage                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| **Dark Background** | `#0C0A09` | Deepest background layer. Sidebar, page background in dark mode. Stone-900 warm tone. |
| **Surface**        | `#1C1917` | Card backgrounds, panels, elevated surfaces in dark mode. Stone-800. |
| **Surface Elevated** | `#292524` | Modals, dropdowns, tooltips in dark mode. Stone-700.   |
| **Surface Hover**  | `#44403C` | Hover states on surfaces in dark mode. Stone-600.       |

### Semantic Colors

| Name               | Hex       | Usage                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| **Fraud Red**      | `#DC2626` | Fraud detected alerts, critical severity badges, destructive actions. Red-600. |
| **Verified Green** | `#059669` | Verified data, completed status, legitimate transactions. Emerald-600. |
| **Suspicious Amber** | `#D97706` | Warnings, medium severity, needs-review states. Amber-600. |
| **Neutral Gray**   | `#6B7280` | Secondary text, borders, disabled states, placeholder text. Gray-500. |

### Extended Palette

| Name               | Hex       | Usage                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| **Blue Light**     | `#3B82F6` | Links in body text, interactive elements in dark mode. Blue-500. |
| **Blue Pale**      | `#DBEAFE` | Selection highlights, active tab backgrounds in light mode. Blue-100. |
| **Red Light**      | `#FEE2E2` | Error message backgrounds in light mode. Red-100.       |
| **Red Dark**       | `#991B1B` | Error text on light backgrounds. Red-800.               |
| **Green Light**    | `#D1FAE5` | Success message backgrounds in light mode. Emerald-100. |
| **Green Dark**     | `#065F46` | Success text on light backgrounds. Emerald-800.         |
| **Amber Light**    | `#FEF3C7` | Warning message backgrounds in light mode. Amber-100.   |
| **Amber Dark**     | `#92400E` | Warning text on light backgrounds. Amber-800.           |
| **Gold Highlight** | `#FDE68A` | Entity highlighting in document viewer (amounts). Amber-200 with 40% opacity. |
| **Blue Highlight** | `#BFDBFE` | Entity highlighting in document viewer (names). Blue-200 with 40% opacity. |
| **Green Highlight**| `#A7F3D0` | Entity highlighting in document viewer (dates). Emerald-200 with 40% opacity. |

### Graph-Specific Colors

| Node Type          | Hex       | Shape                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| **Person**         | `#3B82F6` | Circle (blue-500)                                        |
| **Organization**   | `#B45309` | Rounded rectangle (evidence gold)                        |
| **Payment**        | `#059669` | Diamond (verified green)                                 |
| **Contract**       | `#6B7280` | Hexagon (neutral gray)                                   |
| **Fraud Node**     | `#DC2626` | Same shape as type, red glow border, pulsing animation   |

---

## Typography

### Font Stack

| Font               | Role                  | Weight Range | Fallback Stack                          |
| ------------------ | --------------------- | ------------ | --------------------------------------- |
| **Source Serif Pro** | Case headings, page titles, report headers | 600, 700 | Georgia, "Times New Roman", serif     |
| **Inter**          | Body text, UI labels, navigation, buttons, form inputs | 400, 500, 600, 700 | -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif |
| **JetBrains Mono** | Financial figures, case numbers, document IDs, code, confidence percentages | 400, 500, 600 | "Fira Code", "Cascadia Code", monospace |

### Type Scale

| Token              | Size   | Line Height | Weight | Font             | Usage                                |
| ------------------ | ------ | ----------- | ------ | ---------------- | ------------------------------------ |
| `display`          | 36px   | 1.2         | 700    | Source Serif Pro | Dashboard title, marketing headings  |
| `heading-1`        | 28px   | 1.3         | 700    | Source Serif Pro | Page titles ("Case #2024-031")       |
| `heading-2`        | 22px   | 1.3         | 600    | Source Serif Pro | Section headings ("Fraud Findings")  |
| `heading-3`        | 18px   | 1.4         | 600    | Inter            | Card titles, subsection headings     |
| `heading-4`        | 16px   | 1.4         | 600    | Inter            | Minor headings, list section titles  |
| `body-lg`          | 16px   | 1.6         | 400    | Inter            | Primary body text, descriptions      |
| `body`             | 14px   | 1.6         | 400    | Inter            | Standard body text, table cells      |
| `body-sm`          | 13px   | 1.5         | 400    | Inter            | Secondary text, metadata, timestamps |
| `caption`          | 12px   | 1.4         | 400    | Inter            | Labels, helper text, footnotes       |
| `overline`         | 11px   | 1.3         | 600    | Inter            | Category labels, section overlines. Uppercase, letter-spacing 0.05em |
| `mono-lg`          | 16px   | 1.5         | 500    | JetBrains Mono   | Large financial figures ("$4,237,891.00") |
| `mono`             | 14px   | 1.5         | 400    | JetBrains Mono   | Case numbers, document IDs, inline code |
| `mono-sm`          | 12px   | 1.4         | 400    | JetBrains Mono   | Small financial data, table amounts  |

### Typography Rules

- **Financial figures**: Always rendered in JetBrains Mono. Always include commas and two decimal places for dollar amounts.
- **Case numbers**: JetBrains Mono, medium weight. Format: `#YYYY-NNN`.
- **Confidence scores**: JetBrains Mono. Always one decimal place: `87.3%`.
- **Headings in reports**: Source Serif Pro to convey legal authority and formality.
- **UI elements**: Inter for all interactive elements (buttons, form labels, navigation).
- **No text smaller than 11px**: Accessibility minimum. Even in dense data tables.
- **Tabular numbers**: Always use `font-variant-numeric: tabular-nums` for financial columns to ensure alignment.

---

## Layout System

### Grid

- **Base unit**: 4px
- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px
- **Content max-width**: 1440px (dashboard), no max-width on analysis screens (use full viewport)
- **Column grid**: 12-column grid with 24px gutters on desktop
- **Sidebar width**: 240px expanded, 64px collapsed

### Information Density

ClaimForge optimizes for density over whitespace. Investigators want to see as much evidence as possible without scrolling.

| Principle                 | Implementation                                            |
| ------------------------- | --------------------------------------------------------- |
| **Dense tables**          | Row height 40px (not 56px). Compact padding (8px 12px). |
| **Tight card spacing**    | 12px gap between cards (not 24px).                       |
| **Multi-panel layouts**   | Side-by-side panels preferred over stacked.               |
| **Scrollable regions**    | Individual panels scroll independently. Page does not scroll when panels are open. |
| **Collapsible sections**  | Sections collapse to headers when not in focus.           |
| **Sticky headers**        | Table headers and panel headers stick on scroll.         |
| **Truncation rules**      | Text truncates with ellipsis. Full text on hover tooltip. |

### Evidence-Centric Design Principles

1. **Documents are first class**: The document viewer is the most important component. It gets the most screen space.
2. **Linked data**: Every piece of data links to its source. Click a fraud finding to see the document. Click an entity to see all related documents.
3. **Layered detail**: Overview first, then drill down. Dashboard > Case > Analysis > Document > Entity.
4. **Annotations are persistent**: Notes and highlights are always visible on their source documents. No hidden annotation modes.
5. **Confidence is always visible**: Every AI-generated piece of data shows its confidence score. Users always know what is certain and what is inferred.

---

## Icon Library: Lucide React

All icons use **Lucide React** (`lucide-react`). Consistent 24px default size, 1.5px stroke width.

### Icon Mappings

| Concept                  | Icon Name          | Usage Context                              |
| ------------------------ | ------------------ | ------------------------------------------ |
| Case / Investigation     | `FileSearch`       | Case list, new case                        |
| Document                 | `FileText`         | Document list, upload                      |
| Upload                   | `Upload`           | Document upload button, drop zone          |
| Fraud Alert              | `ShieldAlert`      | Fraud pattern detected                     |
| Verified                 | `ShieldCheck`      | Verified/legitimate finding                |
| Network Graph            | `Network`          | Entity network analysis                    |
| Timeline                 | `Clock`            | Evidence timeline                          |
| Statistics               | `BarChart3`        | Statistical analysis                       |
| Report / Export          | `FileOutput`       | Report generator, export                   |
| Person Entity            | `User`             | Person nodes in graph, entity lists        |
| Organization Entity      | `Building2`        | Organization nodes, entity lists           |
| Payment / Amount         | `DollarSign`       | Payment edges, financial amounts           |
| Contract                 | `FileSignature`    | Contract entities, procurement records     |
| Search                   | `Search`           | Global search, command palette             |
| Filter                   | `Filter`           | Filter controls                            |
| Settings                 | `Settings`         | Settings navigation                        |
| Team / Users             | `Users`            | Team management                            |
| Lock / Security          | `Lock`             | Encryption indicator, secure areas         |
| Calendar / Date          | `Calendar`         | Date entities, timeline dates              |
| Tag                      | `Tag`              | Evidence tagging                           |
| Annotation / Note        | `StickyNote`       | Document annotations                       |
| Link                     | `Link`             | Cross-document references                  |
| Warning                  | `AlertTriangle`    | Warning states, medium severity            |
| Critical                 | `AlertOctagon`     | Critical severity, urgent alerts           |
| Success                  | `CheckCircle`      | Completed processing, verified items       |
| Expand / Collapse        | `ChevronDown`      | Expandable sections, dropdowns             |
| External Link            | `ExternalLink`     | Links to government databases              |
| Download                 | `Download`         | Export, download reports                    |
| Trash                    | `Trash2`           | Delete actions (with confirmation)         |
| Eye                      | `Eye`              | View/preview actions                       |
| Audit Log                | `ScrollText`       | Audit trail, activity log                  |
| Confidence               | `Gauge`            | Confidence score indicators                |

### Icon Rules

- **Size**: 16px in tables and inline, 20px in buttons and navigation, 24px in empty states and headers.
- **Color**: Inherits text color by default. Semantic icons use semantic colors (red for fraud, green for verified).
- **Stroke width**: 1.5px standard, 2px for emphasis (empty state illustrations).
- **No filled icons**: Always use outline (stroke) variants for consistency.

---

## Component Styling

### Case Card

The primary unit for browsing investigations.

```
+----------------------------------------------------------+
| [FileSearch icon] #2024-031                     [CRITICAL]|
| Defense Procurement Fraud — TechServ Investigation        |
|                                                           |
| Status: Investigation    Est. Fraud: $4.2M               |
| Docs: 1,247             Patterns: 12                      |
| Last Activity: 2h ago                                     |
|                                                           |
| [defense] [phantom-vendor] [critical]                     |
+----------------------------------------------------------+
```

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Background          | `#1C1917` (surface)                     | `#FFFFFF`                               |
| Border              | `1px solid #292524` (surface-elevated)  | `1px solid #E5E7EB` (gray-200)         |
| Border Radius       | `8px`                                   | `8px`                                   |
| Padding             | `16px`                                  | `16px`                                  |
| Shadow              | None                                    | `0 1px 3px rgba(0,0,0,0.1)`            |
| Hover               | Border color `#44403C`, subtle bg shift | Border color `#D1D5DB`, shadow increase |
| Case Number         | `mono` token, `#FFFFFF`                 | `mono` token, `#0C0A09`                |
| Title               | `heading-3`, `#FFFFFF`                  | `heading-3`, `#0C0A09`                 |
| Metadata            | `body-sm`, `#A8A29E` (stone-400)        | `body-sm`, `#6B7280` (gray-500)        |
| Tags                | Pill badges, `caption` token            | Pill badges, `caption` token            |

### Evidence Document Tile

Compact representation of a processed document in the document list.

```
+----------------------------------------------------------+
| [FileText] invoice_2024_001.pdf            [Invoice] [!3] |
| 3 entities extracted | 1 red flag | Processed 2h ago     |
| Confidence: 94.2%                                         |
+----------------------------------------------------------+
```

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Background          | `#1C1917`                               | `#FFFFFF`                               |
| Border Left         | `3px solid` (color by document type)    | `3px solid` (color by document type)    |
| Left Border Colors  | Invoice: `#B45309`, Contract: `#6B7280`, Email: `#3B82F6`, Financial: `#059669` | Same |
| Red Flag Badge      | Red background `#DC2626` with white number | Same                                 |
| File Name           | `body`, `font-weight: 500`, `#FFFFFF`   | `body`, `font-weight: 500`, `#0C0A09`  |
| Metadata            | `body-sm`, `#A8A29E`                    | `body-sm`, `#6B7280`                   |
| Hover               | Background `#292524`                    | Background `#F9FAFB`                   |
| Click               | Opens document viewer with analysis panel |                                       |

### Fraud Pattern Alert Card

The most important component. Displays detected fraud with severity and evidence.

```
+----------------------------------------------------------+
| [!] CRITICAL                                    94.2%     |
|     Phantom Vendor Detected                [============] |
|                                                           |
| Vendor "TechServ Solutions LLC" appears in 23 invoices    |
| totaling $1.2M but has no verifiable business address.    |
|                                                           |
| Evidence: 23 documents | 4 entities                      |
| [View Evidence] [Add to Timeline] [Export]                |
+----------------------------------------------------------+
```

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Background          | `#1C1917`                               | `#FFFFFF`                               |
| Border Left         | `4px solid` (severity color)            | `4px solid` (severity color)            |
| Critical Border     | `#DC2626` (fraud red)                   | `#DC2626`                               |
| High Border         | `#D97706` (suspicious amber)            | `#D97706`                               |
| Medium Border       | `#3B82F6` (blue)                        | `#3B82F6`                               |
| Low Border          | `#6B7280` (neutral gray)               | `#6B7280`                               |
| Severity Badge      | Uppercase `overline`, colored pill      | Same                                    |
| Confidence Bar      | Track: `#292524`, fill: severity color  | Track: `#E5E7EB`, fill: severity color  |
| Confidence Text     | `mono` token, severity color            | Same                                    |
| Description         | `body`, `#D6D3D1` (stone-300)          | `body`, `#374151` (gray-700)            |
| Evidence Links      | `body-sm`, `#3B82F6` underline on hover | Same                                   |
| Action Buttons      | Ghost buttons, `body-sm`, `#A8A29E`    | Ghost buttons, `body-sm`, `#6B7280`     |

### Entity Node (Network Graph)

Nodes in the entity relationship graph.

| Property            | Person                    | Organization              | Payment                   | Contract                  |
| ------------------- | ------------------------- | ------------------------- | ------------------------- | ------------------------- |
| Shape               | Circle (r=24px)           | Rounded rect (48x32px)   | Diamond (32x32px)         | Hexagon (r=24px)          |
| Fill                | `#3B82F6` at 20% opacity | `#B45309` at 20% opacity | `#059669` at 20% opacity | `#6B7280` at 20% opacity |
| Stroke              | `#3B82F6` 2px            | `#B45309` 2px            | `#059669` 2px            | `#6B7280` 2px            |
| Label               | `caption`, below node     | `caption`, inside rect    | `mono-sm`, below node     | `caption`, below node     |
| Hover               | Fill 40% opacity, tooltip | Fill 40% opacity, tooltip | Fill 40% opacity, tooltip | Fill 40% opacity, tooltip |
| Selected            | Stroke 3px, glow shadow   | Stroke 3px, glow shadow   | Stroke 3px, glow shadow   | Stroke 3px, glow shadow   |
| Fraud-Flagged       | Red glow: `0 0 12px rgba(220,38,38,0.6)`, pulsing animation | Same | Same | Same |

### Timeline Entry

Individual event in the evidence timeline.

```
  2022-03-02
      |
      +--- SUBCONTRACT ISSUED
      |    DefenseCo subcontracts to TechServ Solutions LLC.
      |    TechServ incorporated just 2 weeks prior.
      |    Docs: subcontract_techserv.pdf
      |    [!] Phantom vendor (94.2%)
```

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Date Label          | `mono`, `#A8A29E`                       | `mono`, `#6B7280`                       |
| Timeline Track      | `2px solid #292524`                     | `2px solid #E5E7EB`                     |
| Track Node          | `8px` circle, `#1E40AF` fill           | Same                                    |
| Track Node (fraud)  | `8px` circle, `#DC2626` fill, glow     | Same                                    |
| Event Title         | `heading-4`, `#FFFFFF`                  | `heading-4`, `#0C0A09`                  |
| Event Description   | `body-sm`, `#D6D3D1`                   | `body-sm`, `#374151`                    |
| Event Card          | Background `#1C1917`, border `#292524` | Background `#FFFFFF`, border `#E5E7EB`  |
| Fraud Flag          | Inline red badge with confidence score  | Same                                    |
| Document Links      | `body-sm`, `#3B82F6`                   | Same                                    |

### Statistical Chart

Styling for Recharts and D3 visualizations.

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Chart Background    | Transparent (inherits surface)          | Transparent (inherits white)            |
| Grid Lines          | `#292524` (surface-elevated)            | `#F3F4F6` (gray-100)                   |
| Axis Labels         | `caption`, `#A8A29E`                    | `caption`, `#6B7280`                   |
| Axis Lines          | `#44403C` (surface-hover)              | `#D1D5DB` (gray-300)                   |
| Expected Bar        | `#3B82F6` at 40% opacity               | Same                                    |
| Actual Bar          | `#3B82F6` solid                         | Same                                    |
| Deviation Bar       | `#DC2626` solid                         | Same                                    |
| Tooltip Background  | `#292524`                               | `#FFFFFF`                               |
| Tooltip Border      | `1px solid #44403C`                     | `1px solid #E5E7EB`                     |
| Tooltip Text        | `body-sm`, `#FFFFFF`                    | `body-sm`, `#0C0A09`                   |
| Anomaly Dot         | `#DC2626`, 6px radius, glow on hover   | Same                                    |
| Normal Dot          | `#3B82F6`, 4px radius                  | Same                                    |

### Confidence Score Badge

Compact visual for AI confidence levels.

```
[====================================    ] 87.3%
```

| Confidence Range | Color                    | Label       |
| ---------------- | ------------------------ | ----------- |
| 90-100%          | `#059669` (verified green) | Very High |
| 75-89%           | `#3B82F6` (blue)         | High        |
| 50-74%           | `#D97706` (suspicious amber) | Medium  |
| 25-49%           | `#DC2626` (fraud red)    | Low         |
| 0-24%            | `#6B7280` (neutral gray) | Very Low    |

| Property            | Dark Mode                               | Light Mode                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Track Background    | `#292524`                               | `#E5E7EB`                               |
| Fill                | Confidence range color                  | Same                                    |
| Text                | `mono-sm`, confidence range color       | Same                                    |
| Height              | `6px` (inline), `8px` (card)           | Same                                    |
| Border Radius       | `999px` (fully rounded)                | Same                                    |

### Annotation Marker

Document annotation indicators in the document viewer.

| Type            | Icon             | Color        | Behavior                                |
| --------------- | ---------------- | ------------ | --------------------------------------- |
| Highlight       | None (inline)    | Configurable | Yellow, green, red, blue overlay on text |
| Sticky Note     | `StickyNote`     | `#B45309`    | Small icon in margin. Click to expand note panel. |
| Tag             | `Tag`            | `#1E40AF`    | Pill badge on highlighted text           |
| Link            | `Link`           | `#3B82F6`    | Underline with link icon. Click opens linked document. |
| Red Flag (AI)   | `AlertTriangle`  | `#DC2626`    | Pulsing margin indicator. AI-generated fraud flag. |

---

## Dark Mode (Default)

Dark mode is the default theme. Investigators work long hours reviewing documents and financial data. Dark mode reduces eye strain during extended sessions.

### Dark Mode Token Map

| Token                    | Value                | Hex         |
| ------------------------ | -------------------- | ----------- |
| `--bg-page`              | Stone 900            | `#0C0A09`   |
| `--bg-surface`           | Stone 800            | `#1C1917`   |
| `--bg-surface-elevated`  | Stone 700            | `#292524`   |
| `--bg-surface-hover`     | Stone 600            | `#44403C`   |
| `--bg-surface-active`    | Stone 600 + Blue tint | `#1E3A5F`  |
| `--text-primary`         | White                | `#FFFFFF`   |
| `--text-secondary`       | Stone 400            | `#A8A29E`   |
| `--text-tertiary`        | Stone 500            | `#78716C`   |
| `--text-disabled`        | Stone 600            | `#57534E`   |
| `--border-default`       | Stone 700            | `#292524`   |
| `--border-strong`        | Stone 600            | `#44403C`   |
| `--border-focus`         | Blue 500             | `#3B82F6`   |
| `--accent-primary`       | Blue 700             | `#1E40AF`   |
| `--accent-primary-hover` | Blue 600             | `#2563EB`   |
| `--accent-secondary`     | Amber 700            | `#B45309`   |
| `--accent-secondary-hover` | Amber 600          | `#D97706`   |
| `--status-fraud`         | Red 600              | `#DC2626`   |
| `--status-verified`      | Emerald 600          | `#059669`   |
| `--status-warning`       | Amber 600            | `#D97706`   |
| `--status-neutral`       | Gray 500             | `#6B7280`   |
| `--status-info`          | Blue 500             | `#3B82F6`   |

### Dark Mode Component Overrides

| Component           | Property                              | Value                  |
| ------------------- | ------------------------------------- | ---------------------- |
| Sidebar             | Background                            | `#0C0A09`              |
| Sidebar             | Active item background                | `#1E40AF` at 15% opacity |
| Sidebar             | Active item text                      | `#FFFFFF`              |
| Sidebar             | Inactive item text                    | `#A8A29E`              |
| Top Bar             | Background                            | `#1C1917`              |
| Top Bar             | Border bottom                         | `1px solid #292524`    |
| Card                | Background                            | `#1C1917`              |
| Card                | Border                                | `1px solid #292524`    |
| Table Header        | Background                            | `#292524`              |
| Table Row           | Background                            | `#1C1917`              |
| Table Row Hover     | Background                            | `#292524`              |
| Table Row Stripe    | Background                            | `#1C1917` / `#211F1D`  |
| Input               | Background                            | `#292524`              |
| Input               | Border                                | `1px solid #44403C`    |
| Input Focus         | Border                                | `2px solid #3B82F6`    |
| Button Primary      | Background                            | `#1E40AF`              |
| Button Primary Hover| Background                            | `#2563EB`              |
| Button Primary Text | Color                                 | `#FFFFFF`              |
| Button Ghost        | Background                            | Transparent            |
| Button Ghost        | Text                                  | `#A8A29E`              |
| Button Ghost Hover  | Background                            | `#292524`              |
| Dropdown            | Background                            | `#292524`              |
| Dropdown            | Border                                | `1px solid #44403C`    |
| Dropdown Item Hover | Background                            | `#44403C`              |
| Modal Overlay       | Background                            | `rgba(0,0,0,0.7)`     |
| Modal               | Background                            | `#1C1917`              |
| Modal               | Border                                | `1px solid #292524`    |
| Scrollbar Track     | Background                            | `#1C1917`              |
| Scrollbar Thumb     | Background                            | `#44403C`              |
| Scrollbar Thumb Hover | Background                          | `#57534E`              |
| Badge (tag)         | Background                            | `#292524`              |
| Badge (tag)         | Text                                  | `#A8A29E`              |
| Badge (tag)         | Border                                | `1px solid #44403C`    |
| Toast (success)     | Background                            | `#065F46` at 90% opacity |
| Toast (error)       | Background                            | `#991B1B` at 90% opacity |
| Toast (warning)     | Background                            | `#92400E` at 90% opacity |
| Tooltip             | Background                            | `#292524`              |
| Tooltip             | Text                                  | `#FFFFFF`              |
| Tooltip             | Border                                | `1px solid #44403C`    |

---

## Light Mode

Light mode is available for users who prefer it, for courtroom presentations, for print preview, and for conference settings where screens are visible to others.

### Light Mode Token Map

| Token                    | Value                | Hex         |
| ------------------------ | -------------------- | ----------- |
| `--bg-page`              | Gray 50              | `#F9FAFB`   |
| `--bg-surface`           | White                | `#FFFFFF`   |
| `--bg-surface-elevated`  | White                | `#FFFFFF`   |
| `--bg-surface-hover`     | Gray 50              | `#F9FAFB`   |
| `--bg-surface-active`    | Blue 50              | `#EFF6FF`   |
| `--text-primary`         | Stone 900            | `#0C0A09`   |
| `--text-secondary`       | Gray 500             | `#6B7280`   |
| `--text-tertiary`        | Gray 400             | `#9CA3AF`   |
| `--text-disabled`        | Gray 300             | `#D1D5DB`   |
| `--border-default`       | Gray 200             | `#E5E7EB`   |
| `--border-strong`        | Gray 300             | `#D1D5DB`   |
| `--border-focus`         | Blue 500             | `#3B82F6`   |
| `--accent-primary`       | Blue 700             | `#1E40AF`   |
| `--accent-primary-hover` | Blue 800             | `#1E3A8A`   |
| `--accent-secondary`     | Amber 700            | `#B45309`   |
| `--accent-secondary-hover` | Amber 800          | `#92400E`   |
| `--status-fraud`         | Red 600              | `#DC2626`   |
| `--status-verified`      | Emerald 600          | `#059669`   |
| `--status-warning`       | Amber 600            | `#D97706`   |
| `--status-neutral`       | Gray 500             | `#6B7280`   |
| `--status-info`          | Blue 500             | `#3B82F6`   |

### Light Mode Component Overrides

| Component           | Property                              | Value                  |
| ------------------- | ------------------------------------- | ---------------------- |
| Sidebar             | Background                            | `#FFFFFF`              |
| Sidebar             | Border right                          | `1px solid #E5E7EB`   |
| Sidebar             | Active item background                | `#EFF6FF`              |
| Sidebar             | Active item text                      | `#1E40AF`              |
| Sidebar             | Inactive item text                    | `#6B7280`              |
| Top Bar             | Background                            | `#FFFFFF`              |
| Top Bar             | Border bottom                         | `1px solid #E5E7EB`   |
| Card                | Background                            | `#FFFFFF`              |
| Card                | Border                                | `1px solid #E5E7EB`   |
| Card                | Shadow                                | `0 1px 3px rgba(0,0,0,0.1)` |
| Table Header        | Background                            | `#F9FAFB`              |
| Table Row           | Background                            | `#FFFFFF`              |
| Table Row Hover     | Background                            | `#F9FAFB`              |
| Table Row Stripe    | Background                            | `#FFFFFF` / `#F9FAFB`  |
| Input               | Background                            | `#FFFFFF`              |
| Input               | Border                                | `1px solid #D1D5DB`    |
| Input Focus         | Border                                | `2px solid #3B82F6`    |
| Button Primary      | Background                            | `#1E40AF`              |
| Button Primary Hover| Background                            | `#1E3A8A`              |
| Button Primary Text | Color                                 | `#FFFFFF`              |
| Button Ghost        | Background                            | Transparent            |
| Button Ghost        | Text                                  | `#6B7280`              |
| Button Ghost Hover  | Background                            | `#F9FAFB`              |
| Dropdown            | Background                            | `#FFFFFF`              |
| Dropdown            | Border                                | `1px solid #E5E7EB`    |
| Dropdown            | Shadow                                | `0 4px 12px rgba(0,0,0,0.1)` |
| Dropdown Item Hover | Background                            | `#F9FAFB`              |
| Modal Overlay       | Background                            | `rgba(0,0,0,0.4)`     |
| Modal               | Background                            | `#FFFFFF`              |
| Modal               | Border                                | `1px solid #E5E7EB`    |
| Modal               | Shadow                                | `0 8px 32px rgba(0,0,0,0.15)` |
| Scrollbar Track     | Background                            | `#F3F4F6`              |
| Scrollbar Thumb     | Background                            | `#D1D5DB`              |
| Scrollbar Thumb Hover | Background                          | `#9CA3AF`              |
| Badge (tag)         | Background                            | `#F3F4F6`              |
| Badge (tag)         | Text                                  | `#374151`              |
| Badge (tag)         | Border                                | `1px solid #E5E7EB`    |
| Toast (success)     | Background                            | `#D1FAE5`              |
| Toast (success)     | Text                                  | `#065F46`              |
| Toast (error)       | Background                            | `#FEE2E2`              |
| Toast (error)       | Text                                  | `#991B1B`              |
| Toast (warning)     | Background                            | `#FEF3C7`              |
| Toast (warning)     | Text                                  | `#92400E`              |
| Tooltip             | Background                            | `#0C0A09`              |
| Tooltip             | Text                                  | `#FFFFFF`              |

---

## Animation & Motion

### Motion Principles

- **Purposeful**: Animations communicate state changes, not decoration. Loading, expanding, transitioning.
- **Restrained**: No bouncing, no elastic, no playful easing. This is a legal investigation tool.
- **Respect user preferences**: Honor `prefers-reduced-motion: reduce`. Disable all non-essential animation.

### Motion Tokens

| Token                    | Duration | Easing                           | Usage                          |
| ------------------------ | -------- | -------------------------------- | ------------------------------ |
| `--transition-fast`      | 100ms    | `ease-out`                       | Hover states, focus rings      |
| `--transition-base`      | 200ms    | `ease-in-out`                    | Dropdowns, tooltips, toggles   |
| `--transition-slow`      | 300ms    | `ease-in-out`                    | Sidebar collapse, panel slide  |
| `--transition-expand`    | 250ms    | `cubic-bezier(0.4, 0, 0.2, 1)` | Card expansion, section reveal |

### Specific Animations

| Animation              | Duration | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| Sidebar collapse       | 300ms    | Width animates from 240px to 64px. Labels fade out at 150ms. Icons remain. |
| Card hover             | 100ms    | Border color transition. No scale or lift.               |
| Modal open             | 200ms    | Fade in overlay (opacity 0 to 1). Modal slides up 8px. |
| Modal close            | 150ms    | Reverse of open. Slightly faster for responsiveness.    |
| Toast enter            | 250ms    | Slide in from top-right, fade in.                       |
| Toast exit             | 200ms    | Slide out to right, fade out.                           |
| Fraud alert pulse      | 2000ms   | Subtle red glow pulse on critical fraud findings. `animation: pulse 2s ease-in-out infinite` |
| Processing spinner     | 1000ms   | Simple rotation. No complex spinners.                   |
| Skeleton shimmer       | 1500ms   | Subtle left-to-right shimmer on skeleton placeholders.  |
| Graph node hover       | 150ms    | Opacity fill increase from 20% to 40%.                  |
| Graph fraud glow       | 2000ms   | Red glow pulse matching fraud alert pulse.              |
| Confidence bar fill    | 400ms    | Bar fills from 0% to value on mount. One-time animation. |
| Tab transition         | 200ms    | Content fade out (100ms), fade in (100ms). No slide.    |

### Reduced Motion Overrides

When `prefers-reduced-motion: reduce` is active:

- All transitions set to `0ms` duration
- Fraud alert pulse replaced with static red border (no animation)
- Graph fraud glow replaced with static red border
- Skeleton shimmer replaced with static gray fill
- Confidence bar shows at final value immediately (no fill animation)
- Processing spinner remains (essential for communicating loading state) but at 50% speed
- Toasts appear instantly without slide animation

---

## Tailwind CSS Configuration

```js
// tailwind.config.js (relevant theme extensions)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'justice-blue': {
          DEFAULT: '#1E40AF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A5F',
        },
        'evidence-gold': {
          DEFAULT: '#B45309',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        'fraud-red': {
          DEFAULT: '#DC2626',
          100: '#FEE2E2',
          600: '#DC2626',
          800: '#991B1B',
        },
        'verified-green': {
          DEFAULT: '#059669',
          100: '#D1FAE5',
          600: '#059669',
          800: '#065F46',
        },
      },
      fontFamily: {
        serif: ['Source Serif Pro', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-1': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
      },
      animation: {
        'fraud-pulse': 'fraud-pulse 2s ease-in-out infinite',
        'skeleton-shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'fraud-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
          '50%': { boxShadow: '0 0 12px 4px rgba(220, 38, 38, 0.3)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
}
```

---

## Accessibility Specifications

| Requirement              | Implementation                                           |
| ------------------------ | -------------------------------------------------------- |
| **Color contrast**       | All text meets WCAG AA: 4.5:1 for body, 3:1 for large text and UI components. Verified in both dark and light modes. |
| **No color-only meaning** | Severity uses icons + labels + color. Graph nodes use shapes + color. Charts use patterns + color. |
| **Focus indicators**     | `2px solid #3B82F6` outline with `2px` offset on all focusable elements. Visible in both modes. |
| **Focus trapping**       | Modals trap focus. Tab cycles through modal elements only. Escape closes modal. |
| **Keyboard navigation**  | All features accessible via keyboard. Custom shortcuts documented in command palette (Cmd+K > "Keyboard Shortcuts"). |
| **Screen reader support** | ARIA labels on all interactive elements. Live regions for processing status updates. Graph descriptions for network visualization. |
| **Reduced motion**       | Full `prefers-reduced-motion` support as documented in Animation section above. |
| **Font scaling**         | UI remains functional at 200% browser zoom. No fixed heights that clip content. |
| **High contrast mode**   | Respects `prefers-contrast: more` with increased border weights and text contrast. |

---

*The design serves the evidence. The evidence serves justice.*
