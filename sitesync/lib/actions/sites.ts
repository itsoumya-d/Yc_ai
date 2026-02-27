import { supabase } from "@/lib/supabase";
import type { Site } from "@/types/index";

export async function getSites(userId: string) {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: (data as Site[]) ?? [], error: error?.message };
}

export async function createSite(input: {
  userId: string;
  name: string;
  address?: string;
  phase?: string;
}) {
  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: input.userId,
      name: input.name,
      address: input.address ?? null,
      phase: input.phase ?? "Foundation",
      status: "active",
      progress_pct: 0,
    })
    .select()
    .single();

  return { data: data as Site | null, error: error?.message };
}

export async function updateSiteProgress(
  siteId: string,
  progressPct: number,
  phase?: string
) {
  const updates: Partial<Site> = { progress_pct: progressPct };
  if (phase) updates.phase = phase;

  const { data, error } = await supabase
    .from("sites")
    .update(updates)
    .eq("id", siteId)
    .select()
    .single();

  return { data: data as Site | null, error: error?.message };
}

export async function closeSite(siteId: string) {
  const { error } = await supabase
    .from("sites")
    .update({ status: "completed", progress_pct: 100 })
    .eq("id", siteId);

  return { error: error?.message };
}

export async function getSiteStats(siteId: string, userId: string) {
  const { data: photos } = await supabase
    .from("site_photos")
    .select("construction_phase, has_safety_violation, captured_at")
    .eq("user_id", userId)
    .eq("site_id", siteId);

  const allPhotos = photos ?? [];
  const violations = allPhotos.filter((p) => p.has_safety_violation).length;
  const phaseBreakdown: Record<string, number> = {};

  allPhotos.forEach((p) => {
    const phase = p.construction_phase ?? "Unknown";
    phaseBreakdown[phase] = (phaseBreakdown[phase] ?? 0) + 1;
  });

  return {
    totalPhotos: allPhotos.length,
    violations,
    phaseBreakdown,
  };
}
