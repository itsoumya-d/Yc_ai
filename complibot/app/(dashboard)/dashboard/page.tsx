import { getComplianceScore, getControls } from "@/lib/actions/controls";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import type { Control } from "@/types/database";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 40; const c = 2 * Math.PI * r; const dash = (score / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={c} strokeDashoffset={c - dash} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: "var(--foreground)" }}>{score}%</span>
      </div>
      <span className="text-sm font-medium mt-2" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const [{ scores, overall }, { controls }] = await Promise.all([
    getComplianceScore(),
    getControls(),
  ]);

  const c = controls as Control[];
  const stats = {
    total: c.length,
    implemented: c.filter((x) => x.status === "implemented").length,
    inProgress: c.filter((x) => x.status === "in_progress").length,
    notStarted: c.filter((x) => x.status === "not_started").length,
  };

  const critical = c
    .filter((x) => x.status === "not_started" && x.category === "Logical Access")
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Compliance Dashboard</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Track your compliance posture across all active frameworks</p>
      </div>

      {/* Overall score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 p-6 rounded-2xl border flex flex-col items-center justify-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" style={{ color: "var(--primary)" }} />
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>Overall Compliance Score</span>
          </div>
          <ScoreRing score={overall} label="All Frameworks" color="var(--primary)" />
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Framework Breakdown</h2>
          {Object.keys(scores).length === 0 ? (
            <p style={{ color: "var(--muted-foreground)" }}>No frameworks configured yet.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {Object.entries(scores).map(([fw, score]) => {
                const colors: Record<string, string> = { soc2: "#1d4ed8", gdpr: "#7c3aed", hipaa: "#16a34a", iso27001: "#d97706" };
                const labels: Record<string, string> = { soc2: "SOC 2", gdpr: "GDPR", hipaa: "HIPAA", iso27001: "ISO 27001" };
                return <ScoreRing key={fw} score={score} label={labels[fw] ?? fw.toUpperCase()} color={colors[fw] ?? "#1d4ed8"} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Controls", value: stats.total, icon: Shield, color: "var(--primary)" },
          { label: "Implemented", value: stats.implemented, icon: CheckCircle, color: "var(--success)" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "var(--warning)" },
          { label: "Not Started", value: stats.notStarted, icon: AlertTriangle, color: "var(--danger)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4" style={{ color }} />
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Critical controls */}
      {critical.length > 0 && (
        <div className="p-6 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5" style={{ color: "var(--danger)" }} />
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Critical Controls Needing Attention</h2>
          </div>
          <div className="space-y-3">
            {critical.map((ctrl) => (
              <div key={ctrl.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--background)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium" style={{ color: "var(--primary)" }}>{ctrl.control_id}</span>
                    <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{ctrl.title}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{ctrl.category} &bull; {ctrl.framework.toUpperCase()}</p>
                </div>
                <span className={"text-xs px-2 py-1 rounded-full font-medium " + getStatusColor(ctrl.status)}>{ctrl.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}