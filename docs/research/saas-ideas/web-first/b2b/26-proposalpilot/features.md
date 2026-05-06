# ProposalPilot -- Feature Roadmap

## Roadmap Overview

ProposalPilot's feature development is organized into three phases, each building on the previous to create a compounding product advantage. The MVP focuses on the core loop (generate, edit, send, track), Post-MVP adds intelligence and collaboration, and Year 2+ introduces optimization and automation that creates genuine competitive moats.

---

## Phase 1: MVP (Months 1-6)

### F1.1 AI Proposal Generator

**Description:** The core feature. Users input a client brief (paste text, upload PDF, or fill structured form), select services from their catalog, and ProposalPilot generates a full proposal draft with executive summary, scope of work, approach/methodology, timeline, pricing, terms, and team.

**User Flow:**
1. User clicks "New Proposal" and enters client details (name, company, industry)
2. User pastes or types the client brief / project requirements
3. User selects relevant services from their service catalog
4. User optionally selects a template or lets AI choose the best match
5. AI generates a complete proposal draft (10-20 second generation, streamed)
6. Draft opens in the editor for human review and refinement

**Technical Details:**
- GPT-4o with organization-specific system prompt (agency voice, terminology)
- Structured JSON output mapped to TipTap document nodes
- Streaming response via Server-Sent Events for perceived speed
- Context window includes: brief, service catalog, template, up to 3 similar past proposals
- Fallback to GPT-4o-mini if rate limited or for quick iterations

**Edge Cases:**
- Brief is vague or incomplete: AI returns clarification questions before generating
- Brief is extremely long (RFP document): Pre-processing step extracts key requirements
- Service catalog is empty (new user): AI generates from brief alone with generic structure
- Generation fails mid-stream: Partial draft is saved, user can retry from checkpoint

**Acceptance Criteria:**
- [ ] Generated proposal includes all standard sections (exec summary, scope, timeline, pricing, terms) for 100% of generations
- [ ] Generation completes in under 20 seconds for briefs up to 2,000 words; under 45 seconds for briefs up to 10,000 words
- [ ] Output quality rated 7+/10 by agency professionals in blind user testing (n >= 20 evaluations)
- [ ] Generated pricing tables are editable and mathematically correct (subtotals, tax, total verified server-side)
- [ ] AI returns clarification questions instead of generating when brief completeness score is below 40%
- [ ] Partial drafts are recoverable from checkpoint after mid-stream failure within 5 minutes
- [ ] Organization-scoped: generated proposals inherit the org's voice, terminology, and template defaults
- [ ] All generated content is scoped to the user's organization and inaccessible to other tenants

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| OpenAI API timeout (>30s) | "Generation is taking longer than expected. Retrying..." | Auto-retry 2x with exponential backoff | Switch to GPT-4o-mini for faster generation |
| OpenAI API rate limit (429) | "High demand — your proposal is queued and will generate shortly." | Auto-retry after rate limit reset window | Queue request; notify via in-app toast when complete |
| OpenAI API error (500/503) | "AI service temporarily unavailable. Your brief has been saved." | Auto-retry 3x over 60 seconds | Save brief; allow manual retry; email notification when service recovers |
| Brief is empty or under 10 words | "Please provide more detail in your brief so we can generate an accurate proposal." | N/A — block generation | Redirect to guided brief questionnaire |
| Service catalog empty (new org) | "No services configured yet. We'll generate from your brief with a generic structure." | N/A | Generate without catalog context; prompt to set up catalog post-generation |
| Streaming connection dropped | "Connection interrupted. Your partial draft has been saved." | Auto-reconnect and resume from last chunk | Save partial draft; offer "Continue Generation" button |
| Content safety filter triggered | "Some generated content was flagged for review. Please check highlighted sections." | N/A | Remove flagged sections; insert placeholder with editor prompt |
| Organization context missing | "Please complete your organization setup before generating proposals." | N/A | Redirect to org onboarding wizard |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Client Name | string | Yes | 1/200 chars | `^[a-zA-Z0-9\s\-&.,'']+$` | Trim whitespace, escape HTML entities |
| Client Company | string | Yes | 1/300 chars | `^[a-zA-Z0-9\s\-&.,''()]+$` | Trim whitespace, escape HTML entities |
| Client Industry | enum | No | N/A | Predefined list (50+ industries) | Validate against allowed values |
| Client Brief | text | Yes | 10/50,000 chars | Free text | Strip script tags, sanitize Markdown, preserve line breaks |
| Selected Services | array[uuid] | No | 0/50 items | Valid UUIDs from org catalog | Validate each UUID exists in org scope |
| Template ID | uuid | No | N/A | Valid UUID | Validate exists and belongs to org or is a system template |
| Organization ID | uuid | Yes (auto) | N/A | Valid UUID | Injected server-side from auth session; never from client |
| Project Title | string | No | 0/500 chars | Free text | Trim whitespace, escape HTML entities |
| Valid Until Date | date | No | Today/+365 days | ISO 8601 | Validate is future date within 1 year |

