# Luminary -- Screens

> Every screen, panel, and modal in the Luminary desktop application. Includes UI elements, navigation, states, and accessibility considerations.

---

## Screen Architecture

Luminary uses a single-window architecture with a panel-based layout. The app can operate in two modes:

1. **Standalone Mode**: Full-width application window (1200x800 minimum)
2. **Side Panel Mode**: Narrow companion panel (400x800) docked alongside the DAW

```
+------------------------------------------------------------------+
|  [Title Bar]  Luminary  -  Project: "Midnight Drive"    _ [] X    |
+------------------------------------------------------------------+
|  [Top Bar]  Key: Am  |  BPM: 128  |  Genre: Lo-fi  |  [Sync]   |
+------------------------------------------------------------------+
|        |                                              |           |
| [Nav]  |              [Main Content Area]              | [Detail] |
| Sidebar|              (Active Screen)                  |  Panel   |
|        |                                              | (Context)|
|        |                                              |           |
|        |                                              |           |
|        |                                              |           |
|        |                                              |           |
+------------------------------------------------------------------+
|  [Status Bar]  Connected: Ableton Link  |  CPU: 3%  |  Free Plan |
+------------------------------------------------------------------+
```

---

## Global Navigation

### Sidebar Navigation (Left Rail)

The sidebar is a 56px-wide icon rail with tooltips. Always visible in standalone mode, collapsible in side panel mode.

| Icon | Label | Screen | Shortcut |
|---|---|---|---|
| Home | Workspace | Main production workspace | Cmd/Ctrl + 1 |
| Music | Chord Lab | Chord progression explorer | Cmd/Ctrl + 2 |
| Waveform | Melody Generator | AI melody tools | Cmd/Ctrl + 3 |
| Layout | Arrangement View | Song structure editor | Cmd/Ctrl + 4 |
| Sliders | Mix Console | Mixing feedback dashboard | Cmd/Ctrl + 5 |
| Volume | Master Bus | Mastering analysis | Cmd/Ctrl + 6 |
| Folder | Sample Browser | Sample search and preview | Cmd/Ctrl + 7 |
| Library | Project Library | All saved projects | Cmd/Ctrl + 8 |
| GraduationCap | Learning Center | Tutorials and courses | Cmd/Ctrl + 9 |
| Settings | Settings | Preferences | Cmd/Ctrl + , |
| User | Account | Subscription and profile | Cmd/Ctrl + . |

### Top Bar (Persistent)

Always visible across all screens. Displays current project context:

- **Project name**: Editable inline text field
- **Key indicator**: Badge showing detected/set key (e.g., "Am" in purple)
- **BPM indicator**: Badge showing detected/set BPM (e.g., "128" in cyan)
- **Genre tag**: Dropdown showing selected genre
- **DAW Sync status**: Green dot = connected, gray dot = disconnected, with DAW name
- **Suggestion counter**: "3/5 suggestions used today" (free tier) or unlimited icon (paid)

### Status Bar (Bottom)

- DAW connection status and name
- CPU usage percentage
- Memory usage
- Current subscription tier
- Online/offline indicator

---

## Screen 1: Welcome / Onboarding

**Purpose**: First-run experience that gathers user preferences to personalize the AI.

### Flow

```
Step 1: Welcome        Step 2: DAW Choice     Step 3: Genre         Step 4: Experience
+----------------+     +----------------+     +----------------+     +----------------+
|   [Luminary    |     |  Which DAW do  |     |  What genres   |     |  How long have |
|    Logo]       |     |  you use?      |     |  do you make?  |     |  you been      |
|                |     |                |     |                |     |  producing?    |
|  Your AI       |     |  [Ableton]     |     |  [Lo-fi] [Trap]|     |                |
|  Co-Producer   |     |  [FL Studio]   |     |  [House]       |     |  [< 1 year]    |
|                |     |  [Logic Pro]   |     |  [Pop] [R&B]   |     |  [1-3 years]   |
|  [Get Started] |     |  [Bitwig]      |     |  [Ambient]     |     |  [3-5 years]   |
|                |     |  [Other]       |     |  [+ More]      |     |  [5+ years]    |
+----------------+     +----------------+     +----------------+     +----------------+

Step 5: First Project
+----------------+
|  Let's start!  |
|                |
|  [Import Audio]|
|  [Start Fresh] |
|  [Try a Demo]  |
+----------------+
```

