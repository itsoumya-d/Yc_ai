"use client";
import { useState, useEffect } from "react";
import { getControls } from "@/lib/actions/controls";
import { ControlRow } from "./ControlRow";
import type { Control } from "@/types/database";

const TABS = ["all", "soc2", "gdpr", "hipaa", "iso27001"] as const;
const TAB_LABELS: Record<string, string> = { all: "All", soc2: "SOC 2", gdpr: "GDPR", hipaa: "HIPAA", iso27001: "ISO 27001" };

export default function ControlsPage() {
  const [tab, setTab] = useState<string>("all");
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadControls = async () => {
    setLoading(true);
    const { controls: data } = await getControls(tab === "all" ? undefined : tab);
    setControls(data as Control[]);
    setLoading(false);
  };

  useEffect(() => { loadControls(); }, [tab]);

  const categories = ["all", ...Array.from(new Set(controls.map((c) => c.category))).sort()];
  const filtered = controls.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Controls Checklist</h1>
      <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>Track and manage compliance controls across all active frameworks</p>
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "var(--muted)" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (tab === t ? "bg-white shadow-sm" : "")} style={{ color: tab === t ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mb-6">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}>
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}>
          <option value="all">All statuses</option>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="implemented">Implemented</option>
          <option value="not_applicable">Not applicable</option>
        </select>
        <span className="text-sm self-center" style={{ color: "var(--muted-foreground)" }}>{filtered.length} controls</span>
      </div>
      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>Loading controls...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>No controls match the current filters.</div>
      ) : (
        filtered.map((ctrl) => <ControlRow key={ctrl.id} control={ctrl} onUpdate={loadControls} />)
      )}
    </div>
  );
}