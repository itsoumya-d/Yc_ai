"use server";

import { createClient } from "@/lib/supabase/server";
import type { Skill, SkillLevel } from "@/types/database";

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as Skill[]) || [];
}

export async function addSkill(
  name: string,
  level: SkillLevel,
  years_experience: number
): Promise<Skill | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("skills")
    .insert({ user_id: user.id, name, level, years_experience, source: "manual" })
    .select()
    .single();
  if (error) { console.error("addSkill error:", error); return null; }
  return data as Skill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  return !error;
}
