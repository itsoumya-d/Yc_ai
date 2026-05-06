# Taxonaut -- Screens

> Every screen in the application with UI elements, navigation flow, states, and accessibility considerations.

---

## Navigation Architecture

Taxonaut uses a **persistent left sidebar** navigation pattern common in fintech dashboards. The sidebar is always visible and provides single-click access to every major section.

```
+----------------------------------------------------------------+
|  [Logo]  Taxonaut                              [Notifications] |
+----------+-----------------------------------------------------+
|          |                                                     |
| SIDEBAR  |              MAIN CONTENT AREA                     |
|          |                                                     |
| Dashboard|  +-----------------------------------------------+ |
| Transact.|  |                                               | |
| Deductns |  |           Active Screen Content               | |
| Strategy |  |                                               | |
| Quarterly|  |                                               | |
| Reports  |  |                                               | |
| Entity   |  |                                               | |
|          |  +-----------------------------------------------+ |
|----------|                                                     |
| Settings |                                                     |
| Help     |  +------------------+  +--------------------------+ |
|          |  | Secondary Panel  |  | Detail/Action Panel      | |
+----------+-----------------------------------------------------+
|  Status Bar: Last synced 2 min ago | 3 accounts connected     |
+----------------------------------------------------------------+
```

### Sidebar Navigation Items

| Icon | Label | Route | Badge |
|------|-------|-------|-------|
| LayoutDashboard | Dashboard | `/dashboard` | -- |
| ArrowLeftRight | Transactions | `/transactions` | Uncategorized count |
| Search | Deductions | `/deductions` | New deductions found |
| Lightbulb | Strategy | `/strategy` | New strategies count |
| Calendar | Quarterly | `/quarterly` | Days until next deadline |
| BarChart3 | Reports | `/reports` | -- |
| Building2 | Entity | `/entity` | -- (Post-MVP) |
| Users | CPA Portal | `/cpa` | -- (Post-MVP) |
| Bell | Notifications | `/notifications` | Unread count |
| Settings | Settings | `/settings` | -- |

---

## Screen 1: Onboarding Flow

The first-run experience. Users see this once and never again (unless they reset their account).

### Step 1: Welcome

```
+-----------------------------------------------+
|                                                |
|              [Taxonaut Logo]                   |
|                                                |
|        Your AI Tax Strategist,                 |
|              Year-Round                        |
|                                                |
|   Stop overpaying taxes. Taxonaut monitors     |
|   your finances and proactively finds ways     |
|   to reduce your tax bill -- legally.          |
|                                                |
|          [Get Started -- it's free]            |
|                                                |
|     Already have an account? [Sign In]         |
|                                                |
|   [lock icon] Bank-level encryption.           |
|   Your data never leaves your control.         |
|                                                |
+-----------------------------------------------+
```

**UI Elements:**
- Hero illustration: animated shield with dollar sign
- Primary CTA button: "Get Started -- it's free"
- Secondary link: "Sign In"
- Trust indicators: encryption badge, SOC 2 badge (when achieved)

### Step 2: Account Creation

```
+-----------------------------------------------+
|  Step 1 of 5                   [progress bar]  |
|                                                |
|         Create Your Account                    |
|                                                |
|  Email         [____________________]          |
|  Password      [____________________]          |
|  Confirm       [____________________]          |
|                                                |
|  Password strength: [========  ] Strong        |
|                                                |
|  [ ] I agree to the Terms of Service           |
|      and Privacy Policy                        |
|                                                |
|              [Continue]                        |
|                                                |
|  --- or sign up with ---                       |
|  [Google]  [Apple]                             |
|                                                |
+-----------------------------------------------+
```

**UI Elements:**
- Progress indicator (5 steps)
- Email input with validation
- Password input with strength meter (zxcvbn library)
- Checkbox for terms acceptance
- Social auth buttons (Google, Apple)

### Step 3: Business Type Quiz

