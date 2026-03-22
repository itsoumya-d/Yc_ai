import { SupabaseClient } from '@supabase/supabase-js';

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPageOptions {
  cursor?: string; // ISO timestamp of last item's created_at
  limit?: number;
}

/**
 * Cursor-based pagination using created_at as cursor.
 * Avoids OFFSET pagination which degrades at scale (full table scan).
 *
 * Usage:
 *   const page = await cursorPage(supabase, 'invoices', { userId }, { cursor, limit: 25 });
 */
export async function cursorPage<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, unknown>,
  { cursor, limit = 25 }: CursorPageOptions = {}
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1); // fetch one extra to detect hasMore

  // Apply equality filters (user_id, org_id, status, etc.)
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  // Cursor: return items older than the cursor timestamp
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as T[];
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  // Next cursor = created_at of the last item in the page
  const lastItem = page[page.length - 1] as Record<string, unknown> | undefined;
  const nextCursor = hasMore && lastItem
    ? (lastItem.created_at as string)
    : null;

  return { data: page, nextCursor, hasMore };
}

/**
 * Cursor-based pagination with custom column ordering.
 * For tables sorted by non-created_at columns (e.g., score DESC, due_date ASC).
 */
export async function cursorPageByColumn<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  filters: Record<string, unknown>,
  orderColumn: string,
  orderAscending: boolean,
  { cursor, limit = 25 }: CursorPageOptions = {}
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: orderAscending })
    .order('id', { ascending: true }) // stable secondary sort
    .limit(limit + 1);

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  if (cursor) {
    if (orderAscending) {
      query = query.gt(orderColumn, cursor);
    } else {
      query = query.lt(orderColumn, cursor);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as T[];
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;

  const lastItem = page[page.length - 1] as Record<string, unknown> | undefined;
  const nextCursor = hasMore && lastItem
    ? String(lastItem[orderColumn])
    : null;

  return { data: page, nextCursor, hasMore };
}
