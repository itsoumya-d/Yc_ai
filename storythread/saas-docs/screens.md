# StoryThread - Screens

> Complete screen inventory, UI elements, navigation flows, states, and accessibility for every page in the platform.

---

## Screen Inventory

| #  | Screen                  | Route                                    | Auth Required | User Type      |
| -- | ----------------------- | ---------------------------------------- | ------------- | -------------- |
| 01 | Landing Page            | `/`                                      | No            | All            |
| 02 | Writing Studio          | `/stories/[id]/chapters/[id]`            | Yes           | Writer         |
| 03 | Character Bible         | `/stories/[id]/characters`               | Yes           | Writer         |
| 04 | World Builder           | `/stories/[id]/world`                    | Yes           | Writer         |
| 05 | Story Manager           | `/stories/[id]`                          | Yes           | Writer         |
| 06 | Reading View            | `/story/[slug]/[chapterSlug]`            | No            | Reader         |
| 07 | Discovery Feed          | `/discover`                              | No*           | All            |
| 08 | Writer Profile          | `/writer/[username]`                     | No            | All            |
| 09 | Reader Profile          | `/profile`                               | Yes           | Reader/Writer  |
| 10 | Analytics Dashboard     | `/stories/[id]/analytics`                | Yes           | Writer (paid)  |
| 11 | Settings / Account      | `/profile/settings`                      | Yes           | All            |
| 12 | Notifications           | `/notifications`                         | Yes           | All            |

*Discovery feed works without auth but personalizes with auth.

---

## 01. Landing Page

**Route:** `/`
**Purpose:** Convert visitors into writers and readers. Showcase the platform's value.

### Layout

```
+------------------------------------------------------------------+
|  [Logo]  Discover  Pricing  Login  [Start Writing - CTA button]  |
+------------------------------------------------------------------+
|                                                                    |
|           Write stories together, powered by AI.                   |
|                                                                    |
|     [Start Writing Free]        [Explore Stories]                   |
|                                                                    |
|     [Hero illustration: writer at desk with AI sparkles]           |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  Featured Stories (horizontal scroll)                              |
|  +----------+ +----------+ +----------+ +----------+              |
|  | Cover    | | Cover    | | Cover    | | Cover    |              |
|  | Title    | | Title    | | Title    | | Title    |              |
|  | Author   | | Author   | | Author   | | Author   |              |
|  | Genre    | | Genre    | | Genre    | | Genre    |              |
|  +----------+ +----------+ +----------+ +----------+              |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  How It Works (3 columns)                                          |
|  [1. Write]         [2. Collaborate]      [3. Publish]             |
|  AI helps you       Co-write with         Build an audience        |
|  craft your story   other writers         and earn                  |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  Browse by Genre                                                   |
|  [Fantasy] [Sci-Fi] [Romance] [Mystery] [Horror] [Literary] ...   |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  Writer Testimonials                                               |
|  "Quote from writer..." — @username                                |
|                                                                    |
+------------------------------------------------------------------+
|  Footer: Links, Social, Legal, Contact                             |
+------------------------------------------------------------------+
```

### UI Elements

- **Navigation bar**: Logo, Discover link, Pricing link, Login button, "Start Writing" primary CTA
- **Hero section**: Tagline, two CTA buttons (primary: Start Writing, secondary: Explore Stories), hero illustration
- **Featured stories carousel**: Horizontally scrollable story cards (cover, title, author, genre badge, chapter count)
- **How it works**: Three-column feature explanation with icons
- **Genre browser**: Pill-shaped genre buttons that link to filtered discovery
- **Testimonials**: Rotating writer quotes with avatars
- **Footer**: About, Blog, Pricing, Terms, Privacy, Contact, social media links

### States

- **Logged out**: Default landing experience with sign-up CTAs
- **Logged in (writer)**: Nav shows Dashboard link, "Start Writing" changes to "My Stories"
- **Logged in (reader)**: Nav shows reading list icon, notification bell

### Accessibility

- All interactive elements keyboard-navigable (Tab order follows visual flow)
- Hero section has descriptive alt text on illustration
- Genre buttons have `role="link"` with descriptive labels
- Story cards are focusable with keyboard; Enter opens story
- Color contrast ratios meet WCAG AA (4.5:1 minimum for text)
- Skip-to-content link at page top

---

## 02. Writing Studio

**Route:** `/stories/[storyId]/chapters/[chapterId]`
**Purpose:** The primary writing experience. Editor with AI panel and outline sidebar.

