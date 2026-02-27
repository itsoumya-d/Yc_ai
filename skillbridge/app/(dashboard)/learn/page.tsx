"use client";
import { useState, useEffect, useTransition } from "react";
import { Loader2, Sparkles, CheckCircle, Circle, ExternalLink, BookOpen } from "lucide-react";
import { getLearningPlan, generateLearningPlan, markCourseComplete } from "@/lib/actions/learning";
import type { LearningPlan, LearningCourse } from "@/types/database";

export default function LearnPage() {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getLearningPlan().then((data) => { setPlan(data || null); setLoading(false); });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    const newPlan = await generateLearningPlan();
    if (newPlan) setPlan(newPlan);
    setGenerating(false);
  }

  async function handleToggleCourse(courseId: string) {
    if (!plan) return;
    startTransition(async () => {
      await markCourseComplete(plan.id, courseId);
      setPlan((prev) => {
        if (!prev) return prev;
        const updatedCourses = prev.courses.map((c: LearningCourse) =>
          c.id === courseId ? { ...c, is_completed: !c.is_completed } : c
        );
        const completedHours = updatedCourses.filter((c: LearningCourse) => c.is_completed)
          .reduce((sum: number, c: LearningCourse) => sum + c.duration_hours, 0);
        return { ...prev, courses: updatedCourses, completed_hours: completedHours };
      });
    });
  }

  const pct = plan && plan.total_hours > 0 ? Math.round((plan.completed_hours / plan.total_hours) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Learning Plan</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Your personalized roadmap to your next career.</p>
        </div>
        {!plan && (
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate Plan"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} /></div>
      ) : !plan ? (
        <div className="text-center py-20 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>No learning plan yet</h2>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>Save a career path first, then generate your personalized learning plan.</p>
        </div>
      ) : (
        <div>
          <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="font-bold text-lg mb-1" style={{ color: "var(--foreground)" }}>{plan.title}</h2>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>{plan.completed_hours} of {plan.total_hours} hours completed</p>
            <div className="h-3 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
              <div className="h-3 rounded-full transition-all" style={{ width: pct + "%", backgroundColor: "var(--primary)" }} />
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: "var(--primary)" }}>{pct}% complete</p>
          </div>
          <div className="space-y-3">
            {plan.courses.map((course: LearningCourse) => (
              <div key={course.id} className="flex items-start gap-4 p-4 rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", opacity: course.is_completed ? 0.75 : 1 }}>
                <button onClick={() => handleToggleCourse(course.id)} disabled={isPending} className="mt-0.5 flex-shrink-0">
                  {course.is_completed
                    ? <CheckCircle className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    : <Circle className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={course.is_completed ? "font-medium text-sm line-through" : "font-medium text-sm"} style={{ color: "var(--foreground)" }}>{course.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {course.provider} - {course.duration_hours}h - {course.is_free ? "Free" : "$" + course.cost}
                      </p>
                      <span className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>{course.skill_covered}</span>
                    </div>
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1.5 rounded-lg" style={{ color: "var(--muted-foreground)" }}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
