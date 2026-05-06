# InvoiceAI — Skills Required

## Overview

Building InvoiceAI requires a blend of full-stack web development, financial domain expertise, AI/ML integration, and freelancer-focused product design. This document catalogs every skill needed across technical, domain, design, and business dimensions.

---

## Technical Skills

### Frontend Development

#### Next.js 14 (App Router)
- **Server Components vs Client Components:** Understanding when to use each — server components for invoice rendering (read-only), client components for interactive forms
- **Server Actions:** Form mutations (create invoice, update client, send invoice) without API routes
- **Dynamic Routes:** `/invoices/[id]`, `/pay/[invoiceId]`, `/clients/[id]`
- **Route Groups:** Separating authenticated dashboard `(dashboard)` from public portal `(portal)`
- **Streaming & Suspense:** Progressive loading for dashboard widgets (charts load after stats cards)
- **Metadata API:** Dynamic SEO for client portal pages (invoice title, description)
- **Middleware:** Auth checks, rate limiting, redirect logic
- **Image Optimization:** Logo uploads with `next/image` — resizing, format conversion
- **Static vs Dynamic Rendering:** Understanding ISR for public pages, dynamic for dashboard

**Resources:**
- Next.js official docs (nextjs.org/docs)
- Vercel's App Router migration guide
- Lee Robinson's Next.js tutorials

#### React 18
- **Hooks:** useState, useEffect, useCallback, useMemo, useRef for form state
- **Custom Hooks:** useInvoice, useClient, usePaymentPrediction, useCashFlow
- **Context:** Theme provider, auth context, toast notification context
- **Suspense boundaries:** Granular loading states per dashboard widget
- **Error boundaries:** Graceful failure handling for individual components
- **Optimistic updates:** Mark invoice as paid immediately, revert if API fails
- **Controlled forms:** Complex invoice creation form with dynamic line items

#### TypeScript
- **Strict mode:** Full type safety across the codebase
- **Type definitions:** Invoice, Client, Payment, FollowUp, LineItem interfaces
- **Generics:** Reusable form components, API response wrappers
- **Discriminated unions:** Invoice status types (`draft | sent | viewed | paid | overdue`)
- **Zod schemas:** Runtime validation for API inputs and form data
- **Type-safe database queries:** Supabase generates TypeScript types from PostgreSQL schema

```typescript
// Example type definitions
interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  predictionScore?: number;
  paidAt?: string;
  paidAmount?: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
```

#### Tailwind CSS
- **Custom theme configuration:** Brand colors, status colors, font families
- **Responsive design:** Mobile-first, breakpoints for tablet and desktop
- **Print styles:** Invoice templates must look perfect when printed (`@media print`)
- **Animation:** Subtle transitions for status changes, toast notifications
- **Dark mode:** Class-based dark mode toggle with proper color mappings
- **Component variants:** Using `cva` (class-variance-authority) for button variants, status pills

#### State Management
- **Zustand:** Lightweight client-side store for UI state, form wizards
- **SWR / React Query:** Data fetching with caching, revalidation, optimistic updates
- **URL State (nuqs):** Filters, pagination, sort order stored in URL search params
- **Server-side state:** Data fetched in server components, no client state needed

---

### Backend Development

#### Supabase
- **PostgreSQL:** Complex queries for financial reporting, aggregations, joins
- **Row Level Security (RLS):** Multi-tenant data isolation — critical for invoicing
- **Auth:** Email/password, Google OAuth, magic link sign-in
- **Edge Functions (Deno):** Scheduled tasks, webhook handlers, AI integrations
- **Realtime:** Live invoice status updates (client viewed, payment received)
- **Storage:** Logo uploads, receipt images, generated PDF files
- **Database migrations:** Version-controlled schema changes via Supabase CLI
- **Database functions:** PostgreSQL functions for complex calculations (revenue totals, payment speed)
- **Triggers:** Auto-update invoice status, recalculate client health scores