### Layout

```
+------------------------------------------------------------------+
| [< Back] Story Title > Chapter Title    [Save] [Preview] [...]   |
+------------------------------------------------------------------+
|          |                                    |                    |
| OUTLINE  |           EDITOR                   |    AI PANEL        |
| SIDEBAR  |                                    |                    |
|          |  Chapter Title (editable)           | [Continue Story]   |
| Ch. 1    |                                    | [Suggest Dialogue] |
| Ch. 2 *  |  The rain fell in sheets as        | [Rephrase]         |
| Ch. 3    |  Maria crossed the bridge. She     | [Describe Scene]   |
|  + New   |  clutched the letter tighter,      | [Fix Prose]        |
|          |  wondering if the words inside     |                    |
| -------- |  would change everything.          | ---- Tone ----     |
| QUICK    |                                    | [Dramatic]         |
| REFS     |  [AI ghost text suggestion in      | [Humorous]         |
|          |   lighter color... press Tab]      | [Dark]             |
| Maria    |                                    | [Lyrical]          |
| James    |                                    |                    |
| The      |                                    | ---- Quick Ref --- |
| Bridge   |  +-----------+                     | Maria (protag)     |
|          |  | Toolbar:  |                     |  - green eyes      |
|          |  | B I U S   |                     |  - stubborn        |
|          |  | H1 H2 H3  |                     |  - carries letter  |
|          |  | " - [] AI |                     |                    |
|          |  +-----------+                     |                    |
|          |                                    |                    |
|          |  Words: 2,847 / 5,000 goal         |                    |
|          |  Reading time: ~11 min             |                    |
|          |  Last saved: 30s ago               |                    |
+----------+------------------------------------+--------------------+
```

### UI Elements

- **Top bar**: Back button, breadcrumb (Story > Chapter), save indicator, preview button, more menu (export, settings, version history)
- **Outline sidebar** (collapsible, left):
  - Chapter list with status indicators (draft/published dot)
  - Current chapter highlighted
  - "Add Chapter" button
  - Quick references: characters and locations mentioned in current chapter
  - Drag handle for reordering chapters
- **Editor** (center):
  - TipTap rich text editor area
  - Floating toolbar (bold, italic, underline, strikethrough, headings, blockquote, list, divider, AI actions)
  - AI ghost text (dimmed continuation text, press Tab to accept)
  - Status bar: word count, goal progress bar, reading time, save status
- **AI Panel** (collapsible, right):
  - AI action buttons (Continue Story, Suggest Dialogue, Rephrase, Describe Scene, Fix Prose)
  - Tone selector (Dramatic, Humorous, Dark, Lyrical, Neutral)
  - Quick character reference cards
  - AI suggestion output area (with Accept / Reject / Regenerate buttons)
  - AI usage counter (X/200 remaining today)

### States

- **Writing**: Normal editing mode, auto-save active, AI available
- **AI generating**: Loading spinner in AI panel, ghost text animating in editor
- **AI suggestion displayed**: Highlighted suggestion in editor with accept/reject controls
- **Collaborative editing**: Other writer's cursor visible with name label, colored highlights
- **Focus mode**: Sidebar and AI panel hidden, only current paragraph visible, rest dimmed
- **Offline**: "Offline - changes will sync when connected" banner, AI disabled
- **Saving**: Subtle "Saving..." indicator in status bar
- **Saved**: Checkmark with "Saved" in status bar
- **Save failed**: Red "Save failed - retrying" with manual retry button

### Accessibility

- Editor supports screen readers via ARIA labels on toolbar buttons
- Keyboard shortcuts for all AI actions (Ctrl+Shift+C for Continue, etc.)
- Tab key accepts AI suggestion; Escape dismisses
- Focus trap in modals (version history, export dialog)
- High contrast mode support for focus mode
- Sidebar panels togglable via keyboard (Ctrl+\ for outline, Ctrl+/ for AI panel)

---

## 03. Character Bible

**Route:** `/stories/[storyId]/characters`
**Purpose:** Manage all characters, their traits, and relationships.

### Layout

