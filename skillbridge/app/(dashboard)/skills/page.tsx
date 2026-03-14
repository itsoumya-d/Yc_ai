"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { getSkills, addSkill, deleteSkill } from "@/lib/actions/skills";
import type { Skill, SkillLevel } from "@/types/database";

type LevelStyle = { bg: string; color: string };
const levelColors: Record<string, LevelStyle> = {
  beginner: { bg: "#fef9c3", color: "#854d0e" },
  intermediate: { bg: "#dbeafe", color: "#1d4ed8" },
  advanced: { bg: "#ccfbf1", color: "#0f766e" },
  expert: { bg: "#f3e8ff", color: "#7c3aed" },
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState<SkillLevel>("intermediate");
  const [years, setYears] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSkills().then((data) => { setSkills(data || []); setLoading(false); });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const newSkill = await addSkill(skillName, level, years);
      if (newSkill) {
        setSkills((prev) => [...prev, newSkill]);
        setSkillName(""); setLevel("intermediate"); setYears(1); setShowForm(false);
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>My Skills</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Manage your skills to get better career matches.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "var(--primary)" }}>
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Add New Skill</h2>
            <button onClick={() => setShowForm(false)} style={{ color: "var(--muted-foreground)" }}><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Skill name</label>
              <input value={skillName} onChange={(e) => setSkillName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} placeholder="e.g. Python, Project Management..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value as SkillLevel)} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Years</label>
              <input type="number" min={0} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} />
            </div>
            <div className="col-span-3 flex gap-3">
              <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--primary)" }}>
                {isPending && <Loader2 className="w-3 h-3 animate-spin" />} Add Skill
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <div>
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Resume Upload</h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Upload your resume to automatically extract skills.</p>
          </div>
        </div>
        <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: "var(--border)" }}>
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Drop your resume here</p>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>PDF or DOCX, up to 10MB</p>
          <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
            Browse files<input type="file" className="hidden" accept=".pdf,.docx" />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--primary)" }} /></div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <p className="font-medium mb-2" style={{ color: "var(--foreground)" }}>No skills added yet</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Add skills manually or upload your resume to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div>
                <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{skill.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={levelColors[skill.level]}>{skill.level}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{skill.years_experience}yr</span>
                </div>
              </div>
              <button onClick={() => handleDelete(skill.id)} className="ml-3 hover:text-red-500" style={{ color: "var(--muted-foreground)" }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
