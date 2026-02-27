'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Application } from '@/types/database';
import { applicationSchema, applicationUpdateSchema } from '@/lib/validations/schemas';

export async function fetchApplications(status?: string): Promise<ActionResult<Application[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let query = supabase
      .from('applications')
      .select('*, program:benefit_programs(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Application[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchApplication(id: string): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('applications')
      .select('*, program:benefit_programs(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Application };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createApplication(formData: FormData): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      program_id: formData.get('program_id') as string,
      notes: formData.get('notes') as string || null,
      is_renewal: formData.get('is_renewal') === 'true',
    };

    const parsed = applicationSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data: program } = await supabase
      .from('benefit_programs')
      .select('application_steps')
      .eq('id', parsed.data.program_id)
      .single();

    const totalSteps = Array.isArray(program?.application_steps) ? program.application_steps.length : 5;

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        ...parsed.data,
        status: 'draft',
        current_step: 0,
        total_steps: totalSteps,
        completed_steps: [],
        documents_attached: [],
      })
      .select('*, program:benefit_programs(*)')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Application };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateApplication(id: string, formData: FormData): Promise<ActionResult<Application>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw: Record<string, unknown> = {};
    const status = formData.get('status') as string;
    if (status) raw.status = status;
    const currentStep = formData.get('current_step');
    if (currentStep !== null) raw.current_step = Number(currentStep);
    const confirmNum = formData.get('agency_confirmation_number') as string;
    if (confirmNum) raw.agency_confirmation_number = confirmNum;
    const caseNum = formData.get('agency_case_number') as string;
    if (caseNum) raw.agency_case_number = caseNum;
    const nextAction = formData.get('next_action') as string;
    if (nextAction) raw.next_action = nextAction;
    const nextDeadline = formData.get('next_deadline') as string;
    if (nextDeadline) raw.next_deadline = nextDeadline;
    const notes = formData.get('notes') as string;
    if (notes) raw.notes = notes;

    const parsed = applicationUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.status === 'submitted' && !formData.get('submitted_at')) {
      updates.submitted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, program:benefit_programs(*)')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Application };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function withdrawApplication(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
