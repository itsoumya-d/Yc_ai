# NeighborDAO -- Screen Designs & Navigation

## Navigation Architecture

### Primary Navigation (Desktop Sidebar / Mobile Bottom Bar)

```
+--------------------------------------------------+
|  DESKTOP SIDEBAR          |  MOBILE BOTTOM BAR   |
|                           |                      |
|  [Logo] NeighborDAO       |  Feed | Map | + |    |
|                           |  Vote | More         |
|  Feed           (Home)    |                      |
|  Purchasing     (Cart)    |  "More" expands to:  |
|  Resources      (Tool)    |  Purchasing           |
|  Map            (Pin)     |  Resources            |
|  Voting         (Ballot)  |  Events               |
|  Events         (Cal)     |  Treasury             |
|  Directory      (People)  |  Directory            |
|  Treasury       (Dollar)  |  Chat                 |
|  Chat           (Bubble)  |  Settings             |
|  ─────────────────        |                      |
|  Notifications  (Bell)    |                      |
|  Settings       (Gear)    |                      |
|                           |                      |
|  [Neighborhood Switcher]  |                      |
+--------------------------------------------------+
```

### Navigation Flow

```
Landing Page
  |-- Sign Up / Log In
  |-- Neighborhood Finder (search by address)
  |     |-- Join existing neighborhood
  |     |-- Create new neighborhood
  |
  +-- Authenticated Shell (sidebar + content area)
        |-- Feed (default home)
        |     |-- Post Detail (thread view)
        |     |-- Create Post (modal)
        |-- Purchasing
        |     |-- Active Orders list
        |     |-- Order Detail (participants, cost split, status)
        |     |-- Create Order (multi-step form)
        |-- Resources
        |     |-- Resource Grid/List
        |     |-- Resource Detail (calendar, booking)
        |     |-- Add Resource (form)
        |-- Map (full-width map view)
        |-- Voting
        |     |-- Active Proposals
        |     |-- Proposal Detail (vote, results, AI summary)
        |     |-- Create Proposal (form)
        |-- Events
        |     |-- Event List (upcoming / past)
        |     |-- Event Detail (RSVP, logistics)
        |     |-- Create Event (form)
        |-- Directory (searchable member grid)
        |     |-- Member Profile
        |-- Treasury
        |     |-- Ledger (income/expenses)
        |     |-- Budget Proposals
        |-- Chat
        |     |-- Conversation List
        |     |-- Chat Thread (DM or group)
        |-- Notifications (list)
        |-- Settings
              |-- Profile
              |-- Notifications
              |-- Privacy
              |-- Neighborhood Admin (admin only)
```

---

## Screen 1: Landing Page / Neighborhood Finder

**URL:** `/`

**Purpose:** Convert visitors to users. Search by address to find or create a neighborhood.

### Layout

```
+------------------------------------------------------------------+
|  [Logo] NeighborDAO              [Log In]  [Get Started]          |
+------------------------------------------------------------------+
|                                                                    |
|              Your neighborhood, organized.                         |
|                                                                    |
|   NeighborDAO replaces chaotic group chats with AI-powered        |
|   neighborhood coordination. Save money, share resources,          |
|   make decisions together.                                         |
|                                                                    |
|   +--------------------------------------------+  [Find My        |
|   | Enter your address...                      |   Neighborhood]  |
|   +--------------------------------------------+                  |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   [Icon: Cart]          [Icon: Tool]        [Icon: Vote]          |
|   Group Purchasing      Resource Sharing    Democratic Voting      |
|   Save 30-40% with      Borrow tools and    Transparent polls     |
|   bulk neighborhood     equipment from       and ranked-choice     |
|   orders                neighbors            voting                |
|                                                                    |
|   [Icon: Brain]         [Icon: Shield]      [Icon: Calendar]      |
|   AI Summaries          Safety Alerts       Event Planning        |
|   Never miss key        Verified reports     Coordinate block      |
|   decisions again       with SMS alerts      parties and more      |
|                                                                    |
+------------------------------------------------------------------+
|   Social proof: "Oak Hills saved $12,400 in group purchasing"     |
|   Testimonial cards from real neighborhoods                        |
+------------------------------------------------------------------+
|   Footer: About | Pricing | Blog | Privacy | Terms               |
+------------------------------------------------------------------+
```

