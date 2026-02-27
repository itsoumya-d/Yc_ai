import { TrendingUp, Target } from "lucide-react"

const deals = [
  { company: "Meridian Corp", stage: "Negotiation", value: 290000, probability: 65 },
  { company: "TerraScale AI", stage: "Proposal", value: 215000, probability: 40 },
  { company: "Apex Systems", stage: "Proposal", value: 148000, probability: 35 },
  { company: "FusionTech", stage: "Qualified", value: 124000, probability: 25 },
  { company: "Orion Analytics", stage: "Qualified", value: 87500, probability: 30 },
  { company: "NexGen Systems", stage: "Negotiation", value: 165000, probability: 55 },
  { company: "CipherNet", stage: "Qualified", value: 43000, probability: 20 },
  { company: "DataSync Pro", stage: "Prospect", value: 52000, probability: 10 },
  { company: "CloudBase Inc", stage: "Prospect", value: 76000, probability: 15 },
]

const QUOTA = 2400000
const WON = 1680000

const months = [
  { label: "Dec", value: 420000, won: 310000 },
  { label: "Jan", value: 580000, won: 445000 },
  { label: "Feb", value: 490000, won: 380000 },
]

const stageBreakdown = [
  { stage: "Prospect", count: 3, weighted: 19200, color: "#6B7280" },
  { stage: "Qualified", count: 3, weighted: 76650, color: "#2563EB" },
  { stage: "Proposal", count: 2, weighted: 133050, color: "#7C3AED" },
  { stage: "Negotiation", count: 2, weighted: 279850, color: "#D97706" },
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
  }
  const s = map[stage] || { bg: "#F3F4F6", color: "#6B7280" }
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, background: s.bg, fontSize: 11, fontWeight: 600, color: s.color }}>{stage}</span>
}
export default function ForecastPage() {
  const totalWeighted = deals.reduce((a, d) => a + Math.round(d.value * d.probability / 100), 0)
  const quotaPct = Math.round((WON / QUOTA) * 100)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const filledLen = (quotaPct / 100) * circumference
  const maxBarValue = Math.max(...months.map(m => m.value))

  return (
    <div style={{ padding: "32px", maxWidth: 1300, margin: "0 auto" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700 }}>Sales Forecast</h1>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase" as const, marginBottom: 16 }}>Quota Attainment</div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <svg width={160} height={160} viewBox="0 0 160 160">
              <circle cx={80} cy={80} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
              <circle cx={80} cy={80} r={radius} fill="none" stroke="#2563EB" strokeWidth={10}
                strokeDasharray={filledLen + " " + (circumference - filledLen)}
                strokeLinecap="round" transform="rotate(-90 80 80)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "32px", fontWeight: 700, color: "white" }}>{quotaPct}%</span>
              <span style={{ fontSize: "10px", color: "#64748B" }}>attained</span>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 600, color: "white" }}>{fmt(WON)}</div>
        </div>
        <div>
          <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 16 }}>3-Month Trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 120 }}>
              {months.map((m, i) => {
                const totalH = Math.round((m.value / maxBarValue) * 100)
                const wonH = Math.round((m.won / maxBarValue) * 100)
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
                      <div style={{ flex: 1, background: "#DBEAFE", borderRadius: "4px 4px 0 0", height: totalH + "%" }} />
                      <div style={{ flex: 1, background: "#2563EB", borderRadius: "4px 4px 0 0", height: wonH + "%" }} />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 500 }}>{m.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
      <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 14 }}>Forecast by Stage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {stageBreakdown.map((s, i) => (
            <div key={i} style={{ padding: "12px", background: "var(--bg-page)", borderRadius: 8, border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: s.color + "1A", color: s.color }}>{s.stage}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 600 }}>{fmt(s.weighted)}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>{s.count} deals</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 14 }}>Deal Forecast Table</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Company", "Stage", "Value", "Probability", "Weighted Value"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)", paddingRight: 16 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {deals.map((deal, i) => {
              const weighted = Math.round(deal.value * deal.probability / 100)
              return (
                <tr key={i}>
                  <td style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px", fontWeight: 600 }}>{deal.company}</td>
                  <td style={{ padding: "10px 16px 10px 0", borderBottom: "1px solid var(--border-subtle)" }}><StageBadge stage={deal.stage} /></td>
                  <td style={{ padding: "10px 16px 10px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500 }}>{fmt(deal.value)}</td>
                  <td style={{ padding: "10px 16px 10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: deal.probability + "%", background: deal.probability >= 60 ? "#16a34a" : "#D97706", borderRadius: 9999 }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", width: 32 }}>{deal.probability}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "#2563EB" }}>{fmt(weighted)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ padding: "12px 0 0", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textAlign: "right", paddingRight: 16 }}>Total Weighted:</td>
              <td style={{ padding: "12px 0 0", fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 700, color: "#2563EB" }}>{fmt(totalWeighted)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
