import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, FileText, Zap, TrendingUp, Users } from "lucide-react"

const deal = {
  id: "1",
  company: "Meridian Corp",
  contact: { name: "Sarah Chen", title: "VP of Operations", email: "s.chen@meridian.com", phone: "+1 (415) 555-0182" },
  secondaryContacts: [
    { name: "David Kim", title: "CTO", email: "d.kim@meridian.com" },
    { name: "Lisa Wang", title: "Procurement Manager", email: "l.wang@meridian.com" },
  ],
  value: 290000,
  stage: "Negotiation",
  health: 62,
  daysInStage: 8,
  closeDate: "2026-03-31",
  probability: 65,
}

const aiScores = [
  { factor: "Engagement", score: 72, description: "3 emails, 2 calls in last 14 days" },
  { factor: "Sentiment", score: 58, description: "Neutral tone, some pricing concerns" },
  { factor: "Timeline", score: 61, description: "Close date is 5 weeks away, achievable" },
  { factor: "Competition", score: 44, description: "Salesforce actively engaged per last call" },
]

const nextActions = [
  { priority: "high", action: "Schedule executive sponsor call with their CEO", due: "This week" },
  { priority: "high", action: "Send ROI analysis comparing TCO vs Salesforce", due: "Tomorrow" },
  { priority: "medium", action: "Follow up on legal redline comments from 2 days ago", due: "Friday" },
]

const timeline = [
  { type: "email", text: "Sent revised pricing proposal to Sarah Chen", time: "2 days ago", icon: Mail },
  { type: "call", text: "45-min discovery call — discussed implementation timeline", time: "4 days ago", icon: Phone },
  { type: "meeting", text: "Product demo with technical team (6 attendees)", time: "1 week ago", icon: Calendar },
  { type: "email", text: "Sent introductory deck and case studies", time: "2 weeks ago", icon: Mail },
  { type: "note", text: "Champion Sarah confirmed budget approved for Q1", time: "3 weeks ago", icon: FileText },
]

function fmt(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K"
  return "$" + n
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Prospect: { bg: "#F3F4F6", color: "#6B7280" },
    Qualified: { bg: "#DBEAFE", color: "#2563EB" },
    Proposal: { bg: "#EDE9FE", color: "#7C3AED" },
    Negotiation: { bg: "#FEF3C7", color: "#D97706" },
    "Closed Won": { bg: "#DCFCE7", color: "#16a34a" },
  }
  const s = map[stage] || { bg: "#F3F4F6", color: "#6B7280" }
  return <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, background: s.bg, fontSize: 12, fontWeight: 600, color: s.color }}>{stage}</span>
}
export default function DealDetailPage() {
  const overallHealth = Math.round(aiScores.reduce((a, s) => a + s.score, 0) / aiScores.length)
  const healthColor = overallHealth >= 75 ? "#16a34a" : overallHealth >= 50 ? "#D97706" : "#DC2626"
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const filled = (overallHealth / 100) * circumference

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: "28px", fontWeight: 700 }}>{deal.company}</h1>
              <StageBadge stage={deal.stage} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 500 }}>{fmt(deal.value)}</div>
          </div>
          <div style={{ position: "relative" }}>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={6} />
              <circle cx={48} cy={48} r={radius} fill="none" stroke={healthColor} strokeWidth={6}
                strokeDasharray={filled + " " + (circumference - filled)}
                strokeLinecap="round" transform="rotate(-90 48 48)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 700, color: healthColor }}>{overallHealth}</span>
              <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>health</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <div>
          {deal.secondaryContacts.map((c, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--bg-page)", borderRadius: 8, border: "1px solid var(--border-subtle)", marginBottom: 8 }}>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.title}</div>
            </div>
          ))}
          <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "18px 20px" }}>
            {nextActions.map((action, i) => {
              const uc = action.priority === "high" ? "#DC2626" : "#D97706"
              const ubg = action.priority === "high" ? "#FEE2E2" : "#FEF3C7"
              return (
                <div key={i} style={{ padding: "12px", background: "var(--bg-page)", borderRadius: 8, border: "1px solid var(--border-subtle)", marginBottom: 8 }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: 9999, background: ubg, color: uc, textTransform: "uppercase" as const }}>{action.priority}</span>
                  <div style={{ fontSize: "12px" }}>{action.action}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          {aiScores.map((s, i) => {
            const color = s.score >= 75 ? "#16a34a" : s.score >= 50 ? "#D97706" : "#DC2626"
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "12px", fontWeight: 500 }}>{s.factor}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color }}>{s.score}</span>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: s.score + "%", background: color, borderRadius: 9999 }} />
                </div>
              </div>
            )
          })}
        </div>
        <div>
          {timeline.map((item, i) => {
            const Icon = item.icon
            const colors: Record<string, string> = { email: "#2563EB", call: "#7C3AED", meeting: "#0891B2", note: "#D97706" }
            const c = colors[item.type] || "#6B7280"
            return (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: c + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={12} color={c} />
                </div>
                <div>
                  <div style={{ fontSize: "12px" }}>{item.text}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.time}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
