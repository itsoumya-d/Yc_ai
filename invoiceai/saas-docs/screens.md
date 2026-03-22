# InvoiceAI — Screens

## Navigation Architecture

```
Public Pages (No Auth)
  /                         Landing Page
  /pricing                  Pricing Page
  /pay/[invoiceId]          Client Payment Portal
  /receipt/[paymentId]      Payment Receipt

Auth Pages
  /login                    Login (email, Google, magic link)
  /signup                   Sign Up
  /forgot-password          Password Reset

Dashboard (Authenticated, Sidebar Layout)
  /dashboard                Dashboard Home
  /invoices                 Invoice List
  /invoices/new             Create Invoice
  /invoices/[id]            Invoice Detail / Preview
  /invoices/[id]/edit       Edit Invoice
  /clients                  Client List
  /clients/[id]             Client Detail
  /reports                  Reports & Analytics
  /follow-ups               Follow-Up Manager
  /expenses                 Expense Tracker
  /settings                 General Settings
  /settings/billing         Subscription & Billing
  /settings/branding        Logo, Colors, Templates
  /settings/integrations    Connected Services
  /settings/email-templates Email Template Customization
```

### Sidebar Navigation

```
[Logo: InvoiceAI]

Dashboard          (Home icon)
Invoices           (Document icon)
Clients            (Users icon)
Follow-ups         (Bell icon)
Reports            (Chart icon)
Expenses           (Receipt icon)

--- separator ---

Settings           (Gear icon)
Help               (Question icon)

--- bottom ---

[User Avatar]
[Business Name]
[Plan Badge: Pro]
```

---

## Screen 1: Landing Page

**Route:** `/`

**Purpose:** Convert visitors to sign-ups by communicating the value proposition and ROI of AI-powered invoicing.

**Layout:**
```
[Navbar: Logo | Features | Pricing | Login | "Get Started Free" CTA button]

[Hero Section]
  Headline: "Get Paid Faster with AI"
  Subheadline: "InvoiceAI drafts, sends, and collects invoices automatically.
                Stop chasing payments. Start getting paid."
  [CTA: "Start Free — No Credit Card Required"]
  [Secondary: "See it in action" → scrolls to demo]
  [Hero Image: Dashboard screenshot with invoice + payment notification]

[Social Proof Bar]
  "Trusted by 10,000+ freelancers" | "4.9/5 rating" | "$50M+ invoiced"

[ROI Calculator Section]
  "How much time will you save?"
  [Slider: Hours spent on invoicing per week (1-10)]
  [Slider: Average invoices per month (1-50)]
  [Output: "InvoiceAI will save you X hours/month and help you get paid Y days faster"]

[Feature Grid — 3 columns]
  1. AI Invoice Drafting: "Describe your work, get a perfect invoice"
  2. Automated Follow-ups: "AI chases late payments so you don't have to"
  3. Payment Prediction: "Know which clients will pay late before you send"
  4. Cash Flow Forecasting: "See your projected income for the next 90 days"
  5. Online Payments: "Clients pay with one click via credit card or bank transfer"
  6. Smart Reminders: "Escalating sequences that recover overdue payments"

[How It Works — 4 steps]
  1. Describe your work → AI generates the invoice
  2. Send with one click → AI picks the best time
  3. Client pays online → You get notified instantly
  4. AI follows up → Late payments handled automatically

[Testimonials Section]
  3 testimonial cards with photo, name, role, quote, stats

[Pricing Preview]
  Free / Pro $12.99 / Business $24.99
  [CTA: "Start Free"]

[Footer]
  Links: Features, Pricing, Blog, Help, Privacy, Terms
  Social: Twitter, LinkedIn
  "Made for freelancers, by freelancers"
```

**States:**
- Default state with all sections visible
- Mobile responsive: stacked layout, hamburger nav
- ROI calculator interactive state (sliders update output in real-time)

**Accessibility:**
- All images have descriptive alt text
- CTA buttons meet 4.5:1 contrast ratio
- ROI calculator keyboard-navigable
- Semantic HTML headings (h1 for hero, h2 for sections)
- Skip-to-content link for screen readers

---

## Screen 2: Dashboard

**Route:** `/dashboard`

**Purpose:** Give freelancers an at-a-glance view of their financial health — revenue, outstanding invoices, cash flow, and action items.

