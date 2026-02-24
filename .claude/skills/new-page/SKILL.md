---
name: new-page
description: Scaffold a new dashboard page following the portfolio's Next.js 16 Server Component pattern. Generates page.tsx (Server Component), loading.tsx (skeleton), and the client list/detail component. Also creates the server action file if it doesn't exist. Arguments: "route-name | Entity Name | action-file-name" (e.g., "appointments | Appointment | appointments")
---

Scaffold a complete new dashboard page for the current Next.js 16 project.

## Parse Arguments

From `$ARGUMENTS`, extract:
- `route-name`: the URL segment (e.g., `appointments` → `/dashboard/appointments`)
- `Entity Name`: Pascal case singular name (e.g., `Appointment`)
- `action-file-name`: the server action filename without `.ts` (e.g., `appointments`)

## Step 1: Check Existing Files

Before generating, check:
1. Does `app/(dashboard)/[route-name]/page.tsx` already exist? If yes, warn and describe what exists.
2. Does `lib/actions/[action-file-name].ts` already exist? If yes, read it to understand the return types.
3. What types exist in `types/database.ts` for this entity?
4. What does the sidebar/navigation component look like? (Find it in `components/layout/`) to understand the nav pattern.
5. Check another existing page (e.g., `app/(dashboard)/invoices/page.tsx` or `app/(dashboard)/clients/page.tsx`) for the exact project-specific pattern to follow.

## Step 2: Generate `lib/actions/[action-file-name].ts`

Only generate if the file doesn't exist. Follow the canonical pattern:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { [EntityName] } from '@/types/database';

export interface [EntityName]FormData {
  // [Required fields based on the entity — infer from context or ask]
  // Always include the entity's required columns from the migration
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: [EntityName];
}

interface [EntityName]ListResult {
  [entityNamePlural]: [EntityName][];
  total: number;
  error?: string;
}

export async function get[EntityNamePlural](options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<[EntityName]ListResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { [entityNamePlural]: [], total: 0, error: 'Not authenticated' };

  const { search, page = 1, pageSize = 20 } = options ?? {};

  let query = supabase
    .from('[table-name]')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`); // adjust column as needed
  }

  const { data, error, count } = await query;
  if (error) return { [entityNamePlural]: [], total: 0, error: error.message };
  return { [entityNamePlural]: (data ?? []) as [EntityName][], total: count ?? 0 };
}

export async function get[EntityName](id: string): Promise<{ success: boolean; error?: string; data?: [EntityName] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('[table-name]')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // ensure user can only access own records
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as [EntityName] };
}

export async function create[EntityName](formData: [EntityName]FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('[table-name]')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/[route-name]');
  return { success: true, data: data as [EntityName] };
}

export async function update[EntityName](id: string, formData: Partial<[EntityName]FormData>): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('[table-name]')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/[route-name]');
  revalidatePath(`/[route-name]/${id}`);
  return { success: true, data: data as [EntityName] };
}

export async function delete[EntityName](id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('[table-name]')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/[route-name]');
  return { success: true };
}
```

## Step 3: Generate `app/(dashboard)/[route-name]/page.tsx`

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { get[EntityNamePlural] } from '@/lib/actions/[action-file-name]';
import { [EntityName]List } from '@/components/[route-name]/[entity-name]-list';
import { [EntityName]ListSkeleton } from '@/components/[route-name]/[entity-name]-list-skeleton';

export default async function [EntityName]sPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { [entityNamePlural], total, error } = await get[EntityNamePlural]();

  if (error) {
    // The error.tsx boundary will catch thrown errors;
    // for soft errors, show empty state
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">[EntityNamePlural]</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{total} total</p>
        </div>
        {/* Add Create button here */}
      </div>

      <Suspense fallback={<[EntityName]ListSkeleton />}>
        <[EntityName]List
          [entityNamePlural]={[entityNamePlural]}
          total={total}
        />
      </Suspense>
    </div>
  );
}
```

## Step 4: Generate `app/(dashboard)/[route-name]/loading.tsx`

Follow the exact skeleton pattern used by other loading.tsx files in this project. Look at an existing one (e.g., `app/(dashboard)/invoices/loading.tsx`) and match its structure.

## Step 5: Generate `components/[route-name]/[entity-name]-list.tsx`

```typescript
'use client';

import { useState } from 'react';
import type { [EntityName] } from '@/types/database';
// Import UI components matching what this project uses

interface [EntityName]ListProps {
  [entityNamePlural]: [EntityName][];
  total: number;
}

export function [EntityName]List({ [entityNamePlural], total }: [EntityName]ListProps) {
  if ([entityNamePlural].length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[var(--muted-foreground)]">No [entityNamePlural] yet</p>
        {/* Empty state with create CTA */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[entityNamePlural].map(([entityNameSingular]) => (
        <div key={[entityNameSingular].id}>
          {/* Render entity card/row */}
        </div>
      ))}
    </div>
  );
}
```

## Step 6: Output Summary

List all files generated and any TODOs left for the developer:
- Which column names need to be filled in (based on the actual DB schema)
- Which UI components to import from `components/ui/`
- Next step: run `/new-migration` if the table doesn't exist yet
