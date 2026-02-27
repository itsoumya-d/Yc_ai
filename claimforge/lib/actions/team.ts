'use server';

import { createClient } from '@/lib/supabase/server';
import type { TeamMember } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get user's org
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('full_name');

  if (error) return { error: error.message };
  return { data: data as TeamMember[] };
}