---

### F1.2 Proposal Template Library

**Description:** Pre-built proposal templates organized by industry and service type. Templates include structure, suggested sections, placeholder content, and styling. Users can create custom templates from any completed proposal.

**Template Categories:**
- Web Development Proposal
- Brand Identity / Design Proposal
- Digital Marketing / SEO Proposal
- Management Consulting Proposal
- IT Consulting / Implementation Proposal
- Content Strategy Proposal
- UX Research & Design Proposal
- Staff Augmentation Proposal
- Retainer Agreement
- General Services Proposal

**Features:**
- Browse and preview templates before selection
- "Save as Template" on any completed proposal
- Template variables ({{client.name}}, {{project.title}}, {{valid_until}})
- Template usage tracking (how many proposals created from each)
- Template win rate calculation (proposals won / proposals sent per template)

**Acceptance Criteria:**
- [ ] Users can browse and preview all system templates without creating a proposal (load time < 1s per preview)
- [ ] "Save as Template" creates an org-scoped custom template from any completed proposal in under 3 seconds
- [ ] Template variables (e.g., `{{client.name}}`, `{{project.title}}`) auto-populate correctly in 100% of cases
- [ ] Template usage count and win rate are calculated accurately and updated within 1 hour of proposal status change
- [ ] At least 10 starter templates are available at launch, covering all listed categories
- [ ] Custom templates are visible only to the creating organization (tenant isolation enforced)
- [ ] Templates support versioning — edits create a new version without breaking proposals already using the previous version

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Template load fails (storage error) | "Unable to load template. Please try again." | Auto-retry 2x | Show cached version if available; offer template list |
| "Save as Template" fails | "Could not save template. Your proposal is safe — please try saving as template again." | Manual retry via button | Save template data to local storage for recovery |
| Template variable unresolved | Variable renders as `{{variable_name}}` in preview with yellow highlight | N/A | Prompt user to fill missing variable before sending |
| Template deletion while in use | "This template is used by X active proposals. Are you sure?" | N/A — confirmation dialog | Soft-delete; archive template; existing proposals retain content |
| Win rate calculation timeout | Win rate column shows "--" with tooltip "Calculating..." | Background job retries hourly | Display "Insufficient data" for templates with < 5 proposals |
| Org template limit reached (plan cap) | "You've reached the maximum number of custom templates for your plan. Upgrade for unlimited." | N/A | Show upgrade prompt; allow viewing but not creating new templates |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Template Name | string | Yes | 3/200 chars | `^[a-zA-Z0-9\s\-&.,''()]+$` | Trim whitespace, escape HTML entities |
| Template Category | enum | Yes | N/A | Predefined list (10 categories) | Validate against allowed values |
| Template Description | text | No | 0/1,000 chars | Free text | Strip script tags, sanitize Markdown |
| Template Variables | array[string] | No | 0/50 items | `^{{[a-z_]+(\.[a-z_]+)*}}$` | Validate variable names match schema |
| Template Content | JSON | Yes | 1/5MB | Valid TipTap JSON document | Validate JSON schema, sanitize embedded HTML |
| Organization ID | uuid | Yes (auto) | N/A | Valid UUID | Injected server-side from auth session |
| Is System Template | boolean | No | N/A | true/false | Server-side only; cannot be set by client |

---

### F1.3 Rich Text Editor

**Description:** A full-featured proposal editor built on TipTap with proposal-specific capabilities. Combines the familiarity of a word processor with structured proposal elements.

**Editor Features:**
- **Text formatting**: Headings (H1-H4), bold, italic, underline, strikethrough, text color, highlight
- **Lists**: Bullet, numbered, checklist (for deliverables)
- **Tables**: Standard tables with merge, split, resize
- **Media**: Image upload/embed, video embed (Loom, YouTube), file attachments
- **Proposal elements**: Pricing tables, signature blocks, team member cards, case study embeds, milestone timelines, dynamic variables
- **Layout**: Section breaks with named sections, two-column layouts, callout boxes, dividers
- **Navigation**: Document outline (table of contents), section jumping
- **Actions**: Undo/redo (50 levels), find and replace, word count, reading time estimate

**Editor States:**
- **Editing mode**: Full editing with toolbar and formatting options
- **Commenting mode**: Read-only with ability to add inline comments
- **Preview mode**: Renders exactly as the client will see it
- **Presentation mode**: Full-screen section-by-section walkthrough (for screen-sharing in sales calls)

