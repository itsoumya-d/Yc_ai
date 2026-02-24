'use server';
import { createClient } from '@/lib/supabase/server';

export interface TeamMemberItem {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getTeamMembers(): Promise<ActionResult<TeamMemberItem[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Return current user as team member (solo plan)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const member: TeamMemberItem = {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || null,
    role: 'admin',
    created_at: user.created_at,
  };

  return { data: [member] };
}