```
+-----------------------------------------------+
|  Step 2 of 5                   [progress bar]  |
|                                                |
|     Tell us about your business                |
|                                                |
|  What type of work do you do?                  |
|  +-------------------------------------------+|
|  | [ ] Freelance/Consulting                   ||
|  | [ ] Small Business Owner (1-10 employees)  ||
|  | [ ] Gig Worker (Uber, DoorDash, etc.)      ||
|  | [ ] Online Seller (Etsy, Amazon)           ||
|  | [ ] Content Creator                        ||
|  | [ ] Real Estate                            ||
|  | [ ] Other: [__________]                    ||
|  +-------------------------------------------+|
|                                                |
|  What's your business entity?                  |
|  ( ) Sole Proprietor / Individual              |
|  ( ) LLC (Single Member)                       |
|  ( ) LLC (Multi Member)                        |
|  ( ) S-Corporation                             |
|  ( ) C-Corporation                             |
|  ( ) Not sure                                  |
|                                                |
|          [Back]  [Continue]                    |
+-----------------------------------------------+
```

### Step 4: Tax Profile

```
+-----------------------------------------------+
|  Step 3 of 5                   [progress bar]  |
|                                                |
|       Your Tax Profile                         |
|                                                |
|  Filing Status:                                |
|  ( ) Single                                    |
|  ( ) Married Filing Jointly                    |
|  ( ) Married Filing Separately                 |
|  ( ) Head of Household                         |
|                                                |
|  State of Residence:                           |
|  [California                          v]       |
|                                                |
|  Estimated Annual Freelance Income:            |
|  [$____________]                               |
|  (This helps us estimate your tax bracket)     |
|                                                |
|  Do you have W-2 income as well?               |
|  ( ) No, freelance only                        |
|  ( ) Yes  -->  Estimated W-2 income: [$___]    |
|                                                |
|          [Back]  [Continue]                    |
+-----------------------------------------------+
```

### Step 5: Connect Accounts

```
+-----------------------------------------------+
|  Step 4 of 5                   [progress bar]  |
|                                                |
|     Connect Your Bank Accounts                 |
|                                                |
|  Link your accounts to start tracking          |
|  income, expenses, and deductions.             |
|                                                |
|  +-------------------------------------------+|
|  | [Bank Icon] Chase Business Checking        ||
|  |             **** 4521   [Connected]        ||
|  +-------------------------------------------+|
|  | [+] Connect another account               ||
|  +-------------------------------------------+|
|                                                |
|  [lock] Powered by Plaid. Taxonaut never      |
|  sees your bank login credentials.             |
|                                                |
|  [Skip for now -- I'll connect later]          |
|                                                |
|          [Back]  [Continue]                    |
+-----------------------------------------------+
```

**UI Elements:**
- Plaid Link modal (embedded)
- Connected account card with institution logo, account name, last 4 digits
- "Add another" button
- Skip option (users can onboard without connecting)
- Security trust indicator

### Step 6: Setup Complete

```
+-----------------------------------------------+
|  Step 5 of 5                   [progress bar]  |
|                                                |
|            You're All Set!                     |
|                                                |
|  [checkmark animation]                         |
|                                                |
|  Taxonaut is now syncing your transactions     |
|  and analyzing your tax situation.             |
|                                                |
|  What happens next:                            |
|  1. We'll categorize your transactions (1-2hr) |
|  2. Your tax dashboard will populate           |
|  3. Deduction suggestions will start appearing |
|  4. Strategy recommendations in ~24 hours      |
|                                                |
|  Enable notifications so you never miss a      |
|  deadline or savings opportunity.               |
|                                                |
|  [Enable Notifications]                        |
|                                                |
|         [Go to Dashboard]                      |
+-----------------------------------------------+
```

**States:**
- Loading state while initial sync begins
- Success state with checkmark animation
- Error state if Plaid connection fails (retry option)

---

## Screen 2: Tax Dashboard

The home screen. This is where users spend most of their time.

