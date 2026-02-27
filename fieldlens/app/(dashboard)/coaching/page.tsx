import { HardHat, Plus, Clock, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchSessions } from '@/lib/actions/coaching';
import { getTradeLabel, getSessionStatusLabel, getDuration, formatRelativeTime } from '@/lib/utils';

export default async function CoachingPage() {
  const sessionsResult = await fetchSessions();
  const sessions = sessionsResult.success ? sessionsResult.data : [];

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const recentSessions = sessions.filter((s) => s.status !== 'active').slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Coaching</h1>
          <p className="text-sm text-text-secondary mt-1">Start or continue a coaching session</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-safety-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-safety-600 transition-colors">
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card padding="lg" className="border-safety-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
              <CardTitle>Active Session</CardTitle>
            </div>
          </CardHeader>
          {activeSessions.map((session) => (
            <div key={session.id} className="space-y-2">
              <p className="text-sm font-medium text-text-primary">{session.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <HardHat className="h-3.5 w-3.5" />
                  {getTradeLabel(session.trade)}
                </span>
                {session.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Started {formatRelativeTime(session.started_at)}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="bg-safety-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-safety-600 transition-colors">
                  Add Photo
                </button>
                <button className="bg-error-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-error-700 transition-colors">
                  End Session
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Recent Sessions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <HardHat className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No completed sessions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{session.description}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {getTradeLabel(session.trade)}
                    {session.duration_minutes != null && (
                      <span className="ml-2">{getDuration(session.duration_minutes)}</span>
                    )}
                    <span className="ml-2">{formatRelativeTime(session.created_at)}</span>
                  </p>
                </div>
                <Badge variant={session.status === 'completed' ? 'gray' : session.status === 'cancelled' ? 'red' : 'amber'}>
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