### UI Elements

- **Logo animation**: Subtle glow/pulse animation on the Luminary logo
- **Progress indicator**: 5-step dot indicator at the bottom
- **DAW selection cards**: Large clickable cards with DAW logos, single-select with checkmark
- **Genre chips**: Multi-select chip/pill buttons, max 5 selections, scrollable if more
- **Experience slider**: 4-option horizontal selector with descriptions
- **Skip button**: "Skip for now" link text in muted color on every step (except step 1)
- **Back button**: Arrow left on steps 2-5

### States

| State | Behavior |
|---|---|
| First launch | Show full onboarding flow |
| Returning user (not logged in) | Show login screen with "Continue as Guest" option |
| Returning user (logged in) | Skip onboarding, go directly to Workspace |
| Onboarding skipped | Use defaults, show subtle "Complete setup" prompt in sidebar |

### Accessibility

- All DAW and genre options are keyboard-navigable (Tab + Enter)
- High contrast text on all backgrounds (WCAG AA minimum)
- Screen reader labels on all interactive elements
- Focus ring visible on all focusable elements

---

## Screen 2: Main Workspace

**Purpose**: The primary hub that displays the current project overview, AI suggestion feed, and quick access to all tools.

### Layout

```
+------------------------------------------------------------------+
|  [Project Info Bar]                                               |
|  Project: Midnight Drive  |  Am  |  128 BPM  |  Lo-fi Hip-Hop   |
+------------------------------------------------------------------+
|                    |                                               |
|  [AI Suggestion    |  [Project Overview]                          |
|   Feed]            |                                               |
|                    |  +------------------------------------------+ |
|  +- Suggestion 1 -+  |  Arrangement Timeline                    | |
|  | "Try Dm7->G7   |  |  [Intro][Verse][Chorus][Verse][Outro]    | |
|  |  ->Cmaj7 here" |  |  |||||||||||||||||||||||||||||||||||||    | |
|  | [Accept][Edit]  |  +------------------------------------------+ |
|  | [Reject]       |  |                                           | |
|  +-----------------+  |  [Energy Curve Graph]                    | |
|                    |  |  ~~/\__/\~~                              | |
|  +- Suggestion 2 -+  +------------------------------------------+ |
|  | "Add hi-hat    |  |                                           | |
|  |  variation"    |  |  [Quick Actions]                          | |
|  | [Accept][Edit]  |  |  [Generate Chords] [Generate Melody]     | |
|  | [Reject]       |  |  [Analyze Mix]     [Detect Key/BPM]      | |
|  +-----------------+  +------------------------------------------+ |
|                    |                                               |
|  [+ Ask Luminary] |  [Import Audio/MIDI]   [Export Project]       |
+------------------------------------------------------------------+
```

### UI Elements

- **AI Suggestion Feed** (left panel, 300px wide):
  - Scrollable list of AI suggestions, newest at top
  - Each card: suggestion type icon, text, action buttons (Accept / Edit / Reject)
  - Accepted suggestions show green checkmark and move to "Applied" section
  - Rejected suggestions fade out with brief "Why?" feedback option
  - "Ask Luminary" input at bottom: freeform text input for specific questions

- **Project Overview** (main area):
  - Arrangement timeline: horizontal blocks representing song sections, color-coded
  - Energy curve: line graph showing loudness/intensity over time
  - Quick action buttons: large, clearly labeled with icons
  - Import/Export buttons in footer area

- **Detail Panel** (right, collapsible, 280px):
  - Context-sensitive panel showing details of selected suggestion or section
  - Music theory explanation for the current suggestion
  - Related learning resources

### States

| State | Behavior |
|---|---|
| No project loaded | Show "Import Audio/MIDI" and "Start Fresh" prompts with illustration |
| Project loaded, no analysis | Show "Analyzing..." progress bar, then populate |
| Active suggestions | Show suggestion feed with real-time updates |
| All suggestions addressed | Show "Great work! Need more ideas?" with generation button |
| Offline mode | Show offline badge, disable cloud features, enable on-device tools |

