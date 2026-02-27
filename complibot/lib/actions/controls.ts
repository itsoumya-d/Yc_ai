"use server";
import { createClient } from "@/lib/supabase/server";
import type { ControlStatus } from "@/types/database";

export async function getControls(framework?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { controls: [], error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { controls: [], error: "No org found" };
  let query = supabase.from("controls").select("*").eq("org_id", profile.org_id).order("framework").order("control_id");
  if (framework && framework !== "all") query = query.eq("framework", framework);
  const { data, error } = await query;
  return { controls: data ?? [], error: error?.message ?? null };
}

export async function updateControlStatus(id: string, status: ControlStatus, notes?: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (notes !== undefined) updates.notes = notes;
  const { error } = await supabase.from("controls").update(updates).eq("id", id);
  return { error: error?.message ?? null };
}

export async function getComplianceScore() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { scores: {}, overall: 0, error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { scores: {}, overall: 0, error: "No org found" };
  const { data, error } = await supabase.from("controls").select("framework, status").eq("org_id", profile.org_id);
  if (error || !data) return { scores: {}, overall: 0, error: error?.message ?? null };
  const byFw: Record<string, { total: number; impl: number }> = {};
  data.forEach((c) => {
    if (!byFw[c.framework]) byFw[c.framework] = { total: 0, impl: 0 };
    byFw[c.framework].total++;
    if (c.status === "implemented") byFw[c.framework].impl++;
  });
  const scores: Record<string, number> = {};
  Object.entries(byFw).forEach(([fw, { total, impl }]) => { scores[fw] = total > 0 ? Math.round((impl / total) * 100) : 0; });
  const totalControls = data.length;
  const totalImpl = data.filter((c) => c.status === "implemented").length;
  const overall = totalControls > 0 ? Math.round((totalImpl / totalControls) * 100) : 0;
  return { scores, overall, error: null };
}