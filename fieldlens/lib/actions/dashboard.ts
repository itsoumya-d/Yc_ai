'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile, CoachingSession } from '@/types/database';
import { profileSchema } from '@/lib/validations/schemas';

interface DashboardStats {
  total_sessions: number;
  total_photos: number;
  skills_completed: number;
  streak_days: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const [sessions, photos, milestones] = await Promise.all([
      supabase
        .from('coaching_sessions')
        .select('id, created_at', { count: 'exact', head: false })
        .eq('user_id', user.id),
      supabase
        .from('session_photos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('skill_milestones')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true),
    ]);

    // Calculate streak from sessions
    const sessionDates: string[] = (sessions.data ?? []).map(
      (s: { id: string; created_at: string }) => s.created_at.slice(0, 10)
    );
    const uniqueDates: string[] = [...new Set(sessionDates)].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (uniqueDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return {
      success: true,
      data: {
        total_sessions: sessions.count ?? 0,
        total_photos: photos.count ?? 0,
        skills_completed: milestones.count ?? 0,
        streak_days: streak,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentSessions(): Promise<ActionResult<CoachingSession[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as CoachingSession[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      full_name: formData.get('full_name') as string || null,
      trade: formData.get('trade') as string,
      skill_level: formData.get('skill_level') as string,
      years_experience: Number(formData.get('years_experience') ?? 0),
      company: formData.get('company') as string || null,
      license_number: formData.get('license_number') as string || null,
    };

    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