### UI Elements

- **Address Search Input:** Mapbox Geocoding autocomplete. Large input with prominent CTA button.
- **Hero Section:** Animated illustration of a neighborhood with connecting lines between houses.
- **Feature Cards:** 6 cards in a 3x2 grid (2x3 on mobile) with icons, titles, and one-line descriptions.
- **Social Proof Bar:** Rotating statistics from active neighborhoods.
- **CTA Buttons:** Primary "Get Started" (leaf green), secondary "Log In" (outlined).

### States

- **Default:** Search bar empty, feature grid visible.
- **Address entered, neighborhood exists:** "Great news! Oak Hills is already on NeighborDAO. 42 neighbors have joined. [Join Now]"
- **Address entered, no neighborhood:** "Be the first! Create Oak Hills on NeighborDAO. [Create Neighborhood]"
- **Address outside US:** "NeighborDAO is currently available in the United States. [Join Waitlist]"

### Accessibility

- All feature cards are keyboard-navigable.
- Address autocomplete supports screen readers with ARIA live region for suggestions.
- Contrast ratio 7:1 for all text on cream background.
- Skip-to-content link for keyboard users.

---

## Screen 2: Community Feed

**URL:** `/feed`

**Purpose:** Central hub for all neighborhood communication. Posts are categorized, commentable, and AI-summarized.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |                    FEED                                  |
|         | +------------------------------------------------------+ |
|  Feed   | | [Create Post]  What's happening in Oak Hills?       | |
|  Purch  | +------------------------------------------------------+ |
|  Res    |                                                          |
|  Map    | Filter: [All] [Events] [Alerts] [Questions] [Market]    |
|  Vote   |                                                          |
|  Events | +------------------------------------------------------+ |
|  Dir    | | [Avatar] Sarah M. - 2h ago            [Pin] [...]    | |
|  Treas  | | Category: Alert                                      | |
|  Chat   | |                                                      | |
|         | | Water main repair on Elm St tomorrow 8am-2pm.        | |
|  ----   | | Expect low pressure. Contractor: ABC Plumbing.       | |
|  Notif  | |                                                      | |
|  Sett   | | [Photo of notice]                                    | |
|         | |                                                      | |
|         | | 12 comments  |  [React]  [Comment]  [Share]         | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | +------------------------------------------------------+ |
|         | | [Avatar] Mike T. - 5h ago                     [...]  | |
|         | | Category: Question                                   | |
|         | |                                                      | |
|         | | Anyone know a good arborist? The oak tree in my     | |
|         | | front yard has a suspicious crack...                 | |
|         | |                                                      | |
|         | | 23 comments  |  AI Summary Available                 | |
|         | | +--------------------------------------------------+ | |
|         | | | AI Summary: 5 neighbors recommended Johnson     | | |
|         | | | Tree Care. 2 suggested getting multiple quotes.  | | |
|         | | | Consensus: call Johnson first, budget $300-500.  | | |
|         | | +--------------------------------------------------+ | |
|         | | [React]  [Comment]  [Share]                          | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### UI Elements

- **Post Composer:** Expandable input at top. Click to expand into full editor with category selector, media upload, and post button.
- **Category Filter Bar:** Horizontal pill buttons for filtering. "All" selected by default.
- **Post Card:** Avatar, author name, timestamp, category badge, content, optional media, reaction bar, comment count, AI summary toggle.
- **AI Summary Badge:** Green badge "AI Summary" that expands to show the summary inline. Only appears on posts with 10+ comments.
- **Pinned Posts:** Yellow left border and "Pinned" badge. Always appear at top.
- **Infinite Scroll:** Posts load in batches of 20. Loading skeleton appears while fetching.

