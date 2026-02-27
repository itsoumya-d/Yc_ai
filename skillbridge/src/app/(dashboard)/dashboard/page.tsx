'use client';
import { useAppStore } from '@/stores/app-store';
import { formatDuration, getMatchColor } from '@/lib/utils';
import { ArrowRight, BookOpen, Map, TrendingUp, Award, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

function ProgressRing({ value }: { value: number }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <svg width={120} height={120} className="-rotate-90">
      <circle cx={60} cy={60} r={r} fill="none" stroke="#E7E5E4" strokeWidth={10} />
      <circle cx={60} cy={60} r={r} fill="none" stroke="#0D9488" strokeWidth={10}
        strokeDasharray={`${(value / 100) * c} ${c}`} strokeLinecap="round" className="transition-all duration-700" />
      <text x={60} y={64} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1C1917" className="rotate-90 origin-center">{value}%</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { user, paths, courses, achievements, overallProgress, activePathId } = useAppStore();
  const activePath = paths.find((p) => p.id === activePathId);
  const inProgressCourses = courses.filter((c) => c.status === 'in_progress');
  const earnedAchievements = achievements.filter((a) => a.earned);

  return (
    <div className="p-8 max-w-5xl space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-text-secondary mt-1">You're making great progress on your career transition</p>
        </div>
        <Link href="/paths" className="btn-primary text-sm">
          Explore Paths <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Progress + Active Path */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress Ring */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="text-sm font-medium text-text-secondary mb-4">Overall Progress</h2>
          <div className="flex justify-center mb-4">
            <ProgressRing value={overallProgress} />
          </div>
          <p className="text-sm text-text-secondary">Toward your first career transition</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-lg font-bold text-text-primary">{courses.filter((c) => c.status === 'completed').length}</p><p className="text-[10px] text-text-tertiary">Completed</p></div>
            <div><p className="text-lg font-bold text-primary">{inProgressCourses.length}</p><p className="text-[10px] text-text-tertiary">In Progress</p></div>
            <div><p className="text-lg font-bold text-text-primary">{earnedAchievements.length}</p><p className="text-[10px] text-text-tertiary">Badges</p></div>
          </div>
        </div>

        {/* Active Path */}
        {activePath && (
          <div className="lg:col-span-2 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Active Career Path</p>
                <h2 className="text-lg font-bold text-text-primary mt-1">{activePath.title}</h2>
                <p className="text-sm text-text-secondary">{activePath.industry}</p>
              </div>
              <div className={`rounded-full px-3 py-1 text-sm font-bold ${getMatchColor(activePath.match_score)}`}>
                {activePath.match_score}% match
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{activePath.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-lg font-bold text-text-primary">${(activePath.median_salary / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-text-tertiary">Median Salary</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-lg font-bold text-green-600">{activePath.growth_rate}</p>
                <p className="text-[10px] text-text-tertiary">Job Growth</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-lg font-bold text-text-primary">{formatDuration(activePath.time_to_ready_weeks)}</p>
                <p className="text-[10px] text-text-tertiary">Time to Ready</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/learning" className="btn-primary text-sm py-2 flex-1 justify-center">Continue Learning</Link>
              <Link href="/paths" className="btn-outline text-sm py-2 flex-1 justify-center">Change Path</Link>
            </div>
          </div>
        )}
      </div>

      {/* Skills to Close */}
      {activePath && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Skills Gap — {activePath.missing_skills.length} skills to close</h2>
            <Link href="/learning" className="text-sm text-primary hover:underline">Start learning →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {activePath.missing_skills.map((skill) => {
              const course = courses.find((c) => c.skill_name === skill);
              return (
                <div key={skill} className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-sm font-semibold text-text-primary">{skill}</p>
                  {course ? (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-text-tertiary mb-1">
                        <span>{course.provider}</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${course.progress}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-text-tertiary capitalize">{course.status.replace('_', ' ')}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-text-tertiary">Course recommended</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-text-primary mb-4">Your Achievements</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {achievements.map((a) => (
            <div key={a.id} className={`rounded-xl border p-3 text-center transition-all ${a.earned ? 'border-primary/30 bg-primary/5' : 'border-border bg-surface opacity-50'}`}>
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-[10px] font-semibold text-text-primary leading-tight">{a.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