**Layout:**
```
[Top Bar]
  "Good morning, Sarah" | [Search bar] | [Notifications bell] | [Quick Action: + New Invoice]

[Stats Cards Row — 4 cards]
  1. Revenue This Month: $12,450 (+15% vs last month) [green arrow up]
  2. Outstanding: $8,200 (5 invoices) [amber]
  3. Overdue: $3,100 (2 invoices) [red]
  4. Avg Days to Payment: 18 days (-3 days improvement) [green]

[Main Content — 2 columns]

  [Left Column — 60%]
    [Cash Flow Forecast Chart]
      90-day line chart showing projected income
      Confidence bands (high/medium/low)
      Hover tooltips with daily breakdown
      Toggle: 30 / 60 / 90 days

    [Revenue Trend Chart]
      Bar chart, last 6 months
      Revenue vs. Outstanding stacked bars

  [Right Column — 40%]
    [Action Items Panel]
      "2 invoices overdue — Follow up"
      "3 invoices due this week"
      "1 new payment received: $2,500 from TechCorp"
      "Cash flow alert: projected shortfall in March"

    [Recent Activity Feed]
      "Invoice #042 paid by Acme Co — $3,200" (2 hours ago)
      "Invoice #045 viewed by Jane Smith" (5 hours ago)
      "Reminder sent to Bob's Design Co" (yesterday)
      "Invoice #044 created — $1,800" (2 days ago)

    [Top Clients Widget]
      Client name | Total billed | Health score (green/yellow/red dot)
      1. TechCorp | $24,000 | green
      2. Acme Co | $18,500 | green
      3. Bob's Design | $6,200 | red
```

**States:**
- **New user (empty):** Welcome card with setup wizard (add business info, create first invoice, connect Stripe)
- **Active user:** Full dashboard with data
- **Notifications:** Badge count on bell, dropdown with recent events
- **Loading:** Skeleton placeholders for each widget

**UI Elements:**
- Stat cards with trend indicators (arrow up/down, percentage change)
- Charts built with Recharts (interactive hover tooltips)
- Action items are clickable — navigate to relevant invoice
- Activity feed shows timestamps in relative format ("2 hours ago")
- Cash flow chart has configurable date range

**Accessibility:**
- Charts have aria-labels with data summaries
- Action items are focusable list items
- Color-coded indicators have text labels (not color-only)
- Stat cards announce values to screen readers

---

## Screen 3: Create Invoice

**Route:** `/invoices/new`

**Purpose:** The core creation flow — AI-assisted invoice generation from project descriptions or manual entry.

**Layout:**
```
[Page Header]
  "Create Invoice" | [Save Draft] [Preview] [Send]

[Two-Panel Layout]

  [Left Panel — Input (50%)]

    [AI Input Section]
      [Toggle: "AI Draft" / "Manual Entry"]

      [AI Draft Mode]
        "Describe your work:"
        [Large text area — placeholder: "e.g., Built a responsive landing page
         with 5 sections for TechCorp. 20 hours at $150/hr. Include hosting
         setup fee of $200."]
        [Button: "Generate Invoice" with sparkle icon]
        [AI status: "Generating..." with loading spinner]

      [Manual Entry Mode]
        [Line Items Table]
          | Description | Qty | Rate | Amount |
          | [text input] | [number] | [currency] | [calculated] |
          [+ Add Line Item]
        [Subtotal: calculated]

    [Client Section]
      [Client Dropdown — searchable]
        "Select a client or create new"
        [Selected: shows client name, email, payment terms]
      [+ New Client inline form]

    [Invoice Details]
      Invoice Number: [auto-generated, editable] INV-046
      Issue Date: [date picker] Feb 7, 2026
      Payment Terms: [dropdown] Net 30 / Net 15 / Net 60 / Custom
      Due Date: [auto-calculated from terms, editable] Mar 9, 2026
      Currency: [dropdown] USD

    [Additional Fields]
      Tax Rate: [percentage input] 0%
      Discount: [amount or percentage] $0
      Notes: [text area] "Thank you for your business!"
      Terms: [text area] "Payment is due within 30 days..."

  [Right Panel — Live Preview (50%)]
    [Invoice template preview — updates in real-time]
    [Shows the invoice as the client will see it]
    [Template selector dropdown at top of preview]
    [Zoom controls: 75% / 100% / 125%]
```

