# Screens

## Navigation Structure

```
[Tab Bar Navigation]
  |
  +-- Home (Dashboard)
  +-- Scan (Camera)
  +-- Disputes (Center)
  +-- Bank (Monitoring)
  +-- Settings

[Modal Screens]
  +-- Bill Analysis (from Scan)
  +-- AI Phone Call (from Dispute)
  +-- Savings Dashboard (from Home)

[Stack Navigation]
  +-- Onboarding Flow (first launch only)
```

---

## Screen 1: Onboarding Flow

### Screen 1a: Value Proposition Animation

**Layout:**
- Full-screen animated illustration showing bills being scanned and money flowing back to the user
- Large headline text centered: "Americans overpay $3,000+ every year"
- Animated counter showing money being returned: "$127 back... $342 back... $891 back..."
- Subtitle: "Claimback fights every bill so you don't have to"
- Bottom: "Get Started" primary button (Champion Blue #2563EB, full-width, 56px height)
- Page indicators showing 3 onboarding screens (dots)

**Interactions:**
- Swipe left to advance through onboarding screens
- Tap "Get Started" to jump to account creation
- Animation plays automatically on screen load with spring physics
- Skip button (top right, text link, muted gray) to bypass onboarding

### Screen 1b: How It Works

**Layout:**
- Three-step vertical flow with icons and descriptions:
  1. Camera icon + "Scan any bill with your camera" + illustration of phone scanning a bill
  2. Magnifying glass icon + "AI instantly finds overcharges" + illustration of highlighted errors on a bill
  3. Phone icon + "We call and fight for your money back" + illustration of AI agent on phone with savings amount
- Each step connected by a dotted line with animated progression
- Bottom: "Next" button and page indicator dots

**Interactions:**
- Steps animate in sequentially (300ms stagger) as user reaches this screen
- Swipe to advance
- Each step pulses subtly to draw attention

### Screen 1c: Account Creation

**Layout:**
- "Create your free account" headline
- Social login buttons (Apple Sign-In, Google Sign-In) -- full-width, 48px height, with provider logos
- Divider line with "or" text
- Email input field (outlined, 48px height)
- Password input field with show/hide toggle
- "Create Account" primary button
- "Already have an account? Sign in" text link at bottom
- Terms of service and privacy policy links (small text, bottom)

**Interactions:**
- Social login triggers native auth flow (Apple/Google)
- Email validation on blur (format check)
- Password strength indicator (weak/medium/strong with color bar)
- Loading spinner on button during authentication
- Success: transition to Home Dashboard with welcome animation
- Error: inline error message below relevant field (red text, shake animation)

**States:**
- Default: empty form
- Filling: active input with Champion Blue border
- Validating: loading spinner on button
- Error: red border on invalid field, error text below
- Success: checkmark animation, transition to home

---

## Screen 2: Home Dashboard

**Layout (top to bottom):**

**Header Section:**
- "Good morning, [Name]" greeting (left-aligned, 18px, Inter Medium)
- Settings gear icon (top right, 24px, gray)
- Notification bell icon (top right, beside settings, with red badge count)

**Total Savings Card:**
- Full-width card with gradient background (Champion Blue #2563EB to Dark Blue #1D4ED8)
- "Total Saved" label (white, 14px, uppercase tracking)
- Large animated savings number: "$1,247.50" (white, 40px, Plus Jakarta Sans Bold, with money-counting animation on load)
- "Since [join date]" subtitle (white/60% opacity, 12px)
- Subtle confetti particle animation behind the number

**Quick Actions Row:**
- Three circular action buttons in a horizontal row:
  1. Camera icon + "Scan Bill" (Champion Blue background)
  2. Phone icon + "Bank Fees" (Success Green background)
  3. Chart icon + "Savings" (Energy Orange background)
- Each button: 72px diameter with 12px icon and 10px label below

**Active Disputes Section:**
- Section header: "Active Disputes" (left) + "See All" link (right, Champion Blue)
- Horizontal scrollable cards (280px wide, 140px tall):
  - Provider logo/icon (top left)
  - Provider name (bold, 16px)
  - Dispute type ("Medical Overcharge" / "Bank Fee" / "Insurance Denial")
  - Amount in dispute: "$342.00"
  - Status pill: "In Review" (yellow) / "Negotiating" (blue) / "AI Calling" (green pulse) / "Won" (green) / "Lost" (red)
  - Progress bar showing dispute stage (submitted > reviewed > negotiating > resolved)
- Empty state: illustration + "No active disputes. Scan a bill to get started!" + scan button

**Recent Activity Section:**
- Section header: "Recent Activity"
- Vertical list of activity items:
  - Icon (scan/dispute/call/savings) + description + timestamp
  - "Scanned medical bill from St. Mary's Hospital" - 2h ago
  - "AI call completed - $127 saved on overdraft fees" - Yesterday
  - "Dispute letter sent to Blue Cross" - 2 days ago
- Each item tappable to view details

**Interactions:**
- Pull-to-refresh updates savings counter and dispute statuses
- Tap savings card to navigate to Savings Dashboard
- Tap any active dispute card to navigate to dispute detail
- Tap "Scan Bill" quick action to open camera
- Savings counter animates on first load and after new savings events
- Tab bar at bottom: Home (active), Scan, Disputes, Bank, Settings

**States:**
- New user (no data): Welcome message, prominent scan CTA, tutorial tips
- Active user: Full dashboard with savings, disputes, and activity
- Loading: Skeleton placeholders for cards and list items
- Error: "Couldn't load your data. Pull to refresh." with retry

---

## Screen 3: Bill Scanner

**Layout:**
- Full-screen camera view (fills entire screen behind overlays)
- Semi-transparent dark overlay with clear rectangular cutout in center (bill alignment guide)
- Corner markers at the four corners of the cutout (Champion Blue, 3px thick, 24px length)
- Instruction text above cutout: "Align your bill within the frame" (white, 16px, with subtle pulse animation)
- Auto-capture indicator: circular progress ring around camera button that fills as alignment is detected
- Bottom toolbar:
  - Flash toggle (left, lightning bolt icon)
  - Capture button (center, 72px white circle with 64px inner circle)
  - Gallery import button (right, photo icon)
- "Multi-page" toggle switch (bottom left): "Page 1 of 1" with + button to add pages
- Close/back button (top left, X icon, white)
- Bill type selector (top center, pill buttons): "Auto" | "Medical" | "Bank" | "Insurance" | "Other"

**Interactions:**
- Camera viewfinder is live with real-time edge detection
- When bill edges are detected within the alignment guide:
  - Corner markers turn green
  - Auto-capture countdown (1.5 seconds of stable alignment)
  - Haptic feedback (medium impact) on auto-capture
  - Screen flashes white briefly to indicate capture
- Manual capture: tap shutter button at any time
- Flash toggle cycles: Off > On > Auto
- Gallery import opens photo picker
- Multi-page: tap + to scan additional pages (counter updates)
- After capture: transitions to preview screen
- Bill type selector helps optimize Vision API analysis

**Preview Screen (post-capture):**
- Captured bill image displayed full-screen
- Crop/rotate controls at bottom
- "Retake" button (left, outlined)
- "Analyze Bill" button (right, solid Champion Blue)
- Image quality indicator: "Good quality" (green) / "Low quality - retake recommended" (yellow)
- For multi-page: thumbnail strip at bottom showing all captured pages

**States:**
- Camera loading: black screen with "Preparing camera..." text
- Scanning: live viewfinder with alignment guide
- Edge detected: green corner markers, auto-capture countdown
- Captured: preview with crop/rotate/retake/analyze options
- Uploading: progress bar overlay with "Analyzing your bill..." message
- Error (camera permission denied): explanation + "Open Settings" button
- Error (poor lighting): "Move to a brighter area" guidance overlay

---

## Screen 4: Bill Analysis

**Layout (scrollable, top to bottom):**

**Header:**
- Back arrow (top left)
- "Bill Analysis" title (center)
- Share icon (top right)

**Summary Card:**
- Full-width card with white background, subtle shadow
- Provider name and logo: "St. Mary's Hospital" (bold, 20px)
- Bill date: "January 15, 2026"
- Bill type badge: "Medical" (blue pill)
- Total billed: "$4,247.00" (gray, 16px, with strikethrough)
- Fair price: "$2,891.00" (Success Green, 20px, bold)
- **You're overpaying: "$1,356.00"** (Energy Orange, 24px, bold, with exclamation icon)
- Confidence score: "92% confidence" (green badge)

**Overcharges Section:**
- Section header: "Detected Overcharges" + count badge "(4 found)"
- Each overcharge is an expandable card:

  **Overcharge Card (collapsed):**
  - Red circle indicator (left)
  - Description: "Office Visit - Upcoded" (bold, 16px)
  - Billed: "$250.00" (strikethrough) → Fair: "$150.00" (green)
  - Overcharge amount: "$100.00" (red, bold)
  - Expand chevron (right)

  **Overcharge Card (expanded):**
  - All collapsed content +
  - Detailed explanation: "CPT code 99214 (moderate complexity) was billed, but the visit documentation typically supports 99213 (low complexity). The fair price for 99213 in your region is $150."
  - Evidence section with fair pricing source citation
  - "Dispute This" button (Champion Blue, outlined)

**Fair Charges Section:**
- Section header: "Fair Charges" (collapsible, collapsed by default)
- Green circle indicators for each line item
- List of charges confirmed as fair with amounts

**Bill Image Section:**
- Thumbnail of original scanned bill with tap-to-expand
- Annotations overlay showing flagged line items highlighted in red/yellow

**Action Buttons (sticky bottom bar):**
- "Generate Dispute Letter" (primary, Champion Blue, full-width)
- "Start AI Phone Call" (secondary, outlined, full-width, below primary)
- "Save for Later" (text link, below buttons)

**Interactions:**
- Tap any overcharge card to expand/collapse with smooth animation
- Tap bill image thumbnail to open full-screen annotated view with pinch-to-zoom
- "Dispute This" on individual overcharges adds them to dispute selection
- "Generate Dispute Letter" opens letter preview with all selected overcharges
- "Start AI Phone Call" opens AI Phone Call screen with pre-loaded dispute details
- Swipe individual overcharge cards to dismiss (mark as acceptable)
- Pull-to-refresh re-analyzes with latest pricing data

**States:**
- Analyzing: skeleton loading with pulsing animation + "AI is analyzing your bill..." progress indicator
- Results ready: full analysis displayed with animations
- No overcharges found: celebratory animation + "Good news! Your bill looks fair." + tips for future monitoring
- Partial analysis: some items analyzed, others need manual review (yellow indicators)
- Error: "Analysis couldn't be completed. Try scanning again." with retry button

---

## Screen 5: Dispute Center

**Layout (top to bottom):**

**Header:**
- "My Disputes" title (left, 24px, bold)
- Filter icon (right) with active filter badge

**Stats Bar:**
- Horizontal row of stat pills:
  - "Active: 3" (blue background)
  - "Won: 12" (green background)
  - "Pending: 2" (yellow background)
  - "Total Saved: $2,847" (gradient background)

**Filter/Sort Bar:**
- Segmented control: "All" | "Active" | "Won" | "Lost"
- Sort dropdown: "Newest" | "Highest Amount" | "Status"

**Dispute List:**
- Vertical list of dispute cards:

  **Dispute Card:**
  - Provider logo/initial (left, 48px circle)
  - Provider name: "Chase Bank" (bold, 16px)
  - Dispute type: "Overdraft Fee Reversal" (gray, 14px)
  - Amount: "$35.00" (right-aligned, bold)
  - Status indicator:
    - "Letter Sent" -- blue dot + blue text
    - "AI Calling" -- green pulsing dot + green text + phone icon animation
    - "Waiting Response" -- yellow dot + yellow text
    - "Won - $35 Saved" -- green checkmark + green text
    - "Escalated" -- orange dot + orange text
    - "Closed - No Savings" -- gray dot + gray text
  - Date: "Jan 22, 2026" (gray, 12px)
  - Progress bar below card (4 steps: Submitted > Disputed > Negotiating > Resolved)

**Empty State:**
- Illustration of person scanning a bill
- "No disputes yet"
- "Scan a bill to find overcharges and start your first dispute"
- "Scan a Bill" primary button

**Interactions:**
- Tap any dispute card to open dispute detail screen
- Swipe left on card to reveal quick actions: "Call Again" / "Escalate" / "Archive"
- Pull-to-refresh updates all dispute statuses
- Filter segments filter list with cross-fade animation
- Tap "+ New Dispute" FAB (floating action button, bottom right) to open camera scanner
- Long-press a dispute card for context menu (share, archive, escalate)

**Dispute Detail Screen (opened from card tap):**
- Full dispute timeline showing every action taken
- Original bill analysis summary
- Dispute letter (viewable and re-sendable)
- AI phone call transcript(s) with playback
- Outcome details and savings confirmation
- "Escalate" button if dispute is unresolved
- "Close Dispute" option with outcome recording

---

## Screen 6: AI Phone Call

**Layout (full-screen modal):**

**Header:**
- "AI Phone Call" title (center)
- Minimize button (top left, chevron down)
- Status: "Calling Chase Bank..." / "On Hold" / "Speaking with Rep" / "Negotiating"

**Provider Info Card:**
- Provider name and logo: "Chase Bank" (bold, 20px)
- Phone number being called: "(800) 935-9935"
- Dispute summary: "Overdraft fee reversal - $35.00"
- Account reference: "Account ending in 4521"

**Call Status Section:**
- Large status indicator (centered):
  - **Dialing:** Pulsing phone icon with "Connecting..." text
  - **IVR Navigation:** "Navigating menu..." with animated dots + current IVR prompt text
  - **On Hold:** Hold timer (MM:SS, large font, Energy Orange), estimated wait time, hold music wave animation
  - **Speaking:** Green pulsing voice wave animation + "Speaking with representative"
  - **Negotiating:** Blue pulsing animation + "Negotiating your dispute"

**Live Transcript Section:**
- Scrollable text area showing real-time conversation:
  - AI Agent messages (Champion Blue background bubbles, left-aligned)
  - Representative messages (light gray background bubbles, right-aligned)
  - System messages (centered, italic, gray): "[Connected to billing department]" / "[Placed on hold]"
  - Auto-scrolls to latest message
  - Timestamps on each message

**User Control Panel (bottom):**
- Text input field: "Send instruction to AI agent..." (allows user to guide the AI in real-time)
- "End Call" button (red, circular, 64px)
- "Mute AI" toggle (mutes AI agent, puts call on hold from AI side)
- "Take Over" button (transfers call to user's phone if they want to speak directly)

**Interactions:**
- Transcript updates in real-time via Supabase Realtime subscription
- User can type instructions that the AI incorporates into its next response
- "End Call" requires confirmation dialog: "End this call? The dispute will be saved and you can call again later."
- "Take Over" transfers the call to the user's phone number
- Swipe down to minimize to a floating pip (picture-in-picture) showing call status while browsing other screens
- Call completion triggers outcome recording screen

**Outcome Screen (post-call):**
- Large outcome indicator:
  - Success: Green checkmark + confetti animation + "You saved $35.00!"
  - Partial: Yellow indicator + "Partial reduction: $20 of $35 waived"
  - Unsuccessful: Gray indicator + "No reduction this time" + "Escalate" button
- Confirmation number (if provided): "Ref #CHK-2026-0122"
- Call summary: duration, key points, outcome details
- "View Full Transcript" expandable section
- "Share Win" button (generates shareable card with savings amount)
- "Done" button returns to Dispute Center

**States:**
- Pre-call: Confirmation screen with dispute details and "Start Call" button
- Dialing: Pulsing animation, provider info displayed
- IVR navigation: Menu navigation status with current prompt
- On hold: Timer, estimated wait, hold visualization
- Active call: Live transcript with voice wave animation
- Negotiating: Highlighted transcript with negotiation points
- Call complete: Outcome screen with savings or next steps
- Error (call failed): "Call couldn't connect. Try again?" with retry and alternative options
- Minimized (PIP): Floating bubble showing call status with tap-to-expand

---

## Screen 7: Bank Monitoring

**Layout (top to bottom):**

**Header:**
- "Bank Monitoring" title (left, 24px, bold)
- "Add Account" button (right, + icon, Champion Blue)

**Monthly Fee Summary Card:**
- Full-width card with light background
- "Fees This Month" label
- Large amount: "$127.50" (Energy Orange, 28px, bold)
- Comparison: "vs $89.00 last month (+43%)" (red text for increase, green for decrease)
- Mini bar chart showing last 6 months of fees

**Connected Accounts Section:**
- Each connected bank account is a card:

  **Bank Account Card:**
  - Bank logo (left, 40px)
  - Bank name: "Chase Checking" (bold, 16px)
  - Account: "...4521" (gray, 14px)
  - Last synced: "2 min ago" (gray, 12px)
  - Auto-dispute toggle (right, switch component)
  - Monitoring status: "Active" (green dot) / "Paused" (gray dot)

**Detected Fees Section:**
- Section header: "Recent Fees" + count badge
- Each detected fee is a card:

  **Fee Card:**
  - Fee type icon (left): overdraft, maintenance, ATM, etc.
  - Fee description: "Overdraft Fee" (bold, 16px)
  - Amount: "$35.00" (red, bold)
  - Date: "Jan 20, 2026" (gray, 12px)
  - Bank name: "Chase" (gray, 12px)
  - Action buttons (right side):
    - "Dispute" (Champion Blue pill button)
    - "Dismiss" (gray text link)
  - Auto-dispute indicator (if auto-dispute is on): "Auto-disputing..." with spinner
  - Status (if already disputed): "Disputed - Waiting" (yellow) / "Refunded!" (green)

**Insights Section:**
- "Fee Insights" header
- Cards showing patterns:
  - "You've paid $420 in overdraft fees this year. 73% of Chase customers get these waived on request."
  - "Your maintenance fee could be eliminated by maintaining a $1,500 minimum balance."
  - "You're paying $4.50/month in out-of-network ATM fees. Consider switching to an account with ATM reimbursement."

**Interactions:**
- "Add Account" opens Plaid Link modal for new bank connection
- Tap bank account card to see full transaction history with fee highlighting
- Toggle auto-dispute switch to enable/disable automatic fee disputing per account
- "Dispute" button on fee card initiates dispute flow (letter or AI call selection)
- "Dismiss" removes fee from actionable list (with undo snackbar)
- Pull-to-refresh triggers Plaid sync for latest transactions
- Tap insight card to see detailed analysis and recommended actions
- Swipe left on fee card for quick actions: Dispute / Dismiss / Details

**States:**
- No accounts connected: illustration + "Connect your bank to find hidden fees" + "Connect Bank" button
- Syncing: skeleton loading with "Syncing transactions..." text
- Connected, no fees: "No fees detected this month" (green checkmark) + tips
- Connected, fees found: full display with actionable fee cards
- Plaid connection error: "Couldn't connect to [Bank]. Try again?" with retry
- Auto-dispute in progress: spinner and status text on affected fee cards

---

## Screen 8: Savings Dashboard

**Layout (scrollable, top to bottom):**

**Header:**
- "Your Savings" title (center, 24px, bold)
- Close/back button (top left)
- Share button (top right)

**Hero Savings Section:**
- Large circular progress ring (200px diameter)
- Total savings amount in center: "$2,847.50" (40px, bold, Success Green)
- "Lifetime Savings" label below
- Animated money particles floating around the circle on load
- Below circle: "You've saved [X] hours of phone calls" stat

**Savings Graph:**
- Full-width line/bar chart showing monthly savings over time
- X-axis: months, Y-axis: dollar amounts
- Toggle: "Monthly" | "Cumulative" view
- Touch-to-inspect: touching any data point shows tooltip with exact amount and date
- Trend line showing savings growth trajectory
- Color: Champion Blue bars with Success Green trend line

**Category Breakdown:**
- Horizontal bar chart or pie chart showing savings by category:
  - Medical: $1,420 (blue segment)
  - Bank Fees: $687 (green segment)
  - Insurance: $412 (purple segment)
  - Utilities: $228 (orange segment)
  - Telecom: $100 (teal segment)
- Each segment tappable to see category detail

**Success Metrics Row:**
- Three stat cards in a row:
  - "Win Rate: 78%" (with trend arrow up/down)
  - "Disputes: 24" (total number)
  - "Avg Savings: $119" (per successful dispute)

**Achievement Badges Section:**
- "Achievements" header
- Horizontal scrollable badge grid:
  - "First Scan" (camera icon, bronze)
  - "First Save" (dollar icon, bronze)
  - "$100 Club" (stack of bills icon, silver)
  - "$500 Saved" (money bag icon, silver)
  - "$1,000 Saved" (trophy icon, gold)
  - "$2,500 Saved" (crown icon, gold)
  - "Fee Fighter" (boxing glove icon, special -- 10 bank fees reversed)
  - "Medical Maven" (stethoscope icon, special -- 5 medical bills reduced)
  - "Phone Warrior" (phone icon, special -- 5 AI calls completed)
  - "Streak: 3 Months" (fire icon, special -- savings every month for 3 months)
- Earned badges: full color with checkmark
- Locked badges: grayed out with lock icon and requirement text

**Recent Wins Section:**
- "Recent Wins" header
- Vertical list of recent successful disputes:
  - Provider name + category icon
  - "Saved $127.00 on hospital bill" (green text)
  - Date and dispute method (letter/AI call)
  - Shareable: each win has a share icon to generate social card

**Interactions:**
- Animated number counting on first load
- Tap category segments for drill-down into that category's disputes
- Toggle monthly/cumulative graph view with smooth crossfade
- Tap badges to see unlock requirements or celebration for earned badges
- "Share Your Savings" button at bottom generates a branded savings card for social media
- Pull-to-refresh updates with latest savings data

**States:**
- New user (no savings): motivational message + "Your savings journey starts here" + scan CTA
- First savings: celebration animation with confetti + "You just saved your first dollar!"
- Active user: full dashboard with all sections populated
- Loading: skeleton placeholders with shimmer animation

---

## Screen 9: Settings

**Layout (scrollable list):**

**Header:**
- "Settings" title (left, 24px, bold)

**Profile Section:**
- User avatar (64px circle, initials or photo)
- User name (bold, 18px)
- Email address (gray, 14px)
- "Edit Profile" text link (Champion Blue)

**Subscription Section:**
- Current plan card:
  - Plan name: "Pro Plan" (bold)
  - Price: "$14.99/month"
  - "Manage Subscription" button
  - "Upgrade to Concierge" button (if on lower tier, highlighted with Energy Orange border)
- Performance fee info: "25% of savings over $100" with link to fee details

**Notification Preferences:**
- Toggle rows:
  - "Dispute status updates" (default on)
  - "New fees detected" (default on)
  - "AI call completed" (default on)
  - "Weekly savings report" (default on)
  - "Tips & recommendations" (default off)
  - "Marketing & promotions" (default off)

**Bank Accounts:**
- List of connected Plaid accounts with "Manage" links
- "Add Bank Account" button
- Auto-dispute global toggle

**Security:**
- "Biometric Login" toggle (Face ID / Touch ID)
- "Change Password" row
- "Two-Factor Authentication" row with status
- "Data Retention" row -- configure how long bill images are stored

**Privacy:**
- "Data & Privacy" row -- view what data Claimback stores
- "Delete Bill Images" row -- manually clear stored images
- "Export My Data" row -- download all personal data
- "Delete Account" row (red text, requires confirmation)

**Support:**
- "Help Center" row
- "Contact Support" row
- "Report a Bug" row
- "Rate Claimback" row (links to App Store/Play Store)

**Legal:**
- "Terms of Service" row
- "Privacy Policy" row
- "Licenses" row

**App Info:**
- App version number
- "Check for Updates" row

**Footer:**
- "Sign Out" button (red text, centered)

**Interactions:**
- All toggle switches animate and save immediately
- "Manage Subscription" opens RevenueCat paywall or subscription management
- "Delete Account" requires password confirmation + "Are you sure?" dialog with 10-second countdown
- All navigation rows have right chevrons and open respective detail screens
- "Export My Data" triggers data export and sends download link via email

---

## Global UI Patterns

### Tab Bar
- 5 tabs: Home, Scan, Disputes, Bank, Settings
- Active tab: Champion Blue icon + label (bold)
- Inactive tab: gray icon + label
- Scan tab has oversized camera icon (elevated, circular Champion Blue background)
- Badge counts on Disputes tab (active disputes) and Bank tab (new fees detected)

### Loading States
- Skeleton screens with shimmer animation (light gray rectangles pulsing)
- Content loads progressively (header first, then cards, then details)
- Pull-to-refresh on all list screens (Champion Blue spinner)

### Error States
- Inline errors: red text below the relevant component with retry option
- Full-screen errors: illustration + message + "Try Again" button
- Network error: persistent banner at top "No internet connection" (gray background)
- Toast notifications for non-critical errors (bottom of screen, auto-dismiss after 3 seconds)

### Success States
- Haptic feedback (success pattern) on completed actions
- Green checkmark animations for completed items
- Confetti animation for significant savings milestones
- Money-counting animation when savings update

### Transitions
- Screen push transitions: slide in from right (iOS default)
- Modal screens: slide up from bottom
- Tab switches: cross-fade (150ms)
- Card expansion: spring animation (damping: 0.8, stiffness: 100)
- Number animations: money counter rolls up/down to new value

### Accessibility
- All interactive elements have minimum 44x44px touch targets
- VoiceOver/TalkBack labels on all elements
- Dynamic Type support (text scales with system settings)
- Color blind safe: all status indicators use icons in addition to color
- Reduced motion: disable animations when system setting is enabled
- High contrast mode support
