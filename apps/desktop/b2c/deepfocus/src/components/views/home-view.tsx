import { useAppStore } from '@/stores/app-store';
import { cn, formatMinutes, getScoreColor, getGreeting, formatTime } from '@/lib/utils';
import { getDayStats, getWeekStats, getSessions, getStreak } from '@/lib/storage';
import { Play, Flame, Clock, Shield, Target, Zap, Coffee } from 'lucide-react';
import { useMemo, useEffect } from 'react';

export function HomeView() {
  const { setView, streak, setSessionStatus, setCurrentTask, setStreak } = useAppStore();

  // Compute real data
  const todayStats = useMemo(() => getDayStats(), []);
  const weeklyChart = useMemo(() => getWeekStats(), []);
  const recentSessions = useMemo(() => getSessions().slice(0, 3), []);
  const maxMinutes = Math.max(...weeklyChart.map((d) => d.minutes), 1);

  // Sync streak from storage
  useEffect(() => {
    setStreak(getStreak());
  }, [setStreak]);

  function startQuickSession() {
    setCurrentTask('Quick focus session');
    setSessionStatus('focus');
    useAppStore.getState().setSessionStartedAt(new Date().toISOString());
    setView('session');
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      {/* Welcome Row */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="focus-heading text-2xl text-text-primary">{getGreeting()}</h1>
          <p className="mt-1 text-sm text-text-secondary">Ready for a deep work session?</p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-muted px-3 py-1.5">
              <Flame className="h-4 w-4 text-amber-DEFAULT animate-flame" />
              <span className="text-sm font-semibold text-amber-DEFAULT">{streak}</span>
              <span className="text-xs text-amber-DEFAULT/70">day streak</span>
            </div>
          )}
          <button onClick={startQuickSession} className="inline-flex items-center gap-2 rounded-lg bg-amber-DEFAULT px-5 py-2.5 text-sm font-semibold text-bg-root hover:bg-amber-light">
            <Play className="h-4 w-4" /> Start Session
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Focus Time', value: formatMinutes(todayStats.total_focus_minutes), icon: Clock, color: 'text-primary-light' },
          { label: 'Sessions', value: todayStats.sessions_completed.toString(), icon: Target, color: 'text-sage-DEFAULT' },
          { label: 'Focus Score', value: todayStats.focus_score > 0 ? todayStats.focus_score.toString() : '—', icon: Zap, color: todayStats.focus_score > 0 ? getScoreColor(todayStats.focus_score) : 'text-text-tertiary' },
          { label: 'Blocked', value: todayStats.distractions_blocked.toString(), icon: Shield, color: 'text-amber-DEFAULT' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border-default bg-bg-surface p-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-text-tertiary">{stat.label}</span>
            </div>
            <div className={cn('score-value mt-2 text-2xl font-semibold', stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Weekly Chart */}
        <div className="col-span-2 rounded-lg border border-border-default bg-bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="focus-heading text-sm text-text-primary">This Week</h3>
            <button onClick={() => setView('analytics')} className="text-[10px] text-primary-light hover:underline">Details</button>
          </div>
          <div className="flex items-end gap-3 h-32">
            {weeklyChart.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <div
                    className={cn('w-full rounded-t', d.minutes > 0 ? 'bg-primary-DEFAULT' : 'bg-bg-surface-raised')}
                    style={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-tertiary">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="rounded-lg border border-border-default bg-bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="focus-heading text-sm text-text-primary">Recent</h3>
            <button onClick={() => setView('history')} className="text-[10px] text-primary-light hover:underline">View all</button>
          </div>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((s) => (
                <div key={s.id} className="rounded-md bg-bg-surface-raised p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-primary truncate max-w-32">{s.task}</span>
                    <span className={cn('score-value text-xs font-semibold', getScoreColor(s.focus_score))}>{s.focus_score}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-text-tertiary">
                    <span className="rounded bg-primary-muted px-1.5 py-0.5 text-primary-light">{s.category}</span>
                    <span>{formatMinutes(s.actual_minutes)}</span>
                    <span>{formatTime(s.started_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-text-tertiary">No sessions yet. Start one!</p>
            </div>
          )}
          <div className="mt-4 rounded-md border border-border-subtle bg-bg-surface-raised p-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-DEFAULT" />
              <div>
                <div className="text-xs font-medium text-text-primary">
                  {todayStats.total_focus_minutes > 0 ? 'Great work today!' : 'Ready to focus?'}
                </div>
                <div className="text-[10px] text-text-tertiary">
                  {todayStats.total_focus_minutes > 0
                    ? `You've focused for ${formatMinutes(todayStats.total_focus_minutes)} today`
                    : 'Start a session to begin tracking your progress'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
