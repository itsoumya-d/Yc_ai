"use server";

import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scoreDeal(dealId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return { data: null, error: "Deal not found" };
  }

  const { data: activities } = await supabase
    .from("deal_activities")
    .select("content, type, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(10);

  const prompt = `You are a B2B sales intelligence AI. Analyze this deal and provide a score from 0-100 and insights.

Deal Information:
- Name: ${deal.name}
- Company: ${deal.company}
- Value: $${deal.value}
- Stage: ${deal.stage}
- Probability: ${deal.probability}%
- Source: ${deal.source ?? "unknown"}
- Expected close: ${deal.expected_close_date ?? "not set"}
- Description: ${deal.description ?? "none"}
- Contact: ${deal.contact_name ?? "none"} (${deal.contact_email ?? "no email"})
- Days in pipeline: ${Math.ceil((Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24))}

Recent Activities:
${
  activities && activities.length > 0
    ? activities.map((a) => `- [${a.type}] ${a.content}`).join("\n")
    : "No recent activities"
}

Provide a JSON response with:
{
  "score": <0-100 integer>,
  "insights": "<3-4 sentences explaining the score, key strengths, risks, and recommended next action>"
}

Consider: deal stage progression speed, contact engagement level, value size, days to close, activity recency.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 400,
    });

    const result = JSON.parse(
      completion.choices[0].message.content ?? "{}"
    ) as { score: number; insights: string };

    const score = Math.max(0, Math.min(100, result.score ?? 50));
    const insights = result.insights ?? "Unable to generate insights.";

    // Update deal with score and insights
    await supabase
      .from("deals")
      .update({ ai_score: score, ai_insights: insights })
      .eq("id", dealId);

    // Log activity
    await supabase.from("deal_activities").insert({
      deal_id: dealId,
      content: `AI scored this deal: ${score}/100`,
      type: "note",
      user_id: user.id,
    });

    return { data: { score, insights }, error: null };
  } catch (err) {
    const error = err as Error;
    return { data: null, error: error.message ?? "AI scoring failed" };
  }
}

export async function generateFollowUp(dealId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (dealError || !deal) {
    return { data: null, error: "Deal not found" };
  }

  const { data: userProfile } = await supabase.auth.getUser();
  const senderName = userProfile.user?.user_metadata?.full_name ?? "Your Name";

  const { data: activities } = await supabase
    .from("deal_activities")
    .select("content, type, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(5);

  const prompt = `You are a professional B2B sales rep. Write a concise, personalized follow-up email for this deal.

Deal Details:
- Deal: ${deal.name}
- Company: ${deal.company}
- Contact: ${deal.contact_name ?? "there"} (${deal.contact_email ?? ""})
- Stage: ${deal.stage}
- Value: $${deal.value}
- Expected close: ${deal.expected_close_date ?? "not set"}
- Description: ${deal.description ?? "N/A"}

Recent Activities:
${
  activities && activities.length > 0
    ? activities.map((a) => `- ${a.content}`).join("\n")
    : "No previous interactions"
}

Sender: ${senderName}

Write a professional follow-up email (subject + body). Keep it under 150 words. Be specific to the deal context. Do not use generic templates.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const email = completion.choices[0].message.content ?? "Unable to generate email.";

    return { data: { email }, error: null };
  } catch (err) {
    const error = err as Error;
    return { data: null, error: error.message ?? "Email generation failed" };
  }
}

export async function analyzePipelineHealth(userId: string) {
  const supabase = await createServerClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", userId);

  const allDeals = deals ?? [];
  if (allDeals.length === 0) {
    return {
      data: { analysis: "No deals in pipeline yet. Start adding deals to get AI analysis." },
      error: null,
    };
  }

  const summary = {
    total: allDeals.length,
    totalValue: allDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    avgScore:
      allDeals.reduce((sum, d) => sum + (d.ai_score ?? 0), 0) / allDeals.length,
    stagesCount: {} as Record<string, number>,
  };

  allDeals.forEach((d) => {
    summary.stagesCount[d.stage] = (summary.stagesCount[d.stage] ?? 0) + 1;
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze this sales pipeline health in 2-3 sentences: ${JSON.stringify(summary)}. Give actionable advice.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    const analysis = completion.choices[0].message.content ?? "";
    return { data: { analysis }, error: null };
  } catch (err) {
    const error = err as Error;
    return { data: null, error: error.message };
  }
}