```
+------------------------------------------------------------------+
| [< Story] Character Bible                    [+ New Character]    |
+------------------------------------------------------------------+
|                                                                    |
| Filter: [All] [Protagonist] [Antagonist] [Supporting] [Mentioned] |
| Search: [Search characters...]                                     |
|                                                                    |
| +-------------------+  +---------------------------------------+  |
| |                   |  |                                       |  |
| | CHARACTER LIST    |  |  CHARACTER DETAIL                     |  |
| |                   |  |                                       |  |
| | [Avatar] Maria *  |  |  [Portrait]  Maria Elena Vasquez     |  |
| | [Avatar] James    |  |  Role: Protagonist                    |  |
| | [Avatar] Dr. Patel|  |  First Appears: Chapter 1             |  |
| | [Avatar] The Crow |  |                                       |  |
| |                   |  |  APPEARANCE                           |  |
| |                   |  |  Green eyes, dark curly hair,          |  |
| |                   |  |  small scar on left temple              |  |
| |                   |  |                                       |  |
| |                   |  |  PERSONALITY                          |  |
| |                   |  |  Stubborn, loyal, quick-tempered,      |  |
| |                   |  |  secretly romantic                      |  |
| |                   |  |                                       |  |
| |                   |  |  BACKSTORY                            |  |
| |                   |  |  Grew up in a fishing village...        |  |
| |                   |  |                                       |  |
| |                   |  |  RELATIONSHIPS                        |  |
| |                   |  |  James -- rival turned ally             |  |
| |                   |  |  Dr. Patel -- mentor                   |  |
| |                   |  |                                       |  |
| |                   |  |  SPEECH PATTERNS                      |  |
| |                   |  |  Uses fishing metaphors, avoids        |  |
| |                   |  |  contractions when upset                |  |
| |                   |  |                                       |  |
| |                   |  |  [AI: Check Consistency] [Edit] [Del]  |  |
| +-------------------+  +---------------------------------------+  |
|                                                                    |
| RELATIONSHIP MAP  [Toggle View]                                    |
| +--------------------------------------------------------------+  |
| |  [Maria] ---rival---> [James]                                 |  |
| |     \                    /                                     |  |
| |      \--mentor-> [Dr. Patel]                                  |  |
| |                     |                                          |  |
| |              [The Crow] (mysterious)                           |  |
| +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### UI Elements

- **Header**: Back to story, page title, "New Character" button
- **Filter bar**: Role-based filter pills, search input
- **Character list** (left panel): Scrollable list of character cards with avatar, name, role badge
- **Character detail** (right panel): Full character sheet with all fields, editable inline
- **Relationship map** (bottom, toggleable): Visual graph of character connections with labeled edges
- **AI consistency check button**: Scans all chapters for contradictions against this character's bible entry
- **Action buttons**: Edit (opens inline editing), Delete (confirmation dialog), Generate Portrait (AI)

### States

- **Empty state**: "No characters yet. Create your first character to help AI maintain consistency."
- **Character selected**: Detail panel shows full character info
- **Editing character**: Fields become editable with save/cancel
- **AI checking consistency**: Progress bar scanning chapters, then results list
- **Consistency issue found**: Warning cards with chapter reference and contradiction description

### Accessibility

- Character list navigable with arrow keys
- Relationship map has text alternative (list of relationships)
- All form fields labeled with `<label>` elements
- Delete confirmation requires explicit action (not just hover)

---

## 04. World Builder

**Route:** `/stories/[storyId]/world`
**Purpose:** Build and organize the story's universe — locations, lore, rules, timeline, items, factions.

### Layout

```
+------------------------------------------------------------------+
| [< Story] World Builder                       [+ New Entry]       |
+------------------------------------------------------------------+
|                                                                    |
| Tabs: [Locations] [Lore] [Rules] [Timeline] [Items] [Factions]   |
|                                                                    |
| +-------------------+  +---------------------------------------+  |
| |                   |  |                                       |  |
| | ENTRY TREE        |  |  ENTRY DETAIL                        |  |
| |                   |  |                                       |  |
| | > The Realm       |  |  The Bridge of Whispers              |  |
| |   > Ashwick       |  |  Type: Location                       |  |
| |     - The Bridge  |  |  Parent: Ashwick                      |  |
| |     - Town Square |  |                                       |  |
| |   > The Wilds     |  |  DESCRIPTION                         |  |
| |     - Dark Hollow |  |  An ancient stone bridge spanning     |  |
| |                   |  |  the Ashwick River. Locals say it      |  |
| |                   |  |  whispers the names of the dead...     |  |
| |                   |  |                                       |  |
| |                   |  |  DETAILS                              |  |
| |                   |  |  Climate: Misty, cold                  |  |
| |                   |  |  Population: None (landmark)           |  |
| |                   |  |  Significance: Site of the ritual      |  |
| |                   |  |                                       |  |
| |                   |  |  APPEARS IN                           |  |
| |                   |  |  Chapter 3, Chapter 7, Chapter 12      |  |
| |                   |  |                                       |  |
| |                   |  |  [AI: Expand] [Edit] [Delete]         |  |
| +-------------------+  +---------------------------------------+  |
+------------------------------------------------------------------+
```

### UI Elements

- **Tab bar**: Entry type tabs (Locations, Lore, Rules, Timeline, Items, Factions)
- **Entry tree** (left): Hierarchical collapsible tree for locations; flat list for other types
- **Entry detail** (right): Full entry view with type-specific fields
- **AI Expand button**: AI generates additional details consistent with existing world
- **Timeline view** (when Timeline tab selected): Horizontal scrollable timeline with event markers
- **Map view** (optional): Upload a map image with clickable hotspots linked to location entries
- **Cross-references**: Links to characters and chapters that mention this entry

### States

- **Empty state**: "Build your world. Start with a location or a piece of lore." + genre-specific template buttons
- **Template selected**: Pre-populated world structure for chosen genre (Fantasy Kingdom, Space Station, etc.)
- **AI expanding**: Loading state on entry, AI generates new content added to description
- **Timeline view**: Events displayed chronologically with chapter markers

---

## 05. Story Manager

**Route:** `/stories/[storyId]`
**Purpose:** Overview of a story's chapters, settings, and status.

### Layout

```
+------------------------------------------------------------------+
| [< My Stories]  Story Manager                                      |
+------------------------------------------------------------------+
|                                                                    |
| +-----------------------------------+  +------------------------+ |
| | [Cover Image]                     |  | STORY SETTINGS         | |
| |                                   |  |                        | |
| | The Last Dragon                   |  | Status: Ongoing        | |
| | by @maria_writes                  |  | Genre: Fantasy, Drama  | |
| |                                   |  | Rating: Teen           | |
| | 12 chapters | 47,832 words        |  | Tags: dragons, quest   | |
| | 3,421 readers | 892 subscribers   |  |                        | |
| +-----------------------------------+  | [Edit Settings]        | |
|                                        +------------------------+ |
|                                                                    |
| CHAPTERS                                    [+ New Chapter]        |
| +--------------------------------------------------------------+  |
| | #  | Title              | Words | Status    | Published      |  |
| |----|--------------------+-------+-----------+----------------|  |
| | 1  | The Beginning      | 3,200 | Published | Jan 15, 2025   |  |
| | 2  | Into the Wilds     | 4,100 | Published | Jan 22, 2025   |  |
| | 3  | The Bridge         | 3,800 | Published | Jan 29, 2025   |  |
| | ... | ...               | ...   | ...       | ...            |  |
| | 11 | The Betrayal       | 5,200 | Published | Apr 2, 2025    |  |
| | 12 | Fire and Fury      | 2,100 | Draft     | —              |  |
| +--------------------------------------------------------------+  |
|                                                                    |
| QUICK LINKS                                                       |
| [Characters (8)] [World (23 entries)] [Analytics] [Collaborators] |
+------------------------------------------------------------------+
```

### UI Elements

- **Story header**: Cover image, title, author, stats (chapters, word count, readers, subscribers)
- **Story settings card**: Status dropdown, genre selector, content rating, tags, edit button
- **Chapter table**: Sortable table with chapter number, title, word count, status badge, publish date
- **Chapter row actions**: Edit (opens Writing Studio), Preview, Publish/Unpublish, Delete
- **Drag handles**: Reorder chapters via drag-and-drop on the number column
- **Quick links**: Navigation to Character Bible, World Builder, Analytics, Collaborator management
- **Bulk actions toolbar**: Appears when chapters are selected (publish, unpublish, delete)

### States

- **No chapters**: "Start your story. Write your first chapter." CTA
- **All draft**: Story not yet published, publish reminder banner
- **Mixed status**: Clear visual distinction between published (green dot) and draft (gray dot)
- **Scheduled**: Orange clock icon with scheduled date
- **Collaborative**: Shows collaborator avatars and their assigned chapters

---

## 06. Reading View

**Route:** `/story/[slug]/[chapterSlug]`
**Purpose:** Clean, distraction-free reading experience optimized for long-form fiction.

### Layout

```
+------------------------------------------------------------------+
|  [StoryThread logo]              [Bookmark] [Share] [Login/User]  |
+------------------------------------------------------------------+
|                                                                    |
|  [Reading progress bar — thin line at top of viewport]             |
|                                                                    |
|                    The Last Dragon                                  |
|                    Chapter 3: The Bridge                            |
|                    by @maria_writes                                 |
|                    ~15 min read                                     |
|                                                                    |
|         ----------------------------------------                    |
|                                                                    |
|              The rain fell in sheets as Maria                       |
|              crossed the Bridge of Whispers. Each                   |
|              step echoed against the ancient stone,                 |
|              and beneath her feet, she could almost                 |
|              hear the murmur of names — names of                    |
|              those who had crossed before and never                 |
|              returned.                                              |
|                                                                    |
|              She clutched the letter tighter, the                   |
|              parchment growing soft in the rain.                    |
|                                                                    |
|              [Paragraph reaction: 42 likes, 12 loves]              |
|                                                                    |
|              "You should not be here," a voice                     |
|              called from the mist.                                  |
|                                                                    |
|         ----------------------------------------                    |
|                                                                    |
|  Author's Note: Thank you for reading! Next chapter drops Friday.  |
|                                                                    |
|  [< Previous Chapter]     [Chapter List]     [Next Chapter >]      |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  COMMENTS (47)                                      [+ Comment]    |
|                                                                    |
|  @bookworm23: "This chapter gave me chills!"                       |
|    @maria_writes: "Thank you! Wait until Ch. 4..."                |
|                                                                    |
|  @fantasy_fan: [SPOILER] "I think the voice is..."                |
|                                                                    |
+------------------------------------------------------------------+
```

### UI Elements

- **Minimal navigation**: Logo (home), bookmark button, share button, user menu
- **Reading progress bar**: Thin line at top that fills as reader scrolls (sticky)
- **Story header**: Title, chapter title, author link, estimated reading time
- **Content area**: Centered prose with optimal reading width (65-75 characters per line)
- **Typography**: Lora serif font, 1.6 line height, generous paragraph spacing (see theme.md)
- **Paragraph reactions**: Subtle reaction counts that appear on hover/tap; click to react
- **Author's note**: Highlighted section at chapter end
- **Chapter navigation**: Previous/Next chapter buttons, chapter list link
- **Comments section**: Threaded comments with spoiler tags, writer-verified badges
- **Chapter list modal**: Overlay showing all chapters with reading progress

### States

- **First visit**: Full reading experience, prompt to create account at chapter end
- **Logged in reader**: Bookmark and react functionality active; reading progress saved
- **Chapter not yet published**: "This chapter is coming soon" placeholder
- **Subscriber-only chapter**: Preview first 500 words, then paywall with subscribe CTA
- **Story completed**: "The End" banner with "Rate this story" prompt
- **Mobile**: Full-width text, tap sides to show/hide navigation, swipe for chapters

### Accessibility

- Semantic HTML: `<article>`, `<section>`, `<header>`, `<nav>` for screen readers
- Font size adjustable via settings (stored in localStorage)
- Dark/Light/Sepia reading modes
- Reduced motion option disables progress bar animation
- Images have alt text; decorative dividers are `aria-hidden`
- Skip-to-comments link
- Keyboard: arrow keys for paragraph-level scrolling optional

---

## 07. Discovery Feed

**Route:** `/discover`
**Purpose:** Help readers find new stories through browsing, search, and recommendations.

### Layout

```
+------------------------------------------------------------------+
|  [Logo]  [Search stories...]  Discover  Pricing  [Login/User]     |
+------------------------------------------------------------------+
|                                                                    |
| Tabs: [For You] [Trending] [New] [Updated] [Editor's Picks]       |
|                                                                    |
| Genre Filter:                                                      |
| [All] [Fantasy] [Sci-Fi] [Romance] [Mystery] [Horror] [Lit Fic]  |
| [Fan Fiction] [Thriller] [Historical] [Comedy] [YA] [More...]     |
|                                                                    |
| +----------+ +----------+ +----------+ +----------+               |
| | [Cover]  | | [Cover]  | | [Cover]  | | [Cover]  |               |
| |          | |          | |          | |          |               |
| | Title    | | Title    | | Title    | | Title    |               |
| | Author   | | Author   | | Author   | | Author   |               |
| | Fantasy  | | Sci-Fi   | | Romance  | | Mystery  |               |
| | 12 ch    | | 8 ch     | | 23 ch    | | 6 ch     |               |
| | 3.4K     | | 1.2K     | | 8.9K     | | 567      |               |
| | reads    | | reads    | | reads    | | reads    |               |
| +----------+ +----------+ +----------+ +----------+               |
|                                                                    |
| +----------+ +----------+ +----------+ +----------+               |
| | ...      | | ...      | | ...      | | ...      |               |
| +----------+ +----------+ +----------+ +----------+               |
|                                                                    |
| [Load More]                                                        |
+------------------------------------------------------------------+
```

### UI Elements

- **Search bar**: Full-text search with auto-complete (story titles, authors, genres)
- **Tab navigation**: For You (personalized), Trending, New, Recently Updated, Editor's Picks
- **Genre filter pills**: Scrollable row of genre buttons, multi-select supported
- **Story cards** (grid layout, responsive):
  - Cover image (with fallback gradient if no cover)
  - Title (truncated to 2 lines)
  - Author name with avatar
  - Genre badge
  - Chapter count
  - Read count
  - Status badge (Ongoing, Completed)
  - Content rating indicator (if mature)
- **Sort options**: Most popular, newest, recently updated, highest rated
- **Load more button** (or infinite scroll with intersection observer)

### States

- **Logged out**: "For You" tab hidden; generic trending shown
- **Logged in, new user**: "For You" shows genre preferences onboarding ("What do you like to read?")
- **Logged in, returning**: "For You" shows personalized recommendations
- **Search active**: Results replace grid; highlight matching text in titles
- **No results**: "No stories found. Try different genres or search terms." + suggestions
- **Loading**: Skeleton cards with shimmer animation

---

## 08. Writer Profile

**Route:** `/writer/[username]`
**Purpose:** Public profile for writers showcasing their stories and building audience.

### Layout

```
+------------------------------------------------------------------+
| [Logo]  Discover  [Login/User]                                     |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+                                              |
|  | [Avatar - large] |  @maria_writes                               |
|  |                  |  Maria Elena Vasquez                          |
|  +------------------+  "Writing fantasy stories about              |
|                         ordinary people in extraordinary worlds"    |
|                                                                    |
|  12 stories | 47K total words | 3,421 followers                    |
|                                                                    |
|  [Follow]  [Subscribe $4.99/mo]  [Tip]                             |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
| Tabs: [Stories] [About] [Subscribers-Only]                         |
|                                                                    |
| STORIES                                                            |
| +----------+ +----------+ +----------+                             |
| | The Last | | Whispers | | Short    |                             |
| | Dragon   | | of the   | | Stories  |                             |
| | [Cover]  | | Deep     | | [Cover]  |                             |
| | Ongoing  | | [Cover]  | | Complete |                             |
| | 12 ch    | | Complete | | 5 ch     |                             |
| +----------+ | 24 ch    | +----------+                             |
|              +----------+                                          |
+------------------------------------------------------------------+
```

### UI Elements

- **Profile header**: Large avatar, username, display name, bio, stats (stories, words, followers)
- **Action buttons**: Follow (toggles to Following), Subscribe (with price), Tip (opens tip modal)
- **Tab bar**: Stories (default), About (extended bio, social links), Subscribers-Only (premium content)
- **Story grid**: Writer's published stories as cards
- **Social links**: Twitter/X, Instagram, personal website
- **Subscriber badge**: If viewer is subscribed, show "Subscribed" badge

### States

- **Own profile**: Shows "Edit Profile" button, no follow/subscribe buttons
- **Not following**: "Follow" button primary style
- **Following**: "Following" button with checkmark, secondary style
- **Subscribed**: "Subscribed" badge, subscriber-only content visible
- **No stories**: "This writer hasn't published yet. Check back soon!"

---

## 09. Reader Profile

**Route:** `/profile`
**Purpose:** Personal reading dashboard with reading lists, bookmarks, and following.

### Layout

```
+------------------------------------------------------------------+
| [Logo]  Discover  [Notifications]  [User Menu]                     |
+------------------------------------------------------------------+
|                                                                    |
|  [Avatar] Username                                                 |
|  Member since Jan 2025                                             |
|  Following: 12 writers | Reading: 8 stories                        |
|                                                                    |
| Tabs: [Currently Reading] [Reading Lists] [Following] [History]    |
|                                                                    |
| CURRENTLY READING                                                  |
| +--------------------------------------------------------------+  |
| | [Cover] The Last Dragon - Ch. 8 of 12 (67%)  [Continue]      |  |
| | [Cover] Whispers of the Deep - Ch. 3 of 24 (12%) [Continue]  |  |
| | [Cover] Moonlit Streets - Ch. 15 of 15 (100%) [Rate]         |  |
| +--------------------------------------------------------------+  |
|                                                                    |
| READING LISTS                                                      |
| [To Read (14)]  [Favorites (7)]  [+ New List]                     |
+------------------------------------------------------------------+
```

### UI Elements

- **Profile header**: Avatar, username, join date, stats
- **Tab navigation**: Currently Reading, Reading Lists, Following, History
- **Currently reading cards**: Cover, title, progress bar, chapter info, Continue button
- **Reading lists**: Named collections with story count, public/private toggle
- **Following list**: Writer cards with recent activity (new chapter published)
- **History**: Chronological reading activity

---

## 10. Analytics Dashboard

**Route:** `/stories/[storyId]/analytics`
**Purpose:** Data on reader engagement, retention, and revenue for a story.

### Layout

```
+------------------------------------------------------------------+
| [< Story] Analytics: The Last Dragon           [Date Range v]     |
+------------------------------------------------------------------+
|                                                                    |
|  +------------+ +------------+ +------------+ +------------+      |
|  | Total      | | Unique     | | Avg Read   | | Subscriber |      |
|  | Reads      | | Readers    | | Time       | | Growth     |      |
|  | 45,231     | | 3,421      | | 18 min     | | +127 this  |      |
|  | +12% WoW   | | +8% WoW    | | -2% WoW    | | month      |      |
|  +------------+ +------------+ +------------+ +------------+      |
|                                                                    |
|  READS OVER TIME (line chart)                                      |
|  +--------------------------------------------------------------+ |
|  |      /\                                                       | |
|  |     /  \    /\                                                | |
|  |    /    \  /  \                                               | |
|  |   /      \/    \___/\                                         | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  CHAPTER RETENTION (bar chart)                                     |
|  +--------------------------------------------------------------+ |
|  | Ch.1 ████████████████████████████████████████ 100%            | |
|  | Ch.2 █████████████████████████████████████ 92%                | |
|  | Ch.3 ████████████████████████████████ 78%                     | |
|  | Ch.4 ██████████████████████████████ 74%                       | |
|  | Ch.5 █████████████████████████████ 72%                        | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  ENGAGEMENT HEATMAP | TOP REFERRERS | REVENUE                     |
+------------------------------------------------------------------+
```

### UI Elements

- **KPI cards**: Total reads, unique readers, avg reading time, subscriber growth (with week-over-week change)
- **Reads chart**: Line chart with date range selector (7d, 30d, 90d, all time)
- **Chapter retention funnel**: Horizontal bar chart showing percentage of readers who started each chapter
- **Engagement heatmap**: Which paragraphs/sections get the most reactions
- **Referrer table**: Where readers come from (Google, direct, social media, other stories)
- **Revenue section**: Subscription revenue, tips received, payout history (paid plan only)

---

## 11. Settings / Account

**Route:** `/profile/settings`
**Purpose:** Account management, preferences, and subscription billing.

### Layout

```
+------------------------------------------------------------------+
| Settings                                                           |
+------------------------------------------------------------------+
|                                                                    |
| Sidebar:             | Content:                                    |
| [Profile]            | PROFILE SETTINGS                           |
| [Account]            |                                             |
| [Reading Preferences]| Display Name: [____________]                |
| [Writing Preferences]| Username: [____________]                    |
| [Notifications]      | Bio: [________________________]             |
| [Billing]            | Avatar: [Upload] [Remove]                   |
| [Privacy]            |                                             |
| [Connected Accounts] | [Save Changes]                              |
+------------------------------------------------------------------+
```

### Sections

- **Profile**: Display name, username, bio, avatar, social links
- **Account**: Email, password change, delete account
- **Reading Preferences**: Default font size, reading mode (light/dark/sepia), line spacing
- **Writing Preferences**: Default AI model, auto-save interval, word count goal, editor theme
- **Notifications**: Email notifications (new chapter, comment reply, follower), push preferences
- **Billing**: Current plan, upgrade/downgrade, payment method, invoice history
- **Privacy**: Profile visibility, reading activity visibility, data export, account deletion
- **Connected Accounts**: Google, GitHub OAuth connections

---

## 12. Notifications

**Route:** `/notifications`
**Purpose:** Centralized feed of all user notifications.

### Layout

```
+------------------------------------------------------------------+
| Notifications                     [Mark All Read] [Settings]       |
+------------------------------------------------------------------+
|                                                                    |
| TODAY                                                              |
| [*] @maria_writes published Ch. 12 of The Last Dragon    2h ago  |
| [*] @bookworm23 commented on your chapter "The Bridge"   4h ago  |
| [ ] @fantasy_fan started following you                    6h ago  |
|                                                                    |
| YESTERDAY                                                          |
| [ ] Your chapter "Fire and Fury" reached 1,000 reads     1d ago  |
| [ ] @james_r tipped $5.00 on Chapter 8                   1d ago  |
|                                                                    |
| EARLIER                                                            |
| [ ] @maria_writes published Ch. 11 of The Last Dragon    3d ago  |
+------------------------------------------------------------------+
```

### UI Elements

- **Notification list**: Chronological, grouped by day
- **Notification item**: Unread indicator (dot), icon (chapter, comment, follow, milestone, tip), message, timestamp, link
- **Actions**: Mark all read, notification settings link
- **Filters**: All, Unread, Chapters, Comments, Followers, Revenue

### States

- **No notifications**: "You're all caught up! Follow some writers to get updates."
- **Unread count**: Badge on notification bell in navigation (max display: 99+)
- **Real-time**: New notifications appear at top with subtle animation via Supabase Realtime

---

## Navigation Flow

```
Landing Page
├── [Start Writing] -> Sign Up -> Writing Studio
├── [Explore Stories] -> Discovery Feed
├── [Genre] -> Discovery Feed (filtered)
├── [Story Card] -> Reading View
└── [Login] -> Login -> Dashboard

Dashboard (authenticated)
├── My Stories -> Story Manager -> Writing Studio
│                              -> Character Bible
│                              -> World Builder
│                              -> Analytics
├── Discover -> Discovery Feed -> Reading View
├── Profile -> Reader Profile
├── Notifications -> Notifications
└── Settings -> Settings

Reading View
├── [Author name] -> Writer Profile
├── [Previous/Next] -> Reading View (different chapter)
├── [Bookmark] -> (saves to reading list)
├── [Comment] -> Comment thread
├── [Subscribe] -> Stripe checkout
└── [Share] -> Share modal

Writer Profile
├── [Story card] -> Reading View (story landing)
├── [Follow] -> (follows writer)
├── [Subscribe] -> Stripe checkout
└── [Tip] -> Tip modal
```

---

## Responsive Breakpoints

| Breakpoint | Width       | Layout Changes                                    |
| ---------- | ----------- | ------------------------------------------------- |
| Mobile     | < 640px     | Single column, bottom nav, full-width editor      |
| Tablet     | 640-1024px  | Two columns where possible, collapsible sidebars  |
| Desktop    | 1024-1440px | Full three-panel layout for Writing Studio        |
| Wide       | > 1440px    | Max-width container, centered content             |

### Mobile-Specific Adaptations

- **Writing Studio**: Sidebars become slide-out drawers; toolbar becomes floating action button
- **Reading View**: Full-width text; tap left/right edges for prev/next chapter
- **Discovery Feed**: Single-column card stack; pull-to-refresh
- **Navigation**: Bottom tab bar (Home, Discover, Write, Notifications, Profile)

---

## Shared UI Components

| Component             | Used On                                          |
| --------------------- | ------------------------------------------------ |
| Story Card            | Discovery, profiles, reading lists               |
| Chapter List Item     | Story Manager, reading view chapter list          |
| Character Card        | Character Bible, AI panel quick references        |
| Comment Thread        | Reading View, Writing Studio (collaborative)      |
| Reaction Bar          | Reading View (per paragraph)                      |
| AI Suggestion Panel   | Writing Studio                                    |
| User Avatar           | Everywhere                                        |
| Genre Badge           | Story cards, discovery filters                    |
| Progress Bar          | Reading View, reader profile                      |
| Empty State           | All screens (with contextual illustration/CTA)    |
| Loading Skeleton      | All data-fetching screens                         |
| Modal / Dialog        | Confirmations, settings, tip, share               |
| Toast Notification    | Save confirmation, errors, success messages       |
| Tooltip               | Toolbar buttons, stat explanations                |

---

*Screens designed for two distinct experiences: an immersive writing environment for creators and a clean, typography-first reading experience for audiences.*