```
+----------------------------------------------------------------+
| SIDEBAR |                    TAX DASHBOARD                      |
|         |                                                       |
|         |  +------------------+  +---------------------------+  |
|         |  | TAX LIABILITY    |  | SAVINGS FOUND             |  |
|         |  |                  |  |                           |  |
|         |  |   $12,847        |  |   $4,218                  |  |
|         |  |   Estimated      |  |   in deductions this year |  |
|         |  |   Federal + State|  |                           |  |
|         |  |                  |  |   +$640 since last month  |  |
|         |  | [Gauge: 32%      |  |   [View All Deductions]   |  |
|         |  |  effective rate]  |  |                           |  |
|         |  +------------------+  +---------------------------+  |
|         |                                                       |
|         |  +------------------+  +---------------------------+  |
|         |  | UPCOMING         |  | ACTIVE STRATEGIES          |  |
|         |  | DEADLINES        |  |                           |  |
|         |  |                  |  | - S-Corp election could   |  |
|         |  | Q3 Estimated Tax |  |   save $8,400/yr          |  |
|         |  | Sep 15, 2025     |  | - SEP IRA contribution    |  |
|         |  | 47 days away     |  |   saves $2,100            |  |
|         |  |                  |  | - Equipment purchase      |  |
|         |  | Amount: $3,212   |  |   before Dec 31: $1,800   |  |
|         |  | [Pay Now Guide]  |  |                           |  |
|         |  +------------------+  | [View All Strategies]     |  |
|         |                        +---------------------------+  |
|         |  +------------------------------------------------+  |
|         |  | INCOME vs EXPENSES (Monthly)                     |  |
|         |  |                                                  |  |
|         |  | [Bar chart: Jan-Dec, income bars + expense bars] |  |
|         |  |                                                  |  |
|         |  | YTD Income:   $87,400                           |  |
|         |  | YTD Expenses: $34,200                           |  |
|         |  | Net Profit:   $53,200                           |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  | RECENT ACTIVITY                                  |  |
|         |  |                                                  |  |
|         |  | Today   Adobe Creative Cloud  -$54.99  Software  |  |
|         |  | Today   Client Payment      +$3,500.00  Income   |  |
|         |  | Ystrdy  Uber Eats           -$32.47   Meals 50% |  |
|         |  | Ystrdy  WeWork              -$450.00   Rent      |  |
|         |  |                                                  |  |
|         |  | [View All Transactions]                          |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**UI Elements:**

- **Tax Liability Card**: Large number display with gauge visualization showing effective tax rate. Color-coded (green if lower than last year, red if higher). Tapping shows federal/state/SE breakdown.
- **Savings Found Card**: Running total of deductions Taxonaut has identified. Animated counter when new deductions are found. Month-over-month change indicator.
- **Upcoming Deadlines Card**: Next deadline with countdown. Amount due. Link to payment guide. Color changes from teal (>30 days) to amber (7-30 days) to red (<7 days).
- **Active Strategies Card**: Top 3 strategies ranked by savings. Each shows estimated dollar savings. Link to full strategy center.
- **Income vs Expenses Chart**: Recharts bar chart with monthly income (teal) and expenses (gold). Hover shows exact amounts. Toggle between monthly/quarterly/annual view.
- **Recent Activity Feed**: Last 5 transactions with category badges. Deductible transactions highlighted with a subtle green left border. Link to full transaction feed.

**States:**
- **First Load**: Skeleton loading state while transactions sync (pulsing placeholders)
- **Empty State**: No accounts connected -- shows CTA to connect first account
- **Syncing State**: Progress bar showing initial transaction import
- **Normal State**: All data populated and updating in real-time
- **Error State**: Account sync failed -- shows which account and reconnect option

**Accessibility:**
- All financial figures have aria-labels with full amounts ("Estimated tax liability: twelve thousand eight hundred forty-seven dollars")
- Gauge visualization has text alternative
- Chart data available as accessible table toggle
- High contrast mode available for all financial data
- Keyboard navigation for all interactive elements (Tab order follows visual layout)

---

## Screen 3: Transaction Feed

All transactions from connected accounts, categorized and searchable.

```
+----------------------------------------------------------------+
| SIDEBAR |                   TRANSACTIONS                        |
|         |                                                       |
|         |  [Search______]  [Date Range v] [Category v] [Acct v]|
|         |  [All] [Business] [Personal] [Uncategorized] [Deduct]|
|         |                                                       |
|         |  TODAY -- July 23, 2025                               |
|         |  +------------------------------------------------+  |
|         |  | [Adobe icon]                                     |  |
|         |  | Adobe Creative Cloud          -$54.99           |  |
|         |  | Chase *4521  |  Software/Subs  |  [Deductible]  |  |
|         |  | Confidence: 98%                                  |  |
|         |  +------------------------------------------------+  |
|         |  | [Stripe icon]                                    |  |
|         |  | Stripe Transfer             +$3,500.00          |  |
|         |  | Chase *4521  |  Income       |  [Business]      |  |
|         |  | Confidence: 99%                                  |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  YESTERDAY -- July 22, 2025                          |
|         |  +------------------------------------------------+  |
|         |  | [Uber icon]                                      |  |
|         |  | Uber Eats                     -$32.47           |  |
|         |  | Amex *1234  |  Meals (50%)    |  [Deductible]   |  |
|         |  | Confidence: 72%  [Review]                        |  |
|         |  +------------------------------------------------+  |
|         |  | [flag] Needs review                              |  |
|         |  | Amazon Marketplace            -$247.00          |  |
|         |  | Chase *4521  |  [Uncategorized]  |  [Categorize]|  |
|         |  | Could be: Office Supplies, Personal, Equipment   |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  [Load More]                                         |
+----------------------------------------------------------------+
```

**UI Elements:**

- **Search Bar**: Full-text search across descriptions, amounts, categories
- **Filter Bar**: Date range picker, category dropdown (multi-select), account filter, status filter
- **Quick Filters**: Tab-style buttons for common views (All, Business, Personal, Uncategorized, Deductible)
- **Transaction Row**: Merchant icon (from Plaid metadata), description, amount (red for expenses, green for income), account source, category badge, deductible flag, confidence indicator
- **Low Confidence Indicator**: Yellow "Review" badge for transactions below 85% confidence. Clicking opens category picker with AI suggestions.
- **Uncategorized Transaction**: Orange flag, shows top 3 AI category suggestions as clickable chips
- **Deductible Badge**: Green badge for deductible transactions, shows deduction percentage if partial (e.g., "Meals 50%")

**Transaction Detail Panel** (slides in from right when a transaction is clicked):

```
+---------------------------+
| Adobe Creative Cloud      |
| -$54.99 | Jul 23, 2025    |
|                           |
| Account: Chase *4521      |
| Category: Software/Subs   |
| Deductible: Yes (100%)    |
| Confidence: 98%           |
|                           |
| [Change Category v]       |
| [Business %: [100]     ]  |
| [Add Note: [________]  ]  |
|                           |
| IRS Reference:            |
| Schedule C, Line 18       |
| "Other Expenses"          |
|                           |
| [Split Transaction]       |
| [Mark as Personal]        |
| [Flag for CPA Review]     |
+---------------------------+
```

**States:**
- Loading: Skeleton rows with pulsing animation
- Empty: No transactions yet -- "Connect a bank account to start tracking"
- Filtered empty: "No transactions match your filters" with clear filters button
- Syncing: "Importing new transactions..." with progress indicator
- Error: "Failed to load transactions" with retry button

---

## Screen 4: Deduction Finder

AI-discovered deductions with explanations and savings estimates.

```
+----------------------------------------------------------------+
| SIDEBAR |                 DEDUCTION FINDER                      |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  | TOTAL DEDUCTIONS FOUND THIS YEAR                 |  |
|         |  |                                                  |  |
|         |  |     $4,218                                      |  |
|         |  |     across 47 transactions                      |  |
|         |  |     Est. tax savings: $1,183                    |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  CATEGORY BREAKDOWN                                  |
|         |  +------------------------------------------------+  |
|         |  | Software/Subscriptions    $2,340  (12 items)    |  |
|         |  | [============================     ]              |  |
|         |  | Home Office               $1,200  (1 item)     |  |
|         |  | [===================              ]              |  |
|         |  | Professional Development  $478    (3 items)     |  |
|         |  | [========                         ]              |  |
|         |  | Meals (50%)               $200    (31 items)    |  |
|         |  | [====                             ]              |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  MISSED DEDUCTIONS (Action Required)                 |
|         |  +------------------------------------------------+  |
|         |  | [!] VEHICLE MILEAGE                              |  |
|         |  |                                                  |  |
|         |  | You drove an estimated 2,400 business miles      |  |
|         |  | this year but haven't logged them.               |  |
|         |  |                                                  |  |
|         |  | Potential deduction: $1,584                      |  |
|         |  | Tax savings: ~$444                               |  |
|         |  |                                                  |  |
|         |  | [Start Tracking Mileage] [Dismiss] [Learn More]  |  |
|         |  +------------------------------------------------+  |
|         |  +------------------------------------------------+  |
|         |  | [!] HOME OFFICE DEDUCTION                        |  |
|         |  |                                                  |  |
|         |  | You work from home but haven't claimed the       |  |
|         |  | home office deduction.                           |  |
|         |  |                                                  |  |
|         |  | Simplified method: up to $1,500/year             |  |
|         |  | Actual method: based on home expenses             |  |
|         |  |                                                  |  |
|         |  | [Calculate My Deduction] [Dismiss] [Learn More]  |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  ALL DEDUCTIBLE TRANSACTIONS                          |
|         |  (sorted by amount, descending)                       |
|         |  +------------------------------------------------+  |
|         |  | Figma Annual Plan        -$144.00  Software     |  |
|         |  | Why: Design tool used for client work            |  |
|         |  | IRS: Schedule C, Line 18                         |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**UI Elements:**
- **Summary Card**: Total deductions found, transaction count, estimated tax savings
- **Category Breakdown**: Horizontal bar chart showing deductions by IRS category with dollar amounts
- **Missed Deduction Alert Cards**: High-visibility cards for deductions the user has not claimed. Each includes potential dollar amount, tax savings estimate, action buttons
- **Deduction Explanation Popover**: Clicking "Learn More" opens a detailed explanation with IRS code reference, documentation requirements, limitations, and examples
- **Deductible Transaction List**: Scrollable list of all transactions marked as deductible, sorted by amount. Each shows the AI's reasoning for why it qualifies

