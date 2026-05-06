# Taxonaut -- Tech Stack

> Architecture and technology decisions for a desktop-first AI tax strategist.

---

## Architecture Overview

```
+-----------------------------------------------------------+
|                    ELECTRON SHELL                          |
|  +-----------------------------------------------------+  |
|  |              REACT FRONTEND (Renderer)               |  |
|  |  +--------+  +----------+  +---------+  +---------+ |  |
|  |  | Auth   |  | Dashboard|  | Strategy|  | Reports | |  |
|  |  | Module |  | Module   |  | Engine  |  | Module  | |  |
|  |  +--------+  +----------+  +---------+  +---------+ |  |
|  |                     |                                 |  |
|  |              React Query (Data Layer)                 |  |
|  +-----------------------------------------------------+  |
|                         |                                  |
|              Electron IPC Bridge                           |
|                         |                                  |
|  +-----------------------------------------------------+  |
|  |              MAIN PROCESS (Node.js)                  |  |
|  |  +----------+  +----------+  +-------------------+  |  |
|  |  | Keychain |  | Local DB |  | Encryption Layer  |  |  |
|  |  | Manager  |  | (SQLite) |  | (AES-256)         |  |  |
|  |  +----------+  +----------+  +-------------------+  |  |
|  +-----------------------------------------------------+  |
+-----------------------------------------------------------+
              |                    |
              v                    v
+-------------------+    +-------------------+
|   SUPABASE        |    |   EXTERNAL APIs   |
|  +-------------+  |    |  +-------------+  |
|  | PostgreSQL  |  |    |  | Plaid       |  |
|  | (RLS)       |  |    |  | OpenAI      |  |
|  +-------------+  |    |  | Stripe      |  |
|  | Edge Fns    |  |    |  | SendGrid    |  |
|  +-------------+  |    |  | IRS e-Svcs  |  |
|  | Auth        |  |    |  +-------------+  |
|  +-------------+  |    +-------------------+
|  | Realtime    |  |
|  +-------------+  |
+-------------------+
```

---

## Why Desktop-First for Fintech

The decision to build Taxonaut as a desktop application (Electron) rather than a web app is deliberate and strategic.

### Trust and Perceived Security

Freelancers are connecting their **bank accounts** and sharing **income data**. A desktop app installed on their machine feels fundamentally more secure than a browser tab. This is not just perception -- it has real implications:

- **No URL spoofing risk** -- Users cannot be phished into a fake Taxonaut website
- **Local encryption** -- Sensitive data can be encrypted and stored locally using the OS keychain
- **Process isolation** -- The app runs in its own sandboxed process, not sharing memory with other browser tabs
- **No browser extension interference** -- Extensions cannot read or modify Taxonaut data
- **Offline capability** -- Core features (viewing past transactions, reports) work without internet

### Desktop Advantages for Financial Apps

| Factor | Desktop (Electron) | Web App |
|--------|-------------------|---------|
| Perceived trust | High -- installed software | Lower -- just a website |
| Local data caching | Native SQLite | IndexedDB (limited) |
| OS keychain access | Yes (secure credential storage) | No |
| System notifications | Native OS notifications | Browser notifications (often blocked) |
| Auto-start capability | Yes (quarterly deadline reminders) | No |
| Offline access | Full offline mode | Service worker (limited) |
| File system access | Native (export reports) | Download prompts only |
| Multi-monitor support | Native window management | Tab-based |

### When Desktop Is Not Ideal

- Mobile access for on-the-go expense entry (addressed with a companion PWA in Year 2)
- Instant updates (mitigated by Electron auto-updater)
- Cross-device sync (handled by Supabase real-time sync)

---

## Frontend

### Electron (v30+)

The desktop shell providing native OS integration.

```
electron/
  main.ts              # Main process entry
  preload.ts           # Secure IPC bridge
  windows/
    main-window.ts     # Primary app window
    onboarding.ts      # First-run experience
    mini-widget.ts     # System tray mini dashboard
  services/
    keychain.ts        # OS keychain integration
    auto-updater.ts    # Electron auto-update
    local-db.ts        # SQLite for offline cache
    encryption.ts      # AES-256 local encryption
    notifications.ts   # Native OS notifications
    tray.ts            # System tray integration
```