---

## Screen 3: Chord Lab

**Purpose**: Interactive chord exploration and progression building tool.

### Layout

```
+------------------------------------------------------------------+
|  CHORD LAB                                          [Key: Am]    |
+------------------------------------------------------------------+
|                         |                                         |
|  [Circle of Fifths]     |  [Progression Builder]                 |
|                         |                                         |
|      F  C  G            |  | Am | Dm7 | G7 | Cmaj7 |            |
|    Bb      D            |  [Bar 1][Bar 2][Bar 3][Bar 4]          |
|   Eb        A           |                                         |
|    Ab      E            |  [+ Add Chord]  [Clear All]            |
|      Db F# B            |                                         |
|                         |  [AI Suggest Next]  [Variations]        |
|  (interactive, click    |                                         |
|   any chord to add)     +------------------------------------------+
|                         |  [Voicing Options]                      |
|  [Scale Degrees]        |                                         |
|  i ii* III iv v VI VII  |  Root Position | 1st Inversion | 2nd   |
|                         |  Triad | 7th | 9th | add9 | sus4      |
+-------------------------+                                         |
|  [Mood Presets]         |  [Piano Keyboard Preview]               |
|  [Dreamy] [Dark]        |  |_|#|_|_|#|_|#|_|_|#|_|#|_|          |
|  [Uplifting] [Chill]    |  | C | D | E |F | G | A | B |          |
|  [Aggressive] [Sad]     |  (highlighted notes show chord)         |
+-------------------------+-----------------------------------------+
|  [Play All]  [Loop]  [Export MIDI]  [Copy Names]                 |
+------------------------------------------------------------------+
```

### UI Elements

- **Circle of Fifths**: SVG-based interactive wheel, 300x300px. Click any chord to add to progression. Current key highlighted. Related chords (diatonic) are brighter, chromatic chords are dimmer.
- **Progression Builder**: Horizontal strip of chord cards. Drag to reorder. Click to select. Right-click for context menu (change voicing, inversion, delete).
- **Chord Card**: Displays chord name (large), Roman numeral analysis (small), quality badge (major/minor/dom7/etc.).
- **Voicing Options**: Grid of buttons for chord type modifications. Updates the selected chord in real time.
- **Piano Keyboard Preview**: Visual 2-octave piano keyboard showing the notes of the selected chord highlighted.
- **Mood Presets**: Quick-select buttons that generate a full progression matching the mood.
- **Transport Controls**: Play All (plays progression in sequence), Loop (toggles looping), tempo syncs to project BPM.
- **Export**: MIDI export button and "Copy Names" (copies chord names as text).

### Interactive Behavior

- Hovering over a chord in the circle of fifths plays it softly
- Clicking a chord adds it to the progression builder
- The AI suggests the next chord based on harmonic analysis (shown as a glowing suggestion on the circle)
- "Variations" generates 5 alternative progressions maintaining the same harmonic function

### Accessibility

- All chords navigable via keyboard (arrow keys around the circle, Tab between sections)
- Audio feedback on hover and selection
- High-contrast chord labels on all background colors
- Scale degree labels use standard Roman numeral notation with screen reader alternatives

---

## Screen 4: Melody Generator

**Purpose**: AI-powered melody creation with visual piano roll display and parameter controls.

### Layout

```
+------------------------------------------------------------------+
|  MELODY GENERATOR                    [Key: Am] [BPM: 128]        |
+------------------------------------------------------------------+
|  [Parameters]           |  [Piano Roll Display]                   |
|                         |                                         |
|  Density:    [---o---]  |  B4  .  .  .  .  .  .  .  .  .  .    |
|  Range:      [--o----]  |  A4  .  ===  .  .  .  .  ==  .  .    |
|  Complexity: [-o-----]  |  G4  .  .  .  ==  .  .  .  .  .  .    |
|  Contour:    [Wave v]   |  F4  .  .  .  .  .  .  .  .  .  .    |
|  Style:      [Legato v] |  E4  .  .  .  .  ====  .  .  .  ==   |
|                         |  D4  .  .  .  .  .  .  .  .  .  .    |
|  [Chord Context]        |  C4  ====  .  .  .  .  ===  .  .  .  |
|  Am -> Dm7 -> G7        |                                         |
|  (from Chord Lab)       |  [Bar 1  ][Bar 2  ][Bar 3  ][Bar 4  ] |
+-----------+-------------+-----------------------------------------+
|  [Generation Controls]                                            |
|                                                                    |
|  [Generate New]  [Variations (5)]  [Humanize]  [Simplify]        |
|                                                                    |
|  Generated Melodies:                                              |
|  [Melody 1 - Selected] [Melody 2] [Melody 3] [Melody 4]         |
+------------------------------------------------------------------+
|  [Play]  [Stop]  [Export MIDI]  [Send to DAW]                    |
+------------------------------------------------------------------+
```

