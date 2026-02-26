"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Kanban, Briefcase, Mail, TrendingUp, GraduationCap, Settings, Zap, ChevronRight, Target } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/deals", icon: Kanban },
  { label: "Deals", href: "/deals", icon: Briefcase },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Forecast", href: "/forecast", icon: TrendingUp },
  { label: "Coaching", href: "/coaching", icon: GraduationCap },
]

const QUOTA = 2400000
const CURRENT = 1680000
const QUOTA_PCT = Math.round((CURRENT / QUOTA) * 100)

function QuotaGauge() {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const filledLength = (QUOTA_PCT / 100) * circumference
  const gapLength = circumference - filledLength
  const gaugeColor = QUOTA_PCT >= 70 ? "#2563EB" : "#D97706"

  return (
    <div style={{ margin: "8px 16px 0", padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={64} height={64} viewBox="0 0 64 64">
            <circle cx={32} cy={32} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
            <circle cx={32} cy={32} r={radius} fill="none" stroke={gaugeColor} strokeWidth={5}
              strokeDasharray={`${filledLength} ${gapLength}`}
              strokeLinecap="round" transform="rotate(-90 32 32)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: "#FFFFFF" }}>
              {QUOTA_PCT}%
            </span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <Target size={11} color="#94A3B8" />
            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, color: "#94A3B8" }}>Quota</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: "#FFFFFF" }}>$1.68M</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#64748B", marginTop: 1 }}>/ $2.4M</div>
          <div style={{ marginTop: 6, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${QUOTA_PCT}%`, background: gaugeColor, borderRadius: 9999 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{ width: "var(--sidebar-width)", minHeight: "100vh", background: "var(--bg-sidebar)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>DealRoom</span>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>AI-Powered CRM</div>
          </div>
        </div>
      </div>

      <QuotaGauge />

      <nav style={{ padding: "12px 8px", flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", padding: "8px 12px 4px" }}>Workspace</div>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link key={label + href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, marginBottom: 2, textDecoration: "none", background: isActive ? "rgba(37,99,235,0.2)" : "transparent", border: isActive ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent" }}>
              <Icon size={16} color={isActive ? "#60A5FA" : "#64748B"} strokeWidth={isActive ? 2 : 1.75} />
              <span style={{ fontSize: "13.5px", fontWeight: isActive ? 600 : 400, color: isActive ? "#FFFFFF" : "#94A3B8", flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={12} color="#60A5FA" strokeWidth={2.5} />}
            </Link>
          )
        })}
        <div style={{ fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", padding: "12px 12px 4px" }}>Account</div>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, textDecoration: "none", border: "1px solid transparent" }}>
          <Settings size={16} color="#64748B" strokeWidth={1.75} />
          <span style={{ fontSize: "13.5px", color: "#94A3B8" }}>Settings</span>
        </Link>
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>AJ</div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0" }}>Alex Johnson</div>
          <div style={{ fontSize: "10px", color: "#475569" }}>Account Executive</div>
        </div>
      </div>
    </aside>
  )
}
