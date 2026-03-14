"use server";
import { createClient } from "@/lib/supabase/server";
import type { PolicyStatus } from "@/types/database";

export async function getPolicies() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { policies: [], error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { policies: [], error: "No org found" };
  const { data, error } = await supabase.from("policies").select("*").eq("org_id", profile.org_id).order("updated_at", { ascending: false });
  return { policies: data ?? [], error: error?.message ?? null };
}

export async function generatePolicy(type: string, orgContext: { name: string; industry: string; techStack: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { policy: null, error: "Not authenticated" };
  const { data: profile } = await supabase.from("user_profiles").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) return { policy: null, error: "No org found" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(baseUrl + "/api/policies/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, orgContext }),
  });
  if (!res.ok) return { policy: null, error: "Generation failed" };
  const { content } = await res.json();
  const { data, error } = await supabase.from("policies").insert({
    org_id: profile.org_id,
    title: type, category: type, content,
    status: "draft", version: 1,
  }).select().single();
  return { policy: data, error: error?.message ?? null };
}

export async function updatePolicy(id: string, content: string, status: PolicyStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("policies").update({ content, status, updated_at: new Date().toISOString() }).eq("id", id);
  return { error: error?.message ?? null };
}