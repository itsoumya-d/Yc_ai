# StockPulse — Screens

> Every screen, navigation flow, UI elements, states, and accessibility considerations.

---

## Navigation Architecture

```
App Root
├── Auth Stack (unauthenticated)
│   ├── Welcome Screen
│   ├── Sign Up
│   ├── Sign In
│   └── Forgot Password
│
├── Onboarding Stack (first-time user)
│   ├── Business Type Selection
│   ├── First Location Setup
│   ├── Add First Products
│   ├── First Scan Tutorial
│   └── Invite Team (optional)
│
└── Main Tab Navigator (authenticated)
    ├── Tab 1: Dashboard
    ├── Tab 2: Inventory List
    ├── Tab 3: Scan (center, prominent)
    ├── Tab 4: Orders
    └── Tab 5: More
        ├── Reports & Analytics
        ├── Expiration Tracker
        ├── Supplier Directory
        ├── Team/Staff Access
        ├── Multi-Location Switcher
        └── Settings
```

### Bottom Tab Bar

```
+----------------------------------------------------------+
|                                                          |
|  [Dashboard]  [Inventory]  [ SCAN ]  [Orders]  [More]   |
|     home        list       camera      cart      menu    |
|                           (large,                        |
|                          elevated)                       |
+----------------------------------------------------------+
```

