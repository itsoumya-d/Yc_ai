import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function generateReport(siteId: string, userId: string) {
  // Fetch site details
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .single();

  if (siteError || !site) {
    return { error: "Site not found" };
  }

  // Fetch recent photos for this site
  const { data: photos } = await supabase
    .from("site_photos")
    .select("construction_phase, captured_at, has_safety_violation, ai_description, ai_tags, notes")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false })
    .limit(20);

  const photoSummary = (photos ?? []).map((p) => ({
    phase: p.construction_phase,
    date: p.captured_at,
    safetyViolation: p.has_safety_violation,
    description: p.ai_description,
    notes: p.notes,
  }));

  const safetyViolations = photoSummary.filter((p) => p.safetyViolation).length;

  // Generate AI report content
  const prompt = `Generate a professional construction progress report for the following site.

Site: ${site.name}
Address: ${site.address ?? "N/A"}
Current Phase: ${site.phase ?? "Unknown"}
Progress: ${site.progress_pct ?? 0}%
Photos analyzed: ${photoSummary.length}
Safety violations detected: ${safetyViolations}

Recent photo documentation:
${photoSummary.slice(0, 5).map((p) => `- [${p.phase}] ${p.description ?? "No description"} ${p.safetyViolation ? "(SAFETY VIOLATION)" : ""}`).join("\n")}

Write a concise professional report with sections:
1. Executive Summary (2-3 sentences)
2. Progress Summary (current phase and work completed)
3. Safety Status (violations if any, or clear)
4. Next Steps (recommended actions)

Keep it under 300 words. Use professional construction terminology.`;

  let reportContent = "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500,
    });
    reportContent = completion.choices[0].message.content ?? "Report generation failed.";
  } catch {
    reportContent = `Progress Report for ${site.name}\n\nProgress: ${site.progress_pct ?? 0}%\nPhase: ${site.phase ?? "In Progress"}\nPhotos documented: ${photoSummary.length}\nSafety violations: ${safetyViolations}`;
  }

  // Save report to database
  const { error: saveError } = await supabase.from("reports").insert({
    user_id: userId,
    site_id: siteId,
    title: `Progress Report – ${site.name}`,
    content: reportContent,
    photo_count: photoSummary.length,
    safety_violations: safetyViolations,
    status: "completed",
  });

  if (saveError) {
    return { error: saveError.message };
  }

  return { error: null };
}

export async function getReports(userId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("*, sites(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message };
}
