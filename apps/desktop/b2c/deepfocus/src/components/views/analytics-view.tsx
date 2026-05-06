import { cn, formatMinutes, getScoreColor, getCategoryColor } from '@/lib/utils';
import { getSessionsByPeriod, getWeekStats, getCategoryBreakdown, getHeatmapData } from '@/lib/storage';
import { BarChart3, Clock, Target, Shield, Zap, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';

const periods = ['Daily', 'Weekly', 'Monthly'] as const;
const heatmapHours = ['6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p'];
const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatmapColors = ['bg-heatmap-0', 'bg-heatmap-1', 'bg-heatmap-2', 'bg-heatmap-3', 'bg-heatmap-4'];

export function AnalyticsView() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('Weekly');

  const sessions = useMemo(() => getSessionsByPeriod(period), [period]);
  const weeklyChart = useMemo(() => getWeekStats(), []);
  const categories = useMemo(() => getCategoryBreakdown(sessions), [sessions]);
  const heatmap = useMemo(() => getHeatmapData(), []);

  // Compute stats from filtered sessions
  const totalMinutes = sessions.reduce((sum, s) => sum + s.actual_minutes, 0);
  const completedSessions = sessions.filter((s) => s.completed);
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + s.focus_score, 0) / completedSessions.length)
    : 0;
  const totalBlocked = sessions.reduce((sum, s) => sum + s.distractions_blocked, 0);

  const maxMinutes = Math.max(...weeklyChart.map((d) => d.minutes), 1);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="focus-heading text-lg text-text-primary">Analytics</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Track your focus patterns and progress</p>
        </div>
        <div className="flex rounded-md border border-border-default">
          {periods.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 text-xs font-medium transition-colors', period === p ? 'bg-bg-surface-raised text-text-primary' : 'text-text-tertiary')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Focus', value: totalMinutes > 0 ? formatMinutes(totalMinutes) : '0m', icon: Clock, color: 'text-primary-light', sub: `${sessions.length} sessions` },
            { label: 'Sessions', value: completedSessions.length.toString(), icon: Target, color: 'text-sage-DEFAULT', sub: `${sessions.length - completedSessions.length} incomplete` },
            { label: 'Avg Score', value: avgScore > 0 ? avgScore.toString() : '—', icon: Zap, color: avgScore > 0 ? getScoreColor(avgScore) : 'text-text-tertiary', sub: avgScore >= 70 ? 'Good — keep going!' : avgScore > 0 ? 'Room to improve' : 'No data yet' },
            { label: 'Blocked', value: totalBlocked.toString(), icon: Shield, color: 'text-amber-DEFAULT', sub: 'distractions blocked' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border-default bg-bg-surface p-4">
              <div className="flex items-center gap-2">
                <s.icon className={cn('h-4 w-4', s.color)} />
                <span className="text-xs text-text-tertiary">{s.label}</span>
              </div>
              <div className={cn('score-value mt-2 text-2xl font-semibold', s.color)}>{s.value}</div>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-text-tertiary">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Focus Time Chart */}
          <div className="col-span-2 rounded-lg border border-border-default bg-bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary-light" />
              <h3 className="text-sm font-medium text-text-primary">Focus Time</h3>
            </div>
            {weeklyChart.some((d) => d.minutes > 0) ? (
              <div className="flex items-end gap-3 h-40">
                {weeklyChart.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="score-value text-[10px] text-text-tertiary">{d.minutes > 0 ? formatMinutes(d.minutes) : ''}</span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                      <div
                        className={cn('w-full rounded-t', d.minutes > 0 ? 'bg-primary-DEFAULT' : 'bg-bg-surface-raised')}
                        style={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary">{d.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-xs text-text-tertiary">
                Complete focus sessions to see weekly data
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-5">
            <h3 className="mb-4 text-sm font-medium text-text-primary">Categories</h3>
            {categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-primary">{c.name}</span>
                      <span className="score-value text-text-tertiary">{formatMinutes(c.minutes)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-bg-surface-raised">
                      <div className={cn('h-1.5 rounded-full', getCategoryColor(i))} style={{ width: `${c.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-xs text-text-tertiary">
                No category data yet
              </div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sage-DEFAULT" />
            <h3 className="text-sm font-medium text-text-primary">Focus Heatmap</h3>
            <span className="text-xs text-text-tertiary">Best hours for deep work</span>
          </div>
          <div className="space-y-1">
            {/* Hour labels */}
            <div className="flex items-center gap-1 pl-10">
              {heatmapHours.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-text-tertiary">{h}</div>
              ))}
            </div>
            {heatmapDays.map((day, di) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-8 text-right text-[10px] text-text-tertiary">{day}</span>
                <div className="flex flex-1 gap-1">
                  {heatmap[di]?.map((val, hi) => (
                    <div
                      key={hi}
                      className={cn('flex-1 h-5 rounded-sm', heatmapColors[val] ?? 'bg-heatmap-0')}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 text-[9px] text-text-tertiary">
            <span>Less</span>
            {heatmapColors.map((c) => (
              <div key={c} className={cn('h-3 w-3 rounded-sm', c)} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
