"use client";

import { DealCard } from "./deal-card";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/database";

interface Stage {
  key: string;
  label: string;
}

interface DealKanbanProps {
  dealsByStage: Record<string, Deal[]>;
  stages: Stage[];
}

const STAGE_COLORS: Record<string, string> = {
  lead: "#6b7280",
  qualified: "#3b82f6",
  proposal: "#f59e0b",
  negotiation: "#8b5cf6",
  closed_won: "#16a34a",
  closed_lost: "#dc2626",
};

export function DealKanban({ dealsByStage, stages }: DealKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const deals = dealsByStage[stage.key] ?? [];
        const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
        const color = STAGE_COLORS[stage.key] ?? "#6b7280";

        return (
          <div key={stage.key} className="kanban-column">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color }}
                />
                <h3 className="text-sm font-semibold text-gray-800">
                  {stage.label}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-1.5 py-0.5">
                  {deals.length}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {formatCurrency(totalValue)}
            </p>

            {/* Deal Cards */}
            <div className="space-y-2">
              {deals.length === 0 ? (
                <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-xs text-gray-400">No deals</p>
                </div>
              ) : (
                deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
