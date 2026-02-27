# YC SaaS Portfolio — Claude Code Context

## Portfolio Scope (Web + Mobile Only — Desktop Excluded)

This repo contains 30 SaaS projects. Desktop/Electron apps are **cut from scope**. Focus only on:
- **Web apps** (Next.js 16 + Supabase) — 10 projects ✅ ALL COMPLETE
- **Mobile apps** (React Native/Expo) — 10 projects ✅ ALL COMPLETE

---

## Web App Directory Map

### All Web Apps — Production Ready ✅

| Directory | Project | Status | Key Features |
|-----------|---------|--------|-------------|
| `invoiceai/` | InvoiceAI (#24) B2C | ✅ Complete | Stripe Connect, SendGrid, PDF (Puppeteer), cron reminders, OCR |
| `petos/` | PetOS (#25) B2C | ✅ Complete | Vaccine scheduler, medication reminders, S3 photo uploads, cron |
| `storythread/` | StoryThread (#22) B2C | ✅ Complete | Public publishing, real-time collaboration |
| `boardbrief/` | BoardBrief (#29) B2B | ✅ Complete | Whisper AI transcription, iCal export, calendar integration |
| `proposalpilot/` | ProposalPilot (#26) B2B | ✅ Complete | Template library, PDF (react-pdf), Resend email, AI auto-save |
| `claimforge/` | ClaimForge (#30) B2B | ✅ Complete | GPT-4o OCR, Benford's Law fraud scoring, SHA-256 evidence chain |
| `complibot/` | CompliBot (#27) B2B | ✅ Complete | SOC2/ISO27001/HIPAA/GDPR/PCI-DSS compliance, AI policy generator |
| `dealroom/` | DealRoom (#28) B2B | ✅ Complete | AI deal scoring, pipeline CRM, GPT-4o follow-up email drafts |
| `skillbridge/` | SkillBridge (#21) B2C | ✅ Complete | AI career path matching, skills gap analysis, learning plans |
| `neighbordao/` | NeighborDAO (#23) B2C | ✅ Complete | Community governance, group purchasing, DAO treasury |

**Cron configuration:** Both `invoiceai/vercel.json` and `petos/vercel.json` exist to enable Vercel scheduled functions.

---

## Mobile App Directory Map

### All Mobile Apps — Production Ready ✅

| Directory | Project | Status | Key Features |
|-----------|---------|--------|-------------|
| `compliancesnap/` | ComplianceSnap (#10) B2B | ✅ Complete | OSHA CFR citations, compliance score tracking, violation history |
| `govpass/` | GovPass (#5) B2C | ✅ Complete | FPL eligibility engine, benefit navigator, document scanner |
| `mortal/` | Mortal (#2) B2C | ✅ Complete | Estate vault, dead man's switch, beneficiary management |
| `claimback/` | Claimback (#3) B2C | ✅ Complete | Bill dispute, Bland.ai phone calls, OCR receipt scanner |
| `auracheck/` | Aura Check (#4) B2C | ✅ Complete | ABCDE melanoma criteria, ElevenLabs health coaching |
| `fieldlens/` | FieldLens (#1) B2C | ✅ Complete | Trade skill coaching, ElevenLabs TTS (Rachel voice) |
| `sitesync/` | SiteSync (#6) B2B | ✅ Complete | Construction photo docs, OSHA violation detection, GIN JSONB index |
| `routeai/` | RouteAI (#7) B2B | ✅ Complete | Route optimization, Supabase Realtime dispatcher sync |
| `inspectorai/` | Inspector AI (#8) B2B | ✅ Complete | Property damage CV, repair cost estimates, expo-print PDF |
| `stockpulse/` | StockPulse (#9) B2B | ✅ Complete | AI barcode scanner, fn_apply_scan_to_inventory() trigger, PO generator |

---

## CRITICAL: Version Notes (Newer Than Training Data)

These packages use APIs that differ from older versions Claude may have learned:

| Package | Version | Key Difference |
|---------|---------|----------------|
| `next` | **16.1.6** | App Router only; `fetch` cache changed in v15+; `use cache` directive |
| `react` | **19.2.3** | React Compiler active — no manual `useMemo`/`useCallback` unless profiler shows need |
| `tailwindcss` | **v4.x** | Config in `globals.css` via `@theme {}` — NO `tailwind.config.ts` file |
| `@supabase/ssr` | **0.8.0** | Use `createBrowserClient()`/`createServerClient()` — NOT deprecated `auth-helpers-nextjs` |
| `openai` | **6.18.0** | `client.chat.completions.create()` — stream API changed |
| `expo` | **SDK 52** | Expo Router v4, file-based routing in `src/app/` |
| `react-native` | **0.76** | New Architecture enabled by default |

**Always add `use context7` to prompts involving any of these packages.**

---

## Standard Web Project File Structure

Every web project follows this layout (from `invoiceai/` as canonical reference):

```
[project]/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── auth/callback/route.ts
│   ├── (dashboard)/          # All protected routes
│   │   ├── layout.tsx        # Sidebar + header wrapper
│   │   ├── dashboard/page.tsx
│   │   └── [feature]/
│   │       ├── page.tsx      # Server Component
│   │       ├── loading.tsx   # Skeleton
│   │       └── error.tsx     # Error boundary
│   ├── api/                  # Route handlers
│   │   ├── ai/route.ts
│   │   ├── webhooks/[service]/route.ts
│   │   └── cron/route.ts
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page (auth-aware: redirect /dashboard if authed)
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                   # Base components (Button, Card, Input, Badge, Dialog, Skeleton)
│   ├── layout/               # Sidebar, Header, Navigation
│   └── [feature]/            # Feature-specific client components
├── lib/
│   ├── actions/              # Server actions ('use server' files)
│   ├── supabase/
│   │   ├── client.ts         # createBrowserClient()
│   │   └── server.ts         # createServerClient()
│   ├── openai/
│   │   └── client.ts         # OpenAI instance
│   ├── stripe/               # if applicable
│   ├── email/                # if applicable
│   └── utils.ts              # cn(), formatCurrency(), formatDate()
├── supabase/
│   └── migrations/           # 001_xxx.sql, 002_xxx.sql, ...
├── types/
│   └── database.ts           # TypeScript interfaces matching schema
├── proxy.ts                  # Middleware (NOT middleware.ts — see gotcha below)
├── vercel.json               # Required for cron jobs (invoiceai, petos)
├── next.config.ts
└── tsconfig.json             # strict: true, paths: @/* -> ./*
```

### Standard Mobile Project File Structure

Every mobile project follows this layout (React Native/Expo SDK 52):

```
[project]/
├── src/
│   ├── app/
│   │   ├── _layout.tsx           # Root layout with auth + Supabase Realtime setup
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx       # Tab bar layout
│   │       ├── index.tsx         # Home/dashboard tab
│   │       └── [feature].tsx     # Feature tabs
│   ├── components/
│   │   └── ui/                   # Button, Card, Input — NativeWind 4.x styled
│   ├── lib/
│   │   └── supabase.ts           # supabase-js + AsyncStorage, detectSessionInUrl: false
│   ├── services/
│   │   └── ai.ts                 # GPT-4o Vision base64 analysis functions
│   └── stores/
│       └── [entity].ts           # Zustand 5.x stores per data domain
├── supabase/
│   └── migrations/               # 001_initial.sql with RLS + triggers
├── app.json                      # Expo config
├── babel.config.js               # NativeWind + Expo Router
├── tailwind.config.js            # NativeWind color config
├── package.json
└── tsconfig.json
```

---

## Canonical Code Patterns

### Authentication (EVERY server component + server action must do this)

```typescript
// In page.tsx (Server Component):
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  // ...
}

// In server action — auth check independently (defense in depth):
export async function myAction(data: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  // ...
}
```

### Landing Page Pattern (app/page.tsx — auth-aware)

```typescript
// Server Component: redirect authenticated users, show marketing page otherwise
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  // Unauthenticated users see full landing page — NO redirect to /login
  return ( /* marketing page JSX */ );
}
```

### Server Action Pattern (from `invoiceai/lib/actions/invoices.ts`)

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Entity } from '@/types/database';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: Entity;
}

export async function getEntities(): Promise<ListResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: [], total: 0, error: 'Not authenticated' };

  const { data, error, count } = await supabase
    .from('entities')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { items: [], total: 0, error: error.message };
  return { items: data ?? [], total: count ?? 0 };
}

export async function createEntity(formData: EntityFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('entities')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/entities');
  return { success: true, data };
}
```

### B2B Multi-Tenant RLS Pattern (SiteSync, RouteAI, InspectorAI, StockPulse, ComplianceSnap)

```sql
-- For B2B apps: org-scoped access instead of user-scoped
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS policy scoped to org membership:
CREATE POLICY "Org members can view" ON [table]
  FOR SELECT USING (is_org_member(organization_id));
```

### Supabase Migration Pattern (from `invoiceai/supabase/migrations/005_create_invoices.sql`)

```sql
CREATE TABLE [name] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- [domain-specific columns]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_[name]_user_id ON [name](user_id);
CREATE INDEX idx_[name]_created_at ON [name](user_id, created_at DESC);

ALTER TABLE [name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own [name]" ON [name]
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own [name]" ON [name]
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own [name]" ON [name]
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own [name]" ON [name]
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER set_[name]_updated_at
  BEFORE UPDATE ON [name]
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Note: set_updated_at() function is defined in 001_init.sql
```

### Vercel Cron Configuration (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/[route-name]",
      "schedule": "0 9 * * *"
    }
  ]
}
```
Required in the project root for any project with a `/api/cron/` route. InvoiceAI runs at 9am UTC, PetOS at 8am UTC.

### UI Component Pattern (from `invoiceai/components/ui/button.tsx`)

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-700',
        outline: 'border border-[var(--border)] bg-[var(--background)]',
        ghost: 'text-[var(--foreground)] hover:bg-[var(--accent)]',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
// Design tokens use CSS variables: --background, --foreground, --border, --accent
// Brand color: brand-500, brand-600, brand-700
```

---

## Known Gotchas

1. **`proxy.ts` not `middleware.ts`**: Middleware is named `proxy.ts` to avoid Next.js auto-discovery. It still exports `middleware` and `config`. Do not rename it to `middleware.ts`.

2. **React Compiler is active** (`babel-plugin-react-compiler` in next.config.ts): Do not add `useMemo`/`useCallback` unless the React profiler shows an actual performance issue. The compiler handles this automatically.

3. **TailwindCSS v4**: Config is in `app/globals.css` using `@theme {}` directive. There is NO `tailwind.config.ts`. Custom colors like `brand-600` are defined in globals.css.

4. **`@supabase/ssr` v0.8**: The cookie handler MUST use `getAll()`/`setAll()` pattern. Do not simplify to `get()`/`set()` — it breaks session refresh.

5. **ComplianceSnap is a full Expo app** in `compliancesnap/` — it was converted from the original Vite+React scaffold to React Native/Expo SDK 52. Use Expo/RN patterns, not Next.js.

6. **Mobile apps need React Native/Expo**, not React DOM. Completely different component library (react-native instead of HTML elements). NativeWind 4.x for styling (requires both `babel.config.js` AND `tailwind.config.js`).

7. **Supabase Realtime for mobile**: RouteAI uses `ALTER PUBLICATION supabase_realtime ADD TABLE notifications, stops, jobs, drivers` in migrations. Must be added for Realtime channels to work.

8. **Landing pages must NOT redirect unauthenticated users to /login**: `app/page.tsx` should show a marketing page to anonymous visitors and only redirect authenticated users to `/dashboard`. Bouncing to `/login` is bad UX for marketing traffic.

9. **StockPulse PostgreSQL trigger**: `fn_apply_scan_to_inventory()` atomically updates stock quantity and creates stock alerts when stock ≤ reorder_point. Prevents race conditions from concurrent scans.

10. **Mobile Supabase client needs `detectSessionInUrl: false`**: Required for React Native — there are no URL redirects in native apps.

---

## Environment Variables

### All Web Projects Require
```bash
NEXT_PUBLIC_SUPABASE_URL=         # from Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # from Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=        # NEVER prefix with NEXT_PUBLIC_
OPENAI_API_KEY=                   # NEVER prefix with NEXT_PUBLIC_
```

### InvoiceAI Additional
```bash
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=           # NEXT_PUBLIC_ prefix ok
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### Mobile Apps Require
```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_OPENAI_API_KEY=
# App-specific (see each app's .env.example):
EXPO_PUBLIC_ELEVENLABS_API_KEY=   # FieldLens, AuraCheck
EXPO_PUBLIC_BLAND_API_KEY=        # Claimback
```

**SECURITY**: Never write `.env`, `.env.local`, or `.env.production` files. Use `.env.example` for templates only. The `.env` write hook will block this automatically.

---

## Known Gotchas (continued)

11. **GovPass uses anonymous onboarding flow**: `govpass/` does NOT use a traditional `(auth)/login` + `(auth)/signup` pattern. Instead it has `onboarding/` (language → household → scan-intro) for anonymous FPL eligibility checking. Do NOT add auth screens to GovPass.

12. **RouteAI uses Zustand auth store (not AuthGuard pattern)**: `routeai/app/login.tsx` is a direct screen (not in `(auth)` group). Auth state lives in `src/stores/auth.ts` (Zustand). The `AuthListener` component in `_layout.tsx` watches `supabase.auth.onAuthStateChange` and updates the store. This is a valid, intentional deviation from the standard pattern.

13. **ProposalPilot migration ordering**: `000_initial_schema.sql` (base tables) MUST run before `001_add_share_token.sql` (ALTER TABLE). The `000_` prefix is intentional — it runs first alphabetically.

14. **ClaimForge is org-scoped, not user-scoped**: The `claimforge/` schema has `organizations` → `users` → `cases` chain. Cases belong to orgs, not directly to auth.uid(). Server actions need to verify org membership, not just auth.uid() = user_id.

15. **Dashboard layout auth protection**: Every `app/(dashboard)/layout.tsx` MUST include `createClient().auth.getUser()` + `redirect('/login')` pattern. The layout is the auth gateway — individual page.tsx files should not need to re-redirect (though server actions still check for defense-in-depth).

---

## Infrastructure Summary (Session Feb 2026)

Fixes applied in the session that completed the portfolio:

### Web Apps
- **ClaimForge**: Added `lib/actions/reports.ts` + `lib/actions/team.ts`; converted all 6 'use client' mock-data pages to Server Components with real Supabase queries; fixed `app/(dashboard)/layout.tsx` to include auth redirect; added `proxy.ts` middleware; added `.env.example`
- **BoardBrief**: Created full 6-migration schema (001_profiles → 006_documents) with exact column names derived from server action code; columns verified against `types/database.ts`
- **ProposalPilot**: Created `000_initial_schema.sql` with 8 tables (profiles, clients, templates, template_sections, proposals, proposal_sections, content_blocks, ai_generations); the `is_default` split-RLS pattern for public template browsing
- **StoryThread**: Created `001_initial_schema.sql` with 6 tables (users, stories, chapters, characters, world_elements, ai_generations); `users` table named per `sharing.ts` query (not `profiles`)
- **NeighborDAO**: Added 5 DAO-specific migrations (proposals, votes, discussions, treasury) alongside existing neighborhood schema
- **All 10 web apps**: Added `.env.example` files; verified `proxy.ts` exists in all
- **Error boundaries**: `error.tsx` + `not-found.tsx` added to CompliBot, DealRoom, SkillBridge, NeighborDAO

### Mobile Apps
- **FieldLens, Mortal, Claimback, AuraCheck, InspectorAI**: Added `babel.config.js`, `tailwind.config.js`, UI components (Button/Card/Input/Badge), auth screens (login/signup), AuthGuard in `_layout.tsx`
- **StockPulse, SiteSync**: Added UI components, auth screens, AuthGuard; SiteSync got `tailwind.config.js`
- **RouteAI**: Already had UI components, `babel.config.js`, `tailwind.config.js`, and `app/login.tsx` (intentional non-standard auth)
- **GovPass**: Added `babel.config.js` + `tailwind.config.js`; NO auth screens (anonymous onboarding by design)
- **ComplianceSnap**: Added `babel.config.js`, `tailwind.config.js`, `(auth)/login.tsx`, `(auth)/signup.tsx`, AuthGuard in `_layout.tsx`

---

## Session Feb 2026 (Final) — Additional Fixes

### CompliBot Critical Fixes
- **`lib/actions/frameworks.ts`**: Added `FRAMEWORK_CONTROLS` map with 12-17 standard controls per framework (SOC 2, GDPR, HIPAA, ISO 27001, PCI DSS). `toggleFramework()` now seeds standard controls when a framework is first enabled. Added `recalculateFrameworkScore()` which `controls.ts` calls after every status change.
- **`lib/actions/controls.ts`**: `updateControlStatus()` now fetches `framework_id`, then calls `recalculateFrameworkScore()` to keep `compliance_score`, `controls_total`, `controls_compliant` accurate. Added `revalidatePath('/frameworks')`.
- **New: `lib/actions/ai.ts`**: `analyzeGapsFromControls()` — uses GPT-4o to analyze non-compliant/partial controls and generates gap records in DB. `generateFrameworkGaps()` wrapper for per-framework analysis.
- **New: `app/api/evidence/upload/route.ts`**: File upload to Supabase `compliance-evidence` storage bucket. Accepts PDF, images, Word/Excel, plain text up to 10 MB.

### New API Routes Added
- **`storythread/app/api/ai/generate/route.ts`**: Streaming AI writing assistant (SSE/ReadableStream). Supports 5 generation types: `continue`, `dialogue`, `rephrase`, `fix_prose`, `describe_scene`. Uses GPT-4o at temp=0.8.
- **`skillbridge/app/api/resume/upload/route.ts`**: Resume file upload to Supabase `resumes` storage. Accepts PDF, Word, text. Returns `publicUrl` + raw `textContent` for parsing.
- **`dealroom/app/api/deals/[id]/analyze/route.ts`**: Thin REST wrapper around the `analyzeDeal()` server action for client-side polling use.

---

## Portfolio Status: ALL 20 PROJECTS COMPLETE ✅

All phases of development are done. If continuing work in a new session:

1. Run `/project-audit` in any specific project directory to get a factual status
2. Use `rls-reviewer` agent on any new migrations before applying
3. Use `integration-checker` agent when wiring new server actions to client components
4. Use Playwright MCP to smoke-test features at localhost:3000

**Reference files (canonical patterns — do not modify):**
- `invoiceai/lib/actions/invoices.ts` — canonical server action pattern
- `invoiceai/supabase/migrations/005_create_invoices.sql` — canonical RLS migration
- `invoiceai/components/ui/button.tsx` — canonical UI component (cva + cn)
- `claimforge/app/(dashboard)/cases/[id]/page.tsx` → `case-detail-client.tsx` — canonical Server Component + 'use client' delegate pattern
- `complibot/lib/actions/frameworks.ts` → `FRAMEWORK_CONTROLS` map — canonical control seeding pattern
