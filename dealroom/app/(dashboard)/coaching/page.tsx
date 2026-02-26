import { TrendingUp, TrendingDown, Minus, Zap, Users } from "lucide-react"

const reps = [
  {
    name: "Alex Johnson",
    avatar: "AJ",
    deals: 12,
    won: 5,
    winRate: 42,
    avgCycle: 31,
    pipeline: 890000,
    trend: "up",
    insights: [
      "Win rate up 8pp this quarter — enterprise deal focus is paying off",
      "Average deal size increased 22% — successfully moving upmarket",
      "Response time to inbound leads is 28% faster than team average",
    ],
    tips: ["Focus on qualification calls with CFO earlier in cycle", "Improve demo-to-proposal conversion (currently 61%)"],
  },
  {
    name: "Jordan Smith",
    avatar: "JS",
    deals: 18,
    won: 6,
    winRate: 33,
    avgCycle: 41,
    pipeline: 620000,
    trend: "down",
    insights: [
      "Win rate dropped 5pp — losing more deals to no-decision",
      "Sales cycle 24% longer than team average — discovery phase bottleneck",
      "Strong top-of-funnel — 40% more qualified deals than peers",
    ],
    tips: ["Shorten discovery phase with structured MEDDIC qualification", "Set clearer success criteria in initial calls"],
  },
  {
    name: "Taylor Lee",
    avatar: "TL",
    deals: 9,
    won: 4,
    winRate: 44,
    avgCycle: 27,
    pipeline: 540000,
    trend: "up",
    insights: [
      "Highest win rate on the team this quarter — strong closing skills",
      "Multi-threading is excellent — average 3.2 contacts per deal vs 1.8 team average",
      "Email response rate 18% higher than team benchmark",
    ],
    tips: ["Increase prospecting activity — pipeline coverage needs to grow", "Expand into larger deal segments"],
  },
  {
    name: "Morgan Davis",
    avatar: "MD",
    deals: 14,
    won: 4,
    winRate: 29,
    avgCycle: 38,
    pipeline: 710000,
    trend: "neutral",
    insights: [
      "Win rate 12pp below team average — deal quality needs focus",
      "Strong at competitive deals — 60% win rate when Salesforce is in play",
      "Proposal stage conversion rate needs improvement",
    ],
    tips: ["Improve qualification criteria to focus on higher-fit prospects", "Request coaching on enterprise proposal writing"],
  },
]

const teamPatterns = [
  { pattern: "Multi-threading leads to 2.4x higher win rates across all reps", type: "positive" },
  { pattern: "Deals stalled in Proposal for 15+ days have only 18% close rate", type: "warning" },
  { pattern: "Avg deal size growing 15% QoQ — upmarket motion is working", type: "positive" },
  { pattern: "Competitive losses to Salesforce up 8% — need stronger battle cards", type: "negative" },
]

export default function CoachingPage() {
  return (
    <div style={{ padding: "32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Zap size={16} color="#7C3AED" />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase" as const }}>AI Coaching</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em" }}>Rep Performance</h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: 4 }}>AI-powered insights to improve team win rates and close more deals.</p>
      </div>

      <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <Users size={14} color="#2563EB" />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Rep Performance Overview</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Rep", "Active Deals", "Won", "Win Rate", "Avg Cycle", "Pipeline", "Trend"].map(h => (
              <th key={h} style={{ textAlign: "left", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" as const, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)", paddingRight: 16 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {reps.map((rep, i) => (
              <tr key={i}>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white", flexShrink: 0 }}>{rep.avatar}</div>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{rep.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px 12px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500 }}>{rep.deals}</td>
                <td style={{ padding: "12px 16px 12px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500 }}>{rep.won}</td>
                <td style={{ padding: "12px 16px 12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: rep.winRate + "%", background: rep.winRate >= 40 ? "#16a34a" : rep.winRate >= 30 ? "#D97706" : "#DC2626", borderRadius: 9999 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: rep.winRate >= 40 ? "#16a34a" : rep.winRate >= 30 ? "#D97706" : "#DC2626" }}>{rep.winRate}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px 12px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{rep.avgCycle}d</td>
                <td style={{ padding: "12px 16px 12px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500 }}>${(rep.pipeline / 1000).toFixed(0)}K</td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  {rep.trend === "up" ? <TrendingUp size={16} color="#16a34a" /> : rep.trend === "down" ? <TrendingDown size={16} color="#DC2626" /> : <Minus size={16} color="#6B7280" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {reps.map((rep, i) => (
          <div key={i} style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>{rep.avatar}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{rep.name}</div>
                <div style={{ fontSize: "11px", color: "#7C3AED", fontWeight: 500 }}>AI Coaching Insights</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {rep.insights.map((insight, j) => (
                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: "var(--bg-page)", borderRadius: 7, border: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Zap size={8} color="white" />
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>{insight}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#D97706", textTransform: "uppercase" as const, marginBottom: 6 }}>Improvement Tips</div>
              {rep.tips.map((tip, j) => (
                <div key={j} style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: 3, paddingLeft: 12, borderLeft: "2px solid #D97706" }}>{tip}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <Zap size={14} color="#2563EB" />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Team-Wide Patterns</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {teamPatterns.map((p, i) => {
            const color = p.type === "positive" ? "#16a34a" : p.type === "negative" ? "#DC2626" : "#D97706"
            const bg = p.type === "positive" ? "#DCFCE7" : p.type === "negative" ? "#FEE2E2" : "#FEF3C7"
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: bg + "80", borderRadius: 8, border: "1px solid " + bg }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{p.pattern}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
