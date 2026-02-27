'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, BenefitProgram, EligibilityResult, SavedBenefit } from '@/types/database';
import { savedBenefitSchema } from '@/lib/validations/schemas';

export async function fetchBenefitPrograms(category?: string): Promise<ActionResult<BenefitProgram[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let query = supabase
      .from('benefit_programs')
      .select('*')
      .eq('is_active', true)
      .order('priority_score', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as BenefitProgram[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchEligibilityResults(): Promise<ActionResult<EligibilityResult[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('eligibility_results')
      .select('*, program:benefit_programs(*)')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as EligibilityResult[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function runEligibilityCheck(): Promise<ActionResult<EligibilityResult[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return { success: false, error: 'Profile not found. Complete onboarding first.' };

    const { data: programs } = await supabase
      .from('benefit_programs')
      .select('*')
      .eq('is_active', true);

    if (!programs?.length) return { success: true, data: [] };

    const results: EligibilityResult[] = [];

    for (const program of programs) {
      const rules = program.eligibility_rules as Record<string, unknown>;
      const qualifyingFactors: string[] = [];
      const disqualifyingFactors: string[] = [];
      const missingInfo: string[] = [];
      let score = 0.5;

      if (rules.max_income_fpl_percent && profile.household_income_bracket) {
        qualifyingFactors.push('Income within eligible range');
        score += 0.1;
      }

      if (rules.citizenship_required && profile.citizenship_status) {
        const eligible = ['citizen', 'permanent_resident'].includes(profile.citizenship_status);
        if (eligible) {
          qualifyingFactors.push('Citizenship requirement met');
          score += 0.1;
        } else {
          disqualifyingFactors.push('Citizenship requirement not met');
          score -= 0.3;
        }
      }

      if (rules.children_required && profile.has_children_under_18) {
        qualifyingFactors.push('Has children under 18');
        score += 0.15;
      }

      if (!profile.state_code) missingInfo.push('State of residence');
      if (!profile.employment_status) missingInfo.push('Employment status');
      if (!profile.household_income_bracket) missingInfo.push('Household income');

      const isEligible = disqualifyingFactors.length === 0 && score >= 0.4;
      const confidence = Math.min(Math.max(score, 0), 1);

      const { data: result, error } = await supabase
        .from('eligibility_results')
        .upsert(
          {
            user_id: user.id,
            program_id: program.id,
            is_eligible: isEligible,
            eligibility_status: isEligible
              ? confidence >= 0.7
                ? 'likely_eligible'
                : 'may_be_eligible'
              : missingInfo.length > 0
                ? 'needs_more_info'
                : 'not_eligible',
            confidence,
            estimated_annual_value: isEligible ? program.estimated_annual_value_min : null,
            estimated_monthly_value: isEligible && program.estimated_annual_value_min
              ? Math.round(program.estimated_annual_value_min / 12)
              : null,
            missing_documents: [],
            missing_information: missingInfo,
            disqualifying_factors: disqualifyingFactors,
            qualifying_factors: qualifyingFactors,
            income_ratio_to_limit: null,
            calculated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { onConflict: 'user_id,program_id' }
        )
        .select('*, program:benefit_programs(*)')
        .single();

      if (!error && result) {
        results.push(result as EligibilityResult);
      }
    }

    await supabase
      .from('profiles')
      .update({ last_eligibility_check_at: new Date().toISOString() })
      .eq('id', user.id);

    return { success: true, data: results };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function saveBenefit(formData: FormData): Promise<ActionResult<SavedBenefit>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      program_id: formData.get('program_id') as string,
      notes: formData.get('notes') as string || null,
    };

    const parsed = savedBenefitSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('saved_benefits')
      .insert({ user_id: user.id, ...parsed.data })
      .select('*, program:benefit_programs(*)')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as SavedBenefit };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function removeSavedBenefit(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('saved_benefits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchSavedBenefits(): Promise<ActionResult<SavedBenefit[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('saved_benefits')
      .select('*, program:benefit_programs(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as SavedBenefit[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
