'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

interface ActionResult<T = null> { data?: T; error?: string; }

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  name: string;
  description: string | null;
  organization_name: string | null;
  meeting_frequency: string;
  fiscal_year_start: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BoardWithMeta extends Board {
  member_count: number;
  next_meeting_date: string | null;
  user_role: string;
}

export interface BoardMembership {
  id: string;
  board_id: string;
  user_id: string | null;
  email: string;
  role: string;
  status: string;
  joined_at: string;
  user_name?: string;
}

export interface CrossBoardAnalytics {
  boards: {
    id: string;
    name: string;
    total_meetings: number;
    pending_action_items: number;
    completed_action_items: number;
    overdue_action_items: number;
    upcoming_votes: number;
    meeting_frequency_score: number;
  }[];
  upcoming_meetings: {
    id: string;
    title: string;
    scheduled_at: string;
    board_name: string;
    board_id: string;
  }[];
  total_boards: number;
  total_meetings: number;
  total_pending_actions: number;
  total_overdue_actions: number;
}

// ─── Validation ────────────────────────────────────────────────────────────

const boardSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  organization_name: z.string().max(200).optional(),
  meeting_frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annual']).default('monthly'),
  fiscal_year_start: z.number().int().min(1).max(12).default(1),
});

export type BoardInput = z.infer<typeof boardSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, boardId: string): Promise<boolean> {
  const { data } = await supabase
    .from('board_memberships')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  return !!data;
}

// ─── Actions ───────────────────────────────────────────────────────────────

export async function getBoards(userId?: string): Promise<ActionResult<BoardWithMeta[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const uid = userId || user.id;

  // Get all boards this user is a member of
  const { data: memberships, error: memErr } = await supabase
    .from('board_memberships')
    .select('board_id, role')
    .eq('user_id', uid)
    .in('status', ['active']);

  if (memErr) return { error: memErr.message };
  if (!memberships || memberships.length === 0) return { data: [] };

  const boardIds = memberships.map(m => m.board_id);
  const roleMap = Object.fromEntries(memberships.map(m => [m.board_id, m.role]));

  // Get boards
  const { data: boards, error: boardErr } = await supabase
    .from('boards')
    .select('*')
    .in('id', boardIds)
    .order('name');

  if (boardErr) return { error: boardErr.message };
  if (!boards) return { data: [] };

  // Get member counts per board
  const { data: memberCounts } = await supabase
    .from('board_memberships')
    .select('board_id')
    .in('board_id', boardIds)
    .eq('status', 'active');

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach(m => {
    countMap[m.board_id] = (countMap[m.board_id] || 0) + 1;
  });

  // Get next meeting per board (from meetings table if it has a board_id column, or fall back)
  // For now we compute next_meeting_date as null — can be enhanced when meetings are linked
  const result: BoardWithMeta[] = boards.map(b => ({
    ...b,
    member_count: countMap[b.id] || 0,
    next_meeting_date: null,
    user_role: roleMap[b.id] || 'member',
  }));

  return { data: result };
}

export async function getBoard(boardId: string): Promise<ActionResult<Board & { members: BoardMembership[]; user_role: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check membership
  const { data: membership } = await supabase
    .from('board_memberships')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'Board not found or access denied' };

  const [boardRes, membersRes] = await Promise.all([
    supabase.from('boards').select('*').eq('id', boardId).single(),
    supabase.from('board_memberships').select('*').eq('board_id', boardId).order('joined_at'),
  ]);

  if (boardRes.error) return { error: boardRes.error.message };

  return {
    data: {
      ...(boardRes.data as Board),
      members: (membersRes.data ?? []) as BoardMembership[],
      user_role: membership.role,
    },
  };
}

export async function createBoard(input: BoardInput): Promise<ActionResult<Board>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = boardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  // Insert board
  const { data: board, error } = await supabase
    .from('boards')
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      organization_name: parsed.data.organization_name || null,
      meeting_frequency: parsed.data.meeting_frequency,
      fiscal_year_start: parsed.data.fiscal_year_start,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add creator as admin
  await supabase.from('board_memberships').insert({
    board_id: board.id,
    user_id: user.id,
    email: user.email!,
    role: 'admin',
    status: 'active',
  });

  revalidatePath('/boards');
  return { data: board as Board };
}

export async function updateBoard(boardId: string, input: Partial<BoardInput>): Promise<ActionResult<Board>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const isAdmin = await assertAdmin(supabase, user.id, boardId);
  if (!isAdmin) return { error: 'Only admins can update board settings' };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.organization_name !== undefined) updates.organization_name = input.organization_name || null;
  if (input.meeting_frequency !== undefined) updates.meeting_frequency = input.meeting_frequency;
  if (input.fiscal_year_start !== undefined) updates.fiscal_year_start = input.fiscal_year_start;

  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/boards');
  revalidatePath(`/boards/${boardId}`);
  return { data: data as Board };
}

export async function deleteBoard(boardId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const isAdmin = await assertAdmin(supabase, user.id, boardId);
  if (!isAdmin) return { error: 'Only admins can delete boards' };

  const { error } = await supabase.from('boards').delete().eq('id', boardId);
  if (error) return { error: error.message };

  revalidatePath('/boards');
  return {};
}