**Acceptance Criteria:**
- [ ] All listed text formatting options (H1-H4, bold, italic, underline, strikethrough, text color, highlight) function correctly
- [ ] Tables support merge, split, and resize operations with undo/redo support
- [ ] Image upload accepts JPEG, PNG, GIF, WebP up to 10MB; images are org-scoped in storage
- [ ] Undo/redo supports at least 50 levels and persists across browser refreshes within the same session
- [ ] Autosave triggers every 30 seconds or on each significant edit (debounced), with < 500ms save latency
- [ ] Preview mode renders pixel-identical to the client-facing proposal portal
- [ ] Editor loads and becomes interactive within 2 seconds for proposals up to 50 pages
- [ ] All editor content is tenant-isolated — proposals from one org are never accessible by another

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Autosave fails | "Changes could not be saved. Retrying..." (toast notification) | Auto-retry 3x at 5s intervals | Save to local storage; show persistent warning until sync completes |
| Image upload fails (size/type) | "File must be JPEG, PNG, GIF, or WebP and under 10MB." | N/A — validation error | Suggest compressing image; offer link to compression tool |
| Image upload fails (server error) | "Image upload failed. Please try again." | Manual retry | Save image reference locally; retry on next autosave |
| Collaborative edit conflict (Y.js) | No visible error — CRDT auto-merges | N/A — handled by Y.js | Last-write-wins for atomic fields; show merge indicator |
| Editor crashes (unhandled exception) | "The editor encountered an error. Your latest changes have been saved." | Auto-reload editor component | Restore from last autosave checkpoint |
| Paste content contains malicious HTML | Content silently sanitized on paste | N/A | Strip dangerous tags/attributes; preserve safe formatting |
| Video embed URL invalid | "This video URL is not supported. Supported: YouTube, Loom, Vimeo." | N/A — validation error | Show placeholder with manual URL correction prompt |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Document Content | JSON | Yes | 1/20MB | Valid TipTap JSON schema | Sanitize all HTML nodes, strip script/iframe/object tags |
| Image File | binary | No | 1KB/10MB | MIME: image/jpeg, image/png, image/gif, image/webp | Validate MIME type server-side; re-encode to strip EXIF metadata |
| Video Embed URL | url | No | 10/2,048 chars | `^https://(www\.)?(youtube\.com\|youtu\.be\|loom\.com\|vimeo\.com)/` | Validate against allowlist of embed domains |
| Section Title | string | No | 0/500 chars | Free text | Trim whitespace, escape HTML entities |
| Comment Text | text | No | 1/5,000 chars | Free text | Strip script tags, sanitize Markdown, preserve mentions |
| Proposal ID | uuid | Yes (auto) | N/A | Valid UUID | Injected from route params; validated against org ownership |

---

### F1.4 Pricing Table Builder

**Description:** Interactive pricing tables that support multiple pricing models and allow clients to select optional line items.

**Pricing Models:**
- **Fixed price**: Line items with quantity, unit price, subtotal
- **Time & Materials**: Roles with hourly rates, estimated hours, subtotal
- **Retainer**: Monthly fee with included hours, overage rate
- **Value-based**: Outcome tiers with different price points
- **Milestone-based**: Deliverables with payment schedule tied to milestones

**Features:**
- Add/remove/reorder line items via drag-and-drop
- Optional line items (client can toggle in proposal viewer)
- Discount rows (percentage or fixed amount)
- Tax calculation (configurable rate)
- Auto-calculate subtotals, discounts, tax, and grand total
- Multiple currency support (USD, EUR, GBP, CAD, AUD)
- Payment terms section (deposit, milestones, net terms)
- Pricing table summary card (condensed view for executive summary)

**Acceptance Criteria:**
- [ ] All 5 pricing models (fixed, T&M, retainer, value-based, milestone) are functional and independently selectable
- [ ] Auto-calculations (subtotals, discounts, tax, grand total) are mathematically accurate to 2 decimal places
- [ ] Calculations are verified both client-side (instant feedback) and server-side (before send/export)
- [ ] Drag-and-drop reordering works for up to 100 line items with < 100ms visual response
- [ ] Optional line items toggle correctly in the client-facing portal with real-time total recalculation
- [ ] Currency formatting respects the selected currency locale (symbol, decimal separator, thousands separator)
- [ ] Pricing tables render correctly in PDF export with all formatting preserved
- [ ] All pricing data is org-scoped — no cross-tenant data leakage

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Calculation overflow (amount > 999,999,999.99) | "Amount exceeds maximum supported value. Please check your entries." | N/A — validation error | Cap display at max value; log for review |
| Negative total after discounts | "Discount exceeds line item total. Please adjust discount amount." | N/A — validation error | Prevent saving; highlight conflicting discount row |
| Currency API unavailable (for conversion) | "Currency conversion temporarily unavailable. Amounts shown in base currency." | Auto-retry 3x | Display amounts in org's default currency with note |
| Tax rate not configured | "No tax rate configured. Totals shown without tax." | N/A | Display subtotal as total; show "Configure tax" link in settings |
| Line item save fails | "Could not save pricing changes. Retrying..." | Auto-retry 2x | Save to local storage; sync on next successful connection |
| Pricing model switch mid-edit | "Switching pricing models will reset line items. Existing data will be preserved in version history." | N/A — confirmation dialog | Keep previous model data in version history for recovery |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Line Item Description | string | Yes | 1/500 chars | Free text | Trim whitespace, escape HTML entities |
| Quantity | decimal | Yes | 0.01/999,999 | `^\d+(\.\d{1,4})?$` | Parse as decimal; reject non-numeric input |
| Unit Price | decimal | Yes | 0.00/999,999.99 | `^\d+(\.\d{1,2})?$` | Parse as currency; round to 2 decimal places |
| Discount Value | decimal | No | 0/100 (%) or 0/999,999.99 ($) | `^\d+(\.\d{1,2})?$` | Validate does not exceed line subtotal |
| Tax Rate | decimal | No | 0/99.99% | `^\d+(\.\d{1,2})?$` | Validate within range; default to org setting |
| Currency Code | enum | Yes | N/A | ISO 4217 (USD, EUR, GBP, CAD, AUD) | Validate against supported currency list |
| Payment Terms | text | No | 0/2,000 chars | Free text | Strip script tags, sanitize Markdown |
| Pricing Model | enum | Yes | N/A | fixed/time_materials/retainer/value_based/milestone | Validate against allowed values |

