'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import type { CareerPath } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getCareerPaths(): Promise<CareerPath[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('transferability_score', { ascending: false });

  if (error) return [];
  return data as CareerPath[];
}

export async function generateCareerPaths(): Promise<CareerPath[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch user's skills
  const { data: skills } = await supabase
    .from('skills')
    .select('name, category, proficiency, years_used')
    .eq('user_id', user.id);

  if (!skills || skills.length === 0) {
    throw new Error('No skills found. Please add your skills in the assessment first.');
  }

  // Fetch profile for context
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_role, years_experience, target_industry')
    .eq('user_id', user.id)
    .single();

  const skillsSummary = skills
    .map((s) => `${s.name} (${s.category}, ${s.proficiency}, ${s.years_used} years)`)
    .join(', ');

  const profileContext = profile
    ? `Current role: ${profile.current_role}, Years of experience: ${profile.years_experience}, Target industry: ${profile.target_industry || 'open to suggestions'}`
    : '';

  const prompt = `You are a career transition expert. Based on the following professional profile and skills, suggest 5 realistic and promising career transition opportunities.

Profile: ${profileContext}
Skills: ${skillsSummary}

Return a JSON array with exactly 5 career path objects. Each object must have these exact fields:
- title: string (specific job title)
- industry: string (industry sector)
- description: string (2-3 sentence description of the role and why it fits)
- transferability_score: number (0-100, how well their skills transfer)
- salary_min: number (annual USD, realistic minimum)
- salary_max: number (annual USD, realistic maximum)
- growth_rate: number (percentage job market growth rate, realistic)
- skills_match: array of strings (skills from their profile that directly apply)
- skills_gap: array of strings (3-5 key skills they need to learn)
- time_to_transition: string (e.g. "3-6 months", "6-12 months", "1-2 years")

Respond with only a valid JSON array, no markdown, no explanation.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const rawContent = completion.choices[0]?.message?.content ?? '[]';

  let careerData: Array<{
    title: string;
    industry: string;
    description: string;
    transferability_score: number;
    salary_min: number;
    salary_max: number;
    growth_rate: number;
    skills_match: string[];
    skills_gap: string[];
    time_to_transition: string;
  }>;

  try {
    careerData = JSON.parse(rawContent);
  } catch {
    throw new Error('Failed to parse AI career recommendations. Please try again.');
  }

  // Delete existing career paths for this user
  await supabase.from('career_paths').delete().eq('user_id', user.id);

  // Insert new career paths
  const { data: inserted, error } = await supabase
    .from('career_paths')
    .insert(
      careerData.map((c) => ({
        user_id: user.id,
        title: c.title,
        industry: c.industry,
        description: c.description,
        transferability_score: c.transferability_score,
        salary_min: c.salary_min,
        salary_max: c.salary_max,
        growth_rate: c.growth_rate,
        skills_match: c.skills_match,
        skills_gap: c.skills_gap,
        time_to_transition: c.time_to_transition,
        is_saved: false,
      }))
    )
    .select();

  if (error) throw new Error(error.message);

  revalidatePath('/career-paths');
  revalidatePath('/dashboard');

  return (inserted ?? []) as CareerPath[];
}