**States:**
- **Empty state:** AI text area focused, placeholder visible
- **AI generating:** Spinner on button, text area disabled, preview shows skeleton
- **AI generated:** Line items populated, preview updated, success toast
- **AI error:** Error message below text area, "Try Again" button
- **Manual mode:** Empty line items table, no AI section
- **Valid invoice:** Send button enabled (green), all required fields filled
- **Invalid invoice:** Send button disabled, missing fields highlighted in red
- **Saving draft:** Auto-save indicator ("Saved 2 seconds ago")

**AI Interaction Flow:**
1. User types project description
2. Clicks "Generate Invoice"
3. AI returns structured JSON (line items, descriptions, amounts)
4. Line items populate with editable fields
5. User reviews, edits if needed
6. Selects client, confirms dates
7. Preview updates in real-time
8. Save as draft or send immediately

**Accessibility:**
- Tab order: AI input -> Client -> Details -> Line Items -> Actions
- Line items table is keyboard-navigable (arrow keys)
- Date pickers support keyboard input
- Preview panel has aria-live region for real-time updates
- Error messages linked to invalid fields via aria-describedby

---

## Screen 4: Invoice Preview / Detail

**Route:** `/invoices/[id]`

**Purpose:** View the full invoice as the client will see it, with action buttons and status tracking.

**Layout:**
```
[Header Bar]
  [Back: "< Invoices"] | Invoice #INV-046 | [Status Pill: "Sent"]
  [Actions: Edit | Duplicate | Download PDF | Send/Resend | Mark as Paid | Delete]

[Status Timeline]
  Created (Feb 7) --> Sent (Feb 7) --> Viewed (Feb 8) --> [Paid / Overdue]
  [Horizontal timeline with checkmarks on completed steps]

[Invoice Document — centered, paper-like card]
  [Full invoice rendering matching the selected template]
  [Business logo, name, address]
  [Client name, address]
  [Invoice #, Date, Due Date]
  [Line Items Table with descriptions, qty, rate, amount]
  [Subtotal, Tax, Total]
  [Notes and Terms]
  [Payment link button (as it appears in email)]

[Sidebar — Right]
  [Payment Prediction]
    "AI predicts 78% chance of on-time payment"
    [Progress bar: green to 78%]
    "Recommendation: Send reminder 2 days before due date"

  [Activity Log]
    "Feb 7, 10:00am — Invoice created"
    "Feb 7, 10:05am — Invoice sent to jane@acme.com"
    "Feb 8, 2:30pm — Invoice viewed by client"
    "Feb 8, 2:31pm — Client clicked payment link"

  [Follow-up Schedule]
    "Reminder 1: Feb 28 (3 days before due)" [Pending]
    "Reminder 2: Mar 3 (due date)" [Pending]
    "Reminder 3: Mar 6 (3 days overdue)" [Pending]
    [Edit Schedule button]

  [Client Info Summary]
    "Acme Co — Jane Smith"
    "Avg payment speed: 22 days"
    "Total billed: $18,500"
    [View Client Profile link]
```

**States:**
- **Draft:** Edit and Send buttons prominent, no timeline progress
- **Sent:** Timeline shows "Sent" checkmark, waiting for view
- **Viewed:** Timeline shows "Viewed" checkmark, activity log updated
- **Paid:** Green "PAID" stamp overlay on invoice, payment details in sidebar
- **Overdue:** Red "OVERDUE" badge, follow-up sequence active, urgency indicators
- **Cancelled:** Grayed out with "CANCELLED" stamp

---

## Screen 5: Client Payment Portal

**Route:** `/pay/[invoiceId]` (Public, SSR, no authentication required)

**Purpose:** The page clients see when they click the payment link in their invoice email. Must be fast, trustworthy, and simple.

**Layout:**
```
[Minimal Navbar]
  [Freelancer's Logo] | "Invoice from [Business Name]" | [Powered by InvoiceAI]

[Invoice Summary Card — centered]
  From: [Business Name, Address]
  To: [Client Name, Company]
  Invoice: #INV-046
  Date: February 7, 2026
  Due: March 9, 2026

  [Line Items — read-only]
  | Description | Qty | Rate | Amount |
  | Landing page design | 1 | $3,000 | $3,000 |
  | Responsive development | 20 hrs | $150/hr | $3,000 |
  | Hosting setup | 1 | $200 | $200 |

  Subtotal: $6,200
  Tax (0%): $0
  Total Due: $6,200

[Payment Section]
  "Pay $6,200"

  [Tab: Credit Card | Bank Transfer]

  [Credit Card Tab]
    [Stripe Elements — card number, expiry, CVC]
    [Billing email: pre-filled]
    [Pay $6,200 button — large, green, prominent]

  [Bank Transfer Tab]
    [Plaid Link button: "Connect your bank"]
    [Or manual ACH details]
    [Pay $6,200 button]

  [Partial Payment Option]
    [Checkbox: "Pay a different amount"]
    [Amount input field]

[Trust Indicators — bottom]
  [Lock icon] "256-bit SSL encrypted"
  [Shield icon] "Payments processed by Stripe"
  [Stripe badge] [PCI compliant badge]

[Footer]
  "Questions about this invoice? Contact [freelancer email]"
  "Powered by InvoiceAI"
```

