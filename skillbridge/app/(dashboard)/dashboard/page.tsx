import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, BookOpen, Target, Zap, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: careerPaths }, { data: learningPlan }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("career_paths").select("*").eq("user_id", user.id).order("match_score", { ascending: false }).limit(3),
    supabase.from("learning_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
  ]);

  const assessmentDone = profile?.assessment_status === "completed";
  const assessmentProgress = assessmentDone ? 100 : profile?.assessment_status === "in_progress" ? 50 : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          {assessmentDone ? "Here is your career transition progress." : "Complete your assessment to unlock personalized career matches."}
        </p>
      </div>

      <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#ccfbf1" }}>
              <Zap className="w-5 h-5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Skills Assessment</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {assessmentDone ? "Completed" : "Not started yet"}
              </p>
            </div>
          </div>
          {!assessmentDone && (
            <Link href="/assessment" className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 flex items-center gap-1" style={{ backgroundColor: "var(--primary)" }}>
              Start Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${assessmentProgress}%`, backgroundColor: "var(--primary)" }} />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>{assessmentProgress}% complete</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <Target className="w-4 h-4" style={{ color: "var(--primary)" }} />
              Top Career Matches
            </h2>
            <Link href="/careers" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>View all</Link>
          </div>
          {careerPaths && careerPaths.length > 0 ? (
            <div className="space-y-3">
              {careerPaths.map((career) => (
                <div key={career.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{career.title}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{career.industry}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
                    <TrendingUp className="w-3 h-3" />
                    {career.match_score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>No career matches yet. Complete your assessment first.</p>
              <Link href="/assessment" className="text-sm font-semibold hover:underline" style={{ color: "var(--primary)" }}>Take assessment</Link>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <BookOpen className="w-4 h-4" style={{ color: "var(--primary)" }} />
              Learning Progress
            </h2>
            <Link href="/learn" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>View plan</Link>
          </div>
          {learningPlan ? (
            <div>
              <p className="font-medium text-sm mb-1" style={{ color: "var(--foreground)" }}>{learningPlan.title}</p>
              <div className="h-2 rounded-full mb-2 mt-3" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-2 rounded-full" style={{ width: `${learningPlan.total_hours > 0 ? Math.round((learningPlan.completed_hours / learningPlan.total_hours) * 100) : 0}%`, backgroundColor: "var(--primary)" }} />
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {learningPlan.completed_hours} of {learningPlan.total_hours} hours completed
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>No learning plan yet. Save a career path and generate one.</p>
              <Link href="/careers" className="text-sm font-semibold hover:underline" style={{ color: "var(--primary)" }}>Explore careers</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
