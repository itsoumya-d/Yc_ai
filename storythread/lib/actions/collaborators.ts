'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Collaborator, CollaboratorRole } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getCollaborators(storyId: string): Promise<ActionResult<Collaborator[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at');

  if (error) return { error: error.message };
  return { data: (data ?? []) as Collaborator[] };
}

export async function inviteCollaborator(
  storyId: string,
  email: string,
  role: CollaboratorRole = 'writer'
): Promise<ActionResult<Collaborator>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if already invited
  const { data: existing } = await supabase
    .from('collaborators')
    .select('id')
    .eq('story_id', storyId)
    .eq('email', email)
    .single();

  if (existing) return { error: 'This person has already been invited' };

  // Look up user by email (they may already have an account)
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  const { data, error } = await supabase.from('collaborators').insert({
    story_id: storyId,
    user_id: targetUser?.id || null,
    email,
    role,
    status: 'pending',
    assigned_chapters: [],
    invited_by: user.id,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  return { data: data as Collaborator };
}

export async function updateCollaboratorRole(
  id: string,
  role: CollaboratorRole
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('collaborators')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  return {};
}

export async function removeCollaborator(id: string, storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('collaborators')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  return {};
}

export async function acceptInvitation(storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('collaborators')
    .update({
      status: 'accepted',
      user_id: user.id,
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('story_id', storyId)
    .eq('email', user.email)
    .eq('status', 'pending');

  if (error) return { error: error.message };

  revalidatePath(`/stories/${storyId}`);
  return {};
}
