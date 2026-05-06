# Screens

## Design Philosophy

Every screen in Mortal is designed with emotional awareness. Users are confronting mortality -- the interface must feel like a calm, warm space, never clinical or overwhelming. Generous whitespace, gentle transitions, encouraging progress indicators, and the option to step away at any time.

---

## Screen 1: Welcome & Onboarding

### Purpose
First impression. Establish trust, explain the value, and create an account with biometric security -- all without feeling heavy or morbid.

### UI Elements

**Page 1 -- Warm Welcome:**
- Full-screen sage green gradient background with soft watercolor leaf illustration (top-right, subtle)
- Mortal logo (Source Serif 4, warm gold accent) centered upper-third
- Tagline: "The most important app you'll ever set up." (Source Serif 4, ivory)
- Subtext: "Organize your wishes. Protect your digital legacy. Give your loved ones clarity." (Inter, cream white)
- Primary CTA button: "Get Started" (sage green button, white text, rounded 12px)
- Secondary link: "Already have an account? Sign in" (underlined, ivory)

**Page 2 -- Why This Matters (swipeable carousel):**
- Card 1: Stat -- "67% of Americans have no end-of-life plan" with warm illustration of a family
- Card 2: Stat -- "The average person has 100+ online accounts with no succession plan" with illustration of floating app icons
- Card 3: Value -- "Mortal helps you plan with empathy, not paperwork" with illustration of two people in conversation
- Each card: sage green background, ivory text, soft gold accent on numbers
- Dot pagination indicator at bottom
- "Skip" text link top-right

**Page 3 -- Account Creation:**
- Email field (rounded input, cream background, sage green border on focus)
- Password field with strength indicator (gentle color gradient: red to amber to teal)
- Or: "Continue with Apple" / "Continue with Google" (social auth buttons)
- Terms of service and privacy policy links (text links, not checkbox -- consent implied by continuing)
- "Create Account" button (primary sage green)

**Page 4 -- Biometric Setup:**
- Large, friendly Face ID / fingerprint icon (animated, gentle pulse)
- Heading: "Secure your most important information" (Source Serif 4)
- Body: "Mortal uses Face ID / Touch ID to protect your data. Only you can access your plans." (Inter)
- "Enable Biometric Lock" primary button
- "Set up later" secondary text link (not recommended, gentle nudge)
- If biometric enabled: confirmation animation (checkmark with soft gold glow)

**Page 5 -- Gentle Introduction:**
- Heading: "There's no rush." (Source Serif 4)
- Body: "You can complete your plan at your own pace. Everything you share is encrypted and private. Only the people you choose will ever see it." (Inter)
- Three reassurance badges: lock icon + "Bank-level encryption", shield icon + "Zero-knowledge storage", heart icon + "Designed with empathy"
- "Begin Your Plan" primary button
- Transition: gentle fade-in to home dashboard

### Interactions
- Swipe between onboarding pages with spring animation
- Biometric prompt is native OS dialog (no custom UI)
- Social auth opens native OAuth flow (Safari/Chrome in-app browser)
- All transitions use ease-in-out timing, 300ms duration

### States
- First-time user: full onboarding flow
- Returning user (signed out): skip to sign-in with biometric prompt
- Biometric unavailable (older devices): fallback to PIN setup

### Accessibility
- All text meets WCAG 2.1 AA contrast requirements on colored backgrounds
- Carousel cards announce page number and content to screen readers
- Biometric setup explains alternative security options
- Minimum tap target: 44x44pt on all interactive elements
- Text scalable to 200% without layout breaking

### Emotional Design
- No mention of "death" or "dying" on onboarding screens -- focus on planning, protecting, and giving clarity
- Warm color palette throughout (sage green, ivory, gold)
- Illustrations are abstract and life-affirming (trees, light, leaves)
- Copy uses "you" and "your loved ones" -- personal, not institutional

---

## Screen 2: Home Dashboard

### Purpose
The central hub. Shows planning progress, provides quick access to all sections, and gently encourages continued engagement without pressure.

### UI Elements

**Status Bar Area:**
- Standard system status bar
- Greeting: "Good morning, [First Name]" (Source Serif 4, text primary)
- Notification bell icon (top-right, sage green, badge count in soft gold)