### States

- **Empty feed:** Illustration with "Your neighborhood is quiet. Be the first to post!" and prominent Create Post button.
- **Loading:** Skeleton cards with pulsing animation.
- **New posts available:** Toast at top: "3 new posts. [Show]" -- clicking scrolls to top and loads new posts.
- **Post deleted:** Fade-out animation, "Post removed" confirmation toast.
- **Offline:** Banner at top: "You're offline. Showing cached content." Feed remains readable from local cache.

### Accessibility

- Posts are in an ARIA landmark `<main>`.
- Category filters are a radio group with keyboard arrow navigation.
- AI summaries are in `<details>` elements expandable via keyboard.
- Images have alt text (user-provided or AI-generated).
- Time stamps use `<time>` element with full datetime.

---

## Screen 3: Group Purchasing

**URL:** `/purchasing`

**Purpose:** Browse active group orders, create new orders, track participation and delivery.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |             GROUP PURCHASING                             |
|         | +------------------------------------------------------+ |
|         | | Active Orders (4)     Past Orders     [+ New Order]  | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | +------------------------------------------------------+ |
|         | | Spring Mulch Bulk Order                               | |
|         | | Organized by: David K.                                | |
|         | | Vendor: Home Depot                                    | |
|         | | Status: [OPEN - 3 days left]                          | |
|         | |                                                       | |
|         | | Progress: ████████░░  8/10 households joined           | |
|         | | Total: $680  |  Per household: ~$85                   | |
|         | | Savings: ~$35/household vs individual                  | |
|         | |                                                       | |
|         | | [Join Order]  [View Details]                          | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | +------------------------------------------------------+ |
|         | | Shared Lawn Care Contract - Season 2025               | |
|         | | Organized by: Lisa R.                                 | |
|         | | Vendor: GreenCut Landscaping                          | |
|         | | Status: [LOCKED - Order placed]                       | |
|         | |                                                       | |
|         | | 14 households  |  $25/mo each (vs $60 individual)    | |
|         | | Next service: March 15                                | |
|         | |                                                       | |
|         | | [View Details]                                        | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Order Detail View (`/purchasing/[orderId]`)

```
+------------------------------------------------------------------+
| [Back] Spring Mulch Bulk Order                         [Edit]     |
+------------------------------------------------------------------+
|                                                                    |
| Organizer: David K.    |  Vendor: Home Depot                      |
| Deadline: March 20     |  Est. Delivery: March 28                 |
| Min Participants: 10   |  Current: 8                              |
|                                                                    |
| STATUS TIMELINE:                                                   |
| [x] Created  [x] Open  [ ] Locked  [ ] Ordered  [ ] Delivered    |
|                                                                    |
+------------------------------------------------------------------+
| ITEMS                         QTY     UNIT PRICE    TOTAL         |
| Premium Brown Mulch (2 cu yd) 12      $7.50/bag     $90.00       |
| Red Mulch (2 cu yd)           6       $8.00/bag     $48.00       |
| Landscape Fabric (50ft roll)  4       $22.00        $88.00       |
| Delivery Fee (split)          1       $89.00        $89.00       |
|                                           TOTAL:    $680.00       |
+------------------------------------------------------------------+
| PARTICIPANTS                  ITEMS           AMOUNT    PAID      |
| You (Sarah M.)               4 brown, 2 red  $62.40    [Pay]    |
| David K. (organizer)         3 brown, 1 fab  $50.20    Paid     |
| Mike T.                      2 brown         $23.90    Paid     |
| ... 5 more participants                                          |
+------------------------------------------------------------------+
| [AI Suggestion: "Adding 2 more bags of brown mulch would hit     |
|  the next price break at Home Depot, saving $1.50/bag for all    |
|  participants. Want me to notify participants?"]                  |
+------------------------------------------------------------------+
```