**States:**
- **Unpaid:** Full payment form visible
- **Processing:** Button shows spinner, "Processing payment..."
- **Success:** Confetti animation, "Payment successful!" message, receipt link
- **Failed:** Error message, "Please try again" with details
- **Already paid:** "This invoice has been paid" with receipt link
- **Expired/Cancelled:** "This invoice is no longer available" message
- **Partial payment:** Shows remaining balance, option to pay more

**Accessibility:**
- Payment form follows Stripe accessibility guidelines
- Tab navigation between payment methods
- Error messages are announced by screen readers
- High contrast mode support
- Large touch targets for mobile

**Performance:**
- SSR for instant first paint (< 1 second)
- Stripe.js loaded asynchronously
- Critical CSS inlined
- No unnecessary JavaScript

---

## Screen 6: Client List

**Route:** `/clients`

**Purpose:** View all clients with payment health indicators, search, filter, and quick actions.

**Layout:**
```
[Page Header]
  "Clients" ([count]) | [Search bar] | [Filter: All / Active / At Risk / Archived]
  [+ Add Client button]

[Client Cards Grid — or Table View toggle]

  [Client Card]
    [Company Logo/Initials Avatar]
    [Client Name — clickable]
    [Company Name]
    [Email]
    ---
    [Health Score Badge: green "Excellent" / yellow "Fair" / red "At Risk"]
    [Stats Row]
      Total Billed: $24,000
      Outstanding: $3,200
      Avg Days to Pay: 18
    [Last Invoice: Jan 15, 2026 — Paid]
    ---
    [Actions: View | New Invoice | Send Reminder]

[Table View Alternative]
  | Name | Company | Health | Total Billed | Outstanding | Avg Pay Speed | Last Invoice | Actions |
  | Sarah Chen | TechCorp | green | $24,000 | $0 | 15 days | Jan 15 — Paid | ... |
  | Bob Smith | Bob's Design | red | $6,200 | $3,100 | 38 days | Dec 1 — Overdue | ... |
  | Jane Doe | Acme Co | yellow | $18,500 | $5,100 | 25 days | Feb 1 — Sent | ... |

[Empty State]
  "No clients yet"
  "Add your first client to start invoicing"
  [+ Add Client button]
```

**States:**
- **Default:** All clients, sorted by most recent invoice
- **Filtered:** By health status, with active filter pill
- **Search results:** Matching clients highlighted
- **Empty:** Illustration with "Add your first client" CTA
- **Loading:** Card skeletons

---

## Screen 7: Invoice List

**Route:** `/invoices`

**Purpose:** View all invoices with filtering by status, search, bulk actions, and quick status indicators.

**Layout:**
```
[Page Header]
  "Invoices" ([count]) | [Search: invoice #, client name, amount]
  [Filters: All | Draft | Sent | Viewed | Paid | Overdue]
  [Sort: Date (newest) | Amount | Due Date | Client]
  [+ New Invoice button]

[Summary Bar]
  All: 42 | Draft: 3 | Sent: 8 | Viewed: 4 | Paid: 25 | Overdue: 2
  [Each count is clickable as a filter]

[Invoice Table]
  | Status | Invoice # | Client | Amount | Issue Date | Due Date | Actions |
  | [green pill: Paid] | INV-046 | TechCorp | $6,200 | Feb 7 | Mar 9 | ... |
  | [red pill: Overdue] | INV-038 | Bob's Design | $3,100 | Dec 1 | Dec 31 | ... |
  | [blue pill: Sent] | INV-045 | Acme Co | $2,500 | Feb 1 | Mar 3 | ... |
  | [purple pill: Viewed] | INV-044 | StartupXYZ | $1,800 | Jan 28 | Feb 27 | ... |
  | [gray pill: Draft] | INV-047 | — | $4,500 | Feb 7 | — | ... |

  [Each row expandable to show line items summary]

  [Pagination: Showing 1-20 of 42 | < 1 2 3 >]

[Bulk Actions Bar — appears when checkboxes selected]
  [X selected] | [Send All] | [Download PDF] | [Delete]
```

