"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Plus, Trophy, Clock, TrendingUp } from "lucide-react"

type Stage = "Prospect" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost"

interface Deal {
  id: string
  company: string
  contact: string
  value: number
  daysInStage: number
  health: number
  sentiment: "positive" | "neutral" | "negative"
  stage: Stage
  avatar: string
}

const STAGE_CONFIG: Record<Stage, { color: string; bg: string; border: string }> = {
  Prospect: { color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" },
  Qualified: { color: "#2563EB", bg: "#DBEAFE", border: "#93C5FD" },
  Proposal: { color: "#7C3AED", bg: "#EDE9FE", border: "#C4B5FD" },
  Negotiation: { color: "#D97706", bg: "#FEF3C7", border: "#FCD34D" },
  "Closed Won": { color: "#16a34a", bg: "#DCFCE7", border: "#86EFAC" },
  "Closed Lost": { color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" },
}

const INITIAL_DEALS: Deal[] = [
  { id: "1", company: "Apex Systems", contact: "Linda Park", value: 148000, daysInStage: 14, health: 43, sentiment: "negative", stage: "Proposal", avatar: "AP" },
  { id: "2", company: "CloudBase Inc", contact: "Tom Williams", value: 76000, daysInStage: 3, health: 88, sentiment: "positive", stage: "Prospect", avatar: "CB" },
  { id: "3", company: "DataSync Pro", contact: "Emily Chen", value: 52000, daysInStage: 7, health: 72, sentiment: "neutral", stage: "Prospect", avatar: "DS" },
  { id: "4", company: "Meridian Corp", contact: "Sarah Chen", value: 290000, daysInStage: 8, health: 62, sentiment: "neutral", stage: "Negotiation", avatar: "MC" },
  { id: "5", company: "TerraScale AI", contact: "Michael Torres", value: 215000, daysInStage: 5, health: 81, sentiment: "positive", stage: "Proposal", avatar: "TS" },
  { id: "6", company: "Orion Analytics", contact: "James Park", value: 87500, daysInStage: 11, health: 77, sentiment: "positive", stage: "Qualified", avatar: "OA" },
  { id: "7", company: "FusionTech", contact: "Rachel Kim", value: 124000, daysInStage: 2, health: 91, sentiment: "positive", stage: "Qualified", avatar: "FT" },
  { id: "8", company: "NexGen Systems", contact: "David Lee", value: 165000, daysInStage: 19, health: 35, sentiment: "negative", stage: "Negotiation", avatar: "NG" },
  { id: "9", company: "VertexAI Corp", contact: "Amy Johnson", value: 98000, daysInStage: 4, health: 85, sentiment: "positive", stage: "Closed Won", avatar: "VA" },
  { id: "10", company: "CipherNet", contact: "Mark Davis", value: 43000, daysInStage: 6, health: 55, sentiment: "neutral", stage: "Qualified", avatar: "CN" },
]

function fmt(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K"
  return "$" + n
}

function HealthDot({ score }: { score: number }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#D97706" : "#DC2626"
  const bg = score >= 75 ? "#DCFCE7" : score >= 50 ? "#FEF3C7" : "#FEE2E2"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 9999, background: bg, fontSize: "10px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
      {score}
    </span>
  )
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const config = {
    positive: { bg: "#DCFCE7", color: "#16a34a", label: "+" },
    neutral: { bg: "#F3F4F6", color: "#6B7280", label: "~" },
    negative: { bg: "#FEE2E2", color: "#DC2626", label: "-" },
  }
  const c = config[sentiment]
  return <span style={{ display: "inline-flex", padding: "1px 6px", borderRadius: 9999, background: c.bg, color: c.color, fontSize: "11px", fontWeight: 700 }}>{c.label}</span>
}

function DealCard({ deal, onDragStart }: { deal: Deal; onDragStart: (e: React.DragEvent, deal: Deal) => void }) {
  const [celebrating, setCelebrating] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className={celebrating ? "celebrate-won" : ""}
      style={{
        background: "white",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "grab",
        transition: "box-shadow 0.15s",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "white", flexShrink: 0 }}>
            {deal.avatar}
          </div>
          <div>
            <Link href={"/deals/" + deal.id} style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none", display: "block", lineHeight: 1.2 }}>
              {deal.company}
            </Link>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{deal.contact}</div>
          </div>
        </div>
        <SentimentBadge sentiment={deal.sentiment} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{fmt(deal.value)}</span>
        <HealthDot score={deal.health} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
        <Clock size={10} color="var(--text-muted)" />
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{deal.daysInStage}d in stage</span>
      </div>
    </div>
  )
}