### States

- **Open:** Green badge, join button enabled, countdown to deadline.
- **Locked:** Yellow badge, no new participants, payment collection phase.
- **Ordered:** Blue badge, delivery tracking information visible.
- **Delivered:** Confirmation phase, participants mark receipt.
- **Completed:** Gray badge, final cost breakdown archived.
- **Cancelled:** Red badge, reason displayed, refund status shown.

---

## Screen 4: Resource Scheduler

**URL:** `/resources`

**Purpose:** Browse shared neighborhood resources, view availability calendars, and make bookings.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |            SHARED RESOURCES                              |
|         | +------------------------------------------------------+ |
|         | | Search resources...    Filter: [All] [Tools]          | |
|         | | [Equipment] [Spaces] [Vehicles]     [+ List Item]    | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | +-------------+ +-------------+ +-------------+          |
|         | | [Photo]     | | [Photo]     | | [Photo]     |          |
|         | | Pressure    | | Extension   | | Parking     |          |
|         | | Washer      | | Ladder 24ft | | Space #4    |          |
|         | | Owner: Mike | | Owner: Tom  | | Community   |          |
|         | |             | |             | |             |          |
|         | | Available   | | Booked      | | Available   |          |
|         | | today       | | until Sat   | | Mon-Fri     |          |
|         | |             | |             | |             |          |
|         | | Deposit: $20| | Deposit: $0 | | Free        |          |
|         | | [Book Now]  | | [Waitlist]  | | [Book Now]  |          |
|         | +-------------+ +-------------+ +-------------+          |
|         |                                                          |
|         | +-------------+ +-------------+ +-------------+          |
|         | | [Photo]     | | [Photo]     | | [Photo]     |          |
|         | | Lawn Mower  | | Truck       | | Projector   |          |
|         | | (riding)    | | (pickup)    | | + Screen    |          |
|         | | Owner: Ann  | | Owner: Jim  | | Community   |          |
|         | | ...         | | ...         | | ...         |          |
|         | +-------------+ +-------------+ +-------------+          |
+------------------------------------------------------------------+
```

### Resource Detail / Booking View (`/resources/[resourceId]`)

```
+------------------------------------------------------------------+
| [Back]  Pressure Washer (3100 PSI)            Owner: Mike T.      |
+------------------------------------------------------------------+
|                                                                    |
| [Photo gallery - 3 photos showing the equipment]                  |
|                                                                    |
| Description: Gas-powered pressure washer with multiple nozzles.   |
| Great for driveways, decks, and siding.                           |
|                                                                    |
| Condition: Good    |  Deposit: $20 (refundable)                   |
| Category: Equipment                                                |
|                                                                    |
| AVAILABILITY CALENDAR:                                             |
| +----------------------------------------------------------+     |
| |  < March 2025 >                                          |     |
| |  Mon   Tue   Wed   Thu   Fri   Sat   Sun                |     |
| |  [3]   [4]   [5]   [6]   [7]   [8]   [9]               |     |
| |  avl   avl   avl   BOOK  avl   BOOK  avl                |     |
| |  [10]  [11]  [12]  [13]  [14]  [15]  [16]              |     |
| |  avl   avl   avl   avl   avl   avl   ---                |     |
| +----------------------------------------------------------+     |
|                                                                    |
| BOOK THIS RESOURCE:                                                |
| Date: [March 12, 2025]                                            |
| Start: [10:00 AM]   End: [4:00 PM]                                |
| Notes: [Cleaning driveway and front walkway]                      |
|                                                                    |
| [Request Booking]                                                  |
|                                                                    |
| RECENT REVIEWS:                                                    |
| "Worked great, Mike had it fully fueled and ready." - Sarah, 4d  |
| "Easy pickup and return process." - Lisa, 2w                      |
+------------------------------------------------------------------+
```

### States

- **Available:** Green indicator, "Book Now" button active.
- **Booked:** Yellow indicator with return date, "Waitlist" button.
- **Unavailable (seasonal):** Gray indicator, "Available starting [date]."
- **Under maintenance:** Orange indicator, "Owner is performing maintenance."

---

## Screen 5: Neighborhood Map

**URL:** `/map`

**Purpose:** Interactive map showing neighborhood boundary, members (opt-in), resources, events, and points of interest.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |                  MAP VIEW                                |
|         | +------------------------------------------------------+ |
|         | |                                                      | |
|         | |  MAPBOX GL JS INTERACTIVE MAP                        | |
|         | |                                                      | |
|         | |      [House pin] [House pin]                         | |
|         | |                    [Tool pin]                         | |
|         | |  [House pin]              [Event pin]                | |
|         | |           [House pin]                                 | |
|         | |                                                      | |
|         | |  ---- Neighborhood Boundary (dashed green line) ---- | |
|         | |                                                      | |
|         | |     [House pin]  [House pin]                         | |
|         | |                                                      | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | LEGEND:  [Green] Members  [Blue] Resources               |
|         |          [Purple] Events  [Red] Alerts                   |
|         |                                                          |
|         | FILTER:  [x] Members  [x] Resources  [x] Events          |
|         |          [ ] Alerts   [ ] Boundaries                     |
+------------------------------------------------------------------+
```

