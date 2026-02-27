'use client';
import { useAppStore } from '@/stores/app-store';
import { getMatchColor, formatDuration } from '@/lib/utils';
import { TrendingUp, Clock, DollarSign, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CareerPathsPage() {
  const { paths, activePathId, setActivePath } = useAppStore();

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Career Paths</h1>
        <p className="text-sm text-text-secondary mt-1">AI-matched careers based on your transferable skills</p>
      </div>

      <div className="space-y-4">
        {paths.map((path) => (
          <div key={path.id} className={cn('rounded-2xl border p-6 transition-all', activePathId === path.id ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/30 hover:shadow-md')}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-text-primary">{path.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${getMatchColor(path.match_score)}`}>{path.match_score}% match</span>
                  {activePathId === path.id && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">Active Path</span>}
                </div>
                <p className="text-sm text-text-secondary mb-1">{path.industry}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{path.description}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-text-tertiary" />
                <div>
                  <p className="font-semibold text-text-primary">${path.median_salary.toLocaleString()}</p>
                  <p className="text-xs text-text-tertiary">Median salary</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-semibold text-green-600">{path.growth_rate}</p>
                  <p className="text-xs text-text-tertiary">Job growth</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-text-tertiary" />
                <div>
                  <p className="font-semibold text-text-primary">{formatDuration(path.time_to_ready_weeks)}</p>
                  <p className="text-xs text-text-tertiary">Time to ready</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {path.transferable_skills.length} transferable skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {path.transferable_skills.map((s) => (
                    <span key={s} className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  {path.missing_skills.length} skills to learn
                </p>
                <div className="flex flex-wrap gap-1">
                  {path.missing_skills.map((s) => (
                    <span key={s} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              {activePathId !== path.id ? (
                <button
                  onClick={() => setActivePath(path.id)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition"
                >
                  Set as Active Path <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <CheckCircle className="h-4 w-4" /> Currently Active
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
