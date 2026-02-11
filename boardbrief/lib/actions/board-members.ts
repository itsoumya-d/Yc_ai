'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BoardMember } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getBoardMembers(): Promise<ActionResult<BoardMember[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('board_members').select('*').eq('user_id', user.id).order('full_name');
  if (error) return { error: error.message };
  return { data: data as BoardMember[] };
}

export async function getBoardMember(id: string): Promise<ActionResult<BoardMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('board_members').select('*').eq('id', id).eq('user_id', user.id).single();
  if (error) return { error: error.message };
  return { data: data as BoardMember };
}

export async function createBoardMember(formData: FormData): Promise<ActionResult<BoardMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('board_members').insert({
    user_id: user.id,
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    member_type: formData.get('member_type') as string || 'director',
    title: formData.get('title') as string || null,
    company: formData.get('company') as string || null,
    phone: formData.get('phone') as string || null,
    can_vote: formData.get('can_vote') === 'true',
    is_active: true,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/board-members');
  revalidatePath('/dashboard');
  return { data: data as BoardMember };
}

export async function updateBoardMember(id: string, formData: FormData): Promise<ActionResult<BoardMember>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('board_members').update({
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    member_type: formData.get('member_type') as string || 'director',
    title: formData.get('title') as string || null,
    company: formData.get('company') as string || null,
    phone: formData.get('phone') as string || null,
    can_vote: formData.get('can_vote') === 'true',
    is_active: formData.get('is_active') === 'true',
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/board-members');
  revalidatePath(`/board-members/${id}`);
  return { data: data as BoardMember };
}

export async function deleteBoardMember(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('board_members').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/board-members');
  revalidatePath('/dashboard');
  return {};
}