### Map Interactions

- **Click member pin:** Popup with name, avatar, joined date. Link to profile.
- **Click resource pin:** Popup with resource name, photo, availability status. Link to booking.
- **Click event pin:** Popup with event name, date, RSVP count. Link to event detail.
- **Click alert pin:** Popup with alert type, description, time. Link to full report.
- **Hover boundary:** Tooltip with neighborhood name and member count.
- **Zoom controls:** Standard +/- buttons, scroll zoom, pinch zoom on mobile.
- **Search on map:** Search bar overlaying map for finding addresses or resources.

### Accessibility

- Map is supplemented with a list view toggle for screen reader users.
- All map controls have ARIA labels.
- Color-coding is supplemented with distinct pin shapes for color-blind users.
- Keyboard navigation between pins with arrow keys when map is focused.

---

## Screen 6: Voting Center

**URL:** `/voting`

**Purpose:** Browse active proposals, cast votes, and view results. Transparent community decision-making.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |               VOTING CENTER                              |
|         | +------------------------------------------------------+ |
|         | | Active Proposals (3)   Completed    [+ New Proposal] | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | +------------------------------------------------------+ |
|         | | Should we install speed bumps on Oak Lane?            | |
|         | | Proposed by: Community Safety Committee               | |
|         | | Method: Simple Majority  |  Deadline: March 25       | |
|         | |                                                       | |
|         | | Quorum: ██████████░░░░  67% (need 50%)  -- Met!       | |
|         | |                                                       | |
|         | | AI Impact Summary:                                    | |
|         | | "Speed bumps would reduce average speed from 35mph    | |
|         | | to 20mph. Estimated cost: $2,400 for 3 bumps.         | |
|         | | Concerns raised: emergency vehicle access, snow        | |
|         | | plowing difficulty. Alternative: speed radar sign."    | |
|         | |                                                       | |
|         | | [Cast Your Vote]  [View Discussion]                  | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Voting Interface (`/voting/[proposalId]`)

