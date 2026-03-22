'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Building2,
  Calendar,
  CheckSquare,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { CrossBoardAnalytics } from '@/lib/actions/boards';
import { StatCard } from '@/components/ui/stat-card';

const HEALTH_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

function getHealthColor(score: number) {
  if (score >= 80) return HEALTH_COLORS[0];
  if (score >= 60) return HEALTH_COLORS[1];
  if (score >= 40) return HEALTH_COLORS[2];
  if (score >= 20) return HEALTH_COLORS[3];
  return HEALTH_COLORS[4];
}

function getHealthLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs Attention';
  return 'Critical';
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function Section({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      {children}
    </motion.div>
  );
}

export default function CrossBoardAnalyticsPage() {
  const [data, setData] = useState<CrossBoardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { getCrossBoardAnalytics } = await import('@/lib/actions/boards');
      const result = await getCrossBoardAnalytics();
      if (result.data) setData(result.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!data || data.total_boards === 0) {
    return (
      <div className="space-y-6">
        <Link href="/analytics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No boards to analyze</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create boards first to see cross-board analytics.</p>
          <Link href="/boards" className="mt-4 inline-flex items-center gap-1 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900 transition-colors">
            Manage Boards
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const actionItemsData = data.boards.map(b => ({
    name: b.name.length > 15 ? b.name.slice(0, 15) + '...' : b.name,
    overdue: b.overdue_action_items,
    pending: b.pending_action_items,
    completed: b.completed_action_items,
  }));

  const healthData = data.boards.map(b => ({
    name: b.name.length > 15 ? b.name.slice(0, 15) + '...' : b.name,
    score: b.meeting_frequency_score,
    fullName: b.name,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <Section index={0}>
        <Link href="/analytics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Cross-Board Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Unified view across {data.total_boards} board{data.total_boards !== 1 ? 's' : ''}
          </p>
        </div>
      </Section>

      {/* Summary Stats */}
      <Section index={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Boards"
            value={data.total_boards}
            icon={Building2}
            index={0}
          />
          <StatCard
            label="Total Meetings"
            value={data.total_meetings}
            icon={Calendar}
            index={1}
          />
          <StatCard
            label="Pending Actions"
            value={data.total_pending_actions}
            icon={CheckSquare}
            description={`${data.total_overdue_actions} overdue`}
            trend={data.total_overdue_actions > 0 ? { value: data.total_overdue_actions, isPositive: false } : undefined}
            index={2}
          />
          <StatCard
            label="Overdue Items"
            value={data.total_overdue_actions}
            icon={AlertTriangle}
            index={3}
          />
        </div>
      </Section>

      {/* Unified Calendar */}
      <Section index={2}>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-navy-600 dark:text-navy-300" />
            <h2 className="text-sm font-semibold text-foreground">Upcoming Meetings</h2>
          </div>
          {data.upcoming_meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No upcoming meetings across any board.</p>
          ) : (
            <div className="space-y-2">
              {data.upcoming_meetings.map(meeting => (
                <div
                  key={meeting.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-100 dark:bg-navy-800">
                    <span className="text-xs font-bold text-navy-800 dark:text-navy-200">
                      {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                    <span className="text-[10px] uppercase text-navy-600 dark:text-navy-400">
                      {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(meeting.scheduled_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-navy-100 dark:bg-navy-800 px-2.5 py-0.5 text-xs font-medium text-navy-700 dark:text-navy-300">
                    {meeting.board_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Action Items Rollup */}
      <Section index={3}>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="h-5 w-5 text-navy-600 dark:text-navy-300" />
            <h2 className="text-sm font-semibold text-foreground">Action Items by Board</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Overdue, pending, and completed items across boards</p>

          {actionItemsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={actionItemsData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={40} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[2, 2, 0, 0]} maxBarSize={40} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No action items data available.</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { color: '#ef4444', label: 'Overdue' },
              { color: '#f59e0b', label: 'Pending' },
              { color: '#22c55e', label: 'Completed' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Board Health Scores */}
      <Section index={4}>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-navy-600 dark:text-navy-300" />
            <h2 className="text-sm font-semibold text-foreground">Board Health Scores</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Based on meeting frequency, quorum achievement, and compliance</p>

          {healthData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={healthData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                          <p className="font-medium text-foreground">{d?.fullName}</p>
                          <p className="text-muted-foreground">Score: {d?.score}%</p>
                          <p style={{ color: getHealthColor(d?.score ?? 0) }} className="font-medium text-xs mt-0.5">
                            {getHealthLabel(d?.score ?? 0)}
                          </p>
                        </div>
                      );
                    }}
                    cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getHealthColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Health summary cards */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.boards.map(board => {
                  const score = board.meeting_frequency_score;
                  return (
                    <Link
                      key={board.id}
                      href={`/boards/${board.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: getHealthColor(score) }}
                      >
                        {score}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{board.name}</p>
                        <p className="text-xs text-muted-foreground">{getHealthLabel(score)}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <p>{board.total_meetings} meetings</p>
                        <p>{board.pending_action_items} pending</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No health data available.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