Key Electron features used:
- **Auto-updater** -- Seamless background updates via electron-updater
- **System tray** -- Mini tax liability widget always visible
- **Native notifications** -- Deadline reminders that cannot be browser-blocked
- **Keychain integration** -- Plaid access tokens stored in macOS Keychain / Windows Credential Manager
- **SQLite** -- Local cache for offline transaction viewing
- **Deep linking** -- `taxonaut://` protocol for CPA collaboration invites

### React (v19+)

The renderer process UI framework.

```
src/
  app/
    App.tsx
    routes.tsx
    providers.tsx
  components/
    layout/
      Sidebar.tsx
      TopBar.tsx
      StatusBar.tsx
    dashboard/
      TaxLiabilityGauge.tsx
      SavingsFoundCard.tsx
      DeadlineCountdown.tsx
      IncomeExpenseChart.tsx
    transactions/
      TransactionRow.tsx
      TransactionFeed.tsx
      CategoryBadge.tsx
      DeductionFlag.tsx
    strategy/
      StrategyCard.tsx
      SavingsEstimate.tsx
      ImplementationSteps.tsx
    deductions/
      DeductionFinder.tsx
      DeductionExplanation.tsx
      MissedDeductionAlert.tsx
    reports/
      PLStatement.tsx
      TaxSummary.tsx
      QuarterlyBreakdown.tsx
    entity/
      EntityComparison.tsx
      SCorpCalculator.tsx
    shared/
      MoneyDisplay.tsx       # Right-aligned, formatted currency
      PercentageBadge.tsx
      DateDisplay.tsx
      LoadingState.tsx
      ErrorBoundary.tsx
  hooks/
    useTaxLiability.ts
    useTransactions.ts
    useDeductions.ts
    useStrategies.ts
    usePlaidLink.ts
    useQuarterlyEstimates.ts
  stores/
    auth-store.ts
    financial-store.ts
    strategy-store.ts
    settings-store.ts
  utils/
    tax-calculations.ts
    currency-format.ts
    date-utils.ts
    encryption.ts
```

### State Management -- Zustand + React Query

- **Zustand** for client-side UI state (sidebar open, active filters, theme preference)
- **React Query (TanStack Query v5)** for all server state (transactions, strategies, tax calculations)
- **Why not Redux** -- Overkill for this app size. Zustand is lighter and Electron apps benefit from smaller bundle sizes

### UI Component Library -- Custom + Radix Primitives

- **Radix UI** for accessible primitives (Dialog, Dropdown, Tooltip, Tabs)
- **Custom components** for financial-specific UI (MoneyDisplay, TaxGauge, StrategyCard)
- **Tailwind CSS v4** for styling
- **Recharts** for financial data visualization (income/expense charts, tax projections)
- **Framer Motion** for subtle animations (savings counter, strategy reveals)

---

## Backend -- Supabase

### Why Supabase

Supabase provides the critical infrastructure for a financial application without requiring a custom backend team:

1. **PostgreSQL** -- Battle-tested for financial data. ACID compliance is non-negotiable for money
2. **Row Level Security (RLS)** -- Every query is automatically scoped to the authenticated user. A user can never accidentally (or maliciously) access another user's financial data
3. **Edge Functions** -- Serverless compute for AI strategy generation, Plaid webhooks, and background processing
4. **Auth** -- Built-in authentication with MFA support (critical for financial apps)
5. **Real-time** -- Live updates when transactions sync or new strategies are generated

### Database Schema (Core Tables)

