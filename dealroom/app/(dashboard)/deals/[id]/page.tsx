"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateDealStage, updateDeal, addDealActivity } from "@/lib/actions/deals";
import { scoreDeal, generateFollowUp } from "@/lib/actions/ai";
import toast from "react-hot-toast";
import type { Deal, DealActivity } from "@/types/database";

const STAGES = [
  { value: "lead", label: "Lead", color: "#6b7280" },
  { value: "qualified", label: "Qualified", color: "#3b82f6" },
  { value: "proposal", label: "Proposal", color: "#f59e0b" },
  { value: "negotiation", label: "Negotiation", color: "#8b5cf6" },
  { value: "closed_won", label: "Won", color: "#16a34a" },
  { value: "closed_lost", label: "Lost", color: "#dc2626" },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [activityNote, setActivityNote] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    loadDeal();
  }, [params.id]);

  const loadDeal = async () => {
    setLoading(true);
    const { data: dealData } = await supabase
      .from("deals")
      .select("*")
      .eq("id", params.id as string)
      .single();

    const { data: activitiesData } = await supabase
      .from("deal_activities")
      .select("*")
      .eq("deal_id", params.id as string)
      .order("created_at", { ascending: false });

    setDeal(dealData);
    setActivities(activitiesData ?? []);
    setLoading(false);
  };

  const handleStageChange = async (newStage: string) => {
    if (!deal) return;
    const { error } = await updateDealStage(deal.id, newStage);
    if (error) {
      toast.error(error);
      return;
    }
    setDeal((prev) => prev ? { ...prev, stage: newStage } : null);
    toast.success(`Stage updated to ${newStage.replace(/_/g, " ")}`);
  };

  const handleScoreDeal = async () => {
    if (!deal) return;
    setAiLoading(true);
    const { data, error } = await scoreDeal(deal.id);
    if (error) {
      toast.error(error);
      setAiLoading(false);
      return;
    }
    setDeal((prev) => prev ? { ...prev, ai_score: data.score, ai_insights: data.insights } : null);
    toast.success("AI scoring complete!");
    setAiLoading(false);
  };

  const handleGenerateFollowUp = async () => {
    if (!deal) return;
    setFollowUpLoading(true);
    const { data, error } = await generateFollowUp(deal.id);
    if (error) {
      toast.error(error);
      setFollowUpLoading(false);
      return;
    }
    setFollowUp(data.email);
    setFollowUpLoading(false);
  };

  const handleAddActivity = async () => {
    if (!deal || !activityNote.trim()) return;
    setAddingActivity(true);
    const { error } = await addDealActivity(deal.id, activityNote, "note");
    if (error) {
      toast.error(error);
      setAddingActivity(false);
      return;
    }
    setActivityNote("");
    await loadDeal();
    setAddingActivity(false);
    toast.success("Activity added!");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Deal not found.</p>
        <button onClick={() => router.push("/deals")} className="mt-2 text-primary-600 text-sm">
          Back to deals
        </button>
      </div>
    );
  }

  const currentStage = STAGES.find((s) => s.value === deal.stage);

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title={deal.name}
        subtitle={deal.company}
        backHref="/deals"
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleScoreDeal}
              loading={aiLoading}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
            >
              AI Score
            </Button>
            <Button
              onClick={handleGenerateFollowUp}
              loading={followUpLoading}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Follow-up Email
            </Button>
          </div>
        }
      />

      {/* Stage Pipeline */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {STAGES.map((stage, index) => (
          <button
            key={stage.value}
            onClick={() => handleStageChange(stage.value)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: deal.stage === stage.value ? stage.color : "#f3f4f6",
              color: deal.stage === stage.value ? "white" : "#6b7280",
            }}
          >
            {deal.stage === stage.value && (
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
            {stage.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Deal Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Deal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Probability</p>
                <p className="text-lg font-bold text-gray-900">{deal.probability}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Weighted Value</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency((deal.value * deal.probability) / 100)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {deal.source ?? "–"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected Close</p>
                <p className="font-semibold text-gray-900">
                  {deal.expected_close_date
                    ? new Date(deal.expected_close_date).toLocaleDateString()
                    : "–"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(deal.created_at)}
                </p>
              </div>
            </div>
            {deal.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{deal.description}</p>
              </div>
            )}
          </Card>

          {/* AI Insights */}
          {deal.ai_insights && (
            <Card className="p-5 border-primary-200 bg-primary-50">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.5 3.5 0 0114.5 20.5h-5a3.5 3.5 0 01-2.475-1.025l-.347-.347z" />
                </svg>
                <h3 className="font-semibold text-primary-900">AI Insights</h3>
                <div
                  className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
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
              <p className="text-sm text-primary-800 whitespace-pre-line">
                {deal.ai_insights}
              </p>
            </Card>
          )}

          {/* Follow-up Email */}
          {followUp && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Generated Follow-up Email</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(followUp);
                    toast.success("Copied to clipboard!");
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3">
                {followUp}
              </pre>
            </Card>
          )}

          {/* Activity Feed */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                onClick={handleAddActivity}
                loading={addingActivity}
                disabled={!activityNote.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activities yet.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{activity.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            {deal.contact_name ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {deal.contact_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{deal.contact_name}</p>
                </div>
                {deal.contact_email && (
                  <a href={`mailto:${deal.contact_email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {deal.contact_email}
                  </a>
                )}
                {deal.contact_phone && (
                  <a href={`tel:${deal.contact_phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {deal.contact_phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No contact added.</p>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Days in pipeline</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.ceil((Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Activities</span>
                <span className="text-sm font-medium text-gray-900">{activities.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Weighted value</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency((deal.value * deal.probability) / 100)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
