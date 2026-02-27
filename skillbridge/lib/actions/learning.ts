'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import type { LearningPlan, LearningItem, LearningStatus } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getLearningPlan(): Promise<{ plan: LearningPlan | null; items: LearningItem[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { plan: null, items: [] };

  const { data: plan } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!plan) return { plan: null, items: [] };

  const { data: items } = await supabase
    .from('learning_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('order_index', { ascending: true });

  return {
    plan: plan as LearningPlan,
    items: (items ?? []) as LearningItem[],
  };
}

export async function generateLearningPlan(careerPathId: string): Promise<{ plan: LearningPlan; items: LearningItem[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch career path details
  const { data: careerPath } = await supabase
    .from('career_paths')
    .select('*')
    .eq('id', careerPathId)
    .eq('user_id', user.id)
    .single();

  if (!careerPath) throw new Error('Career path not found.');

  // Fetch user's existing skills
  const { data: skills } = await supabase
    .from('skills')
    .select('name, proficiency')
    .eq('user_id', user.id);

  const existingSkills = (skills ?? []).map((s) => s.name).join(', ');
  const skillsGap = (careerPath.skills_gap as string[]).join(', ');

  const prompt = `You are a curriculum designer. Create a structured learning plan for someone transitioning to "${careerPath.title}" in the "${careerPath.industry}" industry.

They already have these skills: ${existingSkills || 'none listed'}
They need to learn: ${skillsGap || 'core skills for this role'}
Estimated transition time: ${careerPath.time_to_transition}

Create a learning plan with 8-12 courses/resources. Return a JSON object with:
- estimated_weeks: number (realistic timeframe)
- courses: array of course objects, each with:
  - title: string (specific course name)
  - provider: string (e.g. Coursera, Udemy, YouTube, LinkedIn Learning, edX, freeCodeCamp)
  - url: string (realistic URL, can be approximate)
  - skill_covered: string (which skill gap this addresses)
  - duration_hours: number (realistic hours to complete)

Order courses from foundational to advanced. Return only valid JSON, no markdown.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const rawContent = completion.choices[0]?.message?.content ?? '{}';

  let planData: {
    estimated_weeks: number;
    courses: Array<{
      title: string;
      provider: string;
      url: string;
      skill_covered: string;
      duration_hours: number;
    }>;
  };

  try {
    planData = JSON.parse(rawContent);
  } catch {
    throw new Error('Failed to parse AI learning plan. Please try again.');
  }

  // Delete existing plans for this user
  await supabase.from('learning_plans').delete().eq('user_id', user.id);

  // Create new plan
  const { data: newPlan, error: planError } = await supabase
    .from('learning_plans')
    .insert({
      user_id: user.id,
      career_path_id: careerPathId,
      career_title: careerPath.title,
      total_courses: planData.courses.length,
      completed_courses: 0,
      estimated_weeks: planData.estimated_weeks,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (planError || !newPlan) throw new Error(planError?.message ?? 'Failed to create learning plan.');

  // Insert learning items
  const itemsToInsert = planData.courses.map((course, index) => ({
    plan_id: newPlan.id,
    user_id: user.id,
    title: course.title,
    provider: course.provider,
    url: course.url || null,
    skill_covered: course.skill_covered,
    duration_hours: course.duration_hours,
    status: 'not_started' as LearningStatus,
    order_index: index,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('learning_items')
    .insert(itemsToInsert)
    .select();

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath('/learning-plan');
  revalidatePath('/dashboard');

  return {
    plan: newPlan as LearningPlan,
    items: (insertedItems ?? []) as LearningItem[],
  };
}

export async function updateItemStatus(itemId: string, status: LearningStatus): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('learning_items')
    .update({ status })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  // Update completed count on the plan
  const { data: item } = await supabase
    .from('learning_items')
    .select('plan_id')
    .eq('id', itemId)
    .single();

  if (item) {
    const { data: allItems } = await supabase
      .from('learning_items')
      .select('status')
      .eq('plan_id', item.plan_id);

    const completedCount = (allItems ?? []).filter((i) => i.status === 'completed').length;

    await supabase
      .from('learning_plans')
      .update({
        completed_courses: completedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.plan_id)
      .eq('user_id', user.id);
  }

  revalidatePath('/learning-plan');
  revalidatePath('/dashboard');
}
