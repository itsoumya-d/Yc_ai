import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { saveSession, generateSessionId, calculateFocusScore, getStreak } from '@/lib/storage';
import type { FocusSession } from '@/types/database';

export interface TimerState {
  remaining: number;
  progress: number;
  totalSeconds: number;
}

export function useTimer(): TimerState {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const elapsed = useAppStore((s) => s.elapsed);
  const focusMinutes = useAppStore((s) => s.focusMinutes);
  const breakMinutes = useAppStore((s) => s.breakMinutes);
  const longBreakMinutes = useAppStore((s) => s.longBreakMinutes);
  const sessionsBeforeLongBreak = useAppStore((s) => s.sessionsBeforeLongBreak);
  const isBreak = useAppStore((s) => s.isBreak);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);

  const totalSeconds = isBreak
    ? (sessionsCompleted > 0 && sessionsCompleted % sessionsBeforeLongBreak === 0
      ? longBreakMinutes
      : breakMinutes) * 60
    : focusMinutes * 60;

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only tick when actively running (focus or break, not paused or idle)
    if (sessionStatus !== 'focus' && sessionStatus !== 'break') return;

    intervalRef.current = setInterval(() => {
      const state = useAppStore.getState();
      const currentTotal = state.isBreak
        ? (state.sessionsCompleted > 0 && state.sessionsCompleted % state.sessionsBeforeLongBreak === 0
          ? state.longBreakMinutes
          : state.breakMinutes) * 60
        : state.focusMinutes * 60;

      if (state.elapsed >= currentTotal) {
        // Timer completed
        handleCompletion(state);
        return;
      }

      state.incrementElapsed();

      // Update Electron tray if available
      const newRemaining = currentTotal - state.elapsed - 1;
      const mins = Math.floor(Math.max(newRemaining, 0) / 60);
      const secs = Math.max(newRemaining, 0) % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      window.electronAPI?.updateTray?.(state.isBreak ? 'break' : 'focus', timeStr);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionStatus]);

  return { remaining, progress, totalSeconds };
}

function handleCompletion(state: ReturnType<typeof useAppStore.getState>) {
  if (state.isBreak) {
    // Break ended -> transition to focus
    state.setElapsed(0);
    state.setIsBreak(false);
    state.setSessionStatus('idle');
    state.setSessionStartedAt(null);

    // Notify
    window.electronAPI?.sendNotification?.('Break Over', 'Time to focus again!');
  } else {
    // Focus session ended -> save session + transition to break
    const session: FocusSession = {
      id: generateSessionId(),
      task: state.currentTask || 'Focus session',
      category: state.currentCategory || 'General',
      planned_minutes: state.focusMinutes,
      actual_minutes: Math.round(state.elapsed / 60),
      focus_score: calculateFocusScore(state.elapsed, state.focusMinutes),
      distractions_blocked: 0,
      completed: true,
      started_at: state.sessionStartedAt ?? new Date().toISOString(),
      ended_at: new Date().toISOString(),
    };
    saveSession(session);

    // Update session count and streak
    const newCount = state.sessionsCompleted + 1;
    state.setSessionsCompleted(newCount);
    state.setStreak(getStreak());

    // Transition to break
    state.setElapsed(0);
    state.setIsBreak(true);
    state.setSessionStartedAt(new Date().toISOString());
    state.setSessionStatus('break');

    // Notify
    const isLongBreak = newCount % state.sessionsBeforeLongBreak === 0;
    const breakLen = isLongBreak ? state.longBreakMinutes : state.breakMinutes;
    window.electronAPI?.sendNotification?.(
      'Session Complete!',
      `Great work! Take a ${breakLen} minute break.`,
    );
  }
}
