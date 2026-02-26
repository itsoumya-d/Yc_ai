'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProposalView, ProposalAnalytics } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

/**
 * Record a view event when a shared proposal is accessed.
 * Called from the public share page.
 */
export async function recordProposalView(
  proposalId: string,
  viewData: {
    device_type?: string;
    browser?: string;
    duration_seconds?: number;
    scroll_depth?: number;
    sections_viewed?: string[];
  }
): Promise<ActionResult<ProposalView>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('proposal_views').insert({
    proposal_id: proposalId,
    device_type: viewData.device_type || null,
    browser: viewData.browser || null,
    duration_seconds: viewData.duration_seconds || 0,
    scroll_depth: viewData.scroll_depth || 0,
    sections_viewed: viewData.sections_viewed || [],
  }).select().single();

  if (error) {
    // If the table doesn't exist yet, silently fail
    console.error('Failed to record proposal view:', error.message);
    return { error: error.message };
  }

  return { data: data as ProposalView };
}

/**
 * Update an existing view record with duration and scroll depth.
 * Called on page unload/visibility change.
 */
export async function updateProposalView(
  viewId: string,
  updates: {
    duration_seconds: number;
    scroll_depth: number;
    sections_viewed: string[];
  }
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from('proposal_views').update({
    duration_seconds: updates.duration_seconds,
    scroll_depth: updates.scroll_depth,
    sections_viewed: updates.sections_viewed,
  }).eq('id', viewId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Get analytics data for a specific proposal.
 * Called from the proposal detail page (authenticated).
 */
export async function getProposalAnalytics(proposalId: string): Promise<ActionResult<ProposalAnalytics>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify proposal belongs to user
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .single();

  if (proposalError || !proposal) return { error: 'Proposal not found' };

  // Fetch all views for this proposal
  const { data: views, error: viewsError } = await supabase
    .from('proposal_views')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false });

  // If table doesn't exist, return empty analytics
  if (viewsError) {
    return {
      data: {
        total_views: 0,
        unique_viewers: 0,
        avg_duration_seconds: 0,
        max_scroll_depth: 0,
        last_viewed_at: null,
        views_by_day: [],
      },
    };
  }

  const allViews = (views ?? []) as ProposalView[];

  // Compute aggregate metrics
  const total_views = allViews.length;
  const unique_ips = new Set(allViews.map((v) => v.viewer_ip).filter(Boolean));
  const unique_viewers = unique_ips.size || total_views; // Fallback to total if no IP data
  const avg_duration_seconds = total_views > 0
    ? Math.round(allViews.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / total_views)
    : 0;
  const max_scroll_depth = allViews.reduce((max, v) => Math.max(max, v.scroll_depth || 0), 0);
  const last_viewed_at = allViews.length > 0 ? allViews[0].created_at : null;

  // Group views by day for chart
  const dayMap = new Map<string, number>();
  allViews.forEach((v) => {
    const day = v.created_at.split('T')[0];
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  });
  const views_by_day = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    data: {
      total_views,
      unique_viewers,
      avg_duration_seconds,
      max_scroll_depth,
      last_viewed_at,
      views_by_day,
    },
  };
}

/**
 * Get aggregate analytics across all proposals (for dashboard).
 */
export async function getDashboardAnalytics(): Promise<ActionResult<{
  totalViews: number;
  avgEngagement: number;
  viewsThisWeek: number;
  topProposals: { id: string; title: string; views: number }[];
}>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get user's proposal IDs
  const { data: proposals, error: proposalError } = await supabase
    .from('proposals')
    .select('id, title')
    .eq('user_id', user.id);

  if (proposalError || !proposals) return { data: { totalViews: 0, avgEngagement: 0, viewsThisWeek: 0, topProposals: [] } };

  const proposalIds = proposals.map((p) => p.id);
  if (proposalIds.length === 0) return { data: { totalViews: 0, avgEngagement: 0, viewsThisWeek: 0, topProposals: [] } };

  // Fetch all views for user's proposals
  const { data: views, error: viewsError } = await supabase
    .from('proposal_views')
    .select('*')
    .in('proposal_id', proposalIds);

  if (viewsError) return { data: { totalViews: 0, avgEngagement: 0, viewsThisWeek: 0, topProposals: [] } };

  const allViews = (views ?? []) as ProposalView[];
  const totalViews = allViews.length;
  const avgEngagement = totalViews > 0
    ? Math.round(allViews.reduce((sum, v) => sum + (v.scroll_depth || 0), 0) / totalViews)
    : 0;

  // Views this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const viewsThisWeek = allViews.filter((v) => new Date(v.created_at) > weekAgo).length;

  // Top proposals by view count
  const viewCounts = new Map<string, number>();
  allViews.forEach((v) => {
    viewCounts.set(v.proposal_id, (viewCounts.get(v.proposal_id) || 0) + 1);
  });
  const proposalMap = new Map(proposals.map((p) => [p.id, p.title]));
  const topProposals = Array.from(viewCounts.entries())
    .map(([id, count]) => ({ id, title: proposalMap.get(id) || 'Untitled', views: count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { data: { totalViews, avgEngagement, viewsThisWeek, topProposals } };
}
