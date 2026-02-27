'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { User, Neighborhood, NeighborhoodMember } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getProfile(): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return { error: error.message };
  return { data: data as User };
}

export async function updateProfile(
  data: Partial<User>
): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { id, email, created_at, ...updateData } = data as Record<string, unknown>;
  const { data: updated, error } = await supabase
    .from('users')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/profile');
  return { data: updated as User };
}

export async function getUserNeighborhood(): Promise<
  ActionResult<{ membership: NeighborhoodMember; neighborhood: Neighborhood } | null>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('neighborhood_members')
    .select('*, neighborhood:neighborhoods(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return { data: null };
    return { error: error.message };
  }

  const { neighborhood, ...membership } = data;
  return {
    data: {
      membership: membership as NeighborhoodMember,
      neighborhood: neighborhood as Neighborhood,
    },
  };
}