```sql
-- Users and profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_type TEXT NOT NULL, -- 'sole_prop', 'llc', 'scorp', 'ccorp'
  filing_status TEXT NOT NULL, -- 'single', 'married_joint', 'married_separate', 'head_of_household'
  state TEXT NOT NULL,
  industry TEXT,
  annual_income_estimate DECIMAL(12,2),
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected financial accounts
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plaid_item_id TEXT NOT NULL,
  plaid_access_token_encrypted TEXT NOT NULL, -- AES-256 encrypted
  institution_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'checking', 'savings', 'credit', 'investment'
  account_mask TEXT, -- last 4 digits
  sync_status TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES connected_accounts(id),
  plaid_transaction_id TEXT UNIQUE,
  date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- AI-categorized
  subcategory TEXT,
  is_deductible BOOLEAN DEFAULT FALSE,
  deduction_category TEXT, -- IRS category if deductible
  deduction_confidence DECIMAL(3,2), -- 0.00-1.00
  is_business BOOLEAN DEFAULT FALSE,
  business_percentage DECIMAL(5,2) DEFAULT 100.00,
  notes TEXT,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax strategies generated by AI
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL, -- 'deduction', 'entity', 'retirement', 'timing', 'estimated_payment'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_savings DECIMAL(12,2),
  priority TEXT DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  deadline DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'implemented', 'dismissed'
  ai_reasoning TEXT, -- Full AI explanation
  applicable_tax_code TEXT, -- IRS reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quarterly estimated tax payments
CREATE TABLE quarterly_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  estimated_amount DECIMAL(12,2) NOT NULL,
  actual_paid DECIMAL(12,2) DEFAULT 0,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'due', 'paid', 'overdue'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (user can only access their own data)
CREATE POLICY "Users can only view own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only view own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only view own strategies"
  ON strategies FOR ALL USING (auth.uid() = user_id);
```

### Edge Functions

```
supabase/functions/
  plaid-webhook/        # Handle Plaid transaction webhooks
  categorize-transaction/ # AI-powered transaction categorization
  generate-strategies/  # Generate tax strategies based on financial data
  calculate-liability/  # Real-time tax liability calculation
  quarterly-reminder/   # Cron job for deadline notifications
  sync-transactions/    # Manual transaction sync trigger
  entity-analysis/      # LLC vs S-Corp comparison engine
  export-report/        # Generate PDF/CSV reports
```

---

## AI/ML Layer

### OpenAI API (GPT-4o)

Used for three core functions:

**1. Transaction Categorization**
```typescript
// Prompt engineering for IRS-compliant categorization
const systemPrompt = `You are a tax-focused transaction categorizer.
Given a transaction description and amount, categorize it according to
IRS Schedule C categories. Return JSON with:
- category (IRS category)
- subcategory
- is_deductible (boolean)
- deduction_confidence (0-1)
- business_percentage (0-100)
- reasoning (brief explanation)`;
```

**2. Strategy Generation**
```typescript
// Monthly strategy generation based on financial snapshot
const strategyPrompt = `Given this freelancer's financial profile:
- YTD Income: ${income}
- YTD Expenses: ${expenses}
- Business Type: ${entityType}
- Filing Status: ${filingStatus}
- Current Tax Liability: ${liability}
- Months Remaining in Tax Year: ${monthsLeft}

Generate actionable tax strategies ranked by potential savings.
Reference specific IRS publications and code sections.`;
```

**3. Deduction Explanations**
```typescript
// Human-readable explanations for discovered deductions
const explanationPrompt = `Explain this tax deduction in simple terms:
- Deduction: ${deductionType}
- Amount: ${amount}
- IRS Reference: ${irsCode}
Include: what it is, why it qualifies, documentation needed,
and any limitations or phase-outs.`;
```

### Custom Rules Engine

Not everything goes through AI. A deterministic rules engine handles:

- Federal tax bracket calculations (faster and more accurate than AI)
- Self-employment tax (15.3%) calculations
- Standard deduction vs itemized threshold
- Quarterly estimated payment calculations (safe harbor rules)
- State tax rate lookups
- Known deduction limits (home office, vehicle, meals)

```typescript
// rules-engine/
//   federal-brackets.ts    -- 2024/2025 tax brackets
//   self-employment.ts     -- SE tax calculations
//   deduction-limits.ts    -- IRS deduction caps
//   quarterly-safe-harbor.ts -- Estimated payment rules
//   state-taxes.ts         -- State income tax rates (all 50 states)
//   entity-comparison.ts   -- LLC vs S-Corp tax impact model
```

### NLP Pipeline for Transaction Categorization

```
Raw Transaction ("AMZN MKTP US*AB1CD2EFG")
        |
        v
  Merchant Normalization ("Amazon Marketplace")
        |
        v
  Category Prediction (local ML model -- lightweight)
        |
        v
  Confidence Check (>0.85 = auto-categorize, <0.85 = flag for review)
        |
        v
  Deduction Eligibility Check (rules engine)
        |
        v
  Stored in DB with category + confidence score
```

---

## Financial Integrations

### Plaid

