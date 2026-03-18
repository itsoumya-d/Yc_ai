'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BoardMember } from '@/types/database';
import { boardMemberSchema } from '@/lib/validations';

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

  const parsed = boardMemberSchema.safeParse({
    fullName: formData.get('full_name'),
    email: formData.get('email'),
    memberType: formData.get('member_type') || 'director',
    title: formData.get('title') || undefined,
    company: formData.get('company') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('board_members').insert({
    user_id: user.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    member_type: parsed.data.memberType,
    title: parsed.data.title || null,
    company: parsed.data.company || null,
    phone: parsed.data.phone || null,
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

  const parsed = boardMemberSchema.safeParse({
    fullName: formData.get('full_name'),
    email: formData.get('email'),
    memberType: formData.get('member_type') || 'director',
    title: formData.get('title') || undefined,
    company: formData.get('company') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('board_members').update({
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    member_type: parsed.data.memberType,
    title: parsed.data.title || null,
    company: parsed.data.company || null,
    phone: parsed.data.phone || null,
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