```
+------------------------------------------------------------------+
| [Back] Should we install speed bumps on Oak Lane?                 |
+------------------------------------------------------------------+
|                                                                    |
| Proposed by: Community Safety Committee                            |
| Method: Simple Majority  |  Quorum: 50%  |  Deadline: March 25   |
|                                                                    |
| DESCRIPTION:                                                       |
| Following several incidents of speeding on Oak Lane, the safety   |
| committee proposes installing 3 speed bumps at...                  |
|                                                                    |
| AI IMPACT SUMMARY:                                                 |
| [Expanded analysis with pros, cons, cost, alternatives]           |
|                                                                    |
+------------------------------------------------------------------+
| CAST YOUR VOTE:                                                    |
|                                                                    |
|   ( ) Yes, install speed bumps                                    |
|   ( ) No, do not install speed bumps                              |
|   ( ) Abstain                                                      |
|                                                                    |
|   [Submit Vote]                                                    |
|                                                                    |
| Your vote is anonymous. Results visible after deadline.            |
+------------------------------------------------------------------+
| CURRENT STATUS:                                                    |
| Participation: 67/100 households (67%)                             |
| Quorum: Met (50% required)                                        |
| Time remaining: 4 days, 7 hours                                   |
+------------------------------------------------------------------+
| DISCUSSION (linked thread):                                        |
| 34 comments  |  [View Full Thread]                                |
+------------------------------------------------------------------+
```

### States

- **Active (not voted):** Vote form enabled, submit button visible.
- **Active (voted):** "You voted [selection]. Change vote?" with edit option.
- **Quorum not met:** Warning badge: "Quorum not yet reached. Encourage neighbors to vote."
- **Closed (passed):** Green "Passed" badge with final tallies.
- **Closed (failed):** Red "Did not pass" badge with tallies and minority report.
- **Closed (no quorum):** Gray "Invalid -- quorum not reached" badge.

---

## Screen 7: Member Directory

**URL:** `/directory`

