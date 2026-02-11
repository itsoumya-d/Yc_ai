import type { FocusSession, DayStats } from '@/types/database';

const SESSIONS_KEY = 'deepfocus_sessions';
const SETTINGS_KEY = 'deepfocus_settings';

export interface AppSettings {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  blockingMode: 'strict' | 'moderate' | 'light';
  theme: 'dark' | 'light' | 'system';
  notifications: {
    sessionEnd: boolean;
    breakReminder: boolean;
    dailySummary: boolean;
    streakAlert: boolean;
  };
}

const defaultSettings: AppSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 20,
  sessionsBeforeLongBreak: 4,
  blockingMode: 'moderate',
  theme: 'dark',
  notifications: {
    sessionEnd: true,
    breakReminder: true,
    dailySummary: true,
    streakAlert: false,
  },
};

// ─── Session CRUD ───────────────────────────────────────────

export function getSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as FocusSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: FocusSession): void {
  const sessions = getSessions();
  sessions.unshift(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function generateSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Day Stats ──────────────────────────────────────────────

function isSameDay(dateStr: string, target: Date): boolean {
  const d = new Date(dateStr);
  return d.getFullYear() === target.getFullYear()
    && d.getMonth() === target.getMonth()
    && d.getDate() === target.getDate();
}

export function getDayStats(date: Date = new Date()): DayStats {
  const sessions = getSessions().filter((s) => isSameDay(s.started_at, date));
  const completed = sessions.filter((s) => s.completed);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.actual_minutes, 0);
  const totalBlocked = sessions.reduce((sum, s) => sum + s.distractions_blocked, 0);
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + s.focus_score, 0) / completed.length)
    : 0;

  return {
    date: date.toISOString().split('T')[0]!,
    total_focus_minutes: totalMinutes,
    sessions_completed: completed.length,
    focus_score: avgScore,
    distractions_blocked: totalBlocked,
  };
}

// ─── Week Stats ─────────────────────────────────────────────

export function getWeekStats(): Array<{ day: string; minutes: number }> {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Start from Monday (or from the most recent Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const result: Array<{ day: string; minutes: number }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const stats = getDayStats(d);
    result.push({ day: dayNames[d.getDay()]!, minutes: stats.total_focus_minutes });
  }
  return result;
}

// ─── Streak ─────────────────────────────────────────────────

export function getStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  // Collect unique days with completed sessions
  const daysWithSessions = new Set<string>();
  for (const s of sessions) {
    if (s.completed) {
      const d = new Date(s.started_at);
      daysWithSessions.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check today first
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  if (daysWithSessions.has(todayKey)) {
    streak = 1;
  } else {
    // If no session today, start checking from yesterday
    // Streak can still count if there's a session yesterday
  }

  // Count consecutive days backwards
  const checkFrom = new Date(today);
  if (streak === 0) {
    checkFrom.setDate(checkFrom.getDate() - 1);
    const key = `${checkFrom.getFullYear()}-${checkFrom.getMonth()}-${checkFrom.getDate()}`;
    if (!daysWithSessions.has(key)) return 0;
    streak = 1;
  }

  // Continue backwards from the day before
  for (let i = 1; i < 365; i++) {
    const d = new Date(streak === 1 && !daysWithSessions.has(todayKey) ? checkFrom : today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (daysWithSessions.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Period Filtering ───────────────────────────────────────

export function getSessionsByPeriod(period: 'Daily' | 'Weekly' | 'Monthly'): FocusSession[] {
  const sessions = getSessions();
  const now = new Date();

  return sessions.filter((s) => {
    const d = new Date(s.started_at);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (period) {
      case 'Daily': return diffDays < 1;
      case 'Weekly': return diffDays < 7;
      case 'Monthly': return diffDays < 30;
    }
  });
}

// ─── Category Breakdown ─────────────────────────────────────

export function getCategoryBreakdown(sessions: FocusSession[]): Array<{ name: string; minutes: number; percent: number }> {
  const byCategory: Record<string, number> = {};
  for (const s of sessions) {
    const cat = s.category || 'General';
    byCategory[cat] = (byCategory[cat] ?? 0) + s.actual_minutes;
  }

  const total = Object.values(byCategory).reduce((sum, m) => sum + m, 0);
  if (total === 0) return [];

  return Object.entries(byCategory)
    .map(([name, minutes]) => ({
      name,
      minutes,
      percent: Math.round((minutes / total) * 100),
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

// ─── Heatmap ────────────────────────────────────────────────

export function getHeatmapData(): number[][] {
  const sessions = getSessions();
  // 7 days x 12 hours (6am-5pm)
  const grid: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => 0));

  for (const s of sessions) {
    const d = new Date(s.started_at);
    const dayIndex = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
    const hour = d.getHours();
    if (hour >= 6 && hour <= 17) {
      const hourIndex = hour - 6;
      grid[dayIndex]![hourIndex]! += 1;
    }
  }

  // Normalize to 0-4 range
  const maxVal = Math.max(...grid.flat(), 1);
  return grid.map((row) => row.map((val) => Math.min(Math.round((val / maxVal) * 4), 4)));
}

// ─── Focus Score ────────────────────────────────────────────

export function calculateFocusScore(elapsedSeconds: number, plannedMinutes: number): number {
  const plannedSeconds = plannedMinutes * 60;
  if (plannedSeconds === 0) return 0;
  const ratio = elapsedSeconds / plannedSeconds;
  return Math.min(Math.round(ratio * 100), 100);
}

// ─── Settings ───────────────────────────────────────────────

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}
