'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SkillAssessment } from '@/types/database';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ExtractedSkill {
  name: string;
  category: string;
  proficiency: string;
  confidence: number;
}

interface AssessmentResult {
  skills: ExtractedSkill[];
}

export async function startAssessment(
  type: SkillAssessment['assessment_type'],
  inputData: Record<string, unknown>
): Promise<SkillAssessment> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('skill_assessments')
    .insert({
      user_id: user.id,
      assessment_type: type,
      input_data: inputData,
      result_data: {},
      status: 'pending' as const,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start assessment: ${error.message}`);
  }

  revalidatePath('/assessment');
  revalidatePath('/onboarding');

  return data;
}

export async function processResumeAssessment(
  assessmentId: string,
  resumeText: string
): Promise<AssessmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Update assessment status to processing
  const { error: updateError } = await supabase
    .from('skill_assessments')
    .update({ status: 'processing' })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error(
      `Failed to update assessment status: ${updateError.message}`
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a career skills analyst. Extract transferable skills from the following resume text. Categorize each as technical, soft, industry, or transferable. Rate proficiency as beginner, intermediate, advanced, or expert. Include a confidence score 0-1. Return a JSON object with a "skills" array where each item has: name (string), category (string: technical|soft|industry|transferable), proficiency (string: beginner|intermediate|advanced|expert), confidence (number 0-1).',
        },
        {
          role: 'user',
          content: resumeText,
        },
      ],
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const result: AssessmentResult = JSON.parse(responseContent);

    if (!result.skills || !Array.isArray(result.skills)) {
      throw new Error('Invalid AI response format');
    }

    // Update assessment with results
    const { error: resultError } = await supabase
      .from('skill_assessments')
      .update({
        status: 'completed',
        result_data: result,
      })
      .eq('id', assessmentId)
      .eq('user_id', user.id);

    if (resultError) {
      throw new Error(
        `Failed to save assessment results: ${resultError.message}`
      );
    }

    // Bulk insert extracted skills into the skills table
    const skillRows = result.skills.map((skill) => ({
      user_id: user.id,
      name: skill.name,
      category: skill.category as 'technical' | 'soft' | 'industry' | 'transferable',
      proficiency: skill.proficiency as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      verified: false,
      source: 'resume_parsed' as const,
      confidence_score: skill.confidence,
    }));

    if (skillRows.length > 0) {
      const { error: skillsError } = await supabase
        .from('skills')
        .insert(skillRows);

      if (skillsError) {
        throw new Error(
          `Failed to save extracted skills: ${skillsError.message}`
        );
      }
    }

    revalidatePath('/skills');
    revalidatePath('/assessment');
    revalidatePath('/onboarding');
    revalidatePath('/dashboard');

    return result;
  } catch (err) {
    // Mark assessment as failed on error
    await supabase
      .from('skill_assessments')
      .update({ status: 'failed' })
      .eq('id', assessmentId)
      .eq('user_id', user.id);

    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to process resume assessment');
  }
}

export async function processQuestionnaireAssessment(
  assessmentId: string,
  answers: Record<string, string>
): Promise<AssessmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Update assessment status to processing
  const { error: updateError } = await supabase
    .from('skill_assessments')
    .update({ status: 'processing' })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error(
      `Failed to update assessment status: ${updateError.message}`
    );
  }

  // Format answers as structured Q&A text
  const formattedAnswers = Object.entries(answers)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join('\n\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a career skills analyst. Based on the following questionnaire answers, identify the person\'s skills. Categorize each as technical, soft, industry, or transferable. Rate proficiency as beginner, intermediate, advanced, or expert. Include a confidence score 0-1. Return a JSON object with a "skills" array where each item has: name (string), category (string: technical|soft|industry|transferable), proficiency (string: beginner|intermediate|advanced|expert), confidence (number 0-1).',
        },
        {
          role: 'user',
          content: formattedAnswers,
        },
      ],
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const result: AssessmentResult = JSON.parse(responseContent);

    if (!result.skills || !Array.isArray(result.skills)) {
      throw new Error('Invalid AI response format');
    }

    // Update assessment with results
    const { error: resultError } = await supabase
      .from('skill_assessments')
      .update({
        status: 'completed',
        result_data: result,
      })
      .eq('id', assessmentId)
      .eq('user_id', user.id);

    if (resultError) {
      throw new Error(
        `Failed to save assessment results: ${resultError.message}`
      );
    }

    // Bulk insert extracted skills into the skills table
    const skillRows = result.skills.map((skill) => ({
      user_id: user.id,
      name: skill.name,
      category: skill.category as 'technical' | 'soft' | 'industry' | 'transferable',
      proficiency: skill.proficiency as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      verified: false,
      source: 'ai_assessment' as const,
      confidence_score: skill.confidence,
    }));

    if (skillRows.length > 0) {
      const { error: skillsError } = await supabase
        .from('skills')
        .insert(skillRows);

      if (skillsError) {
        throw new Error(
          `Failed to save extracted skills: ${skillsError.message}`
        );
      }
    }

    revalidatePath('/skills');
    revalidatePath('/assessment');
    revalidatePath('/onboarding');
    revalidatePath('/dashboard');

    return result;
  } catch (err) {
    // Mark assessment as failed on error
    await supabase
      .from('skill_assessments')
      .update({ status: 'failed' })
      .eq('id', assessmentId)
      .eq('user_id', user.id);

    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to process questionnaire assessment');
  }
}

export async function getLatestAssessment(): Promise<SkillAssessment | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('skill_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest assessment: ${error.message}`);
  }

  return data;
}