### UI Elements

- **Parameter Controls**: Vertical panel of sliders and dropdowns:
  - Density: sparse (whole notes) to dense (16th notes)
  - Range: narrow (1 octave) to wide (3 octaves)
  - Complexity: simple (stepwise) to complex (large intervals, chromaticism)
  - Contour: ascending, descending, wave, random
  - Style: legato, staccato, syncopated, arpeggiated
- **Piano Roll**: Canvas-based display showing MIDI notes as colored rectangles on a piano grid. Notes are editable (click to add/remove, drag to move/resize).
- **Chord Context**: Shows the current chord progression from Chord Lab. Melodies are constrained to these chord tones on strong beats.
- **Generation Controls**: Action buttons for generating new melodies, creating variations, humanizing timing/velocity, simplifying note count.
- **Melody Selector**: Horizontal tabs showing 4 generated options. Click to switch, listen, compare.

### States

| State | Behavior |
|---|---|
| No chord context | Show prompt: "Set chords in Chord Lab first, or generate a standalone melody" |
| Generating | "Generating..." animation with music note particles, 1-3 seconds |
| Generated | Display piano roll with notes, auto-play option |
| Editing | Notes become draggable, add/delete mode indicated by cursor change |
| Exporting | Brief "Exported!" toast notification with file path |

---

## Screen 5: Arrangement View

**Purpose**: Visual song structure editor with AI-powered arrangement suggestions.

### Layout

```
+------------------------------------------------------------------+
|  ARRANGEMENT VIEW                                    [4:32 total] |
+------------------------------------------------------------------+
|  [Timeline]                                                       |
|  0:00    0:30    1:00    1:30    2:00    2:30    3:00    3:30    |
|  |-------|-------|-------|-------|-------|-------|-------|-------|  |
|                                                                    |
|  [Section Blocks]                                                 |
|  +------+ +----------+ +---------+ +----------+ +------+         |
|  |Intro | | Verse 1  | |Chorus 1 | | Verse 2  | |Bridge|         |
|  |8 bars| | 16 bars  | | 8 bars  | | 16 bars  | |8 bars|         |
|  | Am   | | Am->Dm   | |F->G->Am | | Am->Dm   | | Em   |         |
|  +------+ +----------+ +---------+ +----------+ +------+         |
|                                                                    |
|  +--------+ +------+                                              |
|  |Chorus 2| |Outro |   [+ Add Section]                           |
|  | 8 bars | |4 bars|                                              |
|  |F->G->Am| | Am   |                                              |
|  +--------+ +------+                                              |
+------------------------------------------------------------------+
|  [Energy Curve]                                                   |
|  High  |          /\          /\                                  |
|  Med   |    /\  /    \  /\  /    \                                |
|  Low   |  /    \/      \/    \    \___                            |
|        +-------------------------------------------->              |
+------------------------------------------------------------------+
|  [AI Suggestions]                                                 |
|  "Consider adding a breakdown before Chorus 2 for impact"        |
|  "Verse 2 is identical to Verse 1 -- try adding a new element"   |
|  [Apply]  [Dismiss]                                               |
+------------------------------------------------------------------+
```

### UI Elements

- **Timeline ruler**: Horizontal time ruler showing minutes:seconds and bar numbers
- **Section blocks**: Colored rectangles representing song sections. Draggable to reorder. Resizable by dragging edges. Double-click to rename. Right-click for options (duplicate, delete, change color).
- **Section info**: Each block shows section name, bar count, and key/chord summary
- **Energy curve**: Line graph below the timeline showing the dynamic energy of the arrangement. AI-generated based on section types and instrumentation.
- **Add Section button**: Opens a dropdown with common section types (Intro, Verse, Pre-Chorus, Chorus, Bridge, Breakdown, Drop, Outro, Custom)
- **AI Suggestions panel**: Bottom panel with arrangement-specific suggestions. Each has Apply and Dismiss buttons.

