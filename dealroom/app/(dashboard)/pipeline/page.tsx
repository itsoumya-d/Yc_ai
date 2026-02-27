import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { PipelineChart } from "@/components/pipeline/pipeline-chart";
import { formatCurrency } from "@/lib/utils";

const STAGES = [
  { key: "lead", label: "Lead", color: "#6b7280" },
  { key: "qualified", label: "Qualified", color: "#3b82f6" },
  { key: "proposal", label: "Proposal", color: "#f59e0b" },
  { key: "negotiation", label: "Negotiation", color: "#8b5cf6" },
  { key: "closed_won", label: "Won", color: "#16a34a" },
  { key: "closed_lost", label: "Lost", color: "#dc2626" },
];

async function PipelineContent() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);

  const allDeals = deals ?? [];

  const stageData = STAGES.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage.key);
    const totalValue = stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
    const weightedValue = stageDeals.reduce(
      (sum, d) => sum + ((d.value ?? 0) * (d.probability ?? 50)) / 100,
      0
    );
    return {
      ...stage,
      count: stageDeals.length,
      value: totalValue,
      weightedValue,
    };
  });

  const openStages = stageData.filter(
    (s) => s.key !== "closed_won" && s.key !== "closed_lost"
  );
  const totalPipelineValue = openStages.reduce((sum, s) => sum + s.value, 0);
  const weightedForecast = openStages.reduce((sum, s) => sum + s.weightedValue, 0);

  const avgDealSize =
    allDeals.length > 0
      ? allDeals.reduce((sum, d) => sum + (d.value ?? 0), 0) / allDeals.length
      : 0;

  const wonDeals = allDeals.filter((d) => d.stage === "closed_won");
  const lostDeals = allDeals.filter((d) => d.stage === "closed_lost");
  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : 0;

  const avgScore =
    allDeals.length > 0
      ? Math.round(
          allDeals.reduce((sum, d) => sum + (d.ai_score ?? 0), 0) /
            allDeals.length
        )
      : 0;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Total Pipeline
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalPipelineValue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Weighted Forecast
          </p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {formatCurrency(weightedForecast)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Win Rate
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">{winRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Avg Deal Size
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(avgDealSize)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Funnel Chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pipeline Funnel</h3>
          <PipelineChart data={stageData} type="funnel" />
        </Card>

        {/* Value by Stage */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Value by Stage</h3>
          <PipelineChart data={stageData} type="bar" />
        </Card>
      </div>

      {/* Stage Breakdown Table */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Stage Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 border-b border-gray-100">
              <tr>
                <th className="text-left pb-2 font-medium">Stage</th>
                <th className="text-right pb-2 font-medium">Deals</th>
                <th className="text-right pb-2 font-medium">Total Value</th>
                <th className="text-right pb-2 font-medium">Weighted Value</th>
                <th className="text-right pb-2 font-medium">Avg Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stageData.map((stage) => (
                <tr key={stage.key} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: stage.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {stage.label}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-700">{stage.count}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatCurrency(stage.value)}
                  </td>
                  <td className="py-3 text-right text-primary-600 font-medium">
                    {formatCurrency(stage.weightedValue)}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {stage.count > 0
                      ? formatCurrency(stage.value / stage.count)
                      : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function PipelinePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Pipeline Analytics"
        subtitle="Forecast and analyze your sales pipeline"
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <PipelineContent />
      </Suspense>
    </div>
  );
}