---

### F1.5 E-Signature Integration

**Description:** Embedded e-signature capability so clients can sign proposals directly without leaving the proposal viewer.

**Flow:**
1. User adds signature block(s) to the proposal in the editor
2. User sends proposal to client via email
3. Client opens proposal link, reviews content
4. Client clicks "Sign" on the signature block
5. E-signature provider (DocuSign or HelloSign) handles the signing ceremony
6. Signed document is stored and proposal status auto-updates to "Won"

**Features:**
- Multiple signers with order enforcement
- Signature field placement in editor (drag to position)
- Auto-populate signer details from client contact
- Signed PDF generation and storage
- Webhook-triggered status updates (signed, declined)
- Signature audit trail for legal compliance

**Acceptance Criteria:**
- [ ] E-signature flow completes end-to-end (send -> sign -> store) without leaving the proposal viewer
- [ ] Signed PDF is generated and stored within 60 seconds of signature completion
- [ ] Proposal status auto-updates to "Won" within 30 seconds of all required signatures being captured
- [ ] Multiple signers are enforced in the correct order — signer 2 cannot sign before signer 1
- [ ] Signature audit trail captures IP address, timestamp, email, and user agent for legal compliance
- [ ] Fallback to secondary e-signature provider activates automatically if primary provider is down
- [ ] E-signature blocks are org-branded with the agency's logo and colors
- [ ] Webhook-triggered status updates are idempotent — duplicate webhook deliveries do not corrupt state

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| DocuSign API unavailable | "E-signature service temporarily unavailable. Your proposal is saved." | Auto-retry 3x over 5 minutes | Automatic failover to HelloSign; notify org admin |
| HelloSign API unavailable (both down) | "E-signature services are currently down. We'll notify you when signing is available." | Background retry every 15 minutes | Queue signature request; send email notification when restored |
| Signer email bounces | "The email to [signer] could not be delivered. Please verify the email address." | N/A | Prompt user to update signer email; resend |
| Signer declines to sign | "The proposal was declined by [signer name]. Reason: [if provided]." | N/A | Update proposal status to "Declined"; notify proposal owner |
| Webhook delivery fails | No user-facing message (background) | Webhook provider retries per their SLA | Poll signature status every 5 minutes as backup |
| Signed PDF generation fails | "Signed document is being processed. You'll be notified when ready." | Auto-retry 3x | Generate PDF asynchronously; email download link when complete |
| Signature block not placed | "Please add at least one signature block before sending for signature." | N/A — validation error | Highlight signature placement area in editor |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Signer Name | string | Yes | 1/200 chars | `^[a-zA-Z\s\-'']+$` | Trim whitespace, escape HTML entities |
| Signer Email | email | Yes | 5/254 chars | RFC 5322 compliant | Lowercase, trim whitespace, validate MX record |
| Signer Role | enum | Yes | N/A | signer/viewer/approver | Validate against allowed values |
| Signing Order | integer | Yes | 1/20 | `^\d+$` | Validate sequential ordering with no gaps |
| Signature Block Position | object | Yes | N/A | `{x: number, y: number, page: number}` | Validate coordinates within document bounds |
| Proposal ID | uuid | Yes (auto) | N/A | Valid UUID | Validate proposal belongs to org and is in "ready to send" state |
| Organization ID | uuid | Yes (auto) | N/A | Valid UUID | Injected server-side from auth session |

---

### F1.6 Proposal Analytics

**Description:** Track how clients interact with proposals after they are sent. Every view, section read, and engagement metric is captured.

**Metrics Tracked:**
- **Open tracking**: When the proposal was first opened, total opens, unique viewers
- **Section-level engagement**: Time spent on each section, number of views per section
- **Scroll depth**: How far down the client scrolled
- **Download events**: When and how many times PDF was downloaded
- **Share events**: If the client forwarded the proposal link
- **Device info**: Desktop vs mobile vs tablet viewing

