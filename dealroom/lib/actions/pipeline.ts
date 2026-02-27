"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getPipelineAnalytics() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { data: null, error: error.message };
  }

  const allDeals = deals ?? [];

  const stages = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ];

  const stageBreakdown = stages.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
      weightedValue: stageDeals.reduce(
        (sum, d) => sum + ((d.value ?? 0) * (d.probability ?? 50)) / 100,
        0
      ),
    };
  });

  const openDeals = allDeals.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  );
  const wonDeals = allDeals.filter((d) => d.stage === "closed_won");
  const lostDeals = allDeals.filter((d) => d.stage === "closed_lost");

  const totalPipelineValue = openDeals.reduce(
    (sum, d) => sum + (d.value ?? 0),
    0
  );
  const weightedForecast = openDeals.reduce(
    (sum, d) => sum + ((d.value ?? 0) * (d.probability ?? 50)) / 100,
    0
  );
  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
      : 0;
  const avgDealSize =
    allDeals.length > 0
      ? allDeals.reduce((sum, d) => sum + (d.value ?? 0), 0) / allDeals.length
      : 0;

  // Monthly trend (last 6 months)
  const now = new Date();
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
    const monthDeals = allDeals.filter((d) => {
      const created = new Date(d.created_at);
      return created >= monthDate && created <= monthEnd;
    });
    return {
      month: monthDate.toLocaleDateString("en-US", { month: "short" }),
      deals: monthDeals.length,
      value: monthDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
      won: monthDeals.filter((d) => d.stage === "closed_won").length,
    };
  });

  return {
    data: {
      stageBreakdown,
      summary: {
        totalDeals: allDeals.length,
        openDeals: openDeals.length,
        totalPipelineValue,
        weightedForecast,
        winRate,
        avgDealSize,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
      },
      monthlyTrend,
    },
    error: null,
  };
}

export async function getConversionRates() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data: deals } = await supabase
    .from("deals")
    .select("stage, value")
    .eq("user_id", user.id);

  const allDeals = deals ?? [];

  const stageOrder = ["lead", "qualified", "proposal", "negotiation", "closed_won"];
  const conversionRates = stageOrder.slice(0, -1).map((stage, i) => {
    const nextStage = stageOrder[i + 1];
    const currentCount = allDeals.filter((d) => {
      const stageIndex = stageOrder.indexOf(d.stage);
      return stageIndex >= i;
    }).length;
    const nextCount = allDeals.filter((d) => {
      const stageIndex = stageOrder.indexOf(d.stage);
      return stageIndex >= i + 1;
    }).length;

    return {
      from: stage,
      to: nextStage,
      rate: currentCount > 0 ? Math.round((nextCount / currentCount) * 100) : 0,
    };
  });

  return { data: conversionRates, error: null };
}
