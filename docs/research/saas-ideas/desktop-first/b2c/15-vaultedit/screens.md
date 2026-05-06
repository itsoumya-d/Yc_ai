# VaultEdit -- Screen Inventory & UI Specification

## Navigation Architecture

VaultEdit uses a **hub-and-spoke navigation model**. The Project Library is the hub. Opening a project launches the full Editor, which contains multiple panels and sub-views. Global settings and account management are accessible from any screen via the top-right menu.

```
App Launch
    |
    v
Welcome / Onboarding (first-time only)
    |
    v
Project Library (hub)
    |
    +---> Editor Main View (spoke)
    |        |
    |        +---> AI Command Panel
    |        +---> Caption Editor
    |        +---> Thumbnail Studio
    |        +---> Export Settings
    |        +---> Asset Library
    |        +---> Render Progress
    |
    +---> Template Library
    |
    +---> Settings / Preferences
    |
    +---> Account / Subscription
```

---

## Screen 1: Welcome / Onboarding

**Purpose:** First-time user experience. Introduce VaultEdit's core workflow and get the user to their first edit as fast as possible.

**When Shown:** First app launch only. Can be re-accessed from Settings > "Replay Onboarding."

### Layout

```
+------------------------------------------------------------------+
|                          VaultEdit Logo                           |
|                    "Edit at the speed of thought"                 |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                                                             |  |
|  |              [Animated demo of transcript editing]          |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  Step 1 of 4:  "Import your footage"                             |
|  [Brief description of transcript-based editing]                  |
|                                                                   |
|  ( ) ( ) ( ) ( )    <-- Step indicators                          |
|                                                                   |
|  [Skip]                                        [Next ->]          |
+------------------------------------------------------------------+
```

### Onboarding Steps

| Step | Title | Content | Visual |
|---|---|---|---|
| 1 | Import your footage | "Drag a video file in. VaultEdit transcribes it instantly." | Animation of file drag-drop |
| 2 | Edit by reading | "Your video becomes text. Delete words to cut scenes. It's that simple." | Animation of transcript deletion |
| 3 | Let AI handle the rest | "Type what you want: 'remove all ums,' 'add captions,' 'create a highlight reel.'" | AI command input demo |
| 4 | Export everywhere | "One click to YouTube, TikTok, Shorts, and Reels." | Export preset cards |

### UI Elements

- **Logo + Tagline**: Centered at top, electric violet logo
- **Demo Animation**: 60% of screen height, auto-playing loop demonstrating the current step's feature
- **Step Description**: 2-3 sentences below the demo
- **Step Indicators**: 4 dots showing progress, filled dot for current step
- **Skip Button**: Bottom-left, text-only, subtle
- **Next Button**: Bottom-right, primary button (electric violet)
- **Done Button**: Appears on step 4, replaces Next, launches Project Library

### States

- **Fresh install**: Full 4-step flow
- **Returning after skip**: Offer to resume onboarding via a dismissible banner in Project Library
- **Account already exists**: Skip to step 2 (assume familiarity with import)

### Accessibility

- All animations respect `prefers-reduced-motion` -- static screenshots shown instead
- Step descriptions are announced by screen reader on step change
- Keyboard navigation: Tab between Skip and Next, Enter to advance
- High contrast text on dark background

---

## Screen 2: Project Library

**Purpose:** Central hub for all projects. Create new, open existing, search, sort, and manage projects.

### Layout

