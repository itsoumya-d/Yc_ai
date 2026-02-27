"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface StageData {
  key: string;
  label: string;
  color: string;
  count: number;
  value: number;
  weightedValue: number;
}

interface PipelineChartProps {
  data: StageData[];
  type: "funnel" | "bar";
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs text-gray-600">
            {p.name}: {typeof p.value === "number" && p.value > 100 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PipelineChart({ data, type }: PipelineChartProps) {
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Total Value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Funnel visualization (horizontal bars decreasing in width)
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((stage) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        return (
          <div key={stage.key} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-600 text-right flex-shrink-0">
              {stage.label}
            </div>
            <div className="flex-1">
              <div
                className="h-7 rounded flex items-center px-2 transition-all"
                style={{
                  width: `${widthPct}%`,
                  background: stage.color,
                  minWidth: "40px",
                }}
              >
                <span className="text-white text-xs font-medium">
                  {stage.count}
                </span>
              </div>
            </div>
            <div className="w-20 text-xs text-gray-500 flex-shrink-0">
              {stage.value > 0 ? formatCurrency(stage.value) : "–"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
