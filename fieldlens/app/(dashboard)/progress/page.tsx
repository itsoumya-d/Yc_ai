import { TrendingUp, Target, Flame, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchMilestones, fetchSkillProgress } from '@/lib/actions/progress';
import { getTradeLabel, getSkillLevelLabel, getCompletionPercent } from '@/lib/utils';

export default async function ProgressPage() {
  const [milestonesResult, progressResult] = await Promise.all([
    fetchMilestones(),
    fetchSkillProgress(),
  ]);

  const milestones = milestonesResult.success ? milestonesResult.data : [];
  const progress = progressResult.success ? progressResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Progress</h1>
        <p className="text-sm text-text-secondary mt-1">Track your skill development across trades</p>
      </div>

      {/* Skill Progress */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-safety-500" />
            <CardTitle>Skill Progress</CardTitle>
          </div>
        </CardHeader>
        {progress.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No skill milestones tracked yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.trade}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{getTradeLabel(item.trade)}</span>
                  <span className="text-xs text-text-muted">{item.completed}/{item.total} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-safety-500 rounded-full animate-progress-fill"
                    style={{ '--progress-width': `${item.percent}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Milestones */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning-500" />
            <CardTitle>Milestones</CardTitle>
          </div>
        </CardHeader>
        {milestones.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No milestones yet. Complete sessions to earn milestones.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    milestone.completed ? 'bg-success-500/10 text-success-500' : 'bg-surface-tertiary text-text-muted'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{milestone.skill}</p>
                    <p className="text-xs text-text-muted">
                      {getTradeLabel(milestone.trade)} &middot; {getSkillLevelLabel(milestone.skill_level)}
                    </p>
                  </div>
                </div>
                <Badge variant={milestone.completed ? 'green' : 'outline'}>
                  {milestone.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
