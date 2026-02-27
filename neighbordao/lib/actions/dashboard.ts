'use server';

import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validations/schemas';
import type { ActionResult, User } from '@/types/database';

interface DashboardStats {
  postCount: number;
  activeOrders: number;
  upcomingEvents: number;
  activeVotes: number;
  resourceCount: number;
  treasuryBalance: number;
  memberCount: number;
}

export async function fetchDashboardStats(
  neighborhoodId: string
): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const [posts, orders, events, votes, resources, treasury, members] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).is('parent_id', null),
    supabase.from('group_orders').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).in('status', ['open', 'locked', 'ordered']),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).gte('starts_at', new Date().toISOString()),
    supabase.from('votes').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).eq('status', 'active'),
    supabase.from('resources').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).eq('status', 'available'),
    supabase.from('treasury_entries').select('entry_type, amount').eq('neighborhood_id', neighborhoodId),
    supabase.from('neighborhood_members').select('id', { count: 'exact', head: true }).eq('neighborhood_id', neighborhoodId).eq('status', 'active'),
  ]);

  let balance = 0;
  for (const entry of treasury.data ?? []) {
    if (entry.entry_type === 'income') balance += Number(entry.amount);
    else balance -= Number(entry.amount);
  }

  return {
    success: true,
    data: {
      postCount: posts.count ?? 0,
      activeOrders: orders.count ?? 0,
      upcomingEvents: events.count ?? 0,
      activeVotes: votes.count ?? 0,
      resourceCount: resources.count ?? 0,
      treasuryBalance: balance,
      memberCount: members.count ?? 0,
    },
  };
}

export async function fetchProfile(): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as User };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { success: false, error: 'Not authenticated' };

  const raw = {
    display_name: (formData.get('display_name') as string) || null,
    bio: (formData.get('bio') as string) || null,
    phone: (formData.get('phone') as string) || null,
    skills: formData.get('skills')
      ? (formData.get('skills') as string).split(',').map((s) => s.trim()).filter(Boolean)
      : null,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.display_name !== undefined) updateData.display_name = parsed.data.display_name;
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.skills !== undefined) updateData.skills = parsed.data.skills;

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', authUser.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