**Completion Progress Wheel:**
- Circular progress indicator (large, centered, 160px diameter)
- Percentage in center (Source Serif 4, bold, text primary)
- Ring color: sage green fill, light sage unfilled
- Below ring: "Your plan is [X]% complete" (Inter, text secondary)
- Encouraging micro-copy that changes with progress level:
  - 0-25%: "Every step matters. You've got this."
  - 26-50%: "You're making real progress."
  - 51-75%: "More than halfway there. Your loved ones will thank you."
  - 76-99%: "Almost there. You're doing something wonderful."
  - 100%: "Your plan is complete. Review anytime."

**Section Cards (2x2 grid, scrollable):**

Each card is a rounded rectangle (16px radius, surface light background, subtle shadow):

1. **My Wishes** -- Heart icon (sage green), completion bar, item count, "Continue your conversation" or "Start here" CTA
2. **Digital Legacy** -- Globe icon (sage green), completion bar, account count, "Add accounts" or "Review" CTA
3. **Documents** -- Shield icon (sage green), completion bar, document count, "Upload documents" or "View vault" CTA
4. **Trusted Contacts** -- Users icon (sage green), completion bar, contact count, "Add contacts" or "Manage" CTA

**Continue Where You Left Off:**
- Horizontal card below the grid (full-width, accent gold left border)
- Shows the last incomplete action: "You were documenting your funeral preferences" or "You started adding your Google account"
- "Continue" button (sage green, small)
- Dismiss X icon (top-right, subtle)

**Bottom Navigation:**
- 4 tabs: Home (house icon), Plan (clipboard icon), Vault (lock icon), Settings (gear icon)
- Active tab: sage green icon + label, inactive: text secondary

### Interactions
- Pull-to-refresh updates completion percentages
- Tap section card navigates to that section's main screen
- Progress wheel animates on first load (count-up from 0 to current percentage, 1.5s)
- Long-press section card shows quick actions menu
- Notification bell navigates to notification center

### States
- New user (0% complete): all section cards show "Start here" CTAs, no "Continue" card
- Partial progress: section cards show individual progress bars, "Continue" card appears
- Fully complete: celebration state with gentle confetti animation (one-time), all cards show "Review" CTAs
- Offline: banner at top "You're offline. Changes will sync when reconnected." (warm amber background)
- Check-in due: subtle banner "Check-in reminder -- Tap to confirm you're okay" (teal background)

### Accessibility
- Screen reader announces greeting, overall progress, and section summaries
- Section cards have descriptive labels: "My Wishes section, 40% complete, 3 of 8 topics documented"
- Progress wheel percentage readable by screen readers
- High contrast mode supported with adjusted card backgrounds
- Dynamic type supported up to XXL