**Dashboard Display:**
- Timeline of engagement events
- Engagement heatmap (which sections got the most attention)
- Time-per-section bar chart
- Viewer list (if multiple people from the client org viewed)
- "Hot lead" indicator based on engagement score

**Technical Implementation:**
- Intersection Observer API for section visibility tracking
- Beacon API for reliable event delivery on page close
- Anonymous tracking (no PII stored for viewers)
- 1x1 pixel tracking for email open detection

**Acceptance Criteria:**
- [ ] Proposal open events are captured within 5 seconds of the client opening the proposal link
- [ ] Section-level engagement tracking records time spent per section with 1-second granularity
- [ ] Engagement heatmap correctly identifies the top 3 most-viewed sections with > 95% accuracy
- [ ] Viewer list correctly distinguishes unique viewers by IP + user-agent fingerprint
- [ ] "Hot lead" indicator triggers when engagement score exceeds org-configurable threshold (default: 70/100)
- [ ] Analytics dashboard loads within 2 seconds with up to 1,000 view events per proposal
- [ ] All analytics data is scoped to the org's proposals — no cross-tenant analytics leakage
- [ ] Email open tracking pixel fires reliably across major email clients (Gmail, Outlook, Apple Mail)

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| Tracking event fails to record | No user-facing message (background) | Beacon API retry; queue in local storage | Batch-flush queued events on next successful connection |
| Analytics dashboard query timeout | "Analytics are loading. Large proposals may take a moment." | Auto-retry with increased timeout | Show cached analytics from last successful query |
| Pixel tracking blocked (email client) | No user-facing message | N/A | Rely on proposal link open tracking instead; note "open tracking unavailable" |
| Intersection Observer unsupported (old browser) | No user-facing message | N/A | Fall back to scroll-depth tracking via scroll event listeners |
| High-traffic proposal (1,000+ concurrent viewers) | No user-facing message | N/A | Rate-limit event ingestion per proposal; aggregate in batches |
| Analytics data export fails | "Export failed. Please try again." | Manual retry | Offer CSV download as alternative to PDF report |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Proposal ID | uuid | Yes | N/A | Valid UUID | Validate proposal exists and belongs to requesting org |
| Viewer IP | string | No (auto) | N/A | Valid IPv4/IPv6 | Hash for privacy; do not store raw IP in analytics display |
| Section ID | string | Yes | 1/100 chars | `^[a-zA-Z0-9\-_]+$` | Validate section exists in proposal document |
| Event Type | enum | Yes | N/A | open/section_view/scroll/download/share/email_open | Validate against allowed event types |
| Duration (ms) | integer | Yes | 0/86,400,000 | `^\d+$` | Cap at 24 hours; discard outliers > 1 hour per section |
| User Agent | string | No (auto) | 0/500 chars | Free text | Truncate to 500 chars; parse for device/browser classification only |
| Date Range Filter | date_range | No | N/A | ISO 8601 start/end | Validate start <= end; max range 1 year |

---

### F1.7 PDF & Web Export

**Description:** Proposals can be shared as interactive web links or exported as formatted PDF documents.

**Web Proposal (Primary):**
- Responsive design optimized for all screen sizes
- Fast loading with SSR (< 1.5s LCP)
- Interactive pricing tables (toggle optional items)
- Embedded media (videos play inline)
- E-signature capability
- Engagement tracking enabled
- Custom branding (colors, logo, fonts)
- Password protection option
- Expiration date enforcement

**PDF Export:**
- Professional PDF matching the web proposal design
- Cover page with client name, project title, agency branding
- Table of contents with page numbers
- Pricing tables rendered as static formatted tables
- Attachment support (appendices, portfolio samples)
- Watermark option (DRAFT, CONFIDENTIAL)
- File size optimization for email delivery

**Acceptance Criteria:**
- [ ] Web proposal loads with LCP (Largest Contentful Paint) < 1.5 seconds on 4G connections
- [ ] Web proposal is fully responsive — renders correctly on screens from 320px to 2560px width
- [ ] PDF export produces a file matching the web proposal layout with < 5% visual deviation
- [ ] PDF generation completes within 30 seconds for proposals up to 50 pages; background job for larger
- [ ] PDF file size is optimized to < 15MB for proposals under 30 pages (image compression applied)
- [ ] Password-protected proposals require authentication before any content is visible
- [ ] Expiration date enforcement blocks access with a clear "This proposal has expired" message
- [ ] Custom branding (colors, logo, fonts) renders correctly in both web and PDF formats
- [ ] Share links are org-scoped and revocable by any org admin

**Error Handling Table:**

