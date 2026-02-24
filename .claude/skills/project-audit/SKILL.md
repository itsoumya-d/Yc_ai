---
name: project-audit
description: Audit the current project directory for production readiness. Scans the actual file structure against the portfolio's standard checklist and produces a factual completion table plus prioritized task list. Run this at the start of every session to get ground-truth status.
---

Perform a production readiness audit of the project in the current working directory (or a specified project directory).

## Step 1: Identify the Project

Read `package.json` to get the project name. Then determine the project type:
- If `next.config.ts` or `next.config.js` exists → **Next.js web app**
- If `app.json` and `expo` in package.json → **React Native/Expo mobile app**
- If `vite.config.ts` exists without Next.js → **Vite app** (ComplianceSnap)

## Step 2: Scan File Structure

Check for existence of these paths (do NOT assume — verify each one):

### Infrastructure
- [ ] `app/(auth)/login/page.tsx` or equivalent auth routes
- [ ] `app/(auth)/signup/page.tsx`
- [ ] `app/auth/callback/route.ts`
- [ ] `proxy.ts` or `middleware.ts` (with `updateSession` call)
- [ ] `.env.example` (verify it lists env vars, not empty)
- [ ] `app/error.tsx`
- [ ] `app/(dashboard)/error.tsx` or equivalent

### Database
- [ ] `supabase/migrations/` directory exists with at least one `.sql` file
- For each migration file: check if `ENABLE ROW LEVEL SECURITY` appears
- Count total migration files

### Backend (Server Actions)
- [ ] `lib/actions/` directory exists
- List all files in `lib/actions/`
- For each action file: check if it has `'use server'` and basic CRUD exports
- [ ] `app/api/` directory — list all route files

### Frontend (App Routes)
- List all directories in `app/(dashboard)/` — these are the dashboard pages
- For each: check if `page.tsx` exists
- Open 2-3 random page.tsx files and check for TODO comments or empty returns
- Check `components/ui/` for: button, card, input, badge, dialog, skeleton

### Business Logic / Integrations
- Check `lib/openai/` — does it have more than just a client.ts?
- Check `app/api/ai/` or similar — does it have actual API calls?
- Check `lib/stripe/` if applicable
- Check `lib/email/` or `lib/sendgrid/` if applicable

## Step 3: Produce Completion Report

Output a formatted report:

```
PROJECT AUDIT: [project name]
Audit Date: [today]

COMPLETION TABLE:
┌─────────────────────────────┬────────┬─────────────────────────────────────────┐
│ Area                        │ Status │ Details                                 │
├─────────────────────────────┼────────┼─────────────────────────────────────────┤
│ Auth flows                  │ ✅/⚠️/❌ │ [what exists / what's missing]          │
│ Middleware (session refresh) │ ✅/⚠️/❌ │                                         │
│ Environment documented      │ ✅/⚠️/❌ │                                         │
│ Error handling              │ ✅/⚠️/❌ │                                         │
│ Database migrations         │ ✅/⚠️/❌ │ [X tables, Y with RLS]                  │
│ RLS on all tables           │ ✅/⚠️/❌ │                                         │
│ Server actions (complete)   │ ✅/⚠️/❌ │ [X files, Y with full CRUD]             │
│ API routes                  │ ✅/⚠️/❌ │ [list routes]                           │
│ Dashboard pages             │ ✅/⚠️/❌ │ [X of Y routes have page.tsx]           │
│ Real page content           │ ✅/⚠️/❌ │ [any TODOs found?]                      │
│ UI component library        │ ✅/⚠️/❌ │ [components found]                      │
│ AI integration              │ ✅/⚠️/❌ │ [just client? or actual API calls?]     │
│ Payment integration         │ ✅/⚠️/❌ │ [if applicable]                         │
│ Email integration           │ ✅/⚠️/❌ │ [if applicable]                         │
└─────────────────────────────┴────────┴─────────────────────────────────────────┘

ESTIMATED COMPLETION: ~X%

PRIORITY TASK LIST (top 5, highest user impact first):
1. [CRITICAL] [Task] — [Why it blocks launch] — est. X hours
2. [HIGH] [Task] — [Impact] — est. X hours
3. [HIGH] [Task] — [Impact] — est. X hours
4. [MEDIUM] [Task] — [Impact] — est. X hours
5. [MEDIUM] [Task] — [Impact] — est. X hours

ESTIMATED HOURS TO LAUNCH-READY: X-Y hours
```

## Status Legend
- ✅ Complete and production-quality
- ⚠️ Exists but incomplete or has stubs/TODOs
- ❌ Missing entirely

## Important
- Base all findings on actual file contents and existence — do NOT assume anything is complete without verifying
- If a file exists but contains only `<div>TODO</div>` or a skeleton, mark as ⚠️ not ✅
- Check the project's README or spec in `saas-ideas/` to understand what features the app is supposed to have
