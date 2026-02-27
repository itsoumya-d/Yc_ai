"use client";
import { useState, useEffect, useTransition } from "react";
import { Loader2, Sparkles, Bookmark, BookmarkCheck, TrendingUp, DollarSign, Clock } from "lucide-react";
import { getCareerPaths, generateCareerPaths, toggleSaveCareer } from "@/lib/actions/careers";
import type { CareerPath } from "@/types/database";

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCareerPaths().then((data) => { setCareers(data || []); setLoading(false); });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    const newCareers = await generateCareerPaths();
    if (newCareers) setCareers(newCareers);
    setGenerating(false);
  }

  async function handleToggleSave(id: string) {
    startTransition(async () => {
      await toggleSaveCareer(id);
      setCareers((prev) => prev.map((c) => c.id === id ? { ...c, is_saved: !c.is_saved } : c));
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Career Paths</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Explore careers matched to your skills.</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating..." : "Generate Matches"}
        </button>
      </div>
      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} /></div>
      ) : careers.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>No career matches yet</h2>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>Add your skills first, then generate personalized career matches.</p>
          <button onClick={handleGenerate} disabled={generating} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "var(--primary)" }}>Generate Matches</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {careers.map((career) => (
            <div key={career.id} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{career.title}</h3>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{career.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
                    <TrendingUp className="w-3.5 h-3.5" />{career.match_score}%
                  </div>
                  <button onClick={() => handleToggleSave(career.id)} disabled={isPending} className="p-2 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    {career.is_saved ? <BookmarkCheck className="w-4 h-4" style={{ color: "var(--primary)" }} /> : <Bookmark className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />}
                  </button>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>{career.description}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--background)" }}>
                  <DollarSign className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--primary)" }} />
                  <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>${Math.round(career.median_salary / 1000)}k</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Median salary</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--background)" }}>
                  <TrendingUp className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--primary)" }} />
                  <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>+{career.growth_rate}%</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Growth rate</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "var(--background)" }}>
                  <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--primary)" }} />
                  <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{career.transition_time_months}mo</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Transition time</p>
                </div>
              </div>
              {career.skills_match.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Skills you have</p>
                  <div className="flex flex-wrap gap-1">
                    {career.skills_match.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {career.skills_gap.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Skills to develop</p>
                  <div className="flex flex-wrap gap-1">
                    {career.skills_gap.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
