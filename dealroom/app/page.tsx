import Link from "next/link"
import { Zap, TrendingUp, Mail, BarChart3, Users, ArrowRight, CheckCircle } from "lucide-react"

const features = [
  { icon: Zap, title: "AI Deal Intelligence", desc: "Automatic health scores, risk alerts, and next-best-action recommendations for every deal." },
  { icon: TrendingUp, title: "Pipeline Kanban", desc: "Drag-and-drop pipeline with real-time stage tracking, win/loss analytics, and confetti celebrations." },
  { icon: Mail, title: "Email Intelligence", desc: "AI-powered sentiment analysis, intent extraction, and one-click response drafting." },
  { icon: BarChart3, title: "Forecast Analytics", desc: "Probability-weighted pipeline forecasting with quota tracking and trend analysis." },
  { icon: Users, title: "Rep Coaching", desc: "Personalized AI coaching insights and team-wide pattern analysis to improve win rates." },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "var(--font-sans)" }}>
      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>DealRoom</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/login" style={{ fontSize: "14px", color: "#94A3B8", textDecoration: "none" }}>Sign in</Link>
          <Link href="/dashboard" style={{ padding: "8px 18px", background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 8, fontSize: "14px", fontWeight: 600, color: "white", textDecoration: "none" }}>
            Get Started
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 9999, background: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.3)", marginBottom: 24 }}>
            <Zap size={13} color="#A78BFA" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#A78BFA" }}>AI-Powered CRM Platform</span>
          </div>
          <h1 style={{ fontSize: "60px", fontWeight: 800, color: "white", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
            Close more deals with<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI intelligence
            </span>
          </h1>
          <p style={{ fontSize: "18px", color: "#94A3B8", maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.7 }}>
            DealRoom gives your sales team AI-powered deal health scores, automatic risk alerts, and personalized coaching to win more.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 28px", background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 10, fontSize: "15px", fontWeight: 700, color: "white", textDecoration: "none" }}>
              Try Demo Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{ padding: "14px 28px", borderRadius: 10, fontSize: "15px", fontWeight: 600, color: "#CBD5E1", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
              Sign In
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 80 }}>
          {features.slice(0, 3).map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} style={{ padding: "24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
                <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={18} color="white" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, maxWidth: 800, margin: "0 auto 80px" }}>
          {features.slice(3).map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} style={{ padding: "24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
                <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={18} color="white" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: "center", padding: "60px", background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 12 }}>Ready to close more deals?</h2>
          <p style={{ fontSize: "15px", color: "#94A3B8", marginBottom: 28 }}>Join 500+ sales teams using DealRoom to hit quota faster.</p>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 32px", background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 10, fontSize: "15px", fontWeight: 700, color: "white", textDecoration: "none" }}>
            View Demo <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: "13px" }}>
        2026 DealRoom. Built with Next.js 15 and Claude AI.
      </div>
    </div>
  )
}
