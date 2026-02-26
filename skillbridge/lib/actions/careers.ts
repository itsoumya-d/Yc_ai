'use server';

import { createClient } from '@/lib/supabase/server';
import type { CareerPath } from '@/types/database';

export async function getCareerPaths(filters?: {
  industry?: string;
  demandLevel?: string;
  remoteOnly?: boolean;
  search?: string;
}): Promise<CareerPath[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase.from('career_paths').select('*');

  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }

  if (filters?.demandLevel) {
    query = query.eq('demand_level', filters.demandLevel);
  }

  if (filters?.remoteOnly) {
    query = query.eq('remote_friendly', true);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  query = query.order('title', { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch career paths: ${error.message}`);
  }

  return data ?? [];
}

export async function getCareerPath(slug: string): Promise<CareerPath | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch career path: ${error.message}`);
  }

  return data;
}

export async function getRecommendedCareers(): Promise<
  (CareerPath & { matchScore: number })[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch user's skills
  const { data: userSkills, error: skillsError } = await supabase
    .from('skills')
    .select('name')
    .eq('user_id', user.id);

  if (skillsError) {
    throw new Error(`Failed to fetch user skills: ${skillsError.message}`);
  }

  const userSkillNames = (userSkills ?? []).map((s) =>
    s.name.toLowerCase()
  );

  // Fetch all career paths
  const { data: careers, error: careersError } = await supabase
    .from('career_paths')
    .select('*');

  if (careersError) {
    throw new Error(`Failed to fetch career paths: ${careersError.message}`);
  }

  if (!careers || careers.length === 0) {
    return [];
  }

  // Calculate match score for each career based on skill overlap
  const scored = careers.map((career) => {
    const requiredSkills = (career.required_skills ?? []).map((s: string) =>
      s.toLowerCase()
    );

    if (requiredSkills.length === 0) {
      return { ...career, matchScore: 0 };
    }

    const matchingCount = requiredSkills.filter((skill: string) =>
      userSkillNames.includes(skill)
    ).length;

    const matchScore = Math.round(
      (matchingCount / requiredSkills.length) * 100
    );

    return { ...career, matchScore };
  });

  // Sort by matchScore descending, limit to 10
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, 10);
}

export async function getIndustries(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('career_paths')
    .select('industry');

  if (error) {
    throw new Error(`Failed to fetch industries: ${error.message}`);
  }

  const industries = [...new Set((data ?? []).map((row) => row.industry))];
  industries.sort();

  return industries;
}
