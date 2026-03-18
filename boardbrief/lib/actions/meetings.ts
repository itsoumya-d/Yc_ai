'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Meeting, MeetingWithDetails, ActionItem, Resolution } from '@/types/database';
import { meetingSchema } from '@/lib/validations';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getMeetings(): Promise<ActionResult<Meeting[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('meetings').select('*').eq('user_id', user.id).order('scheduled_at', { ascending: false, nullsFirst: false });
  if (error) return { error: error.message };
  return { data: data as Meeting[] };
}

export async function getMeeting(id: string): Promise<ActionResult<MeetingWithDetails>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const [meetingRes, actionsRes, resolutionsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('action_items').select('*').eq('meeting_id', id).order('created_at'),
    supabase.from('resolutions').select('*').eq('meeting_id', id).order('created_at'),
  ]);
  if (meetingRes.error) return { error: meetingRes.error.message };
  const meeting: MeetingWithDetails = {
    ...(meetingRes.data as Meeting),
    action_items: (actionsRes.data ?? []) as ActionItem[],
    resolutions: (resolutionsRes.data ?? []) as Resolution[],
  };
  return { data: meeting };
}

export async function createMeeting(formData: FormData): Promise<ActionResult<Meeting>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = meetingSchema.safeParse({
    title: formData.get('title'),
    meetingType: formData.get('meeting_type') || 'regular',
    scheduledAt: formData.get('scheduled_at') || undefined,
    durationMinutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : 60,
    location: formData.get('location') || undefined,
    videoLink: formData.get('video_link') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('meetings').insert({
    user_id: user.id,
    title: parsed.data.title,
    meeting_type: parsed.data.meetingType,
    status: 'draft',
    scheduled_at: parsed.data.scheduledAt || null,
    duration_minutes: parsed.data.durationMinutes,
    location: parsed.data.location || null,
    video_link: parsed.data.videoLink || null,
    notes: parsed.data.notes || null,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath('/meetings');
  revalidatePath('/dashboard');
  return { data: data as Meeting };
}

export async function updateMeeting(id: string, formData: FormData): Promise<ActionResult<Meeting>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const parsed = meetingSchema.safeParse({
    title: formData.get('title'),
    meetingType: formData.get('meeting_type') || 'regular',
    scheduledAt: formData.get('scheduled_at') || undefined,
    durationMinutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : 60,
    location: formData.get('location') || undefined,
    videoLink: formData.get('video_link') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const { data, error } = await supabase.from('meetings').update({
    title: parsed.data.title,
    meeting_type: parsed.data.meetingType,
    status: formData.get('status') as string || 'draft',
    scheduled_at: parsed.data.scheduledAt || null,
    duration_minutes: parsed.data.durationMinutes,
    location: parsed.data.location || null,
    video_link: parsed.data.videoLink || null,
    notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/meetings');
  revalidatePath(`/meetings/${id}`);
  revalidatePath('/dashboard');
  return { data: data as Meeting };
}

export async function deleteMeeting(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/meetings');
  revalidatePath('/dashboard');
  return {};
}