**Status Pill Colors:**
- Draft: Gray (#6B7280)
- Sent: Blue (#3B82F6)
- Viewed: Purple (#8B5CF6)
- Paid: Green (#22C55E)
- Overdue: Red (#DC2626)

**States:**
- **All invoices:** Full list, default sort by date
- **Filtered by status:** Only matching invoices, active filter pill
- **Search results:** Matching invoices, search term highlighted
- **Empty (no invoices):** "Create your first invoice" CTA
- **Empty (no matches):** "No invoices match your search" with reset link
- **Bulk selection:** Checkbox column, bulk action bar appears

---

## Screen 8: Reports & Analytics

**Route:** `/reports`

**Purpose:** Comprehensive financial reporting for freelancers — revenue trends, payment analytics, client performance.

**Layout:**
```
[Page Header]
  "Reports" | [Date Range Picker: This Month / Quarter / Year / Custom]
  [Export: Download CSV | Download PDF]

[Revenue Overview Cards — 4 cards]
  Total Revenue: $142,500 (this year)
  Average Monthly: $11,875
  Average Invoice: $3,392
  Collection Rate: 94.5%

[Revenue Trend Chart — Full Width]
  Bar chart: monthly revenue (last 12 months)
  Line overlay: cumulative revenue
  Toggle: Revenue / Invoiced / Collected

[Two-Column Section]

  [Left: Payment Speed Analytics]
    Average Days to Payment: 19 days
    Fastest: 1 day (StartupXYZ)
    Slowest: 45 days (Bob's Design)
    [Distribution histogram: days to payment]
    [Trend line: avg payment speed over last 6 months]

  [Right: Invoice Status Breakdown]
    [Donut chart: Draft 5% / Sent 15% / Viewed 8% / Paid 62% / Overdue 10%]
    [Legend with counts and amounts for each status]

[Client Performance Table]
  | Client | Total Billed | Total Paid | Outstanding | Avg Days | Health |
  | TechCorp | $24,000 | $24,000 | $0 | 15 | Excellent |
  | Acme Co | $18,500 | $13,400 | $5,100 | 25 | Fair |
  | Bob's Design | $6,200 | $3,100 | $3,100 | 38 | At Risk |
  [Sortable by any column]

[Cash Flow Forecast Section — Post-MVP]
  90-day forecast chart with confidence bands
  Scenario toggles: "Best case" / "Expected" / "Worst case"
```

**States:**
- **Default:** Current month data
- **Custom range:** User-selected date range applied
- **No data:** Charts show placeholder with "Create invoices to see reports"
- **Loading:** Skeleton charts
- **Exporting:** Download progress indicator

---

## Screen 9: Follow-Up Manager

**Route:** `/follow-ups`

**Purpose:** Manage automated follow-up sequences for overdue invoices, preview upcoming messages, and track recovery.

**Layout:**
```
[Page Header]
  "Follow-Up Manager" | [Global Toggle: Automated Follow-ups ON/OFF]

[Summary Cards]
  Active Sequences: 4
  Pending Follow-ups: 7
  Recovered This Month: $8,200 (from follow-ups)
  Recovery Rate: 68%

[Follow-Up Queue — List]
  [Each item:]
    [Invoice #INV-038 — Bob's Design Co — $3,100]
    [Status: 14 days overdue]
    [Next action: "Firm reminder" scheduled for Feb 10]
    [Sequence progress: Step 3 of 4]
    [Timeline visualization: friendly(sent) → reminder(sent) → firm(next) → final(pending)]
    [Actions: Preview Message | Skip | Pause | Send Now]

  [Expandable: Preview of next message]
    "Subject: Important: Invoice #INV-038 is 14 days overdue

     Hi Bob, this is a follow-up regarding invoice #INV-038 for $3,100,
     originally due on January 24. We have not yet received payment.

     [Pay Now button]

     Please let us know if you have questions or need to arrange a payment plan."

    [Edit message before sending]

[Sequence Settings Panel]
  Default Sequence Template:
  Step 1: [Friendly] at [3] days overdue via [email]
  Step 2: [Reminder] at [7] days overdue via [email]
  Step 3: [Firm] at [14] days overdue via [email]
  Step 4: [Final Notice] at [30] days overdue via [email]
  [+ Add Step]
  [Save Changes]

[Recovery Analytics]
  [Chart: payments recovered by follow-up step]
  "52% of late payments recovered after Step 1 (friendly reminder)"
  "28% recovered after Step 2"
  "15% recovered after Step 3"
  "5% recovered after Step 4"
```

**States:**
- **Active sequences:** List of in-progress follow-up sequences
- **No overdue invoices:** "All caught up! No follow-ups needed." with celebration icon
- **Paused sequence:** Grayed out with "Paused" badge and resume button
- **Message preview:** Expanded view with editable message
- **Sending:** Progress indicator on "Send Now" action

---

## Screen 10: Settings

**Route:** `/settings`

**Purpose:** Manage business profile, payment methods, branding, email templates, and integrations.

**Layout:**
```
[Settings Navigation — Left Sidebar or Tabs]
  General
  Billing & Plan
  Branding
  Email Templates
  Integrations
  Notifications

[General Settings]
  [Business Information]
    Business Name: [input]
    Your Name: [input]
    Email: [input]
    Phone: [input]
    Address: [address fields]
    Tax ID / EIN: [input]
    Default Currency: [dropdown]
    Default Payment Terms: [dropdown: Net 15/30/60/Custom]
    Invoice Number Format: [input: INV-{number}]
    Next Invoice Number: [number input]
  [Save Changes button]

[Billing & Plan — /settings/billing]
  [Current Plan Card]
    "Pro Plan — $12.99/month"
    "Next billing: March 7, 2026"
    [Manage Subscription] [Cancel Plan]
  [Plan Comparison]
    Free / Pro / Business with feature lists
    [Upgrade / Downgrade buttons]
  [Payment Method]
    Visa ending in 4242
    [Update Payment Method]
  [Billing History]
    Table of past invoices from InvoiceAI

[Branding — /settings/branding]
  [Logo Upload]
    [Drag & drop zone or file picker]
    [Preview of current logo]
  [Brand Colors]
    Primary Color: [color picker, default: #059669]
    Secondary Color: [color picker]
  [Invoice Template]
    [Template selector: Classic / Modern / Minimal / Bold / Creative]
    [Live preview of selected template with brand colors]
  [Custom Footer Text]
    [Text area: appears at bottom of every invoice]

[Email Templates — /settings/email-templates]
  [Template List]
    Invoice Delivery Email [Edit]
    Payment Confirmation [Edit]
    Friendly Reminder [Edit]
    Overdue Notice [Edit]
    Final Notice [Edit]
  [Template Editor]
    Subject: [editable]
    Body: [rich text editor with merge fields]
    Available merge fields: {client_name}, {invoice_number}, {amount}, {due_date}, {payment_link}
    [Preview] [Reset to Default] [Save]

[Integrations — /settings/integrations]
  [Stripe — Connected]
    "Payments enabled. Connected account: acct_xxx"
    [Disconnect]
  [Plaid — Not Connected]
    "Enable bank transfer payments for lower fees"
    [Connect]
  [QuickBooks — Not Connected] (Post-MVP)
    "Sync invoices with your accounting software"
    [Connect]
  [Google Calendar — Not Connected]
    "Sync payment deadlines to your calendar"
    [Connect]

[Notifications — /settings/notifications]
  Email Notifications:
    [x] Payment received
    [x] Invoice viewed by client
    [x] Invoice overdue
    [x] Weekly summary
    [ ] Marketing updates
  Push Notifications: (future)
    [Same toggles]
```

---

## Screen 11: Expense Tracker

**Route:** `/expenses`

**Purpose:** Track business expenses, categorize spending, attach receipts, and optionally link expenses to invoices.

**Layout:**
```
[Page Header]
  "Expenses" | [Date Range: This Month]
  [+ Add Expense button]

[Summary Cards]
  Total Expenses (This Month): $2,340
  Top Category: Software ($890)
  Billable Expenses: $450
  Tax Deductible: $1,890

[Expense List — Table]
  | Date | Description | Category | Amount | Client | Receipt | Actions |
  | Feb 5 | Adobe Creative Suite | Software | $54.99 | — | [clip icon] | Edit/Delete |
  | Feb 3 | Stock photos | Materials | $29.00 | TechCorp | — | Edit/Delete |
  | Feb 1 | Coworking day pass | Office | $35.00 | — | [clip icon] | Edit/Delete |
  [Pagination]

[Add Expense Modal]
  Description: [input]
  Amount: [currency input]
  Date: [date picker]
  Category: [dropdown: Software, Materials, Office, Travel, Marketing, Other, Custom]
  Client: [optional dropdown — link to a client]
  Invoice: [optional dropdown — attach to invoice as line item]
  Receipt: [file upload — image or PDF]
  Notes: [text area]
  [Save] [Cancel]

[Category Breakdown Chart — Sidebar or Bottom]
  [Pie chart: expense distribution by category]
  [Monthly trend: expenses over last 6 months]
```

---

## Screen 12: Client Detail

**Route:** `/clients/[id]`

**Purpose:** Deep view into a single client's history, payment behavior, and relationship health.

**Layout:**
```
[Header]
  [Back: "< Clients"]
  [Client Avatar/Initials] [Client Name] [Company]
  [Health Badge: Excellent / Fair / At Risk]
  [Actions: Edit | Archive | New Invoice]

[Client Info Card]
  Email: jane@acme.com
  Phone: (555) 123-4567
  Address: 123 Main St, New York, NY 10001
  Default Terms: Net 30
  Currency: USD
  Notes: "Prefers detailed line items. Always pays via ACH."

[Stats Row — 4 Cards]
  Total Billed: $18,500
  Total Paid: $13,400
  Outstanding: $5,100
  Avg Days to Pay: 25

[Invoice History — Table]
  | Invoice # | Date | Amount | Status | Paid Date | Days to Pay |
  | INV-045 | Feb 1 | $2,500 | Sent | — | — |
  | INV-040 | Jan 5 | $4,200 | Paid | Jan 22 | 17 |
  | INV-035 | Dec 1 | $3,800 | Paid | Dec 28 | 27 |
  | INV-030 | Nov 1 | $5,400 | Paid | Nov 30 | 29 |
  | INV-025 | Oct 1 | $2,600 | Paid | Oct 20 | 19 |

[Payment Speed Chart]
  [Line chart: days to payment over time for this client]
  [Shows trend — improving or worsening]

[AI Insights Panel]
  "This client typically pays within 20-28 days"
  "Best send day: Tuesday (fastest payment historically)"
  "Risk level: Low — consistent payment history"
  "Recommendation: Maintain Net 30 terms"
```

---

## Global UI Elements

### Toast Notifications
- **Success:** Green left border, checkmark icon. "Invoice sent successfully"
- **Error:** Red left border, X icon. "Failed to send invoice. Please try again."
- **Info:** Blue left border, info icon. "Payment received: $3,200 from TechCorp"
- **Warning:** Amber left border, alert icon. "Invoice #038 is now overdue"
- Position: Top-right, auto-dismiss after 5 seconds, manual dismiss available

### Empty States
- Each page has a custom empty state illustration
- Primary CTA relevant to the page (e.g., "+ Create Invoice" on empty invoice list)
- Secondary helper text explaining what the page does

### Loading States
- Skeleton screens (not spinners) for initial page loads
- Inline spinners for button actions (send, generate, pay)
- Optimistic updates for quick actions (mark as paid)

### Error States
- Inline validation for forms (red border, error text below field)
- Full-page error for critical failures (500 errors) with retry button
- Network offline indicator (yellow banner at top of page)

### Responsive Breakpoints
- **Desktop:** 1280px+ (full sidebar, two-column layouts)
- **Tablet:** 768px-1279px (collapsible sidebar, single column with panels)
- **Mobile:** < 768px (bottom tab nav, stacked layout, simplified tables to cards)

### Keyboard Shortcuts
- `Cmd/Ctrl + N` — New invoice
- `Cmd/Ctrl + K` — Command palette (search invoices, clients, actions)
- `Cmd/Ctrl + S` — Save current form
- `Escape` — Close modal / go back

### Accessibility Standards
- WCAG 2.1 AA compliance throughout
- Focus indicators on all interactive elements
- Screen reader announcements for dynamic content (toast, status changes)
- Color is never the sole indicator (always paired with text/icons)
- Minimum touch target: 44x44px on mobile
- Reduced motion support (prefers-reduced-motion)
- Language attribute on HTML element
- Alt text on all images and icons with meaning

---

*Last updated: February 2026*
