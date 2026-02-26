'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { NeighborhoodMember } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getMembers(
  neighborhoodId: string
): Promise<ActionResult<NeighborhoodMember[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('neighborhood_members')
    .select('*, user:users!user_id(*)')
    .eq('neighborhood_id', neighborhoodId)
    .order('role', { ascending: true })
    .order('joined_at', { ascending: true });

  if (error) return { error: error.message };
  return { data: data as NeighborhoodMember[] };
}

export async function getMember(
  userId: string,
  neighborhoodId: string
): Promise<ActionResult<NeighborhoodMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('neighborhood_members')
    .select('*, user:users!user_id(*)')
    .eq('user_id', userId)
    .eq('neighborhood_id', neighborhoodId)
    .single();

  if (error) return { error: error.message };
  return { data: data as NeighborhoodMember };
}

export async function updateMemberRole(
  memberId: string,
  role: NeighborhoodMember['role']
): Promise<ActionResult<NeighborhoodMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify current user is admin
  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('neighborhood_id')
    .eq('id', memberId)
    .single();

  if (!member) return { error: 'Member not found' };

  const { data: currentMember } = await supabase
    .from('neighborhood_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('neighborhood_id', member.neighborhood_id)
    .single();

  if (!currentMember || currentMember.role !== 'admin') {
    return { error: 'Only admins can update member roles' };
  }

  const { data: updated, error } = await supabase
    .from('neighborhood_members')
    .update({ role })
    .eq('id', memberId)
    .select('*, user:users!user_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/members');
  return { data: updated as NeighborhoodMember };
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify current user is admin
  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('neighborhood_id, user_id')
    .eq('id', memberId)
    .single();

  if (!member) return { error: 'Member not found' };

  const { data: currentMember } = await supabase
    .from('neighborhood_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('neighborhood_id', member.neighborhood_id)
    .single();

  if (!currentMember || currentMember.role !== 'admin') {
    return { error: 'Only admins can remove members' };
  }

  // Prevent self-removal
  if (member.user_id === user.id) {
    return { error: 'Cannot remove yourself from the neighborhood' };
  }

  const { error } = await supabase
    .from('neighborhood_members')
    .delete()
    .eq('id', memberId);

  if (error) return { error: error.message };

  // Decrement member_count on neighborhood
  const { data: neighborhood } = await supabase
    .from('neighborhoods')
    .select('member_count')
    .eq('id', member.neighborhood_id)
    .single();

  if (neighborhood) {
    await supabase
      .from('neighborhoods')
      .update({ member_count: Math.max(0, neighborhood.member_count - 1) })
      .eq('id', member.neighborhood_id);
  }

  revalidatePath('/members');
  revalidatePath('/dashboard');
  return {};
}

export async function inviteMember(
  neighborhoodId: string,
  email: string
): Promise<ActionResult<NeighborhoodMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify current user is admin or moderator
  const { data: currentMember } = await supabase
    .from('neighborhood_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('neighborhood_id', neighborhoodId)
    .single();

  if (!currentMember || !['admin', 'moderator'].includes(currentMember.role)) {
    return { error: 'Only admins and moderators can invite members' };
  }

  // Look up user by email
  const { data: invitedUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!invitedUser) {
    return { error: 'No user found with that email address' };
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('neighborhood_members')
    .select('id')
    .eq('user_id', invitedUser.id)
    .eq('neighborhood_id', neighborhoodId)
    .single();

  if (existingMember) {
    return { error: 'User is already a member of this neighborhood' };
  }

  // Create pending member entry
  const { data: member, error } = await supabase
    .from('neighborhood_members')
    .insert({
      neighborhood_id: neighborhoodId,
      user_id: invitedUser.id,
      role: 'member',
      status: 'pending',
    })
    .select('*, user:users!user_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/members');
  return { data: member as NeighborhoodMember };
}
