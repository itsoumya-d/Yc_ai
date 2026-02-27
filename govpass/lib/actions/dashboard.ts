'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile, Application, EligibilityResult, NotificationSchedule } from '@/types/database';
import { profileSchema, onboardingSchema } from '@/lib/validations/schemas';

interface DashboardStats {
  eligible_programs: number;
  active_applications: number;
  approved_total_annual: number;
  pending_deadlines: number;
  unread_notifications: number;
  documents_in_vault: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const [eligibility, applications, notifications, vault] = await Promise.all([
      supabase
        .from('eligibility_results')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_eligible', true),
      supabase
        .from('applications')
        .select('status, approval_amount_annual, next_deadline')
        .eq('user_id', user.id),
      supabase
        .from('notification_schedules')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_sent', true),
      supabase
        .from('document_vault_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    const apps = (applications.data ?? []) as Pick<Application, 'status' | 'approval_amount_annual' | 'next_deadline'>[];
    const activeStatuses = ['draft', 'in_progress', 'submitted', 'pending', 'appealing'];
    const activeApps = apps.filter((a) => activeStatuses.includes(a.status));
    const approvedTotal = apps
      .filter((a) => a.status === 'approved')
      .reduce((sum, a) => sum + (a.approval_amount_annual ?? 0), 0);
    const upcoming = apps.filter((a) => {
      if (!a.next_deadline) return false;
      const deadline = new Date(a.next_deadline);
      const now = new Date();
      const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    });

    return {
      success: true,
      data: {
        eligible_programs: eligibility.count ?? 0,
        active_applications: activeApps.length,
        approved_total_annual: approvedTotal,
        pending_deadlines: upcoming.length,
        unread_notifications: notifications.count ?? 0,
        documents_in_vault: vault.count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentApplications(): Promise<ActionResult<Application[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('applications')
      .select('*, program:benefit_programs(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Application[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentEligibility(): Promise<ActionResult<EligibilityResult[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('eligibility_results')
      .select('*, program:benefit_programs(*)')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as EligibilityResult[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentNotifications(): Promise<ActionResult<NotificationSchedule[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('notification_schedules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_sent', true)
      .order('sent_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as NotificationSchedule[] };
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
      preferred_language: formData.get('preferred_language') as string,
      household_size: Number(formData.get('household_size')),
      household_income_bracket: formData.get('household_income_bracket') as string || null,
      annual_income_cents: formData.get('annual_income_cents') ? Number(formData.get('annual_income_cents')) : null,
      employment_status: formData.get('employment_status') as string || null,
      citizenship_status: formData.get('citizenship_status') as string || null,
      has_children_under_18: formData.get('has_children_under_18') === 'true',
      number_of_dependents: Number(formData.get('number_of_dependents') ?? 0),
      state_code: formData.get('state_code') as string || null,
      county: formData.get('county') as string || null,
      push_opted_in: formData.get('push_opted_in') === 'true',
      sms_opted_in: formData.get('sms_opted_in') === 'true',
      quiet_hours_start: (formData.get('quiet_hours_start') as string) || '22:00',
      quiet_hours_end: (formData.get('quiet_hours_end') as string) || '08:00',
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

export async function completeOnboarding(formData: FormData): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      preferred_language: formData.get('preferred_language') as string,
      state_code: formData.get('state_code') as string,
      county: formData.get('county') as string || null,
      household_size: Number(formData.get('household_size')),
      household_income_bracket: formData.get('household_income_bracket') as string,
      employment_status: formData.get('employment_status') as string,
      citizenship_status: formData.get('citizenship_status') as string,
      has_children_under_18: formData.get('has_children_under_18') === 'true',
      number_of_dependents: Number(formData.get('number_of_dependents') ?? 0),
    };

    const parsed = onboardingSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...parsed.data,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Profile };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