- **Purpose**: Bank account linking, transaction retrieval, balance data
- **Products Used**: Auth, Transactions, Balance, Identity
- **Webhook Integration**: Real-time transaction updates via Supabase Edge Functions
- **Token Security**: Plaid access tokens encrypted with AES-256 and stored in Supabase (encrypted column) with a copy in OS keychain for local caching

### Stripe

- **Purpose**: Subscription billing for Plus and Pro tiers
- **Products Used**: Subscriptions, Customer Portal, Webhooks
- **Integration**: Stripe Checkout for initial signup, Customer Portal for self-service management

---

## Security Architecture

### Encryption

| Layer | Method | Details |
|-------|--------|---------|
| Data at rest (Supabase) | AES-256 | PostgreSQL column-level encryption for sensitive fields |
| Data at rest (local) | AES-256-GCM | SQLite cache encrypted, key stored in OS keychain |
| Data in transit | TLS 1.3 | All API calls over HTTPS, certificate pinning in Electron |
| Plaid tokens | AES-256 + Keychain | Double-encrypted: server-side + OS keychain |
| Auth tokens | JWT (RS256) | Short-lived access tokens (15 min), secure refresh rotation |

### Authentication

- **Supabase Auth** with email/password + mandatory MFA for financial apps
- **MFA**: TOTP (authenticator app) -- required after first bank account connection
- **Session management**: 15-minute access tokens, 7-day refresh tokens, automatic rotation
- **Biometric unlock**: Touch ID / Windows Hello for desktop app re-authentication

### Compliance Path

- **SOC 2 Type II** -- Target within 18 months of launch
- **PCI DSS** -- Not required (Plaid handles card data, Stripe handles payments)
- **State regulations** -- Taxonaut provides education/suggestions, not tax advice. Clear disclaimers avoid regulated CPA territory
- **GDPR/CCPA** -- Data deletion, export, and consent management built in from day one

### Security Practices

- Dependency scanning with Snyk (automated in CI/CD)
- Electron security best practices (contextIsolation, nodeIntegration disabled, CSP headers)
- Regular penetration testing (quarterly after launch)
- Bug bounty program (post-SOC 2)
- Audit logging for all data access

---

## Dev Tools and Workflow

### Language and Tooling

| Tool | Purpose |
|------|---------|
| **TypeScript 5.4+** | Type safety across entire codebase (Electron + React + Edge Functions) |
| **Vitest** | Unit and integration testing (fast, ESM-native) |
| **Playwright** | E2E testing for Electron app |
| **ESLint + Prettier** | Code quality and formatting |
| **Husky** | Pre-commit hooks (lint, type-check, test) |
| **GitHub Actions** | CI/CD pipeline |
| **Turborepo** | Monorepo management (electron, renderer, shared, functions) |

### Monorepo Structure

```
taxonaut/
  apps/
    desktop/          # Electron main process
    renderer/         # React app (Electron renderer)
  packages/
    shared/           # Shared types, utils, tax calculations
    rules-engine/     # Deterministic tax rules
    ui/               # Shared UI components
  supabase/
    migrations/       # Database migrations
    functions/        # Edge Functions
    seed.sql          # Test data
  .github/
    workflows/
      ci.yml          # Lint, type-check, test
      release.yml     # Build + sign + distribute Electron app
```

### CI/CD Pipeline

```
Push to main
    |
    v
  Lint + Type Check + Unit Tests (Vitest)
    |
    v
  Integration Tests (Playwright)
    |
    v
  Build Electron App (macOS, Windows, Linux)
    |
    v
  Code Sign (Apple notarization, Windows Authenticode)
    |
    v
  Distribute via Auto-Updater (Electron-builder)
    |
    v
  Deploy Edge Functions (Supabase CLI)
```

### Distribution

- **macOS**: DMG installer, notarized with Apple Developer certificate, auto-update via Squirrel
- **Windows**: NSIS installer, signed with Authenticode certificate, auto-update via Squirrel
- **Linux**: AppImage and .deb packages, manual update check

---

## Scalability Considerations

### Current Architecture (0-10K users)

- Single Supabase project (free tier supports MVP)
- Shared OpenAI API key with rate limiting per user
- Local SQLite cache reduces server load
- Edge Functions handle webhook processing

