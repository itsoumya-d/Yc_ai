import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { DealKanban } from "@/components/deals/deal-kanban";
import { DealCard } from "@/components/deals/deal-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Deal } from "@/types/database";

const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Won" },
  { key: "closed_lost", label: "Lost" },
];

async function DealsContent({ view }: { view: string }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allDeals: Deal[] = deals ?? [];

  if (view === "kanban") {
    const dealsByStage = STAGES.reduce(
      (acc, stage) => {
        acc[stage.key] = allDeals.filter((d) => d.stage === stage.key);
        return acc;
      },
      {} as Record<string, Deal[]>
    );

    return <DealKanban dealsByStage={dealsByStage} stages={STAGES} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {allDeals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No deals yet.</p>
          <Link href="/deals/new">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              Add your first deal
            </button>
          </Link>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">AI Score</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Close Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allDeals.map((deal) => (
              <tr
                key={deal.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/deals/${deal.id}`}>
                    <p className="font-medium text-gray-900 hover:text-primary-600">
                      {deal.name}
                    </p>
                    <p className="text-xs text-gray-500">{deal.company}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      deal.stage === "closed_won"
                        ? "success"
                        : deal.stage === "closed_lost"
                        ? "danger"
                        : deal.stage === "proposal"
                        ? "warning"
                        : "default"
                    }
                  >
                    {deal.stage.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(deal.value)}
                </td>
                <td className="px-4 py-3">
                  {deal.ai_score !== null ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          background:
                            deal.ai_score >= 70
                              ? "#16a34a"
                              : deal.ai_score >= 40
                              ? "#ca8a04"
                              : "#dc2626",
                        }}
                      >
                        {deal.ai_score}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {deal.contact_name ?? "–"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {deal.expected_close_date
                    ? new Date(deal.expected_close_date).toLocaleDateString()
                    : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  return (
    <div className="p-6">
      <PageHeader
        title="Deals"
        subtitle="Manage and track your sales pipeline"
        action={
          <div className="flex items-center gap-2">
            <Link href="/deals?view=list">
              <button className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </Link>
            <Link href="/deals?view=kanban">
              <button className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </Link>
            <Link href="/deals/new">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Deal
              </button>
            </Link>
          </div>
        }
      />
      <Suspense
        fallback={
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        }
      >
        <DealsContentWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DealsContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  return <DealsContent view={params.view ?? "list"} />;
}
