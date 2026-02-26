'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Post, Event, Vote } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getDashboardStats(
  neighborhoodId: string
): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [
    membersResult,
    votesResult,
    eventsResult,
    ordersResult,
    incomeResult,
    expenseResult,
    resourcesResult,
  ] = await Promise.all([
    supabase
      .from('neighborhood_members')
      .select('*', { count: 'exact', head: true })
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active'),
    supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'upcoming'),
    supabase
      .from('group_orders')
      .select('*', { count: 'exact', head: true })
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'open'),
    supabase
      .from('treasury_entries')
      .select('amount')
      .eq('neighborhood_id', neighborhoodId)
      .eq('type', 'income'),
    supabase
      .from('treasury_entries')
      .select('amount')
      .eq('neighborhood_id', neighborhoodId)
      .eq('type', 'expense'),
    supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('neighborhood_id', neighborhoodId),
  ]);

  const totalIncome = (incomeResult.data || []).reduce(
    (sum: number, entry: { amount: number }) => sum + entry.amount,
    0
  );
  const totalExpenses = (expenseResult.data || []).reduce(
    (sum: number, entry: { amount: number }) => sum + entry.amount,
    0
  );

  return {
    data: {
      memberCount: membersResult.count ?? 0,
      activeVotes: votesResult.count ?? 0,
      upcomingEvents: eventsResult.count ?? 0,
      openOrders: ordersResult.count ?? 0,
      treasuryBalance: totalIncome - totalExpenses,
      sharedResources: resourcesResult.count ?? 0,
    },
  };
}

export async function getRecentActivity(
  neighborhoodId: string
): Promise<
  ActionResult<{
    recentPosts: Post[];
    recentEvents: Event[];
    activeVotes: Vote[];
  }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [postsResult, eventsResult, votesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:users!author_id(*)')
      .eq('neighborhood_id', neighborhoodId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('events')
      .select('*, organizer:users!organizer_id(*)')
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'upcoming')
      .order('start_date', { ascending: true })
      .limit(3),
    supabase
      .from('votes')
      .select('*, author:users!author_id(*)')
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  if (postsResult.error) return { error: postsResult.error.message };
  if (eventsResult.error) return { error: eventsResult.error.message };
  if (votesResult.error) return { error: votesResult.error.message };

  return {
    data: {
      recentPosts: postsResult.data as Post[],
      recentEvents: eventsResult.data as Event[],
      activeVotes: votesResult.data as Vote[],
    },
  };
}
