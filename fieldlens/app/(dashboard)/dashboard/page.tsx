import {
  HardHat,
  Camera,
  TrendingUp,
  Flame,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, fetchRecentSessions } from '@/lib/actions/dashboard';
import { getTradeLabel, getSessionStatusLabel, getDuration, formatRelativeTime } from '@/lib/utils';

export default async function DashboardPage() {
  const [statsResult, sessionsResult] = await Promise.all([
    fetchDashboardStats(),
    fetchRecentSessions(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const sessions = sessionsResult.success ? sessionsResult.data : [];

  const statCards = [
    { label: 'Coaching Sessions', value: stats?.total_sessions ?? 0, icon: <HardHat className="h-5 w-5 text-safety-500" />, href: '/coaching' },
    { label: 'Photos Analyzed', value: stats?.total_photos ?? 0, icon: <Camera className="h-5 w-5 text-slate-500" />, href: '/photos' },
    { label: 'Skills Completed', value: stats?.skills_completed ?? 0, icon: <TrendingUp className="h-5 w-5 text-success-500" />, href: '/progress' },
    { label: 'Day Streak', value: stats?.streak_days ?? 0, icon: <Flame className="h-5 w-5 text-warning-500" />, href: '/progress' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Your trade coaching overview</p>
        </div>
        <Link
          href="/coaching"
          className="hidden sm:inline-flex items-center gap-2 bg-safety-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-safety-600 transition-colors"
        >
          <HardHat className="h-4 w-4" />
          Start Session
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <Link href="/coaching" className="text-sm text-safety-500 hover:text-safety-400 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <HardHat className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No coaching sessions yet</p>
            <Link href="/coaching" className="text-sm text-safety-500 hover:text-safety-400 mt-1 inline-block">
              Start your first session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {session.description}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {getTradeLabel(session.trade)}
                    {session.duration_minutes != null && (
                      <span className="ml-2">
                        <Clock className="h-3 w-3 inline mr-0.5" />
                        {getDuration(session.duration_minutes)}
                      </span>
                    )}
                    <span className="ml-2">{formatRelativeTime(session.created_at)}</span>
                  </p>
                </div>
                <Badge variant={session.status === 'active' ? 'green' : session.status === 'completed' ? 'gray' : 'amber'}>
                  {getSessionStatusLabel(session.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
