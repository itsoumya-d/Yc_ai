import { Timer, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchCheckInConfig, fetchRecentCheckIns } from '@/lib/actions/checkin';
import { getCheckInStatusLabel, getFrequencyLabel, formatDate } from '@/lib/utils';

export default async function CheckInPage() {
  const [configResult, checkInsResult] = await Promise.all([
    fetchCheckInConfig(),
    fetchRecentCheckIns(),
  ]);

  const config = configResult.success ? configResult.data : null;
  const checkIns = checkInsResult.success ? checkInsResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Check-In</h1>
          <p className="text-sm text-text-secondary mt-1">Configure your dead man&apos;s switch and check-in schedule</p>
        </div>
      </div>

      {/* Configuration */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Check-In Configuration</CardTitle>
          <button className="text-sm text-sage-600 hover:text-sage-700 font-medium">
            {config ? 'Edit' : 'Set Up'}
          </button>
        </CardHeader>

        {config ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Frequency</p>
                <p className="text-sm font-medium text-text-primary mt-0.5">{getFrequencyLabel(config.frequency)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Preferred Time</p>
                <p className="text-sm font-medium text-text-primary mt-0.5">{config.preferred_time}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Grace Period</p>
                <p className="text-sm font-medium text-text-primary mt-0.5">{config.grace_period_hours} hours</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Max Missed</p>
                <p className="text-sm font-medium text-text-primary mt-0.5">{config.max_missed_before_escalation} before escalation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant={config.is_active ? 'green' : 'gray'}>
                {config.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Timer className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No check-in schedule configured</p>
            <p className="text-xs text-text-muted mt-1">
              Set up periodic check-ins to ensure your plans are activated when needed.
            </p>
          </div>
        )}
      </Card>

      {/* How It Works */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 text-xs font-semibold flex-shrink-0">1</div>
            <p>We send you a check-in notification at your preferred frequency.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 text-xs font-semibold flex-shrink-0">2</div>
            <p>You confirm you are okay by clicking a link or responding.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warmamber-100 text-warmamber-600 text-xs font-semibold flex-shrink-0">3</div>
            <p>If you miss check-ins, we send reminders during the grace period.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gentlered-100 text-gentlered-600 text-xs font-semibold flex-shrink-0">4</div>
            <p>After too many missed check-ins, your trusted contacts are notified and access is granted per your settings.</p>
          </div>
        </div>
      </Card>

      {/* Recent Check-Ins */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Check-Ins</CardTitle>
        </CardHeader>
        {checkIns.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No check-ins yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    Scheduled {formatDate(checkIn.scheduled_at)}
                  </p>
                  {checkIn.responded_at && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Responded {formatDate(checkIn.responded_at)}
                    </p>
                  )}
                </div>
                <Badge variant={
                  checkIn.status === 'confirmed' ? 'green' :
                  checkIn.status === 'missed' ? 'red' :
                  checkIn.status === 'escalated' ? 'red' : 'amber'
                }>
                  {getCheckInStatusLabel(checkIn.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