### Accessibility

- Sections are Tab-navigable with arrow keys for reordering
- Section colors have distinct patterns (not just color) for colorblind users
- Screen reader announces section name, duration, and position when focused
- Energy curve has text alternative summarizing the dynamic arc

---

## Screen 6: Mix Console

**Purpose**: AI-powered mixing feedback dashboard with frequency analysis, level metering, and actionable suggestions.

### Layout

```
+------------------------------------------------------------------+
|  MIX CONSOLE                              [Import Mix / Stems]   |
+------------------------------------------------------------------+
|  [Spectrum Analyzer]                                              |
|                                                                    |
|  dB                                                               |
|  +6  |                                                            |
|   0  |    ____                                                    |
|  -6  |   /    \         ___                                       |
|  -12 |  /      \       /   \      ____                            |
|  -18 | /        \_____/     \____/    \_____                      |
|  -24 |/                                     \____                 |
|      +--------------------------------------------->              |
|      20   50  100  200  500  1k  2k  5k  10k  20k Hz            |
|                                                                    |
|  [Problem Zones]  [!] 200-400Hz  [!] 3-5kHz                     |
+------------------------------------------------------------------+
|  [Meters]              |  [AI Mix Feedback]                       |
|                        |                                          |
|  L ||||||||||||| -6dB  |  [!] Low-Mid Muddiness (200-400Hz)     |
|  R ||||||||||||| -5dB  |  "Cut 3dB at 300Hz on bass and pad"    |
|                        |  Severity: Medium  [Fix Guide]          |
|  Peak: -3.2dB          |                                          |
|  RMS: -12.4dB          |  [!] Harsh High-Mids (3-5kHz)          |
|  LUFS: -14.1           |  "The vocal has a resonance at 3.5kHz"  |
|  Crest: 9.2dB          |  Severity: Low  [Fix Guide]             |
|                        |                                          |
|  [Stereo Width]        |  [OK] Low End: Clean                    |
|  ____/\____            |  [OK] Stereo Image: Balanced            |
|  L    C    R           |  [OK] Dynamic Range: Healthy             |
|                        |                                          |
|  Width: 68%            |  Overall Mix Score: 7.2/10              |
+------------------------------------------------------------------+
```

### UI Elements

- **Spectrum Analyzer**: Real-time or static FFT display. Color-coded frequency bands (sub, low, low-mid, mid, high-mid, high). Problem zones highlighted in red/orange.
- **Level Meters**: Stereo peak/RMS meters with peak hold indicators. Separate displays for Peak (dBFS), RMS (dBFS), LUFS (integrated loudness), and Crest Factor.
- **Stereo Width Display**: Goniometer-style or correlation meter showing stereo spread.
- **AI Mix Feedback Panel**: Scrollable list of issues and recommendations. Each item has: severity badge (Critical/Medium/Low), description, suggested fix, "Fix Guide" link to detailed tutorial.
- **Mix Score**: Overall numeric score (1-10) based on frequency balance, dynamic range, stereo image, and loudness.

---

## Screen 7: Master Bus Analyzer

**Purpose**: Mastering analysis and guidance for preparing a track for release.

### Layout

- **LUFS Meter**: Large, prominent integrated loudness display with genre targets
- **True Peak Meter**: Shows intersample peaks with -1dBTP ceiling warning
- **Spectral Balance**: Reference curve overlay (your mix vs ideal for genre)
- **Dynamic Range**: DR value with recommendation
- **Stereo Width per Band**: Low (mono), mid (moderate), high (wide) visualization
- **Reference Comparison**: Upload a professional reference track, see A/B analysis
- **Mastering Checklist**: Step-by-step mastering guide with checkboxes (EQ, compression, limiting, dithering)
- **Export Settings**: Recommended format, sample rate, bit depth for target platform (Spotify, Apple Music, SoundCloud)

---

