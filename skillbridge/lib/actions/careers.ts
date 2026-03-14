"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import type { CareerPath } from "@/types/database";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getCareerPaths(): Promise<CareerPath[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("career_paths")
    .select("*")
    .eq("user_id", user.id)
    .order("match_score", { ascending: false });
  return (data as CareerPath[]) || [];
}

export async function generateCareerPaths(): Promise<CareerPath[] | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: skills } = await supabase
    .from("skills")
    .select("name, level, years_experience")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("current_occupation, location")
    .eq("id", user.id)
    .single();

  const skillsText = skills?.map((s) => `${s.name} (${s.level}, ${s.years_experience} years)`).join(", ") || "general skills";

  const prompt = `You are a career counselor. Given these skills: ${skillsText}
Current occupation: ${profile?.current_occupation || "unknown"}
Location: ${profile?.location || "remote-friendly"}

Generate exactly 6 realistic career transition options as a JSON array. Each career should include:
- title: job title
- industry: industry sector
- description: 2-sentence description
- match_score: 50-95 integer
- median_salary: annual salary in USD (integer)
- growth_rate: annual growth percentage (decimal)
- skills_gap: array of 3-5 skills to develop
- skills_match: array of 3-5 skills from the user profile that apply
- transition_time_months: 3-18 integer

Return ONLY the JSON array, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const careersArr = Array.isArray(parsed) ? parsed : (parsed.careers || parsed.career_paths || []);

    await supabase.from("career_paths").delete().eq("user_id", user.id);

    const toInsert = careersArr.map((c: Record<string, unknown>) => ({
      user_id: user.id,
      title: c.title as string,
      industry: c.industry as string,
      description: c.description as string,
      match_score: c.match_score as number,
      median_salary: c.median_salary as number,
      growth_rate: c.growth_rate as number,
      skills_gap: (c.skills_gap as string[]) || [],
      skills_match: (c.skills_match as string[]) || [],
      transition_time_months: c.transition_time_months as number,
      is_saved: false,
    }));

    const { data } = await supabase.from("career_paths").insert(toInsert).select();

    await supabase.from("user_profiles").update({ assessment_status: "completed" }).eq("id", user.id);

    return (data as CareerPath[]) || null;
  } catch (err) {
    console.error("generateCareerPaths error:", err);
    return null;
  }
}

export async function toggleSaveCareer(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: career } = await supabase
    .from("career_paths")
    .select("is_saved")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!career) return false;
  const { error } = await supabase
    .from("career_paths")
    .update({ is_saved: !career.is_saved })
    .eq("id", id);
  return !error;
}