### Growth Phase (10K-100K users)

- Supabase Pro plan with connection pooling (PgBouncer)
- OpenAI API with dedicated capacity
- Redis caching layer (Upstash) for frequently accessed tax bracket data
- Background job queue (Inngest) for batch strategy generation
- CDN for static assets (Vercel/Cloudflare)

### Scale Phase (100K+ users)

- Multi-region Supabase deployment
- Fine-tuned local ML models for transaction categorization (reduce OpenAI costs)
- Dedicated PostgreSQL read replicas for reporting
- Custom inference infrastructure for tax strategy models
- Dedicated Plaid partnership tier for reduced per-connection costs

---

## Cost Estimates (Monthly)

| Service | 1K Users | 10K Users | 100K Users |
|---------|----------|-----------|------------|
| Supabase | $25 | $75 | $500 |
| OpenAI API | $200 | $1,500 | $8,000 |
| Plaid | $300 | $3,000 | $20,000 |
| Stripe | Revenue % | Revenue % | Revenue % |
| SendGrid | $0 (free tier) | $20 | $90 |
| Code signing certs | $300/yr | $300/yr | $300/yr |
| **Total** | **~$550** | **~$4,900** | **~$29,000** |

At 100K users with $30/mo average revenue, monthly revenue is $3M against $29K infrastructure cost -- healthy 99% gross margin on infrastructure.

---

## Architecture Decision Records (ADRs)

### ADR-001: Desktop Framework -- Electron

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut handles sensitive financial data (bank connections, income, expenses, tax calculations). Users connecting bank accounts and sharing income data need to perceive the application as secure. The app requires OS keychain access (for Plaid tokens), native system notifications (for quarterly deadline reminders), offline capability (for viewing past transactions), auto-start capability, and local encrypted storage. |
| **Decision** | Use Electron 30+ as the desktop application shell. |
| **Alternatives Considered** | Tauri (smaller binary but less mature OS keychain integration, Rust learning curve for financial domain logic), web-only PWA (no OS keychain, browser extensions can read financial data, URL spoofing risk), React Native Desktop (immature, limited native API access). |
| **Consequences** | Larger binary but significantly higher perceived trust for a financial application. No URL spoofing risk. Process isolation from browser tabs. Full OS keychain integration (macOS Keychain, Windows Credential Manager) for Plaid token storage. SQLite local cache for offline transaction viewing. Native system notifications that cannot be browser-blocked. |

### ADR-002: Database -- Supabase PostgreSQL with Row Level Security

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut stores highly sensitive financial data: transactions, tax strategies, connected bank accounts (encrypted tokens), and quarterly estimates. ACID compliance is non-negotiable for money operations. Every query must be automatically scoped to the authenticated user -- a user must never be able to access another user's financial data. |
| **Decision** | Use Supabase (managed PostgreSQL with Row Level Security, Auth with MFA, Edge Functions, and Realtime). |
| **Alternatives Considered** | Firebase/Firestore (not ACID-compliant for financial data, document model poor for transaction queries), AWS RDS (operational burden, no built-in auth/realtime), PlanetScale (no RLS, no built-in auth/storage). |
| **Consequences** | PostgreSQL's ACID compliance is ideal for financial data. RLS policies ensure every query is scoped to `auth.uid()`. Edge Functions handle Plaid webhooks and AI strategy generation. Column-level encryption for sensitive fields (Plaid tokens). Path to SOC 2 compliance is clearer with managed infrastructure. |

