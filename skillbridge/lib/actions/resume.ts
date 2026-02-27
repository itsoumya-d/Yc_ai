'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import type { Resume } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getResumes(): Promise<Resume[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Resume[];
}

export async function rewriteResume(
  content: string,
  careerTitle: string,
  careerPathId?: string
): Promise<{ rewritten_content: string; improvements: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!content.trim()) throw new Error('Resume content is required.');
  if (!careerTitle.trim()) throw new Error('Career title is required.');

  const prompt = `You are an expert resume writer specializing in career transitions. Rewrite the following resume to target a "${careerTitle}" position.

Guidelines:
- Emphasize transferable skills that apply to the target role
- Use industry-relevant keywords for "${careerTitle}"
- Reframe experience bullets to highlight relevant impact
- Keep all factual information accurate (do not fabricate experience)
- Use strong action verbs
- Ensure quantifiable achievements are highlighted
- Optimize for ATS (Applicant Tracking Systems)
- Maintain professional formatting using plain text

Original Resume:
${content}

Return a JSON object with exactly two fields:
- rewritten_content: string (the full rewritten resume as plain text)
- improvements: array of strings (5-8 specific improvements you made, each starting with an action verb)

Return only valid JSON, no markdown.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 3000,
  });

  const rawContent = completion.choices[0]?.message?.content ?? '{}';

  let result: { rewritten_content: string; improvements: string[] };

  try {
    result = JSON.parse(rawContent);
  } catch {
    throw new Error('Failed to parse AI resume rewrite. Please try again.');
  }

  // Get latest version number for this user+career
  const { data: existing } = await supabase
    .from('resumes')
    .select('version')
    .eq('user_id', user.id)
    .eq('career_title', careerTitle)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = existing ? existing.version + 1 : 1;

  // Save to database
  const { error } = await supabase.from('resumes').insert({
    user_id: user.id,
    career_path_id: careerPathId ?? null,
    career_title: careerTitle,
    original_content: content,
    rewritten_content: result.rewritten_content,
    improvements: result.improvements,
    version: nextVersion,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/resume');

  return {
    rewritten_content: result.rewritten_content,
    improvements: result.improvements,
  };
}