export async function inviteMember(boardId: string, email: string, role: string): Promise<ActionResult<BoardMembership>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const isAdmin = await assertAdmin(supabase, user.id, boardId);
  if (!isAdmin) return { error: 'Only admins can invite members' };

  if (!['admin', 'secretary', 'member', 'observer'].includes(role)) {
    return { error: 'Invalid role' };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('board_memberships')
    .select('id, status')
    .eq('board_id', boardId)
    .eq('email', email)
    .single();

  if (existing && existing.status === 'active') {
    return { error: 'This person is already a member of this board' };
  }

  if (existing) {
    // Reactivate
    const { data, error } = await supabase
      .from('board_memberships')
      .update({ role, status: 'pending', joined_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return { error: error.message };
    revalidatePath(`/boards/${boardId}`);
    return { data: data as BoardMembership };
  }

  // Look up user by email for user_id linking
  const { data: targetUser } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single()
    .catch(() => ({ data: null })) as { data: { id: string } | null };

  const { data, error } = await supabase
    .from('board_memberships')
    .insert({
      board_id: boardId,
      user_id: targetUser?.id || null,
      email,
      role,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { data: data as BoardMembership };
}

export async function updateMemberRole(boardId: string, memberId: string, role: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const isAdmin = await assertAdmin(supabase, user.id, boardId);
  if (!isAdmin) return { error: 'Only admins can change roles' };

  if (!['admin', 'secretary', 'member', 'observer'].includes(role)) {
    return { error: 'Invalid role' };
  }

  const { error } = await supabase
    .from('board_memberships')
    .update({ role })
    .eq('id', memberId)
    .eq('board_id', boardId);

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return {};
}

export async function removeMember(boardId: string, memberId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const isAdmin = await assertAdmin(supabase, user.id, boardId);
  if (!isAdmin) return { error: 'Only admins can remove members' };

  // Prevent removing the last admin
  const { data: admins } = await supabase
    .from('board_memberships')
    .select('id')
    .eq('board_id', boardId)
    .eq('role', 'admin')
    .eq('status', 'active');

  const { data: target } = await supabase
    .from('board_memberships')
    .select('role')
    .eq('id', memberId)
    .single();

  if (target?.role === 'admin' && admins && admins.length <= 1) {
    return { error: 'Cannot remove the last admin. Transfer admin role first.' };
  }

  const { error } = await supabase
    .from('board_memberships')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .eq('board_id', boardId);

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return {};
}

export async function switchActiveBoard(boardId: string | null): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Upsert preference
  const { error } = await supabase
    .from('user_board_preferences')
    .upsert({
      user_id: user.id,
      active_board_id: boardId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  revalidatePath('/');
  return {};
}

export async function getActiveBoard(): Promise<ActionResult<{ board_id: string | null }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data } = await supabase
    .from('user_board_preferences')
    .select('active_board_id')
    .eq('user_id', user.id)
    .single();

  return { data: { board_id: data?.active_board_id ?? null } };
}

export async function getCrossBoardAnalytics(): Promise<ActionResult<CrossBoardAnalytics>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get all boards this user belongs to
  const { data: memberships } = await supabase
    .from('board_memberships')
    .select('board_id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (!memberships || memberships.length === 0) {
    return {
      data: {
        boards: [],
        upcoming_meetings: [],
        total_boards: 0,
        total_meetings: 0,
        total_pending_actions: 0,
        total_overdue_actions: 0,
      },
    };
  }

  const boardIds = memberships.map(m => m.board_id);

  // Get board names
  const { data: boards } = await supabase
    .from('boards')
    .select('id, name')
    .in('id', boardIds);

  const boardNameMap = Object.fromEntries((boards ?? []).map(b => [b.id, b.name]));

  // Get meetings count — from the user's meetings for now (global meeting table)
  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, scheduled_at, status')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true });

  // Get action items
  const { data: actionItems } = await supabase
    .from('action_items')
    .select('id, status, due_date')
    .eq('user_id', user.id);

  const now = new Date().toISOString();
  const pendingActions = (actionItems ?? []).filter(a => a.status === 'open' || a.status === 'in_progress');
  const overdueActions = pendingActions.filter(a => a.due_date && a.due_date < now);
  const completedActions = (actionItems ?? []).filter(a => a.status === 'completed');

  const upcomingMeetings = (meetings ?? [])
    .filter(m => m.scheduled_at && m.scheduled_at > now && m.status !== 'canceled')
    .slice(0, 10)
    .map(m => ({
      id: m.id,
      title: m.title,
      scheduled_at: m.scheduled_at!,
      board_name: boards?.[0]?.name ?? 'Default Board',
      board_id: boards?.[0]?.id ?? '',
    }));

  // Build per-board analytics (distributed across boards evenly for now)
  const boardAnalytics = (boards ?? []).map(b => ({
    id: b.id,
    name: b.name,
    total_meetings: Math.ceil((meetings ?? []).length / boardIds.length),
    pending_action_items: Math.ceil(pendingActions.length / boardIds.length),
    completed_action_items: Math.ceil(completedActions.length / boardIds.length),
    overdue_action_items: Math.ceil(overdueActions.length / boardIds.length),
    upcoming_votes: 0,
    meeting_frequency_score: Math.min(100, Math.ceil(((meetings ?? []).length / boardIds.length) * 20)),
  }));

  return {
    data: {
      boards: boardAnalytics,
      upcoming_meetings: upcomingMeetings,
      total_boards: boardIds.length,
      total_meetings: (meetings ?? []).length,
      total_pending_actions: pendingActions.length,
      total_overdue_actions: overdueActions.length,
    },
  };
}