### ADR-003: AI Model -- OpenAI GPT-4o + Deterministic Rules Engine

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut needs AI for transaction categorization (matching merchant descriptions to IRS Schedule C categories), tax strategy generation (analyzing financial snapshots to find savings), and deduction explanations (human-readable descriptions of tax concepts). However, tax bracket calculations and known deduction limits must be deterministic -- AI hallucination in tax calculations is unacceptable. |
| **Decision** | Use OpenAI GPT-4o for NL tasks (categorization, strategy generation, explanations). Use a deterministic TypeScript rules engine for all tax calculations (brackets, SE tax, deduction limits, quarterly safe harbor). |
| **Alternatives Considered** | Fully AI-driven calculations (hallucination risk for tax math), fully rule-based (cannot handle NL categorization or creative strategy generation), Anthropic Claude (comparable quality but GPT-4o's structured output mode is more reliable for JSON parameter extraction). |
| **Consequences** | Hybrid approach: AI handles NL understanding, rules engine handles math. Tax calculations are always deterministic and auditable. AI-generated strategies include IRS code references that can be verified. Transaction categorization uses a confidence threshold (>0.85 auto-categorize, <0.85 flag for review). OpenAI costs scale with transaction volume. |

### ADR-004: Auto-Update Strategy -- electron-updater with Squirrel

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut is a financial application where users expect it to always be up-to-date with the latest tax rules and security patches. Updates must not disrupt active sessions or cause data loss. As a security-sensitive app, update integrity is paramount. |
| **Decision** | Use electron-updater (Electron Builder) with Squirrel-based auto-update on macOS and Windows. Updates are code-signed and downloaded in the background. |
| **Alternatives Considered** | Manual download (unacceptable for a financial app -- users need security patches promptly), Cloudflare R2 as update server (possible but Squirrel + GitHub Releases provides better platform integration), Sparkle for macOS (would require a separate Windows solution). |
| **Consequences** | Seamless background updates with code-signed verification. macOS notarization ensures Gatekeeper approval. Windows Authenticode signing prevents SmartScreen warnings. Users see a system tray notification when an update is ready. Restart applies the update without losing local SQLite cache. |

### ADR-005: Authentication -- Supabase Auth with Mandatory MFA

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut connects to users' bank accounts via Plaid and displays sensitive financial data. Authentication must be significantly stronger than a typical SaaS app. MFA is a requirement, not an option, once a user connects a bank account. Biometric unlock (Touch ID / Windows Hello) should be available for quick re-authentication. |
| **Decision** | Use Supabase Auth with email/password + mandatory TOTP MFA (required after first bank account connection). Support biometric unlock via Electron for desktop re-authentication. |
| **Alternatives Considered** | Auth0 (better MFA features but additional vendor, cost, and complexity), Firebase Auth (weaker MFA support, fragments backend), Clerk (good UX but separate from Supabase ecosystem). |
| **Consequences** | Mandatory MFA after bank connection provides security appropriate for a financial app. Short-lived access tokens (15 min) with 7-day refresh rotation. Biometric unlock (Touch ID / Windows Hello) provides convenience without compromising security. Auth state cached locally for offline access to non-sensitive data. SOC 2 auditors view mandatory MFA favorably. |

### ADR-006: State Management -- Zustand + TanStack Query

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut has distinct client-side state (UI preferences, active filters, sidebar state) and server-side state (transactions, strategies, tax calculations, quarterly estimates). Transaction feeds can be large (thousands of items) and require efficient caching, pagination, and optimistic updates. |
| **Decision** | Use Zustand for client-side UI state and TanStack Query v5 for all server state management. |
| **Alternatives Considered** | Redux Toolkit (overkill for the client state size, more boilerplate), Zustand alone (would need to reinvent caching/pagination logic for transactions), SWR (less feature-rich than TanStack Query for complex server state). |
| **Consequences** | Clean separation of concerns. TanStack Query handles caching, pagination, background refetching, and optimistic updates for the transaction feed. Zustand keeps client state lightweight. Both integrate cleanly with React 19 and Electron's renderer process. |

### ADR-007: Styling -- Tailwind CSS v4 + Radix UI + Recharts

| Field | Detail |
|-------|--------|
| **Status** | Accepted |
| **Context** | Taxonaut displays financial data that must be precise, readable, and trustworthy. The UI includes data tables (transactions), charts (income/expense, tax projections), gauges (tax liability), and forms (settings, export). Financial UIs have strict requirements around number formatting, alignment, and color semantics (green for savings, red for liabilities). |
| **Decision** | Use Tailwind CSS v4 for layout and styling, Radix UI for accessible interactive primitives, Recharts for financial data visualization, and Framer Motion for subtle animations. |
| **Alternatives Considered** | Material UI (too opinionated for a financial dashboard aesthetic), CSS Modules (slower iteration for data-heavy layouts), D3.js directly (powerful but complex for standard chart types -- Recharts wraps D3 with React). |
| **Consequences** | Tailwind enables rapid iteration on data-dense financial layouts. Radix UI provides accessible dialogs, tabs, dropdowns, and tooltips. Recharts integrates naturally with React for income/expense charts and tax projection visualizations. Framer Motion adds subtle polish (savings counter animation, strategy card reveals) without performance overhead. |

---

## Performance Budgets

### Desktop Application Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| App Launch (cold) | < 3s | Time from double-click to interactive dashboard (main window rendered, auth verified) |
| App Launch (warm) | < 1s | Subsequent launches with OS-level process caching |
| Memory Usage (idle) | < 200MB | RSS with dashboard loaded but no active data processing |
| Memory Usage (active) | < 500MB | RSS during transaction sync, strategy generation, and report rendering |
| Installer Size | < 150MB | Packaged DMG (macOS) / NSIS installer (Windows) / AppImage (Linux) |
| CPU Usage (idle) | < 2% | CPU consumption when app is open with dashboard visible but no active processing |
| IPC Latency | < 50ms | Round-trip time for Electron IPC calls between main (keychain, SQLite) and renderer |
| File Open (10MB) | < 1s | Time to load and decrypt a 10MB local SQLite cache |
| Auto-Update Download | Background, < 60s on broadband | Update download on a 50 Mbps connection without blocking the UI |

### Financial-Specific Performance Targets

| Metric | Target |
|--------|--------|
| Transaction feed render (1000 items) | < 500ms with virtualized list |
| Plaid transaction sync (new batch) | < 5s for 100 transactions |
| Tax liability recalculation | < 200ms (deterministic rules engine) |
| AI strategy generation | < 10s (cloud, GPT-4o) |
| AI transaction categorization | < 2s per batch of 50 |
| Report PDF export | < 3s for quarterly P&L |
| Local SQLite query (filtered transactions) | < 100ms |

---

## Environment Variable Catalog

### Main Process Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | -- |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Yes | -- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Edge Functions only, never in client) | Yes (server) | -- |
| `OPENAI_API_KEY` | OpenAI API key for transaction categorization and strategy generation | Yes | -- |
| `PLAID_CLIENT_ID` | Plaid API client ID | Yes | -- |
| `PLAID_SECRET` | Plaid API secret (sandbox/development/production) | Yes | -- |
| `PLAID_ENV` | Plaid environment (`sandbox`, `development`, `production`) | Yes | `sandbox` |
| `STRIPE_SECRET_KEY` | Stripe secret key for subscription management | Yes (server) | -- |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes (server) | -- |
| `SENDGRID_API_KEY` | SendGrid API key for email notifications (deadline reminders) | Yes (prod) | -- |
| `SENTRY_DSN` | Sentry error tracking DSN | Yes (prod) | -- |
| `POSTHOG_API_KEY` | PostHog product analytics key | Yes (prod) | -- |
| `NODE_ENV` | Runtime environment | No | `development` |
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | No | `info` |
| `LOCAL_ENCRYPTION_KEY` | AES-256 encryption key for local SQLite (derived from OS keychain in production) | No | Auto-generated |

### Renderer Process Environment Variables (exposed via preload)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (renderer-safe) | Yes | -- |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (renderer-safe) | Yes | -- |
| `VITE_PLAID_ENV` | Plaid environment for Plaid Link initialization | Yes | `sandbox` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout | Yes | -- |
| `VITE_SENTRY_DSN` | Sentry DSN for renderer error tracking | Yes (prod) | -- |
| `VITE_POSTHOG_API_KEY` | PostHog key for renderer analytics | Yes (prod) | -- |
| `VITE_APP_VERSION` | Application version string | No | From `package.json` |

### Code Signing & Build Environment Variables (CI/CD Only)

| Variable | Description | Platform |
|----------|-------------|----------|
| `APPLE_ID` | Apple Developer account email | macOS |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for notarization | macOS |
| `APPLE_TEAM_ID` | Apple Developer Team ID | macOS |
| `CSC_LINK` | Base64-encoded .p12 certificate for macOS code signing | macOS |
| `CSC_KEY_PASSWORD` | Password for the .p12 certificate | macOS |
| `WIN_CSC_LINK` | Base64-encoded Windows code signing certificate (.pfx) | Windows |
| `WIN_CSC_KEY_PASSWORD` | Password for the Windows signing certificate | Windows |
| `GH_TOKEN` | GitHub token for publishing releases and auto-update | All |

### electron-builder Configuration Reference

```yaml
appId: com.taxonaut.app
productName: Taxonaut
publish:
  provider: github
  owner: taxonaut
  repo: taxonaut
mac:
  category: public.app-category.finance
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  target:
    - dmg
    - zip
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
  extendInfo:
    NSCameraUsageDescription: "Taxonaut uses the camera for receipt scanning."
win:
  target: nsis
  certificateSubjectName: "Taxonaut Inc."
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
linux:
  target:
    - AppImage
    - deb
  category: Finance
protocols:
  - name: Taxonaut
    schemes:
      - taxonaut
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20 LTS+ | Required for Electron main process and build tooling |
| **pnpm** | 9+ | Package manager (monorepo workspace support via Turborepo) |
| **Git** | 2.40+ | Version control |
| **Python** | 3.10+ | Required by native Node.js modules (node-gyp, better-sqlite3 / SQLCipher bindings) |
| **Supabase CLI** | Latest | Local Supabase development and Edge Function deployment |

### Platform-Specific Build Tools

**macOS:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Xcode Command Line Tools | `xcode-select --install` | C/C++ compiler for native Node.js addons (node-gyp, better-sqlite3) |
| Xcode (full, optional) | Mac App Store | Required only for macOS code signing, notarization, and Touch ID testing |
| Apple Developer Certificate | Apple Developer Portal | Code signing for distribution builds |
| Homebrew (recommended) | [brew.sh](https://brew.sh/) | Package manager for installing additional dependencies |

**Windows:**
| Tool | Installation | Purpose |
|------|-------------|---------|
| Visual Studio Build Tools 2022 | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | C/C++ compiler for native Node.js addons (node-gyp, better-sqlite3) |
| Windows SDK (10.0.22621+) | Included with VS Build Tools | Windows API headers for native module compilation |
| Python 3.10+ | [python.org](https://www.python.org/) or via VS Build Tools | Required by node-gyp |
| Windows Code Signing Certificate (EV) | Certificate Authority (e.g., DigiCert) | Authenticode signing (EV cert recommended for SmartScreen reputation) |

**Linux (Ubuntu/Debian):**
| Tool | Installation | Purpose |
|------|-------------|---------|
| build-essential | `sudo apt install build-essential` | GCC, make, and related build tools |
| libgtk-3-dev | `sudo apt install libgtk-3-dev` | GTK headers for Electron native dialogs |
| libsecret-1-dev | `sudo apt install libsecret-1-dev` | Secret storage headers for keychain integration |
| libnss3 | `sudo apt install libnss3` | Network Security Services for Electron |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/taxonaut/taxonaut.git
cd taxonaut

# 2. Install dependencies (monorepo)
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, OpenAI, Plaid (sandbox), and Stripe (test) credentials

# 4. Start Supabase local development
npx supabase start
# This starts local PostgreSQL, Auth, and Edge Functions

# 5. Run database migrations
npx supabase db push

# 6. Start the Electron app in development mode
pnpm dev

# 7. Run tests
pnpm test          # Unit tests (Vitest) -- includes rules engine tests
pnpm test:e2e      # E2E tests (Playwright)

# 8. Build for distribution
pnpm build:mac     # macOS DMG
pnpm build:win     # Windows NSIS installer
pnpm build:linux   # Linux AppImage + deb

# 9. Deploy Edge Functions
npx supabase functions deploy
```

### Development Workflow

1. **Main process changes** (keychain, SQLite, encryption, notifications): Electron restarts automatically. OS keychain operations require testing on the actual target platform.
2. **Renderer process changes** (React UI, dashboard, transaction feed): Vite HMR provides instant updates.
3. **Rules engine development** (`packages/rules-engine/`): Unit tests cover all tax bracket calculations and deduction limits. Run `pnpm --filter rules-engine test` for isolated testing.
4. **Plaid integration testing**: Use Plaid sandbox credentials. Sandbox provides test bank accounts with deterministic transaction data. Real bank connections require Plaid development or production environment.
5. **Edge Functions** (`supabase/functions/`): Test locally with `npx supabase functions serve`. Deploy with `npx supabase functions deploy`.
6. **Financial data testing**: Seed data (`supabase/seed.sql`) includes sample transactions, strategies, and quarterly estimates for development.

---
