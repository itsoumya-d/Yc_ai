"use client";
import { useState, useTransition } from "react";
import { updateControlStatus } from "@/lib/actions/controls";
import { getStatusColor, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, FileText, Check, Clock, X, Minus } from "lucide-react";
import type { Control, ControlStatus } from "@/types/database";

const STATUS_ACTIONS = [
  { status: "implemented" as ControlStatus, label: "Implemented", icon: Check, color: "var(--success)" },
  { status: "in_progress" as ControlStatus, label: "In Progress", icon: Clock, color: "var(--warning)" },
  { status: "not_started" as ControlStatus, label: "Not Started", icon: X, color: "var(--danger)" },
  { status: "not_applicable" as ControlStatus, label: "N/A", icon: Minus, color: "var(--muted-foreground)" },
];

export function ControlRow({ control, onUpdate }: { control: Control; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(control.notes ?? "");
  const [pending, startTransition] = useTransition();

  const handleStatusUpdate = (status: ControlStatus) => {
    startTransition(async () => {
      await updateControlStatus(control.id, status, notes || undefined);
      onUpdate();
    });
  };

  return (
    <div className="border rounded-xl overflow-hidden mb-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
        <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + getStatusColor(control.status)}>{control.status.replace(/_/g, " ")}</span>
        <span className="text-xs font-mono font-medium w-16 flex-shrink-0" style={{ color: "var(--primary)" }}>{control.control_id}</span>
        <span className="flex-1 font-medium text-sm" style={{ color: "var(--foreground)" }}>{control.title}</span>
        <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{control.category}</span>
        {control.evidence_count > 0 && (<span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}><FileText className="h-3 w-3" />{control.evidence_count}</span>)}
        {control.due_date && <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>Due {formatDate(control.due_date)}</span>}
        {expanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm mt-3 mb-4" style={{ color: "var(--muted-foreground)" }}>{control.description}</p>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }} placeholder="Add implementation notes..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium self-center" style={{ color: "var(--muted-foreground)" }}>Set status:</span>
            {STATUS_ACTIONS.map(({ status, label, icon: Icon, color }) => (
              <button key={status} onClick={() => handleStatusUpdate(status)} disabled={pending} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:bg-slate-50 disabled:opacity-50" style={{ borderColor: "var(--border)", color: control.status === status ? color : "var(--foreground)" }}>
                <Icon className="h-3 w-3" style={{ color }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}