| Condition | User Message | Retry | Fallback |
|-----------|-------------|-------|----------|
| PDF generation fails | "PDF generation failed. We're retrying automatically." | Auto-retry 2x in background | Email notification when PDF is ready; offer web link as alternative |
| PDF generation timeout (>60s) | "Your proposal is large — PDF is being generated in the background." | Background job continues | Send email with download link when complete |
| Web proposal SSR fails | Client sees loading skeleton | Auto-retry SSR; fall back to CSR | Client-side render with hydration; log SSR failure |
| Custom font fails to load | No user-facing error | Retry font CDN 2x | Fall back to system font stack (sans-serif) |
| Password-protected link accessed without password | "This proposal is password-protected. Please enter the password to continue." | N/A | Show password input form; lock after 5 failed attempts for 15 minutes |
| Expired proposal link accessed | "This proposal expired on [date]. Please contact [agency name] for an updated version." | N/A | Display expiration notice with agency contact info |
| Image in proposal fails to load | Broken image placeholder with "Image unavailable" text | Auto-retry image load 2x | Show placeholder; log missing asset for org admin |

**Data Validation Rules:**

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|-------|------|----------|---------|---------|-------------|
| Share Link Slug | string | Yes (auto-generated) | 8/64 chars | `^[a-zA-Z0-9\-]+$` | Auto-generate cryptographically random slug |
| Password (for protection) | string | No | 6/128 chars | At least 1 letter and 1 number | Hash with bcrypt before storage; never log plaintext |
| Expiration Date | date | No | Today/+365 days | ISO 8601 | Validate is future date; enforce server-side on access |
| Custom Domain | string | No | 4/253 chars | Valid FQDN | Validate DNS CNAME record points to ProposalPilot; verify SSL |
| Watermark Text | string | No | 0/50 chars | `^[a-zA-Z0-9\s]+$` | Trim whitespace; render as semi-transparent overlay |
| Branding Logo | binary | No | 1KB/5MB | MIME: image/png, image/jpeg, image/svg+xml | Validate MIME; resize to max 400x200px; strip EXIF |
| Branding Primary Color | string | No | N/A | `^#[0-9a-fA-F]{6}$` | Validate hex color; apply to CSS variables |

---

### F1.8 Client-Facing Proposal Portal

**Description:** The public-facing interface where clients view, interact with, and sign proposals.

**Portal Features:**
- Clean, distraction-free reading experience
- Table of contents sidebar for navigation
- Interactive pricing (toggle optional line items, see updated totals)
- Comment capability (client can leave questions on specific sections)
- E-signature integration
- "Accept" / "Request Changes" / "Decline" actions
- PDF download option
- Mobile-responsive design
- Agency branding throughout

---

## Phase 2: Post-MVP (Months 7-12)

### F2.1 Win Rate Analytics

**Description:** The intelligence layer that transforms ProposalPilot from a creation tool into a competitive advantage. Analyzes historical proposal data to reveal what wins deals and what loses them.

**Analytics Dimensions:**
- Win rate by template type
- Win rate by pricing model (fixed vs T&M vs retainer vs value-based)
- Win rate by price range (bucketed)
- Win rate by client industry
- Win rate by proposal length (word count)
- Win rate by time-to-send (days from brief to sent)
- Win rate by section engagement (which sections correlate with wins)
- Win rate by team members included
- Average deal size over time
- Conversion funnel (draft -> sent -> viewed -> won)

**Insights Engine:**
- "Proposals with detailed timelines win 34% more often"
- "Clients in healthcare spend 2x more time on compliance sections"
- "Proposals sent within 48 hours of brief have 28% higher win rate"
- "Value-based pricing wins 40% more often than T&M for projects over $50K"

---

### F2.2 SOW Generator

**Description:** Automatically generate detailed Statements of Work from won proposals. SOWs include milestones, deliverables, acceptance criteria, change management processes, and communication plans.

**SOW Sections (Auto-generated):**
- Project overview and objectives
- Scope of work with detailed deliverables
- Project milestones with dates and dependencies
- Acceptance criteria per deliverable
- Roles and responsibilities (RACI matrix)
- Communication plan (meetings, reports, tools)
- Change management process
- Risk register and mitigation
- Payment schedule tied to milestones
- Terms and conditions

**Features:**
- One-click SOW generation from won proposal
- Milestone dependency mapping
- Deliverable checklist with acceptance criteria
- RACI matrix builder
- Change order template generation
- SOW versioning and amendment tracking

---

### F2.3 Content Library

**Description:** A searchable repository of reusable content blocks that team members can drag into any proposal.

**Content Types:**
- **Case studies**: Client name, logo, challenge, solution, results, testimonial
- **Team bios**: Photo, name, title, bio, relevant experience, certifications
- **Methodology sections**: Process descriptions, frameworks, approach narratives
- **Terms & conditions**: Legal terms, payment terms, warranty, limitation of liability
- **About us**: Company overview, mission, values, differentiators
- **Portfolio items**: Project screenshots, descriptions, outcomes
- **Certifications & awards**: Industry certifications, awards, partnerships
- **FAQ sections**: Common client questions with answers

