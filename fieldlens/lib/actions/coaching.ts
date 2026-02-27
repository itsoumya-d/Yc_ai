'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, CoachingSession, SessionPhoto } from '@/types/database';
import { sessionSchema, photoSchema } from '@/lib/validations/schemas';

export async function fetchSessions(): Promise<ActionResult<CoachingSession[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as CoachingSession[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchSession(id: string): Promise<ActionResult<CoachingSession>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CoachingSession };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createSession(formData: FormData): Promise<ActionResult<CoachingSession>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      trade: formData.get('trade') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string || null,
    };

    const parsed = sessionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: user.id,
        trade: parsed.data.trade,
        description: parsed.data.description,
        location: parsed.data.location,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CoachingSession };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function endSession(id: string): Promise<ActionResult<CoachingSession>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: session } = await supabase
      .from('coaching_sessions')
      .select('started_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    const now = new Date();
    const durationMinutes = session?.started_at
      ? Math.round((now.getTime() - new Date(session.started_at).getTime()) / 60000)
      : 0;

    const { data, error } = await supabase
      .from('coaching_sessions')
      .update({
        status: 'completed',
        ended_at: now.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CoachingSession };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function addPhoto(formData: FormData): Promise<ActionResult<SessionPhoto>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      session_id: formData.get('session_id') as string,
      caption: formData.get('caption') as string || null,
    };

    const parsed = photoSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('session_photos')
      .insert({
        session_id: parsed.data.session_id,
        user_id: user.id,
        storage_path: `photos/${user.id}/${Date.now()}.jpg`,
        caption: parsed.data.caption,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as SessionPhoto };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