- **Scan button** is center-positioned, 64px diameter, elevated above tab bar, electric blue background with white camera icon
- All other tabs use Phosphor Icons, 24px, with text labels
- Active tab: Electric blue (#2563EB), inactive: slate gray (#94A3B8)
- Tab bar height: 80px (includes safe area on iPhone)

---

## Screen 1: Welcome / Splash

**Purpose:** First impression, brand introduction, CTA to sign up or sign in.

**UI Elements:**
- StockPulse logo (animated pulse effect on load)
- Tagline: "AI inventory that counts itself"
- Three value prop cards (horizontal scroll):
  - "Scan shelves in seconds" with camera icon
  - "Never run out of stock" with alert icon
  - "Auto-generate purchase orders" with cart icon
- Primary CTA: "Get Started Free" (full-width button, electric blue)
- Secondary: "Already have an account? Sign In" (text link)
- Bottom: "No credit card required" in small text

**States:**
- Default: As described above
- Loading: Logo pulsing animation while checking auth state
- Returning user: Skip to Sign In or auto-navigate to Dashboard if token valid

---

## Screen 2: Sign Up

**Purpose:** Account creation with minimal friction.

**UI Elements:**
- Back arrow (top-left)
- "Create your account" heading
- Email input field (keyboard type: email)
- Password input field (with show/hide toggle)
- "Create Account" button (full-width, electric blue)
- Divider: "or"
- "Continue with Google" button (outlined)
- "Continue with Apple" button (outlined, iOS only)
- Footer: "Already have an account? Sign In"
- Terms of Service and Privacy Policy links

**Validation:**
- Email: Real-time format validation
- Password: 8+ characters, show strength indicator
- Button disabled until both fields valid
- Error states: red border, error message below field

---

## Screen 3: Sign In

**Purpose:** Returning user authentication.

**UI Elements:**
- Back arrow (top-left)
- "Welcome back" heading
- Email input field
- Password input field (with show/hide toggle)
- "Sign In" button (full-width, electric blue)
- "Forgot password?" text link (right-aligned below password field)
- Divider: "or"
- "Continue with Google" button
- "Continue with Apple" button (iOS only)
- Footer: "New to StockPulse? Create Account"
- "Sign in with Magic Link" option (sends email link)

**States:**
- Default, Loading (spinner on button), Error (shake animation + error message), Success (navigate to Dashboard)

---

## Screen 4: Onboarding — Business Type

**Purpose:** Customize the experience based on business type.

**UI Elements:**
- Progress indicator (step 1 of 4)
- "What type of business do you run?" heading
- Selection cards (vertical list, single-select):
  - Restaurant / Cafe (fork-and-knife icon)
  - Convenience Store / Bodega (store icon)
  - Specialty Retail (shopping-bag icon)
  - Food Truck / Pop-up (truck icon)
  - Grocery / Market (cart icon)
  - Bar / Brewery (beer icon)
  - Other (dots icon)
- "Continue" button (full-width, bottom-fixed)
- "Skip for now" text link

**Behavior:** Selection pre-loads default categories, units, and dashboard layout.

---

## Screen 5: Onboarding — First Location

**UI Elements:**
- Progress indicator (step 2 of 4)
- "Add your first location" heading
- Location name input (e.g., "Main Kitchen", "Downtown Store")
- Address input (with Google Places autocomplete, optional)
- Location type dropdown (Restaurant, Retail, Warehouse, Food Truck)
- "Continue" button
- "Skip — I'll add this later" text link

---

## Screen 6: Onboarding — Add Products

**UI Elements:**
- Progress indicator (step 3 of 4)
- "Add some products to get started" heading
- Three options (card buttons):
  - "Scan barcodes" — opens camera for barcode scanning
  - "Import from spreadsheet" — file picker for CSV
  - "Add manually" — opens product creation form
- Quick-add suggestion chips based on business type (e.g., for restaurants: "Chicken Breast", "Lettuce", "Tomatoes", "Olive Oil")
- Product count indicator: "12 products added"
- "Continue" button
- "Skip — I'll add products later" text link

---

## Screen 7: Onboarding — First Scan Tutorial

**UI Elements:**
- Progress indicator (step 4 of 4)
- "Let's do your first scan" heading
- Animated tutorial showing:
  1. Hold phone up to shelf
  2. Slowly pan across products
  3. Products get detected (bounding boxes appear)
  4. Tap to confirm counts
- "Start Scanning" button (opens Scan Mode)
- "I'll try later" text link
- Tooltip overlays on first scan explaining each UI element

---

## Screen 8: Dashboard

**Purpose:** At-a-glance stock health overview. The home screen users see every day.

**UI Elements:**

**Header:**
- Current location name with dropdown switcher (left)
- Notification bell with badge count (right)
- "Good morning, [Name]" greeting

**Stock Health Summary (top cards, horizontal scroll):**
- **Total Products:** count with trend arrow
- **In Stock:** count (green)
- **Low Stock:** count (amber)
- **Out of Stock:** count (red)
- **Expiring Soon:** count (orange) [Post-MVP]

**Quick Actions (row of 4 icon buttons):**
- Scan Now (camera icon)
- Quick Count (number-pad icon)
- New Order (plus-cart icon)
- View Alerts (bell icon)

**Recent Activity Feed:**
- Timeline of recent scans, stock changes, and alerts
- Each item shows: action type icon, description, timestamp, user avatar
- Examples: "Kitchen scanned — 45 products counted" "Chicken Breast dropped to Low Stock" "PO #127 sent to Sysco"

**Charts Section:**
- Stock level trend (line chart, last 7 days)
- Top 5 low-stock items (horizontal bar chart)
- Scan frequency (bar chart, scans per day this week)

**Bottom:**
- "Last full count: 2 days ago" with progress bar toward next recommended count

**States:**
- Empty state (new user): Illustration + "Start by adding products and doing your first scan"
- Normal state: As described above
- Alert state: Red banner at top if any item is out of stock
- Loading: Skeleton screens for each card and chart

**Accessibility:**
- All charts have alt text descriptions
- Stock status colors paired with icons (not color-only)
- Minimum 4.5:1 contrast ratio on all text
- Screen reader announces stock health summary on load

---

## Screen 9: Scan Mode

**Purpose:** The core feature. Full-screen camera with AI-powered inventory scanning.

**UI Elements:**

**Camera View (full screen):**
- Live camera feed as background
- Semi-transparent top bar: Back arrow, flash toggle, scan mode toggle (AI/Barcode)
- AI overlay: bounding boxes around detected products with labels
- Product label format: "[Product Name] x[Count]" in floating pill badges
- Confidence indicator: green checkmark (>90%), amber question mark (70-90%)
- Bottom action bar (semi-transparent):
  - Scan counter: "12 products scanned"
  - Pause/Resume button
  - "Done" button to end scan session

**Detection Overlay:**
```
+----------------------------------------------------------+
|  [< Back]                        [Flash] [AI | Barcode]  |
|                                                          |
|   +------------------+                                   |
|   | Olive Oil    x3  |  <-- bounding box + label         |
|   +------------------+                                   |
|                                                          |
|          +--------------------+                          |
|          | Chicken Breast x5  |                          |
|          +--------------------+                          |
|                                                          |
|                  +------------------+                    |
|                  | Tomatoes    x8   |                    |
|                  +------------------+                    |
|                                                          |
|  +----------------------------------------------------+ |
|  |  12 products scanned  |  [Pause]  |  [Done >>>]    | |
|  +----------------------------------------------------+ |
+----------------------------------------------------------+
```

**Barcode Mode:**
- Crosshair reticle in center of screen
- "Point at barcode" instruction text
- On successful scan: product info card slides up from bottom
- Quick quantity input (stepper: -/+) on the info card
- "Add to count" button

**Scan Summary (shown after tapping "Done"):**
- List of all products detected in this session
- Each row: product name, scanned quantity, previous quantity, delta
- Editable quantity field per product (tap to adjust)
- "Confirm All" button to save scan results
- "Discard" option to cancel entire scan

**States:**
- Initializing: "Starting camera..." with spinner
- Scanning: Active camera with overlay
- Processing: "Analyzing..." shimmer on bounding boxes
- Paused: Camera frozen, "Tap Resume to continue"
- No products detected: "No products found. Try adjusting angle or distance."
- Offline mode: "Scanning offline — results will sync when connected" banner
- Permission denied: Full-screen prompt to enable camera permission

**Accessibility:**
- Haptic feedback on each product detection
- Audio option: speak product names as detected
- High-contrast bounding boxes (white outline + colored fill)
- Large touch targets for all buttons (48px minimum)

---

## Screen 10: Product Detail

**Purpose:** View and edit all information about a single product.

**UI Elements:**
- Product image (large, tappable to change)
- Product name (editable)
- Barcode (with scan-to-update option)
- SKU field
- Category (dropdown)
- Unit type (dropdown: each, case, lb, kg, etc.)
- Cost per unit (currency input)
- Minimum stock level (number input)
- Current stock level (per location, read-only)
- Expiration tracking toggle
- Supplier (linked supplier name, tappable)
- Stock history chart (last 30 days)
- Recent scans involving this product
- "Delete Product" (destructive action, with confirmation)

**States:**
- View mode (default)
- Edit mode (tap pencil icon to edit fields)
- Saving (loading indicator)
- Deleted (navigate back with toast confirmation)

---

## Screen 11: Inventory List

**Purpose:** Filterable, sortable list of all products with current stock levels.

**UI Elements:**
- Search bar (top, with barcode scan button inline)
- Filter chips (horizontal scroll): All, Low Stock, Out of Stock, Expiring Soon, By Category
- Sort options (accessible via sort icon): Name A-Z, Stock Level (Low-High), Last Scanned, Category
- Product list (FlashList for performance):
  - Each row: product image thumbnail, name, category tag, current quantity, stock status indicator (green/amber/red dot), last scanned time
  - Swipe left: Quick actions (Edit, Adjust Count)
  - Swipe right: Add to Purchase Order
- Floating Action Button: "+" to add new product
- Empty state: "No products yet. Add your first product to get started."

**Filter states:**
- "Low Stock" filter: Shows only products below minimum level
- "Out of Stock" filter: Shows only products with quantity 0
- "Expiring Soon" filter: Shows products expiring within 7 days
- Category filter: Expandable category list

**Accessibility:**
- Stock status communicated via icon + text, not color alone
- Row elements are individually focusable for screen readers
- Search supports voice input

---

## Screen 12: Low Stock Alerts

**Purpose:** Actionable alert center showing all items needing attention.

**UI Elements:**
- Header: "Alerts" with filter icon
- Alert count badges: Critical (red), Warning (amber), Info (blue)
- Alert list grouped by severity:
  - **Critical (Out of Stock):** Red left border, "OUT" badge
  - **Warning (Low Stock):** Amber left border, "LOW" badge
  - **Info (Expiring Soon):** Blue left border, "EXP" badge
- Each alert card:
  - Product name and image
  - Current quantity vs minimum level
  - Location name
  - Time since alert triggered
  - Quick actions: "Order Now", "Snooze 24h", "Dismiss"
- "Create Order for All Low Stock" button (bottom-fixed)
- Filter options: By location, by category, by severity
- Settings shortcut: "Edit alert preferences"

---

## Screen 13: Purchase Order Builder

**Purpose:** Create, review, and send purchase orders to suppliers.

**UI Elements:**
- Header: "New Purchase Order" or "PO #[number]"
- Supplier selector (dropdown or search)
- Order items list:
  - Each row: product name, order quantity (editable stepper), unit, unit cost, line total
  - "Add item" button at bottom of list
  - Swipe to remove item
- Order summary section:
  - Subtotal
  - Estimated tax
  - Total
- Notes/special instructions text area
- Action buttons:
  - "Save as Draft" (secondary)
  - "Send to Supplier" (primary, with confirmation dialog)
- "Auto-fill from Low Stock" button — populates order with all low-stock items for selected supplier

**States:**
- Draft: Editable, gray status badge
- Sent: Read-only, blue status badge, "Resend" option
- Confirmed: Green status badge, "Mark as Received" button
- Received: Completed, option to reconcile (actual vs ordered quantities)

---

## Screen 14: Supplier Directory

**Purpose:** Manage supplier contacts and relationships.

**UI Elements:**
- Search bar
- Supplier list:
  - Each row: supplier name, contact name, product count, last order date
  - Tap to view supplier detail
- "Add Supplier" floating action button
- Supplier detail view:
  - Company name, contact name, email, phone
  - Product catalog (products from this supplier)
  - Order history
  - Performance metrics (on-time rate, accuracy)
  - Quick actions: "Call", "Email", "New Order"

---

## Screen 15: Reports & Analytics

**Purpose:** Data-driven insights for business decisions.

**UI Elements:**
- Date range selector (Today, This Week, This Month, Custom)
- Location filter
- Report cards (vertical scroll):
  - **Inventory Value:** Total value, breakdown by category (pie chart)
  - **Stock Levels Over Time:** Line chart with product selector
  - **Scan Activity:** Bar chart, scans per day, average scan accuracy
  - **Low Stock Frequency:** Which products most frequently hit low stock
  - **Waste Report:** Items expired/discarded, dollar value lost [Post-MVP]
  - **Variance Report:** Differences between expected and actual counts
- Export button (top-right): CSV, PDF, Google Sheets
- Each chart is tappable for full-screen detail view

---

## Screen 16: Expiration Tracker

**Purpose:** FIFO management and expiration alerts.

**UI Elements:**
- Header: "Expiring Items"
- Time-based sections:
  - **Expired** (red background): Items past expiration date
  - **Today** (dark amber): Expiring today
  - **Next 3 Days** (amber): Expiring in 1-3 days
  - **This Week** (light amber): Expiring in 4-7 days
  - **Later** (green): Items with 7+ days remaining
- Each item card:
  - Product name and image
  - Expiration date
  - Quantity with this expiration date
  - Location
  - Quick actions: "Mark as Used", "Mark as Wasted", "Discount"
- Summary bar: "X items expiring this week, $Y value at risk"

---

## Screen 17: Settings

**Purpose:** App configuration and account management.

**UI Elements (grouped sections):**

**Account:**
- Profile (name, email, avatar)
- Organization name
- Subscription plan (current plan, upgrade button)
- Billing (managed via Stripe customer portal)

**Locations:**
- List of locations (tap to edit)
- Add new location

**Scanning:**
- Default scan mode (AI / Barcode / Auto)
- Auto-flash in dark environments toggle
- Scan sound effects toggle
- Haptic feedback toggle
- Image quality (Standard / High — affects API cost)

**Alerts:**
- Push notifications toggle
- Email digest toggle (daily / weekly / off)
- Default alert threshold (percentage below minimum)
- Quiet hours (no notifications between X and Y)

**Integrations:**
- POS connections (Square, Toast, Clover) — connect/disconnect
- Google Sheets sync toggle
- Supplier email integration

**Data:**
- Export all data (CSV)
- Import products (CSV upload)
- Clear scan history

**Support:**
- Help Center link
- Contact Support (in-app chat or email)
- Feature Request

**Legal:**
- Terms of Service
- Privacy Policy
- App version

---

## Screen 18: Multi-Location Switcher

**Purpose:** Quick switching between business locations.

**UI Elements:**
- Current location (highlighted with checkmark)
- List of all locations:
  - Location name
  - Location type icon
  - Address (truncated)
  - Last scanned timestamp
  - Quick stock health: "23 in stock, 4 low, 1 out"
- "Add Location" button at bottom
- "View All Locations" toggle (consolidated dashboard view)

**Behavior:** Selecting a location updates the entire app context — dashboard, inventory list, alerts all reflect the selected location.

---

## Screen 19: Team/Staff Access

**Purpose:** Invite and manage team members with role-based access.

**UI Elements:**
- Team member list:
  - Avatar, name, email, role badge, last active
  - Swipe to edit role or remove
- Roles:
  - **Owner** — Full access, billing, settings
  - **Manager** — All features except billing and settings
  - **Staff** — Scan, view inventory, manual count only
- "Invite Team Member" button:
  - Email input
  - Role selector
  - Location access (all or specific locations)
  - Send invite button
- Pending invitations section (with resend/cancel options)

---

## Global UI Patterns

### Loading States
- Skeleton screens (not spinners) for content areas
- Pull-to-refresh on all list screens
- Infinite scroll with loading indicator at bottom

### Empty States
- Custom illustration for each screen
- Clear heading explaining what goes here
- CTA button to take the first action (e.g., "Add your first product")

### Error States
- Inline error messages below form fields (red text, red border)
- Toast notifications for transient errors (top of screen, auto-dismiss)
- Full-screen error for critical failures (with retry button)
- Offline indicator bar (amber, top of screen): "You're offline. Changes will sync when reconnected."

### Haptic Feedback
- Light: Button tap, navigation
- Medium: Successful scan, product detected
- Heavy: Error, destructive action confirmation

### Gestures
- Pull-to-refresh on all lists
- Swipe-left for quick actions on list items
- Swipe-right for alternative actions
- Long press for context menu
- Pinch-to-zoom on charts

### Accessibility Standards
- WCAG 2.1 AA compliance target
- Minimum touch target: 48x48px
- Minimum text size: 14px body, 12px captions
- Color never used as sole indicator (always paired with icon or text)
- Support for Dynamic Type (iOS) and font scaling (Android)
- Screen reader labels on all interactive elements
- Reduced motion option respects system setting
- High contrast mode support

---

## Screen Flow Diagrams

### First-Time User Flow
```
Welcome -> Sign Up -> Business Type -> First Location -> Add Products -> Scan Tutorial -> Dashboard
```

### Daily Scan Flow
```
Dashboard -> Tap Scan -> Camera Active -> Scan Products -> Review Summary -> Confirm -> Dashboard (updated)
```

### Low Stock to Order Flow
```
Alert Notification -> Low Stock Alerts -> Select Items -> Auto-fill PO -> Review PO -> Send to Supplier
```

### Expiration Check Flow
```
Dashboard -> Expiration Tracker -> Review Expiring Items -> Mark as Used/Wasted -> Waste Report Updated
```

---

*Every screen designed for one-handed use in a busy kitchen or stockroom. Large targets, high contrast, minimal text entry.*
