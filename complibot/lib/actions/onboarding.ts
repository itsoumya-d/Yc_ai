"use server";
import { createClient } from "@/lib/supabase/server";
import { FRAMEWORK_CONTROLS } from "@/lib/data/controls";
import type { Framework } from "@/types/database";

interface OnboardingData {
  orgName: string; industry: string; size: string;
  frameworks: Framework[]; techStack: string[];
  targetAuditDate: string | null;
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { orgId: null, error: "Not authenticated" };
  const { data: org, error: orgError } = await supabase.from("orgs").insert({
    name: data.orgName, industry: data.industry, size: data.size,
    frameworks: data.frameworks, tech_stack: data.techStack, target_audit_date: data.targetAuditDate,
  }).select().single();
  if (orgError) return { orgId: null, error: orgError.message };
  const { error: memberError } = await supabase.from("org_members").insert({ org_id: org.id, user_id: user.id, role: "owner" });
  if (memberError) return { orgId: null, error: memberError.message };
  await supabase.from("user_profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email ?? "User",
    org_id: org.id,
  });
  const controlsToInsert = data.frameworks.flatMap((framework) => {
    const controls = FRAMEWORK_CONTROLS[framework];
    if (!controls) return [];
    return (controls as readonly { control_id: string; category: string; title: string; description: string }[]).map((c) => ({
      org_id: org.id, framework,
      control_id: c.control_id, category: c.category, title: c.title, description: c.description,
      status: "not_started" as const,
    }));
  });
  if (controlsToInsert.length > 0) {
    const { error: cErr } = await supabase.from("controls").insert(controlsToInsert);
    if (cErr) return { orgId: null, error: cErr.message };
  }
  await supabase.from("subscriptions").insert({ org_id: org.id, plan: "starter", status: "trialing" });
  return { orgId: org.id, error: null };
}