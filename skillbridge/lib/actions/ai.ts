'use server';

import OpenAI from 'openai';
import type { SkillEntry, CareerMatch } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractSkillsFromText(rawText: string): Promise<{
  data?: SkillEntry[];
  error?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a career skills analyst. Extract structured skills from the user's text.
Return a JSON array of skills with these fields: name (string), level (beginner|intermediate|advanced|expert), years (number 0-20), category (string like "Programming", "Design", "Management", "Communication", etc).
Return ONLY the JSON array, no markdown.`,
        },
        { role: 'user', content: rawText },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content ?? '{"skills":[]}';
    const parsed = JSON.parse(content);
    const skills: SkillEntry[] = parsed.skills ?? parsed;
    return { data: skills };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to extract skills' };
  }
}

export async function generateCareerMatches(
  skills: SkillEntry[],
  currentRole: string,
  targetRole: string | null
): Promise<{ data?: Omit<CareerMatch, 'id' | 'user_id' | 'assessment_id' | 'created_at'>[]; error?: string }> {
  try {
    const skillsList = skills.map((s) => `${s.name} (${s.level}, ${s.years}yr)`).join(', ');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a career transition expert. Given a person's skills, suggest 5 career paths they could transition to.
Return a JSON object with key "careers" containing an array of career objects with:
- career_title (string)
- match_score (number 0-100)
- transferable_skills (string array - which of their skills apply)
- skills_to_learn (string array - top 3-5 skills needed)
- salary_range ({ min: number, max: number } in USD)
- time_to_transition (string like "3-6 months")
- difficulty ("easy" | "medium" | "hard")
- description (2 sentences about the role)
Return ONLY JSON.`,
        },
        {
          role: 'user',
          content: `Current role: ${currentRole || 'Not specified'}
Target role preference: ${targetRole || 'Open to suggestions'}
Skills: ${skillsList}`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content ?? '{"careers":[]}';
    const parsed = JSON.parse(content);
    return { data: parsed.careers ?? [] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate career matches' };
  }
}

export async function rewriteResume(
  resumeText: string,
  targetRole: string
): Promise<{ data?: string; error?: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer specializing in career transitions. Rewrite the provided resume to better target the specified role.
Emphasize transferable skills, use action verbs, quantify achievements where possible, and tailor the language to match the target role's requirements.
Return the full rewritten resume text.`,
        },
        {
          role: 'user',
          content: `Target Role: ${targetRole}\n\nOriginal Resume:\n${resumeText}`,
        },
      ],
      temperature: 0.4,
    });

    return { data: response.choices[0].message.content ?? '' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to rewrite resume' };
  }
}

export async function generateLearningPlan(
  targetCareer: string,
  skillsToLearn: string[],
  currentSkills: SkillEntry[]
): Promise<{
  data?: {
    title: string;
    description: string;
    estimatedWeeks: number;
    courses: Array<{
      title: string;
      provider: string;
      url: string;
      durationHours: number;
      skillCategory: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      isFree: boolean;
    }>;
  };
  error?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a learning path designer. Create a structured learning plan for a career transition.
Return a JSON object with:
- title (string)
- description (string)
- estimatedWeeks (number)
- courses (array of { title, provider, url, durationHours, skillCategory, difficulty: "beginner"|"intermediate"|"advanced", isFree: boolean })
Use real courses from platforms like Coursera, Udemy, edX, freeCodeCamp, YouTube. Return ONLY JSON.`,
        },
        {
          role: 'user',
          content: `Target Career: ${targetCareer}
Skills to learn: ${skillsToLearn.join(', ')}
Current skills: ${currentSkills.map((s) => s.name).join(', ')}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content ?? '{}';
    return { data: JSON.parse(content) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate learning plan' };
  }
}
