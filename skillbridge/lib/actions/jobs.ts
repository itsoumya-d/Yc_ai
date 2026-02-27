'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import type { JobMatch } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getJobMatches(): Promise<{ data?: JobMatch[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('job_matches')
    .select('*')
    .eq('user_id', user.id)
    .order('transferability_score', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as JobMatch[] };
}

export async function generateJobMatches(): Promise<{ data?: JobMatch[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: assessment } = await supabase
    .from('skill_assessments')
    .select('skills, experience_level')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role, current_role')
    .eq('id', user.id)
    .single();

  if (!assessment) return { error: 'Complete your assessment first' };

  const skillsList = assessment.skills.map((s: { name: string; level: string }) => `${s.name} (${s.level})`).join(', ');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a job matching AI. Generate 10 realistic job listings that match the user's profile.
Return a JSON object with key "jobs" containing array of job objects with:
- job_title (string)
- company (string - use real company names)
- location (string - city, state or "Remote")
- remote_type ("remote" | "hybrid" | "onsite")
- salary_min (number in USD or null)
- salary_max (number in USD or null)
- transferability_score (number 0-100)
- matching_skills (string array)
- missing_skills (string array)
- job_url (string or null)
- posted_at (ISO date string within last 30 days)
Return ONLY JSON.`,
      },
      {
        role: 'user',
        content: `Target role: ${profile?.target_role ?? 'Not specified'}
Current role: ${profile?.current_role ?? 'Not specified'}
Experience: ${assessment.experience_level}
Skills: ${skillsList}`,
      },
    ],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content ?? '{"jobs":[]}';
  const parsed = JSON.parse(content);
  const jobs = parsed.jobs ?? [];

  await supabase.from('job_matches').delete().eq('user_id', user.id);

  const rows = jobs.map((j: Omit<JobMatch, 'id' | 'user_id' | 'created_at'>) => ({
    user_id: user.id,
    job_title: j.job_title,
    company: j.company,
    location: j.location,
    remote_type: j.remote_type,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    transferability_score: j.transferability_score,
    matching_skills: j.matching_skills,
    missing_skills: j.missing_skills,
    job_url: j.job_url,
    posted_at: j.posted_at,
  }));

  const { data, error } = await supabase.from('job_matches').insert(rows).select();
  if (error) return { error: error.message };

  revalidatePath('/jobs');
  return { data: data as JobMatch[] };
}
