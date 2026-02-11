import { cn, formatMinutes, getScoreColor, formatRelativeDate, formatTime } from '@/lib/utils';
import { getSessions } from '@/lib/storage';
import { Search, Clock, Target, Filter, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

export function HistoryView() {
  const [search, setSearch] = useState('');

  const allSessions = useMemo(() => getSessions(), []);

  const filtered = allSessions.filter((s) =>
    s.task.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()),
  );

  // Group sessions by relative date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    const key = formatRelativeDate(s.started_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="focus-heading text-lg text-text-primary">Focus History</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{allSessions.length} sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="h-9 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-amber-DEFAULT focus:outline-none"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <Clock className="mx-auto h-10 w-10 text-text-tertiary opacity-50" />
            <p className="mt-3 text-sm text-text-tertiary">
              {allSessions.length === 0 ? 'No sessions yet. Complete a focus session to see your history.' : 'No matching sessions found.'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateSessions]) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-xs font-medium text-text-tertiary">{date}</span>
              </div>
              <div className="space-y-2">
                {dateSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface px-5 py-4">
                    <div className="flex items-center gap-4">
                      {s.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-sage-DEFAULT" />
                      ) : (
                        <XCircle className="h-5 w-5 text-text-tertiary" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-text-primary">{s.task}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-tertiary">
                          <span className="rounded bg-primary-muted px-1.5 py-0.5 text-primary-light">{s.category}</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{formatMinutes(s.actual_minutes)}</span>
                          <span className="flex items-center gap-0.5"><Target className="h-3 w-3" />{s.distractions_blocked} blocked</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={cn('score-value text-sm font-semibold', getScoreColor(s.focus_score))}>{s.focus_score}</div>
                        <div className="text-[10px] text-text-tertiary">score</div>
                      </div>
                      <span className="text-xs text-text-tertiary">{formatTime(s.started_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
