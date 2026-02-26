import Link from "next/link"
import { AlertTriangle, Zap, ArrowRight } from "lucide-react"

const alerts = [
  { id: 1, company: "Apex Systems", issue: "No activity for 14 days", severity: "high", value: "$148,000" },
  { id: 2, company: "Meridian Corp", issue: "Champion left. Re-establish contact ASAP", severity: "critical", value: "$290,000" },
  { id: 3, company: "Orion Analytics", issue: "Competitor Salesforce mentioned in last call", severity: "medium", value: "$87,500" },
]
const pipeline = [
  { stage: "Prospect", count: 14, value: 420000, color: "#6B7280" },
  { stage: "Qualified", count: 11, value: 628000, color: "#2563EB" },
  { stage: "Proposal", count: 9, value: 892000, color: "#7C3AED" },
  { stage: "Negotiation", count: 7, value: 1140000, color: "#D97706" },
  { stage: "Closed Won", count: 6, value: 740000, color: "#16a34a" },
]
const activity = [
  { type: "email", text: "Sent proposal to Sarah Chen at Meridian Corp", time: "2 hours ago" },
  { type: "call", text: "Discovery call with James Park at Orion Analytics", time: "4 hours ago" },
  { type: "won", text: "Closed deal with CloudBase Inc", time: "Yesterday" },
  { type: "note", text: "Updated stakeholder map for Apex Systems", time: "Yesterday" },
  { type: "meeting", text: "Demo scheduled with FusionTech next Tuesday", time: "2 days ago" },
]
const topDeals = [
  { company: "Meridian Corp", contact: "Sarah Chen", value: 290000, stage: "Negotiation", health: 62 },
  { company: "TerraScale AI", contact: "Michael Torres", value: 215000, stage: "Proposal", health: 81 },
  { company: "Apex Systems", contact: "Linda Park", value: 148000, stage: "Proposal", health: 43 },
  { company: "Orion Analytics", contact: "James Park", value: 87500, stage: "Qualified", health: 77 },
]
const quickStats = [
  { label: "Total Deals", value: "47", sub: "+5 this week", danger: false },
  { label: "Deals This Month", value: "12", sub: "3 closed won", danger: false },
  { label: "Avg Deal Size", value: "$51,200", sub: "+8% vs last month", danger: false },
  { label: "Deals at Risk", value: "6", sub: "Need attention", danger: true },
]

function fmt(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K"
  return "$" + n
}
const totalPipelineValue = pipeline.reduce((a, b) => a + b.value, 0)

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Prospect: { bg: "#F3F4F6", color: "#6B7280" },
    Qualified: { bg: "#DBEAFE", color: "#2563EB" },
    Proposal: { bg: "#EDE9FE", color: "#7C3AED" },
    Negotiation: { bg: "#FEF3C7", color: "#D97706" },
    "Closed Won": { bg: "#DCFCE7", color: "#16a34a" },
  }
  const s = map[stage] || { bg: "#F3F4F6", color: "#6B7280" }
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, background: s.bg, fontSize: 11, fontWeight: 600, color: s.color }}>{stage}</span>
}
function HealthBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#D97706" : "#DC2626"
  const bg = score >= 75 ? "#DCFCE7" : score >= 50 ? "#FEF3C7" : "#FEE2E2"
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, background: bg, fontSize: 11, fontWeight: 700, color }}>{score}</span>
}

