'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TeamMember, UserRole } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get current user's org
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
    .order('joined_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as TeamMember[] };
}

export async function getTeamMember(memberId: string): Promise<ActionResult<TeamMember>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', memberId)
    .single();

  if (error) return { error: error.message };
  return { data: data as TeamMember };
}

export async function inviteTeamMember(
  email: string,
  role: UserRole,
  name: string
): Promise<ActionResult<TeamMember>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };
  if (profile.role !== 'admin') return { error: 'Only admins can invite team members' };

  // Check if member already exists
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('email', email)
    .eq('organization_id', profile.organization_id)
    .single();

  if (existing) return { error: 'A team member with this email already exists' };

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      full_name: name,
      email,
      role,
      status: 'invited',
      organization_id: profile.organization_id,
      cases_assigned: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/team');
  return { data: data as TeamMember };
}

export async function updateMemberRole(
  memberId: string,
  role: UserRole
): Promise<ActionResult<TeamMember>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Only admins can update member roles' };

  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/team');
  return { data: data as TeamMember };
}

export async function deactivateMember(memberId: string): Promise<ActionResult<TeamMember>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Only admins can deactivate members' };

  const { data, error } = await supabase
    .from('team_members')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/team');
  return { data: data as TeamMember };
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Only admins can remove members' };

  const { error } = await supabase.from('team_members').delete().eq('id', memberId);

  if (error) return { error: error.message };

  revalidatePath('/team');
  return {};
}