**Purpose:** Searchable directory of neighborhood members with opt-in profiles.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |              NEIGHBORHOOD DIRECTORY                      |
|         | +------------------------------------------------------+ |
|         | | Search by name or skill...            [Filter]       | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | 42 members in Oak Hills                                  |
|         |                                                          |
|         | +--------+ +--------+ +--------+ +--------+             |
|         | |[Avatar]| |[Avatar]| |[Avatar]| |[Avatar]|             |
|         | | Sarah  | | Mike   | | Lisa   | | David  |             |
|         | | M.     | | T.     | | R.     | | K.     |             |
|         | |        | |        | |        | |        |             |
|         | | Skills:| | Skills:| | Skills:| | Skills:|             |
|         | | Garden | | Electr | | Event  | | Carpen |             |
|         | | Cooking| | IT     | | Plann  | | try    |             |
|         | |        | |        | |        | |        |             |
|         | | Joined | | Joined | | Joined | | Joined |             |
|         | | Jan 24 | | Feb 24 | | Mar 24 | | Jan 24 |             |
|         | +--------+ +--------+ +--------+ +--------+             |
+------------------------------------------------------------------+
```

### Member Profile View

```
+------------------------------------------------------------------+
| [Back]                                                             |
|                                                                    |
| [Large Avatar]                                                     |
| Mike Thompson                                                      |
| Member since February 2024                                         |
|                                                                    |
| Bio: Retired electrician, happy to help neighbors with basic       |
| wiring questions. Love grilling and woodworking.                   |
|                                                                    |
| Skills: Electrical, IT Support, Woodworking                        |
|                                                                    |
| Resources Shared: Extension Ladder (24ft), Circular Saw            |
|                                                                    |
| [Send Message]                                                     |
+------------------------------------------------------------------+
```

---

## Screen 8: Events

**URL:** `/events`

**Purpose:** Browse upcoming events, create events, RSVP, and manage logistics.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |                   EVENTS                                 |
|         | +------------------------------------------------------+ |
|         | | Upcoming    Past    My Events    [+ Create Event]     | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | THIS WEEK                                                |
|         | +------------------------------------------------------+ |
|         | | [Purple badge] Block Party Planning Meeting           | |
|         | | Sat, March 15  |  4:00 PM  |  Community Center       | |
|         | | Organizer: Lisa R.  |  12 attending                  | |
|         | |                                                       | |
|         | | [RSVP: Going]  [Maybe]  [Can't make it]              | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | NEXT WEEK                                                |
|         | +------------------------------------------------------+ |
|         | | [Green badge] Community Garden Spring Prep            | |
|         | | Sat, March 22  |  9:00 AM  |  Garden plots (Lot B)   | |
|         | | Organizer: Ann P.  |  8 attending, 5 spots left     | |
|         | |                                                       | |
|         | | Contributions needed:                                 | |
|         | | [ ] Bring compost (2 more needed)                     | |
|         | | [ ] Bring garden tools                                | |
|         | | [x] Bring snacks (covered by Sarah)                   | |
|         | |                                                       | |
|         | | [RSVP: Going]  [Maybe]  [Can't make it]              | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Screen 9: Treasury

**URL:** `/treasury`

**Purpose:** Transparent financial management. View all income and expenses, budgets, and financial proposals.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |              NEIGHBORHOOD TREASURY                       |
|         | +------------------------------------------------------+ |
|         | | Balance: $1,247.50        [+ Add Entry] [Export CSV] | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | SUMMARY (This Month):                                    |
|         | Income: $850.00  |  Expenses: $312.50  |  Net: +$537.50 |
|         |                                                          |
|         | RECENT TRANSACTIONS:                                     |
|         | +------------------------------------------------------+ |
|         | | Mar 10  | + $50.00  | Dues    | Monthly dues - Mike | |
|         | | Mar 9   | - $89.00  | Expense | Mulch delivery fee  | |
|         | | Mar 8   | + $50.00  | Dues    | Monthly dues - Sarah| |
|         | | Mar 7   | + $50.00  | Dues    | Monthly dues - Lisa | |
|         | | Mar 5   | - $223.50 | Expense | Block party supplies| |
|         | |         |           |         | [Receipt attached]  | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | BUDGET PROPOSALS:                                        |
|         | +------------------------------------------------------+ |
|         | | Summer Pool Party Budget - $450                      | |
|         | | Proposed by Lisa R. | Vote: 12 yes, 3 no            | |
|         | | [View Details]                                       | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Screen 10: Chat / Messaging

**URL:** `/chat`

**Purpose:** Direct messages and group conversations within the neighborhood.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR | CONVERSATIONS  |        CHAT THREAD                     |
|         |                |                                         |
|         | [Search...]    | Oak Lane Speed Bump Discussion           |
|         |                | 8 members                                |
|         | GROUP CHATS:   | ----------------------------------------- |
|         | # general      |                                         |
|         | # safety       | [Mike T.] 2:15 PM                       |
|         | # events       | Has anyone contacted the city about      |
|         | # speed-bumps  | the cost estimate? I called last week    |
|         |                | and they said $800 per bump.             |
|         | DIRECT:        |                                         |
|         | Sarah M.    *  | [Sarah M.] 2:22 PM                      |
|         | Mike T.        | That's less than I expected. With 3      |
|         | Lisa R.        | bumps at $2,400 total split across 40    |
|         |                | households, that's only $60 each.        |
|         |                |                                         |
|         |                | [Lisa R.] 2:30 PM                       |
|         |                | I think we should also look at those     |
|         |                | speed radar signs as an alternative.     |
|         |                | Less permanent and cheaper.              |
|         |                |                                         |
|         |                | ----------------------------------------- |
|         |                | [Type a message...]         [Send]      |
+------------------------------------------------------------------+
```

---

## Screen 11: Notifications

**URL:** `/notifications`