---

## Screen 5: Strategy Center

Proactive recommendations ranked by savings impact.

```
+----------------------------------------------------------------+
| SIDEBAR |                 STRATEGY CENTER                       |
|         |                                                       |
|         |  Potential Annual Savings: $14,720                    |
|         |  Strategies Implemented: 2 of 7                       |
|         |                                                       |
|         |  [All] [Critical] [High] [Medium] [Implemented]       |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  | [CRITICAL]  S-CORP ELECTION                      |  |
|         |  | Estimated Savings: $8,400/year                   |  |
|         |  |                                                  |  |
|         |  | Based on your $120K net income, electing S-Corp  |  |
|         |  | status could save $8,400/year in self-employment |  |
|         |  | tax by paying yourself a reasonable salary of    |  |
|         |  | $65,000 and taking $55,000 as distributions.     |  |
|         |  |                                                  |  |
|         |  | Deadline: Can file Form 2553 by Mar 15           |  |
|         |  | Complexity: High (requires payroll setup)         |  |
|         |  |                                                  |  |
|         |  | [View Full Analysis] [Start Implementation]      |  |
|         |  | [Dismiss]  [Share with CPA]                      |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  | [HIGH]  SEP IRA CONTRIBUTION                     |  |
|         |  | Estimated Savings: $2,100                        |  |
|         |  |                                                  |  |
|         |  | You can contribute up to $13,800 to a SEP IRA   |  |
|         |  | (25% of net SE income). A $7,500 contribution    |  |
|         |  | would save ~$2,100 in taxes.                     |  |
|         |  |                                                  |  |
|         |  | Deadline: Tax filing deadline (Apr 15 or ext)    |  |
|         |  | Complexity: Low (open account + contribute)       |  |
|         |  |                                                  |  |
|         |  | [View Details] [Mark as Implemented]             |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  | [MEDIUM]  EQUIPMENT PURCHASE TIMING              |  |
|         |  | Estimated Savings: $1,800                        |  |
|         |  |                                                  |  |
|         |  | You mentioned needing a new MacBook. Purchasing  |  |
|         |  | before Dec 31 qualifies for Section 179          |  |
|         |  | immediate expensing, saving ~$1,800 in taxes.    |  |
|         |  |                                                  |  |
|         |  | [View Details] [Mark as Implemented] [Dismiss]   |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**UI Elements:**
- **Total Savings Summary**: Aggregate potential savings across all strategies
- **Progress Indicator**: X of Y strategies implemented
- **Priority Filter Tabs**: All, Critical, High, Medium, Implemented
- **Strategy Card**: Priority badge (color-coded), title, savings estimate (large, bold, gold color), plain-English explanation, deadline (if applicable), complexity rating, action buttons
- **Full Analysis View**: Expands to show detailed breakdown, IRS references, implementation steps, trade-offs, and requirements

---

## Screen 6: Quarterly Estimator

Payment calculator with deadline tracking and payment history.

```
+----------------------------------------------------------------+
| SIDEBAR |              QUARTERLY ESTIMATES                      |
|         |                                                       |
|         |  Tax Year: [2025 v]                                   |
|         |                                                       |
|         |  +------------------------------------------------+  |
|         |  |    Q1          Q2          Q3          Q4       |  |
|         |  |  Apr 15      Jun 15      Sep 15      Jan 15    |  |
|         |  |                                                  |  |
|         |  |  $3,100      $3,212      $3,450      TBD       |  |
|         |  |  [PAID]      [PAID]      [47 DAYS]   [--]      |  |
|         |  |  Apr 12      Jun 10       -------    ------    |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  NEXT PAYMENT DUE                                    |
|         |  +------------------------------------------------+  |
|         |  |                                                  |  |
|         |  |  Q3 Estimated Payment                            |  |
|         |  |  Due: September 15, 2025                         |  |
|         |  |                                                  |  |
|         |  |       $3,450                                     |  |
|         |  |       (47 days remaining)                        |  |
|         |  |                                                  |  |
|         |  |  How this was calculated:                         |  |
|         |  |  YTD Income (Q1-Q2):     $58,200                 |  |
|         |  |  Projected Annual:       $116,400                |  |
|         |  |  Total Est. Tax:         $29,240                 |  |
|         |  |  Already Paid:           $6,312                  |  |
|         |  |  Remaining (Q3+Q4):      $22,928                |  |
|         |  |  Q3 Payment:             $3,450                  |  |
|         |  |                                                  |  |
|         |  |  Method: [Safe Harbor v]                         |  |
|         |  |  ( ) 100% of prior year                          |  |
|         |  |  (x) 90% of current year                         |  |
|         |  |  ( ) Annualized installment                      |  |
|         |  |                                                  |  |
|         |  |  [Record Payment Made]                           |  |
|         |  |  [Add to Calendar]                               |  |
|         |  |  [View IRS EFTPS Guide]                          |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  PAYMENT HISTORY                                     |
|         |  +------------------------------------------------+  |
|         |  | Q1 2025  | $3,100  | Paid Apr 12 | On time     |  |
|         |  | Q2 2025  | $3,212  | Paid Jun 10 | On time     |  |
|         |  | Q4 2024  | $2,800  | Paid Jan 12 | On time     |  |
|         |  | Q3 2024  | $2,650  | Paid Sep 14 | On time     |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**UI Elements:**
- **Quarter Timeline**: Visual timeline showing all 4 quarters with status (Paid, Upcoming, Overdue)
- **Next Payment Card**: Large display of upcoming payment amount, due date, countdown, calculation breakdown
- **Method Selector**: Radio buttons for different calculation methods with explanations
- **Record Payment**: Modal to log a payment (amount, date, confirmation number)
- **Payment History Table**: Sortable list of all past payments with status

