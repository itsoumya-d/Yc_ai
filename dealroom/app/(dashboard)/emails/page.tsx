"use client"

import { useState } from "react"
import { Mail, Reply, Zap, ChevronRight } from "lucide-react"

interface Email {
  id: string
  from: string
  company: string
  subject: string
  preview: string
  body: string
  time: string
  sentiment: "positive" | "neutral" | "negative"
  aiActions: string[]
}

const emails: Email[] = [
  {
    id: "1",
    from: "Sarah Chen",
    company: "Meridian Corp",
    subject: "Re: DealRoom Proposal - Pricing Questions",
    preview: "Thanks for the revised proposal. We have a few questions about the enterprise tier pricing...",
    body: "Hi Alex,\n\nThank you for the revised proposal. We have reviewed the updated pricing structure and have a few questions.\n\nFirst, can you clarify what is included in the \"Enterprise Support\" package? Our CTO specifically wants to know about SLA guarantees and dedicated account management.\n\nSecond, we would like to explore the multi-year discount options. Our CFO asked about a 3-year commitment structure.\n\nWe are targeting a Q1 close, so your timely response is appreciated.\n\nBest,\nSarah Chen\nVP of Operations, Meridian Corp",
    time: "2 hours ago",
    sentiment: "positive",
    aiActions: ["Follow up on enterprise support SLA details", "Prepare 3-year pricing comparison", "Loop in solutions engineer for technical questions"],
  },
  {
    id: "2",
    from: "James Park",
    company: "Orion Analytics",
    subject: "Exploring alternatives - need to discuss",
    preview: "We have been evaluating several vendors and wanted to get your thoughts on how DealRoom compares to...",
    body: "Hi Alex,\n\nWe have been evaluating several CRM vendors including Salesforce, HubSpot, and DealRoom. Our team was impressed with the AI features during the demo last week.\n\nHowever, our board has asked us to do a more formal comparison. Could you help us with a competitive analysis or an ROI calculator we could present internally?\n\nBest regards,\nJames Park\nCTO, Orion Analytics",
    time: "5 hours ago",
    sentiment: "neutral",
    aiActions: ["Send competitive comparison document", "Schedule technical deep-dive call", "Share customer case studies from similar companies"],
  },
  {
    id: "3",
    from: "Linda Park",
    company: "Apex Systems",
    subject: "Project timeline concerns",
    preview: "I wanted to be upfront - we have budget freeze concerns that may impact our timeline...",
    body: "Hi Alex,\n\nI wanted to be transparent with you. Our leadership has raised concerns about a potential budget freeze in Q2, which could push any major software purchases to H2.\n\nI am still personally an advocate for DealRoom, but I am facing some internal headwinds. Is there any flexibility on payment terms or a pilot program we could start with to demonstrate value before the full commitment?\n\nApologies for the uncertainty.\n\nBest,\nLinda Park\nDirector of Sales Operations, Apex Systems",
    time: "Yesterday",
    sentiment: "negative",
    aiActions: ["Propose pilot program or phased implementation", "Offer flexible payment terms (quarterly vs annual)", "Escalate to executive sponsor before deal goes cold"],
  },
  {
    id: "4",
    from: "Michael Torres",
    company: "TerraScale AI",
    subject: "Ready to move forward!",
    preview: "Great news - the team loved the demo and we are ready to discuss contract terms...",
    body: "Alex!\n\nGreat news - after the demo on Monday, our whole team is aligned and excited to move forward with DealRoom.\n\nWe are ready to discuss contract terms. Can we schedule a call this week to go over the MSA and data processing agreement? Our legal team is also ready to review.\n\nThis is very exciting!\n\nMichael Torres\nCEO, TerraScale AI",
    time: "2 days ago",
    sentiment: "positive",
    aiActions: ["Send MSA and DPA for legal review", "Schedule contract review call this week", "Loop in legal team and CS for onboarding prep"],
  },
]

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const config = {
    positive: { bg: "#DCFCE7", color: "#16a34a", label: "Positive" },
    neutral: { bg: "#F3F4F6", color: "#6B7280", label: "Neutral" },
    negative: { bg: "#FEE2E2", color: "#DC2626", label: "Negative" },
  }
  const c = config[sentiment]
  return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, background: c.bg, color: c.color, fontSize: "10px", fontWeight: 600 }}>{c.label}</span>
}

export default function EmailsPage() {
  const [selected, setSelected] = useState<Email>(emails[0])
  const [replyText, setReplyText] = useState("")
  const [aiDraft, setAiDraft] = useState(false)

  function handleAiDraft() {
    setReplyText("Hi " + selected.from.split(" ")[0] + ",\n\nThank you for reaching out. I have reviewed your message carefully and wanted to respond promptly.\n\n[AI will generate personalized response based on deal context and email sentiment...]\n\nBest regards,\nAlex Johnson\nAccount Executive, DealRoom")
    setAiDraft(true)
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 0px)", background: "var(--bg-page)" }}>
      <div style={{ width: 340, borderRight: "1px solid var(--border-subtle)", background: "white", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Inbox</h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>4 deal-related emails</div>
        </div>
        {emails.map(email => (
          <div
            key={email.id}
            onClick={() => setSelected(email)}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              cursor: "pointer",
              background: selected.id === email.id ? "#EFF6FF" : "white",
              borderLeft: selected.id === email.id ? "3px solid #2563EB" : "3px solid transparent",
              transition: "background 0.1s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{email.from}</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: 8 }}>{email.time}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: 500, marginBottom: 2 }}>{email.company}</div>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.subject}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{email.preview}</div>
              <SentimentBadge sentiment={email.sentiment} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "24px 28px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{selected.subject}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>From {selected.from}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selected.company}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selected.time}</span>
              </div>
            </div>
            <SentimentBadge sentiment={selected.sentiment} />
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {selected.body}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #EDE9FE, #DBEAFE)", border: "1px solid #C4B5FD", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Zap size={14} color="#7C3AED" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>AI Extracted Actions</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selected.aiActions.map((action, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ChevronRight size={10} color="white" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: "12px", color: "#4C1D95", fontWeight: 500 }}>{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Reply size={14} color="var(--text-secondary)" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Reply</span>
              </div>
              <button
                onClick={handleAiDraft}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, background: "linear-gradient(135deg, #7C3AED, #2563EB)", color: "white", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                <Zap size={12} /> AI Draft
              </button>
            </div>
            {aiDraft && (
              <div style={{ fontSize: "11px", color: "#7C3AED", fontWeight: 500, marginBottom: 6 }}>AI-generated draft — review before sending</div>
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              style={{ width: "100%", minHeight: 120, border: "1px solid var(--border-default)", borderRadius: 8, padding: "10px 12px", fontSize: "13px", color: "var(--text-primary)", resize: "vertical", outline: "none", fontFamily: "var(--font-sans)" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button style={{ padding: "8px 20px", borderRadius: 8, background: "#2563EB", color: "white", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