**Purpose:** Centralized notification feed for all neighborhood activity relevant to the user.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |              NOTIFICATIONS                               |
|         | +------------------------------------------------------+ |
|         | | [Mark all read]                         [Settings]   | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | TODAY                                                    |
|         | +------------------------------------------------------+ |
|         | | [Blue dot] New vote: "Speed bump installation"       | |
|         | | Cast your vote before March 25.            2h ago    | |
|         | +------------------------------------------------------+ |
|         | | [Blue dot] Group order update: Mulch order            | |
|         | | 2 more households needed to proceed.       4h ago    | |
|         | +------------------------------------------------------+ |
|         | | Sarah M. commented on your post            6h ago    | |
|         | | "Great suggestion! I'll bring the..."                | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | YESTERDAY                                                |
|         | +------------------------------------------------------+ |
|         | | Resource returned: Extension Ladder                   | |
|         | | Tom marked as returned in good condition.  1d ago    | |
|         | +------------------------------------------------------+ |
|         | | New event: Community Garden Spring Prep               | |
|         | | March 22 at 9:00 AM. RSVP now.            1d ago    | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Screen 12: Settings / Profile

**URL:** `/settings`

**Purpose:** Manage personal profile, notification preferences, privacy settings, and neighborhood administration.

### Layout

```
+------------------------------------------------------------------+
| SIDEBAR |                  SETTINGS                                |
|         |                                                          |
|         | TABS: [Profile] [Notifications] [Privacy] [Admin]        |
|         |                                                          |
|         | PROFILE:                                                  |
|         | +------------------------------------------------------+ |
|         | | [Avatar upload]                                      | |
|         | | Full Name: [Sarah Mitchell        ]                 | |
|         | | Display Name: [Sarah M.           ]                 | |
|         | | Bio: [Love gardening and communi..]                 | |
|         | | Skills: [Gardening] [Cooking] [+ Add]               | |
|         | | Phone: [555-0123           ] (visible to neighbors)  | |
|         | | Address: 142 Oak Lane (verified)                      | |
|         | |                                                      | |
|         | | [Save Changes]                                       | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | NOTIFICATION PREFERENCES:                                |
|         | +------------------------------------------------------+ |
|         | | In-App    Email     SMS                               | |
|         | | [x]       [x]      [ ]    New posts                 | |
|         | | [x]       [x]      [x]    Safety alerts             | |
|         | | [x]       [ ]      [ ]    Event invites             | |
|         | | [x]       [x]      [ ]    Group order updates       | |
|         | | [x]       [ ]      [ ]    Voting deadlines          | |
|         | | [x]       [ ]      [ ]    Resource bookings         | |
|         | | [x]       [x]      [ ]    Weekly digest             | |
|         | +------------------------------------------------------+ |
|         |                                                          |
|         | PRIVACY:                                                  |
|         | +------------------------------------------------------+ |
|         | | Profile visibility: (x) Neighbors ( ) Public ( ) Me | |
|         | | Show on map: [x]                                     | |
|         | | Show in directory: [x]                               | |
|         | | Allow direct messages: [x]                           | |
|         | +------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Responsive Design Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|---------------|
| Mobile | 320-639px | Bottom nav, single column, stacked cards, full-width map |
| Tablet | 640-1023px | Collapsible sidebar, 2-column grid, split-view chat |
| Desktop | 1024-1439px | Fixed sidebar, 3-column grid, three-panel chat |
| Wide | 1440px+ | Wide sidebar, 4-column grid, expanded map view |

---

## Accessibility Standards (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|---------------|
| Color Contrast | 7:1 for body text, 4.5:1 for large text |
| Keyboard Navigation | Full tab order, focus indicators, skip links |
| Screen Reader | ARIA landmarks, live regions for real-time updates, alt text |
| Font Sizing | Minimum 16px body, scalable with rem units |
| Touch Targets | Minimum 44x44px for all interactive elements |
| Motion | `prefers-reduced-motion` respected, no auto-play animations |
| Language | `lang` attribute on html, multilingual content detected |
| Focus Management | Focus trapped in modals, returned on close |
| Error Handling | Inline validation, ARIA alerts for errors, clear recovery paths |
| Age-Inclusive | Large text options, high contrast mode, simplified view toggle |