---

## Screen 7: Reports

Financial reports and exports.

```
+----------------------------------------------------------------+
| SIDEBAR |                    REPORTS                            |
|         |                                                       |
|         |  [Profit & Loss] [Tax Summary] [Expenses] [Custom]   |
|         |                                                       |
|         |  Date Range: [Jan 1, 2025] to [Jul 23, 2025]         |
|         |                                                       |
|         |  PROFIT & LOSS STATEMENT                              |
|         |  +------------------------------------------------+  |
|         |  |                                                  |  |
|         |  | INCOME                                           |  |
|         |  |   Freelance Income              $87,400.00      |  |
|         |  |   Other Income                   $1,200.00      |  |
|         |  |                          -----------------       |  |
|         |  |   Total Income                  $88,600.00      |  |
|         |  |                                                  |  |
|         |  | EXPENSES                                         |  |
|         |  |   Software & Subscriptions       $2,340.00      |  |
|         |  |   Home Office                    $1,200.00      |  |
|         |  |   Rent / Coworking               $3,150.00      |  |
|         |  |   Meals & Entertainment            $400.00      |  |
|         |  |   Professional Development         $478.00      |  |
|         |  |   Travel                         $1,850.00      |  |
|         |  |   Insurance                      $2,400.00      |  |
|         |  |   Contract Labor                 $8,500.00      |  |
|         |  |   Other Expenses                 $1,280.00      |  |
|         |  |                          -----------------       |  |
|         |  |   Total Expenses                $21,598.00      |  |
|         |  |                                                  |  |
|         |  | NET PROFIT                      $67,002.00      |  |
|         |  |                                                  |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  [Export PDF] [Export CSV] [Export Excel]              |
|         |  [Schedule Report] [Share with CPA]                   |
+----------------------------------------------------------------+
```

