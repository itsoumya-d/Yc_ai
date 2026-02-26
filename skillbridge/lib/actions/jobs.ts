'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Job, JobMatch } from '@/types/database';

export async function getJobs(filters?: {
  jobType?: string;
  experienceLevel?: string;
  remoteOnly?: boolean;
  search?: string;
  salaryMin?: number;
}): Promise<Job[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true);

  if (filters?.jobType) {
    query = query.eq('job_type', filters.jobType);
  }

  if (filters?.experienceLevel) {
    query = query.eq('experience_level', filters.experienceLevel);
  }

  if (filters?.remoteOnly) {
    query = query.eq('remote', true);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }

  if (filters?.salaryMin) {
    query = query.gte('salary_min', filters.salaryMin);
  }

  query = query.order('posted_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return data ?? [];
}

export async function getJob(id: string): Promise<Job | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data;
}

export async function getJobMatches(): Promise<JobMatch[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('job_matches')
    .select('*, job:jobs(*)')
    .eq('user_id', user.id)
    .order('match_score', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch job matches: ${error.message}`);
  }

  return data ?? [];
}

export async function saveJob(jobId: string): Promise<JobMatch> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Calculate match data for this job
  const matchData = await calculateJobMatch(jobId);

  const { data, error } = await supabase
    .from('job_matches')
    .upsert(
      {
        user_id: user.id,
        job_id: jobId,
        match_score: matchData.matchScore,
        matching_skills: matchData.matchingSkills,
        missing_skills: matchData.missingSkills,
        status: 'saved' as const,
      },
      {
        onConflict: 'user_id,job_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save job: ${error.message}`);
  }

  revalidatePath('/jobs');
  revalidatePath('/dashboard');

  return data;
}

export async function updateJobMatch(
  id: string,
  data: { status: JobMatch['status']; notes?: string }
): Promise<JobMatch> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const updateData: Record<string, unknown> = {
    status: data.status,
  };

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  if (data.status === 'applied') {
    updateData.applied_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('job_matches')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job match: ${error.message}`);
  }

  revalidatePath('/jobs');
  revalidatePath('/dashboard');

  return updated;
}

export async function calculateJobMatch(
  jobId: string
): Promise<{
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch user skills
  const { data: userSkills, error: skillsError } = await supabase
    .from('skills')
    .select('name')
    .eq('user_id', user.id);

  if (skillsError) {
    throw new Error(`Failed to fetch user skills: ${skillsError.message}`);
  }

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('required_skills, nice_to_have_skills')
    .eq('id', jobId)
    .single();

  if (jobError) {
    throw new Error(`Failed to fetch job: ${jobError.message}`);
  }

  const userSkillNames = (userSkills ?? []).map((s) =>
    s.name.toLowerCase()
  );

  const requiredSkills: string[] = job.required_skills ?? [];
  const niceToHaveSkills: string[] = job.nice_to_have_skills ?? [];
  const allJobSkills = [...requiredSkills, ...niceToHaveSkills];

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of allJobSkills) {
    if (userSkillNames.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Weight required skills more heavily
  const requiredMatches = requiredSkills.filter((s) =>
    userSkillNames.includes(s.toLowerCase())
  ).length;
  const niceToHaveMatches = niceToHaveSkills.filter((s) =>
    userSkillNames.includes(s.toLowerCase())
  ).length;

  const requiredWeight = 0.7;
  const niceToHaveWeight = 0.3;

  let matchScore = 0;
  if (requiredSkills.length > 0) {
    matchScore += (requiredMatches / requiredSkills.length) * requiredWeight * 100;
  }
  if (niceToHaveSkills.length > 0) {
    matchScore +=
      (niceToHaveMatches / niceToHaveSkills.length) * niceToHaveWeight * 100;
  }

  // If no skills are listed, default to 0
  if (allJobSkills.length === 0) {
    matchScore = 0;
  }

  return {
    matchScore: Math.round(matchScore),
    matchingSkills,
    missingSkills,
  };
}