### Emotional Design
- Completion wheel never shows 0% -- even account creation counts as progress (starts at 5%)
- Language is always encouraging, never guilt-inducing
- No red or negative colors for incomplete sections -- just lighter sage shading
- "Continue where you left off" respects time gaps (doesn't say "It's been 3 weeks since...")

---

## Screen 3: AI Conversation Flow

### Purpose
The core experience. Users talk through their wishes with an AI that feels like a thoughtful, patient friend -- not a legal form or a chatbot.

### UI Elements

**Header:**
- Back arrow (top-left)
- Topic title: "Funeral Preferences" / "Organ Donation" / "Care Directives" / etc. (Source Serif 4)
- Progress dots showing current topic in the overall conversation (e.g., dot 2 of 7)
- "Save & Exit" text button (top-right)

**Chat Interface:**
- Full-screen chat bubbles
- AI messages: left-aligned, cream white background, rounded corners (16px top-right, 16px bottom-right, 16px bottom-left, 4px top-left), sage green avatar icon
- User messages: right-aligned, sage green background, white text, rounded corners (16px top-left, 16px bottom-left, 16px bottom-right, 4px top-right)
- Typing indicator: three animated dots in AI message bubble (gentle pulse animation)
- Timestamps between message groups (subtle, text secondary)

**Input Area:**
- Text input field (rounded, cream background, sage green border on focus)
- Send button (sage green circle, white arrow icon)
- Microphone button for voice input (text secondary, left of send)
- Quick response chips above input (common answers for current question): e.g., "Cremation", "Traditional burial", "Green burial", "Not sure yet"

**Topic Navigation:**
- Horizontal scrollable topic chips below header: Funeral, Organ Donation, Care Directives, Personal Messages, Special Requests, Religious/Spiritual, After-Death Admin
- Current topic highlighted (sage green background, white text)
- Completed topics have a subtle checkmark
- Tapping a completed topic shows the summary for review

**Skip & Pause Controls:**
- "Skip this topic" text button (appears contextually when user hesitates)
- "I need a break" button (visible at all times, bottom of chat, text secondary)

### Interactions
- Messages animate in with slide-up and fade (200ms)
- Quick response chips animate out when tapped, user message appears
- Voice input shows waveform animation while recording
- Scrolling up reviews conversation history
- Pull down past the top shows "Earlier in this conversation..."
- Topic chips scroll horizontally with momentum
- "Skip this topic" navigates to next topic with acknowledgment from AI
- "I need a break" triggers AI farewell message, saves progress, returns to dashboard

### States
- New conversation: AI introduces itself and the topic
- Mid-conversation: chat history loaded, scrolled to last position
- Topic complete: AI presents summary card for confirmation, "Looks good" / "I want to change something" buttons
- All topics complete: celebration message, return to dashboard
- Offline: messages queued locally, sent when reconnected, banner notification
- Voice input active: input area expands to show waveform

### Accessibility
- Chat messages announced by screen reader with sender identification
- Quick response chips are keyboard navigable
- Voice input available as primary input method
- High contrast mode adjusts bubble colors
- Messages support dynamic type sizing
- Haptic feedback on message send (subtle)

### Emotional Design
- AI never starts with "Let's talk about your death." It opens with context: "Many people find it helpful to think about what kind of ceremony they'd want -- it takes the pressure off your family."
- AI uses warm, first-person language: "I'd like to ask about..." not "Please provide your..."
- Every response from the AI begins by acknowledging the user's input before moving to the next question
- Progress dots use a growing plant metaphor (seed, sprout, leaf, flower) instead of cold numbered dots
- Quick response chips include "I'm not sure yet" and "I'd rather not answer" -- normalizing uncertainty

---

## Screen 4: Digital Asset Inventory

### Purpose
Create a comprehensive inventory of all digital accounts with credentials and instructions for what to do with each account after death.

### UI Elements

**Header:**
- Back arrow, title "Digital Legacy" (Source Serif 4)
- Search icon (top-right)
- "Add Account" button (sage green, pill-shaped, top-right below search)

**Category Tabs (horizontal scroll):**
- All, Social Media, Financial, Email, Cloud Storage, Subscriptions, Crypto, Gaming, Professional, Other
- Active tab: sage green underline, bold text
- Each tab shows count badge

**Account List:**
- Each account card (full-width, surface light, 16px radius):
  - Platform icon (color, loaded from service) -- left
  - Platform name (Inter, semibold) and username/email (Inter, text secondary) -- center
  - Instruction badge: "Memorialize" (teal), "Delete" (gentle red), "Transfer" (gold), "Download & Delete" (amber), "Custom" (sage green) -- right
  - Chevron right for details
  - Lock icon indicating credentials are stored (or hollow lock if not)
- Empty state: warm illustration of floating app icons, "Your digital life is more valuable than you think. Let's inventory it." CTA: "Add Your First Account"

**Add Account Flow (bottom sheet):**
- Search field: "Search for a service..." with icon results appearing as user types
- Popular services grid: Google, Facebook, Instagram, Twitter/X, TikTok, Apple, Amazon, Netflix, Spotify, Coinbase, PayPal, LinkedIn, GitHub, Dropbox
- Manual entry option: "Add a service not listed"
- Tapping a service opens the detail form

**Account Detail Form:**
- Platform name and icon (large, top)
- Fields: Username/email, Password (masked, encrypted), 2FA backup code (optional, encrypted), Notes (free text, encrypted)
- Instruction picker: "What should happen to this account?" with options: Memorialize (keep as memorial), Delete (permanently remove), Transfer (transfer to a specific person -- contact picker), Download data then delete, Custom instructions (free text)
- "Save" button (primary, sage green)
- "Delete this entry" text button (gentle red, bottom)

### Interactions
- Search filters account list in real-time with debounce
- Category tabs filter with horizontal slide animation
- Add account bottom sheet slides up with spring animation
- Service search shows results as user types with icon thumbnails
- Credential fields have show/hide toggle (eye icon)
- Instruction picker uses radio-style selection with descriptive text for each option
- Swipe left on account card reveals "Edit" and "Delete" actions
- Pull-to-refresh syncs any changes

### States
- Empty: no accounts added, illustration + CTA
- Populated: grouped by category, sorted alphabetically within category
- Search active: filtered results, "No results" state if nothing matches
- Adding account: bottom sheet expanded, keyboard pushed up
- Credential warning: "Credentials haven't been updated in 6+ months" badge on stale accounts
- Offline: can add/edit locally, sync indicator shows pending changes

### Accessibility
- Account cards announce platform name, username, and current instruction
- Credential fields never announced by screen reader for security
- Category tabs announce count: "Social Media, 8 accounts"
- Add account search supports voice input
- Platform icons have text labels for screen readers
- Minimum 44pt tap targets on all interactive elements

### Emotional Design
- Instructions are framed positively: "Memorialize" instead of "Leave active after death"
- The section is called "Digital Legacy" not "Digital Assets" -- legacy feels personal, assets feels cold
- Progress feels encouraging: "You've documented 12 of approximately 30 accounts" with option to mark as complete
- Crypto accounts have a gentle security reminder without being alarming

---

## Screen 5: Document Vault

### Purpose
Secure storage for critical documents. Upload via camera or files, AI categorizes and extracts key information, and share with trusted contacts.

### UI Elements

**Header:**
- Back arrow, title "Document Vault" (Source Serif 4)
- Lock icon with "Encrypted" label (affirming teal, small badge)
- Storage usage bar: "Using 45 MB of 500 MB" (subtle, below title)

**Category Filter (horizontal chips):**
- All Documents, Legal, Insurance, Medical, Financial, Other
- Active chip: sage green fill, white text
- Each chip shows document count

**Document Cards (vertical list):**
- Each card (full-width, surface light, 16px radius, 2px left border color-coded by category):
  - Document type icon (category color) -- left
  - Document name (Inter, semibold), uploaded date (Inter, text secondary), file size -- center
  - AI-extracted key info preview: "Life Insurance - State Farm - Policy #SF-2847 - Exp: 03/2027" (Inter, small, text secondary)
  - Lock icon (encrypted indicator) -- right
  - Shared badge showing which trusted contacts have access (small avatar circles)
  - Chevron right for details

- Category color coding: Legal (sage green left border), Insurance (soft gold), Medical (affirming teal), Financial (warm amber)

**Upload FAB (Floating Action Button):**
- Sage green circle, plus icon, bottom-right
- Tap expands to three options: Camera Scan (camera icon), Photo Library (image icon), Files (document icon)

**Document Detail View (full-screen):**
- Document preview (zoomable, pinch-to-zoom)
- AI Summary card: key extracted information in structured format
- Category tag (editable)
- Custom name field (editable)
- Notes field (free text)
- "Shared with" section showing trusted contacts with access
- "Share with..." button to grant access to additional contacts
- Version history (if multiple uploads of same document type)
- "Download Original" button
- "Delete Document" text button (gentle red)

**Empty State:**
- Warm illustration of a shield protecting documents
- "Your most important documents, protected and organized."
- "Upload Your First Document" CTA button
- Helper text: "Tip: Start with your most critical documents -- insurance policies and medical directives."

### Interactions
- Camera scan: auto-edge detection, perspective correction, contrast enhancement
- Upload progress bar (sage green fill, smooth animation)
- AI categorization happens automatically after upload with a brief processing animation (pulsing document icon)
- Category filter chips slide horizontally with momentum
- Document cards support swipe-left for quick actions (Share, Download, Delete)
- Pinch-to-zoom on document detail preview
- Pull-to-refresh syncs document list

### States
- Empty: illustration + CTA + tips
- Uploading: progress bar with file name, cancel button
- Processing: "AI is reading your document..." with gentle animation
- Populated: categorized document list with AI summaries
- Document shared: shared contacts' avatars appear on card
- Storage near limit: amber warning banner with upgrade CTA
- Offline: documents cached locally, "Syncing..." indicator on pending uploads
- Search results: filtered list with matched terms highlighted

### Accessibility
- Upload options announced clearly: "Scan with camera, Choose from photos, Choose from files"
- Document cards announce: document name, category, date, and shared status
- AI summary announced as "AI-extracted information: [key details]"
- Camera scan provides audio feedback for edge detection ("Document detected, hold steady")
- All category colors paired with icons for color-blind users

### Emotional Design
- Lock icon and "Encrypted" badge provide constant reassurance
- AI summaries use plain language: "This appears to be a life insurance policy from State Farm" not "Document classified as: Insurance/Life"
- Upload experience feels safe -- "Your document is being encrypted before upload"
- No document is ever marked as "missing" or "required" -- the vault is a tool, not a checklist

---

## Screen 6: Trusted Contacts

### Purpose
Designate the people who will handle different aspects of the user's affairs. Assign roles, set permissions, and manage the notification chain.

### UI Elements

**Header:**
- Back arrow, title "Trusted Contacts" (Source Serif 4)
- "Add Contact" button (sage green, pill-shaped, top-right)

**Contact Cards (vertical list):**
- Each card (full-width, surface light, 16px radius):
  - Contact avatar (circle, initials if no photo, sage green background)
  - Name (Inter, semibold) and relationship (Inter, text secondary)
  - Role badges below name: "Executor" (sage green), "Healthcare Proxy" (teal), "Digital Executor" (gold), "Emergency Contact" (amber)
  - Status indicator: "Confirmed" (teal dot), "Pending" (amber dot), "Declined" (gentle red dot)
  - Access summary: "Can access: Legal docs, Wishes, 5 digital accounts" (Inter, small, text secondary)
  - Chevron right for details

**Add/Edit Contact (full-screen form):**
- Contact info section: Full name, Relationship (dropdown: Spouse, Partner, Child, Parent, Sibling, Friend, Attorney, Financial Advisor, Other), Phone number, Email address
- Role assignment section: multi-select checkboxes with descriptions:
  - Primary Executor: "Manages your overall estate plan"
  - Healthcare Proxy: "Makes medical decisions on your behalf"
  - Digital Executor: "Handles your online accounts and digital assets"
  - Financial Executor: "Manages financial accounts and assets"
  - Emergency Contact: "First person notified in an emergency"
  - Witness: "Can witness document signing"
  - Custom role: free text field
- Access permissions section: toggle switches per category:
  - Wishes (all topics / specific topics picker)
  - Documents (all categories / specific categories picker)
  - Digital Accounts (all accounts / specific accounts picker)
- Notification preferences: "Notify this person by" -- SMS, Email, Both
- Notification order: "Position in notification chain" -- number picker (1st, 2nd, 3rd...)
- "Save Contact" button (primary, sage green)
- "Remove Contact" text button (gentle red, bottom, only on edit)

**Empty State:**
- Warm illustration of connected people
- "The people you trust most, ready when it matters."
- "Add Your First Contact" CTA button
- Helper text: "Start with the person you'd want to handle things if something happened tomorrow."

### Interactions
- Add contact form validates phone and email in real-time
- Role selection shows description tooltip on first selection
- Permission toggles animate smoothly (sage green when on)
- Contact receives notification when designated (SMS and/or email with opt-in link)
- Contact status updates in real-time when they confirm/decline
- Swipe left on contact card for quick Edit/Remove actions
- Reorder notification chain by drag-and-drop (hold and drag contact cards)

### States
- Empty: illustration + CTA
- Contacts added but unconfirmed: amber "Pending" status, "Resend invitation" option
- Contacts confirmed: teal "Confirmed" status with checkmark
- Contact declined: gentle red status with option to remove or contact them directly
- Maximum contacts reached (10): add button disabled with explanation
- Offline: can add/edit locally, invitations sent when reconnected

### Accessibility
- Contact cards announce: name, relationship, roles, and status
- Role descriptions expand to full text for screen readers
- Permission toggles announce: "Documents access: on" / "Documents access: off"
- Drag-and-drop for notification chain has keyboard alternative (up/down buttons)
- Status colors paired with text labels for color-blind users

### Emotional Design
- Contacts are called "Trusted Contacts" not "Beneficiaries" or "Designees" -- trust is personal
- Invitation message is warm: "[Name] has named you as a trusted person in their end-of-life plan. This means they trust you to help when the time comes."
- Declining is normalized: "If [Contact Name] declined, it's okay. You can have a conversation about it or choose someone else."
- Status labels are gentle: "Waiting to hear back" instead of "Not responded"

---

## Screen 7: Dead Man's Switch Settings

### Purpose
Configure the periodic check-in system that ensures the plan is activated when needed. Balance reliability with minimal intrusiveness.

### UI Elements

**Header:**
- Back arrow, title "Check-In Settings" (Source Serif 4)
- Status badge: "Active" (teal) or "Paused" (amber) or "Not Set Up" (text secondary)

**Main Toggle:**
- Large toggle switch: "Enable periodic check-ins" (sage green when active)
- Description below: "We'll send you a simple 'Are you okay?' message at your chosen frequency. If you don't respond after several attempts, your trusted contacts will be notified."

**Check-In Frequency Section:**
- Heading: "How often should we check in?" (Inter, semibold)
- Segmented control: Weekly | Bi-weekly | Monthly | Quarterly
- Helper text with recommendation: "Most users choose monthly. More frequent check-ins reduce the delay between an event and notification."

**Preferred Check-In Time:**
- Time picker: "Send check-ins around..." (defaults to 10:00 AM)
- Day of week picker (for weekly) or day of month picker (for monthly)

**Notification Methods Section:**
- Heading: "How should we reach you?" (Inter, semibold)
- Priority-ordered list with drag handles:
  1. Push Notification (toggle, default on)
  2. SMS to [phone number] (toggle, default on)
  3. Email to [email] (toggle, default off)
- "Each method is tried in order before escalating. More methods = fewer false alarms."

**Escalation Timeline Section:**
- Heading: "What happens if you don't respond?" (Inter, semibold)
- Visual timeline (vertical, sage green line with dots):
  - Day 0: "Check-in sent" (sage green dot)
  - Day 1: "Reminder sent via next method" (amber dot)
  - Day 3: "Final attempt via all methods" (amber dot)
  - Day 5: "Trusted contacts notified in order" (gentle red dot)
- Each step shows the actual date based on current settings
- "Customize timing" expander for advanced users

**Notification Chain Preview:**
- Heading: "Who gets notified and when?" (Inter, semibold)
- Ordered list of trusted contacts with notification timing:
  - 1. [Name] -- immediately (SMS + Email)
  - 2. [Name] -- after 2 hours (SMS + Email)
  - 3. [Name] -- after 6 hours (SMS + Email)
- "Edit order" links to Trusted Contacts screen

**Test & Override Section:**
- "Test Check-In" button (outlined sage green): sends a test check-in to yourself
- "Test Notification Chain" button (outlined amber): sends clearly-labeled test notifications to contacts
- "Emergency: Trigger Now" button (outlined gentle red): manually triggers the notification chain immediately
- "Snooze Check-Ins" button (text link): pause for 1 week, 2 weeks, 1 month, or custom date

**Check-In History:**
- Collapsible section showing recent check-in activity
- Each entry: date, method, response status (Responded, Missed, Snoozed)
- Visual calendar heatmap of check-in responses (green = responded, amber = snoozed, empty = scheduled)

### Interactions
- Main toggle animates with spring physics
- Frequency selector updates the escalation timeline preview in real-time
- Drag-and-drop reordering of notification methods
- Test buttons show confirmation dialog before sending
- Emergency trigger requires biometric confirmation + typed confirmation phrase: "I understand this will notify my contacts"
- Snooze shows date picker with auto-resume date
- Escalation timeline animates when settings change

### States
- Not set up: main toggle off, all sections collapsed with preview
- Active: main toggle on (teal), all sections expanded
- Paused/Snoozed: amber status badge, resume date displayed, "Resume now" option
- Check-in overdue: banner at top "You have an unanswered check-in" with "I'm okay" button
- No trusted contacts: notification chain section shows "Add trusted contacts first" with link
- Test mode active: "Test in progress..." indicator with ETA

### Accessibility
- All timeline steps announced with dates and actions to screen readers
- Frequency selector announced: "Check-in frequency: Monthly, selected"
- Test buttons have clear confirmation dialogs readable by screen readers
- Emergency trigger confirmation is both visual and haptic
- Color-blind safe: all status colors paired with text labels and icons

### Emotional Design
- Called "Check-In" not "Dead Man's Switch" in the UI -- the feature name is technical, the user-facing language is warm
- Framing is protective: "Making sure your plan works when it's needed" not "Detecting if you're dead"
- Test mode is encouraged: "It's a good idea to test this once so everyone knows what to expect"
- Emergency trigger is serious but not scary: clear explanation of exactly what will happen, step by step

---

## Screen 8: Legal Documents

### Purpose
Create legally-compliant documents with AI guidance. State-specific templates filled through a conversational process, with electronic signing.

### UI Elements

**Header:**
- Back arrow, title "Legal Documents" (Source Serif 4)
- State badge: "California" (or user's selected state, sage green pill)

**State Selector (if not yet selected):**
- Dropdown/modal with state list
- 10 available states highlighted (California, Texas, Florida, New York, Pennsylvania, Illinois, Ohio, Georgia, North Carolina, Michigan)
- Unavailable states shown grayed with "Coming soon -- notify me" option
- "Why does my state matter?" expandable info text

**Document Type Cards (vertical list):**
- Each card (full-width, surface light, 16px radius):
  - Document icon (sage green) -- left
  - Document name (Inter, semibold): Advance Directive, Healthcare Proxy, Living Will, Durable Power of Attorney for Healthcare, HIPAA Authorization
  - Brief description (Inter, text secondary): "Specifies your preferences for medical treatment if you can't communicate"
  - Status badge: "Not started" (text secondary), "In progress" (amber), "Completed" (teal), "Signed" (sage green with checkmark)
  - State-specific note: "California requires 2 witnesses" or "New York requires notarization"
  - Chevron right

**Document Creation Flow (full-screen, multi-step):**
- Step indicator at top (progress bar, sage green fill)
- AI-guided question-and-answer format (similar to conversation flow but more structured)
- Each step covers one section of the document with plain-language explanations
- AI explains legal concepts: "This section asks about CPR. Here's what that means in practice..."
- Quick-select options for common choices + free-text for custom instructions
- "Why does this matter?" expandable context for each question
- Preview pane showing how answers map to the legal document (collapsible)

**Document Preview (full-screen):**
- Rendered document with user's responses filled in
- Highlighted sections showing user's choices (sage green highlight)
- Editable sections -- tap to modify
- "This looks correct" confirmation button
- "I want to change something" button that jumps to relevant section

**Signing Flow:**
- Requirements checklist: "Before signing, you need:" -- witnesses (with invite option), notarization (with guidance on finding a notary), review confirmation
- "Sign with DocuSign" button (opens embedded DocuSign flow)
- Witness invitation -- send signing request to witnesses via SMS/email
- Post-signing: signed document automatically saved to Document Vault

**Completed Document Card:**
- "Signed on [date]" with green checkmark
- "Download PDF" button
- "Share with trusted contacts" button
- "State requirements met" confirmation
- "Review & Update" option

### Interactions
- State selector filters available documents dynamically
- AI-guided flow supports back navigation to previous questions
- Preview updates in real-time as user answers questions
- DocuSign opens as embedded webview (no app switch required)
- Witness invitation sends SMS/email from within the flow
- Completed documents auto-save to vault with category tagging
- "Notify me" for unavailable states stores user preference

### States
- No state selected: state selector prominent, document list hidden
- State selected, no documents started: full document list with "Start" CTAs
- Document in progress: amber badge, "Continue" CTA, progress indicator
- Document completed (unsigned): teal badge, "Sign" CTA
- Document signed: sage green badge with checkmark, stored in vault
- State unavailable: grayed cards with "Coming soon" label
- Offline: can fill in documents, signing requires connectivity

### Accessibility
- State selector announces available vs. coming-soon states
- Document cards announce: type, status, and state requirements
- AI explanations are full sentences readable by screen readers
- Preview highlights are announced: "Your choice: No CPR if terminal condition diagnosed"
- Signing flow provides step-by-step audio guidance
- All legal terms have accessible explanations (not just visual tooltips)

### Emotional Design
- AI explains legal concepts in everyday language before asking for decisions
- No pressure to sign immediately -- "Save and come back when you're ready with your witnesses"
- State requirements presented helpfully: "California makes this easy -- you just need two witnesses who aren't your healthcare agent"
- Completion celebrates: "You've just taken one of the most caring steps you can take for your family"

---

## Screen 9: Settings

### Purpose
Account management, security settings, subscription management, and data control. The place where users manage their relationship with Mortal.

### UI Elements

**Header:**
- Title: "Settings" (Source Serif 4)
- No back arrow (top-level navigation tab)

**Profile Section:**
- User avatar (circle, large, with edit overlay icon)
- Full name (editable)
- Email address (editable, requires reverification)
- Phone number (editable, requires reverification)
- State of residence (dropdown, affects legal templates)
- Date of birth (optional, used for age-appropriate recommendations)

**Subscription Section:**
- Current plan badge: "Free", "Premium", or "Family"
- Plan details: features included, usage stats (documents stored, contacts, digital accounts)
- "Upgrade to Premium" or "Manage Subscription" CTA
- Billing history link
- If Family plan: member list with add/remove controls

**Security Section:**
- Biometric Lock toggle (sage green when active, recommendation to keep on)
- Change Password (navigates to password change flow)
- Encryption Key Backup: "Your encryption key is backed up to [iCloud Keychain / Google Backup]" with options to change backup method
- Active Sessions: list of devices with the app installed and logged in, with "Sign out" per device
- Two-Factor Authentication: enable/manage 2FA for account login

**Privacy & Data Section:**
- Export All Data: "Download a complete encrypted backup of all your data" with format options (encrypted archive, readable PDF)
- Data Retention: "Your data is stored as long as your account is active. Deleted data is purged within 30 days."
- Analytics toggle: "Help improve Mortal with anonymous usage data" (opt-in, default off)

**Notifications Section:**
- Check-in notifications toggle
- Document expiration reminders toggle
- Product updates toggle
- Quiet hours: time range when no notifications are sent (except emergency)

**Appearance Section:**
- Theme: Light / Dark / System (segmented control)
- Text Size: slider with preview (Small, Default, Large, Extra Large)
- Reduce Motion: toggle for users who prefer minimal animations

**Help & Support:**
- FAQ / Help Center link
- Contact Support (opens email or in-app chat)
- Report a Bug
- Legal: Privacy Policy, Terms of Service, Licenses

**Danger Zone (bottom, clearly separated):**
- "Delete Account" (gentle red text button)
- Confirmation flow: explains what will be deleted, requires password + typed confirmation "DELETE MY ACCOUNT"
- 30-day grace period before permanent deletion
- Option to export all data before deletion

### Interactions
- Profile fields are inline-editable with save/cancel on each field
- Subscription upgrade opens in-app purchase flow (RevenueCat)
- Biometric toggle prompts biometric verification before disabling
- Export data shows progress bar and sends download link via email
- Delete account is a multi-step confirmation with cooling-off period information
- Theme change applies immediately with smooth transition
- Text size change shows live preview of all text elements

### States
- Free user: upgrade CTA prominently placed in subscription section
- Premium user: usage stats and billing info visible
- Family plan admin: member management controls visible
- Biometric unavailable: toggle replaced with PIN setup option
- Export in progress: progress indicator with estimated time
- Account deletion pending: countdown to permanent deletion, "Cancel Deletion" button

### Accessibility
- All settings sections are navigable by section headers
- Toggle states announced: "Biometric Lock: enabled" / "Biometric Lock: disabled"
- Text size preview is real-time and immediately perceptible
- Delete account flow is fully keyboard navigable
- Export data provides screen reader-friendly progress updates
- Theme options preview described for screen readers

### Emotional Design
- Delete account is treated with respect: "We understand. Your data is yours."
- No dark patterns to prevent unsubscription or deletion
- Export data is encouraged before deletion: "Take your data with you. It belongs to you."
- Security section feels protective, not paranoid: "Your data is protected by the same encryption used by banks and governments"
- Subscription upgrade is informative, not pushy: clear comparison of what free vs. premium includes
