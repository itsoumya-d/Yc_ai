"use server";
import { createClient } from "@/lib/supabase/server";

export async function getEvidence(controlId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { evidence: [], error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { evidence: [], error: "No org found" };
  let query = supabase.from("evidence_items")
    .select("*, controls(control_id, title, framework)")
    .eq("org_id", profile.org_id)
    .order("collected_at", { ascending: false });
  if (controlId) query = query.eq("control_id", controlId);
  const { data, error } = await query;
  return { evidence: data ?? [], error: error?.message ?? null };
}

export async function addEvidence(
  title: string, description: string, controlId?: string,
  fileUrl?: string, fileName?: string, expiresAt?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { item: null, error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { item: null, error: "No org found" };
  const { data, error } = await supabase.from("evidence_items").insert({
    org_id: profile.org_id,
    control_id: controlId ?? null, title,
    description: description || null,
    file_url: fileUrl ?? null, file_name: fileName ?? null,
    expires_at: expiresAt ?? null,
  }).select().single();
  return { item: data, error: error?.message ?? null };
}