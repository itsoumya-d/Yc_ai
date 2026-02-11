import { useAppStore } from '@/stores/app-store';
import { cn, formatTimer } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { saveSession, generateSessionId, calculateFocusScore, getStreak } from '@/lib/storage';
import { Play, Pause, Square, SkipForward, Shield, Volume2, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
import { useState } from 'react';

const categories = ['General', 'Coding', 'Writing', 'Design', 'Research', 'Admin', 'Learning'];

export function SessionView() {
  const {
    sessionStatus, setSessionStatus,
    focusMinutes, elapsed, blockingMode,
    isBreak, setIsBreak, setElapsed,
    setSessionStartedAt, currentTask, setCurrentTask,
    currentCategory, setCurrentCategory,
    sessionsCompleted, setSessionsCompleted,
    sessionsBeforeLongBreak,
    setStreak,
  } = useAppStore();

  const { remaining, progress, totalSeconds } = useTimer();
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('General');

  const circumference = 2 * Math.PI * 120;
  const strokeOffset = circumference - (progress / 100) * circumference;

  const isActive = sessionStatus === 'focus' || sessionStatus === 'paused' || sessionStatus === 'break';

  function handleStart() {
    setCurrentTask(task || 'Focus session');
    setCurrentCategory(category);
    setElapsed(0);
    setIsBreak(false);
    setSessionStartedAt(new Date().toISOString());
    setSessionStatus('focus');
  }

  function handlePause() {
    if (sessionStatus === 'paused') {
      setSessionStatus(isBreak ? 'break' : 'focus');
    } else {
      setSessionStatus('paused');
    }
  }

  function handleStop() {
    // Save partial session if we were focusing
    if (!isBreak && elapsed > 30) {
      const session = {
        id: generateSessionId(),
        task: currentTask || 'Focus session',
        category: currentCategory || 'General',
        planned_minutes: focusMinutes,
        actual_minutes: Math.round(elapsed / 60),
        focus_score: calculateFocusScore(elapsed, focusMinutes),
        distractions_blocked: 0,
        completed: false,
        started_at: useAppStore.getState().sessionStartedAt ?? new Date().toISOString(),
        ended_at: new Date().toISOString(),
      };
      saveSession(session);
      setStreak(getStreak());
    }

    setElapsed(0);
    setIsBreak(false);
    setSessionStartedAt(null);
    setSessionStatus('idle');
  }

  function handleSkip() {
    if (isBreak) {
      // Skip break -> go back to idle
      setElapsed(0);
      setIsBreak(false);
      setSessionStartedAt(null);
      setSessionStatus('idle');
    } else {
      // Skip remaining focus -> complete session and go to break
      const session = {
        id: generateSessionId(),
        task: currentTask || 'Focus session',
        category: currentCategory || 'General',
        planned_minutes: focusMinutes,
        actual_minutes: Math.round(elapsed / 60),
        focus_score: calculateFocusScore(elapsed, focusMinutes),
        distractions_blocked: 0,
        completed: elapsed >= focusMinutes * 60 * 0.5,
        started_at: useAppStore.getState().sessionStartedAt ?? new Date().toISOString(),
        ended_at: new Date().toISOString(),
      };
      saveSession(session);

      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      setStreak(getStreak());
      setElapsed(0);
      setIsBreak(true);
      setSessionStartedAt(new Date().toISOString());
      setSessionStatus('break');
    }
  }

  const ringColor = isBreak
    ? 'var(--color-amber-DEFAULT)'
    : sessionStatus === 'paused'
      ? 'var(--color-text-tertiary)'
      : 'var(--color-sage-DEFAULT)';

  const statusLabel = isBreak
    ? 'Break'
    : sessionStatus === 'paused'
      ? 'Paused'
      : 'Focusing';

  const statusColor = isBreak
    ? 'text-amber-DEFAULT'
    : sessionStatus === 'paused'
      ? 'text-amber-DEFAULT'
      : 'text-sage-DEFAULT';

  return (
    <div className="flex h-full">
      {/* Main Timer Area */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {!isActive && sessionStatus === 'idle' && (
          <div className="mb-8 w-80">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What will you focus on?"
              className="h-11 w-full rounded-lg border border-border-default bg-bg-surface px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-amber-DEFAULT focus:outline-none"
            />
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                    category === c ? 'bg-primary-muted text-primary-light' : 'text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              {[15, 25, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => useAppStore.getState().setFocusMinutes(m)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    focusMinutes === m ? 'bg-amber-muted text-amber-DEFAULT' : 'text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer Ring */}
        <div className={cn('relative flex h-64 w-64 items-center justify-center', isActive && 'animate-session-glow rounded-full')}>
          <svg className="absolute -rotate-90" width="260" height="260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="var(--color-bg-surface-raised)" strokeWidth="4" />
            {isActive && (
              <circle
                cx="130" cy="130" r="120"
                fill="none"
                stroke={ringColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000"
              />
            )}
          </svg>
          <div className="flex flex-col items-center">
            <span className={cn('timer-display text-5xl', isActive ? 'text-text-primary' : 'text-text-secondary')}>
              {isActive ? formatTimer(remaining) : formatTimer(totalSeconds)}
            </span>
            {isActive && (
              <span className={cn('mt-1 text-xs font-medium', statusColor)}>
                {statusLabel}
              </span>
            )}
            {isActive && !isBreak && currentTask && (
              <span className="mt-2 text-[10px] text-text-tertiary max-w-48 truncate">{currentTask}</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-4">
          {!isActive ? (
            <button onClick={handleStart} className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-DEFAULT text-bg-root hover:bg-amber-light">
              <Play className="h-6 w-6 ml-0.5" />
            </button>
          ) : (
            <>
              <button onClick={handlePause} className="flex h-12 w-12 items-center justify-center rounded-full border border-border-default text-text-secondary hover:text-text-primary">
                {sessionStatus === 'paused' ? <Play className="h-5 w-5 ml-0.5" /> : <Pause className="h-5 w-5" />}
              </button>
              <button onClick={handleStop} className="flex h-12 w-12 items-center justify-center rounded-full border border-error/30 text-error hover:bg-error/10">
                <Square className="h-5 w-5" />
              </button>
              <button onClick={handleSkip} className="flex h-12 w-12 items-center justify-center rounded-full border border-border-default text-text-secondary hover:text-text-primary">
                <SkipForward className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      {isActive && (
        <div className="w-72 border-l border-border-default bg-bg-surface p-5 space-y-6">
          {/* Break Info */}
          {isBreak && (
            <div className="rounded-lg border border-amber-DEFAULT/30 bg-amber-muted p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coffee className="h-3.5 w-3.5 text-amber-DEFAULT" />
                <span className="text-xs font-medium text-amber-DEFAULT">
                  {sessionsCompleted > 0 && sessionsCompleted % sessionsBeforeLongBreak === 0
                    ? 'Long Break'
                    : 'Short Break'}
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Session {sessionsCompleted} of {sessionsBeforeLongBreak} complete. Relax and recharge.
              </p>
            </div>
          )}

          {/* Blocking Status */}
          {!isBreak && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sage-DEFAULT" />
                <span className="text-xs font-medium text-text-primary">Blocking Active</span>
                <span className="ml-auto rounded bg-sage-muted px-2 py-0.5 text-[10px] font-medium capitalize text-sage-DEFAULT">{blockingMode}</span>
              </div>
              <div className="space-y-2">
                {[
                  { app: 'Social media', status: 'blocked' },
                  { app: 'Entertainment', status: 'blocked' },
                  { app: 'News sites', status: blockingMode === 'strict' ? 'blocked' : 'allowed' },
                ].map((b) => (
                  <div key={b.app} className="flex items-center justify-between rounded-md bg-bg-surface-raised p-2.5">
                    <div className="flex items-center gap-2">
                      <Shield className={cn('h-3.5 w-3.5', b.status === 'blocked' ? 'text-error' : 'text-sage-DEFAULT')} />
                      <span className="text-xs text-text-primary">{b.app}</span>
                    </div>
                    <span className={cn('text-[10px]', b.status === 'blocked' ? 'text-error' : 'text-sage-DEFAULT')}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soundscape */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary-light" />
              <span className="text-xs font-medium text-text-primary">Soundscape</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Rain', volume: 70 },
                { name: 'Thunder', volume: 30 },
                { name: 'Café hum', volume: 0 },
              ].map((l) => (
                <div key={l.name} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-text-tertiary">{l.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-bg-surface-raised">
                    <div className="h-1.5 rounded-full bg-primary-DEFAULT" style={{ width: `${l.volume}%` }} />
                  </div>
                  <span className="score-value w-8 text-right text-[10px] text-text-tertiary">{l.volume}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-lg border border-border-default bg-bg-surface-raised p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-DEFAULT" />
              <span className="text-xs font-medium text-text-primary">AI Insight</span>
            </div>
            <p className="text-[11px] text-text-tertiary">Your focus peaks between 2-4 PM. Consider extending this session by 15 minutes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