**Report Types:**
- **Profit & Loss**: Income and expenses summary, monthly/quarterly/annual
- **Tax Summary**: Tax liability breakdown, payments made, remaining balance, deductions claimed
- **Expense Breakdown**: Pie/bar chart of expenses by category, with drill-down to individual transactions
- **Custom Report**: User selects which data points to include, date range, format

---

## Screen 8: Entity Analyzer (Post-MVP)

Side-by-side comparison of business entity types.

```
+----------------------------------------------------------------+
| SIDEBAR |               ENTITY ANALYZER                         |
|         |                                                       |
|         |  Based on your $120,000 net income:                   |
|         |                                                       |
|         |  +-------------+-------------+-------------+          |
|         |  | SOLE PROP   | LLC         | S-CORP      |          |
|         |  | (current)   |             | (recommended)|         |
|         |  +-------------+-------------+-------------+          |
|         |  | Income Tax  | Income Tax  | Income Tax  |          |
|         |  | $22,400     | $22,400     | $22,400     |          |
|         |  +-------------+-------------+-------------+          |
|         |  | SE Tax      | SE Tax      | SE Tax      |          |
|         |  | $16,956     | $16,956     | $9,180      |          |
|         |  +-------------+-------------+-------------+          |
|         |  | Payroll Tax | --          | $4,972      |          |
|         |  +-------------+-------------+-------------+          |
|         |  | State Filing| $800/yr     | $800/yr     |          |
|         |  +-------------+-------------+-------------+          |
|         |  | Compliance  | --          | $2,000/yr   |          |
|         |  | Costs       |             |             |          |
|         |  +-------------+-------------+-------------+          |
|         |  | TOTAL TAX   | TOTAL TAX   | TOTAL TAX   |          |
|         |  | $39,356     | $40,156     | $39,352     |          |
|         |  +-------------+-------------+-------------+          |
|         |  |             |             |             |          |
|         |  | Annual      | Annual      | ANNUAL      |          |
|         |  | Savings: -- | Savings:    | SAVINGS:    |          |
|         |  |             | -$800       | $8,400*     |          |
|         |  +-------------+-------------+-------------+          |
|         |                                                       |
|         |  * Net of compliance costs ($2,000/yr payroll,        |
|         |    tax prep, registered agent)                         |
|         |                                                       |
|         |  [View Detailed Breakdown]                            |
|         |  [How to Elect S-Corp Status]                          |
|         |  [Share This Analysis with CPA]                       |
+----------------------------------------------------------------+
```