## Screen 8: Sample Browser

**Purpose**: Search, preview, and import samples from the curated library.

### Layout

```
+------------------------------------------------------------------+
|  SAMPLE BROWSER                                                   |
+------------------------------------------------------------------+
|  [Search: ________________]  [Key: Am v] [BPM: 128 v]           |
|  [Drums] [Melodic] [FX] [Vocal] [Ambient] [All]                 |
+------------------------------------------------------------------+
|  [Results]                          |  [Preview]                  |
|                                     |                             |
|  kick_deep_808.wav          0:01    |  [Waveform Display]        |
|  kick_punchy_analog.wav     0:01    |  ___/\___/\___/\___        |
|  snare_crisp_trap.wav       0:00    |                             |
|  hihat_closed_lofi.wav      0:00    |  [||||||||>--------]       |
|  pad_warm_ambient_Am.wav    0:04    |  Duration: 0:04            |
|  loop_guitar_chill_Am.wav   0:08    |  Key: Am                   |
|  bass_sub_808_A.wav         0:02    |  BPM: 128                  |
|                                     |  Category: Melodic > Pad   |
|  [Load More...]                     |                             |
|                                     |  [Add to Project]          |
|                                     |  [Add to Favorites]        |
|                                     |  [Export to DAW]           |
+------------------------------------------------------------------+
```

### UI Elements

- **Search bar**: Full-text search with auto-complete
- **Filters**: Category tabs, key/BPM dropdowns, genre tags
- **Results list**: Sortable by name, duration, category. Click to preview.
- **Waveform preview**: Real-time waveform display of selected sample, playback scrubber, loop toggle
- **Sample metadata**: Key, BPM, duration, category, tags
- **Action buttons**: Add to project, favorite, export

---

## Screen 9: Project Library

**Purpose**: View, manage, and organize all saved projects.

### Layout

- **Grid/List toggle**: Switch between card grid view and list view
- **Project cards**: Thumbnail (waveform or color), project name, date, key/BPM, genre, status (in progress / completed)
- **Sort options**: Date modified, date created, name, genre
- **Filter options**: Status, genre, key
- **Search**: Full-text project name search
- **Actions per project**: Open, Duplicate, Archive, Delete, Export
- **New Project button**: Prominent button at top

### States

| State | Behavior |
|---|---|
| No projects | Illustration with "Create your first project" CTA |
| Many projects (50+) | Pagination or infinite scroll with lazy loading |
| Offline | Show cached projects, disable sync indicator |

---

## Screen 10: Settings / Preferences

**Purpose**: Configure app behavior, audio settings, and AI preferences.

### Sections

| Section | Settings |
|---|---|
| **General** | Language, auto-update, launch on startup, default project location |
| **Audio** | Audio output device, sample rate, buffer size, input device (for recording) |
| **MIDI** | MIDI input/output device selection, channel routing, virtual port toggle |
| **DAW Integration** | Ableton Link enable/disable, MIDI sync options, OSC settings |
| **AI Preferences** | Suggestion frequency (conservative/moderate/aggressive), preferred explanation depth (brief/detailed), genre bias |
| **Appearance** | UI scale (80%-150%), panel layout presets, animation toggle |
| **Keyboard Shortcuts** | Full list of shortcuts with customization |
| **Data & Privacy** | Clear suggestion history, export user data, delete account |
| **About** | Version info, changelog, credits, open source licenses |

---

## Screen 11: Account / Subscription

**Purpose**: Manage user profile and subscription.

### Layout

- **Profile section**: Display name, email, avatar, DAW preference, genre preferences
- **Subscription card**: Current plan name, features included, usage stats (suggestions used this month)
- **Plan comparison**: Side-by-side table (Free / Creator / Pro) with feature checkmarks
- **Upgrade button**: Prominent CTA for free users
- **Billing history**: List of past invoices (for paid users)
- **Payment method**: Card on file with update option
- **Manage subscription**: Cancel, pause, or change plan

---

## Screen 12: Learning Center

**Purpose**: Tutorials, courses, and educational content powered by AI explanations.

### Layout

