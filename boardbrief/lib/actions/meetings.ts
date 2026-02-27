'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Meeting, MeetingWithDetails, ActionItem, Resolution, MeetingAttendee } from '@/types/database';

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
  const [meetingRes, actionsRes, resolutionsRes, attendeesRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('action_items').select('*').eq('meeting_id', id).order('created_at'),
    supabase.from('resolutions').select('*').eq('meeting_id', id).order('created_at'),
    supabase.from('meeting_attendees').select('*, board_member:board_members(*)').eq('meeting_id', id).order('created_at'),
  ]);
  if (meetingRes.error) return { error: meetingRes.error.message };
  const meeting: MeetingWithDetails = {
    ...(meetingRes.data as Meeting),
    action_items: (actionsRes.data ?? []) as ActionItem[],
    resolutions: (resolutionsRes.data ?? []) as Resolution[],
    attendees: (attendeesRes.data ?? []) as MeetingAttendee[],
  };
  return { data: meeting };
}

export async function createMeeting(formData: FormData): Promise<ActionResult<Meeting>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase.from('meetings').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    meeting_type: formData.get('meeting_type') as string || 'regular',
    status: 'draft',
    scheduled_at: formData.get('scheduled_at') as string || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || 60,
    location: formData.get('location') as string || null,
    video_link: formData.get('video_link') as string || null,
    notes: formData.get('notes') as string || null,
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
  const { data, error } = await supabase.from('meetings').update({
    title: formData.get('title') as string,
    meeting_type: formData.get('meeting_type') as string || 'regular',
    status: formData.get('status') as string || 'draft',
    scheduled_at: formData.get('scheduled_at') as string || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || 60,
    location: formData.get('location') as string || null,
    video_link: formData.get('video_link') as string || null,
    notes: formData.get('notes') as string || null,
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

// ── Meeting Attendees ──────────────────────────────────────

export async function addAttendee(meetingId: string, boardMemberId: string): Promise<ActionResult<MeetingAttendee>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify the meeting belongs to the user
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single();
  if (!meeting) return { error: 'Meeting not found' };

  const { data, error } = await supabase
    .from('meeting_attendees')
    .insert({ meeting_id: meetingId, board_member_id: boardMemberId })
    .select('*, board_member:board_members(*)')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Member already added' };
    return { error: error.message };
  }

  revalidatePath(`/meetings/${meetingId}`);
  return { data: data as MeetingAttendee };
}

export async function removeAttendee(meetingId: string, attendeeId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify the meeting belongs to the user
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single();
  if (!meeting) return { error: 'Meeting not found' };

  const { error } = await supabase
    .from('meeting_attendees')
    .delete()
    .eq('id', attendeeId)
    .eq('meeting_id', meetingId);

  if (error) return { error: error.message };

  revalidatePath(`/meetings/${meetingId}`);
  return {};
}

export async function updateAttendeeStatus(
  meetingId: string,
  attendeeId: string,
  status: 'invited' | 'confirmed' | 'declined' | 'attended'
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('meeting_attendees')
    .update({ status })
    .eq('id', attendeeId)
    .eq('meeting_id', meetingId);

  if (error) return { error: error.message };

  revalidatePath(`/meetings/${meetingId}`);
  return {};
}
