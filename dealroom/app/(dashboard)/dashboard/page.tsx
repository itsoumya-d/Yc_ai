import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

async function DashboardStats() {
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

  const allDeals = deals ?? [];
  const totalValue = allDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const openDeals = allDeals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");
  const wonDeals = allDeals.filter((d) => d.stage === "closed_won");
  const winRate = allDeals.length > 0 ? Math.round((wonDeals.length / allDeals.length) * 100) : 0;

  const hotDeals = allDeals
    .filter((d) => d.ai_score >= 70 && d.stage !== "closed_won" && d.stage !== "closed_lost")
    .sort((a, b) => b.ai_score - a.ai_score)
    .slice(0, 5);

  const urgentDeals = allDeals
    .filter((d) => {
      const closeDate = d.expected_close_date ? new Date(d.expected_close_date) : null;
      const daysUntilClose = closeDate
        ? Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      return daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0 && d.stage !== "closed_won" && d.stage !== "closed_lost";
    })
    .slice(0, 3);

  const recentDeals = allDeals.slice(0, 5);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Pipeline Value
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {openDeals.length} open deals
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Win Rate
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{winRate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {wonDeals.length} deals won
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Hot Deals
          </p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {hotDeals.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Score ≥ 70</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Closing Soon
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {urgentDeals.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Within 7 days</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Alerts */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Priority Alerts
            </h3>
            {urgentDeals.length === 0 ? (
              <p className="text-sm text-gray-500">No urgent deals right now.</p>
            ) : (
              <div className="space-y-3">
                {urgentDeals.map((deal) => {
                  const closeDate = new Date(deal.expected_close_date);
                  const daysLeft = Math.ceil(
                    (closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link key={deal.id} href={`/deals/${deal.id}`}>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {deal.name}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Closes in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Hot Deals */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                High-Score Deals
              </h3>
              <Link
                href="/deals"
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            {hotDeals.length === 0 ? (
              <p className="text-sm text-gray-500">No hot deals yet. Add deals and run AI scoring.</p>
            ) : (
              <div className="space-y-2">
                {hotDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div
                        className="score-ring text-white text-xs font-bold flex-shrink-0"
                        style={{
                          background:
                            deal.ai_score >= 80
                              ? "#16a34a"
                              : deal.ai_score >= 60
                              ? "#ca8a04"
                              : "#dc2626",
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        {deal.ai_score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {deal.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {deal.company}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(deal.value)}
                        </p>
                        <Badge variant={deal.stage === "proposal" ? "warning" : "default"} className="text-xs">
                          {deal.stage.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Deals */}
      <Card className="p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <Link
            href="/deals"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            View all deals
          </Link>
        </div>
        {recentDeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No deals yet.</p>
            <Link href="/deals/new">
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Create your first deal →
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Deal</th>
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5">
                      <Link href={`/deals/${deal.id}`} className="hover:text-primary-600">
                        <p className="font-medium text-gray-900">{deal.name}</p>
                        <p className="text-xs text-gray-500">{deal.company}</p>
                      </Link>
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          deal.stage === "closed_won"
                            ? "success"
                            : deal.stage === "closed_lost"
                            ? "danger"
                            : "default"
                        }
                      >
                        {deal.stage.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-medium">
                      {formatCurrency(deal.value)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            deal.ai_score >= 70
                              ? "#16a34a"
                              : deal.ai_score >= 40
                              ? "#ca8a04"
                              : "#dc2626",
                        }}
                      >
                        {deal.ai_score ?? "–"}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {formatDate(deal.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        subtitle="AI-powered overview of your sales pipeline"
        action={
          <Link href="/deals/new">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deal
            </button>
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>
    </div>
  );
}