export default function DashboardPage() {
  const QUOTA_PCT = 70
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const filledLength = (QUOTA_PCT / 100) * circumference

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Zap size={18} color="#2563EB" />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#2563EB", textTransform: "uppercase" as const }}>AI Dashboard</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Good morning, Alex</h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: 4 }}>6 deals need attention today. Win rate is up 12% this quarter.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 200px", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 8 }}>Active Pipeline</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 500 }}>$2.4M</div>
          <div style={{ fontSize: "12px", color: "#16a34a", marginTop: 6 }}>+18% vs last quarter</div>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 8 }}>Win Rate</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 500 }}>41%</div>
          <div style={{ fontSize: "12px", color: "#16a34a", marginTop: 6 }}>+5pp vs last quarter</div>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 8 }}>Avg Sales Cycle</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 500 }}>34d</div>
          <div style={{ fontSize: "12px", color: "#16a34a", marginTop: 6 }}>-4 days vs target</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <svg width={110} height={110} viewBox="0 0 110 110">
              <circle cx={55} cy={55} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
              <circle cx={55} cy={55} r={radius} fill="none" stroke="#2563EB" strokeWidth={7}
                strokeDasharray={filledLength + " " + (circumference - filledLength)}
                strokeLinecap="round" transform="rotate(-90 55 55)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: "white" }}>{QUOTA_PCT}%</span>
              <span style={{ fontSize: "9px", color: "#64748B", marginTop: 2 }}>of quota</span>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#94A3B8" }}>$1.68M / $2.4M</div>
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #7C3AED, #2563EB)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={13} color="white" />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>AI Deal Alerts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map(alert => {
            const sc = alert.severity === "critical" ? "#DC2626" : alert.severity === "high" ? "#D97706" : "#7C3AED"
            const sbg = alert.severity === "critical" ? "#FEE2E2" : alert.severity === "high" ? "#FEF3C7" : "#EDE9FE"
            return (
              <div key={alert.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--bg-page)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <AlertTriangle size={15} color={sc} strokeWidth={2.5} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{alert.company}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{alert.value}</span>
                    <span style={{ padding: "1px 7px", borderRadius: 9999, background: sbg, color: sc, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const }}>{alert.severity}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{alert.issue}</div>
                </div>
                <Link href="/deals/1" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", fontWeight: 500, color: "#2563EB", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Take action <ArrowRight size={12} />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 16 }}>Quick Stats</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {quickStats.map(stat => (
              <div key={stat.label} style={{ padding: "12px", background: "var(--bg-page)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 500, color: stat.danger ? "#DC2626" : "var(--text-primary)" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: 3 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Pipeline by Stage</span>
            <Link href="/deals" style={{ fontSize: "11px", color: "#2563EB", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pipeline.map(p => {
              const pct = Math.round((p.value / totalPipelineValue) * 100)
              return (
                <div key={p.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{p.stage}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500 }}>{fmt(p.value)}</span>
                  </div>
                  <div style={{ height: 6, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: p.color, borderRadius: 9999 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 16 }}>Recent Activity</div>
          {activity.map((a, i) => {
            const colors: Record<string, string> = { email: "#2563EB", call: "#7C3AED", won: "#16a34a", note: "#D97706", meeting: "#0891B2" }
            const labels: Record<string, string> = { email: "E", call: "C", won: "W", note: "N", meeting: "M" }
            const c = colors[a.type] || "#6B7280"
            return (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < activity.length - 1 ? 14 : 0, marginBottom: i < activity.length - 1 ? 14 : 0, borderBottom: i < activity.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: c + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 700, color: c }}>{labels[a.type]}</div>
                <div>
                  <div style={{ fontSize: "12px", lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Top Deals by Value</span>
            <Link href="/deals" style={{ fontSize: "11px", color: "#2563EB", textDecoration: "none" }}>View pipeline</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Company", "Contact", "Value", "Stage", "Health"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)", paddingRight: 12 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {topDeals.map((deal, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 0", borderBottom: i < topDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <Link href="/deals/1" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>{deal.company}</Link>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: "12px", color: "var(--text-secondary)", borderBottom: i < topDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>{deal.contact}</td>
                  <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, borderBottom: i < topDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>{fmt(deal.value)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: i < topDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}><StageBadge stage={deal.stage} /></td>
                  <td style={{ padding: "10px 0", borderBottom: i < topDeals.length - 1 ? "1px solid var(--border-subtle)" : "none" }}><HealthBadge score={deal.health} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