**Features:**
- Tag-based organization and full-text search
- Usage tracking (which blocks appear in winning proposals)
- Version history per block
- Drag-and-drop insertion into editor
- Auto-suggest relevant blocks based on proposal context
- Team permissions (who can create/edit/approve blocks)

---

### F2.4 Team Collaboration

**Description:** Multi-user proposal creation with real-time editing, commenting, approvals, and version history.

**Features:**
- **Real-time co-editing**: Multiple users editing simultaneously with cursor presence
- **Inline comments**: Comment on specific text selections, threaded replies, resolve/unresolve
- **@mentions**: Tag team members in comments for attention
- **Approval workflow**: Define required approvers before a proposal can be sent
- **Version history**: Full version timeline with diff view, restore to any version
- **Role-based access**: Owner (full control), Editor (edit content), Commenter (comment only), Viewer (read only)
- **Activity feed**: Chronological log of all changes and comments per proposal
- **Notifications**: Email and in-app notifications for comments, mentions, approvals, status changes

---

### F2.5 CRM Integration

**Description:** Bi-directional sync with major CRM platforms to keep proposal data aligned with sales pipeline.

**Supported CRMs:**
- **HubSpot**: Sync deals, contacts, and companies; auto-create proposals from deals; update deal stage on proposal status change
- **Salesforce**: Sync opportunities, contacts, and accounts; proposal data appears in opportunity records
- **Pipedrive**: Sync deals and contacts; proposal links embedded in deal activities

**Sync Behavior:**
- New proposal -> creates deal/opportunity in CRM (or links to existing)
- Proposal sent -> updates deal stage to "Proposal Sent"
- Proposal viewed -> logs activity in CRM timeline
- Proposal won/lost -> updates deal stage accordingly
- Deal amount synced with proposal total value

---

### F2.6 Brand Customization

**Description:** Full control over how proposals look to reflect each agency's brand identity.

**Customizable Elements:**
- Logo placement (header, cover page, footer)
- Primary and secondary brand colors
- Font selection (from Google Fonts library)
- Cover page design (3 layout options + custom)
- Header and footer content
- Proposal URL custom domain (proposals.youragency.com)
- Email template customization (for proposal delivery)
- Custom CSS injection (Enterprise tier)

---

## Phase 3: Year 2+ (Months 13-24+)

### F3.1 AI Pricing Optimizer

**Description:** Uses historical win/loss data to suggest optimal pricing for new proposals. Factors include project scope, client industry, deal size, competitive landscape, and historical win rates at different price points.

**Features:**
- Price range recommendation with confidence score
- "Sweet spot" visualization showing win probability by price
- Discount impact analysis ("Reducing price by 10% increases win rate by X%")
- Margin analysis overlay (revenue vs cost)
- Competitive pricing benchmarks by industry

---

### F3.2 Proposal A/B Testing

**Description:** Create proposal variants with different pricing, scope, or messaging and test which performs better.

**Test Variables:**
- Pricing model (fixed vs value-based)
- Price point (±10%, ±20%)
- Executive summary approach (problem-first vs solution-first)
- Scope detail level (high-level vs granular)
- Case study selection
- Team composition presented

---

### F3.3 Automated Follow-Up Sequences

**Description:** Trigger automated email sequences based on proposal engagement (or lack thereof).

**Sequence Triggers:**
- Proposal sent but not opened (2 days, 5 days, 10 days)
- Proposal opened but not signed (1 day, 3 days, 7 days)
- Client spent significant time on pricing (send pricing FAQ)
- Proposal expiring soon (3 days before, day of)
- Post-win onboarding sequence

---

### F3.4 RFP Response Automation

**Description:** Import RFP documents (PDF, Word), auto-extract requirements and questions, and draft responses using the organization's content library and AI.

**Features:**
- RFP document parser (extract questions, requirements, evaluation criteria)
- Auto-match questions to content library answers
- AI-generated responses for new questions
- Compliance matrix auto-generation
- Response quality scoring
- Export in RFP-required format

---

### F3.5 Contract Generation

**Description:** Auto-generate contracts from won proposals. Proposals contain scope, pricing, and terms -- contracts formalize them into legally structured agreements.

**Features:**
- One-click contract generation from won proposal
- Legal clause library (pre-reviewed templates)
- Variable auto-population from proposal data
- Redlining and negotiation tracking
- E-signature integration for contracts
- Contract renewal reminders

---

### F3.6 AI Competitive Analysis

**Description:** When creating proposals against known competitors, AI suggests differentiators, counter-positioning, and competitive advantages to include.

**Features:**
- Competitor profile database (manually curated + AI-enriched)
- Win/loss analysis by competitor
- Suggested differentiators and positioning
- Competitive pricing intelligence
- "Why choose us" section auto-generation

---

### F3.7 Multi-Language Proposals

**Description:** Generate proposals in multiple languages while maintaining professional quality and cultural nuance.

