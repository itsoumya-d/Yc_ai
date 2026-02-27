"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={22} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>DealRoom</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "white", letterSpacing: "-0.02em", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#64748B" }}>Sign in to your AI-powered CRM</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={{ width: "100%", padding: "11px 12px 11px 36px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: "14px", color: "white", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: "100%", padding: "11px 12px 11px 36px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: "14px", color: "white", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", background: loading ? "#1E3A8A" : "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none", borderRadius: 9, fontSize: "15px", fontWeight: 700, color: "white", cursor: loading ? "wait" : "pointer", transition: "opacity 0.15s", marginTop: 4 }}
            >
              {loading ? "Signing in..." : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/dashboard" style={{ fontSize: "13px", color: "#60A5FA", textDecoration: "none", fontWeight: 500 }}>
              Skip login — View demo dashboard
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ fontSize: "12px", color: "#475569", textDecoration: "none" }}>Back to home</Link>
        </div>
      </div>
    </div>
  )
}