```
+------------------------------------------------------------------+
|  [VaultEdit Logo]    [Search bar.............]  [+ New] [Avatar]  |
+------------------------------------------------------------------+
|                                                                   |
|  Recent Projects                           [Grid] [List] [Sort v] |
|                                                                   |
|  +------------+  +------------+  +------------+  +------------+  |
|  | [Thumbnail]|  | [Thumbnail]|  | [Thumbnail]|  | [  Drag    ]| |
|  |            |  |            |  |            |  | [  Video   ]| |
|  | Video Title|  | Video Title|  | Video Title|  | [  Here    ]| |
|  | 12:34      |  | 8:45       |  | 22:10      |  | [  or      ]| |
|  | Edited 2h  |  | Draft      |  | Exported   |  | [  Browse  ]| |
|  | ago        |  | 3 days ago |  | 1 week ago |  |            |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                   |
|  All Projects (12)                                                |
|                                                                   |
|  +------------+  +------------+  +------------+  +------------+  |
|  | [Thumbnail]|  | [Thumbnail]|  | [Thumbnail]|  | [Thumbnail]|  |
|  |            |  |            |  |            |  |            |  |
|  | ...        |  | ...        |  | ...        |  | ...        |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

### UI Elements

- **Top Bar**: VaultEdit logo (left), search bar (center, 40% width), New Project button (right), user avatar with dropdown (right)
- **View Toggle**: Grid view (default) / List view, plus sort dropdown (Last Edited, Created, Name, Duration)
- **Project Card (Grid View)**:
  - Video thumbnail (first frame or custom thumbnail)
  - Project name (editable on double-click)
  - Duration badge
  - Status badge (Draft / In Progress / Exported / Published)
  - Last edited timestamp
  - Right-click context menu: Open, Duplicate, Archive, Delete, Show in Finder
- **Project Row (List View)**:
  - Thumbnail (small), name, duration, status, resolution, last edited, file size
  - Sortable columns
- **New Project Card**: Always last in the grid, dashed border, "Drag video here or browse" with file picker
- **Empty State**: Full-screen illustration with "Drop your first video to get started" and a prominent Browse button
- **Search**: Real-time filtering by project name, tags, or description

### States

| State | Display |
|---|---|
| **Empty (no projects)** | Full-screen empty state with illustration and CTA |
| **Loading** | Skeleton cards with shimmer animation |
| **Populated** | Grid/list of project cards |
| **Search active** | Filtered results, "No results" state if nothing matches |
| **Drag hover** | Entire library dims, drop zone highlights with dashed border |

### Accessibility

- Grid navigable with arrow keys
- Project cards have descriptive aria-labels ("Video Title, 12 minutes, edited 2 hours ago, draft")
- Search is auto-focused on Cmd+K / Ctrl+K
- Delete requires confirmation dialog with keyboard-accessible confirm/cancel

---

## Screen 3: Import / Ingest

**Purpose:** Accept video files and begin AI processing (transcription, scene detection, silence analysis).

### Layout

```
+------------------------------------------------------------------+
|  [<- Back to Library]              Importing: my-video.mp4        |
+------------------------------------------------------------------+
|                                                                   |
|                    +---------------------------+                  |
|                    |                           |                  |
|                    |     [File icon / thumb]   |                  |
|                    |                           |                  |
|                    |     my-video.mp4          |                  |
|                    |     1.2 GB  |  1080p      |                  |
|                    |     24:32   |  30fps      |                  |
|                    |                           |                  |
|                    +---------------------------+                  |
|                                                                   |
|  Processing Steps:                                                |
|                                                                   |
|  [x] Analyzing video file          Done (2s)                     |
|  [x] Extracting audio              Done (5s)                     |
|  [=>] Transcribing with AI         45%  [===========........]    |
|  [ ] Detecting scenes              Waiting...                     |
|  [ ] Analyzing silence             Waiting...                     |
|  [ ] Generating preview            Waiting...                     |
|                                                                   |
|  Estimated time remaining: 45 seconds                             |
|                                                                   |
|                                            [Cancel]               |
+------------------------------------------------------------------+
```

### UI Elements

- **File Info Card**: Thumbnail preview (first frame), filename, file size, resolution, duration, frame rate, codec
- **Processing Steps**: Checklist with progress bars for each AI processing stage
- **Step States**: Pending (empty circle), In Progress (spinner + progress bar), Complete (checkmark), Error (red X with retry)
- **Time Estimate**: Dynamically updated based on processing speed
- **Cancel Button**: Cancels all processing and returns to Project Library
- **Auto-advance**: When all steps complete, automatically opens the Editor Main View

### Processing Steps Detail

| Step | Duration (10-min video) | Can Fail? | Fallback |
|---|---|---|---|
| Analyzing video file | 1-3 seconds | Rarely | Show error, suggest re-encoding |
| Extracting audio | 3-10 seconds | Rarely | Show error with codec info |
| Transcribing with AI | 30-120 seconds | Yes (API) | Retry, or offer manual transcript import |
| Detecting scenes | 10-30 seconds | No | Degrade gracefully (no scene boundaries) |
| Analyzing silence | 5-15 seconds | No | Degrade gracefully (no silence markers) |
| Generating preview | 10-30 seconds | No | Generate on-demand in editor |

### States

- **Drag and drop**: File accepted, processing begins
- **Multiple files**: Show queue, process one at a time
- **Unsupported format**: Error message with supported formats list
- **Network error (Whisper)**: Retry button, option to skip transcription and add later
- **Processing complete**: Auto-transition to Editor with 1-second "Ready!" confirmation

---

## Screen 4: Editor Main View

**Purpose:** The primary editing interface. This is where creators spend 90% of their time in VaultEdit.

### Layout

```
+------------------------------------------------------------------+
|  [VaultEdit] [File v] [Edit v] [View v] [AI v] [Help v]  [Share] |
+------------------------------------------------------------------+
|                                           |                       |
|          Video Preview Panel              |    Transcript Panel   |
|   +----------------------------------+   |                       |
|   |                                  |   |  [Speaker A] 0:00     |
|   |                                  |   |  Hello everyone,      |
|   |        [Video playback]          |   |  welcome back to      |
|   |                                  |   |  the channel. Today   |
|   |                                  |   |  we're going to talk  |
|   |                                  |   |  about [um] something |
|   +----------------------------------+   |  really exciting.     |
|   [|<] [<<] [ > ] [>>] [>|]  00:12/24:32|                       |
|                                          |  [Speaker A] 0:15     |
+------------------------------------------+  So the first thing   |
|                                          |  I want to mention    |
|  Timeline Panel                          |  is... [pause 3.2s]   |
|  +--------------------------------------+|  ...that this product |
|  | V: [====||====||===========||====]   ||  has been completely  |
|  | A: [waveform visualization]          ||  redesigned from the  |
|  | C: [caption track]                   ||  ground up.           |
|  | M: [music track]                     ||                       |
|  +--------------------------------------+|  [Silence: 2.1s]      |
|  |< 0:00          12:16          24:32 >||                       |
+------------------------------------------+-----------------------+
|  [AI Command: "Type an editing command..."]          [Send] [?]  |
+------------------------------------------------------------------+
```

### Panel System

The editor uses a **resizable panel layout** (similar to VS Code). Panels can be resized by dragging dividers. Panel visibility is toggleable via the View menu.

| Panel | Default Position | Resizable | Hideable |
|---|---|---|---|
| **Video Preview** | Top-left (60% width) | Yes | No |
| **Transcript** | Right (40% width) | Yes | Yes |
| **Timeline** | Bottom-left (60% width) | Yes (height) | Yes |
| **AI Command Bar** | Bottom (full width) | No | Yes |

### Video Preview Panel

- **Video player**: Hardware-accelerated playback with real-time effects preview
- **Transport controls**: Play/pause, skip back 5s, skip forward 5s, frame step backward, frame step forward
- **Timecode display**: Current position / total duration (00:12:34 / 00:24:32)
- **Playback speed**: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **Fullscreen toggle**: Expand preview to fill the screen
- **Safe zone overlay**: Toggle YouTube/TikTok safe zones for caption/UI placement
- **Zoom controls**: Fit, 50%, 100%, 200% for pixel-level inspection
- **Volume slider**: Preview audio volume (does not affect export)
- **Caption preview**: Show/hide captions on the preview

### Transcript Panel

- **Scrollable transcript**: Word-level display with timestamps
- **Current word highlight**: Word currently being spoken is highlighted during playback
- **Selection**: Click to seek, click-and-drag to select a range
- **Edit operations**: Select text and press Delete to cut, right-click for cut/copy/split/effects menu
- **Filler word badges**: "um," "uh," etc. highlighted in amber with one-click remove
- **Silence markers**: "[pause 3.2s]" markers showing detected silence with duration
- **Speaker labels**: Color-coded speaker identification for multi-person content
- **Search within transcript**: Cmd+F to find words/phrases
- **Confidence indicators**: Low-confidence words shown with dotted underline

### Timeline Panel

- **Video track**: Thumbnail strip showing frames at regular intervals, with cut points shown as gaps
- **Audio waveform track**: Visual representation of audio levels
- **Caption track**: Caption blocks shown as colored bars with text previews
- **Music track**: Background music waveform (when music is added)
- **Playhead**: Red vertical line showing current position, draggable for scrubbing
- **Zoom slider**: Zoom in/out of the timeline (seconds-level to minutes-level)
- **Markers**: Chapter markers, comments, and custom markers shown as flags above the timeline
- **Selection range**: Blue highlight showing selected time range
- **Scroll**: Horizontal scroll with mouse wheel or trackpad, auto-scroll follows playhead during playback

### AI Command Bar

- **Text input**: Full-width input field with placeholder "Type an editing command..."
- **Send button**: Submit the command for AI processing
- **Help button**: Opens a drawer with example commands and tips
- **Processing indicator**: Animated gradient border while AI is processing
- **Result display**: Expandable panel showing the AI's edit plan with Accept/Reject buttons

### Menu Bar

| Menu | Items |
|---|---|
| **File** | New Project, Open Project, Save, Save As, Import Media, Export, Close Project |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Delete, Select All, Find in Transcript |
| **View** | Toggle Transcript, Toggle Timeline, Toggle AI Panel, Fullscreen Preview, Reset Layout |
| **AI** | Remove Silence, Remove Filler Words, Generate Captions, Generate Chapters, Create Highlight Reel |
| **Help** | Keyboard Shortcuts, Documentation, Report Bug, About VaultEdit |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Space | Play / Pause |
| J / L | Skip back / forward 5 seconds |
| K | Pause |
| , / . | Frame step back / forward |
| Cmd+Z / Ctrl+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+S / Ctrl+S | Save project |
| Cmd+E / Ctrl+E | Open export dialog |
| Cmd+/ / Ctrl+/ | Focus AI command bar |
| Delete / Backspace | Delete selected transcript segment |
| Cmd+F / Ctrl+F | Find in transcript |
| Cmd+Shift+C | Toggle captions on preview |
| 1-5 | Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x) |

### States

- **Loading project**: Skeleton UI for all panels, progress bar
- **Playback**: Playhead moves, transcript auto-scrolls, waveform cursor follows
- **Editing**: Selected transcript text highlighted, cut/delete operations reflected on timeline
- **AI processing**: Command bar shows spinner, editor remains interactive
- **AI result preview**: Edit plan overlay showing proposed changes with Accept/Reject
- **Rendering**: Timeline shows render progress, preview shows "Rendering..." overlay

---

## Screen 5: AI Command Panel (Expanded)

**Purpose:** Full chat-like interface for complex AI editing conversations.

### Layout

```
+------------------------------------------------------------------+
|  AI Editing Assistant                                    [X Close] |
+------------------------------------------------------------------+
|                                                                   |
|  [User] Remove all the dead air and pauses longer than 1 second   |
|                                                                   |
|  [AI] I found 23 pauses longer than 1 second, totaling 47        |
|  seconds of dead air. Here's what I'll do:                        |
|                                                                   |
|  - Remove 18 silences between sentences (32s total)               |
|  - Shorten 5 longer pauses to 0.5s each (saved 15s)              |
|                                                                   |
|  This will reduce your video from 24:32 to 23:45.                |
|                                                                   |
|  [Preview Changes]  [Apply All]  [Adjust Settings]               |
|                                                                   |
|  [User] Also add the word-by-word caption style                   |
|                                                                   |
|  [AI] I'll apply word-by-word highlighted captions in the         |
|  "Bold Pop" style. Each word highlights as it's spoken.           |
|                                                                   |
|  Preview:  [Preview thumbnail showing caption style]              |
|                                                                   |
|  [Apply Captions]  [Choose Different Style]                       |
|                                                                   |
+------------------------------------------------------------------+
|  [Type a command...]                                     [Send]   |
+------------------------------------------------------------------+
```

### UI Elements

- **Chat history**: Scrollable conversation showing user commands and AI responses
- **AI responses**: Include structured data (lists of changes, before/after stats, preview thumbnails)
- **Action buttons**: Context-specific buttons within AI responses (Preview, Apply, Adjust, Choose)
- **Command input**: Same as the compact AI command bar but with more vertical space
- **Suggested commands**: Quick-action chips when the panel is empty ("Remove silence," "Add captions," "Generate chapters")
- **Undo per command**: Each AI action can be undone independently

### States

- **Empty**: Suggested commands shown as clickable chips
- **Waiting for response**: Typing indicator animation
- **Response with preview**: Inline preview thumbnails or before/after comparisons
- **Error**: Error message with retry button and explanation
- **Multiple pending actions**: Actions queue with status indicators

---

## Screen 6: Caption Editor

**Purpose:** Fine-tune caption appearance, timing, and style.

### Layout

```
+------------------------------------------------------------------+
|  Caption Editor                                          [X Close] |
+------------------------------------------------------------------+
|                                                                   |
|  Style Presets:                                                   |
|  [YouTube Standard] [Bold Pop] [Karaoke] [Minimal] [Cinematic]   |
|  [Subtitle] [Neon Glow] [Typewriter] [Custom]                    |
|                                                                   |
|  +----------------------------+  +-----------------------------+  |
|  |                            |  |  Font: [Inter v]            |  |
|  |   [Video preview with      |  |  Size: [36px]               |  |
|  |    caption overlay]        |  |  Color: [#FFFFFF] [picker]  |  |
|  |                            |  |  Background: [#000000 50%]  |  |
|  |  "This is how your         |  |  Position: [Bottom Center v]|  |
|  |   captions will look"     |  |  Outline: [2px] [#000000]   |  |
|  |                            |  |  Shadow: [On/Off]           |  |
|  +----------------------------+  |  Animation: [Fade In v]     |  |
|                                  |  Highlight color: [#7C3AED] |  |
|                                  |  Words per line: [Auto v]   |  |
|                                  +-----------------------------+  |
|                                                                   |
|  Caption Timeline:                                                |
|  +------------------------------------------------------------+  |
|  | [Hello ] [everyone] [welcome] [back] [to] [the] [channel]  |  |
|  +------------------------------------------------------------+  |
|  | 0:00    0:01      0:02     0:03    0:04                     |  |
|                                                                   |
|  [Export SRT]  [Export VTT]  [Burn In]              [Apply]       |
+------------------------------------------------------------------+
```

### UI Elements

- **Style presets**: Visual preview cards for each caption style
- **Live preview**: Video frame with caption overlay, updates in real-time as settings change
- **Settings panel**: Font, size, color, background, position, outline, shadow, animation, highlight
- **Caption timeline**: Word-level blocks that can be dragged to adjust timing
- **Platform preview**: Toggle to see how captions look on YouTube, TikTok, Shorts
- **Export options**: SRT, VTT, or burn-in (hardcode into video)

### Accessibility

- All color pickers include contrast ratio check (WCAG AA minimum for readability)
- Caption position presets account for platform UI safe zones
- Preview can be tested with screen reader to verify caption text

---

## Screen 7: Export Settings

**Purpose:** Configure and execute video export with platform-specific presets.

### Layout

```
+------------------------------------------------------------------+
|  Export                                                   [X Close] |
+------------------------------------------------------------------+
|                                                                   |
|  Platform Presets:                                                |
|  +----------+ +----------+ +----------+ +----------+ +--------+  |
|  | [YT icon]| | [YT icon]| | [TT icon]| | [IG icon]| | Custom |  |
|  | YouTube  | | Shorts   | | TikTok   | | Reels    | |        |  |
|  | 16:9     | | 9:16     | | 9:16     | | 9:16     | | [gear] |  |
|  +----------+ +----------+ +----------+ +----------+ +--------+  |
|                                                                   |
|  Selected: YouTube                                                |
|                                                                   |
|  Resolution:  [3840x2160 v]    Codec:     [H.264 v]              |
|  Frame Rate:  [30fps v]        Bitrate:   [Auto (45 Mbps)]       |
|  Audio:       [AAC 320kbps v]  Loudness:  [-14 LUFS (YouTube)]   |
|                                                                   |
|  Captions:    [x] Include SRT    [ ] Burn-in captions            |
|  Chapters:    [x] Include chapter markers                         |
|  Thumbnail:   [x] Export thumbnail                                |
|                                                                   |
|  Output:      [~/Desktop/exports/]  [Browse]                     |
|  Filename:    [my-video-final.mp4]                                |
|                                                                   |
|  Estimated file size: 2.3 GB                                     |
|  Estimated render time: 3 minutes                                 |
|                                                                   |
|  [ ] Add to render queue (export later)                           |
|                                                                   |
|                               [Cancel]  [Export Now]              |
+------------------------------------------------------------------+
```

### UI Elements

- **Platform preset cards**: Visual cards for each platform with aspect ratio preview
- **Settings form**: Resolution, codec, frame rate, bitrate, audio codec, loudness normalization
- **Checkbox options**: Include SRT, burn-in captions, chapters, thumbnail
- **Output path**: File browser for choosing export location
- **Estimates**: File size and render time based on current settings
- **Render queue toggle**: Option to queue for later instead of rendering immediately
- **Export Now button**: Primary CTA, starts rendering

### States

- **Selecting preset**: Settings auto-populate when a preset is clicked
- **Custom settings**: All fields become editable
- **Exporting**: Transitions to Render Progress screen
- **Batch mode**: Multiple presets selected, shows combined render time

---

## Screen 8: Thumbnail Studio

**Purpose:** Create, edit, and preview YouTube thumbnails.

### Layout

```
+------------------------------------------------------------------+
|  Thumbnail Studio                                        [X Close] |
+------------------------------------------------------------------+
|                                                                   |
|  Auto-Extracted Frames:                                           |
|  [frame1] [frame2] [frame3] [frame4] [frame5] [+ Browse]         |
|                                                                   |
|  +------------------------------------------+  +--------------+  |
|  |                                          |  | Templates:   |  |
|  |     [Thumbnail canvas / editor]          |  | [Template 1] |  |
|  |     1920 x 1080                          |  | [Template 2] |  |
|  |                                          |  | [Template 3] |  |
|  |     [Subject with removed background]    |  | [Template 4] |  |
|  |     [Title text overlay]                 |  | [Template 5] |  |
|  |     [Emoji / sticker]                    |  | [Template 6] |  |
|  |                                          |  |              |  |
|  +------------------------------------------+  | [Browse All] |  |
|                                                 +--------------+  |
|  Tools: [Text] [Shape] [Sticker] [Background] [Erase BG] [Filter]|
|                                                                   |
|  Variants: [Variant A] [Variant B] [Variant C] [+ Add Variant]   |
|                                                                   |
|                      [Download PNG]  [Upload to YouTube]          |
+------------------------------------------------------------------+
```

### UI Elements

- **Auto-extracted frames**: AI-selected best frames from the video
- **Canvas editor**: WYSIWYG editor for the thumbnail at 1920x1080
- **Template sidebar**: Pre-built thumbnail templates, scrollable
- **Tool bar**: Text tool, shape tool, sticker/emoji tool, background swap, background removal, filter
- **Variant tabs**: Create multiple versions for A/B testing
- **Export options**: Download as PNG, or direct upload to YouTube via API

---

## Screen 9: Template Library

**Purpose:** Browse, preview, and apply pre-built editing templates, caption styles, transition packs, and brand kits.

### Layout

```
+------------------------------------------------------------------+
|  [<- Back]  Template Library                [Search.......] [Filter]|
+------------------------------------------------------------------+
|                                                                   |
|  Categories: [All] [Captions] [Transitions] [Color] [Intros]     |
|              [Outros] [Lower Thirds] [Music] [Sound Effects]     |
|                                                                   |
|  Popular This Week                                                |
|  +----------+ +----------+ +----------+ +----------+             |
|  | [Preview]| | [Preview]| | [Preview]| | [Preview]|             |
|  | Bold Pop | | Smooth   | | Glitch   | | Cinematic|             |
|  | Captions | | Fade     | | Trans.   | | LUT Pack |             |
|  | Free     | | Pro      | | Free     | | Pro      |             |
|  | [Apply]  | | [Apply]  | | [Apply]  | | [Apply]  |             |
|  +----------+ +----------+ +----------+ +----------+             |
|                                                                   |
|  New Additions                                                    |
|  +----------+ +----------+ +----------+ +----------+             |
|  | ...      | | ...      | | ...      | | ...      |             |
|  +----------+ +----------+ +----------+ +----------+             |
|                                                                   |
+------------------------------------------------------------------+
```

### UI Elements

- **Category tabs**: Filter by template type
- **Template cards**: Animated preview on hover, name, tier badge (Free/Pro), Apply button
- **Search**: Search templates by name, style, or keyword
- **Filter**: Sort by popularity, newest, free-only
- **Template detail**: Click to open expanded view with full preview and description
- **Apply button**: Applies template to current project (or adds to asset library if no project is open)

---

## Screen 10: Settings / Preferences

**Purpose:** Configure app behavior, performance, keyboard shortcuts, and AI preferences.

### Layout

```
+------------------------------------------------------------------+
|  Settings                                                [X Close] |
+------------------------------------------------------------------+
|  +---------------+  +------------------------------------------+ |
|  | General       |  |  General Settings                        | |
|  | Editor        |  |                                          | |
|  | AI            |  |  Language:        [English v]             | |
|  | Performance   |  |  Auto-save:       [Every 30 seconds v]   | |
|  | Keyboard      |  |  Default export:  [~/Desktop/exports/]   | |
|  | Storage       |  |  Startup:         [x] Open last project  | |
|  | Updates       |  |  Theme:           Dark (only option)      | |
|  | About         |  |  Notifications:   [x] Export complete     | |
|  |               |  |                   [x] AI processing done  | |
|  |               |  |                   [ ] Update available     | |
|  |               |  |                                          | |
|  +---------------+  +------------------------------------------+ |
+------------------------------------------------------------------+
```

### Settings Sections

| Section | Settings |
|---|---|
| **General** | Language, auto-save interval, default export path, startup behavior, notification preferences |
| **Editor** | Default timeline zoom, transcript font size, waveform color, playback quality, panel layout |
| **AI** | Transcription language preference, filler word list (customizable), silence threshold, AI command history |
| **Performance** | GPU acceleration on/off, preview quality (draft/full), render threads, memory limit, proxy editing |
| **Keyboard** | Full shortcut customization table, import/export shortcut profiles, reset to defaults |
| **Storage** | Cache location, cache size limit, clear cache, project storage stats |
| **Updates** | Auto-update on/off, check for updates, current version, changelog |
| **About** | Version, license, credits, feedback link, system info |

---

## Screen 11: Account / Subscription

**Purpose:** Manage account details, subscription plan, and billing.

### Layout

```
+------------------------------------------------------------------+
|  Account                                                 [X Close] |
+------------------------------------------------------------------+
|  +---------------+  +------------------------------------------+ |
|  | Profile       |  |  Your Plan: Creator ($19.99/mo)          | |
|  | Subscription  |  |                                          | |
|  | Billing       |  |  [x] Unlimited projects                  | |
|  | Usage         |  |  [x] 4K export                           | |
|  | Data          |  |  [x] All AI features                     | |
|  |               |  |  [x] No watermark                        | |
|  |               |  |                                          | |
|  |               |  |  AI Usage This Month:                    | |
|  |               |  |  Transcription:  142 min / unlimited      | |
|  |               |  |  AI Commands:    87 / unlimited           | |
|  |               |  |                                          | |
|  |               |  |  [Upgrade to Pro]  [Manage Billing]       | |
|  |               |  |  [Cancel Subscription]                   | |
|  +---------------+  +------------------------------------------+ |
+------------------------------------------------------------------+
```

### Sections

| Section | Content |
|---|---|
| **Profile** | Name, email, avatar, password change, connected accounts (Google, YouTube) |
| **Subscription** | Current plan details, feature list, upgrade/downgrade options |
| **Billing** | Payment method, billing history, invoices, next billing date |
| **Usage** | AI transcription minutes used, AI commands used, storage used, exports this month |
| **Data** | Export personal data, delete account (with confirmation flow) |

---

## Screen 12: Render Progress

**Purpose:** Show export rendering progress with detailed status information.

### Layout

```
+------------------------------------------------------------------+
|  Rendering...                                                     |
+------------------------------------------------------------------+
|                                                                   |
|  my-video-final.mp4                                               |
|                                                                   |
|  [=======================================.............]  78%      |
|                                                                   |
|  Time elapsed:   2:14                                             |
|  Time remaining: 0:38 (estimated)                                 |
|  Speed:          3.2x real-time                                   |
|                                                                   |
|  Current step:   Encoding video (H.264, 3840x2160)               |
|  Frame:          14,230 / 18,240                                  |
|  Audio:          Normalized to -14 LUFS                           |
|                                                                   |
|  Render Queue (1 of 3):                                           |
|  [x] YouTube (4K)                 -- Done                        |
|  [=>] TikTok (1080x1920)         -- Rendering (78%)             |
|  [ ] Instagram Reels (1080x1920) -- Queued                       |
|                                                                   |
|  [ ] Shut down computer after render completes                    |
|                                                                   |
|                              [Cancel Render]  [Minimize to Tray]  |
+------------------------------------------------------------------+
```

### UI Elements

- **Progress bar**: Percentage-based with gradient fill (electric violet to cyan)
- **Stats**: Time elapsed, estimated remaining, render speed multiplier
- **Current step detail**: What the encoder is currently doing
- **Frame counter**: Current frame / total frames
- **Render queue**: If batch exporting, show queue with status for each
- **Post-render option**: Shut down, sleep, or open output folder when complete
- **Cancel**: Stop render (with confirmation -- partial file will be deleted)
- **Minimize**: Send to system tray, show progress in tray icon

### States

- **Rendering**: Progress bar advancing, stats updating
- **Paused**: Progress bar frozen, "Paused" label, Resume button
- **Complete**: Success animation, "Open File" and "Open Folder" buttons, notification
- **Error**: Error message with details, retry button, log file link
- **Queue**: Multiple items showing individual and overall progress

---

## Screen 13: Asset Library

**Purpose:** Browse and manage audio tracks, sound effects, transitions, and other media assets.

### Layout

```
+------------------------------------------------------------------+
|  Asset Library                                           [X Close] |
+------------------------------------------------------------------+
|  [Music] [Sound Effects] [Transitions] [Stock Video] [My Uploads] |
+------------------------------------------------------------------+
|  Search: [Search assets..........]  Genre: [All v]  Mood: [All v] |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  | [>] Upbeat Corporate        | 2:34 | Electronic | Free     |  |
|  |     [waveform preview]      |      |            |          |  |
|  +------------------------------------------------------------+  |
|  | [>] Chill Lo-fi Beats       | 3:12 | Lo-fi      | Pro      |  |
|  |     [waveform preview]      |      |            |          |  |
|  +------------------------------------------------------------+  |
|  | [>] Epic Cinematic          | 1:45 | Orchestral | Free     |  |
|  |     [waveform preview]      |      |            |          |  |
|  +------------------------------------------------------------+  |
|  | [>] Podcast Intro Jingle    | 0:15 | Jingle     | Free     |  |
|  |     [waveform preview]      |      |            |          |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  [Preview]  [Add to Project]  [Download]  [Favorite]              |
+------------------------------------------------------------------+
```

### UI Elements

- **Category tabs**: Music, Sound Effects, Transitions, Stock Video, My Uploads
- **Search and filters**: Search by name/keyword, filter by genre, mood, duration, license tier
- **Asset rows**: Play button, waveform preview, name, duration, category, tier badge
- **Actions**: Preview (plays in-app), Add to Project (inserts into timeline), Download (saves locally), Favorite (saves to personal collection)
- **My Uploads section**: User's own audio/video assets, drag-and-drop upload
- **Usage rights**: Clear licensing information for each asset

### Accessibility

- All asset previews have play/pause via keyboard (Enter to play, Escape to stop)
- Screen reader announces asset name, duration, and category
- Filter controls are keyboard-accessible
- Waveform is decorative (aria-hidden), textual information is provided separately

---

## Global UI Patterns

### Loading States

All screens use consistent loading patterns:

- **Skeleton screens**: Gray placeholder blocks mimicking the final layout while content loads
- **Shimmer animation**: Subtle left-to-right shimmer on skeleton blocks
- **Progress indicators**: Determinate progress bars for known-duration operations (rendering, importing), indeterminate spinners for unknown-duration operations (AI processing)

### Error States

- **Inline errors**: Red text below the relevant input field
- **Toast notifications**: Bottom-right corner, auto-dismiss after 5 seconds, with action button (Retry, Dismiss)
- **Full-screen errors**: Only for unrecoverable errors (corrupt project file, system incompatibility)
- **Error recovery**: Every error state includes a clear path forward (Retry, Skip, Contact Support)

### Empty States

- **Illustration**: Custom illustrations for each empty state (no projects, no assets, no templates)
- **CTA**: Clear call-to-action button ("Create your first project," "Import media," "Browse templates")
- **No search results**: Suggest broadening search terms or clearing filters

### Responsive Panel Layout

While VaultEdit is desktop-first, the editor panels adapt to different window sizes:

| Window Width | Layout Adjustment |
|---|---|
| > 1440px | Full four-panel layout (preview, transcript, timeline, AI bar) |
| 1024-1440px | Transcript panel collapses to narrow mode, smaller thumbnails |
| < 1024px | Transcript overlays as a drawer, timeline simplified |

### Accessibility Standards

- All interactive elements are keyboard-navigable
- Focus indicators are clearly visible (2px electric violet outline)
- Color is never the sole indicator of state (icons and text labels accompany color coding)
- Minimum contrast ratio of 4.5:1 for all text (7:1 for critical information)
- All images and icons have descriptive alt text or aria-labels
- Screen reader announcements for state changes (export complete, AI response ready)
- Resizable text up to 200% without layout breaking

---

*Every screen serves one purpose: get the creator from raw footage to published video faster.*