**Supported Languages (initial):**
- English, Spanish, French, German, Portuguese, Japanese
- AI translation with domain-specific terminology preservation
- RTL support for Arabic and Hebrew (later phase)
- Per-client language preference storage
- Multi-language templates

---

## User Stories

### Agency Owner (Sarah)

| Story | Priority | Phase |
| ----- | -------- | ----- |
| As Sarah, I want to generate a proposal from a client email so I can respond within hours instead of days | P0 | MVP |
| As Sarah, I want to see win rates across my team's proposals so I can identify what works | P1 | Post-MVP |
| As Sarah, I want brand-consistent proposals regardless of who creates them | P1 | Post-MVP |
| As Sarah, I want to know the moment a prospect opens my proposal so I can time my follow-up | P0 | MVP |
| As Sarah, I want AI to suggest optimal pricing based on our historical data | P2 | Year 2 |
| As Sarah, I want CRM sync so my team does not have to double-enter deal data | P1 | Post-MVP |

### Account Director (Marcus)

| Story | Priority | Phase |
| ----- | -------- | ----- |
| As Marcus, I want to reuse case studies and methodology sections across proposals | P1 | Post-MVP |
| As Marcus, I want to see which sections a prospect spent the most time reading | P0 | MVP |
| As Marcus, I want to collaborate with my team on a proposal with comments and approvals | P1 | Post-MVP |
| As Marcus, I want to create a SOW automatically once a proposal is won | P1 | Post-MVP |
| As Marcus, I want to A/B test different pricing approaches | P2 | Year 2 |
| As Marcus, I want automated follow-up emails when a proposal goes stale | P2 | Year 2 |

### Freelance Consultant (Priya)

| Story | Priority | Phase |
| ----- | -------- | ----- |
| As Priya, I want to create professional proposals quickly so I can focus on client work | P0 | MVP |
| As Priya, I want e-signature built into my proposal so clients can sign immediately | P0 | MVP |
| As Priya, I want to track my win rate over time and understand what affects it | P1 | Post-MVP |
| As Priya, I want to export proposals as PDF for clients who prefer attachments | P0 | MVP |
| As Priya, I want proposals in multiple languages for international clients | P2 | Year 2 |

---

## Edge Cases & Error Handling

| Scenario | Handling |
| -------- | -------- |
| AI generates inappropriate or off-topic content | Content safety filter + human review required before sending |
| Client opens proposal on slow connection | Progressive loading with skeleton UI, text loads first |
| Two users edit the same section simultaneously | Y.js CRDT handles conflicts, last-write-wins for atomic fields |
| E-signature provider is down | Fallback to secondary provider (DocuSign <-> HelloSign) |
| Client shares proposal link publicly | Rate limiting on view tracking, optional password protection |
| Proposal contains incorrect pricing calculation | Client-side validation + server-side verification before send |
| Free tier user hits proposal limit | Clear upgrade prompt with feature comparison |
| CRM sync conflict (data changed in both systems) | Last-modified-wins with conflict notification to user |
| PDF export times out for very long proposals | Background job with email notification when PDF is ready |
| Client declines proposal and leaves feedback | Structured feedback form, data feeds into win rate analytics |

---

## Development Timeline

### Month 1-2: Foundation
- Project setup (Next.js, Supabase, auth, deployment)
- Database schema and RLS policies
- Basic proposal CRUD (create, read, update, delete)
- TipTap editor integration with core formatting
- Organization and user management

### Month 3: AI Generation
- OpenAI integration and prompt engineering
- Brief analysis pipeline
- Proposal generation with structured output
- Template system with variables
- AI streaming in editor

### Month 4: Pricing & Polish
- Pricing table builder (all pricing models)
- Proposal preview and client portal
- PDF export pipeline
- Share link generation with access controls
- Template library (10 starter templates)

### Month 5: E-Signature & Analytics
- DocuSign/HelloSign integration
- Proposal view tracking (pixel, intersection observer, beacon)
- Analytics dashboard (per-proposal engagement)
- Email delivery (SendGrid integration)
- Proposal status pipeline (draft -> sent -> viewed -> won/lost)

### Month 6: Beta & Launch
- Beta testing with 20 agency partners
- Performance optimization and load testing
- Stripe billing integration
- Onboarding flow and in-app guidance
- Marketing site and public launch

### Month 7-9: Intelligence
- Win rate analytics engine
- Content library system
- SOW generator
- Team collaboration (comments, approvals)

### Month 10-12: Integration
- CRM integrations (HubSpot, Salesforce, Pipedrive)
- Brand customization system
- Advanced analytics and reporting
- API for Enterprise tier
- Custom domain support

### Month 13-18: Optimization
- AI pricing optimizer
- Proposal A/B testing
- Automated follow-up sequences
- RFP response automation

### Month 19-24: Platform
- Contract generation
- AI competitive analysis
- Multi-language support
- Premium template marketplace
- White-label option (Enterprise)
