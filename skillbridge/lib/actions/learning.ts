"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import type { LearningPlan, LearningCourse } from "@/types/database";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getLearningPlan(): Promise<LearningPlan | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("learning_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return (data as LearningPlan) || null;
}

export async function generateLearningPlan(careerPathId?: string): Promise<LearningPlan | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let career;
  if (careerPathId) {
    const { data } = await supabase.from("career_paths").select("*").eq("id", careerPathId).single();
    career = data;
  } else {
    const { data } = await supabase.from("career_paths").select("*").eq("user_id", user.id).eq("is_saved", true).order("match_score", { ascending: false }).limit(1).single();
    career = data;
    if (!career) {
      const { data: top } = await supabase.from("career_paths").select("*").eq("user_id", user.id).order("match_score", { ascending: false }).limit(1).single();
      career = top;
    }
  }

  if (!career) return null;

  const prompt = `Create a learning plan for someone transitioning to: ${career.title}
Skills to develop: ${career.skills_gap?.join(", ") || "general skills"}
Industry: ${career.industry}

Generate a JSON object with:
- title: plan title
- courses: array of 6-8 courses, each with:
  - id: unique string (use uuid-style like "c1", "c2", etc.)
  - title: course title
  - provider: Coursera/Udemy/edX/LinkedIn Learning/YouTube/freeCodeCamp
  - url: realistic URL
  - duration_hours: number
  - cost: number (0 if free)
  - is_free: boolean
  - skill_covered: which skill this covers
  - is_completed: false

Return ONLY valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const courses: LearningCourse[] = parsed.courses || [];
    const totalHours = courses.reduce((sum, c) => sum + c.duration_hours, 0);

    const { data } = await supabase.from("learning_plans").insert({
      user_id: user.id,
      career_path_id: career.id,
      title: parsed.title || `Learning Plan: ${career.title}`,
      total_hours: totalHours,
      completed_hours: 0,
      courses,
    }).select().single();

    return (data as LearningPlan) || null;
  } catch (err) {
    console.error("generateLearningPlan error:", err);
    return null;
  }
}

export async function markCourseComplete(planId: string, courseId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: plan } = await supabase.from("learning_plans").select("courses").eq("id", planId).eq("user_id", user.id).single();
  if (!plan) return false;

  const courses = (plan.courses as LearningCourse[]).map((c) =>
    c.id === courseId ? { ...c, is_completed: !c.is_completed } : c
  );
  const completedHours = courses.filter((c) => c.is_completed).reduce((sum, c) => sum + c.duration_hours, 0);

  const { error } = await supabase.from("learning_plans").update({ courses, completed_hours: completedHours }).eq("id", planId);
  return !error;
}