```sql
-- Example: PostgreSQL function for revenue reporting
CREATE OR REPLACE FUNCTION get_revenue_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_revenue DECIMAL,
  total_outstanding DECIMAL,
  total_overdue DECIMAL,
  avg_days_to_pay REAL,
  invoice_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status IN ('sent','viewed') THEN total ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0),
    AVG(EXTRACT(EPOCH FROM (paid_at - sent_at)) / 86400)::REAL,
    COUNT(*)::INTEGER
  FROM invoices
  WHERE user_id = p_user_id
    AND issue_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Stripe API
- **Stripe Connect (Standard):** Onboarding freelancers as connected accounts
- **Payment Intents:** Processing client payments (credit card)
- **Checkout Sessions:** Subscription billing for InvoiceAI itself
- **Webhooks:** `payment_intent.succeeded`, `invoice.paid`, `customer.subscription.*`
- **Stripe Elements:** Secure, PCI-compliant card input on client portal
- **Idempotency:** Preventing duplicate payment processing
- **Dispute handling:** Processing chargebacks and notifications
- **Refunds:** Partial and full refund processing
- **Stripe Tax:** Automatic tax calculation (post-MVP)

#### Plaid API
- **Auth product:** Bank account verification for ACH payments
- **Plaid Link:** Client-side component for bank account connection
- **Token exchange:** Public token to access token flow
- **Account verification:** Micro-deposits or instant verification
- **Error handling:** Institutional errors, credential changes

#### PDF Generation (React-PDF)
- **@react-pdf/renderer:** React components that render to PDF
- **Custom fonts:** Loading Plus Jakarta Sans, Inter, DM Mono for PDF
- **Dynamic content:** Line items, totals, logos, conditional sections
- **Page breaks:** Handling invoices with many line items
- **Streaming:** Generate PDF on-the-fly without storing large files
- **Print optimization:** CMYK considerations, proper margins, bleed areas

```tsx
// Example React-PDF invoice component
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const InvoicePDF = ({ invoice, business, client }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {business.logoUrl && <Image src={business.logoUrl} style={styles.logo} />}
        <Text style={styles.businessName}>{business.name}</Text>
      </View>
      <View style={styles.lineItems}>
        {invoice.lineItems.map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.total}>
        <Text>Total: ${invoice.total.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);
```

#### Email Sending (SendGrid)
- **Transactional API:** Sending individual invoice emails, receipts, reminders
- **Dynamic templates:** Branded emails with merge fields (client name, amount, link)
- **Scheduled sending:** Queue emails for optimal send time
- **Event webhooks:** Open tracking, click tracking, bounce handling
- **Suppression management:** Respecting unsubscribes, handling bounces
- **Email authentication:** SPF, DKIM, DMARC for deliverability

#### Cron Jobs / Scheduled Tasks
- **Vercel Cron:** Triggering scheduled functions (daily reminders, weekly forecasts)
- **Supabase Edge Functions:** Executing the actual scheduled logic
- **Job queuing:** Handling thousands of scheduled reminders without timeouts
- **Idempotency:** Ensuring reminders are not sent twice if cron runs again
- **Timezone handling:** Sending reminders during client's business hours
- **Error recovery:** Retrying failed sends, alerting on persistent failures

---

### AI / ML Integration

#### OpenAI API
- **Structured outputs:** JSON mode for invoice line item extraction
- **System prompts:** Designing effective prompts for invoice drafting, follow-up messages
- **Token optimization:** Minimizing cost by using GPT-4o-mini where quality allows
- **Streaming responses:** Real-time AI generation feedback in the UI
- **Error handling:** Rate limits, timeouts, fallback to manual entry
- **Prompt engineering:** Iterative improvement of invoice drafting accuracy

**Key AI Skills:**
- Designing system prompts that consistently produce formatted invoice data
- Building few-shot examples for edge cases (international clients, mixed currencies)
- Implementing confidence scoring for payment predictions
- Creating escalating tone templates for follow-up sequences
- Cash flow forecasting with multi-variable inputs

#### Payment Prediction Model
- **Feature engineering:** Extracting predictive features from payment history
- **Model design:** Classification (on-time vs late) + regression (days to pay)
- **Training pipeline:** Batch processing of historical payment data
- **Evaluation metrics:** Precision, recall, F1 for late payment prediction
- **Continuous learning:** Model improves as more payment data is collected
- **Explainability:** Showing users why a prediction was made (feature importance)

---

### Testing

#### Vitest
- **Unit tests:** Invoice calculation functions, tax calculations, date utilities
- **Mock testing:** Mocking Stripe API, OpenAI API, Supabase client
- **Snapshot tests:** Invoice PDF output, email template rendering
- **Coverage targets:** 80%+ for business logic, 60%+ overall

#### Playwright
- **E2E flows:** Full invoice creation, sending, and payment flow
- **Multi-browser:** Chrome, Firefox, Safari compatibility
- **Visual regression:** Invoice template rendering consistency
- **API mocking:** Mock Stripe/Plaid for payment flow tests
- **Accessibility testing:** Automated a11y checks via axe-core

#### React Testing Library
- **Component tests:** Invoice form, client selector, status pills
- **User interaction:** Simulating form input, button clicks, keyboard navigation
- **Async operations:** Testing loading states, API responses, error handling

---

## Domain Skills

### Freelance Business Operations
- Understanding the freelancer invoicing workflow (describe work -> create invoice -> send -> follow up -> get paid)
- Common billing models: hourly, project-based, retainer, milestone
- Client relationship management in freelancing
- The psychology of payment — why clients pay late and how to prevent it
- Freelancer pain points: cash flow uncertainty, awkward payment conversations, admin overhead

### Accounts Receivable Best Practices
- Invoice lifecycle: draft -> sent -> viewed -> paid/overdue
- Aging schedules: current, 1-30 days, 31-60 days, 61-90 days, 90+ days
- Collections escalation: friendly reminder -> formal notice -> demand letter -> collections agency
- Write-off policies: when to stop pursuing a payment
- Partial payment handling and credit memos
- Deductions and disputes resolution

### Payment Terms
- **Net 15 / Net 30 / Net 60:** Standard terms and when to use each
- **Due on Receipt:** For small or one-time clients
- **2/10 Net 30:** Early payment discounts (2% discount if paid within 10 days)
- **Progress billing:** For large projects, invoice at milestones
- **Retainer terms:** Monthly recurring with specific scope
- **Late fees:** Typical rates (1.5%/month), legal considerations

### Invoice Legal Requirements
- **United States:** No federal invoicing law, but state-specific requirements:
  - Business name and address
  - Client name and address
  - Invoice number (sequential)
  - Date of issue and due date
  - Description of services
  - Amount due
  - Payment terms
- **International considerations:**
  - EU: VAT number, VAT rate and amount, reverse charge mechanism
  - UK: Company registration number, VAT if registered
  - Canada: GST/HST number, provincial tax
  - Australia: ABN, GST if registered
- **Tax implications:** Sales tax on services varies by state and service type

### Collections Processes
- **Best practices for freelancer collections:**
  1. Friendly reminder (1-3 days overdue)
  2. Firm follow-up (7-14 days overdue)
  3. Final notice (30 days overdue)
  4. Payment plan offer (45 days overdue)
  5. Collections agency referral (90+ days overdue)
  6. Small claims court (last resort)
- **Tone escalation:** How to maintain professionalism while being firm
- **Legal limitations:** Fair Debt Collection Practices Act (FDCPA) basics
- **When to write off:** Cost-benefit of continued pursuit

### Cash Flow Management
- **Freelancer cash flow challenges:** Irregular income, seasonal variation, client concentration risk
- **Cash flow forecasting methods:** Historical averaging, weighted moving average, regression
- **Cash flow optimization:** Invoice timing, payment term negotiation, deposit requirements
- **Emergency reserves:** Recommended 3-6 months of expenses for freelancers

### Sales Tax Basics
- **Nexus rules:** When a freelancer must collect sales tax
- **Services vs products:** Different tax treatment in different states
- **Tax-exempt clients:** Handling tax-exempt certificates
- **Multi-state freelancing:** Tax obligations when clients are in different states
- **International tax:** VAT, GST, and reverse charge mechanisms

---

## Design Skills

### Financial Document Design

#### Invoice Template Design
- **Visual hierarchy:** Business info -> Client info -> Line items -> Total (most important)
- **Typography for numbers:** Tabular lining figures, right-aligned, decimal-aligned
- **White space:** Generous margins, clear section separation
- **Status indicators:** Color-coded stamps (PAID, OVERDUE, DRAFT)
- **Print optimization:** A4 and Letter size support, proper margins (0.75" minimum)
- **Logo placement:** Top-left or top-center, consistent sizing
- **Color restraint:** Professional invoices use minimal color — brand accent + neutral

#### Design Principles for Invoices
- Clean and uncluttered — the client should find the total and payment method instantly
- Professional but not generic — subtle branding without being distracting
- Scannable — bold labels, clear sections, adequate spacing
- Print-friendly — avoid large color blocks that waste ink
- Accessible — sufficient contrast, readable font sizes (minimum 10pt for body)

### Dashboard UX
- **Information density:** Show key metrics without overwhelming
- **Progressive disclosure:** Summary cards -> detailed charts -> raw data
- **Action-oriented:** Every data point links to an actionable next step
- **Time-series visualization:** Revenue trends, payment speed, cash flow
- **Status at a glance:** Color coding that conveys urgency without alarming

### Email Template Design
- **Mobile-first:** 600px max width, single column
- **Clear CTA:** One primary action button ("Pay Now" or "View Invoice")
- **Branded header:** Business logo and name
- **Invoice summary:** Key details (amount, due date) visible without scrolling
- **Trust elements:** Payment security badges, company address, unsubscribe link
- **Plain text fallback:** For email clients that block HTML

### Client Portal Design
- **Trust-building UI:**
  - SSL lock icon visible
  - "Payments processed by Stripe" badge
  - Professional, clean design (not cluttered or spammy)
  - Business branding (logo, colors) for recognition
  - Clear contact information for the freelancer
- **Payment flow:** Minimal steps (view invoice -> select payment method -> pay)
- **Mobile optimization:** 60%+ of clients will view on mobile
- **Error handling:** Clear, non-technical error messages for payment failures
- **Confirmation:** Satisfying success state with receipt download

### Accessibility Design
- **WCAG 2.1 AA compliance** across all screens
- **Color contrast:** 4.5:1 minimum for normal text, 3:1 for large text
- **Focus indicators:** Visible focus rings on all interactive elements
- **Screen reader support:** Proper ARIA labels, live regions for dynamic content
- **Keyboard navigation:** Full keyboard operability without mouse
- **Reduced motion:** Respect `prefers-reduced-motion` for animations
- **Form accessibility:** Labels, error messages, and instructions linked to inputs

---

## Business Skills

### Freelancer Community Marketing
- **Understanding the audience:** Where freelancers spend time online
  - Reddit: r/freelance, r/design_critiques, r/webdev, r/copywriting
  - Facebook Groups: Freelance Writers Den, UI/UX Design Community
  - Twitter/X: #freelance, #freelancing, design and dev communities
  - Slack communities: Design Buddies, Indie Hackers
  - Discord servers: Developer and design communities
- **Content marketing:** Blog posts targeting freelancer pain points
  - "How to get paid faster as a freelancer"
  - "Invoice template free download" (lead magnet)
  - "Late payment email templates" (SEO + value)
  - "Freelance cash flow management guide"
- **SEO keywords:**
  - "free invoice template" (90K monthly searches)
  - "freelance invoicing" (8K monthly searches)
  - "invoice generator free" (40K monthly searches)
  - "how to invoice clients" (5K monthly searches)
  - "late payment reminder email" (3K monthly searches)

### Accounting Tool Partnerships
- **QuickBooks Online:** Integration partnership for two-way sync
- **Xero:** Similar integration opportunity
- **Wave:** Competitive but potential data migration path
- **Bench:** Bookkeeping service partnership (refer clients who need more)
- **Tax software:** TurboTax, H&R Block integration for year-end data export

### Payment Processor Relationships
- **Stripe:** Primary payment processor, potential for volume discounts
- **Plaid:** Banking data for ACH payments, potential preferred pricing
- **Wise:** International payments with better FX rates
- **PayPal:** Alternative payment option for clients who prefer it
- **Square:** Potential future integration for in-person invoicing

### Affiliate / Referral Programs
- **User referral program:** Give $10, get $10 credit when referred user subscribes
- **Affiliate partnerships:**
  - Freelance platforms (Upwork, Toptal, Fiverr) — partner or advertise
  - Online course creators (freelancing courses) — affiliate commission
  - Freelance coaches and communities — bulk licensing
- **Co-marketing:** Joint webinars with accounting tools, freelance platforms
- **Product Hunt launch:** Coordinate for maximum visibility

### Regulatory & Compliance
- **PCI DSS compliance:** Stripe handles card data, but understand the requirements
- **GDPR:** If serving EU freelancers, data handling and privacy requirements
- **SOC 2:** Eventually needed for enterprise/agency customers
- **Money transmission:** Understanding if invoice financing requires special licensing
- **Data retention:** How long to keep financial records (7 years standard)

---

## Unique / Specialized Skills

### Invoice Financing Knowledge
- **Factoring vs invoice financing:** Understanding the difference
- **Risk assessment:** Evaluating which invoices are safe to advance
- **Regulatory requirements:** Money transmission licenses, lending regulations
- **Partnership models:** Working with fintech lenders vs building in-house
- **Pricing models:** Discount rates, fee structures, advance percentages

### AI Prompt Engineering for Finance
- **Structured output design:** Ensuring AI returns consistent, parseable invoice data
- **Financial accuracy:** Preventing AI from making math errors (always verify calculations)
- **Tone calibration:** Follow-up messages that are firm but professional
- **Context window management:** Efficient use of tokens for payment prediction
- **Safety and compliance:** Preventing AI from generating legally problematic content

### Payment Psychology
- **Optimal send timing:** Research shows Tuesday 10am gets fastest payments
- **Invoice design impact:** Professional invoices are paid 2x faster than informal ones
- **Payment friction reduction:** Every extra click reduces payment rate by 10%
- **Anchoring effects:** How invoice presentation affects payment speed
- **Social proof:** "Most clients pay within 15 days" messaging

---

## Learning Resources

### Technical

| Resource | Type | Topic |
|---|---|---|
| Next.js Docs (nextjs.org) | Documentation | App Router, Server Components |
| Supabase Docs (supabase.com/docs) | Documentation | PostgreSQL, Auth, Edge Functions |
| Stripe Docs (stripe.com/docs) | Documentation | Payment processing, Connect |
| OpenAI API Docs (platform.openai.com) | Documentation | GPT-4o, structured outputs |
| React-PDF Docs (react-pdf.org) | Documentation | PDF generation |
| Plaid Docs (plaid.com/docs) | Documentation | Banking integrations |
| SendGrid Docs (docs.sendgrid.com) | Documentation | Email API |
| Total TypeScript (totaltypescript.com) | Course | Advanced TypeScript patterns |
| Testing JavaScript (testingjavascript.com) | Course | Testing strategies |

### Domain

| Resource | Type | Topic |
|---|---|---|
| "The Freelancer's Bible" by Sara Horowitz | Book | Freelance business fundamentals |
| Freelancers Union (freelancersunion.org) | Community | Freelancer advocacy, resources |
| FreshBooks Blog | Blog | Invoicing and freelance finance |
| IRS Publication 334 | Guide | Tax guide for small businesses |
| AICPA resources | Professional | Accounting standards |
| "Profit First" by Mike Michalowicz | Book | Cash flow management for small businesses |

### Design

| Resource | Type | Topic |
|---|---|---|
| Refactoring UI | Book/Course | Practical UI design for developers |
| Laws of UX (lawsofux.com) | Reference | UX design principles |
| Stripe's design resources | Case study | Payment form UX best practices |
| Invoice design best practices (Smashing Magazine) | Article | Financial document design |
| WCAG 2.1 guidelines (w3.org) | Standard | Accessibility requirements |

### Business

| Resource | Type | Topic |
|---|---|---|
| "The Mom Test" by Rob Fitzpatrick | Book | Customer interviews |
| Indie Hackers (indiehackers.com) | Community | Solo founder strategies |
| Y Combinator Library | Resource | Startup playbook |
| "Zero to One" by Peter Thiel | Book | Building monopoly businesses |
| Patrick McKenzie's writing (patio11.com) | Blog | SaaS pricing, B2C strategies |

---

## Skill Priority Matrix

| Skill | Priority | Phase Needed | Difficulty |
|---|---|---|---|
| Next.js 14 (App Router) | P0 | MVP | Medium |
| TypeScript | P0 | MVP | Medium |
| Supabase (PostgreSQL + Auth) | P0 | MVP | Medium |
| Stripe API | P0 | MVP | High |
| Tailwind CSS | P0 | MVP | Low |
| React-PDF | P0 | MVP | Medium |
| SendGrid | P0 | MVP | Low |
| OpenAI API | P0 | MVP | Medium |
| Invoice legal requirements | P0 | MVP | Medium |
| Payment terms knowledge | P0 | MVP | Low |
| Invoice template design | P0 | MVP | Medium |
| Plaid API | P1 | MVP | Medium |
| Cron jobs / scheduling | P1 | MVP | Medium |
| AI prompt engineering | P1 | Post-MVP | High |
| Payment prediction ML | P1 | Post-MVP | High |
| Cash flow forecasting | P1 | Post-MVP | High |
| Collections process knowledge | P1 | Post-MVP | Medium |
| SEO / Content marketing | P1 | Launch | Medium |
| Freelancer community marketing | P1 | Launch | Low |
| Accessibility (WCAG 2.1) | P1 | MVP | Medium |
| Playwright E2E testing | P2 | MVP | Medium |
| QuickBooks API | P2 | Year 2 | High |
| Invoice financing | P2 | Year 2 | Very High |
| Regulatory compliance | P2 | Year 2 | High |

---

*Last updated: February 2026*