```
+------------------------------------------------------------------+
|  LEARNING CENTER                                                  |
+------------------------------------------------------------------+
|  [Categories]                                                     |
|  [Music Theory] [Mixing] [Mastering] [Arrangement] [Sound Design]|
+------------------------------------------------------------------+
|  [Featured Lesson]                                                |
|  +-------------------------------------------------------------+ |
|  |  Understanding Chord Progressions                            | |
|  |  Learn the fundamentals of harmony and how to build          | |
|  |  progressions that evoke specific emotions.                  | |
|  |  [Start Lesson]                              15 min          | |
|  +-------------------------------------------------------------+ |
|                                                                    |
|  [All Lessons]                                                    |
|  +-------------------+  +-------------------+  +----------------+ |
|  | EQ Fundamentals   |  | Song Structure    |  | Compression    | |
|  | [Mixing]    10min |  | [Arrangement] 12m |  | [Mixing]  8min | |
|  +-------------------+  +-------------------+  +----------------+ |
|  +-------------------+  +-------------------+  +----------------+ |
|  | Vocal Processing  |  | Bass Design       |  | Mastering 101  | |
|  | [Mixing]    15min |  | [Sound Design] 10m|  | [Mastering] 20m| |
|  +-------------------+  +-------------------+  +----------------+ |
+------------------------------------------------------------------+
```

### UI Elements

- **Category tabs**: Filter lessons by topic
- **Lesson cards**: Title, category badge, estimated duration, progress indicator (if started)
- **Lesson view**: Step-by-step content with interactive elements (chord lab inline, spectrum visualizations, audio examples)
- **AI tutor**: "Ask about this topic" chat input within each lesson
- **Progress tracking**: Completed lessons tracked per user, progress bar on each card

---

## Modal Dialogs

### Quick Suggestion Modal (Cmd/Ctrl + Space)

A Spotlight-style overlay for asking Luminary anything:

```
+------------------------------------------+
|  Ask Luminary...                          |
|  [________________________________]      |
|                                          |
|  Recent:                                 |
|  "What chord comes after Dm7?"           |
|  "How do I make my kick punchier?"       |
|  "Suggest a bridge progression"          |
+------------------------------------------+
```

### Export Modal

```
+------------------------------------------+
|  Export                                   |
|                                          |
|  Format:  [MIDI] [WAV] [Project File]    |
|  Content: [Chords] [Melody] [Full]       |
|  Humanize: [On/Off]                      |
|                                          |
|  [Cancel]              [Export]          |
+------------------------------------------+
```

### AI Explanation Modal

Appears when user clicks "Why?" on any AI suggestion:

```
+------------------------------------------+
|  Why this suggestion?                     |
|                                          |
|  "The Dm7 -> G7 -> Cmaj7 creates a      |
|   ii-V-I progression, the most common    |
|   cadence in Western harmony. The Dm7    |
|   sets up tension (subdominant), G7      |
|   increases it (dominant), and Cmaj7     |
|   resolves it (tonic)."                  |
|                                          |
|  [Learn more in Learning Center]         |
|  [Got it]                                |
+------------------------------------------+
```

---

## Responsive Behavior

### Standalone Mode (1200px+ width)

- Full three-column layout: sidebar + main content + detail panel
- All panels visible simultaneously
- Keyboard shortcuts active

### Side Panel Mode (400px width)

- Sidebar collapses to hamburger menu
- Detail panel becomes a bottom sheet
- Content stacks vertically
- Optimized for narrow companion window alongside DAW
- Simplified controls, larger touch/click targets

### Minimum Window Size

- Standalone: 1000x600px
- Side Panel: 360x500px

---

## Accessibility Standards

| Requirement | Implementation |
|---|---|
| **WCAG AA** | Minimum 4.5:1 contrast ratio for all text |
| **Keyboard navigation** | Full app navigable via keyboard, visible focus indicators |
| **Screen reader** | All interactive elements have ARIA labels, live regions for dynamic content |
| **Reduced motion** | Respect system preference, provide toggle in Settings |
| **Font scaling** | UI scale option (80%-150%) in Settings |
| **Color blindness** | Patterns and icons supplement color coding in all visualizations |
| **Audio cues** | Optional audio feedback for UI interactions (toggle in Settings) |

---

*Every screen in Luminary is designed to minimize friction between having an idea and hearing it realized.*