function Column({ stage, deals, onDragOver, onDrop, onDragStart }: {
  stage: Stage
  deals: Deal[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, stage: Stage) => void
  onDragStart: (e: React.DragEvent, deal: Deal) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const cfg = STAGE_CONFIG[stage]
  const totalValue = deals.reduce((a, d) => a + d.value, 0)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(e) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { setIsOver(false); onDrop(e, stage) }}
      style={{
        flex: 1,
        minWidth: 220,
        background: isOver ? "#F0F9FF" : "#F8FAFC",
        border: isOver ? "2px dashed #2563EB" : "2px dashed transparent",
        borderRadius: 12,
        padding: 12,
        transition: "all 0.15s",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{stage}</span>
          </div>
          <span style={{ fontSize: "11px", background: cfg.bg, color: cfg.color, padding: "1px 7px", borderRadius: 9999, fontWeight: 600 }}>
            {deals.length}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {fmt(totalValue)}
        </div>
      </div>
      <div>
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onDragStart={onDragStart} />
        ))}
        {deals.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Drop deals here
          </div>
        )}
      </div>
    </div>
  )
}

const VISIBLE_STAGES: Stage[] = ["Prospect", "Qualified", "Proposal", "Negotiation", "Closed Won"]

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [showLost, setShowLost] = useState(false)
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const dragDealRef = useRef<Deal | null>(null)

  const stages = showLost ? [...VISIBLE_STAGES, "Closed Lost" as Stage] : VISIBLE_STAGES

  function handleDragStart(e: React.DragEvent, deal: Deal) {
    dragDealRef.current = deal
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDrop(e: React.DragEvent, targetStage: Stage) {
    e.preventDefault()
    const deal = dragDealRef.current
    if (!deal || deal.stage === targetStage) return

    if (targetStage === "Closed Won") {
      setCelebrating(deal.id)
      setTimeout(() => setCelebrating(null), 3000)
    }

    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: targetStage, daysInStage: 0 } : d))
    dragDealRef.current = null
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  const totalPipelineValue = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).reduce((a, d) => a + d.value, 0)
  const wonValue = deals.filter(d => d.stage === "Closed Won").reduce((a, d) => a + d.value, 0)

  return (
    <div style={{ padding: "28px 32px" }}>
      {celebrating && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 999 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: Math.random() * 100 + "%",
              top: "-10px",
              background: ["#2563EB", "#7C3AED", "#16a34a", "#F59E0B", "#EC4899"][i % 5],
              animationDelay: Math.random() * 0.5 + "s",
              animationDuration: (0.6 + Math.random() * 0.4) + "s",
            }} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Pipeline Board</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 2 }}>Drag cards to update deal stages</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(totalPipelineValue)}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>active pipeline</div>
            </div>
            <div style={{ width: 1, height: 36, background: "var(--border-default)" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 600, color: "#16a34a" }}>{fmt(wonValue)}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>closed won</div>
            </div>
          </div>
          <button
            onClick={() => setShowLost(!showLost)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: showLost ? "#FEE2E2" : "white", color: showLost ? "#DC2626" : "var(--text-secondary)", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
          >
            {showLost ? "Hide Lost" : "Show Lost"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#2563EB", color: "white", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> New Deal
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, minHeight: "calc(100vh - 200px)" }}>
        {stages.map(stage => (
          <Column
            key={stage}
            stage={stage}
            deals={deals.filter(d => d.stage === stage)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
