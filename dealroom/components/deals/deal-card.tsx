import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getScoreColor } from "@/lib/utils";
import type { Deal } from "@/types/database";

interface DealCardProps {
  deal: Deal;
  compact?: boolean;
}

export function DealCard({ deal, compact = false }: DealCardProps) {
  const daysUntilClose = deal.expected_close_date
    ? Math.ceil(
        (new Date(deal.expected_close_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isUrgent = daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div className={`deal-card ${isUrgent ? "border-amber-300" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {deal.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">{deal.company}</p>
          </div>
          {deal.ai_score > 0 && (
            <div
              className="score-ring text-white text-xs font-bold flex-shrink-0"
              style={{
                background: getScoreColor(deal.ai_score),
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {deal.ai_score}
            </div>
          )}
        </div>

        <p className="text-base font-bold text-gray-900 mb-2">
          {formatCurrency(deal.value)}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 flex-wrap">
            {deal.contact_name && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {deal.contact_name}
              </span>
            )}
            {isUrgent && (
              <Badge variant="warning" className="text-xs">
                {daysUntilClose}d left
              </Badge>
            )}
            {deal.source && (
              <span className="text-xs text-gray-400 capitalize">{deal.source}</span>
            )}
          </div>
        )}

        {deal.expected_close_date && !compact && (
          <p className="text-xs text-gray-400 mt-2">
            Close:{" "}
            {new Date(deal.expected_close_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