---

## Screen 9: Settings

Account management, connected accounts, preferences, and security.

```
+----------------------------------------------------------------+
| SIDEBAR |                    SETTINGS                           |
|         |                                                       |
|         |  [Profile] [Accounts] [Categories] [Notifications]    |
|         |  [Security] [Billing] [Data]                          |
|         |                                                       |
|         |  PROFILE                                              |
|         |  +------------------------------------------------+  |
|         |  | Name:           [Soumya Debnath         ]        |  |
|         |  | Email:          [soumya@example.com     ]        |  |
|         |  | Business Type:  [Freelance/Consulting   v]       |  |
|         |  | Entity:         [Sole Proprietor        v]       |  |
|         |  | Filing Status:  [Single                 v]       |  |
|         |  | State:          [California             v]       |  |
|         |  | Industry:       [Software Development   v]       |  |
|         |  |                                                  |  |
|         |  | [Save Changes]                                   |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  CONNECTED ACCOUNTS                                  |
|         |  +------------------------------------------------+  |
|         |  | [Chase Logo] Chase Business Checking             |  |
|         |  | **** 4521 | Connected | Last sync: 2 min ago     |  |
|         |  | [Reconnect] [Remove]                             |  |
|         |  +------------------------------------------------+  |
|         |  | [Amex Logo] American Express Gold                |  |
|         |  | **** 1234 | Connected | Last sync: 5 min ago     |  |
|         |  | [Reconnect] [Remove]                             |  |
|         |  +------------------------------------------------+  |
|         |  | [+] Connect Another Account                      |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  SECURITY                                            |
|         |  +------------------------------------------------+  |
|         |  | Two-Factor Authentication:  [Enabled]            |  |
|         |  | Biometric Unlock:           [Enabled]            |  |
|         |  | Change Password             [Change]             |  |
|         |  | Active Sessions             [View]               |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**Sub-tabs:**
- **Profile**: Personal and business information
- **Accounts**: Connected bank accounts with status and management
- **Categories**: Custom category rules (always categorize X as Y)
- **Notifications**: Toggle deadline reminders, strategy alerts, weekly summaries
- **Security**: MFA, biometric, password, sessions
- **Billing**: Current plan, upgrade/downgrade, payment history
- **Data**: Export all data, delete account, privacy controls

---

## Screen 10: CPA Portal (Post-MVP)

Secure sharing with accountants and tax professionals.

```
+----------------------------------------------------------------+
| SIDEBAR |                    CPA PORTAL                         |
|         |                                                       |
|         |  Share your financial data securely with your CPA.    |
|         |                                                       |
|         |  ACTIVE SHARES                                       |
|         |  +------------------------------------------------+  |
|         |  | Sarah Johnson, CPA                               |  |
|         |  | sarah@taxfirm.com                                |  |
|         |  | Access: Read-only | Expires: Dec 31, 2025        |  |
|         |  | Last accessed: Jul 20, 2025                       |  |
|         |  |                                                  |  |
|         |  | Shared data:                                      |  |
|         |  | [x] Transactions  [x] Categories  [x] Reports   |  |
|         |  | [x] Strategies    [ ] Bank balances               |  |
|         |  |                                                  |  |
|         |  | [Revoke Access] [Extend] [View Activity Log]     |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  [+ Invite CPA]                                      |
|         |  [Generate Tax Package Export]                        |
+----------------------------------------------------------------+
```

---

## Screen 11: Notification Center

Central hub for all alerts, reminders, and updates.

```
+----------------------------------------------------------------+
| SIDEBAR |                 NOTIFICATIONS                         |
|         |                                                       |
|         |  [All] [Deadlines] [Strategies] [Transactions]        |
|         |                                                       |
|         |  TODAY                                                |
|         |  +------------------------------------------------+  |
|         |  | [!] New strategy available                       |  |
|         |  | S-Corp election could save you $8,400/year      |  |
|         |  | [View Strategy]                     2 hours ago  |  |
|         |  +------------------------------------------------+  |
|         |  | [i] 12 new transactions categorized              |  |
|         |  | 2 need your review                               |  |
|         |  | [Review Transactions]              4 hours ago  |  |
|         |  +------------------------------------------------+  |
|         |                                                       |
|         |  THIS WEEK                                            |
|         |  +------------------------------------------------+  |
|         |  | [$] Deduction found: Home office                 |  |
|         |  | Potential savings: $1,500/year                   |  |
|         |  | [Claim Deduction]                  2 days ago    |  |
|         |  +------------------------------------------------+  |
|         |  | [calendar] Q3 estimated tax due in 47 days       |  |
|         |  | Amount: $3,450                                   |  |
|         |  | [View Details]                     3 days ago    |  |
|         |  +------------------------------------------------+  |
+----------------------------------------------------------------+
```

**Notification Types:**
- **Deadline Alerts**: Quarterly payment due dates (2 weeks and 3 days before)
- **Strategy Notifications**: New strategies identified, strategy deadline approaching
- **Transaction Alerts**: New transactions categorized, items needing review, large transactions
- **Deduction Alerts**: New deductions discovered, missed deduction opportunities
- **System Notifications**: Sync status, account connection issues, app updates
- **Weekly Summary**: Email digest of activity, savings found, upcoming deadlines

---

## Global UI Elements

### Top Bar
- App title (left)
- Sync status indicator ("Last synced 2 min ago" or "Syncing...")
- Notification bell with unread count badge
- User avatar with dropdown (Profile, Billing, Sign Out)

### Status Bar (Bottom)
- Number of connected accounts
- Current plan tier
- Last sync timestamp
- Version number

### Empty States
Every screen has a designed empty state:
- Dashboard (no accounts): "Connect your first bank account to start saving on taxes"
- Transactions (no data): "Transactions will appear here once your accounts sync"
- Deductions (none found): "We're analyzing your transactions -- deductions will appear soon"
- Strategies (none yet): "Strategies are generated based on your financial data -- check back in 24 hours"

### Loading States
- Skeleton screens with pulsing animation matching the layout structure
- No spinners (skeletons feel faster and provide layout context)
- Progressive loading (show cached data immediately, update with fresh data)

### Error States
- Friendly error messages with action buttons
- "Something went wrong" with retry button
- Account-specific errors with reconnect CTA
- Network offline indicator with cached data notice

### Accessibility Requirements
- WCAG 2.1 AA compliance
- All financial figures readable by screen readers with proper formatting
- Keyboard navigation for all interactive elements
- Focus indicators visible on all interactive components
- Color is never the only indicator of status (icons + labels accompany colors)
- Minimum touch target: 44x44px for all clickable elements
- Reduced motion mode respects `prefers-reduced-motion`
- High contrast theme available
- All charts have accessible data table alternatives
